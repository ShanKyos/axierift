extends SceneTree
## Chụp sân thử 3D-0: đứng · đang chạy · đang chém · camera kéo gần.
##     xvfb-run godot --path godot -s tests/chup3d.gd        (Forward+, cần Vulkan — có Mesa lavapipe là đủ)

var main: Node


func _init() -> void:
	main = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	_chay()


func _chup(ten: String) -> void:
	for i in 4:
		await process_frame
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png("res://tmp_chup/%s.png" % ten)
	print("CHUP ", ten)


func _cho(giay: float) -> void:
	await create_timer(giay).timeout


func _chay() -> void:
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path("res://tmp_chup"))
	await _cho(1.0)
	main.cam.bam_ngay()
	await _chup("3d0_dung")
	var nv: NhanVat3D = main.nv
	nv.di_toi(main.san.tim_duong(nv.global_position, Vector3(-7, 0, 2)))
	await _cho(0.45)
	await _chup("3d0_chay")
	nv.global_position = Vector3(3, 0, -1.2)
	main.cam.bam_ngay()
	nv.danh(main.san.muc_tieu_thu[0])
	await _cho(0.32)
	await _chup("3d0_chem")
	main.cam.tam_xa = 10.0
	main.cam.bam_ngay()
	await _cho(0.6)
	await _chup("3d0_gan")
	quit()
