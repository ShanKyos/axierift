// ĐO NHỊP CẤP THẬT — bao lâu thì lên một cấp khi treo AUTO?
//
//   node tools/do_nhipcap.js [cổng]        (mặc định 8853; cần một máy chủ tĩnh phục vụ public/game)
//
// Vì sao cần tệp này: `XP60PLUS_ANCHORS` trong game.js được tính từ một CÔNG THỨC trên giấy —
// chú thích tại chỗ ghi rõ "atk cơ bản theo calcDerived — KHÔNG TRANG BỊ". Nhưng người chơi thật
// thì có trang bị, nên con số neo ấy chưa bao giờ được đối chiếu với vòng chạy thật của game.
// Tệp này chạy CHÍNH vòng `update()` của game rồi đếm EXP thu được, nên nó đo cái đang xảy ra
// chứ không đo cái lẽ ra phải xảy ra.
//
// ⚠ BƯỚC CỐ ĐỊNH dt = 1/60, KHÔNG đo bằng đồng hồ thật. Hai lý do, cả hai đều đã làm hỏng một
// bản đo trước đó (xem đầu tests/test_canbanglop.js):
//   · `loop()` kẹp dt ở 0,05 ⇒ máy dưới 20 fps chạy game CHẬM lại, nên "EXP mỗi phút đồng hồ"
//     thật ra đo tốc độ CPU của máy đo.
//   · bước 0,1 thì đạn nhảy 52 px mỗi khung trong khi cửa trúng chỉ ~24 px ⇒ lớp bắn đạn trượt
//     oan, và EXP của hai lớp tầm xa bị đo thiếu.
//
// KẾT QUẢ LẦN CHẠY ĐẦU (2026-09-14, bản aca6802, 120 giây game mỗi lượt):
//   trung vị 1,02 giờ/cấp — tức ĐƯỜNG EXP ĐANG ĐÚNG mục tiêu 1 giờ/cấp mà chú thích
//   XP60PLUS_ANCHORS đặt ra. KHÔNG cần neo lại. Thứ tản mạnh là CHÊNH LỆCH GIỮA CÁC LỚP:
//   cùng cấp 112 cùng bãi, Dark Knight ra 59,3 triệu EXP/giờ còn Spellblade ra 0.
//   ⇒ Đừng "sửa nhịp cấp" bằng cách kéo đường EXP; chỗ hỏng nằm ở cân bằng lớp.
//
// ⚠ ĐO NHIỀU LỚP RỒI LẤY TRUNG VỊ. Neo theo một lớp là neo theo lớp ấy: cùng một bãi, chênh
// lệch ST giữa lớp cao nhất và thấp nhất đo được 1,9-2,8 lần. Trung vị của 5 lớp mới là "người
// chơi trung bình".
const { chromium } = require('playwright');
const PORT = process.argv[2] || '8853';
// Số giây GAME mỗi lượt. ⚠ ĐỪNG hạ xuống 30: ở dải cấp 100+ một con quái cho hơn 11.000 EXP nên
// 30 giây chỉ ra 0-3 mạng, và phép đo biến thành "đếm 0/1/2/3" — số EXP/giờ khi ấy nhảy theo bội
// số nguyên của một mạng (đo thật đã ra đúng 1×/2×/3× của cùng một số). Cỡ mẫu phải đủ lớn thì
// trung vị mới có nghĩa; tệp này in luôn SỐ MẠNG để ai đọc cũng thấy được cỡ mẫu.

const DT = 1/60;
const GIAY = +(process.argv[3] || 90);  // giây GAME mỗi lượt đo
const LOP = ['thieulam','toanchan','baidasan','minhgiao','bug'];
// Mốc cấp × map mà một người chơi ở cấp ấy thật sự cày. Lấy từ dải cấp khai trong MAPS.
const MOC = [
  { lv:63,  map:'tuyettinh' }, { lv:70,  map:'tuyettinh' },
  { lv:84,  map:'mongco'    }, { lv:92,  map:'mongco'    },
  { lv:103, map:'nhanmon'   }, { lv:112, map:'nhanmon'   },
];

const trungVi = a => { const s = a.slice().sort((x, y) => x - y); const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m-1] + s[m]) / 2; };

