// HAI GÓI SPELLBLADE + MẶC LẪN BỘ TỪNG MÓN — gác đúng ý chủ dự án chốt (2026-09-24):
//   *"Option 1 chính là hình nhân vật đang ở trong thành, mang wing và cánh đi lại. Option 2 sẽ
//    thể hiện character đang ở ngoài thành, mang kiếm ra skill và đi giết quái vật."*
//   *"chia lại từng món đồ của từng set để users có thể mặc các món khác nhau"*
//
//   node tests/test_goimr.js [cổng]
//
//   ① TRONG THÀNH: gói `town_v1` vẽ, nhân vật KHÔNG bay (đi bộ), cánh vẽ rời TẮT (gói tự có cánh)
//   ② NGOÀI THÀNH: gói `field_v2` vẽ, nhân vật bay; đòn thường ra khối Light Slash ('gl')
//   ③ MẶC LẪN BỘ: đổi MỖI cái quần thì phần CHÂN đổi còn phần NGỰC đứng yên — và ngược lại với áo
//   ④ tháo một ô ⇒ lớp của ô đó biến mất (lộ thân nền), không phải cả bộ cũ vẫn nằm đó
//   ⑤ vũ khí theo mức rèn: +0 và +11 ra hai bản vật liệu khác nhau
//   ⑥ tám hướng ngoài thành là tám tư thế khác nhau (gói có đủ 8 hàng, không phải một slice)
//
// ⚠ Đo trên KHUNG DỰNG SẴN của `mrVe()` (tấm NV_OW×NV_OH, không nền), không đo cả màn hình: nền
//   map, mây, con Axie đều động theo đồng hồ và nuốt tín hiệu — vết sẹo đã ghi ở `test_dongbodo`.
const { chromium } = require('playwright');
const CONG = process.argv[2] || '8853';
let loi = 0;
const fail = (m) => { loi++; console.log('FAIL', m); };
const pass = (m) => console.log('PASS', m);

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto(`http://localhost:${CONG}/index.html`);
  await p.waitForFunction(() => window.__gameReady, null, { timeout: 60000 });
  await p.evaluate(() => { window.TEST_MODE = true; startGame('minhgiao', null); });
  const san = await p.evaluate(async () => {
    for (let i = 0; i < 150 && !(mrCoThanh('minhgiao') && mrCoNgoai('minhgiao')); i++) await new Promise(z => setTimeout(z, 200));
    return { thanh: mrCoThanh('minhgiao'), ngoai: mrCoNgoai('minhgiao') };
  });
  if (!san.thanh || !san.ngoai) { console.log('QUE DÒ HỎNG: hai gói không nạp được', JSON.stringify(san)); process.exit(1); }

  // ── mặc từng ô theo DÒNG ──
  await p.evaluate(() => {
    window.__mac = (bo, vkPlus) => {
      for (const o in bo){
        if (!bo[o]) { player.equip[o] = null; continue; }
        const it = genItem(60, null, null, { slots: [o], perfect: 0 });
        it.def = `minhgiao_${bo[o]}_3_${o}`; it.tier = 4; it.plus = 0; player.equip[o] = it;
      }
      if (vkPlus != null){
        const w = genItem(60, null, null, { slots: ['vukhi'], perfect: 0 });
        w.def = 'minhgiao_hoa_tinh_kiem_3'; w.tier = 4; w.plus = vkPlus; player.equip.vukhi = w;
      }
      calcDerived();
    };
    // Khung dựng + vùng alpha theo dải dọc (0..1 của chiều cao khung), đợi art về.
    window.__khung = async (blk, idx, huong) => {
      let t = null;
      for (let i = 0; i < 100 && !t; i++){ t = mrVe('minhgiao', 4, gearVisual(player), blk, idx, huong); if (!t) await new Promise(z => setTimeout(z, 150)); }
      return t ? t.getContext('2d').getImageData(0, 0, t.width, t.height) : null;
    };
    window.__lech = (A, B, y0, y1) => {
      if (!A || !B) return -1;
      let d = 0; const W = A.width, H = A.height;
      for (let y = Math.floor(H * y0); y < Math.floor(H * y1); y++) for (let x = 0; x < W; x++){
        const i = (y * W + x) * 4;
        if (Math.abs(A.data[i]-B.data[i]) + Math.abs(A.data[i+1]-B.data[i+1]) + Math.abs(A.data[i+2]-B.data[i+2]) + Math.abs(A.data[i+3]-B.data[i+3]) > 40) d++;
      }
      return d;
    };
  });

  // ① TRONG THÀNH
  const r1 = await p.evaluate(async () => {
    travelTo('ardhaven'); player.avatar = null;
    __mac({ non:'vai_tho', ao:'ma_thuat', tay:'ma_thuat', quan:'ma_thuat', chan:'ma_thuat' }, 0);
    player.equip.canh = genWing('minhgiao', 1); calcDerived();
    for (let i = 0; i < 40; i++){ update(1/60); render(); await new Promise(z => setTimeout(z, 16)); }
    // ⚠ Đọc gói nào vẽ bằng cách gọi thẳng `mrVe` với ĐÚNG khối drawPlayer vừa chọn: sprite đã
    //   nằm trong bộ đệm của heroSprite nên render() lần hai không gọi lại mrVe (lượt đầu ra null).
    const k0 = window.__mrKhoi; window.__mrGoiVe = null;
    mrVe('minhgiao', 4, gearVisual(player), k0.blk, 0, 2);
    return { tt: avaTrongThanh(), k: k0, goi: window.__mrGoiVe,
             canhRoi: (window.__mrCanhRoi || {})[veKhoa(player)] };
  });
  console.log('① trong thành:', JSON.stringify(r1));
  if (!r1.tt) fail('① QUE DÒ: ardhaven không được coi là trong thành');
  else {
    if (!r1.k || !r1.k.thanh) fail('① drawPlayer không nhận ra đang ở trong thành');
    if (r1.k && r1.k.bay > 0.5) fail(`① trong thành mà nhân vật đang BAY (cao ${r1.k.bay}) — gói 1 là đi bộ`);
    if (r1.k && !['i', 'w', 'r'].includes(r1.k.blk)) fail(`① trong thành ra khối '${r1.k.blk}', phải là đứng/đi/chạy`);
    if (r1.goi !== 'thanh') fail(`① trong thành không vẽ bằng gói town_v1 (vẽ: ${r1.goi})`);
    if (r1.canhRoi !== false) fail('① trong thành vẫn bật cánh vẽ rời — gói đã có lớp cánh, hai đôi cánh');
    if (!loi) pass('① trong thành: gói town_v1 · đi bộ · cánh của gói, không bay');
  }

  // ② NGOÀI THÀNH
  const r2 = await p.evaluate(async () => {
    travelTo('daohoa'); player.avatar = null; moveTarget = null;
    const xa = () => { for (const m of mobs){ m.x = -9999; m.y = -9999; } };
    // Đi trước: khối bay-đi 'fm' phải bật khi đang di chuyển…
    moveTarget = { x: player.x + 400, y: player.y };
    const khiDi = new Set();
    for (let i = 0; i < 30; i++){ xa(); update(1/60); render(); if (player.moving) khiDi.add(window.__mrKhoi.blk); await new Promise(z => setTimeout(z, 16)); }
    window.__khiDi = [...khiDi];
    // …rồi đứng yên cho tới khi hết trôi.
    moveTarget = null;
    for (let i = 0; i < 40; i++){ xa(); update(1/60); render(); await new Promise(z => setTimeout(z, 16)); }
    const k0 = window.__mrKhoi; window.__mrGoiVe = null;
    mrVe('minhgiao', 4, gearVisual(player), k0.blk, 0, 2);
    const dung = { k: k0, goi: window.__mrGoiVe, tt: avaTrongThanh() };
    player.atkAnim = 0.2; player.atkAct = 'slash'; render();
    return { ...dung, danh: window.__mrKhoi && window.__mrKhoi.blk, khiDi: window.__khiDi };
  });
  console.log('② ngoài thành:', JSON.stringify(r2));
  if (r2.tt) fail('② QUE DÒ: daohoa bị coi là trong thành');
  else {
    const l0 = loi;
    if (!r2.k || r2.k.thanh) fail('② ngoài thành mà drawPlayer tưởng đang trong thành');
    if (r2.k && r2.k.blk !== 'f') fail(`② ngoài thành ĐỨNG YÊN ra khối '${r2.k.blk}', phải là bay đứng 'f' (không phải bay-đi 'fm')`);
    if (!(r2.khiDi || []).length || !r2.khiDi.every(k => k === 'fm')) fail(`② ngoài thành ĐANG ĐI ra khối ${JSON.stringify(r2.khiDi)}, phải là bay-đi 'fm'`);
    if (r2.goi !== 'ngoai') fail(`② ngoài thành không vẽ bằng gói field_v2 (vẽ: ${r2.goi})`);
    if (r2.danh !== 'gl') fail(`② đòn thường ngoài thành ra khối '${r2.danh}', phải là Light Slash 'gl'`);
    if (loi === l0) pass('② ngoài thành: gói field_v2 · bay đứng f / bay đi fm · đòn thường = Light Slash');
  }

  // ③ ④ MẶC LẪN BỘ — đo ở cả hai gói
  for (const [ten, blk] of [['thành', 'i'], ['ngoài', 'f']]){
    const r3 = await p.evaluate(async (blk) => {
      const goc = { non:'ma_thuat', ao:'ma_thuat', tay:'ma_thuat', quan:'ma_thuat', chan:'ma_thuat' };
      __mac(goc, null); const A = await __khung(blk, 0, 2);
      __mac({ quan:'cuong_phong' }, null); const B = await __khung(blk, 0, 2);          // chỉ đổi quần
      __mac({ quan:'ma_thuat', ao:'cuong_phong' }, null); const C = await __khung(blk, 0, 2); // chỉ đổi áo
      __mac({ ao:'ma_thuat', quan:null }, null); const D = await __khung(blk, 0, 2);   // tháo quần
      // Toàn khung cho phần đổi (tư thế bay co chân lên cao, một dải cố định bắt hụt), dải NGỰC
      // cố định cho phần phải đứng yên.
      return { quanNguc: __lech(A, B, 0.20, 0.40), quanChan: __lech(A, B, 0, 1),
               aoNguc: __lech(A, C, 0, 1), thaoQuan: __lech(A, D, 0, 1) };
    }, blk);
    console.log(`③ ${ten}:`, JSON.stringify(r3));
    const l0 = loi;
    if (r3.quanChan < 200) fail(`③ ${ten}: đổi MỖI cái quần mà phần chân chỉ đổi ${r3.quanChan} điểm ảnh — quần không vẽ theo ô`);
    if (r3.quanNguc > r3.quanChan * 0.25) fail(`③ ${ten}: đổi quần mà phần ngực cũng đổi ${r3.quanNguc} điểm — lớp quần lan lên áo`);
    if (r3.aoNguc < 200) fail(`③ ${ten}: đổi MỖI cái áo mà phần ngực chỉ đổi ${r3.aoNguc} điểm ảnh`);
    if (r3.thaoQuan < 200) fail(`④ ${ten}: tháo quần mà phần chân chỉ đổi ${r3.thaoQuan} điểm — quần cũ vẫn nằm đó`);
    if (loi === l0) pass(`③④ ${ten}: đổi/tháo từng ô chỉ đổi đúng phần thân của ô đó`);
  }

  // ⑤ vũ khí theo mức rèn
  const r5 = await p.evaluate(async () => {
    __mac({ non:'ma_thuat', ao:'ma_thuat', tay:'ma_thuat', quan:'ma_thuat', chan:'ma_thuat' }, 0);
    const A = await __khung('f', 0, 2);
    __mac({}, 11); const B = await __khung('f', 0, 2);
    return { lech: __lech(A, B, 0, 1), ban0: mrVkBan(MR_NGOAI.weapons[0], 0), ban11: mrVkBan(MR_NGOAI.weapons[0], 11) };
  });
  console.log('⑤ rèn:', JSON.stringify(r5));
  if (r5.ban0 === r5.ban11) fail('⑤ +0 và +11 trỏ cùng một tệp vật liệu');
  else if (r5.lech < 150) fail(`⑤ vũ khí +0 và +11 chỉ lệch ${r5.lech} điểm ảnh`);
  else pass(`⑤ vũ khí +0 → +11 đổi vật liệu (${r5.lech} điểm ảnh)`);

  // ⑥ tám hướng ngoài thành
  const r6 = await p.evaluate(async () => {
    const K = []; for (let h = 0; h < 8; h++) K.push(await __khung('f', 0, h));
    let trung = 0; for (let h = 0; h < 8; h++) for (let k = h + 1; k < 8; k++) if (__lech(K[h], K[k], 0, 1) < 200) trung++;
    return { trung };
  });
  console.log('⑥ tám hướng:', JSON.stringify(r6));
  if (r6.trung) fail(`⑥ ${r6.trung} cặp hướng bay ra CÙNG một tư thế — gói có 8 hàng, đang đọc nhầm hàng`);
  else pass('⑥ tám hướng bay là tám tư thế khác nhau');

  if (errs.length) fail('lỗi trang: ' + errs.slice(0, 3).join(' | '));
  console.log(loi ? `\n${loi} FAIL` : '\nTẤT CẢ XANH');
  await b.close();
  process.exit(loi ? 1 : 0);
})();
