// NHẠC NỀN PHẢI CÓ Ở MỌI BẢN ĐỒ.
// Commit c8ac08f xoá 13 tệp nhạc với lý do "13 bản nhạc phim kiếm hiệp Hoa ngữ". Kiểm lại thì
// MƯỜI trong số đó là nhạc Axie Origins chính chủ, bị vơ nhầm — đối chiếu đường bao RMS với kho
// axieinfinity/axie-origins-asset-kit cho tương quan +1,000, lệch 0,00 giây. Game vì thế im
// lặng suốt trong lúc chơi. Bài này gác cho việc đó không lặp lại: mỗi map phải có nhạc, và
// mỗi tệp phải TẢI ĐƯỢC THẬT (khai tên trong BGM_TRACKS mà thiếu tệp thì im lặng y như cũ,
// vì _startTrack() nuốt lỗi phát).
const { chromium } = require('playwright');
const URL = 'http://localhost:8871/index.html?max=1';

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const errs = [];
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto(URL);
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.evaluate(() => localStorage.clear());
  await p.reload(); await p.waitForTimeout(900);

  const out = await p.evaluate(async () => {
    const manCho = AudioSys.bgmName;
    window.TEST_MODE = true; startGame('thieulam', { name:'Nhạc' });
    applyTestBoost(); player.tutStep = -1;
    const theoMap = {};
    for (const m of Object.keys(MAPS)){ curMap = m; AudioSys.nhacMap(m); theoMap[m] = AudioSys.bgmName; }
    curMap = 'daohoa'; AudioSys.nhacMap('daohoa');
    const ten = [...new Set([...Object.values(BGM_TRACKS), BGM_INTRO, BGM_BOSS].filter(Boolean))];
    const thieuTep = [];
    for (const n of ten){
      const ok = await fetch('assets/music/' + n + '.mp3', { method:'HEAD' }).then(r => r.ok).catch(() => false);
      if (!ok) thieuTep.push(n);
    }
    return {
      manCho,
      soMap: Object.keys(MAPS).length,
      mapKhongNhac: Object.entries(theoMap).filter(([,v]) => !v).map(([k]) => k),
      soBanKhacNhau: new Set(Object.values(BGM_TRACKS)).size,
      nhacTrum: BGM_BOSS,
      thieuTep,
      // ⚠ NÚT ♪ ĐÃ GỠ cùng khối `#mc-drop` (nút ≡ nay mở thẳng Menu Hệ Thống). Mệnh đề này
      // KHÔNG bị xoá cho xanh — nó gác một điều vẫn đúng: *có nhạc thì phải có đường chỉnh
      // nhạc, và đường đó phải ĂN THẬT*. Nay là thanh trượt 🎵 trong Cài Đặt, vốn là cửa đầy
      // đủ hơn cái nút bật/tắt cũ. Và bài này LÁI nó chứ không chỉ hỏi phần tử có tồn tại —
      // một thanh trượt có mặt mà không nối vào `SETTINGS.bgm` thì trông y hệt một cái đang
      // chạy. (Nút cũ chỉ bị hỏi `.hidden`, tức nó có thể chết mà mệnh đề vẫn xanh.)
      chinhNhac: (() => {
        closePanels(); togglePanel('settings'); window.setSetTab('chung');
        const sl = [...document.querySelectorAll('#panel-settings input[type=range]')]
          .find(r => /bgm/i.test(r.getAttribute('oninput') || ''));
        if (!sl) return { co:false };
        const truoc = SETTINGS.bgm;
        sl.value = String(truoc > 0 ? 0 : 60);
        sl.dispatchEvent(new Event('input', { bubbles:true }));
        const sau = SETTINGS.bgm;
        sl.value = String(truoc); sl.dispatchEvent(new Event('input', { bubbles:true }));
        return { co:true, doi: Number(sau) !== Number(truoc), truoc, sau };
      })(),
    };
  });

  console.log(JSON.stringify(out, null, 1));
  let bad = 0; const fail = m => { console.log('FAIL', m); bad++; };
  if (out.manCho !== 'bgm_intro') fail(`màn chờ không phát nhạc intro (${out.manCho})`);
  // Ngưỡng này chỉ để bắt PHÉP ĐO RỖNG (MAPS chưa nạp), không phải để đếm map. Trước là 10 khi
  // còn 15 map; gỡ bảy phó bản còn 9 nên nó bắt vạ oan. Đặt ở 5 — dưới ngần ấy chắc chắn là hỏng.
  if (out.soMap < 5) fail(`chỉ thấy ${out.soMap} bản đồ — phép đo rỗng`);
  if (out.mapKhongNhac.length) fail(`bản đồ không có nhạc: ${out.mapKhongNhac.join(', ')}`);
  if (out.soBanKhacNhau < 8) fail(`chỉ ${out.soBanKhacNhau} bản nhạc khác nhau — cả thế giới nghe gần như một bài`);
  if (!out.nhacTrum) fail('trận trùm không có nhạc riêng — playBgm(BGM_BOSS) đang chạy rỗng');
  if (out.thieuTep.length) fail(`khai tên trong BGM_TRACKS mà THIẾU TỆP: ${out.thieuTep.join(', ')}`);
  if (!out.chinhNhac.co) fail('có nhạc mà KHÔNG có đường nào chỉnh — nút ♪ đã gỡ thì thanh trượt 🎵 trong Cài Đặt phải là cửa thay thế');
  else if (!out.chinhNhac.doi) fail(`thanh trượt 🎵 có mặt nhưng KHÔNG ăn vào SETTINGS.bgm (${out.chinhNhac.truoc} → ${out.chinhNhac.sau}) — một cái nút chết trông y hệt một cái đang chạy`);
  console.log('errors:', JSON.stringify(errs));
  console.log(bad === 0 && errs.length === 0 ? 'PASS' : 'FAIL(' + bad + ')');
  await b.close();
  process.exit(bad === 0 && errs.length === 0 ? 0 : 1);
})();
