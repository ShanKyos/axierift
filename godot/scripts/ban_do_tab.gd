class_name BanDoTab
extends CanvasLayer
## Bản đồ tổng quan (phím Tab) — CHỤP TỪ CHÍNH THẾ GIỚI 3D: một camera trực giao nhìn thẳng xuống
## cả map 200 m, chụp một lần lúc vào map. Nhờ thế bản đồ không bao giờ lệch với địa hình thật:
## sửa một con đường trong `Ardhaven3D` là bản đồ đổi theo, không có tấm tranh thứ hai nào để quên.
## Bấm lên bản đồ ⇒ nhân vật chạy tới chỗ đó (đường đi vẫn qua lưới đi bộ của thế giới).
##
## Toạ độ: bắc ở TRÊN (−Z), đông bên PHẢI (+X) — cùng hướng với tranh tổng quan gốc.

signal bam_dat(p: Vector3)

const CO_ANH := 1024
const LOP_NV := 2                       # nhân vật nằm lớp vẽ 2 — camera bản đồ không chụp nó

var tg: TheGioi3D
var nv: Node3D
var anh_chup: Image                     # ảnh đã chụp (null khi chạy không màn hình)
var _vp: SubViewport
var _cam: Camera3D
var _nen: Control
var _anh: TextureRect
var _ve: Control


func _init(the_gioi: TheGioi3D, nhan_vat: Node3D) -> void:
	tg = the_gioi
	nv = nhan_vat
	layer = 10
	visible = false


func _ready() -> void:
	_vp = SubViewport.new()
	_vp.size = Vector2i(CO_ANH, CO_ANH)
	_vp.render_target_update_mode = SubViewport.UPDATE_DISABLED
	_vp.world_3d = get_viewport().find_world_3d()
	_vp.msaa_3d = Viewport.MSAA_4X
	add_child(_vp)
	_cam = Camera3D.new()
	_cam.projection = Camera3D.PROJECTION_ORTHOGONAL
	_cam.size = 2.0 * Ardhaven3D.NUA
	_cam.keep_aspect = Camera3D.KEEP_HEIGHT
	_cam.position = Vector3(0, 150, 0)
	_cam.rotation_degrees = Vector3(-90, 0, 0)          # nhìn thẳng xuống, mép trên của ảnh = −Z = bắc
	_cam.far = 400.0
	_cam.cull_mask = 1
	_cam.environment = _moi_truong()
	_vp.add_child(_cam)

	_nen = Control.new()
	_nen.set_anchors_preset(Control.PRESET_FULL_RECT)
	_nen.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(_nen)
	var toi := ColorRect.new()
	toi.color = Color(0, 0, 0, 0.62)
	toi.set_anchors_preset(Control.PRESET_FULL_RECT)
	toi.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_nen.add_child(toi)
	_anh = TextureRect.new()
	_anh.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_anh.stretch_mode = TextureRect.STRETCH_SCALE
	_anh.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_anh.texture = _vp.get_texture()
	_nen.add_child(_anh)
	_ve = Control.new()
	_ve.set_anchors_preset(Control.PRESET_FULL_RECT)
	_ve.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_ve.draw.connect(_ve_lop)
	_nen.add_child(_ve)
	_nen.gui_input.connect(_bam)
	get_viewport().size_changed.connect(_xep)
	_xep()


## Bản đồ không cần sương mù, và phải sáng đều để đọc được — môi trường riêng cho camera chụp.
func _moi_truong() -> Environment:
	var e := Environment.new()
	e.background_mode = Environment.BG_COLOR
	e.background_color = Color(0.05, 0.05, 0.06)
	e.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	e.ambient_light_color = Color(0.62, 0.6, 0.58)
	e.ambient_light_energy = 0.55
	e.tonemap_mode = Environment.TONE_MAPPER_ACES
	e.adjustment_enabled = true
	e.adjustment_saturation = 0.9
	e.adjustment_contrast = 1.1
	return e


## Chụp thế giới một lần. Gọi sau khi thế giới đã dựng xong.
func chup() -> void:
	_vp.render_target_update_mode = SubViewport.UPDATE_ONCE
	await RenderingServer.frame_post_draw
	await RenderingServer.frame_post_draw
	var im := _vp.get_texture().get_image()
	if im and not im.is_empty():
		anh_chup = im
		_anh.texture = ImageTexture.create_from_image(im)      # đóng băng: không chụp lại mỗi khung


## Khung ảnh trên màn: vuông, 88% cạnh ngắn, chính giữa.
func khung() -> Rect2:
	var s: Vector2 = get_viewport().get_visible_rect().size
	var c := minf(s.x, s.y) * 0.88
	return Rect2((s - Vector2(c, c)) * 0.5, Vector2(c, c))


