// HỆ THỐNG SỰ KIỆN — LƯỚI CÓ CỘT, và CỘT LỊCH TRÌNH PHẢI NÓI ĐÚNG GIỜ MÁY NGƯỜI CHƠI
//
// Chủ dự án đưa ảnh mẫu MU và chốt: *"Đừng thiết kế kiểu kéo thẳng xuống nhìn khó lắm. Như vậy
// khi chơi online người chơi mới biết đang là sự kiện gì."*
//
// Bài này gác bảy kiểu hỏng. SÁU trong bảy không ném lỗi, và bốn trong số đó chỉ lộ ra khi
// CHỤP ẢNH RA NHÌN — chúng đã xảy ra thật trong chính đợt làm này:
//
//  ① LỊCH TRÌNH CHÉP TAY. Dòng tiêu đề cũ in cứng "Hung Thần 0h·4h·8h…" — mà mốc neo theo UTC
//     còn `fmtClock` in giờ ĐỊA PHƯƠNG. Đo ở Asia/Ho_Chi_Minh: thật ra là 03:00·07:00·11:00…
//     Một bảng lịch nói sai giờ thì tệ hơn hẳn không có bảng. §2 mở HAI múi giờ và đòi hai dãy
//     giờ phải KHÁC nhau, đồng thời trùng khít với chính hàm mốc mà game dùng để kích hoạt.
//  ② TÊN RIÊNG CỦA MU LỌT VÀO. Ảnh mẫu là một server MU: Lorencia · Noria · Devias ·
//     Blood Castle · Devil Square. Quy tắc số 2 cấm tuyệt đối. §5.
//  ③ MÀU Ô CHẢY NGƯỢC LÊN TIÊU ĐỀ. Tiêu đề và ô dữ liệu dùng chung tên lớp (sinh từ cùng bảng
//     `SK_COT`), nên "NƠI DIỄN RA" ra xám mờ trên nền vàng và ô "THAM GIA" mọc hẳn ra một cái
//     NÚT nền đen. Không lỗi, không bài nào đỏ — chỉ nhìn ảnh mới thấy. §4 đo màu thật.
//  ④ CẢ BẢNG XANH LÈ. Vỉa Cốt khai `active` suốt ngày nên bản đầu ra BỐN hàng tô sáng cùng lúc,
//     và lúc đó màu xanh hết nghĩa — hỏng đúng cái việc bảng sinh ra để làm. §6.
//  ⑤ CẮT CỤT TÊN. `text-overflow:ellipsis` ăn mất đuôi "…Mục Tiêu Ng…". §3.
//  ⑥ KHÔNG PHẢI LƯỚI. Nếu ai đó lùi về chồng thẻ dọc thì các cột không còn thẳng lối. §1 đo
//     toạ độ x thật của từng ô, không hỏi tên lớp.
//  ⑦ NÚT CHẾT. "Tới Ngay" chỉ là một chuỗi `onclick`. §7 bấm THẬT rồi hỏi đã đi chưa —
//     và hỏi cả chiều ngược lại: chưa đủ cấp thì phải NÓI RA, không được im lặng.
const { chromium } = require('playwright');
const PORT = process.argv[2] || '8853';
let bad = 0;
const fail = m => { bad++; console.log('FAIL ' + m); };
const ok = m => console.log('  ok  ' + m);

const CAM = ['Lorencia', 'Noria', 'Devias', 'Icarus', 'Atlans', 'Tarkan',
             'Blood Castle', 'Devil Square', 'Fairy Elf', 'Magic Gladiator'];

