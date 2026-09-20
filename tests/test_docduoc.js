// ĐỌC ĐƯỢC TRÊN MÀN — hai chỗ QA chấm mảng này **5,0/10**, cả hai đo được.
//
//  ① NHẬT KÝ CẮT CỤT MỌI DÒNG. Cột 186px + `white-space:nowrap` + `text-overflow:ellipsis` ⇒
//    đo được **30/31 dòng bị cắt**, và phần bị cắt LUÔN là phần thưởng: `☠ Hạ Axie Heo Rừng —
//    Nhận: +28 EXP +17◈` cụt đúng ở chữ "Nhận". Kèm theo, ba dòng tần suất cao (đánh ra · ăn
//    vào · phản) bắn mỗi cú một dòng: 15/31 dòng là `⚔` trong một lượt đo.
//  ② QUÁI CHÌM VÀO ĐẤT. `Axie Heo Rừng` là khối NÂU trên LỐI MÒN NÂU ở Rẻo Rừng Corran.
//    ⚠ Báo cáo QA đổ cho *"thanh máu chỉ hiện khi đã bị đánh"* — SAI, thanh máu vẽ vô điều kiện
//    và lệnh `return` của nhãn nằm SAU nó. Kết luận của họ đúng, nguyên nhân họ nêu thì không.
//
// ⚠ MỆNH ĐỀ ② ĐO **NĂNG LƯỢNG BIÊN**, KHÔNG ĐO LỆCH CHUẨN. Đã thử lệch chuẩn trong ô 26px
// trước và nó MÙ: 42,1 → 41,6 (nó đo tương phản BÊN TRONG con vật, thứ vốn đã cao, chứ không đo
// việc con vật có tách khỏi nền không). Cùng họ với ba phép đo mù đã ghi cho Bãi Farm.
// Và cảnh phải GHIM — quái/decor bốc lại mỗi `travelTo`, đo hai cảnh khác nhau là so hai thứ
// không so được.
//
// Chạy độc lập:  node tests/test_docduoc.js [cổng]
const { chromium } = require('playwright');
const CONG = process.argv[2] || '8853';
let bad = 0;
const fail = m => { console.log('FAIL ' + m); bad++; };
const pass = m => console.log('PASS ' + m);

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e).slice(0, 160)));
  await page.goto(`http://localhost:${CONG}/index.html?test=1`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__gameReady).catch(() => {});

  // ── ① NHẬT KÝ: KHÔNG dòng nào bị cắt, và dòng THƯỞNG phải đọc đủ ──
  const nk = await page.evaluate(() => {
    window.TEST_MODE = true; localStorage.clear(); startGame('thieulam', null);
    player.tutStep = -1; travelTo('corran'); player.level = 5; calcDerived();
    for (let i = 0; i < 900; i++){ update(1 / 60); if (i % 3 === 0 && typeof doBasic === 'function') doBasic(); }
    const rows = [...document.querySelectorAll('#combat-log .cl-row')];
    const cat = rows.filter(r => r.scrollWidth > r.clientWidth + 1);
    const thuong = rows.filter(r => /Nhận:/.test(r.textContent));
    return { tong: rows.length, cat: cat.length,
             viDuCat: cat.slice(0, 2).map(r => r.textContent.slice(0, 44)),
             soThuong: thuong.length,
             thuongCat: thuong.filter(r => r.scrollWidth > r.clientWidth + 1).length,
             thuongDu: thuong.length ? /\+\d+ EXP.*◈/.test(thuong[0].textContent) : false,
             rong: document.getElementById('combat-log').clientWidth };
  });
  if (nk.tong < 8) fail(`① cảnh dựng: nhật ký chỉ có ${nk.tong} dòng, chưa đủ để đo`);
  else if (nk.cat > 0) fail(`① ${nk.cat}/${nk.tong} dòng nhật ký bị cắt cụt (cột ${nk.rong}px) — vd: ${nk.viDuCat.join(' · ')}`);
  else pass(`① 0/${nk.tong} dòng bị cắt (cột ${nk.rong}px)`);
  if (!nk.soThuong) fail('① cảnh dựng: không hạ được con nào nên không có dòng thưởng để đo');
  else if (nk.thuongCat > 0 || !nk.thuongDu) fail(`① dòng thưởng vẫn cụt (${nk.thuongCat} bị cắt · đủ EXP+Lumen: ${nk.thuongDu})`);
  else pass('① dòng thưởng đọc đủ cả EXP lẫn Lumen');

  // ── ② NHẬT KÝ GỘP: dòng lặp phải cộng dồn, đòn ĐẶC BIỆT vẫn giữ dòng riêng ──
  const gop = await page.evaluate(() => {
    const log = () => [...document.querySelectorAll('#combat-log .cl-row')].map(r => r.textContent);
    localStorage.clear(); startGame('thieulam', null); player.tutStep = -1;
    travelTo('corran'); player.level = 1; calcDerived();
    const m = mobs.find(x => x.hp > 0);
    if (!m) return { loi: 'không có quái' };
    m.maxHp = 9e5; m.hp = 9e5;                       // con TRÂU: nhiều cú mới chết
    document.getElementById('combat-log').innerHTML = '';
    // ⚠ GHIM MẠCH NGẪU NHIÊN. `HOÀN HẢO` bốc xúc xắc mỗi cú, nên tám cú tự nhiên hay bị cắt
    // thành hai ba cụm — và mệnh đề "8 → 1 dòng" đỏ theo may rủi chứ không theo lỗi. Ghim
    // `Math.random` thì cả tám cú cùng một loại, đúng cái tính chất cần gác: hai cú LIÊN TIẾP
    // CÙNG LOẠI thì phải gộp.
    const _rnd = Math.random; Math.random = () => 0.5;
    for (let i = 0; i < 8; i++) hurtMob(m, 20, 'hit');
    Math.random = _rnd;
    const danh = log();
    document.getElementById('combat-log').innerHTML = '';
    hurtMob(m, 20, 'hit'); hurtMob(m, 20, 'crit'); hurtMob(m, 20, 'hit');
    return { danh, crit: log() };
  });
  if (gop.loi) fail('② cảnh dựng: ' + gop.loi);
  else {
    // ⚠ Ở map này vũ khí thường KHẮC HỆ đàn heo ⇒ 8/8 cú mang tiền tố. Bản đầu của phép gộp
    // loại trừ đòn đặc biệt nên nó KHÔNG gộp được gì ở đúng chỗ cần nhất — mệnh đề này gác chỗ đó.
    if (gop.danh.length !== 1) fail(`② tám cú đánh liên tiếp cùng mục tiêu ra ${gop.danh.length} dòng, đáng lẽ gộp còn 1 — ${gop.danh.slice(0,3).join(' | ')}`);
    else if (!/×8/.test(gop.danh[0])) fail(`② gộp rồi nhưng không nói số lần: "${gop.danh[0]}"`);
    else pass(`② 8 cú → 1 dòng: "${gop.danh[0]}"`);
    const coBk = gop.crit.filter(t => /bạo kích/.test(t)).length;
    if (gop.crit.length < 3 || coBk !== 1) fail(`② bạo kích bị gộp mất dòng riêng — ${gop.crit.join(' | ')}`);
    else pass('② bạo kích vẫn giữ dòng riêng, không bị gộp vào đòn thường');
  }

  // ── ③ QUÁI TÁCH KHỎI ĐẤT: viền phải THÊM năng lượng biên tại đúng chỗ con quái đứng ──
  // ⚠ ĐO A/B TRÊN CÙNG MỘT KHUNG, ĐỪNG SO VỚI "NỀN". Đã thử so biên-tại-quái với biên-tại-nền
  // hai lần và cả hai lần đều hỏng: ô đối chứng chọn cứng thì rơi trúng đồ (map có **102 con**),
  // còn ô chọn "chắc chắn trống" thì lại vướng đường ghép viên lát — nền đo ra 1,8 hay 4,9 tuỳ
  // chỗ lấy mẫu, tức nó KHÔNG phải một cái mốc. Bật/tắt chính cơ chế rồi đo lại ĐÚNG những điểm
  // ảnh ấy thì nền là hằng số và nó tự triệt tiêu.
  const bien = await page.evaluate(() => {
    localStorage.clear(); startGame('thieulam', null); player.tutStep = -1; travelTo('corran');
    const sp = mapDef().spawn; player.x = sp.x; player.y = sp.y;
    const gan = mobs.filter(x => x.hp > 0)
      .sort((a, c) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(c.x - player.x, c.y - player.y)).slice(0, 6);
    if (gan.length < 4) return { loi: 'chỉ có ' + gan.length + ' con quanh điểm thả' };
    gan.forEach((m, i) => { m.x = player.x - 200 + i * 80; m.y = player.y - 120; m.hitT = 0; });
    snapCamera();
    const cv = document.querySelector('canvas'), cx = cv.getContext('2d');
    const tl = cv.width / cv.getBoundingClientRect().width, zo = ZOOM_MUC[ZOOM_CHON];
    const nl = (wx, wy, r) => {
      const sx = (wx - camera.x) * zo * tl, sy = (wy - camera.y) * zo * tl;
      const x0 = Math.round(sx - r), y0 = Math.round(sy - r), w = 2 * r;
      if (x0 < 0 || y0 < 0 || x0 + w > cv.width || y0 + w > cv.height) return null;
      const d = cx.getImageData(x0, y0, w, w).data;
      const L = i => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      let g = 0, n = 0;
      for (let y = 0; y < w - 1; y++) for (let x = 0; x < w - 1; x++){
        const i = (y * w + x) * 4; g += Math.abs(L(i) - L(i + 4)) + Math.abs(L(i) - L(i + w * 4)); n++;
      }
      return g / n;
    };
    const tb = a => a.length ? a.reduce((x, c) => x + c, 0) / a.length : null;
    const doMot = () => { for (let i = 0; i < 6; i++) render();
      return tb(gan.map(m => nl(m.x, m.y - 10, 30)).filter(v => v != null)); };
    const _cu = SETTINGS.lowFx;
    SETTINGS.lowFx = false; const co = doMot();
    SETTINGS.lowFx = true;  const khong = doMot();
    SETTINGS.lowFx = _cu;
    return { soQuai: gan.length, coVien: co, khongVien: khong };
  });
  if (bien.loi) fail('③ cảnh dựng: ' + bien.loi);
  else if (bien.coVien == null || bien.khongVien == null) fail('③ cảnh dựng: ô đo rơi ngoài canvas');
  else {
    const them = (bien.coVien / bien.khongVien - 1) * 100;
    if (them < 12) fail(`③ viền không thêm được biên cho con quái: có viền ${bien.coVien.toFixed(1)} · không viền ${bien.khongVien.toFixed(1)} (+${them.toFixed(1)}%)`);
    else pass(`③ viền thêm +${them.toFixed(1)}% năng lượng biên tại quái (${bien.khongVien.toFixed(1)} → ${bien.coVien.toFixed(1)})`);
  }

  // ── ④ VÒNG CHÂN vẽ cho MỌI con còn sống, kể cả con KHÔNG có hệ ──
  // Vòng chân là thứ trả lời "đây là sinh vật, không phải địa hình"; gắn nó vào `mobHe` như bản
  // cũ thì con nào chưa khai hệ mất hẳn tín hiệu đó.
  // ⚠ ĐỪNG ĐẾM LỜI GỌI `ctx.ellipse`. Bản đầu của mục này làm thế và phép thử ngược ĐỎ LẶNG:
  // riêng bóng đổ đã hai ellipse mỗi con, nên "số ellipse ≥ số quái" đúng ở mọi trạng thái, kể cả
  // khi vòng chân bị gỡ sạch. Hỏi thẳng quyết định mà `drawMob` thật sự lấy.
  const vong = await page.evaluate(() => {
    localStorage.clear(); startGame('thieulam', null); player.tutStep = -1; travelTo('corran');
    const sp = mapDef().spawn; player.x = sp.x; player.y = sp.y; snapCamera();
    // gỡ hệ của ba con rồi kéo chúng vào đúng trước mặt — con không hệ vẫn phải có vòng
    const q = mobs.filter(x => x.hp > 0)
      .sort((a, c) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(c.x - player.x, c.y - player.y)).slice(0, 3);
    q.forEach((m, i) => { m.he = null; m.def = Object.assign({}, m.def, { el: null });
                          m.x = player.x - 90 + i * 90; m.y = player.y - 110; });
    window.__vongChan = new Set();
    render();
    // ⚠ `camera.x` là góc TRÊN-TRÁI của khung, không phải tâm — `Math.abs(m.x - camera.x) < VW`
    // gom cả những con nằm ngoài mép trái rồi đòi chúng phải có vòng, và bài đỏ 17/21 trên mã
    // ĐÚNG. Toạ độ màn = thế giới − camera, kẹp trong [0, VW] × [0, VH].
    const trongKhung = mobs.filter(m => { const sx = m.x - camera.x, sy = m.y - camera.y;
      return m.hp > 0 && sx > 40 && sx < VW - 40 && sy > 40 && sy < VH - 40; });
    return { khongHe: q.length, khongHeCoVong: q.filter(m => window.__vongChan.has(m)).length,
             trongKhung: trongKhung.length, coVong: trongKhung.filter(m => window.__vongChan.has(m)).length };
  });
  if (vong.khongHe < 3) fail('④ cảnh dựng: không gỡ được hệ của đủ ba con');
  else if (vong.khongHeCoVong < vong.khongHe) fail(`④ ${vong.khongHe - vong.khongHeCoVong}/${vong.khongHe} con KHÔNG khai hệ bị bỏ vòng chân — đúng lỗ của bản cũ`);
  else pass(`④ cả ${vong.khongHe} con không khai hệ đều có vòng chân`);
  if (!vong.trongKhung) fail('④ cảnh dựng: không con nào trong khung để đo');
  else if (vong.coVong < vong.trongKhung) fail(`④ chỉ ${vong.coVong}/${vong.trongKhung} con trong khung có vòng chân`);
  else pass(`④ ${vong.coVong}/${vong.trongKhung} con trong khung đều có vòng chân`);

  if (errors.length) fail('LỖI JS: ' + errors.slice(0, 3).join(' | '));
  else pass('không lỗi JS');
  console.log(bad ? `\n${bad} FAIL` : '\nTẤT CẢ PASS');
  await browser.close();
  process.exit(bad ? 1 : 0);
})();
