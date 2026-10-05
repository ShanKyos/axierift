extends SceneTree
## CỔNG AXIE: 16 con đủ khung · tam giác đúng hình · đổi Axie đổi 0 chỉ số · hệ số đòn THẬT ·
## pet bám sau lưng, nhảy tới khi xa, theo vào nhà · bảng P nói đúng đất đang đứng.
##
##     godot --headless --path godot -s tests/test_axie.gd      (thoát 1 nếu đỏ)

const DT := 1.0 / 60.0
var loi := 0
var main: Node
var nv: NhanVat


func _init() -> void:
	main = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	_chay()


func _ok(dk: bool, m: String) -> void:
	print(("PASS " if dk else "FAIL ") + m)
	if not dk:
		loi += 1


func _buoc(n: int) -> void:
	for i in n:
		nv._process(DT)
		main.pet._process(DT)
		main._process(DT)


func _chay() -> void:
	for i in 3:
		await process_frame
	nv = main.nv
	var pet: PetAxie = main.pet
	var ng: TheGioi = main.ngoai

	# ① 16 con, đủ bốn khối, đúng số khung, mỗi lớp một nhóm hợp lệ
	var ds := Axie.ds()
	_ok(ds.size() == 16, "đủ 16 con Axie (%d)" % ds.size())
	var thieu := []
	for id in ds:
		var f := Axie.frames(id)
		for tt in {"idle": 16, "run": 12, "buff": 12, "hit": 8}.keys():
			var can: int = {"idle": 16, "run": 12, "buff": 12, "hit": 8}[tt]
			if not f.has_animation(tt) or f.get_frame_count(tt) != can:
				thieu.append("%s/%s" % [id, tt])
		if not Axie.NHOM.has(Axie.lop(id)):
			thieu.append("%s lớp lạ %s" % [id, Axie.lop(id)])
	_ok(thieu.is_empty(), "mọi con đủ thở 16 · chạy 12 · gồng 12 · giật 8 (%s)" % [thieu])

	# ② tam giác: mỗi lớp khắc đúng 3, bị khắc bởi đúng 3, trung tính với 3 (kể cả chính nó)
	var sai := []
	for a in Axie.NHOM:
		var k := 0
		var bk := 0
		for b in Axie.NHOM:
			if Axie.khac(a, b): k += 1
			if Axie.khac(b, a): bk += 1
			if Axie.khac(a, b) and Axie.khac(b, a): sai.append("%s↔%s" % [a, b])
		if k != 3 or bk != 3:
			sai.append("%s khắc %d bị khắc %d" % [a, k, bk])
	_ok(sai.is_empty(), "tam giác: mỗi lớp khắc 3 · bị khắc 3 · không cặp nào khắc hai chiều (%s)" % [sai])
	_ok(not Axie.khac("Mech", "Beast") and not Axie.khac("Beast", "Mech"), "Mech và Beast cùng nhóm ⇒ trung tính (tên khác chưa chắc khắc)")

	# ③ ba vòng quái ba nhóm khác nhau — không con Axie nào hợp cả ba
	var nhom_vong := {}
	for v in BanDoArdhaven.VUNG_QUAI:
		nhom_vong[Axie.NHOM[v[7]]] = true
	_ok(nhom_vong.size() == 3, "ba vòng quái mang ba nhóm khác nhau")

	# ④ đổi Axie đổi ĐÚNG 0 chỉ số
	var chup := func(): return [nv.hp_max, nv.mp_max, nv.sat_thuong_khoang(), nv.phong_thu(), nv.suc_manh]
	var goc_cs = chup.call()
	var lech := []
	for id in ds:
		nv.axie = id
		nv.tinh_chi_so()
		if chup.call() != goc_cs:
			lech.append(id)
	_ok(lech.is_empty(), "đổi qua cả 16 con: chỉ số không đổi một điểm (%s)" % [lech])

	# ⑤ sợi dây: đòn THẬT qua nhan_sat_thuong nhân đúng hệ số theo con Axie
	var q: Quai = get_nodes_in_group("quai")[0]
	q.he = "Bug"
	var do_mat := func(id: String) -> float:
		nv.axie = id
		nv.hp = 1e6
		nv.hp_max = 1e6
		nv.chet = false
		var h0 := nv.hp
		nv.nhan_sat_thuong(1000.0, q)
		return h0 - nv.hp
	var bi: float = do_mat.call("tidewarden")     # Aquatic ③ khắc Bug ① ⇒ Axie khắc quái, ăn đòn nhẹ
	var trung: float = do_mat.call("coghound")    # Mech ① — cùng nhóm với Bug
	var thua: float = do_mat.call("petalkin")     # Plant ② — Bug ① khắc Plant ②
	_ok(trung > 0 and absf(thua / trung - Axie.HE_THIET) < 0.001, "quái Bug đánh Axie Plant: ăn đòn ×%.2f (đo %.3f)" % [Axie.HE_THIET, thua / maxf(trung, 1)])
	_ok(trung > 0 and absf(bi / trung - Axie.HE_LOI) < 0.001, "quái Bug đánh Axie Aquatic: ăn đòn ×%.2f (đo %.3f)" % [Axie.HE_LOI, bi / maxf(trung, 1)])
	nv.axie = Axie.MAC_DINH
	nv.tinh_chi_so(true)
	# ⑤ vừa cho chủ ăn đòn ⇒ pet đang giật. Hoạt ảnh chạy theo đồng hồ thật, nên chờ nó diễn xong
	# trước khi ⑥ chấm "đứng yên thì thở" — không thì ⑥ đo cảnh của ⑤.
	await create_timer(0.7).timeout

	# ⑥ pet bám sau lưng khi đi, nhảy tới khi xa, lật mặt theo hướng ngang
	var p0 := ng.tam_o(ng.tam_thanh + Vector2i(0, 3))
	nv.position = p0
	pet.bam_ngay()
	nv.di_toi(p0 + Vector2(180, 0))
	var lat_phai := false
	for i in 300:
		_buoc(1)
		if i == 20:
			lat_phai = not pet.hinh.flip_h
	_buoc(120)
	var kc := Iso.kc_dat(pet.position, nv.position)
	_ok(kc < 50.0 and kc > 10.0, "đi xong: pet đứng sau lưng chủ, không đè lên chủ (cách %.0f px)" % kc)
	_ok(lat_phai, "đi sang phải: pet quay mặt sang phải (không lật)")
	_ok(pet.hinh.animation == "idle", "chủ đứng yên thì pet thở (đang: %s)" % pet.hinh.animation)
	nv.position += Vector2(900, 0)
	_buoc(1)
	_ok(Iso.kc_dat(pet.position, nv.position) < 50.0, "chủ dịch chuyển xa: pet nhảy tới ngay một nhịp")

	# ⑦ vào nhà: pet theo vào cùng phòng; ra nhà: theo ra
	main.vao_nha(ng.cua[0])
	await process_frame
	_ok(pet.get_parent() == main.the_gioi.thuc_the and Iso.kc_dat(pet.position, nv.position) < 50.0,
		"vào nhà: pet ở cùng phòng, cạnh chủ")
	main.ra_nha()
	await process_frame
	_ok(pet.get_parent() == ng.thuc_the, "ra nhà: pet về thế giới ngoài trời")

	# ⑧ ăn đòn thì pet giật; bảng P đổi được con và nói đúng hệ đất
	nv.position = p0
	nv.nhan_sat_thuong(5.0, q)
	_ok(pet.hinh.animation == "hit", "chủ ăn đòn: pet giật (%s)" % pet.hinh.animation)
	var vong := ng.tam_o(ng.tam_thanh + Vector2i(0, 33))    # vòng hai — Reptile
	nv.position = vong
	_ok(ng.he_tai(vong) == "Reptile" and ng.he_tai(p0) == "", "hệ đất: vòng hai Reptile, trong thành rỗng")
	main.gd.bat_tat_axie()
	main.gd._chon_axie("voltcrest")
	_ok(nv.axie == "voltcrest" and pet.id == "voltcrest", "bảng P: bấm một con là đổi cả hệ lẫn pet")
	_ok("Reptile" in main.gd._axie_dat.text, "bảng P nói hệ của đất đang đứng: \"%s\"" % main.gd._axie_dat.text)
	print("\n%s" % ("TẤT CẢ PASS" if loi == 0 else "%d FAIL" % loi))
	quit(1 if loi else 0)
