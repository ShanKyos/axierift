#!/usr/bin/env python3
"""Nhân vật 3D (GLB có khung xương Mixamo + động tác, xuất từ Tripo) → bộ sprite 8 hướng của game.

    python3 godot/tools/hd/nuong_3d.py <tệp.glb> <tên bộ>        # cần `pip install bpy==4.2.0`

Ra `godot/assets/hd/hd_<tên>/` đúng định dạng `SpriteBo` (bảng hàng = hướng, cột = khung + JSON).

Năm việc, theo thứ tự — mỗi việc là một chỗ đã hỏng thật trên tệp Tripo đầu tiên:

1. BỌC DA LẠI. Auto Rig của Tripo trên mô hình tách 38 mảnh cho ra lớp bọc da hỏng: đo được trong
   chính Tripo, chạy động tác nào các mảnh cũng văng ra. Khung xương và động tác thì dùng được.
   Gộp mảnh → dựng KHỐI LIỀN TẠM bằng voxel remesh (bone heat không giải được trên 38 vỏ hở) →
   bọc da khối đó → chép trọng số sang lưới thật theo mặt gần nhất.
2. LỌC HÌNH HỌC. Bone heat có lúc lan qua khe (vạt áo ↔ ống chân) và gán đỉnh ống chân cho xương
   ngón út cách 40 cm ⇒ cạnh giãn 77 lần lúc niệm phép. Mỗi đỉnh chỉ được theo xương nằm trong
   (khoảng cách tới xương gần nhất + 8 cm). Xương đầu mút (…4, …_End) tắt quyền biến dạng.
3. LÀM MƯỢT TRỌNG SỐ. Hai đỉnh kề nhau ở vạt áo theo hai chân khác nhau là vạt áo bị xé khi bước.
4. KHOÁ TẠI CHỖ + ĐO SẢI. Hông bị khoá ngang (động tác vẫn có thể trôi dù đã bật "in place"); tốc
   độ đi/chạy suy từ bàn chân CHỐNG ĐẤT lùi về sau bao nhiêu mỗi giây — cùng luật chân không trượt.
5. CHỤP đúng phép chiếu của game: trực giao, camera nâng 30° (sin 30° = 0,5 = nén dọc của ô 2:1),
   1 m trên đất = `PX_M` px logic. Ánh sáng CỐ ĐỊNH theo camera (trên-trái), nhân vật xoay — xoay
   cả đèn theo người là quay mặt nào cũng sáng như nhau, mất hết khối.
"""
import json
import math
import os
import re
import sys

import bpy
import mathutils
import numpy as np
from mathutils.geometry import intersect_point_line
from mathutils.kdtree import KDTree
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from chuan_bi_hd import PX_M, HUONG, CAO, ra, chan_khung  # noqa: E402

O = 384                     # ô texture — đủ chỗ cho bước chân tới gần camera và thân ngã nằm ngang
TY = 0.30                   # px texture → px logic
NEO = (O / 2, 300)         # bàn chân trong ô
CAO_M = CAO["nguoi"] / (math.cos(math.radians(30)) * PX_M)    # cao thật (m) để lên màn đúng 67 px
TEX_M = PX_M / TY           # px texture mỗi mét
SAMPLES = 10

# trạng thái game → (từ khoá tên động tác, số khung, fps, lặp)
TRANG_THAI = {
    "idle": ("idle", 16, 6.0, True, (0.0, 0.30)),          # chỉ lấy đoạn đầu: idle gốc dài 15 s
    "walk": ("walk", 12, None, True, (0.0, 1.0)),
    "run": ("run", 10, None, True, (0.0, 1.0)),
    "attack": ("cast", 12, 12.0, False, (0.0, 1.0)),
    "hit": ("hit", 6, 12.0, False, (0.0, 1.0)),
    "death": ("defeat", 12, 10.0, False, (0.0, 1.0)),
}


def nap(glb):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=glb)
    for o in list(bpy.data.objects):
        if o.type == "MESH" and o.parent is None:          # quả cầu thừa Tripo để lại
            bpy.data.objects.remove(o)
    arm = [o for o in bpy.data.objects if o.type == "ARMATURE"][0]
    return arm


