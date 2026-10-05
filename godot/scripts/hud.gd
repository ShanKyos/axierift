class_name Hud
extends Control
## HUD kiểu MU: quả cầu máu (trái) và mana (phải) ở đáy, thanh kinh nghiệm giữa, mục tiêu ở đỉnh.
## Vẽ bằng `_draw` cho M0; khung gothic bằng tranh pixel sẽ thay vào ở mốc sau.

var nv: NhanVat


func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE


func _process(_dt: float) -> void:
	queue_redraw()


func _qua_cau(tam: Vector2, r: float, ty: float, mau: Color, mau_toi: Color) -> void:
	draw_circle(tam, r + 2, Color(0.12, 0.10, 0.08))
	draw_circle(tam, r, mau_toi)
	# Phần đầy: tô từng hàng pixel từ đáy lên — mặt chất lỏng phẳng như MU, không phải cung tròn.
	var muc := tam.y + r - ty * 2.0 * r
	for y in range(int(tam.y - r), int(tam.y + r) + 1):
		if y < muc:
			continue
		var dy := y + 0.5 - tam.y
		var w := sqrt(maxf(0.0, r * r - dy * dy))
		draw_line(Vector2(tam.x - w, y + 0.5), Vector2(tam.x + w, y + 0.5), mau, 1.0)
	draw_arc(tam, r + 1, 0, TAU, 32, Color(0.75, 0.6, 0.3), 1.0)


func _draw() -> void:
	if nv == null:
		return
	var w := get_viewport_rect().size.x
	var h := get_viewport_rect().size.y
	draw_rect(Rect2(0, h - 22, w, 22), Color(0.08, 0.07, 0.09, 0.85))
	draw_line(Vector2(0, h - 22), Vector2(w, h - 22), Color(0.6, 0.48, 0.24), 1.0)
	_qua_cau(Vector2(24, h - 21), 17, nv.hp / nv.hp_max, Color(0.78, 0.12, 0.12), Color(0.2, 0.04, 0.05))
	_qua_cau(Vector2(w - 24, h - 21), 17, nv.mp / nv.mp_max, Color(0.18, 0.32, 0.85), Color(0.04, 0.06, 0.2))
	var f := get_theme_default_font()
	draw_string(f, Vector2(6, h - 2), "%d/%d" % [int(nv.hp), int(nv.hp_max)], HORIZONTAL_ALIGNMENT_LEFT, -1, 8, Color(1, 0.85, 0.8))
	draw_string(f, Vector2(w - 70, h - 2), "%d/%d" % [int(nv.mp), int(nv.mp_max)], HORIZONTAL_ALIGNMENT_RIGHT, 64, 8, Color(0.8, 0.88, 1))
	# thanh kinh nghiệm
	var bx := 52.0
	var bw := w - 104.0
	var ty := float(nv.kinh_nghiem) / float(nv.exp_can())
	draw_rect(Rect2(bx, h - 8, bw, 4), Color(0.15, 0.13, 0.1))
	draw_rect(Rect2(bx, h - 8, bw * ty, 4), Color(0.9, 0.75, 0.25))
	draw_string(f, Vector2(bx, h - 11), "Dark Knight  Cấp %d" % nv.cap, HORIZONTAL_ALIGNMENT_LEFT, -1, 8, Color(0.95, 0.9, 0.8))
	draw_string(f, Vector2(bx, h - 11), "%d Lumen" % nv.lumen, HORIZONTAL_ALIGNMENT_RIGHT, bw, 8, Color(1, 0.85, 0.4))
	# mục tiêu
	var q := nv.muc_tieu
	if q and is_instance_valid(q) and not q.chet:
		var tw := 120.0
		var tx := (w - tw) / 2.0
		draw_rect(Rect2(tx - 1, 5, tw + 2, 8), Color(0.1, 0.08, 0.08))
		draw_rect(Rect2(tx, 6, tw * q.hp / q.hp_max, 6), Color(0.75, 0.15, 0.12))
		draw_string(f, Vector2(tx, 22), "%s  Cấp %d" % [q.ten_hien, q.cap], HORIZONTAL_ALIGNMENT_CENTER, tw, 8, Color(1, 0.95, 0.85))
	draw_string(f, Vector2(52, h - 25), "Q ×%d   W ×%d" % [nv.dem_do("binh_mau_nho") + nv.dem_do("binh_mau"),
		nv.dem_do("binh_mana_nho") + nv.dem_do("binh_mana")], HORIZONTAL_ALIGNMENT_LEFT, -1, 8, Color(0.9, 0.85, 0.75))
	if not nv.chieu_biet.is_empty():
		draw_string(f, Vector2(52, h - 25), "Chuột phải: %s (%d mana)" % [VatPham.CHIEU["chem_xoay"]["ten"], VatPham.CHIEU["chem_xoay"]["mp"]],
			HORIZONTAL_ALIGNMENT_RIGHT, w - 104, 8, Color(0.7, 0.85, 1))
	if nv.the_gioi:
		draw_string(f, Vector2(4, 24 if Input.is_key_pressed(KEY_ALT) else 12), nv.the_gioi.ten_map, HORIZONTAL_ALIGNMENT_LEFT, -1, 8, Color(1, 0.86, 0.5))
	if Input.is_key_pressed(KEY_ALT) and nv.the_gioi:
		var c := nv.the_gioi.o_cua(nv.get_global_mouse_position())
		draw_string(f, Vector2(4, 12), "ô (%d, %d)  %s" % [c.x, c.y, nv.the_gioi.loai_o(c)], HORIZONTAL_ALIGNMENT_LEFT, -1, 8, Color(1, 1, 0.6))
	if nv.chet:
		draw_string(f, Vector2(0, h / 2.0), "Ngươi đã gục — hồi sinh ở thành sau 3 giây", HORIZONTAL_ALIGNMENT_CENTER, w, 8, Color(1, 0.7, 0.6))
