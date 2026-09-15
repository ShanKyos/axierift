#!/usr/bin/env python3
"""Cắt nền cho tranh Meowa gen ra — bỏ nền phẳng, bỏ hoa văn chấm, bỏ watermark.

    python3 tools/cat_nen.py <ảnh vào> <ảnh ra> [--cao N] [--sai N] [--xem]

⚠ VÌ SAO KHÔNG CHỈ FLOOD-FILL TỪ GÓC. Tranh Meowa xuất ra trên một nền tối có HOA VĂN
CHẤM (dấu cộng nhạt rải đều) và một WATERMARK ở góc dưới-phải. Flood-fill chỉ ăn được
vùng liền mạch cùng màu: mấy cái chấm sáng hơn nền nên nó chừa lại một bãi lấm tấm, còn
watermark thì nằm lọt trong nền nên cũng ở lại. Ảnh trông "đã tách nền" cho tới lúc đặt
lên map sáng — rồi cả đám chấm hiện ra.

Nên làm ba bước, và thiếu bước nào cũng hỏng:
  1. TOẢ TỪ BỐN GÓC theo dung sai màu → xoá nền phẳng.
  2. XOÁ THEO BẢNG MÀU NỀN: pixel nào gần màu nền HOẶC màu chấm thì xoá, kể cả khi
     không liền mạch với góc. Đây là bước ăn mấy cái chấm.
  3. GIỮ ĐÚNG MẢNG LỚN NHẤT: mọi mảng đặc còn lại mà rời khỏi nhân vật đều bị bỏ —
     watermark chết ở đây, và cả mấy vệt lẻ mà bước 2 chừa lại.
Sau đó cắt sát hộp bao và (tuỳ chọn) thu về chiều cao cần dùng.

Giữ nguyên tỉ lệ khi thu: NPC trong game đo HỘP ALPHA rồi neo đáy (xem npcHop() trong
game.js), nên ép vào khung cố định là thừa — cứ đưa đúng chiều cao là được.
"""
import sys, collections
from PIL import Image
import numpy as np


def cat_nen(vao, ra, cao=None, sai=38, xem=None):
    im = Image.open(vao).convert('RGBA')
    a = np.array(im).astype(np.int16)
    h, w = a.shape[:2]
    rgb = a[:, :, :3]

    # ── 1. màu nền = màu hay gặp nhất ở vành 6px quanh mép ────────────────────
    vien = np.concatenate([rgb[:6].reshape(-1, 3), rgb[-6:].reshape(-1, 3),
                           rgb[:, :6].reshape(-1, 3), rgb[:, -6:].reshape(-1, 3)])
    dem = collections.Counter(map(tuple, vien))
    nen = np.array(dem.most_common(1)[0][0])

    # Màu CHẤM: màu hay gặp thứ nhì ở vành, miễn là còn gần nền (chấm là hoa văn của
    # chính nền, không phải một vật thể). Xa quá thì coi như vành có lẫn nhân vật.
    cham = None
    for c, _ in dem.most_common(8)[1:]:
        d = np.abs(np.array(c) - nen).sum()
        if 10 < d < 190:
            cham = np.array(c)
            break

    def gan(mau, nguong):
        return np.abs(rgb - mau).sum(axis=2) <= nguong

    # ── 2. toả từ bốn góc ─────────────────────────────────────────────────────
    co_the = gan(nen, sai) | (gan(cham, sai) if cham is not None else False)
    tham = np.zeros((h, w), bool)
    q = collections.deque()
    for y, x in ((0, 0), (0, w-1), (h-1, 0), (h-1, w-1)):
        if co_the[y, x]:
            tham[y, x] = True
            q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y-1, x), (y+1, x), (y, x-1), (y, x+1)):
            if 0 <= ny < h and 0 <= nx < w and not tham[ny, nx] and co_the[ny, nx]:
                tham[ny, nx] = True
                q.append((ny, nx))

    # ── 3. xoá theo bảng màu nền, kể cả chỗ không liền mạch (mấy cái chấm) ─────
    xoa = tham | co_the
    a[:, :, 3] = np.where(xoa, 0, a[:, :, 3])

    # ── 4. giữ mảng đặc LỚN NHẤT — watermark và vệt lẻ chết ở đây ─────────────
    dac = a[:, :, 3] > 40
    nhan = np.zeros((h, w), np.int32)
    ma, to, cuc = 0, 0, 0
    for y0 in range(h):
        for x0 in range(w):
            if not dac[y0, x0] or nhan[y0, x0]:
                continue
            ma += 1
            n = 0
            q = collections.deque([(y0, x0)])
            nhan[y0, x0] = ma
            while q:
                y, x = q.popleft(); n += 1
                for ny, nx in ((y-1, x), (y+1, x), (y, x-1), (y, x+1),
                               (y-1, x-1), (y-1, x+1), (y+1, x-1), (y+1, x+1)):
                    if 0 <= ny < h and 0 <= nx < w and dac[ny, nx] and not nhan[ny, nx]:
                        nhan[ny, nx] = ma
                        q.append((ny, nx))
            if n > to:
                to, cuc = n, ma
    if cuc:
        a[:, :, 3] = np.where((nhan == cuc) | (~dac & (a[:, :, 3] > 0)) & (nhan == 0), a[:, :, 3], 0)
        a[:, :, 3] = np.where(nhan == cuc, a[:, :, 3], 0)

    out = Image.fromarray(a.astype(np.uint8), 'RGBA')
    bb = out.getbbox()
    if bb:
        out = out.crop(bb)
    if cao:
        r = cao / out.height
        out = out.resize((max(1, round(out.width * r)), cao), Image.LANCZOS)
    out.save(ra)

    trong = int((np.array(out)[:, :, 3] < 8).sum())
    tong = out.width * out.height
    print(f'{vao} → {ra}')
    print(f'  nền {tuple(nen)}' + (f' · chấm {tuple(cham)}' if cham is not None else ' · không thấy hoa văn chấm'))
    print(f'  ra {out.width}×{out.height} · trong suốt {100*trong/tong:.0f}% · mảng giữ lại {to} điểm')
    if xem:
        # dán lên hai nền tương phản để soi viền còn sót không
        k = Image.new('RGBA', (out.width*2 + 24, out.height), (0, 0, 0, 0))
        for i, bg in enumerate([(236, 238, 225, 255), (18, 21, 13, 255)]):
            o = Image.new('RGBA', out.size, bg)
            o.alpha_composite(out)
            k.paste(o, (i * (out.width + 24), 0))
        k.convert('RGB').save(xem)
        print(f'  ảnh soi viền: {xem}')
    return out


if __name__ == '__main__':
    av = sys.argv[1:]
    if len(av) < 2:
        print(__doc__); sys.exit(1)
    cao = int(av[av.index('--cao') + 1]) if '--cao' in av else None
    sai = int(av[av.index('--sai') + 1]) if '--sai' in av else 38
    xem = av[av.index('--xem') + 1] if '--xem' in av else None
    cat_nen(av[0], av[1], cao, sai, xem)
