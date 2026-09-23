// HƯỚNG DẪN TÂN THỦ — sáu bước có DẠY ĐÚNG thứ người chơi làm được ở chỗ họ đang đứng không.
//
// Đo trước khi sửa, và cả hai con số dưới đây là lý do bài này tồn tại:
//
//  ① Đứng YÊN trong thành từ giây 0, `tutTick` tự đẩy hộp qua đủ sáu bước rồi tuyên bố
//    **"Hướng dẫn hoàn tất"** ở giây 385 cho một người chưa đi một bước, chưa nói một câu,
//    chưa hạ một con. Nặng nhất là mốc 270: hộp nói *"Nhấn SPACE — hạ 1 con Axie Heo Rừng"*
//    trong khi Ardhaven có **0 bãi quái**. Bấm SPACE 90 lần rồi bật AUTO 3 phút ⇒ kills 0.
//  ② Bước `loot` có điều kiện `player.inv.length > 0`, mà nhân vật vừa tạo ĐÃ CÓ đồ khởi
//    đầu — nên nó và bước kế cùng nhảy trong MỘT nhịp (đo được: cả hai ở giây 360,1). Cả
//    bước dạy nhặt đồ chưa từng hiện ra một lần nào.
//
// ⚠ BÀI NÀY LÁI BẰNG HÀM THẬT (`tryTalk` · `travelTo` · `hurtMob` · `tryPickLoot` ·
// `togglePanel`), không gọi `tutAdvance` trực tiếp. Chỗ hỏng nằm ở SỢI DÂY nối từ hành động
// tới bước, không nằm ở mảng — hỏi mảng thì mọi cách cài đều xanh.
//
// Chạy độc lập:  node tests/test_tanthu.js [cổng]
const { chromium } = require('playwright');
const CONG = process.argv[2] || '8853';
let bad = 0;
const fail = m => { console.log('FAIL ' + m); bad++; };
const pass = m => console.log('PASS ' + m);

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e).slice(0, 160)));
  await page.goto(`http://localhost:${CONG}/index.html?test=1`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__gameReady).catch(() => {});

  // ── ① MỌI BƯỚC PHẢI CÓ `xong` ĐỌC ĐƯỢC TỪ TRẠNG THÁI, và mọi khoá phải có chỗ gọi ──
  const hinh = await page.evaluate(() => {
    window.TEST_MODE = true; localStorage.clear();
    startGame('thieulam', null);
    return {
      keys: TUT_STEPS.map(s => s.key),
      thieuXong: TUT_STEPS.filter(s => typeof s.xong !== 'function').map(s => s.key),
      coCo: Object.keys(TUT_CO),
      packsArdhaven: packsOf('ardhaven').length,
    };
  });
  if (hinh.thieuXong.length) fail(`① bước không có xong(): ${hinh.thieuXong.join(', ')}`);
  else pass(`① cả ${hinh.keys.length} bước đều có xong() đọc từ trạng thái`);
  // cờ trạng thái phải khớp khoá bước — khai một cờ cho khoá không tồn tại là cờ chết
  const lac = hinh.coCo.filter(k => !hinh.keys.includes(k));
  if (lac.length) fail(`① TUT_CO khai cờ cho khoá không có bước: ${lac.join(', ')}`);
  else pass('① TUT_CO khớp khoá bước');

  // ── ② ĐỨNG YÊN TRONG THÀNH: KHÔNG được trôi tới bước `kill`, và KHÔNG được "hoàn tất" ──
  // Đây là mệnh đề nặng nhất. Ardhaven có 0 bãi quái nên bước `kill` là BẤT KHẢ ở đó.
  if (hinh.packsArdhaven !== 0) fail(`② cảnh dựng: Ardhaven đáng lẽ 0 bãi quái, đo ${hinh.packsArdhaven}`);
  const troi = await page.evaluate(() => {
    player.tutStep = 0; player.tutDist = 0; player._tutT = 0; player._tutLX = null;
    player.tutNoi = 0; player.tutNhat = 0; player.tutBang = 0;
    const qua = [];
    let last = 0, hoanTat = false;
    const _af = window.addFloat;
    window.addFloat = (x, y, t, ...r) => { if (String(t).includes('hoàn tất')) hoanTat = true; return _af(x, y, t, ...r); };
    for (let i = 0; i < 600 * 60; i++){
      tutTick(1 / 60);
      if (player.tutStep !== last){ qua.push(player.tutStep < 0 ? 'TAT' : TUT_STEPS[player.tutStep].key); last = player.tutStep; }
      if (player.tutStep < 0) break;
    }
    window.addFloat = _af;
    return { qua, map: curMap, kills: player.kills || 0, hoanTat };
  });
  if (troi.map !== 'ardhaven') fail(`② cảnh dựng: phải còn đứng trong thành, đang ở ${troi.map}`);
  if (troi.qua.includes('kill')) fail(`② đứng yên trong thành mà hộp vẫn trôi tới bước "kill" (Ardhaven 0 bãi quái) — chuỗi: ${troi.qua.join(' → ')}`);
  else pass(`② hết giờ thì BỎ QUA bước bất khả, không đẩy vào "kill" — chuỗi: ${troi.qua.join(' → ')}`);
  if (troi.hoanTat) fail('② tuyên bố "Hướng dẫn hoàn tất" cho người chơi chưa làm gì');
  else pass('② không tuyên bố hoàn tất khi người chơi không làm theo');
  if (troi.qua[troi.qua.length - 1] !== 'TAT') fail(`② hướng dẫn không bao giờ tắt — treo ở ${troi.qua[troi.qua.length - 1]}`);
  else pass('② hướng dẫn vẫn tự tắt, không treo vĩnh viễn');

  // ── ③ ĐƯỜNG THUẬN: sáu bước phải đi hết bằng HÀNH ĐỘNG THẬT ──
  const di = await page.evaluate(() => {
    const R = { buoc: [] };
    localStorage.clear(); startGame('thieulam', null);
    player.tutStep = 0; player.tutDist = 0; player._tutT = 0; player._tutLX = null;
    player.tutNoi = 0; player.tutNhat = 0; player.tutBang = 0;
    const ten = () => (player.tutStep < 0 ? 'TAT' : TUT_STEPS[player.tutStep].key);
    for (let i = 0; i < 5; i++){ update(1 / 60); render(); }
    const bn = document.querySelector('#quest-compass-banner');
    R.bannerLucVao = !!(bn && !bn.classList.contains('hidden'));
    R.buoc.push(ten());
    player.x += 200; tutTick(1 / 60); tutTick(1 / 60);          // ① đi bộ
    R.buoc.push(ten());
    const n = NPCS.filter(x => x.map === curMap)
      .sort((a, c) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(c.x - player.x, c.y - player.y))[0];
    player.x = n.x + 40; player.y = n.y; tryTalk(); closePanels();  // ② nói chuyện
    R.buoc.push(ten()); R.tutNoi = player.tutNoi || 0;
    travelTo('corran');                                          // ③ đổi map
    R.buoc.push(ten()); R.khaKill = packsOf(curMap).length > 0;
    const m = mobs.find(x => x.hp > 0); R.coQuai = !!m;
    if (m){ m.hp = 1; hurtMob(m, 9999, 'hit'); }                 // ④ hạ quái
    R.buoc.push(ten()); R.kills = player.kills || 0;
    R.invCoDo = player.inv.length > 0;
    for (let i = 0; i < 120; i++) tutTick(1 / 60);               // 2 giây: chưa nhặt thì phải đứng yên
    R.loot2s = ten();
    dropToGround({ k: 'jewel', jt: 'bless', n: 1 }, player.x + 10, player.y + 10);
    tryPickLoot(player.x + 10, player.y + 10);                   // ⑤ nhặt
    R.buoc.push(ten()); R.tutNhat = player.tutNhat || 0;
    togglePanel('char'); closePanels();                          // ⑥ mở bảng
    R.buoc.push(ten()); R.tutBang = player.tutBang || 0;
    // ⑦ bước `than` — ĂN ĐÒN THẬT trên đất có hệ. Lái bằng `update()` chứ không gán thẳng
    // `_tutHe`: chỗ dễ hỏng không phải phép so sánh trong `xong`, mà là SỢI DÂY từ `hurtPlayer`
    // tới cái cờ — gán thẳng thì gỡ hẳn dòng đếm trong `hurtPlayer` bài này vẫn xanh.
    R.datCoHe = !!((mapBanSac(curMap) || {}).he);
    R.heTruoc = player._tutHe || 0;
    // ⚠⚠ DỌN HAI CỬA XÚC XẮC ĐỨNG TRƯỚC `_tutHe`, nếu không mục này là một cú tung đồng xu.
    // `hurtPlayer` có `if (m.blindT > 0 && Math.random() < 0.5)` rồi `else if (Math.random() <
    // player.eva)` — cả hai BỎ QUA nguyên khối sát thương, tức bỏ qua luôn dòng đếm `_tutHe`.
    // Cộng thêm chuyện người chơi ĐÁNH TRẢ trong `update()` nên con quái vừa ghim có thể chết,
    // và `mobs.find` lượt sau bốc một con khác đang ở xa. Ba nguồn ngẫu nhiên xếp trước một
    // khẳng định TẤT ĐỊNH ⇒ đo được đỏ ~1/6 lượt khi máy bận, và **đỏ y hệt trên cây TRƯỚC đợt
    // này** (đã dựng worktree ở commit cũ để đối chiếu) — tức lỗi CÓ SẴN, không phải hồi quy.
    //
    // ⚠ Dọn như thế KHÔNG làm mệnh đề yếu đi. Thứ mục này gác là SỢI DÂY `hurtPlayer` →
    // `heThuKet` → `_tutHe`; đòn vẫn phải đi trọn đường ấy. Cái bị gỡ là né tránh và cái chết
    // của con quái — hai thứ chẳng liên quan gì tới sợi dây đó.
    const _evaCu = player.eva;
    player.eva = 0;
    for (let i = 0; i < 600 && (player._tutHe || 0) < 3; i++){
      const q = mobs.find(x => x.hp > 0);
      if (q){ q.x = player.x + 8; q.y = player.y; q.atkCd = 0; q.blindT = 0; q.hp = q.maxHp; }
      player.hp = player.maxHp;            // đòn quái phải ĐẾM, nhưng không được giết người đo
      update(1 / 60);
    }
    player.eva = _evaCu;
    R.heSau = player._tutHe || 0;
    for (let i = 0; i < 4; i++) tutTick(1 / 60);
    R.buoc.push(ten());
    return R;
  });
  const mong = ['move', 'npc', 'map', 'kill', 'loot', 'panel', 'than', 'TAT'];
  // ⚠ TỰ KIỂM CẢNH DỰNG TRƯỚC KHI CHẤM, và IN RA CON SỐ. Không có dòng này thì lượt đỏ chỉ nói
  // "đường thuận lệch … → than → than" và người đọc phải ĐOÁN xem bước cuối hỏng vì cơ chế hay
  // vì con quái không kịp đánh đủ ba đòn — tôi đã phải đoán đúng một lần, và mất một vòng dựng
  // worktree mới loại được. Một con số trong thông báo rẻ hơn hẳn một vòng chẩn đoán.
  if (!di.datCoHe) fail('③ cảnh dựng: map đo không có hệ trội — bước `than` bất khả ở đây');
  else if (di.heSau < 3)
    fail(`③ cảnh dựng: quái không đánh đủ 3 đòn có hệ trong 600 nhịp (_tutHe ${di.heTruoc} → ${di.heSau})`);
  if (di.buoc.join('>') !== mong.join('>')) fail(`③ đường thuận lệch: ${di.buoc.join(' → ')} · mong ${mong.join(' → ')} · _tutHe ${di.heSau}`);
  else pass(`③ sáu bước đi hết bằng hành động thật: ${di.buoc.join(' → ')}`);
  if (!di.coQuai || !di.kills) fail(`③ cảnh dựng: không hạ được con nào (quái ${di.coQuai} · kills ${di.kills})`);

  // ── ④ BƯỚC `loot` KHÔNG ĐƯỢC TỰ QUA VÌ TÚI SẴN CÓ ĐỒ KHỞI ĐẦU ──
  if (!di.invCoDo) fail('④ cảnh dựng: nhân vật mới đáng lẽ có đồ khởi đầu trong túi, đo ra túi rỗng');
  else if (di.loot2s !== 'loot') fail(`④ bước "loot" tự qua dù chưa nhặt gì (túi có sẵn đồ khởi đầu) — sau 2 giây đã ở ${di.loot2s}`);
  else pass('④ bước "loot" đứng nguyên tới khi NHẶT thật, không ăn theo đồ khởi đầu');
  if (di.tutNhat !== 1) fail(`④ tryPickLoot không ghi cờ tutNhat (đo ${di.tutNhat})`);

  // ── ⑤ SỢI DÂY: ba cờ trạng thái phải được HÀNH ĐỘNG ghi, không phải bước ghi hộ ──
  // (nếu chỉ `tutAdvance` ghi thì ai làm sớm hơn hộp sẽ kẹt đủ 90 giây ở việc đã xong)
  if (di.tutNoi !== 1) fail(`⑤ tryTalk không ghi cờ tutNoi (đo ${di.tutNoi})`);
  else pass('⑤ tryTalk ghi tutNoi');
  if (di.tutBang !== 1) fail(`⑤ togglePanel('char') không ghi cờ tutBang (đo ${di.tutBang})`);
  else pass("⑤ togglePanel('char') ghi tutBang — khoá bước 'panel', hai lời gọi cũ nay khớp");
  // ⑤b SỢI DÂY của bước `than`: `hurtPlayer` phải là chỗ đếm, không phải `tutTick` tự cộng.
  if (!di.datCoHe) fail('⑤b cảnh dựng: map đo đáng lẽ có hệ trội (bước "than" mới có nghĩa ở đó)');
  else if (di.heSau <= di.heTruoc) fail(`⑤b ăn đòn thật mà _tutHe không nhúc nhích (${di.heTruoc} → ${di.heSau}) — dây từ hurtPlayer tới cờ đứt`);
  else pass(`⑤b hurtPlayer đếm trục phòng thủ Axie: _tutHe ${di.heTruoc} → ${di.heSau}`);

  const som = await page.evaluate(() => {
    localStorage.clear(); startGame('thieulam', null);
    player.tutStep = 0; player.tutDist = 0; player._tutT = 0; player._tutLX = null;
    player.tutNoi = 0; player.tutNhat = 0; player.tutBang = 0;
    const n = NPCS.filter(x => x.map === curMap)[0];
    player.x = n.x + 40; player.y = n.y; tryTalk(); closePanels();  // nói TRƯỚC khi hộp tới bước npc
    // ⚠ TỰ KIỂM CẢNH DỰNG. `tutTick` cộng quãng đường theo HIỆU hai khung, và khung đầu chỉ
    // ghi mốc chứ không cộng — nên `player.x += 200` rồi tick một lượt là cộng ĐÚNG 0. Bản đầu
    // của mục này dính y thế: nó kẹt ở "move" suốt, và mệnh đề "không kẹt ở npc" xanh vì một
    // lý do chẳng liên quan gì tới cờ trạng thái.
    tutTick(1 / 60);                                               // ghi mốc _tutLX
    for (let i = 0; i < 4; i++){ player.x += 60; tutTick(1 / 60); } // 240px > 150 ⇒ qua bước move
    const roiMove = player.tutStep !== 0;
    for (let i = 0; i < 180; i++) tutTick(1 / 60);                 // 3 giây, KHÔNG đủ trần 90s
    return { roiMove, key: player.tutStep < 0 ? 'TAT' : TUT_STEPS[player.tutStep].key };
  });
  if (!som.roiMove) fail('⑤ cảnh dựng: người chơi chưa qua nổi bước "move", mệnh đề dưới không đo được gì');
  else if (som.key === 'npc') fail('⑤ nói chuyện TRƯỚC khi hộp tới bước đó thì vẫn kẹt ở "npc" — cờ đang đếm sự kiện chứ không đếm trạng thái');
  else pass(`⑤ làm sớm vẫn tính: hộp qua thẳng "npc" → ${som.key}`);

  // ── ⑥ VĂN BẢN KHÔNG ĐƯỢC HỨA SAI ──
  const chu = await page.evaluate(() => {
    localStorage.clear(); startGame('thieulam', null);
    const q0 = QUESTS[0];
    const rell = NPCS.find(n => n.id === 'quachtinh');
    return {
      txt: TUT_STEPS.map(s => s.txt).join(' || '),
      q0active: questState,
      q0npc: q0.npc, q0name: q0.name,
      markRell: npcMark(rell),
    };
  });
  // Nhiệm vụ đầu đã active từ giây 0 và người giao KHÔNG phải Rell — nên đừng bảo tân thủ
  // đi gặp Rell "nhận nhiệm vụ đầu tiên".
  if (chu.q0active !== 'active') fail(`⑥ cảnh dựng: nhiệm vụ đầu đáng lẽ active từ giây 0, đo "${chu.q0active}"`);
  if (chu.markRell !== '') fail(`⑥ cảnh dựng: Rell đáng lẽ không có dấu nhiệm vụ lúc vào game, đo "${chu.markRell}"`);
  if (/Trưởng Lão Rell/.test(chu.txt)) fail('⑥ hướng dẫn còn bảo tân thủ đi gặp Trưởng Lão Rell — ông ta không giao nhiệm vụ nào trước cấp 14');
  else pass('⑥ không còn trỏ tân thủ tới NPC không có việc cho họ');
  if (/nhận nhiệm vụ đầu tiên/.test(chu.txt)) fail(`⑥ hướng dẫn còn hứa "nhận nhiệm vụ đầu tiên" trong khi "${chu.q0name}" đã active từ giây 0`);
  else pass('⑥ không còn hứa đi nhận một nhiệm vụ đã nằm sẵn trong tay');
  if (!di.bannerLucVao) fail('⑥ bước "map" bảo bấm "Đi ngay" nhưng dải nhiệm vụ không hiện lúc vào game');
  else pass('⑥ dải "Đi ngay" thật sự có mặt lúc vào game');
  // ⑥b HƯỚNG DẪN PHẢI DẠY TRỤC AXIE. Cơ chế này gánh 35% barem Axie Core, chạy đúng và có bài
  // gác từ lâu (`test_hethu` · `test_bophan`) — nhưng đếm lại các cửa NÓI RA nó thì sáu bước
  // hướng dẫn cũ không bước nào nhắc, và nhiệm vụ dạy nó mở ở cấp 19. Mệnh đề này giữ cái cửa
  // phút-đầu ấy khỏi bị dọn đi trong im lặng.
  if (!/Axie/.test(chu.txt)) fail('⑥b hướng dẫn tân thủ không nhắc con Axie một lần nào — trục gánh 35% barem không có cửa dạy nào trong phút đầu');
  else if (!/hệ/.test(chu.txt)) fail('⑥b hướng dẫn có nhắc Axie nhưng không nói tới HỆ — vế phòng thủ vẫn vô hình');
  else pass('⑥b hướng dẫn tân thủ có dạy trục phòng thủ Axie');

  if (errors.length) fail('LỖI JS: ' + errors.slice(0, 3).join(' | '));
  else pass('không lỗi JS');

  console.log(bad ? `\n${bad} FAIL` : '\nTẤT CẢ PASS');
  await browser.close();
  process.exit(bad ? 1 : 0);
})();
