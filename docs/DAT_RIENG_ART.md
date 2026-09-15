# Đất riêng — có ĐỦ ART ĐỂ XÂY KHÔNG?

> Trả lời cho đúng một câu hỏi của chủ dự án: *"Hãy khảo sát thử github axie xem nếu có 1 land
> riêng thì người chơi có xây dựng được không"*. Phần thiết kế vòng lặp nằm ở `docs/DAT_RIENG.md`;
> đây là phần **tài nguyên**.
>
> Bối cảnh đã chốt: *"game rồi sẽ có mạng để người chơi có thể trang trí"* ⇒ vai trò **khoe
> ra** là mục tiêu hợp lệ. Mục §3 của `DAT_RIENG.md` viết vai trò đó mỏng vì game đang một
> mình — **điều đó không còn đúng**, và mục này thay cho nó.

## Đáp án ngắn

| | |
|---|---|
| Kho Axie có món để xây không? | **KHÔNG.** Cả 2,3 GB có đúng **2** công trình nhân tạo, và cả hai đã lấy rồi. |
| Vậy xây được không? | **ĐƯỢC** — bằng đường của chính game này, đã chạy thật và đã ra 4 công trình. |

Đây không phải hai câu trả lời chọi nhau. Kho Axie là kho **sinh vật và hiệu ứng**, không phải
kho **cảnh vật**; hỏi nó xin cái nhà cũng như hỏi nó xin cái mũ giáp — đã hỏi rồi, đã không có.

## §1 — Đã quét những gì, và đo ra sao

Quét toàn kho (`/home/user/axieinfinity/axie-origins-asset-kit`, 2,3 GB, `git fetch` xác nhận
không có commit mới). Lọc ra ảnh có **hình dạng VẬT THỂ RỜI**: trong suốt ≥15% (tức đã cắt
alpha, không phải một lớp phủ kín khung), cạnh ≥150 px, tỉ lệ ≤2,6 (trên mức đó là DẢI viền
mép sân khấu — đúng cái bẫy `7_ROCK`/`8_ROCK` đã ghi ở CLAUDE.md).

Kết quả, bỏ trùng `layers/`: **113 ứng viên**, và khi soi từng cái thì chúng rơi vào bốn rổ:

| Rổ | Số | Xây được không |
|---|---|---|
| Sinh vật (Starters · Chimeras · Summoners) | ~70 | không — đó là quái, không phải nhà |
| Mây · sương · nước · vệt sáng | ~20 | không — lớp khí quyển của một sân khấu cố định |
| Khung viền lễ hội (`xmas24_fg1/2`, `halloween24_fg`, …) | 12 | **không** — xem §2 |
| Cây · đá · đền · tượng (đã lấy hết từ đợt trước) | **10** | có, và **đã nằm trong game** |

Rồi quét **tên tệp** cả kho theo 30 từ khoá kiến trúc/nội thất (`house · hut · tent · wall ·
fence · door · roof · furniture · chair · table · bed · lamp · torch · barrel · crate · chest ·
bridge · tower · farm · field · plot · garden · statue · temple · pillar · shrine · altar ·
well · sign`). Toàn bộ số trúng:

```
PvE/Backgrounds/story/8-temple/8_TEMPLE.png     ← đã lấy
PvE/Backgrounds/events/arena/layers/13_STATUE.png ← đã lấy
PvE/Backgrounds/class/bg_shop.png               ← KHÔNG phải cửa hàng (xem dưới)
… 30 tệp còn lại là flag_victory / AttackMelee / buff_wall_gecko — icon HUD, không phải cảnh vật
```

⇒ **Hai** công trình nhân tạo trong cả kho, cả hai đã nằm trong lớp `vatTo` từ đợt trước.

⚠ `bg_shop.png` (3840×2160) **không phải cửa hàng**, dù tên nói vậy. Chụp ra xem: một bãi đá
đỏ hoàng hôn, 0% trong suốt, không có một mái nhà nào. Đây đúng cái bẫy CLAUDE.md đã ghi ở mục
hình vật phẩm: *"Ba lỗi hình chỉ lộ khi CHỤP RA XEM, không lỗi nào lộ khi đọc code."* Đọc tên
tệp rồi ghi vào bảng "đã có cửa hàng" là một dòng nói dối không ai kiểm được.

## §2 — Vì sao lớp lễ hội KHÔNG dùng được (đây là chỗ dễ tưởng bở nhất)

`xmas24_fg1.png` trong suốt **81,5%** — cao nhất cả kho. Nghe như một cây thông cắt sẵn. Chụp
ra thì là **hộp quà và quả châu nằm ở GÓC màn hình**, vẽ cho đúng một khung 1080p: mờ theo
chiều sâu ống kính, cắt cụt ở mép ảnh, không có mặt sau. `halloween24_fg` y hệt — hai cột gỗ
và hai quả bí ở hai góc dưới.

Chúng là **khung viền sân khấu**, không phải vật thể. Đặt xuống đất trong một thế giới đi lại
được thì nó cắt cụt, mờ sai chỗ, và chỉ đúng ở duy nhất một góc nhìn.

*Cùng một bài học đã trả giá ba lần rồi và CLAUDE.md đã ghi hẳn thành luật:* trụ đá phóng to
sprite — gỡ; lớp phủ tối ngoài tầm nhìn — gỡ; lát nền từ `*_Ground.png` — hỏng cả ba lần.
**Đừng chữa vấn đề cảnh vật bằng cách kéo một tấm vẽ-cho-việc-khác vào.**

