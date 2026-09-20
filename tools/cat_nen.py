#!/usr/bin/env python3
"""Cắt nền cho tranh Meowa gen ra — bỏ nền phẳng, bỏ hoa văn chấm, bỏ watermark.

    python3 tools/cat_nen.py <ảnh vào> <ảnh ra> [--cao N] [--sai N] [--xem]

⚠ VÌ SAO KHÔNG CHỈ FLOOD-FILL TỪ GÓC. Tranh Meowa xuất ra trên một nền tối có HOA VĂN
CHẤM (dấu cộng nhạt rải đều) và một WATERMARK ở góc dưới-phải. Flood-fill chỉ ăn được
vùng liền mạch cùng màu: mấy cái chấm sáng hơn nền nên nó chừa lại một bãi lấm tấm, còn
watermark thì nằm lọt trong nền nên cũng ở lại. Ảnh trông "đã tách nền" cho tới lúc đặt
lên map sáng — rồi cả đám chấm hiện ra.

Nên làm ba bước, và thiếu bước nào cũng hỏng:
  1. TOẢ TỪ BỐN GÓC theo dung sai màu → xoá nền phẳng.
  2. XOÁ THEO BẢNG MÀU NỀN: pixel nào gần màu nền HOẶC màu chấm thì xoá, kể cả khi
     không liền mạch với góc. Đây là bước ăn mấy cái chấm.
  3. GIỮ ĐÚNG MẢNG LỚN NHẤT: mọi mảng đặc còn lại mà rời khỏi nhân vật đều bị bỏ —
     watermark chết ở đây, và cả mấy vệt lẻ mà bước 2 chừa lại.
Sau đó cắt sát hộp bao và (tuỳ chọn) thu về chiều cao cần dùng.

Giữ nguyên tỉ lệ khi thu: NPC trong game đo HỘP ALPHA rồi neo đáy (xem npcHop() trong
game.js), nên ép vào khung cố định là thừa — cứ đưa đúng chiều cao là được.
"""
import sys, collections
from PIL import Image
import numpy as np


def _mang_lon_nhat(dac):
    """Trả (nhãn, cỡ, ảnh nhãn) của mảng đặc lớn nhất — dùng cả để dọn lẫn để TỰ KIỂM."""
    h, w = dac.shape
    nhan = np.zeros((h, w), np.int32)
    ma, to, cuc = 0, 0, 0
    for y0 in range(h):
        for x0 in range(w):
            if not dac[y0, x0] or nhan[y0, x0]:
                continue
            ma += 1
            n = 0
            q = collections.deque([(y0, x0)])
            nhan[y0, x0] = ma
            while q:
                y, x = q.popleft(); n += 1
                for ny, nx in ((y-1, x), (y+1, x), (y, x-1), (y, x+1),
                               (y-1, x-1), (y-1, x+1), (y+1, x-1), (y+1, x+1)):
                    if 0 <= ny < h and 0 <= nx < w and dac[ny, nx] and not nhan[ny, nx]:
                        nhan[ny, nx] = ma
                        q.append((ny, nx))
            if n > to:
                to, cuc = n, ma
    return cuc, to, nhan


def _toa(rgb, con, mau, sai):
    """Toả từ mọi điểm MÉP còn sống có màu gần `mau`. Trả mặt nạ vùng chạm tới."""
    h, w = con.shape
    co_the = (np.abs(rgb - mau).sum(axis=2) <= sai) & con
    tham = np.zeros((h, w), bool)
    q = collections.deque()
    for y in range(h):
        for x in (0, w-1):
            if co_the[y, x] and not tham[y, x]:
                tham[y, x] = True; q.append((y, x))
    for x in range(w):
        for y in (0, h-1):
            if co_the[y, x] and not tham[y, x]:
                tham[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y-1, x), (y+1, x), (y, x-1), (y, x+1)):
            if 0 <= ny < h and 0 <= nx < w and not tham[ny, nx] and co_the[ny, nx]:
                tham[ny, nx] = True
                q.append((ny, nx))
    return tham


