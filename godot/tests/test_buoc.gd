extends SceneTree
## CỔNG VẬT LÝ 3D: bàn chân đang chống không trượt trên đất · không xuyên đất · không lơ lửng ·
## đi đúng hướng mặt nhìn.
##
##     godot --headless --path godot -s tests/test_buoc.gd      (thoát 1 nếu đỏ)
##
## Lái CHÍNH `NhanVat3D.buoc()` của game, và tua hoạt ảnh cùng nhịp (AnimationPlayer để chế độ tay),
## rồi đo vị trí THẾ GIỚI của mũi chân từ bộ xương. Không chép công thức tốc độ sang đây: chỗ dễ
## hỏng là sợi dây giữa số đo hoạt ảnh và cách game dời nhân vật.

const DT := 1.0 / 120.0
const NGUONG_TRUOT := 0.035          # m: chân chống được phép lệch bao nhiêu suốt một lượt chống
const CHAM := 0.055                  # m: mũi chân thấp hơn mức này là đang chạm đất (đứng yên: 0,026)
var loi := 0
var da_do := 0
var main: Node


func _init() -> void:
	main = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	_chay()


func _ok(dk: bool, m: String) -> void:
	print(("PASS " if dk else "FAIL ") + m)
	if not dk:
		loi += 1


func _chay() -> void:
	for i in 3:
		await process_frame
	var nv: NhanVat3D = main.nv
	nv.set_process(false)
	nv.ap.callback_mode_process = AnimationMixer.ANIMATION_CALLBACK_MODE_PROCESS_MANUAL
	_ok(nv.toc_do("chay") > 1.0 and nv.toc_do("di") > 0.3,
		"đo được tốc độ từ hoạt ảnh: đi %.2f m/s · chạy %.2f m/s" % [nv.toc_do("di"), nv.toc_do("chay")])

	# ① đứng yên: chân chạm đất, không lún, không lơ lửng
	nv.global_position = Vector3(0, 0, 4)
	nv.duong.clear()
	nv._vao("dung", true)
	var thap := 1e9
	var cao := -1e9
	for i in 240:
		nv.buoc(DT)
		nv.ap.advance(DT)
		nv.sk.force_update_all_bone_transforms()
		var y := minf(nv.ban_chan("l").y, nv.ban_chan("r").y)
		if i > 40:
			thap = minf(thap, y)
			cao = maxf(cao, y)
	_ok(thap > -0.03 and cao < 0.06, "đứng: mũi chân chạm đất (%.3f … %.3f m)" % [thap, cao])

	# ② chạy thẳng theo 8 hướng
	for h in 8:
		var goc := h * PI / 4.0
		var dir := Vector3(sin(goc), 0, cos(goc))
		var p0 := Vector3(0, 0, 0) - dir * 4.0
		nv.global_position = p0
		nv._huong = goc
		nv.rotation.y = goc
		nv._vao("dung", true)
		nv.ap.advance(0.5)
		nv.duong = [p0 + dir * 8.0] as Array[Vector3]
		var dang: Dictionary = {"l": [], "r": []}       # các lượt chống: mảng điểm chạm đất liền nhau
		var tren: Dictionary = {"l": false, "r": false}
		var y_min := 1e9
		var t := 0.0
		while not nv.duong.is_empty() and t < 8.0:
			nv.buoc(DT)
			nv.ap.advance(DT)
			nv.sk.force_update_all_bone_transforms()
			t += DT
			if t < 0.4:                                   # bỏ đoạn hoà trộn đứng → chạy
				continue
			var pl := nv.ban_chan("l")
			var pr := nv.ban_chan("r")
			y_min = minf(y_min, minf(pl.y, pr.y))
			for ben in ["l", "r"]:
				var p: Vector3 = pl if ben == "l" else pr
				var cham := p.y < CHAM                     # chân chống = mũi chân SÁT ĐẤT (chạy có pha bay)
				if cham:
					if not tren[ben]:
						dang[ben].append([])
					dang[ben][-1].append(Vector2(p.x, p.z))
				tren[ben] = cham
		var truot := 0.0
		var so_luot := 0
		for ben in ["l", "r"]:
			for luot in dang[ben]:
				if luot.size() < 4:                       # quá ngắn để đo — khoảnh khắc đổi chân
					continue
				so_luot += 1
				var dau: Vector2 = luot[0]
				for q in luot:
					truot = maxf(truot, dau.distance_to(q))
		_ok(so_luot >= 4 and truot <= NGUONG_TRUOT,
			"chạy hướng %d (%d°): chân chống lệch %.3f m qua %d lượt chống" % [h, h * 45, truot, so_luot])
		_ok(y_min > -0.04, "chạy hướng %d: không xuyên đất (thấp nhất %.3f m)" % [h, y_min])
		var mat := Vector3(sin(nv.rotation.y), 0, cos(nv.rotation.y))
		_ok(mat.dot(dir) > 0.98, "chạy hướng %d: mặt nhìn đúng hướng đi" % h)
		da_do += 1
	if da_do != 8:
		_ok(false, "chỉ %d/8 hướng chạy hết — que dò hỏng" % da_do)
	print("\n%s" % ("TẤT CẢ PASS" if loi == 0 else "%d FAIL" % loi))
	quit(1 if loi else 0)
