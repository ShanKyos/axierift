class_name NhanVat3D
extends Node3D
## Dark Knight 3D (mô hình tạm: KayKit Knight, CC0). Bấm đất để đi, giữ chuột để đi theo con trỏ,
## bấm mục tiêu để chạy tới và chém.
##
## ⚠ LUẬT CHÂN KHÔNG TRƯỢT, bản 3D: hoạt ảnh đi/chạy của gói art là "tại chỗ" — thân không tiến,
## bàn chân chống lùi về sau. Tốc độ di chuyển phải BẰNG ĐÚNG tốc độ bàn chân chống lùi lại, không
## thì chân trượt trên đất. Nên tốc độ KHÔNG khai tay: `do_toc_do()` đo nó thẳng từ bộ xương lúc
## nạp (lấy mẫu bàn chân đang chạm đất, đo nó lùi bao nhiêu mét mỗi giây). Muốn đi nhanh hơn thì
## tăng `speed_scale` của hoạt ảnh — tốc độ đi tự nhân theo, chân vẫn bám đất.

signal da_chet(ai)
signal ra_don(muc_tieu)                 # khung trúng đòn của nhát chém

const MO_HINH := "res://assets/mo_hinh/kaykit/nhan_vat/Knight.glb"
const HOAT := {"dung": "Idle", "di": "Walking_A", "chay": "Running_A",
	"chem": "1H_Melee_Attack_Slice_Diagonal", "trung": "Hit_A", "chet": "Death_A"}
const AN := ["1H_Sword_Offhand", "Rectangle_Shield", "Round_Shield", "Spike_Shield", "2H_Sword"]
const KHUNG_TRUNG := 0.42              # tỉ lệ thời gian nhát chém lúc lưỡi chạm mục tiêu
const XOAY_NHANH := 14.0               # rad/giây — quay người về hướng đi
const NHAP_CHAY := 1.0                 # nhịp chạy (×hoạt ảnh gốc) — tốc độ đi nhân theo cùng hệ số
const CHAM_DAT := 0.03                 # m: mũi chân cao hơn điểm thấp nhất của nó chừng này vẫn tính là chạm đất

static var _toc_do := {}               # tên hoạt ảnh → m/giây đo được (dùng chung mọi nhân vật cùng rig)

var mo_hinh: Node3D
var ap: AnimationPlayer
var sk: Skeleton3D
var duong: Array[Vector3] = []
var trang_thai := "dung"
var muc_tieu: Node3D = null
var tam_danh := 1.6
var chet := false
var hp := 100.0
var hp_max := 100.0
var _da_trung := false
var _huong := 0.0                      # góc quay quanh trục đứng (rad), 0 = nhìn về +Z


func _ready() -> void:
	mo_hinh = load(MO_HINH).instantiate()
	add_child(mo_hinh)
	ap = mo_hinh.find_children("*", "AnimationPlayer", true, false)[0]
	sk = mo_hinh.find_children("*", "Skeleton3D", true, false)[0]
	for ten in AN:
		var m := mo_hinh.find_child(ten, true, false)
		if m:
			m.visible = false
	for k in ["dung", "di", "chay"]:
		ap.get_animation(HOAT[k]).loop_mode = Animation.LOOP_LINEAR
	for m: MeshInstance3D in mo_hinh.find_children("*", "MeshInstance3D", true, false):
		m.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON
	if _toc_do.is_empty():
		_toc_do["di"] = do_toc_do(HOAT["di"])
		_toc_do["chay"] = do_toc_do(HOAT["chay"])
	ap.animation_finished.connect(_xong_hoat)
	_vao("dung")


