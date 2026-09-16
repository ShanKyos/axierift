# Prompt gen art bằng Gemini — NHÀ CỬA và VẬT PHẨM

Danh sách prompt copy-paste thẳng. Mỗi mục kèm **tên tệp phải đặt**, **lệnh nhập vào game**, và
**chỗ khai một dòng** — gen xong là cắm được, không phải hỏi lại.

Ba tài liệu liên quan, đừng viết lại nội dung của chúng ở đây:
`docs/DAT_HANG_ART_THANH.md` (đơn hàng thành, có §1 mặt đất đã xong) ·
`docs/PROMPT_MAP_ISOMETRIC.md` (vì sao map đi đường viên lát) ·
`docs/ART_VUKHI_SPINE.md` (vũ khí cắt từ gói Spine).

---

## 0. RÀNG BUỘC CHUNG — đọc một lần, nó là lý do mọi prompt viết như vậy

| Ràng buộc | Giá trị | Vì sao |
|---|---|---|
| Nền tách | **magenta `#FF00FF` đặc, phẳng** | Gemini gần như không bao giờ trả alpha thật. Magenta không có trong bảng màu Axie (art thiên xanh–vàng) nên tách bằng máy ra sạch; nền trắng ăn mất chỗ sáng của mái nhà và lưỡi kiếm. Ngưỡng tách đo được: nền ra sắc tím 210, vật liệu 20-24 — máy lấy 120, nằm giữa khoảng trống. |
| Phép chiếu (nhà cửa) | isometric **2:1** | Một ô đất vuông ra hình thoi 256×128px. |
| Phép chiếu (vũ khí) | **nhìn ngang, phẳng** | Vũ khí vẽ lên tay nhân vật, không phải đặt xuống đất. |
| Thang người | **132px** (`NV_CAO`) | Mọi vật đứng cạnh nhân vật đo theo số này. |
| Ánh sáng | một nguồn mềm từ **trên-trái** | Cả game theo một hướng. Sai hướng là món đồ đọc ra như dán lên. |
| Bảng màu | **Axie: no màu, kẹo, viền nâu ấm đậm (KHÔNG phải đen)** | Bài học đã trả giá: tông vải "thực tế" nướng ra cái lều XÁM đứng cạnh cỏ kẹo, đọc thành một tảng đá. |

**Bốn thứ CẤM tuyệt đối trong ảnh** — cả bốn đều đã từng lọt và phải dọn bằng tay:

1. **Không CHỮ, không số, không nhãn kích thước.** Gemini tưởng "768px" trong prompt là thứ phải
   vẽ ra, và đã vẽ đè lên bệ của `ct_loren`. Cũng không biển hiệu có chữ, không watermark.
2. **Không ký tự CJK** (Quy tắc số 1) — không hoa văn chữ Hán, không đèn lồng có chữ.
3. **Không BỆ, không sàn, không nền đất.** Chỉ một vệt bóng tiếp đất hình ê-líp mềm ngay dưới
   chân vật. Gemini vẫn hay thêm bệ dù prompt cấm — `tools/iso/don_congtrinh.py` bóc nốt, nhưng
   bóc xong phải **cộng bù độ lệch gốc mà nó in ra** vào `x`/`y`, không thì công trình tự dời chỗ.
4. **Không nhân vật, không sinh vật.** Nhân vật đã có đường riêng (gói Spine).

**Và một thứ cấm riêng cho vũ khí/trang bị: KHÔNG vẽ hào quang, không vẽ ánh sáng "+N".**
Game tự vẽ quầng rèn +7…+11 **hoàn toàn bên ngoài đường bao** món đồ. Nướng sẵn ánh sáng vào
tranh là hai lớp chồng nhau, +11 cháy trắng xoá.

> ⚠ **Cỡ là việc của chỗ NHẬP, không phải của prompt.** Ảnh Gemini trả 1024 hay 2048 không quan
> trọng; `cat_congtrinh.py --o` và `chuanhoavk.py` tự thu về đúng cỡ thế giới. Prompt chỉ cần
> đúng **tỉ lệ bên trong** một tấm (cái cửa so với thân nhà).

---

## 1. NHÀ CỬA — 13 khối còn trống ở Ardhaven

