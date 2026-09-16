# Làm nhân vật mới cho Axie Rift — **MỘT tấm PNG**, không rig lại

> Công cụ: `tools/spine/khuon_atlas.py` · nướng vào game: `tools/spine/nuong_nv.py --lop`
> Hợp đồng toạ độ của bảng khung: `.claude/skills/spine-nuong/SKILL.md`

## 0. Kết luận trước, lý lẽ sau

Đề xuất đang cân nhắc là: *Gemini gen → tách part trong Photopea → **PhotoshopToSpine** dựng
xương → **Auto Weights** → Spine.* Nó đúng cho một nhân vật **mới toanh**. Nhưng cho nhân vật
thuộc **bản mẫu bốn-đầu-thân** mà dự án này đang dùng thì nó **làm thừa gần hết**, và tệ hơn:
nó vứt đi thứ đang có sẵn miễn phí.

**Đo được, không phải phỏng đoán.** Năm gói Spine đã nhận (`Dark_Knight` · `Dark_Knight_1` ·
`Dark_Lord` · `Fairy_Elf` · `Magic_Gladiator`) có bộ xương **trùng khít từng byte**:

| | |
|---|---|
| xương | **83** — cùng một băm MD5 ở cả năm gói |
| khe (slot) | **13** — cùng băm |
| hoạt cảnh | **20** — cùng danh sách |
| IK · biến hình · physics | **6 · 5 · 28** — cùng số, cùng cấu hình |
| bố cục atlas | **30 vùng, CÙNG toạ độ pixel**, trang 2048×2048 |

Và mọi lưới mesh (đỉnh · UV · trọng số) **giống nhau từng con số**, trừ đúng hai chỗ:

| mảnh | vì sao khác |
|---|---|
| `躯干` (thân) | bóng váy đổi — Dark Lord khác Elf; Elf và Magic Gladiator thì **giống hệt** |
| `背后头发` (tóc sau) | Dark Lord **không có** |

⇒ **Meowa không rig từng nhân vật. Nó tô một atlas mới lên một bản mẫu cố định.**

### Bằng chứng, đã dựng lại

Lấy `spine四头身人物模板.json` + `.atlas` của **Fairy Elf**, thay **đúng một tệp PNG** bằng của
**Magic Gladiator**, rồi dựng khung: ra đúng Magic Gladiator, **lệch tối đa 0 điểm ảnh** so với
gói MG thật. Round-trip qua `khuon_atlas.py ra` → `dong` cũng ra **0**.

⇒ Một nhân vật mới trong dòng này = **một tấm PNG 2048×2048**.

---

## 1. Ba mức việc — chọn đúng mức thì đỡ hẳn một tuần

| mức | khi nào | cần gì | Spine Editor? |
|---|---|---|---|
| **A · Thay da** | nhân vật cùng bóng dáng: cùng kiểu tóc/váy, cùng tỉ lệ | **1 tấm PNG** | **KHÔNG** |
| **B · Sửa lưới** | đổi bóng váy, thêm/bớt tóc sau, thêm áo choàng | PNG + nắn lại **1-2 mesh** | có, nhưng ít |
| **C · Rig mới** | nhân vật KHÔNG thuộc bản mẫu (thú, cỡ khác, số chi khác) | PhotoshopToSpine + Auto Weights + **dựng lại 20 hoạt cảnh** | có, nhiều |

Bốn gói đã nhận đều là **mức A hoặc B**. Đừng leo lên mức C vì thói quen.

**⚠ Mức C tốn gấp bội, và cái tốn không nằm ở rig.** PhotoshopToSpine dựng được xương và
Auto Weights tính được skinning — nhưng nó **không** đẻ ra: 20 hoạt cảnh, 6 IK, 5 ràng buộc biến
hình (chính là thứ đưa vũ khí vào tay — xem CLAUDE.md), và 28 ràng buộc physics lái tóc với váy.
Mất mấy thứ đó thì `nuong_nv.py` không nướng nổi: nó gọi thẳng `d['animations']['00_Idle']`,
`'08_SwordAttack'`, … và đọc tên khe bằng tiếng Trung của bản mẫu.

---

## 2. Mức A — quy trình đầy đủ

### ① Lấy khuôn

