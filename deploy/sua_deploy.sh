#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════════════
#  DỰNG LẠI CRON TỰ DEPLOY — một lệnh, chạy trên VPS bằng root
# ═══════════════════════════════════════════════════════════════════════════════════════
#
#     cd /var/www/axiewuxia && git fetch origin main && git reset --hard origin/main && bash deploy/sua_deploy.sh
#
# (Dòng đầu kéo tay một lượt, vì khi cron hỏng thì chính tệp này cũng chưa tới được VPS.)
#
# Dùng khi push lên `main` mà trang không đổi. Nó GHI LẠI TỪ ĐẦU hai thứ, thay vì vá:
#   1. /root/deploy-axiewuxia.sh — kéo `main` (không phải `release`), có khoá chống chạy chồng,
#      có bước khởi động lại Bóng Người khi `server/` đổi, và ghi log.
#   2. crontab root — xoá MỌI dòng cũ gọi script deploy (dòng trùng = hai lượt `git reset`
#      giẫm nhau), rồi thêm ĐÚNG MỘT dòng.
# Rồi chạy thử một lượt và in ra commit đang phục vụ so với `origin/main`.
#
# Bản cũ được sao lưu cạnh nó (`.bak.<giờ>`). Chạy lại nhiều lần vô hại.
# ⚠ Không có mật khẩu/khoá nào trong tệp này, và đừng thêm vào.
set -u

KHO=/var/www/axiewuxia
DEPLOY=/root/deploy-axiewuxia.sh
LOG=/var/log/axiewuxia-deploy.log
oc(){ printf '\n\033[1;36m══ %s\033[0m\n' "$*"; }
ok(){ printf '   \033[32m✓\033[0m %s\n' "$*"; }
xx(){ printf '   \033[31m✗ %s\033[0m\n' "$*"; }

[ "$(id -u)" = 0 ] || { xx "Phải chạy bằng root."; exit 1; }

# ⚠ Chạy từ bản sao NGOÀI cây git: script deploy sẽ `git reset --hard` chính cây này ở bước 4,
#   mà bash đọc script theo từng đoạn trong lúc chạy (cùng lý do với caidat.sh).
case "$0" in
  "$KHO"/*) cp -f "$0" /root/.sua_deploy.sh && exec bash /root/.sua_deploy.sh "$@" ;;
esac

[ -d "$KHO/.git" ] || { xx "Không thấy kho git ở $KHO"; exit 1; }

oc "1/4  Kho git"
rm -f "$KHO/.git/index.lock" 2>/dev/null && true
git config --global --add safe.directory "$KHO" 2>/dev/null
if git -C "$KHO" fetch origin main --quiet; then ok "fetch origin/main được"
else xx "git fetch HỎNG — lỗi mạng hoặc quyền truy cập GitHub. Chạy tay để xem lỗi:"
     echo "     git -C $KHO fetch origin main"; exit 1; fi

oc "2/4  Ghi lại $DEPLOY"
[ -f "$DEPLOY" ] && cp -a "$DEPLOY" "$DEPLOY.bak.$(date +%Y%m%d-%H%M%S)" && ok "đã sao lưu bản cũ"
cat > "$DEPLOY" <<'KHOI'
#!/bin/bash
# Tự deploy Axie Rift: kéo `main` mỗi 2 phút. Sinh bằng deploy/sua_deploy.sh — sửa ở đó.
KHO=/var/www/axiewuxia
# Khoá: lượt trước chưa xong thì lượt này bỏ qua, không chạy chồng.
exec 9>/tmp/.axiewuxia-deploy.lock
flock -n 9 || exit 0
cd "$KHO" || exit 1
rm -f .git/index.lock
git fetch origin main --quiet || { echo "$(date '+%F %T') fetch hỏng"; exit 1; }
CU=$(git rev-parse HEAD)
git reset --hard origin/main --quiet || { echo "$(date '+%F %T') reset hỏng"; exit 1; }
MOI=$(git rev-parse HEAD)
[ "$CU" != "$MOI" ] && echo "$(date '+%F %T') ${CU:0:7} -> ${MOI:0:7}"

# Bóng Người: chỉ khởi động lại khi mã máy chủ đổi (restart mỗi 2 phút là đá mọi người ra).
MOC_BN=/root/.bongnguoi-ver
VER_BN=$(git log -1 --format=%H -- server/ package.json 2>/dev/null)
if [ -n "$VER_BN" ] && [ "$VER_BN" != "$(cat "$MOC_BN" 2>/dev/null)" ]; then
  echo "$VER_BN" > "$MOC_BN"
  /usr/bin/systemctl is-active --quiet bongnguoi && /usr/bin/systemctl restart bongnguoi
fi
exit 0
KHOI
chmod +x "$DEPLOY"
bash -n "$DEPLOY" && ok "cú pháp OK" || { xx "lỗi cú pháp"; exit 1; }

oc "3/4  Crontab"
CU=$(crontab -l 2>/dev/null | grep -c 'deploy-axiewuxia' || true)
echo "   dòng cũ gọi script deploy: $CU"
{ crontab -l 2>/dev/null | grep -v 'deploy-axiewuxia'
  echo "*/2 * * * * $DEPLOY >> $LOG 2>&1"; } | crontab -
ok "crontab nay có đúng $(crontab -l | grep -c 'deploy-axiewuxia') dòng:"
crontab -l | grep 'deploy-axiewuxia' | sed 's/^/     /'
# Cron hệ thống cũng có thể gọi trùng — chỉ báo, không tự xoá tệp ngoài.
L=$(grep -rl 'deploy-axiewuxia' /etc/cron* 2>/dev/null)
[ -n "$L" ] && { xx "còn chỗ KHÁC cũng gọi script deploy (xoá dòng đó đi):"; echo "$L" | sed 's/^/     /'; }
systemctl is-active --quiet cron || systemctl is-active --quiet crond \
  && ok "dịch vụ cron đang chạy" || { xx "dịch vụ cron KHÔNG chạy — bật: systemctl enable --now cron"; }

oc "4/4  Chạy thử một lượt"
bash "$DEPLOY"
H=$(git -C "$KHO" rev-parse --short HEAD); O=$(git -C "$KHO" rev-parse --short origin/main)
if [ "$H" = "$O" ]; then ok "đang phục vụ $H = origin/main  →  $(git -C "$KHO" log -1 --format=%s)"
else xx "HEAD $H ≠ origin/main $O"; exit 1; fi
echo
echo "   Xong. Từ giờ push lên main là ≤2 phút sau có trên web. Log: tail $LOG"
