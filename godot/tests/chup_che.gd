extends SceneTree
## Kiểm thứ tự che khuất quanh công trình to (cắt dải): người đứng TRƯỚC mặt hông nhà phải đè lên
## nhà; đứng SAU nhà thì bị nhà che. Chụp 4 ảnh để xem bằng mắt.

var main: Node


func _init() -> void:
	main = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	_chay()


func _chup(ten: String) -> void:
	for i in 3:
		await process_frame
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png("res://tmp_chup/che_%s.png" % ten)
	print("CHUP ", ten)


func _chay() -> void:
	for i in 5:
		await process_frame
	var nv: NhanVat = main.nv
	var tg: TheGioi = main.the_gioi
	main.hud.visible = false
	# nhà A ở ô (40,40) cỡ 3×3: mặt hông trái chạy dọc x=40, y 40..42 → đứng ngoài ở (39,41)? (39 là tường)
	# dùng nhà A ở (53,40) xoay 1: chiếm x 53..55, y 40..42
	for vi_tri in [["truoc_trai", Vector2i(54, 43)], ["truoc_phai", Vector2i(56, 41)], ["sau", Vector2i(54, 39)], ["sau_trai", Vector2i(52, 41)]]:
		nv.position = tg.tam_o(vi_tri[1])
		await _chup(vi_tri[0])
	quit()
