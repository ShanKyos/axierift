// AXIE RA ĐÒN — và lớp nhân vật NHẬP VÀO nó khi ra khỏi thành.
//
// ⚠ BÀI NÀY GÁC MỘT LUẬT BỊ LẬT, không phải một khối được thêm. Luật cũ (`test_avaphanung §6`)
// khẳng định *"AXIE KHÔNG ĐÁNH"*, và lý do là: cho Axie tự húc TRONG LÚC lớp nhân vật niệm chú
// BÊN CẠNH là dựng lại cái "hai kẻ cùng đánh" mà đợt Đổi Vai gỡ đi. Lý do ấy hết hiệu lực vì
// HÌNH DẠNG đã đổi — nay lớp nhân vật NHẬP VÀO con Axie khi ra khỏi thành ⇒ lúc đánh trên màn
// chỉ còn MỘT thân. Chủ dự án chốt lại 2026-09-16:
//
//   "Cứ cho Axie ra đòn... Người chơi muốn đánh quái thì phải nhập vào Axie, nhưng để flex
//    được bộ giáp thì hãy làm cho nó đi theo ở trong thành."
//
// ⚠ VÌ THẾ MỤC ① GÁC CẢ HAI CHIỀU. Chỉ khẳng định "ngoài thành Axie ra đòn" thì bỏ hẳn nhánh
// trong-thành đi bài vẫn xanh — mà nhánh ấy chính là chỗ duy nhất người chơi còn thấy bộ giáp
// mình mua, tức là cả cái giá phải trả để có đợt này.
//
// Chạy độc lập:  node tests/test_axiedanh.js [cổng]
const { chromium } = require('playwright');
const CONG = process.argv[2] || '8853';
const GOC = 'http://localhost:' + CONG + '/index.html';
const LOP = ['thieulam', 'baidasan', 'toanchan', 'minhgiao', 'bug'];

