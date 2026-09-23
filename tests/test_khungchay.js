// Khối CHẠY nay khai số khung THEO TỪNG BỘ (NV_KHUNG_R): bộ nướng lại từ gói Spine gốc có 32
// khung, bộ chưa có gói giữ 16. Hai đời phải chạy song song được trong cùng một trận, và —
// chỗ nguy hiểm thật — trong cùng MỘT KHUNG HÌNH, vì một nhân vật có thể mặc giáp của bộ 16
// khung trên thân của bộ 32 khung. Lấy chung một chỉ số như bản trước thì lớp 16 khung nhận
// chỉ số tới 31, chia dư ra thành đi ngược nửa vòng — tay rời khỏi thân.
const { chromium } = require('playwright');
const CONG = process.argv[2] || '8000';
let bad = 0;
const fail = m => { bad++; console.log('FAIL ' + m); };
const pass = m => console.log('PASS ' + m);

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 760 } });
  const loi = []; p.on('pageerror', e => loi.push(String(e)));
  await p.goto(`http://localhost:${CONG}/index.html`);
  await p.waitForFunction(() => window.__gameReady).catch(() => {});
  await p.waitForTimeout(700);

  // ── ① Bảng khai số khung ───────────────────────────────────────────────────────────────
  const r1 = await p.evaluate(() => ({
    co:     typeof nvSoKhung === 'function',
    dwsc1r: nvSoKhung('dwsc1', 'r'), dkcw1r: nvSoKhung('dkcw1', 'r'),
    elfar1r:nvSoKhung('elfar1','r'), dlcm1r: nvSoKhung('dlcm1', 'r'),
    // ⚠ `sbhd1` ĐÃ GỠ cùng đợt Spellblade sang gói `magic-runtime`. Thay bằng một tên KHÔNG
    // BAO GIỜ tồn tại: ca mà mệnh đề này thật sự muốn gác là "bộ không khai riêng thì lui về
    // 16", và một tên bịa gác đúng ca ấy mà không cột bài vào một bộ art có thể bị gỡ.
    boLa: nvSoKhung('bo_khong_co_that', 'r'), dwvt1r: nvSoKhung('dwvt1', 'r'),
    khongTen: nvSoKhung(null, 'r'),
    // khối KHÁC khối chạy thì mọi bộ phải giống nhau — nếu không là đụng vào chỗ không cần đụng
    dwsc1w: nvSoKhung('dwsc1', 'w'), boLaW: nvSoKhung('bo_khong_co_that', 'w'),
    dwsc1i: nvSoKhung('dwsc1', 'i'), boLaI: nvSoKhung('bo_khong_co_that', 'i'),
    moc: NV_MOC.r
  }));
  console.log('① bảng khung:', JSON.stringify(r1));
  if (!r1.co) fail('không có nvSoKhung() — số khung chưa gom về một chỗ');
  else pass('có nvSoKhung() dùng chung');
  const moi = [r1.dwsc1r, r1.dkcw1r, r1.elfar1r, r1.dlcm1r];
  if (moi.some(v => v !== 32)) fail(`bốn bộ đã nướng lại phải 32 khung chạy, đang ${JSON.stringify(moi)}`);
  else pass('dkcw1 · dwsc1 · elfar1 · dlcm1 → 32 khung chạy');
  if (r1.boLa !== 16 || r1.dwvt1r !== 16 || r1.khongTen !== 16)
    fail(`bộ chưa nướng lại phải giữ 16 khung, đang bộ-lạ=${r1.boLa} dwvt1=${r1.dwvt1r} không-tên=${r1.khongTen}`);
  else pass('bộ lạ · dwvt1 · không rõ tên → giữ 16 khung');
  if (r1.dwsc1w !== r1.boLaW || r1.dwsc1i !== r1.boLaI)
    fail('khối ĐI/ĐỨNG khác nhau giữa hai bộ — chỉ khối chạy được phép khai riêng');
  else pass('khối đi và đứng vẫn dùng chung số khung');
  if (r1.moc !== 80) fail(`mốc khối chạy đổi thành ${r1.moc} — phải giữ 80 cho cả hai đời`);
  else pass('mốc khối chạy vẫn ở ô 80, hai đời không lệch mốc');
  // ── ② Bộ khai N khung chạy thì phải VẼ RA N tư thế THẬT ───────────────────────────────
  // Nếu luật cũ (16 khung) còn sót ở đâu đó thì khung 16..31 hoặc rỗng (đọc quá đáy ảnh)
  // hoặc trùng khít khung 0..15 (do `idx % 16`). Bắt cả hai bằng cách băm điểm ảnh.
  //
  // ⚠⚠ CHỌN LỚP TỪ DỮ LIỆU, ĐỪNG CHÉP CỨNG 'baidasan'. Bản cũ đo Dark Wizard và đòi 32 tư
  // thế, đúng hồi lớp ấy dùng `dwsc1`. Nay Dark Wizard dùng `dwsl1` — thân dựng từ ảnh render,
  // `NV_KHUNG_R` khai thẳng là **8** khung — nên đòi 32 thì chỉ số cuộn vòng, ra đúng 8 tư thế
  // và nửa sau trùng khít nửa trước. Bài báo "luật 16 khung còn sót" trong khi mã hoàn toàn
  // đúng và dữ liệu cũng đúng. *Một bài kiểm chép cứng tên lớp là một bài kiểm sẽ mục vào
  // đúng ngày lớp ấy đổi bộ art — mà đổi bộ art là việc xảy ra thường xuyên ở đây.*
  const bam = async (sect, blk, n) => await p.evaluate(async ([sect, blk, n]) => {
    // ⚠⚠ ĐẶT `TEST_MODE` TRƯỚC `startGame`, nếu không `phatDoKhoiDau()` phát bộ giai 7 cho
    // nhân vật mới — và `gearVisual().oLop` sẽ trỏ vào bộ giai 7 trong khi bài ép `tier = 1`.
    // Hai thứ lệch nhau thì `nvKhungGop()` không ghép được lớp nào và thân vẽ ra TRỐNG TRƠN:
    // đo được thieulam ra 32/32 khung rỗng, tức bài báo "đọc quá đáy bảng khung" trong khi
    // mã hoàn toàn đúng. Đặt cờ rồi thì cùng khung ấy ra 581 điểm ảnh đặc.
    // Bốn lớp kia không lộ ra vì bộ của chúng không đi đường lớp rời ở giai 7.
    window.TEST_MODE = true;
    startGame(sect, null);
    await new Promise(r => setTimeout(r, 500));
    const ra = [];
    for (let i = 0; i < n; i++){
      // ⚠ ÉP `t:1`, đừng tin đồ mặc định. Nhân vật mới nay được phát sẵn bộ giai 7
      // (xem DEMO_DO_GIAI), mà bộ GỘP đời cũ thì `nvKhungGop()` cố ý trả null.
      const _gv = Object.assign({}, gearVisual(player), { t: 1, plus: 0 });
      const s = heroSprite(player.sect, 1, _gv, blk, i, 'a', false, 0, blk);
      if (!s) { ra.push('null'); continue; }
      const c = document.createElement('canvas');
      c.width = s.width; c.height = s.height;
      const q = c.getContext('2d'); q.drawImage(s, 0, 0);
      const d = q.getImageData(0, 0, c.width, c.height).data;
      let h = 0, dac = 0;
      for (let k = 3; k < d.length; k += 40){ if (d[k] > 8) dac++; h = (h * 31 + d[k] + d[k-3]) | 0; }
      ra.push(dac < 40 ? 'rong' : String(h));
    }
    return ra;
  }, [sect, blk, n]);

  // ⚠ CHỜ GÓI `magic-runtime` VỀ TRƯỚC KHI HỎI. `mrDung()` trả false tới khi manifest+sockets
  // tải xong; hỏi sớm thì lớp dùng gói bị xếp nhầm sang nhánh `NV_BO` và bài đỏ ở một chỗ
  // không hỏng gì. `startGame` đã xin sớm giúp, nhưng mạng vẫn cần vài trăm mili giây.
  await p.evaluate(() => { window.TEST_MODE = true; for (const s of Object.keys(SECTS)) if (window.MR_LOP && MR_LOP[s]) startGame(s, null); });
  await p.waitForFunction(() => !window.MR_LOP || Object.keys(MR_LOP).every(s => mrDung(s)),
                          null, { timeout: 15000 }).catch(() => {});

  const boCua = await p.evaluate(() => {
    const gv = { t: 1, plus: 0 }, ra = {};
    for (const s of Object.keys(SECTS)){
      // ⚠ LỚP DÙNG GÓI `magic-runtime` KHÔNG CÓ BỘ `NV_BO` NÀO. Hỏi `nvBoGoc` ở đó trả
      // undefined và `nvSoKhung` lui về 16, nên bài đòi 16 tư thế từ một gói chỉ có 8 và ĐỎ ở
      // một chỗ không hỏng gì. Hỏi đúng cửa của gói: `mrDung()` + `MR_COT`.
      if (window.mrDung && mrDung(s)){ ra[s] = { bo: 'magic-runtime', n: MR_COT, mr: true }; continue; }
      const bo = nvBoGoc(s, 1, gv); ra[s] = { bo, n: nvSoKhung(bo, 'r') };
    }
    return ra;
  });
  console.log('② bộ thân của từng lớp:', JSON.stringify(boCua));

  // ⓐ MỌI lớp: khai bao nhiêu khung thì phải vẽ ra bấy nhiêu tư thế, không rỗng.
  for (const [lop, d] of Object.entries(boCua)){
    const h = await bam(lop, 'r', d.n);
    const rong = h.filter(v => v === 'rong' || v === 'null').length;
    const rieng = new Set(h).size;
    const san = Math.ceil(d.n * 0.75);
    console.log(`②ⓐ ${lop} (${d.bo}, khai ${d.n}): rỗng=${rong} · khác nhau=${rieng}`);
    if (rong) fail(`${lop}/${d.bo}: ${rong}/${d.n} khung chạy vẽ ra RỖNG — đang đọc quá đáy bảng khung`);
    else if (rieng < san) fail(`${lop}/${d.bo}: chỉ ${rieng}/${d.n} khung khác nhau (cần ≥${san}) — bảng khung không đủ tư thế`);
    else pass(`${lop}/${d.bo}: ${rieng}/${d.n} khung chạy đều có hình và khác nhau`);
  }

  // ⓑ Lớp nào khai ≥32 thì nửa sau vòng chạy phải là tư thế MỚI — đây mới là mệnh đề bắt
  //    được "luật 16 khung còn sót". Chọn bộ khai NHIỀU khung nhất, cũng suy từ dữ liệu.
  const lop32 = Object.entries(boCua).filter(([, d]) => d.n >= 32).sort((a, b) => b[1].n - a[1].n)[0];
  if (!lop32) fail('không lớp nào còn khai ≥32 khung chạy — mệnh đề "nửa sau phải mới" hết chỗ đo');
  else {
    const [lop, d] = lop32;
    const h = await bam(lop, 'r', d.n);
    const nua = d.n >> 1;
    const trungNua = h.slice(nua).filter((v, i) => v === h[i]).length;
    console.log(`②ⓑ ${lop} (${d.bo}, ${d.n} khung): nửa sau trùng nửa trước=${trungNua}/${nua}`);
    if (trungNua > 2) fail(`${lop}/${d.bo}: ${trungNua}/${nua} khung nửa sau trùng khít nửa trước — luật 16 khung còn sót, idx đang bị chia dư`);
    else pass(`${lop}/${d.bo}: nửa sau vòng chạy là ${nua} tư thế MỚI, không phải lặp lại nửa trước`);
  }

  // ── ③ Gói `magic-runtime`: TÁM HƯỚNG phải ra TÁM tư thế khác nhau ─────────────────────
  // Mệnh đề cũ ở đây đo "bộ CHƯA nướng lại (sbhd1, 16 khung) vẫn chạy" — bộ ấy đã gỡ cùng đợt
  // Spellblade sang gói mới, nên nó hết chỗ đo. Thứ thay nó là tính chất MỚI mà gói mang tới và
  // chưa bài nào gác: hướng nằm theo HÀNG trong atlas, nên tra nhầm hàng là nhân vật quay sai
  // mà KHÔNG một lỗi nào in ra. Đo ở khối ĐỨNG (tư thế ổn định nhất) và đòi cả 8 hàng khác nhau.
  const lopMR = Object.entries(boCua).filter(([, d]) => d.mr).map(([k]) => k);
  if (!lopMR.length) console.log('③ (bỏ qua — chưa lớp nào dùng gói magic-runtime)');
  for (const lop of lopMR){
    const h8 = await p.evaluate(async (lop) => {
      window.TEST_MODE = true; startGame(lop, null);
      await new Promise(r => setTimeout(r, 2500));
      const gv = Object.assign({}, gearVisual(player), { t: 1, plus: 0 });
      const ra = [];
      for (let h = 0; h < 8; h++){
        const s = heroSprite(lop, 1, gv, 'i', 0, 'a', false, 0, 'i', '', h);
        if (!s) { ra.push('null'); continue; }
        const c = document.createElement('canvas'); c.width = s.width; c.height = s.height;
        const q = c.getContext('2d'); q.drawImage(s, 0, 0);
        const d = q.getImageData(0, 0, c.width, c.height).data;
        let x = 0, dac = 0;
        for (let k = 3; k < d.length; k += 40){ if (d[k] > 8) dac++; x = (x * 31 + d[k] + d[k-3]) | 0; }
        ra.push(dac < 40 ? 'rong' : String(x));
      }
      return ra;
    }, lop);
    const rong8 = h8.filter(v => v === 'rong' || v === 'null').length;
    console.log(`③ ${lop} (magic-runtime): rỗng=${rong8}/8 · hướng khác nhau=${new Set(h8).size}/8`);
    if (rong8) fail(`③ ${lop}: ${rong8}/8 hướng vẽ ra RỖNG — atlas chưa về hoặc tra sai hàng`);
    else if (new Set(h8).size < 7)
      fail(`③ ${lop}: chỉ ${new Set(h8).size}/8 hướng khác nhau — đang đọc trùng hàng trong atlas`);
    else pass(`③ ${lop}: 8 hướng ra 8 tư thế khác nhau`);
  }

  // ── ④ CHỖ NGUY HIỂM: thân 32 khung đội giáp 16 khung, trong cùng một khung hình ────────
  // nvKhungGop phải quy về PHA rồi mới nhân với số khung của từng lớp. Nếu nó lấy chung một
  // chỉ số thì lớp giáp 16 khung nhận chỉ số 16..31 → đọc ô 96..111, mà bảng của nó chỉ có
  // 96 ô (6 hàng) → cắt ra ngoài đáy ảnh → LỚP ÁO BIẾN MẤT nửa vòng chạy.
  //
  // ⚠ ĐỪNG đo bằng "khung có rỗng không". Bản đầu tôi viết đúng như thế và nó XANH cả trên
  // mã đã phá: thiếu mỗi lớp áo thì khung gộp vẫn còn thân, còn chân, còn hai tay — không hề
  // rỗng. Phải đo LƯỢNG điểm ảnh đục của nửa sau so với nửa trước.
  //
  // Đo thật trên hai bản để đặt ngưỡng, không phỏng đoán:
  //     mã đúng  → nửa sau / nửa trước = 0,935   (chênh tự nhiên do tư thế)
  //     mã phá   → 0,648                          (mất hẳn một tấm áo)
  // Ngưỡng 0,85 nằm giữa hai con số đó, cách mỗi bên một khoảng rộng.
  const r4 = await p.evaluate(async () => {
    startGame('baidasan', null);
    await new Promise(r => setTimeout(r, 500));
    // ép ô `ao` lấy từ dwvt1 (bộ 16 khung) còn thân vẫn dwsc1 (32 khung)
    // `t:1` vì lý do y hệt mục ②: giai 7 của Dark Wizard là bộ GỘP dwsm1, mà nvKhungGop()
    // thoát ngay ở dòng đầu khi gặp bộ gộp — ca trộn hai đời sẽ không bao giờ dựng được.
    const gv = Object.assign({}, gearVisual(player), { t: 1, plus: 0 });
    gv.oLop = Object.assign({}, gv.oLop, { ao: 'dwvt1' });
    // nvTai() là bộ nạp LƯỜI: gọi lần đầu chỉ khởi động tải rồi trả null. Gọi một lượt cho
    // nó bắt đầu tải, đợi ảnh về, rồi mới đo — không thì bài kiểm đo đúng lúc chưa có gì.
    for (let k = 0; k < 3; k++) nvKhungGop('baidasan', 1, gv, 'r', 0);
    for (let cho = 0; cho < 60; cho++){
      if (nvKhungGop('baidasan', 1, gv, 'r', 0)) break;
      await new Promise(r => setTimeout(r, 100));
    }
    const ds = [];
    for (let i = 0; i < 32; i++){
      const c = nvKhungGop('baidasan', 1, gv, 'r', i);
      if (!c) { ds.push(-1); continue; }
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let dac = 0; for (let k = 3; k < d.length; k += 4) if (d[k] > 8) dac++;
      ds.push(dac);
    }
    return { ds, coDwvt1: !!NV_LOP_HOP['dwvt1'] };
  });
  const tb = x => x.reduce((s, v) => s + v, 0) / x.length;
  const truoc = tb(r4.ds.slice(0, 16)), sau = tb(r4.ds.slice(16));
  const ti = truoc > 0 ? sau / truoc : 0;
  console.log(`④ thân 32 khung + ô áo từ dwvt1 (16 khung): nửa trước ${truoc | 0} điểm ảnh · nửa sau ${sau | 0} · tỉ lệ ${ti.toFixed(3)}`);
  if (!r4.coDwvt1) fail('dwvt1 không còn trong NV_LOP_HOP — bài kiểm dựng sai, không đo được ca trộn');
  else if (r4.ds.some(v => v < 0)) fail('nvKhungGop trả null ở ca trộn hai đời — không chồng được lớp');
  else if (ti < 0.85)
    fail(`nửa sau vòng chạy chỉ còn ${(ti * 100).toFixed(0)}% điểm ảnh của nửa trước — lớp giáp ` +
         '16 khung đang đọc quá đáy bảng của nó và biến mất, tức chỉ số chưa quy về pha');
  else pass(`thân 32 khung và giáp 16 khung giữ nguyên đủ lớp suốt vòng chạy (tỉ lệ ${ti.toFixed(3)})`);

  console.log('lỗi trang:', JSON.stringify(loi.slice(0, 4)));
  if (loi.length) fail(loi.length + ' lỗi runtime');
  await b.close();
  console.log(bad ? `FAIL(${bad})` : 'ALL PASS');
  process.exit(bad ? 1 : 0);
})();
