#!/usr/bin/env python3
"""Nướng BỘ VIÊN RIÊNG CHO SÀN ĐẤU ARDHAVEN — đá phiến lạnh + vòng mài sáng.

Vì sao có tệp này. Sàn đấu dựng xong thì đi MƯỢN viên của Ardhaven (`nen_da` + `nen_soi`), nên
đứng trong đó nhìn ra y hệt một góc phố — mà cả cái map sinh ra để đọc thành MỘT NƠI KHÁC. Bản
sắc của nó không nằm ở `ground`/`patch` (hai màu ấy chỉ hiện ở rìa), nó nằm ở mặt sàn, và mặt
sàn thì chiếm phần lớn màn hình.

⚠ ĐÂY KHÔNG PHẢI TÔ MÀU LẠI VIÊN CŨ. Quy tắc số 3 và bài học "đừng chữa vấn đề thị giác bằng
cách kéo giãn hoặc đè màu lên tài nguyên có sẵn" cấm đúng chuyện đó. Hai bộ dưới đây nướng LẠI
từ cảnh 3D qua `nuong_nen`, cùng một hướng nắng và cùng phép chiếu với bộ cỏ/đất, nên ghép chung
map không lệch.

── HAI MÀU CHỌN THEO SỐ ĐO, KHÔNG THEO CẢM GIÁC ──────────────────────────────────────────
Đo bộ đang có (trung bình kênh, chỉ điểm ảnh đặc):

    nen_da    163,6 / 139,1 / 115,3 — sáng 139,3   ← Ardhaven đang lát cái này
    nen_duong 132,7 / 110,6 /  88,2 — sáng 110,5
    nen_soi   135,7 / 133,7 / 111,2 — sáng 126,9

Sàn đấu phải khác ĐO ĐƯỢC với `nen_da`, nếu không thì đổi art mà nhìn vẫn y như cũ. Nên:

  ① NỀN LẠNH VÀ SẪM. Đá phiến xanh-xám, sáng ~105 — cách `nen_da` chừng 35 đơn vị và lệch hẳn
    về phía lạnh. Phố Ardhaven ấm (163/139/115, ngả vàng); sân tập thì không ai quét vôi.
  ② VÒNG MÀI SÁNG HƠN NỀN, không phải tối hơn. Ở mọi map khác lối mòn SẪM hơn (đất lộ ra dưới
    cỏ); ở đây ngược lại — đá bị đế giày mài nhẵn suốt bảy trăm buổi sáng thì nó BÓNG lên.
    Đảo chiều ấy là thứ làm cái vòng đọc ra một VÒNG chứ không ra một vũng bùn.
  ③ KHOẢNG CÁCH SÁNG PHẢI RỘNG. `nuong_tile` đo được biến thể cùng loại lệch nhau ~9 đơn vị;
    nền/lối của Ardhaven cách nhau 29. Ở đây để ~40 — vì nền sàn đấu SẪM, mà trên nền sẫm thì
    mắt phân biệt kém hơn hẳn. Đây đúng là bài học Bird Tribe Heights, chỉ đảo đầu: ở đó mặt
    sáng đều không mốc đọc ra khoảng không, ở đây mặt sẫm đều cũng thế.

Chạy:  python3 tools/iso/nuong_sandau.py [thư mục ra]
Cần:   pip install bpy==4.2.0   (Blender chạy trong tiến trình Python, không cần bản cài đặt)
"""
import os, sys

RA = sys.argv[1] if len(sys.argv) > 1 else 'public/game/assets/iso'

# Nạp nuong_tile mà KHÔNG chạy main() của nó — dùng lại nguyên hình học, ánh sáng và bộ tự kiểm.
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'nuong_tile.py'),
            encoding='utf-8').read().replace("if __name__ == '__main__':", 'if False:')
NT = {'__name__': 'nuong_tile',
      # ⚠ PHẢI ĐƯA `__file__` VÀO, nếu không `ghi_neo()` NỔ `NameError` ở dòng cuối — sau khi đã
      # nướng xong hết. Tức ảnh ra đủ, mà BẢNG NEO thì không được ghi: đúng cái dạng hỏng đã
      # xoá sạch cây của sáu map một lần rồi (xem CLAUDE.md, mục ISO_NEO). Ở đây nó còn kín hơn
      # vì lỗi nằm ở dòng CUỐI, nên mọi dòng "NUONG XONG" phía trên đều đã in ra.
      '__file__': os.path.join(os.path.dirname(os.path.abspath(__file__)), 'nuong_tile.py')}
sys.argv = [sys.argv[0], RA]
exec(compile(_src, 'nuong_tile.py', 'exec'), NT)
nuong_nen, nuong_vet = NT['nuong_nen'], NT['nuong_vet']

