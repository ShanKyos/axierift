// BẢN TIẾNG ANH PHẢI KHÔNG RÒ TIẾNG VIỆT — và đây là chỗ duy nhất đo được chuyện đó.
//
// ⚠⚠ RECORDER PHẢI NẰM TRONG CÙNG. Bọc `fillText` lúc chạy là bọc NGOÀI lớp vá của `lang.js`,
// nên nó đọc được chuỗi NGUỒN chứ không phải chữ VẼ RA — lượt đo đầu của tôi báo 84,3% canvas
// còn tiếng Việt trong khi con số thật là 61,4%. `addInitScript` chạy trước mọi script của
// trang, nên recorder bọc trước, lang.js bọc ra ngoài nó, và thứ recorder nhận được là bản ĐÃ
// dịch. *Một que dò sai thứ tự cho ra một con số trông hoàn toàn thuyết phục.*
//
// ⚠ VÀ PHẢI CHỜ `MutationObserver`. lang.js dịch DOM bất đồng bộ; đọc `innerText` ngay sau
// `togglePanel` là đọc bảng chưa ai dịch — nó thổi con số DOM từ 48 lên 188.
//
// ⚠ HAI TẦNG, đừng bỏ tầng nào: chữ trong game nằm ở DOM (bảng, nút) VÀ trên CANVAS (nhãn đầu
// quái, số bay, băng-rôn, HUD). Bỏ tầng canvas là báo "đã dịch xong" trong khi cả thế giới
// trong màn vẫn tiếng Việt.
const { chromium } = require('playwright');

let bad = 0;
const fail = m => { bad++; console.log('FAIL ' + m); };
const pass = m => console.log('  ok  ' + m);

const VN = /[àáâãèéêìíòóôõùúăđĩũơưƯĂĐĨŨƠẠ-ỹÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚ]/;
// Bảng nào cũng phải quét — sáu bảng dưới đây từng bị bỏ sót vì bộ quét đầu chỉ biết chín cái.
const BANG = ['char','inv','bag','skill','quest','qlog','map','settings','help','party','friend',
              'forge','ngocbank','nhat','stage'];

(async () => {
  const port = process.argv[2] || '8853';
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1600, height: 950 } });
  await p.addInitScript(() => {
    window.__chuVe = [];
    const C = CanvasRenderingContext2D.prototype;
    for (const m of ['fillText', 'strokeText']) {
      const g = C[m];
      C[m] = function (t, ...r) { try { window.__chuVe.push(String(t)); } catch (e) {} return g.apply(this, [t, ...r]); };
    }
  });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://localhost:' + port + '/index.html?lang=en&test=1');
  await p.waitForFunction(() => window.__gameReady).catch(() => {});

  const kq = await p.evaluate(async (BANG) => {
    const nghi = ms => new Promise(r => setTimeout(r, ms));
    window.TEST_MODE = true;
    startGame('thieulam', null);
    player.level = 60; calcDerived();
    for (let i = 0; i < 90; i++) { update(1/60); render(); }
    travelTo('corran');
    for (let i = 0; i < 120; i++) { update(1/60); render(); }
    const dom = {}, thieu = [];
    for (const k of BANG) {
      const el = document.getElementById('panel-' + k);
      if (!el) { thieu.push(k); continue; }
      try { togglePanel(k); } catch (e) {}
      for (let i = 0; i < 6; i++) render();
      await nghi(150);                       // chờ MutationObserver của lang.js
      dom[k] = el.innerText || '';
      try { togglePanel(k); } catch (e) {}
      await nghi(30);
    }
    await nghi(200);
    return { loc: (typeof i18nLocale === 'function') ? i18nLocale() : '?',
             canvas: [...new Set(window.__chuVe)], dom, thieu };
  }, BANG);

  // ── chốt tự kiểm: chưa ở tiếng Anh thì mọi con số dưới đây vô nghĩa ──
  if (kq.loc !== 'en') fail('cảnh dựng hỏng: locale = ' + kq.loc + ' (phải là en)');
  if (kq.canvas.length < 20) fail('cảnh dựng hỏng: chỉ bắt được ' + kq.canvas.length + ' chuỗi canvas — recorder không chạy?');
  if (kq.thieu.length) fail('① không tìm thấy bảng: ' + kq.thieu.join(', ') + ' — bộ quét đang MÙ với chúng');
  else pass('① tìm thấy đủ ' + BANG.length + ' bảng');

  const cvVn = kq.canvas.filter(s => VN.test(s));
  if (cvVn.length) fail('② CANVAS còn ' + cvVn.length + '/' + kq.canvas.length + ' chuỗi tiếng Việt: '
    + cvVn.slice(0, 5).map(s => s.slice(0, 60)).join(' | '));
  else pass('② canvas: 0/' + kq.canvas.length + ' chuỗi còn tiếng Việt');

  let tong = 0; const chiTiet = [];
  for (const [k, v] of Object.entries(kq.dom)) {
    const d = [...new Set(String(v).split('\n').map(x => x.trim()).filter(x => x && VN.test(x)))];
    if (d.length) { tong += d.length; chiTiet.push(k + '(' + d.length + '): ' + d[0].slice(0, 70)); }
  }
  // Bánh cóc: con số chỉ được đi xuống. Đặt bằng ĐÚNG số đo hiện tại, không đặt một số tròn.
  const TRAN_DOM = 0;
  if (tong > TRAN_DOM) fail('③ DOM còn ' + tong + ' dòng tiếng Việt (trần ' + TRAN_DOM + '): ' + chiTiet.slice(0, 6).join(' ‖ '));
  else pass('③ DOM: ' + tong + ' dòng tiếng Việt trên ' + Object.keys(kq.dom).length + ' bảng');

  console.log('errors:', JSON.stringify(errs));
  console.log(bad === 0 && errs.length === 0 ? 'PASS' : 'FAIL(' + (bad + errs.length) + ')');
  await b.close();
  process.exit(bad === 0 && errs.length === 0 ? 0 : 1);
})();
