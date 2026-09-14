// Mốc sự kiện thế giới phải là MỘT KHOẢNH KHẮC TUYỆT ĐỐI, giống nhau ở mọi múi giờ.
//
// Vì sao cần một bài riêng: `test_golden` và `test_rift` đã kiểm mốc giờ từ lâu, nhưng cả hai
// đọc `getHours()` — giờ ĐỊA PHƯƠNG — và máy chạy bộ kiểm để `TZ=UTC`. Ở UTC thì giờ địa phương
// BẰNG giờ UTC, nên hai bài ấy xanh y hệt nhau dù mốc có neo theo địa phương hay theo UTC.
// Chúng mù với đúng cái lỗi chúng trông như đang gác. Đo được trước khi sửa: cùng khoảnh khắc
// `2026-09-14T10:30Z` cho ra mốc Hung Thần 12:00Z ở UTC, 13:00Z ở Asia/Ho_Chi_Minh và 14:30Z ở
// Asia/Kolkata — ba người hẹn nhau đánh boss ở ba thời điểm khác nhau.
//
// Bài này lái bằng `timezoneId` của Playwright: mở nhiều ngữ cảnh trình duyệt ở nhiều múi giờ
// rồi đòi mốc trả về phải TRÙNG KHÍT tới từng mili giây. Nó đỏ ngay nếu ai đó đưa `getHours()`
// trở lại.
//
// ⚠ Mục 0 TỰ KIỂM CẢNH DỰNG trước khi chấm: chứng minh `timezoneId` thật sự có tác dụng. Thiếu
// bước đó thì nếu Playwright lặng lẽ bỏ qua tham số ấy, mọi ngữ cảnh đều là UTC, mọi con số
// trùng nhau, và bài xanh mà không kiểm được gì — đúng kiểu hỏng mà nó sinh ra để bắt.
const { chromium } = require('playwright');

const MUI_GIO = ['UTC', 'Asia/Ho_Chi_Minh', 'Asia/Kolkata', 'America/New_York',
                 'Australia/Adelaide', 'Pacific/Chatham'];

