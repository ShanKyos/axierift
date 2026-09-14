// BỊ ĐỘNG CHỈ SỐ — xương sống chung của cây kỹ năng cả 5 lớp.
//
// Game nay có HAI họ bị động, luật ngược nhau, phân biệt bằng trường `chiSo`:
//   • có `chiSo`  → luôn chạy, KHÔNG chiếm ô, nâng cấp được   (7 cái bài này gác)
//   • không có    → phải cắm vào ô 2-4 mới chạy (`biDongBat`)  (6 cái cũ)
// Trộn hai họ vào một luật là hỏng theo một trong hai chiều, và CẢ HAI chiều đều im lặng:
// bắt bị động chỉ số phải cắm ô ⇒ ba ô trống không đủ chỗ cho bảy cái, người chơi vĩnh viễn
// chỉ bật được 3/7; cho bị động hiệu ứng chạy tự do ⇒ mất sạch cái giá của ba ô kia.
const { chromium } = require('playwright');
const PORT = process.argv[2] || '8853';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://localhost:' + PORT + '/index.html');
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(700);
  let bad = 0; const fail = m => { console.log('FAIL ' + m); bad++; };
  const pass = m => console.log('PASS ' + m);

  const r = await p.evaluate(() => {
    window.TEST_MODE = true;
    const LOP = ['thieulam','toanchan','baidasan','minhgiao','bug'];
    const IDS = Object.keys(VOHOC_DEFS).filter(x => laBiDongChiSo(x));
    const o = { ids: IDS, lop: {}, hieuUng: {} };

    // ① tự ngộ theo CẤP ở cả 5 lớp — "học default, không cần mật tịch"
    for (const sc of LOP){
      startGame(sc, null); player.level = 60; player.lvPeak = 60; vhAutoLearn();
      o.lop[sc] = {
        ngo: IDS.filter(x => vhLearned(x)).length,
        tren: IDS.filter(x => (KN_ROT[sc] || []).includes(x)).length,
      };
    }
    // cấp thấp thì CHƯA được ngộ — nếu không thì "mốc cấp" chỉ là số trang trí
    startGame('thieulam', null); player.level = 1; vhAutoLearn();
    o.capThap = IDS.filter(x => vhLearned(x)).map(x => [x, VOHOC_DEFS[x].unlock]);

    // ② mỗi cái đổi ĐÚNG chỉ số của nó, và ③ đổi kể cả khi KHÔNG nằm trên thanh chiêu
    const snap = () => ({ maxHp:player.maxHp, maxQi:player.maxQi, atk:player.atk,
      dDef:player.dDef, crit:+(player.crit*1e4).toFixed(0), eva:+(player.eva*1e4).toFixed(0), vit:player.dVit });
    startGame('thieulam', null); player.level = 110; player.lvPeak = 110; vhAutoLearn();
    player.skillLv = {}; IDS.forEach(x => player.skillLv[x] = 1); calcDerived();
    const nen = snap();
    o.tren0 = IDS.filter(x => (player.skillBar || []).includes(x));   // phải RỖNG
    o.doi = {};
    for (const id of IDS){
      player.skillLv = {}; IDS.forEach(x => player.skillLv[x] = 1);
      player.skillLv[id] = 100; calcDerived();
      const s1 = snap(), d = [];
      for (const k in s1) if (s1[k] !== nen[k]) d.push(k);
      o.doi[id] = d;
    }
    // ⑤ bonus phải LEO theo cấp chiêu, không phải bật/tắt
    player.skillLv = {}; IDS.forEach(x => player.skillLv[x] = 1);
    const thang = [];
    for (const lv of [1, 25, 50, 100]){ player.skillLv.ps_life = lv; calcDerived(); thang.push(player.maxHp); }
    o.thang = thang;

    // ④ KHÔNG cắm vào ô được — cắm được là người chơi đốt một ô lấy con số không
    o.camCam = IDS.map(x => [x, knOHopLe(1, x)]);
    // …và cũng KHÔNG được kéo. Từ chối ở `knOHopLe` thôi thì chưa đủ: ô vẫn kéo được nghĩa là
    // người chơi lôi cả chuỗi bảy ô xuống thanh rồi ăn bảy lần từ chối. Đo trên DOM thật.
    startGame('thieulam', null); player.level = 110; player.lvPeak = 110; vhAutoLearn();
    togglePanel('skill'); window.knTab('lop');
    const _p = document.getElementById('panel-skill');
    o.keo = [];
    for (const nut of _p.querySelectorAll('.kn-o:not(.kn-trong)')){
      const t = (nut.getAttribute('ondragstart') || '').match(/knKeoBatDau\(event,'([^']+)'/);
      if (t) o.keo.push([t[1], nut.getAttribute('draggable')]);
    }
    o.keoChiSo = o.keo.filter(([id]) => IDS.includes(id));
    o.keoKhac  = o.keo.filter(([id]) => !IDS.includes(id));

    // ⑦ bị động HIỆU ỨNG vẫn phải cắm ô mới chạy — hai họ không được nhập làm một
    startGame('thieulam', null); player.level = 110; player.lvPeak = 110; vhAutoLearn(); calcDerived();
    o.hieuUng.ngoai = biDongBat('dk_fortitude');
    knGan(2, 'dk_fortitude'); calcDerived();
    o.hieuUng.trong = biDongBat('dk_fortitude');
    return o;
  });
  console.log(JSON.stringify(r, null, 1));

  if (r.ids.length !== 7) fail(`có ${r.ids.length} bị động chỉ số, mong 7`);
  else pass('7 bị động chỉ số');

  let e1 = 0;
  for (const [sc, d] of Object.entries(r.lop)){
    if (d.ngo !== r.ids.length) fail(`① ${sc}: chỉ ngộ ${d.ngo}/${r.ids.length} ở cấp 60 — phải tự ngộ hết`);
    if (d.tren !== r.ids.length) fail(`① ${sc}: cây chỉ rót ${d.tren}/${r.ids.length} — thiếu thì có chiêu mà không có ô`);
    if (d.ngo !== r.ids.length || d.tren !== r.ids.length) e1++;
  }
  if (r.capThap.length) fail(`① cấp 1 đã ngộ ${JSON.stringify(r.capThap)} — mốc cấp chỉ là số trang trí`);
  else if (!e1) pass(`① cả 5 lớp tự ngộ đủ 7 theo cấp, cấp 1 chưa được cái nào`);

  // ② + ③
  let e2 = 0;
  const MONG = { ps_life:'maxHp', ps_mana:'maxQi', ps_stamina:'vit', ps_atk:'atk',
                 ps_def:'dDef', ps_defrate:'eva', ps_crit:'crit' };
  for (const [id, d] of Object.entries(r.doi)){
    if (!d.length){ fail(`② ${id} không đổi chỉ số nào — chỉ là dòng chữ`); e2++; continue; }
    const k = MONG[id];
    if (k && !d.includes(k)){ fail(`② ${id} đổi ${d.join(',')} nhưng KHÔNG đổi ${k} — nối nhầm chỉ số`); e2++; }
  }
  if (r.tren0.length){ fail(`③ cảnh dựng hỏng: ${r.tren0.join(',')} đang nằm trên thanh, không chứng minh được "luôn chạy"`); e2++; }
  if (!e2) pass('②③ cả 7 đổi đúng chỉ số của mình, và đổi khi KHÔNG nằm trên thanh chiêu');

  // ④
  const camHong = r.camCam.filter(([, ly]) => !ly).map(([x]) => x);
  if (camHong.length) fail(`④ cắm được vào ô: ${camHong.join(', ')} — người chơi đốt một ô lấy con số không`);
  else pass('④ không cái nào cắm vào ô được');

  if (r.keoChiSo.length !== r.ids.length)
    fail(`④ cảnh dựng hỏng: chỉ thấy ${r.keoChiSo.length}/${r.ids.length} ô bị động chỉ số trên cây`);
  else if (!r.keoKhac.some(([, d]) => d === 'true'))
    fail('④ KHÔNG ô nào trên cây kéo được — mệnh đề "bị động chỉ số không kéo được" sẽ xanh giả');
  else {
    const keoHong = r.keoChiSo.filter(([, d]) => d !== 'false').map(([x]) => x);
    if (keoHong.length) fail(`④ kéo được: ${keoHong.join(', ')} — kéo xuống rồi bị từ chối là tệ hơn không kéo`);
    else pass(`④ ${r.keoChiSo.length} ô bị động chỉ số không kéo được, trong khi ô chiêu thường vẫn kéo được`);
  }

  // ⑤
  const t = r.thang;
  if (!(t[0] < t[1] && t[1] < t[2] && t[2] < t[3]))
    fail(`⑤ bonus không leo theo cấp chiêu: ${JSON.stringify(t)}`);
  else pass(`⑤ bonus leo đều theo cấp chiêu (${t.join(' → ')})`);

  // ⑦
  if (r.hieuUng.ngoai !== false || r.hieuUng.trong !== true)
    fail(`⑦ bị động HIỆU ỨNG không còn đòi ô nữa — hai họ đã nhập làm một (${JSON.stringify(r.hieuUng)})`);
  else pass('⑦ bị động hiệu ứng vẫn phải cắm ô — hai họ tách bạch');

  console.log('errors:', JSON.stringify(errs));
  if (errs.length) fail('lỗi trang: ' + errs[0]);
  console.log(bad === 0 ? 'PASS' : 'FAIL(' + bad + ')');
  await b.close();
  process.exit(bad === 0 ? 0 : 1);
})();
