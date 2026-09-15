// ĐỒNG BỘ TRANG BỊ · CÁNH · HÀNH ĐỘNG RA ĐÒN — Giai đoạn 2 online.
//
// Giai đoạn 1 chứng minh "hai người nhìn thấy nhau CHẠY". Nó dừng đúng ở đó: mọi thân người từ
// xa dựng bằng `equip: {}`, nên ai cũng cởi trần, không cánh, và đứng như tượng trong lúc đánh
// nhau. Bài này gác nửa còn lại.
//
// ⚠ NÓ CHẤM BẰNG HÀNH VI, KHÔNG BẰNG ĐỐI CHIẾU TÊN TRƯỜNG. Một `np.equip` đầy đủ mà `drawPlayer`
// vẫn vẽ ra thân trần thì mọi khẳng định "đã đồng bộ" đều xanh trong khi màn hình không đổi một
// điểm ảnh. Mục ② dựng lại cùng một khung hai lần — có đồ và không đồ — rồi đếm điểm ảnh.
//
// Chạy độc lập:  node tests/test_dongbodo.js [cổng-game]
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
  const dongMay = () => { try { may.kill('SIGTERM'); } catch {} };
  process.on('exit', dongMay);

  await cho(1200);
  if (may.exitCode !== null) {
    console.log('máy chủ chết ngay:', mayLog.join(''));
    console.log('FAIL(1)'); process.exit(1);
  }

  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const moTrang = async () => {
    const ctx = await b.newContext({ viewport: { width: 1100, height: 760 } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(String(e)));
    p.on('console', m => {
      if (m.type() === 'error' && !/404|ERR_CONNECTION|ERR_CERT/.test(m.text())) errs.push(m.text());
    });
    await p.goto(GOC + '?net=ws://localhost:' + CONG_WS + '/ws');
    await p.waitForFunction(() => window.__gameReady).catch(() => {});
    await cho(600);
    return { ctx, p };
  };

  const A = await moTrang();   // Dark Knight
  const B = await moTrang();   // Dark Wizard — khác lớp CÓ CHỦ Ý, xem mục ④

  // ⚠ Đếm số lần trang bị thật sự tới nơi. Mục ⑤ đo bằng con số này, nên phải bọc TRƯỚC khi
  // hai bên nhìn thấy nhau — bọc sau là bỏ sót đúng gói đầu tiên, gói duy nhất chắc chắn có.
  await A.p.evaluate(() => {
    window.__soLanDo = 0;
    const goc = window.netApTrangBi;
    window.netApTrangBi = function(t, g){ window.__soLanDo++; return goc(t, g); };
  });

  const dung = async (t, sect, x, ten) => t.p.evaluate(({ sect, x, ten }) => {
    window.TEST_MODE = true; startGame(sect, null);
    travelTo('daohoa');
    player.name = ten; player.x = x; player.y = 1500;
    calcDerived(); player.hp = player.maxHp;
  }, { sect, x, ten });

  await dung(A, 'thieulam', 1300, 'NguoiA');
  await dung(B, 'baidasan', 1380, 'NguoiB');
  await cho(1200);

  // ── 0. TỰ KIỂM CẢNH DỰNG ──────────────────────────────────────────────────────────────
  // Nếu B chưa mặc gì thì mọi mục dưới đây đều xanh mà chẳng kiểm được gì. Đây là cái bẫy đã
  // ghi trong CLAUDE.md nhiều lần: một mệnh đề đúng ở mọi trạng thái là một mệnh đề không gác.
  const coDo = await B.p.evaluate(() => {
    applyTestBoost(); calcDerived();
    const g = window.netTrangBi();
    return { soO: Object.keys(g).filter(k => k !== 'av').length, canh: g.canh, byte: JSON.stringify(g).length,
             lop: player.sect };
  });
  console.log('0 · B mặc:', JSON.stringify(coDo));
  if (coDo.soO < 5) fail(`B chỉ mặc ${coDo.soO} ô — bốn ô giáp + vũ khí + cánh mới đủ để mục ② có gì mà đo`);
  if (!coDo.canh) fail('B không đeo cánh — mục ④ sẽ xanh mà không kiểm gì');
  if (coDo.byte > 600) fail(`mô tả trang bị nặng ${coDo.byte} byte — đã to hơn hẳn ý định "chữ ký", `
                          + 'kiểm lại xem có trường nào của món đồ thật lọt vào không');

  await cho(1200);   // vài nhịp ảnh chụp để bộ đồ đi qua dây

  // ── 1. A DỰNG LẠI ĐƯỢC BỘ ĐỒ CỦA B ────────────────────────────────────────────────────
  // Hỏi `gearVisual()` chứ không hỏi `np.equip`: đó là cửa mà cả tầng vẽ đi qua, nên nó trả lời
  // đúng câu hỏi "tầng vẽ có nhìn thấy bộ đồ này không".
  const thay = await A.p.evaluate(() => {
    const np = window.NETPLAYERS[0];
    if (!np) return null;
    const gv = gearVisual(np);
    return { ten: np.name, lop: np.sect, n: gv && gv.n, t: gv && +gv.t.toFixed(2),
             plus: gv && +gv.plus.toFixed(2), rarity: gv && gv.rarity,
             coCanh: !!(gv && gv.canh), bacCanh: gv && gv.canh && gv.canh.wingBac,
             vk: !!(gv && gv.wDef), bac: heroTier(np), ava: avatarId(np) };
  });
  console.log('1 · A thấy bộ đồ của B:', JSON.stringify(thay));
  if (!thay) fail('A không thấy B — kiểm lại Giai đoạn 1 trước khi đọc tiếp');
  else {
    if (thay.n !== 4) fail(`A thấy B mặc ${thay.n}/4 ô giáp`);
    if (!(thay.t > 1)) fail(`bậc giáp hiệu dụng của B đọc ra ${thay.t} — bộ đồ không qua được dây`);
    if (!(thay.plus > 5)) fail(`mức rèn của B đọc ra +${thay.plus}, B đang full +11`);
    if (thay.rarity !== 4) fail(`mức quý đọc ra ${thay.rarity}, B đang full Hoàn Hảo (cần 4)`);
    if (!thay.coCanh) fail('A không thấy đôi cánh của B');
    if (thay.bacCanh !== 3) fail(`bậc cánh đọc ra ${thay.bacCanh}, B đeo bậc 3`);
    if (!thay.vk) fail('A không thấy vũ khí của B');
    if (!thay.ava) fail('A không thấy con Axie của B — một người chơi là NHÂN VẬT + AXIE');
  }

  // ── 2. TẦNG HÀNH VI: bộ đồ phải ĐỔI ĐIỂM ẢNH trên màn của A ───────────────────────────
  // Cùng một khung, vẽ hai lần: một lần với bộ đồ của B, một lần sau khi tháo sạch `np.equip`.
  // Cả hai trong CÙNG một `evaluate` để hoạt ảnh nền chỉ trôi ~1 ms, và có ô ĐỐI CHỨNG ở chỗ
  // không ai đứng làm sàn nhiễu — đúng hai lớp mà `test_bongnguoi §2` đã phải học.
  const doVe = await A.p.evaluate(async () => {
    const cv = document.getElementById('game'), g = cv.getContext('2d');
    const z = (typeof ZOOM_MUC !== 'undefined' && typeof ZOOM_CHON !== 'undefined')
      ? ZOOM_MUC[ZOOM_CHON] : 1;
    const tl = cv.width / (cv.clientWidth || cv.width);
    const W = 110, H = 150;
    const lay = (wx, wy) => {
      const sx = (wx - camera.x) * z, sy = (wy - camera.y) * z;
      const x0 = Math.max(0, Math.round((sx - W / 2) * tl));
      const y0 = Math.max(0, Math.round((sy - H * 0.82) * tl));
      return g.getImageData(x0, y0, Math.round(W * tl), Math.round(H * tl)).data;
    };
    const np = window.NETPLAYERS[0];
    const bx = np.x, by = np.y;
    const giu = np.equip;
    const dem = (u, v) => {
      let n = 0;
      for (let i = 0; i < u.length; i += 4) if (u[i] !== v[i] || u[i+1] !== v[i+1] || u[i+2] !== v[i+2]) n++;
      return n;
    };
    const giua = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
    // ⚠ HÂM HAI LẦN, CÁCH NHAU MỘT QUÃNG CHỜ — hai thứ phải lắng, theo hai đồng hồ khác nhau:
    //   · `bayCao` nhích 8% về đích MỖI LẦN `render()`, và B vừa đeo cánh bậc 3 nên nó đang bay
    //     LÊN — hai lượt vẽ kế nhau khác nhau sẵn vì lý do chẳng liên quan gì tới bộ đồ;
    //   · ART BỘ GIÁP thì tải theo MẠNG, vòng render không làm nó về nhanh hơn.
    for (let i = 0; i < 40; i++) render();
    await new Promise(r => setTimeout(r, 1200));
    for (let i = 0; i < 40; i++) render();
    // ⚠ SÀN NHIỄU LÀ TRUNG VỊ, KHÔNG PHẢI MỘT CẶP VÀ CŨNG KHÔNG PHẢI MAX. Đo được trên một thân
    // người ĐỨNG YÊN: 10 cặp khung liên tiếp ra 507·444·501·527·458·**5221**·509·448·441·377.
    // Cái đỉnh đơn độc kia là con AXIE THỞ — nó chạy ~8 FPS trong khi một lượt render tốn ~13 ms,
    // nên cứ chừng 10 khung lại có đúng một lần nhảy khung hình. Lấy MỘT cặp là 10% số lượt rơi
    // trúng đỉnh; lấy MAX là 100% rơi trúng. Cả hai đều làm bài đỏ vì con Axie thở, không vì bộ
    // đồ — đã đỏ 2/3 lượt trước khi đổi sang trung vị.
    const dsNhieu = [];
    let truoc = lay(bx, by);
    for (let i = 0; i < 7; i++){ render(); const nay = lay(bx, by); dsNhieu.push(dem(truoc, nay)); truoc = nay; }
    // Tín hiệu cũng lấy trung vị, cùng lý do: một lượt đo đơn lẻ có thể rơi trúng đúng cái đỉnh
    // ấy và ĐỘN THÊM 5.200 điểm ảnh — tức bài sẽ xanh kể cả khi bộ đồ chẳng đổi gì.
    const dsTin = [], dsDoiChung = [];
    for (let i = 0; i < 3; i++){
      np.equip = giu;  render(); const coDo = lay(bx, by), coDoC = lay(bx + 420, by - 300);
      np.equip = {};   render(); const tran = lay(bx, by), tranC = lay(bx + 420, by - 300);
      dsTin.push(dem(coDo, tran)); dsDoiChung.push(dem(coDoC, tranC));
    }
    np.equip = giu;
    return { oDo: giua(dsTin), oDoiChung: giua(dsDoiChung), nhieu: giua(dsNhieu),
             tong: truoc.length / 4, thoNhieu: dsNhieu, thoTin: dsTin };
  });
  console.log('2 · tháo đồ đổi (trung vị)', doVe.oDo, JSON.stringify(doVe.thoTin),
              '· sàn nhiễu', doVe.nhieu, JSON.stringify(doVe.thoNhieu),
              '· ô đối chứng', doVe.oDoiChung, '· cỡ ô', doVe.tong);
  if (doVe.oDoiChung > doVe.tong * 0.15)
    fail(`ô đối chứng đổi ${doVe.oDoiChung}/${doVe.tong} — nền trôi quá nhiều, phép đo này không `
       + 'tách được bộ đồ ra khỏi nhiễu. Đừng đọc kết quả dưới là "xanh".');
  if (doVe.oDo < 300) fail(`tháo sạch đồ của B chỉ đổi ${doVe.oDo} điểm ảnh — bộ đồ tới nơi nhưng `
                         + 'tầng vẽ không đọc nó');
  if (doVe.oDo < doVe.oDoiChung * 6)
    fail(`ô có người (${doVe.oDo}) không nổi hơn hẳn ô đối chứng (${doVe.oDoiChung})`);
  if (doVe.oDo < doVe.nhieu * 3)
    fail(`tháo đồ đổi ${doVe.oDo} điểm ảnh trong khi hai khung liên tiếp cùng điều kiện đã đổi `
       + `${doVe.nhieu} — không tách được bộ đồ ra khỏi hoạt ảnh của chính thân người đó`);

  // ── 3. HÀNH ĐỘNG RA ĐÒN ───────────────────────────────────────────────────────────────
  // Lái bằng `doBasic()` THẬT, không gán tay `atkAnim`: chỗ dễ hỏng là sợi dây từ cú đánh tới
  // bộ đếm, không phải phép cộng trong bộ đếm.
  const danh = await B.p.evaluate(() => {
    if (!mobs.length) return { loi: 'map không có quái — không lái được đòn đánh thật' };
    const m = mobs[0];
    player.x = m.x + 12; player.y = m.y;
    const truoc = player._atkSeq || 0;
    player.cd.basic = 0; doBasic();
    return { truoc, sau: player._atkSeq || 0, anim: player.atkAnim, act: player.atkAct };
  });
  console.log('3 · B đánh:', JSON.stringify(danh));
  if (danh.loi) fail(danh.loi);
  else if (danh.sau !== danh.truoc + 1) fail(`doBasic() không tăng _atkSeq (${danh.truoc} → ${danh.sau}) `
                                           + '— cú đánh sẽ không bao giờ qua được dây');

  await cho(260);   // một nhịp ảnh chụp, còn trong 0,22 s của hoạt cảnh
  const dangDanh = await A.p.evaluate(() => {
    const np = window.NETPLAYERS[0];
    return np ? { anim: +(np.atkAnim || 0).toFixed(3), act: np.atkAct } : null;
  });
  console.log('3 · A thấy B đang vung:', JSON.stringify(dangDanh));
  if (!dangDanh || !(dangDanh.anim > 0))
    fail('B vừa đánh mà A không thấy hoạt cảnh nào — hành động ra đòn chưa qua được dây');
  if (dangDanh && !dangDanh.act)
    fail('A không nhận được KIỂU ra đòn, nên mọi lớp sẽ vung y hệt nhau');

  await cho(700);   // quá 0,22 s rất nhiều
  const hetDanh = await A.p.evaluate(() => {
    const np = window.NETPLAYERS[0];
    return np ? +(np.atkAnim || 0).toFixed(3) : null;
  });
  console.log('3 · sau 0,7 s:', hetDanh);
  // Chiều NGƯỢC LẠI, và nó quan trọng ngang chiều thuận: chỉ có `update()` đếm ngược hai đồng hồ
  // này, mà thân người từ xa không bao giờ chạy `update()`. Quên đếm ngược ở `noiSuy` thì người
  // bên kia KẸT vĩnh viễn ở khung đầu của cú vung — một pho tượng đang giơ kiếm.
  if (hetDanh !== 0) fail(`hoạt cảnh ra đòn không tắt (còn ${hetDanh}s sau 0,7 s) — thân người từ xa `
                        + 'kẹt ở khung vung kiếm vĩnh viễn');

  // ── 4. CÁNH PHẢI THEO LỚP CỦA CHỦ NÓ, KHÔNG THEO LỚP CỦA NGƯỜI ĐANG NGỒI ĐÂY ──────────
  // Nợ đã ghi sẵn trong CLAUDE.md: `wingDef(it)` lui về `player.sect` khi tra không ra. Vô hại
  // hồi chỉ có một người trên màn; từ lúc đồng bộ cánh thì nó vẽ SAI NGƯỜI mà không báo gì.
  const canh = await A.p.evaluate(() => {
    const np = window.NETPLAYERS[0];
    const it = np && np.equip && np.equip.canh;
    if (!it) return null;
    const dung = wingDef(it, np.sect);
    const la = wingDef({ wing: '@khong-co-that@', wingBac: 3 }, np.sect);  // ép rơi vào nhánh dự phòng
    return { lopTa: player.sect, lopHo: np.sect, ten: dung && dung.name,
             duPhong: la && la.name, taDuPhong: (wingDef({ wing: '@khong-co-that@', wingBac: 3 }) || {}).name };
  });
  console.log('4 · cánh:', JSON.stringify(canh));
  if (!canh) fail('A không thấy cánh của B');
  else {
    if (canh.lopTa === canh.lopHo) fail('hai bên cùng lớp — mục này không kiểm được gì, đổi lớp của B');
    if (canh.duPhong === canh.taDuPhong)
      fail(`nhánh dự phòng của wingDef trả cùng một đôi ("${canh.duPhong}") cho cả lớp của B lẫn lớp `
         + 'của A — tức nó vẫn đang đọc player.sect');
  }

  // ── 5. TRANG BỊ KHÔNG ĐƯỢC ĐI KÈM MỌI ẢNH CHỤP ───────────────────────────────────────
  // ~180 byte × 9 người × 10 Hz = 16 KB/s cho một thứ đổi vài phút một lần. Máy chủ chỉ gửi khi
  // kết nối này chưa có bản ấy; đếm số lần áp dụng là cách duy nhất thấy được điều đó từ client.
  const soAnh0 = await A.p.evaluate(() => window.NET.soAnh);
  const soDo0 = await A.p.evaluate(() => window.__soLanDo);
  await cho(1500);
  const soAnh1 = await A.p.evaluate(() => window.NET.soAnh);
  const soDo1 = await A.p.evaluate(() => window.__soLanDo);
  console.log(`5 · trong ${soAnh1 - soAnh0} ảnh chụp, trang bị tới ${soDo1 - soDo0} lần`);
  if (!(soAnh1 - soAnh0 > 8)) fail('không đủ ảnh chụp để đo — nhịp 10 Hz phải cho >8 ảnh trong 1,5 s');
  if (soDo1 - soDo0 > 2) fail(`trang bị tới ${soDo1 - soDo0} lần trong ${soAnh1 - soAnh0} ảnh chụp — `
                            + 'nó đang đi kèm mọi ảnh thay vì chỉ khi đổi');

  // ── 6. THÁO SẠCH ĐỒ CŨNG PHẢI QUA ĐƯỢC DÂY ───────────────────────────────────────────
  // Bản đầu của `locTrangBi` trả `null` khi mô tả rỗng rồi máy chủ bỏ qua, nên cởi hết đồ ra là
  // mọi người vẫn thấy ta mặc nguyên bộ cũ — và chính người cởi là người duy nhất không thấy.
  await B.p.evaluate(() => {
    for (const k of ['non', 'ao', 'tay', 'chan', 'vukhi', 'canh']) delete player.equip[k];
    calcDerived();
  });
  await cho(1200);
  const sauThao = await A.p.evaluate(() => {
    const np = window.NETPLAYERS[0];
    const gv = np && gearVisual(np);
    return gv ? { n: gv.n, coCanh: !!gv.canh, vk: !!gv.wDef } : null;
  });
  console.log('6 · sau khi B tháo sạch, A thấy:', JSON.stringify(sauThao));
  if (!sauThao) fail('A mất dấu B sau khi B tháo đồ');
  else {
    if (sauThao.n !== 0) fail(`B đã tháo hết mà A còn thấy ${sauThao.n} ô giáp`);
    if (sauThao.coCanh) fail('B đã tháo cánh mà A vẫn thấy cánh');
    if (sauThao.vk) fail('B đã tháo vũ khí mà A vẫn thấy vũ khí');
  }

  // ── 7. TA CHẾT THÌ NGƯỜI KHÁC KHÔNG ĐƯỢC NẰM XUỐNG THEO ─────────────────────────────
  // `dead` là biến TOÀN CỤC của người chơi này, mà `drawPlayer` nay vẽ cả thân người từ xa. Đọc
  // thẳng nó là ba chỗ trong hàm hỏi "TA có chết không" trong lúc đang vẽ NGƯỜI KHÁC: mình nằm
  // xuống là lớp nhân vật của mọi người quanh mình thôi vật chất hoá — họ vung kiếm trong vô hình.
  //
  // ⚠ ĐO BẰNG QUYẾT ĐỊNH, KHÔNG ĐO BẰNG ĐIỂM ẢNH — và đây là kết luận rút ra từ ba lần đo hỏng,
  // ghi lại để đừng ai thử lại:
  //   ① đo một thân người ĐỨNG YÊN: rò rỉ chỉ hiện ra 39/16500 điểm ảnh, vì đứng yên thì thứ
  //      trên màn là con AXIE, mà con Axie chẳng liên quan gì tới chuyện ai chết;
  //   ② ô đo 150px cắt cụt lớp nhân vật (nó đứng cách Axie tới ~91px), và ô ĐỐI CHỨNG thì nằm
  //      ngoài canvas nên ra 0 ở mọi trường hợp — một ô đối chứng luôn xanh không gác được gì;
  //   ③ và cuối cùng: hai lượt vẽ LIÊN TIẾP CÙNG ĐIỀU KIỆN của một thân người đang vung kiếm
  //      lệch nhau **6.545/102.000 điểm ảnh** (cánh vỗ, hào quang đập, vũ khí bay). Sàn nhiễu
  //      lớn hơn hẳn thứ cần đo, nên con số 6.532 mà tôi tưởng là "rò rỉ" chính là nhiễu đó.
  // Nên `drawPlayer` phơi thẳng `_chet` và `_lopHien` ra `window.__veChet` (chỉ khi TEST_MODE),
  // khoá theo từng thân người — cùng lối với `__neoVe`.
  {
    const r = await A.p.evaluate(() => {
      const np = window.NETPLAYERS[0];
      if (!np) return { loi: 'A mất dấu B' };
      const G = window.NV_HD_GIAY || { a: 0.22 };
      const cu = dead, khoa = veKhoa(np);
      np.atkAnim = G.a * 0.6; np.atkAct = np.atkAct || 'slash';
      window.__veChet = {}; render();
      const song = window.__veChet[khoa];
      dead = true; np.atkAnim = G.a * 0.6;
      window.__veChet = {}; render();
      const chet = window.__veChet[khoa], taChet = window.__veChet.ta;
      dead = cu; render();
      return { song, chet, taChet };
    });
    console.log('7 ·', JSON.stringify(r));
    if (r.loi) fail(r.loi);
    else if (!r.song || !r.chet) fail('drawPlayer không phơi __veChet cho thân người từ xa');
    // ⚠ HAI BƯỚC TỰ KIỂM CẢNH DỰNG. Thiếu chúng thì mọi khẳng định bên dưới xanh vì lý do sai:
    //   · lớp nhân vật của B phải THẬT SỰ đang vật chất hoá ở lượt đầu;
    //   · và `dead = true` phải THẬT SỰ có tác dụng (`dead` khai bằng `let` ở tầng cao nhất nên
    //     nó không nằm trên `window` — gán hụt là im lặng).
    else if (r.song.lopHien !== true) fail('cảnh dựng hỏng: lớp nhân vật của B chưa vật chất hoá ở lượt đầu');
    else if (!r.taChet || r.taChet.chet !== true) fail('cảnh dựng hỏng: đặt dead = true không có tác dụng');
    else {
      if (r.chet.chet !== false) fail('ta chết mà thân người của B cũng bị đánh dấu là chết');
      if (r.chet.lopHien !== true) fail('ta chết thì lớp nhân vật của B thôi vật chất hoá — B vung kiếm trong vô hình');
    }
  }

  await A.ctx.close(); await B.ctx.close();
  await b.close();
  dongMay();

  console.log('errors:', JSON.stringify(errs));
  console.log(bad === 0 && errs.length === 0 ? 'PASS' : 'FAIL(' + bad + ')');
  process.exit(bad === 0 && errs.length === 0 ? 0 : 1);
})();
