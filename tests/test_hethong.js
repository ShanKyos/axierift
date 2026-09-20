// MENU HỆ THỐNG (F6) · NGÂN HÀNG NGỌC (N) · LỆNH NHẶT · CÀI ĐẶT HAI TAB
//
// Chủ dự án đưa ba ảnh mẫu MU và chốt bố cục. Bài này gác sáu kiểu hỏng, và năm trong sáu
// KHÔNG ném lỗi:
//  1. NÚT CHẾT. Bốn nút trong sảnh chỉ là chuỗi `onclick` — gõ sai một chữ là bấm không ra gì.
//     §1 BẤM THẬT rồi hỏi bảng có mở không (bài học `openEvoPanel` của test_cayky).
//  2. ICON 404. `NGOC_ANH` trỏ vào tệp `.webp` nướng ngoài repo-tree; thiếu một tệp thì thẻ
//     <img> hiện ra một ô trống — không lỗi console, không bài nào đỏ. §4 hỏi `naturalWidth`.
//  3. ICON GIỐNG NHAU. Cả sáu loại từng dùng CHUNG một hình vẽ canvas đổi màu; nếu ai đó lùi
//     về đường cũ thì sáu hàng lại là sáu cái đĩa. §4 đòi sáu đường dẫn KHÁC NHAU.
//  4. BẤM KHÔNG ĂN. `khoNgocGui` chỉ gọi `renderBag()`; bảng mới không nằm trong đó nên số
//     đứng im. §5 đo số TRÊN MÀN trước/sau, không đo `player`.
//  5. CƯỚP PHÍM J. Ảnh mẫu ghi "Ngân hàng ngọc (J)" — mà J ở game này là phím NHẶT ĐỒ. §3 gác
//     chiều đó: N mở được bank, và J vẫn phải là nhặt đồ.
//  6. NHẬT KÝ SANG PHẢI, sườn trái để trống cho chat (§6).
const { chromium } = require('playwright');
const PORT = process.argv[2] || '8853';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://localhost:' + PORT + '/index.html');
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(600);
  let bad = 0; const fail = m => { console.log('FAIL ' + m); bad++; };
  const pass = m => console.log('PASS ' + m);

  await p.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
  });
  await p.waitForTimeout(1200);
  await p.evaluate(() => {
    player.jewels = { chucPhuc:25, linhHon:3, sinhMenh:2, honDon:9 };
    player.gems = { honNguyen:3 };
    if (!player.khoNgoc) player.khoNgoc = { hap:{} };
    document.querySelectorAll('.tut-box,#tut').forEach(e => e.remove());
  });

  // ── §1 F6 ra SẢNH, và bốn nút đều bấm ra bảng thật ─────────────────────────
  const r1 = await p.evaluate(() => {
    closePanels(); togglePanel('help');
    const pn = document.getElementById('panel-help');
    if (!pn || pn.classList.contains('hidden')) return { khongMo: true };
    const nut = [...pn.querySelectorAll('.sys-nut')];
    return { soNut: nut.length, chu: nut.map(n => (n.querySelector('span') || {}).textContent || ''),
             tieu: (pn.querySelector('.bang-tieu') || {}).textContent || '',
             conPhimTat: !!pn.querySelector('.hd-luoi') };
  });
  if (r1.khongMo) fail('§1 F6 không mở được bảng — cả bài không chấm được');
  else {
    if (r1.soNut === 4) pass(`§1 F6 ra sảnh bốn nút: ${r1.chu.join(' · ')}`);
    else fail(`§1 sảnh có ${r1.soNut} nút, cần 4 — đang là [${r1.chu}]`);
    if (/Menu Hệ Thống/.test(r1.tieu)) pass('§1 tiêu đề đúng "Menu Hệ Thống"');
    else fail(`§1 tiêu đề sai: "${r1.tieu.trim()}"`);
    // Phím tắt PHẢI rời khỏi F6 — còn nằm đây là hai cửa cùng một nội dung.
    if (!r1.conPhimTat) pass('§1 bảng phím tắt đã rời khỏi F6 (nay là tab của Cài Đặt)');
    else fail('§1 F6 vẫn in bảng phím tắt — nội dung đó phải nằm ở tab Phím Tắt của Cài Đặt');
  }

  // ── §2 bấm thật từng nút, bảng đích phải mở ───────────────────────────────
  for (const [ten, pid] of [['Cài Đặt','panel-settings'], ['Ngân Hàng Ngọc','panel-ngocbank'], ['Lệnh Nhặt','panel-nhat']]){
    const o = await p.evaluate(([ten2, pid2]) => {
      closePanels(); togglePanel('help');
      const nut = [...document.querySelectorAll('#panel-help .sys-nut')]
        .find(n => ((n.querySelector('span') || {}).textContent || '').trim() === ten2);
      if (!nut) return { thieu: true };
      nut.click();
      const pn = document.getElementById(pid2);
      return { mo: !!pn && !pn.classList.contains('hidden'), coChu: !!pn && pn.innerHTML.length > 80 };
    }, [ten, pid]);
    if (o.thieu) fail(`§2 không tìm thấy nút "${ten}" trong sảnh`);
    else if (o.mo && o.coChu) pass(`§2 nút "${ten}" mở ra ${pid} và bảng có nội dung`);
    else fail(`§2 nút "${ten}" hỏng — bảng mở:${o.mo} · có nội dung:${o.coChu}`);
  }

  // ── §3 phím N mở bank · J VẪN là nhặt đồ ──────────────────────────────────
  await p.evaluate(() => closePanels());
  await p.keyboard.press('n');
  await p.waitForTimeout(250);
  const r3 = await p.evaluate(() => ({
    mo: !document.getElementById('panel-ngocbank').classList.contains('hidden'),
    // J phải còn nguyên nghĩa cũ trong bảng phím VÀ trong chính bộ bắt phím.
    jNhat: (window.HD_BANG || []).some(g => g.hang.some(([k, v]) => k === 'J' && /pick/.test(v))),
    jTrongMa: typeof phimXuong === 'function' && /tryPickLoot|nhat/i.test(phimXuong.toString()),
    nTrongBang: (window.HD_BANG || []).some(g => g.hang.some(([k]) => k === 'N')),
  }));
  if (r3.mo) pass('§3 phím N mở Ngân Hàng Ngọc'); else fail('§3 phím N không mở được Ngân Hàng Ngọc');
  if (r3.jNhat && r3.jTrongMa) pass('§3 phím J vẫn là NHẶT ĐỒ — không bị cướp cho cửa sổ');
  else fail(`§3 phím J đã mất nghĩa nhặt đồ (bảng:${r3.jNhat} · mã:${r3.jTrongMa}) — đó là đường DUY NHẤT nhặt đồ bằng bàn phím`);
  if (r3.nTrongBang) pass('§3 phím N có mặt trong bảng phím tắt');
  else fail('§3 thêm phím N mà quên khai trong HD_BANG — bảng dạy chơi nói thiếu một phím');

  // ── §4 icon ngọc: tệp THẬT, tải được, và sáu cái KHÁC NHAU ────────────────
  const r4 = await p.evaluate(async () => {
    closePanels(); togglePanel('ngocbank');
    await new Promise(r => setTimeout(r, 350));
    const ic = [...document.querySelectorAll('#panel-ngocbank .nb-list .nb-ic')].slice(0, KHO_NGOC_KEYS.length);
    await Promise.all(ic.map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; })));
    return { so: ic.length,
             src: ic.map(i => i.getAttribute('src')),
             hong: ic.filter(i => !i.naturalWidth).map(i => i.getAttribute('src')) };
  });
  // ĐỌC SỐ HÀNG TỪ GAME, đừng chép cứng: Tu La Tinh Thạch đã gỡ (GO_TULA) nên 6 → 5, và bài
  // này đỏ ở một chỗ chẳng liên quan gì tới thứ nó định gác (icon 404).
  const soHang = await p.evaluate(() => KHO_NGOC_KEYS.length);
  if (r4.so !== soHang) fail(`§4 chỉ có ${r4.so} hàng ngọc, cần ${soHang}`);
  else {
    if (!r4.hong.length) pass(`§4 cả ${soHang} icon ngọc tải được (không tệp nào 404)`);
    else fail('§4 icon không tải được: ' + r4.hong.join(', '));
    const rieng = new Set(r4.src).size;
    if (rieng === soHang && r4.src.every(s2 => /assets\/ui\/ngoc_/.test(s2)))
      pass(`§4 ${soHang} icon là ${soHang} TỆP TRANH khác nhau, không phải một hình vẽ đổi màu`);
    else fail(`§4 icon trùng nhau hoặc không phải tranh thật — ${rieng}/${soHang} đường dẫn riêng: ${r4.src.join(' ')}`);
  }

  // ── §5 gửi/rút ĂN THẬT, và bảng TỰ VẼ LẠI ─────────────────────────────────
  const r5 = await p.evaluate(async () => {
    closePanels(); togglePanel('ngocbank');
    await new Promise(r => setTimeout(r, 300));
    const doc = () => {
      const row = document.querySelector('#panel-ngocbank .nb-row');
      return { tui: (row.querySelector('.nb-ten span') || {}).textContent || '',
               kho: (row.querySelector('.nb-kho') || {}).textContent || '' };
    };
    const truoc = doc(), tuiTruoc = player.jewels.chucPhuc;
    // nút "10" của hàng đầu
    const nut = [...document.querySelectorAll('#panel-ngocbank .nb-row .nb-b')].find(b2 => b2.textContent.trim() === '10');
    if (!nut) return { thieuNut: true };
    nut.click();
    await new Promise(r => setTimeout(r, 200));
    return { truoc, sau: doc(), tuiTruoc, tuiSau: player.jewels.chucPhuc, khoSau: khoNgoc().chucPhuc };
  });
  if (r5.thieuNut) fail('§5 không thấy nút "10" trên hàng ngọc đầu tiên');
  else {
    if (r5.tuiSau === r5.tuiTruoc - 10 && r5.khoSau === 10)
      pass(`§5 bấm "10": túi ${r5.tuiTruoc}→${r5.tuiSau}, kho ${r5.khoSau}`);
    else fail(`§5 gửi sai — túi ${r5.tuiTruoc}→${r5.tuiSau} (cần −10), kho ${r5.khoSau} (cần 10)`);
    if (r5.truoc.tui !== r5.sau.tui && r5.truoc.kho !== r5.sau.kho)
      pass(`§5 bảng tự vẽ lại: "${r5.truoc.tui.trim()}"→"${r5.sau.tui.trim()}", kho ${r5.truoc.kho}→${r5.sau.kho}`);
    else fail(`§5 số trên màn KHÔNG đổi sau khi bấm — người chơi đọc ra là "bấm không ăn" (túi "${r5.truoc.tui.trim()}"→"${r5.sau.tui.trim()}", kho ${r5.truoc.kho}→${r5.sau.kho})`);
  }

  // ── §6 Cài Đặt hai tab, tab Phím Tắt in đủ bảng ───────────────────────────
  const canHang = await p.evaluate(() => (window.HD_BANG || []).reduce((a, g) => a + g.hang.length, 0));
  const r6 = await p.evaluate(async () => {
    closePanels(); togglePanel('settings');
    await new Promise(r => setTimeout(r, 250));
    const pn = document.getElementById('panel-settings');
    const soTab = pn.querySelectorAll('.bang-tab').length;
    window.setSetTab('phim');
    await new Promise(r => setTimeout(r, 200));
    return { soTab, hang: pn.querySelectorAll('.hd-hang').length,
             roKhoa: /help\.[a-z]+\./.test(pn.textContent) };
  });
  if (r6.soTab === 2) pass('§6 Cài Đặt có đúng hai tab (Thiết Lập · Phím Tắt)');
  else fail(`§6 Cài Đặt có ${r6.soTab} tab, cần 2`);
  if (r6.hang === canHang) pass(`§6 tab Phím Tắt in đủ ${canHang} hàng của HD_BANG`);
  else fail(`§6 tab Phím Tắt in ${r6.hang} hàng, HD_BANG có ${canHang}`);
  if (!r6.roKhoa) pass('§6 không rò khoá i18n thô ra mặt bảng');
  else fail('§6 có khoá `help.*` chưa dịch lọt ra bảng — thiếu mục trong strings/vi.js hoặc en.js');

  // ── §7 Lệnh Nhặt: công tắc ăn vào CỜ THẬT ─────────────────────────────────
  const r7 = await p.evaluate(async () => {
    closePanels(); togglePanel('nhat');
    await new Promise(r => setTimeout(r, 250));
    const truoc = !!player.autoNgoc;
    const nut = [...document.querySelectorAll('#panel-nhat .set-row .mini-btn')][0];
    if (!nut) return { thieu: true };
    const chuTruoc = nut.textContent.trim();
    nut.click();
    await new Promise(r => setTimeout(r, 200));
    const chu = [...document.querySelectorAll('#panel-nhat .set-row .mini-btn')][0].textContent.trim();
    return { truoc, sau: !!player.autoNgoc, chuTruoc, chu };
  });
  // ⚠ HAI vế, và vế sau mới là vế dễ hỏng: `toggleAutoNgoc` vốn chỉ gọi `renderBag()`, nên cờ
  // đổi thật mà bảng Lệnh Nhặt đứng im — người chơi đọc ra là "bấm không ăn". Chốt "nhãn khớp
  // BẬT|TẮT" thì xanh ở cả hai trạng thái, tức không gác được gì; phải đòi nhãn ĐỔI.
  if (r7.thieu) fail('§7 bảng Lệnh Nhặt không có công tắc nào');
  else if (r7.truoc !== r7.sau && /^(BẬT|TẮT)$/.test(r7.chu) && r7.chu !== r7.chuTruoc)
    pass(`§7 công tắc Lệnh Nhặt đổi cờ thật (${r7.truoc}→${r7.sau}) và nhãn vẽ lại "${r7.chuTruoc}"→"${r7.chu}"`);
  else fail(`§7 công tắc không ăn — cờ ${r7.truoc}→${r7.sau}, nhãn "${r7.chuTruoc}"→"${r7.chu}"`);

  // ── §8 Nhật Ký sang PHẢI, sườn trái để trống cho chat ─────────────────────
  const r8 = await p.evaluate(() => {
    closePanels();
    const w = document.getElementById('combat-log-wrap');
    if (!w) return { thieu: true };
    const r = w.getBoundingClientRect();
    return { trai: Math.round(r.left), phai: Math.round(r.right), man: innerWidth,
              hien: !w.classList.contains('hidden') };
  });
  if (r8.thieu) fail('§8 không còn #combat-log-wrap');
  else if (r8.trai > r8.man / 2) pass(`§8 Nhật Ký Chiến Đấu nằm nửa PHẢI màn (x=${r8.trai}/${r8.man}) — sườn trái để dành cho chat`);
  else fail(`§8 Nhật Ký vẫn ở nửa trái (x=${r8.trai}/${r8.man}) — chỗ đó dành cho khung chat`);

  if (errs.length) fail('lỗi trang: ' + errs.slice(0,3).join(' | '));
  console.log(bad ? `\n${bad} FAIL` : '\nOK');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
