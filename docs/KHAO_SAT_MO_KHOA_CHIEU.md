# Khảo sát: hệ MỞ KHOÁ kỹ năng — cái đã có, cái còn thiếu

> Viết theo yêu cầu *"sau khi sửa xong, khảo sát các phần còn thiếu cho mình để mình bổ sung"*.
> Nền đo: sau đợt thanh chiêu tự gán. **Mọi con số dưới đây là đo được**, không ước lượng.

## 0. Kết luận một dòng

Chủ dự án muốn *"mật tịch mở khoá dựa vào đánh boss rớt bí kíp **hoặc** mở theo level"*.
**Vế "theo level" đã có đủ và đang chạy. Vế "boss rớt bí kíp" KHÔNG TỒN TẠI** — không một chiêu
nào trong game mở khoá bằng vật phẩm.

---

## 1. ĐO ĐƯỢC — hiện trạng

### 1.1 Cả 36 chiêu đều mở bằng CẤP, không có ngoại lệ

`vhAutoLearn()` quét `VOHOC_DEFS` và tự ngộ mọi chiêu đúng lớp khi `player.level >= v.unlock`.
Không chiêu nào khai điều kiện khác.

| Lớp | Chủ động | Bị động | Mốc cấp |
|---|---|---|---|
| Dark Knight | 6 | 2 | 15 · 15 · 22 · 25 · 30 · 35 · 45 · 60 |
| Sylvan Ranger | 6 | 1 | 15 · 15 · 20 · 25 · 30 · 38 · 45 |
| Dark Wizard | 6 | 1 | 15 · 15 · 25 · 28 · 38 · 48 · 60 |
| Spellblade | 6 | 1 | 15 · 15 · 18 · 28 · 35 · 40 · 55 |
| Dark Lord | 6 | 1 | 15 · 15 · 25 · 35 · 40 · 50 · 55 |

⇒ **Tới cấp 60 là ai cũng có đủ bộ.** Không có gì để săn, và hai người cùng lớp cùng cấp thì sở
hữu y hệt nhau — khác nhau chỉ ở chỗ cắm ô nào.

### 1.2 "Sách Kỹ Năng" KHÔNG phải mật tịch mở khoá

Đây là chỗ dễ tưởng nhầm nhất, vì tên nó nghe đúng như thứ cần:

| | Sách Kỹ Năng (`player.bikipVH`) đang làm | Thứ chủ dự án mô tả |
|---|---|---|
| Tác dụng | **nâng 1 cấp** một chiêu ĐÃ CÓ | **mở khoá** một chiêu CHƯA CÓ |
| Đích | chiêu bất kỳ của lớp mình | một chiêu cụ thể |
| Thay thế được gì | tiền Lumen + Bản Năng | không thay được gì, nó là cửa duy nhất |

Tỉ lệ rơi hiện tại (`computeKillRewards`): Trấn Ải **35%** · Thủ Vệ/trùm **12%** · tinh anh **3%**
· quái thường **0%**.

### 1.3 Tab "Vaeldra" đang RỖNG về nội dung

Tab này dựng cho kỹ năng chung học ngoài thế giới. Đo: **không chiêu nào trong `VOHOC_DEFS` khai
`phai: null`** — tức không có kỹ năng chung nào tồn tại. Tab chỉ có `danchi` (cấp 48) và
`tieuhon` (cấp 72), cả hai vẫn là mốc cấp.

⇒ Đây chính là chỗ dành sẵn cho mật tịch rơi từ boss.

### 1.4 Không gian build sau đợt thanh chiêu tự gán

- 4 ô, ô 1 khoá chủ động ⇒ chọn 1 trong ~6 chủ động cho ô 1, rồi 3 trong ~7 còn lại cho ô 2-4.
- Cái giá thật: chiêu lên thanh thì **mất %Công Kích Di Sản** của nó (đo được: kéo một chiêu
  Di Sản lên thanh làm `legacyAtkPct` tụt đúng bằng bậc của chiêu đó, gỡ ra thì trả lại).
- Bị động **chỉ chạy khi cắm vào ô** — mỗi lớp 1-2 cái, nên cắm một bị động là bỏ một ô chủ động.

**⚠ Một hệ quả đáng để chủ dự án biết và quyết:** `tienthiencong` (Bản Nguyên Công — chết thì tự
hồi sinh 50% HP, hồi 300s) cũng là bị động, nên nay nó **chỉ cứu khi đang nằm trên thanh**. Trước
đợt này ngộ được là có, khỏi tốn ô nào. Đây là đúng luật chung (bị động phải trả bằng một ô), và
nó biến "một mạng dự phòng" thành một lựa chọn xây nhân vật thật — nhưng nó cũng là thứ âm thầm
làm nhân vật yếu đi với người đang quen có nó. Ba đường đi, chủ dự án chọn:
① giữ nguyên (bị động nào cũng phải trả bằng một ô — nhất quán nhất);
② cho nó là ngoại lệ, chạy chỉ cần ngộ được;
③ thêm ô bị động RIÊNG, không tranh chỗ với bốn ô chủ động.
Đo được: chính vì vế này mà `test_dungeon2` đỏ — mục kiểm cổng Tầng Sâu của nó vốn dựa vào việc
nhân vật tự hồi sinh, một thứ chẳng liên quan gì tới phó bản.

