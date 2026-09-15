// Bảng khung hình quái (phần 4) + art riêng của trùm (phần 3) + lối vẽ cánh bằng tranh (phần 5).
//
// Cả ba đều là ĐƯỜNG ỐNG CHỜ ART: hôm nay MOB_KHUNG rỗng và chưa con trùm nào khai `anh`, nên
// bài này phải chứng minh hai điều ngược nhau:
//   ① chưa có art thì game vẽ Y NHƯ CŨ — không một pixel nào đổi;
//   ② cắm một bảng khung vào LÚC CHẠY thì bốn nhịp chạy đúng, mà không sửa một dòng máy nào.
// Cắm lúc chạy chứ không bỏ art thật vào repo: cùng lối `tests/pbthu.js` đã dùng để gác máy
// phó bản sau khi bảy phòng bị gỡ.
const { chromium } = require('playwright');

const KHUNG = { cot: 4, hang: 3, oRong: 60, oCao: 50, neoY: 0.9, sai: 40,
                nhip: { dung: [0, 2, 8], di: [2, 4, 12], danh: [6, 3, 16], chet: [9, 3, 10] } };

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('http://localhost:8853/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__gameReady).catch(() => {});
  await page.evaluate(() => { window.TEST_MODE = true; startGame('thieulam', null); });
  await page.waitForTimeout(400);

  const r = await page.evaluate(async (KHUNG) => {
    const ra = [];
    const ok = (t, c, ghi) => ra.push({ t, ok: !!c, ghi });

    // ── §1 CHƯA CÓ ART ⇒ KHÔNG ĐỔI GÌ ────────────────────────────────────────────────
    // Mệnh đề này TỪNG là "MOB_KHUNG phải rỗng" — đúng khi chưa có art nào, và nó đỏ ngay
    // lần đầu có art thật. Một mệnh đề chỉ xanh lúc kho rỗng thì nó gác cái kho, không gác
    // cái máy. Nay nó kiểm HÌNH DẠNG của từng mục, nên càng thêm art càng gác được nhiều.
    for (const ten in MOB_KHUNG){
      const K = MOB_KHUNG[ten];
      ok('[' + ten + '] có nhịp `dung` — nhịp bắt buộc', !!(K.nhip && K.nhip.dung));
      ok('[' + ten + '] cỡ ô và lưới là số dương',
         K.oRong > 0 && K.oCao > 0 && K.cot > 0 && K.hang > 0);
      ok('[' + ten + '] neoY nằm trong (0,1]', K.neoY == null || (K.neoY > 0 && K.neoY <= 1),
         String(K.neoY));
      // Mọi khung mọi nhịp phải nằm trong lưới đã khai, nếu không nó cắt sang ô trống hoặc
      // ra ngoài tấm — cả hai đều vẽ ra một khoảng không, không lỗi nào báo.
      const oToiDa = K.cot * K.hang;
      let tran = 0;
      for (const n in K.nhip){ const [d, so] = K.nhip[n]; tran = Math.max(tran, d + so); }
      ok('[' + ten + '] mọi khung nằm trong lưới', tran <= oToiDa, tran + '/' + oToiDa);
    }
    const mTho = { def: MOBS.boar, x: 0, y: 0, wob: 0 };
    ok('loài chưa có bảng khung ⇒ mobKhungO trả null',
       mobKhungO(mobTenAnh(MOBS.boar), mTho, 1000) === null);
    ok('tên art suy từ đường dẫn img', mobTenAnh(MOBS.boar) === 'boar', mobTenAnh(MOBS.boar));
    ok('quái khung xương không có tên art', mobTenAnh(MOBS.phando) === null);

    // ── §2 CẮM BẢNG KHUNG LÚC CHẠY ⇒ BỐN NHỊP CHẠY ───────────────────────────────────
    // Tấm giả dựng bằng canvas: bài kiểm không được phụ thuộc một tệp art có thật.
    const cv = document.createElement('canvas');
    cv.width = KHUNG.cot * KHUNG.oRong; cv.height = KHUNG.hang * KHUNG.oCao;
    const g = cv.getContext('2d'); g.fillStyle = '#f0f'; g.fillRect(0, 0, cv.width, cv.height);
    const im = new Image(); im.src = cv.toDataURL();
    await im.decode();
    MOB_KHUNG.boar = KHUNG; MOB_KH_IMGS.boar = im;

    const m = { def: MOBS.boar, x: 0, y: 0, wob: 0, dead: false, lungeT: 0, deadT: 0, mvK: 0, mvPh: 0 };
    const o = (t) => mobKhungO('boar', m, t);
    const k = (oo) => (oo.sy / KHUNG.oCao) * KHUNG.cot + oo.sx / KHUNG.oRong;  // số thứ tự khung

    ok('có bảng khung ⇒ trả về ô', !!o(0));
    ok('neoY đọc từ bảng', o(0).neoY === 0.9, String(o(0).neoY));

    m.mvK = 0; const kDung = k(o(0));
    ok('đứng yên ⇒ nhịp dung', mobNhip(m) === 'dung' && kDung >= 0 && kDung < 2, 'khung ' + kDung);

    m.mvK = 0.9; m.mvPh = 0;
    ok('đang đi ⇒ nhịp di', mobNhip(m) === 'di');
    const kDi0 = k(o(0));
    ok('khung di nằm trong đoạn di', kDi0 >= 2 && kDi0 < 6, 'khung ' + kDi0);

    // ⚠ Nhịp đi phải chạy theo QUÃNG ĐƯỜNG, không theo đồng hồ. Đứng yên mà khung vẫn chạy
    // là bàn chân trượt đất — đúng lỗi đã trả giá ở sải chân nhân vật.
    ok('đi: thời gian trôi mà chưa đi ⇒ khung ĐỨNG YÊN', k(o(999999)) === kDi0);
    m.mvPh = KHUNG.sai / 4 + 1;
    ok('đi: đi thêm một phần sải ⇒ khung ĐỔI', k(o(0)) !== kDi0, 'khung ' + k(o(0)));

    m.mvK = 0; m.lungeT = 0.21;
    ok('đang ra đòn ⇒ nhịp danh', mobNhip(m) === 'danh');
    const kD0 = k(o(0)); m.lungeT = 0.01; const kD1 = k(o(0));
    ok('đòn chạy theo lungeT, không theo đồng hồ', kD0 === 6 && kD1 > kD0 && kD1 < 9,
       kD0 + ' → ' + kD1);

    m.lungeT = 0; m.dead = true; m.deadT = 0.44;
    ok('đã chết ⇒ nhịp chet', mobNhip(m) === 'chet');
    const kC0 = k(o(0)); m.deadT = 0.001; const kC1 = k(o(0));
    ok('gục chạy tới khung cuối rồi DỪNG', kC0 === 9 && kC1 === 11, kC0 + ' → ' + kC1);
    m.deadT = -1;
    ok('quá hạn vẫn kẹp trong đoạn, không tràn sang khung khác', k(o(0)) === 11, String(k(o(0))));

    // ── §3 ĐO BƯỚC TỪ CHUYỂN ĐỘNG THẬT ──────────────────────────────────────────────
    // Không đọc cờ do AI đặt: quái dời chỗ ở 5 nhánh khác nhau trong update().
    const m2 = { def: MOBS.boar, x: 0, y: 0, wob: 0, dead: false, lungeT: 0 };
    mobDoBuoc(m2, 1000); m2.x = 40; mobDoBuoc(m2, 1050);
    ok('dời chỗ ⇒ mvPh cộng đúng quãng đường', Math.round(m2.mvPh) === 40, String(m2.mvPh));
    ok('dời chỗ ⇒ mvK > 0', m2.mvK > 0, m2.mvK.toFixed(3));
    const kTruoc = m2.mvK;
    for (let i = 0; i < 12; i++) mobDoBuoc(m2, 1050 + (i + 1) * 50);   // đứng im
    ok('đứng im ⇒ mvK lắng về 0', m2.mvK < kTruoc * 0.35, m2.mvK.toFixed(3));

    delete MOB_KHUNG.boar; delete MOB_KH_IMGS.boar;

    // ── §4 TRÙM CÓ ART RIÊNG THẮNG KHUNG XƯƠNG ──────────────────────────────────────
    // `thinu` là quái khung xương, và 4 con trùm đang mượn nó. Khai `anh` là con đó tách ra.
    const bd = { id: 'thu', name: 'Trùm Thử', lv: 30, el: 'Kim', x: 0.5, y: 0.5, moves: ['vach'] };
    const m3 = spawnZoneBoss(Object.assign({ img: 'thinu' }, bd), 've');
    ok('không khai anh ⇒ vẫn kế thừa khung xương của quái gốc',
       m3.def.skel === MOBS.thinu.skel && !m3.def.anh, String(m3.def.skel));
    const m4 = spawnZoneBoss(Object.assign({ img: 'thinu', anh: 'trum_thu' }, bd), 've');
    ok('khai anh ⇒ art thắng, khung xương bị gỡ',
       m4.def.anh === 'trum_thu' && !m4.def.skel, m4.def.anh + '/' + m4.def.skel);
    ok('anh cũng là khoá tra MOB_KHUNG', mobTenAnh(m4.def) === 'trum_thu');

    // ── §5 CÁNH VẼ BẰNG TRANH (phần 5 — máy đã sẵn, chỉ chờ tệp) ────────────────────
    let coAnh = 0, khongAnh = 0;
    for (const bang of WING_BANG) for (const sk in bang) (bang[sk].anh ? coAnh++ : khongAnh++);
    ok('mọi mục cánh khai anh đều tra được hàm tải', WING_BANG.every(b =>
        Object.keys(b).every(sk => !b[sk].anh || typeof canhAnh(b[sk].anh) !== 'undefined')),
       coAnh + ' mục có tranh / ' + khongAnh + ' mục còn vẽ bằng đường');
    ok('thiếu tên tranh ⇒ trả null, KHÔNG đi xin undefined.png', canhAnh(undefined) === null);
    ok('một lớp giữ NGUYÊN loại cánh qua cả 3 bậc', Object.keys(WING_BANG[0]).every(sk =>
        WING_BANG[0][sk].art === WING_BANG[1][sk].art && WING_BANG[1][sk].art === WING_BANG[2][sk].art));

    return ra;
  }, KHUNG);

  let xau = 0;
  for (const x of r){ if (!x.ok) xau++; console.log((x.ok ? '  ok  ' : '  ĐỎ  ') + x.t + (x.ghi ? '   [' + x.ghi + ']' : '')); }
  if (errors.length) console.log('LỖI TRANG:', JSON.stringify(errors.slice(0, 3)));
  console.log(xau ? `\n${xau}/${r.length} ĐỎ` : `\n${r.length}/${r.length} xanh`);
  await browser.close();
  process.exit(xau || errors.length ? 1 : 0);
})();
