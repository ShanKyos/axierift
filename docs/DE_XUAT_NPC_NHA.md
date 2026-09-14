# Đặt NPC và nhà cửa cho Ardhaven — đọc từ map Tương Dương (Võ Lâm Chi Mộng)

> Đối chiếu bằng `node tools/do_thanh.cjs`. Đi kèm `docs/THIET_KE_THI_TRAN.md` (ba vòng) và
> `docs/DE_XUAT_TUONG_CONG.md` (tường và cổng).
>
> ⚠ Tấm tham chiếu là một thành **kiếm hiệp Trung Hoa**. Lấy **cách tổ chức**, tuyệt đối
> không lấy **kiến trúc** — xem §6 và Quy tắc số 1 trong `CLAUDE.md`.

---

## 0. Kết luận trước

**Thứ đáng lấy từ tấm hình đó không phải danh sách NPC — mà là việc CẢ THÀNH ĐỌC ĐƯỢC TỪ
BẢN ĐỒ.** Tương Dương có khoảng 18 chức năng, mỗi cái một nhãn chữ vàng đọc được trước khi
bước chân đi. Ardhaven có **26 NPC** — nhiều hơn — và đo được **0 trong 26 có tên trên bản đồ**.

Chúng ta không thiếu NPC. Chúng ta thiếu **cách nhìn thấy họ**.

---

## 1. Đọc tấm hình — sáu thứ làm nó chạy được

| # | Cơ chế | Thấy ở đâu trên hình |
|---|---|---|
| 1 | **Mọi chức năng có TÊN đọc được ngay trên bản đồ** | ~18 nhãn chữ vàng: Tạp Hóa · Tiệm Thuốc · Vũ Khí · Hợp Thành · Cường Hóa · Bảo Rương · Nhiệm Vụ · Thú Cưng · Trang Sức · Lôi Đài … |
| 2 | **Lối ra ghi CẤP ngay cạnh nó** | "Đại Thắng Quan · Cấp 10-20" · "Ngư thôn · Cấp 30-40" · "… Cấp 50-60" |
| 3 | **Nhãn phân màu theo LOẠI** | vàng = chức năng · hồng = loại khác (Sức Bền) · trắng = lối ra |
| 4 | **Gom theo CỤM NGHỀ, không rải đều** | trái = chế tạo (Vũ Khí · Hợp Thành · Cường Hóa · Thú Cưng · Bảo Rương) · phải = dịch vụ (Hộ Phù · Hộ Tống · Trang Sức) · giữa = mua bán + Nhiệm Vụ |
| 5 | **Sân giữa để TRỐNG**, các cụm quay mặt vào | khoảng sáng giữa hình, không công trình nào đứng trong đó |
| 6 | **Nhà nhỏ, dày, NHIỀU CỠ** | mái lớn của sảnh chính cạnh mấy gian hàng bé — không có hai cái nào bằng nhau |

Cơ chế **2** là thứ đắt giá nhất và ít ai để ý: bản đồ thành đồng thời là **bảng chỉ đường
theo cấp**. Người chơi cấp 12 nhìn một cái là biết đi cửa nào.

---

## 2. Đối chiếu với Ardhaven — đo được

| | Tương Dương (đọc từ hình) | Ardhaven (đo) |
|---|---|---|
| Chức năng có nhãn đọc được | **~18** | **0** |
| Số NPC trong thành | — | **26** (8 có chức năng · 18 chỉ lore) |
| Bản đồ thành có hình không | **có**, ~415×440, nhãn từng chỗ | **không** — bảng Bản Đồ là *danh sách chữ các map* |
| Bản đồ thu nhỏ | (tấm lớn riêng) | **240×120** cho map 6400×3200 |
| Lối ra ghi cấp trên bản đồ | **4/5 có** | **0/4** |
| Công trình có art | — | **3/16 khối**, và cả 16 khối **cùng một cỡ 460×340** |

### Vì sao 0/26

`drawMinimap()` có luật: **map nào quá 8 NPC thì chỉ gắn tên cho ai đang có việc** (dấu `!`
hoặc `…`) hoặc đang được đèn hiệu ghim. Luật ấy **đúng** — 26 cái tên nhồi vào ô 240×120 ra
một mảng chữ đặc, không đọc nổi chữ nào, tệ hơn hẳn không ghi gì.

Nhưng hệ quả là **không ai có tên cả**. Và đó chính là chỗ tấm tham chiếu giải bài khác hẳn:
nó **không cố nhét nhãn vào góc màn hình** — nó có một **tấm bản đồ lớn riêng** để làm việc đó.

