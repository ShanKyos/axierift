class_name TheGioi3D
extends Node3D
## Ardhaven 3D (mốc 3D-1): dựng TOÀN BỘ map từ `Ardhaven3D` — mặt đất tô theo vùng, sông + cầu,
## tường thành bốn cổng, nhà, rừng/đá/ruộng/nghĩa địa, núi viền map — và lưới đi bộ.
## Art tạm: KayKit Medieval Hexagon + Dungeon Remastered (CC0).
##
## Lưới đi bộ: ô 0,5 m (AStarGrid2D trên XZ). Vật đặt xuống tự đánh dấu chân đế bằng HỘP BAO THẬT
## của mô hình; cây đánh dấu đúng thân cây (tán không chặn chân ai).
##
## ⚠ MẶT ĐẤT LÀ ẢNH TÔ TỪ CHÍNH DỮ LIỆU (đường, sông, ruộng, vùng) chứ không phải tranh vẽ sẵn: sửa
## một con đường trong `Ardhaven3D` là mặt đất, lưới đi bộ và bản đồ Tab cùng đổi theo.

const D := preload("res://scripts/du_lieu/ardhaven_3d.gd")
const TM := "res://assets/mo_hinh/kaykit/trung_co/%s.gltf"
const DV := "res://assets/mo_hinh/kaykit/dungeon/%s.glb"
const O := 0.5
const ANH := 400                        # mặt đất: 400 px cho 200 m (0,5 m/px); chi tiết do shader lo
const BIEN := 97.0                      # ra quá đây là núi viền — chặn

var astar := AStarGrid2D.new()
var muc_tieu_thu: Array[Node3D] = []    # cọc tập — bấm vào để chém
var vat_can_thu: Node3D                 # giếng quảng trường — bài kiểm đo đường vòng nó
var nha := {}                           # tên công trình → nút (bản đồ Tab ghi tên)
var tuong: Array[AABB] = []             # hộp bao các khúc tường KHÔNG có cổng
var dem := {}                           # vùng → {loại vật: số lượng} — bài kiểm hỏi vùng có đúng nội dung
var _mm := {}                           # đường dẫn mô hình → Array[Transform3D] (vẽ chung một MultiMesh)
var _luoi := {}                         # đường dẫn → Mesh
var _r := RandomNumberGenerator.new()


func _ready() -> void:
	_r.seed = D.HAT
	_khoi_luoi()
	_dat_nen()
	_dung_song()
	_lat_pho()
	_dung_thanh()
	_dat_cong_trinh()
	_dong_ruong()
	_nghia_dia()
	_trong_rung()
	_rai_da()
	_nui_vien()
	_den()
	_xay_mm()


# ───────────────────────── lưới đi bộ ─────────────────────────

func _khoi_luoi() -> void:
	var n := int(2.0 * D.NUA / O)
	astar.region = Rect2i(-n / 2, -n / 2, n, n)
	astar.cell_size = Vector2.ONE
	astar.diagonal_mode = AStarGrid2D.DIAGONAL_MODE_ONLY_IF_NO_OBSTACLES
	astar.update()
	for cz in range(-n / 2, n / 2):                    # viền map
		for cx in range(-n / 2, n / 2):
			var p := tam_o(Vector2i(cx, cz))
			if absf(p.x) > BIEN or absf(p.z) > BIEN:
				astar.set_point_solid(Vector2i(cx, cz), true)


func _chan_hop(ab: AABB, le := 0.1) -> void:
	for z in range(floori((ab.position.z - le) / O), ceili((ab.end.z + le) / O)):
		for x in range(floori((ab.position.x - le) / O), ceili((ab.end.x + le) / O)):
			var c := Vector2i(x, z)
			if astar.is_in_boundsv(c):
				astar.set_point_solid(c, true)


func _chan_tron(p: Vector2, r: float) -> void:
	for z in range(floori((p.y - r) / O), ceili((p.y + r) / O)):
		for x in range(floori((p.x - r) / O), ceili((p.x + r) / O)):
			var c := Vector2i(x, z)
			var t := tam_o(c)
			if astar.is_in_boundsv(c) and Vector2(t.x, t.z).distance_to(p) <= r + O * 0.5:
				astar.set_point_solid(c, true)


func o_cua(p: Vector3) -> Vector2i:
	return Vector2i(floori(p.x / O), floori(p.z / O))


func tam_o(c: Vector2i) -> Vector3:
	return Vector3((c.x + 0.5) * O, 0, (c.y + 0.5) * O)


func di_duoc(p: Vector3) -> bool:
	var c := o_cua(p)
	return astar.is_in_boundsv(c) and not astar.is_point_solid(c)


