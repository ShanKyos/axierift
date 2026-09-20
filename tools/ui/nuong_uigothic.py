#!/usr/bin/env python3
"""Cắt bộ UI gothic (Meowa) thành từng icon rời cho game.

Nguồn: `tools/ui/nguon/ui_gothic_2048.png` — một tấm 2048×2048 do chủ dự án đưa (gói Godot 4
`image-2`). Tấm gốc **4,2 MB**, để trong `tools/` nên KHÔNG bao giờ tới tay người chơi; thứ
ship là mấy tệp WebP vài KB mà công cụ này cắt ra.

⚠ CẮT, ĐỪNG SHIP CẢ TẤM. Màn tải của game có ngân sách đo được (21 tệp / 1,63 MB — xem
`data/taitro.js`). Nhét một tấm 4,2 MB vào đó là nhân đôi thời gian chờ để lấy vài cái icon.
Đo được: 24 mảnh đáng cắt của tấm này cộng lại chỉ **277 KB** WebP.

⚠ QUY TẮC SỐ 3 LÀM ĐÚNG ĐƯỜNG: tranh thật, tra bảng khai, không `ctx.beginPath()`.
⚠ QUY TẮC SỐ 1: khung kim loại gothic vát cạnh — đúng thứ mục "PHẢI dùng" gọi tên.
⚠ QUY TẮC SỐ 2: tấm này do Meowa sinh, không mang tên riêng nào của MU Online.

Toạ độ trong BANG đo bằng máy (phân mảnh theo alpha, ngưỡng 24, đảo liên thông 8 hướng),
không chấm tay — chạy `--quet` để in lại bảng 97 mảnh rời của tấm gốc.
"""
import io, os, sys
from PIL import Image

NGUON = os.path.join(os.path.dirname(__file__), 'nguon', 'ui_gothic_2048.png')
RA    = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'game', 'assets', 'ui')

# Nướng ở 64px: nút loa trên HUD hiện ra 21px, màn 2× cần 42px ⇒ 64 còn dư, và fit-square
# (không kéo giãn) y như `nuong_ngoc.py` — ba icon này tỉ lệ rộng/cao khác nhau khá nhiều.
O = 64

# tên tệp → (x, y, rộng, cao) trên tấm gốc
BANG = [
    # ── âm thanh ──
    ('gt_loa_bat',   (1546, 311, 57, 53)),   # loa có sóng   — âm thanh ĐANG BẬT
    ('gt_loa_tat',   (1643, 311, 56, 53)),   # loa kèm dấu × — âm thanh ĐÃ TẮT
    ('gt_nhac',      (1747, 306, 52, 60)),   # nốt nhạc      — hàng Nhạc nền trong Cài Đặt
    # ── thanh dưới: hai nút DUY NHẤT còn là ký tự chữ. `CLAUDE.md` ghi thẳng lý do —
    #    "⚑ và ♥ vẫn là ký tự, không phải tranh: ic_*.png chưa có art cho Tổ Đội / Hảo Hữu".
    ('gt_ic_todoi',  (1635, 207, 70, 51)),   # ba người  → ⚑ Tổ Đội
    ('gt_ic_haohuu', (  55,1128, 62, 58)),   # tim đỏ    → ♥ Hảo Hữu
    # ── ví tiền: ba ô thường trực trên HUD, cả ba đang là ký tự ◈ ✦ ♦ ──
    # ⚠ CẮT RUỘT, BỎ VÀNH. Ba món này trong tấm gốc là huy hiệu LỤC GIÁC có khung đồng sẵn,
    #   mà ô ví (`.vi-o`) đã có khung viên thuốc của nó rồi — lồng hai khung vào nhau thì đọc
    #   ra một cái huy hiệu dán đè lên một cái nút. Toạ độ ruột đo bằng máy (hộp bao vùng
    #   sáng, chừa 12px vành), không chấm tay.
    ('gt_xu_vang',   (1621,1654, 68, 78)),   # xu vàng  → ◈ Lumen
    ('gt_xu_bac',    (1750,1655, 68, 77)),   # xu bạc   → ✦ Ấn Giao Kết
    ('gt_ngoc_lam',  (1880,1654, 66, 78)),   # ngọc lam → ♦ Shard
    # ── Menu Hệ Thống (F6): bốn nút, cả bốn đang là ký tự ──
    ('gt_ic_caidat', (1541,  87, 70, 70)),   # bánh răng → ⚙ Cài Đặt
    ('gt_ic_laban',  (1839,  88, 72, 72)),   # hoa gió   → ⏱ Sự Kiện
    ('gt_ic_ruong',  (1835, 200, 70, 61)),   # rương     → ◈ Ngân Hàng Ngọc
    ('gt_ic_tui',    (1230, 115,109,108)),   # túi tiền  → ✋ Lệnh Nhặt (nút này CÓ SẴN khung
                                             #   vuông trong tấm gốc — giữ, vì bốn nút F6 vốn
                                             #   là ô vuông lớn, không phải icon trần)
    # ── khung bảng, 9 lát ──
    ('gt_khung_bang',( 728, 280,714,626)),
]

