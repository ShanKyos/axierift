#!/usr/bin/env python3
"""Nướng KIẾN TRÚC THỊ TRẤN — thứ biến Sapidae Chiefdom từ một sân lát đá thành một nơi ở.

    python3 tools/iso/nuong_nha.py [thư mục ra]
    Cần: pip install bpy==4.2.0

⚠ VÌ SAO CẦN — đo trước khi làm, và con số này là cả lý do:

    `MAP_OBSTACLES.ardhaven` khai **16 khối `460×340` GIỐNG HỆT NHAU**. Đó là 16 ngôi nhà. Nhưng
    không có một mảnh tranh nào cho chúng, nên thứ duy nhất người chơi thấy là hàng **đá cuội**
    mà `rimBuild()` rải dọc biên chặn. Tức thị trấn khởi đầu — màn đầu tiên của trò chơi — là
    một mặt lát đá trống, có 16 hình chữ nhật viền sỏi, 24 NPC đứng cách nhau trung bình
    853k px², và 200 cái CÂY RỪNG vì `isoCayBo` không khai nên rơi về bộ mặc định.

    Không lỗi nào in ra. Cùng họ với lỗi `ISO_NEO` đã làm sáu map mất sạch cây: *dữ liệu có đủ,
    chỉ là không có gì vẽ ra.*

Mười món, chia theo BẢY KHU PHỐ mà chính đoạn lore của map đã hứa (Quảng Trường Atia · Phố Chợ ·
Phố Lò · Sân Chuồng · Sảnh Lệnh · Vách Gió · Xóm Trọ):

    nha_o       nhà ở một tầng, mái dốc            — Xóm Trọ, lấp nền
    nha_lau     nhà hai tầng có ban công           — Xóm Trọ, quán trọ
    nha_lo      lò rèn, ống khói + cửa lò đỏ       — Phố Lò
    quay_cho    quầy chợ mái vải + thùng hàng      — Phố Chợ
    chuong      chuồng mái rơm, cửa lùa            — Sân Chuồng
    sanh_lenh   sảnh đá có cột và cờ               — Sảnh Lệnh
    thap_canh   tháp canh                          — Vách Gió
    gieng       giếng đá có mái che                — Quảng Trường Atia (lore ghi "nguyên giếng")
    den_pho     đèn đường                          — rải dọc `isoDuong`
    hang_rao    hàng rào gỗ                        — nối các khối, chia khu

⚠ TỈ LỆ ĐO THEO THÂN NGƯỜI, KHÔNG CHỌN BẰNG CẢM GIÁC. `CAO_NV = 95` là thân nhân vật vẽ ra.
Nhà một tầng cao ~2,6× thân, hai tầng ~3,6×, tháp canh ~4,4×, giếng ~1,1×. Nướng một cái nhà
cao 6× thân thì cả thị trấn thành lâu đài mà không ai chỉ ra được vì sao nhìn sai — đúng cái
bẫy đã ghi ở `nuong_trai.py`.

⚠ BỀ NGANG PHẢI VỪA Ô `460×340`, nên chiều cao KHÔNG tự do. `nuong_vat` chỉ nhận `cao_px`, còn
bề ngang thì suy từ tỉ lệ mô hình — nên mô hình phải dựng đúng tỉ lệ ngang/cao ngay từ trong
Blender. Nướng xong `--do` in lại khổ thật của từng tệp để đối chiếu, đừng tin con số chép tay.

⚠⚠ MẶT NHÌN THẤY LÀ **+X** VÀ **−Y**. ĐỪNG ĐẶT MẶT TIỀN Ở +Y.

    `_cam()` xoay `(60°, 0, 45°)`, nên hướng nhìn là `(−0,61 · +0,61 · −0,50)` và máy ảnh đứng
    ở phía **+X, −Y, +Z**. Lượt nướng đầu tôi đặt hết cửa · cửa sổ · hàng cột · miệng lò ở
    `y = +1,5` — tức đúng mặt KHUẤT. Mười tệp PNG ghi ra hợp lệ, `_kiem_khong_rong` xanh, và
    thứ nhận được là mười cái hộp trơn: không một cánh cửa nào trong cả thị trấn.

    Đây là kiểu hỏng không có cách nào bắt bằng mã — phải nướng ra rồi NHÌN. Trên màn hình,
    `+X` ra phía dưới-phải và `−Y` ra phía dưới-trái; `−X` ra trên-trái (ống khói lò rèn nằm
    đó, và nó vẫn thấy được vì nhô cao hơn mái).

⚠ BẢNG MÀU KẸO, KHÔNG PHẢI MÀU THẬT. Cùng bài học đã trả giá ở `nuong_trai.py`: tông thực tế
nướng ra một cái lều XÁM cạnh viên cỏ kẹo. Mái ở đây là đất nung NO MÀU, tường kem ấm, gỗ nâu
đỏ — đứng cạnh nền lát đá xám-nâu của Ardhaven thì kiến trúc phải là thứ SÁNG HƠN và ẤM HƠN
nền, nếu không cả khu phố chìm vào mặt đường.
"""
import os, sys, math

