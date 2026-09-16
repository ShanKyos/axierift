#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════════════
#  CÀI MÁY CHỦ BÓNG NGƯỜI — một lệnh, chạy trên VPS bằng root
# ═══════════════════════════════════════════════════════════════════════════════════════
#
#     bash /var/www/axiewuxia/deploy/caidat.sh
#
# ⚠ VÌ SAO GỘP THÀNH MỘT SCRIPT: VPS này thường được vào bằng **serial console** của nhà cung
#   cấp, mà loại terminal đó gõ lại từng ký tự qua cổng nối tiếp — dán nhiều dòng thì rớt ký tự
#   và dính dòng. Đã xảy ra hai lần: `/var/www/axiewuxia` dính thành `/var/www/axiewuxisudo`,
#   và một khối bốn dòng dán ra thành một dòng vô nghĩa.
#   Một dòng ngắn thì GÕ TAY được, không cần dán.
#
# Chạy lại nhiều lần vô hại — mỗi bước tự kiểm trước khi làm.
#
# Bốn bước, mỗi bước dừng lại nếu hỏng:
#   1. Node ≥ 18 (cài từ NodeSource nếu thiếu — `apt install nodejs` cho Node 12, quá cũ)
#   2. systemd unit + bật dịch vụ
#   3. bước khởi động lại trong /root/deploy-axiewuxia.sh
#   4. nginx: chuyển tiếp /ws  (tự sao lưu, tự `nginx -t`, hỏng thì trả lại bản cũ)
set -u

KHO=/var/www/axiewuxia
CONG=8877
oc(){ printf '\n\033[1;36m══ %s\033[0m\n' "$*"; }
ok(){ printf '   \033[32m✓\033[0m %s\n' "$*"; }
xx(){ printf '   \033[31m✗ %s\033[0m\n' "$*"; }
CANH3=""
nhacCanh3(){
  [ -n "$CANH3" ] || return 0
  xx "BƯỚC 3 CHƯA XONG — máy chủ sẽ chạy mãi bản cũ sau mỗi lần deploy, và KHÔNG có gì báo."
  echo "     Kiểm: ls -l /root/deploy-axiewuxia.sh   rồi chạy lại:"
  echo "     bash $KHO/deploy/capnhat-deploy.sh"
}

[ "$(id -u)" = 0 ] || { xx "Phải chạy bằng root."; exit 1; }
# ⚠ CHẠY TỪ MỘT BẢN SAO NGOÀI CÂY GIT. Cron chạy `git reset --hard` trên chính cây này mỗi 2
#   phút, mà bash ĐỌC script theo từng đoạn TRONG LÚC chạy — tệp đổi giữa chừng là bash đọc lệch
#   byte rồi làm một chuyện không ai từng viết. Cài Node có thể lâu hơn 2 phút, nên cửa sổ này
#   không phải giả thuyết.
if [ "${BN_BANSAO:-}" != "1" ]; then
  cp -f "$0" /root/.caidat-bongnguoi.sh || { xx "không sao chép được script ra /root"; exit 1; }
  BN_BANSAO=1 exec bash /root/.caidat-bongnguoi.sh "$@"
fi

[ -f "$KHO/server/bongnguoi.js" ] || {
  xx "Không thấy $KHO/server/bongnguoi.js"
  echo "     VPS chưa kéo bản mới về. Cron chạy 2 phút/lần — đợi rồi chạy lại,"
  echo "     hoặc kéo tay:  git -C $KHO fetch origin main && git -C $KHO reset --hard origin/main"
  exit 1
}

# ── 1. NODE ────────────────────────────────────────────────────────────────────────────
oc "1/4  Node.js"
# curl là điều kiện cần của cả bước cài Node lẫn bước kiểm /health, mà bản Debian tối giản
# không có sẵn. Thiếu nó thì lỗi báo ra là "không tải được script NodeSource (mạng?)" — sai chỗ.
command -v curl >/dev/null 2>&1 || {
  echo "   chưa có curl — cài trước"
  apt-get update -qq >/dev/null 2>&1
  apt-get install -y curl >/dev/null 2>&1 || { xx "không cài được curl"; exit 1; }
  ok "đã cài curl"
}
caiNode(){
  echo "   đang cài Node 20 từ NodeSource…"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1 \
    || { xx "không tải được script NodeSource (mạng?)"; return 1; }
  apt-get install -y nodejs >/dev/null 2>&1 || { xx "apt-get install nodejs hỏng"; return 1; }
}
if command -v node >/dev/null 2>&1; then
  V=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)
  if [ "$V" -ge 18 ] 2>/dev/null; then ok "đã có node $(node --version)"
  else
    echo "   node $(node --version) quá cũ (cần ≥ 18) — nâng cấp"
    caiNode || exit 1
  fi
