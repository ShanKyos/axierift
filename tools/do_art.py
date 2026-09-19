#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ĐO ĐỘ ĐỒNG NHẤT CỦA ART — đo, không đoán.

Quét mọi tệp ảnh trong public/game/assets, đo sáu chỉ số cho từng tấm, rồi gom
theo NHÓM (thứ người chơi nhìn thấy CẠNH NHAU) và chấm độ tản của từng nhóm.

⚠ Vì sao gom theo "nhìn thấy cạnh nhau" chứ không theo thư mục: một tấm nền map
sáng 0,72 đứng cạnh một con quái sáng 0,13 là một vấn đề THẬT; hai icon trong hai
bảng khác nhau lệch nhau thì không ai thấy. Thư mục là cách xếp tệp, không phải
cách người chơi nhìn.

Chỉ số, và mỗi cái trả lời một câu khác nhau:
  sang    — sáng trung bình trên điểm ảnh ĐẶC (alpha>200). Lệch nhiều thì art
            chìm hoặc chói khi đứng cạnh nhau.
  bh      — bão hoà trung bình. Đây là trục "kẹo Axie" ↔ "thép xám MU".
  lech    — lệch chuẩn độ sáng BÊN TRONG tấm. Dưới ~0,12 là một khối một sắc,
            ở cỡ nhỏ đọc ra một cái bóng (vết sẹo `tq_corran` đã ghi ở CLAUDE.md).
  vien    — tỉ lệ điểm ảnh đặc gần-ĐEN (L<0,18). Đây là chữ ký "có nét bao" —
            trục phân biệt art Axie chính chủ với art dựng máy.
  am      — tông ấm/lạnh: (R−B) trung bình, chuẩn hoá. Dương là ấm.
  trong   — tỉ lệ điểm ảnh trong suốt. 0 nghĩa là tấm ĐẶC (nền), >0 là sprite.
"""
import sys, os, json, math
from pathlib import Path
import numpy as np
from PIL import Image

GOC = Path(__file__).resolve().parent.parent
AS  = GOC / 'public/game/assets'

# ── NHÓM: thứ người chơi nhìn thấy CẠNH NHAU trong cùng một khung hình ────────
# (mẫu đường dẫn tương đối với assets/, khớp theo tiền tố)
NHOM = [
    ('nen_map',    ['iso/nen_', 'maps/'],            'mặt đất — nền cho mọi thứ khác đứng lên'),
    ('vat_iso',    ['iso/'],                          'cây · đá · vật thể rải trên map'),
    ('quai',       ['mobs/'],                         'quái + trùm, đứng trên nền map'),
    ('thu_nen',    ['thu/'],                          'đàn thú hoang, đứng trên nền map'),
    ('axie',       ['chimera/', 'avatar/'],           'thân người chơi (Axie) — trên màn 100% thời gian'),
    ('nhan_vat',   ['nv/'],                           'lớp nhân vật + giáp + vũ khí cầm tay'),
    ('npc',        ['npcs/'],                         'NPC đứng trong thành và trên map'),
    ('vfx',        ['vfx/', 'skills/'],               'tấm dán chiêu — nổ đè lên map'),
    ('icon_ui',    ['ui/', 'items/', 'bando/'],       'icon trong bảng, nền panel TỐI'),
    ('man_cho',    ['title/'],                        'màn chờ — thứ tải đầu tiên'),
    ('canh_pet',   ['canh/', 'pets/', 'trees/'],      'cánh · thú cưỡi · cây cũ'),
]

def nhom_cua(rel):
    for ten, tien, _ in NHOM:
        for t in tien:
            if rel.startswith(t): return ten
    return 'khac'

def do_anh(p):
    try:
        im = Image.open(p).convert('RGBA')
    except Exception as e:
        return None
    if im.width * im.height > 40_000_000:      # bảng khung khổng lồ — lấy mẫu
        im = im.resize((im.width // 4, im.height // 4), Image.NEAREST)
    a = np.asarray(im, dtype=np.float32) / 255.0
    rgb, al = a[..., :3], a[..., 3]
    dac = al > 0.78
    n = int(dac.sum())
    if n < 24: return None                      # tấm gần như rỗng, không đo được
    px = rgb[dac]
    L  = px.max(1) * 0.5 + px.min(1) * 0.5      # HSL lightness
    mx, mn = px.max(1), px.min(1)
    s  = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    return dict(
        w=im.width, h=im.height, n=n,
        sang=float(L.mean()), bh=float(s.mean()), lech=float(L.std()),
        vien=float((L < 0.18).mean()),
        am=float((px[:, 0] - px[:, 2]).mean()),
        trong=float((al < 0.08).mean()),
    )

def main():
    rows = []
    for p in sorted(AS.rglob('*')):
        if p.suffix.lower() not in ('.png', '.webp', '.jpg', '.jpeg'): continue
        rel = str(p.relative_to(AS))
        d = do_anh(p)
        if not d: continue
        d['rel'] = rel; d['nhom'] = nhom_cua(rel); d['kb'] = p.stat().st_size // 1024
        rows.append(d)
    out = GOC / 'docs/DO_ART.json'
    out.write_text(json.dumps(rows, ensure_ascii=False), encoding='utf-8')
    print(f'{len(rows)} tấm  →  {out.relative_to(GOC)}')

    print(f'\n{"nhóm":12s} {"n":>4s} {"sáng":>13s} {"bão hoà":>13s} {"lệch":>6s} {"viền":>6s} {"ấm":>7s}')
    for ten, _, mo in NHOM + [('khac', [], '')]:
        g = [r for r in rows if r['nhom'] == ten]
        if not g: continue
        f = lambda k: np.array([r[k] for r in g])
        sg, bh = f('sang'), f('bh')
        print(f'{ten:12s} {len(g):4d} '
              f'{sg.mean():.3f}±{sg.std():.3f} {bh.mean():.3f}±{bh.std():.3f} '
              f'{f("lech").mean():6.3f} {f("vien").mean():6.3f} {f("am").mean():+7.3f}   {mo}')

if __name__ == '__main__':
    main()
