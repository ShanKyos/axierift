// Cốt truyện: (1) không còn tên riêng của MU Online trong text người chơi thấy,
// (2) chuỗi chính tuyến vẫn đủ trường máy móc, id lành lặn, và chạy hết được,
// (3) manh mối + lời boss + kết mở render không lỗi.
//
// ⚠⚠ BÀI NÀY TỪNG IN "FAIL" MÀ MÃ THOÁT VẪN 0 — tức `tools/reg.sh` (chấm bằng mã thoát) đếm
// nó là XANH trong khi nó đang tự nhận là hỏng. Ba khẳng định đỏ suốt một thời gian dài mà
// không ai thấy. Đừng bao giờ bỏ `process.exit` ở cuối một bài in ra phán quyết:
// *một bài kiểm xanh vì lý do sai thì tệ hơn không có bài kiểm.*
const { chromium } = require('playwright');

// "Kundun" ĐÃ RA KHỎI danh sách cấm: chủ dự án chốt dùng "Box Kundun" cho hệ hộp mở đồ vì
// người chơi MU quen tên đó (xem mục NGOẠI LỆ trong CLAUDE.md). Rủi ro đã nêu, chủ dự án
// vẫn quyết. Mười tên còn lại vẫn cấm tuyệt đối — đừng gỡ thêm cái nào.
const BANNED = ['Lorencia','Noria','Devias','Icarus','Atlans','Tarkan',
                'Fairy Elf','Magic Gladiator','Devil Square','Blood Castle',
                'Hắc Phong','Vệ Thần','Trấn Ải','Ngũ Ấn','Bá Chủ','Vực Nguyên Thủy'];

// ⚠ SÀN, KHÔNG PHẢI CON SỐ CHÍNH XÁC — và đó là chủ ý, có lý do.
// Bản cũ chốt `questCount === 35`. Chuỗi nay có 51 mục (9 chương, xem CLAUDE.md), nên con số
// ấy đỏ vĩnh viễn kể từ đợt dựng lại chính tuyến. Nhưng thay 35 bằng 51 chỉ là lên dây lại
// đúng quả mìn đó: mỗi lần thêm một nhiệm vụ là bài đỏ vì một lý do chẳng liên quan gì tới
// thứ nó định gác.
// Thứ nó ĐỊNH gác là: *chuỗi chưa bị cụt hay rỗng đi trong im lặng* — đã xảy ra thật, hồi
// `QUESTS` khai ở HAI nơi và rỗng bảng dữ liệu thì `QUESTS.length` vẫn ra 25 (CLAUDE.md).
// Một cái sàn bắt được đúng chuyện đó; phần "không thủng ở giữa" thì `idsHopLe` bên dưới gác
// chặt hơn hẳn một con số tổng.
const QUEST_SAN = 40;

