// CẶP NHÀ ↔ NPC Ở SAPIDAE CHIEFDOM — mỗi công trình phải có người đứng TRƯỚC CỬA nó.
//
// Vì sao bài này tồn tại: trước đợt chấm lại, cả bảy ngôi nhà ĐỀU đã có một NPC "ở gần" — nên
// một mệnh đề kiểu *"nhà nào cũng có NPC trong bán kính 400px"* sẽ XANH trong khi `ah_vachgio`
// đứng 480px PHÍA SAU lưng Chòi Trông Vách và bị chính công trình vẽ đè lên. Một cái chốt đúng
// ở mọi trạng thái là một cái chốt không chốt gì — cùng bệnh với luật `≤60% là kill`.
//
// Nên bài đo ĐỘ LỆCH NGANG so với tim nhà và ĐỨNG TRƯỚC HAY SAU, không đo khoảng cách trần.
// Cả năm mệnh đề đã thử ngược: trả từng NPC về toạ độ cũ thì mệnh đề tương ứng đỏ.
const { chromium } = require('playwright');
const PORT = process.argv[2] || 8853;

// Hàng BẮC: mặt tiền quay xuống đại lộ ⇒ NPC đứng DƯỚI chân nhà.
// Hàng NAM: mặt tiền quay ra tường thành, người chơi tới từ đại lộ ⇒ NPC đứng TRÊN mép khối.
const LECH_TRAN = 60;    // px lệch ngang tối đa so với tim nhà
const TRUOC_MIN = 80, TRUOC_MAX = 200;   // px từ mặt đứng tới NPC

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__gameReady).catch(() => {});

  const r = await page.evaluate(({ LECH_TRAN, TRUOC_MIN, TRUOC_MAX }) => {
    const ra = []; const ok = (t, c, ghi) => ra.push({ t, ok: !!c, ghi });
    const md = MAPS.ardhaven;
    const nha = (md.vatTo || []).filter(v => v.img !== 'ct_cong');
    const khoi = MAP_OBSTACLES.ardhaven;
    const npc = NPCS.filter(n => n.map === 'ardhaven');
    const CHUC_NANG = ['forge', 'shop', 'stable', 'trunya', 'vanduyen', 'tenui'];
    const cn = npc.filter(n => CHUC_NANG.includes(n.talk));

    // ── §0 TỰ KIỂM CẢNH DỰNG ────────────────────────────────────────────────────────
    // Không có bước này thì một `vatTo` rỗng (hoặc `MAP_OBSTACLES` đổi khoá) làm mọi vòng lặp
    // dưới đây chạy 0 lượt và cả bài xanh vì không có gì để đo.
    ok('§0 cảnh dựng: có ≥7 công trình, 16 khối nhà, ≥8 NPC chức năng',
       nha.length >= 7 && khoi.length === 16 && cn.length >= 8,
       `nhà=${nha.length} · khối=${khoi.length} · npc chức năng=${cn.length}/${npc.length}`);

    // khối chứa công trình này (tim ngang nằm trong khối)
    const khoiCua = v => khoi.find(k => {
      const cx = v.x + v.w / 2;
      return cx > k.x - 40 && cx < k.x + k.wd + 40 && Math.abs(v.y + v.h - (k.y + k.ht)) < 40;
    });

    // ── §1 MỌI CÔNG TRÌNH ĐỀU CÓ MỘT NPC CHỨC NĂNG ĐỨNG ĐÚNG CỬA ────────────────────
    const xau = [];
    for (const v of nha) {
      const k = khoiCua(v); if (!k) { xau.push(`${v.img}: không nằm trên khối nào`); continue; }
      const bac = k.y < 1600;                       // hàng bắc hay hàng nam
      const cx = v.x + v.w / 2;
      const yDich = bac ? (v.y + v.h) : k.y;        // mặt đứng mà NPC phải đứng trước
      let b = null, d0 = Infinity;
      for (const n of cn) { const d = Math.hypot(n.x - cx, n.y - yDich); if (d < d0) { d0 = d; b = n; } }
      if (!b) { xau.push(`${v.img}: không có NPC chức năng nào`); continue; }
      const lech = Math.abs(b.x - cx);
      const truoc = bac ? (b.y - yDich) : (yDich - b.y);
      if (lech > LECH_TRAN || truoc < TRUOC_MIN || truoc > TRUOC_MAX)
        xau.push(`${v.img}↔${b.id}: lệch ngang ${Math.round(lech)} · trước mặt ${Math.round(truoc)}`);
    }
    ok('§1 mỗi công trình có NPC chức năng đứng trước cửa, lệch ngang ≤60px',
       xau.length === 0, xau.join(' | ') || `${nha.length}/${nha.length} cặp khít`);

    // ── §2 KHÔNG NPC NÀO ĐỨNG LỌT TRONG HÌNH CÔNG TRÌNH ─────────────────────────────
    // `vatTo` vào danh sách xếp lớp theo CHÂN ảnh (y = v.y + v.h), nên NPC nằm trong hình bị
    // công trình vẽ đè lên — vẫn "có mặt trong dữ liệu", mà trên màn thì không thấy đâu.
    const de = [];
    for (const n of npc) for (const v of md.vatTo || [])
      if (n.x > v.x && n.x < v.x + v.w && n.y > v.y && n.y < v.y + v.h)
        de.push(`${n.id} lọt trong ${v.img}`);
    ok('§2 không NPC nào bị hình công trình vẽ đè lên', de.length === 0, de.join(' | ') || 'sạch');

    // ── §3 KHÔNG NPC NÀO ĐỨNG LỌT TRONG MỘT KHỐI NHÀ ───────────────────────────────
    // Khác §2 và không trùng: khối trong `MAP_OBSTACLES` là VẬT CẢN ĐẶC kể cả khi khối đó
    // chưa có tấm art nào. NPC đứng trong khối thì người chơi không bao giờ đi tới đủ gần để
    // mở được bảng của nó — một cửa hàng đóng vĩnh viễn, và không một lỗi nào in ra.
    const ket = [];
    for (const n of npc) for (const k of khoi)
      if (n.x > k.x && n.x < k.x + k.wd && n.y > k.y && n.y < k.y + k.ht)
        ket.push(`${n.id} kẹt trong khối (${k.x},${k.y})`);
    ok('§3 không NPC nào đứng lọt trong một khối nhà đặc', ket.length === 0,
       ket.join(' | ') || `${npc.length} NPC đều đứng trên sàn đi được`);

    // ── §4 KHÔNG HAI NPC NÀO CHỒNG CHỖ ─────────────────────────────────────────────
    const sat = [];
    for (let i = 0; i < npc.length; i++) for (let j = i + 1; j < npc.length; j++) {
      const d = Math.hypot(npc[i].x - npc[j].x, npc[i].y - npc[j].y);
      if (d < 200) sat.push(`${npc[i].id}↔${npc[j].id} ${Math.round(d)}px`);
    }
    ok('§4 mọi NPC cách nhau ≥200px', sat.length === 0, sat.join(' | ') || `${npc.length} NPC, thưa đều`);

    // ── §5 NPC CHỨC NĂNG NÀO CHƯA CÓ NHÀ THÌ PHẢI ĐỨNG SẴN Ở MỘT KHỐI TRỐNG ─────────
    // Không đòi "ai cũng có nhà" — art chưa về thì đòi thế là một bài đỏ vĩnh viễn. Đòi thứ
    // kiểm được: con nào chưa có nhà thì đã đứng đúng khuôn của một khối còn trống, nên thả
    // tệp ảnh vào là cặp khít ngay, không phải dời ai.
    const hong = [];
    for (const n of cn) {
      const coNha = nha.some(v => {
        const k = khoiCua(v); if (!k) return false;
        return n.x > v.x - 60 && n.x < v.x + v.w + 60 &&
               Math.abs(n.y - (k.y < 1600 ? v.y + v.h : k.y)) <= TRUOC_MAX;
      });
      if (coNha) continue;
      const k = khoi.find(k => n.x > k.x - 60 && n.x < k.x + k.wd + 60 &&
                               n.y > k.y + k.ht + TRUOC_MIN - 60 && n.y < k.y + k.ht + TRUOC_MAX);
      if (!k) hong.push(`${n.id} (${n.x},${n.y}) không đứng trước khối nào`);
    }
    ok('§5 NPC chức năng chưa có nhà vẫn đứng đúng khuôn một khối trống',
       hong.length === 0, hong.join(' | ') || 'chờ art nhưng chỗ đã đúng');

    return ra;
  }, { LECH_TRAN, TRUOC_MIN, TRUOC_MAX });

  let do_ = 0;
  for (const x of r) { if (!x.ok) do_++; console.log(`${x.ok ? 'PASS' : 'FAIL'} ${x.t}\n      ${x.ghi}`); }
  if (errors.length) { do_++; console.log('FAIL lỗi trang: ' + errors.slice(0, 3).join(' | ')); }
  console.log(`\n${r.length - (do_ - (errors.length ? 1 : 0))}/${r.length} xanh`);
  await browser.close();
  process.exit(do_ ? 1 : 0);
})();
