#!/usr/bin/env python3
"""Icon trong túi cho 7 bộ giáp của gói `magic-runtime` — 4 ô mỗi bộ (nón · áo · găng · chân).

Gói ở chế độ `appearance-replacement`: không có tấm rời cho từng món giáp, chỉ có cả thân. Nên
icon cắt từ khung ĐỨNG hướng South (hàng 0, cột 0 của atlas idle) — đúng hướng quay mặt về người
xem, đúng tấm mà thẻ nhân vật cũng vẽ.

Vùng cắt KHÔNG chép tay: nón/áo/chân suy từ hộp bao alpha của chính khung đó (theo tỉ lệ chiều
cao thân), găng lấy tâm ở socket `hand_right` của `sockets.json`. Đổi art thì chạy lại là xong.

  python3 tools/magic/nuong_icon_mr.py
Ra: public/game/assets/magic-runtime/icon/<armor_id>_<ô>.webp  (96×96)
"""
import json, os, sys
from PIL import Image

GOC = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'game', 'assets', 'magic-runtime')
RA = os.path.join(GOC, 'icon')
PX = 96

def vuong(cx, cy, canh):
    h = canh / 2
    return (round(cx - h), round(cy - h), round(cx + h), round(cy + h))

def main():
    man = json.load(open(os.path.join(GOC, 'manifest.json')))
    so = json.load(open(os.path.join(GOC, man.get('sockets', 'sockets.json'))))
    O = man['cell'][0]
    tay = so['states']['idle'][man['layout']['rowOrder'][0]][0]['hand_right']['xy']
    os.makedirs(RA, exist_ok=True)
    n = 0
    for a in man['armors']:
        at = Image.open(os.path.join(GOC, a['states']['idle'])).convert('RGBA')
        kh = at.crop((0, 0, O, O))
        bb = kh.getbbox()
        if not bb:
            sys.exit(f'{a["id"]}: khung South trống — dừng, đừng sinh icon rỗng')
        x0, y0, x1, y1 = bb
        cao = y1 - y0
        cx = (x0 + x1) / 2
        vung = {
            'non':  vuong(cx, y0 + cao * 0.13, cao * 0.30),
            'ao':   vuong(cx, y0 + cao * 0.40, cao * 0.50),
            # găng: socket là chỗ NẮM (ngón tay), nên lấy tâm lùi lên cẳng tay một chút
            'tay':  vuong(tay[0], tay[1] - cao * 0.04, cao * 0.34),
            'chan': vuong(cx, y0 + cao * 0.78, cao * 0.46),
        }
        for o, hop in vung.items():
            im = kh.crop(hop)
            bb2 = im.getbbox()
            if not bb2:
                sys.exit(f'{a["id"]}_{o}: vùng cắt trống — dừng')
            im = im.resize((PX, PX), Image.LANCZOS)
            im.save(os.path.join(RA, f'{a["id"]}_{o}.webp'), 'WEBP', quality=90, alpha_quality=100, method=6)
            n += 1
    print(f'NUONG XONG {n} icon → {os.path.relpath(RA)}')

if __name__ == '__main__':
    main()
