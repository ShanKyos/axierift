# Checkpoint 15-C1 — phần không phụ thuộc ảnh chuẩn

Ngày 02/10/2026. Đây là các việc độc lập mà `CHECKPOINT_15_A.md` §8 liệt kê. 15-B (art) vẫn chờ GIF động và câu trả lời của chủ dự án. **Art, compiled, test cũ: không đổi.** Main: chưa đụng, chưa deploy.

## 1. Sửa cờ URL — `?magicPhysics=0` nay là TẮT

Ba cờ `magicRebuild`, `magicAuthor`, `magicPhysics` từng đọc bằng `URLSearchParams.has()`, nên URL ghi `=0` vẫn bật cờ. Nay cả ba đi qua một cửa duy nhất là **`window.magicCo(name)`** trong `magic-rebuild.js`:

- tham số có mặt mà giá trị là `0`, `false`, `off` hoặc `no` (không phân biệt hoa thường) thì là TẮT;
- có mặt với giá trị khác, hoặc trống (`?magicPhysics`), thì là BẬT;
- vắng mặt thì là TẮT.

`magic-physics-rig.js` đọc lại chính hàm đó, không chép logic sang. `magic-rebuild.js` luôn được nạp trước nó, cả trong `index.html` lẫn `magic_physics.html`.

Gác: **`tests/test_magicco.js`**, 10 ca URL + 1 ca page error, tất cả PASS. Thử ngược (trả `magic-physics-rig.js` về `has()`) cho ra **3 FAIL**, đúng ba ca `=0` / `=false` / `=OFF`.

## 2. Metadata lỗi thời đã sửa

| | trước | nay |
|---|---|---|
| `rig.json.limitations[0]` | "not a dynamics simulation" | nói rõ có XPBD opt-in qua `?magicPhysics=1`, `productionReady` vẫn false |
| `rig.json.limitations[2]` | "pants map to boots … unless dedicated pants slot supplied" | quần đọc ô `quan`; `chan` chỉ là đường lui cho save không có quần (`magicRebuildGear`) |
| `REPAIR_CHECKPOINT_14.md` dòng 3 "Không push GitHub" | | giữ nguyên câu cũ, thêm ghi chú bên dưới: nhánh đã lên GitHub, main/production chưa nhận |

`productionReady` **vẫn false**; `status` giữ nguyên. Manifest đã băm lại 4 tệp đổi (rig.json · magic-rebuild.js · magic-physics-rig.js · REPAIR_CHECKPOINT_14.md). Còn lại khớp như cũ.

## 3. Đồ +9/+10/+11 — đo thật

| | kết quả | bằng chứng |
|---|---|---|
| Mạng khi mặc full +11 (`applyTestBoost`) | **0 request mới, 0 lỗi**. Cùng 28 tệp như +0: bậc rèn dựng lúc chạy bằng `enhanced()`, không cần 21 tệp `parts/*_plusN.png` của archive | `giap_plus_mang.json` |
| Giáp: điểm ảnh đổi so với +0 (idle, south) | +9: **1.718** · +10: **2.085** · +11: **2.261** | `giap_plus_0_9_10_11.webp` |
| Vũ khí: điểm ảnh đổi, đủ 7 cây × 3 tư thế | +9: 54–268 · +11: 70–300, tức **25–70% điểm ảnh của cây** | `vukhi_plus.txt` |
| Ánh xạ dòng → rig | 7 dòng vũ khí (`base.mr`) và 7 dòng giáp (`MR_GIAP_LINES`) trùng khít `rig.weapons`/`rig.armors`; `magicRebuildGear` trả đúng chỉ số | |

⇒ Cơ chế +N **chạy và nhìn thấy được**. Hai điểm thẩm mỹ cần ghi cho 15-B, chưa sửa:

1. **+N chỉ làm SÁNG lên**: pha trắng 18% / 30% / 44% vào điểm ảnh sáng. Nó chưa đổi SẮC theo bậc như luật đang chạy của game (+9 lam băng · +10 tím · +11 cam rực). Ba mức nhìn ra "sáng hơn", khó đọc ra "bậc nào".
2. **Vũ khí rất nhỏ**: khoảng 210–440 điểm ảnh, dưới 1% ô 256. So với ảnh chuẩn (lưỡi lửa to), đây là cùng khoảng hở đã ghi ở `CHECKPOINT_15_A.md` §6.

Trong thành ở hướng south, hai cây kiếm bắt chéo sau lưng bị thân che. Hình +N toàn thân chụp hướng ấy nên vũ khí gần như không lộ: đó là che khuất đúng luật, không phải +N hỏng.

## 4. Hồi quy liên quan đã chạy trên cây này

`test_magicco` (11 PASS) · `test_mrdong` (11 PASS) · `test_goimr` (8 PASS): log nằm trong `deploy/qa/checkpoint15c1/`. Chưa chạy full regression; đó là việc của 15-E.

## 5. Còn lại

- **15-B (art):** chờ GIF Fire Dash Slash động + Light Storm và ba câu hỏi ở `CHECKPOINT_15_A.md` §6. Thêm hai mục: sắc +N theo bậc, cỡ vũ khí.
- **15-C (phần còn lại):** kiểm trong game ở thành / đất / trên không; chuyển map, dịch chuyển, chết rồi hồi sinh; đổi đồ giữa clip; mặc định tắt.
- **Tiếp tục khi phiên ngắt:** `git switch codex/magic-native-checkpoint14-20261002`, đọc `CHECKPOINT_15_A.md` rồi tệp này.
