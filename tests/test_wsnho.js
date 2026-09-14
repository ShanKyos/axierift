// WebSocket tự viết (`server/wsnho.js`) — kiểm ĐÓNG KHUNG và các ĐƯỜNG HỎNG.
//
// ⚠ Vì sao cần bài này dù `test_bongnguoi.js` đã nối bằng Chromium thật: trình duyệt là một
// client LỊCH SỰ. Nó không bao giờ gửi khung không che mặt nạ, không bao giờ cắt một khung
// thành ba gói TCP để thử ta, không bao giờ hứa độ dài 4 GB rồi im. Mấy đường đó chỉ có một
// client THÔ mới dựng được — nên bài này tự nói giao thức bằng `node:net`.
//
// Bài kia vẫn là bằng chứng cuối cùng rằng framing đúng với client thật; bài này là bằng chứng
// rằng nó không sập khi gặp client không thật thà.
//
// Chạy độc lập:  node tests/test_wsnho.js
const net = require('net');
const crypto = require('crypto');
const path = require('path');
const { spawn } = require('child_process');

const REPO = process.env.AXIE_REPO || path.resolve(__dirname, '..');
const cho = ms => new Promise(r => setTimeout(r, ms));

function congTrong(){
  return new Promise(res => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); });
  });
}

