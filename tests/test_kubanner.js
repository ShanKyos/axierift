// BANNER NHÂN VẬT của bảng Khế Ước — key art kiểu Genshin/Honkai.
//
// Sáu mệnh đề. Bốn trong sáu gác những thứ KHÔNG ném lỗi và KHÔNG hiện ra:
//
//  ① Hai banner dựng được, và art THẬT SỰ vẽ ra — không phải một khung đen có chữ đè lên.
//  ② KHÔNG ĐỤNG VÀO `player`. Cách "dễ" để dựng thân mẫu là tráo `player.equip`/`player.sect`
//     rồi trả lại; một lần ném lỗi giữa chừng là người chơi mất sạch đồ, và không đường nào lần
//     ra. Mục này chụp nguyên `player` trước/sau rồi đòi trùng khít TỪNG KÝ TỰ.
//  ③ SUY TỪ DỮ LIỆU, không chép cứng: trỏ `KU_BANNER` sang lớp khác thì CẢ chữ LẪN ảnh phải đổi
//     theo. Chỉ hỏi chữ là chưa đủ — chữ đọc từ `SECTS`, còn ảnh đi qua `heroSprite`; hai đường
//     khác nhau, và đường ảnh mới là đường dễ đứng yên vì bộ đệm.
//  ④ Thân là ART NƯỚNG THẬT, không phải hình dựng bằng đường. `heroSprite()` LUÔN trả về một
//     canvas — chưa có art thì nó dựng hiệp sĩ xám mũ sừng, tức "nhân vật fake" mà Quy tắc số 3
//     cấm. Ở banner còn tệ hơn: đây là chỗ HỨA HẸN.
//  ⑤ Vòng rAF phải TỰ TẮT khi bảng đóng. Đếm số lần vẽ, đừng đếm điểm ảnh — một canvas vẽ lại
//     đúng cùng một hình thì đứng im y hệt một canvas đã dừng.
//  ⑥ Lớp KHÔNG có tranh Trấn Phái (Spellblade) vẫn dựng được banner, không ném lỗi.
const { chromium } = require('playwright');
const PORT = process.argv[2] || '8853';
const LOP = ['thieulam', 'toanchan', 'baidasan', 'minhgiao', 'bug'];

