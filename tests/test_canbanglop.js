// CÂN BẰNG 5 LỚP — bài kiểm MIỄN NHIỄM FPS
//
// Vì sao bài này tồn tại: bộ 181 bài trước đó không có bài nào đo "một lớp có cày được không".
// Nên một lớp có thể tụt xuống 1/12 sức mạnh của lớp mạnh nhất mà mọi cổng vẫn xanh.
//
// ⚠⚠ HAI CÁCH ĐO SAI ĐÃ DẪM, CẢ HAI ĐỀU LÀM LỚP TẦM XA TRÔNG NHƯ ĐỒ BỎ — ĐỪNG LẶP LẠI:
//
//  1. ĐO BẰNG ĐỒNG HỒ THẬT (treo AUTO 60 giây rồi đếm mạng). `loop()` khai
//     `dt = Math.min(0.05, ...)`, tức DƯỚI 20 fps thì THỜI GIAN GAME CHẠY CHẬM LẠI so với đời
//     thực. Máy chạy bài kiểm không có GPU và tải thì lúc nặng lúc nhẹ, nên cùng một lớp đo ra
//     5,9 fps lượt này và 43 fps lượt sau — tức lượt đầu chỉ sống được 0,3× lượng thời gian game
//     của lượt sau. Số "mạng/phút" khi ấy đo CPU của máy chạy, không đo cái lớp đó mạnh yếu ra sao.
//     Đã có một bản báo cáo kết luận nhầm "AUTO chỉ chạy được cho lớp cận chiến" đúng vì lỗi này.
//
//  2. TỰ BƯỚC `update(0.1)`. Nghe thì miễn nhiễm fps thật, nhưng 0,1 giây VƯỢT chính cái trần
//     0,05 mà game tự đặt. Đạn bay 520 px/giây, nên mỗi bước nhảy 52 px trong khi cửa trúng của
//     một con quái chỉ là `m.def.size + 8` ≈ 24 px BÁN KÍNH. Đạn nhảy qua người mà không chạm —
//     tức phép đo âm thầm bắt mọi lớp bắn đạn phải trượt. Đo lại ở 1/60 thì Sylvan Ranger từ
//     20 mạng lên 33 mạng trên cùng một bãi.
//
//  ⇒ LUẬT: bài này tự bước `update(DT)` với DT = 1/60 (đúng nhịp game, dưới trần 0,05 và nhỏ hơn
//    cửa trúng của đạn). Kết quả KHÔNG phụ thuộc máy nhanh hay chậm — chỉ tốn nhiều hay ít thời
//    gian chờ. Đừng "tối ưu" bằng cách nâng DT lên.
//
// Hai mục:
//   §1 CẤU TRÚC (tức thì, không nhiễu) — năm chiêu ô-4 phải cùng một gia đình. Đây là mục bắt
//      được lỗi Spellblade mà không cần chạy một khung nào: ô-4 của nó từng là chiêu QUẠT 120°
//      bán kính 135 (19.085 px²) trong khi bốn lớp kia là vòng tròn r150-190 (70.686-113.411 px²),
//      lại còn tier 'so', mult thấp nhất bảng và `fx` RỖNG.
//   §2 CHẠY THẬT — năm lớp cùng một bãi, cùng cấp, cùng đồ rơi +0. Không lớp nào được tụt dưới
//      sàn, và chênh lệch cao/thấp không được vượt trần.
const { chromium } = require('playwright');
const PORT = process.argv[2] || '8853';

const DT = 1/60;                 // ⚠ xem ghi chú đầu tệp — đừng nâng
const GIAY = 30;                 // giây GAME mỗi lớp (không phải giây đồng hồ)
const MAP = 'tuyettinh';         // Bird Tribe Heights: 3 loài, bãi dày, giữa dải cấp
const LOP = ['thieulam','toanchan','baidasan','minhgiao','bug'];

