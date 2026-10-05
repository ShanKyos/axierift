class_name TheGioi
extends Node2D
## Một bản đồ: nền ô isometric, vật cản, tìm đường, và lớp thực thể xếp theo chiều sâu.
##
## Hai kiểu: NGOÀI TRỜI (bố cục đọc từ `BanDoArdhaven`) và TRONG NHÀ (đặt `nha` = khoá trong
## `NoiThat.NHA` trước khi add_child). Mọi ngẫu nhiên đều theo HẠT CỐ ĐỊNH — vào lại map là đúng
## map cũ, người chơi học thuộc được địa hình.

const O_DAT := Vector2i(64, 32)
const DAI := 16                       # bề ngang một dải khi cắt công trình to (px)
const BD := preload("res://scripts/ban_do_ardhaven.gd")
const NT := preload("res://scripts/noi_that.gd")
## Cỡ chân đế (ô) khi xoay 0. Xoay 1/3 thì đổi rộng ↔ sâu. Không có tên ở đây = 1×1.
const KICH := {"nha_a": Vector2i(3, 3), "nha_b": Vector2i(2, 3), "nha_c": Vector2i(4, 3),
	"thap_phap": Vector2i(2, 2), "dai_phun": Vector2i(2, 2), "quay": Vector2i(2, 1), "sap_cho": Vector2i(2, 1)}
## Mặt có cửa khi xoay 0, theo trục Ô (x+ xuống-phải, y+ xuống-trái).
const MAT_CUA := {"nha_a": Vector2i(0, 1), "nha_c": Vector2i(0, 1), "thap_phap": Vector2i(0, 1), "nha_b": Vector2i(1, 0)}
const BO_THANH := ["tuong", "thap", "cong", "nha_a", "nha_b", "nha_c", "thap_phap", "dai_phun", "den"]

var nha := ""                         # rỗng = ngoài trời; khác rỗng = trong nhà (khoá NoiThat.NHA)
var CO: Vector2i = BD.CO
var ten_map := "Ardhaven"
var nen: TileMapLayer                 # lưới ô LOGIC 64×32 — mọi phép đổi toạ độ đi qua nó
var nen_hd: TileMapLayer              # bản HD: viên 256×128 vẽ ở scale 0,25 — chỉ để nhìn
var _canh_hd := {}                    # bảng tranh HD: công trình, cây, đá (tools/hd/chuan_bi_hd.py)
var thuc_the: Node2D                  # cha của mọi thứ đứng trên đất, tự xếp theo y
var astar := AStarGrid2D.new()
var dac := {}                         # ô bị chặn: Vector2i → true
var vung_an_toan: Rect2i
var tam_thanh: Vector2i
var _loai: Array = []
var _o_loai := {}                     # Vector2i → tên loại ô
var cua := []                         # cửa nhà ngoài trời: {nha, chan: Rect2i, o_vao, o_ngoai, ten}
var o_ra := Vector2i(-1, -1)          # trong nhà: ô thảm cửa — bước lên là ra
var o_vao := Vector2i.ZERO            # trong nhà: chỗ hiện ra khi vừa bước vào


func _ready() -> void:
	_dung_lop()
	if nha != "":
		_dung_noi_that()
	else:
		vung_an_toan = BD.THANH
		tam_thanh = BD.THANH.position + BD.THANH.size / 2
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
	if SpriteBo.HD and FileAccess.file_exists("res://assets/hd/dat/o_dat_hd.json"):
		_dung_nen_hd()
	thuc_the = Node2D.new()
	thuc_the.name = "ThucThe"
	thuc_the.y_sort_enabled = true
	add_child(thuc_the)