(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport:{ width:1100, height:800 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e).split('\n')[0]));
  await p.goto('http://localhost:' + PORT + '/index.html');
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(700);

  const bang = [];
  for (const m of MOC){
    const xph = [], mangs = []; let qlv = 0;
    for (const cls of LOP){
      const r = await p.evaluate(async ({ cls, MAP, LV, DT, GIAY }) => {
        const sleep = ms => new Promise(r => setTimeout(r, ms));
        window.TEST_MODE = true; startGame(cls, null);
        player.level = LV; player.lvPeak = LV; player.xp = 0; vhAutoLearn();
        for (const s of ['vukhi','non','ao','tay','chan']){
          const it = genItem(LV, null, null, { slots:[s], perfect:0, plus9:0 });
          it.plus = 0; player.equip[s] = it;
        }
        calcDerived();
        player.hp = player.maxHp; player.qi = player.maxQi;
        player.potions = 99; player.manaPots = 99; player.reflect = 0;
        travelTo(MAP); await sleep(900);
        // ⚠ CHỌN BÃI NHƯ NGƯỜI CHƠI CHỌN, ĐỪNG LUÔN LẤY BÃI THẤP NHẤT.
        // computeKillRewards phạt EXP theo chênh cấp: `_diff = P.level - d.lv`, quá 5 cấp thì
        // -15%/cấp, sàn 10%. Bản đo đầu tiên của tệp này luôn đứng ở bãi thấp nhất map, nên ở
        // cấp 92 (bãi thấp nhất Reptile Sunstone Flats là quái cấp 84) nó ăn đúng xpMul 0,55 và
        // ở cấp 112 thì 0,25 — đo ra "6,47 rồi 17,06 giờ/cấp" trông như game hỏng, trong khi đó
        // chỉ là phép đo tự chọn chỗ cày dở nhất. Người chơi thật lên bãi cao hơn.
        // ⇒ lấy bãi DỄ NHẤT trong số những bãi KHÔNG bị phạt (lv >= cấp người chơi - 5).
        const pk0 = packsOf(MAP) || [];
        const _lv = m => (MOBS[m.type || m.mob] || {}).lv || 0;
        const _sap = pk0.slice().sort((a, b) => _lv(a) - _lv(b));
        const pk = _sap.find(x => _lv(x) >= player.level - 5) || _sap[_sap.length - 1];
        player.x = pk.x + 40; player.y = pk.y + 30;
        if (typeof snapCamera === 'function') snapCamera();
        if (!player.auto) toggleAuto();
        // EXP phải cộng DỒN qua các lần lên cấp: gainXp() trừ bớt player.xp mỗi khi thăng cấp,
        // nên đọc mình player.xp ở cuối là đo thiếu đúng bằng phần đã tiêu để lên cấp.
        let xpDon = 0; const _og = window.gainXp;
        window.gainXp = function(a){ xpDon += a || 0; return _og.apply(this, arguments); };
        let chet = 0; const k0 = player.kills || 0;
        for (let i = 0; i < Math.round(GIAY/DT); i++){
          update(DT);
          if (typeof dead !== 'undefined' && dead){
            chet++; respawn(); player.hp = player.maxHp;
            if (curMap !== MAP) travelTo(MAP);
            player.x = pk.x + 40; player.y = pk.y + 30;
            if (!player.auto) toggleAuto();
          }
          if (i % 600 === 0) await sleep(0);
        }
        window.gainXp = _og;
        return { xp:Math.round(xpDon), chet, mang:(player.kills||0) - k0, quaiLv:_lv(pk) };
      }, { cls, MAP:m.map, LV:m.lv, DT, GIAY });
      xph.push(Math.round(r.xp / GIAY * 3600)); mangs.push(r.mang); qlv = r.quaiLv;
    }
    const tv = trungVi(xph);
    const can = await p.evaluate(lv => XP_TABLE[lv-1], m.lv);
    bang.push({ ...m, xph, tv, can, gio: can / tv, mang:mangs });
    console.log(`cấp ${String(m.lv).padStart(3)} @ ${m.map.padEnd(10)} EXP/giờ 5 lớp: ${xph.map(x => String(x).padStart(9)).join('')}  → trung vị ${String(tv).padStart(9)}  · cần ${String(can).padStart(9)} · = ${(can/tv).toFixed(2)} giờ/cấp  [quái C${qlv} · mạng ${mangs.join('/')}]`);
  }

  const gios = bang.map(r => r.gio), tvGio = trungVi(gios);
  console.log(`\nTrung vị ${tvGio.toFixed(2)} giờ/cấp (mục tiêu thiết kế: 1,00) · nhanh nhất ${Math.min(...gios).toFixed(2)} · chậm nhất ${Math.max(...gios).toFixed(2)}`);
  // ⚠ CHỈ đề xuất neo lại khi trung vị LỆCH THẬT. Đường EXP là thứ mọi người chơi đang sống
  // trong đó; sửa nó vì một phép đo lệch còn hại hơn để yên.
  if (tvGio >= 0.75 && tvGio <= 1.35){
    console.log('⇒ Đường EXP ĐANG ĐÚNG NHỊP THIẾT KẾ — KHÔNG cần neo lại. Đừng sửa XP60PLUS_ANCHORS.');
    console.log('   Phần tản còn lại là chênh lệch GIỮA CÁC LỚP, không phải lỗi của đường EXP:');
    for (const r of bang) console.log(`     cấp ${String(r.lv).padStart(3)}: 5 lớp ra ${Math.min(...r.xph).toLocaleString()} → ${Math.max(...r.xph).toLocaleString()} EXP/giờ (chênh ${(Math.max(...r.xph)/Math.max(1,Math.min(...r.xph))).toFixed(0)}×)`);
    console.log('   ⇒ việc cần làm nằm ở cân bằng lớp (tests/test_canbanglop.js), không nằm ở đây.');
  } else {
    console.log('⇒ Lệch nhịp. Neo đề xuất để trung vị về 1,0 giờ/cấp:');
    console.log('const XP60PLUS_ANCHORS = [');
    for (const r of bang) console.log(`  [${r.lv},${r.tv}],   // đo: ${r.gio.toFixed(2)} giờ/cấp với bảng hiện tại`);
    console.log('];');
  }
  console.log('errors:', errs);
  await b.close();
})();
