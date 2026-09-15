# Prompt sinh art — 3 kỹ năng cơ bản × 5 lớp + icon Tâm Pháp

Đơn hàng mục 6 (bản duyệt art 15-09-2026). Số liệu đọc thẳng từ `public/game/game.js`
(`castSkill`, `spawnSkillVfx`, `VFX_ATLAS_DEFS`, `CHIEU_TRANH`) và `public/game/data/canbang.js`
(`SECTS`, `VOHOC_DEFS`) tại `main`. Lối viết theo `docs/npc-prompts.md §2.2`.

---

## 0. Chủ dự án nói đúng, và mã nguồn xác nhận từng chữ

> *"Về cơ bản tất cả là sẽ giống nhau. Nó chỉ khác nhau về hình thái/hình dạng thôi."*

Đo được: **ba ô đầu của thanh chiêu đi qua ĐÚNG BA NHÁNH mã, dùng chung cho cả năm lớp.**
Không lớp nào có nhánh riêng.

| ô | nhánh trong `castSkill` | khoá VFX | giống nhau ở chỗ nào |
|---|---|---|---|
| **1** | `d.kind === 'sectA'` | `sx_<lop>_a` | một nhánh, bốn `type` (`cone`/`proj`) đọc từ `SECTS[x].skillA.type` |
| **2** | `d.kind === 'sectTP'` | `sx_<lop>_c` | **một nhánh, 0 rẽ theo lớp** — AoE bán kính `TP_RADIUS` = 185 tại con trỏ |
| **3** | `castVohoc` → `v.type === 'buff'` | chính id chiêu | một nhánh, hào quang bán kính 95 trên người niệm |

⇒ Đơn hàng vì thế là **3 nguyên mẫu × 5 lớp**, không phải 15 thiết kế rời. Hoạ sĩ vẽ ba
khuôn động, rồi thay chất liệu và màu năm lần.

### 0.1 Đã có 2/15 ô — dùng làm chuẩn, đừng vẽ lại

| ô | lớp | atlas đang chạy |
|---|---|---|
| 2 | Dark Wizard | `meteor_rain` (Meteorite) |
| 3 | Dark Wizard | `fire_pillar` (Inferno) |

⇒ **Còn 13 tấm.** Hai tấm trên là mốc nghiệm thu: gói mới phải đứng cạnh chúng mà không lạc.

### 0.2 ⚠ MỘT VIỆC MÃ PHẢI LÀM TRƯỚC KHI Ô 1 CẮM ĐƯỢC

`spawnAtlasVfx(id, x, y, scale)` **không nhận góc** — vòng vẽ (`case 'atlasVfx'`) gọi
`drawImage` trần, không `ctx.rotate`, không lật. Hai tấm đang chạy không lộ ra chuyện đó vì cả
hai **giáng xuống đất** (`neo:'quai'`), mà một hố thiên thạch thì không có hướng.

Ô 1 thì có hướng: ba lớp là quạt chém theo `player.face`, hai lớp là loé đầu nòng theo hướng
bắn. Cắm tranh vào mà không xoay là **chiêu luôn quét sang phải, kể cả lúc nhân vật quay trái**.

Ba lối, đã cân:

| lối | giá |
|---|---|
| vẽ tranh đối xứng tròn | nói dối về cái quạt 120° — sát thương hình quạt, hình thì hình tròn |
| vẽ đủ 8 hướng | ×8 số khung, ×8 dung lượng, ×8 tiền |
| **thêm `goc` vào `spawnAtlasVfx` + vẽ một hướng ĐÔNG** | ~6 dòng mã, đúng khuôn `drawMob` đã lật sprite quái |

⇒ **Chọn lối thứ ba.** Mọi prompt ô 1 dưới đây vẽ **quay sang PHẢI**, và tôi cắm phần xoay
lúc art về. Đừng đặt tranh ô 1 khi chưa có việc đó — đặt trước là nhận về một gói không cắm
được.

Ô 2 và ô 3 **không cần** việc này: ô 2 giáng xuống đất, ô 3 bọc quanh người — cả hai đối xứng.

### 0.3 Gemini hay meowa

