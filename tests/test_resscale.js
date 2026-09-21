// Độ phân giải vẽ: hạ xuống phải thật sự nhanh hơn, VÀ bấm chuột phải trúng đúng chỗ.
const { chromium } = require('playwright');
let bad = 0; const fail = m => { bad++; console.log('FAIL ' + m); };
const measure = (p, ms=3000) => p.evaluate(async (ms) => {
  const t=[]; let last=performance.now();
  await new Promise(r=>{ const t0=performance.now();
    const f=()=>{ const n=performance.now(); t.push(n-last); last=n;
      if(n-t0<ms) requestAnimationFrame(f); else r(); }; requestAnimationFrame(f); });
  const s=t.slice(5).sort((a,b)=>a-b); return +(1000/s[s.length>>1]).toFixed(1);
}, ms);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport:{width:1280,height:900} });
  const errs = []; p.on('pageerror', e => errs.push(String(e).split('\n')[0]));
  // ⚠ CỔNG LẤY TỪ argv, ĐỪNG CHÉP CỨNG. Bản cũ ghi thẳng `localhost:8853` và bỏ qua argv[2],
  //    nên `node test_resscale.js <cổng>` lặng lẽ chạy vào server ĐANG có ở 8853 chứ không vào
  //    cổng được truyền. Ba lượt thử ngược của đợt này vì thế ra ba kết quả GIỐNG HỆT nhau và
  //    đều xanh — que dò hỏng, không phải mã đúng. `reg.sh` thì `sed` cổng nên nó không lộ.
  //    (Vết sẹo "bốn bài chép cứng cổng" đã ghi trong CLAUDE.md; đây là bài thứ năm.)
  const PORT = process.argv[2] || '8853';
  await p.goto(`http://localhost:${PORT}/index.html?max=1`, { waitUntil:'load' });
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', null); });
  await p.waitForTimeout(700);

  // 1. mặc định phải là 100% và tự chỉnh
  const r1 = await p.evaluate(() => ({ res: RES, auto: RES_AUTO,
    cw: document.getElementById('game').width, vw: window.innerWidth }));
  console.log('1) mặc định:', JSON.stringify(r1));
  if (r1.res !== 1) fail('mặc định phải là 100%, đang là ' + r1.res);
  if (r1.cw !== r1.vw) fail(`bộ đệm ${r1.cw} khác cửa sổ ${r1.vw} ở mức 100%`);

  // 2. đặt tay 60% → bộ đệm nhỏ đi, CSS vẫn phủ kín
  const r2 = await p.evaluate(() => { setRes(0.6);
    const c = document.getElementById('game'), r = c.getBoundingClientRect();
    return { res: RES, auto: RES_AUTO, cw: c.width, ch: c.height,
             cssW: Math.round(r.width), cssH: Math.round(r.height), W, H,
             vw: window.innerWidth, vh: window.innerHeight }; });
  console.log('2) đặt tay 60%:', JSON.stringify(r2));
  if (Math.abs(r2.cw - r2.vw*0.6) > 2) fail(`bộ đệm ${r2.cw} không phải 60% của ${r2.vw}`);
  if (r2.cssW !== r2.vw || r2.cssH !== r2.vh) fail('canvas không còn phủ kín cửa sổ sau khi hạ độ nét');
  // W/H là kích thước LOGIC và phải GIỮ NGUYÊN: hạ độ nét là chuyện đồ hoạ, không được thu hẹp
  // tầm nhìn — nếu không, máy yếu nhìn được ít thế giới hơn máy khoẻ, tức là đổi luôn lối chơi.
  if (r2.W !== r2.vw || r2.H !== r2.vh) fail(`hạ độ nét làm co tầm nhìn: W/H ${r2.W}x${r2.H} thay vì ${r2.vw}x${r2.vh}`);
  if (r2.auto !== false) fail('chọn tay rồi mà vẫn còn ở chế độ tự chỉnh');

  // 3. bấm chuột phải phải trúng đúng chỗ trong thế giới, không lệch theo tỉ lệ
  const r3 = await p.evaluate(async () => {
    player.auto = false; travelTo('comoc');
    player.x = 900; player.y = 900; camera.x = 0; camera.y = 0;
    moveTarget = null;
    const c = document.getElementById('game');
    c.dispatchEvent(new MouseEvent('contextmenu', { clientX: 500, clientY: 400, bubbles: true }));
    return moveTarget ? { x: Math.round(moveTarget.x), y: Math.round(moveTarget.y) } : null;
  });
  // Camera 0,0 ⇒ điểm CSS (500,400) là điểm thế giới (500/zoom, 400/zoom) — camera CÓ zoom
  // (xem ZOOM_MUC). Thứ bài này gác là ĐỘ NÉT: RES không được lọt vào phép đổi toạ độ chuột.
  // Nên mốc phải tính theo zoom thật, không chép cứng — nếu nhân RES vào thì lệch tiếp một lần nữa.
  const zoom3 = await p.evaluate(() => zoomNow());
  const dx3 = 500 / zoom3, dy3 = 400 / zoom3;
  console.log(`3) chuột phải ở CSS(500,400) khi độ nét 60%, zoom ${zoom3} → thế giới:`, JSON.stringify(r3));
  if (!r3) fail('chuột phải không đặt được đích');
  else if (Math.hypot(r3.x - dx3, r3.y - dy3) > 70)
    fail(`đích lệch: mong ~(${Math.round(dx3)},${Math.round(dy3)}) nhưng ra (${r3.x},${r3.y}) — độ nét không được làm lệch chuột`);

  // 4. hạ độ nét phải thật sự nhanh hơn
  await p.evaluate(() => { FXQ_AUTO = false; setFxq(2); RES_AUTO = false; travelTo('daohoa'); });
  await p.waitForTimeout(1200);
  await p.evaluate(() => setRes(1)); await p.waitForTimeout(500);
  const f100 = await measure(p);
  await p.evaluate(() => setRes(0.6)); await p.waitForTimeout(500);
  const f60 = await measure(p);
  console.log(`4) FPS 100% = ${f100}  ·  60% = ${f60}`);
  // CHỈ khẳng định khi máy thật sự đang đuối. Nếu ở 100% đã chạm trần vsync (~60) thì hạ độ nét
  // KHÔNG THỂ nhanh hơn được nữa — không có gì để chứng minh, và bắt nó nhanh hơn là biến bài
  // kiểm thành phép đo tốc độ MÁY CHẠY BÀI KIỂM chứ không phải phép đo tính năng.
  // Đã vấp thật: máy dựng game hôm trước cho 34 FPS ở 100%, hôm sau cho 58,8 và bài kiểm ngã.
  if (f100 < 55){
    if (f60 <= f100 + 2) fail(`máy đang đuối (${f100} FPS) mà hạ độ nét không nhanh lên (${f60})`);
  } else {
    console.log(`   (máy đã chạm trần vsync ở 100% — bỏ qua mệnh đề tốc độ, không có gì để chứng minh)`);
  }

  // 5. cài đặt phải lưu lại qua lần mở sau
  await p.evaluate(() => setRes(0.75));
  const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('vlcm_settings')||'{}').res);
  console.log('5) đã lưu res =', saved);
  if (Math.abs(saved - 0.75) > 0.001) fail('không lưu độ nét vào Cài Đặt, ra ' + saved);
  await p.reload({ waitUntil:'load' });
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', null); });
  await p.waitForTimeout(700);
  const after = await p.evaluate(() => ({ res: RES, auto: RES_AUTO, W, H,
    cw: document.getElementById('game').width, vw: window.innerWidth }));
  console.log('   sau khi tải lại:', JSON.stringify(after));
  if (Math.abs(after.res - 0.75) > 0.001) fail('mở lại game không giữ độ nét đã chọn');
  if (Math.abs(after.cw - after.vw*0.75) > 2) fail('mở lại game bộ đệm không đúng tỉ lệ');
  if (after.W !== after.vw) fail('mở lại game tầm nhìn bị co theo độ nét');
  if (after.auto !== false) fail('mở lại game lại nhảy về tự chỉnh');

  // 6. 'auto' đặt lại được
  await p.evaluate(() => setRes('auto'));
  const au = await p.evaluate(() => ({ auto: RES_AUTO, saved: JSON.parse(localStorage.getItem('vlcm_settings')||'{}').res }));
  console.log('6) về tự chỉnh:', JSON.stringify(au));
  if (!au.auto || au.saved !== 'auto') fail('không quay về tự chỉnh được');

  // 7. Tự chỉnh phải THẬT SỰ chạy: máy này không có card đồ hoạ nên mức Đầy ở 100% chắc chắn
  //    tụt dưới 60 — bộ tự chỉnh phải hạ hiệu ứng TRƯỚC, hết đường rồi mới hạ độ nét.
  await p.evaluate(() => { setFxq('auto'); setRes('auto'); FXQ = 2; RES = 1; resize();
    SETTINGS.perfHud = false; travelTo('daohoa');
    // ⚠ GHI MỨC KHỞI ĐIỂM NGAY LÚC ĐẶT, không đợi đo xong rồi mới đọc. Bản cũ lấy `before` sau
    // 3 giây và so mọi thứ với nó — mà bộ tự chỉnh có thể đã hạ MỘT NẤC trong chính 3 giây ấy.
    // Bắt được thật: một lượt chạy ghi `before.fxq = 1` trong khi dòng ngay trên vừa đặt FXQ = 2,
    // rồi kết luận "không hạ gì cả". Lấy kết quả của việc hạ để phủ nhận rằng đã hạ.
    window.__fxTruotMax = 0;   // §1-6 đã chạy game rồi; không xoá thì mốc này mang theo cảnh cũ
    window.__q0 = { fxq: FXQ, res: RES }; });
  //    Phải đo FPS *TRƯỚC* khi bộ tự chỉnh kịp làm gì. Bản cũ đo ở CUỐI 30 giây rồi lấy con số
  //    đó phán xét: máy chạy 59.9 FPS thì "không được hạ gì". Nhưng máy chạy được 59.9 CHÍNH LÀ
  //    NHỜ nó vừa hạ hiệu ứng — lấy kết quả để phủ nhận nguyên nhân. Bài chỉ đỏ khi bộ tự chỉnh
  //    làm việc TỐT tới mức vượt ngưỡng 55, nên càng tối ưu game thì càng hay đỏ.
  //    Bản trước lấy MỘT mẫu 3 giây rồi phán xét cho 30 giây sau đó: "máy giữ được 59,5 FPS
  //    nên bộ tự chỉnh không được hạ gì". Mệnh đề đó không đứng vững — một mẫu 3 giây không
  //    chứng minh được 30 giây kế tiếp cũng trên ngưỡng, mà FPS trên máy dựng thì lên xuống
  //    theo tải của cả máy. Tụt một nhịp giữa chừng rồi hạ chất lượng CHÍNH LÀ việc bộ tự chỉnh
  //    phải làm, vậy mà bài kiểm tính đó là hỏng: chạy hai lượt trên cùng một commit ra một
  //    xanh một đỏ.
  //    Nay lấy FPS THẤP NHẤT trong suốt cửa sổ quan sát. Nếu chưa từng tụt xuống dưới ngưỡng
  //    thì mới thật sự là "không có lý do gì để hạ". Bộ tự chỉnh hạ xong thì FPS lên lại, nhưng
  //    mẫu thấp nhất vẫn giữ được cú tụt đã gây ra việc hạ đó.
  await p.waitForTimeout(3000);
  const before = await p.evaluate(() => ({ fxq: FXQ, res: RES, fps: _perf.fps }));
  const mau = [], vet = [];
  for (let i = 0; i < 30; i++){
    await p.waitForTimeout(1000);
    const o = await p.evaluate(() => ({ f: _perf.fps, res: RES, fxq: FXQ }));
    if (o.f) mau.push(o.f);
    vet.push(o);
  }
  if (before.fps) mau.push(before.fps);
  const sx = mau.slice().sort((a,b)=>a-b);
  const day = sx.length ? sx[0] : 0;                    // thấp nhất
  const giua = sx.length ? sx[sx.length >> 1] : 0;      // TRUNG VỊ
  const q0 = await p.evaluate(() => window.__q0);
  const tuned = await p.evaluate(() => ({ fxq: FXQ, res: RES, fps: _perf.fps,
    cw: document.getElementById('game').width, W }));
  console.log('7) tự chỉnh:', JSON.stringify(q0), '→', JSON.stringify(tuned),
              `· FPS trung vị = ${giua}, thấp nhất = ${day} (${mau.length} mẫu)`);
  // ⚠ ĐÒI HỎI PHẢI KHỚP VỚI ĐIỀU KIỆN KÍCH HOẠT CỦA CHÍNH TÍNH NĂNG, không được chặt hơn.
  // Nó CỐ Ý không phản ứng với một cú tụt lẻ — "hạ nhanh, nâng chậm" là để chất lượng đừng
  // nhấp nháy quanh ngưỡng. Bản cũ lại bắt: hễ MỘT mẫu 1 giây bất kỳ trong 33 giây tụt dưới 55
  // thì bộ tự chỉnh BẮT BUỘC phải hạ — chặt hơn thiết kế, nên nó đỏ đúng vào lúc tính năng hành
  // xử đúng, và đỏ ngẫu nhiên theo tải của máy chạy bài kiểm.
  // ⚠ MỐC NAY LÀ TỈ LỆ KHUNG TRƯỢT NHỊP, hỏi thẳng `TRUOT_HA` trong mã. Bản trước neo vào
  // `1000/21` — trung vị mili-giây — mà chính cái trung vị đó là thứ vừa bị gỡ: rAF khoá theo
  // nhịp quét nên `ms` chỉ nhận 16,7 hoặc 33,3, và trung vị nhảy về 16,7 ngay khi 51% khung kịp
  // nhịp. Một con số chép từ ngưỡng cũ vào bài kiểm là một mỏ neo chỉ vào chỗ không còn gì.
  const tk = await p.evaluate(() => ({ max: window.__fxTruotMax, ng: TRUOT_HA }));
  console.log(`   trượt nhịp cao nhất trong cửa sổ: ${(tk.max*100).toFixed(0)}% (ngưỡng hạ ${(tk.ng*100).toFixed(0)}%)`);
  if (tk.max != null && tk.max > tk.ng){
    if (tuned.fxq >= q0.fxq && tuned.res >= q0.res)
      fail(`đã có cửa sổ trượt nhịp ${(tk.max*100).toFixed(0)}% (trên ngưỡng ${(tk.ng*100).toFixed(0)}%) mà bộ tự chỉnh không hạ gì cả`);
    else console.log(`   (đuối bền → đã hạ xuống fxq ${tuned.fxq} · res ${tuned.res}, nay ${tuned.fps} FPS)`);
  } else if (day >= 55){
    console.log(`   (chưa lúc nào tụt dưới 55 FPS — thấp nhất ${day} — nên không hạ gì là đúng)`);
    if (tuned.fxq < q0.fxq || tuned.res < q0.res)
      fail(`suốt cửa sổ chưa lúc nào tụt dưới 55 FPS (thấp nhất ${day}) mà bộ tự chỉnh vẫn hạ chất lượng`);
  } else {
    // Có tụt nhưng không tụt bền: đúng vùng bộ tự chỉnh được quyền làm gì cũng được. Không
    // khẳng định gì ở đây — khẳng định bừa chính là chỗ bài này chập chờn bấy lâu.
    console.log(`   (tụt lẻ nhưng không bền — trung vị ${giua}, thấp nhất ${day} — bộ tự chỉnh hạ hay không đều hợp lệ)`);
  }
  // ⚠ GÁC CHIỀU HẠ QUA VẾT ĐI, KHÔNG QUA TRẠNG THÁI CUỐI. Bản cũ chốt `res < 1 ⇒ fxq === 0`,
  // đúng hồi chiều NÂNG đi cùng thứ tự với chiều hạ. Nay chiều nâng là GƯƠNG (độ nét trước,
  // hiệu ứng sau), nên trạng thái "nét 0,6 · hiệu ứng 1" là hợp lệ và thường gặp: hạ hết cỡ rồi
  // trả lại hiệu ứng vì còn dư. Bất biến còn lại là về CHUYỂN TIẾP: không bao giờ HẠ độ nét
  // trong lúc hiệu ứng chưa kịch đáy.
  for (let k = 1; k < vet.length; k++){
    if (vet[k].res < vet[k-1].res - 1e-6 && vet[k-1].fxq > 0)
      fail(`hạ độ nét ${vet[k-1].res} → ${vet[k].res} trong lúc hiệu ứng còn ở mức ${vet[k-1].fxq} — phải hạ hiệu ứng trước`);
  }
  if (tuned.W !== 1280) fail('tự chỉnh làm co tầm nhìn');
  if (Math.abs(tuned.cw - 1280*tuned.res) > 2) fail('bộ đệm không khớp RES sau khi tự chỉnh');

  // 8. LÁI THẲNG `fxAutoTune` BẰNG DÒNG DỮ LIỆU DỰNG SẴN — hai mệnh đề TẤT ĐỊNH.
  //
  //    ⚠ Bản đầu của hai mục này đo qua CẢNH THẬT (vào map 130 quái, chờ 50 giây; ép chất lượng
  //    xuống đáy rồi về thành, chờ 30 giây). Chúng chạy được và nói ra số đẹp — nhưng THỬ NGƯỢC
  //    CẢ HAI ĐỀU XANH: trả phép đo về trung vị mili-giây, bài vẫn PASS. Lý do là môi trường:
  //    trình duyệt headless không khoá vsync như một màn hình thật, nên nó không dựng lại được
  //    đúng cái điều kiện sinh ra lỗi (`ms` chỉ nhận bội số của chu kỳ quét). Cộng thêm 80 giây
  //    chờ ⇒ hai mục vừa đắt vừa không gác gì.
  //    *Một bài kiểm không thử ngược được thì nó chưa phải một bài kiểm.*
  //
  //    ⇒ Bơm thẳng dòng `ms` vào hàm. Cái cần gác là PHÉP QUYẾT ĐỊNH, mà phép ấy là hàm thuần
  //    của dòng số — không cần một cái máy có màn hình để hỏi nó.
  const bom = await p.evaluate(() => {
    const kq = {};
    const nap = (mang) => { _fxHold = 0; _fxT.length = 0; for (const v of mang) fxAutoTune(v); };
    // ① HAI ĐỈNH 50/50 — nửa số khung trượt nhịp, nhưng TRUNG VỊ vẫn là 16,7.
    //    Đây chính là trạng thái giật 60/30 mà bản cũ đọc ra "ổn rồi" rồi dừng.
    setFxq('auto'); setRes('auto'); FXQ = 2; RES = 1; _resHong = 0; resize();
    // ⚠ 46 nhanh / 44 chậm, KHÔNG phải 45/45. `fxAutoTune` lấy phần tử thứ [45] của 90 mẫu đã
    //    sắp — tức trung vị TRÊN — nên chia đôi chẵn thì nó rơi vào 33,3 và bản cũ cũng hạ, mệnh
    //    đề thành vô nghĩa. Chốt tự kiểm ngay dưới đã bắt đúng chuyện đó ở lượt viết đầu.
    //    48,9% khung trượt mà trung vị vẫn đọc ra 16,7: đó chính xác là ca lỗi.
    const hai = new Array(46).fill(16.7).concat(new Array(44).fill(33.3));
    nap(hai);
    kq.haiDinh = { fxq: FXQ, med: hai.slice().sort((a,b)=>a-b)[45] };
    // ② KHÔNG KHUNG NÀO TRƯỢT, nhưng `ms` vẫn là 16,7 — sàn vật lý của màn 60Hz.
    //    Bản cũ hỏi `med < 13` nên điều kiện nâng SAI VĨNH VIỄN: chất lượng chỉ đi xuống.
    setFxq('auto'); setRes('auto'); FXQ = 0; RES = 1; _resHong = 0; resize();
    nap(new Array(90).fill(16.7));
    kq.muot = { fxq: FXQ };
    setFxq('auto'); setRes('auto'); FXQ = 2; RES = 1; _resHong = 0; resize();
    return kq;
  });
  console.log('8) bơm thẳng:', JSON.stringify(bom));
  if (bom.haiDinh.med !== 16.7)
    fail(`8) cảnh dựng hỏng: dòng hai đỉnh phải có trung vị 16,7 mới tái hiện được lỗi, đang là ${bom.haiDinh.med}`);
  else if (bom.haiDinh.fxq !== 1)
    fail(`8①) 50% khung trượt nhịp mà bộ tự chỉnh không hạ gì (hiệu ứng vẫn ${bom.haiDinh.fxq}) — `
       + `đang xét trung vị mili-giây chứ không xét tỉ lệ trượt`);
  if (bom.muot.fxq !== 1)
    fail(`8②) không khung nào trượt nhịp mà chất lượng không hồi phục (hiệu ứng vẫn ${bom.muot.fxq}) — `
       + `điều kiện nâng đang đòi một giá trị dưới sàn 16,7 của màn 60Hz, tức sai vĩnh viễn`);

  console.log('errors:', JSON.stringify(errs));
  if (errs.length) fail('có lỗi trang: ' + errs[0]);
  console.log(bad === 0 ? 'PASS' : 'FAIL(' + bad + ')');
  await b.close();
  process.exit(bad === 0 ? 0 : 1);
})();
