"""Người thường (NPC, dân làng) — CÙNG khung xương và CÙNG chuyển động với Dark Knight.

Dùng lại nguyên tư thế của `hiep_si.py` (IK chân bám đất, sải, tốc độ), chỉ thay QUẦN ÁO và
VẬT CẦM TAY. Nhờ vậy dân làng đi lại trên phố cũng qua được cổng vật lý như nhân vật chính.
Khớp `kiem` vẫn mang tên cũ: đó là "vật cầm tay phải" — búa, gậy, hay để trống.
"""
import math
from rig import khop, khoi, vat_lieu
import hiep_si as H

DUI, CANG, MAT_CA = H.DUI, H.CANG, H.MAT_CA
TOC_DO = {'walk': H.TOC_DO['walk']}
KHUNG_TRUNG = {}
BAM_DAT = {}
TRANG_THAI = {'idle': H.TRANG_THAI['idle'], 'walk': H.TRANG_THAI['walk']}
dat_tu_the = H.dat_tu_the

KIEU = {
    #           áo           áo phụ         tóc            da              vật cầm
    'tho_ren': ((0.42, 0.26, 0.14), (0.20, 0.20, 0.22), (0.18, 0.12, 0.08), (0.78, 0.54, 0.40), 'bua'),
    'co_gai':  ((0.70, 0.16, 0.16), (0.92, 0.88, 0.80), (0.86, 0.62, 0.22), (0.92, 0.72, 0.58), None),
    'phap_su': ((0.30, 0.18, 0.50), (0.85, 0.70, 0.25), (0.92, 0.92, 0.95), (0.82, 0.64, 0.52), 'gay'),
    'thu_kho': ((0.30, 0.34, 0.24), (0.55, 0.42, 0.26), (0.30, 0.22, 0.16), (0.80, 0.60, 0.46), 'so'),
    'dan_a':   ((0.24, 0.42, 0.30), (0.50, 0.36, 0.22), (0.30, 0.20, 0.12), (0.80, 0.60, 0.46), None),
    'dan_b':   ((0.26, 0.34, 0.58), (0.48, 0.44, 0.40), (0.10, 0.08, 0.08), (0.70, 0.50, 0.36), None),
    'dan_c':   ((0.62, 0.52, 0.30), (0.40, 0.30, 0.22), (0.62, 0.36, 0.20), (0.88, 0.68, 0.54), None),
}


