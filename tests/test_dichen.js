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


  // ── ④ TẦNG KỂ CHUYỆN — bơm kho chữ qua ĐÚNG bộ dịch thật rồi đọc lại ──────────────────
  // Cách duy nhất chạy cả kho chữ qua `lang.js` mà không phải mở từng bảng: tạo text-node
  // rời, chờ MutationObserver, đọc lại. ⚠ Trang dẫn truyện phải bơm bằng `innerHTML` rồi
  // duyệt TỪNG node — bơm bằng `textContent` là đưa cả chuỗi HTML vào một node, nó không
  // bao giờ khớp mục nào và bài sẽ báo 4/4 còn tiếng Việt trong khi thật ra đã dịch xong.
  const lore = await p.evaluate(async () => {
    const nghi = ms => new Promise(r => setTimeout(r, ms));
    const VN = /[àáâãèéêìíòóôõùúăđĩũơưƯĂĐĨŨƠẠ-ỹÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚ]/;
    const hop = document.createElement('div');
    hop.style.cssText = 'position:fixed;left:-99999px;top:0';
    document.body.appendChild(hop);
    const dem = async (ds) => {
      const u = [...new Set(ds.filter(x => typeof x === 'string' && x.trim()))];
      hop.innerHTML = '';
      const nodes = u.map(x => { const d = document.createElement('div'); d.textContent = x; hop.appendChild(d); return d; });
      await nghi(260);
      return { tong: u.length, con: nodes.filter(d => VN.test(d.textContent)).length };
    };
    const kq = {};
    kq.chieu_mota = await dem(Object.values(window.VOHOC_DEFS || {}).map(v => v.desc));
    kq.nhiemvu    = await dem([].concat(...(window.QUESTS || []).map(q => [q.name, q.desc])));
    kq.phutuyen   = await dem([].concat(...(window.SIDE_QUESTS || []).map(q => [q.name, q.desc])));
    kq.npc_ten    = await dem((window.NPCS || []).map(n => n.name));
    kq.lop_mota   = await dem(Object.values(window.SECTS || {}).map(x => x.desc));
    // ⚠ TÊN MÓN dựng lúc CHẠY từ `ITEM_DB`, nên không bộ quét tĩnh nào thấy chúng — chúng chỉ
    // tồn tại khi có một món rơi ra. Bot QA chơi thật mới lôi ra: 266 tên, dịch được 0. Nay 0
    // còn tiếng Việt, và mục này giữ nó ở 0. Đi sâu vì `ITEM_DB` lồng nhiều tầng.
    const tenMon = new Set();
    (function goi(v){ if (!v) return;
      if (Array.isArray(v)) return v.forEach(goi);
      if (typeof v === 'object'){ if (typeof v.name === 'string') tenMon.add(v.name); Object.values(v).forEach(goi); }
    // ⚠ `ITEM_DB` là `const` ở tầng cao nhất ⇒ KHÔNG gắn vào `window` (cùng vết sẹo `player`
    // và `curMap` đã ghi ở mục online). Hỏi `window.ITEM_DB` ra `undefined`, và mục này báo
    // `0/0` — một phép đo XANH VĨNH VIỄN vì nó không đo gì. Phải gọi tên trần.
    })(typeof ITEM_DB !== 'undefined' ? ITEM_DB : {});
    if (tenMon.size < 200) throw new Error('CANH DUNG HONG: chi doc duoc ' + tenMon.size + ' ten mon, doi >=200');
    kq.ten_mon    = await dem([...tenMon]);
    // dẫn truyện: bơm HTML rồi duyệt node, không bơm nguyên chuỗi
    let dt = 0, dtT = 0;
    for (const pg of (window.INTRO_PAGES || [])) {
      hop.innerHTML = (typeof pg === 'string') ? pg : (pg.text || pg.body || pg.t || '');
      await nghi(260);
      const w = document.createTreeWalker(hop, NodeFilter.SHOW_TEXT); let x;
      while (x = w.nextNode()) { const v = x.nodeValue; if (v && v.trim()) { dtT++; if (VN.test(v)) dt++; } }
    }
    kq.dantruyen = { tong: dtT, con: dt };
    hop.remove();
    return kq;
  });
  // ── ⑤ HUD — QUÉT TOÀN BỘ DOCUMENT, không chỉ 15 bảng ────────────────────────────────
  // ⚠ §③ quét `#panel-*`, mà hộp hướng dẫn · thẻ Nhiệm Vụ · Nhật Ký · nút bản đồ nhỏ đều
  // KHÔNG phải panel. Chúng là HUD và nằm trên màn gần như 100% thời gian chơi — tức đúng
  // thứ người chơi nhìn nhiều nhất lại là thứ không phép đo nào chạm tới. Chủ dự án gửi ảnh
  // chụp đầy tiếng Việt trong lúc bài này báo "0 dòng". Nay quét cả `document.body`.
  const hud = await p.evaluate(() => {
    const VN = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
    const hien = el => { for (let n = el; n && n !== document.body; n = n.parentElement) {
      const st = getComputedStyle(n);
      if (st.display === 'none' || st.visibility === 'hidden' || n.hidden) return false; }
      return true; };
    const ra = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let x;
    while (x = w.nextNode()) {
      const t = (x.nodeValue || '').trim();
      if (!t || !VN.test(t)) continue;
      const el = x.parentElement;
      if (!el || !hien(el)) continue;
      let id = ''; for (let n = el; n && n !== document.body; n = n.parentElement) if (n.id) { id = n.id; break; }
      ra.push((id || el.tagName) + ' :: ' + t.slice(0, 70));
    }
    return ra;
  });
  if (hud.length) { hud.slice(0, 12).forEach(h => fail('⑤ HUD còn tiếng Việt — ' + h)); }
  else pass('⑤ HUD: 0 dòng tiếng Việt trên toàn bộ document');

  // Trần đặt bằng ĐÚNG số đo hôm nay, không phải một số tròn — mỗi lần dịch thêm thì hạ nó
  // xuống. Bốn mặt dưới đã về 0 và phải Ở LẠI 0.
  const TRAN = { chieu_mota: 43, nhiemvu: 81, phutuyen: 64, npc_ten: 2, lop_mota: 0, dantruyen: 0, ten_mon: 0 };
  let no = 0;
  for (const [k, v] of Object.entries(lore)) {
    no += v.con;
    if (v.con > TRAN[k]) fail(`④ ${k}: ${v.con}/${v.tong} còn tiếng Việt — vượt trần ${TRAN[k]}`);
  }
  if (bad === 0) pass(`④ tầng kể chuyện: nợ ${no} chuỗi, đúng trần đã ghi ` +
    Object.entries(lore).map(([k, v]) => `${k} ${v.con}/${v.tong}`).join(' · '));

  console.log('errors:', JSON.stringify(errs));
  console.log(bad === 0 && errs.length === 0 ? 'PASS' : 'FAIL(' + (bad + errs.length) + ')');
  await b.close();
  process.exit(bad === 0 && errs.length === 0 ? 0 : 1);
})();
