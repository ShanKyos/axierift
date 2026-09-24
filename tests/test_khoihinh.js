// KHỐI KHUNG HÌNH — mỗi trạng thái phải đọc đúng khối của nó, và bảng hai phải nạp được.
//
// Bài này gác đợt "tận dụng gói Spine": trước đây bộ khung chỉ có 4 khối (đứng · đi · đánh ·
// niệm) trong khi gói có 20 hoạt cảnh. Nay 14 khối, chia hai bảng: bảng một luôn nạp, bảng
// hai nạp khi cần.
//
// Bẫy đã mắc khi viết: đo bằng cách chụp ảnh rồi so pixel thì không phân biệt được "khối sai"
// với "khung sai trong đúng khối". Nên đọc thẳng window.__khoiVe — game gán nó mỗi lần vẽ.
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1000, height: 700 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => { if (m.type() === 'error' && !/404|ERR_CONNECTION/.test(m.text())) errs.push(m.text()); });
  // ⚠ ĐỌC CỔNG TỪ argv — chép cứng 8853 là mọi lượt chạy lẻ đều trỏ vào server đang có ở
  //   8853 chứ không vào cây được truyền, nên PHÉP THỬ NGƯỢC IM LẶNG và người sau kết luận
  //   là mệnh đề yếu. Đã dẫm đúng thế; CLAUDE.md đã ghi bốn bài cùng bệnh trước bài này.
  const CONG = process.argv[2] || '8853';
  await p.goto(`http://localhost:${CONG}/index.html?test=1`);
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(500);
  await p.evaluate(() => { startGame('thieulam', null); });
  await p.waitForTimeout(2200);

  let bad = 0;
  const fail = m => { console.log('FAIL', m); bad++; };
  const pass = m => console.log('OK  ', m);

  // ── 1. Hai bảng khung ─────────────────────────────────────────────────────
  const r1 = await p.evaluate(async () => {
    applyTestBoost(); cheatExec('lv 20');
    for (const sl of HERO_ARMOR_SLOTS) { const it = genSpecific(sl, 1); if (it) player.equip[sl] = it; }
    player.equip.canh = null; calcDerived();
    await new Promise(r => setTimeout(r, 1600));
    const gv = gearVisual(player), t = heroTier(player);
    const b1 = nvBang('thieulam', t, gv, 'i'), b2 = nvBang('thieulam', t, gv, 'h');
    return { bo: nvBoTen('thieulam', t, gv),
             bang1: b1 ? b1.width + 'x' + b1.height : null,
             bang2: b2 ? b2.width + 'x' + b2.height : null,
             soKhoi: Object.keys(HS_FRAMES).length,
             khoiBang2: Object.keys(NV_BANG2).length };
  });
  console.log('1.', JSON.stringify(r1));
  if (!r1.bang1) fail('bảng MỘT không nạp được');
  else if (!r1.bang2) fail('bảng HAI không nạp được — khối trúng đòn/chết sẽ lui về dáng đứng');
  else pass(`hai bảng cùng nạp: ${r1.bang1} và ${r1.bang2}`);
  if (r1.soKhoi < 14) fail(`mới ${r1.soKhoi} khối, mong từ 14`);
  else pass(`${r1.soKhoi} khối, ${r1.khoiBang2} khối ở bảng hai`);

  // ── 2. Mốc khung không được chồng nhau ────────────────────────────────────
  // ⚠ SỐ HÀNG SUY TỪ BẢNG THẬT ĐÃ NẠP, đừng chốt cứng 96 (= 6 hàng × 16 cột).
  // Bảng hai NỚI ĐƯỢC: `dwsl1` có 7 hàng vì khối bay `f` (84) và bay-đánh `g` (96).
  // Và phải BỎ QUA khối mà chính bộ đang đo không dùng được — `f`/`g` gác sau
  // `NV_BO_CO_BAY`/`NV_BO_CO_BAYDANH`, nên bộ không khai hai cờ đó thì hai khối
  // ấy không có đường nào tới được, đòi nó chứa chúng là đòi một thứ bất khả.
  const r2 = await p.evaluate(() => {
    const gv = gearVisual(player), t = heroTier(player);
    const bo = nvBoTen('thieulam', t, gv) || '';
    const boQua = new Set();
    if (!(window.NV_BO_CO_BAY || {})[bo]) boQua.add('f');
    if (!(window.NV_BO_CO_BAYDANH || {})[bo]) boQua.add('g');
    const doi = (bang) => {
      const ks = Object.keys(HS_FRAMES).filter(k => !!NV_BANG2[k] === bang && !boQua.has(k));
      const o = [];
      for (const k of ks) for (let i = 0; i < HS_FRAMES[k]; i++) o.push(nvMoc(k) + i);
      const b = nvBang('thieulam', t, gv, bang ? 'h' : 'i');
      return { n: o.length, rieng: new Set(o).size, dinh: Math.max(...o),
               o: b ? Math.floor(b.height / NV_OH) * NV_COT : 0 };
    };
    return { bo, boQua: [...boQua], mot: doi(false), hai: doi(true) };
  });
  console.log('2.', JSON.stringify(r2));
  for (const [ten, v] of [['MỘT', r2.mot], ['HAI', r2.hai]]){
    if (!v.o) fail(`bảng ${ten}: không đo được cỡ bảng thật`);
    else if (v.n !== v.rieng) fail(`bảng ${ten}: ${v.n - v.rieng} khung bị hai khối cùng chiếm`);
    else if (v.dinh >= v.o) fail(`bảng ${ten}: khung cao nhất ${v.dinh}, tràn khỏi ${v.o} ô của bảng`);
    else pass(`bảng ${ten}: ${v.n} khung / ${v.o} ô, không khối nào chồng khối nào (đỉnh ${v.dinh})`);
  }

  // ── 3. Mỗi trạng thái một khối ────────────────────────────────────────────
  const MONG = {
    'đứng':'i', 'trúng đòn':'h', 'chém nhát 1':'a', 'chém nhát 2':'s',
    'tay không':'p', 'dính độc':'t', 'bắt chuyện':'n', 'nhảy múa':'e', 'chết':'d',
  };
  const r3 = await p.evaluate(async () => {
    const dat = async (f) => { f(); await new Promise(r => setTimeout(r, 90)); return window.__khoiVe; };
    const sach = () => { player.hurtT = 0; player.atkAnim = 0; player.poisonT = 0; player.buffAtkT = 0;
                         player.noiT = 0; player.nhayT = 0; dead = false; moveTarget = null; player.moving = false; };
    const o = {};
    o['đứng']       = await dat(() => { sach(); });
    o['trúng đòn']  = await dat(() => { sach(); player.hurtT = 0.3; });
    o['chém nhát 1']= await dat(() => { sach(); player.atkAnim = 0.2; player.nhat2 = false; });
    o['chém nhát 2']= await dat(() => { sach(); player.atkAnim = 0.2; player.nhat2 = true; });
    o['tay không']  = await dat(() => { sach(); player._vk = player.equip.vukhi; player.equip.vukhi = null;
                                        player.atkAnim = 0.2; player.nhat2 = false; });
    o['dính độc']   = await dat(() => { sach(); player.equip.vukhi = player._vk; player.poisonT = 3; });
    o['bắt chuyện'] = await dat(() => { sach(); player.noiT = 0.9; });
    o['nhảy múa']   = await dat(() => { sach(); player.nhayT = 3; });
    o['chết']       = await dat(() => { sach(); dead = true; player.deadT = 0.3; });
    dead = false;
    return o;
  });
  console.log('3.', JSON.stringify(r3));
  for (const [ten, mong] of Object.entries(MONG)){
    if (r3[ten] !== mong) fail(`${ten}: đọc khối '${r3[ten]}', mong '${mong}'`);
  }
  if (!bad) pass(`cả ${Object.keys(MONG).length} trạng thái đọc đúng khối`);

  // ── 4. Nhát hai CHỈ cho lớp có nó ─────────────────────────────────────────
  const r4 = await p.evaluate(() => ({ bang: DANH_HAI_NHAT,
    coDK: !!DANH_HAI_NHAT.thieulam, coSB: !!DANH_HAI_NHAT.minhgiao,
    coDW: !!DANH_HAI_NHAT.baidasan, coELF: !!DANH_HAI_NHAT.toanchan }));
  console.log('4.', JSON.stringify(r4));
  if (!r4.coDK || !r4.coSB) fail('Dark Knight và Spellblade phải có nhát thứ hai');
  else if (r4.coDW || r4.coELF) fail('lớp niệm chú / bắn nỏ không được nhận nhát chém thứ hai');
  else pass('nhát hai đúng hai lớp cầm kiếm');

  // ── 5. Không lớp nào rơi về hình vẽ đường ─────────────────────────────────
  const r5 = {};
  for (const sect of ['thieulam','baidasan','toanchan','minhgiao','bug']){
    r5[sect] = await p.evaluate(async (sk) => {
      startGame(sk, null);
      player.avatar = null;   // bài này đo THÂN NGƯỜI; avatar nay bật mặc định nên phải tắt đi
      await new Promise(r => setTimeout(r, 1400));
      applyTestBoost(); calcDerived();
      await new Promise(r => setTimeout(r, 900));
      return window.__veThan;
    }, sect);
  }
  console.log('5.', JSON.stringify(r5));
  const veo = Object.entries(r5).filter(([, v]) => v !== 'sprite');
  if (veo.length) fail(`rơi về hình vẽ đường: ${veo.map(x => x[0]).join(', ')}`);
  else pass('cả 5 lớp vẽ bằng bảng khung art');

  // ── 6. KHỐI BAY: nửa dưới thân phải TRÙNG KHÍT khung đầu ──────────────────
  //
  // ⚠⚠ ĐÂY LÀ THỨ DUY NHẤT ĐỨNG GIỮA MỘT LƯỢT NƯỚNG LẠI VÀ **CÁI CHÂN THỨ BA**.
  //   `nuong_tam_render.py` dựng bảng HAI bằng cách chép tệp đang có trên đĩa lên (cố ý —
  //   để giữ 9 khối mà đợt nướng không đụng), rồi `dat_o` thì `alpha_composite`. Tức khung
  //   MỚI đè LÊN khung CŨ chứ không thay nó: chỗ nào khung mới trong suốt thì khung cũ còn
  //   nguyên ở đó. Nướng lại khối BAY ba lượt ⇒ mỗi ô cõng thêm 361-769 điểm ảnh của lượt
  //   trước, và thứ hiện ra là một bàn chân thứ ba lơ lửng. Chủ dự án gọi đúng tên nó:
  //   *"nhìu khả năng bạn input 2 hoạt ảnh trên cùng 1 nhân vật"*. Đã ship một lượt.
  //   Bộ nướng nay `xoa_o()` từng ô trước khi ghi; mục này là cái gác cho việc đó.
  //
  // ⚠ ĐO Ở BẢNG, KHÔNG ĐO BẰNG ẢNH CHỤP. Khối bay chạy theo `performance.now()` (BAY_NHIP
  //   95ms) nên hai lượt chụp là hai khung khác nhau — cùng bẫy đã ghi ở đầu tệp này.
  //
  // ⚠ SUY BỘ TỪ `NV_BO_CO_BAY` VÀ NẠP BẰNG `nvTai()` — cửa nạp CHÍNH CHỦ của game. Đường
  //   qua `startGame` + trang bị thì bậc do hệ trang bị quyết: nhân vật mới nay được phát
  //   sẵn bộ giai 7 (`phatDoKhoiDau`) ⇒ thân ra `dwsm1`, bộ KHÔNG có khối bay, và mục này
  //   lặng lẽ tự bỏ qua chính thứ nó sinh ra để gác. Đã dẫm đúng thế hai lượt.
  //
  // ⚠ DẢI ĐO LẤY y=210, KHÔNG LẤY 236 (mốc ghim của bộ nướng). Chép mốc ghim vào đây là
  //   dựng bản sao thứ hai của một hằng đang sống: đổi mốc ghim là bài xanh oan. 210 suy từ
  //   PHÉP ĐO — đôi cánh của gói art dừng ở y≈181 trong ô, dưới đó là thân thuần — nên nó
  //   đúng với mọi mốc ghim nằm trong vùng chân.
  const r6 = await p.evaluate(async () => {
    const bos = Object.keys(window.NV_BO_CO_BAY || {});
    const o = { bos, ra: [] };
    for (const bo of bos) {
      const img = nvTai(bo + '2', 'webp');
      for (let i = 0; i < 60 && !(img && img.width); i++) await new Promise(r => setTimeout(r, 100));
      if (!(img && img.width)) { o.ra.push({ bo, chuaTai: true }); continue; }
      const Y0 = 210, moc = NV_MOC2.f, n = nvSoKhung(bo, 'f');
      const cv = document.createElement('canvas');
      cv.width = NV_OW; cv.height = NV_OH - Y0;
      const cx = cv.getContext('2d');
      const doc = (k) => {
        const c = k % NV_COT, r = Math.floor(k / NV_COT);
        cx.clearRect(0, 0, cv.width, cv.height);
        cx.drawImage(img, c * NV_OW, r * NV_OH + Y0, NV_OW, NV_OH - Y0,
                     0, 0, NV_OW, NV_OH - Y0);
        return cx.getImageData(0, 0, cv.width, cv.height).data;
      };
      const g0 = doc(moc);
      let dac0 = 0, oLech = 0, tong = 0;
      for (let i = 3; i < g0.length; i += 4) if (g0[i] > 8) dac0++;
      for (let i = 1; i < n; i++) {
        const g = doc(moc + i);
        let d = 0;
        for (let j = 3; j < g.length; j += 4) if ((g[j] > 8) !== (g0[j] > 8)) d++;
        if (d) oLech++;
        tong += d;
      }
      o.ra.push({ bo, n, dac0, oLech, tong });
    }
    return o;
  });
  console.log('6.', JSON.stringify(r6));
  if (!r6.bos.length) fail('NV_BO_CO_BAY rỗng — không bộ nào có khối bay, mục 6 không gác gì');
  else for (const x of r6.ra) {
    if (x.chuaTai) fail(`${x.bo}: bảng hai chưa tải — mục 6 không dựng được cảnh, đừng tin nó`);
    else if (!x.dac0 || x.dac0 < 500)
      fail(`${x.bo}: dựng cảnh hỏng — dải chân khung đầu chỉ có ${x.dac0} điểm ảnh đặc`);
    else if (x.oLech)
      fail(`${x.bo}: ${x.oLech}/${x.n - 1} khung bay lệch nửa dưới ${x.tong} điểm ảnh — lượt `
         + 'nướng cũ còn nằm dưới (chân thứ ba), hoặc xoa_o() đã bị gỡ khỏi bộ nướng');
    else pass(`${x.bo}: cả ${x.n} khung bay trùng khít nửa dưới — chỉ đôi cánh động`);
  }

  console.log('errors:', JSON.stringify(errs.slice(0, 3)));
  if (errs.length) fail('có pageerror');
  console.log(bad ? `FAIL(${bad})` : 'ALL PASS');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
