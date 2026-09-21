// BẢN CHƠI THỬ — người thật vào production là MAX CẤP + FULL TÀI NGUYÊN.
//
// Chủ dự án chốt: mở http://14.225.204.107/ là cảm được game ngay, không phải cày 3 giờ tới cấp
// 60 mới thấy hệ thống nào mở ra. Máy làm việc đó vốn đã có (`applyTestBoost`), chỉ là nó nấp
// sau `?max=1`.
//
// Ba mệnh đề, và ② mới là mệnh đề đắt nhất:
//
//  ① NGƯỜI THẬT (navigator.webdriver false) → cấp MAX_LV, đủ tài nguyên, mọi cổng tiến trình mở.
//  ② MÁY LÁI (navigator.webdriver true — mọi phiên Playwright) → KHÔNG boost. Thiếu cửa này là
//     38 bài goto('/index.html') trơn rồi gọi thẳng startGame (test_points · test_walkrun ·
//     test_inv · test_lopdo · test_migration…) đột nhiên đo một nhân vật cấp 120 full BiS, và
//     CẢ BỘ CÂN BẰNG đổi mốc trong im lặng. Đó là kiểu hỏng không ném lỗi và không ai thấy.
//  ③ `?thuong=1` → đường LUI về đoạn mở đầu thật. Không có nó thì trên production không còn
//     cách nào xem lại phát-bộ-khởi-đầu / hướng dẫn tân thủ / chuỗi nhiệm vụ từ ô số 1.
//
// ⚠ Bài này CHẠY DƯỚI PLAYWRIGHT nên `navigator.webdriver` vốn là true. Muốn dựng cảnh "người
// thật" thì phải đè nó bằng addInitScript TRƯỚC khi trang nạp — và mục ② tự kiểm rằng ở trang
// KHÔNG đè thì nó thật sự là true, nếu không thì ② xanh vì một lý do chẳng liên quan gì tới cửa.
const { chromium } = require('playwright');
const PORT = process.argv[2] || '8853';
const URL = 'http://localhost:' + PORT + '/index.html';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  let bad = 0; const fail = m => { console.log('FAIL', m); bad++; };
  const pass = m => console.log('PASS', m);

  // mở một trang, tuỳ chọn giả làm NGƯỜI THẬT, rồi tạo nhân vật mới và đọc trạng thái
  async function vao({ nguoi, qs }) {
    const p = await b.newPage({ viewport: { width: 1100, height: 800 } });
    if (nguoi) await p.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false, configurable: true });
    });
    await p.goto(URL + (qs || ''));
    await p.waitForFunction(() => window.__gameReady).catch(() => {});
    await p.waitForTimeout(300);
    const r = await p.evaluate(() => {
      try { localStorage.clear(); } catch { /* chặn dữ liệu trang — bỏ qua */ }
      startGame('thieulam', null);
      return {
        wd: navigator.webdriver,
        lv: player.level, dinh: (typeof lvPeak === 'function' ? lvPeak() : player.lvPeak) || 0,
        bac: player.silver || 0, shard: player.shard || 0, khi: player.khi || 0,
        oDo: Object.keys(player.equip || {}).filter(k => player.equip[k]).length,
        than: Object.keys((chiState().co) || {}).length,
        cong: !!player.mongChiTon,          // cổng Đại Thành — moHetCong() mở
        nv: typeof questIdx === 'number' ? questIdx : -1,
      };
    });
    await p.close();
    return r;
  }

  // ── ① người thật: max ────────────────────────────────────────────────────
  const r1 = await vao({ nguoi: true });
  console.log('①', JSON.stringify(r1));
  const MAXLV = 120;
  if (r1.wd !== false) fail(`dựng cảnh ① hỏng: đè navigator.webdriver không ăn (còn ${r1.wd}) — mục này không gác gì`);
  else if (r1.lv < MAXLV) fail(`người thật vào mà chỉ cấp ${r1.lv} — phải là ${MAXLV}`);
  else if (r1.bac < 100000) fail(`người thật vào mà chỉ có ${r1.bac} Lumen — chưa "full tài nguyên"`);
  else if (r1.shard < 99) fail(`Shard mới ${r1.shard} — Quầy Shard là một hệ, phải mua thử được`);
  else if (r1.than < 16) fail(`mới ${r1.than}/16 thân Axie — Khế Ước là tính năng đầu bảng, phải cắm thử được cả bộ`);
  else if (!r1.cong) fail('cổng tiến trình chưa mở: Đại Thành vẫn khoá, năm map cuối vẫn "???"');
  else pass(`người thật: cấp ${r1.lv} · ${r1.bac} Lumen · ${r1.shard} Shard · ${r1.than} thân · ${r1.oDo} ô đồ · cổng mở`);

  // ── ② máy lái: KHÔNG boost ───────────────────────────────────────────────
  const r2 = await vao({ nguoi: false });
  console.log('②', JSON.stringify(r2));
  if (r2.wd !== true) fail(`dựng cảnh ② hỏng: Playwright mà navigator.webdriver ra ${r2.wd} — cửa phân biệt không còn đúng, ĐỌC LẠI trước khi tin bất kỳ bài nào`);
  else if (r2.lv >= MAXLV) fail(`máy lái mà vẫn boost (cấp ${r2.lv}) — 38 bài gọi startGame trơn sẽ đo nhân vật full BiS, cả bộ cân bằng đổi mốc trong im lặng`);
  else if (r2.bac >= 100000) fail(`máy lái mà vẫn phát ${r2.bac} Lumen`);
  else pass(`máy lái: cấp ${r2.lv} · ${r2.bac} Lumen — không boost, bộ cân bằng an toàn`);

  // ── ③ ?thuong=1: đường lui ───────────────────────────────────────────────
  const r3 = await vao({ nguoi: true, qs: '?thuong=1' });
  console.log('③', JSON.stringify(r3));
  if (r3.wd !== false) fail('dựng cảnh ③ hỏng: đè webdriver không ăn');
  else if (r3.lv >= MAXLV) fail('?thuong=1 mà vẫn max — mất đường xem lại đoạn mở đầu thật');
  else pass(`?thuong=1: cấp ${r3.lv} — vẫn vào được đoạn mở đầu thật`);

  console.log(bad ? `\n✖ ${bad} lỗi` : '\n✔ tất cả xanh');
  await b.close(); process.exit(bad ? 1 : 0);
})();
