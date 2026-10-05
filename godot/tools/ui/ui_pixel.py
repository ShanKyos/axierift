"""Pixel hoá art giao diện của bản web Axie Rift (bộ UI gothic + icon menu + icon chiêu) cho HUD Godot.

    python3 godot/tools/ui/ui_pixel.py      # → godot/assets/ui/*.png

HUD bản Godot vẽ ở màn nội bộ 640×360 (phóng nguyên lần), tức đúng NỬA bản web ở 1280×720. Nên
mỗi món thu về cỡ nó hiện ra trên bản web chia đôi, rồi đi qua cùng hậu kỳ của mọi sprite khác:
tắt khử răng cưa, bảng màu giới hạn, (icon) viền tối 1 px. Lấy art của bản web chứ không vẽ mới:
hai bản cùng một bộ mặt, người chơi chuyển qua không thấy lạ.

⚠ Thu nhỏ trên ảnh NHÂN SẴN ALPHA, không thì mép trong suốt kéo màu đen vào thành quầng xám.
⚠ ICON MENU KHÔNG LẤY TỪ ĐÂY. Đã thử: icon 128 px của bản web thu về 16 px thì nhoè thành một vết
màu, không đọc ra là cái túi hay tấm bản đồ. Icon nhỏ phải dựng cho cỡ nhỏ ⇒ `tools/sprites/icon_do.py`.
⚠ Thanh máu/mana KHÔNG viền và giữ nhiều màu hơn: nó là dải chuyển sắc, lượng tử thô là ra sọc.
"""
import os

import numpy as np
from PIL import Image

GOC = os.path.join(os.path.dirname(__file__), '..', '..', '..')
WEB = os.path.join(GOC, 'public', 'game', 'assets')
RA = os.path.join(GOC, 'godot', 'assets', 'ui')
VIEN = (22, 18, 28, 255)

# tên ra: (tệp nguồn, rộng, cao, số màu, viền?)
MON = {
    'thanh_hp': ('ui/gt_thanh_hp.webp', 86, 12, 40, False),
    'thanh_hp_rong': ('ui/gt_thanh_hp_rong.webp', 86, 12, 40, False),
    'thanh_mp': ('ui/gt_thanh_mp.webp', 86, 8, 40, False),
    'thanh_mp_rong': ('ui/gt_thanh_mp_rong.webp', 86, 8, 40, False),
    'xu_vang': ('ui/gt_xu_vang.webp', 10, 10, 10, True),
    'khung_bang': ('ui/gt_khung_bang.webp', 178, 156, 32, False),
}


def thu_nho(im, w, h):
    a = np.array(im.convert('RGBA')).astype(np.float32) / 255.0
    a[..., :3] *= a[..., 3:4]
    p = Image.fromarray((a * 255).astype(np.uint8), 'RGBA').resize((w, h), Image.LANCZOS)
    b = np.array(p).astype(np.float32) / 255.0
    al = b[..., 3:4]
    b[..., :3] = np.where(al > 0.001, b[..., :3] / np.maximum(al, 0.001), 0)
    return (np.clip(b, 0, 1) * 255).astype(np.uint8)


def vien(a):
    dac = a[..., 3] > 0
    ke = np.zeros_like(dac)
    ke[1:] |= dac[:-1]
    ke[:-1] |= dac[1:]
    ke[:, 1:] |= dac[:, :-1]
    ke[:, :-1] |= dac[:, 1:]
    a[ke & ~dac] = VIEN
    return a


def main():
    os.makedirs(RA, exist_ok=True)
    for ten, (nguon, w, h, so_mau, co_vien) in MON.items():
        src = Image.open(os.path.join(WEB, nguon))
        pad = 1 if co_vien else 0
        f = thu_nho(src, w - 2 * pad, h - 2 * pad)
        al = f[..., 3] > 110
        q = np.array(Image.fromarray(f[..., :3], 'RGB').quantize(so_mau, method=Image.Quantize.MEDIANCUT).convert('RGB'))
        o = np.zeros((h, w, 4), np.uint8)
        o[pad:h - pad, pad:w - pad, :3] = q
        o[pad:h - pad, pad:w - pad, 3] = np.where(al, 255, 0)
        if co_vien:
            o = vien(o)
        Image.fromarray(o, 'RGBA').save(os.path.join(RA, ten + '.png'), optimize=True)
        print('%-16s %3d×%-3d ← %s' % (ten, w, h, nguon))


if __name__ == '__main__':
    main()