def boc_da(arm):
    ms = [o for o in bpy.data.objects if o.type == "MESH" and o.parent == arm]
    arm.animation_data.action = None
    for pb in arm.pose.bones:
        pb.rotation_mode = "QUATERNION"
        pb.rotation_quaternion = (1, 0, 0, 0)
        pb.location = (0, 0, 0)
    bpy.ops.object.select_all(action="DESELECT")
    for o in ms:
        o.modifiers.clear()
        o.vertex_groups.clear()
        o.select_set(True)
    bpy.context.view_layer.objects.active = ms[0]
    bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM")
    bpy.ops.object.join()
    than = bpy.context.view_layer.objects.active
    than.name = "than"
    for b in arm.data.bones:
        if re.search(r"(4|_End)$", b.name):
            b.use_deform = False
    # 1. khối liền tạm. ⚠ Bone heat RẤT nhạy với cỡ voxel: 0,0120 giải được, 0,0118 thất bại hẳn
    # (0 đỉnh có trọng số) trên cùng một mô hình. Nên thử lần lượt nhiều cỡ, lấy cỡ đầu tiên bọc
    # được ≥ 97% đỉnh của khối tạm — đừng tin một con số cố định.
    proxy = None
    for vx in (0.012, 0.010, 0.014, 0.009, 0.016, 0.011, 0.013):
        if proxy:
            bpy.data.objects.remove(proxy)
        proxy = than.copy()
        proxy.data = than.data.copy()
        proxy.vertex_groups.clear()
        bpy.context.collection.objects.link(proxy)
        m = proxy.modifiers.new("vx", "REMESH")
        m.mode = "VOXEL"
        m.voxel_size = vx * than.dimensions.z / 0.98
        bpy.ops.object.select_all(action="DESELECT")
        proxy.select_set(True)
        bpy.context.view_layer.objects.active = proxy
        bpy.ops.object.modifier_apply(modifier="vx")
        bpy.ops.object.select_all(action="DESELECT")
        proxy.select_set(True)
        arm.select_set(True)
        bpy.context.view_layer.objects.active = arm
        bpy.ops.object.parent_set(type="ARMATURE_AUTO")
        co_ts = sum(1 for v in proxy.data.vertices if v.groups) / max(1, len(proxy.data.vertices))
        print("PROXY voxel %.3f: %d dinh, %.1f%% co trong so" % (vx, len(proxy.data.vertices), co_ts * 100), flush=True)
        if co_ts >= 0.97:          # phần hụt do bước "điền từ đỉnh gần nhất" bên dưới lo
            break
    else:
        raise SystemExit("bone heat không giải được ở cỡ voxel nào")
    for b in arm.data.bones:
        if b.use_deform:
            than.vertex_groups.new(name=b.name)
    dt = than.modifiers.new("dt", "DATA_TRANSFER")
    dt.object = proxy
    dt.use_vert_data = True
    dt.data_types_verts = {"VGROUP_WEIGHTS"}
    dt.vert_mapping = "POLYINTERP_NEAREST"
    dt.layers_vgroup_select_src = "ALL"
    dt.layers_vgroup_select_dst = "NAME"
    bpy.ops.object.select_all(action="DESELECT")
    than.select_set(True)
    bpy.context.view_layer.objects.active = than
    bpy.ops.object.modifier_apply(modifier="dt")
    bpy.data.objects.remove(proxy)
    # 2. lọc hình học
    vg = than.vertex_groups
    dx = [(b.name, b.head_local.copy(), b.tail_local.copy()) for b in arm.data.bones if b.use_deform]
    xa_them = 0.08 * max(than.dimensions)
    for v in than.data.vertices:
        d = {}
        for n, h, t in dx:
            q, f = intersect_point_line(v.co, h, t)
            f = min(1.0, max(0.0, f))
            d[n] = (v.co - (h + (t - h) * f)).length
        dm = min(d.values())
        for g in list(v.groups):
            n = vg[g.group].name
            if n in d and d[n] > dm + xa_them:
                vg[g.group].remove([v.index])
    # đỉnh trắng trọng số → chép từ đỉnh có trọng số gần nhất
    co = [v for v in than.data.vertices if any(g.weight > 0.01 for g in v.groups)]
    kd = KDTree(len(co))
    for i, v in enumerate(co):
        kd.insert(v.co, i)
    kd.balance()
    for v in than.data.vertices:
        if any(g.weight > 0.01 for g in v.groups):
            continue
        _, i, _ = kd.find(v.co)
        for g in co[i].groups:
            vg[g.group].add([v.index], g.weight, "REPLACE")
    # 3. làm mượt (Laplace trên cạnh), giữ 4 xương, chuẩn hoá
    nv, ng = len(than.data.vertices), len(vg)
    W = np.zeros((nv, ng))
    for v in than.data.vertices:
        for g in v.groups:
            W[v.index, g.group] = g.weight
    E = np.array([e.vertices[:] for e in than.data.edges])
    deg = np.bincount(E.ravel(), minlength=nv).astype(float)
    deg[deg == 0] = 1
    for _ in range(20):
        s = np.zeros_like(W)
        np.add.at(s, E[:, 0], W[E[:, 1]])
        np.add.at(s, E[:, 1], W[E[:, 0]])
        W = 0.5 * W + 0.5 * s / deg[:, None]
    np.put_along_axis(W, np.argsort(-W, axis=1)[:, 4:], 0, axis=1)
    W /= np.maximum(W.sum(1, keepdims=True), 1e-9)
    for gi in range(ng):
        vg[gi].remove(list(range(nv)))
        for k in np.nonzero(W[:, gi] > 1e-4)[0]:
            vg[gi].add([int(k)], float(W[k, gi]), "REPLACE")
    than.parent = arm
    am = than.modifiers.new("arm", "ARMATURE")
    am.object = arm
    return than


