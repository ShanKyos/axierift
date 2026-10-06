extends SceneTree
## VẬT LÝ THÂN của Dark Knight (gói Meowa chỉ có 13 khung thở): đo đúng các tính chất của
## phương trình chuyển động, không đo "trông có vẻ động".
##
##     godot --headless --path godot -s tests/test_vatly.gd      (thoát 1 nếu đỏ)
##
## ① có gắn: người chơi dùng bộ hd_dark_knight và có VatLyThan
## ② QUÁN TÍNH: vừa xuất phát chạy sang phải thì thân ngả về TRÁI (bị bỏ lại) trước
## ③ chạy đều thì nghiêng TỚI trước (vào chiều chạy), có nhún theo bước
## ④ dừng lại thì chúi tới trước rồi tự đứng thẳng (lắc tắt dần)
## ⑤ chém: lấy đà NGƯỢC chiều đòn, rồi lao tới đúng trước khung trúng
## ⑥ trúng đòn: thân bị đẩy RA XA kẻ đánh
## ⑦ chết: đổ hẳn xuống 90°, nhanh dần (trọng lực), rồi nằm yên — không lật quá, không bật dậy

const DT := 1.0 / 60.0
var loi := 0
var main: Node
var nv: NhanVat


func _init() -> void:
	main = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	_chay()


func _ok(dk: bool, m: String) -> void:
	if dk:
		print("PASS ", m)
	else:
		print("FAIL ", m)
		loi += 1


func _nhip(n := 1) -> void:
	for i in n:
		nv._process(DT)
		nv.vl._process(DT)


func _chay() -> void:
	for i in 3:
		await process_frame
	nv = main.nv
	var ng: TheGioi = main.ngoai
	_ok(nv.bo.ten == "hiep_si" and nv.bo.meta.get("vat_ly", false), "① người chơi dùng bộ Dark Knight (vat_ly)")
	_ok(nv.vl != null, "① có VatLyThan")
	if nv.vl == null:
		quit(1)
		return
	var vl := nv.vl
	# bãi trống ngoài đồng để chạy thẳng sang phải màn hình
	for q in get_nodes_in_group("quai"):
		q.position += Vector2(4000, 4000)
	var goc := ng.tam_o(ng.tam_thanh + Vector2i(0, 12))
	nv.position = goc
	_nhip(60)
	var dich := goc + Vector2(260, 0)
	nv.duong = PackedVector2Array([dich])
	var min_dau := 0.0
	for i in 8:
		_nhip()
		min_dau = minf(min_dau, vl.th)
	_ok(min_dau < -0.02, "② vừa chạy sang phải thân ngả về sau trước (min %.3f rad)" % min_dau)
	var tong := 0.0
	var dem := 0
	var nhun_max := 0.0
	for i in 40:
		_nhip()
		if i > 15 and not nv.duong.is_empty():
			tong += vl.th
			dem += 1
			nhun_max = maxf(nhun_max, vl._nhun)
	var tb := tong / maxi(1, dem)
	_ok(dem > 5 and tb > 0.06, "③ chạy đều nghiêng tới trước (TB %.3f rad trên %d nhịp)" % [tb, dem])
	_ok(nhun_max > 1.0, "③ có nhún theo bước (đỉnh %.2f px)" % nhun_max)
	# chạy tới đích rồi dừng
	var dung := false
	for i in 300:
		_nhip()
		if nv.duong.is_empty():
			dung = true
			break
	_ok(dung, "④ tới đích")
	var max_sau := 0.0
	var th_dung := vl.th
	for i in 20:
		_nhip()
		max_sau = maxf(max_sau, vl.th)
	_nhip(120)
	_ok(max_sau > th_dung - 0.001 and max_sau > 0.05, "④ dừng thì chúi tới (%.3f rad)" % max_sau)
	_ok(absf(vl.th) < 0.01 and absf(vl.om) < 0.05, "④ rồi đứng thẳng lại (%.4f rad)" % vl.th)

	# ⑤ chém một con quái đứng bên PHẢI
	var q: Quai = get_nodes_in_group("quai")[0]
	q.position = nv.position + Vector2(30, 0)
	q.nha = q.position
	q.hp = 99999.0
	q.hp_max = 99999.0
	nv.tan_cong(q)
	var min_lay := 0.0
	var max_lao := 0.0
	var lao_x := 0.0
	for i in 40:
		_nhip()
		if nv.trang_thai != "attack":
			continue
		if not vl._danh_lao:
			min_lay = minf(min_lay, vl.th)
		else:
			max_lao = maxf(max_lao, vl.th)
			lao_x = maxf(lao_x, vl.p.x)
	_ok(min_lay < -0.04, "⑤ lấy đà ngả NGƯỢC chiều đòn (%.3f rad)" % min_lay)
	_ok(max_lao > 0.08 and lao_x > 2.0, "⑤ lao tới: nghiêng %.3f rad, dời %.1f px" % [max_lao, lao_x])
	# ⚠ đo theo GIÂY, không theo `hinh.frame`: vòng lặp tay không chạy AnimatedSprite2D nên khung đứng ở 0
	var t_trung := float(nv.bo.khung_trung("attack")) / nv.bo.fps("attack")
	_ok(vl.t_lao > 0.1 and vl.t_lao <= t_trung, "⑤ lao ngay trước khung trúng (%.3f s, trúng %.3f s)" % [vl.t_lao, t_trung])
	nv.muc_tieu = null
	q.position += Vector2(4000, 4000)
	_nhip(180)

	# ⑥ trúng đòn từ bên TRÁI
	var ke := Node2D.new()
	ke.position = nv.position + Vector2(-40, 0)
	root.add_child(ke)
	var p0 := vl.p
	nv.nhan_sat_thuong(5.0, ke)
	var max_px := 0.0
	for i in 12:
		_nhip()
		max_px = maxf(max_px, vl.p.x - p0.x)
	_ok(max_px > 1.5, "⑥ trúng đòn từ trái bị đẩy sang phải (%.2f px)" % max_px)
	_nhip(120)

	# ⑦ chết
	nv.hp = 1.0
	nv.nhan_sat_thuong(9999.0, ke)
	_ok(nv.chet and vl._nga, "⑦ vào trạng thái ngã")
	var goc_ds := []
	var t_cham := -1.0
	for i in 120:
		vl._process(DT)                       # NhanVat._process thoát sớm khi chết
		goc_ds.append(absf(vl.th))
		if t_cham < 0.0 and absf(vl.th) >= PI * 0.5 - 0.001:
			t_cham = (i + 1) * DT
	_ok(t_cham > 0.25 and t_cham < 1.2, "⑦ đổ chạm đất sau %.2f s (con lắc 0,9 m dưới trọng lực)" % t_cham)
	# nhanh dần: quãng góc đi trong nhịp 10→15 nhỏ hơn nhịp 15→20 (trước khi chạm đất)
	var tang: bool = (goc_ds[19] - goc_ds[14]) > (goc_ds[14] - goc_ds[9])
	_ok(tang, "⑦ đổ NHANH DẦN (gia tốc góc dương)")
	var max_cuoi := 0.0
	for g in goc_ds:
		max_cuoi = maxf(max_cuoi, g)
	_ok(max_cuoi <= PI * 0.5 + 0.001, "⑦ không lật quá 90°")
	_ok(absf(absf(vl.th) - PI * 0.5) < 0.01 and absf(vl.om) < 0.01, "⑦ nằm yên trên đất")
	ke.queue_free()
	print("TONG: %d loi" % loi)
	quit(1 if loi > 0 else 0)