RA = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else 'public/game/assets/iso'
CHI_DO = '--do' in sys.argv

_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'nuong_tile.py'),
            encoding='utf-8').read().replace("if __name__ == '__main__':", 'if False:')
# ⚠ `ghi_neo()` trong nuong_tile.py dò gốc kho bằng `__file__`, mà `exec` KHÔNG tự đặt tên đó
# vào namespace mới — thiếu dòng dưới thì nướng xong 10 tệp rồi ngã ở bước ghi neo, tức mất
# trắng cả lượt vì NEO chỉ sống trong bộ nhớ.
NT = {'__name__': 'nuong_tile',
      '__file__': os.path.join(os.path.dirname(os.path.abspath(__file__)), 'nuong_tile.py')}
sys.argv = [sys.argv[0], RA]
exec(compile(_src, 'nuong_tile.py', 'exec'), NT)
nuong_vat, _vatlieu, CAO_NV, NEO = NT['nuong_vat'], NT['_vatlieu'], NT['CAO_NV'], NT['NEO']

MAI   = (0.80, 0.33, 0.24)    # ngói đất nung, no màu
MAI_T = (0.58, 0.22, 0.17)
TUONG = (0.90, 0.82, 0.66)    # vữa kem ấm
TUONG_T = (0.70, 0.61, 0.47)
GO    = (0.50, 0.30, 0.17)
GO_S  = (0.66, 0.44, 0.26)
DA    = (0.66, 0.65, 0.68)
DA_T  = (0.45, 0.44, 0.47)
ROM   = (0.84, 0.66, 0.32)
VAI   = (0.90, 0.74, 0.44)
CO    = (0.72, 0.26, 0.30)    # cờ đỏ sẫm — dấu của Sảnh Lệnh
LUA   = (0.96, 0.52, 0.18)
KINH  = (0.42, 0.62, 0.70)


def _khoi(mau, vi, co, xoay=(0, 0, 0), van=22, nham=0.94):
    import bpy
    bpy.ops.mesh.primitive_cube_add(size=1, location=vi)
    o = bpy.context.object
    o.scale = co; o.rotation_euler = xoay
    o.data.materials.append(_vatlieu('m', mau, nham=nham, van=van, manh_van=0.5))
    return o


def _tru(mau, vi, ban, cao, xoay=(0, 0, 0), van=26, dinh=16):
    import bpy
    bpy.ops.mesh.primitive_cylinder_add(vertices=dinh, radius=ban, depth=cao, location=vi)
    o = bpy.context.object
    o.rotation_euler = xoay
    o.data.materials.append(_vatlieu('m', mau, van=van, manh_van=0.5))
    bpy.ops.object.shade_smooth()
    return o


def _mai(mau, vi, dai, rong, cao, van=18):
    """Mái là LĂNG TRỤ TAM GIÁC LIỀN KHỐI, không phải hai tấm nghiêng ghép lại.

    ⚠ Bài học đã trả giá ở `nuong_trai.leu()`: hai tấm rời thì nắng đánh hai mặt hơi khác nhau
    và khe giữa chúng ăn bóng thành một vệt đen chạy dọc nóc — đọc ra một đống ván xiêu chứ
    không ra một mái nhà. Một lăng trụ thì nóc là một CẠNH thật."""
    import bpy
    bpy.ops.mesh.primitive_cylinder_add(vertices=3, radius=0.5, depth=1.0, location=(0, 0, 0))
    o = bpy.context.object
    o.rotation_euler = (math.radians(90), math.radians(90), 0)
    bpy.ops.object.transform_apply(rotation=True)
    o.scale = (dai, rong * 2.0, cao * 1.5)
    o.location = vi
    o.data.materials.append(_vatlieu('mai', mau, nham=0.9, van=van, manh_van=0.6))
    bpy.ops.object.shade_flat()
    return o


