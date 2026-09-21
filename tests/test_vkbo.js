// ⚔ BỘ THÂN CÓ VŨ KHÍ NƯỚNG SẴN THÌ KHÔNG ĐƯỢC BẬT THẦN KHÍ CÙNG LÚC
//
// `dwsl1` (thân Dark Wizard dựng từ ảnh render) nướng cây gậy thẳng vào KHỐI RA ĐÒN — không
// tách lớp `vk` được như `NV_VK_LOP`, vì art tới đây đã dẹp. Nên lúc ra đòn mà thần khí vẫn
// bật là HAI cây trên màn: một cây trong tay, một cây bay trên đầu (đã chụp lại).
//
// ⚠ NHƯNG KHỐI ĐI/ĐỨNG CỦA NÓ KHÔNG CÓ CÂY NÀO. Tắt cả đời là đứng trong thành TAY KHÔNG —
// đã thử đúng một lượt (2026-09-21, khi gói art mới sắp về) và `test_vukhihien ②` bắt ngay.
// Nên bài này kẹp HAI ĐẦU: ra đòn phải TẮT, đứng yên phải BẬT.
//
// ⚠ Và một đầu THỨ BA: bộ KHÔNG khai trong `NV_BO_CO_VK` thì vẫn phải bật. Thiếu vế đó thì gỡ
// hẳn thần khí khỏi game cũng xanh — mà bốn lớp kia vẫn đang sống nhờ nó.
const { chromium } = require(process.env.PW || '/opt/node22/lib/node_modules/playwright');
const PORT = process.argv[2] || 8853;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await p.goto(`http://localhost:${PORT}/index.html`);
  await p.waitForFunction(() => window.__gameReady, null, { timeout: 30000 });

  const r = await p.evaluate(async () => {
    window.TEST_MODE = true;
    startGame('baidasan', null);
    player.avatar = null;                       // tắt avatar: đo RIÊNG lớp nhân vật
    const g = genItem(5, null, null, { slots: ['vukhi'], perfect: 0 });
    if (g) player.equip.vukhi = g;
    calcDerived();
    await new Promise(r => setTimeout(r, 2000));

    const out = { bo: nvBoGoc(player.sect, heroTier(player), gearVisual(player)) };
    const doc = () => window.__veVuKhi[Object.keys(window.__veVuKhi)[0]];

    player.castT = 0.30; player.castAct = 'raise'; render();
    await new Promise(r => setTimeout(r, 60)); render();
    out.raDon = doc();

    player.castT = 0; player.atkAnim = 0; render();
    await new Promise(r => setTimeout(r, 60)); render();
    out.dungYen = doc();

    out.bang = Object.keys(window.NV_BO_CO_VK || {});

    // ĐẦU KIA: một bộ KHÔNG khai trong bảng thì thần khí vẫn phải bật. Dark Knight dùng lớp `vk`
    // nướng sẵn (`_coVkLop`) nên không hỏi được; Dark Lord thì cố ý không có vũ khí cầm tay.
    startGame('bug', null);
    player.avatar = null;
    const g2 = genItem(5, null, null, { slots: ['vukhi'], perfect: 0 });
    if (g2) player.equip.vukhi = g2;
    calcDerived();
    await new Promise(r => setTimeout(r, 2000));
    player.castT = 0; player.atkAnim = 0; render();
    await new Promise(r => setTimeout(r, 60)); render();
    out.boKhac = nvBoGoc(player.sect, heroTier(player), gearVisual(player));
    out.khac = doc();
    return out;
  });

  const fail = [];
  // chốt tự kiểm: cảnh phải THẬT SỰ đang vẽ bộ có vũ khí nướng sẵn, và phải CÓ vũ khí để mà bay
  if (!r.bang.includes(r.bo))
    fail.push(`dựng cảnh sai: đang vẽ bộ "${r.bo}", không nằm trong NV_BO_CO_VK [${r.bang}]`);
  else if (!r.raDon || !r.raDon.co)
    fail.push('dựng cảnh sai: không cầm vũ khí nào nên thần khí vốn đã tắt — mệnh đề vô nghĩa');
  else {
    if (!r.raDon.lopHien) fail.push('dựng cảnh sai: lớp nhân vật chưa vật chất hoá lúc đo ra đòn');
    if (r.raDon.hien)     fail.push('RA ĐÒN: vẽ thêm một cây nữa ⇒ hai cây vũ khí trên màn');
    if (r.dungYen.lopHien) fail.push('dựng cảnh sai: lớp nhân vật vẫn đang ra đòn lúc đo đứng yên');
    if (!r.dungYen.hien)  fail.push('ĐỨNG YÊN: vũ khí tắt ⇒ đứng trong thành tay không');
  }
  // đầu kia — bộ không khai trong bảng thì KHÔNG được tắt theo
  if (r.bang.includes(r.boKhac))
    fail.push(`dựng cảnh sai: bộ đối chứng "${r.boKhac}" lại nằm trong NV_BO_CO_VK`);
  else if (!r.khac || !r.khac.co)
    fail.push('dựng cảnh sai: bộ đối chứng không cầm vũ khí nào — mệnh đề vô nghĩa');
  else if (!r.khac.hien)
    fail.push(`ĐỐI CHỨNG "${r.boKhac}": thần khí tắt theo ⇒ bốn lớp kia mất vũ khí`);

  console.log(JSON.stringify(r, null, 1));
  fail.forEach(f => console.log('FAIL ' + f));
  console.log(fail.length ? 'FAIL' : 'PASS');
  await b.close();
  process.exit(fail.length ? 1 : 0);
})();
