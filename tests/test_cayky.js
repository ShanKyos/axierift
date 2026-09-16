// Bảng Kỹ Năng kiểu CÂY — cây biểu tượng bên trái, khung chi tiết bên phải.
//
// Bài này gác bốn kiểu hỏng, và ba trong bốn cái đó KHÔNG ném lỗi, KHÔNG hiện ra:
//
//  1. MÃ CHIÊU GÕ SAI trong KN_ROT. `knNut()` cố ý trả về ô trống khi không tra được chiêu —
//     đó là thứ cho phép điền dần từng ô. Nhưng nó cũng nuốt luôn lỗi gõ sai: 'dk_cyclon'
//     thiếu chữ e hiện ra y hệt một ô chưa gán. Mục 2 đối chiếu từng mã với SKILL_DEFS.
//  2. NÚT CHẾT. Nút góc phải từng trỏ vào `openEvoPanel()` — một hàm không tồn tại. Bấm vào
//     không có gì xảy ra và không có gì báo. Mục 5 gọi thẳng tên hàm trong onclick.
//  3. HÌNH CÂY THỦNG. `tu` trỏ tới một khoá không có ⇒ mũi tên biến mất lặng lẽ; hai ô trùng
//     ô lưới ⇒ chồng lên nhau. Mục 1 quét cả hai.
//  4. DẤU + NÓI DỐI. Dấu + xanh nghĩa là "nâng được ngay"; nếu nó chỉ hỏi "đã mở khoá chưa"
//     thì người chơi bấm vào và bị từ chối. Mục 4 đối chiếu với chính điều kiện của
//     upgradeSkillUI().
const { chromium } = require('playwright');
const PORT = process.argv[2] || '8853';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://localhost:' + PORT + '/index.html');
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(700);
  let bad = 0; const fail = m => { console.log('FAIL ' + m); bad++; };
  const pass = m => console.log('PASS ' + m);

  const r = await p.evaluate(() => {
    window.TEST_MODE = true;
    const LOP = ['thieulam','toanchan','baidasan','minhgiao','bug'];
    const o = { tab: KN_TAB.map(t => t.id), soOHinh: KN_HINH.length, hinhLoi: [], maLoi: [], renderLoi: [], soO: {} };

    // ── 1. hình cây: cha phải tồn tại, không ô nào trùng ô lưới ──
    const quetHinh = (hinh, ten) => {
      const co = new Set(hinh.map(n => n.k)), oLuoi = new Set();
      for (const n of hinh){
        for (const t of (n.tu || [])) if (!co.has(t)) o.hinhLoi.push(`${ten}/${n.k}: cha '${t}' không có`);
        const key = n.c + ',' + n.h;
        if (oLuoi.has(key)) o.hinhLoi.push(`${ten}: hai ô cùng đứng ô lưới ${key}`);
        oLuoi.add(key);
      }
    };
    quetHinh(KN_HINH, 'chung');
    for (const k in KN_HINH_RIENG) quetHinh(KN_HINH_RIENG[k], k);

    // ── 2. mọi mã trong KN_ROT / KN_ROT_CHUNG phải tra được ra chiêu THẬT ──
    startGame('thieulam', null);
    for (const sc in KN_ROT){
      startGame(sc, null); player.level = 120; player.lvPeak = 120; vhAutoLearn();
      // Bị động KHÔNG nằm trong SKILL_DEFS (vòng đăng ký bỏ qua type:'passive') nên phải
      // chấp nhận cả VOHOC_DEFS — nếu chỉ hỏi SKILL_DEFS thì bài này bắt vạ oan năm ô bị động.
      KN_ROT[sc].forEach((id, i) => { if (!SKILL_DEFS[id] && !VOHOC_DEFS[id]) o.maLoi.push(`KN_ROT.${sc}[${i}] = '${id}' — không tra được ở SKILL_DEFS lẫn VOHOC_DEFS`); });
    }
    for (const t in KN_ROT_CHUNG)
      KN_ROT_CHUNG[t].forEach((id, i) => { if (!SKILL_DEFS[id] && !VOHOC_DEFS[id]) o.maLoi.push(`KN_ROT_CHUNG.${t}[${i}] = '${id}' — không có`); });

    // ── 3. năm lớp × mọi tab đều vẽ được, không tab nào ném ──
    const el = () => document.getElementById('panel-skill');
    for (const sc of LOP){
      startGame(sc, null); player.level = 70; player.lvPeak = 70;
      player.silver = 9e6; player.khi = 9e5; vhAutoLearn();
      togglePanel('skill');
      for (const t of o.tab){
        try { window.knTab(t); } catch (e){ o.renderLoi.push(`${sc}/${t}: ${e.message}`); continue; }
        // ⚠ SO VỚI HÌNH CỦA CHÍNH TAB ĐÓ. Bản cũ đòi cả ba tab ra đúng `KN_HINH.length` (16) —
        // đúng khi ba tab dùng chung một hình, nhưng tab Khác nay dựng lưới TỪ DỮ LIỆU (4 Di
        // Sản + 2 hệ phụ + 1-2 bị động, khác nhau theo lớp). Chốt vào 16 thì hoặc bài đỏ oan,
        // hoặc phải miễn trừ tab Khác — mà chỗ miễn trừ chính là thứ đã để nó lệch ra lần trước.
        o.soO[sc + '/' + t] = { ve: el().querySelectorAll('.kn-o').length, hinh: knHinh(t).length };
      }
    }

    // ── 4. dấu + phải khớp ĐÚNG điều kiện nâng cấp thật ──
    startGame('thieulam', null); player.level = 70; player.lvPeak = 70; vhAutoLearn();
    // ⚠ BỊ ĐỘNG CHỈ SỐ CŨNG NÂNG CẤP ĐƯỢC, và chúng KHÔNG nằm trong `SKILL_DEFS` (vòng đăng ký
    // bỏ qua `type:'passive'`), nên `skillInfo(id)` trả null cho chúng. Bỏ sót nhánh đó thì
    // "sự thật" mà bài này đo ra thiếu 7 chiêu, và nó tố cáo dấu + nói dối trong khi dấu + đúng.
    const nangThat = (id) => {
      const cs = laBiDongChiSo(id);
      const inf = cs ? null : skillInfo(id);
      const mo = cs ? vhLearned(id) : !!(inf && inf.unlocked);
      return mo && skLv(id) < 120 && skLv(id) < player.level
        && player.silver >= skUpCost(id) && (player.khi || 0) >= skUpKhi(id);
    };
    const demCong = () => { togglePanel('skill'); window.knTab('lop');
      return el().querySelectorAll('.kn-cong').length; };
    const nangDuocLoai = (id) => laBiDongChiSo(id)
      || (SKILL_DEFS[id] && !(VOHOC_DEFS[id] && VOHOC_DEFS[id].type === 'passive'));
    const demThat = () => KN_ROT.thieulam.filter(id => nangDuocLoai(id) && nangThat(id)).length;
    player.silver = 9e6; player.khi = 9e5; o.giau = { cong: demCong(), that: demThat() };
    player.silver = 0;  player.khi = 0;    o.ngheo = { cong: demCong(), that: demThat() };

    // ── 5. nút góc phải phải gọi một hàm CÓ THẬT ──
    player.silver = 9e6; player.khi = 9e5; togglePanel('skill'); window.knTab('lop');
    const nut = el().querySelector('.kn-goc button');
    const ten = nut ? (nut.getAttribute('onclick') || '').match(/window\.(\w+)/) : null;
    o.nutGoc = { co: !!nut, ham: ten ? ten[1] : null, song: ten ? typeof window[ten[1]] === 'function' : false };

    // ── 6. ô trống KHÔNG bấm được, ô có chiêu thì bấm được ──
    // ⚠ ĐỪNG đo trên MỘT tab cố định. Tab Lớp nay đủ 16/16 ô (9 chiêu lớp + 7 bị động chỉ số)
    // nên không còn ô trống nào để mà đo, và `querySelector` trả null — mệnh đề đỏ ở một chỗ
    // chẳng liên quan gì tới thứ nó định gác. Quét mọi tab, lấy tab nào CÓ ô trống.
    o.trongTag = null; o.coTag = null; o.tabCoTrong = null;
    for (const t of KN_TAB){
      window.knTab(t.id);
      const tr = el().querySelector('.kn-trong'), co = el().querySelector('.kn-o:not(.kn-trong)');
      if (co && !o.coTag) o.coTag = co.tagName;
      if (tr && !o.trongTag){ o.trongTag = tr.tagName; o.tabCoTrong = t.id; }
    }
    window.knTab('lop');

    // ── 7. hai con số "tiêu hao" phải ĐỌC TỪ HÀM, không chép cứng ──
    window.knChon(KN_HINH[0].k);
    const id0 = KN_ROT.thieulam[0];
    const txt = el().querySelector('.kn-ct').textContent.replace(/ /g, ' ');
    o.soKhop = { bac: txt.includes(skUpCost(id0).toLocaleString('vi-VN')),
                 khi: txt.includes(skUpKhi(id0).toLocaleString('vi-VN')) };

    // ── 8. tab Khác: lưới có NHÓM, và không mất thứ nào của bản danh sách cũ ──
    // ⚠ Bản cũ đếm `.skill-row,.shop-row` rồi chỉ hỏi "> 0". Sau khi `danchi`/`tieuhon` dọn từ
    // khối "HỆ TẤN CHỨC PHỤ" vào lưới, con số ấy tụt từ 3 xuống 1 mà mệnh đề vẫn XANH — tức nó
    // xanh kể cả khi hai chiêu đó biến mất hẳn. Nay hỏi đích danh từng thứ phải có mặt.
    window.knTab('khac');
    const dsKhac = knDsKhac();
    o.khac = {
      nhom: [...el().querySelectorAll('.kn-nhom b')].map(x => x.textContent.trim()),
      o: el().querySelectorAll('.kn-o').length,
      trung: dsKhac.length !== new Set(dsKhac).size,
      // hai hệ tấn chức phụ phải còn đường vào — nay là Ô, không còn là hàng danh sách
      hePhu: ['danchi','tieuhon'].filter(x => dsKhac.includes(x)).length,
      // và không được in LẠI ở dạng cũ: hai chỗ cùng nói một thứ là bảng tự mâu thuẫn
      khoiCu: /HỆ TẤN CHỨC PHỤ/.test(el().innerHTML),
      diSan: el().textContent.includes('DI SẢN'),
      theSach: !!([...el().querySelectorAll('.shop-row')].find(d => /Sách Kỹ Năng/.test(d.textContent))),
      phu: el().querySelectorAll('.kn-phu-1').length,
    };
    // ⚠ MŨI TÊN PHẢI BẮT ĐẦU DƯỚI ĐÁY Ô CHA, không phải dưới đáy cái ẢNH. Ô cao 58px (ảnh 44 +
    // dòng số cấp), mà bản cũ bắn từ y+44 — tức từ giữa dòng số cấp, và badge vẽ SAU nên nó che
    // mất thân mũi tên. Thứ còn lại là mấy đầu mũi tên xanh trôi lơ lửng. Không mệnh đề nào bắt
    // được: số ô đúng, số path đúng, `d` đúng cú pháp. Nên đo bằng HÌNH HỌC THẬT trong DOM.
    // ⚠ TỰ KIỂM CẢNH DỰNG TRƯỚC KHI CHẤM. `getBoundingClientRect()` trên một bảng đang
    // `display:none` trả về TOÀN SỐ 0 — và số 0 thì thoả mọi bất đẳng thức ở dưới, nên mệnh đề
    // này XANH trong khi nó không đo được gì cả. Đã dẫm đúng thế: bài báo "khe 262px" trong lúc
    // mọi ô đều ra `{x:0, day:0}`. Cùng họ với vết sẹo đã ghi trong CLAUDE.md — đừng hỏi cờ
    // `hidden`, hãy hỏi HÌNH HỌC THẬT, rồi chứng minh hình học đó khác 0.
    if (el().classList.contains('hide') || el().offsetParent === null) togglePanel('skill');
    window.knTab('khac');
    const cay = el().querySelector('.kn-cay');
    const rc = cay.getBoundingClientRect();
    o.canhDung = cay.getBoundingClientRect().height > 0
      && [...cay.querySelectorAll('.kn-o')].every(x => x.getBoundingClientRect().height > 0);
    const oDay = [...cay.querySelectorAll('.kn-o')]
      .map(x => { const r = x.getBoundingClientRect(); return { x: r.left - rc.left, day: r.bottom - rc.top }; });
    o.mui = [...cay.querySelectorAll('.kn-day path[marker-end]')].map(pa => {
      const m = /^M([\d.]+) ([\d.]+)/.exec(pa.getAttribute('d') || '');
      if (!m) return null;
      const px = +m[1], py = +m[2];
      // ô cha = ô có tâm ngang trùng điểm xuất phát và đáy GẦN NHẤT, kể cả nằm dưới py.
      // ⚠ ĐỪNG lọc `day <= py`: bản đầu làm thế, và khi mũi tên bắt đầu BÊN TRONG ô cha thì ô
      // ấy bị loại, phép đo tụt xuống ô ở hàng trên và trả về một khe DƯƠNG to tướng — tức
      // đúng cái lỗi cần bắt lại làm bài XANH. Đã thử ngược mới lộ ra.
      const cha = oDay.filter(v => Math.abs(v.x + 22 - px) < 3)
                      .sort((a, b) => Math.abs(py - a.day) - Math.abs(py - b.day))[0];
      return cha ? +(py - cha.day).toFixed(1) : null;
    });

    // ── 9. Quy tắc số 1: tên tab không được mang từ vựng đã cấm ──
    const CAM = ['giang hồ','môn phái','cảnh giới','chân khí','đan điền','kinh mạch'];
    o.tenCam = [];
    const moiChu = KN_TAB.map(t => t.ten + ' ' + t.dong).join(' ').toLowerCase();
    for (const c of CAM) if (moiChu.includes(c)) o.tenCam.push(c);
    return o;
  });
  console.log(JSON.stringify(r, null, 1));

  if (r.hinhLoi.length) fail(`hình cây hỏng: ${r.hinhLoi.join(' · ')}`);
  else pass('hình cây lành: mọi `tu` trỏ tới ô có thật, không ô nào trùng ô lưới');

  if (r.maLoi.length) fail(`${r.maLoi.length} mã chiêu gõ sai (hiện ra y hệt ô chưa gán): ${r.maLoi.join(' · ')}`);
  else pass('mọi mã trong KN_ROT / KN_ROT_CHUNG đều tra được ra chiêu thật');

  if (r.renderLoi.length) fail(`tab ném lỗi: ${r.renderLoi.join(' · ')}`);
  else pass(`5 lớp × ${r.tab.length} tab đều vẽ được`);

  // ⚠ KHÔNG loại trừ tab nào nữa. Trước đây tab Khác được miễn vì nó vẽ kiểu khác hẳn — một
  // cuộn chữ dài thay vì cây — nên ba tab của cùng một bảng bắt người chơi học ba cách đọc.
  // Chủ dự án chốt cho đồng nhất, và chỗ miễn trừ này chính là thứ sẽ lặng lẽ cho phép nó
  // lệch ra lần nữa.
  const thieu = Object.entries(r.soO).filter(([, v]) => v.ve !== v.hinh || !v.hinh);
  if (thieu.length) fail(`số ô lệch hình: ${thieu.map(([k,v])=>`${k} vẽ ${v.ve}/hình ${v.hinh}`).join(' · ')}`);
  else pass(`cả ba tab vẽ đủ ô của hình mình (${Object.values(r.soO).map(v=>v.ve).join('/')})`);

  if (r.giau.cong !== r.giau.that || r.ngheo.cong !== r.ngheo.that)
    fail(`dấu + nói dối: đủ tiền ${r.giau.cong} dấu/${r.giau.that} nâng được · hết tiền ${r.ngheo.cong}/${r.ngheo.that}`);
  else if (r.giau.cong === r.ngheo.cong)
    fail(`dấu + không đổi theo túi tiền (${r.giau.cong} cả hai) — nó không hỏi điều kiện thật`);
  else pass(`dấu + khớp đúng điều kiện nâng cấp: đủ tiền ${r.giau.cong} ô · hết tiền ${r.ngheo.cong} ô`);

  if (!r.nutGoc.co) fail('không có nút ở góc phải');
  else if (!r.nutGoc.song) fail(`nút góc phải gọi window.${r.nutGoc.ham}() — HÀM KHÔNG TỒN TẠI, bấm vào không có gì xảy ra`);
  else pass(`nút góc phải gọi window.${r.nutGoc.ham}() — hàm có thật`);

  if (!r.tabCoTrong)
    fail('không tab nào còn ô trống — mệnh đề "ô trống là DIV" sẽ xanh giả, phải dựng lại cảnh');
  else if (r.trongTag !== 'DIV' || r.coTag !== 'BUTTON')
    fail(`ô trống phải là DIV (không bấm được) và ô có chiêu phải là BUTTON — đang là ${r.trongTag}/${r.coTag} (tab ${r.tabCoTrong})`);
  else pass('ô trống không bấm được, ô có chiêu bấm được');

  if (!r.soKhop.bac || !r.soKhop.khi)
    fail(`khung chi tiết không in đúng số từ skUpCost/skUpKhi (Lumen ${r.soKhop.bac} · Bản Năng ${r.soKhop.khi})`);
  else pass('hai dòng tiêu hao đọc thẳng skUpCost() / skUpKhi()');

  const kh = r.khac;
  if (kh.nhom.length < 2) fail(`tab Khác phải có ≥2 tiêu đề nhóm, đang có ${JSON.stringify(kh.nhom)}`);
  else if (kh.hePhu !== 2) fail(`hai hệ tấn chức phụ mất đường vào lưới (còn ${kh.hePhu}/2)`);
  else if (kh.trung) fail('một chiêu lọt vào lưới tab Khác hai lần');
  else if (kh.khoiCu) fail('khối "HỆ TẤN CHỨC PHỤ" cũ vẫn in — hai chỗ cùng nói một thứ');
  else if (!kh.diSan || !kh.theSach || !kh.phu)
    fail(`tab Khác mất nội dung dưới lưới (Di Sản ${kh.diSan} · thẻ Sách ${kh.theSach} · bị động chung ${kh.phu})`);
  else pass(`tab Khác là lưới có nhóm [${kh.nhom.join(' · ')}], ${kh.o} ô, giữ đủ phần dưới`);

  const muiXau = (r.mui || []).filter(v => v === null || v < 0);
  if (!r.canhDung) fail('bảng kỹ năng đang ẩn lúc đo — mọi hình chữ nhật ra 0 và mệnh đề mũi tên xanh giả');
  else if (!r.mui || !r.mui.length) fail('không có mũi tên nào trên tab Khác — mệnh đề hình học sẽ xanh giả');
  else if (muiXau.length) fail(`mũi tên bắt đầu BÊN TRONG ô cha (lệch ${JSON.stringify(r.mui)}) — badge sẽ che mất thân`);
  else pass(`mũi tên xuất phát dưới đáy ô cha (khe ${r.mui.join('/')}px)`);

  // ⑤ HAI NÚT CỦA KHUNG CHI TIẾT PHẢI LÀM THẬT — 📜 dùng Sách Kỹ Năng và ⌨ gán phím Space.
  // Cả hai cơ chế vẫn sống trong mã (`useSkillBookUI` · `assignSpaceUI`) nhưng chỗ DUY NHẤT
  // treo nút của chúng là `upBtnHtml()`, dựng hàng cho danh sách chiêu — và danh sách đã thành
  // cây. Mất chỗ gọi thì không lỗi nào báo: bảng vẫn còn dòng "📜 Sách Kỹ Năng nâng thẳng 1
  // cấp" MỜI người chơi dùng, mà không có gì để bấm. Nên mệnh đề này không hỏi "có nút không",
  // nó BẤM rồi đo trạng thái người chơi, và đo cả chiều ngược lại (hết sách thì nút phải mờ).
  const r5 = await p.evaluate(() => {
    player.level = 80; player.bikipVH = 7; vhAutoLearn();
    const cay = KN_ROT[player.sect] || [];
    const id = cay.find(x => x && SKILL_DEFS[x] && skillInfo(x).unlocked);
    if (!id) return { canh:'không tìm được chiêu chủ động nào đã mở' };
    player.skillLv[id] = 10;
    closePanels(); togglePanel('skill'); window.knTab('lop');
    window._knChon = 'c' + cay.indexOf(id);
    renderSkillPanel();
    const ns = document.querySelector('#panel-skill .kn-sachnut');
    const sachMo = !!(ns && ns.classList.contains('mo'));
    const lvTruoc = skLv(id), sachTruoc = player.bikipVH;
    if (ns) ns.click();
    const lvSau = skLv(id), sachSau = player.bikipVH;
    player.bikipVH = 0; renderSkillPanel();
    const ns2 = document.querySelector('#panel-skill .kn-sachnut');
    const moKhiHet = !!(ns2 && ns2.classList.contains('mo'));
    // ⌨ Space: chỉ nhận chiêu ĐANG nằm trên thanh; bấm lần hai trả về đòn thường
    const idBar = player.skillBar.find(x => x && SKILL_DEFS[x]);
    player.spaceSkill = null;
    window._knChon = 'c' + cay.indexOf(idBar);
    renderSkillPanel();
    const nsp = document.querySelector('#panel-skill .kn-space');
    if (nsp) nsp.click();
    const spSau1 = player.spaceSkill;
    renderSkillPanel();
    const nsp2 = document.querySelector('#panel-skill .kn-space');
    const sang = !!(nsp2 && nsp2.classList.contains('dang'));
    if (nsp2) nsp2.click();
    return { id, idBar, coSach:!!ns, sachMo, lvTruoc, lvSau, sachTruoc, sachSau, moKhiHet,
             coSpace:!!nsp, spSau1, sang, spSau2: player.spaceSkill };
  });
  console.log('⑤ hai nút khung chi tiết:', JSON.stringify(r5));
  if (r5.canh) fail('cảnh dựng chưa đủ: ' + r5.canh);
  else {
    if (!r5.coSach) fail('khung chi tiết không có nút 📜 Dùng Sách — cơ chế Sách Kỹ Năng mất cửa bấm');
    else if (r5.sachMo) fail('có sách + chiêu chưa tối đa mà nút 📜 vẫn mờ');
    else if (r5.lvSau !== r5.lvTruoc + 1) fail(`bấm 📜 không nâng cấp: ${r5.lvTruoc} → ${r5.lvSau}`);
    else if (r5.sachSau !== r5.sachTruoc - 1) fail(`bấm 📜 không trừ đúng 1 quyển: ${r5.sachTruoc} → ${r5.sachSau}`);
    else if (!r5.moKhiHet) fail('hết Sách Kỹ Năng mà nút 📜 vẫn sáng — nút hứa suông');
    else pass(`nút 📜 nâng thật (cấp ${r5.lvTruoc}→${r5.lvSau}, sách ${r5.sachTruoc}→${r5.sachSau}) và tắt khi hết sách`);

    if (!r5.coSpace) fail('khung chi tiết không có nút ⌨ Space — cơ chế gán phím Space mất cửa bấm');
    else if (r5.spSau1 !== r5.idBar) fail(`bấm ⌨ không gán được Space: ${r5.spSau1}`);
    else if (!r5.sang) fail('gán Space rồi mà nút không sáng lên');
    else if (r5.spSau2 !== null) fail(`bấm ⌨ lần hai không trả Space về đòn thường: ${r5.spSau2}`);
    else pass('nút ⌨ gán được phím Space và bấm lần hai thì gỡ ra');
  }

  if (r.tenCam.length) fail(`tên tab mang từ vựng Quy tắc số 1 cấm: ${r.tenCam.join(', ')}`);
  else pass('tên tab sạch từ vựng bị cấm');

  console.log('errors:', JSON.stringify(errs));
  if (errs.length) fail('lỗi trang: ' + errs[0]);
  console.log(bad === 0 ? 'PASS' : 'FAIL(' + bad + ')');
  await b.close();
  process.exit(bad === 0 ? 0 : 1);
})();
