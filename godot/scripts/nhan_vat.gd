class_name NhanVat
extends ThanThe
## Nhân vật người chơi — Dark Knight. Bấm đất để đi, bấm quái để đánh (giữ chuột là đi theo con trỏ).
##
## Bốn chỉ số kiểu MU: Sức Mạnh · Nhanh Nhẹn · Thể Lực · Năng Lượng. Con số là của game này,
## không chép bảng của MU (xem CLAUDE.md, mục pháp lý).

signal doi_chi_so
signal toi_npc(npc)          # đã tới đủ gần NPC vừa bấm — mở hội thoại
signal doi_do                # túi / trang bị / kho đổi
signal bi_danh               # vừa ăn một đòn (pet giật theo)
signal tung                  # vừa tung chiêu (pet gồng theo)
signal nhat_ky(chu, mau)     # một dòng cho nhật ký góc màn

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
var tam_noi := 100.0                 # đứng cách NPC chừng này (trên đất) là nói chuyện được — qua cả quầy
var muc_npc: Npc = null
## Túi: mảng TUI_O ô, mỗi ô {} (trống) hoặc {id, sl}. Trang bị: ô → id. Kho: như túi + Lumen.
var tui := []
var trang_bi := {"vu_khi": "", "giap": ""}
var kho := []
var kho_lumen := 0
var chieu_biet := {}
var axie := Axie.MAC_DINH            # con Axie đang đi theo — quyết định HỆ PHÒNG THỦ, 0 chỉ số
var _he_bay_ms := -INF               # mốc hồi của số bay khắc hệ (−∞: đòn ĐẦU TIÊN luôn nói ra)
var _chieu := ""                     # chiêu đang tung trong nhát chém hiện tại (rỗng = đòn thường)
var _hoi_chieu := 0.0
var _da_trung := false
var _hoi := 0.0


func _ready() -> void:
	ten_bo = "hiep_si"
	if tui.is_empty():
		tui.resize(VatPham.TUI_O)
		tui.fill({})
		kho.resize(VatPham.KHO_O)
		kho.fill({})
		trang_bi["vu_khi"] = "kiem_ngan"         # đồ khởi đầu: một thanh kiếm ngắn, năm bình máu
		them_do("binh_mau_nho", 5)
		lumen = 500
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
	var vk := VatPham.lay(trang_bi["vu_khi"])
	if not vk.is_empty():
		thap += vk["cong"][0]
		cao += vk["cong"][1]
	return randf_range(thap, cao)


## Khoảng sát thương đòn thường (thấp, cao) — để hiện lên bảng, cùng công thức với sat_thuong().
func sat_thuong_khoang() -> Vector2i:
	var vk := VatPham.lay(trang_bi["vu_khi"])
	var a: float = suc_manh / 5.0 + cap * 0.6 + (vk["cong"][0] if not vk.is_empty() else 0)
	var b: float = suc_manh / 3.2 + cap * 0.9 + (vk["cong"][1] if not vk.is_empty() else 0)
	return Vector2i(int(a), int(b))


func phong_thu() -> int:
	return int(VatPham.lay(trang_bi["giap"]).get("thu", 0)) + nhanh_nhen / 10


## Giáp trừ thẳng nửa phòng thủ, đòn nào cũng còn ít nhất 1. Rồi tới hệ phòng thủ của con Axie.
func nhan_sat_thuong(n: float, tu: Node2D) -> void:
	if chet:
		return
	var m := maxf(1.0, n - phong_thu() * 0.5)
	if tu is Quai:
		var kq := Axie.phong_thu(tu.he, Axie.lop(axie))
		m *= kq["he_so"]
		var bay_gio := Time.get_ticks_msec()
		if kq["ket"] != 0 and bay_gio - _he_bay_ms > 2600:      # có hồi, không thì tràn chữ giữa trận đông
			_he_bay_ms = bay_gio
			var chu := ("⚠ %s khắc %s" % [tu.he, Axie.lop(axie)]) if kq["ket"] < 0 else ("✦ %s chặn %s" % [Axie.lop(axie), tu.he])
			SoBay.tao(the_gioi.thuc_the, global_position + Vector2(0, -78), chu,
				Color(1, 0.45, 0.35) if kq["ket"] < 0 else Color(0.5, 0.95, 0.75))
	super.nhan_sat_thuong(m, tu)
	bi_danh.emit()


