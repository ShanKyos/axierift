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

/* ── CHAT ────────────────────────────────────────────────────────────────────────────────
 * Hai kênh: `the-gioi` (mọi người) và `vung` (chỉ ai đang đứng cùng bản đồ). Không lưu gì —
 * cùng lý do với ảnh chụp vị trí: máy chủ này KHÔNG có cơ sở dữ liệu, và một lịch sử chat nằm
 * trong RAM thì mất theo lần khởi động lại kế tiếp. Ai cần lịch sử thì đó là việc của giai
 * đoạn có tài khoản thật.
 *
 * ⚠ CHỐNG SPAM LÀ VIỆC CỦA MÁY CHỦ, không phải của client. Client có thể bị sửa; ô nhập bên
 * client chỉ để người dùng tử tế khỏi vô tình bấm liên tục. Hai lớp, vì chúng chặn hai kiểu
 * khác nhau: `CHAT_NHIP_MS` chặn giữ phím, `CHAT_CUA` chặn dán một loạt rồi bắn dồn.           */
/* ── GIỚI HẠN NHỊP GÓI `pos` ──────────────────────────────────────────────────────────────
 * Chat có hai lớp chống spam từ đầu; `pos` thì KHÔNG CÓ GÌ — mà nó mới là gói chạy 10 lần mỗi
 * giây. Một client sửa đổi bắn 10.000 gói/giây là ăn CPU của cả phòng, và không ai trong phòng
 * biết vì sao game giật.
 *
 * ⚠ ĐỪNG ĐẶT SÁT 10 Hz. Client gửi theo `requestAnimationFrame` nên hai gói có thể dính sát
 * nhau sau một khung bị nghẽn; chặn sát nhịp là phạt nhầm người chơi tử tế trên máy yếu. Trần
 * ở đây rộng gấp ba nhịp thật, đủ để bắt kẻ bắn dồn mà không chạm tới ai chơi bình thường.
 * ⚠ Và ĐỪNG ĐÁ NGAY: một cú bắn dồn lẻ thì BỎ QUA gói là đủ. Chỉ đá khi nó bền — kẻ viết bot
 * mới giữ được mức đó, còn người chơi thật thì không.                                          */
const POS_CUA    = 30;       // tối đa ngần này gói `pos`…
const POS_CUA_MS = 1000;     // …trong ngần này (nhịp thật là 10)
const POS_QUA_MAX = 200;     // vượt liên tục ngần này gói thì đóng kết nối

const CHAT_DAI    = 200;     // ký tự — cắt, không đá
const CHAT_NHIP_MS = 700;    // hai câu liền nhau phải cách nhau chừng này
const CHAT_CUA    = 6;       // tối đa ngần này câu…
const CHAT_CUA_MS = 10000;   // …trong ngần này

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

// Tên đã có người đang online dùng thì thêm hậu tố. KHÔNG từ chối kết nối: người thứ hai trùng
// tên là chuyện thường (hai người cùng đặt "Kiếm Khách"), đá họ ra là phạt nhầm người.
function tenRieng(xin, id){
  const dung = new Set();
  for (const st of nguoi.values()) if (st.id !== id && st.daDatTen) dung.add(st.name);
  if (!dung.has(xin)) return xin;
  for (let k = 2; k < 100; k++){
    const t = (xin + '#' + k).slice(0, TEN_MAX);
    if (!dung.has(t)) return t;
  }
  return ('Khach' + id).slice(0, TEN_MAX);
}

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
  // ⚠ TÊN ĐẶT MỘT LẦN RỒI THÔI, VÀ KHÔNG ĐƯỢC TRÙNG AI ĐANG ONLINE.
  // Bản cũ nhận `name` ở MỌI gói `pos`, tức client đổi tên bất cứ lúc nào. Hồi chỉ có bóng
  // người thì đó là chuyện nhỏ; từ lúc có CHAT thì nó là mạo danh — ai cũng đổi tên mình thành
  // tên người khác rồi nói thay họ, và người bị mạo danh không có cách nào biết.
  //
  // ⚠ ĐÂY KHÔNG PHẢI XÁC THỰC, và đừng nhầm hai thứ. Không có tài khoản thì không cách nào biết
  // ai thật sự là ai; thứ chốt này mua được đúng một điều: KHÔNG mạo danh được người đang có
  // mặt. Muốn hơn thế thì phải đợi giai đoạn có tài khoản (xem docs/THIET_KE_ONLINE.md).
  if (!st.daDatTen){
    const xin = chu(tin.name, TEN_MAX);
    if (xin){ st.name = tenRieng(xin, st.id); st.daDatTen = true; }
  }
  // ── Hành động ra đòn ──────────────────────────────────────────────────────────────────
  // Bộ đếm chứ không phải thời gian còn lại: một hoạt cảnh 0,22 s lọt gọn giữa hai ảnh 10 Hz,
  // nên gửi "còn bao lâu" là thỉnh thoảng mất hẳn một cú đánh. Một con số chỉ tăng thì không.
  st.atkSeq  = Math.round(so(tin.as, 0, 1e9, st.atkSeq));
  st.castSeq = Math.round(so(tin.cs, 0, 1e9, st.castSeq));
  st.hitSeq  = Math.round(so(tin.hs, 0, 1e9, st.hitSeq));
  st.chet    = !!tin.chet;
  st.atkAct  = chu(tin.ak, 16) || st.atkAct;
  st.castAct = chu(tin.ck, 16) || st.castAct;
  // ── Trang bị ──────────────────────────────────────────────────────────────────────────
  // Client chỉ gửi khi ĐỔI. Máy chủ giữ bản mới nhất và tăng số hiệu; vòng phát dưới kia dùng
  // số hiệu ấy để biết từng kết nối đã nhận bản nào rồi — xem `ws.__gearV`.
  if (tin.g && typeof tin.g === 'object' && !Array.isArray(tin.g)){
    st.gear = locTrangBi(tin.g);
    st.gearV++;
  }
  st.nghe  = Date.now();
}

