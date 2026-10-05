class_name Hud
extends Control
## HUD theo bố cục bản web Axie Rift, vẽ ở màn nội bộ 640×360 (đúng NỬA bản web 1280×720):
##
##   ┌ chân dung + máu/mana ┐┌ lực chiến ┐      tên vùng · nhãn vùng          ┌ ví Lumen ┐
##   └──────────────────────┘└───────────┘        thanh máu mục tiêu         │  RADAR   │
##                                                                           └──────────┘
##                                                                         nhật ký (góc dưới phải)
##                 ┌ Túi · Axie · Radar │ Chiêu │ Q · W ┐
##                 └──────── dải kinh nghiệm ───────────┘
##
## Art (khung gothic 9 lát, thanh máu/mana) là art CỦA BẢN WEB, pixel hoá bằng tools/ui/ui_pixel.py;
## icon ô dựng bằng tools/sprites/icon_do.py. ⚠ Chỉ đặt nút cho thứ ĐANG CÓ — một nút bấm vào không
## ra gì tệ hơn không có nút (bản web đã trả giá bài học đó).

signal bam_di(p: Vector2)          # bấm lên radar

const O := 24                      # cạnh một ô trên thanh dưới
const MAU_CHU := Color(0.95, 0.9, 0.8)
const MAU_VANG := Color(1, 0.84, 0.42)

var nv: NhanVat
var pet: PetAxie
var gd: GiaoDien
var radar: Radar
var _f: Font
var _khung: Texture2D
var _hp: Texture2D
var _hp_rong: Texture2D
var _mp: Texture2D
var _mp_rong: Texture2D
var _xu: Texture2D
var _ic := {}
var _thanh := Rect2()              # thanh dưới
var _o := []                       # [{ten, rect, phim, icon}]
var _radar_khung := Rect2()
var _nhat_ky := []                 # [{chu, mau, t}]
var _ten_vung := ""
var _ten_vung_t := 0.0


func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_f = get_theme_default_font()
	_khung = load("res://assets/ui/khung_bang.png")
	_hp = load("res://assets/ui/thanh_hp.png")
	_hp_rong = load("res://assets/ui/thanh_hp_rong.png")
	_mp = load("res://assets/ui/thanh_mp.png")
	_mp_rong = load("res://assets/ui/thanh_mp_rong.png")
	_xu = load("res://assets/ui/xu_vang.png")
	for t in ["tui", "ban_do", "chieu_chem_xoay", "binh_mau_nho", "binh_mana_nho"]:
		_ic[t] = load("res://assets/sprites/icon_do/%s.png" % t)
	_bo_cuc()


## Đặt vị trí mọi khối theo cỡ màn hiện tại (640×360 nội bộ).
func _bo_cuc() -> void:
	var w := 640.0
	var h := 360.0
	var ds := [["tui", "I", "Túi đồ (I)"], ["axie", "P", "Axie đi theo (P)"], ["radar", "M", "Bật/tắt radar (M)"],
		["", "", ""], ["chieu", "1", "Chiêu: Chém Xoáy — phím 1 hoặc chuột phải (quét về phía con trỏ)"], ["", "", ""],
		["hp", "Q", "Uống bình máu (Q)"], ["mp", "W", "Uống bình mana (W)"]]
	var rong := 0.0
	for x in ds:
		rong += 10.0 if x[0] == "" else O + 3.0
	rong += 10.0
	_thanh = Rect2(floor((w - rong) / 2.0), h - 40, rong, 30)
	var x0 := _thanh.position.x + 6
	_o.clear()
	for x in ds:
		if x[0] == "":
			x0 += 10
			continue
		var r := Rect2(x0, _thanh.position.y + 3, O, O)
		_o.append({"ten": x[0], "rect": r, "phim": x[1]})
		var b := Button.new()                                # nút trong suốt đè lên ô — chuột trái bấm được
		b.flat = true
		b.focus_mode = Control.FOCUS_NONE
		b.position = r.position
		b.size = r.size
		b.tooltip_text = x[2]
		b.mouse_filter = Control.MOUSE_FILTER_STOP
		b.pressed.connect(_bam_o.bind(x[0]))
		add_child(b)
		x0 += O + 3
	_radar_khung = Rect2(w - 108, 18, 104, 82)
	radar = Radar.new()
	radar.position = _radar_khung.position + Vector2(7, 7)
	radar.size = Vector2(90, 58)
	radar.bam_di.connect(func(p): bam_di.emit(p))
	add_child(radar)


