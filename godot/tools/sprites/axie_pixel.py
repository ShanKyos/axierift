"""Pixel hoá 16 con Axie (tranh Spine chính chủ đã nướng ở bản web) thành pet đi theo cho bản Godot.

    python3 godot/tools/sprites/axie_pixel.py      # → godot/assets/sprites/axie/<id>.png + axie.json

Vì sao không dựng lại bằng 3D như Dark Knight: con Axie phải nhận ra được NGAY là con Axie của
người chơi — đó là bản sắc mà cả lớp Axie dựa vào. Nên giữ nguyên nét vẽ chính chủ, chỉ cho nó đi
qua ĐÚNG bước hậu kỳ của mọi sprite khác (`render.py`): thu nhỏ, tắt khử răng cưa, bảng màu giới
hạn, viền tối 1 px. Viền chung là thứ làm hai nguồn art đọc ra cùng một game.

Rig Axie vẽ NHÌN NGANG nên chỉ có hai hướng: game lật gương theo hướng ngang khi đi.

Bốn khối, mỗi khối một hàng của bảng: thở (16) · chạy (12) · gồng (12) · giật (8).
⚠ BẢNG MÀU CHUNG cho mọi khung của một con — lượng tử từng khung riêng thì màu nhảy khung này
sang khung khác, con vật nhấp nháy. Bảng màu lấy từ CẢ BỐN khối, không chỉ khối thở.
⚠ Thu nhỏ trên ảnh NHÂN SẴN ALPHA, không thì mép trong suốt kéo màu đen vào viền thành quầng xám.
"""
import json
import os
import re

import numpy as np
from PIL import Image

GOC = os.path.join(os.path.dirname(__file__), '..', '..', '..')
NGUON = os.path.join(GOC, 'public', 'game', 'assets', 'chimera')
RA = os.path.join(GOC, 'godot', 'assets', 'sprites', 'axie')

THAN_PX = 28        # thân pet cao ~ nửa Dark Knight (56 px)
RONG_TOI_DA = 46    # con bè nhất (tỉ lệ 1,52) thì thu theo bề ngang
SO_MAU = 14
VIEN = (22, 18, 28, 255)
KHOI = [            # tên, đuôi tệp, số khung, số cột trong bảng nguồn, fps
    ('idle', '', 16, 8, 9.0),
    ('run', '_r', 12, 6, 14.0),
    ('buff', '_b', 12, 6, 12.0),
    ('hit', '_h', 8, 4, 19.2),
]


def doc_bang_web(ten_js, ten_bien):
    s = open(os.path.join(GOC, 'public', 'game', 'data', ten_js), encoding='utf-8').read()
    m = re.search(r'window\.%s\s*=\s*(\{.*\});?\s*$' % ten_bien, s, re.S)
    if not m:
        raise SystemExit('DỪNG: không đọc được %s trong %s' % (ten_bien, ten_js))
    return json.loads(m.group(1))


def doc_lop():
    """id → (tên, sao, lớp) — đọc THẲNG bảng CHIMERA của bản web, không chép tay danh sách thứ hai."""
    s = open(os.path.join(GOC, 'public', 'game', 'data', 'canbang.js'), encoding='utf-8').read()
    ds = re.findall(r"id:'([a-z]+)',\s*ten:'([^']+)',\s*sao:(\d),\s*lop:'([A-Za-z]+)'", s)
    if len(ds) < 16:
        raise SystemExit('DỪNG: chỉ đọc được %d con Axie từ canbang.js' % len(ds))
    return {i: (t, int(sao), lop) for i, t, sao, lop in ds}


def thu_nho(im, w, h):
    a = np.array(im.convert('RGBA')).astype(np.float32) / 255.0
    a[..., :3] *= a[..., 3:4]                                  # nhân sẵn alpha
    p = Image.fromarray((a * 255).astype(np.uint8), 'RGBA').resize((w, h), Image.LANCZOS)
    b = np.array(p).astype(np.float32) / 255.0
    al = b[..., 3:4]
    b[..., :3] = np.where(al > 0.001, b[..., :3] / np.maximum(al, 0.001), 0)
    return (np.clip(b, 0, 1) * 255).astype(np.uint8)


def vien(a):
    dac = a[..., 3] > 0
    ke = np.zeros_like(dac)
    ke[1:] |= dac[:-1]
    ke[:-1] |= dac[1:]
    ke[:, 1:] |= dac[:, :-1]
    ke[:, :-1] |= dac[:, 1:]
    a[ke & ~dac] = VIEN
    return a


def main():
    anh = doc_bang_web('chi_anh.js', 'CHI_ANH')['o']
    lop = doc_lop()
    os.makedirs(RA, exist_ok=True)
    meta = {}
    for id_, (ten, sao, lp) in sorted(lop.items()):
        A = anh[id_]
        ow, oh = A['nhoRong'], A['nhoCao']
        s = THAN_PX / (A['thanCao'] * oh)
        s = min(s, RONG_TOI_DA / (A['thanCao'] * oh * ow / oh))
        w, h = max(1, round(ow * s)), max(1, round(oh * s))
        khung = {}
        for tt, duoi, n, cot, _ in KHOI:
            src = Image.open(os.path.join(NGUON, id_ + duoi + '.webp'))
            khung[tt] = [thu_nho(src.crop(((k % cot) * ow, (k // cot) * oh, (k % cot + 1) * ow, (k // cot + 1) * oh)), w, h)
                         for k in range(n)]
        # bảng màu chung: ghép mọi điểm đặc của mọi khung rồi lượng tử một lần
        dac = np.concatenate([f[f[..., 3] > 127][:, :3] for ds in khung.values() for f in ds])
        mau = Image.fromarray(dac.reshape(1, -1, 3), 'RGB').quantize(SO_MAU, method=Image.Quantize.MEDIANCUT)
        cot_max = max(k[2] for k in KHOI)
        bang = Image.new('RGBA', ((w + 2) * cot_max, (h + 2) * len(KHOI)), (0, 0, 0, 0))
        tt_meta = {}
        for hang, (tt, _, n, _, fps) in enumerate(KHOI):
            for k, f in enumerate(khung[tt]):
                al = f[..., 3] > 127
                q = np.array(Image.fromarray(f[..., :3], 'RGB').quantize(palette=mau, dither=Image.Dither.NONE).convert('RGB'))
                o = np.zeros((h + 2, w + 2, 4), np.uint8)              # chừa 1 px mỗi bên cho viền
                o[1:-1, 1:-1, :3] = q
                o[1:-1, 1:-1, 3] = np.where(al, 255, 0)
                bang.paste(Image.fromarray(vien(o), 'RGBA'), (k * (w + 2), hang * (h + 2)))
            tt_meta[tt] = {'hang': hang, 'khung': n, 'fps': fps, 'lap': tt in ('idle', 'run')}
        bang.save(os.path.join(RA, id_ + '.png'), optimize=True)
        meta[id_] = {'ten': ten, 'sao': sao, 'lop': lp, 'o': [w + 2, h + 2],
                     'neo': [round((w + 2) / 2, 1), round(1 + A['neoY'] * h, 1)], 'trang_thai': tt_meta}
        print('%-11s %-8s ô %3d×%-3d' % (id_, lp, w + 2, h + 2))
    with open(os.path.join(RA, 'axie.json'), 'w', encoding='utf-8') as fp:
        json.dump(meta, fp, ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