/* ⚠ VỆ SINH CẢ MÔ TẢ TRANG BỊ, ĐỪNG CHUYỂN TIẾP THÔ. Gói này đi thẳng vào tầng vẽ của MỌI người
 * khác: một `def` dài 2 MB hay một mảng 10.000 phần tử là một client làm treo cả phòng. Đây vẫn
 * là chống RÁC, không phải chống gian lận — ai sửa `tier` trong devtools thì bóng của họ lấp
 * lánh hơn, và ở giai đoạn này đó là chuyện chấp nhận được (xem chú thích đầu tệp).             */
const O_DO = ['non', 'ao', 'tay', 'chan', 'vukhi'];
// ⚠ MÔ TẢ RỖNG LÀ MỘT CÂU TRẢ LỜI, KHÔNG PHẢI MỘT CÂU HỎI HỎNG. Bản đầu trả `null` khi không
// nhận ra ô nào rồi bên trên bỏ qua — nên THÁO HẾT ĐỒ RA là máy chủ giữ nguyên bộ cũ và mọi
// người vẫn thấy ta mặc đủ giáp. Không lỗi nào báo, và chính người tháo đồ là người duy nhất
// không nhìn thấy nó. Nay luôn trả một đối tượng: rỗng nghĩa là "người này đang cởi trần".
function locTrangBi(g){
  const ra = {};
  for (const k of O_DO){
    const a = g[k];
    if (!Array.isArray(a)) continue;
    ra[k] = [chu(a[0], 40), Math.round(so(a[1], 1, 20, 1)),
             Math.round(so(a[2], 0, 15, 0)), Math.round(so(a[3], 0, 2, 0))];
  }
  if (Array.isArray(g.canh)) ra.canh = [chu(g.canh[0], 40), Math.round(so(g.canh[1], 1, 3, 1))];
  // `av` phân biệt BA trạng thái nên phải giữ cả `null` lẫn chuyện KHÔNG CÓ KHOÁ — xem
  // `avatarId()` trong game.js. `'av' in g` chứ không phải `g.av != null`.
  if ('av' in g) ra.av = g.av === null ? null : chu(g.av, 40);
  return ra;
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
    name: 'Khach' + id, daDatTen: false, nghe: Date.now(),
    chatLuc: 0, chatCua: [],     // chống spam, xem CHAT_* ở trên
    posCua: [], posQua: 0,       // chống bắn dồn `pos`, xem POS_* ở trên
    atkSeq: 0, castSeq: 0, hitSeq: 0, chet: false, atkAct: '', castAct: '',
    gear: null, gearV: 0,        // số hiệu tăng mỗi lần trang bị đổi
  };
  nguoi.set(id, st);
  ws.__id = id;
  // Kết nối này đã nhận mô tả trang bị bản nào của ai. WebSocket chạy trên TCP nên đã gửi là
  // chắc tới và đúng thứ tự — không cần gửi lại phòng hờ, không cần cửa sổ thời gian.
  ws.__gearV = new Map();
  ws.gui(JSON.stringify({ t: 'chao', id }));
  console.log(`[+] ${id} vao — dang co ${nguoi.size}`);

  ws.khiTin((raw) => {
    let tin;
    try { tin = JSON.parse(raw); } catch { return; }   // rác thì bỏ qua, đừng đá
    if (!tin || typeof tin !== 'object') return;
    if (tin.t === 'pos'){
      if (!posQua(st, ws)) capNhat(st, tin);
    }
    else if (tin.t === 'chat') nhanChat(st, ws, tin);
  });

  ws.khiDong(() => {
    nguoi.delete(id);
    console.log(`[-] ${id} roi — con ${nguoi.size}`);
  });
});

