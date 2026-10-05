class_name BanDoArdhaven
## Bố cục map khởi đầu Ardhaven — thị trấn đá có tường, đồng cỏ quanh thành, quái mạnh dần theo
## khoảng cách. Tinh thần thị trấn tân thủ của MU Online, nhưng tên và bố cục là của game này.
##
## SỬA MAP Ở ĐÂY. Mọi toạ độ là Ô (x, y) trên lưới isometric:
##   trục x đi xuống-PHẢI trên màn hình, trục y đi xuống-TRÁI. Ô (0,0) ở đỉnh trên cùng của map.
## Muốn biết một chỗ là ô mấy: chạy game, giữ phím Alt — toạ độ ô dưới con trỏ hiện ở góc trái.

const CO := Vector2i(96, 96)

## Thành: hình chữ nhật trên lưới ô (x0, y0, rộng, cao). Viền là tường; bốn góc là tháp.
const THANH := Rect2i(38, 38, 20, 20)

## Cổng: mỗi cổng mở 2 ô giữa một cạnh tường. "x+" = cạnh xuống-phải, "y+" = cạnh xuống-trái…
const CONG := ["x+", "y+", "x-", "y-"]

## Công trình trong thành: [tên sprite, ô góc trên (x,y), xoay 0-3]
## nha_a 3×3 ô · nha_b 2×3 ô (xoay 1/3 thì thành 3×2) · dai_phun 2×2 · den 1×1
const CONG_TRINH := [
	["dai_phun", Vector2i(47, 47), 0],
	["nha_a", Vector2i(40, 40), 0],        # lò rèn
	["nha_a", Vector2i(53, 40), 1],        # quán thuốc
	["nha_b", Vector2i(40, 52), 0],        # tiệm phép
	["nha_b", Vector2i(52, 53), 1],        # nhà trọ
	["nha_a", Vector2i(40, 46), 3],
	["den", Vector2i(45, 45), 0],
	["den", Vector2i(51, 45), 0],
	["den", Vector2i(45, 51), 0],
	["den", Vector2i(51, 51), 0],
	["den", Vector2i(48, 41), 0],
	["den", Vector2i(48, 55), 0],
]

## NPC đứng chờ (chưa nói chuyện được ở M0 — chỉ đánh dấu chỗ đứng)
const NPC := [
	["Thợ Rèn Hald", Vector2i(44, 44)],
	["Bà Bán Thuốc", Vector2i(52, 44)],
	["Pháp Sư Ivo", Vector2i(44, 51)],
	["Lính Gác", Vector2i(55, 49)],
]

## Sông: chuỗi điểm ô; mỗi điểm vẽ nước bán kính `rong`. Cầu đặt ở chỗ đường cắt sông.
const SONG := [Vector2i(74, 0), Vector2i(72, 20), Vector2i(76, 40), Vector2i(73, 60), Vector2i(77, 80), Vector2i(75, 95)]
const SONG_RONG := 2.4

## Hồ phụ
const HO := [[Vector2i(18, 24), 5.0], [Vector2i(30, 80), 3.5]]

## Vùng quái theo khoảng cách (ô) từ tâm thành: [từ, tới, cấp thấp, cấp cao, số con, tên, màu]
const VUNG_QUAI := [
	[17, 27, 1, 3, 16, "Bọ Giáp", Color(1, 1, 1)],
	[27, 37, 4, 7, 16, "Bọ Giáp Đỏ", Color(1.15, 0.70, 0.62)],
	[37, 50, 8, 12, 14, "Bọ Giáp Đen", Color(0.62, 0.62, 0.72)],
]

## Rừng: nhiễu theo hạt cố định; ô có nhiễu > NGUONG_RUNG thì mọc cây (ngoài đường, ngoài thành)
const NGUONG_RUNG := 0.28
const HAT := 20261005
