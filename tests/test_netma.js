// 🧪 CÔNG CỤ THỬ ONLINE — lệnh `/net`, và BÓNG GIẢ phải vẽ ra thật.
//
// Vì sao bóng giả đáng có một bài kiểm riêng: thử online bằng hai cửa sổ có một cái bẫy đã ghi
// trong CLAUDE.md — mọi nhân vật mới hiện ra ở ĐÚNG một điểm, nên hai thân chồng khít lên nhau
// lệch 0,0px và một kết nối chạy hoàn hảo vẫn đọc ra "không thấy ai". `/net ma` và `/net toi`
// sinh ra để bác bỏ chuyện đó trong một giây. Một công cụ thử mà tự nó hỏng thì tệ hơn không có:
// nó làm người ta đi sửa đúng chỗ đang chạy tốt.
//
// ⚠ HAI ĐƯỜNG PHẢI KIỂM RIÊNG, và chúng hỏng theo hai kiểu khác nhau:
//   · KHÔNG mạng — `net.js` `return` ngay đầu tệp, nên không ai dựng lại `NETPLAYERS`;
//     `netMaDong()` trong game.js phải tự đổ vào. Thiếu nó thì `/net ma` im lặng không vẽ gì ở
//     đúng cái đường chơi một mình mà người ta hay thử TRƯỚC.
//   · CÓ mạng — `capNhatMang()` dựng lại mảng ấy mỗi ảnh chụp (10 lần/giây), nên thiếu chỗ nối
//     là bóng giả vẽ được đúng một nhịp rồi biến. Kiểu biến đó đọc ra "tầng vẽ hỏng".
//
// Chạy độc lập:  node tests/test_netma.js [cổng-game]
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
  const br = await chromium.launch();

  /* ═══ ① + ② + ③ — đường KHÔNG có mạng ══════════════════════════════════════════════ */
  const pg = await br.newPage({ viewport: { width: 1280, height: 800 } });
  pg.on('pageerror', e => errs.push(String(e)));
  await pg.goto(GOC + '?test=1');
  await pg.waitForFunction(() => window.__gameReady, null, { timeout: 60000 });
  await pg.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', null); });
  await cho(700);

  const r = await pg.evaluate(() => {
    mobs.length = 0; moveTarget = null;
    for (let i = 0; i < 20; i++) update(0.016);     // camera lắng về chỗ người chơi
    render();

    const truoc = window.NETPLAYERS.length;
    // ⚠ MỘT bóng, không phải ba. Từ đợt `main` cho lớp nhân vật ĐI THEO ở cỡ 1,00 trong thành,
    // mỗi bóng chiếm chỗ rộng hơn hẳn — ba con vây quanh thì con nào cũng lọt vào ô đối chứng
    // của con kia, và ô đối chứng nhiễm 1.688 điểm ảnh (trước là 121). Ô đối chứng phải TRỐNG.
    window.cheatExec('/net ma 1');
    const sau = window.NETPLAYERS.length;
    const m = window.NET_MA[0];

    // Đo điểm ảnh theo đúng khuôn `test_bongnguoi`: screen = (thế giới − camera) × zoom, RỒI
    // mới tới tỉ lệ bộ đệm/CSS. Quên `tl` là đo vào một ô trống — đã dẫm đúng thế khi dò tay.
    const cv = document.getElementById('game'), g = cv.getContext('2d');
    const z = ZOOM_MUC[ZOOM_CHON];
    const tl = cv.width / (cv.clientWidth || cv.width);
    const OW = 120, OH = 150;
    const lay = (wx, wy) => {
      const sx = (wx - camera.x) * z, sy = (wy - camera.y) * z;
      const x0 = Math.max(0, Math.round((sx - OW / 2) * tl));
      const y0 = Math.max(0, Math.round((sy - OH * 0.82) * tl));
      return g.getImageData(x0, y0, Math.round(OW * tl), Math.round(OH * tl)).data;
    };
    // ⚠ TỰ KIỂM CẢNH DỰNG. Ô nằm ngoài canvas thì `getImageData` kẹp về góc trên-trái và ô đối
    // chứng ra BẰNG HỆT ô đo — bài xanh/đỏ vì một lý do chẳng liên quan. Đã xảy ra thật khi dò.
    const sxm = (m.x - camera.x) * z, sym = (m.y - camera.y) * z;
    const trongKhung = sxm > 80 && sym > 80 && sxm < cv.clientWidth - 80 && sym < cv.clientHeight - 80;

    // Ô ĐỐI CHỨNG đặt ở phía ĐỐI DIỆN người chơi so với bóng, nên nó cách CẢ HAI thân người.
    // Chọn theo hình học chứ không bằng một độ lệch chép tay: `m.x − 480` từng rơi cách một
    // bóng khác đúng 269px, và ở cỡ trong-thành thì thế là chạm.
    const gx = m.x - player.x, gy = m.y - player.y, gl = Math.hypot(gx, gy) || 1;
    const ccx = player.x - gx / gl * 620, ccy = player.y - gy / gl * 620;
    const xaNhat = Math.min(Math.hypot(player.x - ccx, player.y - ccy),
                            Math.hypot(m.x - ccx, m.y - ccy));

    const dem = (u, v) => { let n = 0; for (let i = 0; i < u.length; i += 4) if (u[i]!==v[i]||u[i+1]!==v[i+1]||u[i+2]!==v[i+2]) n++; return n; };
    const trungVi = a => a.slice().sort((x, y) => x - y)[a.length >> 1];

    // ⚠ TRUNG VỊ, KHÔNG PHẢI MỘT CẶP. Con Axie nay PHA hai khung (xem mục "Khối thở của Axie
    // PHA hai khung") nên nó nhúc nhích ở MỌI lượt vẽ — sàn nhiễu của một cặp đơn lẻ nhảy rất
    // rộng. Cùng bản vá mà `test_xoayvfx` và `test_dongbodo` đã phải dùng.
    const giu = window.NET_MA.slice();
    const sBong = [], sChung = [];
    for (let lap = 0; lap < 9; lap++){
      window.NET_MA.length = 0; window.NET_MA.push(...giu); netMaDong();
      render();
      const coA = lay(m.x, m.y), coC = lay(ccx, ccy);
      window.cheatExec('/net xoa');
      render();
      sBong.push(dem(coA, lay(m.x, m.y)));
      sChung.push(dem(coC, lay(ccx, ccy)));
    }
    window.NET_MA.length = 0; window.NET_MA.push(...giu); netMaDong();

    // ③ nhịp + hoạt cảnh: bóng giả phải THỞ và phải ĐẾM NGƯỢC như thân người thật.
    const ph0 = giu[0].walkPh;
    for (let i = 0; i < 30; i++) update(0.016);
    const ph1 = giu[0].walkPh;
    window.cheatExec('/net ma danh');
    const atk0 = giu[0].atkAnim;
    for (let i = 0; i < 5; i++) update(0.016);
    const atk1 = giu[0].atkAnim;

    // `/net toi` — lệnh đáng giá nhất: nó bác bỏ cái bẫy "hai thân chồng khít".
    const xTruoc = player.x;
    window.cheatExec('/net toi');
    const dSau = Math.hypot(player.x - giu[0].x, player.y - giu[0].y);

    return { truoc, sau, trongKhung, xaNhat: Math.round(xaNhat),
             oBong: trungVi(sBong), oDoiChung: trungVi(sChung),
             ph0, ph1, atk0, atk1, oDo: Object.keys(giu[0].equip || {}).length,
             xTruoc, dSau, sect: giu[0].sect, sectTa: player.sect };
  });

  console.log('1 · /net ma 1 ⇒ NETPLAYERS', r.truoc, '→', r.sau, '· ô đồ mặc:', r.oDo);
  if (!r.trongKhung) fail('⓪ cảnh dựng hỏng — bóng giả nằm ngoài khung hình, mọi phép đo dưới đây vô nghĩa');
  if (r.sau - r.truoc !== 1) fail('① `/net ma 1` không đổ bóng nào vào NETPLAYERS (đường KHÔNG mạng)');
  if (r.oDo < 1) fail('① bóng giả không mặc gì — `netApTrangBi` không chạy, tức nó không thử được đường trang bị');
  if (r.sect !== r.sectTa) fail('① bóng giả khác lớp với mình — không so được với thân của chính mình');

  console.log('2 · điểm ảnh đổi (trung vị 9 cặp) — ô có bóng:', r.oBong,
              '· ô đối chứng:', r.oDoiChung, '· ô đối chứng cách thân gần nhất', r.xaNhat + 'px');
  if (r.xaNhat < 400) fail('② cảnh dựng hỏng — ô đối chứng nằm sát một thân người, nó không còn là sàn nhiễu của NỀN');
  if (!(r.oBong > 800 && r.oBong > r.oDoiChung * 5))
    fail(`② bóng giả KHÔNG VẼ RA (ô bóng ${r.oBong} · đối chứng ${r.oDoiChung}) — /net ma là một cái vỏ`);

  console.log('3 · thở: walkPh', r.ph0.toFixed(3), '→', r.ph1.toFixed(3),
              '· đòn: atkAnim', r.atk0.toFixed(3), '→', r.atk1.toFixed(3));
  if (!(r.ph1 > r.ph0)) fail('③ bóng giả KHÔNG thở — `netMaNhip` không được gọi trong update()');
  if (!(r.atk0 > 0)) fail('③ `/net ma danh` không đặt đồng hồ ra đòn');
  if (!(r.atk1 < r.atk0)) fail('③ đồng hồ ra đòn KHÔNG đếm ngược — bóng giả kẹt ở khung vung kiếm, vĩnh viễn');

  console.log('4 · /net toi ⇒ cách bóng gần nhất', Math.round(r.dSau), 'px (trước ở x =', Math.round(r.xTruoc) + ')');
  if (!(r.dSau > 5 && r.dSau < 260))
    fail(`④ \`/net toi\` không đưa mình tới CẠNH bóng (cách ${Math.round(r.dSau)}px) — đứng đè lên nhau đúng là cái bẫy đang muốn gỡ`);

  await pg.close();

  /* ═══ ⑤ — đường CÓ mạng: bóng giả phải sống sót qua các ảnh chụp ═══════════════════ */
  const cong = await congTrong();
  const sv = spawn('node', [path.join(REPO, 'server', 'bongnguoi.js')],
                   { env: { ...process.env, PORT: String(cong) }, stdio: 'ignore' });
  await cho(900);

  const pg2 = await br.newPage({ viewport: { width: 1280, height: 800 } });
  pg2.on('pageerror', e => errs.push(String(e)));
  await pg2.goto(GOC + '?test=1&net=ws://127.0.0.1:' + cong + '/ws');
  await pg2.waitForFunction(() => window.__gameReady, null, { timeout: 60000 });
  await pg2.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', null); });
  await cho(1500);

  const r2 = await pg2.evaluate(async () => {
    const anh0 = window.NET.soAnh;
    window.cheatExec('/net ma 2');
    const ngay = window.NETPLAYERS.filter(n => n._netId <= -1000).length;
    await new Promise(r => setTimeout(r, 1200));         // qua chừng 12 ảnh chụp
    return { on: window.NET.on, tinhTrang: window.NET.tinhTrang,
             anhTruoc: anh0, anhSau: window.NET.soAnh, ngay,
             sau: window.NETPLAYERS.filter(n => n._netId <= -1000).length };
  });

  console.log('5 · nối:', r2.tinhTrang, '· ảnh chụp', r2.anhTruoc, '→', r2.anhSau,
              '· bóng giả', r2.ngay, '→', r2.sau);
  // ⚠ Tự kiểm: chưa có ảnh chụp nào trôi qua thì mệnh đề dưới không chứng minh được gì.
  if (!(r2.on && r2.anhSau > r2.anhTruoc + 3))
    fail('⑤ cảnh dựng hỏng — không có ảnh chụp nào trôi qua, nên "sống sót qua ảnh chụp" là câu vô nghĩa');
  else if (!(r2.ngay === 2 && r2.sau === 2))
    fail(`⑤ bóng giả BỊ ẢNH CHỤP XOÁ (${r2.ngay} → ${r2.sau}) — capNhatMang() không nối NET_MA`);

  await pg2.close();
  sv.kill();
  await br.close();

  console.log('errors:', errs);
  if (errs.length) fail('có lỗi trang');
  console.log(bad ? `FAIL ${bad}` : 'PASS — /net dựng được người giả, vẽ ra thật, và ảnh chụp không xoá mất');
  process.exit(bad ? 1 : 0);
})();
