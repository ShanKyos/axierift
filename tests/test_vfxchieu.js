// ✦ VFX CHIÊU CỦA NGƯỜI BÊN KIA — thấy chiêu nổ, KHÔNG ăn sát thương.
//
// Trước bản này `castT` đã đồng bộ nên người bên kia thấy TƯ THẾ niệm mà không thấy một tia lửa
// nào: đứng cạnh một Dark Wizard thả Meteorite thì trên màn chỉ có người vung tay trong khoảng
// không.
//
// ⚠ MỆNH ĐỀ NẶNG NHẤT LÀ ③, KHÔNG PHẢI ①. "Có vẽ ra không" thì nhìn một cái là biết. Thứ KHÔNG
// nhìn ra được là chiêu của người khác có âm thầm giết quái của mình hay không — và nếu có thì
// hai client tính sát thương hai kiểu, tức cả nền chiến đấu lệch nhau mà không ai lần ra.
//
// Chạy độc lập:  node tests/test_vfxchieu.js [cổng-game]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const net = require('net');

const CONG_GAME = process.argv[2] || '8853';
const GOC = 'http://localhost:' + CONG_GAME + '/index.html';
const REPO = process.env.AXIE_REPO || path.resolve(__dirname, '..');

function congTrong(){
  return new Promise(res => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); });
  });
}
const cho = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  let bad = 0; const fail = m => { console.log('FAIL', m); bad++; };
  const errs = [];

  const CONG_WS = await congTrong();
  const may = spawn(process.execPath, [path.join(REPO, 'server', 'bongnguoi.js')],
                    { env: { ...process.env, PORT: String(CONG_WS) }, stdio: ['ignore', 'pipe', 'pipe'] });
  const mayLog = [];
  may.stdout.on('data', d => mayLog.push(String(d)));
  may.stderr.on('data', d => mayLog.push('ERR ' + String(d)));
  process.on('exit', () => { try { may.kill('SIGTERM'); } catch {} });
  await cho(1200);
  if (may.exitCode !== null){ console.log('máy chủ chết ngay:', mayLog.join('')); console.log('FAIL(1)'); process.exit(1); }

  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const moTrang = async () => {
    const ctx = await b.newContext({ viewport: { width: 1100, height: 760 } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(String(e)));
    p.on('console', m => { if (m.type() === 'error' && !/404|ERR_CONNECTION|ERR_CERT/.test(m.text())) errs.push(m.text()); });
    await p.goto(GOC + '?net=ws://localhost:' + CONG_WS + '/ws');
    await p.waitForFunction(() => window.__gameReady).catch(() => {});
    await cho(600);
    return { ctx, p };
  };
  const vao = (t, lop, ten, dx) => t.p.evaluate(({ lop, ten, dx }) => {
    window.TEST_MODE = true; startGame(lop, null);
    player.name = ten; player.level = 90; player.lvPeak = 90;
    vhAutoLearn(); calcDerived();
    player.hp = player.maxHp; player.qi = player.maxQi;
    player.reflect = 0;
    travelTo('daohoa');
    player.x = 1500 + dx; player.y = 1500;
    // ⚠⚠ DỜI QUÁI RA XA, NẾU KHÔNG NGƯỜI NIỆM SẼ CHẾT GIỮA BÀI. Đo được ở bản đầu: tới mục ⑤
    // thì A ra `{dead:true, hp:0}` — nó đứng giữa bãi quái `daohoa` suốt 15 giây. Mà `castSkill`
    // `return` ngay dòng đầu khi `dead`, nên MỌI mục sau đó đo trên một nhân vật nằm dưới đất và
    // đọc ra "sợi dây đứt". Đúng họ với bẫy đã ghi trong CLAUDE.md: mục sau thừa hưởng cảnh của
    // mục trước, và cái chết thì không báo gì cả.
    //
    // Dời chứ KHÔNG xoá: mục ③ cần đúng một con quái còn sống để chứng minh VFX không gây sát
    // thương, và nó tự kéo `mobs[0]` về tâm chiêu.
    for (const m of mobs){ m.x = MAP.w - 300; m.y = MAP.h - 300; }
    return { map: curMap, x: Math.round(player.x), y: Math.round(player.y),
             id: window.NET && window.NET.id, soQuai: mobs.length };
  }, { lop, ten, dx });

  // Tung MỘT chiêu có thật của lớp đang chơi. Trả về mã chiêu đã tung, hoặc null.
  // ⚠ TRẢ VỀ `null` KHI NGƯỜI NIỆM ĐÃ CHẾT, đừng lặng lẽ không làm gì. `castSkill` `return`
  // ngay dòng đầu khi `dead`, nên một lời gọi trên xác chết trông y hệt một lời gọi thành công.
  const tung = t => t.p.evaluate(() => {
    if (dead) return null;
    const ds = (player.skillBar || []).filter(Boolean);
    for (const sid of ds){
      const i = skillInfo(sid);
      if (!i || !i.unlocked) continue;
      player.cd = {}; player.qi = player.maxQi; player.dinhT = 0;
      castSkill(sid);
      return sid;
    }
    return null;
  });

  // ⚠ ĐẾM GÓI TỚI NƠI, ĐỪNG ĐẾM HIỆU ỨNG CÒN SỐNG. Hiệu ứng hết hạn sau 0,4-0,7 giây, nên
  // `effects.length` đo ra số SỐNG SÓT chứ không phải số NHẬN — và với một phép chờ 600 ms thì
  // hai con số ấy khác nhau hàng chục lần. Bản đầu của tôi đếm `effects.length` và mục ⑥ xanh
  // kể cả khi đã gỡ hẳn hạn nhịp của máy chủ.
  const demNhan = t => t.p.evaluate(() => {
    window.__nhan = 0;
    const _n = window.netChieuNhan;
    window.netChieuNhan = (d) => { window.__nhan++; return _n(d); };
  });
  const docNhan = t => t.p.evaluate(() => window.__nhan || 0);
  const datLai = t => t.p.evaluate(() => { window.__nhan = 0; effects.length = 0; });
  // Cửa sổ hạn nhịp của máy chủ là 12 gói / 2 giây. Mục nào bắn dồn thì mục SAU phải chờ hết
  // cửa ấy, nếu không nó đo trên một sợi dây đang bị chính bài kiểm bịt lại.
  const choCuaTroi = () => cho(2300);

  const A = await moTrang(), B = await moTrang();
  const ra = await vao(A, 'baidasan', 'Wizard', -60); await cho(350);
  const rb = await vao(B, 'thieulam', 'Knight', 60);
  await cho(1300);

  // tự kiểm cảnh dựng
  const thay = { a: await A.p.evaluate(() => window.NETPLAYERS.length),
                 b: await B.p.evaluate(() => window.NETPLAYERS.length) };
  console.log(`0) A=(${ra.x},${ra.y}) id${ra.id} · B=(${rb.x},${rb.y}) id${rb.id} · thấy nhau ${JSON.stringify(thay)}`);
  if (thay.a !== 1 || thay.b !== 1){ console.log('FAIL cảnh dựng: hai bên chưa thấy nhau'); bad++; }

  // ── ① CỬA GỬI LÀ `spawnSkillVfx`, KHÔNG PHẢI CHÍN CHỖ GỌI ───────────────────────────
  // Móc tay từng chỗ gọi thì chỗ thứ mười thêm sau lặng lẽ không đồng bộ. Bài này chứng minh
  // cửa nằm ở HÀM: gọi thẳng `spawnSkillVfx` (không qua `castSkill`) cũng phải gửi.
  const r1 = await A.p.evaluate(() => {
    const goi = [];
    const _g = window.netChieu;
    window.netChieu = (o) => { goi.push(o); return _g(o); };
    spawnSkillVfx('test_ao', { color:'#ff0000', glyph:'✦' }, 'cast', 0.5, 70);
    window.netChieu = _g;
    return goi;
  });
  console.log('1) gọi thẳng spawnSkillVfx ⇒ gửi:', JSON.stringify(r1));
  if (r1.length !== 1) fail('① `spawnSkillVfx` không gửi — cửa gửi không nằm trong hàm');
  else if (r1[0].id !== 'test_ao' || r1[0].ph !== 'cast') fail('① gói gửi sai nội dung: ' + JSON.stringify(r1[0]));
  else console.log('   ✓ cửa gửi nằm trong hàm, chiêu mới thêm tự có mặt');

  // ── ② NGƯỜI BÊN KIA VẼ RA, VÀ VẼ Ở CHỖ NGƯỜI NIỆM ───────────────────────────────────
  // ⚠ Vế sau mới là vế khó. Nếu `spawnSkillVfx` vẫn đọc `player.x` thì hiệu ứng nổ ở chỗ NGƯỜI
  // XEM đứng — trông vẫn "có vẽ ra", nên một mệnh đề chỉ đếm số hiệu ứng sẽ XANH trong lúc mọi
  // chiêu của người khác nổ dưới chân mình.
  await B.p.evaluate(() => { effects.length = 0; });
  const sid = await tung(A);
  await cho(260);
  const r2 = await B.p.evaluate(() => ({
    so: effects.length,
    ds: effects.map(e => ({ type:e.type, x:Math.round(e.x), y:Math.round(e.y) })),
    toi: { x: Math.round(player.x), y: Math.round(player.y) },
    ho: window.NETPLAYERS.map(n => ({ x:Math.round(n.x), y:Math.round(n.y) }))[0],
  }));
  console.log(`2) A tung "${sid}" ⇒ B có ${r2.so} hiệu ứng · B ở (${r2.toi.x},${r2.toi.y}) · A (theo B) ở (${r2.ho.x},${r2.ho.y})`);
  console.log('   ' + JSON.stringify(r2.ds.slice(0, 3)));
  if (!sid){ console.log('FAIL cảnh dựng ②: lớp này không tung được chiêu nào'); bad++; }
  else if (!r2.so) fail('② A niệm chiêu mà B không thấy hiệu ứng nào');
  else {
    const dToi = Math.min(...r2.ds.map(e => Math.hypot(e.x - r2.toi.x, e.y - r2.toi.y)));
    const dHo  = Math.min(...r2.ds.map(e => Math.hypot(e.x - r2.ho.x,  e.y - r2.ho.y)));
    console.log(`   gần B nhất ${dToi.toFixed(0)}px · gần A nhất ${dHo.toFixed(0)}px`);
    if (dHo > dToi) fail(`② hiệu ứng nổ gần NGƯỜI XEM hơn người niệm (${dToi.toFixed(0)} vs ${dHo.toFixed(0)}px)`
                       + ' — `spawnSkillVfx` còn đọc `player.x` thay vì người niệm');
    else if (dHo > 120) fail(`② hiệu ứng nổ cách người niệm ${dHo.toFixed(0)}px — không neo vào ai cả`);
    else console.log('   ✓ vẽ ra, và neo vào NGƯỜI NIỆM');
  }

  // ── ③ VFX KHÔNG GÂY SÁT THƯƠNG ──────────────────────────────────────────────────────
  // Mệnh đề quan trọng nhất. Hai client tính sát thương hai kiểu là cả nền chiến đấu lệch nhau
  // mà không ai lần ra. Dựng một con quái GIẢ ngay cạnh B rồi bắn 8 chiêu từ A.
  const r3 = await B.p.evaluate(async () => {
    // ⚠⚠ TẮT PHẢN ĐÒN NGAY TRƯỚC KHI ĐO, KHÔNG PHẢI LÚC DỰNG NHÂN VẬT. `player.reflect` ghi
    // THẲNG vào `m.hp` (không qua `hurtMob`), và `travelTo` gọi `calcDerived()` ở cuối nên mọi
    // lần đặt `reflect = 0` trước đó đều bị tính lại. Đo được: quái đứng cách 120px vẫn đánh
    // tới, và phản đòn 0,05 gặm đúng 5 máu trong 8 nhịp — mà mệnh đề này đòi "mất ĐÚNG 0 máu".
    //
    // Tôi đã suýt "sửa" một cơ chế vốn ĐÚNG vì con số ấy. Thứ cứu là phép ĐỐI CHỨNG: cho A
    // KHÔNG tung gì cả thì quái vẫn mất đúng 5 máu. Luật chung đã ghi trong CLAUDE.md — bài
    // kiểm nào đòi "mất đúng 0 máu" mà để quái trong tầm phản đòn thì sẽ đỏ vì một cơ chế khác.
    player.reflect = 0;
    const ho = window.NETPLAYERS[0];
    const m = mobs[0];
    if (!m) return { thieuQuai: true };
    m.x = ho.x; m.y = ho.y; m.hp = m.maxHp; m.dead = false;
    return { hp0: m.hp, maxHp: m.maxHp, x: Math.round(m.x), y: Math.round(m.y), reflect: player.reflect };
  });
  if (r3.thieuQuai){ console.log('FAIL cảnh dựng ③: map không có con quái nào để đo'); bad++; }
  else if (r3.reflect){ console.log(`FAIL cảnh dựng ③: phản đòn còn ${r3.reflect} — phép đo sẽ đỏ vì cơ chế khác`); bad++; }
  else {
    // ⚠ Ghim lại mỗi lượt: `calcDerived()` chạy ở nhiều nhịp (hồi máu, buff hết hạn) và sẽ
    // dựng lại `reflect` giữa chừng. Một lần tắt lúc đầu là không đủ.
    for (let i = 0; i < 8; i++){
      await B.p.evaluate(() => { player.reflect = 0; });
      await tung(A); await cho(120);
    }
    await cho(300);
    const sau = await B.p.evaluate(() => { const m = mobs[0]; return { hp: m && m.hp, dead: m && m.dead, reflect: player.reflect }; });
    console.log(`3) quái của B tại (${r3.x},${r3.y}): máu ${r3.hp0} → ${sau.hp}`);
    if (sau.hp < r3.hp0) fail(`③ CHIÊU CỦA NGƯỜI KHÁC GIẾT QUÁI CỦA MÌNH (${r3.hp0} → ${sau.hp}) — `
                            + 'VFX phải là HÌNH, sát thương nằm ở `castVohoc`/`castSkill`');
    else console.log('   ✓ mất đúng 0 máu — VFX là hình, không phải đòn');
  }

  // ── ④ KHÔNG DỘI VÔ TẬN ──────────────────────────────────────────────────────────────
  // `spawnSkillVfx` gửi từ bên trong, nên nếu bên NHẬN quên truyền `nguoi` thì nó gửi ngược
  // lại — hai client bắn qua bắn lại mãi mãi, và triệu chứng là máy chủ nghẽn chứ không phải
  // một lỗi đọc ra được.
  await choCuaTroi();                 // mục ③ vừa bắn 8 gói — chờ cửa hạn nhịp trôi hết
  await demNhan(B);
  await B.p.evaluate(() => {
    const goi = [];
    const _g = window.netChieu;
    window.netChieu = (o) => { goi.push(o); return _g(o); };
    window.__demDoi = goi;
  });
  await datLai(B);
  await tung(A);
  await cho(600);
  const r4 = await B.p.evaluate(() => ({ doi: (window.__demDoi || []).length, nhan: window.__nhan || 0 }));
  console.log(`4) A tung 1 chiêu ⇒ B NHẬN ${r4.nhan} · B gửi lại ${r4.doi}`);
  // ⚠ TỰ KIỂM TRƯỚC KHI CHẤM. "B không gửi lại" là vô nghĩa nếu B chưa nhận được gì — và đó
  // chính là chuyện đã xảy ra ở bản đầu: mục ③ bắn 8 gói làm đầy cửa 12/2s của máy chủ, nên
  // cú của mục này bị BỎ QUA, B nhận 0, và mệnh đề xanh mà chưa kiểm được gì.
  if (!r4.nhan){ console.log('FAIL cảnh dựng ④: B không nhận được chiêu nào nên phép đo rỗng'); bad++; }
  else if (r4.doi > 0) fail(`④ bên nhận GỬI NGƯỢC LẠI ${r4.doi} gói — vòng dội vô tận`);
  else console.log('   ✓ B nhận được mà không gửi ngược');

  // ── ⑤ CHIÊU CỦA MAP KHÁC KHÔNG LỌT SANG ─────────────────────────────────────────────
  // ⚠ PHẢI CÓ ĐỐI CHỨNG CÙNG MAP. "Khác map thì nhận 0" đúng cả khi sợi dây đứt hẳn — nên đo
  // trước một lượt CÙNG map để chứng minh đường đi đang thông, rồi mới đổi map.
  await choCuaTroi();
  await datLai(B);
  await tung(A); await cho(500);
  const cungMap = await docNhan(B);
  await B.p.evaluate(() => { travelTo('ngoai'); });
  await cho(900);
  await choCuaTroi();
  await datLai(B);
  await tung(A);
  await cho(500);
  const r5 = await B.p.evaluate(() => ({ nhan: window.__nhan || 0, so: effects.length, map: curMap }));
  const tinhA = await A.p.evaluate(() => ({ dead, hp: Math.round(player.hp), map: curMap }));
  console.log(`5) cùng map B nhận ${cungMap} · B sang "${r5.map}" thì nhận ${r5.nhan} (hiệu ứng ${r5.so}) · A: ${JSON.stringify(tinhA)}`);
  if (tinhA.dead){ console.log('FAIL cảnh dựng ⑤: người niệm đã CHẾT — mọi phép đo sau đó rỗng'); bad++; }
  else if (!cungMap){ console.log('FAIL cảnh dựng ⑤: cùng map cũng không nhận được — sợi dây đứt, phép đo rỗng'); bad++; }
  else if (r5.nhan > 0 || r5.so > 0) fail('⑤ chiêu của map khác vẫn tới nơi — lọc theo map hỏng');
  else console.log('   ✓ cùng map thì thấy, khác map thì không');

  // ── ⑥ MÁY CHỦ CHẶN BẮN DỒN ──────────────────────────────────────────────────────────
  // Chiêu có hồi chiêu nên người thật không vượt nổi; một client sửa đổi thì bắt cả phòng VẼ.
  await B.p.evaluate(() => { travelTo('daohoa'); });
  await cho(900);
  await choCuaTroi();
  await datLai(B);
  const banDon = await A.p.evaluate(() => {
    let n = 0;
    for (let i = 0; i < 80; i++)
      if (window.netChieu({ id:'test_don', mau:'#fff', gly:'✦', ph:'cast', ang:0, R:50, x0:null, y0:null })) n++;
    return n;
  });
  await cho(700);
  const nhan = await docNhan(B);
  console.log(`6) A bắn dồn ${banDon} gói ⇒ B NHẬN ${nhan} gói`);
  if (!banDon){ console.log('FAIL cảnh dựng ⑥: A không gửi được gói nào'); bad++; }
  else if (nhan >= banDon) fail(`⑥ máy chủ chuyển tiếp hết ${nhan}/${banDon} — không có hạn nhịp`);
  else console.log(`   ✓ máy chủ cắt ${banDon} xuống còn ${nhan}`);

  if (errs.length){ console.log('lỗi trang:', errs.slice(0, 5)); fail('có lỗi JS trên trang'); }
  await b.close(); may.kill('SIGTERM');
  console.log(bad ? `FAIL(${bad})` : 'PASS — thấy chiêu của nhau, và nó là hình chứ không phải đòn');
  process.exit(bad ? 1 : 0);
})();
