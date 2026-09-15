#!/usr/bin/env python3
"""Sinh VẬT CẢN cho công trình `vatTo` — bám theo CHÍNH HÌNH VẼ, không phải một hộp chép tay.

VÌ SAO CẦN: `MAP_OBSTACLES.ardhaven` là 16 khối 460×340 — đó là cỡ Ô ĐẤT của khối nhà, không
phải cỡ hình nhà. Sprite thì cao hơn hẳn (quán trọ 512×510), nên cả phần thân trên và mái nằm
NGOÀI hộp chặn. Đo được: nửa dưới mỗi căn chặn 95-100%, nhưng tính cả hình thì 12-35% diện tích
vẫn đi được — và toàn bộ chỗ đó nằm ở dải phía BẮC, đúng hướng người chơi đi tới.

Ảnh chụp cho thấy hậu quả: đứng ở (3900,430) trong lòng Quán Trọ thì nhân vật BIẾN MẤT hoàn
toàn sau mái. Với người chơi đó là "chạy xuyên qua nhà".

CÁCH LÀM — DẢI NGANG × ĐOẠN CỘT LIỀN NHAU, không phải một hộp bao:
  Một hộp bao quanh sprite isometric thì bốn góc là magenta trong suốt — chặn ở đó là dựng
  tường vô hình, đúng cái lỗi NGƯỢC với lỗi đang chữa ("thứ MẮT THẤY phải là thứ GAME THỰC
  THI"). Nên cắt sprite thành N dải ngang; trong mỗi dải lấy từng ĐOẠN CỘT LIỀN NHAU có điểm
  ảnh đặc, mỗi đoạn một hộp.

  ⚠ PHẢI LÀ ĐOẠN, KHÔNG PHẢI min..max. Bản đầu lấy cột trái nhất tới cột phải nhất của mỗi
  dải, và nó BỊT MỌI LỖ THỦNG GIỮA HÌNH — với cổng thành là bịt đúng cái vòm đi xuyên qua,
  tức khoá cả bốn cửa ra vào thành. Vì thế bản đầu phải khai ngoại lệ bỏ qua `ct_cong`, mà một
  ngoại lệ chép tay thì công trình có vòm nào sau này cũng phải nhớ mà thêm vào. Lấy theo ĐOẠN
  thì cái vòm tự ở lại: dải cắt ngang vòm cho hai đoạn (chân trái, chân phải), khoảng giữa vẫn
  đi được, và không còn ngoại lệ nào để mà quên.

Chạy:  python3 tools/iso/can_vatto.py [số-dải]
Ghi ra public/game/data/vatcan.js — MỘT tệp đích duy nhất, đúng tệp mà index.html nạp.
"""
import glob, os, sys

import numpy as np
from PIL import Image

RA = 'public/game/assets/iso'
DICH = 'public/game/data/vatcan.js'
BO_QUA = set()             # không còn ngoại lệ — phép ĐOẠN CỘT tự giữ được vòm cổng
NGUONG_A = 24              # alpha dưới mức này coi như trong suốt
TOI_THIEU = 0.04           # dải nào đặc chưa tới 4% bề ngang thì bỏ — cột cờ, chong chóng


def _doan(co):
    """Các đoạn cột liền nhau đang bật, trả [(x0, x1)] với x1 là mép ngoài."""
    d, dau = [], None
    for x, v in enumerate(co):
        if v and dau is None:
            dau = x
        elif not v and dau is not None:
            d.append((dau, x)); dau = None
    if dau is not None:
        d.append((dau, len(co)))
    return d


def dai_cua(duong, n):
    a = np.asarray(Image.open(duong).convert('RGBA'))[..., 3] > NGUONG_A
    H, W = a.shape
    ra, truoc = [], {}
    for i in range(n):
        y0, y1 = H * i // n, H * (i + 1) // n
        moi = {}
        for x0, x1 in _doan(a[y0:y1].any(axis=0)):
            if x1 - x0 < TOI_THIEU * W:
                continue                      # cột cờ, chong chóng, dây phơi
            cu = truoc.get((x0, x1))          # dải trước có ĐÚNG đoạn này thì kéo dài hộp cũ
            if cu is not None:
                cu[3] = y1 - cu[1]
                moi[(x0, x1)] = cu
                continue
            hop = [x0, y0, x1 - x0, y1 - y0]
            ra.append(hop)
            moi[(x0, x1)] = hop
        truoc = moi
    return ra, W, H


def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 6
    bang = {}
    for duong in sorted(glob.glob(os.path.join(RA, 'ct_*.png'))):
        ten = os.path.splitext(os.path.basename(duong))[0]
        if ten in BO_QUA:
            print('  %-14s BỎ QUA (có vòm đi xuyên)' % ten)
            continue
        d, W, H = dai_cua(duong, n)
        phu = sum(b[2] * b[3] for b in d) / (W * H)
        bang[ten] = d
        print('  %-14s %3dx%-3d → %d hộp, phủ %.0f%% khung' % (ten, W, H, len(d), 100 * phu))
    with open(DICH, 'w', encoding='utf-8') as f:
        f.write('// SINH TU DONG boi tools/iso/can_vatto.py — DUNG SUA TAY.\n'
                '// Vat can cua tung cong trinh `vatTo`, toa do CUC BO trong khung sprite:\n'
                '//   [x, y, rong, cao] — cong them v.x / v.y de ra toa do the gioi.\n'
                '// Cat theo DAI NGANG bam sat bong ve, khong phai hop bao — goc hop bao la\n'
                '// mang trong suot, chan o do la dung tuong vo hinh.\n'
                'window.VAT_CAN = {\n')
        for k in sorted(bang):
            f.write('  %s: [%s],\n' % (k, ', '.join('[%d,%d,%d,%d]' % tuple(b) for b in bang[k])))
        f.write('};\n')
    print('→ %s (%d công trình)' % (DICH, len(bang)))


if __name__ == '__main__':
    main()
