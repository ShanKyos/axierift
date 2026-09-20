// Tuyệt chiêu Flame Cyclone của Dark Knight — vòng lửa quét quanh người, vũ khí bay theo.
//
// Bài này gác sáu thứ dễ lặng lẽ hỏng:
//   1. Ô 4 của Dark Knight PHẢI là chiêu xoay, và phím Space phải trỏ sẵn vào nó. Trước đây
//      Space mặc định là đòn đánh thường nên ô 4 gần như không ai bấm tới.
//   2. Gán mặc định chỉ chạy MỘT LẦN: ai tự tắt Space đi thì lần nạp sau không được bật lại.
//   3. Tổng Di Sản của Dark Knight vẫn đúng 8,0% sau khi hoán hai chiêu — hoán chỗ mà quên hạ
//      bậc là lớp này tự dưng được thêm %Công Kích vĩnh viễn.
//   4. Tung chiêu thật sự sinh ra hiệu ứng 'vongKiem' (không phải hình vector chung), và tấm
//      khung hình có tải được — nvTai/getVfxAtlasImg im lặng khi tệp 404, nên thiếu tệp thì
//      chiêu vẫn "chạy" mà màn hình trống trơn.
//   5. Lưỡi bay quanh là CÂY CỐ ĐỊNH của chiêu (Kiếm Long Vương, giai 7 của DK), không đổi
//      theo món đang cầm — và vệt để lại phải MỎNG, không được dựng lại vòng lửa cam-đỏ cũ.
//   6. Mỗi khung có NHIỀU lưỡi và không khung nào trống nửa gần, và lưỡi TỰ QUAY quanh chuôi
//      chứ không chỉ bị kéo theo tiếp tuyến.
const { chromium } = require('playwright');
const PORT = process.argv[2] || '8853';
let bad = 0;
const fail = m => { bad++; console.log('FAIL ' + m); };
const pass = m => console.log('PASS ' + m);

