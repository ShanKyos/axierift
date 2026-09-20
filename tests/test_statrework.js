const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('http://localhost:8853/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__gameReady).catch(()=>{});
  await page.waitForTimeout(500);

  // 1) Fairy Elf: pumping pure AGI raises atk a lot; pumping pure STR does nothing for atk
  const r1 = await page.evaluate(() => {
    window.TEST_MODE = true;
    startGame('toanchan', null);
    player.level = 50; player.str = 5; player.agi = 5; player.vit = 5; player.def = 5; player.ene = 5; calcDerived();
    const baseAtk = player.atk;
    player.str += 200; calcDerived();
    const afterStr = player.atk;
    player.str -= 200; player.agi += 200; calcDerived();
    const afterAgi = player.atk;
    return { baseAtk, afterStr, afterAgi, strDidNothing: afterStr === baseAtk, agiBoosted: afterAgi > baseAtk };
  });
  console.log('1) Fairy Elf — pure AGI investment is what matters, STR does nothing for atk:', JSON.stringify(r1));

  // 2) Dark Wizard: both ENE and AGI contribute to atk; STR does nothing
  const r2 = await page.evaluate(() => {
    startGame('baidasan', null);
    player.level = 50; player.str = 5; player.agi = 5; player.vit = 5; player.def = 5; player.ene = 5; calcDerived();
    const baseAtk = player.atk;
    player.str += 200; calcDerived();
    const afterStr = player.atk;
    player.str -= 200; player.ene += 200; calcDerived();
    const afterEne = player.atk;
    player.ene -= 200; player.agi += 200; calcDerived();
    const afterAgi = player.atk;
    return { baseAtk, afterStr, afterEne, afterAgi, strDidNothing: afterStr === baseAtk, eneBoosted: afterEne > baseAtk, agiBoosted: afterAgi > baseAtk, eneStrongerThanAgi: (afterEne-baseAtk) > (afterAgi-baseAtk) };
  });
  console.log('2) Dark Wizard — both ENE (primary) and AGI (secondary) boost atk, STR does not:', JSON.stringify(r2));

  // 3) Dark Knight: only STR matters for atk; AGI/ENE investment do nothing to atk (agi still affects crit/eva/aspd though)
  const r3 = await page.evaluate(() => {
    startGame('thieulam', null);
    player.level = 50; player.str = 5; player.agi = 5; player.vit = 5; player.def = 5; player.ene = 5; calcDerived();
    const baseAtk = player.atk, baseCrit = player.crit;
    player.agi += 200; player.ene += 200; calcDerived();
    const afterAgiEne = player.atk, afterCrit = player.crit;
    player.agi -= 200; player.ene -= 200; player.str += 200; calcDerived();
    const afterStr = player.atk;
    return { baseAtk, afterAgiEne, afterStr, agiEneDidNothingToAtk: afterAgiEne === baseAtk, strBoostedAtk: afterStr > baseAtk, agiStillBoostsCrit: afterCrit > baseCrit };
  });
  console.log('3) Dark Knight — only STR drives atk; AGI/ENE do not, but AGI still raises crit/eva/aspd:', JSON.stringify(r3));

  // 4) ENE raises maxQi for every class (universal secondary benefit)
  const r4 = await page.evaluate(() => {
    startGame('thieulam', null);
    player.level = 50; player.ene = 5; calcDerived();
    const baseQi = player.maxQi;
    player.ene += 100; calcDerived();
    const afterQi = player.maxQi;
    return { baseQi, afterQi, qiRose: afterQi > baseQi };
  });
  console.log('4) ENE raises maxQi universally (even for a STR-based class):', JSON.stringify(r4));

  // 5) char panel renders the new 5th stat row + build hint without crashing, for 2 different classes
  const r5 = await page.evaluate(() => {
    function checkPanel(sect){
      startGame(sect, null);
      calcDerived();
      togglePanel('char');
      const html = document.getElementById('panel-char').innerHTML;
      // ⚠ TÊN CHỈ SỐ ĐÃ ĐỔI: Linh Lực → Năng Lượng (bốn chỉ số kiểu MU). Đi theo nội dung
      // sang tên mới, đừng bỏ mệnh đề — và LẤY TỪ `ATTR_INFO` chứ đừng chép cứng tên, vì
      // chép cứng chính là thứ đã làm dòng này nói dối suốt mà không ai biết.
      return { hasEneRow: html.includes(ATTR_INFO.ene.name), hasHint: html.includes('Công Kích từ'), len: html.length };
    }
    return { elf: checkPanel('toanchan'), dw: checkPanel('baidasan') };
  });
  console.log('5) character panel renders ene row + per-class build hint:', JSON.stringify(r5));

  // 6) legacy save without `ene` field gets safely backfilled on load, no NaN cascade
  const r6 = await page.evaluate(() => {
    // ⚠ DÙNG `saveGame()` RỒI BÓC KHOÁ, đừng tự dựng hình dạng save bằng tay. Bản cũ ghi
    // thẳng `{player, curMap, sideStates, ts}` vào `vlcm_save` — mà định dạng thật nay là
    // `{v, slots:[...], active}`, nên `docSave()` coi đó là save quá cũ, XOÁ ĐI và trả null:
    // `loadGame()` ra false suốt. Bài không khẳng định gì nên chuyện đó im lặng nhiều đợt.
    // Đi qua chính `saveGame()` thì que dò không thể lệch khỏi định dạng thật được nữa.
    startGame('baidasan', null);
    player.level = 40; calcDerived();
    saveGame();
    const doc = JSON.parse(localStorage.getItem('vlcm_save'));
    for (const sl of doc.slots) if (sl && sl.player) delete sl.player.ene;  // save đời trước khi có `ene`
    localStorage.setItem('vlcm_save', JSON.stringify(doc));
    const ok = loadGame();
    calcDerived();
    return { loadOk: ok, ene: player.ene, atkIsFinite: Number.isFinite(player.atk), maxQiIsFinite: Number.isFinite(player.maxQi) };
  });
  console.log('6) legacy save missing `ene` backfills safely, no NaN:', JSON.stringify(r6));

  console.log('errors:', JSON.stringify(errors.slice(0, 20)));

  // ⚠ BÀI NÀY TRƯỚC ĐÂY CHỈ IN, KHÔNG KHẲNG ĐỊNH GÌ — tức nó không bao giờ đỏ được.
  // Hệ quả đã xảy ra thật: mục 5 dò chuỗi 'Linh Lực', tên chỉ số đổi từ lâu, và nó vẫn "xanh"
  // trong khi in ra `hasEneRow:false`. Một bài kiểm không có khẳng định là một dòng log đắt tiền.
  let bad = 0; const fail = m => { bad++; console.log('FAIL ' + m); };
  for (const [ten, v] of Object.entries({ 'Sylvan Ranger': r5.elf, 'Dark Wizard': r5.dw })){
    if (!v.hasEneRow) fail(`bảng Nhân Vật của ${ten} không có hàng ${'Năng Lượng'}`);
    if (!v.hasHint) fail(`bảng Nhân Vật của ${ten} mất dòng gợi ý build`);
  }
  if (!r6.loadOk) fail('save cũ thiếu khoá `ene` không nạp được');
  if (r6.ene == null) fail('save cũ thiếu `ene` không được vá');
  if (!r6.atkIsFinite || !r6.maxQiIsFinite) fail('save cũ thiếu `ene` làm chỉ số ra NaN');
  if (errors.length) fail(`${errors.length} lỗi JS lúc chạy`);
  console.log(bad === 0 ? 'PASS' : 'FAIL(' + bad + ')');
  await browser.close();
  process.exit(bad === 0 ? 0 : 1);
})();