Giống kết luận của đợt quái: **hoạt ảnh thì chỉ meowa** (`meowa-animation-run`), Gemini không
giữ được nhận dạng qua các khung. Icon Tâm Pháp (mục 4) là ảnh tĩnh ⇒ Gemini dùng được, nhưng
phải bóc nền.

Và vẫn đúng nếp cũ: **chốt khung đầu tiên trước, rồi mới nướng cả vòng.**

---

## 1. Quy cách kỹ thuật — đọc trước khi mở meowa

Ba con số dưới đây là **hợp đồng**, không phải gợi ý. Chúng lấy từ ba atlas đang chạy.

```
Mỗi khung 384 × 384, nền TRONG SUỐT hoàn toàn.
Xếp 8 khung một hàng, trái sang phải, rồi xuống hàng.
Không viền khung, không chữ, không số, không bệ, không bóng đổ.
```

| nguyên mẫu | khung | hàng | fps | thời lượng | neo |
|---|---|---|---|---|---|
| **A · đòn chính** | 8 | 1 | 18 | 0,44 s | giữa người niệm, hiệu ứng toả sang PHẢI |
| **B · Trấn Phái** | 16 | 2 | 20 | 0,80 s | **vạch nền ở khoảng 88% chiều cao khung** |
| **C · hào quang** | 12 | 2 | 16 | 0,75 s | giữa người niệm |

### 1.1 Cỡ thật trên màn — vẽ theo số này, đừng vẽ theo cảm giác

Nhân vật trong màn cao **95 px** (`NV_THAN_PX`). Quy ra:

| | bán kính sát thương | vẽ ra | so với nhân vật |
|---|---|---|---|
| A · quạt chém | 125 px, mở ±57° | ~125 px tầm với | **1,3 lần chiều cao** |
| A · loé đầu nòng | — | R 60 | **0,6 lần** |
| B · Trấn Phái | 185 px | ×`co` 0,62 ⇒ ~115 px bán kính | **2,4 lần chiều cao, tính bề ngang** |
| C · hào quang | — | R 95 | **2 lần chiều cao, tính bề ngang** |

⚠ `co` 0,62 ở ô 2 **không phải sai số** — vẽ đúng 185 px bán kính thì một con quái cao 70 px
nằm lọt thỏm trong đám cháy, nhìn ra "nổ tung góc màn hình" chứ không ra "trúng con kia".
Nhưng luật ngược lại cũng cứng: **hình không bao giờ được LỚN HƠN vòng sát thương** — vẽ trùm
qua con quái mà nó không mất máu là hứa suông.

### 1.2 ⚠ Sáng hơn nền, nếu không thì nó là một vệt bóng

Bản đồ ban đêm sáng ~52. Gói Dragon Spirit gốc sáng ~25 — tức **tối hơn nền**, và trong màn nó
đọc thành vệt mực chứ không thành một chiêu; đã phải nâng sáng lúc nhập
(`tools/vfx_meowa.py --sang`).

⇒ Nói thẳng trong prompt: hiệu ứng tự phát sáng, sáng hơn cả nền cỏ ban ngày lẫn nền đầm lầy
ban đêm. Gói nào có **khói tối là phần nội dung** (cột lửa, hố thiên thạch) thì khai
`cong:false` lúc cắm — cộng sáng sẽ xoá sạch cụm khói.

### 1.3 Một câu phong cách, dán vào CUỐI mọi prompt

```
Render it as a game visual effect on a fully transparent background: painted cel-shaded
energy with clean chunky shapes rather than fine sparkle dust, bold saturated colour that
stays readable over both a bright grass field and a dark swamp at night, and a crisp bright
core fading to a soft coloured edge. Keep every frame the same canvas size with the effect
centred the same way, so the frames play back as one continuous motion. No character, no
weapon, no ground, no shadow, no frame, no text and no numbers anywhere in the image.
```

Ba điều trong đó là kỹ thuật, không phải thẩm mỹ:
- **không vẽ nhân vật** — game vẽ nhân vật riêng, tranh có người là hai người chồng nhau;
- **mọi khung cùng cỡ, cùng tâm** — `anchorX/anchorY` là **một cặp số cho cả tấm**, khung nào
  lệch tâm là khung đó giật;
