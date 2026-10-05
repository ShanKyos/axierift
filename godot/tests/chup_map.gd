extends SceneTree
## Chụp toàn cảnh map (thu nhỏ) và cận cảnh thành — để xem bố cục bằng mắt.
##     xvfb-run godot --rendering-driver opengl3 --path godot -s tests/chup_map.gd

var main: Node


func _init() -> void:
	main = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	_chay()


func _chup(ten: String) -> void:
	await process_frame
	await process_frame
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png("res://tmp_chup/%s.png" % ten)
	print("CHUP ", ten)


func _chay() -> void:
	for i in 5:
		await process_frame
	var cam: Camera2D = main.cam
	var tg: TheGioi = main.the_gioi
	main.hud.visible = false
	cam.reparent(main)
	cam.limit_left = -100000
	cam.limit_top = -100000
	cam.limit_right = 100000
	cam.limit_bottom = 100000
	cam.position_smoothing_enabled = false
	cam.global_position = tg.tam_o(tg.tam_thanh)
	cam.zoom = Vector2(0.1, 0.1)
	await _chup("map_toan")
	cam.zoom = Vector2(0.5, 0.5)
	await _chup("map_thanh")
	cam.zoom = Vector2(1, 1)
	await _chup("map_quang_truong")
	cam.global_position = tg.tam_o(tg.tam_thanh + Vector2i(10, 0))
	await _chup("map_cong")
	cam.global_position = tg.tam_o(Vector2i(74, 48))
	cam.zoom = Vector2(0.5, 0.5)
	await _chup("map_cau")
	quit()