(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport:{ width:1280, height:900 } });
  const errs = [], miss = [];
  p.on('pageerror', e => errs.push(String(e).split('\n')[0]));
  p.on('response', r => { if (r.status() === 404) miss.push(r.url().split('/').pop()); });
  await p.goto(`http://localhost:${PORT}/index.html?max=1`, { waitUntil:'load' });
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', null); });
  await p.waitForTimeout(900);

  // 1) ô 4 + phím Space
  const r1 = await p.evaluate(() => ({
    o4: player.skillBar[3],
    space: player.spaceSkill,
    ten: (skillInfo(player.skillBar[3]) || {}).name,
    cd: skillInfo('dk_cyclone').cd,
    qi: skillInfo('dk_cyclone').qi,
    mult: skillInfo('dk_cyclone').mult,
  }));
  console.log('1) ô 4 & Space:', JSON.stringify(r1));
  if (r1.o4 !== 'dk_cyclone') fail(`ô 4 của Dark Knight là ${r1.o4}, phải là dk_cyclone`);
  else if (r1.space !== 'dk_cyclone') fail(`phím Space là ${r1.space}, phải gán sẵn dk_cyclone`);
  else pass(`ô 4 = Space = ${r1.ten}`);
  if (r1.cd !== 0) fail(`Flame Cyclone còn hồi chiêu ${r1.cd}s — phải là 0 (Mana mới là cái ghìm)`);
  else if (!r1.qi) fail('cd 0 mà cũng không tốn Mana — không còn gì ghìm lại');
  else pass(`không hồi chiêu, ghìm bằng ${r1.qi} Mana mỗi lần`);

  // 2) tự tắt Space rồi nạp lại thì KHÔNG được bật lại
  const r2 = await p.evaluate(() => {
    window.assignSpaceUI('dk_cyclone');          // bấm lần hai → tắt
    const sau = player.spaceSkill;
    spaceMacDinh();                              // giả lập lần nạp sau
    return { sauKhiTat: sau, sauKhiNapLai: player.spaceSkill };
  });
  console.log('2) tôn trọng lựa chọn:', JSON.stringify(r2));
  if (r2.sauKhiTat !== null) fail('bấm lần hai mà Space không tắt');
  else if (r2.sauKhiNapLai !== null) fail('người chơi đã tắt Space mà lần nạp sau lại tự bật lên');
  else pass('tắt Space rồi thì lần nạp sau không tự bật lại');

  // 3) tổng Di Sản vẫn 8,0% — và Flame Cyclone KHÔNG được cộng %ST khi đang nằm trên thanh
  //
  // ⚠ ĐO, ĐỪNG SUY TỪ DANH SÁCH. `LEGACY_SECT_SKILLS` nay khai CẢ SÁU chiêu chủ động của lớp và
  // `calcDerived` TRỪ ĐỘNG những chiêu đang nằm trên thanh — nên "có tên trong bảng" không còn
  // nghĩa là "được cộng %ST". Mệnh đề cũ suy từ danh sách sẽ đỏ oan; thứ nó thật sự muốn biết
  // (cyclone có cộng hai lần không) thì cân được: gỡ khỏi thanh phải làm %ST TĂNG đúng bậc.
  const r3 = await p.evaluate(() => {
    startGame('thieulam', null); player.level = 120; player.lvPeak = 120; vhAutoLearn();
    player.skillBar = defaultSkillBar('thieulam'); calcDerived();
    const tren = +player.legacyAtkPct.toFixed(2);
    const i = player.skillBar.indexOf('dk_cyclone');
    const bar = player.skillBar.slice(); bar[i] = null;
    player.skillBar = bar; calcDerived();
    const ngoai = +player.legacyAtkPct.toFixed(2);
    player.skillBar = defaultSkillBar('thieulam'); calcDerived();
    return { oThanh: i, tren, ngoai, bac: LEGACY_TIER_PCT[VOHOC_DEFS.dk_cyclone.tier] || 0,
             pool: LEGACY_SECT_SKILLS.filter(id => (VOHOC_DEFS[id] || {}).phai === 'thieulam').length,
             // %ST của lớp, bỏ hai hệ tấn chức phụ cộng theo cấp ra ngoài
             lop: +(tren - LEGACY_UNIVERSAL_PCT.danchi - LEGACY_UNIVERSAL_PCT.tieuhon).toFixed(2) };
  });
  console.log('3) Di Sản:', JSON.stringify(r3));
  if (r3.oThanh < 0) fail('dk_cyclone không còn nằm trên thanh mặc định — cảnh dựng chưa đủ, mệnh đề này hết chỗ bám');
  else if (+(r3.ngoai - r3.tren).toFixed(2) !== r3.bac)
    fail(`dk_cyclone ở ô ${r3.oThanh + 1} mà %ST không bị trừ đúng bậc: trên thanh ${r3.tren} · ngoài thanh ${r3.ngoai} (chênh phải là ${r3.bac})`);
  else if (r3.pool !== 6) fail(`pool Di Sản của Dark Knight có ${r3.pool} chiêu, phải là 6`);
  else if (Math.abs(r3.lop - 8) > 0.01) fail(`%ST Di Sản của lớp là ${r3.lop}%, phải là 8,0%`);
  else pass(`pool 6 chiêu, Flame Cyclone trên thanh nên không cộng %ST (${r3.tren} → ${r3.ngoai} khi gỡ), lớp đúng ${r3.lop}%`);

  // 4) tung chiêu → sinh đúng hiệu ứng, KHÔNG kèm hình vector chung
  const r4 = await p.evaluate(() => {
    player.level = 60; learnVohoc('dk_cyclone'); player.qi = player.maxQi = 500; calcDerived();
    effects.length = 0;
    const inf = skillInfo('dk_cyclone');
    castSkill('dk_cyclone');
    const e = effects.find(x => x.type === 'vongKiem');
    const viSao = e ? null : { mo:inf.unlocked, khoa:inf.lockTxt, qi:player.qi, can:inf.qi,
                               cacLoai:[...new Set(effects.map(x => x.type))] };
    return { coHieuUng: !!e, viSao, coVector: effects.some(x => x.type === 'vfx'),
             dur: e && e.dur,
             // Vòng lửa vẽ THẲNG BẰNG MÃ, không còn tấm khung hình nào. Gác luôn chỗ đó: hễ ai
             // khai lại một atlas tên 'vongkiem' thì tức là art đi mượn quay lại.
             conAtlas: 'vongkiem' in VFX_ATLAS_DEFS };
  });
  console.log('4) tung chiêu:', JSON.stringify(r4));
  if (!r4.coHieuUng) fail('tung Flame Cyclone mà không sinh hiệu ứng vongKiem');
  else if (r4.coVector) fail('vẫn sinh thêm hình vector chung — sẽ thành hai vòng lệch nhau');
  else pass('sinh đúng một hiệu ứng vongKiem, không kèm vòng vector cũ');
  if (r4.conAtlas) fail("còn khai atlas 'vongkiem' — vòng lửa phải vẽ bằng mã, không dùng tấm art");
  else pass('vòng lửa vẽ bằng mã, không tốn tệp art nào');

  // 5) VỆT PHẢI HIỆN RA, NHƯNG KHÔNG ĐƯỢC LÀ MỘT VÒNG LỬA.
  //
  // ⚠ Mệnh đề này ĐỔI CHIỀU Ở NỬA SAU, đọc kỹ trước khi "sửa cho xanh". Bản cũ chỉ có SÀN
  // (*"≥3000 pixel màu lửa, không thì vòng lửa gần như không hiện"*) — đúng hồi chiêu này là
  // một dải cam-đỏ dày 16px. Chủ dự án chốt bỏ hẳn dải đó: *"bỏ hiệu ứng màu cam đi… nó chỉ
  // cần hiện lên màu cam nhạt (như tia lửa xẹt điện là ok)"*. Một cái chốt chỉ có sàn thì
  // **xanh y nguyên khi ai đó dựng lại nguyên vòng lửa**, nên nay có cả TRẦN.
  //
  // ⚠ VÀ ĐO TRÊN CANVAS RIÊNG, KHÔNG ĐO TRÊN MÀN GAME. Cách cũ so hai lượt `render()` rồi đếm
  // điểm ảnh đổi — nhưng hai lượt ấy cách nhau ~13 ms và cả cảnh trôi (mây, cỏ, ánh sáng chạy
  // theo `performance.now()`), đo được **17-34% cả khung "đã đổi"**, tức con số là của NỀN chứ
  // không của vệt. Cùng vết sẹo đã ghi ở `test_bongnguoi` và `test_dongbodo`.
  //
  // Hai nền vì cùng một vệt đọc khác hẳn nhau: sàn SÁNG là đa số map, sàn TỐI là Werebear Woods.
  const r5 = await p.evaluate(() => {
    const ra = {};
    for (const nen of ['#a8a8a8', '#3a3a3a']){
      const W = 620, H = 500;
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const g = c.getContext('2d');
      g.fillStyle = nen; g.fillRect(0, 0, W, H);
      const goc = g.getImageData(0, 0, W, H).data;
      // `wpn:null` — đo RIÊNG cái vệt. Để lưỡi vào thì màu thép của thanh kiếm kéo số đo về xám
      // và cả hai vế đều nói dối.
      const e = { type:'vongKiem', x:W/2, y:H/2 + 60, t:0.25, dur:1, scale:1, wpn:null };
      veVongKiem(g, e, 'sau'); veVongKiem(g, e, 'truoc');
      const co = g.getImageData(0, 0, W, H).data;
      let n = 0, dam = 0;
      for (let i = 0; i < goc.length; i += 4){
        if (Math.abs(co[i]-goc[i]) + Math.abs(co[i+1]-goc[i+1]) + Math.abs(co[i+2]-goc[i+2]) < 24) continue;
        n++;
        const mx = Math.max(co[i], co[i+1], co[i+2]), mn = Math.min(co[i], co[i+1], co[i+2]);
        if (mx && (mx - mn) / mx > 0.45) dam++;     // điểm CAM ĐẬM — thứ đọc ra "vòng lửa"
      }
      ra[nen] = { n, dam };
    }
    return ra;
  });
  console.log('5) vệt để lại:', JSON.stringify(r5));
  // Số đo lúc chốt: sáng 2488 điểm / 191 đậm · tối 2591 / 945. Bản vòng lửa cũ: 11569 / 2592
  // và 11290 / 4351. Ngưỡng đặt giữa hai bên, chừa biên rộng cho cả hai phía.
  const SANG = r5['#a8a8a8'], TOI = r5['#3a3a3a'];
  if (SANG.n < 900 || TOI.n < 900)
    fail(`vệt gần như không hiện (sáng ${SANG.n} · tối ${TOI.n} điểm) — chiêu mất luôn phần đuôi`);
  else if (SANG.n > 6000 || TOI.n > 6000)
    fail(`vệt dày ${SANG.n}/${TOI.n} điểm — vòng lửa dày đã dựng lại, chủ dự án đã chốt bỏ`);
  else if (SANG.dam > 900)
    fail(`${SANG.dam} điểm cam ĐẬM trên nền sáng (bản vòng lửa cũ: 2592) — đây lại là một vòng lửa, không phải tia cam nhạt`);
  else pass(`vệt mỏng: sáng ${SANG.n} điểm (${SANG.dam} cam đậm) · tối ${TOI.n} (${TOI.dam}) — dưới hẳn bản vòng lửa cũ 11569/2592`);

  // 6) LƯỠI BAY QUANH LÀ CÂY CỐ ĐỊNH CỦA CHIÊU, KHÔNG PHẢI CÂY ĐANG CẦM.
  //
  // ⚠ ĐÂY LÀ MỘT LUẬT MỚI, NGƯỢC HẲN LUẬT CŨ — đừng "sửa ngược" tưởng là sót. Mệnh đề này
  // trước đây gác đúng điều ngược lại (*"đổi vũ khí là đổi hình bay quanh"*, và *"dòng chưa có
  // tranh ⇒ vòng lửa quay không"*). Chủ dự án chốt: *"bỏ cây đại kiếm giai 7 của DK vào, sau đó
  // cho thanh kiếm đó xoay… như tuyệt chiêu xoay kiếm của Dark Knight trong MU Online Season 2"*.
  // Ở MU, hình của một chiêu không đổi theo món đang cầm.
  //
  // Nó cũng vá một lỗ đo được: DK có ba dòng (kiem · riu · chuy) mà `VK_ANH` chỉ vẽ `kiem`
  // ⇒ 2/3 người chơi DK tung tuyệt chiêu của lớp mình ra một vòng RỖNG.
  const r6 = await p.evaluate(() => {
    const veRa = () => {
      const e = effects.find(x => x.type === 'vongKiem');
      if (!e || !e.wpn) return { co:false };
      // Vẽ riêng cái lưỡi ra một canvas trắng để đếm — không lẫn với vệt.
      const cv = document.createElement('canvas'); cv.width = cv.height = 200;
      const g = cv.getContext('2d');
      g.translate(100, 100); g.scale(e.wpn.k, e.wpn.k); g.translate(0, e.wpn.dy);
      e.wpn.ve(g);
      const d = g.getImageData(0, 0, 200, 200).data;
      let n = 0, tong = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 24){ n++; tong += i; }
      return { co:true, pixel:n, dau:tong, k:+e.wpn.k.toFixed(3) };
    };
    const thu = (dat) => { dat(); calcDerived(); effects.length = 0; player.qi = 500; castSkill('dk_cyclone'); return veRa(); };
    cheatExec('/gen 3 +9');
    const mauGoc = JSON.parse(JSON.stringify(player.equip.vukhi));
    // Ba cảnh khác hẳn nhau: tay không · một dòng CHƯA có tranh riêng · một cây của lớp KHÁC.
    const tayKhong = thu(() => { for (const k in player.equip) player.equip[k] = null; });
    let dChuaVe = null;
    for (const id in ITEM_DB){ const d = ITEM_DB[id]; if (d.slot === 'vukhi' && !vkAnh(d)){ dChuaVe = d; break; } }
    const chuaVe = dChuaVe ? thu(() => {
      player.equip.vukhi = JSON.parse(JSON.stringify(mauGoc));
      player.equip.vukhi.def = dChuaVe.id; player.equip.vukhi.tier = dChuaVe.tier || 1;
    }) : null;
    const lopKhac = thu(() => {
      player.equip.vukhi = JSON.parse(JSON.stringify(mauGoc));
      player.equip.vukhi.def = 'baidasan_quyentruong_2'; player.equip.vukhi.tier = 3;   // trượng Dark Wizard
    });
    return { tayKhong, chuaVe, lopKhac, tenChuaVe: dChuaVe ? dChuaVe.name : null,
             cay: VK_VONGKIEM_CAY, coTranh: !!VK_ANH[VK_VONGKIEM_CAY] };
  });
  console.log('6) lưỡi bay quanh:', JSON.stringify(r6));
  if (!r6.coTranh) fail(`VK_VONGKIEM_CAY = '${r6.cay}' không có trong VK_ANH — chiêu sẽ quay không`);
  else if (!r6.tayKhong.co) fail('không có lưỡi nào bay quanh — cây cố định của chiêu không dựng được');
  else if (r6.tayKhong.pixel < 200) fail(`lưỡi chỉ ${r6.tayKhong.pixel} pixel — vẽ ra gần như rỗng`);
  else if (r6.tayKhong.k > 1) fail(`lưỡi phóng ×${r6.tayKhong.k} — chưa quy về tỉ lệ thế giới, sẽ to hơn cả vòng`);
  else {
    // Ba cảnh phải cho ra ĐÚNG MỘT hình. So cả số điểm ảnh lẫn tổng chỉ số điểm đặc (`dau`) —
    // hai tấm khác nhau rất khó trùng cả hai. Hỏi mỗi `pixel` thì hai cây cùng cỡ vẫn lọt.
    const ds = [['tay không', r6.tayKhong], ['lớp khác', r6.lopKhac]];
    if (r6.chuaVe) ds.push([r6.tenChuaVe + ' (dòng chưa có tranh riêng)', r6.chuaVe]);
    const lech = ds.filter(([, v]) => !v.co || v.pixel !== r6.tayKhong.pixel || v.dau !== r6.tayKhong.dau);
    if (lech.length) fail(`lưỡi ĐỔI theo món đang cầm (${lech.map(([t]) => t).join(' · ')}) — nó phải là cây cố định '${r6.cay}' ở mọi cảnh`);
    else pass(`lưỡi luôn là '${r6.cay}' (${r6.tayKhong.pixel} pixel, ×${r6.tayKhong.k}) qua ${ds.length} cảnh trang bị khác nhau`);
  }

  // 7) NHIỀU lưỡi, và lưỡi TỰ QUAY quanh chuôi.
  //
  // Vì sao mệnh đề này tồn tại: bản một-lưỡi vẽ đúng một cây, và nửa quỹ đạo nó nằm ở nửa XA —
  // nhỏ hơn, khuất sau lưng người. Tính ra **50% số khung KHÔNG có lưỡi nào ở nửa gần**, nên
  // chủ dự án nhìn chiêu này và gọi nó là "một chiêu hình ảnh đơn lẻ". Ba lưỡi rải đều ⇒ 0%.
  //
  // ⚠ ĐO HÀNH VI, KHÔNG ĐỌC HẰNG SỐ. Hỏi `VONGKIEM_LUOI === 3` là hỏi lại đúng cái dòng mình
  // vừa viết; nó vẫn xanh khi khối vẽ bỏ quên vòng lặp. Nên ở đây BỌC chính `e.wpn.ve` rồi đếm
  // số lần nó được gọi trong MỘT lượt `render()`, và đọc ma trận biến hình đang áp để biết mỗi
  // lưỡi nằm ở đâu và quay bao nhiêu — đó là thứ hàm vẽ THẬT SỰ làm.
  const r7 = await p.evaluate(() => {
    // Một cây có tranh chắc chắn, để `wpn` không rỗng.
    cheatExec('/gen 3 +9');
    player.equip.vukhi.def = 'baidasan_quyentruong_2'; player.equip.vukhi.tier = 3; calcDerived();
    effects.length = 0; castSkill('dk_cyclone');
    const e = effects.find(x => x.type === 'vongKiem');
    if (!e || !e.wpn) return { loi:'không dựng được hiệu ứng có vũ khí' };
    const veThat = e.wpn.ve;
    let lo = [];
    e.wpn.ve = (g) => { const m = g.getTransform(); lo.push({ co:Math.hypot(m.a, m.b), goc:Math.atan2(m.b, m.a), x:m.e, y:m.f }); };
    const dai = e.dur || 1, B = 48;
    const soLuoi = [], gan = [], khung = [];
    for (let i = 0; i < B; i++){
      e.t = (i / B) * dai; lo = [];
      render();
      soLuoi.push(lo.length);
      // Nửa GẦN vẽ to hơn nửa xa (gan = 1 + sin·0,22), nên tỉ lệ lớn nhất trong khung cho biết
      // khung đó có lưỡi nào ở nửa gần hay không — không phải đếm điểm ảnh (bị người che).
      gan.push(lo.length ? Math.max(...lo.map(x => x.co)) : 0);
      khung.push(lo);
    }
    e.wpn.ve = veThat;
    const coBan = e.wpn.k;
    // Một VÒNG quỹ đạo trọn vẹn = 1/VONGKIEM_VONG của cả lần tung. Hai mốc cách nhau đúng một
    // vòng thì mỗi lưỡi trở lại ĐÚNG CHỖ CŨ ⇒ tiếp tuyến trùng khít; góc lưỡi còn lệch nghĩa là
    // nó tự quay quanh chuôi.
    //
    // ⚠ GHÉP LƯỠI THEO VỊ TRÍ, ĐỪNG THEO THỨ TỰ TRONG MẢNG. Bản đầu so `lo[0]` của hai khung —
    // nhưng mảng ấy gom theo lượt vẽ (nửa xa rồi nửa gần), nên `lo[0]` là hai lưỡi KHÁC NHAU ở
    // hai khung. Nó đo ra 2,09 rad kể cả khi đã tắt hẳn phần tự quay, tức mệnh đề xanh vô nghĩa
    // — thử ngược `VONGKIEM_TUQUAY = 0` đã im lặng đúng vì lý do đó.
    const buoc = Math.round(B / VONGKIEM_VONG);
    const chuan = a => { let d = Math.abs(a) % (Math.PI * 2); return d > Math.PI ? Math.PI * 2 - d : d; };
    let lechTuQuay = Infinity;
    for (let i = 0; i + buoc < B; i++){
      for (const a of khung[i]){
        let gan2 = null, dMin = Infinity;
        for (const b of khung[i + buoc]){
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < dMin){ dMin = d; gan2 = b; }
        }
        if (!gan2 || dMin > 6) continue;           // không tìm lại được chính lưỡi đó thì bỏ
        lechTuQuay = Math.min(lechTuQuay, chuan(gan2.goc - a.goc));
      }
    }
    if (!isFinite(lechTuQuay)) lechTuQuay = -1;    // không ghép được cặp nào ⇒ nói ra, đừng ra 0
    return { min:Math.min(...soLuoi), max:Math.max(...soLuoi),
             trong: gan.filter(x => x <= coBan).length, B, lechTuQuay:+lechTuQuay.toFixed(3) };
  });
  console.log('7) lưỡi bay quanh:', JSON.stringify(r7));
  if (r7.loi) fail('7) ' + r7.loi);
  else if (r7.min < 2) fail(`có khung chỉ vẽ ${r7.min} lưỡi — một lưỡi thì nửa thời gian nó nằm ở nửa xa, chiêu đọc ra một vòng lửa rỗng`);
  else if (r7.min !== r7.max) fail(`số lưỡi mỗi khung không đều (${r7.min}…${r7.max}) — phép chia nửa gần/xa đang nuốt mất lưỡi`);
  else if (r7.trong > 0) fail(`${r7.trong}/${r7.B} khung KHÔNG có lưỡi nào ở nửa gần — đúng cái lỗi mệnh đề này sinh ra để gác`);
  else if (r7.lechTuQuay < 0.5) fail(`sau trọn một vòng quỹ đạo, góc lưỡi chỉ lệch ${r7.lechTuQuay} rad — lưỡi KHÔNG tự quay, nó bị kéo lê theo tiếp tuyến`);
  else pass(`${r7.min} lưỡi mỗi khung · 0/${r7.B} khung trống nửa gần · tự quay lệch ${r7.lechTuQuay} rad sau một vòng`);

  const t404 = miss.filter(x => /vongkiem|atlas/.test(x));
  if (t404.length) fail('404: ' + t404.join(', '));
  if (errs.length) fail('lỗi trang: ' + errs[0]);
  console.log('errors:', JSON.stringify(errs));
  console.log(bad === 0 ? 'ALL PASS' : `FAIL(${bad})`);
  await b.close(); process.exit(bad === 0 ? 0 : 1);
})();
