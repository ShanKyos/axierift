extends Node3D
## Mốc 3D-0: sân thử, một Dark Knight, camera kiểu MU, ánh sáng và bóng đổ.
## Chuột trái lên đất: đi tới (giữ chuột: đi theo con trỏ). Chuột trái lên cọc tập: chạy tới chém.
## Con lăn: kéo gần / đẩy xa camera.

var san: SanThu
var nv: NhanVat3D
var cam: CameraMU
var _giu := false
var _nhip := 0.0


func _ready() -> void:
	_dung_moi_truong()
	san = SanThu.new()
	add_child(san)
	nv = NhanVat3D.new()
	nv.position = Vector3(0, 0, 4)
	add_child(nv)
	nv.ra_don.connect(_trung_don)
	cam = CameraMU.new()
	cam.muc_tieu = nv
	add_child(cam)
	cam.make_current()
	var huong := Label.new()
	huong.text = "Chuột trái: đi / chém cọc tập · giữ chuột: đi theo con trỏ · con lăn: gần / xa"
	huong.position = Vector2(12, 10)
	huong.add_theme_font_size_override("font_size", 16)
	huong.add_theme_color_override("font_outline_color", Color(0, 0, 0))
	huong.add_theme_constant_override("outline_size", 4)
	var lop := CanvasLayer.new()
	add_child(lop)
	lop.add_child(huong)


func _dung_moi_truong() -> void:
	var env := Environment.new()
	var troi := ProceduralSkyMaterial.new()
	troi.sky_top_color = Color(0.18, 0.24, 0.38)
	troi.sky_horizon_color = Color(0.55, 0.52, 0.5)
	troi.ground_bottom_color = Color(0.1, 0.09, 0.08)
	troi.ground_horizon_color = Color(0.4, 0.36, 0.32)
	var sky := Sky.new()
	sky.sky_material = troi
	env.background_mode = Environment.BG_SKY
	env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	env.ambient_light_energy = 0.32
	env.tonemap_mode = Environment.TONE_MAPPER_ACES
	env.tonemap_exposure = 1.0
	env.ssao_enabled = true
	env.ssao_radius = 1.2
	env.ssao_intensity = 1.6
	env.glow_enabled = true
	env.glow_intensity = 0.5
	env.glow_bloom = 0.05
	env.adjustment_enabled = true
	env.adjustment_saturation = 0.92
	env.adjustment_contrast = 1.12
	env.adjustment_brightness = 0.92
	env.fog_enabled = true                                # sương mỏng ở xa: đọc ra chiều sâu, kiểu MU
	env.fog_light_color = Color(0.32, 0.33, 0.38)
	env.fog_density = 0.012
	env.fog_sky_affect = 0.0
	var we := WorldEnvironment.new()
	we.environment = env
	add_child(we)
	var mt := DirectionalLight3D.new()
	mt.rotation_degrees = Vector3(-42, -30, 0)          # nắng chiều xiên: bóng dài, mặt đá có khối
	mt.light_color = Color(1.0, 0.86, 0.7)
	mt.light_energy = 1.05
	mt.shadow_enabled = true
	mt.directional_shadow_max_distance = 60.0
	mt.shadow_blur = 1.2
	add_child(mt)


## Điểm trên mặt đất (y = 0) dưới con trỏ.
func diem_dat(man: Vector2) -> Variant:
	var o := cam.project_ray_origin(man)
	var h := cam.project_ray_normal(man)
	if absf(h.y) < 0.0001:
		return null
	var t := -o.y / h.y
	return o + h * t if t > 0 else null


func muc_tieu_tai(man: Vector2) -> Node3D:
	var tot: Node3D = null
	var kc_tot := 48.0                                   # px trên màn
	for m in san.muc_tieu_thu:
		var p := cam.unproject_position(m.global_position + Vector3(0, 0.5, 0))
		var kc := p.distance_to(man)
		if kc < kc_tot:
			kc_tot = kc
			tot = m
	return tot


func _bam(man: Vector2, chon: bool) -> void:
	if chon:
		var m := muc_tieu_tai(man)
		if m:
			nv.danh(m)
			_giu = false
			return
	var p = diem_dat(man)
	if p == null:
		return
	nv.di_toi(san.tim_duong(nv.global_position, p))


func _trung_don(m: Node3D) -> void:
	if m == null or not is_instance_valid(m):
		return
	var t := create_tween()                              # cọc tập lắc khi trúng
	var goc := m.rotation
	t.tween_property(m, "rotation", goc + Vector3(0.18, 0, 0.1), 0.06)
	t.tween_property(m, "rotation", goc, 0.18)
	var so := Label3D.new()
	so.text = str(randi_range(18, 31))
	so.font_size = 64
	so.outline_size = 12
	so.modulate = Color(1, 0.9, 0.4)
	so.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	so.no_depth_test = true
	so.position = m.global_position + Vector3(0, 1.4, 0)
	add_child(so)
	var t2 := create_tween()
	t2.tween_property(so, "position:y", so.position.y + 1.2, 0.8)
	t2.parallel().tween_property(so, "modulate:a", 0.0, 0.8)
	t2.tween_callback(so.queue_free)


func _process(dt: float) -> void:
	if _giu:
		_nhip -= dt
		if _nhip <= 0.0:
			_nhip = 0.12
			_bam(get_viewport().get_mouse_position(), false)


func _unhandled_input(e: InputEvent) -> void:
	if e is InputEventMouseButton and e.button_index == MOUSE_BUTTON_LEFT:
		_giu = e.pressed
		if e.pressed:
			_bam(e.position, true)