def dung_canh(arm, than):
    sc = bpy.context.scene
    # cao CAO_M mét, bàn chân ở gốc toạ độ
    k = CAO_M / than.dimensions.z
    arm.parent.scale = arm.parent.scale * k if arm.parent else arm.scale
    if not arm.parent:
        arm.scale = (k, k, k)
    bpy.context.view_layer.update()
    # ⚠ nút cha glTF dùng QUATERNION: đổi `rotation_euler` thì không ăn, nhân vật quay mặt S cả 8 hướng
    g = arm.parent if arm.parent else arm
    e = g.matrix_world.to_euler()
    g.rotation_mode = "XYZ"
    g.rotation_euler = e
    # đế giày phải nằm ĐÚNG mặt đất (z = 0): mô hình Tripo đặt chân thấp hơn gốc vài cm
    bpy.context.view_layer.update()
    dep = bpy.context.evaluated_depsgraph_get()
    me = than.evaluated_get(dep).to_mesh()
    z_min = min((than.matrix_world @ v.co).z for v in me.vertices)
    g.location.z -= z_min
    bpy.context.view_layer.update()
    print("DE_GIAY", round(z_min, 4), flush=True)
    sc.render.engine = "CYCLES"
    sc.cycles.samples = SAMPLES
    sc.cycles.use_denoising = True
    sc.render.resolution_x = sc.render.resolution_y = O
    sc.render.film_transparent = True
    sc.view_settings.view_transform = "Standard"
    w = bpy.data.worlds.new("w")
    sc.world = w
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[1].default_value = 0.55
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    sc.collection.objects.link(cam)
    sc.camera = cam
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = O / TEX_M
    cam.data.shift_y = (NEO[1] - O / 2) / O
    pr = math.radians(30)
    cam.location = mathutils.Vector((0, -math.cos(pr) * 20, math.sin(pr) * 20))
    cam.rotation_euler = (-cam.location).to_track_quat("-Z", "Y").to_euler()
    sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
    sc.collection.objects.link(sun)
    sun.data.energy = 3.2
    sun.data.angle = math.radians(8)
    sun.rotation_euler = (math.radians(50), 0, math.radians(-40))     # trên-trái, hơi trước
    fill = bpy.data.objects.new("fill", bpy.data.lights.new("fill", "SUN"))
    sc.collection.objects.link(fill)
    fill.data.energy = 0.8
    fill.rotation_euler = (math.radians(70), 0, math.radians(150))     # viền sáng phía sau-phải


def tim_dong_tac(tu_khoa):
    for a in bpy.data.actions:
        if a.name.lower().startswith(tu_khoa):
            return a
    raise SystemExit("không có động tác '%s' trong tệp: %s" % (tu_khoa, [a.name for a in bpy.data.actions]))


def lech_hong(arm, a, hong_goc):
    """Độ lệch NGANG trung bình của hông so với tư thế gốc trong cả động tác (m, đất Blender).
    Động tác "in place" của Tripo vẫn có thể dời CẢ người một khoảng cố định (đo được: chạy lệch
    1,16 m về trước) — lệch đó phải trừ ra, còn lắc hông trong từng bước thì giữ (là thật)."""
    sc = bpy.context.scene
    ps = []
    for f in range(int(a.frame_range[0]), int(a.frame_range[1]) + 1, 2):
        sc.frame_set(f)
        p = arm.matrix_world @ arm.pose.bones["mixamorig:Hips"].head
        ps.append((p.x - hong_goc.x, p.y - hong_goc.y))
    m = np.mean(ps, axis=0)
    return mathutils.Vector((m[0], m[1], 0.0))


