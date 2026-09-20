// BỘ UI GOTHIC — icon tranh thật thay ký tự chữ, và khung bảng 9 lát.
//
// Ba dạng hỏng mà bài này gác, cả ba đều IM LẶNG:
//   ① Khai tên tệp mà THIẾU tệp ⇒ trình duyệt hiện một ô vỡ, không lỗi nào trên console.
//      Đúng họ với `ISO_NEO`: 6 map mất sạch cây vì một bước chép tay bị quên.
//   ② Cắt một tệp rồi KHÔNG ai tham chiếu ⇒ tài sản chết nằm trong repo mãi mãi.
//      Chiều ngược lại của ①, và nó không bao giờ tự lộ ra.
//   ③ `border-image` khai sai `slice` ⇒ trình duyệt KÉO GIÃN cả tấm thay vì cắt 9 lát, nên
//      bốn cái góc chạm trổ bị bè theo bề ngang bảng. Nhìn qua vẫn ra "một cái khung", phải
//      so hai bề rộng khác nhau mới thấy.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const PORT = process.argv[2] || '8853';
const URL = `http://localhost:${PORT}/index.html?max=1`;
const REPO = process.env.AXIE_REPO || path.resolve(__dirname, '..');

let bad = 0;
const fail = m => { bad++; console.log('FAIL ' + m); };
const ok = m => console.log('  ok  ' + m);
const errs = [];

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

  // ══ ① + ② HAI CHIỀU: mã nhắc tệp nào cũng phải có, và tệp nào cũng phải có người nhắc ══
  const thuMuc = path.join(REPO, 'public', 'game', 'assets', 'ui');
  const tren_dia = fs.existsSync(thuMuc)
    ? fs.readdirSync(thuMuc).filter(f => f.startsWith('gt_') && f.endsWith('.webp'))
    : [];
  const nguon = ['game.js', 'index.html', 'style.css']
    .map(f => fs.readFileSync(path.join(REPO, 'public', 'game', f), 'utf8')).join('\n');
  const duocNhac = new Set((nguon.match(/gt_[a-z0-9_]+\.webp/g) || []));
  // ⚠ Đọc cả chuỗi ghép động: `assets/ui/${n.anh}.webp` — tên nằm trong bảng SYS_NUT, không
  // nằm trong chuỗi. Bỏ sót nhánh này là mệnh đề ② báo oan bốn tệp là "chết".
  for (const m of nguon.matchAll(/anh:'(gt_[a-z0-9_]+)'/g)) duocNhac.add(m[1] + '.webp');
  for (const m of nguon.matchAll(/'(gt_[a-z0-9_]+)'/g)) duocNhac.add(m[1] + '.webp');

  const thieu = [...duocNhac].filter(f => !tren_dia.includes(f));
  const chet  = tren_dia.filter(f => !duocNhac.has(f));
  console.log('① trên đĩa:', tren_dia.length, '· được nhắc:', duocNhac.size);
  if (!tren_dia.length) fail('không có tệp gt_*.webp nào — phép đo dưới đây vô nghĩa');
  if (thieu.length) fail(`mã nhắc ${thieu.length} tệp KHÔNG CÓ trên đĩa: ${thieu.join(', ')}`);
  else ok(`${duocNhac.size} tệp được nhắc, tệp nào cũng có thật`);
  if (chet.length) fail(`${chet.length} tệp nằm trong repo mà KHÔNG ai tham chiếu (tài sản chết): ${chet.join(', ')}`);
  else ok('không có tệp nào mồ côi');

  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto(URL);
  await p.waitForFunction(() => window.__gameReady).catch(() => {});
  await p.evaluate(() => localStorage.clear());
  await p.reload();
  await p.waitForFunction(() => window.__gameReady).catch(() => {});
  await p.waitForTimeout(500);
  await p.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', { name: 'Ui' }); applyTestBoost(); player.tutStep = -1; });
  await p.waitForTimeout(400);

  // ══ ③ CHÍN CHỖ TỪNG LÀ KÝ TỰ CHỮ NAY PHẢI LÀ TRANH ═══════════════════════════════════
  // ⚠ HỎI DOM, ĐỪNG DÒ CHUỖI. Một tên tệp nằm đâu đó trong `innerHTML` không chứng minh được
  // cái thẻ ấy đang hiện ra — cùng bài học đã ghi ở `test_tiemnang §⑦`.
  const s3 = await p.evaluate(async () => {
    closePanels(); togglePanel('help');
    await new Promise(r => setTimeout(r, 200));
    const doc = (sel) => {
      const e = document.querySelector(sel);
      if (!e) return { thieu: true };
      const im = e.querySelector('img');
      const r = im ? im.getBoundingClientRect() : null;
      return { co: !!im, src: im ? im.getAttribute('src') : null,
               hien: !!(r && r.width >= 8 && r.height >= 8),
               // còn sót ký tự trang trí nào không (bỏ qua chữ thường và số)
               conKyTu: /[⚑♥◈✦♦⚙⏱✋]/.test(e.textContent || '') };
    };
    const ra = {
      toDoi:   doc('#btn-party'),
      haoHuu:  doc('#btn-friend'),
      lumen:   doc('.vi-lumen'),
      an:      doc('.vi-ve'),
      shard:   doc('.vi-shard'),
    };
    const nut = [...document.querySelectorAll('#panel-help .sys-nut')];
    ra.sysNut = nut.map(n => { const im = n.querySelector('i img');
      const r = im && im.getBoundingClientRect();
      return { ten: (n.querySelector('span') || {}).textContent, co: !!im,
               hien: !!(r && r.width >= 10 && r.height >= 10) }; });
    ra.sysVi = [...document.querySelectorAll('#panel-help .sys-vi img')].length;
    closePanels();
    return ra;
  });
  console.log('③ ', JSON.stringify(s3));
  for (const [ten, v] of Object.entries(s3)){
    if (ten === 'sysNut' || ten === 'sysVi') continue;
    if (v.thieu) fail(`không tìm thấy phần tử ${ten}`);
    else if (!v.co) fail(`${ten} vẫn là ký tự chữ, chưa có <img> — Quy tắc số 3 đòi tranh thật`);
    else if (!v.hien) fail(`${ten} có <img> nhưng vẽ ra 0×0 — tệp hỏng hoặc CSS bóp mất`);
    else if (v.conKyTu) fail(`${ten} có ảnh RỒI mà ký tự cũ vẫn còn — hai biểu tượng chồng nhau`);
  }
  if (s3.sysNut.length !== 4) fail(`Menu Hệ Thống phải có 4 nút, đếm ra ${s3.sysNut.length}`);
  for (const n of s3.sysNut){
    if (!n.co) fail(`nút "${n.ten}" trong Menu Hệ Thống vẫn là ký tự chữ`);
    else if (!n.hien) fail(`nút "${n.ten}" có ảnh nhưng vẽ ra quá nhỏ`);
  }
  if (s3.sysVi !== 3) fail(`hàng ba loại tiền trong Menu Hệ Thống phải dùng 3 icon của ví, đếm ra ${s3.sysVi}`);
  else ok('ví trên HUD và hàng tiền trong Menu Hệ Thống dùng CÙNG bộ icon');

  // ══ ④ KHUNG PHẢI CẮT 9 LÁT THẬT, KHÔNG PHẢI KÉO GIÃN CẢ TẤM ══════════════════════════
  // Phép đo: vẽ cùng một bảng ở HAI bề rộng rất khác nhau rồi so vùng GÓC. Cắt 9 lát thì góc
  // KHÔNG đổi theo bề ngang (đó là cả ý nghĩa của 9 lát); kéo giãn cả tấm thì góc bè ra.
  // Hỏi `border-image` có mặt trong CSS là chưa đủ — khai sai `slice` vẫn ra một chuỗi hợp lệ.
  const s4 = await p.evaluate(() => {
    const pa = document.getElementById('panel-help');
    const cs = getComputedStyle(pa);
    return { anh: cs.borderImageSource, lat: cs.borderImageSlice,
             day: cs.borderTopWidth, bo: cs.borderTopLeftRadius };
  });
  console.log('④ ', JSON.stringify(s4));
  if (!/gt_khung_bang/.test(s4.anh)) fail('`.panel` không dùng khung tranh thật (border-image)');
  if (parseFloat(s4.day) < 12) fail(`vành bảng chỉ ${s4.day} — thu quá thì sợi chỉ vàng của rail tụt xuống dưới 1px và cả vành đọc ra một dải tối`);
  if (parseFloat(s4.bo) > 2) fail(`bảng còn bo góc ${s4.bo} — phần bo cắt đúng vào bốn góc chạm trổ của khung`);

  // ⚠ CHE NỀN TRƯỚC KHI CHỤP. Bảng trong mờ 90% (`--bg-panel-1: rgba(...,.90)`) và thế giới
  // phía sau thì ĐỘNG — mây, cỏ, ánh sáng đều chạy theo `performance.now()`. Chụp hai lượt
  // cách nhau vài trăm mili giây là hai ảnh khác nhau kể cả khi khung vẽ y hệt, nên mệnh đề
  // "góc bất biến" sẽ đỏ vì một lý do chẳng liên quan gì tới `border-image`.
  // Đã dẫm đúng thế: lượt đầu bài này báo "đang kéo giãn cả tấm" trong khi 9 lát chạy hoàn hảo.
  await p.evaluate(() => {
    const st = document.createElement('style'); st.id = '_che';
    st.textContent = 'canvas{visibility:hidden!important}body{background:#000!important}'
                   + '#bottom-hud,#hud-left,#hud-right,#hud-map,#combat-log-wrap{visibility:hidden!important}';
    document.head.appendChild(st);
  });
  const chup = async (rong) => {
    await p.evaluate((w) => {
      const pa = document.getElementById('panel-help');
      closePanels(); togglePanel('help');
      pa.style.width = w + 'px'; pa.style.maxHeight = '300px'; pa.style.height = '300px';
    }, rong);
    await p.waitForTimeout(160);
    const bb = await p.locator('#panel-help').boundingBox();
    const D = 34;   // đúng bề dày vành: lấy rộng hơn là dính cả thanh tiêu đề bên trong,
                    // mà thanh ấy đổi bố cục theo bề rộng bảng ⇒ đo nhầm sang layout
    const cat = (x) => p.screenshot({ clip: { x: Math.round(x), y: Math.round(bb.y), width: D, height: D } });
    return { goc: await cat(bb.x), canh: await cat(bb.x + bb.width / 2 - D / 2) };
  };
  const a = await chup(360), c = await chup(900);
  // ⚠ SO ĐIỂM ẢNH CÓ DUNG SAI, ĐỪNG SO BYTE. `Buffer.compare` trên hai tấm PNG đỏ ngay khi
  // MỘT điểm lệch 1/255 — mà nén PNG và làm tròn màu thì lệch ngần ấy là chuyện thường. Lượt
  // đầu bài này báo "đang kéo giãn cả tấm" trong khi đo lại thì lệch tối đa = 1, lệch TB =
  // 0,01, và SỐ ĐIỂM lệch quá 6 là **0**. Tức mệnh đề đỏ vì phép so, không vì cơ chế.
  const soAnh = async (A, B) => p.evaluate(async ([a64, b64]) => {
    const tai = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; });
    const [ia, ib] = await Promise.all([tai('data:image/png;base64,' + a64), tai('data:image/png;base64,' + b64)]);
    if (ia.width !== ib.width || ia.height !== ib.height) return { khac: -1 };
    const cv = document.createElement('canvas'); cv.width = ia.width; cv.height = ia.height;
    const g = cv.getContext('2d', { willReadFrequently: true });
    g.drawImage(ia, 0, 0); const da = g.getImageData(0, 0, cv.width, cv.height).data;
    g.clearRect(0, 0, cv.width, cv.height); g.drawImage(ib, 0, 0);
    const db = g.getImageData(0, 0, cv.width, cv.height).data;
    let khac = 0, dinh = 0;
    for (let i = 0; i < da.length; i += 4){
      const d = Math.abs(da[i] - db[i]) + Math.abs(da[i+1] - db[i+1]) + Math.abs(da[i+2] - db[i+2]);
      if (d > dinh) dinh = d;
      if (d > 18) khac++;            // 18/765: qua ngưỡng nén, chưa tới mức mắt thấy
    }
    return { khac, dinh, tong: da.length / 4 };
  }, [A.toString('base64'), B.toString('base64')]);

  const dGoc = await soAnh(a.goc, c.goc);
  const dCanh = await soAnh(a.goc, a.canh);
  console.log('④ góc@360 vs góc@900:', JSON.stringify(dGoc), '· góc vs giữa cạnh:', JSON.stringify(dCanh));
  const gocGiong = dGoc.khac === 0;
  // "khác" ở đây phải khác RÕ: hoa văn góc so với rail trơn thì phải lệch ở một phần đáng kể
  // của ô, không phải vài điểm lẻ.
  const gocKhacCanh = dCanh.khac > dCanh.tong * 0.08;
  console.log('④ góc @360 == góc @900:', gocGiong, '· góc khác cạnh:', gocKhacCanh);
  if (!gocKhacCanh) fail(`góc và giữa cạnh vẽ ra gần như GIỐNG NHAU (${dCanh.khac}/${dCanh.tong} điểm khác) — khung mất hoa văn góc, hoặc cả tấm bị kéo giãn thành một dải phẳng`);
  if (!gocGiong) fail(`bề rộng bảng đổi 360→900px mà GÓC cũng đổi theo (${dGoc.khac} điểm, đỉnh ${dGoc.dinh}) — \`border-image\` đang kéo giãn cả tấm, không cắt 9 lát`);
  else ok('góc bất biến theo bề rộng bảng ⇒ 9 lát chạy thật');
  await p.evaluate(() => { const pa = document.getElementById('panel-help');
    pa.style.width = pa.style.maxHeight = pa.style.height = ''; closePanels();
    const st = document.getElementById('_che'); if (st) st.remove(); });
  await p.close();

  // ══ ⑤ VÀNH DÀY LÊN KHÔNG ĐƯỢC LÀM BẢNG TRÀN RA NGOÀI MÀN ═════════════════════════════
  // Kiểm toán @0ab8a08 đo được "tràn ra ngoài màn = 0 ở cả 12 tổ hợp". Vành đi từ 10px lên
  // 34px là ăn thêm 48px bề ngang mỗi bảng — giữ lại tính chất đó bằng phép đo, không bằng
  // niềm tin.
  const BANG = ['char','inv','bag','skill','map','quest','settings','help','ngocbank'];
  for (const [w, h] of [[1280,720],[1440,900],[1920,1080]]){
    const p2 = await b.newPage({ viewport: { width: w, height: h } });
    p2.on('pageerror', e => errs.push(String(e)));
    await p2.goto(URL);
    await p2.waitForFunction(() => window.__gameReady).catch(() => {});
    await p2.evaluate(() => localStorage.clear());
    await p2.reload();
    await p2.waitForFunction(() => window.__gameReady).catch(() => {});
    await p2.waitForTimeout(450);
    await p2.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', { name: 'Ui' });
      applyTestBoost(); player.level = 60; calcDerived(); player.tutStep = -1; });
    await p2.waitForTimeout(450);
    const r = await p2.evaluate(async (ds) => {
      const ra = [];
      for (const id of ds){
        closePanels(); togglePanel(id);
        await new Promise(r => setTimeout(r, 120));
        for (const el of document.querySelectorAll('.panel:not(.hidden)')){
          const b = el.getBoundingClientRect();
          ra.push({ id: el.id,
            tran: Math.round(Math.max(0, -b.left, -b.top, b.right - innerWidth, b.bottom - innerHeight)),
            ngang: el.scrollWidth > el.clientWidth + 1 });
        }
      }
      closePanels();
      return ra;
    }, BANG);
    const tran = r.filter(x => x.tran > 0), ngang = r.filter(x => x.ngang);
    console.log(`⑤ ${w}x${h}: ${r.length} lượt mở · tràn màn ${tran.length} · tràn ngang ${ngang.length}`);
    if (!r.length) fail(`${w}x${h}: không mở được bảng nào — phép đo rỗng`);
    if (tran.length) fail(`${w}x${h}: ${tran.length} bảng tràn ra ngoài màn (${tran.map(x => x.id + ' ' + x.tran + 'px').join(', ')})`);
    if (ngang.length) fail(`${w}x${h}: ${ngang.length} bảng tràn NGANG trong lòng (${ngang.map(x => x.id).join(', ')}) — vành dày lên bóp mất ruột`);
    await p2.close();
  }

  console.log('errors:', JSON.stringify(errs));
  console.log(bad === 0 && errs.length === 0 ? 'PASS' : 'FAIL(' + (bad + errs.length) + ')');
  await b.close();
  process.exit(bad === 0 && errs.length === 0 ? 0 : 1);
})();
