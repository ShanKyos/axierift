# Axie Rift — game này là gì, chơi thế nào, và con Axie đóng vai trò gì

> **Tài liệu này viết cho NGƯỜI MỚI ĐỌC LẦN ĐẦU.** Không cần biết gì về dự án, không cần đọc mã.
> Mọi con số trong đây **đo bằng máy trên bản đang chạy** (2026-09-16), không chép từ trí nhớ —
> chỗ nào là ước lượng hay là ý kiến thì có nói ra.
>
> | muốn gì | đọc đâu |
> |---|---|
> | **chơi thử ngay** | http://14.225.204.107/?test=1&lang=en |
> | bản tiếng Anh cho giám khảo | [`README.md`](../README.md) |
> | đặc tả Axie Core (tiếng Anh) | [`docs/AXIE_CORE.md`](AXIE_CORE.md) |
> | luật thi công cho người sửa mã | [`CLAUDE.md`](../CLAUDE.md) |
> | bảng dữ liệu sáu bộ phận | [`docs/BANG_BOPHAN.md`](BANG_BOPHAN.md) |

---

## 1. Một đoạn: đây là game gì

**Axie Rift là một game nhập vai hành động chạy thẳng trong trình duyệt**, lấy nhịp chơi của
**MU Online** (cày quái, rèn đồ lên +N, reset nhân vật) đặt vào **thế giới Lunacia của Axie
Infinity**.

Người chơi điều khiển **một nhân vật thuộc một trong năm lớp** đi qua **12 vùng đất**, đánh
**48 loài quái** từ cấp 1 tới cấp 120, nhặt và rèn trang bị, đi theo **một chuỗi truyện 50
nhiệm vụ**, và — đây là chỗ riêng của game này — **đeo một con Axie làm thân nhìn thấy được**.

Không cài đặt, không đăng ký, **không ví, không token, không có gì onchain**. Toàn bộ tiến
trình lưu trong `localStorage` của chính trình duyệt người chơi.

| | |
|---|---|
| Thể loại | Nhập vai hành động, nhìn từ trên xuống, chơi bằng chuột |
| Nền tảng | Trình duyệt trên máy tính (canvas 2D + JavaScript thuần, **không có bước build**) |
| Ngôn ngữ | Tiếng Việt mặc định · tiếng Anh qua `?lang=en` |
| Cấp tối đa | **120** |
| Thời lượng đo được | ~**3 giờ** tới cấp 60 nếu làm hết nhiệm vụ · 3,6 giờ nếu bỏ hết |
| Nhiều người | Có — **thấy nhau chạy, thấy nhau ra đòn, chat hai kênh** (giai đoạn 1) |

---

## 2. Bối cảnh — vì sao một hiệp sĩ phương Tây lại đứng giữa Lunacia

Đây là câu hỏi khó nhất của một game tribute MU đặt trong thế giới Axie, và cốt truyện **trả
lời nó bằng chính cơ chế đã có trong game** chứ không né.

**Rune** là nghề của Bug Axie: khắc lên **đá**. Một phiến Rune dựng ở một nơi thì **giữ một cái
luật** ở nơi đó — *Rune Giữ Đàn* làm đàn thú không tan khi hoảng, *Rune Giữ Lửa* làm lò không
nguội qua đêm. Giáo lý của họ là **Nếp Khắc Vừa**: khắc vừa đúng cái phiến đá gánh nổi, và đừng
bao giờ khắc một cái luật phải giữ mãi mãi.

**Bảy Rune Cổ** cắm khắp Lunacia, mỗi vùng một phiến. Chimera áp biên không phá nổi Rune nhưng
**mài** nó; bảy trăm năm thì đá mỏng, mà người biết khắc sâu thì hết. Nên **Sylas** làm đúng cái
việc giáo lý cấm: khắc một Rune **lên trời** để xin một người thợ biết làm Rune bền hơn đá.

Nhát cắt đó là **NHÁT GỌI**. Thứ đi qua nó là nguyên một khu phố của **Vaeldra** — đá lát, lò
rèn, và bảy người lính. Người chơi là một trong bảy người đó.

⇒ Canon này giải thích **bốn** thứ vốn khập khiễng:

| Thứ cần giải thích | Truyện nói |
|---|---|
| Vì sao nhân vật là Dark Knight / Dark Wizard giữa thế giới Axie | **Lunacia GỌI ngươi tới** — không phải ngươi sang xâm chiếm |
| Vì sao thành khởi đầu là phố đá phương Tây có lò rèn | **cái lò CHÍNH LÀ thứ Lunacia cầu**; thành là câu trả lời, không phải đống đổ nát |
| Vì sao mất ký ức rồi võ nghệ trở lại theo cấp | Rune đòi trả bằng thứ nó dịch chuyển; **nghề khắc sâu hơn ký ức** nên nghề quay lại |
| Vì sao đập trang bị lên **+N** lại quan trọng | **Vaeldra khắc Rune vào THÉP** — mỗi lần rèn là một lần khắc |

**Bi kịch trung tâm:** thu Rune về lò thì Rune bền thêm nghìn năm, **nhưng trong lúc phiến đá
nằm trong lò, cái luật nó giữ thì TRỐNG**. Phiến thứ bảy — *Rune Giữ Đường* — là thứ thắp đường
cho hồn quay về Cây Hồn. Danh hiệu người chơi nhận được ở cuối: **Kẻ Gỡ Rune Cuối**.

**Kẻ thù: DRUE — người thứ bảy.** Hắn qua Nhát Gọi cùng ngươi và **giữ được ký ức, vì hắn trả
bằng ký ức của người khác**. Hắn không khắc vào đá, không khắc vào thép: hắn khắc vào chính mình.

> ⚠ **Chimera KHÔNG bị đổi định nghĩa.** Lore Axie chính thức nói chimera sinh ra từ dạng tha hoá
> của thần **Atia** và là kẻ thù của Lunacia. Dự án này giữ nguyên điều đó — đó là lý do hệ bạn
> đồng hành cũ đã phải đổi tên đi chỗ khác. Việc của DRUE chỉ là làm bảy cái luật hỏng **nhanh
> hơn** Chimera làm.

