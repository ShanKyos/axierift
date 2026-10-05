class_name GiaoDien
extends Control
## Các bảng kiểu MU: hội thoại NPC, cửa hàng, kho đồ, túi đồ (phím I).
##
## Bảng nào đang mở thì ô túi đổi nghĩa — như MU: mở tiệm thì bấm ô là BÁN, mở kho thì bấm ô là
## GỬI, không mở gì thì bấm ô là DÙNG (uống / mặc / đọc). Dòng gợi ý dưới túi luôn nói đúng nghĩa
## đang có, để người chơi không phải đoán.

const O := 34                         # cạnh một ô đồ (px)
const MAU_VIEN := Color(0.62, 0.48, 0.24)
const MAU_NEN := Color(0.07, 0.06, 0.08, 0.94)

var nv: NhanVat
var pet: PetAxie
var npc: Npc = null                   # đang nói chuyện / giao dịch với ai
var che_do := ""                      # "" · "mua" · "kho"

var _thoai: PanelContainer
var _thoai_ten: Label
var _thoai_loi: Label
var _thoai_nut: HBoxContainer
var _tiem: PanelContainer
var _tiem_tieu: Label
var _tiem_luoi: GridContainer
var _kho: PanelContainer
var _kho_luoi: GridContainer
var _kho_lumen: Label
var _tui: PanelContainer
var _tui_luoi: GridContainer
var _tui_vk: Button
var _tui_giap: Button
var _tui_chi_so: Label
var _tui_lumen: Label
var _tui_goi_y: Label
var _axie: PanelContainer
var _axie_luoi: GridContainer
var _axie_dat: Label
var _bao: Label
var _bao_t := 0.0
static var _icon := {}


func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	theme = Theme.new()
	theme.default_font_size = 8                     # màn vẽ nội bộ 640×360: chữ 8 px là chữ "thường"
	_dung_thoai()
	_dung_tiem()
	_dung_kho()
	_dung_tui()
	_dung_axie()
	_bao = Label.new()
	_bao.add_theme_color_override("font_color", Color(1, 0.9, 0.6))
	_bao.add_theme_color_override("font_outline_color", Color(0, 0, 0))
	_bao.add_theme_constant_override("outline_size", 2)
	_bao.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_bao.position = Vector2(0, 58)
	_bao.size = Vector2(640, 12)
	var nen := StyleBoxFlat.new()                   # nền tối sau chữ: chữ vàng trên đồng cỏ sáng thì chìm
	nen.bg_color = Color(0.04, 0.03, 0.05, 0.78)
	nen.border_color = Color(0.45, 0.35, 0.18)
	nen.set_border_width_all(1)
	nen.content_margin_left = 6
	nen.content_margin_right = 6
	nen.content_margin_top = 1
	nen.content_margin_bottom = 1
	_bao.add_theme_stylebox_override("normal", nen)
	_bao.modulate.a = 0.0                           # chưa có câu nào: nền tối KHÔNG được hiện thành một dải trống
	_bao.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_bao)
	nv.doi_do.connect(ve_lai)
	nv.doi_chi_so.connect(ve_lai)


# ── dựng khung ──────────────────────────────────────────────────────────────
static func hop(w: float, h: float) -> PanelContainer:
	var p := PanelContainer.new()
	var st := StyleBoxFlat.new()
	st.bg_color = MAU_NEN
	st.border_color = MAU_VIEN
	st.set_border_width_all(1)
	st.set_content_margin_all(6)
	st.shadow_color = Color(0, 0, 0, 0.5)
	st.shadow_size = 2
	p.add_theme_stylebox_override("panel", st)
	p.custom_minimum_size = Vector2(w, h)
	p.size = Vector2(w, h)
	p.mouse_filter = Control.MOUSE_FILTER_STOP
	p.visible = false
	return p


static func nhan(chu: String, mau := Color(0.92, 0.88, 0.80)) -> Label:
	var l := Label.new()
	l.text = chu
	l.add_theme_color_override("font_color", mau)
	return l


static func nut(chu: String) -> Button:
	var b := Button.new()
	b.text = chu
	b.focus_mode = Control.FOCUS_NONE
	for ten in ["normal", "hover", "pressed"]:
		var st := StyleBoxFlat.new()
		st.bg_color = {"normal": Color(0.18, 0.14, 0.10), "hover": Color(0.30, 0.22, 0.12), "pressed": Color(0.42, 0.30, 0.14)}[ten]
		st.border_color = MAU_VIEN
		st.set_border_width_all(1)
		st.set_content_margin_all(3)
		st.content_margin_left = 8
		st.content_margin_right = 8
		b.add_theme_stylebox_override(ten, st)
	b.add_theme_color_override("font_color", Color(1, 0.9, 0.7))
	return b


