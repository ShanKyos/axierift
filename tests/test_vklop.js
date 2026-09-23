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
//   ② vũ khí phải ĐỔI CHỖ theo khung — đứng yên là nó không dính vào tay;
//   ③ lớp nào đã có bảng cầm tay thì MỌI dòng vũ khí của lớp ấy, ở MỌI giai, phải dùng nó.
//      Chủ dự án nhìn ảnh chụp và hỏi: *"DK có đại long đao theo sau mà?"* — đúng: một cây
//      không khai trong NV_VK_LOP làm `nvVkLop` trả null, `_tkHien` bật thần khí, và một thanh
//      đại kiếm cao gần bằng người trôi lơ lửng cạnh nhân vật. Mệnh đề này quét CẢ bảng
//      WEAPON_LINES chứ không hỏi vài món mẫu.
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
    // ⚠ BỐN KHỐI MANG Ở BẢNG HAI (`q` Ngồi · `n` Bắt chuyện · `t` Dính buff · `e` Nhảy múa)
    // TRƯỚC ĐÂY KHÔNG AI ĐO. Rig cất vũ khí ở `09_Interactive`/`07_StatusEffect`/`01_Dance`
    // đúng như nó cất ở `00_Run`, mà `VK_HIEN` thì chỉ được tra ở bảng MỘT — nên bắt chuyện
    // với một NPC là cây kiếm biến mất khỏi tay, ở đúng chỗ duy nhất người chơi còn thấy lớp
    // nhân vật. Đo được trước khi vá: lớp `vk` của `n`/`t`/`e` KHÔNG CÓ MỘT ĐIỂM ẢNH NÀO.
    const khoi = [['i', false], ['w', false], ['r', false], ['a', false], ['c', false],
                  ['s', true], ['p', true], ['h', true],
                  ['q', true], ['n', true], ['t', true], ['e', true]];
    const res = {};
    for (const t of bo){
      res[t] = {};
      const H = NV_LOP_HOP[t] && NV_LOP_HOP[t].vk;
      if (!H){ res[t] = 'THIẾU hộp cắt vk'; continue; }
      for (const [kind, b2] of khoi){
        const im = nvTai(t + '_vk' + (b2 ? '2' : ''), 'webp');
        if (!im){ res[t][kind] = { loi: 'chưa nạp được bảng' }; continue; }
        const w = H[b2 ? 6 : 2], h = H[b2 ? 7 : 3];
        const oyH = H[b2 ? 5 : 1];               // gốc cắt của lớp trong ô 240x300
        const n = nvSoKhung(t, kind), moc = nvMoc(kind);
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const g = c.getContext('2d');
        const bbs = []; let trong = 0, day = -1;
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
          if (x1 < 0) trong++;
          else { bbs.push(x0 + ',' + y0 + ',' + x1 + ',' + y1);
                 if (oyH + y1 > day) day = oyH + y1; }   // đáy cây, trong hệ ô 240x300
        }
        res[t][kind] = { n, trong, khac: new Set(bbs).size, day };
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

  // ── ④ TƯ THẾ MANG KHÔNG ĐƯỢC CẮM XUỐNG ĐẤT ─────────────────────────────────────────────
  // Bản mẫu bốn-đầu-thân chỉ có MỘT tư thế mang: chuôi ở bàn tay, thân chĩa chéo xuống trước.
  // Đo được trên cả bốn gói (trục lệch dọc 44,8°–58,7°, cây dài 898–1100 trên thân cao 1166):
  // mũi cây rơi XUỐNG DƯỚI GÓT ở mọi bộ. Chủ dự án chốt *"trong thành cho vũ khí khoác lên
  // vai (kiểu khu an toàn)"*, và `VK_XOAY` dựng cây lên (xem tools/spine/nuong_nv.py).
  //
  // ⚠ Và từ đợt NHẬP-VÀO-AXIE thì đây là chỗ DUY NHẤT người chơi còn thấy lớp nhân vật: ngoài
  // thành nó đã nhập vào con Axie, nên ba khối đi-đứng này là toàn bộ thời gian nó có mặt.
  //
  // Gót nằm ở y=252 trong ô 240x300 (bộ nướng chốt: gốc bộ xương (80,212) → (120,252)).
  // Chỉ chấm ba khối ĐI-ĐỨNG: khối ra đòn thì rig tự dựng và cây quét xuống là ĐÚNG, còn
  // `q` (ngồi) thì bàn tay vốn đã sát đất. Đo được sau khi vặn: 191–200, tức còn hơn 50px hở.
  const GOT_O = 252, MANG = ['i', 'w', 'r'];
  const sau = [];
  for (const t in ra){
    if (typeof ra[t] === 'string') continue;
    for (const k of MANG){
      const v = ra[t][k];
      if (!v || v.day == null || v.day < 0) continue;
      if (v.day > GOT_O) sau.push(`${t}/${k} đáy y=${v.day} > gót ${GOT_O}`);
    }
  }
  if (sau.length)
    fail('④ vũ khí CẮM XUỐNG ĐẤT ở tư thế mang: ' + sau.join(' · ') +
         ' — xem VK_XOAY/VK_MANG trong tools/spine/nuong_nv.py');
  else pass('④ tư thế mang: ' + Object.keys(ra).filter(t => typeof ra[t] !== 'string')
              .map(t => `${t} đáy ${Math.max(...MANG.map(k => ra[t][k].day))}`).join(' · ')
            + ` (gót ${GOT_O})`);

  // ── ③ không lớp nào rơi lại về thần khí ────────────────────────────────────────────────
  const r3 = await p.evaluate(() => {
    const ra = { thieu: [], daQuet: 0, lop: Object.keys(NV_VK_LOP_LOP) };
    // ⚠ SỐ MÓN CẦN QUÉT SUY TỪ DỮ LIỆU, đừng chép cứng 63. Bản cũ chốt `< 50` đúng hồi có ba
    // lớp cầm tay; Spellblade rời sang gói `magic-runtime` (vũ khí đặt theo socket, không cần
    // bảng khung nướng sẵn) thì còn hai lớp = 42 món, và bài ĐỎ ở một chỗ chẳng hỏng gì cả.
    ra.canQuet = (window.WEAPON_LINES || [])
      .filter(L => L.slot === 'vukhi' && NV_VK_LOP_LOP[L.sect]).length * GIAI_MAX;
    const sectCu = player.sect;
    for (const L of (window.WEAPON_LINES || [])){
      if (L.slot !== 'vukhi' || !NV_VK_LOP_LOP[L.sect]) continue;
      // ⚠ `genItem` chỉ sinh vũ khí của LỚP ĐANG CHƠI. Không đổi `player.sect` thì mệnh đề này
      // chỉ quét được ba dòng của một lớp — đo được 21 món thay vì 63 — mà vẫn xanh, tức nó
      // âm thầm bỏ qua hai lớp còn lại.
      player.sect = L.sect;
      for (let giai = 1; giai <= GIAI_MAX; giai++){
        // Dựng một món THẬT của đúng dòng/giai đó rồi hỏi qua CHÍNH cửa mà vòng vẽ dùng.
        let it = null;
        for (let i = 0; i < 400 && !it; i++){
          const t = genItem(capDauGiai(giai), null, null, { slots: ['vukhi'] });
          const d = t && itemDef(t);
          if (d && d.line === L.line) it = t;
        }
        if (!it) continue;                       // dòng của lớp khác — genItem không ra được
        it.tier = giai;
        const cu = player.equip.vukhi;
        player.equip.vukhi = it;
        const co = nvVkLop(player);
        player.equip.vukhi = cu;
        ra.daQuet++;
        if (!co) ra.thieu.push(L.line + '|' + giai);
      }
    }
    player.sect = sectCu;
    return ra;
  });
  // Tự kiểm cảnh dựng: phải quét được gần hết số món SUY RA TỪ BẢNG (mỗi dòng vũ khí của một
  // lớp có bảng cầm tay × GIAI_MAX). Ít hơn hẳn là genItem đang lọc theo lớp và mệnh đề chỉ
  // quét được một phần — xanh mà không gác gì.
  if (!r3.canQuet) fail('③ không lớp nào còn bảng vũ khí cầm tay — mệnh đề hết chỗ đo');
  else if (r3.daQuet < r3.canQuet * 0.8)
    fail(`③ chỉ dựng được ${r3.daQuet} món (cần ~${r3.canQuet}) — cảnh hỏng, mệnh đề vô nghĩa`);
  else if (r3.thieu.length)
    fail(`③ ${r3.thieu.length}/${r3.daQuet} món rơi về THẦN KHÍ (vũ khí trôi lơ lửng): ` +
         r3.thieu.slice(0, 8).join(', '));
  else pass(`③ ${r3.daQuet} món của ${r3.lop.length} lớp đều cầm được trên tay`);

  if (errs.length) fail('lỗi trang: ' + errs.slice(0, 3).join(' | '));
  console.log(bad ? `\n${bad} FAIL` : '\nOK');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
