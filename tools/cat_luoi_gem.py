#!/usr/bin/env python3
"""Cắt một TẤM LƯỚI do Gemini trả về thành từng sprite rời, nền magenta tách sạch.

Gemini trả một ảnh đặc, nhiều món xếp lưới. Ba đường ống của dự án đều cần từng tấm rời:
  · vật nhỏ isometric  → assets/iso/ + bảng ISO_NEO
  · vũ khí             → tools/chuanhoavk.py (tự xoay/cắt/thu về 172px)
  · icon tiêu hao      → assets/ui/

⚠ CẮT THEO LƯỚI CỐ ĐỊNH, KHÔNG THEO VIỀN NỘI DUNG — cùng bài học của cat_icon_ui.py: vài món
thò ra ngoài ô của nó, nên cắt theo hộp bao nội dung ra N tấm lệch khuôn nhau. Cắt lưới trước,
tách nền sau, rồi mới cắt sát TỪNG tấm.

⚠ TÁCH NỀN THEO SẮC TÍM, KHÔNG THEO NGƯỠNG SÁNG — cùng bài học của cat_congtrinh.py: Gemini vẽ
bóng đổ bằng magenta SẪM, nên lọc `R>160 & G<110 & B>160` để lại một vũng tím dưới chân vật.
Đo sắc tím `(R+B)/2 − G`: nền ra ~210, vật liệu ra 20-24. Ngưỡng 120 nằm giữa khoảng trống đó.

⚠ BẢNG NEO GHI THẲNG VÀO public/game/data/iso.js QUA `ghi_neo()` CỦA nuong_tile.py — KHÔNG chép
lại phép ghi ở đây. Bước "rồi chép sang…" đã bị quên đúng một lần và cái giá là sáu map không
vẽ một cái cây nào, im lặng tuyệt đối.

Chạy:
  python3 tools/cat_luoi_gem.py <tấm.png> <cột> <hàng> --ra <thư-mục> --ten a,b,c[,...]
  python3 tools/cat_luoi_gem.py gem_vatnho.png 4 3 --ra public/game/assets/iso --ten ... --neo
"""
import argparse, os, sys

import numpy as np
from PIL import Image

NGUONG_TIM = 120        # xem ghi chú ① ở đầu tệp
DOM_TOI_THIEU = 0.0002  # mảnh nhỏ hơn 0,02% ô thì vứt (ngôi sao lấp lánh Gemini hay chèn)


def _lay_ghi_neo():
    """Mượn ĐÚNG hàm ghi_neo của nuong_tile.py — một tệp đích duy nhất, một phép ghi duy nhất.

    Chỉ exec phần thân hàm chứ không exec cả tệp: cả tệp `import bpy`, mà cắt ảnh thì không cần
    Blender và không đáng bắt người dùng chờ nó nạp.
    """
    duong = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'iso', 'nuong_tile.py')
    src = open(duong, encoding='utf-8').read()
    i = src.index('def ghi_neo(')
    j = src.index('\ndef ', i + 1)
    ns = {'__name__': 'nuong_tile', '__file__': duong, 'os': os, 'json': __import__('json')}
    exec(compile(src[i:j], 'nuong_tile.py:ghi_neo', 'exec'), ns)
    return ns['ghi_neo']


def _bo_dom(a):
    """Vứt mảnh rời cỡ nhỏ. Giữ MỌI mảnh còn lại — giữ một mảnh to nhất là sai: cái đe, đống
    than, khúc gỗ của một công trình đều là mảnh riêng."""
    try:
        from scipy import ndimage
    except ImportError:
        return a
    lab, _ = ndimage.label(a)
    dem = np.bincount(lab.ravel())
    dem[0] = 0
    nho = max(1, int(DOM_TOI_THIEU * a.size))
    return np.isin(lab, np.where(dem >= nho)[0])


def _neo_chan(mask):
    """Điểm CHẠM ĐẤT của sprite, đo chứ không đoán.

    Vệt bóng tiếp đất là một hình ê-líp; tâm nó — không phải mép dưới của nó — mới là chỗ vật
    đứng. Nên quét 25% dưới cùng tìm hàng RỘNG NHẤT: đó là trục lớn của ê-líp.
    Món không có bóng thì hàng rộng nhất rơi về sát đáy, và kết quả vẫn đúng.
    """
    ys, xs = np.nonzero(mask)
    y0, y1 = ys.min(), ys.max()
    day = max(y0, int(y1 - (y1 - y0) * 0.25))
    rong = mask[day:y1 + 1].sum(axis=1)
    y = day + int(np.argmax(rong))
    cot = np.nonzero(mask[y])[0]
    return int((cot.min() + cot.max()) // 2), int(y)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('tam')
    p.add_argument('cot', type=int)
    p.add_argument('hang', type=int)
    p.add_argument('--ra', default='/tmp/gem')
    p.add_argument('--ten', required=True, help='tên từng ô, phân tách bằng dấu phẩy, đọc trái→phải, trên→dưới')
    p.add_argument('--neo', action='store_true', help='ghi toạ độ CHÂN vào public/game/data/iso.js')
    p.add_argument('--nguong', type=int, default=NGUONG_TIM)
    a = p.parse_args()

    ten = [t.strip() for t in a.ten.split(',') if t.strip()]
    if len(ten) != a.cot * a.hang:
        sys.exit('--ten có %d tên nhưng lưới %dx%d cần %d' % (len(ten), a.cot, a.hang, a.cot * a.hang))

    im = np.asarray(Image.open(a.tam).convert('RGB')).astype(float)
    H, W = im.shape[:2]
    cw, ch = W // a.cot, H // a.hang
    os.makedirs(a.ra, exist_ok=True)
    neo = {}
    for i, t in enumerate(ten):
        r, c = divmod(i, a.cot)
        o = im[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw]
        R, G, B = o[:, :, 0], o[:, :, 1], o[:, :, 2]
        vat = _bo_dom(((R + B) / 2 - G) <= a.nguong)
        if not vat.any():
            print('  %-14s Ô TRỐNG — bỏ' % t)
            continue
        ys, xs = np.nonzero(vat)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        cat = vat[y0:y1, x0:x1]
        out = np.zeros((y1 - y0, x1 - x0, 4), np.uint8)
        out[..., :3] = o[y0:y1, x0:x1].astype(np.uint8)
        out[..., 3] = cat * 255
        Image.fromarray(out).save(os.path.join(a.ra, t + '.png'))
        nx, ny = _neo_chan(cat)
        neo[t] = [nx, ny]
        print('  %-14s %dx%d  chân (%d,%d)  đặc %.0f%%'
              % (t, x1 - x0, y1 - y0, nx, ny, 100 * cat.mean()))

    if a.neo and neo:
        _lay_ghi_neo()(a.ra, neo)
    elif neo:
        print('\n(chưa ghi ISO_NEO — thêm --neo nếu đây là vật thể isometric trong map)')


if __name__ == '__main__':
    main()
