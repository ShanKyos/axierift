extends SceneTree
## CỔNG VẬT LÝ: bàn chân không trượt · không xuyên đất · hướng sprite khớp hướng đi.
##
##     godot --headless --path godot -s tests/test_chan.gd      (thoát 1 nếu đỏ)
##
## Lái CHÍNH hàm `ThanThe.buoc_di()` của game theo cả 8 hướng, không dựng lại công thức ở đây:
## chỗ dễ hỏng là sợi dây giữa số đo lúc render (sải, tốc độ, vị trí bàn chân) và cách game
## dời node + chọn khung — kiểm bảng thì bảng không bao giờ sai.

const DT := 1.0 / 120.0
const NGUONG_TRUOT := 1.0          # px: bàn chân đang chống được phép lệch bao nhiêu giữa các khung
var loi := 0
var da_do := 0                     # số phép đo trượt THẬT SỰ chạy tới cuối


func _init() -> void:
	_chay()


func _chay() -> void:
	# ⚠ BÀI NÀY GÁC BỘ PIXEL (nướng từ 3D, có số đo bàn chân chính xác lúc render) — tắt HD.
	# Bộ HD hiện tại là tranh AI vẽ sẵn, KHÔNG khoá bàn chân vào đất: chân chống tự trôi vài px
	# giữa các khung, và ở góc nghiêng hai chân chéo nhau nên đo từ ảnh không tách được chân nào
	# đang chống (đo ra trượt 20-39 px). Không sửa được bằng mã — cần art HD nướng có số đo chân.
	SpriteBo.HD = false
	await process_frame                # cây cảnh sẵn sàng thì `_ready` của node mới chạy
	_kiem_xuyen_dat("hiep_si", ["walk", "run", "idle", "attack", "hit", "death"])
	_kiem_xuyen_dat("bo_giap", ["walk", "idle", "attack", "hit", "death"])
	for tt in ["walk", "run"]:
		for d in 8:
			await _kiem_truot("hiep_si", tt, d)
	# ⚠ Một lỗi script giữa chừng làm hàm thoát im lặng mà không gọi _fail — bài từng in
	# "TẤT CẢ PASS" trong khi 16/16 phép đo trượt đã chết. Đếm phép đo chạy hết là chốt cuối.
	if da_do != 16:
		_fail("chỉ %d/16 phép đo trượt chạy hết — que dò hỏng" % da_do)
	print("\n%s" % ("TẤT CẢ PASS" if loi == 0 else "%d FAIL" % loi))
	quit(1 if loi else 0)


func _fail(m: String) -> void:
	print("FAIL ", m)
	loi += 1


## ① Không vật gì xuyên mặt đất, và thân đứng/đi/ngã thì phải CHẠM đất (không lơ lửng).
## Số đo `thap` là đỉnh lưới thấp nhất của mô hình 3D ở từng khung, ghi lúc render.
func _kiem_xuyen_dat(ten: String, ds: Array) -> void:
	var bo := SpriteBo.tai(ten)
	for tt in ds:
		var lo := 1e9
		var hi := -1e9
		for d in 8:
			for k in bo.so_khung(tt):
				var z: float = bo.meta["trang_thai"][tt]["chan"][d][k]["thap"]
				lo = minf(lo, z)
				hi = maxf(hi, z)
		if lo < -0.005:
			_fail("%s/%s: xuyên đất %.3f m" % [ten, tt, lo])
		elif tt != "run" and hi > 0.005:
			_fail("%s/%s: lơ lửng %.3f m trên đất" % [ten, tt, hi])
		else:
			print("PASS %s/%s chạm đất: thấp nhất %.4f … %.4f m" % [ten, tt, lo, hi])


## ② Bàn chân đang chống phải đứng yên trên mặt đất trong lúc thân tiến lên.
func _kiem_truot(ten: String, tt: String, d: int) -> void:
	var t := ThanThe.new()
	t.ten_bo = ten
	root.add_child(t)
	await process_frame
	var bo := t.bo
	var n := bo.so_khung(tt)
	t.position = Vector2(2000, 2000)
	var huong_di := Iso.vector_huong(d)
	t.duong = PackedVector2Array([t.position + huong_di * 3000.0])
	var mau := {}                                      # (bên, lượt chống, khung) → vị trí thế giới
	var luot := {"L": 0, "R": 0}
	var cham_truoc := {"L": false, "R": false}
	var da_huong := []
	var vong := 0
	var pha_truoc := 0.0
	for i in int(3.0 * n / bo.fps(tt) / DT):          # đi đủ 3 chu kỳ
		t.buoc_di(DT, tt)
		if t.pha < pha_truoc:
			vong += 1
		pha_truoc = t.pha
		if not da_huong.has(t.huong):
			da_huong.append(t.huong)
		var tien := fposmod(t.pha * n, 1.0)
		if absf(tien - 0.5) > 0.5 * bo.toc_do_px(tt) * DT * n / bo.sai_px(tt) + 1e-6:
			continue                                   # chỉ lấy mẫu ở GIỮA khung
		var k := t.hinh.frame
		for ben in ["L", "R"]:
			var c := bo.chan(tt, t.huong, k, ben)
			# ⚠ Gom theo LƯỢT CHỐNG liền mạch, không theo vòng: lượt chống của một chân có thể
			# vắt qua mốc pha = 0 (đi bộ: chân phải chống ở [0,5 · 1,1)). Gom theo vòng thì hai
			# lượt chống khác nhau rơi vào một nhóm và bài báo "trượt" đúng bằng MỘT SẢI CHÂN.
			if c["cham"] and not cham_truoc[ben]:
				luot[ben] += 1
			cham_truoc[ben] = c["cham"]
			if c["cham"]:
				mau["%s|%d|%d" % [ben, luot[ben], k]] = t.position + c["px"] - bo.neo
	t.queue_free()
	da_do += 1
	if da_huong != [d]:
		_fail("%s/%s hướng %s: đi theo hướng %d mà sprite quay %s" % [ten, tt, Iso.HUONG[d], d, str(da_huong)])
		return
	# gom các mẫu của cùng một lượt chống chân (cùng bên, cùng vòng, các khung liền nhau)
	var nhom := {}
	for key in mau:
		var p: PackedStringArray = key.split("|")
		var g: String = p[0] + "|" + p[1]
		if not nhom.has(g):
			nhom[g] = []
		nhom[g].append(mau[key])
	var lech_max := 0.0
	var so_nhom := 0
	for g in nhom:
		var ds: Array = nhom[g]
		if ds.size() < 2:
			continue
		so_nhom += 1
		for a in ds:
			for b in ds:
				lech_max = maxf(lech_max, (a - b).length())
	var rang := bo.toc_do_px(tt) / bo.fps(tt)
	if so_nhom == 0:
		_fail("%s/%s %s: không lấy được mẫu chân chống nào (que dò hỏng)" % [ten, tt, Iso.HUONG[d]])
	elif lech_max > NGUONG_TRUOT:
		_fail("%s/%s %s: bàn chân chống trượt %.2f px (ngưỡng %.1f)" % [ten, tt, Iso.HUONG[d], lech_max, NGUONG_TRUOT])
	else:
		print("PASS %s/%s %s: chân chống lệch %.2f px qua %d lượt chống · răng cưa giữa 2 khung %.1f px" % [ten, tt, Iso.HUONG[d], lech_max, so_nhom, rang])
