# Đặt hàng art — ĐÀI PHUN NƯỚC và HÀNG RÀO cho Sapidae Chiefdom

> Dán thẳng vào Gemini. Khối kỹ thuật §1 là **bản sao nguyên văn** của
> `docs/PROMPT_DAT_RIENG_ART.md §1` — đừng viết lại bằng lời của mình, hai bản lệch nhau một
> chữ là hai lò art khác nhau đứng cạnh nhau trong cùng một khung hình.
>
> Máy đã dựng xong, **thả tệp vào là chạy**: `assets/iso/` + xoá tên khỏi `MAP_VAT_CHO`.

---

## §0 — Cả hai món đi CHUNG một đường: `vatTo`

Đài phun nước **không** đi một lớp phẳng, và đây là chỗ tôi đã làm sai một lần rồi sửa: yêu cầu
đầu nghe là "một cái hồ nước" nên tôi dựng hẳn một lớp vẽ-trước-mọi-thực-thể cho nó. Nhưng cột
nước bắn lên rồi toả ra là thứ **CÓ CHIỀU CAO** — người đứng phía BẮC nó phải bị che, mà lớp
phẳng kia làm đúng điều ngược lại (vẽ người đè lên cột nước).

**Cửa quyết định là một câu:** *đứng sau nó thì có bị nó che không?* Có ⇒ `vatTo`, và `vatTo`
là lớp duy nhất đang có. Nó xếp theo **chân ảnh** (`y + h`), nên hợp đồng neo cho cả hai món
dưới đây là như nhau:

> **mép DƯỚI ảnh = đường chân · tim ngang ảnh = tim vật.**

| | đài phun nước | hàng rào |
|---|---|---|
| tệp | `assets/iso/ct_dainuoc.png` | `assets/iso/rao_a.png` · `rao_b.png` · `rao_goc.png` |
| khổ | **384 × 360** | 256×220 · 256×220 · 170×240 |
| chặn chân | `can:[[70,170,244,170]]` — **30% khung**, chỉ cái BỂ | `VAT_CAN` sinh bằng `tools/iso/can_vatto.py` |
| hoạt ảnh | **có** (`khung:` → `assets/iso/kh/ct_dainuoc.webp`) | không |

## §1 — Khối kỹ thuật, DÁN NGUYÊN VĂN vào **mọi** prompt dưới đây

```
TECHNICAL SPEC — follow exactly, this asset must sit next to 63 existing sprites:

PROJECTION: true 2:1 isometric. Orthographic camera (NO perspective, no vanishing point),
rotated 45 degrees around the vertical axis and tilted so that the ground plane reads as a
2:1 diamond — a square floor tile is exactly twice as wide as it is tall. Parallel edges
must stay parallel all the way across the object.

LIGHTING: one sun, high in the sky (58 degrees above the horizon), coming from behind and
slightly to the left of the viewer. The contact shadow is SHORT and falls toward the
UPPER-RIGHT of the image, roughly as long as the object is tall. Shadow is soft-edged and
tinted cool blue (ambient sky light is #57709E), never neutral grey and never black.

STYLE: clean 3D render, soft matte surfaces, gentle ambient occlusion. NO black outlines,
NO cel-shading, NO painterly brush strokes. Bright, saturated, warm-leaning "candy" colours
like Axie Infinity art — never muted, never realistic-forest tones. For reference, the grass
these objects stand on is #709E4C and the bare earth is #C29E6B.

FRAMING: one single object, centred, filling the frame with a small margin. Include its cast
shadow inside the frame. Nothing else in the picture — no ground plane, no grass, no
background scenery, no other props, no text, no labels, no UI.

BACKGROUND: solid flat magenta #FF00FF, perfectly uniform, so it can be keyed out. Do not
put any magenta anywhere on the object itself.
```

⚠ **Nền tím thay vì "nền trong suốt".** Mô hình ảnh trả PNG trong suốt rất không đều tay, còn
một nền phẳng một màu thì cắt bằng máy là dứt điểm. Và phải là màu **không có trên vật** — tím
sen không xuất hiện ở đất, gỗ, nước hay hoa.

---

## §2 — ĐÀI PHUN NƯỚC · `ct_dainuoc`

