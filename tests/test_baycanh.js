// 🪶 KHỐI BAY RIÊNG + ĐÔI CÁNH NƯỚNG SẴN
//
// `dwsl1` có khối 'f' (8 khung vỗ cánh) ở BẢNG HAI, ô 84-91 — và đôi cánh đã nướng THẲNG vào
// đó. Ba chuyện phải cùng đúng, thiếu một cái là hỏng theo một kiểu khác nhau:
//   ① đang bay thì phải đọc khối 'f'  (không thì ghim một khung khối ĐI như bản cũ)
//   ② `veCanh()` phải TẮT               (không thì HAI đôi cánh trên màn)
//   ③ CẢ BA bậc cánh đều phải bay được  (ngưỡng cũ `bayK >= 0.5` bỏ rơi bậc 1: 11/24 = 0,458)
//
// ⚠ ② và ③ cùng đọc `_bayDat`. Nếu tách thành hai ngưỡng thì có cửa sổ mà cánh vẽ rời đã tắt
//   còn khối bay chưa bật ⇒ nhân vật bay mà KHÔNG có cánh nào. Bài này kẹp cả hai.
const { chromium } = require(process.env.PW || 'playwright');
const PORT = process.argv[2] || 8853;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const bad = [];
  p.on('response', r => { if (r.status() >= 400 && /\.webp|\.png/.test(r.url())) bad.push(r.url().split('/').pop()); });
  await p.goto(`http://localhost:${PORT}/index.html`);
  await p.waitForFunction(() => window.__gameReady, null, { timeout: 30000 });

  const r = await p.evaluate(async () => {
    window.TEST_MODE = true;
    startGame('baidasan', null);
    player.avatar = null;                       // đo RIÊNG lớp nhân vật
    await new Promise(r => setTimeout(r, 2000));

    const out = { bo: nvBoGoc(player.sect, heroTier(player), gearVisual(player)),
                  bang: Object.keys(window.NV_BO_CO_BAY || {}), bac: {} };

    for (const bac of [1, 2, 3]) {
      player.equip.canh = genWing(player.sect, bac);
      calcDerived();
      for (let i = 0; i < 400; i++) { update(1 / 60); render(); }   // chờ bayCao trườn lên
      // ⚠ PHẢI CHỜ THEO GIỜ THẬT. Chỉ số khung của khối bay chạy theo `performance.now()`
      // (95ms/khung), nên 30 lượt `render()` trong một vòng chặt chỉ tốn ~300ms và đo ra
      // 2-3 khung — trông y hệt "không vỗ cánh" trong khi cơ chế hoàn toàn đúng.
      const khoi = new Set(), canh = new Set(), khung = new Set();
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 40));
        update(1 / 60); render();
        khoi.add(window.__khoiVe);
        canh.add(!!window.__veCanhRoi);
        khung.add(window.__khungVe);
      }
      out.bac[bac] = { khoi: [...khoi], canhRoi: [...canh], soKhung: khung.size };
    }
    // ④ BAY + RA ĐÒN ⇒ khối 'g', và nó phải chạy XUÔI (0 → n-1).
    // ⚠ `castK` đếm NGƯỢC nên dùng thẳng là khối chạy ngược — lỗi đã có với cả năm lớp trước
    //   khi gói art mới làm nó lộ ra. Đo CHUỖI, không đo một mẫu: một mẫu thì chiều nào cũng
    //   nằm trong dải hợp lệ.
    player.equip.canh = genWing(player.sect, 3); calcDerived();
    for (let i = 0; i < 400; i++) { update(1 / 60); render(); }
    out.dangBay_canhRoi = !!window.__veCanhRoi;
    const chuoi = (nhan) => {
      // ⚠ CẮT NGAY KHI KHỐI ĐỔI. Cú niệm hết thì khối rơi về 'i'/'f' và chỉ số nhảy lung
      // tung — gom cả mấy mẫu ấy vào là bài báo "chỉ số TỤT" trên một cơ chế hoàn toàn đúng.
      const seq = [];
      player.castT = NV_CHU_GIAY; player.castAct = 'raise';
      let dau = null;
      for (let i = 0; i < 26; i++) {
        render();
        const v = String(window.__khungVe || ''), k = v.split(':')[0];
        if (dau === null) dau = k;
        if (k !== dau) break;
        seq.push(v);
        player.castT = Math.max(0, player.castT - NV_CHU_GIAY / 22);
      }
      return seq;
    };
    out.bayDanh = chuoi();
    player.equip.canh = null; calcDerived();
    for (let i = 0; i < 400; i++) { update(1 / 60); render(); }
    out.datDanh = chuoi();
    return out;
  });

  const fail = [];
  if (!r.bang.includes(r.bo))
    fail.push(`dựng cảnh sai: đang vẽ bộ "${r.bo}", không có khối bay`);
  else for (const bac of [1, 2, 3]) {
    const k = r.bac[bac];
    if (k.khoi.length !== 1 || k.khoi[0] !== 'f')
      fail.push(`bậc ${bac}: khối vẽ là [${k.khoi}], phải là ['f']`);
    if (k.canhRoi.some(Boolean))
      fail.push(`bậc ${bac}: veCanh() vẫn vẽ ⇒ HAI đôi cánh trên màn`);
    if (k.soKhung < 4)
      fail.push(`bậc ${bac}: chỉ ${k.soKhung} khung khác nhau trong 30 lượt vẽ ⇒ không vỗ cánh`);
  }
  // ④ + ⑤ — khối ra đòn: đúng khối, và chạy XUÔI
  const xuoi = (seq, nhan, khoiMong) => {
    if (seq.length < 6) { fail.push(`${nhan}: chỉ bắt được ${seq.length} mẫu — cảnh dựng hỏng`); return; }
    const kh = [...new Set(seq.map(x => String(x).split(':')[0]))];
    if (kh.length !== 1 || kh[0] !== khoiMong)
      fail.push(`${nhan}: khối vẽ là [${kh}], phải là ['${khoiMong}']`);
    const so = seq.map(x => +String(x).split(':')[1]);
    if (so[so.length - 1] <= so[0])
      fail.push(`${nhan}: khối chạy NGƯỢC — ${so[0]} → ${so[so.length - 1]}`);
    if (so.some((v, i) => i && v < so[i - 1]))
      fail.push(`${nhan}: chỉ số khung có lúc TỤT — ${so.join(' ')}`);
  };
  xuoi(r.bayDanh, 'BAY + ra đòn', 'g');
  xuoi(r.datDanh, 'ĐẤT + ra đòn', 'c');
  if (bad.length) fail.push('404 art: ' + bad.join(' · '));

  console.log(JSON.stringify(r, null, 1));
  fail.forEach(f => console.log('FAIL ' + f));
  console.log(fail.length ? 'FAIL' : 'PASS');
  await b.close();
  process.exit(fail.length ? 1 : 0);
})();
