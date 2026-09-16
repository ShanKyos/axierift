// AXIE PHẢN ỨNG — hai khối `gồng` (lúc ra đòn) và `giật` (lúc trúng đòn).
//
// Trước bản này `veAvatar` chỉ biết hai khối (thở · chạy), nên con Axie — cái thân NHÌN THẤY của
// người chơi — đứng bất động suốt trận: ra đòn thì lớp nhân vật vung bên cạnh còn nó không nhúc
// nhích, ăn đòn cũng thế. Món nợ `defense/hit-by-normal` đã ghi trong CLAUDE.md từ đợt Đổi Vai.
//
// ⚠ AXIE KHÔNG ĐÁNH, NÓ PHẢN ỨNG. Kit có sẵn 8 đòn đánh gần + 5 đòn xa, và chủ dự án đã chốt
// KHÔNG dùng: luật Đổi Vai nói *"Axie chỉ đơn thuần là avatar thôi, khi tấn công thì ví dụ Dark
// Wizard sẽ xuất hiện và tung chiêu"*. Mục ⑥ gác đúng chỗ đó.
//
// ⚠ BÀI NÀY ĐO CHỈ SỐ KHUNG, KHÔNG ĐO ĐIỂM ẢNH cho phần lôgic. Lý do đã trả giá ở
// `test_dongbodo`: con Axie thở ~8 FPS trong khi một lượt render tốn ~13 ms, nên hai lượt vẽ
// LIÊN TIẾP CÙNG ĐIỀU KIỆN lệch nhau tới 5.200/16.500 điểm ảnh — sàn nhiễu lớn hơn thứ cần đo.
// `veAvatar` phơi khối đang vẽ ra `window.__avaKhoi` (chỉ khi TEST_MODE), cùng lối `__veChet`.
//
// Chạy độc lập:  node tests/test_avaphanung.js [cổng]
const { chromium } = require('playwright');
const CONG = process.argv[2] || '8853';
const GOC = 'http://localhost:' + CONG + '/index.html';

