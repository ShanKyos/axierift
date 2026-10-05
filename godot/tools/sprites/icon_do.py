"""Icon vật phẩm trong túi đồ 32×32 — vũ khí, giáp, bình thuốc, sách chiêu.

    python3 godot/tools/sprites/render.py icon_do

Cùng đường render với nhân vật (chiếu song song 30°, bảng màu giới hạn, viền 1 px) nên icon trong
túi và đồ trên người đọc ra cùng một chất liệu. Thước phóng to (PX_M 64) — icon là ảnh cận cảnh.
"""
import math
from rig import khop, khoi, vat_lieu

O = 32
NEO = (16, 27)
PX_M = 64
XOAY = [0.0]
TOC_DO, KHUNG_TRUNG = {}, {}
DO = ['kiem_ngan', 'kiem_dai', 'dai_kiem', 'giap_da', 'giap_xich', 'giap_tam',
      'binh_mau_nho', 'binh_mau', 'binh_mana_nho', 'binh_mana', 'sach_chieu',
      'tui', 'ban_do', 'chieu_chem_xoay']
TRANG_THAI = {t: (1, 1.0, False) for t in DO}
BAM_DAT = {t: t for t in DO}           # icon đặt chạm đáy ô, không lún, không lơ lửng


def dung(_):
    M = {k: vat_lieu('ic_' + k, c) for k, c in {
        'sat': (0.62, 0.64, 0.70), 'sat2': (0.80, 0.82, 0.88), 'thep': (0.46, 0.50, 0.60),
        'vang': (0.88, 0.66, 0.18), 'da': (0.42, 0.26, 0.14), 'da2': (0.30, 0.18, 0.10),
        'xich': (0.50, 0.52, 0.56), 'do': (0.85, 0.12, 0.12), 'lam': (0.18, 0.36, 0.95),
        'kinh': (0.80, 0.90, 0.95), 'nut': (0.50, 0.32, 0.16), 'giay': (0.86, 0.80, 0.62),
        'tim': (0.48, 0.20, 0.64), 'ngoc': (0.30, 0.85, 1.0),
    }.items()}
    goc = khop('goc')
    J = {'goc': goc, 'caL': khop('caL', goc), 'caR': khop('caR', goc)}

    def nhom(ten, nghieng=0.0):
        J[ten] = khop(ten, goc)
        J[ten].rotation_euler = (0, nghieng, math.radians(45))   # quay mặt về camera
        return J[ten]

    for ten, dai, rong, chuoi in (('kiem_ngan', 0.20, 0.040, 'da'), ('kiem_dai', 0.25, 0.045, 'vang'),
                                  ('dai_kiem', 0.27, 0.065, 'vang')):
        t = nhom(ten, math.radians(-30))
        khoi(ten + 'l', t, (rong, 0.015, dai), (0, 0, 0.10 + dai / 2), M['sat2'])
        khoi(ten + 'g', t, (rong * 3.0, 0.03, 0.03), (0, 0, 0.09), M[chuoi])
        khoi(ten + 'c', t, (0.03, 0.03, 0.07), (0, 0, 0.045), M['da2'])
        khoi(ten + 'n', t, (0.045, 0.045, 0.03), (0, 0, 0.01), M[chuoi])

    for ten, than, vien in (('giap_da', 'da', 'da2'), ('giap_xich', 'xich', 'thep'),
                            ('giap_tam', 'thep', 'vang')):
        t = nhom(ten)
        khoi(ten + 't', t, (0.20, 0.10, 0.21), (0, 0, 0.15), M[than], vat=0.015)
        for x in (-1, 1):
            khoi(f'{ten}v{x}', t, (0.08, 0.11, 0.06), (x * 0.13, 0, 0.23), M[vien])
        khoi(ten + 'd', t, (0.21, 0.11, 0.03), (0, 0, 0.06), M[vien])
        if ten == 'giap_tam':
            khoi(ten + 'x', t, (0.03, 0.11, 0.15), (0, 0, 0.15), M['vang'])

    for ten, r, mau in (('binh_mau_nho', 0.13, 'do'), ('binh_mau', 0.17, 'do'),
                        ('binh_mana_nho', 0.13, 'lam'), ('binh_mana', 0.17, 'lam')):
        t = nhom(ten)
        khoi(ten + 'b', t, (r, r, r), (0, 0, 0.02 + r / 2), M[mau], dang='sphere')
        khoi(ten + 'c', t, (0.045, 0.045, 0.07), (0, 0, 0.02 + r + 0.03), M['kinh'], dang='cyl')
        khoi(ten + 'n', t, (0.05, 0.05, 0.03), (0, 0, 0.02 + r + 0.075), M['nut'], dang='cyl')

    t = nhom('sach_chieu')
    khoi('sc_bia', t, (0.18, 0.07, 0.24), (0, 0, 0.12), M['tim'])
    khoi('sc_giay', t, (0.17, 0.075, 0.22), (0.012, 0, 0.12), M['giay'])
    khoi('sc_ngoc', t, (0.06, 0.02, 0.06), (0, -0.04, 0.13), M['ngoc'])
    # ── icon HUD: túi đồ, bản đồ, chiêu Chém Xoáy
    t = nhom('tui')
    khoi('tu_than', t, (0.30, 0.22, 0.26), (0, 0, 0.13), M['da'], dang='sphere')
    khoi('tu_co', t, (0.12, 0.10, 0.08), (0, 0, 0.27), M['da2'], dang='cyl')
    khoi('tu_day', t, (0.16, 0.12, 0.03), (0, 0, 0.25), M['vang'], dang='cyl')
    khoi('tu_mieng', t, (0.18, 0.15, 0.05), (0, 0, 0.32), M['da'], dang='cyl')
    t = nhom('ban_do')
    khoi('bd_giay', t, (0.34, 0.02, 0.24), (0, 0, 0.14), M['giay'])
    for x in (-1, 1):
        khoi(f'bd_cuon{x}', t, (0.05, 0.05, 0.27), (x * 0.18, 0, 0.14), M['nut'], dang='cyl')
    khoi('bd_song', t, (0.04, 0.025, 0.20), (-0.05, -0.005, 0.14), M['lam'], xoay=(0, 0.4, 0))
    khoi('bd_dau', t, (0.05, 0.025, 0.05), (0.07, -0.005, 0.17), M['do'])
    t = nhom('chieu_chem_xoay', math.radians(-35))
    khoi('cx_l', t, (0.045, 0.015, 0.24), (0, 0, 0.22), M['sat2'])
    khoi('cx_g', t, (0.13, 0.03, 0.03), (0, 0, 0.10), M['vang'])
    khoi('cx_c', t, (0.03, 0.03, 0.07), (0, 0, 0.055), M['da2'])
    for i in range(16):                                  # vòng thép xoáy quanh lưỡi, sáng dần về đầu vệt
        g = i / 16 * 5.2
        r = 0.13 + 0.04 * i / 16
        khoi(f'cx_v{i}', t, (0.06, 0.03, 0.035), (r * math.cos(g), 0, 0.20 + r * math.sin(g)),
             M['kinh'] if i > 10 else (M['vang'] if i > 4 else M['do']), xoay=(0, -g, 0))
    return J


def dat_tu_the(J, tt, k, n):
    for ten in DO:
        J[ten].scale = (1, 1, 1) if ten == tt else (0, 0, 0)
    return {'L': (0, 0, 0, True), 'R': (0, 0, 0, True)}
