// ═══════════════════════════════════════════════════════════════════════════════════════
//  WebSocket TỐI GIẢN — chỉ dùng thư viện chuẩn của Node, KHÔNG phụ thuộc `ws`
// ═══════════════════════════════════════════════════════════════════════════════════════
//
// ⚠ VÌ SAO TỰ VIẾT THAY VÌ DÙNG `ws` — đây là quyết định về TRIỂN KHAI, không phải về sở thích.
//
// VPS production chưa bao giờ có Node (nó chỉ là nginx phục vụ tệp tĩnh). Cài `ws` nghĩa là
// chạy `npm install` trong `/var/www/axiewuxia`, mà npm thì hoà lại TOÀN BỘ cây phụ thuộc của
// repo — đo được **63 gói prod, 467 MB `node_modules`** (aws-sdk, react, trpc, drizzle, radix…)
// — chỉ để chạy một cái relay 170 dòng. Cộng thêm ba rủi ro vận hành:
//   · `npm install` viết lại `package-lock.json`, mà tệp đó CÓ trong git ⇒ `git reset --hard`
//     mỗi 2 phút sẽ giằng co với nó;
//   · đặt một `package.json` riêng cạnh tệp máy chủ để cô lập thì Node đọc **package.json gần
//     nhất** và coi `bongnguoi.js` là CommonJS ⇒ mọi `import` nổ ngay;
//   · thêm một thứ phải `npm install` lại mỗi khi dựng máy mới.
//
// Nhu cầu thật của giai đoạn này rất nhỏ: **khung TEXT, một chiều mỗi bên, gói dưới vài KB**.
// Ngần ấy viết tay được, và đổi lại máy chủ thành **một thư mục không cần cài gì**.
//
// ⚠ ĐỪNG mở rộng tệp này thành một thư viện WebSocket đầy đủ. Nó cố ý KHÔNG làm: nén
// (permessage-deflate), khung nhị phân, và phân mảnh do CHÍNH MÁY CHỦ gửi. Ngày nào cần một
// trong ba thứ đó thì đem `ws` về — lúc ấy cái giá kia đáng trả, còn hôm nay thì không.
//
// Gác: `tests/test_wsnho.js` (giao thức, đóng khung, đường hỏng) + `tests/test_bongnguoi.js`
// (Chromium thật nối vào, 10 Hz, hai chiều) — bài sau mới là bằng chứng framing đúng, vì nó
// nói chuyện với một client WebSocket thật chứ không phải với chính mã này.

import { createHash } from 'node:crypto';

// Chuỗi ma thuật của RFC 6455 §1.3. Không phải bí mật, không đổi được.
const RFC_MA = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

const OP = { TIEP: 0x0, CHU: 0x1, NHI: 0x2, DONG: 0x8, PING: 0x9, PONG: 0xA };

/**
 * Đóng một khung TEXT để gửi từ máy chủ.
 * ⚠ Khung máy chủ gửi đi **KHÔNG được che mặt nạ** (RFC 6455 §5.1) — che là trình duyệt đóng
 * kết nối với mã 1002. Ngược lại khung client gửi lên thì BẮT BUỘC che; xem `docKhung`.
 */
function dongKhung(text) {
  const than = Buffer.from(text, 'utf8');
  const n = than.length;
  let dau;
  if (n < 126) {
    dau = Buffer.alloc(2);
    dau[1] = n;
  } else if (n < 65536) {
    // 126 ⇒ hai byte độ dài tiếp theo. Gói ảnh chụp của 10 người đã vượt 125 byte từ lâu,
    // nên nhánh này là nhánh CHẠY THẬT, không phải nhánh phòng xa.
    dau = Buffer.alloc(4);
    dau[1] = 126;
    dau.writeUInt16BE(n, 2);
  } else {
    dau = Buffer.alloc(10);
    dau[1] = 127;
    // 8 byte, nhưng JS chỉ an toàn tới 2^53 — ghi 0 vào 4 byte cao là đủ và đúng.
    dau.writeUInt32BE(0, 2);
    dau.writeUInt32BE(n, 6);
  }
  dau[0] = 0x80 | OP.CHU;        // FIN + opcode text
  return Buffer.concat([dau, than]);
}

