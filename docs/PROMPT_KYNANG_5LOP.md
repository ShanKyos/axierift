# Đơn art kỹ năng — 4 ô × 5 lớp, xếp theo BA BỘ VÕ CÔNG

Đơn hàng mục 6, **bản 2** (chủ dự án chốt lại phân định ô ngày 15-09-2026). Số liệu đọc thẳng từ
`public/game/game.js` (`castSkill` · `VO_CONG_BO` · `spawnSkillVfx` · `VFX_ATLAS_DEFS` ·
`CHIEU_TRANH`) và `public/game/data/canbang.js` (`SECTS` · `VOHOC_DEFS`). Lối viết theo
`docs/npc-prompts.md §2.2`.

> **Bản 1 đã sai chỗ nào:** nó xếp ba nguyên mẫu là *đòn chính · Trấn Phái · hào quang buff*.
> Đó là mô tả **thanh chiêu hiện tại**, không phải mô tả cơ chế. Chủ dự án xếp lại theo
> **tầm đánh và diện đánh** — và cách xếp đó trùng khít với `VO_CONG_BO`, thứ đã có sẵn.
> Giữ đoạn này để người sau đừng quay lại khuôn cũ.

---

## 0. Chủ dự án vừa mô tả một hệ ĐÃ CÓ TRONG MÃ

Nguyên văn:

> *"Skill 1 sẽ là đánh cận chiến, uy lực mạnh và có thể đẩy lùi đối thủ. Skill số 2 … uy lực
> yếu hơn skill số 1 nhưng sẽ đánh xa hơn. Skill số 3 là đánh lan. Tâm pháp đi theo skill số 1
> sẽ là … đẩy lùi đối thủ gây thêm dame. Skill số 2 sẽ là … định thân đối thủ. Và skill số 3
> sẽ là làm đối phương bị dính độc rút máu từ từ. Tất cả các skill này đều đi theo tâm pháp
> kháng lại."*

Chú thích đã nằm trong `game.js` từ trước, ngay trên `VO_CONG_BO`:

```
bộ 1 (đơn · gần)   Crushing Force  ↔ Steadfast
bộ 2 (đơn · xa)    Paralyze        ↔ Unbound
bộ 3 (AoE quanh)   Venom           ↔ Antidote
```

Trùng khít **cả ba bộ, cả sáu tâm pháp, cả ba cặp khắc chế**. ⇒ Đây không phải cơ chế mới. Đây
là yêu cầu cho **thanh chiêu thẳng hàng với cơ chế đã có**.

### 0.1 ⚠ VÀ ĐÓ LÀ MỘT BẢN VÁ LỖI — 8/15 mắt xích hiện KHÔNG có nút bấm nào

`player._tpBo = voCongBo(id)` chỉ khác 0 khi người chơi **TUNG** một chiêu thuộc bộ. Mà 8 trong
15 chiêu gánh bộ nằm trong `LEGACY_SECT_SKILLS` — tức đã quy thành **%Công Kích vĩnh viễn, không
có nút nào để bấm**:

| bộ | tâm pháp | Dark Knight | Sylvan Ranger | Dark Wizard | Spellblade | Dark Lord |
|---|---|---|---|---|---|---|
| 1 | Crushing Force | ✅ ô 1 | ✅ ô 1 | ✅ ô 1 | ✅ ô 1 | ✅ ô 1 |
| 2 | **Paralyze** | ❌ Di Sản | ✅ ô 4 | ❌ Di Sản | ❌ Di Sản | ❌ Di Sản |
| 3 | **Venom** | ❌ Di Sản | ❌ Di Sản | ✅ ô 3 | ❌ Di Sản | ❌ Di Sản |

⇒ **Điểm Huyệt và Trúng Độc không bao giờ nổ với 4/5 lớp.** Người chơi gom mảnh, mở tâm pháp,
đọc dòng mô tả — rồi không có cách nào kích hoạt nó. Không lỗi, không dấu hiệu, không bài kiểm
nào đỏ. Cách xếp lại của chủ dự án vá đúng chỗ này, và đó là lý do mạnh nhất để làm.

### 0.2 ⚠ Hai chữ phải đổi tên — Quy tắc số 1

| chủ dự án gọi | vấn đề | tên trong game (giữ) |
|---|---|---|
| **Kim Cang Lực** | *kim cang* = vajra, từ vựng tu tiên/Phật giáo | **Crushing Force** |
| **Điểm Huyệt** | *huyệt* cùng họ với những từ chỉ đường khí trong thân — danh sách cấm ở CLAUDE.md có | **Paralyze** |

Cơ chế thì giữ nguyên đúng như chủ dự án mô tả; chỉ **tên người chơi nhìn thấy** phải là tên MU.
Muốn đổi thì đổi cả hai vế của cặp cho cân, đừng đổi một vế.

*(Liên quan, ưu tiên thấp: chính chữ **"Trấn Phái"** cũng là tàn dư — bảng Kỹ Năng đã đổi
`Phái` → `Lớp` ở đợt trước mà chỗ này còn sót.)*

---

## 1. BỐN Ô — bảng chốt

Ba bộ chiếm ba ô đầu. Ô 4 là hào quang phù trợ: nó **không đánh trúng ai** nên không treo tâm
pháp nào, và vì thế nó là ô duy nhất nằm ngoài ba bộ.

| ô | cơ chế | tầm | uy lực | nhánh mã | bộ | tâm pháp gây ↔ kháng |
|---|---|---|---|---|---|---|
| **1** | đơn mục tiêu, **gần**, đẩy lùi | gần nhất | **mạnh nhất** | `sectA` | 1 | Crushing Force ↔ Steadfast |
| **2** | đơn mục tiêu, **xa**, định thân | xa hơn ô 1 | yếu hơn ô 1 | *chưa lên thanh* | 2 | Paralyze ↔ Unbound |
| **3** | **đánh lan** | tại con trỏ | diện rộng | `sectTP` | 3 | Venom ↔ Antidote |
| **4** | hào quang phù trợ | trên mình | — | `buff` | — | **không có** |

