#!/usr/bin/env python3
"""Đổi mọi PNG/GIF của gói `magic-runtime` (và ảnh review của nó) sang WebP, rồi sửa mọi manifest.

    python3 tools/magic/sang_webp.py            # đổi + sửa manifest + kiểm
    python3 tools/magic/sang_webp.py --kiem     # chỉ kiểm, không ghi gì

Chạy lại SAU MỖI LẦN `scripts/build_magic_*_package_*.py` nướng ra PNG. Chạy nhiều lần vô hại:
tệp đã là WebP thì bỏ qua.

Vì sao có công cụ này (chủ dự án chốt phương án B, 2026-09-24):
  · Gói art không đi qua Git LFS. Production là VPS `git reset --hard` mỗi 2 phút và KHÔNG có
    `git-lfs` ⇒ LFS thì người chơi nhận một tệp văn bản 130 byte thay cho tấm ảnh, toàn bộ art
    Spellblade biến mất mà không lỗi nào báo. CI và sandbox cũng không có `git-lfs`.
  · WebP q90 + alpha LOSSLESS = ~36% dung lượng PNG. Kênh alpha lệch ĐÚNG 0 (mép hình, socket,
    kiểm tra lem mép không đổi); màu lệch TB ~3/255, không thấy ở cỡ hiện trong game.

Luật chọn định dạng — TỪNG TỆP, lấy bản nhỏ hơn:
  · lossless  (ảnh giống hệt từng điểm ảnh)
  · q90 + alpha_quality=100
  ⚠ Không có một định dạng thắng mọi tệp: `town_v1/weapon_back/*` nén q90 lại TO HƠN PNG (107%)
    trong khi lossless còn 6% — tấm ấy gần như toàn trong suốt với vài mảng màu phẳng.
  ⚠ Mọi bản ghi ra đều được GIẢI MÃ LẠI và so alpha với bản gốc. Lệch một điểm ⇒ dừng hẳn.
    Và tấm lossless phải giống hệt RGBA từng điểm ảnh (trừ RGB dưới alpha 0, thứ không ai thấy).

Sửa manifest: mọi chuỗi "<...>.png"/"<...>.gif" trong .json của gói mà tệp .webp cùng tên có
thật thì đổi đuôi. Sau đó kiểm NGƯỢC: mọi đường dẫn ảnh trong mọi manifest phải trỏ vào một tệp
có thật (tra theo gốc gói hoặc thư mục của manifest) — regex trượt mà im lặng là vết sẹo đã ghi.
"""
import io, json, os, re, sys
from concurrent.futures import ProcessPoolExecutor
from PIL import Image, ImageSequence
import numpy as np

GOC = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
THU_MUC = [os.path.join(GOC, 'public/game/assets/magic-runtime'),
           os.path.join(GOC, 'artifacts/magic-field-v2')]
KIEM = '--kiem' in sys.argv


def la_con_tro(p):
    with open(p, 'rb') as f:
        return f.read(40).startswith(b'version https://git-lfs')


def ma_hoa(im, **kw):
    b = io.BytesIO(); im.save(b, 'WEBP', method=6, **kw); return b.getvalue()


def doi_png(p):
    im = Image.open(p).convert('RGBA')
    A = np.asarray(im)
    ll = ma_hoa(im, lossless=True, exact=False)
    q = ma_hoa(im, quality=90, alpha_quality=100)
    chon, ten = (ll, 'lossless') if len(ll) <= len(q) else (q, 'q90')
    C = np.asarray(Image.open(io.BytesIO(chon)).convert('RGBA'))
    if C.shape != A.shape or not np.array_equal(C[..., 3], A[..., 3]):
        raise SystemExit(f'ALPHA LỆCH: {p}')
    if ten == 'lossless':
        m = A[..., 3] > 0
        if not np.array_equal(C[..., :3][m], A[..., :3][m]):
            raise SystemExit(f'LOSSLESS KHÔNG KHỚP: {p}')
    ra = p[:-4] + '.webp'
    with open(ra, 'wb') as f: f.write(chon)
    a = os.path.getsize(p); os.remove(p)
    return a, len(chon), ten


