extends SceneTree
## Chụp màn hình game như người chơi thấy: trong thành · ngoài đồng đang đánh · trong nhà · túi đồ.
##     xvfb-run godot --rendering-driver opengl3 --path godot -s tests/chup_tongthe.gd

var main: Node


func _init() -> void:
	main = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	_chay()


func _chup(ten: String) -> void:
	for i in 3:
		await process_frame
	await RenderingServer.frame_post_draw
	var im := root.get_texture().get_image()
	im.resize(im.get_width() * 2, im.get_height() * 2, Image.INTERPOLATE_NEAREST)
	im.save_png("res://tmp_chup/%s.png" % ten)
	print("CHUP ", ten)


func _chay() -> void:
	for i in 5:
		await process_frame
	var nv: NhanVat = main.nv
	var ng: TheGioi = main.ngoai
	# 1. trong thành, quảng trường
	await create_timer(1.5).timeout
	await _chup("tt_1_thanh")
	# 2. ngoài đồng: đứng giữa đàn Bọ Giáp vòng một, đánh con gần nhất
	var p := ng.tam_o(ng.tam_thanh + Vector2i(0, 23))
	nv.position = p
	main.pet.bam_ngay()
	var ds := get_nodes_in_group("quai")
	for i in 4:
		var q: Quai = ds[i]
		q.position = p + Iso.nen(Vector2.from_angle(i * 1.6 + 0.4) * (36.0 + i * 14.0))
		q.nha = q.position
	nv.lumen = 2400
	nv.cap = 6
	nv.tan_cong(ds[0])
	await create_timer(2.2).timeout
	await _chup("tt_2_dong")
	# 3. trong quán rượu, nói chuyện với cô bán rượu
	for cu in ng.cua:
		if cu["nha"] == "quan_ruou":
			main.vao_nha(cu)
	await process_frame
	nv.position = main.the_gioi.tam_o(Vector2i(4, 5))
	main.pet.bam_ngay()
	for n: Npc in get_nodes_in_group("npc"):
		if n.the_gioi == main.the_gioi and n.vai == "ruou":
			main.gd.mo_thoai(n)
	await create_timer(0.5).timeout
	await _chup("tt_3_quan")
	main.gd.mo_tiem()
	await _chup("tt_4_tiem")
	quit()
