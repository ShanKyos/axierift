# Đề xuất: CÂY BINH KHÍ — nhánh của cây là LOẠI VŨ KHÍ

> Trạng thái: **ĐỀ XUẤT, chưa chốt.** Viết theo yêu cầu "mỗi hướng phải thật sự chơi khác nhau",
> sau khi chủ dự án kết luận hướng Đại Thành không ổn.
> Nền đo: `aca6802`. Mọi con số trong mục 1 là **đo được**, không phải ước lượng.

## 0. Tóm tắt

Cây kỹ năng hiện tại (Đại Thành) có 144 nút và **không một nút nào đổi cách chơi** — tất cả đều
là `+x%`. Đó là lý do nó không ổn, và thêm nút nữa cũng không chữa được.

Đề xuất: **nhánh của cây = loại vũ khí đang cầm.** Dark Knight đi hướng Rìu thì đánh chậm, nặng,
quét cả bầy; đi hướng Chùy thì đánh nhanh hơn, yếu hơn, nhưng bóc giáp mục tiêu. Cùng một chiêu ở
ô 4, ba cây vũ khí cho ba cách dùng khác nhau.

**Vì sao chính mô hình này, không phải mô hình khác:** 14 dòng vũ khí **đã tồn tại sẵn** trong
game, đã có art đủ, đã khoá lớp, đã có tên theo giai — và đã hứa với người chơi bằng chữ rằng
chúng đánh khác nhau. Lời hứa đó hiện **không chạy**. Đề xuất này vừa cho anh thứ anh cần, vừa
trả nợ một lời hứa đang treo.

---

## 1. ĐO HIỆN TRẠNG — bốn con số quyết định thiết kế

### 1.1 Mười bốn dòng vũ khí đã có sẵn, và mỗi dòng đã hứa một cách chơi

`WEAPON_LINES` trong `data/canbang.js` — 14 dòng × 7 giai = 105 món, art đủ:

| Lớp | Dòng | `desc` đang hiện cho người chơi đọc |
|---|---|---|
| Dark Knight | Kiếm · Rìu · Chùy | cân bằng · **sát thương cao, chậm** · **phá giáp** |
| Sylvan Ranger | Cung Ngắn · Trường Cung · Nỏ | **bắn nhanh** · **tầm xa** · **nặng, xuyên giáp** |
| Dark Wizard | Gậy · Quyền Trượng | sát thương phép · **tốc niệm** |
| Spellblade | Song Đao · Đại Kiếm · Ma Kiếm | **nhanh** · **nặng** · **lai phép** |
| Dark Lord | Lệnh Trượng · Búa · Kích | chỉ huy · **nặng** · **tầm với** |

Đây gần như đúng ví dụ của anh: Dark Knight có Búa/Kiếm/Đao/Thương (game đang có Kiếm/Rìu/Chùy),
Spellblade có Song Kiếm/Đại Kiếm (game đang có Song Đao/Đại Kiếm/Ma Kiếm).

### 1.2 ⚠ Những lời hứa đó KHÔNG CHẠY — cả 14 dòng đánh giống hệt nhau

`it.line` được đọc ở đúng **ba chỗ**, không chỗ nào trong chiến đấu:

| Dòng | Việc |
|---|---|
| `game.js:1457` | chọn **tranh** vũ khí (`VK_ANH`) |
| `game.js:20451`, `21031` | tính **ô túi** (`BAG_SIZES_LINE`) |
| `game.js:20694` | dựng **id** món |

Và mỗi dòng chỉ khai đúng hai khoá: `art` và `motif` — **cả hai đều là hình ảnh**. Không dòng nào
khai tốc độ, tầm, sát thương hay xuyên giáp.

`atkRange()` đọc **chỉ** `SECTS[sect].range`. Nên "Trường Cung — tầm xa" và "Kích — tầm với" bắn
xa đúng bằng mọi cây khác cùng lớp.

⇒ Đây là đúng cái lỗi mà CLAUDE.md cảnh báo nhiều lần: **vẽ trùm qua con quái mà nó không mất máu
là hứa suông.** Ở đây là hứa bằng chữ, suốt 105 món.

### 1.3 Art là tài nguyên khan hiếm nhất — và mô hình này KHÔNG tốn art

- 36 chiêu trên 5 lớp, **chỉ 4 chiêu có art thật** trong `CHIEU_TRANH`.
- Quy tắc số 3 cấm vẽ vector; art mới phải qua meowa, mà sandbox không gọi được meowa.

