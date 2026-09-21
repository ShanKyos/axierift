#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NƯỚNG BẢNG KHUNG THÂN TỪ ẢNH RENDER RỜI (không phải rig Spine).

Vì sao có tệp này, dù đã có `nuong_nv.py`: `nuong_nv.py` đọc rig Spine và cắt ra NĂM LỚP RỜI.
Art tới đây là ảnh ĐÃ DẸP — không tách lớp được — nên nó đi đường TẤM LIỀN (`nvBo`/`nvBang`),
tức không khai trong `NV_LOP_HOP`. Hai đường sống chung là chủ ý, xem chú thích ở `NV_LOP_HOP`.

HỢP ĐỒNG PHẢI GIỮ (đo trên `dwsm1.webp`, bộ tấm liền đang chạy):
  · ô 240×300, 16 cột · bảng một 6 hàng = 96 khung
  · thứ tự khối: 16 đứng · 32 đi · 16 đánh · 16 niệm · 16 chạy  (NV_MOC)
  · BÀN CHÂN ở y≈251 · thân cao ≈160 · tâm ngang ≈129

⚠ CHUẨN HOÁ LÀ BẮT BUỘC, không phải làm đẹp. Máy sinh art trả về mỗi khung một cỡ khác nhau —
  đo trên gói đi 8 hướng: nhún 11–39% giữa các khung, trong khi khối đi THẬT của game nhún
  3,1%. Không ép về một chiều cao thì nhân vật phình to thu nhỏ theo mỗi bước.

⚠ NHÚN CỘNG LẠI SAU, đừng giữ nhún gốc. Nhún gốc là nhiễu; nhún cộng lại đi đúng nhịp hai
  bước một vòng (xem NHUN_DI) nên nó là chuyển động, không phải nhiễu.