### 1.1 ⇒ `VO_CONG_BO` thành ĐỒNG DẠNG, và đó là chỗ đẹp nhất của cách xếp này

```js
VO_CONG_BO[<lớp>] = ['a', <chiêu bộ 2>, 'tp'];   // cả năm lớp
```

Bộ 1 là `'a'` và bộ 3 là `'tp'` — **hai ô cố định của mọi lớp**, nên hai bộ đó tự động bấm được,
không phải khai gì thêm. Chỉ còn **bộ 2 phải kéo lên thanh**, và đó đúng là 5 chỗ đang hỏng.

### 1.2 Ba hệ quả về cơ chế — đọc trước khi đặt art

Art vẽ theo cơ chế nào thì cơ chế đó phải đúng trước. Ba việc, **không nằm trong đơn art**:

**① Ô 1 phải có `kb`, và uy lực phải đảo với ô 3.** Hiện `skillA` mult **1,5–1,6** còn Trấn Phái
**2,8–3,2** — tức ô 3 đang mạnh gấp đôi ô 1, ngược hẳn với "skill 1 uy lực mạnh". Và chỉ mình
`skillA` là **không lớp nào khai `fx.kb`**. Sửa được bằng dữ liệu thuần trong `SECTS`.

**② Bộ 2 lên thanh thì mất %Công Kích Di Sản của nó.** Luật cũ: *một chiêu không được vừa bấm
được vừa cộng %ST vĩnh viễn*. Mỗi lớp hiện có đúng 4 chiêu Di Sản = **+8,0%**; rút một chiêu ra
là lệch, và `test_kynang5lop` bắt lỗi lệch giữa các lớp. Phải đẩy một chiêu khác vào thế chỗ.

**③ ⚠ "Cận chiến" KHÔNG đọc theo nghĩa đen cho hai lớp tầm xa.** `SECTS` khai
`range` 90 · **380** · **420** · 90 · 90, và ép `hpMult 0,72 / defMult 0,65` cho Dark Wizard —
lớp mỏng nhất game, cố ý. Bắt nó vào tầm 90 để dùng ô 1 là bắt nó chết. Chú thích gốc của bộ 1
ghi **"đơn · gần"**, không ghi "cận chiến": ⇒ đọc là **gần theo tầm CỦA CHÍNH LỚP ĐÓ** — Dark
Knight vung ở 90, Dark Wizard nổ ở ~200, và ô 2 của nó vẫn xa hơn. Giữ được ý chủ dự án
(ô 1 gần hơn + mạnh hơn, ô 2 xa hơn + yếu hơn) mà không phá bản sắc lớp.

### 1.3 Đề xuất xếp chiêu — TOÀN BỘ từ chiêu ĐÃ CÓ

CLAUDE.md cấm rõ: *"ĐỪNG ĐẶT CHIÊU MỚI CHO BA BỘ NÀY. Game đã có 36 chiêu mang tên MU chính
chủ."* Bảng dưới không đẻ chiêu nào; ô 2 chỉ **kéo lên** chiêu đang nằm ở Di Sản.

| lớp | ô 1 · gần · đẩy lùi | ô 2 · xa · định thân | ô 3 · lan | ô 4 · hào quang |
|---|---|---|---|---|
| Dark Knight | `a` Twisting Slash **+kb** | `dk_lunge` Lunge *(đổi `cone`→`proj`)* | Death Stab | `dk_bulwark` Bulwark |
| Sylvan Ranger | `a` Triple Shot **+kb** | `elf_penetration` Penetration *(kb18, xuyên — dời từ ô 4)* | Ice Arrow | `elf_greaterdmg` Bless |
| Dark Wizard | `a` Poison **+kb** | `dw_lightning` Lightning *(kb20)* | **Meteorite** | `dw_shield` Soul Barrier |
| Spellblade | `a` Fire Slash **+kb** | `mg_powerwave` Power Wave *(xuyên)* | Flame Strike | `mg_battlefury` Battle Fury |
| Dark Lord | `a` Force Wave **+kb** | `dl_electricspark` Electric Spark *(stun 0,8 — sẵn định thân!)* | Fire Scream | `dl_commandaura` Increase Critical Damage |

- **Dark Wizard ô 3 = Meteorite** đúng như chủ dự án chỉ đích danh, và `meteor_rain` **đã có
  art** — không tốn tấm nào.
