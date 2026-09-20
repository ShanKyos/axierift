// CÔNG TẮC TỔNG ÂM THANH.
// Trước bản này game KHÔNG có cách nào tắt tiếng: nút ♪ cũ đã gỡ cùng khối `#mc-drop`, và thứ
// còn lại là hai thanh trượt trong Cài Đặt. Kéo cả hai về 0 thì tắt được — nhưng MẤT luôn hai
// mức đã chỉnh, nên trong thực tế không ai dùng đường đó, họ tắt loa máy.
//
// Bài này gác TẦNG HÀNH VI, không hỏi biến: "đã tắt chưa" được đo bằng việc có tệp âm thanh
// nào được PHÁT hay không, vì một cái cờ đúng mà một đường phát quên hỏi nó thì trông y hệt
// một hệ đang chạy — và triệu chứng ("tắt rồi mà thỉnh thoảng vẫn kêu") không ai mô tả nổi.
const { chromium } = require('playwright');
const URL = 'http://localhost:8853/index.html?max=1';

let bad = 0; const fail = m => { console.log('FAIL', m); bad++; };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto(URL);
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.evaluate(() => localStorage.clear());
  await p.reload();
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(500);
  await p.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', { name:'Am' }); applyTestBoost(); player.tutStep = -1; });
  await p.waitForTimeout(400);

  // ── ① Mặc định CÓ TIẾNG, và có một cái nút nhìn thấy được để tắt ────────────────────────
  const s1 = await p.evaluate(() => {
    const n = document.getElementById('btn-am');
    const r = n && n.getBoundingClientRect();
    return { mặcĐịnh: SETTINGS.amThanh, cóNút: !!n,
             hiện: !!(r && r.width > 10 && r.height > 10 && n.offsetParent !== null),
             trongMàn: !!(r && r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight) };
  });
  console.log('① ', JSON.stringify(s1));
  if (s1.mặcĐịnh !== true) fail('mặc định phải CÓ tiếng — người chơi cũ mở game lên không được im bặt');
  if (!s1.cóNút) fail('không có nút #btn-am trên HUD');
  if (!s1.hiện) fail('nút loa có trong DOM nhưng không nhìn thấy / không bấm được');
  if (!s1.trongMàn) fail('nút loa nằm ngoài khung nhìn');

  // ── ② TẮT LÀ CÂM THẬT: đếm số lần .play() được gọi, không hỏi SETTINGS ──────────────────
  // Đây là mệnh đề duy nhất bắt được ca "quên hỏi công tắc ở một đường phát".
  const s2 = await p.evaluate(() => {
    const goc = Audio.prototype.play, gocP = Audio.prototype.pause;
    let phát = 0, dừng = 0;
    Audio.prototype.play = function(){ phát++; return Promise.resolve(); };
    Audio.prototype.pause = function(){ dừng++; return gocP.call(this); };
    AudioSys.started = true; AudioSys.bgmName = 'bgm_intro'; AudioSys._startTrack();
    const phátKhiBật = phát;

    document.getElementById('btn-am').click();      // TẮT
    const dừngKhiTắt = dừng;
    phát = 0; AudioSys.last = {};
    for (const t of ['ui','quest','levelup','forge_ok','hurt']) AudioSys.sfx(t, 1);
    AudioSys.playBgm('bgm_boss'); AudioSys._startTrack();
    const phátKhiTắt = phát;

    document.getElementById('btn-am').click();      // BẬT lại
    phát = 0; AudioSys.last = {};
    for (const t of ['ui','quest','levelup','forge_ok','hurt']) AudioSys.sfx(t, 1);
    const phátLại = phát;

    Audio.prototype.play = goc; Audio.prototype.pause = gocP;
    return { phátKhiBật, phátKhiTắt, phátLại, dừngKhiTắt };
  });
  console.log('② ', JSON.stringify(s2));
  if (s2.phátKhiBật < 1) fail('cảnh dựng hỏng: lúc BẬT mà _startTrack() cũng không phát gì — phép đo dưới đây vô nghĩa');
  if (s2.phátKhiTắt !== 0) fail(`TẮT rồi mà vẫn có ${s2.phátKhiTắt} lượt phát — có đường phát quên hỏi công tắc tổng`);
  if (s2.phátLại < 5) fail(`BẬT lại mà chỉ phát ${s2.phátLại}/5 — công tắc tắt được nhưng không bật lại được`);
  if (s2.dừngKhiTắt < 1) fail('TẮT mà không HÃM nhạc nền: bản nhạc vẫn quay ở âm lượng 0, máy vẫn giải mã mp3 suốt phiên');

  // ── ③ LÝ DO TỒN TẠI CỦA CÔNG TẮC: tắt/bật KHÔNG được ăn mất hai mức đã chỉnh ────────────
  const s3 = await p.evaluate(() => {
    SETTINGS.bgm = 17; SETTINGS.sfx = 83; saveSettings();
    window.tatMoAmThanh(false);
    const khiTắt = { bgm: SETTINGS.bgm, sfx: SETTINGS.sfx, vBgm: AudioSys.bgmVol(), vSfx: AudioSys.sfxVol() };
    window.tatMoAmThanh(true);
    return { khiTắt, sauKhiBật: { bgm: SETTINGS.bgm, sfx: SETTINGS.sfx } };
  });
  console.log('③ ', JSON.stringify(s3));
  if (s3.khiTắt.vBgm !== 0 || s3.khiTắt.vSfx !== 0) fail(`tắt mà âm lượng hiệu dụng chưa về 0 (${s3.khiTắt.vBgm}/${s3.khiTắt.vSfx})`);
  if (s3.khiTắt.bgm !== 17 || s3.khiTắt.sfx !== 83) fail('tắt tiếng mà ĐÈ mất hai mức đã chỉnh — đúng cái mà kéo-hai-thanh-về-0 vốn đã làm được, công tắc riêng thành thừa');
  if (s3.sauKhiBật.bgm !== 17 || s3.sauKhiBật.sfx !== 83) fail(`bật lại mà mức không về như cũ: ${JSON.stringify(s3.sauKhiBật)}`);

  // ── ④ BA CỬA BẤM, MỘT TRẠNG THÁI. Cửa nào cũng phải vẽ lại nút HUD. ─────────────────────
  const s4 = await p.evaluate(() => {
    const nút = document.getElementById('btn-am');
    const đọc = () => { const im = nút.querySelector('img');
      return { on: SETTINGS.amThanh, ico: im ? im.getAttribute('src') : nút.textContent.trim(),
               cóẢnh: !!im, cờ: nút.classList.contains('am-tat') }; };
    const ra = {};
    // cửa 1 — nút HUD
    window.tatMoAmThanh(true); nút.click(); ra.hud = đọc();
    // cửa 2 — nút trong bảng Cài Đặt
    window.tatMoAmThanh(true);
    closePanels(); togglePanel('settings'); window.setSetTab('chung');
    const nútCĐ = [...document.querySelectorAll('#panel-settings .mini-btn')]
      .find(x => /tatMoAmThanh/.test(x.getAttribute('onclick') || ''));
    ra.cóNútCàiĐặt = !!nútCĐ;
    if (nútCĐ) nútCĐ.click();
    ra.caiDat = đọc();
    closePanels();
    return ra;
  });
  console.log('④ ', JSON.stringify(s4));
  if (!s4.cóNútCàiĐặt) fail('bảng Cài Đặt không có nút bật/tắt âm thanh');
  for (const [tên, v] of [['nút HUD', s4.hud], ['nút Cài Đặt', s4.caiDat]]){
    if (v.on !== false) fail(`${tên}: bấm mà không tắt được`);
    if (!v.cờ) fail(`${tên}: đã tắt nhưng nút HUD không mang cờ .am-tat — người chơi tưởng game hỏng tiếng`);
    // ⚠ ĐỌC ĐÚNG THỨ ĐANG VẼ. Icon từng là ký tự 🔊/🔇; nay là <img>, nên `textContent` rỗng
    // ở CẢ HAI trạng thái — một mệnh đề hỏi nó sẽ xanh vĩnh viễn mà không gác gì.
    if (!v.cóẢnh) fail(`${tên}: nút loa không có <img> — Quy tắc số 3 đòi tranh thật, emoji vẽ theo phông của từng máy`);
    else if (!/tat/.test(v.ico)) fail(`${tên}: đã tắt nhưng nút vẫn vẽ ảnh BẬT (${v.ico})`);
  }
  // Và chiều ngược lại: bật thì phải quay về ảnh BẬT.
  const s4b = await p.evaluate(() => { window.tatMoAmThanh(true);
    const im = document.getElementById('btn-am').querySelector('img');
    return im ? im.getAttribute('src') : null; });
  if (!s4b || !/bat/.test(s4b)) fail(`bật lại mà nút loa không quay về ảnh BẬT (${s4b})`);
  // Ba tấm phải TẢI ĐƯỢC THẬT — khai tên mà thiếu tệp thì nút hiện ra một ô vỡ, không lỗi nào báo.
  const s4c = await p.evaluate(async () => {
    const ra = {};
    for (const t of ['gt_loa_bat', 'gt_loa_tat', 'gt_nhac'])
      ra[t] = await fetch('assets/ui/' + t + '.webp', { method:'HEAD' }).then(r => r.ok).catch(() => false);
    return ra;
  });
  console.log('④ ảnh:', JSON.stringify({ ...s4c, batLai: s4b }));
  for (const [t, ok] of Object.entries(s4c)) if (!ok) fail(`thiếu tệp assets/ui/${t}.webp`);

  // ── ⑤ PHÍM L, và nó KHÔNG được cướp chữ 'l' của ô nhập ──────────────────────────────────
  await p.evaluate(() => { window.tatMoAmThanh(true); closePanels(); });
  await p.keyboard.press('l'); await p.waitForTimeout(120);
  const sauL = await p.evaluate(() => SETTINGS.amThanh);
  await p.keyboard.press('l'); await p.waitForTimeout(120);
  const sauL2 = await p.evaluate(() => SETTINGS.amThanh);
  const gõ = await p.evaluate(() => {
    const i = document.createElement('input'); document.body.appendChild(i); i.focus();
    const t = SETTINGS.amThanh;
    i.dispatchEvent(new KeyboardEvent('keydown', { key:'l', bubbles:true }));
    const s = SETTINGS.amThanh; i.remove();
    return t === s;
  });
  console.log('⑤ ', JSON.stringify({ sauL, sauL2, khôngCướpÔNhập: gõ }));
  if (sauL !== false) fail('phím L không tắt được tiếng');
  if (sauL2 !== true) fail('phím L tắt được nhưng không bật lại được');
  if (!gõ) fail("gõ chữ 'l' trong ô nhập cũng lật công tắc âm thanh");

  // Bảng phím tắt phải NÓI ra phím L — một phím không ai biết là một phím không tồn tại.
  const bảng = await p.evaluate(() => (window.HD_BANG || []).flatMap(g => g.hang).some(h => h[0] === 'L'));
  if (!bảng) fail('phím L không có trong HD_BANG — bảng Phím Tắt sẽ không nhắc tới nó');

  // ── ⑥ LƯU QUA RELOAD, và nút vẽ đúng ngay từ khung đầu ──────────────────────────────────
  await p.evaluate(() => window.tatMoAmThanh(false));
  await p.reload();
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(400);
  const s6 = await p.evaluate(() => ({ on: SETTINGS.amThanh,
    cờ: document.getElementById('btn-am').classList.contains('am-tat'),
    vBgm: AudioSys.bgmVol() }));
  console.log('⑥ ', JSON.stringify(s6));
  if (s6.on !== false) fail('tắt tiếng không được lưu — tải lại trang là kêu lại');
  if (!s6.cờ) fail('tải lại trang: đang tắt tiếng mà nút loa vẽ trạng thái BẬT');
  if (s6.vBgm !== 0) fail('tải lại trang: cờ tắt còn đó mà âm lượng nhạc nền không về 0');

  // ── ⑦ SAVE ĐỜI CŨ phải VẪN CÓ TIẾNG — và có HAI đường hỏng, không một ──────────────────
  // (a) THIẾU hẳn khoá  → đỡ bởi giá trị mặc định trong Object.assign
  // (b) khoá có mà là RÁC (null / 0 / "") → đỡ bởi dòng di trú `!== false`
  // ⚠ Chỉ kiểm (a) thì phép thử ngược trên dòng di trú IM LẶNG, vì khi thiếu khoá thì
  // Object.assign đã trả `true` và dòng ấy không quyết định gì. Đã dẫm đúng thế một lần.
  for (const [tên, đặt] of [['thiếu hẳn khoá', null], ['khoá là null', null], ['khoá là 0', 0], ['khoá là ""', '']]){
    const bỏHẳn = tên === 'thiếu hẳn khoá';
    await p.evaluate(({ bỏHẳn, đặt }) => {
      const c = JSON.parse(localStorage.getItem('vlcm_settings') || '{}');
      if (bỏHẳn) delete c.amThanh; else c.amThanh = đặt;
      localStorage.setItem('vlcm_settings', JSON.stringify(c));
    }, { bỏHẳn, đặt });
    await p.reload();
    await p.waitForFunction(() => window.__gameReady).catch(()=>{});
    await p.waitForTimeout(350);
    const v = await p.evaluate(() => ({ on: SETTINGS.amThanh, vBgm: AudioSys.bgmVol() }));
    console.log('⑦ ', tên, JSON.stringify(v));
    if (v.on !== true) fail(`save đời cũ (${tên}) bị hiểu thành ĐÃ TẮT — người chơi cũ mở game lên im bặt mà không hiểu vì sao`);
    if (v.vBgm <= 0) fail(`save đời cũ (${tên}): có tiếng theo cờ mà âm lượng vẫn 0`);
  }

  // ── ⑧ THANH TRƯỢT PHẢI IN RA SỐ, và số phải ĐỔI THEO khi kéo ────────────────────────────
  const s8 = await p.evaluate(() => {
    window.TEST_MODE = true; if (!window.player) startGame('thieulam', { name:'Am' });
    closePanels(); togglePanel('settings'); window.setSetTab('chung');
    const sl = [...document.querySelectorAll('#panel-settings input[type=range]')]
      .find(r => /'bgm'/.test(r.getAttribute('oninput') || ''));
    if (!sl) return { có:false };
    const so = sl.nextElementSibling;
    const truoc = so && so.classList.contains('set-so') ? so.textContent.trim() : null;
    sl.value = '73'; sl.dispatchEvent(new Event('input', { bubbles:true }));
    const sau = so ? so.textContent.trim() : null;
    return { có:true, cóSố: !!truoc, truoc, sau, khớp: sau === '73%' };
  });
  console.log('⑧ ', JSON.stringify(s8));
  if (!s8.có) fail('không tìm thấy thanh trượt nhạc nền');
  else if (!s8.cóSố) fail('thanh trượt âm thanh không in ra mức hiện tại — người chơi không có cách nào biết đang ở đâu');
  else if (!s8.khớp) fail(`kéo thanh trượt mà con số bên cạnh không đổi theo (${s8.truoc} → ${s8.sau}) — đúng kiểu "bấm không ăn" mà con số này sinh ra để chữa`);

  console.log('errors:', JSON.stringify(errs));
  console.log(bad === 0 && errs.length === 0 ? 'PASS' : 'FAIL(' + (bad + errs.length) + ')');
  await b.close();
  process.exit(bad === 0 && errs.length === 0 ? 0 : 1);
})();
