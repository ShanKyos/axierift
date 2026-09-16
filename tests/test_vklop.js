// CÂY VŨ KHÍ CẦM TAY PHẢI ĐI THEO BÀN TAY — không phải một cái nhãn dán
//
// Chủ dự án: *"Tư thế cầm cung sai, hãy nghiên cứu và chỉnh lại cách cầm cung cho đúng.
// Tương tự hãy check lại với kiếm của dk và spellblade"*. Truy ra một lỗi của BỘ NƯỚNG, và nó
// làm hỏng cả ba bộ cùng một kiểu:
//
// Trong bản mẫu bốn-đầu-thân, cây vũ khí KHÔNG treo trên xương bàn tay. Nó treo trên xương
// `武器` mà cha là `root` — tức đứng yên tuyệt đối — và thứ đưa nó vào tay là hai RÀNG BUỘC
// BIẾN HÌNH (`左手持剑` / `右手持剑`, đích là `左手持剑点` / `右手持剑点`). Bộ nướng chưa cài
// ràng buộc biến hình, nên cây vũ khí nằm nguyên ở tư thế gốc trong khi cánh tay vung.
//
// Đo được TRƯỚC khi sửa: lớp `vk` của cả ba bộ có **ĐÚNG MỘT** vị trí hộp bao trên MỌI khối —
// kể cả khối ĐÁNH 16 khung — trong khi lớp tay `t2` có 16 vị trí khác nhau. Và hai hàng cuối
// (32 ô khối CHẠY) thì RỖNG TRẮNG: rig cất vũ khí đi trong `00_Run`.
//
// Bài này đo đúng hai thứ đó, trên CHÍNH bảng khung mà game nạp:
//   ① không khối nào có khung TRỐNG — cây vũ khí không được biến mất;
//   ② vũ khí phải ĐỔI CHỖ theo khung — đứng yên là nó không dính vào tay.
//
// ⚠ Đo HỘP BAO, không đo điểm ảnh: hai khung liền nhau của một cây kiếm đang vung khác nhau
// hàng nghìn điểm ảnh vì lý do chính đáng, còn một cái nhãn dán thì khác 0. Hộp bao tách hai
// trường hợp ấy bằng một con số đọc được.
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1000, height: 700 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  let bad = 0;
  const fail = m => { bad++; console.log('FAIL ' + m); };
  const pass = m => console.log('PASS ' + m);

  await p.goto('http://localhost:8853/index.html', { waitUntil: 'networkidle' });
  await p.waitForFunction(() => window.__gameReady).catch(() => {});
  await p.evaluate(() => { window.TEST_MODE = true; startGame('toanchan', null); });
  await p.waitForTimeout(3000);

  const ra = await p.evaluate(async () => {
    // Bộ nào có lớp vũ khí CẦM TAY thì suy thẳng từ bảng, đừng chép tay: thêm một bộ mới là
    // bài kiểm tự gác luôn, không phải nhớ sửa ở hai chỗ.
    const bo = [...new Set(Object.values(NV_VK_LOP))];
    for (const t of bo){ nvTai(t + '_vk', 'webp'); nvTai(t + '_vk2', 'webp'); }
    await new Promise(r => setTimeout(r, 3000));
    const khoi = [['i', false], ['w', false], ['r', false], ['a', false], ['c', false],
                  ['s', true], ['p', true], ['h', true]];
    const res = {};
    for (const t of bo){
      res[t] = {};
      const H = NV_LOP_HOP[t] && NV_LOP_HOP[t].vk;
      if (!H){ res[t] = 'THIẾU hộp cắt vk'; continue; }
      for (const [kind, b2] of khoi){
        const im = nvTai(t + '_vk' + (b2 ? '2' : ''), 'webp');
        if (!im){ res[t][kind] = { loi: 'chưa nạp được bảng' }; continue; }
        const w = H[b2 ? 6 : 2], h = H[b2 ? 7 : 3];
        const n = nvSoKhung(t, kind), moc = nvMoc(kind);
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const g = c.getContext('2d');
        const bbs = []; let trong = 0;
        for (let i = 0; i < n; i++){
          const k = moc + i;
          g.clearRect(0, 0, w, h);
          g.drawImage(im, (k % NV_COT) * w, ((k / NV_COT) | 0) * h, w, h, 0, 0, w, h);
          const d = g.getImageData(0, 0, w, h).data;
          let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
          for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y*w+x)*4+3] > 40){
            if (x < x0) x0 = x; if (x > x1) x1 = x;
            if (y < y0) y0 = y; if (y > y1) y1 = y;
          }
          if (x1 < 0) trong++; else bbs.push(x0 + ',' + y0 + ',' + x1 + ',' + y1);
        }
        res[t][kind] = { n, trong, khac: new Set(bbs).size };
      }
    }
    return res;
  });

  const BANG1 = ['i', 'w', 'r', 'a', 'c'];
  let soBo = 0;
  for (const t in ra){
    if (typeof ra[t] === 'string'){ fail(`${t}: ${ra[t]}`); continue; }
    soBo++;
    for (const kind in ra[t]){
      const v = ra[t][kind];
      if (v.loi){ fail(`${t}/${kind}: ${v.loi}`); continue; }
      // ① không khung nào trống
      if (v.trong) fail(`① ${t}/${kind}: ${v.trong}/${v.n} khung KHÔNG CÓ vũ khí — ` +
                        'rig cất vũ khí trong khối đó, bộ nướng phải ép nó hiện lại (xem VK_HIEN)');
      // ② phải đổi chỗ theo khung
      const san = BANG1.includes(kind) ? Math.ceil(v.n / 2) : 2;
      if (v.khac < san)
        fail(`② ${t}/${kind}: chỉ ${v.khac}/${v.n} vị trí khác nhau (cần ≥${san}) — ` +
             'cây vũ khí đứng yên trong lúc tay vung, tức ràng buộc biến hình chưa chạy');
    }
  }
  if (!soBo) fail('không bộ nào có lớp vũ khí cầm tay — NV_VK_LOP rỗng?');
  else if (!bad) pass(`${soBo} bộ có lớp vũ khí cầm tay, mọi khối đều đủ khung và có chuyển động`);
  for (const t in ra) if (typeof ra[t] !== 'string')
    console.log('  ' + t + ': ' + BANG1.map(k => `${k}=${ra[t][k].khac}/${ra[t][k].n}`).join(' '));

  if (errs.length) fail('lỗi trang: ' + errs.slice(0, 3).join(' | '));
  console.log(bad ? `\n${bad} FAIL` : '\nOK');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
