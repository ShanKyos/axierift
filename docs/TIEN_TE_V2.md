# Hệ tiền tệ — bản rework theo hướng chủ dự án chốt

> Thay cho `docs/TIEN_TE.md` (bản rà soát + ba câu hỏi). Chủ dự án đã trả lời:
> *"Chỉ muốn giữ lại phần ngọc để có thể up đồ +9. Và sẽ cần ngọc hỗn nguyên để ép cánh và
> đồ +10. Có thể dọn dẹp các nhánh tiền tệ khác, sau đó dựa vào flow hiện tại và tạo ra /
> rework 1 nhánh tiền tệ mới."*
>
> **Vẫn CHƯA thi công.** §5 còn hai chỗ cần gật.

## §0 — Quyết định này vừa gỡ một cái bẫy tôi chưa báo cáo

Đào sâu vào chỗ rèn thì lộ ra: **game đang có HAI đường độc lập đưa món đồ từ +0 lên +9**, mỗi
đường một loại tiền, một bảng tỉ lệ, và **một luật xịt khác nhau** — mà không chỗ nào nói cho
người chơi biết.

| Mốc | Ép ngọc thẳng trong túi (`epNgoc`) | Rèn Thường ở Lò (`forgeRule`) |
|---|---|---|
| +1…+6 | Chúc Phúc · **100%** | Lumen · 100% |
| +7 | Linh Hồn · 50% · hỏng **tụt 1** | Lumen + 1 Tu La · **75%** · hỏng tụt 1 |
| +8 | Linh Hồn · 50% · hỏng **tụt 1** | Lumen + 1 Tu La · **65%** · hỏng **VỀ +0** |
| +9 | Linh Hồn · 50% · hỏng **tụt 1** | Lumen + 1 Tu La · **50%** · hỏng **VỀ +0** |

Người chơi nào đọc ra bảng này sẽ **rèn +7 ở Lò** (75% thay vì 50%) rồi **chuyển sang ngọc cho
+8/+9** (tụt 1 thay vì về 0). Ai không đọc ra thì chọn sai và mất đồ. Đó không phải chiều sâu,
đó là một cái bẫy — và nó tồn tại chỉ vì có hai đường làm cùng một việc.

⇒ **"Chỉ giữ lại phần ngọc" xoá thẳng cái bẫy đó.** Tu La chết theo, không phải vì nó thừa mà
vì cái đường nuôi nó bị gỡ.

## §1 — Và một cái bẫy đặt tên

`Hỗn Độn Châu` ● (`jewels.honDon`) và `Hỗn Nguyên Thạch` ❖ (`gems.honNguyen`) là **hai thứ khác
nhau**, cùng có mặt trong **cùng một công thức** (Phá Thiên Kiếp) và **cùng dùng để ép cánh**.
Tên tiếng Việt lệch nhau đúng một chữ.

Vai của chúng gần như trùng khít — cả hai là "vật liệu hỗn mang" kiểu Jewel of Chaos, mà MU chỉ
có **một** viên như thế.

⇒ **Gộp `honDon` vào `honNguyen`, tỉ giá 1:1** — lấy từ chính chỗ tiêu: Phá Thiên Kiếp +10 đòi
`honDon 1 + honNguyen 1`, tức game đang định giá chúng ngang nhau. Viên còn lại mang tên chủ dự
án đã gọi: **Ngọc Hỗn Nguyên**, và nó nhận luôn việc **Đổi Hệ** mà Hỗn Độn đang giữ.

## §2 — Trục TRANG BỊ sau rework: Lumen + 4 viên ngọc, hết

