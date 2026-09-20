# Đặt hàng art — Tướng Quân · Hoạt ảnh quái · Cánh

Ba mục 3/4/5 của đơn đặt hàng trong phiên duyệt art 11-09-2026. **Máy đã dựng xong và đang
chờ art** (xem §0): art về chỉ cần thêm dữ liệu, không sửa một dòng hàm nào.

Tài liệu này là thứ mang sang meowa. Mỗi phần có: **đặt hàng gì · khuôn kỹ thuật · lắp vào
đâu**, và những chỗ đã trả giá mới biết.

---

## 0. Máy đã có sẵn — đọc trước khi đặt hàng

| Cần gì | Khai ở đâu | Việc phải làm khi art về |
|---|---|---|
| Trùm có tranh riêng | `anh:'<tên>'` trong `BOSS_DEFS` (`data/canbang.js`) | thêm một khoá |
| Quái/trùm có hoạt ảnh | `MOB_KHUNG` (`game.js`) | dán một mục do công cụ in ra |
| Cánh vẽ tay | `anh:'<tên>'` trong `WING_DEFS`/`WING2_DEFS`/`WING3_DEFS` | thêm một khoá |

Công cụ đóng bảng khung: `tools/nuong_khungquai.py` — nhận khung đã render (dải ngang, thư
mục khung rời, hay khung xuất từ Spine), **đo** hộp ô và `neoY`, rồi in ra nguyên văn mục
phải dán. Bài kiểm gác cả ba: `tests/test_khungquai.js`.

Hai điều máy tự lo, đừng vẽ vào tranh:
- **Lật hướng.** Game lật ảnh khi con vật quay trái (`ctx.scale(-1,1)`). ⇒ **mọi tấm vẽ con
  vật quay sang PHẢI**, và chỉ vẽ một hướng.
- **Bóng đổ.** `drawMob` tự vẽ hai lớp elip bóng trên đất, có nghiêng theo giờ trong ngày.
  Vẽ bóng vào tranh là hai cái bóng chồng nhau, lệch chiều.

---

## ⚠ Chỗ sai phải biết trước: "tranh có sẵn" không phải lúc nào cũng dùng được

Bản duyệt đầu ghi rằng `boss_hacphong.png` và `boss_tinhhoa.png` là art thật đang bị máy đè,
chỉ cần nối lại. **Sai — đo lại thì cả hai KHÔNG có kênh trong suốt**:

```
boss_hacphong.png   alpha=0 chiếm 0,0%   → tranh có NỀN ĐẶC
boss_tinhhoa.png    alpha=0 chiếm 0,0%   → tranh có NỀN ĐẶC
boss_sontac.png     alpha=0 chiếm 41,5%  → cắt sẵn, dùng được
```

Nối hai tấm đầu vào là dán một hình chữ nhật 320×320 có nền lên giữa bản đồ. Chúng là **tranh
minh hoạ**, không phải sprite. Muốn dùng thì phải tách nền trước, và `boss_tinhhoa` thì không
tách được — nó là một cơn xoáy lá, không có đường bao.

⇒ **Luật rút ra, áp cho mọi đơn hàng dưới đây: nền trong suốt là điều kiện GIAO HÀNG, không
phải chi tiết kỹ thuật.** Kiểm ngay khi nhận: `alpha=0` phải chiếm ≥ 25% khung.

---

## 1. Phần 3 — Tướng Quân (11 con)

### Vì sao con số là 11 chứ không phải 8

Đếm lại `BOSS_DEFS`: 11 map có `tranai` (Tướng Quân cuối map). Ngoài ra còn 29 Vệ Binh Trụ —
đợt sau.

Hiện trạng: **không con nào trong 40 con có tạo hình riêng.** 19 con vẽ bằng khung xương,
21 con mượn sprite quái thường phóng to. `mocnhan` một mình gánh 5 trùm.

### Đặt hàng gì

Mỗi Tướng Quân là **sinh vật bản địa của chính map đó, đã bị khí Morvahn bẻ thành Chimera**.
Đó không phải văn vẻ — nó cho mỗi con một điểm tựa hình hoạ có sẵn: lấy lớp Axie của map,
giữ sáu bộ phận, rồi vặn chúng.

