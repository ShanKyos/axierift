extends SceneTree
## Chụp nhân vật + pet Axie trong thành, ngoài đồng, và bảng chọn Axie (P).
##     xvfb-run godot --rendering-driver opengl3 --path godot -s tests/chup_axie.gd

var main: Node


func _init() -> void:
	main = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	_chay()


func _chup(ten: String) -> void:
	for i in 3:
		await process_frame
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png("res://tmp_chup/%s.png" % ten)
	print("CHUP ", ten)


func _chay() -> void:
	for i in 5:
		await process_frame
	var nv: NhanVat = main.nv
	var ng: TheGioi = main.ngoai
	main.cam.position_smoothing_enabled = false
	nv.position = ng.tam_o(ng.tam_thanh + Vector2i(-3, 3))
	nv.huong = 1
	main.pet.bam_ngay()
	await _chup("axie_thanh")
	nv.position = ng.tam_o(ng.tam_thanh + Vector2i(0, 24))
	main.pet.bam_ngay()
	await create_timer(0.3).timeout
	await _chup("axie_dong")
	main.gd.bat_tat_axie()
	await _chup("axie_bang")
	quit()