## Đường đi (điểm thế giới) từ a tới b; b nằm trong vật cản thì lấy ô trống gần nhất. Đường lưới
## được KÉO THẲNG (bỏ các điểm giữa khi nhìn thấy nhau) — đi theo tâm từng ô 0,5 m thì nhân vật
## xoay lắc theo bậc thang suốt quãng dài.
func tim_duong(a: Vector3, b: Vector3) -> Array[Vector3]:
	var out: Array[Vector3] = []
	var ca := o_cua(a)
	var cb := o_cua(b)
	if not astar.is_in_boundsv(ca) or not astar.is_in_boundsv(cb):
		return out
	ca = _o_trong_gan(ca)                       # đứng/bấm lọt vào vật cản ⇒ lấy ô trống gần nhất
	if astar.is_point_solid(cb):
		cb = _o_trong_gan(cb)
		b = tam_o(cb)
	if astar.is_point_solid(ca) or astar.is_point_solid(cb):
		return out
	var ids := astar.get_id_path(ca, cb, true)
	if ids.is_empty():
		return out
	var diem: Array[Vector3] = []
	for c in ids:
		diem.append(tam_o(c))
	# ⚠ get_id_path(..., true) trả đường DỞ DANG tới ô gần đích nhất khi đích bị vây kín. Chỉ thay
	# điểm cuối bằng đích khi đường thật sự TỚI đích — thay bừa là đoạn cuối xuyên thẳng qua tường
	# (bài kiểm đã bắt: bịt cổng mà vẫn "ra được" thành, đi xuyên tường 11 m).
	if ids[-1] == cb:
		diem[-1] = Vector3(b.x, 0, b.z)
	var neo := Vector3(a.x, 0, a.z)
	var i := 1
	while i < diem.size():
		var j := i
		while j + 1 < diem.size() and nhin_thay(neo, diem[j + 1]):
			j += 1
		out.append(diem[j])
		neo = diem[j]
		i = j + 1
	return out


func _o_trong_gan(c: Vector2i) -> Vector2i:
	if not astar.is_point_solid(c):
		return c
	var tot := c
	var kc_tot := 1 << 30
	for dz in range(-10, 11):
		for dx in range(-10, 11):
			var o := c + Vector2i(dx, dz)
			var k := dx * dx + dz * dz
			if k < kc_tot and astar.is_in_boundsv(o) and not astar.is_point_solid(o):
				kc_tot = k
				tot = o
	return tot


## Đoạn a→b có đi thẳng được không: lấy mẫu 0,2 m trên ba tia (giữa + lệch hai bên 0,4 m ≈ bề ngang thân) để
## không cắt góc ô chặn.
func nhin_thay(a: Vector3, b: Vector3) -> bool:
	var d := b - a
	d.y = 0
	var l := d.length()
	if l < 0.001:
		return true
	var ben := Vector3(-d.z, 0, d.x) / l * 0.4
	var n := int(ceil(l / 0.2))
	for k in n + 1:
		var p := a + d * (float(k) / n)
		if not di_duoc(p) or not di_duoc(p + ben) or not di_duoc(p - ben):
			return false
	return true


# ───────────────────────── đặt mô hình ─────────────────────────

## Đặt một mô hình sao cho TÂM HỘP BAO của nó (trên XZ) rơi đúng điểm p. Gói Medieval đặt nhiều
## mô hình lệch khỏi gốc (rào nằm ở mép ô lục giác), nên neo theo gốc là lệch hàng mét.
func _them(duong: String, p: Vector2, xoay := 0.0, co: Variant = 1.0, chan := true, y := 0.0) -> Node3D:
	var n: Node3D = load(duong).instantiate()
	n.rotation.y = deg_to_rad(xoay)
	n.scale = co if co is Vector3 else Vector3.ONE * float(co)
	n.position = Vector3(p.x, y, p.y)
	add_child(n)
	var c := hop(n).get_center()
	n.position += Vector3(p.x - c.x, 0, p.y - c.z)
	for m: MeshInstance3D in n.find_children("*", "MeshInstance3D", true, false):
		m.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON
	_nhuom_nut(n, duong)
	if chan:
		_chan_hop(hop(n))
	return n


func hop(n: Node3D) -> AABB:
	var ab := AABB()
	var dau := true
	for m: MeshInstance3D in n.find_children("*", "MeshInstance3D", true, false):
		var a: AABB = m.global_transform * m.get_aabb()
		ab = a if dau else ab.merge(a)
		dau = false
	return ab


func _luoi_cua(duong: String) -> Mesh:
	if not _luoi.has(duong):
		var n: Node3D = load(duong).instantiate()
		var m: MeshInstance3D = n.find_children("*", "MeshInstance3D", true, false)[0]
		_luoi[duong] = m.mesh
		n.free()
	return _luoi[duong]


## Rải một bản sao vào MultiMesh (cây, đá, lúa, đá lát — hàng trăm bản cùng mô hình).
func _rai(duong: String, p: Vector2, xoay: float, co: float, y := 0.0) -> void:
	if not _mm.has(duong):
		_mm[duong] = []
	_mm[duong].append(Transform3D(Basis(Vector3.UP, xoay).scaled(Vector3.ONE * co), Vector3(p.x, y, p.y)))


