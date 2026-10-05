class_name Radar
extends Control
## Bản đồ nhỏ góc phải trên — như bản web. Vẽ CHÍNH lưới ô của thế giới đang đứng theo phép chiếu
## isometric (mỗi ô 2×1 điểm), nên nó cùng hướng với màn hình: đi xuống-phải trên màn là đi
## xuống-phải trên radar. Bấm lên radar là đi tới chỗ đó.
##
## Chấm: trắng = mình · cam = Axie đi theo · đỏ = quái · vàng = NPC có việc (tiệm, kho) · xanh = dân ·
## vàng đậm viền = cửa nhà vào được.

signal bam_di(p: Vector2)

const MAU := {
	"co1": Color8(70, 112, 56), "co2": Color8(66, 106, 52), "co3": Color8(74, 116, 58), "co4": Color8(62, 100, 50),
	"dat": Color8(120, 92, 62), "da_lat": Color8(112, 110, 116), "nuoc": Color8(44, 86, 150),
	"duong": Color8(150, 132, 104), "cau": Color8(130, 90, 54), "cat": Color8(184, 166, 118),
	"san_go": Color8(128, 88, 52), "tham": Color8(170, 40, 40),
}

var nv: NhanVat
var pet: PetAxie
var _tg: TheGioi
var _anh: ImageTexture
var _goc := Vector2.ZERO          # độ dời của ô (0,0) trong ảnh radar
var _k := 1.0                     # phóng: map ngoài trời 1 (radar là một ô cửa sổ trượt theo người),
                                  # phòng trong nhà nhỏ thì phóng tới 4 — không thì cả phòng chỉ là một chấm


func _ready() -> void:
	clip_contents = true
	mouse_filter = Control.MOUSE_FILTER_STOP


## Ô → điểm trên radar ở tỉ lệ đang vẽ (chưa trừ khung nhìn).
func _o_anh(c: Vector2) -> Vector2:
	return (Vector2(c.x - c.y, (c.x + c.y) * 0.5) + _goc) * _k


func _dung_anh() -> void:
	_tg = nv.the_gioi
	var co := _tg.CO
	var w := co.x + co.y + 2
	var h := (co.x + co.y) / 2 + 2
	_goc = Vector2(co.y + 1, 1)
	_k = clampf(floorf(80.0 / (co.x + co.y)), 1.0, 4.0)
	var im := Image.create(w, h, false, Image.FORMAT_RGBA8)
	im.fill(Color(0, 0, 0, 0))
	for y in co.y:
		for x in co.x:
			var c := Vector2i(x, y)
			var l := _tg.loai_o(c)
			if l == "":
				continue
			var m: Color = MAU.get(l, Color8(90, 90, 90))
			if _tg.dac.has(c) and l != "nuoc":
				m = m.darkened(0.55)                      # nhà, tường, cây: tối hẳn — đọc ra vật cản
			var p := Vector2(x - y, (x + y) * 0.5) + _goc
			im.set_pixel(int(p.x), int(p.y), m)
			im.set_pixel(int(p.x) + 1, int(p.y), m)
	_anh = ImageTexture.create_from_image(im)


## Điểm màn hình (thế giới) → điểm trên radar, theo khung nhìn đang canh giữa người chơi.
func _ra_radar(p_the_gioi: Vector2) -> Vector2:
	var c := Vector2(_tg.o_cua(p_the_gioi))
	var tam := _o_anh(Vector2(_tg.o_cua(nv.position)))
	return _o_anh(c) - tam + size / 2.0


func _process(_dt: float) -> void:
	if nv == null:
		return
	if nv.the_gioi != _tg:
		_dung_anh()
	queue_redraw()


func _draw() -> void:
	if _anh == null:
		return
	draw_rect(Rect2(Vector2.ZERO, size), Color(0.04, 0.04, 0.05))
	var tam := _o_anh(Vector2(_tg.o_cua(nv.position)))
	draw_texture_rect(_anh, Rect2((size / 2.0 - tam).floor(), _anh.get_size() * _k), false)
	for cu in _tg.cua:
		var p := _ra_radar(_tg.tam_o(cu["o_vao"]))
		draw_rect(Rect2(p - Vector2(2, 2), Vector2(4, 4)), Color(0.1, 0.07, 0.02))
		draw_rect(Rect2(p - Vector2(1, 1), Vector2(3, 3)), Color(1, 0.8, 0.25))
	for q: Quai in get_tree().get_nodes_in_group("quai"):
		if q.the_gioi == _tg and not q.chet:
			draw_rect(Rect2(_ra_radar(q.position).floor(), Vector2(2, 2)), Color(0.95, 0.25, 0.2))
	for n: Npc in get_tree().get_nodes_in_group("npc"):
		if n.the_gioi == _tg:
			var co_viec: bool = NpcDuLieu.VAI.get(n.vai, {}).get("nut", "") != ""
			draw_rect(Rect2(_ra_radar(n.position).floor(), Vector2(2, 2)), Color(1, 0.9, 0.3) if co_viec else Color(0.55, 0.95, 0.6))
	if pet:
		draw_rect(Rect2(_ra_radar(pet.position).floor(), Vector2(2, 2)), Color(1, 0.6, 0.15))
	var m := (size / 2.0).floor()
	draw_rect(Rect2(m - Vector2(2, 2), Vector2(5, 5)), Color(0.05, 0.05, 0.06))
	draw_rect(Rect2(m - Vector2(1, 1), Vector2(3, 3)), Color(1, 1, 1))
	var h := Iso.vector_huong(nv.huong)                   # vạch hướng nhìn
	draw_line(m + Vector2(0.5, 0.5), m + Vector2(0.5, 0.5) + Vector2(h.x, h.y * 2.0).normalized() * 5.0, Color(1, 1, 1), 1.0)


func _gui_input(e: InputEvent) -> void:
	if e is InputEventMouseButton and e.pressed and e.button_index == MOUSE_BUTTON_LEFT:
		var tam := _o_anh(Vector2(_tg.o_cua(nv.position)))
		# mỗi ô là một khối 2×1 điểm tính từ góc trên-trái ⇒ trừ TÂM khối (1; 0,5) trước khi đổi ngược,
		# không thì bấm giữa khối lại ra ô bên cạnh
		var a: Vector2 = (e.position - size / 2.0 + tam) / _k - _goc - Vector2(1.0, 0.5)
		var c := Vector2i(roundi(a.y + a.x / 2.0), roundi(a.y - a.x / 2.0))
		bam_di.emit(_tg.tam_o(c))
		accept_event()