Thành có 16 khối `460×340`, **mới 3 khối có ảnh** (`ct_loren` · `ct_duoc` · `ct_vukhi`;
`ct_cong` dùng hết cho bốn cuống cổng). Toạ độ từng khối nằm cuối `MAPS.ardhaven.vatTo` trong
`public/game/data/canbang.js`.

### 1.1 Khối prompt CHUNG — giữ nguyên, chỉ đổi dòng `THE BUILDING:`

```
Isometric building sprite for a 2D game, true 2:1 dimetric projection (the
square ground footprint renders as a diamond exactly twice as wide as tall),
orthographic camera, no perspective convergence, viewed from the standard
front-left isometric corner.

LIVED-IN FEELING — the building belongs to a dense busy walled town:
roofs at several different heights and angles, each roof plane a slightly
different tone, cloth awnings and hanging banners breaking up the wall
faces, crates and barrels crowding the base of the walls, warm lit windows,
worn and weathered. Busy and used, NOT a clean showroom model.

FRAMING — EXACTLY ONE FREESTANDING BUILDING, complete and unclipped, alone
on the magenta with clear empty margin on all four sides. Do NOT draw
neighbouring buildings, adjoining walls, rooflines, or any part of another
structure. Do NOT crop or zoom in: the whole building including the full
roof ridge must fit inside the frame. Square 1:1 image.

ARCHITECTURE — western storybook fantasy: timber frame, cream plaster,
stone footings, shingle or terracotta tile, iron brackets. NO East Asian
architecture: no upturned curved eaves, no pagoda roofs, no paper lanterns,
no calligraphy, no East Asian ornament of any kind.

THE BUILDING: <<<ĐỔI DÒNG NÀY>>>

Output 1024x1024, the building centered, its ground footprint a diamond about
768 wide and 384 tall, the roof rising above that. Background pure magenta
#FF00FF, completely flat, no gradient.

Scale anchor: the door opening must be 150px tall — a person is roughly the
height of one and a half door widths. Draw the door.

Art style: Axie Infinity. Soft rounded chunky shapes, thick warm-dark-brown
outline (NOT black), cheerful saturated candy palette, gentle cel shading,
storybook charm. Slightly oversized friendly proportions — stubby, welcoming,
never grim or gothic.

Lighting: single soft light from upper-left. Add a soft elliptical contact
shadow directly under the footprint only, no cast shadow reaching away.

Hard rules: no characters, no text, no signage lettering, no numbers, no UI,
no watermark, no ground beyond the contact shadow, no stone plinth or base
platform under the building, no glow effects, no decorative sparkle or star
anywhere in the image.
```

### 1.2 NĂM CÔNG TRÌNH ƯU TIÊN — đã có NPC đứng trước cửa, chỉ thiếu cái nhà

Mỗi cái là một chức năng người chơi **đã dùng được** mà chưa nhìn ra trong thế giới.

| # | Tệp | Khối | `THE BUILDING:` |
|---|---|---|---|
| 1 | `ct_caumay` | #9 (4340,520) BẮC | `a fortune shrine — a small open pavilion on four carved pillars, a smooth pale moon-orb hovering over a low altar, silk ribbons tied along the rail, soft blue-white cel-shaded light on the orb` |
| 2 | `ct_quantro` | #8 (3680,520) BẮC | `a two-storey inn — warm cream plaster walls with dark timber beams, a wooden balcony across the upper floor, flower boxes under every window, a wide welcoming arched doorway, terracotta tiled roof` |
| 3 | `ct_thapvach` | #3 (2260,520) BẮC | `a windwatch post — a squat stone base with a tall open timber lookout deck on top, the deck overhanging on all four sides with a shingled cap, a rope ladder up one side, two wind vanes and a hanging brass bell` |
| 4 | `ct_saanhlenh` | #12 (3680,2340) NAM | `a command hall — a long low hall of grey-blue block stone, a short square tower at one end, tall banners hanging from the tower, a broad covered porch running along the LONG side of the hall, shingled roof` |
| 5 | `ct_chuong` | #7 (2260,2340) NAM | `a stable yard — an open-sided timber shelter with a low fence, straw on the floor, feed troughs along the back wall, hay bales stacked at one end, no front wall at all so the inside is visible` |

