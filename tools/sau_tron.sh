#!/bin/bash
# CỬA CHẶN SAU MỖI `git merge` — chạy ĐÚNG những bài mà phép trộn vừa chạm, trước khi bỏ ra
# một tiếng cho cả bộ.
#
#   bash tools/sau_tron.sh [mốc-so-sánh]     # mặc định ORIG_HEAD (git đặt ngay trước merge)
#
# ⚠ VÌ SAO CẦN NÓ, và nó KHÔNG thay bộ hồi quy đầy đủ.
#
# Phép trộn nguy hiểm nhất KHÔNG phải cái làm git kêu xung đột — cái đó nhìn thấy được và sửa
# được. Nguy hiểm là cái git ghép ÊM RU rồi để lại mã mà CHƯA BÊN NÀO TỪNG KIỂM. Ba lần trong
# một phiên, cùng một hình dạng:
#   · `test_hopve` nhận CẢ HAI chuỗi khẳng định của hai nhánh — một bên đòi `_tkHien` phải chứa
#     `_coAva`, bên kia đòi `atkK`; mã đã hoà không thoả cái nào, `node --check` vẫn xanh;
#   · `test_chaos` nhận thân hàm MỚI của một bên và chỗ ĐỌC biến của bên kia — chỗ đọc nằm
#     NGOÀI khối xung đột nên không ai được hỏi. Nổ `ReferenceError: soKetKhoa is not defined`
#     ở phút thứ 40 của một lượt hồi quy một tiếng;
#   · `_tkHien` — hai nhánh sửa HAI NỬA của cùng một lỗi, ghép lại thì nửa này đè nửa kia.
#
# Ba cái đó có một điểm chung: bài kiểm liên quan nằm ngay trong danh sách tệp mà phép trộn
# chạm vào. Chạy đúng chúng trước thì `soKetKhoa` chết trong 30 giây thay vì 40 phút.
#
# ⚠ VÀ `tests/**/*.js` KHÔNG ĐƯỢC ESLINT NGÓ TỚI (xem `eslint.config.js` — chỉ có
# `**/*.{ts,tsx}` và `public/game/game.js`). Nên `no-undef` không bao giờ chạy ở đó, và đúng
# lớp lỗi "biến mồ côi sau khi trộn" không có cửa nào bắt ngoài việc CHẠY bài. Bật `no-undef`
# cho `tests/` thì phải khai hàng trăm hàm của game (bài gọi chúng trong `p.evaluate`), nên
# cửa đúng là chạy bài, không phải lint.
set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOC="${1:-ORIG_HEAD}"
OUT="${AXIE_SAUTRON_OUT:-/tmp/sautron-$$}"

git -C "$ROOT" rev-parse --verify "$MOC" >/dev/null 2>&1 || {
  echo "LỖI: không có mốc '$MOC'. Sau một merge thì git đặt sẵn ORIG_HEAD;"
  echo "     hoặc truyền tay một commit: bash tools/sau_tron.sh <sha>"; exit 2; }

DOI=$(git -C "$ROOT" diff --name-only "$MOC"...HEAD)
BAI=$(echo "$DOI" | grep -E '^tests/test_.*\.js$' || true)

echo "═══ SAU TRỘN · mốc $MOC → $(git -C "$ROOT" rev-parse --short HEAD) ═══"
echo "tệp phép trộn chạm: $(echo "$DOI" | grep -c . || echo 0)"

# ① cú pháp mọi tệp .js bị chạm — rẻ, và bắt được ca ghép hỏng thành mã không parse nổi
LOI=0
for f in $(echo "$DOI" | grep -E '\.js$' || true); do
  [ -f "$ROOT/$f" ] || continue
  node --check "$ROOT/$f" >/dev/null 2>&1 || { echo "  ✖ cú pháp: $f"; LOI=$((LOI+1)); }
done
[ "$LOI" -eq 0 ] && echo "① cú pháp: sạch"

# ② mỏ neo xung đột còn sót — `git merge` không bao giờ để lại, nhưng một lần sửa tay hụt thì có
SOT=$(cd "$ROOT" && grep -rln '^<<<<<<< \|^>>>>>>> ' --include='*.js' --include='*.md' \
        --include='*.html' --include='*.css' . 2>/dev/null | grep -v node_modules || true)
if [ -n "$SOT" ]; then echo "  ✖ còn mỏ neo xung đột:"; echo "$SOT" | sed 's/^/     /'; LOI=$((LOI+1));
else echo "② mỏ neo xung đột: sạch"; fi

if [ -z "$BAI" ]; then
  echo "③ phép trộn không chạm bài kiểm nào — vẫn phải chạy đủ tools/reg.sh trước khi push main"
  exit $([ "$LOI" -eq 0 ] && echo 0 || echo 1)
fi

echo "③ chạy $(echo "$BAI" | grep -c .) bài mà phép trộn chạm:"
command -v python3 >/dev/null || { echo "cần python3"; exit 1; }
PORT=$(python3 -c "
import socket
s=socket.socket(); s.bind(('127.0.0.1',0)); print(s.getsockname()[1]); s.close()")
rm -rf "$OUT"; mkdir -p "$OUT/src"
cp -r "$ROOT/public/game" "$OUT/snap"
( cd "$OUT/snap" && exec python3 -m http.server "$PORT" >/dev/null 2>&1 ) &
SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
sleep 2
curl -sf -o /dev/null "http://localhost:$PORT/index.html" || { echo "LỖI: không dựng được server"; exit 1; }

# Tệp phụ trợ đi theo — bài require chúng theo đường dẫn tương đối.
for h in "$ROOT"/tests/*.js; do
  case "$(basename "$h")" in test_*) ;; *) cp "$h" "$OUT/src/" ;; esac
done
export NODE_PATH="${NODE_PATH:-/opt/node22/lib/node_modules}"
export AXIE_REPO="$ROOT"
for f in $BAI; do
  n=$(basename "$f")
  [ -f "$ROOT/$f" ] || { echo "  · $n (đã xoá, bỏ qua)"; continue; }
  sed -E "s#localhost:8[0-9]{3}#localhost:$PORT#g" "$ROOT/$f" > "$OUT/src/$n"
  timeout 260 node "$OUT/src/$n" "$PORT" > "$OUT/$n.log" 2>&1
  rc=$?
  if [ "$rc" -eq 0 ]; then echo "  ✔ $n"
  else echo "  ✖ $n (rc=$rc) — $OUT/$n.log"; sed -n '1,6p' "$OUT/$n.log" | sed 's/^/       /'; LOI=$((LOI+1)); fi
done

echo
if [ "$LOI" -eq 0 ]; then
  echo "✔ cửa sau-trộn SẠCH. Vẫn phải chạy đủ tools/reg.sh trước khi push lên main —"
  echo "  cửa này chỉ bắt lớp lỗi SINH RA TỪ PHÉP TRỘN, không thay bộ hồi quy."
else
  echo "✖ $LOI chỗ hỏng — sửa trước khi chạy cả bộ, đừng đốt một tiếng cho một lỗi 30 giây."
fi
exit $([ "$LOI" -eq 0 ] && echo 0 || echo 1)