---

## 3. Chơi như thế nào

### 3.1 Vòng chơi, năm bước

1. **Ra khỏi thành, tìm một bãi quái đúng cấp.** Mỗi vùng chia thành nhiều *miền dân số*; càng
   đi xa điểm thả, quái càng cao cấp.
2. **Đánh.** Chuột phải để đi, `Space` đánh thường, `1`–`4` là bốn ô chiêu. Chiêu **ngắm theo
   con trỏ chuột**, không tự chọn mục tiêu.
3. **Nhặt.** Đồ rơi **nằm dưới đất** có tên và màu theo phẩm; `J` để nhặt. Có nút bật tự nhặt /
   tự bán / tự mặc.
4. **Về thành mà rèn.** Bỏ đồ + ngọc vào **Lò Hỗn Độn** để đập lên `+1 … +11`, ép ngọc, ghép
   cánh, hợp nhất ba món.
5. **Lặp lại ở vùng cao hơn**, hoặc làm nhiệm vụ, hoặc đi làm việc mỗi ngày (mục 7).

### 3.2 Điều khiển

| phím | việc |
|---|---|
| **Chuột phải** | đi tới đó — bấm trên bản đồ nhỏ cũng được |
| **Space** | đánh thường |
| **1 2 3 4** | bốn ô chiêu (tự gán bằng kéo–thả từ cây kỹ năng) |
| **R / T** | Bình Thuốc Đỏ / Bình Mana |
| **Z** | bật/tắt TỰ ĐÁNH |
| **J** | nhặt đồ → mở Rương Canh → khai Vỉa Cốt → hái thảo dược (theo thứ tự đó) |
| **E** | nói chuyện với NPC đứng gần |
| **C V B K M Q** | Nhân Vật · Trang Bị · Túi Đồ · Kỹ Năng · Bản Đồ · Nhật Ký |
| **N · O · F6 · Esc** | Ngân Hàng Ngọc · Cài Đặt · Menu Hệ Thống · Đóng |

### 3.3 Năm phút đầu

Nhân vật mới hiện ra trong **Sapidae Chiefdom** — khu phố Ardhaven đã đi qua Nhát Gọi. Đi ra
**Cổng Tây** là tới **Rẻo Rừng Corran** (cấp 1–12), đánh con quái đầu tiên, bấm `Q` xem chuỗi
nhiệm vụ muốn gì tiếp.

> ⚠ **Nhớ đi đúng cổng.** Bốn cổng thành dẫn ra bốn vùng cấp **1 · 10 · 20 · 60**, và không có
> gì chặn người chơi đi nhầm. Cổng Tây là cổng dành cho nhân vật mới.

---

## 4. Năm lớp nhân vật

Chọn **một lần** lúc tạo nhân vật, khoá vĩnh viễn. Lớp là nơi chứa **toàn bộ** chỉ số, trang bị,
kỹ năng và tiến triển.

| Lớp | Kiểu đánh | Tầm | Chữ ký |
|---|---|---|---|
| **Dark Knight** | cận chiến, chịu đòn | ngắn | giáp tấm, vai giáp to, chém vòng |
| **Sylvan Ranger** | bắn xa | **380** | đuôi tóc, tai nhọn, đa mũi tên |
| **Dark Wizard** | phép diện rộng | **420** | mũ chóp, áo choàng, **Meteorite** rơi từ trên xuống |
| **Spellblade** | nửa cận nửa phép | trung | **vai lệch** — một bên giáp, một bên trần |
| **Dark Lord** | chỉ huy, chống chịu | trung | vương miện năm chấu, áo choàng |

Mỗi lớp có **9 chiêu riêng** (trong tổng 49 mục võ học: 30 chủ động · 19 bị động) cộng **7 bị
động chỉ số dùng chung** cho cả năm lớp. Cây kỹ năng có **16 ô**: chín ô cây nhánh cho chiêu
lớp, bảy ô chuỗi thẳng cho xương sống bị động.

**Thanh chiêu chỉ có 4 ô, và người chơi tự gán** bằng kéo–thả. Đó là chỗ có lựa chọn thật:

- ô 1 **bắt buộc là chiêu chủ động** — cắm bị động vào đó là đứng không nút nào bấm;
- bị động dạng *hiệu ứng* **chỉ chạy khi nằm trên thanh**, tức nó tranh ô với chiêu bấm được;
- **chiêu lên thanh thì mất phần "%Công Kích vĩnh viễn"** mà nó cho khi nằm ngoài. Một chiêu
  không được vừa bấm được vừa cộng chỉ số — đó là luật cứng.

> **Tại sao chỉ 4 ô:** để bắt người chơi phải BỎ một thứ. Một thanh 10 ô thì không ai phải chọn.

---

## 5. ⭐ Con Axie đóng vai trò gì — phần quan trọng nhất

Đây là chỗ dự án này khác một game MU thường, và là chỗ đã phải làm đi làm lại nhiều lần.

### 5.1 Luật gốc, chủ dự án chốt

> *"Chỉ số tới từ 5 class. Axie chỉ đơn thuần là avatar thôi, khi tấn công thì ví dụ Dark Wizard
> sẽ xuất hiện và tung chiêu."*

| | |
|---|---|
| **Axie** | thân **NHÌN THẤY**. 0 chỉ số, 0 kỹ năng, 0 trang bị. Là ô để cắm NFT về sau. |
| **5 lớp** | nơi chứa **toàn bộ** chỉ số, trang bị, kỹ năng, tiến triển |
| **Lúc đánh** | lớp nhân vật **vật chất hoá kế bên Axie**, tung chiêu, rồi tan. Axie không biến mất — nhân vật đi theo bảo kê. |

