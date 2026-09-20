# QA — BOT CHƠI TỪ ĐẦU · BÁO CÁO NGHIỆM THU

> Sinh bằng năm lượt chạy Playwright trên Chromium thật (`qa3`…`qa8` trong scratchpad),
> **chỉ dùng chuột và bàn phím thật** — không gọi hàm nội bộ để đi đường tắt, trừ ba chỗ
> ghi rõ là "dựng cảnh" (đặt cấp, hạ trần máu để chết, tắt AUTO).
> Khung nhìn 1440×900 · máy chủ tĩnh `public/game` cổng 8853 · nhánh `main` @ `8110b02`.
>
> ⚠ Mọi con số dưới đây **đo được**. Chỗ nào là phán đoán thì viết rõ là phán đoán.

---

## ⓿ ĐIỂM TỔNG: **7,1 / 10**

| Mảng | Điểm | Một câu |
|---|--:|---|
| Khởi động & tạo nhân vật | **9,0** | 537 ms tới `__gameReady`, 8,1 giây từ mở trang tới đứng trong thế giới |
| Cảm giác chiến đấu | **8,5** | kill đầu tiên ở giây **4,1**, nhiệm vụ đầu xong ở giây **6,9** |
| Chỉ đường / user flow | **6,5** | băng-rôn "Đi ngay" tuyệt vời, nhưng nó **tự ẩn đúng lúc cần nhất** |
| Hướng dẫn tân thủ | **4,5** | bước 2 sai sự thật, bước 3–4 tự trôi qua bằng đồng hồ chứ không bằng hành động |
| Đọc được trên màn (readability) | **5,0** | quái đọc ra **y hệt đá và bụi**; nhật ký cắt cụt mọi dòng |
| Bảng & giao diện | **8,5** | bảng Bản Đồ rất tốt · ~~bảng Nhân Vật cụt đáy~~ **ĐO LẠI: SAI, xem §6** |
| Nhịp cấp & nội dung | **5,5** | hố **16 cấp** giữa Werebear Woods (20) và Plant Tribe Glade (36) |
| Rủi ro / sức căng | **3,0** | chết **không mất gì**; mục tiêu ngày xong trong **2 phút** |
| Trục Axie (Axie Core) | **8,0** | hai trục hiện rõ trên bảng Nhân Vật — nhưng map đầu tiên cho phán quyết **0%** |
| Ổn định kỹ thuật | **9,5** | **0 lỗi JS** qua 5 lượt / ~20 phút chơi; chỉ 2 lỗi 404 của API chưa dựng |

---

## ❶ LỖI ĐÁNG SỬA — xếp theo mức đau

### 🔴 P1 · Quái đọc ra y hệt địa hình

Ở Rẻo Rừng Corran, `Axie Heo Rừng` là một khối nâu-đỏ tròn trên nền cỏ xanh + đất nâu. Đứng
cạnh nó là **đá cuội** (khối xám tròn) và **bụi cây** (khối xanh tròn) cùng cỡ. Trên ảnh chụp
1440×900 — đúng độ phân giải chơi thật — thứ **duy nhất** phân biệt được con quái với hòn đá
là **thanh máu đỏ** nổi bên trên, và thanh đó chỉ hiện khi con quái đã bị đánh.

⇒ Người chơi không "thấy bầy quái", họ thấy **một cái sân đầy chấm nâu**, rồi bấm SPACE và để
máy chọn hộ. Đó là lý do trận đánh đọc ra thụ động dù cơ chế phía dưới rất tốt.

*Hướng chữa (đề xuất, chưa làm):* viền rìa sáng cho mọi thực thể có máu, hoặc đổi tông quái ra
khỏi dải màu của decor — cùng bài học đã ghi trong `CLAUDE.md` mục "ART TỐI: ĐỘ SÁNG TRUNG BÌNH
KHÔNG DỰ ĐOÁN ĐƯỢC đọc ra hay không". Đừng chữa bằng cách phóng to sprite (mục Trụ Đá).

### 🔴 P1 · Nhật Ký Chiến Đấu cắt cụt **mọi** dòng

