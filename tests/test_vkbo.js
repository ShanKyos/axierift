// ⚔ BỘ THÂN CÓ VŨ KHÍ NƯỚNG SẴN THÌ KHÔNG ĐƯỢC BẬT THẦN KHÍ CÙNG LÚC
//
// `dwsl1` (thân Dark Wizard dựng từ ảnh render) nướng cây gậy thẳng vào KHỐI RA ĐÒN — không
// tách lớp `vk` được như `NV_VK_LOP`, vì art tới đây đã dẹp. Nên lúc ra đòn mà thần khí vẫn
// bật là HAI cây trên màn: một cây trong tay, một cây bay trên đầu (đã chụp lại).
//
// ⚠ NHƯNG KHỐI ĐI/ĐỨNG CỦA NÓ KHÔNG CÓ CÂY NÀO. Tắt thần khí cả đời là đứng trong thành TAY
// KHÔNG — đúng cái lỗi mà vế `(!_coAva || _lopHien)` đã phải gỡ một lần rồi. Nên bài này kẹp
// HAI ĐẦU: ra đòn phải TẮT, đứng yên phải BẬT. Bỏ vế nào cũng lọt một kiểu hỏng.
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
    if (r.raDon.hien)     fail.push('RA ĐÒN: thần khí vẫn bật ⇒ hai cây vũ khí trên màn');
    if (r.dungYen.lopHien) fail.push('dựng cảnh sai: lớp nhân vật vẫn đang ra đòn lúc đo đứng yên');
    if (!r.dungYen.hien)  fail.push('ĐỨNG YÊN: thần khí tắt ⇒ đứng trong thành tay không');
  }

  console.log(JSON.stringify(r, null, 1));
  fail.forEach(f => console.log('FAIL ' + f));
  console.log(fail.length ? 'FAIL' : 'PASS');
  await b.close();
  process.exit(fail.length ? 1 : 0);
})();