## Nhuộm trầm: gói KayKit sáng kẹo, mái đỏ chói, lá xanh lè — chất MU cần tối và trầm hơn.
## Mọi mô hình của gói dùng CHUNG một tấm atlas nên chỉ cần vài bản vật liệu nhuộm sẵn.
const NHUOM_CAY := Color(0.55, 0.64, 0.52)
const NHUOM_NHA := Color(0.80, 0.74, 0.72)
const NHUOM_NUI := Color(0.62, 0.62, 0.64)
var _nhuom := {}


func _mau_nhuom(duong: String) -> Variant:
	var t := duong.get_file()
	if t.begins_with("tree") or t.begins_with("trees") or t.begins_with("water") or t.begins_with("hill"):
		return NHUOM_CAY
	if t.begins_with("mountain") or t.begins_with("rock"):
		return NHUOM_NUI
	if t.begins_with("building") or t.begins_with("wall") or t.begins_with("fence"):
		return NHUOM_NHA
	return null


func _vat_lieu_nhuom(goc: Material, mau: Color) -> Material:
	var k := "%d|%s" % [goc.get_instance_id(), mau]
	if not _nhuom.has(k):
		var m: BaseMaterial3D = goc.duplicate()
		m.albedo_color = m.albedo_color * mau
		_nhuom[k] = m
	return _nhuom[k]


func _nhuom_nut(n: Node3D, duong: String) -> void:
	var mau = _mau_nhuom(duong)
	if mau == null:
		return
	for m: MeshInstance3D in n.find_children("*", "MeshInstance3D", true, false):
		var goc := m.get_active_material(0)
		if goc is BaseMaterial3D:
			m.material_override = _vat_lieu_nhuom(goc, mau)


func _xay_mm() -> void:
	for duong in _mm:
		var ds: Array = _mm[duong]
		var mm := MultiMesh.new()
		mm.transform_format = MultiMesh.TRANSFORM_3D
		mm.mesh = _luoi_cua(duong)
		mm.instance_count = ds.size()
		for i in ds.size():
			mm.set_instance_transform(i, ds[i])
		var mi := MultiMeshInstance3D.new()
		mi.multimesh = mm
		mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON
		mi.name = "mm_" + duong.get_file().get_basename()
		var mau = _mau_nhuom(duong)
		var goc := mm.mesh.surface_get_material(0)
		if mau != null and goc is BaseMaterial3D:
			mi.material_override = _vat_lieu_nhuom(goc, mau)
		add_child(mi)


func _dem(p: Vector2, loai: String, so := 1) -> void:
	var v := D.vung_tai(p)
	if not dem.has(v):
		dem[v] = {}
	dem[v][loai] = dem[v].get(loai, 0) + so


# ───────────────────────── mặt đất ─────────────────────────

const C_CO := Color(0.25, 0.28, 0.15)
const C_CO2 := Color(0.31, 0.32, 0.17)
const C_RUNG := Color(0.15, 0.18, 0.10)
const C_DA_SOI := Color(0.34, 0.28, 0.20)
const C_DAM := Color(0.17, 0.20, 0.12)
const C_BUN := Color(0.14, 0.13, 0.10)
const C_DUONG := Color(0.40, 0.33, 0.23)
const C_THANH := Color(0.28, 0.25, 0.19)
const C_CAY := Color(0.30, 0.24, 0.15)
const C_MO := Color(0.20, 0.18, 0.15)

const SHADER_DAT := """
shader_type spatial;
render_mode cull_disabled;
uniform sampler2D vung : source_color, filter_linear, repeat_disable;
uniform sampler2D chi_tiet : filter_linear_mipmap, repeat_enable;
uniform float lap = 70.0;
void fragment() {
	vec3 c = texture(vung, UV).rgb;
	float a = texture(chi_tiet, UV * lap).r;
	float b = texture(chi_tiet, UV * lap * 0.19 + vec2(0.37, 0.71)).r;
	ALBEDO = c * (0.70 + 0.55 * a) * (0.82 + 0.36 * b);
	ROUGHNESS = 0.96;
}
"""


func loai_dat(p: Vector2) -> String:
	if D.kc_day(p, D.SONG.diem) < D.SONG.rong * 0.5:
		return "song"
	if D.trong_thanh(p):
		return "thanh"
	if D.tren_duong(p):
		return "duong"
	for f in D.RUONG:
		if (f.hop as Rect2).has_point(p):
			return "ruong"
	if D.NGHIA_DIA.has_point(p):
		return "mo"
	var v := D.vung_tai(p)
	return {"bac": "rung", "dong": "dam", "nam": "co", "tay": "da_soi"}.get(v, "co")


