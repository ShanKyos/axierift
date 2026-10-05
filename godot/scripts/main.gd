extends Node2D
## Cảnh chính: Ardhaven + các phòng trong nhà, một Dark Knight, đàn Bọ Giáp. Chơi một mình — mạng
## là mốc sau.
##
## Điều khiển kiểu MU: chuột trái vào đất để đi (giữ thì đi theo con trỏ), vào quái để đánh, vào
## NPC để nói chuyện, vào ngôi nhà có cửa để đi vào. Chuột phải: tung chiêu. Q / W: uống máu / mana.
## I: túi đồ · P: chọn Axie đi theo · Esc: đóng bảng.
##
## Vào nhà KHÔNG phá thế giới ngoài trời: nó chỉ bị ẩn và đóng băng (quái đứng nguyên chỗ, đồ dưới
## đất còn nguyên), nhân vật dời sang phòng. Ra nhà là thả lại đúng chỗ trước cửa.

const HOI_QUAI := 8.0

var ngoai: TheGioi                     # thế giới ngoài trời, sống suốt phiên
var the_gioi: TheGioi                  # thế giới đang đứng (ngoài trời hoặc một phòng)
var nv: NhanVat
var pet: PetAxie
var hud: Hud
var gd: GiaoDien
var cam: Camera2D
var _giu_chuot := false
var _nhip_giu := 0.0
var _cho_hoi := []           # [thời điểm, vị trí nhà, cấp, tên, màu]
var _cua_ra := {}            # cửa vừa đi vào (để ra đúng chỗ)
var _cho_cua := false        # đã bấm vào nhà: tới ô cửa thì vào
var _he_dat := ""            # hệ của đất vừa đứng — đổi vòng quái thì báo một lần


func _ready() -> void:
	RenderingServer.set_default_clear_color(Color(0.02, 0.02, 0.03))
	ngoai = TheGioi.new()
	ngoai.name = "Ngoai"
	add_child(ngoai)
	the_gioi = ngoai
	nv = NhanVat.new()
	nv.name = "NhanVat"
	nv.the_gioi = ngoai
	nv.position = ngoai.tam_o(ngoai.tam_thanh + Vector2i(0, 3))
	ngoai.thuc_the.add_child(nv)
	nv.da_chet.connect(_nv_chet)
	nv.toi_npc.connect(func(n): gd.mo_thoai(n))
	pet = PetAxie.new()
	pet.name = "PetAxie"
	pet.chu = nv
	pet.id = nv.axie
	ngoai.thuc_the.add_child(pet)
	pet.bam_ngay()
	nv.bi_danh.connect(pet.giat)
	nv.tung.connect(pet.gong)
	cam = Camera2D.new()
	nv.add_child(cam)
	cam.make_current()
	_dat_gioi_han_cam()
	var lop := CanvasLayer.new()
	add_child(lop)
	hud = Hud.new()
	hud.nv = nv
	lop.add_child(hud)
	gd = GiaoDien.new()
	gd.nv = nv
	gd.pet = pet
	lop.add_child(gd)
	_rai_quai()


func _dat_gioi_han_cam() -> void:
	if the_gioi == ngoai:
		var gh := the_gioi.gioi_han_man()
		cam.limit_left = int(gh.position.x)
		cam.limit_top = int(gh.position.y)
		cam.limit_right = int(gh.end.x)
		cam.limit_bottom = int(gh.end.y)
	else:
		cam.limit_left = -100000
		cam.limit_top = -100000
		cam.limit_right = 100000
		cam.limit_bottom = 100000
	cam.reset_smoothing()


## Rải quái theo VÙNG khoảng cách từ thành (BanDoArdhaven.VUNG_QUAI): gần thành yếu, xa thành mạnh.
func _rai_quai() -> void:
	var r := RandomNumberGenerator.new()
	r.seed = 7
	for v in BanDoArdhaven.VUNG_QUAI:
		var n := 0
		var thu := 0
		while n < v[4] and thu < 5000:
			thu += 1
			var c := Vector2i(r.randi_range(2, ngoai.CO.x - 3), r.randi_range(2, ngoai.CO.y - 3))
			var kc := ngoai.kc_thanh(c)
			if kc < v[0] or kc >= v[1] or not ngoai.di_duoc(ngoai.tam_o(c)):
				continue
			_sinh_quai(ngoai.tam_o(c), r.randi_range(v[2], v[3]), v[5], v[6], v[7])
			n += 1


func _sinh_quai(p: Vector2, cap: int, ten := "Bọ Giáp", mau := Color.WHITE, he := "Bug") -> void:
	var q := Quai.new()
	q.ten_hien = ten
	q.he = he
	q.modulate = mau
	q.the_gioi = ngoai
	q.nguoi = nv
	q.cap = cap
	q.position = p
	q.nha = p
	q.exp_thuong = 10 + cap * 8
	q.sat_thuong = Vector2(2 + cap * 1.6, 4 + cap * 2.4)
	q.da_chet.connect(_quai_chet)
	ngoai.thuc_the.add_child(q)


func _quai_chet(q: Quai) -> void:
	nv.nhan_exp(q.exp_thuong)
	if randf() < 0.7:
		var d := RoiDo.new()
		d.so_luong = randi_range(4, 10) * q.cap
		d.position = q.position
		ngoai.thuc_the.add_child(d)
	_cho_hoi.append([Time.get_ticks_msec() / 1000.0 + HOI_QUAI, q.nha, q.cap, q.ten_hien, q.modulate, q.he])
	var t := create_tween()
	t.tween_interval(1.5)
	t.tween_property(q, "modulate:a", 0.0, 0.6)
	t.tween_callback(q.queue_free)


