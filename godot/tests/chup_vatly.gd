extends SceneTree
## Chụp từng pha vật lý của Dark Knight, game chạy THẬT (không lái tay từng nhịp):
## đứng · vừa xuất phát · đang chạy · vừa dừng · lấy đà · lao chém · trúng đòn · đang đổ · nằm.
##     xvfb-run -a -s "-screen 0 1280x720x24" godot --path godot -s tests/chup_vatly.gd

var main: Node
var nv: NhanVat


func _init() -> void:
	main = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	_chay()


func _chup(ten: String) -> void:
	await RenderingServer.frame_post_draw
	var im := root.get_texture().get_image()
	# cắt cận quanh bàn chân nhân vật (toạ độ khung nhìn → điểm ảnh cửa sổ)
	var o := nv.get_global_transform_with_canvas().origin * (float(im.get_width()) / 640.0)
	var r := Rect2i(int(o.x) - 150, int(o.y) - 230, 300, 280)
	im.get_region(r).save_png("res://tmp_chup/vl_%s.png" % ten)
	print("CHUP ", ten, "  th=%.3f p=%s" % [nv.vl.th, nv.vl.p])


func _cho(giay: float) -> void:
	await create_timer(giay).timeout


func _chay() -> void:
	for i in 5:
		await process_frame
	nv = main.nv
	var ng: TheGioi = main.ngoai
	var ds := get_nodes_in_group("quai")
	for q in ds:
		q.position += Vector2(5000, 5000)
		q.nha = q.position
	var goc := ng.tam_o(ng.tam_thanh + Vector2i(0, 23))
	nv.position = goc
	main.pet.bam_ngay()
	await _cho(1.0)
	await _chup("1_dung")
	nv.di_toi(goc + Vector2(330, 10))
	for i in 6:
		await process_frame
	await _chup("2_xuat_phat")
	await _cho(0.45)
	await _chup("3_chay")
	while not nv.duong.is_empty():
		await process_frame
	await _cho(0.06)
	await _chup("4_dung_lai")
	await _cho(1.0)
	var q: Quai = ds[0]
	q.position = nv.position + Vector2(34, 2)
	q.nha = q.position
	q.hp = 99999.0
	q.hp_max = 99999.0
	nv.tan_cong(q)
	while not (nv.trang_thai == "attack" and nv.vl._danh_t > 0.16):
		await process_frame
	await _chup("5_lay_da")
	while not nv.vl._danh_lao:
		await process_frame
	await _cho(0.05)
	await _chup("6_lao_chem")
	nv.muc_tieu = null
	q.position += Vector2(5000, 5000)
	await _cho(1.0)
	var ke := Node2D.new()
	ke.position = nv.position + Vector2(-40, 0)
	root.add_child(ke)
	nv.nhan_sat_thuong(12.0, ke)
	await _cho(0.05)
	await _chup("7_trung_don")
	await _cho(1.0)
	nv.hp = 1.0
	nv.nhan_sat_thuong(9999.0, ke)
	await _cho(0.38)
	await _chup("8_dang_do")
	await _cho(1.2)
	await _chup("9_nam")
	quit()
