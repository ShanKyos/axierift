// LÒ KHẮC — mini-game roguelite chọn thẻ. Đặc tả: docs/DAC_TA_LO_KHAC.md
//
// Bảy mệnh đề, và BA trong bảy gác đúng những chỗ hỏng IM LẶNG:
//   ① `dgnWallObs()` bịt kín hai khe cửa khi DGN null — người chơi kẹt cứng, không lỗi nào in.
//   ③ lá chỉ-số bị nhân HAI LẦN (một ở calcDerived, một ở lkDmgMul) — bảng chỉ số không thấy.
//   ⑥ rời lò bằng đường KHÔNG qua cổng để LK sống — đúng cái bẫy DEEP đã dẫm.
//
// ⚠ `LK` · `lkCong` · `NEP_KHAC` khai bằng `let`/`const` ở tầng cao nhất nên KHÔNG gắn vào
// `window` — phải gọi bằng TÊN TRẦN trong evaluate. `hurtMob` là `function` nên nó CÓ gắn, và
// đó là lý do §3 bọc được nó.
const { chromium } = require('playwright');
let bad = 0;
const fail = m => { console.log('FAIL ' + m); bad++; };
const pass = m => console.log('PASS ' + m);

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('http://localhost:8853/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__gameReady).catch(() => {});
  await page.waitForTimeout(400);

  // ── TỰ KIỂM CẢNH DỰNG ────────────────────────────────────────────────────
  // Bảng thẻ rỗng hay map thiếu thì mọi mệnh đề dưới xanh vì lý do sai. Hỏi trước, chấm sau.
  const setup = await page.evaluate(() => {
    window.TEST_MODE = true;
    startGame('baidasan', null);
    player.level = 60; calcDerived();
    return { the: (window.NEP_KHAC || []).length, map: !!MAPS.lokhac,
             bac3: (window.NEP_KHAC || []).filter(c => c.bac === 3).length,
             cua: GATES.filter(g => g.lokhac || g.map === 'lokhac').length };
  });
  if (setup.the < 12 || !setup.map || setup.bac3 < 3 || setup.cua !== 2){
    console.log('FAIL §0 cảnh dựng hỏng — ' + JSON.stringify(setup));
    console.log('DONE bad=1'); await browser.close(); process.exit(1);
  }
  pass(`§0 cảnh dựng: ${setup.the} lá (${setup.bac3} Cổ Vật) · map lokhac · ${setup.cua} cổng`);

  // ── ① VÀO LÒ ─────────────────────────────────────────────────────────────
  const r1 = await page.evaluate(() => {
    player.lokhac = { day: new Date().toDateString(), luot: 0 };
    window.lkStart();
    // Khe cửa: DGN_WALLS đặt tường ở y=1140 và y=690, khe x 1230-1370. `dgnWallObs()` phải trả
    // MẢNG RỖNG khi LK chạy — nếu không thì cả hai khe bị bịt và người chơi kẹt trong phòng 1.
    const xa = () => Math.max(...mobs.filter(m => !m.dead)
      .map(m => Math.hypot(m.x - LK_HALL.cx, (m.y - LK_HALL.cy) / 0.85)));
    const o = { co: !!LK, map: curMap, dot: LK ? LK.dot : -1,
                quai1: mobs.filter(m => !m.dead).length, xa1: Math.round(xa()),
                lkMob: mobs.every(m => m.def.lkMob === true),
                tuong: dgnWallObs().length,
                khe1: inObstacle('lokhac', 1300, 1170, 14),
                khe2: inObstacle('lokhac', 1300, 720, 14),
                sanh: inObstacle('lokhac', 1300, 1000, 14),
                bk: LK_HALL.r, neoX: player._autoAX, neoY: player._autoAY };
    LK.dot = 11; lkDotMoi();       // đợt 12 — quái phải ĐÔNG HƠN đợt 1
    o.quai12 = mobs.filter(m => !m.dead).length; o.xa12 = Math.round(xa());
    return o;
  });
  // ⚠ KHÔNG chép cứng số quái mỗi đợt — đo Ý ĐỊNH (đông dần theo đợt). Bản đầu của bài này
  // khẳng định "≥7 con" và đỏ ngay lượt cân bằng kế tiếp, ở một chỗ chẳng liên quan gì tới
  // thứ nó định gác. Cùng bài học đã ghi ở test_walkrun mục 1.
  if (r1.co && r1.map === 'lokhac' && r1.dot === 1 && r1.quai1 >= 4 && r1.lkMob) pass(`① vào lò: đợt 1, ${r1.quai1} quái, tất cả mang cờ lkMob`);
  else fail('① vào lò — ' + JSON.stringify(r1));
  if (r1.quai12 > r1.quai1) pass(`① quái đông dần theo đợt: ${r1.quai1} (đợt 1) → ${r1.quai12} (đợt 12)`);
  else fail(`① số quái không tăng theo đợt — ${r1.quai1} → ${r1.quai12}`);
  // Rải theo ĐĨA, không theo hộp. spawnMob() rải trong hộp ±r nên góc hộp xa tâm r·√2 = 1,41×r
  // — vượt tầm quét 430 của AUTO, và đo được là 3/7 con đợt 1 không bao giờ bị đụng tới, lượt
  // TREO VĨNH VIỄN. Không bài kiểm lái-bằng-hàm nào thấy; probe chạy thật mới thấy.
  if (r1.xa1 <= r1.bk + 2 && r1.xa12 <= r1.bk + 2) pass(`① quái rải theo ĐĨA — con xa nhất cách tâm ${r1.xa1}px / ${r1.xa12}px, bán kính sảnh ${r1.bk}`);
  else fail(`① quái rải theo HỘP (góc hộp ngoài tầm AUTO) — xa nhất ${r1.xa1}/${r1.xa12}px vs bán kính ${r1.bk}`);
  // Neo AUTO phải ghim ở tâm sảnh, không ở điểm thả — nếu không cả lượt treo (đo được 33 phút).
  if (r1.neoX === 1300 && r1.neoY === 1000) pass('① neo AUTO ghim ở tâm sảnh, không ở điểm thả');
  else fail(`① neo AUTO sai chỗ — (${r1.neoX},${r1.neoY}), chờ (1300,1000)`);
  if (r1.tuong === 0 && !r1.khe1 && !r1.khe2 && !r1.sanh) pass('① sảnh MỞ — không tường ngăn, hai khe cửa đi qua được');
  else fail('① sảnh bị bịt (bẫy dgnWallObs) — ' + JSON.stringify(r1));

  // ── ② lkCong VÔ HẠI KHI Ở NGOÀI LÒ ───────────────────────────────────────
  const r2 = await page.evaluate(() => {
    window.lkRoi('ardhaven');
    const khoa = ['atkPct','hpPct','spdPct','cdPct','qiPct','critPP','defPct','aspdPct','leech','phan','noXac','honQi','haiLuoi','nongLo','chongChat','hoiDot','cham'];
    return { lk: LK, tong: khoa.reduce((a, k) => a + lkCong(k), 0), mul: lkDmgMul(), map: curMap };
  });
  if (r2.lk === null && r2.tong === 0 && r2.mul === 1) pass('② ngoài lò: lkCong = 0 trên cả 17 khoá, lkDmgMul = 1');
  else fail('② lkCong không vô hại ngoài lò — ' + JSON.stringify(r2));

  // ── ③ CHỒNG THẺ ĐO ĐƯỢC, VÀ ĐÚNG MỘT CỬA MỖI LÁ ──────────────────────────
  // Hai vế ngược nhau, và cả hai đều cần:
  //   a) lá chỉ số (`mai_luoi`) phải nâng player.atk, và KHÔNG được nhân lại ở hurtMob;
  //   b) lá theo đợt (`chong_chat`) phải nhân ở hurtMob, và KHÔNG được chạm player.atk.
  // Chỉ kiểm vế (a) thì một bản nhân hai lần vẫn xanh.
  const r3 = await page.evaluate(() => {
    // Phản đòn ghi thẳng m.hp không qua hurtMob — tắt để phép đo không lệch 1 điểm máu.
    player.reflect = 0;
    player.lokhac = { day: new Date().toDateString(), luot: 0 };
    window.lkStart();
    const bia = () => { const m = mobs.find(x => !x.dead); m.hp = m.maxHp = 9e8; m.def = Object.assign({}, m.def, { def:0 }); return m; };
    const danh = () => { const m = bia(); const t = m.hp; hurtMob(m, 100000, 'tp'); return t - m.hp; };
    const atk0 = player.atk, dmg0 = danh();
    LK.the = ['mai_luoi','mai_luoi','mai_luoi','mai_luoi','mai_luoi'];  // 5 × 16% = +80%
    calcDerived();
    const atkA = player.atk, dmgA = danh();
    LK.the = []; LK.dot = 5; calcDerived();                              // chong_chat: 6% × (5-1)
    const atkB0 = player.atk;
    LK.the = ['chong_chat']; calcDerived();
    const atkB = player.atk, dmgB = danh();
    return { atk0, atkA, dmg0, dmgA, atkB0, atkB, dmgB, tyAtk: atkA/atk0, tyDmgA: dmgA/dmg0, tyDmgB: dmgB/dmg0 };
  });
  // player.atk làm tròn, nên lấy biên ±1,5%
  if (Math.abs(r3.tyAtk - 1.80) < 0.027) pass(`③a mai_luoi ×5 → player.atk ${r3.atk0} → ${r3.atkA} (×${r3.tyAtk.toFixed(3)}, chờ ×1,80)`);
  else fail(`③a mai_luoi không vào player.atk — ×${r3.tyAtk.toFixed(3)}`);
  if (Math.abs(r3.tyDmgA - 1) < 0.02) pass('③a ...và KHÔNG nhân lại ở hurtMob (sát thương truyền thẳng giữ nguyên)');
  else fail(`③a mai_luoi bị nhân HAI LẦN — sát thương truyền thẳng ×${r3.tyDmgA.toFixed(3)}, phải là ×1,00`);
  if (r3.atkB === r3.atkB0) pass('③b chong_chat KHÔNG chạm player.atk');
  else fail(`③b chong_chat lọt vào player.atk — ${r3.atkB0} → ${r3.atkB}`);
  if (Math.abs(r3.tyDmgB - 1.24) < 0.02) pass(`③b ...và nhân ĐÚNG ở hurtMob ở đợt 5 — ×${r3.tyDmgB.toFixed(3)} (chờ ×1,24)`);
  else fail(`③b chong_chat không nhân đúng — ×${r3.tyDmgB.toFixed(3)}, chờ ×1,24`);

  // ── ④ BẢNG THẺ: 3 lá, không trùng, không vượt trần ───────────────────────
  const r4 = await page.evaluate(() => {
    const out = { bay: [], trung: 0, vuot: 0, dom: 0 };
    for (let i = 0; i < 60; i++){
      LK.dot = 10; LK.choN = 1;
      LK.the = ['mai_luoi','mai_luoi','mai_luoi','mai_luoi','mai_luoi']; // mai_luoi đã kịch trần lap 5
      lkBayThe();
      const c = LK.cho || [];
      out.bay.push(c.length);
      if (new Set(c).size !== c.length) out.trung++;
      if (c.includes('mai_luoi')) out.vuot++;
      const dom = document.getElementById('overlay-inner');
      if (dom && dom.querySelectorAll('button.choice-card').length === c.length && c.length) out.dom++;
      LK.cho = null; lopPhuDong(true);
    }
    return { n3: out.bay.filter(x => x === 3).length, trung: out.trung, vuot: out.vuot, dom: out.dom };
  });
  if (r4.n3 === 60 && r4.trung === 0 && r4.vuot === 0) pass('④ 60 lượt bày: đều đúng 3 lá, không lá nào trùng, không lá nào vượt trần lap');
  else fail('④ bảng thẻ sai — ' + JSON.stringify(r4));
  // Hỏi DOM chứ không hỏi chuỗi innerHTML: bảng có thể "hiện" mà nút không tồn tại.
  if (r4.dom === 60) pass('④ ...và mỗi lá có ĐÚNG một nút bấm thật trong DOM');
  else fail(`④ nút thẻ không dựng đủ trong DOM — ${r4.dom}/60`);

  // ── ⑤ LUẬT RÚT THEO ĐỢT ──────────────────────────────────────────────────
  const r5 = await page.evaluate(() => {
    const M = {}; for (const c of window.NEP_KHAC) M[c.id] = c;
    const do_ = dot => { let cao = 0;
      for (let i = 0; i < 120; i++){ LK.dot = dot; LK.the = []; LK.choN = 1; lkBayThe();
        for (const id of (LK.cho || [])) if (M[id].bac > (dot >= 8 ? 3 : dot >= 4 ? 2 : 1)) cao++;
        LK.cho = null; lopPhuDong(true); }
      return cao; };
    const d2 = (() => { let n = 0; for (let i = 0; i < 120; i++){ LK.dot = 2; LK.the = []; LK.choN = 1; lkBayThe();
      for (const id of (LK.cho || [])) if (M[id].bac > 1) n++; LK.cho = null; lopPhuDong(true); } return n; })();
    const d6 = (() => { let n = 0; for (let i = 0; i < 120; i++){ LK.dot = 6; LK.the = []; LK.choN = 1; lkBayThe();
      for (const id of (LK.cho || [])) if (M[id].bac > 2) n++; LK.cho = null; lopPhuDong(true); } return n; })();
    // ...và chiều NGƯỢC LẠI: đợt 10 PHẢI ra được lá Cổ Vật, nếu không thì luật rút đang chặn tất.
    const d10 = (() => { let n = 0; for (let i = 0; i < 400; i++){ LK.dot = 10; LK.the = []; LK.choN = 1; lkBayThe();
      for (const id of (LK.cho || [])) if (M[id].bac === 3) n++; LK.cho = null; lopPhuDong(true); } return n; })();
    return { d2, d6, d10, viPham: do_(1) + do_(5) + do_(9) };
  });
  if (r5.d2 === 0 && r5.d6 === 0 && r5.viPham === 0) pass('⑤ đợt 1-3 không bao giờ ra bậc 2-3 · đợt 4-7 không ra Cổ Vật (360 lượt bày)');
  else fail('⑤ luật rút theo đợt bị hở — ' + JSON.stringify(r5));
  if (r5.d10 > 0) pass(`⑤ ...và đợt 10 RA ĐƯỢC Cổ Vật (${r5.d10}/1200 lá) — luật không chặn nhầm tất`);
  else fail('⑤ đợt 10 không bao giờ ra Cổ Vật — luật rút chặn nhầm');

  // ── ⑥ RỜI LÒ BẰNG CẢ BA ĐƯỜNG ────────────────────────────────────────────
  const r6 = await page.evaluate(() => {
    const o = {};
    const vao = () => { player.lokhac = { day:new Date().toDateString(), luot:0 };
                        LK = null; window.lkStart(); LK.the = ['mai_luoi','mai_luoi','gan_thep']; calcDerived(); };
    const goc = (() => { LK = null; calcDerived(); return { atk: player.atk, hp: player.maxHp }; })();
    vao(); const trong = { atk: player.atk, hp: player.maxHp };
    // (a) nút Rời Lò
    window.lkRoi(); o.a = { lk: LK, atk: player.atk, hp: player.maxHp, map: curMap };
    // (b) dịch chuyển từ bảng Bản Đồ — ĐÂY là đường mà DEEP từng để lọt
    vao(); travelTo('ardhaven'); o.b = { lk: LK, atk: player.atk, hp: player.maxHp, map: curMap };
    // (c) cổng G — dựng cảnh, phím bấm thật ở ngoài evaluate
    vao(); player.x = 1300; player.y = 1660; update(0.016);
    o.cCanh = !!(nearGate && nearGate.map === 'lokhac');
    return { goc, trong, ...o };
  });
  await page.keyboard.press('g');
  await page.waitForTimeout(150);
  const r6c = await page.evaluate(() => ({ lk: LK, atk: player.atk, hp: player.maxHp, map: curMap }));
  const veCu = x => x.lk === null && x.atk === r6.goc.atk && x.hp === r6.goc.hp && x.map === 'ardhaven';
  if (r6.trong.atk > r6.goc.atk && r6.trong.hp > r6.goc.hp) pass(`⑥ trong lò chỉ số CÓ lên: atk ${r6.goc.atk}→${r6.trong.atk} · hp ${r6.goc.hp}→${r6.trong.hp}`);
  else fail('⑥ cảnh dựng hỏng — thẻ không đổi chỉ số, ba vế dưới sẽ xanh vô nghĩa');
  if (veCu(r6.a)) pass('⑥a nút Rời Lò → LK null, chỉ số về đúng như trước khi vào');
  else fail('⑥a nút Rời Lò — ' + JSON.stringify(r6.a));
  if (veCu(r6.b)) pass('⑥b dịch chuyển từ bảng Bản Đồ → LK null (bẫy DEEP đã bịt)');
  else fail('⑥b travelTo để LK sống — ' + JSON.stringify(r6.b));
  if (r6.cCanh && veCu(r6c)) pass('⑥c phím G ở cổng → LK null');
  else fail('⑥c cổng G — canh=' + r6.cCanh + ' ' + JSON.stringify(r6c));

  // ── ⑦ TRẦN NGÀY, VÀ NÓ PHẢI SỐNG QUA SAVE ────────────────────────────────
  const r7 = await page.evaluate(() => {
    player.lokhac = { day: new Date().toDateString(), luot: 0 };
    const con = [];
    for (let i = 0; i < 4; i++){ LK = null; window.lkStart(); con.push(!!LK); if (LK) window.lkRoi(); }
    const truoc = player.lokhac.luot;
    saveGame();
    delete player.lokhac;          // đi đúng đường của một save đời trước
    loadGame();
    const sau = player.lokhac ? player.lokhac.luot : -1;
    LK = null;
    return { con, truoc, sau, kieu: typeof player.lokhac };
  });
  if (JSON.stringify(r7.con) === '[true,true,true,false]') pass('⑦ trần 3 lượt/ngày chặn đúng lượt thứ 4');
  else fail('⑦ trần ngày không chặn — ' + JSON.stringify(r7.con));
  if (r7.sau === r7.truoc && r7.kieu === 'object') pass(`⑦ ...và sổ lượt sống qua saveGame/loadGame (${r7.sau}/3)`);
  else fail('⑦ sổ lượt mất khi nạp lại — ' + JSON.stringify(r7));

  if (errors.length){ fail('lỗi runtime: ' + errors.slice(0, 3).join(' | ')); }
  console.log('DONE bad=' + bad);
  await browser.close();
  process.exit(bad ? 1 : 0);
})();
