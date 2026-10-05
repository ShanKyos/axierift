#!/usr/bin/env python3
"""Chuẩn bị art HD cho bản PC 2D: lấy tranh HD có sẵn của bản web (public/game/assets) rồi đóng
thành đúng định dạng bộ sprite mà game Godot đang đọc (`SpriteBo`: PNG/WebP theo trạng thái +
JSON), cộng một trường mới `ty` — tỉ lệ vẽ (texture px → px logic của game).

    python3 godot/tools/hd/chuan_bi_hd.py

⚠ GIỮ NGUYÊN TOẠ ĐỘ LOGIC CỦA GAME. Game vẫn chạy ở khung logic 640×360 với ô đất 64×32; chỉ
texture là HD (ô đất 256×128 = gấp 4), vẽ thu lại bằng `ty`. Cửa sổ vẽ ở độ phân giải thật
(stretch `canvas_items`), nên trên màn 1920×1080 mỗi px logic là 3 px thật và tranh HD hiện đủ nét.

⚠ CỠ HD SUY TỪ CỠ PIXEL ĐO ĐƯỢC, không chép tay: thân người pixel cao 67 px logic ⇒ thân HD
(226 px trong ô 256) vẽ ở ty = 67/226. Cỡ đích nằm ở bảng `CAO` dưới đây.

⚠ BÀN CHÂN ĐO TỪ ẢNH: bộ pixel ghi vị trí bàn chân lúc render 3D; tranh HD không có số đó, nên
ở đây đo lại từ kênh alpha (điểm thấp nhất của mỗi nửa thân) và suy tốc độ đi từ chính bàn chân
chống — cùng luật "chân không trượt" của game.
"""
import json
import os
import shutil

import numpy as np
from PIL import Image, ImageOps

GOC = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
WEB = os.path.join(GOC, "public", "game", "assets")
RA = os.path.join(GOC, "godot", "assets", "hd")
PX_M = 35.96                                   # px logic / mét — cùng số với bộ pixel
HUONG = ["S", "SW", "W", "NW", "N", "NE", "E", "SE"]

# cỡ đích (px logic) — đo từ chính bộ pixel đang chạy
CAO = {"nguoi": 67.0, "npc": 62.0, "bo_giap": 33.0, "axie": 34.0}


def ra(*p):
    d = os.path.join(RA, *p)
    os.makedirs(os.path.dirname(d), exist_ok=True)
    return d


def hop_alpha(im, nguong=100):
    a = np.array(im.getchannel("A")) > nguong
    ys, xs = np.nonzero(a)
    if len(xs) == 0:
        return None
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


# ───────────────────────── mặt đất ─────────────────────────
## Loại ô của game → viên HD (4 biến thể mỗi loại). Thứ tự loại phải trùng tiles/o_dat.json.
VIEN = {
    "co1": "nen_vuon1", "co2": "nen_vuon2", "co3": "nen_vuon3", "co4": "nen_vuon4",
    "dat": "nen_dat", "da_lat": "nen_da", "nuoc": "@nuoc", "duong": "nen_duong",
    "cau": "nen_sanda", "cat": "nen_soi", "san_go": "nen_tro", "tham": "@tham",
}


def vien(ten, k):
    """Ảnh 256×128 của một biến thể. `co*` là một viên cố định nhưng xoay vòng biến thể theo k."""
    if ten.startswith("@"):
        goc = Image.open(os.path.join(WEB, "iso", ("nen_bang%d.png" if ten == "@nuoc" else "nen_nung%d.png") % (k + 1))).convert("RGBA")
        a = np.array(goc).astype(np.float32)
        lum = a[..., :3].mean(axis=2, keepdims=True) / 255.0
        if ten == "@nuoc":       # nước: lấy vân băng, nhuộm xanh sâu — giữ gợn sáng tối của tranh gốc
            mau = np.array([28, 70, 96], np.float32) + lum * np.array([40, 70, 80], np.float32)
        else:                    # thảm cửa trong nhà: vân nung, nhuộm đỏ đô
            mau = np.array([90, 22, 24], np.float32) + lum * np.array([90, 30, 26], np.float32)
        a[..., :3] = np.clip(mau, 0, 255)
        return Image.fromarray(a.astype(np.uint8), "RGBA")
    if ten[-1].isdigit():        # biến thể cố định (cỏ): dùng đúng viên đó cho cả bốn ô biến thể
        ten_k = ten if k == 0 else ten[:-1] + str((int(ten[-1]) - 1 + k) % 4 + 1)
        return Image.open(os.path.join(WEB, "iso", ten_k + ".png")).convert("RGBA")
    return Image.open(os.path.join(WEB, "iso", "%s%d.png" % (ten, k + 1))).convert("RGBA")