- **nền trong suốt** — hai tấm trùm đời trước chết đúng ở chỗ này (`alpha=0` chiếm 0,0%).

---

## 2. NGUYÊN MẪU A — Đòn chính (ô 1) · 5 tấm

Nhánh `sectA`. Đây là chiêu người chơi bấm nhiều nhất trong cả trận, nên nó phải **ngắn, đọc
ngay, và không che mất bầy quái**. Đừng vẽ hoành tráng ở đây — chỗ hoành tráng là ô 2.

A tách làm hai hình dạng vì `SECTS[x].skillA.type` tách làm hai:

| | lớp | type | vẽ cái gì |
|---|---|---|---|
| **A-quạt** | Dark Knight · Spellblade · Dark Lord | `cone` | vệt quét hình quạt rời khỏi người, sang phải |
| **A-loé** | Sylvan Ranger · Dark Wizard | `proj` | **chỉ loé đầu nòng**, viên đạn là hệ khác vẽ |

⚠ A-loé **không vẽ mũi tên, không vẽ quả cầu**. Đạn bay do `projectiles` lo, có `style` riêng
(`proj:'arrow'` / `'serpent'`). Vẽ thêm mũi tên vào atlas là hai mũi tên bay lệch nhau.

---

**A1 · `sx_thieulam_a` — Twisting Slash** · Dark Knight · #4c8dff lõi, #ffe9a0 rìa

```
A single heavy two-handed sword sweep, drawn only as the trail the blade leaves behind — a
wide crescent of cold steel-blue light opening from the left of the frame and whipping out
to the right, thickest at its middle and tapering to a hair-thin point at both ends. The
first frames show the arc compressed and coiled back on itself, the middle frames snap it
open into a full wide crescent with a pale gold flare running along its leading edge, and
the last frames let it thin out and drift apart into three or four torn ribbons. Keep the
shape flat and ribbon-like as if seen from slightly above, not a glowing tube. A few small
chips of blue light scatter forward ahead of the arc as it opens.
```

---

**A2 · `sx_minhgiao_a` — Fire Slash** · Spellblade · #e8552a lõi, #ffb060 rìa

```
A broad blade sweep made of fire, drawn only as the burning trail — a wide crescent of
ember-orange flame opening from the left and lashing out to the right, with the inner edge
white-hot and the outer edge breaking up into curling orange flame tongues. The first frames
show the fire gathered and coiled tight, the middle frames tear it open into a full wide arc
with a hot white core line down its length, and the last frames let the flame separate into
floating embers that drift upward and fade. Unlike a clean steel arc this one should look
ragged and alive along its outer edge, as if the fire is still eating outward. Keep it flat
and read from slightly above.
```

---

**A3 · `sx_bug_a` — Force Wave** · Dark Lord · #8a9a3a lõi, #d0e07a rìa

```
A blunt shockwave punched out of a commander's sceptre, drawn as a stack of three or four
nested crescent bands of olive-green force travelling to the right, the innermost one
brightest and the outer ones thinner and more transparent. The first frames compress the
bands almost into a single line at the left of the frame, the middle frames push them apart
and outward so the wave visibly travels, and the last frames stretch and dissolve them. The
air between the bands is faintly warped, like heat haze but green. This one should read as
pressure and weight rather than as a cutting edge — no sharp points, no blade shape,
rounded blunt ends on every band.
```

---

**A4 · `sx_toanchan_a` — Triple Shot (loé đầu nòng)** · Sylvan Ranger · #3a9d8b lõi, #a0ffe9 rìa

```
The release flash of a longbow firing, and nothing else — a compact burst of teal-green
light at the centre of the frame with three short mint-white streaks fanning out to the
right at slightly different angles, each streak only about as long as the burst is wide.
The first frames show the light drawn tight and inward as the string is pulled, the middle
frames snap it outward into the three-streak fan at its brightest, and the last frames leave
only a soft ring of teal haze expanding and fading. Keep the whole effect small and quick,
roughly half the width of the frame, because it fires many times in a row. Draw no arrow, no
bow and no arrowhead — only the light of the release.
```

