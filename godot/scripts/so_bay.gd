class_name SoBay
extends Label
## Chữ bay: số sát thương, lên cấp, nhặt đồ. Bay lên rồi mờ dần trong 0,8 giây.

var _t := 0.0


static func tao(cha: Node, p: Vector2, chu: String, mau: Color) -> void:
	var s := SoBay.new()
	s.text = chu
	s.add_theme_color_override("font_color", mau)
	s.add_theme_color_override("font_outline_color", Color(0.08, 0.06, 0.1))
	s.add_theme_constant_override("outline_size", 2)
	s.add_theme_font_size_override("font_size", 8)
	s.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	s.size = Vector2(80, 10)
	s.position = p - Vector2(40, 0)
	s.z_index = 50
	s.z_as_relative = false
	cha.add_child(s)


func _process(dt: float) -> void:
	_t += dt
	position.y -= 22.0 * dt
	modulate.a = clampf(1.0 - (_t - 0.4) / 0.4, 0.0, 1.0)
	if _t >= 0.8:
		queue_free()
