extends SceneTree
## CỔNG THÀNH: bố cục Ardhaven · vào/ra nhà · nói chuyện · mua/bán · kho · thuốc · chiêu.
##
##     godot --headless --path godot -s tests/test_thanh.gd      (thoát 1 nếu đỏ)
##
## Lái bằng CHÍNH hàm của game (`di_toi`, `noi_voi`, `_process` của cảnh chính, các nút của
## GiaoDien), không đọc bảng rồi tự kết luận: chỗ dễ hỏng là sợi dây nối, không phải bảng dữ liệu.

const DT := 1.0 / 60.0
var loi := 0
var main: Node
var nv: NhanVat


func _init() -> void:
	main = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	_chay()


func _fail(m: String) -> void:
	print("FAIL ", m)
	loi += 1


func _ok(dk: bool, m: String) -> void:
	if dk:
		print("PASS ", m)
	else:
		_fail(m)


## Chạy n nhịp của cảnh chính + nhân vật. Dừng sớm khi `xong` trả true.
func _buoc(n: int, xong := Callable()) -> bool:
	for i in n:
		nv._process(DT)
		main._process(DT)
		if xong.is_valid() and xong.call():
			return true
	return false


func _chay() -> void:
	for i in 3:
		await process_frame
	nv = main.nv
	var ngoai: TheGioi = main.ngoai
	_kiem_bo_cuc(ngoai)

	# ── ① đủ bốn nhà người chơi cần, và đi bộ vào được từng nhà
	var can := {"lo_ren": "tho_ren", "quan_ruou": "ruou", "thap_phap": "phap_su", "kho": "thu_kho"}
	for nha in can:
		var cu := {}
		for c in ngoai.cua:
			if c["nha"] == nha:
				cu = c
		if cu.is_empty():
			_fail("thiếu nhà %s" % nha)
			continue
		nv.position = ngoai.tam_o(ngoai.tam_thanh + Vector2i(0, 3))
		nv.di_toi(ngoai.tam_o(cu["o_vao"]))
		var vao := _buoc(4000, func(): return main.the_gioi != ngoai)
		_ok(vao, "%s: đi bộ từ quảng trường vào được nhà" % nha)
		if not vao:
			continue
		var phong: TheGioi = main.the_gioi
		await process_frame                                # NPC trong phòng chạy _ready
		var ai: Npc = null
		for n: Npc in root.get_tree().get_nodes_in_group("npc"):
			if n.the_gioi == phong and n.vai == can[nha]:
				ai = n
		_ok(ai != null, "%s: có %s đứng trong phòng" % [nha, can[nha]])
		if ai:
			nv.noi_voi(ai)
			var noi := _buoc(1500, func(): return main.gd.npc == ai)
			_ok(noi, "%s: bấm NPC thì đi tới và mở hội thoại" % nha)
			if noi:
				var nut := []
				for b in main.gd._thoai_nut.get_children():
					if not b.is_queued_for_deletion():
						nut.append(b.text)
				var can_nut := "Mở kho" if can[nha] == "thu_kho" else "Mua bán"
				_ok(can_nut in nut, "%s: hội thoại có nút %s (có: %s)" % [nha, can_nut, nut])
				if nha == "lo_ren":
					_kiem_mua_ban()
				elif nha == "kho":
					_kiem_kho()
				elif nha == "thap_phap":
					_kiem_hoc_chieu()
			main.gd.dong_het()
		# ra: bước lên thảm cửa
		nv.di_toi(phong.tam_o(phong.o_ra))
		var ra := _buoc(1500, func(): return main.the_gioi == ngoai)
		_ok(ra, "%s: bước lên thảm cửa thì ra ngoài" % nha)
		if ra:
			_ok(ngoai.o_cua(nv.position) == cu["o_ngoai"], "%s: ra đúng ô trước cửa" % nha)
			_buoc(60)
			_ok(main.the_gioi == ngoai, "%s: đứng trước cửa không bị hút vào lại" % nha)

	_kiem_thuoc()
	_kiem_chieu(ngoai)
	print("\n%s" % ("TẤT CẢ PASS" if loi == 0 else "%d FAIL" % loi))
	quit(1 if loi else 0)


