class_name TheGioi
extends Node2D
## Một bản đồ: nền ô isometric, vật cản, tìm đường, và lớp thực thể xếp theo chiều sâu.
##
## Bố cục đọc từ `BanDoArdhaven` (tệp dữ liệu, sửa số là map đổi). Mọi ngẫu nhiên đều theo HẠT
## CỐ ĐỊNH — vào lại map là đúng map cũ, người chơi học thuộc được địa hình.

const O_DAT := Vector2i(64, 32)
const DAI := 16                       # bề ngang một dải khi cắt công trình to (px)
const BD := preload("res://scripts/ban_do_ardhaven.gd")

const CO := BD.CO
var nen: TileMapLayer
var thuc_the: Node2D                  # cha của mọi thứ đứng trên đất, tự xếp theo y
var astar := AStarGrid2D.new()
var dac := {}                         # ô bị chặn: Vector2i → true
var vung_an_toan: Rect2i
var tam_thanh: Vector2i
var _loai: Array = []
var _o_loai := {}                     # Vector2i → tên loại ô
var _bo_thanh: SpriteBo


func _ready() -> void:
	vung_an_toan = BD.THANH
	tam_thanh = BD.THANH.position + BD.THANH.size / 2
	_bo_thanh = SpriteBo.tai("thanh")
	_dung_lop()
	_ve_dia_hinh()
	_dung_thanh()
	_rai_rung()
	_ghi_nen()
	_dung_astar()


func _dung_lop() -> void:
	var info: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/tiles/o_dat.json"))
	_loai = info["loai"]
	var ts := TileSet.new()
	ts.tile_shape = TileSet.TILE_SHAPE_ISOMETRIC
	ts.tile_layout = TileSet.TILE_LAYOUT_DIAMOND_DOWN
	ts.tile_size = O_DAT
	var src := TileSetAtlasSource.new()
	src.texture = load("res://assets/tiles/o_dat.png")
	src.texture_region_size = O_DAT
	for i in _loai.size():
		src.create_tile(Vector2i(i, 0))
	ts.add_source(src, 0)
	nen = TileMapLayer.new()
	nen.tile_set = ts
	nen.name = "Nen"
	add_child(nen)
	thuc_the = Node2D.new()
	thuc_the.name = "ThucThe"
	thuc_the.y_sort_enabled = true
	add_child(thuc_the)


# ── mặt đất: cỏ theo nhiễu, nước, bờ cát, đường, cầu ─────────────────────────
func _ve_dia_hinh() -> void:
	var on := FastNoiseLite.new()
	on.seed = BD.HAT
	on.frequency = 0.07
	for y in CO.y:
		for x in CO.x:
			var n := on.get_noise_2d(x, y)
			var loai := "co1"
			if n > 0.25:
				loai = "co2"
			elif n < -0.3:
				loai = "co4"
			elif absf(n) < 0.03:
				loai = "co3"
			_o_loai[Vector2i(x, y)] = loai
	# nước: sông (chuỗi đoạn) + hồ
	for i in BD.SONG.size() - 1:
		_ve_doan_nuoc(BD.SONG[i], BD.SONG[i + 1], BD.SONG_RONG)
	for h in BD.HO:
		_ve_doan_nuoc(h[0], h[0], h[1])
	# bờ cát: ô cỏ kề nước
	var cat := []
	for c in _o_loai:
		if _o_loai[c] != "nuoc":
			for d in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
				if _o_loai.get(c + d) == "nuoc":
					cat.append(c)
					break
	for c in cat:
		_o_loai[c] = "cat"
	# đường từ bốn cổng ra mép map; gặp nước thì thành cầu
	for cong in BD.CONG:
		var o: Array = _o_cong(cong)
		var huong: Vector2i = _huong_ra(cong)
		for c in o:
			var p: Vector2i = c + huong
			while p.x >= 0 and p.y >= 0 and p.x < CO.x and p.y < CO.y:
				_o_loai[p] = "cau" if _o_loai[p] == "nuoc" or _o_loai[p] == "cau" else "duong"
				p += huong
	# trong thành: đá lát
	for y in range(BD.THANH.position.y, BD.THANH.end.y):
		for x in range(BD.THANH.position.x, BD.THANH.end.x):
			_o_loai[Vector2i(x, y)] = "da_lat"
	for c in _o_loai:
		if _o_loai[c] == "nuoc":
			dac[c] = true
		if c.x == 0 or c.y == 0 or c.x == CO.x - 1 or c.y == CO.y - 1:
			dac[c] = true                               # mép map: không ra được


func _ve_doan_nuoc(a: Vector2i, b: Vector2i, r: float) -> void:
	var dai := maxi(1, int(Vector2(a).distance_to(Vector2(b))))
	for i in dai + 1:
		var p := Vector2(a).lerp(Vector2(b), float(i) / dai)
		for y in range(int(p.y - r) - 1, int(p.y + r) + 2):
			for x in range(int(p.x - r) - 1, int(p.x + r) + 2):
				var c := Vector2i(x, y)
				if _o_loai.has(c) and Vector2(c).distance_to(p) <= r:
					_o_loai[c] = "nuoc"


