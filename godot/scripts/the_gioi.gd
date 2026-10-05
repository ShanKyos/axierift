class_name TheGioi
extends Node2D
## Một bản đồ: nền ô isometric, vật cản, tìm đường, và lớp thực thể xếp theo chiều sâu.
##
## Bố cục sinh theo HẠT CỐ ĐỊNH — vào lại map là đúng map cũ, người chơi học thuộc được địa hình.

const CO := Vector2i(48, 48)          # số ô (cạnh hình thoi)
const O_DAT := Vector2i(64, 32)
const HAT := 20261005

var nen: TileMapLayer
var thuc_the: Node2D                  # cha của mọi thứ đứng trên đất, tự xếp theo y
var astar := AStarGrid2D.new()
var dac := {}                         # ô bị chặn: Vector2i → true
var vung_an_toan := Rect2i(20, 20, 8, 8)
var _loai: Array = []


func _ready() -> void:
	_dung_nen()
	_rai_canh()
	_dung_astar()


func _dung_nen() -> void:
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

	var on := FastNoiseLite.new()
	on.seed = HAT
	on.frequency = 0.09
	var ho := Vector2(12, 34)                          # tâm hồ nước
	for y in CO.y:
		for x in CO.x:
			var c := Vector2i(x, y)
			var loai := "co1"
			var n := on.get_noise_2d(x, y)
			if n > 0.25:
				loai = "co2"
			elif n < -0.3:
				loai = "co4"
			elif abs(n) < 0.03:
				loai = "co3"
			if vung_an_toan.has_point(c):
				loai = "da_lat"
			elif (x == 24 and y > 27) or (y == 24 and x > 27):   # hai lối mòn theo trục ô, rời quảng trường
				loai = "dat"
			if Vector2(x, y).distance_to(ho) < 4.2:
				loai = "nuoc"
				dac[c] = true
			if x == 0 or y == 0 or x == CO.x - 1 or y == CO.y - 1:
				dac[c] = true                           # mép map: không ra được
			nen.set_cell(c, 0, Vector2i(_loai.find(loai), 0))


func _rai_canh() -> void:
	var r := RandomNumberGenerator.new()
	r.seed = HAT
	var cay: Texture2D = load("res://assets/sprites/canh/cay.png")
	var da: Texture2D = load("res://assets/sprites/canh/da.png")
	var lech := Vector2(48, 48) - Vector2(48, 88)
	for i in 120:
		var c := Vector2i(r.randi_range(2, CO.x - 3), r.randi_range(2, CO.y - 3))
		if dac.has(c) or vung_an_toan.grow(2).has_point(c) or loai_o(c) == "dat":
			continue
		var la_cay := r.randf() < 0.65
		var s := Sprite2D.new()
		var at := AtlasTexture.new()
		at.atlas = cay if la_cay else da
		at.region = Rect2(0, r.randi_range(0, 7) * 96, 96, 96)
		s.texture = at
		s.offset = lech
		s.position = nen.map_to_local(c)
		s.name = ("Cay" if la_cay else "Da") + str(i)
		thuc_the.add_child(s)
		dac[c] = true


func _dung_astar() -> void:
	astar.region = Rect2i(Vector2i.ZERO, CO)
	astar.cell_size = Vector2.ONE
	astar.diagonal_mode = AStarGrid2D.DIAGONAL_MODE_ONLY_IF_NO_OBSTACLES
	astar.update()
	for c in dac:
		astar.set_point_solid(c, true)


func loai_o(c: Vector2i) -> String:
	var a := nen.get_cell_atlas_coords(c)
	return "" if a.x < 0 else _loai[a.x]


func o_cua(p: Vector2) -> Vector2i:
	return nen.local_to_map(p)


func tam_o(c: Vector2i) -> Vector2:
	return nen.map_to_local(c)


func di_duoc(p: Vector2) -> bool:
	var c := o_cua(p)
	return astar.is_in_boundsv(c) and not astar.is_point_solid(c)


func an_toan(p: Vector2) -> bool:
	return vung_an_toan.has_point(o_cua(p))


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
	var ids := astar.get_id_path(ca, cb)
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