func _dat_nen() -> void:
	var img := Image.create(ANH, ANH, false, Image.FORMAT_RGB8)
	var px := 2.0 * D.NUA / ANH
	var nh := FastNoiseLite.new()
	nh.seed = D.HAT
	nh.frequency = 0.03
	var nh2 := FastNoiseLite.new()
	nh2.seed = D.HAT + 1
	nh2.frequency = 0.11
	var kc_duong := _truong_kc(D.DUONG, px)
	var kc_song := _truong_kc([D.SONG], px)
	for j in ANH:
		for i in ANH:
			var p := Vector2(-D.NUA + (i + 0.5) * px, -D.NUA + (j + 0.5) * px)
			var n := nh.get_noise_2d(p.x, p.y)
			var n2 := nh2.get_noise_2d(p.x, p.y)
			var c := C_CO.lerp(C_CO2, 0.5 + 0.5 * n2)
			var bac := clampf((-52.0 - p.y + n * 9.0) / 8.0, 0, 1) * clampf((70.0 - absf(p.x)) / 8.0, 0, 1)
			var tay := clampf((-46.0 - p.x + n * 10.0) / 9.0, 0, 1)
			var dong := clampf((p.x - D.song_x(p.y) - 5.0 + n * 6.0) / 6.0, 0, 1)
			c = c.lerp(C_RUNG, bac)
			c = c.lerp(C_DA_SOI.lerp(C_DA_SOI.darkened(0.25), 0.5 + 0.5 * n2), tay)
			c = c.lerp(C_DAM.lerp(C_BUN, clampf(n2 * 2.0, 0, 1)), dong)
			for f in D.RUONG:
				var h: Rect2 = f.hop
				if h.grow(0.5).has_point(p):
					var luong := 0.5 + 0.5 * sin(p.y * 2.4)              # luống cày theo hàng
					c = C_CAY.lerp(C_CAY.darkened(0.3), luong)
			if D.NGHIA_DIA.grow(2.0).has_point(p):
				c = c.lerp(C_MO, 0.75)
			for a in D.AO:
				var r: float = a[1]
				var k: float = p.distance_to(a[0])
				if k < r + 2.5:
					c = c.lerp(C_BUN, clampf((r + 2.5 - k) / 2.0, 0, 1))
			if D.trong_thanh(p, 0.5):                              # đất nện lẫn cỏ úa
				c = C_THANH.lerp(C_THANH.darkened(0.2), 0.5 + 0.5 * n2).lerp(C_CO.darkened(0.15), clampf(n * 1.6, 0, 0.7))
			var k_dg: float = kc_duong[j * ANH + i]
			c = c.lerp(C_DUONG.lerp(C_DUONG.darkened(0.15), 0.5 + 0.5 * n2), 1.0 - smoothstep(0.0, 1.2, k_dg))
			var k_s: float = kc_song[j * ANH + i]
			c = c.lerp(C_BUN, 1.0 - smoothstep(0.0, 3.0, k_s))
			img.set_pixel(i, j, c)
	# mặt đất rộng hơn map 30 m mỗi phía (luồn xuống dưới núi viền); ảnh phủ đúng 200 m ở giữa
	var rong := 2.0 * D.NUA + 60.0
	var sh := Shader.new()
	sh.code = SHADER_DAT.replace("texture(vung, UV)", "texture(vung, (UV - 0.5) * %f + 0.5)" % (rong / (2.0 * D.NUA)))
	var mat := ShaderMaterial.new()
	mat.shader = sh
	mat.set_shader_parameter("vung", ImageTexture.create_from_image(img))
	var chi := NoiseTexture2D.new()
	var nn := FastNoiseLite.new()
	nn.seed = 3
	nn.frequency = 0.05
	chi.noise = nn
	chi.seamless = true
	chi.width = 256
	chi.height = 256
	chi.generate_mipmaps = true
	mat.set_shader_parameter("chi_tiet", chi)
	var m := PlaneMesh.new()
	m.size = Vector2(rong, rong)
	m.material = mat
	var nen := MeshInstance3D.new()
	nen.mesh = m
	nen.name = "MatDat"
	add_child(nen)


## Trường khoảng cách (m) tới mép một bộ đường: lấp từng đoạn trong hộp bao của nó (cắt ở 6 m).
func _truong_kc(ds: Array, px: float) -> PackedFloat32Array:
	var f := PackedFloat32Array()
	f.resize(ANH * ANH)
	f.fill(1e9)
	for r in ds:
		var diem: Array = r.diem
		var nua: float = r.rong * 0.5
		for s in range(1, diem.size()):
			var a: Vector2 = diem[s - 1]
			var b: Vector2 = diem[s]
			var lo := Vector2(minf(a.x, b.x), minf(a.y, b.y)) - Vector2.ONE * (nua + 6.0)
			var hi := Vector2(maxf(a.x, b.x), maxf(a.y, b.y)) + Vector2.ONE * (nua + 6.0)
			for j in range(maxi(0, int((lo.y + D.NUA) / px)), mini(ANH, int((hi.y + D.NUA) / px) + 1)):
				for i in range(maxi(0, int((lo.x + D.NUA) / px)), mini(ANH, int((hi.x + D.NUA) / px) + 1)):
					var p := Vector2(-D.NUA + (i + 0.5) * px, -D.NUA + (j + 0.5) * px)
					var k := D.kc_doan(p, a, b) - nua
					if k < f[j * ANH + i]:
						f[j * ANH + i] = k
	return f


# ───────────────────────── sông, cầu, ao ─────────────────────────

