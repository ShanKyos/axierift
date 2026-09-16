#!/usr/bin/env python3
"""KHUÔN ATLAS — làm nhân vật mới bằng MỘT tấm PNG, không đụng tới Spine.

    python3 tools/spine/khuon_atlas.py khuon <gói mẫu> <ra.png>
        Xuất một tấm 2048x2048 vẽ sẵn 30 ô của bản mẫu: mỗi ô một khung, một cái
        tên, và art của gói mẫu để ở mức mờ làm nền can. Hoạ sĩ vẽ đè lên đúng ô.

    python3 tools/spine/khuon_atlas.py ra <gói mẫu> <thư mục>
        Nổ atlas của gói mẫu thành 30 tệp PNG rời, đặt tên theo vùng.

    python3 tools/spine/khuon_atlas.py dong <gói mẫu> <thư mục PNG> <gói ra>
        Dồn 30 tệp PNG rời trở lại thành một gói chạy được (json + atlas + png).
        Tệp nào thiếu thì lấy của gói mẫu — nên vẽ dần từng bộ phận được.

VÌ SAO CÓ TỆP NÀY — số đo, không phải cảm giác.

Năm gói Spine nhận từ chủ dự án (Dark_Knight · Dark_Knight_1 · Dark_Lord ·
Fairy_Elf · Magic_Gladiator) có **BỘ XƯƠNG TRÙNG KHÍT TỪNG BYTE**:

    83 xương · 13 khe · 20 hoạt cảnh · 6 IK · 5 ràng buộc biến hình · 28 physics
    (băm MD5 của cả ba bảng giống hệt nhau ở cả năm gói)

và **bố cục atlas cũng trùng khít**: đúng 30 vùng, cùng toạ độ pixel, trên một
trang 2048x2048. Mọi lưới mesh (đỉnh · UV · trọng số) giống nhau từng số, TRỪ
`躯干` (thân — đổi khi bóng váy đổi) và `背后头发` (Dark Lord không có).

⇒ Một nhân vật mới KHÔNG phải một lượt rig. Nó là **một tấm PNG**. Đã chứng minh
bằng cách lấy JSON+atlas của Fairy Elf, thay đúng một tệp PNG bằng của Magic
Gladiator, rồi dựng lại: ra đúng Magic Gladiator, trùng khít gói thật.

⇒ Đừng đem PhotoshopToSpine + Auto Weights ra rig lại từ đầu cho một nhân vật
thuộc bản mẫu này: nó sẽ đẻ ra một bộ xương tên khác, KHÔNG hoạt cảnh nào, không
IK, không 28 ràng buộc physics — tức phải dựng tay lại 20 hoạt cảnh để đổi lấy
thứ đang có sẵn miễn phí. Xem `docs/NHAN_VAT_MOI.md`.
"""
import sys, os, re, shutil, json

def doc_atlas(thu):
    """Trả (tên png, (w,h) trang, [(tên vùng, x, y, w, h)]) của gói."""
    at = [f for f in os.listdir(thu) if f.endswith('.atlas')]
    if not at: raise SystemExit(f'không thấy .atlas trong {thu}')
    txt = open(os.path.join(thu, at[0]), encoding='utf-8').read()
    dong = txt.splitlines()
    png = dong[0].strip()
    trang = (0, 0)
    vung, cur = [], None
    for ln in dong[1:]:
        if ln.startswith('size:'):
            w, h = ln.split(':')[1].split(','); trang = (int(w), int(h))
        elif ln and not ln.startswith(' ') and ':' not in ln:
            cur = ln.strip()
        elif cur and ln.strip().startswith('bounds:'):
            x, y, w, h = (int(v) for v in ln.split(':')[1].split(','))
            vung.append((cur, x, y, w, h)); cur = None
    return at[0], png, trang, vung

def _mo(thu):
    from PIL import Image
    ten_at, png, trang, vung = doc_atlas(thu)
    return ten_at, png, trang, vung, Image.open(os.path.join(thu, png)).convert('RGBA')

def lam_khuon(thu, ra):
    from PIL import Image, ImageDraw
    _, _, trang, vung, im = _mo(thu)
    # Nền can: art gốc để mờ. Hoạ sĩ cần THẤY tỉ lệ và chỗ đặt, không cần thấy rõ.
    out = Image.new('RGBA', trang, (24, 26, 34, 255))
    mo = im.copy(); mo.putalpha(mo.getchannel('A').point(lambda v: v // 4))
    out.alpha_composite(mo)
    g = ImageDraw.Draw(out)
    for ten, x, y, w, h in vung:
        g.rectangle([x, y, x + w - 1, y + h - 1], outline=(0, 230, 190, 255), width=2)
        g.text((x + 5, y + 4), ten, fill=(255, 240, 120, 255))
        g.text((x + 5, y + 16), f'{w}x{h}', fill=(150, 200, 255, 255))
    out.save(ra)
    print(f'khuôn {trang[0]}x{trang[1]} · {len(vung)} ô → {ra}')

def no_ra(thu, dich):
    _, _, _, vung, im = _mo(thu)
    os.makedirs(dich, exist_ok=True)
    for ten, x, y, w, h in vung:
        im.crop((x, y, x + w, y + h)).save(os.path.join(dich, ten + '.png'))
    print(f'{len(vung)} tệp → {dich}')

def dong_goi(thu, png_thu, dich):
    from PIL import Image
    ten_at, png, trang, vung, im = _mo(thu)
    out = Image.new('RGBA', trang, (0, 0, 0, 0))
    thay = 0
    for ten, x, y, w, h in vung:
        p = os.path.join(png_thu, ten + '.png')
        if os.path.exists(p):
            m = Image.open(p).convert('RGBA')
            if m.size != (w, h):
                # Cỡ ô là HỢP ĐỒNG: UV của mesh trỏ vào đúng ô ấy. Co giãn hộ thì
                # nét vẽ lệch so với lưới mà không có gì báo — thà dừng lại.
                raise SystemExit(f'{ten}.png cỡ {m.size}, ô của bản mẫu là {(w, h)} — sửa tệp, đừng để máy co')
            thay += 1
        else:
            m = im.crop((x, y, x + w, y + h))       # chưa vẽ thì giữ của bản mẫu
        out.paste(m, (x, y))
    os.makedirs(dich, exist_ok=True)
    for f in os.listdir(thu):
        if f.endswith('.json') or f.endswith('.atlas'):
            shutil.copy(os.path.join(thu, f), os.path.join(dich, f))
    out.save(os.path.join(dich, png))
    print(f'gói mới → {dich}  ({thay}/{len(vung)} ô đã vẽ mới, còn lại giữ của bản mẫu)')

def main():
    if len(sys.argv) < 3: print(__doc__); return 1
    lenh = sys.argv[1]
    if   lenh == 'khuon': lam_khuon(sys.argv[2], sys.argv[3])
    elif lenh == 'ra':    no_ra(sys.argv[2], sys.argv[3])
    elif lenh == 'dong':  dong_goi(sys.argv[2], sys.argv[3], sys.argv[4])
    else: print(__doc__); return 1
    return 0

if __name__ == '__main__': sys.exit(main())
