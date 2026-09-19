# Kiểm art toàn cục — art đã đồng nhất chưa, và phải sinh thêm ở đâu

> Số đo sinh bằng `python3 tools/do_art.py` → `docs/DO_ART.json` (**742 tệp ảnh**, đừng sửa tay).
> Độ phủ và đường chạy đo bằng Chromium thật trên `public/game` (15 map × 5 lớp + mọi bảng).
> Ngày đo: 2026-09-19.

## 0. Trả lời ngắn

**Chưa đồng nhất — và chỗ gãy KHÔNG nằm rải rác, nó nằm đúng trên MỘT đường: mặt đất ↔ thứ
đứng trên mặt đất.** Đo được, không phải cảm giác:

(trung vị mỗi nhóm; `tools/do_art.py` in ra TRUNG BÌNH nên hai bảng lệch nhau chút — trung
vị đọc đúng hơn vì vài tấm lạc kéo trung bình đi.)

| tầng | bão hoà | **viền đen** | lệch sáng trong thân |
|---|--:|--:|--:|
| nền map (viên lát) | 0,311 | **0,000** | 0,066 |
| vật thể iso (cây · đá) | 0,311 | **0,000** | 0,057 |
| quái + trùm | 0,549 | **0,213** | 0,229 |
| đàn thú hoang | 0,568 | 0,092 | 0,196 |
| **con Axie** (thân người chơi) | 0,606 | 0,105 | 0,199 |
| lớp nhân vật + giáp | 0,368 | 0,214 | 0,231 |
| NPC | 0,429 | 0,188 | 0,195 |
| tấm dán chiêu | 0,616 | 0,231 | 0,181 |
| icon trong bảng | 0,522 | 0,164 | 0,197 |

Thế giới được nướng bằng Blender: mờ, mịn, **gần như không có nét viền** (trung vị 0,000; trung
bình 0,007 cho vật thể iso và 0,029 cho nền). Mọi thứ đi lại trên nó
là tranh vẽ tay kiểu Axie: no màu gần gấp đôi, có nét bao đen dày. Đó là hai ngôn ngữ hình ảnh,
và chúng đứng cạnh nhau ở mọi khung hình.

Ngoài ra còn **ba chỗ gãy nhỏ hơn nhưng nằm ngay trong tầm mắt**, và **năm hố độ phủ** —
tất cả liệt kê bên dưới kèm số đo.

**Sức khoẻ đường chạy thì sạch:** 478 ảnh được xin trên 15 map × 5 lớp + mọi bảng, **0 lỗi 404**.
Không có tấm nào hỏng; vấn đề hoàn toàn là PHONG CÁCH và ĐỘ PHỦ.

---

## 1. Chỗ gãy #1 — MẶT ĐẤT KHÔNG CÙNG NGÔN NGỮ VỚI THỨ ĐỨNG TRÊN NÓ

Đây là chỗ gãy lớn nhất và nó có mặt ở **12/12 map ngoài trời**.

Bộ viên lát và bộ vật thể iso đo ra `viền` trung vị **0,000** (trung bình 0,029 / 0,007) — nướng
3D, đổ bóng mềm, tắt dần vào nền. Con Axie đứng lên đó mang `viền = 0,105`, con quái `0,213`. Mắt đọc ra hai lớp
dán chồng nhau chứ không đọc ra một thế giới.

**Cái cần sinh:** không phải vẽ lại cả thế giới. Cần **một nét bao và một nấc no màu chung**:
- bộ viên lát cần **đẩy bão hoà 0,31 → ~0,42** và thêm **mốc tương phản sẫm** (vết nứt, viền
  phiến) — đúng liều đã cứu Sàn Đấu Ardhaven, ghi trong CLAUDE.md;
- bộ vật thể iso (cây · đá · bụi, 87 tệp) cần **nét bao tối mảnh** ở bước nướng, ~1,5-2 px ở cỡ
  vẽ ra, để cây đứng cùng luật với con quái đứng cạnh nó.

