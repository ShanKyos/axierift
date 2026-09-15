# Hệ tiền tệ — rà lại và đề xuất gộp (bậc 5)

> **Đây là BẢN ĐỀ XUẤT, chưa thi công.** Chờ chủ dự án chốt ba câu ở §6 rồi mới làm.
> Mọi con số dưới đây đọc thẳng từ `public/game/game.js`, không ước lượng.

## §0 — Đây là bậc 5 của một việc đang làm dở, không phải ý mới

`game.js` đã có sẵn bốn mốc gộp tiền tệ, mỗi mốc một hằng tỉ giá và một đường di trú trong
`loadGame()`:

| Bậc | Đã xoá | Tỉ giá | Hằng |
|---|---|---|---|
| 1 | Anima | 1 → 2 Lumen | `GO_ANIMA` |
| 1 | Công Huân Lệnh | 1 → 2.000 Lumen | `GO_CONGHUAN` |
| — | Huyền Thiết | 1 → 150 Lumen | `GO_HUYENTHIET` |
| — | Ấn Thuần Thú | 1 → 1.500 Lumen | `GO_ANTHUANTHU` |
| 4 | Tâm Đắc | 1 → 4.000 Bản Năng | `GO_TAMDAC` |

Lý do gộp Tâm Đắc, chép nguyên văn từ `game.js:3087`:

> *"Tâm Đắc có ĐÚNG một nguồn (hạ tinh anh/boss) và ĐÚNG một chỗ tiêu (sáu cấp mốc của chiêu)…
> Nó lại nằm chung một nút bấm với Lumen và Instinct, nên người chơi phải nhìn ba ô đếm để hiểu
> vì sao nút xám."*

**Ba dấu hiệu đó — một nguồn · một chỗ tiêu · chung một nút bấm — là cái sàng của tài liệu này.**
Không phát minh luật mới; áp đúng luật cũ lên phần còn lại.

Và kèm theo một luật nữa, cũng lấy từ chính đợt Tâm Đắc: **gộp thì giữ lại SỨC ÉP**. Tâm Đắc ép
người chơi đi săn tinh anh; gộp xong thì `rw.khi` đổi sang rơi theo loại quái (10 / 35 / 120 /
200) để sức ép đó không mất. Mọi đề xuất dưới đây đều phải trả lời câu "sức ép đi đâu".

## §1 — Đang có 13 ô đếm

| # | Người chơi đọc | Trường | Nguồn | Số chỗ tiêu |
|---|---|---|---|---|
| 1 | **Lumen** ◈ | `silver` | mọi cú giết (bảo đảm) | **24** |
| 2 | **Bản Năng** | `khi` | mọi cú giết + 3/giây thụ động + nghỉ ngoại tuyến | **1** |
| 3 | **Tu La Tinh Thạch** ◆ | `gems.tuLa` | 15% quái lv≥3 · tiệm 1.800◈ | **1** |
| 4 | **Hỗn Nguyên Thạch** ❖ | `gems.honNguyen` | 35% tinh anh · tiệm 2.600◈ | 3 |
| 5 | **Mảnh Trang Bị** ❖ | `mats.manh` | 100% tinh anh · 8% quái thường | **1** |
| 6 | **Đá Ấn Trụ** ◆ | `mats.tichMa` | **chỉ** Vệ Binh Trụ (1-2 viên) | **1** |
| 7 | **Thiên Mệnh Phù** ☂ | `charms` | **chỉ mua 500◈** (2 nút, cùng giá) | **1** |
| 8 | **Đất Hồn** ◈ | `mats.datHon` | Cốt rơi (boss vùng 1-3 · Vỉa Cốt 6-9) | 2 |
| 9 | **Ấn Giao Kết** ✦ | `chimera.ve.gk` | boss vùng lần đầu · điểm danh · 5♦ | 1 |
| 10 | **Ấn Cổ Xưa** ✦ | `chimera.ve.cx` | điểm danh · 40♦ | 1 |
| 11 | **Shard** ♦ | `shard` | 4 mốc cố định, **không rơi từ quái** | 4 |
| 12 | **Nguyệt Trần** | `chimera.nguyet` | trùng xác đã kín Cộng Hưởng (+25 / +5) | **0** |
| 13 | **Tinh Trần** | `chimera.tinh` | quay ra 3★ | **0** |