Khối `#combat-log` ở nửa phải quá hẹp so với nội dung. Đo trên ảnh chụp: **10/10 dòng** bị cắt,
và phần bị cắt luôn là **phần thưởng**:

```
Hạ Axie Heo Rừng — Nhận…          ← mất "+28 EXP +162◈"
bị khắc -170 → Axie Heo R…
KHẮC HỆ -126 → Axie He…
```

Dòng nhật ký tồn tại để nói *ngươi vừa được gì*. Cắt đúng chỗ đó thì nó chỉ còn là tiếng ồn.

Kèm theo: log bị **ngập** bởi dòng `phản 1 → Axie Heo Rừng` và `-7 ← Axie Heo Rừng` lặp lại —
đo được 9/10 dòng cuối là hai mẫu đó, nuốt mất mọi thông báo đáng đọc.

### 🔴 P1 · Hướng dẫn tân thủ bước 2 **nói sai sự thật**

> *"Đến gần **Trưởng Lão Rell** giữa thành và nhấn **E** để trò chuyện, **nhận nhiệm vụ đầu tiên**"*

Ba chỗ sai, đo được:

| | thực tế đo được |
|---|---|
| "nhận nhiệm vụ đầu tiên" | nhiệm vụ `c0q1` đã ở trạng thái `active` **từ giây thứ 0** |
| người giao | `ah_gac_tay` — **Lính Gác Cổng Tây**, không phải Rell |
| điều kiện qua bước | `player.level >= 3` — **không liên quan gì** tới việc nói chuyện với Rell |

Và bước 3 bảo bấm "Đi ngay" — nút đó **dịch chuyển thẳng ra khỏi thành**. Ai làm theo đúng thứ
tự thì rời Ardhaven trước khi kịp gặp Rell, rồi bước 2 chỉ còn cách qua bằng lên cấp.

### 🔴 P1 · Ba bước hướng dẫn cuối **trôi qua bằng ĐỒNG HỒ**, không bằng hành động

`TUT_TRAN = 90` giây là trần cho mọi bước. Đo được: bot đứng yên trong thành, **không hề rời
Ardhaven**, mà hộp hướng dẫn vẫn trôi từ bước 3 → 4 → 5 → tắt hẳn sau ~3 phút.

Hậu quả nhìn thấy được: bot nhận bước 4 — *"Nhấn SPACE — nhân vật tự chạy tới con quái gần nhất"* —
trong lúc đang đứng ở **Ardhaven, nơi có đúng 0 bãi quái**. Bấm SPACE **90 lần trong 67 giây**:
0 phản hồi, 0 chữ, 0 tiếng. Rồi bật AUTO thêm **3 phút**: `kills 0 · xp 0 · bạc 0 · toạ độ không
đổi một pixel`. Game không nói một câu nào giải thích vì sao.

*(Trần thời gian có lý do chính đáng — chú thích tại chỗ ghi rõ bước cuối từng "treo tới cấp
120". Vấn đề là trần đó **đẩy người chơi sang một chỉ dẫn bất khả thi** thay vì giữ họ ở bước
đang dở.)*

### 🟠 P2 · Băng-rôn "Đi ngay" **tự ẩn đúng lúc cần nhất**

Đây là CTA to nhất màn hình và nó chạy hoàn hảo: bấm một cái, **3,0 giây** sau đứng ở Corran.

Nhưng khi nhiệm vụ chuyển sang `done` (phải quay về Ardhaven trả), đo được:

| nút | trạng thái |
|---|---|
| `Đi ngay` (băng-rôn giữa màn, to) | **`hien: false`** — ẩn hẳn, và chữ còn lại là chữ CŨ (*"Săn Axie Heo Rừng"*) |
| `🧭 Tới Ngay` (trong bảng Nhật Ký, rộng 87px) | hiện · bấm vào **chạy đúng** → về `ardhaven (3200,1900)` |

⇒ Cơ chế không hỏng. Nhưng chỗ chỉ đường **to** biến mất đúng ở bước mà người chơi mới lần đầu
phải tự tìm đường ngược — và thứ thay nó là một cái nút nhỏ nằm trong một bảng.

### 🟠 P2 · Điểm thả trong thành bị cô lập, và **cổng gần nhất là SÀN ĐẤU PvP**

