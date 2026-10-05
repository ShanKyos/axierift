"""Render sprite sheet pixel art 8 hướng từ khung khối 3D.

    python3 godot/tools/sprites/render.py hiep_si      # → godot/assets/sprites/hiep_si/*.png + .json

Camera là CHIẾU SONG SONG góc nâng 30°, phương vị 45° — đúng phép chiếu của ô đất isometric
2:1 (64×32), nên sải chân đo trên sprite và quãng đường đi trên map dùng chung một thước.
"""
import json
import math
import os
import sys
import tempfile

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
import rig  # noqa: E402

O = 96                       # cạnh ô sprite (px)
NEO_MAC_DINH = (48, 84)      # điểm chạm đất của gốc nhân vật trong ô (mô hình khai NEO riêng thì thắng)
PX_M = 35.96                 # px trên mỗi mét ngang màn hình ⇒ người 1,8 m cao ~56 px
GOC_NANG = math.radians(30)  # ô đất 2:1 ⇔ sin(góc nâng) = 0,5
HUONG = ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE']
GOC_XOAY = [math.radians(-135 - 45 * d) for d in range(8)]   # mặt nhân vật (+Y) quay theo hướng màn hình


def dung_camera(NEO):
    cam_data = bpy.data.cameras.new('cam')
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = O / PX_M
    cam = bpy.data.objects.new('cam', cam_data)
    bpy.context.collection.objects.link(cam)
    cam.rotation_euler = (math.pi / 2 - GOC_NANG, 0, math.radians(45))
    huong_nhin = cam.rotation_euler.to_matrix() @ Vector((0, 0, -1))
    cam.location = -huong_nhin * 20
    bpy.context.scene.camera = cam
    sc = bpy.context.scene
    sc.render.resolution_x = O
    sc.render.resolution_y = O
    sc.render.resolution_percentage = 100
    bpy.context.view_layer.update()
    u, v, _ = world_to_camera_view(sc, cam, Vector((0, 0, 0)))
    cam_data.shift_x = u - NEO[0] / O
    cam_data.shift_y = v - (1 - NEO[1] / O)
    bpy.context.view_layer.update()
    return cam


def cai_render():
    sc = bpy.context.scene
    sc.render.engine = 'BLENDER_WORKBENCH'
    sc.display.shading.light = 'STUDIO'
    sc.display.shading.color_type = 'MATERIAL'
    sc.display.shading.show_cavity = False
    sc.display.shading.show_shadows = False
    sc.display.render_aa = 'OFF'                 # pixel art: không khử răng cưa
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.view_settings.view_transform = 'Standard'


def chieu(sc, cam, p):
    u, v, _ = world_to_camera_view(sc, cam, Vector(p))
    return [round(u * O, 2), round((1 - v) * O, 2)]


# ── hậu kỳ: bảng màu giới hạn + viền 1px ─────────────────────────────────────
def bang_mau(mats):
    pal = []
    for m in mats:
        c = np.array(m.diffuse_color[:3])
        c = c ** (1 / 2.2)                         # màu khai báo là tuyến tính → sRGB
        for k in (0.42, 0.66, 0.86, 1.0, 1.18):
            pal.append(np.clip(c * k * 255, 0, 255))
    return np.array(pal)


def hau_ky(anh, pal):
    a = np.array(anh.convert('RGBA')).astype(np.float32)
    rgb, al = a[..., :3], a[..., 3] > 127
    d = ((rgb[:, :, None, :] - pal[None, None, :, :]) ** 2).sum(-1)
    q = pal[d.argmin(-1)]
    out = np.zeros_like(a)
    out[..., :3] = q
    out[..., 3] = al * 255
    # viền: ô trong suốt kề ô đặc (4 hướng) → màu viền tối
    dac = al
    ke = np.zeros_like(dac)
    ke[1:, :] |= dac[:-1, :]
    ke[:-1, :] |= dac[1:, :]
    ke[:, 1:] |= dac[:, :-1]
    ke[:, :-1] |= dac[:, 1:]
    vien = ke & ~dac
    out[vien] = (22, 18, 28, 255)
    return Image.fromarray(out.astype(np.uint8), 'RGBA')


def thap_nhat(ten=False):
    """Độ cao (m) của đỉnh lưới thấp nhất toàn mô hình, sau mọi phép xoay của khung hiện tại."""
    dg = bpy.context.evaluated_depsgraph_get()
    z, ai = 1e9, None
    for o in bpy.data.objects:
        if o.type != 'MESH':
            continue
        oe = o.evaluated_get(dg)
        mw = oe.matrix_world
        for v in oe.data.vertices:
            zz = (mw @ v.co).z
            if zz < z:
                z, ai = zz, o.name
    return (z, ai) if ten else z


