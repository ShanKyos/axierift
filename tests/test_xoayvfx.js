// XOAY TẤM DÁN THEO HƯỚNG NHÂN VẬT (`CHIEU_TRANH[*].xoay` + `spawnAtlasVfx(..., goc)`).
//
// Vì sao có tầng này: `spawnAtlasVfx` trước đây không nhận góc và vòng vẽ gọi `drawImage` trần.
// Hai atlas đang chạy không lộ ra chuyện đó vì cả hai GIÁNG XUỐNG ĐẤT (`neo:'quai'`) — một hố
// thiên thạch thì không có hướng. Nhưng quạt chém của ô 1 thì có: cắm tranh vào mà không xoay
// là chiêu luôn quét sang phải, kể cả lúc nhân vật quay trái.
//
// Bài này phải chứng minh HAI điều ngược nhau, đúng lối `test_khungquai`:
//   ① tranh KHÔNG khai `xoay` thì vẽ y như cũ — không một điểm ảnh nào đổi khi đổi hướng;
//   ② tranh CÓ khai `xoay` thì đổi thật, và xoay quanh ĐIỂM NEO chứ không quanh tâm ô.
//
// ⚠ Mọi phép so điểm ảnh làm TRONG CÙNG MỘT `evaluate`, và luôn kèm một lượt ĐỐI CHỨNG (vẽ hai
// lần y hệt nhau). Cả cảnh trôi theo `performance.now()` — mây, sóng cỏ, ánh sáng — nên hai lệnh
// `evaluate` cách nhau vài chục mili giây sẽ cho ra "99,8% điểm ảnh đổi" ở mọi trường hợp, xanh
// lẫn đỏ. Bài học đã trả giá ở `test_bongnguoi`.
const { chromium } = require('playwright');

