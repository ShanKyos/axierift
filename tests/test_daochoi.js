// ĐI HẾT CHUỖI NHIỆM VỤ NHƯ NGƯỜI CHƠI — 50 chính tuyến + 32 phụ tuyến.
//
// Bài này KHÁC `test_nhiemvu` (đo luật trên bảng dữ liệu) và `test_phutuyen` (đo máy phụ tuyến):
// nó đi TỪNG Ô một theo đúng thứ tự, và ở mỗi ô hỏi ba câu mà người chơi sẽ hỏi:
//   ① NHẬN được không?     — NPC có thật, có trên map vào được ở đúng cấp đó
//   ② LÀM được không?      — đích tồn tại, đứng trong sàn đi được, và ĐẾM được
//   ③ TRẢ được không?      — quay lại NPC được, và tiến độ chạy sang ô kế
// Cộng thêm bốn phép đo "có hành người chơi không": cổng map, quãng đường, lệch cấp quái, số lượng.
//
// ⚠ KHÔNG nhảy cóc `questIdx`. Bẫy đã ghi ở CLAUDE.md: bài kiểm nhảy cóc qua đoạn đầu game sẽ
// không bao giờ thấy cờ nào bật ở đoạn đầu game (lỗi `victory` chặn DRUE đã lọt đúng kiểu đó).
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://localhost:8853/index.html', { waitUntil: 'networkidle' });
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(600);

  const r = await p.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    player.reflect = 0;                       // phản đòn ghi thẳng m.hp — xem CLAUDE.md
    const hong = [], dau = [], mo = [];       // hỏng · đau · ghi chú

    const npcCua = id => NPCS.find(n => n.id === id);
    const khoMap = m => ({ W:(MAPS[m] && MAPS[m].w) || 2600, H:(MAPS[m] && MAPS[m].h) || 1900 });
    const trongSan = (m, x, y) => { const md = MAPS[m]; return !md || !md.diTrong || trongDaGiac(md.diTrong, x, y); };

    // ── CHÍNH TUYẾN: đi từng ô, KHÔNG nhảy cóc ─────────────────────────────────
    for (let idx = 0; idx < QUESTS.length; idx++){
      const q = QUESTS[idx];
      const ten = `${q.id}(lv${q.lv})`;
      if (questIdx !== idx){ hong.push(`${ten}: chuỗi lệch — questIdx=${questIdx} mà đang xét ô ${idx}`); break; }

      player.level = Math.max(player.level, q.lv); player.lvPeak = player.level;
      vhAutoLearn(); calcDerived(); player.hp = player.maxHp;

      // ① NHẬN — người giao việc có thật và đứng chỗ đi tới được
      const gn = npcCua(q.npc);
      if (!gn) hong.push(`${ten}: không có NPC '${q.npc}' để nhận/trả việc`);
      else {
        if (!trongSan(gn.map, gn.x, gn.y)) hong.push(`${ten}: NPC ${q.npc} đứng NGOÀI sàn đi được của ${gn.map}`);
        const cong = mapGate(gn.map);
        if (!cong.ok) hong.push(`${ten}: map của NPC (${gn.map}) chưa mở ở cấp ${q.lv} — cần cấp ${cong.need}`);
      }

      // ② LÀM — đích có thật, nằm trong sàn, và map đích mở ở đúng cấp này
      const dich = questTarget ? questTarget(q) : null;
      if (!dich) hong.push(`${ten}: nút chỉ đường không có đích nào (loại '${q.type}')`);
      else {
        const { W, H } = khoMap(dich.map);
        if (dich.x > W || dich.y > H || dich.x < 0 || dich.y < 0)
          hong.push(`${ten}: đích (${Math.round(dich.x)},${Math.round(dich.y)}) nằm NGOÀI khổ map ${dich.map} ${W}x${H}`);
        else if (!trongSan(dich.map, dich.x, dich.y))
          hong.push(`${ten}: đích trên ${dich.map} nằm NGOÀI đa giác sàn — đi tới không được`);
        const cg = mapGate(dich.map);
        if (!cg.ok) hong.push(`${ten}: map đích ${dich.map} KHOÁ ở cấp ${q.lv} (cần ${cg.need}) — nhiệm vụ bất khả thi`);
        if (gn && dich.map !== gn.map) mo.push(`${ten}: nhận ở ${gn.map} · làm ở ${dich.map}`);
      }
      // quái của nhiệm vụ phải CÓ MẶT trên map được chỉ tới
      if (q.mob && q.type !== 'boss'){
        const md = MAPS[q.map || (dich && dich.map)];
        const co = md && packsOf(q.map || dich.map).some(x => x.mob === q.mob);
        if (!co) hong.push(`${ten}: quái '${q.mob}' không có bãi nào trên ${q.map || (dich&&dich.map)}`);
        const mb = MOBS[q.mob];
        if (mb && Math.abs(mb.lv - q.lv) > 6) dau.push(`${ten}: quái ${q.mob} cấp ${mb.lv}, lệch ${mb.lv-q.lv} cấp`);
      }
      if (q.type === 'collect'){
        const hm = q.herbMap || 'corran';
        if (!MAPS[hm] || !MAPS[hm].herbs) hong.push(`${ten}: hái ở ${hm} mà map đó KHÔNG bật cờ herbs — không bụi nào mọc`);
        else if (!(HERB_SPOTS[hm] || []).length) hong.push(`${ten}: ${hm} bật herbs nhưng không có điểm nào trong HERB_SPOTS`);
      }
      if (q.type === 'moc'){
        if (!MOC_NV[q.moc]) hong.push(`${ten}: cửa cơ chế '${q.moc}' không có trong MOC_NV — không bao giờ xong`);
        else { try { MOC_NV[q.moc].dem(); } catch(e){ hong.push(`${ten}: MOC_NV.${q.moc}.dem() ném lỗi: ${e.message}`); } }
      }
      if (q.type === 'talk' && q.targetNpc && !npcCua(q.targetNpc))
        hong.push(`${ten}: phải gặp '${q.targetNpc}' mà không có NPC nào tên đó`);
      if (q.type === 'tranai'){
        const bd = BOSS_DEFS[q.map];
        if (!bd || !bd.tranai) hong.push(`${ten}: ${q.map} không có Trấn Ải — nhiệm vụ đóng chương không có đích`);
      }
      if ((q.need || 1) > 40) dau.push(`${ten}: đòi ${q.need} lượt — quá dài cho một ô`);

      // ③ TRẢ — ép xong bằng đúng cửa của từng loại rồi trả
      questProg = q.need || 1; questState = 'done';
      const truoc = questIdx;
      turnInQuest();
      if (questIdx === truoc) hong.push(`${ten}: trả việc xong mà chuỗi KHÔNG chạy tiếp`);
    }
    const xongChinh = questIdx >= QUESTS.length;

    // ── PHỤ TUYẾN: mở hết cửa rồi soi từng mục ────────────────────────────────
    player.level = 120; player.lvPeak = 120; calcDerived();
    for (const sq of SIDE_QUESTS){
      const ten = `${sq.id}(lv${sq.reqLv})`;
      const gn = npcCua(sq.npc);
      if (!gn){ hong.push(`${ten}: không có NPC '${sq.npc}'`); continue; }
      if (!trongSan(gn.map, gn.x, gn.y)) hong.push(`${ten}: NPC ${sq.npc} đứng NGOÀI sàn của ${gn.map}`);
      const d = sideQuestTarget(sq);
      if (!d){ hong.push(`${ten}: không có đích`); continue; }
      const { W, H } = khoMap(d.map);
      if (d.x > W || d.y > H) hong.push(`${ten}: đích ngoài khổ map ${d.map}`);
      else if (!trongSan(d.map, d.x, d.y)) hong.push(`${ten}: đích trên ${d.map} NGOÀI sàn đi được`);
      const cg = mapGate(sq.map);
      if (!cg.ok) hong.push(`${ten}: map ${sq.map} khoá ở cấp ${sq.reqLv} (cần ${cg.need})`);
      if (sq.type === 'kill'){
        if (!packsOf(sq.map).some(x => x.mob === sq.mob)) hong.push(`${ten}: '${sq.mob}' không có bãi nào trên ${sq.map}`);
        const mb = MOBS[sq.mob];
        if (mb && Math.abs(mb.lv - sq.reqLv) > 8) dau.push(`${ten}: quái ${sq.mob} cấp ${mb.lv}, lệch ${mb.lv - sq.reqLv}`);
      }
      if (sq.type === 'collect'){
        const hm = sq.herbMap || sq.map;
        if (!MAPS[hm] || !MAPS[hm].herbs) hong.push(`${ten}: hái ở ${hm} mà map không bật herbs`);
      }
      if (sq.type === 'moc' && !MOC_NV[sq.moc]) hong.push(`${ten}: cửa '${sq.moc}' không có trong MOC_NV`);
      if (sq.type === 'talk' && sq.targetNpc && !npcCua(sq.targetNpc)) hong.push(`${ten}: không có NPC đích '${sq.targetNpc}'`);
      if (sq.type === 'tranai' && !(BOSS_DEFS[sq.map] && BOSS_DEFS[sq.map].tranai)) hong.push(`${ten}: ${sq.map} không có Trấn Ải`);
    }

    // ── ĐI BỘ TỚI ĐƯỢC CHƯA? ──────────────────────────────────────────────────
    // ⚠ `mapGate` chỉ nói CẤP có đủ không. Nó KHÔNG nói người chơi có đường tới đó không.
    // Bẫy đã ghi ở CLAUDE.md: gọi `travelTo(x)` từ console thì chạy ngon vì nó là một hàm,
    // không qua cửa nào — ba map cuối từng là nội dung chết vì đúng chuyện này. Nên phải LAN
    // theo đường người chơi: chỉ đi qua GATES, và chỉ dịch chuyển tới nơi đã đặt chân.
    const lanToi = (capToiDa) => {
      const den = new Set([ (typeof MAPS !== 'undefined' && MAPS.ardhaven) ? 'ardhaven' : Object.keys(MAPS)[0] ]);
      let doi = true;
      while (doi){
        doi = false;
        // ⚠ `GATES` là MẢNG PHẲNG `{map,x,y,to}`, KHÔNG phải từ điển theo map. Bản đầu viết
        // `GATES[m]` nên phép lan không bao giờ ra khỏi thành và bài kiểm báo 73 lỗi giả —
        // kể cả map khởi đầu. Đoán hình dạng dữ liệu rồi tin kết quả là cách nhanh nhất để
        // dựng một bài kiểm nói dối rất to.
        for (const m of [...den]) for (const g of GATES.filter(x => x.map === m)){
          const dich = g.to; if (!dich || den.has(dich)) continue;
          const md = MAPS[dich]; if (!md) continue;
          if ((md.min || 1) > capToiDa) continue;       // cổng có, nhưng chưa đủ cấp để qua
          den.add(dich); doi = true;
        }
      }
      return den;
    };
    for (const q of QUESTS){
      const d = questTarget ? questTarget(q) : null; if (!d || !d.map) continue;
      if (!lanToi(q.lv).has(d.map))
        hong.push(`${q.id}(lv${q.lv}): KHÔNG có đường đi bộ tới ${d.map} ở cấp đó — nội dung chết`);
    }
    for (const sq of SIDE_QUESTS){
      if (!lanToi(sq.reqLv).has(sq.map))
        hong.push(`${sq.id}(lv${sq.reqLv}): KHÔNG có đường đi bộ tới ${sq.map} ở cấp đó`);
    }

    // ── CỬA CƠ CHẾ ĐÃ MỞ CHƯA khi nhiệm vụ bảo đi dùng nó? ───────────────────
    // Một nhiệm vụ "phân 1 điểm Đại Thành" ở cấp 56 mà bảng Đại Thành mở ở cấp 60 thì người
    // chơi kẹt cứng và không có gì nói cho họ biết vì sao.
    for (const q of QUESTS.filter(x => x.type === 'moc')){
      player.level = q.lv; player.lvPeak = q.lv; calcDerived();
      // ⚠ CHỐT NÀY BẮT ĐƯỢC LỖI NẶNG NHẤT CỦA CẢ CHUỖI, giữ nguyên: `c4q3` từng gate Đại Thành
      // ở cấp 56 trong khi bảng đó mở ở cấp 120 VÀ đòi xong 100% chính tuyến — chuỗi kẹt ở ô
      // 26/50 vĩnh viễn, không một lỗi nào báo. Cửa nào mở SAU chuỗi thì không ô nào gate được.
      if (q.moc === 'mastery' && typeof masteryOpen === 'function' && !masteryOpen())
        hong.push(`${q.id}(lv${q.lv}): gate Đại Thành mà bảng đó chỉ mở ở cấp ${typeof MASTERY_LV!=='undefined'?MASTERY_LV:'?'} + xong chính tuyến ⇒ CHUỖI KẸT CỨNG`);
      // ⚠ PHẢI LÁI THẬT, ĐỪNG ĐỌC TRẠNG THÁI RỒI SUY. Hai bản trước đều báo lỗi GIẢ ở ô này:
      // bản đầu dò nhầm tên trường (`vhLv`), bản sau đọc `skillLv` thấy rỗng rồi kêu "không có
      // chiêu nào để nâng" — trong khi rỗng ở đó là ĐÚNG: đó chính là việc nhiệm vụ bảo đi làm.
      // Câu hỏi thật là "nâng được không", nên đưa tài nguyên rồi gọi đúng hàm nâng của game.
      if (q.moc === 'nangky'){
        vhAutoLearn(); calcDerived();
        player.silver = 99999999; player.khi = 99999999;
        const ids = Object.keys(SKILL_DEFS).filter(id => { const i = skillInfo(id); return i && i.unlocked; });
        if (ids.length < 1) hong.push(`${q.id}(lv${q.lv}): ở cấp đó chưa mở được chiêu nào để nâng`);
        else {
          for (let k = 0; k < (q.need || 1); k++) upgradeSkillUI(ids[k % ids.length]);
          const duoc = MOC_NV.nangky.dem();
          if (duoc < (q.need || 1)) hong.push(`${q.id}(lv${q.lv}): nâng ${q.need} lần bằng chính hàm của game mà chỉ đếm được ${duoc}`);
        }
      }
      // Mọi cửa `moc` khác: đếm thử phải chạy được và không âm
      { const M2 = MOC_NV[q.moc]; if (M2){ const n = M2.dem();
          if (typeof n !== 'number' || n < 0) hong.push(`${q.id}: MOC_NV.${q.moc}.dem() trả ${n}`); } }
    }
    player.level = 120; player.lvPeak = 120; calcDerived();

    // ── CỬA `moc` PHẢI TĂNG NGHIÊM NGẶT THEO CẤP ─────────────────────────────
    // `moc` đếm từ TRẠNG THÁI (chủ ý — xem MOC_NV), nên một ô đòi ÍT HƠN HOẶC BẰNG một ô cùng
    // cửa ở cấp thấp hơn sẽ bật `done` NGAY LÚC NHẬN. Không lỗi, không sai — chỉ là một ô đóng
    // cửa chương xong trước khi người chơi kịp đọc hết mô tả, tức nó không gác gì cả.
    {
      const gom = {};
      for (const q of [...QUESTS, ...SIDE_QUESTS].filter(x => x.type === 'moc'))
        (gom[q.moc] = gom[q.moc] || []).push({ id:q.id, lv:q.lv || q.reqLv, need:q.need || 1 });
      for (const k in gom){
        const d = gom[k].sort((a, b) => a.lv - b.lv);
        for (let i = 1; i < d.length; i++)
          if (d[i].need <= d[i-1].need)
            hong.push(`cửa '${k}': ${d[i].id}(lv${d[i].lv}) đòi ${d[i].need} mà ${d[i-1].id}(lv${d[i-1].lv}) đã đòi ${d[i-1].need} ⇒ XONG NGAY lúc nhận`);
      }
    }

    // ── QUÃNG ĐƯỜNG TRONG CÙNG MỘT MAP ───────────────────────────────────────
    // Không phải lỗi, nhưng là thứ người chơi CẢM được — map dựng lại khổ lớn (tới 5200×3800)
    // nên một ô có thể bắt băng ngang ba màn hình. Ghi vào mục "hành người chơi" để còn thấy.
    for (const q of QUESTS){
      const g = npcCua(q.npc), d = questTarget ? questTarget(q) : null;
      if (!g || !d || d.map !== g.map) continue;
      const px = Math.hypot(d.x - g.x, d.y - g.y);
      if (px > 3500) dau.push(`${q.id}(lv${q.lv}): đi ${Math.round(px)}px ≈ ${(px/1280).toFixed(1)} màn hình trong ${g.map}`);
    }

    // ── ba phép đo "hành người chơi" trên toàn chuỗi ──────────────────────────
    const hoCap = [];
    for (let i = 1; i < QUESTS.length; i++){ const g = QUESTS[i].lv - QUESTS[i-1].lv; if (g > 4) hoCap.push(`${QUESTS[i-1].id}→${QUESTS[i].id} hở ${g} cấp`); }
    const DANH = ['kill','tpkill','boss','tranai'];
    const tiLe = Math.round(QUESTS.filter(q => DANH.includes(q.type)).length * 100 / QUESTS.length);
    // phụ tuyến mở cùng lúc có vượt trần không
    let maxCungLuc = 0;
    for (let lv = 1; lv <= 120; lv++){
      const n = SIDE_QUESTS.filter(s => s.reqLv <= lv).length - SIDE_QUESTS.filter(s => s.reqLv < lv - 12).length;
      if (n > maxCungLuc) maxCungLuc = n;
    }
    return { hong, dau, mo, xongChinh, questIdx, hoCap, tiLe, maxCungLuc, tran: SIDE_TRAN };
  });

  let bad = 0;
  console.log(`\n═══ ĐI HẾT CHUỖI ═══  chính tuyến ${r.xongChinh ? 'ĐI HẾT' : 'KẸT ở ô ' + r.questIdx}`);
  console.log(`đánh quái ${r.tiLe}% · hở cấp >4: ${r.hoCap.length} · phụ tuyến mở cùng lúc nhiều nhất ${r.maxCungLuc} (trần ${r.tran})`);
  if (!r.xongChinh){ bad++; console.log('  ✗ chuỗi chính tuyến KHÔNG đi hết được'); }
  else console.log('  ✓ đi hết 50 ô chính tuyến bằng đúng turnInQuest()');

  console.log(`\n── HỎNG (${r.hong.length}) ──`);
  if (!r.hong.length) console.log('  ✓ không ô nào hỏng');
  for (const x of r.hong){ bad++; console.log('  ✗ ' + x); }

  console.log(`\n── HÀNH NGƯỜI CHƠI (${r.dau.length}) ──`);
  if (!r.dau.length) console.log('  ✓ không chỗ nào');
  for (const x of r.dau) console.log('  ⚠ ' + x);

  if (r.hoCap.length){ console.log(`\n── HỞ CẤP ──`); for (const x of r.hoCap) console.log('  ⚠ ' + x); }
  if (r.mo.length){ console.log(`\n── nhận một nơi, làm một nơi (${r.mo.length}) ──`); for (const x of r.mo.slice(0,12)) console.log('  · ' + x); }

  if (errs.length){ bad++; console.log('\nlỗi trang: ' + errs.slice(0,3).join(' | ')); }
  await b.close();
  console.log(bad ? `\nFAIL(${bad})` : '\nALL PASS');
  process.exit(bad ? 1 : 0);
})();
