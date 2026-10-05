class_name Ardhaven3D
## Bố cục map khởi đầu Ardhaven bản 3D — đọc từ tranh tổng quan chủ dự án sinh (512 px, bắc ở trên):
## thành vuông có tường giữa map, bốn cổng giữa bốn cạnh, quảng trường tròn ở tâm, tháp pháp sư góc
## đông bắc; rừng thông + tháp canh đổ ở bắc, sông chảy bắc→nam + cầu gỗ ở đông, đồng ruộng bỏ hoang
## ở nam, đồi đá + phế tích + nghĩa địa ở tây. Tên và bố cục là của game này (Quy tắc số 2).
##
## SỬA MAP Ở ĐÂY. Toạ độ THẾ GIỚI, mét: +X = ĐÔNG, +Z = NAM, gốc ở tâm map. Vector2 là (x, z).
## Tranh → thế giới: 1 px ≈ 0,39 m. Nhân vật cao 2,47 m, chạy 4,54 m/s ⇒ băng qua thành ~17 giây,
## băng qua cả map ~44 giây.

const NUA := 100.0                     # map 200 × 200 m
const CO := 5.5                        # tỉ lệ tường thành của gói KayKit Medieval so với Knight 2,47 m
## Nhà phóng to hơn tường (8 ≈ nhà cao 7 m, gấp ba người) — đúng nhịp MU: nhà là khối lớn quanh
## phố, người chơi nhỏ đi giữa. Ở 5,5 thành 77 m trông thưa thớt như một bãi đất có vài túp lều.

## Thành: 7 khúc tường mỗi cạnh (wall_straight ×5,5 = 11 m), khúc GIỮA là cổng (lỗ hở 5,5 m đo từ
## lưới đỉnh của mô hình). Tâm thành lệch bắc 9 m — đúng như tranh.
const TAM_THANH := Vector2(0, -9)
const DOAN_TUONG := 11.0
const SO_DOAN := 7
const NUA_THANH := 38.5                # = SO_DOAN × DOAN_TUONG / 2
const LO_CONG := 2.6                   # nửa bề rộng lối qua cổng (m) — lỗ thật 2,75
const QUANG_TRUONG := 10.0             # bán kính quảng trường lát đá
const NUA_PHO := 3.5                   # nửa bề rộng hai phố lát đá chữ thập trong thành

const XUAT_PHAT := Vector3(-5, 0, -4)  # nhân vật mới đứng ở mép tây nam quảng trường

## Đường đất ngoài thành: mỗi đường một dải điểm (x, z) + bề rộng.
const DUONG := [
	{"ten": "bắc", "rong": 5.0, "diem": [Vector2(0, -47.5), Vector2(-2, -62), Vector2(3, -76), Vector2(4, -84)]},
	{"ten": "nam", "rong": 5.0, "diem": [Vector2(0, 29.5), Vector2(-3, 50), Vector2(2, 72), Vector2(-4, 100)]},
	{"ten": "tây", "rong": 5.0, "diem": [Vector2(-38.5, -9), Vector2(-58, -6), Vector2(-78, -12), Vector2(-100, -10)]},
	{"ten": "đông", "rong": 5.0, "diem": [Vector2(38.5, -9), Vector2(56, -9), Vector2(70, -9), Vector2(84, -6), Vector2(100, -10)]},
	{"ten": "mộ", "rong": 3.5, "diem": [Vector2(-58, -6), Vector2(-62, 2), Vector2(-64, 9)]},
	{"ten": "trại", "rong": 3.5, "diem": [Vector2(-3, 50), Vector2(14, 54), Vector2(24, 54)]},
]

## Sông: chảy bắc → nam (z tăng ĐƠN ĐIỆU — `song_x()` dựa vào đó). Cầu gỗ bắc qua ở đường đông.
const SONG := {"rong": 7.0, "diem": [Vector2(60, -100), Vector2(57, -72), Vector2(64, -44), Vector2(61, -22),
	Vector2(62, -9), Vector2(66, 10), Vector2(72, 36), Vector2(78, 64), Vector2(84, 100)]}
