class_name PetAxie
extends Node2D
## Con Axie đi theo sau lưng nhân vật. Không máu, không đánh, không bị nhắm — nó là bản sắc và là
## hệ phòng thủ, không phải một thân thứ hai trong trận.
##
## Đứng NGANG HÔNG chủ, về phía sau theo chiều ngang của hướng đi; có độ trễ; xa quá (dịch chuyển,
## vào nhà) thì bám tức thì. Rig Axie nhìn ngang ⇒ chỉ lật gương trái/phải theo hướng đang đi.
##
## ⚠ ĐỪNG ĐẶT "THẲNG SAU LƯNG". Đã thử: lùi sau lưng + dạt bên thì ở bốn hướng chéo hai phần triệt
## tiêu nhau theo chiều ngang, con vật (cao 28 px) đứng đúng sau thân chủ (56 px) và chỉ lòi ra cái
## đuôi. Ngang hông thì không hướng nào che được nó.

const BEN := 32.0               # cách chủ theo chiều ngang màn hình (px)
const LEN := 4.0                # nhích lên một chút: đứng hơi sau, chân chủ vẽ đè lên mép con vật
const XA_QUA := 320.0           # xa hơn chừng này thì nhảy tới luôn
const TOC_TOI_DA := 230.0       # px/giây trên đất

var chu: NhanVat
var id := Axie.MAC_DINH
var hinh: AnimatedSprite2D
var bong: Sprite2D
var _phan_ung := false          # đang diễn gồng/giật — đừng đè bằng thở/chạy
var _ben := -1.0                # −1: bên trái chủ · +1: bên phải. Đi thẳng lên/xuống thì giữ bên cũ


func _ready() -> void:
	bong = Sprite2D.new()
	bong.texture = load("res://assets/sprites/bong.png")
	bong.scale = Vector2(0.7, 0.7)
	add_child(bong)
	hinh = AnimatedSprite2D.new()
	add_child(hinh)
	hinh.animation_finished.connect(func():
		_phan_ung = false
		hinh.play("idle"))
	doi(id)


func doi(moi: String) -> void:
	id = moi
	if hinh == null:
		return
	var m: Dictionary = Axie.meta()[id]
	hinh.sprite_frames = Axie.frames(id)
	hinh.offset = Vector2(m["o"][0] / 2.0 - m["neo"][0], m["o"][1] / 2.0 - m["neo"][1])
	_phan_ung = false
	hinh.play("idle")


func dich() -> Vector2:
	var fx := Iso.vector_huong(chu.huong).x
	if absf(fx) > 0.1:
		_ben = -signf(fx)                              # đứng phía SAU theo chiều ngang của hướng nhìn
	return chu.position + Vector2(_ben * BEN, -LEN)


func bam_ngay() -> void:
	position = dich()


func giat() -> void:
	_phan_ung = true
	hinh.play("hit")


func gong() -> void:
	_phan_ung = true
	hinh.play("buff")


func _process(dt: float) -> void:
	if chu == null:
		return
	var d := dich()
	var g := Iso.mo_nen(d - position)
	var kc := g.length()
	if kc > XA_QUA:
		position = d
		return
	var buoc := minf(kc, minf(TOC_TOI_DA, kc * 4.0) * dt)
	var v := 0.0
	if kc > 3.0:
		position += Iso.nen(g / kc * buoc)
		v = buoc / dt
	if absf(g.x) > 2.0 and v > 0.0:
		hinh.flip_h = g.x < 0.0                    # tranh gốc quay mặt sang PHẢI
	elif v == 0.0:
		hinh.flip_h = chu.position.x < position.x
	if _phan_ung:
		return
	if v > 20.0:
		if hinh.animation != "run":
			hinh.play("run")
		hinh.speed_scale = clampf(v / 110.0, 0.6, 1.6)
	elif hinh.animation != "idle":
		hinh.play("idle")
		hinh.speed_scale = 1.0
