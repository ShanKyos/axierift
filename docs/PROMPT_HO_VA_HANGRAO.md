# Đặt hàng art — HỒ NƯỚC và HÀNG RÀO cho Sapidae Chiefdom

> Dán thẳng vào Gemini. Khối kỹ thuật §1 là **bản sao nguyên văn** của
> `docs/PROMPT_DAT_RIENG_ART.md §1` — đừng viết lại bằng lời của mình, hai bản lệch nhau một
> chữ là hai lò art khác nhau đứng cạnh nhau trong cùng một khung hình.
>
> Máy đã dựng xong, **thả tệp vào là chạy**: `assets/iso/` + xoá tên khỏi `MAP_VAT_CHO`.

---

## §0 — Hai món này đi hai ĐƯỜNG KHÁC NHAU trong máy, và đó là chỗ dễ nhầm nhất

|  | hồ nước | hàng rào |
|---|---|---|
| khai ở | **`vatSan`** | **`vatTo`** |
| xếp lớp | **không xếp** — vẽ ngay sau mặt đất, trước mọi thực thể | theo **chân ảnh** (`y + h`) |
| vì sao | một cái hồ **không có chiều cao** để che ai. Xếp nó theo chân thì người đứng ở bờ BẮC bị mặt nước vẽ đè lên — tức đứng dưới đáy hồ | hàng rào **cao**. Người đứng sau nó phải bị nó che, đúng chiều sâu tranh isometric |
| chặn chân | `can:[[dx,dy,w,h]]` khai ngay trong mục | `VAT_CAN` sinh bằng `tools/iso/can_vatto.py` |

⇒ **Đừng khai hồ vào `vatTo`.** Đó là lỗi duy nhất của đợt này mà nhìn ảnh chụp không ra ngay:
nó chỉ lộ khi có người đứng ở bờ bắc.

---

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

## §2 — HỒ NƯỚC · `san_ho`

### Khổ và chỗ đứng — đã chốt trong mã, đừng đổi khi vẽ

| | |
|---|---|
| tệp | `assets/iso/san_ho.png` |
| khổ đích | **640 × 360** (máy vẽ 1:1, không co giãn) |
| chỗ đặt | `ardhaven (5020, 1760)` — góc đông-nam, giữa đại lộ y1600 và hàng nhà nam |
| mặt nước chặn | `can:[[110, 85, 420, 190]]` — **35% khung**, phần còn lại là bờ cỏ đi được |

Chỗ đặt **quét bằng máy**, không chấm tay: bốn góc + tâm trong đa giác sàn · lề ≥60px tới mọi
khối nhà và mọi `vatTo` · không nuốt NPC nào (lề 120) · cách mọi cổng/portal ≥200px · cách điểm
thả ≥260px · không chắn ngang một đoạn `isoDuong` nào. Cả thành **chỉ còn 106 ô thoả ở khổ
640×360**, và cụm duy nhất nằm đúng ở góc đông-nam. Muốn dời thì quét lại.

### Prompt (dán §1 trước, rồi đoạn này)

```
SUBJECT: a small town pond, seen from above at an isometric angle. Wide and shallow, about
twice as wide as it is deep on screen.

The water is a rounded, slightly irregular oval — not a perfect ellipse, the bank bulges in
and out gently. Bright turquoise at the rim where the bottom shows through, deepening to a
rich teal in the middle. A few soft crescent highlight ripples catch the sun near the centre.
The surface is calm; no waves, no foam, no waterfall.

Around the water is a bank of short bright grass, sloping down to the waterline. Set into the
bank, low and partly sunk, is a loose kerb of smooth river stones in mixed warm greys and soft
tans — rounded, chunky, one course high, with gaps where grass and a little moss push through.
The kerb does not go all the way round: it is heavier on the near side and thins out at the
back.

On the bank: three or four clumps of tall slender reeds, a couple of flat lily pads floating
near one edge (one with a small pink bloom), and two or three larger rounded boulders resting
half in the grass. Nothing else — no fish, no boat, no jetty, no bucket, no bridge, no people.

HEIGHT: this object is FLAT. Nothing in it stands up except the reeds and the boulders, and
even those are low — no taller than a quarter of the pond's width. It must read as a hole in
the ground filled with water, seen from above, not as a raised basin.
```

