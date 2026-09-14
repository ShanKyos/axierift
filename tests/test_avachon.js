// CHỌN AXIE ĐẠI DIỆN ở màn tạo nhân vật.
//
// Mô hình đã chốt của game: "Chỉ số tới từ 5 class. Axie chỉ đơn thuần là avatar thôi." Trước
// bản này mô hình đó không có mặt nào — `player.avatar` chỉ đổi được bằng `/avatar <id>`.
//
// Bốn thứ dễ hỏng nhất, và đây là chỗ gác:
//   1. `undefined` KHÁC `null`. `undefined` = chưa chọn ⇒ theo lớp. `null` = đã tắt bằng
//      /avatar off. Gán bừa `avatar || null` lúc tạo nhân vật là biến MỌI nhân vật mới thành
//      đã-tắt-avatar, và triệu chứng là "tự nhiên không thấy con Axie đâu".
//   2. Danh sách phải suy từ CHIMERA, không phải một bảng chép tay thứ hai. Bảng chép tay sẽ
//      nói dối ngay lần đầu ai đó nướng thêm một con.
//   3. Cỡ con Axie đứng cạnh thẻ phải hỏi `avaCo()` — cùng hàm mà trong màn dùng. Chép một
//      con số px vào đây là màn tạo nhân vật hứa một đằng, vào game ra một nẻo.
//   4. Lựa chọn phải SỐNG QUA SAVE. Không thì người chơi chọn xong, thoát ra vào lại là mất.
const { chromium } = require('playwright');
let bad = 0; const fail = m => { bad++; console.log('FAIL ' + m); };
const URL = 'http://localhost:8853/index.html';

const toiManTao = async p => {
  await p.goto(URL, { waitUntil:'load' });
  await p.waitForFunction(() => window.__gameReady, null, { timeout:20000 }).catch(()=>{});
  await p.evaluate(() => {
    const d = [...document.querySelectorAll('#intro-story button')].find(x => /Bỏ qua/.test(x.textContent));
    if (d) d.click(); else if (typeof openCreate === 'function') openCreate();
  });
  await p.waitForTimeout(600);
};
const tao = async (p, ten) => {
  await p.evaluate(t => { const i = document.getElementById('inp-char-name');
    i.value = t; i.dispatchEvent(new Event('input')); }, ten);
  await p.evaluate(() => document.getElementById('btn-create').click());
  await p.waitForTimeout(700);
};

