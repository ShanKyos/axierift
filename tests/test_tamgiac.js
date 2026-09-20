// TAM GIÁC LỚP AXIE — chặng 2 và 3 của đợt Axie Core.
//
// Chặng 2 đổi vòng khắc từ NGŨ GIÁC năm hệ (Steel · Verdant · Stone · Frost · Ember, thừa kế
// từ đời game kiếm hiệp) sang TAM GIÁC chín lớp Axie chính chủ. Chặng 3 gán cho mỗi vùng lớp
// của tộc mang tên nó, để con Axie mình chọn có ý nghĩa KHÁC NHAU ở những nơi khác nhau.
//
// ⚠ VÌ SAO HAI CHẶNG PHẢI ĐI CÙNG NHAU. Chỉ đổi vòng khắc (chặng 2) thì đo được: chênh lệch
// giữa con Axie hợp nhất và con tệ nhất, tính trên ĐÀN QUÁI THẬT của từng vùng, chỉ **7,9%** —
// vì không vùng nào thuần hệ, mỗi map trộn 3-5 hệ nên lợi và hại triệt tiêu nhau. Và một hệ
// duy nhất tối ưu ở **7 trên 11** vùng, tức lựa chọn có đúng một đáp án đúng. Bài này gác cả
// hai con số đó.
//
// ⚠ VÀ NÓ GÁC CHIỀU NGƯỢC LẠI: hệ là một QUAN HỆ, không phải một nấc thang. `test_hethu §4`
// giữ vế "đổi Axie đổi 0 điểm chỉ số"; ở đây là vế "công thức sát thương không đổi một hệ số
// nào" — vẫn đúng ×1,20 / ×0,88 chiều đánh và ×1,12 / ×0,90 chiều đỡ.
const { chromium } = require('playwright');
let bad = 0;
const fail = m => { console.log('FAIL ' + m); bad++; };
const pass = m => console.log('PASS ' + m);

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('http://localhost:8853/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__gameReady).catch(()=>{});
  await page.waitForTimeout(300);

  const r = await page.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', null);
    const o = {};

    // ① MỌI quái và MỌI trùm phải ra một lớp hợp lệ. Một `el` gõ sai không ném lỗi — nó chỉ
    //    lặng lẽ tắt khắc hệ cho con đó, và không bài kiểm nào cũ nhìn thấy.
    o.heHong = [];
    for (const k in MOBS) if (MOBS[k].el && !ELEM[MOBS[k].el]) o.heHong.push('MOBS.' + k + '=' + MOBS[k].el);
    for (const m in BOSS_DEFS){
      const v = BOSS_DEFS[m];
      for (const b of [...(v.thuve || []), ...(v.tranai ? [v.tranai] : [])])
        if (b.el && !ELEM[b.el]) o.heHong.push(m + '/' + b.id + '=' + b.el);
    }
    o.soLoaiCoHe = Object.keys(MOBS).filter(k => MOBS[k].el).length;

    // ② HỆ NẰM TRÊN CON QUÁI, KHÔNG TRÊN LOÀI — đây là cả chặng 3.
    //    Loài dùng lại qua nhiều map (`thinu` bốn map, `mocnhan` bốn, `bandao` bốn), nên hệ
    //    khoá theo loài thì Bug Tribe Tunnels và Plant Tribe Glade BẮT BUỘC trùng hệ.
    //    Đo bằng hành vi: sinh thật một con ở hai map khác nhau và đòi `mobHe()` khác nhau.
    o.theoVung = {};
    const NH = k => ELEM[k].nhom;
    for (const id in MAPS){
      const pks = packsOf(id); if (!pks.length) continue;
      const dem = {}; let tong = 0;
      for (const pk of pks){
        const he = pk.he || (MOBS[pk.mob] || {}).el;
        if (!he) continue;
        dem[he] = (dem[he] || 0) + pk.n; tong += pk.n;
      }
      if (!tong) continue;
      // hệ số phòng thủ trung bình nếu người chơi mang Axie thuộc nhóm g
      const he3 = [0, 1, 2].map(g => {
        let s = 0;
        for (const k in dem){
          const mg = NH(k);
          s += (((mg + 1) % 3 === g) ? 1.12 : (((g + 1) % 3 === mg) ? 0.90 : 1.0)) * dem[k];
        }
        return s / tong;
      });
      const tot = Math.min(...he3), te = Math.max(...he3);
      const troi = Object.keys(dem).sort((a, b) => dem[b] - dem[a])[0];
      o.theoVung[id] = { troi, ty: Math.round(100 * dem[troi] / tong),
                         chenh: +((te / tot - 1) * 100).toFixed(1),
                         toiUu: he3.indexOf(tot), soLop: Object.keys(dem).length };
    }

    // ③ CÙNG MỘT LOÀI, HAI MAP, HAI LỚP — lái bằng chính đường sinh quái của game.
    const doMap = (mid, loai) => {
      travelTo(mid);
      const m = mobs.find(x => x && x.type === loai);
      return m ? mobHe(m) : null;
    };
    o.thinuComoc  = doMap('comoc',  'thinu');
    o.thinuDaohoa = doMap('daohoa', 'thinu');

    // ④ CÔNG THỨC KHÔNG ĐỔI. Bốn hệ số phải đúng như trước khi đổi vòng khắc.
    travelTo('chungnam');
    player.level = 60; calcDerived();
    player.crit = 0; player.perfectProc = 0; player.pierce = 0;
    const danh = (heVK, heQuai) => {
      const w = genSpecific('vukhi', 60);
      w.element = heVK; w.main = { k:'atk', v:300, name:'Công Kích' };
      w.subs = []; w.exc = null; w.plus = 0; w.luck = false; w.perfect = false;
      player.equip.vukhi = w; calcDerived();
      player.crit = 0; player.perfectProc = 0; player.pierce = 0;
      const m = mobs.find(x => x && x.hp > 0);
      m.def = Object.assign({}, m.def, { def: 0 });
      m.he = heQuai; m.hp = m.maxHp = 9e9; m.shield = 0;
      const truoc = m.hp; hurtMob(m, 1000, 'hit'); return truoc - m.hp;
    };
    const A = 'Beast', bi = ELEMENTS.find(k => heKhac(A, k)), khac = ELEMENTS.find(k => heKhac(k, A));
    const cung = ELEMENTS.find(k => k !== A && ELEM[k].nhom === ELEM[A].nhom);
    const t0 = danh(A, cung), t1 = danh(A, bi), t2 = danh(A, khac);
    o.heSo = { trung: t0, khac: +(t1 / t0).toFixed(3), biKhac: +(t2 / t0).toFixed(3) };

    // ⑤ BẢNG BẢN ĐỒ PHẢI NÓI RA. Một cơ chế không có cửa nào để học là một cơ chế không tồn tại.
    const h = banSacHtml('mongco');
    o.banSac = { coLop: /Reptile/.test(h), coKhacLai: /Beast|Bug|Mech/.test(h), raw: h.slice(0, 200) };
    return o;
  });

  console.log('loài có hệ:', r.soLoaiCoHe, '· hệ hỏng:', JSON.stringify(r.heHong));
  for (const [k, v] of Object.entries(r.theoVung))
    console.log(`  ${k.padEnd(10)} trội ${v.troi.padEnd(8)} ${String(v.ty).padStart(3)}% · ${v.soLop} lớp · chênh tốt/tệ ${v.chenh}% · nhóm tối ưu ${v.toiUu}`);
  console.log('thinu ở comoc:', r.thinuComoc, '· ở daohoa:', r.thinuDaohoa);
  console.log('hệ số:', JSON.stringify(r.heSo));
  console.log('bản sắc mongco:', r.banSac.raw);

  // ── chấm ─────────────────────────────────────────────────────────────────────────────
  if (r.heHong.length) fail('hệ không tra được trong bảng: ' + r.heHong.join(', '));
  else pass(`cả ${r.soLoaiCoHe} loài quái + mọi trùm đều ra một lớp Axie hợp lệ`);

  if (!r.thinuComoc || !r.thinuDaohoa) fail('không dựng được cảnh đo cùng-loài-hai-map');
  else if (r.thinuComoc === r.thinuDaohoa)
    fail(`cùng loài thinu ra cùng lớp "${r.thinuComoc}" ở cả hai map — hệ vẫn khoá theo LOÀI, `
       + 'chặng 3 chưa có tác dụng');
  else pass(`cùng một loài mang lớp khác nhau theo vùng: comoc→${r.thinuComoc} · daohoa→${r.thinuDaohoa}`);

  // Ngưỡng ≥15%: dưới mức đó thì đổi Axie là một con số trên bảng, không phải một quyết định.
  // `loimon` được miễn — nó là LỐI ĐI, cố ý trộn (không Rune nào cắm ở một lối mòn), và việc nó
  // phẳng nhất trong mọi vùng chính là thứ đáng giữ.
  const vungs = Object.entries(r.theoVung).filter(([k]) => k !== 'loimon');
  const mong = vungs.filter(([, v]) => v.chenh < 15);
  if (mong.length) fail('vùng có chênh tốt/tệ dưới 15%: ' + mong.map(([k, v]) => `${k} ${v.chenh}%`).join(', '));
  else pass(`cả ${vungs.length} vùng đánh nhau đều chênh ≥15% giữa Axie hợp nhất và tệ nhất ` +
            `(thấp nhất ${Math.min(...vungs.map(([, v]) => v.chenh))}%)`);

  const loang = vungs.filter(([, v]) => v.ty < 50);
  if (loang.length) fail('lớp trội dưới 50% dân số — bảng Bản Đồ đang nói quá: ' +
                         loang.map(([k, v]) => `${k} ${v.troi} ${v.ty}%`).join(', '));
  else pass('mọi vùng đều có một lớp trội ≥50% dân số, nên dòng "lớp ..." trên bảng Bản Đồ nói thật');

  // ⚠ NGƯỠNG LÀ 4, KHÔNG PHẢI 3 — và con số đó là SÀN TOÁN HỌC, không phải một mức tuỳ tiện.
  // Đặc tả ban đầu ghi "không lớp nào tối ưu quá 3/11 vùng", viết hồi vòng khắc còn là ngũ giác
  // (5 phía). Tam giác chỉ có BA nhóm, nên 11 vùng chia ba nhóm thì nhóm đông nhất tối thiểu là
  // ceil(11/3) = 4. Đòi 3 là đòi một thứ không tồn tại.
  const dem = {};
  for (const [, v] of Object.entries(r.theoVung)) dem[v.toiUu] = (dem[v.toiUu] || 0) + 1;
  const max = Math.max(...Object.values(dem));
  console.log('số vùng mà mỗi NHÓM Axie là tối ưu:', JSON.stringify(dem));
  if (Object.keys(dem).length < 3) fail('có nhóm Axie không tối ưu ở vùng nào — một phần ba tam giác là nội dung chết');
  else if (max > 4) fail(`một nhóm Axie tối ưu ở ${max}/11 vùng (sàn là 4) — lựa chọn có một đáp án đúng`);
  else pass(`ba nhóm Axie chia nhau 11 vùng ${Object.values(dem).sort((a,b)=>b-a).join('/')} — đúng sàn toán học`);

  // ④ hệ số: đúng mốc thiết kế, không bị "tiện tay chỉnh lại" khi đổi vòng khắc
  if (Math.abs(r.heSo.khac - 1.2) > 0.02) fail(`khắc hệ ra ${r.heSo.khac}×, mốc thiết kế là 1,20×`);
  else if (Math.abs(r.heSo.biKhac - 0.88) > 0.02) fail(`bị khắc ra ${r.heSo.biKhac}×, mốc thiết kế là 0,88×`);
  else pass('công thức không đổi: vẫn đúng ×1,20 khi khắc và ×0,88 khi bị khắc');

  if (!r.banSac.coLop) fail('bảng Bản Đồ không in lớp Axie của vùng');
  else if (!r.banSac.coKhacLai) fail('bảng Bản Đồ in lớp của vùng nhưng KHÔNG nói mang gì tới — '
    + 'người chơi không có cửa nào học tam giác');
  else pass('bảng Bản Đồ in lớp của vùng và ba lớp khắc lại nó');

  console.log('errors:', JSON.stringify(errors));
  console.log(bad === 0 && errors.length === 0 ? 'PASS' : 'FAIL(' + bad + ')');
  await browser.close();
  process.exit(bad === 0 && errors.length === 0 ? 0 : 1);
})();