# ── túi đồ ──────────────────────────────────────────────────────────────────
## Thêm đồ vào túi: dồn vào chồng cùng loại trước, rồi ô trống. Trả số KHÔNG nhét được.
func them_do(id: String, sl := 1, vao := tui) -> int:
	var toi_da := VatPham.xep_toi_da(id)
	for o in vao.size():
		if sl <= 0:
			break
		var x: Dictionary = vao[o]
		if not x.is_empty() and x["id"] == id and x["sl"] < toi_da:
			var them := mini(sl, toi_da - x["sl"])
			vao[o] = {"id": id, "sl": x["sl"] + them}
			sl -= them
	for o in vao.size():
		if sl <= 0:
			break
		if vao[o].is_empty():
			var them := mini(sl, toi_da)
			vao[o] = {"id": id, "sl": them}
			sl -= them
	doi_do.emit()
	return sl


func dem_do(id: String) -> int:
	var n := 0
	for x in tui:
		if not x.is_empty() and x["id"] == id:
			n += x["sl"]
	return n


func bot_o(o: int, sl := 1, tu := tui) -> void:
	var x: Dictionary = tu[o]
	if x.is_empty():
		return
	tu[o] = {} if x["sl"] <= sl else {"id": x["id"], "sl": x["sl"] - sl}
	doi_do.emit()


## Bấm một ô túi khi không mở tiệm/kho: uống thuốc, mặc đồ, đọc sách. Trả câu báo (rỗng = xong êm).
func dung_o(o: int) -> String:
	var x: Dictionary = tui[o]
	if x.is_empty():
		return ""
	var d := VatPham.lay(x["id"])
	match d["loai"]:
		"thuoc":
			if d.has("hp"):
				hp = minf(hp_max, hp + d["hp"])
			if d.has("mp"):
				mp = minf(mp_max, mp + d["mp"])
			bot_o(o)
			doi_chi_so.emit()
		"vu_khi", "giap":
			if suc_manh < int(d.get("can_sm", 0)):
				return "Cần Sức Mạnh %d" % d["can_sm"]
			var ten_o := "vu_khi" if d["loai"] == "vu_khi" else "giap"
			var cu: String = trang_bi[ten_o]
			trang_bi[ten_o] = x["id"]
			tui[o] = {} if cu == "" else {"id": cu, "sl": 1}
			doi_do.emit()
			doi_chi_so.emit()
		"sach":
			if cap < int(d.get("can_cap", 1)):
				return "Cần cấp %d" % d["can_cap"]
			if chieu_biet.has(d["chieu"]):
				return "Đã học chiêu này rồi"
			chieu_biet[d["chieu"]] = true
			bot_o(o)
			return "Đã học %s — chuột phải để tung" % VatPham.CHIEU[d["chieu"]]["ten"]
	return ""


## Tháo một món đang mặc về túi.
func thao(ten_o: String) -> String:
	if trang_bi[ten_o] == "":
		return ""
	if them_do(trang_bi[ten_o], 1) > 0:
		return "Túi đầy"
	trang_bi[ten_o] = ""
	doi_do.emit()
	doi_chi_so.emit()
	return ""


## Phím Q / W: uống bình máu / mana nhỏ nhất đang có (như thanh thuốc của MU).
func uong(loai: String) -> void:
	if chet:
		return
	for id in (["binh_mau_nho", "binh_mau"] if loai == "hp" else ["binh_mana_nho", "binh_mana"]):
		for o in tui.size():
			if not tui[o].is_empty() and tui[o]["id"] == id:
				dung_o(o)
				return
	SoBay.tao(the_gioi.thuc_the, global_position + Vector2(0, -64), "Hết bình " + ("máu" if loai == "hp" else "mana"), Color(1, 0.6, 0.5))


