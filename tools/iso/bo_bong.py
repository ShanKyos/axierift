#!/usr/bin/env python3
"""Gỡ BÓNG ĐỔ đã nướng vào tranh khỏi một sprite/bảng khung.

    python3 tools/iso/bo_bong.py <tệp.png|webp> [...]        # đo rồi sửa tại chỗ
    python3 tools/iso/bo_bong.py --do <tệp> [...]            # chỉ đo

⚠ VÌ SAO CẦN: lò sinh ảnh vẽ bóng đổ THÀNH MỘT MẢNG ĐẶC, và trên nền magenta thì cái bóng
ấy là magenta-tối. Bộ tách nền gỡ đúng nền phẳng, còn mảng tối kia sống sót — qua bước khử
viền hồng nó thành một vũng XANH-TÍM ĐỤC (alpha 255) nằm cạnh vật. Trên nền cỏ/đá sáng của
game nó đọc ra một vết mực, không ra một cái bóng.

⚠ VÀ QUY ƯỚC CỦA DỰ ÁN LÀ KHÔNG NƯỚNG BÓNG. Đo ba công trình đang chạy (`ct_duoc` ·
`ct_quantro` · `ct_loren`): điểm "bóng xanh" chiếm 0,0-0,4% — tức chúng được cắt SÁT VẬT và
bóng do chính game lo. Một sprite mang bóng riêng vừa lệch hướng nắng với hàng xóm, vừa
không mờ đi khi vật bay/nhấc lên.

CỬA NHẬN DIỆN (đo trên chính art đang chạy, không đoán):
  · B > G + `--nguong` (mặc định 25) — bóng ngả LAM, còn nước ngả LỤC-LAM (B−G ≈ 10)
  · max(R,G,B) < `--sang` (mặc định 200) — bóng tối, đá vôi thì sáng 230-250
  · G ≥ R − 15 — loại đá ấm (R ≥ G) ra khỏi diện nghi
  · **và mảng đó phải NỐI RA ĐƯỢC nền trong suốt** — xem `noi_ra_ngoai()`. Thiếu vế này là
    gỡ thủng luôn vùng nước sẫm trong lòng bể (đo được 5,2%, NPC phía sau lộ qua mặt nước).
Rồi nới một vòng để ăn nốt vành răng cưa còn sót ở mép.
"""
import sys
import numpy as np
from PIL import Image


def mat_na(a, nguong, sang):
    R, G, B, A = a[:, :, 0], a[:, :, 1], a[:, :, 2], a[:, :, 3]
    mx = np.maximum(np.maximum(R, G), B)
    return (A > 8) & (B > G + nguong) & (mx < sang) & (G >= R - 15)


def no_mot_vong(m):
    """Nới mặt nạ ra 1 điểm ảnh — vành răng cưa quanh bóng nhạt hơn nên trượt ngưỡng."""
    n = m.copy()
    n[1:, :] |= m[:-1, :]; n[:-1, :] |= m[1:, :]
    n[:, 1:] |= m[:, :-1]; n[:, :-1] |= m[:, 1:]
    return n


def noi_ra_ngoai(m, nen):
    """Chỉ giữ những mảng của `m` NỐI RA ĐƯỢC nền trong suốt.

    ⚠ ĐÂY LÀ VẾ QUAN TRỌNG NHẤT CỦA CẢ TỆP, và bản đầu thiếu nó. Cửa nhận diện theo MÀU
    (lam · tối · G≥R) cũng khớp với **vùng nước sẫm trong lòng bể** — đo được: gỡ thẳng
    theo màu thì lòng bể **thủng 5,2%**, và trong game thì NPC đứng phía sau lộ qua mặt
    nước. Bóng đổ thì nằm cạnh vật và CHẠM nền trong suốt; nước thì bị thành đá bao kín.
    Nên lan từ mép nền vào, và bỏ lại mọi mảng không với tới được.
    """
    seed = m & no_mot_vong(nen)
    while True:
        moi = m & no_mot_vong(seed)
        if moi.sum() == seed.sum():
            return seed
        seed = moi


def chay(f, chi_do=False, nguong=25, sang=200):
    im = Image.open(f).convert('RGBA')
    a = np.asarray(im).astype(int)
    dac = a[:, :, 3] > 8
    m = mat_na(a, nguong, sang)
    # vành: chỉ ăn thêm chỗ VẪN ngả lam, đừng ăn vào nước/đá
    nen = a[:, :, 3] <= 8
    m = noi_ra_ngoai(m, nen)                       # ⚠ xem noi_ra_ngoai: không có bước này là thủng nước
    vien = no_mot_vong(m) & ~m & mat_na(a, nguong - 12, sang + 25)
    tong = m | vien
    print(f'{f.split("/")[-1]:24} đặc {int(dac.sum()):8} · bóng {int(m.sum()):7} '
          f'(+{int(vien.sum())} vành) = {100*tong.sum()/max(1,dac.sum()):5.2f}%')
    if chi_do or not tong.any():
        return
    b = a.copy(); b[:, :, 3] = np.where(tong, 0, a[:, :, 3])
    out = Image.fromarray(b.astype(np.uint8), 'RGBA')
    out.save(f, quality=88, alpha_quality=100) if f.endswith('.webp') else out.save(f)
    print(f'   → đã gỡ, còn {int((b[:,:,3] > 8).sum())} điểm đặc')


if __name__ == '__main__':
    av = [x for x in sys.argv[1:] if not x.startswith('--')]
    if not av:
        print(__doc__); sys.exit(1)
    g = lambda k, d: int(sys.argv[sys.argv.index(k)+1]) if k in sys.argv else d
    for f in av:
        chay(f, '--do' in sys.argv, g('--nguong', 25), g('--sang', 200))
