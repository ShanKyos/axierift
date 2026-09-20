// ✦ KHẮC THÂN — sáu Đường Khắc trên thân người chơi.
//
// Hệ này mượn CƠ CHẾ của bảng "kinh mạch" trong một game kiếm hiệp mà chủ dự án đưa ảnh mẫu,
// nhưng TỪ VỰNG thì phải sạch: "kinh mạch · huyệt đạo · chân khí · đả thông" nằm thẳng trong
// danh sách cấm của Quy tắc số 1. Mệnh đề ① gác đúng chỗ đó, và nó là mệnh đề dễ mục nhất —
// một dòng mô tả mới viết vội là đủ kéo cả hệ về lại kiếm hiệp mà không ai thấy.
//
// Bốn dạng hỏng IM LẶNG mà bài này gác:
//   ② bảng hiện "+12% Công Kích" mà `calcDerived` không đọc — khoá không nằm trong sổ P thì
//      vòng đổ sổ bỏ qua nó y như `applyLine()`, không lỗi nào báo.
//   ⑤ save đời trước không có `player.khac` ⇒ cú bấm KHẮC đầu tiên nổ.
//   ⑥ save sửa tay ghi 999 ⇒ `khacAgg()` cộng 999 nấc thuộc tính.
//   ⑦ khung tràn khỏi bảng rồi bị `overflow:hidden` xén — đúng lỗi bản đồ góc màn đã dẫm.
const { chromium } = require('playwright');
const PORT = process.argv[2] || '8853';
const URL = `http://localhost:${PORT}/index.html`;
let bad = 0;
const fail = m => { bad++; console.log('FAIL ' + m); };
const ok = m => console.log('  ok  ' + m);

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto(URL);
  await p.waitForFunction(() => window.__gameReady).catch(() => {});
  await p.evaluate(() => localStorage.clear());
  await p.reload();
  await p.waitForFunction(() => window.__gameReady).catch(() => {});
  await p.waitForTimeout(400);

  // cảnh chuẩn: cấp 120, thừa tài nguyên, chưa khắc nét nào
  const vao = (lv = 120, tien = 5e7) => p.evaluate(([l, g]) => {
    window.TEST_MODE = true;
    startGame('thieulam', { name: 'Thợ Khắc' });
    player.traits = []; player.personality = 'trung';
    player.level = l; vhAutoLearn();
    player.silver = g; player.khi = g; player.khac = {};
    calcDerived();
    document.querySelectorAll('.tut-box,#tut').forEach(e => e.remove());
    closePanels();
  }, [lv, tien]);
  await vao();

  // ── ① TỪ VỰNG: không một chữ kiếm hiệp nào trong text người chơi thấy ───────────────────
  // Quét MỌI chuỗi hệ này sinh ra: tên đường, tên từng Dấu Khắc, mô tả, và cả ba trang đã vẽ
  // ra DOM. Quét mỗi bảng dữ liệu là bỏ sót phần chữ viết thẳng trong hàm vẽ.
  const tv = await p.evaluate(() => {
    const kho = [];
    for (const d of KHAC_DUONG){ kho.push(d.ten, d.vung, d.moTa); }
    for (const id in KHAC_TEN_NUT) kho.push(...KHAC_TEN_NUT[id]);
    kho.push(KHAC_TEN);
    togglePanel('char'); window.charTab = 'khacthan'; renderCharPanel();
    const trang = [];
    for (const t of ['all', ...KHAC_DUONG.map(d => d.id)]){
      window._khacTab = t; renderKhacThan();
      trang.push(document.getElementById('char-content').textContent || '');
    }
    // nhánh CHƯA MỞ cũng phải quét — nó là trang người chơi cấp thấp đọc
    const lv0 = player.level; player.level = 2; renderKhacThan();
    trang.push(document.getElementById('char-content').textContent || '');
    player.level = lv0; renderKhacThan();
    return { kho: kho.join(' | '), trang: trang.join(' | '), soTrang: trang.length };
  });
  const CAM = ['kinh mạch', 'huyệt đạo', 'huyệt vị', 'chân khí', 'đan điền', 'đả thông',
    'tu vi', 'độ kiếp', 'bí kíp', 'môn phái', 'giang hồ', 'tiên hiệp', 'phi thăng',
    'nội công', 'khí công', 'thái cực', 'bát quái', 'ngũ hành', 'kỳ kinh'];
  const het = (tv.kho + ' | ' + tv.trang).toLowerCase();
  const dinh = CAM.filter(w => het.includes(w));
  if (tv.soTrang < 8) fail(`dựng cảnh sai: chỉ quét được ${tv.soTrang} trang, cần 8 (Toàn Bộ + 6 đường + trang khoá)`);
  if (dinh.length) fail(`① từ vựng kiếm hiệp lọt vào Khắc Thân: ${dinh.join(', ')}`);
  else ok(`① sạch từ vựng kiếm hiệp — quét ${tv.soTrang} trang + toàn bộ bảng dữ liệu`);

  // ── ② SỢI DÂY: khắc xong thì CHỈ SỐ THẬT phải đổi ────────────────────────────────────────
  // ⚠ Đo `player.atk`/`maxHp` chứ không đọc `khacAgg()`. Đọc sổ thì một lỗi ở vòng đổ sổ trong
  // calcDerived (khoá không có trong P, đặt nhầm chỗ) vẫn XANH — đúng lối `test_chiso4 §③`.
  const day = await p.evaluate(() => {
    player.khac = {}; calcDerived();
    const t0 = { atk: player.atk, hp: player.maxHp };
    for (const d of KHAC_DUONG) player.khac[d.id] = KHAC_MOI_DUONG;
    calcDerived();
    const t1 = { atk: player.atk, hp: player.maxHp, agg: khacAgg() };
    // mọi khoá phải có đường vào sổ P — nếu không thì bảng hứa suông
    player.khac = {}; calcDerived();
    return { t0, t1, khoa: KHAC_DUONG.map(d => d.k) };
  });
  const dAtk = (day.t1.atk / day.t0.atk - 1) * 100, dHp = (day.t1.hp / day.t0.hp - 1) * 100;
  console.log(`② trọn bộ: atk ${day.t0.atk.toFixed(0)}→${day.t1.atk.toFixed(0)} (+${dAtk.toFixed(1)}%) · máu ${day.t0.hp.toFixed(0)}→${day.t1.hp.toFixed(0)} (+${dHp.toFixed(1)}%)`);
  if (dAtk < 6) fail(`② khắc trọn cả sáu đường mà Công Kích chỉ +${dAtk.toFixed(1)}% — sợi dây tới calcDerived đứt`);
  else if (dHp < 6) fail(`② khắc trọn cả sáu đường mà Sinh Lực chỉ +${dHp.toFixed(1)}% — sợi dây tới calcDerived đứt`);
  else ok(`② chỉ số THẬT đổi theo: +${dAtk.toFixed(1)}% công · +${dHp.toFixed(1)}% máu`);

  // ── ③ MỘT CHIỀU, THEO THỨ TỰ, VÀ CỬA LÀ `khacCan` ───────────────────────────────────────
  const tt = await p.evaluate(() => {
    player.khac = {}; player.silver = 5e7; player.khi = 5e7; player.level = 120; calcDerived();
    const r = {};
    // thiếu tiền → từ chối, và KHÔNG được trừ gì
    player.silver = 0;
    const s0 = player.silver, k0 = player.khi;
    r.lyDoNgheo = khacCan('song');
    khacThem('song');
    r.ngheoKhac = khacDaKhac('song'); r.ngheoTru = (s0 - player.silver) + (k0 - player.khi);
    // đủ tiền → khắc được, trừ đúng
    player.silver = 5e7;
    const nut = khacNutKe('song'), s1 = player.silver, k1 = Math.floor(player.khi);
    khacThem('song');
    r.duKhac = khacDaKhac('song');
    r.truLumen = s1 - player.silver; r.canLumen = nut.gia;
    r.truBn = Math.round(k1 - Math.floor(player.khi)); r.canBn = nut.bn;
    // cấp thấp → từ chối dù thừa tiền.
    // ⚠ PHẢI HẠ CẢ `lvPeak`, KHÔNG CHỈ `player.level`. `khacCan` hỏi `lvPeak()` — mốc DÍNH, cố
    // ý sống qua Tái Sinh (Tái Sinh kéo `level` về 1, mà nét khắc trên thân thì không mất, nên
    // khoá theo `level` là cướp lại thứ người chơi đã trả tiền). Hạ mỗi `level` thì `lvPeak`
    // vẫn 120 và mệnh đề đo một cảnh KHÁC HẲN cảnh nó tưởng đã dựng — đúng thế lượt đầu, và
    // nó báo "khắc được nét chưa tới cấp" trên mã hoàn toàn đúng.
    player.level = 30; player.lvPeak = 30; player.khac.song = KHAC_MOI_DUONG - 1; calcDerived();
    r.dinhSauHa = lvPeak();
    r.lyDoCap = khacCan('song');
    const truoc = khacDaKhac('song'); khacThem('song');
    r.capKhac = khacDaKhac('song') - truoc;
    player.level = 120; player.lvPeak = 120; calcDerived();
    return r;
  });
  console.log('③', JSON.stringify(tt));
  if (!tt.lyDoNgheo || !/Thiếu/.test(tt.lyDoNgheo)) fail(`③ hết Lumen mà khacCan không nêu lý do: ${tt.lyDoNgheo}`);
  if (tt.ngheoKhac !== 0) fail('③ khắc được trong khi không đủ Lumen');
  if (tt.ngheoTru !== 0) fail(`③ bị từ chối mà vẫn trừ tài nguyên (${tt.ngheoTru})`);
  if (tt.duKhac !== 1) fail('③ đủ điều kiện mà không khắc được');
  if (tt.truLumen !== tt.canLumen) fail(`③ trừ sai Lumen: trừ ${tt.truLumen}, giá ${tt.canLumen}`);
  if (tt.truBn !== tt.canBn) fail(`③ trừ sai Bản Năng: trừ ${tt.truBn}, giá ${tt.canBn}`);
  if (tt.dinhSauHa !== 30) fail(`③ dựng cảnh sai: hạ cấp xong lvPeak vẫn ${tt.dinhSauHa}, mệnh đề cấp không đo được gì`);
  if (!tt.lyDoCap || !/cấp/i.test(tt.lyDoCap)) fail(`③ thiếu cấp mà khacCan không nêu lý do: ${tt.lyDoCap}`);
  if (tt.capKhac !== 0) fail('③ khắc được Dấu Khắc chưa tới cấp');
  if (!bad) ok('③ một chiều · theo thứ tự · trừ đúng · từ chối thì không trừ gì');

  // ── ④ THƯỞNG TRỌN ĐƯỜNG và TRỌN CẢ SÁU ──────────────────────────────────────────────────
  const th = await p.evaluate(() => {
    const d = KHAC_DUONG[0];
    player.khac = {}; player.khac[d.id] = KHAC_MOI_DUONG - 1; calcDerived();
    const gan = khacAgg()[d.k];
    player.khac[d.id] = KHAC_MOI_DUONG; calcDerived();
    const tron = khacAgg()[d.k];
    const buoc = khacGiaTriNut(d);
    player.khac = {}; calcDerived();
    const expKhong = khacAgg().expPct;
    for (const x of KHAC_DUONG) player.khac[x.id] = KHAC_MOI_DUONG;
    calcDerived();
    const expTron = khacAgg().expPct;
    // thiếu ĐÚNG một nét ở một đường thì KHÔNG được thưởng chung
    player.khac[KHAC_DUONG[5].id] = KHAC_MOI_DUONG - 1; calcDerived();
    const expThieu1 = khacAgg().expPct;
    player.khac = {}; calcDerived();
    return { gan, tron, buoc, thuong: khacThuongTron(d), expKhong, expTron, expThieu1, mocExp: KHAC_TRON_HET_EXP };
  });
  console.log('④', JSON.stringify(th));
  const nhay = th.tron - th.gan;
  if (nhay <= th.buoc * 1.5) fail(`④ khắc nét cuối không có thưởng trọn đường (nhảy ${nhay.toFixed(2)}, một nét thường ${th.buoc.toFixed(2)})`);
  if (Math.abs(nhay - (th.buoc + th.thuong)) > 0.05) fail(`④ thưởng trọn đường sai: nhảy ${nhay.toFixed(2)}, chờ ${(th.buoc + th.thuong).toFixed(2)}`);
  if (th.expKhong !== 0) fail(`④ chưa khắc gì mà đã có +${th.expKhong}% EXP`);
  if (th.expTron !== th.mocExp) fail(`④ trọn cả sáu mà EXP ra ${th.expTron}, chờ ${th.mocExp}`);
  if (th.expThieu1 !== 0) fail(`④ thiếu ĐÚNG một nét mà vẫn nhận thưởng chung (+${th.expThieu1}% EXP)`);
  else ok(`④ thưởng trọn đường +${th.thuong.toFixed(1)} · trọn cả sáu +${th.expTron}% EXP, thiếu một nét là mất`);

  // ── ⑤ SAVE ĐỜI TRƯỚC (không có `player.khac`) ───────────────────────────────────────────
  // Đi ĐÚNG đường của save cũ: xoá trường → saveGame → loadGame. Xoá tại chỗ rồi bấm thì chỉ
  // kiểm được cái chốt trong chính hàm khắc, không kiểm được dòng vá ở `loadGame`.
  const cu = await p.evaluate(() => {
    player.khac = {}; player.silver = 5e7; player.khi = 5e7; player.level = 120;
    player.khac = { song: 3 };            // có dữ liệu thật để phép xoá CÓ VIỆC để làm
    saveGame();
    const raw = JSON.parse(localStorage.getItem('vlcm_save'));
    // ⚠ BẢN LƯU CÓ NHIỀU Ô NHÂN VẬT: dữ liệu nằm ở `slots[active].player`, không ở gốc. Lượt
    // đầu tôi `delete raw.khac` ở GỐC — xoá một thứ chưa bao giờ ở đó, nên mệnh đề này XANH
    // trong khi nó chưa dựng được cảnh "save đời trước" lấy một lần. Chốt `daXoa` bên dưới là
    // thứ bắt được chuyện đó; không có nó thì que dò hỏng đọc ra y hệt cơ chế chạy đúng.
    const oSlot = raw.slots && raw.slots[raw.active] && raw.slots[raw.active].player;
    const daXoa = !!(oSlot && 'khac' in oSlot);
    if (oSlot) delete oSlot.khac;
    localStorage.setItem('vlcm_save', JSON.stringify(raw));
    let noEx = null;
    try { loadGame(); } catch (e) { return { loi: 'loadGame ném: ' + e }; }
    const co = !!player.khac && typeof player.khac === 'object';
    try { khacThem('song'); } catch (e) { noEx = String(e); }
    return { co, sau: khacDaKhac('song'), noEx, daXoa };
  });
  console.log('⑤', JSON.stringify(cu));
  if (!cu.daXoa) fail('⑤ dựng cảnh sai: không tìm thấy `khac` trong ô nhân vật của bản lưu — phép xoá không xoá gì');
  if (cu.loi) fail('⑤ ' + cu.loi);
  else if (!cu.co) fail('⑤ loadGame không vá `player.khac` cho save đời trước');
  else if (cu.noEx) fail('⑤ bấm KHẮC trên save đời trước thì nổ: ' + cu.noEx);
  else if (cu.sau !== 1) fail(`⑤ save đời trước khắc không ăn (${cu.sau})`);
  else ok('⑤ save đời trước nạp được và khắc được');

  // ── ⑥ SAVE RÁC PHẢI BỊ KẸP ──────────────────────────────────────────────────────────────
  const kep = await p.evaluate(() => {
    player.khac = {}; saveGame();
    const raw = JSON.parse(localStorage.getItem('vlcm_save'));
    const oSlot = raw.slots && raw.slots[raw.active] && raw.slots[raw.active].player;
    if (!oSlot) return { loi: 'không tìm thấy ô nhân vật trong bản lưu' };
    oSlot.khac = { song: 999, nam: -5, gan: 3.7 };
    localStorage.setItem('vlcm_save', JSON.stringify(raw));
    loadGame(); calcDerived();
    const a = khacAgg();
    return { song: player.khac.song, nam: player.khac.nam, gan: player.khac.gan,
      hpPct: a.hpPct, tranHp: KHAC_MAP.song.tong };
  });
  console.log('⑥', JSON.stringify(kep));
  if (kep.loi) fail('⑥ ' + kep.loi); else
  if (kep.song !== 12) fail(`⑥ save ghi 999 mà không kẹp: còn ${kep.song}`);
  if (kep.nam !== undefined) fail(`⑥ số âm trong save không bị dọn: ${kep.nam}`);
  if (kep.hpPct > kep.tranHp + 0.01) fail(`⑥ thuộc tính vượt trần: ${kep.hpPct} > ${kep.tranHp}`);
  else ok(`⑥ save rác bị kẹp về ${kep.song}/12, thuộc tính không vượt trần ${kep.tranHp}`);

  // ── ⑦ KHÔNG TRÀN BẢNG, ở BA bề rộng khung nhìn ──────────────────────────────────────────
  // Ở đúng một bề rộng thì mọi cách bày đều xanh — cùng bài học `test_muigio` và bản đồ góc màn.
  for (const [w, h] of [[1280, 720], [1440, 900], [1920, 1080]]){
    await p.setViewportSize({ width: w, height: h });
    const r = await p.evaluate(() => {
      player.level = 120; player.silver = 5e7; player.khi = 5e7;
      player.khac = { song: 12, nam: 7 }; calcDerived();
      closePanels(); togglePanel('char'); window.charTab = 'khacthan';
      window._khacTab = 'nam'; renderCharPanel();
      const pan = document.getElementById('panel-char'), pr = pan.getBoundingClientRect();
      let tran = 0, dem = 0;
      for (const e of pan.querySelectorAll('.khac-khung,.khac-soi,.khac-than,.khac-doc,.khac-tong')){
        const q = e.getBoundingClientRect(); dem++;
        tran = Math.max(tran, Math.round(Math.max(pr.left - q.left, q.right - pr.right)));
      }
      // sợi Dấu Khắc phải VẼ RA THẬT — khung rỗng cũng "không tràn"
      const soi = pan.querySelector('.khac-soi');
      return { tran, dem, cham: soi ? soi.querySelectorAll('circle').length : 0,
        net: soi ? soi.querySelectorAll('line').length : 0 };
    });
    if (r.dem < 4) fail(`⑦ ${w}x${h}: dựng cảnh sai, chỉ thấy ${r.dem} khối`);
    else if (r.cham !== 12) fail(`⑦ ${w}x${h}: sợi vẽ ${r.cham} chấm, phải là 12`);
    else if (r.net !== 11) fail(`⑦ ${w}x${h}: sợi vẽ ${r.net} nét nối, phải là 11`);
    else if (r.tran > 0) fail(`⑦ ${w}x${h}: khối Khắc Thân TRÀN ${r.tran}px ra ngoài bảng`);
    else ok(`⑦ ${w}x${h}: 12 chấm · 11 nét · không tràn`);
  }
  await p.setViewportSize({ width: 1600, height: 900 });

  // ── ⑧ CẤP MỞ PHẢI VỚI TỚI ĐƯỢC, và nét CUỐI không được vượt trần cấp ────────────────────
  // Bài học "CỬA CƠ CHẾ MỞ Ở CẤP NÀO": hỏi *đếm được không* rồi phải hỏi tiếp *ai cũng tới
  // được không*. Một Dấu Khắc đòi cấp 121 là một ô không ai khắc nổi, và không lỗi nào báo.
  const cap = await p.evaluate(() => {
    let min = 1e9, max = 0;
    for (const d of KHAC_DUONG) for (let i = 0; i < KHAC_MOI_DUONG; i++){
      const c = khacCapNut(d, i); min = Math.min(min, c); max = Math.max(max, c);
      // trong một đường, cấp phải TĂNG DẦN — không thì nét sau mở trước nét trước
      if (i > 0 && khacCapNut(d, i) < khacCapNut(d, i - 1)) return { loi: `${d.id} nét ${i} tụt cấp` };
    }
    return { min, max, tran: MAX_LV, moTab: (CHAR_TABS.find(t => t.id === 'khacthan') || {}).lv, moCo: KHAC_LV };
  });
  console.log('⑧', JSON.stringify(cap));
  if (cap.loi) fail('⑧ ' + cap.loi);
  else if (cap.max > cap.tran) fail(`⑧ có Dấu Khắc đòi cấp ${cap.max} > trần ${cap.tran} — không ai khắc nổi`);
  else if (cap.min < cap.moCo) fail(`⑧ có Dấu Khắc đòi cấp ${cap.min} < cấp mở hệ ${cap.moCo}`);
  else if (cap.moTab >= cap.moCo) fail(`⑧ tab hiện ở cấp ${cap.moTab} = cấp mở cơ chế ⇒ chip 🔒 là nút bấm không ra gì`);
  else ok(`⑧ cấp Dấu Khắc trải ${cap.min}→${cap.max} (trần ${cap.tran}) · tab hiện từ cấp ${cap.moTab}, cơ chế mở ở ${cap.moCo}`);

  console.log('errors:', JSON.stringify(errs));
  console.log(bad === 0 && errs.length === 0 ? 'PASS' : 'FAIL(' + (bad + errs.length) + ')');
  await b.close();
  process.exit(bad === 0 && errs.length === 0 ? 0 : 1);
})();
