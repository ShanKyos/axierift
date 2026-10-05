extends SceneTree
## CỔNG HUD: radar đúng toạ độ · bấm radar là đi · nút thanh dưới làm đúng việc · phím 1 tung chiêu ·
## nhật ký ghi · băng-rôn không theo vào nhà và không hiện khi rỗng.
##
##     godot --headless --path godot -s tests/test_hud.gd      (thoát 1 nếu đỏ)

var loi := 0
var main: Node


func _init() -> void:
	main = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	_chay()


func _ok(dk: bool, m: String) -> void:
	print(("PASS " if dk else "FAIL ") + m)
	if not dk:
		loi += 1


func _bam_radar(r: Radar, p: Vector2) -> Vector2:
	var kq := [null]
	var nghe := func(x): kq[0] = x
	r.bam_di.connect(nghe)
	var e := InputEventMouseButton.new()
	e.button_index = MOUSE_BUTTON_LEFT
	e.pressed = true
	e.position = p
	r._gui_input(e)
	r.bam_di.disconnect(nghe)
	return kq[0] if kq[0] != null else Vector2(-1e9, -1e9)


func _chay() -> void:
	for i in 3:
		await process_frame
	var nv: NhanVat = main.nv
	var hud: Hud = main.hud
	var gd: GiaoDien = main.gd
	var ng: TheGioi = main.ngoai
	var r := hud.radar

	# ① băng-rôn chưa có chữ thì không hiện
	_ok(gd._bao.modulate.a == 0.0, "mở game: băng-rôn rỗng không hiện thành dải trống")

	# ② radar: điểm của một ô trên radar, bấm vào đó, phải ra đúng ô ấy (ngoài trời và trong nhà)
	for vong in 2:
		if vong == 1:
			gd.bao("Đất hệ Bug — câu của ngoài trời")      # dựng cảnh: phải CÓ câu báo thì mới kiểm được nó có theo vào không
			_ok(gd._bao.modulate.a > 0.5, "dựng cảnh: câu báo đang hiện trước khi vào nhà")
			main.vao_nha(ng.cua[0])
			await process_frame
		r._process(0.0)
		var tg: TheGioi = nv.the_gioi
		var sai := 0
		var thu := 0
		var goc := tg.o_cua(nv.position)
		for dy in range(-6, 7, 3):
			for dx in range(-6, 7, 3):
				var c := goc + Vector2i(dx, dy)
				if not tg.astar.is_in_boundsv(c):
					continue
				thu += 1
				var p := r._ra_radar(tg.tam_o(c)) + Vector2(1.0, 0.5) * r._k     # giữa khối 2×1 của ô — chỗ người chơi bấm
				if tg.o_cua(_bam_radar(r, p)) != c:
					sai += 1
		_ok(thu > 0 and sai == 0, "%s: bấm lên radar ra đúng ô (%d/%d sai)" % ["trong nhà" if vong else "ngoài trời", sai, thu])
	_ok(gd._bao.modulate.a == 0.0, "vào nhà: câu báo của ngoài trời không theo vào")
	main.ra_nha()
	await process_frame
	r._process(0.0)

	# ③ bấm radar là đi tới đó (qua đúng tín hiệu HUD → main)
	nv.position = ng.tam_o(ng.tam_thanh + Vector2i(0, 3))
	var dich_o := ng.tam_thanh + Vector2i(4, 3)
	var p := r._ra_radar(ng.tam_o(dich_o)) + Vector2(1.0, 0.5)
	var e := InputEventMouseButton.new()
	e.button_index = MOUSE_BUTTON_LEFT
	e.pressed = true
	e.position = p
	r._gui_input(e)
	_ok(not nv.duong.is_empty() and ng.o_cua(nv.duong[nv.duong.size() - 1]) == dich_o, "bấm radar: nhân vật lên đường tới đúng ô đó")

	# ④ nút thanh dưới
	hud._bam_o("tui")
	_ok(gd._tui.visible, "nút Túi: mở túi đồ")
	hud._bam_o("tui")
	hud._bam_o("axie")
	_ok(gd._axie.visible, "nút Axie: mở bảng chọn Axie")
	gd.dong_het()
	hud._bam_o("radar")
	_ok(not r.visible, "nút Radar: ẩn radar")
	hud._bam_o("radar")
	_ok(r.visible, "bấm lần nữa: hiện lại")
	nv.hp = 10.0
	var n0 := nv.dem_do("binh_mau_nho")
	hud._bam_o("hp")
	_ok(nv.dem_do("binh_mau_nho") == n0 - 1 and nv.hp > 10.0, "nút Q: uống một bình máu")

	# ⑤ phím 1 tung chiêu (khi đã học), trừ mana
	nv.chieu_biet["chem_xoay"] = true
	nv.mp = nv.mp_max
	var k := InputEventKey.new()
	k.keycode = KEY_1
	k.pressed = true
	main._unhandled_input(k)
	_ok(nv.mp < nv.mp_max and nv.trang_thai == "attack", "phím 1: tung Chém Xoáy, trừ mana")

	# ⑥ nhật ký ghi khi hạ quái
	var q: Quai = get_nodes_in_group("quai")[0]
	var dong := hud._nhat_ky.size()
	main._quai_chet(q)
	_ok(hud._nhat_ky.size() == dong + 1 and q.ten_hien in hud._nhat_ky[0]["chu"], "hạ quái: nhật ký ghi một dòng có tên con quái")
	_ok(hud.luc_chien() > 0, "lực chiến tính ra số dương (%d)" % hud.luc_chien())
	print("\n%s" % ("TẤT CẢ PASS" if loi == 0 else "%d FAIL" % loi))
	quit(1 if loi else 0)
