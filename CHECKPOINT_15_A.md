# Checkpoint 15-A — Kiểm kê

Ngày 02/10/2026. Phạm vi: kiểm kê theo §9 của `CLAUDE_MAGIC_CHECKPOINT_14_HANDOFF.md`. **Không sửa runtime, art hay test nào.** Commit này chỉ thêm báo cáo và bằng chứng QA.

## 1. Mốc

| | SHA |
|---|---|
| Nhánh bàn giao, đầu nhánh lúc bắt đầu | `ecd352852e489ae739c37654b7ff7787a5c79631` |
| Runtime đã ghép (checkpoint 14) | `f9c891b87436231f3cdf33b989b58014b2850c06` |
| `origin/main` lúc kiểm kê | `6d11da07d4cdb90bc546892f3bfb47438c41d2ec`, **chưa đổi** từ lúc QA 14 |
| merge-base(main, nhánh) | `6d11da0` ⇒ nhánh là hậu duệ của main, hiện vượt main 5 commit và không thiếu commit nào của main |

Lịch sử nhánh có commit `ab1335a`, commit từng đổi 394 ảnh thành con trỏ Git LFS. **Cây hiện tại sạch**: quét `git ls-files` không còn con trỏ LFS nào, và không có `.gitattributes` gốc. Tệp `.gitattributes` duy nhất nằm trong `assets/magic-rebuild-v1/` và chỉ dùng để **tắt** filter. Commit ấy vẫn sẽ có mặt trong lịch sử của main khi fast-forward. Vô hại với cây, nhưng ghi lại để không ai `git checkout ab1335a` rồi tưởng ảnh đã hỏng.

## 2. Hash và tệp

| Kiểm | Kết quả | Bằng chứng |
|---|---|---|
| `NATIVE_CHECKPOINT_14_MANIFEST.json`: sha256, số byte, git blob | **45/45 khớp**, 0 lệch, 0 thiếu | `deploy/qa/checkpoint15a/manifest_check.txt` |
| `compiled.json` → `sourceHashes` so với `source/` | **18/18 khớp**. 4 mục không có trong nhánh: `concealed-art.prompts.json`, `joint-underpaint.prompt.json`, `reference-fire.png`, `reference-light.png` (thuộc archive) | `deploy/qa/checkpoint15a/source_hashes.txt` |
| `rig.json`: đường dẫn tham chiếu | 18/18 có tệp | |
| `compiled.json`: đường dẫn tham chiếu | 182 đường dẫn, **167 không có trong nhánh**: `concealed-master/` 112 · `weapon-master/` 28 · `parts/*_plus{9,10,11}.png` 21 · `joint-underpaint/` 6 | xem §4 |
| Cú pháp `node --check` | đạt: `game.js` · `magic-rebuild.js` · `magic-physics.js` · `magic-physics-rig.js` · `net.js` | |

⇒ Source và compiled **đang đồng bộ**. 167 mục thiếu là đầu ra `compile()` dành cho archive: loader không đọc `enhancements`, `weaponSprites`, `concealedMasters` hay `underpaintSprites` (grep `magic-rebuild.js`; các trường ấy chỉ được ghi trong `compile()`).

## 3. Mạng thật: loader gọi gì

Chromium headless, `startGame('minhgiao')`, chờ 6 giây. Raw: `deploy/qa/checkpoint15a/network_4modes.json`.

| URL | `MagicRebuild` | Request `magic-rebuild-v1/` | Lỗi |
|---|---|---|---|
| `?test=1` (mặc định) | tắt | **0** | 0 page error |
| `?test=1&magicRebuild=1` | ready | **28, cả 28 trả 200** | 0 |
| `…&magicAuthor=1` | ready | 20, cả 20 trả 200 | 0 |
| `…&magicPhysics=1` | ready, `MagicPhysicsRig.enabled = true` | 28, cả 28 trả 200 | 0 |

404 duy nhất ở cả bốn chế độ là `api/trpc/npc.status`: backend tRPC không chạy trên máy chủ tĩnh. Lỗi này **có sẵn**, không liên quan art.

28 request = `rig.json` + `compiled.json` + 15 `parts/*` + 7 `concealed-*` + `weapons` + `wings` + `effects` + `joint-underpaint`. Khớp đúng danh sách loader `load()` gọi.

⚠ Chưa kiểm đồ +9/+10/+11 qua mạng: cảnh dựng dùng đồ khởi đầu. Việc này để sang 15-C.

## 4. Metadata lỗi thời / sai (sửa ở mốc sau, chưa sửa ở đây)