def _cua(vi, co=(0.05, 0.34, 0.52), mau=None):
    _khoi(mau or (0.30, 0.19, 0.12), vi, co, van=14)


def nha_o():
    """Nhà ở một tầng — khối cơ bản lấp phần lớn 16 ô. Rộng 4.4 × sâu 3.0 × cao ~2.6."""
    _khoi(TUONG, (0, 0, 0.80), (4.40, 3.00, 1.60))
    _mai(MAI, (0, 0, 1.60), 4.75, 1.65, 1.05)
    for s in (-1, 1):                                  # dầm gỗ lộ ra — kiểu nhà khung gỗ
        _khoi(GO, (s * 1.55, -1.51, 0.80), (0.16, 0.05, 1.58), van=30)
    _khoi(GO, (0, -1.51, 1.45), (4.42, 0.05, 0.16), van=30)
    _cua((0, -1.53, 0.50), (0.62, 0.06, 1.00))
    for s in (-1, 1):                                  # cửa sổ
        _khoi(KINH, (s * 1.10, -1.53, 1.05), (0.52, 0.05, 0.46), van=8)
    _khoi(DA, (1.90, 0.0, 1.95), (0.42, 0.42, 2.30), van=26)   # ống khói


def nha_lau():
    """Hai tầng có ban công — mốc định hướng của Xóm Trọ. Cao ~3.6× thân người."""
    _khoi(TUONG, (0, 0, 0.85), (4.00, 2.90, 1.70))
    _khoi(TUONG_T, (0, 0, 1.78), (4.20, 3.05, 0.16), van=30)   # gờ chia tầng
    _khoi(TUONG, (0, 0, 2.62), (3.80, 2.75, 1.52))
    _mai(MAI, (0, 0, 3.38), 4.30, 1.55, 1.15)
    _khoi(GO_S, (0, -1.62, 1.92), (3.60, 0.55, 0.10), van=30)   # sàn ban công
    for i in range(7):                                          # lan can
        _khoi(GO, (-1.62 + i * 0.54, -1.62, 2.16), (0.08, 0.08, 0.42), van=24)
    _khoi(GO, (0, -1.62, 2.38), (3.60, 0.09, 0.09), van=24)
    _cua((0, -1.47, 0.55), (0.66, 0.06, 1.10))
    for s in (-1, 1):
        _khoi(KINH, (s * 1.15, -1.40, 2.70), (0.50, 0.05, 0.62), van=8)
    _khoi(GO_S, (0, -1.70, 1.30), (1.30, 0.10, 0.44), xoay=(math.radians(14), 0, 0), van=20)  # biển hiệu


def nha_lo():
    """Lò rèn — ống khói TO và cửa lò rực. Phố Lò phải nhận ra từ xa bằng bóng dáng."""
    _khoi(DA, (0, 0, 0.75), (3.80, 2.90, 1.50))
    _mai(MAI_T, (0, 0, 1.50), 4.15, 1.60, 0.86)
    _khoi(DA_T, (-1.35, -0.10, 1.95), (1.05, 1.05, 2.60), van=30)     # ống khói lớn
    _khoi(DA, (-1.35, -0.10, 3.32), (1.25, 1.25, 0.22), van=30)
    _khoi(LUA, (0.60, -1.47, 0.52), (0.86, 0.06, 0.72), van=6, nham=0.4)   # miệng lò rực
    _khoi(DA_T, (0.60, -1.52, 1.05), (1.10, 0.10, 0.34), van=26)
    _khoi(GO, (1.60, -1.45, 0.40), (0.50, 0.50, 0.80), van=28)          # đe + thùng tôi
    _tru(DA_T, (1.60, -1.45, 0.92), 0.30, 0.24)


def quay_cho():
    """Quầy chợ — mái VẢI, không phải mái ngói. Chợ đọc ra bằng chất liệu, không bằng hình khối."""
    for s in (-1, 1):
        for t in (-1, 1):
            _tru(GO, (s * 1.70, t * 1.05, 0.90), 0.09, 1.80)
    _khoi(VAI, (0, 0, 1.90), (3.80, 2.40, 0.10), xoay=(math.radians(8), 0, 0), van=10, nham=0.99)
    _khoi(VAI, (0, 0, 1.90), (3.80, 2.40, 0.10), xoay=(math.radians(-8), 0, 0), van=10, nham=0.99)
    _khoi(GO_S, (0, -0.85, 0.55), (3.50, 0.90, 0.14), van=26)           # mặt quầy
    _khoi(GO, (0, -0.85, 0.25), (3.30, 0.70, 0.44), van=26)
    for i, s in enumerate((-1.2, -0.3, 0.7)):                           # sọt hàng
        _tru(ROM, (s, 0.55, 0.26), 0.30, 0.52, van=20, dinh=10)


