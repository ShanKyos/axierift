class_name VatLyThan
extends Node2D
## Chuyển động VẬT LÝ cho một thân chỉ có art thở-đứng (gói Meowa Dark Knight: 13 khung, một hướng).
##
## Art không có khung đi / đánh / trúng đòn / ngã, nên thứ người chơi đọc ra là "đang chạy", "vừa
## chém", "vừa ăn đòn" phải đến từ chính cách cái THÂN chuyển động. Ba hệ, đều là phương trình
## chuyển động tích phân mỗi nhịp, không phải đường cong vẽ tay:
##
##   1. CON LẮC NGƯỢC neo ở bàn chân (góc `th`): cơ bắp kéo thân về góc đích (nghiêng vào hướng
##      chạy), còn QUÁN TÍNH của khung chậu thì kéo ngược lại — vừa xuất phát thân ngả ra sau, vừa
##      dừng lại thân chúi tới trước rồi mới đứng thẳng. Lúc chết thì cơ bắp tắt, chỉ còn trọng lực
##      `th'' = (g/L)·sin th` ⇒ đổ xuống nhanh dần đúng kiểu một cái cột mất chân chống.
##   2. LÒ XO NÉN – GIÃN `s` (tỉ lệ dọc): mỗi bước chân chạm đất là một xung nén; lấy đà là co lại,
##      lao tới là duỗi ra. Giữ thể tích: rộng ngang = 1 − s/2.
##   3. LÒ XO VỊ TRÍ `p` (dời thân khỏi gốc, px logic): cú lao khi chém, cú giật lùi khi trúng đòn.
##
## ⚠ MỌI PHÉP BIẾN HÌNH XOAY QUANH BÀN CHÂN — `hinh.offset` của ThanThe đã đặt điểm neo bàn chân
## trùng gốc node, nên chỉ cần ghi rotation/scale/position cho `hinh`, không phải dời tâm.
##
## ⚠ ĐƠN VỊ: px logic ↔ mét qua `bo.px_m` (35,96 px/m). Hằng số khai bằng MÉT và GIÂY để đọc ra
## được ý nghĩa vật lý; đừng đổi chúng sang px chép tay.

const G := 9.81            # m/s²
const L_TRONG_TAM := 0.9   # m — trọng tâm cách bàn chân (người cao ~1,8 m)
const KP_NGHIENG := 70.0   # độ cứng cơ giữ thân (1/s²)
const KD_NGHIENG := 13.0   # giảm chấn — dưới tới hạn (2√70 ≈ 16,7) nên còn một nhịp lắc nhỏ
const NGHIENG_THEO_TOC := 0.04   # rad nghiêng tới trước mỗi m/s vận tốc ngang
const QUAN_TINH := 0.24          # phần đổi vận tốc khung chậu truyền thành xoay thân
const KP_NEN := 260.0
const KD_NEN := 14.0
const KP_DOI := 140.0
const KD_DOI := 16.0
const BUOC_M := {"walk": 0.72, "run": 1.05}      # sải một bước chân (m)
const NHUN_M := {"walk": 0.035, "run": 0.06}     # trọng tâm nhấc lên giữa bước (m)
const HOI_NAY := 0.28                            # hệ số nảy lại khi thân đập xuống đất

## Hướng nhìn → vector màn hình (S, SW, W, NW, N, NE, E, SE), trục y màn hình chĩa xuống.
const HUONG_MAN := [Vector2(0, 1), Vector2(-1, 0.5), Vector2(-1, 0), Vector2(-1, -0.5),
	Vector2(0, -1), Vector2(1, -0.5), Vector2(1, 0), Vector2(1, 0.5)]

var than: ThanThe
var th := 0.0              # góc nghiêng (rad), dương = ngả sang phải màn hình
var om := 0.0
var s := 0.0               # nén/giãn dọc
var sv := 0.0
var p := Vector2.ZERO      # dời thân (px logic)
var pv := Vector2.ZERO
var _nhun := 0.0           # độ nhấc giữa bước (px logic)
var _pha_buoc := 0.0
var _vx := 0.0             # vận tốc ngang màn hình đã lọc (m/s)
var _cu := Vector2.INF
var _nga := false
var _nga_dau := 0.0        # chiều đổ: ±1
var _danh_t := -1.0        # giây kể từ lúc vào nhát chém, −1 = không chém
var _danh_lao := false
var _danh_huong := Vector2.RIGHT
var t_lao := -1.0         # giây trong nhát chém lúc lao tới (bài kiểm đọc)
var _chop := 0.0           # loé trắng khi trúng đòn
var _vet := -1.0           # vệt chém đang vẽ (giây), −1 = không


