"""Đồ vật nhỏ — nội thất trong nhà (quầy, đe, lò rèn, kệ sách, rương…) và đồ phố (sạp chợ, giếng,
hàng rào, thùng, hòm). Cùng hợp đồng toạ độ với `thanh.py`: gốc (0,0,0) là TÂM chân đế, trục X thế
giới = trục x ô Godot, trục −Y thế giới = trục y ô.

    python3 godot/tools/sprites/render.py do_vat

Ô 128 (nhỏ hơn công trình 256) — món to nhất là quầy 2×1 ô và sạp chợ 2×1 ô.
"""
import math
from rig import khop, khoi, vat_lieu
from thanh import S

O = 128
NEO = (64, 100)
XOAY = [0.0, math.pi / 2, math.pi, 3 * math.pi / 2]
TOC_DO, KHUNG_TRUNG, BAM_DAT = {}, {}, {}
DO = ['tuong_trong', 'tuong_so', 'cot_goc', 'quay', 'de_ren', 'lo_ren', 'thung', 'hom', 'ruong',
      'ke_sach', 'ke_ruou', 'ban', 'ghe', 'cau_tinh', 'gia_vk', 'sap_cho', 'gieng', 'hang_rao']
TRANG_THAI = {t: (1, 1.0, False) for t in DO}