else
  caiNode || exit 1
fi
V=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)
[ "$V" -ge 18 ] 2>/dev/null || { xx "vẫn chưa có node ≥ 18"; exit 1; }
ok "node $(node --version)"
# ⚠ KHÔNG chạy `npm install`. Máy chủ không có phụ thuộc nào — WebSocket tự viết ở
#   server/wsnho.js bằng thư viện chuẩn. Xem lý do ở đầu tệp đó.

# ── 2. SYSTEMD ─────────────────────────────────────────────────────────────────────────
oc "2/4  Dịch vụ bongnguoi"
cp "$KHO/deploy/bongnguoi.service" /etc/systemd/system/ || exit 1
systemctl daemon-reload
systemctl enable bongnguoi >/dev/null 2>&1
systemctl restart bongnguoi
sleep 2
if systemctl is-active --quiet bongnguoi; then ok "dịch vụ đang chạy"
else
  xx "dịch vụ không lên. Nhật ký 20 dòng cuối:"
  journalctl -u bongnguoi -n 20 --no-pager | sed 's/^/     /'
  exit 1
fi
if curl -sf --max-time 5 "http://127.0.0.1:$CONG/health" >/tmp/.bn-health 2>&1; then
  ok "/health trả lời: $(cat /tmp/.bn-health)"
else
  xx "dịch vụ chạy nhưng /health không trả lời ở cổng $CONG"
  journalctl -u bongnguoi -n 20 --no-pager | sed 's/^/     /'
  exit 1
fi

# ── 3. BƯỚC KHỞI ĐỘNG LẠI TRONG DEPLOY ────────────────────────────────────────────────
oc "3/4  Bước khởi động lại trong cron deploy"
# ⚠ `$?` sau một PIPE là mã của `sed`, KHÔNG phải của script — bẫy đã ghi trong CLAUDE.md.
#   Dùng PIPESTATUS[0] để đọc mã thật.
bash "$KHO/deploy/capnhat-deploy.sh" 2>&1 | sed 's/^/   /'
RC3=${PIPESTATUS[0]}
if [ "$RC3" -ne 0 ]; then
  # Không dừng ở đây: dịch vụ đã chạy rồi, và bước nginx vẫn đáng làm. Nhưng phải nhắc LẠI ở
  # cuối — thiếu bước này thì máy chủ chạy mãi bản cũ sau mỗi lần deploy, và KHÔNG có gì báo.
  xx "bước này chưa xong (mã $RC3) — xem dòng ở trên"
  CANH3="1"
fi

# ── 4. NGINX ───────────────────────────────────────────────────────────────────────────
# Chuyển tiếp /ws sang máy chủ. ⚠ Đây là bước ĐỘNG VÀO TỆP ĐANG CHẠY — ngày 31.08 đã một lần
# mất nginx là mất trang, nên: sao lưu → sửa → `nginx -t` → hỏng thì TRẢ LẠI bản cũ, không reload.
oc "4/4  nginx: chuyển tiếp /ws"
SB=/etc/nginx/sites-available/axiewuxia
if [ ! -f "$SB" ]; then
  xx "không thấy $SB — bỏ qua bước nginx."
  echo "     Xem $KHO/deploy/nginx-ws.conf rồi dán tay vào server block đang dùng."
  nhacCanh3; exit 0
fi

if grep -q 'location /ws' "$SB"; then
  ok "server block đã có /ws — không sửa nữa"
else
  # `map` phải ở tầng http{}; conf.d được nginx.conf của Debian/Ubuntu include sẵn.
  if [ ! -f /etc/nginx/conf.d/axiewuxia-ws.conf ]; then
    cat > /etc/nginx/conf.d/axiewuxia-ws.conf <<'MAP'
# WebSocket cần `Connection: upgrade`, nhưng proxy HTTP/1.1 thường phải gửi `Connection: close`.
# `map` chọn đúng giá trị theo việc client có xin nâng cấp hay không — khuôn chính thức của nginx.
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}
MAP
    ok "đã thêm /etc/nginx/conf.d/axiewuxia-ws.conf"
  fi

  BAK="$SB.bak.$(date +%Y%m%d-%H%M%S)"
  cp -a "$SB" "$BAK"; ok "đã lưu bản cũ → $BAK"

  python3 - "$SB" "$CONG" <<'PY'