(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport:{ width:1280, height:900 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e).split('\n')[0]));
  await p.goto('http://localhost:' + PORT + '/index.html');
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(400);
  let bad = 0; const fail = m => { console.log('FAIL', m); bad++; };
  const pass = m => console.log('PASS', m);

  // Mở bảng rồi CHỜ ĐÚNG ĐIỀU KIỆN (art đã sẵn), đừng chờ một con số: bộ giáp giai 7 là năm
  // lớp rời tải qua mạng, và dưới tải thì nó lâu hơn bất cứ con số nào mình chọn.
  const mo = () => p.evaluate(async () => {
    window.__kbDem = {};
    openKheUoc();
    for (let i = 0; i < 120; i++){
      const ok = Object.keys(KU_BANNER).every(bid => {
        const t = kbTin(bid), th = kbThan(bid);
        return t && th && ccArtSan(t.lop, heroTier(th), gearVisual(th));
      });
      if (ok && (window.__kbDem.gk || 0) > 2) return true;
      await new Promise(r => setTimeout(r, 100));
    }
    return false;
  });

  await p.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    player.level = 60; player.lvPeak = 60; vhAutoLearn(); calcDerived();
    chiState().ve.gk = 30; chiState().ve.cx = 30;
  });
  const san1 = await mo();

  // ── ① dựng được, và có vẽ ra thật ────────────────────────────────────────
  const r1 = await p.evaluate(() => {
    const cs = [...document.querySelectorAll('canvas.ku-art')];
    const dem = c => {
      const g = c.getContext('2d');
      const px = g.getImageData(0, 0, c.width, c.height).data;
      let n = 0; for (let q = 3; q < px.length; q += 4) if (px[q] > 24) n++;
      return n;
    };
    return { n: cs.length, bn: cs.map(c => c.dataset.bn),
             co: cs.map(c => [c.clientWidth, c.clientHeight]),
             ve: cs.map(dem), tong: cs.map(c => c.width * c.height) };
  });
  console.log('①', JSON.stringify(r1));
  if (!san1) fail('① art banner không sẵn sau 12 giây — mục ③④ bên dưới đo trên khung trống');
  else if (r1.n !== Object.keys(await p.evaluate(() => KU_BANNER)).length)
    fail(`① có ${r1.n} canvas banner, bảng KU_BANNER khai khác`);
  else if (r1.co.some(c => c[0] < 200 || c[1] < 120))
    fail(`① khung banner quá nhỏ: ${JSON.stringify(r1.co)}`);
  else if (r1.ve.some((v, i) => v < r1.tong[i] * 0.25))
    fail(`① canvas gần như TRỐNG (${r1.ve.join(' · ')} / ${r1.tong.join(' · ')}) — key art không vẽ ra`);
  else pass(`① hai banner dựng được, phủ ${r1.ve.map((v,i)=>Math.round(v/r1.tong[i]*100)+'%').join(' · ')}`);

  // ── ② KHÔNG đụng vào player ──────────────────────────────────────────────
  const r2 = await p.evaluate(async () => {
    // ⚠ HAI ĐIỀU KIỆN, VÀ BẢN ĐẦU THIẾU CẢ HAI — thử ngược bắt được:
    //  · `kbXoaNho()` trước khi đo, nếu không `kbThan` memo-hoá và thân hàm KHÔNG chạy lại ⇒
    //    mục này chấm một đường mã chưa hề được thực thi;
    //  · và phải DỰNG LẠI NHÂN VẬT trước khi chụp. `mo()` ở trên đã gọi `kbThan` một lượt, nên
    //    nếu hàm ấy làm bẩn `player` thì nó BẨN SẴN từ lúc chụp — hai ảnh chụp trùng nhau và
    //    mục này xanh trong khi `player.sect` đã bị đổi từ trước.
    startGame('thieulam', null);
    player.level = 60; player.lvPeak = 60; calcDerived();
    window.kbXoaNho();
    const truoc = JSON.stringify({ e: player.equip, s: player.sect, l: player.level });
    for (const bid of Object.keys(KU_BANNER)) kbThan(bid);
    renderKheUoc();
    await new Promise(r => setTimeout(r, 600));
    return { giong: JSON.stringify({ e: player.equip, s: player.sect, l: player.level }) === truoc };
  });
  console.log('②', JSON.stringify(r2));
  if (!r2.giong) fail('② dựng banner làm ĐỔI `player` — thân mẫu phải là một đối tượng RIÊNG');
  else pass('② `player` không suy suyển một ký tự');

  // ── ③ trỏ sang lớp khác ⇒ CHỮ và ẢNH đều đổi ─────────────────────────────
  // ⚠ ĐO RIÊNG VÙNG THÂN, và lấy TOÀN BỘ điểm ảnh của nó chứ không lấy mẫu thưa cả khung.
  // Nền và tranh Trấn Phái đổi theo lớp qua `tin` — tức chúng đổi kể cả khi thân bị ghim cứng
  // một lớp. Đo cả khung thì hai thứ ấy một mình đã vượt ngưỡng, và mục này XANH trong khi
  // key art nói dối. Thử ngược (ghim `'thieulam'` ở chỗ vẽ thân) bắt được đúng chỗ đó.
  // Bật seam CHỈ-THÂN quanh phép đo: nền và tranh Trấn Phái cũng đổi theo lớp, nên đo cả khung
  // thì một mình chúng đã vượt ngưỡng và mục này xanh kể cả khi thân bị ghim cứng.
  const anh = () => p.evaluate(async () => {
    window.__kbChiThan = true;
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const c = document.querySelector('canvas.ku-art[data-bn="gk"]');
    const g = c.getContext('2d');
    // hộp quanh chỗ nhân vật đứng: `cx = W*0.70`, thân cao KB_THAN, gót ở H*0.94
    const d = Math.min(2, window.devicePixelRatio || 1);
    const W = c.clientWidth, H = c.clientHeight;
    const x0 = Math.round((W * 0.70 - 62) * d), y0 = Math.round((H * 0.94 - 150) * d);
    const w = Math.round(124 * d), h = Math.round(150 * d);
    const px = g.getImageData(x0, y0, w, h).data;
    const o = []; for (let q = 0; q < px.length; q += 4 * 13) o.push(px[q], px[q+1], px[q+2], px[q+3]);
    const chu = document.querySelector('.ku-key .ku-key-bo');
    const tp = document.querySelector('.ku-key .ku-key-tp');
    window.__kbChiThan = false;
    return { mau: o, bo: chu && chu.textContent, tp: tp && tp.textContent, o:[x0,y0,w,h] };
  });
  const lech = (a, c) => a.reduce((n, v, i) => n + (Math.abs(v - c[i]) > 18 ? 1 : 0), 0);
  const cu = await p.evaluate(() => KU_BANNER.gk.lop);
  const khac = LOP.find(l => l !== cu);
  const a1 = await anh();
  await p.evaluate(l => { KU_BANNER.gk.lop = l; window.kbXoaNho(); }, khac);
  const san2 = await mo();
  const a2 = await anh();
  const d3 = lech(a1.mau, a2.mau);
  console.log('③', JSON.stringify({ cu, khac, boCu:a1.bo, boMoi:a2.bo, tpCu:a1.tp, tpMoi:a2.tp,
                                    lechMau:d3, mau:a1.mau.length }));
  if (!san2) fail('③ dựng cảnh hỏng — art của lớp mới không tải được, phép so vô nghĩa');
  else if (a1.bo === a2.bo) fail(`③ đổi lớp mà tên bộ vẫn "${a1.bo}" — banner không suy từ dữ liệu`);
  else if (a1.tp === a2.tp) fail(`③ đổi lớp mà Trấn Phái vẫn "${a1.tp}"`);
  else if (d3 < a1.mau.length * 0.12)
    fail(`③ đổi lớp mà ẢNH gần như không đổi (${d3}/${a1.mau.length} mẫu) — chữ đổi còn key art `
       + 'đứng yên, tức người chơi đọc một đằng nhìn một nẻo');
  else pass(`③ đổi lớp: "${a1.bo}"→"${a2.bo}", ảnh đổi ${d3}/${a1.mau.length} mẫu`);
  await p.evaluate(l => { KU_BANNER.gk.lop = l; window.kbXoaNho(); }, cu);
  await mo();

  // ── ④ art nướng THẬT cho MỌI lớp bảng có thể trỏ tới ─────────────────────
  const r4 = await p.evaluate(async (LOP) => {
    const ra = {};
    for (const l of LOP){
      KU_BANNER.gk.lop = l; window.kbXoaNho();
      const t = kbTin('gk'), th = kbThan('gk');
      const gv = gearVisual(th), tier = heroTier(th);
      let san = false;
      for (let i = 0; i < 100 && !san; i++){
        san = ccArtSan(l, tier, gv);
        if (!san) await new Promise(r => setTimeout(r, 100));
      }
      ra[l] = { san, tier, bo: nvBoTen(l, tier, gv, ''), nuong: !!NV_GIAP[l + '|' + tier],
                tp: t.tp, atlas: t.atlas };
    }
    return ra;
  }, LOP);
  console.log('④', JSON.stringify(r4));
  // ⚠ VÀ PHẢI HỎI CẢ CHỖ DÙNG, không chỉ hỏi cái bảng — ĐO HÀNH VI, đừng dò chuỗi mã nguồn.
  // Bản đầu của mục này `grep` chữ `ccArtSan(` trong thân `kbVeMot`, và nó XANH cả khi đã gỡ
  // hẳn cái van: chuỗi ấy còn nằm trong một dòng CHÚ THÍCH ngay trên. *Mỏ neo của phép thử
  // ngược phải là MÃ, không phải văn xuôi.*
  // Cảnh đo: chặn hẳn art giáp ở tầng mạng rồi mở bảng. Có van thì banner để TRỐNG chỗ nhân
  // vật; gỡ van thì `heroSprite()` dựng hiệp sĩ xám mũ sừng áo choàng đỏ — tức "nhân vật fake"
  // mà Quy tắc số 3 cấm, và ở một cái banner thì đó là hứa bằng thứ người chơi sẽ không nhận.
  const p2 = await b.newPage({ viewport:{ width:1280, height:900 } });
  await p2.route('**/assets/nv/**', r => r.abort());
  await p2.goto('http://localhost:' + PORT + '/index.html');
  await p2.waitForFunction(() => window.__gameReady).catch(()=>{});
  const r4b = await p2.evaluate(async () => {
    window.TEST_MODE = true; startGame('thieulam', null);
    player.level = 60; player.lvPeak = 60; calcDerived();
    chiState().ve.gk = 30; openKheUoc();
    await new Promise(r => setTimeout(r, 2500));
    window.__kbChiThan = true;
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const c = document.querySelector('canvas.ku-art[data-bn="gk"]');
    if (!c) return { thieuKhung: true };
    const d = Math.min(2, window.devicePixelRatio || 1);
    const W = c.clientWidth, H = c.clientHeight;
    const px = c.getContext('2d').getImageData(
      Math.round((W*0.70 - 62)*d), Math.round((H*0.94 - 150)*d),
      Math.round(124*d), Math.round(150*d)).data;
    let n = 0; for (let q = 3; q < px.length; q += 4) if (px[q] > 40) n++;
    window.__kbChiThan = false;
    const t = kbTin('gk'), th = kbThan('gk');
    return { ve: n, o: px.length / 4, san: ccArtSan(t.lop, heroTier(th), gearVisual(th)) };
  });
  await p2.close();
  console.log('④b (chặn art giáp)', JSON.stringify(r4b));
  const hong4 = LOP.filter(l => !r4[l].san || !r4[l].nuong);
  if (r4b.thieuKhung) fail('④ chặn art rồi thì banner không dựng nổi cả cái khung');
  else if (r4b.san) fail('④ dựng cảnh hỏng — chặn art giáp mà `ccArtSan` vẫn báo SẴN');
  else if (r4b.ve > r4b.o * 0.04)
    fail(`④ chặn art giáp mà banner VẪN vẽ ra một thân người (${r4b.ve}/${r4b.o} điểm ảnh) — `
       + 'van `ccArtSan` không giữ, nên mấy trăm mili giây đầu người chơi thấy hiệp sĩ dựng '
       + 'bằng ĐƯỜNG, thứ Quy tắc số 3 cấm');
  else if (hong4.length)
    fail(`④ ${hong4.join(' · ')}: chưa có art giáp nướng ở giai ${r4[hong4[0]].tier} — banner sẽ `
       + 'rơi về hình dựng bằng ĐƯỜNG, tức "nhân vật fake" mà Quy tắc số 3 cấm');
  else pass(`④ cả ${LOP.length} lớp đều có bộ giai 7 nướng sẵn, van `
          + '`ccArtSan` mở: ' + LOP.map(l => r4[l].bo).join(' · '));

  // ── ⑥ lớp không có tranh Trấn Phái vẫn dựng được ─────────────────────────
  const khongTranh = LOP.filter(l => !r4[l].atlas);
  const r6 = await p.evaluate(async (l) => {
    if (!l) return { boQua: true };
    KU_BANNER.gk.lop = l; window.kbXoaNho();
    const n0 = errsLen();
    openKheUoc();
    await new Promise(r => setTimeout(r, 900));
    const c = document.querySelector('canvas.ku-art[data-bn="gk"]');
    const g = c && c.getContext('2d');
    let ve = 0;
    if (g){ const px = g.getImageData(0,0,c.width,c.height).data;
            for (let q = 3; q < px.length; q += 4) if (px[q] > 24) ve++; }
    return { lop:l, ve, tong: c ? c.width*c.height : 0 };
    function errsLen(){ return 0; }
  }, khongTranh[0] || null);
  console.log('⑥', JSON.stringify({ khongTranh, ...r6 }));
  if (r6.boQua) console.log('    (bỏ qua ⑥: lớp nào cũng đã có tranh Trấn Phái)');
  else if (r6.ve < r6.tong * 0.25)
    fail(`⑥ ${r6.lop} không có tranh Trấn Phái và banner cũng TRỐNG — thiếu một lớp art không `
       + 'được phép làm hỏng cả khung');
  else pass(`⑥ ${r6.lop} chưa có tranh Trấn Phái, banner vẫn dựng (phủ `
          + `${Math.round(r6.ve / r6.tong * 100)}%)`);
  await p.evaluate(l => { KU_BANNER.gk.lop = l; window.kbXoaNho(); }, cu);

  // ── ⑤ đóng bảng ⇒ vòng vẽ TỰ TẮT ─────────────────────────────────────────
  // ⚠ ĐỌC `__kbVong` (số nhịp rAF), KHÔNG đọc `__kbDem` (số lượt VẼ). Sau khi đóng bảng thì
  // danh sách canvas rỗng nên thân vòng không chạy ⇒ bộ đếm VẼ đứng im dù vòng vẫn quay. Bản
  // đầu của mục này đọc `__kbDem` và XANH kể cả khi đã gỡ hẳn phép tự tắt — thử ngược bắt được.
  const r5 = await p.evaluate(async () => {
    openKheUoc();
    await new Promise(r => setTimeout(r, 400));
    const a0 = window.__kbVong || 0;
    await new Promise(r => setTimeout(r, 300));
    const van = (window.__kbVong || 0) > a0 + 5;           // tự kiểm: nó ĐANG quay thật
    closePanels();
    await new Promise(r => setTimeout(r, 400));
    const a = window.__kbVong || 0;
    await new Promise(r => setTimeout(r, 700));
    return { van, sauDong: (window.__kbVong || 0) - a };
  });
  console.log('⑤', JSON.stringify(r5));
  if (!r5.van) fail('⑤ dựng cảnh hỏng — vòng vẽ banner không chạy lúc bảng đang mở');
  else if (r5.sauDong > 0)
    fail(`⑤ đóng bảng rồi mà vòng vẽ vẫn chạy (${r5.sauDong} lần trong 0,7 giây) — ăn CPU tới `
       + 'hết phiên, không lỗi nào báo. Cùng bẫy đã ghi cho `titleAlive()`');
  else pass('⑤ đóng bảng thì vòng vẽ tự tắt');

  if (errs.length){ console.log('LỖI TRANG:', errs.slice(0,5).join(' | ')); bad++; }
  console.log(bad ? `\n✖ ${bad} lỗi` : '\n✔ tất cả xanh');
  await b.close(); process.exit(bad ? 1 : 0);
})();
