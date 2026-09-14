#!/bin/bash
# Thêm bước KHỞI ĐỘNG LẠI máy chủ Bóng Người vào /root/deploy-axiewuxia.sh.
#
# Chạy MỘT LẦN trên VPS, bằng root:
#     bash /var/www/axiewuxia/deploy/capnhat-deploy.sh
#
# Chạy lại nhiều lần vô hại (nó kiểm trước khi thêm).
#
# ⚠ VÌ SAO KHÔNG PHẢI MỘT DÒNG `systemctl restart` TRƠN:
#   cron chạy script deploy **2 phút một lần, bất kể có commit mới hay không**.
#   Một dòng restart vô điều kiện = đá mọi người đang chơi ra khỏi game mỗi 2 phút.
#
#   Nên mốc so sánh là **commit cuối cùng chạm vào `server/` hoặc `package.json`**.
#   Deploy chỉ đổi art/game.js (trường hợp thường gặp nhất của dự án này) thì con số
#   đó không đổi ⇒ không ai bị ngắt. Chỉ khi mã máy chủ thật sự đổi mới restart.
set -u

DEPLOY=/root/deploy-axiewuxia.sh

[ -f "$DEPLOY" ] || { echo "Không thấy $DEPLOY — kiểm lại đường dẫn script deploy."; exit 1; }

if grep -q 'bongnguoi' "$DEPLOY"; then
  echo "Đã có bước khởi động lại trong $DEPLOY — không thêm nữa."
  exit 0
fi

BAK="$DEPLOY.bak.$(date +%Y%m%d-%H%M%S)"
cp -a "$DEPLOY" "$BAK"
echo "Đã lưu bản cũ  →  $BAK"

cat >> "$DEPLOY" <<'KHOI'

# ── Bóng Người: khởi động lại khi MÃ MÁY CHỦ đổi ───────────────────────────────
# `git reset --hard` ở trên đổi mã dưới chân tiến trình đang chạy, mà nó không tự
# khởi động lại — nó sẽ chạy bản cũ mãi mãi và KHÔNG có gì báo.
#
# ⚠ Chỉ restart khi `server/` hoặc `package.json` thật sự đổi. Cron chạy 2 phút một
# lần; restart vô điều kiện là đá mọi người ra khỏi game mỗi 2 phút.
MOC_BN=/root/.bongnguoi-ver
VER_BN=$(git -C /var/www/axiewuxia log -1 --format=%H -- server/ package.json 2>/dev/null)
if [ -n "$VER_BN" ] && [ "$VER_BN" != "$(cat "$MOC_BN" 2>/dev/null)" ]; then
  echo "$VER_BN" > "$MOC_BN"
  /usr/bin/systemctl is-active --quiet bongnguoi && /usr/bin/systemctl restart bongnguoi
fi
KHOI

if bash -n "$DEPLOY"; then
  echo "Cú pháp OK. Nội dung $DEPLOY bây giờ:"
  echo "────────────────────────────────────────"
  cat "$DEPLOY"
  echo "────────────────────────────────────────"
else
  echo "LỖI CÚ PHÁP — trả lại bản cũ."
  cp -a "$BAK" "$DEPLOY"
  exit 1
fi