---

## 2. CÒN THIẾU — danh sách để chủ dự án bổ sung

### ⓵ Một LOẠI VẬT PHẨM "mật tịch" riêng, khác Sách Kỹ Năng

Cần một thứ **mở khoá một chiêu cụ thể**, không phải nâng cấp. Đề xuất khuôn dữ liệu:

```js
// mỗi mật tịch = một dòng; rơi ra là một món trong túi, dùng thì ngộ đúng chiêu đó
MAT_TICH = {
  mt_dk_cuongphong: { chieu:'dk_xxx', ten:'Mật Tịch Cuồng Phong', tier:'cao' },
  …
}
```

Ba câu hỏi chủ dự án cần chốt:
- Mật tịch **khoá theo lớp** hay ai nhặt cũng dùng được (nhặt nhầm thì bán/đổi)?
- Dùng xong **mất** hay giữ lại làm sưu tầm?
- Có cho **mua/chế** ở Lò Hỗn Độn không, hay chỉ rơi?

### ⓶ Những chiêu KHÔNG tự ngộ theo cấp

Hiện `vhAutoLearn()` ngộ mọi chiêu đúng lớp. Cần một cờ để nó **bỏ qua**:

```js
dk_xxx: { …, unlock:null, matTich:true }   // chỉ mở bằng mật tịch, cấp cao mấy cũng không tự ngộ
```

⚠ `vhAutoLearn()` được gọi ở **đúng hai chỗ** (đo bằng `grep`, không đoán): cuối
`unlockNotices()` — tức mỗi lần lên cấp — và **dòng đầu `renderSkillPanel()`**. Chỗ thứ hai mới
là chỗ bẫy: nó chạy mỗi lần MỞ BẢNG KỸ NĂNG, nên một chiêu chỉ-mở-bằng-mật-tịch mà quên cờ ở đó
sẽ tự ngộ ngay khi người chơi bấm K. Không lỗi, không dấu hiệu, và người chơi được không.

### ⓷ Bảng rơi cho mật tịch

`computeKillRewards()` hiện chỉ có một dòng cho Sách Kỹ Năng. Cần thêm nhánh riêng, và phải chốt:
- **con nào rơi cái gì** — Trùm Vùng của map nào rơi mật tịch nào (gợi ý: buộc theo vùng, để việc
  đi map có nghĩa, đúng lối Dòng Cốt đã làm);
- tỉ lệ — quá thấp thì thành tường chặn, quá cao thì mất giá trị;
- **có bảo hiểm không** (đánh N lần không ra thì chắc chắn ra) — không có thì người xui kẹt vĩnh viễn.

### ⓸ Nội dung cho tab Vaeldra

Tab đang có 16 ô mà chỉ 2 ô gán được. Cần chiêu khai `phai: null`. Đây cũng là chỗ hợp lý nhất
cho mật tịch: kỹ năng **chung cho mọi lớp**, chỉ mở bằng săn boss — tức hai người khác lớp vẫn có
thể cùng săn một thứ.

### ⓹ Cửa chỉ đường cho người chơi

Hiện không có chỗ nào nói "chiêu này mở bằng cách nào". Cần:
- ô cây khoá phải nói **mở bằng gì** (cấp mấy / mật tịch nào / rơi ở đâu), không chỉ "chưa mở khoá";
- một chỗ xem **danh sách mật tịch đã/chưa có** — nếu không thì người chơi không biết mình đang thiếu gì.

### ⓺ Hai thứ NÊN cân lại cùng lúc

- **Di Sản đang chép cứng 4 chiêu/lớp** (`LEGACY_SECT_SKILLS`). Thêm chiêu mới mà không thêm vào
  bảng đó thì chiêu ấy để ngoài thanh **không cộng gì** — tức để ngoài là mất trắng, và luật
  "lên thanh thì mất %ST" mất đối trọng.
- **`KN_ROT` (bảng điền ô cây) hiện 9 mã mỗi lớp**, trong khi hình cây có 16 ô. Chiêu mới thêm
  vào đâu thì phải điền vào đó, không thì nó có trong game mà không có trên cây.

---

## 3. Thứ tự đề xuất

| Đợt | Việc | Vì sao trước |
|---|---|---|
| 1 | Cờ `matTich:true` + `vhAutoLearn()` tôn trọng nó (cả 5 chỗ gọi) | Không có bước này thì mọi thứ sau đều bị cấp độ phát không |
| 2 | Loại vật phẩm mật tịch + dùng để ngộ chiêu | Cửa mở khoá |
| 3 | Bảng rơi theo Trùm Vùng + bảo hiểm | Lý do đi đánh boss |
| 4 | Nội dung tab Vaeldra + cửa chỉ đường | Chỗ để nó sống |

**Đợt 1 là đợt phải làm trước và rẻ nhất** — nó chỉ là một cờ, nhưng thiếu nó thì ba đợt sau đều
vô nghĩa vì chiêu vẫn tự rơi vào tay theo cấp.