func dat(nv_: NhanVat, pet_: PetAxie, gd_: GiaoDien) -> void:
	nv = nv_
	pet = pet_
	gd = gd_
	radar.nv = nv
	radar.pet = pet


func _bam_o(ten: String) -> void:
	match ten:
		"tui": gd.bat_tat_tui()
		"axie": gd.bat_tat_axie()
		"radar": bat_tat_radar()
		"hp": nv.uong("hp")
		"mp": nv.uong("mp")
		"chieu":
			if nv.chieu_biet.is_empty():
				gd.bao("Chưa học chiêu — mua Sách Chém Xoáy ở Tháp Pháp Sư")
			else:
				nv.tung_chieu(nv.get_global_mouse_position())


func bat_tat_radar() -> void:
	radar.visible = not radar.visible


## Một dòng vào nhật ký góc dưới phải (hạ quái, nhặt đồ, lên cấp…). Tự mờ sau vài giây.
func ghi(chu: String, mau := MAU_CHU) -> void:
	_nhat_ky.push_front({"chu": chu, "mau": mau, "t": 7.0})
	if _nhat_ky.size() > 6:
		_nhat_ky.pop_back()


func _process(dt: float) -> void:
	for d in _nhat_ky:
		d["t"] -= dt
	while not _nhat_ky.is_empty() and _nhat_ky[-1]["t"] <= 0.0:
		_nhat_ky.pop_back()
	if nv and nv.the_gioi and nv.the_gioi.ten_map != _ten_vung:
		_ten_vung = nv.the_gioi.ten_map
		_ten_vung_t = 0.0
	_ten_vung_t += dt
	queue_redraw()


# ── tiện ích vẽ ─────────────────────────────────────────────────────────────
func _khung9(r: Rect2, le := 10) -> void:
	var s := Vector2(_khung.get_size())
	var L := float(le)
	var xs := [0.0, L, s.x - L, s.x]
	var ys := [0.0, L, s.y - L, s.y]
	var xd := [r.position.x, r.position.x + L, r.end.x - L, r.end.x]
	var yd := [r.position.y, r.position.y + L, r.end.y - L, r.end.y]
	for j in 3:
		for i in 3:
			var nguon := Rect2(xs[i], ys[j], xs[i + 1] - xs[i], ys[j + 1] - ys[j])
			var dich := Rect2(xd[i], yd[j], xd[i + 1] - xd[i], yd[j + 1] - yd[j])
			draw_texture_rect_region(_khung, dich, nguon)


func _chu(p: Vector2, s: String, mau := MAU_CHU, canh := HORIZONTAL_ALIGNMENT_LEFT, rong := -1.0) -> void:
	draw_string_outline(_f, p, s, canh, rong, 8, 2, Color(0.03, 0.02, 0.04))
	draw_string(_f, p, s, canh, rong, 8, mau)


## Thanh máu/mana kiểu bản web: tranh RỖNG làm nền, tranh ĐẦY cắt theo tỉ lệ — thanh VƠI đi, không co lại.
func _thanh_art(day: Texture2D, rong: Texture2D, p: Vector2, ty: float) -> void:
	draw_texture(rong, p)
	var w := floorf(day.get_width() * clampf(ty, 0.0, 1.0))
	if w > 0:
		draw_texture_rect_region(day, Rect2(p, Vector2(w, day.get_height())), Rect2(0, 0, w, day.get_height()))


func luc_chien() -> int:
	var st := nv.sat_thuong_khoang()
	return int((st.x + st.y) * 4.0 + nv.hp_max * 0.8 + nv.mp_max * 0.5 + nv.phong_thu() * 12.0 + nv.cap * 10.0)