Cả hai làm được **bằng công cụ đang có** (`tools/iso/nuong_biome.py`, `nuong_tile.py`), không
phải đặt art mới. Đây là việc rẻ nhất trong cả danh sách và nó chạm vào mọi khung hình.

⚠ Đừng chữa bằng cách kéo bão hoà của con Axie XUỐNG. Con Axie là IP của game; hạ nó là bỏ đúng
thứ thể lệ Vibeathon chấm.

---

## 2. Chỗ gãy #2 — HAI THÂN TRONG MỘT KHUNG, LỆCH NHAU 1,65 LẦN BÃO HOÀ

Trong thành, người chơi là **một cặp**: con Axie + lớp nhân vật đứng cạnh.

| | bão hoà | sáng |
|---|--:|--:|
| con Axie (`avatar/` + `chimera/`, 202 tệp) | **0,606** | 0,498 |
| lớp nhân vật (`nv/`, 147 tệp) | **0,368** | 0,370 |

Con Axie no màu gấp **1,65 lần** kẻ hộ tống đứng sát bên nó. Chúng đến từ hai nguồn khác nhau
(kit Axie chính chủ vs gói Spine người), và ở cỡ 74px / 95px đứng cạnh nhau thì chênh này đọc ra
"hai game khác nhau".

**Cái cần sinh:** một **lớp chỉnh tông** cho `nv/` ở bước nướng (`tools/spine/nuong_nv.py`) —
nâng bão hoà thân người lên ~0,48-0,52, giữ nguyên hình. Không cần vẽ lại một nét nào.

---

## 3. Chỗ gãy #3 — THANH 4 Ô CHIÊU: HAI HỌ ICON LỆCH NHAU 4 LẦN ĐỘ SÁNG

15 icon chiêu chia đúng hai họ, và **chúng chia theo LỚP**, nên mỗi người chơi nhìn đúng một họ:

| họ | icon | sáng | viền đen |
|---|---|--:|--:|
| **sáng — cel, lõi trắng** | `bd_a` `bd_tp` `tc_a` `tc_tp` `mg_a` `mg_tp` `slash` `tieuhon` | 0,48 – **0,75** | **0,00 – 0,06** |
| **tối — sơn dầu, nền đen** | `inferno` `meteorite` `dragonspirit` `tl_a` `tl_tp` | **0,18 – 0,23** | **0,55 – 0,64** |
| lẻ | `danchi` (một chiếc lông trên nền nhạt) · `basic` | 0,34 / 0,57 | 0,24 / 0,14 |

Chênh **4 lần** độ sáng trên cùng một thanh. Dark Wizard và Dark Lord nhận trọn họ TỐI; Sylvan
Ranger và Spellblade nhận trọn họ SÁNG.

**Cái cần sinh:** **5 icon vẽ lại** (`inferno` · `meteorite` · `dragonspirit` · `tl_a` · `tl_tp`)
theo khuôn họ sáng — nền góc một màu, lõi trắng nóng, **không nền đen**. Cộng `danchi` là 6.
⚠ Luật CLAUDE.md đã ghi: gói có viền đen đậm thì **không bao giờ** cộng sáng; đổi icon sang họ
sáng là gỡ luôn cái bẫy đó.

---

## 4. Chỗ gãy #4 — BỐN CON QUÁI LẠC ĐÀN (và hai tấm là THẺ, không phải sprite)

26 sprite quái, cỡ chuẩn 200×200. Bốn con lệch hẳn:

| tệp | cỡ | viền | lệch | **trong suốt** | chuyện gì |
|---|---|--:|--:|--:|---|
| `tq_daohoa.png` | 207×195 | **0,60** | 0,19 | 0,47 | tranh bán tả thực, không cùng đàn |
| `tq_corran.png` | 256×256 | **0,48** | 0,14 | 0,76 | như trên; `lệch 0,14` sát ngưỡng "đọc ra cái bóng" |
| `boss_hacphong.png` | 320×320 | 0,28 | 0,26 | **0,00** | **thẻ bài đục 100%**, không phải sprite |
| `boss_tinhhoa.png` | 320×320 | 0,39 | 0,21 | **0,00** | như trên |
| `boar.png` | 500×465 | **0,00** | **0,08** | 0,36 | không nét bao, phẳng lì, canvas gấp 2,5 lần |

