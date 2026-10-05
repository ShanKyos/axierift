class_name VongChem
extends Node2D
## Vệt Chém Xoáy: một vòng thép loé ra quanh người rồi tắt trong 0,3 giây. Hình tạm — vẽ bằng
## nét cung cho tới khi có bảng khung hiệu ứng pixel art.

var r := 64.0
var _t := 0.0


static func tao(cha: Node, p: Vector2, ban_kinh: float) -> void:
	var v := VongChem.new()
	v.r = ban_kinh
	v.position = p
	v.z_index = 1
	cha.add_child(v)


func _process(dt: float) -> void:
	_t += dt
	if _t >= 0.3:
		queue_free()
		return
	queue_redraw()


func _draw() -> void:
	var k := _t / 0.3
	var rr := r * (0.55 + 0.45 * k)
	draw_set_transform(Vector2.ZERO, 0.0, Vector2(1.0, 0.5))
	draw_arc(Vector2.ZERO, rr, k * TAU * 1.5, k * TAU * 1.5 + TAU * 0.8, 24, Color(0.85, 0.92, 1.0, 1.0 - k), 2.0)
	draw_arc(Vector2.ZERO, rr - 4, k * TAU * 1.5 + 0.6, k * TAU * 1.5 + TAU * 0.6, 24, Color(1, 1, 1, 0.6 * (1.0 - k)), 1.0)
