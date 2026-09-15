#!/usr/bin/env python3
"""Nướng CHẤT LIỆU cho tấm bản đồ thế giới — cắt từ art chính chủ Axie.

    python3 tools/bando/nuong_nen_tg.py [thư mục ra]
    Cần: pillow. Nguồn: kho `axieinfinity/axie-origins-asset-kit` (2,2 GB, clone riêng).

⚠ VÌ SAO CẮT MẢNG TO CHỨ KHÔNG LÀM VIÊN LÁT LIỀN MẠCH.
Chủ dự án đưa ảnh bản đồ thế giới của một MMO khác: một tấm VẼ TAY có núi, sông, bờ biển. Thứ
làm nó đẹp không phải chất liệu mịn mà là **đồ vật vẽ sẵn nằm trên mặt đất** — rặng thông, tảng
đá, khúc sông. Nếu cắt một ô cỏ phẳng 64px rồi lát thì được một tấm thảm, không được một tấm bản
đồ. Nên ở đây cắt hẳn **mảng 384px có sẵn cây cối**, rồi cắt theo đa giác của vùng.

⚠ VÀ VÌ THẾ MẢNG PHẢI VẼ Ở CỠ THẬT, KHÔNG CO CHO VỪA VÙNG. Vùng trên bản đồ chỉ rộng 80-160px;
co một mảng 384px xuống cho vừa thì rặng thông thành mấy chấm xanh. Vẽ 1:1 rồi kẹp theo đa giác
⇒ cây giữ đúng cỡ trên cả tấm, đúng cách một tấm bản đồ vẽ tay hoạt động. Mỗi vùng lệch gốc theo
hạt riêng nên hai vùng cạnh nhau không ra hai bản sao.

Nguồn (đo bằng cách phủ lưới 100px lên chính tranh rồi soi — đừng dò bằng phân loại màu):

    map_chapter_1  0-500    đồng cỏ sáng, đường mòn, bụi
                   580-1080 rừng thông + gốc cây thần
                   1180-1700 vùng ĐÁ CHẾT xám, cây trụi
    map_chapter_2  0-430    đầm nông, lá súng, sen hồng
                   240-940  mặt HỒ xanh + bờ cát
                   1200-1740 rừng thông sẫm ngả lam

⚠ HAI CHẤT LIỆU KHÔNG CÓ TRONG KHO: **tuyết** và **tro**. Chúng suy ra từ mảng có sẵn bằng phép
dời SẮC (giữ nguyên độ tương phản và mọi nét vẽ), không phải tô đè một mảng màu — tô đè thì mất
sạch nét và ra đúng cái lỗi "mặt phẳng sáng đều không mốc thì đọc ra khoảng không" đã ghi ở khối
map isometric. Riêng tuyết phải GIỮ thân cây sẫm làm mốc tương phản, nếu không Bird Tribe
Heights lại chụp ra một khoảng trời có mây như lần trước.
"""
import os, sys
from PIL import Image, ImageEnhance

KHO = '/home/user/axieinfinity/axie-origins-asset-kit/Assets/OriginsKit/PvE/UI/Chapter'
RA = sys.argv[1] if len(sys.argv) > 1 else 'public/game/assets/bando'
O = 384                      # cạnh mảng xuất ra