## Bố cục: chân đế không chồng nhau, nằm trong tường, không chặn đại lộ; cửa đi tới được.
func _kiem_bo_cuc(ngoai: TheGioi) -> void:
	var BD := BanDoArdhaven
	var chiem := {}
	var trong := Rect2i(BD.THANH.position + Vector2i.ONE, BD.THANH.size - Vector2i(2, 2))
	var gx := BD.THANH.position.x + BD.THANH.size.x / 2 - 1
	var gy := BD.THANH.position.y + BD.THANH.size.y / 2 - 1
	var chong := 0
	var ngoai_tuong := 0
	var chan_lo := 0
	for ct in BD.CONG_TRINH:
		var co := TheGioi.kich(ct[0], ct[2])
		for y in co.y:
			for x in co.x:
				var c: Vector2i = ct[1] + Vector2i(x, y)
				if chiem.has(c):
					chong += 1
					print("   chồng: %s và %s ở %s" % [chiem[c], ct[0], c])
				chiem[c] = ct[0]
				if not trong.has_point(c):
					ngoai_tuong += 1
				var qt := Vector2(c).distance_to(Vector2(gx + 0.5, gy + 0.5)) <= BD.QUANG_TRUONG
				if (c.x == gx or c.x == gx + 1 or c.y == gy or c.y == gy + 1) and not qt:
					chan_lo += 1
					print("   chặn đại lộ: %s ở %s" % [ct[0], c])
	for ca in BD.CAY:
		if chiem.has(ca):
			chong += 1
			print("   cây đè %s ở %s" % [chiem[ca], ca])
	_ok(chong == 0, "bố cục: không công trình nào chồng nhau (%d ô chồng)" % chong)
	_ok(ngoai_tuong == 0, "bố cục: mọi công trình nằm trong tường thành")
	_ok(chan_lo == 0, "bố cục: không gì chặn hai đại lộ")
	var goc := ngoai.tam_thanh + Vector2i(0, 3)
	for cu in ngoai.cua:
		var dg := ngoai.astar.get_id_path(goc, cu["o_ngoai"])
		_ok(not dg.is_empty() and ngoai.di_duoc(ngoai.tam_o(cu["o_ngoai"])),
			"cửa %s: ô trước cửa đi tới được từ quảng trường" % cu["nha"])
	# bốn cổng thành đi xuyên được: từ quảng trường ra tới mép map theo bốn hướng
	for d in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
		var dich: Vector2i = ngoai.tam_thanh + d * (BD.THANH.size.x / 2 + 6)
		_ok(not ngoai.astar.get_id_path(goc, dich).is_empty(), "cổng %s: ra được khỏi thành" % d)
	var dan := 0
	for n: Npc in root.get_tree().get_nodes_in_group("npc"):
		if n.the_gioi == ngoai and n.lang_thang:
			dan += 1
	_ok(dan >= 6, "thành có dân lang thang (%d người)" % dan)


func _o_cua(id: String) -> int:
	for o in nv.tui.size():
		if not nv.tui[o].is_empty() and nv.tui[o]["id"] == id:
			return o
	return -1


func _bam_o(o: int, shift := false) -> void:
	var e := InputEventMouseButton.new()
	e.button_index = MOUSE_BUTTON_LEFT
	e.pressed = true
	e.shift_pressed = shift
	main.gd._bam_tui(e, o)


## Thợ rèn: mua trừ đúng giá, bán trả đúng 1/3; đồ thiếu Sức Mạnh thì không mặc được.
func _kiem_mua_ban() -> void:
	var gd: GiaoDien = main.gd
	gd.mo_tiem()
	_ok(gd._tiem.visible and gd._tiem_luoi.get_child_count() == 6, "tiệm rèn mở, bày 6 món")
	nv.lumen = 5000
	gd._mua("kiem_dai")
	var o := _o_cua("kiem_dai")
	_ok(o >= 0 and nv.lumen == 5000 - 1800, "mua Kiếm Dài: vào túi, trừ 1800 Lumen")
	gd._mua("dai_kiem")
	_ok(_o_cua("dai_kiem") < 0 and nv.lumen == 3200, "không đủ Lumen thì không mua được")
	gd.dong_het()
	var cu := nv.sat_thuong_khoang()
	nv.suc_manh = 30
	_ok(nv.dung_o(o) != "" and nv.trang_bi["vu_khi"] == "kiem_ngan", "thiếu Sức Mạnh thì không mặc được Kiếm Dài")
	nv.suc_manh = 45
	nv.dung_o(o)
	_ok(nv.trang_bi["vu_khi"] == "kiem_dai" and _o_cua("kiem_ngan") >= 0, "mặc Kiếm Dài, Kiếm Ngắn về túi")
	_ok(nv.sat_thuong_khoang().y > cu.y + 5, "đổi kiếm thì sát thương trên bảng tăng (%s → %s)" % [cu, nv.sat_thuong_khoang()])
	gd.mo_thoai(gd.npc if gd.npc else _npc_gan("tho_ren"))
	gd.mo_tiem()
	var l0 := nv.lumen
	_bam_o(_o_cua("kiem_ngan"))
	_ok(_o_cua("kiem_ngan") < 0 and nv.lumen == l0 + 100, "bán Kiếm Ngắn ở tiệm: nhận 1/3 giá (100)")


