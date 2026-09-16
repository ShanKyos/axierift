# Làm map khởi đầu "đặc sắc" như Tương Dương — review và thiết kế

> Đối chiếu bằng `node tools/do_thanh.cjs`. Tiếp nối `docs/DE_XUAT_NPC_NHA.md` (đã xong N1-N4)
> và `docs/THIET_KE_THI_TRAN.md` (ba vòng).

---

## 0. Review — con số làm đổi cả hướng giải

Tương Dương có **~18 chức năng có nhãn**. Ardhaven sau đợt vừa rồi có **8 cửa**. Nhìn thế thì
kết luận dễ nhất là "thiếu 10 cái NPC". **Sai.**

Đếm lại từ phía hệ thống:

> **Game đã có 17 hệ thống chạy được. Chỉ 8 trong số đó có một cái cửa ở trong thành.**
> Chín hệ còn lại chỉ mở được bằng phím hoặc bằng một tab lồng trong bảng khác.

| Hệ đã chạy | Cửa trong thành |
|---|---|
| Tiệm Thuốc · Vũ Khí · Quán Trọ | ✅ 3 NPC `shop` |
| Lò Rèn (ép ngọc, cường hoá) | ✅ `thoren` |
| Chuồng / thú cưỡi | ✅ `ah_mucdong` |
| Truy Nã Lệnh | ✅ `bodau` |
| Sảnh Cầu May | ✅ `thantoan` |
| Vực Thẳm | ✅ `ah_vachgio` |
| Nhiệm Vụ | ✅ NPC `quest` |
| Tầng Sâu | ✅ cổng giếng |
| **Kho** | ❌ chỉ là tab trong Túi Đồ |
| **Lò Hỗn Độn** (chế tạo · hợp thành) | ❌ `openForgePanel()` |
| **Khế Ước Chimera** | ❌ bấm ô ví |
| **Quầy Shard** | ❌ bấm ô ví |
| **Box Kundun** | ❌ bấm trong túi |
| **Danh Hiệu** | ❌ tab |
| **Tái Sinh · Đại Thành** | ❌ tab Nhân Vật |
| **Vỉa Cốt hôm nay** | ❌ chỉ hiện trên bản đồ |
| **Chọn Trận** | ❌ nút trong bảng Bản Đồ |

⇒ Mở cửa cho **chín hệ đã có** đưa thành từ 8 lên **17 chức năng** — ngang Tương Dương — mà
**không phải xây một cơ chế mới nào**.

### ⚠ Tôi đổi lại một kết luận của chính mình

Ở `DE_XUAT_NPC_NHA.md §6` tôi viết *"đừng cho MỌI hệ một NPC — Kho, Shard, Tái Sinh đã là bảng
bấm phím, bắt đi bộ tới chúng là làm game tệ đi"*. Câu đó **chỉ đúng cho việc THAY** phím bằng
đi bộ. Nó **không** đúng cho việc **thêm một cửa thứ hai**.

**Luật mới, và nó gỡ được mâu thuẫn:** *mỗi cửa mới PHẢI giữ nguyên phím tắt của hệ đó.*
NPC không phải cách duy nhất để vào — nó là cách **nhìn thấy rằng hệ đó tồn tại**. Người chơi
mới không bao giờ bấm thử một phím họ không biết có, nhưng họ sẽ đi ngang một cái nhà có biển.
Đó chính là thứ làm Tương Dương "đặc sắc": nó **bày cả bộ máy của game ra thành một nơi chốn**.

---

## 1. Mười tám nhãn trên tấm hình, đối chiếu từng cái

| Nhãn Tương Dương | Ta có hệ tương đương? | Việc |
|---|---|---|
| Tạp Hóa | Quán Trọ / Trà Quán | ✅ xong |
| Tiệm Thuốc | Tiệm Thuốc | ✅ xong |
| Vũ Khí · Phong Cụ | Vũ Khí Phường | ✅ xong |
| Cường Hóa | Lò Rèn (ép ngọc) | ✅ xong |
| Nhiệm Vụ | QUESTS | ✅ xong |
| Thú Cưng | Chuồng | ✅ xong |
| **Bảo Rương** | **Kho** | **A — mở cửa** |
| **Hợp Thành** | **Lò Hỗn Độn** | **A — mở cửa** |
| **Danh Vọng** | **Danh Hiệu** | **A — mở cửa** |
| **Mật Tích** | **Vỉa Cốt hôm nay** | **A — mở cửa** |
| **Dịch Chuyển Cửa Thành** | bảng Bản Đồ | **A — dựng làm MỐC** |
| Trang Sức | nhẫn/dây chuyền bán chung quầy Vũ Khí | A nhẹ — tách quầy |
| **Lôi Đài** | *không có* | **B — đáng thêm** |
| Phố Bán | *cần online* | C — bỏ |
| Sức Bền | *game không có độ bền* | C — bỏ |
| Hộ Phù · Hộ Tống | *không có* | C — bỏ |

