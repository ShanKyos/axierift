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
# BẢNG HAI — phải trùng `NV_MOC2`/`HS_FRAMES` trong game.js.
# ⚠ Khối `f` (BAY) là PHẦN MỞ RỘNG của đường tấm liền, KHÔNG có trong `KHUNG2` của
#   `nuong_nv.py`: gói Spine không có hoạt cảnh bay. Bộ nào có nó thì khai trong
#   `NV_BO_CO_BAY` bên game.js — hỏi bảng ấy, đừng hỏi chỉ số ô có rỗng không.
MOC2     = {'h': 0, 'p': 8, 's': 20, 'd': 36, 'j': 46, 'q': 56, 'n': 62, 't': 68,
            'e': 74, 'f': 84, 'g': 96}
SO2      = {'h': 8, 'p': 12, 's': 16, 'd': 10, 'j': 10, 'q': 6, 'n': 6, 't': 6,
            'e': 10, 'f': 8, 'g': 8}
# ⚠ 'g' (BAY + ĐÁNH) rơi sang HÀNG THỨ BẢY: hàng sáu chỉ còn 4 ô trống (92-95), không đủ
#   cho 8 khung. Phần vẽ tính hàng bằng `k // NV_COT` nên bảng cao thêm là chạy ngay —
#   không có hằng "6 hàng" nào trong game.js. Bảng cao bao nhiêu thì SUY từ moc lớn nhất.
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


def ghim_nua_duoi(imgs, cat, fea):
    """⚠ GHIM NỬA DƯỚI VỀ KHUNG ĐẦU — sinh ra cho khối BAY, và nó là một PHÉP ĐO.

    Gói bay v1 cho nhân vật SẢI CHÂN giữa không trung: bề ngang hông đi 73→98 px
    (34%) qua 8 khung, trong khi chiều cao chân đứng yên (132-140) — tức không
    phải phóng to thu nhỏ, mà là bước chân. Chủ dự án nhìn ra ngay: *"thân người
    chuyển động quá nhiều, chỉ cần cho cánh chuyển động thôi"*.

    Cắt ngang ở `cat` rồi lấy nửa dưới của khung ĐẦU đắp cho mọi khung. Đo trên
    gói v1: điểm ảnh đổi ở nửa dưới 9.837 → 2.133 mỗi khung (−78%).

    ⚠ `cat` PHẢI nằm DƯỚI tầm với của cánh, và tầm ấy đo được chứ đừng đoán: bề
      ngang theo hàng còn dao động 113 px ở y=220 rồi tụt còn 31 ở y=240, nên
      236 là chỗ cao nhất còn an toàn. Cắt cao hơn là XÉN VÀO CÁNH.
    ⚠ Phải có dải hoà `fea`, cắt cứng là một đường kẻ ngang chạy qua bụng.
    ⚠ ĐỪNG ghim theo BÓNG THÂN của khung đầu thay vì theo một đường ngang: đã
      thử, và vì thân mỗi khung một khác nên phần dư lòi ra thành một vương miện
      THỨ HAI trên đầu cùng mấy mảnh chi ma. Bản render dẹp không tách lớp được.
    """
    base = np.array(imgs[0]).astype(float)
    h = base.shape[0]
    w = np.zeros((h, 1, 1))
    w[cat:, 0, 0] = 1.0
    for k in range(fea):
        w[cat - fea + k, 0, 0] = k / float(fea)
    return [Image.fromarray((np.array(im).astype(float) * (1 - w) + base * w).astype('uint8'))
            for im in imgs]