## §3 — Thứ ĐÃ CÓ để xây, và nó không đến từ kho Axie

Đường xây nhà của game này đã chạy thật rồi, chỉ là chưa ai gọi nó là "xây nhà":

| Có sẵn | Ở đâu | Số món |
|---|---|---|
| Viên nền hình thoi 256×128 | `assets/iso/nen_{co,da,dat,duong}1-4` | **16** |
| Vệt đất phủ lên nền | `assets/iso/vet_dat1-2` | 2 |
| Cây · bụi · đá · cỏ | `assets/iso/{cay1-6,buicay1-3,da1-3,co1-2}` | **14** |
| **Công trình** | `assets/iso/ct_{cong,loren,duoc,vukhi}.png` | **4** |
| Máy vẽ nền | `sanIso` · `sanIsoDung()` · `ISO_W/ISO_H` (game.js ~1712) | chạy trên 6 map |
| Máy vẽ công trình | `vatTo` · `MAP_VAT_SRC` · `veVatIso()` | chạy ở Ardhaven |
| Máy chặn đường | `diTrong` (đa giác sàn) · `decorObs` | chạy |

**34 món đặt được, và một cỗ máy đã đặt chúng.**

Quan trọng hơn cả 34 món: **công cụ sinh thêm**. `tools/iso/cat_congtrinh.py` nhận một tấm
công trình isometric do AI vẽ và trả về sprite dùng được — tách nền theo **sắc tím** (không
theo độ sáng), dọn đốm lẻ theo cỡ, bỏ bệ hồng kèm viền bệ và chữ ghi kích thước, **ép về đúng
phép chiếu 2:1**, rồi thu theo **số ô chân đế** chứ không theo khổ ảnh. Bốn công trình Ardhaven
đi ra từ đó.

⇒ Câu hỏi "người chơi có xây được không" **không phải câu hỏi về kho Axie**. Nó là câu hỏi
"đặt thêm bao nhiêu tấm nữa", và giá mỗi tấm đã biết vì đã làm bốn lần.

## §4 — Đề nghị: bộ khởi điểm 18 món

Một vòng lặp xây-và-trang-trí đọc được cần **đủ nhóm để người chơi tự kể một câu chuyện**, không
cần nhiều món. 18 tấm mới, xếp thành ba nhóm — cùng đường `cat_congtrinh.py`, không thêm máy móc:

| Nhóm | Món | Vì sao nhóm này |
|---|---|---|
| **Lõi** (4) | nhà chính 3 bậc + bàn thợ | thứ nâng cấp được ⇒ có tiến trình để nhìn |
| **Chức năng** (6) | lò · bể tôi thép · giá giáp · kho · vườn thảo dược · bệ Vỉa Cốt | mỗi cái NỐI VÀO một hệ đang chạy, không đẻ hệ mới |
| **Trang trí** (8) | hàng rào · cổng nhỏ · cột cờ · đèn · thùng · bia đá · lối lát · cây cảnh | phần khoe ra — thứ không cộng chỉ số |

⚠ **Chỉ nhóm Trang Trí mới được đặt tự do.** Nhóm Lõi và Chức Năng gắn vào ô cố định. Lý do là
cái bệnh CLAUDE.md chẩn đoán ở mục "NỘI DUNG ĐANG ĐƯỢC LÀM BẰNG CÁCH NHÂN BẢN": đặt tự do mọi
thứ nghe như tự do hơn, nhưng nó biến một khu đất có bố cục thành một bãi để đồ — mà bố cục mới
là thứ người khác nhìn vào và đọc ra được.

⚠ **Nhóm Trang Trí tuyệt đối không cộng chỉ số.** Cùng luật đã áp cho Shard (*"Shard không được
cộng chỉ số"*). Trang trí có cộng chỉ số thì nó thôi là trang trí — nó thành một bảng chỉ số bắt
người chơi kê cho tối ưu, và phần khoe ra chết ngay lúc đó.

## §5 — Còn treo, chủ dự án quyết

1. **Đặt 18 tấm hay ít hơn?** Giá: 18 lượt gen + cắt. Làm 6 tấm nhóm Lõi trước để nhìn thử được.
2. **Tên.** "Gia viên" vi phạm Quy tắc số 1 (kiếm hiệp). Đề xuất: **Phong Ấp** · **Trại Rèn** ·
   **Đất Phong**.
3. **Ba quyết định cũ vẫn treo** ở `DAT_RIENG.md` §6: trục (Xưởng vs Nông trại), chỗ đứng (map
   riêng vs một trong 13 khối trống Ardhaven), mốc mở (~40-60).

## §6 — Giới hạn của lần khảo sát này

- Quét trên **bản clone tại chỗ** của `axie-origins-asset-kit`. Proxy của phiên chặn liệt kê
  toàn org GitHub (`403 — sessions are bound to their configured repositories`), nên **không**
  tự rà lại 54 repo lần này. Kết luận của đợt rà trước vẫn đứng và đã ghi ở CLAUDE.md:
  *"không còn kho nào khác có art dùng được — phần còn lại là blockchain/hạ tầng, hoặc
  runtime/starter 3D"*. Nếu muốn chắc chắn tuyệt đối thì phải rà lại, không suy ra từ đây.
- Giấy phép kho Axie giới hạn dùng trong Axie Vibeathon và chương trình được Sky Mavis duyệt.
  Điều đó **không đổi** theo kết luận trên — nhưng vì kho không có món để xây, nó cũng không
  thành chỗ nghẽn cho tính năng này.
