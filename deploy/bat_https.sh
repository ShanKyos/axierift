#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════════════
#  BẬT HTTPS CHO AXIE RIFT — một lệnh, chạy trên VPS bằng root
# ═══════════════════════════════════════════════════════════════════════════════════════
#
#     bash /var/www/axiewuxia/deploy/bat_https.sh [email]
#
# Email là TUỲ CHỌN và chỉ dùng để Let's Encrypt gửi cảnh báo sắp hết hạn. Bỏ trống thì đăng ký
# không email — chứng chỉ vẫn tự gia hạn bằng timer của certbot, chỉ là không ai báo nếu timer
# hỏng. KHÔNG có mật khẩu hay khoá nào trong script này, và đừng thêm vào.
#
# ── VÌ SAO KHÔNG CẦN MUA TÊN MIỀN ──────────────────────────────────────────────────────
# `nip.io` phân giải mọi tên dạng <ip-gạch-nối>.nip.io về chính IP đó, và nó nằm trong Public
# Suffix List nên Let's Encrypt cấp chứng chỉ cho từng tên con như một tên miền riêng. Tức
# 14-225-204-107.nip.io là một hostname thật, có chứng chỉ thật, không tốn đồng nào.
#
# ── VÌ SAO ĐÁNG LÀM ────────────────────────────────────────────────────────────────────
# Không chỉ để lấy cái ổ khoá xanh. `net.js` đã sẵn dòng này:
#     if (q === '1') return (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws';
# ⇒ có TLS là `?net=1` TỰ đổi sang `wss://`, multiplayer chạy tiếp, không sửa một dòng mã nào.
# `location /ws` thì đã có sẵn từ đợt cài Bóng Người (deploy/caidat.sh bước 4).
#
# ── BA THỨ SCRIPT NÀY CỐ Ý KHÔNG LÀM ───────────────────────────────────────────────────
# · KHÔNG ép chuyển hướng HTTP→HTTPS (`--no-redirect`). Link cũ `http://14.225.204.107/` đang
#   nằm trong README, trong bài nộp và trong mấy tài liệu khác; bẻ nó đi là tự tay làm hỏng
#   những đường dẫn mình vừa đưa cho người khác. Muốn bật sau thì:
#       certbot --nginx -d <host> --redirect
# · KHÔNG sửa server block ngoài một việc: thêm hostname vào `server_name`. certbot khớp block
#   theo `server_name`, không có tên đó thì nó không biết sửa chỗ nào.
# · KHÔNG đụng vào cron deploy, systemd của Bóng Người, hay bất cứ thứ gì của game.
#
# Chạy lại nhiều lần vô hại — mỗi bước tự kiểm trước khi làm.
set -u

KHO=/var/www/axiewuxia
SB=/etc/nginx/sites-available/axiewuxia
EMAIL="${1:-}"

oc(){ printf '\n\033[1;36m══ %s\033[0m\n' "$*"; }
ok(){ printf '   \033[32m✓\033[0m %s\n' "$*"; }
xx(){ printf '   \033[31m✗ %s\033[0m\n' "$*"; }

[ "$(id -u)" = 0 ] || { xx "Phải chạy bằng root."; exit 1; }

# ⚠ CHẠY TỪ MỘT BẢN SAO NGOÀI CÂY GIT. Cron chạy `git reset --hard` trên chính cây này mỗi 2
#   phút, mà bash ĐỌC script theo từng đoạn TRONG LÚC chạy — tệp đổi giữa chừng là bash đọc lệch
#   byte rồi làm một chuyện không ai từng viết. Cài certbot có thể lâu hơn 2 phút, nên cửa sổ
#   này không phải giả thuyết: nó đã xảy ra thật với tools/reg.sh.
if [ "${HT_BANSAO:-}" != "1" ]; then
  cp -f "$0" /root/.bat-https.sh || { xx "không sao chép được script ra /root"; exit 1; }
  HT_BANSAO=1 exec bash /root/.bat-https.sh "$@"
fi

# ── 1. TÌM HOSTNAME ────────────────────────────────────────────────────────────────────
oc "1/5  hostname"
[ -f "$SB" ] || { xx "Không thấy $SB — VPS này chưa cài nginx theo nếp của dự án."; exit 1; }

# Lấy IP từ chính `server_name` của block đang chạy, KHÔNG hỏi một dịch vụ ngoài: nó đã ở sẵn
# trên máy, và một lời gọi mạng thêm là một chỗ nữa hỏng được.
IP=$(grep -m1 -oP 'server_name\s+\K[^;]+' "$SB" 2>/dev/null \
     | tr ' ' '\n' | grep -m1 -E '^[0-9]+(\.[0-9]+){3}$')
