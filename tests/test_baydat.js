// ĐÔI CÁNH NHẤC LỚP NHÂN VẬT, KHÔNG NHẤC CON AXIE
//
// Chủ dự án chụp màn hình và gọi đúng tên: *"hình bay như này sai quá sai"*. Thứ trong ảnh là
// con Axie — cái thân NHÌN THẤY của người chơi — treo lơ lửng cách vòng chân của chính nó
// 24 px, không cánh, không hoạt cảnh bay nào. Nguyên nhân: khối BAY bọc CẢ CẶP trong một
// `ctx.translate(0, yOff)`, trong khi `veCanh()` thì vẽ đôi cánh ở chỗ LỚP NHÂN VẬT đứng.
// Tức đôi cánh mọc trên kẻ hộ tống mà cả hai cùng bay.
//
// Bài này gác ba mệnh đề, và cả ba đã được thử ngược (dựng lại bản cũ ⇒ đỏ):
//   ① avatar BẬT + đeo cánh ⇒ chân con Axie ĐỨNG YÊN so với lúc không cánh;
//   ② cùng lúc đó gốc cắm cánh (lớp nhân vật) phải NHẤC LÊN thật — nếu không thì mệnh đề ①
//      xanh chỉ vì cả hệ thống bay đã chết, chứ không phải vì nó được sửa đúng;
//   ③ avatar TẮT ⇒ hành vi cũ y nguyên: thân người LÀ thân nhìn thấy nên nó phải bay.
//
// Đo qua `window.__neoVe` (do `_doNeo` ghi bằng CHÍNH ma trận vòng vẽ đang dùng), không đo
// điểm ảnh: con Axie thở ~8 FPS nên hai lượt vẽ liên tiếp cùng điều kiện lệch tới 5.200 điểm
// ảnh — sàn nhiễu ấy lớn hơn 24 px cần đo. Xem CLAUDE.md mục "ĐO CHỈ SỐ KHUNG".
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1280, height: 760 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  let bad = 0;
  const fail = m => { bad++; console.log('FAIL ' + m); };
  const pass = m => console.log('PASS ' + m);

  await p.goto('http://localhost:8853/index.html?test=1', { waitUntil: 'networkidle' });
  await p.waitForFunction(() => window.__gameReady).catch(() => {});
  await p.evaluate(() => { window.TEST_MODE = true; startGame('toanchan', null); });
  await p.waitForTimeout(4000);

  // `bayCao` đi tới đích theo cấp số nhân MỖI KHUNG (8% một lượt), nên phải quay đủ lâu rồi
  // mới đọc — đọc ngay khung sau là đo một giá trị đang trên đường đi.
  const doNeo = (dat) => p.evaluate((dat) => new Promise(r => {
    Object.assign(player, dat);
    let n = 0;
    const b = () => { n++; (n < 90) ? requestAnimationFrame(b) : r(JSON.parse(JSON.stringify(window.__neoVe || {}))); };
    requestAnimationFrame(b);
  }), dat);

  const canh = await p.evaluate(() => {
    const w = genWing(player.sect, 3);
    return w ? { name: w.name, bac: wingBac(w), cao: BAY_CAO[2] } : null;
  });
  if (!canh) { console.log('FAIL không tạo được cánh bậc 3 — cảnh dựng hỏng'); await b.close(); process.exit(1); }

  // ── ① + ② avatar BẬT ───────────────────────────────────────────────────────────────────
  const khongCanh = await p.evaluate(() => { delete player.equip.canh; calcDerived(); })
    .then(() => doNeo({ avatar: 'aurelion', atkAnim: 0, castT: 0, face: 0, moving: false }));
  const coCanh = await p.evaluate(() => { player.equip.canh = genWing(player.sect, 3); calcDerived(); })
    .then(() => doNeo({ avatar: 'aurelion', atkAnim: 0, castT: 0, face: 0, moving: false }));

  if (!khongCanh.axie || !coCanh.axie) fail('không có window.__neoVe.axie — game chưa phơi chỗ đứng con Axie');
  else {
    const d = Math.abs(coCanh.axie.y - khongCanh.axie.y);
    if (d > 1.0) fail(`① đeo cánh mà con Axie NHẤC LÊN ${d.toFixed(1)}px — nó phải đứng đất`);
    else pass(`① con Axie đứng đất khi đeo cánh (lệch ${d.toFixed(2)}px)`);
  }
  if (!khongCanh.canh || !coCanh.canh) fail('không có window.__neoVe.canh — không đo được gốc cắm cánh');
  else {
    const d = khongCanh.canh.y - coCanh.canh.y;   // nhấc lên ⇒ y giảm
    if (!(d > 6)) fail(`② lớp nhân vật KHÔNG bay (gốc cắm cánh chỉ nhích ${d.toFixed(1)}px) — ` +
                       'mệnh đề ① xanh vô nghĩa nếu cả hệ bay đã chết');
    else pass(`② lớp nhân vật bay lên ${d.toFixed(1)}px`);
  }

  // ── ③ avatar TẮT ⇒ hành vi cũ ─────────────────────────────────────────────────────────
  const tatKhong = await p.evaluate(() => { delete player.equip.canh; calcDerived(); })
    .then(() => doNeo({ avatar: null, atkAnim: 0, castT: 0, face: 0, moving: false }));
  const tatCo = await p.evaluate(() => { player.equip.canh = genWing(player.sect, 3); calcDerived(); })
    .then(() => doNeo({ avatar: null, atkAnim: 0, castT: 0, face: 0, moving: false }));
  if (!tatKhong.canh || !tatCo.canh) fail('③ không đo được gốc cắm cánh khi tắt avatar');
  else {
    const d = tatKhong.canh.y - tatCo.canh.y;
    if (!(d > 6)) fail(`③ avatar TẮT mà thân người không bay (nhích ${d.toFixed(1)}px) — hành vi cũ đã vỡ`);
    else pass(`③ avatar tắt ⇒ thân người vẫn bay lên ${d.toFixed(1)}px`);
  }

  if (errs.length) fail('lỗi trang: ' + errs.slice(0, 3).join(' | '));
  console.log(bad ? `\n${bad} FAIL` : '\nOK');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