// ── Ngưỡng: ĐO ĐƯỢC, không đoán (cùng luật với SAN_CHE trong test_domap) ──
// Đo 3 lượt × 30 giây game trên chính bãi này, đồ rơi +0 đúng cấp, dt 1/60:
//     Dark Knight 84.089 ST · Dark Wizard 74.316 · Sylvan Ranger 55.498
//     Dark Lord   40.996    · Spellblade  34.825
// Sàn đặt 12.000 = 34% mức thấp nhất hiện có (Spellblade 34.825), tức còn nguyên chỗ cho nhiễu
// ±22% đã đo mà vẫn bắt được một lớp tụt xuống một phần ba.
const SAN_ST = 12000;
// Chênh ST cao/thấp đo được: 2,41× (3 lượt) và 2,58× (3 lượt trước đó). Trần 3,6× = trên mức
// xấu nhất đã thấy một khoảng an toàn, nhưng vẫn chặn được một lớp tụt về 1/4 bảng.
const TRAN_CHENH = 3.6;

// ⚠ VÌ SAO KHÔNG CÓ KHẲNG ĐỊNH NÀO ĐẶT TRÊN SỐ MẠNG.
// Đã thử và đã bỏ: bài kiểm CHẬP CHỜN ngay ở hai lượt chạy liên tiếp trên cùng một bản mã —
// Spellblade ra 0 mạng lượt này, 1 mạng lượt sau; Dark Knight 7 rồi 16; chênh cao/thấp 10,0×
// rồi 16,0×. Một con quái ở bãi này có 4.320 máu, nên "số mạng" là hàm bậc thang: gặm một con
// tới 1% máu rồi chết một lần là bãi hồi đầy và cả công ấy về 0. Đặt ngưỡng lên một đại lượng
// như thế thì bài đỏ theo may rủi, mà bài chập chờn còn hại hơn không có bài (xem NHAT_KY).
// ST tích luỹ thì trơn: đo 3 lượt × 30 giây ra tản ±5% đến ±22% tuỳ lớp, đủ ổn để đặt ngưỡng.
// ⇒ Số mạng và số lần chết vẫn được IN RA làm chẩn đoán, nhưng không lớp nào đỏ vì chúng.
//
// NỢ ĐÃ BIẾT, ghi lại để đừng ai tưởng chỗ này đã xong:
// Cùng bộ đo trên: mạng/30 giây là DK 34,0 · DW 21,3 · Ranger 17,3 · DL 9,7 · Spellblade 2,7
// → chênh 12,6 lần, trong khi ST chỉ chênh 2,4 lần. Nghĩa là Spellblade GÂY được sát thương
// nhưng không KẾT LIỄU được: nó chết 5-6 lần mỗi 30 giây (Dark Knight chết 0), mà mỗi lần chết
// là `buildWorld()` dựng lại bãi và mọi con đang gặm dở hồi đầy máu.
// Gốc rễ đo được: Dark Knight ăn 87 ST trong 30 giây, Dark Lord ăn 9.284, Spellblade ăn 17.594.
// Dark Knight gần như bất khả xâm phạm vì `dk_cyclone` khai cd:0 KÈM kb:50 — nó khoá cứng cả bãi
// bằng hất lùi liên tục chứ không phải vì máu/giáp cao. Nâng hpMult/defMult của Spellblade lên
// ngang Dark Lord KHÔNG ăn thua (đo: 17.594 → 16.505 ST phải ăn, vẫn chết 4 lần).
// ⇒ Khi xử lý xong chỗ hất-lùi-vĩnh-viễn thì số mạng sẽ tự sát lại nhau; lúc ấy mới đặt được
//   ngưỡng lên nó mà không chập chờn.

