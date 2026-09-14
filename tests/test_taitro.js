// MÀN TẢI — thanh tiến độ phải TRUNG THỰC, và không bao giờ được nhốt người chơi lại.
//
// Vì sao có bài này: dự án đã gỡ một thanh giả rồi ("Tiếp nhận 28%…82%" ở màn chọn máy chủ),
// lý do ghi ngay trên SERVERS trong game.js — một con số bịa mà trông như số thật là thứ người
// ta bắt được trong ba mươi giây. Một thanh tải chạy theo setTimeout là đúng con vật đó, mọc
// lại ở màn khác. Bài này khoá ba thứ:
//
//   1. Bản kê data/taitro.js phải KHỚP ĐĨA. Lệch một byte là thanh nói dối, mà lệch kiểu đó
//      không ai phát hiện được bằng mắt — nó chỉ làm thanh về đích sớm hoặc muộn.
//   2. Nhóm "Axie đại diện" phải ĐÚNG BẰNG Object.values(AVA_MAC_DINH). Công cụ sinh bản kê
//      đọc bảng đó từ game.js bằng regex; regex mà trượt thì nó im lặng sinh ra một danh sách
//      khác. Đây là chỗ duy nhất bắt được.
//   3. Một tấm art 404 KHÔNG được giữ màn tải lại. Nếu giữ, lỗi art biến thành lỗi không vào
//      được game — và vì `__gameReady` bật ở cuối màn tải nên 177 bài kia sẽ TREO chứ không đỏ.
const { chromium } = require('playwright');
let bad = 0; const fail = m => { bad++; console.log('FAIL ' + m); };
const URL = 'http://localhost:8853/index.html';