⇒ Mọi đề xuất đòi **thêm chiêu mới** là đề xuất đắt và bị chặn ở khâu art.
⇒ Mô hình "nhánh = vũ khí" **không cần một tệp art nào**: 14 cây vũ khí đã vẽ xong, và việc của
cây là đổi **cách chúng đánh**, không phải thêm thứ để vẽ.

### 1.4 Có hai điểm cắm duy nhất, sạch sẽ

| Hàm | Vai trò | Đòn bẩy sẵn có |
|---|---|---|
| `doBasic()` (`game.js:10418`, gọi từ 3 chỗ) | **đòn thường** | `atkRange()` · `player.aspd` · `pendingHit{dmg,reach}` · nhánh `ranged` bắn đạn · `spawnSlash` |
| `hurtMob()` (`game.js:9587`) | **điểm áp sát thương DUY NHẤT** | hất lùi · bạo kích · khắc hệ · `swingFeel` |

Đòn thường là thứ người chơi làm ~80% thời gian. Đổi nó là đổi cả cảm giác chơi, mà chỉ phải sửa
**một hàm**.

### 1.5 ⚠ Rủi ro đã lộ ngay khi đo: đồ rơi không biết anh đang theo nhánh nào

`pickItemDef()` bốc **đều tay** trong các dòng của lớp:

```js
return c.length ? c[Math.floor(Math.random() * c.length)] : null;
```

Dark Knight nhận Kiếm/Rìu/Chùy mỗi thứ ~33%. Build theo Rìu thì **2/3 số vũ khí rơi ra là vô
dụng**. Đây chính là lỗi mà Diablo 2 mắc với hệ Mastery — xem mục 2.2. Phải xử, xem mục 7.

---

## 2. NGHIÊN CỨU — bốn game, lấy gì và tránh gì

### 2.1 Path of Exile 2 — **Weapon Set Passive Skills** (lấy: cơ chế cốt lõi)

PoE 2 cho một loại điểm riêng gọi là *Weapon Set Skill Points*. Điểm gán vào **bộ vũ khí I hoặc
II**, và nút đã gán **chỉ có tác dụng khi đang cầm đúng bộ đó** — tức người chơi mang theo hai
cây passive tree cùng lúc, đổi vũ khí là đổi build. Hệ còn tự động hoá được: gán một chiêu cho
một vũ khí thì lúc tung chiêu nhân vật tự đổi sang cây đó và bật đúng nhánh passive.

**Lấy gì:** đúng luật "điểm chỉ sống khi cầm đúng vũ khí". Nó là thứ biến "chọn nhánh" từ một lần
bấm không quay lại được thành **một quyết định mang theo người** — và cho phép thử nhánh khác mà
không phải tẩy điểm.

### 2.2 Diablo 2 — **Barbarian Weapon Masteries** (lấy tên, TRÁNH cấu trúc)

D2 cho Barbarian sáu Mastery bị động: Sword / Axe / Mace / Polearm / Spear / Throwing. Mỗi cái chỉ
chạy khi cầm đúng loại vũ khí.

**Vấn đề, và đây là bài học đắt nhất của cả đợt nghiên cứu:** các Mastery đó **thuần bị động và
thuần con số** (cộng sát thương, cộng chính xác, cộng bạo kích). Tài liệu cộng đồng kết luận thẳng:
đổ điểm vào nhiều Mastery là không khả thi, nên cách hiệu quả nhất là **chọn đúng một cái rồi nhặt
vũ khí đúng loại**. Tức nó không phải một lựa chọn, nó là một **khoản thuế**: ai cũng bấm một cái
rồi quên.

Cái thật sự làm kiếm khác rìu trong D2 **không nằm trong cây** — nó nằm trong **chỉ số món đồ**:
kiếm vung nhanh, thương/polearm tầm với dài hơn, rìu sát thương lớn.

⇒ **Đây đúng là bệnh của Đại Thành hiện nay.** 144 nút toàn `+x%` là hệ Mastery của D2 nhân lên
16 lần. Thêm nút không chữa được; phải đổi thứ mà nút tác động.

⇒ **Kết luận thiết kế:** sự khác biệt phải nằm ở **HỒ SƠ VŨ KHÍ** (tầm, nhịp, hình vùng trúng)
trước, cây chỉ khuếch đại nó sau. Làm ngược lại là ra D2 mastery.

### 2.3 Path of Exile 1&2 — **Keystone** (lấy: cách làm một nhánh "thật sự khác")

