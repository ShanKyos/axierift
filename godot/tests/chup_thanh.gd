extends SceneTree
## Chụp thành Ardhaven, bốn phòng trong nhà, và các bảng (hội thoại · tiệm · kho · túi).
##     xvfb-run godot --rendering-driver opengl3 --path godot -s tests/chup_thanh.gd

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
	var cam: Camera2D = main.cam
	var ng: TheGioi = main.ngoai
	cam.position_smoothing_enabled = false
	cam.reparent(main)
	cam.limit_left = -100000
	cam.limit_top = -100000
	cam.limit_right = 100000
	cam.limit_bottom = 100000
	cam.global_position = ng.tam_o(ng.tam_thanh)
	cam.zoom = Vector2(0.5, 0.5)
	main.hud.visible = false
	await _chup("thanh_toan")
	cam.zoom = Vector2(1, 1)
	for k in [["tb", Vector2i(47, 48)], ["db", Vector2i(63, 47)], ["tn", Vector2i(48, 63)], ["dn", Vector2i(63, 63)]]:
		cam.global_position = ng.tam_o(k[1])
		await _chup("thanh_" + k[0])
	main.hud.visible = true
	cam.reparent(main.nv)
	cam.position = Vector2.ZERO
	for cu in ng.cua:
		main.vao_nha(cu)
		cam.reparent(main.nv)
		cam.position = Vector2.ZERO
		await process_frame
		var npc: Npc = null
		for n: Npc in get_nodes_in_group("npc"):
			if n.the_gioi == main.the_gioi and n.vai != "dan":
				npc = n
		main.nv.position = main.the_gioi.tam_o(main.the_gioi.o_vao + Vector2i(0, -1))
		main.gd.mo_thoai(npc)
		await _chup("phong_%s" % cu["nha"])
		if NpcDuLieu.VAI[npc.vai]["nut"] == "mua":
			main.gd.mo_tiem()
		else:
			main.gd.mo_kho()
		await _chup("bang_%s" % cu["nha"])
		main.gd.dong_het()
		main.ra_nha()
	quit()