# Mấy món cắt NGUYÊN KHUNG (không fit-square vào ô vuông) — khung 9 lát phải giữ đúng tỉ lệ
# và đúng số điểm ảnh, ép vào ô 64×64 là mất sạch góc.
NGUYEN = {'gt_khung_bang'}

# ─────────────────────────────────────────────────────────────────────────────────────────
# ĐÃ ĐO, CHƯA DÙNG — chủ dự án chốt món nào thì dời dòng đó lên BANG rồi chạy lại. Để sẵn ở
# đây vì việc tốn công nhất là ĐO toạ độ, và nó đã làm xong.
# ⚠ Đừng cắt hết một lượt rồi mới đi tìm chỗ dùng: tài sản không ai tham chiếu là tài sản
#   chết, mà kiểu chết đó im lặng — `test_isoneo` từng phải dựng hẳn hai tầng vì chuyện này.
CHO_DUYET = [
    # ── icon, thay cho ký tự đang dùng trên thanh dưới ──
    ('gt_ic_sach',     (1642,  92, 67, 60)),   # sách        → Kỹ Năng
    ('gt_ic_bando',    (1740,  89, 66, 63)),   # cuộn bản đồ → Bản Đồ
    ('gt_ic_but',      (1944,  85, 56, 76)),   # bút lông    → (chưa có chỗ)
    ('gt_ic_nguoi',    (1546, 200, 58, 59)),   # một người   → Nhân Vật
    ('gt_ic_vuongmien',(1735, 199, 68, 59)),   # vương miện  → (chưa có chỗ)
    # ('gt_ic_cup',    (1933, 200, 66, 62)),   # ⚠ CÚP: ĐỪNG CẮT. Game không có bảng xếp hạng
                                               #   và CLAUDE.md cấm dựng nút cho thứ chưa có.
    # ── nút ──
    ('gt_nut_v',       (1624,1223, 84, 85)),   # ✓ xanh
    ('gt_nut_x',       (1753,1223, 84, 85)),   # ✗ đỏ
    # ── khung (9 lát) ──
    # ⚠ Cạnh ĐỀU (đo: lệch 0,24–4,65 trên 40px khi lấy mẫu TRÁNH hoạ tiết giữa) ⇒ 9 lát chạy
    #   được. Nhưng viên kim cương giữa cạnh trên thì KHÔNG kéo giãn được — phải cắt rời ra
    #   thành một phần tử riêng, nếu không nó bè ra theo bề ngang bảng.
    ('gt_chandung',    (  52,  52,642,216)),   # vòng chân dung + 3 thanh
    ('gt_thanh_truot', (1606, 980,356, 58)),   # rãnh trượt + núm kim cương
    ('gt_bang_xanh',   (1601,1340,400, 67)),   # biển tên xanh
    ('gt_bang_do',     (1600,1433,402, 68)),   # biển tên đỏ
]
# ─────────────────────────────────────────────────────────────────────────────────────────


# ── KHUNG 9 LÁT ──────────────────────────────────────────────────────────────────────────
# Đo trước khi cắt, không đoán:
#   · cạnh trên ở cột SẠCH bắt đầu ở y=40-41; góc thì cao hơn (y=26 ở x=0)
#   · góc hết hoa văn khoảng x≈90 (lệch so với cột mẫu x=180 tụt từ 47 xuống 3,4)
#   · giữa cạnh trên có một cụm hoạ tiết + VIÊN KIM CƯƠNG LAM (lõi lam x 336-377, y 17-65;
#     cả cụm vàng bọc ngoài rộng tới x≈300-420)
#   · rải rác còn hai cái ngạnh nhỏ ở x≈240 và đối xứng bên phải
#
# ⚠ `border-image` KÉO GIÃN lát giữa mỗi cạnh. Để nguyên viên kim cương trong lát ấy là nó bè
#   ra theo bề ngang bảng — một viên ngọc hình thoi thành một vệt lam. Nên phải TẨY cạnh cho
#   sạch rồi trả viên ngọc về bằng một phần tử riêng canh giữa.
#   Tẩy bằng cách lấy ĐÚNG MỘT CỘT sạch (x=180) kéo ngang: rail vốn gần như đều
#   (lệch 4,65 trên 40px · 10,54 trên 80px), mà `border-image` thì sẽ kéo giãn nó nữa — giữ
#   lại chút vân đó cũng không ai thấy, còn tẩy sạch thì bảo đảm không có hoạ tiết nào bị bè.
GOC = 100          # bề rộng góc giữ nguyên, mỗi bên
COT_SACH = 180     # cột dùng làm mẫu cho cạnh trên/dưới
HANG_SACH = 313    # hàng dùng làm mẫu cho cạnh trái/phải (giữa khung)


