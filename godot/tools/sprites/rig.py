"""Khung xương khối + chuyển động có bàn chân bám đất — dùng chung cho mọi nhân vật/quái.

Vì sao render từ 3D thay vì vẽ tay từng khung: 8 hướng lấy từ CÙNG một mô hình nên không
hướng nào bị dẹp (lỗi của bản HD cũ), và vị trí bàn chân mỗi khung là SỐ ĐÃ BIẾT — game đọc
sải chân từ đó để nhân vật không trượt trên đất. Hình ra là pixel art thật (không khử răng
cưa, bảng màu giới hạn, viền 1px), chỉ khác là nguồn hình học được dựng bằng máy.

Toạ độ: mét. Gốc (0,0,0) = điểm chạm đất dưới tâm người. Nhân vật nhìn về +Y, trên là +Z.
"""
import math
import bpy
from mathutils import Vector, Euler

TAU = math.tau
DUOI_QUA = []          # mỗi lần IK phải kẹp: chân bị đòi với xa hơn chiều dài nó (m)


def xoa_canh():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def vat_lieu(ten, mau):
    m = bpy.data.materials.get(ten) or bpy.data.materials.new(ten)
    m.diffuse_color = (*mau, 1.0)
    return m


def khop(ten, cha=None, vi_tri=(0, 0, 0)):
    """Một khớp = một Empty. Thân khối gắn vào khớp nên xoay khớp là xoay cả đoạn chi."""
    e = bpy.data.objects.new(ten, None)
    bpy.context.collection.objects.link(e)
    e.empty_display_size = 0.05
    if cha is not None:
        e.parent = cha
    e.location = vi_tri
    e.rotation_mode = 'XYZ'
    return e


def khoi(ten, cha, co, vi_tri, mat, xoay=(0, 0, 0), vat=0.0, dang='cube'):
    """Một khối hình hộp (hoặc trụ/cầu) gắn vào khớp `cha`, toạ độ cục bộ của khớp."""
    if dang == 'cube':
        bpy.ops.mesh.primitive_cube_add(size=1)
    elif dang == 'cyl':
        bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.5, depth=1)
    else:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.5)
    o = bpy.context.active_object
    o.name = ten
    o.scale = co
    o.location = vi_tri
    o.rotation_euler = xoay
    o.parent = cha
    o.data.materials.append(mat)
    if vat > 0 and dang == 'cube':
        md = o.modifiers.new('vat', 'BEVEL')
        md.width = vat
        md.segments = 1
    return o


def ik2(do_dai1, do_dai2, dy, dz):
    """IK hai đoạn trong mặt phẳng dọc (Y tới trước, Z lên).

    Trả (góc đùi, góc gối tương đối) để mắt cá rơi đúng (dy, dz) so với hông.
    Góc dương quanh trục X = vung chi về trước (+Y). Gối luôn gập về trước như người thật.
    """
    d = math.hypot(dy, dz)
    if d > (do_dai1 + do_dai2) * 0.9995:
        # Mục tiêu nằm NGOÀI tầm chân ⇒ IK kẹp lại và bàn chân không tới đúng chỗ ⇒ trượt đất.
        # Ghi lại để render.py dừng hẳn thay vì lặng lẽ xuất một sprite trượt chân.
        DUOI_QUA.append(round(d - (do_dai1 + do_dai2), 4))
        d = (do_dai1 + do_dai2) * 0.9995
    line = math.atan2(dy, -dz)                     # góc của đường hông→mắt cá so với phương thẳng xuống
    alpha = math.acos(max(-1, min(1, (do_dai1**2 + d**2 - do_dai2**2) / (2 * do_dai1 * d))))
    beta = math.acos(max(-1, min(1, (do_dai1**2 + do_dai2**2 - d**2) / (2 * do_dai1 * do_dai2))))
    return line + alpha, -(math.pi - beta)


class DangDi:
    """Chu kỳ bước chân. `do_dai` = sải MỘT chu kỳ (hai bước), `cham` = tỉ lệ thời gian bàn chân chạm đất.

    Bàn chân đang chạm đất lùi về sau đúng tốc độ thân tiến lên ⇒ đứng yên trên mặt đất.
    """

    def __init__(self, do_dai, cham, nhac, nhun, nghieng):
        self.do_dai, self.cham, self.nhac, self.nhun, self.nghieng = do_dai, cham, nhac, nhun, nghieng

    def chan(self, pha):
        """Vị trí (y, cao) của mắt cá một chân ở pha [0,1) — so với gốc thân, KHÔNG so với đất."""
        pha %= 1.0
        L, d = self.do_dai, self.cham
        if pha < d:                                  # chạm đất: lùi đều từ +L·d/2 về −L·d/2
            s = pha / d
            return (L * d / 2) * (1 - 2 * s), 0.0, True
        s = (pha - d) / (1 - d)                       # vung: nhấc lên rồi đặt xuống phía trước
        y = -(L * d / 2) + L * d * (0.5 - 0.5 * math.cos(math.pi * s))
        return y, self.nhac * math.sin(math.pi * s), False