func _draw() -> void:
	if nv == null:
		return
	var w := 640.0
	# ── chân dung + máu/mana
	_khung9(Rect2(4, 4, 136, 42))
	var cd := Rect2(10, 10, 30, 30)
	draw_rect(cd, Color(0.06, 0.05, 0.07))
	Axie.ve_dau(self, nv.axie, cd)
	draw_rect(cd, Color(0.62, 0.48, 0.24), false, 1.0)
	_chu(Vector2(44, 16), "Dark Knight", MAU_VANG)
	_chu(Vector2(44, 16), "LV.%d" % nv.cap, MAU_CHU, HORIZONTAL_ALIGNMENT_RIGHT, 90)
	_thanh_art(_hp, _hp_rong, Vector2(44, 19), nv.hp / nv.hp_max)
	_chu(Vector2(44, 29), "%d / %d" % [int(nv.hp), int(nv.hp_max)], Color(1, 0.92, 0.9), HORIZONTAL_ALIGNMENT_CENTER, 80)
	_thanh_art(_mp, _mp_rong, Vector2(44, 32), nv.mp / nv.mp_max)
	_chu(Vector2(44, 40), "%d / %d" % [int(nv.mp), int(nv.mp_max)], Color(0.85, 0.92, 1), HORIZONTAL_ALIGNMENT_CENTER, 80)
	# ── lực chiến
	_khung9(Rect2(142, 4, 60, 42))
	_chu(Vector2(142, 20), "LỰC CHIẾN", Color(0.8, 0.74, 0.6), HORIZONTAL_ALIGNMENT_CENTER, 60)
	_chu(Vector2(142, 33), str(luc_chien()), MAU_VANG, HORIZONTAL_ALIGNMENT_CENTER, 60)
	# ── tên vùng + nhãn vùng (giữa trên)
	var tg := nv.the_gioi
	_chu(Vector2(0, 14), tg.ten_map, Color(1, 0.9, 0.7), HORIZONTAL_ALIGNMENT_CENTER, w)
	var he := tg.he_tai(nv.position)
	var nhan := "An Toàn" if tg.an_toan(nv.position) else ("Vùng %s" % he if he != "" else "Hoang Dã")
	var mau_nhan := Color(0.55, 0.95, 0.6) if tg.an_toan(nv.position) else Color(1, 0.6, 0.45)
	var nw := _f.get_string_size(nhan, HORIZONTAL_ALIGNMENT_LEFT, -1, 8).x + 10
	var nr := Rect2(floor((w - nw) / 2.0), 17, nw, 11)
	draw_rect(nr, Color(0.05, 0.05, 0.06, 0.8))
	draw_rect(nr, mau_nhan.darkened(0.3), false, 1.0)
	_chu(Vector2(nr.position.x, 26), nhan, mau_nhan, HORIZONTAL_ALIGNMENT_CENTER, nw)
	# ── mục tiêu
	var q := nv.muc_tieu
	if q and is_instance_valid(q) and not q.chet:
		var tw := 120.0
		var tx := (w - tw) / 2.0
		draw_rect(Rect2(tx - 1, 33, tw + 2, 7), Color(0.1, 0.08, 0.08))
		draw_rect(Rect2(tx, 34, tw * q.hp / q.hp_max, 5), Color(0.75, 0.15, 0.12))
		_chu(Vector2(tx - 60, 50), "%s  Cấp %d  · %s" % [q.ten_hien, q.cap, q.he], MAU_CHU, HORIZONTAL_ALIGNMENT_CENTER, tw + 120)
	# ── ví Lumen + radar (phải trên)
	var vi := Rect2(w - 108, 4, 104, 12)
	draw_rect(vi, Color(0.05, 0.05, 0.06, 0.85))
	draw_rect(vi, Color(0.4, 0.32, 0.18), false, 1.0)
	draw_texture(_xu, vi.position + Vector2(2, 1))
	_chu(Vector2(vi.position.x, 13), str(nv.lumen), MAU_VANG, HORIZONTAL_ALIGNMENT_RIGHT, vi.size.x - 4)
	if radar.visible:
		_khung9(_radar_khung)
		_chu(Vector2(_radar_khung.position.x, _radar_khung.end.y - 7), tg.ten_map, Color(0.85, 0.8, 0.7), HORIZONTAL_ALIGNMENT_CENTER, _radar_khung.size.x)
	# ── thanh dưới
	_khung9(_thanh, 9)
	for o in _o:
		_ve_o(o)
	# dải kinh nghiệm ngay dưới thanh, bằng ngang thanh
	var ex := Rect2(_thanh.position.x, _thanh.end.y + 1, _thanh.size.x, 8)
	draw_rect(ex, Color(0.06, 0.05, 0.06, 0.9))
	draw_rect(Rect2(ex.position + Vector2(1, 1), Vector2((ex.size.x - 2) * float(nv.kinh_nghiem) / nv.exp_can(), 6)), Color(0.62, 0.48, 0.16))
	_chu(Vector2(ex.position.x, ex.end.y - 1), "%d / %d EXP" % [nv.kinh_nghiem, nv.exp_can()], Color(1, 0.95, 0.85), HORIZONTAL_ALIGNMENT_CENTER, ex.size.x)
	# ── nhật ký (phải dưới)
	var y := 300.0
	for d in _nhat_ky:
		var a := clampf(d["t"] / 1.5, 0.0, 1.0)
		var mau: Color = d["mau"]
		mau.a = a
		_chu(Vector2(w - 220, y), d["chu"], mau, HORIZONTAL_ALIGNMENT_RIGHT, 214)
		y -= 10
	# ── gỡ rối + chết
	if Input.is_key_pressed(KEY_ALT):
		var c := tg.o_cua(nv.get_global_mouse_position())
		_chu(Vector2(6, 60), "ô (%d, %d)  %s" % [c.x, c.y, tg.loai_o(c)], Color(1, 1, 0.6))
	if nv.chet:
		_chu(Vector2(0, 180), "Ngươi đã gục — hồi sinh ở thành sau 3 giây", Color(1, 0.7, 0.6), HORIZONTAL_ALIGNMENT_CENTER, w)