## Bản HD: một lớp ô thứ hai, viên 256×128 (gấp 4 ô logic) thu về 0,25 ⇒ trùng khít từng ô với
## lớp logic. Lớp logic vẫn giữ để đổi toạ độ; nó chỉ bị ẩn đi.
func _dung_nen_hd() -> void:
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS     # con cháu thừa hưởng
	var info: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/hd/dat/o_dat_hd.json"))
	var ts := TileSet.new()
	ts.tile_shape = TileSet.TILE_SHAPE_ISOMETRIC
	ts.tile_layout = TileSet.TILE_LAYOUT_DIAMOND_DOWN
	ts.tile_size = Vector2i(256, 128)
	var src := TileSetAtlasSource.new()
	src.texture = load("res://assets/hd/dat/o_dat_hd.png")
	src.texture_region_size = Vector2i(256, 128)
	for i in (info["loai"] as Array).size():
		for k in int(info["bien"]):
			src.create_tile(Vector2i(i, k))
	ts.add_source(src, 0)
	nen_hd = TileMapLayer.new()
	nen_hd.tile_set = ts
	nen_hd.name = "NenHD"
	nen_hd.scale = Vector2.ONE * float(info["ty"])
	add_child(nen_hd)
	nen.visible = false
	_canh_hd = JSON.parse_string(FileAccess.get_file_as_string("res://assets/hd/canh/canh_hd.json"))


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
	# trong thành: đá lát, hai đại lộ chữ thập nối bốn cổng, quảng trường tròn ở giữa
	var gx := BD.THANH.position.x + BD.THANH.size.x / 2 - 1
	var gy := BD.THANH.position.y + BD.THANH.size.y / 2 - 1
	var tam_qt := Vector2(gx + 0.5, gy + 0.5)
	for y in range(BD.THANH.position.y, BD.THANH.end.y):
		for x in range(BD.THANH.position.x, BD.THANH.end.x):
			var dai_lo := x == gx or x == gx + 1 or y == gy or y == gy + 1
			var qt := Vector2(x, y).distance_to(tam_qt) <= BD.QUANG_TRUONG
			_o_loai[Vector2i(x, y)] = "duong" if dai_lo and not qt else "da_lat"
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
		if nen_hd:                                 # biến thể viên theo hạt cố định của ô
			nen_hd.set_cell(c, 0, Vector2i(_loai.find(_o_loai[c]), posmod(c.x * 7349 + c.y * 3011 + (c.x * c.y) % 13, 4)))


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
		var co := kich(ten, ct[2])
		var khoa_hd: String = ct[3] if ct.size() > 3 and _canh_hd.get("cong_trinh", {}).has(ct[3]) else ten
		_dat(ten, ct[1], co, ct[2], true, khoa_hd)
		if ct.size() > 3:
			_dat_cua(ct[3], ten, ct[1], co, ct[2])
	var cay: Texture2D = load("res://assets/sprites/canh/cay.png")
	for i in BD.CAY.size():
		_dat_cay(cay, BD.CAY[i], i % 8)
	for npc in BD.NPC:
		dat_npc(npc[0], npc[1], npc[2], npc[3], npc[4])


static func kich(ten: String, xoay: int) -> Vector2i:
	var co: Vector2i = KICH.get(ten, Vector2i.ONE)
	return Vector2i(co.y, co.x) if xoay % 2 == 1 else co


## Hướng cửa (trục ô) của một công trình sau khi xoay `xoay` lần 90°.
static func huong_cua(ten: String, xoay: int) -> Vector2i:
	var d: Vector2i = MAT_CUA.get(ten, Vector2i(0, 1))
	for i in xoay:
		d = Vector2i(d.y, -d.x)       # xoay 90° ngược chiều kim đồng hồ trong hệ thế giới = (x,y)→(y,−x) trên trục ô
	return d


## Cửa một nhà vào được: ô chân đế ngay sau cánh cửa thành ô ĐI ĐƯỢC — bước vào đó là vào nhà.
## Ra nhà thì hiện ở ô ngay trước cửa (không phải ô cửa), nên không bị hút vào lại.
func _dat_cua(nha_id: String, ten: String, goc: Vector2i, co: Vector2i, xoay: int) -> void:
	var d := huong_cua(ten, xoay)
	var cuoi := goc + co - Vector2i.ONE
	var vao: Vector2i
	if d.y != 0:
		vao = Vector2i(goc.x + co.x / 2, cuoi.y if d.y > 0 else goc.y)
	else:
		vao = Vector2i(cuoi.x if d.x > 0 else goc.x, goc.y + co.y / 2)
	dac.erase(vao)
	cua.append({"nha": nha_id, "chan": Rect2i(goc, co), "o_vao": vao, "o_ngoai": vao + d,
		"ten": NT.NHA[nha_id]["ten"]})


## Cửa nào có điểm màn hình `p` nằm trên hình ngôi nhà (chân đế hoặc tường/mái phía trên nó).
func cua_tai(p: Vector2) -> Dictionary:
	for k in 7:
		var c := o_cua(p + Vector2(0, k * 16))
		for cu in cua:
			if (cu["chan"] as Rect2i).has_point(c):
				return cu
	return {}


