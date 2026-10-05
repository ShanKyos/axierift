class_name VatPham
## Bảng vật phẩm — DỮ LIỆU, không phải mã. Thêm món = thêm một dòng.
##
## loai: "vu_khi" · "giap" · "thuoc" · "sach". Icon là tên trạng thái trong bộ `icon_do`
## (render bằng `tools/sprites/icon_do.py`, cùng đường render với nhân vật).
## gia: giá MUA ở tiệm (Lumen). Bán lại được GIA_BAN phần giá đó.

const GIA_BAN := 1.0 / 3.0
const TUI_O := 32                    # túi 8 × 4 ô
const KHO_O := 40                    # kho 8 × 5 ô

const DB := {
	"kiem_ngan": {"ten": "Kiếm Ngắn", "loai": "vu_khi", "icon": "kiem_ngan", "gia": 300, "cong": [3, 7], "can_sm": 20},
	"kiem_dai": {"ten": "Kiếm Dài", "loai": "vu_khi", "icon": "kiem_dai", "gia": 1800, "cong": [8, 15], "can_sm": 40},
	"dai_kiem": {"ten": "Đại Kiếm", "loai": "vu_khi", "icon": "dai_kiem", "gia": 6500, "cong": [16, 27], "can_sm": 70},
	"giap_da": {"ten": "Giáp Da", "loai": "giap", "icon": "giap_da", "gia": 400, "thu": 4, "can_sm": 20},
	"giap_xich": {"ten": "Giáp Xích", "loai": "giap", "icon": "giap_xich", "gia": 2200, "thu": 10, "can_sm": 40},
	"giap_tam": {"ten": "Giáp Tấm", "loai": "giap", "icon": "giap_tam", "gia": 7500, "thu": 18, "can_sm": 70},
	"binh_mau_nho": {"ten": "Bình Máu Nhỏ", "loai": "thuoc", "icon": "binh_mau_nho", "gia": 20, "hp": 40, "xep": 20},
	"binh_mau": {"ten": "Bình Máu", "loai": "thuoc", "icon": "binh_mau", "gia": 70, "hp": 120, "xep": 20},
	"binh_mana_nho": {"ten": "Bình Mana Nhỏ", "loai": "thuoc", "icon": "binh_mana_nho", "gia": 20, "mp": 20, "xep": 20},
	"binh_mana": {"ten": "Bình Mana", "loai": "thuoc", "icon": "binh_mana", "gia": 70, "mp": 60, "xep": 20},
	"sach_chem_xoay": {"ten": "Sách: Chém Xoáy", "loai": "sach", "icon": "sach_chieu", "gia": 2500, "chieu": "chem_xoay", "can_cap": 5},
}

## Chiêu học từ sách. mp: tiêu hao · he: hệ số nhân sát thương · tam: bán kính quét (px trên đất).
const CHIEU := {
	"chem_xoay": {"ten": "Chém Xoáy", "mp": 8, "he": 1.5, "tam": 64.0, "hoi": 0.9},
}


static func lay(id: String) -> Dictionary:
	return DB.get(id, {})


static func xep_toi_da(id: String) -> int:
	return int(DB.get(id, {}).get("xep", 1))


static func gia_ban(id: String) -> int:
	return int(floor(int(DB[id]["gia"]) * GIA_BAN))


## Dòng chú thích hiện khi rê chuột lên ô đồ.
static func mo_ta(id: String, nv = null) -> String:
	var d := lay(id)
	if d.is_empty():
		return ""
	var s: String = d["ten"]
	match d["loai"]:
		"vu_khi": s += "\nSát thương +%d ~ %d" % [d["cong"][0], d["cong"][1]]
		"giap": s += "\nPhòng thủ +%d" % d["thu"]
		"thuoc":
			if d.has("hp"): s += "\nHồi %d máu (phím Q)" % d["hp"]
			if d.has("mp"): s += "\nHồi %d mana (phím W)" % d["mp"]
		"sach":
			var c: Dictionary = CHIEU[d["chieu"]]
			s += "\nHọc chiêu %s — %d mana, quét quanh mình\nCần cấp %d" % [c["ten"], c["mp"], d["can_cap"]]
	if d.has("can_sm"):
		var du: bool = nv == null or nv.suc_manh >= int(d["can_sm"])
		s += "\nCần Sức Mạnh %d%s" % [d["can_sm"], "" if du else "  (chưa đủ)"]
	return s
