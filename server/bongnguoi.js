// ═══════════════════════════════════════════════════════════════════════════════════════
//  BÓNG NGƯỜI — máy chủ chuyển tiếp vị trí (Giai đoạn 1 của docs/KHAO_SAT_ONLINE.md §3)
// ═══════════════════════════════════════════════════════════════════════════════════════
//
// Nó KHÔNG làm gì ngoài chuyển tiếp toạ độ. Không tài khoản, không cơ sở dữ liệu, không quyền
// quyết định, không chống gian lận. Đó là chủ ý: đây là giai đoạn nhỏ nhất chứng minh được cả
// hướng đi — hai người mở hai trình duyệt và nhìn thấy nhau chạy trong cùng một bản đồ.
//
// ⚠ ĐỪNG BẮT NÓ GÁNH THÊM VIỆC. Mọi thứ có giá trị lâu dài (sinh vật phẩm, cộng tiền tệ, máu
// boss chung) phải đợi tới lúc có tài khoản thật và kho đồ trên máy chủ — xem
// docs/THIET_KE_ONLINE.md, mục "Ngã ba phải chọn". Nhét chúng vào đây là dựng một nền kinh tế
// trên một máy chủ tin mọi thứ client nói.
//
// Chạy:   node server/bongnguoi.js            (cổng 8877, đổi bằng PORT=…)
// Sức khoẻ: curl http://localhost:8877/health
//
// ── KHÔNG PHỤ THUỘC GÌ NGOÀI NODE ───────────────────────────────────────────────────────
// Chỉ cần `node`, không cần `npm install`. VPS production chưa bao giờ có Node (nó là nginx
// phục vụ tệp tĩnh), nên thêm `ws` là kéo theo cả cây phụ thuộc của repo — đo được 63 gói
// prod / 467 MB — chỉ để chạy tệp này. Lý do đầy đủ ở đầu `server/wsnho.js`.
//
// ── Vì sao thư mục riêng, không cắm vào `api/` ──────────────────────────────────────────
// `api/` là vỏ Hono+tRPC có sẵn (đăng nhập Google/ví Ronin, lưu cloud, bảng xếp hạng) và nó
// KHÔNG chạy trên production — nginx trỏ thẳng vào `public/game`. Trộn hai thứ vào nhau nghĩa
// là muốn bật cái này phải bật cả cái kia, và cái kia đang mang một lược đồ ăn theo hệ đã gỡ
// (`p.dantian?.realm`). Để riêng thì bật được từng cái một.

import { createServer } from 'node:http';
import { taoWS } from './wsnho.js';

const PORT      = parseInt(process.env.PORT || '8877', 10);
const NHIP_MS   = 100;     // 10 Hz. Đo trong khảo sát: 9 người chơi đóng gói JSON thô là 528 byte
                           // ⇒ 5,2 KB/s mỗi client, 51,6 KB/s tổng cho 10 người. JSON thô là quá
                           // đủ; đừng đóng gói nhị phân để tiết kiệm 43 KB/s bằng một tầng mã
                           // không đọc được bằng mắt.
const IM_LANG_MS = 30000;  // không nghe thấy gì trong ngần này thì coi như rớt
const TEN_MAX    = 24;
const NGUOI_MAX  = parseInt(process.env.NGUOI_MAX || '64', 10);

/** id kết nối → trạng thái mới nhất. Một `Map` trong RAM là đủ; xem §4.3 "cái gì là THỪA". */
const nguoi = new Map();
let idKe = 1;
let soTick = 0;
const batDau = Date.now();

/* ── Vệ sinh đầu vào ─────────────────────────────────────────────────────────────────────
 * Máy chủ này KHÔNG tin client (nó chỉ chuyển tiếp), nhưng nó vẫn phải tự bảo vệ: một client
 * gửi `x: NaN` hay một cái tên dài 2 MB sẽ đi thẳng vào ảnh chụp của mọi người khác. Đây là
 * chống RÁC, không phải chống gian lận — đừng nhầm hai thứ đó.                                */
const so = (v, min, max, mac) => (Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : mac);
const chu = (v, n) => (typeof v === 'string' ? v.slice(0, n).replace(/[\u0000-\u001f]/g, '') : '');

function capNhat(st, tin) {
  st.map   = chu(tin.map, 32) || st.map;
  st.x     = so(tin.x, -1e5, 1e5, st.x);
  st.y     = so(tin.y, -1e5, 1e5, st.y);
  st.face  = so(tin.face, -Math.PI * 2, Math.PI * 2, st.face);
  st.moving = !!tin.moving;
  st.hp    = so(tin.hp, 0, 1e9, st.hp);
  st.maxHp = so(tin.maxHp, 1, 1e9, st.maxHp);
  st.level = Math.round(so(tin.level, 1, 999, st.level));
  st.speed = so(tin.speed, 0, 2000, st.speed);
  st.sect  = chu(tin.sect, 24) || st.sect;
  st.name  = chu(tin.name, TEN_MAX) || st.name;
  st.nghe  = Date.now();
}