def doi_gif(p):
    im = Image.open(p)
    kh = [f.convert('RGBA') for f in ImageSequence.Iterator(im)]
    tg = [f.info.get('duration', im.info.get('duration', 100)) for f in ImageSequence.Iterator(im)]
    b = io.BytesIO()
    kh[0].save(b, 'WEBP', save_all=True, append_images=kh[1:], duration=tg, loop=0, quality=85, method=4)
    ra = p[:-4] + '.webp'
    with open(ra, 'wb') as f: f.write(b.getvalue())
    a = os.path.getsize(p); os.remove(p)
    return a, len(b.getvalue()), 'gif→webp'


def doi(p):
    return (p,) + (doi_gif(p) if p.endswith('.gif') else doi_png(p))


def main():
    anh = [os.path.join(r, f) for d in THU_MUC if os.path.isdir(d) for r, _, fs in os.walk(d)
           for f in fs if f.lower().endswith(('.png', '.gif'))]
    tro = [p for p in anh if la_con_tro(p)]
    if tro:
        raise SystemExit(f'{len(tro)} tệp còn là CON TRỎ LFS, chưa có ảnh thật — kéo về trước. Ví dụ: {tro[0]}')
    if not KIEM and anh:
        tong = [0, 0]; dem = {}
        with ProcessPoolExecutor() as ex:
            for p, a, b, ten in ex.map(doi, anh, chunksize=2):
                tong[0] += a; tong[1] += b; dem[ten] = dem.get(ten, 0) + 1
        print(f'đổi {len(anh)} tệp: {tong[0]/1e6:.1f} MB → {tong[1]/1e6:.1f} MB '
              f'({tong[1]/max(1,tong[0]):.0%}) · {dem}')

    # Sửa + kiểm manifest.
    loi = []; sua = 0
    # Nấc lùi: vài trường (vd `flightAttack.weaponLayer` trong manifest gốc) ghi đường dẫn TƯƠNG
    # ĐỐI với thư mục con của khối, không với gói. Chỉ chấp nhận khi tên tệp là DUY NHẤT trong gói
    # — trùng tên thì không đoán.
    ten = {}
    for d in THU_MUC:
        for r, _, fs in os.walk(d):
            for f in fs: ten.setdefault(f, []).append(os.path.join(r, f))
    def co(g_ds, s):
        return any(os.path.exists(os.path.join(g, s)) for g in g_ds) or \
            ('/' not in s and len(ten.get(s, [])) == 1)
    for d in THU_MUC:
        for r, _, fs in os.walk(d):
            for f in fs:
                if not f.endswith('.json'): continue
                p = os.path.join(r, f); t = open(p, encoding='utf-8').read(); t0 = t
                def thay(m):
                    s = m.group(1)
                    if co((d, r), s[:-4] + '.webp'):
                        return '"' + s[:-4] + '.webp"'
                    return m.group(0)
                if not KIEM:
                    t = re.sub(r'"([^"\n]+\.(?:png|gif))"', thay, t)
                    if t != t0:
                        open(p, 'w', encoding='utf-8').write(t); sua += 1
                for s in re.findall(r'"([^"\n]+\.(?:png|gif|webp))"', t):
                    if s.startswith(('http', '/')): continue
                    if not co((d, r), s):
                        loi.append(f'{os.path.relpath(p, GOC)} → {s}')
    con = [p for d in THU_MUC if os.path.isdir(d) for r, _, fs in os.walk(d)
           for p in (os.path.join(r, f) for f in fs) if p.lower().endswith(('.png', '.gif'))]
    print(f'manifest đã sửa: {sua} · đường dẫn trỏ vào hư không: {len(loi)} · PNG/GIF còn lại: {len(con)}')
    for l in loi[:20]: print('  ✗', l)
    for c in con[:10]: print('  ✗ còn', os.path.relpath(c, GOC))
    if loi or con: sys.exit(1)


if __name__ == '__main__':
    main()