[ -n "$IP" ] || IP=$(hostname -I 2>/dev/null | tr ' ' '\n' | grep -m1 -E '^[0-9]+(\.[0-9]+){3}$')
[ -n "$IP" ] || { xx "Không đoán được IP công khai. Chạy lại và khai tay:  HT_IP=<ip> bash $0"; exit 1; }
IP="${HT_IP:-$IP}"
HOST="$(echo "$IP" | tr '.' '-').nip.io"
ok "IP $IP  ⇒  hostname $HOST"

# nip.io phải phân giải được TRƯỚC khi xin chứng chỉ. Không thì certbot chạy vài chục giây rồi
# mới báo lỗi DNS, và lỗi đó đọc ra giống hệt "Let's Encrypt từ chối ta".
if command -v getent >/dev/null 2>&1; then
  GIAI=$(getent hosts "$HOST" 2>/dev/null | awk '{print $1}' | head -1)
  if [ -z "$GIAI" ]; then
    xx "$HOST không phân giải được — mạng hoặc DNS của VPS chặn nip.io."
    echo "     Thử tay:  getent hosts $HOST"
    echo "     Nếu nip.io bị chặn thì dùng sslip.io: HT_HOST=$(echo "$IP" | tr '.' '-').sslip.io"
    exit 1
  fi
  [ "$GIAI" = "$IP" ] || xx "CẢNH BÁO: $HOST trỏ về $GIAI, không phải $IP — chứng chỉ sẽ trượt."
  ok "$HOST → $GIAI"
fi
HOST="${HT_HOST:-$HOST}"

# ── 2. CERTBOT ─────────────────────────────────────────────────────────────────────────
oc "2/5  certbot"
if command -v certbot >/dev/null 2>&1 && python3 -c 'import certbot_nginx' 2>/dev/null; then
  ok "đã có certbot + plugin nginx"
else
  echo "   cài certbot + python3-certbot-nginx…"
  apt-get update -qq >/dev/null 2>&1
  apt-get install -y certbot python3-certbot-nginx >/tmp/.cb 2>&1 || {
    xx "không cài được certbot:"; tail -5 /tmp/.cb | sed 's/^/     /'; exit 1; }
  ok "đã cài $(certbot --version 2>&1 | head -1)"
fi

# ── 3. THÊM HOSTNAME VÀO server_name ───────────────────────────────────────────────────
oc "3/5  server_name"
if grep -qF "$HOST" "$SB"; then
  ok "server_name đã có $HOST — không sửa nữa"
else
  BAK="$SB.bak.$(date +%Y%m%d-%H%M%S)"
  cp -a "$SB" "$BAK"; ok "đã lưu bản cũ → $BAK"

  python3 - "$SB" "$HOST" <<'PY'
import sys, re
sb, host = sys.argv[1], sys.argv[2]
s = open(sb).read()
# ⚠ Chỉ sửa khi có ĐÚNG MỘT server block — cùng lý do đã ghi ở caidat.sh: đoán sai block ở một
#   tệp đang chạy là mất trang.
if len(re.findall(r'^\s*server\s*\{', s, re.M)) != 1:
    sys.stderr.write('NHIEU_SERVER_BLOCK\n'); sys.exit(2)
n = len(re.findall(r'^\s*server_name\s', s, re.M))
if n != 1:
    sys.stderr.write('SERVER_NAME_%d\n' % n); sys.exit(3)
# Chốt thứ hai cho việc chạy lại. Vỏ ngoài đã `grep -qF` rồi, nhưng nếu ai đó gọi thẳng khối
# python này thì nó sẽ nối thêm hostname LẦN NỮA — nginx không báo lỗi với tên trùng, nên kiểu
# hỏng đó im lặng và cứ mỗi lượt chạy lại dài thêm một đoạn.
if re.search(r'^\s*server_name\s[^;]*(?<![\w.-])' + re.escape(host) + r'(?![\w.-])', s, re.M):
    sys.stderr.write('DA_CO\n'); sys.exit(0)
s2 = re.sub(r'(^\s*server_name\s+)([^;]+)(;)',
            lambda m: m.group(1) + m.group(2).rstrip() + ' ' + host + m.group(3),
            s, count=1, flags=re.M)
if s2 == s:
    sys.stderr.write('KHONG_DOI\n'); sys.exit(4)
