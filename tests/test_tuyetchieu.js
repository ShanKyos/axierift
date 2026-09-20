// Ô thứ 4 — TUYỆT CHIÊU, bộ biểu tượng riêng cho từng chiêu, và chiêu Penetration mới.
//
// Ba vấn đề bài kiểm này chốt lại:
//   1. Taskbar chỉ có 3 ô, nên tuyệt chiêu Dark Wizard và Power Slash (Spellblade) — hai chiêu
//      đặc trưng nhất của hai lớp đó trong MU — chỉ tồn tại ở bảng Di Sản Cũ dưới dạng +%ST vĩnh
//      viễn. Người chơi không bao giờ bấm được chúng.
//   2. 26 chiêu lớp dùng chung 6 biểu tượng, 18 chiêu rơi hết về 'blade_up'; và 10 file art của
//      chiêu chính/Trấn Phái là ảnh mượn tạm không vẽ chiêu nào (tl_a.png là đồng xu mặt Axie).
//   3. Sylvan Ranger có 0 chiêu chủ động trong cây lớp — cả bốn đều bị động/buff.
const { chromium } = require('playwright');
let bad = 0; const fail = m => { bad++; console.log('FAIL ' + m); };
const pass = m => console.log('PASS ' + m);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const errs = [];
  const boot = async (sect) => {
    const p = await (await b.newContext({ viewport:{width:1280,height:800} })).newPage();
    p.on('pageerror', e => errs.push(String(e).split('\n')[0]));
    await p.goto('http://localhost:8853/index.html?max=1', { waitUntil:'load' });
    await p.waitForFunction(() => window.__gameReady).catch(()=>{});
    await p.evaluate((sc) => { window.TEST_MODE = true; startGame(sc, null); }, sect);
    await p.waitForTimeout(900);
    return p;
  };

  // ---- 1. Mỗi lớp đủ 4 ô, ô 4 là tuyệt chiêu riêng, không lớp nào trùng lớp nào ----
  const p1 = await boot('thieulam');
  const r1 = await p1.evaluate(() => {
    const out = {};
    for (const sk in SECTS){
      const bar = defaultSkillBar(sk);
      out[sk] = { so: bar.length, o4: bar[3],
        // ô trống chỉ hợp lệ khi chính game khai ra nó — xem THANH_LOP trong game.js
        khaiTrong: !!(typeof THANH_LOP !== 'undefined' && THANH_LOP[sk] && !THANH_LOP[sk][3]) };
    }
    return { lop: out, oHTML: document.querySelectorAll('.sk-slot').length,
             sig: Object.keys(SIGNATURE_SKILL).length };
  });
  console.log('1) ô thứ 4 theo lớp:', JSON.stringify(r1));
  for (const sk in r1.lop){
    if (r1.lop[sk].so !== 4) fail(`lớp ${sk} có ${r1.lop[sk].so} ô, phải là 4`);
    // ⚠ Ô 4 TRỐNG chỉ được tha khi `THANH_LOP` khai rõ. Chủ dự án chốt để trống ô 2 + ô 4 của
    // Dark Wizard rồi điền sau; miễn trừ bằng một danh sách tên lớp NGAY TRONG BÀI KIỂM thì lần
    // sau có lớp thứ hai rơi vào cùng trạng thái sẽ lọt êm.
    if (!r1.lop[sk].o4 && !r1.lop[sk].khaiTrong) fail(`lớp ${sk} không có tuyệt chiêu ở ô 4`);
    else if (!r1.lop[sk].o4) console.log(`    ${sk}: ô 4 cố ý để trống (THANH_LOP) — chờ chủ dự án điền`);
  }
  const o4 = Object.values(r1.lop).map(x => x.o4).filter(Boolean);   // ô để trống không tính là "trùng"

  if (new Set(o4).size !== o4.length) fail(`hai lớp dùng chung một tuyệt chiêu: ${o4.join(', ')}`);
  if (r1.oHTML < 4) fail(`HTML chỉ có ${r1.oHTML} nút kỹ năng — ô 4 không hiện ra`);

  // ---- 2. Tuyệt chiêu phải BẤM ĐƯỢC và gây sát thương, không chỉ là +%ST ----
  const r2 = await p1.evaluate(async () => {
    applyTestBoost && applyTestBoost();
    travelTo('ardhaven'); travelTo('daohoa');
    mobs.length = 0;
    for (let i = 0; i < 6; i++)
      spawnMob('boar', { x: player.x + 60 + i*40, y: player.y, r:1, count:1 }, null);
    mobs.forEach(m => { m.hp = m.maxHp = 1e9; });
    const id = player.skillBar[3];
    const hp0 = mobs.map(m => m.hp);
    player.cd = {}; player.qi = player.maxQi;
    mouseWorld.x = player.x + 200; mouseWorld.y = player.y;
    castSkill(id);
    await new Promise(r => setTimeout(r, 900));
    // ⚠ ĐO %ST THẬT, đừng suy từ việc chiêu có mặt trong `LEGACY_SECT_SKILLS`. Bảng đó nay khai
    // CẢ SÁU chiêu chủ động của lớp, và `calcDerived` TRỪ ĐỘNG những chiêu đang nằm trên thanh —
    // nên "có tên trong bảng" không còn nghĩa là "được cộng %ST". Mệnh đề cũ suy từ danh sách sẽ
    // đỏ oan; cái nó thật sự muốn biết là chiêu ô 4 có bị cộng hai lần không, mà chuyện đó thì
    // cân được: gỡ khỏi thanh phải LÀM %ST TĂNG, còn để trên thanh thì không.
    calcDerived(); const pctTren = player.legacyAtkPct;
    const _bar = player.skillBar.slice(); player.skillBar = [_bar[0], _bar[1], _bar[2], null];
    calcDerived(); const pctNgoai = player.legacyAtkPct;
    player.skillBar = _bar; calcDerived();
    return { chieu: id, ten: (skillInfo(id)||{}).name,
      trung: mobs.filter((m,i) => m.hp < hp0[i]).length,
      pctTren: +pctTren.toFixed(2), pctNgoai: +pctNgoai.toFixed(2),
      bacMong: LEGACY_TIER_PCT[(VOHOC_DEFS[id] || {}).tier] || 0 };
  });
  console.log('2) bấm ô 4:', JSON.stringify(r2));
  if (!r2.trung) fail(`bấm tuyệt chiêu ${r2.ten} mà không con nào trúng đòn`);
  if (r2.bacMong && +(r2.pctNgoai - r2.pctTren).toFixed(2) !== r2.bacMong)
    fail(`${r2.chieu} ở ô 4 mà %ST Di Sản không bị trừ đúng bậc: trên thanh ${r2.pctTren} · ngoài thanh ${r2.pctNgoai} (chênh phải là ${r2.bacMong})`);
  else if (r2.bacMong) pass(`${r2.chieu} ở ô 4 thì KHÔNG cộng %ST (${r2.pctTren} → ${r2.pctNgoai} khi gỡ ra)`);
  await p1.close();

  // ---- 3. Mỗi chiêu một biểu tượng riêng, và không còn ô nào dùng art mượn tạm ----
  const p3 = await boot('baidasan');
  const r3 = await p3.evaluate(() => {
    const dung = {}, thieu = [];
    for (const vid in VOHOC_DEFS){
      const sym = SK_ICON_FOR[vid];
      if (!sym) thieu.push(vid); else (dung[sym] = dung[sym] || []).push(vid);
    }
    // biểu tượng nào bị hai chiêu trở lên dùng chung — chấp nhận với nhóm khiên/bị động cùng dạng
    const chung = Object.entries(dung).filter(([, v]) => v.length > 1).map(([k, v]) => k + ':' + v.length);
    // Art MƯỢN TẠM = một tệp dùng cho nhiều ô, hoặc tệp không nạp được. Art RIÊNG của đúng
    // chiêu ấy thì hoan nghênh — icon Meteorite chẳng hạn cắt thẳng ra từ tấm dán meteor_rain
    // (tools/icon_chieu.py), nên ô kỹ năng và thứ nổ trên màn hình là một.
    const artMuon = [], dem = {};
    for (const sk in SECT_ART){
      const a = SECT_ART[sk];
      for (const k of ['iconA', 'iconTP']){
        const v = a[k]; if (!v || String(v).startsWith('data:')) continue;
        dem[v] = (dem[v] || 0) + 1;
        if (dem[v] > 1) artMuon.push(sk + '.' + k + '=' + v);
      }
    }
    return { soChieu: Object.keys(VOHOC_DEFS).length, soBieuTuong: Object.keys(SK_ICON_SYMS).length,
             thieu, chung, artMuon,
             oTaskbar: player.skillBar.map(id => { const i = id && skillInfo(id);
               return i && i.icon ? (String(i.icon).startsWith('data:') ? 'vẽ' : String(i.icon)) : 'TRỐNG'; }),
             khaiTrong: (typeof THANH_LOP !== 'undefined' && THANH_LOP[player.sect])
               ? THANH_LOP[player.sect].map(x => !x) : [] };
  });
  console.log('3) biểu tượng:', JSON.stringify(r3));
  if (r3.thieu.length) fail(`${r3.thieu.length} chiêu chưa có biểu tượng riêng: ${r3.thieu.join(', ')}`);
  if (r3.soBieuTuong < 20) fail(`chỉ có ${r3.soBieuTuong} biểu tượng cho ${r3.soChieu} chiêu — vẫn dùng chung quá nhiều`);
  if (r3.artMuon.length) fail(`còn ô kỹ năng trỏ vào art mượn tạm: ${r3.artMuon.join(', ')}`);
  // Ô cố ý để trống (THANH_LOP) thì không có chiêu nên cũng không có icon — đó không phải lỗi
  // icon. Ô trống KHÔNG khai thì vẫn là lỗi, và §1 ở trên mới là chỗ gác chuyện đó.
  const _khaiTrong = r3.khaiTrong || [];
  const _mat = r3.oTaskbar.map((x, i) => (x === 'TRỐNG' && !_khaiTrong[i]) ? i : -1).filter(i => i >= 0);
  if (_mat.length) fail(`taskbar còn ô không có icon: ô ${_mat.map(i=>i+1).join(',')} trong ${JSON.stringify(r3.oTaskbar)}`);
  else console.log(`   4 ô taskbar đều có icon: ${JSON.stringify(r3.oTaskbar)}`);

  // ---- 4. Năm chiêu đặc trưng có hiệu ứng RIÊNG, không rơi về style mặc định theo kiểu chiêu ----
  const r4 = await p3.evaluate(() => {
    const MAC_DINH = ['crescents', 'suns', 'flash', 'wuxing', 'vajra'];
    // firelines → firepillar sau đợt làm HOẠT ẢNH: ba vệt lửa nay dựng lên thành CỘT lửa.
    // Tuyệt chiêu Dark Wizard rời khỏi bảng này vì đã có tranh thật — xem vòng kiểm CHIEU_TRANH ngay dưới.
    // crowswarm → quakeburst ở đợt làm lại bộ chiêu 5 lớp: tuyệt chiêu của Dark Lord dùng CHUNG
    // bầy quạ với Dark Raven của chính lớp đó — hai chiêu một lớp trông y hệt nhau. Nay nó là
    // Earthquake, nền đất nứt theo vòng (xem docs/KY_NANG_5_LOP.md).
    const dac = { dk_ragefulblow:'groundburst',
                  mg_powerslash:'lightwave', dl_chaoticdiseier:'quakeburst' };
    const sai = [];
    // ⚠ BỎ QUA chiêu đã có TRANH THẬT — suy từ `CHIEU_TRANH`, đừng gỡ tay khỏi `dac`.
    // Luật của kho: có mặt trong CHIEU_TRANH thì KHÔNG được khai style nữa. Nên với chiêu ấy,
    // "không có style" là ĐÚNG, và mệnh đề này đòi ngược lại. Bản cũ chép cứng rồi gỡ tay từng
    // mã mỗi lần art về (Dark Wizard đã phải gỡ một lần) — tức bảng sẽ mục lại ở chiêu kế tiếp.
    // Vòng kiểm CHIEU_TRANH ngay dưới mới là chỗ gác mấy chiêu đó.
    for (const id in dac){
      if (CHIEU_TRANH[id]) continue;
      if (!VH_VFX[id] || VH_VFX[id].style !== dac[id])
        sai.push(id + '=' + ((VH_VFX[id] && VH_VFX[id].style) || 'không có'));
    }
    // Chiêu đã có TRANH THẬT thì không khai style vector nữa (giữ cả hai là chồng hai lớp lên
    // nhau) — chữ ký hình ảnh của nó nằm ở CHIEU_TRANH.
    //
    // ⚠ DANH SÁCH SUY TỪ `CHIEU_TRANH`, KHÔNG CHÉP CỨNG. Bản cũ liệt tay ba mã, và ngay đợt sau
    // có thêm ba chiêu nữa có tranh thật (sx_thieulam_a · sx_bug_a · sx_toanchan_a) thì bài này
    // vừa KHÔNG gác chúng, vừa ĐỎ — vì nó còn đọc `SECT_VFX.sx_thieulam_a.style` của đúng cái
    // dòng phải gỡ theo luật. Suy từ bảng thì càng thêm tranh càng gác được nhiều, và không còn
    // danh sách nào để mà mục đi. Cùng lối `mapBanSac()` suy từ `packs`.
    for (const id in CHIEU_TRANH){
      const t = CHIEU_TRANH[id];
      if (VH_VFX[id] || SECT_VFX[id]) sai.push(id + '=vừa có tranh vừa có hình vector');
      if (!t.atlas && !t.ve) sai.push(id + '=khai tranh mà không có atlas lẫn đường vẽ');
      if (t.atlas && !VFX_ATLAS_DEFS[t.atlas]) sai.push(id + '=atlas chưa khai trong VFX_ATLAS_DEFS');
    }

    // ⚠ VÀ GÁC CHIỀU NGƯỢC LẠI, cũng suy từ dữ liệu: mỗi lớp, ô 1 (`_a`) và ô 2 (`_c`) phải có
    // ĐÚNG MỘT trong hai — tranh thật, hoặc một hình vector RIÊNG. Không có cái nào nghĩa là
    // chiêu rơi về style mặc định theo kiểu chiêu, tức năm lớp tung ra cùng một hình.
    // Mệnh đề cũ chốt thẳng `sx_thieulam_a === 'bladewhirl'`: gác được đúng một lớp, và chết
    // ngay khi lớp ấy có art thật.
    const oRong = [];
    for (const sk in SECTS) for (const hau of ['a', 'c']){
      const id = 'sx_' + sk + '_' + hau;
      const coTranh = !!CHIEU_TRANH[id];
      const vec = SECT_VFX[id] && SECT_VFX[id].style;
      if (coTranh && vec) continue;                      // đã báo ở vòng trên
      if (!coTranh && !vec) oRong.push(id + '=không có gì');
      else if (vec && MAC_DINH.includes(vec)) oRong.push(id + '=' + vec + ' (mặc định)');
    }

    // ⚠ MỆNH ĐỀ `fireScream` ĐÃ GỠ — nó chốt cứng `SECT_VFX.sx_bug_c.style === 'firepillar'`,
    // tức gác đúng MỘT ô của MỘT lớp bằng đúng MỘT tên style. Ô đó nay có tranh thật (Bão Quạ),
    // mà luật của kho là có tranh thì KHÔNG khai style nữa ⇒ mệnh đề đòi ngược lại luật.
    // Vòng `oRong` ngay trên đã bao trọn nó và còn mạnh hơn: quét CẢ 5 lớp × 2 ô, và chấp nhận
    // "tranh thật HOẶC vector riêng" thay vì một tên chép tay. Gỡ là bớt một chỗ sẽ mục, không
    // phải bớt một chỗ đang gác.
    return { sai, oRong,
             penetrationProj: VH_VFX.elf_penetration && VH_VFX.elf_penetration.proj };
  });
  console.log('4) hiệu ứng riêng:', JSON.stringify(r4));
  if (r4.sai.length) fail(`tuyệt chiêu dùng hiệu ứng mặc định: ${r4.sai.join(', ')}`);
  if (r4.oRong.length) fail(`ô 1/ô 2 của lớp không có hình riêng: ${r4.oRong.join(', ')}`);
  if (r4.penetrationProj !== 'lance') fail('Penetration không có đạn riêng — dùng mũi tên thường');
  await p3.close();

  // ---- 5. Sylvan Ranger: Penetration là chiêu chủ động, và nó XUYÊN thật ----
  const p5 = await boot('toanchan');
  const r5 = await p5.evaluate(async () => {
    const cua = Object.entries(VOHOC_DEFS).filter(([, v]) => v.phai === 'toanchan');
    const chuDong = cua.filter(([, v]) => v.type !== 'passive' && v.type !== 'buff').map(([k]) => k);
    applyTestBoost && applyTestBoost();
    travelTo('ardhaven'); travelTo('daohoa');
    mobs.length = 0;
    // xếp một HÀNG THẲNG: chiêu xuyên phải trúng nhiều con, chiêu thường chỉ trúng con đầu
    for (let i = 0; i < 6; i++)
      spawnMob('boar', { x: player.x + 70 + i*45, y: player.y, r:1, count:1 }, null);
    mobs.forEach(m => { m.hp = m.maxHp = 1e9; });
    const hp0 = mobs.map(m => m.hp);
    player.cd = {}; player.qi = player.maxQi; player.crit = 0;
    mouseWorld.x = player.x + 400; mouseWorld.y = player.y;
    castSkill('elf_penetration');
    await new Promise(r => setTimeout(r, 1400));
    return { chuDong, o4: player.skillBar[3],
      xuyen: mobs.filter((m,i) => m.hp < hp0[i]).length,
      capMo: VOHOC_DEFS.elf_penetration.unlock };
  });
  console.log('5) Sylvan Ranger:', JSON.stringify(r5));
  if (!r5.chuDong.includes('elf_penetration')) fail('Penetration không phải chiêu chủ động');
  if (r5.chuDong.length < 1) fail('Sylvan Ranger vẫn không có chiêu tấn công chủ động nào trong cây lớp');
  if (r5.o4 !== 'elf_penetration') fail(`ô 4 của Ranger là ${r5.o4}, phải là Penetration`);
  if (r5.xuyen < 2) fail(`Penetration chỉ trúng ${r5.xuyen} con trong hàng 6 con — không xuyên gì cả`);
  await p5.close();

  console.log('errors:', JSON.stringify(errs));
  if (errs.length) fail('lỗi trang: ' + errs[0]);
  console.log(bad === 0 ? 'PASS' : 'FAIL(' + bad + ')');
  await b.close();
  process.exit(bad === 0 ? 0 : 1);
})();
