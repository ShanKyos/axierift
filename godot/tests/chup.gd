extends SceneTree
## Chụp màn hình M0 để xem bằng mắt: godot --path godot -s tests/chup.gd  (cần màn hình ảo)
## Lái bằng hàm thật của game (di_toi · tan_cong), không bơm sự kiện chuột.

var main: Node


func _init() -> void:
	main = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	_chay()


func _cho(n: int) -> void:
	for i in n:
		await process_frame


func _chup(ten: String) -> void:
	await RenderingServer.frame_post_draw
	var img := root.get_texture().get_image()
	img.save_png("res://tmp_chup/%s.png" % ten)
	print("CHUP ", ten, " ", img.get_size())


func _chay() -> void:
	await _cho(10)
	await _chup("1_thanh")
	var nv: NhanVat = main.nv
	var gan: Quai = null
	for q in main.get_tree().get_nodes_in_group("quai"):
		if gan == null or nv.position.distance_to(q.position) < nv.position.distance_to(gan.position):
			gan = q
	nv.tan_cong(gan)
	for i in 600:
		await process_frame
		if nv.trang_thai == "attack":
			break
	await _cho(4)
	await _chup("2_danh")
	for i in 900:
		await process_frame
		if gan.chet:
			break
	await _cho(40)
	await _chup("3_ha")
	print("KQ quai_hp=", gan.hp, "/", gan.hp_max, " tt_nv=", nv.trang_thai, " kc=", Iso.kc_dat(nv.position, gan.position), " quai_chet=", gan.chet, " hp_nv=", nv.hp, " exp=", nv.kinh_nghiem, " lumen=", nv.lumen)
	quit()
