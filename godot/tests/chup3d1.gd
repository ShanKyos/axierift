extends SceneTree
## Chụp Ardhaven 3D (mốc 3D-1) để so với tranh tổng quan: quảng trường · bốn hướng · bản đồ Tab.
## Kèm phần kiểm CẦN GPU của test_3d1: ảnh bản đồ Tab chụp ra có đúng màu ở đúng chỗ không (sông
## xanh nước, rừng bắc xanh lá, đồi tây màu đất) — tức camera chụp nhìn đúng hướng, đúng khung.
##     xvfb-run godot --path godot -s tests/chup3d1.gd        (Forward+, cần Vulkan — Mesa lavapipe là đủ)
## Thoát 1 nếu phần kiểm màu đỏ.

const D := preload("res://scripts/du_lieu/ardhaven_3d.gd")
var main: Node
var loi := 0


## Màu trung bình ô 9×9 px quanh một điểm thế giới trên ảnh bản đồ.
func _mau(im: Image, x: float, z: float) -> Color:
	var uv := BanDoTab.uv_cua(Vector3(x, 0, z))
	var c := Vector2i(int(uv.x * im.get_width()), int(uv.y * im.get_height()))
	var t := Color(0, 0, 0)
	for dy in range(-4, 5):
		for dx in range(-4, 5):
			t += im.get_pixelv(c + Vector2i(dx, dy))
	return t / 81.0


func _kiem_ban_do(im: Image) -> void:
	var song := _mau(im, D.song_x(-30.0), -30.0)
	var co := _mau(im, -20.0, 45.0)
	var dat := _mau(im, -70.0, -2.0)
	print("màu bản đồ — sông ", song, " · cỏ nam ", co, " · đất đường tây ", dat)
	var ok_song := song.b > song.r + 0.03 and song.b > co.b
	var ok_dat := dat.r > dat.g and dat.g > dat.b and dat.r > co.r
	var ok_co := co.g > co.r * 0.95 and co.g > co.b
	for k in [[ok_song, "chỗ sông trên bản đồ có màu NƯỚC (xanh hơn cỏ)"], [ok_dat, "đường đất phía tây có màu ĐẤT"],
			[ok_co, "đồng phía nam có màu CỎ"]]:
		print(("PASS " if k[0] else "FAIL ") + k[1])
		if not k[0]:
			loi += 1


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


func _toi(p: Vector3, xa := 16.0) -> void:
	main.nv.global_position = p
	main.nv.duong.clear()
	main.cam.tam_xa = xa
	main.cam.bam_ngay()
	await create_timer(0.4).timeout


func _chay() -> void:
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path("res://tmp_chup"))
	await create_timer(1.5).timeout
	if main.ban_do.anh_chup:
		main.ban_do.anh_chup.save_png("res://tmp_chup/3d1_bando_tho.png")
		print("CHUP 3d1_bando_tho")
		_kiem_ban_do(main.ban_do.anh_chup)
	else:
		print("FAIL bản đồ Tab không chụp được ảnh (renderer không chạy?)")
		loi += 1
	await _toi(Ardhaven3D.XUAT_PHAT)
	await _chup("3d1_quangtruong")
	await _toi(Ardhaven3D.XUAT_PHAT, 40.0)
	await _chup("3d1_thanh_xa")
	await _toi(Vector3(0, 0, -44), 26.0)
	await _chup("3d1_cong_bac")
	await _toi(Vector3(-2, 0, -70), 26.0)
	await _chup("3d1_rung_bac")
	await _toi(Vector3(56, 0, -8), 26.0)
	await _chup("3d1_cau_dong")
	await _toi(Vector3(2, 0, 64), 30.0)
	await _chup("3d1_ruong_nam")
	await _toi(Vector3(-66, 0, 10), 30.0)
	await _chup("3d1_mo_tay")
	await _toi(Ardhaven3D.XUAT_PHAT)
	main.ban_do.bat_tat(true)
	await _chup("3d1_tab")
	print("\n%s" % ("TẤT CẢ PASS" if loi == 0 else "%d FAIL" % loi))
	quit(1 if loi else 0)
