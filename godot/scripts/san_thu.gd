class_name SanThu
extends Node3D
## Sân thử 3D-0: một khoảnh sân lát đá có tường, cột, đuốc, thùng — để duyệt camera, ánh sáng và
## cảm giác di chuyển trước khi dựng cả Ardhaven (mốc 3D-1). Art: KayKit Dungeon Remastered (CC0).
##
## Lưới đi bộ: ô 0,5 m (AStarGrid2D trên mặt phẳng XZ). Vật đặt xuống tự đánh dấu chân đế của nó là
## ô chặn — đo chân đế bằng hộp bao thật của mô hình, không khai tay.

const DV := "res://assets/mo_hinh/kaykit/dungeon/%s.glb"
const O := 0.5                         # cạnh ô lưới đi bộ (m)
const RONG := 24                       # sân rộng 24 m × 24 m, tâm ở gốc toạ độ

var astar := AStarGrid2D.new()
var _o_dac := {}
var muc_tieu_thu: Array[Node3D] = []   # cọc tập — bấm vào để chém
var cot: Array[Node3D] = []            # bốn cột giữa sân — bài kiểm đo đường đi vòng chúng


func _ready() -> void:
	_dat_nen()
	_lat_san()
	_dung_tuong()
	_dat_do()
	_dung_luoi()


func _them(ten: String, p: Vector3, xoay := 0.0, co := 1.0, chan := true) -> Node3D:
	var n: Node3D = load(DV % ten).instantiate()
	n.position = p
	n.rotation.y = deg_to_rad(xoay)
	n.scale = Vector3.ONE * co
	add_child(n)
	for m: MeshInstance3D in n.find_children("*", "MeshInstance3D", true, false):
		m.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON
	if chan:
		_danh_dau(n)
	return n


func _hop(n: Node3D) -> AABB:
	var ab := AABB()
	var dau := true
	for m: MeshInstance3D in n.find_children("*", "MeshInstance3D", true, false):
		var a: AABB = m.global_transform * m.get_aabb()
		ab = a if dau else ab.merge(a)
		dau = false
	return ab


func _danh_dau(n: Node3D) -> void:
	var ab := _hop(n).grow(-0.05)
	for z in range(floori(ab.position.z / O), ceili(ab.end.z / O)):
		for x in range(floori(ab.position.x / O), ceili(ab.end.x / O)):
			_o_dac[Vector2i(x, z)] = true


## Đất ngoài sân: một mặt phẳng rộng màu đất cỏ, nhiễu cố định, nằm thấp hơn mặt đá lát một chút.
## Không có nó thì camera chéo nhìn ra mép sân là thấy khoảng đen trống.
func _dat_nen() -> void:
	var m := PlaneMesh.new()
	m.size = Vector2(160, 160)
	var mat := StandardMaterial3D.new()
	var nhieu := FastNoiseLite.new()
	nhieu.seed = 7
	nhieu.frequency = 0.02
	var tex := NoiseTexture2D.new()
	tex.noise = nhieu
	tex.seamless = true
	tex.width = 512
	tex.height = 512
	var mau := Gradient.new()
	mau.set_color(0, Color(0.20, 0.24, 0.13))
	mau.set_color(1, Color(0.36, 0.36, 0.20))
	tex.color_ramp = mau
	mat.albedo_texture = tex
	mat.uv1_scale = Vector3(10, 10, 1)
	mat.roughness = 1.0
	m.material = mat
	var n := MeshInstance3D.new()
	n.mesh = m
	n.position = Vector3(0, -0.12, 0)
	add_child(n)


func _lat_san() -> void:
	var r := RandomNumberGenerator.new()
	r.seed = 20261005
	var bien := ["floor_tile_small", "floor_tile_small", "floor_tile_small", "floor_tile_small_broken_A",
		"floor_tile_small_weeds_A", "floor_tile_small_decorated"]
	for z in range(-RONG / 2, RONG / 2, 2):
		for x in range(-RONG / 2, RONG / 2, 2):
			var t: String = bien[r.randi() % bien.size()] if r.randf() < 0.35 else "floor_tile_small"
			_them(t, Vector3(x + 1, 0, z + 1), r.randi_range(0, 3) * 90.0, 1.0, false)


