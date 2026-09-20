# KIỂM TOÀN HIỆN TRẠNG — MỌI NGÓC NGÁCH

> Đo trên `main` @ **`0ab8a08`** (2026-09-19). Mọi con số dưới đây **đo được**;
> chỗ nào là phán đoán hoặc không đo được thì viết rõ.
> Kịch bản: `<scratchpad>/qa/audit1…12.js` · hồi quy: `tools/reg.sh`.

---

## ⓿ BẢNG ĐIỂM SỨC KHOẺ

| Mảng | Trạng thái |
|---|---|
| Bốn cổng CI | **4/4 XANH** — lint · check · test · hồi quy 225 bài |
| Hồi quy trình duyệt | **224/225** · đỏ duy nhất `test_chaos` (là lỗi của BÀI KIỂM, không phải của game — xem §4) |
| Lỗi JS lúc chạy | **0** qua 12 lượt lái, ~25 phút chơi, 5 lớp, 2 client online |
| Quy tắc 1 & 2 (phong cách · bản quyền) | **SẠCH** trong mọi text người chơi thấy |
| Tài sản thiếu | **0** (8 đường "thiếu" đều là chốt chờ-art có chủ ý) |
| Toàn vẹn dữ liệu | **sạch** — 0 tham chiếu treo trên 51 NV chính · 32 NV phụ · 42 NPC · 15 map |
| Vòng lưu/nạp | **không mất một trường nào**; save đời cũ bị bóc 12 trường vẫn nạp được, 0 lỗi |
| Tầng online | **chạy đủ** — bóng người · chat (chặn được XSS) · PvP hai góc |
| Lỗi CÒN MỞ | **5** — chi tiết §3 |

---

## ❶ BỐN CỔNG

```
npm run lint      rc=0
npm run check     rc=0
npm test          rc=0
node --check      game.js · canbang.js · net.js · bongnguoi.js  → rc=0 cả bốn
tools/reg.sh      commit 0ab8a08 · 224/225 xanh · 0 bài phải chạy lại vì rc=124
```

---

## ❷ THỨ ĐÃ KIỂM VÀ SẠCH

### Phong cách & bản quyền
- **Ký tự CJK trong text người chơi thấy: 0.** `game.js` còn **2 dòng** dính, nhưng cả hai là
  **chú thích** ghi tên xương Spine (`背后头发` · `左手持剑`). ⚠ Nghĩa là câu lệnh kiểm trong
  `CLAUDE.md` giờ trả về `2`, không còn `0` — xem §5.
- **Tên riêng MU Online**: Lorencia · Noria · Devias · Magic Gladiator · Devil Square ·
  Blood Castle — **11 chỗ, TẤT CẢ trong chú thích** ghi nguồn cảm hứng. Đúng luật.
- **Thuật ngữ tu tiên** (cảnh giới · chân khí · môn phái · giang hồ · bát quái · thái cực):
  **16 chỗ, tất cả trong chú thích**.
- **22 ký hiệu của các hệ ĐÃ GỠ** (Khắc Ấn · ITEM_ART · veChimera · bốn ô Cốt · CHI_THAN…):
  18 biến mất hẳn, 4 còn lại (`chiCoTrongMan` · `CHI_THAN` · `CHI_TRAN` · `cotGom`) **chỉ còn
  trong chú thích cảnh báo** — đúng nếp kỷ luật của tài liệu.

### Tài sản
| đo gì | kết quả |
|---|---|
| đường dẫn `assets/` viết thẳng trong mã | 107 · thiếu tệp **8** |
| trong đó là chốt CÓ CHỦ Ý | **7** tường/cổng iso nằm trong `MAP_VAT_CHO` ⇒ `vatTai()` trả `null`, **không 404 nào** · 1 là `null.mp3` đã có chú thích chặn |
| ⇒ **tài sản thiếu THẬT** | **0** |
| tên gọi `AudioSys.sfx()` | 15 · sau khi ghép chuỗi (`bite_` + 9 lớp Axie…) **đều có tệp** |
| tranh NPC | 10/10 có |
| `ISO_NEO` | 63 neo · 159 tệp iso trên đĩa · 0 neo mồ côi |

