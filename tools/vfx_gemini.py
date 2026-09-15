#!/usr/bin/env python3
"""Nhập một bảng khung hiệu ứng do Gemini sinh — BÓC NỀN CARO rồi đóng thành atlas.

    python3 tools/vfx_gemini.py <ảnh> <id> --luoi 3,3 [--o 384] [--neo 0.12,0.5]
                                [--fps 18] [--canh trai|tam|o] [--xem]

QUAN HỆ VỚI HAI TỆP ĐÃ CÓ — đọc trước khi tưởng đây là bản sao:

  · `tools/cat_luoi_gem.py`  cắt một tấm lưới Gemini ra N SPRITE RỜI (vật nhỏ iso, vũ khí,
    icon), tách nền MAGENTA phẳng, ghi bảng neo. Đầu ra là nhiều tệp.
  · `tools/vfx_meowa.py`      nhập gói Meowa đã CÓ SẴN alpha thật.
  · tệp này               đóng một BẢNG KHUNG thành MỘT atlas cho `VFX_ATLAS_DEFS`: căn chụm
    các khung về một gốc, đo neo, in sẵn dòng để dán. Đầu ra là một tệp `atlas.png`.

  Và nó gánh thêm một việc mà hai tệp kia không cần: **bóc nền CARO**. Xem ngay dưới.
  ⇒ Muốn nền phẳng thì dùng `--nen "#ff00ff"`, và lúc đó nó mượn ĐÚNG phép đo sắc tím của
    `cat_luoi_gem.py` chứ không dựng phép tách thứ hai.

Khác `vfx_meowa.py` ở đúng một chỗ, và chỗ đó là cả lý do tệp này tồn tại:

⚠ GEMINI KHÔNG XUẤT ĐƯỢC NỀN TRONG SUỐT. Nó VẼ cái lưới ô caro — thứ mà trình sửa ảnh dùng để
  BÁO HIỆU vùng trong suốt — thành điểm ảnh thật. Đo trên ba tấm đầu tiên: `alpha = 0` chiếm
  **0,0%** ở cả ba, trong khi ngưỡng nghiệm thu là ≥25%. Cắm thẳng vào game là dán một hình chữ
  nhật xám kín màn hình. Đây đúng là cách hai tấm trùm `boss_hacphong` / `boss_tinhhoa` đã chết.

  Nó KHÔNG phải lỗi không cứu được: lưới caro là một sóng vuông đều, hai tông xám, chu kì cố
  định. Biết ba con số đó thì tách ngược ra được — và tách được cả vùng BÁN TRONG SUỐT, thứ mà
  phép "xoá màu nền" thông thường vứt đi mất.

CÁCH TÁCH — un-composite, không phải "xoá màu"

  Điểm ảnh nhìn thấy:  p = α·F + (1−α)·B      (B = ô caro tại chỗ đó, F = màu thật của hiệu ứng)

  ① Biên độ lưới còn lại ở mỗi chỗ nói thẳng ra α: nền trần thì hai tông chênh nhau trọn vẹn
     (g2−g1); dưới lớp khói mờ thì chênh ít đi; dưới nét đặc thì mất hẳn.
         α = 1 − (biên độ đo được) / (g2 − g1)
  ② Có α rồi thì lấy lại màu thật:   F = (p − (1−α)·B) / α

  ⚠ Phép "xoá mọi điểm ảnh gần màu xám nền" thì làm được ① ở mức nhị phân và KHÔNG làm được ②.
  Hậu quả nhìn thấy được: vành khói mờ của Force Wave và vòng sáng tan của Triple Shot — những
  chỗ tác giả CỐ Ý vẽ mờ — sẽ bị xoá trắng hoặc giữ nguyên cả ô caro bên trong.

⚠ VÀ ĐỪNG CĂN LẠI TỪNG KHUNG VỀ GIỮA Ô. Gemini xếp hình trong ô một cách tuỳ tiện, nhưng một
  nhát chém thì các khung PHẢI chụm về một điểm — chỗ bàn tay. Căn theo tâm khối là mỗi khung
  một gốc quay, và trong màn nó đọc ra "lưỡi kiếm rung" chứ không ra một nhát quét. `--canh trai`
  (mặc định) chụm mép TRÁI, đúng cho quạt chém mở sang phải; `--canh tam` cho vụ nổ đối xứng;
  `--canh o` giữ nguyên chỗ Gemini đặt, để so.

⚠ CHẠY XONG PHẢI NHÌN. `--xem` xuất thêm một dải phim và một tấm chồng-mọi-khung. Ba lỗi hình
  của đợt trang bị chỉ lộ khi chụp ra xem, không lỗi nào lộ khi đọc mã.
"""
import argparse, os, sys
import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None