// Trả `true` nghĩa là gói này VƯỢT trần — bỏ qua nó. Xem POS_* ở đầu tệp.
function posQua(st, ws){
  const gio = Date.now();
  st.posCua = st.posCua.filter(t => gio - t < POS_CUA_MS);
  if (st.posCua.length < POS_CUA){ st.posCua.push(gio); st.posQua = 0; return false; }
  if (++st.posQua >= POS_QUA_MAX){
    console.log(`[!] ${st.id} ban don ${st.posQua} goi pos — dong ket noi`);
    ws.dong(1008, 'qua nhanh');    // 1008 = policy violation
  }
  return true;
}

/* ── Chat ────────────────────────────────────────────────────────────────────────────────
 * ⚠ TRẢ LỜI NGƯỜI BỊ CHẶN, ĐỪNG IM. Câu bị nuốt mà không nói gì thì người chơi gõ lại, rồi gõ
 * lại nữa — tức chính cái chống spam lại sinh ra spam, và họ tưởng game hỏng.                  */
function nhanChat(st, ws, tin) {
  const kenh = tin.kenh === 'vung' ? 'vung' : 'the-gioi';
  const loi = chu(tin.loi, CHAT_DAI).trim();
  if (!loi) return;
  const gio = Date.now();
  if (gio - st.chatLuc < CHAT_NHIP_MS) { ws.gui(JSON.stringify({ t: 'chat-chan', ly: 'nhanh' })); return; }
  st.chatCua = st.chatCua.filter(t => gio - t < CHAT_CUA_MS);
  if (st.chatCua.length >= CHAT_CUA) { ws.gui(JSON.stringify({ t: 'chat-chan', ly: 'nhieu' })); return; }
  // Kênh vùng mà chưa đứng ở bản đồ nào (còn ở màn chờ) thì không có ai để nói cùng.
  if (kenh === 'vung' && !st.map) { ws.gui(JSON.stringify({ t: 'chat-chan', ly: 'chua-vao' })); return; }
  st.chatLuc = gio; st.chatCua.push(gio);

  const goi = JSON.stringify({ t: 'chat', kenh, tu: st.id, ten: st.name, loi, ts: gio });
  for (const w of wss.clients) {
    if (!w.dangMo) continue;
    const ai = nguoi.get(w.__id);
    if (!ai) continue;
    // Kênh vùng chỉ tới người CÙNG bản đồ. Kênh thế giới tới tất cả, kể cả người còn ở màn chờ
    // — họ vẫn là người đang online, và nghe được trước khi vào là một điều hay chứ không dở.
    if (kenh === 'vung' && ai.map !== st.map) continue;
    w.gui(goi);
  }
  console.log(`[${kenh}] ${st.name}: ${loi}`);
}

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
      const e = { i: st.id, x: Math.round(st.x), y: Math.round(st.y),
                  f: +st.face.toFixed(2), mv: st.moving ? 1 : 0,
                  hp: Math.round(st.hp), mhp: Math.round(st.maxHp),
                  lv: st.level, sp: Math.round(st.speed), s: st.sect, n: st.name,
                  as: st.atkSeq, cs: st.castSeq, hs: st.hitSeq, dd: st.chet ? 1 : 0 };
      if (st.atkAct)  e.ak = st.atkAct;
      if (st.castAct) e.ck = st.castAct;
      // ⚠ TRANG BỊ CHỈ GỬI KHI KẾT NỐI NÀY CHƯA CÓ BẢN ẤY. Nhét nó vào mọi ảnh chụp là ~180
      // byte × 9 người × 10 Hz = 16 KB/s mỗi client cho một thứ đổi vài phút một lần — gấp ba
      // cả gói tin hiện tại. Và nó KHÔNG cần gửi lại phòng hờ: WebSocket chạy trên TCP nên đã
      // gửi là chắc tới và đúng thứ tự; người mới nhìn thấy nhau thì `__gearV` chưa có khoá đó
      // nên tự động nhận đủ ngay ảnh đầu tiên.
      if (st.gear && ws.__gearV.get(st.id) !== st.gearV) {
        e.g = st.gear;
        ws.__gearV.set(st.id, st.gearV);
      }
      ds.push(e);
    }
    // Quên người đã rời đi, nếu không bảng này phình theo số lượt vào/ra của cả phiên. Chỉ dọn
    // khi nó đã to hơn số người đang có — dọn mỗi nhịp là O(kết nối × đã gặp) ở 10 Hz cho một
    // bảng vài chục phần tử.
    if (ws.__gearV.size > nguoi.size + 8)
      for (const id of ws.__gearV.keys()) if (!nguoi.has(id)) ws.__gearV.delete(id);
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