**⚠ HAI TẤM THẺ KIA HIỆN KHÔNG VẼ RA MÀN — đã đo, đừng báo là lỗi đang sống.** `spawnZoneBoss`
kế thừa `skel` từ `MOBS[bd.img]` rồi **xoá `def.img`**; `MOBS.boss_hacphong` khai `skel:'knight'`,
`MOBS.boss_tinhhoa` khai `skel:'wraith'`. Lái cả **40 con trùm trên 11 map** rồi nghe mọi lượt xin
ảnh: **không một tấm boss nào được xin**. Chúng là **tệp chết trên đĩa**, không phải một hình chữ
nhật đang hiện trong game.

**Cái cần sinh:** `boar` vẽ lại theo đàn (200×200, có nét bao). Hai tấm thẻ thì **xoá**, hoặc
nướng lại thành sprite thật nếu muốn giữ tạo hình.

---

## 5. Chỗ gãy #5 — SÁU VIÊN NGỌC TRONG CÙNG MỘT DANH SÁCH, HAI KIỂU DỰNG

Bảng Ngân Hàng Ngọc bày cả sáu viên cạnh nhau:

| | bão hoà | dựng |
|---|--:|---|
| `chucPhuc` `honDon` `linhHon` `sinhMenh` | 0,66 – 0,82 | viên cắt mặt phẳng, một khối |
| `honNguyen` | **0,44** | chùm tinh thể + cánh trắng |
| `tuLa` | 0,74 | chùm tinh thể đỏ, vẽ chi tiết hơn hẳn |

**Cái cần sinh:** 2 viên (`honNguyen`, `tuLa`) dựng lại theo khuôn bốn viên kia.

---

## 6. Chỗ gãy #6 — HAI MAP KHÔNG LÁT VIÊN, MỖI MAP HỎNG MỘT KIỂU

13/15 map khai `sanIso:true`. Hai map còn lại là hai phó bản, và chúng **không giống nhau**:

| map | nền là gì |
|---|---|
| `deep` (Tầng Sâu) | tranh sơn dầu `bg_dungeon_stone.jpg` kéo phủ kín — nền vẽ tay giữa 13 map lát viên |
| `lokhac` (Lò Khắc) | **không có tranh nào**: `MAP_BG` không khai, nên nó là một mảng màu đặc `#4a3a34` |

Bước qua cổng là đổi hẳn ngôn ngữ nền. `pvp` thì có lát viên nhưng mặt sàn bạc màu hơn mọi map
khác (bộ `nen_sanda`/`nen_sanmai` cố ý sẫm và lạnh — xem CLAUDE.md).

**Cái cần sinh: gần như không có.** Bộ viên hang (`nen_hang1-4` + `vet_hang1-2`) **đã có sẵn và
đang chạy ở Bug Tribe Tunnels**; khai `sanIso` + `isoDat:['nen_hang1'…]` cho `deep` và `lokhac`
là hai map ấy về cùng ngôn ngữ với phần còn lại — **một dòng dữ liệu mỗi map, 0 art mới**.

## 7. Năm hố ĐỘ PHỦ — xếp theo "bao nhiêu người chơi gặp phải"

### ① Vũ khí — **19 tấm cho 196 tổ hợp**. Hố lớn nhất của cả game.

`VK_ANH` có đúng 19 khoá. Bảy dòng có ảnh chung cho **cả 14 giai** (một cây kiếm giai 1 và giai
14 là **cùng một tấm**); chỉ `quyentruong` có 7 giai vẽ riêng.

