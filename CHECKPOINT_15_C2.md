# Checkpoint 15-C2 — tích hợp trong game: thành · ngoài thành · chiêu · chết

Ngày 02/10/2026. Chỉ đo và lưu bằng chứng. **Không sửa mã, art hay test nào** trong mốc này. Main: chưa đụng.

Cách đo: Chromium headless, `startGame('minhgiao')` + `applyTestBoost()` (full +11, cánh bậc 3). Mỗi khung đọc `window.__magicRebuildRender`: đó là trạng thái mà `magicRebuildFrame()` thật sự vẽ (state · hướng · attackMode · air). Script: `deploy/qa/checkpoint15c2/cp15c2.cjs` và `cp15c2b.cjs`.

## 1. Mười cảnh, cả hai chế độ vật lý

| cảnh | vật lý tắt | `magicPhysics=1` |
|---|---|---|
| trong thành, đứng | `idle`, đất | `idle`, đất |
| trong thành, đi | `run`, đất | `run`, đất |
| ra Rẻo Rừng Corran (có cánh) | `flyIdle`, trên không | `flyIdle`, trên không |
| bay di chuyển | `flyMove` | `flyMove` |
| đánh thường khi bay | `dualSlash`, mode **air** (+ `hit` khi ăn đòn) | như bên trái |
| tháo cánh, đứng | `idle`, đất | `idle`, đất |
| tháo cánh, đánh | `dualSlash` / `horizontalSlash`, mode **ground** | như bên trái |
| đeo lại cánh + đánh giữa clip | `horizontalSlash` air → `flyIdle` | như bên trái |
| chết (`onDeath`) | `death`, rơi xuống **đất** | như bên trái |
| hồi sinh (`respawn`) | `flyIdle` trở lại | như bên trái |

**0 page error ở cả hai lượt.** Ảnh: `canh_canh_tat.webp` · `canh_canh_bat_vatly.webp`. Raw: `kich_ban_vatly_{tat,bat}.json`.

## 2. Bảng chiêu → clip (7 profile × đất/không)

`castSkill(id)` thật, mỗi chiêu một lượt, cả có cánh (air) lẫn tháo cánh (ground). **16/16 lượt ra đúng clip, đúng mode.** Raw: `chieu_7x2.json`.

| chiêu | clip |
|---|---|
| `a` | `fireDashSlash` |
| `tp` · `mg_giganticstorm` | `lightStorm` |
| `mg_powerslash` | `horizontalSlash` |
| `mg_powerwave` | `thrust` |
| `mg_twistingslash` | `spinSlash` |
| `mg_fireball` | `risingSlash` |
| `mg_battlefury` (đang trên thanh) | `dualSlash`: lui mặc định |

## 3. Mặc định tắt

Mốc này không đổi `game.js`. Mọi đường native trong game đều gác bằng `magicRebuildOn()` / `MagicRebuild.enabled`, và cờ ấy nay đọc bằng `magicCo` (15-C1). Ở URL mặc định, game không tải tệp `magic-rebuild-v1/` nào (15-A §3). Phép so điểm ảnh 10/10 của checkpoint 14 vẫn áp dụng, vì đường mặc định không đổi một dòng nào kể từ đó.

## 4. Điều thấy được, ghi cho 15-B/15-D (chưa sửa)

1. **Cánh ở hướng east/west chỉ còn một vệt dọc**, cả trong thành (`thanh_dung`, `thanh_di` đều đứng hướng east). Trong thành người chơi nhìn tư thế này nhiều nhất, nên đây là lỗi thẩm mỹ nặng nhất đã thấy. Cùng phát hiện với `CHECKPOINT_15_A.md` §6.
2. `mg_battlefury` là chiêu **buff** nhưng diễn một nhát chém (`dualSlash`) vì bảng ánh xạ không có mục cho nó. Cần chủ dự án chọn: tư thế riêng, hay giữ nhát chém.
3. Trong thành, đi bộ luôn ra `run`, không bao giờ `walk`: tốc độ Spellblade sau `applyTestBoost` vượt ngưỡng chạy. Chưa đo với nhân vật tốc độ thấp.
4. Lượt "tháo cánh, đứng" có vài khung `hit` mang `air=true` ngay sau khi tháo. Có thể đó là cú trúng đòn bắt đầu trước lúc tháo. Cần một phép đo tách riêng ở 15-D trước khi gọi là lỗi.

## 5. Còn lại

- **15-B (art):** vẫn chờ GIF động + ba câu hỏi ở `CHECKPOINT_15_A.md` §6. Danh sách lỗi thẩm mỹ đã gom: cánh E/W · cỡ thân · cỡ vũ khí · sắc +N.
- **15-D (physics/performance):** chưa bắt đầu.
- **15-E/F:** chưa bắt đầu. **Chưa push main, chưa deploy.**
- **Tiếp tục:** `git switch codex/magic-native-checkpoint14-20261002`, đọc `CHECKPOINT_15_A.md` → `_C1` → tệp này.