| Mốc | Tiêu gì | Tỉ lệ | Hỏng thì |
|---|---|---|---|
| +1 … +6 | ◎ **Chúc Phúc Châu** | 100% | không bao giờ hỏng |
| +7 … +9 | ◉ **Linh Hồn Châu** | 50% | tụt 1 cấp |
| **+10 / +11** | ❖ **Ngọc Hỗn Nguyên** + Chúc Phúc/Linh Hồn + Lumen | 50% / 45% | **VỠ VỤN** |
| Dòng Sinh Lực (7 bậc) | ❤ **Sinh Mệnh Châu** | 50% | về 0 |
| Đổi Hệ | ❖ **Ngọc Hỗn Nguyên** | 100% | — |
| Ép cánh (3 bậc) | ❖ **Ngọc Hỗn Nguyên** + Lumen | 100/100/70% | bậc 3 tụt về bậc 1 |

**Gỡ hẳn:** `Rèn Thường` (đường Lumen+Tu La lên +9) · `Tu La Tinh Thạch` · `Hỗn Độn Châu`
(gộp vào Hỗn Nguyên) · `Thiên Mệnh Phù` (thành **ô tích trừ thẳng 500◈** lúc rèn — nó vốn chỉ
mua được bằng đúng 500◈ ở hai nút, không rơi từ đâu).

Phá Thiên Kiếp hiện bắt người chơi đọc **SÁU dòng chi phí** cho một nút bấm
(`honDon · chucPhuc · linhHon · Lumen · tuLa · honNguyen`). Sau rework còn **ba**.

### ⚠ Kế Thừa cũng phải đi — và đây là chỗ cần gật

`Kế Thừa` (leo giai món đồ) là **trục thứ hai trên cùng một món đồ**, nằm cùng Lò, ăn một túi
nguyên liệu riêng (`Mảnh Trang Bị` + `Đá Ấn Trụ`). Chính `game.js:16112` đã gỡ một trục y hệt
vì lý do này, chép nguyên văn:

> *"TẤN PHẨM (leo phẩm) đã GỠ… đó là trục thứ hai song song với +N, cùng ăn một túi nguyên liệu,
> cùng ở Lò Rèn, và người chơi phải học hai bảng giá cho hai thứ nghe na ná nhau.
> **MU chỉ có MỘT trục trên món đồ: +N bằng ngọc.**"*

Kế Thừa là **cùng một câu** với Tấn Phẩm, chỉ khác tên. Giữ nó thì "chỉ giữ lại phần ngọc" không
thành sự thật, và hai ô đếm `Mảnh` + `Đá Ấn Trụ` phải sống tiếp chỉ để nuôi một mình nó.

⇒ Đề nghị **gỡ Kế Thừa**, giai của món do thứ rơi ra quyết định — đúng như phẩm đã làm.
Hoàn trả: `manh/10 + tichMa` quy ra Lumen theo giá Kế Thừa đang niêm yết.

**Đây là gỡ một tính năng, không phải đổi tên, nên tôi không tự quyết.** Nếu muốn giữ Kế Thừa
thì nó phải đổi sang ăn **ngọc** (ví dụ 1 Hỗn Nguyên + Lumen mỗi giai) chứ không giữ hai ô đếm
riêng — nói cách khác vẫn không còn `Mảnh` và `Đá Ấn Trụ`.

## §3 — NHÁNH MỚI: trục NHÂN VẬT

Dọn xong trục trang bị thì lộ ra vế còn lại đang **không có trục nào cả** — nó có ba mẩu rời:

| Nuôi cái gì | Đang ăn | Nguồn | Chỗ tiêu |
|---|---|---|---|
| Cấp chiêu | **Bản Năng** | mọi cú giết · **3/giây thụ động** · nghỉ ngoại tuyến | 1 |
| Cấp Cổ Vật | **Đất Hồn** | Cốt rơi (boss vùng · Vỉa Cốt) | 2 |
| Cộng Hưởng thừa | **Nguyệt Trần** | trùng xác đã kín R6 | **0** |
| Quay ra 3★ | **Tinh Trần** | mỗi lượt quay | **0** |

Bốn ô này cùng nói một câu: **"đầu tư dài hạn vào thứ mình đã có"** — không phải vào món đồ.
Và hai trong bốn cái không tiêu được ở đâu.