> ⚠ **#12 và #7 nằm ở HÀNG NHÀ NAM.** Mặt tiền của sprite isometric luôn quay XUỐNG DƯỚI, tức
> quay ra tường thành, còn người chơi thì tới từ phố lớn phía bắc. Đó là lý do hai dòng trên cố
> ý **không có mặt tiền mạnh**: chuồng thì hở bốn bề, sảnh lệnh thì cửa chạy dọc cạnh dài và
> nhận diện bằng cái tháp + cờ. Khi cắm art tôi sẽ dời hai NPC xuống `y ≥ 2700` — một dòng dữ
> liệu, không phải việc của prompt.

### 1.3 TÁM KHỐI NHÀ DÂN — chỉ cần hai kiểu, lặp lại được

Khối #0 (280,520) · #1 (940,520) · #4 (280,2340) · #5 (940,2340) · #6 (1600,2340) ·
#13 (4340,2340) · #14 (5000,2340) · #15 (5660,2340).

| Tệp | `THE BUILDING:` |
|---|---|
| `ct_nha1` | `a small townhouse — one and a half storeys, cream plaster over a stone footing, dark timber corner posts, a steep terracotta roof with one dormer window, a round-topped door, a short chimney` |
| `ct_nha2` | `a narrow townhouse — two storeys, the upper floor jettied out slightly over the lower, blue-grey painted timber cladding, a mossy shingle roof, shuttered windows, a plain plank door, a barrel beside the doorstep` |

Hai tấm, cắm vào tám khối, xen kẽ. **Đừng xin tám tấm khác nhau** — tám kiểu nhà lẻ trong một
phố nhỏ đọc ra lộn xộn hơn là hai kiểu lặp có nhịp.

### 1.4 Nhập vào game

```bash
# 1. để ảnh gốc ở tools/iso/nguon/gem_<ten>.png
python3 tools/iso/cat_congtrinh.py tools/iso/nguon/gem_caumay.png ct_caumay --o 1.6
# 2. nếu còn bệ / viền / chữ sót lại:
python3 tools/iso/don_congtrinh.py
```

`--o` là **số ô đất chân đế chiếm**, đo được từ ba lần đã làm:
**2,0 ô** cho cổng thành và công trình lớn (sảnh lệnh, quán trọ, chòi trông vách) ·
**1,4–1,8 ô** cho tiệm quán, chuồng, nhà dân · để 3,0 là ra cỡ nhà thờ (5,4 lần thân người).

Rồi hai dòng khai:
- `MAP_VAT_SRC` trong `game.js` (≈ dòng 1168): `ct_caumay: 'assets/iso/ct_caumay.png',`
- `MAPS.ardhaven.vatTo` trong `data/canbang.js`, theo khuôn của khối 460×340:
  `x = khoi.x − (w − 460) / 2` · `y = khoi.y + 340 − h` (chân ảnh trùng mép dưới khối).

---

## 2. VẬT NHỎ — một tấm, 12 món (còn nợ từ đợt trước)

Thứ làm phố có người ở. Một prompt, 12 món.

```
Isometric game prop sheet, true 2:1 dimetric projection, orthographic camera,
no perspective convergence.

Output ONE image 2048x1536 containing a 4x3 grid of 12 separate props, each
prop centered in its own 512x512 cell. Background pure magenta #FF00FF, flat.

The 12 props, reading left to right, top to bottom:
  a stone well with a wooden bucket frame
  a stack of market crates
  a wooden barrel
  a hanging street lantern on an iron post
  a wooden handcart with two spoked wheels
  a flower planter box
  a low wooden fence segment
  a stone bench
  a signpost with blank arrow boards
  a stone water trough
  a stack of grain sacks
  a small round shade tree

Scale anchor: the well is 200px tall in its cell. Everything else scaled to
the same world — a person would be 132px tall.

Art style: Axie Infinity. Soft rounded chunky shapes, thick warm-dark-brown
outline (NOT black), saturated candy palette, gentle cel shading.

Lighting: single soft light from upper-left, identical across all 12. Soft
elliptical contact shadow under each prop only.

Hard rules: no characters, no text, no numbers, no lettering on the arrow
boards or signs, no watermark, no cell borders or dividing lines, no ground
beyond each contact shadow.
```

Nhập:

```bash
python3 tools/cat_luoi_gem.py tools/iso/nguon/gem_vatnho.png 4 3 \
  --ra public/game/assets/iso --neo \
  --ten gieng,thung_go,thung,den_pho,xe_keo,chau_hoa,hang_rao,ghe_da,bien_chi,mang_nuoc,bao_lua,cay_nho
```

