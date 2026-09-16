#!/usr/bin/env python3
"""Đóng các khung đã render thành BẢNG KHUNG HÌNH cho một loài quái / một con trùm.

    python3 tools/nuong_khungquai.py boar \
        --dung khung/dung/*.png --di khung/di/*.png \
        --danh khung/danh/*.png --chet khung/chet/*.png

    # hoặc từ một DẢI ngang đã ghép sẵn (meowa hay xuất kiểu này):
    python3 tools/nuong_khungquai.py boar --dai dung.png:6 --dai-di di.png:6

Ghi ra public/game/assets/mobs/kh/<tên>.png rồi IN RA nguyên văn mục phải dán vào
`MOB_KHUNG` trong public/game/game.js. Con số trong mục đó là ĐO ĐƯỢC, không phải đoán —
đó là toàn bộ lý do công cụ này tồn tại.

Nó cố tình KHÔNG đọc Spine. Art có thể tới từ gói Spine, từ một dải, hay từ mấy chục tệp rời;
phần luôn phải làm là "đo rồi đóng gói", nên tách đúng phần đó ra. Có gói Spine thì render
khung trước bằng tools/spine/ rồi đưa khung vào đây.

BA PHÉP ĐO, và vì sao phải đo chứ không đặt tay:

① MỘT hộp ô cho TẤT CẢ các nhịp. MOB_KHUNG chỉ có một `oRong`/`oCao`, nên mọi khung phải
   cắt cùng một hộp. Cắt riêng từng nhịp thì con vật NHẢY một cái mỗi lần đổi nhịp — đứng
   sang đi, đi sang đánh — mà nhìn thì chỉ thấy "hình như nó giật giật".

② `neoY` lấy từ nhịp ĐỨNG, không lấy từ cả bộ. Nhịp gục thường nằm sõng soài chạm đáy ô, nhịp
   đánh thì chồm lên; lấy đáy chung thì bàn chân lúc đứng yên bị treo lên khỏi mặt đất.

   ⚠ NHƯNG ĐÁY NHỊP ĐỨNG **KHÔNG PHẢI LÚC NÀO CŨNG LÀ BÀN CHÂN.** Art có khói, hào quang, vũng
   nước hay bóng vẽ sẵn dưới đế thì đáy ảnh nằm THẤP HƠN bàn chân — neo theo nó là con vật lơ
   lửng đúng bằng chiều cao vệt khói, và trên màn nhìn ra "hình như nó bay". Đo được ở gói trùm
   bóng ma đầu tiên: đế giày ở hàng 549, đáy khói ở 640 — lệch **91 px trên ô 640**, tức 14%
   chiều cao. Khai `--chan <y>` (toạ độ hàng của ĐẾ trong khung gốc) để đè.
   Và khi cả bộ chỉ có MỘT nhịp thì phép ② suy biến: đáy nhịp đứng == đáy chung ⇒ `neoY` luôn
   ra đúng 1.0, tức công cụ im lặng trả về một con số vô nghĩa. Có `--chan` thì hết ca đó.

③ Tâm ngang căn theo TRỤC ĐỨNG của dáng đứng, rồi nới đều hai bên. Game lật ảnh khi quái quay
   trái (`ctx.scale(-1,1)`), nên trục vẽ lệch khỏi tâm ô bao nhiêu thì con quái lắc ngang gấp
   đôi ngần ấy mỗi lần đổi hướng.
"""
import os, sys, glob, argparse
from PIL import Image, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vfx_meowa import nang_sang          # dùng LẠI, không chép: xem ghi chú tại chỗ khai ở đó

NHIP = ('dung', 'di', 'danh', 'chet')
FPS_MAC_DINH = {'dung': 8, 'di': 12, 'danh': 16, 'chet': 10}
COT_TOI_DA = 8          # xếp lưới, không xếp một hàng: cùng quy ước với bảng Chimera


def _mo(duong_list):
    ra = []
    for d in duong_list:
        for f in sorted(glob.glob(d)) or [d]:
            ra.append(Image.open(f).convert('RGBA'))
    return ra


def _cat_dai(spec):
    """'tep.png:6' → 6 khung cắt đều theo chiều ngang."""
    tep, _, n = spec.partition(':')
    n = int(n or 1)
    im = Image.open(tep).convert('RGBA')
    w = im.width // n
    return [im.crop((i * w, 0, (i + 1) * w, im.height)) for i in range(n)]


