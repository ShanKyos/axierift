"""Dark Knight — dựng khung, đặt tư thế theo từng trạng thái."""
import math
from rig import TAU, khop, khoi, vat_lieu, ik2, DangDi

# Kích thước (mét). Người cao ~1,8; đầu to hơn tỉ lệ thật một chút để đọc được ở 56px.
DUI, CANG, MAT_CA = 0.44, 0.42, 0.08
HONG_CAO = DUI + CANG + MAT_CA - 0.02         # gối hơi chùng khi đứng
VAI_RONG, HONG_RONG = 0.24, 0.11
TAY_TREN, TAY_DUOI = 0.29, 0.27

DI = DangDi(do_dai=1.15, cham=0.60, nhac=0.10, nhun=0.025, nghieng=0.04)
CHAY = DangDi(do_dai=2.10, cham=0.36, nhac=0.20, nhun=0.06, nghieng=0.20)

# trạng thái: (số khung, giây một vòng, lặp?)
TRANG_THAI = {
    'idle':   (6, 1.20, True),
    'walk':   (12, DI.do_dai / 1.35, True),     # tốc độ đi 1,35 m/s
    'run':    (12, CHAY.do_dai / 3.40, True),   # tốc độ chạy 3,4 m/s
    'attack': (7, 0.62, False),
    'hit':    (3, 0.30, False),
    'death':  (6, 0.90, False),
}
TOC_DO = {'walk': 1.35, 'run': 3.40}             # m/s — game đọc lại từ JSON, không chép tay
KHUNG_TRUNG = {'attack': 3}                       # khung lưỡi kiếm chạm mục tiêu
BAM_DAT = {'death': 'hong'}                       # ngã xuống thì thân NẰM trên đất, không lún


def sua_xuyen_dat(J, tt, k, thap, cap_nhat):
    """Nhát chém dừng TRÊN mặt đất: thu dần vai + kiếm về phía lấy đà cho tới khi mũi kiếm không cắm đất."""
    if tt != 'attack':
        return
    for _ in range(40):
        cap_nhat()
        if thap() >= -0.002:
            return
        J['vaiR'].rotation_euler.x -= 0.05
        J['kiem'].rotation_euler.x -= 0.04