func cua_o(c: Vector2i) -> Dictionary:
	for cu in cua:
		if cu["o_vao"] == c:
			return cu
	return {}


## Đặt một công trình chiếm khối ô [goc, goc+co). Công trình to được CẮT DẢI DỌC, mỗi dải xếp lớp
## theo mép trước của chân đế ngay dưới nó — nhân vật đứng cạnh hông nhà mới che/bị che đúng.
func _dat(ten: String, goc: Vector2i, co: Vector2i, xoay: int, chan := true, khoa_hd := "") -> void:
	var k_hd := khoa_hd if khoa_hd != "" else ten
	if _canh_hd.get("cong_trinh", {}).has(k_hd):
		_dat_hd(_canh_hd["cong_trinh"][k_hd], ten, goc, co, chan)
		return
	var cuoi := goc + co - Vector2i.ONE
	var tam := (nen.map_to_local(goc) + nen.map_to_local(cuoi)) / 2.0
	var bo_ten := "thanh" if ten in BO_THANH else "do_vat"
	var bo := SpriteBo.tai(bo_ten)
	var tex: Texture2D = load("res://assets/sprites/%s/%s.png" % [bo_ten, ten])
	var o := bo.o
	var neo := bo.neo
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


## Bản HD của một công trình: một tấm tranh iso, thu cho BỀ NGANG nội dung bằng bề ngang hình thoi
## chân đế, đáy nội dung đặt ở đỉnh trước của chân đế. Vẫn cắt dải dọc như bản pixel — mỗi dải
## xếp lớp theo mép trước ngay dưới nó, nên đứng cạnh hông nhà vẫn che/bị che đúng.
## ⚠ Tranh HD chỉ có MỘT hướng: `xoay` của dữ liệu không đổi được hình (cửa vẽ trong tranh có thể
## không nằm đúng mặt có cửa thật). Lối vào nhà vẫn theo dữ liệu.
func _dat_hd(d: Dictionary, ten: String, goc: Vector2i, co: Vector2i, chan: bool) -> void:
	var cuoi := goc + co - Vector2i.ONE
	var tex: Texture2D = load("res://assets/hd/canh/%s.png" % d["tep"])
	var h: Array = d["hop"]
	var trai := nen.map_to_local(Vector2i(goc.x, cuoi.y)) + Vector2(-32, 0)
	var phai := nen.map_to_local(Vector2i(cuoi.x, goc.y)) + Vector2(32, 0)
	var day := nen.map_to_local(cuoi) + Vector2(0, 16)
	var rong_tex := float(h[2] - h[0])
	var cao_tex := float(h[3] - h[1])
	var ty := (phai.x - trai.x) * 1.04 / rong_tex
	var dinh := day.y + 3.0 - cao_tex * ty                  # mép trên của tranh (px logic)
	var nhom := Node2D.new()
	nhom.name = "%s_%d_%d" % [ten, goc.x, goc.y]
	nhom.y_sort_enabled = true
	thuc_the.add_child(nhom)
	var dai_tex := DAI / ty
	var n := int(ceil(rong_tex / dai_tex))
	var x0 := (trai.x + phai.x) / 2.0 - rong_tex * ty / 2.0
	for i in n:
		var w := minf(dai_tex, rong_tex - i * dai_tex)
		var x_man := x0 + (i * dai_tex + w / 2.0) * ty
		var y_sau := _mep_truoc(x_man, trai, day, phai)
		var s := Sprite2D.new()
		var at := AtlasTexture.new()
		at.atlas = tex
		at.region = Rect2(h[0] + i * dai_tex, h[1], w, cao_tex)
		s.texture = at
		s.scale = Vector2.ONE * ty
		s.position = Vector2(x_man, y_sau)
		s.offset = Vector2(0, (dinh + cao_tex * ty / 2.0 - y_sau) / ty)
		nhom.add_child(s)
	if chan:
		for y in range(goc.y, cuoi.y + 1):
			for x in range(goc.x, cuoi.x + 1):
				dac[Vector2i(x, y)] = true


