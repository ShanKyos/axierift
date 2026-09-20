// Cấp quái có đánh nổi không: với mỗi map, đặt người chơi ở ĐÚNG cấp mở map, mặc đồ đúng cấp,
// rồi đo thời gian hạ con gần điểm thả nhất và con xa nhất, xem có bị quái giết không.
//
// ⚠⚠ BÀI NÀY TỪNG IN "FAIL" MÀ MÃ THOÁT VẪN 0 — `tools/reg.sh` chấm bằng mã thoát nên nó được
// đếm là XANH trong lúc tự báo 12 chỗ hỏng. Và cả 12 chỗ đó là LỖI CỦA PHÉP ĐO, không phải lỗi
// cân bằng: ba thứ trong cảnh dựng đã mục đi mà không ai thấy, vì không ai đọc log của một bài
// "xanh". Ghi lại cả ba, vì mỗi cái là một bài học riêng:
//
// ① BẢNG CASES CHÉP CỨNG CẤP MAP. Nó ghi `['daohoa', 1]` — đúng hồi Đào Hoa là map khởi đầu.
//    Nay `daohoa` là Plant Tribe Glade với `min: 36`, còn map khởi đầu là `corran`. Tức bài
//    thả một nhân vật CẤP 1 vào giữa bầy quái lv38 rồi kết luận là cân bằng hỏng. Bảng cũng
//    bỏ sót 4 map có bãi quái (`corran` · `loimon` · `trungnut` · `caungam`).
//    ⇒ Suy cấp từ `md.min`, suy danh sách map từ chính `MAPS`. Thêm map mới là tự có mặt.
//
// ② ĐO NHÂN VẬT TRẦN. CLAUDE.md đã ghi nguyên văn cho `XP60PLUS_ANCHORS`: đo "không trang bị"
//    thì từ cấp 10 trở lên nhân vật CHẾT trước khi giết được con nào — tức một phép đo không
//    thể sinh ra kết luận mà nó tự nhận. Đo lại cả hai lối trên cùng một lượt chạy: trần ra
//    6/33 chỗ hỏng, mặc đồ đúng cấp ra **0/33**. `tools/do_nhipcap.cjs` vốn đã mặc đồ vì đúng
//    lý do này; bài này chỉ là đi theo.
//
// ③ `m.hp = def.hp` ĐÈ LÊN MÁU THẬT — cái này nặng nhất. `def.hp` trong bảng `MOBS` chỉ là
//    TRỌNG SỐ tương đối ("con này dày hơn bạn cùng cấp"); máu thật do `mobHp(def)` tính qua cả
//    đường cong cân bằng (`sucNguoi` · `mobNen` · `mobFlatDef` · `mobNhat`). Đo được ở
//    `bandao`: `def.hp` 1790 vs `mobHp` **744** — tức mọi trận dài gấp 2,4 lần thực tế, và
//    `m.maxHp` thì vẫn 744 nên máu còn lớn hơn máu trần. Một bài tên là "mobbalance" mà đo
//    những con số hệ cân bằng không dùng tới.
//    ⇒ Để `spawnMob` quyết máu. Nó là cửa duy nhất; đè lên là dựng nguồn sự thật thứ hai.
//
// Một thứ nữa đã sửa theo: chỗ đứng chép cứng `(1300, 950)` cho MỌI map — bốn map đã dựng lại
// lên khổ lớn (daohoa 4600×3400) nên toạ độ đó không còn nghĩa gì. Nay dùng `MAPS[map].spawn`.
const { chromium } = require('playwright');