def dung_nguoi(kieu):
    ao, phu, toc, da, cam = KIEU[kieu]
    M = {'ao': vat_lieu('ao_' + kieu, ao), 'phu': vat_lieu('phu_' + kieu, phu),
         'toc': vat_lieu('toc_' + kieu, toc), 'da': vat_lieu('da_' + kieu, da),
         'giay': vat_lieu('giay_n', (0.22, 0.14, 0.08)), 'quan': vat_lieu('quan_n', (0.28, 0.24, 0.22)),
         'mat': vat_lieu('mat_n', (0.08, 0.06, 0.06)), 'go': vat_lieu('go_n', (0.40, 0.26, 0.14)),
         'sat': vat_lieu('sat_n', (0.55, 0.57, 0.62)), 'ngoc': vat_lieu('ngoc_n', (0.40, 0.85, 1.0)),
         'giay2': vat_lieu('giay_so', (0.86, 0.80, 0.62))}
    J = {}
    goc = khop('goc'); J['goc'] = goc
    hong = khop('hong', goc, (0, 0, H.HONG_CAO)); J['hong'] = hong
    vay = kieu in ('co_gai', 'phap_su')
    khoi('hong_k', hong, (0.28, 0.18, 0.16), (0, 0, 0.02), M['quan'] if not vay else M['ao'])
    if kieu == 'phap_su':
        khoi('ao_dai', hong, (0.36, 0.30, 0.70), (0, 0, -0.30), M['ao'])        # áo choàng dài tới gối
    elif kieu == 'co_gai':
        khoi('vay', hong, (0.38, 0.30, 0.42), (0, 0, -0.16), M['ao'])
        khoi('tap_de', hong, (0.24, 0.03, 0.38), (0, 0.16, -0.14), M['phu'])
    elif kieu == 'tho_ren':
        khoi('tap_de', hong, (0.30, 0.04, 0.50), (0, 0.13, -0.12), M['phu'])
    than = khop('than', hong, (0, 0, 0.12)); J['than'] = than
    khoi('nguc', than, (0.36, 0.22, 0.36), (0, 0, 0.20), M['ao'], vat=0.03)
    if kieu == 'thu_kho':
        khoi('ao_gile', than, (0.38, 0.235, 0.30), (0, 0, 0.22), M['phu'])
    if kieu == 'tho_ren':
        khoi('tap_de_tren', than, (0.26, 0.03, 0.30), (0, 0.12, 0.16), M['phu'])
    co = khop('co', than, (0, 0, 0.40))
    dau = khop('dau', co, (0, 0, 0.05)); J['dau'] = dau
    khoi('mat_k', dau, (0.22, 0.22, 0.24), (0, 0.01, 0.11), M['da'], vat=0.04)
    for x in (-0.05, 0.05):
        khoi(f'mat{x}', dau, (0.035, 0.02, 0.035), (x, 0.125, 0.13), M['mat'])
    if kieu == 'phap_su':
        khoi('rau', dau, (0.16, 0.06, 0.18), (0, 0.11, 0.0), M['toc'])
        _non(dau, 'non', 0.20, 0.45, (0, 0, 0.42), M['ao'])
        khoi('vanh_non', dau, (0.34, 0.34, 0.04), (0, 0, 0.23), M['ao'])
    elif kieu == 'co_gai':
        khoi('toc_k', dau, (0.25, 0.25, 0.10), (0, -0.01, 0.23), M['toc'])
        khoi('toc_sau', dau, (0.24, 0.08, 0.34), (0, -0.11, 0.02), M['toc'])
    elif kieu == 'tho_ren':
        khoi('toc_k', dau, (0.23, 0.23, 0.05), (0, -0.02, 0.23), M['toc'])
        khoi('rau', dau, (0.18, 0.05, 0.10), (0, 0.11, 0.01), M['toc'])
    elif kieu == 'thu_kho':
        khoi('mu', dau, (0.26, 0.28, 0.08), (0, 0.02, 0.25), M['phu'])
    else:
        khoi('toc_k', dau, (0.24, 0.24, 0.07), (0, -0.01, 0.23), M['toc'])
    for ten, s in (('L', -1), ('R', 1)):
        vai = khop('vai' + ten, than, (s * 0.21, 0, 0.33)); J['vai' + ten] = vai
        khoi('tay_tren' + ten, vai, (0.10, 0.10, H.TAY_TREN), (0, 0, -H.TAY_TREN / 2), M['ao'])
        khuyu = khop('khuyu' + ten, vai, (0, 0, -H.TAY_TREN)); J['khuyu' + ten] = khuyu
        khoi('tay_duoi' + ten, khuyu, (0.09, 0.09, H.TAY_DUOI), (0, 0, -H.TAY_DUOI / 2),
             M['da'] if kieu in ('tho_ren', 'co_gai') else M['ao'])
        ban = khop('ban_tay' + ten, khuyu, (0, 0, -H.TAY_DUOI)); J['tay' + ten] = ban
        khoi('ban' + ten, ban, (0.08, 0.08, 0.08), (0, 0, -0.02), M['da'])
        hc = khop('hong' + ten, hong, (s * H.HONG_RONG, 0, 0)); J['hong' + ten] = hc
        khoi('dui' + ten, hc, (0.12, 0.13, DUI), (0, 0, -DUI / 2), M['quan'])
        goi = khop('goi' + ten, hc, (0, 0, -DUI)); J['goi' + ten] = goi
        khoi('cang' + ten, goi, (0.11, 0.12, CANG), (0, 0, -CANG / 2), M['quan'])
        ca = khop('ca' + ten, goi, (0, 0, -CANG)); J['ca' + ten] = ca
        khoi('giay' + ten, ca, (0.12, 0.22, 0.08), (0, 0.04, -0.04), M['giay'])
    k = khop('kiem', J['tayR'], (0, 0, -0.04)); J['kiem'] = k
    if cam == 'bua':
        khoi('can_bua', k, (0.04, 0.04, 0.45), (0, 0, 0.20), M['go'])
        khoi('dau_bua', k, (0.16, 0.10, 0.10), (0, 0, 0.44), M['sat'])
    elif cam == 'gay':
        khoi('gay', k, (0.04, 0.04, 1.30), (0, 0, 0.40), M['go'])
        khoi('ngoc_gay', k, (0.10, 0.10, 0.10), (0, 0, 1.08), M['ngoc'], dang='sphere')
    elif cam == 'so':
        khoi('so_sach', k, (0.16, 0.05, 0.20), (0, 0, 0.06), M['giay2'])
    return J


def _non(cha, ten, r, cao, vi_tri, mat):
    import bpy
    bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=r, depth=cao)
    o = bpy.context.active_object
    o.name = ten
    o.location = vi_tri
    o.rotation_euler = (-0.25, 0, 0)
    o.parent = cha
    o.data.materials.append(mat)
