// THỊ TRẤN KHỞI ĐẦU — kiến trúc, bảy khu phố, và bảng bản đồ đọc ra một NƠI CHỐN.
//
// ⚠ BÀI NÀY SINH RA TỪ MỘT PHÉP ĐO, KHÔNG TỪ MỘT Ý TƯỞNG. Chủ dự án đưa ảnh chụp bảng bản đồ
// của một MMO khác và hỏi làm sao cho thị trấn khởi đầu sống động như thế. Đo ra:
//
//   · `MAP_OBSTACLES.ardhaven` khai 16 khối `460×340` GIỐNG HỆT NHAU — đó là 16 ngôi nhà, và
//     không có một mảnh tranh nào cho chúng. Thứ duy nhất người chơi thấy là hàng đá cuội mà
//     `rimBuild()` rải dọc biên chặn.
//   · `isoCayBo`/`isoNhoBo` bỏ trống ⇒ rơi về bộ mặc định ⇒ 200 CÂY RỪNG mọc trên mặt phố đá.
//   · Hai hàng khối đều nằm sát rìa bắc–nam, dải giữa cao 1480px trống trơn. Camera mặc định
//     1,0× chỉ thấy 1500×950px, nên ĐỨNG GIỮA QUẢNG TRƯỜNG KHÔNG THẤY MỘT CÁI NHÀ NÀO.
//   · `drawMinimapStatic()` không vẽ vật cản — trên cả 12 map. Bảng bản đồ là một mảng màu phẳng.
//
// Không lỗi nào in ra, không bài nào đỏ. Cùng họ với `ISO_NEO` đã làm sáu map mất sạch cây:
// *dữ liệu có đủ, chỉ là không có gì vẽ ra.* Sáu mệnh đề dưới đây khoá từng chỗ ấy lại.
const { chromium } = require('playwright');
let bad = 0; const fail = m => { bad++; console.log('FAIL ' + m); };
(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport:{width:1500,height:950} });
  const errs = []; p.on('pageerror', e => errs.push(String(e).split('\n')[0]));
  await p.goto('http://localhost:8853/index.html?max=1', { waitUntil:'load' });
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', null); });
  await p.waitForTimeout(900);

  // ---- 1. mọi khối chặn của map có khu đều CÓ MỘT CÔNG TRÌNH đứng trên ----
  const r1 = await p.evaluate(() => {
    const kt = decor.filter(d => d.type === 'iso' &&
      /^(nha_|quay_cho|chuong|sanh_lenh|thap_canh|gieng|den_pho|hang_rao)/.test(d.img));
    const khoi = (MAP_OBSTACLES[curMap] || []).filter(o => o.wd);
    const trong = [];
    for (const o of khoi){
      const cx = o.x + o.wd / 2, cy = o.y + o.ht / 2;
      if (!kt.some(d => Math.abs(d.x - cx) < o.wd * 0.6 && Math.abs(d.y - cy) < o.ht * 1.2))
        trong.push(Math.round(cx) + ',' + Math.round(cy));
    }
    return { map: curMap, soKhoi: khoi.length, soCongTrinh: kt.length, trong };
  });
  console.log('1) khối có nhà:', JSON.stringify(r1));
  if (!r1.soKhoi) fail('① map khởi đầu không khai một khối chặn nào — thị trấn không có nhà');
  if (r1.trong.length)
    fail(`① ${r1.trong.length}/${r1.soKhoi} khối chặn KHÔNG có công trình nào đứng trên ⇒ người chơi vướng vào một chỗ trông như đang trống: ${r1.trong.slice(0,4).join(' · ')}`);

  // ---- 2. mọi sprite kiến trúc phải có NEO **và** có TỆP ----
  // ⚠ `veVatIso()` `return` sớm khi thiếu một trong hai, im lặng — đúng cách sáu map mất sạch
  // cây mà không bài nào đỏ. Đối chiếu tên thôi là chưa đủ, phải hỏi cả tệp.
  const r2 = await p.evaluate(async () => {
    const ten = [...new Set(decor.filter(d => d.type === 'iso').map(d => d.img))];
    const thieuNeo = ten.filter(t => !ISO_NEO[t]);
    const thieuTep = [];
    for (const t of ten){
      const ok = await new Promise(res => { const i = new Image();
        i.onload = () => res(true); i.onerror = () => res(false); i.src = 'assets/iso/' + t + '.png'; });
      if (!ok) thieuTep.push(t);
    }
    return { soTen: ten.length, thieuNeo, thieuTep };
  });
  console.log('2) neo + tệp:', JSON.stringify(r2));
  if (r2.thieuNeo.length) fail(`② thiếu NEO (veVatIso return sớm, không vẽ gì): ${r2.thieuNeo.join(', ')}`);
  if (r2.thieuTep.length) fail(`② thiếu TỆP PNG: ${r2.thieuTep.join(', ')}`);

  // ---- 3. bảy khu phố: mọi khối thuộc đúng một khu, và mỗi khu khai đủ nhà ----
  const r3 = await p.evaluate(() => {
    const md = MAPS[curMap], K = md.khu || [];
    const dem = {}, ngoai = [];
    for (const o of (MAP_OBSTACLES[curMap] || [])){
      if (!o.wd) continue;
      const cx = o.x + o.wd / 2, cy = o.y + o.ht / 2;
      const k = khuCua(md, cx, cy);
      if (!k) { ngoai.push(Math.round(cx) + ',' + Math.round(cy)); continue; }
      dem[k.id] = (dem[k.id] || 0) + 1;
    }
    const lech = K.filter(k => (dem[k.id] || 0) > 0 && k.nha.length !== dem[k.id])
                  .map(k => `${k.id} khai ${k.nha.length} nhà / ${dem[k.id]} khối`);
    return { soKhu: K.length, ngoai, lech, ten: K.map(k => k.ten) };
  });
  console.log('3) khu phố:', JSON.stringify(r3));
  if (r3.soKhu < 2) fail('③ map khởi đầu không chia khu — thị trấn đọc ra một danh sách người, không ra một nơi chốn');
  if (r3.ngoai.length) fail(`③ ${r3.ngoai.length} khối nằm NGOÀI mọi khu ⇒ không có nhà nào mọc lên: ${r3.ngoai.slice(0,3).join(' · ')}`);
  if (r3.lech.length) fail(`③ số nhà khai không bằng số khối (khu thừa nhà thì lặp, thiếu thì có khối trống): ${r3.lech.join(' · ')}`);

  // ---- 4. TÊN KHU TRONG LORE PHẢI CÓ MẶT TRÊN BẢN ĐỒ ----
  // Đoạn mô tả map gọi tên bảy chỗ. Trước bản này không có thứ gì trên bản đồ cho thấy chúng —
  // đúng kiểu "bảng nói dối" mà `mapBanSac()` sinh ra để chữa.
  const r4 = await p.evaluate(() => {
    const md = MAPS[curMap], mo = String(md.desc || md.lore || '');
    const thieu = (md.khu || []).filter(k => k.ten && mo && !mo.includes(k.ten)).map(k => k.ten);
    return { coMo: !!mo, thieu };
  });
  console.log('4) khu ↔ lore:', JSON.stringify(r4));
  if (r4.coMo && r4.thieu.length)
    fail(`④ khu phố không có trong đoạn mô tả map (hai bên phải nói cùng một thứ): ${r4.thieu.join(', ')}`);

  // ---- 5. TẦNG HÀNH VI — bảng bản đồ phải VẼ RA khối nhà, không phải một mảng màu phẳng ----
  const r5 = await p.evaluate(() => {
    const md = MAPS[curMap];
    const mw = 660, mh = Math.round(660 * md.h / md.w);
    const cv = drawMinimapStatic(mw, mh, mw / md.w, mh / md.h, md);
    const d = cv.getContext('2d').getImageData(0, 0, mw, mh).data;
    let mai = 0, toi = 0;
    for (let i = 0; i < d.length; i += 4){
      // mái ngói: đỏ trội hẳn lục và lam. Nền `ground` của thành là xanh ô-liu nên không lẫn.
      if (d[i] > 110 && d[i] > d[i+1] * 1.5 && d[i] > d[i+2] * 1.6) mai++;
      if (d[i] < 26 && d[i+1] < 26) toi++;        // ngoài đa giác đi được
    }
    return { o: mw * mh, mai, toi };
  });
  console.log('5) bản đồ vẽ ra:', JSON.stringify(r5));
  if (r5.mai < 400) fail(`⑤ bản đồ chỉ vẽ ${r5.mai} điểm ảnh mái ngói — khối nhà KHÔNG hiện lên, bảng lại là một mảng màu phẳng`);
  if (r5.toi < 200) fail(`⑤ bản đồ không tô tối phần NGOÀI vùng đi được (${r5.toi} px) — mất hình dáng của thành`);

  // ---- 6. ⭐ ĐỨNG Ở ĐIỂM THẢ PHẢI THẤY CÔNG TRÌNH ----
  // Đây là mệnh đề đắt nhất, và là chính phép đo đã phát hiện ra lỗi. Thành có đủ 16 khối mà
  // hai hàng đều nằm sát rìa thì người chơi mới vào game nhìn quanh vẫn thấy một sân đá trống.
  // Không có gì trong dữ liệu nói lên điều đó — phải hỏi bằng TẦM NHÌN THẬT.
  const r6 = await p.evaluate(() => {
    const md = MAPS[curMap], sp = md.spawn;
    const nuaW = (typeof VW === 'number' ? VW : W) / 2, nuaH = (typeof VH === 'number' ? VH : H) / 2;
    const trong = decor.filter(d => d.type === 'iso' &&
        /^(nha_|quay_cho|chuong|sanh_lenh|thap_canh)/.test(d.img) &&
        Math.abs(d.x - sp.x) < nuaW && Math.abs(d.y - sp.y) < nuaH);
    return { nuaW: Math.round(nuaW), nuaH: Math.round(nuaH), thay: trong.length,
             gan: trong.slice(0, 3).map(d => d.img) };
  });
  console.log('6) thấy từ điểm thả:', JSON.stringify(r6));
  if (r6.thay < 1)
    fail(`⑥ đứng ở điểm thả KHÔNG thấy một công trình nào trong khung ${r6.nuaW*2}x${r6.nuaH*2} — thành có nhà nhưng người chơi mới vào không nhìn thấy cái nào`);

  // ---- 7. dân phố mặc định TẮT trên bảng, bật lên thì có thêm nhãn ----
  const r7 = await p.evaluate(() => {
    const dem = () => NPCS.filter(n => n.map === curMap && _htLoc[_npcNhom(n)]).length;
    const tat = dem();
    _htLoc.npcTa = 1; const bat = dem(); _htLoc.npcTa = 0;
    return { macDinh: _htLoc.npcTa, tat, bat,
             soTa: NPCS.filter(n => n.map === curMap && n.taCanh).length };
  });
  console.log('7) dân phố:', JSON.stringify(r7));
  if (r7.soTa && r7.bat <= r7.tat) fail('⑦ bật "Dân phố" không thêm được nhãn nào — bộ lọc không nối vào _npcNhom');
  if (r7.soTa && r7.tat + r7.soTa !== r7.bat) fail(`⑦ số nhãn thêm (${r7.bat - r7.tat}) không bằng số NPC tả cảnh (${r7.soTa})`);

  if (errs.length) fail('lỗi trang: ' + errs.slice(0,3).join(' | '));
  console.log(bad ? `\n${bad} LỖI` : '\nTẤT CẢ XANH');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