# (tên, màu sRGB, vân, số biến thể)
# ⚠ Biến thể đổi VÂN, KHÔNG đổi TÔNG — luật đã ghi trong `nuong_tile.main()`. Muốn mảng đậm nhạt
# thì dùng vệt, đừng dùng biến thể nền, nếu không mặt sàn lốm đốm như bị mốc.
BO = [
    ('nen_sanda', (0.40, 0.42, 0.46),  9, 4),   # đá phiến lạnh — mặt sàn đấu
    ('nen_sanmai', (0.66, 0.65, 0.62), 7, 4),   # vòng mài bóng — SÁNG hơn nền, xem ② ở trên
]
VET = [
    ('vet_sanmai', (0.66, 0.65, 0.62), 8),
]


def _da_mau(co, meo, hat, mau):
    """Đá có MÀU khai được — chép nguyên hình học từ `nuong_biome._da_mau`, chỉ đổi bảng màu.
    `nuong_tile._da` chốt cứng xám đá rừng, sai hẳn cho một sàn đá phiến lạnh."""
    import bpy, random as _r
    def f():
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=co, location=(0, 0, co * 0.5))
        o = bpy.context.object
        o.scale = meo
        t = bpy.data.textures.new(f'tds{hat}', 'CLOUDS'); t.noise_scale = co * 0.55
        md = o.modifiers.new('d', 'DISPLACE'); md.texture = t
        md.texture_coords = 'GLOBAL'; md.strength = co * 0.34; md.mid_level = 0.45
        o.data.materials.append(NT['_vatlieu'](f'das{hat}', mau, van=16, manh_van=0.30))
        bpy.ops.object.shade_flat()
        _ = _r
    return f


# ── MẢNH SỨT TRÊN MẶT SÀN ────────────────────────────────────────────────────────────────
# ⚠ ẢNH CHỤP MỚI NÓI ĐƯỢC, SỐ ĐO THÌ KHÔNG. Lượt đầu tôi rải 70 hòn `da1-3` sẵn có cho đủ ngưỡng
# "map lát viên phải có vật thể" của `test_isoneo`. Số thì đạt, mà chụp ra thì mặt sàn đọc thành
# một BÃI ĐÁ VỤN BỎ HOANG — trong khi cả map kể chuyện một sân tập còn được quét dọn mỗi sáng.
# Đá xám sẵn có lại trùng tông với vòng mài nên nó vừa to vừa nổi, thành thứ mắt bắt trước tiên.
#
# Nên: nhỏ hơn hẳn và SẪM hơn nền. Sẫm thì đọc ra vết sứt/mẻ trên đá phiến (và làm luôn cái mốc
# tương phản sẫm mà bài học Bird Tribe Heights đòi); nhỏ thì không ai nhầm nó với vật che — mà
# sàn đấu thì tuyệt đối không được có chỗ nấp.
#   nền sàn  (0,40 0,42 0,46) ·  mảnh sứt  (0,30 0,32 0,36) — sẫm hơn, cùng tông lạnh
SUT = [
    ('nho_san1', _da_mau(0.30, (1.0, 0.85, 0.34), 811, (0.30, 0.32, 0.36)), 0.24),
    ('nho_san2', _da_mau(0.22, (1.2, 0.75, 0.30), 821, (0.27, 0.29, 0.33)), 0.18),
    ('nho_san3', _da_mau(0.38, (0.9, 1.05, 0.28), 823, (0.33, 0.35, 0.39)), 0.28),
]


def main():
    os.makedirs(RA, exist_ok=True)
    n = 0
    for ten, mau, van, so in BO:
        for i in range(so):
            nuong_nen(f'{ten}{i+1}', mau, van=van, hat=round(i * 0.29, 2))
            n += 1
    for ten, mau, van in VET:
        # ban=1,0 → đúng một viên (256×128). Vệt to hơn một viên là tô thừa — xem ghi chú
        # "CỠ VỆT LÀ NGÂN SÁCH VẼ" trong nuong_tile.py.
        nuong_vet(f'{ten}1', mau, van=van, hat=0.11, ban=1.0)
        nuong_vet(f'{ten}2', mau, van=van, hat=0.53, ban=0.7)
        n += 2
    for ten, dung, co in SUT:
        NT['nuong_vat'](ten, dung, cao_px=round(NT['CAO_NV'] * co))
        n += 1
    NT['ghi_neo'](RA, NT['NEO'])   # một tệp đích duy nhất — xem ghi_neo() trong nuong_tile.py
    print(f'NUONG XONG {n} vien/vet/vat -> {RA}')


if __name__ == '__main__':
    main()
