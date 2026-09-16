// CHAT (Giai đoạn 2 online) — hai kênh: Thế Giới và Vùng.
//
// ⚠ Mệnh đề ③ là mệnh đề AN TOÀN, đừng gỡ. Lời người khác gõ chạy trên máy MỌI người trong
// kênh; dựng dòng bằng `innerHTML` là ai cũng gõ được một thẻ `<img onerror=…>` vào ô chat.
// Bài hỏi thẳng DOM (`querySelectorAll('img').length`), không hỏi chuỗi — hỏi chuỗi thì một
// bản vá nửa vời (thoát `<` mà quên `"`) vẫn xanh.
//
// ⚠ Và ③ phải CHỜ QUA nhịp chống spam trước khi đo. Lượt đầu tôi đo ngay sau mấy câu trước đó
// nên chính bộ chống spam nuốt mất câu thử, dòng cuối hoá ra là "Nói chậm lại một chút" — bài
// vẫn xanh mà nó chưa hề kiểm cái nó định kiểm.
//
// Chạy độc lập:  node tests/test_chat.js [cổng-game]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const net = require('net');

const CONG_GAME = process.argv[2] || '8853';
const GOC = 'http://localhost:' + CONG_GAME + '/index.html';
const REPO = process.env.AXIE_REPO || path.resolve(__dirname, '..');
const cho = ms => new Promise(r => setTimeout(r, ms));
const congTrong = () => new Promise(res => {
  const s = net.createServer();
  s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); });
});

(async () => {
  let bad = 0; const fail = m => { console.log('FAIL', m); bad++; };
  const errs = [];
  const CONG_WS = await congTrong();
  const may = spawn(process.execPath, [path.join(REPO, 'server', 'bongnguoi.js')],
                    { env: { ...process.env, PORT: String(CONG_WS) }, stdio: ['ignore', 'pipe', 'pipe'] });
  const dongMay = () => { try { may.kill('SIGTERM'); } catch {} };
  process.on('exit', dongMay);
  await cho(1200);

  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const moTrang = async (comang) => {
    const ctx = await b.newContext({ viewport: { width: 1000, height: 700 } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(String(e)));
    await p.goto(GOC + (comang ? '?net=ws://localhost:' + CONG_WS + '/ws' : ''));
    await p.waitForFunction(() => window.__gameReady).catch(() => {});
    await cho(500);
    return { ctx, p };
  };
  const vao = (t, map, ten) => t.p.evaluate(({ map, ten }) => {
    window.TEST_MODE = true; startGame('thieulam', null);
    travelTo(map); player.name = ten; calcDerived();
  }, { map, ten });
  const dong = t => t.p.evaluate(() => [...document.querySelectorAll('#chat-log .ch-row')].map(r => r.textContent));

  // ── 0. KHÔNG mạng ⇒ khối chat phải ẨN, không bày một ô gõ được mà không ai nhận ─────────
  {
    const t = await moTrang(false);
    await vao(t, 'daohoa', 'MotMinh');
    const r = await t.p.evaluate(() => {
      const w = document.getElementById('chat-wrap');
      return { co: !!w, an: w && w.classList.contains('hidden') };
    });
    console.log('0 · offline:', JSON.stringify(r));
    if (!r.co) fail('không thấy #chat-wrap trong index.html');
    if (!r.an) fail('bản chơi một mình vẫn bày khung chat — vỏ giả vờ là máy chạy');
    await t.ctx.close();
  }

  const A = await moTrang(true), B = await moTrang(true);
  await vao(A, 'daohoa', 'NguoiA'); await vao(B, 'daohoa', 'NguoiB');
  await cho(1200);

  // ── 1. Kênh THẾ GIỚI tới được người khác ───────────────────────────────────────────────
  {
    const hien = await A.p.evaluate(() => !document.getElementById('chat-wrap').classList.contains('hidden'));
    if (!hien) fail('có mạng mà khung chat vẫn ẩn');
    await A.p.evaluate(() => window.netChatGui('the-gioi', 'xin chao ca the gioi'));
    await cho(700);
    const d = await dong(B);
    console.log('1 · thế giới · B thấy:', JSON.stringify(d));
    if (!d.some(x => x.includes('xin chao ca the gioi'))) fail('B không nhận được câu kênh Thế Giới');
    if (!d.some(x => x.includes('NguoiA'))) fail('dòng chat không mang tên người nói');
  }

  // ── 2. Kênh VÙNG chỉ tới người CÙNG bản đồ ─────────────────────────────────────────────
  {
    await B.p.evaluate(() => travelTo('ngoai'));
    await cho(900);
    await A.p.evaluate(() => window.netChatGui('vung', 'chi trong vung thoi'));
    await cho(700);
    const dB = await dong(B), dA = await dong(A);
    console.log('2 · vùng · B(khác map):', dB.length, '· A(tự thấy):', dA.length);
    if (dB.some(x => x.includes('chi trong vung thoi'))) fail('câu kênh Vùng lọt sang người ở BẢN ĐỒ KHÁC');
    if (!dA.some(x => x.includes('chi trong vung thoi'))) fail('người nói không thấy chính câu mình vừa nói');
    await B.p.evaluate(() => travelTo('daohoa'));
    await cho(700);
  }

  // ── 3. AN TOÀN: lời người khác là DỮ LIỆU, không phải HTML ─────────────────────────────
  {
    await cho(1500);                       // ⚠ qua nhịp chống spam, nếu không nó nuốt câu thử
    await A.p.evaluate(() => window.netChatGui('the-gioi', '<img src=x onerror=alert(1)>'));
    await cho(800);
    const r = await B.p.evaluate(() => {
      const rows = [...document.querySelectorAll('#chat-log .ch-row')];
      const r0 = rows[rows.length - 1];
      return { chu: r0 ? r0.textContent : '', img: document.querySelectorAll('#chat-log img').length };
    });
    console.log('3 · thoát HTML:', JSON.stringify(r));
    if (r.img !== 0) fail(`ô chat dựng ra ${r.img} thẻ <img> từ lời người khác — lỗ XSS`);
    if (!r.chu.includes('<img src=x')) fail('câu thử không tới nơi, mệnh đề an toàn chưa kiểm được gì');
  }

  // ── 4. Chống spam ở MÁY CHỦ, và nó phải NÓI RA ────────────────────────────────────────
  {
    const truoc = (await dong(A)).length;
    await A.p.evaluate(() => { for (let i = 0; i < 10; i++) window.netChatGui('the-gioi', 'spam ' + i); });
    await cho(1000);
    const d = await dong(A);
    const nhac = d.filter(x => /chậm lại|hơi nhiều/.test(x)).length;
    const qua  = d.slice(truoc).filter(x => /spam /.test(x)).length;
    console.log('4 · spam · số câu lọt:', qua, '· số dòng nhắc:', nhac);
    if (qua > 3) fail(`bắn 10 câu liền mà ${qua} câu lọt — chống spam không chạy`);
    if (nhac === 0) fail('bị chặn mà không nói gì — người chơi sẽ gõ lại, tức chống spam đẻ ra spam');
  }

  await A.ctx.close(); await B.ctx.close();
  await b.close(); dongMay();
  console.log('errors:', JSON.stringify(errs));
  console.log(bad === 0 && errs.length === 0 ? 'PASS' : 'FAIL(' + bad + ')');
  process.exit(bad === 0 && errs.length === 0 ? 0 : 1);
})();