func _npc_gan(vai: String) -> Npc:
	for n: Npc in root.get_tree().get_nodes_in_group("npc"):
		if n.the_gioi == main.the_gioi and n.vai == vai:
			return n
	return null


## Thủ kho: gửi cả chồng vào kho rồi rút về; Lumen gửi/rút.
func _kiem_kho() -> void:
	var gd: GiaoDien = main.gd
	gd.mo_kho()
	_ok(gd._kho.visible and gd._tui.visible, "kho mở kèm túi")
	var truoc := nv.dem_do("binh_mau_nho")
	_bam_o(_o_cua("binh_mau_nho"))
	_ok(nv.dem_do("binh_mau_nho") == 0 and nv.kho[0].get("sl", 0) == truoc, "gửi cả chồng %d bình máu vào kho" % truoc)
	gd._bam_kho(0)
	_ok(nv.dem_do("binh_mau_nho") == truoc and nv.kho[0].is_empty(), "rút bình máu về túi")
	nv.lumen = 777
	gd._lumen_kho(-1)
	_ok(nv.lumen == 0 and nv.kho_lumen == 777, "gửi hết Lumen vào kho")
	gd._lumen_kho(-2)
	_ok(nv.lumen == 777 and nv.kho_lumen == 0, "rút hết Lumen")


## Pháp sư: mua sách Chém Xoáy rồi đọc — thiếu cấp thì không học được.
func _kiem_hoc_chieu() -> void:
	var gd: GiaoDien = main.gd
	gd.mo_tiem()
	nv.lumen = 3000
	gd._mua("sach_chem_xoay")
	gd.dong_het()
	var o := _o_cua("sach_chem_xoay")
	_ok(o >= 0 and nv.lumen == 500, "mua Sách Chém Xoáy (2500)")
	nv.cap = 2
	_ok(nv.dung_o(o) != "" and nv.chieu_biet.is_empty(), "cấp 2 chưa đọc được sách (cần cấp 5)")
	nv.cap = 5
	nv.dung_o(o)
	_ok(nv.chieu_biet.has("chem_xoay") and _o_cua("sach_chem_xoay") < 0, "cấp 5 đọc sách: học Chém Xoáy, sách mất")


## Q / W: uống bình nhỏ nhất, trừ một bình, hồi đúng lượng.
func _kiem_thuoc() -> void:
	nv.hp = 10.0
	var n0 := nv.dem_do("binh_mau_nho")
	nv.uong("hp")
	_ok(nv.dem_do("binh_mau_nho") == n0 - 1 and absf(nv.hp - minf(nv.hp_max, 50.0)) < 0.01, "phím Q: uống một Bình Máu Nhỏ, hồi 40 máu")


## Chuột phải: Chém Xoáy trúng mọi quái trong vòng, quái ngoài vòng không mất máu, trừ mana.
func _kiem_chieu(ngoai: TheGioi) -> void:
	if not nv.chieu_biet.has("chem_xoay"):
		_fail("chưa học được Chém Xoáy — không kiểm được chiêu")
		return
	var p := ngoai.tam_o(Vector2i(56, 82))
	nv.position = p
	var gan: Array[Quai] = []
	var xa: Quai = null
	var ds := root.get_tree().get_nodes_in_group("quai")
	for i in 3:
		var q: Quai = ds[i]
		q.position = p + Iso.nen(Vector2.from_angle(i * 2.1) * 40.0)
		q.hp = q.hp_max
		gan.append(q)
	xa = ds[3]
	xa.position = p + Iso.nen(Vector2(160, 0))
	xa.hp = xa.hp_max
	nv.mp = nv.mp_max
	nv._hoi = 0.0                       # ⚠ đặt lại đồng hồ hồi mana mỗi giây: rơi đúng nhịp đo là +3% mana, đỏ vì tải máy
	var mp0 := nv.mp
	nv.tung_chieu(p + Vector2(30, 0))
	nv.hinh.frame = nv.bo.khung_trung("attack")
	nv._process(DT)
	var trung := 0
	for q in gan:
		if q.hp < q.hp_max:
			trung += 1
	_ok(trung == 3, "Chém Xoáy trúng cả 3 quái trong vòng (%d/3)" % trung)
	_ok(xa.hp == xa.hp_max, "quái ngoài vòng không mất máu")
	_ok(absf(mp0 - nv.mp - VatPham.CHIEU["chem_xoay"]["mp"]) < 0.01, "trừ đúng mana (%.3f → %.3f, giá %s)" % [mp0, nv.mp, VatPham.CHIEU["chem_xoay"]["mp"]])