Hai hình đứng cạnh nhau trên màn là **MỘT** người chơi, không phải hai.

Có **16 con Axie** (6 con 5★ · 10 con 4★), trải đủ **9 lớp Axie chính chủ**. Mỗi lớp nhân vật
được phát **một con miễn phí** ngay từ đầu; 15 con còn lại quay từ **Khế Ước** (gacha).

### 5.2 Nhưng "avatar" mà thôi thì nó chỉ là một cái skin — và đó là điều đã ĐO ĐƯỢC

Thể lệ Vibeathon chấm **Axie Core 35%** với một câu: *"a meaningful interpretation of the theme
that **affects the game** … rather than appear only as a cosmetic skin"*.

Đo trước khi sửa: **lái cả 16 con Axie qua công thức chỉ số ở cấp 60 ⇒ 0 con làm đổi một điểm
nào**, tắt hẳn avatar cũng đổi 0. Con Axie đúng nghĩa đen là một cái skin.

⇒ Dự án dựng **hai trục**, và **cả hai đều KHÔNG cộng chỉ số**.

### 5.3 Trục một — lớp Axie quyết định **hệ PHÒNG THỦ**

Chín lớp Axie xếp thành **tam giác ba nhóm**, đúng vòng khắc chính chủ của Axie:

```
  ① Beast · Bug · Mech   ▶   ② Plant · Reptile · Dusk   ▶   ③ Aquatic · Bird · Dawn   ▶   ①
```

Và game đọc nó theo **hai chiều, hai nguồn khác nhau** — đây là cả thiết kế:

| chiều | hệ lấy từ đâu | hệ số |
|---|---|---|
| **người → quái** | **VŨ KHÍ** đang cầm | ×1,20 khi khắc / ×0,88 khi bị khắc |
| **quái → người** | **CON AXIE** đang đeo | ×1,12 khi bị khắc / ×0,90 khi khắc lại |

> Đổi vũ khí **không bao giờ** làm ngươi ăn đòn nặng hơn. Hai nguồn cho hai chiều thì đọc ra
> được; ba nguồn là ba thứ phải nhớ.

**Và mỗi vùng đất mang lớp của tộc mang tên nó** — Plant Tribe Glade là đất Plant, Dusk Marsh là
đất Dusk (thuần 100%). Nên con Axie đang đeo **có nghĩa khác nhau ở những nơi khác nhau**, và
"chọn Axie theo nơi sắp đi cày" trở thành một quyết định thật.

Đo được sau khi làm: chênh giữa con hợp nhất và con tệ nhất là **24,4% ở cả 10 vùng**. Thử ngược
(gỡ riêng phần gán lớp cho vùng) thì tụt về **2,1%–13,6%** — tức hai nửa phải đi cùng nhau.

### 5.4 Trục hai — **sáu bộ phận** quyết định con Axie SẮC tới đâu

Một con Axie luôn dựng từ **đúng sáu bộ phận**: **Mắt · Tai · Sừng · Miệng · Lưng · Đuôi**. Cả
16 con nay khai đủ sáu, và dữ liệu **suy từ chính câu mô tả đã có** chứ không bịa cạnh nó:

- `coghound` — *"ai đó lắp nó lại từ mảnh vỡ"* — có **0/6** bộ phận thuộc lớp của chính mình;
- `inkmane` — *"vằn đen trên lưng nó đổi chỗ mỗi lần bạn quay đi"* — có đúng **1/6**, và đó là
  cái **Lưng**.

Đếm mấy bộ phận cùng nhóm tam giác với lớp của nó ⇒ **độ thuần** 0..6 ⇒ **độ sắc** 0,45 … 1,50:

| | nghĩa là |
|---|---|
| **thuần 6/6** | **chuyên gia** — rất nhẹ đòn ở vùng hợp, rất nặng ở vùng khắc |
| **tạp 0/6** | **thợ đụng** — không bao giờ tệ, không bao giờ xuất sắc |

### 5.5 ⚠ Và đây là bất biến chứng minh nó KHÔNG bán sức mạnh

Ba hệ số được nội suy về chính **trung bình** của chúng:

```
mul(sắc) = TRUNG_BÌNH + (hệ_số_gốc − TRUNG_BÌNH) × sắc
```

Tổng ba nhánh vì thế **không đổi theo độ sắc** — đạo hàm đúng bằng 0. Trên phân bố đều chín lớp
quái, **kỳ vọng hệ số phòng thủ của cả 16 con bằng nhau CHÍNH XÁC**: đo ra lệch `2,2e-16`, tức
đúng nhiễu dấu phẩy động, không phải một dung sai tự đặt.

**Đổi Axie đổi HÌNH DẠNG rủi ro. Nó không đổi được TỔNG.**

Nhưng hình dạng thì rất lớn — đo trên đàn quái thật của 11 vùng:

| | chênh giữa vùng dễ thở nhất và ngặt nhất |
|---|--:|
| `ironshell` · `hexmite` — thuần 6/6 | **39,0%** |
| trung bình nhóm thuần | 36,3% |
| trung bình nhóm tạp | 16,5% |
| `coghound` — tạp 0/6 | **10,3%** |

**Độ thuần cố ý KHÔNG đi theo số sao** — một trong hai con thuần nhất là **4★**. Nếu 5★ nào cũng
thuần hơn thì người chơi đọc ra *"5★ mạnh hơn"*, mà đó đúng là thứ gacha không được bán.

### 5.6 Lằn ranh: trục sức mạnh từ phía Axie đã bị THÁO BA LẦN

Ghi ra để thấy đây không phải một lời hứa suông:

| đời | thứ đã tháo |
|---|---|
| 1 | bị động cộng chỉ số theo Huyết Thống của con thú |
| 2 | cấp của con thú × hệ số + bốn kỹ năng đồng hành |
| 3 | bốn ô "Cốt" mang tên bộ phận Axie — 4 dòng chính + 8 dòng phụ + 11 hiệu ứng đủ bộ |

