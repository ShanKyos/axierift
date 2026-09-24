// ART PHẢI LÀ ẢNH THẬT TRONG GIT — không con trỏ Git LFS, không PNG trong gói `magic-runtime`.
//
//   node tests/test_khonglfs.js            (không cần trình duyệt, không cần máy chủ)
//
// Vì sao (chủ dự án chốt phương án B, 2026-09-24): production là VPS `git reset --hard` mỗi 2 phút
// và KHÔNG có `git-lfs`. Một tệp đi qua LFS thì thứ nằm trên đĩa là con trỏ văn bản ~130 byte, nên
// nginx phục vụ đúng cái văn bản ấy thay cho tấm ảnh ⇒ art biến mất, KHÔNG MỘT LỖI NÀO BÁO. Nhánh
// `codex/spellblade-field-package-v2` từng thêm `*.png filter=lfs` và biến cả 47 tấm art ĐANG CHẠY
// thành con trỏ — merge nguyên xi là Spellblade trên production mất sạch hình.
//
//   ① không tệp nào trong git là con trỏ LFS
//   ② không `.gitattributes` nào khai `filter=lfs`
//   ③ gói `magic-runtime` chỉ có WebP (chạy `python3 tools/magic/sang_webp.py` sau mỗi lần nướng)
//   ④ mọi đường dẫn ảnh trong mọi manifest của gói trỏ vào một tệp có thật
//   ⑤ mọi manifest mà manifest gốc nhắc tới có thật (mục `flight_8dir` từng trỏ vào hư không)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO = process.env.AXIE_REPO || path.resolve(__dirname, '..');
const GOI = path.join(REPO, 'public/game/assets/magic-runtime');
let loi = 0;
const fail = (m) => { loi++; console.log('FAIL', m); };
const pass = (m) => console.log('PASS', m);

const tep = execFileSync('git', ['-C', REPO, 'ls-files', '-z'], { maxBuffer: 1 << 26 })
  .toString().split('\0').filter(Boolean);
if (tep.length < 500) { console.log(`QUE DÒ HỎNG: git ls-files chỉ ra ${tep.length} tệp (REPO=${REPO})`); process.exit(1); }

// ①
const tro = [];
for (const f of tep) {
  const p = path.join(REPO, f);
  let st; try { st = fs.statSync(p); } catch { continue; }
  if (!st.isFile() || st.size > 300) continue;
  if (fs.readFileSync(p).subarray(0, 40).toString().startsWith('version https://git-lfs')) tro.push(f);
}
tro.length ? fail(`① ${tro.length} tệp là CON TRỎ LFS, ví dụ ${tro.slice(0, 3).join(' · ')}`)
           : pass(`① ${tep.length} tệp, không tệp nào là con trỏ LFS`);

// ②
const ga = tep.filter(f => path.basename(f) === '.gitattributes')
  .filter(f => /filter\s*=\s*lfs/.test(fs.readFileSync(path.join(REPO, f), 'utf8')));
ga.length ? fail(`② .gitattributes khai filter=lfs: ${ga.join(' · ')}`) : pass('② không .gitattributes nào bật LFS');

// ③
const trongGoi = tep.filter(f => f.startsWith('public/game/assets/magic-runtime/'));
const png = trongGoi.filter(f => /\.(png|gif)$/i.test(f));
const webp = trongGoi.filter(f => /\.webp$/i.test(f));
if (webp.length < 300) fail(`③ QUE DÒ: gói chỉ có ${webp.length} WebP — cảnh dựng sai?`);
png.length ? fail(`③ gói còn ${png.length} PNG/GIF, ví dụ ${png[0]} — chạy tools/magic/sang_webp.py`)
           : pass(`③ gói magic-runtime có ${webp.length} WebP, 0 PNG/GIF`);

// ④ ⑤
const manifest = trongGoi.filter(f => f.endsWith('.json'));
// Nấc lùi y hệt `sang_webp.py`: vài trường ghi đường dẫn tương đối với THƯ MỤC CON của khối
// (`flightAttack.weaponLayer`). Chỉ nhận khi tên tệp DUY NHẤT trong gói — trùng thì không đoán.
const demTen = {};
for (const f of trongGoi) demTen[path.basename(f)] = (demTen[path.basename(f)] || 0) + 1;
let soDuong = 0; const hu = [];
for (const f of manifest) {
  const noi = fs.readFileSync(path.join(REPO, f), 'utf8');
  const thu = path.dirname(path.join(REPO, f));
  for (const [, s] of noi.matchAll(/"([^"\n]+\.(?:png|gif|webp|json))"/g)) {
    if (/^(https?:|\/)/.test(s)) continue;
    soDuong++;
    if (![GOI, thu].some(g => fs.existsSync(path.join(g, s))) && !(!s.includes('/') && demTen[s] === 1)) hu.push(`${f} → ${s}`);
  }
}
if (soDuong < 300) fail(`④ QUE DÒ: chỉ đọc được ${soDuong} đường dẫn trong ${manifest.length} manifest`);
hu.length ? fail(`④⑤ ${hu.length} đường dẫn trỏ vào hư không:\n   ${hu.slice(0, 8).join('\n   ')}`)
          : pass(`④⑤ ${soDuong} đường dẫn trong ${manifest.length} manifest đều có tệp thật`);

console.log(loi ? `\n${loi} FAIL` : '\nTẤT CẢ XANH');
process.exit(loi ? 1 : 0);
