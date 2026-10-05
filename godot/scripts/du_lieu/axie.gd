class_name Axie
## Dữ liệu 16 con Axie và luật KHẮC HỆ phòng thủ.
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

## 16 con Axie: id → [tên, sao, lớp]. Khớp bảng CHIMERA của bản web (data/canbang.js).
## Hình ở bản 3D sẽ là tranh phẳng quay về camera, nướng từ chính bộ Spine của bản web (mốc 3D-2).
const DS := {
	"aurelion": ["Aurelion", 5, "Dawn"], "netherfang": ["Netherfang", 5, "Dusk"],
	"tidewarden": ["Tidewarden", 5, "Aquatic"], "emberjaw": ["Emberjaw", 5, "Beast"],
	"voltcrest": ["Voltcrest", 5, "Bird"], "ironshell": ["Ironshell", 5, "Reptile"],
	"petalkin": ["Petalkin", 4, "Plant"], "crimsonmaw": ["Crimsonmaw", 4, "Beast"],
	"thornpaw": ["Thornpaw", 4, "Plant"], "inkmane": ["Inkmane", 4, "Dusk"],
	"cinderbeak": ["Cinderbeak", 4, "Bird"], "mossback": ["Mossback", 4, "Plant"],
	"hexmite": ["Hexmite", 4, "Bug"], "ridgehorn": ["Ridgehorn", 4, "Reptile"],
	"coghound": ["Coghound", 4, "Mech"], "sunspur": ["Sunspur", 4, "Dawn"],
}


static func ds() -> Array:
	var a := DS.keys()
	a.sort_custom(func(x, y): return [-int(DS[x][1]), x] < [-int(DS[y][1]), y])
	return a


static func lop(id: String) -> String:
	return DS.get(id, ["", 0, ""])[2]


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