# tên → (tệp nguồn, x, y, w, h)
# ⚠ `rung` DỪNG Ở x=920 LÀ CÓ LÝ DO: từ 925 trở đi là một cái **cổng torii đỏ**. Nó vẽ đẹp và
# rất dễ ăn vào khung cắt, nhưng torii là dấu hiệu Nhật Bản đặc trưng — dán nó lên bản đồ một
# thế giới dark-fantasy phương Tây thì lạc quẻ ngay, và nó lại là thứ BẮT MẮT NHẤT trong mảng
# nên ai nhìn cũng thấy trước tiên. Lượt cắt đầu dính nguyên cái cổng.
#
# ⚠ `nuoc` phải là MẶT NƯỚC THẬT, và mất hai lượt mới ra. Lượt đầu cắt (250,150,560,380) ăn cả
# bờ cát lẫn cây cầu đá; lượt hai (300,205,320,190) vẫn dính một mũi đất có hàng thông ở góc
# dưới-trái — mà `bien` suy từ chính nó, nên cả mặt biển của tấm bản đồ mọc lên mấy cái cây.
# Lượt ba tôi vẫn chấm tay và VẪN dính ngọn thông. Nay DÒ BẰNG MÁY: quét mọi cửa sổ, chấm theo
# khoảng cách màu tới mẫu lòng hồ thật (98,155,146) — ra (222,192) 260×110, thuần 98,4%.
# ⚠ Và vị từ đầu tiên tôi viết (`b >= g`) LOẠI ĐÚNG MẶT HỒ: nước ở đây là lam-LỤC, g > b. Dò
# màu thì phải lấy mẫu từ chính tranh trước, đừng suy từ chữ "nước thì phải xanh lam".
CAT = {
    'dongco':  (1, 10,  40, 470, 470),
    'rung':    (1, 560, 20, 360, 360),
    'dahoang': (1, 1190, 30, 500, 500),
    'dam':     (2, 5,   10, 420, 420),
    'nuoc':    (2, 0, 0, 0, 0),   # QUÉT ra lúc chạy — xem _timNuoc()
    'rungtham':(2, 1210, 30, 500, 500),
    # CẦU ĐÁ — thứ duy nhất trong cả hai tấm do NGƯỜI dựng. Dùng làm chất liệu cho thị trấn:
    # một huy hiệu có công trình đọc ra "chỗ có người ở" ngay, mà không phải vẽ thêm gì.
    'thanh':   (2, 215,  45, 300, 200),
    # ĐƯỜNG MÒN — dải nhạt uốn qua đồng cỏ, cho Lối Mòn Corran.
    'duong':   (1, 100, 120, 340, 340),
}


def _mo(i):
    return Image.open(os.path.join(KHO, 'map_chapter_%d.png' % i)).convert('RGB')


def _doiSac(im, dR, dG, dB, sang=1.0, bao=1.0):
    """Dời SẮC nhưng giữ nét: nhân từng kênh rồi chỉnh sáng/bão hoà, không tô đè."""
    r, g, b = im.split()
    r = r.point(lambda v: min(255, int(v * dR)))
    g = g.point(lambda v: min(255, int(v * dG)))
    b = b.point(lambda v: min(255, int(v * dB)))
    out = Image.merge('RGB', (r, g, b))
    if sang != 1.0: out = ImageEnhance.Brightness(out).enhance(sang)
    if bao != 1.0:  out = ImageEnhance.Color(out).enhance(bao)
    return out