def vien_ria(im, day, mau, manh):
    """Rìa sáng lạnh trên mép TRÊN-TRÁI, nằm TRONG đường bao.

    Vì sao rìa TRONG chứ không phải quầng NGOÀI: chủ thể tối đứng trên nền sáng thì quầng ngoài
    vô hình (sáng chồng sáng). Rìa trong tạo một đường sáng ngay tại ranh giới, nên mắt đọc ra
    một cái MÉP CÓ KHỐI thay vì một lỗ thủng đen.

    Dựng theo đúng luật đã ghi ở CLAUDE.md mục "Đổ khối": lấy bóng gốc TRỪ bóng đã dời, để còn
    đúng một dải mép. Phủ nguyên bóng sáng dời vài pixel rồi bóng tối dời ngược lại thì ruột
    hình bị sáng chồng tối hoá xám — đỏ ra nâu hồng, vàng ra khaki.
    Dải phải TẮT DẦN (làm nhoè rồi mới tô): một vành đều tăm tắp đọc thành nét viền dán.

    Cộng SÁNG chứ không tô đè: rìa là ánh sáng hắt lên vải, không phải một lớp sơn phủ lên nó.
    Tô đè thì nếp áo dưới vành biến mất, mà nếp áo mới là thứ vành này sinh ra để cho thấy.

    Nguồn sáng ở TRÊN-TRÁI — cùng quy ước với `applyFormLight` trong game.
    """
    import numpy as np
    a = np.asarray(im).astype(float)
    al = a[..., 3]
    doi = np.zeros_like(al)
    doi[day:, day:] = al[:-day or None, :-day or None]     # bóng dời xuống-phải
    dai = np.clip(al - doi, 0, 255)                        # còn đúng vành trên-trái
    dai = np.asarray(Image.fromarray(dai.astype('uint8'))
                     .filter(ImageFilter.GaussianBlur(day * 0.55))).astype(float)
    dai *= al / 255.0                                      # kẹp lại trong đường bao
    k = (dai / 255.0 * manh)[..., None]
    rgb = np.clip(a[..., :3] + np.array(mau, float) * k, 0, 255)
    return Image.fromarray(np.dstack([rgb, al]).astype('uint8'))


