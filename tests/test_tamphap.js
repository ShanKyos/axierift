// TÂM PHÁP — ba cặp khắc chế, treo trên ba bộ võ công môn phái.
//
// Đây là HỌ THỨ BA của bị động (`tp`), khác hẳn hai họ kia:
//   • `chiSo`  → cộng chỉ số, tự ngộ theo cấp
//   • không có → bị động hiệu ứng, phải cắm ô
//   • `tp`     → luôn chạy, không chiếm ô, và CHỈ mở bằng vật phẩm
//
// Bốn chỗ hỏng im lặng mà bài này gác:
//  ① `matTich` sót ⇒ lên cấp là có sẵn, cả hệ Orb thành trang trí.
//  ② Vế GÂY nổ theo `player._tpBo`; cửa đó hỏng thì hoặc đòn THƯỜNG cũng gây choáng/độc
//     (ba bộ võ công mất lý do tồn tại), hoặc chiêu không gây gì mà không ai thấy.
//  ③ Quái gây lại ba hiệu ứng qua `m.role` — viết nhầm thành `m.vai` thì hai vế kháng
//     trông như "đã nối" trong khi chẳng có gì để mà kháng. Đã dẫm đúng thế.
//  ④ Trần: kháng 75%, GÂY 50%. Thiếu trần vế gây thì cấp chiêu 50 ra 106% — mọi nhát đều nổ.
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
    const IDS = Object.keys(VOHOC_DEFS).filter(x => laTamPhap(x));
    const o = { ids:IDS, lop:{} };

    // ① CẦU TẠM `TP_MO_THEO_CAP`: đang bật thì tự ngộ theo cấp, tắt đi thì khoá lại.
    // ⚠ Gác CẢ HAI trạng thái, không chỉ trạng thái đang chạy. Cầu này rồi sẽ bị lật sang
    // `false` lúc có Orb; nếu bài chỉ gác một phía thì lúc lật, nửa còn lại đi vào production
    // mà chưa ai từng chạy thử một lần nào.
    o.cauTam = TP_MO_THEO_CAP;
    for (const sc of LOP){
      startGame(sc, null); player.level = 120; player.lvPeak = 120; vhAutoLearn();
      o.lop[sc] = { ngo: IDS.filter(x => vhLearned(x)).length,
                    tren: IDS.filter(x => (KN_ROT_CHUNG.vaeldra||[]).includes(x)).length,
                    bo: (VO_CONG_BO[sc]||[]).length };
    }
    // Cấp thấp thì CHƯA được ngộ dù cầu đang bắc — mốc cấp phải là mốc thật, không trang trí.
    startGame('thieulam', null); player.level = 10; player.lvPeak = 10; vhAutoLearn();
    o.capThap = IDS.filter(x => vhLearned(x)).map(x => [x, VOHOC_DEFS[x].unlock]);
    // mở bảng Kỹ Năng cũng không được ngộ hộ — `vhAutoLearn` chạy ở dòng đầu renderSkillPanel
    startGame('thieulam', null); player.level = 120; player.lvPeak = 120;
    togglePanel('skill'); window.knTab('vaeldra');
    o.sauMoBang = IDS.filter(x => vhLearned(x)).length;
    // ⚠ Mệnh đề trên XANH VÌ LÝ DO SAI nếu dừng ở đây: sáu tâm pháp khai `phai: null`, mà
    // `vhAutoLearn` vốn đã `continue` qua mọi chiêu không có `phai`. Tức gỡ cờ `matTich` đi
    // thì bài vẫn xanh — đã thử đảo ngược và nó không đỏ. Phải lái THẲNG vào cờ: tạm gán
    // `phai` bằng lớp đang chơi rồi quét lại; còn chặn được thì mới đúng là cờ đang làm việc.
    // Lái thẳng vào cờ `matTich`: tắt cầu tạm cho ĐÚNG một chiêu (bằng cách bỏ `tp` đi nên
    // `laTamPhap` trả false) rồi gán `phai` — nếu `matTich` đang làm việc thì nó vẫn phải chặn.
    const _phaiCu = VOHOC_DEFS.tp_crush.phai, _tpCu = VOHOC_DEFS.tp_crush.tp;
    startGame('thieulam', null); player.level = 120; player.lvPeak = 120;
    delete VOHOC_DEFS.tp_crush.tp;
    VOHOC_DEFS.tp_crush.phai = player.sect;
    vhAutoLearn();
    o.coMatTich = !vhLearned('tp_crush');
    VOHOC_DEFS.tp_crush.phai = _phaiCu; VOHOC_DEFS.tp_crush.tp = _tpCu;

    // ④ trần hai vế
    startGame('thieulam', null); player.level = 120; player.lvPeak = 120; vhAutoLearn();
    IDS.forEach(x => player.vohoc[x] = true);
    player.skillLv = player.skillLv || {}; IDS.forEach(x => player.skillLv[x] = 100);
    calcDerived();
    o.tran = { gay: [1,2,3].map(x => +tpTyLeGay(x).toFixed(3)),
               khang: ['day','dinh','doc'].map(x => +tpKhang(x).toFixed(3)),
               poisonRes: +(player.vhPoisonRes||0).toFixed(3) };

    // ⚠ TỰ KIỂM CẢNH TRƯỚC KHI CHẤM. Nhân vật mới đứng ở THỊ TRẤN — không một con quái nào,
    // nên `dungQuai()` trả null và cả ba mệnh đề dưới ra 0 trông y hệt "cơ chế không chạy".
    // Đã đỏ đúng kiểu đó một lần. Phải sang map có bãi quái rồi mới đo.
    travelTo('corran'); player.reflect = 0;
    o.canhQuai = mobs.filter(m => !m.dead).length;

    // ② CỬA `_tpBo`: đòn của chiêu bộ N nổ, đòn THƯỜNG thì không
    const dungQuai = () => {
      const m = mobs.find(x => !x.dead && !x.def.boss);
      if (!m) return null;
      m.hp = m.maxHp = 1e9; m.stunT = 0; m.poisonT = 0; return m;
    };
    // ⚠ NHẬN DIỆN BỘ 1 BẰNG CÚ VĂNG, KHÔNG BẰNG "có mất máu không". Mọi đòn đều trừ máu, nên
    // phép đo theo máu ra 400/400 ở CẢ bộ 1 lẫn đòn thường — trông y hệt "cửa `_tpBo` hỏng"
    // trong khi cửa ấy chạy đúng. Đã đo nhầm đúng kiểu đó một lần.
    // Mỗi kiểu một DẤU RIÊNG: bộ 1 → bị đẩy chỗ · bộ 2 → `stunT` · bộ 3 → `poisonT`.
    const doNo = (bo, lan) => {
      let n = 0;
      for (let i = 0; i < lan; i++){
        const m = dungQuai(); if (!m) break;
        const x0 = m.x, y0 = m.y;
        m.stunT = 0; m.poisonT = 0;
        player._tpBo = bo;
        hurtMob(m, 10, 'tp');
        const dau = bo === 2 ? (m.stunT > 0)
                  : bo === 3 ? (m.poisonT > 0)
                  : (Math.hypot(m.x - x0, m.y - y0) > 0.01 || m.stunT > 0 || m.poisonT > 0);
        if (dau) n++;
        m.stunT = 0; m.poisonT = 0; m.hp = 1e9; m.x = x0; m.y = y0;
      }
      return n;
    };
    // `source:'tp'` chứ không phải 'hit' — 'hit' có cú hất lùi CÓ SẴN của hurtMob, nó sẽ làm
    // phép đo "bị đẩy chỗ" ở trên ra 400/400 cho cả đòn thường vì một cơ chế khác hẳn.
    o.no = { bo1: doNo(1, 400), bo2: doNo(2, 400), bo3: doNo(3, 400), thuong: doNo(0, 400) };

    // ③ QUÁI gây lại — phải đo SỢI DÂY, không đo cái bảng.
    // ⚠ Bản đầu của mệnh đề này chỉ hỏi "quái có trường `role` không". Đổi chỗ đọc thành
    // `m.vai` (đúng lỗi tôi đã mắc) thì bài VẪN XANH, vì cái bảng thì không bao giờ hỏng —
    // thứ hỏng là chỗ đọc nó. Nay lái quái đánh thật rồi xem người chơi CÓ BỊ VĂNG không.
    o.vaiCo = { nang: mobs.some(m => m.role === 'nang'), phap: mobs.some(m => m.role === 'phap') };
    // ⚠ ĐO MỘT THỨ MỘT LÚC. Lần đầu tôi đo qua bộ kháng đang bật hết cỡ (75%) — tức đo cùng
    // lúc "quái có gây không" VÀ "kháng có ăn không", và khi ra 0 thì không nói được là do
    // cái nào. Nay `khang=false` để soi sợi dây, `khang=true` để soi vế kháng.
    const keoQuaiDanh = (vai, soNhip, khang) => {
      const m = mobs.find(x => !x.dead && x.role === vai);
      if (!m) return null;
      IDS.forEach(x => { player.vohoc[x] = khang; });   // bật/tắt cả sáu
      calcDerived();
      player.hp = player.maxHp = 1e9; player.reflect = 0; player.dinhT = 0;
      moveTarget = null; player.auto = false; player.excBlock = 0; player.eva = 0;
      let vang = 0, khoa = 0, danh = 0;
      for (let i = 0; i < soNhip; i++){
        m.dead = false; m.hp = m.maxHp = 1e9;
        // ⚠ Phải ghim cả BÃI của nó, không chỉ toạ độ. Nhánh đánh là `else if` đứng SAU nhánh
        // đi-về-bãi: người chơi trôi ra khỏi bãi (ví dụ vì vừa bị nện văng 800 nhịp ở lượt đo
        // trước) là con quái chọn đi về nhà và KHÔNG đánh lần nào. Đo ra 0 trông y hệt "cơ chế
        // không chạy", trong khi đo riêng nó ra 60/800. Đã mất một vòng chẩn đoán vì chỗ này.
        m.zone = { x: player.x, y: player.y, r: 240, count: 1 };
        m.x = player.x + 8; m.y = player.y; m.atkT = 0; m.stunT = 0;
        const x0 = player.x, y0 = player.y;
        update(0.05);
        if (Math.hypot(player.x - x0, player.y - y0) > 1) vang++;
        if ((player.dinhT || 0) > 0){ khoa++; player.dinhT = 0; }
        if (player.hp < 1e9){ danh++; player.hp = 1e9; }
      }
      return { vang, khoa, danh };
    };
    o.quaiNang = keoQuaiDanh('nang', 800, false);
    o.quaiPhap = keoQuaiDanh('phap', 800, false);
    o.quaiNangK = keoQuaiDanh('nang', 800, true);
    o.quaiPhapK = keoQuaiDanh('phap', 800, true);
    IDS.forEach(x => { player.vohoc[x] = true; }); calcDerived();

    // ② phần hai: định thân KHOÁ được cả di chuyển lẫn ra chiêu
    player.dinhT = 5; const x0 = player.x, y0 = player.y;
    moveTarget = { x: player.x + 600, y: player.y }; player.auto = false;
    for (let i = 0; i < 30; i++) update(0.05);
    o.dinh = { diDuoc: Math.round(Math.hypot(player.x - x0, player.y - y0)), conT: +(player.dinhT||0).toFixed(2) };
    player.dinhT = 5; player.cd = {}; player.qi = player.maxQi;
    const _cdTruoc = JSON.stringify(player.cd);
    castSkill('a');
    o.dinh.raChieuDuoc = JSON.stringify(player.cd) !== _cdTruoc;
    player.dinhT = 0;

    // ⑤ không cắm vào ô được
    o.camCam = IDS.map(x => [x, knOHopLe(1, x)]);
    return o;
  });
  console.log(JSON.stringify(r, null, 1));

  if (r.ids.length !== 6) fail(`có ${r.ids.length} tâm pháp, mong 6`); else pass('6 tâm pháp');

  let e1 = 0;
  const mong = r.cauTam ? r.ids.length : 0;
  for (const [sc, d] of Object.entries(r.lop)){
    if (d.ngo !== mong){
      fail(r.cauTam
        ? `① ${sc}: cầu tạm ĐANG BẬT mà cấp 120 chỉ ngộ ${d.ngo}/${r.ids.length} — sáu ô khoá vĩnh viễn, hệ không có cửa nào`
        : `① ${sc}: cầu tạm đã TẮT mà cấp 120 vẫn tự ngộ ${d.ngo} — cờ matTich hỏng, hệ Orb thành trang trí`);
      e1++;
    }
    if (d.tren !== r.ids.length){ fail(`① ${sc}: tab Vaeldra chỉ rót ${d.tren}/${r.ids.length}`); e1++; }
    if (d.bo !== 3){ fail(`① ${sc}: VO_CONG_BO có ${d.bo} bộ, mong 3`); e1++; }
  }
  if (r.capThap.length){ fail(`① cấp 10 đã ngộ ${JSON.stringify(r.capThap)} — mốc cấp chỉ là số trang trí`); e1++; }
  if (r.sauMoBang !== mong){ fail(`① mở bảng Kỹ Năng xong ra ${r.sauMoBang}, mong ${mong} — vhAutoLearn chạy ở đầu renderSkillPanel`); e1++; }
  if (!r.coMatTich){ fail('① cờ `matTich` KHÔNG chặn gì cả — gán cho nó một `phai` là nó tự ngộ ngay'); e1++; }
  if (!e1) pass(`① cầu tạm ${r.cauTam ? 'BẬT — tự ngộ đúng mốc cấp' : 'TẮT — khoá, chỉ mở bằng Orb'} ở cả 5 lớp; cấp 10 chưa có gì; đủ 6 ô + 3 bộ`);

  const T = r.tran;
  let e4 = 0;
  if (T.gay.some(x => x !== 0.5)){ fail(`④ trần vế GÂY hỏng: ${JSON.stringify(T.gay)} — mong 0,5`); e4++; }
  if (T.khang.some(x => x !== 0.75)){ fail(`④ trần vế KHÁNG hỏng: ${JSON.stringify(T.khang)} — mong 0,75`); e4++; }
  if (T.poisonRes !== 0.75){ fail(`④ kháng độc không dồn vào vhPoisonRes (${T.poisonRes}) — ba chỗ gây độc sẽ không đọc được`); e4++; }
  if (!e4) pass('④ trần đúng: gây 50% · kháng 75% · kháng độc dồn vào vhPoisonRes');

  const N = r.no;
  let e2 = 0;
  if (!r.canhQuai){ fail('② cảnh dựng hỏng: map thử KHÔNG có con quái nào — ba mệnh đề dưới sẽ ra 0 vì lý do sai'); e2++; }
  if (N.bo1 === null || N.bo1 === 0){ fail(`② bộ 1 không nổ lần nào (${N.bo1})`); e2++; }
  if (!N.bo2){ fail(`② bộ 2 không khoá được con nào (${N.bo2})`); e2++; }
  if (!N.bo3){ fail(`② bộ 3 không gây độc lần nào (${N.bo3})`); e2++; }
  if (N.thuong !== 0){ fail(`② ĐÒN THƯỜNG cũng nổ tâm pháp ${N.thuong}/400 — cửa _tpBo hỏng, ba bộ võ công mất lý do tồn tại`); e2++; }
  if (!e2) pass(`② chỉ võ công môn phái mới nổ (bộ1 ${N.bo1} · bộ2 ${N.bo2} · bộ3 ${N.bo3} / 400), đòn thường 0`);

  if (!r.vaiCo.nang || !r.vaiCo.phap) fail(`③ cảnh dựng hỏng: map thử thiếu vai (nang=${r.vaiCo.nang}, phap=${r.vaiCo.phap})`);
  else if (!r.quaiNang || !r.quaiPhap) fail('③ không kéo được quái nào ra đánh — cảnh dựng hỏng');
  else if (!r.quaiNang.danh || !r.quaiPhap.danh) fail(`③ cảnh dựng hỏng: quái gần như không đánh được (nang ${r.quaiNang.danh}, phap ${r.quaiPhap.danh}) — ba mệnh đề dưới sẽ ra 0 vì lý do sai`);
  else if (!r.quaiNang.vang) fail(`③ quái Trọng Giáp đánh 800 nhịp mà KHÔNG nện văng lần nào — chỗ đọc vai sai (m.vai vs m.role), vế kháng "day" không có gì để kháng`);
  else if (!r.quaiPhap.khoa) fail(`③ quái Pháp Sư đánh 800 nhịp mà KHÔNG khoá chân lần nào — vế kháng "dinh" không có gì để kháng`);
  // ⚠ ĐÒI GIẢM HẲN, ĐỪNG ĐÒI `<`. Kháng 75% thì kỳ vọng 59 → ~15; nhưng nếu chỉ hỏi "có nhỏ
  // hơn không" thì hai lượt cùng kỳ vọng 59 vẫn qua được ~50% số lần chỉ nhờ xúc xắc — tức
  // mệnh đề đỏ theo may rủi chứ không theo lỗi. Đã thử đảo ngược và nó KHÔNG đỏ vì đúng lý do
  // đó. Ngưỡng một nửa nằm giữa 15 và 59, xa cả hai đầu.
  else if (!(r.quaiNangK.vang <= r.quaiNang.vang * 0.5)) fail(`③ bật Steadfast mà số lần bị nện văng không giảm hẳn (${r.quaiNang.vang} → ${r.quaiNangK.vang}) — vế kháng không nối vào chỗ gây`);
  else if (!(r.quaiPhapK.khoa <= r.quaiPhap.khoa * 0.5)) fail(`③ bật Unbound mà số lần bị khoá chân không giảm hẳn (${r.quaiPhap.khoa} → ${r.quaiPhapK.khoa}) — vế kháng không nối vào chỗ gây`);
  else pass(`③ quái gây thật và kháng ăn thật: nện văng ${r.quaiNang.vang}→${r.quaiNangK.vang} · khoá chân ${r.quaiPhap.khoa}→${r.quaiPhapK.khoa} (trên 800 nhịp)`);

  const D = r.dinh;
  if (D.diDuoc > 5) fail(`② định thân KHÔNG khoá được chân: đi được ${D.diDuoc}px`);
  else if (D.raChieuDuoc) fail('② định thân không khoá được VÕ CÔNG — ảnh gốc ghi rõ "không thể di chuyển VÀ sử dụng võ công"');
  else pass(`② định thân khoá cả chân lẫn chiêu (đi ${D.diDuoc}px)`);

  const camHong = r.camCam.filter(([, ly]) => !ly).map(([x]) => x);
  if (camHong.length) fail(`⑤ cắm được vào ô: ${camHong.join(', ')}`);
  else pass('⑤ không cái nào cắm vào ô được');

  console.log('errors:', JSON.stringify(errs));
  if (errs.length) fail('lỗi trang: ' + errs[0]);
  console.log(bad === 0 ? 'PASS' : 'FAIL(' + bad + ')');
  await b.close();
  process.exit(bad === 0 ? 0 : 1);
})();