def nuong_khung(im, ra):
    """Tách khung thành HAI tệp: khung 9 lát đã tẩy cạnh, và viên ngọc giữa."""
    x0, y0, w, h = 728, 280, 714, 626
    f = im.crop((x0, y0, x0 + w, y0 + h)).copy()
    px = f.load()


    # tẩy cạnh TRÊN và DƯỚI: kéo ngang cột sạch
    for y in range(h):
        if y >= GOC and y < h - GOC:
            continue
        mau = px[COT_SACH, y]
        for x in range(GOC, w - GOC):
            px[x, y] = mau
    # tẩy cạnh TRÁI và PHẢI: kéo dọc hàng sạch
    for x in range(w):
        if x >= GOC and x < w - GOC:
            continue
        mau = px[x, HANG_SACH]
        for y in range(GOC, h - GOC):
            px[x, y] = mau

    # ⚠ VIÊN NGỌC GIỮA CẠNH TRÊN: ĐÃ CẮT RỒI GỠ ĐI. Tách được nó ra sạch (lấy bản GỐC trừ bản
    # đã tẩy ⇒ chỗ nào khung vốn có gì thì trong suốt), nhưng KHÔNG CÓ CHỖ ĐẶT: nền vẽ dưới
    # `border-image`, còn `::after` thì bị `overflow:auto` của `.panel` cắt — kể cả
    # `position:fixed`, vì `.panel` mang `transform` nên nó là khối chứa của cả con fixed.
    # Đo hẳn: nhét ô đỏ ở `top:-34px`, đếm điểm ảnh đỏ trên ảnh chụp ⇒ 0/64. Chi tiết ở
    # chú thích `.panel` trong `style.css`.
    # Đừng cắt lại: một tệp không ai tham chiếu là tài sản chết, và kiểu chết đó im lặng.
    p1 = os.path.abspath(os.path.join(ra, 'gt_khung_bang.webp'))
    f.save(p1, 'WEBP', quality=92, alpha_quality=100, method=6)
    n1 = os.path.getsize(p1)
    print(f'  {"gt_khung_bang":16s} {w:3d}x{h:<3d} → 9 lát, góc {GOC}px  {n1/1024:5.1f} KB')
    return n1


def quet(im):
    """In lại bảng mảnh rời — để đừng ai chấm toạ độ bằng mắt."""
    import numpy as np
    from collections import deque
    a = np.array(im.split()[3]); m = a > 24
    H, W = m.shape; seen = np.zeros_like(m, bool); ra = []
    for y0 in range(H):
        for x0 in range(W):
            if not m[y0, x0] or seen[y0, x0]:
                continue
            q = deque([(y0, x0)]); seen[y0, x0] = True
            x1 = x2 = x0; y1 = y2 = y0; n = 0
            while q:
                y, x = q.popleft(); n += 1
                x1 = min(x1, x); x2 = max(x2, x); y1 = min(y1, y); y2 = max(y2, y)
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        ny, nx = y + dy, x + dx
                        if 0 <= ny < H and 0 <= nx < W and m[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True; q.append((ny, nx))
            if n >= 400:
                ra.append((x1, y1, x2 - x1 + 1, y2 - y1 + 1, n))
    ra.sort(key=lambda t: (t[1] // 40, t[0]))
    for x, y, w, h, n in ra:
        print(f'({x:5d},{y:5d},{w:4d},{h:4d})   đặc={n}')
    print(f'— {len(ra)} mảnh')


def main():
    if not os.path.exists(NGUON):
        sys.exit(f'THIẾU TẤM GỐC: {NGUON}\n'
                 'Không có nó thì công cụ này không chạy lại được — đó là chủ ý: tấm gốc nằm '
                 'trong tools/ nên không tới tay người chơi, nhưng vẫn phải có mặt để nướng lại.')
    im = Image.open(NGUON).convert('RGBA')
    if '--quet' in sys.argv:
        quet(im); return
    os.makedirs(RA, exist_ok=True)
    tong = 0
    for ten, (x, y, w, h) in BANG:
        c = im.crop((x, y, x + w, y + h))
        if ten in NGUYEN:
            tong += nuong_khung(im, RA)   # khung đi đường riêng: tẩy cạnh + tách viên ngọc
            continue
        # FIT-SQUARE, không kéo giãn: ba icon này tỉ lệ rộng/cao lệch nhau tới 1,15 lần, ép
        # vuông là cái loa bè ra còn nốt nhạc thì gầy đi. Cùng luật đã ghi ở `nuong_ngoc.py`.
        k = O / max(w, h)
        c = c.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
        o = Image.new('RGBA', (O, O), (0, 0, 0, 0))
        o.alpha_composite(c, ((O - c.width) // 2, (O - c.height) // 2))
        p = os.path.abspath(os.path.join(RA, ten + '.webp'))
        # alpha_quality=100: mất mát ở kênh alpha hiện ra thành quầng xám quanh mọi mép —
        # bài học đã ghi ở dải khung màn chờ.
        o.save(p, 'WEBP', quality=92, alpha_quality=100, method=6)
        n = os.path.getsize(p); tong += n
        print(f'  {ten:16s} {w:3d}x{h:<3d} → {O}px   {n/1024:5.1f} KB')
    print(f'— {len(BANG)} tệp, {tong/1024:.1f} KB')


if __name__ == '__main__':
    main()