def _timNuoc(im):
    """Quét tìm cửa sổ LỚN NHẤT không có một chiếc lá nào. Trả (x, y, w, h).

    ⚠ ĐÂY LÀ LƯỢT THỨ NĂM CHO ĐÚNG MỘT MẢNG NƯỚC, ghi lại vì mỗi lượt sai một kiểu khác:
      1-3. chấm toạ độ bằng mắt trên ảnh có lưới → lượt nào cũng còn ngọn thông hoặc mép bờ.
      4.   dò bằng máy nhưng vị từ viết là `b >= g` — mà nước ở tranh này là lam-LỤC (98,155,146),
           nên nó LOẠI ĐÚNG MẶT HỒ và trả về một khúc sông trong rừng.
      5.   dò đúng màu, ra khung 98,4% nước — rồi viết thêm một phép "co cho sạch" cắt qua lại
           hai phía và kẹt luôn vào dải có cây: 260×30, lá 34%.
    Bài học: **98% nghe như đã xong, nhưng thứ người chơi thấy là cái 2% kia** — một cây thông
    mọc giữa biển. Nên tiêu chí phải là KHÔNG CÓ LÁ, không phải "phần lớn là nước".
    """
    import numpy as np
    a = np.asarray(im.convert('RGB')).astype(np.int16)
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    # ⚠ LƯỢT SÁU: "không có lá" KHÔNG có nghĩa là "nước". Tiêu chí chỉ-loại-lá chọn trúng một
    # mảng ĐƯỜNG MÒN nhạt (45% ngả lục sau khi nướng, vì mép cỏ hai bên lọt vào). Phải đòi cả
    # hai vế: đúng màu lòng hồ VÀ không một chiếc lá.
    # ⚠ LƯỢT BẢY: gộp hai tiêu chí thành một mặt nạ thì KHÔNG cửa sổ nào qua nổi — mặt hồ có gợn
    # sáng lệch màu quá 40, nên "100% đúng màu" là điều kiện không tồn tại. Hai tiêu chí phải
    # hỏi RIÊNG, và ngưỡng của chúng khác hẳn nhau:
    #   · LÁ  → phải bằng 0 tuyệt đối (một chiếc lá là một cái cây mọc giữa biển)
    #   · MÀU → cho phép sai số, gợn nước là chuyện bình thường của mặt hồ
    REF = np.array([98, 155, 146], np.int16)               # màu lòng hồ, lấy mẫu từ chính tranh
    # ⚠ LƯỢT TÁM, VÀ ĐÂY MỚI LÀ LỖI GỐC CỦA CẢ BỐN LƯỢT TRƯỚC: vị từ "lá" viết `g > b + 8` bắt
    # LUÔN CẢ MẶT NƯỚC. Lòng hồ là (98,155,146) — lục chỉ hơn lam đúng 9. Tức mọi phép đo "còn
    # bao nhiêu lá" từ đầu tới giờ đều đang đếm chính cái hồ, và mọi cửa sổ đều trượt.
    # Lá thật thì lam THẤP HẲN: (33,70,14) — lục hơn lam 56. Ngưỡng đúng là 30, không phải 8.
    la = ((g > r + 18) & (g > b + 30)).astype(np.int32)
    nuoc = (np.sqrt(((a - REF) ** 2).sum(2)) <= 46).astype(np.int32)
    iiN = np.pad(nuoc.cumsum(0).cumsum(1), ((1, 0), (1, 0)))
    ii = np.pad(la.cumsum(0).cumsum(1), ((1, 0), (1, 0)))
    H, W = la.shape
    for w, h in [(420, 240), (360, 200), (300, 170), (260, 140), (220, 120), (180, 100)]:
        if w >= W or h >= H: continue
        for y in range(0, H - h, 4):
            for x in range(0, W - w, 4):
                if ii[y+h, x+w] - ii[y, x+w] - ii[y+h, x] + ii[y, x] != 0: continue
                if (iiN[y+h, x+w] - iiN[y, x+w] - iiN[y+h, x] + iiN[y, x]) / (w*h) < 0.90: continue
                return x, y, w, h
    raise SystemExit('không tìm được mảng nước sạch lá')