static func gan(t: ThanThe) -> VatLyThan:
	var v := VatLyThan.new()
	v.than = t
	v.name = "VatLy"
	v.z_index = 1
	t.add_child(v)
	return v


func _m(px: float) -> float:
	return px / than.bo.px_m


func _px(m: float) -> float:
	return m * than.bo.px_m


## ThanThe gọi khi đổi trạng thái hoạt ảnh.
func vao(tt: String) -> void:
	if tt == "attack":
		_danh_t = 0.0
		_danh_lao = false
		_danh_huong = HUONG_MAN[than.huong].normalized()
	elif tt == "idle" or tt == "walk" or tt == "run":
		_danh_t = -1.0
	if tt != "death" and _nga and not than.chet:
		_nga = false                 # hồi sinh: dựng thân dậy
		th = 0.0
		om = 0.0


## Trúng đòn: xung giật lùi theo hướng từ kẻ đánh tới mình, cộng một cú lắc thân.
func trung(tu: Node2D, nang: float) -> void:
	var lui := Vector2.ZERO
	if tu and is_instance_valid(tu):
		lui = (than.position - tu.position)
	if lui.length() < 0.01:
		lui = -_danh_huong
	lui = lui.normalized()
	var k := clampf(nang, 0.6, 1.0)          # đòn nhẹ nhất vẫn phải THẤY được
	pv += lui * _px(3.0) * k                  # ~3 m/s ⇒ dịch vài px rồi lò xo kéo về
	om += signf(lui.x if absf(lui.x) > 0.05 else 1.0) * 3.2 * k
	sv -= 2.0 * k
	_chop = 1.0


## Chết: tắt cơ, để trọng lực làm phần còn lại. Đổ ra xa kẻ ra đòn cuối.
func nga(tu: Node2D) -> void:
	_nga = true
	var x := 1.0
	if tu and is_instance_valid(tu):
		x = than.position.x - tu.position.x
	_nga_dau = 1.0 if x >= 0.0 else -1.0
	th = 0.04 * _nga_dau
	om = 1.6 * _nga_dau                       # cú đòn cuối đẩy thân lệch khỏi thế cân bằng
	_danh_t = -1.0


func _process(dt: float) -> void:
	if than == null or than.hinh == null:
		return
	# chia nhịp nhỏ cho ổn định: lò xo cứng 260 /s² với dt 1/30 là đã sát ngưỡng nổ của Euler
	var n := maxi(1, ceili(dt / 0.008))
	var h := dt / n
	var cu := _cu
	_cu = than.position
	var vx_moi := 0.0
	if cu != Vector2.INF and dt > 0.0:
		var d := than.position - cu
		if d.length() < 80.0:                 # dịch chuyển tức thời (cổng, hồi sinh) không tính
			vx_moi = _m(d.x) / dt
			_buoc(d, dt)
	# quán tính: vận tốc khung chậu đổi bao nhiêu thì thân bị "bỏ lại" bấy nhiêu
	var dv := vx_moi - _vx
	_vx = lerpf(_vx, vx_moi, 1.0 - exp(-dt * 18.0))
	if not _nga:
		om -= QUAN_TINH * dv / L_TRONG_TAM
	_danh(dt)
	for i in n:
		_tich_phan(h)
	_chop = maxf(0.0, _chop - dt * 6.0)
	if _vet >= 0.0:
		_vet += dt
		if _vet > 0.22:
			_vet = -1.0
	_ap()
	queue_redraw()