open(sb, 'w').write(s2)
PY
  rc=$?
  if [ $rc -ne 0 ]; then
    case $rc in
      2) xx "$SB có nhiều hơn một server block — không tự sửa." ;;
      3) xx "$SB không có đúng một dòng server_name — không tự sửa." ;;
      *) xx "sửa cấu hình hỏng (rc=$rc)" ;;
    esac
    echo "     Thêm tay vào dòng server_name:  $HOST"
    cp -a "$BAK" "$SB"; exit 1
  fi

  if nginx -t >/tmp/.ngt 2>&1; then
    systemctl reload nginx && ok "nginx đã nạp lại với server_name … $HOST"
  else
    xx "nginx -t BÁO LỖI — trả lại bản cũ, KHÔNG reload:"
    sed 's/^/     /' /tmp/.ngt
    cp -a "$BAK" "$SB"; exit 1
  fi
fi

# ── 4. XIN CHỨNG CHỈ ───────────────────────────────────────────────────────────────────
oc "4/5  chứng chỉ Let's Encrypt"
BAK2="$SB.truoc-certbot.$(date +%Y%m%d-%H%M%S)"
cp -a "$SB" "$BAK2"; ok "đã lưu bản trước certbot → $BAK2"

if [ -n "$EMAIL" ]; then
  MAIL_ARG=(-m "$EMAIL")
else
  MAIL_ARG=(--register-unsafely-without-email)
  echo "   (không khai email — Let's Encrypt sẽ không gửi cảnh báo sắp hết hạn."
  echo "    Chứng chỉ vẫn tự gia hạn bằng timer của certbot. Muốn có cảnh báo thì chạy lại"
  echo "    kèm email:  bash $KHO/deploy/bat_https.sh anh@vidu.com )"
fi

# ⚠ --no-redirect là CỐ Ý, lý do ở đầu tệp: link http://<ip>/ đang nằm trong README và bài nộp.
certbot --nginx -d "$HOST" --agree-tos --non-interactive --no-redirect \
        "${MAIL_ARG[@]}" >/tmp/.certbot 2>&1
rc=$?
if [ $rc -ne 0 ]; then
  xx "certbot thất bại (rc=$rc):"
  tail -20 /tmp/.certbot | sed 's/^/     /'
  echo
  echo "     Cấu hình nginx: certbot tự trả lại bản cũ khi hỏng. Bản sao của ta: $BAK2"
  echo "     Kiểm nginx còn lành không:  nginx -t && systemctl reload nginx"
  exit 1
fi
ok "đã cấp chứng chỉ cho $HOST"
grep -m1 -E 'Certificate is saved at|Successfully received' /tmp/.certbot | sed 's/^/     /'

# ── 5. KIỂM ────────────────────────────────────────────────────────────────────────────
oc "5/5  kiểm"
LOI=0
# ⚠ Hỏi qua chính hostname, ĐỪNG hỏi 127.0.0.1: server block khớp theo server_name, và bản
#   Debian ship sẵn sites-enabled/default mang default_server — hỏi sai Host là ra 404 GIẢ.
#   Vết sẹo này đã ghi nguyên văn ở cuối caidat.sh.
if curl -sf --max-time 10 -o /dev/null "https://$HOST/index.html"; then
  ok "https://$HOST/  phục vụ được trang game"
else
  xx "https://$HOST/index.html KHÔNG tải được"; LOI=1
fi

if curl -sf --max-time 10 "https://$HOST/ws/health" >/tmp/.h 2>&1; then
  ok "wss sẵn sàng — /ws/health qua TLS: $(cat /tmp/.h)"
else
  xx "https://$HOST/ws/health không trả lời — multiplayer sẽ không chạy trên link HTTPS."
  echo "     Máy chủ Bóng Người chưa bật? Chẩn đoán:  bash $KHO/deploy/kiemtra_ws.sh"
  LOI=1
fi

if curl -sf --max-time 10 -o /dev/null "http://$IP/index.html"; then
  ok "link cũ http://$IP/ vẫn sống (đúng ý --no-redirect)"
else
  xx "link cũ http://$IP/ ĐÃ HỎNG — đây là lỗi, không phải đánh đổi."; LOI=1
fi

systemctl list-timers 2>/dev/null | grep -q certbot \
  && ok "timer tự gia hạn đang bật" \
  || xx "không thấy timer certbot — kiểm:  systemctl list-timers | grep certbot"

oc "XONG"
if [ $LOI -eq 0 ]; then
  echo "   Dán link này vào ô Playable browser URL:"
  echo
  echo "       https://$HOST/?test=1&lang=en"
  echo
  echo "   Multiplayer:  https://$HOST/?net=1     (tự dùng wss://, không phải sửa gì)"
  echo "   Link cũ vẫn sống:  http://$IP/"
else
  xx "Có mục đỏ ở trên — ĐỪNG dán link HTTPS vào bài nộp cho tới khi sửa xong."
fi
