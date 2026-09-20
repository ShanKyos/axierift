// TẤM ẢNH CỦA QUÁI PHẢI CÓ THẬT — và đây là chỗ hỏng IM LẶNG.
//
// Trước bài này không mệnh đề nào đối chiếu `MOBS[].img` với đĩa. Gõ sai một chữ trong đường
// dẫn thì trình duyệt xin một tệp không tồn tại, in một dòng 404 vào console rồi thôi: con quái
// vẫn spawn, vẫn đánh, vẫn rơi đồ — chỉ là KHÔNG VẼ RA GÌ, hoặc rơi về tạo hình khác. Không lỗi
// nào ném, không bài nào đỏ. Đúng họ với vết sẹo `ISO_NEO` đã xoá sạch cây của sáu map.
//
// Bốn mệnh đề, và ④ là tầng HÀNH VI — ba cái đầu chỉ đối chiếu chuỗi với đĩa, nên chúng không
// bắt được ca "tệp có thật nhưng trình duyệt không tải nổi" (sai hoa/thường trên máy chủ phân
// biệt chữ hoa, tệp rỗng, PNG hỏng).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const G = path.join(__dirname, '..', 'public', 'game');
let bad = 0;
const fail = m => { bad++; console.log('FAIL ' + m); };
const pass = m => console.log('  ok  ' + m);
const co = p => { try { return fs.statSync(path.join(G, p)).size > 0; } catch { return false; } };

(async () => {
  const port = process.argv[2] || '8853';
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = [];
  const bon04 = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('response', r => { if (r.status() === 404 && /assets\/mobs\//.test(r.url())) bon04.push(r.url()); });
  await p.goto('http://localhost:' + port + '/index.html');
  await p.waitForFunction(() => window.__gameReady).catch(() => {});
  await p.waitForTimeout(700);

  const kho = await p.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    return {
      mobs: Object.entries(MOBS).map(([k, d]) => ({ k, ten: d.name, img: d.img || null })),
      boss: Object.entries(typeof BOSS_DEFS === 'object' ? BOSS_DEFS : {})
        .map(([k, d]) => ({ k, anh: d.anh || null })),
      khung: Object.keys(typeof MOB_KHUNG === 'object' ? MOB_KHUNG : {}),
    };
  });

  // ── ① mọi MOBS[].img phải có tệp thật ────────────────────────────────────────────────
  const thieu = kho.mobs.filter(m => m.img && !co(m.img));
  if (thieu.length) fail(`① ${thieu.length} loài trỏ vào tệp KHÔNG có: ` +
    thieu.map(m => `${m.k}→${m.img}`).join(', '));
  else pass(`① cả ${kho.mobs.filter(m => m.img).length} loài khai img đều có tệp thật`);

  // ── ② mọi BOSS_DEFS[].anh phải có tệp thật ───────────────────────────────────────────
  const bThieu = kho.boss.filter(x => x.anh && !co('assets/mobs/' + x.anh) && !co(x.anh));
  if (bThieu.length) fail(`② trùm trỏ vào tranh KHÔNG có: ` + bThieu.map(x => `${x.k}→${x.anh}`).join(', '));
  else pass(`② ${kho.boss.filter(x => x.anh).length} trùm khai tranh riêng đều có tệp thật`);

  // ── ③ khai MOB_KHUNG thì phải có CẢ bảng khung LẪN tấm tĩnh lùi ──────────────────────
  // Luật đã ghi trong CLAUDE.md: bảng khung nạp LƯỜI, nên thiếu tấm lùi là mấy trăm mili giây
  // đầu xin một tệp không tồn tại rồi con trùm chớp thành đốm mực.
  const kThieu = [];
  for (const ten of kho.khung) {
    // ⚠ KHOÁ `MOB_KHUNG` KHÔNG CÓ ĐUÔI — đường dẫn dựng thành `assets/mobs/kh/<tên>.png` (xem
    // `mobKhungAnh`). Kiểm thẳng chính chuỗi khoá là báo thiếu cả hai tệp đang có thật.
    if (!co('assets/mobs/kh/' + ten + '.png')) kThieu.push(`kh/${ten}.png (bảng khung)`);
    if (!co('assets/mobs/' + ten + '.png')) kThieu.push(`${ten}.png (tấm tĩnh lùi)`);
  }
  if (kThieu.length) fail('③ MOB_KHUNG thiếu tệp: ' + kThieu.join(', '));
  else pass(`③ cả ${kho.khung.length} khoá MOB_KHUNG đều đủ bảng khung + tấm tĩnh lùi`);

  // ── ④ TẦNG HÀNH VI: spawn thật rồi hỏi trình duyệt đã TẢI ĐƯỢC ảnh chưa ──────────────
  // Đây là tầng duy nhất bắt được ca "tệp có trên đĩa mà vẫn không hiện" — và nó cũng là tầng
  // duy nhất chạy qua đúng cái bộ đệm `MOB_IMGS` mà vòng vẽ dùng.
  const d4 = await p.evaluate(async () => {
    // ⚠ LOẠI LOÀI KHAI `skel` — năm loài khai CẢ `skel` LẪN `img` và CỐ Ý hiện bằng khung
    // xương (CLAUDE.md: *"Đừng đảo thứ tự skel/img để dọn"*), nên đường nạp ảnh cố tình bỏ qua
    // chúng. Đòi chúng tải ảnh là đòi một thứ thiết kế nói không — `img` ở đó chỉ là nấc lùi khai sẵn,
    // và ① vẫn gác chuyện tệp đó có thật.
    const ks = Object.keys(MOBS).filter(k => MOBS[k].img && !MOBS[k].skel);
    mobs.length = 0;
    for (const k of ks) spawnMob(k, { x: player.x + 40, y: player.y, r: 1 });
    for (let i = 0; i < 10; i++) render();
    await new Promise(r => setTimeout(r, 2500));
    for (let i = 0; i < 10; i++) render();
    const chua = [];
    for (const k of ks) {
      // ⚠ `MOB_IMGS` KHOÁ THEO MÃ LOÀI (`m.type`), KHÔNG theo đường dẫn — xem dòng nạp trước
      // `MOB_KHUNG`. Khoá nhầm bằng `MOBS[k].img` thì **32/32 loài đều báo thiếu trong khi 0 lượt
      // 404** — hai con số đó mâu thuẫn nhau, và chính chỗ mâu thuẫn là bằng chứng que dò hỏng.
      const im = MOB_IMGS[k];
      if (!im || !im.complete || !im.naturalWidth) chua.push(k + '→' + MOBS[k].img);
    }
    return { soLoai: ks.length, chua };
  });
  if (!d4.soLoai) fail('④ cảnh dựng hỏng: không loài nào khai img — mệnh đề này vô nghĩa');
  else if (d4.chua.length) fail(`④ ${d4.chua.length}/${d4.soLoai} tấm KHÔNG tải được trong trình duyệt: ` + d4.chua.join(', '));
  else pass(`④ cả ${d4.soLoai} tấm đều tải được thật trong trình duyệt`);

  if (bon04.length) fail('④ có ' + bon04.length + ' lượt 404 vào assets/mobs: ' +
    [...new Set(bon04)].slice(0, 5).join(', '));
  else pass('④ không lượt 404 nào vào assets/mobs');

  console.log('errors:', JSON.stringify(errs));
  console.log(bad === 0 && errs.length === 0 ? 'PASS' : 'FAIL(' + (bad + errs.length) + ')');
  await b.close();
  process.exit(bad === 0 && errs.length === 0 ? 0 : 1);
})();
