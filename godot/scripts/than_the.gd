class_name ThanThe
extends Node2D
## Thứ gì đứng trên đất và có sprite 8 hướng: nhân vật, quái. Chung luật chuyển động.
##
## ⚠ LUẬT CHÂN KHÔNG TRƯỢT: khung đi/chạy chạy theo QUÃNG ĐƯỜNG trên đất, không theo đồng hồ.
## `pha` cộng đúng (quãng vừa đi ÷ sải một chu kỳ) — đứng lại là chân đứng lại, chạy chậm vì vướng
## là bước chậm theo. Chia nhịp theo thời gian thì hễ tốc độ lệch sải một chút là bàn chân trượt đất.

signal da_chet(ai)

@export var ten_bo := "hiep_si"
var bo: SpriteBo
var hinh: AnimatedSprite2D
var bong: Sprite2D
var the_gioi: TheGioi

var huong := 0
var trang_thai := "idle"
var pha := 0.0
var duong := PackedVector2Array()
var hp := 100.0
var hp_max := 100.0
var chet := false
var _anim_xong := true


func _ready() -> void:
	bo = SpriteBo.tai(ten_bo)
	bong = Sprite2D.new()
	bong.texture = load("res://assets/sprites/bong.png")
	bong.position = Vector2(0, 1)
	add_child(bong)
	hinh = AnimatedSprite2D.new()
	hinh.sprite_frames = bo.frames
	hinh.offset = bo.lech_ve()
	hinh.scale = Vector2.ONE * bo.ty
	hinh.animation_finished.connect(func(): _anim_xong = true)
	add_child(hinh)
	_vao("idle")


## Đổi trạng thái hoạt ảnh. Đi/chạy thì tự đặt khung theo `pha`, không cho hoạt ảnh tự chạy.
func _vao(tt: String, ep := false) -> void:
	if not bo.co(tt):
		return
	if tt == trang_thai and not ep and hinh.animation == "%s_%d" % [tt, huong]:
		return
	trang_thai = tt
	_anim_xong = false
	var ten := "%s_%d" % [tt, huong]
	if tt == "walk" or tt == "run":
		hinh.animation = ten
		hinh.pause()
		_dat_khung_di()
	else:
		hinh.play(ten)


func _quay(i: int) -> void:
	if i == huong:
		return
	huong = i
	var f := hinh.frame
	var ten := "%s_%d" % [trang_thai, huong]
	if trang_thai == "walk" or trang_thai == "run":
		hinh.animation = ten
		hinh.pause()
		_dat_khung_di()
	else:
		var p := hinh.frame_progress
		hinh.play(ten)
		hinh.set_frame_and_progress(f, p)


func _dat_khung_di() -> void:
	var n := bo.so_khung(trang_thai)
	hinh.frame = int(floor(pha * n)) % n


## Đi theo `duong` một nhịp. Trả true khi đã tới điểm cuối.
func buoc_di(dt: float, tt: String) -> bool:
	if duong.is_empty():
		return true
	var con_lai := bo.toc_do_px(tt) * dt                # quãng còn được đi trên MẶT ĐẤT nhịp này
	var da_di := 0.0
	while con_lai > 0.0 and not duong.is_empty():
		var dich := duong[0]
		var g := Iso.mo_nen(dich - position)
		var kc := g.length()
		if kc < 0.001:
			duong.remove_at(0)
			continue
		_quay(Iso.huong(dich - position, huong))
		var buoc := minf(kc, con_lai)
		position += Iso.nen(g / kc * buoc)
		con_lai -= buoc
		da_di += buoc
		if buoc >= kc:
			duong.remove_at(0)
	if da_di > 0.0:
		_vao(tt)
		pha = fposmod(pha + da_di / bo.sai_px(tt), 1.0)
		_dat_khung_di()
	return duong.is_empty()


func nhan_sat_thuong(n: float, _tu: Node2D) -> void:
	if chet:
		return
	hp = maxf(0.0, hp - n)
	if the_gioi:
		var mau := Color(1, 0.35, 0.3) if self is NhanVat else Color(1, 0.9, 0.4)
		SoBay.tao(the_gioi.thuc_the, global_position + Vector2(0, bo.dinh()), str(int(round(n))), mau)
	if hp <= 0.0:
		chet = true
		duong.clear()
		_vao("death", true)
		da_chet.emit(self)
	elif not khong_bi_ngat():
		_vao("hit", true)


## Đang ra đòn thì trúng đòn KHÔNG ngắt nhát chém (như MU) — chỉ hiện số. Không có luật này thì
## một con quái đánh nhanh hơn nhịp chém là người chơi không bao giờ chém trúng được nó.
func khong_bi_ngat() -> bool:
	return trang_thai == "attack" and not _anim_xong


func dang_ban() -> bool:
	## Đang diễn một hoạt ảnh không được ngắt (đánh, trúng đòn, chết).
	return (trang_thai == "attack" or trang_thai == "hit") and not _anim_xong