def main():
    os.makedirs(RA, exist_ok=True)
    src = {1: _mo(1), 2: _mo(2)}
    ra = {}
    for ten, (n, x, y, w, h) in CAT.items():
        if ten == 'nuoc':
            x, y, w, h = _timNuoc(src[n])
            print('  (nuoc: quét ra (%d,%d) %dx%d — không một chiếc lá)' % (x, y, w, h))
        im = src[n].crop((x, y, x + w, y + h)).resize((O, O), Image.LANCZOS)
        ra[ten] = im
    # TUYẾT: lạnh + sáng, nhưng bão hoà kéo xuống chứ không về 0 — trắng tuyệt đối thì mất mốc.
    # ⚠ Lượt đầu để bão hoà 0,42 và nó vẫn đọc ra ĐỒNG CỎ NHẠT, không ra tuyết — xanh lá còn
    # quá nhiều. Phải kéo bão hoà xuống tận 0,16 rồi mới pha lam, và nâng sáng mạnh. Thân cây
    # vẫn sẫm vì phép này NHÂN kênh chứ không tô đè, nên mốc tương phản giữ nguyên.
    ra['tuyet'] = _doiSac(ra['rung'], 1.30, 1.34, 1.52, sang=1.46, bao=0.16)
    # TRO: ấm + tối, giữ nguyên nét đá trụi của vùng đá chết.
    ra['tro'] = _doiSac(ra['dahoang'], 1.26, 1.06, 0.84, sang=0.98, bao=0.90)
    # BIỂN: mặt hồ dìm sâu, dùng cho phần NGOÀI mọi vùng.
    # ⚠ BIỂN PHẢI LÀM MỀM. Mảng nước sạch lá lớn nhất chỉ 180×100, mà nó bị kéo phủ cả khung
    # 660×500 — tức phóng ~3,7 lần, nên mấy gợn sóng trong tranh thành những vòng cung to đùng
    # chạy ngang mép trên. Làm nhoè nhẹ thì chúng về đúng vai trò nền, không tranh chỗ với đất.
    from PIL import ImageFilter
    ra['bien'] = _doiSac(ra['nuoc'], 0.72, 0.84, 1.02, sang=0.86, bao=1.05) \
                 .filter(ImageFilter.GaussianBlur(7))
    # ── HUY HIỆU: ô ĐẶC SẮC NHẤT của từng mảng ──────────────────────────────────────────────
    # ⚠ CẮT Ở GIỮA MẢNG LÀ CHẤM MÒ. Lượt đầu tôi lấy đúng tâm 384px làm huy hiệu, và SÁU vùng ra
    # cùng một cái cây — vì tâm của mảng cỏ, mảng rừng, mảng vườn đều rơi vào một khoảng cỏ có
    # một cái cây. Huy hiệu mà không phân biệt được thì nó thôi làm huy hiệu.
    # Nay dò bằng PHƯƠNG SAI: ô nào lệch sáng nhiều nhất thì ô đó có vật thể (rặng cây, vách đá,
    # lá súng) chứ không phải một khoảng nền trơn. Không phải "đẹp", nhưng là ĐẶC TRƯNG — mà
    # huy hiệu cần đúng cái đó.
    import numpy as np
    IC, N = 96, 132
    for ten, im in list(ra.items()):
        a = np.asarray(im.convert('L')).astype(np.float32)
        ii, ii2 = a.cumsum(0).cumsum(1), (a * a).cumsum(0).cumsum(1)
        ii = np.pad(ii, ((1, 0), (1, 0))); ii2 = np.pad(ii2, ((1, 0), (1, 0)))
        best, bx, by = -1, 0, 0
        for y in range(0, O - N, 8):
            for x in range(0, O - N, 8):
                s1 = ii[y+N, x+N] - ii[y, x+N] - ii[y+N, x] + ii[y, x]
                s2 = ii2[y+N, x+N] - ii2[y, x+N] - ii2[y+N, x] + ii2[y, x]
                v = s2 / (N*N) - (s1 / (N*N)) ** 2
                if v > best: best, bx, by = v, x, y
        ic = im.crop((bx, by, bx + N, by + N)).resize((IC, IC), Image.LANCZOS)
        ic.save(os.path.join(RA, 'tg_ic_%s.webp' % ten), quality=90, method=6)
        print('  tg_ic_%-9s ô (%3d,%3d) phương sai %6.0f' % (ten, bx, by, best))

    for ten, im in ra.items():
        p = os.path.join(RA, 'tg_%s.webp' % ten)
        im.save(p, quality=88, method=6)
        print('  tg_%-9s %dx%d  %5.1f KB' % (ten, im.width, im.height, os.path.getsize(p) / 1024))
    print('NUONG XONG %d mang → %s' % (len(ra), RA))


if __name__ == '__main__':
    main()
