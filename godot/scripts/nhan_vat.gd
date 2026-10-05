class_name NhanVat
extends ThanThe
## Nhân vật người chơi — Dark Knight. Bấm đất để đi, bấm quái để đánh (giữ chuột là đi theo con trỏ).
##
## Bốn chỉ số kiểu MU: Sức Mạnh · Nhanh Nhẹn · Thể Lực · Năng Lượng. Con số là của game này,
## không chép bảng của MU (xem CLAUDE.md, mục pháp lý).

signal doi_chi_so

var cap := 1
var kinh_nghiem := 0
var lumen := 0
var suc_manh := 26
var nhanh_nhen := 20
var the_luc := 24
var nang_luong := 10
var mp := 20.0
var mp_max := 20.0
var muc_tieu: Quai = null
var tam_danh := 34.0                 # px trên mặt đất
var _da_trung := false
var _hoi := 0.0


func _ready() -> void:
	ten_bo = "hiep_si"
	super._ready()
	tinh_chi_so(true)


func tinh_chi_so(day := false) -> void:
	hp_max = 70.0 + the_luc * 3.0 + (cap - 1) * 6.0
	mp_max = 12.0 + nang_luong * 1.5 + (cap - 1) * 1.0
	if day:
		hp = hp_max
		mp = mp_max
	doi_chi_so.emit()


func sat_thuong() -> float:
	var thap := suc_manh / 5.0 + cap * 0.6
	var cao := suc_manh / 3.2 + cap * 0.9
	return randf_range(thap, cao)


func exp_can() -> int:
	return int(40.0 * pow(cap, 1.6))


func nhan_exp(n: int) -> void:
	kinh_nghiem += n
	while kinh_nghiem >= exp_can():
		kinh_nghiem -= exp_can()
		cap += 1
		suc_manh += 3
		nhanh_nhen += 2
		the_luc += 2
		nang_luong += 1
		tinh_chi_so(true)
		SoBay.tao(the_gioi.thuc_the, global_position + Vector2(0, -70), "LÊN CẤP %d" % cap, Color(1, 0.85, 0.3))
	doi_chi_so.emit()


func di_toi(p: Vector2) -> void:
	if chet:
		return
	muc_tieu = null
	duong = the_gioi.tim_duong(position, p)


func tan_cong(q: Quai) -> void:
	if chet or q == null or q.chet:
		return
	muc_tieu = q


func _process(dt: float) -> void:
	if chet:
		return
	_hoi += dt
	if _hoi >= 1.0:                                    # hồi máu/mana mỗi giây, nhanh hơn trong thành
		_hoi = 0.0
		var k := 3.0 if the_gioi.an_toan(position) else 1.0
		hp = minf(hp_max, hp + hp_max * 0.01 * k)
		mp = minf(mp_max, mp + mp_max * 0.03 * k)
		doi_chi_so.emit()
	if dang_ban():
		_xu_ly_don()
		return
	if muc_tieu and (not is_instance_valid(muc_tieu) or muc_tieu.chet):
		muc_tieu = null
	if muc_tieu:
		var kc := Iso.kc_dat(position, muc_tieu.position)
		if kc <= tam_danh:
			duong.clear()
			_quay(Iso.huong(muc_tieu.position - position, huong))
			_da_trung = false
			_vao("attack", true)
			return
		if duong.is_empty() or Iso.kc_dat(duong[duong.size() - 1], muc_tieu.position) > 20.0:
			duong = the_gioi.tim_duong(position, muc_tieu.position)
	if not duong.is_empty():
		buoc_di(dt, "run")
	elif trang_thai != "idle":
		_vao("idle")
	_nhat_do()


func _xu_ly_don() -> void:
	if trang_thai == "attack" and not _da_trung and hinh.frame >= bo.khung_trung("attack"):
		_da_trung = true
		if muc_tieu and not muc_tieu.chet and Iso.kc_dat(position, muc_tieu.position) <= tam_danh + 14.0:
			muc_tieu.nhan_sat_thuong(sat_thuong(), self)


func _nhat_do() -> void:
	for d in get_tree().get_nodes_in_group("roi_do"):
		if Iso.kc_dat(position, d.position) < 22.0:
			lumen += d.so_luong
			SoBay.tao(the_gioi.thuc_the, d.position + Vector2(0, -12), "+%d Lumen" % d.so_luong, Color(1, 0.86, 0.35))
			d.queue_free()
			doi_chi_so.emit()


func hoi_sinh(p: Vector2) -> void:
	chet = false
	position = p
	duong.clear()
	muc_tieu = null
	tinh_chi_so(true)
	_vao("idle", true)