def chuong():
    """Chuồng — mái RƠM và cửa lùa. Sân Chuồng là chỗ Người Giữ Chuồng đứng."""
    _khoi(GO_S, (0, 0, 0.68), (4.20, 2.80, 1.36))
    _mai(ROM, (0, 0, 1.36), 4.60, 1.60, 0.92, van=34)
    for i in range(5):
        _khoi(GO, (-1.68 + i * 0.84, -1.41, 0.68), (0.12, 0.06, 1.34), van=30)
    _khoi(GO, (0, -1.41, 0.30), (4.18, 0.07, 0.14), van=30)
    _cua((-0.95, -1.44, 0.55), (1.30, 0.06, 1.06))
    _khoi(ROM, (1.70, -0.30, 0.30), (0.70, 0.70, 0.60), van=30)        # đống rơm


def sanh_lenh():
    """Sảnh đá có cột và cờ — chỗ duy nhất trong thành mang màu cờ. Mốc của Sảnh Lệnh."""
    _khoi(DA, (0, 0, 0.18), (4.60, 3.30, 0.36), van=26)                # bậc thềm
    _khoi(DA, (0, 0.25, 1.15), (3.90, 2.60, 1.94))
    _mai(DA_T, (0, 0.25, 2.12), 4.30, 1.45, 0.80, van=22)
    for s in (-1.45, -0.48, 0.48, 1.45):                               # hàng cột
        _tru(TUONG, (s, -1.30, 1.10), 0.20, 2.20, dinh=12)
    _khoi(TUONG, (0, -1.30, 2.28), (3.60, 0.55, 0.22), van=26)
    _cua((0, -0.40, 0.90), (0.90, 0.08, 1.50))
    _tru(GO, (2.10, -1.30, 1.90), 0.07, 3.80)                           # cột cờ
    _khoi(CO, (2.10, -1.05, 3.35), (0.06, 0.62, 0.72), van=12, nham=0.99)


def thap_canh():
    """Tháp canh — mốc cao nhất thành (~4,4× thân), nhìn từ đâu cũng thấy. Chữ ký của Vách Gió.

    ⚠ Bản đầu dựng thân 1,9 rộng trên đế 2,6 và nướng ra một CÁI CỘT, không ra một cái tháp: ở
    cỡ thu nhỏ mắt đọc bóng dáng chứ không đọc chi tiết, mà bóng dáng của nó lúc đó gần như
    trùng với ống khói của `nha_lo`. Hai mốc định hướng mà lẫn vào nhau thì mất cả hai. Nay có
    SÀN QUAN SÁT nhô hẳn ra ngoài thân (2,9 so với thân 2,2) — đó là thứ duy nhất nói "tháp"."""
    _khoi(DA, (0, 0, 0.26), (3.20, 3.20, 0.52), van=26)                # đế choãi
    _khoi(DA, (0, 0, 1.95), (2.20, 2.20, 3.10))
    _khoi(DA_T, (0, 0, 1.10), (2.28, 2.28, 0.16), van=30)              # gờ ngang chia tầng
    _cua((0, -1.12, 0.70), (0.66, 0.06, 1.10))                         # cửa chân tháp
    for z in (2.05, 2.95):                                             # lỗ châu mai, mặt nhìn thấy
        _khoi((0.12, 0.12, 0.14), (0, -1.12, z), (0.26, 0.05, 0.66), van=8)
        _khoi((0.12, 0.12, 0.14), (1.12, 0, z), (0.05, 0.26, 0.66), van=8)
    for s in (-1, 1):                                                  # cột chống sàn quan sát
        for t in (-1, 1):
            _khoi(GO, (s * 1.28, t * 1.28, 3.28), (0.16, 0.16, 0.72),
                  xoay=(math.radians(t * 9), math.radians(-s * 9), 0), van=28)
    _khoi(GO_S, (0, 0, 3.70), (2.90, 2.90, 0.18), van=26)              # SÀN nhô ra — dấu của tháp
    _khoi(DA, (0, 0, 4.10), (2.05, 2.05, 0.70))
    for i in range(5):                                                 # lan can gỗ
        _khoi(GO, (-1.32 + i * 0.66, -1.38, 3.98), (0.11, 0.11, 0.44), van=28)
        _khoi(GO, (1.38, -1.32 + i * 0.66, 3.98), (0.11, 0.11, 0.44), van=28)
    _mai(MAI_T, (0, 0, 4.52), 2.25, 0.82, 0.86)
    _tru(GO, (0, 0, 5.30), 0.05, 0.80)                                 # cột cờ nhỏ trên nóc
    _khoi(CO, (0, -0.22, 5.52), (0.05, 0.42, 0.30), van=12, nham=0.99)