/** Client WebSocket THÔ — ta tự đóng khung để gửi được cả khung xấu. */
function clientTho(cong){
  return new Promise((ok, loi) => {
    const khoa = crypto.randomBytes(16).toString('base64');
    const sk = net.connect(cong, '127.0.0.1');
    let dem = Buffer.alloc(0), batTay = false;
    const tin = [], sukien = [];
    let dongMa = null;

    sk.on('data', (m) => {
      dem = Buffer.concat([dem, m]);
      if (!batTay) {
        const het = dem.indexOf('\r\n\r\n');
        if (het < 0) return;
        const dau = dem.subarray(0, het).toString();
        dem = dem.subarray(het + 4);
        batTay = true;
        const mong = crypto.createHash('sha1')
          .update(khoa + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
        if (!/101/.test(dau) || !dau.includes(mong)) { loi(new Error('bắt tay hỏng: ' + dau)); return; }
        ok(api);
      }
      // bóc khung máy chủ gửi (KHÔNG che mặt nạ)
      for (;;) {
        if (dem.length < 2) break;
        const op = dem[0] & 0x0f, che = (dem[1] & 0x80) !== 0;
        let dai = dem[1] & 0x7f, j = 2;
        if (dai === 126) { if (dem.length < 4) break; dai = dem.readUInt16BE(2); j = 4; }
        else if (dai === 127) { if (dem.length < 10) break; dai = dem.readUInt32BE(6); j = 10; }
        if (che) { sukien.push('MAY-CHU-CHE-MAT-NA'); }   // vi phạm RFC — phải không bao giờ xảy ra
        if (dem.length < j + dai) break;
        const than = dem.subarray(j, j + dai);
        dem = dem.subarray(j + dai);
        if (op === 0x1) tin.push(than.toString('utf8'));
        else if (op === 0x8) { dongMa = than.length >= 2 ? than.readUInt16BE(0) : 0; sukien.push('DONG'); }
        else if (op === 0xA) sukien.push('PONG');
      }
    });
    sk.on('error', () => {});

    const khung = (op, than, che = true) => {
      const b = Buffer.isBuffer(than) ? than : Buffer.from(than || '', 'utf8');
      const n = b.length;
      let d;
      if (n < 126) { d = Buffer.alloc(2); d[1] = n; }
      else if (n < 65536) { d = Buffer.alloc(4); d[1] = 126; d.writeUInt16BE(n, 2); }
      else { d = Buffer.alloc(10); d[1] = 127; d.writeUInt32BE(0, 2); d.writeUInt32BE(n, 6); }
      d[0] = op;
      if (!che) return Buffer.concat([d, b]);
      d[1] |= 0x80;
      const mk = crypto.randomBytes(4);
      const p = Buffer.allocUnsafe(n);
      for (let i = 0; i < n; i++) p[i] = b[i] ^ mk[i & 3];
      return Buffer.concat([d, mk, p]);
    };

    const api = {
      tin, sukien, get dongMa(){ return dongMa; },
      guiText: (t) => sk.write(khung(0x81, t)),
      guiKhongChe: (t) => sk.write(khung(0x81, t, false)),
      guiPing: (t) => sk.write(khung(0x89, t)),
      guiThoTuc: (b) => sk.write(b),
      khung,
      // gửi từng byte một, ép máy chủ phải ghép lại từ nhiều lượt `data`
      guiNhoGiot: async (t) => {
        const b = khung(0x81, t);
        for (const by of b) { sk.write(Buffer.from([by])); await cho(1); }
      },
      dong: () => sk.end(),
      huy: () => sk.destroy(),
      get song(){ return !sk.destroyed; },
    };

    sk.on('connect', () => {
      sk.write(
        'GET /ws HTTP/1.1\r\nHost: localhost\r\nUpgrade: websocket\r\n' +
        'Connection: Upgrade\r\nSec-WebSocket-Key: ' + khoa + '\r\n' +
        'Sec-WebSocket-Version: 13\r\n\r\n'
      );
    });
    setTimeout(() => loi(new Error('hết giờ bắt tay')), 5000);
  });
}

(async () => {
  let bad = 0; const fail = m => { console.log('FAIL', m); bad++; };
  const CONG = await congTrong();
  const may = spawn(process.execPath, [path.join(REPO, 'server', 'bongnguoi.js')],
                    { env: { ...process.env, PORT: String(CONG) }, stdio: ['ignore', 'pipe', 'pipe'] });
  const log = []; may.stdout.on('data', d => log.push(String(d))); may.stderr.on('data', d => log.push('ERR ' + d));
  process.on('exit', () => { try { may.kill('SIGTERM'); } catch {} });
  await cho(1200);
  if (may.exitCode !== null) { console.log('máy chủ chết ngay:', log.join('')); console.log('FAIL(1)'); process.exit(1); }

  // ── 1. Bắt tay + lời chào, và máy chủ KHÔNG che mặt nạ khung nó gửi ───────────────────
  const c1 = await clientTho(CONG);
  await cho(300);
  const chao = c1.tin.map(t => { try { return JSON.parse(t); } catch { return null; } }).find(x => x && x.t === 'chao');
  console.log('1 · lời chào:', JSON.stringify(chao));
  if (!chao || typeof chao.id !== 'number') fail('không nhận được {t:"chao"} sau khi bắt tay');
  if (c1.sukien.includes('MAY-CHU-CHE-MAT-NA')) {
    fail('máy chủ CHE MẶT NẠ khung nó gửi — vi phạm RFC 6455 §5.1, trình duyệt sẽ đóng với mã 1002');
  }

  // ── 2. Gói > 125 byte: nhánh độ dài 2 byte là nhánh CHẠY THẬT ─────────────────────────
  // Ảnh chụp của vài người đã vượt 125 byte, nên nếu nhánh `126` sai thì game hỏng ở đúng
  // lúc có đông người — tức là lúc khó gỡ nhất.
  const bay = [];
  for (let i = 0; i < 8; i++) bay.push(await clientTho(CONG));
  for (const c of [c1, ...bay]) {
    c.guiText(JSON.stringify({ t:'pos', map:'daohoa', x:1300, y:1500, hp:900, maxHp:900,
                               level:42, speed:190, sect:'thieulam', name:'NguoiDaiTen' + Math.random().toString(36).slice(2,8) }));
  }
  await cho(600);
  const anh = c1.tin.map(t => { try { return JSON.parse(t); } catch { return null; } })
                    .filter(x => x && x.t === 'anh').pop();
  const coLen = c1.tin.filter(t => t.length > 125).length;
  console.log('2 · ảnh chụp:', anh ? anh.ds.length + ' người khác' : 'KHÔNG CÓ',
              '· số gói >125 byte:', coLen);
  if (!anh) fail('không nhận được ảnh chụp nào');
  else if (anh.ds.length !== 8) fail(`ảnh chụp có ${anh.ds.length} người, cần 8`);
  if (coLen === 0) fail('chưa gói nào vượt 125 byte — bài này chưa chạm nhánh độ dài 2 byte');

  // ── 3. TCP cắt vụn: một khung tới thành nhiều lượt `data` ─────────────────────────────
  // ⚠ TCP không bảo toàn ranh giới gói. Đây là chỗ một bản viết tay sai thường xuyên nhất,
  // và triệu chứng là "thỉnh thoảng mất một gói", không phải một lỗi đọc ra được.
  const truoc3 = c1.tin.length;
  await bay[0].guiNhoGiot(JSON.stringify({ t:'pos', map:'daohoa', x:2222, y:1500, hp:900, maxHp:900,
                                           level:7, speed:190, sect:'thieulam', name:'NhoGiot' }));
  await cho(500);
  const anh3 = c1.tin.slice(truoc3).map(t => { try { return JSON.parse(t); } catch { return null; } })
                     .filter(x => x && x.t === 'anh').pop();
  const thay3 = anh3 && anh3.ds.find(d => d.n === 'NhoGiot');
  console.log('3 · gửi từng byte một →', thay3 ? `thấy x=${thay3.x} lv=${thay3.lv}` : 'KHÔNG THẤY');
  if (!thay3) fail('khung bị cắt thành từng byte thì máy chủ không ghép lại được');
  else if (thay3.x !== 2222) fail(`ghép sai: x=${thay3.x}, cần 2222`);

  // ── 4. Khung PHÂN MẢNH (text + continuation) ──────────────────────────────────────────
  const truoc4 = c1.tin.length;
  const js = JSON.stringify({ t:'pos', map:'daohoa', x:1777, y:1500, hp:900, maxHp:900,
                              level:9, speed:190, sect:'thieulam', name:'PhanManh' });
  const nua = Math.floor(js.length / 2);
  bay[1].guiThoTuc(bay[1].khung(0x01, js.slice(0, nua)));   // opcode text, FIN = 0
  bay[1].guiThoTuc(bay[1].khung(0x80, js.slice(nua)));      // continuation, FIN = 1
  await cho(500);
  const anh4 = c1.tin.slice(truoc4).map(t => { try { return JSON.parse(t); } catch { return null; } })
                     .filter(x => x && x.t === 'anh').pop();
  const thay4 = anh4 && anh4.ds.find(d => d.n === 'PhanManh');
  console.log('4 · khung phân mảnh →', thay4 ? `thấy x=${thay4.x}` : 'KHÔNG THẤY');
  if (!thay4 || thay4.x !== 1777) fail('không ghép được khung phân mảnh (text + continuation)');

  // ── 5. PING phải được trả PONG ────────────────────────────────────────────────────────
  c1.sukien.length = 0;
  c1.guiPing('xin chao');
  await cho(300);
  console.log('5 · sau khi ping:', JSON.stringify(c1.sukien));
  if (!c1.sukien.includes('PONG')) fail('ping không được trả pong — kết nối sẽ bị proxy cắt khi im lâu');

  // ── 6. Khung KHÔNG CHE MẶT NẠ phải bị đóng, không được nhận ──────────────────────────
  // RFC bắt client phải che; nhận khung không che là mở cửa cho cache-poisoning qua proxy.
  const cXau = await clientTho(CONG);
  await cho(200);
  cXau.guiKhongChe(JSON.stringify({ t:'pos', map:'daohoa', x:1, y:1 }));
  await cho(400);
  console.log('6 · client gửi khung không che → mã đóng:', cXau.dongMa, '· còn sống:', cXau.song);
  if (cXau.dongMa !== 1002 && cXau.song) fail('khung không che mặt nạ vẫn được chấp nhận');

  // ── 7. Gói quá to phải bị chặn, và máy chủ phải SỐNG SÓT ────────────────────────────
  const cTo = await clientTho(CONG);
  await cho(200);
  cTo.guiText('x'.repeat(60000));
  await cho(500);
  const conSong = may.exitCode === null;
  console.log('7 · gửi 60 KB → máy chủ còn chạy:', conSong, '· mã đóng:', cTo.dongMa);
  if (!conSong) fail('một gói quá to làm CHẾT máy chủ');

  // ── 8. Máy chủ vẫn phục vụ những người còn lại sau ba client xấu ─────────────────────
  const truoc8 = c1.tin.length;
  await cho(400);
  const con8 = c1.tin.slice(truoc8).filter(t => t.includes('"t":"anh"')).length;
  const health = await fetch('http://127.0.0.1:' + CONG + '/health').then(r => r.json());
  console.log('8 · sau ba client xấu:', con8, 'ảnh chụp ·', JSON.stringify(health));
  if (con8 < 2) fail('máy chủ ngừng phát ảnh chụp sau khi gặp client xấu');
  if (!health.ok) fail('/health không còn trả lời');

  // ── 9. Đóng tử tế thì máy chủ dọn ────────────────────────────────────────────────────
  const truocDong = (await fetch('http://127.0.0.1:' + CONG + '/health').then(r => r.json())).nguoi;
  for (const c of bay) c.dong();
  await cho(600);
  const sauDong = (await fetch('http://127.0.0.1:' + CONG + '/health').then(r => r.json())).nguoi;
  console.log('9 · đóng 8 client:', truocDong, '→', sauDong);
  if (sauDong >= truocDong) fail(`đóng 8 client mà /health vẫn báo ${sauDong} (trước là ${truocDong})`);

  c1.huy(); may.kill('SIGTERM');
  console.log(bad === 0 ? 'PASS' : 'FAIL(' + bad + ')');
  process.exit(bad === 0 ? 0 : 1);
})();
