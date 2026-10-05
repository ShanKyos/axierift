extends Node2D
## Cảnh chính M0: một map, một Dark Knight, một đàn Bọ Giáp. Chơi một mình — mạng là mốc sau.
##
## Điều khiển kiểu MU: bấm chuột trái vào đất để đi (giữ chuột thì đi theo con trỏ), bấm vào quái
## để đánh. Đồ rơi nằm dưới đất, đi qua là nhặt.

const SO_QUAI := 14
const HOI_QUAI := 8.0

var the_gioi: TheGioi
var nv: NhanVat
var hud: Hud
var cam: Camera2D
var _giu_chuot := false
var _nhip_giu := 0.0
var _cho_hoi := []           # [thời điểm, vị trí nhà]


func _ready() -> void:
	the_gioi = TheGioi.new()
	the_gioi.name = "TheGioi"
	add_child(the_gioi)
	nv = NhanVat.new()
	nv.name = "NhanVat"
	nv.the_gioi = the_gioi
	nv.position = the_gioi.tam_o(Vector2i(24, 24))
	the_gioi.thuc_the.add_child(nv)
	nv.da_chet.connect(_nv_chet)
	cam = Camera2D.new()
	var gh := the_gioi.gioi_han_man()
	cam.limit_left = int(gh.position.x)
	cam.limit_top = int(gh.position.y)
	cam.limit_right = int(gh.end.x)
	cam.limit_bottom = int(gh.end.y)
	nv.add_child(cam)
	cam.make_current()
	var lop := CanvasLayer.new()
	add_child(lop)
	hud = Hud.new()
	hud.nv = nv
	lop.add_child(hud)
	var r := RandomNumberGenerator.new()
	r.seed = 7
	var n := 0
	while n < SO_QUAI:
		var c := Vector2i(r.randi_range(4, 44), r.randi_range(4, 44))
		var p := the_gioi.tam_o(c)
		if not the_gioi.di_duoc(p) or the_gioi.vung_an_toan.grow(4).has_point(c):
			continue
		_sinh_quai(p, 1 + n % 3)
		n += 1


func _sinh_quai(p: Vector2, cap: int) -> void:
	var q := Quai.new()
	q.the_gioi = the_gioi
	q.nguoi = nv
	q.cap = cap
	q.position = p
	q.nha = p
	q.exp_thuong = 10 + cap * 6
	q.sat_thuong = Vector2(2 + cap, 4 + cap * 2)
	q.da_chet.connect(_quai_chet)
	the_gioi.thuc_the.add_child(q)


func _quai_chet(q: Quai) -> void:
	nv.nhan_exp(q.exp_thuong)
	if randf() < 0.7:
		var d := RoiDo.new()
		d.so_luong = randi_range(4, 10) * q.cap
		d.position = q.position
		the_gioi.thuc_the.add_child(d)
	_cho_hoi.append([Time.get_ticks_msec() / 1000.0 + HOI_QUAI, q.nha, q.cap])
	var t := create_tween()
	t.tween_interval(1.5)
	t.tween_property(q, "modulate:a", 0.0, 0.6)
	t.tween_callback(q.queue_free)


func _nv_chet(_ai) -> void:
	await get_tree().create_timer(3.0).timeout
	nv.hoi_sinh(the_gioi.tam_o(Vector2i(24, 24)))


func _process(dt: float) -> void:
	var bay_gio := Time.get_ticks_msec() / 1000.0
	for i in range(_cho_hoi.size() - 1, -1, -1):
		if bay_gio >= _cho_hoi[i][0]:
			_sinh_quai(_cho_hoi[i][1], _cho_hoi[i][2])
			_cho_hoi.remove_at(i)
	if _giu_chuot:
		_nhip_giu -= dt
		if _nhip_giu <= 0.0:
			_nhip_giu = 0.15
			_bam(get_global_mouse_position(), false)


func _unhandled_input(e: InputEvent) -> void:
	if e is InputEventMouseButton and e.button_index == MOUSE_BUTTON_LEFT:
		_giu_chuot = e.pressed
		if e.pressed:
			_bam(get_global_mouse_position(), true)


## Một cú bấm: trúng quái thì đánh, không thì đi tới đó.
func _bam(p: Vector2, chon_quai: bool) -> void:
	if chon_quai:
		var gan: Quai = null
		var tot := 20.0
		for q: Quai in get_tree().get_nodes_in_group("quai"):
			if q.chet:
				continue
			var kc: float = (q.position + Vector2(0, -12)).distance_to(p)
			if kc < tot:
				tot = kc
				gan = q
		if gan:
			nv.tan_cong(gan)
			return
	if nv.muc_tieu and not chon_quai:
		return
	nv.di_toi(p)