Cờ `--neo` ghi toạ độ **CHÂN** từng sprite vào `public/game/data/iso.js` — qua đúng hàm
`ghi_neo()` của `nuong_tile.py`, một tệp đích duy nhất.

> ⚠ Không có neo thì `veVatIso()` `return` sớm và **không vẽ gì cả, không lỗi nào in ra** — đúng
> cái lỗi đã làm sáu map mất sạch cây mà không bài kiểm nào đỏ.
>
> ⚠ **Vệt bóng tiếp đất sẽ bị tách mất cùng nền, và đó là đúng.** Gemini vẽ bóng bằng magenta
> SẪM, mà ngưỡng sắc tím 120 bắt cả nền sáng lẫn bóng sẫm — bốn tấm `ct_*` đang chạy trong game
> cũng vậy. Vẫn cứ xin bóng trong prompt: nó giúp model đặt vật đứng vững chứ không trôi, và
> game tự vẽ bóng theo nhân vật. Điểm chân thì `cat_luoi_gem.py` đo lại từ **hàng rộng nhất ở
> 25% dưới cùng** (trục lớn của ê-líp bóng), không lấy mép dưới.

---

## 3. VŨ KHÍ — 7 dòng × 7 giai = 49 cây (chỗ trống LỚN NHẤT của hệ trang bị)

Đo được trong `VK_ANH`: **7 trong 14 dòng vũ khí không có một tấm nào**. Cây nào không có tranh
thì nhân vật cầm tay trống, và Vòng Kiếm Lửa quay không — vẫn đủ vòng lửa, chỉ thiếu lưỡi kiếm.

| Dòng | Lớp | Đang có |
|---|---|---|
| `riu` Rìu · `chuy` Chùy | Dark Knight | **0/7** mỗi dòng (`kiem` đã có 1 tấm chung) |
| `cungngan` Cung Ngắn · `truongcung` Trường Cung | Sylvan Ranger | **0/7** mỗi dòng (`no` đã có 1 tấm chung) |
| `songdao` Song Đao | Spellblade | **0/7** (`daikiem`, `makiem` mỗi dòng 1 tấm chung) |
| `bua` Búa · `kich` Kích | Dark Lord | **0/7** mỗi dòng (`lenhtruong` đã có 1 tấm chung) |

Đường đã chạy rồi: 7 cây trượng `dw_truong1..7` của Dark Wizard đi đúng đường này.

### 3.1 Khối prompt CHUNG cho vũ khí — một tấm = một DÒNG, bảy giai

```
Game weapon icon sheet, flat side-on view, orthographic, no perspective.

Output ONE image 2048x1024 containing a single row of 7 weapons, each weapon
centered in its own 292x1024 cell, each drawn UPRIGHT and VERTICAL with the
head/blade/tip pointing UP and the grip at the bottom. Background pure magenta
#FF00FF, completely flat.

THE SEVEN WEAPONS, left to right, one clear tier step each — the silhouette
must change between tiers, not just the colour:
<<<ĐỔI BẢY DÒNG NÀY>>>

Scale: every weapon fills roughly the same cell height, so they read as one
family at one size. Consistent thickness and detail density across all 7.

Art style: Axie Infinity. Soft rounded chunky shapes, thick warm-dark-brown
outline (NOT black), saturated candy palette, gentle cel shading, clean
readable silhouette at small size.

Lighting: single soft light from upper-left, identical across all 7. No cast
shadow, no contact shadow — these are held objects, not placed objects.

Hard rules: no hands, no characters, no text, no numbers, no watermark, no
cell borders, no background objects, no glow, no aura, no sparkle, no magic
particles, no light rays — the weapon must be a solid opaque object with a
clean edge and nothing outside its outline.
```

> ⚠ **Hai dòng "Hard rules" cuối là quan trọng nhất của cả mục này.** Game vẽ quầng rèn
> +7…+11 bằng cách nở alpha của chính tấm này rồi trừ đi alpha gốc. Một hạt lấp lánh bay lơ lửng
> cạnh lưỡi kiếm sẽ nở ra thành một quầng sáng riêng lửng lơ giữa không khí.
> (`chuanhoavk.py` có bước `bo_manh_roi()` vứt mảnh rời dưới 3% khối lượng — nhưng nó là lưới an
> toàn, không phải chỗ dựa.)

