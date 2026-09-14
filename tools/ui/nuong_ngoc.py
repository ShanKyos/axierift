#!/usr/bin/env python3
"""Nướng icon SÁU loại ngọc cho Ngân Hàng Ngọc, từ art CHÍNH CHỦ Axie.

Nguồn: `axieinfinity/cc-axie-gtk2d` — `sprites/land-items/Materials/gem_cutter` (5 viên đã mài)
và `gemstone_mine` (5 khối quặng thô). Đây là Quy tắc số 3 làm đúng đường: tranh thật, tra bảng,
không `ctx.beginPath()`.

⚠ GHÉP THEO MÀU ĐÃ CÓ TRONG GAME, đừng bốc đại. `JEWEL_COLORS` trong game.js đã khai màu từng
loại ngọc từ lâu và màu đó chạy khắp nơi — nhãn đồ rơi, chấm trên đất, khung Lò. Icon lệch màu
với nhãn của chính nó thì người chơi phải học hai lần cho một thứ.

⚠ "Thạch" thì lấy QUẶNG THÔ, "châu" thì lấy VIÊN MÀI. Tu La Tinh Thạch / Hỗn Nguyên Thạch là đá,
không phải ngọc — dùng viên mài cho chúng là bốn loại đầu và hai loại sau đọc ra cùng một họ.
"""
import os, sys
from PIL import Image

KIT = '/home/user/axieinfinity/cc-axie-gtk2d/assets/axie-standard-assets/sprites/land-items/Materials'
RA  = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'game', 'assets', 'ui')
O   = 96          # icon nướng ở 96px, hiện ra 40-48px ⇒ còn dư cho màn 2×

# khoá trong KHO_NGOC_KEYS → (tệp nguồn, màu game đang dùng — chỉ để đối chiếu bằng mắt)
BANG = [
    ('chucPhuc',  'gem_cutter/gem_emerald.png',   '#7ec850'),
    ('linhHon',   'gem_cutter/gem_amethyst.png',  '#b08ae8'),
    ('sinhMenh',  'gem_cutter/gem_ruby.png',      '#e84a6a'),
    ('honDon',    'gem_cutter/gem_diamond.png',   '#7ecbff'),
    ('tuLa',      'gemstone_mine/ore_ruby.png',   '#ff9a4d'),
    ('honNguyen', 'gemstone_mine/ore_amethyst.png', '#c07fe0'),
]

def nuong(src, dst):
    im = Image.open(src).convert('RGBA')
    bb = im.getbbox()
    if not bb:
        raise SystemExit('tệp rỗng: ' + src)
    im = im.crop(bb)
    # ⚠ FIT VUÔNG, KHÔNG KÉO GIÃN. Năm viên có tỉ lệ rộng/cao khác nhau (kim cương 482×372,
    # hồng ngọc 410×490) — ép cả năm vào một ô vuông là viên bẹt viên dài, mà chúng đứng thành
    # một cột nên mắt đọc ra ngay.
    w, h = im.size
    s = (O - 8) / max(w, h)
    im = im.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)
    tam = Image.new('RGBA', (O, O), (0, 0, 0, 0))
    tam.paste(im, ((O - im.size[0]) // 2, (O - im.size[1]) // 2), im)
    # alpha_quality=100: mất mát ở kênh alpha hiện thành quầng xám quanh mép (xem CLAUDE.md
    # mục nướng dải lớp chờ).
    tam.save(dst, 'WEBP', quality=90, alpha_quality=100, method=6)
    return tam.size, os.path.getsize(dst)

def main():
    os.makedirs(RA, exist_ok=True)
    if not os.path.isdir(KIT):
        sys.exit('KHÔNG thấy kit Axie ở ' + KIT + ' — clone axieinfinity/cc-axie-gtk2d trước.')
    tong = 0
    for k, rel, mau in BANG:
        src = os.path.join(KIT, rel)
        dst = os.path.join(RA, 'ngoc_%s.webp' % k)
        co, by = nuong(src, dst)
        tong += by
        print('%-10s %-34s %s %5d B  (màu game %s)' % (k, rel, co, by, mau))
    print('tổng %d tệp, %.1f KB' % (len(BANG), tong / 1024))

if __name__ == '__main__':
    main()