Keystone là nút đặc biệt **đổi hẳn cách build vận hành**, và luật thiết kế của nó là: **lợi ích
lớn đi kèm một cái giá thật**. Ví dụ *Primal Hunger* cho tích Rage thụ động và trần Rage rất cao,
**nhưng Rage không còn cộng sát thương đòn đánh nữa** — vô dụng với build thường, cực mạnh với
build nào biết tiêu Rage vào chỗ khác.

**Lấy gì:** mỗi nhánh phải có **đúng một** nút chốt mang cả mặt lợi lẫn mặt hại. Không có mặt hại
thì nút chốt chỉ là "+2% to hơn", và nhánh lại thành thuế.

### 2.4 Last Epoch & Diablo 4 — **cây riêng cho từng chiêu** (lấy: chỗ đặt "đổi hành vi")

- **Last Epoch:** mỗi chiêu có cây chuyên hoá riêng; điểm có thể tăng sức, giảm Mana, **hoặc biến
  đổi hẳn chiêu đó**. Người chơi chuyên hoá tối đa 5 chiêu.
- **Diablo 4 (bản mới):** mỗi chiêu mở hai nhánh bổ trợ trái/phải, cộng **ba biến thể cuối game**
  chia làm *Primary · Utility · **Transformative*** — nhánh Transformative là viết lại nền tảng
  chiêu: đổi hệ, đổi cơ chế.

**Lấy gì:** chỗ để "đổi hành vi" **không phải là thêm chiêu, mà là viết lại chiêu đã có.** Đúng
cái game này cần, vì nó không tốn art: `dk_cyclone` đã có art, ba cách dùng khác nhau vẫn dùng
chung tấm art đó.

### 2.5 Bảng gạn lọc

| Nguồn | Lấy | Bỏ |
|---|---|---|
| PoE 2 | điểm chỉ sống khi cầm đúng vũ khí | hai bộ vũ khí đổi qua lại trong trận (quá phức tạp cho game này) |
| D2 | tên và ý niệm "mastery theo loại vũ khí" | mastery thuần bị động thuần % — **chính là Đại Thành hiện nay** |
| PoE | keystone có mặt hại thật | cây 1.300 nút; ở đây không có chỗ và không cần |
| LE / D4 | biến thể **viết lại chiêu đã có** | thêm chiêu mới (chặn ở art) |

---

## 3. ĐỀ XUẤT — ba tầng, tầng dưới không cần tầng trên mới chạy

### Tầng 1 — HỒ SƠ BINH KHÍ (miễn phí, không tốn điểm)

**Cầm cây vũ khí lên là đã đánh khác.** Không cần cây, không cần điểm, không cần mở khoá.
Đây là tầng quan trọng nhất và rẻ nhất — một bảng dữ liệu + sửa `doBasic()`/`atkRange()`.

Đòn bẩy dùng tới, tất cả đều đã có sẵn trong engine:

| Khoá | Nghĩa | Đòn bẩy engine |
|---|---|---|
| `tam` | tầm đòn thường | `atkRange()` |
| `nhip` | hệ số tốc đánh | `player.aspd` |
| `luc` | hệ số sát thương mỗi nhát | `pendingHit.dmg` |
| `hinh` | hình vùng trúng: `don` (1 mục tiêu) · `quat` (hình quạt) · `hang` (xuyên hàng thẳng) | `aoeHit()` + `nearestMob` |
| `xuyen` | xuyên giáp cộng thêm | `player.pierce` |
| `dun` | có hất lùi không | `hurtMob` source |
| `nap` | phải đứng yên bao lâu mới ra đòn | `doBasic` chặn đầu |

**⚠ `hinh:'quat'` phải bọc trong `aoeHit(() => …)`** — CLAUDE.md ghi rõ: đòn diện rộng mà hất lùi
thì chính nó phá đội hình cho nhát sau. Rìu là ngoại lệ CỐ Ý (khai `dun:true`) vì hất lùi là chữ
ký của nó.

### Tầng 2 — CÂY NHÁNH (điểm, chỉ sống khi cầm đúng vũ khí)

Mỗi lớp có 3 nhánh = 3 dòng vũ khí. Điểm đổ vào nhánh Rìu **chỉ chạy khi đang cầm Rìu**.

Hệ quả cố ý, và đây là chỗ mô hình này hơn hẳn Đại Thành: **không cần tẩy điểm để đổi hướng.**
Mang hai cây vũ khí trong túi là mang hai build. Người chơi được khuyến khích thử — mà muốn "mỗi
hướng chơi khác nhau" thì phải cho người ta thử, không thì chẳng ai biết nhánh kia chơi ra sao.

