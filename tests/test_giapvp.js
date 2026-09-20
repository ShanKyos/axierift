// HAI CHỐT TRƯỚC PVP — tên không mạo danh được, gói `pos` không bắn dồn được, và thân người từ
// xa PHẢI giật khi trúng đòn rồi nằm xuống khi chết.
//
// Vì sao gộp một bài: cả ba đều là tiền đề của PvP và cả ba đều sống ở cùng một sợi dây
// (client → bongnguoi.js → client). Tách ra ba bài là dựng ba lần cùng một cảnh hai trình duyệt.
//
// ⚠ HAI CHỐT ĐẦU KHÔNG PHẢI XÁC THỰC, và bài kiểm này không được giả vờ là thế. Không có tài
// khoản thì không cách nào biết ai thật sự là ai; thứ chúng mua được là: không mạo danh được
// người ĐANG CÓ MẶT, và không ai ăn hết CPU của phòng bằng một vòng lặp.
//
// Chạy độc lập:  node tests/test_giapvp.js [cổng-game]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const net = require('net');

const CONG_GAME = process.argv[2] || '8853';
const GOC = 'http://localhost:' + CONG_GAME + '/index.html';
const REPO = process.env.AXIE_REPO || path.resolve(__dirname, '..');

function congTrong(){
  return new Promise(res => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); });
  });
}
const cho = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  let bad = 0; const fail = m => { console.log('FAIL', m); bad++; };
  const errs = [];

  const CONG_WS = await congTrong();
  const may = spawn(process.execPath, [path.join(REPO, 'server', 'bongnguoi.js')],
                    { env: { ...process.env, PORT: String(CONG_WS) }, stdio: ['ignore', 'pipe', 'pipe'] });
  const mayLog = [];
  may.stdout.on('data', d => mayLog.push(String(d)));
  may.stderr.on('data', d => mayLog.push('ERR ' + String(d)));
  process.on('exit', () => { try { may.kill('SIGTERM'); } catch {} });
  await cho(1200);
  if (may.exitCode !== null){ console.log('máy chủ chết ngay:', mayLog.join('')); console.log('FAIL(1)'); process.exit(1); }

  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const moTrang = async () => {
    const ctx = await b.newContext({ viewport: { width: 1100, height: 760 } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(String(e)));
    p.on('console', m => { if (m.type() === 'error' && !/404|ERR_CONNECTION|ERR_CERT/.test(m.text())) errs.push(m.text()); });
    await p.goto(GOC + '?net=ws://localhost:' + CONG_WS + '/ws');
    await p.waitForFunction(() => window.__gameReady).catch(() => {});
    await cho(600);
    return { ctx, p };
  };
  const dung = async (t, x, ten) => t.p.evaluate(({ x, ten }) => {
    window.TEST_MODE = true; startGame('thieulam', null);
    travelTo('daohoa'); player.name = ten; player.x = x; player.y = 1500;
    calcDerived(); player.hp = player.maxHp;
  }, { x, ten });

  const A = await moTrang(), B = await moTrang();
  await dung(A, 1300, 'NguoiA');
  await dung(B, 1380, 'NguoiB');
  await cho(1500);

  // ── 1. ĐỔI TÊN GIỮA PHIÊN KHÔNG ĐƯỢC ĂN ──────────────────────────────────────────────
  // Bản cũ nhận `name` ở MỌI gói `pos`. Từ lúc có chat thì đó là mạo danh: đổi tên mình thành
  // tên người khác rồi nói thay họ, và người bị mạo danh không có cách nào biết.
  const truoc = await A.p.evaluate(() => window.NETPLAYERS.map(n => n.name));
  await B.p.evaluate(() => { player.name = 'NguoiA'; });     // B thử mạo danh A
  await cho(1200);
  const sau = await A.p.evaluate(() => window.NETPLAYERS.map(n => n.name));
  console.log('1 · A thấy:', JSON.stringify(truoc), '→', JSON.stringify(sau));
  if (truoc[0] !== 'NguoiB') fail(`cảnh dựng hỏng: A phải thấy "NguoiB" trước đã, đang thấy "${truoc[0]}"`);
  else if (sau[0] === 'NguoiA') fail('B đổi tên giữa phiên thành "NguoiA" và máy chủ CHO — mạo danh được');
  else if (sau[0] !== 'NguoiB') fail(`tên của B hoá thành "${sau[0]}" — không phải mạo danh, nhưng cũng không đúng`);

  // ── 2. TRÙNG TÊN NGƯỜI ĐANG ONLINE thì phải ĐỔI, không phải đá ra ───────────────────
  // Hai người cùng đặt "Kiếm Khách" là chuyện thường; đá người thứ hai ra là phạt nhầm người.
  const C = await moTrang();
  await dung(C, 1460, 'NguoiB');          // C xin đúng tên B đang dùng
  await cho(1500);
  const ba = await A.p.evaluate(() => window.NETPLAYERS.map(n => n.name).sort());
  console.log('2 · ba người, A thấy:', JSON.stringify(ba));
  if (ba.length !== 2) fail(`A phải thấy 2 người, thấy ${ba.length} — người trùng tên bị đá ra?`);
  else if (ba[0] === ba[1]) fail(`hai người cùng mang tên "${ba[0]}" — không phân biệt được ai với ai`);

  // ── 3. TRÚNG ĐÒN: thân người từ xa phải GIẬT ─────────────────────────────────────────
  // Đo bằng `hurtT` chứ không đo điểm ảnh: sàn nhiễu của một thân người đang động lớn hơn thứ
  // cần đo (xem CLAUDE.md, mục Giai đoạn 2).
  await C.ctx.close(); await cho(900);
  // ⚠ DỌN QUÁI QUANH B VÀ CHO NÓ BẤT TỬ TRƯỚC KHI ĐO. `daohoa` là map đánh nhau thật: B đứng
  // giữa bãi nên quái đánh nó suốt, và ba mục dưới đây đo đúng những thứ quái cũng gây ra —
  // `_hitSeq` bật lên vì một cú cào chứ không vì dòng mà bài kiểm vừa chạy, và `deadT` đọc ra
  // 2,37s trong khi bài mới vừa giết B 0,7s trước (tức B đã chết từ trước vì quái). Cả hai đều
  // KHÔNG làm mục nào đỏ, chúng chỉ làm số đo vô nghĩa — kiểu hỏng khó thấy nhất.
  await B.p.evaluate(() => {
    for (const m of mobs){ m.x = player.x + 6000; m.y = player.y + 6000; m.zone = null; m.atkT = 99; }
    // ⚠ ĐỪNG THỔI `maxHp` LÊN ĐỂ LÀM BẤT TỬ. Đã thử 1e9 và nó phá mục ④: hồi máu tính theo phần
    // trăm máu trần nên mỗi nhịp kéo lại hàng trăm nghìn máu, B không chết nổi và A đọc ra
    // "hp 840000" ngay sau lệnh giết. Dời quái đi là đủ, và nó không đụng vào cơ chế nào.
    // ⚠ TRẢ CẢ CỜ CHẾT, KHÔNG CHỈ TRẢ MÁU. B đứng giữa bãi quái suốt §1–§2 nên nó có thể đã
    // chết ở đó; đổ máu đầy lại mà để `dead` bật thì B "sống" nhưng vẫn khai là chết suốt phần
    // còn lại, và `deadT` đã chạy 4,5s trước khi mục ④ kịp giết nó. Chốt tự kiểm của ④ bắt được.
    player.hp = player.maxHp; player.hurtT = 0; dead = false; player.deadT = 0;
  });
  await cho(900);
  const hsTruoc = await A.p.evaluate(() => { const n = window.NETPLAYERS[0]; return n ? (n.hurtT || 0) : null; });
  const daDanh = await B.p.evaluate(() => {
    const t = player._hitSeq || 0;
    player.hp -= 1; player.hurtT = 0.25; player._hitSeq = t + 1;   // đúng ba dòng mà game ghi
    return { truoc: t, sau: player._hitSeq };
  });
  // ⚠ ĐỪNG LẤY MẪU Ở MỘT MỐC CỐ ĐỊNH. Cú giật dài 0,30s, ảnh chụp 10 Hz, và độ trễ của nó thay
  // đổi theo từng lượt — nên MỌI mốc đều là cá cược: đo được 0,017 ở mốc 300ms và ĐÚNG 0 ở mốc
  // 150ms, cùng một mã chạy tốt. Theo dõi liên tục rồi lấy ĐỈNH thì không còn khe nào để trượt.
  const hsSau = await A.p.evaluate(async () => {
    let dinh = 0;
    for (let i = 0; i < 30; i++){
      const n = window.NETPLAYERS[0];
      if (n) dinh = Math.max(dinh, n.hurtT || 0);
      await new Promise(r => setTimeout(r, 40));
    }
    return +dinh.toFixed(3);
  });
  console.log('3 · B trúng đòn:', JSON.stringify(daDanh), '· A thấy hurtT đỉnh', hsTruoc, '→', hsSau);
  if (hsTruoc !== 0) fail(`cảnh dựng hỏng: trước khi đánh, hurtT của B đọc ra ${hsTruoc}, cần 0`);
  if (!(hsSau > 0)) fail('B vừa trúng đòn mà A không thấy cú giật nào — chưa qua được dây');
  await cho(800);
  const hsTat = await A.p.evaluate(() => { const n = window.NETPLAYERS[0]; return n ? +(n.hurtT || 0).toFixed(3) : null; });
  if (hsTat !== 0) fail(`cú giật không tắt (còn ${hsTat}s) — thân người từ xa kẹt ở khung giật`);

  // ── 4. CHẾT: phải NẰM XUỐNG, và khối chết phải CHẠY ─────────────────────────────────
  // `drawPlayer` suy "chết chưa" từ MÁU nên chuyện chết đã qua dây từ trước — nhưng khung hình
  // của khối chết đọc `deadT`, mà không ai cộng nó ở phía nhận. Hệ quả: đứng hình ở khung ĐẦU
  // của cú ngã, vĩnh viễn, và nhìn ra là "hình như lag".
  await B.p.evaluate(() => { player.hp = 0; });
  await cho(700);
  // ⚠ DỰNG LẠI ĐÚNG TRẠNG THÁI ĐÃ ĐO ĐƯỢC, đừng trông vào may rủi. Người chết thật gửi đi
  // `{hp: 0,565 · dead: true}` — hồi máu kịp chạy một nhịp trước khi cờ chết chặn được. Máu ấy
  // làm tròn thành 1 hay 0 là tuỳ lượt (đo được cả 0,57→1 lẫn 0,19→0), nên lỗi "suy chết từ máu"
  // cũng chỉ hiện ra tuỳ lượt. Ghim máu ở 0,6 thì nó hiện ra MỌI lượt.
  await B.p.evaluate(() => { player.hp = 0.6; });
  // ⚠ CHỜ B CHẾT THẬT, ĐỪNG CHỜ 400ms. `dead` bật trong vòng `update()`, mà dưới tải — 227 bài
  // hồi quy nối đuôi trên máy không GPU — một nhịp khung có thể dài hơn thế nhiều. Bài vì vậy
  // ĐỎ THEO TẢI chứ không theo lỗi, và nó đỏ ở đúng mệnh đề TỰ KIỂM CẢNH DỰNG, tức báo "cảnh
  // hỏng" trong khi cơ chế chạy hoàn hảo (chạy riêng: xanh). Cùng bẫy đã gỡ ở `test_chaos`.
  await B.p.waitForFunction(() => window.dead === true || (typeof dead !== 'undefined' && dead),
                            null, { timeout: 8000 }).catch(() => {});
  const tuKhai = await B.p.evaluate(() => ({ hp: +player.hp.toFixed(2), dead, map: curMap }));
  // ⚠ HỎI CẢ SỢI DÂY LẪN CHỖ TIÊU THỤ. Bản đầu của mục này chỉ hỏi `n.chet` (thứ đến từ dây), và
  // phép thử ngược cho thấy nó KHÔNG ĐỎ khi tôi trả `drawPlayer` về kiểu suy-chết-từ-máu: dây
  // vẫn chở cờ đúng, chỉ có chỗ ĐỌC nó là sai, và thân người từ xa được vẽ như còn sống.
  // `drawPlayer` phơi quyết định ra `__veChet` (chỉ khi TEST_MODE) — hỏi thẳng chỗ đó.
  const chet1 = await A.p.evaluate(() => {
    const n = window.NETPLAYERS[0];
    if (!n) return null;
    window.__veChet = {}; render();
    const v = window.__veChet[veKhoa(n)] || {};
    return { chet: !!n.chet, veChet: !!v.chet, hp: n.hp, deadT: +(n.deadT || 0).toFixed(2) };
  });
  await cho(600);
  const chet2 = await A.p.evaluate(() => { const n = window.NETPLAYERS[0]; return n ? +(n.deadT || 0).toFixed(2) : null; });
  console.log('4 · B tự khai', JSON.stringify(tuKhai), '· A thấy', JSON.stringify(chet1), '· 0,6s sau deadT =', chet2);
  // ⚠ TỰ KIỂM CẢNH DỰNG TRƯỚC. Nếu B chưa thật sự chết thì mọi khẳng định dưới đây vô nghĩa.
  if (!tuKhai.dead) fail('cảnh dựng hỏng: đặt hp = 0 mà B chưa chết');
  // ⚠ VÀ ĐỪNG HỎI MÁU. Hồi máu kịp chạy một nhịp giữa lúc máu về 0 và lúc cờ `dead` bật, nên
  // người đã nằm xuống vẫn gửi `hp = 0,565` — máy chủ làm tròn thành 1, và "suy chết từ máu"
  // đọc ra "còn sống". Đo được đúng thế, 2/3 lượt. Nay cờ chết đi RIÊNG trên dây.
  else if (!chet1 || !chet1.chet) fail(`B đã chết (hp ${tuKhai.hp}) mà A không nhận được cờ chết — `
                                     + `A thấy chet=${chet1 && chet1.chet}, hp=${chet1 && chet1.hp}`);
  else if (!chet1.veChet) fail(`dây chở đúng cờ chết nhưng drawPlayer vẽ B như CÒN SỐNG `
                             + `(hp làm tròn = ${chet1.hp}) — chỗ đọc cờ vẫn đang suy từ máu`);
  else if (!(chet1.deadT > 0)) fail('A thấy B chết nhưng deadT đứng 0 — khối chết kẹt ở khung đầu');
  // Tự kiểm cảnh dựng: deadT phải bắt đầu đếm TỪ LÚC NÀY. Lớn hơn hẳn quãng vừa chờ nghĩa là nó
  // đã chạy từ trước — tức B chết vì lý do khác và phép đo không nói gì về thứ nó định gác.
  else if (chet1.deadT > 2.2) fail(`deadT đã là ${chet1.deadT}s ngay sau ~1,1s — B chết từ trước, cảnh dựng chưa sạch`);
  else if (!(chet2 > chet1.deadT)) fail(`deadT không chạy tiếp (${chet1.deadT} → ${chet2}) — cú ngã đứng hình`);

  // ── 5. HỒI SINH thì phải ĐỨNG DẬY ────────────────────────────────────────────────────
  await B.p.evaluate(() => { player.hp = player.maxHp; dead = false; player.deadT = 0; });
  await cho(900);
  const song = await A.p.evaluate(() => { const n = window.NETPLAYERS[0]; return n ? { chet: !!n.chet, hp: n.hp, deadT: +(n.deadT || 0).toFixed(2) } : null; });
  console.log('5 · B hồi sinh — A thấy', JSON.stringify(song));
  if (song && song.chet) fail('B sống lại mà A vẫn thấy cờ chết');
  if (song && song.deadT !== 0) fail(`B sống lại mà deadT còn ${song.deadT} — giữ khung cuối của cú ngã`);

  // ── 6. BẮN DỒN `pos` PHẢI BỊ CHẶN, và người chơi tử tế thì KHÔNG ────────────────────
  // Đo bằng `/health`: `soTick` là nhịp phát ảnh chụp nên nó không nói gì; thứ nói được là kết
  // nối của kẻ bắn dồn có bị đóng không, trong khi A vẫn nguyên.
  const spam = await B.p.evaluate(async () => {
    const ws = window.NET.ws;
    if (!ws || ws.readyState !== 1) return { loi: 'B chưa nối' };
    const goi = JSON.stringify({ t: 'pos', map: curMap, x: player.x, y: player.y, name: 'X' });
    for (let i = 0; i < 4000; i++) ws.send(goi);
    await new Promise(r => setTimeout(r, 1200));
    return { trangThai: ws.readyState };     // 1 = còn mở, 3 = đã đóng
  });
  const heal = await fetch('http://localhost:' + CONG_WS + '/health').then(r => r.json());
  console.log('6 · sau 4000 gói:', JSON.stringify(spam), '· /health:', JSON.stringify({ nguoi: heal.nguoi }));
  if (spam.loi) fail(spam.loi);
  else if (spam.trangThai === 1) fail('bắn 4000 gói `pos` liên tiếp mà kết nối vẫn mở — không có giới hạn nhịp nào');
  const conA = await A.p.evaluate(() => window.NET.tinhTrang);
  if (conA !== 'da-noi') fail(`kẻ bắn dồn bị đá nhưng A cũng rớt theo ("${conA}") — phạt nhầm người`);

  await A.ctx.close(); await B.ctx.close();
  await b.close();
  try { may.kill('SIGTERM'); } catch {}

  console.log('errors:', JSON.stringify(errs));
  console.log(bad === 0 && errs.length === 0 ? 'PASS' : 'FAIL(' + bad + ')');
  process.exit(bad === 0 && errs.length === 0 ? 0 : 1);
})();
