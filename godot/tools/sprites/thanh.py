"""Công trình thành Ardhaven — tường, tháp, cổng, nhà, đài phun nước, đèn.

Mô hình đặt THẲNG LƯỚI Ô: trục X thế giới = trục x ô của Godot (xuống-phải trên màn), trục −Y thế
giới = trục y ô (xuống-trái). Một ô = S mét. Gốc (0,0,0) là TÂM chân đế công trình, nên Godot
đặt sprite sao cho điểm neo trùng tâm các ô chân đế.

Mỗi "trạng thái" là một công trình; bảng có một hàng cho mỗi góc trong XOAY (0°, 90°, 180°, 270°)
— nhà xoay được bốn mặt cửa, tường xoay hai chiều. Công trình nào không cần xoay thì vẽ đè cùng hình.
"""
import math
from rig import khop, khoi, vat_lieu

S = 64 / (math.sqrt(2) * 35.96)        # cạnh một ô đất (m) — suy từ ô 64×32 và thước 35,96 px/m
O = 256
NEO = (128, 176)
XOAY = [0.0, math.pi / 2, math.pi, 3 * math.pi / 2]
TOC_DO, KHUNG_TRUNG = {}, {}
CONG_TRINH = ['tuong', 'thap', 'cong', 'nha_a', 'nha_b', 'dai_phun', 'den', 'nha_c', 'thap_phap']
TRANG_THAI = {t: (1, 1.0, False) for t in CONG_TRINH}
BAM_DAT = {}
_G = {}


