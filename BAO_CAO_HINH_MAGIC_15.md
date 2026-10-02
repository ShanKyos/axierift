# Báo cáo lỗi hình ảnh — Magic native (checkpoint 15)

Viết cho AI làm art/rig đọc trước khi sửa. Ngày 02/10/2026.
Nhánh `codex/magic-native-checkpoint14-20261002`. Gói `public/game/assets/magic-rebuild-v1/`.
Số đo dựng lại được bằng `deploy/qa/baocao_hinh/bc_do.cjs` (raw: `so_do_8_huong.json`).

**Tóm tắt một dòng:** hướng **West/East đang là góc nghiêng thuần 90°**, nhưng game và ảnh chuẩn cần **góc 3/4**. Thân vì thế dẹp còn ~40%, cánh còn một vệt dọc. Thêm vào đó, đi bộ hướng South làm bàn chân lún xuống dưới mặt đất. Lỗi nằm ở **cả art nguồn lẫn rig**: sửa một bên không đủ.

Mọi số đo bên dưới dùng cùng một bộ: giáp `ma_thuat` · vũ khí `hoa_tinh_kiem` · cánh `magic_2`, ô 256 px, mặt đất y = 216.

---

## Lỗi 1 — West/East bị DẸP (nặng nhất)

Hình: `deploy/qa/baocao_hinh/01_tam_huong_native_vs_chuan.webp`. Hàng 1 là thân không cánh, hàng 2 là bay có cánh, hàng 3 là ảnh chuẩn.

| hướng | bề ngang thân (px) | so với South | diện tích thân (px) | sải cánh (px) | so với South | 1 cánh (px) |
|---|--:|--:|--:|--:|--:|--:|
| South | 74 | 100% | 4.793 | 154 | 100% | 1.703 |
| SW / SE | 64 / 69 | 86–93% | ~4.500 | 132 | 86% | 1.020 – 1.580 |
| **West** | **30** | **41%** | **2.656** | **81** | **53%** | **~713** |
| NW / NE | 71 / 68 | 92–96% | ~4.750 | 132 | 86% | 1.020 – 1.580 |
| North | 76 | 103% | 4.970 | 154 | 100% | 1.698 |
| **East** | **29** | **39%** | **2.610** | **81** | **53%** | **~710** |

Chiều cao thân không đổi ở cả 8 hướng (135–136 px), chỉ chiều ngang sụp. Trong khi đó ảnh chuẩn ở W/E vẫn rộng gần bằng South: người chéo 3/4, hai cánh xoè, thấy cả hai vai.

### Vì sao — ba nguồn cùng gây ra

1. **Art nguồn vẽ W/E là góc nghiêng thuần.** `source/armor-*.png` và `source/body-base.png` có 8 ô (2 hàng × 4). Ô `west` và `east` vẽ người **đứng nghiêng hẳn**, một vai che vai kia (xem `04_nguon_giap_8_huong.webp`, cột thứ 3 cả hai hàng).
2. **Rig khai W/E là góc quay 90°.**
   - `magic-rebuild.js` hàm `pose()`: `angle = -row * Math.PI/4`, tức 8 hướng = 8 góc đều 45°, nên W = +90° và E = −90°.
   - `rig.json → bindLandmarks`: khoảng cách hai vai **40 px ở South nhưng chỉ 9 px ở West/East** (hông 22 → 14, mắt cá 44 → 12).
3. **Phép chiếu không có góc nghiêng ngang.** `project(p, angle)` = `[128 + x, 230 − y·0.95 + z·0.42]`:
   - trục **x** giữ nguyên;
   - trục sâu **z** bị gập vào trục **dọc**.
   
   Ở góc 90°, mọi thứ trải theo chiều ngang của nhân vật (vai, cánh) đều đổ sang trục sâu, nên trên màn chúng chỉ còn lên/xuống, không còn rộng.

## Lỗi 2 — Cánh ở W/E thành MỘT VỆT DỌC mọc từ đỉnh đầu

Hình: `03_zoom_east.webp` (trái: native East, phải: ảnh chuẩn E/W).

- **Art cánh chỉ có MỘT góc nhìn.** `source/wings.png` (xem `05_nguon_canh.webp`) chỉ có cánh nhìn thẳng từ sau lưng, mỗi bên một tấm. Không có tấm nghiêng hay 3/4 nào.
- **Mã bóp tấm đó theo cosin.** `wingPose()` trong `magic-rebuild.js`:
  ```js
  span = facing * (.18 + .82 * Math.abs(Math.cos(angle)))   // 90° ⇒ còn 18% bề ngang
  transform = [span, -Math.sin(angle)*.42, 0, .95*cos(lean) - .42*sin(lean)]
  ```
  Ở 90°, `span` = 0,18 và thành phần nghiêng `-sin(angle)·0.42` đẩy tấm cánh **dựng đứng**. Kết quả là một dải tím mảnh chĩa thẳng lên trên đầu: đúng thứ chủ dự án gọi là *"dẹp và không fit vật lý"*.
- Trong thành, nhân vật đứng nhiều nhất ở hướng East (xem `deploy/qa/checkpoint15c2/canh_canh_tat.webp`). Nên lỗi này là thứ người chơi **nhìn thấy nhiều nhất**.

## Lỗi 3 — Đi bộ: chân lún dưới mặt đất ở South, sải chân gần bằng 0 ở W/E

Hình: `02_di_bo_south_vs_east.webp`. Hàng trên South, hàng dưới East, 8 khung, vạch xám là mặt đất y = 216.

