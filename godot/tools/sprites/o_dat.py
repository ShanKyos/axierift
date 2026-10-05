"""Ô đất isometric 64×32 pixel art — cỏ (4 biến thể), đất mòn, đá lát thành, và nước.

    python3 godot/tools/sprites/o_dat.py      # → godot/assets/tiles/o_dat.png (dải ngang) + o_dat.json

Không khử răng cưa, bảng màu giới hạn, hạt nhiễu theo HẠT CỐ ĐỊNH để dựng lại ra đúng từng điểm.
Mép hình thoi theo luật 2:1 của pixel art (mỗi hàng lùi 2 điểm) để các ô ghép khít không hở.
"""
import json
import os
import random

from PIL import Image

W, H = 64, 32
RA = os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'tiles')

LOAI = {
    'co1': [(58, 102, 50), (72, 122, 58), (88, 140, 66), (104, 156, 74)],
    'co2': [(56, 98, 48), (70, 118, 56), (86, 136, 64), (120, 150, 70)],
    'co3': [(60, 104, 52), (74, 124, 60), (90, 142, 68), (150, 140, 70)],   # lốm đốm hoa vàng
    'co4': [(54, 94, 46), (66, 112, 54), (80, 130, 62), (98, 148, 70)],
    'dat': [(104, 78, 52), (122, 94, 62), (140, 110, 74), (160, 128, 88)],
    'da_lat': [(92, 90, 96), (112, 110, 116), (132, 130, 136), (70, 68, 76)],
    'nuoc': [(36, 70, 120), (44, 86, 140), (58, 104, 160), (120, 170, 210)],
}
TY_LE = {'co1': (.30, .40, .22, .08), 'co2': (.28, .42, .22, .08), 'co3': (.30, .40, .24, .06),
         'co4': (.34, .40, .20, .06), 'dat': (.25, .40, .25, .10), 'da_lat': (.20, .42, .30, .08),
         'nuoc': (.30, .40, .25, .05)}


def trong_thoi(x, y):
    """Điểm (x,y) có nằm trong hình thoi 64×32 theo luật mép 2:1 không."""
    cx, cy = W / 2, H / 2
    return abs(x + 0.5 - cx) / (W / 2) + abs(y + 0.5 - cy) / (H / 2) <= 1.0


def ve(ten, hat):
    r = random.Random(hat)
    pal, ty = LOAI[ten], TY_LE[ten]
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    px = im.load()
    for y in range(H):
        for x in range(W):
            if not trong_thoi(x, y):
                continue
            u = r.random()
            acc, i = 0, 0
            for i, t in enumerate(ty):
                acc += t
                if u <= acc:
                    break
            c = pal[i]
            if ten == 'da_lat':
                # mạch vữa: lưới hình thoi nhỏ 16×8 — tối hơn một bậc
                gx, gy = (x / 2 + y) % 16, (x / 2 - y) % 16
                if gx < 1.0 or gy < 1.0:
                    c = pal[3]
            if ten == 'nuoc' and (x + 3 * y) % 23 == 0:
                c = pal[3]
            px[x, y] = (*c, 255)
    return im


def main():
    os.makedirs(RA, exist_ok=True)
    ds = list(LOAI)
    bang = Image.new('RGBA', (W * len(ds), H), (0, 0, 0, 0))
    for i, ten in enumerate(ds):
        bang.paste(ve(ten, 1000 + i), (i * W, 0))
    bang.save(os.path.join(RA, 'o_dat.png'), optimize=True)
    with open(os.path.join(RA, 'o_dat.json'), 'w') as fp:
        json.dump({'o': [W, H], 'loai': ds, 'chan': ['nuoc']}, fp)
    print('ô đất:', ds)


if __name__ == '__main__':
    main()
