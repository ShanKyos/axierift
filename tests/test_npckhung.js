// NPC CÓ HOẠT ẢNH (`NPC_KHUNG`) — và bài này cố ý KHÔNG hỏi "bảng có khoá không".
//
// Một bảng thì không bao giờ hỏng; thứ hỏng là sợi dây từ bảng tới cái NPC đang đứng trên màn.
// Đó là đúng bài học đã trả giá ở `test_avatar §4` (ba khẳng định cũ xanh vì chúng chỉ đọc bảng
// `AVA_MAC_DINH`, trong khi tính năng đầu bảng của cả đợt Đổi Vai tắt ngóm với người chơi mới).
// Nên năm mệnh đề dưới đây đều LÁI `drawNpc()` thật rồi hỏi cái ô nó CHỌN.
//
// Cả năm đã thử ngược: gỡ từng cơ chế ra thì từng mệnh đề đỏ.
const { chromium } = require('playwright');
const PORT = process.argv[2] || 8853;

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__gameReady).catch(() => {});
  await page.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', null); });
  await page.waitForTimeout(400);
  await page.evaluate(() => travelTo('ardhaven'));
  // Bảng khung nạp LƯỜI. Không chờ thì mọi mệnh đề đo trúng nhánh lui-về-tranh-tĩnh và bài xanh
  // vì lý do sai — cùng cái bẫy đã ghi cho bảng CHẠY của avatar ("bước đi đầu tiên của mỗi phiên
  // rơi vào nhánh lui-về-thở").
  await page.waitForFunction(() => {
    const n = NPCS.find(x => x.id === 'ah_ronin');
    return !!(n && npcKhungCua(n));
  }, { timeout: 15000 }).catch(() => {});

  const r = await page.evaluate(() => {
    const ra = []; const ok = (t, c, ghi) => ra.push({ t, ok: !!c, ghi });
    const n = NPCS.find(x => x.id === 'ah_ronin');

    // ── §0 TỰ KIỂM CẢNH DỰNG ────────────────────────────────────────────────────────
    // Không có bước này thì §1-§4 đo trên một NPC không khai hoạt ảnh và tất cả đều xanh.
    ok('§0 cảnh dựng: ah_ronin có mặt và bảng khung đã tải xong',
       n && n.map === 'ardhaven' && !!npcKhungCua(n),
       n ? `img=${n.img} · khoá=${npcTen(n)} · tải=${!!npcKhungCua(n)}` : 'không có NPC');

    // ── §1 KHOÁ LÀ TÊN TỆP, KHÔNG PHẢI ID ───────────────────────────────────────────
    ok('§1 khoá tra theo TÊN TỆP (một tấm phục vụ được nhiều NPC)',
       npcTen(n) === 'ronin_canh' && !!NPC_KHUNG['ronin_canh'] && !NPC_KHUNG[n.id],
       `npcTen=${npcTen(n)}`);

    // ── §2 Ô THẬT SỰ ĐỔI THEO THỜI GIAN ─────────────────────────────────────────────
    // ĐO Ô, KHÔNG ĐO ĐIỂM ẢNH: hai lượt vẽ liên tiếp của một cảnh đang trôi lệch nhau hàng
    // nghìn điểm ảnh vì mây/cỏ/ánh sáng chạy theo performance.now() — bài học đã trả giá ở
    // test_dongbodo (sàn nhiễu 6.545/102.000 điểm ảnh, lớn hơn cả tín hiệu).
    const K = NPC_KHUNG['ronin_canh'];
    const tong = K.khung || K.cot * K.hang;
    const cu = performance.now;
    const thay = new Set();
    for (let i = 0; i < tong * 3; i++){
      const t = i * (1000 / (K.fps || 8));
      performance.now = () => t;
      const o = npcKhungCua(n);
      if (o) thay.add(o.H.sx + ':' + o.H.sy);
    }
    performance.now = cu;
    ok('§2 ô vẽ chạy ĐỦ mọi khung theo đồng hồ',
       thay.size === tong, `${thay.size}/${tong} ô khác nhau`);

    // ── §3 Ô NẰM TRONG BẢNG, KHÔNG TRÀN RA NGOÀI ────────────────────────────────────
    // Sai `cot`/`hang` một nấc là ô cuối rơi ra ngoài tấm ⇒ khung đó vẽ ra TRONG SUỐT, và
    // NPC chớp tắt mỗi vòng. Không lỗi nào ném ra.
    const im = npcKhAnh('ronin_canh');
    let tran = im ? null : 'không tải được bảng khung';
    for (let i = 0; im && i < tong; i++){
      const sx = (i % K.cot) * K.oRong, sy = ((i / K.cot) | 0) * K.oCao;
      if (sx + K.oRong > im.naturalWidth || sy + K.oCao > im.naturalHeight)
        tran = `khung ${i} → (${sx},${sy}) tràn khỏi ${im.naturalWidth}×${im.naturalHeight}`;
    }
    ok('§3 mọi ô nằm trọn trong bảng', !tran,
       tran || `bảng ${im.naturalWidth}×${im.naturalHeight} · ô ${K.oRong}×${K.oCao}`);

    // ── §4 TẤM LÙI PHẢI CÓ THẬT ─────────────────────────────────────────────────────
    // Bảng nạp lười, nên vài trăm mili giây đầu game vẽ `assets/npcs/<tên>.png`. Thiếu tệp
    // đó là một lượt 404 rồi NPC chớp thành đốm mực — thấy được, mà không lỗi nào báo.
    const lui = NPC_IMGS[n.id];
    ok('§4 tấm lùi tĩnh tải được (không 404)',
       lui && lui.complete && lui.naturalWidth > 0,
       lui ? `${lui.naturalWidth}×${lui.naturalHeight}` : 'không có');

    // ── §5 CHIỀU NGƯỢC LẠI: NPC KHÔNG KHAI THÌ KHÔNG ĐỔI GÌ ─────────────────────────
    // Vế này là thứ giữ cho tầng mới không âm thầm đụng vào 25 NPC còn lại. Bỏ cửa
    // `if (!K) return null` ra là nó đỏ.
    const khac = NPCS.filter(x => x.map === 'ardhaven' && x.id !== 'ah_ronin');
    const ro = khac.filter(x => npcKhungCua(x) !== null);
    ok('§5 NPC không khai NPC_KHUNG thì vẫn vẽ tranh tĩnh',
       ro.length === 0 && khac.length > 10,
       `${khac.length} NPC khác, ${ro.length} con lọt vào nhánh hoạt ảnh`);

    return ra;
  });

  let fail = 0;
  for (const m of r){ if (!m.ok) fail++; console.log(`${m.ok ? '  OK' : 'FAIL'}  ${m.t} — ${m.ghi}`); }
  if (errors.length) console.log('PAGEERROR:', errors.slice(0, 5).join(' | '));
  console.log(fail ? `\n${fail} mệnh đề ĐỎ` : '\nxanh hết');
  await browser.close();
  process.exit(fail || errors.length ? 1 : 0);
})();