| # | Map | Tướng Quân | Cấp | Hệ | Lớp Axie của map | Dòng Cốt độc quyền |
|---|---|---|---|---|---|---|
| 1 | `corran` | Người Giữ Rẻo Corran | 14 | Mộc | Plant | — |
| 2 | `ngoai` | Ma Sói Sương Trắng | 22 | Hỏa | Beast | Đồng Cỏ |
| 3 | `chungnam` | Tướng Quân Werebear Woods | 32 | Thủy | Beast | Rễ Gai |
| 4 | `daohoa` | Thủ Lĩnh Đoàn Gloam | 50 | Hỏa | Plant | Cánh Hoa |
| 5 | `loimon` | Kẻ Chặn Cuối Lối | 50 | Thổ | Plant | — |
| 6 | `trungnut` | Thứ Bò Ra Từ Nứt | 52 | Thuỷ | — | — |
| 7 | `comoc` | Tướng Quân Bug Tribe Tunnels | 52 | Mộc | **Bug** | Vỏ Trứng |
| 8 | `caungam` | Thứ Ngoi Lên Từ Hồ Ngầm | 63 | Thủy | **Aquatic** | — |
| 9 | `tuyettinh` | Tướng Quân Bird Tribe Heights | 72 | Mộc | **Bird** | Băng Vụn |
| 10 | `mongco` | Tướng Quân Reptile Sunstone Flats | 92 | Kim | **Reptile** | Tro Tàn |
| 11 | `nhanmon` | Tướng Quân Dusk Marsh | 112 | Hỏa | **Dusk** | Sấm Vụn |

**Viết prompt theo SÁU BỘ PHẬN, đừng viết "một con trùm đáng sợ".** Bộ phận không nêu thì máy
tự bịa, và cái bịa đó không thuộc lớp nào:

> Bug Axie khổng lồ đã tha hoá — **mắt** năm con xếp vòng cung, **tai** gãy cụp một bên,
> **sừng** đôi càng kìm mọc ngược lên trán, **miệng** hàm nhai tách đôi theo chiều dọc,
> **lưng** vỏ giáp nứt để lộ tổ trứng phát sáng, **đuôi** ngòi đốt cong.
> Thân là khối tròn mập, bốn chân ngắn. Vảy màu lục nhạt của lớp Bug, vệt nứt phát sáng
> màu Vỏ Trứng. Quay sang phải, nền trong suốt.

### Hai điều dễ hỏng ở cỡ trùm

- **Trùm vẽ ra 106–132px trên màn.** Chi tiết nhỏ hơn ~4px biến mất sạch. Thử bằng cách thu
  tấm về 130px rồi nhìn: còn đọc ra con gì không? Đọc không ra thì tấm đó chưa đạt, dù phóng
  to rất đẹp.
- **Che sáu bộ phận đi, cái còn lại vẫn phải ra Axie** — khối tròn mập, chân ngắn. Vẽ thân
  dài, đứng hai chân kiểu người, là ra một con quái của game khác.

### Khuôn kỹ thuật

| | |
|---|---|
| Cỡ tấm | **≥ 768×768**, một chuẩn cho cả 11 con |
| Nền | **trong suốt** (alpha=0 ≥ 25% khung) |
| Hướng | quay **phải** |
| Bóng | **không vẽ** — game tự đổ |
| Tệp | `public/game/assets/mobs/<tên>.png` |

### Lắp vào

Một dòng trong `BOSS_DEFS` (`public/game/data/canbang.js`) — thêm `anh:` vào đúng mục:

```js
tranai: { id:'cm4', name:'Tướng Quân Bug Tribe Tunnels', lv:52, el:'Mộc',
          img:'boss_mochu', anh:'tq_comoc', x:.86, y:.80, moves:[…] },
```

`anh` thắng cả `img` mượn lẫn khung xương kế thừa. `img` cứ để nguyên — nó còn dùng để lấy
chỉ số gốc.

---

