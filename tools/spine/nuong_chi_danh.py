#!/usr/bin/env python3
"""Nướng khối RA ĐÒN cho 16 Axie avatar → assets/chimera/<id>_<mã>.webp

    python3 tools/spine/nuong_chi_danh.py [--kit <đường-kit>] [--chi <id>] [--lop <lớp>]

⚠ ĐÂY LÀ MỘT LUẬT BỊ LẬT, KHÔNG PHẢI MỘT KHỐI ĐƯỢC THÊM. Trước bản này luật là *"AXIE KHÔNG
ĐÁNH"* (chủ dự án chốt 2026-09-15), và `nuong_chi_phanung.py` còn ghi nguyên lý do ở đầu tệp:
cho Axie tự húc trong lúc Dark Wizard niệm chú BÊN CẠNH là dựng lại cái "hai kẻ cùng đánh".

Lý do đó **hết hiệu lực** vì hình dạng đã đổi, chứ không phải vì ai đó quên nó: nay lớp nhân
vật **NHẬP VÀO** con Axie khi đánh nhau nên trên màn chỉ còn MỘT thân, không phải hai. Chủ dự
án chốt lại 2026-09-16: *"Cứ cho Axie ra đòn... Người chơi muốn đánh quái thì phải nhập vào
Axie, nhưng để flex được bộ giáp thì hãy làm cho nó đi theo ở trong thành."*

⚠ MỖI LỚP MỘT KIỂU ĐÒN — đó là cả điểm của đợt này. Axie ra đòn mà năm lớp ra cùng một đòn thì
5 lớp mất sạch dấu hiệu nhìn thấy được (chúng vốn đã không còn thân người trong lúc đánh). Kit
có sẵn 9 đòn gần + 5 đòn xa, dùng chung cho mọi rig, nên năm kiểu đọc khác nhau tốn 0 đồng art.

⚠ HỘP CẮT PHẢI GIỐNG HỆT bảng nhỏ / chạy / phản ứng, nếu không con vật NHẢY một cái mỗi lần đổi
khối. Nên ở đây dựng lại đúng phép tính hộp của `nuong_chi.py` (bb trên appear+idle) rồi mới đem
đi cắt — cùng cách ba công cụ kia làm, và cùng lý do: không phải tin vào một con số chép tay.
"""
import os, sys, json, glob, time, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
from nuong_chi import (BO, IDLE, APPEAR, N_IDLE, N_APPEAR, W, H, OX, OY, PHONG,
                       BO_KHE, CAO_NHO, CHAT, goi, gop_bbox, luoi)
from hoatcanh import TuThe, ve_khung
from nuong_nv import dai

# lớp → (hoạt cảnh kit, mã đuôi tệp, số khung, số cột)
#
# ⚠ CHỌN THEO CÁCH LỚP ẤY ĐÁNH, không chọn cho đủ mặt. Phải khớp `SECT_ACT`/`HERO_ACT` mà lớp
# đó vốn dùng, nếu không con Axie húc đầu trong lúc VFX của chiêu rơi từ trên trời xuống:
#   thieulam  Dark Knight    bổ nặng từ trên     → tail-smash   (đòn quật, 1,000s)
#   baidasan  Dark Wizard    Meteorite giáng     → cast-high    (niệm lên cao, 0,917s)
#   toanchan  Sylvan Ranger  bắn tên             → cast-fly     (phóng đi xa, 1,000s)
#   minhgiao  Spellblade     combo nhiều nhát    → multi-attack (nhiều nhát, 1,250s)
#   bug       Dark Lord      quét thấp, ra lệnh  → cast-low     (0,750s)
#
# ⚠ SỐ KHUNG QUYẾT ĐỊNH ĐỘ MỊN, KHÔNG QUYẾT ĐỊNH ĐỘ DÀI — game trải bộ khung lên đúng đồng hồ
# của nó (`NV_DANH_GIAY` = 0,22s), không phát ở tốc độ gốc. Lấy 12 khung cho mọi lớp: ở 0,22s
# là 55 hình/giây, thừa mịn; `multi-attack` lấy 16 vì nó là NHIỀU nhát nên thưa khung ra thì
# mất luôn cái làm nó khác bốn đòn kia.
LOP = {
    'thieulam': ('attack/melee/tail-smash',    '_ts', 12, 6),
    'baidasan': ('attack/ranged/cast-high',    '_ch', 12, 6),
    'toanchan': ('attack/ranged/cast-fly',     '_cf', 12, 6),
    'minhgiao': ('attack/melee/multi-attack',  '_ma', 16, 8),
    'bug':      ('attack/ranged/cast-low',     '_cl', 12, 6),
}


def khung(d, im, R, tt, ten, n):
    hc = d['animations'][ten]; T = dai(hc)
    return [ve_khung(d, im, R, tt, hc, i * T / n, 'default', W=W, H=H, phong=PHONG,
                     ox=OX, oy=OY, bo_khe=BO_KHE).transpose(Image.FLIP_LEFT_RIGHT)
            for i in range(n)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--kit', default='/home/user/axieinfinity/axie-origins-asset-kit')
    ap.add_argument('--chi', default=None, help='chỉ nướng một con, để thử nhanh')
    ap.add_argument('--lop', default=None, help='chỉ nướng một lớp, để thử nhanh')
    a = ap.parse_args()
    goc = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
    ra  = os.path.join(goc, 'public/game/assets/chimera')
    kit = os.path.join(a.kit, 'Assets/OriginsKit/PvE/Starters')

    khoi = [v for k, v in LOP.items() if not a.lop or k == a.lop]
    if not khoi: sys.exit('không có lớp nào tên ' + str(a.lop))

    # Hoạt cảnh mượn từ một rig .json BẤT KỲ — mọi rig Axie dùng chung bộ xương (đã đo: bộ 41
    # hoạt cảnh giống hệt nhau ở cả 12 rig .json).
    can = [k[0] for k in khoi]
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
        for ten, duoi, n, cot in khoi:
            ks = [k.crop(bb).resize(nho, Image.LANCZOS)
                  for k in khung(d, im, R, tt, ten, n)]
            b = luoi(ks, cot, os.path.join(ra, cid + duoi + '.webp'), CHAT)
            tong += b
            dong.append('%s %3d KB' % (duoi, b // 1024))
        print('  %-11s ô %3dx%-3d · %s  (%.0fs)'
              % (cid, nho[0], nho[1], ' · '.join(dong), time.time() - t0))
    print('tổng %d con × %d khối · %.2f MB · %.0fs'
          % (len(bang), len(khoi), tong / 1048576, time.time() - t0))
    print('game.js — CHI_DANH_LOP:')
    for lop, (ten, duoi, n, cot) in LOP.items():
        if not a.lop or lop == a.lop:
            print("  %-9s → '%s' · %s · %d khung · %d cột" % (lop, ten, duoi, n, cot))


if __name__ == '__main__':
    main()
