// Bộ kỹ năng 5 lớp — xem docs/KY_NANG_5_LOP.md
//
// Bốn thứ dễ hỏng nhất của một hệ chiêu chia theo lớp, và cả bốn đều đã từng hỏng thật:
//
//  1. CHIÊU LỚP KHÁC LỌT VÀO CÂY CỦA MÌNH. Bảng K của một Sylvan Ranger từng liệt kê Cyclone
//     (Dark Knight) và Lightning/Ice/Twister/Nova (Dark Wizard) để mua bằng Sách Kỹ Năng — cung
//     thủ đọc bảng chiêu của mình thấy gần trọn bộ chiêu pháp sư. Mục 1 quét cả năm lớp: mọi
//     chiêu học được và mọi tên hiện trên bảng phải thuộc đúng lớp đó (trừ nhánh Kế Thừa của
//     Spellblade, vốn là đặc điểm lớp lai và có nhãn riêng).
//  2. NĂM LỚP MỘT CƠ CHẾ. Ba lớp từng có buff giống hệt nhau, chỉ khác con số (+35/+30/+25% ST).
//     Mục 2 bấm buff của từng lớp rồi ĐO: mỗi lớp phải đổi một đại lượng khác nhau.
//  3. HOẠT ẢNH DÙNG CHUNG. Ice Arrow từng chạy trận đồ lục tinh của bản kiếm hiệp; Chaotic
//     Diseier và Dark Raven của cùng một lớp dùng chung bầy quạ. Mục 3 đòi 20 ô bấm được có 20
//     hoạt ảnh khác nhau.
//  4. BỊ ĐỘNG CHỈ LÀ DÒNG CHỮ. Swell Life ghi "+15% HP", Heal ghi "hồi 1% HP/giây", Iron Will
//     ghi "hút máu" — không cái nào nối vào chỉ số nào. Mục 4 bật/tắt từng cái rồi đo chỉ số.
const { chromium } = require('playwright');
const PORT = process.argv[2] || '8853';
(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport:{ width:1100, height:800 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e).split('\n')[0]));
  await p.goto('http://localhost:' + PORT + '/index.html');
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(700);
  let bad = 0; const fail = m => { console.log('FAIL', m); bad++; };
  const pass = m => console.log('PASS', m);

  const r = await p.evaluate(() => {
    window.TEST_MODE = true;
    const LOP = ['thieulam','toanchan','baidasan','minhgiao','bug'];
    const o = { lop:{}, buff:{}, pas:{}, style:{}, loi:[] };

    for (const sect of LOP){
      startGame(sect, null); player.traits = []; player.level = 60; player.lvPeak = 60;
      vhAutoLearn(); calcDerived();
      // Bảng nay là cây có tab — gom HTML cả ba tab, nếu không thì phép quét rò chiêu chỉ soi
      // được một phần ba bảng và một chiêu lớp khác nằm ở tab kia sẽ lọt.
      togglePanel('skill');
      let html = el('panel-skill').innerHTML;
      if (typeof KN_TAB !== 'undefined') for (const x of KN_TAB){ window.knTab(x.id); html += el('panel-skill').innerHTML; }
      o.lop[sect] = {
        ten: SECTS[sect].name,
        bar: player.skillBar.map(id => id ? skName(id) : null),
        diSan: LEGACY_SECT_SKILLS.filter(x => VOHOC_DEFS[x].phai === sect).map(x => VOHOC_DEFS[x].name),
        biDong: CLASS_PASSIVES.filter(x => VOHOC_DEFS[x].phai === sect).map(x => VOHOC_DEFS[x].name),
        // chiêu của lớp KHÁC mà nhân vật này học được / nhìn thấy trên bảng
        // ⚠ "Chiêu lớp khác" nghĩa là chiêu THUỘC một lớp khác — không phải mọi thứ không thuộc
        // lớp này. Bảy bị động chỉ số khai `phai: null` (chung cho cả năm lớp, xem KN_XUONG_SONG)
        // nên chúng đúng là ai cũng học; gộp chúng vào đây là bài kiểm tố cáo cả 5 lớp cùng lúc
        // vì một thứ chính nó được thiết kế để dùng chung.
        hocLan: Object.keys(VOHOC_DEFS).filter(x => VOHOC_DEFS[x].phai && VOHOC_DEFS[x].phai !== sect && vhLearned(x)).map(x => VOHOC_DEFS[x].name),
        chung: Object.keys(VOHOC_DEFS).filter(x => !VOHOC_DEFS[x].phai && vhLearned(x)).length,
        // ⚠ TRÙNG TÊN KHÔNG PHẢI RÒ CHIÊU. Phép đo là so chuỗi `>tên<`, mà "Twisting Slash"
        // vừa là `skillA` của Dark Knight vừa là `mg_twistingslash` của Spellblade. Bảng kỹ năng
        // kiểu cây in tên dạng `<b>Tên</b>` nên khớp đúng khuôn đó, và Dark Knight bị báo oan là
        // đang hiện chiêu Spellblade. Nên trừ ra trước những tên mà CHÍNH lớp này sở hữu.
        hienLan: (() => {
          const cuaMinh = new Set([SECTS[sect].skillA && SECTS[sect].skillA.name,
                                   SECTS[sect].tp && SECTS[sect].tp.name]
            .concat(Object.keys(VOHOC_DEFS).filter(x => VOHOC_DEFS[x].phai === sect).map(x => VOHOC_DEFS[x].name))
            .filter(Boolean));
          return Object.keys(VOHOC_DEFS)
            .filter(x => VOHOC_DEFS[x].phai !== sect && !cuaMinh.has(VOHOC_DEFS[x].name)
                      && html.includes('>' + VOHOC_DEFS[x].name + '<'))
            .map(x => VOHOC_DEFS[x].name);
        })(),
        stDiSan: player.legacyAtkPct,
        thanhKhai: (typeof THANH_LOP !== 'undefined' && THANH_LOP[sect]) ? THANH_LOP[sect].slice() : null,
        // pool sáu chiêu trừ phần đang trên thanh, cộng hai hệ tấn chức phụ theo cấp — đúng
        // công thức `legacyAtkPct` trong calcDerived, tính lại độc lập để đối chiếu.
        poolTru: (() => {
          const tren = new Set((player.skillBar || []).filter(Boolean));
          let t = 0;
          for (const x of LEGACY_SECT_SKILLS){
            const v = VOHOC_DEFS[x];
            if (v && v.phai === player.sect && vhLearned(x) && !tren.has(x)) t += LEGACY_TIER_PCT[v.tier] || 0;
          }
          if (player.level >= 48) t += LEGACY_UNIVERSAL_PCT.danchi;
          if (player.level >= 72) t += LEGACY_UNIVERSAL_PCT.tieuhon;
          return +t.toFixed(2);
        })(),
        conNutHoc: /learnVohocUI/.test(html) || /NGOẠI LỚP/.test(html),
      };
      closePanels();
    }

    // ── 2. năm ô buff, năm cơ chế ──
    for (const [sect, bid] of Object.entries(BUFF_SKILL_ID)){
      if (!bid) continue;   // lớp chưa có chiêu buff (nay chỉ còn Dark Wizard — ô 3 là Meteorite)
      startGame(sect, null); player.traits = []; player.level = 60; player.lvPeak = 60;
      vhAutoLearn(); calcDerived();
      const t0 = { atk:player.atk, aspd:player.aspd, crit:player.crit, shield:player.vhShield || 0, gk:player.gkBuffT || 0 };
      player.hp = Math.round(player.maxHp * 0.5); const hp0 = player.hp;
      player.qi = player.maxQi; player.cd = {};
      castSkill(bid); calcDerived();
      o.buff[sect] = { ten: skName(bid),
        hoiMau: player.hp - hp0,
        khien: (player.vhShield || 0) - t0.shield,
        stX: +(player.atk / t0.atk).toFixed(2),
        tocDanhX: +(t0.aspd / player.aspd).toFixed(2),
        baoKich: +(player.crit - t0.crit).toFixed(2),
        giamST: +((player.gkBuffT || 0) - t0.gk).toFixed(1) };
    }

    // ── 3. hoạt ảnh của 20 ô bấm được ──
    for (const sect of LOP){
      startGame(sect, null); vhAutoLearn();
      // ⚠ TRA THEO MÃ CHIÊU, KHÔNG THEO CHỈ SỐ Ô. Bản cũ khoá cứng `0 → sx_<lớp>_a` và
      // `1 → sx_<lớp>_c` — tức giả định chiêu trấn phái LUÔN nằm ở ô 2. Dark Wizard nay đặt
      // Meteorite (chính là `tp`) xuống ô 3, nên phép tra trượt và bài báo "Meteorite không
      // khai hoạt ảnh riêng" trong khi nó có nguyên một gói art. `a` và `tp` là MÃ, vị trí của
      // chúng trên thanh là chuyện khác.
      const maKey = id => id === 'a' ? 'sx_' + sect + '_a' : id === 'tp' ? 'sx_' + sect + '_c' : null;
      player.skillBar.forEach((id) => {
        if (!id) return;
        const i = maKey(id);
        // Chiêu có TRANH THẬT không khai style vector ở đâu cả — chữ ký hình ảnh của nó là tên
        // tấm dán / đường vẽ riêng, ghi trong CHIEU_TRANH. Đọc thẳng từ đó, đừng chép lại
        // danh sách sang bên này: hai danh sách rồi sẽ lệch nhau.
        const A = CHIEU_TRANH[id] || CHIEU_TRANH[i];
        const c = A ? { style: A.atlas || A.ve }
                : VH_VFX[id] || SECT_VFX[i] || SECT_VFX[id] || null;
        // Chữ ký hình ảnh = kiểu hoạt ảnh + kiểu đạn. Triple Shot và Penetration cùng dùng cú
        // loé 'flash' lúc xuất chiêu, nhưng thứ người chơi nhìn là viên đạn: ba mũi tên ngắn
        // ('arrow') so với một mũi dài kéo vệt sáng xuyên cả hàng ('lance').
        o.style[sect + '/' + skName(id)] = c ? c.style + (c.proj ? '/' + c.proj : '') : null;
      });
    }

    // ── 4. bị động nối vào chỉ số thật ──
    // ⚠ BỊ ĐỘNG NAY CHỈ CHẠY KHI NẰM TRÊN THANH CHIÊU (`biDongBat`). Ngộ được là chưa đủ —
    // đó là cả cái giá của ba ô còn lại. Nên phép đo phải CẮM nó vào ô rồi mới đo, không thì
    // bài này đo đúng thứ mà thiết kế cố ý không cho chạy, và đỏ ở một chỗ chẳng nói lên gì.
    // Vẫn giữ nguyên độ chặt: vế "chỉ là dòng chữ" vẫn bị bắt, chỉ khác ở chỗ đo cho đúng cửa.
    const doPas = (sect, id, f) => {
      startGame(sect, null); player.traits = []; player.level = 60; player.lvPeak = 60;
      player.vohoc = {}; knRaSoat(); calcDerived(); const truoc = f();
      player.vohoc[id] = true; knGan(1, id); calcDerived(); const sau = f();
      o.pas[id] = { ten:VOHOC_DEFS[id].name, truoc, sau, tren: player.skillBar.includes(id) };
    };
    doPas('thieulam','dk_fortitude', () => player.maxHp);
    doPas('minhgiao','mg_ironwill',  () => +(player.hpLeech || 0).toFixed(2));
    doPas('bug','dl_darkraven',      () => +(player.skillDmgPct || 0).toFixed(2));
    doPas('toanchan','elf_heal',     () => +(player.healRegenPct || 0).toFixed(3));

    // ── 5. Sách Kỹ Năng phải còn chỗ tiêu (bỏ ngoại lớp là bỏ đường tiêu cũ) ──
    startGame('thieulam', null); player.level = 60; player.lvPeak = 60; player.bikipVH = 3;
    const lv0 = skLv('a'); window.useSkillBookUI('a');
    o.sach = { truoc:lv0, sau:skLv('a'), conLai:player.bikipVH };
    return o;
  });
  console.log(JSON.stringify(r, null, 1));

  // ── 1. bản sắc lớp ──
  const KE_THUA = ['Fireball','Power Wave','Twisting Slash']; // Spellblade — lớp lai, MU cho kế thừa
  for (const [sect, d] of Object.entries(r.lop)){
    if (d.hocLan.length) fail(`${d.ten} học được chiêu lớp khác: ${d.hocLan.join(', ')}`);
    const la = d.hienLan.filter(n => !(sect === 'minhgiao' && KE_THUA.includes(n)));
    if (la.length) fail(`bảng K của ${d.ten} hiện chiêu lớp khác: ${la.join(', ')}`);
    if (d.conNutHoc) fail(`bảng K của ${d.ten} vẫn còn mục/nút học di sản NGOẠI LỚP`);
    // Ô 3 của Dark Knight TỪNG trống có chủ ý (chiêu 'gangkhi'/Defense đi cùng hệ Thuần Thục đã
    // gỡ). Nay đã lấp bằng Bulwark — chiêu chủ động thứ sáu của lớp, xem dk_bulwark trong
    // data/canbang.js — nên dòng gác này đã siết lại cho cả NĂM lớp, đúng như ghi chú cũ hẹn.
    // Không nới lại ngoại lệ cho lớp nào: một ô trống trên thanh 4 ô là một nút người chơi bấm
    // vào không có gì xảy ra.
    // ⚠ Ô TRỐNG CHỈ ĐƯỢC PHÉP KHI LỚP KHAI RÕ TRONG `THANH_LOP`. Chủ dự án chốt để trống ô 2 và
    // ô 4 của Dark Wizard (Meteorite xuống ô 3, Inferno + Evil Spirit sang Di Sản) rồi điền sau.
    // Cho qua bằng một danh sách miễn trừ trong BÀI KIỂM là mở cửa cho nó lan sang lớp khác mà
    // không ai thấy; đọc thẳng bảng của game thì ô trống nào cũng phải có người khai ra nó.
    const _thieu = d.bar.map((x, i) => x ? -1 : i).filter(i => i >= 0);
    const _choPhep = (d.thanhKhai || []).map((x, i) => x ? -1 : i).filter(i => i >= 0);
    const _laDu = _thieu.filter(i => !_choPhep.includes(i));
    if (_laDu.length) fail(`${d.ten} thiếu chiêu ở ô ${_laDu.join(',')} mà KHÔNG khai trong THANH_LOP: ${JSON.stringify(d.bar)}`);
    else if (_thieu.length) console.log(`    ${d.ten}: ô ${_thieu.map(i=>i+1).join(',')} cố ý để trống (THANH_LOP) — chờ chủ dự án điền`);
    // ⚠ LUẬT ĐÃ ĐỔI: `LEGACY_SECT_SKILLS` nay khai CẢ SÁU chiêu chủ động của lớp, và Di Sản
    // THẬT = sáu chiêu đó TRỪ những ô đang nằm trên thanh (`calcDerived` trừ động). Bản cũ chốt
    // "đúng 4" tức là chép tay KẾT QUẢ của phép trừ — đổi một ô taskbar là phải nhớ sửa bảng,
    // quên thì %Công Kích lệch âm thầm. Nay chấm hai thứ ĐO ĐƯỢC: pool sáu chiêu, và %ST thật.
    if (d.diSan.length !== 6) fail(`${d.ten} có ${d.diSan.length} chiêu trong pool Di Sản, phải là 6`);
    if (!d.biDong.length) fail(`${d.ten} không có bị động riêng`);
  }
  if (!bad) pass('5 lớp: mỗi lớp chỉ có chiêu của chính mình (trừ nhánh Kế Thừa của Spellblade)');
  // ⚠ LUẬT THẬT: %ST Di Sản = pool SÁU chiêu của lớp TRỪ những chiêu đang nằm trên thanh.
  // Nên "năm lớp bằng nhau" chỉ đúng khi năm lớp cùng cắm bấy nhiêu chiêu Di Sản lên thanh.
  // Dark Wizard đang cố ý bỏ trống ô 2 và ô 4 (THANH_LOP) nên không trừ được gì ⇒ nó CAO hơn,
  // và đó là cái giá đúng của việc thiếu hai nút bấm — nó tự về bằng ngay khi hai ô được điền.
  // Chấm hai thứ riêng: (a) cơ chế trừ có chạy đúng không, (b) các lớp thanh ĐẦY có bằng nhau.
  const lech = Object.entries(r.lop).filter(([, d]) => d.poolTru !== d.stDiSan);
  if (lech.length) fail('cơ chế trừ Di Sản theo thanh sai: ' + lech.map(([,d])=>`${d.ten} đo ${d.stDiSan} · tính ${d.poolTru}`).join(' · '));
  else pass('mọi lớp: %ST Di Sản đúng bằng pool sáu chiêu trừ phần đang nằm trên thanh');
  const day = Object.entries(r.lop).filter(([, d]) => !(d.thanhKhai || []).some(x => !x));
  const pcts = [...new Set(day.map(([, d]) => d.stDiSan))];
  if (day.length < 2) fail(`chỉ còn ${day.length} lớp có thanh đầy — mệnh đề "không lớp nào được ưu ái" hết chỗ bám`);
  else if (pcts.length !== 1) fail('%ST di sản lệch giữa các lớp thanh ĐẦY: ' + day.map(([,d])=>`${d.ten} ${d.stDiSan}`).join(' · '));
  else {
    pass(`${day.length} lớp thanh đầy cùng +${pcts[0]}% Công Kích từ di sản — không lớp nào được ưu ái`);
    for (const [, d] of Object.entries(r.lop)) if ((d.thanhKhai || []).some(x => !x))
      console.log(`    ${d.ten}: +${d.stDiSan}% (cao hơn ${(d.stDiSan - pcts[0]).toFixed(1)}) vì đang bỏ trống ô trên thanh — tự về bằng khi điền`);
  }

  // tên chiêu không trùng nhau giữa các lớp (trừ Kế Thừa)
  const tenTheoLop = {};
  // ⚠ GỘP TRONG CÙNG MỘT LỚP TRƯỚC. `bar` và `diSan` nay GIAO NHAU (pool khai cả sáu chiêu, hai
  // trong số đó đang nằm trên thanh), nên nối thẳng hai mảng là một chiêu tự trùng với chính nó
  // và bài báo "trùng giữa các lớp (thieulam+thieulam)" — vô nghĩa. Và bỏ ô trống: `null` không
  // phải một cái tên.
  for (const [sect, d] of Object.entries(r.lop))
    for (const n of new Set([...d.bar, ...d.diSan, ...d.biDong].filter(Boolean)))
      (tenTheoLop[n] = tenTheoLop[n] || []).push(sect);
  const trung = Object.entries(tenTheoLop).filter(([n, ls]) => ls.length > 1 && !KE_THUA.includes(n));
  if (trung.length) fail('tên chiêu trùng giữa các lớp: ' + trung.map(([n,ls])=>`${n} (${ls.join('+')})`).join(', '));
  else pass('không tên chiêu nào dùng chung giữa hai lớp');

  // ── 2. buff ──
  // BỐN lớp, không phải năm: chỉ Dark Wizard không có chiêu buff ở ô 3.
  // Dark Knight TỪNG nằm trong nhóm không buff (ô 3 trống sau khi gỡ hệ Thuần Thục). Ô đó nay
  // là Bulwark — chiêu chủ động thứ sáu thêm riêng cho lớp, xem dk_bulwark trong canbang.js.
  // Dòng gác cũ ('Dark Knight lại có chiêu buff — nếu là cố ý thì siết luôn mục 1 lại') đã làm
  // đúng việc của nó: mục 1 siết rồi, nên dòng này lật lại thành khẳng định dương.
  const B = r.buff;
  if (!B.thieulam) fail('Dark Knight mất chiêu buff ở ô 3 — Bulwark phải là chiêu bấm được');
  else if (!(B.thieulam.khien > 0)) fail('Bulwark (Dark Knight) không dựng khiên');
  else pass(`Bulwark: khiên ${B.thieulam.khien} — cơ chế không lớp nào khác dùng`);
  // ⚠ Dark Wizard nay đặt Meteorite (`tp`) xuống ô 3, ô 2 và ô 4 để trống chờ chủ dự án điền;
  // Inferno và Evil Spirit rời thanh sang Di Sản. `O3_SKILL_ID.baidasan` vì thế là `null`, nên
  // lớp này không có chiêu buff ở ô 3 — vẫn đúng kết luận cũ, nhưng KHÁC lý do. Câu cũ ghi "ô
  // đó nay là Inferno" đã thành lời nói dối ngay lúc ô 3 đổi chủ; một mệnh đề XANH mà in ra câu
  // sai thì còn tệ hơn đỏ, vì không ai đi đọc lại nó.
  if (B.baidasan) fail('Dark Wizard lại có chiêu buff ở ô 3 — ô đó nay là Meteorite');
  else pass('Dark Wizard ô 3 là Meteorite (chiêu trấn phái), không phải chiêu buff');
  if (!(B.toanchan.hoiMau > 0 && B.toanchan.stX > 1)) fail('Bless (Sylvan Ranger) không hồi máu'); else pass(`Bless: +${B.toanchan.hoiMau} HP và ×${B.toanchan.stX} ST`);
  if (!(B.minhgiao.tocDanhX > 1.1 && B.minhgiao.stX > 1)) fail('Battle Fury (Spellblade) không cộng tốc đánh'); else pass(`Battle Fury: ×${B.minhgiao.stX} ST và ×${B.minhgiao.tocDanhX} tốc đánh`);
  if (!(B.bug.baoKich > 0.3)) fail('Increase Critical Damage (Dark Lord) không cộng bạo kích'); else pass(`Increase Critical Damage: +${B.bug.baoKich} bạo kích`);
  // và không hai lớp nào cùng một hồ sơ hiệu ứng
  const hoSo = Object.entries(B).map(([k, v]) => [k, [v.hoiMau>0, v.khien>0, v.stX>1, v.tocDanhX>1.05, v.baoKich>0.3, v.giamST>0].join('')]);
  const dup = hoSo.filter(([k, h], i) => hoSo.findIndex(([, h2]) => h2 === h) !== i);
  if (dup.length) fail('hai lớp có buff cùng cơ chế: ' + dup.map(x=>B[x[0]].ten).join(', '));
  else pass('mỗi ô buff một cơ chế khác nhau');

  // ── 3. hoạt ảnh ──
  const thieu = Object.entries(r.style).filter(([, v]) => !v).map(([k]) => k);
  if (thieu.length) fail('chiêu không khai hoạt ảnh riêng: ' + thieu.join(', '));
  const dem = {}; for (const [k, v] of Object.entries(r.style)) (dem[v] = dem[v] || []).push(k);
  const chung = Object.entries(dem).filter(([, ks]) => ks.length > 1);
  if (chung.length) fail('hoạt ảnh dùng chung: ' + chung.map(([v, ks]) => `${v} ← ${ks.join(' + ')}`).join(' · '));
  if (!thieu.length && !chung.length) pass(`${Object.keys(r.style).length} ô bấm được = ${Object.keys(dem).length} hoạt ảnh khác nhau`);

  // Chiêu CHUNG phải thật sự chung: cả năm lớp học được đúng bằng nhau, và khác 0. Nếu không
  // thì `phai: null` chỉ là một cách viết khác của "không lớp nào học được", mà mệnh đề
  // `hocLan` ở trên lại vừa được nới ra để bỏ qua đúng nhóm này — nới mà không có ai gác là
  // mở một lỗ thủng ngay chỗ vừa vá.
  const soChung = Object.values(r.lop).map(d => d.chung);
  if (!soChung[0]) fail('không lớp nào học được chiêu CHUNG — `phai: null` đang là chữ chết');
  else if (new Set(soChung).size !== 1) fail(`chiêu chung không chung: ${JSON.stringify(soChung)}`);
  else pass(`chiêu chung: cả 5 lớp đều học đủ ${soChung[0]} cái`);

  // ── 4. bị động ──
  for (const [id, d] of Object.entries(r.pas)){
    if (!d.tren) fail(`bị động ${d.ten}: không cắm được vào ô — phép đo dưới đây sẽ vô nghĩa`);
    else if (d.truoc === d.sau) fail(`bị động ${d.ten} không đổi chỉ số nào (${d.truoc} → ${d.sau}) — chỉ là dòng chữ`);
    else pass(`${d.ten}: ${d.truoc} → ${d.sau}`);
  }

  // ── 5. Sách Kỹ Năng ──
  if (r.sach.sau !== r.sach.truoc + 1 || r.sach.conLai !== 2) fail(`Sách Kỹ Năng không nâng được cấp chiêu: ${JSON.stringify(r.sach)}`);
  else pass(`Sách Kỹ Năng: chiêu Lv${r.sach.truoc} → Lv${r.sach.sau}, còn ${r.sach.conLai} quyển`);

  console.log('errors:', JSON.stringify(errs.slice(0, 5)));
  if (errs.length) bad++;
  console.log(bad ? `FAIL(${bad})` : 'PASS');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