⇒ **Gộp cả bốn thành MỘT đồng.** Sau đó trục nhân vật có đúng một pool, và người chơi phải
**chọn**: dồn vào cấp chiêu, hay dồn vào Cổ Vật. Đó là thứ bốn ô rời không bao giờ tạo ra được.
Cùng nguyên lý CLAUDE.md đã ghi cho Đại Thành: *"Ngân sách là một nửa của thiết kế… hết khan
hiếm là hết lựa chọn."*

**Nó cũng là chỗ tiêu mà Nguyệt/Tinh Trần đang thiếu** — không phải dựng thêm một cửa hàng mới.

**Tên đề nghị: `Hồn Thép`** — Vaeldra là *"lục địa thép và tro"*, nên đây là thứ chắt ra từ cái
mình đã giết. Không phải từ vựng tu tiên, không phải tên riêng MU, không đụng tên nào đang dùng.
*Hai phương án khác: `Tàn Huy` · `Vụn Hồn`.*

### ⚠ CHỖ DỄ VỠ NHẤT CỦA CẢ ĐỢT — hai cái vòi lệch nhau ~500 lần

Đây là chỗ phải quyết, không thể chọn tỉ giá cho xong:

| | Vào bao nhiêu |
|---|---|
| Bản Năng | 3/giây thụ động = **10.800/giờ**, cộng thêm 10/35/120/200 mỗi cú giết |
| Đất Hồn | 1-3 mỗi Cốt rơi · 6-9 mỗi Vỉa ⇒ cỡ **20-50 một NGÀY** |

Đổ chung một pool mà giữ nguyên hai cái vòi thì **cái vòi thụ động sẽ nuốt luôn Cổ Vật**: treo
máy một giờ bằng cả tuần đi đào Vỉa Cốt. Ba đường ra, phải chọn một:

| | Làm gì | Được | Mất |
|---|---|---|---|
| **(A)** | Gộp cả bốn, **bỏ vòi thụ động 3/giây**, Hồn Thép chỉ rơi từ **giết** | một pool thật, có lựa chọn thật; bỏ một cái vòi AFK vốn chọi với châm ngôn *"người chơi phải tự cầm chuột"* | **là một đợt cân bằng**, phải chơi thử |
| **(B)** | Gộp cả bốn, giữ vòi thụ động, nâng giá nuôi Cổ Vật lên đúng ~500× | không đụng cân bằng cày | con số giá Cổ Vật thành khổng lồ và vô nghĩa; vòi AFK vẫn còn |
| **(C)** | Chỉ gộp **Đất Hồn + Nguyệt + Tinh**, giữ Bản Năng riêng | an toàn nhất, 0 rủi ro cân bằng | trục nhân vật vẫn hai pool — được "một đồng cho Cổ Vật", chưa được "một trục" |

**Tôi nghiêng về (A).** Vòi 3/giây là thứ duy nhất trong game trả công cho việc **không chơi**,
và nó đã đủ để nuôi trọn 4 chiêu lên 120 bằng **153 giờ treo máy, không giết một con quái nào**
(đo: 4 chiêu × 414.000 Bản Năng ÷ 10.800/giờ). Bỏ nó đi thì (A) không còn rủi ro lạm phát nào,
và phần thưởng nghỉ ngoại tuyến vẫn giữ được vì `grantOfflineGains` trả **một cục có trần 8 giờ**
— khác hẳn một cái vòi chảy mãi.

Nhưng (A) **là đổi cân bằng**, và CLAUDE.md ghi rõ đừng trộn cân bằng vào một đợt đổi tên
(*"⚠ ĐỢT NÀY KHÔNG ĐỔI CÂN BẰNG, CỐ Ý"* ở đợt Cổ Vật). Nếu chọn (A) thì làm **hai commit tách
hẳn**: một commit gộp một-đổi-một, một commit bỏ vòi.

## §4 — Bức tranh sau cùng: 13 ô → 5 nhánh