def dung(col):
    M = {
        'thep': vat_lieu('thep', (0.16, 0.17, 0.24)),
        'thep2': vat_lieu('thep2', (0.45, 0.48, 0.58)),
        'vang': vat_lieu('vang', (0.85, 0.62, 0.18)),
        'do': vat_lieu('do', (0.62, 0.08, 0.10)),
        'da': vat_lieu('da', (0.80, 0.58, 0.44)),
        'luoi': vat_lieu('luoi', (0.78, 0.82, 0.90)),
        'chuoi': vat_lieu('chuoi', (0.25, 0.14, 0.08)),
        'mat': vat_lieu('mat', (0.95, 0.45, 0.15)),
    }
    J = {}
    goc = khop('goc')
    J['goc'] = goc
    hong = khop('hong', goc, (0, 0, HONG_CAO))
    J['hong'] = hong
    khoi('khung_chau', hong, (0.30, 0.20, 0.16), (0, 0, 0.02), M['thep'], vat=0.02)
    khoi('that_lung', hong, (0.33, 0.22, 0.05), (0, 0, 0.10), M['vang'])
    khoi('vat_ao', hong, (0.26, 0.05, 0.30), (0, 0.10, -0.12), M['do'])            # vạt vải trước
    khoi('vat_ao_sau', hong, (0.28, 0.05, 0.34), (0, -0.11, -0.13), M['do'])
    than = khop('than', hong, (0, 0, 0.12))
    J['than'] = than
    khoi('nguc', than, (0.40, 0.25, 0.34), (0, 0, 0.20), M['thep2'], vat=0.04)
    khoi('nguc_vien', than, (0.20, 0.27, 0.06), (0, 0.005, 0.30), M['vang'])
    khoi('bung', than, (0.32, 0.22, 0.12), (0, 0, 0.02), M['thep'], vat=0.02)
    co = khop('co', than, (0, 0, 0.40))
    dau = khop('dau', co, (0, 0, 0.05))
    J['dau'] = dau
    khoi('mu', dau, (0.24, 0.27, 0.26), (0, 0.0, 0.13), M['thep2'], vat=0.05)
    khoi('mat_na', dau, (0.18, 0.03, 0.07), (0, 0.135, 0.12), M['thep'])
    khoi('khe_mat', dau, (0.14, 0.035, 0.025), (0, 0.14, 0.14), M['mat'])
    khoi('mao', dau, (0.05, 0.30, 0.10), (0, -0.02, 0.29), M['do'])                 # chùm lông trên mũ
    for ten, s in (('L', -1), ('R', 1)):
        vai = khop('vai' + ten, than, (s * VAI_RONG, 0, 0.33))
        J['vai' + ten] = vai
        khoi('giap_vai' + ten, vai, (0.20, 0.24, 0.13), (s * 0.04, 0, 0.04), M['thep2'], vat=0.04)
        khoi('vien_vai' + ten, vai, (0.21, 0.25, 0.03), (s * 0.04, 0, -0.03), M['vang'])
        khoi('tay_tren' + ten, vai, (0.10, 0.11, TAY_TREN), (0, 0, -TAY_TREN / 2), M['thep'])
        khuyu = khop('khuyu' + ten, vai, (0, 0, -TAY_TREN))
        J['khuyu' + ten] = khuyu
        khoi('tay_duoi' + ten, khuyu, (0.11, 0.12, TAY_DUOI), (0, 0, -TAY_DUOI / 2), M['thep2'], vat=0.02)
        ban_tay = khop('ban_tay' + ten, khuyu, (0, 0, -TAY_DUOI))
        J['tay' + ten] = ban_tay
        khoi('nam' + ten, ban_tay, (0.11, 0.11, 0.09), (0, 0, -0.03), M['thep'])
        hong_c = khop('hong' + ten, hong, (s * HONG_RONG, 0, 0))
        J['hong' + ten] = hong_c
        khoi('dui' + ten, hong_c, (0.14, 0.15, DUI), (0, 0, -DUI / 2), M['thep'], vat=0.02)
        goi = khop('goi' + ten, hong_c, (0, 0, -DUI))
        J['goi' + ten] = goi
        khoi('mieng_goi' + ten, goi, (0.13, 0.08, 0.09), (0, 0.07, 0), M['vang'])
        khoi('cang' + ten, goi, (0.13, 0.14, CANG), (0, 0, -CANG / 2), M['thep2'], vat=0.02)
        ca = khop('ca' + ten, goi, (0, 0, -CANG))
        J['ca' + ten] = ca
        khoi('giay' + ten, ca, (0.13, 0.26, 0.08), (0, 0.05, -0.04), M['thep'])
    # Thanh đại kiếm trong tay phải. Lưỡi chỉ theo +Z cục bộ của khớp kiếm.
    kiem = khop('kiem', J['tayR'], (0, 0, -0.04))
    J['kiem'] = kiem
    khoi('chuoi', kiem, (0.045, 0.045, 0.22), (0, 0, 0.0), M['chuoi'])
    khoi('chan_kiem', kiem, (0.28, 0.06, 0.05), (0, 0, 0.13), M['vang'])
    khoi('luoi', kiem, (0.10, 0.025, 0.95), (0, 0, 0.63), M['luoi'])
    khoi('mui', kiem, (0.07, 0.024, 0.07), (0, 0, 1.12), M['luoi'], xoay=(0, math.radians(45), 0))
    return J


def _chan(J, ten, s, dang, pha, ha):
    y, cao, cham = dang.chan(pha)
    hip_z = HONG_CAO - ha
    dz = (MAT_CA + cao) - hip_z
    a1, a2 = ik2(DUI, CANG, y, dz)
    J['hong' + ten].rotation_euler = (a1, 0, 0)
    J['goi' + ten].rotation_euler = (a2, 0, 0)
    J['ca' + ten].rotation_euler = (-(a1 + a2) + (0.25 if not cham else 0.0), 0, 0)   # bàn chân phẳng khi chạm
    return (s * HONG_RONG, y, MAT_CA - MAT_CA + cao, cham)


def _tay(J, vung, khuyu_gap=0.35):
    J['vaiL'].rotation_euler = (vung, 0, -0.12)
    # Vác kiếm lên vai khi đi lại. Buông thõng thì thanh kiếm 1,2 m dài hơn khoảng tay tới đất
    # ⇒ mũi kiếm XUYÊN qua mặt đất ở mọi khung — đúng kiểu sai vật lý phải tránh.
    # Tay phải gập trước ngực (vai 0,6 + khuỷu 1,6 rad ⇒ cẳng tay chĩa lên trước), lưỡi ngả ra sau vai.
    J['vaiR'].rotation_euler = (0.60 - vung * 0.08, 0, 0.30)
    J['khuyuL'].rotation_euler = (khuyu_gap, 0, 0)
    J['khuyuR'].rotation_euler = (1.60, 0, 0)
    J['kiem'].rotation_euler = (0.52 - 2.20, 0, 0)


