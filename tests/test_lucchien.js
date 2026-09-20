// ⚔ LỰC CHIẾN · 🎁 NHẬN QUÀ · ✹ DẢI TRẠNG THÁI
//
// Ba tính năng một bài vì chúng ship cùng một đợt và dùng chung một cửa (`updateHud`). Bài này
// gác TÁM kiểu hỏng, và SÁU trong tám không ném lỗi nào:
//
//  1. NĂM DÒNG KHÔNG CỘNG ĐÚNG TỔNG. Bốn nguồn NHÂN vào nhau, nên tắt riêng từng cái rồi cộng
//     lại thì vượt tổng — đo được lệch −133 ở bản đầu, và phần dư `max(0, …)` kẹp về 0 nuốt
//     mất chỗ lệch. Không lỗi, không đỏ, nhưng người chơi cộng nhẩm ra ngay. §1 + §2.
//  2. MỞ BẢNG LÀM MẤT MÁU THẬT. `lcPhanRa()` tắt trang bị rồi chạy `calcDerived()`, mà hàm đó
//     KẸP `player.hp` xuống `maxHp` (dòng ~8532). Quên cất `hp` là mỗi lần mở bảng máu tụt
//     hàng nghìn — im lặng tuyệt đối. §3 là mệnh đề nặng nhất của cả bài.
//  3. CHI TIẾT CỘNG RA SỐ KHÁC DÒNG NÓ ĐANG MỞ. Cùng bệnh với (1), một tầng dưới: mười một
//     món cũng nhân vào nhau. Bản đầu in `itemPower()` — một ĐƠN VỊ khác hẳn — nên dòng ghi
//     6.499 còn mười ô dưới cộng ra hơn 43.000. §4.
//  4. MỘT DÒNG LUÔN BẰNG 0. Cấp kỹ năng và Điểm Tiềm Năng KHÔNG đi qua `calcDerived()` (chúng
//     nhân trong `castSkill`), nên dòng "kỹ năng" ra đúng 0 kể cả với người đã rót 40 cấp vào
//     cả bốn ô. §5 đòi MỖI trục đầu tư phải làm ĐÚNG dòng của nó tăng.
//  5. NÚT CHẾT / SỐ ĐỨNG IM. §6 bấm nút THẬT trên DOM và đối chiếu số trên nút với `lucChien()`.
//  6. NHẬN QUÀ KHÔNG ĂN. §7 bấm nút Nhận thật, đo `player` đổi, cờ vào save, nút mờ đi.
//  7. DẢI TRẠNG THÁI SAI CHỖ hoặc CÂM. §8 + §9: đúng nửa PHẢI màn hình, và bật/tắt từng
//     trạng thái thì đúng ô đó hiện/biến.
//  8. DẢI RỖNG VẪN CHIẾM CHỖ ⇒ bản đồ nhỏ giật lên xuống mỗi lần một buff tắt. §9 đòi ẩn hẳn.
const { chromium } = require('playwright');
const PORT = process.argv[2] || '8853';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://localhost:' + PORT + '/index.html');
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(500);
  let bad = 0; const fail = m => { console.log('FAIL ' + m); bad++; };
  const pass = m => console.log('PASS ' + m);
  await p.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', null); });
  await p.waitForTimeout(400);

  // ── §1 nhân vật TRẦN: năm dòng cộng đúng tổng ───────────────────────────────────────
  {
    const r = await p.evaluate(() => {
      const x = lcPhanRa(); let s = 0; for (const k in x.ra) s += x.ra[k];
      return { tong: x.tong, cong: s, ra: x.ra };
    });
    if (r.tong <= 0) fail(`§1 Lực Chiến của nhân vật trần ra ${r.tong} — phải là số dương`);
    else if (r.cong !== r.tong) fail(`§1 năm dòng cộng ${r.cong} ≠ tổng ${r.tong}`);
    else pass(`§1 nhân vật trần: ${r.tong} = tổng năm dòng`);
  }

  // ── §2 full BiS: vẫn phải cộng đúng, và đây mới là cảnh có GIAO THOA ────────────────
  {
    const r = await p.evaluate(() => {
      player.level = 120; calcDerived();
      applyTestBoost && applyTestBoost();
      player.resetCount = 5; player.mongChiTon = true;
      player.skillLv = {}; player.skillTn = {};
      for (const id of (player.skillBar || []).filter(Boolean)){ player.skillLv[id] = 40; player.skillTn[id] = 5; }
      player.mastery = {};
      try { for (const t of masteryTabs()) for (const nd of t.nodes) player.mastery[nd.id] = 5; } catch { /* chưa mở */ }
      calcDerived();
      const x = lcPhanRa(); let s = 0; for (const k in x.ra) s += x.ra[k];
      return { tong: x.tong, cong: s, ra: x.ra };
    });
    if (r.cong !== r.tong) fail(`§2 full BiS: năm dòng cộng ${r.cong} ≠ tổng ${r.tong} (lệch ${r.tong - r.cong})`);
    else pass(`§2 full BiS ${r.tong} = tổng năm dòng (giao thoa đã chia lại đúng)`);
  }

  // ── §3 MỞ BẢNG KHÔNG ĐƯỢC LÀM MẤT MÁU ──────────────────────────────────────────────
  {
    const r = await p.evaluate(() => {
      calcDerived(); player.hp = player.maxHp; player.qi = player.maxQi;
      const hp0 = player.hp, qi0 = player.qi, mx0 = player.maxHp;
      togglePanel('lucchien');            // đi qua đúng đường người chơi bấm
      renderLucChien();                   // vẽ lại lần nữa — bảng vẽ lại mỗi lần bung một dòng
      window.lcMo = { do:true }; renderLucChien();
      return { hp0, hp1: player.hp, qi0, qi1: player.qi, mx0, mx1: player.maxHp };
    });
    if (r.hp1 !== r.hp0) fail(`§3 mở bảng làm MẤT MÁU: ${r.hp0} → ${r.hp1}`);
    else if (r.qi1 !== r.qi0) fail(`§3 mở bảng làm mất Mana: ${r.qi0} → ${r.qi1}`);
    else if (r.mx1 !== r.mx0) fail(`§3 máu trần không được trả lại: ${r.mx0} → ${r.mx1}`);
    else pass(`§3 mở bảng 3 lượt: máu ${r.hp0} giữ nguyên, máu trần ${r.mx0} giữ nguyên`);
  }

  // ── §4 chi tiết TRANG BỊ cộng đúng bằng chính dòng của nó ──────────────────────────
  {
    const r = await p.evaluate(() => {
      const x = lcPhanRa();
      const ct = lcChiTiet('do', x.ra.do);
      let s = 0; for (const [, v] of ct) s += Number(String(v).replace(/\D/g, '')) || 0;
      return { dong: x.ra.do, cong: s, n: ct.length };
    });
    if (!r.n) fail('§4 dựng cảnh sai — không món nào đang mặc');
    else if (r.cong !== r.dong) fail(`§4 ${r.n} ô trang bị cộng ${r.cong} ≠ dòng ${r.dong}`);
    else pass(`§4 ${r.n} ô trang bị cộng ${r.cong} = dòng trang bị`);
  }

  // ── §5 SỢI DÂY: mỗi trục đầu tư phải làm ĐÚNG dòng của nó tăng ─────────────────────
  {
    const r = await p.evaluate(() => {
      const cat = () => ({ e:player.equip, s:player.skillLv, t:player.skillTn, m:player.mastery, r:player.resetCount });
      const g = cat();
      const doi = (f) => { f(); calcDerived(); const x = lcPhanRa();
                           player.equip=g.e; player.skillLv=g.s; player.skillTn=g.t;
                           player.mastery=g.m; player.resetCount=g.r; calcDerived(); return x.ra; };
      const day = lcPhanRa().ra;
      return {
        day,
        khongDo: doi(() => { player.equip = {}; }),
        khongKn: doi(() => { player.skillLv = {}; player.skillTn = {}; }),
        khongDt: doi(() => { player.mastery = {}; }),
        khongTs: doi(() => { player.resetCount = 0; }),
      };
    });
    const ktra = [['do','khongDo','trang bị'], ['kn','khongKn','kỹ năng'],
                  ['dt','khongDt','Đại Thành'], ['ts','khongTs','Tái Sinh']];
    let ok = true;
    for (const [k, c, ten] of ktra){
      if (!(r.day[k] > 0)) { fail(`§5 dòng ${ten} đang bằng ${r.day[k]} dù đã đầu tư — sợi dây đứt`); ok = false; }
      else if (!(r[c][k] === 0)) { fail(`§5 tắt ${ten} mà dòng đó vẫn ${r[c][k]} — không đo đúng nguồn`); ok = false; }
    }
    if (ok) pass(`§5 bốn trục đều có sợi dây: đồ ${r.day.do} · kỹ năng ${r.day.kn} · Đại Thành ${r.day.dt} · Tái Sinh ${r.day.ts}`);
  }

  // ── §6 KHUNG HUD: là một UI RIÊNG kế bên thanh máu, không lồng vào khung chân dung ──
  // Chủ dự án chốt "cho nó ra ngoài hẳn 1 UI kế bên thanh máu". Bản đầu nhét nút vào `#cd-phai`
  // — tức cùng cột với hai thanh máu/mana — nên mệnh đề cũ gác "nút nằm TRÊN thanh máu". Nay
  // gác đúng hợp đồng mới: khung đứng RIÊNG, ở BÊN PHẢI thanh máu, KHÔNG đè lên khung chân
  // dung, và cao bằng nó. Ba vế, vì bỏ vế nào cũng lọt một kiểu hỏng: thiếu "không đè" thì
  // khung chồng lên thanh máu vẫn xanh; thiếu "cao bằng" thì hai khối lệch mép dưới.
  {
    const r = await p.evaluate(() => {
      closePanels(); updateHud();
      const b2 = document.getElementById('lc-so-hud');
      const khung = document.getElementById('lc-khung');
      if (!b2 || !khung) return { thieu:true };
      const soNut = Number(b2.textContent.replace(/\D/g, ''));
      const k = khung.getBoundingClientRect();
      const cd = document.getElementById('chan-dung').getBoundingClientRect();
      const hp = document.getElementById('orb-hp').getBoundingClientRect();
      const nut = document.getElementById('btn-lc');
      // KHÔNG lồng trong khung chân dung — hỏi cây DOM, không suy từ toạ độ
      const long = document.getElementById('chan-dung').contains(khung);
      nut.click();                        // bấm THẬT — không gọi hàm
      const mo = !document.getElementById('panel-lucchien').classList.contains('hidden');
      return { soNut, that: lucChien(player), mo, long,
               keBen: k.left >= hp.right - 2,
               khongDe: k.left >= cd.right - 1,
               cungCao: Math.abs(k.height - cd.height) <= 2,
               k: Math.round(k.left), cdR: Math.round(cd.right) };
    });
    if (r.thieu) fail('§6 không có khung Lực Chiến trên HUD');
    else if (r.long) fail('§6 khung Lực Chiến vẫn LỒNG trong #chan-dung — phải là UI riêng');
    else if (r.soNut !== r.that) fail(`§6 số trên khung ${r.soNut} ≠ lucChien() ${r.that}`);
    else if (!r.mo) fail('§6 bấm nút Lực Chiến không mở được bảng — nút chết');
    else if (!r.keBen) fail('§6 khung không nằm kế BÊN PHẢI thanh máu');
    else if (!r.khongDe) fail(`§6 khung đè lên khung chân dung (trái ${r.k} < phải ${r.cdR})`);
    else if (!r.cungCao) fail('§6 khung không cao bằng khung chân dung — hai mép dưới lệch nhau');
    else pass(`§6 khung riêng ở x=${r.k}, kế thanh máu, cao bằng chân dung, số ${r.soNut}, bấm mở được bảng`);
  }
  // ── §6b nhãn trong khung KHÔNG được bị cắt cụt ────────────────────────────────────
  // Khung rộng cố định mà nhãn là chữ Việt có dấu, nên "NHẬN QUÀ" rất dễ thành "NHẬN …" sau
  // khi chừa chỗ cho chấm đỏ — đã xảy ra ở 106px. Hỏi scrollWidth, đừng nhìn ảnh chụp.
  {
    const r = await p.evaluate(() => [...document.querySelectorAll('#lc-khung > button > span')]
      .map(e => ({ txt:e.textContent, cut: e.scrollWidth > e.clientWidth + 1 })));
    const cut = r.filter(x => x.cut);
    if (!r.length) fail('§6b không thấy nhãn nào trong khung Lực Chiến');
    else if (cut.length) fail(`§6b nhãn bị cắt cụt: ${cut.map(x => x.txt).join(', ')}`);
    else pass(`§6b ${r.length} nhãn đủ chỗ: ${r.map(x => x.txt).join(' · ')}`);
  }

  // ── §7 NHẬN QUÀ: bấm nút thật → đồ vào túi, cờ vào save, nút mờ đi ────────────────
  {
    const r = await p.evaluate(() => {
      closePanels();
      player.quaNhan = {};                      // cảnh sạch
      togglePanel('qua'); quaChonSk('tanthu');
      const nut = [...document.querySelectorAll('.qa-nhan')].filter(x => !x.disabled);
      if (!nut.length) return { khongCo:true, cho: quaChoNhan() };
      const s0 = player.silver, n0 = nut.length;
      nut[0].click();
      const n1 = [...document.querySelectorAll('.qa-nhan')].filter(x => !x.disabled).length;
      saveGame();
      const raw = localStorage.getItem('vlcm_save') || '';
      return { s0, s1: player.silver, n0, n1, trongSave: raw.includes('quaNhan'),
               coCo: Object.keys(player.quaNhan).length };
    });
    if (r.khongCo) fail(`§7 dựng cảnh sai — không mốc nào nhận được (chờ ${r.cho})`);
    else if (r.s1 <= r.s0) fail(`§7 bấm Nhận mà Lumen không tăng: ${r.s0} → ${r.s1}`);
    else if (r.n1 >= r.n0) fail(`§7 bấm Nhận mà nút không mờ đi: ${r.n0} → ${r.n1} nút còn bấm được`);
    else if (!r.coCo) fail('§7 không ghi cờ đã nhận — mở lại là nhận được lần nữa');
    else if (!r.trongSave) fail('§7 cờ đã nhận KHÔNG vào save — tải lại trang là nhận lại được');
    else pass(`§7 bấm Nhận: Lumen ${r.s0} → ${r.s1}, nút ${r.n0} → ${r.n1}, cờ vào save`);
  }

  // ── §8 DẢI TRẠNG THÁI đứng ở nửa PHẢI, cạnh bản đồ nhỏ ────────────────────────────
  {
    const r = await p.evaluate(() => {
      closePanels();
      player.poisonT = 12; player.dinhT = 4; player.buffAtkT = 180;
      capNhatTrangThai();
      const d = document.getElementById('trang-thai');
      const mm = document.getElementById('minimap-wrap');
      const a = d.getBoundingClientRect(), m = mm.getBoundingClientRect();
      return { x:a.left, w:innerWidth, soO: d.querySelectorAll('.tt-o').length,
               trenMinimap: a.bottom <= m.top + 8, ganMinimap: Math.abs(a.bottom - m.top) < 40 };
    });
    if (r.soO !== 3) fail(`§8 bật 3 trạng thái mà dải hiện ${r.soO} ô`);
    else if (r.x < r.w / 2) fail(`§8 dải trạng thái nằm ở nửa TRÁI (x=${Math.round(r.x)}/${r.w})`);
    else if (!r.trenMinimap || !r.ganMinimap) fail('§8 dải không nằm sát ngay trên bản đồ nhỏ');
    else pass(`§8 dải ở nửa phải (x=${Math.round(r.x)}), 3 ô, sát trên bản đồ nhỏ`);
  }

  // ── §9 từng trạng thái BẬT/TẮT đúng ô, và rỗng thì ẨN HẲN ────────────────────────
  {
    const r = await p.evaluate(() => {
      const tat = () => { for (const k of ['poisonT','dinhT','buffAtkT','loidonT','vhDmgT','vhCritT',
                                           'vhEvaT','vhAspdT','vhLeechT','vhReflT','ltT','tenuiTT'])
                            player[k] = 0;
                          player.maDao = false; player.toiac = 0; capNhatTrangThai(); };
      const ra = {};
      const thu = (khoa, id) => { tat(); if (khoa === 'maDao'){ player.toiac = 5; player.maDao = true; }
                                  else player[khoa] = 9;
                                  capNhatTrangThai(); ra[id] = ttDangCo().join(','); };
      thu('poisonT','doc'); thu('dinhT','teliet'); thu('buffAtkT','ruou');
      thu('loidonT','chanset'); thu('vhCritT','baokich'); thu('vhLeechT','hutmau');
      thu('vhReflT','phandon'); thu('ltT','lientram'); thu('maDao','sadoa');
      tat();
      const d = document.getElementById('trang-thai');
      return { ra, rongAn: d.classList.contains('trong'), rongHtml: d.innerHTML.trim() === '' };
    });
    const sai = Object.entries(r.ra).filter(([id, co]) => co !== id);
    if (sai.length) fail(`§9 ${sai.length} trạng thái không hiện đúng ô: ${JSON.stringify(sai)}`);
    else if (!r.rongAn || !r.rongHtml) fail('§9 hết trạng thái mà dải không ẩn hẳn — bản đồ nhỏ sẽ giật');
    else pass(`§9 cả ${Object.keys(r.ra).length} trạng thái hiện đúng ô của mình, rỗng thì ẩn hẳn`);
  }

  if (errs.length) fail('lỗi trang: ' + errs.slice(0, 3).join(' | '));
  console.log(bad ? `\n${bad} FAIL` : '\nTẤT CẢ XANH');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