async function moBang(p, truoc){
  await p.goto(`http://localhost:${PORT}/index.html`);
  await p.waitForFunction(() => window.__gameReady).catch(() => {});
  await p.waitForTimeout(500);
  await p.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', null); });
  await p.waitForTimeout(1200);
  await p.evaluate(() => { applyTestBoost(); player.level = 78; calcDerived();
    document.querySelectorAll('.tut-box,#tut').forEach(e => e.remove()); closePanels(); });
  if (truoc) await p.evaluate(truoc);
  await p.waitForTimeout(truoc ? 4200 : 200);
  await p.evaluate(() => openEventBoard());
  await p.waitForTimeout(400);
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const errs = [];
  const c0 = await b.newContext({ viewport:{ width:1440, height:900 }, timezoneId:'Asia/Ho_Chi_Minh' });
  const p = await c0.newPage();
  p.on('pageerror', e => errs.push(String(e).split('\n')[0]));
  await moBang(p, null);

  // ── §1 LÀ MỘT LƯỚI: mọi hàng có đủ 6 ô, và mỗi cột thẳng một trục x ───────────────────
  // Đo TOẠ ĐỘ THẬT, không hỏi `display:grid` — một chồng thẻ dọc cũng khai được grid.
  const r1 = await p.evaluate(() => {
    const hang = [...document.querySelectorAll('.sk-bang .sk-hang')];
    if (!hang.length) return { trong: true };
    const cot = hang.map(h => [...h.children].map(o => Math.round(o.getBoundingClientRect().left)));
    const soO = new Set(cot.map(c => c.length));
    // Với mỗi chỉ số cột, mọi hàng phải bắt đầu ở cùng một x (cho sai số 1px của làm tròn).
    let lechMax = 0;
    for (let i = 0; i < cot[0].length; i++){
      const xs = cot.map(c => c[i]).filter(x => x !== undefined);
      lechMax = Math.max(lechMax, Math.max(...xs) - Math.min(...xs));
    }
    return { soHang: hang.length, soO: [...soO], lechMax,
             soMuc: (window.eventList ? eventList(Date.now()).length : -1),
             soCotDau: document.querySelectorAll('.sk-dau > span').length };
  });
  if (r1.trong) fail('§1 bảng không có hàng nào — cả bài không chấm được');
  else {
    if (r1.soO.length === 1 && r1.soO[0] === 6) ok(`§1 cả ${r1.soHang} hàng đều đủ 6 ô`);
    else fail(`§1 số ô mỗi hàng không đồng nhất: ${JSON.stringify(r1.soO)} — lưới thủng`);
    if (r1.lechMax <= 1) ok(`§1 các cột thẳng lối (lệch tối đa ${r1.lechMax}px)`);
    else fail(`§1 cột KHÔNG thẳng lối — lệch tới ${r1.lechMax}px giữa các hàng; đây là chồng thẻ dọc chứ không phải lưới`);
    if (r1.soCotDau === 6) ok('§1 hàng tiêu đề có đúng 6 cột');
    else fail(`§1 tiêu đề có ${r1.soCotDau} cột, thân bảng 6 — hai bảng cột đã lệch nhau`);
    if (r1.soHang === r1.soMuc) ok(`§1 vẽ đủ ${r1.soMuc}/${r1.soMuc} mục của eventList`);
    else fail(`§1 eventList có ${r1.soMuc} mục nhưng bảng vẽ ${r1.soHang} hàng`);
  }

  // ── §2 LỊCH TRÌNH SUY TỪ HÀM MỐC, VÀ IN THEO GIỜ MÁY NGƯỜI CHƠI ──────────────────────
  const docLich = (pg) => pg.evaluate(() => {
    const ra = {};
    for (const h of document.querySelectorAll('.sk-bang .sk-hang')){
      const ten = h.querySelector('.sk-ten').textContent.trim();
      ra[ten] = h.querySelector('.sk-lich').textContent.trim();
    }
    // Dãy giờ ĐÚNG, tính lại bằng chính hàm mốc mà game dùng để KÍCH HOẠT sự kiện.
    const that = (fn) => { const d = new Date(); d.setHours(0,0,0,0);
      const o = []; for (let t = fn(d.getTime()-1); t < d.getTime()+86400000 && o.length < 24; t = fn(t)) o.push(fmtClock(t));
      return o.join(', '); };
    return { bang: ra, that: { maton: that(matonNextBoundary), golden: that(goldenNextBoundary), rift: that(riftNextBoundary) } };
  });
  // ⚠ SOI CẢ BA SỰ KIỆN THEO GIỜ, không chỉ một. Bản đầu chỉ hỏi hàng Hung Thần, nên chép cứng
  // dãy giờ của Vực Nứt hay Xâm Lăng Vàng thì bài vẫn XANH — và phép thử ngược đã chứng minh
  // đúng chỗ đó: bẻ `_rfLich` thành chuỗi cứng, không bài nào đỏ.
  const BA = [[/Hung Thần/, 'maton'], [/Vực Nứt/, 'rift'], [/Xâm Lăng Vàng/, 'golden']];
  const L_vn = await docLich(p);
  for (const [re, k] of BA){
    const c = Object.entries(L_vn.bang).find(([ten]) => re.test(ten));
    if (!c) { fail(`§2 không tìm thấy hàng ${re.source}`); continue; }
    if (c[1] === L_vn.that[k]) ok(`§2 ${c[0].replace(/^\S+\s/,'')}: cột lịch khớp hàm mốc thật — ${c[1]}`);
    else fail(`§2 ${c[0]}: cột lịch "${c[1]}" KHÁC dãy mốc thật "${L_vn.that[k]}" — dãy giờ đang bị chép tay`);
  }
  const cVn = Object.entries(L_vn.bang).find(([k]) => /Hung Thần/.test(k));

  const c2 = await b.newContext({ viewport:{ width:1440, height:900 }, timezoneId:'UTC' });
  const p2 = await c2.newPage();
  p2.on('pageerror', e => errs.push('UTC:' + String(e).split('\n')[0]));
  await moBang(p2, null);
  const L_utc = await docLich(p2);
  const cUtc = Object.entries(L_utc.bang).find(([k]) => /Hung Thần/.test(k));
  // ⚠ Tự kiểm cảnh dựng: nếu Playwright lặng lẽ bỏ qua `timezoneId` thì hai bản trùng nhau và
  // mệnh đề dưới xanh một cách vô nghĩa — nên phải đòi chúng KHÁC nhau trước đã.
  if (cUtc && cVn && cUtc[1] !== cVn[1])
    ok(`§2 hai múi giờ ra hai dãy KHÁC nhau — UTC "${cUtc[1]}" vs VN "${cVn[1]}"`);
  else fail(`§2 hai múi giờ ra dãy GIỐNG nhau ("${cUtc && cUtc[1]}") — hoặc lịch bị chép cứng, hoặc timezoneId không ăn`);
  // ⚠ VÀ PHẢI SOI LẠI CẢ BA Ở UTC. Đây là chỗ bắt được chép cứng: một dãy giờ viết tay bao giờ
  // cũng là dãy của MỘT múi giờ, nên nó chỉ khớp ở đúng múi ấy. `test_rift` chạy ở TZ=UTC nên
  // nó MÙ với chuyện này — đúng cái bẫy đã ghi trong CLAUDE.md và chính nó bị nêu tên.
  for (const [re, k] of BA){
    const c = Object.entries(L_utc.bang).find(([ten]) => re.test(ten));
    if (!c) { fail(`§2 (UTC) không tìm thấy hàng ${re.source}`); continue; }
    if (c[1] === L_utc.that[k]) ok(`§2 (UTC) ${c[0].replace(/^\S+\s/,'')}: khớp hàm mốc`);
    else fail(`§2 (UTC) ${c[0]}: "${c[1]}" khác mốc thật "${L_utc.that[k]}"`);
  }
  await c2.close();

  // ── §3 KHÔNG CẮT CỤT TÊN SỰ KIỆN ────────────────────────────────────────────────────
  const r3 = await p.evaluate(() => [...document.querySelectorAll('.sk-bang .sk-hang')].map(h => {
    const o = h.querySelector('.sk-ten');
    return { ten: o.textContent.trim(), cut: o.scrollWidth > o.clientWidth + 1 };
  }));
  const cut = r3.filter(x => x.cut);
  if (!cut.length) ok(`§3 không tên sự kiện nào bị cắt cụt (${r3.length} hàng)`);
  else fail(`§3 bị cắt cụt: ${cut.map(x => x.ten).join(' · ')} — bảng ăn mất tên thì hỏng đúng việc nó làm`);

  // ── §4 CHỮ TIÊU ĐỀ PHẢI ĐỌC ĐƯỢC TRÊN NỀN VÀNG ──────────────────────────────────────
  // Màu ô KHÔNG được chảy ngược lên tiêu đề. Đo độ sáng thật, không hỏi tên lớp.
  const r4 = await p.evaluate(() => {
    const lum = (css) => { const m = css.match(/[\d.]+/g) || [0,0,0];
      return 0.2126*+m[0] + 0.7152*+m[1] + 0.0722*+m[2]; };
    return [...document.querySelectorAll('.sk-dau > span')].map(o => {
      const cs = getComputedStyle(o);
      return { chu: o.textContent.trim(), sang: Math.round(lum(cs.color)),
               nen: cs.backgroundColor, vien: cs.borderTopWidth };
    });
  });
  const mo = r4.filter(x => x.sang > 90);
  const coNut = r4.filter(x => parseFloat(x.vien) > 0 || !/rgba\(0, 0, 0, 0\)|transparent/.test(x.nen));
  if (!mo.length) ok(`§4 cả ${r4.length} tiêu đề đều là chữ TỐI trên nền vàng (sáng nhất ${Math.max(...r4.map(x=>x.sang))})`);
  else fail(`§4 tiêu đề chữ SÁNG trên nền vàng, gần như không đọc được: ${mo.map(x=>`${x.chu}=${x.sang}`).join(' · ')} — màu ô đang chảy ngược lên tiêu đề`);
  if (!coNut.length) ok('§4 không ô tiêu đề nào bị biến thành nút bấm');
  else fail(`§4 ô tiêu đề mọc ra nền/viền của NÚT: ${coNut.map(x=>x.chu).join(' · ')} — lớp \`sk-di\` đang ăn vào tiêu đề`);

  // ── §5 KHÔNG TÊN RIÊNG CỦA MU ───────────────────────────────────────────────────────
  const chu = await p.evaluate(() => document.getElementById('overlay-inner').textContent);
  const lot = CAM.filter(t => chu.includes(t));
  if (!lot.length) ok('§5 không tên riêng nào của MU lọt vào bảng');
  else fail(`§5 LỌT TÊN RIÊNG CỦA MU: ${lot.join(' · ')} — ảnh mẫu là server MU, chỉ lấy hình dạng bảng`);

  // ── §6 TÔ SÁNG CHỈ DÀNH CHO SỰ KIỆN THEO GIỜ ĐANG MỞ CỬA ────────────────────────────
  const r6a = await p.evaluate(() => ({
    live: document.querySelectorAll('.sk-bang .sk-hang.sk-live').length,
    dangDien: [...document.querySelectorAll('.sk-bang .sk-tg')].filter(o => /Đang diễn ra/.test(o.textContent)).length,
    san: [...document.querySelectorAll('.sk-bang .sk-tg')].filter(o => /Sẵn hôm nay/.test(o.textContent)).length,
  }));
  if (r6a.live === 0 && r6a.dangDien === 0)
    ok(`§6 không sự kiện giờ nào đang mở ⇒ 0 hàng tô sáng (Vỉa Cốt ${r6a.san} hàng "Sẵn hôm nay", KHÔNG tô sáng)`);
  else fail(`§6 chưa sự kiện nào mở mà đã có ${r6a.live} hàng tô sáng / ${r6a.dangDien} dòng "Đang diễn ra"`);
  if (r6a.san > 0) ok(`§6 Vỉa Cốt đi nhãn riêng "Sẵn hôm nay" (${r6a.san} hàng)`);
  else fail('§6 không hàng Vỉa Cốt nào — cảnh dựng hỏng, mấy mệnh đề trên không có nghĩa');

  // Bật Xâm Lăng Vàng rồi mở lại: phải có ĐÚNG MỘT hàng tô sáng, không phải bốn.
  await p.evaluate(() => { lopPhuDong(); debugGolden(3); });
  await p.waitForTimeout(4200);
  await p.evaluate(() => openEventBoard());
  await p.waitForTimeout(400);
  const r6b = await p.evaluate(() => ({
    live: document.querySelectorAll('.sk-bang .sk-hang.sk-live').length,
    tenLive: [...document.querySelectorAll('.sk-bang .sk-hang.sk-live .sk-ten')].map(o => o.textContent.trim()),
    san: [...document.querySelectorAll('.sk-bang .sk-tg')].filter(o => /Sẵn hôm nay/.test(o.textContent)).length,
  }));
  if (r6b.live === 1 && /Xâm Lăng Vàng/.test(r6b.tenLive[0] || ''))
    ok(`§6 mở Xâm Lăng Vàng ⇒ ĐÚNG 1 hàng tô sáng (${r6b.tenLive[0]}), ${r6b.san} hàng Vỉa vẫn không tô`);
  else fail(`§6 có ${r6b.live} hàng tô sáng [${r6b.tenLive}] — phải đúng 1; Vỉa Cốt bật suốt ngày nên tô cả nó là cả bảng xanh lè và màu xanh hết nghĩa`);

  // ── §7 NÚT "TỚI NGAY" BẤM THẬT PHẢI ĐI THẬT — VÀ TỪ CHỐI THÌ PHẢI NÓI RA ────────────
  //
  // ⚠ BẢN CŨ CỦA MỤC NÀY ĐỎ VÌ MỘT CẢNH DO ĐỒNG HỒ DỰNG, không vì nút hỏng. Nó lấy hàng
  // `.sk-live` đầu tiên — mà §6 vừa ép Xâm Lăng Vàng thành hàng live duy nhất — rồi đòi
  // `curMap` phải đổi. Nhưng đích của Xâm Lăng Vàng là `goldenMapFor(slot)`, **xoay vòng 7 map
  // theo GIỜ THẬT**, nên có khung giờ nó rơi vào Dusk Marsh (`min: 100`) trong khi `moBang`
  // đặt nhân vật ở **cấp 78**. `goEventMap` từ chối đúng luật, và bài báo "nút chết".
  //
  // Đo được (3/3 lượt, cùng một khung giờ): hàng live = Xâm Lăng Vàng → `nhanmon`,
  // `mapGate` trả `{ok:false, why:'lv', need:100}`, và nó CÓ bắn số bay
  // *"Cần cấp 100 để vào Dusk Marsh!"* — tức cả nút lẫn thông báo đều chạy.
  //
  // ⚠ Và phép đo ĐẦU TIÊN của tôi bảo "không có số bay nào" — vì nó đọc `window.floats`.
  // `floats` khai bằng `let` ở tầng cao nhất nên KHÔNG gắn vào `window`; đọc qua `window.` ra
  // `undefined` rồi `|| []` che mất. Đúng vết sẹo đã ghi trong CLAUDE.md cho `net.js`.
  //
  // ⇒ Mục này nay LÁI CẢ HAI NHÁNH thay vì nhận cảnh mà đồng hồ đưa cho, nên nó không còn phụ
  // thuộc khung giờ chạy nữa. Nhánh TỪ CHỐI phải có mặt: một nút bấm vào mà không thấy gì xảy
  // ra thì với người chơi đọc ra y hệt nút chết — đúng cái §7 sinh ra để chặn.
  const r7 = await p.evaluate(async () => {
    const lay = () => [...document.querySelectorAll('.sk-bang .sk-hang.sk-live')][0];
    const h0 = lay();
    if (!h0) return { thieu: true };
    const nut0 = h0.querySelector('.sk-di');
    if (!nut0) return { khongNut: true };
    const oc = nut0.getAttribute('onclick') || '';
    const id = (oc.match(/goEventMap\('([^']+)'\)/) || [])[1];
    if (!id) return { khongDich: true, oc };
    const ra = { id, ten: MAPS[id] && MAPS[id].name, min: (MAPS[id] || {}).min || 1,
                 chu: nut0.textContent.trim() };

    const bam = async () => {
      lopPhuDong(); openEventBoard();
      await new Promise(r => setTimeout(r, 300));
      const h = lay(); if (!h) return null;
      const n = h.querySelector('.sk-di'); if (!n) return null;
      const truoc = curMap, nF = floats.length;      // ⚠ `floats` là `let`, KHÔNG có trên window
      n.click();
      await new Promise(r => setTimeout(r, 400));
      return { truoc, sau: curMap, bao: floats.slice(nF).map(f => f.text) };
    };

    player.level = MAX_LV; calcDerived();
    ra.capCuoi = player.level;
    // ① nhánh TỪ CHỐI — DỰNG cảnh, đừng chờ đồng hồ đưa cho. Nâng ngưỡng cấp của chính map
    // đích lên trên đầu người chơi rồi trả lại ngay. Cách cũ (hạ cấp xuống dưới `MAPS[id].min`)
    // chỉ chạy khi map đích TÌNH CỜ có ngưỡng — mà đích là `goldenMapFor(slot)`, xoay vòng
    // theo giờ thật: đo được ngay trong một phiên, nó đi từ `nhanmon` (min 100) sang `corran`
    // (min 1) và nhánh này lặng lẽ bị bỏ qua nửa ngày.
    const minCu = MAPS[id].min;
    MAPS[id].min = MAX_LV + 5;
    ra.chan = await bam();
    MAPS[id].min = minCu;
    ra.minChan = MAX_LV + 5;
    // ② nhánh ĐI THẬT. Làm SAU vì nó đổi `curMap`.
    ra.cong = mapGate(id);
    ra.di = await bam();
    return ra;
  });
  if (r7.thieu || r7.khongNut) fail('§7 hàng đang diễn ra không có nút Tham Gia');
  else if (r7.khongDich) fail(`§7 nút không trỏ tới map nào: onclick="${r7.oc}"`);
  else {
    // ⓪ tự kiểm cảnh dựng: nâng lên MAX_LV rồi mà cổng vẫn đóng thì hai mệnh đề dưới vô nghĩa.
    if (!r7.cong || !r7.cong.ok)
      fail(`§7 cảnh dựng hỏng — ở cấp ${r7.capCuoi} mà cổng vào ${r7.ten} vẫn đóng `
         + `(${JSON.stringify(r7.cong)}), mệnh đề "đi thật" không đo được gì`);
    else if (r7.di && r7.di.sau === r7.id && r7.di.sau !== r7.di.truoc)
      ok(`§7 bấm "${r7.chu}" đi thật: ${r7.di.truoc} → ${r7.di.sau}`);
    else if (r7.di && r7.di.sau === r7.di.truoc && r7.di.sau === r7.id)
      fail(`§7 đã đứng sẵn ở ${r7.ten} trước khi bấm — nhánh TỪ CHỐI đã dời người chơi tới đó, `
         + 'mệnh đề này không đo được gì (xem mệnh đề cổng map ngay dưới)');
    else
      fail(`§7 bấm "${r7.chu}" KHÔNG đi đâu (vẫn ở ${r7.di && r7.di.sau}) — nút chết, `
         + 'đúng bẫy openEvoPanel của test_cayky');

    if (!r7.chan)
      fail('§7 nhánh TỪ CHỐI không dựng được cảnh — không mở lại được bảng');
    else if (r7.chan.sau !== r7.chan.truoc)
      fail(`§7 chưa đủ cấp mà vẫn đi được vào ${r7.ten} (cần ${r7.minChan}) — cổng map bị bỏ qua`);
    else if (r7.chan.bao.some(t => t.includes(String(r7.minChan))))
      ok(`§7 chưa đủ cấp thì NÓI RA: "${r7.chan.bao.find(t => t.includes(String(r7.minChan)))}"`);
    else
      fail(`§7 chưa đủ cấp thì im lặng (số bay: ${JSON.stringify(r7.chan.bao)}) — `
         + 'với người chơi thì "bấm không thấy gì" đọc ra y hệt nút chết');
  }

  // ── §8 KHÔNG DỰNG PHÂN TRANG GIẢ ────────────────────────────────────────────────────
  // Ảnh mẫu có "1/1" vì nó phân trang sẵn; ở đây 7 dòng thì nút lật trang vĩnh viễn hiện 1/1.
  if (!/\b1\s*\/\s*1\b/.test(await p.evaluate(() => document.getElementById('overlay-inner').textContent)))
    ok('§8 không có phân trang giả "1/1"');
  else fail('§8 có phân trang "1/1" — một nút bấm không ra gì thì tệ hơn hẳn không có nút');

  if (errs.length) fail('lỗi trang: ' + errs.slice(0, 3).join(' | '));
  await b.close();
  console.log(bad ? `\n${bad} MỤC ĐỎ` : '\nALL PASS');
  process.exit(bad ? 1 : 0);
})();
