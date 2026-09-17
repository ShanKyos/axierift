# Prompt art — bốn vật thể đầu của Đất Riêng

> Dán thẳng vào Gemini. Đặc tả cơ chế: `docs/DAT_RIENG_MAY_DAT.md`.
>
> **Mọi con số dưới đây ĐO TỪ ĐƯỜNG NƯỚNG ĐANG CHẠY** (`tools/iso/nuong_tile.py`), không phải
> ước lượng — vì art mới phải đứng cạnh 63 sprite đã có mà không lộ ra là hàng khác lò.

## §0 — Bốn món, và mỗi món làm gì trong game

| mã | tên | loại | chiếm chỗ | khung đích |
|---|---|---|---|---|
| `luong` | Luống Đất | **chức năng** (vào ô có sẵn) | đúng **1 viên** | ~280×200 |
| `ao` | Ao Cá | **chức năng** | ~1,5 viên | ~400×260 |
| `bonhoa` | Bồn Hoa | trang trí (đặt tự do) | ~0,4 viên | ~140×150 |
| `hangrao` | Hàng Rào | trang trí | 1 cạnh viên | ~180×160 **×2 hướng** |

⚠ **Hàng rào cần HAI bản vẽ, không phải một.** Lưới isometric có hai hướng cạnh; hai hướng còn
lại lật ngang là ra. Vẽ một bản rồi xoay trong Photoshop là ra một hàng rào **sai phép chiếu** —
trong phép chiếu 2:1 thì xoay 90° không phải là lật.

## §1 — Khối kỹ thuật, DÁN NGUYÊN VĂN vào mọi prompt

Viết bằng tiếng Anh vì mô hình ảnh bám chỉ dẫn tiếng Anh chặt hơn hẳn — nội dung game vẫn tiếng
Việt, đây chỉ là câu lệnh cho công cụ.

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

⚠ **Nền tím thay vì "nền trong suốt".** Đã cân nhắc: mô hình ảnh trả PNG trong suốt rất không
đều tay, còn một nền phẳng một màu thì cắt bằng máy là dứt điểm. Và phải là màu **không có trên
vật** — tím sen không xuất hiện ở đất, gỗ, nước hay hoa.

## §2 — Bốn prompt

Mỗi cái: dán khối §1 trước, rồi dán đoạn dưới.

### `luong` — Luống Đất

```
SUBJECT: a single tilled garden bed, seen from above at an isometric angle.

A low rectangular mound of freshly turned dark soil, its top surface a flat diamond that
matches one floor tile exactly. Three or four parallel furrows are raked across the top.
The soil is dark and damp — a rich chocolate brown, distinctly darker and cooler than the
surrounding dry earth — with a few small pebbles and a crumbly, loose texture.

The bed is held in by a low edging of four rough-hewn timber planks, one per side, pegged at
the corners with wooden stakes. The wood is warm, sun-bleached, softly rounded at the edges
like a toy — not sharp, not weathered, not grey.

Nothing is planted in it yet. The bed is empty and ready.

Height: very low. The timber edging rises only about a fifth of the tile's width.
```

### `ao` — Ao Cá

```
SUBJECT: a small ornamental fish pond, seen from above at an isometric angle.

An irregular rounded pool of clear water, sunk slightly into the ground, ringed by a low kerb
of smooth river stones in mixed warm greys and soft tans. The stones are rounded and chunky,
stacked one course high, with visible gaps where a little moss shows through.

The water is bright turquoise, semi-transparent near the kerb and deepening to a rich teal in
the middle. A few soft highlight ripples catch the sun. Two or three flat lily pads float on
the surface, one with a small pink bloom. No fish visible.

Height: very low — the stone kerb is the tallest part, roughly a sixth of the pond's width.
The pond footprint is about one and a half floor tiles across.
```

### `bonhoa` — Bồn Hoa

```
SUBJECT: a single small flower planter, seen from above at an isometric angle.

A chunky hexagonal pot of glazed terracotta, warm coral-orange, with a thick rolled rim and a
simple band of pale carved trim around its middle. It sits directly on the ground.

Spilling out of it is a generous round cushion of flowers — small rounded blooms in soft pink,
cream and butter yellow — nestled in bright fresh-green leaves. The mass of flowers is about
as wide as the pot and domed on top, reading clearly as a single soft shape rather than
individual stems.

Height: about two thirds of a floor tile's width, pot and flowers together. This is a small
decorative object, not a large planter.
```

### `hangrao` — Hàng Rào (làm HAI lần, xem chú thích)

```
SUBJECT: a single short section of garden fence, seen from above at an isometric angle.

Three or four rounded wooden pickets, warm honey-coloured timber with softly domed tops, held
together by two horizontal rails across their backs. The pickets are chunky and slightly
irregular in height, like hand-cut wood in a storybook — not machine-straight, not sharp, not
splintered. The joints show small dark wooden pegs.

The section is a straight run, standing upright on the ground. Both ends are open (no posts,
no gate) so that copies of it placed end to end will read as one continuous fence.

Height: about half a floor tile's width. Length: it spans exactly one edge of a floor tile.
```

**Hai lần, đổi đúng một câu:**

| bản | thêm câu này vào cuối |
|---|---|
| `hangrao_a` | `The fence runs along the tile edge that goes from the lower-left of the image toward the upper-right.` |
| `hangrao_b` | `The fence runs along the tile edge that goes from the lower-right of the image toward the upper-left.` |

## §3 — Đưa về đây rồi làm gì

Gửi lại **PNG gốc, đừng cắt tay**. Bước cắt nền tím + đo toạ độ chân (`ISO_NEO`) + ghi vào
`public/game/data/iso.js` phải chạy bằng máy: neo lệch vài điểm ảnh là vật thể **lún xuống đất
hoặc treo lơ lửng**, mà mắt nhìn chỉ thấy "hình như hơi lạ".

⚠ Và neo phải ghi vào **`public/game/data/iso.js`** — tệp mà `index.html` thật sự nạp. Bước
"nướng ra một chỗ rồi chép sang chỗ khác" đã có lần bị quên và **sáu map mất sạch cây** suốt
nhiều phiên, không một lỗi nào in ra.

## §4 — Một lối khác, nói ra để chọn chứ không phải để thay

Bốn món này nằm **đúng trong tầm** của đường nướng Blender đã chạy (`tools/iso/nuong_biome.py`
đã dựng cây, đá, bụi, đống lửa, lều, thùng). Đi đường đó thì phép chiếu, hướng nắng và tông
bóng **đúng tuyệt đối vì cùng một cảnh, một camera** — không phải nghiệm thu bằng mắt.

Đổi lại: mô hình dựng bằng mã thì mộc, không có hoa văn glaze hay cánh hoa mềm như prompt trên
mô tả.

⇒ **Gemini nếu muốn art giàu hơn; Blender nếu muốn chắc ăn.** Không cần chọn ngay — cứ thử
Gemini trước, nhìn bốn tấm rồi quyết.