```bash
python3 tools/spine/khuon_atlas.py khuon <gói mẫu> /tmp/khuon.png
```

Ra một tấm **2048×2048** vẽ sẵn 30 ô: mỗi ô một khung xanh, tên vùng, cỡ ô, và art của gói mẫu
để mờ 25% làm **nền can**. Mở bằng Photopea, vẽ đè lên từng ô.

### ② Vẽ — và ba ràng buộc phải giữ

1. **KHÔNG đổi cỡ ô và không dời ô.** UV của lưới trỏ vào đúng hộp pixel ấy. Lệch là nét vẽ
   trượt khỏi lưới, mà **không có gì báo lỗi** — chỉ nhìn ảnh chụp mới thấy. `khuon_atlas.py dong`
   **dừng hẳn** nếu tệp sai cỡ, cố ý không co giãn hộ.
2. **Giữ nguyên BÓNG DÁNG trong ô.** Lưới mesh (đỉnh + trọng số) là của bản mẫu; vẽ tràn ra
   ngoài bóng dáng cũ thì phần tràn không có xương nào kéo, nó đứng chết khi nhân vật cử động.
   Vẽ THIẾU thì thừa lưới — vô hại, chỉ phí.
3. **Nền trong suốt, alpha sạch.** Xuất WebP/PNG mất mát ở alpha hiện thành quầng xám quanh mọi
   mép (đã trả giá ở màn chờ — xem CLAUDE.md, `alpha_quality=100`).

### ③ Ba mươi ô — phải vẽ những gì

| nhóm | vùng | cỡ |
|---|---|---|
| đầu (4 sắc mặt) | `头` · `头_开心` · `头_痛苦` · `头_闭眼` | 411×302 |
| tóc sau (3 kiểu) | `背后头发1` · `背后头发2` · `背后头发3` | 520×443 |
| thân (3 kiểu váy) | `躯干` 284×337 · `躯干_带短裙` 395×337 · `躯干_带长裙` 395×463 | |
| tay phải (6 thế) | `右手_放松` · `右手_握拳` · `右手_张开朝内` · `右手_张开朝外` · `右手_张开朝侧前` · `右手_张开朝前` | 259×374 (riêng `朝前` 293×259) |
| tay trái (2 thế) | `左手_放松` · `左手_握拳` | 259×374 |
| chân | `左腿` · `右腿` | 259×374 |
| vũ khí (4 mảnh) | `左手武器` 640×324 · `左手武器2a` 324×640 · `左手武器2b` 324×640 · `左手武器2c` 640×324 | |
| hiệu ứng nổ | `爆炸特效1…6` | 114×114 |

⚠ **Bốn mảnh vũ khí không phải bốn cây.** `左手武器` là cây lúc MANG; `2a` là cây lúc
**giương cung** (bản mẫu để một vòng cung trắng trơn — muốn đẹp thì vẽ đè đúng ô này); `2b` là
**dây**; `2c` là **mũi tên**. Lớp nào cầm kiếm thì `2a/2b/2c` để trống cũng chạy.

⚠ **Bốn sắc mặt là `linkedmesh`** — chúng mượn lưới của `头`, nên bốn ô phải **cùng bố cục khuôn
mặt**, chỉ đổi mắt/miệng. Vẽ lệch đầu ở một ô là cái đầu nhảy một cái khi đổi biểu cảm.

### ④ Đóng gói

```bash
# nổ gói mẫu ra 30 tệp rời để lấy tham chiếu (tuỳ chọn)
python3 tools/spine/khuon_atlas.py ra <gói mẫu> /tmp/png_mau

# dồn thư mục PNG của mình thành một gói chạy được
python3 tools/spine/khuon_atlas.py dong <gói mẫu> /tmp/png_cua_toi /tmp/goi_moi
```

Tệp nào chưa vẽ thì **giữ của bản mẫu**, nên vẽ dần từng bộ phận được — vẽ xong cái đầu là đã
xem thử được ngay, không phải chờ đủ 30 ô.

### ⑤ Nướng vào game

```bash
python3 tools/spine/nuong_nv.py /tmp/goi_moi '<tên skin>' <mã bộ> --danh 08_SwordAttack --lop
```

