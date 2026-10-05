class_name BanDoArdhaven
## Bố cục map khởi đầu Ardhaven — thị trấn đá có tường, đồng cỏ quanh thành, quái mạnh dần theo
## khoảng cách. Tinh thần thị trấn tân thủ của MU Online: quảng trường giữa có đài phun nước, bốn
## đại lộ chạy ra bốn cổng, các tiệm quây quanh. Tên và bố cục là của game này.
##
## SỬA MAP Ở ĐÂY. Mọi toạ độ là Ô (x, y) trên lưới isometric:
##   trục x đi xuống-PHẢI trên màn hình, trục y đi xuống-TRÁI. Ô (0,0) ở đỉnh trên cùng của map.
## Muốn biết một chỗ là ô mấy: chạy game, giữ phím Alt — toạ độ ô dưới con trỏ hiện ở góc trái.
##
## ⚠ CỬA NHÀ chỉ đặt ở mặt NHÌN THẤY được (+x xuống-phải, +y xuống-trái). Mặt −x/−y là lưng nhà,
## người chơi không thấy cửa. Hướng cửa theo `xoay`: nha_a · nha_c · thap_phap ⇒ 0:+y 1:+x;
## nha_b ⇒ 0:+x 3:+y.

const CO := Vector2i(112, 112)

## Thành: hình chữ nhật trên lưới ô (x0, y0, rộng, cao). Viền là tường; bốn góc là tháp.
const THANH := Rect2i(40, 40, 32, 32)

## Cổng: mỗi cổng mở 2 ô giữa một cạnh tường. "x+" = cạnh xuống-phải, "y+" = cạnh xuống-trái…
const CONG := ["x+", "y+", "x-", "y-"]

## Quảng trường lát đá quanh tâm thành (bán kính ô)
const QUANG_TRUONG := 5.5

## Công trình: [tên sprite, ô góc trên (x,y), xoay 0-3, (tuỳ chọn) nhà vào được — khoá trong NoiThat]
## Cỡ chân đế ở TheGioi.KICH; xoay 1/3 thì đổi rộng↔sâu.
const CONG_TRINH := [
	["dai_phun", Vector2i(55, 55), 0],
	# ── tây bắc: lò rèn + kho
	["nha_a", Vector2i(44, 50), 0, "lo_ren"],
	["nha_b", Vector2i(51, 43), 0, "kho"],
	["nha_a", Vector2i(42, 42), 0],
	["nha_b", Vector2i(46, 42), 3],
	["gia_vk", Vector2i(48, 50), 1],
	["de_ren", Vector2i(48, 52), 0],
	["thung", Vector2i(43, 52), 0],
	["hom", Vector2i(47, 54), 0],
	["hang_rao", Vector2i(41, 48), 0], ["hang_rao", Vector2i(42, 48), 0], ["hang_rao", Vector2i(43, 48), 0],
	# ── đông bắc: tháp pháp sư
	["thap_phap", Vector2i(62, 49), 0, "thap_phap"],
	["nha_a", Vector2i(66, 48), 0],
	["nha_b", Vector2i(58, 42), 3],
	["nha_a", Vector2i(65, 42), 1],
	["sap_cho", Vector2i(66, 53), 0],
	["hom", Vector2i(60, 50), 0],
	# ── tây nam: quán rượu
	["nha_c", Vector2i(50, 60), 1, "quan_ruou"],
	["nha_b", Vector2i(43, 58), 0],
	["nha_a", Vector2i(43, 64), 1],
	["thung", Vector2i(53, 65), 0], ["thung", Vector2i(52, 65), 0], ["hom", Vector2i(53, 66), 0],
	["ban", Vector2i(47, 61), 0], ["ghe", Vector2i(47, 62), 0], ["ghe", Vector2i(48, 61), 0],
	# ── đông nam: chợ
	["sap_cho", Vector2i(60, 61), 0],
	["sap_cho", Vector2i(63, 61), 0],
	["sap_cho", Vector2i(66, 61), 0],
	["sap_cho", Vector2i(60, 64), 1],
	["gieng", Vector2i(64, 65), 0],
	["thung", Vector2i(68, 64), 0], ["hom", Vector2i(69, 64), 0], ["hom", Vector2i(68, 65), 0],
	["nha_a", Vector2i(66, 67), 0],
	["nha_b", Vector2i(58, 68), 3],
	# ── đèn quanh quảng trường và dọc đại lộ
	["den", Vector2i(52, 52), 0], ["den", Vector2i(59, 52), 0], ["den", Vector2i(52, 59), 0], ["den", Vector2i(59, 59), 0],
	["den", Vector2i(57, 45), 0], ["den", Vector2i(57, 66), 0], ["den", Vector2i(45, 57), 0], ["den", Vector2i(66, 57), 0],
]

## Cây trong thành (ô)
const CAY := [Vector2i(42, 69), Vector2i(69, 41), Vector2i(41, 53), Vector2i(69, 69), Vector2i(48, 47), Vector2i(64, 46)]

## NPC ngoài trời: [tên, ô, bộ sprite, vai (NpcDuLieu.VAI), lang thang?]
const NPC := [
	["Lính Gác", Vector2i(69, 53), "hiep_si", "linh_gac", false],
	["Lính Gác", Vector2i(53, 69), "hiep_si", "linh_gac", false],
	["Lính Gác", Vector2i(42, 58), "hiep_si", "linh_gac", false],
	["Lính Gác", Vector2i(58, 42), "hiep_si", "linh_gac", false],
	["Bà Lena", Vector2i(54, 52), "npc_dan_a", "dan", true],
	["Ông Toma", Vector2i(58, 53), "npc_dan_b", "dan", true],
	["Cô Nell", Vector2i(61, 58), "npc_dan_c", "dan", true],
	["Gã Corr", Vector2i(52, 58), "npc_dan_b", "dan", true],
	["Lão Ben", Vector2i(63, 63), "npc_dan_a", "dan", true],
	["Bé Pip", Vector2i(57, 60), "npc_dan_c", "dan", true],
	["Cô Mae", Vector2i(46, 56), "npc_dan_a", "dan", true],
]

## Sông: chuỗi điểm ô; mỗi điểm vẽ nước bán kính `rong`. Cầu đặt ở chỗ đường cắt sông.
const SONG := [Vector2i(90, 0), Vector2i(88, 24), Vector2i(92, 48), Vector2i(89, 72), Vector2i(93, 96), Vector2i(91, 111)]
const SONG_RONG := 2.4

## Hồ phụ
const HO := [[Vector2i(18, 26), 5.0], [Vector2i(30, 92), 3.5]]

## Vùng quái theo khoảng cách (ô) từ tâm thành: [từ, tới, cấp thấp, cấp cao, số con, tên, màu, HỆ]
## Hệ là lớp Axie của đàn quái trong vòng đó — ba vòng ba nhóm của tam giác, nên không con Axie nào
## hợp cả ba vòng: đi càng xa càng có lý do đổi Axie (xem scripts/axie.gd).
const VUNG_QUAI := [
	[20, 30, 1, 3, 20, "Bọ Giáp", Color(1, 1, 1), "Bug"],
	[30, 41, 4, 7, 20, "Bọ Giáp Đỏ", Color(1.15, 0.70, 0.62), "Reptile"],
	[41, 55, 8, 12, 18, "Bọ Giáp Đen", Color(0.62, 0.62, 0.72), "Dawn"],
]

## Rừng: nhiễu theo hạt cố định; ô có nhiễu > NGUONG_RUNG thì mọc cây (ngoài đường, ngoài thành)
const NGUONG_RUNG := 0.28
const HAT := 20261005
