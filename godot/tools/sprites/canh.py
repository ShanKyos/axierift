"""Cây và đá — render qua cùng dây chuyền, 8 hướng xoay = 8 biến thể để rải map không lặp."""
import math
from rig import khop, khoi, vat_lieu

TRANG_THAI = {'cay': (1, 1.0, False), 'da': (1, 1.0, False)}
TOC_DO, KHUNG_TRUNG = {}, {}
NEO = (48, 88)
_J = {}


def dung(_):
    M = {
        'than_cay': vat_lieu('than_cay', (0.30, 0.18, 0.10)),
        'la': vat_lieu('la', (0.16, 0.42, 0.14)),
        'la2': vat_lieu('la2', (0.30, 0.58, 0.20)),
        'da': vat_lieu('da_c', (0.42, 0.42, 0.46)),
        'reu': vat_lieu('reu', (0.30, 0.45, 0.22)),
    }
    goc = khop('goc')
    cay = khop('cay', goc)
    khoi('than', cay, (0.22, 0.22, 1.1), (0, 0, 0.55), M['than_cay'], dang='cyl')
    khoi('tan1', cay, (1.5, 1.4, 0.9), (0, 0, 1.35), M['la'], dang='sphere')
    khoi('tan2', cay, (1.1, 1.0, 0.8), (0.15, -0.1, 1.85), M['la2'], dang='sphere')
    khoi('tan3', cay, (0.7, 0.7, 0.6), (-0.1, 0.1, 2.25), M['la2'], dang='sphere')
    da = khop('da', goc)
    khoi('da1', da, (0.9, 0.7, 0.55), (0, 0, 0.22), M['da'], dang='sphere', xoay=(0.2, 0.1, 0.4))
    khoi('da2', da, (0.5, 0.45, 0.35), (0.42, 0.2, 0.12), M['da'], dang='sphere')
    khoi('reu', da, (0.6, 0.5, 0.12), (-0.05, 0.05, 0.44), M['reu'], dang='sphere')
    _J.update(goc=goc, cay=cay, da=da)
    J = {'goc': goc, 'caL': khop('caL', goc), 'caR': khop('caR', goc), 'cay': cay, 'da': da}
    return J


def dat_tu_the(J, tt, k, n):
    # Mỗi trạng thái hiện đúng một vật: giấu vật kia đi bằng cách thu về 0.
    J['cay'].scale = (1, 1, 1) if tt == 'cay' else (0, 0, 0)
    J['da'].scale = (1, 1, 1) if tt == 'da' else (0, 0, 0)
    return {'L': (0, 0, 0, True), 'R': (0, 0, 0, True)}


BAM_DAT = {'da': 'da'}               # đá NGỒI trên đất, không lún
