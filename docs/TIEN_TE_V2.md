# Hệ tiền tệ — bản rework theo hướng chủ dự án chốt

> Thay cho `docs/TIEN_TE.md` (bản rà soát + ba câu hỏi). Chủ dự án đã trả lời:
> *"Chỉ muốn giữ lại phần ngọc để có thể up đồ +9. Và sẽ cần ngọc hỗn nguyên để ép cánh và
> đồ +10. Có thể dọn dẹp các nhánh tiền tệ khác, sau đó dựa vào flow hiện tại và tạo ra /
> rework 1 nhánh tiền tệ mới."*
>
> **Vẫn CHƯA thi công.** §5 còn hai chỗ cần gật.

## ✅ ĐỢT 1 ĐÃ LÀM — ép ngọc +1→+9 · Lò +10/+11/+12

Chủ dự án chốt thêm: *"ép ngọc chỉ có thể từ 1-9 bằng ngọc thôi. Còn với lò rèn thì chỉ áp dụng
cho đồ +10 +11 +12."* Đã thi công đúng phạm vi đó.

| Việc | Chi tiết |
|---|---|
| Gỡ `Rèn Thường` | công thức +0→+9 ăn Lumen + Tu La ở Lò — **đường thứ hai lên +9** |
| Vá `useJewel()` | **đường thứ ba**: Linh Hồn lên thẳng +11 ở NPC Thợ Rèn (xem §0.5) |
| Mở trần +12 | Phá Thiên Kiếp nay nhận món +9 · +10 · +11 · tỉ lệ 50 → 45 → **40%** |
| Gỡ Tu La Tinh Thạch | 24 chỗ · `GO_TULA` = 1.800◈ · di trú hoàn ở **túi VÀ Ngăn Ngọc** |

**Chi phí giữ nguyên CHÍNH XÁC** — phần Tu La dồn vào Hỗn Nguyên theo giá tiệm, phần lẻ bù Lumen:

| mốc | cũ | mới | chênh |
|---|---|---|---|
| +10 | 3×1.800 + 1×2.600 + 300 = **8.300◈** | 3×2.600 + 500 = **8.300◈** | **0** |
| +11 | 5×1.800 + 2×2.600 + 450 = **14.650◈** | 5×2.600 + 1.650 = **14.650◈** | **0** |
| +12 | *(mốc mới)* | 9×2.600 + 600 = **24.000◈** | — |

Nhịp giá: +11 đắt gấp 1,77× +10 · +12 gấp 1,64× +11.

### §0.5 — Đường thứ BA, chưa từng báo cáo

`useJewel('linhHon')` ở NPC Thợ Rèn cho Linh Hồn lên **tới +11** với đúng 1 viên, 50%, xịt chỉ
tụt 1 — tức **ăn đứt Phá Thiên Kiếp ở cả hai mốc cuối**: không Hỗn Nguyên, không Hỗn Độn, không
rủi ro vỡ đồ.

CLAUDE.md **đã cảnh báo đúng câu này** từ trước (*"Linh Hồn từng cho tới +11… đừng nới lại trần
đó mà không gỡ Phá Thiên Kiếp đi cùng"*). Lần sửa ấy hạ trần trong `NGOC_EP` — nhưng `useJewel()`
**không đi qua `ngocEpDuoc()`**, nên nó chép cứng `>= 11` và sống sót nguyên vẹn. Nay nó đọc
thẳng `NGOC_EP.linhHon.tran`, và `test_renxit` §3 **chạy cả hai đường** thay vì đọc con số.

### Ba cái bẫy đã dẫm trong chính đợt này

1. **Xoá nhầm `const GO_HUYENTHIET`** — nó nằm ngay trên `forgeRule` trong khối bị thay. Hậu quả:
   `loadGame()` ném ReferenceError và **trả false ⇒ mọi save cũ không mở được**, mà `node --check`
   vẫn xanh vì đó là lỗi lúc chạy. Triệu chứng hiện ra ở tận `test_hoanlai` ("loadGame() trả
   false"), cách xa chỗ hỏng. ⇒ **Thay một khối thì xem khối đó có nuốt hằng nào không.**
2. **`forgeRule` lặng lẽ trả luật +12 cho mọi mốc lạ.** Bản đầu của tôi để `return` cuối hàm làm
   nhánh mặc định, nên `forgeRule(5)` nhận luật +12 (40%, vỡ vụn, 9 Hỗn Nguyên) mà không ai báo —
   tức dựng lại đường thứ hai lên +9 một cách vô tình. Nay nó **ném lỗi**.
3. **Bịa một API không có thật** — viết `window._toast` trong đường di trú, trong khi cả tệp dùng
   `zoneBanner`. `node --check` xanh, và nó chỉ hỏng khi đúng người chơi có Tu La tồn kho tải save.

### Còn nợ trong đợt này

### ⚠ ĐOẠN +6→+9 NAY **DỄ HƠN 35%** — đo được, và ngược với dự đoán

Luật xịt của Lò (*"+8/+9 VỀ +0"*, có ghi "chủ dự án chốt") **đi theo `Rèn Thường`**. Luật duy
nhất còn hiệu lực là luật của ngọc: 50% phẳng, xịt **tụt 1 cấp**.

Tôi đã đoán rằng bỏ đường Lò (75/65/50%) làm +9 khó hơn. **Sai** — mô phỏng 20.000 lượt:

| đường | tỉ lệ · luật xịt | lượt bấm TB (+6→+9) |
|---|---|---|
| CŨ · Lò (đã gỡ) | 75/65/50% · +8/+9 **về 0** | **22,7** |
| NAY · ép ngọc | 50% phẳng · **tụt 1** | **14,8** |
| *nếu port "về 0" sang ngọc* | 50% phẳng · +8/+9 về 0 | *35,9* |

"Tụt 1" nhẹ hơn "về 0" nhiều hơn là 25% tỉ lệ nặng hơn — nên đường còn lại chỉ tốn **0,65×** số
lượt. Ở nhịp rơi ~2 Linh Hồn/giờ: **~7 giờ** cho một món lên +9 (port "về 0" thì ~18 giờ, gấp
2,4×). *Đúng bài học CLAUDE.md nhắc mãi: đo, đừng đoán — tỉ lệ nhìn thì nặng hơn, luật xịt mới là
thứ quyết định.*

⇒ **Cần chủ dự án quyết:** giữ "tụt 1" (dễ hơn 35% so với trước), hay đưa "về 0" sang `NGOC_EP`
cho +8/+9 (khó hơn 2,4× so với bây giờ)? **Sửa đúng một dòng**, và bài kiểm đã có chỗ gác sẵn.
- Hai câu ở §6 vẫn treo: Kế Thừa, và hướng đi của Hồn Thép.

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
