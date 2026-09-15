// RÈN: HAI ĐOẠN, HAI NƠI, KHÔNG CHỒNG NHAU
//
// Chủ dự án chốt: **ép ngọc lo +1→+9, Lò lo +10/+11/+12.**
//
// Vì sao đáng gác — trước bản này có BA đường đưa món đồ lên +9, mỗi đường một bảng luật:
//   ① `epNgoc` (ép thẳng trong túi)   — Chúc Phúc tới +6, Linh Hồn 50% tới +9, xịt TỤT 1
//   ② "Rèn Thường" ở Lò (`forgeRule`) — Lumen + Tu La, 75/65/50%, xịt +8/+9 VỀ 0
//   ③ `useJewel('linhHon')` ở NPC     — Linh Hồn 50% **tới tận +11**, không cần gì khác
// ② lệch ① ở LUẬT XỊT ⇒ ai đọc ra bảng thì rèn +7 ở Lò rồi chuyển sang ngọc cho +8/+9; ai
// không đọc ra thì mất đồ. ③ thì ăn đứt Phá Thiên Kiếp ở cả hai mốc cuối. Cả hai nay đã gỡ.
//
// Bài này gác BỐN điều, và điều 1 là điều quan trọng nhất:
//   1. `forgeRule` TỪ CHỐI mọi mốc ≤9 (ném lỗi), không trả một luật gần đúng
//   2. ba mốc Lò +10/+11/+12 đều vỡ vụn, tỉ lệ giảm dần, và đều đòi Hỗn Nguyên chứ không Tu La
//   3. mọi đường ép ngọc cùng đọc MỘT trần từ `NGOC_EP` — không đường nào chép cứng
//   4. Tu La Tinh Thạch đã ra khỏi game
const { chromium } = require('playwright');
const PORT = process.argv[2] || '8853';
let bad = 0;
const fail = m => { bad++; console.log('FAIL ' + m); };
const pass = m => console.log('PASS ' + m);

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 900, height: 560 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto(`http://localhost:${PORT}/index.html?max=1`);
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(900);
  await p.evaluate(() => { window.TEST_MODE = true; startGame('baidasan', null); });
  await p.waitForTimeout(600);

  // ── 1) forgeRule chỉ nhận 10/11/12 ────────────────────────────────────────────────
  const r1 = await p.evaluate(() => {
    const o = { tuChoi: [], nhan: {} };
    for (let t = 1; t <= 14; t++){
      try { const r = forgeRule(t); o.nhan[t] = { rate:r.rate, fail:r.fail, hon:r.hon, tuLa:r.tuLa }; }
      catch { o.tuChoi.push(t); }
    }
    return o;
  });
  console.log('1) nhận:', JSON.stringify(r1.nhan), '· từ chối:', JSON.stringify(r1.tuChoi));
  const canTuChoi = [1,2,3,4,5,6,7,8,9,13,14];
  const sotLot = canTuChoi.filter(t => !r1.tuChoi.includes(t));
  if (sotLot.length)
    fail(`forgeRule nhận mốc ${sotLot.join(',')} — đoạn +1→+9 là việc của ép ngọc, mốc >12 không tồn tại`);
  else pass('forgeRule từ chối mọi mốc ngoài 10-12 (đường thứ hai lên +9 đã gỡ)');

  // ── 2) ba mốc Lò ──────────────────────────────────────────────────────────────────
  for (const t of [10, 11, 12]){
    const r = r1.nhan[t];
    if (!r){ fail(`forgeRule(${t}) không trả luật nào`); continue; }
    if (r.fail !== 'break') fail(`mốc +${t} phải 'break' (vỡ vụn), đang '${r.fail}'`);
    if (r.rate >= 100)      fail(`mốc +${t} tỉ lệ ${r.rate}% — không bao giờ xịt thì luật xịt vô nghĩa`);
    if (!(r.hon > 0))       fail(`mốc +${t} không đòi Hỗn Nguyên (hon=${r.hon})`);
    if (r.tuLa != null)     fail(`mốc +${t} vẫn còn trường tuLa — Tu La đã gỡ`);
  }
  if (r1.nhan[10] && r1.nhan[11] && r1.nhan[12]){
    const [a, c, d] = [r1.nhan[10].rate, r1.nhan[11].rate, r1.nhan[12].rate];
    if (!(a > c && c > d)) fail(`tỉ lệ ba mốc phải giảm dần, đo ${a}/${c}/${d}`);
    else pass(`+10 ${a}% > +11 ${c}% > +12 ${d}% · cả ba vỡ vụn · cả ba ăn Hỗn Nguyên`);
    const [ha, hc, hd] = [r1.nhan[10].hon, r1.nhan[11].hon, r1.nhan[12].hon];
    if (!(ha < hc && hc < hd)) fail(`Hỗn Nguyên phải tăng dần theo mốc, đo ${ha}/${hc}/${hd}`);
    else pass(`Hỗn Nguyên ${ha} → ${hc} → ${hd}`);
  }

  // ── 3) MỌI đường ép ngọc cùng đọc một trần ────────────────────────────────────────
  // Đây là chỗ đã hỏng thật: `useJewel` không đi qua `ngocEpDuoc()` nên nó chép cứng `>= 11`
  // và sống sót qua hẳn một đợt hạ trần. Bài này không đọc con số — nó CHẠY cả hai đường.
  const r3 = await p.evaluate(() => {
    const tran = NGOC_EP.linhHon.tran;
    const o = { tran, chepCung: /it\.plus\s*>=\s*\d+/.test(String(window.useJewel || '')) };
    // đường A: ép thẳng trong túi
    const a = genSpecific('vukhi', 105); a.plus = tran;
    o.duongTui = ngocEpDuoc(a, 'linhHon') ? 'chặn' : 'CHO QUA';
    // đường B: useJewel ở NPC Thợ Rèn
    const c = genSpecific('vukhi', 105); c.plus = tran; c.uid = 987654;
    player.inv.push(c);
    player.jewels.linhHon = 50;
    const truoc = player.jewels.linhHon;
    for (let i = 0; i < 20; i++) window.useJewel('linhHon', c.uid);
    o.duongNpc = { plusSau: c.plus, ngocTru: truoc - player.jewels.linhHon };
    player.inv = player.inv.filter(x => x.uid !== 987654);
    return o;
  });
  console.log('3) trần ngọc:', JSON.stringify(r3));
  if (r3.duongTui !== 'chặn') fail(`ép thẳng trong túi vẫn cho qua trần +${r3.tran}`);
  else pass(`ép trong túi chặn đúng ở +${r3.tran}`);
  if (r3.duongNpc.plusSau > r3.tran)
    fail(`useJewel() đẩy món lên +${r3.duongNpc.plusSau}, vượt trần ngọc +${r3.tran} — đường thứ ba sống lại`);
  else if (r3.duongNpc.ngocTru > 0)
    fail(`useJewel() ăn ${r3.duongNpc.ngocTru} viên Linh Hồn ở trần mà không lên cấp nào`);
  else pass(`useJewel() chặn đúng ở +${r3.tran} và không nuốt ngọc`);
  if (r3.chepCung)
    fail('useJewel() vẫn chép cứng một con số trần — phải đọc NGOC_EP.linhHon.tran');
  else pass('useJewel() đọc trần từ NGOC_EP, không chép cứng');

  // ── 4) Tu La đã ra khỏi game ──────────────────────────────────────────────────────
  const r4 = await p.evaluate(() => ({
    conTruong: !!(player.gems && 'tuLa' in player.gems),
    conKhoNgoc: typeof KHO_NGOC_KEYS !== 'undefined' && KHO_NGOC_KEYS.includes('tuLa'),
    conTiem: typeof RARE_POOL !== 'undefined' && RARE_POOL.some(x => x.id === 'r_tula'),
    conHang: typeof GO_TULA !== 'undefined' ? GO_TULA : null,
  }));
  console.log('4) Tu La:', JSON.stringify(r4));
  if (r4.conTruong)  fail('player.gems.tuLa vẫn còn — di trú chưa delete trường cũ');
  if (r4.conKhoNgoc) fail("KHO_NGOC_KEYS vẫn còn 'tuLa'");
  if (r4.conTiem)    fail("tiệm vẫn bán 'r_tula'");
  if (!r4.conHang)   fail('thiếu hằng GO_TULA — di trú save cũ không có tỉ giá');
  if (!r4.conTruong && !r4.conKhoNgoc && !r4.conTiem && r4.conHang)
    pass(`Tu La đã gỡ sạch, tỉ giá hoàn ${r4.conHang}◈/viên`);

  console.log('errors:', JSON.stringify(errs.slice(0, 3)));
  if (errs.length) fail('lỗi trang: ' + errs[0]);
  await b.close();
  console.log(bad ? `FAIL(${bad})` : 'ALLPASS');
  process.exit(bad ? 1 : 0);
})();