def dat_tu_the(J, trang_thai, k, n):
    """Đặt tư thế khung k/n. Trả dict bàn chân {L/R: (x, y, z, chạm_đất)} so với gốc, đơn vị mét."""
    for k_, o in J.items():
        if k_ != 'goc':
            o.rotation_euler = (0, 0, 0)
    J['hong'].location = (0, 0, HONG_CAO)
    t = k / n
    chan = {}
    if trang_thai in ('walk', 'run'):
        dang = DI if trang_thai == 'walk' else CHAY
        ha = dang.nhun * (0.5 + 0.5 * math.cos(2 * TAU * t)) + (0.05 if trang_thai == 'run' else 0.045)
        J['hong'].location = (0, 0, HONG_CAO - ha)
        J['than'].rotation_euler = (dang.nghieng, 0, 0)
        J['dau'].rotation_euler = (-dang.nghieng * 0.6, 0, 0)
        chan['L'] = _chan(J, 'L', -1, dang, t, ha)
        chan['R'] = _chan(J, 'R', 1, dang, t + 0.5, ha)
        vung = 0.55 * math.sin(TAU * t) * (1.4 if trang_thai == 'run' else 1.0)
        _tay(J, vung, 0.35 if trang_thai == 'walk' else 1.1)
    elif trang_thai == 'idle':
        tho = 0.012 * math.sin(TAU * t)
        J['hong'].location = (0, 0, HONG_CAO - 0.02 - tho)
        for ten, s, y in (('L', -1, 0.10), ('R', 1, -0.10)):
            _chan_dung(J, ten, y, 0.02 + tho)
            chan[ten] = (s * HONG_RONG, y, 0.0, True)
        J['than'].rotation_euler = (0.02, 0, 0)
        _tay(J, 0.08, 0.30)
        J['vaiR'].rotation_euler = (0.35 + tho * 3, 0, 0.15)
        J['kiem'].rotation_euler = (math.radians(205), 0, 0)
    elif trang_thai == 'attack':
        # Lấy đà (kiếm giơ cao sau đầu) → chém chéo xuống → thu về. Khung 3 = chạm.
        lay = [0.0, 0.6, 1.0, 0.15, -0.35, -0.25, 0.0][k]
        chem = [0.0, 0.0, 0.0, 1.0, 1.0, 0.7, 0.3][k]
        J['hong'].location = (0, 0, HONG_CAO - 0.04 - 0.08 * chem)
        for ten, s, y in (('L', -1, 0.28), ('R', 1, -0.22)):
            _chan_dung(J, ten, y, 0.04 + 0.08 * chem)
            chan[ten] = (s * HONG_RONG, y, 0.0, True)
        J['than'].rotation_euler = (0.10 + 0.30 * chem - 0.15 * lay, 0, 0.45 * lay - 0.50 * chem)
        J['vaiR'].rotation_euler = (-2.6 * lay + 1.7 * chem, 0, 0.3)
        J['khuyuR'].rotation_euler = (0.9 * lay + 0.2, 0, 0)
        J['vaiL'].rotation_euler = (-1.8 * lay + 1.2 * chem, 0, -0.3)
        J['khuyuL'].rotation_euler = (1.0, 0, 0)
        J['kiem'].rotation_euler = (math.radians(180 - 70 * chem + 20 * lay), 0, 0)
    elif trang_thai == 'hit':
        g = [0.6, 1.0, 0.4][k]
        J['hong'].location = (0, -0.05 * g, HONG_CAO - 0.03)
        for ten, s, y in (('L', -1, 0.10), ('R', 1, -0.12)):
            _chan_dung(J, ten, y + 0.05 * g, 0.03)
            chan[ten] = (s * HONG_RONG, y, 0.0, True)
        J['than'].rotation_euler = (-0.35 * g, 0, 0)
        J['dau'].rotation_euler = (-0.3 * g, 0, 0)
        _tay(J, -0.4 * g, 0.6)
    elif trang_thai == 'death':
        f = [0.0, 0.25, 0.55, 0.85, 1.0, 1.0][k]
        # Ngã ngửa: xoay cả người quanh gót chân, hông hạ dần xuống sát đất.
        J['hong'].location = (0, -0.55 * f, HONG_CAO - (HONG_CAO - 0.18) * f)
        J['hong'].rotation_euler = (-1.45 * f, 0, 0)
        for ten, s, y in (('L', -1, 0.10), ('R', 1, -0.05)):
            J['hong' + ten].rotation_euler = (0.6 * f, 0, 0)
            J['goi' + ten].rotation_euler = (-0.5 * f, 0, 0)
            chan[ten] = (s * HONG_RONG, y, 0.0, True)
        _tay(J, -0.8 * f, 0.4)
        J['vaiR'].rotation_euler = (-1.2 * f, 0, 0.5 * f)
    return chan


def _chan_dung(J, ten, y, ha):
    a1, a2 = ik2(DUI, CANG, y, MAT_CA - (HONG_CAO - ha))
    J['hong' + ten].rotation_euler = (a1, 0, 0)
    J['goi' + ten].rotation_euler = (a2, 0, 0)
    J['ca' + ten].rotation_euler = (-(a1 + a2), 0, 0)
