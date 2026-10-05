class_name RoiDo
extends Node2D
## Đồ rơi NẰM DƯỚI ĐẤT (không nhảy thẳng vào túi): nảy một vòng cung rồi nằm yên 45 giây.

var so_luong := 10
var _t := 0.0
var _goc := Vector2.ZERO
var _toi := Vector2.ZERO


func _ready() -> void:
	add_to_group("roi_do")
	var s := Sprite2D.new()
	s.texture = load("res://assets/sprites/xu.png")
	s.offset = Vector2(0, -3)
	add_child(s)
	_goc = position
	_toi = position + Iso.nen(Vector2.from_angle(randf() * TAU) * randf_range(8, 18))


func _process(dt: float) -> void:
	_t += dt
	if _t < 0.35:
		var k := _t / 0.35
		position = _goc.lerp(_toi, k) + Vector2(0, -sin(k * PI) * 14.0)
	elif _t > 45.0:
		queue_free()
