// Bảng Kỹ Năng — MỘT trang, không tab.
//
// Bản trước của tệp này là một bài kiểm ZOMBIE: không một câu khẳng định nào, chỉ console.log và
// chụp màn, nên nó thoát 0 bất kể chuyện gì xảy ra. Nó soi tập tab TRẤN PHÁI / GIANG HỒ / DUNG
// HỢP cùng tên phái Thiếu Lâm · Võ Đang — tất cả đều đã bị gỡ từ đợt MU-hoá, nên mọi phép
// includes() của nó trả về false suốt một thời gian dài mà không ai biết. Một bài kiểm không
// khẳng định gì thì không phải bài kiểm; nay nó soi đúng cái bảng đang tồn tại.
const { chromium } = require('playwright');
let bad = 0;
const fail = m => { bad++; console.log('FAIL ' + m); };
const pass = m => console.log('PASS ' + m);

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1440, height: 950 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e).split('\n')[0]));
  await p.goto('http://localhost:8853/index.html?max=1');
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(800);

  // Mọi lớp phải ra một bảng đầy đủ — không lớp nào rơi vào trang trắng.
  // Năm lớp CHƠI ĐƯỢC. (Lớp thứ sáu 'vophai' đã gỡ hẳn.) Trạng thái chưa chọn lớp, không phải một lớp —
  // bảng của nó cố tình khác (chưa có bộ 4 chiêu), nên soi chung là bắt vạ oan.
  const LOP = ['thieulam', 'toanchan', 'baidasan', 'minhgiao', 'bug'];
  const ra = await p.evaluate(async (LOP) => {
    const out = [];
    for (const s of LOP){
      let lop = s;
      try { startGame(s, null); } catch(e){ out.push({ lop:s, loi:e.message }); continue; }
      lop = player.sect;
      player.level = 60; calcDerived();
      closePanels(); togglePanel('skill');
      const el = document.getElementById('panel-skill');
      // ⚠ HỢP ĐỒNG ĐÃ ĐỔI. Bảng này từng bị gộp về MỘT TRANG, và bài kiểm gác đúng chuyện đó.
      // Chủ dự án nay chốt dựng lại thành CÂY có tab (xem CLAUDE.md · BẢNG KỸ NĂNG LÀ MỘT CÂY),
      // nên "không tab" hết hiệu lực. Thứ phải giữ là lời hứa THẬT bên dưới nó: không lớp nào
      // mở bảng ra thấy trống, và ba mục cũ không được bốc hơi — nay chúng nằm ở tab Khác.
      // Gom chữ của CẢ BA tab rồi mới chấm, để "mất mục" vẫn bị bắt dù mục dời sang tab khác.
      const tabs = typeof KN_TAB !== 'undefined' ? KN_TAB.map(x => x.id) : [null];
      let h = '', t = '', dongTab = {}, oCay = 0;
      // ⚠ GOM CHỮ TỪNG DÒNG NGAY TRONG VÒNG DUYỆT TAB. Truy vấn `.skill-row` sau vòng lặp là soi
      // một DOM chỉ còn tab cuối — mấy dòng "Kế Thừa" nằm ở tab Khác biến mất sạch, và phép kiểm
      // rò tên lớp báo oan. Gom vào mảng thì nó soi được cả ba tab.
      const chuDong = [];
      for (const tb of tabs){
        if (tb) window.knTab(tb);
        h += el.innerHTML; t += '\n' + (el.innerText || '');
        for (const d of el.querySelectorAll('.skill-row')) chuDong.push(d.textContent);
        dongTab[tb] = el.querySelectorAll('.skill-row').length + el.querySelectorAll('.kn-o:not(.kn-trong)').length;
        oCay += el.querySelectorAll('.kn-o').length;
      }
      if (tabs[0]) window.knTab(tabs[0]);
      out.push({ lop,
        tab: el.querySelectorAll('.bang-tab').length,
        dai: h.length,
        dong: Math.min(...Object.values(dongTab)),   // TAB NGHÈO NHẤT, không phải tổng
        dongTab, oCay,
        mucs: [...el.querySelectorAll('.stat-sec')].map(x => x.textContent.trim().split('—')[0].trim()),
        // Cả hai nửa của bảng cũ phải cùng có mặt trên MỘT trang
        coBonO: /1 chính · 1 phụ/.test(t),
        coDiSan: /DI SẢN LỚP/.test(t),
        // ⚠ HỎI "hai hệ tấn chức phụ CÓ ĐƯỜNG VÀO KHÔNG", đừng dò cái TIÊU ĐỀ. Khối
        // "HỆ TẤN CHỨC PHỤ" đã gỡ khi `danchi`/`tieuhon` dọn vào lưới tab Khác thành hai Ô —
        // nội dung còn nguyên, chỉ đổi cách bày. Dò chuỗi thì đổi cách bày là đỏ oan, mà xoá
        // thật hai chiêu đi rồi để lại cái tiêu đề thì lại XANH. Hỏi đúng thứ cần biết.
        coTanChuc: (() => { try { return ['danchi','tieuhon'].every(x => knDsKhac().includes(x)); }
                            catch { return false; } })(),
        // Tên lớp của CHÍNH mình phải xuất hiện. Tên lớp KHÁC chỉ được phép ở dòng ghi rõ
        // "Kế Thừa" — Spellblade là lớp lai, nó thừa hưởng chiêu của Dark Knight và Dark Wizard
        // (Fireball, Twisting Slash…) nên hiện tên hai lớp đó là ĐÚNG, không phải rò rỉ.
        tenMinh: t.includes(SECTS[lop].name),
        tenLopKhac: (() => {
          const xau = [];
          for (const k of Object.keys(SECTS)){
            if (k === lop) continue;
            const ten = SECTS[k].name;
            if (!t.includes(ten)) continue;
            // Mọi dòng nhắc tên lớp đó có ghi "Kế Thừa" không? Soi trên chữ đã gom từ CẢ BA tab.
            const dong = chuDong.filter(x => x.includes(ten));
            if (!dong.length || !dong.every(x => /Kế Thừa/.test(x))) xau.push(ten);
          }
          return xau;
        })(),
      });
    }
    return out;
  }, LOP);

  for (const r of ra){
    if (r.loi){ fail(`${r.lop}: startGame ném lỗi — ${r.loi}`); continue; }
    console.log(`  ${r.lop}: ${r.dong} dòng chiêu · ${r.mucs.length} mục · ${r.dai} ký tự`);
    if (r.tab !== 3)        fail(`${r.lop}: bảng có ${r.tab} tab — phải đúng 3 (Lớp · Vaeldra · Khác)`);
    // Chấm TAB NGHÈO NHẤT: cộng dồn cả ba tab thì một tab rỗng trơn vẫn lọt.
    if (r.dong < 2)         fail(`${r.lop}: có tab gần như rỗng (${JSON.stringify(r.dongTab)})`);
    if (!r.oCay)            fail(`${r.lop}: không tab nào vẽ ra cây kỹ năng`);
    if (!r.coBonO)          fail(`${r.lop}: thiếu mục bốn ô chiêu`);
    if (!r.coDiSan)         fail(`${r.lop}: thiếu mục DI SẢN LỚP`);
    if (!r.coTanChuc)       fail(`${r.lop}: hai hệ tấn chức phụ (danchi · tieuhon) không còn đường vào bảng`);
    if (!r.tenMinh)         fail(`${r.lop}: bảng không nhắc tên lớp của chính mình`);
    if (r.tenLopKhac.length) fail(`${r.lop}: hiện chiêu lớp khác mà KHÔNG ghi "Kế Thừa" — ${r.tenLopKhac.join(', ')}`);
  }
  if (!bad) pass(`cả ${ra.length} lớp: một trang, không tab, đủ ba mục, không lẫn lớp khác`);

  // Mục bị động: hai nhóm KHÁC nhau nay nằm cạnh nhau, tiêu đề không được trùng
  const bd = ra[0] ? ra[0].mucs.filter(x => /^BỊ ĐỘNG/.test(x)) : [];
  if (bd.length === 2 && bd[0] === bd[1]) fail('hai mục bị động trùng tiêu đề: ' + bd[0]);
  else if (bd.length === 2) pass('hai mục bị động phân biệt được');

  console.log('lỗi trang:', JSON.stringify(errs.slice(0, 5)));
  if (errs.length) fail('bảng Kỹ Năng ném lỗi: ' + errs[0]);

  await p.screenshot({ path: 'qa_shots/skillpanel.png' });
  await b.close();
  console.log(bad ? `FAIL(${bad})` : 'ALL PASS');
  process.exit(bad ? 1 : 0);
})();