function dongKhungNgan(op, than = Buffer.alloc(0)) {
  const d = Buffer.alloc(2 + than.length);
  d[0] = 0x80 | op;
  d[1] = than.length;            // khung điều khiển luôn ≤ 125 byte theo RFC
  than.copy(d, 2);
  return d;
}

/**
 * Bóc các khung đã nhận đủ ra khỏi bộ đệm.
 * Trả `{ khung: [...], du: Buffer }` — `du` là phần chưa đủ một khung, phải giữ lại.
 *
 * ⚠ TCP KHÔNG BẢO TOÀN RANH GIỚI GÓI TIN. Một lượt `data` có thể mang nửa khung, hoặc ba khung
 * rưỡi. Đây là chỗ mà một bản viết tay sai thường xuyên nhất, và triệu chứng là "thỉnh thoảng
 * mất một gói" chứ không phải một lỗi đọc ra được.
 */
function docKhung(dem) {
  const khung = [];
  let i = 0;
  for (;;) {
    if (dem.length - i < 2) break;
    const b0 = dem[i], b1 = dem[i + 1];
    const fin = (b0 & 0x80) !== 0;
    const op = b0 & 0x0f;
    const che = (b1 & 0x80) !== 0;
    let dai = b1 & 0x7f;
    let j = i + 2;
    if (dai === 126) {
      if (dem.length - j < 2) break;
      dai = dem.readUInt16BE(j); j += 2;
    } else if (dai === 127) {
      if (dem.length - j < 8) break;
      const cao = dem.readUInt32BE(j);
      // Gói > 4 GB là rác hoặc tấn công; `maxGoi` ở dưới chặn sớm hơn nhiều.
      if (cao !== 0) return { loi: 'goi-qua-to' };
      dai = dem.readUInt32BE(j + 4); j += 8;
    }
    // ⚠ Khung từ CLIENT bắt buộc phải che mặt nạ. Không che là vi phạm giao thức — theo RFC
    // phải đóng kết nối, và chấp nhận nó là mở cửa cho cache-poisoning qua proxy.
    if (!che) return { loi: 'khong-che' };
    if (dem.length - j < 4) break;
    const mk = dem.subarray(j, j + 4); j += 4;
    if (dem.length - j < dai) break;
    const than = Buffer.allocUnsafe(dai);
    for (let k = 0; k < dai; k++) than[k] = dem[j + k] ^ mk[k & 3];
    j += dai;
    khung.push({ fin, op, than });
    i = j;
  }
  return { khung, du: dem.subarray(i) };
}

/**
 * Máy chủ WebSocket tối giản gắn lên một `http.Server` có sẵn.
 *
 * @param {import('node:http').Server} http  máy chủ HTTP để mượn sự kiện `upgrade`
 * @param {object} tuyChon  `{ duong = '/ws', maxGoi = 4096 }`
 * @returns `{ khiNoi(fn), clients }` — `fn(sock)` nhận một đối tượng có
 *          `.gui(text)` · `.dong(ma, ly)` · `.khiTin(fn)` · `.khiDong(fn)` · `.dangMo`
 */
