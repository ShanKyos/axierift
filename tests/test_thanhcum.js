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
      .filter(e => !e.querySelector('span') && !e.classList.contains('mc-menu'))
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

  if (errs.length) fail('lỗi trang: ' + errs.slice(0,3).join(' | '));
  console.log(bad ? `\n${bad} FAIL` : '\nOK');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