def box_mean(a, r):
    """Trung bình cửa sổ (2r+1)² bằng ảnh tích luỹ — O(1) mỗi điểm ảnh, không cần scipy."""
    p = np.pad(a.astype(np.float64), r + 1, mode='edge')
    c = p.cumsum(0).cumsum(1)
    h, w = a.shape
    n = 2 * r + 1
    y0, x0 = np.arange(h), np.arange(w)
    Y0, X0 = np.meshgrid(y0, x0, indexing='ij')
    s = (c[Y0 + n, X0 + n] - c[Y0, X0 + n] - c[Y0 + n, X0] + c[Y0, X0])
    return s / (n * n)


def do_caro(L, S):
    """Đo hai tông xám và chu kì ô caro. Trả (g1, g2, s) hoặc None nếu không phải nền caro.

    Không nhận tham số từ dòng lệnh: ba tấm đầu tiên đã ra ba bộ số KHÁC NHAU (một tấm dùng
    43/96, tấm khác dùng tông sáng hơn hẳn), nên chép cứng là đúng một tấm chạy được.
    """
    xam = L[(S < 10)]
    if xam.size < L.size * 0.05:
        return None
    h, _ = np.histogram(xam, bins=256, range=(0, 256))
    # hai đỉnh cao nhất cách nhau ít nhất 12 mức — hai tông của lưới
    dinh = np.argsort(-h)
    g1 = int(dinh[0])
    g2 = next((int(v) for v in dinh[1:] if abs(v - g1) >= 12), None)
    if g2 is None:
        return None
    g1, g2 = min(g1, g2), max(g1, g2)

    # chu kì: độ dài các đoạn cùng tông trên những hàng thuần nền
    nen = (S < 10) & ((np.abs(L - g1) < 9) | (np.abs(L - g2) < 9))
    rong = []
    for y in range(0, L.shape[0], max(1, L.shape[0] // 60)):
        if nen[y].mean() < 0.9:
            continue
        lop = (np.abs(L[y] - g2) < np.abs(L[y] - g1)).astype(np.int8)
        d = np.flatnonzero(np.diff(lop))
        if len(d) > 4:
            rong += list(np.diff(d))
    if not rong:
        return None
    s = int(np.median(rong))
    return (g1, g2, s) if 6 <= s <= 80 else None


def tach_nen(rgb, g1, g2, s, xam_tol=(12, 10)):
    """Bóc lưới caro ra khỏi tranh. Trả (F float HxWx3, alpha float HxW 0..1)."""
    L = rgb.mean(2)
    S = rgb.max(2) - rgb.min(2)
    bien0 = float(g2 - g1)

    # ① BIÊN ĐỘ CÒN LẠI ⇒ α.  Cửa sổ một chu kì (2s) luôn chứa cả hai tông, nên hiệu giữa
    # "trung bình nửa sáng" và "trung bình nửa tối" trong cửa sổ đó chính là biên độ lưới.
    # Phân loại nửa sáng/nửa tối bằng chính khoảng cách tới hai tông — không cần biết gốc lưới,
    # nên không có bước dò pha nào để mà dò sai.
    sang = (np.abs(L - g2) <= np.abs(L - g1)).astype(np.float64)
    r = max(2, s)
    ms = box_mean(sang, r)
    mLs = box_mean(L * sang, r)
    mLt = box_mean(L * (1 - sang), r)
    with np.errstate(divide='ignore', invalid='ignore'):
        tbS = np.where(ms > 0.02, mLs / np.maximum(ms, 1e-9), np.nan)
        tbT = np.where(1 - ms > 0.02, mLt / np.maximum(1 - ms, 1e-9), np.nan)
    bien = np.abs(np.nan_to_num(tbS - tbT, nan=0.0))
    al = np.clip(1.0 - bien / bien0, 0.0, 1.0)

    # ② BA CỬA ÉP ĐẶC. Biên độ chỉ nói được chuyện "còn thấy lưới"; ba loại điểm ảnh dưới đây
    # KHÔNG THỂ là nền dù biên độ quanh nó có ra bao nhiêu, và bỏ sót chúng là thủng nét.
    ep = (S > 26) | (L > g2 + 26) | (L < g1 - 22)
    al[ep] = 1.0

    # ③ PHÉP THỬ TẠI CHỖ THẮNG PHÉP ĐO THEO CỬA SỔ.  Biên độ ở ① đo trên một cửa sổ, nên SÁT
    # MÉP tranh cửa sổ ôm cả nét lẫn nền: biên độ tụt, α vọt lên, và một mảng ô caro nguyên vẹn
    # lọt vào kết quả. Đo được ở lượt chạy đầu trên tấm Twisting Slash: bốn mảng caro bám quanh
    # rìa quạt chém ở khung 5·6·8·9 — nhìn ra ngay khi chụp dải phim, không con số nghiệm thu
    # nào bắt được (alpha=0 vẫn 83,8%, độ sáng vẫn 120,7).
    #
    # Một điểm ảnh MANG ĐÚNG một trong hai tông xám và không có màu thì nó LÀ nền, bất kể cửa
    # sổ quanh nó đo ra gì. Phép thử tại chỗ này không sai ở rìa được, vì nó không nhìn ra xa.
    # ⚠ Nó chỉ an toàn khi tranh không có vùng xám trung tính cùng tông — ba tấm hiện tại là
    # xanh thép / ô liu / ngọc lam nên đều chromatic hoặc sáng hơn hẳn. Gói nào có khói xám
    # thật thì phải nới `--xam` xuống.
    nen_ro = (S < xam_tol[0]) & ((np.abs(L - g1) < xam_tol[1]) | (np.abs(L - g2) < xam_tol[1]))
    al[nen_ro & ~ep] = 0.0

    # ④ Ô CARO LẺ NẰM TRƠ TRỌI.  Sau ③ vẫn còn lấm tấm: những ô caro mà nén ảnh của Gemini đẩy
    # lệch khỏi hai tông chuẩn vài mức, nên phép thử tại chỗ không nhận ra. Nới ngưỡng màu thì
    # chỉ vớt thêm được 3% mà bắt đầu ăn vào rìa mềm của chính tranh (đo: 83,2 → 86,5% khi nới
    # gấp ba, phần lớn là rìa) — nên đừng chữa bằng màu, chữa bằng CHỖ ĐỨNG.
    #
    # Nét thật thì có hàng xóm; ô caro sót thì đứng một mình giữa vùng rỗng. Và nét thật ở ba
    # tấm này đều CÓ MÀU (xanh thép · ô liu · ngọc lam), còn ô caro thì trung tính. Hai vế cộng
    # lại nên luật này không đụng tới vệt khói mờ có màu — thứ mà tác giả cố ý vẽ.
    lan = box_mean(al, 3)
    al[(S < 34) & (lan < 0.35) & (al < 0.9)] = 0.0

    # ⑤ LÀM MƯỢT ĐÚNG VÙNG NỬA VỜI — chỗ ③ xử quá tay.
    #
    # ③ giết α ở mọi điểm ảnh mang đúng tông nền. Trong vùng BÁN TRONG SUỐT (quầng sáng, vành
    # khói, vòng tan) thì ô caro TỐI vẫn nằm gần tông nền dù đã bị lớp mờ phủ lên, còn ô SÁNG
    # thì không — nên ③ giết một nửa số ô và chừa một nửa. Thứ hiện ra không phải nền sót, mà là
    # **một lưới LỖ THỦNG** đúng tần số ô caro. Đo trên hai tấm Force Wave và Triple Shot: quầng
    # sáng và vành tan thủng lỗ chỗ, còn nét đặc thì sạch.
    #
    # α thật của một lớp khói biến thiên MƯỢT; nhiễu do lưới thì biến thiên đúng bước ô. Nên chỉ
    # cần trung bình lại trong bán kính nửa ô là lưới tan còn hình bao giữ nguyên.
    # ⚠ CHỈ làm ở vùng nửa vời. Mượt cả tấm là nhoè hết rìa nét đặc — mà rìa sắc mới là thứ
    # phân biệt art vẽ tay với một vệt bôi.
    muot = box_mean(al, max(2, s // 2))
    # ⚠ Gate theo α ĐÃ LÀM MƯỢT, không theo α gốc. Lỗ mà ③ đục ra đang nằm ở đúng 0, nên gate
    # `al > 0.04` loại nó ra khỏi chính phép vá dành cho nó — đo được: lưới lỗ vẫn nguyên sau
    # lượt vá đầu. Nhìn vào lân cận thì một cái lỗ giữa vùng mờ vẫn đọc ra "vùng mờ".
    nua = (muot > 0.05) & (muot < 0.95)
    al[nua] = muot[nua]

    # ⑤ LẤY LẠI MÀU THẬT.  B = tông xám GẦN NHẤT của chính điểm ảnh đó.
    B = np.where(np.abs(L - g2) <= np.abs(L - g1), float(g2), float(g1))[..., None]
    a3 = al[..., None]
    F = np.where(a3 > 0.02, (rgb - (1 - a3) * B) / np.maximum(a3, 1e-6), rgb)
    return np.clip(F, 0, 255), al


def hop_sat(al, nguong=0.06):
    ys, xs = np.nonzero(al > nguong)
    if len(xs) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('anh'); ap.add_argument('id')
    ap.add_argument('--luoi', required=True, help='cols,rows của tấm nguồn')
    ap.add_argument('--o', type=int, default=384, help='cạnh ô đích')
    ap.add_argument('--neo', default='0.12,0.5', help='fx,fy — chỗ tranh cắm vào thế giới')
    ap.add_argument('--fps', type=int, default=18)
    ap.add_argument('--canh', default='trai', choices=['trai', 'tam', 'o'])
    ap.add_argument('--bo', default='', help='bỏ các khung này, vd "8" hoặc "4,8" (0-based)')
    ap.add_argument('--xam', type=float, default=12, help='ngưỡng bão hoà coi là nền trần')
    ap.add_argument('--xam-l', type=float, default=10, help='sai số độ sáng quanh hai tông nền')
    ap.add_argument('--nen', default='', help='nền là MỘT MÀU phẳng, vd "#ff00ff" — đường nên dùng, xem chú thích')
    ap.add_argument('--nen-toi', type=float, default=26, help='dưới khoảng cách này coi là nền')
    ap.add_argument('--nen-xa', type=float, default=90, help='trên khoảng cách này coi là đặc')
    ap.add_argument('--xem', action='store_true', help='xuất thêm dải phim + tấm chồng để nhìn')
    ap.add_argument('--ra', default='', help='thư mục đích (mặc định public/game/assets/vfx/<id>)')
    a = ap.parse_args()

    goc = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
    im = Image.open(a.anh).convert('RGB')
    rgb = np.asarray(im, dtype=np.float64)
    H, W, _ = rgb.shape
    L, S = rgb.mean(2), rgb.max(2) - rgb.min(2)

    if a.nen:
        # ── ĐƯỜNG NGẮN: nền là MỘT MÀU PHẲNG ────────────────────────────────────────────
        # Đây là đường NÊN dùng, và nó bắt đầu từ prompt chứ không từ đây: bảo Gemini vẽ trên
        # nền một màu đặc thay vì lưới ô caro. Lý do đo được — lưới caro để lại một lớp nhiễu
        # ĐÚNG TẦN SỐ Ô ở mọi vùng bán trong suốt (quầng sáng, vành khói, vòng tan), và không
        # có ngưỡng nào tách nổi nó khỏi chính lớp mờ mà tác giả cố ý vẽ: hạ tay thì sót lưới,
        # mạnh tay thì thủng lỗ. Nền phẳng thì phép un-composite là một phép trừ đúng nghĩa.
        # Chọn màu xa hẳn bảng màu hiệu ứng — hồng cánh sen `#FF00FF` xa cả xanh, ô liu lẫn
        # ngọc lam của ba tấm đầu.
        B0 = np.array([int(a.nen.lstrip('#')[i:i+2], 16) for i in (0, 2, 4)], dtype=np.float64)
        # ⚠ VỚI MAGENTA thì ĐO SẮC TÍM, đừng đo khoảng cách RGB — luật này `tools/cat_luoi_gem.py`
        # đã đo và trả giá trước: Gemini vẽ bóng đổ bằng magenta SẪM, nên lọc theo độ sáng hay
        # theo khoảng cách tới màu nền CHUẨN sẽ để lại một vũng tím dưới chân vật. Sắc tím
        # `(R+B)/2 − G` thì nền ra ~210 còn vật liệu ra 20-24, một khoảng trống rộng để đặt ngưỡng.
        # Dùng chung con số của tệp kia (NGUONG_TIM 120) để hai đường ống không lệch nhau.
        if abs(B0[0] - 255) < 40 and abs(B0[2] - 255) < 40 and B0[1] < 60:
            d = (rgb[..., 0] + rgb[..., 2]) / 2.0 - rgb[..., 1]
            al = 1.0 - np.clip((d - a.nen_toi) / max(1.0, 120.0 - a.nen_toi), 0, 1)
        else:
            d = np.linalg.norm(rgb - B0, axis=2)
            al = np.clip((d - a.nen_toi) / max(1.0, a.nen_xa - a.nen_toi), 0, 1)
        a3 = al[..., None]
        F = np.clip(np.where(a3 > 0.02, (rgb - (1 - a3) * B0) / np.maximum(a3, 1e-6), rgb), 0, 255)
        print('nền phẳng %s · alpha=0 chiếm %.1f%%' % (a.nen, (al < 0.03).mean() * 100))
    else:
        caro = do_caro(L, S)
        if caro is None:
            print('!! Không nhận ra lưới caro — tấm này có thể ĐÃ trong suốt sẵn,')
            print('   hoặc nền là một màu phẳng (dùng --nen "#ff00ff").')
            return 2
        g1, g2, s = caro
        print('lưới caro: hai tông %d / %d · ô %dpx' % (g1, g2, s))
        F, al = tach_nen(rgb, g1, g2, s, (a.xam, a.xam_l))

    cot, hang = (int(v) for v in a.luoi.split(','))
    cw, ch = W // cot, H // hang
    bo = {int(v) for v in a.bo.split(',') if v.strip() != ''}

    # ── cắt từng ô, đo hộp bao ────────────────────────────────────────────────────────────
    khung = []
    for i in range(cot * hang):
        if i in bo:
            continue
        cx, cy = (i % cot) * cw, (i // cot) * ch
        aa = al[cy:cy + ch, cx:cx + cw]
        ff = F[cy:cy + ch, cx:cx + cw]
        hb = hop_sat(aa)
        if hb is None:
            print('  khung %d: TRỐNG — bỏ qua' % i)
            continue
        khung.append({'i': i, 'a': aa, 'f': ff, 'hb': hb})
        x0, y0, x1, y1 = hb
        print('  khung %d: nội dung %dx%d tại (%d,%d)  đặc %.1f%%'
              % (i, x1 - x0, y1 - y0, x0, y0, aa[y0:y1, x0:x1].mean() * 100))
    if not khung:
        print('!! Không khung nào có nội dung.')
        return 2

    # ── căn: mọi khung chụm về MỘT gốc, rồi mới thu về ô đích ─────────────────────────────
    # Bề rộng/cao cần chứa = khoảng vươn xa nhất so với gốc, lấy chung cho mọi khung.
    def goc_khung(k):
        x0, y0, x1, y1 = k['hb']
        if a.canh == 'trai':  return x0, (y0 + y1) / 2.0
        if a.canh == 'tam':   return (x0 + x1) / 2.0, (y0 + y1) / 2.0
        return 0.0, 0.0                                    # 'o' — giữ nguyên chỗ trong ô

    tr = bl = tn = du = 0.0
    for k in khung:
        gx, gy = goc_khung(k)
        x0, y0, x1, y1 = k['hb']
        tr = max(tr, gx - x0); bl = max(bl, x1 - gx)
        tn = max(tn, gy - y0); du = max(du, y1 - gy)
    Wc, Hc = tr + bl, tn + du
    ti = a.o / max(Wc, Hc) if max(Wc, Hc) > 0 else 1.0
    print('khung chung %.0fx%.0f px nguồn → thu %.3f lần về ô %d' % (Wc, Hc, ti, a.o))

    # ── dựng atlas: 8 khung một hàng, đúng quy ước bộ atlas đang chạy ─────────────────────
    n = len(khung)
    ac, ar = min(8, n), (n + 7) // 8
    at = Image.new('RGBA', (ac * a.o, ar * a.o), (0, 0, 0, 0))
    neoFx, neoFy = (float(v) for v in a.neo.split(','))
    # Điểm neo trong ô đích: đặt sao cho GỐC CĂN của mọi khung rơi đúng vào đó.
    nx, ny = a.o * neoFx, a.o * neoFy

    tam_lech = []
    for j, k in enumerate(khung):
        rgba = np.dstack([k['f'], k['a'] * 255.0]).astype(np.uint8)
        src = Image.fromarray(rgba, 'RGBA')
        gx, gy = goc_khung(k)
        w2, h2 = max(1, int(round(src.width * ti))), max(1, int(round(src.height * ti)))
        src = src.resize((w2, h2), Image.LANCZOS)
        ox = int(round((j % 8) * a.o + nx - gx * ti))
        oy = int(round((j // 8) * a.o + ny - gy * ti))
        at.alpha_composite(src, (ox, oy))
        tam_lech.append((k['i'], gx * ti, gy * ti))

    ra = a.ra or os.path.join(goc, 'public/game/assets/vfx', a.id)
    os.makedirs(ra, exist_ok=True)
    p = os.path.join(ra, 'atlas.png')
    at.save(p, optimize=True)

    # ── nghiệm thu: bốn con số, in ra để khỏi phải nhớ chạy riêng ─────────────────────────
    q = np.asarray(at, dtype=np.float64)
    qa, qrgb = q[..., 3], q[..., :3].mean(2)
    co = qa > 16
    print('\n── nghiệm thu ──')
    print('  alpha=0      %5.1f%%   (cần ≥25%%)   %s' % ((qa < 8).mean() * 100, 'OK' if (qa < 8).mean() >= .25 else 'ĐỎ'))
    sang = qrgb[co].mean() if co.any() else 0
    print('  độ sáng      %5.1f    (cần >40)    %s' % (sang, 'OK' if sang > 40 else 'ĐỎ'))
    print('  lệch chuẩn   %5.3f    (<0,12 thì mới cần nâng sáng)' % (qrgb / 255).std())
    print('  tệp          %s  (%d KB, %dx%d)' % (p, os.path.getsize(p) // 1024, at.width, at.height))

    print('\n── dán vào VFX_ATLAS_DEFS (game.js) ──')
    # ⚠ `neoR` LÀ TẦM VƯƠN TỪ ĐIỂM NEO, KHÔNG PHẢI NỬA Ô.  Chỗ gọi tính tỉ lệ vẽ bằng
    # `R / neoR`, nên neoR phải là "trong tranh, bao xa kể từ neo thì tới mép vùng ăn đòn".
    # Với quạt chém căn mép trái, neo nằm sát rìa trái nên tầm vươn là gần trọn bề rộng ô —
    # lấy nửa ô là vẽ to gấp đôi. Đo được ở lượt cắm đầu: đặc tả 125px, vẽ ra 211px.
    neoR = (a.o - nx) if a.canh == 'trai' else (a.o * 0.5)
    print("  %s: { k:1, cols:%d, rows:%d, frameW:%d, frameH:%d, frames:%d, fps:%d, anchorX:%.1f, anchorY:%.1f, neoR:%.1f },"
          % (a.id, ac, ar, a.o, a.o, n, a.fps, nx, ny, neoR))
    print('\n── dán vào CHIEU_TRANH (game.js) ──')
    print("  <mã chiêu>: { atlas:'%s', xoay:true }," % a.id)
    print('  ⚠ và GỠ dòng tương ứng trong SECT_VFX / VH_VFX — giữ cả hai là chồng hai lớp lệch nhau.')

    if a.xem:
        d = os.path.join(goc, 'public/game/assets/vfx', a.id) if not a.ra else ra
        # dải phim trên nền tối, đúng tông bản đồ đêm
        film = Image.new('RGB', (at.width, at.height), (22, 26, 34))
        film.paste(at, (0, 0), at)
        film.save(os.path.join(d, '_xem_dai.png'))
        # chồng mọi khung — chụm đúng thì các khung phải xoè ra từ MỘT điểm
        ch2 = Image.new('RGB', (a.o, a.o), (22, 26, 34))
        for j in range(n):
            ch2.paste(at.crop(((j % 8) * a.o, (j // 8) * a.o, (j % 8 + 1) * a.o, (j // 8 + 1) * a.o)).convert('RGBA'),
                      (0, 0), at.crop(((j % 8) * a.o, (j // 8) * a.o, (j % 8 + 1) * a.o, (j // 8 + 1) * a.o)))
        ch2.save(os.path.join(d, '_xem_chong.png'))
        print('\n  xem: %s/_xem_dai.png · _xem_chong.png' % d)
    return 0


if __name__ == '__main__':
    sys.exit(main())