(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport:{ width:1100, height:800 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e).split('\n')[0]));
  await p.goto('http://localhost:' + PORT + '/index.html');
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(700);
  let bad = 0; const fail = m => { console.log('FAIL', m); bad++; };
  const pass = m => console.log('PASS', m);

  // ───────────────────────── §1 CẤU TRÚC ─────────────────────────
  const cau = await p.evaluate(() => {
    window.TEST_MODE = true;
    const out = [];
    for (const sect in SIGNATURE_SKILL){
      const id = SIGNATURE_SKILL[sect], v = VOHOC_DEFS[id];
      if (!v){ out.push({ sect, id, thieu:true }); continue; }
      const fx = v.fx || {};
      // Diện tích chiêu phủ được — thứ quyết định "một lần tung trúng mấy con".
      // cone trong castVohoc: bán kính 135, nửa góc 1,05 rad ⇒ quạt 120°.
      // aoe: hình tròn bán kính fx.r. proj xuyên hàng: quy ước tính theo đường bắn.
      let dien = 0;
      if (v.type === 'cone'){ const R = fx.r || 135; dien = Math.round((2*1.05)/(2*Math.PI) * Math.PI*R*R); }
      else if (v.type === 'aoe') dien = Math.round(Math.PI * Math.pow(fx.r || 0, 2));
      else if (v.type === 'proj') dien = fx.pierce ? 999999 : 0; // xuyên cả hàng: không so bằng diện tích
      out.push({ sect, id, name:v.name, type:v.type, tier:v.tier, mult:v.mult, cd:v.cd,
                 dien, soFx:Object.keys(fx).length });
    }
    return out;
  });
  console.log('  ô-4 từng lớp:');
  for (const c of cau) console.log(`    ${String(c.sect).padEnd(10)} ${String(c.name).padEnd(16)} ${String(c.type).padEnd(4)} tier ${String(c.tier).padEnd(5)} mult ${String(c.mult).padStart(4)} cd ${String(c.cd).padStart(2)} · phủ ${c.dien === 999999 ? 'xuyên hàng' : c.dien + ' px²'} · ${c.soFx} hiệu ứng`);

  if (cau.some(c => c.thieu)) fail('SIGNATURE_SKILL trỏ tới chiêu không tồn tại: ' + cau.filter(c => c.thieu).map(c => c.id).join(', '));
  const rong = cau.filter(c => c.soFx === 0);
  if (rong.length) fail(`ô-4 có fx RỖNG: ${rong.map(c => c.sect + '/' + c.id).join(', ')} — bốn chiêu ô-4 kia đều có ít nhất một hiệu ứng, chiêu tuyệt chiêu mà không mang gì cả là dấu hiệu bị bỏ quên`);
  else pass('cả 5 chiêu ô-4 đều mang ít nhất một hiệu ứng');

  const soTier = cau.filter(c => c.tier === 'so');
  if (soTier.length) fail(`ô-4 còn ở bậc 'so': ${soTier.map(c => c.sect + '/' + c.id).join(', ')} — tuyệt chiêu của một lớp không được là chiêu bậc nhập môn`);
  else pass("không ô-4 nào còn ở bậc 'so'");

  const mults = cau.map(c => c.mult).filter(x => typeof x === 'number');
  const chenhMult = Math.max(...mults) / Math.min(...mults);
  if (chenhMult > 1.5) fail(`mult ô-4 chênh ${chenhMult.toFixed(2)}× (${Math.min(...mults)} → ${Math.max(...mults)}) — quá 1,5×`);
  else pass(`mult ô-4 chênh ${chenhMult.toFixed(2)}× (≤ 1,5×)`);

  // Diện tích phủ: chỉ so những chiêu ĐO ĐƯỢC bằng diện tích (bỏ qua proj xuyên hàng).
  const dienS = cau.map(c => c.dien).filter(d => d > 0 && d !== 999999);
  if (dienS.length >= 2){
    const chenhDien = Math.max(...dienS) / Math.min(...dienS);
    // Đo lúc viết bài: sau khi sửa Spellblade còn 3,7× (quạt 19.085 vs vòng tròn r170 90.792).
    // Trần 6,0× chặn được ca một lớp tụt xuống dưới 1/6 vùng phủ của lớp rộng nhất.
    if (chenhDien > 6.0) fail(`vùng phủ ô-4 chênh ${chenhDien.toFixed(1)}× (${Math.min(...dienS)} → ${Math.max(...dienS)} px²) — quá 6,0×, lớp hẹp nhất sẽ trúng quá ít mục tiêu mỗi lần tung`);
    else pass(`vùng phủ ô-4 chênh ${chenhDien.toFixed(1)}× (≤ 6,0×)`);
  }

  // ───────────────────────── §2 CHẠY THẬT ─────────────────────────
  const kq = [];
  for (const cls of LOP){
    const r = await p.evaluate(async ({ cls, MAP, DT, GIAY }) => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      window.TEST_MODE = true; startGame(cls, null);
      const md = MAPS[MAP], pk0 = packsOf(MAP) || [];
      const lvs = pk0.map(x => (MOBS[x.type || x.mob] || {}).lv).filter(Boolean);
      const lv = Math.max(md.min + 3, Math.min(...lvs));
      player.level = lv; player.lvPeak = lv; player.xp = 0; vhAutoLearn();
      // Đồ RƠI đúng cấp, +0, không Hoàn Hảo — mức trang bị của một người chơi bình thường ở
      // dải cấp này. Đo trên thân trần thì mọi lớp đều yếu như nhau và bài kiểm mất hết ý nghĩa.
      for (const s of ['vukhi','non','ao','tay','chan']){
        const it = genItem(lv, null, null, { slots:[s], perfect:0, plus9:0 });
        it.plus = 0; player.equip[s] = it;
      }
      calcDerived();
      player.hp = player.maxHp; player.qi = player.maxQi;
      player.potions = 99; player.manaPots = 99;
      player.reflect = 0;   // phản đòn ghi thẳng m.hp, không qua hurtMob — sẽ lọt khỏi phép đếm
      travelTo(MAP); await sleep(1000);
      // Đứng cạnh bãi THẤP CẤP NHẤT của map: chỗ dễ nhất, nên lớp nào không cày nổi ở đây thì
      // không cày nổi ở đâu cả.
      const pk = pk0.slice().sort((a, b) => ((MOBS[a.type||a.mob]||{}).lv || 0) - ((MOBS[b.type||b.mob]||{}).lv || 0))[0];
      player.x = pk.x + 40; player.y = pk.y + 30;
      if (typeof snapCamera === 'function') snapCamera();
      let tot = 0;
      const _oh = window.hurtMob;
      window.hurtMob = function(m, d, s, ...rest){ tot += d || 0; return _oh.call(this, m, d, s, ...rest); };
      if (!player.auto) toggleAuto();
      const k0 = player.kills || 0; let chet = 0;
      for (let i = 0; i < Math.round(GIAY/DT); i++){
        update(DT);
        if (typeof dead !== 'undefined' && dead){
          chet++; respawn(); player.hp = player.maxHp;
          if (curMap !== MAP) travelTo(MAP);
          player.x = pk.x + 40; player.y = pk.y + 30;
          if (!player.auto) toggleAuto();
        }
        if (i % 600 === 0) await sleep(0);   // nhả luồng, không đổi kết quả (bước cố định)
      }
      window.hurtMob = _oh;
      return { cls, ten:SECTS[cls].name, st:Math.round(tot), mang:(player.kills||0) - k0, chet, atk:Math.round(player.atk) };
    }, { cls, MAP, DT, GIAY });
    kq.push(r);
    console.log(`    ${r.ten.padEnd(14)} ST ${String(r.st).padStart(6)} · mạng ${String(r.mang).padStart(3)} · chết ${r.chet} · atk ${r.atk}`);
  }

  const yeu = kq.filter(r => r.st < SAN_ST);
  if (yeu.length) fail(`lớp không đạt sàn ${SAN_ST} ST trong ${GIAY} giây game: ${yeu.map(r => r.ten + ' (' + r.st + ')').join(', ')}`);
  else pass(`cả 5 lớp đều vượt sàn ${SAN_ST} ST`);

  const sts = kq.map(r => r.st);
  const chenh = Math.max(...sts) / Math.max(1, Math.min(...sts));
  if (chenh > TRAN_CHENH) fail(`chênh ST cao/thấp ${chenh.toFixed(2)}× > trần ${TRAN_CHENH}× (${kq.find(r => r.st === Math.max(...sts)).ten} vs ${kq.find(r => r.st === Math.min(...sts)).ten})`);
  else pass(`chênh ST giữa 5 lớp ${chenh.toFixed(2)}× (≤ ${TRAN_CHENH}×)`);

  // Chẩn đoán, KHÔNG phải khẳng định — xem ghi chú ở đầu tệp về chuyện số mạng chập chờn.
  const mangs = kq.map(r => r.mang);
  console.log(`  [chẩn đoán] mạng ${mangs.join('/')} · chênh ${(Math.max(...mangs)/Math.max(1,Math.min(...mangs))).toFixed(1)}× · chết ${kq.map(r => r.chet).join('/')}`);
  console.log('  [chẩn đoán] chênh số mạng còn lớn hơn chênh ST nhiều — nợ đã biết, xem đầu tệp.');

  console.log('errors:', errs);
  if (errs.length) fail('có lỗi trang: ' + errs[0]);
  console.log(bad ? `\n${bad} MỤC ĐỎ` : '\nALL PASS');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
