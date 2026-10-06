extends SceneTree
## Thân người chơi nướng từ 3D (`hd_dark_wizard`, tools/hd/nuong_3d.py) — gác ĐÚNG những chỗ đã hỏng
## lúc dựng, không gác "có ảnh không":
##
##     godot --headless --path godot -s tests/test_than3d.gd      (thoát 1 nếu đỏ)
##
## ① người chơi thật sự nạp bộ 3D (và KHÔNG gắn VatLyThan — bộ này có động tác thật)
## ② đủ 6 trạng thái × 8 hướng, không khung nào trống (bọc da hỏng ⇒ mảnh văng ra khỏi ô)
## ③ bàn chân ĐỨNG ĐÚNG neo ở mọi hướng (đế giày thò dưới gốc ⇒ nhân vật lún xuống đất)
## ④ 8 hướng là 8 tư thế khác nhau (nút cha glTF dùng quaternion: xoay euler không ăn ⇒ 8 hướng y hệt)
## ⑤ nhân vật không bị cắt ở mép ô (bước chân tới gần camera, thân ngã nằm ngang)
## ⑥ tốc độ đo từ bàn chân: chạy nhanh hơn đi, và cả hai trong khoảng người thật
## ⑦ ngã xong là NẰM: khung cuối bè ngang hơn khung đứng

var loi := 0


func _init() -> void:
	SpriteBo.THAN_NGUOI = ["hd_dark_wizard"]
	_chay()


func _ok(dk: bool, m: String) -> void:
	if dk:
		print("PASS ", m)
	else:
		print("FAIL ", m)
		loi += 1


## Hộp alpha của một khung (px texture trong ô): Rect2i, hoặc rỗng.
func _hop(bo: SpriteBo, tt: String, d: int, k: int) -> Rect2i:
	var at: AtlasTexture = bo.frames.get_frame_texture("%s_%d" % [tt, d], k)
	var im := at.atlas.get_image()
	if im.is_compressed():
		im.decompress()
	var r := at.region
	var o := im.get_region(Rect2i(r.position, r.size))
	return o.get_used_rect()


func _chay() -> void:
	var main: Node = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	for i in 3:
		await process_frame
	var nv: NhanVat = main.nv
	_ok(nv.bo.meta.get("nguon", "").begins_with("3D"), "① người chơi dùng bộ 3D (%s)" % nv.bo.meta.get("nguon", "?"))
	_ok(nv.vl == null, "① không gắn VatLyThan")
	var bo := nv.bo
	var o := bo.o
	var trong := 0
	var cat := 0
	var tong := 0
	for tt in ["idle", "walk", "run", "attack", "hit", "death"]:
		_ok(bo.co(tt), "② có trạng thái %s" % tt)
		if not bo.co(tt):
			continue
		for d in 8:
			for k in bo.so_khung(tt):
				var h := _hop(bo, tt, d, k)
				tong += 1
				if h.size.x < 10 or h.size.y < 10:
					trong += 1
				elif h.position.x <= 0 or h.position.y <= 0 or h.end.x >= o or h.end.y >= o:
					cat += 1
	_ok(trong == 0, "② không khung nào trống (%d/%d)" % [trong, tong])
	_ok(cat == 0, "⑤ không khung nào chạm mép ô (%d/%d)" % [cat, tong])
	# ③ chân: đáy hình ở khung đứng phải sát neo (cho phép đế giày ± vài px do góc nhìn)
	var lech := []
	for d in 8:
		var h := _hop(bo, "idle", d, 0)
		lech.append(h.end.y - bo.neo_tex.y)
	var max_lech := 0.0
	for x in lech:
		max_lech = maxf(max_lech, absf(x))
	_ok(max_lech <= 14.0, "③ bàn chân đứng đúng neo ở 8 hướng (lệch %s px texture)" % str(lech))
	# ④ 8 hướng khác nhau: so hộp + một phép băm điểm ảnh của khung đứng
	var vet := {}
	for d in 8:
		var at: AtlasTexture = bo.frames.get_frame_texture("idle_%d" % d, 0)
		var im := at.atlas.get_image()
		var r := at.region
		var b := im.get_region(Rect2i(r.position, r.size)).get_data()
		vet[hash(b)] = true
	_ok(vet.size() == 8, "④ 8 hướng ra 8 tư thế khác nhau (%d)" % vet.size())
	# ⑥ tốc độ
	var di: float = bo.meta["trang_thai"]["walk"]["toc_do_m_s"]
	var chay: float = bo.meta["trang_thai"]["run"]["toc_do_m_s"]
	_ok(di > 0.8 and di < 2.2, "⑥ đi %.2f m/s (người thật 1–2)" % di)
	_ok(chay > di * 1.8 and chay < 7.0, "⑥ chạy %.2f m/s, nhanh hơn đi" % chay)
	# ⑦ ngã nằm
	var n := bo.so_khung("death")
	var dung := _hop(bo, "idle", 6, 0)
	var nam := _hop(bo, "death", 6, n - 1)
	_ok(float(nam.size.x) / nam.size.y > float(dung.size.x) / dung.size.y * 1.5,
		"⑦ khung ngã cuối nằm bè ra (%s → %s)" % [str(dung.size), str(nam.size)])
	print("TONG: %d loi" % loi)
	quit(1 if loi > 0 else 0)