---

## 3. Ba việc, xếp theo lợi trên chi phí

### A. BẢNG BẢN ĐỒ THÀNH — có hình, có nhãn *(rẻ nhất, lợi nhất, KHÔNG cần một tấm art nào)*

Thêm một tab **"Thành"** vào bảng Bản Đồ (phím M), vẽ ở khổ lớn (~560×280, gấp **5,4 lần**
diện tích bản đồ góc) gồm:

- đa giác `diTrong` + 16 khối nhà + lưới phố — dùng lại `drawMinimapStatic()`, không vẽ mới;
- **nhãn chữ cho từng chức năng**, phân màu đúng cơ chế ③: vàng = chức năng · lam = nhiệm vụ
  · trắng = cổng;
- **cổng ghi cấp map sau nó** (cơ chế ②) — dữ liệu đã có sẵn ở `MAPS[to].min`, hiện chỉ
  không được hiện ra;
- chấm vị trí người chơi.

Ở khổ đó, 8 nhãn chức năng + 4 nhãn cổng **thừa chỗ** — luật "quá 8 NPC thì im" không phải
áp, vì nó sinh ra cho ô 240×120 chứ không phải cho tấm này.

> ⚠ **Chỉ gắn nhãn cho 8 NPC CÓ CHỨC NĂNG + 4 cổng.** 18 người lore thì để chấm. Gắn cả 26
> là lặp lại đúng cái lỗi mà luật kia sinh ra để tránh, chỉ ở khổ to hơn.

### B. GOM NPC THEO CỤM NGHỀ *(chỉ đổi toạ độ, không art)*

Cơ chế ④. Hiện 8 chức năng rải trên 6400×3200 theo thứ tự **lật ngược** — thứ chạm mỗi
chuyến ở xa nhất (1645–2840px), thứ chạm vài phiên ở gần nhất (728–1842px). Bảng gán ở §4.

### C. NHÀ NHIỀU CỠ *(cần art)*

Cơ chế ⑥. Mười sáu khối **y hệt nhau 460×340** là thứ làm thành đọc ra một bàn cờ. Ba hạng
cỡ ở §5.

---

## 4. Bảng gán — 18 chỗ đứng

Ba vòng lấy từ `THIET_KE_THI_TRAN.md §4`. Khối đánh số theo chú thích trong `data/canbang.js`
(0-3 · 8-11 hàng **bắc** `y=520` · 4-7 · 12-15 hàng **nam** `y=2340`).

### LÕI — hai khối mới ở ngã tư, `y=1100`

| Khối | Tên phố | NPC đứng trước (`y=1510`) | Chức năng |
|---|---|---|---|
| **A** (2380,1100) | Phố Chợ | `duoclao` (2480) · `trachu` (2740) | Tiệm Thuốc · Quán Trọ |
| **B** (3560,1100) | Phố Lò | `thoren` (3660) · `binhkhi` (3920) | Lò Rèn · Vũ Khí Phường |

Bốn quầy trải **1440px < 1920px** ⇒ đứng ở điểm thả nhìn thấy hết. Đây là cơ chế ⑤: sân giữa
để trống, bốn quầy quay mặt vào.

### VÀNH BẮC — "Phố Nghề"

| Khối | Vai | NPC |
|---|---|---|
| #2 (1600,520) | Nhà Nhuộm | `ah_thonhuom` |
| #3 (2260,520) | Chòi Trông Vách | `ah_vachgio` — giữ ở `(2160,380)`, sát mép bắc: cái vực nằm **sau tường** |
| #9 (4340,520) | Sảnh Cầu May | `thantoan` |
| #10 (5000,520) | Sảnh Lệnh | `bodau` (Truy Nã) |
| #0 · #1 · #8 · #11 | nhà dân | — |

### VÀNH NAM — "Xóm Thợ"

| Khối | Vai | NPC |
|---|---|---|
| #6 (1600,2340) | Xưởng Mộc | `ah_thomoc` |
| #7 (2260,2340) | Dãy Chuồng | `ah_mucdong` |
| #12 (3680,2340) | Sân Luyện Chimera | `ah_chimera` |
| #4 · #5 · #13 · #14 · #15 | nhà dân | — |

> ⚠ **Ba khối hàng NAM đang có NPC đứng ở phía BẮC khối** (`ah_mucdong` ở `2160,2450`), tức
> NPC đứng **sau lưng** công trình. Mặt tiền sprite isometric luôn quay xuống dưới, nên khi
> cắm art phải dời NPC xuống `y ≥ 2700` hoặc xin bản art quay ngược. Đã ghi trong
> `data/canbang.js` nhưng **chưa xử**.

