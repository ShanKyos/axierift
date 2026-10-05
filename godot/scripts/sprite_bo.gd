class_name SpriteBo
extends RefCounted
## Một bộ sprite 8 hướng sinh bằng `tools/sprites/render.py`: các PNG theo trạng thái + một JSON.
##
## Mỗi trạng thái là một bảng: hàng = hướng (S…SE), cột = khung. JSON mang luôn số đo vật lý
## (tốc độ m/s, khung trúng đòn, vị trí bàn chân từng khung) — game ĐỌC chúng chứ không chép tay,
## nên nướng lại art với sải chân khác là tốc độ đi tự đổi theo.

##
## ⚠ BẢN HD: bộ nào có bản HD (`assets/hd/hd_<tên>/`) thì nạp bản HD thay cho bản pixel, khi
## `HD` bật. Bản HD mang thêm `ty` = tỉ lệ vẽ (px texture → px logic): node vẽ hình ở `scale = ty`,
## còn MỌI số đọc ra ngoài (`neo`, bàn chân, tốc độ) đều đã quy về px LOGIC — nên phần còn lại của
## game (đi, đánh, xếp lớp, bài kiểm chân không trượt) không phải biết hình là pixel hay HD.

static var HD := true

var ten: String
var meta: Dictionary
var frames: SpriteFrames
var o: int                             # cạnh ô trong TEXTURE (px texture)
var neo: Vector2                       # điểm chạm đất — px LOGIC (đã nhân ty)
var neo_tex: Vector2                   # điểm chạm đất — px texture
var ty := 1.0                          # px texture → px logic
var px_m: float

static var _kho := {}


static func tai(ten_bo: String) -> SpriteBo:
	if _kho.has(ten_bo):
		return _kho[ten_bo]
	var b := SpriteBo.new()
	b._tai(ten_bo)
	_kho[ten_bo] = b
	return b


static func co_hd(ten_bo: String) -> bool:
	return HD and FileAccess.file_exists("res://assets/hd/%s/%s.json" % [_ten_hd(ten_bo), _ten_hd(ten_bo)])


static func _ten_hd(ten_bo: String) -> String:
	return "hd_nguoi" if ten_bo == "hiep_si" else "hd_" + ten_bo


func _tai(ten_bo: String) -> void:
	ten = ten_bo
	var goc := "res://assets/sprites/%s/" % ten_bo
	var tep := ten_bo
	if co_hd(ten_bo):
		tep = _ten_hd(ten_bo)
		goc = "res://assets/hd/%s/" % tep
	meta = JSON.parse_string(FileAccess.get_file_as_string(goc + tep + ".json"))
	o = int(meta["o"])
	ty = float(meta.get("ty", 1.0))
	neo_tex = Vector2(meta["neo"][0], meta["neo"][1])
	neo = neo_tex * ty
	px_m = float(meta["px_m"])
	var duoi := "." + str(meta.get("dinh_dang", "png"))
	frames = SpriteFrames.new()
	frames.remove_animation("default")
	for tt in meta["trang_thai"]:
		var m: Dictionary = meta["trang_thai"][tt]
		var tex: Texture2D = load(goc + tt + duoi)
		for d in 8:
			var ten_anim := "%s_%d" % [tt, d]
			frames.add_animation(ten_anim)
			frames.set_animation_loop(ten_anim, bool(m["lap"]))
			frames.set_animation_speed(ten_anim, float(m["fps"]))
			for k in int(m["khung"]):
				var at := AtlasTexture.new()
				at.atlas = tex
				at.region = Rect2(k * o, d * o, o, o)
				frames.add_frame(ten_anim, at)


func co(tt: String) -> bool:
	return meta["trang_thai"].has(tt)


func so_khung(tt: String) -> int:
	return int(meta["trang_thai"][tt]["khung"])


func fps(tt: String) -> float:
	return float(meta["trang_thai"][tt]["fps"])


func khung_trung(tt: String) -> int:
	var v = meta["trang_thai"][tt].get("trung")
	return -1 if v == null else int(v)


## Tốc độ trên MẶT ĐẤT (px ngang màn hình / giây) — đọc thẳng từ số đo lúc render.
func toc_do_px(tt: String) -> float:
	var v = meta["trang_thai"][tt].get("toc_do_m_s")
	return 0.0 if v == null else float(v) * px_m


## Sải một chu kỳ trên mặt đất (px): tốc độ × thời gian một vòng.
func sai_px(tt: String) -> float:
	return toc_do_px(tt) * so_khung(tt) / fps(tt)


## Bàn chân trong ô sprite: {px: Vector2 (toạ độ trong ô), cham: bool}.
## Đỉnh đầu so với gốc node (px logic, âm = phía trên) — chỗ đặt tên và số bay.
func dinh() -> float:
	if meta.has("cao"):
		return -float(meta["cao"]) * ty - 2.0
	return -neo.y + 18.0


## `px` đã quy về px LOGIC (cùng hệ với `neo`).
func chan(tt: String, d: int, k: int, ben: String) -> Dictionary:
	var c: Dictionary = meta["trang_thai"][tt]["chan"][d][k][ben]
	return {"px": Vector2(c["px"][0], c["px"][1]) * ty, "cham": bool(c["cham"])}


## Dời hình (px TEXTURE — node hình đã scale = ty) để điểm neo của ô trùng gốc node.
func lech_ve() -> Vector2:
	return Vector2(o / 2.0, o / 2.0) - neo_tex
