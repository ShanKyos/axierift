// BÓNG NGƯỜI — Giai đoạn 1 online: hai trình duyệt phải NHÌN THẤY NHAU chạy trong cùng bản đồ.
//
// ⚠ Bài này chấm bằng ĐẾM ĐIỂM ẢNH, không bằng đối chiếu tên hàm. Lý do đã ghi hai lần trong
// CLAUDE.md (`ISO_NEO` và `test_thegioi §8`): đối chiếu tên không bắt được một canvas trắng.
// `NETPLAYERS` có 1 phần tử mà `drawPlayer` ném giữa chừng thì mọi khẳng định "có người chơi
// thứ hai" đều xanh trong khi màn hình không có ai.
//
// ⚠ Và nó chấm cả CHIỀU NGƯỢC LẠI: không khai máy chủ thì phải KHÔNG nối gì cả. Bản chơi một
// mình là thứ đang sống trên production; một tệp net.js tự ý nối ra ngoài là đổi hành vi của
// bản ấy.
//
// Chạy độc lập:  node tests/test_bongnguoi.js [cổng-game]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const net = require('net');

const CONG_GAME = process.argv[2] || '8853';
const GOC = 'http://localhost:' + CONG_GAME + '/index.html';
// Thư mục repo suy từ vị trí bài kiểm KHI chạy từ tests/; reg.sh chép bài ra ngoài repo nên
// phải có đường lùi — biến môi trường, rồi mới tới đường đoán.
const REPO = process.env.AXIE_REPO || path.resolve(__dirname, '..');