## Cây/đá HD: tấm tranh có điểm chân (`neo`, px texture) — neo vào tâm ô, thu theo chiều cao đích.
func _vat_hd(loai: String, bien_the: int, c: Vector2i, cao: float) -> bool:
	var ds: Array = _canh_hd.get(loai, [])
	if ds.is_empty():
		return false
	var d: Dictionary = ds[bien_the % ds.size()]
	var s := Sprite2D.new()
	s.texture = load("res://assets/hd/canh/%s.png" % d["tep"])
	s.centered = false
	var ty := cao / float(d["hop"][3] - d["hop"][1])
	s.scale = Vector2.ONE * ty
	s.offset = -Vector2(d["neo"][0], d["neo"][1])
	s.position = nen.map_to_local(c)
	thuc_the.add_child(s)
	return true


func _mep_truoc(x: float, trai: Vector2, day: Vector2, phai: Vector2) -> float:
	if x <= trai.x:
		return trai.y
	if x >= phai.x:
		return phai.y
	if x <= day.x:
		return lerpf(trai.y, day.y, (x - trai.x) / maxf(1.0, day.x - trai.x))
	return lerpf(day.y, phai.y, (x - day.x) / maxf(1.0, phai.x - day.x))


func dat_npc(ten: String, c: Vector2i, bo: String, vai: String, lang_thang := false, huong_nhin := 0) -> Npc:
	var t := Npc.new()
	t.ten_bo = bo
	var gac_hd := bo == "hiep_si" and SpriteBo.co_hd("hiep_si_gac")
	if gac_hd:
		t.ten_bo = "hiep_si_gac"                  # bản HD: lính gác có tranh riêng, không mượn thân người chơi
	t.ten_hien = ten
	t.vai = vai
	t.lang_thang = lang_thang
	t.the_gioi = self
	t.position = nen.map_to_local(c)
	t.huong = huong_nhin
	if bo == "hiep_si" and not gac_hd:
		t.modulate = Color(0.75, 0.9, 1.2)
	t.name = "NPC_%s_%d_%d" % [ten, c.x, c.y]
	thuc_the.add_child(t)
	if not lang_thang:
		dac[c] = true
	return t


func _dat_cay(cay: Texture2D, c: Vector2i, bien_the: int) -> void:
	if _vat_hd("cay", bien_the, c, 96.0):
		dac[c] = true
		return
	var s := Sprite2D.new()
	var at := AtlasTexture.new()
	at.atlas = cay
	at.region = Rect2(0, bien_the * 96, 96, 96)
	s.texture = at
	s.offset = Vector2(48, 48) - Vector2(48, 88)
	s.position = nen.map_to_local(c)
	thuc_the.add_child(s)
	dac[c] = true


# ── trong nhà ───────────────────────────────────────────────────────────────
func _dung_noi_that() -> void:
	var d: Dictionary = NT.NHA[nha]
	var rong: int = d["rong"]
	var sau: int = d["sau"]
	ten_map = d["ten"]
	CO = Vector2i(rong + 1, sau + 1)
	vung_an_toan = Rect2i(Vector2i.ZERO, CO)
	tam_thanh = CO / 2
	o_ra = d["cua"]
	o_vao = d["vao"]
	for y in CO.y:
		for x in CO.x:
			_o_loai[Vector2i(x, y)] = "san_go"
	_o_loai[o_ra] = "tham"
	_dat("cot_goc", Vector2i.ZERO, Vector2i.ONE, 0)
	for x in range(1, rong + 1):
		_dat("tuong_so" if x in d["so"] else "tuong_trong", Vector2i(x, 0), Vector2i.ONE, 0)
	for y in range(1, sau + 1):
		_dat("tuong_trong", Vector2i(0, y), Vector2i.ONE, 1)
	for dv in d["do"]:
		_dat(dv[0], dv[1], kich(dv[0], dv[2]), dv[2])
	for n in d["npc"]:
		dat_npc(n[0], n[1], n[2], n[3], false, n[4])


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
			var bien := r.randi_range(0, 11)
			if _vat_hd("cay" if la_cay else "da", bien, c, r.randf_range(86.0, 108.0) if la_cay else r.randf_range(16.0, 26.0)):
				dac[c] = true
				continue
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


## Hệ của đất đang đứng: hệ của vòng quái chứa điểm p. Trong thành / trong nhà thì rỗng.
func he_tai(p: Vector2) -> String:
	if nha != "" or an_toan(p):
		return ""
	var kc := kc_thanh(o_cua(p))
	for v in BD.VUNG_QUAI:
		if kc >= v[0] and kc < v[1]:
			return v[7]
	return ""


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