func _vat_nuoc() -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = Color(0.10, 0.20, 0.24)
	m.roughness = 0.18
	m.metallic_specular = 0.9
	var gon := NoiseTexture2D.new()                    # gợn sóng: bản đồ pháp tuyến từ nhiễu, toạ độ thế giới
	var nh := FastNoiseLite.new()
	nh.frequency = 0.04
	gon.noise = nh
	gon.seamless = true
	gon.as_normal_map = true
	gon.bump_strength = 6.0
	m.normal_enabled = true
	m.normal_texture = gon
	m.normal_scale = 0.6
	m.uv1_triplanar = true
	m.uv1_world_triplanar = true
	m.uv1_scale = Vector3(0.12, 0.12, 0.12)
	return m


func _dung_song() -> void:
	var diem: Array = D.SONG.diem
	var nua: float = D.SONG.rong * 0.5
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	st.set_normal(Vector3.UP)
	var day: Array[Vector2] = []                   # lấy mẫu dày 2 m để dải nước cong mượt
	for i in range(1, diem.size()):
		var n := int(ceil(diem[i - 1].distance_to(diem[i]) / 2.0))
		for k in n:
			day.append(diem[i - 1].lerp(diem[i], float(k) / n))
	day.append(diem[-1])
	for i in range(1, day.size()):
		var a: Vector2 = day[i - 1]
		var b: Vector2 = day[i]
		var t := (b - a).normalized()
		var ben := Vector2(-t.y, t.x) * nua
		var a1 := Vector3(a.x + ben.x, 0.03, a.y + ben.y)
		var a2 := Vector3(a.x - ben.x, 0.03, a.y - ben.y)
		var b1 := Vector3(b.x + ben.x, 0.03, b.y + ben.y)
		var b2 := Vector3(b.x - ben.x, 0.03, b.y - ben.y)
		# ⚠ thứ tự đỉnh quyết định mặt nào là mặt TRƯỚC (Godot: theo chiều kim đồng hồ khi nhìn từ phía
		# pháp tuyến). Ngược chiều thì mặt nước bị chiếu sáng từ dưới lên và hiện ra đen kịt.
		st.add_vertex(a1); st.add_vertex(a2); st.add_vertex(b1)
		st.add_vertex(a2); st.add_vertex(b2); st.add_vertex(b1)
	var mi := MeshInstance3D.new()
	mi.mesh = st.commit()
	mi.material_override = _vat_nuoc()
	mi.name = "Song"
	add_child(mi)
	for a in D.AO:                                  # ao đầm phía đông
		var cy := CylinderMesh.new()
		cy.top_radius = a[1]
		cy.bottom_radius = a[1]
		cy.height = 0.02
		cy.radial_segments = 28
		var ao := MeshInstance3D.new()
		ao.mesh = cy
		ao.material_override = _vat_nuoc()
		ao.position = Vector3(a[0].x, 0.02, a[0].y)
		add_child(ao)
		_chan_tron(a[0], a[1] - 0.3)
		for k in 3:
			var g := _r.randf() * TAU
			_rai(TM % ("waterlily_A" if k % 2 == 0 else "waterlily_B"),
				a[0] + Vector2(cos(g), sin(g)) * a[1] * _r.randf_range(0.2, 0.7), _r.randf() * TAU, 5.0, 0.02)
		_dem(a[0], "ao")
	# chặn lòng sông, chừa đúng mặt cầu
	var cau := Rect2(D.CAU.tam - Vector2(D.CAU.dai, D.CAU.rong) * 0.5, Vector2(D.CAU.dai, D.CAU.rong))
	for cz in range(astar.region.position.y, astar.region.end.y):
		var z := (cz + 0.5) * O
		var sx := D.song_x(z)
		for cx in range(floori((sx - 9.0) / O), ceili((sx + 9.0) / O)):
			var c := Vector2i(cx, cz)
			var p := Vector2((cx + 0.5) * O, z)
			if astar.is_in_boundsv(c) and D.kc_day(p, diem) < nua + 0.2 and not cau.has_point(p):
				astar.set_point_solid(c, true)
	# cầu gỗ: mô hình dài theo Z ⇒ xoay 90°; hạ xuống cho mặt cầu (y 0,2-0,25 trong mô hình) sát đất
	var co_cau: float = D.CAU.dai / 1.92
	_them(TM % "building_bridge_A", D.CAU.tam, 90.0, co_cau, false, -0.2 * co_cau + 0.1)
	for k in 10:                                    # cỏ nước dọc bờ
		var z := _r.randf_range(-90, 90)
		var bo := (nua + 0.6) * (1.0 if _r.randf() < 0.5 else -1.0)
		_rai(TM % ["waterplant_A", "waterplant_B", "waterplant_C"][k % 3], Vector2(D.song_x(z) + bo, z),
			_r.randf() * TAU, 5.0)


# ───────────────────────── thành ─────────────────────────

