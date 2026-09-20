// BẢN CHƠI THỬ: SAVE ĐỜI TRƯỚC CŨNG PHẢI NHẬN BỘ GIAI 7
//
// `phatDoKhoiDau()` chỉ chạy trong `newGame()`. Nên mọi nhân vật tạo TRƯỚC bản demo — tức đúng
// những người đang chơi thử — không bao giờ thấy bộ giai 7. Triệu chứng chủ dự án mô tả không
// phải "thiếu đồ" mà là *"cây cung thiên mệnh gắn theo nhân vật của mình đâu?"*: lớp vũ khí
// CẦM TAY chỉ bật khi món đang đeo trùng `dòng|giai` trong NV_VK_LOP, nên một cây cung giai 3
// làm cả lớp art biến mất và không một lỗi nào báo.
//
// Năm mệnh đề, cả năm đã thử ngược:
//   ① save đời trước ⇒ nạp xong là đủ năm ô giai DEMO_DO_GIAI;
//   ② và lớp vũ khí CẦM TAY bật lên (đây mới là thứ người chơi nhìn thấy);
//   ③ đồ cũ KHÔNG bị xoá — nó nằm trong túi;
//   ④ chạy hai lần KHÔNG phát thêm (cờ `_demoDo`);
//   ⑤ TEST_MODE thì KHÔNG phát — 180 bài cân bằng đo nhân vật trần, phát đồ ở đây là cả bộ đo
//      đổi mốc trong im lặng;
//   ⑥ SAVE THẬT SỰ CŨ (chưa qua `migrateGiai14`/`migrateGiai7`) cũng nhận đúng giai 7.
//
// ⚠ ⑥ là mệnh đề gác THỨ TỰ, và nó phải đứng riêng. `migrateGiai14`/`migrateGiai7` viết lại
// `it.tier` của MỌI món trong equip/inv, nên phát TRƯỚC hai bước đó thì bộ giai 7 vừa phát bị
// chính phép di trú nghiền xuống giai 5 (7 → 10 → ceil(10/2)). Mệnh đề ① KHÔNG bắt được lỗi
// ấy — cảnh của nó đặt sẵn `giai14`/`giai7` (đúng như save của bản đang chạy) nên hai hàm kia
// không làm gì cả, và đảo thứ tự vẫn xanh. Đã thử ngược đúng thế và nó xanh thật.
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1100, height: 700 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  let bad = 0;
  const fail = m => { bad++; console.log('FAIL ' + m); };
  const pass = m => console.log('PASS ' + m);

  await p.goto('http://localhost:8853/index.html', { waitUntil: 'networkidle' });
  await p.waitForFunction(() => window.__gameReady).catch(() => {});
  await p.evaluate(() => { window.TEST_MODE = true; startGame('toanchan', null); });
  await p.waitForTimeout(2500);

  // Dựng một SAVE ĐỜI TRƯỚC: năm ô mang đồ giai thấp, không có cờ `_demoDo`.
  const truoc = await p.evaluate(() => {
    for (const id of ['vukhi', 'non', 'ao', 'tay', 'chan']){
      const t = genItem(40, null, null, { slots: [id] });
      if (t){ t.tier = 3; player.equip[id] = t; }
    }
    delete player._demoDo;
    player.giai14 = true; player.giai7 = true;   // save của bản đang chạy đã qua hai bước đó
    calcDerived(); saveGame();
    return { vkLop: nvVkLop(player), tui: player.inv.length, demo: DEMO_DO_GIAI,
             giai: Object.keys(player.equip).map(k => player.equip[k] && player.equip[k].tier) };
  });
  // ⓪ Tự kiểm cảnh dựng. ⚠ Bản đầu chốt "save đời trước KHÔNG có lớp vũ khí cầm tay" — đúng lúc
  // viết, sai ngay sau đó: `NV_VK_LOP_LOP` (nấc lùi theo LỚP) làm mọi cây của ba lớp ấy đều cầm
  // được, kể cả giai 3. Tức chốt ấy mô tả một TRIỆU CHỨNG đã được chữa ở chỗ khác, không mô tả
  // cái mà bài này gác. Thứ phải chốt là: save dựng ra thật sự THẤP HƠN giai demo.
  const caoNhat = Math.max(...truoc.giai.filter(x => x));
  if (!(caoNhat < truoc.demo))
    fail(`cảnh dựng hỏng: save "đời trước" đã ở giai ${caoNhat} ≥ ${truoc.demo} — không còn gì để nâng`);
  else pass(`cảnh dựng: save đời trước cao nhất giai ${caoNhat} (< ${truoc.demo})`);

  // Nạp lại như NGƯỜI CHƠI THẬT.
  const sau = await p.evaluate(() => {
    window.TEST_MODE = false;
    const ok = loadGame(activeSlot);
    const eq = {};
    for (const k in player.equip) if (player.equip[k]) eq[k] = player.equip[k].tier;
    return { ok, eq, vkLop: nvVkLop(player), oLop: nvLopCuaEquip(player),
             tui: player.inv.length, co: player._demoDo, demo: DEMO_DO_GIAI };
  });
  if (!sau.ok) { fail('loadGame trả false — không đo được gì thêm'); }
  else {
    const thieu = ['vukhi','non','ao','tay','chan'].filter(k => (sau.eq[k] || 0) < sau.demo);
    if (thieu.length) fail(`① ô chưa lên giai ${sau.demo}: ${thieu.join(', ')} (đo được ${JSON.stringify(sau.eq)})`);
    else pass(`① năm ô đều giai ${sau.demo}`);

    if (!sau.vkLop) fail('② lớp vũ khí CẦM TAY vẫn tắt sau khi di trú — đúng cái người chơi kêu');
    else pass(`② lớp vũ khí cầm tay bật: ${sau.vkLop}`);
    if (!sau.oLop || !sau.oLop.ao) fail('② bộ giáp lớp rời chưa nhận ra được sau di trú');
    else pass(`② bộ giáp lớp rời: ${sau.oLop.ao}`);

    if (!(sau.tui > truoc.tui)) fail(`③ đồ cũ biến mất — túi trước ${truoc.tui}, sau ${sau.tui}`);
    else pass(`③ đồ cũ vào túi (${truoc.tui} → ${sau.tui})`);
  }

  // ④ nạp lần hai ⇒ không phát thêm
  const lan2 = await p.evaluate(() => {
    saveGame(); loadGame(activeSlot);
    return { tui: player.inv.length };
  });
  if (lan2.tui !== sau.tui) fail(`④ nạp lần hai lại phát tiếp: túi ${sau.tui} → ${lan2.tui}`);
  else pass('④ nạp lần hai không phát thêm');

  // ⑤ TEST_MODE ⇒ không phát
  const tm = await p.evaluate(() => {
    for (const id of ['vukhi','non','ao','tay','chan']){
      const t = genItem(40, null, null, { slots: [id] });
      if (t){ t.tier = 3; player.equip[id] = t; }
    }
    delete player._demoDo;
    calcDerived(); saveGame();
    window.TEST_MODE = true;
    loadGame(activeSlot);
    return { tier: player.equip.vukhi && player.equip.vukhi.tier, co: player._demoDo };
  });
  if (tm.tier >= 7 || tm.co) fail(`⑤ TEST_MODE vẫn phát đồ (giai ${tm.tier}) — bộ cân bằng đổi mốc trong im lặng`);
  else pass(`⑤ TEST_MODE không phát (giai vẫn ${tm.tier})`);

  // ⑥ SAVE THẬT SỰ CŨ — chưa qua hai bước đổi giai. Đây là mệnh đề gác THỨ TỰ gọi.
  const cuThat = await p.evaluate(() => {
    window.TEST_MODE = true;
    for (const id of ['vukhi','non','ao','tay','chan']){
      const t = genItem(40, null, null, { slots: [id] });
      if (t){ t.tier = 3; player.equip[id] = t; }
    }
    delete player._demoDo; delete player.giai14; delete player.giai7;
    calcDerived(); saveGame();
    window.TEST_MODE = false;
    loadGame(activeSlot);
    return { tier: player.equip.vukhi && player.equip.vukhi.tier,
             vkLop: nvVkLop(player), demo: DEMO_DO_GIAI };
  });
  if ((cuThat.tier || 0) < cuThat.demo)
    fail(`⑥ save chưa qua đổi giai: vũ khí ra giai ${cuThat.tier} thay vì ${cuThat.demo} — ` +
         'phép di trú đang chạy TRƯỚC migrateGiai14/migrateGiai7');
  else if (!cuThat.vkLop)
    fail('⑥ save chưa qua đổi giai: đúng giai nhưng lớp vũ khí cầm tay vẫn tắt');
  else pass(`⑥ save chưa qua đổi giai vẫn ra giai ${cuThat.tier} + lớp cầm tay ${cuThat.vkLop}`);

  if (errs.length) fail('lỗi trang: ' + errs.slice(0, 3).join(' | '));
  console.log(bad ? `\n${bad} FAIL` : '\nOK');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
