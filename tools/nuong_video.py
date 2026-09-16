#!/usr/bin/env python3
"""Video nền phẳng → BẢNG KHUNG cho NPC/quái.

    python3 tools/nuong_video.py <video.mp4> <ra.webp> [--khung 12] [--cot 4] [--cao 200]

⚠ CHỈ ĂN VIDEO NỀN PHẲNG. Lò sinh video xuất ra hai kiểu rất khác nhau, và chỉ một kiểu
dùng được:
  · nền CHROMA phẳng (magenta/lục), máy quay đứng yên  → cắt được, đúng đường này;
  · nền TRANH VẼ (một cái xưởng, một cái hang…)        → KHÔNG cắt được bằng máy. Phải
    tách từng khung bằng tay, mà khói/tia lửa vắt ngang người thì không có mép nào để
    tách. Chạy `--do` trên tấm đó sẽ báo ra ngay thay vì cho một bảng khung rác.

⚠ MỘT HỘP CẮT CHO CẢ BẢNG, KHÔNG PHẢI MỖI KHUNG MỘT HỘP. Cắt sát từng khung thì mỗi ô
lệch tâm vài điểm ảnh và con vật GIẬT một cái mỗi khung — cùng bài học đã ghi cho
`nuong_chi_chay.py` và `nuong_khungquai.py`. Nên lấy HỢP của mọi hộp bao rồi cắt chung.

⚠ VÀ PHẢI ĐO TRƯỚC KHI CẮT. `--do` in ba con số quyết định video có dùng được không:
  · nền±   : độ magenta của vành mép. Dưới 40 là nền không phẳng ⇒ dừng.
  · trôi   : tâm khối đặc xê dịch bao nhiêu điểm ảnh qua cả đoạn. Lớn = máy quay động,
             bảng khung sẽ trượt đi thay vì đứng yên tại chỗ.
  · vụn    : khối lớn nhất chiếm bao nhiêu phần tổng điểm đặc. Thấp = nền ăn vào hình.
"""
import sys, subprocess, tempfile, os, glob, collections
from PIL import Image
import numpy as np

try:
    import imageio_ffmpeg
    FF = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FF = 'ffmpeg'


def rut(video, n, tmp, lam=400):
    """Rút n khung TRẢI ĐỀU cả đoạn (không phải n khung đầu), đã thu về chiều cao làm việc."""
    subprocess.run([FF, '-v', 'error', '-i', video, '-vf', f'scale=-1:{lam}', '-vsync', '0',
                    os.path.join(tmp, 'f%04d.png')], check=True)
    fs = sorted(glob.glob(os.path.join(tmp, 'f*.png')))
    if not fs:
        raise SystemExit('không rút được khung nào')
    return [fs[round(i * (len(fs) - 1) / max(1, n - 1))] for i in range(n)], len(fs)


def key(im):
    """Mặt nạ alpha + khử viền hồng. Trả (RGBA float, nền±)."""
    a = np.array(im.convert('RGB')).astype(np.int16)
    R, G, B = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    hong = np.minimum(R, B) - G
    vanh = np.concatenate([hong[0], hong[-1], hong[:, 0], hong[:, -1]])
    nen = int(np.median(vanh))
    tren, duoi = nen * 0.55, nen * 0.18
    al = np.clip((tren - hong) / max(1.0, tren - duoi), 0, 1)
    du = np.clip(hong, 0, None) * (al > 0)
    return np.dstack([np.clip(R - du, 0, 255), G, np.clip(B - du, 0, 255), al * 255]), nen


def lon_nhat(dac):
    h, w = dac.shape
    nhan = np.zeros((h, w), np.int32); ma = to = cuc = 0
    for y0 in range(h):
        for x0 in range(w):
            if not dac[y0, x0] or nhan[y0, x0]: continue
            ma += 1; n = 0; q = collections.deque([(y0, x0)]); nhan[y0, x0] = ma
            while q:
                y, x = q.popleft(); n += 1
                for ny, nx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1),(y-1,x-1),(y-1,x+1),(y+1,x-1),(y+1,x+1)):
                    if 0 <= ny < h and 0 <= nx < w and dac[ny, nx] and not nhan[ny, nx]:
                        nhan[ny, nx] = ma; q.append((ny, nx))
            if n > to: to, cuc = n, ma
    return cuc, to, nhan