func _dung_tuong() -> void:
	var h := RONG / 2.0
	for x in range(-RONG / 2, RONG / 2, 4):                   # tường bắc (−Z) — phía xa camera
		_them("wall_doorway" if x == -2 else "wall", Vector3(x + 2, 0, -h - 0.5))
	for z in range(-RONG / 2, RONG / 2, 4):                   # tường tây (−X)
		_them("wall", Vector3(-h - 0.5, 0, z + 2), 90.0)
	_them("wall_corner", Vector3(-h - 0.5, 0, -h - 0.5))
	for x in [-8.0, 8.0]:
		_them("banner_patternA_red", Vector3(x, 0, -h + 0.05), 0.0, 1.0, false)
	for z in [-6.0, 6.0]:
		_them("banner_shield_red", Vector3(-h + 0.05, 0, z), 90.0, 1.0, false)
	for p in [Vector3(-4, 2.2, -h + 0.1), Vector3(4, 2.2, -h + 0.1)]:
		_duoc(_them("torch_mounted", p, 0.0, 1.0, false))


func _duoc(n: Node3D) -> void:
	var l := OmniLight3D.new()
	l.light_color = Color(1.0, 0.62, 0.3)
	l.light_energy = 2.2
	l.omni_range = 7.0
	l.shadow_enabled = true
	l.position = Vector3(0, 0.6, 0.35)
	n.add_child(l)


func _dat_do() -> void:
	for p in [Vector3(-6, 0, -6), Vector3(6, 0, -6), Vector3(-6, 0, 6), Vector3(6, 0, 6)]:
		cot.append(_them("pillar_decorated", p, 0.0, 0.8))
	_them("barrel_large", Vector3(-9.5, 0, -9.5), 0.0, 0.55)
	_them("barrel_small_stack", Vector3(-8.0, 0, -10.2), 20.0, 0.6)
	_them("crates_stacked", Vector3(9.0, 0, -9.5), 15.0, 0.6)
	_them("box_large", Vector3(10.3, 0, -7.8), 40.0, 0.55)
	_them("keg", Vector3(-10.2, 0, 2.0), 90.0, 0.55)
	_them("table_medium_decorated_A", Vector3(-9.0, 0, 6.5), 0.0, 0.7)
	_them("chest", Vector3(0.0, 0, -10.3), 0.0, 0.6)
	_duoc(_them("torch_lit", Vector3(3.0, 0.4, 3.0), 0.0, 1.0))
	_duoc(_them("torch_lit", Vector3(-3.0, 0.4, -3.0), 0.0, 1.0))
	for p in [Vector3(3, 0, -3), Vector3(5, 0, 1)]:          # cọc tập: thùng nhỏ chịu đòn
		var c := _them("barrel_large", p, 0.0, 0.42)
		c.set_meta("ten", "Cọc Tập")
		muc_tieu_thu.append(c)


func _dung_luoi() -> void:
	var n := int(RONG / O)
	astar.region = Rect2i(-n / 2, -n / 2, n, n)
	astar.cell_size = Vector2.ONE
	astar.diagonal_mode = AStarGrid2D.DIAGONAL_MODE_ONLY_IF_NO_OBSTACLES
	astar.update()
	for c in _o_dac:
		if astar.is_in_boundsv(c):
			astar.set_point_solid(c, true)


func o_cua(p: Vector3) -> Vector2i:
	return Vector2i(floori(p.x / O), floori(p.z / O))


func tam_o(c: Vector2i) -> Vector3:
	return Vector3((c.x + 0.5) * O, 0, (c.y + 0.5) * O)


func di_duoc(p: Vector3) -> bool:
	var c := o_cua(p)
	return astar.is_in_boundsv(c) and not astar.is_point_solid(c)


## Đường đi (điểm thế giới) từ a tới b; b nằm trong vật cản thì lấy ô trống gần nhất.
func tim_duong(a: Vector3, b: Vector3) -> Array[Vector3]:
	var out: Array[Vector3] = []
	var ca := o_cua(a)
	var cb := o_cua(b)
	if not astar.is_in_boundsv(ca) or not astar.is_in_boundsv(cb):
		return out
	if astar.is_point_solid(cb):
		var tot := Vector2i(-99999, 0)
		for r in range(1, 6):
			for dz in range(-r, r + 1):
				for dx in range(-r, r + 1):
					var c := cb + Vector2i(dx, dz)
					if astar.is_in_boundsv(c) and not astar.is_point_solid(c) and tot.x == -99999:
						tot = c
		if tot.x == -99999:
			return out
		cb = tot
		b = tam_o(cb)
	var ids := astar.get_id_path(ca, cb, true)
	for i in range(1, ids.size() - 1):
		out.append(tam_o(ids[i]))
	out.append(Vector3(b.x, 0, b.z))
	return out
