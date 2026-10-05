class_name Npc
extends ThanThe
## Người trong thành: thợ rèn, cô bán rượu, pháp sư, thủ kho, lính gác, dân làng.
## Bấm vào là nói chuyện (lời và việc đọc từ NpcDuLieu.VAI). Dân làng thì lang thang quanh chỗ ở.

@export var ten_hien := ""
@export var vai := "dan"
var lang_thang := false
var dang_noi := false
var nha := Vector2.ZERO
var _nghi := 0.0
var _nhan: Label


func _ready() -> void:
	add_to_group("npc")
	super._ready()
	nha = position
	_nghi = randf_range(1.0, 4.0)
	_nhan = Label.new()
	_nhan.text = ten_hien
	_nhan.add_theme_font_size_override("font_size", 8)
	var chuc: bool = NpcDuLieu.VAI.get(vai, {}).get("nut", "") != ""
	_nhan.add_theme_color_override("font_color", Color(1, 0.86, 0.45) if chuc else Color(0.75, 1, 0.75))
	_nhan.add_theme_color_override("font_outline_color", Color(0.05, 0.05, 0.06))
	_nhan.add_theme_constant_override("outline_size", 2)
	_nhan.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_nhan.size = Vector2(96, 10)
	_nhan.position = Vector2(-48, -bo.neo.y + 18 - 12)
	add_child(_nhan)


func loi_chao() -> String:
	var ds: Array = NpcDuLieu.VAI.get(vai, {}).get("loi", ["..."])
	return ds[randi() % ds.size()]


func quay_ve(p: Vector2) -> void:
	_quay(Iso.huong(p - position, huong))
	if trang_thai != "idle":
		_vao("idle", true)


func _process(dt: float) -> void:
	if not lang_thang or dang_noi:
		if not duong.is_empty() and not dang_noi:
			buoc_di(dt, "walk")
		elif trang_thai != "idle":
			_vao("idle")
		return
	if not duong.is_empty():
		buoc_di(dt, "walk")
		return
	if trang_thai != "idle":
		_vao("idle")
	_nghi -= dt
	if _nghi <= 0.0:
		_nghi = randf_range(2.5, 6.0)
		for thu in 6:
			var dich := nha + Iso.nen(Vector2.from_angle(randf() * TAU) * randf_range(40, 150))
			if the_gioi.di_duoc(dich) and the_gioi.an_toan(dich):
				duong = the_gioi.tim_duong(position, dich)
				break