### Khổ và chỗ đứng — đã chốt trong mã, đừng đổi khi vẽ

| | |
|---|---|
| tệp | `assets/iso/ct_dainuoc.png` (+ `assets/iso/kh/ct_dainuoc.webp` khi có video) |
| khổ đích | **384 × 360** (máy vẽ 1:1, không co giãn) |
| chỗ đặt | `ardhaven (3300, 1020)` — rìa đông Quảng Trường Atia, bắc đại lộ |
| bể chặn chân | `can:[[70, 170, 244, 170]]` — **30% khung**; phần trên là KHÔNG KHÍ, đi sát được |

Chỗ đặt **quét bằng máy**, và quét **trong trình duyệt** chứ không đọc tệp: NPC của ardhaven
khai ở HAI nơi (`data/canbang.js` *và* hai lượt `NPCS.push` trong `game.js`), nên bộ quét đọc
tệp chỉ thấy 19/28 con — lượt đầu nó đã chấm cái đài đè thẳng lên `monkhach`. Ràng buộc: bốn
góc + tim bể trong đa giác sàn · lề ≥50px tới mọi khối nhà và `vatTo` · không nuốt NPC nào
(lề 90) · cách mọi cổng/portal ≥220px · không đè điểm thả · không chắn ngang `isoDuong`.
**1.094 ô thoả**; lấy ô gần điểm thả nhất (681px) vì đài phun nước là mốc định hướng của quảng
trường.

### Prompt (dán §1 trước, rồi đoạn này)

```
SUBJECT: an ornamental town fountain, seen from above at an isometric angle. It stands alone
on nothing — no ground, no paving, no grass around it.

The basin is a wide, shallow, round stone bowl, low to the ground, built of smooth pale
limestone blocks with softly rounded edges — chunky and toy-like, not sharp, not weathered,
not grey. Its rim is a single thick ring you could sit on. The bowl is filled with bright
turquoise water, deepening to teal at the centre, with a few soft crescent highlights.

Rising from the middle of the basin is a short, sturdy carved pedestal of the same pale stone
— a stepped column with a simple rounded moulding, no statue, no figure, no animal, no face.

From the top of the pedestal a jet of water SHOOTS STRAIGHT UP into the air, then arcs OUTWARD
IN ALL DIRECTIONS in several separate curved ribbons, falling back into the basin around the
whole circle — a classic tiered fountain plume. The water is bright and translucent, catching
the sun, with small round droplets and a light mist where the ribbons break. The plume is the
tallest part of the object: it rises roughly as high above the rim as the basin is wide across
its radius.

Nothing else in the frame — no coins, no fish, no lamp posts, no benches, no plants, no birds,
no people, no railings.

PROPORTION: the basin occupies the bottom of the frame and the water plume fills the upper
half. Everything above the basin rim is water and air — the object must read as mostly open,
not as a solid tower.
```

### ✅ ĐÃ VÀO GAME — và đây là những gì video thật đã dạy

Video chủ dự án gửi (`24fps · 10,01s · 1280×720`) **dùng được, nhưng chỉ 120/240 khung đầu**.

| đo cái gì | kết quả |
|---|---|
| bề ngang BỂ ĐÁ qua cả đoạn | **274px đứng yên** khung 0-119 → phình 274→532 (khung 120-150) → sát ở 532 tới ~215 → rút về 274 |
| viền nền (magenta) | 134-144 ở đoạn khoá · **tụt xuống −29** lúc máy quay áp sát (hết nền để cắt) |
| điểm nối vòng mượt nhất | **N=24 (1,00s)** — lệch 4,26 so với sàn nhiễu 0,44; thử mọi N từ 24 tới 116 |

⇒ cắt 24 khung đầu → nướng 12 khung → phát ở **fps 12** = đúng tốc độ gốc.

**⚠ `--do` BÁO "MÁY QUAY ĐỘNG 91px" TRÊN BẢN ĐẦY ĐỦ, và con số đó ĐÚNG nhưng không đủ để kết
luận.** Nó đo tâm khối ĐẶC — mà một cột nước phồng lên xẹp xuống thì tâm khối dịch dù máy quay
khoá cứng. Phải bám theo phần **phải đứng yên** (bể đá) mới tách được hai chuyện. Trên đoạn đã
cắt: trôi 17px và **chân từng khung lệch 0px** — máy quay khoá thật.