(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport:{width:1280,height:900} });
  const errs = []; p.on('pageerror', e => errs.push(String(e).split('\n')[0]));

  // ── 1) Lưới im lặng cho tới khi chọn lớp, rồi bày đủ và chọn sẵn con của lớp ──
  await toiManTao(p);
  const truoc = await p.evaluate(() => {
    const box = document.getElementById('cc-avatar');
    return { co:!!box, hien: box && box.style.display !== 'none' && box.innerHTML.length > 0 };
  });
  if (!truoc.co) fail('không có #cc-avatar');
  if (truoc.hien) fail('lưới Axie bày ra TRƯỚC khi chọn lớp — làm loãng đúng bước quan trọng hơn');
  await p.evaluate(() => document.querySelectorAll('#cc-classes .cc-card')[0].click());
  await p.waitForTimeout(500);
  const r1 = await p.evaluate(() => {
    const box = document.getElementById('cc-avatar');
    const du = CHIMERA.filter(c => CHI_ANH.o[c.id]).length;
    const sel = [...box.querySelectorAll('.cc-ava-o.sel')];
    return { o:box.querySelectorAll('.cc-ava-o').length, du,
             sel: sel.length, selTen: sel.length ? sel[0].title.split(' ·')[0] : null,
             mdinh: AVA_MAC_DINH[ccSect],
             ke: document.querySelectorAll('#cc-classes .cc-card.sel .cc-ava-ke').length };
  });
  console.log('1) lưới:', JSON.stringify(r1));
  if (r1.o !== r1.du) fail(`lưới bày ${r1.o} ô nhưng có ${r1.du} con đã nướng art — danh sách không suy từ CHIMERA`);
  if (r1.o < 10) fail('lưới quá ít ô — nghi là một bảng chép tay');
  if (r1.sel !== 1) fail(`phải có ĐÚNG 1 ô đang chọn, đang có ${r1.sel}`);
  if (r1.ke !== 1) fail('thẻ lớp đang chọn không có con Axie đứng cạnh — bấm lưới mà không thấy gì đổi');

  // ── 2) Không tự chọn ⇒ player.avatar giữ `undefined` (KHÔNG phải null) ──────
  await tao(p, 'KhongTuChon');
  const r2 = await p.evaluate(() => ({
    kieu: typeof player.avatar, la: String(player.avatar),
    veRa: avatarId(player), mdinh: AVA_MAC_DINH[player.sect] }));
  console.log('2) không tự chọn:', JSON.stringify(r2));
  if (r2.kieu !== 'undefined')
    fail(`player.avatar = ${r2.la} (${r2.kieu}) — phải là undefined. null nghĩa là "đã tắt avatar", khác hẳn.`);
  if (r2.veRa !== r2.mdinh) fail(`vẽ ra ${r2.veRa} nhưng con mặc định của lớp là ${r2.mdinh}`);

  // ── 3) Có tự chọn ⇒ ghi đúng con đó, và SỐNG QUA SAVE ──────────────────────
  await p.evaluate(() => localStorage.clear());
  await toiManTao(p);
  await p.evaluate(() => document.querySelectorAll('#cc-classes .cc-card')[0].click());
  await p.waitForTimeout(300);
  // Cố ý chọn một con KHÁC con mặc định của lớp — chọn trùng thì bài không phân biệt được
  // "đã ghi" với "rơi về mặc định".
  const chon = await p.evaluate(() => {
    const md = AVA_MAC_DINH[ccSect];
    const x = CHIMERA.find(c => CHI_ANH.o[c.id] && c.id !== md);
    window.ccAvaChon(x.id); return x.id;
  });
  await p.waitForTimeout(300);
  await tao(p, 'CoTuChon');
  const r3 = await p.evaluate(() => ({ av:String(player.avatar), veRa:avatarId(player) }));
  console.log('3) tự chọn', chon, '→', JSON.stringify(r3));
  if (r3.av !== chon) fail(`chọn ${chon} nhưng player.avatar = ${r3.av}`);
  if (r3.veRa !== chon) fail(`chọn ${chon} nhưng vẽ ra ${r3.veRa}`);
  await p.evaluate(() => saveGame());
  await p.reload({ waitUntil:'load' });
  await p.waitForFunction(() => window.__gameReady, null, { timeout:20000 }).catch(()=>{});
  await p.waitForTimeout(500);
  // ⚠ TÌM Ô THEO TÊN, đừng lấy "ô đầu tiên có người". `localStorage.clear()` rồi điều hướng
  // thì `beforeunload` của trang cũ GHI LẠI nhân vật vừa xoá — nên ô 1 là người của mục trước
  // và nhân vật của mục này nằm ở ô 2. Bản đầu của bài này lấy ô đầu tiên và báo đỏ một lỗi
  // không có thật.
  const r3b = await p.evaluate(() => {
    const d = JSON.parse(localStorage.getItem('vlcm_save') || 'null');
    const o = d && d.slots && d.slots.filter(Boolean).find(x => x.player && x.player.name === 'CoTuChon');
    return o ? String(o.player.avatar) : 'khong-tim-thay-o';
  });
  console.log('   sau khi lưu & nạp lại:', r3b);
  if (r3b !== chon) fail(`lựa chọn không sống qua save: đọc lại ra ${r3b}`);

  // ── 4) Cỡ con Axie cạnh thẻ phải TÍNH TỪ avaCo(), không chép px ────────────
  await p.evaluate(() => localStorage.clear());
  await toiManTao(p);
  await p.evaluate(() => document.querySelectorAll('#cc-classes .cc-card')[0].click());
  await p.waitForTimeout(400);
  const r4 = await p.evaluate(async () => {
    const doMot = async id => {
      window.ccAvaChon(id);
      await new Promise(k => requestAnimationFrame(() => requestAnimationFrame(k)));
      const ke = document.querySelector('#cc-classes .cc-card.sel .cc-ava-ke');
      const art = ke && ke.parentNode.querySelector('.cc-art');
      if (!ke || !art) return null;
      const hArt = art.getBoundingClientRect().height;
      const A = CHI_ANH.o[id];
      // Công thức mà mã PHẢI dùng: thân người trên thẻ × (avaCo/NV_THAN_PX) × hệ số thu, rồi
      // thân → hộp. Chép cứng một con số px vào mã là khẳng định này đỏ ngay.
      const that = ke.getBoundingClientRect().height;
      // Hệ số suy ra: cao vẽ ra ÷ (phần avaCo của con đó). Bài KHÔNG cần biết hệ số thu là bao
      // nhiêu — nó chỉ cần biết hai con khác hình phải cho ra CÙNG một hệ số. Chép cứng px thì
      // không thể cùng, vì avaCo và thanCao của hai con khác nhau.
      return { id, that: Math.round(that), hs: that / ((avaCo(id) / NV_THAN_PX) / A.thanCao * hArt) };
    };
    const ds = CHIMERA.filter(c => window.CHI_ANH.o[c.id]).map(c => c.id);
    // Hai con có tỉ lệ rộng/cao lệch nhau nhất — nếu cỡ bị chép cứng thì hai con ra bằng nhau.
    const ty = id => CHI_ANH.o[id].nhoRong / CHI_ANH.o[id].nhoCao;
    const sap = ds.slice().sort((a, c) => ty(a) - ty(c));
    return [await doMot(sap[0]), await doMot(sap[sap.length - 1])];
  });
  console.log('4) cỡ theo avaCo:', JSON.stringify(r4));
  if (r4.some(x => !x)) fail('không đo được con Axie cạnh thẻ');
  else {
    const [a, c] = r4;
    if (!(a.hs > 0.05 && a.hs < 2)) fail(`hệ số ra ${a.hs} — không phải một tỉ lệ hợp lý của thân người`);
    if (Math.abs(a.hs - c.hs) > 0.03)
      fail(`${a.id} ra hệ số ${a.hs.toFixed(3)} còn ${c.id} ra ${c.hs.toFixed(3)} — cỡ không suy từ avaCo mà bị chép cứng`);
    if (a.that === c.that)
      fail(`hai con có tỉ lệ rộng/cao lệch hẳn nhau mà vẽ ra cùng ${a.that}px — cỡ đang bị chép cứng`);
  }
  { const rong = await p.evaluate(() => {
      const ds = CHIMERA.filter(c => window.CHI_ANH.o[c.id]).map(c => c.id);
      const ty = id => CHI_ANH.o[id].nhoRong / CHI_ANH.o[id].nhoCao;
      const sap = ds.slice().sort((a, c) => ty(a) - ty(c));
      return [ty(sap[0]).toFixed(2), ty(sap[sap.length-1]).toFixed(2)];
    });
    console.log('   tỉ lệ rộng/cao hai đầu:', rong.join(' → '));
    if (rong[0] === rong[1]) fail('16 con cùng một tỉ lệ — bài này không kiểm được gì nữa'); }

  // ── 5) Tạo nhân vật THỨ HAI không được thừa hưởng lựa chọn của lần trước ───
  await p.evaluate(() => localStorage.clear());
  await toiManTao(p);
  await p.evaluate(() => document.querySelectorAll('#cc-classes .cc-card')[0].click());
  await p.waitForTimeout(300);
  const c5 = await p.evaluate(() => {
    const md = AVA_MAC_DINH[ccSect];
    const x = CHIMERA.find(c => CHI_ANH.o[c.id] && c.id !== md);
    window.ccAvaChon(x.id); return x.id;
  });
  await p.waitForTimeout(250);
  await tao(p, 'NguoiMotNam');
  await p.evaluate(() => { showMainMenu(); openCreate(); });
  await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelectorAll('#cc-classes .cc-card')[1].click());
  await p.waitForTimeout(400);
  const r5 = await p.evaluate(() => {
    const sel = document.querySelector('#cc-avatar .cc-ava-o.sel');
    return { sel: sel ? sel.title.split(' ·')[0] : null,
             mdinh: (CHI_MAP[AVA_MAC_DINH[ccSect]] || {}).ten };
  });
  console.log('5) nhân vật thứ hai:', JSON.stringify(r5), '(lần trước chọn', c5 + ')');
  if (r5.sel !== r5.mdinh)
    fail(`tạo nhân vật thứ hai mà lưới vẫn đang chọn "${r5.sel}" thay vì con mặc định "${r5.mdinh}" của lớp mới`);

  if (errs.length) fail('lỗi trang: ' + errs.join(' · '));
  await b.close();
  console.log(bad ? `\n${bad} LỖI` : '\nOK — chọn Axie đại diện chạy đúng hợp đồng');
  process.exit(bad ? 1 : 0);
})();