const CAU := {"tam": Vector2(62, -9), "dai": 11.0, "rong": 5.6}     # cầu chạy theo trục X
const AO := [[Vector2(84, -40), 5.0], [Vector2(91, -24), 3.8], [Vector2(87, 18), 5.5], [Vector2(93, 42), 3.5]]

## Bốn vùng theo hướng. Quái chưa thả (mốc 3D-2) — đây là bản khai để thả vào. `he` là lớp Axie của
## miền dân số (tam giác chín lớp, xem CLAUDE.md), chọn ba nhóm khác nhau để mỗi hướng mang một
## câu trả lời khác cho "nên cầm con Axie nào tới đây".
const VUNG := [
	{"id": "bac", "ten": "Rừng Thông Bắc", "huong": "Bắc", "he": "Beast", "quai": "Sói Rừng",
		"cap": [1, 10], "hop": Rect2(-62, -100, 124, 46)},
	{"id": "dong", "ten": "Đầm Lầy Bờ Đông", "huong": "Đông", "he": "Reptile", "quai": "Bọ Giáp Đầm",
		"cap": [8, 18], "hop": Rect2(46, -62, 54, 124)},
	{"id": "nam", "ten": "Đồng Ruộng Bỏ Hoang", "huong": "Nam", "he": "Bird", "quai": "Lợn Rừng",
		"cap": [4, 14], "hop": Rect2(-44, 34, 104, 66)},
	{"id": "tay", "ten": "Đồi Đá Mộ Cổ", "huong": "Tây", "he": "Dusk", "quai": "Bộ Xương",
		"cap": [12, 22], "hop": Rect2(-100, -60, 54, 112)},
]

## Công trình: [mô hình, (x, z), xoay độ, tỉ lệ (0 = CO), tên — có tên thì hiện trên bản đồ Tab].
const CONG_TRINH := [
	["building_well_red", Vector2(0, -9), 0, 6.0, "Quảng Trường"],
	# ── tây bắc: lò rèn
	["building_blacksmith_red", Vector2(-24, -25), 90, 8.5, "Lò Rèn"],
	["building_home_B_red", Vector2(-29, -38), 0, 8.0, ""],
	["building_home_A_red", Vector2(-12, -38), 0, 8.0, ""],
	["building_home_A_red", Vector2(-12, -21), 90, 8.0, ""],
	["weaponrack", Vector2(-16.5, -27), 90, 6.0, ""],
	["barrel", Vector2(-16.5, -31), 0, 6.0, ""],
	["crate_A_big", Vector2(-17, -33.5), 20, 6.0, ""],
	# ── đông bắc: tháp pháp sư
	["building_tower_B_red", Vector2(25, -33), 0, 9.0, "Tháp Pháp Sư"],
	["building_home_B_red", Vector2(11, -38), 0, 8.0, ""],
	["building_church_red", Vector2(12, -22), 0, 7.5, "Nhà Nguyện"],
	["building_home_A_red", Vector2(29, -18), 270, 8.0, ""],
	# ── tây nam: quán rượu
	["building_tavern_red", Vector2(-25, 4), 90, 8.0, "Quán Rượu"],
	["building_home_A_red", Vector2(-12, 6), 180, 8.0, ""],
	["building_home_B_red", Vector2(-29, 20), 0, 8.0, ""],
	["building_market_red", Vector2(-13, 20), 0, 6.5, ""],
	["barrel", Vector2(-18.5, 1.5), 0, 6.0, ""],
	["barrel", Vector2(-18.7, 4.0), 0, 6.0, ""],
	# ── đông nam: kho + chợ + sân tập
	["building_barracks_red", Vector2(26, 3), 270, 7.0, "Nhà Kho"],
	["building_market_red", Vector2(13, 19), 0, 6.5, "Chợ"],
	["building_home_A_red", Vector2(30, 21), 0, 8.0, ""],
	["building_home_B_red", Vector2(12, 3), 180, 8.0, ""],
	["crate_long_A", Vector2(21, 24), 90, 6.0, ""],
	["sack", Vector2(6.5, 13), 30, 7.0, ""],
	# ── bắc: tháp canh đổ cuối đường rừng
	["building_tower_base_red", Vector2(4, -89), 15, 6.0, "Tháp Canh Đổ"],
	["building_destroyed", Vector2(13, -86), 40, 4.0, ""],
	["tent", Vector2(-6, -81), 20, 5.0, ""],
	# ── tây: phế tích
	["building_destroyed", Vector2(-70, -30), 20, 6.5, "Phế Tích"],
	["building_destroyed", Vector2(-86, -25), -30, 6.0, ""],
	["wall_straight", Vector2(-61, -41), 35, 4.5, ""],
	["wall_straight", Vector2(-79, -44), -10, 4.5, ""],
	["wall_corner_B_outside", Vector2(-90, -36), 60, 4.5, ""],
	# ── nam: trại bỏ hoang + cối xay
	["building_destroyed", Vector2(28, 52), 10, 6.0, "Trại Bỏ Hoang"],
	["building_home_A_red", Vector2(40, 47), 200, 0, ""],
	["building_windmill_red", Vector2(56, 52), 0, 6.0, "Cối Xay Gió"],
	["wheelbarrow", Vector2(20, 49), 60, 5.0, ""],
	["resource_lumber", Vector2(33, 58), 15, 5.0, ""],
	["crate_open", Vector2(22, 57), 0, 5.0, ""],
]

