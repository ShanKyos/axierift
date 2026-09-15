// HỆ PHÒNG THỦ ĐẾN TỪ CON AXIE — và nó KHÔNG được biến thành một trục sức mạnh.
//
// Bài này gác đợt việc trả lời tiêu chí "Axie Core" của Vibeathon: trước nó, đo được cả 16 con
// Axie đổi ĐÚNG 0 điểm chỉ số và tắt hẳn avatar cũng đổi 0 — tức con Axie đúng nghĩa đen là
// một cái skin. Nay lớp Axie quyết định hệ PHÒNG THỦ.
//
// ⚠ Hai chiều, hai nguồn, và đó là cả thiết kế:
//     người → quái : VŨ KHÍ (atkElem)      quái → người : AXIE (heThu)
// Luật bất đối xứng "đổi vũ khí không bao giờ làm ngươi ăn đòn nặng hơn" có từ trước và đợt này
// không được đụng — §3 gác đúng chỗ đó.
//
// ⚠ Và §4 gác chiều NGƯỢC LẠI, cái quan trọng nhất: đổi Axie phải đổi 0 điểm chỉ số. Trục sức
// mạnh từ phía Axie đã bị tháo BA LẦN (bị động `thu` · cấp Chimera · bốn ô Cốt) và lần nào nó
// cũng quay lại dưới dạng "chỉ vài dòng chỉ số nhỏ thôi". Hệ khắc là một QUAN HỆ, không phải
// một nấc thang — nếu ai đó "cải tiến" nó thành +% kháng thì bài này phải đỏ.
const { chromium } = require('playwright');
let bad = 0;
const fail = m => { console.log('FAIL ' + m); bad++; };
const pass = m => console.log('PASS ' + m);

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('http://localhost:8853/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__gameReady).catch(()=>{});
  await page.waitForTimeout(300);

  // ── ① Mọi lớp Axie đều tra ra một hệ CÓ THẬT, và cả 5 hệ đều với tới được ─────────────
  const r1 = await page.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    const o = { lopThieu: [], heLa: [], conTheoHe: {}, soLopAxie: 0 };
    const lops = new Set(CHIMERA.map(c => c.lop));
    o.soLopAxie = lops.size;
    for (const lop of lops){
      const he = AXIE_HE[lop];
      if (!he) o.lopThieu.push(lop);
      else if (!ELEM[he]) o.heLa.push(lop + '→' + he);
    }
    for (const c of CHIMERA){
      const t = elName(AXIE_HE[c.lop]);
      (o.conTheoHe[t] = o.conTheoHe[t] || []).push(c.id);
    }
    return o;
  });
  if (r1.lopThieu.length) fail('lớp Axie không có hệ: ' + r1.lopThieu.join(', '));
  else if (r1.heLa.length) fail('ánh xạ ra hệ không tồn tại: ' + r1.heLa.join(', '));
  else pass(`cả ${r1.soLopAxie} lớp Axie đều tra ra một hệ có thật`);

  // Mỗi hệ phải có ÍT NHẤT một con đeo được. Thiếu một hệ nghĩa là người chơi vĩnh viễn không
  // chọn được nó — cơ chế còn đó mà một nhánh chết, và không lỗi nào báo.
  const thieuHe = ['Steel','Verdant','Stone','Frost','Ember'].filter(h => !r1.conTheoHe[h]);
  if (thieuHe.length) fail('không con Axie nào cho hệ: ' + thieuHe.join(', '));
  else pass('cả 5 hệ đều có Axie đeo được: ' +
    Object.entries(r1.conTheoHe).map(([h, v]) => `${h} ${v.length}`).join(' · '));

  // ── ② ĐỔI AXIE PHẢI ĐỔI SÁT THƯƠNG NHẬN VÀO — đo bằng máu thật, không đọc bảng ────────
  //
  // ⚠ Phải lái qua chính vòng `update()`: chỗ hỏng không nằm ở bảng ánh xạ mà ở sợi dây từ
  // bảng tới công thức. Đọc `heThu()` rồi tự nhân tay là dựng bản sao thứ hai của một luật
  // đang sống — sửa một bên là hai bên lệch mà bài vẫn xanh.
  const r2 = await page.evaluate(async () => {
    window.TEST_MODE = true; startGame('thieulam', null);
    player.level = 40; player.free = 0; calcDerived();
    player.reflect = 0;                     // phản đòn ghi thẳng m.hp — xem CLAUDE.md
    // ⚠ `startGame` thả người chơi vào ardhaven — THÀNH AN TOÀN, `mobs` rỗng. Không đi ra map
    // đánh nhau thì `mobs.find` trả undefined và cả mệnh đề chết ở khâu dựng cảnh.
    travelTo('chungnam');
    const doMotCon = (avaId) => {
      player.avatar = avaId;
      calcDerived();
      player.hp = player.maxHp;
      // Lấy một con quái CÓ SẴN trong màn rồi kéo tới sát bên — đừng tự sinh: `spawnMob` nhận
      // (type, zone, pack, …) chứ không nhận toạ độ, và một con dựng ngoài quy trình thì thiếu
      // đúng mấy trường mà `update` đọc.
      const m = mobs.find(x => x && x.hp > 0);
      if (!m) return null;
      m.def = Object.assign({}, m.def, { el:'Hỏa', lv:40, atk:400, atkCd:0.01, range:200 });
      m.x = player.x + 26; m.y = player.y;
      m.hp = m.maxHp = 999999; m.atkT = 0; m.aggro = 9999; m.target = player;
      const truoc = player.hp;
      for (let i = 0; i < 40 && player.hp === truoc; i++) update(1/60);
      return { he: elName(heThu(player)), mat: truoc - player.hp };
    };
    const out = {};
    for (const id of ['coghound', 'emberjaw', 'tidewarden']){
      chiNhan(id);
      out[id] = doMotCon(id);
    }
    return out;
  });
  const co = r2.coghound, em = r2.emberjaw, ti = r2.tidewarden;
  if (!co || !em || !ti || !co.mat || !em.mat || !ti.mat){
    fail('không dựng được cảnh đo: ' + JSON.stringify(r2));
  } else {
    // Steel bị Ember khắc (+12%) · Ember trung tính · Frost khắc lại Ember (−10%)
    console.log(`  máu mất trước cùng một con quái Ember — Steel ${co.mat} · Ember ${em.mat} · Frost ${ti.mat}`);
    if (!(co.mat > em.mat && em.mat > ti.mat))
      fail(`đổi Axie KHÔNG đổi sát thương nhận vào đúng chiều (chờ Steel > Ember > Frost)`);
    else {
      const bien = ((co.mat - ti.mat) / ti.mat * 100).toFixed(1);
      pass(`đổi Axie đổi sát thương nhận vào: chênh ${bien}% giữa con hợp nhất và con khắc nhất`);
    }
  }

  // ── ③ HỆ ĐÒN ĐÁNH VẪN THEO VŨ KHÍ — đợt này không được đụng chiều kia ────────────────
  const r3 = await page.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    const o = {};
    const w = genSpecific('vukhi', 40); w.element = 'Mộc';   // Verdant
    player.equip.vukhi = w;
    chiNhan('tidewarden'); player.avatar = 'tidewarden';     // Axie hệ Frost
    o.heDanh = atkElem();          // phải là Mộc — theo VŨ KHÍ
    o.heThu  = heThu(player);      // phải là Thủy — theo AXIE
    return o;
  });
  if (r3.heDanh !== 'Mộc') fail(`hệ đòn đánh phải theo vũ khí (Mộc), đo ra ${r3.heDanh}`);
  else if (r3.heThu !== 'Thủy') fail(`hệ phòng thủ phải theo Axie (Thủy), đo ra ${r3.heThu}`);
  else pass('hai chiều hai nguồn: đòn đánh theo VŨ KHÍ · phòng thủ theo AXIE');

  // ── ④ ĐỔI AXIE PHẢI ĐỔI **0 ĐIỂM** CHỈ SỐ — luật Đổi Vai còn nguyên ──────────────────
  const r4 = await page.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    player.level = 60; if (window.vhAutoLearn) vhAutoLearn();
    const chup = () => { calcDerived(); return JSON.stringify({
      atk:player.atk, maxHp:player.maxHp, def:player.def, maxQi:player.maxQi,
      crit:player.crit, speed:player.speed, eva:player.eva, dmgMul:player.dmgMul }); };
    for (const c of CHIMERA) chiNhan(c.id);
    player.avatar = CHIMERA[0].id; const moc = chup();
    const doi = [];
    for (const c of CHIMERA){ player.avatar = c.id; if (chup() !== moc) doi.push(c.id); }
    return { doi, soCon: CHIMERA.length };
  });
  if (r4.doi.length) fail(`đổi Axie làm đổi CHỈ SỐ ở ${r4.doi.length} con (${r4.doi.slice(0,4).join(', ')}) — luật "Axie 0 chỉ số" đã vỡ`);
  else pass(`cả ${r4.soCon} con: đổi Axie đổi đúng 0 điểm chỉ số (hệ là QUAN HỆ, không phải nấc thang)`);

  // ── ⑤ KHÔNG AVATAR THÌ PHẢI LUI VỀ HỆ CỦA LỚP, không được trả rỗng ──────────────────
  //
  // Nhánh khắc hệ đọc `if (mobEl && sectEl2)`, nên trả null là TẮT CÂM cả cơ chế mà không một
  // lỗi nào in ra. Đây là kiểu hỏng im lặng, phải có người gác.
  const r5 = await page.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    player.avatar = null;                       // đã tắt bằng /avatar off
    const tat = heThu(player);
    return { tat, heLop: SECTS.thieulam.element, hopLe: !!(tat && ELEM[tat]) };
  });
  if (!r5.hopLe) fail(`tắt avatar thì heThu() trả ${JSON.stringify(r5.tat)} — cơ chế khắc hệ tắt câm`);
  else if (r5.tat !== r5.heLop) fail(`tắt avatar phải lui về hệ của lớp (${r5.heLop}), đo ra ${r5.tat}`);
  else pass('tắt avatar thì lui về hệ của lớp, không bao giờ trả rỗng');

  // ── ⑥ BẢNG PHẢI NÓI RA — cơ chế vô hình là cơ chế không tồn tại ─────────────────────
  const r6 = await page.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    chiNhan('tidewarden'); player.avatar = 'tidewarden';
    renderChar();
    // ⚠ Hỏi ĐÚNG cái hộp `renderChar` ghi vào (`CE()`), đừng đoán id bảng. Đoán sai thì mệnh đề
    // này đỏ vì một lý do chẳng liên quan gì tới thứ nó định gác — đã dẫm đúng thế một lượt.
    const t = (typeof CE === 'function' && CE() ? CE().innerText : '') || document.body.innerText || '';
    return { coDongThu: /Hệ phòng thủ/i.test(t), coDongDanh: /Hệ đòn đánh/i.test(t),
             coTenHe: /Frost/.test(t) };
  });
  if (!r6.coDongThu) fail('bảng Nhân Vật không in dòng "Hệ phòng thủ" — người chơi không có cách nào biết cơ chế tồn tại');
  else if (!r6.coTenHe) fail('bảng Nhân Vật in nhãn nhưng không in tên hệ đang mang');
  else pass('bảng Nhân Vật in cả hệ đòn đánh lẫn hệ phòng thủ, kèm nguồn của mỗi cái');

  console.log('errors:', JSON.stringify(errors.slice(0, 6)));
  if (errors.length) fail(`${errors.length} lỗi JS trong lúc chạy`);
  await browser.close();
  if (bad){ console.log(`FAIL(${bad})`); process.exit(1); }
  console.log('PASS');
})();
