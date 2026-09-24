// Spellblade: BẢY DÒNG VŨ KHÍ + BẢY DÒNG GIÁP của gói `magic-runtime`, và LUÔN BAY.
//
// Chủ dự án chốt: "chia trang bị và vũ khí thành 7 class khác nhau … 7 dòng vũ khí và 7 lớp trang
// bị riêng, tức nó tách ra và theo process của game, nhân vật có thể trang bị tuỳ ý" + "bỏ phần
// nhân vật đi bộ đi … by default hãy cho nhân vật đang bay và mang cánh cấp 1 (Magic trước)".
//
// Tám mệnh đề. Phần lớn lái bằng hàm THẬT của game (mrVe · drawPlayer · itemDef · canhMacDinh),
// không đọc bảng rồi tự kết luận: chỗ dễ hỏng là sợi dây từ món đang mặc tới hình vẽ ra.
const { chromium } = require('playwright');
const PORT = process.argv[2] || '8853';

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1100, height: 700 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto(`http://localhost:${PORT}/index.html`);
  await p.waitForFunction(() => window.__gameReady, null, { timeout: 60000 });
  let bad = 0;
  const fail = m => { console.log('FAIL', m); bad++; };
  const pass = m => console.log('PASS', m);

  await p.evaluate(async () => {
    window.TEST_MODE = true;
    startGame('minhgiao', null);
    for (let i = 0; i < 400 && !window.mrDung('minhgiao'); i++) await new Promise(r => setTimeout(r, 50));
  });

  // ① hai bảng dữ liệu phải trùng khít manifest THẬT (id + thứ tự)
  const r1 = await p.evaluate(async () => {
    const man = await (await fetch('assets/magic-runtime/manifest.json')).json();
    return {
      giapMan: man.armors.map(a => a.id), giapData: (window.MR_GIAP_LINES.minhgiao || []).map(L => L.id),
      vkMan: man.weapons.map(w => w.id),
      vkData: window.WEAPON_LINES.filter(L => L.sect === 'minhgiao').map(L => L.base && L.base.mr),
    };
  });
  if (JSON.stringify(r1.giapMan) !== JSON.stringify(r1.giapData))
    fail(`MR_GIAP_LINES lệch manifest: ${r1.giapData} vs ${r1.giapMan}`);
  else pass(`7 dòng giáp trùng manifest: ${r1.giapData.join(' · ')}`);
  if (JSON.stringify(r1.vkMan) !== JSON.stringify(r1.vkData))
    fail(`dòng vũ khí Spellblade lệch manifest: ${r1.vkData} vs ${r1.vkMan}`);
  else pass(`7 dòng vũ khí trùng manifest`);

  // ② danh mục + "theo process của game": mọi dòng đều rơi ra ở một giai bất kỳ
  const r2 = await p.evaluate(() => {
    const ids = Object.keys(ITEM_DB).filter(i => ITEM_DB[i].sect === 'minhgiao');
    const giap = ids.filter(i => ITEM_DB[i].kind === 'armor'), vk = ids.filter(i => ITEM_DB[i].kind === 'weapon');
    const roi = { ao: new Set(), vukhi: new Set() };
    for (let i = 0; i < 400; i++){
      const a = pickItemDef('ao', 'minhgiao', 3), w = pickItemDef('vukhi', 'minhgiao', 3);
      if (a) roi.ao.add(a.line); if (w) roi.vukhi.add(w.line);
    }
    return { giap: giap.length, vk: vk.length, roiAo: roi.ao.size, roiVk: roi.vukhi.size,
             khongDong: giap.filter(i => !ITEM_DB[i].mr).length + vk.filter(i => !ITEM_DB[i].mr).length };
  });
  if (r2.giap !== 7 * 7 * 4) fail(`Spellblade có ${r2.giap} món giáp, cần 196 (7 dòng × 7 giai × 4 ô)`);
  if (r2.vk !== 7 * 7) fail(`Spellblade có ${r2.vk} vũ khí, cần 49 (7 dòng × 7 giai)`);
  if (r2.khongDong) fail(`${r2.khongDong} món Spellblade không mang \`mr\` — chúng sẽ không có hình`);
  if (r2.roiAo !== 7 || r2.roiVk !== 7) fail(`giai 4 chỉ rơi ra ${r2.roiAo} dòng áo / ${r2.roiVk} dòng vũ khí, cần 7/7`);
  else pass(`giai 4 rơi đủ 7 dòng áo + 7 dòng vũ khí (${r2.giap} giáp · ${r2.vk} vũ khí)`);

  // ③ HÌNH theo DÒNG, không theo giai — lái `gearVisual` + `mrVe` thật
  const r3 = await p.evaluate(async () => {
    const mac = (line, band) => {
      for (const o of ['non', 'ao', 'tay', 'chan']){
        const it = genItem(60, null, null, { slots: [o], perfect: 0, plus9: 0 });
        it.def = `minhgiao_${line}_${band}_${o}`; it.tier = band + 1; it.plus = 0; player.equip[o] = it;
      }
      calcDerived();
    };
    const chup = () => {
      const gv = gearVisual(player);
      const c = window.mrVe('minhgiao', heroTier(player), gv, 'i', 0, 2);
      return c ? { d: c.getContext('2d').getImageData(0, 0, c.width, c.height).data, g: gv.mrGiap } : null;
    };
    const cho = async (line) => { for (let i = 0; i < 200; i++){ const x = chup(); if (x) return x; await new Promise(r => setTimeout(r, 50)); } return null; };
    const diff = (a, b) => { let n = 0; for (let i = 3; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) > 40) n++; return n; };
    mac('cuong_phong', 0); const A = await cho();          // Cuồng Phong ở GIAI 1
    mac('cuong_phong', 6); const B = await cho();          // Cuồng Phong ở GIAI 7
    mac('vai_tho', 6);     const C = await cho();          // Vải Thô ở GIAI 7
    return { ok: !!(A && B && C), gA: A && A.g, gC: C && C.g,
             cungDongKhacGiai: A && B ? diff(A.d, B.d) : -1, khacDongCungGiai: B && C ? diff(B.d, C.d) : -1 };
  });
  if (!r3.ok) fail('cảnh dựng hỏng: mrVe trả null — atlas giáp chưa về');
  else {
    if (r3.gA !== 'cuong_phong' || r3.gC !== 'vai_tho') fail(`gearVisual.mrGiap đọc sai dòng: ${r3.gA} / ${r3.gC}`);
    if (r3.cungDongKhacGiai !== 0) fail(`cùng dòng Cuồng Phong mà đổi giai lại đổi hình (${r3.cungDongKhacGiai} px) — hình vẫn đi theo giai`);
    if (r3.khacDongCungGiai < 500) fail(`đổi dòng giáp mà hình gần như không đổi (${r3.khacDongCungGiai} px)`);
    if (r3.cungDongKhacGiai === 0 && r3.khacDongCungGiai >= 500)
      pass(`hình theo DÒNG: cùng dòng khác giai lệch 0 px · khác dòng cùng giai lệch ${r3.khacDongCungGiai} px`);
  }

  // ④ vũ khí trong SLICE BAY đổi theo dòng (lớp vẽ sẵn Ảo Ảnh không được dán), tay không thì không có
  const r4 = await p.evaluate(async () => {
    const chup = async (line) => {
      if (line){ const it = player.equip.vukhi || genItem(60, null, null, { slots: ['vukhi'], perfect: 0, plus9: 0 });
        it.def = `minhgiao_${line}_6`; it.tier = 7; player.equip.vukhi = it; } else delete player.equip.vukhi;
      calcDerived();
      for (let i = 0; i < 200; i++){
        const c = window.mrVe('minhgiao', heroTier(player), gearVisual(player), 'f', 0, 2);
        if (c) return c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        await new Promise(r => setTimeout(r, 50));
      }
      return null;
    };
    const diff = (a, b) => { let n = 0; for (let i = 3; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) > 40) n++; return n; };
    const X = await chup('song_dao_co_ban'), Y = await chup('hoa_tinh_kiem'), Z = await chup(null);
    return { ok: !!(X && Y && Z), xy: X && Y ? diff(X, Y) : -1, yz: Y && Z ? diff(Y, Z) : -1 };
  });
  if (!r4.ok) fail('cảnh dựng hỏng: slice bay chưa về');
  else if (r4.xy < 300) fail(`slice bay: đổi vũ khí mà hình không đổi (${r4.xy} px) — vẫn dán lớp vũ khí vẽ sẵn`);
  else if (r4.yz < 300) fail(`slice bay: tay không mà vẫn còn vũ khí (${r4.yz} px)`);
  else pass(`slice bay đổi vũ khí theo dòng (${r4.xy} px) · tay không thì không có cây nào (${r4.yz} px)`);

  // ⑤ save cũ: id đời trước tự đổi sang dòng CÙNG HÌNH, giữ giai/rèn
  const r5 = await p.evaluate(() => {
    const a = { def: 'minhgiao_3_ao', tier: 4, plus: 9, perfect: 0 };
    const w = { def: 'minhgiao_makiem_6', tier: 7, plus: 5, perfect: 1 };
    const da = itemDef(a), dw = itemDef(w);
    return { a: a.def, w: w.def, an: a.name, wn: w.name, okA: !!da, okW: !!dw, plus: [a.plus, w.plus] };
  });
  if (r5.a !== 'minhgiao_ma_thuat_3_ao') fail(`áo đời cũ minhgiao_3_ao → ${r5.a}, cần minhgiao_ma_thuat_3_ao (bộ thứ 4 = đúng hình cũ ở giai 4)`);
  else if (r5.w !== 'minhgiao_hoa_tinh_kiem_6') fail(`vũ khí đời cũ → ${r5.w}, cần minhgiao_hoa_tinh_kiem_6`);
  else if (!/^Hoàn Hảo /.test(r5.wn) || r5.plus.join() !== '9,5') fail(`di trú làm mất Hoàn Hảo/mức rèn: ${r5.wn} ${r5.plus}`);
  else pass(`id cũ tự đổi: ${r5.an} · ${r5.wn}`);

  // ⑥ LUÔN BAY — kể cả KHÔNG đeo cánh; đứng · đi · đánh. Đối chứng: Dark Knight không cánh thì không bay.
  const r6 = await p.evaluate(async () => {
    travelTo('ardhaven'); player.avatar = null; player.equip.canh = null; calcDerived();
    const khoi = async (dat) => {
      dat(); const out = new Set();
      for (let i = 0; i < 90; i++){ update(1 / 60); render(); out.add(window.__khoiVe); await new Promise(r => setTimeout(r, 5)); }
      return [...out];
    };
    const dung = await khoi(() => { moveTarget = null; });
    const di   = await khoi(() => { moveTarget = { x: player.x + 500, y: player.y }; });
    const danh = await khoi(() => { moveTarget = null; player.atkAnim = window.NV_HD_GIAY.a; });
    const danh2 = []; for (let i = 0; i < 20; i++){ player.atkAnim = window.NV_HD_GIAY.a; render(); danh2.push(window.__khoiVe); }
    return { dung, di, danh: danh2 };
  });
  const chiF = (a) => a.every(k => k === 'f' || k === 'g');
  if (!chiF(r6.dung) || !chiF(r6.di)) fail(`Spellblade không cánh vẫn rơi về khối mặt đất: đứng ${r6.dung} · đi ${r6.di}`);
  else if (!r6.danh.includes('g')) fail(`đang bay ra đòn mà không vào khối bay-đánh: ${r6.danh}`);
  else pass(`luôn bay: đứng [${r6.dung}] · đi [${r6.di}] · đánh có 'g'`);
  const r6b = await p.evaluate(async () => {
    startGame('thieulam', null); travelTo('ardhaven'); player.avatar = null; player.equip.canh = null; calcDerived();
    moveTarget = { x: player.x + 500, y: player.y };
    const s = new Set(); for (let i = 0; i < 60; i++){ update(1 / 60); render(); s.add(window.__khoiVe); }
    return [...s];
  });
  if (r6b.includes('f')) fail(`Dark Knight không cánh cũng bay (${r6b}) — luật "luôn bay" rò sang lớp khác`);
  else pass(`đối chứng: Dark Knight không cánh vẫn đi bộ [${r6b}]`);

  // ⑦ cánh cấp 1 mặc định — phát MỘT lần, không phát trong TEST_MODE
  const r7 = await p.evaluate(() => {
    startGame('minhgiao', null); player.equip.canh = null; delete player._canhMacDinh;
    canhMacDinh(); const trongTest = !!player.equip.canh;
    window.TEST_MODE = false;
    canhMacDinh(); const bac = player.equip.canh ? wingBac(player.equip.canh) : 0, sect = player.equip.canh && wingSect(player.equip.canh);
    player.equip.canh = null; canhMacDinh(); const phatLai = !!player.equip.canh;
    window.TEST_MODE = true;
    startGame('thieulam', null); player.equip.canh = null; delete player._canhMacDinh;
    window.TEST_MODE = false; canhMacDinh(); const dk = !!player.equip.canh; window.TEST_MODE = true;
    return { trongTest, bac, sect, phatLai, dk };
  });
  if (r7.trongTest) fail('TEST_MODE mà vẫn phát cánh — bài kiểm cân bằng sẽ đo nhân vật có cánh');
  if (r7.bac !== 1 || r7.sect !== 'minhgiao') fail(`cánh mặc định phải là bậc 1 của Spellblade, ra bậc ${r7.bac} lớp ${r7.sect}`);
  if (r7.phatLai) fail('tháo cánh ra rồi vẫn được phát lại — cờ _canhMacDinh không chặn');
  if (r7.dk) fail('Dark Knight cũng được phát cánh — luật chỉ áp cho lớp luôn bay');
  if (!r7.trongTest && r7.bac === 1 && !r7.phatLai && !r7.dk) pass('cánh cấp 1 phát đúng một lần, đúng lớp');

  // ⑧ thẻ nhân vật đi đường gói (không phải hình dựng bằng đường) và đổi theo dòng giáp
  const r8 = await p.evaluate(async () => {
    startGame('minhgiao', null);
    for (let i = 0; i < 400 && !window.mrDung('minhgiao'); i++) await new Promise(r => setTimeout(r, 50));
    const mac = (line) => { for (const o of ['non', 'ao', 'tay', 'chan']){
        const it = genItem(60, null, null, { slots: [o], perfect: 0, plus9: 0 }); it.def = `minhgiao_${line}_3_${o}`; it.tier = 4; it.plus = 0; player.equip[o] = it; }
      calcDerived(); };
    const the = async () => { for (let i = 0; i < 200; i++){
        const gv = gearVisual(player);
        if (window.mrVe('minhgiao', heroTier(player), gv, 'i', 0, 2)) return heroCardUrl('minhgiao', heroTier(player), gv);
        await new Promise(r => setTimeout(r, 50)); } return null; };
    let goiVector = 0; const _cu = window.drawHeroFigure;
    window.drawHeroFigure = function(){ goiVector++; return _cu.apply(this, arguments); };
    mac('vai_tho'); const u1 = await the(); mac('cuong_phong'); const u2 = await the();
    window.drawHeroFigure = _cu;
    return { u1: !!u1, u2: !!u2, khac: u1 !== u2, goiVector };
  });
  if (!r8.u1 || !r8.u2) fail('cảnh dựng hỏng: thẻ nhân vật không dựng được');
  else if (r8.goiVector) fail(`thẻ nhân vật Spellblade gọi drawHeroFigure ${r8.goiVector} lần — hình dựng bằng đường (Quy tắc số 3)`);
  else if (!r8.khac) fail('thẻ nhân vật không đổi khi đổi dòng giáp — chỗ duy nhất còn thấy 7 bộ giáp');
  else pass('thẻ nhân vật vẽ bằng art gói và đổi theo dòng giáp');

  if (errs.length) fail('lỗi trang: ' + errs.join(' | '));
  console.log(bad === 0 ? 'PASS' : `FAIL(${bad})`);
  await b.close();
  process.exit(bad === 0 ? 0 : 1);
})();
