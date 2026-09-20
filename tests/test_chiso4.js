// BỐN CHỈ SỐ KIỂU MU: Sức Mạnh · Nhanh Nhẹn · Thể Lực · Năng Lượng.
//
// Trước bản này là NĂM, mang tên kiếm hiệp (Lực Lượng · Mẫn Tiệp · Phòng Ngự · Sinh Lực ·
// Linh Lực) — sót lại nguyên vẹn qua cả đợt chuyển sang MU vì không ai đọc lại bảng ấy.
// Ô "Phòng Ngự" đã gỡ: đo được nó chạm trần `DEFRED_TRAN` sau ~60 điểm rồi thành số chết.
//
// Bài này gác TẦNG HÀNH VI cho phần cân bằng: "lớp X ra sát thương từ chỉ số Y" được chứng
// minh bằng cách RÓT ĐIỂM THẬT rồi đo `player.atk`, không phải bằng cách đọc bảng `atkSrc`.
// Đọc bảng thì một lỗi ở `calcDerived` (đọc nhầm khoá, quên một nhánh) vẫn xanh.
const { chromium } = require('playwright');
const PORT = process.argv[2] || '8853';
const URL = `http://localhost:${PORT}/index.html?max=1`;

let bad = 0;
const fail = m => { bad++; console.log('FAIL ' + m); };
const ok = m => console.log('  ok  ' + m);
const errs = [];

