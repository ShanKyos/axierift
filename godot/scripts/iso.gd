class_name Iso
## Phép chiếu isometric 2:1 dùng CHUNG cho map, chuyển động và sprite.
##
## Toạ độ node trong game là toạ độ MÀN HÌNH (px). Mặt đất bị nén dọc 1/2, nên muốn đi đều trên
## đất thì phải "mở nén" (y×2) trước khi đo quãng đường và "nén" lại trước khi dời node. Sprite
## được render bằng ĐÚNG phép chiếu này (camera nâng 30°: sin 30° = 0,5), nên sải chân đo trên
## sprite và quãng đường đi trên map dùng chung một thước — đó là điều kiện để chân không trượt.

const HUONG := ["S", "SW", "W", "NW", "N", "NE", "E", "SE"]


## Vector màn hình → vector trên mặt đất (đơn vị: px ngang màn hình).
static func mo_nen(v: Vector2) -> Vector2:
	return Vector2(v.x, v.y * 2.0)


## Vector trên mặt đất → vector màn hình.
static func nen(v: Vector2) -> Vector2:
	return Vector2(v.x, v.y * 0.5)


## Khoảng cách THẬT trên mặt đất giữa hai điểm màn hình.
static func kc_dat(a: Vector2, b: Vector2) -> float:
	return mo_nen(b - a).length()


## Chỉ số hướng sprite (0 = S … 7 = SE) cho một vector màn hình.
## Đo góc trên mặt đất đã mở nén: hướng chéo trên màn là đường 2:1, không phải 45°.
static func huong(v_man: Vector2, mac_dinh: int = 0) -> int:
	var g := mo_nen(v_man)
	if g.length_squared() < 0.0001:
		return mac_dinh
	var goc := atan2(g.y, g.x)                 # y hướng xuống: S = +90°
	return posmod(int(round((goc - PI / 2.0) / (PI / 4.0))), 8)


## Vector màn hình đơn vị (trên đất dài 1) của một hướng sprite.
static func vector_huong(i: int) -> Vector2:
	var goc := PI / 2.0 + i * PI / 4.0
	return nen(Vector2(cos(goc), sin(goc)))