func _ve_o(o: Dictionary) -> void:
	var r: Rect2 = o["rect"]
	draw_rect(r, Color(0.07, 0.06, 0.07))
	var tex: Texture2D = null
	var so := -1
	var mo := false
	match o["ten"]:
		"tui": tex = _ic["tui"]
		"radar": tex = _ic["ban_do"]; mo = not radar.visible
		"hp": tex = _ic["binh_mau_nho"]; so = nv.dem_do("binh_mau_nho") + nv.dem_do("binh_mau")
		"mp": tex = _ic["binh_mana_nho"]; so = nv.dem_do("binh_mana_nho") + nv.dem_do("binh_mana")
		"chieu": tex = _ic["chieu_chem_xoay"]; mo = nv.chieu_biet.is_empty()
	if o["ten"] == "axie":
		Axie.ve_dau(self, nv.axie, r.grow(-1))
	elif tex:
		draw_texture_rect_region(tex, r, Rect2(4, 4, O, O), Color(1, 1, 1, 0.35) if mo or so == 0 else Color.WHITE)
	if o["ten"] == "chieu" and not nv.chieu_biet.is_empty() and nv._hoi_chieu > 0.0:
		var k: float = nv._hoi_chieu / VatPham.CHIEU["chem_xoay"]["hoi"]
		draw_rect(Rect2(r.position, Vector2(O, O * k)), Color(0, 0, 0, 0.6))
	draw_rect(r, Color(0.45, 0.36, 0.2), false, 1.0)
	draw_string_outline(_f, r.position + Vector2(2, 8), o["phim"], HORIZONTAL_ALIGNMENT_LEFT, -1, 8, 2, Color(0, 0, 0))
	draw_string(_f, r.position + Vector2(2, 8), o["phim"], HORIZONTAL_ALIGNMENT_LEFT, -1, 8, Color(1, 0.92, 0.7))
	if so >= 0:
		_chu(r.position + Vector2(0, O - 1), str(so), Color(1, 1, 0.85), HORIZONTAL_ALIGNMENT_RIGHT, O - 1)
