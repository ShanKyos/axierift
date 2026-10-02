// CỜ URL CỦA GÓI NATIVE MAGIC: `?magicPhysics=0` phải là TẮT, không phải bật.
//
// Trước checkpoint 15, cả ba cờ (magicRebuild · magicAuthor · magicPhysics) đọc bằng
// `URLSearchParams.has()`, nên một URL ghi rõ `=0` vẫn bật cờ đó. Một cờ thử nghiệm mà gõ "tắt"
// không tắt được là cờ không ai tin, và lỗi kiểu này không in ra một dòng nào.
// Cửa duy nhất nay là `window.magicCo(name)` trong magic-rebuild.js.
//
// ① ma trận URL → trạng thái THẬT của MagicRebuild.enabled và MagicPhysicsRig.enabled
// ② không cờ nào ⇒ cả hai tắt (đường production mặc định)
const { chromium } = require('playwright');
const PORT = process.argv[2] || '8853';

const CA = [
  // [query, rebuild mong, physics mong]
  ['', false, false],
  ['?magicRebuild=1', true, false],
  ['?magicRebuild', true, false],
  ['?magicRebuild=1&magicPhysics=1', true, true],
  ['?magicRebuild=1&magicPhysics', true, true],
  ['?magicRebuild=1&magicPhysics=0', true, false],
  ['?magicRebuild=1&magicPhysics=false', true, false],
  ['?magicRebuild=1&magicPhysics=OFF', true, false],
  ['?magicRebuild=0&magicPhysics=1', false, true],
  ['?magicRebuild=no', false, false],
];

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  let bad = 0;
  const fail = m => { console.log('FAIL', m); bad++; };
  const pass = m => console.log('PASS', m);
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  for (const [q, re, ph] of CA) {
    // Trang nhẹ: chỉ cần ba script native, không cần cả game.
    await p.goto(`http://localhost:${PORT}/magic_physics.html${q}`);
    await p.waitForFunction(() => window.MagicRebuild && window.MagicPhysicsRig, null, { timeout: 30000 });
    const r = await p.evaluate(() => ({
      re: window.MagicRebuild.enabled, ph: window.MagicPhysicsRig.enabled, co: typeof window.magicCo,
    }));
    if (r.co !== 'function') fail(`${q || '(trống)'}: window.magicCo không có`);
    else if (r.re !== re || r.ph !== ph)
      fail(`${q || '(trống)'}: rebuild ${r.re} (mong ${re}) · physics ${r.ph} (mong ${ph})`);
    else pass(`${q || '(trống)'} → rebuild ${r.re} · physics ${r.ph}`);
  }
  if (errs.length) fail('page error: ' + errs.slice(0, 3).join(' | '));
  await b.close();
  console.log(bad ? `\n${bad} FAIL` : '\nTẤT CẢ PASS');
  process.exit(bad ? 1 : 0);
})();