static func o_do(w := O, h := O) -> Button:
	var b := Button.new()
	b.custom_minimum_size = Vector2(w, h)
	b.focus_mode = Control.FOCUS_NONE
	b.icon_alignment = HORIZONTAL_ALIGNMENT_CENTER
	b.vertical_icon_alignment = VERTICAL_ALIGNMENT_TOP
	b.expand_icon = false
	for ten in ["normal", "hover", "pressed", "disabled"]:
		var st := StyleBoxFlat.new()
		st.bg_color = Color(0.12, 0.10, 0.11)
		st.border_color = MAU_VIEN if ten == "hover" else Color(0.32, 0.26, 0.18)
		st.set_border_width_all(1)
		st.set_content_margin_all(1)
		b.add_theme_stylebox_override(ten, st)
	var sl := Label.new()
	sl.name = "SoLuong"
	sl.add_theme_color_override("font_color", Color(1, 1, 0.85))
	sl.add_theme_color_override("font_outline_color", Color(0, 0, 0))
	sl.add_theme_constant_override("outline_size", 2)
	sl.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	sl.vertical_alignment = VERTICAL_ALIGNMENT_BOTTOM
	sl.set_anchors_preset(Control.PRESET_FULL_RECT)
	sl.offset_right = -2
	sl.mouse_filter = Control.MOUSE_FILTER_IGNORE
	b.add_child(sl)
	b.add_theme_color_override("font_color", Color(1, 0.85, 0.4))
	b.add_theme_color_override("font_disabled_color", Color(0.6, 0.45, 0.35))
	return b


static func icon(id: String) -> Texture2D:
	if id == "":
		return null
	var ten: String = VatPham.lay(id).get("icon", "")
	if not _icon.has(ten):
		_icon[ten] = load("res://assets/sprites/icon_do/%s.png" % ten)
	return _icon[ten]


func _dung_thoai() -> void:
	_thoai = hop(330, 70)
	_thoai.position = Vector2((640 - 330) / 2.0, 320 - 78)          # ngay trên thanh dưới của HUD
	var v := VBoxContainer.new()
	_thoai.add_child(v)
	_thoai_ten = nhan("", Color(1, 0.82, 0.38))
	v.add_child(_thoai_ten)
	_thoai_loi = nhan("")
	_thoai_loi.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_thoai_loi.custom_minimum_size = Vector2(316, 22)
	v.add_child(_thoai_loi)
	_thoai_nut = HBoxContainer.new()
	_thoai_nut.alignment = BoxContainer.ALIGNMENT_END
	v.add_child(_thoai_nut)
	add_child(_thoai)


func _dung_tiem() -> void:
	_tiem = hop(300, 140)
	_tiem.position = Vector2(8, 50)
	var v := VBoxContainer.new()
	_tiem.add_child(v)
	_tiem_tieu = nhan("", Color(1, 0.82, 0.38))
	v.add_child(_tiem_tieu)
	_tiem_luoi = GridContainer.new()
	_tiem_luoi.columns = 6
	v.add_child(_tiem_luoi)
	v.add_child(nhan("Bấm món để MUA · bấm ô túi để BÁN (Shift: cả chồng)", Color(0.7, 0.7, 0.65)))
	var dong := nut("Đóng")
	dong.pressed.connect(dong_het)
	v.add_child(dong)
	add_child(_tiem)


func _dung_kho() -> void:
	_kho = hop(300, 240)
	_kho.position = Vector2(8, 50)
	var v := VBoxContainer.new()
	_kho.add_child(v)
	v.add_child(nhan("Kho Đồ", Color(1, 0.82, 0.38)))
	_kho_luoi = GridContainer.new()
	_kho_luoi.columns = 8
	_kho_luoi.add_theme_constant_override("h_separation", 1)
	_kho_luoi.add_theme_constant_override("v_separation", 1)
	v.add_child(_kho_luoi)
	for i in VatPham.KHO_O:
		var b := o_do()
		b.pressed.connect(_bam_kho.bind(i))
		_kho_luoi.add_child(b)
	_kho_lumen = nhan("")
	v.add_child(_kho_lumen)
	var h := HBoxContainer.new()
	v.add_child(h)
	for x in [["Gửi 100", 100], ["Gửi hết", -1], ["Rút hết", -2]]:
		var b := nut(x[0])
		b.pressed.connect(_lumen_kho.bind(x[1]))
		h.add_child(b)
	var dong := nut("Đóng")
	dong.pressed.connect(dong_het)
	h.add_child(dong)
	add_child(_kho)


