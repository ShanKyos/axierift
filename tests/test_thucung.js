// CẤU TRÚC PET (2026-09-24) + VÀO THÀNH BẰNG ĐƯỜNG ĐI BỘ.
//
// Chủ dự án chốt: *"nhân vật to ra để có thể thấy được cặp vũ khí, axie giờ sẽ nhỏ lại như là
// pet đi theo"* — và báo *"không move về map an toàn được"*. Hai việc, một bài:
//
//  ① đi bộ từ mỗi map hoang dã qua "Lối Về Thành" rồi ĐI TIẾP VÀO TRONG THÀNH — phải ở lại
//    Sapidae Chiefdom. Bản cũ hạ cánh NGOÀI cổng nên bước vào là bị lối ra hất ngược ra.
//    ⚠ Lái bằng `update()` thật + `moveTarget`, không gọi `travelTo` tay: chỗ hỏng là sợi dây
//    điểm-hạ-cánh ↔ vòng lối ra, không phải phép đổi map.
//  ② ngoài thành nhân vật KHÔNG nhập vào Axie, đứng ở gốc, cỡ NV_CHINH_CO; pet dời ra sau.
//  ③ pet nhỏ hơn hẳn nhân vật.
//  ④ lúc ra đòn Axie KHÔNG ra đòn (pet gồng), và nhân vật không mờ đi (không vật chất hoá).
const { chromium } = require('playwright');
const PORT = process.argv[2] || 8853;
let bad = 0; const fail = m => { bad++; console.log('FAIL ' + m); };
const ok = m => console.log('PASS ' + m);

(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport:{ width:1280, height:800 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e).split('\n')[0]));
  await p.goto(`http://localhost:${PORT}/index.html`, { waitUntil:'load' });
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', null); });

  // ── ① ────────────────────────────────────────────────────────────────────────
  const r1 = await p.evaluate(() => {
    const out = [];
    const ve = GATES.filter(g => g.to === 'ardhaven' && !g.portal);
    for (const g of ve){
      travelTo(g.map);
      for (const m of mobs){ m.x = -9999; m.y = -9999; }
      player.x = g.x + 140; player.y = g.y;
      let vao = false;
      for (let i = 0; i < 900 && !vao; i++){ moveTarget = { x: g.x, y: g.y }; update(1/60); vao = curMap === 'ardhaven'; }
      if (!vao){ out.push({ tu: g.map, loi: 'không qua được lối về' }); continue; }
      const x0 = player.x, y0 = player.y;
      const tam = MAPS.ardhaven.spawn;
      moveTarget = { x: tam.x, y: tam.y };
      let roi = null;
      for (let i = 0; i < 480; i++){ update(1/60); if (curMap !== 'ardhaven'){ roi = curMap; break; } }
      out.push({ tu: g.map, ha: [Math.round(x0), Math.round(y0)], roi,
        tien: Math.round(Math.hypot(x0 - tam.x, y0 - tam.y) - Math.hypot(player.x - tam.x, player.y - tam.y)) });
    }
    return out;
  });
  console.log('① vào thành:', JSON.stringify(r1));
  if (r1.length < 3) fail('① cảnh dựng hỏng: chỉ có ' + r1.length + ' lối về thành');
  for (const d of r1){
    if (d.loi) fail(`① ${d.tu}: ${d.loi}`);
    else if (d.roi) fail(`① ${d.tu}: vào thành rồi đi vào trong thì bị hất ra ${d.roi}`);
    else if (d.tien < 150) fail(`① ${d.tu}: vào thành mà không đi vào trong được (tiến ${d.tien}px)`);
  }
  if (!bad) ok('① cả ' + r1.length + ' lối về thành: vào được và đi tiếp vào trong');

  // ── ②③④ ─────────────────────────────────────────────────────────────────────
  await p.evaluate(() => { travelTo('daohoa'); for (const m of mobs){ m.x = -9999; m.y = -9999; } player.face = 0.4; });
  await p.waitForTimeout(900);
  const r2 = await p.evaluate(async () => {
    const id = avatarId(player);
    const lv = window.__lopVe || {};
    const pet = petLech(player, performance.now());
    player.atkAnim = NV_DANH_GIAY * 0.5; player.atkAct = 'slash';
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const k = (window.__avaKhoi || {})[veKhoa(player)] || {};
    const vc = (window.__veChet || {})[veKhoa(player)] || {};
    return { thuCung: THU_CUNG, id, nhap: avaNhap(), dx: lv.dx, dy: lv.dy, co: lv.co, nvCo: NV_CHINH_CO,
      petD: Math.hypot(pet.dx, pet.dy), petCao: avaCo(id), nvCao: NV_THAN_PX * NV_CHINH_CO,
      khoi: k.khoi, lopHien: vc.lopHien, nhapVe: vc.nhap };
  });
  console.log('②③④:', JSON.stringify(r2));
  if (!r2.id) fail('②③④ cảnh dựng hỏng: không có avatar');
  if (!r2.thuCung) fail('② THU_CUNG đang tắt');
  if (r2.nhap) fail('② ngoài thành nhân vật vẫn NHẬP vào Axie — không thấy nhân vật/vũ khí');
  if (r2.dx !== 0 || r2.dy !== 0) fail(`② nhân vật bị dời khỏi gốc (${r2.dx},${r2.dy}) — nhân vật phải là thân chính`);
  if (r2.co !== r2.nvCo) fail(`② cỡ nhân vật ${r2.co} ≠ NV_CHINH_CO ${r2.nvCo}`);
  if (!(r2.nvCo > 1)) fail('② nhân vật không to ra');
  if (!(r2.petD > 40)) fail(`② pet đứng đè lên nhân vật (lệch ${r2.petD && r2.petD.toFixed(1)}px)`);
  if (!(r2.petCao < r2.nvCao * 0.5)) fail(`③ pet không nhỏ hơn hẳn nhân vật: ${r2.petCao.toFixed(1)} vs ${r2.nvCao.toFixed(1)}`);
  if (r2.khoi === 'danh') fail('④ pet đang RA ĐÒN — chỉ nhân vật đánh');
  if (!r2.khoi) fail('④ cảnh dựng hỏng: không đọc được khối vẽ của pet');
  if (!bad) ok('②③④ nhân vật ở gốc cỡ ' + r2.nvCo + ', pet lệch ' + r2.petD.toFixed(0) + 'px, cao ' + r2.petCao.toFixed(0) + ' vs ' + r2.nvCao.toFixed(0));

  if (errs.length) fail('lỗi trang: ' + errs.slice(0, 3).join(' | '));
  console.log(bad ? `FAIL(${bad})` : 'PASS');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