Mép dưới thân mỗi khung (px, mặt đất = 216):

| hướng | 8 khung đi bộ | lệch so với mặt đất |
|---|---|---|
| South | 230 · 224 · 218 · 215 · 231 · 225 · 219 · 214 | **chân lún tới 15 px** (11% chiều cao thân) |
| North | 224 · 230 · 215 · 218 · 224 · 230 · 215 · 218 | lún tới 14 px |
| West | 215 × 6, rồi 212 · 212 | gần như không đổi |
| East | 216 · 216 · 212 · 212 · 216 · 216 · 216 · 216 | gần như không đổi |

- **South/North:** chân bước về phía camera được chiếu `+z·0.42` xuống dưới, nên bàn chân **vượt qua vạch đất** rồi lại nhấc lên. Trên nền game, đọc ra là chân chìm vào sàn ở nửa số khung. Trục sâu không được bù về mặt đất.
- **West/East:** hai chân chồng lên nhau trong góc nghiêng, sải gần như không thấy, tay buông thẳng. Đọc ra là "trượt" chứ không ra "bước".

## Lỗi 4 — Tư thế và cỡ, so với ảnh chuẩn (`fire-dash-slash`)

| | native | ảnh chuẩn |
|---|---|---|
| cao thân trong ô 256 | 155 px | 233 px |
| tư thế | đứng thẳng, tay buông/xoè | khuỵu gối, nghiêng người, hai kiếm chĩa xuống chéo |
| vũ khí | thanh đỏ mảnh, ~210–440 px (<1% ô) | lưỡi lửa to, cháy sáng |
| +9/+10/+11 | chỉ pha trắng 18% / 30% / 44% | (game cần đổi SẮC theo bậc: +9 lam băng · +10 tím · +11 cam) |

Ảnh chuẩn hiện có: `deploy/qa/checkpoint15a/reference/`. Đó là bản **dẹp 1 khung/hướng**; GIF động gốc vẫn chưa có.

---

## Hướng sửa đề xuất

**Khuyến nghị A — đổi W/E thành góc 3/4, khớp ảnh chuẩn.** Đổi ở **cả ba chỗ**, thiếu chỗ nào là lệch chỗ đó:

1. **Art:** vẽ lại ô W/E của `body-base.png` + 7 `armor-*.png` + 7 `concealed-*.png` ở góc chéo khoảng 60°, thấy cả hai vai như ảnh chuẩn. Giữ đúng lưới ô và kích thước tấm hiện tại.
2. **Rig:**
   - đổi `angle` trong `pose()` cho hàng W/E sang một góc nhỏ hơn 90° (ví dụ ±60°);
   - đo lại `bindLandmarks[west/east]` trên art mới, đừng nội suy từ hướng khác;
   - SW/SE/NW/NE có thể giữ 45° hoặc nới tương ứng.
3. **Cánh:**
   - thêm ít nhất **một góc nhìn cánh 3/4** (trái/phải) vào `wings.png`;
   - `wingPose()` chọn tấm theo hướng thay vì bóp một tấm nhìn thẳng;
   - sàn `span` không được dưới khoảng 0,55 ở W/E.

**Phương án B — giữ góc nghiêng thật 90°.** Phải vẽ hẳn cánh nhìn nghiêng (trải về phía sau, có phối cảnh) và chấp nhận thân hẹp. Không khớp ảnh chuẩn, nên không khuyến nghị.

**Bàn chân (cả hai phương án):** bàn chân chống đất phải nằm **đúng mặt đất** sau phép chiếu.
- Hoặc bù phần `z·0.42` cho bàn chân đang chống (chỉ chân nhấc lên mới được rời đất).
- Hoặc dời gốc thân theo `z` của chân chống.

Đừng "sửa" bằng cách kéo cả nhân vật lên: lúc ấy hai khung chân sau lại lơ lửng.

## Tiêu chí nghiệm thu (đo bằng máy, không chỉ nhìn)

Chạy lại `bc_do.cjs` sau khi sửa. Đạt khi:

| | ngưỡng |
|---|---|
| bề ngang thân W/E ÷ South | **≥ 75%** (hiện 39–41%) |
| sải cánh W/E ÷ South | **≥ 70%** (hiện 53%), và cánh không vượt lên quá đỉnh đầu ở W/E |
| mép dưới thân khi đi bộ, mọi hướng | trong **[mặt đất − 4, mặt đất + 2]** ở khung có chân chống (hiện tới +15) |
| hai vai thấy được ở W/E | `bindLandmarks` shoulder span **≥ 25 px** (hiện 9) |
| không tụt hướng khác | S/N/SW/SE/NW/NE giữ ±5% số đo hiện tại |

Và kiểm bằng mắt:
- contact sheet 8 hướng × `idle/walk/run/flyIdle/flyMove/fireDashSlash/lightStorm`, so cạnh ảnh chuẩn;
- không mép trắng, không hở khớp vai khi đổi góc.

## Sau khi sửa phải làm lại

- Compile lại `parts/*.png` + `compiled.json` từ source mới, cập nhật `sourceHashes`.
- Cập nhật `NATIVE_CHECKPOINT_14_MANIFEST.json`, rồi chạy `tests/test_magicco.js` · `test_goimr.js` · `test_mrdong.js`.
- **Giữ ảnh là tệp git thường, KHÔNG dùng Git LFS** (VPS production không có `git-lfs`). Xem `CLAUDE.md`, mục "ART CỦA GÓI LÀ WEBP THƯỜNG TRONG GIT".
- Ghi kết quả vào `CHECKPOINT_15_B.md`.