func _dung_tui() -> void:
	_tui = hop(300, 250)
	_tui.position = Vector2(640 - 308, 50)
	var v := VBoxContainer.new()
	_tui.add_child(v)
	v.add_child(nhan("Túi Đồ  (I)", Color(1, 0.82, 0.38)))
	var h := HBoxContainer.new()
	v.add_child(h)
	_tui_vk = o_do(40, 40)
	_tui_vk.tooltip_text = "Vũ khí"
	_tui_vk.pressed.connect(_bam_mac.bind("vu_khi"))
	h.add_child(_tui_vk)
	_tui_giap = o_do(40, 40)
	_tui_giap.tooltip_text = "Giáp"
	_tui_giap.pressed.connect(_bam_mac.bind("giap"))
	h.add_child(_tui_giap)
	_tui_chi_so = nhan("")
	h.add_child(_tui_chi_so)
	_tui_luoi = GridContainer.new()
	_tui_luoi.columns = 8
	_tui_luoi.add_theme_constant_override("h_separation", 1)
	_tui_luoi.add_theme_constant_override("v_separation", 1)
	v.add_child(_tui_luoi)
	for i in VatPham.TUI_O:
		var b := o_do()
		b.gui_input.connect(_bam_tui.bind(i))
		_tui_luoi.add_child(b)
	_tui_lumen = nhan("", Color(1, 0.85, 0.4))
	v.add_child(_tui_lumen)
	_tui_goi_y = nhan("", Color(0.7, 0.7, 0.65))
	v.add_child(_tui_goi_y)
	add_child(_tui)


## Bảng chọn Axie (phím P): 16 con, mỗi ô nói ngay con đó ở ĐẤT ĐANG ĐỨNG thì thế nào — để người
## chơi khỏi phải tự nhẩm tam giác trong đầu.
func _dung_axie() -> void:
	_axie = hop(316, 260)
	_axie.position = Vector2(8, 50)
	var v := VBoxContainer.new()
	_axie.add_child(v)
	v.add_child(nhan("Axie đi theo  (P) — 0 chỉ số, quyết định hệ phòng thủ", Color(1, 0.82, 0.38)))
	_axie_dat = nhan("")
	_axie_dat.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_axie_dat.custom_minimum_size = Vector2(300, 20)
	v.add_child(_axie_dat)
	_axie_luoi = GridContainer.new()
	_axie_luoi.columns = 4
	_axie_luoi.add_theme_constant_override("h_separation", 2)
	_axie_luoi.add_theme_constant_override("v_separation", 2)
	v.add_child(_axie_luoi)
	for id in Axie.ds():
		var b := o_do(74, 46)
		b.name = id
		b.icon = Axie.icon(id)
		b.expand_icon = true                       # khung HD to hơn ô nút — co cho vừa
		b.text = Axie.lop(id)                     # tên con ở dòng gợi ý khi rê chuột; lớp mới là thứ phải so
		b.add_theme_font_size_override("font_size", 8)
		b.pressed.connect(_chon_axie.bind(id))
		_axie_luoi.add_child(b)
	var dong := nut("Đóng")
	dong.pressed.connect(dong_het)
	v.add_child(dong)
	add_child(_axie)


func bat_tat_axie() -> void:
	if _axie.visible:
		_axie.visible = false
		return
	dong_het()
	_axie.visible = true
	_ve_axie()


func _chon_axie(id: String) -> void:
	nv.axie = id
	pet.doi(id)
	bao("%s đi theo — hệ phòng thủ: %s" % [Axie.meta()[id]["ten"], Axie.lop(id)])
	_ve_axie()


