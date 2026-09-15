// VẬT CẢN CỦA CÔNG TRÌNH — nhà phải CHẶN, cổng phải THÔNG, và góc trong suốt phải ĐI ĐƯỢC.
//
// ⚠ VÌ SAO CÓ BÀI NÀY. `MAP_OBSTACLES.ardhaven` là 16 khối 460×340 — đó là cỡ Ô ĐẤT của khối
// nhà, KHÔNG phải cỡ hình nhà. Sprite cao hơn hẳn (quán trọ 512×510), nên cả thân trên lẫn mái
// nằm ngoài hộp chặn. Đo được trước khi sửa: nửa dưới mỗi căn chặn 95-100% nên nhìn bảng số thì
// tưởng xong, mà tính cả hình thì 12-35% diện tích vẫn đi được — và toàn bộ chỗ đó nằm ở dải
// phía BẮC, đúng hướng người chơi đi tới. Ảnh chụp tại (3900,430) cho thấy nhân vật BIẾN MẤT
// hoàn toàn sau mái Quán Trọ. Với người chơi đó là "chạy xuyên qua nhà".
//
// ⚠ VÀ CÁI GIÁ CỦA VIỆC CHỮA SAI CÁCH: bịt kín theo HỘP BAO thì bốn cổng thành mất luôn cái
// vòm — ba vùng thành nội dung chết, im lặng, không lỗi nào. Nên mục ② dưới đây quan trọng
// ngang mục ①, và nó lái bằng chính `setMoveTarget` + `update` chứ không hỏi một cờ nào.
const { chromium } = require('playwright');
let bad = 0; const fail = m => { bad++; console.log('FAIL ' + m); };
(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport:{width:1280,height:800} });
  const errs = []; p.on('pageerror', e => errs.push(String(e).split('\n')[0]));
  await p.goto('http://localhost:8853/index.html?max=1', { waitUntil:'load' });
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', null); travelTo('ardhaven'); });
  await p.waitForTimeout(900);

  // ---- 0. tự kiểm cảnh dựng: bảng phải có, và phải thật sự vào được obstaclesOf ----
  const r0 = await p.evaluate(() => ({
    coBang: !!window.VAT_CAN,
    soAnh: Object.keys(window.VAT_CAN || {}).length,
    thieu: ((MAPS.ardhaven.vatTo) || []).map(v => v.img).filter(i => !(window.VAT_CAN || {})[i]),
    soVatCan: obstaclesOf('ardhaven').length,
    soKhoi: (MAP_OBSTACLES.ardhaven || []).length,
  }));
  if (!r0.coBang) fail('⓪ không có window.VAT_CAN — index.html chưa nạp data/vatcan.js?');
  if (r0.thieu.length) fail('⓪ công trình không có vật cản: ' + r0.thieu.join(' '));
  if (r0.soVatCan <= r0.soKhoi)
    fail(`⓪ obstaclesOf trả ${r0.soVatCan} = đúng bằng ${r0.soKhoi} khối tĩnh — bảng VAT_CAN không được nối vào`);
  console.log(`⓪ ${r0.soAnh} công trình có bảng · obstaclesOf ${r0.soVatCan} vật cản (${r0.soKhoi} khối tĩnh)`);

  // ---- 1. đứng lọt vào trong hình nhà được bao nhiêu ----
  // Ngưỡng ĐO chứ không đoán: sau khi sửa, phần đi được còn lại chỉ là GÓC TRONG SUỐT của khung
  // sprite (hình thoi isometric nằm trong khung chữ nhật). Đo ra 0-17% toàn hình, 0-12% nửa
  // dưới. Đặt trần 25%/20% — nới đủ cho art mới, vẫn bắt được bản hỏng cũ (35% / 100%).
  const r1 = await p.evaluate(() => (MAPS.ardhaven.vatTo || []).map(v => {
    let di = 0, tong = 0, diD = 0, tongD = 0;
    for (let y = v.y; y < v.y + v.h; y += 8)
      for (let x = v.x; x < v.x + v.w; x += 8){
        tong++; const d = !inObstacle('ardhaven', x, y, 14);
        if (d) di++;
        if (y > v.y + v.h*0.5){ tongD++; if (d) diD++; }
      }
    return { img: v.img, x: v.x, y: v.y, all: 100*di/tong, duoi: 100*diD/tongD };
  }));
  for (const o of r1) console.log(`   ${o.img.padEnd(13)} (${o.x},${o.y}) đi được ${o.all.toFixed(0).padStart(3)}% toàn hình · ${o.duoi.toFixed(0).padStart(3)}% nửa dưới`);
  for (const o of r1){
    if (o.all > 25) fail(`① ${o.img} tại (${o.x},${o.y}): ${o.all.toFixed(0)}% diện tích hình vẫn đi được — đứng lọt vào trong nhà`);
    if (o.duoi > 20) fail(`① ${o.img} tại (${o.x},${o.y}): ${o.duoi.toFixed(0)}% nửa DƯỚI đi được — chân nhà không chặn`);
  }

  // ---- 2. BỐN CỔNG THÀNH VẪN PHẢI ĐI BỘ QUA ĐƯỢC ----
  // Đây là vế dễ mất nhất khi siết vật cản, và mất thì ba vùng thành nội dung chết mà không một
  // lỗi nào in ra. Lái bằng hàm thật: đặt nhân vật giữa thành rồi bấm đi tới từng cổng.
  const r2 = await p.evaluate(() => {
    const ra = [];
    for (const g of GATES.filter(g => g.map === 'ardhaven' && g.to)){
      player.x = 3200; player.y = 1600; player.auto = false;
      setMoveTarget(g.x, g.y);
      for (let i = 0; i < 900; i++) update(0.05);
      ra.push({ to: g.to, chan: inObstacle('ardhaven', g.x, g.y, 14),
                con: Math.round(Math.hypot(player.x - g.x, player.y - g.y)) });
    }
    const sf = MAPS.ardhaven.spawnFrom || {};
    return { cong: ra, spawn: Object.keys(sf).filter(k => inObstacle('ardhaven', sf[k].x, sf[k].y, 14)) };
  });
  for (const o of r2.cong) console.log(`   cổng → ${o.to.padEnd(11)} còn cách ${o.con}px`);
  for (const o of r2.cong){
    if (o.chan) fail(`② cổng đi ${o.to} nằm TRONG vật cản — cửa ra vào thành bị bịt`);
    if (o.con > 60) fail(`② đi bộ tới cổng ${o.to} còn hụt ${o.con}px — bị công trình chắn đường`);
  }
  if (r2.spawn.length) fail('② điểm hiện ra khi quay về bị chặn: ' + r2.spawn.join(' '));

  // ---- 3. GÓC TRONG SUỐT PHẢI ĐI ĐƯỢC — đừng chữa lỗi này bằng tường vô hình ----
  // Chặn theo hộp bao thì bốn góc khung sprite (magenta trong suốt) cũng chặn, tức dựng tường ở
  // chỗ không vẽ gì — đúng cái lỗi NGƯỢC với lỗi đang chữa. Lấy góc trên-trái của mỗi công
  // trình, lùi vào 12px, và đòi phần lớn phải đứng được.
  const r3 = await p.evaluate(() => (MAPS.ardhaven.vatTo || [])
    .map(v => ({ img: v.img, goc: inObstacle('ardhaven', v.x + 12, v.y + 12, 14) }))
    .filter(o => o.goc).map(o => o.img));
  if (r3.length > (r1.length / 2))
    fail(`③ ${r3.length}/${r1.length} công trình chặn cả GÓC TRÊN-TRÁI của khung — đang chặn theo hộp bao chứ không theo hình vẽ: ${r3.join(' ')}`);
  console.log(`③ ${r1.length - r3.length}/${r1.length} công trình để trống góc khung (không dựng tường vô hình)`);

  if (errs.length) fail('lỗi trang: ' + errs.slice(0,3).join(' | '));
  console.log(bad ? `\n${bad} LỖI` : '\nTẤT CẢ XANH');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
