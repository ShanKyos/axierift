#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════════════
#  KIỂM /ws — chạy trên VPS bằng root, CHỈ ĐỌC, không sửa gì
# ═══════════════════════════════════════════════════════════════════════════════════════
#
#     bash /var/www/axiewuxia/deploy/kiemtra_ws.sh
#
# Vì sao có tệp này: dòng kiểm cuối của `caidat.sh` gọi `curl http://127.0.0.1/ws/health`,
# tức gửi `Host: 127.0.0.1`. Server block của trang khai `server_name 14.225.204.107`, nên
# nếu còn một site khác giữ `default_server` thì request rơi vào site ĐÓ và trả 404 — trong
# khi trình duyệt thật (gửi đúng Host) vẫn đi đúng chỗ.
# ⇒ Một phép kiểm hỏi sai câu hỏi thì báo đỏ ở chỗ không hỏng. Tệp này hỏi đủ bốn câu, tách
#   bạch, để biết chính xác đứt ở khâu nào.
set -u
CONG=8877
SB=/etc/nginx/sites-available/axiewuxia
ok(){ printf '   \033[32m✓\033[0m %s\n' "$*"; }
xx(){ printf '   \033[31m✗\033[0m %s\n' "$*"; }
oc(){ printf '\n\033[1;36m══ %s\033[0m\n' "$*"; }

[ "$(id -u)" = 0 ] || { xx "Phải chạy bằng root."; exit 1; }

# ── 1. Máy chủ Bóng Người có sống không (bỏ qua nginx) ────────────────────────────────
oc "1/4  Máy chủ (thẳng, không qua nginx)"
if curl -sf --max-time 5 "http://127.0.0.1:$CONG/health" -o /tmp/.k1; then
  ok "cổng $CONG trả lời: $(cat /tmp/.k1)"
else
  xx "cổng $CONG KHÔNG trả lời ⇒ hỏng ở DỊCH VỤ, không phải nginx."
  echo "     systemctl status bongnguoi ; journalctl -u bongnguoi -n 30 --no-pager"
  exit 1
fi

# ── 2. TỆP TÔI SỬA có phải TỆP NGINX ĐỌC không ────────────────────────────────────────
# ⚠ Đây là câu hỏi quan trọng nhất, và là cái bẫy đã ghi trong CLAUDE.md dưới tên `ISO_NEO`:
#   ghi vào một tệp trong khi sản phẩm nạp một tệp khác. Nếu `sites-enabled/axiewuxia` là một
#   BẢN CHÉP chứ không phải symlink (hoặc nginx.conf không include sites-enabled), thì sửa
#   `sites-available` là VÔ HÌNH — `nginx -t` vẫn xanh, reload vẫn chạy, và /ws 404 ở MỌI Host.
#   `nginx -T` in ra cấu hình ĐANG NẠP, nên nó là trọng tài duy nhất ở đây.
oc "2/4  Tệp đã sửa có phải tệp nginx đọc không"
grep -q 'location /ws' "$SB" && ok "$SB có 'location /ws'" || xx "$SB THIẾU 'location /ws'"
SE=/etc/nginx/sites-enabled/axiewuxia
if [ -L "$SE" ]; then ok "sites-enabled/axiewuxia là symlink → $(readlink -f "$SE")"
elif [ -f "$SE" ]; then xx "sites-enabled/axiewuxia là BẢN CHÉP, không phải symlink"
  echo "     ⇒ sửa sites-available KHÔNG tới được nginx. Sửa: rm $SE && ln -s $SB $SE && nginx -t && systemctl reload nginx"
else xx "không có $SE"; fi
N=$(nginx -T 2>/dev/null | grep -c 'location /ws')
if [ "${N:-0}" -gt 0 ]; then ok "cấu hình ĐANG NẠP có $N khối 'location /ws'"
else
  xx "cấu hình ĐANG NẠP **KHÔNG CÓ** 'location /ws' — đây chính là lỗi."
  echo "     Tệp nginx thật sự đọc server block ở đâu:"
  nginx -T 2>/dev/null | grep -nE '^# configuration file|server_name' | sed 's/^/     /' | head -20
fi
[ -f /etc/nginx/conf.d/axiewuxia-ws.conf ] && ok "có conf.d/axiewuxia-ws.conf (khối map)" \
  || xx "THIẾU conf.d/axiewuxia-ws.conf ⇒ \$connection_upgrade không khai"
nginx -t >/tmp/.k2 2>&1 && ok "nginx -t sạch" || { xx "nginx -t LỖI:"; sed 's/^/     /' /tmp/.k2; }
TEN=$(grep -m1 -oP 'server_name\s+\K[^;]+' "$SB" | awk '{print $1}')
ok "server_name = ${TEN:-（không khai）}"

# ── 3. Còn site nào khác giữ default_server không ─────────────────────────────────────
# Đây là câu hỏi quyết định: nếu có, thì mọi request có Host LẠ (kể cả 127.0.0.1) đi vào
# site đó, và phép kiểm bằng 127.0.0.1 sẽ đỏ dù trang hoàn toàn lành.
oc "3/4  Ai là default_server"
DS=$(grep -rl 'default_server' /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null)
if [ -n "$DS" ]; then
  xx "có site khác giữ default_server:"; echo "$DS" | sed 's/^/     /'
  echo "     ⇒ kiểm bằng 127.0.0.1 sẽ ĐỎ GIẢ. Câu trả lời thật nằm ở mục 4."
else
  ok "không site nào khai default_server"
fi
ls /etc/nginx/sites-enabled/ 2>/dev/null | sed 's/^/     site bật: /'

# ── 4. Hỏi ĐÚNG câu: đi qua nginx với Host THẬT ───────────────────────────────────────
oc "4/4  Qua nginx — đây mới là điều người chơi gặp"
THU(){  # $1 = nhãn, $2 = Host
  M=$(curl -s -o /tmp/.k4 -w '%{http_code}' --max-time 5 -H "Host: $2" http://127.0.0.1/ws/health)
  if [ "$M" = 200 ]; then ok "Host: $2 → 200 · $(cat /tmp/.k4)"; TOT=1
  else xx "Host: $2 → HTTP $M"; fi
}
TOT=0
[ -n "${TEN:-}" ] && THU ten "$TEN"
THU lo 127.0.0.1

echo
if [ "$TOT" = 1 ]; then
  printf '\033[32m   ⇒ /ws CHẠY. Mở hai cửa sổ:  http://%s/?net=1\033[0m\n' "${TEN:-14.225.204.107}"
  printf '     Vào cùng một map là thấy nhau chạy.\n'
else
  printf '\033[31m   ⇒ /ws KHÔNG qua được nginx ở bất kỳ Host nào — đây là lỗi thật.\033[0m\n'
  echo "     Xem khối /ws thực sự nginx đang nạp:"
  nginx -T 2>/dev/null | grep -n -A6 'location /ws' | sed 's/^/     /'
fi
