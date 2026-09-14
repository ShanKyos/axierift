// Thân AVATAR phải khớp KHỐI với lớp nhân vật — không lớn hơn, cũng không thành hạt bụi.
//
// ⚠ Bài này trước đây gác một luật KHÁC: "Ragoon đi theo không bao giờ được lấn át nhân vật"
// (CHI_THAN 0,45 · CHI_TRAN 0,55 · chiCoTrongMan). Luật đó tồn tại vì có HAI cái thân đứng
// cạnh nhau trong màn. Ragoon đã gỡ, nay chỉ còn MỘT — con Axie LÀ thân người chơi.
//
// Nên ràng buộc đảo chiều, và đó là chỗ dễ chép sai nhất: avatar và lớp nhân vật THAY CHỖ NHAU
// lúc ra đòn, nên khối nhìn thấy phải BẰNG NHAU. Chép CHI_THAN/CHI_TRAN sang đây (chúng cố ý
// nhỏ hơn người) là mỗi cú đánh một cú giật cỡ. Luật NAY: AVA_TY 0,95 · AVA_TRAN 1,18 —
// lớp nhân vật đã đẩy ra xa nên hai khối đứng cạnh nhau, không còn thay chỗ nhau.
//
// Kiểm CẢ BỘ chứ không một con mẫu: 16 con nướng ra 16 tỉ lệ ô khác nhau (1,07 → 1,52), nên con
// nướng thêm sau này cũng tự nằm trong luật.
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
  await page.waitForTimeout(400);

  const r = await page.evaluate(() => {
    window.TEST_MODE = true;
    startGame('baidasan', null); player.level = 60; calcDerived();
    const o = { than: NV_THAN_PX, ty: AVA_TY, tran: AVA_TRAN, con: [] };
    for (const id in CHI_ANH.o){
      const A = CHI_ANH.o[id], than = avaCo(id);
      const cao = than / A.thanCao, rong = cao * (A.nhoRong / A.nhoCao);
      o.con.push({ id, than:+than.toFixed(1), cao:+cao.toFixed(1), rong:+rong.toFixed(1),
                   ty:+(A.nhoRong / A.nhoCao).toFixed(3) });
    }
    // Ragoon phải chết hẳn: không còn hàm/hằng nào của con thú đồng hành.
    //
    // ⚠ Phải hỏi bằng `typeof <tên trần>`, KHÔNG phải `typeof window[tên]`. game.js nạp như một
    // script cổ điển, nên `function f(){}` ở mức trên cùng thì có trên window, còn `const X` thì
    // KHÔNG — nó nằm trong phạm vi lexical toàn cục. Hỏi qua window là mọi hằng (CHI_ANH,
    // AVA_TY, CHI_THAN…) đều trả 'undefined' và bài xanh mà chẳng kiểm được gì.
    const co = {
      mountObj:      () => typeof mountObj,
      updateMount:   () => typeof updateMount,
      drawMount:     () => typeof drawMount,
      chiCoTrongMan: () => typeof chiCoTrongMan,
      CHI_THAN:      () => typeof CHI_THAN,
      CHI_TRAN:      () => typeof CHI_TRAN,
      chiThuMul:     () => typeof chiThuMul,
      chiCdMul:      () => typeof chiCdMul,
      chiDmgMul:     () => typeof chiDmgMul,
      chiKyMo:       () => typeof chiKyMo,
      chiAnDat:      () => typeof window.chiAnDat,
      chiHoa:        () => typeof window.chiHoa,
      chiCotGom:     () => typeof chiCotGom,
      CHI_LV_MAX:    () => typeof CHI_LV_MAX,
      CHI_KY:        () => typeof CHI_KY,
    };
    o.dago = Object.keys(co).filter(n => { try { return co[n]() !== 'undefined'; } catch(e){ return true; } });
    // …còn tầng VẼ thì phải sống, vì avatar dùng chung nó.
    const song = {
      CHI_ANH:     () => typeof CHI_ANH,
      CHI_MAP:     () => typeof CHI_MAP,
      chiVeNho:    () => typeof chiVeNho,
      chiChayImg:  () => typeof chiChayImg,
      avaCo:       () => typeof avaCo,
      veAvatar:    () => typeof veAvatar,
      avatarId:    () => typeof avatarId,
      // ⚠ `cotGom`/`cotBoCast` ĐÃ BỎ khỏi danh sách này. Chúng từng đứng đây vì hồi đó hệ Cốt
      // còn sống và bài lo nó bị gỡ nhầm theo Ragoon. Nay hệ Cốt đã gỡ HẲN chỉ số (chủ dự án
      // chốt), nên đòi chúng còn tồn tại là đòi ngược lại việc vừa làm. `tests/test_cotgobo.js`
      // gác chiều ngược: chúng phải KHÔNG còn.
    };
    o.consong = Object.keys(song).filter(n => { try { return song[n]() === 'undefined'; } catch(e){ return true; } });
    return o;
  });
  console.log('cỡ 16 thân:', JSON.stringify(r.con.slice(0, 3)), '… (' + r.con.length + ' con)');
  const tran = r.than * r.tran;

  // ⚠ Lề 1px, không phải 0,01. Cỡ đo được làm tròn một chữ số thập phân (112,6) còn trần tính
  // ra 112,572 — so bằng `+0.01` là đỏ vì 0,018px, tức đỏ vì phép làm tròn chứ không vì luật.
  const qua = r.con.filter(c => c.cao > tran + 1 || c.rong > tran + 1);
  if (qua.length) fail(`${qua.length} con vượt trần ${tran.toFixed(0)}px: ` +
    qua.map(c => `${c.id} ${c.rong}×${c.cao}`).join(', '));
  else pass(`cả ${r.con.length} thân nằm trong trần ${tran.toFixed(0)}px = ${r.tran}×thân người`);

  // ⚠ CHỐT NÀY ĐÃ ĐỔI LUẬT, giữ lại ghi chú để đừng ai "sửa ngược".
  // Bản cũ đòi khối Axie KHÔNG được lớn hơn thân người, vì hồi đó avatar và lớp nhân vật THAY
  // CHỖ NHAU lúc ra đòn — lệch cỡ là một cú giật. Nay lớp nhân vật đã được đẩy HẲN RA XA con
  // Axie (AVA_CHAN_TRUOC/AVA_CHAN_BEN), hai khối đứng CẠNH nhau chứ không chồng lên nhau, nên
  // ràng buộc "bằng nhau" hết lý do tồn tại — và đó chính là lý do AVA_TY lên 0,95 và AVA_TRAN
  // lên 1,18. Thứ còn phải gác là TRẦN (`AVA_TRAN`, đo ở khẳng định trên) và sàn (bên dưới).
  {
    const max = r.con.reduce((m, c) => Math.max(m, c.cao, c.rong), 0);
    pass(`thân lấn nhất chiếm ${(max / r.than * 100).toFixed(0)}% thân người (trần ${(r.tran*100).toFixed(0)}%)`);
  }

  // …nhưng cũng không được thu tới mức không nhận ra là cái gì.
  const be = r.con.filter(c => Math.max(c.cao, c.rong) < r.than * 0.45);
  if (be.length) fail(`thu quá tay, ${be.length} thân nhỏ hơn 45% thân người: ` + be.map(c => c.id).join(', '));
  else pass('không thân nào bị thu quá tay (đều ≥ 45% thân người)');

  if (r.dago.length) fail('Ragoon đồng hành SỐNG LẠI: ' + r.dago.join(', '));
  else pass('Ragoon đồng hành đã gỡ sạch (15 ký hiệu đều không còn)');

  if (r.consong.length) fail('tầng vẽ avatar bị gỡ theo Ragoon: ' + r.consong.join(', '));
  else pass('tầng vẽ dùng chung còn nguyên (CHI_ANH · CHI_MAP · chiVeNho · chiChayImg · avaCo…)');

  console.log('errors:', JSON.stringify(errors.slice(0, 10)));
  if (errors.length) fail(`${errors.length} lỗi JS trong lúc chạy`);
  console.log(bad ? `\nđỏ: ${bad}` : '\nTẤT CẢ XANH');
  await browser.close();
  process.exit(bad ? 1 : 0);
})();