### Tham chiếu chết
- Hàm gọi trong chuỗi `onclick`/`on*`: **144 tên, 0 cái không định nghĩa**
  (7 cái probe báo là `closest`/`preventDefault`/`if`… — nhiễu của probe, không phải hàm).
- `getElementById(...).addEventListener` không chốt null: **0 chỗ sống**
  (chỗ duy nhất probe bắt được là một dòng trong **chú thích** kể lại lỗi cũ `btn-inv`).

### Dữ liệu
| kiểm gì | kết quả |
|---|---|
| chính tuyến | **51 NV** · đánh nhau **52,9%** (luật ≤60% ✓) · chương cao nhất **67%** (≤70% ✓) |
| hố cấp giữa hai NV liền nhau >4 | **0** |
| cấp quái lệch cấp NV >±4 | **0** |
| NV trỏ tới map / NPC không tồn tại | **0 / 0** |
| `reqMain` còn sót trên map | **0** · `reqMain` phụ tuyến ngoài dải | **0** |
| quái khai hệ không hợp lệ | **0** · miền dân số sai hệ | **0** |
| NPC có `talk` không ai xử lý | **0** |
| `XP_TABLE` | 119 cấp, **tăng dần tuyệt đối**, dốc nhất ×2,28 (ở cấp 2, bình thường) |
| 16 con Axie | 96/96 ô bộ phận đã khai · sắc TB **1,0187** (kẹp [0,95–1,05] ✓) · **bất biến lệch 2,2e-16** |
| Lò Hỗn Độn | 9 công thức, cả 9 đủ `match`/`plan`/`run` |

### Vòng lưu / nạp
- `saveGame()` → `loadGame()`: **0 trường bị đổi**.
- **Save "đời cũ" bị bóc 12 trường** (`vohoc` · `skillBar` · `equip` · `inv` · `free` ·
  `chimera` · `skillTn` · `avatar` · `sideStates`…) ⇒ `loadGame()` **không ném**, dựng lại đủ,
  chỉ số tính đúng (maxHp 2.499 · atk 117), mở cả 7 bảng: **0 lỗi JS**.
- Gán chiêu lên thanh rồi nạp lại: **lựa chọn KHÔNG bị nuốt** — lỗi nặng nhất của đợt kéo-thả
  vẫn đang được giữ đúng.

### Tầng online — dựng 2 client thật
| đo | kết quả |
|---|---|
| kết nối | cả hai vào, thấy nhau ở 457px |
| bóng người có ĐI không | B dời 500px ⇒ A vẽ theo **đúng 500px** |
| chat | tới nơi, đúng kênh |
| **XSS** | gửi `<img src=x onerror=…>` ⇒ **không chạy**, 0 thẻ `<img>` trong khung, hiện ra dạng chữ thường |
| sàn đấu PvP | hai người vào **hai góc đối nhau**, cách 1.200px (luật `md.goc` chạy đúng) |
| lỗi JS | **0** |

### Giao diện
- Bảng **Nhân Vật · Kỹ Năng · Túi Đồ · Bản Đồ** đo ở **1280×720 · 1440×900 · 1920×1080**:
  **tràn ra ngoài màn = 0 ở cả 12 tổ hợp**, và cả 12 đều cuộn được.
- `?lang=en`: **0 ký tự tiếng Việt còn sót** ở màn chọn lớp, `ghhaLang()` = `en`, 0 lỗi.

---

## ❸ LỖI CÒN MỞ — 5 cái, xếp theo mức đau

### 🔴 P1 · Nhật Ký Chiến Đấu cắt mất ĐÚNG phần thưởng — 50% số dòng

Đo trên 50 dòng thật sau 30 giây AUTO ở Rẻo Rừng Corran:

| | |
|---|--:|
| dòng bị cắt | **25 / 50 (50%)** |
| chữ bị mất trên mỗi dòng cắt | **26%** |
| cần bao nhiêu · có bao nhiêu | **248px · 168px** |

