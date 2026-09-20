#!/usr/bin/env node
// Sinh `docs/BANG_BOPHAN.md` — bảng sáu bộ phận của cả 16 con Axie, kèm độ thuần và độ sắc.
//
// ⚠ TỆP ĐÍCH LÀ TỆP SINH RA, ĐỪNG SỬA TAY. Chép 96 ô dữ liệu vào tài liệu bằng tay là dựng bản
// sao thứ hai của một bảng đang sống — sửa `canbang.js` một lần là tài liệu nói dối ngay, mà
// kiểu nói dối đó không bài kiểm nào bắt được. Cùng luật đã ghi cho `ISO_NEO` và `docs/BANG_MAP.md`.
//
//   node tools/bang_bophan.cjs
'use strict';
const fs = require('fs');
const path = require('path');

const GOC = path.resolve(__dirname, '..');
const DICH = path.join(GOC, 'docs', 'BANG_BOPHAN.md');

// Nạp hai tệp dữ liệu bằng cách dựng một `window` giả — rẻ hơn hẳn việc dò regex, và nó đọc
// ĐÚNG thứ trình duyệt đọc. Regex trượt thì im lặng sinh ra một bảng khác (vết sẹo `test_taitro §2`).
const window = {};
global.window = window;
new Function('window', fs.readFileSync(path.join(GOC, 'public/game/data/canbang.js'), 'utf8'))(window);

const CHIMERA = window.CHIMERA;
if (!Array.isArray(CHIMERA) || !CHIMERA.length) { console.error('không đọc được CHIMERA'); process.exit(1); }

// Nhóm tam giác phải đọc TỪ GAME, không chép lại ở đây. `ELEM` nằm trong `game.js`; rút đúng
// khối khai báo của nó rồi chạy, và DỪNG HẲN nếu không khớp — một bảng nhóm chép tay ở đây là
// đúng cái thứ tệp này sinh ra để tránh.
const gjs = fs.readFileSync(path.join(GOC, 'public/game/game.js'), 'utf8');
const mElem = gjs.match(/const ELEM = \{[\s\S]*?\n\};/);
if (!mElem) { console.error('không tìm thấy khối `const ELEM` trong game.js — sửa regex trước khi chạy tiếp'); process.exit(1); }
const ELEM = new Function(mElem[0] + '; return ELEM;')();

const BP_TEN = ['mat', 'tai', 'sung', 'mieng', 'lung', 'duoi'];
const BP_NHAN = { mat: 'Mắt', tai: 'Tai', sung: 'Sừng', mieng: 'Miệng', lung: 'Lưng', duoi: 'Đuôi' };
// Hai hằng độ sắc cũng rút từ game.js, cùng lý do.
const mSac = gjs.match(/const BP_SAC_MIN = ([\d.]+), BP_SAC_MAX = ([\d.]+);/);
if (!mSac) { console.error('không tìm thấy BP_SAC_MIN/BP_SAC_MAX trong game.js'); process.exit(1); }
const SAC_MIN = parseFloat(mSac[1]), SAC_MAX = parseFloat(mSac[2]);

const cungCua = c => BP_TEN.reduce((n, k) => {
  const e = ELEM[(c.bp || {})[k]];
  return n + (e && ELEM[c.lop] && e.nhom === ELEM[c.lop].nhom ? 1 : 0);
}, 0);
const sacCua = cung => SAC_MIN + (SAC_MAX - SAC_MIN) * (cung / BP_TEN.length);
const hang = cung => cung >= 5 ? 'Thuần' : cung >= 3 ? 'Pha' : 'Tạp';
const gly = k => (ELEM[k] || {}).glyph || '?';

const hang0 = Object.keys(ELEM).filter(k => ELEM[k].nhom === 0);
const hang1 = Object.keys(ELEM).filter(k => ELEM[k].nhom === 1);
const hang2 = Object.keys(ELEM).filter(k => ELEM[k].nhom === 2);

const rows = CHIMERA.map(c => { const cung = cungCua(c); return { c, cung, sac: sacCua(cung) }; })
                    .sort((a, b) => b.cung - a.cung || a.c.id.localeCompare(b.c.id));
const tongCung = rows.reduce((s, r) => s + r.cung, 0);
const tbSac = rows.reduce((s, r) => s + r.sac, 0) / rows.length;