func _nv_chet(_ai) -> void:
	await get_tree().create_timer(3.0).timeout
	if the_gioi != ngoai:
		_doi_the_gioi(ngoai, ngoai.tam_thanh + Vector2i(0, 3))
	nv.hoi_sinh(ngoai.tam_o(ngoai.tam_thanh + Vector2i(0, 3)))


# ── vào / ra nhà ────────────────────────────────────────────────────────────
func vao_nha(cu: Dictionary) -> void:
	var phong := TheGioi.new()
	phong.nha = cu["nha"]
	phong.name = "Phong_" + cu["nha"]
	add_child(phong)
	_cua_ra = cu
	_doi_the_gioi(phong, phong.o_vao)
	nv.huong = 4                                    # bước vào là đang nhìn vào trong (hướng N)


func ra_nha() -> void:
	var cu := _cua_ra
	var phong := the_gioi
	_doi_the_gioi(ngoai, cu["o_ngoai"])
	nv.huong = 0
	phong.queue_free()


func _doi_the_gioi(moi: TheGioi, o: Vector2i) -> void:
	gd.dong_het()
	_giu_chuot = false
	_cho_cua = false
	nv.duong.clear()
	nv.muc_tieu = null
	nv.muc_npc = null
	var cu := the_gioi
	cu.visible = false
	cu.process_mode = Node.PROCESS_MODE_DISABLED
	nv.reparent(moi.thuc_the, false)
	pet.reparent(moi.thuc_the, false)
	nv.process_mode = Node.PROCESS_MODE_INHERIT
	moi.visible = true
	moi.process_mode = Node.PROCESS_MODE_INHERIT
	the_gioi = moi
	nv.the_gioi = moi
	nv.position = moi.tam_o(o)
	pet.bam_ngay()
	_dat_gioi_han_cam()


func _process(dt: float) -> void:
	var bay_gio := Time.get_ticks_msec() / 1000.0
	for i in range(_cho_hoi.size() - 1, -1, -1):
		if bay_gio >= _cho_hoi[i][0]:
			_sinh_quai(_cho_hoi[i][1], _cho_hoi[i][2], _cho_hoi[i][3], Color(_cho_hoi[i][4], 1.0), _cho_hoi[i][5])
			_cho_hoi.remove_at(i)
	if not nv.chet:
		var c := the_gioi.o_cua(nv.position)
		if the_gioi == ngoai:
			var cu := ngoai.cua_o(c)
			if not cu.is_empty():
				vao_nha(cu)
		elif c == the_gioi.o_ra:
			ra_nha()
	# bước sang vòng quái khác hệ: nói một lần nên mang Axie nào (băng-rôn, khác số bay mỗi đòn)
	var he := the_gioi.he_tai(nv.position)
	if he != _he_dat:
		_he_dat = he
		if he != "":
			var kq := Axie.phong_thu(he, Axie.lop(nv.axie))
			var ket: String = {-1: "đang BỊ KHẮC — ăn đòn nặng hơn", 0: "trung tính", 1: "đang KHẮC — ăn đòn nhẹ hơn"}[kq["ket"]]
			gd.bao("Đất hệ %s · Axie %s %s · nên mang %s (phím P)" % [he, Axie.lop(nv.axie), ket, " · ".join(Axie.khac_lai(he))])
	if _giu_chuot:
		_nhip_giu -= dt
		if _nhip_giu <= 0.0:
			_nhip_giu = 0.15
			_bam(get_global_mouse_position(), false)


func _unhandled_input(e: InputEvent) -> void:
	if e is InputEventMouseButton:
		if e.button_index == MOUSE_BUTTON_LEFT:
			_giu_chuot = e.pressed
			if e.pressed:
				_bam(get_global_mouse_position(), true)
		elif e.button_index == MOUSE_BUTTON_RIGHT and e.pressed:
			nv.tung_chieu(get_global_mouse_position())
	elif e is InputEventKey and e.pressed and not e.echo:
		match e.keycode:
			KEY_Q: nv.uong("hp")
			KEY_W: nv.uong("mp")
			KEY_I: gd.bat_tat_tui()
			KEY_P: gd.bat_tat_axie()
			KEY_ESCAPE: gd.dong_het()


## Một cú bấm: trúng quái thì đánh, trúng NPC thì nói chuyện, trúng nhà có cửa thì đi vào,
## không thì đi tới đó.
func _bam(p: Vector2, chon: bool) -> void:
	if chon:
		var gan: ThanThe = null
		var tot := 22.0
		for q: Quai in get_tree().get_nodes_in_group("quai"):
			if q.the_gioi != the_gioi or q.chet:
				continue
			var kc: float = (q.position + Vector2(0, -12)).distance_to(p)
			if kc < tot:
				tot = kc
				gan = q
		for n: Npc in get_tree().get_nodes_in_group("npc"):
			if n.the_gioi != the_gioi:
				continue
			var kc: float = (n.position + Vector2(0, -22)).distance_to(p)
			if kc < tot:
				tot = kc
				gan = n
		if gan is Quai:
			nv.tan_cong(gan)
			return
		if gan is Npc:
			nv.noi_voi(gan)
			_giu_chuot = false
			return
		if the_gioi == ngoai:
			var cu := ngoai.cua_tai(p)
			if not cu.is_empty():
				nv.di_toi(ngoai.tam_o(cu["o_vao"]))
				_giu_chuot = false                # giữ chuột thì đừng kéo nhân vật lệch khỏi cửa
				gd.bao("→ " + cu["ten"])
				return
	if (nv.muc_tieu or nv.muc_npc) and not chon:
		return
	nv.di_toi(p)
