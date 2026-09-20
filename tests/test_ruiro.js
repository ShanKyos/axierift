// RỦI RO / SỨC CĂNG — QA chấm mảng này **3,0/10**, thấp nhất cả bảng, vì hai thứ đo được:
//
//  ① CHẾT KHÔNG MẤT GÌ. Đo một cái chết THẬT rồi `respawn()`:
//     trước: cấp 5 · 796 XP · 1.588◈ · 15 mạng · túi 2  ⇒  sau: **y hệt, không lệch một trường nào**
//  ② MỤC TIÊU HÔM NAY XONG TRONG 2 PHÚT. Dải 1 có đúng MỘT ô (`Hạ 10 Chimera`), mà nhịp hạ quái
//     đo được là 14-24 mạng/phút ⇒ cả tầng nội dung NGÀY của người chơi mới đóng sau ~30 giây cày.
//
// ⚠ MỆNH ĐỀ ② LÀ MỆNH ĐỀ NẶNG NHẤT, và nó gác chiều NGƯỢC: `ngoai` (Beast Herd Camp) khai
// `type:'safe'` nhưng là **bãi săn 8 bãi**. Tôi viết `md.type === 'safe'` trước và phép đo bắt
// ngay — cấp 25 chết ở đó mất **0 EXP**, tức đúng chỗ người chơi cày nhiều nhất lại là chỗ không
// có rủi ro. Cửa duy nhất đúng là CÓ BÃI QUÁI (cùng luật đã ghi cho Rương Canh).
//
// Chạy độc lập:  node tests/test_ruiro.js [cổng]
const { chromium } = require('playwright');
const CONG = process.argv[2] || '8853';
let bad = 0;
const fail = m => { console.log('FAIL ' + m); bad++; };
const pass = m => console.log('PASS ' + m);

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e).slice(0, 160)));
  await page.goto(`http://localhost:${CONG}/index.html?test=1`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__gameReady).catch(() => {});

  const R = await page.evaluate(() => {
    window.TEST_MODE = true;
    const chet = (lv, map) => {
      localStorage.clear(); startGame('thieulam', null); player.tutStep = -1;
      player.level = lv; calcDerived(); travelTo(map);
      player.xp = Math.floor(XP_TABLE[lv - 1] * 0.5);
      // ⚠ TẮT MỌI ĐƯỜNG HỒI SINH TRƯỚC KHI ĐO — bài này đỏ 1/5 lượt trước khi có ba dòng dưới.
      // `startGame` bốc ngẫu nhiên thiên phú THIÊN MỆNH (`traitRevive`), và `onDeath()` `return`
      // ở nhánh hồi sinh **trước** chỗ trừ EXP ⇒ cái chết đầu miễn phí, phép đo ra 0 mà mã thì
      // đúng. Bản Nguyên Công (`tienthiencong`) cũng một cửa như thế.
      player.traitRevive = false; player.reviveUsed = true; player.vhReviveCd = 999;
      const truoc = player.xp, bao = chetMatXp();
      player.hp = 0; onDeath();
      const hoiSinh = !dead;   // còn sống sau onDeath ⇒ một nhánh hồi sinh đã nuốt cú chết
      const noi = (document.body.innerText.match(/(Mất [\d.,]+ EXP|Không mất EXP[^.]*)/) || [null])[0];
      const ra = { lv, map, truoc, bao, sau: player.xp, mat: truoc - player.xp, hoiSinh,
                   capGiuNguyen: player.level === lv, noi,
                   coBai: (() => { try { return packsOf(map).length; } catch { return -1; } })() };
      if (typeof respawn === 'function') respawn();
      return ra;
    };
    const out = { canhChet: [chet(5, 'corran'), chet(25, 'corran'), chet(25, 'ngoai'), chet(25, 'ardhaven'), chet(25, 'pvp')] };
    // sàn: XP gần 0 thì không được âm, và không được tụt cấp
    localStorage.clear(); startGame('thieulam', null); player.tutStep = -1;
    player.level = 30; calcDerived(); travelTo('ngoai'); player.xp = 3;
    player.hp = 0; onDeath();
    out.san = { xp: player.xp, cap: player.level };
    if (typeof respawn === 'function') respawn();
    // mục tiêu ngày theo dải
    out.dai = [1, 11, 20, 40, 100].map(lv => {
      localStorage.clear(); startGame('thieulam', null); player.tutStep = -1;
      player.level = lv; calcDerived();
      const B = dailyBand();
      return { lv, soMuc: dailyGoalsNow().length, kills: B.muc.kills, khoa: Object.keys(B.muc) };
    });
    out.bang = DAILY_BANDS.map(b => ({ max: b.max, kills: b.muc.kills, khoa: Object.keys(b.muc) }));
    // via trong dải 1 có tới được không — đây là phép đo, không phải linh cảm
    localStorage.clear(); startGame('thieulam', null); player.tutStep = -1;
    out.mapDuoiCap11 = Object.keys(MAPS).filter(k => (MAPS[k].min || 1) <= 11 && !MAPS[k].dungeon);
    try { out.viaHomNay = viaHomNay().map(v => v.map || v); } catch { out.viaHomNay = []; }
    return out;
  });

  // ── ① CHẾT Ở BÃI SĂN PHẢI MẤT EXP ──
  const bai = R.canhChet.filter(c => c.coBai > 0 && c.lv >= 10);
  if (!bai.length) fail('① cảnh dựng: không có ca nào vừa đủ cấp vừa đứng trên bãi săn');
  for (const c of bai){
    if (c.hoiSinh) fail(`① cảnh dựng ${c.map}: một nhánh hồi sinh đã nuốt cú chết, phép đo vô nghĩa`);
    else if (c.mat <= 0) fail(`① cấp ${c.lv} chết ở ${c.map} (${c.coBai} bãi quái) mất ${c.mat} EXP — chết vẫn không có giá`);
    else if (!c.capGiuNguyen) fail(`① chết ở ${c.map} làm TỤT CẤP — không bao giờ được phép`);
    else if (c.mat !== c.bao) fail(`① số báo trước (${c.bao}) khác số trừ thật (${c.mat}) ở ${c.map}`);
    else pass(`① cấp ${c.lv} · ${c.map}: mất ${c.mat} EXP, giữ nguyên cấp`);
  }
  // ⚠ `ngoai` là ca QUAN TRỌNG NHẤT — nó khai `safe` mà vẫn là bãi săn
  const ng = R.canhChet.find(c => c.map === 'ngoai');
  if (!ng || ng.coBai <= 0) fail('① cảnh dựng: `ngoai` đáng lẽ có bãi quái');
  else if (ng.mat <= 0) fail("① `ngoai` khai type:'safe' nhưng LÀ bãi săn — chết ở đó vẫn phải mất EXP");
  else pass('① `ngoai` (khai safe, nhưng có bãi quái) vẫn tính giá');

  // ── ② BỐN CHỖ MIỄN ──
  for (const [map, vi] of [['ardhaven', 'trong thành'], ['pvp', 'sàn đấu PvP']]){
    const c = R.canhChet.find(x => x.map === map);
    if (!c) continue;
    if (c.mat !== 0) fail(`② ${vi} đáng lẽ miễn, nhưng mất ${c.mat} EXP`);
    else pass(`② ${vi}: miễn đúng`);
  }
  const tre = R.canhChet.find(c => c.lv < 10);
  if (!tre) fail('② cảnh dựng: thiếu ca dưới cấp miễn');
  else if (tre.mat !== 0) fail(`② cấp ${tre.lv} (dưới cấp miễn) vẫn mất ${tre.mat} EXP — đoạn tân thủ phải tha`);
  else pass(`② cấp ${tre.lv}: đoạn tân thủ được tha`);

  // ── ③ NÓI RA: một khoản mất không ai thấy thì bằng không mất ──
  const mat = R.canhChet.find(c => c.mat > 0);
  if (!mat) fail('③ cảnh dựng: không ca nào mất EXP nên không kiểm được lời báo');
  else if (!/Mất [\d.,]+ EXP/.test(mat.noi || '')) fail(`③ màn bại trận KHÔNG nói ra cái giá — đọc được: "${mat.noi}"`);
  else pass(`③ màn bại trận nói ra: "${mat.noi}"`);
  const khongMat = R.canhChet.find(c => c.mat === 0);
  if (khongMat && !/Không mất EXP/.test(khongMat.noi || '')) fail(`③ chỗ ĐƯỢC MIỄN cũng phải nói, im lặng ở đó đọc ra "cơ chế hỏng" — "${khongMat.noi}"`);
  else pass('③ chỗ được miễn cũng nói ra lý do');

  // ── ④ SÀN: XP không âm, không tụt cấp ──
  if (R.san.xp < 0 || R.san.cap !== 30) fail(`④ XP gần 0 mà chết ra ${R.san.xp} XP / cấp ${R.san.cap}`);
  else pass(`④ XP gần 0: kẹp về ${R.san.xp}, giữ cấp ${R.san.cap}`);

  // ── ⑤ MỤC TIÊU NGÀY: dải 1 không được là một dòng duy nhất, và phải tăng dần ──
  // ⚠ MỆNH ĐỀ NÀY TỪNG ĐÒI SAI THỨ. Bản đầu tôi chốt "dải 1 phải có ≥2 ô" rồi nhét `forge` vào
  // cho đủ — và `test_earlygame` bắt được: làm thế thì dải 1 (2 ô) BẰNG dải 2 (2 ô), tức phá
  // đúng tính chất mà bảng này sinh ra để có, **số ô lớn dần theo cấp**. Cái cần chữa là ĐỘ DÀI
  // (30 giây), không phải số dòng. Nay gác cả hai vế cho đúng.
  const d1 = R.dai.find(d => d.lv === 1);
  if (!d1) fail('⑤ cảnh dựng: không đọc được dải cấp 1');
  else {
    const d12 = R.dai.find(d => d.lv === 20), d120 = R.dai.find(d => d.lv === 100);
    if (!d12 || !d120) fail('⑤ cảnh dựng: thiếu dải giữa/cuối để so');
    else if (!(d12.soMuc > d1.soMuc && d120.soMuc > d12.soMuc))
      fail(`⑤ bảng mục tiêu KHÔNG lớn dần theo cấp: ${d1.soMuc} → ${d12.soMuc} → ${d120.soMuc}`);
    else pass(`⑤ bảng lớn dần theo cấp: ${d1.soMuc} → ${d12.soMuc} → ${d120.soMuc} ô`);
  }
  // nhịp đo được: cấp 5 = 14 mạng/phút · cấp 11 = 24 ⇒ dưới 30 mạng là chưa tới 2 phút cày
  if (d1 && d1.kills < 30) fail(`⑤ dải 1 chỉ đòi ${d1.kills} mạng — ở nhịp 14-24 mạng/phút thì xong trong dưới 2 phút`);
  else if (d1) pass(`⑤ dải 1 đòi ${d1.kills} mạng (~2-3 phút ở nhịp đo được)`);
  let tang = true;
  for (let i = 1; i < R.bang.length; i++) if (R.bang[i].kills < R.bang[i-1].kills) tang = false;
  if (!tang) fail(`⑤ ô kills không tăng dần theo dải: ${R.bang.map(b => b.kills).join(' → ')}`);
  else pass(`⑤ ô kills tăng dần: ${R.bang.map(b => b.kills).join(' → ')}`);

  // ── ⑥ DẢI 1 KHÔNG ĐƯỢC CHỨA MỤC TIÊU BẤT KHẢ ──
  // Thưởng ngày đòi xong HẾT, nên một ô không tới được là khoá câm cả phần thưởng — không lỗi nào báo.
  const d1b = R.bang[0];
  if (d1b.khoa.includes('via')){
    const giao = R.viaHomNay.filter(m => R.mapDuoiCap11.includes(m));
    fail(`⑥ dải 1 khai 'via' — vỉa hôm nay ở [${R.viaHomNay}], map cấp ≤11 tới được [${R.mapDuoiCap11}], giao = ${giao.length}`);
  } else pass(`⑥ dải 1 không khai 'via' (vỉa hôm nay [${R.viaHomNay.join(',')}] giao với map cấp ≤11 = ${R.viaHomNay.filter(m => R.mapDuoiCap11.includes(m)).length})`);

  if (errors.length) fail('LỖI JS: ' + errors.slice(0, 3).join(' | '));
  else pass('không lỗi JS');
  console.log(bad ? `\n${bad} FAIL` : '\nTẤT CẢ PASS');
  await browser.close();
  process.exit(bad ? 1 : 0);
})();
