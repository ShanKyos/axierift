# Đất Riêng — khảo sát & đề xuất cho hệ "gia viên"

Trả lời yêu cầu *"xây dựng tính năng gia viên"*. Tài liệu này **chỉ khảo sát và đề xuất**, chưa
sửa một dòng nào trong `public/game/`.

---

## ⚠ 0. Ba điều phải chốt TRƯỚC khi viết dòng mã đầu tiên

### 0.1 · Chữ "gia viên" vi phạm Quy tắc số 1

"Gia viên" là từ vựng MMO Hoa ngữ, cùng họ với cảnh giới / đan điền / môn phái — đúng thứ
CLAUDE.md cấm. Cơ chế thì không sao; **cái tên thì phải đổi**.

Đề xuất, theo canon Vaeldra: dân Ardhaven bị kéo qua vết nứt và dựng lại quanh chỗ rơi. Vậy
một mảnh đất riêng chính là **một suất đất trong đợt dựng lại đó**:

| Gọi là | Vì sao |
|---|---|
| **Phần Đất** | mộc mạc, đúng giọng "người sống sót được chia một suất" |
| **Lò Riêng** | nếu hệ nghiêng về CHẾ TẠO (xem §3) |
| **Trại Tiền Tiêu** | nếu hệ nghiêng về BÀN ĐẠP đi các vùng |

### 0.2 · Đây là hệ DỄ THÀNH BỆNH NHÂN BẢN NHẤT trong mọi hệ từng bàn

Chẩn đoán gốc của dự án: *"game không thiếu nội dung — game có một lượng nội dung nhỏ được chép
ra nhiều lần."* Một khu đất 20 ô trồng, mỗi ô một cây, mỗi cây một nguyên liệu, tất cả cùng một
vòng "chờ rồi bấm" — **đó là một nội dung chép ra hai mươi lần**, chỉ khác cái icon.

Ràng buộc rút ra: **mỗi công trình trong Đất Riêng phải hỏi người chơi một câu KHÁC nhau.**
Hai công trình cùng bảo "chờ rồi bấm" thì một cái là thừa.

### 0.3 · Idle trong một ARPG dễ ăn mất chính ARPG

Nếu mảnh đất cho nhiều hơn một buổi đi đánh, thì lối chơi tối ưu là: đăng nhập → bấm thu hoạch
→ thoát. Game hành động biến thành game bấm nút, và **không ai cố ý chọn điều đó — nó tự xảy ra**
khi con số nghiêng sai.

Ràng buộc rút ra: Đất Riêng **không được là nguồn sức mạnh chính**. Nó khuếch đại thứ người chơi
mang về, chứ không tự sinh ra thứ để mang.

---

## 1. Móng đã có sẵn — nhiều hơn dự kiến

Không phải xây từ đất trống. Khảo sát `game.js` + `data/canbang.js`:

| Có sẵn | Ở đâu | Dùng được vào |
|---|---|---|
| **Nền lát viên isometric** | `sanIso` · `sanIsoDung()` · `veVatIso()` | mặt sàn khu đất |
| **12 tấm viên nền** | `nen_co1-4` · `nen_da1-4` · `nen_dat1-4` · `nen_duong1-4` | bốn chất liệu sân khác nhau, **không tốn art mới** |
| **Decor lát viên** | `cay1-6` · `buicay1-3` · `co1-2` · `da1-3` | cây cảnh, bụi, đá trong sân |
| **Đa giác đi được** | `diTrong` · `trongDaGiac()` · `epVaoDaGiac()` | ranh giới mảnh đất, chặn miễn phí |
| **Công trình có toạ độ** | `vatTo` · `MAP_VAT_SRC` | đặt nhà/lò/kho lên sân |
| **Máy map chạy theo DỮ LIỆU** | `MAPS` | thêm một khoá là có map mới, không sửa máy |
| **Kho đồ** | `player.kho` · `khoCap()` | tủ đồ trong nhà |
| **Mốc ngày** | `dailyReset()` · `player.daily` | nhịp ngày của khu đất |
| **Bốn map an toàn** | `type:'safe'` | khuôn cho một map không có quái |

### ⭐ Và thứ quan trọng nhất: **`grantOfflineGains()` ĐÃ TỒN TẠI**

```js
function grantOfflineGains(savedAt){       // game.js:24868
  const offSec = Math.min(8*3600, …);      // trần 8 giờ
  if (offSec < 600) return;                // dưới 10 phút không tính
  player.khi += khiGain;                   // Bản Năng
  player.silver += bacGain*2;              // Lumen
}
```