(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });

  // ── 1) Bản kê khớp đĩa ────────────────────────────────────────────────────
  {
    const p = await b.newPage();
    await p.goto(URL, { waitUntil:'domcontentloaded' });
    const M = await p.evaluate(() => window.TAI_TRO);
    if (!M || !M.nhom || !M.nhom.length) fail('không có window.TAI_TRO');
    else {
      let tong = 0, n = 0, lech = [];
      for (const nh of M.nhom) for (const [duong, byte] of nh.tep){
        n++; tong += byte;
        const r = await p.request.get('http://localhost:8853/' + duong);
        if (!r.ok()){ lech.push(duong + ' → HTTP ' + r.status()); continue; }
        const that = (await r.body()).length;
        if (that !== byte) lech.push(`${duong}: bản kê ${byte} ≠ đĩa ${that}`);
      }
      console.log(`1) bản kê: ${n} tệp, ${(tong/1024).toFixed(0)} KB`);
      if (lech.length) fail('bản kê lệch đĩa (chạy lại tools/title/liet_ke_taitro.cjs):\n   ' + lech.join('\n   '));
      if (M.tong !== tong) fail(`TAI_TRO.tong = ${M.tong} nhưng cộng từng tệp ra ${tong}`);
      if (n < 15) fail(`bản kê chỉ có ${n} tệp — màn chờ kéo về nhiều hơn thế, ai đó đã cắt bớt`);
    }

    // ── 2) Nhóm Axie = đúng bảng AVA_MAC_DINH đang chạy ─────────────────────
    const r2 = await p.evaluate(() => {
      const nh = (window.TAI_TRO.nhom || []).find(x => x.id === 'axie');
      const ke = nh ? nh.tep.map(t => t[0].replace(/^.*\/|\.webp$/g, '')).sort() : null;
      const that = [...new Set(Object.values(window.AVA_MAC_DINH || {}))].sort();
      return { ke, that };
    });
    console.log('2) Axie trong bản kê:', JSON.stringify(r2.ke), '· AVA_MAC_DINH:', JSON.stringify(r2.that));
    if (!r2.that || !r2.that.length) fail('không đọc được AVA_MAC_DINH từ trang (cần window.AVA_MAC_DINH)');
    else if (JSON.stringify(r2.ke) !== JSON.stringify(r2.that))
      fail('nhóm "Axie đại diện" trong bản kê KHÁC AVA_MAC_DINH — bản kê đã thành bản sao thứ hai');
    await p.close();
  }

  // ── 3) Thanh chạy theo BYTE, và chỉ xong khi tải xong thật ────────────────
  {
    const p = await b.newPage({ viewport:{width:1100,height:760} });
    // Ghìm art lại vài trăm mili giây để bắt được trạng thái GIỮA CHỪNG. Không ghìm thì trên
    // máy chủ cục bộ mọi thứ về trong một khung và không đo được gì.
    await p.route('**/assets/title/lop/*.webp', async r => {
      await new Promise(k => setTimeout(k, 700)); await r.continue();
    });
    await p.goto(URL, { waitUntil:'domcontentloaded' });
    await p.waitForTimeout(450);
    const giua = await p.evaluate(() => ({
      hien: !document.getElementById('preload').classList.contains('tat'),
      pct:  parseInt((document.getElementById('pl-pct') || {}).textContent) || 0,
      byte: (document.getElementById('pl-byte') || {}).textContent || '',
      san:  !!window.__gameReady,
      nap:  !!window.__manDaNap,
    }));
    console.log('3) giữa chừng:', JSON.stringify(giua));
    // Hai cờ, hai nghĩa, và chúng phải TÁCH RA: `__manDaNap` = module đã nạp hết (hết vùng
    // chết TDZ, gọi startGame được), `__gameReady` = thêm cả "art màn chờ đã đủ". Gộp lại thì
    // mất một trong hai nghĩa, mà mỗi nghĩa đang có người dùng.
    if (!giua.nap) fail('__manDaNap chưa bật trong lúc màn tải đang chạy — module lẽ ra đã nạp xong từ trước');
    if (!giua.hien) fail('màn tải đã biến mất trong lúc art còn bị ghìm');
    if (giua.pct >= 100) fail('thanh đã 100% trong lúc 5 dải khung lớp còn chưa về — thanh không đo art');
    if (giua.san) fail('__gameReady bật trước khi màn tải xong — 177 bài kia sẽ bấm vào một màn còn bị che');
    // Tổng phải là tổng THẬT của bản kê, không phải một con số tròn trịa nào đó.
    const tongMB = await p.evaluate(() => (window.TAI_TRO.tong / 1048576).toFixed(2).replace('.', ','));
    if (!giua.byte.includes(tongMB)) fail(`dòng byte "${giua.byte}" không mang tổng thật ${tongMB} MB`);

    await p.waitForFunction(() => window.__gameReady, null, { timeout:20000 })
           .catch(() => fail('__gameReady không bao giờ bật'));
    await p.waitForTimeout(700);
    const sau = await p.evaluate(() => ({
      tat:  document.getElementById('preload').classList.contains('tat'),
      pct:  parseInt((document.getElementById('pl-pct') || {}).textContent) || 0,
      vao:  !document.getElementById('intro-story').classList.contains('hidden')
            || !document.getElementById('sect-select').classList.contains('hidden'),
    }));
    console.log('   xong:', JSON.stringify(sau));
    if (sau.pct !== 100) fail(`tải xong mà thanh dừng ở ${sau.pct}%`);
    if (!sau.tat) fail('màn tải không tắt sau khi xong');
    if (!sau.vao) fail('tải xong mà không vào màn nào — người chơi nhìn một trang trống');
    await p.close();
  }

  // ── 4) Art 404 KHÔNG được nhốt người chơi lại ─────────────────────────────
  {
    const p = await b.newPage();
    await p.route('**/assets/title/lunacia/mountain.webp', r => r.fulfill({ status:404, body:'' }));
    await p.goto(URL, { waitUntil:'domcontentloaded' });
    let ok = true;
    await p.waitForFunction(() => window.__gameReady, null, { timeout:20000 }).catch(() => { ok = false; });
    console.log('4) một tấm 404 → __gameReady:', ok);
    if (!ok) fail('một tấm art 404 giữ màn tải lại vĩnh viễn — lỗi art thành lỗi không vào được game');
    await p.close();
  }

  // ── 5) startGame đóng màn tải, dù gọi thẳng ───────────────────────────────
  {
    const p = await b.newPage();
    await p.goto(URL, { waitUntil:'load' });
    await p.waitForFunction(() => window.__gameReady, null, { timeout:20000 }).catch(()=>{});
    await p.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', null); });
    await p.waitForTimeout(250);
    const tat = await p.evaluate(() => document.getElementById('preload').classList.contains('tat'));
    console.log('5) startGame → màn tải tắt:', tat);
    if (!tat) fail('startGame không đóng màn tải — lớp phủ nằm đè lên game');
    await p.close();
  }

  // ── 6) `?sect=` tự vào game SONG SONG với màn tải — màn chờ không được bật đè lên ──
  //
  // Đường này gọi startGame trong một setTimeout đăng ký SAU setTimeout của màn tải, nên game
  // khởi động trong lúc màn tải còn đang chờ ảnh. Nếu hoanTat() sau đó vẫn chạy tiếp thì nó gọi
  // vaoManDau() và dựng màn chờ ĐÈ LÊN GAME ĐANG CHẠY — người chơi đang đứng trong bản đồ thì
  // bị ném về màn chọn nhân vật sau chừng một giây, không có lỗi nào ném ra.
  {
    const p = await b.newPage({ viewport:{width:1100,height:760} });
    await p.goto(URL + '?test=1&sect=thieulam', { waitUntil:'load' });
    let ok = true;
    await p.waitForFunction(() => window.__gameReady, null, { timeout:20000 }).catch(() => { ok = false; });
    if (!ok) fail('`?sect=` tự vào game nhưng __gameReady không bao giờ bật');
    await p.waitForTimeout(2500);   // qua hẳn mốc màn tải lẽ ra xong
    const r6 = await p.evaluate(() => ({
      trongGame: !document.getElementById('hud').classList.contains('hidden'),
      manCho:    !document.getElementById('sect-select').classList.contains('hidden'),
      intro:     !document.getElementById('intro-story').classList.contains('hidden'),
      tat:       document.getElementById('preload').classList.contains('tat'),
    }));
    console.log('6) `?sect=` tự vào game:', JSON.stringify(r6));
    if (!r6.trongGame) fail('`?sect=` không vào được game');
    if (r6.manCho) fail('màn chờ bật ĐÈ LÊN game đang chạy sau khi màn tải xong');
    if (r6.intro)  fail('trang dẫn truyện bật đè lên game đang chạy sau khi màn tải xong');
    if (!r6.tat)   fail('màn tải còn nằm đè lên game');
    await p.close();
  }

  await b.close();
  console.log(bad ? `\n${bad} LỖI` : '\nOK — màn tải trung thực và không nhốt ai lại');
  process.exit(bad ? 1 : 0);
})();