```
☠ Hạ Axie Heo Rừng — Nhận: +28 EXP +162◈     ← cần 248px
☠ Hạ Axie Heo Rừng — Nhận…                    ← người chơi đọc được chừng này
```

**Gốc:** `style.css:480` — `#combat-log .cl-row { white-space:nowrap; overflow:hidden;
text-overflow:ellipsis }` trên cột **190px** (vùng chữ 168px). Bề ngang 190px là **cố ý**
(khớp `#cot-phai` để hai khối thành một cột — có chú thích tại chỗ), nên chữa không phải là
nới cột: hoặc cho **xuống dòng**, hoặc **rút ngắn câu** (bỏ tên quái ở dòng thưởng, vì tên đã
nằm ở dòng sát thương ngay trên).

### 🔴 P1 · 42 ô kỹ năng in "tầm 0 · phạm vi 0" — vì 3 lớp KHÔNG khai `range`

```
SECTS.thieulam.range  ❌ undefined       → 14 chiêu in "tầm 0"
SECTS.minhgiao.range  ❌ undefined       → 14 chiêu in "tầm 0"
SECTS.bug.range       ❌ undefined       → 14 chiêu in "tầm 0"
SECTS.toanchan.range  = 380              → 0
SECTS.baidasan.range  = 420              → 0
```

`skillInfo()` có sẵn nấc lui `SKILL_TAM_MD[kind]==='lop' ? sect.range : …`, nhưng `sect.range`
**rỗng** với ba lớp cận chiến ⇒ `out.tam` là `undefined` ⇒ `skThongSoGon` in
`tầm ${Math.round(i.tam||0)}` = **"tầm 0"**.

Và "0" **không phải chỗ trống** — theo đúng quy ước trong `CLAUDE.md`, `tam: 0` nghĩa là
*"ngay tại chỗ đứng"*. Tức bảng đang **nói sai**, không phải bỏ trống: nó bảo Twisting Slash,
Poison Arrow, Lightning… đều nổ dưới chân người niệm.

Chính chú thích trong `skillInfo` đã cấm đúng chuyện này: *"Chiêu nào chưa khai thì suy ra từ
chính lớp / hiệu ứng của nó, **KHÔNG bỏ trống**."*

⚠ **Chiến đấu thì KHÔNG hỏng** — `game.js:8250` có nấc lui riêng `… .range || 90`. Chỉ tầng
**hiển thị** nói dối. Chữa: khai `range` cho ba lớp cận chiến (đúng 90, đang là số thật), hoặc
thêm `|| 90` vào dòng 5347.

### 🟠 P2 · Hướng dẫn tân thủ bước 2 vẫn nói sai, và trần 90 giây vẫn đẩy người chơi vào ngõ cụt

Không đổi so với báo cáo trước — chép lại vì chúng **vẫn còn nguyên** ở `0ab8a08`:

- `TUT_STEPS[1]` — *"Đến gần **Trưởng Lão Rell** … nhấn **E** … **nhận nhiệm vụ đầu tiên**"*.
  Nhưng NV đầu đã `active` từ giây 0, người giao là **Lính Gác Cổng Tây**, và điều kiện qua
  bước là `player.level >= 3` — chẳng liên quan gì tới Rell.
- `TUT_TRAN = 90` ⇒ đứng yên trong thành thì hộp hướng dẫn vẫn tự trôi sang bước 4
  (*"Nhấn SPACE hạ 1 con Axie Heo Rừng"*) trong khi Ardhaven có **0 bãi quái**.
  Đo lại: bấm SPACE 90 lần / 67 giây rồi AUTO 3 phút ⇒ `kills 0 · xp 0 · bạc 0`, toạ độ
  không đổi một pixel, và game không nói một câu nào.

### 🟠 P2 · 11 nhiệm vụ phụ có người giao đứng ở MAP KHÁC, và bảng gọi sai tên vùng