---

**A5 · `sx_baidasan_a` — Poison (loé đầu nòng)** · Dark Wizard · #7ec850 lõi, #c8ffa0 rìa

```
The casting flash of a poison spell at a staff head, and nothing else — a small knot of
sickly yellow-green light at the centre of the frame that swells, then spits a short spray
of acid droplets to the right. The first frames gather the light into a tight dense bead
with a few bubbles rising off it, the middle frames bloom it into a ragged flare with the
droplets flung outward, and the last frames leave a thin drifting veil of green vapour that
thins away. Give the green a slightly acid, slightly rotten cast rather than a clean leafy
green. Keep the whole effect small and quick, roughly half the width of the frame. Draw no
staff, no orb and no flying projectile — only the light of the cast.
```

---

## 3. NGUYÊN MẪU B — Trấn Phái (ô 2) · 4 tấm

Nhánh `sectTP`, **giống nhau tuyệt đối ở mã**: một vụ nổ bán kính 185 tại chỗ con trỏ chỉ.
Đây là chiêu hoành tráng của lớp, hồi chiêu dài, người chơi ngắm rồi mới bấm.

⚠ **Neo là VẠCH NỀN, không phải tâm ô.** Hai tấm đang chạy đo ra `anchorY` 344/384 và 317/384 —
tức chỗ chạm đất nằm gần **đáy** khung, phần thân hiệu ứng dựng LÊN phía trên. Vẽ tâm ở giữa
khung là chiêu nổ lơ lửng ngang bụng con quái.

⚠ **Vẽ theo góc nhìn của game: chếch từ trên xuống.** Vành lửa/vành băng dưới chân là một hình
**bầu dục bẹt**, không phải hình tròn — nén khoảng 0,55 theo chiều dọc, cùng lối với bóng đổ.

Bốn tấm dưới đây cùng một nhịp ba đoạn: **① dồn → ② nổ → ③ tàn**. Đoạn ② phải rơi vào
khoảng khung 6–9 của 16, vì đó là lúc sát thương thật sự áp xuống.

---

**B1 · `sx_thieulam_c` — Death Stab** · Dark Knight · #4c8dff / #cfe8ff

```
A ring of spectral steel blades erupting upward out of the ground, seen from a low
three-quarter angle. The first frames show a flat oval of cold blue light spreading across
the dirt with cracks running outward from its centre. The middle frames drive eight or nine
translucent sword blades up through those cracks all at once, angled slightly outward like a
crown of spikes, each one white-hot along its edge and fading to steel blue at the tip, with
a hard shockwave ring of pale gold snapping outward across the ground at the same instant.
The last frames let the blades sink back down and break apart into blue motes while the
ground cracks dim. The ground oval is squashed flat by perspective, much wider than it is
tall, and it sits near the bottom of the frame with the blades rising into the upper part.
```

---

**B2 · `sx_toanchan_c` — Ice Arrow** · Sylvan Ranger · #3a9d8b / #dff4ff

```
A slab of ice condensing high in the air and falling to shatter on the ground, seen from a
low three-quarter angle. The first frames form a jagged blue-white crystal near the top of
the frame with frost feathering off its edges and a pale targeting glow spreading on the
ground below. The middle frames drop it hard and burst it into a spray of ice shards flung
outward, with a flat oval sheet of frost racing across the dirt away from the impact and
spikes of ice punching up around the rim. The last frames let the shards tumble, lose their
glow and melt into thin white vapour. Keep the palette cold teal and glacier white with no
warm tones anywhere. The frost oval is squashed flat by perspective and sits near the bottom
of the frame.
```

---

**B3 · `sx_minhgiao_c` — Flame Strike** · Spellblade · #e8552a / #ff9a5a

```
A line of fire pillars erupting from the ground one after another, seen from a low
three-quarter angle. The first frames show a molten seam splitting the dirt in a flat oval
with orange light pulsing up through the crack. The middle frames throw up five or six
columns of ember-orange flame in a rough ring, the nearest ones tallest, each one white-hot
at the base and breaking into torn flame tongues near the top, with a ring of sparks blowing
outward across the ground. The last frames let the columns collapse inward, leaving glowing
cinders and a low crawl of dark smoke. Give the smoke real presence and real darkness rather
than a light haze; it is part of the shape, not a veil over it. The molten oval is squashed
flat by perspective and sits near the bottom of the frame.
```