def chay(video, ra, khung=12, cot=4, cao=150, lam=400, chi_do=False, ten=None):
    with tempfile.TemporaryDirectory() as tmp:
        fs, tong = rut(video, khung, tmp, lam)
        print(f'{os.path.basename(video)} · {tong} khung → lấy {len(fs)}')
        anh, hop, nens, tams, liens, chan = [], None, [], [], [], []
        for f in fs:
            im = Image.open(f)
            b, nen = key(im); nens.append(nen)
            dac = b[:, :, 3] > 60
            cuc, to, nhan = lon_nhat(dac)
            if cuc:
                b[:, :, 3] = np.where(nhan == cuc, b[:, :, 3], 0)
            liens.append(to / max(1, int(dac.sum())))
            img = Image.fromarray(b.astype(np.uint8), 'RGBA')
            bb = img.getbbox()
            if bb:
                hop = bb if hop is None else (min(hop[0], bb[0]), min(hop[1], bb[1]),
                                              max(hop[2], bb[2]), max(hop[3], bb[3]))
                tams.append(((bb[0]+bb[2])/2, (bb[1]+bb[3])/2)); chan.append(bb[3])
            anh.append(img)
        troi = 0 if len(tams) < 2 else max(max(abs(t[0]-tams[0][0]), abs(t[1]-tams[0][1])) for t in tams)
        print(f'  nền± {int(np.median(nens))} · trôi {troi:.0f}px · vụn {100*min(liens):.0f}%'
              f' (khối lớn nhất, khung tệ nhất)')
        if np.median(nens) < 40:
            print('  ⛔ NỀN KHÔNG PHẲNG — video này phải dựng lại trên nền chroma, máy không cắt được.')
            return None
        if troi > lam * 0.06:
            print(f'  ⚠ MÁY QUAY ĐỘNG ({troi:.0f}px) — bảng khung sẽ trượt chỗ, không đứng yên.')
        if chi_do:
            return None

        # ⚠ MỘT HỘP CHO CẢ BẢNG: hợp của mọi hộp bao, và mỗi khung giữ nguyên chỗ của nó trong
        # khung hình gốc. Cắt sát TỪNG khung là mỗi ô lệch tâm vài điểm ảnh ⇒ con vật giật một
        # cái mỗi khung (cùng bài học đã ghi cho nuong_chi_chay.py và nuong_khungquai.py).
        w, h = hop[2]-hop[0], hop[3]-hop[1]
        r = cao / h
        ow, oh = max(1, round(w*r)), cao
        hang = (len(anh) + cot - 1) // cot
        sheet = Image.new('RGBA', (ow*cot, oh*hang), (0, 0, 0, 0))
        for i, img in enumerate(anh):
            sheet.paste(img.crop(hop).resize((ow, oh), Image.LANCZOS), ((i % cot)*ow, (i // cot)*oh))
        # ⚠ neoY = BÀN CHÂN, lấy TRUNG VỊ hàng đáy TỪNG khung — KHÔNG lấy đáy hộp chung. Một
        # khung có mẩu hiệu ứng rơi thấp hơn chân là kéo neo của CẢ bảng xuống, và NPC treo lơ
        # lửng suốt. Cùng cái bẫy đã ghi cho tq_corran (vệt khói) và tq_daohoa (lửa hồn ở vó).
        neo = (float(np.median(chan)) - hop[1]) / h
        sheet.save(ra, quality=88, alpha_quality=100) if ra.endswith('.webp') else sheet.save(ra)
        # Tấm LÙI bắt buộc: bảng khung nạp lười, thiếu tấm lùi là mấy trăm mili giây đầu xin một
        # tệp không tồn tại (404) rồi NPC chớp thành đốm mực. Cùng luật của MOB_KHUNG.
        lui = os.path.splitext(ra)[0] + '.png'
        anh[0].crop(hop).resize((ow, oh), Image.LANCZOS).save(lui)
        print(f'  → {ra} · ô {ow}×{oh} · {cot}×{hang} · {len(anh)} khung · {os.path.getsize(ra)//1024} KB')
        print(f'  → {lui} (tấm lùi) · {os.path.getsize(lui)//1024} KB')
        print(f'  chân từng khung lệch {max(chan)-min(chan)}px trên {h}px hộp ⇒ neoY {neo:.4f}')
        k = ten or os.path.splitext(os.path.basename(ra))[0]
        print(f"\n  dán vào NPC_KHUNG (game.js):\n"
              f"  '{k}': {{ cot:{cot}, hang:{hang}, khung:{len(anh)}, "
              f"oRong:{ow}, oCao:{oh}, neoY:{neo:.4f}, fps:8 }},")
        return sheet


if __name__ == '__main__':
    av = sys.argv[1:]
    if len(av) < 1: print(__doc__); sys.exit(1)
    g = lambda k, d: int(av[av.index(k)+1]) if k in av else d
    chay(av[0], av[1] if len(av) > 1 and not av[1].startswith('--') else '/dev/null',
         g('--khung', 12), g('--cot', 4), g('--cao', 150), 400, '--do' in av,
         av[av.index('--ten')+1] if '--ten' in av else None)