## Đo tốc độ bàn chân chống lùi lại (m/giây) trong một hoạt ảnh tại chỗ.
##
## ⚠ CHỈ TÍNH LÚC MŨI CHÂN SÁT ĐẤT. Hoạt ảnh chạy có PHA BAY (cả hai chân rời đất) và mỗi bước chỉ
## chạm đất ~0,07 giây; bản đầu lấy "chân thấp hơn" làm chân chống nên gộp cả lúc chân đang lơ
## lửng, ra 1,07 m/s trong khi lúc chạm đất chân lùi ~4,5 m/s — đo được, chân trượt 0,45 m mỗi bước.
## Nay: quãng lùi cộng dồn của các đoạn chân sát đất ÷ thời gian các đoạn đó.
func do_toc_do(ten: String) -> float:
	var a := ap.get_animation(ten)
	var n := 240
	var dt := a.length / n
	var mau := []                                     # [z, y] của hai mũi chân mỗi mẫu
	var y_min := 1e9
	ap.play(ten)
	for i in n + 1:
		ap.seek(i * dt, true)
		sk.force_update_all_bone_transforms()
		var dong := []
		for ben in ["l", "r"]:
			var p := sk.get_bone_global_pose(sk.find_bone("toes." + ben)).origin
			dong.append(Vector2(p.z, p.y))
			y_min = minf(y_min, p.y)
		mau.append(dong)
	ap.stop()
	var quang := 0.0
	var thoi := 0.0
	for i in n:
		for k in 2:
			var p: Vector2 = mau[i][k]
			var q: Vector2 = mau[i + 1][k]
			if p.y < y_min + CHAM_DAT and q.y < y_min + CHAM_DAT:
				quang += p.x - q.x                         # chân chống lùi về −Z khi thân hướng +Z
				thoi += dt
	return quang / thoi * mo_hinh.scale.z if thoi > 0.0 else 0.0


func toc_do(k: String) -> float:
	return _toc_do.get(k, 0.0) * (NHAP_CHAY if k == "chay" else 1.0)


func _vao(k: String, ep := false) -> void:
	if k == trang_thai and not ep and ap.is_playing():
		return
	trang_thai = k
	ap.play(HOAT[k], 0.12)
	ap.speed_scale = NHAP_CHAY if k == "chay" else 1.0


func _xong_hoat(ten: StringName) -> void:
	if ten == HOAT["chem"] or ten == HOAT["trung"]:
		_vao("dung", true)


func dang_ban() -> bool:
	return (trang_thai == "chem" or trang_thai == "trung") and ap.is_playing()


func di_toi(duong_moi: Array[Vector3]) -> void:
	if chet:
		return
	muc_tieu = null
	duong = duong_moi


func danh(m: Node3D) -> void:
	if chet:
		return
	muc_tieu = m


## Một nhịp: di chuyển theo đường, quay người, chọn hoạt ảnh. Tách khỏi _process để bài kiểm lái
## được bằng nhịp cố định (và tự tua hoạt ảnh cùng nhịp — xem test_buoc.gd).
func buoc(dt: float) -> void:
	if chet:
		return
	if dang_ban():
		if trang_thai == "chem" and not _da_trung and ap.current_animation_position >= ap.current_animation_length * KHUNG_TRUNG:
			_da_trung = true
			ra_don.emit(muc_tieu)
		return
	if muc_tieu and is_instance_valid(muc_tieu):
		var d := muc_tieu.global_position - global_position
		d.y = 0
		if d.length() <= tam_danh:
			duong.clear()
			_quay_ve(d, 1.0)
			_huong = atan2(d.x, d.z)
			rotation.y = _huong
			_da_trung = false
			_vao("chem", true)
			return
		duong = [muc_tieu.global_position] as Array[Vector3]
	if duong.is_empty():
		_vao("dung")
		return
	var con := toc_do("chay") * dt
	while con > 0.0 and not duong.is_empty():
		var d := duong[0] - global_position
		d.y = 0
		var kc := d.length()
		if kc < 0.001:
			duong.remove_at(0)
			continue
		_quay_ve(d, dt)
		var b := minf(kc, con)
		global_position += d / kc * b
		con -= b
		if b >= kc:
			duong.remove_at(0)
	_vao("chay")


func _quay_ve(d: Vector3, dt: float) -> void:
	var dich := atan2(d.x, d.z)
	_huong = rotate_toward(_huong, dich, XOAY_NHANH * dt)
	rotation.y = _huong


func _process(dt: float) -> void:
	buoc(dt)


func nhan_sat_thuong(n: float) -> void:
	if chet:
		return
	hp = maxf(0.0, hp - n)
	if hp <= 0.0:
		chet = true
		duong.clear()
		_vao("chet", true)
		da_chet.emit(self)
	elif not dang_ban():
		_vao("trung", true)


## Điểm thế giới của bàn chân (mũi chân) — để bài kiểm đo trượt chân.
func ban_chan(ben: String) -> Vector3:
	return sk.global_transform * sk.get_bone_global_pose(sk.find_bone("toes." + ben)).origin
