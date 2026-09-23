#!/bin/bash
# Đổi cron deploy từ nhánh `main` sang nhánh `release` — và ngược lại.
#
# Chạy trên VPS, bằng root, MỘT DÒNG:
#     bash /var/www/axiewuxia/deploy/doi_sang_release.sh
#
# Quay lại `main`:
#     bash /var/www/axiewuxia/deploy/doi_sang_release.sh --lui
#
# Chạy lại nhiều lần vô hại.
#
# ⚠ VÌ SAO PHẢI GÓI VỀ MỘT DÒNG: chủ dự án vào VPS bằng serial console của nhà cung cấp. Loại
# terminal đó gõ lại từng ký tự qua cổng nối tiếp nên DÁN NHIỀU DÒNG LÀ RỚT KÝ TỰ và dính dòng —
# đã xảy ra hai lần (`/var/www/axiewuxia` dính thành `/var/www/axiewuxisudo`). Một dòng ngắn thì
# gõ tay được.
set -u

DEPLOY=/root/deploy-axiewuxia.sh
KHO=/var/www/axiewuxia
TU=main;  DEN=release
[ "${1:-}" = "--lui" ] && { TU=release; DEN=main; }

# ⚠ TỰ CHÉP RA /root RỒI CHẠY LẠI. Cron chạy `git reset --hard` trên chính cây này 2 phút một
# lần, mà **bash đọc script theo từng đoạn TRONG LÚC chạy** — tệp đổi giữa chừng là bash đọc
# lệch byte rồi làm một chuyện không ai từng viết. Vết sẹo này đã xảy ra thật với `tools/reg.sh`
# (lỗi cú pháp ở một dòng mà `bash -n` ngay sau đó lại xanh). Cùng lối `caidat.sh` đã làm.
case "$0" in
  "$KHO"/*)
    cp -f "$0" /root/.doi_sang_release.sh && exec bash /root/.doi_sang_release.sh "$@" ;;
esac

[ -f "$DEPLOY" ] || { echo "❌ Không thấy $DEPLOY — kiểm lại đường dẫn script deploy."; exit 1; }

# ⚠ KIỂM NHÁNH ĐÍCH CÓ THẬT TRƯỚC KHI ĐỤNG VÀO GÌ. Trỏ cron vào một nhánh không tồn tại thì
# `git fetch` đỏ mỗi 2 phút và trang ĐỨNG IM ở bản cũ — không lỗi nào hiện ra cho người chơi,
# và nhìn ra y hệt "deploy chết".
if ! git -C "$KHO" ls-remote --exit-code --heads origin "$DEN" >/dev/null 2>&1; then
  echo "❌ Nhánh '$DEN' KHÔNG có trên origin. Tạo nó trước rồi hãy chạy lại:"
  echo "     git -C $KHO push origin origin/$TU:refs/heads/$DEN"
  exit 1
fi
echo "✓ Nhánh '$DEN' có trên origin."

if ! grep -qE "origin/$TU|origin $TU" "$DEPLOY"; then
  if grep -qE "origin/$DEN|origin $DEN" "$DEPLOY"; then
    echo "✓ $DEPLOY đã trỏ vào '$DEN' rồi — không đổi gì."; exit 0
  fi
  echo "❌ Không tìm thấy 'origin/$TU' lẫn 'origin $TU' trong $DEPLOY. Nội dung hiện tại:"
  echo "────────────────────────────────"; cat "$DEPLOY"; echo "────────────────────────────────"
  exit 1
fi

BAK="$DEPLOY.bak.$(date +%Y%m%d-%H%M%S)"
cp -a "$DEPLOY" "$BAK"
echo "✓ Đã lưu bản cũ → $BAK"

# Chỉ đổi ở NGỮ CẢNH GIT (`origin/<nhánh>` và `origin <nhánh>`), đừng đổi mọi chữ "main" —
# script có thể nhắc chữ đó trong một chú thích hay một đường dẫn, và đổi bừa là hỏng chỗ khác.
sed -i -E "s#origin/$TU\b#origin/$DEN#g; s#origin $TU\b#origin $DEN#g" "$DEPLOY"

if ! bash -n "$DEPLOY"; then
  echo "❌ LỖI CÚ PHÁP sau khi sửa — trả lại bản cũ."; cp -a "$BAK" "$DEPLOY"; exit 1
fi

con=$(grep -cE "origin/$TU\b|origin $TU\b" "$DEPLOY" || true)
[ "$con" -eq 0 ] || { echo "❌ Còn $con chỗ trỏ '$TU' — trả lại bản cũ."; cp -a "$BAK" "$DEPLOY"; exit 1; }

echo "✓ Cú pháp OK · không còn chỗ nào trỏ '$TU'."
echo "────────────────────────────────"; cat "$DEPLOY"; echo "────────────────────────────────"

# Chạy thử ngay một lượt để biết nó thật sự kéo được, thay vì đợi cron 2 phút rồi mới biết hỏng.
echo "▶ Chạy thử một lượt deploy…"
if bash "$DEPLOY"; then
  echo "✅ XONG. VPS nay chạy theo nhánh '$DEN'."
  echo "   Commit đang phục vụ: $(git -C "$KHO" rev-parse --short HEAD)"
else
  echo "❌ Lượt deploy thử THẤT BẠI — trả lại bản cũ ($TU)."; cp -a "$BAK" "$DEPLOY"; exit 1
fi
