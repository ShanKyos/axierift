const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('http://localhost:8853/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__gameReady).catch(()=>{});
  await page.waitForTimeout(500);
  await page.evaluate(() => { startGame('thieulam', null); });
  await page.waitForTimeout(800);

  // 1) Fresh player has resetCount 0, tab should be locked
  const initial = await page.evaluate(() => ({ resetCount: player.resetCount, level: player.level }));
  console.log('initial:', JSON.stringify(initial));

  await page.evaluate(() => { togglePanel('char'); try { switchCharTab('taytuy'); } catch(e){} });
  await page.waitForTimeout(200);
  console.log('charTab after clicking locked taytuy (should be info, not taytuy):', await page.evaluate(() => window.charTab));

  // 2) Level up to MAX_LV directly, then open the tab for real
  await page.evaluate(() => { player.level = MAX_LV; player.xp = 0; calcDerived(); player.hp = player.maxHp; player.qi = player.maxQi; });
  await page.evaluate(() => { try { switchCharTab('taytuy'); } catch(e){} });
  await page.waitForTimeout(200);
  const atMax = await page.evaluate(() => ({
    charTab: window.charTab,
    hasBtn: document.getElementById('char-content').innerHTML.includes('doTayTuy()'),
    html: document.getElementById('char-content').innerHTML.slice(0, 400)
  }));
  console.log('at max level, taytuy tab:', JSON.stringify(atMax));
  await page.screenshot({ path: '/tmp/taytuy_ready.png' });

  // 3) Click the reset button (first click = confirm step), verify confirm UI appears
  await page.evaluate(() => { if (typeof window.doTayTuy === 'function') window.doTayTuy(); });
  await page.waitForTimeout(150);
  const confirmState = await page.evaluate(() => document.getElementById('char-content').innerHTML.includes('Xác Nhận'));
  console.log('confirm step shown:', confirmState);
  await page.screenshot({ path: '/tmp/taytuy_confirm.png' });

  // 4) Confirm — capture atk/maxHp before and after to verify bonus applied
  const beforeReset = await page.evaluate(() => ({ atk: player.atk, maxHp: player.maxHp, level: player.level, resetCount: player.resetCount }));
  // ⚠ HỎI TRƯỚC KHI GỌI. Gỡ mất `doTayTuy` thì lời gọi trần ném lỗi NGAY ĐÂY, bài chết trước
  // khi chạy tới phần khẳng định — và một bài kiểm chết vì lỗi thì người ta đi tìm lỗi của
  // bài kiểm, không đi tìm lỗi của sản phẩm. Cùng cái bẫy đã ghi ở `phimXuong`.
  await page.evaluate(() => { if (typeof window.doTayTuy === 'function') window.doTayTuy(true); });
  await page.waitForTimeout(200);
  const afterReset = await page.evaluate(() => ({ atk: player.atk, maxHp: player.maxHp, level: player.level, xp: player.xp, resetCount: player.resetCount, equipKeys: Object.keys(player.equip) }));
  console.log('before reset:', JSON.stringify(beforeReset));
  console.log('after reset:', JSON.stringify(afterReset));
  await page.screenshot({ path: '/tmp/taytuy_done.png' });

  // 5) Verify tab is now locked again (level back to 1) and HUD badge shows
  await page.waitForTimeout(100);
  const hudName = await page.evaluate(() => document.getElementById('hud-name').innerHTML);
  console.log('charTab after reset (should bounce back to info):', await page.evaluate(() => window.charTab));
  console.log('HUD name includes reset badge:', hudName.includes('🔄1'));

  // 6) Reload via save/load cycle to verify persistence + backfill path doesn't error
  await page.evaluate(() => { saveGame(); });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__gameReady).catch(()=>{});
  await page.waitForTimeout(500);
  const afterReload = await page.evaluate(() => ({ resetCount: player && player.resetCount, atk: player && player.atk, level: player && player.level }));
  console.log('after reload (save/load roundtrip):', JSON.stringify(afterReload));

  // ── CHỐT: TAB đã gỡ, MÁY phải còn ────────────────────────────────────────────────────
  // Bài này trước đây chỉ IN, không khẳng định gì — nên nó xanh kể cả khi Tái Sinh hỏng hẳn.
  // Chủ dự án gỡ TAB Tái Sinh (sẽ thiết kế lại) nhưng `player.resetCount` đang nằm trong mọi
  // bản lưu và còn cộng chỉ số vĩnh viễn trong `calcDerived()`. Nên thứ phải gác nay là:
  // cái tab đi rồi, mà gọi thẳng `doTayTuy()` thì máy vẫn chạy đủ — trả tab về chỉ là thêm
  // một dòng dữ liệu vào CHAR_TABS, không phải dựng lại hệ thống.
  let bad = 0;
  const chot = await page.evaluate(() => ({
    conTab: (typeof CHAR_TABS !== 'undefined') && CHAR_TABS.some(t => t.id === 'taytuy'),
    coMay: typeof window.doTayTuy === 'function' && typeof renderTayTuy === 'function',
  }));
  if (chot.conTab){ bad++; console.log("FAIL tab 'taytuy' vẫn còn trong CHAR_TABS — chủ dự án đã yêu cầu gỡ"); }
  else console.log("  ok  tab 'taytuy' đã gỡ khỏi CHAR_TABS");
  if (!chot.coMay){ bad++; console.log('FAIL máy Tái Sinh đã mất (doTayTuy/renderTayTuy) — gỡ TAB thì được, gỡ MÁY là mọi bản lưu mang resetCount hoá vô nghĩa'); }
  else console.log('  ok  máy Tái Sinh còn nguyên');
  // `doTayTuy()` ở bước 4 đã chạy thật: cấp phải về 1 và resetCount phải nhích lên.
  if (!(afterReset && afterReset.resetCount >= 1 && afterReset.level === 1)){
    bad++; console.log(`FAIL gọi doTayTuy() không tái sinh được: ${JSON.stringify(afterReset)}`);
  } else console.log('  ok  gọi thẳng doTayTuy() vẫn tái sinh đủ (cấp về 1, resetCount +1)');

  console.log('errors:', JSON.stringify(errors.slice(0, 10)));
  if (errors.length){ bad++; console.log('FAIL có lỗi JS trên trang'); }
  await browser.close();
  console.log(bad ? `\n${bad} MỤC ĐỎ` : '\nALL PASS');
  process.exit(bad ? 1 : 0);
})();