func _buoc(d: Vector2, _dt: float) -> void:
	var tt := than.trang_thai
	if not BUOC_M.has(tt):
		_nhun = lerpf(_nhun, 0.0, 0.3)
		return
	var buoc := _px(BUOC_M[tt])
	var truoc := _pha_buoc
	_pha_buoc += Iso.mo_nen(d).length() / buoc
	if floor(_pha_buoc) != floor(truoc):
		sv -= 1.4 if tt == "run" else 0.8      # bàn chân chạm đất: xung nén
	_nhun = _px(NHUN_M[tt]) * absf(sin(PI * _pha_buoc))


func _danh(dt: float) -> void:
	if _danh_t < 0.0:
		return
	_danh_t += dt
	var t_trung := float(than.bo.khung_trung("attack")) / than.bo.fps("attack")
	if not _danh_lao and _danh_t >= t_trung - 0.07:
		# lao tới ngay trước khung trúng: thân duỗi ra, ngả vào đòn, vệt chém bật lên
		_danh_lao = true
		t_lao = _danh_t
		pv += _danh_huong * _px(3.2)
		om += signf(_danh_huong.x if absf(_danh_huong.x) > 0.05 else 1.0) * 6.5
		sv += 2.6
		_vet = 0.0
	if _danh_t > t_trung + 0.5:
		_danh_t = -1.0


func _tich_phan(h: float) -> void:
	var a_th: float
	if _nga:
		a_th = (G / L_TRONG_TAM) * sin(th) - 0.6 * om
	else:
		var dich := NGHIENG_THEO_TOC * _vx
		if _danh_t >= 0.0 and not _danh_lao:
			# lấy đà: ngả NGƯỢC chiều đòn và hạ trọng tâm
			dich = -0.13 * signf(_danh_huong.x if absf(_danh_huong.x) > 0.05 else 1.0)
		a_th = -KP_NGHIENG * (th - dich) - KD_NGHIENG * om
	om += a_th * h
	th += om * h
	if _nga and absf(th) >= PI * 0.5:
		th = PI * 0.5 * signf(th)
		if absf(om) > 0.6:
			sv -= absf(om) * 0.5                 # đập đất: nén một cái
		om = -om * HOI_NAY
		if absf(om) < 0.4:
			om = 0.0
	var s_dich := -0.07 if (_danh_t >= 0.0 and not _danh_lao) else 0.0
	sv += (-KP_NEN * (s - s_dich) - KD_NEN * sv) * h
	s += sv * h
	s = clampf(s, -0.22, 0.22)
	pv += (-KP_DOI * p - KD_DOI * pv) * h
	p += pv * h


func _ap() -> void:
	var ty := than.bo.ty
	var hinh := than.hinh
	hinh.rotation = th
	hinh.scale = Vector2(1.0 - s * 0.5, 1.0 + s) * ty
	hinh.position = p + Vector2(0, -_nhun)
	var c := 1.0 + _chop * 0.9
	hinh.self_modulate = Color(c, c * 0.92, c * 0.92)
	if than.bong:
		# bóng ở lại trên đất: thân nhấc lên thì bóng co, thân đổ thì bóng kéo dài theo chiều đổ
		var lech := absf(sin(th))
		than.bong.scale = Vector2(1.0 + lech * 1.6, 1.0) * (1.0 - _nhun * 0.02)
		than.bong.position = Vector2(sin(th) * 14.0 + p.x, 1.0 + p.y)


## Vệt chém: một cung sáng quét qua phía trước thân, theo hướng đang nhìn.
func _draw() -> void:
	if _vet < 0.0:
		return
	var k := _vet / 0.22
	var huong := _danh_huong
	var goc_giua := huong.angle()
	var tam := Vector2(0, -26) + p
	var r := 30.0
	var quet := 2.4
	# quét từ TRÊN xuống: nhìn sang trái thì cung chạy ngược chiều kim đồng hồ
	var chieu := -1.0 if huong.x < -0.05 else 1.0
	var dau := goc_giua - quet * 0.5 * chieu
	var den := dau + quet * minf(1.0, k * 1.8) * chieu
	var a := 1.0 - k
	for i in 3:
		var w := 4.0 - i * 1.2
		draw_arc(tam, r - i * 2.0, minf(dau, den), maxf(dau, den), 24,
			Color(0.75, 0.88, 1.0, a * (0.9 - i * 0.25)), w, true)
