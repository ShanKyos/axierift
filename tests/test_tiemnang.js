// ĐIỂM TIỀM NĂNG RÓT VÀO CHIÊU — trần 5 điểm mỗi chiêu.
//
// `player.free` trước đây có ĐÚNG một chỗ tiêu (năm chỉ số). Nay có hai, và hai chỗ giành nhau
// cùng một túi điểm. Bài này gác bốn kiểu hỏng, ba trong đó KHÔNG ném lỗi và KHÔNG hiện ra:
//
//  1. TRẦN KHÔNG CHẠY. Rót quá 5 mà máy vẫn nhận thì cả cơ chế "chọn chiêu nào để nuôi" biến
//     mất — người chơi dồn hết vào một chiêu, và không có gì báo.
//  2. TRỪ MÀ KHÔNG CỘNG (hoặc ngược lại). Hai vế nằm hai dòng khác nhau; mất một vế là điểm
//     bốc hơi hoặc điểm đẻ ra vô hạn. §1 đo CẢ HAI vế trong một lượt.
//  3. RÓT XONG KHÔNG ĂN VÀO SÁT THƯƠNG. Đây là kiểu hỏng tệ nhất: bảng hiện 5/5, +15%, mà
//     castSkill không nhân. §5 ĐO sát thương thật qua `player.atk` bắt được trong hurtMob,
//     không hỏi mã nguồn.
//  4. SAVE CŨ. Trường `skillTn` không có trong save đời trước; thiếu một dòng vá là bấm nút
//     đầu tiên ném lỗi. §6 dựng lại đúng ca đó.
const { chromium } = require('playwright');
const PORT = process.argv[2] || '8853';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://localhost:' + PORT + '/index.html');
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(700);
  let bad = 0; const fail = m => { console.log('FAIL ' + m); bad++; };
  const pass = m => console.log('PASS ' + m);

  const r = await p.evaluate(() => {
    window.TEST_MODE = true;
    startGame('thieulam', null);
    const o = {};
    if (typeof window.rotTiemNang !== 'function'){ o.thieuHam = true; return o; }
    o.tran = (typeof SK_TN_TRAN === 'number') ? SK_TN_TRAN : null;

    // mọi chiêu trên thanh đều đã ngộ ở TEST_MODE? không chắc — dùng chiêu chính 'a', luôn có.
    player.level = 60; player.free = 40; player.skillTn = {};

    // ── §1 rót một điểm: trừ đúng 1, cộng đúng 1 ──
    const f0 = player.free;
    window.rotTiemNang('a');
    o.s1 = { free: player.free, freeTruoc: f0, tn: (player.skillTn.a || 0) };

    // ── §2 trần: gõ thêm 8 lần nữa vào một chiêu SẠCH ──
    player.skillTn = {}; player.free = 40;
    const f1 = player.free;
    for (let i = 0; i < 8; i++) window.rotTiemNang('tp');
    o.s2 = { tn: (player.skillTn.tp || 0), tieu: f1 - player.free };

    // ── §3 hết điểm thì không rót được ──
    player.skillTn = {}; player.free = 0;
    window.rotTiemNang('a');
    o.s3 = { tn: (player.skillTn.a || 0), free: player.free };

    // ── §4 công thức ──
    player.skillTn = {}; player.free = 40;
    o.s4a = skTnMult('a');
    for (let i = 0; i < SK_TN_TRAN; i++) window.rotTiemNang('a');
    o.s4b = skTnMult('a');

    return o;
  });

  if (r.thieuHam){ fail('§0 window.rotTiemNang không tồn tại — cả bài không chấm được'); }
  else {
    if (r.tran !== 5) fail(`§0 SK_TN_TRAN phải là 5, đang ${r.tran}`); else pass('§0 SK_TN_TRAN = 5');
    if (r.s1.tn === 1 && r.s1.free === r.s1.freeTruoc - 1) pass('§1 rót 1 điểm: chiêu +1, túi −1');
    else fail(`§1 rót 1 điểm sai — chiêu ${r.s1.tn} (cần 1), túi ${r.s1.freeTruoc}→${r.s1.free} (cần −1)`);
    if (r.s2.tn === 5 && r.s2.tieu === 5) pass('§2 trần 5/chiêu — 8 lần bấm chỉ ăn 5 điểm');
    else fail(`§2 trần hỏng — chiêu ${r.s2.tn} (cần 5), tiêu ${r.s2.tieu} điểm (cần 5)`);
    if (r.s3.tn === 0 && r.s3.free === 0) pass('§3 hết điểm thì không rót được');
    else fail(`§3 rót được khi túi rỗng — chiêu ${r.s3.tn}, túi ${r.s3.free}`);
    const can = 1 + 5 * 0.03;
    if (Math.abs(r.s4a - 1) < 1e-9 && Math.abs(r.s4b - can) < 1e-9) pass(`§4 hệ số 0 điểm = 1,00 · đầy trần = ${can.toFixed(2)}`);
    else fail(`§4 hệ số sai — 0 điểm ${r.s4a}, đầy trần ${r.s4b} (cần ${can})`);
  }

  // ── §5 TẦNG HÀNH VI: sát thương thật sự nhân lên ─────────────────────────────
  // Bắt `player.atk` ngay trong hurtMob — đó là giá trị ĐÃ nhân của cú tung. Hỏi mã nguồn thì
  // không bắt được ca "nhân nhầm chỗ"; đo ở đây thì bắt được.
  const r5 = await p.evaluate(() => {
    const doMot = () => {
      let thay = null;
      const goc = window.hurtMob;
      window.hurtMob = function(...a){ if (thay === null) thay = player.atk; return goc.apply(this, a); };
      // dựng cảnh: một con quái sát nách, đủ Mana, không hồi chiêu. Map khởi đầu là thị trấn
      // (0 quái) nên phải tự dời sang map hoang và tự thả một con — đừng trông vào mobs[0].
      mobs.length = 0;
      spawnMob(Object.keys(MOBS)[0], { x: player.x + 30, y: player.y, r: 4, count: 1 }, null);
      const m = mobs[0]; if (!m) { window.hurtMob = goc; return null; }
      m.hp = m.maxHp = 1e9; m.x = player.x + 30; m.y = player.y;
      player.qi = 9999; player.cd = {}; player.crit = 0; player.reflect = 0;
      // ⚠ Công Kích phải ĐỦ LỚN. castSkill làm tròn kết quả, nên ở mức 50 thì 50×1,15 = 57,5
      // → 57 và tỉ lệ đo được ra 1,140: sai số làm tròn nuốt mất 2/3 độ chính xác cần có.
      player.atk = 100000;
      castSkill('a');
      for (let i = 0; i < 12; i++) update(0.05);
      window.hurtMob = goc;
      return thay;
    };
    travelTo('chungnam');
    player.skillTn = {}; player.free = 40; calcDerived();
    const a0 = doMot();
    player.skillTn = {}; player.free = 40;
    for (let i = 0; i < SK_TN_TRAN; i++) window.rotTiemNang('a');
    calcDerived();
    const a5 = doMot();
    return { a0, a5, tn: player.skillTn.a || 0 };
  });
  if (r5.a0 == null || r5.a5 == null) fail(`§5 không bắt được cú đánh nào (a0=${r5.a0} a5=${r5.a5}) — cảnh dựng hỏng, bài không chấm được`);
  else {
    const ty = r5.a5 / r5.a0, can = 1 + 5 * 0.03;
    if (Math.abs(ty - can) < 0.001) pass(`§5 sát thương thật ×${ty.toFixed(3)} (cần ×${can.toFixed(2)}) — ${r5.a0} → ${r5.a5}`);
    else fail(`§5 rót đủ ${r5.tn} điểm mà sát thương chỉ ×${ty.toFixed(3)} (cần ×${can.toFixed(2)}) — ${r5.a0} → ${r5.a5}`);
  }

  // ── §6 save đời trước không có `skillTn` ─────────────────────────────────────
  const r6 = await p.evaluate(() => {
    // Đi ĐÚNG đường của một save đời trước: bỏ trường đi, ghi ra đĩa, đọc lại. Xoá tại chỗ rồi
    // bấm nút thì chỉ kiểm được cái chốt trong chính hàm rót — không kiểm được dòng vá ở loadGame.
    delete player.skillTn;
    saveGame();
    try { loadGame(); } catch (e){ return { ok:false, loi:'loadGame: ' + e }; }
    const coBang = !!player.skillTn && typeof player.skillTn === 'object';
    player.level = 60; player.free = 10;
    try {
      window.rotTiemNang('a');
      return { ok: true, coBang, tn: (player.skillTn && player.skillTn.a) || 0 };
    } catch (e){ return { ok: false, coBang, loi: String(e) }; }
  });
  if (r6.ok && r6.coBang && r6.tn >= 1) pass('§6 save cũ không có skillTn — loadGame vá lại, bấm vẫn chạy');
  else fail(`§6 save cũ vỡ: bảng sau loadGame=${r6.coBang} · ${r6.ok ? 'không rót được (tn=' + r6.tn + ')' : r6.loi}`);

  // ── §7 nút trên bảng Kỹ Năng có thật và trỏ vào hàm có thật ──────────────────
  // ⚠ Nạp lại trang trước mục này. §6 gọi loadGame(), và sau đó bảng Kỹ Năng mở ra vẫn
  // `hidden=false` mà `display:none` — tức mục 7 sẽ chấm một cái bảng không hiện ra và đỏ vì
  // lý do chẳng liên quan gì tới nút. Mục nào đo GIAO DIỆN thì cho nó một trang sạch.
  await p.goto('http://localhost:' + PORT + '/index.html');
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(700);
  const r7 = await p.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    player.level = 60; player.free = 10; player.skillTn = {}; calcDerived();
    // Phải MỞ bảng ra: renderSkillPanel() ghi HTML vào một bảng đang ẩn thì nút có trong DOM
    // mà không hiện ra — và "có trong DOM" chính là thứ không chứng minh được gì.
    // ⚠ Đừng hỏi thuộc tính `hidden` — bảng có lúc `hidden=false` mà CSS vẫn `display:none`,
    // và lúc đó lời gọi mở bảng bị bỏ qua rồi mục này đỏ vì một lý do chẳng liên quan tới nút.
    // Hỏi thẳng thứ MẮT THẤY (display), và bấm tối đa hai lần để mở được từ cả hai trạng thái.
    const _pn = document.getElementById('panel-skill');
    let _lan = 0;
    while (_pn && getComputedStyle(_pn).display === 'none' && _lan++ < 2) togglePanel('skill');
    renderSkillPanel();
    // Hỏi DOM chứ không hỏi chuỗi HTML: một cái tên hàm nằm đâu đó trong innerHTML (chú thích,
    // title, nút đã bị ẩn) không chứng minh được là có nút bấm được. Đúng bài học "nút chết"
    // của test_cayky — và bản đầu của chính mục này đã xanh trong lúc nút bị ẩn mất.
    const pn = document.getElementById('panel-skill');
    const nut = pn ? [...pn.querySelectorAll('button')].filter(x => /rotTiemNang/.test(x.getAttribute('onclick') || '')) : [];
    const hien = nut.filter(x => x.offsetParent !== null || x.getClientRects().length);
    const _cs = pn ? getComputedStyle(pn) : {};
    return { soNut: nut.length, soHien: hien.length, chu: hien[0] ? hien[0].textContent.trim() : '',
             an: pn ? pn.hidden : '?', disp: _cs.display || '?',
             hamThat: typeof window.rotTiemNang === 'function',
             coDong: !!(pn && /Tiềm Năng:<\/span>/.test(pn.innerHTML)) };
  });
  if (r7.soHien >= 1 && r7.hamThat && r7.coDong) pass(`§7 bảng Kỹ Năng có nút "${r7.chu}" hiện ra thật + dòng Tiềm Năng, onclick trỏ vào hàm có thật`);
  else fail(`§7 nút hỏng — nút trong DOM:${r7.soNut} · nút hiện ra:${r7.soHien} · dòng Tiềm Năng:${r7.coDong} · hàm thật:${r7.hamThat} · bảng ẩn:${r7.an}/${r7.disp}`);

  if (errs.length) fail('lỗi trang: ' + errs.slice(0,3).join(' | '));
  console.log(bad ? `\n${bad} FAIL` : '\nOK');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