| mục | map của mục | người giao | đứng ở |
|---|---|---|---|
| `sd_lm4` `sl_lm1-3` | Lối Mòn Corran | `vandai` | **Werebear Woods** |
| `sd_cg1` `sl_cn1-3` | Aquatic Tribe Causeway | `doantruongnhai` | **Bird Tribe Heights** |
| `sl_tn1-3` | Trũng Nứt Corran | `thumo` | **Bug Tribe Tunnels** |

**Nhận được và làm được** (lái thật: `sideAvail` = `avail`, bảng NPC có liệt kê mục) — nên đây
không phải nội dung chết. Chỗ sai là **cái nhãn**: `game.js:29166` in tiêu đề
`PHỤ TUYẾN — ${MAPS[n.map].name}`, tức tên map **của NPC**, nên mục "Kẻ Chặn Cuối Lối" hiện ra
dưới dòng **"PHỤ TUYẾN — WEREBEAR WOODS"** trong khi `sideOnKill` chỉ đếm khi
`curMap === 'loimon'`. Người chơi nhận việc ở Werebear Woods, đánh ở Werebear Woods, và không
bao giờ thấy tiến độ nhúc nhích.

### 🟡 P3 · Ba hố nhịp cấp giữa map, và một khoá `MOC_NV` không ai dùng

```
corran 1 → ngoai 10 → chungnam 20 → daohoa 36 → loimon/comoc 40
        → trungnut 44 → caungam 54 → tuyettinh 60 → mongco 80 → nhanmon 100
```
| chặng | gánh |
|---|--:|
| Werebear Woods 20 → Plant Tribe Glade 36 | **16 cấp** |
| Bird Tribe Heights 60 → Reptile Sunstone Flats 80 | **20 cấp** |
| Reptile Sunstone Flats 80 → Dusk Marsh 100 | **20 cấp** |

Ba vùng cuối mỗi vùng gánh 1/6 hành trình. Đây là **nợ nội dung**, không phải lỗi mã — và nó
đúng là cái mà mục "CHẨN ĐOÁN GỐC" trong `CLAUDE.md` đã chỉ tên.

Kèm: **`MOC_NV.mastery` đã khai nhưng không nhiệm vụ nào dùng** — di sản của lần `c4q3` phải
rời cửa Đại Thành (vì Đại Thành mở **sau** 100% chính tuyến). Để nguyên thì nó mời người sau
gate lại vào đó và dựng lại đúng cái bẫy cũ.

---

## ❹ BÀI KIỂM ĐỎ DUY NHẤT LÀ LỖI CỦA BÀI KIỂM — **cơ chế chạy đúng**

`test_chaos §3b` báo *"Đổi Hệ không đổi được hệ (Bug → Bug)"*.

**Lái thẳng cơ chế thì nó chạy:**
```
trước: Chùy Long Vương · hệ Beast · _loBan=false · công thức 'element' ready
doChaos() → chờ 3,5s (LO_KHUI = 1150ms)
sau:   hệ Mech        · _loBan=false        ⇒ ĐỔI ĐƯỢC
```

Khác biệt giữa hai đường: lượt lái của tôi gọi `openForgePanel()` trước — hàm đó đặt
`_loBan = false`. Còn `reset()` trong bài kiểm chỉ đặt lại `chaosGroup` · `chaosPick` ·
`forgeBonus` · `forgeUseCharm`, **không chạm `_loBan`**, mà `doChaos()` thì `return` ngay ở
dòng đầu khi `_loBan` còn bật.

⇒ Việc cần làm nằm ở **`tests/test_chaos.js`**, không ở `game.js`.

> ⚠ **Đây là chỗ sửa lại báo cáo trước.** `docs/QA_CHOI_THU.md` từng ghi `test_chaos` đỏ vì
> *"nhiễm trạng thái từ mục trước — Đổi Hệ chạy đúng khi cô lập"*. Nửa sau đúng (cơ chế chạy),
> **nửa đầu sai**: chạy riêng bài đó **đỏ 3/3 lượt**, tức nó đỏ tất định.
> *Một bài kiểm đỏ vĩnh viễn là một bài kiểm không ai đọc nữa — và nó che luôn mọi lỗi thật
> phát sinh sau này trong chính tệp đó.*