**Sáu dòng KHÔNG có một tấm nào** ⇒ rơi thẳng vào ô chờ art `iaChuaArt`:

| dòng trống | dòng có art |
|---|---|
| `riu` · `chuy` · `cungngan` · `songdao` · `bua` · `kich` | `kiem` `daikiem` `makiem` `gay` `quyentruong` `lenhtruong` `no` (+`truongcung|7`) |

Cộng cả `truongcung` (chỉ có đúng `truongcung|7`, không có tấm lùi cho 13 giai còn lại) thì
**97/196 tổ hợp rơi vào ô chờ art**.

**Đặt đợt 1: 7 dòng × 5 nấc chất liệu** (da → sắt → thép → vảy rồng → hắc nguyệt, đúng
`ITEM_NAMES`) = **35 tấm**, đóng trọn 97 tổ hợp đang trống. Đợt 2: nâng 7 dòng đang dùng chung
một tấm cho cả 14 giai lên đủ 5 nấc = 28 tấm nữa.

### ② Giáp trên người — **7/70 tổ hợp (10%)**

`NV_GIAP` khai đúng 7 khoá, và **5 trong 7 là giai 7**:

```
thieulam|1 thieulam|7   baidasan|1 baidasan|7   minhgiao|7   toanchan|7   bug|7
```

Nghĩa là **giai 2-6 và 8-14 của cả năm lớp không có bộ giáp nào** — người chơi mặc đồ suốt
90% hành trình mà thân không đổi. Đây là lỗ thủng của Quy tắc số 3 nằm ngay trong `drawPlayer`.

**Đặt: 5 lớp × 3 dải giữa (giai 3 · 5 · 10)** = **15 gói Spine**, ưu tiên `minhgiao` và `bug`
(hai lớp hiện chỉ có đúng một bộ).

### ③ Chiêu có tranh thật — **11/40**

40 chiêu tung được (30 chiêu lớp + 5 lớp × 2 chiêu hệ thống). `CHIEU_TRANH` có 11.

**⚠ Spellblade là lớp DUY NHẤT không có tranh thật cho một chiêu nào:** `sx_minhgiao_a` và
`sx_minhgiao_c` đều còn vẽ thủ tục. `sx_baidasan_a` cũng trống.

**Đặt (theo thứ tự): 3 tấm dán hệ thống** (`sx_minhgiao_a` · `sx_minhgiao_c` · `sx_baidasan_a`)
— đây là chiêu người chơi bấm nhiều nhất trong đời nhân vật. Rồi 29 chiêu lớp còn lại.

### ④ Tướng Quân — **2/11 có tranh riêng**

40 con trùm chia nhau **18 tạo hình đi mượn**: `mocnhan` một mình gánh 5 con, khung xương
`wraith` gánh 6, `knight` gánh 5. Chỉ `tq_corran` và `tq_daohoa` có `anh:` riêng — mà hai tấm ấy
lại chính là hai con lạc phong cách ở mục 4.

**Đặt: 9 tấm Tướng Quân** theo đúng khuôn đàn quái (200×200, nét bao, `lệch ≥ 0,12`), một con
mỗi map. Đặc tả sẵn ở `docs/DAT_HANG_ART_3_4_5.md` và `docs/PROMPT_QUAI_VA_TUONGQUAN.md`.

### ⑤ Tám hướng nhìn — **`NV_BANVE` RỖNG, 0%**

Máy tám hướng đã dựng xong và có bài gác (`test_huongnhin`, quét 720 góc), nhưng **không một bộ
nào khai bản vẽ hướng**. Cả năm lớp chạy đúng một bản nghiêng, lật ngang.

**Đặt: 5 lớp × 2 bản (Bắc `b` + Nam `n`)** = **10 gói**. Tám hướng chỉ tốn năm bản vẽ; ở đây
bản nghiêng đã có, nên chỉ thiếu hai.

---

## 8. Cái KHÔNG gãy — ghi ra để khỏi sửa nhầm