Và ba hệ của riêng ta, không có mặt bên đó nhưng cũng đang không có cửa:
**Khế Ước Chimera** · **Quầy Shard** · **Box Kundun** → nhóm **A**.

---

## 2. Nhóm A — chín cửa mới cho hệ đã có *(không cơ chế mới)*

| Cửa | Hệ mở ra | `talk` | Phím giữ nguyên |
|---|---|---|---|
| **Nhà Kho** | Kho | `kho` | Túi Đồ → Kho |
| **Lò Hỗn Độn** | chế tạo · hợp thành | `chaos` | `openForgePanel()` |
| **Đền Khế Ước** | quay Chimera | `kheuoc` | ô ví ✦ |
| **Quầy Shard** | đổi Shard | `shard` | ô ví ♦ |
| **Bàn Mở Hạp** | Box Kundun | `baohap` | trong túi |
| **Đài Danh Hiệu** | Danh Hiệu | `danhhieu` | tab |
| **Người Dò Mạch** | chỉ Vỉa Cốt hôm nay | `via` | bản đồ |
| **Trụ Dịch Chuyển** | travelTo | `dichchuyen` | bảng Bản Đồ |
| **Đài Tái Sinh** | Tái Sinh · Đại Thành | `taisinh` | tab Nhân Vật |

**Chi phí kỹ thuật gần bằng không.** Mỗi cửa là **một dòng NPC** trong `data/canbang.js` cộng
**một dòng** trong bộ phân nhánh `talk` (`game.js` ~23370) gọi đúng hàm `render*` **đã có**.
Không hàm mới, không bảng mới, không cân bằng lại.

**Trụ Dịch Chuyển và Đài Tái Sinh nên là VẬT THỂ, không phải người.** Một cái trụ đá phát sáng
giữa quảng trường đọc ra là "chỗ đi xa" ngay, không cần ai đứng đó giải thích — và nó cho thành
cái **mốc định hướng** vẫn đang nợ từ `DE_XUAT_TUONG_CONG.md`.

---

## 3. Nhóm B — Lôi Đài, thứ MỚI duy nhất đáng làm

Đây là chỗ Tương Dương hơn hẳn ta, và nó không phải một cái NPC:

> **Ardhaven là `type:'safe'` — trong tường không có chỗ nào đánh nhau.** Game có đất PK
> (`type:'pk'`), nhưng muốn thử một build thì phải đi ra vùng PK và chịu bị người lạ cắt ngang.

**Lôi Đài** = một vòng tròn trong sân, **PK chỉ bật bên trong vòng đó**. Bước vào là nhận đấu,
bước ra là hết. Nó cho người chơi:
- chỗ thử build mà không mất gì;
- một lý do **ở lại** trong thành thay vì chỉ ghé qua mua đồ;
- và một thứ để **đứng xem** — cái mà không hệ nào khác của game đang có.

⚠ **Cần luật riêng, không phải một cái NPC.** Vào/ra, thắng/thua, hồi máu sau trận, và chuyện
`type:'safe'` đang cấm PK toàn map. **Đề nghị tách thành một đợt riêng**, đừng nhét chung với
tám cửa ở nhóm A — trộn vào là một việc rẻ bị một việc đắt kéo chậm.

---

## 4. Nhóm C — bốn thứ cố ý KHÔNG lấy

- **Phố Bán** — chợ người chơi. Cần online, mà online mới là thiết kế (`THIET_KE_ONLINE.md`).
- **Sức Bền** — game **không có độ bền trang bị** (đo: 0 chỗ nhắc tới). Thêm sửa đồ thì phải
  thêm cả hệ hao mòn trước — một hệ **trừ đi** của người chơi, chỉ để có thêm một cái biển.
- **Hộ Phù · Hộ Tống** — không có hệ tương đương, và cả hai là nội dung kiếm hiệp.
- **Kiến trúc Trung Hoa** — Quy tắc số 1. Lấy nhịp chia khu, không lấy mái cong.

---

## 5. Bố cục — 18 chỗ đứng

Ba vòng giữ nguyên (`THIET_KE_THI_TRAN.md §4`).

**LÕI** *(≤800px — chạm mỗi chuyến)* — giữ nguyên bốn quầy, **thêm hai**:
`Tiệm Thuốc` · `Quán Trọ` · `Lò Rèn` · `Vũ Khí` · **`Nhà Kho`** · **`Trụ Dịch Chuyển`**

> Kho và Dịch Chuyển vào lõi vì đó là hai thứ người chơi chạm **mỗi lần về thành**, đúng bằng
> mua thuốc. Sáu cửa trải ngang phải vẫn **lọt một khung hình 1920px** — đo lại sau khi đặt.