Nhân vật mới rơi xuống `ardhaven (3200,1900)`. Thành có **29 NPC** và **7 cổng**. Đo khoảng cách:

| thứ tự gần | cổng | cấp cần |
|--:|---|--:|
| 1 | **Sàn Đấu Ardhaven (PvP)** — 623px | 1 |
| 2 | Giếng Vực Sâu (Tầng Sâu) — 710px | 20+ |
| 3 | Cổng Nam → Beast Herd Camp — 1010px | **10** |
| 4 | Cửa Lò Khắc — 1237px | 15+ |
| 5 | Cổng Bắc → Bird Tribe Heights — 1610px | **60** |
| 6 | **Cổng Tây → Rẻo Rừng Corran** — **2736px** | 1 |

Cổng **duy nhất** hợp cấp 1 là cổng **xa nhất**. NPC gần nhất cách 467px. Ai không bấm băng-rôn
mà đi khám phá thì gặp PvP và bốn cửa khoá trước khi gặp bất cứ thứ gì chơi được.

### ~~🟠 P2 · Bảng Nhân Vật cụt đáy, không có thanh cuộn~~ — **SAI, ĐÃ ĐO LẠI**

> Mục này **rút lại**. Tôi kết luận từ một ảnh chụp mà không đo, và ảnh chụp chỉ cho thấy mép
> cắt của vùng cuộn chứ không cho thấy thanh cuộn.
>
> Đo lại bằng `getBoundingClientRect()` trên **bốn bảng × ba khung nhìn**
> (1280×720 · 1440×900 · 1920×1080): **tràn ra ngoài màn = 0 ở cả 12 tổ hợp**, và cả 12 đều
> cuộn được. Không có gì phải sửa.
>
> *Bài học: "nhìn ảnh thấy cụt" là một giả thuyết, không phải một phép đo.*

### 🟡 P3 · Chết **không mất gì**

Đo trực tiếp trước/sau một cái chết thật (để quái đánh, 10 giây):

```
trước chết : cấp 3 · kills 6 · 101◈ · túi 2
sau hồi sinh: cấp 3 · kills 6 · 101◈ · túi 2 · hp đầy · cùng map, lệch 253px
```

Không mất EXP, không mất bạc, không hao bền, không phải chạy về xác. Màn "Trọng Thương!" viết
đẹp và nút "Hồi Sinh" rõ ràng — nhưng nó chỉ là một nút *tiếp tục*. Trong một game tribute MU,
đây là chỗ sức căng đáng lẽ phải nằm.

### 🟡 P3 · Mục Tiêu Hôm Nay xong trong **2 phút**

`⚔ Hạ 10 Chimera` — đo được: bật AUTO ở cấp 1, tới phút thứ 2 bảng đã in
*"✓ Đã nhận thưởng — quay lại ngày mai!"*. Toàn bộ tầng nội dung NGÀY của một người chơi mới
đóng lại sau 120 giây.

### 🟡 P3 · Hố nhịp cấp **16 cấp** ở giữa game

Thang map đo từ `MAPS[].min`:

| vùng | mở ở cấp | gánh bao nhiêu cấp |
|---|--:|--:|
| Rẻo Rừng Corran | 1 | 9 |
| Beast Herd Camp | 10 | 10 |
| **Werebear Woods** | **20** | **16** ← |
| Plant Tribe Glade | 36 | 4 |
| Bug Tribe Tunnels / Lối Mòn | 40 | 14 |
| Aquatic Tribe Causeway | 54 | 6 |
| **Bird Tribe Heights** | **60** | **20** |
| **Reptile Sunstone Flats** | **80** | **20** |
| **Dusk Marsh** | **100** | **20** |

Ba vùng cuối mỗi vùng gánh **20 cấp** — tức 1/6 hành trình mỗi map. Chính tuyến có 6 nhiệm vụ
trên `chungnam` (cấp 24 → 35) để lấp hố 20→36, nhưng vẫn là **một** bãi đất cho 16 cấp.

Đối chiếu cụ thể: ở cấp 20, thanh EXP đọc **849 / 21.759**, mà con quái Corran cho ~28 EXP.
Cày 4 phút AUTO ở đó — **143 mạng** — lên được **0 cấp**. Không có tín hiệu nào trên màn bảo
người chơi rằng họ đang cày sai chỗ.

