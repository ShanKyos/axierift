// THANH CHIÊU TỰ GÁN — kéo chiêu thả vào ô 1-4.
//
// Bài này gác năm luật, và luật ③ là thứ dễ mất im lặng nhất:
//
//  ① Ô 1 chỉ nhận CHỦ ĐỘNG, và không bao giờ được để trống.
//  ② Ô 2-4 nhận cả chủ động lẫn bị động.
//  ③ CHIÊU LÊN THANH THÌ MẤT %CÔNG KÍCH DI SẢN. CLAUDE.md: "một chiêu không được vừa bấm được
//     vừa cộng %ST vĩnh viễn". Trước khi cho tự gán, luật này giữ được nhờ thanh khoá cứng +
//     `LEGACY_SECT_SKILLS` chép tay không giao nhau. Nếu `legacyAtkPct` quên hỏi thanh chiêu thì
//     người chơi kéo một chiêu Di Sản lên thanh là ĐƯỢC CẢ HAI — không lỗi, không dấu hiệu.
//  ④ BỊ ĐỘNG CHỈ CHẠY KHI CẮM VÀO Ô. Quên vế "đang trên thanh" thì cắm hay không cắm đều như
//     nhau, và ba ô kia mất hẳn một nửa lý do tồn tại.
//  ⑤ KHÔNG NHÂN BẢN. Cùng một chiêu ở hai ô là người chơi tự lừa mình có hai nút. `knRaSoat`
//     cũng phải giữ luật đó — bản đầu nó tự tạo ra ['a','a',…] khi lấp ô 1.
//  ⑥ THANH PHẢI SỐNG QUA SAVE/LOAD. `loadGame()` từng có `player.skillBar =
//     defaultSkillBar(player.sect)` chạy vô điều kiện — hồi thanh còn cố định thì vô hại, từ lúc
//     kéo thả được thì nó nuốt sạch lựa chọn của người chơi mà KHÔNG để lại dấu vết nào: gán
//     xong nhìn đúng, tải lại trang là về mặc định. Năm mệnh đề trên đều xanh trong lúc lỗi ấy
//     còn sống, vì không mệnh đề nào đi qua một vòng lưu-nạp.
const { chromium } = require('playwright');
const PORT = process.argv[2] || '8853';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://localhost:' + PORT + '/index.html');
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(700);
  let bad = 0; const fail = m => { console.log('FAIL ' + m); bad++; };
  const pass = m => console.log('PASS ' + m);

  const r = await p.evaluate(() => {
    window.TEST_MODE = true;
    const LOP = ['thieulam','toanchan','baidasan','minhgiao','bug'];
    const o = { lop:{}, loi:[] };
    for (const sc of LOP){
      startGame(sc, null); player.traits = [];
      player.level = 90; player.lvPeak = 90; player.silver = 9e6; player.khi = 9e5;
      vhAutoLearn(); calcDerived();
      const d = { bar: player.skillBar.slice(), legacy0: +player.legacyAtkPct.toFixed(2) };
      // ⚠ PHẢI CHỌN CHIÊU DI SẢN CHƯA NẰM TRÊN THANH. `LEGACY_SECT_SKILLS` nay khai CẢ SÁU chiêu
      // chủ động của lớp (Di Sản = sáu chiêu TRỪ những ô đang trên thanh), nên chiêu đầu danh
      // sách rất có thể đang ở ô 3 — kéo nó sang ô 2 thì nó vẫn trên thanh, %ST tụt 0, và mệnh
      // đề đỏ vì cảnh dựng chứ không vì cơ chế. Cảnh phải tự bảo đảm tiền đề của mình.
      const diSan = LEGACY_SECT_SKILLS.find(x => VOHOC_DEFS[x] && VOHOC_DEFS[x].phai === sc
        && vhLearned(x) && !player.skillBar.includes(x));
      const bd = Object.keys(VOHOC_DEFS).find(x => VOHOC_DEFS[x].phai === sc && VOHOC_DEFS[x].type === 'passive');
      d.coDiSan = !!diSan; d.coBiDong = !!bd;

      // ③ kéo chiêu Di Sản lên thanh → %ST phải TỤT đúng bằng bậc của nó
      if (diSan){
        const mong = LEGACY_TIER_PCT[VOHOC_DEFS[diSan].tier] || 0;
        d.diSanTen = VOHOC_DEFS[diSan].name;
        window.knGan(1, diSan);
        d.legacy1 = +player.legacyAtkPct.toFixed(2);
        d.tut = +(d.legacy0 - d.legacy1).toFixed(2); d.tutMong = mong;
        // gỡ ra thì phải TRẢ LẠI
        window.knGo(1); d.legacy2 = +player.legacyAtkPct.toFixed(2);
      }
      // ① ô 1 từ chối bị động · không gỡ được
      player.skillBar = defaultSkillBar(sc); calcDerived();
      if (bd) d.o1NhanBiDong = window.knGan(0, bd);
      d.goO1 = window.knGo(0);
      d.o1SauKhiThu = player.skillBar[0];

      // ② + ④ ô 2 nhận bị động, và bị động chỉ chạy khi cắm
      if (bd){
        player.skillBar = ['a','tp',null,null]; calcDerived();
        // ⚠ ĐO CÁI CỬA, ĐỪNG ĐO CHỈ SỐ. Sáu bị động ăn vào sáu chỗ khác nhau, và HAI trong số
        // đó không phải chỉ số trong calcDerived: `songthu` là 30% bỏ qua hồi chiêu (trong
        // castSkill), `tienthiencong` là tự hồi sinh (trong update). Đo maxHp/leech/skillDmg
        // cho Dark Wizard thì ra "cắm hay không cắm đều như nhau" — báo oan, vì nó có cắm thật.
        // Cửa chung của cả sáu là `biDongBat()`, nên chấm ở đó.
        const cua0 = biDongBat(bd);
        const ngoai = { hp:player.maxHp, leech:+(player.hpLeech||0).toFixed(3),
                        sk:+(player.skillDmgPct||0).toFixed(3), heal:+(player.healRegenPct||0).toFixed(3) };
        d.gan2 = window.knGan(2, bd);
        const cua1 = biDongBat(bd);
        const trong = { hp:player.maxHp, leech:+(player.hpLeech||0).toFixed(3),
                        sk:+(player.skillDmgPct||0).toFixed(3), heal:+(player.healRegenPct||0).toFixed(3) };
        d.cua = { ngoai:cua0, trong:cua1 };
        d.bdDoi = JSON.stringify(ngoai) !== JSON.stringify(trong);   // chỉ SỐ có đổi không
        d.bdSo = { ngoai, trong };
      }
      // ⑤ không nhân bản
      player.skillBar = ['a','tp',null,null]; calcDerived();
      window.knGan(3, 'tp');
      d.doiCho = player.skillBar.slice();
      d.trungO = d.doiCho.filter(Boolean).length !== new Set(d.doiCho.filter(Boolean)).size;

      // ⑤b knRaSoat không được tự tạo ra trạng thái mà knGan cấm
      const xau = [[bd || 'a','a','a','khong_co_that'], [null,null,null,null], ['a','a','a','a']];
      d.raSoat = xau.map(v => { player.skillBar = v.slice(); knRaSoat();
        const b2 = player.skillBar.slice(), co = b2.filter(Boolean);
        return { ra:b2, trung: co.length !== new Set(co).size,
                 o1BiDong: !!(b2[0] && knLaBiDong(b2[0])), o1Trong: !b2[0] }; });
      o.lop[sc] = d;
    }
    // kéo thả: ô cây phải draggable, thanh HUD phải nhận thả
    startGame('thieulam', null); player.level = 90; player.lvPeak = 90; vhAutoLearn(); calcDerived();
    togglePanel('skill'); window.knTab('lop');
    const el = document.getElementById('panel-skill');
    o.keoDuoc = [...el.querySelectorAll('.kn-o:not(.kn-trong)')].filter(x => x.getAttribute('draggable') === 'true').length;
    o.oBar = el.querySelectorAll('.kn-bo').length;
    // ⚠ PHẢI DỰNG CẢNH CÓ Ô KHOÁ THẬT. Ở cấp 90 mọi chiêu đã mở ⇒ không ô `.khoa` nào ⇒
    // `.every()` trên mảng rỗng trả `true` và mệnh đề này XANH GIẢ. Thử ngược bắt được đúng
    // chỗ đó: phá "ô khoá vẫn kéo được" mà bài vẫn xanh. Hạ cấp xuống cho có ô khoá.
    startGame('thieulam', null); player.level = 2; player.lvPeak = 2; vhAutoLearn(); calcDerived();
    togglePanel('skill'); window.knTab('lop');
    const oKhoa = [...el.querySelectorAll('.kn-o.khoa')];
    o.soOKhoa = oKhoa.length;
    o.oKhoaKhongKeo = oKhoa.length > 0 && oKhoa.every(x => x.getAttribute('draggable') !== 'true');
    o.hudNhan = typeof window.knOTha === 'function' && typeof window.knOKeoQua === 'function';
    return o;
  });
  console.log(JSON.stringify(r, null, 1));

  const LOP = Object.keys(r.lop);
  let e1 = 0, e2 = 0, e3 = 0, e4 = 0, e5 = 0;
  for (const [sc, d] of Object.entries(r.lop)){
    if (d.coBiDong && d.o1NhanBiDong !== false) { fail(`${sc}: ô 1 NHẬN bị động`); e1++; }
    if (d.goO1 !== false || !d.o1SauKhiThu) { fail(`${sc}: ô 1 gỡ được / bị để trống`); e1++; }
    if (!d.coDiSan) fail(`${sc}: không tìm được chiêu Di Sản nào NGOÀI thanh — cảnh dựng chưa đủ, mệnh đề ③ xanh giả`);
    if (d.coDiSan){
      if (d.tut !== d.tutMong){ fail(`${sc}: kéo Di Sản lên thanh mà %ST tụt ${d.tut}, mong ${d.tutMong}`); e3++; }
      if (d.legacy2 !== d.legacy0){ fail(`${sc}: gỡ khỏi thanh mà %ST không trả lại (${d.legacy0}→${d.legacy2})`); e3++; }
    }
    if (d.coBiDong){
      if (d.gan2 !== true){ fail(`${sc}: ô 2 KHÔNG nhận bị động`); e2++; }
      // Cửa chung phải LẬT: chưa cắm thì tắt, cắm rồi thì bật. Đây là thứ cả sáu bị động đi qua.
      if (!(d.cua && d.cua.ngoai === false && d.cua.trong === true)){
        fail(`${sc}: biDongBat() không lật khi cắm vào ô — ${JSON.stringify(d.cua)}`); e4++;
      }
    }
    if (d.trungO){ fail(`${sc}: thanh có hai ô cùng một chiêu — ${JSON.stringify(d.doiCho)}`); e5++; }
    for (const x of d.raSoat){
      if (x.trung){ fail(`${sc}: knRaSoat tạo ra ô trùng — ${JSON.stringify(x.ra)}`); e5++; }
      if (x.o1BiDong){ fail(`${sc}: knRaSoat để BỊ ĐỘNG ở ô 1 — ${JSON.stringify(x.ra)}`); e1++; }
      if (x.o1Trong){ fail(`${sc}: knRaSoat để ô 1 TRỐNG — ${JSON.stringify(x.ra)}`); e1++; }
    }
  }
  if (!e1) pass(`① ô 1 chỉ nhận chủ động và không bao giờ trống (${LOP.length} lớp, kể cả save hỏng)`);
  if (!e2) pass('② ô 2-4 nhận được bị động');
  if (!e3) pass('③ kéo chiêu lên thanh thì MẤT đúng %Công Kích Di Sản của nó, gỡ ra thì trả lại');
  // Cửa lật thôi chưa đủ — nó phải được NỐI VÀO chỉ số thật. Đòi ít nhất một lớp đổi chỉ số
  // khi cắm, nếu không thì `biDongBat()` có thể là một hàm đúng mà chẳng ai gọi.
  const coNoi = Object.entries(r.lop).filter(([, d]) => d.coBiDong && d.bdDoi).map(([k]) => k);
  if (!coNoi.length){ fail('biDongBat() lật đúng nhưng KHÔNG lớp nào đổi chỉ số — cửa chưa nối vào calcDerived'); e4++; }
  if (!e4) pass(`④ bị động chỉ chạy khi cắm vào ô — cửa lật ở cả ${LOP.length} lớp, chỉ số đổi thật ở ${coNoi.join(', ')}`);
  if (!e5) pass('⑤ không ô nào trùng chiêu, kể cả sau knRaSoat trên save hỏng');

  if (!r.keoDuoc) fail('không ô cây nào kéo được');
  else pass(`${r.keoDuoc} ô cây kéo được`);
  if (!r.soOKhoa) fail('cảnh dựng KHÔNG có ô khoá nào — mệnh đề "ô khoá không kéo được" sẽ xanh giả');
  else if (!r.oKhoaKhongKeo) fail(`${r.soOKhoa} ô CHƯA MỞ KHOÁ vẫn kéo được — thả vào rồi bị từ chối là tệ hơn không kéo`);
  else pass(`${r.soOKhoa} ô chưa mở khoá, không ô nào kéo được`);
  if (r.oBar !== 4) fail(`bảng hiện ${r.oBar} ô thanh chiêu, phải là 4`);
  else pass('bảng hiện đủ 4 ô thanh chiêu');
  if (!r.hudNhan) fail('thanh HUD không có hàm nhận thả');
  else pass('thanh HUD nhận thả');

  // ⑥ vòng LƯU → NẠP. Phải chạy ở một evaluate riêng vì `loadGame` dựng lại `player`.
  const rs = await p.evaluate(() => {
    const LOP = ['thieulam','toanchan','baidasan','minhgiao','bug'];
    const out = [];
    for (const sc of LOP){
      startGame(sc, null); player.traits = [];
      player.level = 90; player.lvPeak = 90; vhAutoLearn();
      // Kéo một chiêu KHÔNG nằm trong thanh mặc định vào ô 3 — nếu nó vẫn ở đó sau khi nạp lại
      // thì lựa chọn của người chơi sống; nếu về mặc định thì `loadGame` đã ép lại thanh.
      const mac = defaultSkillBar(sc);
      const ngoai = Object.keys(VOHOC_DEFS).find(x =>
        VOHOC_DEFS[x].phai === sc && knDaNgo(x) && !mac.includes(x) && !knLaBiDong(x));
      if (!ngoai){ out.push({ sc, boQua:'không có chiêu chủ động nào ngoài thanh mặc định' }); continue; }
      knGan(2, ngoai);
      const truoc = player.skillBar.slice();
      saveGame();
      const ok = loadGame(activeSlot);
      out.push({ sc, ngoai, truoc, sau: player.skillBar.slice(), nap: ok });
    }
    return out;
  });
  let e6 = 0, doSanh = 0;
  for (const x of rs){
    if (x.boQua) continue;
    doSanh++;
    if (!x.nap){ fail(`${x.sc}: loadGame trả false`); e6++; continue; }
    if (JSON.stringify(x.truoc) !== JSON.stringify(x.sau)){
      fail(`${x.sc}: thanh chiêu KHÔNG sống qua lưu/nạp — ${JSON.stringify(x.truoc)} → ${JSON.stringify(x.sau)}`);
      e6++;
    }
    if (x.sau[2] !== x.ngoai){ fail(`${x.sc}: ô 3 mất chiêu tự gán (${x.ngoai})`); e6++; }
  }
  // Bài này chỉ có nghĩa nếu có lớp thật sự gán được một chiêu NGOÀI thanh mặc định — không thì
  // `truoc` bằng đúng mặc định và mệnh đề xanh kể cả khi `loadGame` ép lại thanh.
  if (!doSanh){ fail('⑥ không lớp nào gán được chiêu ngoài thanh mặc định — mệnh đề sẽ xanh giả'); e6++; }
  if (!e6) pass(`⑥ thanh chiêu tự gán sống qua lưu/nạp (${doSanh} lớp)`);

  // ⑦ NHÂN VẬT CẤP 1 PHẢI CÓ ĐỦ BỐN Ô. `defaultSkillBar()` cắm sẵn chiêu chưa tới cấp để nó
  // sáng lên khi lên cấp — nên `knRaSoat` không được lấy "chưa ngộ" làm cớ dọn ô. Tôi đã thêm
  // đúng cửa đó một lần và cả năm lớp mở ra chỉ còn MỘT ô; không lỗi, không ai báo.
  const r7 = await p.evaluate(() => {
    const out = {};
    for (const sc of ['thieulam','toanchan','baidasan','minhgiao','bug']){
      startGame(sc, null);
      knRaSoat();
      out[sc] = { lv: player.level, bar: player.skillBar.slice(), mac: defaultSkillBar(sc) };
    }
    return out;
  });
  let e7 = 0;
  for (const [sc, d] of Object.entries(r7)){
    if (d.lv !== 1){ fail(`⑦ ${sc}: nhân vật mới không ở cấp 1 (${d.lv}) — cảnh dựng sai`); e7++; continue; }
    const so = d.bar.filter(Boolean).length, soMac = d.mac.filter(Boolean).length;
    if (so !== soMac){ fail(`⑦ ${sc} cấp 1: thanh còn ${so}/${soMac} ô — ${JSON.stringify(d.bar)}`); e7++; }
  }
  if (!e7) pass('⑦ nhân vật cấp 1 giữ đủ ô mặc định (chiêu chưa tới cấp vẫn nằm sẵn trên thanh)');

  console.log('errors:', JSON.stringify(errs));
  if (errs.length) fail('lỗi trang: ' + errs[0]);
  console.log(bad === 0 ? 'PASS' : 'FAIL(' + bad + ')');
  await b.close();
  process.exit(bad === 0 ? 0 : 1);
})();
