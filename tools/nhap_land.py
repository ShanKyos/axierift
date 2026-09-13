#!/usr/bin/env python3
"""Nhập art vật phẩm từ kho Axie Land vào assets/items/.

    git clone --depth 1 https://github.com/axieinfinity/cc-axie-gtk2d /tmp/ccgtk
    python3 tools/nhap_land.py /tmp/ccgtk

Nguồn: `axieinfinity/cc-axie-gtk2d` → `assets/axie-standard-assets/sprites/land-items/Items`.
Art gốc 512x512, nền trong, MỘT vật một tấm, cùng một tay vẽ.

Vì sao bộ này dùng được mà không phải gán bừa cho có hình: nó đặt tên theo CHẤT LIỆU
(stone -> wooden -> copper -> bronze -> iron -> steel; bạc -> vàng; đá quý leo dần), mà đó
đúng là thang bảy giai của game và đúng luật "tên trang bị đi theo chất liệu" ở CLAUDE.md.

⚠ Bảng dưới đây chỉ liệt kê NGUỒN. Chuyện giai nào dùng tấm nào nằm ở `MON_ANH` trong
game.js — một tấm dùng cho nhiều giai, nên nhân bản tệp ở đây là phí chỗ.

⚠ `steel_hammer` thật ra là một cái RÌU (đầu hai lưỡi). Phải mở ở cỡ thật mới thấy; ở cỡ icon
nó chỉ trông "hơi lạ". Trong game nó về dòng `riu`, không phải `bua`.

⚠ KHÔNG nhập art GIÁP. Đã thử và phải gỡ: giáp là 5 lớp × 7 giai × 4 ô, sinh từ `HERO_SETS`
đúng vì "hình trong túi và hình trên người dùng CHUNG một nguồn". Kho này chỉ có sáu mũ, bảy
áo, không chia theo lớp — map vào là cả năm lớp chung một cái mũ trong túi trong khi giáp trên
người vẫn riêng từng lớp. `test_itemdb` bắt ngay: hai món khác nhau ra cùng một ảnh. Muốn dùng
thì phải nhuốm màu theo bộ của từng lớp, và đó là việc riêng cần duyệt bằng mắt.

⚠ Ba chỗ khác CỐ Ý không nhập vì kho không có tranh đúng nghĩa, mà ghép bừa thì tệ hơn ô chờ
art: ô `tay` (găng) · ô `chan` (ủng) — kho chỉ có mũ/áo/khiên; dòng `kich` (kích) — kho chỉ có
búa/kiếm/cung/tên/trượng.
"""
import os
import sys

from PIL import Image

# tên trong game -> đường dẫn trong kho (bỏ đuôi .png)
NGUON = {
    # Nhẫn — vàng (nhẫn 1) và bạc (nhẫn 2), leo bằng đá quý
    'gr_v0': 'Accessory/gold_ring', 'gr_v1': 'Accessory/gold_topaz_ring',
    'gr_v2': 'Accessory/gold_emerald_ring', 'gr_v3': 'Accessory/gold_ruby_ring',
    'gr_v4': 'Accessory/gold_amethyst_ring', 'gr_v5': 'Accessory/gold_diamond_ring',
    'gr_b0': 'Accessory/silver_ring', 'gr_b1': 'Accessory/silver_topaz_ring',
    'gr_b2': 'Accessory/silver_emerald_ring', 'gr_b3': 'Accessory/silver_ruby_ring',
    'gr_b4': 'Accessory/silver_amethyst_ring', 'gr_b5': 'Accessory/silver_diamond_ring',
    # Dây chuyền — vàng (nhánh vật lý) và bạc (nhánh phép)
    'gd_v0': 'Accessory/gold_necklace', 'gd_v1': 'Accessory/gold_topaz_necklace',
    'gd_v2': 'Accessory/gold_emerald_necklace', 'gd_v3': 'Accessory/gold_ruby_necklace',
    'gd_v4': 'Accessory/gold_amethyst_necklace', 'gd_v5': 'Accessory/gold_diamond_necklace',
    'gd_b0': 'Accessory/silver_necklace', 'gd_b1': 'Accessory/silver_topaz_necklace',
    'gd_b2': 'Accessory/silver_emerald_necklace', 'gd_b3': 'Accessory/silver_ruby_necklace',
    'gd_b4': 'Accessory/silver_amethyst_necklace', 'gd_b5': 'Accessory/silver_diamond_necklace',
    # Búa (bốn chất liệu) + cái thứ năm vốn là RÌU
    'gb_da': 'Weapon/stone_hammer', 'gb_dong': 'Weapon/copper_hammer',
    'gb_dongthau': 'Weapon/bronze_hammer', 'gb_sat': 'Weapon/iron_hammer',
    'gb_thep': 'Weapon/steel_hammer',
    # Kiếm — dòng song đao
    'gs_dong': 'Weapon/copper_sword', 'gs_dongthau': 'Weapon/bronze_sword',
    'gs_sat': 'Weapon/iron_sword', 'gs_thep': 'Weapon/steel_sword',
    # Cung
    'gc_ngan': 'Weapon/recurve_bow', 'gc_dai': 'Weapon/long_bow',
    'gc_kep': 'Weapon/composite_bow',
    # Bình thuốc trên thanh chiến đấu — đỏ = máu, xanh = năng lượng
    'it_mau': 'Potion/potion_health_large', 'it_mana': 'Potion/potion_energy_large',
}

# 112px: ô icon vẽ ở khung 92 trong hệ 100x100, nên 112 còn dư cho chỗ hiện to hơn (tooltip,
# ô trang bị) mà không phình dung lượng. 512 gốc là thừa gấp bốn.
CANH = 112


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    kho = os.path.join(sys.argv[1],
                       'assets/axie-standard-assets/sprites/land-items/Items')
    if not os.path.isdir(kho):
        sys.exit(f'không thấy {kho} — tham số phải là gốc bản sao cc-axie-gtk2d')
    ra = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                      '..', 'public', 'game', 'assets', 'items')
    os.makedirs(ra, exist_ok=True)
    tong = 0
    for dich, src in NGUON.items():
        im = Image.open(f'{kho}/{src}.png').convert('RGBA')
        hop = im.getbbox()          # art gốc có lề trong suốt rộng — cắt sát rồi mới thu
        if hop:
            im = im.crop(hop)
        im.thumbnail((CANH, CANH), Image.LANCZOS)
        khung = Image.new('RGBA', (CANH, CANH), (0, 0, 0, 0))
        khung.paste(im, ((CANH - im.width) // 2, (CANH - im.height) // 2))
        f = os.path.join(ra, dich + '.png')
        khung.save(f, optimize=True)
        tong += os.path.getsize(f)
    print(f'{len(NGUON)} tệp · tổng {tong / 1024:.0f} KB · {ra}')


if __name__ == '__main__':
    main()
