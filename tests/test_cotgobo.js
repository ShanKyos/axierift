// HỆ CỐT ĐÃ GỠ HẲN CHỈ SỐ — bài này gác VIỆC GỠ, không gác cái hệ.
//
// ⚠ Thay cho `test_cotnguoi.js` (đã gỡ), mà chính nó lại thay cho `test_dinhhinh.js` (cũng đã
// gỡ). Ba đời bài kiểm cho cùng MỘT trục sức mạnh, và mỗi lần nó quay lại đều dưới dạng "chỉ
// vài dòng chỉ số nhỏ thôi": bị động `thu` → cấp Chimera → bốn ô Cốt. Nên bài này không đo hệ
// nữa — nó đo rằng hệ KHÔNG SỐNG LẠI, và rằng thứ thay chỗ nó có thật.
//
// Gác bốn thứ:
//   ① không hàm/hằng nào của hệ Cốt còn tồn tại;
//   ② cắm dữ liệu Cốt giả vào `player` KHÔNG làm đổi một điểm chỉ số nào;
//   ③ khai vỉa trả Bản Năng (chỗ tiêu thật: nâng cấp kỹ năng của 5 lớp);
//   ④ save đời cũ được HOÀN LẠI, không mất trắng.
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://localhost:8853/index.html', { waitUntil: 'networkidle' });
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(500);

  let bad = 0;
  const fail = m => { bad++; console.log('  ✗ ' + m); };
  const pass = m => console.log('  ✓ ' + m);

  const r = await p.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    const o = {};

    // ① không sống lại dưới bất kỳ cái tên nào
    o.conSot = ['cotGom','cotO','cotKho','cotMoi','cotMoiO','cotDeo','cotThao','cotNang','cotBo',
                'cotBoCast','cotBoTick','cotBoHieu','cotDmgMul','cotCdMul','cotRoi','cotBossVung',
                'renderKhoCot','moKhoCot','COT_O','COT_PHU','COT_PHAM','COT_KHO_MAX','COT_BO_R']
      .filter(n => { try { return typeof eval(n) !== 'undefined'; } catch(e){ return false; } });

    // ② dữ liệu Cốt giả KHÔNG được cộng một điểm nào.
    // ⚠ Đo CHỈ SỐ THẬT trước/sau, không đọc bảng: `applyLine()` lặng lẽ bỏ qua khoá lạ, nên một
    // hệ chết vẫn hiện đẹp trên bảng mà cộng 0 — và ngược lại, một hệ sống lại vẫn có thể không
    // hiện ở đâu cả. Chỉ số thật là thứ duy nhất không nói dối được.
    player.level = 60; player.lvPeak = 60; calcDerived();
    const t = { atk:player.atk, hp:player.maxHp, crit:player.crit,
                sk:player.skillDmgPct || 0, cd:player.vhCdMult || 1, aspd:player.aspd };
    player.cot = { sung:{ chinhV:99, phu:[] }, vuot:{ chinhV:99, phu:[] },
                   vay:{ chinhV:99, phu:[] }, duoi:{ chinhV:99, phu:[] } };
    player.cotKho = [{},{},{}]; player.cotBo = 'bangvun'; player.cotNhanhT = 99;
    calcDerived();
    o.doi = { atk:player.atk - t.atk, hp:player.maxHp - t.hp, crit:player.crit - t.crit,
              sk:(player.skillDmgPct||0) - t.sk, cd:(player.vhCdMult||1) - t.cd,
              aspd:+(player.aspd - t.aspd).toFixed(4) };
    delete player.cot; delete player.cotKho; delete player.cotBo; delete player.cotNhanhT;

    // ③ khai vỉa trả Bản Năng. ⚠ Mỗi ngày chỉ BA trong bảy vùng có vỉa — phải hỏi viaHomNay(),
    //    lấy bừa một map trong bảy là rơi vào ngày nó không có vỉa và bài "xanh" mà chẳng đo gì.
    const hn = viaHomNay();
    o.soVia = hn.length;
    if (hn.length){
      const mid = hn[0].map; travelTo(mid);
      const v = viaCuaMap(mid);
      if (v){ player.x = v.x; player.y = v.y; player.via = null; player.khi = 0;
              o.viaOk = viaKhai(); o.viaKhi = player.khi; }
    }

    // ④ save đời cũ: 4 mảnh trong kho + 1 đang đeo + 2 trên một con Chimera + cấp 20 + Hoá 2
    player.khi = 0; player.silver = 0; delete player._diTruCot;
    if (!player.chimera) chiState();
    player.chimera.ve.gk = 0;
    player.cotKho = [{},{},{},{}];
    player.cot = { sung:{}, vuot:null, vay:null, duoi:null };
    player.chimera.co = { x1:{ lv:20, hoa:2, cot:{ sung:{}, vuot:{} } } };
    player.mats = player.mats || {}; player.mats.datHon = 50;
    cotDiTru();
    o.hoan = { khi:player.khi, gk:player.chimera.ve.gk, bac:player.silver,
               conTruong: !!(player.cot || player.cotKho || player.chimera.co.x1.cot),
               tin: !!player._hoanBaoTin };
    // gọi lần hai: không được hoàn thêm lần nữa
    const khi1 = player.khi; cotDiTru();
    o.hoanHaiLan = player.khi !== khi1;
    return o;
  });

  console.log('① hàm/hằng còn sót:', r.conSot.length ? r.conSot.join(', ') : 'không');
  if (r.conSot.length) fail(`hệ Cốt sống lại: ${r.conSot.join(', ')}`);
  else pass('không hàm/hằng nào của hệ Cốt còn tồn tại');

  console.log('② chỉ số đổi khi cắm Cốt giả:', JSON.stringify(r.doi));
  const lech = Object.entries(r.doi).filter(([, v]) => Math.abs(v) > 1e-6);
  if (lech.length) fail(`Cốt VẪN cộng chỉ số: ${lech.map(([k,v]) => k+' '+v).join(', ')}`);
  else pass('cắm đủ bốn ô + cờ bộ + buff tạm ⇒ 0 điểm chỉ số');

  console.log('③ vỉa hôm nay:', r.soVia, '· khai:', JSON.stringify({ ok:r.viaOk, khi:r.viaKhi }));
  if (r.soVia !== 3) fail(`viaHomNay() bốc ${r.soVia} vùng, phải là 3`);
  else pass('mỗi ngày đúng ba vùng có vỉa');
  if (!r.viaOk) fail('khai vỉa không chạy');
  else if (!r.viaKhi) fail('khai vỉa xong mà không được Bản Năng nào — vòng chơi mỗi ngày trả ra hư không');
  else pass(`khai vỉa trả ${r.viaKhi.toLocaleString('vi-VN')} Bản Năng`);

  console.log('④ di trú:', JSON.stringify(r.hoan));
  if (r.hoan.conTruong) fail('trường Cốt đời cũ còn nằm lại trong save');
  else pass('save cũ được dọn sạch trường Cốt');
  if (!r.hoan.khi) fail('7 mảnh Cốt đời cũ KHÔNG được hoàn — người chơi mất trắng');
  else pass(`mảnh Cốt hoàn thành ${r.hoan.khi.toLocaleString('vi-VN')} Bản Năng`);
  if (!r.hoan.gk) fail('Đất Hồn + cấp Chimera không được hoàn');
  else pass(`vòng nuôi hoàn thành ${r.hoan.gk} Ấn Giao Kết · ${r.hoan.bac.toLocaleString('vi-VN')} Lumen`);
  if (!r.hoan.tin) fail('hoàn xong mà không báo cho người chơi — với họ thì không khác gì mất trắng');
  else pass('có dòng báo đọc được');
  if (r.hoanHaiLan) fail('gọi cotDiTru() lần hai lại hoàn thêm — nạp save nhiều lần là in tiền');
  else pass('chỉ hoàn một lần cho mỗi save');

  if (errs.length) fail('lỗi trang: ' + errs.slice(0, 3).join(' | '));
  await b.close();
  console.log(bad ? `FAIL(${bad})` : 'ALL PASS');
  process.exit(bad ? 1 : 0);
})();