## 2. Phần 4 — Hoạt ảnh quái (8 tấm)

### ⚠ Điều kiện chặn: art quái hiện nay là ĐẦU KHÔNG CÓ THÂN

Soi cả 24 tấm trong `assets/mobs/`: phần lớn là **khối đầu Axie tròn, không chân**. Đó là ảnh
thẻ sưu tầm, không phải sprite nhân vật.

**Không thể nướng vòng đi cho một cái đầu.** Nó chỉ nhấp lên nhấp xuống — đúng thứ `bob` đang
làm sẵn, tức là bỏ tiền ra mua lại thứ đã có.

⇒ **Đơn hàng này là VẼ LẠI 8 loài có đủ thân và chân**, không phải "thêm khung cho tấm cũ".
Theo đúng luật Axie: thân khối tròn mập, **bốn chân ngắn**, sáu bộ phận đọc ra được.

### Chọn 8 tấm nào — theo số thực thể mỗi tấm gánh

Tấm art dùng chung nhiều loài, nên chọn theo độ phủ chứ không theo cảm tình:

| Tấm | Loài quái | Trùm | Dải cấp phủ | Lớp Axie |
|---|---|---|---|---|
| `mocnhan` | 1 | **5** | 6–50 | Plant (golem gỗ) |
| `assassin` | 3 | 2 | 10–78 | Gloam (đào ngũ) |
| `duhiep` | 3 | 0 | 30–115 | Axie Lang Thang |
| `wolf` | 2 | 2 | 4–43 | Plant |
| `boar` | 2 | 1 | 1–40 | Beast |
| `caodo` | 2 | 1 | 8–66 | Plant/Hỏa |
| `bandit` | 2 | 1 | 6–18 | Gloam |
| `xanu` | 2 | 1 | 31–59 | Chimera |

**8 tấm phủ 17 loài quái + 13 con trùm = 30 thực thể**, trải từ cấp 1 tới 115.

### Bốn nhịp, và vì sao đúng bốn

| Nhịp | Khung | Bắt buộc | Máy chạy nó theo cái gì |
|---|---|---|---|
| `dung` | 4–6 | **có** | đồng hồ — nhịp thở không khớp với gì cả |
| `di` | 6–8 | không | **quãng đường đã đi** |
| `danh` | 4–6 | không | `lungeT` (0,22 s), nên lưỡi vung đúng lúc sát thương rơi |
| `chet` | 4–6 | không | `deadT` (0,45 s), chạy tới khung cuối rồi **dừng** |

⚠ Nhịp `di` chạy theo **quãng đường**, không theo thời gian — chia theo thời gian là bàn chân
trượt đất. Đây là bài học đã trả giá ở sải chân nhân vật (`SAI_CHAN`), và ở quái còn dễ dính
hơn vì hiệu ứng làm chậm đổi tốc độ giữa chừng. ⇒ **vòng đi phải khép kín**: khung cuối nối
liền được vào khung đầu, và trong một vòng bàn chân phải chạm đất đúng số lần.

Nhịp nào thiếu thì rơi về `dung` — giao dần từng nhịp được, không phải chờ đủ bộ.

### Khuôn kỹ thuật

| | |
|---|---|
| Cỡ khung | **384×384**, một chuẩn cho cả 8 tấm |
| Nền | trong suốt, mỗi khung một tệp hoặc một dải ngang |
| Hướng | quay **phải** |
| Chân | **mọi khung neo bàn chân ở cùng một mức** — công cụ đo `neoY` từ nhịp `dung`, nhịp khác lệch là con vật lún hoặc lơ lửng |
| Tệp ra | `public/game/assets/mobs/kh/<tên>.png` |

### Lắp vào

```bash
python3 tools/nuong_khungquai.py boar \
    --dung khung/dung/*.png --di khung/di/*.png \
    --danh khung/danh/*.png --chet khung/chet/*.png
```

