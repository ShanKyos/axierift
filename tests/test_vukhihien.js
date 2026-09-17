// VŨ KHÍ LUÔN PHẢI HIỆN LÚC RA ĐÒN — kể cả khi lớp nhân vật đã NHẬP vào Axie.
//
// Chủ dự án chốt (2026-09-17), nguyên văn: *"khi Axie ra chiêu thì sẽ hiện cây vũ khí… nhân vật
// có thể không hiện nhưng vũ khí sẽ LUÔN xuất hiện để đồng bộ được skill"*.
//
// Vì sao nó cần một bài riêng: cửa `_tkHien` có BỐN điều kiện và ba trong bốn đều tắt thần khí
// ở đúng cảnh ngoài thành. Không có bài này thì lỗ thủng lặng như tờ — không ném lỗi, không
// bài nào đỏ, người chơi chỉ thấy "ra chiêu mà chẳng thấy vũ khí đâu".
//
// Bốn mệnh đề:
//   ① ngoài thành (đã nhập) · cả 5 lớp · đang ra đòn ⇒ PHẢI có vũ khí trên màn
//   ② trong thành · đang ĐI THEO (không ra đòn) ⇒ vũ khí vẫn phải TẮT (luật cũ, đừng phá)
//   ③ mọi tổ hợp (dòng × giai) của mọi lớp đều dựng được nguồn vũ khí — 48/98 tổ hợp vốn
//      KHÔNG có tranh riêng, nấc lùi theo lớp phải bịt hết
//   ④ TAY KHÔNG thì vẫn không có vũ khí — nấc lùi không được phát vũ khí cho người cởi trần
const { chromium } = require('playwright');
const PORT = process.argv[2] || '8853';
let bad = 0;
const fail = m => { bad++; console.log('FAIL ' + m); };
const pass = m => console.log('PASS ' + m);
const LOP = ['thieulam', 'minhgiao', 'toanchan', 'baidasan', 'bug'];