func _xep() -> void:
	var k := khung()
	_anh.position = k.position
	_anh.size = k.size


## Thế giới (m) ↔ điểm chuẩn hoá trên bản đồ (0..1, gốc trên-trái).
static func uv_cua(p: Vector3) -> Vector2:
	var n := Ardhaven3D.NUA
	return Vector2((p.x + n) / (2.0 * n), (p.z + n) / (2.0 * n))


static func the_gioi_cua(uv: Vector2) -> Vector3:
	var n := Ardhaven3D.NUA
	return Vector3(uv.x * 2.0 * n - n, 0, uv.y * 2.0 * n - n)


func man_cua(p: Vector3) -> Vector2:
	var k := khung()
	return k.position + uv_cua(p) * k.size


func bat_tat(mo: Variant = null) -> void:
	visible = (not visible) if mo == null else bool(mo)
	if visible:
		_xep()
		_ve.queue_redraw()


func _process(_dt: float) -> void:
	if visible:
		_ve.queue_redraw()


func _bam(e: InputEvent) -> void:
	if e is InputEventMouseButton and e.pressed and e.button_index == MOUSE_BUTTON_LEFT:
		var k := khung()
		if k.has_point(e.position):
			bam_dat.emit(the_gioi_cua((e.position - k.position) / k.size))
		_nen.accept_event()


func _chu(ve: Control, p: Vector2, s: String, co: int, mau: Color) -> void:
	var f := ThemeDB.fallback_font
	var w := f.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, co).x
	ve.draw_string_outline(f, p - Vector2(w * 0.5, 0), s, HORIZONTAL_ALIGNMENT_LEFT, -1, co, 5, Color(0, 0, 0, 0.9))
	ve.draw_string(f, p - Vector2(w * 0.5, 0), s, HORIZONTAL_ALIGNMENT_LEFT, -1, co, mau)


func _ve_lop() -> void:
	var k := khung()
	_ve.draw_rect(k.grow(4), Color(0.55, 0.45, 0.28), false, 3.0)
	_ve.draw_rect(k.grow(8), Color(0.12, 0.1, 0.08), false, 3.0)
	var co := clampi(int(k.size.x / 46.0), 11, 22)
	for v in Ardhaven3D.VUNG:                           # bốn vùng: tên + quái + cấp
		var h: Rect2 = v.hop
		var tam := man_cua(Vector3(h.get_center().x, 0, h.get_center().y))
		_chu(_ve, tam, v.ten, co + 2, Color(0.95, 0.85, 0.6))
		_chu(_ve, tam + Vector2(0, co + 4), "%s · cấp %d-%d" % [v.quai, v.cap[0], v.cap[1]], co - 2, Color(0.85, 0.8, 0.72))
	for g in Ardhaven3D.cong().values():
		var p := man_cua(Vector3(g.tam.x, 0, g.tam.y) + Vector3(g.ra.x, 0, g.ra.y) * 9.0)
		_chu(_ve, p + Vector2(0, co * 0.4), g.ten, co - 2, Color(0.8, 0.9, 1.0))
	for ten in tg.nha:
		if ten.begins_with("Cổng"):
			continue
		var n: Node3D = tg.nha[ten]
		var p := man_cua(tg.hop(n).get_center())
		_ve.draw_circle(p, 3.0, Color(1, 0.85, 0.4))
		_chu(_ve, p + Vector2(0, -6), ten, co - 4, Color(1, 0.95, 0.8))
	_chu(_ve, man_cua(Vector3(0, 0, Ardhaven3D.TAM_THANH.y + Ardhaven3D.NUA_THANH + 16.0)) + Vector2(0, co),
		"ARDHAVEN", co + 4, Color(1.0, 0.9, 0.55))
	# nhân vật: chấm + mũi chỉ hướng mặt
	var p := man_cua(nv.global_position)
	var h := Vector2(sin(nv.rotation.y), cos(nv.rotation.y))
	var ben := Vector2(-h.y, h.x)
	_ve.draw_colored_polygon(PackedVector2Array([p + h * 13.0, p + ben * 6.0, p - ben * 6.0]), Color(1, 0.95, 0.5))
	_ve.draw_circle(p, 5.5, Color(0.9, 0.2, 0.15))
	_ve.draw_arc(p, 6.5, 0, TAU, 20, Color(1, 1, 1), 2.0)
	_chu(_ve, k.position + Vector2(k.size.x * 0.5, k.size.y + co + 12), "Tab: đóng · bấm lên bản đồ: chạy tới đó", co - 3, Color(0.8, 0.8, 0.8))