function congTrong(){
  return new Promise(res => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); });
  });
}
const cho = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  let bad = 0; const fail = m => { console.log('FAIL', m); bad++; };
  const errs = [];

  const CONG_WS = await congTrong();
  const may = spawn(process.execPath, [path.join(REPO, 'server', 'bongnguoi.js')],
                    { env: { ...process.env, PORT: String(CONG_WS) }, stdio: ['ignore', 'pipe', 'pipe'] });
  const mayLog = [];
  may.stdout.on('data', d => mayLog.push(String(d)));
  may.stderr.on('data', d => mayLog.push('ERR ' + String(d)));
  const dongMay = () => { try { may.kill('SIGTERM'); } catch {} };
  process.on('exit', dongMay);

  await cho(1200);
  if (may.exitCode !== null) {
    console.log('máy chủ chết ngay:', mayLog.join(''));
    console.log('FAIL(1)'); process.exit(1);
  }

  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const moTrang = async (net) => {
    const ctx = await b.newContext({ viewport: { width: 1100, height: 760 } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(String(e)));
    p.on('console', m => {
      if (m.type() === 'error' && !/404|ERR_CONNECTION|ERR_CERT/.test(m.text())) errs.push(m.text());
    });
    await p.goto(GOC + (net ? '?net=ws://localhost:' + CONG_WS + '/ws' : ''));
    await p.waitForFunction(() => window.__gameReady).catch(() => {});
    await cho(600);
    return { ctx, p };
  };

  // ── 0. KHÔNG khai máy chủ ⇒ không nối, và game chạy y nguyên ───────────────────────────
  {
    const { ctx, p } = await moTrang(false);
    const r = await p.evaluate(() => {
      window.TEST_MODE = true; startGame('thieulam', null);
      return { on: window.NET && window.NET.on, tinhTrang: window.NET && window.NET.tinhTrang,
               soNguoi: window.NETPLAYERS.length, coMang: !!window.NET };
    });
    console.log('0 · offline:', JSON.stringify(r));
    if (!r.coMang) fail('net.js không nạp — kiểm lại thẻ script trong index.html');
    if (r.on) fail('không khai máy chủ mà net.js vẫn tự bật');
    if (r.tinhTrang !== 'tat') fail(`không khai máy chủ mà tình trạng là "${r.tinhTrang}", cần "tat"`);
    if (r.soNguoi !== 0) fail(`bản chơi một mình có ${r.soNguoi} bóng người`);
    await ctx.close();
  }

  // ── 1. Hai trang nối vào, cùng map, phải THẤY nhau ────────────────────────────────────
  const A = await moTrang(true);
  const B = await moTrang(true);

  const dungCanh = async (t, x, y, ten) => t.p.evaluate(({ x, y, ten }) => {
    window.TEST_MODE = true; startGame('thieulam', null);
    travelTo('daohoa');
    player.name = ten; player.x = x; player.y = y; player.level = 42;
    calcDerived(); player.hp = player.maxHp;
  }, { x, y, ten });

  await dungCanh(A, 1300, 1500, 'NguoiA');
  await dungCanh(B, 1380, 1500, 'NguoiB');
  await cho(1500);   // vài vòng ảnh chụp 10 Hz

  const thay = async (t) => t.p.evaluate(() => ({
    tinhTrang: window.NET.tinhTrang, soAnh: window.NET.soAnh,
    ds: window.NETPLAYERS.map(n => ({ ten: n.name, x: Math.round(n.x), y: Math.round(n.y),
                                      lv: n.level, map: n.map, hp: n.hp, mhp: n.maxHp })),
  }));
  const tA = await thay(A), tB = await thay(B);
  console.log('1 · A thấy:', JSON.stringify(tA));
  console.log('1 · B thấy:', JSON.stringify(tB));

  if (tA.tinhTrang !== 'da-noi') fail(`A không nối được: ${tA.tinhTrang}`);
  if (tA.soAnh < 3) fail(`A mới nhận ${tA.soAnh} ảnh chụp sau 1,5 s — nhịp 10 Hz phải ra ≥3`);
  if (tA.ds.length !== 1) fail(`A thấy ${tA.ds.length} người, cần đúng 1 (và KHÔNG có bản sao của chính mình)`);
  if (tB.ds.length !== 1) fail(`B thấy ${tB.ds.length} người, cần đúng 1`);
  if (tA.ds[0] && tA.ds[0].ten !== 'NguoiB') fail(`A thấy tên "${tA.ds[0].ten}", cần NguoiB`);
  if (tB.ds[0] && tB.ds[0].ten !== 'NguoiA') fail(`B thấy tên "${tB.ds[0].ten}", cần NguoiA`);
  if (tA.ds[0] && Math.abs(tA.ds[0].x - 1380) > 40) fail(`A thấy B ở x=${tA.ds[0].x}, cần ~1380`);
  if (tA.ds[0] && tA.ds[0].map !== 'daohoa') fail(`bóng người mang map "${tA.ds[0].map}"`);
  if (tA.ds[0] && !(tA.ds[0].mhp > 1)) fail('thanh máu không có dữ liệu thật (maxHp ≤ 1)');

  // ── 2. TẦNG HÀNH VI: thân người thứ hai phải VẼ RA ĐIỂM ẢNH ───────────────────────────
  // Hai cái bẫy đã dẫm ở đây, cả hai đều cho ra một bài XANH VÌ LÝ DO SAI:
  //
  //  ① Đếm điểm ảnh "khác trong suốt" ra đúng 84×120 = 10.080 ở CẢ HAI lượt. Mặt đất của game
  //    là nền ĐẶC nên ô nào cũng đủ alpha. Bằng nhau ⇒ trông y như "không vẽ được gì".
  //  ② Đổi sang đếm điểm ảnh ĐỔI MÀU thì ra 10.056/10.080 — tức 99,8% ô đổi màu. Không phải
  //    vì bóng người to bằng cả ô, mà vì CẢ CẢNH TRÔI giữa hai lần vẽ: mây, sóng cỏ, ánh sáng
  //    đều chạy theo `performance.now()`, và hai lệnh `evaluate` cách nhau hàng chục mili giây.
  //    Bài xanh, nhưng nó đang đo hoạt ảnh nền chứ không đo bóng người.
  //
  // Cách đúng, hai lớp:
  //   · vẽ CẢ HAI lượt trong CÙNG một `evaluate` ⇒ hoạt ảnh chỉ trôi ~1 ms;
  //   · và đo thêm một ô ĐỐI CHỨNG ở chỗ không có ai đứng, rồi đòi ô có bóng phải đổi NHIỀU
  //     HƠN HẲN ô đối chứng. Ô đối chứng chính là sàn nhiễu của hoạt ảnh nền.
  //
  // Ô đặt theo toạ độ MÀN HÌNH = (thế giới − camera) × zoom — bài học đã ghi trong CLAUDE.md;
  // dùng nhầm `W` thay `VW`, hoặc quên tỉ lệ bộ đệm/CSS, là đo vào ô trống và ra 0 ở cả hai.
  const doVe = await A.p.evaluate(({ bx, by, cx, cy }) => {
    const cv = document.getElementById('game'), g = cv.getContext('2d');
    const z = (typeof ZOOM_MUC !== 'undefined' && typeof ZOOM_CHON !== 'undefined')
      ? ZOOM_MUC[ZOOM_CHON] : 1;
    const tl = cv.width / (cv.clientWidth || cv.width);
    const W = 84, H = 120;
    const lay = (wx, wy) => {
      const sx = (wx - camera.x) * z, sy = (wy - camera.y) * z;
      const x0 = Math.max(0, Math.round((sx - W / 2) * tl));
      const y0 = Math.max(0, Math.round((sy - H * 0.82) * tl));
      return g.getImageData(x0, y0, Math.round(W * tl), Math.round(H * tl)).data;
    };
    const giu = window.NETPLAYERS.slice();
    render();
    const coB = lay(bx, by), coC = lay(cx, cy);
    window.NETPLAYERS.length = 0;
    render();
    const khongB = lay(bx, by), khongC = lay(cx, cy);
    window.NETPLAYERS.length = 0; window.NETPLAYERS.push(...giu);   // an toàn: cùng một lượt
    const dem = (u, v) => {
      let n = 0;
      for (let i = 0; i < u.length; i += 4) if (u[i] !== v[i] || u[i+1] !== v[i+1] || u[i+2] !== v[i+2]) n++;
      return n;
    };
    return { oBong: dem(coB, khongB), oDoiChung: dem(coC, khongC), tong: coB.length / 4 };
  }, { bx: 1380, by: 1500, cx: 1780, cy: 1200 });

  console.log('2 · điểm ảnh đổi — ô có bóng:', doVe.oBong, '· ô đối chứng:', doVe.oDoiChung,
              '· cỡ ô:', doVe.tong);
  if (doVe.oDoiChung > doVe.tong * 0.15) {
    fail(`ô đối chứng đổi ${doVe.oDoiChung}/${doVe.tong} điểm ảnh — hoạt ảnh nền trôi quá nhiều, `
       + 'phép đo này không tách được bóng người ra khỏi nhiễu. Đừng đọc kết quả dưới là "xanh".');
  }
  if (doVe.oBong < 400) fail(`thân người thứ hai gần như không vẽ ra gì: ${doVe.oBong} điểm ảnh đổi`);
  if (doVe.oBong < doVe.oDoiChung * 6) {
    fail(`ô có bóng (${doVe.oBong}) không nổi hơn hẳn ô đối chứng (${doVe.oDoiChung})`);
  }

  // ── 3. Mỗi thân người một ô nhớ độ cao bay — không giành nhau một biến ─────────────────
  // Trước bản này `bayCao` là MỘT biến module; hai người đeo cánh khác bậc sẽ đạp lên nhau.
  const bay = await A.p.evaluate(() => {
    const ta = window.netDoc().p;
    return { khoaTa: veKhoa(ta), khoaHo: window.NETPLAYERS.map(veKhoa), soO: _bayCao.size };
  });
  console.log('3 · khoá vẽ:', JSON.stringify(bay));
  if (bay.khoaTa !== 'ta') fail(`khoá vẽ của mình là "${bay.khoaTa}", cần "ta"`);
  if (bay.khoaHo.includes('ta')) fail('thân người từ xa dùng chung khoá vẽ với người chơi của mình');
  if (new Set(bay.khoaHo).size !== bay.khoaHo.length) fail('hai thân người từ xa trùng khoá vẽ');

  // ── 3b. THÂN NGƯỜI TỪ XA PHẢI NHÚC NHÍCH ─────────────────────────────────────────────
  // ⚠ ĐÂY LÀ MỆNH ĐỀ BẮT ĐÚNG LỖI ĐÃ SHIP. Bốn mục trên đặt toạ độ MỘT LẦN rồi đo một ảnh
  // TĨNH, nên chúng gác "có vẽ ra không" — không gác "có đi được không". Bản đầu của `noiSuy`
  // đặt `t.at` và `t.bt` BẰNG NHAU (span = 1 ms) trong khi vẽ ở mốc `now − TRE_MS`, tức luôn
  // trước `at` ⇒ `k` kẹp về 0 mọi khung ⇒ thân người từ xa đứng chết ở vị trí ĐẦU TIÊN, vĩnh
  // viễn. Cả năm mệnh đề cũ vẫn xanh trong lúc mục tiêu của Giai đoạn 1 — "nhìn thấy nhau
  // CHẠY" — hỏng hoàn toàn. Không một lỗi nào in ra.
  {
    await B.p.evaluate(() => { player.x += 300; });
    await cho(1400);                       // vài nhịp ảnh chụp + trọn một lượt trượt
    const r = await B.p.evaluate(() => Math.round(player.x));
    const t = await A.p.evaluate(() => window.NETPLAYERS.map(n => Math.round(n.x)));
    console.log('3b · B đứng x =', r, '· A thấy x =', JSON.stringify(t));
    if (t.length !== 1) fail(`A phải thấy đúng 1 thân người, thấy ${t.length}`);
    // Ngưỡng 40px, không đòi khớp tuyệt đối: nội suy vốn trễ một nhịp, và đòi bằng chằn chặn là
    // bài đỏ theo xúc xắc chứ không theo lỗi.
    else if (Math.abs(t[0] - r) > 40) fail(`B đã dời tới x=${r} mà A vẫn vẽ ở x=${t[0]} — thân người từ xa đứng chết`);
  }

  // ── 3c. RA ĐÒN PHẢI ĐI QUA DÂY ─────────────────────────────────────────────────────────
  // Trước bản này ảnh chụp mang x·y·hướng·máu·cấp·lớp·tên và KHÔNG mang trạng thái ra đòn, nên
  // `atkAnim`/`castT` của thân người từ xa đứng 0 vĩnh viễn — mọi người trượt quanh bản đồ mà
  // không ai đánh gì. Không lỗi nào in ra, và cả năm mệnh đề trên vẫn xanh: chúng đo VỊ TRÍ.
  //
  // Hai lớp, vì hai thứ hỏng khác nhau:
  //   (a) DÂY  — lái `doBasic()` THẬT trên B rồi đòi A phải thấy `atkAnim` nhấc lên khỏi 0.
  //              Đặt thẳng `player.atkAnim = 0.22` là kiểm chính cái mình vừa viết.
  //   (b) VẼ   — với `atkAnim` bật, lớp nhân vật phải VẬT CHẤT HOÁ bên cạnh Axie, tức phải ra
  //              thêm điểm ảnh. Một trường đi qua dây mà không ai vẽ nó thì vẫn là không thấy gì.
  {
    const chuanBi = await B.p.evaluate(() => {
      // ⚠ `mobs` bare, KHÔNG `window.mobs`. Khai bằng `let` ở tầng cao nhất nên nó không gắn
      // vào `window` — đúng cái bẫy đã ghi cho `player` trong net.js. `window.mobs` trả
      // `undefined` và cảnh dựng hỏng trong im lặng.
      const m = mobs.find(x => x && x.hp > 0);
      if (!m) return false;
      player.x = m.x + 24; player.y = m.y; player.auto = false;
      return true;
    });
    if (!chuanBi) fail('3c: không dựng được cảnh — daohoa không có con quái nào còn sống');

    let dinh = 0;
    for (let i = 0; i < 16 && chuanBi; i++) {
      await B.p.evaluate(() => { player.cd.basic = 0; doBasic(); });
      await cho(120);
      const v = await A.p.evaluate(() => Math.max(0, ...window.NETPLAYERS.map(n => n.atkAnim || 0)));
      if (v > dinh) dinh = v;
    }
    console.log('3c(a) · A thấy atkAnim lớn nhất của B:', dinh.toFixed(3));
    if (chuanBi && dinh <= 0.01) {
      fail('B đang đánh mà A thấy atkAnim = 0 — trạng thái ra đòn không đi qua dây');
    }

    // (b) cùng lối đo với §2: hai lượt vẽ trong CÙNG một evaluate (hoạt ảnh nền chỉ trôi ~1 ms)
    // và một ô đối chứng làm sàn nhiễu.
    const doDanh = await A.p.evaluate(() => {
      const np = window.NETPLAYERS[0];
      if (!np) return null;
      const cv = document.getElementById('game'), g = cv.getContext('2d');
      const z = (typeof ZOOM_MUC !== 'undefined' && typeof ZOOM_CHON !== 'undefined')
        ? ZOOM_MUC[ZOOM_CHON] : 1;
      const tl = cv.width / (cv.clientWidth || cv.width);
      const W = 170, H = 150;   // rộng hơn ô của §2: lớp nhân vật đứng KẾ BÊN Axie, không chồng lên
      const lay = (wx, wy) => {
        const sx = (wx - camera.x) * z, sy = (wy - camera.y) * z;
        const x0 = Math.max(0, Math.round((sx - W / 2) * tl));
        const y0 = Math.max(0, Math.round((sy - H * 0.82) * tl));
        return g.getImageData(x0, y0, Math.round(W * tl), Math.round(H * tl)).data;
      };
      // ⚠ KÉO THÂN NGƯỜI VỀ CẠNH MÌNH TRƯỚC KHI ĐO. Mục (a) vừa dời B tới sát một con quái,
      // tức rất có thể ra ngoài khung hình của A — và ô đo nằm ngoài canvas thì CẢ HAI lượt
      // đều trả về vùng trống, hiệu số ra 0, trông y hệt "lớp nhân vật không vẽ". `noiSuy`
      // chạy ở rAF nên trong cùng một `evaluate` không có gì ghi đè lại.
      const giuX = np.x, giuY = np.y;
      np.x = player.x + 110; np.y = player.y;
      const cxw = np.x + 420, cyw = np.y - 300;      // ô đối chứng: chỗ không có ai đứng
      // ⚠⚠ TẮT `hurtT` VÀ `chet` TRONG LÚC ĐO. `_lopHien` đòi `!_chet && !(hurtT > 0)`, mà
      // mục (a) vừa dời B tới SÁT một con quái để lái một cú đánh thật — nên lúc tới đây B
      // đang bị đánh liên tục và lớp nhân vật KHÔNG BAO GIỜ vật chất hoá. Thứ còn đổi chỉ là
      // khối GIẬT của con Axie, đo được 148 điểm ảnh: trên sàn nhiễu (19) nhưng dưới sàn
      // mệnh đề (300), nên bài đỏ với đúng cái câu "lớp nhân vật không hiện ra" trong khi
      // sợi dây hoàn toàn nguyên vẹn. Đỏ hay xanh tuỳ con quái có kịp ra đòn trong 120ms hay
      // không ⇒ xúc xắc. CLAUDE.md đã ghi vế `!hurtT` này một lần rồi, chỉ là vá chưa tới.
      const giuA = np.atkAnim, giuC = np.castT, giuH = np.hurtT, giuCh = np.chet;
      np.hurtT = 0; np.chet = false;
      // ⚠⚠ HỎI THẲNG QUYẾT ĐỊNH, ĐỪNG SUY TỪ ĐIỂM ẢNH. Từ đợt "Axie NAY RA ĐÒN" thì bật
      // `atkAnim` làm CON AXIE vung theo, nên điểm ảnh đổi vài nghìn kể cả khi lớp nhân vật
      // không hiện ra một lần nào. Thử ngược đã chứng minh: ép `_lopHien = false` trong
      // `drawPlayer` mà ô có bóng vẫn đổi 5.492 điểm ảnh ⇒ mệnh đề đếm điểm ảnh MỘT MÌNH là
      // một mệnh đề rỗng, chỉ dán nhãn "lớp nhân vật không hiện ra" cho một thứ khác.
      // `drawPlayer` phơi sẵn quyết định ra `window.__veChet`, khoá theo từng thân người.
      window.TEST_MODE = true;
      const khoa = veKhoa(np);
      np.atkAnim = 0.22; np.castT = 0; render();
      const qdCo = (window.__veChet || {})[khoa];
      const coB = lay(np.x, np.y), coC = lay(cxw, cyw);
      np.atkAnim = 0;    np.castT = 0; render();
      const qdKhong = (window.__veChet || {})[khoa];
      const khongB = lay(np.x, np.y), khongC = lay(cxw, cyw);
      np.atkAnim = giuA; np.castT = giuC; np.hurtT = giuH; np.chet = giuCh;
      np.x = giuX; np.y = giuY;
      const dem = (u, v) => { let n = 0;
        for (let i = 0; i < u.length; i += 4) if (u[i] !== v[i] || u[i+1] !== v[i+1] || u[i+2] !== v[i+2]) n++;
        return n; };
      return { oBong: dem(coB, khongB), oDoiChung: dem(coC, khongC), tong: coB.length / 4,
               lopHienCo: !!(qdCo && qdCo.lopHien), lopHienKhong: !!(qdKhong && qdKhong.lopHien),
               coQd: !!qdCo };
    });
    console.log('3c(b) · điểm ảnh đổi khi bật atkAnim — ô có bóng:', doDanh && doDanh.oBong,
                '· ô đối chứng:', doDanh && doDanh.oDoiChung,
                '· _lopHien bật/tắt:', doDanh && doDanh.lopHienCo, '/', doDanh && doDanh.lopHienKhong);
    if (!doDanh) fail('3c(b): A không còn thân người nào để đo');
    else {
      if (doDanh.oDoiChung > doDanh.tong * 0.15) {
        fail(`3c(b): ô đối chứng đổi ${doDanh.oDoiChung}/${doDanh.tong} — nhiễu nền quá lớn, `
           + 'đừng đọc kết quả dưới là "xanh"');
      }
      if (!doDanh.coQd) {
        fail('3c(b): `window.__veChet` không có mục nào cho thân người từ xa — que dò hỏng, '
           + 'đừng đọc mấy dòng dưới là "xanh"');
      } else if (!doDanh.lopHienCo) {
        fail('3c(b): bật atkAnim mà `_lopHien` vẫn false — lớp nhân vật không vật chất hoá');
      } else if (doDanh.lopHienKhong) {
        fail('3c(b): tắt atkAnim mà `_lopHien` vẫn true — nó không đọc trạng thái ra đòn');
      }
      if (doDanh.oBong < 300) {
        fail(`3c(b): bật atkAnim mà hình chỉ đổi ${doDanh.oBong} điểm ảnh — thân người từ xa không phản ứng gì`);
      }
      if (doDanh.oBong < doDanh.oDoiChung * 4) {
        fail(`3c(b): ô có bóng (${doDanh.oBong}) không nổi hơn hẳn ô đối chứng (${doDanh.oDoiChung})`);
      }
    }
  }

  // ── 4. Rời map thì bóng biến mất ngay, không lạc sang map mới ─────────────────────────
  await B.p.evaluate(() => travelTo('ngoai'));
  await cho(900);
  const sauKhiDi = await thay(A);
  console.log('4 · sau khi B rời map, A thấy:', JSON.stringify(sauKhiDi.ds));
  if (sauKhiDi.ds.length !== 0) fail(`B đã sang map khác mà A còn thấy ${sauKhiDi.ds.length} bóng`);

  // ── 5. Đóng kết nối thì máy chủ dọn ────────────────────────────────────────────────────
  await B.ctx.close();
  await cho(900);
  // ⚠ Hỏi /health từ NODE, không từ trong trang. Trang phục vụ ở cổng game còn máy chủ ở cổng
  // khác ⇒ khác origin ⇒ fetch bị chặn, và lỗi hiện ra là "Failed to fetch" chứ không phải
  // "máy chủ sai". Bài kiểm không nên đi qua một hàng rào chẳng liên quan gì tới thứ nó đo.
  const health = await fetch('http://localhost:' + CONG_WS + '/health').then(r => r.json());
  console.log('5 · /health:', JSON.stringify(health));
  if (health.nguoi !== 1) fail(`đóng một trang rồi mà /health còn ${health.nguoi} người, cần 1`);
  if (!(health.soTick > 5)) fail('vòng phát ảnh chụp không chạy');

  await A.ctx.close();
  await b.close();
  dongMay();

  console.log('errors:', JSON.stringify(errs));
  console.log(bad === 0 && errs.length === 0 ? 'PASS' : 'FAIL(' + bad + ')');
  process.exit(bad === 0 && errs.length === 0 ? 0 : 1);
})();