func _ghi_nen() -> void:
	for c in _o_loai:
		nen.set_cell(c, 0, Vector2i(_loai.find(_o_loai[c]), 0))


# ── thành: tường, tháp, cổng, công trình, NPC ───────────────────────────────
func _o_cong(cong: String) -> Array:
	var r := BD.THANH
	var gx := r.position.x + r.size.x / 2 - 1
	var gy := r.position.y + r.size.y / 2 - 1
	match cong:
		"x+": return [Vector2i(r.end.x - 1, gy), Vector2i(r.end.x - 1, gy + 1)]
		"x-": return [Vector2i(r.position.x, gy), Vector2i(r.position.x, gy + 1)]
		"y+": return [Vector2i(gx, r.end.y - 1), Vector2i(gx + 1, r.end.y - 1)]
		_: return [Vector2i(gx, r.position.y), Vector2i(gx + 1, r.position.y)]


func _huong_ra(cong: String) -> Vector2i:
	return {"x+": Vector2i(1, 0), "x-": Vector2i(-1, 0), "y+": Vector2i(0, 1), "y-": Vector2i(0, -1)}[cong]


func _dung_thanh() -> void:
	var r := BD.THANH
	var o_cong := {}
	for cong in BD.CONG:
		for c in _o_cong(cong):
			o_cong[c] = cong
	for y in range(r.position.y, r.end.y):
		for x in range(r.position.x, r.end.x):
			var c := Vector2i(x, y)
			var vien_x := x == r.position.x or x == r.end.x - 1
			var vien_y := y == r.position.y or y == r.end.y - 1
			if not (vien_x or vien_y) or o_cong.has(c):
				continue
			if vien_x and vien_y:
				_dat("thap", c, Vector2i.ONE, 0)
			else:
				_dat("tuong", c, Vector2i.ONE, 1 if vien_x else 0)
	# vòm cổng: phủ đúng 2 ô cổng, KHÔNG chặn chân
	for cong in BD.CONG:
		var o: Array = _o_cong(cong)
		var dai_x: bool = o[0].y == o[1].y
		_dat("cong", o[0], Vector2i(2, 1) if dai_x else Vector2i(1, 2), 0 if dai_x else 1, false)
	for ct in BD.CONG_TRINH:
		var ten: String = ct[0]
		var co := {"nha_a": Vector2i(3, 3), "nha_b": Vector2i(2, 3), "dai_phun": Vector2i(2, 2), "den": Vector2i.ONE}[ten] as Vector2i
		if ct[2] % 2 == 1:
			co = Vector2i(co.y, co.x)
		_dat(ten, ct[1], co, ct[2])
	for npc in BD.NPC:
		_dat_npc(npc[0], npc[1])


## Đặt một công trình chiếm khối ô [goc, goc+co). Công trình to được CẮT DẢI DỌC, mỗi dải xếp lớp
## theo mép trước của chân đế ngay dưới nó — nhân vật đứng cạnh hông nhà mới che/bị che đúng.
func _dat(ten: String, goc: Vector2i, co: Vector2i, xoay: int, chan := true) -> void:
	var cuoi := goc + co - Vector2i.ONE
	var tam := (nen.map_to_local(goc) + nen.map_to_local(cuoi)) / 2.0
	var tex: Texture2D = load("res://assets/sprites/thanh/%s.png" % ten)
	var o := _bo_thanh.o
	var neo := _bo_thanh.neo
	var trai := nen.map_to_local(Vector2i(goc.x, cuoi.y)) + Vector2(-32, 0)
	var phai := nen.map_to_local(Vector2i(cuoi.x, goc.y)) + Vector2(32, 0)
	var day := nen.map_to_local(cuoi) + Vector2(0, 16)
	var nhom := Node2D.new()
	nhom.name = "%s_%d_%d" % [ten, goc.x, goc.y]
	thuc_the.add_child(nhom)
	nhom.y_sort_enabled = true
	for i in o / DAI:
		var x_man := tam.x - neo.x + i * DAI + DAI / 2.0
		var y_sau := _mep_truoc(x_man, trai, day, phai)
		var s := Sprite2D.new()
		var at := AtlasTexture.new()
		at.atlas = tex
		at.region = Rect2(i * DAI, xoay * o, DAI, o)
		s.texture = at
		s.position = Vector2(x_man, y_sau)
		s.offset = Vector2(0, tam.y - neo.y + o / 2.0 - y_sau)
		nhom.add_child(s)
	if chan:
		for y in range(goc.y, cuoi.y + 1):
			for x in range(goc.x, cuoi.x + 1):
				dac[Vector2i(x, y)] = true


func _mep_truoc(x: float, trai: Vector2, day: Vector2, phai: Vector2) -> float:
	if x <= trai.x:
		return trai.y
	if x >= phai.x:
		return phai.y
	if x <= day.x:
		return lerpf(trai.y, day.y, (x - trai.x) / maxf(1.0, day.x - trai.x))
	return lerpf(day.y, phai.y, (x - day.x) / maxf(1.0, phai.x - day.x))


