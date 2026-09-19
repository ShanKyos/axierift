// BỐN LỖI GIAO DIỆN ĐO ĐƯỢC BẰNG PIXEL — không cái nào ném lỗi, không cái nào làm đỏ bài nào.
// Cả bốn đều là cùng một dạng: giao diện NÓI một đằng, máy chạy một nẻo.
//   ① Nhật Ký cắt cụt đúng phần thưởng (cột 168px mà dòng cần 249px)
//   ② Cột phải CHỒNG lên Nhật Ký khi màn không đủ cao (đo: 77 · 118 · 157px)
//   ③ Ba lớp cận chiến không khai `range` ⇒ bảng kỹ năng in "tầm 0" = "nổ dưới chân người niệm"
//   ④ Tiêu đề phụ tuyến lấy map của NGƯỜI GIAO, không lấy map của NHIỆM VỤ
//   ⑤ Hướng dẫn hết giờ thì đẩy người chơi sang bước không làm được ở chỗ đang đứng
const { chromium } = require('playwright');
const URL = 'http://localhost:8853/index.html?max=1';

let bad = 0; const fail = m => { console.log('FAIL', m); bad++; };
const errs = [];

async function moGame(b, w, h){
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto(URL);
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.evaluate(() => localStorage.clear());
  await p.reload();
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(450);
  return p;
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

  // ══ ① NHẬT KÝ KHÔNG ĐƯỢC CẮT CỤT ════════════════════════════════════════════════════════
  // Chỗ bị "…" nuốt luôn là ĐUÔI, mà đuôi của dòng hạ quái là phần thưởng — thứ duy nhất
  // người chơi mở nhật ký ra để đọc. Mười dòng liền hiện ra giống hệt nhau.
  let p = await moGame(b, 1600, 900);
  await p.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', { name:'Ux' }); applyTestBoost(); player.tutStep = -1; });
  await p.waitForTimeout(350);
  const s1 = await p.evaluate(() => {
    // Dùng ĐÚNG câu mà killMob() sinh ra, không bịa một câu ngắn hơn cho dễ qua.
    for (let i = 0; i < 12; i++) logCombat(`☠ Hạ Axie Heo Rừng — Nhận: +${28 + i} EXP +${162 + i * 7}◈`, '#ffd76a');
    const rows = [...document.querySelectorAll('#combat-log .cl-row')];
    const cắt = rows.filter(e => e.scrollWidth > e.clientWidth + 1);
    const box = document.getElementById('combat-log');
    return { tổng: rows.length, cắt: cắt.length,
             // đuôi phải CÒN trên màn: dòng cuối phải chứa ký hiệu Lumen
             cóThưởng: rows.filter(e => /◈/.test(e.textContent)).length,
             tràn: rows.some(e => e.getBoundingClientRect().right > box.getBoundingClientRect().right + 1) };
  });
  console.log('① nhật ký:', JSON.stringify(s1));
  if (s1.tổng < 10) fail(`cảnh dựng hỏng: chỉ ${s1.tổng} dòng nhật ký — phép đo dưới đây vô nghĩa`);
  if (s1.cắt > 0) fail(`${s1.cắt}/${s1.tổng} dòng nhật ký bị cắt cụt — phần bị mất luôn là ĐUÔI, tức đúng phần thưởng`);
  if (s1.cóThưởng < s1.tổng) fail(`${s1.tổng - s1.cóThưởng}/${s1.tổng} dòng mất ký hiệu Lumen ◈ — thưởng bị nuốt`);
  if (s1.tràn) fail('dòng nhật ký tràn ra ngoài khung');
  await p.close();

  // ══ ② CỘT PHẢI KHÔNG ĐƯỢC CHỒNG LÊN NHẬT KÝ ═════════════════════════════════════════════
  // Hai khối cùng rộng 190px, cùng một cột, nhưng neo từ HAI ĐẦU NGƯỢC NHAU: #cot-phai chảy
  // từ trên, #combat-log-wrap neo từ đáy. Không ai kẹp lại nên chúng chồng nhau ở màn thấp.
  // ⚠ ĐO Ở NHIỀU CHIỀU CAO. Ở đúng 1920×1080 thì chúng KHÔNG chồng — kiểm mỗi cỡ đó là
  //    xanh vĩnh viễn trong khi mọi laptop 720p/900p đều hỏng.
  for (const [w, h] of [[1280, 720], [1440, 810], [1600, 900], [1920, 1080]]){
    const p2 = await moGame(b, w, h);
    await p2.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', { name:'Ux' }); applyTestBoost(); player.tutStep = -1;
      for (let i = 0; i < 20; i++) logCombat(`☠ Hạ Axie Heo Rừng — Nhận: +${28 + i} EXP +${162 + i * 7}◈`, '#ffd76a'); });
    await p2.waitForTimeout(500);
    const r = await p2.evaluate((vh) => {
      const cp = document.getElementById('cot-phai').getBoundingClientRect();
      const nk = document.getElementById('combat-log-wrap').getBoundingClientRect();
      const qt = document.getElementById('quest-tracker');
      const mm = document.getElementById('minimap').getBoundingClientRect();
      return { khe: Math.round(nk.top - cp.bottom), cpĐáy: Math.round(cp.bottom), nkĐỉnh: Math.round(nk.top),
               nkĐáyNgoàiMàn: Math.round(nk.bottom - vh),
               nvCòn: qt ? Math.round(qt.clientHeight) : 0,
               nvĐọcHết: qt ? (qt.scrollHeight <= qt.clientHeight + 1 || qt.scrollHeight > qt.clientHeight) : false,
               mmCòn: Math.round(mm.height) };
    }, h);
    console.log(`② ${w}x${h}:`, JSON.stringify(r));
    if (r.khe < 0) fail(`${w}x${h}: cột phải CHỒNG Nhật Ký ${-r.khe}px — đáy bảng Nhiệm Vụ bị che`);
    if (r.nkĐáyNgoàiMàn > 0) fail(`${w}x${h}: Nhật Ký tụt ${r.nkĐáyNgoàiMàn}px ra ngoài màn`);
    // Kẹp cột phải lại thì phải kẹp CHO ĐÚNG: bóp bảng nhiệm vụ về 0 cũng làm khe dương.
    if (r.nvCòn < 90) fail(`${w}x${h}: bảng Nhiệm Vụ chỉ còn ${r.nvCòn}px — chữa chồng lấn bằng cách bóp chết nó`);
    if (r.mmCòn < 100) fail(`${w}x${h}: bản đồ nhỏ bị bóp còn ${r.mmCòn}px`);
    await p2.close();
  }

  // ══ ③ KHÔNG LỚP NÀO ĐƯỢC BỎ TRỐNG `range` ═══════════════════════════════════════════════
  p = await moGame(b, 1400, 900);
  const s3 = await p.evaluate(() => {
    const ra = {};
    for (const s of ['thieulam', 'toanchan', 'baidasan', 'minhgiao', 'bug']){
      localStorage.clear();
      window.TEST_MODE = true; startGame(s, { name: 'T' });
      player.level = 120; vhAutoLearn(); calcDerived();
      let tam0 = 0, tổng = 0;
      for (const id of Object.keys(SKILL_DEFS)){
        const d = SKILL_DEFS[id];
        if (d.phai && d.phai !== s) continue;
        let i; try { i = skillInfo(id); } catch { continue; }
        if (!i || !((i.he || 0) > 0)) continue;   // chỉ đếm chiêu ĐÁNH
        tổng++;
        if (Math.round(i.tam || 0) === 0) tam0++;
      }
      // Nấc lui THẬT của `atkRange()`: gỡ khoá ra, hỏi, rồi trả lại. Đây là cách duy nhất
      // chứng minh "con số vừa khai ĐÚNG LÀ con số đang chạy" — so `range` với `atkRange()`
      // là so một thứ với chính nó, vì atkRange() đọc thẳng `range`.
      const _g = SECTS[s].range; delete SECTS[s].range;
      const nấcLui = atkRange();
      SECTS[s].range = _g;
      ra[s] = { range: SECTS[s].range, nấcLui, tam0, tổng, đánhXa: !!SECTS[s].basicProj };
    }
    return ra;
  });
  console.log('③ ', JSON.stringify(s3));
  const tamMax = Math.max(...Object.values(s3).map(v => v.tam0));
  const tamMin = Math.min(...Object.values(s3).map(v => v.tam0));
  for (const [k, v] of Object.entries(s3)){
    if (!(typeof v.range === 'number' && v.range > 0))
      fail(`SECTS.${k}.range = ${v.range} — skillInfo() lui về đó, nên mọi chiêu của lớp này in "tầm 0", mà theo quy ước của game 0 nghĩa là "nổ ngay dưới chân người niệm"`);
    // ⚠ Lớp CẬN CHIẾN phải khai đúng NẤC LUI đang chạy. Khai một số khác là đổi tầm đánh
    // thật — một thay đổi CÂN BẰNG lẻn vào sau một bản sửa hiển thị. (Hai lớp đánh xa cố ý
    // khai số RIÊNG, lớn hơn hẳn nấc lui: đó là bản sắc của chúng.)
    if (!v.đánhXa && v.range !== v.nấcLui)
      fail(`SECTS.${k}.range = ${v.range} nhưng nấc lui của atkRange() là ${v.nấcLui} — khai một số MỚI thay vì số đang chạy`);
  }
  // Mấy chiêu diện rộng quanh mình VỐN đúng là tầm 0 — nên không đòi 0 tuyệt đối, mà đòi
  // năm lớp KHÔNG được chênh nhau: lớp nào vọt lên hẳn là lớp đó đang thiếu `range`.
  if (tamMax - tamMin > 4)
    fail(`số chiêu in "tầm 0" chênh nhau ${tamMax - tamMin} giữa các lớp (${JSON.stringify(Object.fromEntries(Object.entries(s3).map(([k, v]) => [k, v.tam0])))}) — lớp vọt lên là lớp đang bỏ trống range`);

  // ══ ④ TIÊU ĐỀ PHỤ TUYẾN PHẢI NÓI ĐÚNG CHỖ LÀM ═══════════════════════════════════════════
  const s4 = await p.evaluate(() => {
    localStorage.clear();
    window.TEST_MODE = true; startGame('thieulam', { name: 'T' });
    applyTestBoost(); player.level = 120; player.tutStep = -1;
    // 11 mục phụ tuyến có người giao đứng ở MAP KHÁC với map của mục.
    const lệch = SIDE_QUESTS.map(sq => {
      const n = NPCS.find(x => x.id === sq.npc);
      return (n && n.map !== sq.map) ? { sq, n } : null;
    }).filter(Boolean);
    if (!lệch.length) return { sốLệch: 0 };
    const { sq, n } = lệch[0];
    player.gapNpc = player.gapNpc || {}; player.gapNpc[n.id] = 1;   // bỏ qua ba trang thoại
    curMap = n.map;
    renderQuestNpc(n);
    const t = document.getElementById('panel-quest').innerText;
    const tênNpcMap = MAPS[n.map].name, tênQMap = MAPS[sq.map].name;
    return { sốLệch: lệch.length, npc: n.id, npcMap: tênNpcMap, qMap: tênQMap, tênMục: sq.name,
             // ⚠ ĐỌC THẲNG DÒNG TIÊU ĐỀ, đừng dò bằng biểu thức chính quy. Bản đầu dùng regex và
             // nó IM LẶNG ở phép thử ngược: dấu chéo bị nhân đôi nên mẫu khớp một dấu chéo
             // thật chứ không khớp khoảng trắng, tức mệnh đề xanh kể cả khi tiêu đề nói dối.
             dòngTiêuĐề: (t.split('\n').find(l => l.includes('PHỤ TUYẾN')) || ''),
             cóChỗLàm: t.includes(tênQMap) };
  });
  console.log('④ ', JSON.stringify(s4));
  if (!s4.sốLệch) fail('cảnh dựng hỏng: không mục phụ tuyến nào có người giao ở map khác — mệnh đề này vô nghĩa');
  else {
    if (!s4.dòngTiêuĐề) fail('không tìm thấy dòng tiêu đề PHỤ TUYẾN trong bảng NPC');
    else if (s4.dòngTiêuĐề.toUpperCase().includes(s4.npcMap.toUpperCase()))
      fail(`bảng NPC ${s4.npc} in "${s4.dòngTiêuĐề.trim()}" trong khi mục "${s4.tênMục}" phải làm ở ${s4.qMap} — người chơi nhận việc ở đây, đánh ở đây, và tiến độ không bao giờ nhúc nhích`);
    if (!s4.cóChỗLàm)
      fail(`bảng NPC ${s4.npc} không nói chỗ làm thật (${s4.qMap}) của mục "${s4.tênMục}"`);
  }

  // ══ ⑤ HƯỚNG DẪN KHÔNG ĐƯỢC ĐẨY NGƯỜI CHƠI VÀO NGÕ CỤT ══════════════════════════════════
  const s5 = await p.evaluate(() => {
    localStorage.clear();
    window.TEST_MODE = true; startGame('thieulam', { name: 'T' });
    // KHÔNG applyTestBoost: đây là cảnh của người chơi mới, đứng yên trong thành khởi đầu.
    player.tutStep = 0; player._tutT = 0; player.tutDist = 0;
    const đường = [], xấu = [];
    for (let i = 0; i < 10 && player.tutStep >= 0; i++){
      player._tutT = 9999;            // ép HẾT GIỜ, đúng ca người chơi đứng yên
      tutTick(0.016);
      if (player.tutStep < 0){ đường.push('ĐÓNG'); break; }
      const s = TUT_STEPS[player.tutStep];
      đường.push(s.key);
      let ok = true; try { ok = s.duocO ? !!s.duocO() : true; } catch { ok = true; }
      if (!ok) xấu.push(s.key);
    }
    return { map: curMap, sốQuái: (typeof mobs !== 'undefined') ? mobs.length : -1,
             đường, xấu, bước2: TUT_STEPS[1].txt.replace(/<[^>]+>/g, ''),
             npcĐầu: (QUESTS[0] && QUESTS[0].npc) || null,
             tênNpcĐầu: (() => { const n = NPCS.find(x => x.id === (QUESTS[0] || {}).npc); return n ? n.name : null; })() };
  });
  console.log('⑤ ', JSON.stringify(s5));
  if (s5.map !== 'ardhaven') fail(`cảnh dựng hỏng: nhân vật mới phải bắt đầu ở ardhaven, đang ở ${s5.map}`);
  if (s5.sốQuái !== 0) fail(`cảnh dựng hỏng: thành khởi đầu phải có 0 quái, đang có ${s5.sốQuái} — mệnh đề "bước bất khả thi" mất nghĩa`);
  if (s5.xấu.length) fail(`đứng yên trong thành, hướng dẫn đẩy người chơi sang bước KHÔNG làm được ở đây: ${s5.xấu.join(', ')}`);
  if (s5.đường[s5.đường.length - 1] !== 'ĐÓNG') fail(`hướng dẫn không tự đóng khi hết bước làm được: ${s5.đường.join(' → ')}`);
  // Bước 2 phải nói đúng người giao nhiệm vụ đầu tiên, không phải một NPC chẳng liên quan.
  if (s5.tênNpcĐầu && !s5.bước2.includes(s5.tênNpcĐầu))
    fail(`bước 2 của hướng dẫn không nhắc "${s5.tênNpcĐầu}" — người THẬT giao nhiệm vụ đầu tiên (${s5.npcĐầu}). Bước 2 đang nói: ${s5.bước2}`);
  await p.close();

  console.log('errors:', JSON.stringify(errs));
  console.log(bad === 0 && errs.length === 0 ? 'PASS' : 'FAIL(' + (bad + errs.length) + ')');
  await b.close();
  process.exit(bad === 0 && errs.length === 0 ? 0 : 1);
})();