| Nhánh | Gồm | Trả lời câu gì |
|---|---|---|
| **Lumen** ◈ | `silver` | tiền tiêu vặt, tiêu đâu cũng được |
| **Ngọc** | ◎ Chúc Phúc · ◉ Linh Hồn · ❤ Sinh Mệnh · ❖ Hỗn Nguyên | **toàn bộ** trục trang bị |
| **Hồn Thép** *(mới)* | gộp Bản Năng · Đất Hồn · Nguyệt Trần · Tinh Trần | **toàn bộ** trục nhân vật |
| **Ấn** ✦ | Giao Kết · Cổ Xưa | vé quay |
| **Shard** ♦ | `shard` | tiện nghi (túi · kho) |

**Chết hẳn:** Tu La · Hỗn Độn *(gộp)* · Thiên Mệnh Phù · Mảnh Trang Bị · Đá Ấn Trụ ·
Đất Hồn *(gộp)* · Bản Năng *(gộp)* · Nguyệt Trần · Tinh Trần — **chín ô đếm**.

Và ký hiệu hết đụng nhau mà không phải đặt lại cái nào: ◆ chết theo Tu La, ❖ chỉ còn Hỗn Nguyên
(Mảnh đã đi), ◈ chỉ còn Lumen (Đất Hồn đã đi).

## §5 — Cái giá, và thứ tự làm

Đếm chỗ nhắc tới trong `game.js`: `gems.tuLa` 15 · `gems.honNguyen` 18 · `jewels.honDon` 5 ·
`mats.manh` 11 · `mats.tichMa` 9 · `mats.datHon` 7 · `player.khi` 15 · `nguyet` 6 · `tinh` 4.

| Đợt | Việc | Rủi ro |
|---|---|---|
| **1** | Gỡ `Rèn Thường` · xoá Tu La · gộp Hỗn Độn→Hỗn Nguyên 1:1 · Phù thành giá Lumen | thấp — đều một-đổi-một |
| **2** | Kế Thừa *(gỡ, hoặc đổi sang ăn ngọc — §2)* | **vừa** — gỡ tính năng |
| **3** | Dựng Hồn Thép, gộp bốn ô, **một-đổi-một** | thấp |
| **4** | *(chỉ khi chọn (A))* bỏ vòi 3/giây | **cao** — đổi cân bằng, phải chơi thử |

**Ba luật bắt buộc, lấy từ năm đợt gộp trước:**
1. Mỗi lần gộp = **một hằng `GO_*`** + một đường di trú trong `loadGame()` + **`delete` trường
   cũ ngay sau đó**. Thiếu `delete` là mỗi lần tải trang lại cộng thêm một lần nữa.
2. **Đổi chữ người chơi thấy, giữ khoá save.** Hỗn Nguyên giữ khoá `gems.honNguyen`; Hồn Thép
   nên nhận thẳng khoá `khi` (nhiều chỗ đọc nhất trong bốn ô bị gộp).
3. **Gộp thì giữ lại sức ép.** Đá Ấn Trụ là nguồn duy nhất từ Vệ Binh Trụ — nếu Kế Thừa sống
   tiếp thì Vệ Binh Trụ phải rơi thứ thay thế. Nếu Kế Thừa bị gỡ thì không còn sức ép nào để giữ.

**Bài kiểm** `tests/test_tiente.js`: mỗi đồng tiền còn sống phải có **≥1 nguồn và ≥1 chỗ tiêu**
(bài này đỏ ngay hôm nay với Nguyệt/Tinh Trần — đó là chủ ý) · save đời cũ đi qua di trú không
mất sức mua · không ký hiệu nào gánh hai đồng tiền · không có hai đường cùng đưa đồ lên +9.

## §6 — Hai chỗ cần gật

1. **Kế Thừa: gỡ hẳn, hay đổi sang ăn ngọc?** *(tôi nghiêng: gỡ — nó là Tấn Phẩm lần hai)*
2. **Hồn Thép đi đường (A), (B) hay (C)?** *(tôi nghiêng: (A), làm hai commit tách hẳn)*

*(Tên "Hồn Thép" đổi lúc nào cũng được, không chặn gì — cứ chốt hai câu trên là làm được đợt 1.)*