def _gop(a, b):
    if a is None: return b
    if b is None: return a
    return (min(a[0], b[0]), min(a[1], b[1]), max(a[2], b[2]), max(a[3], b[3]))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('ten', help='tên tệp art, ví dụ boar — khoá tra MOB_KHUNG')
    for n in NHIP:
        ap.add_argument('--' + n, nargs='*', default=[], help='khung rời của nhịp ' + n)
        ap.add_argument('--dai-' + n, default=None, help='dải ngang của nhịp %s, dạng tep.png:N' % n)
    ap.add_argument('--fps', default='', help='đè fps, ví dụ di=14,danh=18')
    ap.add_argument('--chan', type=int, default=None,
                    help='hàng của ĐẾ CHÂN trong khung gốc — đè phép đo đáy nhịp `dung`. '
                         'Bắt buộc khi art có khói/hào quang/bóng vẽ sẵn dưới chân.')
    ap.add_argument('--sang', default='',
                    help='"gamma,gain,sat" — nâng sáng cho art tối đọc được trên nền sáng. '
                         'Dùng chung hàm với tools/vfx_meowa.py.')
    ap.add_argument('--vien', default='',
                    help='"dày,#rrggbb,mạnh" — rìa sáng lạnh mép trên-trái, NẰM TRONG đường bao. '
                         'Ví dụ: 5,#9ec8e8,0.55')
    ap.add_argument('--cao', type=int, default=None,
                    help='chiều cao ô ĐẦU RA (px). Không khai thì giữ nguyên cỡ gốc. '
                         'Trùm vẽ ra 106-132px trên màn, nên ô 640 là thừa gấp 5 lần điểm ảnh.')
    ap.add_argument('--ra', default=None, help='thư mục ra (mặc định public/game/assets/mobs/kh)')
    a = ap.parse_args()

    goc = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
    ra_dir = a.ra or os.path.join(goc, 'public/game/assets/mobs/kh')

    bo = {}
    for n in NHIP:
        dai = getattr(a, 'dai_' + n)
        ks = _cat_dai(dai) if dai else _mo(getattr(a, n))
        if ks: bo[n] = ks
    if 'dung' not in bo:
        sys.exit('THIẾU nhịp `dung`. Nó là nhịp bắt buộc — mọi nhịp khác rơi về nó khi thiếu.')

    # ① một hộp cho tất cả các nhịp
    tat = [k for ks in bo.values() for k in ks]
    W = max(k.width for k in tat); H = max(k.height for k in tat)
    tat = [k if k.size == (W, H) else _dem(k, W, H) for k in tat]
    i = 0
    for n in NHIP:
        if n in bo:
            bo[n] = tat[i:i + len(bo[n])]; i += len(bo[n])

    hop = None
    for k in tat: hop = _gop(hop, k.getchannel('A').getbbox())
    if hop is None: sys.exit('Mọi khung đều trong suốt — sai tệp?')

    # ② neoY từ nhịp ĐỨNG — hoặc từ `--chan` khi đáy ảnh không phải bàn chân
    hop_dung = None
    for k in bo['dung']: hop_dung = _gop(hop_dung, k.getchannel('A').getbbox())
    day = a.chan if a.chan is not None else hop_dung[3]

    # ③ tâm ngang theo dáng đứng, nới đều hai bên
    tx = (hop_dung[0] + hop_dung[2]) / 2
    nua = max(tx - hop[0], hop[2] - tx)
    x0, x1 = int(round(tx - nua)), int(round(tx + nua))
    y0, y1 = hop[1], hop[3]
    oRong, oCao = x1 - x0, y1 - y0
    neoY = round((day - y0) / oCao, 4)

    # đóng lưới, thứ tự nhịp cố định
    thu_tu = [n for n in NHIP if n in bo]
    khung, nhip_tb = [], {}
    fps_de = dict(p.split('=') for p in a.fps.split(',') if '=' in p)
    for n in thu_tu:
        nhip_tb[n] = [len(khung), len(bo[n]), int(fps_de.get(n, FPS_MAC_DINH[n]))]
        khung += [k.crop((x0, y0, x1, y1)) for k in bo[n]]

    # thu ô về cỡ đầu ra. Thu TỪNG KHUNG sau khi đã cắt cùng một hộp nên tỉ lệ và neoY giữ
    # nguyên; thu cả tấm lưới sau khi ghép thì mép các ô lem vào nhau.
    if a.cao and a.cao < oCao:
        r = a.cao / oCao
        oRong, oCao = max(1, round(oRong * r)), a.cao
        khung = [k.resize((oRong, oCao), Image.LANCZOS) for k in khung]

    if a.sang:
        g, gain, sat = (float(v) for v in a.sang.split(','))
        khung = [nang_sang(k, g, gain, sat) for k in khung]

    # ⚠ Viền chạy SAU khi thu ô, không trước: bề dày phải tính bằng pixel ĐẦU RA. Vẽ ở cỡ gốc
    # rồi thu 640→256 là vành mỏng đi 2,5 lần và gần như biến mất — cùng bài học "bề dày viền
    # phải tính theo TỈ LỆ" đã ghi ở mục hào quang +N.
    if a.vien:
        _d, _m, _s = a.vien.split(',')
        rgb = tuple(int(_m.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
        khung = [vien_ria(k, int(_d), rgb, float(_s)) for k in khung]

    cot = min(COT_TOI_DA, len(khung))
    hang = (len(khung) + cot - 1) // cot
    sheet = Image.new('RGBA', (oRong * cot, oCao * hang))
    for i, k in enumerate(khung):
        sheet.alpha_composite(k, ((i % cot) * oRong, (i // cot) * oCao))
    os.makedirs(ra_dir, exist_ok=True)
    duong = os.path.join(ra_dir, a.ten + '.png')
    sheet.save(duong, optimize=True)

    # TẤM TĨNH LÙI — khung đầu của nhịp `dung`, ghi ra assets/mobs/<tên>.png.
    # Bắt buộc, không phải tuỳ chọn: bảng khung nạp lười, nên trong mấy trăm mili giây đầu
    # `mobKhungO` trả null và drawMob đi hỏi tấm tĩnh. Không có tấm đó thì nó xin một tệp
    # không tồn tại (404) rồi rơi về vệt mực — con trùm chớp một cái thành đốm nâu.
    # Đây cũng chính là "lối lùi" mà lý do tách hai thư mục đã hứa ở đầu tệp này.
    tinh_dir = os.path.normpath(os.path.join(ra_dir, '..'))
    duong_tinh = os.path.join(tinh_dir, a.ten + '.png')
    khung[0].save(duong_tinh, optimize=True)

    print('%s  %d khung  ô %dx%d  lưới %dx%d  %.0f KB'
          % (duong, len(khung), oRong, oCao, cot, hang, os.path.getsize(duong) / 1024))
    print('%s  tấm tĩnh lùi  %.0f KB' % (duong_tinh, os.path.getsize(duong_tinh) / 1024))
    print('\nDán mục này vào MOB_KHUNG trong public/game/game.js:\n')
    nh = ', '.join("%s:[%d,%d,%d]" % (n, *nhip_tb[n]) for n in thu_tu)
    print("  '%s': { cot:%d, hang:%d, oRong:%d, oCao:%d, neoY:%s,\n            nhip:{ %s } },"
          % (a.ten, cot, hang, oRong, oCao, neoY, nh))
    if 'di' in bo:
        print('\n  ⚠ `sai` (quãng đường cho trọn một vòng đi) KHÔNG đo được từ tranh — nó phụ')
        print('    thuộc sải chân vẽ trong art. Chạy thử trong game, thấy chân trượt thì chỉnh:')
        print('    trượt về phía TRƯỚC ⇒ `sai` đang quá lớn; lết về phía SAU ⇒ quá nhỏ.')


def _dem(k, W, H):
    """Đệm một khung nhỏ hơn về đúng khổ chung, căn giữa-đáy (chân đứng trên cùng một mức)."""
    n = Image.new('RGBA', (W, H))
    n.paste(k, ((W - k.width) // 2, H - k.height))
    return n


if __name__ == '__main__':
    main()
