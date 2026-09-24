#!/usr/bin/env python3
"""Icon trong túi cho 7 bộ giáp của gói `magic-runtime` — 5 ô mỗi bộ (nón · áo · găng · quần · chân).

Nguồn là gói Thành `town_v1` (`armorMode: piece_layers`): mỗi món giáp có LỚP RỜI của nó, nên
icon của một món là đúng lớp của món đó — áo không lẫn tay, quần không lẫn giày. Khung dùng là
khung ĐỨNG hướng South (hàng 0, cột 0 của atlas `idle`) — quay mặt về người xem.

  ô game  ← lớp gói         cách cắt
  ao      ← chest           hộp bao alpha của lớp
  tay     ← gloves          hộp bao alpha của lớp (hai bàn tay ⇒ lấy nửa có nhiều điểm ảnh hơn)
  quan    ← pants           hộp bao alpha của lớp
  chan    ← boots           hộp bao alpha của lớp
  non     ← head            ⚠ Spellblade KHÔNG đội mũ: lớp head cố ý trong suốt (`magicHeadPolicy`)
                            và mặt nạ nằm ở lớp chest. Nên icon Nón cắt vùng ĐẦU của lớp chest.

Đổi art thì chạy lại là xong. Dừng hẳn khi một lớp trống — đừng sinh icon rỗng trong im lặng.

  python3 tools/magic/nuong_icon_mr.py
Ra: public/game/assets/magic-runtime/icon/<armor_id>_<ô>.webp  (96×96)
"""
import json, os, sys
from PIL import Image

GOC = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'game', 'assets', 'magic-runtime')
TOWN = os.path.join(GOC, 'town_v1')
RA = os.path.join(GOC, 'icon')
PX = 96
O_LOP = {'ao': 'chest', 'tay': 'gloves', 'quan': 'pants', 'chan': 'boots'}


def vuong_quanh(bb, le=0.12):
    x0, y0, x1, y1 = bb
    canh = max(x1 - x0, y1 - y0) * (1 + le)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    h = canh / 2
    return (round(cx - h), round(cy - h), round(cx + h), round(cy + h))


def luu(im, ten):
    if not im.getbbox():
        sys.exit(f'{ten}: vùng cắt trống — dừng')
    im.resize((PX, PX), Image.LANCZOS).save(os.path.join(RA, ten + '.webp'), 'WEBP',
                                            quality=90, alpha_quality=100, method=6)


def main():
    man = json.load(open(os.path.join(TOWN, 'manifest.json'), encoding='utf-8'))
    O = man['cell'][0]
    os.makedirs(RA, exist_ok=True)
    n = 0
    for a in man['armors']:
        st = a['states']['idle']
        lop = {o: Image.open(os.path.join(TOWN, st[k])).convert('RGBA').crop((0, 0, O, O))
               for o, k in O_LOP.items()}
        for o, im in lop.items():
            bb = im.getbbox()
            if not bb:
                sys.exit(f'{a["id"]}/{O_LOP[o]}: khung South trống — dừng')
            if o == 'tay':
                # hai bàn tay tách xa nhau; lấy nửa đậm hơn để icon là MỘT chiếc găng đủ to
                gx = (bb[0] + bb[2]) // 2
                trai, phai = im.crop((0, 0, gx, O)), im.crop((gx, 0, O, O))
                dem = lambda x: sum(1 for p in x.get_flattened_data() if p[3] > 40)
                nua = trai if dem(trai) >= dem(phai) else phai
                off = 0 if nua is trai else gx
                b2 = nua.getbbox()
                bb = (b2[0] + off, b2[1], b2[2] + off, b2[3])
            if o == 'ao':
                # lớp chest ôm cả mặt nạ + tóc; icon Áo cắt từ vai xuống, đầu đã là icon Nón
                bb = (bb[0], bb[1] + round((bb[3] - bb[1]) * 0.20), bb[2], bb[3])
            luu(im.crop(vuong_quanh(bb)), f'{a["id"]}_{o}'); n += 1
        # Nón: vùng đầu (mặt nạ + tóc) của lớp chest — xem chú thích đầu tệp
        x0, y0, x1, y1 = lop['ao'].getbbox()
        cao = y1 - y0
        cx = (x0 + x1) / 2
        h = cao * 0.17
        luu(lop['ao'].crop((round(cx - h), round(y0 - h * 0.15), round(cx + h), round(y0 + h * 1.85))),
            f'{a["id"]}_non'); n += 1
    print(f'NUONG XONG {n} icon → {os.path.relpath(RA)}')


if __name__ == '__main__':
    main()