- **Khung giao diện: đồng nhất.** 13 bảng đều khung kim loại gothic nâu-vàng vát cạnh. Bảng
  Bản Đồ là giấy da xanh — khác, nhưng đọc ra **cố ý** chứ không ra lạc.
- **Icon vật phẩm: đồng nhất.** 48 icon (vũ khí · dây chuyền · nhẫn) cùng nét bao đen dày, cùng
  bảng màu kẹo. Lạc đàn chỉ **6 tệp nguyên liệu**: `mat_bac` (vòng xám phẳng, không nét bao) ·
  `mat_phu` · `mat_tanquyen` (giấy da tả thực) · `mat_manhtrangbi` · `mat_honnguyen` ·
  và `pet.png` — **một tấm minh hoạ chữ nhật có nền**, không phải icon.
- **Vật thể iso: đồng nhất tuyệt đối** với nhau (87 tệp, cùng một lượt nướng).
- **Đàn thú hoang: đồng nhất** với con Axie (bão hoà 0,568 vs 0,606) — cùng kit, đúng như thiết kế.
- **Màn chờ Lunacia: đồng nhất**, 10 lớp cùng một gói.
- **0 lỗi 404** trên toàn bộ đường chạy.

---

## 9. Tệp chết trên đĩa — đã chứng minh, không phải suy

| tệp | vì sao chết |
|---|---|
| `mobs/boss_hacphong.png` · `boss_tinhhoa.png` · `boss_sontac.png` | `spawnZoneBoss` xoá `def.img` khi kế thừa `skel`; lái 40 trùm × 11 map ⇒ 0 lượt xin |
| `maps/bg_*.jpg` — 10 tấm (~4,2 MB) | 12 map ngoài trời nay `sanIso`; chỉ còn 4 tấm được `MAP_BG` trỏ tới |
| `pets/*.png` — 3 tấm | không một chỗ nào trong mã nhắc tới `assets/pets/` |
| `trees/*.png` — 8 tấm (~1,5 MB) | đường mã còn sống (`TREE_IMGS`) nhưng không map nào đi qua |

Tổng ~6 MB. ⚠ **Đừng suy rộng ra cả 265 tệp "chưa được xin"** trong lượt quét: phần lớn là bảng
khung **nạp lười** theo con Axie / theo chiêu (chimera 125 · avatar 41 · vfx 15), tức chúng chỉ
chưa được kích hoạt trong lượt đo, không phải chết.

---

## 10. Thứ tự đề nghị

| # | việc | tốn gì | chạm tới ai |
|---|---|---|---|
| 1 | Nét bao + no màu cho **viên lát và vật thể iso** | chạy lại công cụ nướng, **0 art mới** | mọi khung hình, 12 map |
| 2 | Chỉnh tông lớp `nv/` lên ngang con Axie | chạy lại `nuong_nv.py`, **0 art mới** | mọi người chơi, mọi lúc trong thành |
| 3 | **6 icon chiêu** vẽ lại theo họ sáng | 6 tấm | 2/5 lớp, mỗi giây chơi |
| 4 | **35 tấm vũ khí** cho 7 dòng đang trống | 35 tấm | mọi người chơi bốc trúng 6 dòng ấy |
| 5 | **3 tấm dán chiêu hệ thống** (Spellblade ×2, Dark Wizard ×1) | 3 gói khung | 2/5 lớp |
| 6 | **15 bộ giáp** giai giữa | 15 gói Spine | mọi người chơi, giai 2-6 |
| 7 | **9 Tướng Quân** | 9 tấm | mốc đóng chương của 9 map |
| 8 | **10 bản vẽ hướng Bắc/Nam** | 10 gói | mọi người chơi |
| 9 | Dọn: `boar` · 2 viên ngọc · 6 icon nguyên liệu · xoá ~6 MB tệp chết | 9 tấm | lẻ tẻ |

**Việc 1 và 2 không cần một tấm art mới nào** và chúng đóng đúng hai chỗ gãy lớn nhất.
