// Trúng đòn phải làm ĐỔI hình nhân vật, không chỉ nhấp viền đỏ màn hình.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1280, height: 760 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://localhost:8853/index.html');
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(700);
  await p.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    player.x = MAP.w/2; player.y = MAP.h/2; player.face = 0;
    mobs.length = 0; effects.length = 0;
  });
  // ⚠ CHỜ ART VỀ RỒI MỚI CHỤP. Từ đợt cấu trúc pet (THU_CUNG) thứ đứng ở gốc là NHÂN VẬT, mà
  // bảng khung của nhân vật nạp lười — chụp ngay sau startGame là chụp một ô chưa có gì, và bài
  // đọc ra "trúng đòn không đổi hình". Trước đây con Axie đứng ở gốc, và nó đã nạp sẵn ở màn tải.
  await p.waitForTimeout(2500);
  const r = await p.evaluate(() => {
    player.x = MAP.w/2; player.y = MAP.h/2; player.face = 0;
    mobs.length = 0; effects.length = 0;
    const grab = () => {
      render();
      const c = document.querySelector('canvas'), g = c.getContext('2d');
      const sx = Math.round(player.x - camera.x) - 60, sy = Math.round(player.y - camera.y) - 110;
      return g.getImageData(sx, sy, 120, 140).data;
    };
    const diff = (a, bb) => { let n = 0; for (let i = 0; i < a.length; i += 4)
      if (a[i] !== bb[i] || a[i+3] !== bb[i+3]) n++; return n; };
    player.hurtT = 0; const calm = grab();
    player.hurtT = 0.3;  const hit  = grab();
    player.hurtT = 0;
    return { changedPixels: diff(calm, hit) };
  });
  console.log(JSON.stringify(r), 'errors:', JSON.stringify(errs));
  const ok = r.changedPixels > 150 && !errs.length;
  console.log(ok ? 'PASS' : 'FAIL');
  await b.close();
  // ⚠ MÃ THOÁT LÀ THỨ `tools/reg.sh` CHẤM — in "FAIL" mà thoát 0 thì bài được đếm là XANH.
  // Đã xảy ra thật với test_story và test_mobbalance: chúng đỏ suốt một thời gian dài mà bảng tổng
  // kết vẫn báo đủ xanh. Bài này cùng họ — nó in phán quyết nên nó phải trả mã thoát.
  process.exit(ok ? 0 : 1);
})();