func _ve_axie() -> void:
	var he := nv.the_gioi.he_tai(nv.position)
	if he == "":
		_axie_dat.text = "Đang ở nơi an toàn — không có hệ trội. Ra ngoài thành, mỗi vòng quái một hệ."
	else:
		_axie_dat.text = "Đất này hệ %s · khắc lại nó: %s" % [he, " · ".join(Axie.khac_lai(he))]
	for b: Button in _axie_luoi.get_children():
		var id := String(b.name)
		var mau := Color(0.92, 0.88, 0.8)
		var ghi := ""
		if he != "":
			var k: int = Axie.phong_thu(he, Axie.lop(id))["ket"]
			mau = [Color(1, 0.5, 0.4), Color(0.85, 0.82, 0.75), Color(0.5, 1, 0.7)][k + 1]
			ghi = ["\nỞ đây: BỊ KHẮC (+12% đòn nhận)", "\nỞ đây: trung tính", "\nỞ đây: KHẮC (−10% đòn nhận)"][k + 1]
		b.add_theme_color_override("font_color", mau)
		b.add_theme_color_override("font_hover_color", mau)
		var st: StyleBoxFlat = b.get_theme_stylebox("normal").duplicate()
		st.border_color = Color(1, 0.85, 0.3) if id == nv.axie else Color(0.32, 0.26, 0.18)
		st.set_border_width_all(2 if id == nv.axie else 1)
		b.add_theme_stylebox_override("normal", st)
		b.tooltip_text = "%s · %d★ · lớp %s%s%s" % [Axie.meta()[id]["ten"], Axie.meta()[id]["sao"], Axie.lop(id), ghi,
			"\n(đang đi theo)" if id == nv.axie else "\nBấm để đổi"]


# ── mở / đóng ───────────────────────────────────────────────────────────────
func dang_mo() -> bool:
	return _thoai.visible or _tiem.visible or _kho.visible or _tui.visible or _axie.visible


func mo_thoai(n: Npc) -> void:
	dong_het()
	npc = n
	n.dang_noi = true
	n.quay_ve(nv.position)
	_thoai_ten.text = n.ten_hien
	_thoai_loi.text = n.loi_chao()
	for c in _thoai_nut.get_children():
		c.queue_free()
	var vai: Dictionary = NpcDuLieu.VAI.get(n.vai, {})
	match vai.get("nut", ""):
		"mua":
			var b := nut("Mua bán")
			b.pressed.connect(mo_tiem)
			_thoai_nut.add_child(b)
		"kho":
			var b := nut("Mở kho")
			b.pressed.connect(mo_kho)
			_thoai_nut.add_child(b)
	var t := nut("Tạm biệt")
	t.pressed.connect(dong_het)
	_thoai_nut.add_child(t)
	_thoai.visible = true


func mo_tiem() -> void:
	if npc == null:
		return
	var vai: Dictionary = NpcDuLieu.VAI[npc.vai]
	_thoai.visible = false
	che_do = "mua"
	_tiem_tieu.text = "%s — %s" % [vai.get("tieu_de", "Cửa Hàng"), npc.ten_hien]
	for c in _tiem_luoi.get_children():
		c.queue_free()
	for id in vai["hang"]:
		var b := o_do(46, 46)
		b.icon = icon(id)
		b.text = str(VatPham.lay(id)["gia"])
		b.vertical_icon_alignment = VERTICAL_ALIGNMENT_TOP
		b.alignment = HORIZONTAL_ALIGNMENT_CENTER
		b.tooltip_text = VatPham.mo_ta(id, nv) + "\nGiá %d Lumen" % VatPham.lay(id)["gia"]
		b.pressed.connect(_mua.bind(id))
		_tiem_luoi.add_child(b)
	_tiem.visible = true
	_tui.visible = true
	ve_lai()


func mo_kho() -> void:
	_thoai.visible = false
	che_do = "kho"
	_kho.visible = true
	_tui.visible = true
	ve_lai()


func bat_tat_tui() -> void:
	if _tui.visible and che_do == "":
		_tui.visible = false
	else:
		_tui.visible = true
		ve_lai()


func dong_het() -> void:
	if npc and is_instance_valid(npc):
		npc.dang_noi = false
	npc = null
	che_do = ""
	_thoai.visible = false
	_tiem.visible = false
	_kho.visible = false
	_tui.visible = false
	_axie.visible = false


func bao(chu: String) -> void:
	if chu == "":
		return
	_bao.text = chu
	_bao.reset_size()                               # co khung nền theo đúng bề ngang câu chữ, canh giữa màn
	_bao.position.x = floorf((640 - _bao.size.x) / 2.0)
	_bao_t = 3.5
	_bao.modulate.a = 1.0


func xoa_bao() -> void:
	_bao_t = 0.0
	_bao.modulate.a = 0.0


func _process(dt: float) -> void:
	if _bao_t > 0.0:
		_bao_t -= dt
		_bao.modulate.a = clampf(_bao_t / 0.6, 0.0, 1.0)
	# đi xa khỏi người đang nói chuyện thì đóng — như MU
	if npc and (not is_instance_valid(npc) or npc.the_gioi != nv.the_gioi
			or Iso.kc_dat(nv.position, npc.position) > 170.0 or nv.chet):
		dong_het()


