extends SceneTree
## CỔNG LỐI CHƠI 3D-0: bấm đất thì đi tới đúng chỗ bấm · đường đi không xuyên vật cản · bấm cọc tập
## thì chạy tới chém và nhát chém trúng · camera bám nhân vật.
##
##     godot --headless --path godot -s tests/test_3d0.gd      (thoát 1 nếu đỏ)
##
## Bấm bằng toạ độ MÀN HÌNH qua chính `_bam()` của cảnh chính (chiếu tia từ camera xuống đất),
## không gọi thẳng di_toi: chỗ dễ hỏng là phép đổi màn hình → mặt đất.

const DT := 1.0 / 60.0
var loi := 0
var main: Node


func _init() -> void:
	main = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	_chay()


func _ok(dk: bool, m: String) -> void:
	print(("PASS " if dk else "FAIL ") + m)
	if not dk:
		loi += 1


func _buoc(n: int, xong := Callable()) -> bool:
	for i in n:
		main.nv.buoc(DT)
		main.nv.ap.advance(DT)
		main.cam._process(DT)
		if xong.is_valid() and xong.call():
			return true
	return false


func _chay() -> void:
	for i in 3:
		await process_frame
	var nv: NhanVat3D = main.nv
	var san: SanThu = main.san
	var cam: CameraMU = main.cam
	nv.set_process(false)
	cam.set_process(false)
	nv.ap.callback_mode_process = AnimationMixer.ANIMATION_CALLBACK_MODE_PROCESS_MANUAL
	cam.bam_ngay()

	# ① bấm một điểm đất trên màn ⇒ nhân vật tới đúng điểm đó (sai số < 0,3 m)
	var dich := Vector3(-3.5, 0, 6.0)
	var man := cam.unproject_position(dich)
	main._bam(man, true)
	var toi := _buoc(900, func(): return nv.duong.is_empty())
	var lech := Vector2(nv.global_position.x - dich.x, nv.global_position.z - dich.z).length()
	_ok(toi and lech < 0.3, "bấm đất: tới đúng chỗ bấm (lệch %.2f m)" % lech)

	# ② đường đi vòng cột. ⚠ Đo bằng HỘP BAO THẬT của mô hình cột, không đo bằng lưới đi bộ của game:
	# hỏi lại chính lưới thì lưới hỏng là cả game lẫn que dò cùng hỏng, bài vẫn xanh (đã thử ngược).
	var ab: AABB = san._hop(san.cot[0])
	var tam_cot := ab.get_center()
	nv.global_position = Vector3(tam_cot.x, 0, tam_cot.z - 3.0)
	nv.di_toi(san.tim_duong(nv.global_position, Vector3(tam_cot.x, 0, tam_cot.z + 3.0)))
	# ⚠ đếm vào MẢNG: lambda GDScript chép biến cục bộ THEO GIÁ TRỊ, nên `xuyen += 1` trong lambda không
	# bao giờ đổi biến ngoài — bộ đếm luôn ra 0 và mệnh đề xanh vĩnh viễn (thử ngược đã lộ ra)
	var dem := [0]
	_buoc(900, func():
		var p := nv.global_position
		if p.x > ab.position.x and p.x < ab.end.x and p.z > ab.position.z and p.z < ab.end.z:
			dem[0] += 1
		return nv.duong.is_empty())
	var xuyen: int = dem[0]
	_ok(xuyen == 0 and Vector2(nv.global_position.x - tam_cot.x, nv.global_position.z - tam_cot.z - 3.0).length() < 0.3,
		"đi vòng cột: tới nơi mà không lọt vào hộp bao của cột (%d nhịp trong cột)" % xuyen)

	# ③ bấm cọc tập trên màn ⇒ chạy tới, chém, nhát chém trúng đúng cọc
	var coc: Node3D = san.muc_tieu_thu[0]
	nv.global_position = coc.global_position + Vector3(4, 0, 4)
	cam.bam_ngay()
	var trung := []
	nv.ra_don.connect(func(m): trung.append(m))
	main._bam(cam.unproject_position(coc.global_position + Vector3(0, 0.5, 0)), true)
	_ok(nv.muc_tieu == coc, "bấm cọc tập trên màn: chọn đúng cọc làm mục tiêu")
	var chem := _buoc(600, func(): return not trung.is_empty())
	_ok(chem and trung[0] == coc, "chạy tới và nhát chém trúng cọc")
	var kc := Vector2(nv.global_position.x - coc.global_position.x, nv.global_position.z - coc.global_position.z).length()
	_ok(kc <= nv.tam_danh + 0.05, "chém trong tầm (đứng cách %.2f m, tầm %.1f m)" % [kc, nv.tam_danh])
	var mat := Vector3(sin(nv.rotation.y), 0, cos(nv.rotation.y))
	var toi_coc := (coc.global_position - nv.global_position)
	toi_coc.y = 0
	_ok(mat.dot(toi_coc.normalized()) > 0.95, "lúc chém mặt quay về cọc")

	# ④ camera bám: sau khi chạy xa, nhân vật nằm gần giữa màn VÀ camera giữ nguyên góc + tầm xa.
	# ⚠ Chỉ đo "nằm giữa màn" thì mù: camera đứng yên mà xoay đầu nhìn theo cũng ra giữa màn (đã thử ngược).
	nv.muc_tieu = null
	nv.di_toi(san.tim_duong(nv.global_position, Vector3(8, 0, 8)))
	_buoc(900, func(): return nv.duong.is_empty())
	_buoc(120)
	var p := cam.unproject_position(nv.global_position + Vector3(0, 1, 0))
	# ⚠ tâm lấy từ khung nhìn CỦA CAMERA, không lấy cỡ cửa sổ gốc: chạy không màn hình thì cửa sổ chỉ
	# 64×64 trong khi khung nhìn vẫn dựng theo cấu hình — bản đầu đo nhầm ra "lệch 860 px"
	var giua := cam.get_viewport().get_visible_rect().size / 2.0
	_ok(p.distance_to(giua) < 40.0, "camera bám: nhân vật gần giữa màn (cách %.0f px)" % p.distance_to(giua))
	var lui := cam.global_position - (nv.global_position + Vector3(0, 1, 0))
	var nang := rad_to_deg(asin(lui.y / lui.length()))
	_ok(absf(lui.length() - cam.tam_xa) < 0.2 and absf(nang - cam.goc_nang) < 1.0,
		"camera giữ góc cố định: cách %.2f m (cần %.1f), nâng %.1f° (cần %.0f°)" % [lui.length(), cam.tam_xa, nang, cam.goc_nang])
	print("\n%s" % ("TẤT CẢ PASS" if loi == 0 else "%d FAIL" % loi))
	quit(1 if loi else 0)