func _dat_npc(ten: String, c: Vector2i) -> void:
	var t := ThanThe.new()
	t.ten_bo = "hiep_si"
	t.position = nen.map_to_local(c)
	t.modulate = Color(0.75, 0.9, 1.2)
	t.name = "NPC_" + ten
	thuc_the.add_child(t)
	var l := Label.new()
	l.text = ten
	l.add_theme_font_size_override("font_size", 8)
	l.add_theme_color_override("font_color", Color(0.75, 1, 0.75))
	l.add_theme_color_override("font_outline_color", Color(0.05, 0.08, 0.05))
	l.add_theme_constant_override("outline_size", 2)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	l.size = Vector2(90, 10)
	l.position = Vector2(-45, -70)
	t.add_child(l)
	dac[c] = true


# ── rừng & đá ngoài thành ───────────────────────────────────────────────────
func _rai_rung() -> void:
	var on := FastNoiseLite.new()
	on.seed = BD.HAT + 1
	on.frequency = 0.06
	var r := RandomNumberGenerator.new()
	r.seed = BD.HAT
	var cay: Texture2D = load("res://assets/sprites/canh/cay.png")
	var da: Texture2D = load("res://assets/sprites/canh/da.png")
	var lech := Vector2(48, 48) - Vector2(48, 88)
	var gan_thanh := BD.THANH.grow(4)
	for y in range(2, CO.y - 2):
		for x in range(2, CO.x - 2):
			var c := Vector2i(x, y)
			if dac.has(c) or gan_thanh.has_point(c):
				continue
			var lo: String = _o_loai[c]
			if lo == "duong" or lo == "cau" or lo == "cat" or _gan_duong(c):
				continue
			var n := on.get_noise_2d(x, y)
			var mat := 0.5 if n > BD.NGUONG_RUNG else 0.025      # trong rừng dày, ngoài rừng thưa
			if r.randf() >= mat:
				continue
			var la_cay := r.randf() < (0.92 if n > BD.NGUONG_RUNG else 0.55)
			var s := Sprite2D.new()
			var at := AtlasTexture.new()
			at.atlas = cay if la_cay else da
			at.region = Rect2(0, r.randi_range(0, 7) * 96, 96, 96)
			s.texture = at
			s.offset = lech
			s.position = nen.map_to_local(c)
			thuc_the.add_child(s)
			dac[c] = true


func _gan_duong(c: Vector2i) -> bool:
	for d in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
		var l = _o_loai.get(c + d)
		if l == "duong" or l == "cau":
			return true
	return false


func _dung_astar() -> void:
	astar.region = Rect2i(Vector2i.ZERO, CO)
	astar.cell_size = Vector2.ONE
	astar.diagonal_mode = AStarGrid2D.DIAGONAL_MODE_ONLY_IF_NO_OBSTACLES
	astar.update()
	for c in dac:
		astar.set_point_solid(c, true)


func loai_o(c: Vector2i) -> String:
	return _o_loai.get(c, "")


func o_cua(p: Vector2) -> Vector2i:
	return nen.local_to_map(p)


func tam_o(c: Vector2i) -> Vector2:
	return nen.map_to_local(c)


func di_duoc(p: Vector2) -> bool:
	var c := o_cua(p)
	return astar.is_in_boundsv(c) and not astar.is_point_solid(c)


func an_toan(p: Vector2) -> bool:
	return vung_an_toan.has_point(o_cua(p))


## Khoảng cách (ô) từ tâm thành — vùng quái đọc số này.
func kc_thanh(c: Vector2i) -> float:
	return Vector2(c).distance_to(Vector2(tam_thanh))


## Đường đi (toạ độ màn hình) từ a tới b. Điểm cuối là đúng chỗ bấm nếu chỗ đó đi được.
func tim_duong(a: Vector2, b: Vector2) -> PackedVector2Array:
	var ca := o_cua(a)
	var cb := o_cua(b)
	var out := PackedVector2Array()
	if not astar.is_in_boundsv(ca) or not astar.is_in_boundsv(cb):
		return out
	if astar.is_point_solid(cb):
		cb = _o_trong_gan(cb)
		if cb == Vector2i(-1, -1):
			return out
		b = tam_o(cb)
	var ids := astar.get_id_path(ca, cb, true)
	for i in range(1, ids.size() - 1):
		out.append(tam_o(ids[i]))
	out.append(b)
	return out


func _o_trong_gan(c: Vector2i) -> Vector2i:
	for r in range(1, 4):
		for dy in range(-r, r + 1):
			for dx in range(-r, r + 1):
				var n := c + Vector2i(dx, dy)
				if astar.is_in_boundsv(n) and not astar.is_point_solid(n):
					return n
	return Vector2i(-1, -1)


func gioi_han_man() -> Rect2:
	var a := tam_o(Vector2i(0, 0))
	var b := tam_o(Vector2i(CO.x - 1, CO.y - 1))
	var t := tam_o(Vector2i(CO.x - 1, 0))
	var l := tam_o(Vector2i(0, CO.y - 1))
	return Rect2(Vector2(l.x, a.y), Vector2(t.x - l.x, b.y - a.y))
