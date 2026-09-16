// SÁU BỘ PHẬN AXIE — trục THỨ HAI, và nó phải chứng minh được là KHÔNG bán sức mạnh.
//
// Trước đợt này con Axie có đúng một trục: `lop` quyết định hệ phòng thủ. Sáu bộ phận —
// thứ mà `axie-hinh-hoa §1` nói là định nghĩa một con Axie — chưa được đọc một lần nào.
//
// ⚠⚠ MỆNH ĐỀ ② LÀ LÝ DO CẢ BÀI NÀY TỒN TẠI. Trục sức mạnh từ phía Axie đã bị tháo BA lần (bị
// động `thu` · cấp Chimera · bốn ô Cốt) và lần nào cũng quay lại dưới dạng "chỉ vài dòng chỉ số
// nhỏ thôi". Cơ chế này đứng vững được vì có một BẤT BIẾN ĐO ĐƯỢC: trên phân bố đều chín lớp
// quái, kỳ vọng hệ số phòng thủ của cả 16 con **bằng nhau chính xác**. Ai "cải tiến" nó thành
// một nấc thang thì mệnh đề đó đỏ.
//
// ⚠ VÀ ② MỘT MÌNH THÌ CHƯA ĐỦ — nó xanh y hệt khi cơ chế TẮT HẲN (mọi hệ số bằng 1 thì trung
// bình cũng bằng nhau). Nên ③ đo CHIỀU NGƯỢC LẠI trên đàn quái THẬT của từng vùng: con thuần
// phải dao động mạnh hơn con tạp. Hai mệnh đề kẹp hai đầu; thiếu một cái là bỏ lọt một nửa.
//
// ⚠ ③ đo trên MIỀN DÂN SỐ THẬT, không đo trên chín lớp đều tay. Đó là vết sẹo đã ghi trong
// CLAUDE.md: con số 32,4% từng đo trên MỘT con quái tự chọn, tính lại trên đàn thật còn 7,9%.
// Đo một mẫu tự chọn rồi gọi nó là kết quả thì lúc nào cũng ra con số mình muốn.
//
// Chạy độc lập:  node tests/test_bophan.js [cổng]
const { chromium } = require('playwright');
const CONG = process.argv[2] || '8853';
let bad = 0;
const fail = m => { console.log('FAIL ' + m); bad++; };
const pass = m => console.log('PASS ' + m);

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('http://localhost:' + CONG + '/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__gameReady).catch(() => {});
  await page.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', null); });
  await page.waitForTimeout(400);

  // ── ① DỮ LIỆU: đủ 16 con × 6 bộ phận, mọi bộ phận là một lớp CÓ THẬT ────────────────
  // Gõ sai tên lớp thì `ELEM[...]` ra undefined, `bpCung` lặng lẽ đếm hụt, và con đó tạp đi
  // một bậc mà không một lỗi nào in ra — đúng họ với mã chiêu gõ sai ở `test_cayky §1`.
  const r1 = await page.evaluate(() => {
    const o = { tong: CHIMERA.length, thieu: [], lopLa: [], cung: {}, sao: {} };
    for (const c of CHIMERA){
      if (!c.bp){ o.thieu.push(c.id); continue; }
      for (const k of BP_TEN){
        if (!c.bp[k]) o.thieu.push(c.id + '.' + k);
        else if (!ELEM[c.bp[k]]) o.lopLa.push(c.id + '.' + k + '=' + c.bp[k]);
      }
      o.cung[c.id] = bpCung(c);
      o.sao[c.id] = c.sao;
    }
    const cs = Object.values(o.cung);
    o.tbCung = cs.reduce((a, b) => a + b, 0) / cs.length;
    o.tbSac  = cs.map(bpSac).reduce((a, b) => a + b, 0) / cs.length;
    o.min = Math.min(...cs); o.max = Math.max(...cs);
    return o;
  });
  console.log(`  ① ${r1.tong} con · cùng nhóm ${r1.min}–${r1.max}/6 · TB ${r1.tbCung.toFixed(2)} ⇒ sắc TB ${r1.tbSac.toFixed(3)}`);
  if (r1.thieu.length) fail(`① thiếu bộ phận: ${r1.thieu.slice(0, 6).join(', ')}`);
  else if (r1.lopLa.length) fail(`① bộ phận mang lớp không có thật: ${r1.lopLa.join(', ')}`);
  else if (r1.max - r1.min < 4) fail(`① độ thuần chỉ trải ${r1.min}–${r1.max}/6 — quá hẹp để đọc ra hai kiểu chơi`);
  // Sắc TB phải quanh 1,00: đó là mốc của bản TRƯỚC bộ phận, nên lệch khỏi nó là lặng lẽ đổi độ
  // khó chung của cả game trong khi cơ chế này chỉ được phép đổi HÌNH DẠNG.
  else if (r1.tbSac < 0.95 || r1.tbSac > 1.05) fail(`① sắc trung bình ${r1.tbSac.toFixed(3)} lệch khỏi mốc 1,00 — cả bảng đã bị thổi lên/xuống`);
  else pass(`16 con khai đủ sáu bộ phận, trải ${r1.min}–${r1.max}/6, sắc trung bình ${r1.tbSac.toFixed(3)}`);

  // ⚠ ĐỘ THUẦN KHÔNG ĐƯỢC ĐI THEO SỐ SAO. Nếu 5★ nào cũng thuần hơn 4★ thì người chơi đọc ra
  // "5★ = mạnh hơn" — mà gacha thì không được bán sức mạnh. Con thuần nhất phải có ít nhất một
  // con 4★.
  const thuanNhat = Object.keys(r1.cung).filter(k => r1.cung[k] === r1.max);
  if (!thuanNhat.some(k => r1.sao[k] < 5))
    fail(`① thuần nhất toàn 5★ (${thuanNhat.join(', ')}) — độ thuần đang đọc ra thành "5★ mạnh hơn"`);
  else pass(`độ thuần không đi theo số sao: thuần nhất gồm ${thuanNhat.join(', ')}`);

  // ── ② BẤT BIẾN: kỳ vọng trên chín lớp quái BẰNG NHAU cho cả 16 con ──────────────────
  //
  // Hỏi qua chính `heThuKet` của game, không tự nhân tay: tự nhân là dựng bản sao thứ hai của
  // một luật đang sống, sửa một bên là hai bên lệch mà bài vẫn xanh.
  const r2 = await page.evaluate(() => {
    const out = [];
    for (const c of CHIMERA){
      const sac = bpSac(bpCung(c));
      let tong = 0;
      for (const mob of ELEMENTS) tong += heThuKet(mob, c.lop, sac).mul;
      out.push({ id: c.id, cung: bpCung(c), sac, ky: tong / ELEMENTS.length });
    }
    return out;
  });
  const kys = r2.map(x => x.ky);
  const lech = Math.max(...kys) - Math.min(...kys);
  console.log(`  ② kỳ vọng trên 9 lớp: ${Math.min(...kys).toFixed(9)} … ${Math.max(...kys).toFixed(9)} (lệch ${lech.toExponential(2)})`);
  // Ngưỡng là sai số DẤU PHẨY ĐỘNG, không phải một dung sai thiết kế. Bất biến này đúng theo
  // phép dựng (nội suy về chính trung bình ⇒ đạo hàm của tổng theo `sac` bằng 0), nên bất cứ
  // con số nào lớn hơn nhiễu float đều nghĩa là ai đó đã dựng lại nó thành một nấc thang.
  if (lech > 1e-9) fail(`② kỳ vọng KHÔNG bằng nhau giữa 16 con (lệch ${lech.toExponential(3)}) — cấu tạo Axie đang bán sức mạnh`);
  else pass(`kỳ vọng trên cả 9 lớp quái bằng nhau chính xác cho cả 16 con (lệch ${lech.toExponential(1)})`);

  // ── ③ NHƯNG NÓ PHẢI CÓ TÁC DỤNG — đo trên ĐÀN QUÁI THẬT của từng vùng ───────────────
  //
  // ② một mình xanh kể cả khi cơ chế tắt hẳn. ③ là vế kia: con thuần phải dao động mạnh hơn
  // con tạp KHI ĐI QUA CÁC VÙNG THẬT, nơi dân số không bao giờ đều chín lớp (chặng 3 làm mỗi
  // vùng có một lớp trội 65–100%).
  const r3 = await page.evaluate(() => {
    // Phân bố lớp quái thật của một map, suy từ chính `packsOf` — không chép cứng bảng nào.
    const phanBo = (id) => {
      const d = {}; let tong = 0;
      for (const q of packsOf(id)){
        const def = MOBS[q.mob]; if (!def) continue;
        const he = q.he || def.el; if (!he) continue;
        const n = q.n || 5; d[he] = (d[he] || 0) + n; tong += n;
      }
      return tong ? { d, tong } : null;
    };
    const vung = Object.keys(MAPS).filter(id => { const pb = phanBo(id); return pb && pb.tong > 0; });
    const out = [];
    for (const c of CHIMERA){
      const sac = bpSac(bpCung(c));
      const theoVung = [];
      for (const id of vung){
        const { d, tong } = phanBo(id);
        let s = 0;
        for (const he in d) s += heThuKet(he, c.lop, sac).mul * d[he];
        theoVung.push(s / tong);
      }
      out.push({ id: c.id, cung: bpCung(c), lop: c.lop,
                 min: Math.min(...theoVung), max: Math.max(...theoVung) });
    }
    return { soVung: vung.length, out };
  });
  const bien = x => (x.max - x.min) / x.min * 100;   // chênh % giữa vùng dễ thở nhất và ngặt nhất
  const thuan = r3.out.filter(x => x.cung >= 5), tap = r3.out.filter(x => x.cung <= 2);
  const tbT = thuan.reduce((a, x) => a + bien(x), 0) / thuan.length;
  const tbP = tap.reduce((a, x) => a + bien(x), 0) / tap.length;
  console.log(`  ③ ${r3.soVung} vùng · chênh vùng-dễ/vùng-ngặt — thuần ${tbT.toFixed(1)}% (${thuan.length} con) · tạp ${tbP.toFixed(1)}% (${tap.length} con)`);
  for (const x of r3.out.sort((a, b) => b.cung - a.cung).slice(0, 3).concat(r3.out.slice(-2)))
    console.log(`     ${x.id.padEnd(11)} ${x.lop.padEnd(8)} ${x.cung}/6 → ${bien(x).toFixed(1)}%`);
  if (!thuan.length || !tap.length) fail('③ không dựng được cảnh đo: thiếu con thuần hoặc con tạp');
  else if (!(tbT > tbP * 1.5))
    fail(`③ con thuần (${tbT.toFixed(1)}%) không dao động mạnh hơn hẳn con tạp (${tbP.toFixed(1)}%) — cấu tạo chưa đổi được gì`);
  else pass(`con thuần dao động ${(tbT / tbP).toFixed(2)}× con tạp khi đi qua ${r3.soVung} vùng thật`);

  // ── ④ TẦNG HÀNH VI: lái qua chính `update()` và đo MÁU MẤT THẬT ─────────────────────
  //
  // ② và ③ hỏi `heThuKet`. Chỗ hỏng thật thì thường không nằm ở hàm mà ở SỢI DÂY nối nó vào
  // đường sát thương — `hurtPlayer` có truyền `axieSac(player)` không. Bỏ tham số đó đi là cả
  // hai mệnh đề trên vẫn xanh trong khi trong game không đổi lấy một điểm máu.
  //
  // ⚠ ĐO CẢ HAI CHIỀU, và đây là chỗ bài kiểm bản đầu tự bắt lỗi của chính nó: tôi dựng đàn quái
  // bằng `heKhacLai(heThu(player))[0]` — tức lớp KHẮC người chơi, nhánh BẤT LỢI — rồi chấm như
  // thể đó là nhánh có lợi, nên con sắc hơn mất nhiều máu hơn và bài báo "đường sát thương không
  // đọc cấu tạo" trong khi nó đọc hoàn hảo. Một chiều thì một lỗi DẤU cũng lọt; hai chiều thì
  // không, vì dấu sai làm đúng một trong hai vế đỏ.
  const r4 = await page.evaluate(async () => {
    const doCon = (id, coLoi) => {
      window.TEST_MODE = true; startGame('thieulam', null);
      player.level = 40; player.free = 0; player.reflect = 0; calcDerived();
      travelTo('chungnam');
      chiNhan(id); player.avatar = id; calcDerived();
      player.hp = player.maxHp;
      const m = mobs.find(x => x && x.hp > 0);
      if (!m) return null;
      const me = heThu(player);
      // coLoi: lớp mà NGƯỜI CHƠI khắc ⇒ chịu đòn nhẹ hơn. Ngược lại: lớp khắc người chơi.
      const he = coLoi ? ELEMENTS.filter(k => heKhac(me, k))[0] : heKhacLai(me)[0];
      m.def = Object.assign({}, m.def, { lv:40, atk:400, atkCd:0.01, range:200 });
      // Ghim cả map, không ghim một con (vết sẹo ở `test_hethu §7`).
      for (const x of mobs) if (x) x.he = he;
      let mat = 0;
      for (let i = 0; i < 900; i++){
        // ⚠ GIỮ ĐÚNG MỘT NGUỒN SÁT THƯƠNG. Cả bãi quái vẫn đánh vào, mỗi con một chỉ số riêng,
        // và chỗ chúng đứng thì bốc lại mỗi lần `travelTo` — nên phần máu mất KHÔNG mang hệ số
        // cấu tạo bị trộn vào theo một tỉ lệ khác nhau ở mỗi lượt đo. Đó là thứ đã làm mục này
        // đỏ 1/3 lượt trong khi cơ chế chạy đúng.
        if (mobs.length !== 1){ mobs.length = 0; mobs.push(m); }
        m.x = player.x + 26; m.y = player.y;
        m.hp = m.maxHp = 9e8; m.dead = false; m.aggro = 9999; m.target = player;
        const truoc = player.hp;
        update(1 / 60);
        if (player.hp < truoc) mat += truoc - player.hp;
        player.hp = player.maxHp; player.dead = false;
      }
      return { mat, sac: axieSac(player), he, ket: heThuKet(he, me, axieSac(player)).ket };
    };
    // ⚠ CÙNG LỚP, VÀ CÁCH NHAU THẬT XA VỀ CẤU TẠO. Cùng lớp là cố ý — khác lớp thì không tách
    // được "do cấu tạo" với "do gặp đàn quái khác". Còn xa nhau là bài học phải trả giá: bản
    // đầu dùng netherfang 3/6 (sắc 0,98) vs inkmane 1/6 (0,63), chênh lý thuyết chỉ ~4% trong
    // khi mỗi đòn mang rnd(0.85,1.15) — tín hiệu xấp xỉ nhiễu, và mục này đỏ 1/3 lượt.
    // Reptile là cặp xa nhất trong bảng: ironshell 6/6 (1,50) vs ridgehorn 2/6 (0,80) ⇒ ~8%.
    return { loiSac: doCon('ironshell', true),  loiTap: doCon('ridgehorn', true),
             haiSac: doCon('ironshell', false), haiTap: doCon('ridgehorn', false) };
  });
  console.log('  ④', JSON.stringify(r4));
  const ok4 = Object.values(r4).every(x => x && x.mat);
  if (!ok4) fail('④ không dựng được cảnh đo: ' + JSON.stringify(r4));
  else if (r4.loiSac.sac <= r4.loiTap.sac) fail('④ cảnh dựng sai — con chọn làm "sắc hơn" lại không sắc hơn');
  else if (r4.loiSac.ket !== 1 || r4.haiSac.ket !== -1)
    fail(`④ cảnh dựng sai — nhánh không đúng chiều (có lợi ket=${r4.loiSac.ket}, bất lợi ket=${r4.haiSac.ket})`);
  // Ngưỡng 3% trên tín hiệu lý thuyết ~8%: mỗi đòn quái vẫn mang rnd(0.85,1.15), nên đòi khớp
  // chằn chặn là đỏ theo xúc xắc — nhưng chừa quá rộng thì nó không còn gác gì.
  else if (!(r4.loiSac.mat < r4.loiTap.mat * 0.97))
    fail(`④ nhánh CÓ LỢI: con sắc hơn phải mất ít máu hơn — ${r4.loiSac.mat} vs ${r4.loiTap.mat}`);
  else if (!(r4.haiSac.mat > r4.haiTap.mat * 1.03))
    fail(`④ nhánh BẤT LỢI: con sắc hơn phải mất nhiều máu hơn — ${r4.haiSac.mat} vs ${r4.haiTap.mat}`);
  else pass(`máu mất thật đọc đúng cấu tạo ở CẢ HAI chiều — có lợi ${r4.loiSac.mat}<${r4.loiTap.mat} · bất lợi ${r4.haiSac.mat}>${r4.haiTap.mat}`);

  // ── ⑤ VẪN LÀ 0 CHỈ SỐ — cấu tạo không được rò một điểm nào vào `calcDerived` ─────────
  const r5 = await page.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    player.level = 60; player.free = 0; calcDerived();
    const doc = () => ['atk','maxHp','maxMp','def','crit','eva','speed','aspd']
      .map(k => Math.round((player[k] || 0) * 1000)).join('|');
    const bang = {};
    for (const c of CHIMERA){ chiNhan(c.id); player.avatar = c.id; calcDerived(); bang[c.id] = doc(); }
    const v = Object.values(bang);
    return { khac: v.filter(x => x !== v[0]).length, mau: v[0] };
  });
  if (r5.khac) fail(`⑤ đổi Axie làm đổi ${r5.khac}/16 bộ chỉ số — cấu tạo đã rò thành chỉ số`);
  else pass('cả 16 con: đổi Axie vẫn đổi đúng 0 điểm chỉ số (cấu tạo là QUAN HỆ, không phải nấc thang)');

  // ── ⑥ PHẢI NÓI RA — cơ chế vô hình là cơ chế không tồn tại ──────────────────────────
  // Hỏi DOM, không hỏi chuỗi `innerHTML`: một khối bị CSS giấu vẫn có mặt trong chuỗi.
  const r6 = await page.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    // ⚠ TỰ KIỂM CẢNH DỰNG: `renderMount` khoá dưới cấp 6 và trả về một câu "Khế Ước mở khóa ở
    // cấp 6". Nhân vật vừa tạo là cấp 1, nên bản đầu của mục này đo trên đúng cái câu đó rồi
    // báo "danh sách Axie không nói cấu tạo" — bài đỏ vì một lý do chẳng liên quan gì tới thứ
    // nó định gác. Nâng cấp TRƯỚC, và khẳng định ra bảng đúng trước khi chấm.
    player.level = 60; player.lvPeak = 60;
    chiNhan('hexmite'); player.avatar = 'hexmite'; calcDerived();
    renderChar();
    const tNv = (typeof CE === 'function' && CE() ? CE().innerText : '') || '';
    chiNhan('coghound');
    renderMount();
    const tDs = (typeof CE === 'function' && CE() ? CE().innerText : '') || '';
    return { nvCoCauTao: /Cấu tạo Axie/.test(tNv), nvCoHang: /Thuần\s*6\/6/.test(tNv),
             dsMoDuoc: /ĐANG CÓ/.test(tDs),
             dsCoHang: /Thuần|Tạp|Pha/.test(tDs), dsChepCung: /12%|10%/.test(tDs) };
  });
  console.log('  ⑥', JSON.stringify(r6));
  if (!r6.nvCoCauTao) fail('⑥ bảng Nhân Vật không in dòng "Cấu tạo Axie" — người chơi không có cửa nào biết cơ chế tồn tại');
  else if (!r6.nvCoHang) fail('⑥ bảng Nhân Vật in nhãn nhưng không in HẠNG + số bộ phận');
  else if (!r6.dsMoDuoc) fail('⑥ cảnh dựng sai — không mở được danh sách Axie (bảng còn đang khoá)');
  else if (!r6.dsCoHang) fail('⑥ danh sách Axie không nói cấu tạo của từng con');
  // ⚠ Chép cứng "12% / 10%" nay là lời NÓI DỐI: hệ số phụ thuộc cấu tạo, dải thật rộng hơn hẳn.
  else if (r6.dsChepCung) fail('⑥ danh sách Axie còn chép cứng 12%/10% — bảng hứa một đằng, đòn đánh ra một nẻo');
  else pass('cả bảng Nhân Vật lẫn danh sách Axie đều nói ra cấu tạo, và không còn con số chép cứng');

  console.log('errors:', JSON.stringify(errors.slice(0, 6)));
  if (errors.length) fail(`${errors.length} lỗi JS trong lúc chạy`);
  await browser.close();
  if (bad){ console.log(`FAIL(${bad})`); process.exit(1); }
  console.log('PASS');
})();