### ⚠ Và nếu định LÀM VIDEO từ tấm này — đọc trước khi bấm render

Đường nướng `tools/nuong_video.py` **ĐO trước rồi mới nhận** (`--do` in ra `nền±` · `trôi` ·
`vụn`) và nó **từ chối** video không phải nền phông. Video con goblin đợt trước trượt đúng ba
chỗ này. Bốn điều kiện, thiếu một là tấm nướng ra hỏng:

1. **Nền phải GIỮ NGUYÊN tím phẳng `#FF00FF` suốt mọi khung.** Công cụ tách theo sắc
   (`min(R,B) − G`), nên một nền "được vẽ thêm mây/ánh sáng cho đẹp" là mất sạch đường cắt.
2. **Máy quay ĐỨNG YÊN TUYỆT ĐỐI.** Không zoom, không pan, không rung. Mọi khung cắt vào **một
   hộp chung**; máy quay trôi là con vật nhảy chỗ mỗi khung.
3. **Cái hồ không được đổi cỡ, đổi chỗ hay đổi hình bờ.** Chỉ MẶT NƯỚC và LÁ SẬY động.
4. **Lặp liền mạch** — khung cuối phải nối được vào khung đầu. Hồ nước là thứ chạy 100% thời
   gian trên màn; một cú giật mỗi vòng lặp thì mắt bắt ngay.

Câu lệnh cho công cụ làm video:

```
Animate ONLY the water surface and the reeds. Locked-off camera: no zoom, no pan, no camera
shake, no parallax. The pond, the stones, the grass bank and the boulders must stay pixel-for
-pixel identical in every frame — do not redraw them, do not move them, do not change their
size. The magenta background must stay flat #FF00FF and must not be animated, lit or clouded.
Gentle slow ripples spread across the water, the highlights drift, the reeds sway a little in
the breeze. Seamless loop: the last frame must flow back into the first. 2-3 seconds.
```

Nhận video xong:

```bash
python3 tools/nuong_video.py <video.mp4> --do                       # ĐO TRƯỚC — đừng bỏ bước này
python3 tools/nuong_video.py <video.mp4> \
        public/game/assets/iso/kh/san_ho.webp --ten san_ho
```

⚠ Công cụ in ra dòng *"dán vào **NPC_KHUNG**"* — với cái hồ thì **KHÔNG** dán vào đó. Lấy đúng
phần `{ cot, hang, khung, oRong, oCao, fps }` (bỏ `neoY`, vật sàn không neo chân) rồi dán thành
trường `khung:` của mục `san_ho` trong `vatSan` của `data/canbang.js`. **Tấm tĩnh `san_ho.png` vẫn bắt buộc**: bảng khung nạp
lười, thiếu tấm lùi là mặt đất thủng một lỗ đúng chỗ cái hồ trong mấy trăm mili giây đầu — cùng
hợp đồng với `MOB_KHUNG` và `NPC_KHUNG`.

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
python3 tools/iso/cat_congtrinh.py <ảnh gốc> san_ho --o 2.5      # cắt nền tím, ép 2:1
python3 tools/iso/cat_congtrinh.py <ảnh gốc> rao_a  --o 1
```

`--o` là **chân đế chiếm mấy ô đất** (1 ô = 256px), tức nó quyết cỡ ảnh ra — không phải một
tuỳ chọn trang trí. Hồ rộng 640px ⇒ `2.5`; một đoạn rào 256px ⇒ `1`.

Rồi đúng hai bước, không sửa một dòng mã nào:

1. thả tệp vào `public/game/assets/iso/`;
2. **xoá tên khỏi `MAP_VAT_CHO`** trong `game.js` (hàng rào thì thêm tên vào `MAP_VAT_SRC` như
   `san_ho` đã có sẵn).

Kiểm ngay sau đó: `bash tools/reg.sh` — `test_vatcan §4` gác chuyện mặt nước có thật sự chặn
chân và hộp chặn có nhỏ hơn tấm ảnh không; `test_capnha` gác cặp nhà↔NPC.