## Phố chữ thập + quảng trường lát đá (đá lát của gói Dungeon, 2 m một viên).
func _lat_pho() -> void:
	var t := D.TAM_THANH
	var bien := ["floor_tile_small", "floor_tile_small", "floor_tile_small", "floor_tile_small_broken_A",
		"floor_tile_small_weeds_A", "floor_tile_small_decorated"]
	var da := {}
	var lim := D.NUA_THANH - 2.0
	for z in range(-int(lim), int(lim) + 1, 2):
		for x in range(-int(lim), int(lim) + 1, 2):
			var p := t + Vector2(x, z)
			var tren_pho := absf(x) <= D.NUA_PHO or absf(z) <= D.NUA_PHO
			if tren_pho or Vector2(x, z).length() <= D.QUANG_TRUONG:
				da[p] = true
	for p in da:
		var ten: String = bien[_r.randi() % bien.size()] if _r.randf() < 0.3 else "floor_tile_small"
		_rai(DV % ten, p, _r.randi_range(0, 3) * PI * 0.5, 1.0, -0.04)
	# lối qua bốn cổng ra tới mép tường ngoài
	for k in D.cong().values():
		for s in range(-3, 4):
			_rai(DV % "floor_tile_small", k.tam + k.ra * s * 2.0, 0.0, 1.0, -0.04)


func _dung_thanh() -> void:
	var t := D.TAM_THANH
	var h := D.NUA_THANH
	var cong := D.cong()
	for canh in ["bac", "nam", "tay", "dong"]:
		var doc: bool = canh == "tay" or canh == "dong"
		for i in D.SO_DOAN:
			var lech := (i - (D.SO_DOAN - 1) * 0.5) * D.DOAN_TUONG
			var tam: Vector2 = cong[canh].tam + (Vector2(0, lech) if doc else Vector2(lech, 0))
			var la_cong := i == (D.SO_DOAN - 1) / 2
			var n := _them(TM % ("wall_straight_gate" if la_cong else "wall_straight"), tam,
				90.0 if doc else 0.0, D.CO, not la_cong)
			if la_cong:
				_mo_cong(n)
				_chan_cong(hop(n), doc)
				nha[cong[canh].ten] = n
			else:
				tuong.append(hop(n))
	for g in [Vector2(-1, -1), Vector2(1, -1), Vector2(-1, 1), Vector2(1, 1)]:
		_them(TM % "building_tower_A_red", t + g * h, 0.0, D.CO)
	# cờ hai bên mỗi cổng
	for k in cong.values():
		var ben := Vector2(-k.ra.y, k.ra.x)
		for s in [-1.0, 1.0]:
			_them(TM % "flag_red", k.tam + k.ra * 3.0 + ben * s * 4.2, 0.0, 6.0, false)


## Mô hình cổng có hai cánh cửa ĐÓNG sẵn (bản lề ở x = ±0,45). Lối qua cổng là đường đi bộ thật,
## nên cửa phải mở — để đóng thì người chơi thấy mình đi xuyên qua một cánh cửa gỗ.
func _mo_cong(n: Node3D) -> void:
	for ten in ["wall_straight_gate_door_left", "wall_straight_gate_door_right"]:
		var c: Node3D = n.find_child(ten, true, false)
		if c:
			c.rotation.y = deg_to_rad(-100.0 if ten.ends_with("left") else 100.0)


## Khúc tường có cổng: chặn hộp bao trừ lối giữa rộng 2×LO_CONG.
func _chan_cong(ab: AABB, doc: bool) -> void:
	var c := ab.get_center()
	for z in range(floori(ab.position.z / O), ceili(ab.end.z / O)):
		for x in range(floori(ab.position.x / O), ceili(ab.end.x / O)):
			var p := tam_o(Vector2i(x, z))
			var lech := absf(p.z - c.z) if doc else absf(p.x - c.x)
			if lech > D.LO_CONG:
				astar.set_point_solid(Vector2i(x, z), true)


func _dat_cong_trinh() -> void:
	for ct in D.CONG_TRINH:
		var co: float = ct[3] if ct[3] > 0 else D.CO
		var n := _them(TM % ct[0], ct[1], ct[2], co)
		if ct[4] != "":
			nha[ct[4]] = n
		if ct[0] == "building_well_red":
			vat_can_thu = n
		_dem(ct[1], "nha")
	# sân tập: hai bia tập bắn trước nhà kho
	for p in [Vector2(22, 12), Vector2(26, 11)]:
		var c := _them(TM % "target", p, 200.0, 5.0)
		c.set_meta("ten", "Bia Tập")
		muc_tieu_thu.append(c)


# ───────────────────────── vùng ngoài thành ─────────────────────────

