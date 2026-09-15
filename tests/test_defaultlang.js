// Ngôn ngữ mặc định. Người mở link lần đầu không có 'vlcm_lang' nên mặc định quyết định họ thấy gì.
// Đo bằng SỐ DÒNG TIẾNG ANH THẬT, không đo "dòng không có dấu" — dòng số ("9 (5+4) + Max") cũng
// không có dấu, và đo kiểu đó cho ra 11% ở CẢ HAI chế độ, tức là vô nghĩa.
// Số thật đo được: mặc định cũ ('en') để lại 4 dòng tiếng Anh trên 87 = 5%; đặt 'vi' cho ra 0.
const { chromium } = require('playwright');
let bad = 0; const fail = m => { bad++; console.log('FAIL ' + m); };
const EN = /\b(Click|drag|Equip|Equipment|Reward|Completed|Damage|Defense|Attack Speed|Dodge|EXP|Inventory|Bag|Slot|Empty|Unlocking|grants)\b/;

async function scanPanels(p){
  const seen = new Set();
  for (const tab of ['char','inv','skill','quest']){
    await p.evaluate(t => { try { togglePanel(t); } catch(e){} }, tab);
    await p.waitForTimeout(400);
    const lines = await p.evaluate(() =>
      ((document.getElementById('char-content')||{}).innerText||'')
        .split('\n').map(s => s.trim()).filter(s => s.length > 3));
    lines.forEach(s => seen.add(s));
  }
  const hits = [...seen].filter(s => EN.test(s));
  return { tong: seen.size, en: hits.length, viDu: hits.slice(0,4).map(s => s.slice(0,64)) };
}
async function boot(b, loc, q){
  const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
  await p.goto('http://localhost:8853/index.html?max=1', { waitUntil:'load' });
  if (loc){ await p.evaluate(l => localStorage.setItem('vlcm_lang', l), loc); }
  if (loc || q) await p.goto('http://localhost:8853/index.html?max=1' + (q || ''), { waitUntil:'load' });
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', null); });
  await p.waitForTimeout(1200);
  return p;
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

  // A. mở link lần đầu, localStorage trống
  const pA = await boot(b, null);
  const st = await pA.evaluate(() => ({ i18n: window.i18nLocale ? window.i18nLocale() : null,
    lang: window.ghhaLang ? window.ghhaLang() : null, luu: localStorage.getItem('vlcm_lang') }));
  console.log('A) mở lần đầu:', JSON.stringify(st));
  if (st.luu !== null) fail('localStorage đã có sẵn giá trị — không đo được mặc định');
  if (st.i18n !== 'vi') fail(`i18n.js mặc định '${st.i18n}', phải là 'vi'`);
  if (st.lang && st.lang !== 'vi') fail(`lang.js mặc định '${st.lang}' — LỆCH với i18n.js, giao diện sẽ lẫn hai thứ tiếng`);
  const a = await scanPanels(pA);
  console.log(`   ${a.tong} dòng · ${a.en} dòng tiếng Anh`, JSON.stringify(a.viDu));
  if (a.en > 0) fail(`còn ${a.en} dòng tiếng Anh ở chế độ mặc định`);

  // B. đối chứng: ép 'en' PHẢI ra nhiều tiếng Anh hơn — nếu không thì phép đo vô nghĩa
  const pB = await boot(b, 'en');
  const c = await scanPanels(pB);
  console.log(`B) ép 'en': ${c.tong} dòng · ${c.en} dòng tiếng Anh`, JSON.stringify(c.viDu));
  if (c.en <= a.en) fail(`ép 'en' (${c.en}) không nhiều tiếng Anh hơn mặc định (${a.en}) — phép đo không phát hiện được gì`);

  // C. người chơi vẫn tự đổi được, và lựa chọn đó phải được giữ
  const d = await pB.evaluate(() => localStorage.getItem('vlcm_lang'));
  console.log('C) lựa chọn tay được giữ:', d);
  if (d !== 'en') fail('đặt tay sang en không được giữ');

  // ── D-G. ?lang= trên URL ───────────────────────────────────────────────────────────────
  // Lý do tồn tại: đưa một đường link chơi thử bằng tiếng Anh cho người CHƯA TỪNG mở game.
  // Cả bốn mục dưới đều hỏi CẢ HAI lớp dịch. Hỏi mỗi i18n.js là một bản vá nửa vời — sửa
  // i18n.js mà quên lang.js — vẫn xanh, trong khi màn hình thật lẫn hai thứ tiếng.
  const doc = p => p.evaluate(() => ({ i18n: window.i18nLocale(), lang: window.ghhaLang(),
                                       luu: localStorage.getItem('vlcm_lang') }));

  // D. hồ sơ trống + ?lang=en  ⇒ hai lớp cùng ra 'en', và phải thấy tiếng Anh THẬT
  const pD = await boot(b, null, '&lang=en');
  const dD = await doc(pD);
  console.log('D) hồ sơ trống + ?lang=en:', JSON.stringify(dD));
  if (dD.i18n !== 'en') fail(`?lang=en: i18n.js ra '${dD.i18n}'`);
  if (dD.lang !== 'en') fail(`?lang=en: lang.js ra '${dD.lang}' — LỆCH với i18n.js`);
  const eD = await scanPanels(pD);
  console.log(`   ${eD.tong} dòng · ${eD.en} dòng tiếng Anh`);
  if (eD.en <= a.en) fail(`?lang=en chỉ ra ${eD.en} dòng tiếng Anh, không hơn mặc định (${a.en}) — cờ đặt đúng mà chữ không đổi`);

  // E. ?lang=en phải THẮNG localStorage đã lưu 'vi'.
  //    Đây mới là ca thật: máy của người ta thường đã chơi rồi. Chỉ đo trên hồ sơ trống thì
  //    một bản vá đặt sai thứ tự (localStorage đè URL) vẫn xanh.
  const pE = await boot(b, 'vi', '&lang=en');
  const dE = await doc(pE);
  console.log('E) đã lưu vi + ?lang=en:', JSON.stringify(dE));
  if (dE.i18n !== 'en' || dE.lang !== 'en') fail(`?lang=en không thắng được localStorage 'vi' (i18n='${dE.i18n}' lang='${dE.lang}')`);

  // F. chiều NGƯỢC LẠI — ?lang=vi phải thắng localStorage 'en'. Thiếu vế này thì cái công tắc
  //    chỉ bật được một chiều, và người bấm nhầm link không có cách nào quay lại bằng URL.
  const pF = await boot(b, 'en', '&lang=vi');
  const dF = await doc(pF);
  console.log('F) đã lưu en + ?lang=vi:', JSON.stringify(dF));
  if (dF.i18n !== 'vi' || dF.lang !== 'vi') fail(`?lang=vi không thắng được localStorage 'en' (i18n='${dF.i18n}' lang='${dF.lang}')`);

  // G. lựa chọn phải được GHI LẠI: bấm sang một trang không mang tham số vẫn giữ đúng thứ tiếng.
  const luu = await pE.evaluate(() => localStorage.getItem('vlcm_lang'));
  if (luu !== 'en') fail(`?lang=en không ghi lại vào localStorage (còn '${luu}') — rời tham số là mất ngôn ngữ`);
  await pE.goto('http://localhost:8853/index.html?max=1', { waitUntil:'load' });
  await pE.waitForFunction(() => window.__gameReady).catch(()=>{});
  const dG = await doc(pE);
  console.log('G) bỏ tham số, tải lại:', JSON.stringify(dG));
  if (dG.i18n !== 'en' || dG.lang !== 'en') fail(`bỏ tham số thì ngôn ngữ tụt về '${dG.i18n}'/'${dG.lang}'`);

  // H. localStorage BỊ CHẶN (cửa sổ riêng tư, chặn dữ liệu trang) + ?lang=en.
  //    Đây là mục DUY NHẤT chứng minh lang.js phải tự đọc URL. Ở máy bình thường, i18n.js nạp
  //    trước và GHI 'en' vào localStorage, nên lang.js đọc ké là ra đúng — thử ngược bằng cách
  //    gỡ đoạn đọc URL của lang.js vẫn XANH, tức bốn mục trên không gác được gì ở vế đó.
  //    Chặn ghi thì sợi dây ngầm ấy đứt, và hai lớp lệch ngay: i18n.js 'en', lang.js 'vi'.
  //    (Đã thử ngược đúng kiểu đó: gỡ đoạn URL của lang.js ⇒ mục này đỏ.)
  const ctxH = await b.newContext({ viewport:{width:1280,height:900} });
  await ctxH.addInitScript(() => {
    Storage.prototype.setItem = function(){ throw new DOMException('blocked', 'SecurityError'); };
    Storage.prototype.getItem = function(){ throw new DOMException('blocked', 'SecurityError'); };
  });
  const pH = await ctxH.newPage();
  await pH.goto('http://localhost:8853/index.html?max=1&lang=en', { waitUntil:'load' });
  await pH.waitForFunction(() => window.__gameReady).catch(()=>{});
  const dH = await pH.evaluate(() => ({ i18n: window.i18nLocale(), lang: window.ghhaLang() }));
  console.log('H) localStorage bị chặn + ?lang=en:', JSON.stringify(dH));
  if (dH.i18n !== 'en') fail(`localStorage bị chặn: i18n.js ra '${dH.i18n}'`);
  if (dH.lang !== 'en') fail(`localStorage bị chặn: lang.js ra '${dH.lang}' — nó đang đọc ké localStorage do i18n.js ghi, không tự đọc URL`);

  console.log(bad === 0 ? 'PASS' : 'FAIL(' + bad + ')');
  await b.close();
  process.exit(bad === 0 ? 0 : 1);
})();
