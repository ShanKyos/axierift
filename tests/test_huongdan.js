// BẢNG HƯỚNG DẪN (F6) + HAI Ô THUỐC BỎ KHUNG.
//
// Hai việc khác nhau nhưng cùng một gốc: dải gợi ý `#hint-bar` đặt ở `bottom:96px` — tức NGAY
// SAU thanh chiến đấu — nên thứ duy nhất dạy phím cho người chơi thì gần như lúc nào cũng bị
// che. Nội dung dọn sang một bảng riêng, và thanh dưới bớt đi hai khung đồng thừa.
//
// §3 là mệnh đề đáng giá nhất ở đây: bảng phím là DỮ LIỆU TAY, nên nó nói dối được. Bài này
// đọc thẳng `phimXuong.toString()` để hỏi từng phím xem có ai bắt nó không.
const { chromium } = require('playwright');
const PORT = process.argv[2] || '8853';

let bad = 0;
const fail = m => { bad++; console.log('FAIL ' + m); };
const ok = m => console.log('  ok  ' + m);

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e).split('\n')[0]));
  await p.goto(`http://localhost:${PORT}/index.html?max=1`, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__gameReady).catch(() => {});
  await p.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', null); });
  await p.waitForTimeout(2000);
  await p.evaluate(() => closePanels());
  await p.waitForTimeout(300);

  // ── 1. Dải gợi ý cũ đã gỡ HẲN, không chỉ ẩn đi ─────────────────────────────────────────
  const con = await p.evaluate(() => !!document.getElementById('hint-bar'));
  if (con) fail('§1 #hint-bar vẫn còn trên DOM — ẩn đi không phải gỡ, nó vẫn chiếm chỗ và vẫn được cập nhật');
  else ok('§1 #hint-bar đã gỡ khỏi DOM');

  // ── 2. F6 mở bảng, và bảng có đủ mọi dòng đã khai ──────────────────────────────────────
  await p.keyboard.press('F6');
  await p.waitForTimeout(250);
  const bang = await p.evaluate(() => {
    const e = document.getElementById('panel-help');
    if (!e || e.classList.contains('hidden')) return { mo:false };
    const phim = [...e.querySelectorAll('.hd-phim')].map(x => x.textContent.trim());
    return { mo:true, phim, chu: e.textContent,
             khai: window.HD_BANG.reduce((n, g) => n + g.hang.length, 0) };
  });
  if (!bang.mo) fail('§2 bấm F6 không mở bảng Hướng Dẫn');
  else {
    ok(`§2 F6 mở bảng — ${bang.phim.length} dòng phím`);
    if (bang.phim.length !== bang.khai)
      fail(`§2 bảng vẽ ${bang.phim.length} dòng nhưng HD_BANG khai ${bang.khai} — phần vẽ đang bỏ sót dữ liệu`);
    else ok(`§2 vẽ đủ ${bang.khai}/${bang.khai} dòng đã khai`);
    // Khoá i18n lọt ra màn hình nghĩa là từ điển thiếu khoá — t() trả về chính cái khoá.
    if (/help\.[a-z]/.test(bang.chu))
      fail(`§2 có khoá i18n hiện nguyên văn trên bảng (từ điển thiếu khoá): ${(bang.chu.match(/help\.[a-z.]+/g)||[]).join(' ')}`);
    else ok('§2 không có khoá i18n nào lọt ra màn hình');
  }
  // Bấm lần nữa là đóng — bảng mở được mà không đóng được bằng cùng phím thì không ai tìm ra lối ra.
  await p.keyboard.press('F6');
  await p.waitForTimeout(250);
  const dong = await p.evaluate(() => document.getElementById('panel-help').classList.contains('hidden'));
  if (!dong) fail('§2 bấm F6 lần hai không đóng bảng');
  else ok('§2 bấm F6 lần hai đóng bảng');

  // ── 3. BẢNG NÓI PHÍM NÀO THÌ PHÍM ĐÓ PHẢI CÓ NGƯỜI BẮT ────────────────────────────────
  // Chỉ soi được phím MỘT CHỮ CÁI: mấy phím còn lại (Chuột phải · Space · 1 2 3 4 · Alt · Esc
  // · F6) mỗi cái bắt một kiểu khác nhau, mà dựng một bảng "phím này bắt bằng câu lệnh kia"
  // trong bài kiểm thì chính cái bảng ấy lại là bản sao thứ hai cần trông chừng. 15 phím chữ
  // cái đã là phần dễ trôi nhất, và chúng bắt bằng đúng một khuôn câu.
  const soi = await p.evaluate(() => {
    // ⚠ HỎI TRƯỚC KHI GỌI. `function phimXuong(){}` khai ở tầng ngoài cùng của một script
    // thường thì TỰ thành thuộc tính của window — nên dòng `window.phimXuong = …` trong
    // game.js là đai bảo hiểm, không phải thứ giữ chốt này sống. Thứ thật sự làm mất chốt là
    // đổi nó về arrow vô danh; lúc đó `.toString()` ném lỗi và cả bài kiểm VỠ thay vì đỏ một
    // dòng đọc được. Bài kiểm chết vì lỗi thì người ta đi tìm lỗi của bài kiểm, không đi tìm
    // lỗi của sản phẩm.
    if (typeof window.phimXuong !== 'function') return { thieu: [], soi: 0, coHam: false };
    const src = window.phimXuong.toString();
    const ra = { thieu: [], soi: 0, coHam: true };
    for (const g of window.HD_BANG) for (const [phim] of g.hang){
      if (!/^[A-Za-z]$/.test(phim)) continue;
      ra.soi++;
      if (!src.includes(`==='${phim.toLowerCase()}'`) && !src.includes(`=== '${phim.toLowerCase()}'`))
        ra.thieu.push(phim);
    }
    return ra;
  });
  if (!soi.coHam) fail('§3 không tìm thấy window.phimXuong — bộ bắt phím lại thành hàm vô danh, mất chốt chống lệch');
  else if (soi.thieu.length)
    fail(`§3 bảng Hướng Dẫn hứa phím ${soi.thieu.join(' ')} nhưng bộ bắt phím KHÔNG bắt phím đó`);
  else ok(`§3 cả ${soi.soi} phím chữ cái trong bảng đều có người bắt`);

  // ── 4. Hai ô thuốc: KHÔNG khung, và icon không bị dìm ──────────────────────────────────
  const o = await p.evaluate(() => ['sk-thuoc','sk-mana'].map(id => {
    const e = document.getElementById(id), c = getComputedStyle(e);
    return { id, vien:c.borderTopWidth, nen:c.backgroundColor, bong:c.boxShadow,
             anh:c.backgroundImage.slice(0, 60) };
  }));
  for (const x of o){
    const trong = parseFloat(x.vien) === 0
      && /rgba\(0, 0, 0, 0\)|transparent/.test(x.nen)
      && (x.bong === 'none' || !x.bong);
    if (!trong) fail(`§4 ${x.id} vẫn còn khung: viền ${x.vien} · nền ${x.nen} · bóng ${x.bong}`);
    else ok(`§4 ${x.id} không khung, không nền`);
    if (!/url\(/.test(x.anh)) fail(`§4 ${x.id} mất icon — bỏ khung mà cũng mất tranh thì ô thành khoảng trống`);
  }

  // Độ sáng: bỏ khung xong icon phải SÁNG HƠN, không tối đi. Ngưỡng lấy từ số đo trước đợt
  // này (sk-thuoc 67,4 · sk-mana ~65) — bản hỏng vì bị lớp phủ dìm đo được 21,9.
  const luma = async (id) => {
    const h = await p.$('#' + id);
    const buf = await h.screenshot();
    return p.evaluate(async (b64) => {
      const img = new Image();
      await new Promise(r => { img.onload = r; img.src = 'data:image/png;base64,' + b64; });
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const g = c.getContext('2d');
      g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height).data;
      let s = 0;
      for (let i = 0; i < d.length; i += 4) s += 0.2126*d[i] + 0.7152*d[i+1] + 0.0722*d[i+2];
      return s / (d.length / 4);
    }, buf.toString('base64'));
  };
  for (const id of ['sk-thuoc','sk-mana']){
    const L = await luma(id);
    if (L < 45) fail(`§4 icon ${id} bị dìm — sáng trung bình ${L.toFixed(1)} < sàn 45`);
    else ok(`§4 icon ${id} sáng ${L.toFixed(1)}`);
  }

  // ── 5. KHUÔN MU ONLINE: C ra CHỈ SỐ · V ra TRANG BỊ + TÚI ĐỒ ──────────────────────────
  // Trước đây `char` và `inv` chung một nhóm nên bấm C kéo luôn bảng Trang Bị ra. Mệnh đề này
  // gác đúng chỗ đó, và nó gác được vì nó đo SỐ BẢNG MỞ chứ không đo từng bảng một: hỏng kiểu
  // "mở dư một bảng" chỉ lộ ra khi đếm.
  const mo = async (phim) => {
    await p.evaluate(() => closePanels());
    await p.waitForTimeout(150);
    await p.keyboard.press(phim);
    await p.waitForTimeout(300);
    return p.evaluate(() => ['char','inv','bag'].filter(k =>
      !document.getElementById('panel-' + k).classList.contains('hidden')));
  };
  const bangC = await mo('c');
  if (bangC.join() !== 'char')
    fail(`§5 bấm C mở ra [${bangC.join(' ')}] — phải ĐÚNG bảng chỉ số (char), đây là khuôn MU`);
  else ok('§5 C mở đúng một bảng chỉ số');
  const bangV = await mo('v');
  if (bangV.join() !== 'inv,bag')
    fail(`§5 bấm V mở ra [${bangV.join(' ')}] — phải là Trang Bị + Túi Đồ đứng cạnh nhau`);
  else ok('§5 V mở Trang Bị + Túi Đồ');

  // ── 6. Nhật Ký cắm trong cột phải, KHÔNG bị bảng khác đóng ────────────────────────────
  const ql = await p.evaluate(() => {
    const q = document.getElementById('panel-qlog'), c = document.getElementById('cot-phai');
    return { trongCot: !!(q && c && c.contains(q)),
             hien: !!(q && !q.classList.contains('hidden')),
             coX: !!(q && q.querySelector('.close-x')) };
  });
  if (!ql.trongCot) fail('§6 panel-qlog không nằm trong cột phải');
  else if (!ql.hien) fail('§6 Nhật Ký bị ẩn sau khi mở bảng khác — khối cắm trong HUD không được biến mất');
  else ok('§6 Nhật Ký cắm trong cột phải và vẫn hiện khi bảng khác mở');
  if (ql.coX) fail('§6 khối cắm vẫn còn nút ✕ — bấm vào là mất hẳn, không có đường mở lại bằng chuột');
  else ok('§6 khối cắm không có nút ✕');

  // ── 7. MENU NẰM TRÊN THANH CHIẾN ĐẤU ──────────────────────────────────────────────────
  // Menu hệ thống đã đi BỐN chặng: cột dọc mép trái → hàng ngang đáy phải → trong cột phải →
  // nay là một CỤM Ô trên chính thanh chiến đấu, sau vạch ngăn (chủ dự án chốt bằng ảnh mẫu).
  // Mệnh đề này khoá chặng cuối: nó phải nằm TRONG `#bottom-hud`, ô phải CÙNG CỠ ô chiêu
  // (lệch cỡ thì mắt đọc ra hai thanh dán vào nhau), và nút Nhiệm Vụ phải thật sự làm gì đó —
  // `togglePanel('qlog')` nay là lệnh CÂM (khoá lạ thì hàm im lặng bỏ qua), nên một cái nút
  // trỏ nhầm vào đó vẫn bấm được, vẫn kêu, và không đổi một pixel nào.
  const mc = await p.evaluate(() => {
    const m = document.getElementById('menu-cot'), h = document.getElementById('bottom-hud');
    const q = document.getElementById('panel-qlog');
    if (!m || !h || !q) return { loi:'thiếu phần tử' };
    const truoc = q.classList.contains('ql-thu');
    const b = document.getElementById('btn-qlog');
    if (b) b.click();
    const oMenu = m.querySelector('.mc-btn'), oChieu = document.getElementById('sk-0');
    return { trongThanh: h.contains(m),
             cungCo: !!(oMenu && oChieu) &&
               Math.abs(oMenu.getBoundingClientRect().height - oChieu.getBoundingClientRect().height) <= 1,
             coThu: !!document.getElementById('mc-thu'),
             doiTrangThai: !!b && q.classList.contains('ql-thu') !== truoc };
  });
  if (mc.loi) fail('§7 ' + mc.loi);
  else {
    if (!mc.trongThanh) fail('§7 menu hệ thống nằm ngoài thanh chiến đấu — lại thành một khối rời phải nhớ chỗ');
    else ok('§7 menu hệ thống nằm trên thanh chiến đấu');
    if (!mc.cungCo) fail('§7 ô menu KHÁC cỡ ô chiêu — hai cụm cạnh nhau lệch cỡ thì đọc ra hai thanh dán vào nhau, không ra một thanh chia cụm');
    else ok('§7 ô menu cùng cỡ ô chiêu');
    // Nút thu gọn cũ để trên thanh là một cái chốt lạc cỡ, và thu một lần là mất đường mở lại.
    if (mc.coThu) fail('§7 nút thu gọn #mc-thu sống lại — trên thanh chiến đấu nó không có đường mở lại bằng chuột');
    else ok('§7 không còn nút thu gọn lạc cỡ');
    if (!mc.doiTrangThai) fail('§7 nút Nhiệm Vụ trong menu không đổi được trạng thái Nhật Ký — gần như chắc chắn nó còn trỏ vào togglePanel(\'qlog\'), mà khoá đó nay không tồn tại nên hàm im lặng bỏ qua');
    else ok('§7 nút Nhiệm Vụ trong menu thu/mở được Nhật Ký');
  }

  console.log('errors:', errs.slice(0, 5));
  if (errs.length) fail('có lỗi JS trên trang');
  await b.close();
  console.log(bad ? `\n${bad} MỤC ĐỎ` : '\nALL PASS');
  process.exit(bad ? 1 : 0);
})();