func _dong_ruong() -> void:
	for f in D.RUONG:
		var h: Rect2 = f.hop
		if f.lua:
			var y := h.position.y + 5.2
			while y < h.end.y - 3.0:
				var x := h.position.x + 4.7
				while x < h.end.x - 3.0:
					_rai(TM % "building_grain", Vector2(x, y), 0.0, 5.0)
					_dem(Vector2(x, y), "lua")
					x += 9.2
				y += 10.2
		# rào gỗ quanh ruộng, chừa lối vào giữa cạnh bắc
		var buoc := 5.6
		for canh in 4:
			var a: Vector2 = [h.position, Vector2(h.end.x, h.position.y), h.end, Vector2(h.position.x, h.end.y)][canh]
			var b: Vector2 = [Vector2(h.end.x, h.position.y), h.end, Vector2(h.position.x, h.end.y), h.position][canh]
			var dai := a.distance_to(b)
			var so := int(dai / buoc)
			for k in so:
				var tam := a.lerp(b, (k + 0.5) / so)
				if canh == 0 and absf(tam.x - h.get_center().x) < buoc * 0.7:
					continue
				var xoay := 0.0 if canh % 2 == 1 else 90.0          # rào gốc dài theo Z
				var g := _them(TM % "fence_wood_straight", tam, xoay, Vector3(3.4, 3.4, buoc / 1.15), true)
				if _r.randf() < 0.18:                               # rào bỏ hoang: vài khúc đổ nghiêng
					g.rotation.z = deg_to_rad(_r.randf_range(-25, 25))
		_dem(h.get_center(), "ruong")


func _nghia_dia() -> void:
	var h := D.NGHIA_DIA
	var y := h.position.y + 2.5
	while y < h.end.y - 1.5:
		var x := h.position.x + 2.5
		while x < h.end.x - 1.5:
			var p := Vector2(x + _r.randf_range(-0.4, 0.4), y)
			# rào đá gốc mảnh và thấp ⇒ kéo cao, ép mỏng: thành bia mộ dựng đứng
			var bia := _them(TM % "fence_stone_straight", p, 90.0 + _r.randf_range(-8, 8), Vector3(2.2, 6.5, 1.4), true)
			bia.rotation.z = deg_to_rad(_r.randf_range(-6, 6))
			_dem(p, "bia")
			x += 3.6
		y += 4.0
	for k in 6:                                                 # cây chết quanh nghĩa địa
		var p := h.get_center() + Vector2(_r.randf_range(-14, 14), _r.randf_range(-12, 12))
		if not h.grow(1.0).has_point(p):
			_rai(TM % ("tree_single_A_cut" if k % 2 == 0 else "tree_single_B_cut"), p, _r.randf() * TAU, 5.0)
			_chan_tron(p, 0.7)


func _trong(p: Vector2) -> bool:
	if D.trong_thanh(p, 6.0) or D.tren_duong(p, 3.0):
		return false
	if D.kc_day(p, D.SONG.diem) < D.SONG.rong * 0.5 + 3.0:
		return false
	for f in D.RUONG:
		if (f.hop as Rect2).grow(3.0).has_point(p):
			return false
	if D.NGHIA_DIA.grow(3.0).has_point(p):
		return false
	for ct in D.CONG_TRINH:
		if (ct[1] as Vector2).distance_to(p) < 8.0:
			return false
	for a in D.AO:
		if (a[0] as Vector2).distance_to(p) < a[1] + 2.0:
			return false
	return absf(p.x) < BIEN - 2.0 and absf(p.y) < BIEN - 2.0


func _trong_rung() -> void:
	var cay: Array[Vector2] = []
	var thu := func(hop_vung: Rect2, so: int, cach: float, mat: float) -> void:
		var k := 0
		while k < so * 14 and so > 0:
			k += 1
			var p := Vector2(_r.randf_range(hop_vung.position.x, hop_vung.end.x), _r.randf_range(hop_vung.position.y, hop_vung.end.y))
			if _r.randf() > mat or not _trong(p):
				continue
			var gan := false
			for q in cay:
				if q.distance_squared_to(p) < cach * cach:
					gan = true
					break
			if gan:
				continue
			cay.append(p)
			so -= 1
			var r := _r.randf()
			if r < 0.72:
				var co := _r.randf_range(4.6, 6.8)
				_rai(TM % ("tree_single_A" if _r.randf() < 0.55 else "tree_single_B"), p, _r.randf() * TAU, co)
				_chan_tron(p, 0.09 * co)
			else:
				var co := _r.randf_range(3.2, 4.2)
				_rai(TM % ("trees_A_medium" if _r.randf() < 0.5 else "trees_B_medium"), p, _r.randf() * TAU, co)
				_chan_tron(p, 0.55 * co)
			_dem(p, "cay")
	thu.call(Rect2(-66, -97, 132, 44), 330, 3.1, 1.0)            # rừng thông bắc — dày
	thu.call(Rect2(-44, 34, 50, 62), 22, 6.0, 1.0)               # đồng cỏ tây nam — lác đác
	thu.call(Rect2(70, -95, 27, 190), 34, 5.0, 1.0)              # bờ đầm đông
	thu.call(Rect2(-97, 30, 50, 66), 10, 7.0, 1.0)               # tây nam
	# cây chết ở đồi đá tây
	for k in 26:
		var p := Vector2(_r.randf_range(-96, -48), _r.randf_range(-58, 50))
		if _trong(p):
			_rai(TM % ("tree_single_A_cut" if k % 2 == 0 else "tree_single_B_cut"), p, _r.randf() * TAU, _r.randf_range(4, 6))
			_chan_tron(p, 0.7)
			_dem(p, "cay_chet")