**⚠ LÒ SINH VIDEO NƯỚNG BÓNG ĐỔ THÀNH MỘT MẢNG ĐẶC, và nó sống sót qua bộ tách nền.** Trên nền
magenta thì cái bóng là magenta-TỐI; bộ tách gỡ đúng nền phẳng, mảng tối kia ở lại rồi qua bước
khử viền hồng thành **một vũng xanh-tím ĐỤC (alpha 255)** nằm cạnh bể. Chụp ra là một vết mực
trên nền đá. Đo ba công trình đang chạy (`ct_duoc` · `ct_quantro` · `ct_loren`): điểm bóng chiếm
**0,0-0,4%** — tức quy ước của dự án là **cắt SÁT VẬT, không nướng bóng**. Gỡ bằng
`python3 tools/iso/bo_bong.py <tệp…>` (chạy trên cả tấm tĩnh lẫn bảng khung).

**⚠ VÀ PHÉP GỠ BÓNG BẢN ĐẦU ĂN THỦNG MẶT NƯỚC.** Cửa nhận diện theo MÀU (lam · tối · G≥R) cũng
khớp với vùng nước sẫm trong lòng bể: đo được **lòng bể thủng 5,2%**, và trong game thì NPC đứng
phía sau **lộ qua mặt nước**. Bóng thì CHẠM nền trong suốt, nước thì bị thành đá bao kín — nên
`noi_ra_ngoai()` chỉ giữ mảng nối ra được nền. Sau khi sửa: thủng **0,00%**.

*Luật chung: một cửa nhận diện theo MÀU sẽ luôn bắt nhầm một vùng cùng màu ở chỗ khác. Thêm một
ràng buộc HÌNH HỌC (nối ra ngoài / bị bao kín) là thứ tách được hai vùng ấy.*

### ⚠ Nếu phải render lại video — ba điều kiện

1. **Nền GIỮ NGUYÊN tím phẳng `#FF00FF` suốt mọi khung** — và **máy quay ĐỨNG YÊN cả đoạn**,
   không zoom vào rồi zoom ra như bản vừa rồi. Cái đó ăn mất một nửa số khung.
2. **ĐỪNG vẽ bóng đổ** — nó nướng thành mảng đặc rồi phải gỡ bằng máy. Bỏ câu
   *"Include its cast shadow inside the frame"* khỏi khối kỹ thuật §1 khi đặt hàng thứ CÓ
   BÓNG TO (đài phun nước, cây); giữ nó cho vật nhỏ thì vô hại.
3. **Mạch nước ĐỀU, lặp liền mạch.** Bảng khung lặp vô hạn: chu kì càng có cao trào thì càng
   lộ ra là một đoạn băng đang tua lại.

---

## §3 — HÀNG RÀO · cần **BA** tấm, không phải một

⚠ **Lưới isometric có HAI hướng cạnh, và lật ngang KHÔNG cho ra hướng kia.** Nguồn sáng cố định
(mặt trời sau-trái); lật một đoạn rào vẽ cho hướng này để lấy hướng kia là lật luôn cả mặt sáng
sang phía sai. Vẽ một bản rồi xoay 90° trong Photoshop còn tệ hơn: trong phép chiếu 2:1, xoay
90° **không phải** là lật. Đây là bài học đã ghi trong `PROMPT_DAT_RIENG_ART.md`.

| mã | tệp | khổ | việc |
|---|---|---|---|
| `rao_a` | `assets/iso/rao_a.png` | **256 × 220** | đoạn chạy theo cạnh **xuống-phải** |
| `rao_b` | `assets/iso/rao_b.png` | **256 × 220** | đoạn chạy theo cạnh **xuống-trái** |
| `rao_goc` | `assets/iso/rao_goc.png` | **170 × 240** | cột góc, chỗ hai hướng gặp nhau |
| `rao_cong` *(tuỳ)* | `assets/iso/rao_cong.png` | **320 × 260** | một quãng HỞ có hai cột đầu — lối ra vào |

