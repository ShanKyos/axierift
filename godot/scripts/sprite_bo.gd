class_name SpriteBo
extends RefCounted
## Một bộ sprite 8 hướng sinh bằng `tools/sprites/render.py`: các PNG theo trạng thái + một JSON.
##
## Mỗi trạng thái là một bảng: hàng = hướng (S…SE), cột = khung. JSON mang luôn số đo vật lý
## (tốc độ m/s, khung trúng đòn, vị trí bàn chân từng khung) — game ĐỌC chúng chứ không chép tay,
## nên nướng lại art với sải chân khác là tốc độ đi tự đổi theo.

var ten: String
var meta: Dictionary
var frames: SpriteFrames
var o: int
var neo: Vector2
var px_m: float

static var _kho := {}


static func tai(ten_bo: String) -> SpriteBo:
	if _kho.has(ten_bo):
		return _kho[ten_bo]
	var b := SpriteBo.new()
	b._tai(ten_bo)
	_kho[ten_bo] = b
	return b


func _tai(ten_bo: String) -> void:
	ten = ten_bo
	var goc := "res://assets/sprites/%s/" % ten_bo
	meta = JSON.parse_string(FileAccess.get_file_as_string(goc + ten_bo + ".json"))
	o = int(meta["o"])
	neo = Vector2(meta["neo"][0], meta["neo"][1])
	px_m = float(meta["px_m"])
	frames = SpriteFrames.new()
	frames.remove_animation("default")
	for tt in meta["trang_thai"]:
		var m: Dictionary = meta["trang_thai"][tt]
		var tex: Texture2D = load(goc + tt + ".png")
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
func chan(tt: String, d: int, k: int, ben: String) -> Dictionary:
	var c: Dictionary = meta["trang_thai"][tt]["chan"][d][k][ben]
	return {"px": Vector2(c["px"][0], c["px"][1]), "cham": bool(c["cham"])}


## Dời hình để điểm neo (chạm đất) của ô trùng gốc node.
func lech_ve() -> Vector2:
	return Vector2(o / 2.0, o / 2.0) - neo
