#!/usr/bin/env python3
"""Nướng hai khối PHẢN ỨNG cho 16 Axie avatar → assets/chimera/<id>_b.webp · <id>_h.webp.

    python3 tools/spine/nuong_chi_phanung.py [--kit <đường-kit>] [--chi <id>]

    <id>_b.webp   battle/get-buff        — GỒNG lên khi lớp nhân vật vật chất hoá bên cạnh
    <id>_h.webp   defense/hit-by-normal  — GIẬT khi ăn đòn

⚠ AXIE KHÔNG ĐÁNH, NÓ PHẢN ỨNG — và đó là cả lý do chọn hai hoạt cảnh này. Kit có sẵn 8 đòn
đánh gần + 5 đòn đánh xa, nhưng luật Đổi Vai chốt: *"Axie chỉ đơn thuần là avatar thôi, khi tấn
công thì ví dụ Dark Wizard sẽ xuất hiện và tung chiêu."* Cho con Axie tự húc trong lúc Dark
Wizard niệm chú bên cạnh là dựng lại đúng cái "hai kẻ cùng đánh" mà cả đợt Đổi Vai gỡ đi.
`get-buff` đọc ra "sức mạnh đang được gọi tới", tức đúng thứ đang xảy ra trên màn.

⚠ HỘP CẮT PHẢI GIỐNG HỆT bảng nhỏ và bảng chạy, nếu không con vật NHẢY một cái mỗi lần đổi
khối. Nên ở đây dựng lại đúng phép tính hộp của `nuong_chi.py` (bb trên appear+idle) rồi mới đem
đi cắt — cùng cách `nuong_chi_chay.py` làm, và cùng lý do: không phải tin vào một con số chép tay.

Rig Axie có 41 hoạt cảnh; game dùng 3 (đứng · quay · chạy). Đây là cái thứ 4 và 5.
"""
import os, sys, json, glob, time, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
from nuong_chi import (BO, IDLE, APPEAR, N_IDLE, N_APPEAR, W, H, OX, OY, PHONG,
                       BO_KHE, CAO_NHO, CHAT, goi, gop_bbox, luoi)
from hoatcanh import TuThe, ve_khung
from nuong_nv import dai

# (tên hoạt cảnh, đuôi tệp, số khung, số cột)
# ⚠ SỐ KHUNG CHỌN THEO ĐỘ DÀI NGUỒN, không chọn cho tròn: get-buff dài 1,000s · hit-by-normal
# 0,417s. 12 và 8 khung cho ra 12 và 19 hình/giây ở tốc độ gốc — nhưng game KHÔNG phát ở tốc độ
# gốc, nó trải bộ khung lên đúng đồng hồ của mình (0,22s một cú đánh, 0,30s một lần trúng đòn).
# Số khung ở đây chỉ quyết định độ MỊN, không quyết định độ DÀI.
KHOI = [
    ('battle/get-buff',       '_b', 12, 6),
    ('defense/hit-by-normal', '_h',  8, 4),
]


def khung(d, im, R, tt, ten, n):
    hc = d['animations'][ten]; T = dai(hc)
    return [ve_khung(d, im, R, tt, hc, i * T / n, 'default', W=W, H=H, phong=PHONG,
                     ox=OX, oy=OY, bo_khe=BO_KHE).transpose(Image.FLIP_LEFT_RIGHT)
            for i in range(n)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--kit', default='/home/user/axieinfinity/axie-origins-asset-kit')
    ap.add_argument('--chi', default=None, help='chỉ nướng một con, để thử nhanh')
    a = ap.parse_args()
    goc = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
    ra  = os.path.join(goc, 'public/game/assets/chimera')
    kit = os.path.join(a.kit, 'Assets/OriginsKit/PvE/Starters')

    # Hoạt cảnh mượn từ một rig .json BẤT KỲ — mọi rig Axie dùng chung bộ xương. Kit tự có rig
    # .json nên không cần repo cc-axie-gtk2d như nuong_chi.py.
    can = [k[0] for k in KHOI]
    nguon = None
    for f in sorted(glob.glob(kit + '/*/*.json')):
        d = json.load(open(f, encoding='utf-8'))
        if all(c in d.get('animations', {}) for c in can): nguon = d['animations']; break
    if not nguon: sys.exit('không rig .json nào có đủ ' + ', '.join(can))

    bang = {k: v for k, v in BO.items() if not a.chi or k == a.chi}
    if not bang: sys.exit('không có con nào tên ' + str(a.chi))

    t0 = time.time(); tong = 0
    for cid, rig in bang.items():
        d, im, R = goi(os.path.join(kit, rig), nguon)
        tt = TuThe(d)
        # ① dựng lại ĐÚNG hộp của bảng nhỏ: bb trên appear + idle, rồi nới cân quanh trục chân
        nen = khung(d, im, R, tt, APPEAR, N_APPEAR) + khung(d, im, R, tt, IDLE, N_IDLE)
        bb = None
        for k in nen: bb = gop_bbox(bb, k.getchannel('A').getbbox())
        ax = W * OX; nua = max(ax - bb[0], bb[2] - ax)
        bb = (int(ax - nua), bb[1], int(ax + nua), bb[3])
        cw0, ch0 = bb[2] - bb[0], bb[3] - bb[1]
        nho = (round(cw0 * CAO_NHO / ch0), CAO_NHO)
        # ② cắt từng khối bằng chính hộp đó
        dong = []
        for ten, duoi, n, cot in KHOI:
            ks = [k.crop(bb).resize(nho, Image.LANCZOS)
                  for k in khung(d, im, R, tt, ten, n)]
            b = luoi(ks, cot, os.path.join(ra, cid + duoi + '.webp'), CHAT)
            tong += b
            dong.append('%s %3d KB' % (duoi, b // 1024))
        print('  %-11s ô %3dx%-3d · %s  (%.0fs)'
              % (cid, nho[0], nho[1], ' · '.join(dong), time.time() - t0))
    print('tổng %d con · %.2f MB · %.0fs' % (len(bang), tong / 1048576, time.time() - t0))
    for ten, duoi, n, cot in KHOI:
        print("game.js: khối '%s' → <id>%s.webp · %d khung · %d cột" % (ten, duoi, n, cot))


if __name__ == '__main__':
    main()