def lam_dat():
    loai = json.load(open(os.path.join(GOC, "godot", "assets", "tiles", "o_dat.json")))["loai"]
    atlas = Image.new("RGBA", (256 * len(loai), 128 * 4))
    for i, l in enumerate(loai):
        for k in range(4):
            v = vien(VIEN[l], k)
            if l.startswith("co"):            # bốn ô cỏ của game là bốn VIÊN khác nhau, không biến thể
                v = vien(VIEN[l], 0)
            atlas.paste(v, (i * 256, k * 128))
    atlas.save(ra("dat", "o_dat_hd.png"))
    json.dump({"o": [256, 128], "loai": loai, "bien": 4, "ty": 0.25}, open(ra("dat", "o_dat_hd.json"), "w"))


# ───────────────────────── công trình, cây, đá ─────────────────────────
## Tên công trình của game → tranh HD. Chép nguyên tấm; game tự thu cho vừa chân đế.
CONG_TRINH = {
    "nha_a": "ct_duoc", "lo_ren": "ct_loren", "nha_b": "ct_saanhlenh", "nha_c": "ct_quantro",
    "thap_phap": "ct_thapvach", "dai_phun": "ct_dainuoc", "sap_cho": "ct_vukhi", "cong": "ct_cong",
    "chuong": "ct_chuong", "thung": "trai_thung",
}
CAY = ["cay1", "cay2", "cay3", "cay4", "cay5", "cay6", "cay_vuon1", "cay_vuon2",
       "cay_rung1", "cay_rung2", "cay_rung3", "cay_rung4"]
DA = ["da1", "da2", "da3"]


def mo_vien(im, rong=28):
    """Bóng đổ vẽ sẵn trong tranh cây chạm MÉP ảnh và bị cắt thẳng: tắt dần alpha ở dải mép."""
    a = np.array(im).astype(np.float32)
    h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    kc = np.minimum.reduce([xx, yy, w - 1 - xx, h - 1 - yy]).astype(np.float32)
    a[..., 3] *= np.clip(kc / rong, 0, 1)
    return Image.fromarray(a.astype(np.uint8), "RGBA")


def lam_canh():
    neo = {}
    s = open(os.path.join(GOC, "public", "game", "data", "iso.js")).read()
    for dong in s.splitlines():
        dong = dong.strip()
        if ":" in dong and "[" in dong:
            k, v = dong.split(":", 1)
            neo[k.strip()] = json.loads(v.strip().rstrip(","))
    bang = {"cong_trinh": {}, "cay": [], "da": []}
    for ten, hd in CONG_TRINH.items():
        im = Image.open(os.path.join(WEB, "iso", hd + ".png")).convert("RGBA")
        b = hop_alpha(im, 20)
        im.save(ra("canh", hd + ".png"))
        bang["cong_trinh"][ten] = {"tep": hd, "hop": list(map(int, b))}
    for ds, khoa in ((CAY, "cay"), (DA, "da")):
        for t in ds:
            im = mo_vien(Image.open(os.path.join(WEB, "iso", t + ".png")).convert("RGBA"))
            im.save(ra("canh", t + ".png"))
            b = hop_alpha(im, 60)
            bang[khoa].append({"tep": t, "neo": neo[t], "hop": list(map(int, b))})
    json.dump(bang, open(ra("canh", "canh_hd.json"), "w"), indent=1)


