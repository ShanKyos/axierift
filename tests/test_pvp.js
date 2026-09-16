// ⚔ SÀN ĐẤU — hai người đánh nhau thật, và trận đấu KHÔNG được đụng vào nhân vật.
//
// Chủ dự án chốt: *"Dựng 1 map pvp và làm thử xem. Chỉ cần 2 người đánh nhau là được."*
//
// ⚠ MỆNH ĐỀ NẶNG NHẤT CỦA BÀI NÀY LÀ ⑤, KHÔNG PHẢI ①. "Đánh được nhau" thì nhìn một cái là
// biết; thứ KHÔNG nhìn ra được là chuyện thua một trận có làm mất tiến độ hay không. Máu trận
// là một túi RIÊNG, và cái duy nhất chứng minh được điều đó là đo `player.hp` của người vừa bị
// hạ — nó phải không suy suyển một điểm nào.
//
// Chạy độc lập:  node tests/test_pvp.js [cổng-game]
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
  // Đi vào sàn đấu bằng ĐÚNG đường người chơi đi: `travelTo('pvp','ardhaven')`, tức qua cổng.
  // Đặt thẳng `curMap = 'pvp'` thì bỏ qua `pvpGoc()` — chính thứ mệnh đề ② đo.
  const vao = (t, ten) => t.p.evaluate((ten) => {
    window.TEST_MODE = true; startGame('thieulam', null);
    player.name = ten; player.level = 60; player.lvPeak = 60;
    calcDerived(); player.hp = player.maxHp;
    // ⚠ Tắt phản đòn: nó ghi thẳng `m.hp` và đã làm đỏ oan một bài khác (xem CLAUDE.md luật 9).
    player.reflect = 0;
    travelTo('pvp', 'ardhaven');
    return { map: curMap, x: Math.round(player.x), y: Math.round(player.y),
             id: window.NET && window.NET.id, maxHp: Math.round(player.maxHp) };
  }, ten);

  const A = await moTrang(), B = await moTrang();

  // ── ① CỔNG VÀO CÓ THẬT, VÀ ĐI BỘ TỚI ĐƯỢC ────────────────────────────────────────────
  // Đo trên cây cổng, không đo bằng mắt: một map không có cổng nào trỏ tới là nội dung chết —
  // đúng cái lỗi mà cả đợt B1 (Bug Tribe Tunnels / Reptile Sunstone Flats / Dusk Marsh) sinh ra để vá.
  const r1 = await A.p.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    const vaoSan = GATES.filter(g => g.to === 'pvp');
    const raSan  = GATES.filter(g => g.map === 'pvp' && g.to);
    const md = MAPS.pvp;
    // cổng phải đứng được, và điểm tới cũng thế
    // Đứng được = trong đa giác sàn của map ấy (map không khai `diTrong` thì đi đâu cũng được).
    const trongSan = (m, x, y) => { const d = MAPS[m]; return !d || !d.diTrong || trongDaGiac(d.diTrong, x, y); };
    const dung = vaoSan.map(g => ({ cong: trongSan(g.map, g.x, g.y), ten: g.name, tu: g.map }));
    return { soVao: vaoSan.length, soRa: raSan.length, dung,
             coGoc: Array.isArray(md.goc) && md.goc.length >= 2,
             gocDungDuoc: (md.goc || []).map(q => trongSan('pvp', q.x, q.y)),
             raDungDuoc: raSan.map(g => trongSan('pvp', g.x, g.y)) };
  });
  console.log('1) cổng:', JSON.stringify(r1));
  if (!r1.soVao) fail('① không cổng nào dẫn vào sàn đấu — map là nội dung chết');
  if (!r1.soRa) fail('① sàn đấu không có cổng ra: vào rồi kẹt lại');
  if (r1.dung.some(d => !d.cong)) fail('① cổng vào sàn đấu đứng trong vật cản: ' + JSON.stringify(r1.dung));
  if (!r1.coGoc) fail('② `MAPS.pvp.goc` phải có ít nhất hai góc đứng');
  if (r1.gocDungDuoc.some(x => !x)) fail('② có góc đứng nằm ngoài sàn: ' + JSON.stringify(r1.gocDungDuoc));
  if (r1.raDungDuoc.some(x => !x)) fail('① cổng RA nằm ngoài sàn: đứng không tới được thì không ra được');
  if (!bad) console.log('   ✓ cổng vào/ra có thật, hai góc đứng đều đi được');

  // ── ② HAI NGƯỜI VÀO LÀ ĐỨNG HAI CHỖ KHÁC NHAU ────────────────────────────────────────
  // ⚠ ĐÂY LÀ MỆNH ĐỀ CHỐNG MỘT LỖI TỪNG LÀM MẤT MỘT VÒNG CHẨN ĐOÁN: mọi nhân vật vào một map
  // đều rơi vào ĐÚNG một `spawn`, nên hai người vừa vào là hai thân chồng khít lên nhau lệch
  // 0,0px — và người thử đọc ra là "mạng không chạy", không đọc ra "hai người đang trùng chỗ".
  const ra = await vao(A, 'Alpha'); await cho(350);
  const rb = await vao(B, 'Beta');
  await cho(1300);
  const lech = Math.hypot(ra.x - rb.x, ra.y - rb.y);
  console.log(`2) A=(${ra.x},${ra.y}) id${ra.id} · B=(${rb.x},${rb.y}) id${rb.id} · lệch ${lech.toFixed(0)}px`);
  if (ra.map !== 'pvp' || rb.map !== 'pvp') fail(`② không vào được sàn đấu: A=${ra.map} B=${rb.map}`);
  if (lech < 200) fail(`② hai người vào cùng sàn mà chỉ lệch ${lech.toFixed(0)}px — `
                     + `\`pvpGoc()\` không chia góc (xem MAPS.pvp.goc)`);
  else console.log(`   ✓ hai người rơi vào hai góc, cách nhau ${lech.toFixed(0)}px`);

  // tự kiểm cảnh dựng: hai bên phải NHÌN THẤY nhau, nếu không mọi mệnh đề sau đo vào hư không
  const nhin = t => t.p.evaluate(() => ({
    so: window.NETPLAYERS.length,
    ds: window.NETPLAYERS.map(n => ({ id: n._netId, ph: n.pvpHp, pm: n.pvpMax })),
    tran: window.pvpTranDoc(),
  }));
  const n1A = await nhin(A), n1B = await nhin(B);
  console.log('   A thấy:', JSON.stringify(n1A), '· B thấy:', JSON.stringify(n1B));
  if (n1A.so !== 1 || n1B.so !== 1){ console.log('FAIL cảnh dựng: hai bên chưa thấy nhau'); bad++; }

  // ── ③ MÁU TRẬN DỰNG NGAY LÚC VÀO, KHÔNG ĐỢI CÚ ĐÁNH ĐẦU ──────────────────────────────
  // Thiếu vế này thì `pvpMax = 0` lúc cú đầu bay tới, mà trần một cú tính theo `pvpMax` ⇒ trần
  // bằng 0 ⇒ cú đầu tiên kẹp xuống 1 sát thương. Và người vừa vào nhìn thanh máu của TRẬN
  // TRƯỚC cho tới lúc ăn đòn.
  console.log(`3) máu trận: A ${n1A.tran.hp}/${n1A.tran.max} (maxHp thật ${ra.maxHp}) · `
            + `B ${n1B.tran.hp}/${n1B.tran.max} (maxHp thật ${rb.maxHp})`);
  if (n1A.tran.max !== ra.maxHp || n1B.tran.max !== rb.maxHp)
    fail('③ máu trận không bốc từ `maxHp` THẬT — trang bị và cấp mất tác dụng trong sàn đấu');
  else if (n1A.tran.hp !== n1A.tran.max) fail('③ vào sàn mà máu trận không đầy');
  else console.log('   ✓ máu trận = maxHp thật, đầy ngay lúc vào');

  // ── ④ ĐÁNH ĐƯỢC NHAU, VÀ MÁU TRỪ Ở CẢ HAI BÊN CÙNG MỘT CON SỐ ────────────────────────
  // ⚠ Hỏi CẢ HAI phía. Máy chủ phát `pvp-mau` tới người bị đánh (ảnh chụp không bao giờ chở
  // chính mình) và `ph/pm` qua ảnh chụp tới người đánh — hai sợi dây khác nhau, và một sợi
  // hỏng thì đúng một bên nhìn thấy máu đứng im.
  const denGan = async () => {
    await A.p.evaluate(() => { player.x = 880; player.y = 700; });
    await B.p.evaluate(() => { player.x = 920; player.y = 700; });
    await cho(400);
  };
  await denGan();
  const motCu = async () => {
    await A.p.evaluate(() => { player.cd.basic = 0; doBasic(); for (let k = 0; k < 6; k++) update(0.03); });
    await cho(200);
  };
  await motCu(); await motCu(); await motCu();
  await cho(400);
  const n2A = await nhin(A), n2B = await nhin(B);
  const bTuA = n2A.ds[0] ? n2A.ds[0].ph : null;      // A nhìn máu trận của B
  const bTuB = n2B.tran.hp;                           // chính B đọc máu trận của mình
  console.log(`4) sau 3 cú — A thấy B ${bTuA}/${n1B.tran.max} · B tự thấy ${bTuB}/${n2B.tran.max}`);
  if (bTuB >= n1B.tran.max) fail('④ đánh 3 cú mà máu trận của B không giảm — sợi dây đứt ở đâu đó');
  else if (bTuA !== bTuB) fail(`④ hai bên đọc ra hai con số khác nhau (${bTuA} vs ${bTuB}) — `
                             + 'một trong hai sợi dây (`pvp-mau` / `ph` trong ảnh chụp) hỏng');
  else console.log(`   ✓ cả hai bên đọc cùng một con số, B mất ${n1B.tran.max - bTuB} máu trận`);

  // và A phải KHÔNG mất gì (đánh không phải bị đánh)
  if (n2A.tran.hp !== n2A.tran.max) fail('④ người ĐÁNH cũng mất máu trận — sát thương đi nhầm hướng');

  // ── ⑤ THUA MỘT TRẬN KHÔNG ĐƯỢC ĐỤNG VÀO NHÂN VẬT ─────────────────────────────────────
  // Mệnh đề quan trọng nhất của bài. `player.hp` nằm trên máy của người BỊ đánh và `onDeath()`
  // thì ném người ta về map an toàn — nếu trận đấu đi qua `player.hp` thì thua một trận là mất
  // tiến độ, và không ai phát hiện ra cho tới khi có người mất thật.
  const truocB = await B.p.evaluate(() => ({ hp: Math.round(player.hp), maxHp: Math.round(player.maxHp),
                                             map: curMap, dead, level: player.level, xp: player.xp }));
  let cu = 0, haDuoc = false;
  for (let i = 0; i < 220 && !haDuoc; i++){
    await A.p.evaluate(() => { player.cd.basic = 0; doBasic(); for (let k = 0; k < 6; k++) update(0.03); });
    cu++;
    await cho(135);
    haDuoc = await B.p.evaluate(() => window.pvpTranDoc().chet);
  }
  const sauB = await B.p.evaluate(() => ({ hp: Math.round(player.hp), maxHp: Math.round(player.maxHp),
                                           map: curMap, dead, level: player.level, xp: player.xp,
                                           tran: window.pvpTranDoc(),
                                           banner: zoneBanner && zoneBanner.text }));
  const bannerA = await A.p.evaluate(() => zoneBanner && zoneBanner.text);
  console.log(`5) hạ sau ${cu} cú · B trước ${JSON.stringify(truocB)} · sau ${JSON.stringify(sauB)}`);
  console.log(`   banner: A "${bannerA}" · B "${sauB.banner}"`);
  if (!haDuoc) fail(`⑤ đánh ${cu} cú vẫn không hạ được — trận không bao giờ kết thúc`);
  if (sauB.hp !== truocB.hp) fail(`⑤ THUA TRẬN LÀM MẤT MÁU THẬT (${truocB.hp} → ${sauB.hp}) — `
                               + 'máu trận phải là một túi RIÊNG, xem chú thích ở `PVP_HE`');
  if (sauB.dead) fail('⑤ thua trận mà `dead` bật — `onDeath()` chạy, tức là mất tiến độ');
  if (sauB.map !== 'pvp') fail(`⑤ thua trận mà bị ném khỏi sàn (map=${sauB.map})`);
  if (sauB.level !== truocB.level || sauB.xp !== truocB.xp) fail('⑤ thua trận làm đổi cấp/kinh nghiệm');
  if (bannerA !== '⚔ THẮNG') fail(`⑤ người thắng không thấy biểu ngữ thắng (thấy "${bannerA}")`);
  if (sauB.banner !== '☠ BỊ HẠ') fail(`⑤ người thua không thấy biểu ngữ thua (thấy "${sauB.banner}")`);
  if (!bad) console.log('   ✓ hạ được, hai biểu ngữ đúng phía, và nhân vật của người thua KHÔNG suy suyển');

  // ── ⑥ MÁY CHỦ KẸP MỘT CÚ, KHÔNG TIN CON SỐ CLIENT GỬI ────────────────────────────────
  // ⚠ Đây KHÔNG phải chống gian lận và bài kiểm không được giả vờ là thế — máy chủ không biết
  // `atk` của ai. Thứ nó mua được: không một phát chết. Bắn thẳng một con số khổng lồ qua
  // `netPvpDanh` (bỏ qua cả `doBasic`) rồi đòi máu trận chỉ tụt đúng phần trần.
  await cho(6800);   // đợi máy chủ dựng lại trận
  const hoi = await B.p.evaluate(() => window.pvpTranDoc());
  console.log('6) sau khi dựng lại trận, B:', JSON.stringify(hoi));
  if (hoi.chet || hoi.hp !== hoi.max) fail('⑥ máy chủ không dựng lại trận sau khi có người bị hạ');
  const idB = rb.id;
  await A.p.evaluate((id) => window.netPvpDanh(id, 1e9), idB);
  await cho(500);
  const sauGianLan = await B.p.evaluate(() => window.pvpTranDoc());
  const matPhan = (hoi.hp - sauGianLan.hp) / hoi.max;
  console.log(`   bắn 1e9 sát thương ⇒ mất ${(matPhan * 100).toFixed(1)}% máu trận`);
  if (sauGianLan.hp <= 0) fail('⑥ một gói tin là hạ được một người — trần một cú không chạy');
  else if (matPhan > 0.10) fail(`⑥ trần một cú quá rộng: ${(matPhan * 100).toFixed(1)}% máu trận`);
  else console.log('   ✓ trần một cú giữ được: một gói tin không hạ nổi ai');

  // ── ⑦ ĐỨNG NGOÀI SÀN THÌ KHÔNG ĐÁNH ĐƯỢC AI TRONG SÀN ────────────────────────────────
  // Chốt khoảng cách + chốt map của máy chủ là hai hàng rào THẬT (máy chủ giữ cả hai toạ độ).
  // Không có chúng thì ai cũng đứng trong thành mà bắn người đang đấu.
  const truocXa = (await B.p.evaluate(() => window.pvpTranDoc())).hp;
  await A.p.evaluate(() => { travelTo('ardhaven', 'pvp'); });
  await cho(900);
  await A.p.evaluate((id) => window.netPvpDanh(id, 500), idB);
  await cho(600);
  const sauXa = (await B.p.evaluate(() => window.pvpTranDoc())).hp;
  console.log(`7) A rời sàn rồi bắn: B ${truocXa} → ${sauXa}`);
  if (sauXa !== truocXa) fail('⑦ người ĐÃ RỜI SÀN vẫn đánh được người trong sàn');
  else console.log('   ✓ rời sàn là hết đánh được');
  // và A rời sàn thì máu trận của chính A phải bị quên
  const tranA = await A.p.evaluate(() => window.pvpTranDoc());
  if (tranA.max !== 0) fail(`⑦ rời sàn mà máu trận còn nguyên (${JSON.stringify(tranA)}) — `
                          + 'lần vào sau sẽ thấy thanh máu của trận cũ');
  else console.log('   ✓ rời sàn là quên máu trận');

  // ── ⑧ NGOÀI SÀN ĐẤU, ĐÒN THƯỜNG KHÔNG ĐƯỢC NHẮM VÀO NGƯỜI ────────────────────────────
  // ⚠ `pvpDangO()` khoá theo ĐÚNG MỘT khoá map. Bỏ khoá ấy ra là mọi bản đồ thành free-PK, và
  // 12 map kia không hề đồng ý chuyện đó. Đo bằng cách cho hai người đứng sát nhau ở một map
  // THƯỜNG rồi hỏi `nearestNguoi` có được gọi tới không.
  await B.p.evaluate(() => { travelTo('ardhaven', 'pvp'); });
  await cho(900);
  await A.p.evaluate(() => { player.x = 3200; player.y = 1900; });
  await B.p.evaluate(() => { player.x = 3230; player.y = 1900; });
  await cho(500);
  const r8 = await A.p.evaluate(() => {
    player.cd.basic = 0; doBasic();
    return { map: curMap, dangO: pvpDangO(), thay: window.NETPLAYERS.length,
             hen: player.pendingHit ? (player.pendingHit.nguoi || null) : null };
  });
  console.log('8) ở ardhaven:', JSON.stringify(r8));
  if (r8.thay < 1){ console.log('FAIL cảnh dựng ⑧: A không thấy B ở ardhaven nên mệnh đề đo vào hư không'); bad++; }
  else if (r8.dangO) fail('⑧ `pvpDangO()` bật ở ngoài sàn đấu');
  else if (r8.hen) fail('⑧ ở map thường mà đòn thường vẫn hẹn đánh NGƯỜI — cả 12 map kia thành free-PK');
  else console.log('   ✓ ngoài sàn đấu, đòn thường không nhắm vào người');

  if (errs.length){ console.log('lỗi trang:', errs.slice(0, 5)); fail('có lỗi JS trên trang'); }
  await b.close(); may.kill('SIGTERM');
  console.log(bad ? `FAIL(${bad})` : 'PASS — sàn đấu chạy: hai người đánh nhau, và thua không mất gì');
  process.exit(bad ? 1 : 0);
})();
