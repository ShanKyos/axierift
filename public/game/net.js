// ═══════════════════════════════════════════════════════════════════════════════════════
//  BÓNG NGƯỜI — phía client (Giai đoạn 1, xem docs/KHAO_SAT_ONLINE.md §3)
// ═══════════════════════════════════════════════════════════════════════════════════════
//
// Nạp SAU `game.js`. Giữ `window.NETPLAYERS`, gửi vị trí 10 Hz, nhận ảnh chụp, nội suy tuyến
// tính giữa hai ảnh gần nhất. Không đụng một dòng nào của phần chơi.
//
// ⚠ MẶC ĐỊNH TẮT. Không khai máy chủ ⇒ không nối, `NETPLAYERS` rỗng, game chạy y hệt bản chơi
// một mình. Đó là chủ ý: 170 bài hồi quy hiện có đều chạy trên đường không có mạng, và bản
// offline là thứ đang sống trên production. Bật bằng MỘT trong ba cách:
//     ?net=ws://localhost:8877/ws       ← tham số URL, tiện nhất khi thử
//     window.NET_URL = 'ws://…'         ← đặt trước khi nạp tệp này
//     ?net=1                            ← suy ra từ chính trang đang mở (dùng khi có nginx /ws)
//
// ⚠ VÀ NÓ KHÔNG PHẢI LÀ QUYỀN QUYẾT ĐỊNH. Máy chủ giai đoạn này chỉ chuyển tiếp toạ độ; ai sửa
// `player.x` trong devtools thì bóng của họ nhảy theo. Đúng như thiết kế — chống gian lận là
// việc của giai đoạn có tài khoản và kho đồ trên máy chủ, không phải của tệp này.
(function () {
  'use strict';

  const GUI_MS   = 100;    // 10 Hz. Game là click-to-move nên client gửi *đích* nhiều hơn gửi
                           // *toạ độ* — 10 Hz đã dư. Xem docs §2.1.
  const NOI_LAI_MS = 3000; // nối lại sau khi rớt
  const TRE_MS   = 120;    // trượt tới mốc mới trong chừng này — xem ghi chú ở `noiSuy()`

  function diaChi() {
    const q = new URLSearchParams(location.search).get('net');
    if (q && /^wss?:\/\//.test(q)) return q;
    if (window.NET_URL) return window.NET_URL;
    if (q === '1') return (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws';
    return null;
  }

  const URL_MAY_CHU = diaChi();
  const NET = {
    on: !!URL_MAY_CHU, url: URL_MAY_CHU, ws: null, id: 0,
    than: new Map(),          // id → thân người (đối tượng mà drawPlayer vẽ)
    guiCuoi: 0, tinhTrang: 'tat', soAnh: 0,
  };
  window.NET = NET;
  if (!NET.on) return;       // ⇐ đường chơi một mình dừng ngay tại đây

  /* ── Nối ──────────────────────────────────────────────────────────────────────────── */
  function noi() {
    let ws;
    try { ws = new WebSocket(NET.url); } catch (e) { hen(); return; }
    NET.ws = ws; NET.tinhTrang = 'dang-noi';

    ws.onopen = () => {
      NET.tinhTrang = 'da-noi';
      // ⚠ QUÊN CHỮ KÝ TRANG BỊ ĐÃ GỬI. Máy chủ dựng một trạng thái MỚI toanh cho mỗi kết nối,
      // nên sau khi rớt và nối lại nó không còn nhớ ta mặc gì. Không xoá chỗ này thì `gui()`
      // thấy "chữ ký không đổi" rồi im lặng không gửi lại — và ta cởi trần với mọi người cho
      // tới lần thay đồ kế tiếp. Không lỗi nào báo, mà phải rớt mạng một lần mới thấy.
      _doCuoi = null;
      console.log('[net] da noi', NET.url);
    };

    ws.onmessage = (ev) => {
      let tin; try { tin = JSON.parse(ev.data); } catch { return; }
      if (tin.t === 'chao') { NET.id = tin.id; return; }
      if (tin.t === 'anh') { nhanAnh(tin); return; }
      // Chat: net.js chỉ là sợi dây. Việc VẼ thuộc về game.js — nó giữ DOM, bảng màu và luật
      // thoát ký tự. Nhét HTML vào đây là dựng một chỗ thứ hai biết về giao diện.
      if (tin.t === 'chat' && typeof window.netChatNhan === 'function') { window.netChatNhan(tin); return; }
      if (tin.t === 'chat-chan' && typeof window.netChatChan === 'function') { window.netChatChan(tin.ly); return; }
      // ⚔ Sàn đấu. Cùng lối với chat: net.js là sợi dây, game.js quyết vẽ gì. Ba tin riêng chứ
      // không một tin mang cờ — `pvp-mau` phải giật người, `pvp-hoi` thì tuyệt đối không được
      // (một cú giật lúc hồi sinh đọc ra là "vừa dựng lại trận đã ăn đòn").
      if (tin.t === 'pvp-mau' && typeof window.netPvpMau === 'function') { window.netPvpMau(tin); return; }
      if (tin.t === 'pvp-ket' && typeof window.netPvpKet === 'function') { window.netPvpKet(tin); return; }
      if (tin.t === 'pvp-hoi' && typeof window.netPvpHoi === 'function') { window.netPvpHoi(tin); return; }
    };

    ws.onclose = () => {
      NET.tinhTrang = 'roi'; NET.ws = null;
      NET.than.clear(); capNhatMang();
      hen();
    };
    ws.onerror = () => { try { ws.close(); } catch {} };
  }
  let hoTro = 0;
  function hen() { clearTimeout(hoTro); hoTro = setTimeout(noi, NOI_LAI_MS); }

  /* ── Nhận ảnh chụp ───────────────────────────────────────────────────────────────────
   * Mỗi thân người giữ HAI mốc: chỗ nó vừa ở (`a`) và chỗ ảnh mới nhất nói nó đang ở (`b`).
   * Vẽ ở đâu đó giữa hai mốc — xem `noiSuy()`.                                             */
  function nhanAnh(tin) {
    NET.soAnh++;
    const gio = performance.now();
    const con = new Set();
    // Ảnh của map khác thì BỎ CẢ ẢNH. Vừa qua cổng xong, một ảnh của map cũ còn trên đường sẽ
    // tới sau — nhận nó là thả vài cái bóng người vào bản đồ mới, đứng đó cho tới ảnh kế tiếp.
    const ta0 = (typeof window.netDoc === 'function') ? window.netDoc() : null;
    if (!ta0 || (tin.map && tin.map !== ta0.map)) { NET.than.clear(); capNhatMang(); return; }

    for (const d of tin.ds) {
      con.add(d.i);
      let t = NET.than.get(d.i);
      if (!t) {
        // ⚠ Thân người dựng bằng CHÍNH hàm của game (`netTaoThan`), không phải bằng một đối
        // tượng tự chế ở đây. drawPlayer đọc 32 trường; chép danh sách đó sang tệp này là dựng
        // bản sao thứ hai của một hợp đồng đang sống — thêm một trường bên kia là nổ bên này.
        t = window.netTaoThan(d.i);
        t.ax = d.x; t.ay = d.y; t.at = gio;
        // ⚠ GHI NHẬN BỘ ĐẾM MÀ KHÔNG NỔ HOẠT CẢNH. Người này có thể đã đánh 500 cú trước khi ta
        // nhìn thấy họ; coi lần đầu gặp là "vừa bắt đầu một đòn" thì ai lọt vào tầm mắt cũng
        // vung kiếm một cái chào — kể cả người đang đứng yên trong thành.
        t._asCuoi = d.as; t._csCuoi = d.cs; t._hsCuoi = d.hs;
        NET.than.set(d.i, t);
      }
      // mốc cũ = chỗ ĐANG vẽ, không phải mốc `b` trước đó: nếu một ảnh tới trễ thì nhảy từ chỗ
      // đang vẽ mượt hơn hẳn nhảy từ một mốc mà mắt chưa bao giờ nhìn thấy.
      // ⚠⚠ `at` VÀ `bt` KHÔNG ĐƯỢC BẰNG NHAU. Bản đầu đặt cả hai bằng `gio`, nên
      // `span = max(1, bt − at)` ra **1 ms**, mà `noiSuy` lại vẽ ở thời điểm `now − TRE_MS`
      // — tức luôn TRƯỚC `at`. Kết quả: `k` bị kẹp về 0 ở MỌI khung ⇒ `x = ax = chỗ đang vẽ`
      // ⇒ thân người từ xa ĐỨNG CHẾT ở vị trí đầu tiên, vĩnh viễn.
      // Không lỗi nào ném ra. `test_bongnguoi` vẫn xanh vì nó đặt toạ độ MỘT LẦN rồi chỉ đo
      // một ảnh TĨNH — tức nó gác "có vẽ ra không", không gác "có nhúc nhích không", mà cả
      // Giai đoạn 1 sinh ra để làm đúng vế thứ hai.
      // Nay: trượt từ chỗ ĐANG vẽ tới mốc mới trong đúng `TRE_MS`.
      t.ax = t.x || d.x; t.ay = t.y || d.y; t.at = gio;
      t.bx = d.x; t.by = d.y; t.bt = gio + TRE_MS;
      t.face = d.f; t.moving = !!d.mv;
      t.hp = d.hp; t.maxHp = d.mhp; t.level = d.lv; t.speed = d.sp; t.chet = !!d.dd;
      t.sect = d.s; t.name = d.n;
      // Máu TRẬN — chỉ có mặt khi người ấy đang đứng trong sàn đấu. `0` là "không ở trận nào",
      // không phải "sắp chết"; `veNhanNet` phân biệt bằng `pvpMax > 0`.
      t.pvpHp = d.ph || 0; t.pvpMax = d.pm || 0;
      t.map = tin.map || ta0.map;
      // ── Trang bị: chỉ tới khi nó ĐỔI (xem chú thích ở máy chủ) ────────────────────────
      // Dựng lại một `equip` giả bằng hàm của game, để thân người từ xa đi qua ĐÚNG đường vẽ
      // mà người chơi của mình đi qua — `gearVisual` · `heroSprite` · `veCanh` không cần biết
      // ai là ai.
      if (d.g && typeof window.netApTrangBi === 'function') window.netApTrangBi(t, d.g);
      // ── Hành động ra đòn ─────────────────────────────────────────────────────────────
      // Tên tư thế đi riêng khỏi bộ đếm: nó là trạng thái (lớp nào vung kiểu gì), còn bộ đếm là
      // sự kiện. Gộp chúng lại là đổi vũ khí xong phải đợi cú đánh kế tiếp mới đúng tư thế.
      if (d.ak) t.atkAct = d.ak;
      if (d.ck) t.castAct = d.ck;
      const G = window.NV_HD_GIAY || { a: 0.22, c: 0.38, h: 0.30 };
      if (d.as !== t._asCuoi){ t._asCuoi = d.as; t.atkAnim = G.a; }
      if (d.cs !== t._csCuoi){ t._csCuoi = d.cs; t.castT  = G.c; }
      // Trúng đòn cũng đi bằng BỘ ĐẾM, cùng lý do: một cú giật 0,25-0,30 s lọt gọn giữa hai ảnh.
      if (d.hs !== t._hsCuoi){ t._hsCuoi = d.hs; t.hurtT = G.h; }
    }
    for (const id of [...NET.than.keys()]) if (!con.has(id)) NET.than.delete(id);
    capNhatMang();
  }

  // `window.NETPLAYERS` là thứ game.js đọc trong vòng vẽ. Giữ nó là MỘT mảng được thay nội dung
  // (không thay tham chiếu) để không phụ thuộc vào chuyện game.js đọc lại `window.` mỗi khung.
  function capNhatMang() {
    const a = window.NETPLAYERS;
    a.length = 0;
    for (const t of NET.than.values()) a.push(t);
  }

  /* ── Nội suy ─────────────────────────────────────────────────────────────────────────
   * Ảnh chụp tới mỗi 100 ms; màn hình vẽ mỗi ~16 ms. Vẽ thẳng toạ độ của ảnh mới nhất thì thân
   * người nhảy 6 khung một lần. Nên TRƯỢT từ chỗ đang vẽ tới mốc mới trong `TRE_MS`: đổi ~120 ms
   * độ trễ lấy chuyển động liên tục.
   *
   * ⚠ ĐỪNG lùi mốc thời gian vẽ về `now − TRE_MS` trong sơ đồ HAI MỐC này. Chỉ nội suy được
   * trong khoảng `[at, bt]`, mà `TRE_MS` (120) LỚN HƠN nhịp ảnh chụp (100) — nên một mốc vẽ lùi
   * 120 ms luôn rơi ra ngoài khoảng ấy về phía trước, `k` kẹp về 0, và thân người đứng im. Muốn
   * vẽ lùi thật thì phải giữ ba mốc trở lên; ở giai đoạn này không đáng.
   *
   * ⚠ KHÔNG dự đoán tới trước (extrapolate). Người chơi dừng đột ngột thì bản dự đoán chạy quá
   * đích rồi bị kéo giật ngược — thứ đó nhìn ra ngay, còn 120 ms trễ thì không ai thấy. Game là
   * click-to-move, không phải bắn súng: không có gì ở đây cần bù trễ.                          */
  function noiSuy(dt) {
    const gio = performance.now();
    for (const t of NET.than.values()) {
      if (t.bx == null) continue;
      const span = Math.max(1, t.bt - t.at);
      const k = Math.max(0, Math.min(1, (gio - t.at) / span));
      const x = t.ax + (t.bx - t.ax) * k;
      const y = t.ay + (t.by - t.ay) * k;
      // Nhịp bước + quán tính phụ: gọi ĐÚNG hàm mà update() gọi cho người chơi của mình. Chép
      // công thức sang đây là bàn chân trượt đất, và kiểu lệch đó chỉ hiện ra khi nhìn ảnh chụp.
      const dx = x - t.x, dy = y - t.y, dl = Math.hypot(dx, dy);
      t.x = x; t.y = y;
      if (typeof window.thanNhip === 'function') window.thanNhip(t, dt, dx, dy, dl > 0.01 ? 1 : 0);
      // ⚠ ĐẾM NGƯỢC HOẠT CẢNH RA ĐÒN Ở ĐÂY, KHÔNG NHÉT VÀO `thanNhip`. `update()` đã đếm ngược
      // hai đồng hồ này cho người chơi của mình; `thanNhip` thì CẢ HAI bên cùng gọi, nên đặt
      // vào đó là người chơi của mình bị trừ hai lần và mọi cú đánh ngắn đi một nửa.
      if (t.atkAnim > 0) t.atkAnim = Math.max(0, t.atkAnim - dt);
      if (t.castT   > 0) t.castT   = Math.max(0, t.castT   - dt);
      if (t.hurtT   > 0) t.hurtT   = Math.max(0, t.hurtT   - dt);
      // ── NẰM XUỐNG ──────────────────────────────────────────────────────────────────────
      // `drawPlayer` suy "người này chết chưa" từ MÁU (`p.hp <= 0`), nên chuyện chết đã qua được
      // dây từ trước — nhưng khung hình của khối chết đọc `deadT`, mà `netTaoThan` để nó bằng 0
      // và không ai cộng. Hệ quả: thân người từ xa chết thì ĐỨNG HÌNH ở khung ĐẦU của cú ngã,
      // vĩnh viễn. Không lỗi nào báo, và nhìn ra là "hình như lag" chứ không ra "chưa làm".
      // Ở người chơi của mình thì `update()` cộng nó; thân người từ xa không chạy `update()`.
      if (t.chet) t.deadT = (t.deadT || 0) + dt;
      else if (t.deadT) t.deadT = 0;     // hồi sinh thì đứng dậy, đừng giữ khung cuối của cú ngã
    }
  }

  /* ── Gửi vị trí của mình ─────────────────────────────────────────────────────────────*/
  // Chữ ký bộ đồ đã gửi lần cuối — `null` = chưa gửi lần nào. ⚠ Khai TRÊN `gui()`: `let` có vùng
  // chết, và `ws.onopen` ở trên có gán vào nó. Hôm nay không nổ vì cả hai chỗ chỉ chạy sau khi
  // thân hàm bao ngoài đã chạy xong, nhưng đó là thứ đúng vì lý do KHÁC lý do ta nghĩ.
  let _doCuoi = null;
  function gui() {
    const ws = NET.ws;
    // ⚠ Qua `netDoc()`, KHÔNG đọc `window.player`. `player` và `curMap` khai bằng `let` ở tầng
    // cao nhất nên chúng không nằm trên `window` — đọc thẳng là nhận `undefined` và im lặng
    // không gửi gì. Xem ghi chú dài ở `window.netDoc` trong game.js.
    const ta = (typeof window.netDoc === 'function') ? window.netDoc() : null;
    const p = ta && ta.p;
    if (!ws || ws.readyState !== 1 || !p) return;
    const goi = {
      t: 'pos', map: ta.map || '',
      x: p.x, y: p.y, face: p.face || 0, moving: !!p.moving,
      hp: p.hp, maxHp: p.maxHp, level: p.level, speed: p.speed,
      sect: p.sect, name: p.name || ('Khach' + NET.id),
      // Bộ đếm cú ra đòn, xem `_atkSeq` trong game.js. Gửi con số chứ không gửi thời gian còn
      // lại: 0,22 s lọt gọn giữa hai ảnh 10 Hz.
      as: p._atkSeq || 0, cs: p._castSeq || 0, hs: p._hitSeq || 0, chet: !!ta.chet,
      ak: p.atkAct || '', ck: p.castAct || '',
    };
    // ⚠ TRANG BỊ CHỈ GỬI KHI ĐỔI. Nó đổi vài phút một lần mà ảnh chụp thì 10 lần một giây —
    // gửi kèm mọi lần là trả băng thông cho một thứ đứng yên. So bằng CHỮ KÝ chứ không so bằng
    // tham chiếu: `netTrangBi()` dựng một đối tượng mới mỗi lượt gọi nên `!==` luôn đúng.
    if (typeof window.netTrangBi === 'function'){
      const g = window.netTrangBi();
      const ky = g ? JSON.stringify(g) : '';
      if (ky !== _doCuoi){ _doCuoi = ky; if (g) goi.g = g; }
    }
    ws.send(JSON.stringify(goi));
  }

  /* ── Gửi một cú đánh trong sàn đấu ───────────────────────────────────────────────────
   * Trả `false` khi chưa nối — bên gọi nói ra, đừng nuốt. Máy chủ mới là nơi quyết cú này có
   * ăn hay không (khoảng cách, nhịp, trần sát thương): ở đây chỉ gửi.                        */
  window.netPvpDanh = function (id, dmg) {
    const ws = NET.ws;
    if (!ws || ws.readyState !== 1 || !(id > 0)) return false;
    ws.send(JSON.stringify({ t: 'pvp-danh', den: id, dmg: Math.max(1, Math.round(dmg) || 1) }));
    return true;
  };

  /* ── Gửi chat ────────────────────────────────────────────────────────────────────────
   * Trả `false` khi chưa nối, để bên gọi NÓI RA thay vì nuốt câu của người chơi. Một ô chat
   * gõ xong bấm Enter rồi không có gì xảy ra là kiểu hỏng tệ nhất: người ta gõ lại.            */
  window.netChatGui = function (kenh, loi) {
    const ws = NET.ws;
    if (!ws || ws.readyState !== 1) return false;
    loi = String(loi == null ? '' : loi).slice(0, 200);
    if (!loi.trim()) return false;
    ws.send(JSON.stringify({ t: 'chat', kenh: kenh === 'vung' ? 'vung' : 'the-gioi', loi }));
    return true;
  };

  /* ── Vòng riêng ──────────────────────────────────────────────────────────────────────
   * KHÔNG móc vào `loop()` của game: vòng đó nằm trong `try/catch` và một lỗi mạng ở đây sẽ
   * hiện ra như một lỗi vẽ. Vòng riêng thì lỗi mạng ở nguyên trong phần mạng.                */
  let truoc = performance.now();
  function nhip(now) {
    requestAnimationFrame(nhip);
    const dt = Math.min(0.05, (now - truoc) / 1000);
    truoc = now;
    try {
      noiSuy(dt);
      if (now - NET.guiCuoi >= GUI_MS) { NET.guiCuoi = now; gui(); }
    } catch (e) { console.error('[net]', e); }
  }
  requestAnimationFrame(nhip);

  noi();
  console.log('[net] Bóng Người bật —', NET.url);
})();