### MÉP — bốn cổng

Bốn lính gác giữ nguyên. Không chức năng bắt buộc nào ở đây.

---

## 5. Ba hạng cỡ nhà — thay cho 16 khối bằng nhau

| Hạng | Khổ | Dùng cho | Vì sao |
|---|---|---|---|
| **Sảnh** | 920×340 *(2 ô)* | Lò Rèn · Sảnh Cầu May | hai thứ người chơi quay lại nhiều nhất — cho chúng một bóng dáng nhớ được |
| **Gian** | 460×340 | tiệm, xưởng, chuồng | cỡ đang có, giữ nguyên |
| **Quán** | 300×240 | nhà dân, kho, chái bếp | cỡ nhỏ phá nhịp bàn cờ, và **rẻ nhất để gen** |

Chín khối không có NPC **không cần thành công trình riêng** — dựng bằng **vật lặp lại**
(tường rào, sân trong, đống củi, giàn phơi), một bộ prop dùng chín lần.

⇒ Đơn hàng art thật: **2 sảnh + 4 gian + 1 bộ prop**, không phải 13 tấm công trình riêng.

---

## 6. Cái KHÔNG lấy

- **Kiến trúc Trung Hoa.** Mái ngói cong, đầu đao, sân tứ hợp viện — đẹp, và **cấm**
  (`CLAUDE.md` Quy tắc số 1). Ardhaven là khu phố đá phương Tây rơi qua vết nứt. Lấy **nhịp
  chia khu** của tấm hình, đổ vào **mái dốc ngói đỏ + đá xám** đang có ở `ct_loren`/`ct_duoc`.
- **Tên gọi kiếm hiệp.** `Mật Tích` · `Hộ Phù` · `Danh Vọng` · `Lôi Đài` · `Sức Bền` là từ
  vựng kiếm hiệp. Chức năng tương đương ta đã có tên riêng rồi (Truy Nã Lệnh · Sảnh Cầu May
  · Vực Thẳm).
- **Cho MỌI hệ một NPC.** Tấm hình có `Bảo Rương` · `Cường Hóa` · `Dịch Chuyển Cửa Thành`
  làm chỗ đứng riêng, vì đó là ràng buộc của một game 2005 — mọi thứ phải đi bộ tới. Ở đây
  **Kho, Quầy Shard, Tái Sinh, Bản Đồ đã là bảng bấm phím**, và bắt đi bộ tới chúng là làm
  game **tệ đi**, không phải giống hơn. Thêm NPC chỉ khi cái NPC ấy mở ra một hệ **chưa có
  cửa nào**.
- **Thêm NPC cho đỡ trống.** Đã có 18 người `talk:'quest'` không mở ra hệ nào. Người thứ 19
  không thêm được việc gì để làm, chỉ thêm một cái tên để đi ngang qua.

---

## 7. Một ý đáng cân nhắc riêng: Lôi Đài

Tấm hình có **Lôi Đài** — sàn đấu tay đôi ngay giữa thành. Ardhaven là `type:'safe'` (cấm PK)
nên hiện không có chỗ nào đánh nhau trong tường, mà game thì **có** đất PK (`type:'pk'`).

Một vòng đấu trong sân, PK chỉ bật **trong vòng đó**, là cách cho người chơi thử build mà
không phải đi ra vùng PK và bị người lạ cắt ngang. **Ngoài phạm vi đợt này** — ghi lại để
không quên, và nó cần thiết kế luật riêng chứ không phải một cái NPC.

---

## 8. Thứ tự làm

| Đợt | Việc | Cần art? | Kiểm |
|---|---|---|---|
| **N1** | Tab "Thành" trong bảng Bản Đồ: hình + nhãn 8 chức năng + 4 cổng kèm cấp | **không** | chụp màn hình — đọc được tên mọi chức năng |
| **N2** | Gom NPC theo §4 (cùng đợt T1 của `THIET_KE_THI_TRAN.md`) | **không** | `do_thanh.cjs` · `test_sandat` |
| **N3** | Dời 3 NPC hàng nam xuống `y ≥ 2700` để không đứng sau lưng nhà | **không** | `test_sandat` |
| **N4** | Gen 2 sảnh + 4 gian + 1 bộ prop (§5) | có | `do_thanh.cjs` |

**N1 · N2 · N3 không cần một tấm art nào** và lấy được gần hết lợi ích của cả tài liệu này.