---

## ❺ TÀI LIỆU ĐÃ LỆCH SỐ ĐO

| `CLAUDE.md` nói | đo được hôm nay |
|---|---|
| *"Toàn bộ file **hiện không còn ký tự CJK nào**"* + câu lệnh kiểm | câu lệnh đó nay trả **2** |
| *"`public/game/game.js` (**~12k dòng**)"* | **32.456 dòng** |
| *"170 bài Playwright"* (đầu `tools/reg.sh`) | **225 bài** |
| *"nhiệm vụ gánh tới cấp 60: **15,0%**"* | phép tính gộp cho **5,6%** — nhưng chính tài liệu cảnh báo *"tính giờ THEO TỪNG CẤP, đừng lấy tổng"*, và `tools/do_nhipcap.cjs` thì **đang hỏng từ cấp 60 trở lên**, nên **chưa kết luận được** |

Ba dòng đầu là lệch số thuần tuý, sửa một dòng là xong. Dòng thứ tư thì **không được sửa mò** —
phải chữa công cụ đo trước.

---

## ❻ KHÔNG ĐO ĐƯỢC Ở MÔI TRƯỜNG NÀY

**Hiệu năng.** Đo ra 14,7 FPS lúc đứng yên và 11,3 FPS lúc AUTO đánh, ở 1920×1080, 102 quái.
**Đừng đọc con số này như một lỗi của game**: sandbox chạy Chromium headless **không GPU**, và
chính `CLAUDE.md` đã ghi cùng môi trường ấy cho 28 FPS ở chỗ máy có GPU cho 60. Thứ *có* nghĩa
là mức TỤT tương đối: **−23%** khi vào trận. Bộ nhớ heap 13,9 MB — rất gọn.

Muốn có số thật thì phải đo trên máy có GPU, hoặc trên chính production.

---

## ❼ SỐ ĐO NỀN KINH TẾ (để đối chiếu về sau)

Cấp 20, quái cấp 14, `computeKillRewards` gọi **800 lượt** (hàm THUẦN nên gọi thẳng được):

| | |
|---|--:|
| tỉ lệ rơi đồ | **10,9%** |
| Lumen trung bình mỗi mạng | **110,8** |
| EXP trung bình mỗi mạng | **251** |
| ngọc trung bình mỗi mạng | **0** |

Cân bằng 5 lớp ở cấp 60 + full BiS: chênh Công Kích **1,75×** (Sylvan Ranger 3.162 cao nhất,
Dark Knight 1.808 thấp nhất) · chênh Máu **2,01×** (ngược lại). Đọc ra đúng hình dạng
"sát thương đổi lấy máu" — không có lớp nào trội cả hai vế.

---

## ❽ ĐỀ XUẤT THỨ TỰ SỬA

| # | Việc | Ở đâu |
|--:|---|---|
| 1 | Cho `#combat-log .cl-row` xuống dòng, hoặc rút ngắn câu thưởng | `style.css:480` |
| 2 | Khai `range` cho `thieulam` · `minhgiao` · `bug` (hoặc `\|\| 90` ở dòng 5347) | `game.js` |
| 3 | Sửa `reset()` của `test_chaos` để nhả `_loBan` | `tests/test_chaos.js` |
| 4 | Viết lại bước 2 hướng dẫn cho đúng NPC + đúng điều kiện | `game.js:26934` |
| 5 | Bước hướng dẫn hết giờ thì DỪNG, đừng nhảy sang bước bất khả thi tại map hiện tại | `game.js` `updateTut` |
| 6 | Tiêu đề phụ tuyến lấy `MAPS[q.map]`, không lấy `MAPS[n.map]` | `game.js:29166` |
| 7 | Gỡ khoá `MOC_NV.mastery` không ai dùng | `game.js` |
| 8 | Cập nhật 3 con số đã lệch trong `CLAUDE.md` / `reg.sh` | tài liệu |