// Mốc neo cố định, KHÔNG phải Date.now(): hai ngữ cảnh mở cách nhau vài giây sẽ cho hai câu
// trả lời khác nhau một cách hợp lệ, và cái khác nhau đó sẽ bị đọc nhầm thành lỗi múi giờ.
const NEO = Date.parse('2026-09-14T10:30:00Z');
const SO_MOC = 12;

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  let bad = 0; const fail = m => { console.log('FAIL', m); bad++; };
  const errs = [];
  const ketQua = {};

  for (const tz of MUI_GIO) {
    const ctx = await b.newContext({ viewport: { width: 1024, height: 700 }, timezoneId: tz });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(tz + ': ' + String(e)));
    p.on('console', m => {
      if (m.type() === 'error' && !/404|ERR_CONNECTION|ERR_CERT/.test(m.text())) errs.push(tz + ': ' + m.text());
    });
    await p.goto('http://localhost:8853/index.html');
    await p.waitForFunction(() => window.__gameReady).catch(() => {});
    await p.waitForTimeout(500);

    ketQua[tz] = await p.evaluate(({ neo, soMoc }) => {
      window.TEST_MODE = true; startGame('thieulam', null);
      const chuoi = (nextFn) => {
        const ra = []; let t = neo;
        for (let i = 0; i < soMoc; i++) { t = nextFn(t); ra.push(t); t += 60000; }
        return ra;
      };
      const moc = {
        maton:  chuoi(matonNextBoundary),
        golden: chuoi(goldenNextBoundary),
        rift:   chuoi(riftNextBoundary),
      };
      return {
        moc,
        // map của từng mốc — mốc đúng mà map lệch thì vẫn là hai thế giới khác nhau
        mapMaton:  moc.maton.map(matonMapFor),
        mapGolden: moc.golden.map(goldenMapFor),
        // BẰNG CHỨNG múi giờ đã áp vào thật: giờ ĐỊA PHƯƠNG của cùng một mốc neo
        gioDiaPhuong: new Date(neo).getHours(),
        lechPhut: new Date(neo).getTimezoneOffset(),
      };
    }, { neo: NEO, soMoc: SO_MOC });

    await ctx.close();
  }

  // ---- 0. Tự kiểm cảnh dựng: timezoneId phải THẬT SỰ đổi được giờ địa phương ----
  const lech = [...new Set(MUI_GIO.map(tz => ketQua[tz].lechPhut))];
  console.log('lệch phút từng múi giờ:',
    JSON.stringify(Object.fromEntries(MUI_GIO.map(tz => [tz, ketQua[tz].lechPhut]))));
  if (lech.length < 4) {
    fail(`timezoneId không có tác dụng — chỉ thấy ${lech.length} độ lệch khác nhau trên ${MUI_GIO.length} múi giờ. `
       + 'Mọi khẳng định dưới đây trở nên vô nghĩa, đừng đọc chúng là "xanh".');
  }

  // ---- 1. Mốc phải TRÙNG KHÍT tới mili giây ở mọi múi giờ ----
  const chuan = ketQua['UTC'];
  for (const loai of ['maton', 'golden', 'rift']) {
    for (const tz of MUI_GIO) {
      const a = JSON.stringify(chuan.moc[loai]), c = JSON.stringify(ketQua[tz].moc[loai]);
      if (a !== c) {
        const i = chuan.moc[loai].findIndex((v, k) => v !== ketQua[tz].moc[loai][k]);
        fail(`${loai} lệch ở ${tz}: mốc #${i} là ${new Date(ketQua[tz].moc[loai][i]).toISOString()}`
           + ` trong khi UTC là ${new Date(chuan.moc[loai][i]).toISOString()}`);
      }
    }
  }

  // ---- 2. Map của từng mốc cũng phải trùng ----
  for (const k of ['mapMaton', 'mapGolden']) {
    for (const tz of MUI_GIO) {
      if (JSON.stringify(chuan[k]) !== JSON.stringify(ketQua[tz][k])) {
        fail(`${k} lệch ở ${tz}: ${JSON.stringify(ketQua[tz][k])} ≠ ${JSON.stringify(chuan[k])}`);
      }
    }
  }

  // ---- 3. Mốc rơi đúng giờ UTC đã công bố, và luôn nhảy TỚI ----
  const GIO = { maton: [0, 4, 8, 12, 16, 20], golden: [2, 6, 10, 14, 18, 22], rift: [0, 6, 12, 18] };
  for (const [loai, gio] of Object.entries(GIO)) {
    const ds = chuan.moc[loai];
    for (let i = 0; i < ds.length; i++) {
      const d = new Date(ds[i]);
      if (!gio.includes(d.getUTCHours()) || d.getUTCMinutes() !== 0 || d.getUTCSeconds() !== 0) {
        fail(`${loai} mốc #${i} = ${d.toISOString()}, không nằm trong ${JSON.stringify(gio)} giờ UTC tròn`);
      }
      if (ds[i] <= (i === 0 ? NEO : ds[i - 1])) fail(`${loai} mốc #${i} không tiến tới`);
    }
  }

  // ---- 4. Nhịp đều: Hung Thần 4h · Xâm Lăng Vàng 4h lệch pha 2h · Vực Nứt 6h ----
  const nhip = { maton: 4, golden: 4, rift: 6 };
  for (const [loai, gio] of Object.entries(nhip)) {
    const ds = chuan.moc[loai];
    const delta = [...new Set(ds.slice(1).map((v, i) => (v - ds[i]) / 3600000))];
    if (delta.length !== 1 || delta[0] !== gio) {
      fail(`${loai} nhịp ${JSON.stringify(delta)} giờ, cần đúng ${gio}`);
    }
  }
  // Lệch pha giữa hai hệ phải đúng 2 giờ — đó là thứ tạo ra "cứ 2 giờ có một sự kiện"
  const lechPha = ((chuan.moc.golden[0] - chuan.moc.maton[0]) / 3600000 % 4 + 4) % 4;
  if (lechPha !== 2) fail(`Xâm Lăng Vàng lệch pha ${lechPha}h so với Hung Thần, cần 2h`);

  console.log('mốc UTC đầu tiên:', JSON.stringify({
    maton: new Date(chuan.moc.maton[0]).toISOString(),
    golden: new Date(chuan.moc.golden[0]).toISOString(),
    rift: new Date(chuan.moc.rift[0]).toISOString(),
  }));
  console.log('errors:', JSON.stringify(errs));
  console.log(bad === 0 && errs.length === 0 ? 'PASS' : 'FAIL(' + bad + ')');
  await b.close();
  process.exit(bad === 0 && errs.length === 0 ? 0 : 1);
})();