func _rai_da() -> void:
	var da := ["rock_single_A", "rock_single_B", "rock_single_C", "rock_single_D", "rock_single_E"]
	var o_vung := [[Rect2(-97, -60, 50, 112), 95, 5.0, 11.0], [Rect2(-66, -97, 132, 44), 30, 4.0, 7.0],
		[Rect2(-44, 34, 104, 62), 18, 4.0, 7.0], [Rect2(70, -95, 27, 190), 16, 4.0, 7.0]]
	for v in o_vung:
		var h: Rect2 = v[0]
		for k in int(v[1]):
			var p := Vector2(_r.randf_range(h.position.x, h.end.x), _r.randf_range(h.position.y, h.end.y))
			if not _trong(p):
				continue
			var co := _r.randf_range(v[2], v[3])
			var ten: String = da[_r.randi() % da.size()]
			_rai(TM % ten, p, _r.randf() * TAU, co)
			if co > 6.0:
				_chan_tron(p, 0.14 * co)
			_dem(p, "da")
	# mỏm đá nhọn đồi tây (núi trơ, không cỏ)
	for p in [Vector2(-88, -56), Vector2(-74, -72), Vector2(-93, -82), Vector2(-62, -54), Vector2(-90, 32), Vector2(-60, 40)]:
		_them(TM % ["mountain_C", "mountain_A", "mountain_B"][int(absf(p.x)) % 3], p, _r.randf_range(0, 360), _r.randf_range(4.0, 5.5))
		_dem(p, "mom_da")


## Núi viền quanh map: chặn mép thế giới bằng địa hình thay vì một bức tường vô hình trơ trụi.
func _nui_vien() -> void:
	# núi đá trơ: bản có cỏ của gói mang chân đế lục giác vàng chói, nhìn từ trên xuống thành một vành hạt vàng
	var loai := ["mountain_A", "mountain_B", "mountain_C"]
	var buoc := 17.0
	var x := -D.NUA - 10.0
	while x <= D.NUA + 10.0:
		for z in [-D.NUA - 9.0, D.NUA + 9.0]:
			_them(TM % loai[_r.randi() % loai.size()], Vector2(x + _r.randf_range(-3, 3), z + _r.randf_range(-3, 3)),
				_r.randf_range(0, 360), _r.randf_range(10.5, 13.5), false)
		x += buoc
	var z2 := -D.NUA + 7.0
	while z2 <= D.NUA - 7.0:
		for xx in [-D.NUA - 9.0, D.NUA + 9.0]:
			_them(TM % loai[_r.randi() % loai.size()], Vector2(xx + _r.randf_range(-3, 3), z2 + _r.randf_range(-3, 3)),
				_r.randf_range(0, 360), _r.randf_range(10.5, 13.5), false)
		z2 += buoc


# ───────────────────────── đèn ─────────────────────────

func _den() -> void:
	var t := D.TAM_THANH
	for g in [45.0, 135.0, 225.0, 315.0]:                       # bốn đuốc quanh quảng trường
		var p := t + Vector2(cos(deg_to_rad(g)), sin(deg_to_rad(g))) * (D.QUANG_TRUONG + 1.5)
		var n := _them(DV % "torch_lit", p, 0.0, 1.6, true, 0.0)
		_lua(n, Vector3(0, 0.9, 0), Color(1.0, 0.6, 0.28), 2.4, 9.0)
	for k in D.cong().values():                                 # đuốc hai bên lối cổng, phía trong
		var ben := Vector2(-k.ra.y, k.ra.x)
		for s in [-1.0, 1.0]:
			var n := _them(DV % "torch_lit", k.tam - k.ra * 4.0 + ben * s * 3.4, 0.0, 1.6, true, 0.0)
			_lua(n, Vector3(0, 0.9, 0), Color(1.0, 0.6, 0.28), 1.8, 8.0)
	if nha.has("Lò Rèn"):                                       # lửa lò rèn
		_lua(nha["Lò Rèn"], Vector3(0, 0.3, 0), Color(1.0, 0.45, 0.15), 3.0, 10.0, true)
	if nha.has("Tháp Pháp Sư"):                                 # ánh phép trên đỉnh tháp
		_lua(nha["Tháp Pháp Sư"], Vector3(0, 1.02, 0), Color(0.55, 0.45, 1.0), 4.0, 16.0, true)


func _lua(n: Node3D, lech: Vector3, mau: Color, nang: float, tam: float, toan_cuc := false) -> void:
	var l := OmniLight3D.new()
	l.light_color = mau
	l.light_energy = nang
	l.omni_range = tam
	add_child(l)
	if toan_cuc:                        # theo hộp bao: lech.y là tỉ lệ chiều cao công trình
		var ab := hop(n)
		l.global_position = Vector3(ab.get_center().x, ab.position.y + ab.size.y * lech.y, ab.get_center().z)
	else:
		l.global_position = n.global_position + lech * n.scale