Lần nào nó cũng quay lại dưới dạng *"chỉ vài dòng chỉ số nhỏ thôi"*. Nay có **bài kiểm gác cả
hai chiều**: đổi qua cả 16 con phải đổi **0 điểm** chỉ số, *và* kỳ vọng phải bằng nhau.

### 5.7 Người chơi NHÌN THẤY cơ chế này ở đâu

Một cơ chế vô hình là một cơ chế không tồn tại. **Bảy cửa**, mỗi cửa trả lời một câu khác nhau —
và câu quan trọng nhất là câu cuối bảng:

| cửa | trả lời | bắn khi nào |
|---|---|---|
| số bay trên đầu nhân vật | *đang xảy ra gì* | mỗi đòn trúng, **cả hai vế**, hồi 2,6 giây |
| băng-rôn lúc vào map | *nên cầm con nào TỚI đây* + **chỗ đổi (phím C)** | lúc đặt chân |
| bảng Bản Đồ | *vùng này là đất hệ gì* | bất cứ lúc nào |
| bảng Nhân Vật — hai dòng hệ | *mình đang mang hệ gì* | bất cứ lúc nào |
| bảng Nhân Vật — `Cấu tạo Axie` | *con đang đeo thuần hay tạp* | bất cứ lúc nào |
| danh sách Khế Ước | *sáu bộ phận của từng con* | cấp 6+ |
| **phán quyết TẠI CHỖ trong Khế Ước** | ***nên cắm con nào BÂY GIỜ*** | cấp 6+ |

Cửa cuối là thứ mới nhất và là thứ đắt giá nhất. Bảng Khế Ước trước đây giải thích cơ chế rất kỹ
nhưng **không biết người chơi đang đứng ở đâu**, nên nó bắt người đọc tự làm phép so sánh trong
đầu. Nay mỗi con hiện thẳng kết quả *tại vùng đang đứng* — `✦ chịu đòn nhẹ hơn −13% ở đất ✹ Beast`
· `trung tính` · `⚠ ăn đòn nặng hơn +16%` — và con số đổi theo cả **lớp** lẫn **cấu tạo** của
chính con đó. Đây là cùng lối mà hệ trang bị đã học một lần rồi: so với thứ đang có, đừng chỉ in
thông số tuyệt đối.

Và một nhiệm vụ chính — **`c1q4` Thân Nào Cho Đất Nào**, cấp 19, ngay sau nhiệm vụ mở Khế Ước —
bắt người chơi mở bảng đó ra mà tự cắm lấy một cái thân. Nhiệm vụ mở cửa; cái bảng mới là thứ dạy.
Nó **cố ý không** đòi "phải đeo con khắc lại đất này": thân là thứ bốc từ gacha, mà chính tuyến là
chuỗi thẳng — một ô không qua được là cả game dừng.

> **Chỗ này từng hỏng nặng, và ghi lại để không tái diễn:** vế phòng thủ chạy suốt dự án mà chỉ
> có **một** cửa hiện ra — một dòng trong hộp nhật ký nhỏ ở góc — và dòng đó **chỉ in ở nhánh
> bất lợi**. Nửa CÓ LỢI, tức nửa trả lời cho *"vì sao phải có nhiều hơn một con Axie"*, **chưa
> từng hiện ra một lần nào**. Trong khi chiều tấn công (do vũ khí quyết định, không phải Axie)
> thì có hẳn số bay với bốn tiền tố riêng.