def dung(_):
    M = {
        'da': vat_lieu('da_tuong', (0.46, 0.44, 0.41)),
        'da2': vat_lieu('da_toi', (0.30, 0.29, 0.29)),
        'mai_do': vat_lieu('mai_do', (0.58, 0.17, 0.10)),
        'mai_lam': vat_lieu('mai_lam', (0.16, 0.26, 0.46)),
        'go': vat_lieu('go', (0.34, 0.21, 0.11)),
        'vua': vat_lieu('vua', (0.82, 0.76, 0.62)),
        'nuoc': vat_lieu('nuoc_dp', (0.24, 0.46, 0.78)),
        'den': vat_lieu('den_sang', (1.00, 0.78, 0.30)),
        'co': vat_lieu('co_cong', (0.62, 0.08, 0.10)),
        'vang': vat_lieu('vang_t', (0.85, 0.62, 0.18)),
    }
    goc = khop('goc')
    J = {'goc': goc, 'caL': khop('caL', goc), 'caR': khop('caR', goc)}

    # ── tường: dài đúng một ô theo X, cao 1,7 m (đủ thấp để thấy trong thành từ phía nam)
    t = khop('tuong', goc); J['tuong'] = t
    khoi('t_than', t, (S, 0.55, 1.55), (0, 0, 0.78), M['da'], vat=0.03)
    khoi('t_chan', t, (S, 0.65, 0.25), (0, 0, 0.125), M['da2'])
    for i in (-1, 1):
        khoi(f't_rang{i}', t, (S * 0.30, 0.6, 0.28), (i * S * 0.25, 0, 1.69), M['da'])

    # ── tháp góc: một ô, cao 2,9 m, mái nhọn
    th = khop('thap', goc); J['thap'] = th
    khoi('th_than', th, (S * 0.95, S * 0.95, 2.4), (0, 0, 1.2), M['da'], vat=0.04)
    khoi('th_dai', th, (S * 1.08, S * 1.08, 0.25), (0, 0, 2.45), M['da2'])
    bpy_cone(th, 'th_mai', 0.82 * S, 1.1, (0, 0, 3.1), M['mai_do'])

    # ── cổng: rộng HAI ô theo X, hai trụ ở hai mép, vòm trên cao 2,6 m cho người đi lọt
    c = khop('cong', goc); J['cong'] = c
    for i in (-1, 1):
        khoi(f'c_tru{i}', c, (0.55, 0.75, 2.6), (i * S * 0.95, 0, 1.3), M['da'], vat=0.04)
    khoi('c_vom', c, (2 * S + 0.5, 0.8, 0.5), (0, 0, 2.75), M['da2'])
    khoi('c_dinh', c, (2 * S + 0.6, 0.85, 0.12), (0, 0, 3.05), M['vang'])
    khoi('c_co', c, (0.6, 0.06, 0.8), (0, -0.43, 2.3), M['co'])

    # ── nhà A: 3×3 ô, tường đá, khung gỗ, mái đỏ hai mái
    a = khop('nha_a', goc); J['nha_a'] = a
    w = 3 * S - 0.4
    khoi('a_tuong', a, (w, w, 2.2), (0, 0, 1.1), M['vua'], vat=0.03)
    khoi('a_chan', a, (w + 0.1, w + 0.1, 0.35), (0, 0, 0.175), M['da'])
    for x in (-1, 1):
        for y in (-1, 1):
            khoi(f'a_cot{x}{y}', a, (0.2, 0.2, 2.2), (x * w / 2, y * w / 2, 1.1), M['go'])
    khoi('a_dam', a, (w + 0.05, w + 0.05, 0.16), (0, 0, 2.15), M['go'])
    khoi('a_cua', a, (0.9, 0.08, 1.4), (0, -w / 2 - 0.02, 0.7), M['go'])
    for x in (-0.9, 0.9):
        khoi(f'a_so{x}', a, (0.6, 0.06, 0.5), (x, -w / 2 - 0.02, 1.5), M['da2'])
    mai_hai(a, 'a_mai', w + 0.5, w + 0.5, 1.7, (0, 0, 2.2), M['mai_do'])

    # ── nhà B: 2×3 ô, gỗ, mái lam
    b = khop('nha_b', goc); J['nha_b'] = b
    bx, by = 2 * S - 0.3, 3 * S - 0.4
    khoi('b_tuong', b, (bx, by, 2.0), (0, 0, 1.0), M['go'], vat=0.03)
    khoi('b_chan', b, (bx + 0.1, by + 0.1, 0.3), (0, 0, 0.15), M['da2'])
    khoi('b_cua', b, (0.08, 0.9, 1.4), (bx / 2 + 0.02, 0, 0.7), M['vua'])
    mai_hai(b, 'b_mai', bx + 0.45, by + 0.45, 1.4, (0, 0, 2.0), M['mai_lam'])

    # ── nhà C — quán rượu 4×3 ô: hai tầng, tầng trên khung gỗ chìa ra, biển treo ở cửa
    q = khop('nha_c', goc); J['nha_c'] = q
    cx, cy = 4 * S - 0.4, 3 * S - 0.4
    khoi('q_tuong', q, (cx, cy, 2.0), (0, 0, 1.0), M['da'], vat=0.03)
    khoi('q_tang2', q, (cx + 0.3, cy + 0.3, 1.4), (0, 0, 2.7), M['vua'], vat=0.02)
    khoi('q_dam', q, (cx + 0.35, cy + 0.35, 0.16), (0, 0, 2.02), M['go'])
    for x in (-1, -0.33, 0.33, 1):
        khoi(f'q_kh{x}', q, (0.14, cy + 0.32, 1.4), (x * (cx + 0.3) / 2, 0, 2.7), M['go'])
    khoi('q_cua', q, (1.0, 0.08, 1.5), (0, -cy / 2 - 0.02, 0.75), M['go'])
    for x in (-1.6, 1.6):
        khoi(f'q_so{x}', q, (0.7, 0.06, 0.55), (x, -cy / 2 - 0.02, 1.3), M['den'])
        khoi(f'q_so2{x}', q, (0.6, 0.06, 0.5), (x, -cy / 2 - 0.17, 2.8), M['da2'])
    khoi('q_bien_can', q, (0.06, 0.7, 0.06), (0.9, -cy / 2 - 0.35, 1.95), M['go'])
    khoi('q_bien', q, (0.6, 0.05, 0.4), (0.9, -cy / 2 - 0.65, 1.68), M['vang'])
    khoi('q_ong', q, (0.5, 0.5, 1.2), (cx / 2 - 0.6, cy / 4, 4.3), M['da2'])
    mai_hai(q, 'q_mai', cx + 0.8, cy + 0.8, 1.5, (0, 0, 3.4), M['mai_do'], ngang=True)

    # ── tháp pháp sư 2×2 ô: thân tròn, mái chóp lam, cửa vòm, ô cửa sáng
    p = khop('thap_phap', goc); J['thap_phap'] = p
    khoi('p_de', p, (2 * S - 0.1, 2 * S - 0.1, 0.4), (0, 0, 0.2), M['da2'], dang='cyl')
    khoi('p_than', p, (2 * S - 0.4, 2 * S - 0.4, 3.6), (0, 0, 2.0), M['da'], dang='cyl')
    khoi('p_vanh', p, (2 * S - 0.1, 2 * S - 0.1, 0.25), (0, 0, 3.85), M['da2'], dang='cyl')
    khoi('p_cua', p, (0.8, 0.12, 1.4), (0, -(S - 0.18), 0.9), M['go'])
    for z in (2.2, 3.2):
        khoi(f'p_so{z}', p, (0.35, 0.12, 0.45), (0, -(S - 0.2), z), M['den'])
    bpy_cone(p, 'p_mai', S * 1.08, 1.9, (0, 0, 4.9), M['mai_lam'], dinh=12)
    khoi('p_ngoc', p, (0.25, 0.25, 0.25), (0, 0, 5.95), M['vang'], dang='sphere')

    # ── đài phun nước: 2×2 ô
    d = khop('dai_phun', goc); J['dai_phun'] = d
    khoi('d_be', d, (2 * S - 0.1, 2 * S - 0.1, 0.55), (0, 0, 0.275), M['da'], dang='cyl')
    khoi('d_nuoc', d, (2 * S - 0.45, 2 * S - 0.45, 0.08), (0, 0, 0.52), M['nuoc'], dang='cyl')
    khoi('d_tru', d, (0.35, 0.35, 1.4), (0, 0, 0.9), M['da2'], dang='cyl')
    khoi('d_dia', d, (1.0, 1.0, 0.12), (0, 0, 1.45), M['da'], dang='cyl')
    khoi('d_tia', d, (0.22, 0.22, 0.55), (0, 0, 1.8), M['nuoc'], dang='cyl')

    # ── đèn đường: cột 2,3 m, lồng đèn sáng
    e = khop('den', goc); J['den'] = e
    khoi('e_chan', e, (0.35, 0.35, 0.2), (0, 0, 0.1), M['da2'])
    khoi('e_cot', e, (0.12, 0.12, 2.1), (0, 0, 1.15), M['go'])
    khoi('e_long', e, (0.32, 0.32, 0.36), (0, 0, 2.3), M['den'])
    khoi('e_mu', e, (0.42, 0.42, 0.1), (0, 0, 2.53), M['da2'])
    _G.update(J)
    return J


