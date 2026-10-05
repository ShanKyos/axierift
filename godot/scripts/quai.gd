class_name Quai
extends ThanThe
## Quái: lang thang quanh chỗ sinh, thấy người chơi trong tầm thì đuổi, xa chỗ sinh quá thì quay về.

@export var ten_hien := "Bọ Giáp"
@export var cap := 1
var nha := Vector2.ZERO
var nguoi: NhanVat
var tam_thay := 90.0
var tam_danh := 26.0
var day_xich := 220.0
var sat_thuong := Vector2(3, 6)
var exp_thuong := 12
var _nghi := 0.0
var _da_trung := false
var _ve_nha := false
var _tim_lai := 0.0


func _ready() -> void:
	ten_bo = "bo_giap"
	add_to_group("quai")
	super._ready()
	hp_max = 30.0 + cap * 12.0
	hp = hp_max
	_nghi = randf_range(0.5, 3.0)


func _process(dt: float) -> void:
	if chet:
		return
	if dang_ban():
		if trang_thai == "attack" and not _da_trung and hinh.frame >= bo.khung_trung("attack"):
			_da_trung = true
			if _nguoi_song() and Iso.kc_dat(position, nguoi.position) <= tam_danh + 12.0:
				nguoi.nhan_sat_thuong(randf_range(sat_thuong.x, sat_thuong.y), self)
		return
	var thay := _nguoi_song() and not the_gioi.an_toan(nguoi.position) \
		and Iso.kc_dat(position, nguoi.position) < tam_thay
	if Iso.kc_dat(position, nha) > day_xich:
		_ve_nha = true
	if _ve_nha:
		if duong.is_empty():
			duong = the_gioi.tim_duong(position, nha)
		if buoc_di(dt * 1.4, "walk"):
			_ve_nha = false
			hp = hp_max
		return
	if thay:
		var kc := Iso.kc_dat(position, nguoi.position)
		if kc <= tam_danh:
			duong.clear()
			_quay(Iso.huong(nguoi.position - position, huong))
			_da_trung = false
			_vao("attack", true)
			return
		_tim_lai -= dt
		if _tim_lai <= 0.0 or duong.is_empty():
			_tim_lai = 0.4
			duong = the_gioi.tim_duong(position, nguoi.position)
		buoc_di(dt * 1.25, "walk")
		return
	if not duong.is_empty():
		buoc_di(dt * 0.6, "walk")
		return
	if trang_thai != "idle":
		_vao("idle")
	_nghi -= dt
	if _nghi <= 0.0:
		_nghi = randf_range(2.0, 5.0)
		var dich := nha + Iso.nen(Vector2.from_angle(randf() * TAU) * randf_range(20, 60))
		if the_gioi.di_duoc(dich):
			duong = the_gioi.tim_duong(position, dich)


## Quái thì bị khựng khi trúng đòn, kể cả lúc đang đánh.
func khong_bi_ngat() -> bool:
	return false


func _nguoi_song() -> bool:
	return is_instance_valid(nguoi) and not nguoi.chet