// Nhãn chương mang số thứ tự ở đầu ("0 · Ngọn Đèn Tắt", "I · Rune Giữ Đàn", …). Bài kiểm đối
// chiếu nó với tiền tố `cN` của id, nên phải đọc được cả số Ả Rập lẫn số La Mã.
const CHUONG_SO = { '0':0, 'I':1, 'II':2, 'III':3, 'IV':4, 'V':5,
                    'VI':6, 'VII':7, 'VIII':8, 'IX':9, 'X':10 };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => { if (m.type()==='error' && !/404|ERR_CONNECTION/.test(m.text())) errs.push(m.text()); });
  await p.goto('http://localhost:8853/index.html');
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(700);

  const r = await p.evaluate(([BANNED, CHUONG_SO, QUEST_SAN]) => {
    window.TEST_MODE = true; startGame('thieulam', null);
    const out = {};

    // (1) gom mọi text người chơi có thể đọc
    const blob = [
      INTRO_PAGES.join(' '),
      QUESTS.map(q => q.name + ' ' + q.desc + ' ' + (q.chapter||'')).join(' '),
      Object.values(CLUES).map(c => c.name + ' ' + c.desc).join(' '),
      Object.values(BOSS_LORE).map(l => l.name + ' ' + l.intro.join(' ') +
        ' ' + Object.values(l.sect||{}).join(' ')).join(' '),
      Object.values(SECTS).map(s => s.name + ' ' + s.desc + ' ' + s.role).join(' '),
      NPCS.map(n => n.name + ' ' + (n.lore||'')).join(' '),
      Object.values(MOBS).map(m => m.name).join(' '),
    ].join(' ');
    out.banned = BANNED.filter(w => blob.includes(w));
    // "Kundun" chỉ được phép trong đúng cụm "Box Kundun". Bỏ hết cụm đó ra rồi soi phần còn
    // lại — còn sót chữ Kundun nào nữa là ngoại lệ đang nới rộng ngoài ý chủ dự án.
    if (blob.replace(/Box Kundun/g, '').includes('Kundun')) out.banned.push('Kundun (ngoài cụm "Box Kundun")');

    // (2) chuỗi nhiệm vụ: đủ trường, id lành lặn, chương đúng thứ tự
    out.questCount = QUESTS.length;
    out.questDu = QUESTS.length >= QUEST_SAN;

    // ⚠ ID NAY LÀ CHUỖI `c<chương>q<số>`, KHÔNG PHẢI SỐ 1..N.
    // Bản cũ hỏi `v === i + 1` — đúng hồi id còn là số, và từ đợt dựng lại chính tuyến thì nó
    // đỏ vĩnh viễn mà chẳng gác được gì. Nhưng TÍNH CHẤT nó gác thì vẫn còn nguyên giá trị:
    // chuỗi không được thủng lỗ, không được trùng, và chương phải đứng đúng thứ tự — vì
    // `reqMain` của phụ tuyến là CHỈ SỐ trong mảng này, nên chèn/xoá lệch là mọi mốc trượt
    // theo trong im lặng (CLAUDE.md). Nay hỏi đúng hình dạng mới:
    out.idLoi = [];
    const seen = new Set();
    const theoChuong = new Map();              // số chương -> [số thứ tự trong chương]
    const thuTuChuong = [];                    // thứ tự chương lần đầu gặp, theo mảng
    for (const q of QUESTS){
      if (seen.has(q.id)) { out.idLoi.push(q.id + ': id trùng'); continue; }
      seen.add(q.id);
      const m = /^c(\d+)q(\d+)$/.exec(q.id);
      if (!m) { out.idLoi.push(q.id + ': id không theo khuôn c<chương>q<số>'); continue; }
      const ch = +m[1], so = +m[2];
      if (!theoChuong.has(ch)) { theoChuong.set(ch, []); thuTuChuong.push(ch); }
      theoChuong.get(ch).push(so);
      // tiền tố `cN` phải khớp con số in trên nhãn chương — một nhiệm vụ mang id c5q1 mà nhãn
      // ghi "IV · …" là đúng kiểu lỗi chép-dán khi chèn thêm mục, và không gì báo ra cả.
      const nhan = String(q.chapter || '').trim().split(/\s|·/)[0];
      if (CHUONG_SO[nhan] === undefined) out.idLoi.push(q.id + ': nhãn chương "' + q.chapter + '" không đọc ra số');
      else if (CHUONG_SO[nhan] !== ch)   out.idLoi.push(q.id + ': id chương ' + ch + ' nhưng nhãn ghi "' + q.chapter + '"');
    }
    // số thứ tự trong MỖI chương phải là 1..N, không thủng, không đảo
    for (const [ch, ds] of theoChuong)
      if (!ds.every((v, i) => v === i + 1))
        out.idLoi.push('chương ' + ch + ': số thứ tự không liên tục — ' + ds.join(','));
    // chương phải gom thành khối và đi 0,1,2,… — không được xen kẽ hay nhảy cóc
    if (thuTuChuong.length !== new Set(thuTuChuong).size) out.idLoi.push('chương bị xen kẽ, không gom thành khối');
    if (!thuTuChuong.every((v, i) => v === i)) out.idLoi.push('số chương không liên tục từ 0: ' + thuTuChuong.join(','));
    out.idsHopLe = out.idLoi.length === 0;

    // ⚠ `need > 0` áp cho MỌI loại, kể cả `talk`. Máy không đọc `need` của nhiệm vụ talk
    // (`questOnTalk` đặt thẳng prog=1), nhưng 10/11 mục talk vẫn khai `need:1` — nên một mục
    // thiếu nó là dữ liệu lệch chuẩn, tức đúng thứ khẳng định này sinh ra để bắt.
    out.allHaveText = QUESTS.every(q => q.name && q.desc && q.chapter && q.type && q.need > 0);
    out.thieuTruong = QUESTS.filter(q => !(q.name && q.desc && q.chapter && q.type && q.need > 0))
                            .map(q => q.id + ' (' + q.type + ')');
    out.chapters = [...new Set(QUESTS.map(q => q.chapter))];
    // mọi targetNpc / npc phải tồn tại thật
    const npcIds = new Set(NPCS.map(n => n.id));
    out.badNpc = QUESTS.filter(q => (q.npc && !npcIds.has(q.npc)) ||
                                    (q.targetNpc && !npcIds.has(q.targetNpc)))
                       .map(q => q.id);
    // mọi mob phải tồn tại thật
    out.badMob = QUESTS.filter(q => q.mob && !MOBS[q.mob]).map(q => q.id);

    // (3) sect: trong BOSS_LORE phải trỏ vào lớp có thật
    out.badSect = [];
    for (const [id, l] of Object.entries(BOSS_LORE))
      for (const k of Object.keys(l.sect || {})) if (!SECTS[k]) out.badSect.push(id + ':' + k);

    // (4) tên boss khớp giữa BOSS_DEFS và BOSS_LORE
    out.nameMismatch = [];
    for (const mp of Object.values(BOSS_DEFS)){
      for (const t of [...mp.thuve, mp.tranai]){
        const l = BOSS_LORE[t.id];
        if (l && l.name !== t.name) out.nameMismatch.push(t.id + ': "' + t.name + '" vs "' + l.name + '"');
      }
    }

    // (5) chạy hết chuỗi nhiệm vụ bằng cheat, không được lỗi
    player.level = 100; calcDerived();
    for (let i = 0; i < QUESTS.length; i++){ questIdx = i; questState = 'active'; questProg = QUESTS[i].need; }
    player.clues = Object.keys(CLUES); window.qlogTab = 'main'; renderQlog();
    out.questPanel = el('panel-qlog').innerHTML.length > 200;
    window.qlogTab = 'story'; renderQlog();          // tab manh mối + nhật ký boss
    out.storyTab = el('panel-qlog').innerHTML.length > 200;
    showKetMo();
    out.ketMoShown = !document.getElementById('overlay').classList.contains('hidden');
    document.getElementById('overlay').classList.add('hidden');
    return out;
  }, [BANNED, CHUONG_SO, QUEST_SAN]);

  console.log(JSON.stringify(r, null, 1));
  // ⚠ `questPanel` và `storyTab` TRƯỚC ĐÂY ĐƯỢC ĐO RỒI VỨT ĐI — chúng không có mặt trong phép
  // tính `ok`, nên hai bảng ấy có thể rỗng mà bài vẫn xanh. Nay tính vào.
  const ok = r.banned.length === 0 && r.questDu && r.idsHopLe && r.allHaveText
    && r.badNpc.length === 0 && r.badMob.length === 0 && r.badSect.length === 0
    && r.nameMismatch.length === 0 && r.questPanel && r.storyTab && r.ketMoShown
    && errs.length === 0;
  if (!r.questDu) console.log(`  ✗ chuỗi chính tuyến chỉ còn ${r.questCount} mục — dưới sàn ${QUEST_SAN}`);
  if (r.idLoi.length) r.idLoi.forEach(x => console.log('  ✗ id:', x));
  if (r.thieuTruong.length) r.thieuTruong.forEach(x => console.log('  ✗ thiếu trường (name/desc/chapter/type/need>0):', x));
  if (!r.questPanel) console.log('  ✗ bảng Nhật Ký (tab chính tuyến) vẽ ra rỗng');
  if (!r.storyTab)   console.log('  ✗ tab manh mối / nhật ký boss vẽ ra rỗng');
  if (!r.ketMoShown) console.log('  ✗ showKetMo() không bật được lớp phủ');
  if (r.banned.length) r.banned.forEach(x => console.log('  ✗ tên riêng MU lọt vào text người chơi thấy:', x));
  console.log('errors:', JSON.stringify(errs));
  console.log(ok ? 'PASS' : 'FAIL');
  await b.close();
  process.exit(ok ? 0 : 1);
})();