### 🟡 P3 · Đồ thị thế giới trên bảng Bản Đồ đọc ra **rời rạc**

Bảng Bản Đồ là điểm sáng của cả giao diện (4.158 ký tự, có lore, có dải cấp, có `🧭 Đi bộ`, có
nút Dịch Chuyển). Nhưng trên hình 11 nút vùng chỉ có **3 đường nối** được vẽ; tám vùng còn lại
trôi rời nhau trên nền biển. Chú thích bên dưới thì hứa *"Đường nối là lối ĐI BỘ thật giữa hai
vùng"* — nên người đọc kết luận là **không đi bộ tới đó được**, trong khi chuỗi lối rìa
(`ngoai → comoc → mongco → nhanmon`) có tồn tại.

---

## ❷ THỨ CHẠY TỐT — nói ra cho cân

| | đo được |
|---|---|
| **Vòng nhiệm vụ đầu tiên** | nhận sẵn lúc 0s → bấm "Đi ngay" (3,0s) → đủ 6 con heo ở giây **6,9** với **12 lần bấm SPACE** → `🧭 Tới Ngay` đưa về đúng chỗ trả |
| **Kill đầu tiên** | giây **4,1**, sau 6 lần bấm SPACE |
| **Màn tải** | 21 tệp / 1,63 MB · `__gameReady` ở **537 ms** · thanh cân theo byte thật |
| **Đi bộ + cổng** | 2.750px trong **13,4 giây** / 14 cú chuột phải; prompt `G — Cổng Tây` hiện trên canvas; bấm G qua map trong 2s |
| **Chết & hồi sinh** | lớp phủ `Trọng Thương!` chặn đúng, một nút `Hồi Sinh` rõ ràng, hồi sinh sau 2,5s |
| **Bảng Bản Đồ** | dải cấp từng vùng · ổ khoá kèm lý do (`🔒 Cần đạt cấp 36`) · lore từng vùng · lối đi bộ suy từ `GATES` |
| **Hai trục Axie** | bảng Nhân Vật in thẳng `Hệ đòn đánh (vũ khí) ♣ Plant` · `Hệ phòng thủ (Axie) ✹ Beast` · `Cấu tạo Axie (sáu bộ phận) Thuần 5/6` |
| **Ổn định** | **0 lỗi JS** qua 5 lượt chạy, ~20 phút chơi liên tục, kể cả 4 phút AUTO ở cấp 20 |
| **Nhịp cấp đoạn đầu** | cấp 1 → **7** trong 3,5 phút (104 mạng) — đúng cảm giác MU đoạn mở đầu |

---

## ❸ VỀ TRỤC AXIE (35% barem Vibeathon) — một cảnh báo

Cơ chế **chạy đúng** và **hiện ra rõ**. Nhưng đo tại chỗ người chơi mới đứng:

```
heThu(player)            → Beast
axieTaiDay(CHIMERA[0])   → { he:'Dawn', ket:0, mul:0.998, pct:0,
                             txt:'trung tính với đất ☼ Dawn' }
```

⇒ Ở **map đầu tiên mà mọi người chơi đều đi qua**, con Axie mặc định của Dark Knight cho phán
quyết **trung tính, 0%**. Người chơi mới nhìn thấy cơ chế được nêu tên nhưng **chưa bao giờ
thấy nó làm gì**. Nhiệm vụ `c1q4` (*Thân Nào Cho Đất Nào*) mở ở **cấp 19** — tức cửa dạy nằm
sau khoảng một giờ chơi.

Đây không phải lỗi; nó là **thứ tự trình bày**. Nếu ban giám khảo chơi 10 phút đầu rồi chấm,
họ sẽ không gặp trục đó hoạt động lần nào.

---

## ❹ BA CÁI BẪY CỦA CHÍNH BỘ QA — ghi lại để lượt sau khỏi mất công

1. **`nearNpc` là `let` CỤC BỘ trong hàm vẽ**, không phải biến toàn cục. Hỏi `window.nearNpc`
   ra `null` ở mọi khoảng cách ⇒ lượt 3 suýt kết luận *"NPC không nhận diện được người chơi"*.