# ───────────────────────── bộ sprite 8 hướng ─────────────────────────
def chan_khung(o_im, day_y):
    """Hai bàn chân của một khung: điểm thấp nhất của nửa trái / nửa phải thân (theo kênh alpha)."""
    a = np.array(o_im.getchannel("A")) > 100
    ys, xs = np.nonzero(a)
    if len(xs) == 0:
        c = [o_im.width / 2, day_y]
        return {"L": {"px": c, "cham": True}, "R": {"px": c, "cham": True}, "thap": 0.0}
    duoi = ys >= ys.max() - 14                        # dải gần đất: bàn chân
    giua = float(np.median(xs[duoi]))
    out = {}
    for ben, chon in (("L", xs[duoi] >= giua), ("R", xs[duoi] < giua)):
        if not chon.any():
            chon = np.ones_like(xs[duoi], bool)
        y = ys[duoi][chon].max()
        x = float(xs[duoi][chon][ys[duoi][chon] >= y - 1].mean())
        out[ben] = {"px": [round(x, 2), float(y)], "cham": bool(y >= ys.max() - 3)}
    out["thap"] = 0.0
    return out


def toc_do_chan(sheet, o, hang, n, fps):
    """Tốc độ thân (px ô/giây) suy từ bàn chân CHỐNG lùi lại, đo ở hướng Đông (hàng 6: ngang màn,
    không bị nén iso)."""
    dx = []
    truoc = None
    for k in range(n):
        c = chan_khung(sheet.crop((k * o, hang * o, (k + 1) * o, (hang + 1) * o)), o)
        if truoc:
            for ben in ("L", "R"):
                if c[ben]["cham"] and truoc[ben]["cham"]:
                    d = truoc[ben]["px"][0] - c[ben]["px"][0]      # chân chống lùi về −x khi thân tiến +x
                    if 0.2 < d < o * 0.2:
                        dx.append(d)
        truoc = c
    return (float(np.median(dx)) if dx else 0.0) * fps


def ghi_bo(ten, trang_thai, o, neo, ty, meta_tt, cao):
    tt_out = {}
    for tt, (sheet, n, fps, lap, trung, toc) in trang_thai.items():
        sheet.save(ra(ten, tt + ".webp"), "WEBP", quality=92, alpha_quality=100, method=6)
        chan = []
        for d in range(8):
            chan.append([chan_khung(sheet.crop((k * o, d * o, (k + 1) * o, (d + 1) * o)), o) for k in range(n)])
        tt_out[tt] = {"khung": n, "fps": fps, "lap": lap, "trung": trung,
                      "toc_do_m_s": None if toc is None else round(toc * ty / PX_M, 4), "chan": chan}
        tt_out[tt].update(meta_tt.get(tt, {}))
    # `cao` = chiều cao thân trong ô (px texture): game đặt tên/số bay ngay trên đỉnh đầu theo nó
    json.dump({"o": o, "neo": neo, "px_m": PX_M, "ty": float(ty), "cao": float(cao), "huong": HUONG, "trang_thai": tt_out, "dinh_dang": "webp"},
              open(ra(ten, ten + ".json"), "w"))


def cat_cot(sheet, o, cot):
    return sheet.crop((0, 0, cot * o, sheet.height))


def nga_xuong(sheet, o, n_khung=6):
    """Hoạt ảnh ngã tạm: khung đứng đầu tiên mỗi hướng, xoay dần quanh bàn chân 0 → 80°, mờ dần.
    Gói HD chưa có tư thế ngã — đây là chỗ trống có nhãn, thay khi có art."""
    out = Image.new("RGBA", (n_khung * o, 8 * o))
    for d in range(8):
        k0 = sheet.crop((0, d * o, o, (d + 1) * o))
        for k in range(n_khung):
            t = k / (n_khung - 1)
            g = k0.rotate(80 * t * (1 if d < 4 else -1), resample=Image.BICUBIC, center=(o / 2, o * 0.95))
            if t > 0.6:
                a = np.array(g); a[..., 3] = (a[..., 3] * (1 - 0.35 * (t - 0.6) / 0.4)).astype(np.uint8); g = Image.fromarray(a)
            out.paste(g, (k * o, d * o))
    return out