*(Tứ Châu · Sách Kỹ Năng · Mảnh Cổ Thư là **vật phẩm có ô đếm**, không phải tiền — dùng thẳng,
không mua bán. Không tính vào 13.)*

## §2 — Chẩn đoán theo DÒNG CHẢY, không theo bảng

Xếp lại 13 ô theo **việc người chơi đang làm**, thì bức tranh đổi hẳn:

| Người chơi muốn | Mở ở | Phải nhìn mấy ô |
|---|---|---|
| Đánh quái, nhặt tiền | cấp 1 | 1 — Lumen |
| Mạnh chiêu lên | cấp 1 | 2 — Lumen · **Bản Năng** |
| **Rèn +N** | cấp 4 | **4** — Lumen · Tu La · Hỗn Nguyên · Thiên Mệnh Phù |
| **Kế Thừa (lên giai đồ)** | có Vệ Binh Trụ | **3** — Lumen · Mảnh · Đá Ấn Trụ |
| Chế cánh | cấp 40 | 3 — Lumen · Hỗn Nguyên · Tứ Châu |
| Quay Cổ Vật | — | 2 (+2 đọng lại) — Ấn GK · Ấn CX · *Nguyệt* · *Tinh* |
| Nuôi Cổ Vật | — | 1 — Đất Hồn |
| Nới túi/kho | — | 1 — Shard |

⇒ **"Làm cho bộ đồ mạnh lên" là MỘT ý định, mà nó bị chẻ ra sáu ô đếm** (Lumen · Tu La ·
Hỗn Nguyên · Phù · Mảnh · Đá Ấn Trụ). Đây là chỗ hỏng chính, không phải con số 13.

### Bốn thứ đo được, mỗi thứ là một lỗi riêng

**① Hai đồng tiền CHẾT.** `Nguyệt Trần` và `Tinh Trần`: grep cả tệp ra **0** chỗ trừ đi, cho
cả hai. Không phải bỏ sót — `game.js:4513` ghi rõ *"chủ dự án giữ hai loại đó cho cửa hàng đổi
vật phẩm"*, mà cửa hàng đó chưa dựng. Quay càng nhiều thì tích càng dày một con số không làm gì.

**② Hai ô đếm mô tả đúng MỘT cái giá.** Kế Thừa tốn `{ manh:40, tichMa:4 }` — **luôn cùng nhau,
luôn đúng tỉ lệ 10:1, và là chỗ tiêu DUY NHẤT của cả hai.** Không có cách nào tiêu cái này mà
không tiêu cái kia. Đó là một cái giá viết bằng hai con số.

**③ Thiên Mệnh Phù là một cái GIÁ LUMEN đội lốt ô đếm.** Hai nguồn duy nhất: nút "Mua 500◈" ở
lò và một dòng tiệm — **cùng đúng 500◈**. Không rơi từ quái, không rơi từ hộp, không đổi bằng gì
khác. Người chơi phải mua trước rồi mới tích được ô, để rồi trả đúng số Lumen đó.

**④ Bảng của game nói hai viên đá gần bằng nhau; bảng rơi đồ nói ngược lại.**

| | giá tiệm | nguồn rơi |
|---|---|---|
| Tu La ◆ | 1.800◈ | 15% **quái thường** lv≥3 |
| Hỗn Nguyên ❖ | 2.600◈ | 35% **tinh anh** |

Tiệm định giá chúng lệch **1,44×**. Nhưng tinh anh hiếm hơn quái thường hàng chục lần, nên giá
thật lệch xa hơn thế nhiều. Một trong hai bảng đang sai, và người chơi không có cách nào biết.

### Và một lỗi không đo được bằng số: KHÔNG CÓ CHỖ NÀO NHÌN THẤY CẢ 13

13 ô nằm rải ở **sáu** màn khác nhau:

| Màn | Hiện những ô nào |
|---|---|
| Ví HUD | Lumen · Ấn Giao Kết · Shard |
| Túi Đồ → Vật Liệu (`MAT_ROWS`) | Shard *(lặp)* · Tu La · Hỗn Nguyên · Phù · Cổ Thư · Mảnh · Đá Ấn Trụ |
| Bảng Kỹ Năng | Bản Năng |
| Bảng Khế Ước | Ấn GK · Ấn CX · Nguyệt Trần · Tinh Trần |
| Bảng Cổ Vật | Đất Hồn |
| Lò Hỗn Độn | Lumen · Tu La · Hỗn Nguyên · Phù |