(async () => {
  let bad = 0; const fail = m => { console.log('FAIL', m); bad++; };
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1100, height: 760 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto(GOC);
  await p.waitForFunction(() => window.__gameReady).catch(() => {});
  await p.evaluate(ls => { window.TEST_MODE = true; window.LOPT = ls; startGame('thieulam', null); }, LOP);

  // ── 0. BẢNG PHẢI ĐỦ, VÀ Ô PHẢI TRÙNG KHÍT BẢNG NHỎ ──────────────────────────────────────
  // Ô lệch một pixel là con vật NHẢY một cái mỗi lần đổi khối — nhìn ra ngay mà không lỗi nào
  // báo. Tải bằng chính đường của game (`chiDanhImg`) rồi đo `naturalWidth`, đừng tin tên tệp.
  const tai = await p.evaluate(async () => {
    const ids = Object.keys(CHI_MAP);
    const xin = [];
    for (const id of ids) for (const l of LOPT) xin.push([id, l, chiDanhImg(id, l)]);
    await new Promise(r => setTimeout(r, 6000));
    const thieu = [], lech = [];
    for (const [id, l, im] of xin){
      const K = CHI_DANH[l], A = CHI_ANH.o[id];
      if (!im || !im.naturalWidth){ thieu.push(id + K.duoi); continue; }
      // ô của bảng đòn phải bằng ô của bảng nhỏ: rộng = naturalWidth/cột, cao = naturalHeight/hàng
      const oR = im.naturalWidth / K.cot, oC = im.naturalHeight / Math.ceil(K.n / K.cot);
      if (!A) continue;
      if (Math.abs(oR - A.nhoRong) > 1 || Math.abs(oC - A.nhoCao) > 1)
        lech.push(`${id}${K.duoi} ô ${oR}x${oC} ≠ bảng nhỏ ${A.nhoRong}x${A.nhoCao}`);
    }
    return { soCon: ids.length, thieu, lech };
  });
  console.log(`0 · ${tai.soCon} con × ${LOP.length} lớp · thiếu ${tai.thieu.length} · lệch ô ${tai.lech.length}`);
  if (tai.thieu.length) fail(`thiếu bảng đòn: ${tai.thieu.slice(0, 6).join(', ')}`);
  if (tai.lech.length) fail(`ô lệch bảng nhỏ (con vật sẽ NHẢY khi đổi khối): ${tai.lech.slice(0, 4).join(' · ')}`);

  // ── 1. TRONG THÀNH thì KHÔNG nhập · NGOÀI THÀNH thì nhập ────────────────────────────────
  const cua = await p.evaluate(() => {
    const r = {};
    for (const [ten, mid] of [['thanh', 'ardhaven'], ['bai', 'ngoai'], ['pvp', 'pvp']]){
      travelTo(mid);
      r[ten] = { map: curMap, thanh: avaTrongThanh(), nhap: avaNhap() };
    }
    return r;
  });
  console.log('1 ·', JSON.stringify(cua));
  if (!cua.thanh.thanh) fail('ardhaven (thành, không bãi quái) phải là TRONG THÀNH');
  if (cua.bai.thanh)   fail('ngoai khai `safe` NHƯNG có 8 bãi quái — phải là NGOÀI thành. '
                          + '`safe` một mình không đủ, cùng bẫy đã ghi ở Rương Canh');
  if (cua.pvp.thanh)   fail('sàn đấu pvp không bãi quái nhưng là chỗ đánh nhau — phải NHẬP');

  // ── 2. TRONG THÀNH: lớp nhân vật CÓ MẶT, và Axie KHÔNG ra đòn ───────────────────────────
  const thanh = await p.evaluate(() => {
    travelTo('ardhaven'); player.x = 3200; player.y = 1900; player.face = 0.6;
    player.atkAnim = 0.12; player.hurtT = 0; player.castT = 0;
    for (let i = 0; i < 3; i++) render();
    const k = window.__avaKhoi && Object.values(window.__avaKhoi)[0];
    return { khoi: k && k.khoi, co: window.__lopVe && window.__lopVe.co, veThan: window.__veThan };
  });
  console.log('2 ·', JSON.stringify(thanh));
  if (thanh.khoi === 'danh')
    fail('TRONG THÀNH Axie không được ra đòn — lớp nhân vật còn đứng đó và tự vung, hai kẻ cùng đánh');
  if (!(thanh.co > 0.95))
    fail(`trong thành lớp nhân vật phải ở cỡ khoe giáp (AVA_THANH_CO), đang ${thanh.co}`);

  // ── 3. NGOÀI THÀNH: Axie ra đòn, lớp nhân vật BIẾN MẤT ──────────────────────────────────
  const ngoai = await p.evaluate(() => {
    travelTo('ngoai'); player.x = 1200; player.y = 1200; player.face = 0.6;
    player.atkAnim = 0.12; player.hurtT = 0; player.castT = 0;
    for (let i = 0; i < 3; i++) render();
    const k = window.__avaKhoi && Object.values(window.__avaKhoi)[0];
    return { khoi: k && k.khoi, hienLop: window.__lopVe && window.__lopVe.truoc };
  });
  console.log('3 ·', JSON.stringify(ngoai));
  if (ngoai.khoi !== 'danh')
    fail(`ngoài thành Axie phải ra đòn, đang ra khối "${ngoai.khoi}"`);

  // ── 4. NĂM LỚP PHẢI RA NĂM ĐÒN KHÁC NHAU ───────────────────────────────────────────────
  // Đây là cả điểm của đợt này: lúc đánh không còn thân người nào để nhìn, nên nếu Axie của
  // năm lớp vung giống hệt nhau thì 5 lớp mất sạch dấu hiệu NHÌN THẤY ĐƯỢC.
  //
  // ⚠ Vẽ ra canvas PHỤ với `now` ghim cứng — bài học đã trả giá ở `test_avaphanung ⑤`: đo trên
  // khung game thì lớp nhân vật, loé trúng đòn và nền trôi lọt hết vào ô.
  const don = await p.evaluate(async () => {
    const cv = document.createElement('canvas'); cv.width = 220; cv.height = 240;
    const g = cv.getContext('2d');
    const fp = { x: 110, y: 170, face: 0, walkPh: 0, atkAnim: 0, hurtT: 0, castT: 0, avatar: 'emberjaw' };
    LOPT.forEach(l => chiDanhImg('emberjaw', l));
    await new Promise(r => setTimeout(r, 2500));
    const moc = performance.now(), anh = {}, khoi = {};
    for (const l of LOPT){
      fp.sect = l; fp.atkAnim = 0.12;
      g.clearRect(0, 0, cv.width, cv.height); veAvatar(g, fp, false, moc);
      anh[l] = g.getImageData(0, 0, cv.width, cv.height).data;
      const k = window.__avaKhoi && Object.values(window.__avaKhoi)[0];
      khoi[l] = k && k.khoi;
    }
    const dem = (u, v) => { let n = 0;
      for (let i = 0; i < u.length; i += 4)
        if (u[i]!==v[i]||u[i+1]!==v[i+1]||u[i+2]!==v[i+2]||u[i+3]!==v[i+3]) n++;
      return n; };
    const cap = [];
    for (let i = 0; i < LOPT.length; i++) for (let j = i + 1; j < LOPT.length; j++)
      cap.push([LOPT[i] + '×' + LOPT[j], dem(anh[LOPT[i]], anh[LOPT[j]])]);
    return { khoi, cap };
  });
  const thap = Math.min(...don.cap.map(c => c[1]));
  console.log('4 · năm đòn, lệch thấp nhất', thap, '·', JSON.stringify(don.khoi));
  // ⓪ tự kiểm cảnh dựng: cả năm phải THẬT SỰ đi vào khối đòn, nếu không mục này so năm khối thở
  const sai = LOP.filter(l => don.khoi[l] !== 'danh');
  if (sai.length) fail(`cảnh dựng hỏng — ${sai.join(', ')} không vào khối 'danh', phép so dưới vô nghĩa`);
  else if (thap < 400)
    fail(`có hai lớp ra ĐÒN GIỐNG NHAU (lệch ${thap} điểm ảnh): `
       + don.cap.filter(c => c[1] < 400).map(c => c[0]).join(', '));

  if (errs.length) fail('lỗi trang: ' + errs.slice(0, 3).join(' | '));
  console.log(bad ? `FAIL(${bad})` : 'OK test_axiedanh');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
