// BẢNG BẢN ĐỒ — tab THẾ GIỚI và tab HIỆN TẠI.
//
// Tấm bản đồ thế giới dựng TỪ DỮ LIỆU ĐANG CHẠY (hình vùng ← `diTrong`, màu ← `ground`, cỡ ←
// `w×h`, đường nối ← `GATES`, khoá ← `mapGate`), nên thứ duy nhất đặt tay là mười hai chỗ đứng
// trong `THE_GIOI`. Bài này gác đúng cái phần đặt tay ấy, cộng một tầng hành vi.
//
//   1. Mọi vùng ngoài trời đều có chỗ đứng — thiếu một cái là nó biến mất khỏi bản đồ, im lặng.
//   2. ⭐ HƯỚNG TRÊN BIỂN CỔNG PHẢI KHỚP HƯỚNG THẬT. Biển trong map ghi "Lối Bắc → X" mà trên
//      bản đồ X nằm phía đông thì bản đồ và biển chỉ đường đang cãi nhau trước mặt người chơi.
//      Đây là mệnh đề đắt nhất của bài: nó ép hai thứ vốn không có gì buộc phải khớp.
//   3. Không hai vùng nào đè lên nhau.
//   4. Vùng VÀ NHÃN của nó nằm trọn trong khung — nhãn bị cắt là một cái tên khác.
//   5. Mọi cặp cổng trong `GATES` đều thành một con đường trên bản đồ.
//   6. Lá cờ "đang ở đây" bám đúng `curMap`.
//   7. Bấm vào vùng khoá KHÔNG dịch chuyển; vùng mở thì có. Cùng luật với nút trong danh sách.
//   8. TẦNG HÀNH VI: cả hai tab phải VẼ RA THẬT, và bộ lọc phải đổi được hình. Đối chiếu tên
//      không bắt được canvas trắng — đúng bài học `ISO_NEO` (dữ liệu đủ, hàm vẽ `return` sớm,
//      sáu map trống trơn mà không bài nào đỏ).
const { chromium } = require('playwright');
let bad = 0; const fail = m => { bad++; console.log('FAIL ' + m); };
(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport:{width:1440,height:960} });
  const errs = []; p.on('pageerror', e => errs.push(String(e).split('\n')[0]));
  await p.goto('http://localhost:8853/index.html?max=1', { waitUntil:'load' });
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', null); });
  await p.waitForTimeout(900);

  // ---- 1. đủ vùng ----
  const r1 = await p.evaluate(() => {
    const canCo = Object.keys(MAPS).filter(k => !MAPS[k].dungeon);
    const co = Object.keys(THE_GIOI);
    return { thieu: canCo.filter(k => !THE_GIOI[k]), thua: co.filter(k => !MAPS[k] || MAPS[k].dungeon),
      soVung: Object.keys(tgBoCuc()).length };
  });
  console.log('1) chỗ đứng:', JSON.stringify(r1));
  if (r1.thieu.length) fail(`① ${r1.thieu.length} vùng KHÔNG có chỗ đứng ⇒ biến mất khỏi bản đồ: ${r1.thieu.join(', ')}`);
  if (r1.thua.length) fail(`① THE_GIOI khai vùng không tồn tại (hoặc là phó bản): ${r1.thua.join(', ')}`);

  // ---- 2. hướng biển cổng khớp hướng thật ----
  const r2 = await p.evaluate(() => {
    const xau = [], ok = [];
    for (const g of GATES){
      const m = (g.name || '').match(/(Cổng|Lối)\s+(Bắc|Nam|Đông|Tây)/);
      if (!m) continue;                                  // "Lối Về Thành", "Qua Cổng Thành" — không hứa hướng
      if (!THE_GIOI[g.map] || !THE_GIOI[g.to]) continue;
      const that = tgHuong(g.map, g.to);
      const dong = `${g.map}→${g.to} biển "${m[2]}" · bản đồ "${that}"`;
      if (that === m[2]) ok.push(dong); else xau.push(dong);
    }
    return { ok: ok.length, xau };
  });
  console.log(`2) hướng biển cổng: ${r2.ok} khớp, ${r2.xau.length} lệch`);
  for (const x of r2.xau) console.log('   ✗ ' + x);
  if (r2.xau.length) fail(`② ${r2.xau.length} biển cổng ghi một hướng mà bản đồ vẽ hướng khác — người chơi đọc biển xong nhìn bản đồ là thấy ngay`);
  if (r2.ok < 10) fail(`② chỉ ${r2.ok} cạnh có hướng để đối chiếu — bài kiểm này gần như không kiểm gì`);

  // ---- 3 + 4. không chồng nhau, và nằm trọn trong khung ----
  const r3 = await p.evaluate(() => {
    const bc = tgBoCuc(), ids = Object.keys(bc), de = [], tran = [];
    for (let i = 0; i < ids.length; i++) for (let j = i+1; j < ids.length; j++){
      const A = bc[ids[i]], B = bc[ids[j]];
      const d = Math.hypot(A.cx-B.cx, A.cy-B.cy);
      if (d < (A.r + B.r) * 0.92) de.push(`${ids[i]}↔${ids[j]} ${Math.round(d)}px < ${Math.round((A.r+B.r)*0.92)}px`);
    }
    for (const id of ids){
      const o = bc[id];
      // nhãn vẽ tới `cy + r + 24` và cao ~8px ⇒ mép dưới thật là +32
      if (o.cx - o.r < 0 || o.cx + o.r > TG_KHUNG.w || o.cy - o.r < 0 || o.cy + o.r + 32 > TG_KHUNG.h)
        tran.push(`${id} (${Math.round(o.cx)},${Math.round(o.cy)}) r=${Math.round(o.r)}`);
    }
    return { de, tran, khung:`${TG_KHUNG.w}x${TG_KHUNG.h}` };
  });
  console.log('3) chồng/tràn:', JSON.stringify(r3));
  if (r3.de.length) fail(`③ ${r3.de.length} cặp vùng đè lên nhau: ${r3.de.join(' · ')}`);
  if (r3.tran.length) fail(`④ ${r3.tran.length} vùng tràn khỏi khung ${r3.khung}: ${r3.tran.join(' · ')}`);

  // ---- 5. mọi cặp cổng thành một con đường ----
  const r5 = await p.evaluate(() => {
    const canh = new Set(tgCanh().map(c => c.a < c.b ? c.a+'|'+c.b : c.b+'|'+c.a));
    const thieu = [];
    for (const g of GATES){
      if (!THE_GIOI[g.map] || !THE_GIOI[g.to]) continue;
      const k = g.map < g.to ? g.map+'|'+g.to : g.to+'|'+g.map;
      if (!canh.has(k)) thieu.push(k);
    }
    return { soCanh: canh.size, thieu:[...new Set(thieu)] };
  });
  console.log('5) đường nối:', JSON.stringify(r5));
  if (r5.thieu.length) fail(`⑤ ${r5.thieu.length} cặp cổng không có đường trên bản đồ: ${r5.thieu.join(', ')}`);

  // ---- 6. cờ bám đúng map đang đứng ----
  const r6 = await p.evaluate(() => {
    const ra = [];
    for (const m of ['ardhaven','comoc','nhanmon']){
      travelTo(m);
      ra.push({ m, coCho: !!tgBoCuc()[curMap], curMap });
    }
    return ra;
  });
  console.log('6) cờ theo map:', JSON.stringify(r6));
  for (const o of r6){
    if (o.curMap !== o.m) fail(`⑥ travelTo('${o.m}') mà curMap ra '${o.curMap}'`);
    if (!o.coCho) fail(`⑥ ${o.m} không có chỗ trên bản đồ ⇒ không vẽ được lá cờ "đang ở đây"`);
  }

  // ---- 7. bấm vào vùng = MỞ THẺ, không phải đi thẳng ----
  // Đây là một quyết định thiết kế, nên nó cần một mệnh đề: bấm để XEM rồi bị quăng sang map
  // khác là hỏng đúng cái việc người ta vừa định làm.
  const r7 = await p.evaluate(() => {
    window.TEST_MODE = false;
    travelTo('ardhaven');
    player.level = 1; player.wpUnlocked = { ardhaven:1 };
    const truoc = curMap;
    tgChon('nhanmon');
    const sauBam = curMap, the = _ttChon;
    const htKhoa = ttHtml();
    player.level = 120; player.wpUnlocked.comoc = 1;
    ttMo('comoc');
    const htMo = ttHtml();
    ttDi('comoc');                      // bấm nút Dịch Chuyển trên thẻ
    const sauDi = curMap;
    _ttChon = null; window.TEST_MODE = true;
    const demDi = (h) => (h.match(/onclick="ttDi\(/g) || []).length;
    const demBo = (h) => (h.match(/onclick="ttChayBo\(/g) || []).length;
    return { truoc, sauBam, the, sauDi,
      khoaCoNutDi: demDi(htKhoa), moCoNutDi: demDi(htMo),
      khoaCoChayBo: demBo(htKhoa) };
  });
  console.log('7) thẻ truyền tống:', JSON.stringify(r7));
  if (r7.sauBam !== r7.truoc) fail(`⑦ bấm một vùng mà DỊCH CHUYỂN THẲNG (${r7.truoc} → ${r7.sauBam}) — phải mở thẻ đọc trước`);
  if (r7.the !== 'nhanmon') fail(`⑦ bấm vùng mà thẻ không mở (đang mở: ${r7.the})`);
  if (r7.khoaCoNutDi) fail('⑦ thẻ của vùng CHƯA MỞ vẫn bật nút Dịch Chuyển — bản đồ lách được luật mà nút trong danh sách phải theo');
  if (!r7.moCoNutDi) fail('⑦ thẻ của vùng ĐÃ MỞ lại không bật nút Dịch Chuyển');
  if (r7.sauDi !== 'comoc') fail(`⑦ bấm Dịch Chuyển trên thẻ mà không đi (ở lại ${r7.sauDi})`);

  // ---- 8. TẦNG HÀNH VI: hai tab phải vẽ ra thật, bộ lọc phải đổi được hình ----
  const r8 = await p.evaluate(async () => {
    travelTo('ardhaven'); travelTo('comoc');
    const dem = (id) => {
      const c = el(id); if (!c) return -1;
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 8) n++;
      return n;
    };
    // chụp vân: đếm điểm ảnh SÁNG để so hai lần vẽ khác nhau ở chỗ nào
    const sang = (id) => {
      const c = el(id); if (!c) return -1;
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] + d[i+1] + d[i+2] > 330) n++;
      return n;
    };
    _banDoTab = 'tg'; renderMapPanel(); el('panel-map').classList.remove('hidden');
    await new Promise(r => setTimeout(r, 260));
    const tgVe = dem('bd-tg'), tgSang = sang('bd-tg');
    _banDoTab = 'ht'; renderMapPanel();
    await new Promise(r => setTimeout(r, 260));
    const htDay = sang('bd-ht');
    for (const k in _htLoc) _htLoc[k] = 0;
    renderMapPanel();
    await new Promise(r => setTimeout(r, 260));
    const htTrong = sang('bd-ht');
    for (const k in _htLoc) _htLoc[k] = 1;
    const o = { tgVe, tgSang, htDay, htTrong, khung: TG_KHUNG.w * TG_KHUNG.h };
    closePanels();
    return o;
  });
  console.log('8) vẽ ra thật:', JSON.stringify(r8));
  if (!(r8.tgVe > r8.khung * 0.9)) fail(`⑧ canvas THẾ GIỚI gần như rỗng (${r8.tgVe}/${r8.khung} điểm ảnh có màu)`);
  if (!(r8.tgSang > 1500)) fail(`⑧ bản đồ thế giới không vẽ được vùng/nhãn nào đáng kể (${r8.tgSang} điểm sáng)`);
  if (!(r8.htDay > r8.htTrong + 1500))
    fail(`⑧ tắt hết bộ lọc mà tab HIỆN TẠI gần như không đổi (${r8.htDay} → ${r8.htTrong}) — hoặc bộ lọc không nối vào phần vẽ, hoặc phần vẽ chẳng vẽ gì`);

  // ---- 9. MỌI DÒNG TRÊN THẺ PHẢI TRA RA TỪ DỮ LIỆU ----
  // Một tấm thẻ "thông tin vùng" chép cứng là kiểu nói dối tệ nhất: nó trông đáng tin nhất và
  // không ai đi kiểm. Nên kiểm: giờ sự kiện in ra phải THẬT SỰ rơi vào vùng đó.
  const r9 = await p.evaluate(() => {
    const xau = [], trong = [];
    for (const id of Object.keys(THE_GIOI)){
      const sk = ttGioSuKien(id);
      for (const [ten, ds, mapFn, nextFn] of [['Hung Thần', sk.maton, matonMapFor, matonNextBoundary],
                                              ['Xâm Lăng Vàng', sk.golden, goldenMapFor, goldenNextBoundary]]){
        for (const gio of ds){
          // quét lại tới mốc có giờ ấy và hỏi nó rơi vào map nào
          let t = nextFn(Date.now()), thay = false;
          for (let i = 0; i < 6*8 && !thay; i++){
            if (String(new Date(t).getHours()).padStart(2,'0') + ':00' === gio && mapFn(t) === id) thay = true;
            t = nextFn(t + 60000);
          }
          if (!thay) xau.push(`${id} · ${ten} ${gio}`);
        }
      }
      // ⚠ KHÔNG đòi "vùng nào có quái cũng phải có sự kiện". Ba vùng thêm sau (Lối Mòn Corran ·
      // Trũng Nứt Corran · Aquatic Tribe Causeway) KHÔNG nằm trong `MATON_HA`/`MATON_THUONG`/
      // `GOLDEN_FIELD` — đó là dữ liệu thật, không phải lỗi quét, và thẻ báo "—" là báo đúng.
      // Thứ đáng gác là chiều ngược lại: vùng CÓ trong bảng xoay thì phải quét ra được giờ.
      const trongBang = MATON_HA.includes(id) || MATON_THUONG.includes(id) || GOLDEN_FIELD.includes(id);
      if (trongBang && !sk.maton.length && !sk.golden.length) trong.push(id);
    }
    // và các dòng khác phải khớp MAPS
    const id0 = 'mongco', h = (ttMo(id0), ttHtml());
    _ttChon = null;
    const ngoaiBang = Object.keys(THE_GIOI).filter(k =>
      !MATON_HA.includes(k) && !MATON_THUONG.includes(k) && !GOLDEN_FIELD.includes(k)
      && MAPS[k].range && MAPS[k].range !== '—');
    return { xau, trong, ngoaiBang,
      coTen: h.includes(MAPS[id0].name), coMin: h.includes('Cấp ' + MAPS[id0].min),
      coRange: h.includes('Cấp ' + MAPS[id0].range) };
  });
  console.log('9) dữ liệu trên thẻ:', JSON.stringify(r9));
  if (r9.xau.length) fail(`⑨ ${r9.xau.length} giờ sự kiện in ra mà mốc đó KHÔNG rơi vào vùng ấy: ${r9.xau.slice(0,4).join(' · ')}`);
  if (r9.trong.length) fail(`⑨ ${r9.trong.length} vùng CÓ trong bảng xoay sự kiện mà thẻ quét ra rỗng — quét thiếu một vòng xoay: ${r9.trong.join(', ')}`);
  if (r9.ngoaiBang.length) console.log(`   ℹ ${r9.ngoaiBang.length} vùng nằm NGOÀI mọi bảng xoay sự kiện (thẻ báo "—", đúng dữ liệu): ${r9.ngoaiBang.join(', ')}`);
  if (!r9.coTen) fail('⑨ thẻ không in tên map');
  if (!r9.coMin) fail('⑨ thẻ không in đúng `md.min` làm giới hạn cấp');
  if (!r9.coRange) fail('⑨ thẻ không in đúng `md.range` làm dải cấp quái');

  if (errs.length) fail('lỗi trang: ' + errs.slice(0,3).join(' | '));
  console.log(bad ? `\n${bad} LỖI` : '\nTẤT CẢ XANH');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