### Tầng 3 — NÚT CHỐT (mỗi nhánh một cái, có mặt hại)

Cuối mỗi nhánh đúng **một** nút, và nó **viết lại một trong bốn chiêu trên taskbar** cho riêng
vũ khí đó. Không thêm chiêu, không thêm art.

Ví dụ `dk_cyclone` (Flame Cyclone, ô 4 của Dark Knight — **đã có art thật**):

| Nhánh | Nút chốt | Cyclone thành | Mặt hại |
|---|---|---|---|
| Kiếm | **Liên Hoàn** | 3 vòng ngắn nối nhau, di chuyển được giữa các vòng | mỗi vòng chỉ 45% sát thương |
| Rìu | **Trảm Địa** | 1 vòng chậm, 2,2× sát thương, hất bay tất cả | **đứng chôn chân** suốt thời gian quay |
| Chùy | **Toái Giáp** | vòng thường, nhưng mỗi nhát dồn Vỡ Giáp tới trần | sát thương 0,8×, ăn được gì là nhờ mục tiêu bị bóc giáp |

Ba cách dùng thật sự khác nhau, **dùng chung một tấm art**.

---

## 4. MƯỜI BỐN HỒ SƠ BINH KHÍ (bản nháp để cân, chưa đo)

> ⚠ Mọi con số dưới đây là **điểm khởi đầu để đo**, không phải kết quả đo. Đổi nhịp và sát thương
> là đổi DPS, mà đường cong quái đã cân xong — phải chạy lại `test_classbalance` /
> `test_mobbalance` và chỉnh cho tổng DPS ba nhánh xấp xỉ nhau.

### Dark Knight — cận chiến, tầm nền 90

| Dòng | tầm | nhịp | lực | hình | Chơi ra sao |
|---|---|---|---|---|---|
| **Kiếm** | 95 | 1,0× | 1,0× | `don`, nhát thứ 3 thành `quat` | nhịp chuẩn, có thưởng cho ai đánh liên tục không ngắt |
| **Rìu** | 85 | **0,72×** | **1,55×** | `quat` 70°, `dun` | chậm, mỗi nhát dọn cả đám, đẩy địch ra — phải chọn chỗ đứng |
| **Chùy** | 90 | 1,05× | 0,88× | `don`, `xuyen +35%` | cộng dồn **Vỡ Giáp** lên mục tiêu; yếu trước bầy, khắc trùm |

### Spellblade — cận chiến lai phép

| Dòng | tầm | nhịp | lực | hình | Chơi ra sao |
|---|---|---|---|---|---|
| **Song Đao** | 80 | **1,6×** | 0,62× | `don` | mỗi nhát hồi **2 Mana** ⇒ đòn thường nuôi chiêu, bấm chiêu liên tục |
| **Đại Kiếm** | **130** | 0,60× | 1,9× | `quat` 90° | tầm với dài nhất trong ba, chậm và nặng |
| **Ma Kiếm** | 95 | 1,0× | 0,85× | `don` | 50% sát thương đổi sang **hệ của chiêu chính**; đòn thường cộng dồn làm chiêu kế mạnh hơn |

### Sylvan Ranger — đánh xa, tầm nền 380

| Dòng | tầm | nhịp | lực | hình | Chơi ra sao |
|---|---|---|---|---|---|
| **Cung Ngắn** | 330 | **1,45×** | 0,7× | 1 đạn | gần hơn, bắn như mưa, kite liên tục |
| **Trường Cung** | **520** | 0,70× | 1,3× | đạn **xuyên hết hàng** | đứng ngoài tầm mọi thứ, xếp quái thành hàng mà bắn |
| **Nỏ** | 380 | 0,55× | **2,2×** | `xuyen +40%`, `nap 0,4s` | phải đứng yên nạp — AUTO chơi dở hẳn, người chơi thật thì thưởng lớn |

### Dark Wizard — đánh xa, tầm nền 420

| Dòng | tầm | nhịp | lực | Chơi ra sao |
|---|---|---|---|---|
| **Gậy** | 420 | 1,0× | 1,0× | đạn nổ lan nhỏ — đòn thường vẫn đáng bấm |
| **Quyền Trượng** | 380 | 0,85× | **0,55×** | **−18% hồi chiêu toàn bộ**: đòn thường chỉ là chỗ đệm, cả build sống bằng chiêu |