import sys, re
sb, cong = sys.argv[1], sys.argv[2]
s = open(sb).read()
# ⚠ Chỉ sửa khi có ĐÚNG MỘT server block. Nhiều block thì không đoán được cái nào phục vụ game,
# và đoán sai ở một tệp đang chạy là mất trang.
if len(re.findall(r'^\s*server\s*\{', s, re.M)) != 1:
    sys.stderr.write('NHIEU_SERVER_BLOCK\n'); sys.exit(2)
them = '''
    # Chuyển tiếp WebSocket cho máy chủ Bóng Người (xem deploy/nginx-ws.conf).
    location /ws {
        proxy_pass http://127.0.0.1:%s;
        proxy_http_version 1.1;
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host       $host;
        proxy_set_header X-Real-IP  $remote_addr;
        # Người đứng ở màn chọn lớp chưa gửi gì; 60s mặc định sẽ cắt họ. Client tự nối lại,
        # nhưng nới ra thì đỡ một vòng vô ích.
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
        proxy_buffering off;   # đệm một luồng thời gian thực chỉ cộng thêm độ trễ
    }

    location = /ws/health {
        proxy_pass http://127.0.0.1:%s/health;
        proxy_set_header Host $host;
    }
''' % (cong, cong)
i = s.rstrip().rfind('}')
open(sb, 'w').write(s[:i] + them + s[i:])
PY
  rc=$?
  if [ $rc -eq 2 ]; then
    xx "$SB có nhiều hơn một server block — không tự sửa."
    echo "     Dán tay theo $KHO/deploy/nginx-ws.conf."
    cp -a "$BAK" "$SB"; exit 0
  elif [ $rc -ne 0 ]; then
    xx "sửa cấu hình hỏng — trả lại bản cũ"; cp -a "$BAK" "$SB"; exit 1
  fi

  if nginx -t >/tmp/.ngt 2>&1; then
    systemctl reload nginx && ok "nginx đã nạp lại"
  else
    xx "nginx -t BÁO LỖI — trả lại bản cũ, KHÔNG reload:"
    sed 's/^/     /' /tmp/.ngt
    cp -a "$BAK" "$SB"; rm -f /etc/nginx/conf.d/axiewuxia-ws.conf
    exit 1
  fi
fi

oc "XONG"
nhacCanh3
# ⚠ PHẢI GỬI ĐÚNG `Host`, KHÔNG ĐƯỢC HỎI BẰNG 127.0.0.1 TRƠN. Server block khai
#   `server_name 14.225.204.107`, nên một request mang `Host: 127.0.0.1` chỉ khớp nó khi
#   không site nào khác giữ `default_server` — mà bản Debian ship sẵn `sites-enabled/default`
#   với đúng cờ đó. Bản đầu của dòng này hỏi bằng 127.0.0.1 và in ra một dòng ĐỎ GIẢ trong khi
#   nginx hoàn toàn lành: người chơi thật gửi Host đúng nên họ không bao giờ gặp cái 404 ấy.
#   *Một phép kiểm hỏi sai câu hỏi thì tệ hơn không kiểm: nó gửi người ta đi sửa chỗ không hỏng.*
TEN=$(grep -m1 -oP 'server_name\s+\K[^;]+' "$SB" 2>/dev/null | awk '{print $1}')
BN_OK=""
for H in "$TEN" 127.0.0.1; do
  [ -n "$H" ] || continue
  if curl -sf --max-time 5 -H "Host: $H" http://127.0.0.1/ws/health >/tmp/.bn-h2 2>&1; then
    ok "qua nginx (Host: $H): $(cat /tmp/.bn-h2)"; BN_OK=1; break
  fi
done
if [ -n "$BN_OK" ]; then
  echo
  echo "   Mở game ở HAI máy (hoặc hai cửa sổ ẩn danh):"
  echo "       http://${TEN:-14.225.204.107}/?net=1"
  echo "   Vào cùng một map là thấy nhau chạy."
else
  xx "nginx chưa chuyển tiếp được /ws/health ở bất kỳ Host nào. Chẩn đoán đủ bốn câu:"
  echo "     bash $KHO/deploy/kiemtra_ws.sh"
fi