### 3.2 Bảy bộ bảy dòng — dán vào chỗ `<<<ĐỔI BẢY DÒNG NÀY>>>`

**`riu` — Rìu, Dark Knight**
```
  1 a plain bronze hand axe, single crescent blade, wrapped leather haft
  2 a steel war axe, heavier head, riveted steel cheeks, dark grey #5c6270
  3 a silver broadaxe, polished pale blade with a bright edge, #c6d0dc
  4 a dragonscale axe, dark red scaled head #7a3a34 with gold trim #c8a84a,
    a small horn curling off the back of the head
  5 a burnt-orange greataxe, scorched head #b85a1c, glowing ember-orange
    cracks painted into the metal, amber trim #ffc06a
  6 a storm axe, deep blue steel #3a6ad0, pale blue arcs etched along the
    blade, a forked prong replacing the back spike
  7 a violet-white royal axe, pearl-violet head #b0a0e8, pure white trim,
    twin winged blades and a long slender haft
```

**`chuy` — Chùy, Dark Knight**
```
  1 a plain bronze mace, round studded head, wrapped leather haft
  2 a steel flanged mace, six straight flanges, dark grey #5c6270
  3 a silver mace, polished fluted head with a bright collar, #c6d0dc
  4 a dragonscale mace, dark red scaled head #7a3a34, gold bands #c8a84a,
    short spines around the crown
  5 a burnt-orange warmace, scorched head #b85a1c with ember-orange cracks,
    amber collar #ffc06a, heavier and blockier
  6 a storm maul, deep blue head #3a6ad0, pale blue etched arcs, four prongs
    splayed like a lightning crown
  7 a violet-white royal maul, pearl-violet head #b0a0e8, pure white trim,
    a small crown motif at the top of the head, long slender haft
```

**`cungngan` — Cung Ngắn, Sylvan Ranger**
```
  1 a plain wooden shortbow, bare pale limbs, simple cord, leather grip
  2 an oak shortbow, darker green-brown limbs #4a6b52, two leaf-shaped
    laminate plates on the belly
  3 a thornwood shortbow, deep green limbs #3e6b4a, small thorns along the
    back of each limb, bright green cord #8ad86a
  4 an owl-feather shortbow, tan wood #8a7050, a fan of soft feathers bound
    at each limb tip, cream trim #e0cfa8
  5 a dewfrost shortbow, pale blue-white limbs #a8c0d8, a crystal bead set
    where the grip meets each limb, white cord
  6 a laurel shortbow, warm gold limbs #c0b040, a sculpted laurel leaf spray
    at the grip, pale gold trim #fff0a8
  7 a white-phoenix shortbow, pink-white limbs #e0a0b0, each limb shaped as
    a stylised feather, pure white cord and grip
```

**`truongcung` — Trường Cung, Sylvan Ranger**

Cùng bảy dòng như `cungngan`, đổi `shortbow` → `longbow`, và thêm câu này vào cuối khối:
```
  All seven are LONGBOWS — noticeably taller and slimmer than a shortbow,
  a single long graceful curve rather than a deep recurve.
```
> ⚠ Đây là chỗ dễ hỏng nhất của cả mục 3: hai dòng cung phải **phân biệt được ở cỡ 44px trong
> túi đồ**. Nếu tấm trả về mà cung ngắn với trường cung chỉ khác nhau chiều dài thì sau khi
> `chuanhoavk.py` thu cả hai về 172px chúng sẽ **giống hệt nhau**. Xin lại, đừng cắm.

**`songdao` — Song Đao, Spellblade** (vẽ **một cặp** trong mỗi ô)
```
  1 a pair of crude twin daggers, plain iron, cord-wrapped grips
  2 a pair of fire-cured twin blades, warm brown-orange blades #9a6438,
    burnt-tan leather grips #d8a060
  3 a pair of ashen twin blades, grey scorched steel #78706c, soot-dark
    grips, pale ash trim #c0b4a8
  4 a pair of flame twin blades, orange-red blades #d85a22 with a wavy
    flame-shaped edge, cream-gold guards #ffd08a
  5 a pair of magma twin blades, deep red blades #b83010, glowing orange
    cracks painted into the metal, molten-orange edge #ff5a10
  6 a pair of goldflame twin blades, bright gold blades #e0a018, a curling
    flame motif cut through each blade, ivory grips #fff4c8
  7 a pair of emperor-flame twin blades, brilliant scarlet blades #ff3a10,
    gold trim #ffe08a, each blade shaped as a stylised tongue of fire
```

