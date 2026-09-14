// BẠN BÈ (chạy thật, nối máy chủ) & TỔ ĐỘI (khung, chờ máy chủ).
//
// Hai bảng này nối vào hai thứ khác hẳn nhau, và bài kiểm phải gác đúng chỗ khác nhau đó:
//
//   · Bạn Bè gọi tRPC `friend.*`. Thứ dễ hỏng nhất KHÔNG phải giao diện mà là **ba đường thoát**:
//     máy chủ không có · chưa đăng nhập · máy chủ trả lỗi. Bản chạy trên VPS chỉ phục vụ tệp
//     tĩnh nên `/api/trpc/*` ở đó KHÔNG tồn tại — đường "không có máy chủ" là đường chạy THẬT
//     nhiều nhất, không phải ca hiếm.
//   · Tổ Đội chưa chạy được (cần realtime). Bài kiểm gác **lời nói thật**: bảng phải NÓI RA là
//     đang chờ máy chủ, và không được bịa ra thành viên nào. Cùng luật đã ghi cho Nhật Ký Nhiệm
//     Vụ lúc `QUESTS` rỗng: bảng rỗng mà khoe là nói dối người chơi.
const { chromium } = require('playwright');
let bad = 0; const fail = m => { bad++; console.log('FAIL ' + m); };
const MAU = {
  ban:[ {userId:2,ten:'Silverfen Merit',avatar:null,trangThai:'ban',thanThiet:1310,lop:'thieulam',cap:118,daChao:false},
        {userId:3,ten:'Rootwyn Cove',avatar:null,trangThai:'ban',thanThiet:430,lop:null,cap:86,daChao:true} ],
  moiDaGui:[ {userId:5,ten:'Cinderfall Faye',avatar:null,trangThai:'cho',thanThiet:0,lop:null,cap:12} ],
  moiToiToi:[ {userId:6,ten:'Thistledown Merit',avatar:null,lop:null,cap:64} ],
  soDen:[ {userId:7,ten:'Emberfall Reed',avatar:null,trangThai:'chan',thanThiet:0,lop:null,cap:30} ],
  ngay:'2026-09-14',
};
const okJson = (j) => ({ contentType:'application/json', body: JSON.stringify({ result:{ data:{ json:j } } }) });