def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(2)
    cfg = json.load(open(sys.argv[1], encoding='utf-8'))
    ra = cfg['ra']
    sheet = Image.new('RGBA', (COT * O_W, 6 * O_H), (0, 0, 0, 0))
    # ⚠ BẢNG HAI VẼ ĐÈ LÊN TỆP ĐANG CÓ, không dựng lại từ trắng. Nó giữ 9 khối cũ (trúng đòn,
    #   chết, ngồi, nói, nhảy múa…) mà đợt này không đụng tới; dựng lại từ trắng là xoá sạch
    #   chúng trong im lặng — đúng kiểu hỏng mà `ISO_NEO` đã ghi.
    ra2 = cfg.get('ra2')
    sheet2 = None
    if ra2:
        # Số hàng SUY từ khối nằm xa nhất, không chép cứng — thêm một khối ở hàng bảy thì bảng
        # tự cao thêm, và bảng đang có trên đĩa được CHÉP LÊN bảng mới chứ không bị vứt.
        can = max([MOC2[k] + SO2[k] for k, v in cfg['khoi'].items()
                   if v.get('bang') == 2] or [0])
        hang = max(6, -(-can // COT))
        sheet2 = Image.new('RGBA', (COT * O_W, hang * O_H), (0, 0, 0, 0))
        if os.path.exists(ra2):
            sheet2.alpha_composite(Image.open(ra2).convert('RGBA'), (0, 0))

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
        b2 = sp.get('bang') == 2
        tam = sheet2 if b2 else sheet
        if tam is None:
            raise SystemExit('khối %r khai bang:2 mà cfg thiếu "ra2"' % khoi)
        n = (SO2 if b2 else SO)[khoi]; moc = (MOC2 if b2 else MOC)[khoi]
        khung = sp['khung']                       # danh sách ref, sẽ kéo giãn cho đủ n
        lat = sp.get('lat', False)
        srcs = [khung[int(i * len(khung) / n)] for i in range(n)]
        if sp.get('neo') == 'o':
            imgs = [lay_o(x) for x in srcs]
            if sp.get('ghim_duoi'):
                imgs = ghim_nua_duoi(imgs, sp['ghim_duoi'], sp.get('ghim_hoa', 14))
            for i, o in enumerate(imgs):
                dat_o(tam, moc + i, o, sp['cao_goc'], sp['nen'], lat)
            continue
        for i in range(n):
            src = srcs[i]
            nh = 0.0
            if sp.get('nhun'):
                nh = -NHUN_BIEN * abs(np.sin(np.pi * 2 * i / n))
            dat(tam, moc + i, lay(src), nh, lat)

    os.makedirs(os.path.dirname(ra), exist_ok=True)
    sheet.save(ra, quality=94, alpha_quality=100, method=6)
    print('NƯỚNG XONG: %s  %s' % (ra, sheet.size))
    if sheet2 is not None:
        sheet2.save(ra2, quality=94, alpha_quality=100, method=6)
        print('NƯỚNG XONG: %s  %s' % (ra2, sheet2.size))

    # ── TỰ KIỂM ngay tại chỗ: đúng hợp đồng chưa ───────────────────────────────
    a = np.array(Image.open(ra).convert('RGBA'))[..., 3] > 16
    a2 = np.array(Image.open(ra2).convert('RGBA'))[..., 3] > 16 if ra2 else None
    xau = 0
    # ⚠ Khối neo theo Ô giữ nguyên chuyển động của bản vẽ gốc — kể cả cú lao người nhấc chân
    #   khỏi đất. Ở đó "bàn chân lệch" là THỨ PHẢI CÓ, không phải lỗi; vẫn IN ra để đọc được,
    #   nhưng không tính vào số lỗi. Khối thu theo hộp bao thì lệch chân vẫn là lỗi như cũ.
    neoO = {k for k, v in cfg['khoi'].items() if v.get('neo') == 'o'}
    cham = list(cfg['khoi'].keys())
    for khoi in [k for k in SO if k in cham] + [k for k in SO2 if k in cham]:
        b2 = cfg['khoi'][khoi].get('bang') == 2
        A = a2 if b2 else a
        SOx, MOCx = (SO2, MOC2) if b2 else (SO, MOC)
        ds, cs, ts = [], [], []
        for i in range(SOx[khoi]):
            k = MOCx[khoi] + i
            s = A[(k // COT) * O_H:(k // COT) * O_H + O_H, (k % COT) * O_W:(k % COT) * O_W + O_W]
            if not s.any():
                print('  ⚠ ô %d (%s) RỖNG' % (k, khoi)); xau += 1; continue
            ys, xs = np.where(s)
            ds.append(ys.max()); cs.append(ys.max() - ys.min() + 1); ts.append((xs.min() + xs.max()) / 2)
        print('  %-2s%s: chân %d..%d · cao %d..%d · tâm %.0f..%.0f'
              % (khoi, '(b2)' if b2 else '', min(ds), max(ds), min(cs), max(cs), min(ts), max(ts)))
        if max(ds) - min(ds) > 3:
            if khoi in neoO:
                print('     · bàn chân lệch %d px — neo theo ô, đây là cú lao người của bản vẽ gốc'
                      % (max(ds) - min(ds)))
            else:
                print('     ⚠ bàn chân lệch %d px' % (max(ds) - min(ds))); xau += 1
    print('  => %s' % ('CÓ LỖI' if xau else 'ĐẠT hợp đồng'))


if __name__ == '__main__':
    main()