def do_toc_do(arm, a, fps):
    """Tốc độ trên đất (m/s) = vận tốc lùi của bàn chân THẤP NHẤT (đang chống) — đo trên chính động tác."""
    sc = bpy.context.scene
    f0, f1 = int(a.frame_range[0]), int(a.frame_range[1])
    ds = []
    truoc = None
    for f in range(f0, f1 + 1):
        sc.frame_set(f)
        chan = [arm.matrix_world @ arm.pose.bones["mixamorig:%sToeBase" % b].head for b in ("Left", "Right")]
        thap = min(chan, key=lambda p: p.z)
        if truoc is not None:
            ben = 0 if thap is chan[0] else 1
            if ben == truoc[0]:
                ds.append(-(thap.y - truoc[1].y))        # nhìn về −Y ⇒ chân chống lùi về +Y
        truoc = (0 if thap is chan[0] else 1, thap)
    v = float(np.median(ds)) * fps if ds else 0.0
    return abs(v)


def nuong(glb, ten):
    arm = nap(glb)
    than = boc_da(arm)
    dung_canh(arm, than)
    sc = bpy.context.scene
    fps_goc = sc.render.fps / sc.render.fps_base
    goc_xoay = arm.parent if arm.parent else arm
    goc_rot = goc_xoay.rotation_euler.copy()
    goc_loc = goc_xoay.location.copy()
    arm.animation_data.action = None
    bpy.context.view_layer.update()
    hong_goc = arm.matrix_world @ arm.pose.bones["mixamorig:Hips"].head
    out = {}
    for tt, (tk, n, fps, lap, (a0, a1)) in TRANG_THAI.items():
        a = tim_dong_tac(tk)
        arm.animation_data.action = a
        goc_xoay.rotation_euler = goc_rot
        goc_xoay.location = goc_loc
        lech = lech_hong(arm, a, hong_goc)
        fr0, fr1 = a.frame_range
        dai = (fr1 - fr0) * (a1 - a0)
        bat = fr0 + (fr1 - fr0) * a0
        # khung lặp thì không lấy điểm cuối (trùng điểm đầu)
        buoc = dai / (n if lap else max(1, n - 1))
        ks = [bat + i * buoc for i in range(n)]
        if fps is None:
            fps = n / (dai / fps_goc)                     # giữ nguyên nhịp gốc của động tác
        toc = None
        if tt in ("walk", "run"):
            goc_xoay.rotation_euler = goc_rot
            toc = round(do_toc_do(arm, a, fps_goc), 3)
        sheet = Image.new("RGBA", (n * O, 8 * O))
        for d in range(8):
            g = PI_HUONG(d)
            goc_xoay.rotation_euler = goc_rot.copy()
            goc_xoay.rotation_euler.rotate(mathutils.Euler((0, 0, g)))
            goc_xoay.location = goc_loc - mathutils.Matrix.Rotation(g, 3, "Z") @ lech
            for i, f in enumerate(ks):
                sc.frame_set(int(f), subframe=f - int(f))
                tep = bpy.app.tempdir + "k.png"
                sc.render.filepath = tep
                bpy.ops.render.render(write_still=True)
                sheet.paste(Image.open(tep).convert("RGBA"), (i * O, d * O))
        goc_xoay.rotation_euler = goc_rot
        goc_xoay.location = goc_loc
        print("LECH", tt, tuple(round(x, 3) for x in lech), flush=True)
        sheet.save(ra("hd_" + ten, tt + ".webp"), "WEBP", quality=92, alpha_quality=100, method=6)
        chan = [[chan_khung(sheet.crop((i * O, dd * O, (i + 1) * O, (dd + 1) * O)), NEO[1]) for i in range(n)] for dd in range(8)]
        trung = None
        if tt == "attack":
            trung = int(n * 0.45)
        out[tt] = {"khung": n, "fps": round(fps, 3), "lap": lap, "trung": trung, "toc_do_m_s": toc, "chan": chan}
        print("NUONG", tt, n, "khung", "fps %.2f" % fps, "toc", toc, flush=True)
    json.dump({"o": O, "neo": list(NEO), "px_m": PX_M, "ty": TY, "cao": CAO_M * math.cos(math.radians(30)) * TEX_M,
               "huong": HUONG, "trang_thai": out, "dinh_dang": "webp",
               "nguon": "3D: " + os.path.basename(glb)}, open(ra("hd_" + ten, "hd_" + ten + ".json"), "w"))


def PI_HUONG(d):
    """Góc xoay quanh trục đứng cho hướng d (0=S … 7=SE) — khớp `Iso.huong`.
    Hướng d trên đất (đã mở nén, y màn hình chĩa xuống) có góc 90° + 45°·d. Mô hình nhìn về −Y
    (về phía camera = S). Đất Blender: x = x màn hình, y = −y màn hình."""
    g = math.radians(90 + 45 * d)
    gx, gy_man = math.cos(g), math.sin(g)
    return math.atan2(gx, gy_man)


if __name__ == "__main__":
    nuong(sys.argv[-2], sys.argv[-1])
