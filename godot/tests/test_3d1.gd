extends SceneTree
## CỔNG MỐC 3D-1 — Ardhaven 3D dựng từ tranh tổng quan:
##   ① đi được ra cả bốn cổng (và đường đi thật sự QUA lỗ cổng) · ② tường chặn ngoài cổng ·
##   ③ đường đất đi được suốt chiều dài · ④ sông chặn, chỉ qua được bằng cầu ·
##   ⑤ bốn vùng nằm đúng hướng và mang đúng nội dung · ⑥ bản đồ Tab: toạ độ hai chiều, bắc ở trên,
##   bấm lên bản đồ là chạy tới đúng chỗ, phím Tab bật/tắt, camera chụp không chụp nhân vật.
##
##     godot --headless --path godot -s tests/test_3d1.gd      (thoát 1 nếu đỏ)
##
## Phần cần GPU (ảnh chụp bản đồ có đúng màu sông/rừng không) nằm ở tests/chup3d1.gd.
##
## ⚠ Vật cản đo bằng HỘP BAO THẬT của mô hình tường (`tg.tuong`), không hỏi lại lưới đi bộ: hỏi lưới
## thì lưới hỏng là que dò hỏng theo.

const D := preload("res://scripts/du_lieu/ardhaven_3d.gd")
const DT := 1.0 / 60.0
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


## Lấy mẫu dày (0,25 m) dọc một đường đi gồm điểm đầu + các điểm của tim_duong.
func _mau(a: Vector3, duong: Array[Vector3]) -> Array[Vector3]:
	var out: Array[Vector3] = []
	var truoc := a
	for p in duong:
		var n := int(ceil(truoc.distance_to(p) / 0.25))
		for k in n:
			out.append(truoc.lerp(p, float(k) / n))
		truoc = p
	out.append(truoc)
	return out


func _dai(a: Vector3, duong: Array[Vector3]) -> float:
	var l := 0.0
	var t := a
	for p in duong:
		l += t.distance_to(p)
		t = p
	return l


func _lot_tuong(mau: Array[Vector3]) -> int:
	var tg: TheGioi3D = main.tg
	var n := 0
	for p in mau:
		for ab in tg.tuong:
			if p.x > ab.position.x and p.x < ab.end.x and p.z > ab.position.z and p.z < ab.end.z:
				n += 1
	return n


func _v3(p: Vector2) -> Vector3:
	return Vector3(p.x, 0, p.y)


