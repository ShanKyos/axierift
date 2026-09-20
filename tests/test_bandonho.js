// BẢN ĐỒ GÓC MÀN (minimap) — phải ĐỌC RA MỘT CÁI THÀNH, và phải nói CÙNG MỘT THỨ với bản đồ lớn.
//
// Vì sao bài này tồn tại. Chủ dự án mở bản đồ lên và nói đúng một câu: *"nhìn rất rối"*. Đo ra
// ba lỗi chồng lên nhau, và **không lỗi nào ném ra một dòng nào**:
//
//  1. ⚠ TRÀN CỘT, BỊ XÉN 23%. `capNhatKhungMinimap()` chốt trần bề rộng **240px** bằng một con
//     số chép tay, trong khi `#cot-phai` rộng 190 (lòng **180**) và mang `overflow:hidden`.
//     Đo ở cả 1920 · 1440 · 1280: canvas 240 trong cột 180 ⇒ **mất 23% bên phải**, đúng góc có
//     Lò Hỗn Độn và Vũ Khí. `style.css` vốn khai đúng (`#minimap { width:180px }`) nhưng style
//     NỘI TUYẾN mà hàm kia ghi thì thắng bảng kiểu.
//  2. ⚠ KHÔNG VẼ HÌNH CÁI THÀNH. Ardhaven có sẵn 68 đỉnh `diTrong`, 8 đường phố và 16 khối nhà
//     trong dữ liệu — bản đồ LỚN vẽ hết, bản đồ GÓC vẽ không một cái nào: một mảng màu phẳng
//     rồi rải 28 chấm lên. Hai bản đồ dựng từ cùng một dữ liệu mà ra hai thứ khác hẳn nhau.
//  3. ⚠ 26 NPC CÙNG MỘT CHẤM VÀNG. 17 trong số đó là người lore; cái Lò Rèn không phân biệt nổi
//     với một người đứng kể chuyện. Bản đồ lớn đã tách hai hạng ấy từ lâu (`THANH_TALK`).
//
// Và một lỗi thứ tư mà chỉ ẢNH CHỤP mới lộ ra: tên map in ra `…Chiefdom` thay vì
// `Sapidae Chiefdom`, vì `textAlign` RÒ từ vòng NPC phía trên (để lại `'center'`) nên dòng tên
// bị căn giữa tại x=6 và mất đầu.
const { chromium } = require('playwright');
const PORT = process.argv[2] || '8853';
let bad = 0; const fail = m => { bad++; console.log('FAIL ' + m); };
const ok = m => console.log('  ✓ ' + m);

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e).split('\n')[0]));
  await p.goto(`http://localhost:${PORT}/index.html?test=1`, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__gameReady, null, { timeout: 20000 }).catch(() => {});
  await p.evaluate(() => {
    window.TEST_MODE = true; startGame('thieulam', { name: 'BanDo' });
    player.level = 40; player.lvPeak = 40; closePanels();
    document.querySelectorAll('.tut-box,#tut').forEach(e => e.remove());
  });
  await p.waitForTimeout(1200);

  // ── ① KHÔNG ĐƯỢC TRÀN KHỎI CỘT ────────────────────────────────────────────────────────
  // Đo ở BA bề rộng khung nhìn: ở đúng một bề rộng thì một trần chép tay cũng có thể vừa khít
  // ăn may — cùng bài học đã ghi cho `test_muigio` và cho khối chồng lấn cột phải.
  for (const [vw, vh] of [[1920,1080],[1440,900],[1280,720]]){
    await p.setViewportSize({ width: vw, height: vh });
    await p.waitForTimeout(350);
    const r = await p.evaluate(() => {
      const m = document.getElementById('minimap').getBoundingClientRect();
      const c = document.getElementById('cot-phai').getBoundingClientRect();
      const cs = getComputedStyle(document.getElementById('cot-phai'));
      return { tran: Math.round(m.right - c.right), rong: Math.round(m.width),
               cot: Math.round(c.width), an: cs.overflow };
    });
    if (r.tran > 0) fail(`① ${vw}×${vh}: bản đồ tràn ${r.tran}px khỏi cột (overflow:${r.an}) — phần ấy bị xén, im lặng`);
    else ok(`① ${vw}×${vh}: vừa cột (${r.rong}px trong ${r.cot}px)`);
  }
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.waitForTimeout(350);

  // ── ② PHẢI VẼ HÌNH CÁI THÀNH, không phải một mảng màu phẳng ───────────────────────────
  // Đo bằng ĐIỂM ẢNH của khối nhà (`#6d6a52`) và của phố. Hỏi "có gọi veNenThanh không" thì
  // một lời gọi vẽ ra ngoài khung cũng xanh; đếm điểm ảnh thì không lách được.
  const s2 = await p.evaluate(() => {
    const c = document.getElementById('minimap');
    const g = c.getContext('2d');
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let nha = 0, pho = 0, tong = c.width * c.height;
    for (let i = 0; i < d.length; i += 4){
      const R = d[i], G = d[i+1], B = d[i+2];
      if (Math.abs(R-109) < 10 && Math.abs(G-106) < 10 && Math.abs(B-82) < 10) nha++;
      if (Math.abs(R-120) < 14 && Math.abs(G-118) < 14 && Math.abs(B-92) < 14) pho++;
    }
    const md = mapDef();
    return { nha, pho, tong, khoi: ((window.MAP_OBSTACLES||{})[curMap]||[]).length,
             duong: (md.isoDuong||[]).length, dinh: (md.diTrong||[]).length };
  });
  console.log('②', JSON.stringify(s2));
  if (!s2.khoi || !s2.duong) fail('② cảnh dựng sai: map đo không có khối nhà/đường phố trong dữ liệu');
  else if (s2.nha < 60) fail(`② chỉ ${s2.nha} điểm ảnh khối nhà trên ${s2.tong} — bản đồ góc không vẽ ${s2.khoi} khối nhà mà dữ liệu đã có`);
  else if (s2.pho < 60) fail(`② chỉ ${s2.pho} điểm ảnh đường phố — không vẽ ${s2.duong} đường mà dữ liệu đã có`);
  else ok(`② vẽ ra hình cái thành: ${s2.nha} px khối nhà · ${s2.pho} px phố`);

  // ── ③ NGƯỜI CÓ CHỨC NĂNG PHẢI ĐƯỢC GỌI TÊN, kể cả map đông ───────────────────────────
  // Đây là mệnh đề nặng nhất. Ardhaven có 9 người có chức năng, **7 người trong số đó nằm gần
  // như cùng một hàng** (y≈27 trên khổ 180×90) với tổng bề rộng nhãn ~250px trên một hàng rộng
  // 180 — tức phép xếp nhãn phải thật sự xoay xở, không phải chỉ in ra rồi thôi.
  const s3 = await p.evaluate(() => window.__miniNhan);
  console.log('③', JSON.stringify(s3));
  if (!s3) fail('③ không đọc được `__miniNhan` — cờ bài kiểm chưa bật');
  else if (s3.chucNangCan < 6) fail(`③ cảnh dựng sai: map đo chỉ có ${s3.chucNangCan} người có chức năng, chưa đủ chật để kiểm`);
  else if (s3.chucNangDat < s3.chucNangCan)
    fail(`③ ${s3.chucNangDat}/${s3.chucNangCan} người có chức năng được gọi tên — thiếu: ai không có tên thì với người chơi là không tồn tại`);
  else ok(`③ đủ ${s3.chucNangDat}/${s3.chucNangCan} nhãn: ${s3.ten.join(' · ')}`);

  // ── ④ TÊN MAP KHÔNG ĐƯỢC CỤT ─────────────────────────────────────────────────────────
  // `textAlign` là trạng thái CANVAS, nó sống qua mọi lệnh vẽ. Vòng NPC ngay trên để lại
  // `'center'`, nên dòng tên bị căn giữa tại x=6 và mất đầu — ảnh chụp ra `…Chiefdom`.
  const s4 = await p.evaluate(() => window.__miniTen);
  console.log('④', JSON.stringify(s4));
  if (!s4) fail('④ không đọc được `__miniTen`');
  else if (s4.canLe !== 'left') fail(`④ tên map vẽ với textAlign='${s4.canLe}' tại x=${s4.x} — căn giữa/phải tại mép trái là mất đầu tên`);
  else if (s4.x + s4.rong > s4.khung) fail(`④ tên "${s4.ten}" rộng ${s4.rong}px, tràn khỏi khung ${s4.khung}px`);
  else ok(`④ tên map đủ chữ: "${s4.ten}" (${s4.rong}px trong ${s4.khung}px)`);

  // ── ⑤ HAI BẢN ĐỒ PHẢI NÓI CÙNG MỘT THỨ ───────────────────────────────────────────────
  // Không hỏi "có dùng chung hàm không" — hỏi thẳng MÀU vẽ ra tại đúng chỗ một NPC đứng, trên
  // CẢ HAI bản đồ. Dùng chung hàm mà một bên tô đè màu khác thì câu hỏi kia vẫn xanh.
  // ⚠ HAI LẦN QUE DÒ SAI TRƯỚC KHI RA ĐƯỢC PHÉP ĐO ĐÚNG — ghi lại vì cùng một họ:
  //  1. Đọc ĐÚNG MỘT điểm ảnh ở tâm mỗi NPC ⇒ báo 6/9 lệch. Sai: nhãn chữ (kèm nét viền đen
  //     2,5px), chấm người đứng cạnh, khung nhìn camera và dấu nhiệm vụ đều vẽ ĐÈ lên tâm ấy.
  //     Phép đo bắt được lớp TRÊN CÙNG, không bắt được cái chấm.
  //  2. Đọc một mảng 9×9 quanh tâm ⇒ còn 3/9 lệch. Vẫn sai, và lần này vì THIẾT KẾ chứ không
  //     vì lỗi: ở khổ 180×90 có bảy người đứng gần như cùng một hàng, nên nhãn của người bên
  //     cạnh phủ kín cả cái chấm 6px. Mà nhãn thì **tô đúng cùng màu ấy**, nên thông tin không
  //     hề mất — chỉ phép đo mất.
  // ⇒ Hỏi đúng thứ mệnh đề này muốn biết: *hai bản đồ có dùng chung một bảng màu không*. Mỗi
  //   hạng chức năng có mặt trên map thì màu của nó phải XUẤT HIỆN ở cả hai bản đồ (chấm hay
  //   nhãn đều được). Cách này miễn nhiễm với chuyện ai vẽ đè lên ai.
  const s5 = await p.evaluate(() => {
    const dem = (cv, hex) => {
      const g = cv.getContext('2d');
      const d = g.getImageData(0, 0, cv.width, cv.height).data;
      const R = parseInt(hex.slice(1,3),16), G = parseInt(hex.slice(3,5),16), B = parseInt(hex.slice(5,7),16);
      let n = 0;
      for (let i = 0; i < d.length; i += 4)
        if (Math.abs(d[i]-R) < 18 && Math.abs(d[i+1]-G) < 18 && Math.abs(d[i+2]-B) < 18) n++;
      return n;
    };
    const mini = document.getElementById('minimap');
    const lon = veBanDoThanh(curMap, 560, 280);
    const hang = [...new Set(NPCS.filter(n => n.map === curMap && THANH_TALK[n.talk]).map(n => n.talk))];
    return hang.map(t => ({ talk: t, mau: THANH_TALK[t].mau,
                            mini: dem(mini, THANH_TALK[t].mau), lon: dem(lon, THANH_TALK[t].mau) }));
  });
  {
    const lech = s5.filter(r => !r.mini || !r.lon);
    console.log('⑤', JSON.stringify(s5));
    if (s5.length < 4) fail(`⑤ cảnh dựng sai: map đo chỉ có ${s5.length} hạng chức năng, chưa đủ để so hai bảng màu`);
    else if (lech.length)
      fail(`⑤ ${lech.length}/${s5.length} hạng vắng màu ở một trong hai bản đồ (${lech.map(r=>r.talk+' mini='+r.mini+' lớn='+r.lon).join(', ')}) — hai bản đồ dùng hai bảng ký hiệu`);
    else ok(`⑤ cả ${s5.length} hạng chức năng cùng bảng màu ở hai bản đồ`);
  }

  if (errs.length) fail('lỗi trang: ' + errs.join(' · '));
  await b.close();
  console.log(bad ? `\n${bad} LỖI` : '\nOK — bản đồ góc đọc ra một cái thành, và khớp bản đồ lớn');
  process.exit(bad ? 1 : 0);
})();