Công cụ in ra mục dán thẳng vào `MOB_KHUNG` trong `game.js`. Một con số nó **không** đo được
là `sai` (quãng đường cho trọn một vòng đi) — nó nằm trong sải chân người hoạ sĩ vẽ. Chạy
thử rồi chỉnh: chân trượt về **trước** ⇒ `sai` đang quá lớn; lết về **sau** ⇒ quá nhỏ.

---

## 3. Phần 5 — Cánh (4 tấm)

Máy **không cần sửa gì cả** — đường vẽ bằng tranh đã chạy từ khi Dark Wizard có `vu.png`.
12/15 mục còn lại đang vẽ bằng đường, và hình vẽ bằng đường không bao giờ đọc ra "đôi cánh",
nó đọc ra mấy vệt nhọn.

| Lớp | Loại cánh (`art`) | Tên bậc 1 → 3 |
|---|---|---|
| Dark Knight | `doi` (màng dơi) | Cánh Quỷ Đen → Hắc Nguyệt Dực → Thần Dực Bão Thép |
| Sylvan Ranger | `con` (côn trùng) | Cánh Tiên Sương → Sương Lâm Dực → Thần Dực Nguyệt Lâm |
| Spellblade | `lai` (trên lông, dưới màng) | Cánh Hỏa Vũ → Liệt Hỏa Dực → Thần Dực Vực Lửa |
| Dark Lord | `doi` (màng dơi) | Cánh Quỷ Hoang → Dực Bạo Chúa → Thần Dực Ngai Đen |

⚠ **Mỗi lớp MỘT loại cánh xuyên cả ba bậc.** Đã có lần để Spellblade nhảy `lai` → `tia` và
Dark Lord nhảy `doi` → `ao` giữa chừng: lên bậc là đôi cánh hoá thành con khác, mà `art` mới
là thứ người chơi nhận ra lớp, không phải chỉ số. Bài kiểm khoá lại.

⇒ **Chỉ cần 4 tấm**, mỗi lớp một tấm dùng chung cả ba bậc. Bậc đọc ra bằng **màu và số tầng
lông** — máy tự chồng thêm tầng và đổi màu theo `WING_TIERS`, không cần ba tấm.

### Khuôn kỹ thuật

| | |
|---|---|
| Vẽ | **một cánh PHẢI duy nhất** — máy tự lật sang trái |
| Cỡ | ~**768×340**, nhìn ngang |
| Màu | **xám trung tính**, không tô màu |
| Nền | trong suốt |
| Gốc cắm | chỗ cánh cắm vào lưng nằm ở **mép trái, khoảng 65% chiều cao tính từ trên** |
| Tệp | `public/game/assets/canh/<tên>.png` |

Vẽ xám là chủ ý: `canhAnhMau()` nhuộm tranh theo màu của bậc bằng phép **nhân**, nên nếp lông
còn nguyên mà một tấm phục vụ được cả ba bậc. Tô màu sẵn thì nhuộm chồng lên ra màu bùn.

### Lắp vào

Thêm `anh:` vào **ba** mục của lớp đó (`WING_DEFS`, `WING2_DEFS`, `WING3_DEFS`):

```js
thieulam: { art:'doi', to:1.0, anh:'doi_dk', chuKy:360, … },
```

Lệch chỗ cắm thì chỉnh bằng ba khoá tuỳ chọn ngay trên mục đó — `anhGoc` (gốc cắm, tỉ lệ
rộng/cao), `anhXoay` (radian), `anhDai` (chiều dài theo sải cánh) — không phải sửa hàm.
Thiếu tệp thì tự rơi về hình dựng bằng đường, không vỡ màn hình.

---

## 4. Nhận hàng — kiểm bốn thứ trước khi nối

1. **Nền trong suốt**: `alpha=0` ≥ 25% khung. (Đây là chỗ hai tấm trùm cũ đã chết.)
2. **Quay sang phải**, một hướng duy nhất.
3. **Thu về cỡ thật rồi nhìn**: quái 43–73px, trùm 106–132px. Đọc không ra thì chưa đạt.
4. **Che sáu bộ phận** (mắt · tai · sừng · miệng · lưng · đuôi) → cái còn lại vẫn phải ra
   Axie: khối tròn mập, chân ngắn.