Game **đã** trả công cho thời gian vắng mặt. Nhưng nó trả **không có lý do trong truyện và không
có một lựa chọn nào**: đi vắng → quay lại → có tiền, y hệt nhau với mọi người chơi, mọi lúc.

**⇒ Đây chính là chỗ Đất Riêng nên cắm vào.** Không thêm một cái vòi mới — cho cái vòi đã có
một *cái nhà* và một *quyết định*. "Bạn đi vắng 6 tiếng" biến thành "khu đất của bạn làm gì
trong 6 tiếng đó, và nó làm được vì bạn đã dựng cái gì ở đấy."

Đó cũng là khác biệt giữa một hệ **thêm vào** và một hệ **giải thích phần đã có**.

---

## 2. Lỗ hổng mà Đất Riêng lấp được

| Lỗ đã ghi trong CLAUDE.md | Đất Riêng chạm vào thế nào |
|---|---|
| **Cấp 20→120 không mở ra hệ thống nào** | mở ở một mốc trong khoảng đó — đây là ứng viên thật cho cái hố ấy |
| **"Chốt một bãi, không bao giờ rời"** | nếu công trình ăn nguyên liệu **độc quyền theo vùng** thì nó BẮT đi đủ bảy vùng |
| Thiếu chỗ TIÊU tài nguyên | công trình là sink, và sink thì game đang thiếu hơn faucet |
| `grantOfflineGains` vô hồn | có nơi chốn và có lựa chọn |

⚠ **Đất Riêng KHÔNG lấp được** lỗ nhiệm vụ và lỗ tầng phó bản. Đừng kỳ vọng nó gánh hộ.

---

## 3. Bốn vai có thể — chỉ nên chọn MỘT làm trục

Một mảnh đất trong game khác có thể mang bốn vai. Ôm cả bốn là cách chắc chắn nhất để không vai
nào ra hồn.

| Vai | Được gì | Mất gì | Hợp game này? |
|---|---|---|---|
| **A. Nguồn tài nguyên theo giờ** | vòng lặp gây nghiện, lý do quay lại | **nguy cơ nuốt ARPG** (§0.3) | ⚠ chỉ làm phần nhỏ |
| **B. Chỗ TIÊU tài nguyên** | sink thật, đích để cày | không tự vui | ✅ **an toàn nhất** |
| **C. Chỗ khoe / trang trí** | biểu đạt cá nhân | *(xem ghi chú sửa ngay dưới bảng)* | ✅ **hợp lệ** |
| **D. Trạm chức năng** (kho · lò · dịch chuyển) | tiện tay | tiện ích, không phải nội dung | ✅ làm kèm, đừng làm trục |

**Vai C phải nói thẳng:** đã xác nhận ở phiên trước — game **không có mạng, không có người chơi
khác** (không WebSocket, save ở `localStorage`, không một thực thể "người chơi khác" nào trong
mã). Một ngôi nhà đẹp mà không ai ghé thì chỉ còn giá trị với chính chủ. Có thật, nhưng mỏng —
đừng đặt cược cả hệ vào đó.

---

> ⚠ **VAI C ĐÃ ĐƯỢC CHỦ DỰ ÁN SỬA LẠI.** Bản đầu của bảng này chấm vai C là "mỏng" với lý do
> *"game MỘT NGƯỜI — không ai tới xem"*. Chủ dự án bác lại bằng đúng chữ: *"Cứ làm như bình
> thường, game rồi sẽ có mạng để người chơi có thể trang trí."* ⇒ **vai C là mục tiêu hợp lệ**,
> và lý do bác là một sự thật về lộ trình mà khảo sát không có cách nào đo ra từ mã nguồn.
>
> Giữ lại dòng cũ ở đây thay vì xoá trắng, đúng lối mục "Khắc Ấn" trong CLAUDE.md: người sau đọc
> lịch sử git rồi tưởng kết luận cũ còn hiệu lực thì tệ hơn.
>
> Phần tài nguyên cho vai C — **có đủ art để xây không** — trả lời ở `docs/DAT_RIENG_ART.md`.
> Đáp án gọn: kho Axie **không** có món để xây (cả 2,3 GB đúng 2 công trình, đã lấy cả hai),
> nhưng đường của chính game này thì có và đã chạy — `tools/iso/cat_congtrinh.py` cùng 34 món
> đặt được đang dùng ở Ardhaven.

## 4. ĐỀ XUẤT: Đất Riêng là **XƯỞNG**, không phải **NÔNG TRẠI**

> Nông trại hỏi: *"chờ bao lâu rồi?"*
> Xưởng hỏi: *"lần này mày mang cái gì về?"*

