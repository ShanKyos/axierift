// Hệ trang bị. Trước bản này: tên là Ngũ Hành (Kim/Mộc/Thủy/Hỏa/Thổ — vi phạm Luật 1), MỌI món
// đều mang một hệ mà KHÔNG ô nào đọc tới (cả hai chiều khắc hệ đều lấy hệ của LỚP), còn Lò Hỗn
// Độn thì bán công thức Đổi Hệ ăn 1 Hỗn Độn Châu để roll lại đúng thứ vô dụng đó.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1100, height: 700 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://localhost:8853/index.html'); await p.waitForTimeout(700);
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  let bad = 0; const fail = m => { console.log('FAIL', m); bad++; };

  const r = await p.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null); travelTo('comoc');
    player.level = 60; calcDerived();
    const o = {};
    // ── 1. Bảng hệ: tên phương Tây, vòng khắc kín 5 cạnh, không lặp ──
    o.ten = ELEMENTS.map(k => elName(k));
    o.vongKhac = ELEMENTS.map(k => `${elName(k)}>${elName(ELEM[k].beats)}`);
    const seen = new Set(); let kin = true, cur = ELEMENTS[0];
    for (let i = 0; i < 5; i++){ if (seen.has(cur)) kin = false; seen.add(cur); cur = ELEM[cur].beats; }
    o.vongKin = kin && cur === ELEMENTS[0] && seen.size === 5;
    o.conTuNguHanh = o.ten.some(t => /Kim|Mộc|Thủy|Hỏa|Thổ/.test(t));

    // ── 2. Chỉ VŨ KHÍ mới mang hệ ──
    const cnt = { vukhi:0, khac:0, vukhiCoHe:0, khacCoHe:0 };
    for (let i = 0; i < 3000; i++){
      const it = genItem(60, 0, 'elite');
      if (it.slot === 'vukhi'){ cnt.vukhi++; if (hasElem(it)) cnt.vukhiCoHe++; }
      else { cnt.khac++; if (it.element) cnt.khacCoHe++; }
    }
    o.gan = cnt;

    // ── 3. Sát thương lên quái ĐỔI theo hệ vũ khí ──
    const sectEl = SECTS[player.sect].element;
    const mkW = (el) => { const w = genSpecific ? null : null;
      const it = genItem(60, 0, 'elite'); it.slot='vukhi'; it.slotName='Vũ Khí'; it.special=false;
      it.element = el; it.main = { k:'atk', v:300, name:'Công Kích' }; it.subs=[]; it.exc=null;
      it.plus=0; it.luck=false; it.perfect=false; it.rarity=0; return it; };
    const hitWith = (el, mobEl) => {
      player.equip.vukhi = el === null ? undefined : mkW(el);
      if (el === null) delete player.equip.vukhi;
      calcDerived();
      player.crit = 0; player.perfectProc = 0; player.pierce = 0;
      mobs = [];
      const m = spawnMob('thinu', { x:1400, y:1400, r:10 }, null, true);
      m.def = Object.assign({}, m.def, { el: mobEl, def: 0, hp: 9e9 });
      m.hp = 9e9; m.maxHp = 9e9; m.shield = 0;
      const before = m.hp;
      hurtMob(m, 1000, 'hit');
      const dmg = before - m.hp;
      mobs = [];
      return dmg;
    };
    // hệ quái = hệ mà vũ khí Ember khắc, và hệ khắc ngược lại Ember
    const emberBeats = ELEM['Hỏa'].beats;                    // Ember khắc gì
    const beatsEmber = ELEMENTS.find(k => ELEM[k].beats === 'Hỏa'); // gì khắc Ember
    o.emberKhac = elName(emberBeats); o.khacEmber = elName(beatsEmber);
    o.st = {
      trung:   hitWith('Hỏa', 'Hỏa'),          // không khắc nhau
      khac:    hitWith('Hỏa', emberBeats),     // vũ khí khắc quái → phải CAO nhất
      biKhac:  hitWith('Hỏa', beatsEmber),     // quái khắc vũ khí → phải THẤP nhất
      khongVK: hitWith(null,  emberBeats),     // không vũ khí → theo hệ LỚP
      lopKhac: hitWith(null,  ELEM[sectEl].beats),
    };
    o.heLop = elName(sectEl);

    // ── 4. Hệ vũ khí KHÔNG được đổi đòn quái đánh MÌNH ──
    //
    // ⚠ Mệnh đề này TRƯỚC ĐÂY dò bằng CHUỖI MÃ NGUỒN: `String(window.update).match(/sectEl2 =
    // ([^;]+);/)` rồi đòi nó đúng bằng `SECTS[player.sect].element`. Nó gác đúng luật nhưng gác
    // bằng đúng MỘT cách viết, nên đợt cho con Axie quyết định hệ phòng thủ (`heThu`) làm nó đỏ
    // — trong khi luật thì còn nguyên: `heThu` đọc Axie, không đọc vũ khí.
    //
    // Nay đo HÀNH VI: đổi vũ khí qua cả 5 hệ rồi cho cùng một con quái đánh, máu mất phải BẰNG
    // NHAU. Chặt hơn bản cũ — nó bắt được cả trường hợp ai đó luồn vũ khí vào chiều phòng thủ
    // qua một hàm trung gian, thứ mà phép dò chuỗi không thấy.
    const mobToPlayer = () => {
      travelTo('chungnam');                 // ⚠ startGame thả vào thành an toàn: `mobs` rỗng
      player.reflect = 0;                   // phản đòn ghi thẳng m.hp — xem CLAUDE.md
      // ⚠ BA CÁI NHIỄU, cả ba đã làm bài này đỏ oan một lượt mỗi cái:
      //  1. `mkW(el)` sinh cây vũ khí KHÁC mỗi lần ⇒ lệch vì chỉ số, không vì hệ (527→594).
      //  2. Mỗi đòn quái mang `rnd(0.85, 1.15)` — tản ±15% ⇒ một đòn không đo được gì (449→571).
      //  3. Bơm `player.maxHp` lên 1e9 để khỏi chết thì `calcDerived()` tính lại đè ngay.
      //
      // Nên tách làm HAI mệnh đề, và chúng bổ cho nhau:
      //  (a) TẤT ĐỊNH — `heThu()` phải trơ với vũ khí. Nhanh, không nhiễu, và nói đúng cái luật.
      //  (b) THỐNG KÊ — tổng máu mất qua ~nhiều trăm đòn phải bằng nhau. Cái này bắt được ca mà
      //      (a) mù: ai đó cắm thêm một số hạng vũ khí THẲNG vào nhánh phòng thủ, không qua heThu.
      const w = mkW('Kim'); player.equip.vukhi = w;
      const mat = {}, heThuTheoVK = {};
      for (const el of ELEMENTS){
        w.element = el; calcDerived();
        heThuTheoVK[el] = heThu(player);                 // (a)
        player.eva = 0;
        const m = mobs.find(x => x && x.hp > 0);
        if (!m) return { loi: 'không có quái để đo' };
        m.def = Object.assign({}, m.def, { el:'Hỏa', lv:player.level, atk:400, atkCd:0.01, range:200 });
        m.x = player.x + 26; m.y = player.y;
        m.hp = m.maxHp = 999999; m.atkT = 0; m.aggro = 9999; m.target = player;
        // (b) bơm máu lại SAU MỖI tick: không đụng maxHp nên calcDerived không đè được
        //
        // ⚠ HÂM NÓNG TRƯỚC KHI ĐẾM. Không có bước này thì hai hệ đo ĐẦU ra 19.543 và 30.929
        // trong khi ba hệ sau ra ~467.000 — không phải cơ chế hỏng, mà là mấy chục tick đầu con
        // quái còn đang áp sát nên chưa đánh. Thứ tự đo biến thành một biến của phép đo.
        // ⚠ `update()` THOÁT SỚM khi `dead` — và cờ đó dính lại từ lượt dựng cảnh trước, nên hai
        // hệ đo đầu ra ĐÚNG 0 trong khi ba hệ sau khớp nhau tới 0,3%. Không phải cơ chế hỏng,
        // là người chơi đang nằm. Gỡ cờ trước mỗi lượt.
        if (typeof dead !== 'undefined') dead = false;
        player.hp = player.maxHp;
        for (let i = 0; i < 240; i++){
          player.moveTarget = null; player.eva = 0;
          m.x = player.x + 26; m.y = player.y; m.hp = m.maxHp; m.target = player; m.aggro = 9999;
          update(1/60); player.hp = player.maxHp;
        }
        // ⚠ GHIM LẠI MỖI TICK. Đặt chỗ đứng một lần ở đầu vòng là không đủ: người chơi tự đi
        // (AUTO / moveTarget) và con quái tự về bầy, nên sau vài trăm tick chúng rời nhau và
        // phép đo ra 0 — đúng hai hệ ĐẦU trong vòng lặp, ba hệ sau thì khớp nhau tới 0,3%.
        // Thứ tự đo biến thành một biến của phép đo, và đó là lỗi của cảnh dựng chứ không phải
        // của cơ chế.
        const ghim = () => {
          player.moveTarget = null; player.eva = 0;
          if (typeof dead !== 'undefined') dead = false;
          m.x = player.x + 26; m.y = player.y;
          m.hp = m.maxHp; m.target = player; m.aggro = 9999;
        };
        let tong = 0;
        for (let i = 0; i < 900; i++){
          ghim();
          const truoc = player.hp;
          update(1/60);
          if (player.hp < truoc) tong += truoc - player.hp;
          player.hp = player.maxHp;
        }
        mat[el] = Math.round(tong);
      }
      return { mat, heThuTheoVK };
    };
    Object.assign(o, mobToPlayer());

    // ── 5. Đổi Hệ chỉ nhận vũ khí ──
    const armor = genItem(60, 0, 'elite'); armor.slot = 'ao'; armor.element = null;
    const weap  = mkW('Hỏa');
    const rec = CHAOS_RECIPES.find(x => x.id === 'element');
    o.doiHe = { nhanGiap: !!rec.match({ items:[armor], jewels:{} }),
                nhanVuKhi: !!rec.match({ items:[weap], jewels:{} }) };
    return o;
  });

  console.log('tên hệ      :', JSON.stringify(r.ten));
  console.log('vòng khắc   :', r.vongKhac.join(' · '), '· kín:', r.vongKin);
  console.log('gán hệ      :', JSON.stringify(r.gan), '· Cổ Thần có hệ:', r.coThanCoHe);
  console.log('hệ lớp      :', r.heLop, '· Ember khắc', r.emberKhac, '· bị', r.khacEmber, 'khắc');
  console.log('sát thương  :', JSON.stringify(r.st));
  console.log('heThu theo hệ VŨ KHÍ (phải trơ):', JSON.stringify(r.heThuTheoVK));
  console.log('tổng máu mất theo hệ VŨ KHÍ (phải bằng nhau):', JSON.stringify(r.mat));
  console.log('Đổi Hệ      :', JSON.stringify(r.doiHe));

  if (r.conTuNguHanh) fail(`tên hệ vẫn là Ngũ Hành: ${JSON.stringify(r.ten)}`);
  if (new Set(r.ten).size !== 5) fail('tên hệ bị trùng');
  if (!r.vongKin) fail('vòng khắc không kín 5 cạnh — có hệ không khắc ai hoặc khắc lặp');
  if (r.gan.vukhiCoHe !== r.gan.vukhi) fail(`${r.gan.vukhi - r.gan.vukhiCoHe} vũ khí KHÔNG có hệ`);
  if (r.gan.khacCoHe) fail(`${r.gan.khacCoHe} món KHÔNG PHẢI vũ khí vẫn mang hệ — dòng chết như bản cũ`);
  if (r.coThanCoHe) fail('đồ Cổ Thần (giáp) vẫn mang hệ');
  if (!(r.st.khac > r.st.trung)) fail(`vũ khí khắc hệ quái không tăng ST (${r.st.trung} → ${r.st.khac})`);
  if (!(r.st.biKhac < r.st.trung)) fail(`bị quái khắc không giảm ST (${r.st.trung} → ${r.st.biKhac})`);
  // Từ khi giáp quái TRỪ THẲNG một lượng cố định, mọi hệ số nhân đều bị KHUẾCH ĐẠI ở sát thương
  // cuối: (a×1,2 − F) / (a − F) luôn lớn hơn 1,2. Đây là hành vi cố ý, và cũng đúng cách MU làm —
  // nó khiến việc chọn đúng hệ, ăn bạo kích hay gắn dòng Hoàn Hảo đáng giá hơn, chứ không phải
  // lỗi. Nên mệnh đề đổi từ "đúng 1,20×" thành hai mệnh đề chặt hơn và không nói dối:
  //   a) hệ số vẫn theo đúng CHIỀU và có biên độ hợp lý
  //   b) khắc hệ luôn ăn đứt bị khắc, khoảng cách không được co lại
  const kKhac = r.st.khac / r.st.trung, kBi = r.st.biKhac / r.st.trung;
  if (!(kKhac >= 1.2 && kKhac <= 1.6)) fail(`khắc hệ ra ${kKhac.toFixed(3)}×, phải nằm trong 1,20–1,60× (trừ thẳng khuếch đại lên từ mốc thiết kế 1,20)`);
  if (!(kBi <= 0.88 && kBi >= 0.60)) fail(`bị khắc ra ${kBi.toFixed(3)}×, phải nằm trong 0,60–0,88×`);
  if (!(kKhac / kBi >= 1.36)) fail(`khoảng cách khắc/bị khắc co lại còn ${(kKhac/kBi).toFixed(2)}× — phải giữ ít nhất 1,36×`);
  if (!(r.st.lopKhac > r.st.khongVK * 0.99)) fail('cởi vũ khí ra thì hệ LỚP phải tiếp quản');
  // Tất cả 5 hệ vũ khí phải cho CÙNG một con số máu mất. Khác nhau dù một điểm nghĩa là hệ vũ
  // khí đã lọt vào chiều phòng thủ.
  {
    const m = r.mat || {};
    // (a) tất định
    const hv = Object.values(r.heThuTheoVK || {});
    if (hv.length !== 5 || new Set(hv).size !== 1)
      fail(`heThu() đổi theo vũ khí: ${JSON.stringify(r.heThuTheoVK)} — hệ phòng thủ phải trơ với vũ khí`);
    else console.log(`OK   heThu() trơ với cả 5 hệ vũ khí (luôn ${hv[0]})`);
    if (r.loi) fail('không dựng được cảnh đo chiều phòng thủ: ' + r.loi);
    else {
      const v = Object.values(m);
      if (!v.length || v.some(x => !x)) fail('đo máu mất ra 0 — cảnh dựng sai, không phải bài xanh');
      else {
        const lo = Math.min(...v), hi = Math.max(...v), lech = (hi/lo - 1) * 100;
        if (lech > 5)
          fail(`đổi vũ khí làm đổi máu mất ${lech.toFixed(1)}%: ${JSON.stringify(m)} — hệ vũ khí đã lọt vào chiều PHÒNG THỦ`);
        else console.log(`OK   đổi cả ${v.length} hệ vũ khí, tổng máu mất chỉ lệch ${lech.toFixed(1)}% (nhiễu ±15% mỗi đòn) — vũ khí không chạm chiều phòng thủ`);
      }
    }
  }
  if (r.doiHe.nhanGiap) fail('Đổi Hệ vẫn nhận GIÁP — ăn 1 Hỗn Độn Châu để roll thứ không dùng');
  if (!r.doiHe.nhanVuKhi) fail('Đổi Hệ không nhận vũ khí');

  console.log('errors:', JSON.stringify(errs));
  console.log(bad === 0 && errs.length === 0 ? 'PASS' : 'FAIL(' + bad + ')');
  await b.close();
  process.exit(bad === 0 && errs.length === 0 ? 0 : 1);
})();