# ── vẽ lại nội dung ──────────────────────────────────────────────────────────
func _dat_o(b: Button, x: Dictionary) -> void:
	b.icon = icon(x.get("id", ""))
	var sl: Label = b.get_node("SoLuong")
	sl.text = str(x["sl"]) if not x.is_empty() and x["sl"] > 1 else ""
	b.tooltip_text = "" if x.is_empty() else VatPham.mo_ta(x["id"], nv) + _gia_hien(x["id"])


func _gia_hien(id: String) -> String:
	if che_do == "mua":
		return "\nBán: %d Lumen" % VatPham.gia_ban(id)
	return ""


func ve_lai() -> void:
	if not _tui.visible and not _kho.visible:
		return
	for i in VatPham.TUI_O:
		_dat_o(_tui_luoi.get_child(i), nv.tui[i])
	_tui_vk.icon = icon(nv.trang_bi["vu_khi"])
	_tui_vk.tooltip_text = "Vũ khí" if nv.trang_bi["vu_khi"] == "" else VatPham.mo_ta(nv.trang_bi["vu_khi"]) + "\n(bấm để tháo)"
	_tui_giap.icon = icon(nv.trang_bi["giap"])
	_tui_giap.tooltip_text = "Giáp" if nv.trang_bi["giap"] == "" else VatPham.mo_ta(nv.trang_bi["giap"]) + "\n(bấm để tháo)"
	var sm := nv.sat_thuong_khoang()
	_tui_chi_so.text = "Cấp %d   Sức Mạnh %d\nSát thương %d ~ %d\nPhòng thủ %d" % [nv.cap, nv.suc_manh, sm.x, sm.y, nv.phong_thu()]
	_tui_lumen.text = "%d Lumen" % nv.lumen
	_tui_goi_y.text = {"mua": "Bấm ô túi: BÁN một món (Shift: cả chồng)", "kho": "Bấm ô túi: GỬI vào kho · bấm ô kho: RÚT về túi",
		"": "Bấm ô túi: dùng / mặc / đọc · Q uống máu · W uống mana"}[che_do]
	if _kho.visible:
		for i in VatPham.KHO_O:
			_dat_o(_kho_luoi.get_child(i), nv.kho[i])
		_kho_lumen.text = "Lumen trong kho: %d" % nv.kho_lumen


# ── hành động ───────────────────────────────────────────────────────────────
func _mua(id: String) -> void:
	var gia: int = VatPham.lay(id)["gia"]
	if nv.lumen < gia:
		bao("Không đủ Lumen")
		return
	if nv.them_do(id, 1) > 0:
		bao("Túi đầy")
		return
	nv.lumen -= gia
	bao("Đã mua %s" % VatPham.lay(id)["ten"])
	nv.doi_chi_so.emit()


func _bam_tui(e: InputEvent, o: int) -> void:
	if not (e is InputEventMouseButton and e.pressed and e.button_index == MOUSE_BUTTON_LEFT):
		return
	var x: Dictionary = nv.tui[o]
	if x.is_empty():
		return
	match che_do:
		"mua":
			var sl: int = x["sl"] if e.shift_pressed else 1
			nv.lumen += VatPham.gia_ban(x["id"]) * sl
			nv.bot_o(o, sl)
			bao("Đã bán %s ×%d" % [VatPham.lay(x["id"])["ten"], sl])
			nv.doi_chi_so.emit()
		"kho":
			var con := nv.them_do(x["id"], x["sl"], nv.kho)
			nv.tui[o] = {} if con == 0 else {"id": x["id"], "sl": con}
			if con > 0:
				bao("Kho đầy")
			nv.doi_do.emit()
		_:
			bao(nv.dung_o(o))


func _bam_kho(o: int) -> void:
	var x: Dictionary = nv.kho[o]
	if x.is_empty():
		return
	var con := nv.them_do(x["id"], x["sl"])
	nv.kho[o] = {} if con == 0 else {"id": x["id"], "sl": con}
	if con > 0:
		bao("Túi đầy")
	nv.doi_do.emit()


func _bam_mac(ten_o: String) -> void:
	bao(nv.thao(ten_o))


func _lumen_kho(n: int) -> void:
	match n:
		-1:
			nv.kho_lumen += nv.lumen
			nv.lumen = 0
		-2:
			nv.lumen += nv.kho_lumen
			nv.kho_lumen = 0
		_:
			var g := mini(n, nv.lumen)
			nv.lumen -= g
			nv.kho_lumen += g
	nv.doi_chi_so.emit()