const LOP = ['thieulam','toanchan','baidasan'];
// Quái GẦN ĐIỂM THẢ phải hạ được thoải mái ở đúng cấp mở map.
const MAU_SAN = 40;
const GIAY_TRAN = 90;
// ⚠ BẢY LƯỢT BỐC ĐỒ CHO MỖI CẢNH ĐƯỢC CHẤM, RỒI LẤY TRUNG VỊ — đừng hạ con số này xuống.
// `genItem` bốc ngẫu nhiên, nên MỘT lượt bốc là một nhân vật may hay xui chứ không phải một
// nhân vật tiêu biểu. Nhiễu dồn vào đúng MỘT chỗ: `Axie Sa Ngã` (lv38, con dày nhất trong nhóm)
// ở cửa `daohoa`/`loimon` — cùng một cảnh, bảy lượt bốc đồ ra dải máu còn **17–52%** và thời
// gian hạ swing 4,2s → 25s. Cảnh lành thì dải chỉ 2 điểm (nhanmon DW: 63–65%).
// Cách chữa là HẠ NHIỄU, không phải hạ sàn (CLAUDE.md, mục test_bophan: *"cộng dồn nhiều nhịp
// hơn … đừng nới ngưỡng"*). Đo bên dưới để chọn, không đoán — biên còn lại trên sàn 40%,
// ba lượt chạy mỗi mức:
//
//   LOT=1 → dư  8 · 10 ·  3 điểm   (12s)   ← sẽ đỏ vì xúc xắc
//   LOT=3 → dư  2 ·  8 ·  5 điểm   (26s)   ← trung vị của 3 mẫu vẫn quá động khi dải rộng 35 điểm
//   LOT=5 → dư 13 · 16 ·  6 điểm   (38s)
//   LOT=7 → dư 13 · 10 · 12 điểm   (50s)   ← chọn cái này: không lượt nào dư dưới 10 điểm
//
// 50 giây còn rất xa trần 260 giây của reg.sh. Con xa nhất vẫn một lượt — nó không được chấm.
const LOT = 7;

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://localhost:8853/index.html');
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.waitForTimeout(700);

  const R = await p.evaluate(([LOP, GIAY_TRAN, LOT]) => {
    window.TEST_MODE = true; startGame('thieulam', null);
    // ⚠ SUY TỪ DỮ LIỆU, đừng chép cứng: mọi map ngoài trời CÓ BÃI QUÁI, ở đúng cấp mở của nó.
    // Sàn đấu (`pvp`) và Tầng Sâu (`dungeon`) cố ý không có bãi nào — xem CLAUDE.md.
    const CASES = Object.entries(MAPS)
      .filter(([, md]) => !md.pvp && !md.dungeon && (md.vung || []).length)
      .map(([id, md]) => [id, md.min || 1]);

    const res = [], canh = [];

    // DỰNG NGƯỜI: đúng cấp mở map, dồn điểm theo dòng chính của lớp, mặc đồ đúng cấp.
    // Trả về số ô đã mặc để chốt tự kiểm ở ngoài còn đọc được.
    function dungNguoi(sect, lv){
      startGame(sect, null);
      player.level = lv; player.free = (lv - 1) * 5; calcDerived(); vhAutoLearn();
      // dồn điểm tiềm năng theo đúng gợi ý build của lớp
      const src = SECTS[sect].atkSrc || { str: 2 };
      const key = Object.keys(src).sort((a, c) => src[c] - src[a])[0];
      player[key] += player.free; player.free = 0; calcDerived();
      // ĐỒ ĐÚNG CẤP — cùng cách `tools/do_nhipcap.cjs` làm (genItem rồi autoEquipBest).
      for (const s in player.equip) player.equip[s] = null;
      player.inv.length = 0;
      for (let i = 0; i < 48; i++){ const it = genItem(lv, 0, 'mob'); if (it) bagThem(it); }
      autoEquipBest(); calcDerived();
      return Object.values(player.equip || {}).filter(Boolean).length;
    }

    // MỘT TRẬN: thả đúng một con ở cạnh điểm thả rồi đánh tới khi một trong hai bên nằm xuống.
    function danhThu(map, mob){
      mobs.length = 0; effects.length = 0; projectiles.length = 0;
      player.x = MAPS[map].spawn.x; player.y = MAPS[map].spawn.y;
      player.hp = player.maxHp; player.qi = player.maxQi;
      spawnMob(mob, { x: player.x + 60, y: player.y, r: 1 });
      const m = mobs[0];                         // ⚠ KHÔNG đè m.hp — xem ③ ở đầu tệp
      let t = 0; const dt = 0.05;
      while (m.hp > 0 && !m.dead && t < GIAY_TRAN && player.hp > 0){
        player.face = Math.atan2(m.y - player.y, m.x - player.x);
        if (player.cd.basic <= 0) doBasic();
        // KHÔNG ép hồi chiêu — để hệ thống cooldown thật chạy, nếu không sẽ spam vô hạn
        if ((player.cd.a || 0) <= 0 && player.qi >= 25) castSkill('a');
        update(dt); t += dt;
      }
      const haDuoc = m.dead || m.hp <= 0;
      // không hạ được thì coi máu còn là 0 — để phép lấy trung vị xếp nó xuống đáy, đúng chỗ nó thuộc về
      return { giay: +t.toFixed(1), haDuoc,
               mauConLai: haDuoc ? Math.round(player.hp / player.maxHp * 100) : 0 };
    }

    for (const [map, lv] of CASES){
      for (const sect of LOP){
        // ⚠ `packsOf()`, không phải `md.packs` — md.packs là KẾT QUẢ của banRaiVung, và của map
        // chưa ai vào thì nó còn undefined (CLAUDE.md).
        let soO = dungNguoi(sect, lv);
        travelTo(map);
        const pk = packsOf(map).map(q => ({ ...q,
          d: Math.hypot(q.x - MAPS[map].spawn.x, q.y - MAPS[map].spawn.y) })).sort((a, c) => a.d - c.d);

        // ⚠ TỰ KIỂM CẢNH DỰNG TRƯỚC KHI CHẤM. Hai thứ có thể lặng lẽ hỏng và biến bài thành
        // xanh/đỏ vì lý do sai: map không còn bãi nào, và đồ không mặc được (rơi ngược về đúng
        // cái phép đo "nhân vật trần" mà bản này vừa gỡ).
        if (!pk.length){ canh.push({ map, sect, soBai: 0, soO, atk: Math.round(player.atk) }); continue; }

        // GẦN THẢ — được chấm, nên lấy trung vị của LOT lượt bốc đồ (xem chú thích ở `LOT`).
        const ganDef = MOBS[pk[0].mob];
        const mau = [];
        for (let k = 0; k < LOT; k++){
          if (k) { soO = Math.min(soO, dungNguoi(sect, lv)); travelTo(map); }
          mau.push(danhThu(map, pk[0].mob));
        }
        // ⚠ `soO` là số ô NHỎ NHẤT của cả LOT lượt, và phải ghi SAU vòng lặp. Bản đầu ghi trước nên chốt
        // tự kiểm chỉ soi đúng lượt đầu — sáu lượt bốc đồ sau đó có hỏng cũng không ai biết.
        canh.push({ map, sect, soBai: pk.length, soO, atk: Math.round(player.atk) });
        mau.sort((a, c) => a.mauConLai - c.mauConLai);
        const giua = mau[Math.floor(mau.length / 2)];
        res.push({ map, lv, sect: SECTS[sect].name, mob: ganDef.name, mobLv: ganDef.lv,
          vi: 'gần thả', ...giua,
          dai: mau[0].mauConLai + '-' + mau[mau.length - 1].mauConLai + '%' });

        // XA NHẤT — chỉ để đọc, nên một lượt là đủ.
        const xaDef = MOBS[pk[pk.length - 1].mob];
        res.push({ map, lv, sect: SECTS[sect].name, mob: xaDef.name, mobLv: xaDef.lv,
          vi: 'xa nhất', ...danhThu(map, pk[pk.length - 1].mob), dai: '—' });
      }
    }
    return { res, canh };
  }, [LOP, GIAY_TRAN, LOT]);

  const { res: r, canh } = R;

  // ── chốt tự kiểm: cảnh dựng có đúng là cảnh định dựng không ───────────────────────────────
  const canhHong = canh.filter(c => c.soBai < 1 || c.soO < 4);
  if (canhHong.length){
    console.log('✗ DỰNG CẢNH SAI — chưa chấm được gì:');
    canhHong.forEach(c => console.log('   ', c.map, c.sect, 'bãi:', c.soBai, 'ô đồ đã mặc:', c.soO));
    console.log('FAIL'); await b.close(); process.exit(1);
  }

  console.log('%s','map        lv   lớp             vị trí    quái                    mLv  giây  hạ?  HP còn  dải '+LOT+' lượt');
  for (const x of r) console.log(
    x.map.padEnd(10), String(x.lv).padStart(3), x.sect.padEnd(15), x.vi.padEnd(8),
    x.mob.padEnd(22), String(x.mobLv).padStart(4), String(x.giay).padStart(5),
    (x.haDuoc?' ✓ ':' ✗ '), String(x.mauConLai).padStart(3)+'%', ' ', x.dai);

  const gan = r.filter(x => x.vi === 'gần thả');
  const xa  = r.filter(x => x.vi === 'xa nhất');
  const hong = gan.filter(x => !x.haDuoc || x.mauConLai < MAU_SAN);

  console.log(`\n■ Quái GẦN ĐIỂM THẢ phải hạ được thoải mái (>${MAU_SAN}% máu còn) — hỏng: ${hong.length}/${gan.length}`);
  hong.forEach(x => console.log('   ✗', x.map, x.sect, x.mob, 'lv'+x.mobLv, x.giay+'s', x.mauConLai+'%'));
  const bienGan = gan.length ? Math.min(...gan.map(x => x.mauConLai)) : 0;
  // In ra biên còn lại để thấy nó MỎNG ĐI trước khi nó đỏ — một bài chỉ nói PASS/FAIL thì
  // không ai biết mình đang đứng cách vực bao xa.
  console.log(`   biên mỏng nhất (trung vị ${LOT} lượt): ${bienGan}% máu còn — sàn ${MAU_SAN}%, dư ${bienGan - MAU_SAN} điểm`);

  // ⚠ KHỐI DƯỚI ĐÂY CHỈ ĐỂ ĐỌC, KHÔNG CHẤM — và đó là chủ ý. Quái góc xa được THIẾT KẾ để
  // nguy hiểm với người vừa mở map, nên "chết ở đó" là đúng chứ không phải hỏng. Phần gradient
  // (cấp tăng theo khoảng cách tới điểm thả) đã có `test_vung §2` gác; đừng chép lại ở đây,
  // hai chỗ cùng gác một luật là bảo đảm chúng lệch nhau sau vài đợt sửa.
  console.log('■ Quái GÓC XA (thiết kế để nguy hiểm với người mới vào) — chỉ để đọc, không chấm:');
  xa.forEach(x => console.log('   ', x.map, x.sect, x.mob+' lv'+x.mobLv, x.giay+'s',
    x.haDuoc?'hạ được':'CHẾT', x.mauConLai+'%'));

  console.log('errors:', JSON.stringify(errs));
  const ok = hong.length === 0 && !errs.length;
  console.log(ok ? 'PASS' : 'FAIL');
  await b.close();
  process.exit(ok ? 0 : 1);
})();