1. **`magicPhysics=0` vẫn BẬT physics.** Đo được: `MagicPhysicsRig.enabled === true` (cờ đọc bằng `URLSearchParams.has()`). Tài liệu bàn giao đã ghi; đây là lỗi thật của cờ, cần sửa ở 15-C.
2. `rig.json.limitations[0]` = *"articulated cutout rig, not a dynamics simulation"*: lỗi thời, vì kernel XPBD đã có (opt-in).
3. `rig.json.limitations[2]` = *"pants map to boots … unless dedicated pants slot supplied"*: lỗi thời. Main đã có ô `quan`, và `magicRebuildGear()` đọc `eq.quan` trước, chỉ lui về `chan` khi thiếu.
4. `rig.json.status` = `complete_coverage_for_integration_qa`, trong khi `productionReady = false` là đúng và phải giữ.
5. `REPAIR_CHECKPOINT_14.md` dòng 3 ghi *"Không push GitHub"*. Viết trước lần publish, nhánh nay đã có trên GitHub.
6. `compiled.json` mang 167 đường dẫn archive không có trong nhánh (§2). Không phải lỗi runtime, nhưng ai đọc compiled mà không đọc loader sẽ báo thiếu.
7. `rig.json.art.vai_tho` trỏ `source/body-base.png`: bộ Vải Thô không có tấm giáp riêng, dùng chính thân trần. Cần xác nhận đó là chủ ý.
8. Art native là **PNG**. `CLAUDE.md` chốt art của gói `magic-runtime` là WebP (`test_khonglfs ③`). Bài ấy chỉ quét `magic-runtime/` nên không đỏ, nhưng gói 32,5 MB này lệch quy ước dự án. Có đổi sang WebP hay không cần quyết ở 15-B/15-F.

## 5. Ảnh chuẩn

| Ảnh chuẩn tài liệu yêu cầu | Trạng thái |
|---|---|
| `fire-dash-slash-t01-8dir.gif` | **Chỉ có bản DẸP**: 1 khung/hướng, RGB đã dính nền caro (người dùng gửi qua chat). Lưu ở `deploy/qa/checkpoint15a/reference/` (sha256 `d8ebdf66…`), kèm bản đã tách nền. **Không có GIF động.** |
| `light-storm-t01-8dir.gif` | **Chưa có.** Không có trong nhánh nào trên GitHub, cũng không có trong phiên. |
| `reference-fire.png` / `reference-light.png` (nhắc trong `sourceHashes`) | Không có trong nhánh; hash nằm trong compiled.json |

⇒ **15-B bị chặn một phần**: thiếu GIF động thì không so được nhịp chuyển động, chỉ so được hình dáng của một tư thế mỗi hướng.

## 6. So sơ bộ native và ảnh chuẩn (dữ liệu cho 15-B, chưa phải kết luận)

Ảnh: `deploy/qa/checkpoint15a/sosanh_firedash_native_vs_ref.webp`. Hàng trên là native `fireDashSlash` khung 0, bộ `ma_thuat` (armor-red), `hoa_tinh_kiem`, `magic_2`; hàng dưới là ảnh chuẩn. Contact sheet 8×8: `sheet_{firedash,idle,walk}_mathuat_8x8.webp`.

| | Native | Ảnh chuẩn |
|---|---|---|
| Cao thân trong ô 256 (south) | **155 px** | 233 px |
| Tư thế | đứng thẳng, tay xoè | khuỵu gối, nghiêng người, hai kiếm chĩa xuống |
| West/East | thân nghiêng hẳn, **cánh thành một vệt dọc** | góc 3/4, cánh vẫn xoè rộng |
| Vũ khí | thanh đỏ mảnh | lưỡi lửa to, cháy sáng |

Ba câu cần chủ dự án trả lời trước 15-B:
1. Ảnh chuẩn có phải **bộ đích** không (kích thước thân 233 px, góc 3/4 ở W/E), hay chỉ là chuẩn *chất liệu*?
2. Ô **north-west** của ảnh chuẩn quay **mặt** ra camera, còn native NW quay **lưng**. Ảnh chuẩn đúng hay native đúng?
3. Bộ giáp trong ảnh chuẩn có phải `ma_thuat` không?

## 7. Phụ thuộc

`index.html` nạp `magic-rebuild.js` → `magic-physics.js` → `magic-physics-rig.js` trước `game.js` (dòng 370–372). Gói không thêm phụ thuộc npm nào. Lint, typecheck, unit, build và full regression là việc của 15-E, không chạy ở mốc này.

## 8. Còn lại và cách tiếp tục

- **Xong:** 15-A.
- **Kế tiếp:** 15-B (art). Cần ảnh chuẩn động và câu trả lời ở §6. Phần không bị chặn có thể làm trước:
  - sửa metadata §4 mục 2, 3, 5;
  - sửa cờ `magicPhysics=0` (§4.1, thuộc 15-C);
  - kiểm đồ +9/+10/+11 qua mạng.
- **Tiếp tục khi phiên ngắt:** `git switch codex/magic-native-checkpoint14-20261002`, đọc tệp này rồi `CLAUDE_MAGIC_CHECKPOINT_14_HANDOFF.md` §9.
- **Chưa push main, chưa deploy.**
