"""Bọ Giáp — quái cấp thấp đầu tiên. Thân bầu, sáu chân, hai càng."""
import math
from rig import TAU, khop, khoi, vat_lieu

TRANG_THAI = {
    'idle':   (4, 0.8, True),
    'walk':   (6, 0.60, True),
    'attack': (5, 0.55, False),
    'hit':    (2, 0.22, False),
    'death':  (5, 0.70, False),
}
CO = 1.0                        # thân bọ cao ~0,6 m — tới đầu gối người, như quái cấp thấp của MU
SAI = 0.42 * CO                 # sải một chu kỳ (m)
TOC_DO = {'walk': SAI / 0.60}
KHUNG_TRUNG = {'attack': 2}
BAM_DAT = {t: 'than' for t in TRANG_THAI}   # mọi trạng thái: chân/thân chạm đúng mặt đất
NEO = (48, 76)                  # sáu chân xoè rộng: chân phía gần camera chiếu xuống tới ~10 px dưới gốc


def dung(_):
    M = {
        'vo': vat_lieu('vo', (0.40, 0.18, 0.55)),
        'vo2': vat_lieu('vo2', (0.70, 0.40, 0.85)),
        'bung': vat_lieu('bung', (0.85, 0.75, 0.35)),
        'chan': vat_lieu('chan_b', (0.15, 0.08, 0.20)),
        'mat': vat_lieu('mat_b', (0.95, 0.90, 0.30)),
    }
    J = {}
    goc = khop('goc')
    goc.scale = (CO, CO, CO)
    J['goc'] = goc
    than = khop('than', goc, (0, 0, 0.355))
    J['than'] = than
    khoi('vo', than, (0.62, 0.78, 0.36), (0, -0.05, 0.05), M['vo'], dang='sphere')
    khoi('soc', than, (0.06, 0.70, 0.08), (0, -0.05, 0.22), M['vo2'])
    khoi('bung', than, (0.50, 0.60, 0.18), (0, -0.05, -0.08), M['bung'], dang='sphere')
    dau = khop('dau', than, (0, 0.38, 0.02))
    J['dau'] = dau
    khoi('dau_k', dau, (0.34, 0.24, 0.24), (0, 0.06, 0), M['vo2'], dang='sphere')
    for s, ten in ((-1, 'L'), (1, 'R')):
        khoi('mat' + ten, dau, (0.07, 0.05, 0.07), (s * 0.10, 0.17, 0.05), M['mat'], dang='sphere')
        cang = khop('cang' + ten, dau, (s * 0.10, 0.16, -0.04))
        J['cang' + ten] = cang
        khoi('cang_k' + ten, cang, (0.05, 0.22, 0.05), (s * 0.03, 0.10, 0), M['chan'], xoay=(0, 0, -s * 0.5))
        for i, y in enumerate((0.22, 0.0, -0.24)):
            # Khớp chân nằm sát mép thân; đoạn chân xoè RA NGOÀI (xoay quanh Y ngược dấu với
            # bên) và tâm khối dời đúng nửa chiều dài theo hướng xoè ⇒ đầu trên dính vào thân.
            c = khop(f'chan{ten}{i}', than, (s * 0.22, y, -0.02))
            J[f'chan{ten}{i}'] = c
            khoi(f'chan_k{ten}{i}', c, (0.07, 0.07, 0.38), (s * 0.10, 0, -0.16), M['chan'], xoay=(0, -s * 0.55, 0))
    # Điểm "bàn chân" mà render.py đo: dùng đầu chân giữa mỗi bên.
    J['caL'] = khop('caL', J['chanL1'], (-0.20, 0, -0.31))
    J['caR'] = khop('caR', J['chanR1'], (0.20, 0, -0.31))
    return J


def dat_tu_the(J, tt, k, n):
    for ten, o in J.items():
        if ten != 'goc':
            o.rotation_euler = (0, 0, 0)
    J['than'].location = (0, 0, 0.355)
    t = k / n
    if tt == 'walk':
        for s, ten in ((-1, 'L'), (1, 'R')):
            for i in range(3):
                pha = t + (0.5 if (i % 2) ^ (ten == 'R') else 0.0)
                J[f'chan{ten}{i}'].rotation_euler = (0.45 * math.sin(TAU * pha), 0, 0)
        J['than'].location = (0, 0, 0.355 + 0.015 * math.sin(2 * TAU * t))
    elif tt == 'idle':
        J['than'].location = (0, 0, 0.355 + 0.01 * math.sin(TAU * t))
        for s, ten in ((-1, 'L'), (1, 'R')):
            J['cang' + ten].rotation_euler = (0, 0, s * 0.15 * math.sin(TAU * t))
    elif tt == 'attack':
        lao = [0.0, -0.4, 1.0, 0.6, 0.2][k]
        J['than'].location = (0, 0.10 * lao, 0.355)
        J['than'].rotation_euler = (0.25 * lao, 0, 0)
        for s, ten in ((-1, 'L'), (1, 'R')):
            J['cang' + ten].rotation_euler = (0, 0, s * (0.6 - 0.9 * max(0, lao)))
    elif tt == 'hit':
        J['than'].location = (0, -0.06, 0.335)
        J['than'].rotation_euler = (-0.25, 0, 0)
    elif tt == 'death':
        f = [0.0, 0.35, 0.7, 1.0, 1.0][k]
        J['than'].location = (0, 0, 0.355 - 0.16 * f)
        J['than'].rotation_euler = (0, math.pi * f, 0)          # lật ngửa
        for s, ten in ((-1, 'L'), (1, 'R')):
            for i in range(3):
                J[f'chan{ten}{i}'].rotation_euler = (0.3 * math.sin(7 * f + i), 0, 0)
    cham = {'L': (0, 0, 0, True), 'R': (0, 0, 0, True)}
    return cham