**`bua` — Búa, Dark Lord**
```
  1 a plain wooden-hafted hammer, simple iron block head, olive-green bindings
  2 a guard hammer, blue-steel head #4a6a92, a small square crest plate set
    into the cheek, pale blue trim #9ab8dc
  3 a gilded warhammer, bright gold head #e8c428, a fluted crown shape along
    the top of the head, ivory trim #fff4b0
  4 a tyrant maul, deep violet head #7a3a9a, blunt spikes around the face,
    orchid trim #d8a0f0
  5 a blackthrone maul, near-black head #38384a, a heavy square face, cold
    grey-blue trim #9a9ac0, very blocky and severe
  6 a dark-emperor maul, black head #2a2a34 with dull gold inlay #c0a040,
    a narrow crown motif on the cheek
  7 an imperial maul, ivory-gold head #f0e4b0, pure white trim, a sculpted
    crown forming the top of the head, long slender haft
```

**`kich` — Kích, Dark Lord** (kích = halberd; thân dài, đầu có lưỡi + móc)
```
  1 a plain wooden halberd, simple iron blade with a small side hook, olive
    green bindings
  2 a guard halberd, blue-steel head #4a6a92, a square crest plate under the
    blade, pale blue trim #9ab8dc
  3 a gilded halberd, bright gold blade #e8c428, a fluted crown collar under
    the head, ivory trim #fff4b0
  4 a tyrant halberd, deep violet blade #7a3a9a, a barbed rear hook, orchid
    trim #d8a0f0
  5 a blackthrone halberd, near-black blade #38384a, broad and heavy, cold
    grey-blue trim #9a9ac0
  6 a dark-emperor halberd, black blade #2a2a34 with dull gold inlay #c0a040,
    a crescent rear hook
  7 an imperial halberd, ivory-gold blade #f0e4b0, pure white trim, a crown
    collar and twin crescent wings flanking the blade, long slender shaft
```

### 3.3 Nhập vào game

```bash
# cắt lưới 7x1 ra bảy tấm
python3 tools/cat_luoi_gem.py gem_riu.png 7 1 --ra /tmp/vk --ten riu1,riu2,riu3,riu4,riu5,riu6,riu7
# chuẩn hoá: tự xoay về trục +X, cắt sát, thu về 172px, tính chỗ nắm
python3 tools/chuanhoavk.py /tmp/vk/*.png --ra public/game/assets/nv
```

`chuanhoavk.py` in ra **đúng dòng dán vào `VK_ANH`** cho mỗi tệp, kiểu:
`'riu|1': { tep:'riu1', x:65, y:32 },`

---

## 4. TUỲ CHỌN · Vật phẩm tiêu hao — một tấm, 12 món

Bình thuốc / sách / bùa / hộp hiện **vẽ bằng canvas**, và đó là một ngoại lệ đã duyệt của Quy
tắc số 3 (chúng nhỏ, không đứng cạnh art thật). Nên mục này là **nên có**, không phải đang nợ.
Làm thì icon tiêu hao hợp tông với vũ khí hơn.

```
Game item icon sheet, flat three-quarter front view, orthographic.

Output ONE image 2048x1536 containing a 4x3 grid of 12 item icons, each
centered in its own 512x512 cell. Background pure magenta #FF00FF, flat.

The 12 items:
  a small red health potion, round glass flask, cork stopper
  a small blue mana potion, tall slender glass flask, cork stopper
  a large red health flask, faceted glass, brass collar
  a large blue mana flask, faceted glass, brass collar
  a thick leather-bound spellbook, brass corner caps, a ribbon marker
  a rolled parchment scroll tied with a cord
  a paper talisman charm hanging from a cord, blank face, no writing
  a small wooden reward box, iron bands, closed lid
  a large ornate treasure chest, gold banding, closed lid
  a faceted blue gemstone
  a faceted orange gemstone
  a small cloth pouch tied at the neck, coins spilling from the mouth

Scale: every item fills roughly two thirds of its cell height, so all 12 read
at one size in a 44px inventory slot — chunky, high contrast, simple.

Art style: Axie Infinity. Soft rounded chunky shapes, thick warm-dark-brown
outline (NOT black), saturated candy palette, gentle cel shading.

Lighting: single soft light from upper-left, identical across all 12. No
shadow of any kind.

IMPORTANT — these icons sit on a DARK panel, so keep every item bright and
high-contrast against dark; nothing may be near-black or near-magenta.

Hard rules: no characters, no text, no numbers, no lettering on the book,
scroll or talisman, no watermark, no cell borders, no glow, no sparkle.
```

