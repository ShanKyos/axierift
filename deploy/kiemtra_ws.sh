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
oc "1/7  Máy chủ (thẳng, không qua nginx)"
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
oc "2/7  Tệp đã sửa có phải tệp nginx đọc không"
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
oc "3/7  Ai là default_server"
DS=$(grep -rl 'default_server' /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null)
if [ -n "$DS" ]; then
  xx "có site khác giữ default_server:"; echo "$DS" | sed 's/^/     /'
  echo "     ⇒ kiểm bằng 127.0.0.1 sẽ ĐỎ GIẢ. Câu trả lời thật nằm ở mục 4."
else
  ok "không site nào khai default_server"
fi
ls /etc/nginx/sites-enabled/ 2>/dev/null | sed 's/^/     site bật: /'

# ── 4. /ws/health qua nginx — CHỈ chứng minh proxy tới được máy chủ ────────────────────
# ⚠ ĐỪNG ĐỌC MỤC NÀY THÀNH "WEBSOCKET CHẠY". `location = /ws/health` là khối khớp CHÍNH XÁC và
#   nó chỉ đặt mỗi header `Host`; bắt tay WebSocket đi qua khối `location /ws` (khớp tiền tố),
#   nơi mới có `Upgrade`/`Connection`. Hai khối khác nhau. Mục 5 mới là mục trả lời câu thật.
oc "4/7  /ws/health qua nginx (chỉ nói: proxy có tới máy chủ không)"
THU(){
  M=$(curl -s -o /tmp/.k4 -w '%{http_code}' --max-time 5 -H "Host: $2" http://127.0.0.1/ws/health)
  if [ "$M" = 200 ]; then ok "Host: $2 → 200 · $(cat /tmp/.k4)"; TOT=1
  else xx "Host: $2 → HTTP $M"; fi
}
TOT=0
[ -n "${TEN:-}" ] && THU ten "$TEN"
THU lo 127.0.0.1

# ── 5. BẮT TAY WEBSOCKET THẬT — đây mới là thứ trình duyệt làm ────────────────────────
# Phải ra `101 Switching Protocols`. Ra 200/404/502 nghĩa là nginx KHÔNG chuyển tiếp nâng cấp:
# gần như luôn là `proxy_set_header Upgrade/Connection` thiếu, hoặc `$connection_upgrade` rỗng
# vì khối `map` không được nạp.
oc "5/7  Bắt tay WebSocket qua nginx"
BT=$(curl -i -s --max-time 5 --http1.1 -H "Host: ${TEN:-127.0.0.1}" \
      -H "Upgrade: websocket" -H "Connection: Upgrade" \
      -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" -H "Sec-WebSocket-Version: 13" \
      http://127.0.0.1/ws 2>/dev/null | head -1)
WS_OK=""
case "$BT" in
  *101*) ok "$BT"; WS_OK=1 ;;
  "")    xx "không có hồi đáp nào (nginx không chạy? tường lửa?)" ;;
  *)     xx "hồi đáp: $BT   ← cần 101 Switching Protocols"
         echo "     Khối /ws mà nginx ĐANG NẠP:"
         nginx -T 2>/dev/null | grep -A10 'location /ws {' | sed 's/^/     /' ;;
esac

# ── 6. Trang có thật sự nạp net.js không ──────────────────────────────────────────────
# Máy chủ lành + nginx lành mà vẫn không thấy bóng người thì chỉ còn phía trang: thẻ script
# thiếu, hoặc net.js 404, hoặc trình duyệt giữ bản index.html cũ.
oc "6/7  Trang có nạp net.js không"
curl -s --max-time 5 -H "Host: ${TEN:-127.0.0.1}" http://127.0.0.1/index.html > /tmp/.k6
grep -q 'net\.js' /tmp/.k6 && ok "index.html có thẻ <script src=\"net.js\">" \
  || xx "index.html KHÔNG nhắc net.js — VPS chưa kéo bản mới? (git -C /var/www/axiewuxia log -1)"
M6=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 -H "Host: ${TEN:-127.0.0.1}" http://127.0.0.1/net.js)
[ "$M6" = 200 ] && ok "net.js tải được (HTTP 200)" || xx "net.js → HTTP $M6"
CC=$(curl -sI --max-time 5 -H "Host: ${TEN:-127.0.0.1}" http://127.0.0.1/index.html | grep -i '^cache-control' | tr -d '\r')
ok "${CC:-（không có Cache-Control cho index.html）}"

# ── 7. TRÌNH DUYỆT NHẬN ĐƯỢC BẢN net.js NÀO ──────────────────────────────────────────
# ⚠ Câu hỏi thật không phải "đĩa có bản mới chưa" mà là "thứ ĐI QUA NGINX tới trình duyệt có
#   bản mới chưa" — hai cái đó lệch nhau được (VPS chưa kéo · nginx phục vụ thư mục khác).
#   Dấu nhận: `gio + TRE_MS` chỉ có trong bản đã vá lỗi "thân người từ xa đứng chết".
oc "7/7  net.js tới trình duyệt là bản nào"
echo "     commit trên VPS: $(git -C /var/www/axiewuxia log -1 --format='%h %s' 2>/dev/null | cut -c1-70)"
D=$(grep -c 'gio + TRE_MS' /var/www/axiewuxia/public/game/net.js 2>/dev/null || echo 0)
W=$(curl -s --max-time 5 -H "Host: ${TEN:-127.0.0.1}" http://127.0.0.1/net.js | grep -c 'gio + TRE_MS')
[ "${D:-0}" -gt 0 ] && ok "trên ĐĨA: đã có bản vá" || xx "trên ĐĨA: CHƯA có bản vá (VPS chưa kéo — đợi 2 phút)"
if [ "${W:-0}" -gt 0 ]; then ok "QUA NGINX: đã có bản vá ⇒ chỉ cần Ctrl+Shift+R ở trình duyệt"
else xx "QUA NGINX: CHƯA có bản vá — trình duyệt đang nhận mã cũ, thân người từ xa sẽ đứng chết"; fi

echo
if [ -n "$WS_OK" ]; then
  printf '\033[32m   ⇒ /ws BẮT TAY ĐƯỢC. Mở hai cửa sổ:  http://%s/?net=1\033[0m\n' "${TEN:-14.225.204.107}"
  echo "     Vẫn không thấy nhau thì mở F12 → Console, gõ:   NET.tinhTrang"
  echo "        'da-noi' = đã nối (xem hai người có ở CÙNG một map không)"
  echo "        'roi' / 'dang-noi' = trình duyệt không nối được — chụp tab Network gửi tôi"
  echo "        'tat' = trang không thấy ?net=1, hoặc đang chạy index.html CŨ (Ctrl+Shift+R)"
else
  printf '\033[31m   ⇒ Nâng cấp WebSocket KHÔNG qua được nginx — đây là lỗi thật, xem mục 5.\033[0m\n'
fi
