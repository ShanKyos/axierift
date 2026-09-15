#!/usr/bin/env node
/* Sinh `public/game/data/taitro.js` — BẢN KÊ TÀI NGUYÊN của màn tải.
 *
 * Vì sao phải có tệp này: thanh tiến độ chỉ trung thực khi nó cân theo SỐ BYTE THẬT. Đếm theo
 * số tệp thì một lớp mây 12 KB và một dải khung nhân vật 98 KB nhảy bằng nhau — thanh chạy vọt
 * rồi đứng im ở cuối, tức là nói dối theo đúng kiểu khó bắt nhất.
 *
 * Chạy:  node tools/title/liet_ke_taitro.cjs
 * Sau mỗi lần nướng lại art màn chờ thì chạy lại. `tests/test_taitro.js` đỏ nếu quên.
 *
 * ⚠ DANH SÁCH AXIE ĐỌC TỪ `AVA_MAC_DINH` TRONG game.js, không chép tay. Chép tay là dựng bản
 *   sao thứ hai của một bảng đang sống — đúng cái bẫy đã dẫm với CC_AXIE_LOP (màn chờ hứa
 *   Ironshell trong khi game cho Emberjaw). Không tách được bảng ra thì DỪNG HẲN, đừng đoán.
 */
const fs = require('fs'), path = require('path');

const GOC  = path.resolve(__dirname, '../..');
const GAME = path.join(GOC, 'public/game');

function kich(p){
  const abs = path.join(GAME, p);
  if (!fs.existsSync(abs)) throw new Error('Thiếu tệp: ' + p);
  return fs.statSync(abs).size;
}
function thuMuc(d){
  return fs.readdirSync(path.join(GAME, d)).filter(f => f.endsWith('.webp')).sort()
           .map(f => d + '/' + f);
}

// ── Axie mặc định của năm lớp, đọc thẳng từ game.js ──────────────────────────
function avaMacDinh(){
  const s = fs.readFileSync(path.join(GAME, 'game.js'), 'utf8');
  const m = s.match(/const AVA_MAC_DINH = \{([\s\S]*?)\};/);
  if (!m) throw new Error('Không tìm thấy AVA_MAC_DINH trong game.js — bảng đã đổi hình, sửa tệp này trước khi chạy tiếp.');
  const ids = [...m[1].matchAll(/:\s*'([a-z0-9_]+)'/g)].map(x => x[1]);
  if (ids.length < 5) throw new Error('AVA_MAC_DINH chỉ đọc được ' + ids.length + ' mục, chờ ít nhất 5.');
  return [...new Set(ids)];
}

const NHOM = [
  { id:'canh', ten:'Cảnh Lunacia',      tep: thuMuc('assets/title/lunacia') },
  { id:'lop',  ten:'Năm lớp nhân vật',  tep: thuMuc('assets/title/lop') },
  { id:'axie', ten:'Axie đại diện',     tep: avaMacDinh().map(id => 'assets/chimera/' + id + '.webp') },
];

let tong = 0;
const ra = NHOM.map(n => {
  const tep = n.tep.map(p => { const b = kich(p); tong += b; return [p, b]; });
  return { id:n.id, ten:n.ten, tep };
});

const out = `/* SINH RA TỰ ĐỘNG bởi tools/title/liet_ke_taitro.cjs — đừng sửa tay.
   Bản kê tài nguyên màn tải: [đường dẫn, số byte]. Thanh tiến độ cân theo BYTE, không theo
   số tệp — xem lý do trong đầu tệp công cụ. Nướng lại art màn chờ thì chạy lại công cụ. */
window.TAI_TRO = {
 "tong": ${tong},
 "nhom": [
${ra.map(n => `  { "id":"${n.id}", "ten":"${n.ten}", "tep":[\n` +
    n.tep.map(([p, b]) => `   ["${p}",${b}]`).join(',\n') + `\n  ]}`).join(',\n')}
 ]
};
`;
fs.writeFileSync(path.join(GAME, 'data/taitro.js'), out);
console.log('data/taitro.js — ' + ra.reduce((a, n) => a + n.tep.length, 0) + ' tệp, '
  + (tong / 1024).toFixed(0) + ' KB');
for (const n of ra) console.log('  ' + n.ten + ': ' + n.tep.length + ' tệp, '
  + (n.tep.reduce((a, t) => a + t[1], 0) / 1024).toFixed(0) + ' KB');