(async () => {
  let bad = 0; const fail = m => { console.log('FAIL', m); bad++; };
  const errs = [];
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1100, height: 760 } });
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => { if (m.type() === 'error' && !/404|ERR_/.test(m.text())) errs.push(m.text()); });
  await p.goto(GOC);
  await p.waitForFunction(() => window.__gameReady).catch(() => {});

  await p.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    travelTo('daohoa'); player.x = 1300; player.y = 1500;
    calcDerived(); player.hp = player.maxHp;
  });

  // ── 0. CẢ 16 CON PHẢI CÓ ĐỦ HAI BẢNG, VÀ Ô PHẢI TRÙNG BẢNG NHỎ ────────────────────────
  // Ô lệch một pixel là con vật NHẢY một cái mỗi lần đổi khối — thứ nhìn ra ngay nhưng không
  // lỗi nào báo. Tải bằng chính đường của game rồi đo `naturalWidth`, đừng tin tên tệp.
  const tai = await p.evaluate(async () => {
    const ds = Object.keys(CHI_MAP);
    const lay = src => new Promise(r => {
      const im = new Image();
      im.onload = () => r({ w: im.naturalWidth, h: im.naturalHeight });
      im.onerror = () => r(null);
      im.src = src;
    });
    const ra = [];
    for (const id of ds){
      const A = CHI_ANH.o[id];
      const [a, g, h] = await Promise.all([
        lay('assets/chimera/' + id + '.webp'),
        lay('assets/chimera/' + id + '_b.webp'),
        lay('assets/chimera/' + id + '_h.webp'),
      ]);
      ra.push({ id, a, g, h, nhoRong: A && A.nhoRong, nhoCao: A && A.nhoCao,
                nG: CHI_GONG.n, cG: CHI_GONG.cot, nH: CHI_GIAT.n, cH: CHI_GIAT.cot });
    }
    return ra;
  });
  const thieu = tai.filter(t => !t.g || !t.h).map(t => t.id);
  const lechO = tai.filter(t => t.g && t.h &&
    (Math.round(t.g.w / t.cG) !== t.nhoRong || Math.round(t.g.h / 2) !== t.nhoCao ||
     Math.round(t.h.w / t.cH) !== t.nhoRong || Math.round(t.h.h / 2) !== t.nhoCao))
    .map(t => `${t.id}(nhỏ ${t.nhoRong}×${t.nhoCao} · gồng ${Math.round(t.g.w/t.cG)}×${Math.round(t.g.h/2)} · giật ${Math.round(t.h.w/t.cH)}×${Math.round(t.h.h/2)})`);
  console.log(`0 · ${tai.length} con · thiếu bảng: ${thieu.length ? thieu.join(',') : 'không'} · lệch ô: ${lechO.length ? lechO.join(' ') : 'không'}`);
  if (tai.length < 16) fail(`chỉ có ${tai.length} con trong CHI_MAP, mong 16`);
  if (thieu.length) fail(`${thieu.length} con thiếu bảng phản ứng: ${thieu.join(', ')}`);
  if (lechO.length) fail(`ô lệch bảng nhỏ ⇒ con vật nhảy hình khi đổi khối: ${lechO.join(' ')}`);

  // Chờ hai bảng của con đang dùng về hẳn, nếu không mọi mục dưới đây rơi vào nhánh lui-về-thở
  // và xanh vì lý do sai.
  await p.evaluate(async () => {
    const id = avatarId(player);
    await new Promise(r => {
      const xong = () => (chiSan(chiChayImg(id)) && chiSan(chiGongImg(id)) && chiSan(chiGiatImg(id))) ? r() : setTimeout(xong, 50);
      xong();
    });
  });

  const doKhoi = (dat) => p.evaluate((d) => {
    player.atkAnim = d.atk || 0; player.castT = d.cast || 0; player.hurtT = d.hurt || 0;
    player.moving = !!d.mv;
    window.__avaKhoi = {}; render();
    return window.__avaKhoi.ta || null;
  }, dat);

  // ── 1..3. ĐÚNG KHỐI, ĐÚNG THỨ TỰ ƯU TIÊN ──────────────────────────────────────────────
  const tho  = await doKhoi({});
  const chay = await doKhoi({ mv: 1 });
  const danh = await doKhoi({ atk: 0.11 });
  const chu  = await doKhoi({ cast: 0.19 });
  const giat = await doKhoi({ hurt: 0.15 });
  const caHai = await doKhoi({ atk: 0.11, hurt: 0.15 });   // trúng đòn phải ĐÈ lên ra đòn
  console.log('1 · khối:', JSON.stringify({ tho: tho && tho.khoi, chay: chay && chay.khoi,
    danh: danh && danh.khoi, chu: chu && chu.khoi, giat: giat && giat.khoi, caHai: caHai && caHai.khoi }));
  if (!tho) fail('veAvatar không phơi __avaKhoi — không đo được gì');
  else {
    if (tho.khoi !== 'tho')   fail(`đứng yên mà khối là "${tho.khoi}"`);
    if (chay.khoi !== 'chay') fail(`đang chạy mà khối là "${chay.khoi}"`);
    if (danh.khoi !== 'gong') fail(`ĐANG RA ĐÒN mà khối là "${danh.khoi}" — con Axie vẫn đứng yên`);
    if (chu.khoi  !== 'gong') fail(`đang niệm chú mà khối là "${chu.khoi}"`);
    if (giat.khoi !== 'giat') fail(`ĐANG TRÚNG ĐÒN mà khối là "${giat.khoi}" — đúng món nợ hit-by-normal`);
    if (caHai.khoi !== 'giat') fail(`vừa đánh vừa trúng đòn thì phải ưu tiên GIẬT, đang ra "${caHai.khoi}"`);
  }

  // ── 4. BA ĐỒNG HỒ ẤY ĐẾM NGƯỢC ────────────────────────────────────────────────────────
  // `atkAnim`/`castT`/`hurtT` đặt bằng ĐỘ DÀI rồi trừ dần về 0. Dùng thẳng tỉ lệ đó làm tiến độ
  // là con vật gồng NGƯỢC — buông ra trước rồi mới lấy đà. Cùng cái bẫy đã ghi cho `atkK` ở
  // drawPlayer, và nó KHÔNG ném lỗi, chỉ trông "hơi lạ".
  const dau  = await p.evaluate(() => { player.atkAnim = NV_DANH_GIAY; player.castT = 0; player.hurtT = 0;
                                        window.__avaKhoi = {}; render(); return window.__avaKhoi.ta; });
  const cuoi = await p.evaluate(() => { player.atkAnim = 0.001; player.castT = 0; player.hurtT = 0;
                                        window.__avaKhoi = {}; render(); return window.__avaKhoi.ta; });
  const nKhung = await p.evaluate(() => CHI_GONG.n);
  console.log(`4 · khung đầu = ${dau.khung} · khung cuối = ${cuoi.khung} (bảng ${nKhung} khung)`);
  if (dau.khung !== 0) fail(`đầu cú đánh phải là khung 0, đang là ${dau.khung} — đọc ngược đồng hồ đếm ngược`);
  if (cuoi.khung !== nKhung - 1) fail(`cuối cú đánh phải là khung ${nKhung - 1}, đang là ${cuoi.khung}`);

  // ── 5. TẦNG HÀNH VI: khối gồng phải VẼ RA khác khối thở ────────────────────────────────
  // Chọn đúng khối mà `chiVeGong` lại không vẽ được gì (bảng hỏng, ô sai) thì bốn mục trên vẫn
  // xanh. Mục này là chỗ duy nhất hỏi tới TẤM TRANH.
  //
  // ⚠ BẢN CŨ CỦA MỤC NÀY CHƯA BAO GIỜ GÁC ĐƯỢC GÌ — hai lỗi chồng nhau, cả hai đều im lặng:
  //
  //   ① Sàn nhiễu đo bằng hai lượt vẽ liên tiếp cùng điều kiện, và nó ra ĐÚNG 0 — không phải
  //      vì phép đo sạch, mà vì hồi ấy khối thở chạy 9 FPS KHÔNG PHA nên 86% số lượt vẽ con
  //      Axie đứng im. Tức "sàn nhiễu" chưa bao giờ đo nhiễu; nó đo đúng cái tật cứng đờ mà
  //      đợt pha khung sinh ra để chữa. Mà sàn 0 thì luật `gong < nhieu*3` LUÔN đúng ⇒ vô nghĩa.
  //   ② Ô đo là 160×180 quanh chân nhân vật TRONG KHUNG GAME, mà đặt `atkAnim` thì LỚP NHÂN VẬT
  //      vật chất hoá ngay cạnh (trước 72 · bên 56) và nằm gọn trong ô. Đo được: bịt hẳn bảng
  //      gồng/giật cho lui về khối thở — con Axie không đổi lấy một điểm ảnh — mà ô vẫn đếm
  //      2.158 điểm. Mệnh đề xanh vì lớp nhân vật, không vì thứ nó nói là đang gác.
  //
  // Pha khung xong thì ① lộ ra: sàn nhiễu lên 3.800 còn tín hiệu vẫn ~7.000 (đo ở cả hai
  // commit) ⇒ luật ×3 thành bất khả thi và bài đỏ vì một thứ KHÔNG hỏng. ⚠ Đừng "sửa" bằng
  // cách hạ bội số ×3 — đó là nới luật cho xanh, và ② thì vẫn nguyên đó.
  //
  // Chữa cả hai bằng một việc: gọi thẳng `veAvatar` vào một canvas PHỤ với `now` ghim cứng.
  // Trong ô khi ấy chỉ còn đúng con Axie — không lớp nhân vật, không loé trúng đòn, không rung
  // màn, không nền trôi — và hai lượt cùng điều kiện phải trùng khít TỪNG điểm ảnh.
  const ve = await p.evaluate(() => {
    // ⚠ VẼ RIÊNG CON AXIE RA CANVAS PHỤ, ĐỪNG ĐO TRÊN KHUNG GAME. Bản cũ đo một ô 160×180 quanh
    // chân nhân vật trong khung thật, mà đặt `atkAnim` thì LỚP NHÂN VẬT vật chất hoá ngay cạnh
    // (trước 72 · bên 56) và nằm gọn trong ô ấy. Đo được: bịt hẳn bảng gồng/giật cho nó lui về
    // khối thở — tức con Axie KHÔNG đổi lấy một điểm ảnh — mà ô vẫn đếm 2.158 điểm, thừa sức
    // vượt mọi ngưỡng. Cộng với sàn nhiễu 0 (luật ×3 hoá vô nghĩa), mệnh đề này CHƯA BAO GIỜ
    // gác được gì: nó xanh vì lớp nhân vật, không vì con Axie.
    //
    // Gọi thẳng `veAvatar` vào canvas phụ thì trong ô chỉ còn đúng con Axie: không lớp nhân vật,
    // không loé trúng đòn, không rung màn, không nền trôi. Thử ngược (bịt bảng) ra ĐÚNG 0.
    const cv = document.createElement('canvas'); cv.width = 220; cv.height = 240;
    const g = cv.getContext('2d');
    const moc = performance.now();
    const fp = { x: 110, y: 170, face: 0, walkPh: 0, atkAnim: 0, hurtT: 0, castT: 0,
                 avatar: player.avatar, sect: player.sect };
    const lay = d => {
      fp.atkAnim = d.atk || 0; fp.hurtT = d.hurt || 0; fp.castT = 0;
      g.clearRect(0, 0, cv.width, cv.height);
      veAvatar(g, fp, false, moc);          // `now` ghim ⇒ khối thở không trôi giữa hai lượt
      return g.getImageData(0, 0, cv.width, cv.height).data;
    };
    const dem = (u, v) => { let n = 0;
      for (let i = 0; i < u.length; i += 4)
        if (u[i]!==v[i]||u[i+1]!==v[i+1]||u[i+2]!==v[i+2]||u[i+3]!==v[i+3]) n++;
      return n; };
    const nen = lay({});
    return { nhieu: dem(nen, lay({})), gong: dem(nen, lay({ atk: 0.11 })),
             giat: dem(nen, lay({ hurt: 0.15 })), tong: cv.width * cv.height };
  });
  console.log(`5 · điểm ảnh đổi — gồng ${ve.gong} · giật ${ve.giat} · sàn nhiễu ${ve.nhieu} · ô ${ve.tong}`);
  // ⓪ Tự kiểm CẢNH DỰNG: cùng `now`, cùng trạng thái ⇒ phải trùng khít TỪNG điểm ảnh. Lệch thì
  //    có một nguồn trôi nào đó lọt vào ô đo và hai mệnh đề dưới vô nghĩa — nói ra, đừng chấm.
  if (ve.nhieu !== 0) fail(`hai lượt vẽ CÙNG điều kiện lệch ${ve.nhieu} điểm ảnh — còn nguồn trôi trong ô đo, phép đo dưới đây vô nghĩa`);
  // Sàn tuyệt đối: bảng hỏng ⇒ `chiVeGong` trả false ⇒ lui về khối thở ⇒ ĐÚNG 0. Đo thật được
  // ~4.000-7.000, nên sàn 400 rất rộng tay mà vẫn chặn sạch ca lui-về-thở.
  const SAN = 400;
  if (ve.gong < SAN) fail(`khối GỒNG chỉ đổi ${ve.gong} điểm ảnh (sàn ${SAN}) — chọn đúng khối nhưng không vẽ ra được gì khác khối thở`);
  if (ve.giat < SAN) fail(`khối GIẬT chỉ đổi ${ve.giat} điểm ảnh (sàn ${SAN})`);

  // ── 6. AXIE KHÔNG CÓ KHỐI ĐÁNH — luật Đổi Vai ─────────────────────────────────────────
  // Kit có 8 đòn gần + 5 đòn xa và rất dễ "tiện tay" nướng thêm. Chốt này là chỗ duy nhất nói
  // ra rằng KHÔNG nướng là một quyết định, không phải một thiếu sót ai đó quên làm.
  // Đo bằng hệ quả: lúc ra đòn, lớp NHÂN VẬT phải là thứ vật chất hoá — không phải con Axie.
  const doiVai = await p.evaluate(() => {
    player.atkAnim = NV_DANH_GIAY * 0.6; player.castT = 0; player.hurtT = 0;
    window.__veChet = {}; window.__avaKhoi = {}; render();
    return { lopHien: (window.__veChet.ta || {}).lopHien, avaKhoi: (window.__avaKhoi.ta || {}).khoi,
             coBangDanh: !!(window.CHI_DANH || window.chiVeDanh) };
  });
  console.log('6 · lúc ra đòn:', JSON.stringify(doiVai));
  if (doiVai.lopHien !== true) fail('lúc ra đòn lớp nhân vật KHÔNG vật chất hoá — luật Đổi Vai hỏng');
  if (doiVai.avaKhoi !== 'gong') fail(`lúc ra đòn Axie phải GỒNG, đang ra "${doiVai.avaKhoi}"`);
  if (doiVai.coBangDanh) fail('đã có bảng/hàm vẽ ĐÒN ĐÁNH cho Axie — chủ dự án chốt Axie phản ứng, KHÔNG đánh');

  // ── 7. NẠP TRƯỚC: cú đánh ĐẦU TIÊN không được rơi vào nhánh lui-về-thở ─────────────────
  const truoc = await p.evaluate(async () => {
    // trang mới, chưa đánh lần nào
    for (const k in CHI_GONG_IMGS) delete CHI_GONG_IMGS[k];
    for (const k in CHI_GIAT_IMGS) delete CHI_GIAT_IMGS[k];
    player.atkAnim = 0; player.castT = 0; player.hurtT = 0;
    render();                                   // chỉ VẼ con Axie, chưa đánh
    for (const k in CHI_CHAY_IMGS) delete CHI_CHAY_IMGS[k];
    render();                                   // chỉ VẼ con Axie, chưa đánh, chưa đi
    const id = avatarId(player);
    return { daXin: !!CHI_GONG_IMGS[id] && !!CHI_GIAT_IMGS[id] && !!CHI_CHAY_IMGS[id] };
  });
  console.log('7 · vẽ một lần rồi đã xin hai bảng chưa:', JSON.stringify(truoc));
  if (!truoc.daXin) fail('hai bảng phản ứng chỉ được xin lúc CẦN — cú đánh đầu tiên của mỗi phiên sẽ rơi vào khối thở');

  await b.close();
  console.log('errors:', JSON.stringify(errs));
  console.log(bad === 0 && errs.length === 0 ? 'PASS' : 'FAIL(' + bad + ')');
  process.exit(bad === 0 && errs.length === 0 ? 0 : 1);
})();