*Gói này có khói tối ⇒ cắm với `cong:false`, như `meteor_rain` và `fire_pillar`.*

---

**B4 · `sx_bug_c` — Fire Scream** · Dark Lord · #8a9a3a / #ffb15c

```
Three burning fissures tearing outward across the ground and meeting in one upward blast,
seen from a low three-quarter angle. The first frames crack the dirt along three arms
radiating from a centre point, olive-green light glowing in the splits before it turns
orange. The middle frames slam all three arms back into the centre and blow a single wide
column of orange fire straight up, ringed at its base by a flat oval of scorched ground and
a hard outward shockwave. The last frames let the column fall apart into a rolling ball of
dark smoke that lifts and thins while the fissures cool from orange to dull red. The blast
should read as something summoned by a shout, ragged and uneven, not as a tidy magical
circle. The scorch oval is squashed flat by perspective and sits near the bottom of the
frame.
```

*Cũng có khói tối ⇒ `cong:false`.*

---

## 4. NGUYÊN MẪU C — Hào quang phù trợ (ô 3) · 4 tấm

Nhánh `castVohoc` → `type:'buff'`, bán kính 95, **bọc quanh chính người niệm**.

⚠ **Đây là chỗ dễ vẽ sai nhất trong cả đơn hàng.** Buff kéo dài 4–8 giây còn hoạt ảnh chỉ
0,75 giây — tức tranh này là **khoảnh khắc BẬT**, không phải trạng thái đang bật. Vẽ một quả
cầu năng lượng đứng im là người chơi thấy nó chớp một cái rồi biến, còn buff thì vẫn chạy
thêm bảy giây nữa mà không có dấu hiệu gì.

⇒ Cả bốn tấm phải là **một thứ dâng LÊN từ dưới chân rồi đóng lại quanh thân**, kết thúc ở
một hình còn đọng lại chứ không tắt về không. Khung cuối là khung người chơi nhớ.

⚠ **Chừa trống ở giữa.** Nhân vật đứng ngay đó và vẽ SAU hào quang. Vùng giữa khung, rộng
chừng 1/3, phải gần như trong suốt — nếu không thì mặt nhân vật bị đè.

---

**C1 · `dk_bulwark` — Bulwark** · Dark Knight · #6aa8ff · *khiên 28% Sinh Lực + 12% sát thương, 8 s*

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

**C2 · `elf_greaterdmg` — Bless** · Sylvan Ranger · #ffd76a · *hồi 25% Sinh Lực + 25% sát thương, 8 s*

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

**C3 · `mg_battlefury` — Battle Fury** · Spellblade · #e8552a · *+20% sát thương, +22% tốc đánh, 6 s*

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

**C4 · `dl_commandaura` — Increase Critical Damage** · Dark Lord · #ff6a5a · *bạo kích tuyệt đối 4 s*

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

## 5. Tâm Pháp — CHỈ ICON, 6 tấm 128 × 128

Sáu Tâm Pháp là bị động **luôn chạy, không chiếm ô, không tung ra** (`cat:'Tâm Pháp'` trong
`VOHOC_DEFS`). Không có gì nổ trên màn hình ⇒ không cần atlas. Đúng như chủ dự án chốt.

### 5.1 ⚠ Ba CẶP khắc chế — icon phải đọc ra là từng cặp

Chúng không phải sáu thứ rời. Mỗi cặp treo trên một bộ võ công, một vế **gây** và một vế
**kháng** chính cái hiệu ứng đó. Người chơi phải nhìn hai ô mà thấy ngay chúng là một cặp.

