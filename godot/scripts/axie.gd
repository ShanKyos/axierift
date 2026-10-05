class_name Axie
## Dữ liệu 16 con Axie (pixel hoá bằng `tools/sprites/axie_pixel.py`) và luật KHẮC HỆ phòng thủ.
##
## Axie 0 chỉ số, 0 kỹ năng. Thứ nó quyết định là HỆ PHÒNG THỦ: quái đánh người chơi thì hệ của
## quái so với lớp của con Axie đang đi theo. Đây là một QUAN HỆ, không phải nấc thang — đổi con
## Axie không cộng một điểm chỉ số nào, chỉ đổi nơi nào ngươi chịu đòn nhẹ, nơi nào chịu đòn nặng.
##
## Tam giác chín lớp, chính chủ Axie:
##   ① Beast · Bug · Mech  ▶  ② Plant · Reptile · Dusk  ▶  ③ Aquatic · Bird · Dawn  ▶  ①
## (a ▶ b: a khắc b). Hai lớp cùng nhóm là trung tính với nhau, dù tên khác hẳn.

const NHOM := {"Beast": 0, "Bug": 0, "Mech": 0, "Plant": 1, "Reptile": 1, "Dusk": 1,
	"Aquatic": 2, "Bird": 2, "Dawn": 2}
const HE_THIET := 1.12          # quái khắc Axie: ăn đòn nặng hơn
const HE_LOI := 0.90            # Axie khắc quái: ăn đòn nhẹ hơn
const MAC_DINH := "emberjaw"

static var _meta := {}
static var _frames := {}


static func meta() -> Dictionary:
	if _meta.is_empty():
		_meta = JSON.parse_string(FileAccess.get_file_as_string("res://assets/sprites/axie/axie.json"))
	return _meta


static func ds() -> Array:
	var a := meta().keys()
	a.sort_custom(func(x, y): return [-int(meta()[x]["sao"]), x] < [-int(meta()[y]["sao"]), y])
	return a


static func lop(id: String) -> String:
	return meta().get(id, {}).get("lop", "")


## a có khắc b không (cửa DUY NHẤT hỏi chuyện khắc hệ).
static func khac(a: String, b: String) -> bool:
	if not NHOM.has(a) or not NHOM.has(b):
		return false
	return (NHOM[a] + 1) % 3 == NHOM[b]


## Phán quyết phòng thủ: ket = -1 (quái khắc Axie) · 0 (trung tính) · 1 (Axie khắc quái), kèm hệ số.
## Trả CẢ trạng thái trung tính — im lặng ở đó thì không phân biệt được với "cơ chế không chạy".
static func phong_thu(he_quai: String, he_axie: String) -> Dictionary:
	if khac(he_quai, he_axie):
		return {"ket": -1, "he_so": HE_THIET}
	if khac(he_axie, he_quai):
		return {"ket": 1, "he_so": HE_LOI}
	return {"ket": 0, "he_so": 1.0}


## Ba lớp khắc lại một hệ — để nói cho người chơi "mang con nào tới đây".
static func khac_lai(he: String) -> Array:
	var out := []
	for l in NHOM:
		if khac(l, he):
			out.append(l)
	return out


## Bản HD (bảng khung Spine nướng của bản web, `assets/hd/axie/`): khung to hơn nhiều — node vẽ
## nó ở `scale = hinh(id).ty`. Không có bản HD thì về bản pixel.
static var _hd := {}


static func hd(id: String) -> Dictionary:
	if not SpriteBo.HD:
		return {}
	if _hd.is_empty() and FileAccess.file_exists("res://assets/hd/axie/axie_hd.json"):
		_hd = JSON.parse_string(FileAccess.get_file_as_string("res://assets/hd/axie/axie_hd.json"))
	return _hd.get(id, {})


## Ô, điểm chạm đất (px texture) và tỉ lệ vẽ của hình đang dùng — pixel hay HD.
static func hinh(id: String) -> Dictionary:
	var h := hd(id)
	if not h.is_empty():
		return {"o": Vector2(h["o"][0], h["o"][1]), "neo": Vector2(h["neo"][0], h["neo"][1]), "ty": float(h["ty"])}
	var m: Dictionary = meta()[id]
	return {"o": Vector2(m["o"][0], m["o"][1]), "neo": Vector2(m["neo"][0], m["neo"][1]), "ty": 1.0}


static func _frames_hd(id: String, h: Dictionary) -> SpriteFrames:
	var sf := SpriteFrames.new()
	sf.remove_animation("default")
	var w: int = h["o"][0]
	var ho: int = h["o"][1]
	for tt in h["trang_thai"]:
		var t: Dictionary = h["trang_thai"][tt]
		var tex: Texture2D = load("res://assets/hd/axie/%s%s.webp" % [id, t["tep"]])
		sf.add_animation(tt)
		sf.set_animation_loop(tt, bool(t["lap"]))
		sf.set_animation_speed(tt, float(t["fps"]))
		var cot: int = t["cot"]
		for k in int(t["khung"]):
			var at := AtlasTexture.new()
			at.atlas = tex
			at.region = Rect2((k % cot) * w, (k / cot) * ho, w, ho)
			sf.add_frame(tt, at)
	return sf


static func frames(id: String) -> SpriteFrames:
	if _frames.has(id):
		return _frames[id]
	if not hd(id).is_empty():
		_frames[id] = _frames_hd(id, hd(id))
		return _frames[id]
	var m: Dictionary = meta()[id]
	var tex: Texture2D = load("res://assets/sprites/axie/%s.png" % id)
	var sf := SpriteFrames.new()
	sf.remove_animation("default")
	var w: int = m["o"][0]
	var h: int = m["o"][1]
	for tt in m["trang_thai"]:
		var t: Dictionary = m["trang_thai"][tt]
		sf.add_animation(tt)
		sf.set_animation_loop(tt, bool(t["lap"]))
		sf.set_animation_speed(tt, float(t["fps"]))
		for k in int(t["khung"]):
			var at := AtlasTexture.new()
			at.atlas = tex
			at.region = Rect2(k * w, int(t["hang"]) * h, w, h)
			sf.add_frame(tt, at)
	_frames[id] = sf
	return sf


## Khung thở đầu tiên — làm icon trong bảng chọn.
static func icon(id: String) -> Texture2D:
	return frames(id).get_frame_texture("idle", 0)


## Vẽ phần ĐẦU con Axie (tranh quay mặt sang phải ⇒ nửa phải khung) vừa khít một ô chữ nhật.
## Dùng chung cho chân dung HUD và ô Axie trên thanh dưới — pixel hay HD đều cắt theo TỈ LỆ khung.
static func ve_dau(ci: CanvasItem, id: String, o_ve: Rect2) -> void:
	var ic := icon(id)
	var w := float(ic.get_width())
	var h := float(ic.get_height())
	var canh := minf(w * 0.62, h * 0.85)
	var vung := Rect2(w - canh, h * 0.05, canh, canh * o_ve.size.y / o_ve.size.x)
	ci.draw_texture_rect_region(ic, o_ve, vung)