**Bốn ô — Bản Năng · Đất Hồn · Nguyệt Trần · Tinh Trần — không có mặt trong danh sách Vật Liệu.**
Bản Năng là thứ mà nghỉ ngoại tuyến trả về, và nó không xuất hiện ở bất cứ đâu ngoài bảng Kỹ Năng.

### Ký hiệu đụng nhau ba cặp

| Ký hiệu | Đang gánh |
|---|---|
| ◆ | Tu La Tinh Thạch · Đá Ấn Trụ *(và ♦ Shard nhìn gần như y hệt ở cỡ HUD)* |
| ❖ | Hỗn Nguyên Thạch · Mảnh Trang Bị |
| ◈ | **Lumen** · Đất Hồn |

Chữ bay khi rơi đồ chỉ có ký hiệu + tên, nên `+1 ◆` đọc lướt là mơ hồ hoàn toàn.

### Một dòng mô tả đang nói dối

Tiệm và Túi Đồ đều ghi Tu La dùng để *"**Khảm trang bị** · rèn +7 trở lên"*. Khảm là cơ chế thật
(`Khảm Ngọc`) nhưng nó ăn **Tứ Châu**, không ăn Tu La. Tu La chỉ có đúng một chỗ tiêu: rèn.
Tàn dư của một cơ chế đã gỡ, còn nằm ở hai chỗ.

## §3 — Đề xuất: 13 → 9

Xếp theo độ chắc chắn. Nhóm A không mất cơ chế nào; nhóm B cần chủ dự án gật.

### 🟢 NHÓM A — nên làm, không mất gì

**A1 · Đá Ấn Trụ ◆ → gộp vào Mảnh Trang Bị ❖ · tỉ giá 1 Đá = 10 Mảnh**
- Tỉ giá **lấy từ chính chỗ tiêu**, đúng khuôn Tâm Đắc: `40 manh : 4 tichMa` = 10:1.
- Giá mới: Kế Thừa = **80 Mảnh** + 5.000×giai Lumen.
- **Sức ép đi đâu:** Đá Ấn Trụ là nguồn *duy nhất* từ Vệ Binh Trụ, nên gộp xong thì Vệ Binh Trụ
  rơi **10–20 Mảnh** một lần thay cho 1–2 Đá. Vẫn là "phải đánh Vệ Binh Trụ mới leo giai được",
  nhưng bằng thứ đã có trên bảng. *(Không đổi cân bằng: 1–2 Đá × 10 = 10–20 Mảnh, đúng một-đổi-một.)*
- Di trú: `player.mats.manh += player.mats.tichMa * 10; delete player.mats.tichMa;` + hằng `GO_TICHMA = 10`.

**A2 · Thiên Mệnh Phù ☂ → giá Lumen thẳng trên ô tích ở lò**
- Ô tích "Dùng ☂ Thiên Mệnh Phù" đổi thành **"Mua bảo hiểm (+500◈)"**, trừ Lumen ngay lúc rèn.
- Bỏ hẳn bước mua trước, bỏ ô đếm, bỏ một dòng tiệm. Người chơi trả đúng số Lumen như cũ.
- Di trú: hoàn `charms × 500` về Lumen (hằng `GO_THIENMENH = 500`), rồi `delete player.charms`.
- ⚠ Đây là món **duy nhất** trong 13 ô mà gộp xong **giảm số thao tác**, không chỉ giảm số đếm.

**A3 · Gỡ ba cặp ký hiệu đụng nhau**
- Đất Hồn ◈ → **✤** (thôi đụng Lumen)
- Mảnh Trang Bị ❖ → **▪** (thôi đụng Hỗn Nguyên)
- Sau A1 thì Đá Ấn Trụ biến mất ⇒ ◆ còn một mình cho Tu La.

**A4 · Sửa dòng mô tả Tu La** — bỏ "Khảm trang bị" ở cả hai chỗ (`RARE_POOL`, `MAT_ROWS`).

