// THANH DƯỚI CHIA BA CỤM — cửa của MÌNH bên trái · ô chiêu ở GIỮA · người khác + hệ thống bên phải.
//
// Chủ dự án đưa ảnh mẫu MU và chốt: "phải dàn trải đều 2 bên thì UI mới cân đối". Trước bản này
// cả chín nút menu dồn vào đuôi phải, nên ô chiêu — thứ nhìn nhiều nhất — bị đẩy lệch khỏi tâm.
//
// Bốn kiểu hỏng bài này gác, và ba trong bốn KHÔNG ném lỗi:
//  1. CỤM TRÁI QUÊN BẬT. `#mc-trai` khai `hidden` trong HTML y như `#menu-cot`; chỗ vào game
//     phải gỡ cờ cho CẢ HAI. Thiếu một dòng là nửa thanh biến mất, không lỗi, không dấu hiệu.
//  2. CÂN ĐỐI TRÔI MẤT. Dời một nút từ trái sang phải là tâm ô chiêu lệch đi — mắt thấy ngay
//     mà không bài kiểm nào nói. §4 đo bằng ĐỘ LỆCH TÂM, không đếm nút.
//  3. NÚT CHẾT. Tổ Đội / Hảo Hữu là hai nút MỚI; nối thiếu là bấm không ra gì (bài học
//     `openEvoPanel` của test_cayky). §3 BẤM THẬT rồi hỏi bảng có mở không.
//  4. NÚT KHÔNG TÊN. Nhãn chỉ hiện lúc rê chuột, nên nút thiếu <span> là một ô câm vĩnh viễn.
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

  await p.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', null); });
  await p.waitForTimeout(900);

  const r = await p.evaluate(() => {
    const q = id => document.getElementById(id);
    const hud = q('bottom-hud'), trai = q('mc-trai'), sb = q('skillbar'), phai = q('menu-cot');
    if (!hud || !trai || !sb || !phai) return { thieu: [!hud&&'bottom-hud', !trai&&'mc-trai', !sb&&'skillbar', !phai&&'menu-cot'].filter(Boolean) };
    const R = e => e.getBoundingClientRect();
    const hienRa = e => R(e).width > 0 && R(e).height > 0;
    const trongCum = (cum, id) => { const e = q(id); return !!e && cum.contains(e); };
    const TRAI = ['btn-char','btn-bag','btn-skill','btn-qlog'];
    const PHAI = ['btn-party','btn-friend','btn-map','btn-settings'];
    // nút nào thiếu nhãn rê chuột
    const camNut = [...hud.querySelectorAll('.mc-btn')]
      .filter(e => !e.querySelector('span'))   // nút Menu nay cũng có nhãn ⇒ không còn ngoại lệ nào
      .map(e => e.id || '(không id)');
    return {
      hienTrai: hienRa(trai), hienPhai: hienRa(phai),
      saiTrai: TRAI.filter(id => !trongCum(trai, id)),
      saiPhai: PHAI.filter(id => !trongCum(phai, id)),
      lanTrai: TRAI.filter(id => trongCum(phai, id)),   // nút trái còn sót bên phải
      xTrai: R(trai).x, xChieu: R(sb).x, xPhai: R(phai).x,
      lech: Math.round((R(sb).x + R(sb).width / 2) - (R(hud).x + R(hud).width / 2)),
      rTrai: Math.round(R(trai).width), rPhai: Math.round(R(phai).width),
      camNut,
    };
  });

  if (r.thieu){ fail('§0 thiếu phần tử: ' + r.thieu.join(', ') + ' — cả bài không chấm được'); }
  else {
    // ── §1 cả hai cụm phải HIỆN RA, không chỉ có trong DOM ──
    if (r.hienTrai && r.hienPhai) pass('§1 cả cụm trái lẫn cụm phải hiện ra sau khi vào game');
    else fail(`§1 có cụm không hiện — trái:${r.hienTrai} phải:${r.hienPhai} (nhiều khả năng quên gỡ cờ hidden cho #mc-trai)`);

    // ── §2 đúng nút, đúng cụm, và không sót bên kia ──
    if (!r.saiTrai.length && !r.saiPhai.length && !r.lanTrai.length)
      pass('§2 Nhân Vật · Túi Đồ · Kỹ Năng · Nhiệm Vụ bên TRÁI; Tổ Đội · Hảo Hữu · Bản Đồ · Cài Đặt bên PHẢI');
    else fail(`§2 xếp cụm sai — thiếu bên trái: [${r.saiTrai}] · thiếu bên phải: [${r.saiPhai}] · còn sót bên phải: [${r.lanTrai}]`);

    // ── §3 thứ tự trái → giữa → phải, đo bằng TOẠ ĐỘ chứ không bằng thứ tự khai ──
    if (r.xTrai < r.xChieu && r.xChieu < r.xPhai) pass('§3 thứ tự trên màn: cụm trái → ô chiêu → cụm phải');
    else fail(`§3 thứ tự sai trên màn — x trái ${Math.round(r.xTrai)}, ô chiêu ${Math.round(r.xChieu)}, phải ${Math.round(r.xPhai)}`);

    // ── §4 CÂN ĐỐI: tâm ô chiêu phải gần tâm thanh ──
    // Dồn hết nút về một bên thì độ lệch vọt lên cỡ bề ngang một cụm (~180px). Ngưỡng 60 là
    // đo được: bố cục hiện tại ra 22px, còn bỏ hẳn cụm trái ra thì trên 180px.
    if (Math.abs(r.lech) <= 60) pass(`§4 ô chiêu nằm giữa thanh — lệch ${r.lech}px (trái ${r.rTrai}px · phải ${r.rPhai}px)`);
    else fail(`§4 thanh lệch một bên — tâm ô chiêu cách tâm thanh ${r.lech}px (trái ${r.rTrai}px · phải ${r.rPhai}px)`);

    // ── §5 không nút nào câm ──
    if (!r.camNut.length) pass('§5 mọi ô menu đều có nhãn rê chuột');
    else fail('§5 ô menu không có nhãn: ' + r.camNut.join(', '));
  }

  // ── §6 HAI NÚT MỚI PHẢI BẤM RA BẢNG — bấm thật, không đọc onclick ──
  for (const [id, pid, ten] of [['btn-party','panel-party','Tổ Đội'], ['btn-friend','panel-friend','Hảo Hữu']]){
    const o = await p.evaluate(([id, pid]) => {
      const b2 = document.getElementById(id), pn = document.getElementById(pid);
      if (!b2 || !pn) return { thieu: true };
      if (!pn.classList.contains('hidden')) pn.classList.add('hidden');
      b2.click();
      const mo = !pn.classList.contains('hidden');
      const sang = b2.classList.contains('on');
      b2.click();
      return { mo, sang, dong: pn.classList.contains('hidden') };
    }, [id, pid]);
    if (o.thieu) fail(`§6 ${ten}: thiếu nút hoặc thiếu bảng`);
    else if (o.mo && o.dong && o.sang) pass(`§6 ${ten}: bấm mở được bảng, nút sáng lên, bấm lại thì đóng`);
    else fail(`§6 ${ten} hỏng — mở:${o.mo} · nút sáng:${o.sang} · đóng lại:${o.dong}`);
  }

  // ── §7 CỠ Ô MENU và ĐỘ GỌN CỦA THANH ────────────────────────────────────────
  // Chủ dự án nhìn ảnh chụp bản 40px và gọi đúng tên: "sao nó dài quá vậy, UI bên hình mẫu
  // gọn lắm mà". Nên hợp đồng ở đây có HAI vế, và vế thứ hai mới là vế người chơi thấy:
  //   ① ô menu phải NHỎ HƠN ô chiêu — nhưng có SÀN, không thì "gọn" trượt thành "bấm không trúng";
  //   ② cả thanh phải nằm dưới một phần bề ngang màn hình.
  // Chỉ có ① thì hạ cỡ ô mà nới lề vẫn qua; chỉ có ② thì thu nhỏ ô tới mức vô dụng cũng qua.
  const r7 = await p.evaluate(() => {
    const R = e => e.getBoundingClientRect();
    const hud = document.getElementById('bottom-hud');
    const oMenu = document.querySelector('#mc-trai .mc-btn'), oChieu = document.getElementById('sk-0');
    if (!hud || !oMenu || !oChieu) return { thieu: true };
    return { menu: Math.round(R(oMenu).width), chieu: Math.round(R(oChieu).width),
             tong: Math.round(R(hud).width), man: innerWidth,
             pc: +(R(hud).width / innerWidth * 100).toFixed(1) };
  });
  // ⚠ Trần đo bằng PX, không bằng % bề ngang màn. Thanh là một hàng ô CỠ CỐ ĐỊNH nên nó không
  // co theo cửa sổ: cùng một thanh 756px ra 47,3% ở màn 1600 và 52,5% ở màn 1440. Đặt ngưỡng
  // theo % là ngưỡng đổi theo khổ cửa sổ của người chạy bài — đã đỏ đúng vì lý do đó một lần.
  const SAN_O = 26, TRAN_PX = 800;   // đo được: ô menu 30px · cả thanh 756px (bản 40px: 865px)
  if (r7.thieu) fail('§7 thiếu phần tử — không chấm được');
  else {
    if (r7.menu < r7.chieu && r7.menu >= SAN_O)
      pass(`§7① ô menu ${r7.menu}px — nhỏ hơn ô chiêu ${r7.chieu}px và trên sàn ${SAN_O}px`);
    else fail(`§7① cỡ ô menu sai — ${r7.menu}px so với ô chiêu ${r7.chieu}px (phải nhỏ hơn, và ≥ ${SAN_O}px để còn bấm trúng)`);
    if (r7.tong <= TRAN_PX) pass(`§7② cả thanh rộng ${r7.tong}px (trần ${TRAN_PX}px) — ${r7.pc}% màn ${r7.man}px`);
    else fail(`§7② thanh rộng ${r7.tong}px, quá trần ${TRAN_PX}px — ${r7.pc}% màn ${r7.man}px`);
  }

  if (errs.length) fail('lỗi trang: ' + errs.slice(0,3).join(' | '));
  console.log(bad ? `\n${bad} FAIL` : '\nOK');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