(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport:{ width:1280, height:760 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e).split('\n')[0]));
  await p.goto(`http://localhost:${PORT}/index.html?max=1`, { waitUntil:'load' });
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});

  // ── ① + ② ────────────────────────────────────────────────────────────────────────────
  const r1 = {};
  for (const lop of LOP){
    // MỘT evaluate cho cả hai cảnh: vòng RAF vẫn chạy giữa hai lệnh evaluate và `atkAnim` đếm
    // ngược, nên đặt ở lệnh này rồi `render()` ở lệnh sau là đo trên một trạng thái đã trôi.
    r1[lop] = await p.evaluate((lop) => {
      window.TEST_MODE = true; startGame(lop, null);
      player.level = 60; vhAutoLearn(); calcDerived();
      cheatExec('/gen 5 +9');
      const doc = () => {
        window.__veVuKhi = {}; render();
        const k = Object.keys(window.__veVuKhi)[0];
        return window.__veVuKhi[k] || null;
      };
      travelTo('daohoa');                       // NGOÀI thành ⇒ lớp nhân vật nhập vào Axie
      player.atkAnim = NV_DANH_GIAY * 0.6;
      const ngoai = doc();
      travelTo('ardhaven');                     // TRONG thành ⇒ lớp nhân vật đi theo
      player.atkAnim = 0; player.castT = 0;
      const thanh = doc();
      return { ngoai, thanh, daNhapNgoai: !!(ngoai && ngoai.nhap), oThanh: !!(thanh && !thanh.nhap) };
    }, lop);
  }
  console.log('1) ngoài thành, đang ra đòn:', JSON.stringify(Object.fromEntries(
    Object.entries(r1).map(([k, v]) => [k, v.ngoai]))));
  // Tự kiểm cảnh dựng trước khi chấm: nếu `daohoa` hoá ra lại là map an toàn thì `nhap` false
  // và mệnh đề ① đang đo một cảnh khác hẳn cảnh nó định đo.
  const chuaNhap = LOP.filter(l => !r1[l].daNhapNgoai);
  if (chuaNhap.length)
    fail(`① cảnh dựng hỏng: ${chuaNhap.join(' · ')} KHÔNG nhập vào Axie ở daohoa — mệnh đề này hết chỗ bám`);
  else {
    const hong = LOP.filter(l => !r1[l].ngoai || !r1[l].ngoai.hien || !r1[l].ngoai.co);
    if (hong.length)
      fail(`① ${hong.length}/5 lớp ra đòn ngoài thành mà KHÔNG có vũ khí trên màn: ${hong.join(' · ')}`);
    else pass(`① cả 5 lớp ra đòn ngoài thành đều có vũ khí hiện ra (lớp nhân vật thì không)`);
  }
  const hong2 = LOP.filter(l => !r1[l].oThanh || (r1[l].thanh && r1[l].thanh.hien));
  if (hong2.length)
    fail(`② trong thành lúc ĐI THEO mà vũ khí vẫn hiện: ${hong2.join(' · ')} — luật cũ bị phá`);
  else pass('② trong thành, lúc đi theo thì vũ khí vẫn tắt như cũ');

  // ── ③ nấc lùi bịt hết mọi dòng ───────────────────────────────────────────────────────
  const r3 = await p.evaluate(() => {
    const sectCu = player.sect, cu = player.equip.vukhi;
    const thieu = [], khongTranh = [];
    let quet = 0;
    for (const L of (window.WEAPON_LINES || [])){
      if (L.slot !== 'vukhi') continue;
      // ⚠ `genItem` chỉ sinh vũ khí của LỚP ĐANG CHƠI — không đổi `player.sect` thì bài chỉ quét
      // được ba dòng của một lớp mà vẫn xanh. Cùng vết sẹo đã ghi ở `test_vklop §3`.
      player.sect = L.sect;
      for (let giai = 1; giai <= 7; giai++){
        let it = null;
        for (let i = 0; i < 400 && !it; i++){
          const t = genItem(capDauGiai(giai), null, null, { slots:['vukhi'] });
          const d = t && itemDef(t);
          if (d && d.line === L.line) it = t;
        }
        if (!it) continue;
        it.tier = giai;
        player.equip.vukhi = it;
        quet++;
        if (!vkAnh(itemDef(it))) khongTranh.push(L.line + '|' + giai);
        if (!thanKhiNguon(player)) thieu.push(L.line + '|' + giai);
      }
    }
    player.sect = sectCu; player.equip.vukhi = cu; calcDerived();
    return { quet, thieu, khongTranh: khongTranh.length };
  });
  console.log('3) nguồn vũ khí:', JSON.stringify({ quet:r3.quet, khongTranh:r3.khongTranh, thieu:r3.thieu.length }));
  if (r3.quet < 80) fail(`③ chỉ dựng được ${r3.quet} tổ hợp (cần ~98) — cảnh hỏng, mệnh đề vô nghĩa`);
  else if (!r3.khongTranh)
    console.log('BỎ QUA vế nấc lùi: mọi dòng đều đã có tranh riêng — nhánh này hết chỗ dùng');
  else if (r3.thieu.length)
    fail(`③ ${r3.thieu.length}/${r3.quet} tổ hợp KHÔNG dựng được vũ khí: ${r3.thieu.slice(0,6).join(' · ')}…`);
  else pass(`③ cả ${r3.quet} tổ hợp đều có vũ khí (${r3.khongTranh} tổ hợp không có tranh riêng, nấc lùi theo lớp bịt hết)`);

  // ── ④ tay không thì vẫn không có vũ khí ──────────────────────────────────────────────
  const r4 = await p.evaluate(() => {
    for (const k in player.equip) player.equip[k] = null;
    calcDerived();
    return { nguon: !!thanKhiNguon(player) };
  });
  console.log('4) tay không:', JSON.stringify(r4));
  if (r4.nguon) fail('④ tay không mà vẫn dựng được vũ khí — nấc lùi phát vũ khí cho người cởi trần');
  else pass('④ tay không thì vẫn không có vũ khí nào');

  if (errs.length) fail('lỗi trang: ' + errs[0]);
  console.log('errors:', JSON.stringify(errs));
  console.log(bad === 0 ? 'ALL PASS' : `FAIL(${bad})`);
  await b.close(); process.exit(bad === 0 ? 0 : 1);
})();