# ── chiêu ───────────────────────────────────────────────────────────────────
## Chuột phải: tung chiêu đã học về phía `dich`. Không chiêu / thiếu mana / đang hồi thì báo ra.
func tung_chieu(dich: Vector2) -> void:
	if chet or dang_ban():
		return
	if chieu_biet.is_empty():
		SoBay.tao(the_gioi.thuc_the, global_position + Vector2(0, -64), "Chưa học chiêu nào", Color(0.8, 0.8, 0.8))
		return
	var id: String = chieu_biet.keys()[0]
	var c: Dictionary = VatPham.CHIEU[id]
	if _hoi_chieu > 0.0:
		return
	if mp < c["mp"]:
		SoBay.tao(the_gioi.thuc_the, global_position + Vector2(0, -64), "Thiếu mana", Color(0.5, 0.7, 1))
		return
	mp -= c["mp"]
	_hoi_chieu = c["hoi"]
	_chieu = id
	tung.emit()
	duong.clear()
	_quay(Iso.huong(dich - position, huong))
	_da_trung = false
	_vao("attack", true)
	doi_chi_so.emit()


func noi_voi(n: Npc) -> void:
	if chet or n == null:
		return
	muc_tieu = null
	muc_npc = n
	duong = the_gioi.tim_duong(position, n.position)



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
		nhat_ky.emit("Lên cấp %d!" % cap, Color(1, 0.85, 0.3))
	doi_chi_so.emit()


func di_toi(p: Vector2) -> void:
	if chet:
		return
	muc_tieu = null
	muc_npc = null
	duong = the_gioi.tim_duong(position, p)


func tan_cong(q: Quai) -> void:
	if chet or q == null or q.chet:
		return
	muc_tieu = q
	muc_npc = null


func _process(dt: float) -> void:
	if chet:
		return
	_hoi_chieu = maxf(0.0, _hoi_chieu - dt)
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
	if muc_npc and is_instance_valid(muc_npc):
		if Iso.kc_dat(position, muc_npc.position) <= tam_noi:
			duong.clear()
			_quay(Iso.huong(muc_npc.position - position, huong))
			var n := muc_npc
			muc_npc = null
			toi_npc.emit(n)
		elif duong.is_empty():
			muc_npc = null                            # không tới được — thôi
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
		if _chieu != "":
			var c: Dictionary = VatPham.CHIEU[_chieu]
			_chieu = ""
			VongChem.tao(get_parent(), position, c["tam"])
			for q: Quai in get_tree().get_nodes_in_group("quai"):
				if q.the_gioi == the_gioi and not q.chet and Iso.kc_dat(position, q.position) <= c["tam"]:
					q.nhan_sat_thuong(sat_thuong() * c["he"], self)
			return
		if muc_tieu and not muc_tieu.chet and Iso.kc_dat(position, muc_tieu.position) <= tam_danh + 14.0:
			muc_tieu.nhan_sat_thuong(sat_thuong(), self)


func _nhat_do() -> void:
	for d in get_tree().get_nodes_in_group("roi_do"):
		if d.get_parent() == get_parent() and Iso.kc_dat(position, d.position) < 22.0:
			lumen += d.so_luong
			SoBay.tao(the_gioi.thuc_the, d.position + Vector2(0, -12), "+%d Lumen" % d.so_luong, Color(1, 0.86, 0.35))
			nhat_ky.emit("Nhặt %d Lumen" % d.so_luong, Color(1, 0.86, 0.35))
			d.queue_free()
			doi_chi_so.emit()


func hoi_sinh(p: Vector2) -> void:
	chet = false
	position = p
	duong.clear()
	muc_tieu = null
	muc_npc = null
	tinh_chi_so(true)
	_vao("idle", true)