/* ── HTTP: chỉ để /health ────────────────────────────────────────────────────────────────
 * Một endpoint và một dòng `curl` trong cron là toàn bộ phần theo dõi cần có ở 10 người.
 * Không Prometheus, không bảng điều khiển.                                                  */
const http = createServer((req, res) => {
  if (req.url === '/health') {
    const theoMap = {};
    for (const st of nguoi.values()) theoMap[st.map] = (theoMap[st.map] || 0) + 1;
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({
      ok: true, nguoi: nguoi.size, theoMap, soTick,
      chayGiay: Math.round((Date.now() - batDau) / 1000),
    }));
    return;
  }
  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('bongnguoi: chi co /health va /ws\n');
});

const wss = taoWS(http, { duong: '/ws', maxGoi: 4096 });

wss.khiNoi((ws) => {
  if (nguoi.size >= NGUOI_MAX) {
    ws.dong(1013, 'day');   // 1013 = try again later
    return;
  }
  const id = idKe++;
  const st = {
    id, map: '', x: 0, y: 0, face: 0, moving: false,
    hp: 1, maxHp: 1, level: 1, speed: 190, sect: 'thieulam',
    name: 'Khach' + id, nghe: Date.now(),
  };
  nguoi.set(id, st);
  ws.__id = id;
  ws.gui(JSON.stringify({ t: 'chao', id }));
  console.log(`[+] ${id} vao — dang co ${nguoi.size}`);

  ws.khiTin((raw) => {
    let tin;
    try { tin = JSON.parse(raw); } catch { return; }   // rác thì bỏ qua, đừng đá
    if (!tin || typeof tin !== 'object') return;
    if (tin.t === 'pos') capNhat(st, tin);
  });

  ws.khiDong(() => {
    nguoi.delete(id);
    console.log(`[-] ${id} roi — con ${nguoi.size}`);
  });
});

/* ── Vòng phát ảnh chụp ──────────────────────────────────────────────────────────────────
 * Lọc theo `map` là toàn bộ phần "quản lý tầm nhìn" cần có ở quy mô này: 10 người chia trên
 * 13 bản đồ, trung bình chưa tới một người mỗi bản đồ. Lọc theo khoảng cách (AoI) là tối ưu
 * một thứ đã xong.                                                                            */
setInterval(() => {
  soTick++;
  const gio = Date.now();

  // rớt lặng lẽ: nghe thấy gì đó lần cuối quá lâu ⇒ bỏ khỏi ảnh chụp
  for (const [id, st] of nguoi) if (gio - st.nghe > IM_LANG_MS) nguoi.delete(id);

  // gom theo bản đồ MỘT LẦN, đừng quét lại cho từng người: với n người cùng map thì dựng
  // riêng cho từng người là O(n²) — ở 10 người không sao, nhưng đây là loại chi phí âm thầm
  // không ai đo lại khi con số tăng lên.
  const theoMap = new Map();
  for (const st of nguoi.values()) {
    if (!st.map) continue;
    if (!theoMap.has(st.map)) theoMap.set(st.map, []);
    theoMap.get(st.map).push(st);
  }

  for (const ws of wss.clients) {
    if (!ws.dangMo) continue;
    const ta = nguoi.get(ws.__id);
    if (!ta || !ta.map) continue;
    const cung = theoMap.get(ta.map) || [];
    // BỎ CHÍNH MÌNH RA. Không bỏ thì client vẽ một bản sao của chính nó trễ 100 ms đứng đè lên
    // người thật — và triệu chứng (nhân vật "nhoè" khi chạy) trông hệt như lỗi nội suy.
    const ds = [];
    for (const st of cung) {
      if (st.id === ta.id) continue;
      ds.push({ i: st.id, x: Math.round(st.x), y: Math.round(st.y),
                f: +st.face.toFixed(2), mv: st.moving ? 1 : 0,
                hp: Math.round(st.hp), mhp: Math.round(st.maxHp),
                lv: st.level, sp: Math.round(st.speed), s: st.sect, n: st.name });
    }
    // Gửi kèm `map` dù client cũng biết map của chính nó: ảnh chụp phải TỰ NÓI nó thuộc bản đồ
    // nào. Không thì client suy ngầm "ảnh này chắc là map mình đang đứng", và đúng lúc người
    // chơi vừa qua cổng thì một ảnh của map cũ tới sau sẽ thả vài cái bóng vào map mới.
    ws.gui(JSON.stringify({ t: 'anh', ts: gio, map: ta.map, ds }));
  }
}, NHIP_MS);

http.listen(PORT, '0.0.0.0', () => {
  console.log(`bongnguoi: ws://0.0.0.0:${PORT}/ws · health http://0.0.0.0:${PORT}/health`);
});

// Tắt cho gọn khi systemd gửi tín hiệu — không có gì phải lưu, nên chỉ cần đóng tử tế.
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    console.log(`nhan ${sig}, dong ${wss.clients.size} ket noi`);
    for (const ws of wss.clients) ws.dong(1001, 'bao tri');
    http.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 2000).unref();
  });
}