| bộ | vế GÂY | vế KHÁNG | mô-típ chung của cặp |
|---|---|---|---|
| 1 · đơn · gần | **Crushing Force** `#ff8a5a` | **Steadfast** `#a0d8ff` | **cái búa nện** — gây là búa đang giáng, kháng là cái đe hứng trọn nhát búa đó |
| 2 · đơn · xa | **Paralyze** `#ffe08a` | **Unbound** `#a0ffe9` | **sợi xích** — gây là xích đang siết, kháng là xích đã đứt |
| 3 · AoE quanh | **Venom** `#7ec850` | **Antidote** `#c8e87a` | **giọt độc** — gây là giọt đang rơi, kháng là giọt bị lọc qua |

⇒ Cùng cặp thì **cùng bố cục, cùng vật thể, đảo trạng thái**. Khác cặp thì khác hẳn vật thể.
Sáu icon không liên quan gì tới nhau là vứt mất chính cơ chế mà hệ này bán.

### 5.2 Quy cách

```
128 × 128, nền ĐẶC (không trong suốt) — toả tròn, sáng ở tâm, tối dần ra rìa.
Một vật thể duy nhất chiếm gần trọn ô, chừa mép 3 px.
Không khung viền, không chữ, không số.
```

Khớp bộ icon đang chạy (`meteorite.png` · `inferno.png` · `dragonspirit.png`, đều 128×128 RGBA,
nền đặc toả tròn do `tools/icon_chieu.py` dựng).

### 5.3 Sáu prompt

Dán thêm câu này vào cuối cả sáu:

```
Paint it as a single game skill icon: one clear object filling most of a square panel, thick
painted shapes with a bold rim light, sitting on a dark radial background that is brightest
right behind the object and falls off to near black at the corners. Keep it readable when
shrunk to the size of a thumbnail, so favour one strong silhouette over many small details.
No border frame, no text, no numbers.
```

---

**T1 · `tp_crush` — Crushing Force** · `#ff8a5a` · *bộ 1, GÂY: đẩy lùi + sát thương bạo kích*

```
A heavy blacksmith's hammer caught at the bottom of its swing, head-on and slightly tilted,
the moment the head lands. Hot orange cracks blow outward from the point of impact in a
short radial burst, and the hammer head itself glows orange along its striking face from the
force of the blow. The haft runs from the lower left corner up to the head at the centre.
Everything reads as a downward strike frozen at the instant it connects.
```

---

**T2 · `tp_stead` — Steadfast** · `#a0d8ff` · *bộ 1, KHÁNG: kháng đẩy lùi + kháng bạo kích*

```
A blacksmith's anvil seen head-on, planted dead centre and taking a blow without moving. A
pale blue shockwave ring spreads off its top face and dissipates harmlessly, and cold blue
light rims its upper edges where the strike landed. Faint blue impact lines come down from
the top of the panel and stop short against the anvil rather than passing through it. The
anvil should look immovable and slightly too heavy for its size.
```

---

**T3 · `tp_para` — Paralyze** · `#ffe08a` · *bộ 2, GÂY: khoá cứng — không đi, không ra chiêu*

```
A short length of heavy chain pulled taut across the panel from corner to corner, every link
straining, with pale yellow electricity crawling along the metal and arcing between the
links. The chain is at its tightest, the links visibly deformed by the pull. A faint yellow
glow bleeds off the chain into the dark background. It should read as something being held
still by force, not as something being dragged.
```

---

**T4 · `tp_unbound` — Unbound** · `#a0ffe9` · *bộ 2, KHÁNG: kháng mọi đòn định thân*

```
The same heavy chain, but snapped clean through at its middle, the two broken ends flying
apart toward opposite corners with the severed links tumbling loose. Bright mint-green light
bursts from the break point where the metal gave way, and the freed ends trail thin green
streaks behind them. The chain links should be recognisably the same metal and the same
weight as an intact chain, so the two images read as before and after.
```

---

**T5 · `tp_venom` — Venom** · `#7ec850` · *bộ 3, GÂY: rải độc, mất máu dần*

```
A single fat droplet of venom falling through the centre of the panel, its surface glossy
and sickly yellow-green, with a thin trail of vapour rising behind it and two smaller
droplets falling just behind. Below it the surface it is about to hit is already pitted and
smoking where earlier drops landed. Give the green an acid, slightly rotten cast rather than
a clean leafy green, and let a faint green glow bleed off the droplet into the dark.
```

