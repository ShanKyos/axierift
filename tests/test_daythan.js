// DẠY HAI TRỤC AXIE — người chơi có được NÓI CHO BIẾT không.
//
// Cơ chế đã chạy và đã có bài gác (`test_hethu` · `test_bophan`). Bài này gác một thứ khác hẳn:
// **người chơi có cách nào biết nó tồn tại không.** Đo trước khi làm: sáu kênh nói ra cơ chế,
// và KHÔNG kênh nào là nhiệm vụ — `grep` toàn bộ 50 nhiệm vụ chính + 32 phụ ra 0 chỗ nhắc tới
// hệ phòng thủ, đổi thân, hay cấu tạo. Tệ hơn: chỗ giải thích bằng LỜI duy nhất trong cả game
// (trang dẫn truyện) đang dạy một mô hình đã chết — *"mỗi lớp mang một hệ nguyên tố"* — sai cả
// hai nửa, vì hệ đòn đánh nay lấy từ VŨ KHÍ còn hệ phòng thủ lấy từ CÁI THÂN.
//
// ⚠ ④ LÀ MỆNH ĐỀ ĐÁNG GIÁ NHẤT, và nó phải đo ở HAI map. Bảng Khế Ước nay nói "con này ở đất
// đang đứng thì thế nào" — một bảng hỏi ở đúng một chỗ thì mọi cách cài đều xanh, kể cả cài
// chết cứng một hệ. Phải đổi map rồi đòi phán quyết ĐỔI THEO.
//
// ⚠ ② kiểm `undefined` ≠ `null`. Người bấm `/avatar off` cũng đã CHỌN — gộp hai cái thành
// `!player.avatar` là nhiệm vụ không bao giờ xong với họ, và không lỗi nào báo.
//
// Chạy độc lập:  node tests/test_daythan.js [cổng]
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
  await page.goto(`http://localhost:${CONG}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__gameReady).catch(() => {});

  // ── ① cửa nhiệm vụ có thật, và nó nằm SAU cửa Khế Ước ────────────────────────────────────
  const r1 = await page.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    const iKhe = QUESTS.findIndex(q => q.type === 'moc' && q.moc === 'khe');
    const iThan = QUESTS.findIndex(q => q.type === 'moc' && q.moc === 'than');
    const ho = [];
    for (let i = 1; i < QUESTS.length; i++){ const g = QUESTS[i].lv - QUESTS[i-1].lv; if (g > 4) ho.push(`${QUESTS[i-1].id}→${QUESTS[i].id}:${g}`); }
    const DANH = ['kill', 'tpkill', 'boss', 'tranai'];
    return {
      iKhe, iThan,
      coMoc: !!(MOC_NV && MOC_NV.than && typeof MOC_NV.than.dem === 'function'),
      lv: iThan >= 0 ? QUESTS[iThan].lv : null,
      hoCap: ho,
      tiLeDanh: Math.round(QUESTS.filter(q => DANH.includes(q.type)).length * 100 / QUESTS.length),
      reqOk: SIDE_QUESTS.every(s => s.reqMain === undefined || s.reqMain < QUESTS.length),
    };
  });
  if (r1.iThan < 0) fail('① không nhiệm vụ nào gác trục phòng thủ của Axie (`moc:"than"`)');
  else if (!r1.coMoc) fail('① nhiệm vụ khai `moc:"than"` nhưng MOC_NV không có cửa đó ⇒ nó không bao giờ xong');
  // Chưa quay Khế Ước thì không có thân nào để mà chọn — một cửa mở TRƯỚC cửa nó dựa vào là
  // cùng cái lỗi `c4q3` từng gate Đại Thành (mở ở cấp 120, sau cả chuỗi).
  else if (!(r1.iThan > r1.iKhe)) fail(`① ô "tự cắm thân" (${r1.iThan}) không nằm sau ô Khế Ước (${r1.iKhe})`);
  else if (r1.hoCap.length) fail(`① chèn nhiệm vụ làm hở cấp >4: ${r1.hoCap.join(', ')}`);
  else if (r1.tiLeDanh > 60) fail(`① ${r1.tiLeDanh}% chuỗi là đi đánh — trần 60%`);
  else if (!r1.reqOk) fail('① có `reqMain` trỏ ra ngoài chuỗi sau khi chèn');
  else pass(`nhiệm vụ cấp ${r1.lv} gác trục phòng thủ, nằm sau cửa Khế Ước · chuỗi vẫn ${r1.tiLeDanh}% đánh, không hở cấp`);

  // ── ② bộ đếm phân biệt ba trạng thái, không phải hai ──────────────────────────────────────
  const r2 = await page.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    const C = chiState(); C.co['tidewarden'] = { con: 0 };
    const o = { kieuDau: typeof player.avatar, chuaChon: MOC_NV.than.dem() };
    window.chiChon('tidewarden');
    o.daChon = MOC_NV.than.dem(); o.id = player.avatar;
    player.avatar = null;            // /avatar off — cũng là một lựa chọn
    o.daTat = MOC_NV.than.dem();
    return o;
  });
  if (r2.kieuDau !== 'undefined') fail('② nhân vật mới đã khai sẵn `avatar` ⇒ cửa xong ngay lúc nhận, không dạy được gì');
  else if (r2.chuaChon !== 0) fail(`② chưa chọn mà đếm ra ${r2.chuaChon}`);
  else if (r2.daChon !== 1 || r2.id !== 'tidewarden') fail(`② cắm thân rồi mà đếm ra ${r2.daChon}`);
  else if (r2.daTat !== 1) fail('② `/avatar off` bị coi như chưa chọn — người bấm nút tắt kẹt nhiệm vụ vĩnh viễn');
  else pass('bộ đếm phân biệt đủ ba trạng thái: chưa chạm · đang cắm · đã tắt');

  // ── ③ SỢI DÂY, không phải cái bảng: lái nhiệm vụ thật qua `mocTick` ───────────────────────
  const r3 = await page.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    const i = QUESTS.findIndex(q => q.type === 'moc' && q.moc === 'than');
    const C = chiState(); C.co['tidewarden'] = { con: 0 };
    player.avatar = undefined;
    questIdx = i; questState = 'active'; questProg = 0;
    mocTick(10); const truoc = questState;
    window.chiChon('tidewarden');
    mocTick(10);
    return { truoc, sau: questState, prog: questProg };
  });
  if (r3.truoc !== 'active') fail(`③ cảnh dựng sai — nhiệm vụ đã ở trạng thái "${r3.truoc}" trước khi người chơi làm gì`);
  else if (r3.sau !== 'done') fail(`③ cắm thân xong mà nhiệm vụ vẫn "${r3.sau}" — thiếu chỗ móc, nó sẽ không bao giờ xong`);
  else pass('nhiệm vụ đi từ active → done bằng chính hành động của người chơi');

  // ── ④ bảng Khế Ước biết mình đang đứng ở đâu, VÀ phán quyết đổi theo map ──────────────────
  const r4 = await page.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    player.level = 60; player.lvPeak = 60; calcDerived();
    const C = chiState(); for (const c of CHIMERA) C.co[c.id] = { con: 0 };
    const doc = mid => {
      travelTo(mid); renderMount();
      const t = CE().innerText;
      return {
        dat: /Đang đứng ở/.test(t),
        soNhan: (t.match(/chịu đòn nhẹ hơn −|ăn đòn nặng hơn \+|trung tính với đất/g) || []).length,
        pq: CHIMERA.map(c => { const h = axieTaiDay(c, mid); return h ? h.ket : 9; }).join(''),
      };
    };
    const a = doc('ngoai'), b = doc('daohoa');
    travelTo('ardhaven'); renderMount();
    const thanh = CE().innerText;
    return { a, b, soCon: CHIMERA.length, thanhNoiKhongCoHe: /không có hệ trội/.test(thanh) };
  });
  if (!r4.a.dat || !r4.b.dat) fail('④ bảng Khế Ước không nói người chơi đang đứng ở đất nào');
  else if (r4.a.soNhan < r4.soCon) fail(`④ chỉ ${r4.a.soNhan}/${r4.soCon} con có phán quyết "ở đất này"`);
  else if (r4.a.pq === r4.b.pq) fail('④ phán quyết KHÔNG đổi giữa hai vùng khác hệ — bảng đang chốt cứng, không đọc chỗ đang đứng');
  else if (!r4.thanhNoiKhongCoHe) fail('④ trong thành (không hệ trội) bảng vẫn phán quyết — nói dối là có câu trả lời');
  else pass(`cả ${r4.soCon} con đều có phán quyết tại chỗ, và nó đổi khi sang vùng khác hệ`);

  // ── ⑤ băng-rôn nói ra CHỖ ĐỔI, không chỉ nói nên đổi ─────────────────────────────────────
  const r5 = await page.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    const xau = heThuKet('Beast', 'Plant', 1), tot = heThuKet('Plant', 'Beast', 1), tt = heThuKet('Beast', 'Beast', 1);
    return { xau: xau && xau.dai, tt: tt && tt.dai, totKet: tot && tot.ket };
  });
  if (!r5.xau || !/phím C/.test(r5.xau)) fail('⑤ băng-rôn khuyên đổi thân mà không nói đổi ở đâu');
  else if (!r5.tt || !/phím C/.test(r5.tt)) fail('⑤ nhánh trung tính không chỉ chỗ đổi');
  else if (r5.totKet !== 1) fail('⑤ nhánh có lợi hỏng');
  else pass('băng-rôn chỉ thẳng chỗ đổi thân ở cả nhánh bất lợi lẫn trung tính');

  // ── ⑥ trang dẫn truyện không còn dạy mô hình đã chết ──────────────────────────────────────
  const r6 = await page.evaluate(() => {
    const t = (window.INTRO_PAGES || []).join('\n');
    return {
      co: !!t,
      moHinhCu: /Mỗi lớp mang một <b>hệ nguyên tố<\/b>/.test(t),
      noiVuKhi: /VŨ KHÍ/.test(t),
      noiThan: /CÁI THÂN/.test(t),
    };
  });
  if (!r6.co) fail('⑥ cảnh dựng sai — không đọc được INTRO_PAGES');
  else if (r6.moHinhCu) fail('⑥ trang dẫn truyện còn dạy "mỗi lớp mang một hệ nguyên tố" — mô hình đã chết từ đợt tam giác');
  else if (!r6.noiVuKhi || !r6.noiThan) fail('⑥ trang dẫn truyện không nói đủ HAI nguồn (vũ khí cho đòn đánh, cái thân cho phòng thủ)');
  else pass('trang dẫn truyện dạy đúng hai chiều hai nguồn');

  console.log('errors:', JSON.stringify(errors.slice(0, 6)));
  if (errors.length) fail(`${errors.length} lỗi JS trong lúc chạy`);
  await browser.close();
  if (bad){ console.log(`FAIL(${bad})`); process.exit(1); }
  console.log('PASS');
})();