let md = `# Bảng sáu bộ phận Axie

> ⚠ **TỆP NÀY SINH BẰNG MÁY — \`node tools/bang_bophan.cjs\`. Đừng sửa tay.**
> Nguồn duy nhất là \`bp:\` trong \`public/game/data/canbang.js\`; nhóm tam giác và hai hằng độ
> sắc đọc thẳng từ \`public/game/game.js\`. Sửa ở đây thì lần chạy sau ghi đè, và trong lúc chờ
> thì tài liệu nói một đằng còn game chạy một nẻo.

Một con Axie luôn dựng từ **đúng sáu bộ phận** (\`.claude/skills/axie-hinh-hoa\` §1): Mắt · Tai ·
Sừng · Miệng · Lưng · Đuôi. **\`cung\`** là số bộ phận thuộc **cùng nhóm tam giác** với \`lop\` của
chính con đó, và nó điều khiển **độ sắc** của hệ số phòng thủ — không điều khiển sức mạnh.

Ba nhóm của tam giác: **① ${hang0.join(' · ')}** ▶ **② ${hang1.join(' · ')}** ▶ **③ ${hang2.join(' · ')}** ▶ ①

| \`cung\` | hạng | độ sắc | nghĩa là |
|---|---|--:|---|
| 5–6 | **Thuần** | ${sacCua(5).toFixed(3)}–${sacCua(6).toFixed(2)} | chuyên gia — rất nhẹ đòn ở vùng hợp, rất nặng ở vùng khắc |
| 3–4 | **Pha** | ${sacCua(3).toFixed(3)}–${sacCua(4).toFixed(2)} | cân — mạnh yếu vừa phải ở cả hai phía |
| 0–2 | **Tạp** | ${sacCua(0).toFixed(2)}–${sacCua(2).toFixed(2)} | thợ đụng — không bao giờ tệ, không bao giờ xuất sắc |

**Kỳ vọng trên cả chín lớp quái bằng nhau cho MỌI con** — bằng nhau chính xác, theo phép dựng
chứ không theo may mắn chọn số. Đổi Axie đổi *hình dạng* rủi ro, không đổi *tổng*.
Xem \`CLAUDE.md\` mục ▲▲ và \`tests/test_bophan.js\`.

## 16 con — xếp từ thuần nhất tới tạp nhất

| Axie | ★ | Lớp | ${BP_TEN.map(k => BP_NHAN[k]).join(' | ')} | \`cung\` | Hạng | Sắc |
|---|--:|---|${BP_TEN.map(() => '---').join('|')}|--:|---|--:|
`;
for (const { c, cung, sac } of rows) {
  const o = BP_TEN.map(k => `${gly(c.bp[k])} ${c.bp[k]}`).join(' | ');
  md += `| **${c.ten}** | ${c.sao} | ${gly(c.lop)} ${c.lop} | ${o} | **${cung}**/6 | ${hang(cung)} | ${sac.toFixed(3)} |\n`;
}

md += `
## Số đo

| | |
|---|--:|
| tổng \`cung\` trên ${rows.length} con | **${tongCung}** |
| trung bình \`cung\` | **${(tongCung / rows.length).toFixed(2)}**/6 |
| **độ sắc trung bình** | **${tbSac.toFixed(3)}** |

Độ sắc trung bình phải nằm quanh **1,00** — đó là mốc của bản *trước* đợt bộ phận, nên lệch khỏi
nó là lặng lẽ đổi độ khó chung của cả game trong khi cơ chế này chỉ được phép đổi *hình dạng*.
\`tests/test_bophan.js §1\` kẹp trong **[0,95 – 1,05]**.

## Hai luật khi thêm hoặc sửa một con

1. **Bộ phận suy từ \`moTa\` đã có, đừng bịa cạnh nó.** \`coghound\` — *"ai đó lắp nó lại từ mảnh
   vỡ"* — có đúng **0** bộ phận thuộc lớp của chính mình; \`inkmane\` — *"vằn đen trên lưng nó đổi
   chỗ mỗi lần bạn quay đi"* — có đúng một, và đó là cái **Lưng**. Dữ liệu đọc ra phải là con vật
   mà câu mô tả đang tả.
2. **Độ thuần KHÔNG được đi theo số sao.** Nếu 5★ nào cũng thuần hơn thì người chơi đọc ra
   *"5★ mạnh hơn"*, mà đó đúng là thứ gacha không được bán. Hiện một trong hai con thuần nhất là
   **4★**. \`test_bophan §1\` gác.
`;

fs.mkdirSync(path.dirname(DICH), { recursive: true });
fs.writeFileSync(DICH, md, 'utf8');
console.log(`✓ ${path.relative(GOC, DICH)} — ${rows.length} con · tổng cung ${tongCung} · sắc TB ${tbSac.toFixed(3)}`);