---

**T6 · `tp_anti` — Antidote** · `#c8e87a` · *bộ 3, KHÁNG: kháng mọi loại độc*

```
The same venom droplet, caught mid-fall as it passes through a horizontal membrane of pale
yellow-green light stretched across the centre of the panel. Above the membrane the drop is
dark and sickly; the part that has passed through comes out clear and bright, the poison
visibly stripped out of it. The membrane ripples outward in rings from the point where the
drop crosses. Keep the droplet the same shape and size as the untreated one so the two
images read as a pair.
```

---

## 6. Đường nhập — không sửa một dòng máy nào

Cả 13 atlas và 6 icon cắm bằng **khai bảng**, đúng nếp đã có.

### 6.1 Atlas kỹ năng

```bash
# ① gói meowa → atlas (đọc lưới từ .tres, cắt đuôi rỗng, đo anchor)
python3 tools/vfx_meowa.py <thư-mục-gói> sx_thieulam_c --neo <hàng-nền> --sat <bán-kính-nền>
#   --caro   nếu sheet dính lưới ô vuông trong suốt
#   --suong  nếu vùng sương bị xuất thành lưới rung
#   --sang gamma,gain,sat   nếu gói sáng < ~40 (đo trước, đừng áp bừa)

# ② khai vào VFX_ATLAS_DEFS (game.js) — công cụ in sẵn dòng để dán
# ③ khai vào CHIEU_TRANH (game.js)
#    sx_thieulam_c: { atlas:'sx_thieulam_c', neo:'quai', co:0.62 },
# ④ GỠ dòng tương ứng trong SECT_VFX — giữ cả hai là chồng hai lớp lệch nhau
```

⚠ Bước ④ hay bị quên. `spawnSkillVfx` gặp chiêu trong `CHIEU_TRANH` là **`return` ngay**, nên
dòng `SECT_VFX` cũ không nổ lỗi — nó chỉ nằm đó, và người sau đọc sẽ tưởng chiêu còn dùng
hình vector.

### 6.2 Icon — cắt RA TỪ chính atlas của chiêu đó

```bash
python3 tools/icon_chieu.py sx_thieulam_c 8 assets/skills/tl_tp.png \
        --defs 8,384,384 --nen "#1a2a4a,#060a14"
```

⇒ **13 atlas cho ra 13 icon miễn phí.** Ô kỹ năng và thứ nổ trên màn hình là MỘT — vẽ tay một
biểu tượng riêng là mở đường cho hai thứ trôi dần khỏi nhau.

Riêng 6 icon Tâm Pháp không có atlas ⇒ sinh ảnh tĩnh rồi khai thẳng
`icon:'assets/skills/tp_crush.png'` vào `VOHOC_DEFS` (`data/canbang.js`).

---

## 7. ⚠ HAI THỨ PHÁT HIỆN LÚC ĐO — đừng cắm nhầm

### 7.1 Tám tấm icon nằm trong kho mà KHÔNG được nối, và chúng là đồ hỏng

`assets/skills/` có 15 tấm PNG 128×128, nhưng `SECT_ART` chỉ khai **một** (`meteorite.png`).
Tám tấm `tl_a · tl_tp · tc_a · tc_tp · bd_a · bd_tp · mg_a · mg_tp` nằm im trên đĩa, không ô
nào đọc tới.

**Đừng "sửa" bằng cách nối chúng vào.** Chụp ra nhìn thì:

| tấm | thứ thật sự vẽ trên đó |
|---|---|
| `tl_a` · `tl_tp` (Dark Knight) | **một đồng tiền vàng.** Hai tấm, cùng một đồng tiền |
| `mg_a` · `mg_tp` (Spellblade) | hai tấm **giống hệt nhau**, một mảng hồng-vàng không đọc ra hình gì |
| `bd_a`/`tc_a` và `bd_tp`/`tc_tp` | cùng một mô-típ trăng lưỡi liềm, chỉ đổi màu |