**A5 · Một chỗ nhìn thấy tất cả** — `MAT_ROWS` nhận thêm **Bản Năng · Đất Hồn** (và Nguyệt/Tinh
nếu B2 giữ chúng), bỏ dòng Shard lặp. Không đụng cơ chế nào; chỉ để bảng Vật Liệu đúng tên gọi.

### 🟡 NHÓM B — cần chủ dự án chốt

**B1 · Tu La ◆ + Hỗn Nguyên ❖ → MỘT viên đá rèn**

|  | Gộp | Giữ hai |
|---|---|---|
| Được | rèn từ 4 ô còn **2** (Lumen + đá) · hết mâu thuẫn giá tiệm/bảng rơi | giữ mốc "+10 đòi vật liệu KHÁC" — một nhịp tiến trình kiểu MU |
| Mất | mốc đổi vật liệu ở +10 thành đổi **số lượng**, không đổi **loại** | vẫn 4 ô ở màn rèn · vẫn phải giải thích hai viên đá gần giống nhau |

**Tôi nghiêng về GỘP**, vì tiệm đang tự định giá chúng lệch 1,44× — tức chính game không coi
đây là hai bậc giá trị khác nhau, cái mốc kia là mốc trên danh nghĩa. Tỉ giá lấy từ giá tiệm:
**1 Hỗn Nguyên = 1,5 Tu La** (2.600/1.800 ≈ 1,44 → làm tròn lên cho người chơi khỏi thiệt).
Sau gộp, +10/+11 tốn nhiều đá hơn hẳn — nhịp vẫn còn, chỉ đọc bằng số lượng.

⚠ Hỗn Nguyên còn hai chỗ tiêu khác (chế cánh, ghép 3 món lên giai), nên **giữ tên Hỗn Nguyên**
và quy Tu La vào nó, đừng làm ngược.

**B2 · Nguyệt Trần + Tinh Trần — ba đường, phải chọn một**

| | Việc phải làm | Kết quả |
|---|---|---|
| **(a) Dựng cửa hàng Trần** *(đúng ý đã giữ)* | một bảng 4-6 dòng đổi Ấn · Đất Hồn · Mảnh Giáp Vụn | 13 → vẫn 13, nhưng hết đồng tiền chết |
| **(b) Gộp hai làm một rồi dựng cửa hàng** | như trên + một tỉ giá | 13 → 12, hết đồng tiền chết |
| **(c) Xoá, quy đổi ra thứ có sẵn** | Nguyệt → Ấn Giao Kết · Tinh → Đất Hồn | 13 → 11, không phải dựng gì |

**Tôi nghiêng về (a).** Hai loại trần này KHÔNG trùng vai: Tinh Trần là an ủi cho 3★ (gặp
thường xuyên), Nguyệt Trần là an ủi cho xác đã kín Cộng Hưởng (hiếm, về sau) — đúng cặp
"bụi thường / bụi quý" mà mọi gacha đều có, và một cửa hàng hai bậc giá là chỗ đúng của chúng.
Nhưng (a) là mục **DUY NHẤT trong cả tài liệu này làm TĂNG việc** thay vì giảm; nếu ưu tiên
là gọn trước, thì **(c)** xong trong một buổi.

### 🔴 KHÔNG gộp — và lý do

| Giữ | Vì |
|---|---|
| **Bản Năng** | Là đồng tiền duy nhất buộc theo **thời gian chơi** chứ không theo **số quái giết** (3/giây thụ động), và là thứ nghỉ ngoại tuyến trả về. Gộp vào Lumen là bỏ mất phần thưởng vắng mặt. **Nhưng phải cho nó lên bảng Vật Liệu (A5)** — hiện nó chỉ có mặt ở bảng Kỹ Năng. |
| **Ấn Giao Kết / Ấn Cổ Xưa** | Hai banner ⇒ hai vé. Đúng khuôn gacha, gộp là mất banner. |
| **Shard** | Chỗ tiêu duy nhất cho nới túi/kho, và không rơi từ quái nên không lạm phát. |
| **Đất Hồn** | Vòng lặp kín của Cổ Vật (Cốt rơi → nuôi cấp → Hoá). Một nguồn một đích, không chồng ai. |

## §4 — Sau khi làm, dòng chảy trông thế nào

