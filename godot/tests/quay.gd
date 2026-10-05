extends SceneTree
## Quay một đoạn chơi thật thành chuỗi ảnh (ghép GIF bên ngoài): chạy tới quái, chém tới chết, nhặt đồ.
##     xvfb-run godot --rendering-driver opengl3 --path godot -s tests/quay.gd

var main: Node


func _init() -> void:
	main = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	_chay()


func _chay() -> void:
	for i in 10:
		await process_frame
	var nv: NhanVat = main.nv
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path("res://tmp_chup/quay"))
	# chạy một vòng theo bốn hướng chéo cho thấy đủ dáng chạy, rồi đi đánh con gần nhất
	var dich := [Vector2(120, 60), Vector2(-120, 60), Vector2(-120, -60), Vector2(120, -60)]
	var so := 0
	for dv in dich:
		nv.di_toi(nv.position + dv)
		for i in 40:
			await process_frame
			if i % 3 == 0:
				await _luu(so)
				so += 1
	var gan: Quai = null
	for q in main.get_tree().get_nodes_in_group("quai"):
		if gan == null or nv.position.distance_to(q.position) < nv.position.distance_to(gan.position):
			gan = q
	nv.tan_cong(gan)
	for i in 900:
		await process_frame
		if i % 3 == 0:
			await _luu(so)
			so += 1
		if gan.chet and i > 0 and so > 260:
			break
	print("QUAY ", so)
	quit()


func _luu(i: int) -> void:
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png("res://tmp_chup/quay/%04d.png" % i)