## Ruộng: lúa (mô hình building_grain) hoặc đất cày (chỉ tô mặt đất). Rào gỗ quanh, chừa một lối vào.
const RUONG := [
	{"hop": Rect2(10, 62, 32, 22), "lua": true},
	{"hop": Rect2(46, 62, 22, 18), "lua": false},
	{"hop": Rect2(12, 88, 40, 10), "lua": true},
]

const NGHIA_DIA := Rect2(-86, 6, 20, 16)    # bia mộ xếp hàng, rào đá quanh

## Hạt cố định: bố cục rừng/đá giống nhau mọi lần vào (học được địa hình thì địa hình mới có nghĩa).
const HAT := 20261005


static func vung_tai(p: Vector2) -> String:
	for v in VUNG:
		if (v.hop as Rect2).has_point(p):
			return v.id
	return ""


## Toạ độ x của lòng sông ở độ sâu z (sông đơn điệu theo z).
static func song_x(z: float) -> float:
	var d: Array = SONG.diem
	if z <= d[0].y:
		return d[0].x
	for i in range(1, d.size()):
		if z <= d[i].y:
			var t: float = (z - d[i - 1].y) / (d[i].y - d[i - 1].y)
			return lerpf(d[i - 1].x, d[i].x, t)
	return d[-1].x


static func kc_doan(p: Vector2, a: Vector2, b: Vector2) -> float:
	var ab := b - a
	var t := clampf((p - a).dot(ab) / maxf(ab.length_squared(), 1e-6), 0.0, 1.0)
	return p.distance_to(a + ab * t)


static func kc_day(p: Vector2, diem: Array) -> float:
	var m := 1e9
	for i in range(1, diem.size()):
		m = minf(m, kc_doan(p, diem[i - 1], diem[i]))
	return m


static func tren_duong(p: Vector2, du := 0.0) -> bool:
	for r in DUONG:
		if kc_day(p, r.diem) <= r.rong * 0.5 + du:
			return true
	return false


static func trong_thanh(p: Vector2, le := 0.0) -> bool:
	return absf(p.x - TAM_THANH.x) < NUA_THANH + le and absf(p.y - TAM_THANH.y) < NUA_THANH + le


## Bốn cổng: tâm lối qua cổng + hướng chĩa RA ngoài.
static func cong() -> Dictionary:
	var t := TAM_THANH
	return {
		"bac": {"tam": t + Vector2(0, -NUA_THANH), "ra": Vector2(0, -1), "ten": "Cổng Bắc"},
		"nam": {"tam": t + Vector2(0, NUA_THANH), "ra": Vector2(0, 1), "ten": "Cổng Nam"},
		"tay": {"tam": t + Vector2(-NUA_THANH, 0), "ra": Vector2(-1, 0), "ten": "Cổng Tây"},
		"dong": {"tam": t + Vector2(NUA_THANH, 0), "ra": Vector2(1, 0), "ten": "Cổng Đông"},
	}