Câu thứ hai là câu một ARPG nên hỏi.

### 4.1 · Trục chính: bảy vùng đổ về một chỗ

Game **đã có sẵn** bảy Dòng Cốt, mỗi Dòng độc quyền một vùng — và CLAUDE.md gọi đó là *"cơ chế
chọn build, không phải trang trí"*. Đất Riêng nối vào đúng đó:

| Công trình | Ăn gì | Hỏi người chơi câu gì |
|---|---|---|
| **Lò Nung** | Cốt của **một** Dòng | "nuôi Dòng nào?" — chọn vùng để cày |
| **Bàn Khảm** | ngọc + trang bị | "ép món nào lên trước?" |
| **Giá Phơi** | nguyên liệu vùng | "để qua đêm lấy gì?" ← chỗ cắm `grantOfflineGains` |
| **Tủ Đất** | (không ăn) | nới `player.kho` — tiện ích thuần |

Bốn công trình, **bốn câu hỏi khác nhau**. Đó là bài kiểm chống nhân bản ở §0.2.

### 4.2 · Offline sinh ra cái gì là do bạn đã nạp cái gì

Sửa `grantOfflineGains` thành: thời gian vắng mặt chạy qua **Giá Phơi**, và nó trả ra thứ
tương ứng với nguyên liệu **vùng** đang nạp — chứ không phải Lumen chung chung cho mọi người.

Giữ nguyên trần 8 giờ và sàn 10 phút đã có. **Không nới**: nới trần là bước đầu tiên trên con
đường biến ARPG thành game bấm nút.

### 4.3 · Mảnh đất nằm ở đâu

Hai lối, và lối thứ hai rẻ hơn nhiều:

1. **Map riêng** (`MAPS.datrieng`, `type:'safe'`, `sanIso:true`) — sạch sẽ, nhưng thêm một map.
2. **Một góc của Ardhaven** — thị trấn **đã có 13 khối nhà trống đang chờ art** (ghi ngay trong
   `data/canbang.js`). Lấy một khối làm cửa vào thì **không thêm map nào**, và về lore thì đúng
   hơn: đất của bạn nằm trong khu dân Ardhaven dựng lại, không lơ lửng ngoài hư không.

⇒ Đề xuất **lối 2**.

---

## 5. Việc cần làm, và cái nào bị chặn

| | Việc | Chặn bởi |
|---|---|---|
| ✅ | Map/khu đất + nền lát viên + `diTrong` | không — móng đã có đủ |
| ✅ | Bảng dữ liệu công trình (`CONG_TRINH`) + trạng thái trong save | không |
| ✅ | Nối `grantOfflineGains` vào Giá Phơi | không |
| ✅ | Tủ Đất nới `player.kho` | không |
| ⚠ | **Art công trình** | 4 tấm `ct_*` hiện có đều là nhà thị trấn; Lò Nung/Bàn Khảm/Giá Phơi **chưa có tranh** |
| ⚠ | Cân bằng sản lượng | phải đo, không đoán — xem §0.3 |

**Chỗ chặn thật chỉ có một: ART.** Mọi thứ khác là dữ liệu và mã.

Ba lối gỡ, theo thứ tự nên thử (đúng Quy tắc số 3):
1. **Kho Axie** — `story/8-temple/8_TEMPLE.png`, `13_STATUE` và mấy lớp kiến trúc khác đã cắt
   sẵn alpha. Đợt tảng đá vừa rồi đã chứng minh đường này chạy.
2. **meowa.ai** — phải chủ dự án chạy, sandbox chặn egress.
3. **Ô chờ art** — dựng cơ chế trước, cắm tranh sau. Hệ chạy được ngay, nhìn thô có nhãn.

---

## 6. Bốn câu hỏi chủ dự án phải trả lời

Em **không tự quyết** bốn cái này, vì mỗi cái đổi hẳn hình dạng hệ:

1. **Tên gọi** — Phần Đất · Lò Riêng · Trại Tiền Tiêu, hay tên khác?
2. **Trục** — XƯỞNG (đề xuất của em) hay NÔNG TRẠI (idle thuần)?
3. **Chỗ đứng** — map riêng, hay một khối trong Ardhaven (đề xuất của em)?
4. **Mốc mở** — cấp bao nhiêu? Em nghiêng về **quãng 40–60**: đủ muộn để người chơi đã hiểu
   game, và rơi đúng vào hố "cấp 20→120 không mở ra gì".

Chốt xong bốn câu đó thì em dựng đặc tả chi tiết rồi mới code — đúng nhịp đã làm với Cổ Vật.
