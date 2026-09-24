// NGÔI NHÀ GIỮA BẢN ĐỒ THẾ GIỚI = THÀNH AN TOÀN — bấm vào là về thành (chủ dự án chốt 2026-09-24).
//   ① đứng ở một map hoang dã, mở bản đồ thế giới, BẤM CHUỘT THẬT vào ngôi nhà ⇒ curMap = ardhaven
//   ② bảng bản đồ đóng lại sau khi dịch chuyển
//   ③ trỏ chuột lên nhà thì con trỏ thành bàn tay (có vùng bắt chuột thật)
const { chromium } = require('playwright');
const CONG = process.argv[2] || '8853';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport:{width:1400,height:860} });
  const loi = []; p.on('pageerror', e => loi.push(e.message));
  let hong = 0; const fail = m => { hong++; console.log('FAIL', m); }, pass = m => console.log('PASS', m);
  await p.goto(`http://localhost:${CONG}/index.html`); await p.waitForFunction(() => window.__gameReady, null, { timeout: 60000 });
  await p.evaluate(async () => { window.TEST_MODE = true; startGame('minhgiao', null); player.level = 60; travelTo('daohoa');
    togglePanel('map'); banDoTab('tg'); for (let i = 0; i < 40; i++) await new Promise(z => setTimeout(z, 50)); });
  const r = await p.evaluate(() => {
    const cv = document.getElementById('bd-tg'); if (!cv) return null;
    const bb = cv.getBoundingClientRect(), q = tgXY(TG_THANH.dau[0], TG_THANH.dau[1]);
    return { x: bb.left + q.x / TG_KHUNG.w * bb.width, y: bb.top + q.y / TG_KHUNG.h * bb.height, truoc: curMap };
  });
  if (!r || r.truoc !== 'daohoa') { console.log('QUE DÒ HỎNG: không dựng được cảnh', JSON.stringify(r)); process.exit(1); }
  await p.mouse.move(r.x, r.y); await p.waitForTimeout(100);
  const tay = await p.evaluate(() => document.getElementById('bd-tg').style.cursor);
  tay === 'pointer' ? pass('③ trỏ lên ngôi nhà ra bàn tay') : fail(`③ con trỏ trên ngôi nhà là "${tay}" — không có vùng bắt chuột`);
  await p.mouse.click(r.x, r.y); await p.waitForTimeout(600);
  const sau = await p.evaluate(() => ({ map: curMap, mo: !document.getElementById('panel-map').classList.contains('hidden') }));
  sau.map === 'ardhaven' ? pass('① bấm ngôi nhà ⇒ về Ardhaven') : fail(`① bấm ngôi nhà mà vẫn ở ${sau.map}`);
  !sau.mo ? pass('② bảng bản đồ đã đóng') : fail('② dịch chuyển xong bảng bản đồ vẫn mở');
  if (loi.length) fail('lỗi trang: ' + loi.slice(0, 3).join(' | '));
  console.log(hong ? `\n${hong} FAIL` : '\nTẤT CẢ XANH');
  await b.close(); process.exit(hong ? 1 : 0);
})();