def gieng():
    """Giếng — lore của map ghi thẳng "nguyên giếng", nên nó phải có mặt ở Quảng Trường Atia."""
    _tru(DA, (0, 0, 0.30), 0.82, 0.60, dinh=14)
    _tru(DA_T, (0, 0, 0.62), 0.66, 0.10, dinh=14)
    _tru((0.16, 0.24, 0.30), (0, 0, 0.58), 0.58, 0.06, dinh=14)        # mặt nước tối
    for s in (-1, 1):
        _khoi(GO, (s * 0.74, 0, 1.10), (0.14, 0.14, 1.40), van=28)
    _mai(MAI, (0, 0, 1.72), 2.00, 0.78, 0.52)
    _tru(GO_S, (0, 0, 1.62), 0.09, 1.60, xoay=(0, math.radians(90), 0))  # trục quay
    _khoi(GO, (0, 0, 1.16), (0.34, 0.34, 0.34), van=24)                  # gàu


def den_pho():
    """Đèn đường — rải dọc `isoDuong`. Thứ rẻ nhất mà nói được "có người ở đây"."""
    _tru(DA_T, (0, 0, 0.12), 0.26, 0.24, dinh=12)
    _tru(GO, (0, 0, 1.10), 0.075, 2.00)
    _khoi(DA_T, (0, 0, 2.18), (0.34, 0.34, 0.18), van=22)
    _khoi(LUA, (0, 0, 2.42), (0.26, 0.26, 0.34), van=6, nham=0.35)
    _mai(DA_T, (0, 0, 2.62), 0.42, 0.20, 0.22)


def hang_rao():
    """Hàng rào — nối các khối lại thành KHU PHỐ. Không có nó thì 16 cái nhà là 16 hòn đảo."""
    for i in range(7):
        _khoi(GO, (-1.80 + i * 0.60, 0, 0.44), (0.11, 0.11, 0.88), van=28)
    for z in (0.34, 0.72):
        _khoi(GO_S, (0, 0, z), (3.80, 0.07, 0.10), van=26)


MON = [('nha_o', nha_o, 2.60), ('nha_lau', nha_lau, 3.60), ('nha_lo', nha_lo, 3.40),
       ('quay_cho', quay_cho, 1.90), ('chuong', chuong, 2.20), ('sanh_lenh', sanh_lenh, 3.20),
       ('thap_canh', thap_canh, 4.40), ('gieng', gieng, 1.15),
       ('den_pho', den_pho, 2.00), ('hang_rao', hang_rao, 0.80)]


def _do():
    """In khổ THẬT của từng tệp đã nướng. Bề ngang là thứ phải vừa ô 460×340, mà `nuong_vat`
    chỉ nhận `cao_px` — nên đừng tin tỉ lệ chép tay, đọc lại từ tệp."""
    import struct
    print('%-11s %9s  %s' % ('tên', 'khổ px', 'ghi chú'))
    for ten, _, k in MON:
        p = os.path.join(RA, ten + '.png')
        if not os.path.exists(p):
            print('%-11s %9s' % (ten, 'CHƯA CÓ')); continue
        with open(p, 'rb') as f:
            d = f.read(33)
        w, h = struct.unpack('>II', d[16:24])
        print('%-11s %4dx%-4d  %s' % (ten, w, h, 'RỘNG HƠN Ô 460' if w > 460 else ''))


def main():
    if CHI_DO:
        _do(); return
    os.makedirs(RA, exist_ok=True)
    for ten, dung, k in MON:
        nuong_vat(ten, dung, cao_px=round(CAO_NV * k))
        print('  %-11s cao %3d px' % (ten, round(CAO_NV * k)))
    NT['ghi_neo'](RA, NEO)   # MỘT tệp đích duy nhất — xem ghi_neo() trong nuong_tile.py
    print('NUONG XONG %d kien truc → %s' % (len(MON), RA))
    _do()


if __name__ == '__main__':
    main()
