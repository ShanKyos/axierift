// LỐI RA — bốn hướng của map KHÔNG CÒN CỔNG VÒM, và nhân vật TỰ ĐI RA khi chạm tới.
//
// Bài này lái bằng `update(dt)` thật, không gọi `travelTo` tay: chỗ dễ hỏng không phải phép
// đổi map mà là SỢI DÂY — cờ `_loiRaCho` có được arm không, có được xử ở đầu khung không, và
// cái khoá chống dội có nhả đúng lúc không.
//
// ⚠ VÀ MỆNH ĐỀ ② MỚI LÀ MỆNH ĐỀ NẶNG NHẤT. Đo được: `ardhaven→pvp` hạ cánh cách cổng về ĐÚNG
// 0px, và cặp map RÌA sát nhau nhất là 127px — tức tự-đi-ra không có chốt là người chơi kẹt
// dội qua dội lại giữa hai map, mà kiểu hỏng đó không in ra một lỗi nào.
const { chromium } = require('playwright');
const PORT = process.argv[2] || 8853;
let bad = 0; const fail = m => { bad++; console.log('FAIL ' + m); };
const ok = m => console.log('PASS ' + m);

(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport:{ width:1280, height:800 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e).split('\n')[0]));
  await p.goto(`http://localhost:${PORT}/index.html?test=1`, { waitUntil:'load' });
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', null); travelTo('ardhaven'); });
  await p.waitForTimeout(700);

  // ── §0 TỰ KIỂM CẢNH DỰNG ────────────────────────────────────────────────────────
  // Không có bước này thì `vatTo` rỗng hay `GATES` lọc sai cũng cho mọi mệnh đề dưới xanh.
  const r0 = await p.evaluate(() => ({
    soRia: GATES.filter(g => g.map === 'ardhaven' && !g.portal).length,
    coVom: (MAPS.ardhaven.vatTo || []).filter(v => v.img === 'ct_cong').length,
    tam: typeof LOIRA_TAM === 'number' ? LOIRA_TAM : null,
    dinh: (MAPS.ardhaven.diTrong || []).length,
  }));
  if (r0.soRia < 4) fail(`§0 ardhaven chỉ có ${r0.soRia} cổng rìa — cảnh dựng sai`);
  else if (r0.tam === null) fail('§0 không có LOIRA_TAM — cơ chế chưa tồn tại');
  else ok(`§0 ${r0.soRia} cổng rìa · LOIRA_TAM ${r0.tam} · diTrong ${r0.dinh} đỉnh`);

  // ── §1 BỐN CỔNG VÒM ĐÃ GỠ ──────────────────────────────────────────────────────
  if (r0.coVom) fail(`§1 còn ${r0.coVom} sprite ct_cong trong vatTo — cổng vòm chưa gỡ`);
  else ok('§1 không còn sprite cổng vòm nào trong vatTo');

  // ── §2 BỐN CÁI MIỆNG ĐÃ BO GÓC ─────────────────────────────────────────────────
  // Cuống cổng vuông góc có ĐÚNG 4 đỉnh; bo xong mỗi góc thành một cung nên phải nhiều hơn hẳn.
  const r2 = await p.evaluate(() => {
    const P = MAPS.ardhaven.diTrong;
    return GATES.filter(g => g.map === 'ardhaven' && !g.portal).map(g => ({
      to: g.to,
      dinh: P.filter(q => Math.hypot(q[0]-g.x, q[1]-g.y) <= 600).length,
    }));
  });
  const chuaBo = r2.filter(o => o.dinh < 8);
  if (chuaBo.length) fail(`§2 cuống cổng chưa bo góc: ${chuaBo.map(o=>o.to+'('+o.dinh+' đỉnh)').join(' ')}`);
  else ok(`§2 bốn cuống đều bo góc: ${r2.map(o=>o.to+' '+o.dinh).join(' · ')} đỉnh`);

  // ── §3 CHẠM TỚI LÀ TỰ ĐI RA, KHÔNG BẤM PHÍM NÀO ────────────────────────────────
  const r3 = await p.evaluate(async () => {
    travelTo('ardhaven'); await new Promise(r=>setTimeout(r,300));
    const g = GATES.find(x => x.map === 'ardhaven' && x.to === 'chungnam');
    // đi ra khỏi khoá hạ cánh trước, rồi mới bước vào miệng
    player.x = g.x - 400; player.y = g.y; moveTarget = null; update(1/60);
    player.x = g.x - 10;  player.y = g.y; moveTarget = null;
    for (let i = 0; i < 6 && curMap === 'ardhaven'; i++) update(1/60);
    return { map: curMap };
  });
  if (r3.map !== 'chungnam') fail(`§3 đứng ngay lối ra mà KHÔNG tự đi ra — vẫn ở ${r3.map}`);
  else ok('§3 chạm lối ra là tự sang map, không bấm phím nào');

  // ── §4a KHÔNG DỘI NGƯỢC Ở CẢNH THẬT ───────────────────────────────────────────
  const r4 = await p.evaluate(async () => {
    const batDau = curMap, nhay = [];
    for (let i = 0; i < 180; i++){ update(1/60); if (curMap !== batDau) nhay.push(curMap); }
    return { batDau, doi: nhay.length, cuoi: curMap };
  });
  if (r4.doi) fail(`§4a vừa tới ${r4.batDau} đã bị bắn đi ${r4.doi} lần (cuối: ${r4.cuoi})`);
  else ok(`§4a đứng yên 180 nhịp ở ${r4.batDau}: không dội ngược`);

  // ── §4b KHOÁ HẠ CÁNH — PHẢI TỰ DỰNG RA CÁI CA NGUY HIỂM ────────────────────────
  // ⚠ §4a MỘT MÌNH KHÔNG GÁC ĐƯỢC GÌ, và phép thử ngược đã chứng minh: gỡ hẳn cái khoá ra thì
  // §4a VẪN XANH. Lý do là dữ liệu hiện nay không có cặp map nào nguy hiểm — điểm hạ cánh cách
  // cổng về 127-400px, đều ngoài `LOIRA_TAM`. Tức cái khoá đúng là KHÔNG BAO GIỜ BẬT ở cảnh
  // thật, và một mệnh đề đo cảnh thật thì xanh dù cơ chế có hay không.
  //
  // ⇒ Dựng thẳng cái ca nó sinh ra để chặn: dời ĐIỂM HẠ CÁNH về đúng chỗ cổng về. Không có
  // khoá thì người chơi vào map rồi bị bắn ngược ra ngay khung sau, và kẹt dội mãi.
  const r4b = await p.evaluate(async () => {
    travelTo('ardhaven'); await new Promise(r => setTimeout(r, 300));
    const ve = GATES.find(x => x.map === 'chungnam' && x.to === 'ardhaven');
    const cu = MAPS.chungnam.spawnFrom.ardhaven;
    MAPS.chungnam.spawnFrom.ardhaven = { x: ve.x, y: ve.y };          // hạ cánh ĐÈ LÊN cổng về
    travelTo('chungnam', 'ardhaven'); await new Promise(r => setTimeout(r, 300));
    const vao = curMap, cach = Math.round(Math.hypot(player.x - ve.x, player.y - ve.y));
    let doi = 0;
    for (let i = 0; i < 120; i++){ update(1/60); if (curMap !== 'chungnam'){ doi++; break; } }
    const cuoi = curMap;
    MAPS.chungnam.spawnFrom.ardhaven = cu;                            // trả lại, đừng để rò sang mục sau
    travelTo('ardhaven'); await new Promise(r => setTimeout(r, 250));
    return { vao, cach, doi, cuoi, tam: LOIRA_TAM };
  });
  // tự kiểm cảnh dựng: nếu không thật sự hạ cánh ĐÈ LÊN cổng thì mục này không đo được gì
  if (r4b.vao !== 'chungnam' || r4b.cach >= r4b.tam)
    fail(`§4b cảnh dựng hỏng: vào ${r4b.vao}, hạ cánh cách cổng ${r4b.cach}px (cần < ${r4b.tam})`);
  else if (r4b.doi) fail(`§4b hạ cánh ĐÈ LÊN cổng về ⇒ bị bắn ngược ra ${r4b.cuoi} — khoá không chạy`);
  else ok(`§4b hạ cánh đè lên cổng (cách ${r4b.cach}px < ${r4b.tam}): khoá giữ, không dội`);

  // ── §5 KHOÁ PHẢI NHẢ — đi ra xa rồi quay lại thì vẫn đi được ───────────────────
  // ⚠ TỰ DỰNG CẢNH. §4b kết thúc bằng một lượt `travelTo('ardhaven')` để trả lại bảng dữ liệu
  // nó vừa mượn, nên §5 thừa hưởng `curMap === 'ardhaven'` và đi tìm "cổng về ardhaven" trên
  // chính ardhaven — không có. Mục nào đổi map thì mục sau phải dựng lại cảnh của mình, và
  // phải TỰ KIỂM là đã dựng được. Đúng bài học đã ghi cho `test_tamphap §2`.
  const r5 = await p.evaluate(async () => {
    if (curMap !== 'chungnam'){ travelTo('chungnam'); await new Promise(r => setTimeout(r, 300)); }
    if (curMap !== 'chungnam') return { bo: true, vi: 'không vào được chungnam' };
    const g = GATES.find(x => x.map === curMap && x.to === 'ardhaven');
    if (!g) return { bo: true, vi: 'chungnam không có cổng về ardhaven' };
    player.x = g.x + 700; player.y = g.y + 500; moveTarget = null; update(1/60);   // ra xa ⇒ nhả khoá
    player.x = g.x; player.y = g.y; moveTarget = null;
    for (let i = 0; i < 6 && curMap !== 'ardhaven'; i++) update(1/60);
    return { map: curMap };
  });
  if (r5.bo) fail('§5 cảnh dựng hỏng: ' + r5.vi);
  else if (r5.map !== 'ardhaven') fail(`§5 khoá hạ cánh KHÔNG nhả — quay lại lối ra mà vẫn kẹt ở ${r5.map}`);
  else ok('§5 đi xa rồi quay lại: khoá nhả, đi ra được');

  // ── §6 PORTAL KHÔNG TỰ ĐI — `ardhaven→pvp` hạ cánh cách cổng về ĐÚNG 0px ────────
  const r6 = await p.evaluate(async () => {
    travelTo('ardhaven'); await new Promise(r=>setTimeout(r,300));
    const g = GATES.find(x => x.map === 'ardhaven' && x.portal && x.to === 'pvp');
    player.x = g.x - 400; player.y = g.y; moveTarget = null; update(1/60);
    player.x = g.x; player.y = g.y; moveTarget = null;
    for (let i = 0; i < 30; i++) update(1/60);
    return { map: curMap, coPortal: !!g };
  });
  if (!r6.coPortal) fail('§6 không thấy portal Sàn Đấu — cảnh dựng sai');
  else if (r6.map !== 'ardhaven') fail(`§6 đứng lên portal là bị hút vào ${r6.map} — portal phải bấm G`);
  else ok('§6 portal không tự hút: vẫn phải bấm G');

  // ── §7 MỌI CỔNG RÌA ĐỀU NÓI ĐƯỢC NÓ DẪN ĐI ĐÂU ─────────────────────────────────
  // Một lối ra không có chữ thì người chơi chỉ thấy một vệt sáng dưới đất.
  const r7 = await p.evaluate(() => GATES.filter(g => !g.portal)
    .map(g => ({ m: g.map, to: g.to, ten: loiRaTen(g), huong: loiRaHuong(g) }))
    .filter(o => !o.ten || !o.huong));
  if (r7.length) fail(`§7 ${r7.length} cổng rìa không ra nổi tên/hướng: ${r7.slice(0,3).map(o=>o.m+'→'+o.to).join(' ')}`);
  else ok('§7 mọi cổng rìa đều có tên map đích và hướng ra');

  // ── §8 CÁI MIỆNG PHẢI ĐỌC ĐƯỢC — đo điểm ảnh, không tin con mắt ────────────────
  // Bản đầu tô `rgba(232,224,203,.42)` và chụp ra thì gần như không thấy gì: nền ở bốn cổng
  // sáng 103-181. Mệnh đề này ghim lại cái cặp tương phản đã chữa nó, để không ai lặng lẽ
  // làm nhạt đi.
  //
  // ⚠ ĐẶT CHỖ RỒI PHẢI ĐỂ VÒNG GAME CHẠY. `capNhatTamNhin()` chỉ KẸP lại giới hạn, nó không
  // kéo camera tới người chơi — camera đi theo trong `update()`. Bản đầu của mục này gọi
  // `capNhatTamNhin(); render()` rồi đo ngay, và cả bốn điểm đo rơi ra ngoài khung (camera
  // vẫn đứng ở chỗ cũ) ⇒ `getImageData` kẹp về góc và trả 0 ở mọi cột. Trông y hệt
  // "không vẽ gì cả".
  await p.evaluate(() => { travelTo('ardhaven'); });
  await p.waitForTimeout(1200);
  const r8 = [];
  for (const to of ['ngoai','tuyettinh','corran','chungnam']){
    await p.evaluate((to) => {
      const g = GATES.find(x => x.map === 'ardhaven' && x.to === to);
      const [hx, hy] = loiRaHuong(g);
      player.x = g.x - hx * 120; player.y = g.y - hy * 120; moveTarget = null;
    }, to);
    await p.waitForTimeout(900);          // camera LƯỚT theo, 450ms chưa bắt kịp — xem chú thích trên
    r8.push(await p.evaluate((to) => {
      const g = GATES.find(x => x.map === 'ardhaven' && x.to === to);
      const z = ZOOM_MUC[ZOOM_CHON], tl = canvas.width / (VW * z);
      const sx = Math.round((g.x - camera.x) * z * tl), sy = Math.round((g.y - camera.y) * z * tl);
      const lay = (dx, dy) => { const d = ctx.getImageData(sx+dx, sy+dy, 60, 32).data;
        let s = 0, n = 0; for (let i = 0; i < d.length; i += 4){ s += d[i]*0.299 + d[i+1]*0.587 + d[i+2]*0.114; n++; }
        return s / n; };
      const [hx, hy] = loiRaHuong(g);
      return { to, sx, sy,
               chenh: Math.round(lay(-30,-16) - lay(Math.round(-hy*230)-30, Math.round(hx*230*0.55)-16)),
               // lề theo TRỤC: ô đối chứng lệch ngang tới 230px nên trục ngang cần 300, còn
               // trục dọc chỉ cần đủ chứa ô 32px. Một lề tròn 260 cho cả hai thì hai cổng
               // Bắc/Nam trượt vì camera bị KẸP ở mép map — và đó là lỗi của phép đo, không
               // phải của cái miệng.
               trongKhung: sx > 300 && sy > 60 && sx < canvas.width-300 && sy < canvas.height-60 };
    }, to));
  }
  const ngoaiKhung = r8.filter(o => !o.trongKhung);
  const nhat = r8.filter(o => o.trongKhung && o.chenh < 18);
  if (ngoaiKhung.length)
    fail(`§8 cảnh dựng hỏng: ${ngoaiKhung.map(o=>o.to+`(${o.sx},${o.sy})`).join(' ')} rơi sát mép khung — số đo vô nghĩa`);
  else if (nhat.length)
    fail(`§8 miệng lối ra CHÌM vào nền: ${nhat.map(o=>o.to+' chênh '+o.chenh).join(' · ')} (cần ≥18)`);
  else ok(`§8 bốn miệng đều nổi trên nền: ${r8.map(o=>o.to+' +'+o.chenh).join(' · ')}`);

  if (errs.length) fail('lỗi trang: ' + errs.slice(0,3).join(' | '));
  console.log(bad ? `\n${bad} LỖI` : '\nTẤT CẢ XANH');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