**VÀNH BẮC · "Phố Nghề"** — `Sảnh Cầu May` · `Truy Nã` · `Thợ Nhuộm` · `Chòi Trông Vách` ·
**`Lò Hỗn Độn`** · **`Đền Khế Ước`**

**VÀNH NAM · "Xóm Thợ"** — `Chuồng` · `Luyện Chimera` · `Xưởng Mộc` · **`Quầy Shard`** ·
**`Bàn Mở Hạp`** · **`Đài Danh Hiệu`**

**SÂN GIỮA** — `Người Dò Mạch` (đi lang thang) · **`Đài Tái Sinh`** · *(Lôi Đài, đợt sau)*

**MÉP** — bốn lính gác, nhà dân. Không chức năng bắt buộc.

⇒ **17 cửa**, ngang Tương Dương, và mỗi cái mở ra một hệ **đã chạy được hôm nay**.

---

## 6. Đơn hàng art — chủ dự án gen

Khuôn prompt và luật chung: `docs/DAT_HANG_ART_THANH.md §2` (**đổi đúng dòng `THE BUILDING:`**),
ba hạng cỡ ở `DE_XUAT_NPC_NHA.md §5`. ⚠ **Không dùng khuôn §2 cho tường/cổng** — xem
`DE_XUAT_TUONG_CONG.md §5`, cái khuôn đó ép mọi tấm về cỡ một căn nhà.

### 6a · Chín công trình mới

| # | `THE BUILDING:` | Cho | Hạng |
|---|---|---|---|
| 1 | `a stone vault house — squat fortified building, heavy banded metal door, small barred windows, iron lockplate, blue-grey stone` | Nhà Kho | Gian |
| 2 | `a chaos forge — a huge dark crucible on a stone platform, violet flame licking out of its mouth, cracked anvil beside it, no roof` | Lò Hỗn Độn | **Sảnh** |
| 3 | `a small covenant shrine — open stone pavilion, four carved pillars, a glowing egg-shaped orb floating on the altar, soft teal light` | Đền Khế Ước | Gian |
| 4 | `a gem trader stall — open market stall with a striped awning, faceted crystals laid out on dark velvet, a brass scale on the counter` | Quầy Shard | Quán |
| 5 | `an opening table — a low wooden workbench under a canopy, stacked closed treasure boxes beside it, one box open and empty` | Bàn Mở Hạp | Quán |
| 6 | `a hall of renown — a broad stone facade with a row of hanging banners, each banner a different colour, a laurel emblem above the door` | Đài Danh Hiệu | Gian |
| 7 | `a surveyor's tent — a canvas field tent, rolled maps and a tripod sighting instrument out front, lantern hanging from the pole` | Người Dò Mạch | Quán |
| 8 | `a teleport pillar — a tall standing stone ringed with floating glyph plates, soft blue light rising from its base, no building around it` | Trụ Dịch Chuyển | **Mốc** |
| 9 | `a rebirth altar — a circular stone dais with three steps, a ring of low braziers around the rim, one broken sword planted at the centre` | Đài Tái Sinh | **Mốc** |

### 6b · Một tấm vật nhỏ — thứ làm thành "đông"

Tấm tham chiếu đông không phải vì nhiều nhà, mà vì **giữa các nhà có đồ đạc**. Một tấm 4×3 =
12 món, rải lại khắp thành:

```
thùng gỗ · sọt rơm · đống củi · giàn phơi vải · xe đẩy tay · chum nước
biển hiệu treo · giá gươm · đe nhỏ · bó đuốc · chậu hoa · ghế đá
```

**Đây là món rẻ nhất trong cả danh sách và ăn tiền nhất** — một tấm gen, dùng ~60 lần.

---

## 7. Thứ tự làm

| Đợt | Việc | Cần art? |
|---|---|---|
| **Đ1** | Chín `talk` mới + chín NPC/vật thể. Mỗi cái một dòng dữ liệu + một dòng phân nhánh gọi hàm đã có. **Giữ nguyên mọi phím tắt.** | **không** |
| **Đ2** | Tấm 12 vật nhỏ (§6b), rải qua `vatDat` | có |
| **Đ3** | Chín công trình (§6a) | có |
| **Đ4** | **Lôi Đài** — luật PK-trong-vòng, tách riêng | có |

**Đ1 không cần một tấm art nào** và tự nó đưa thành từ 8 lên 17 chức năng. Chạy được ngay.

⚠ **Đ1 phải đo lại sau khi đặt**: `do_thanh.cjs` (sáu cửa lõi còn lọt một khung hình không),
`test_sandat` (không ai kẹt trong vật cản), `test_domap` (mật độ). Đợt trước tôi đặt ba móng
công trình mới mà quên kiểm NPC cũ — hai bài đỏ vì đúng một người đứng lọt vào móng.