def main(ten):
    global O
    rig.xoa_canh()
    mod = __import__(ten)
    O = getattr(mod, 'O', 96)                    # công trình to cần ô to hơn nhân vật
    # Nhân vật xoay theo 8 hướng màn hình. Công trình thì PHẢI thẳng lưới ô đất, nên chỉ xoay
    # bội 90° (mô hình khai XOAY riêng; số hàng của bảng = số góc).
    xoay = getattr(mod, 'XOAY', GOC_XOAY)
    J = mod.dung(None)
    cai_render()
    NEO = getattr(mod, 'NEO', NEO_MAC_DINH)
    cam = dung_camera(NEO)
    sc = bpy.context.scene
    pal = bang_mau(bpy.data.materials)
    ra = os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'sprites', ten)
    os.makedirs(ra, exist_ok=True)
    tmp = tempfile.mkdtemp()
    meta = {'o': O, 'neo': list(NEO), 'px_m': PX_M, 'huong': HUONG, 'trang_thai': {}}
    for tt, (n, giay, lap) in mod.TRANG_THAI.items():
        bang = Image.new('RGBA', (O * n, O * len(xoay)), (0, 0, 0, 0))
        chan_meta = []
        for d in range(len(xoay)):
            J['goc'].rotation_euler = (0, 0, xoay[d])
            dong = []
            for k in range(n):
                chan = mod.dat_tu_the(J, tt, k, n)
                bpy.context.view_layer.update()
                # Không vật gì được xuyên mặt đất. Hai cách sửa, mô hình chọn:
                #  · BAM_DAT[tt] = khớp gốc của thân ⇒ dời khớp đó lên/xuống cho điểm thấp nhất
                #    nằm ĐÚNG mặt đất (thân nằm/ngã/trúng đòn thì phải chạm đất, không lún, không bay);
                #  · sua_xuyen_dat() ⇒ mô hình tự chỉnh tư thế (vd thu bớt nhát chém).
                bam = getattr(mod, 'BAM_DAT', {}).get(tt)
                if bam:
                    J[bam].location.z -= thap_nhat() / J[bam].parent.matrix_world.to_scale().z
                    bpy.context.view_layer.update()
                if hasattr(mod, 'sua_xuyen_dat'):
                    mod.sua_xuyen_dat(J, tt, k, thap_nhat, bpy.context.view_layer.update)
                f = os.path.join(tmp, f'{tt}_{d}_{k}.png')
                sc.render.filepath = f
                bpy.ops.render.render(write_still=True)
                bang.paste(hau_ky(Image.open(f), pal), (k * O, d * O))
                # bàn chân: điểm trên MẶT ĐẤT ngay dưới mắt cá (đã qua xoay hướng)
                kq = {}
                for s in ('L', 'R'):
                    w = J['ca' + s].matrix_world.translation
                    kq[s] = {'px': chieu(sc, cam, (w.x, w.y, 0.0)), 'cham': bool(chan[s][3])}
                z_, ai_ = thap_nhat(True)
                kq['thap'] = round(z_, 4)
                if z_ < -0.005:
                    print('  XUYÊN ĐẤT', tt, d, k, ai_, round(z_, 3))
                dong.append(kq)
            chan_meta.append(dong)
        bang.save(os.path.join(ra, f'{tt}.png'), optimize=True)
        meta['trang_thai'][tt] = {
            'khung': n, 'fps': round(n / giay, 3), 'lap': lap,
            'trung': mod.KHUNG_TRUNG.get(tt), 'toc_do_m_s': mod.TOC_DO.get(tt),
            'chan': chan_meta,
        }
        if rig.DUOI_QUA:
            raise SystemExit(f'DỪNG: {tt} đòi chân với quá tầm {len(rig.DUOI_QUA)} lần, xa nhất {max(rig.DUOI_QUA)} m — sải hoặc độ khuỵu sai')
        th = [k_['thap'] for dg_ in chan_meta for k_ in dg_]
        print('xong', tt, n, 'khung · điểm thấp nhất', min(th), '…', max(th), 'm')
    with open(os.path.join(ra, f'{ten}.json'), 'w') as fp:
        json.dump(meta, fp, ensure_ascii=False, separators=(',', ':'))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'hiep_si')
