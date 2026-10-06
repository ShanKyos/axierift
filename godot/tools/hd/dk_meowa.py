#!/usr/bin/env python3
"""Gói Meowa "Godot 4 sprite export" (Dark Knight) → bộ sprite `hd_dark_knight` của game.

    python3 godot/tools/hd/dk_meowa.py <thư mục gói>/textures/dark-knight_spritesheet.png

⚠ GÓI NÀY KHÔNG PHẢI SPINE. Nó là một bảng 4×4 ô 320 px, 13 khung, đúng MỘT hoạt ảnh (thở/đứng)
và đúng MỘT hướng nhìn (chính diện). Không có khung đi, đánh, trúng đòn, ngã.

Nên ở đây chỉ làm phần ẢNH: cắt sát lại, đo bàn chân, lật gương cho ba hướng phía Tây, và gán
cùng 13 khung thở cho mọi trạng thái. Phần CHUYỂN ĐỘNG (nghiêng theo quán tính khi chạy, nhún
bước, lấy đà – lao tới khi chém, giật lùi khi trúng đòn, đổ xuống theo trọng lực khi chết) do
`scripts/vat_ly_than.gd` tính mỗi khung trong Godot — cờ `"vat_ly": true` trong JSON bật nó.

⚠ Gót chân đứng yên tuyệt đối qua cả 13 khung (đo: y = 246 ở mọi khung) ⇒ neo bàn chân lấy
một lần ở khung đầu là đúng cho cả bộ, không phải đo từng khung.
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageOps

sys.path.insert(0, os.path.dirname(__file__))
from chuan_bi_hd import PX_M, HUONG, CAO, ra, chan_khung  # noqa: E402

TEN = "hd_dark_knight"
O_NGUON = 320
COT_NGUON = 4
N = 13
O = 224                    # ô mới: đủ chứa thân cao 186 px + chùm lông mũ, bỏ phần đen thừa
TAY = (1, 2, 3)            # SW · W · NW: lật gương từ bản chính diện


def doc(duong):
    sh = Image.open(duong).convert("RGBA")
    khung = []
    for k in range(N):
        x, y = (k % COT_NGUON) * O_NGUON, (k // COT_NGUON) * O_NGUON
        khung.append(sh.crop((x, y, x + O_NGUON, y + O_NGUON)))
    return khung


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    khung = doc(sys.argv[1])
    a0 = np.array(khung[0].getchannel("A")) > 20
    ys, xs = np.nonzero(a0)
    day = int(ys.max())                                       # gót chân
    tam = float(np.median(xs[ys >= day - 10]))                # giữa hai bàn chân
    dinh = int(min(np.nonzero(np.array(k.getchannel("A")) > 20)[0].min() for k in khung))
    cao = day - dinh + 1
    x0 = int(round(tam - O / 2))
    y0 = day + 10 - O                                         # chừa 10 px dưới gót cho bóng
    o_cat = [k.crop((x0, y0, x0 + O, y0 + O)) for k in khung]
    neo = [O / 2, day - y0]
    ty = CAO["nguoi"] * 1.04 / cao                            # Dark Knight nhỉnh hơn dân thường chút

    def bang(chi_so):
        out = Image.new("RGBA", (len(chi_so) * O, 8 * O))
        for d in range(8):
            for i, k in enumerate(chi_so):
                im = o_cat[k]
                out.paste(ImageOps.mirror(im) if d in TAY else im, (i * O, d * O))
        return out

    tho = list(range(N))
    tt = {
        # tên: (khung, fps, lặp, khung trúng, tốc độ m/s)
        "idle": (tho, 8.0, True, None, None),
        "walk": (tho, 10.0, True, None, 1.35),
        "run": (tho, 26.0, True, None, 3.4),
        "attack": (tho[:8], 13.0, False, 4, None),
        "hit": ([0, 1, 2], 10.0, False, None, None),
        "death": ([0] * 6, 6.7, False, None, None),
    }
    # MỘT tấm ảnh cho cả bộ: mọi trạng thái trỏ vào `tho.webp` qua `tep` + `chi_so` (SpriteBo đọc
    # hai khoá đó). Ghi sáu tấm giống nhau là nhân 4 MB vào lịch sử git cho đúng một bức tranh.
    sh = bang(tho)
    sh.save(ra(TEN, "tho.webp"), "WEBP", quality=92, alpha_quality=100, method=6)
    chan_tho = [[chan_khung(sh.crop((i * O, d * O, (i + 1) * O, (d + 1) * O)), neo[1]) for i in tho]
                for d in range(8)]
    out = {}
    for ten, (ks, fps, lap, trung, toc) in tt.items():
        out[ten] = {"khung": len(ks), "fps": fps, "lap": lap, "trung": trung, "toc_do_m_s": toc,
                    "tep": "tho", "chi_so": ks, "chan": [[chan_tho[d][k] for k in ks] for d in range(8)]}
    json.dump({"o": O, "neo": neo, "px_m": PX_M, "ty": float(ty), "cao": float(cao), "huong": HUONG,
               "trang_thai": out, "dinh_dang": "webp", "vat_ly": True,
               "nguon": "Meowa Godot 4 sprite export — 13 khung thở, một hướng"},
              open(ra(TEN, TEN + ".json"), "w"))
    print("xong %s: thân %d px, neo %s, ty %.4f" % (TEN, cao, neo, ty))


if __name__ == "__main__":
    main()