2. **`offsetParent === null` KHÔNG có nghĩa là bảng đang ẩn.** Các bảng dùng `position: fixed`,
   mà phần tử fixed thì `offsetParent` luôn null ⇒ lượt 4 báo *"mo: false"* cho cả 9 bảng trong
   lúc chúng hiện đầy đủ trên ảnh chụp. Phải hỏi `getComputedStyle().display` + `getBoundingClientRect()`.
3. **Ép `classList.add('hidden')` lên bảng làm lệch trạng thái của `togglePanel`.** Lượt 4 tự
   tay tắt bảng rồi bấm nút mở ⇒ nút TẮT thay vì mở, và mọi phép đo sau đó vô nghĩa.
4. **Ô nhập tên là `#inp-char-name`, không phải `#cc-name`** (`.cc-name` là cái div bọc). Gõ vào
   selector sai thì ô giữ nguyên **tên ngẫu nhiên điền sẵn** (`genCharName()`), và nhân vật ra
   đời tên "Glimmerwood Wynn" — suýt báo thành lỗi "không đặt được tên".

*Luật chung: mọi khẳng định "cơ chế X không chạy" phải được dựng lại bằng đúng cái cửa mà game
dùng, trước khi viết vào báo cáo.*

---

## ❺ ĐỀ XUẤT THỨ TỰ SỬA

| # | Việc | Vì sao trước |
|--:|---|---|
| 1 | Cho quái một tín hiệu thị giác tách khỏi decor | Nó hỏng thứ người chơi làm **nhiều nhất** |
| 2 | Nới `#combat-log` hoặc rút gọn dòng; gộp/bỏ bớt dòng `phản 1` | Phần thưởng đang bị cắt mất |
| 3 | Viết lại bước 2 hướng dẫn cho đúng NPC + đúng điều kiện | Câu chỉ dẫn sai tệ hơn không có câu nào |
| 4 | Bước hướng dẫn hết giờ thì **dừng lại**, đừng nhảy sang bước bất khả thi ở map hiện tại | 3 phút im lặng hoàn toàn cho người chơi mới |
| 5 | Giữ băng-rôn hiện ở trạng thái `done`, đổi chữ thành "Về trả nhiệm vụ" | Một dòng, đóng hẳn vòng nhiệm vụ đầu |
| 6 | Bảng Nhân Vật cho cuộn / nén bớt khoảng trống trên chân dung | Nội dung đang bị mất |
| 7 | Dời điểm thả lại gần Cổng Tây, hoặc khoá cổng PvP tới cấp N | Cổng đầu tiên gặp không nên là PvP |
| 8 | Một tín hiệu "map này hết XP cho ngươi rồi" | Hố 16 cấp + 143 mạng không lên cấp |
| 9 | Cho cái chết một cái giá | Hiện tại không có rủi ro ở bất cứ đâu |
| 10 | Đưa một phán quyết Axie **khác 0** vào 10 phút đầu | 35% barem đang vô hình ở đoạn mở đầu |

---

## ❻ HAI CHỖ BÁO CÁO NÀY NÓI SAI — đã đo lại ở `0ab8a08`

Ghi ra thay vì sửa lặng, để đừng ai đọc bản cũ rồi đi sửa một thứ không hỏng.

| chỗ | bản đầu nói | đo lại |
|---|---|---|
| bảng Nhân Vật | *"cụt đáy, không cuộn được"* | **SAI.** 4 bảng × 3 khung nhìn: tràn ngoài màn **0/12**, cuộn được **12/12** |
| `test_chaos` | *"đỏ do nhiễm trạng thái — Đổi Hệ chạy đúng khi cô lập"* | **nửa sau đúng, nửa đầu SAI.** Chạy riêng vẫn **đỏ 3/3**, tức đỏ tất định. Cơ chế thì đúng là chạy (lái thẳng: Beast → Mech); chỗ hỏng nằm ở `reset()` của bài kiểm, nó không nhả cờ `_loBan` |

Kiểm toàn diện trên bản mới nhất: **`docs/KIEM_TOAN_HIEN_TRANG.md`**.
