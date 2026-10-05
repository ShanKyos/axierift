class_name CameraMU
extends Camera3D
## Camera cố định chéo kiểu MU Online: không xoay, chỉ bám theo nhân vật và đổi tầm xa bằng con lăn.
## Góc nâng và phương vị cố định ⇒ người chơi học thuộc được hướng của thế giới (bắc luôn ở trên-phải).

@export var muc_tieu: Node3D
@export var goc_nang := 45.0           # độ — nhìn xuống (52° thì nhân vật chibi chỉ còn cái mũ trụ)
@export var phuong_vi := 45.0          # độ — nhìn chéo như isometric
@export var tam_xa := 16.0             # mét từ mục tiêu tới camera
const XA_MIN := 9.0
const XA_MAX := 26.0
const BAM := 10.0                      # độ "dính" khi bám theo (1/giây)


func _ready() -> void:
	fov = 38.0
	near = 0.5
	far = 200.0
	if muc_tieu:
		global_position = _cho_dung()
	_nhin()


func _cho_dung() -> Vector3:
	var n := deg_to_rad(goc_nang)
	var v := deg_to_rad(phuong_vi)
	var lui := Vector3(sin(v) * cos(n), sin(n), cos(v) * cos(n)) * tam_xa
	return muc_tieu.global_position + Vector3(0, 1.0, 0) + lui


func _nhin() -> void:
	if muc_tieu:
		look_at(muc_tieu.global_position + Vector3(0, 1.0, 0), Vector3.UP)


func bam_ngay() -> void:
	global_position = _cho_dung()
	_nhin()


func _process(dt: float) -> void:
	if muc_tieu == null:
		return
	global_position = global_position.lerp(_cho_dung(), 1.0 - exp(-BAM * dt))
	_nhin()


func _unhandled_input(e: InputEvent) -> void:
	if e is InputEventMouseButton and e.pressed:
		if e.button_index == MOUSE_BUTTON_WHEEL_UP:
			tam_xa = maxf(XA_MIN, tam_xa - 1.5)
		elif e.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			tam_xa = minf(XA_MAX, tam_xa + 1.5)