"""
import sys, os, json
from PIL import Image
import numpy as np

O_W, O_H, COT = 240, 300, 16
CHAN_Y   = 251          # y của BÀN CHÂN trong ô — đo trên dwsm1
CAO_THAN = 160          # chiều cao thân chuẩn
TAM_X    = 129          # tâm ngang
MOC      = {'i': 0, 'w': 16, 'a': 48, 'c': 64, 'r': 80}
SO       = {'i': 16, 'w': 32, 'a': 16, 'c': 16, 'r': 16}
# nhún hai bước một vòng, biên độ 3,1% — đúng bằng khối đi thật của game
NHUN_BIEN = 0.031


def doan(v, ml=4):
    out, s = [], None
    for i, x in enumerate(v):
        if x and s is None:
            s = i
        elif not x and s is not None:
            if i - s >= ml:
                out.append((s, i - 1))
            s = None
    if s is not None and len(v) - s >= ml:
        out.append((s, len(v) - 1))
    return out


def tach_luoi(path, hang, cot):
    """Cắt theo lưới ĐỀU rồi lấy hộp bao riêng từng ô."""
    im = Image.open(path).convert('RGBA')
    al = np.array(im)[..., 3] > 16
    H, W = al.shape
    ow, oh = W / cot, H / hang
    out = []
    for r in range(hang):
        row = []
        for c in range(cot):
            y0, y1 = int(round(r * oh)), int(round((r + 1) * oh))
            x0, x1 = int(round(c * ow)), int(round((c + 1) * ow))
            s = al[y0:y1, x0:x1]
            if not s.any():
                row.append(None); continue
            ys, xs = np.where(s)
            row.append(im.crop((x0 + xs.min(), y0 + ys.min(), x0 + xs.max() + 1, y0 + ys.max() + 1)))
        out.append(row)
    return out


def tach_o(path, hang, cot):
    """Cắt theo lưới đều nhưng GIỮ NGUYÊN Ô — không lấy hộp bao. Dùng cho `neo:'o'`."""
    im = Image.open(path).convert('RGBA')
    W, H = im.size
    ow, oh = W / cot, H / hang
    return [[im.crop((int(round(c * ow)), int(round(r * oh)),
                      int(round((c + 1) * ow)), int(round((r + 1) * oh))))
             for c in range(cot)] for r in range(hang)]


def tach_blob(path):
    """Cắt theo BLOB (dùng khi tấm không xếp trên lưới đều)."""
    im = Image.open(path).convert('RGBA')
    al = np.array(im)[..., 3] > 16
    H = al.shape[0]
    return [im.crop((x0, 0, x1 + 1, H)) for (x0, x1) in doan(al.any(axis=0))]


def dat(sheet, k, anh, nhun=0.0, lat=False):
    """Đặt MỘT khung vào ô k, chuẩn hoá cỡ + neo bàn chân + tâm ngang.

    Đường CŨ: thu theo HỘP BAO của chính khung. Đúng khi trong khung chỉ có cái thân
    (khối đi, khối đứng) — hộp bao chính là nhân vật.
    """
    if anh is None:
        return
    if lat:
        anh = anh.transpose(Image.FLIP_LEFT_RIGHT)
    h = max(1, int(round(CAO_THAN * (1 + nhun))))
    w = max(1, int(round(anh.width * h / anh.height)))
    anh = anh.resize((w, h), Image.LANCZOS)
    cx, cy = (k % COT) * O_W, (k // COT) * O_H
    sheet.alpha_composite(anh, (cx + TAM_X - w // 2, cy + CHAN_Y - h))


def dat_o(sheet, k, o, cao_goc, nen, lat=False):
    """Đặt một khung theo Ô NGUỒN, KHÔNG theo hộp bao của nó.

    ⚠ VÌ SAO PHẢI CÓ ĐƯỜNG THỨ HAI: khung nào có VŨ KHÍ thì hộp bao là (thân + cây gậy),
    mà cây gậy quét từ trên đầu xuống ngang hông nên hộp bao phình co theo nó. Đo trên gói
    tấn công 8 hướng, hàng 7: hộp bao cao 244..296 px (lệch 21%) trong khi nhân vật gần như
    không đổi cỡ. Thu theo hộp bao ở đây là nhân vật PHÌNH TO THU NHỎ theo cây gậy —
    nhân vật to lên đúng lúc hạ gậy xuống.

    Đường này lấy đúng hai con số ĐO MỘT LẦN trên khung đứng của chính hàng ấy:
      `cao_goc` — nhân vật cao bao nhiêu px trong ô nguồn
      `nen`     — bàn chân nằm ở dòng nào trong ô nguồn
    rồi áp CÙNG MỘT phép biến hình cho cả khối. Máy sinh art đặt nhân vật vào giữa ô theo
    một mốc cố định, nên giữ nguyên mốc ấy là giữ nguyên mọi chuyển động nó đã vẽ — kể cả
    cú nhún và cú lao người, thứ mà phép thu theo hộp bao sẽ san phẳng mất.
    """
    if o is None:
        return
    if lat:
        o = o.transpose(Image.FLIP_LEFT_RIGHT)
    tl = CAO_THAN / float(cao_goc)
    w = max(1, int(round(o.width * tl)))
    h = max(1, int(round(o.height * tl)))
    o = o.resize((w, h), Image.LANCZOS)
    cx, cy = (k % COT) * O_W, (k // COT) * O_H
    sheet.alpha_composite(o, (cx + TAM_X - int(round(w / 2)),
                              cy + CHAN_Y - int(round(nen * tl))))


def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(2)
    cfg = json.load(open(sys.argv[1], encoding='utf-8'))
    ra = cfg['ra']
    sheet = Image.new('RGBA', (COT * O_W, 6 * O_H), (0, 0, 0, 0))

    # ── nguồn ──────────────────────────────────────────────────────────────────
    ngd, ngo = {}, {}
    for ten, n in cfg['nguon'].items():
        if n.get('kieu') == 'blob':
            ngd[ten] = [tach_blob(n['tep'])]
        else:
            ngd[ten] = tach_luoi(n['tep'], n['hang'], n['cot'])
            ngo[ten] = tach_o(n['tep'], n['hang'], n['cot'])

    def lay(ref):
        return ngd[ref['nguon']][ref.get('hang', 0)][ref['khung']]

    def lay_o(ref):
        return ngo[ref['nguon']][ref.get('hang', 0)][ref['khung']]

    for khoi, sp in cfg['khoi'].items():
        n = SO[khoi]; moc = MOC[khoi]
        khung = sp['khung']                       # danh sách ref, sẽ kéo giãn cho đủ n
        lat = sp.get('lat', False)
        for i in range(n):
            src = khung[int(i * len(khung) / n)]
            if sp.get('neo') == 'o':
                dat_o(sheet, moc + i, lay_o(src), sp['cao_goc'], sp['nen'], lat)
                continue
            nh = 0.0
            if sp.get('nhun'):
                nh = -NHUN_BIEN * abs(np.sin(np.pi * 2 * i / n))
            dat(sheet, moc + i, lay(src), nh, lat)

    os.makedirs(os.path.dirname(ra), exist_ok=True)
    sheet.save(ra, quality=94, alpha_quality=100, method=6)
    print('NƯỚNG XONG: %s  %s' % (ra, sheet.size))

    # ── TỰ KIỂM ngay tại chỗ: đúng hợp đồng chưa ───────────────────────────────
    a = np.array(Image.open(ra).convert('RGBA'))[..., 3] > 16
    xau = 0
    # ⚠ Khối neo theo Ô giữ nguyên chuyển động của bản vẽ gốc — kể cả cú lao người nhấc chân
    #   khỏi đất. Ở đó "bàn chân lệch" là THỨ PHẢI CÓ, không phải lỗi; vẫn IN ra để đọc được,
    #   nhưng không tính vào số lỗi. Khối thu theo hộp bao thì lệch chân vẫn là lỗi như cũ.
    neoO = {k for k, v in cfg['khoi'].items() if v.get('neo') == 'o'}
    for khoi in SO:
        ds, cs, ts = [], [], []
        for i in range(SO[khoi]):
            k = MOC[khoi] + i
            s = a[(k // COT) * O_H:(k // COT) * O_H + O_H, (k % COT) * O_W:(k % COT) * O_W + O_W]
            if not s.any():
                print('  ⚠ ô %d (%s) RỖNG' % (k, khoi)); xau += 1; continue
            ys, xs = np.where(s)
            ds.append(ys.max()); cs.append(ys.max() - ys.min() + 1); ts.append((xs.min() + xs.max()) / 2)
        print('  %-2s: chân %d..%d · cao %d..%d · tâm %.0f..%.0f'
              % (khoi, min(ds), max(ds), min(cs), max(cs), min(ts), max(ts)))
        if max(ds) - min(ds) > 3:
            if khoi in neoO:
                print('     · bàn chân lệch %d px — neo theo ô, đây là cú lao người của bản vẽ gốc'
                      % (max(ds) - min(ds)))
            else:
                print('     ⚠ bàn chân lệch %d px' % (max(ds) - min(ds))); xau += 1
    print('  => %s' % ('CÓ LỖI' if xau else 'ĐẠT hợp đồng'))


if __name__ == '__main__':
    main()