def bpy_cone(cha, ten, r, cao, vi_tri, mat, dinh=4):
    import bpy
    bpy.ops.mesh.primitive_cone_add(vertices=dinh, radius1=r, depth=cao)
    o = bpy.context.active_object
    o.name = ten
    o.location = vi_tri
    o.rotation_euler = (0, 0, math.pi / 4 if dinh == 4 else 0)
    o.parent = cha
    o.data.materials.append(mat)


def mai_hai(cha, ten, dai_x, dai_y, cao, vi_tri, mat, ngang=False):
    """Mái hai mái: lăng trụ tam giác, sống mái chạy theo trục Y (ngang=True: theo trục X)."""
    import bpy
    import bmesh
    if ngang:
        dai_x, dai_y = dai_y, dai_x
    me = bpy.data.meshes.new(ten)
    bm = bmesh.new()
    hx, hy = dai_x / 2, dai_y / 2
    v = [bm.verts.new(p) for p in [(-hx, -hy, 0), (hx, -hy, 0), (0, -hy, cao),
                                    (-hx, hy, 0), (hx, hy, 0), (0, hy, cao)]]
    for f in [(0, 1, 2), (3, 5, 4), (0, 3, 4, 1), (0, 2, 5, 3), (1, 4, 5, 2)]:
        bm.faces.new([v[i] for i in f])
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(ten, me)
    bpy.context.collection.objects.link(o)
    o.location = vi_tri
    if ngang:
        o.rotation_euler = (0, 0, math.pi / 2)
    o.parent = cha
    o.data.materials.append(mat)


def dat_tu_the(J, tt, k, n):
    for ten in CONG_TRINH:
        J[ten].scale = (1, 1, 1) if ten == tt else (0, 0, 0)
    return {'L': (0, 0, 0, True), 'R': (0, 0, 0, True)}
