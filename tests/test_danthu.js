// ĐÀN THÚ HOANG — sinh vật nền KHÔNG tham chiến.
//
// Bài kiểm này gác đúng một điều: đàn thú phải giữ nguyên là NỀN. Mọi hỏng hóc của một hệ như
// thế này đều đi về một trong hai phía — hoặc nó lặng lẽ biến thành nội dung (săn được, rơi đồ,
// AUTO dọn sạch trong một phút), hoặc nó biến thành phiền (chắn đường, nhắm nhầm mục tiêu).
//
//   1. Bãi cỏ ĐỨNG YÊN qua nhiều ngày và nhiều lần dựng lại — nó là mốc định hướng, không phải
//      sự kiện. (Vỉa Cốt là thứ DUY NHẤT được phép đổi chỗ theo ngày; test_ruong §2 gác chỗ tách
//      đó cho Rương Canh, đây gác cho đàn thú.)
//   2. Bãi cỏ cách MỌI bãi quái ≥ THU_CACH_BAI: chỗ nào đánh nhau thì chỗ đó không có thú.
//   3. Thú KHÔNG nằm trong `mobs` — không máu, không bị nhắm, không rơi gì, AUTO không thấy.
//   4. Người chơi tới gần thì cả đàn bỏ chạy, và chạy RA XA thật (không chỉ đổi cờ trạng thái).
//   5. Hoảng LÂY THÀNH SÓNG: con ở xa người chơi, chỉ gần một con đang chạy, cũng phải chạy.
//   6. Đổi map thì đàn cũ biến mất — cùng họ lỗi với `groundLoot` treo lại từ map trước.
//   7. Không con nào đứng trong vật cản.
//   8. Mọi loài khai trong `MAPS[*].thu.loai` đều có hình học trong `THU_ANH` VÀ có tệp .webp.
//   9. Loài ĐẦU của mỗi map là loài chủ đạo — đông hơn hẳn hai loài kia.
//
// ⚠ Mệnh đề 8 không thừa. Cùng một kiểu hỏng đã xảy ra thật với `ISO_NEO` (xem CLAUDE.md): dữ
// liệu khai một cái tên, bảng tra không có tên đó, hàm vẽ `return` sớm, và SÁU MAP mất sạch cây
// mà không một bài kiểm nào đỏ. `veThu()` cũng `return` sớm y hệt — nên phải gác y hệt.
const { chromium } = require('playwright');
let bad = 0; const fail = m => { bad++; console.log('FAIL ' + m); };
(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport:{width:1280,height:800} });
  const errs = []; p.on('pageerror', e => errs.push(String(e).split('\n')[0]));
  await p.goto('http://localhost:8853/index.html?max=1', { waitUntil:'load' });
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', null); });
  await p.waitForTimeout(900);

  // ---- 0. map nào khai `thu` ----
  const MAPS_THU = await p.evaluate(() => Object.keys(MAPS).filter(k => MAPS[k].thu));
  console.log('0) map có đàn thú:', JSON.stringify(MAPS_THU));
  if (!MAPS_THU.length) { fail('không map nào khai `thu` — cả hệ chết mà không ai biết');
    console.log(`\n${bad} LỖI`); await b.close(); process.exit(1); }

  // ---- 8. ART: mọi loài được khai đều phải có hình học VÀ có tệp ----
  const r8 = await p.evaluate(async () => {
    const can = new Set();
    for (const k in MAPS) for (const n of ((MAPS[k].thu && MAPS[k].thu.loai) || [])) can.add(n);
    const o = (typeof THU_ANH !== 'undefined' && THU_ANH.o) || {};
    const thieuHinhHoc = [...can].filter(n => !o[n]);
    const hong = (await Promise.all([...can].map(n => new Promise(res => {
      const im = new Image(); im.onload = () => res(null); im.onerror = () => res(n);
      im.src = 'assets/thu/' + n + '.webp';
    })))).filter(Boolean);
    return { soLoai: can.size, thieuHinhHoc, hong, soO: Object.keys(o).length };
  });
  console.log('8) art:', JSON.stringify(r8));
  if (r8.thieuHinhHoc.length)
    fail(`⑧ ${r8.thieuHinhHoc.length} loài khai mà KHÔNG có trong THU_ANH ⇒ veThu() bỏ qua im lặng: ${r8.thieuHinhHoc.join(', ')}`);
  if (r8.hong.length) fail(`⑧ ${r8.hong.length} loài không tải được .webp: ${r8.hong.join(', ')}`);

  // ---- 1 + 2 + 3 + 7 + 9: quét TỪNG map ----
  for (const MID of MAPS_THU){
    const r = await p.evaluate((mid) => {
      // bãi cỏ đứng yên qua ngày và qua nhiều lần bốc
      const a = thuBaiCo(mid);
      _thuBaiCache = {};
      const cu = Date.prototype.toDateString;
      Date.prototype.toDateString = function(){ return 'Wed Jan 01 2031'; };
      const b2 = thuBaiCo(mid);
      Date.prototype.toDateString = cu;
      _thuBaiCache = {};
      const b3 = thuBaiCo(mid);
      const bai = thuBaiCo(mid);
      const gan = packsOf(mid).map(k => Math.round(dist(bai.x, bai.y, k.x, k.y))).sort((x,y)=>x-y);

      applyTestBoost(); travelTo('ardhaven'); travelTo(mid);
      const dem = {};
      for (const t of thuDan) dem[t.loai] = (dem[t.loai] || 0) + 1;
      const loai = MAPS[mid].thu.loai;
      return { mid, doiNgay: !(a && b2 && a.x === b2.x && a.y === b2.y),
        doiLuot: !(a && b3 && a.x === b3.x && a.y === b3.y),
        ganNhat: gan[0], trongCan: inObstacle(mid, bai.x, bai.y, 60),
        n: thuDan.length, khai: MAPS[mid].thu.dan,
        trongMobs: thuDan.filter(t => mobs.includes(t)).length,
        coMau: thuDan.filter(t => t.hp != null || t.maxHp != null || t.def).length,
        ket: thuDan.filter(t => inObstacle(mid, t.x, t.y, 14)).length,
        ngoaiKho: thuDan.filter(t => t.x < 0 || t.y < 0 || t.x > MAP.w || t.y > MAP.h).length,
        soLoai: new Set(thuDan.map(t => t.loai)).size,
        chuDao: loai[0], demChuDao: dem[loai[0]] || 0,
        demKhac: Math.max(0, ...loai.slice(1).map(x => dem[x] || 0)) };
    }, MID);
    console.log(`   ${r.mid.padEnd(10)} ${r.n}/${r.khai} con · ${r.soLoai} loài · chủ đạo ${r.chuDao} ${r.demChuDao} vs ${r.demKhac} · bãi cách quái ${r.ganNhat}px`);
    if (r.doiNgay) fail(`① [${r.mid}] bãi cỏ ĐỔI CHỖ theo ngày — nó là mốc định hướng, chỉ Vỉa Cốt được đổi theo ngày`);
    if (r.doiLuot) fail(`① [${r.mid}] bãi cỏ đổi chỗ giữa hai lần bốc trong CÙNG một ngày — hạt không bốc từ tên map`);
    // Nới 90px: chỗ đặt tự nới khi map chật (`noi = 90` sau 450 lượt thử), nên đòi đúng ngưỡng là
    // đòi một thứ chính mã đã nói rõ là có thể nhượng bộ.
    if (!(r.ganNhat >= 300 - 90))
      fail(`② [${r.mid}] bãi cỏ chỉ cách bãi quái gần nhất ${r.ganNhat}px — thú mọc ngay chỗ đánh nhau`);
    if (r.trongCan) fail(`② [${r.mid}] bãi cỏ nằm trong vật cản`);
    if (!(r.n >= 6)) fail(`③ [${r.mid}] chỉ dựng được ${r.n}/${r.khai} con — một "đàn" dưới 6 con đọc ra là mấy con lạc`);
    if (r.trongMobs) fail(`③ [${r.mid}] ${r.trongMobs} con thú nằm trong mảng \`mobs\` — thành quái, AUTO sẽ dọn sạch`);
    if (r.coMau) fail(`③ [${r.mid}] ${r.coMau} con thú mang máu/def — nó là NỀN, không phải nội dung`);
    if (r.ket) fail(`⑦ [${r.mid}] ${r.ket} con đứng trong vật cản`);
    if (r.ngoaiKho) fail(`⑦ [${r.mid}] ${r.ngoaiKho} con đứng ngoài khổ map`);
    if (r.soLoai < 2) fail(`③ [${r.mid}] đàn chỉ có ${r.soLoai} loài — bóng dáng phải khác nhau mới đọc ra là một đàn, không phải một dãy bản sao`);
    if (!(r.demChuDao > r.demKhac))
      fail(`⑨ [${r.mid}] loài đầu (${r.chuDao}) không chiếm ưu thế: ${r.demChuDao} vs ${r.demKhac} — thuChiaLoai() mất tác dụng, đàn thành ba nhóm bằng nhau`);
  }

  // ---- 4 + 5 + 6: hành vi, đo trên MỘT map là đủ (không phụ thuộc map) ----
  const MID = MAPS_THU[0];
  const r4 = await p.evaluate((mid) => {
    travelTo('ardhaven'); travelTo(mid);
    const bai = thuBaiCo(mid);
    player.x = bai.x; player.y = bai.y; player.auto = false; moveTarget = null;
    const truoc = thuDan.map(t => dist(t.x, t.y, player.x, player.y));
    thuCapNhat(0.016);
    const chay = thuDan.filter(t => t.st === 'chay').length;
    for (let i = 0; i < 45; i++) thuCapNhat(0.016);
    const sau = thuDan.map(t => dist(t.x, t.y, player.x, player.y));
    let xaHon = 0;
    for (let i = 0; i < truoc.length; i++) if (sau[i] > truoc[i] + 8) xaHon++;
    return { n: thuDan.length, chayNgay: chay, xaHon,
      gan: truoc.filter(d => d < THU_SO).length, nguong: THU_SO };
  }, MID);
  console.log('4) bỏ chạy:', JSON.stringify(r4));
  if (!(r4.chayNgay >= r4.gan))
    fail(`④ ${r4.gan} con trong tầm ${r4.nguong}px mà chỉ ${r4.chayNgay} con bỏ chạy`);
  if (!(r4.xaHon >= Math.max(1, Math.round(r4.chayNgay * 0.7))))
    fail(`④ chỉ ${r4.xaHon}/${r4.chayNgay} con thật sự chạy RA XA — đổi cờ trạng thái mà không đổi toạ độ`);

  // Dựng cảnh riêng: một hàng thú cách đều THU_LAY*0.8, người chơi chỉ đủ gần con ĐẦU hàng.
  // Con cuối hàng cách người chơi xa hơn THU_SO rất nhiều, nên nó chỉ có thể chạy vì LÂY.
  const r5 = await p.evaluate((mid) => {
    const b0 = thuBaiCo(mid);
    const buoc = THU_LAY * 0.8, N = 6;
    const mau = MAPS[mid].thu.loai[0];
    thuDan = [];
    for (let i = 0; i < N; i++)
      thuDan.push({ loai: mau, x: b0.x + i * buoc, y: b0.y, hx: b0.x + i * buoc, hy: b0.y,
                    st:'gam', t: 99, dir: 1, ph: 0, tx: b0.x + i * buoc, ty: b0.y });
    player.x = b0.x - THU_SO * 0.6; player.y = b0.y;
    const xaNhat = dist(thuDan[N-1].x, thuDan[N-1].y, player.x, player.y);
    thuCapNhat(0.016);
    return { N, buoc: Math.round(buoc), so: THU_SO, xaNhat: Math.round(xaNhat),
      chay: thuDan.map(t => t.st === 'chay' ? 1 : 0) };
  }, MID);
  console.log('5) sóng hoảng:', JSON.stringify(r5));
  if (!(r5.xaNhat > r5.so))
    fail(`⑤ cảnh dựng sai: con cuối hàng cách người chơi ${r5.xaNhat}px, chưa vượt ${r5.so}px nên nó chạy vì THẤY chứ không vì LÂY`);
  else if (r5.chay.reduce((a,c)=>a+c,0) !== r5.N)
    fail(`⑤ hoảng không truyền hết hàng: ${JSON.stringify(r5.chay)} — lây một vòng thì con ở rìa không bao giờ động đậy`);

  const r6 = await p.evaluate((mid) => {
    const khac = Object.keys(MAPS).find(k => !MAPS[k].thu && MAPS[k].vung);
    travelTo(khac);
    const sau = thuDan.length;
    travelTo(mid);
    return { khac, sau, ve: thuDan.length };
  }, MID);
  console.log('6) đổi map:', JSON.stringify(r6));
  if (r6.sau !== 0) fail(`⑥ sang ${r6.khac} (map không khai \`thu\`) mà còn ${r6.sau} con — đàn của map trước treo lại`);
  if (!(r6.ve >= 6)) fail(`⑥ quay lại ${MID} thì đàn không dựng lại (${r6.ve} con)`);

  if (errs.length) fail('lỗi trang: ' + errs.slice(0,3).join(' | '));
  console.log(bad ? `\n${bad} LỖI` : '\nTẤT CẢ XANH');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
