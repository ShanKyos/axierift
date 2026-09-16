#!/usr/bin/env python3
"""Cắt nền MAGENTA phẳng cho tranh nhân vật (Meowa/Gemini) → PNG trong suốt.

    python3 tools/cat_magenta.py <ảnh vào> <ảnh ra> [--cao N] [--xem soi.png]

⚠ VÌ SAO KHÔNG DÙNG `tools/cat_nen.py` CHO MẤY TẤM NÀY. Tấm đó bóc nền theo TỪNG LỚP
màu lấy ở mép, và nó chạy BFS thuần Python trên toàn khung — với ảnh 2000×2000 (4 triệu
điểm) thì vừa chậm vừa ngốn RAM. Nền ở đây lại là chroma key phẳng đúng một sắc, tức bài
toán dễ hơn hẳn: không cần dò màu theo lớp, chỉ cần một phép so vector hoá.

Ba bước, thiếu bước nào cũng lộ:
  1. KEY THEO HỆ MÀU, KHÔNG THEO MỘT MÃ MÀU. Năm tấm Meowa xuất ra ba sắc hồng khác nhau
     (#FF00FF, #C0398C…) và có tấm còn phớt gradient. Nhưng nền nào cũng là "đỏ cao, lam
     cao, lục THẤP" trong khi cả năm nhân vật đều xanh lá / nâu / trắng / xám — không ai
     có mảng magenta. Nên cửa là `min(R,B) − G`, không phải khoảng cách tới một mã màu.
  2. KHỬ VIỀN HỒNG (despill). Nét viền đen của tranh nằm sát nền nên có một vành điểm
     PHA giữa đen và hồng. Bỏ qua bước này thì đặt lên map hiện ra một đường viền tím
     mảnh quanh cả nhân vật — chỉ thấy khi nhìn ảnh chụp, không thấy khi đọc mã.
  3. GIỮ MẢNG ĐẶC LỚN NHẤT. Mỗi tấm có một dấu lấp lánh 4 cánh ở góc dưới-phải (watermark
     của lò sinh ảnh) — nó rời hẳn nhân vật nên chết ở bước này. Chạy sau khi đã THU NHỎ
     để BFS không phải bò qua 4 triệu điểm.
"""
import sys, collections
from PIL import Image
import numpy as np


def _mang_lon_nhat(dac):
    h, w = dac.shape
    nhan = np.zeros((h, w), np.int32)
    ma = to = cuc = 0
    for y0 in range(h):
        for x0 in range(w):
            if not dac[y0, x0] or nhan[y0, x0]:
                continue
            ma += 1; n = 0
            q = collections.deque([(y0, x0)]); nhan[y0, x0] = ma
            while q:
                y, x = q.popleft(); n += 1
                for ny, nx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1),
                               (y-1,x-1),(y-1,x+1),(y+1,x-1),(y+1,x+1)):
                    if 0 <= ny < h and 0 <= nx < w and dac[ny, nx] and not nhan[ny, nx]:
                        nhan[ny, nx] = ma; q.append((ny, nx))
            if n > to: to, cuc = n, ma
    return cuc, to, nhan


def cat(vao, ra, cao=256, lam=512, xem=None):
    im = Image.open(vao).convert('RGB')
    a = np.array(im).astype(np.int16)
    R, G, B = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    hong = np.minimum(R, B) - G                 # >0 = ngả magenta

    # Ngưỡng lấy từ CHÍNH tấm ảnh: nền là mốt của vành mép, vật liệu nằm quanh 0.
    vanh = np.concatenate([hong[0], hong[-1], hong[:, 0], hong[:, -1]])
    nen = int(np.median(vanh))
    if nen < 40:
        print(f'  ⚠ mép không ra magenta (median {nen}) — tấm này có thể đã tách nền rồi')
    cao_nguong, thap = nen * 0.55, nen * 0.18   # trên = nền chắc chắn · dưới = vật chắc chắn
    al = np.clip((cao_nguong - hong) / max(1.0, cao_nguong - thap), 0, 1)

    # despill: kéo R,B về ngang G đúng phần magenta còn sót ở vành pha
    du = np.clip(hong, 0, None) * (al > 0)
    R2 = np.clip(R - du, 0, 255); B2 = np.clip(B - du, 0, 255)
    out = np.dstack([R2, G, B2, al * 255]).astype(np.uint8)
    img = Image.fromarray(out, 'RGBA')

    # thu nhỏ TRƯỚC khi dò mảng — BFS thuần Python không bò nổi 4 triệu điểm
    if img.height > lam:
        r = lam / img.height
        img = img.resize((max(1, round(img.width * r)), lam), Image.LANCZOS)

    b = np.array(img)
    cuc, to, nhan = _mang_lon_nhat(b[:, :, 3] > 60)
    if cuc:
        b[:, :, 3] = np.where(nhan == cuc, b[:, :, 3], 0)
    img = Image.fromarray(b, 'RGBA')
    bb = img.getbbox()
    if bb: img = img.crop(bb)
    if cao:
        r = cao / img.height
        img = img.resize((max(1, round(img.width * r)), cao), Image.LANCZOS)
    img.save(ra)
    print(f'{vao} → {ra}  nền±{nen} · ra {img.width}×{img.height} · thân {to} điểm')
    if xem:
        k = Image.new('RGBA', (img.width*2 + 24, img.height), (0, 0, 0, 0))
        for i, bg in enumerate([(236, 238, 225, 255), (18, 21, 13, 255)]):
            o = Image.new('RGBA', img.size, bg); o.alpha_composite(img)
            k.paste(o, (i * (img.width + 24), 0))
        k.convert('RGB').save(xem)
    return img


if __name__ == '__main__':
    av = sys.argv[1:]
    if len(av) < 2:
        print(__doc__); sys.exit(1)
    cat(av[0], av[1],
        int(av[av.index('--cao')+1]) if '--cao' in av else 256,
        512,
        av[av.index('--xem')+1] if '--xem' in av else None)