(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport:{width:1440,height:960} });
  const errs = []; p.on('pageerror', e => errs.push(String(e).split('\n')[0]));

  // ---- 1. KHÔNG CÓ MÁY CHỦ: bảng phải nói rõ, và không được ném lỗi ra vòng game ----
  await p.route('**/api/trpc/friend.**', r => r.abort());
  await p.goto('http://localhost:8853/index.html?max=1', { waitUntil:'load' });
  await p.waitForFunction(() => window.__gameReady).catch(()=>{});
  await p.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', null); });
  await p.waitForTimeout(900);
  const r1 = await p.evaluate(async () => {
    togglePanel('friend');
    await new Promise(r => setTimeout(r, 500));
    const h = el('panel-friend').innerHTML;
    return { mo: !el('panel-friend').classList.contains('hidden'), trang: _bbTrang,
      noiMayChu: /Máy chủ chưa bật/.test(h), coThuLai: /bbLamMoi\(\)/.test(h) };
  });
  console.log('1) không có máy chủ:', JSON.stringify(r1));
  if (!r1.mo) fail('① phím/togglePanel không mở được bảng Bạn Bè');
  if (r1.trang !== 'tatMay') fail(`① trạng thái phải là 'tatMay', đang là '${r1.trang}'`);
  if (!r1.noiMayChu) fail('① máy chủ không có mà bảng không NÓI RA — người chơi ngồi nhìn một bảng trống không hiểu vì sao');
  if (!r1.coThuLai) fail('① không có nút Thử lại');

  // ---- 2. CHƯA ĐĂNG NHẬP là một chuyện KHÁC HẲN "không có máy chủ" ----
  await p.unroute('**/api/trpc/friend.**');
  await p.route('**/api/trpc/friend.list*', r => r.fulfill({ status:401, contentType:'application/json',
    body: JSON.stringify({ error:{ json:{ data:{ code:'UNAUTHORIZED' } } } }) }));
  const r2 = await p.evaluate(async () => {
    await bbLamMoi();
    const h = el('panel-friend').innerHTML;
    return { trang: _bbTrang, noiDangNhap: /Cần đăng nhập/.test(h), noiMayChu: /Máy chủ chưa bật/.test(h) };
  });
  console.log('2) chưa đăng nhập:', JSON.stringify(r2));
  if (r2.trang !== 'caiDangNhap') fail(`② trạng thái phải là 'caiDangNhap', đang là '${r2.trang}'`);
  if (!r2.noiDangNhap || r2.noiMayChu)
    fail('② gộp "chưa đăng nhập" với "không có máy chủ" thành một câu — hai cái đó người chơi làm được hai việc khác nhau');

  // ---- 3. CÓ DỮ LIỆU: vẽ đủ, và bốn tab đều có thứ để xem ----
  await p.unroute('**/api/trpc/friend.list*');
  await p.route('**/api/trpc/friend.list*', r => r.fulfill(okJson(MAU)));
  const r3 = await p.evaluate(async (MAU) => {
    await bbLamMoi();
    const lay = () => el('panel-friend').innerHTML;
    const o = {};
    o.trang = _bbTrang;
    const hBan = lay();
    o.duTen = MAU.ban.every(x => hBan.includes(x.ten));
    o.coThanThiet = hBan.includes('1310');
    // người đã chào hôm nay thì nút phải TẮT, không thì chào được hai lần trong một ngày
    o.nutChao = (hBan.match(/onclick="bbChao\(/g) || []).length;
    o.daChao = /✓ Đã chào/.test(hBan);
    banBeTab('moi');  const hMoi = lay();
    o.moiDen = hMoi.includes(MAU.moiToiToi[0].ten);
    o.moiDi  = hMoi.includes(MAU.moiDaGui[0].ten);
    banBeTab('chan'); const hChan = lay();
    o.soDen = hChan.includes(MAU.soDen[0].ten);
    banBeTab('ban');
    return o;
  }, MAU);
  console.log('3) có dữ liệu:', JSON.stringify(r3));
  if (r3.trang !== 'xong') fail(`③ trạng thái phải là 'xong', đang là '${r3.trang}'`);
  if (!r3.duTen) fail('③ không vẽ đủ tên bạn');
  if (!r3.coThanThiet) fail('③ không hiện Độ Thân Thiết');
  if (r3.nutChao !== 1) fail(`③ có ${r3.nutChao} nút Chào bật, phải đúng 1 — người đã chào hôm nay thì nút phải tắt`);
  if (!r3.daChao) fail('③ người đã chào hôm nay không hiện dấu "Đã chào"');
  if (!r3.moiDen || !r3.moiDi) fail('③ tab Lời Mời thiếu chiều đến hoặc chiều đi');
  if (!r3.soDen) fail('③ tab Sổ Đen không hiện ai');

  // ---- 4. MỌI THAO TÁC PHẢI TẢI LẠI TỪ MÁY CHỦ ----
  // Sửa bản sao trong trình duyệt thì nhanh hơn một nhịp, đổi lại có HAI bản sự thật — và bản
  // trong máy sẽ nói dối ngay lần đầu máy chủ từ chối một thao tác.
  await p.route('**/api/trpc/friend.chao*', r => r.fulfill(okJson({ ok:true, them:10 })));
  const r4 = await p.evaluate(async () => {
    window.__demList = 0;
    const goc = window.fetch;
    window.fetch = function(u, o){ if (String(u).includes('friend.list')) window.__demList++; return goc.apply(this, arguments); };
    await bbChao(2);
    await new Promise(r => setTimeout(r, 400));
    window.fetch = goc;
    return { demList: window.__demList };
  });
  console.log('4) tải lại sau thao tác:', JSON.stringify(r4));
  if (r4.demList < 1) fail('④ bấm một nút xong mà KHÔNG hỏi lại máy chủ — bảng sẽ nói dối ngay lần đầu máy chủ từ chối');

  // ---- 5. trpcGoi bọc đúng hợp đồng superjson ở CẢ HAI đầu ----
  const r5 = await p.evaluate(async () => {
    let getUrl = '', postBody = '';
    const goc = window.fetch;
    window.fetch = function(u, o){
      if (String(u).includes('friend.timNguoi')) getUrl = String(u);
      if (String(u).includes('friend.moi')) postBody = o && o.body;
      return Promise.resolve({ ok:true, json: async () => ({ result:{ data:{ json:[] } } }) });
    };
    await trpcGoi('friend.timNguoi', { tu:'abc' });
    await trpcGoi('friend.moi', { friendId: 9 }, true);
    window.fetch = goc;
    return { getUrl, postBody };
  });
  console.log('5) hợp đồng superjson:', JSON.stringify(r5));
  if (!/input=%7B%22json%22/.test(r5.getUrl)) fail(`⑤ query không bọc {json:…} trong ?input= — superjson sẽ trả 400: ${r5.getUrl}`);
  if (!/"json"/.test(r5.postBody || '')) fail(`⑤ mutation không bọc {json:…} trong body: ${r5.postBody}`);

  // ---- 6. TỔ ĐỘI: nói thật, không bịa thành viên, và tuỳ chọn có lưu ----
  const r6 = await p.evaluate(() => {
    closePanels(); togglePanel('party');
    const h = () => el('panel-party').innerHTML;
    const h0 = h();
    const o = {
      mo: !el('panel-party').classList.contains('hidden'),
      noiChoMayChu: /cần máy chủ/i.test(h0),
      soChoTrong: (h0.match(/Chỗ trống/g) || []).length,
      coToi: h0.includes(player.name || 'Bạn'),
      // nút nào cần máy chủ thì phải TẮT — bật một cái nút không làm gì là tệ hơn không có nút
      nutTat: (h0.match(/<button class="mini-btn" disabled/g) || []).length,
    };
    toDoiCai('tuNhan', true);
    o.luu = !!(SETTINGS.toDoi && SETTINGS.toDoi.tuNhan);
    renderPartyPanel();
    o.giuSauVeLai = /tuNhan',this.checked\)" checked|checked[^>]*onchange="toDoiCai\('tuNhan'/.test(h())
                    || h().includes('checked');
    return o;
  });
  console.log('6) tổ đội:', JSON.stringify(r6));
  if (!r6.mo) fail('⑥ không mở được bảng Tổ Đội');
  if (!r6.noiChoMayChu) fail('⑥ Tổ Đội chưa chạy được mà bảng KHÔNG nói ra — người chơi ngồi đợi một tính năng không tồn tại');
  if (r6.soChoTrong < 3) fail(`⑥ chỉ ${r6.soChoTrong} ô trống — bảng phải cho thấy đội còn mấy chỗ`);
  if (!r6.coToi) fail('⑥ không có chính người chơi trong ô đội trưởng');
  if (r6.nutTat < 3) fail(`⑥ chỉ ${r6.nutTat} nút bị tắt — nút cần máy chủ mà vẫn bấm được là hứa suông`);
  if (!r6.luu) fail('⑥ tuỳ chọn tổ đội không lưu vào SETTINGS');
  if (!r6.giuSauVeLai) fail('⑥ vẽ lại bảng thì tuỳ chọn mất trạng thái đã tick');

  if (errs.length) fail('lỗi trang: ' + errs.slice(0,3).join(' | '));
  console.log(bad ? `\n${bad} LỖI` : '\nTẤT CẢ XANH');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