**Hợp đồng neo, giống hệt công trình:** mép **DƯỚI** ảnh = đường chân rào, **tim ngang** ảnh =
tim hàng rào. Hàng rào vào `vatTo` nên nó tự xếp lớp theo chân — người đi phía sau bị che, đi
phía trước thì che nó, không phải khai gì thêm.

**Điều kiện sống còn: hai tấm chạy phải NỐI ĐƯỢC ĐUÔI NHAU.** Mép trái và mép phải phải cắt
**đúng giữa một khoảng hở** và ở **cùng một độ cao**, để xếp liên tiếp ra một hàng rào liền
mạch chứ không ra một dãy đoạn rời có khe. Đây là chỗ hay quên nhất, và nó chỉ lộ ra khi đã
xếp ba đoạn cạnh nhau trong game.

### Prompt `rao_a` (dán §1 trước)

```
SUBJECT: one straight section of a low wooden garden fence, seen from above at an isometric
angle, running from the upper-left of the frame down to the lower-right along one edge of the
isometric grid.

Four square posts of warm sun-bleached timber, evenly spaced, each with a softly chamfered
top. Two horizontal rails run between them — one near the top of the posts, one lower down —
made of the same rounded, toy-like timber. The wood is warm honey-brown with soft grain, edges
gently rounded, never sharp, never grey, never weathered.

The fence is LOW: the posts stand only about as tall as a third of the section's width. It is
a boundary marker, not a palisade and not a stockade.

CRITICAL — this section must TILE: the run is cut exactly mid-gap at BOTH ends, at the same
height on both sides, so that placing copies end to end produces one continuous unbroken
fence with evenly spaced posts and no seam. Do not put an end post, a cap or a decorative
finial at either end.

A small tuft or two of grass at the base of a post is fine. Nothing else — no gate, no sign,
no rope, no lantern, no vines.
```

### Prompt `rao_b`

Y hệt `rao_a`, đổi đúng một câu:

```
... running from the LOWER-LEFT of the frame up to the UPPER-RIGHT along the other edge of
the isometric grid.
```

⚠ Và nhắc lại trong prompt: **giữ nguyên hướng mặt trời** (sau-trái, bóng đổ lên-phải). Bóng
của `rao_b` phải đổ về cùng phía với `rao_a`, nếu không hai hướng rào đứng cạnh nhau sẽ đọc ra
hai buổi chiều khác nhau.

### Prompt `rao_goc`

```
SUBJECT: a single corner post of the same low wooden garden fence, seen from above at an
isometric angle.

One square timber post, slightly thicker than the run posts, with a softly chamfered top and
a small carved cap. Two short rail stubs leave it — one heading down-right, one heading
down-left — each cut off cleanly after a hand's width so that a fence run can butt onto it
from either direction.

Same warm honey-brown timber, same rounded toy-like edges, same low height as the run posts.
Nothing else in the frame.
```

---

## §4 — Nhận tệp về thì làm gì

```bash
pip install scipy pillow numpy                                   # máy sạch KHÔNG có sẵn scipy
python3 tools/iso/cat_congtrinh.py <ảnh gốc> ct_dainuoc --o 1.5  # cắt nền tím, ép 2:1
python3 tools/iso/cat_congtrinh.py <ảnh gốc> rao_a  --o 1
```

`--o` là **chân đế chiếm mấy ô đất** (1 ô = 256px), tức nó quyết cỡ ảnh ra — không phải một
tuỳ chọn trang trí. Đài rộng 384px ⇒ `1.5`; một đoạn rào 256px ⇒ `1`.

Rồi đúng hai bước, không sửa một dòng mã nào:

1. thả tệp vào `public/game/assets/iso/`;
2. **xoá tên khỏi `MAP_VAT_CHO`** trong `game.js` (hàng rào thì thêm tên vào `MAP_VAT_SRC` như
   `ct_dainuoc` đã có sẵn).

Kiểm ngay sau đó: `bash tools/reg.sh` — `test_vatcan §4` gác chuyện cái BỂ có thật sự chặn chân
và hộp chặn có nhỏ hơn tấm ảnh không; `test_capnha` gác cặp nhà↔NPC.
