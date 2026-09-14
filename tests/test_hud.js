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
  await page.screenshot({ path: '/tmp/hud_full.png' });

  // damage the player to see the bars drain + accent bar shrink
  await page.evaluate(() => { player.hp = Math.round(player.maxHp * 0.35); player.qi = Math.round(player.maxQi * 0.6); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/hud_damaged.png' });

  const state = await page.evaluate(() => ({
    // Hai thanh đã rời khỏi thanh chiến đấu (viên cầu, dâng theo `height`) và về khung chân
    // dung góc trái (thanh ngang, chạy theo `width`).
    hpWidth: document.getElementById('bar-hp').style.width,
    qiWidth: document.getElementById('bar-qi').style.width,
    accentWidth: document.getElementById('hp-accent-fill').style.width,
    skillbarVisible: !document.getElementById('bottom-hud').classList.contains('hidden'),
  }));
  console.log('state:', JSON.stringify(state));
  console.log('errors:', JSON.stringify(errors.slice(0, 10)));
  await browser.close();
})();