> Dark Wizard mới có **2 dòng**, các lớp khác 3. Cần thêm một dòng thứ ba (đề xuất: **Sách** —
> tầm ngắn 300, triệu hồi một quả cầu tự bắn). **Cái này TỐN ART**, xem mục 6.

### Dark Lord — chỉ huy

| Dòng | tầm | nhịp | lực | hình | Chơi ra sao |
|---|---|---|---|---|---|
| **Lệnh Trượng** | 300 | 1,0× | 0,6× | 1 đạn | đòn thường yếu, nhưng **Chimera đi theo đánh mạnh hơn** — build triệu hồi |
| **Búa** | 90 | 0,70× | 1,7× | `quat` 60°, `dun` | lao vào giữa mà nện |
| **Kích** | **160** | 0,9× | 1,15× | `hang` — trúng cả hàng thẳng trước mặt | tầm với dài nhất cận chiến toàn game; đứng sau tuyến mà chọc |

---

## 5. ĐẠI THÀNH ĐI ĐÂU

Ba lựa chọn, tôi khuyến nghị **(c)**:

| | Cách | Được | Mất |
|---|---|---|---|
| a | Gỡ hẳn | sạch | mất cả cỗ máy đang chạy tốt + 40 bài kiểm đang xanh |
| b | Giữ nguyên làm lớp cấp 120+ | không phải sửa gì | vẫn còn 144 nút `+x%` mà anh đã nói là không ổn; và cấp 1→119 vẫn trống |
| c | **Giữ MÁY, thay DỮ LIỆU** | rẻ nhất, đúng thói quen của dự án | phải viết lại 144 nút |

**Vì sao (c).** Thứ hỏng ở Đại Thành là **dữ liệu** (144 nút toàn %) và **cổng** (cấp 120), không
phải cỗ máy. Cỗ máy thì đúng là thứ một cây binh khí cần, và nó đã có sẵn:

- `masteryAdd` / `masteryKhoa` — cộng điểm, luật khoá, một cửa duy nhất cho cả máy lẫn phần vẽ
- `masteryRaSoat` — hoàn điểm cho save vi phạm luật
- `masteryRespec` — tẩy điểm có phí
- phần vẽ cây hai cột + đường nối + cặp loại trừ
- `tests/test_mastery.js` — 40 mục đang xanh, gác hình dạng cây và "không nút chết"

Sửa để thành cây binh khí cần đúng **ba** chỗ:
1. `masteryAgg()` — bỏ qua nút thuộc nhánh không khớp vũ khí đang cầm (**đây là luật PoE 2**).
2. Cổng `masteryOpen()` — kéo từ cấp 120 xuống **khoảng cấp 10-15**, lúc cây vũ khí thứ hai rơi ra.
3. Dữ liệu 16 bảng → 5 lớp × 3 nhánh vũ khí.

Việc kéo cổng xuống cấp 10 còn chữa đúng bệnh mà CLAUDE.md đã chẩn: *"20 cấp đầu có, 99 cấp sau
không có cấp nào mở ra hệ thống mới"*. Cây binh khí trải suốt 1→120 thì đoạn trống đó có nội dung.

---

## 6. GIÁ PHẢI TRẢ — nói thẳng

| Hạng mục | Chi phí | Art mới |
|---|---|---|
| Tầng 1 — 14 hồ sơ binh khí | 1 bảng dữ liệu + sửa `doBasic`/`atkRange` + **một đợt cân bằng lại** | **0** |
| Tầng 2 — cây nhánh | dùng lại máy Đại Thành + viết dữ liệu mới | **0** |
| Tầng 3 — 15 nút chốt | đắt nhất: mỗi nút viết lại hành vi một chiêu, chạm `castSkill` | **0** |
| Dòng thứ 3 cho Dark Wizard | 7 nấc art vũ khí mới | **có** — phải qua meowa, việc của chủ dự án |
| Nhánh thứ 4 mỗi lớp (nếu muốn Thương/Đao như anh nêu) | 7 nấc art × số dòng thêm | **có** |

**Phần đắt nhất KHÔNG phải mã, mà là cân bằng.** Đổi nhịp và sát thương của đòn thường là đổi DPS
nền của cả 5 lớp, mà đường cong quái (`MOB_NEN_*`, `levelPower`) đã cân xong quanh con số cũ.

---

## 7. BỐN RỦI RO, VÀ CÁCH CHẶN

### 7.1 ⚠ Đồ rơi không biết anh theo nhánh nào *(đã đo, mục 1.5)*