def cat_nen(vao, ra, cao=None, sai=38, xem=None, lop=4):
    """Bóc nền theo TỪNG LỚP, mỗi lớp tự kiểm bằng cỡ mảng nhân vật.

    ⚠ VÌ SAO PHẢI BÓC NHIỀU LỚP. Ảnh xuất từ Meowa hay có HAI lớp nền chồng nhau: một dải
    ĐEN bao ngoài khung, rồi mới tới tấm nền tối có hoa văn chấm. Dò "màu nền" từ vành mép
    thì ra màu ĐEN — mà tranh kiểu này NÉT VIỀN CŨNG ĐEN. Xoá theo màu đó là ăn luôn nét
    viền của nhân vật, hình vỡ thành nhiều mảnh rời, và giữ-mảng-lớn-nhất chỉ còn một mẩu.
    Đo được ở lần chạy đầu: ảnh 669×683 ra 290×221 — mất 4/5 bức tranh.

    Bóc từng lớp thì mỗi lượt chỉ dùng ĐÚNG MỘT màu lấy tại mép đang còn sống, xong là quên
    màu đó đi. Lớp đen bị bóc trước và màu đen KHÔNG được mang sang lượt sau, nên nét viền
    của nhân vật an toàn.

    ⚠ TỰ KIỂM ĐO ĐỘ VỠ VỤN, KHÔNG ĐO ĐỘ TỤT. Bản trước tôi chặn theo "mảng lớn nhất tụt
    quá 20% thì hoàn lại" và nó bác NGAY lượt đầu — đúng thôi: trước khi bóc, cả bức ảnh là
    một mảng đặc (450 097 điểm), bóc nền xong còn mỗi nhân vật (160 216). Tụt là chuyện
    ĐƯƠNG NHIÊN của việc bóc nền.
    Thứ thật sự báo hỏng là nhân vật VỠ VỤN: ăn phải nét viền thì hình rã thành nhiều đảo
    rời. Nên đo tỉ lệ `mảng lớn nhất / tổng điểm còn đặc`. Bóc nền đúng thì tỉ lệ này ở gần
    1; ăn vào viền thì nó rơi thẳng. Ngưỡng 0,5.
    """
    im = Image.open(vao).convert('RGBA')
    a = np.array(im).astype(np.int16)
    h, w = a.shape[:2]
    rgb = a[:, :, :3]
    con = a[:, :, 3] > 40                       # còn sống = chưa bị bóc
    ghi = []

    for _ in range(lop):
        # màu của lượt này: màu hay gặp nhất trong các điểm MÉP còn sống
        mep = [(y, x) for y in range(h) for x in (0, w-1) if con[y, x]] + \
              [(y, x) for x in range(w) for y in (0, h-1) if con[y, x]]
        if not mep:
            break
        dem = collections.Counter(tuple(rgb[y, x]) for y, x in mep)
        mau = np.array(dem.most_common(1)[0][0])
        tham = _toa(rgb, con, mau, sai)
        n = int(tham.sum())
        if n < h * w * 0.004:                   # không còn gì đáng bóc
            break
        thu = con & ~tham
        tong = int(thu.sum())
        if tong == 0:
            break
        _, sau, _ = _mang_lon_nhat(thu)
        lien = sau / tong                       # 1,0 = còn đúng một khối liền; thấp = vỡ vụn
        if lien < 0.5:
            ghi.append(f'BỎ lượt {tuple(int(v) for v in mau)}: hình vỡ vụn '
                       f'(khối lớn nhất chỉ {lien*100:.0f}% phần còn lại) — nhiều khả năng màu này '
                       f'trùng nét viền')
            break
        con = thu
        ghi.append(f'bóc {tuple(int(v) for v in mau)} · {100*n//(h*w)}% khung · liền khối {lien*100:.0f}%')

    a[:, :, 3] = np.where(con, a[:, :, 3], 0)

    # giữ mảng đặc LỚN NHẤT — watermark, chấm lẻ và vệt rời chết ở đây
    cuc, to, nhan = _mang_lon_nhat(a[:, :, 3] > 40)
    if cuc:
        a[:, :, 3] = np.where(nhan == cuc, a[:, :, 3], 0)

    out = Image.fromarray(a.astype(np.uint8), 'RGBA')
    bb = out.getbbox()
    if bb:
        out = out.crop(bb)
    if cao:
        r = cao / out.height
        out = out.resize((max(1, round(out.width * r)), cao), Image.LANCZOS)
    out.save(ra)

    giu = 100 * to / max(1, h * w)
    print(f'{vao} ({w}×{h}) → {ra}')
    for g in ghi:
        print('  ' + g)
    print(f'  ra {out.width}×{out.height} · nhân vật {to} điểm ({giu:.0f}% khung)')
    if giu < 8:
        print('  ⚠ NHÂN VẬT QUÁ NHỎ so với khung — mở ảnh --xem ra nhìn trước khi dùng.')
    if xem:
        k = Image.new('RGBA', (out.width*2 + 24, out.height), (0, 0, 0, 0))
        for i, bg in enumerate([(236, 238, 225, 255), (18, 21, 13, 255)]):
            o = Image.new('RGBA', out.size, bg)
            o.alpha_composite(out)
            k.paste(o, (i * (out.width + 24), 0))
        k.convert('RGB').save(xem)
        print(f'  ảnh soi viền: {xem}')
    return out


if __name__ == '__main__':
    av = sys.argv[1:]
    if len(av) < 2:
        print(__doc__); sys.exit(1)
    cao = int(av[av.index('--cao') + 1]) if '--cao' in av else None
    sai = int(av[av.index('--sai') + 1]) if '--sai' in av else 38
    xem = av[av.index('--xem') + 1] if '--xem' in av else None
    cat_nen(av[0], av[1], cao, sai, xem)
