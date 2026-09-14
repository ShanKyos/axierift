// Đợt giao diện: tách phím C/V, gộp bảng Kỹ Năng về một trang, gom bốn tab vào tab mẹ,
// và nhạc màn chờ.
const { chromium } = require('playwright');
let bad = 0;
const fail = m => { bad++; console.log('FAIL ' + m); };
const pass = m => console.log('PASS ' + m);

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1440, height: 950 } });
  p.on('pageerror', e => fail('lỗi runtime: ' + e.message));
  await p.goto('http://localhost:8853/index.html?max=1');
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(900);

  // ═══ ① NHẠC MÀN CHỜ ═══════════════════════════════════════════════════════
  // Kiểm TRƯỚC khi startGame: nhạc phải nổi lên ở màn chọn nhân vật, không phải trong màn chơi.
  const nhac = await p.evaluate(async () => {
    const r = await fetch('assets/music/' + BGM_INTRO + '.mp3', { method:'HEAD' });
    return { hangSo: BGM_INTRO, dat: AudioSys.bgmName, ma: r.status, kieu: r.headers.get('content-type') };
  });
  console.log('nhạc:', JSON.stringify(nhac));
  if (!nhac.hangSo) fail('BGM_INTRO vẫn null — màn chờ không có nhạc');
  else if (nhac.ma !== 200) fail(`tệp nhạc trả về ${nhac.ma}, không phải 200`);
  else if (!/audio/.test(nhac.kieu || '')) fail('tệp nhạc không phải kiểu audio: ' + nhac.kieu);
  else if (nhac.dat !== nhac.hangSo) fail(`màn chờ không đặt nhạc (bgmName = "${nhac.dat}")`);
  else pass(`màn chờ phát ${nhac.hangSo}.mp3 (${nhac.kieu})`);

  await p.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', null); applyTestBoost(); moHetCong(); });
  await p.waitForTimeout(500);

  // ═══ ② PHÍM C / V / K / B ═════════════════════════════════════════════════
  // ⚠ LUẬT ĐỔI LẦN THỨ HAI, VÀ ĐÂY LÀ LẦN CHỦ DỰ ÁN CHỐT BẰNG ẢNH GAME GỐC.
  //   · đời 1: C và V cùng gọi togglePanel('char') ⇒ hai phím một cửa sổ, phí một phím.
  //   · đời 2: Nhân Vật ⇄ Trang Bị thành hai nửa một cửa sổ ⇒ bấm C là kéo luôn đồ ra, tức
  //            KHÔNG còn phím nào cho "chỉ xem chỉ số".
  //   · đời 3 (nay): đúng khuôn MU Online — **C ra CHỈ SỐ một mình, V ra TRANG BỊ + TÚI ĐỒ**
  //            (hình nhân vật mặc đồ cạnh lưới túi, đúng một cửa sổ hai nửa).
  // Chấm bằng ĐÚNG TẬP bảng mở, không chấm có-hay-không: hỏng kiểu "mở dư một bảng" chỉ lộ
  // ra khi đếm, mà đó chính là kiểu hỏng của cả hai đời trước.
  // ⚠ `panel-qlog` bị loại khỏi phép đếm: nó thôi là cửa sổ nổi và nay CẮM trong cột phải
  // (luôn hiện, không bảng nào đóng được nó) — để nó trong tập là mọi phím đều "mở dư".
  const phim = {};
  for (const k of ['c', 'v', 'k', 'b']){
    await p.evaluate(() => closePanels());
    await p.keyboard.press(k);
    await p.waitForTimeout(220);
    phim[k] = await p.evaluate(() =>
      [...document.querySelectorAll('.panel')]
        .filter(e => !e.classList.contains('hidden') && !e.classList.contains('bang-cam'))
        .map(e => e.id).sort());
  }
  console.log('phím:', JSON.stringify(phim));
  const DUNG = {
    c: ['panel-char'],                   // CHỈ SỐ, một mình
    v: ['panel-bag', 'panel-inv'],       // TRANG BỊ + TÚI ĐỒ (đã sort)
    k: ['panel-skill'],
    b: ['panel-bag', 'panel-inv'],       // B là lối vào thứ hai của cùng cửa sổ đó
  };
  for (const k in DUNG){
    if (phim[k].join() !== DUNG[k].join())
      fail(`phím ${k.toUpperCase()} mở [${phim[k].join(' ') || 'không gì'}] — phải đúng [${DUNG[k].join(' ')}]`);
  }
  if (!bad) pass('C → chỉ số · V/B → Trang Bị + Túi Đồ · K → Kỹ Năng, không phím nào mở dư');

  // ═══ ③ BẢNG KỸ NĂNG — MỘT TRANG ═══════════════════════════════════════════
  const kn = await p.evaluate(() => {
    closePanels(); togglePanel('skill');
    const el = document.getElementById('panel-skill');
    // Bảng Kỹ Năng nay là CÂY CÓ TAB (chủ dự án chốt) — gom chữ cả ba tab rồi mới chấm, nếu
    // không thì ba mục cũ trông như đã bốc hơi trong khi chúng chỉ dời sang tab Khác.
    let t = el.innerText || '';
    if (typeof KN_TAB !== 'undefined') for (const x of KN_TAB){ window.knTab(x.id); t += '\n' + (el.innerText || ''); }
    return { tab: el.querySelectorAll('.bang-tab').length,
             muc: [...el.querySelectorAll('.stat-sec')].map(x => x.textContent.trim()),
             coDiSan: /DI SẢN LỚP/.test(t), coBonO: /1 chính · 1 phụ/.test(t),
             coTanChuc: /HỆ TẤN CHỨC PHỤ/.test(t),
             conHam: typeof window.switchSkillTab };
  });
  console.log('kỹ năng:', JSON.stringify(kn));
  if (kn.tab !== 3) fail(`bảng Kỹ Năng có ${kn.tab} tab — phải đúng 3 (Lớp · Vaeldra · Khác)`);
  else pass('bảng Kỹ Năng có đủ 3 tab');
  if (!kn.coBonO || !kn.coDiSan || !kn.coTanChuc)
    fail('chia tab mà MẤT MỤC: 4 ô=' + kn.coBonO + ' di sản=' + kn.coDiSan + ' tấn chức=' + kn.coTanChuc);
  else pass('cả ba mục cùng nằm trên một trang');
  // Hai mục BỊ ĐỘNG nay cạnh nhau — tiêu đề phải phân biệt được, không thì đọc thành trùng lặp
  const bd = kn.muc.filter(x => /^BỊ ĐỘNG/.test(x));
  if (bd.length === 2 && bd[0] === bd[1]) fail('hai mục bị động trùng tiêu đề: ' + bd[0]);
  else if (bd.length === 2) pass(`hai mục bị động phân biệt được: ${bd.join('  |  ')}`);
  if (kn.conHam !== 'undefined') fail('switchSkillTab vẫn còn — mã chết sau khi bỏ tab');

  // Không chỗ nào còn chỉ đường tới tab đã gỡ
  // Chỉ đếm trong CHUỖI hiển thị. Chú thích giải thích vì sao đã gỡ tab có trích lại chuỗi cũ
  // làm dẫn chứng — đếm cả nó thì bài kiểm đỏ vì chính lời giải thích của mình.
  const chiDuong = await p.evaluate(async () => {
    const t = (await (await fetch('game.js')).text())
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .split('\n').map(l => { const c = l.indexOf('//'); return c < 0 ? l : l.slice(0, c); }).join('\n');
    return (t.match(/K → Di Sản Cũ/g) || []).length;
  });
  if (chiDuong) fail(`còn ${chiDuong} chỗ chỉ người chơi tới "K → Di Sản Cũ" — tab đó không còn`);
  else pass('không còn chỉ dẫn tới tab đã gỡ');

  // ═══ ④ BẢNG NHÂN VẬT — TAB MẸ ═════════════════════════════════════════════
  const nv = await p.evaluate(() => {
    const doc = t => {
      closePanels(); togglePanel('char'); if (t) window.switchCharTab(t);
      const el = document.getElementById('panel-char');
      const hang = [...el.querySelectorAll('.bang-tabs')];
      return { hang: hang.length,
               cha: [...hang[0].querySelectorAll('.bang-tab')].map(x => x.textContent.trim()),
               chaOn: [...hang[0].querySelectorAll('.bang-tab.on')].map(x => x.textContent.trim()),
               con: hang[1] ? [...hang[1].querySelectorAll('.bang-tab')].map(x => x.textContent.trim()) : null,
               conOn: hang[1] ? [...hang[1].querySelectorAll('.bang-tab.on')].map(x => x.textContent.trim()) : null,
               than: (document.getElementById('char-content') || {}).innerHTML?.length || 0 };
    };
    return { info: doc('info'), chi: doc('mount'), dt: doc('mastery'), ts: doc('taytuy') };
  });
  console.log('nhân vật:', JSON.stringify(nv.info.cha), '· trong nhóm:', JSON.stringify(nv.chi.con));
  // 3 → 2: tab 'taytuy' (Tái Sinh) đã gỡ theo yêu cầu chủ dự án — sẽ thiết kế lại. Máy Tái
  // Sinh (`renderTayTuy` · `doTayTuy` · `player.resetCount`) giữ nguyên, chỉ cái TAB đi.
  if (nv.info.cha.length !== 2) fail(`hàng tab đầu có ${nv.info.cha.length} mục, phải còn 2`);
  else pass('hàng tab đầu còn 2 mục: ' + nv.info.cha.join(' · '));
  if (nv.info.hang !== 1 || nv.ts.hang !== 1)
    fail('hàng tab con hiện cả khi KHÔNG ở trong nhóm — bốn nút thừa trên mọi trang khác');
  else pass('hàng tab con chỉ hiện khi đang ở trong nhóm');
  // HAI tab con, không phải ba: nhánh Thuần Thục đã gỡ theo yêu cầu chủ dự án, CHAR_NHOM còn
  // ['mount', 'mastery'] (Chimera·Linh Thú và Đại Thành).
  if (!nv.chi.con || nv.chi.con.length !== 2) fail(`nhóm có ${nv.chi.con ? nv.chi.con.length : 0} tab con, phải là 2`);
  else pass('nhóm có 2 tab con: ' + nv.chi.con.join(' · '));
  for (const [ten, o] of [['Chimera', nv.chi], ['Đại Thành', nv.dt]]){
    if (!o.chaOn.some(x => /Nâng Cấp/.test(x))) fail(`${ten}: tab mẹ không sáng`);
    if (!o.conOn || o.conOn.length !== 1) fail(`${ten}: tab con sáng ${o.conOn ? o.conOn.length : 0} mục, phải đúng 1`);
    if (o.than < 500) fail(`${ten}: thân bảng gần như rỗng (${o.than} ký tự) — không vẽ ra nội dung`);
  }
  if (!bad) pass('vào tab con nào thì tab mẹ sáng và đúng một tab con sáng');

  await p.screenshot({ path: 'qa_shots/ui_dot5.png' });
  await b.close();
  console.log(bad ? `FAIL(${bad})` : 'ALL PASS');
  process.exit(bad ? 1 : 0);
})();