| Người chơi muốn | Trước | Sau (A + B1) |
|---|---|---|
| Rèn +N | **4** ô | **2** ô — Lumen · Hỗn Nguyên |
| Kế Thừa | **3** ô | **2** ô — Lumen · Mảnh |
| Mạnh chiêu | 2 ô | 2 ô — Lumen · Bản Năng |
| Chế cánh | 3 ô | 3 ô — Lumen · Hỗn Nguyên · Tứ Châu |
| Quay / nuôi Cổ Vật | 5 ô | 3-5 ô *(tuỳ B2)* |
| Nới túi/kho | 1 ô | 1 ô — Shard |

**13 → 9** (A + B1 + B2c) hoặc **13 → 11** (chỉ nhóm A).

Và mỗi ô còn lại trả lời được một câu ngắn:
- **Lumen** — tiền tiêu vặt, tiêu ở đâu cũng được
- **Bản Năng** — thời gian đã bỏ ra, đổi lấy cấp chiêu
- **Hỗn Nguyên** — đá rèn, làm đồ đang có mạnh thêm
- **Mảnh Trang Bị** — làm đồ đang có LÊN GIAI
- **Đất Hồn** — nuôi Cổ Vật
- **Ấn Giao Kết / Cổ Xưa** — vé quay
- **Shard** — tiện nghi (túi, kho)

## §5 — Cái giá, và chỗ dễ vỡ

| Việc | Cỡ | Rủi ro |
|---|---|---|
| A1 Đá Ấn Trụ → Mảnh | nhỏ — 1 hằng, 1 dòng di trú, 2 chỗ sửa giá, 1 chỗ sửa rơi | thấp |
| A2 Phù → giá Lumen | nhỏ — 5 chỗ đọc `charms`, 1 ô tích, 1 dòng tiệm | thấp |
| A3 ký hiệu · A4 mô tả · A5 bảng | rất nhỏ, thuần chữ | không |
| B1 Tu La → Hỗn Nguyên | **vừa** — `forgeRule` 5 dòng, 2 dòng tiệm, 1 đường rơi, 1 di trú | **đổi cảm giác rèn** ⇒ phải chơi thử |
| B2a cửa hàng Trần | **lớn** — một bảng mới | là nội dung mới, không phải dọn dẹp |

**Ba chỗ dễ vỡ, ghi trước khi quên:**

1. **Di trú phải chạy ĐÚNG MỘT LẦN.** Cả năm đợt gộp trước đều `delete` trường cũ ngay sau khi
   quy đổi. Thiếu `delete` là mỗi lần tải trang lại cộng thêm một lần nữa.
2. **Đừng đổi tên KHOÁ SAVE.** Cùng luật đã áp cho `silver`→"Lumen" và `player.chimera`: đổi
   **chữ người chơi thấy**, giữ nguyên khoá. B1 giữ khoá `gems.honNguyen`.
3. **`MAT_ROWS` và ví HUD phải cùng một nguồn.** Hiện Shard nằm ở cả hai chỗ, chép cứng hai lần.
   Thêm ô mới vào A5 thì đi qua một bảng, đừng chép lần thứ ba.

**Bài kiểm cần thêm** (`tests/test_tiente.js`, chưa viết):
- mỗi đồng tiền còn sống phải có **≥1 nguồn và ≥1 chỗ tiêu** — bài này sẽ đỏ ngay hôm nay với
  Nguyệt Trần / Tinh Trần, và đó là chủ ý: nó chính là thứ gác cho §2①
- save đời cũ đi qua di trú **không mất sức mua** (tổng quy về Lumen trước/sau chênh 0)
- không ký hiệu nào gánh hai đồng tiền

## §6 — Ba câu cần chủ dự án trả lời

1. **Nhóm A làm luôn chứ?** (13 → 11, không mất cơ chế nào, rủi ro thấp)
2. **B1 — gộp Tu La vào Hỗn Nguyên, hay giữ hai viên?** *(tôi nghiêng: gộp)*
3. **B2 — Nguyệt/Tinh Trần đi đường (a) dựng cửa hàng, (b) gộp rồi dựng, hay (c) xoá?**
   *(tôi nghiêng: (a) nếu còn sức làm nội dung mới, (c) nếu muốn gọn trước)*