def lam_nguoi():
    m = json.load(open(os.path.join(WEB, "magic-runtime", "manifest.json")))
    giap = [a for a in m["armors"] if a["id"] == "cuong_phong"][0]
    o = m["cell"][0]
    neo = m["pivot"]
    sh = {t: Image.open(os.path.join(WEB, "magic-runtime", giap["states"][t])).convert("RGBA") for t in ("idle", "walk", "run", "attack")}
    b = hop_alpha(sh["idle"].crop((0, 0, o, o)))
    ty = CAO["nguoi"] / (b[3] - b[1])
    fps = {t: m["states"][t]["fps"] for t in m["states"]}
    # ⚠ GIỮ TỐC ĐỘ CHƠI của bộ pixel (đi 1,35 · chạy 3,4 m/s): gói HD bước ngắn hơn (đo được chạy
    # ~1,25 m/s), nên tăng NHỊP KHUNG theo cùng hệ số. Sải một chu kỳ = tốc độ × khung ÷ nhịp giữ
    # nguyên ⇒ bàn chân vẫn không trượt; chỉ bước nhanh hơn.
    pixel = json.load(open(os.path.join(GOC, "godot", "assets", "sprites", "hiep_si", "hiep_si.json")))["trang_thai"]
    toc = {}
    for t in ("walk", "run"):
        do = toc_do_chan(sh[t], o, 6, 8, fps[t])                    # px ô / giây ở nhịp gốc
        can = pixel[t]["toc_do_m_s"] * PX_M / ty                     # px ô / giây cần có
        fps[t] = round(fps[t] * can / do, 3)
        toc[t] = can
    tt = {
        "idle": (sh["idle"], 8, fps["idle"], True, None, None),
        "walk": (sh["walk"], 8, fps["walk"], True, None, toc["walk"]),
        "run": (sh["run"], 8, fps["run"], True, None, toc["run"]),
        "attack": (sh["attack"], 8, fps["attack"] * 1.3, False, 4, None),
        "hit": (cat_cot(sh["idle"], o, 3), 3, 10.0, False, None, None),
        "death": (nga_xuong(sh["idle"], o), 6, 6.7, False, None, None),
    }
    ghi_bo("hd_nguoi", tt, o, neo, ty, {}, b[3] - b[1])
    print("người: ty %.4f · đi %.2f m/s @%.1f khung/s · chạy %.2f m/s @%.1f khung/s" % (
        ty, tt["walk"][5] * ty / PX_M, fps["walk"], tt["run"][5] * ty / PX_M, fps["run"]))