- **Dark Knight là lớp duy nhất không có sẵn chiêu đơn-mục-tiêu tầm xa.** `dk_lunge` ("cú đâm
  ngắn và nhanh, mũi kiếm lách qua khe giáp", `pierce`) là thứ gần nhất; đổi `type` là **một
  chữ trong dữ liệu**, không phải một chiêu mới.
- **`dl_electricspark` đã khai `stun:0.8`** — Dark Lord vốn đã làm đúng việc của bộ 2 từ trước.
- **`dw_inferno` bị đẩy khỏi ô 3.** Nó về Di Sản, và điều đó **giải luôn hệ quả ②** cho Dark
  Wizard. `fire_pillar` (art của nó — "cột lửa mọc từ vòng dung nham") **có thể dùng lại cho
  Flame Strike của Spellblade** ("hàng cột lửa dựng lên phía trước"): hai mô tả rất gần nhau.
  ⚠ Phải **chụp ra so** rồi mới chốt, đừng suy từ câu chữ — đó đúng kiểu kết luận đã sai một
  lần ở mục tấm nền `chungnam`.

---

## 2. Quy cách kỹ thuật

```
Mỗi khung 384 × 384, nền TRONG SUỐT hoàn toàn.
Xếp 8 khung một hàng, trái sang phải, rồi xuống hàng.
Không viền khung, không chữ, không số, không bệ, không bóng đổ.
```

| ô | khung | hàng | fps | thời lượng | neo | vẽ to bằng nào |
|---|---|---|---|---|---|---|
| **1** | 8 | 1 | 18 | 0,44 s | giữa người niệm, toả sang **phải** | tầm với ~125 px = **1,3×** chiều cao nhân vật |
| **2** | 10 | 2 | 20 | 0,50 s | **trên mình con quái** (`neo:'quai'`) | R ~80 px = **0,8×** |
| **3** | 16 | 2 | 20 | 0,80 s | **vạch nền ở ~88% chiều cao khung** | R ~115 px (185 × `co` 0,62) = **2,4×** |
| **4** | 12 | 2 | 16 | 0,75 s | giữa người niệm | R 95 px = **2×** |

Nhân vật trong màn cao **95 px** (`NV_THAN_PX`); quái thường **53 px**; trùm **113 px**.

⚠ Hình **không bao giờ được lớn hơn vòng sát thương** — vẽ trùm qua con quái mà nó không mất máu
là hứa suông. Nhưng ô 3 thì vẽ **nhỏ hơn** thật (`co` 0,62): vẽ đúng 185 px bán kính thì một con
quái cao 70 px nằm lọt thỏm trong đám cháy, đọc ra "nổ tung góc màn hình" chứ không ra "trúng
con kia".

⚠ **Sáng hơn nền.** Bản đồ đêm sáng ~52; gói Dragon Spirit gốc sáng ~25 nên trong màn nó đọc
thành vệt mực chứ không thành một chiêu, đã phải nâng sáng lúc nhập (`--sang`). Gói nào có
**khói tối là phần nội dung** thì cắm với `cong:false`.

### 2.1 ⚠ Việc mã phải xong trước khi ô 1 cắm được

`spawnAtlasVfx(id, x, y, scale)` **không nhận góc**; vòng vẽ gọi `drawImage` trần. Hai atlas đang
chạy không lộ ra vì cả hai **giáng xuống đất** — hố thiên thạch thì không có hướng. Ô 1 thì có
hướng: cắm tranh vào lúc này là chiêu **luôn quét sang phải kể cả khi nhân vật quay trái**.
Thêm `goc` vào một chỗ duy nhất (~6 dòng) là xong. ⇒ **Ô 1 đặt CUỐI.**

Ô 2 không dính: nó neo trên con quái và là một vụ nổ đối xứng. Ô 3, ô 4 cũng không.

### 2.2 Câu phong cách — dán vào cuối mọi prompt atlas

```
Render it as a game visual effect on a fully transparent background: painted cel-shaded
energy with clean chunky shapes rather than fine sparkle dust, bold saturated colour that
stays readable over both a bright grass field and a dark swamp at night, and a crisp bright
core fading to a soft coloured edge. Keep every frame the same canvas size with the effect
centred the same way, so the frames play back as one continuous motion. No character, no
weapon, no ground, no shadow, no frame, no text and no numbers anywhere in the image.
```

---

## 3. Ô 1 — đơn · gần · mạnh nhất · ĐẨY LÙI

Chiêu bấm nhiều nhất cả trận: **ngắn, đọc ngay, không che mất bầy quái**.

⚠ **Khác bản 1 ở một nhịp, và nhịp đó là cả cơ chế:** ô 1 nay treo **Crushing Force — đẩy lùi
+ sát thương bạo kích**. Bản 1 tả năm vệt quét thuần tuý, không có khoảnh khắc CHẠM. Nay mỗi
tấm phải có **một cú nện tống mục tiêu ra xa**: khung giữa là lúc lực truyền đi, và phải thấy
được hướng tống.

⚠ Ô 1 của Sylvan Ranger và Dark Wizard **vẫn là tầm gần CỦA LỚP ĐÓ**, không phải cận chiến —
xem §1.2 ③. Nên hai tấm ấy là **luồng lực bắn ra ở cự ly gần**, không phải nhát kiếm.

---

**1·DK — Twisting Slash** · `sx_thieulam_a` · #4c8dff lõi, #ffe9a0 rìa

```
A single heavy two-handed sword sweep, drawn only as the trail the blade leaves behind — a
wide crescent of cold steel-blue light opening from the left of the frame and whipping out
to the right, thickest at its middle and tapering to a hair-thin point at both ends. The
first frames show the arc compressed and coiled back on itself. In the middle frames the arc
snaps fully open and a pale gold impact burst fires off its leading edge, throwing a short
cone of force further to the right — this is the moment the blow lands and shoves the target
away, so make it the loudest frame. The last frames let the arc thin out and drift apart into
three or four torn ribbons while the force cone fades. Keep the shape flat and ribbon-like as
if seen from slightly above, not a glowing tube.
```

---

**1·SB — Fire Slash** · `sx_minhgiao_a` · #e8552a lõi, #ffb060 rìa

```
A broad blade sweep made of fire, drawn only as the burning trail — a wide crescent of
ember-orange flame opening from the left and lashing out to the right, with the inner edge
white-hot and the outer edge breaking up into curling flame tongues. The first frames show
the fire gathered and coiled tight. In the middle frames the arc tears fully open and blasts
a short white-hot shove of flame further to the right, as if the blow is physically pushing
something back — make this the loudest frame. The last frames let the flame separate into
embers that drift upward and fade. Unlike a clean steel arc this one should look ragged and
alive along its outer edge, as if the fire is still eating outward. Keep it flat and read
from slightly above.
```

---

**1·DL — Force Wave** · `sx_bug_a` · #8a9a3a lõi, #d0e07a rìa

```
A blunt shockwave punched out of a commander's sceptre, drawn as a stack of three or four
nested crescent bands of olive-green force travelling to the right, the innermost one
brightest and the outer ones thinner and more transparent. The first frames compress the
bands almost into a single line at the left of the frame. The middle frames drive them
apart and outward hard, with the air between them visibly warped like heat haze, so the
wave reads as something heavy shoving forward rather than something cutting. The last
frames stretch and dissolve the bands. No sharp points and no blade shape anywhere —
rounded blunt ends on every band, because the whole point of this one is weight.
```

---

**1·SR — Triple Shot** · `sx_toanchan_a` · #3a9d8b lõi, #a0ffe9 rìa

```
A longbow released at close range, drawn as the burst of the release and the pressure wave
it throws forward — a compact knot of teal-green light at the centre of the frame with three
mint-white streaks fanning out to the right at slightly different angles. The first frames
draw the light tight and inward as the string is pulled. The middle frames snap it outward
into the three-streak fan at its brightest and push a short flat ring of teal force ahead of
it, so the volley reads as landing with enough weight to shove a target back. The last frames
leave only a soft ring of teal haze expanding and fading. Keep the whole effect compact,
roughly two thirds the width of the frame. Draw no arrow, no bow and no arrowhead — only
the light.
```

---

**1·DW — Poison** · `sx_baidasan_a` · #7ec850 lõi, #c8ffa0 rìa

```
A poison spell discharged at close range, drawn as the burst at the staff head and the wave
it throws forward — a dense bead of sickly yellow-green light at the centre of the frame that
swells, then bursts into a short heavy spray of acid to the right. The first frames gather
the light into a tight glossy bead with a few bubbles rising off it. The middle frames blow
it open into a ragged flare and push a thick slug of green fluid forward, heavy enough to
read as a physical shove rather than a fine mist. The last frames leave a drifting veil of
green vapour that thins away. Give the green a slightly acid, slightly rotten cast rather
than a clean leafy green. Draw no staff, no orb and no flying projectile — only the burst.
```

---

## 4. Ô 2 — đơn · xa · yếu hơn · ĐỊNH THÂN

**Cả năm tấm đều là prompt MỚI.** Bản 1 không có ô này: nó xếp ô 2 là Trấn Phái (đánh lan), tức
nhầm sang việc của ô 3.

Ba điều làm nên nguyên mẫu này, thiếu một là nó tụt về "một cú bắn có màu":

1. **Neo trên con quái**, không dưới chân người niệm (`neo:'quai'`). Đây là tấm duy nhất trong
   bốn nguyên mẫu vẽ ở phía mục tiêu.
2. **Phải đọc ra là TRÓI, không phải là nổ.** Tâm pháp treo ở đây là Paralyze — khoá cứng, không
   đi được, không ra chiêu. Khung cuối phải còn lại một cái **lồng / cọc / neo** giữ chỗ, chứ
   không tắt về không.
3. **Nhỏ hơn ô 1 và nhỏ hơn hẳn ô 3** (R ~80). Đây là chiêu *yếu hơn*, và cỡ hình là thứ duy
   nhất nói được điều đó trước khi người chơi kịp đọc số.

⚠ Chừa trống phần giữa khoảng 1/4 khung: con quái đứng ngay đó và được vẽ **trước** hiệu ứng.

---

**2·DK — Lunge** · `dk_lunge` · #6aa0ff lõi, #cfe8ff rìa

```
A spectral spear driven through a target and staked into the ground behind it, seen from
slightly above. The first frames show only a thin blue line of light streaking in from the
left and a bright point where it strikes. The middle frames drive the shaft through and
punch four short blue stakes of light down into the ground in a ring around the impact
point, each one trailing a taut thread back to the shaft. The last frames leave the shaft
standing with the threads pulled tight and faintly humming, holding position rather than
fading away. Keep the centre of the frame almost empty so a creature standing there stays
visible; the light lives in the shaft, the stakes and the threads between them.
```

---

**2·SR — Penetration** · `elf_penetration` · #a0ffe9 lõi, #dff4ff rìa

```
An arrow that pins a shadow to the ground, seen from slightly above. The first frames show a
single sharp mint-green streak arriving from the left and a small bright flash where it bites.
The middle frames spread pale teal roots of light outward across the ground from that point,
branching like frost on glass and curling upward at their tips into thin hooks. The last
frames let the roots stiffen and hold, glowing steadily with the hooks closed, as if whatever
stood there is now rooted in place. Keep the palette cold teal and glacier white with no warm
tones. The centre of the frame stays almost empty; the light lives in the roots and hooks.
```

---

**2·DW — Lightning** · `dw_lightning` · #d8e84a lõi, #ffffff rìa

```
A lightning strike that turns into a cage, seen from slightly above. The first frames show a
single hard white bolt cracking down from the top of the frame into a bright point. The middle
frames scatter that bolt into six or seven crawling yellow filaments that climb outward and
upward, then bend back inward and meet, weaving a loose vertical cage of electricity. The last
frames let the cage settle and pulse in place, arcs still jumping between its bars, holding
its shape instead of dissipating. Keep the yellow acid-bright and the core white-hot. The
centre of the cage stays almost fully transparent so a creature inside would be clearly
visible; only the filaments carry real opacity.
```

---

**2·SB — Power Wave** · `mg_powerwave` · #ffcf7a lõi, #ff9a5a rìa

```
A lance of light that punches through a target and clamps shut behind it, seen from slightly
above. The first frames show a narrow golden beam driving in from the left to a bright point
of impact. The middle frames throw a small burst of sparks off that point and swing two
heavy curved brackets of molten orange light around it from either side, closing like a
trap. The last frames let the brackets lock together and glow steadily, cooling from white
to deep orange but not going out. Keep the beam thin and the brackets thick, so the image
reads as something light arriving and something heavy staying. The centre stays almost
empty.
```

---

**2·DL — Electric Spark** · `dl_electricspark` · #a8b85a lõi, #d0e07a rìa

```
A spark that lands and stakes its target down with tethers, seen from slightly above. The
first frames show a small olive-green bolt snapping in from the left to a bright point. The
middle frames blow that point open into a low flat ring of green sparks and drive five short
dark stakes into the ground around it, each one paying out a taut crackling tether toward the
centre. The last frames pull the tethers tight and hold them, sparks still running along their
length. Give the green an earthy olive cast rather than a neon green. Keep the centre almost
empty and keep everything low to the ground — this one binds the feet, it does not cover the
body.
```

---

## 5. Ô 3 — ĐÁNH LAN

Nhánh `sectTP`, **giống nhau tuyệt đối ở mã**: một vụ nổ bán kính 185 tại chỗ con trỏ chỉ,
không một dòng nào rẽ theo lớp. Tâm pháp treo ở đây là **Venom** — rải độc, mất máu dần.

**Dark Wizard đã xong**: Meteorite, atlas `meteor_rain`. Đây là tấm chủ dự án chỉ đích danh khi
nói "đánh lan", và nó là **mốc nghiệm thu** cho bốn tấm còn lại.

⚠ **Neo là vạch nền, không phải tâm ô.** Hai tấm đang chạy đo ra `anchorY` 344/384 và 317/384 —
chỗ chạm đất nằm gần **đáy** khung, thân hiệu ứng dựng lên phía trên. Vẽ tâm ở giữa khung là nổ
lơ lửng ngang bụng con quái. Vành dưới chân là **bầu dục bẹt** (nén ~0,55 theo chiều dọc), cùng
lối với bóng đổ.

⚠ Nhịp ba đoạn **dồn → nổ → tàn**, và đoạn nổ rơi vào khung 6–9 của 16 vì đó là lúc sát thương
áp xuống. Đoạn **tàn** nay phải để lại **một vũng còn sủi** trên nền — Venom là độc rút máu dần,
nên khung cuối không được sạch trơn.

---

**3·DK — Death Stab** · `sx_thieulam_c` · #4c8dff / #cfe8ff

```
A ring of spectral steel blades erupting upward out of the ground, seen from a low
three-quarter angle. The first frames show a flat oval of cold blue light spreading across
the dirt with cracks running outward from its centre. The middle frames drive eight or nine
translucent sword blades up through those cracks all at once, angled slightly outward like a
crown of spikes, each one white-hot along its edge and fading to steel blue at the tip, with
a hard shockwave ring of pale gold snapping outward across the ground at the same instant.
The last frames let the blades sink back down and break apart into blue motes, leaving the
cracked oval still glowing faintly and weeping a thin blue vapour. The ground oval is
squashed flat by perspective, much wider than it is tall, and it sits near the bottom of the
frame with the blades rising into the upper part.
```

---

**3·SR — Ice Arrow** · `sx_toanchan_c` · #3a9d8b / #dff4ff

```
A slab of ice condensing high in the air and falling to shatter on the ground, seen from a
low three-quarter angle. The first frames form a jagged blue-white crystal near the top of
the frame with frost feathering off its edges and a pale targeting glow spreading on the
ground below. The middle frames drop it hard and burst it into a spray of ice shards flung
outward, with a flat oval sheet of frost racing across the dirt away from the impact and
spikes of ice punching up around the rim. The last frames let the shards tumble and melt,
leaving a shallow oval of meltwater on the ground that still steams. Keep the palette cold
teal and glacier white with no warm tones anywhere. The frost oval is squashed flat by
perspective and sits near the bottom of the frame.
```

---

**3·SB — Flame Strike** · `sx_minhgiao_c` · #e8552a / #ff9a5a · *cắm với `cong:false`*

> ⚠ **Thử tấm `fire_pillar` đang có trước khi đặt tấm này.** Nó vẽ "cột lửa mọc từ vòng dung
> nham" — rất gần mô tả dưới đây. Chụp cả hai ở cỡ thật rồi so; nếu dùng lại được thì tiết
> kiệm một tấm. Đừng chốt bằng cách đọc câu chữ.

```
A line of fire pillars erupting from the ground one after another, seen from a low
three-quarter angle. The first frames show a molten seam splitting the dirt in a flat oval
with orange light pulsing up through the crack. The middle frames throw up five or six
columns of ember-orange flame in a rough ring, the nearest ones tallest, each one white-hot
at the base and breaking into torn flame tongues near the top, with a ring of sparks blowing
outward across the ground. The last frames let the columns collapse inward, leaving glowing
cinders, a low crawl of dark smoke and a pool of molten slag that keeps bubbling. Give the
smoke real presence and real darkness rather than a light haze; it is part of the shape, not
a veil over it. The molten oval is squashed flat by perspective and sits near the bottom of
the frame.
```

---

**3·DL — Fire Scream** · `sx_bug_c` · #8a9a3a / #ffb15c · *cắm với `cong:false`*

```
Three burning fissures tearing outward across the ground and meeting in one upward blast,
seen from a low three-quarter angle. The first frames crack the dirt along three arms
radiating from a centre point, olive-green light glowing in the splits before it turns
orange. The middle frames slam all three arms back into the centre and blow a single wide
column of orange fire straight up, ringed at its base by a flat oval of scorched ground and
a hard outward shockwave. The last frames let the column fall apart into a rolling ball of
dark smoke while the fissures cool from orange to dull red and keep venting thin green
fumes. The blast should read as something summoned by a shout, ragged and uneven, not as a
tidy magical circle. The scorch oval is squashed flat by perspective and sits near the
bottom of the frame.
```

---

## 6. Ô 4 — hào quang phù trợ

Nhánh `castVohoc` → `type:'buff'`, bán kính 95, bọc quanh chính người niệm. **Ô duy nhất không
treo tâm pháp** — nó không đánh trúng ai.

⚠ **Chỗ dễ vẽ sai nhất.** Buff kéo dài 4–8 giây còn hoạt ảnh chỉ 0,75 giây ⇒ tranh này là
**khoảnh khắc BẬT**, không phải trạng thái đang bật. Vẽ một quả cầu đứng im là người chơi thấy
nó chớp một cái rồi biến, trong khi buff còn chạy thêm bảy giây nữa mà không dấu hiệu gì. Cả
năm tấm phải là **một thứ dâng lên từ dưới chân rồi đóng lại quanh thân**, kết thúc ở một hình
còn đọng lại. Khung cuối là khung người chơi nhớ.

⚠ **Chừa trống ở giữa** khoảng 1/3 khung — nhân vật đứng ngay đó và được vẽ SAU hào quang.

---

**4·DK — Bulwark** · `dk_bulwark` · #6aa8ff · *khiên 28% Sinh Lực + 12% sát thương, 8 s*

```
A defensive barrier snapping shut around an empty space, seen from slightly above. The first
frames draw a flat steel-blue ring on the ground that brightens and lifts. The middle frames
raise interlocking hexagonal plates of translucent blue light up out of that ring, tilting
inward as they climb until they close into a tall dome, each plate edged in pale gold and
faintly scored with a straight engraved line. The last frames settle the dome, let the plate
edges pulse once together, and leave it standing as a calm shell rather than fading out. The
centre of the dome stays almost fully transparent so the figure inside would be clearly
visible; only the plate edges and the ground ring carry real opacity.
```

---

**4·SR — Bless** · `elf_greaterdmg` · #ffd76a · *hồi 25% Sinh Lực + 25% sát thương, 8 s*

```
A blessing settling down over an empty space from above, seen from slightly above. The first
frames open a warm golden ring in the air near the top of the frame and let soft light rain
down from it in slow broad shafts. The middle frames bring the light to the ground where it
spreads into a flat glowing oval, and lift a slow drift of pale green leaves and small
golden motes back upward through the shafts. The last frames leave a steady halo ring
hanging low and turning gently, with the motes still rising. Keep the motion unhurried and
buoyant, the opposite of an explosion. The centre stays almost fully transparent; the light
lives in the ring, the shafts and the rising motes.
```

---

**4·DW — Soul Barrier** · `dw_shield` · #5ab8e8 · *khiên 45% Sinh Lực, 6 s* · **prompt mới**

```
A shell of bound spirits closing around an empty space, seen from slightly above. The first
frames draw a pale cyan ring on the ground and let thin wisps rise off it. The middle frames
pull those wisps up into six or seven translucent robed shapes with no faces, which rise,
turn inward and link arms until they form a continuous ring standing shoulder to shoulder,
their trailing edges merging into a single rippling veil. The last frames let the veil settle
and breathe slowly in place, holding. Keep the spirits pale and thin rather than solid, so
the whole shell reads as fabric and mist rather than as armour — this is the thinnest class
in the game and its shield should look borrowed, not built. The centre stays almost fully
transparent.
```

---

**4·SB — Battle Fury** · `mg_battlefury` · #e8552a · *+20% sát thương, +22% tốc đánh, 6 s*

```
A surge of combat rage boiling up around an empty space, seen from slightly above. The first
frames crack a ragged orange ring into the ground and push short jets of flame up through
it. The middle frames let the flame climb into a rough spiral that turns fast around the
empty centre, shedding sparks outward, with two or three hot white flare lines whipping up
the spiral and off the top. The last frames tighten the spiral into a low fast-spinning
collar of fire around waist height and hold it there, still turning. This one should feel
faster and more unstable than the others, all forward pressure and no ceremony. The centre
stays almost fully transparent.
```

---

**4·DL — Increase Critical Damage** · `dl_commandaura` · #ff6a5a · *bạo kích tuyệt đối, 4 s*

```
A commander's war cry taking physical form around an empty space, seen from slightly above.
The first frames stamp a dark olive ring into the ground and send a single hard red
shockwave outward from it across the dirt. The middle frames raise four heavy banners of
red-orange light standing upright around the empty centre, angled outward like a crown, each
one rippling as if caught in wind, with sharp red chevron marks climbing them. The last
frames let the banners settle and beat slowly in place, holding their shape. This is the
shortest buff in the game at four seconds, so make the opening shockwave the loudest moment
and give the standing banners an obvious countdown feel by having them lean slightly further
outward each frame. The centre stays almost fully transparent.
```

---

## 7. Tâm Pháp — CHỈ ICON, 6 tấm 128 × 128

Sáu Tâm Pháp là bị động **luôn chạy, không chiếm ô, không tung ra**. Không có gì nổ trên màn
hình ⇒ không cần atlas. Đúng như chủ dự án chốt.

⚠ Chúng **không phải sáu thứ rời**. Mỗi cặp treo trên một ô, một vế **gây** và một vế **kháng**
chính cái hiệu ứng đó. Người chơi phải nhìn hai ô mà thấy ngay chúng là một cặp ⇒ **cùng cặp thì
cùng bố cục, cùng vật thể, đảo trạng thái; khác cặp thì khác hẳn vật thể.**

| treo ở ô | vế GÂY | vế KHÁNG | mô-típ chung |
|---|---|---|---|
| **1** · gần | **Crushing Force** `#ff8a5a` — đẩy lùi + bạo kích | **Steadfast** `#a0d8ff` | **búa nện** — búa đang giáng ↔ cái đe hứng trọn |
| **2** · xa | **Paralyze** `#ffe08a` — định thân | **Unbound** `#a0ffe9` | **sợi xích** — xích đang siết ↔ xích đã đứt |
| **3** · lan | **Venom** `#7ec850` — độc rút máu dần | **Antidote** `#c8e87a` | **giọt độc** — giọt đang rơi ↔ giọt bị lọc qua |

Quy cách: **128 × 128, nền ĐẶC** (toả tròn, sáng ở tâm, tối dần ra rìa), một vật thể duy nhất
chiếm gần trọn ô, chừa mép 3 px, không khung viền, không chữ. Khớp bộ icon đang chạy
(`meteorite` · `inferno` · `dragonspirit`).

Dán câu này vào cuối cả sáu:

```
Paint it as a single game skill icon: one clear object filling most of a square panel, thick
painted shapes with a bold rim light, sitting on a dark radial background that is brightest
right behind the object and falls off to near black at the corners. Keep it readable when
shrunk to the size of a thumbnail, so favour one strong silhouette over many small details.
No border frame, no text, no numbers.
```

---

**T1 · Crushing Force** · `tp_crush` · #ff8a5a · *vế gây, ô 1*

```
A heavy blacksmith's hammer caught at the bottom of its swing, head-on and slightly tilted,
the moment the head lands. Hot orange cracks blow outward from the point of impact in a
short radial burst, and the hammer head itself glows orange along its striking face from the
force of the blow. The haft runs from the lower left corner up to the head at the centre.
Everything reads as a downward strike frozen at the instant it connects.
```

**T2 · Steadfast** · `tp_stead` · #a0d8ff · *vế kháng, ô 1*

```
A blacksmith's anvil seen head-on, planted dead centre and taking a blow without moving. A
pale blue shockwave ring spreads off its top face and dissipates harmlessly, and cold blue
light rims its upper edges where the strike landed. Faint blue impact lines come down from
the top of the panel and stop short against the anvil rather than passing through it. The
anvil should look immovable and slightly too heavy for its size.
```

---

**T3 · Paralyze** · `tp_para` · #ffe08a · *vế gây, ô 2*

```
A short length of heavy chain pulled taut across the panel from corner to corner, every link
straining, with pale yellow electricity crawling along the metal and arcing between the
links. The chain is at its tightest, the links visibly deformed by the pull. A faint yellow
glow bleeds off the chain into the dark background. It should read as something being held
still by force, not as something being dragged.
```

**T4 · Unbound** · `tp_unbound` · #a0ffe9 · *vế kháng, ô 2*

```
The same heavy chain, but snapped clean through at its middle, the two broken ends flying
apart toward opposite corners with the severed links tumbling loose. Bright mint-green light
bursts from the break point where the metal gave way, and the freed ends trail thin green
streaks behind them. The chain links should be recognisably the same metal and the same
weight as an intact chain, so the two images read as before and after.
```

---

**T5 · Venom** · `tp_venom` · #7ec850 · *vế gây, ô 3*

```
A single fat droplet of venom falling through the centre of the panel, its surface glossy
and sickly yellow-green, with a thin trail of vapour rising behind it and two smaller
droplets falling just behind. Below it the surface it is about to hit is already pitted and
smoking where earlier drops landed. Give the green an acid, slightly rotten cast rather than
a clean leafy green, and let a faint green glow bleed off the droplet into the dark.
```

**T6 · Antidote** · `tp_anti` · #c8e87a · *vế kháng, ô 3*

```
The same venom droplet, caught mid-fall as it passes through a horizontal membrane of pale
yellow-green light stretched across the centre of the panel. Above the membrane the drop is
dark and sickly; the part that has passed through comes out clear and bright, the poison
visibly stripped out of it. The membrane ripples outward in rings from the point where the
drop crosses. Keep the droplet the same shape and size as the untreated one so the two
images read as a pair.
```

---

## 8. Đường nhập — không sửa một dòng máy nào

```bash
# ① gói meowa → atlas (đọc lưới từ .tres, cắt đuôi rỗng, đo anchor)
python3 tools/vfx_meowa.py <thư-mục-gói> sx_thieulam_c --neo <hàng-nền> --sat <bán-kính-nền>
#   --caro   sheet dính lưới ô vuông trong suốt
#   --suong  vùng sương bị xuất thành lưới rung
#   --sang gamma,gain,sat   gói sáng < ~40 (ĐO trước, đừng áp bừa)

# ② khai vào VFX_ATLAS_DEFS (game.js) — công cụ in sẵn dòng để dán
# ③ khai vào CHIEU_TRANH (game.js):
#    ô 2 → { atlas:'…', neo:'quai', co:1 }      (neo trên con quái)
#    ô 3 → { atlas:'…', neo:'quai', co:0.62 }   (giáng xuống đất chỗ con trỏ)
# ④ GỠ dòng tương ứng trong SECT_VFX / VH_VFX
```

⚠ Bước ④ hay bị quên. `spawnSkillVfx` gặp chiêu trong `CHIEU_TRANH` là **`return` ngay**, nên
dòng cũ không nổ lỗi — nó chỉ nằm đó, và người sau đọc sẽ tưởng chiêu còn dùng hình vector.

### Icon cắt RA TỪ chính atlas của chiêu đó

```bash
python3 tools/icon_chieu.py sx_thieulam_c 8 assets/skills/tl_o3.png \
        --defs 8,384,384 --nen "#1a2a4a,#060a14"
```

⇒ **Mỗi atlas cho ra một icon miễn phí.** Ô kỹ năng và thứ nổ trên màn hình là MỘT — vẽ tay một
biểu tượng riêng là mở đường cho hai thứ trôi dần khỏi nhau. Riêng 6 icon Tâm Pháp không có
atlas ⇒ sinh ảnh tĩnh rồi khai thẳng `icon:'assets/skills/tp_crush.png'` vào `VOHOC_DEFS`.

---

## 9. ⚠ Hai thứ phát hiện lúc đo — đừng cắm nhầm

### 9.1 Tám tấm icon nằm trong kho mà không được nối, và chúng là đồ hỏng

`assets/skills/` có 15 tấm PNG 128×128, nhưng `SECT_ART` chỉ khai **một** (`meteorite.png`).
Tám tấm còn lại nằm im. **Đừng "sửa" bằng cách nối vào.** Chụp ra nhìn:

| tấm | thứ thật sự vẽ trên đó |
|---|---|
| `tl_a` · `tl_tp` (Dark Knight) | **một đồng tiền vàng.** Hai tấm, cùng một đồng |
| `mg_a` · `mg_tp` (Spellblade) | hai tấm **giống hệt nhau**, một mảng hồng-vàng không đọc ra hình gì |
| `bd_a`/`tc_a` · `bd_tp`/`tc_tp` | cùng một mô-típ trăng lưỡi liềm, chỉ đổi màu |

Clip-art sót lại từ đời trước. Việc đúng là **thay**, và đơn hàng này đã bao gồm phần thay đó.
Dark Lord thì chưa từng có tấm nào.

### 9.2 Icon kỹ năng hiện là VECTOR — lỗ thủng của Quy tắc số 3

`probeSkillIcons()` thấy `SECT_ART` rỗng là gọi `genSkillIcon()` dựng icon bằng `canvas`.
CLAUDE.md chừa ngoại lệ vector cho icon **vật phẩm tiêu hao**, không chừa cho icon kỹ năng.
⇒ Làm nửa vời thì hai ô cạnh nhau trên cùng một thanh chiêu, một ô tranh thật một ô hình học.

---

## 10. Nghiệm thu — đo, đừng nhìn

| # | đo gì | ngưỡng | vì sao |
|---|---|---|---|
| 1 | `alpha = 0` chiếm bao nhiêu % | **≥ 25%** | dưới ngưỡng là nền đặc bị nướng vào tranh — hai tấm trùm đời trước chết đúng ở đây (đo ra 0,0%) |
| 2 | độ sáng trung bình | **> 40** | dưới đó là hiệu ứng tối hơn nền đêm (~52) ⇒ đọc thành vệt mực |
| 3 | tâm nội dung lệch giữa các khung | **< 8 px** | `anchorX/anchorY` là MỘT cặp số cho cả tấm; khung lệch tâm là khung giật |
| 4 | thu về cỡ thật rồi **chụp trong màn** | mắt | ba lỗi hình của đợt trang bị chỉ lộ khi chụp ra xem |

```bash
python3 - <<'PY'
from PIL import Image; import numpy as np, sys
a = np.asarray(Image.open(sys.argv[1]).convert('RGBA'), float)
al = a[...,3]; rgb = a[...,:3].mean(2)
print('alpha0 %.1f%%  sang %.1f  lechchuan %.3f' % ((al<8).mean()*100, rgb[al>16].mean(), (rgb/255).std()))
PY
```

⚠ **Lệch chuẩn** — độ tách giữa các mảng sáng tối BÊN TRONG hiệu ứng — mới dự đoán được "đọc ra
hay không", không phải độ sáng trung bình. Ngưỡng cũ tôi tự đặt (*"chênh sáng với nền > 0,28"*)
đã **sai**, và con trùm thứ hai chứng minh ngay: nó ở 0,273 tức trượt ngưỡng, nhưng chụp ra thì
đọc rõ từng chi tiết. Dưới ~0,12 mới cần nâng sáng; trên đó để nguyên.

---

## 11. Tổng đơn

| ô | nguyên mẫu | số tấm | đã có | còn đặt |
|---|---|---|---|---|
| 1 | đơn · gần · đẩy lùi | 5 | 0 | **5** |
| 2 | đơn · xa · định thân | 5 | 0 | **5** |
| 3 | đánh lan | 5 | 1 (DW `meteor_rain`) · 1 *có thể mượn* `fire_pillar` | **3–4** |
| 4 | hào quang | 5 | 0 | **5** |
| — | icon Tâm Pháp | 6 | 0 | **6** |
| | | **26** | 1–2 | **24–25** |

Icon của 20 chiêu **không đặt thêm** — cắt ra từ chính atlas của chúng.

### Thứ tự thi công

1. **Ô 3 một tấm trước** (Death Stab hoặc Fire Scream) — đã có `meteor_rain` làm mốc so ngay
   trong game. Chụp trong màn, chốt tông.
2. **Thử `fire_pillar` cho Flame Strike** — nếu dùng lại được thì bớt một tấm.
3. **Ba tấm ô 3 còn lại.**
4. **Năm tấm ô 2** — nguyên mẫu mới nhất, chưa có gì để so, nên làm sau khi mắt đã quen tông.
5. **Năm tấm ô 4** — khuôn giống nhau nhất, làm liền một mạch.
6. **Năm tấm ô 1 — CUỐI.** Phải xong việc xoay atlas ở §2.1 trước, nếu không thì nhận về một
   gói không cắm được.
7. **Sáu icon Tâm Pháp** — lúc nào cũng được, không phụ thuộc gì, và là phần duy nhất Gemini
   làm được.

### ⚠ Ba việc CƠ CHẾ không nằm trong đơn art, nhưng art vô nghĩa nếu thiếu

1. `VO_CONG_BO[<lớp>] = ['a', <chiêu bộ 2>, 'tp']` cho cả năm lớp — §1.1.
2. Kéo chiêu bộ 2 lên thanh, gỡ khỏi `LEGACY_SECT_SKILLS`, bù lại cho đủ **+8,0% mỗi lớp** — §1.2 ②.
3. `SECTS[*].skillA` thêm `kb`, và đảo uy lực ô 1 ↔ ô 3 — §1.2 ①.
