// PHIM MỞ ĐẦU KHẾ ƯỚC — nhịp 0 của hoạt ảnh quay, một clip Veo 10,7 giây có tiếng.
//
// Bảy mệnh đề, và năm trong số đó gác những thứ KHÔNG ném lỗi và KHÔNG hiện ra:
//
//  ① Tệp phải TẢI ĐƯỢC qua HTTP. `public/game/assets/video/` nằm trong `.gitignore` từ trước,
//     và production là `git reset --hard` trên VPS — nên một tệp bị chặn ở đó sẽ 404 trên máy
//     người chơi trong im lặng, đúng như ghi chú `sect_intro.mp4` trong game.js đã ghi lại một
//     lần rồi. Mục này là thứ DUY NHẤT bắt được chuyện ai đó siết lại dòng gitignore.
//  ② TEST_MODE thì KHÔNG chiếu. Thiếu cửa đó là 177 bài hồi quy đứng chờ 10,7 giây mỗi cú quay.
//  ③ Không TEST_MODE thì PHẢI chiếu, và phải chiếu THẬT (currentTime chạy tới) — hỏi
//     `_kuPha === 'phim'` là chưa đủ, một thẻ video 404 vẫn vào đúng nhịp đó rồi đứng im.
//  ④ Bấm bỏ qua lúc đang chiếu thì CHỈ bỏ phim: lớp phủ còn đó, cú quay chạy tiếp sang 'comet'.
//     Nuốt luôn cả cú quay là lấy mất đúng thứ người chơi trả vé để xem.
//  ⑤ Phim hết thì TỰ sang nhịp sau — không có nó thì lớp phủ treo đen vĩnh viễn, mất cả cú
//     quay — và nhịp sau phải là 'hien', KHÔNG phải 'comet'. Xem ⑧.
//  ⑧ XEM HẾT CLIP RỒI THÌ ĐỪNG KỂ LẠI. Ba giây rưỡi cuối của clip đúng là nhịp 'comet' + 'no'
//     (đo 0,2s một mẫu: 7,1→9,6s tia vàng hội tụ rồi nổ, điểm ảnh vàng 10%→22%; 9,8→10,24s
//     chớp trắng kín màn, sáng 137→226→247/255). Chạy tiếp 'comet' là lặp 1,57 giây và chớp
//     trắng HAI lần. Mệnh đề này kẹp HAI ĐẦU, và thiếu đầu nào cũng lọt một cách sửa sai:
//     xem TRỌN ⇒ 'hien' · BỎ QUA giữa chừng ⇒ vẫn 'comet' (chưa xem nổ thì phải vẽ lại).
//  ⑥ Tiếng đi qua SETTINGS.sfx, và nhạc nền được hạ xuống rồi TRẢ LẠI. Quên vế trả lại là nhạc
//     nền câm hẳn từ cú quay đầu tiên tới hết phiên.
//  ⑦ ?test=1 thì VẪN chiếu. Cửa tắt phim phải hỏi "bài kiểm đặt cờ" chứ không phải "cờ đang
//     bật": chủ dự án dùng ?test=1 làm link chơi thử, và một link chơi thử giấu mất tính năng
//     mới thì nó đang thử một trò chơi khác.
const { chromium } = require('playwright');
const PORT = process.argv[2] || '8853';
const SRC = ['assets/video/summon_mo_dau.webm', 'assets/video/summon_mo_dau.mp4'];
(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport:{ width:1100, height:800 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e).split('\n')[0]));
  await p.goto('http://localhost:' + PORT + '/index.html');
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(500);
  let bad = 0; const fail = m => { console.log('FAIL', m); bad++; };
  const pass = m => console.log('PASS', m);

  // ── ① tệp tải được ───────────────────────────────────────────────────────
  const r1 = await p.evaluate(async srcs => {
    const out = [];
    for (const src of srcs){
      try { const r = await fetch(src, { method:'HEAD' });
        out.push({ src, ok:r.ok, st:r.status, co:+(r.headers.get('content-length') || 0) }); }
      catch(e){ out.push({ src, ok:false, st:0, co:0 }); }
    }
    return out;
  }, SRC);
  console.log('①', JSON.stringify(r1));
  // CẢ HAI đuôi đều phải có. Thiếu webm là không trình duyệt mã nguồn mở nào chạy được (và mọi
  // bài kiểm mù); thiếu mp4 là Safari không chạy được. Một đuôi thì không bao giờ đủ.
  const thieu = r1.filter(x => !x.ok || x.co < 300000);
  if (thieu.length) fail(`không tải được ${thieu.map(x => x.src + ' (HTTP ' + x.st + ', ' + x.co + 'B)').join(' · ')} — kiểm .gitignore, thư mục video từng bị chặn cả cụm`);
  else pass(`cả hai đuôi tải được: ${r1.map(x => x.src.split('.').pop() + ' ' + (x.co/1048576).toFixed(2) + ' MB').join(' · ')}`);

  // ── ② TEST_MODE: không chiếu ─────────────────────────────────────────────
  const r2 = await p.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    player.level = 20; player.lvPeak = 20; calcDerived();
    chiState().ve.gk = 50; window.kheUocQuay('gk', 1);
    const v = document.getElementById('ku-phim');
    return { an: !v || v.classList.contains('hidden'),
             // tự kiểm cảnh dựng: không có cú quay nào thì "không chiếu phim" là xanh vô nghĩa
             phu: !document.getElementById('gacha-wrap').classList.contains('hidden') };
  });
  await p.evaluate(() => { try { kuBoQua(); kuBoQua(); } catch(e){} });
  console.log('②', JSON.stringify(r2));
  if (!r2.phu) fail('dựng cảnh ② hỏng: kheUocQuay không mở được lớp phủ, nên mục này không gác gì');
  else if (!r2.an) fail('TEST_MODE mà vẫn chiếu phim — 177 bài hồi quy sẽ phải chờ 10,7 giây mỗi cú quay');
  else pass('TEST_MODE: có quay, không chiếu phim');

  // ── ③ không TEST_MODE: chiếu thật ────────────────────────────────────────
  await p.reload();
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(400);
  await p.evaluate(() => {
    window.TEST_MODE = false; startGame('thieulam', null);
    player.level = 20; player.lvPeak = 20; calcDerived();
    chiState().ve.gk = 50;
  });
  // Cú bấm THẬT trên trang: vài trình duyệt đòi một cử chỉ người dùng mới cho chạy có tiếng.
  await p.mouse.click(5, 5);
  await p.evaluate(() => { window.kheUocQuay('gk', 1); });
  // ⚠⚠ ĐO CLIP CÓ **NHÍCH** KHÔNG, ĐỪNG ĐO NÓ CHẠY ĐƯỢC BAO XA. Hai bản trước đều sai cùng
  // một kiểu, và bản thứ hai mất một lượt hồi quy mới lộ:
  //   · bản 1 lấy MỘT mẫu ở một mốc cố định ("sau 1,8s phải chạy được 0,3s") ⇒ đỏ theo xúc xắc,
  //     vì khung đầu mất tới ~1,6 giây mới giải xong ở máy bận;
  //   · bản 2 chờ tới khi `currentTime > 0.25`, có hạn 8 giây — nhưng `0.25` vừa là cửa THOÁT
  //     vòng vừa là NGƯỠNG CHẤM, nên nó lặng lẽ biến thành một đòi hỏi về TỐC ĐỘ GIẢI MÃ. Máy
  //     này không có GPU; trong một lượt hồi quy đầy đủ, VP9 1120×630 giải chậm tới mức 8 giây
  //     thật không đủ cho 0,25 giây phim. Đo được: chạy riêng ra 0,27-0,40 (xanh 3/3), trong
  //     hồi quy ra **đúng 0,25** ⇒ đỏ. Cơ chế hoàn hảo, ngưỡng nằm trong dải nhiễu.
  // ⇒ Đếm số lần `currentTime` TĂNG giữa hai mẫu liên tiếp. Đứng im thật thì con số ấy là 0 dù
  //   chờ bao lâu; chạy chậm thì vẫn tăng. Không còn ngưỡng tốc độ nào để mà trượt.
  const r3 = await p.evaluate(async () => {
    const v = document.getElementById('ku-phim');
    const het = Date.now() + 8000;
    let truoc = -1, tang = 0, dinh = 0;
    while (Date.now() < het && !(v && v.error) && tang < 3){
      if (v){
        const t = v.currentTime;
        if (t > truoc){ if (truoc >= 0) tang++; truoc = t; }
        if (t > dinh) dinh = t;
      }
      await new Promise(r => setTimeout(r, 120));
    }
    return { hien: !!v && !v.classList.contains('hidden'),
             dung: v ? (v.currentSrc || '').split('/').pop() : '',
             t: v ? +v.currentTime.toFixed(2) : -1, tang, dinh: +dinh.toFixed(2),
             loi: v && v.error ? v.error.code : 0,
             dai: v ? +(v.duration || 0).toFixed(2) : 0,
             tat: v ? v.muted : null, vol: v ? +v.volume.toFixed(2) : -1,
             phu: !document.getElementById('gacha-wrap').classList.contains('hidden') };
  });
  console.log('③', JSON.stringify(r3));
  if (r3.loi) fail(`thẻ video báo lỗi mã ${r3.loi} — tệp không tới nơi hoặc trình duyệt không giải được`);
  else if (!r3.hien || !r3.phu) fail('bấm Quay mà phim không hiện');
  else if (r3.tang < 2) fail(`phim vào đúng nhịp nhưng ĐỨNG IM (currentTime nhích ${r3.tang} lần trong 8 giây, đỉnh ${r3.dinh}s)`);
  else if (r3.dai < 9) fail(`phim chỉ dài ${r3.dai}s — nghi là tệp cụt`);
  else pass(`phim chạy thật: nhích ${r3.tang} lần, tới ${r3.dinh}s / ${r3.dai}s, vol ${r3.vol}, muted ${r3.tat}`);

  // ── ⑥a nhạc nền bị hạ trong lúc chiếu ────────────────────────────────────
  const r6a = await p.evaluate(() => AudioSys.bgm
    ? { co:true, giam: AudioSys.bgm.volume < AudioSys.bgmVol() - 1e-6,
        v:+AudioSys.bgm.volume.toFixed(3), day:+AudioSys.bgmVol().toFixed(3) }
    : { co:false });

  // ── ④ bấm bỏ qua: chỉ bỏ PHIM ────────────────────────────────────────────
  await p.keyboard.press('Space');
  await p.waitForTimeout(150);
  const r4 = await p.evaluate(() => {
    const v = document.getElementById('ku-phim');
    return { anPhim: !v || v.classList.contains('hidden'),
             conPhu: !document.getElementById('gacha-wrap').classList.contains('hidden'),
             pha: window.__kuTrangThai().pha, tron: window.__kuTrangThai().phimTron,
             dung: !v || v.paused };
  });
  console.log('④', JSON.stringify(r4));
  if (!r4.anPhim || !r4.dung) fail('bấm bỏ qua mà phim vẫn chạy');
  else if (!r4.conPhu) fail('bấm bỏ qua lúc đang chiếu lại nuốt luôn cả cú quay — phải chỉ bỏ phim');
  // ⑧ nửa BỎ QUA: chưa xem nhịp nổ thì phải vẽ lại nó. Thiếu vế này thì cách "sửa" dễ nhất —
  // lúc nào cũng nhảy sang 'hien' — vẫn xanh, và người bấm bỏ qua ở giây đầu mất sạch nhịp nổ.
  else if (r4.pha !== 'comet') fail(`bỏ qua giữa chừng mà nhịp sau là '${r4.pha}' — chưa xem nổ thì phải vẽ lại 'comet'`);
  else if (r4.tron) fail('bỏ qua giữa chừng mà _kuPhimTron vẫn bật — cờ đang nói dối');
  else pass("bỏ qua lúc đang chiếu: tắt phim, cú quay chạy tiếp sang 'comet'");

  // ── ⑥b nhạc nền được TRẢ LẠI ─────────────────────────────────────────────
  const r6b = await p.evaluate(() => AudioSys.bgm
    ? { tra: Math.abs(AudioSys.bgm.volume - AudioSys.bgmVol()) < 1e-6,
        v:+AudioSys.bgm.volume.toFixed(3) } : { tra:null });
  console.log('⑥', JSON.stringify({ ...r6a, ...r6b }));
  if (!r6a.co) console.log('    (bỏ qua ⑥: không có nhạc nền đang phát trong cảnh dựng)');
  else if (!r6a.giam) fail(`chiếu phim mà nhạc nền không hạ (${r6a.v} / ${r6a.day})`);
  else if (!r6b.tra) fail(`hết phim mà nhạc nền không trả lại (${r6b.v} / ${r6a.day}) — câm hết phiên`);
  else pass(`nhạc nền hạ ${r6a.v} rồi trả lại ${r6b.v}`);

  // ── ⑤ phim hết thì TỰ sang 'comet' ───────────────────────────────────────
  await p.evaluate(() => { try { kuBoQua(); kuBoQua(); } catch(e){} });
  await p.waitForTimeout(300);
  await p.evaluate(() => { chiState().ve.gk = 50; window.kheUocQuay('gk', 1); });
  await p.waitForTimeout(600);
  // Chạy nhanh 16× thay vì chờ 10,7 giây thật, và ⚠ KHÔNG tua bằng currentTime: máy chủ tĩnh
  // của bộ kiểm (python3 -m http.server) không trả HTTP Range, nên phép gán currentTime bị bỏ
  // qua TRONG IM LẶNG — đo được là clip cứ chạy tiếp từ đầu, và mục này đỏ vì một lý do chẳng
  // liên quan gì tới thứ nó định gác. playbackRate thì không cần Range, và vẫn đi đúng đường
  // 'ended' thật.
  const r5 = await p.evaluate(async () => {
    const v = document.getElementById('ku-phim');
    if (!v || v.classList.contains('hidden')) return { dungCanh:false };
    v.muted = true; v.playbackRate = 16;
    const het = Date.now() + 9000;
    let banGiao = null;
    // Gom MỌI nhịp đi qua, không chỉ nhịp lúc thoát vòng: 'comet' dài 1,15s và 'no' 0,42s nên
    // nhịp lấy mẫu 60ms bắt được cả hai. Hỏi mỗi nhịp-lúc-thoát thì một lượt lấy mẫu chậm là
    // bỏ lọt đúng thứ cần bắt.
    const daQua = new Set();
    while (Date.now() < het && !v.classList.contains('hidden')){
      const _p = window.__kuTrangThai().pha; if (_p) daQua.add(_p);
      await new Promise(r => setTimeout(r, 60));
    }
    banGiao = window.__kuTrangThai().pha;
    for (let i = 0; i < 12; i++){ const _p = window.__kuTrangThai().pha; if (_p) daQua.add(_p); await new Promise(r => setTimeout(r, 60)); }
    return { dungCanh:true, ended: v.ended, t:+v.currentTime.toFixed(2),
             anPhim: v.classList.contains('hidden'), banGiao,
             tron: window.__kuTrangThai().phimTron, daQua:[...daQua],
             conPhu: !document.getElementById('gacha-wrap').classList.contains('hidden') };
  });
  console.log('⑤', JSON.stringify(r5));
  if (!r5.dungCanh) fail('dựng cảnh ⑤ hỏng: cú quay thứ hai không vào nhịp phim');
  else if (!r5.ended) fail(`dựng cảnh ⑤ hỏng: clip chưa chạy tới hết (t=${r5.t}) — mục này đang chấm một cảnh khác`);
  else if (!r5.anPhim) fail('phim chạy hết mà không tự tắt — lớp phủ treo đen, mất cả cú quay');
  else if (!r5.conPhu) fail('phim hết mà lớp phủ đóng luôn — phải sang nhịp báo phẩm');
  // ⑧ nửa XEM TRỌN: clip vừa chiếu xong nhịp nổ + chớp trắng, kể lại là lặp.
  else if (r5.banGiao !== 'hien') fail(`xem hết clip mà nhịp sau là '${r5.banGiao}' — clip đã nổ + chớp trắng rồi, phải sang thẳng 'hien'`);
  else if (!r5.tron) fail('xem hết clip mà _kuPhimTron không bật — hào quang 5★ sẽ bù nhầm 0,42s của nhịp nổ không hề chạy');
  else if (r5.daQua.includes('comet') || r5.daQua.includes('no'))
    fail(`xem hết clip rồi vẫn đi qua ${r5.daQua.filter(x => x==='comet'||x==='no').join('+')} — lặp lại nhịp nổ của chính clip`);
  else pass(`phim chạy hết thì sang thẳng 'hien', không kể lại nhịp nổ (đi qua: ${r5.daQua.join(' → ')})`);

  await p.evaluate(() => { try { kuBoQua(); kuBoQua(); } catch(e){} });

  // ── ⑦ ?test=1 VẪN chiếu — link chơi thử của chủ dự án ────────────────────
  // Cửa tắt phim hỏi `TEST_MODE && !TEST_URL`, nên nó chỉ tắt khi BÀI KIỂM tự đặt cờ. Vào bằng
  // ?test=1 là một con người mở link chơi thử và họ phải thấy đúng thứ người chơi thấy.
  // ⚠ Mục này TỰ KIỂM CẢNH DỰNG trước khi chấm: đòi TEST_MODE phải THẬT SỰ bật ở trang này,
  // nếu không thì "có chiếu phim" là xanh vì một lý do chẳng liên quan gì tới cái cờ.
  const p7 = await b.newPage({ viewport:{ width:1100, height:800 } });
  await p7.goto('http://localhost:' + PORT + '/index.html?test=1');
  await p7.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p7.waitForTimeout(400);
  const r7 = await p7.evaluate(() => {
    startGame('thieulam', null);
    player.level = 20; player.lvPeak = 20; calcDerived();
    chiState().ve.gk = 50; window.kheUocQuay('gk', 1);
    const v = document.getElementById('ku-phim');
    return { tm: !!window.TEST_MODE, turl: !!window.TEST_URL,
             hien: !!v && !v.classList.contains('hidden'),
             pha: window.__kuTrangThai().pha,
             phu: !document.getElementById('gacha-wrap').classList.contains('hidden') };
  });
  await p7.evaluate(() => { try { kuBoQua(); kuBoQua(); } catch(e){} });
  console.log('⑦', JSON.stringify(r7));
  if (!r7.tm || !r7.turl) fail(`dựng cảnh ⑦ hỏng: ?test=1 mà TEST_MODE=${r7.tm} TEST_URL=${r7.turl} — mục này không gác gì`);
  else if (!r7.phu) fail('dựng cảnh ⑦ hỏng: kheUocQuay không mở được lớp phủ');
  else if (!r7.hien) fail('?test=1 mà KHÔNG chiếu phim — link chơi thử phải thấy đúng thứ người chơi thấy');
  else pass('?test=1: TEST_MODE bật mà phim vẫn chiếu');
  await p7.close();

  if (errs.length) { console.log('LỖI TRANG:', errs.slice(0,5).join(' | ')); bad++; }
  console.log(bad ? `\n✖ ${bad} lỗi` : '\n✔ tất cả xanh');
  await b.close(); process.exit(bad ? 1 : 0);
})();