Rồi dán dòng `NV_LOP_HOP` nó in ra vào `game.js`, và khai `NV_GIAP['<lớp>|<giai>'] = '<mã bộ>'`.
`--danh` chọn hoạt cảnh đánh: `08_SwordAttack` (kiếm) · `10_ArcheryAttack` (cung) ·
`05_MagicAttack` (phép). Lớp cầm vũ khí BAY thì thêm `--khongvk`.

---

## 3. Mức B — khi bóng dáng đổi

Chỉ hai mesh từng đổi giữa năm gói: `躯干` và `背后头发`. Quy trình:

1. Mở gói mẫu bằng Spine Editor (bản Essential là đủ — không cần mesh nâng cao).
2. **Nhân bản skin**, đặt tên nhân vật mới.
3. Chỉ đụng vào mesh cần đổi: đổi ảnh, kéo lại viền lưới, **Auto Weights**.
4. Mọi mesh khác, mọi hoạt cảnh, mọi ràng buộc: **không chạm**.
5. Xuất JSON + atlas như cũ.

⚠ **Đừng "Reset Weights" cho cả nhân vật.** Trọng số hiện tại là thứ đã được chỉnh tay cho 20
hoạt cảnh chạy đẹp; Auto Weights tính lại toàn bộ sẽ ra một bản *chấp nhận được* và làm hỏng
những chỗ đã chỉnh.

---

## 4. Mức C — và chỗ PhotoshopToSpine THẬT SỰ đáng dùng

Đúng một trường hợp: một nhân vật **không thuộc bản mẫu** (thú cưỡi, trùm, NPC có hình học
khác). Lúc đó PhotoshopToSpine là công cụ đúng — nó đọc tên lớp PSD theo cú pháp riêng
(`ten[bone]`, `ten[slot]`, `ten[skin]`) và dựng sẵn cây xương + khe, đỡ hẳn phần bấm chuột.

Nhưng phải biết cái giá, và nó **không nằm ở rig**:

| thứ | ai làm |
|---|---|
| xương + khe + gắn part | PhotoshopToSpine ✅ |
| skinning | Auto Weights ✅ |
| **20 hoạt cảnh** | **người, bằng tay** ❌ |
| **6 IK + 5 ràng buộc biến hình** (đưa vũ khí vào tay) | **người** ❌ |
| **28 ràng buộc physics** (tóc, váy) | **người** ❌ |

Và `tools/spine/nuong_nv.py` sẽ phải tham số hoá: bảng `LOP` (bộ khe theo tên tiếng Trung),
`KHUNG`/`KHUNG2` (tên hoạt cảnh), `KHE_VK`, `VK_HIEN`, `VK_XOAY` đều đang khoá cứng vào bản mẫu.

---

## 5. Bảng tra nhanh

| việc | lệnh |
|---|---|
| xin khuôn để vẽ | `khuon_atlas.py khuon <gói> khuon.png` |
| nổ atlas ra 30 PNG | `khuon_atlas.py ra <gói> <thư mục>` |
| dồn PNG thành gói | `khuon_atlas.py dong <gói mẫu> <thư mục> <gói ra>` |
| nướng vào game | `nuong_nv.py <gói> '<skin>' <mã> --danh <hoạt cảnh> --lop` |
| xem thử trong game | `/gen <giai> [+rèn]` |

**Hai mươi hoạt cảnh có sẵn:** `00_Idle` `00_Walk` `00_Run` `00_Squat` `01_Dance` `01_Dance2`
`02_Death` `02_Death2` `03_Hurt` `04_JumpPrepare` `04_Jumpping` `05_MagicAttack` `06_PunchAttack`
`07_StatusEffect` `08_SwordAttack` `08_SwordAttack2` `09_Interactive` `10_ArcheryAttack`
`11_Throw` `11_ThrowPrepare`.

⚠ Game nướng **14 khối** cho mỗi lớp. Năm hoạt cảnh **chưa bao giờ** được nướng —
`01_Dance2` · `02_Death2` · `04_JumpPrepare` · `11_Throw` · `11_ThrowPrepare` — muốn thêm thì
thêm một dòng vào `KHUNG2` của `nuong_nv.py`, **không phải đặt art mới**.