Tức chúng là clip-art sót lại từ đời trước. Việc đúng là **thay**, và 13 atlas ở trên đã bao
gồm phần thay đó (mục 6.2). Dark Lord thì chưa từng có tấm nào.

### 7.2 Icon kỹ năng hiện đang là VECTOR — đây là lỗ thủng của Quy tắc số 3

`probeSkillIcons()` thấy `SECT_ART` rỗng là gọi `genSkillIcon()` dựng icon bằng `canvas`
(`SK_ICON_SYMS`: `blade_up`, `hammer`, `anvil`, `hourglass`…). CLAUDE.md chừa ngoại lệ vector
cho **icon vật phẩm tiêu hao**, không chừa cho icon kỹ năng.

⇒ 19 tấm của đơn hàng này vá đúng chỗ đó. Đây là lý do nên làm trọn bộ chứ không làm lẻ vài ô:
làm nửa vời thì hai ô cạnh nhau trên cùng một thanh chiêu, một ô tranh thật một ô hình học.

---

## 8. Nghiệm thu — đo, đừng nhìn

Mỗi gói về, chạy đủ bốn phép này TRƯỚC khi cắm:

| # | đo gì | ngưỡng | vì sao |
|---|---|---|---|
| 1 | `alpha = 0` chiếm bao nhiêu % | **≥ 25%** | dưới ngưỡng là nền đặc bị nướng vào tranh — hai tấm trùm đời trước chết đúng ở đây |
| 2 | độ sáng trung bình | **> 40** | dưới đó là hiệu ứng tối hơn nền đêm (~52) ⇒ đọc thành vệt mực |
| 3 | tâm nội dung lệch giữa các khung | **< 8 px** | `anchorX/anchorY` là MỘT cặp số cho cả tấm; khung lệch tâm là khung giật |
| 4 | thu về cỡ thật rồi **chụp trong màn** | mắt | ba lỗi hình của đợt trang bị chỉ lộ khi chụp ra xem, không lỗi nào lộ khi đọc mã |

```bash
python3 - <<'PY'
from PIL import Image; import numpy as np, sys
a = np.asarray(Image.open(sys.argv[1]).convert('RGBA'), float)
al = a[...,3]; rgb = a[...,:3].mean(2)
print('alpha0 %.1f%%  sang %.1f  lechchuan %.3f' % ((al<8).mean()*100, rgb[al>16].mean(), (rgb/255).std()))
PY
```

Và một luật đã trả giá ở đợt trùm: **lệch chuẩn — độ tách giữa các mảng sáng tối BÊN TRONG
hiệu ứng — mới dự đoán được "đọc ra hay không", không phải độ sáng trung bình.** Dưới ~0,12 thì
mới cần xử lý; trên đó để nguyên. Áp cùng một liều cho mọi gói là chữa bệnh không có bệnh.

---

## 9. Tổng đơn

| nguyên mẫu | số tấm | dạng | công cụ nhập |
|---|---|---|---|
| A · đòn chính | 5 | atlas 8 khung, 384² | `vfx_meowa.py` |
| B · Trấn Phái | 4 | atlas 16 khung, 384² | `vfx_meowa.py` |
| C · hào quang | 4 | atlas 12 khung, 384² | `vfx_meowa.py` |
| Icon kỹ năng | **0 đặt thêm** | cắt ra từ 13 atlas trên | `icon_chieu.py` |
| Icon Tâm Pháp | 6 | ảnh tĩnh 128² nền đặc | khai thẳng `VOHOC_DEFS` |

**13 atlas + 6 icon = 19 món.** Thứ tự nên làm:

1. **B4 · Fire Scream** hoặc **B1 · Death Stab** — một tấm Trấn Phái trước, vì đã có hai tấm
   Dark Wizard làm mốc so sánh ngay trong game.
2. Xong một tấm, chụp trong màn, chốt tông rồi mới chạy nốt ba tấm B còn lại.
3. **C** (hào quang) — bốn tấm, khuôn giống nhau nhất, làm liền một mạch.
4. **A** — làm CUỐI, vì nó cần việc xoay atlas ở mục 0.2 làm xong trước.
5. **Tâm pháp** — làm bất cứ lúc nào, không phụ thuộc gì.
