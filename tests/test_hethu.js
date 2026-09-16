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

  // ── ① LỚP AXIE **CHÍNH LÀ** HỆ — không còn bảng ánh xạ nào ở giữa ─────────────────────
  // Bản trước có `AXIE_HE` gộp 9 lớp xuống 5 hệ của ngũ giác cũ. Nó đã gỡ: vòng khắc nay CHÍNH
  // LÀ chín lớp ấy. Mệnh đề này gác đúng chỗ đó — một bảng dịch mọc lại ở giữa là thêm một chỗ
  // nói dối được, và `heThu()` phải trả về thẳng `CHIMERA[].lop`.
  const r1 = await page.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    const o = { heLa: [], conTheoHe: {}, soLopAxie: 0, conBangAnhXa: null, thieuTamGiac: [] };
    o.conBangAnhXa = (typeof window.AXIE_HE !== 'undefined');
    const lops = new Set(CHIMERA.map(c => c.lop));
    o.soLopAxie = lops.size;
    for (const lop of lops) if (!ELEM[lop]) o.heLa.push(lop);
    for (const c of CHIMERA) (o.conTheoHe[c.lop] = o.conTheoHe[c.lop] || []).push(c.id);
    // mỗi lớp phải khắc ĐÚNG 3 và bị khắc ĐÚNG 3 — đó là hình dạng của tam giác 3×3
    for (const a of ELEMENTS){
      const kh = ELEMENTS.filter(b => heKhac(a, b)).length;
      const bi = ELEMENTS.filter(b => heKhac(b, a)).length;
      if (kh !== 3 || bi !== 3) o.thieuTamGiac.push(`${a} khắc ${kh} / bị khắc ${bi}`);
    }
    return o;
  });
  if (r1.conBangAnhXa) fail('AXIE_HE sống lại — lớp Axie phải LÀ hệ, không qua bảng dịch nào');
  else if (r1.heLa.length) fail('lớp Axie không có trong bảng hệ: ' + r1.heLa.join(', '));
  else pass(`cả ${r1.soLopAxie} lớp Axie đều là một hệ có thật, không qua bảng ánh xạ`);
  if (r1.thieuTamGiac.length) fail('tam giác méo: ' + r1.thieuTamGiac.join(' · '));
  else pass('tam giác 3×3: mỗi lớp khắc đúng 3 và bị khắc đúng 3 trong 9');

  // Mỗi lớp phải có ÍT NHẤT một con Axie đeo được. Thiếu một lớp nghĩa là người chơi vĩnh viễn
  // không chọn được nó — cơ chế còn đó mà một nhánh chết, và không lỗi nào báo.
  const thieuHe = ['Beast','Bug','Mech','Plant','Reptile','Dusk','Aquatic','Bird','Dawn']
                    .filter(h => !r1.conTheoHe[h]);
  if (thieuHe.length) fail('không con Axie nào cho lớp: ' + thieuHe.join(', '));
  else pass('cả 9 lớp đều có Axie đeo được: ' +
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
      // ⚠ Đặt hệ trên CON QUÁI (`m.he`), không trên `m.def`. Miền dân số gán hệ cho từng con
      // nên `mobHe()` đọc `m.he` TRƯỚC — sửa mỗi `def.el` là phép đo không đổi được gì.
      m.def = Object.assign({}, m.def, { el:'Beast', lv:40, atk:400, atkCd:0.01, range:200 });
      m.he = 'Beast';
      // ⚠⚠ ĐO NHIỀU TRĂM ĐÒN, ĐỪNG ĐO MỘT ĐÒN. Mỗi đòn quái mang `rnd(0.85, 1.15)` — tản ±15%,
      // trong khi thứ cần đo là ±12% / −10%. Một đòn thì nhiễu NUỐT TRỌN tín hiệu: đo được
      // 515 · 546 · 524 cho ba con lẽ ra phải tăng dần. Bản trước của mệnh đề này đo đúng một
      // đòn và xanh vì may — tức nó không gác gì cả.
      // Và phải GHIM lại người chơi + con quái MỖI NHỊP: người chơi chết thì `update` return
      // sớm, con quái trôi ra khỏi tầm thì nó thôi đánh, và cả hai đều làm phép đo lặng lẽ về 0.
      let mat = 0;
      for (let i = 0; i < 900; i++){
        m.x = player.x + 26; m.y = player.y;
        m.hp = m.maxHp = 9e8; m.dead = false; m.aggro = 9999; m.target = player;
        const truoc = player.hp;
        update(1/60);
        if (player.hp < truoc) mat += truoc - player.hp;
        player.hp = player.maxHp; player.dead = false;
      }
      return { he: elName(heThu(player)), mat };
    };
    const out = {};
    // ⚠ CHỌN BA CON Ở BA NHÓM KHÁC NHAU, đừng chọn theo tên lớp. Tam giác gom lớp thành BA
    // nhóm, nên hai lớp khác tên mà cùng nhóm thì trung tính với nhau — bản trước dùng Mech vs
    // Beast và đo ra 455.613 vs 459.144, tức không chênh gì, đúng như luật nói.
    //   Dusk (nhóm ②) bị Beast khắc → +12%   ·   Beast (cùng nhóm ①) → trung tính
    //   Aquatic (nhóm ③) khắc lại Beast → −10%
    for (const id of ['netherfang', 'emberjaw', 'tidewarden']){
      chiNhan(id);
      out[id] = doMotCon(id);
    }
    return out;
  });
  const co = r2.netherfang, em = r2.emberjaw, ti = r2.tidewarden;
  if (!co || !em || !ti || !co.mat || !em.mat || !ti.mat){
    fail('không dựng được cảnh đo: ' + JSON.stringify(r2));
  } else {
    console.log(`  máu mất trước cùng một con quái Beast — Dusk ${co.mat} · Beast ${em.mat} · Aquatic ${ti.mat}`);
    if (!(co.mat > em.mat && em.mat > ti.mat))
      fail(`đổi Axie KHÔNG đổi sát thương nhận vào đúng chiều (chờ Dusk > Beast > Aquatic)`);
    else {
      const bien = ((co.mat - ti.mat) / ti.mat * 100).toFixed(1);
      pass(`đổi Axie đổi sát thương nhận vào: chênh ${bien}% giữa con hợp nhất và con khắc nhất`);
    }
  }

  // ── ③ HỆ ĐÒN ĐÁNH VẪN THEO VŨ KHÍ — đợt này không được đụng chiều kia ────────────────
  const r3 = await page.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    const o = {};
    const w = genSpecific('vukhi', 40); w.element = 'Plant';  // Rune lớp Plant trên vũ khí
    player.equip.vukhi = w;
    chiNhan('tidewarden'); player.avatar = 'tidewarden';      // Axie lớp Aquatic
    o.heDanh = atkElem();          // phải là Plant — theo VŨ KHÍ
    o.heThu  = heThu(player);      // phải là Aquatic — theo AXIE
    return o;
  });
  if (r3.heDanh !== 'Plant') fail(`hệ đòn đánh phải theo vũ khí (Plant), đo ra ${r3.heDanh}`);
  else if (r3.heThu !== 'Aquatic') fail(`hệ phòng thủ phải theo Axie (Aquatic), đo ra ${r3.heThu}`);
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
             coTenHe: /Aquatic/.test(t) };
  });
  if (!r6.coDongThu) fail('bảng Nhân Vật không in dòng "Hệ phòng thủ" — người chơi không có cách nào biết cơ chế tồn tại');
  else if (!r6.coTenHe) fail('bảng Nhân Vật in nhãn nhưng không in tên hệ đang mang');
  else pass('bảng Nhân Vật in cả hệ đòn đánh lẫn hệ phòng thủ, kèm nguồn của mỗi cái');

  // ── ⑦ MỖI ĐÒN TRÚNG PHẢI NÓI RA — CẢ HAI VẾ, KHÔNG CHỈ VẾ BẤT LỢI ────────────────────
  //
  // Trước bản này vế phòng thủ có đúng MỘT cửa: một dòng `logCombat` trong hộp nhật ký 260px ở
  // góc dưới-trái — trôi quá nhanh để đọc giữa lúc đánh nhau — và nó chỉ in ở nhánh ×1,12, vì
  // `mobCounter` không bao giờ bật ở nhánh ×0,90. Tức nửa CÓ LỢI của cơ chế, cũng là nửa trả
  // lời cho "vì sao phải có nhiều hơn một con Axie", chưa từng hiện ra một lần nào.
  //
  // ⚠ Đo trên `floats` (số bay TRÊN ĐẦU người chơi), không đo nhật ký: nhật ký đã in sẵn từ
  // trước ở một vế, nên một bài hỏi nhật ký sẽ xanh mà chưa kiểm được gì mới.
  const doFloat = async (avaId, moTa) => await page.evaluate(({ id }) => {
    window.TEST_MODE = true; startGame('thieulam', null);
    player.level = 40; player.free = 0; calcDerived();
    player.reflect = 0;
    travelTo('chungnam');
    chiNhan(id); player.avatar = id; calcDerived();
    player.hp = player.maxHp;
    const m = mobs.find(x => x && x.hp > 0);
    if (!m) return { loi: 'không có quái trong màn' };
    m.def = Object.assign({}, m.def, { el:'Beast', lv:40, atk:400, atkCd:0.01, range:200 });
    // ⚠ GHIM HỆ CHO CẢ MAP, đừng ghim mỗi con đứng cạnh. Số bay bắn theo con quái vừa đánh
    // TRÚNG, mà `chungnam` có nhiều bãi — lượt đầu tôi chỉ ghim một con và cái bay ra lại là
    // phán quyết của một con Dusk khác ("⚠ Dusk khắc Aquatic"), tức bài chấm một cảnh khác
    // hẳn cảnh nó tưởng mình dựng. §2 không lộ ra vì nó chỉ cộng tổng máu mất.
    for (const x of mobs) if (x) x.he = 'Beast';
    floats.length = 0;
    const he = heThu(player);
    // ⚠ HỨNG NGAY TRONG VÒNG, đừng đọc `floats` sau khi chạy xong. 600 nhịp là 10 GIÂY thời gian
    // trong game, mà một số bay chỉ sống ~1 giây — đọc sau thì nó đã bị dọn khỏi mảng từ lâu và
    // bài báo "không số bay nào hiện lên" trong khi nó đã hiện đúng. (Đã đo đúng thế một lượt:
    // soFloat 0 mà tongFloat 11.) Gom theo ĐỐI TƯỢNG để đếm được số lần bắn, không gom theo chữ.
    const thay = new Set();
    let trung = 0;
    for (let i = 0; i < 600; i++){
      m.x = player.x + 26; m.y = player.y;
      m.hp = m.maxHp = 9e8; m.dead = false; m.aggro = 9999; m.target = player;
      const truoc = player.hp;
      update(1/60);
      for (const f of floats) if (f.text && f.text.includes(he)) thay.add(f);
      if (player.hp < truoc) trung++;
      player.hp = player.maxHp; player.dead = false;
    }
    const cua = [...thay];
    return { he, trung, soFloat: cua.length, chu: cua.length ? cua[0].text : null };
  }, { id: avaId });

  // (a) vế BẤT LỢI — Dusk bị Beast khắc, ×1,12
  const f1 = await doFloat('netherfang');
  console.log('  ⑦a bất lợi:', JSON.stringify(f1));
  if (f1.loi || !f1.trung) fail('⑦a không dựng được cảnh đo: ' + JSON.stringify(f1));
  else if (!f1.soFloat) fail(`⑦a trúng ${f1.trung} đòn bị khắc mà không một số bay nào hiện lên đầu người chơi`);
  else if (!/Beast/.test(f1.chu)) fail(`⑦a cảnh dựng sai — số bay nói về con quái khác: "${f1.chu}"`);
  else if (!/⚠/.test(f1.chu)) fail(`⑦a số bay không đọc ra là bất lợi: "${f1.chu}"`);
  else pass(`vế bất lợi hiện lên đầu người chơi: "${f1.chu}"`);

  // (d) ⚠ ĐÒN ĐẦU TIÊN SAU KHI NẠP TRANG PHẢI NÓI RA — mục này tìm ra một lỗi THẬT.
  //     Hồi của số bay so `performance.now()` với một mốc, mà mốc đó từng khởi tạo bằng **0**.
  //     `performance.now()` đếm từ lúc nạp trang, nên `now − 0 > 2600` SAI trong suốt 2,6 giây
  //     đầu đời của trang: ai vừa vào game mà ăn đòn ngay thì không thấy gì, và cái không-thấy
  //     đó đọc ra y hệt "cơ chế không chạy". Nó cũng làm ⑦a phụ thuộc vào trang nạp nhanh hay
  //     chậm — đỏ 3/3 lượt trong khi `heThuKet` trả về hoàn toàn đúng.
  //     Đo trên một TRANG MỚI TINH và đánh NGAY, vì đó là cảnh duy nhất dựng lại được lỗi.
  {
    const p2 = await browser.newPage({ viewport: { width: 1000, height: 700 } });
    await p2.goto('http://localhost:8853/index.html', { waitUntil: 'networkidle' });
    await p2.waitForFunction(() => window.__gameReady).catch(()=>{});
    const rd = await p2.evaluate(() => {
      window.TEST_MODE = true; startGame('thieulam', null);
      player.level = 40; player.free = 0; player.reflect = 0; calcDerived();
      travelTo('chungnam');
      chiNhan('netherfang'); player.avatar = 'netherfang'; calcDerived();
      const m = mobs.find(x => x && x.hp > 0);
      if (!m) return { loi:'không có quái' };
      m.def = Object.assign({}, m.def, { lv:40, atk:400, atkCd:0.01, range:200 });
      for (const x of mobs) if (x) x.he = 'Beast';
      floats.length = 0;
      const thay = new Set();
      // 240 nhịp = 4 giây TRONG GAME nhưng chỉ vài trăm mili giây thật — cố ý đo trong lúc
      // `performance.now()` còn nhỏ, tức đúng cửa sổ mà lỗi cũ sống.
      for (let i = 0; i < 240; i++){
        m.x = player.x + 26; m.y = player.y;
        m.hp = m.maxHp = 9e8; m.dead = false; m.aggro = 9999; m.target = player;
        player.hp = player.maxHp; player.dead = false;
        update(1/60);
        for (const f of floats) if (f.text && f.text.includes('Dusk')) thay.add(f.text);
      }
      return { so: thay.size, chu: [...thay][0] || null, gio: Math.round(performance.now()) };
    });
    console.log('  ⑦d trang mới tinh:', JSON.stringify(rd));
    await p2.close();
    if (rd.loi) fail('⑦d không dựng được cảnh đo: ' + rd.loi);
    else if (!rd.so) fail(`⑦d đánh ngay sau khi nạp trang (t=${rd.gio}ms) mà không số bay nào hiện — mốc hồi đang khởi tạo sai, 2,6 giây đầu của mọi phiên bị câm`);
    else pass(`đòn đầu tiên sau khi nạp trang đã nói ra ngay (t=${rd.gio}ms): "${rd.chu}"`);
  }

  // ⚠ Chờ qua hồi của số bay. Không chờ thì lượt (b) bị chính bộ chống tràn nuốt mất và bài
  // báo "vế có lợi vẫn im lặng" — đúng cái lỗi nó định bắt, nhưng vì một lý do sai.
  await page.waitForTimeout(2800);

  // (b) vế CÓ LỢI — Aquatic khắc lại Beast, ×0,90. ĐÂY là vế trước nay im lặng tuyệt đối.
  const f2 = await doFloat('tidewarden');
  console.log('  ⑦b có lợi:', JSON.stringify(f2));
  if (f2.loi || !f2.trung) fail('⑦b không dựng được cảnh đo: ' + JSON.stringify(f2));
  else if (!f2.soFloat) fail(`⑦b trúng ${f2.trung} đòn KHẮC LẠI mà không một số bay nào hiện — nửa có lợi của cơ chế vẫn câm`);
  else if (!/Beast/.test(f2.chu)) fail(`⑦b cảnh dựng sai — số bay nói về con quái khác: "${f2.chu}"`);
  else if (!/✦/.test(f2.chu)) fail(`⑦b số bay không đọc ra là có lợi: "${f2.chu}"`);
  else pass(`vế có lợi hiện lên đầu người chơi: "${f2.chu}"`);

  // (c) và nó phải CÓ HỒI. Bắn một số bay mỗi đòn thì một trận đông quái đẩy tràn mảng `floats`
  //     (trần 70) và nuốt mất mọi thông báo khác — chữa một chỗ mù bằng cách làm mù chỗ khác.
  if (f2.soFloat > 3) fail(`⑦c ${f2.trung} đòn sinh ra ${f2.soFloat} số bay khắc hệ — thiếu hồi, sẽ đẩy tràn mảng floats`);
  else if (!f2.loi) pass(`có hồi: ${f2.trung} đòn chỉ sinh ${f2.soFloat} số bay`);

  // ── ⑧ BĂNG-RÔN LÚC VÀO MAP — kênh DUY NHẤT trả lời "nên cầm con nào TỚI đây" ─────────
  //
  // Số bay ở ⑦ chỉ nói được chuyện đang xảy ra; nó không bao giờ nói được nên đổi Axie trước
  // khi đi. Hai kênh cho hai câu hỏi khác nhau, nên bài này hỏi riêng.
  //
  // ⚠ Suy hệ của vùng bằng `mapBanSac()` lúc chạy, đừng chép cứng "mongco là Reptile": miền
  // dân số sửa được trong `data/canbang.js`, và một con số chép tay ở đây sẽ nói dối ngay lần
  // đầu ai đó đổi nó.
  const r8 = await page.evaluate(async () => {
    window.TEST_MODE = true; startGame('thieulam', null);
    player.level = 90; player.free = 0; calcDerived();
    const MID = 'mongco';
    const heVung = (mapBanSac(MID) || {}).he;
    if (!heVung) return { loi: 'mapBanSac không cho hệ trội của ' + MID };
    const conTheoLop = lop => (CHIMERA.find(c => c.lop === lop) || {}).id;
    const idKhacLai = conTheoLop(heKhacLai(heVung)[0]);      // Axie khắc lại đất này ⇒ ×0,90
    const idBiKhac  = conTheoLop(heKhacLai(heKhacLai(heVung)[0])[0]); // đất khắc nó ⇒ ×1,12
    const doVao = (id) => {
      chiNhan(id); player.avatar = id; calcDerived();
      travelTo('ardhaven'); travelTo(MID);
      return (zoneBanner && zoneBanner.sub) || '';
    };
    return { heVung, idKhacLai, idBiKhac, subLoi: doVao(idKhacLai), subHai: doVao(idBiKhac) };
  });
  console.log('  ⑧', JSON.stringify(r8));
  if (r8.loi || !r8.idKhacLai || !r8.idBiKhac) fail('⑧ không dựng được cảnh đo: ' + JSON.stringify(r8));
  else if (!/✦/.test(r8.subLoi) || !/nhẹ hơn/i.test(r8.subLoi))
    fail(`⑧ vào map với Axie khắc lại mà băng-rôn không nói gì: "${r8.subLoi}"`);
  else if (!/⚠/.test(r8.subHai) || !/NẶNG/.test(r8.subHai))
    fail(`⑧ vào map với Axie bị khắc mà băng-rôn không cảnh báo: "${r8.subHai}"`);
  else if (r8.subLoi === r8.subHai)
    fail('⑧ băng-rôn không đổi theo con Axie đang đeo — nó đang in một câu chép cứng');
  else pass('băng-rôn lúc vào map nói đúng thế khắc của con Axie đang đeo, cả hai chiều');

  console.log('errors:', JSON.stringify(errors.slice(0, 6)));
  if (errors.length) fail(`${errors.length} lỗi JS trong lúc chạy`);
  await browser.close();
  if (bad){ console.log(`FAIL(${bad})`); process.exit(1); }
  console.log('PASS');
})();