// Tấm giả dựng lúc chạy — bài kiểm không được phụ thuộc một tệp art có thật.
// Ô 64×64, lưới 2×1, NEO LỆCH HẲN sang mép trái (anchorX 4) để §3 đo được chuyện xoay quanh neo.
const THU = { k: 1, cols: 2, rows: 1, frameW: 64, frameH: 64, frames: 2, fps: 10,
              anchorX: 4, anchorY: 32, neoR: 32 };

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('http://localhost:8853/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__gameReady).catch(() => {});
  await page.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', null); });
  await page.waitForTimeout(400);

  const r = await page.evaluate(async (THU) => {
    const ra = [];
    const ok = (t, c, ghi) => ra.push({ t, ok: !!c, ghi });

    // ── §0 HAI ATLAS THẬT KHÔNG ĐƯỢC KHAI `xoay` ────────────────────────────────────
    // Chúng giáng xuống đất. Xoay một hố thiên thạch theo hướng người niệm là nghiêng cả
    // vạch nền — và kiểu hỏng đó nhìn ra "art vẽ sai" chứ không ra "mã sai".
    for (const id in CHIEU_TRANH){
      const t = CHIEU_TRANH[id];
      if (!t.atlas) continue;
      if (t.neo === 'quai')
        ok('[' + id + '] tranh giáng xuống đất KHÔNG khai xoay', !t.xoay);
      ok('[' + id + '] atlas đã khai trong VFX_ATLAS_DEFS', !!VFX_ATLAS_DEFS[t.atlas]);
    }

    // ── dựng tấm giả: khung 0 là một ô vuông ĐẶC nằm lệch hẳn sang phải điểm neo ─────
    // Lệch hẳn sang phải là cố ý: xoay 180° thì nó phải nhảy sang TRÁI của điểm neo.
    // Vẽ một khối đặc chứ không vẽ hoa văn — §3 đo TÂM KHỐI, mà tâm khối chỉ có nghĩa
    // khi hình đặc và cân.
    const cv = document.createElement('canvas');
    cv.width = THU.cols * THU.frameW; cv.height = THU.rows * THU.frameH;
    const g = cv.getContext('2d');
    g.fillStyle = '#ffffff';
    g.fillRect(40, 26, 20, 12);          // khung 0 — cách neo (4,32) đúng 46px sang phải
    g.fillRect(64 + 40, 26, 20, 12);     // khung 1 — y hệt, để nhịp không đổi hình
    const im = new Image();
    await new Promise(res => { im.onload = res; im.src = cv.toDataURL(); });

    VFX_ATLAS_DEFS.__thu = Object.assign({}, THU);
    VFX_ATLAS_IMGS.__thu = im;

    // ── công cụ đo ───────────────────────────────────────────────────────────────────
    // Ô đo đặt quanh chân nhân vật trên MÀN HÌNH. `screen = (world − camera) × zoom`
    // (luật §7 của khối LUẬT MAP) — chép cứng toạ độ thế giới vào đây là bài đỏ ngay lần
    // đầu ai đó đổi zoom mặc định, mà lý do đỏ thì chẳng liên quan gì tới thứ nó gác.
    const z = (typeof ZOOM_MUC !== 'undefined' && typeof ZOOM_CHON !== 'undefined')
              ? ZOOM_MUC[ZOOM_CHON] : 1;
    const px = (player.x - camera.x) * z, py = (player.y - camera.y) * z;
    const R = 70, ctx2 = canvas.getContext('2d');
    const hop = [Math.round(px - R), Math.round(py - R), R * 2, R * 2];

    function chup(){ return ctx2.getImageData(hop[0], hop[1], hop[2], hop[3]).data; }
    // ⚠ SO MÀU, ĐỪNG SO ALPHA. Canvas của game đục kín (nền đất tô đặc) nên alpha là 255 ở mọi
    // điểm ảnh, mọi lượt vẽ — so alpha thì hàm này trả 0 vĩnh viễn, và cả mệnh đề lẫn ĐỐI CHỨNG
    // của nó đều xanh rỗng. Đã dẫm đúng thế ở lượt chạy đầu: "0 vs nền 0".
    // Cùng một bệnh với luật `≤60% là kill` — một cái chốt đúng ở mọi trạng thái không chốt gì.
    function khac(a, b){
      let n = 0;
      for (let i = 0; i < a.length; i += 4)
        if (Math.abs(a[i] - b[i]) + Math.abs(a[i+1] - b[i+1]) + Math.abs(a[i+2] - b[i+2]) > 12) n++;
      return n;
    }
    function veLuot(goc){
      effects.length = 0;
      spawnAtlasVfx('__thu', player.x, player.y, 1, goc);
      effects[0].t = 0;                 // ghim khung 0 — nhịp chạy theo `t`, không theo đồng hồ
      render();
      return chup();
    }

    // ⚠ TẮT AVATAR TRONG LÚC ĐO — con Axie KHÔNG phải thứ bài này gác, mà nó nằm giữa ô đo.
    // Ô đo là hộp 140×140 quanh chân nhân vật, và con Axie đứng ngay đấy. Khối thở của nó chạy
    // theo `performance.now()`, nên giữa hai lượt `veLuot` nó có thể nhích một khung — và khi
    // nhích thì nó nhích cả NGHÌN điểm ảnh. Đo được: `nenTroi` nhảy giữa **0 và 2.167** tuỳ
    // lượt, tức cùng một mã chạy tốt mà bài đỏ chừng 1/3 số lần.
    //   ⇒ Đó là NHIỄU LƯỠNG CỰC, đúng cái đã ghi trong CLAUDE.md ở mục đồng bộ đồ.
    // Và từ lúc khối thở được PHA hai khung liền nhau (nó nhích ở MỌI lượt vẽ thay vì 14%),
    // nhiễu ấy không còn là xúc xắc nữa: bài đỏ 3/3.
    // Tắt avatar rồi thì `nenTroi` về **0** ở cả ba lượt thử, còn tín hiệu vẫn 480 — tách hẳn.
    player.avatar = null;
    // Đứng yên tuyệt đối trong lúc đo: một bước chân cũng đủ làm mọi ô đo lệch.
    player.moveTarget = null; player.vx = 0; player.vy = 0;

    // ── §1 ĐỐI CHỨNG — vẽ hai lượt Y HỆT phải ra gần như y hệt ──────────────────────
    // Không có mệnh đề này thì mọi con số dưới đây vô nghĩa: nền vẫn trôi chút ít giữa hai
    // lượt, và nếu nó trôi nhiều thì "khác nhau" không chứng minh được điều gì.
    // ⚠ PHẢI LẤY TRUNG VỊ, KHÔNG LẤY MỘT CẶP — và hai nhánh đã sửa chỗ này theo HAI cách, nay
    // gộp cả hai vì chúng chữa hai tầng khác nhau của cùng một lỗi:
    //
    //   · nhánh này TẮT AVATAR (dòng trên) — gỡ hẳn nguồn nhiễu, vì con Axie nằm trọn trong ô
    //     đo 140×140 mà nó lại chẳng liên quan gì tới thứ bài này gác;
    //   · nhánh `main` lấy TRUNG VỊ — vì sàn nhiễu LƯỠNG CỰC: phần lớn cặp ra vài trăm điểm
    //     ảnh, nhưng cứ chừng mười lượt render lại có một lượt rơi trúng nhịp lật khung và vọt
    //     lên hàng nghìn. Đo được: nenTroi 2115 trong khi tín hiệu xoay chỉ 480 — nhiễu NUỐT
    //     tín hiệu, và bản lấy một cặp vì thế đỏ 2/3 lượt.
    //
    // Giữ CẢ HAI: tắt avatar đưa sàn nhiễu về 0, trung vị lo nốt phần lớp nhân vật/cỏ/ánh sáng
    // vẫn có thể nhích một nhịp. 9 mẫu thay vì 7 — rẻ, và một mẫu lẻ rơi trúng nhịp là cả bài
    // sai mốc.
    // ⚠ `trungVi` dùng ở CẢ hai chỗ: sàn nhiễu đây, và d90/d180 bên dưới. Khai một lần.
    const trungVi = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
    const _mauNen = [];
    for (let i = 0; i < 9; i++) _mauNen.push(khac(veLuot(0), veLuot(0)));
    const nenTroi = trungVi(_mauNen);
    ok('đối chứng: hai lượt vẽ y hệt nhau thì gần như không đổi',
       nenTroi < 400, nenTroi + '/' + (hop[2]*hop[3]) + ' điểm ảnh trôi · mẫu ' + _mauNen.join(','));

    // ── §2 KHÔNG KHAI `xoay` ⇒ GÓC BỊ BỎ QUA ────────────────────────────────────────
    // Đây là vế "không đổi gì cả". Chỗ gọi thật (`spawnSkillVfx`) truyền `0` khi tranh không
    // khai cờ, nên đường cũ phải nguyên vẹn.
    effects.length = 0;
    spawnAtlasVfx('__thu', player.x, player.y, 1);       // không truyền góc
    ok('không truyền góc ⇒ goc = 0', effects[0].goc === 0, String(effects[0].goc));

    // ── §3 CÓ GÓC ⇒ HÌNH ĐỔI THẬT ──────────────────────────────────────────────────
    // Tín hiệu cũng phải lấy TRUNG VỊ, không chỉ sàn nhiễu: một lượt đo đơn lẻ rơi trúng nhịp
    // lật khung sẽ được độn thêm cả nghìn điểm ảnh ⇒ XANH kể cả khi phép xoay không chạy.
    const d90m = [], d180m = [];
    for (let i = 0; i < 5; i++){
      const g0 = veLuot(0);
      d90m.push(khac(g0, veLuot(Math.PI / 2)));
      d180m.push(khac(g0, veLuot(Math.PI)));
    }
    const d90 = trungVi(d90m), d180 = trungVi(d180m);
    ok('xoay 90° đổi hình nhiều hơn hẳn nền trôi',  d90  > nenTroi * 8 && d90  > 200, d90 + ' vs nền ' + nenTroi);
    ok('xoay 180° đổi hình nhiều hơn hẳn nền trôi', d180 > nenTroi * 8 && d180 > 200, d180 + ' vs nền ' + nenTroi);

    // ── §4 XOAY QUANH ĐIỂM NEO, KHÔNG QUANH TÂM Ô ──────────────────────────────────
    // Đây là mệnh đề đáng giá nhất của cả bài. Xoay quanh tâm ô cũng làm hình ĐỔI, nên §3
    // xanh ở cả hai cách làm — chỉ phép đo này phân biệt được.
    //
    // Khối đặc nằm cách neo 46px sang PHẢI. Neo trùng chỗ nhân vật đứng. Nên:
    //   góc 0   → tâm khối ở BÊN PHẢI chỗ nhân vật;
    //   góc 180 → tâm khối ở BÊN TRÁI, lệch một khoảng BẰNG NHAU.
    // Xoay quanh tâm ô thì gốc quay lệch đi 28px (32 − 4), và hai khoảng lệch sẽ khác nhau rõ.
    function tamKhoi(buf){
      let sx = 0, sy = 0, n = 0;
      for (let y = 0; y < hop[3]; y++) for (let x = 0; x < hop[2]; x++){
        const i = (y * hop[2] + x) * 4;
        // Khối giả là TRẮNG ĐẶC và vẽ bằng cộng sáng ⇒ chỉ nó mới đủ sáng cả ba kênh.
        if (buf[i] > 245 && buf[i+1] > 245 && buf[i+2] > 245){ sx += x; sy += y; n++; }
      }
      return n ? { x: sx / n, y: sy / n, n } : null;
    }
    const t0 = tamKhoi(veLuot(0)), t180 = tamKhoi(veLuot(Math.PI));
    ok('tự kiểm cảnh dựng: tìm thấy khối ở cả hai góc',
       !!(t0 && t180 && t0.n > 30 && t180.n > 30),
       't0=' + (t0 && t0.n) + ' t180=' + (t180 && t180.n));
    if (t0 && t180){
      const tam = hop[2] / 2;                    // chỗ nhân vật đứng, trong hệ toạ độ ô đo
      const lech0 = t0.x - tam, lech180 = t180.x - tam;
      ok('góc 0 ⇒ khối nằm bên PHẢI điểm neo', lech0 > 10, lech0.toFixed(1) + ' px');
      ok('góc 180° ⇒ khối nhảy sang bên TRÁI', lech180 < -10, lech180.toFixed(1) + ' px');
      // Cùng một bán kính quay ⇒ hai khoảng lệch phải đối xứng. Sai số 6px để chừa phần
      // làm tròn của `drawImage` và bề dày nét.
      ok('hai khoảng lệch đối xứng ⇒ tâm quay ĐÚNG là điểm neo',
         Math.abs(Math.abs(lech0) - Math.abs(lech180)) < 6,
         '|' + lech0.toFixed(1) + '| vs |' + lech180.toFixed(1) + '|');
    }

    // ── §5 CỜ `xoay` LÀ CỬA DUY NHẤT ───────────────────────────────────────────────
    // Lái qua `spawnSkillVfx` thật, không gọi thẳng `spawnAtlasVfx`: chỗ dễ hỏng là sợi dây
    // nối từ bảng khai tới lời gọi, không phải phép xoay.
    CHIEU_TRANH.__thuchieu = { atlas: '__thu' };                  // chưa khai xoay
    effects.length = 0;
    spawnSkillVfx('__thuchieu', { color: '#fff' }, 'cone', 1.234, 32);
    const e1 = effects.find(e => e.type === 'atlasVfx');
    ok('chưa khai `xoay` ⇒ spawnSkillVfx truyền góc 0', !!e1 && e1.goc === 0, e1 && String(e1.goc));

    CHIEU_TRANH.__thuchieu.xoay = true;                            // khai xoay
    effects.length = 0;
    spawnSkillVfx('__thuchieu', { color: '#fff' }, 'cone', 1.234, 32);
    const e2 = effects.find(e => e.type === 'atlasVfx');
    ok('khai `xoay` ⇒ góc đi đúng tham số `ang` của lời gọi',
       !!e2 && Math.abs(e2.goc - 1.234) < 1e-9, e2 && String(e2.goc));

    // Góc phải đến từ THAM SỐ, không phải từ `player.face` — hai thứ đó thường bằng nhau,
    // nên chỉ phép thử này mới tách được chúng ra.
    player.face = -2.0;
    effects.length = 0;
    spawnSkillVfx('__thuchieu', { color: '#fff' }, 'cone', 0.5, 32);
    const e3 = effects.find(e => e.type === 'atlasVfx');
    ok('góc đọc từ tham số `ang`, KHÔNG đọc thẳng player.face',
       !!e3 && Math.abs(e3.goc - 0.5) < 1e-9, e3 && String(e3.goc));

    delete CHIEU_TRANH.__thuchieu;
    delete VFX_ATLAS_DEFS.__thu;
    delete VFX_ATLAS_IMGS.__thu;
    effects.length = 0;
    return ra;
  }, THU);

  let xau = 0;
  for (const m of r){
    if (!m.ok) xau++;
    console.log((m.ok ? '  ok  ' : 'FAIL  ') + m.t + (m.ghi ? '   [' + m.ghi + ']' : ''));
  }
  if (errors.length){ xau++; console.log('FAIL  lỗi trang: ' + errors.join(' | ')); }
  console.log('\n' + (r.length - xau) + '/' + r.length + ' xanh');
  await browser.close();
  process.exit(xau ? 1 : 0);
})();