> ⚠ Dòng "these icons sit on a DARK panel" không thừa. Nhân vật đứng trên bản đồ **SÁNG**, icon
> nằm trên panel **TỐI** — game đã có `itemPal` nâng sàn độ sáng riêng cho icon đúng vì chuyện
> này. Xin art tối là tự tay dựng lại vấn đề mà mã đang phải chữa.

---

## 5. ⚠ GIÁP thì ĐỪNG gen bằng Gemini — và đây là lý do, không phải sự thận trọng suông

Cám dỗ rõ ràng: `NV_GIAP` mới có **3 trên 35** khoá (5 lớp × 7 giai), nên thiếu 32 bộ.

Nhưng icon giáp trong túi và giáp trên người **bắt buộc dùng chung một nguồn** — đó là cả lý do
`ARMOR_PIECES` sinh thẳng từ `HERO_SETS`. Đã thử lấy art giáp từ kho ngoài và **phải gỡ**:
kho chỉ có mũ/áo/khiên không chia theo lớp, nên map theo ô + giai là **cả năm lớp chung một cái
mũ trong túi** trong khi giáp **trên người** vẫn riêng từng lớp. `test_itemdb` bắt ngay —
`thieulam_0_non` ≡ `baidasan_0_non`.

Mà giáp trên người thì không phải một tấm phẳng: nó là **năm lớp rời** cắt từ gói Spine
(`NV_LOP` × `NV_LOP_HOP`), vì bốn ô trang bị phải vẽ tách nhau — đeo mỗi đôi giày thì đúng đôi
giày đổi. Gemini không sinh ra được một gói Spine.

⇒ Giáp đi đường **đặt hàng gói Spine**, đặc tả đã viết sẵn: `docs/PROMPT_GIAP_DARKWIZARD.md`
(có cả §7 về nợ "thân trần chưa cắt lớp") và `docs/PROMPT_GIAP_CO_BAN.md`.
Bốn ô, không phải năm — bản mẫu Spine không có khe quần riêng.

---

## 6. NGHIỆM THU — chấm trước khi cắm, năm câu

Cả năm đều là lỗi **đã xảy ra thật** và **không cái nào ném lỗi**:

1. **Nền có đúng magenta đặc không?** Mở ra đo: nền phải ra sắc tím `(R+B)/2 − G` ≥ 200, vật
   liệu ≤ 40. Ở giữa là viền khử răng cưa — bình thường. Không có khoảng trống rộng nghĩa là
   Gemini đã trộn magenta vào chính món đồ, xin lại.
2. **Có bệ / có chữ / có số không?** Nhìn kỹ mép ảnh: `ct_loren` từng dính một khung viền đỏ
   1-3px chạy quanh và một vạch trắng đo kích thước.
3. **Bảy giai có khác nhau BÓNG DÁNG không, hay chỉ khác màu?** Tô đặc một màu rồi nhìn. Chỉ
   khác màu thì ở cỡ 44px trong túi là bảy món giống hệt nhau — màu mất trước tiên.
4. **Hai dòng cùng lớp có phân biệt được không?** Cung ngắn ≠ trường cung, rìu ≠ chùy. Cắm vào
   rồi mới phát hiện trùng là phải gen lại cả bảy.
5. **Có hạt sáng / tia / quầng nào nằm NGOÀI đường bao không?** Có thì bỏ, hoặc game sẽ nở nó
   thành một quầng rèn +11 lửng lơ giữa không khí.

Và một câu cho nhà cửa: **chụp lại ảnh mà nhìn.** Ba lỗi hình của đợt trang bị (nhẫn ra hình
móng ngựa, găng ra thanh sô-cô-la, kiếm cao hơn cả người) **không lỗi nào lộ ra khi đọc code**.