def dung(_):
    M = {k: vat_lieu('dv_' + k, c) for k, c in {
        'go': (0.36, 0.22, 0.11), 'go2': (0.24, 0.14, 0.07), 'go3': (0.52, 0.36, 0.20),
        'vua': (0.80, 0.74, 0.60), 'da': (0.46, 0.44, 0.41), 'da2': (0.28, 0.27, 0.28),
        'sat': (0.38, 0.40, 0.45), 'sat2': (0.62, 0.64, 0.70), 'lua': (1.0, 0.52, 0.12),
        'than': (0.95, 0.30, 0.06), 'vang': (0.88, 0.66, 0.18), 'do': (0.62, 0.12, 0.10),
        'lam': (0.16, 0.30, 0.62), 'luc': (0.18, 0.44, 0.22), 'tim': (0.42, 0.22, 0.62),
        'kinh': (0.55, 0.85, 1.0), 'nuoc': (0.22, 0.44, 0.74), 'trang': (0.88, 0.86, 0.80),
        'chai_l': (0.20, 0.55, 0.30), 'chai_d': (0.62, 0.16, 0.18), 'vai': (0.70, 0.62, 0.42),
    }.items()}
    goc = khop('goc')
    J = {'goc': goc, 'caL': khop('caL', goc), 'caR': khop('caR', goc)}

    def nhom(ten):
        J[ten] = khop(ten, goc)
        return J[ten]

    # tường trong nhà: một ô theo X, mỏng, cao 2,0 m — vẽ ở MÉP SAU phòng
    t = nhom('tuong_trong')
    khoi('tt_than', t, (S, 0.22, 2.0), (0, 0, 1.0), M['vua'])
    khoi('tt_chan', t, (S, 0.26, 0.30), (0, 0, 0.15), M['go2'])
    khoi('tt_dam', t, (S, 0.26, 0.12), (0, 0, 1.96), M['go'])
    khoi('tt_cot', t, (0.14, 0.26, 2.0), (S / 2 - 0.07, 0, 1.0), M['go'])
    t = nhom('tuong_so')
    khoi('ts_than', t, (S, 0.22, 2.0), (0, 0, 1.0), M['vua'])
    khoi('ts_chan', t, (S, 0.26, 0.30), (0, 0, 0.15), M['go2'])
    khoi('ts_dam', t, (S, 0.26, 0.12), (0, 0, 1.96), M['go'])
    khoi('ts_kinh', t, (0.55, 0.24, 0.55), (0, 0, 1.25), M['kinh'])
    khoi('ts_khung', t, (0.65, 0.25, 0.08), (0, 0, 0.94), M['go'])
    khoi('ts_khung2', t, (0.06, 0.25, 0.55), (0, 0, 1.25), M['go'])
    khoi('ts_cot', t, (0.14, 0.26, 2.0), (S / 2 - 0.07, 0, 1.0), M['go'])
    t = nhom('cot_goc')
    khoi('cg', t, (0.30, 0.30, 2.05), (0, 0, 1.02), M['go'])

    # quầy 2×1 ô (dài theo X)
    t = nhom('quay')
    L = 2 * S - 0.2
    khoi('q_than', t, (L, 0.62, 0.95), (0, 0, 0.475), M['go'], vat=0.02)
    khoi('q_mat', t, (L + 0.1, 0.72, 0.08), (0, 0, 0.98), M['go3'])
    for i in (-1, 0, 1):
        khoi(f'q_van{i}', t, (0.06, 0.64, 0.80), (i * L / 3, 0, 0.45), M['go2'])
    khoi('q_so', t, (0.30, 0.22, 0.04), (0.3, 0.05, 1.04), M['trang'])

    # đe rèn
    t = nhom('de_ren')
    khoi('d_goc', t, (0.36, 0.36, 0.42), (0, 0, 0.21), M['go2'])
    khoi('d_than', t, (0.26, 0.18, 0.18), (0, 0, 0.51), M['sat'])
    khoi('d_mat', t, (0.62, 0.24, 0.14), (0.04, 0, 0.67), M['sat'])
    khoi('d_mui', t, (0.18, 0.12, 0.10), (0.40, 0, 0.68), M['sat'])
    khoi('d_bua', t, (0.06, 0.30, 0.04), (-0.05, 0.0, 0.76), M['go'])

    # lò rèn: khối gạch, than hồng, ống khói
    t = nhom('lo_ren')
    khoi('l_than', t, (S * 0.92, S * 0.80, 0.85), (0, 0, 0.425), M['da'], vat=0.03)
    khoi('l_mieng', t, (S * 0.70, S * 0.55, 0.06), (0, 0, 0.86), M['than'])
    khoi('l_lua', t, (S * 0.40, S * 0.30, 0.22), (0, 0, 0.98), M['lua'])
    khoi('l_ong', t, (0.42, 0.42, 1.25), (0, 0.18, 1.48), M['da2'])
    khoi('l_hut', t, (S * 0.80, S * 0.68, 0.30), (0, 0.0, 1.95), M['da2'])

    # thùng gỗ tròn
    t = nhom('thung')
    khoi('th_than', t, (0.62, 0.62, 0.85), (0, 0, 0.425), M['go'], dang='cyl')
    for z in (0.18, 0.67):
        khoi(f'th_dai{z}', t, (0.66, 0.66, 0.06), (0, 0, z), M['sat'], dang='cyl')
    khoi('th_nap', t, (0.56, 0.56, 0.03), (0, 0, 0.86), M['go3'], dang='cyl')

    # hòm gỗ
    t = nhom('hom')
    khoi('h_than', t, (0.70, 0.70, 0.65), (0, 0, 0.325), M['go3'], vat=0.02)
    for x in (-1, 1):
        khoi(f'h_nep{x}', t, (0.08, 0.72, 0.66), (x * 0.31, 0, 0.33), M['go'])
    khoi('h_cheo', t, (0.72, 0.04, 0.10), (0, -0.36, 0.33), M['go'], xoay=(0, 0.75, 0))

    # rương có khoá vàng
    t = nhom('ruong')
    khoi('r_than', t, (0.85, 0.55, 0.48), (0, 0, 0.24), M['go'], vat=0.02)
    khoi('r_nap', t, (0.87, 0.57, 0.18), (0, 0, 0.56), M['go3'], dang='cube')
    for x in (-1, 1):
        khoi(f'r_dai{x}', t, (0.06, 0.59, 0.68), (x * 0.30, 0, 0.33), M['sat'])
    khoi('r_khoa', t, (0.12, 0.04, 0.14), (0, -0.29, 0.44), M['vang'])

    # kệ sách: một ô theo X, cao 2 m
    for ten, mau in (('ke_sach', ('do', 'lam', 'luc', 'tim', 'vang')),
                     ('ke_ruou', ('chai_l', 'chai_d', 'vang', 'chai_l', 'kinh'))):
        t = nhom(ten)
        khoi(ten + '_lung', t, (S * 0.95, 0.10, 2.0), (0, 0.18, 1.0), M['go2'])
        for x in (-1, 1):
            khoi(f'{ten}_hong{x}', t, (0.08, 0.42, 2.0), (x * S * 0.46, 0, 1.0), M['go'])
        for k, z in enumerate((0.05, 0.55, 1.05, 1.55, 1.98)):
            khoi(f'{ten}_tang{k}', t, (S * 0.95, 0.42, 0.06), (0, 0, z), M['go'])
        r = 0
        for k, z in enumerate((0.08, 0.58, 1.08, 1.58)):
            for i in range(6):
                x = -S * 0.40 + i * S * 0.16
                m = M[mau[(i + k) % len(mau)]]
                if ten == 'ke_sach':
                    khoi(f'{ten}_s{k}{i}', t, (0.12, 0.30, 0.36 - 0.04 * (i % 2)), (x, -0.02, z + 0.19), m)
                else:
                    khoi(f'{ten}_s{k}{i}', t, (0.12, 0.12, 0.30), (x, -0.04, z + 0.16), m, dang='cyl')
                r += 1

    # bàn + ghế đẩu
    t = nhom('ban')
    khoi('b_mat', t, (S * 0.85, S * 0.85, 0.08), (0, 0, 0.74), M['go3'])
    khoi('b_chan', t, (0.16, 0.16, 0.72), (0, 0, 0.36), M['go'])
    khoi('b_de', t, (0.55, 0.55, 0.06), (0, 0, 0.03), M['go2'])
    khoi('b_coc', t, (0.10, 0.10, 0.14), (0.15, 0.1, 0.85), M['vang'], dang='cyl')
    t = nhom('ghe')
    khoi('g_mat', t, (0.40, 0.40, 0.08), (0, 0, 0.46), M['go3'], dang='cyl')
    for x in (-1, 1):
        for y in (-1, 1):
            khoi(f'g_chan{x}{y}', t, (0.06, 0.06, 0.44), (x * 0.12, y * 0.12, 0.22), M['go'])

    # quả cầu tinh thể trên bệ đá — tiệm phép
    t = nhom('cau_tinh')
    khoi('c_de', t, (0.55, 0.55, 0.16), (0, 0, 0.08), M['da2'], dang='cyl')
    khoi('c_tru', t, (0.24, 0.24, 0.75), (0, 0, 0.53), M['da'], dang='cyl')
    khoi('c_dia', t, (0.42, 0.42, 0.08), (0, 0, 0.92), M['da2'], dang='cyl')
    khoi('c_cau', t, (0.44, 0.44, 0.44), (0, 0, 1.18), M['kinh'], dang='sphere')

    # giá vũ khí: hai kiếm + một khiên
    t = nhom('gia_vk')
    khoi('v_doc', t, (0.08, 0.08, 1.4), (-S * 0.42, 0, 0.7), M['go'])
    khoi('v_doc2', t, (0.08, 0.08, 1.4), (S * 0.42, 0, 0.7), M['go'])
    khoi('v_ngang', t, (S * 0.95, 0.08, 0.08), (0, 0, 1.2), M['go'])
    khoi('v_ngang2', t, (S * 0.95, 0.08, 0.08), (0, 0, 0.35), M['go'])
    for x in (-0.25, 0.05):
        khoi(f'v_kiem{x}', t, (0.07, 0.03, 1.05), (x, -0.07, 0.75), M['sat2'])
        khoi(f'v_chuoi{x}', t, (0.22, 0.05, 0.05), (x, -0.07, 1.15), M['vang'])
    khoi('v_khien', t, (0.38, 0.06, 0.50), (0.35, -0.08, 0.75), M['do'])
    khoi('v_khien2', t, (0.12, 0.07, 0.30), (0.35, -0.10, 0.75), M['vang'])

    # sạp chợ 2×1 ô: quầy gỗ, cột, mái vải sọc
    t = nhom('sap_cho')
    L = 2 * S - 0.3
    khoi('s_quay', t, (L, 0.70, 0.85), (0, 0, 0.425), M['go'], vat=0.02)
    for x in (-1, 1):
        for y in (-1, 1):
            khoi(f's_cot{x}{y}', t, (0.08, 0.08, 2.1), (x * L / 2, y * 0.42, 1.05), M['go2'])
    for i in range(5):
        khoi(f's_mai{i}', t, (L / 5 + 0.01, 1.1, 0.06), (-L / 2 + L / 10 + i * L / 5, 0, 2.12),
             M['do'] if i % 2 == 0 else M['trang'], xoay=(0.18, 0, 0))
    for i, m in enumerate(('vang', 'luc', 'do', 'vai')):
        khoi(f's_hang{i}', t, (0.30, 0.30, 0.18), (-L / 2 + 0.35 + i * 0.55, 0, 0.94), M[m])

    # giếng đá
    t = nhom('gieng')
    khoi('gi_than', t, (S * 0.92, S * 0.92, 0.70), (0, 0, 0.35), M['da'], dang='cyl')
    khoi('gi_nuoc', t, (S * 0.70, S * 0.70, 0.04), (0, 0, 0.66), M['nuoc'], dang='cyl')
    for x in (-1, 1):
        khoi(f'gi_cot{x}', t, (0.10, 0.10, 1.4), (x * S * 0.42, 0, 1.05), M['go'])
    khoi('gi_xa', t, (S * 0.92, 0.08, 0.08), (0, 0, 1.70), M['go'])
    khoi('gi_mai', t, (S * 1.05, 0.95, 0.06), (0, 0, 1.86), M['go2'])
    khoi('gi_xo', t, (0.20, 0.20, 0.22), (0.05, 0, 1.25), M['go3'], dang='cyl')

    # hàng rào gỗ một ô theo X
    t = nhom('hang_rao')
    for x in (-1, 1):
        khoi(f'hr_cot{x}', t, (0.10, 0.10, 0.95), (x * (S / 2 - 0.06), 0, 0.475), M['go2'])
    for z in (0.35, 0.75):
        khoi(f'hr_ngang{z}', t, (S, 0.06, 0.10), (0, 0, z), M['go'])
    return J


def dat_tu_the(J, tt, k, n):
    for ten in DO:
        J[ten].scale = (1, 1, 1) if ten == tt else (0, 0, 0)
    return {'L': (0, 0, 0, True), 'R': (0, 0, 0, True)}