// Đặc tả chủ dự án chốt: dòng sát thương CHÍNH của từng lớp.
const DONG_CHINH = { thieulam:'str', toanchan:'agi', baidasan:'ene', minhgiao:'agi', bug:'ene' };
const TEN = { str:'Sức Mạnh', agi:'Nhanh Nhẹn', vit:'Thể Lực', ene:'Năng Lượng' };
const CU  = ['Lực Lượng', 'Mẫn Tiệp', 'Phòng Ngự', 'Linh Lực'];

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto(URL);
  await p.waitForFunction(() => window.__gameReady).catch(() => {});
  await p.evaluate(() => localStorage.clear());
  await p.reload();
  await p.waitForFunction(() => window.__gameReady).catch(() => {});
  await p.waitForTimeout(500);

  // ══ ① ĐÚNG BỐN Ô, VÀ KHÔNG CÒN TÊN KIẾM HIỆP ════════════════════════════════════════
  const s1 = await p.evaluate(({ TEN, CU }) => {
    window.TEST_MODE = true; startGame('baidasan', { name: 'X' });
    applyTestBoost(); player.level = 60; player.free = 500; calcDerived();
    closePanels(); window.charTab = 'info'; togglePanel('char');
    const t = document.getElementById('panel-char').innerText;
    // đếm Ô RÓT ĐIỂM thật, không đếm chữ: mỗi ô có một nút + gọi addAttr
    const nut = [...document.querySelectorAll('#panel-char .plus-btn')]
      .map(e => (e.getAttribute('onclick') || '').match(/addAttr\('(\w+)'/))
      .filter(Boolean).map(m => m[1]);
    return { khoa: Object.keys(ATTR_INFO).sort(),
             oRot: [...new Set(nut)].sort(),
             thieuTen: Object.values(TEN).filter(n => !t.includes(n)),
             conCu: CU.filter(n => t.includes(n)),
             // rác dấu phẩy động kiểu `4.100000000000001`
             rac: (t.match(/\d\.\d{6,}/g) || []).slice(0, 3) };
  }, { TEN, CU });
  console.log('① ', JSON.stringify(s1));
  if (s1.khoa.join() !== 'agi,ene,str,vit') fail(`ATTR_INFO phải có đúng 4 khoá agi/ene/str/vit, đang là: ${s1.khoa.join()}`);
  if (s1.oRot.join() !== 'agi,ene,str,vit') fail(`bảng Nhân Vật phải có đúng 4 ô rót điểm, đang là: ${s1.oRot.join()}`);
  if (s1.thieuTen.length) fail(`bảng Nhân Vật thiếu tên chỉ số: ${s1.thieuTen.join(', ')}`);
  if (s1.conCu.length) fail(`còn tên kiếm hiệp trên bảng Nhân Vật: ${s1.conCu.join(', ')} — Quy tắc số 1`);
  if (s1.rac.length) fail(`rác dấu phẩy động phơi ra mặt bảng: ${s1.rac.join(', ')}`);
  if (!bad) ok('đúng 4 ô, tên mới, không rác số');

  // ══ ② `def` KHÔNG ĐƯỢC ĂN ĐIỂM NỮA ══════════════════════════════════════════════════
  // Không chốt thì một lời gọi cũ đổ điểm vào ô KHÔNG CÒN AI ĐỌC — mất vĩnh viễn, im lặng.
  const s2 = await p.evaluate(() => {
    player.free = 100; const truoc = player.free, dTruoc = player.def;
    addAttr('def', 50); addAttr('khongcokhoa', 50);
    return { truoc, sau: player.free, defTruoc: dTruoc, defSau: player.def };
  });
  console.log('② ', JSON.stringify(s2));
  if (s2.sau !== s2.truoc) fail(`addAttr('def') vẫn ăn mất ${s2.truoc - s2.sau} điểm — điểm rơi vào ô không ai đọc`);
  else ok("addAttr từ chối khoá đã gỡ, không nuốt điểm");

  // ══ ③ DÒNG SÁT THƯƠNG CỦA TỪNG LỚP — ĐO BẰNG CÁCH RÓT ĐIỂM THẬT ═════════════════════
  const s3 = await p.evaluate((DONG_CHINH) => {
    const ra = {};
    for (const lop of Object.keys(DONG_CHINH)){
      localStorage.clear();
      window.TEST_MODE = true; startGame(lop, { name: 'X' });
      player.level = 120;
      player.traits = []; player.personality = 'trung';   // khử nhiễu: cả hai đều cộng chỉ số
      const atk = {};
      for (const k of ['str', 'agi', 'vit', 'ene']){
        player.str = player.agi = player.vit = player.ene = 5;
        player[k] = 305;                                   // +300 điểm vào đúng một ô
        calcDerived();
        atk[k] = player.atk;
      }
      const xep = Object.entries(atk).sort((a, b) => b[1] - a[1]);
      ra[lop] = { atk, cao: xep[0][0], nhi: xep[1][0],
                  cach: +(xep[0][1] / xep[1][1]).toFixed(3),
                  src: JSON.stringify(SECTS[lop].atkSrc) };
    }
    return ra;
  }, DONG_CHINH);
  for (const [lop, v] of Object.entries(s3)){
    console.log(`③ ${lop}: ${v.src} → cao nhất ${v.cao} (×${v.cach} so với ${v.nhi})`, JSON.stringify(v.atk));
    if (v.cao !== DONG_CHINH[lop])
      fail(`${lop}: rót điểm vào ${v.cao} cho Công Kích cao nhất, nhưng đặc tả nói dòng chính là ${TEN[DONG_CHINH[lop]]} (${DONG_CHINH[lop]})`);
    else if (v.cach < 1.02)
      fail(`${lop}: ${v.cao} chỉ hơn ${v.nhi} ×${v.cach} — dòng chính không tách khỏi dòng khác, người chơi rót kiểu gì cũng như nhau`);
  }
  // Spellblade: Sức Mạnh là dòng PHỤ — phải hơn hai ô không-sát-thương, nhưng kém Nhanh Nhẹn.
  {
    const v = s3.minhgiao;
    if (!(v.atk.str > v.atk.vit && v.atk.str < v.atk.agi))
      fail(`Spellblade: Sức Mạnh phải là dòng PHỤ (hơn Thể Lực, kém Nhanh Nhẹn) — đang là str=${v.atk.str} agi=${v.atk.agi} vit=${v.atk.vit}`);
    else ok(`Spellblade: Nhanh Nhẹn ${v.atk.agi} > Sức Mạnh ${v.atk.str} > Thể Lực ${v.atk.vit} — chính/phụ đúng thứ tự`);
  }

  // ══ ④ NHANH NHẸN PHẢI TĂNG PHÒNG THỦ — ở MỌI lớp ════════════════════════════════════
  const s4 = await p.evaluate(() => {
    const ra = {};
    for (const lop of ['thieulam','toanchan','baidasan','minhgiao','bug']){
      localStorage.clear(); window.TEST_MODE = true; startGame(lop, { name: 'X' });
      player.level = 120; player.traits = []; player.personality = 'trung';
      const d = (a) => { player.str = player.vit = player.ene = 5; player.agi = 5 + a;
        calcDerived(); return +(player.defRed * 100).toFixed(1); };
      ra[lop] = { khong: d(0), it: d(50), nhieu: d(150) };
    }
    return ra;
  });
  console.log('④ ', JSON.stringify(s4));
  for (const [lop, v] of Object.entries(s4)){
    if (!(v.nhieu > v.khong))
      fail(`${lop}: rót Nhanh Nhẹn KHÔNG tăng phòng thủ (${v.khong}% → ${v.nhieu}%) — đây là vai mà ô Phòng Ngự đã gỡ giao lại cho nó`);
  }
  if (!Object.values(s4).some(v => v.nhieu - v.khong >= 3))
    fail('không lớp nào được thêm quá 3 điểm phòng thủ từ 150 Nhanh Nhẹn — vai này chỉ có trên giấy');
  else ok('Nhanh Nhẹn nâng phòng thủ ở cả 5 lớp');

  // ══ ⑤ SAVE ĐỜI CŨ: ĐIỂM PHÒNG NGỰ PHẢI ĐƯỢC HOÀN, VÀ CHỈ MỘT LẦN ════════════════════
  // Xoá trắng là lấy mất của người chơi hàng trăm điểm mà không một dòng nào báo; hoàn hai
  // lần là in tiền. Cả hai đều im lặng.
  const s5 = await p.evaluate(async () => {
    localStorage.clear();
    window.TEST_MODE = true; startGame('thieulam', { name: 'Cũ' });
    player.free = 7; player.def = 205;   // save "đời cũ": 200 điểm đã đổ vào Phòng Ngự
    saveGame();
    const truoc = { free: player.free, def: player.def };
    const l1 = loadGame(0) ? { free: player.free, def: player.def } : null;
    saveGame();
    const l2 = loadGame(0) ? { free: player.free } : null;        // nạp lại lần nữa
    return { truoc, l1, l2 };
  });
  console.log('⑤ ', JSON.stringify(s5));
  if (!s5.l1 || !s5.l2) fail('⑤ không nạp lại được save — phép đo rỗng');
  else {
    if (s5.l1.free !== 207) fail(`hoàn sai: 7 + 200 phải ra 207, đang là ${s5.l1.free}`);
    if (s5.l1.def !== 5) fail(`sau khi hoàn, player.def phải về mức nền 5, đang là ${s5.l1.def}`);
    if (s5.l2.free !== s5.l1.free) fail(`nạp lần hai hoàn THÊM lần nữa (${s5.l1.free} → ${s5.l2.free}) — cờ _diTruDef không chặn được, đây là in tiền`);
    if (bad === 0) ok(`save đời cũ: hoàn 200 điểm, nạp lại lần hai không hoàn thêm`);
  }

  console.log('errors:', JSON.stringify(errs));
  console.log(bad === 0 && errs.length === 0 ? 'PASS' : 'FAIL(' + (bad + errs.length) + ')');
  await b.close();
  process.exit(bad === 0 && errs.length === 0 ? 0 : 1);
})();