> **Và một lỗi cùng họ, phát hiện sau đó:** chỗ giải thích bằng LỜI duy nhất trong cả game — trang
> dẫn truyện, thứ người chơi đọc đầu tiên — vẫn dạy mô hình đã chết (*"mỗi lớp mang một hệ nguyên
> tố"*). Sai cả hai nửa: hệ đòn đánh lấy từ **vũ khí**, hệ phòng thủ lấy từ **cái thân**. Nó sống
> sót qua hai đợt cải tổ vì **không bài kiểm nào đọc văn xuôi**. Nay `tests/test_daythan.js §6` đọc.

---

## 6. Thế giới — 12 vùng đất

| vùng | tên | cấp | lớp Axie của đất | khổ | bãi quái |
|---|---|--:|---|---|--:|
| `ardhaven` | **Sapidae Chiefdom** (thành khởi đầu) | 1 | — | 6400×3200 | 0 |
| `corran` | Rẻo Rừng Corran | 1 | Dawn | 5200×3800 | 18 |
| `ngoai` | Beast Herd Camp | 10 | Beast | 4400×3300 | 16 |
| `chungnam` | Werebear Woods | 20 | Beast | 4600×3400 | 18 |
| `daohoa` | Plant Tribe Glade | 36 | Plant | 4600×3400 | 18 |
| `loimon` | Lối Mòn Corran | 40 | **trộn, cố ý** | 6400×1400 | 6 |
| `comoc` | Bug Tribe Tunnels | 40 | Bug | 4800×3600 | 18 |
| `trungnut` | Trũng Nứt Corran | 44 | Mech | 4200×3200 | 9 |
| `caungam` | Aquatic Tribe Causeway | 54 | Aquatic | 2803×2808 | 9 |
| `tuyettinh` | Bird Tribe Heights | 60 | Bird | 4800×3600 | 18 |
| `mongco` | Reptile Sunstone Flats | 80 | Reptile | 5000×3700 | 18 |
| `nhanmon` | Dusk Marsh | 100 | Dusk | 5200×3800 | 21 |

Cộng thêm **Tầng Sâu** — một phó bản nhiều tầng.

**Lối Mòn Corran cố ý TRỘN hệ**, và đó là thứ đáng giữ chứ không phải lỗi: nó là chỗ duy nhất
không con Axie nào hợp hơn con nào. Một lối mòn không phải một nơi chốn.

Trong mỗi vùng:

- **Miền dân số** — quái không rải bằng toạ độ chép tay mà bằng *dải khoảng cách × cung góc*
  quanh điểm thả, nên cấp quái tăng đơn điệu theo khoảng cách đi ra.
- **Vai trò gán theo BÃI, không theo loài** — cùng một loài, bãi này là Xạ Thủ bãi kia là Pháp
  Sư. Ba loài × sáu vai = 18 hồ sơ chiến đấu mà không tốn một tệp art nào.
- **Bãi Farm** — một chỗ mỗi map được phép: trại sát nhau, rơi đồ và tiền ×1,6, có tên riêng
  trên bảng Bản Đồ, và có **đồ trại** (đống lửa, lều, thùng) để nhận ra bằng **mắt** trước khi
  nhận ra bằng bảng.
- **Đàn thú hoang** — 17 loài, **không đánh được, không rơi gì, không có máu**. Chúng gặm cỏ, đi
  vài bước, và **bỏ chạy lây nhau thành sóng** khi người chơi tới gần. Giá trị của chúng nằm
  đúng ở chỗ chúng vô dụng: đó là bằng chứng duy nhất rằng thế giới có sống trước khi người chơi
  tới.
- **Trùm**: **11 Tướng Quân Trấn Ải** (mỗi vùng đúng một con) + 3 Vệ Binh Rune + DRUE.

**48 loài quái**, cấp 1 → 120. **39 NPC** có thoại.

---

## 7. Nhịp lặp — ba tầng khác nhau, cố ý không giống nhau

| tầng | thứ gì | vì sao tách ra |
|---|---|---|
| **MỘT LẦN trong đời** | **Rương Canh** — 4 hòm mỗi vùng, mỗi hòm một trại canh 4 con 4 vai; giết trại thì hòm mở. Vị trí bốc từ **tên map** nên **không bao giờ đổi chỗ**. | Đi qua một lần là nhớ. Cái nhớ đó biến một tấm bản đồ thành một **nơi chốn**. |
| **MỖI NGÀY** | **Vỉa Cốt** — 3 trong 7 vùng, mỗi vùng một điểm, hạt bốc từ chuỗi ngày. Qua nửa đêm là ba nơi hoàn toàn khác. Cách bãi quái ≥320px nên **TỰ ĐÁNH không nhặt hộ được**. | Đây là thứ **duy nhất** trong game buộc phải đi tới một **toạ độ**. |
| **THEO GIỜ THẬT** | **Hung Thần** (0/4/8/12/16/20h) · **Xâm Lăng Vàng** (2/6/10/14/18/22h) · **Chúa Tể Vực Nứt** (0/6/12/18h) | Cứ 2 giờ thật có một sự kiện. Đến trễ là lỡ chuyến — đúng nhịp MU. |

Cộng thêm **5 mục tiêu mỗi ngày** chia theo 7 dải cấp, và **Truy Nã Lệnh**.

> ⚠ Mốc giờ neo theo **UTC**, không theo giờ máy người chơi — nếu không thì hai người ở hai múi
> giờ *đồng ý map nào bị đánh mà không đồng ý lúc nào*. Hiển thị thì vẫn là giờ địa phương.

---

## 8. Tiến triển — người chơi mạnh lên bằng gì

### 8.1 Cấp và điểm

Cấp **1 → 120**. Mỗi cấp cho **5 điểm tiềm năng**, và điểm đó có **hai chỗ tiêu giành nhau**:
năm chỉ số cơ bản, hoặc **rót vào chiêu** (trần 5 điểm/chiêu, +3% sát thương mỗi điểm).

### 8.2 Kỹ năng

Cấp chiêu **1 → 120**, mua bằng **Lumen + Bản Năng** (thứ farm ra được) — khác hẳn điểm tiềm
năng (thứ chỉ lên cấp mới có). Hai trục nhân dồn với nhau.

Ở mốc **40 / 80 / 120** mỗi chiêu chọn một nhánh **Tiến Hoá**: *Bá Đạo* (+sát thương) · *Tốc
Chiến* (−hồi chiêu) · **Lan Toả** (+45% bán kính, −22% sát thương — đổi hẳn chiêu từ dồn một
mục tiêu sang quét cả bầy).

### 8.3 Đại Thành

Mở ở cấp 120 sau khi xong chính tuyến. **16 bảng · 144 nút**, mỗi bảng là một **cây hai nhánh**
theo khuôn `2·2·2·1·2`, và **hai nút đỉnh LOẠI TRỪ NHAU**. Bảng chứa 720 ô điểm; một vòng Tái
Sinh kiếm ~139 — tức khan hiếm là một nửa của thiết kế.

### 8.4 Trang bị

**11 ô mặc** · **266 món** trong bảng dữ liệu · **35 bộ giáp** (5 lớp × dải bậc) · **3 bậc cánh**.

**Rèn `+0 → +11`**, đúng mốc MU: **+7 là ngưỡng phát sáng**. Mỗi mốc thêm một **hiện tượng
KHÁC**, không phải chỉ chói hơn:

| mức | hiện tượng |
|---|---|
| +0…+3 | trơ |
| +4…+6 | viền sáng quanh vai và mũ |
| +7…+9 | hào quang nóng sau lưng + tàn lửa bay lên |
| +10, +11 | thêm dải sáng quét dọc thân |

Và bậc đọc bằng **SẮC**, không bằng độ chói: +7 vàng → +9 lam băng → +10 tím → +11 cam rực.

Tỉ lệ rèn, và cái giá khi hỏng:

| lên mức | tỉ lệ | hỏng thì |
|---|--:|---|
| ≤ +6 | 100% | không bao giờ hỏng |
| +7 | 75% | **tụt 1 cấp** |
| +8 / +9 | 65% / 50% | **về +0** |
| **+10** | **50%** | **VỠ VỤN** — mất vĩnh viễn |
| **+11** | **45%** | **VỠ VỤN** |

(Thiên Mệnh Phù giữ được món khi hỏng. **Không có +12** — trần là +11.)

**Trang bị phải NHÌN THẤY ĐƯỢC.** Đo trước khi làm: bộ đồ cuối game +11 chỉ khác nhân vật mới
tạo **718/62.400 điểm ảnh (1,15%)**, và toàn bộ 718 px đó là một đốm sáng cạnh bàn tay — thân
người đổi **0 px**. Sau khi làm: **19.104 px (54,3%)**, và đường viền thân phình đều theo bậc.

### 8.5 Lò Hỗn Độn

Một **cỗ máy**, không phải bảy khối chữ: bỏ đồ + ngọc vào **khay** → máy liệt kê công thức khay
đó thoả → chọn → **KẾT HỢP**. **11 công thức**: rèn thường · Phá Thiên Kiếp (+10/+11) · bốn loại
ngọc · kế thừa giai · ba bậc cánh · hợp nhất ba món.

Máy có **con yêu tinh tung quả cầu liên tục** ngay trong khung, và người chơi nhìn nó rồi tự
chọn lúc bấm. **Canh nhịp là mê tín, và đó là chủ ý** — kết quả bốc sau khi nhịp nín thở chạy
xong, không dòng nào đọc bộ đếm nhịp. Người chơi sẽ tự nghĩ ra luật canh nhịp của riêng họ; ở
game gốc cũng vậy, và chính cái đó là thứ đáng giữ.

---

## 9. Chuỗi nhiệm vụ

**51 nhiệm vụ chính / 9 chương**, cấp 1 → 120. Mỗi chương = **một Rune Cổ**, và đóng lại bằng
việc hạ **Tướng Quân Trấn Ải** của chính vùng đó.

| loại | số | | loại | số |
|---|--:|---|---|--:|
| `kill` đánh quái | 15 | | `moc` chạm vào một hệ thống | 8 |
| `tranai` hạ Trấn Ải | 7 | | `enhance` rèn đồ | 7 |
| `talk` nói chuyện | 5 | | `tpkill` | 3 |
| `boss` | 2 | | `collect` | 2 |

**32 nhiệm vụ phụ / 10 map**, cấp 3 → 116, mỗi map ba mục do NPC của chính vùng đó giao.

Ba luật của chuỗi, **đo được bằng máy**:

1. khoảng cách hai nhiệm vụ liền nhau **≤ 4 cấp**;
2. cấp quái lệch cấp nhiệm vụ **≤ ±4**;
3. **≤ 60%** toàn chuỗi là đi đánh, và **≤ 70%** mỗi chương.

> ⚠ Luật thứ ba từng viết là *"không quá 60% là `kill`"* — đếm đúng chữ `kill` ra 41% và luật
> PASS, trong khi chuỗi thật **70%** là đi đánh (`tpkill`, `boss`, `tranai` cũng là đi giết).
> **Một luật đếm hẹp hơn ý định của nó thì tệ hơn không có luật: nó xanh và nó bảo đảm sai.**
> Đã sửa; số đo nay là **54% · cao nhất 67%**.

Loại `moc` là thứ kéo tỉ lệ đánh xuống mà không phải thêm một nhiệm vụ "đập đồ lên +N" thứ tám:
nó bảo người chơi **chạm vào một hệ thống** (quay Khế Ước 1 lần · khai 1 Vỉa · mở 2 Rương · mở 1
Box Kundun · nâng 3 cấp chiêu). Mỗi cửa cơ chế mà chuỗi hứa thì phải có một nhiệm vụ THẬT gác.

---

## 10. Ba loại tiền — và không có gì onchain

| tên | ký hiệu | kiếm ở đâu | tiêu ở đâu |
|---|---|---|---|
| **Lumen** | ◈ | rơi từ quái, bán đồ, nhiệm vụ | tiệm · rèn · nâng kỹ năng · Lò Hỗn Độn |
| **Ấn Giao Kết** | ✦ | trùm vùng lần đầu · điểm danh · phó bản | quay **Khế Ước** (ra **thân Axie**) |
| **Shard** | ♦ | **KHÔNG rơi từ quái** — chỉ mốc mỗi ngày và thông quan | vé quay · nới túi · nới kho |

**Shard không được cộng chỉ số.** Chỗ tiêu duy nhất chạm tới sức mạnh là đổi vé quay, và nó đi
vòng qua gacha chứ không mua thẳng.

> **Không ví, không token, không onchain — và đó là làm ĐÚNG LUẬT, không phải thiếu sót.** Thể lệ
> nói thẳng *"Keep bAXS, wallet, and onchain mechanics out unless organizers separately approve"*
> và *"Basic play cannot require a wallet or platform account"*.
>
> Chỗ cắm NFT về sau đã sẵn: `player.avatar` là **một chuỗi id**, và `avatarId()` là **cửa đọc
> duy nhất**. Ngày nào được duyệt thì việc phải làm là đúng một hàm — và hôm nay nó **cố ý không
> tồn tại**.

---

## 11. Chơi cùng nhau

Đã chạy thật trên máy chủ production, không phải chỉ trong bài kiểm.

**Làm được:** hai người mở hai trình duyệt, cùng một map, **nhìn thấy nhau chạy** (có tên, thanh
máu, xếp lớp đúng theo chiều sâu), **thấy nhau ra đòn**, và **chat hai kênh** — Thế Giới và Vùng.

**Cố ý CHƯA làm:** không tài khoản, không cơ sở dữ liệu, không quyền quyết định phía máy chủ,
không chống gian lận, không PvP, không đồng bộ quái. Đây là giai đoạn **nhỏ nhất chứng minh được
cả hướng đi**; mọi thứ có giá trị lâu dài (sinh vật phẩm, cộng tiền tệ, máu boss chung) phải đợi
tới lúc có tài khoản thật và kho đồ trên máy chủ.

Máy chủ là **hai tệp, 445 dòng, KHÔNG một phụ thuộc nào** — WebSocket tự viết bằng thư viện có
sẵn của Node. Bản đầu dùng thư viện ngoài và cái giá lộ ra khi đưa lên máy chủ thật: **467 MB
`node_modules`** kéo theo chỉ để chạy một relay 170 dòng.

**Mặc định TẮT.** Không khai máy chủ thì phần mạng thoát ngay và bản chơi một mình chạy y nguyên.

---

## 12. Art

| thứ | nguồn |
|---|---|
| Nhân vật, quái, Axie, đàn thú | **bộ kit chính chủ của Axie Infinity** (rig Spine), nướng sẵn ra bảng khung |
| Hiệu ứng chiêu | gói VFX + gói đặt riêng |
| Nền map | **lát viên isometric sinh bằng máy** (Blender chạy dạng mô-đun Python) |
| Màn hình chờ | cảnh Lunacia **tách mười lớp**, có xa gần, mây và sương trôi |

Tổng **79 MB**. Màn chờ có **màn tải cân theo BYTE thật** (21 tệp / 1,63 MB) — không chạy theo
đồng hồ, vì một thanh tải giả là một lời nói dối.

**Ba luật art cứng:**

1. **Không vẽ vector.** Mọi trang bị, vũ khí, giáp, nhân vật, cảnh vật là **tranh thật** nối vào
   game qua một bảng khai. Món chưa có tranh rơi về một **ô chờ art** cố ý vẽ thô, để không ai
   tưởng là art thật rồi để nguyên.
2. **Không dùng chữ Hán/kanji làm hình ảnh**, không dùng thuật ngữ tu tiên, không lấy ngũ hành
   làm hệ thống trung tâm. Đây là tribute **MU Online**, không phải kiếm hiệp — dù tên thư mục
   là di sản lịch sử từ đời game trước.
3. **Không dùng tên riêng của MU Online** trong text người chơi thấy. Có **đúng một ngoại lệ đã
   duyệt**: *"Box Kundun"*, vì chủ dự án chốt rằng người chơi MU quen tên đó.

---

## 13. Kỹ thuật

| | |
|---|---|
| Toàn bộ game | **1 tệp** `public/game/game.js` — 29.952 dòng |
| Dữ liệu cân bằng | `data/canbang.js` — 2.694 dòng |
| Giao diện | `style.css` — 2.549 dòng |
| Máy chủ online | `server/bongnguoi.js` + `server/wsnho.js` — 445 dòng, **0 phụ thuộc** |
| Bước build | **không có** — mở thẳng tệp tĩnh |
| Bài kiểm | **209 bài** Playwright chạy game thật trong Chromium thật |
| Tài liệu | 67 tệp trong `docs/` |
| Triển khai | đẩy lên `main` ⇒ máy chủ tự kéo về trong ≤2 phút |

**Bốn cổng phải xanh trước mỗi lần đẩy:** lint · kiểm kiểu · unit · **toàn bộ 209 bài hồi quy**.

### Cách làm việc, và đây là phần đáng nói nhất

Dự án này chạy theo một luật: **đo trước khi làm, và thử ngược sau khi làm.**

- *Đo trước:* mọi thay đổi lớn mở đầu bằng một phép đo cho thấy vấn đề có thật. Ví dụ đã dẫn ở
  trên: "16 con Axie đổi 0 điểm chỉ số", "bộ đồ cuối game chỉ khác 1,15% điểm ảnh", "3/7 map
  không có một vật cản nào trong lòng".
- *Thử ngược:* mỗi mệnh đề kiểm mới phải được chứng minh là **đỏ được** — dựng lại đúng bản lỗi
  rồi chạy. Một bài kiểm chưa bao giờ đỏ là một bài kiểm chưa biết nó gác cái gì.

Và **mọi cái bẫy đã dẫm đều được ghi lại tại chỗ**, kèm số đo. `CLAUDE.md` dài bất thường chính
vì lý do đó: nó là **sổ vết sẹo**, không phải một bản mô tả.

Ba ví dụ, để thấy loại lỗi mà cách làm này bắt được — cả ba **không ném lỗi, không làm đỏ bài
kiểm nào, và không hiện ra trên màn**:

1. Một bảng toạ độ sinh tự động phải **chép tay** sang tệp mà sản phẩm thật sự nạp. Bước chép bị
   quên một lần ⇒ **sáu map không vẽ một cái cây nào** suốt nhiều phiên. Ảnh chụp vẫn ra một map
   — chỉ là một map trống.
2. Một dòng gán vô điều kiện trong hàm nạp save **nuốt sạch thanh chiêu người chơi tự gán**: gán
   xong nhìn đúng, tải lại trang là về mặc định.
3. Mốc hồi của số bay so với đồng hồ đếm từ lúc **nạp trang**, mà khởi tạo bằng 0 ⇒ **2,6 giây
   đầu của mọi phiên bị câm**. Ai vừa vào game mà ăn đòn ngay thì không thấy gì — và cái
   không-thấy đó đọc ra y hệt *"cơ chế không chạy"*.

---

## 14. Chấm theo barem Vibeathon

> Đây là **tôi tự chấm**, không phải điểm chính thức. Để ở đây cho chủ dự án thấy chỗ nào còn
> mất điểm, chứ bản nộp không tự phát điểm cho mình.

| Tiêu chí | Trọng số | Tự chấm | Thành phần |
|---|--:|--:|--:|
| **Axie Core** | 35% | **33 / 35** | 9,4 |
| **Gameplay** | 25% | **20 / 25** | 5,0 |
| **Product vision** | 20% | **15 / 20** | 3,0 |
| **Feasibility** | 10% | **9 / 10** | 0,9 |
| **Prototype & documentation** | 10% | **9 / 10** | 0,9 |
| | | | **≈ 85 / 100** |

### Axie Core — 33/35

**Mạnh:** con Axie ăn vào lối chơi ở **hai trục**, và cả hai đều là **quan hệ, không phải nấc
thang**. Tam giác chín lớp là vòng khắc chính chủ của Axie, không phải một hệ tự bịa. Sáu bộ phận
là đúng cấu tạo của một con Axie thật. Và có một **bất biến toán học** chứng minh cơ chế không
bán sức mạnh — `2,2e-16`, đo được, có bài kiểm gác, có thử ngược. Vùng đất vốn đã mang tên bảy
tộc, quái vốn đã là Axie, rig lấy từ kit chính chủ.

**Mất 2 điểm ở:** chưa ai ngoài chủ dự án xác nhận rằng **người chơi ĐỌC RA** cơ chế này trong
mười phút đầu. Bốn cửa hiển thị mới ship, chưa có ai ngoài đội thử.

### Gameplay — 20/25

**Mạnh:** vai trò gán theo **bãi** chứ không theo loài là một quyết định thiết kế thật, và nó
trả lời đúng câu *"vì sao phải tự cầm chuột thay vì bật TỰ ĐÁNH"*. Ba nhịp lặp khác nhau (một
lần / mỗi ngày / theo giờ thật) thay vì ba bản sao của cùng một vòng.

**Mất 5 điểm ở:** **chưa ai ngoài chủ dự án chơi thử**. Không có số giữ chân, không có phản hồi.
Và sáu vòng chơi ghép lại thì rất MU — người không biết MU có thể đọc ra là cày.

### Product vision — 15/20

**Mạnh:** có một **lằn ranh phát biểu được** — *Axie không bao giờ cộng chỉ số* — kèm bằng chứng
đã tháo trục sức mạnh **ba lần**. Đó là thứ hiếm trong một hồ sơ hackathon: một chỗ nói "không".

**Mất 5 điểm ở:** tầm nhìn hiện là tầm nhìn **thiết kế**, không phải tầm nhìn **sản phẩm**. Chưa
có câu trả lời cho: ai chơi, vì sao họ ở lại, tiền ở đâu, và nó đứng thế nào cạnh phần còn lại
của hệ sinh thái Axie. **Việc phải làm: `docs/PRODUCT.md`.**

### Feasibility — 9/10

Nó **đã chạy rồi**. Không bước build, không phụ thuộc lúc chạy, máy chủ online hai tệp chỉ cần
`node`. Rủi ro thi công gần như bằng không vì phần thi công đã xong.

**Mất 1 ở:** một tệp 30k dòng, và mọi thứ dựa vào một người. Câu trả lời trung thực cho chỗ đó là
209 bài kiểm chạy game thật + `CLAUDE.md` là bàn giao viết sẵn — nhưng nó vẫn là một rủi ro.

### Prototype & documentation — 9/10

209 bài kiểm chạy game thật trong trình duyệt thật, bốn cổng gác mọi lần đẩy, quyết định nào cũng
ghi kèm số đo. Link chơi thử mặc định tiếng Anh được (`?lang=en`).

**Mất 1 ở:** **chưa có video**, và link là một địa chỉ IP trần qua HTTP.

---

## 15. Đang nợ gì — nói thẳng

| nợ | mức |
|---|---|
| **Chưa có video 2 phút** — mục bắt buộc của vòng 1 | cao, và rẻ |
| **Chưa ai ngoài đội chơi thử** | cao — đây là việc của con người, mã không làm hộ được |
| **`docs/PRODUCT.md` chưa có** | cao — đang mất trọn 5 điểm Product vision |
| Bộ chọn Axie chưa xem trước được thế khắc của vùng sắp đi | vừa |
| Hoạt ảnh Lò Hỗn Độn ở +10/+11 **giống hệt +5**, và mọi lời ăn mừng của hai mốc đó nằm **sau bảng** | vừa — đã đo, chưa sửa |
| `NV_GIAP` mới phủ 3/35 tổ hợp lớp×giai ⇒ phần lớn bộ giáp chưa có tranh riêng | vừa, là nợ ART không phải nợ mã |
| Công cụ đo nhịp cấp **không chạy được từ cấp 60 trở lên** ⇒ mọi con số nhịp cấp trên 60 hiện không đo lại được | vừa — đã xác nhận là lỗi CÓ SẴN, chưa truy ra nguyên nhân |
| Vòng đi/chạy của nhân vật có **51% quãng đường là trượt chân nằm sẵn trong bản vẽ** | thấp — mã không chữa được, phải vẽ lại |
| Chưa có tài khoản, chưa có quyền quyết định phía máy chủ | thấp — cố ý, là giai đoạn sau |

---

## 16. Bản đồ tài liệu

| tệp | nội dung |
|---|---|
| [`README.md`](../README.md) | bản tiếng Anh cho giám khảo — cách chơi, phím, máy hỗ trợ, lỗi đã biết |
| [`docs/AXIE_CORE.md`](AXIE_CORE.md) | đặc tả Axie Core đầy đủ (tiếng Anh), bốn chặng kèm số đo |
| [`docs/BANG_BOPHAN.md`](BANG_BOPHAN.md) | bảng 16 × 6 bộ phận — **sinh bằng máy**, đừng sửa tay |
| [`docs/LORE_RUNE.md`](LORE_RUNE.md) | canon Nhát Gọi đầy đủ + hợp đồng thi công cho nhiệm vụ |
| [`docs/THIET_KE_ONLINE.md`](THIET_KE_ONLINE.md) | thiết kế nhiều người, 7 giai đoạn |
| [`docs/BO_GIAP.md`](BO_GIAP.md) | 25 bộ giáp, 5 lớp × 5 dải |
| [`docs/NHIP_CAP_1_120.md`](NHIP_CAP_1_120.md) | nhịp cấp và Tiến Hoá |
| [`CLAUDE.md`](../CLAUDE.md) | **sổ vết sẹo** — mọi cái bẫy đã dẫm, kèm số đo. Đọc trước khi sửa mã. |

---

*Số liệu đo trên bản `9731c28`, 2026-09-16. Muốn kiểm lại thì các công cụ đo nằm trong `tools/`
và bài kiểm nằm trong `tests/` — không con số nào trong tài liệu này là chép tay.*