def tinh_8_huong(im, o, n_khung=1, nhun=0):
    """Một tranh đứng tĩnh → bảng 8 hướng × n khung. Tranh nhìn sang PHẢI/chính diện; các hướng
    nhìn sang trái lấy bản lật gương. `nhun` > 0: khung đi nhún lên xuống ngần ấy px."""
    out = Image.new("RGBA", (n_khung * o, 8 * o))
    for d, h in enumerate(HUONG):
        anh = ImageOps.mirror(im) if h in ("SW", "W", "NW", "N") else im
        for k in range(n_khung):
            lech = int(round(-nhun * abs(np.sin(np.pi * k / max(1, n_khung))))) if nhun else 0
            out.paste(anh, (k * o + (o - anh.width) // 2, d * o + (o - anh.height) + lech - 4), anh)
    return out


## npc_dan_a = các bà, các cô · npc_dan_b = đàn ông · npc_dan_c = người già (xem BanDoArdhaven.NPC)
NPC = {"npc_tho_ren": "thoren_lun", "npc_co_gai": "hauban_yt", "npc_phap_su": "phapsu_yt",
       "npc_thu_kho": "banrong_yt", "npc_dan_a": "duocnu_yt", "npc_dan_b": "hondon_yt",
       "npc_dan_c": "banrong_yt", "hiep_si_gac": "ronin_canh"}


def lam_npc():
    for bo, tep in NPC.items():
        im = Image.open(os.path.join(WEB, "npcs", tep + ".png")).convert("RGBA")
        im = im.crop(hop_alpha(im, 20))
        o = int(max(im.size) * 1.1) // 2 * 2
        cao = CAO["npc"] * (0.82 if tep == "thoren_lun" else 1.0)
        ty = cao / im.height
        di = tinh_8_huong(im, o, 4, nhun=o * 0.025)
        tt = {"idle": (tinh_8_huong(im, o, 1), 1, 1.0, True, None, None),
              "walk": (di, 4, 8.0, True, None, None)}
        ghi_bo("hd_" + bo, tt, o, [o / 2, o - 4], ty, {"walk": {"toc_do_m_s": 1.35}}, im.height)
        # đi bằng nhún: sải đặt theo tốc độ cũ — tranh tĩnh không có bàn chân để mà trượt


def lam_bo_giap():
    s = open(os.path.join(GOC, "public", "game", "data", "thu_anh.js")).read()
    j = json.loads(s[s.index("{"):s.rindex("}") + 1])
    g = j["o"]["bo_giap"]
    w, h = g["oRong"], g["oCao"]
    sh = Image.open(os.path.join(WEB, "thu", "bo_giap.webp")).convert("RGBA")
    o = int(max(w, h) * 1.15) // 2 * 2
    day = int(round(h * g["neoY"]))

    def hang(r, n=8):
        out = Image.new("RGBA", (n * o, 8 * o))
        for d, hu in enumerate(HUONG):
            for k in range(n):
                c = sh.crop((k * w, r * h, (k + 1) * w, (r + 1) * h))
                if hu in ("SW", "W", "NW", "N"):
                    c = ImageOps.mirror(c)                         # tranh gốc quay mặt sang trái? → xem ghi chú
                out.paste(c, (k * o + (o - w) // 2, d * o + (o - 4 - day)), c)
        return out
    gam, dung, chay = hang(0), hang(1), hang(2)
    ty = CAO["bo_giap"] / (h * g["thanCao"])
    tt = {"idle": (dung, 8, 6.0, True, None, None),
          "walk": (chay, 8, 10.0, True, None, None),
          "attack": (gam, 8, 14.0, False, 4, None),
          "hit": (cat_cot(dung, o, 2), 2, 9.0, False, None, None),
          "death": (nga_xuong(dung, o, 5), 5, 7.0, False, None, None)}
    ghi_bo("hd_bo_giap", tt, o, [o / 2, o - 4], ty, {"walk": {"toc_do_m_s": 0.7}}, h * g["thanCao"])


def lam_axie():
    s = open(os.path.join(GOC, "public", "game", "data", "chi_anh.js")).read()
    j = json.loads(s[s.index("{"):s.rindex("}") + 1])
    bang = {}
    for aid, g in j["o"].items():
        if not os.path.exists(os.path.join(WEB, "chimera", aid + ".webp")):
            continue
        w, h = g["nhoRong"], g["nhoCao"]
        for hau in ("", "_r", "_b", "_h"):
            shutil.copy(os.path.join(WEB, "chimera", aid + hau + ".webp"), ra("axie", aid + hau + ".webp"))
        bang[aid] = {"o": [w, h], "neo": [w / 2, h * g["neoY"]], "ty": CAO["axie"] / (h * g["thanCao"]),
                     "trang_thai": {"idle": {"tep": "", "cot": j["cotNho"], "khung": j["nKhung"], "fps": 9.0, "lap": True},
                                    "run": {"tep": "_r", "cot": j["cotQuay"], "khung": 12, "fps": 14.0, "lap": True},
                                    "buff": {"tep": "_b", "cot": j["cotQuay"], "khung": 12, "fps": 12.0, "lap": False},
                                    "hit": {"tep": "_h", "cot": 4, "khung": 8, "fps": 19.2, "lap": False}}}
    json.dump(bang, open(ra("axie", "axie_hd.json"), "w"), indent=1)


if __name__ == "__main__":
    if os.path.isdir(RA):
        shutil.rmtree(RA)
    lam_dat()
    lam_canh()
    lam_nguoi()
    lam_npc()
    lam_bo_giap()
    lam_axie()
    tong = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(RA) for f in fs)
    print("xong: %s (%.1f MB)" % (RA, tong / 1e6))