export function taoWS(http, { duong = '/ws', maxGoi = 4096 } = {}) {
  const clients = new Set();
  let khiNoiFn = null;

  http.on('upgrade', (req, sk) => {
    // Đường khác thì đóng thẳng — đừng để một client gõ nhầm đường lại treo một socket.
    const url = (req.url || '').split('?')[0];
    const khoa = req.headers['sec-websocket-key'];
    if (url !== duong || (req.headers.upgrade || '').toLowerCase() !== 'websocket' || !khoa) {
      sk.end('HTTP/1.1 400 Bad Request\r\n\r\n');
      return;
    }
    const nhan = createHash('sha1').update(khoa + RFC_MA).digest('base64');
    sk.write(
      'HTTP/1.1 101 Switching Protocols\r\n' +
      'Upgrade: websocket\r\n' +
      'Connection: Upgrade\r\n' +
      'Sec-WebSocket-Accept: ' + nhan + '\r\n\r\n'
    );
    // Tắt Nagle: gói của ta bé và đều, gom lại chỉ thêm độ trễ.
    sk.setNoDelay(true);

    let dem = Buffer.alloc(0);
    let gomOp = 0, gom = [];          // gom khung phân mảnh do CLIENT gửi
    const tinFns = [], dongFns = [];
    let daDong = false;

    const sock = {
      get dangMo() { return !daDong && !sk.destroyed; },
      gui(text) {
        if (daDong || sk.destroyed) return false;
        try { sk.write(dongKhung(text)); return true; } catch { return false; }
      },
      dong(ma = 1000, ly = '') {
        if (daDong) return;
        daDong = true;
        try {
          const t = Buffer.from(ly, 'utf8').subarray(0, 123);
          const b = Buffer.alloc(2 + t.length);
          b.writeUInt16BE(ma, 0); t.copy(b, 2);
          sk.write(dongKhungNgan(OP.DONG, b));
        } catch { /* socket đã chết thì thôi */ }
        sk.end();
      },
      khiTin(fn) { tinFns.push(fn); },
      khiDong(fn) { dongFns.push(fn); },
    };

    const donDep = () => {
      if (!clients.has(sock)) return;
      clients.delete(sock);
      daDong = true;
      for (const f of dongFns) { try { f(); } catch (e) { console.error('[ws] khiDong', e); } }
    };

    sk.on('data', (mieng) => {
      dem = dem.length ? Buffer.concat([dem, mieng]) : mieng;
      // Chặn phình bộ đệm: một client gửi header hứa 4 GB rồi im là ta ngồi giữ RAM mãi.
      if (dem.length > maxGoi * 4) { sock.dong(1009, 'qua to'); sk.destroy(); return; }
      const kq = docKhung(dem);
      if (kq.loi) { sock.dong(1002, kq.loi); sk.destroy(); return; }
      dem = kq.du;
      for (const k of kq.khung) {
        if (k.op === OP.DONG) { sock.dong(1000, ''); sk.end(); return; }
        if (k.op === OP.PING) { try { sk.write(dongKhungNgan(OP.PONG, k.than)); } catch {} continue; }
        if (k.op === OP.PONG) continue;
        if (k.op === OP.NHI) continue;             // giai đoạn này không dùng khung nhị phân
        if (k.op === OP.CHU || k.op === OP.TIEP) {
          if (k.op === OP.CHU) { gomOp = OP.CHU; gom = []; }
          gom.push(k.than);
          if (!k.fin) continue;                     // còn mảnh nữa, đợi
          if (gomOp !== OP.CHU) { gom = []; continue; }
          const text = Buffer.concat(gom).toString('utf8');
          gom = [];
          if (text.length > maxGoi) { sock.dong(1009, 'qua to'); sk.destroy(); return; }
          for (const f of tinFns) { try { f(text); } catch (e) { console.error('[ws] khiTin', e); } }
        }
      }
    });

    sk.on('close', donDep);
    sk.on('error', () => { try { sk.destroy(); } catch {} donDep(); });
    // ⚠ PHẢI bắt cả 'end', không chỉ 'close'. `http.Server` của Node dựng net.Server với
    // `allowHalfOpen: true` (để nó còn viết nốt phần hồi đáp sau khi client đóng nửa đường),
    // và socket nâng cấp lên WebSocket THỪA HƯỞNG tính chất đó. Nghĩa là client gửi FIN mà
    // KHÔNG gửi khung close thì socket không bao giờ tự đóng, 'close' không bao giờ nổ, và
    // người đó nằm lại trong danh sách — bóng của họ đứng chết giữa map cho tới khi bộ lọc
    // im lặng 30 giây dọn hộ.
    // Trình duyệt thường gửi khung close tử tế nên đường này không lộ ra khi thử bằng Chromium;
    // `tests/test_wsnho.js §9` bắt được vì nó dựng một client THÔ chỉ gửi FIN.
    sk.on('end', () => { donDep(); try { sk.destroy(); } catch {} });

    clients.add(sock);
    if (khiNoiFn) { try { khiNoiFn(sock); } catch (e) { console.error('[ws] khiNoi', e); } }
  });

  return { khiNoi(fn) { khiNoiFn = fn; }, clients };
}

// Phơi ra cho bài kiểm giao thức gọi thẳng — đóng/bóc khung là chỗ sai thầm lặng nhất.
export const _noiBo = { dongKhung, docKhung, dongKhungNgan, OP };