func _chay() -> void:
	for i in 3:
		await process_frame
	var tg: TheGioi3D = main.tg
	var nv: NhanVat3D = main.nv
	nv.set_process(false)
	nv.ap.callback_mode_process = AnimationMixer.ANIMATION_CALLBACK_MODE_PROCESS_MANUAL
	var xp := D.XUAT_PHAT
	_ok(tg.di_duoc(xp), "điểm xuất phát đứng được")
	_ok(tg.tuong.size() == 4 * (D.SO_DOAN - 1), "đủ %d khúc tường không cổng (đếm %d)" % [4 * (D.SO_DOAN - 1), tg.tuong.size()])

	# ① bốn cổng
	for id in D.cong():
		var g: Dictionary = D.cong()[id]
		var tam := _v3(g.tam)
		var dich := _v3(g.tam + g.ra * 14.0)
		var duong := tg.tim_duong(xp, dich)
		var toi := not duong.is_empty() and duong[-1].distance_to(dich) < 0.6
		var mau := _mau(xp, duong)
		# chỗ đường cắt đường tường: độ lệch ngang so với tâm cổng phải nằm trong lỗ cổng
		var ra3 := _v3(g.ra)
		var ngang := 1e9
		for i in range(1, mau.size()):
			var s0 := (mau[i - 1] - tam).dot(ra3)
			var s1 := (mau[i] - tam).dot(ra3)
			if s0 <= 0.0 and s1 > 0.0:
				var q := mau[i - 1] - tam
				ngang = absf(q.dot(Vector3(-ra3.z, 0, ra3.x)))
		_ok(toi and ngang < D.LO_CONG and _lot_tuong(mau) == 0,
			"%s: đi ra được, cắt tường đúng lỗ cổng (lệch ngang %.2f m < %.1f), không lọt hộp tường" % [g.ten, ngang, D.LO_CONG])

	# chạy THẬT ra cổng bắc bằng chính nhịp của nhân vật
	nv.global_position = xp
	nv.di_toi(tg.tim_duong(xp, _v3(D.cong().bac.tam + Vector2(0, -14))))
	var t := 0
	while not nv.duong.is_empty() and t < 1800:
		nv.buoc(DT)
		nv.ap.advance(DT)
		t += 1
	var ra: bool = nv.global_position.z < D.cong().bac.tam.y - 10.0
	_ok(ra, "nhân vật chạy thật ra khỏi Cổng Bắc (z = %.1f, sau %.1f giây)" % [nv.global_position.z, t * DT])

	# ② tường chặn: trong thành sát tường bắc → ngoài thành ngay đối diện
	var trong := Vector3(-22, 0, D.TAM_THANH.y - D.NUA_THANH + 5.0)
	var ngoai := Vector3(-22, 0, D.TAM_THANH.y - D.NUA_THANH - 6.0)
	var dv := tg.tim_duong(trong, ngoai)
	var dai := _dai(trong, dv)
	_ok(not dv.is_empty() and dai > 2.5 * trong.distance_to(ngoai) and _lot_tuong(_mau(trong, dv)) == 0,
		"tường chặn: muốn ra ngoài phải vòng qua cổng (%.0f m so với %.0f m đường thẳng)" % [dai, trong.distance_to(ngoai)])

	# ③ đường đất đi được suốt chiều dài (đi dọc tim đường, mỗi 2 m)
	for r in D.DUONG:
		var tong := 0
		var duoc := 0
		var diem: Array = r.diem
		for i in range(1, diem.size()):
			var n := int(ceil(diem[i - 1].distance_to(diem[i]) / 2.0))
			for k in n:
				var p: Vector2 = diem[i - 1].lerp(diem[i], float(k) / n)
				if absf(p.x) > TheGioi3D.BIEN or absf(p.y) > TheGioi3D.BIEN or D.trong_thanh(p, 2.5):
					continue                        # mép map là núi viền; đoạn trong cổng thuộc phố
				tong += 1
				if tg.di_duoc(_v3(p)):
					duoc += 1
		_ok(tong > 5 and duoc == tong, "đường %s đi được suốt (%d/%d mẫu)" % [r.ten, duoc, tong])

	# ④ sông chặn, chỉ qua bằng cầu
	var cau_hop := Rect2(D.CAU.tam - Vector2(D.CAU.dai, D.CAU.rong) * 0.5, Vector2(D.CAU.dai, D.CAU.rong))
	for z in [-60.0, -30.0, 30.0]:
		var a := Vector3(D.song_x(z) - 9.0, 0, z)
		var b := Vector3(D.song_x(z) + 9.0, 0, z)
		var ds := tg.tim_duong(a, b)
		var qua_cau := false
		for p in _mau(a, ds):
			if cau_hop.grow(0.5).has_point(Vector2(p.x, p.z)):
				qua_cau = true
		_ok(not tg.nhin_thay(a, b) and not ds.is_empty() and qua_cau,
			"sông chặn ở z = %d: không lội thẳng được, phải vòng qua cầu (%.0f m)" % [z, _dai(a, ds)])
	_ok(tg.nhin_thay(_v3(cau_hop.position + Vector2(0.5, cau_hop.size.y * 0.5)), _v3(cau_hop.end - Vector2(0.5, cau_hop.size.y * 0.5))),
		"mặt cầu đi thẳng qua được")

	# ⑤ bốn vùng đúng hướng + đúng nội dung
	var huong := {"bac": Vector2(0, -1), "dong": Vector2(1, 0), "nam": Vector2(0, 1), "tay": Vector2(-1, 0)}
	var dat := {"bac": "rung", "dong": "dam", "nam": "co", "tay": "da_soi"}
	for v in D.VUNG:
		var c: Vector2 = (v.hop as Rect2).get_center() - D.TAM_THANH
		_ok(c.normalized().dot(huong[v.id]) > 0.7, "%s nằm phía %s của thành" % [v.ten, v.huong])
		var mau_dat := 0
		var tong := 0
		var h: Rect2 = v.hop
		for k in 200:
			var p := h.position + Vector2(fmod(k * 37.1, h.size.x), fmod(k * 13.7, h.size.y))
			tong += 1
			if tg.loai_dat(p) == dat[v.id]:
				mau_dat += 1
		_ok(mau_dat > tong * 0.45, "%s: mặt đất là '%s' (%d/%d mẫu)" % [v.ten, dat[v.id], mau_dat, tong])
	var dem: Dictionary = tg.dem
	var cay_bac: int = dem.get("bac", {}).get("cay", 0)
	var cay_khac := 0
	for k in dem:
		if k != "bac":
			cay_khac = maxi(cay_khac, dem[k].get("cay", 0))
	_ok(cay_bac > 200 and cay_bac > 4 * cay_khac, "rừng ở BẮC: %d cây (vùng khác nhiều nhất %d)" % [cay_bac, cay_khac])
	_ok(dem.get("nam", {}).get("lua", 0) >= 6 and dem.get("nam", {}).get("ruong", 0) >= 3, "ruộng lúa ở NAM")
	_ok(dem.get("tay", {}).get("bia", 0) >= 10 and dem.get("tay", {}).get("mom_da", 0) >= 3, "nghĩa địa + mỏm đá ở TÂY")
	_ok(dem.get("dong", {}).get("ao", 0) >= 3, "ao đầm ở ĐÔNG")
	for ten in ["Lò Rèn", "Tháp Pháp Sư", "Quán Rượu", "Nhà Kho", "Chợ"]:
		var n: Node3D = tg.nha.get(ten)
		_ok(n != null and D.trong_thanh(Vector2(n.global_position.x, n.global_position.z)), "%s nằm trong thành" % ten)
	var thap: Node3D = tg.nha.get("Tháp Pháp Sư")
	_ok(thap != null and thap.global_position.x > D.TAM_THANH.x and thap.global_position.z < D.TAM_THANH.y,
		"Tháp Pháp Sư ở góc ĐÔNG BẮC thành — như tranh")

	# ⑥ bản đồ Tab
	var bd: BanDoTab = main.ban_do
	var lech := 0.0
	for k in 50:
		var p := Vector3(fmod(k * 41.3, 200.0) - 100.0, 0, fmod(k * 17.9, 200.0) - 100.0)
		lech = maxf(lech, BanDoTab.the_gioi_cua(BanDoTab.uv_cua(p)).distance_to(p))
	_ok(lech < 0.001, "toạ độ thế giới ↔ bản đồ khứ hồi (lệch tối đa %.5f m)" % lech)
	var cg := D.cong()
	_ok(BanDoTab.uv_cua(_v3(cg.bac.tam)).y < BanDoTab.uv_cua(_v3(cg.nam.tam)).y
		and BanDoTab.uv_cua(_v3(cg.dong.tam)).x > BanDoTab.uv_cua(_v3(cg.tay.tam)).x,
		"bản đồ: bắc ở trên, đông bên phải")
	var tab := InputEventKey.new()
	tab.keycode = KEY_TAB
	tab.pressed = true
	main._unhandled_input(tab)
	var mo := bd.visible
	main._unhandled_input(tab)
	_ok(mo and not bd.visible, "phím Tab bật rồi tắt bản đồ")
	bd.bat_tat(true)
	nv.global_position = xp
	nv.duong.clear()
	var dich := _v3(cg.dong.tam + cg.dong.ra * 12.0)
	var bam := InputEventMouseButton.new()
	bam.button_index = MOUSE_BUTTON_LEFT
	bam.pressed = true
	bam.position = bd.man_cua(dich)
	bd._bam(bam)
	_ok(not nv.duong.is_empty() and nv.duong[-1].distance_to(dich) < 0.6,
		"bấm lên bản đồ ngoài Cổng Đông ⇒ nhân vật nhận đường tới đúng chỗ (lệch %.2f m)" % (nv.duong[-1].distance_to(dich) if not nv.duong.is_empty() else -1.0))
	bam.position = bd.khung().position - Vector2(10, 10)
	nv.duong.clear()
	bd._bam(bam)
	_ok(nv.duong.is_empty(), "bấm ra ngoài khung bản đồ thì không đi đâu")
	bd.bat_tat(false)
	var lop_nv := true
	for m: MeshInstance3D in nv.find_children("*", "MeshInstance3D", true, false):
		if m.visible and m.layers & 1:
			lop_nv = false
	_ok(lop_nv and (bd._cam.cull_mask & BanDoTab.LOP_NV) == 0, "camera chụp bản đồ không chụp nhân vật")

	print("\n%s" % ("TẤT CẢ PASS" if loi == 0 else "%d FAIL" % loi))
	quit(1 if loi else 0)