`pickItemDef()` bốc đều tay ⇒ 2/3 vũ khí rơi ra vô dụng với người đã chọn nhánh.
**Chặn:** cho tỉ lệ rơi nghiêng về nhánh người chơi đã đổ điểm (vd 60/20/20), **và** thêm một công
thức vào Lò Hỗn Độn đổi dòng vũ khí giữ nguyên giai. Lò đã là cỗ máy chạy theo `CHAOS_RECIPES`
nên thêm công thức là thêm một phần tử, không sửa phần vẽ.

### 7.2 ⚠ Cái bẫy "một dòng tốt nhất" — đúng bệnh D2 Mastery

Nếu một dòng nhỉnh hơn về con số thì cây thành lựa chọn giả.
**Chặn:** ba dòng phải khác nhau về **KIỂU**, không về **LƯỢNG** — và nội dung phải có chỗ cho
từng kiểu. Vỡ Giáp của Chùy toả sáng ở Trùm Vùng; quét quạt của Rìu toả sáng ở bãi 8 con; Kiếm
toả sáng ở đoạn đánh dài không ngắt. Phải có **bài kiểm đo DPS ba nhánh trên ba kịch bản** (1 mục
tiêu / bầy 8 con / trùm giáp dày), không chỉ đo một con số tổng.

### 7.3 ⚠ AUTO chơi dở mấy nhánh cần đứng đúng chỗ

Nỏ phải nạp, Kích phải xếp hàng thẳng, Trường Cung phải giữ khoảng cách — AUTO sẽ chơi tệ.
**Đây có thể là tính năng, không phải lỗi**: CLAUDE.md đã chốt *"hai thứ AUTO xử lý dở nhất, cũng
là lý do người chơi phải tự cầm chuột"*. Nhưng phải **cố ý**, và phải nói trước cho người chơi —
không thì họ tưởng nhánh đó yếu.

### 7.4 ⚠ Vũ khí 2 (`vukhi2`) đang tắt ở mọi lớp

Ô `vukhi2` có sẵn với cờ `haiTay`, và **hiện không lớp nào bật**. Nếu Song Đao muốn thật sự là
"hai cây" thì phải bật cờ đó cho Spellblade — mà `calcDerived()` duyệt cả bảng `SLOTS` nên bật
lên là công gần gấp đôi. Chú thích tại chỗ đã cảnh báo đúng chuyện này.
**Đề xuất:** Song Đao cứ là **một món** mang hồ sơ "hai lưỡi" (nhịp 1,6×), đừng đụng `vukhi2`.

---

## 8. THỨ TỰ THI CÔNG ĐỀ XUẤT

Từng đợt đứng riêng được, đợt sau không cần đợt trước mới có giá trị:

| Đợt | Việc | Vì sao trước |
|---|---|---|
| **1** | 14 hồ sơ binh khí + cân bằng lại + bài kiểm ba kịch bản | Rẻ nhất, không art, và **tự nó đã cho "mỗi hướng chơi khác nhau"** kể cả khi bỏ hẳn phần cây |
| **2** | Tỉ lệ rơi nghiêng theo nhánh + công thức đổi dòng ở Lò | Không có bước này thì đợt 1 gây ức chế |
| **3** | Chuyển máy Đại Thành thành cây nhánh, kéo cổng xuống cấp ~12 | Lấp đoạn 99 cấp trống |
| **4** | 15 nút chốt có mặt hại | Đắt nhất, và cần đợt 1-3 đứng vững mới đo được |

**Đợt 1 là đợt đáng làm nhất.** Nếu chỉ làm đúng nó rồi dừng, game đã có 14 cách chơi khác nhau —
nhiều hơn hẳn thứ 144 nút Đại Thành đang cho.

---

## 9. CẦN CHỦ DỰ ÁN CHỐT

1. **Đại Thành:** gỡ hẳn, giữ làm lớp cuối, hay giữ máy thay dữ liệu (tôi khuyến nghị cái thứ ba)?
2. **Số nhánh mỗi lớp:** giữ 3 như art hiện có, hay mở lên 4 (Thương cho Dark Knight, v.v.) và
   chấp nhận đặt art mới?
3. **Dark Wizard đang thiếu một dòng** (2 thay vì 3) — thêm art, hay để lớp này cố ý chỉ có 2 hướng?
4. **Đổi nhánh có nên tốn gì không?** Đề xuất của tôi: **không** — mang hai cây vũ khí là mang hai
   build, đúng lối PoE 2. Nhưng nếu anh muốn lựa chọn "nặng" hơn thì phải thêm phí.
