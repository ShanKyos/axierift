# Prompt sinh art — 8 bộ hoạt ảnh quái + 11 Tướng Quân

Viết cho mục 1 và 2 của đơn đặt hàng (bản duyệt art 15-09-2026). Số liệu đọc thẳng từ
`public/game/game.js` (`MOBS`) và `public/game/data/canbang.js` (`BOSS_DEFS`) tại `main`.
Ràng buộc lối viết lấy từ `docs/npc-prompts.md §2.2` và `.claude/skills/axie-hinh-hoa`.

---

## 0. Ba quyết định phải chốt TRƯỚC khi mở meowa

### ⚠ 0.1 ĐỪNG đặt qua đường "Spine character" của Meowa

Art nhân vật do Meowa sinh đi theo **một bản mẫu Spine chung** — mọi gói xuất ra dùng chung
một bộ xương giống hệt nhau từng byte (`md5(bones) = 96d71d94`, xem `npc-prompts.md §2.1`).
Meowa **không dựng bộ xương mới**, nó tô lại bên trong một bóng dáng NGƯỜI cố định: hai chân
đứng, hai tay buông, đầu trên vai.

⇒ Đặt con heo rừng bốn chân hay khúc gỗ biết đi qua đường đó thì nó trả về **một người mặc đồ
heo**. Đây là chỗ hỏng nhìn-không-ra-lý-do, và nó tốn nguyên một đợt sinh.

**Đường đúng cho cả 19 món dưới đây:**

| Bước | Làm gì | Công cụ |
|---|---|---|
| 1 | sinh **ảnh tĩnh HD**, nền trong suốt, quay phải | `nano-banana-run` (rẻ, thử prompt) → `image-2-run --detailed` khi chốt |
| 2 | duyệt: thu về cỡ thật rồi nhìn (quái 43–73px · trùm 106–132px) | mắt |
| 3 | **chỉ khi ảnh tĩnh đã chốt** mới nướng hoạt ảnh, 8 khung mỗi nhịp | `meowa-animation-run` |
| 4 | đóng bảng khung + đo `neoY` | `tools/nuong_khungquai.py` |

Meowa đòi **chốt hình tĩnh trước rồi mới animate** — animate một thiết kế chưa chốt là mỗi
lần sửa lại phải nướng lại cả bốn nhịp.

### 0.2 Gemini làm được gì, không làm được gì

| | Gemini | meowa |
|---|---|---|
| Ảnh tĩnh 1 con | được | được |
| **Bộ khung hoạt ảnh** | **không** — mỗi khung ra một con khác, không giữ được nhận dạng | được (`meowa-animation-run`) |
| Nền trong suốt | thường KHÔNG — hay kèm bệ đá, khung viền, cả chữ ghi kích thước | được |

⇒ **Mục 2 (Tướng Quân, ảnh tĩnh)**: Gemini hoặc meowa đều được. Dùng Gemini thì phải chạy qua
`tools/iso/don_congtrinh.py` để bóc nền và bệ.
⇒ **Mục 1 (hoạt ảnh quái)**: chỉ meowa. Đừng thử ghép 8 ảnh Gemini thành một vòng đi.

### 0.3 Lối viết (bắt buộc, `npc-prompts.md §2.2`)

- Câu văn tự nhiên, **4–7 câu**, đọc như đang tả cho hoạ sĩ nghe.
- **KHÔNG** xếp chồng từ khoá (`masterpiece, 4k, ultra detailed`).
- **KHÔNG** viết khối negative riêng — muốn tránh gì thì nói thẳng trong câu khẳng định.
- Không chữ Hán/Nhật/Hàn, không từ vựng tu tiên, không tên riêng của MU Online.

---

## 1. Câu phong cách dùng chung

Dán câu này vào **cuối mọi prompt** dưới đây. Nó giữ 19 món cùng một thế giới, và nó mã hoá
đúng hai số đo của bộ art hiện có (bão hoà trung bình 0,59 · độ sáng 0,65).

```
Draw it in the Axie Infinity creature style the rest of this game uses: chunky rounded
cartoon volumes, a thick dark outline all the way around, flat cel shading with one soft
highlight, and saturated colours that stay bright enough to read against both a pale grass
map and a dark swamp map. Show the creature in a three-quarter view from slightly above,
facing to the right, standing on nothing, on a fully transparent background with no ground
shadow, no base, no frame, no text and no size markings.
```

Ba điều trong câu đó là **hợp đồng kỹ thuật**, không phải thẩm mỹ:
- **quay PHẢI** — game lật ảnh khi con vật quay trái (`ctx.scale(-1,1)`), nên chỉ vẽ một hướng;
- **không bóng đổ** — `drawMob` tự vẽ hai lớp elip bóng, nghiêng theo giờ trong ngày;
- **nền trong suốt** — hai tấm trùm cũ chết đúng vì chỗ này (`alpha=0` chiếm 0,0%).

---

## 2. MỤC 1 — Tám bộ hoạt ảnh quái

### 2.1 Vì sao là tám tấm này

Sprite dùng chung nhiều loài, nên chọn theo **số thực thể mỗi tấm gánh** và theo **dải cấp phủ
được**, không theo cảm tình. Tám tấm này phủ **30 thực thể** và trải liền mạch từ cấp 1 tới 120,
không để hở đoạn nào.

| # | tấm | loài | trùm | dải cấp | hệ | tên trong game |
|---|---|---|---|---|---|---|
| 1 | `boar` | 2 | 1 | 1–40 | Thổ | Axie Heo Rừng · Heo Rừng Nhiễm Khí |
| 2 | `wolf` | 2 | 2 | 4–43 | Mộc | Axie Gai Tím · Gai Tím Đầu Đàn |
| 3 | `mocnhan` | 1 | **5** | 6–50 | Thổ | Axie Golem |
| 4 | `assassin` | 3 | 2 | 10–78 | Thủy | Cướp Đường Gloam · Trinh Sát Gloam · Sát Thủ Sương Mù |
| 5 | `bandao` | 1 | 3 | 12–52 | Kim | Axie Sa Ngã |
| 6 | `xanu` | 2 | 1 | 31–59 | Mộc | Chimera Phun Độc · Chimera Rêu Nước |
| 7 | `kybinh` | 1 | 2 | 43–100 | Kim | Kỵ Sĩ Tro Tàn |
| 8 | `daokhach` | 1 | 1 | 103–120 | Hỏa | Axie Cuồng Bão |

### 2.2 ⚠ Đây là VẼ LẠI, không phải thêm khung cho tấm cũ

Soi cả 24 tấm hiện có: **7/8 tấm được chọn là ĐẦU Axie, không có thân và không có chân.** Đó là
ảnh thẻ sưu tầm, không phải sprite nhân vật. Không nướng được vòng đi cho một cái đầu — nó chỉ
nhấp lên nhấp xuống, đúng thứ `bob` đang làm sẵn miễn phí.

⇒ Mọi prompt dưới đây **phải nêu thân và bốn chân ngắn**. Đây là luật Axie, không phải ý thích:
thân là khối tròn mập, chân ngắn, và che sáu bộ phận đi thì cái còn lại vẫn phải đọc ra Axie.

### 2.3 ⚠ Hai tấm đang SAI so với tên nó mang

Đừng chép lại cái sai:

- **`kybinh` — "Kỵ Sĩ Tro Tàn", hệ Kim, tinh nhuệ** — nhưng tấm hiện tại là một con chim lá
  xanh, và nó **giống hệt từng điểm ảnh** với `cungthu.png` ("Cung Thủ Tro Tàn"). Đo được:
  sai khác trung bình **0,0/255**. Hai con khác vai, khác hệ, khác 8 cấp, cùng một tấm tranh.
  Con này cần thiết kế lại hẳn thành một kỵ sĩ giáp xám tro.
- **`bandao` — "Axie Sa Ngã", hệ Kim** — nhưng tấm hiện tại là một khúc gỗ tròn màu cam.

### 2.4 Tám prompt ảnh tĩnh

Mỗi prompt: dán nguyên văn, rồi **nối câu phong cách ở mục 1 vào cuối**.
Đính kèm tấm cũ làm **ảnh tham chiếu** cho những con cần giữ nhận dạng (ghi rõ ở từng mục).

---

**1 · `boar` — Axie Heo Rừng** · C1–40 · Thổ · *đính kèm `boar.png` làm tham chiếu*

Con quái ĐẦU TIÊN mọi người chơi gặp. Giữ nguyên nhận dạng, chỉ thêm thân và chân.

```
A stout wild-boar Axie the size of a barrel, standing square on four short stubby legs.
Its body is one rounded chestnut-brown mass covered in coarse bristles, with a pale cream
belly and small cloven hooves. Two ivory tusks curve up from a broad snout, its ears are
short and folded forward, a low ridge of darker bristles runs down its back, and a short
tufted tail flicks behind it. The eyes are small, round and set wide apart, giving it a
dull stubborn look rather than a fierce one. Keep the earthy brown palette of a creature
that roots in dry soil.
```

---

**2 · `wolf` — Axie Gai Tím** · C4–43 · Mộc · *đính kèm `wolf.png`*

Tấm cũ là một cụm sương tím có chùm quả đỏ. Giữ cụm quả và sắc tím, cho nó một thân và chân.

```
A low four-legged thorn Axie whose whole body is a dense tangle of dusty lavender bramble,
packed tight into a rounded shape like a rolled-up bush. Clusters of glossy crimson berries
sit on its shoulders and along its spine, catching the light. Two short blunt horns push
out of the tangle above a single wide glowing eye, its ears are small and leaf-shaped, and
a stubby bramble tail drags low behind it. Four short legs end in dark woody feet. Keep the
palette in cool lavender and grey-violet with the berries as the only warm colour.
```

---

**3 · `mocnhan` — Axie Golem** · C6–50 · Thổ · **gánh 5 con trùm** · *đính kèm `mocnhan.png`*

Tấm gánh nhiều thực thể nhất trong cả bộ. Giữ nguyên nhận dạng khúc gỗ có mặt.

```
A squat walking tree-stump Axie, its body one thick section of pale honey-coloured
heartwood with growth rings showing across the front. A wide mouth is carved into the
grain, two knot-hole eyes sit above it, and short bark-flap ears stick out at the sides.
A single green leaf sprig grows from a split at the top of its head, and a knuckle of
gnarled root forms a stubby tail. It stands on four thick root legs, bandy and short, with
bark peeling in curls at the ankles. Keep the palette in warm honey wood and moss green.
```

---

**4 · `assassin` — Cướp Đường Gloam** · C10–78 · Thủy · tinh nhuệ · *đính kèm `assassin.png`*

Gloam là **lính Vaeldra đào ngũ**. Tấm phải đọc ra "lính bỏ hàng ngũ đi ăn cướp", không phải
một con thú hoang.

```
A lean four-legged Axie deserter, its body a rounded cream-white coat gone grey with road
dust. A ragged strip of dark military tabard is knotted across its back like stolen kit,
and a notched short blade is lashed along one flank. A crest of stiff orange quills runs
from between its ears down the neck, its ears are long and swept back, and a narrow muzzle
shows one chipped tooth. Its eyes are narrow and watchful, ringed in bruised violet. Four
short legs stand braced and slightly crouched, ready to bolt. Keep the palette in cold
cream and slate with the quill crest as the only hot colour.
```

---

**5 · `bandao` — Axie Sa Ngã** · C12–52 · Kim · *KHÔNG đính kèm tấm cũ — tấm cũ là một khúc gỗ, sai hệ*

```
A fallen Axie whose rounded body has hardened into dull grey iron, cracked in long seams
that show a faint cold glow underneath. Broken plates of scale armour are fused into its
back and shoulders like something that grew there rather than was strapped on. Two short
spiral horns of tarnished brass rise above heavy-lidded eyes that have gone blank and
white, its ears are torn and metallic, and a segmented iron tail hangs low. It stands on
four short legs, the hooves worn down to blunt stubs. Keep the palette in cold grey iron
and tarnished brass with a thin pale-blue light in the cracks.
```

---

**6 · `xanu` — Chimera Phun Độc** · C31–59 · Mộc · *đính kèm `xanu.png`*

```
A bloated four-legged Chimera Axie, its rounded body a sickly green that fades to pale
teal underneath, with a knobbled shell plate riding on its back. Its mouth is a wide
lipless slit already beading with thick sap, its single large eye is amber and unblinking,
and two frilled gill-like ears sit flat against the skull. Small vent holes along its
flanks weep the same sap, and a short tapered tail curls under it. Four squat legs hold
the body low to the ground. Keep the palette in poison green and pale teal with the sap
a brighter acid yellow-green.
```

---

**7 · `kybinh` — Kỵ Sĩ Tro Tàn** · C43–100 · Kim · tinh nhuệ · **thiết kế lại hẳn** · *KHÔNG đính kèm tấm cũ*

Đây là tấm gỡ cặp trùng khít duy nhất trong cả bộ. Tấm cũ là con chim lá xanh, phải bỏ hẳn.

```
An armoured knight Axie built heavy and low, its rounded body sheathed in overlapping
ash-grey steel plates darkened by soot. A blunt visored helm covers the head with a narrow
eye-slit glowing dull ember orange, two short forward-swept horns rise from the brow, and
the ears are hidden under the helm. A tattered grey campaign banner is strapped upright to
its back. Its four legs are short and thick, each wrapped in riveted greaves, and a heavy
plated tail counterweights the body. Keep the palette in ash grey and cold gunmetal with
a single ember-orange accent at the eye-slit.
```

---

**8 · `daokhach` — Axie Cuồng Bão** · C103–120 · Hỏa · tinh nhuệ · **con cuối game** · *đính kèm `daokhach.png`*

Tấm cũ là khối hồng tròn nhắm mắt — quá hiền cho con quái cuối cùng người chơi gặp.

```
A storm-maddened Axie, its rounded rose-pink body scorched black along the back and
crackling with thin forked arcs of light. Two long curved horns sweep back from the skull
and glow white-hot at the tips, its eyes are wide open and burning amber with no pupil,
its ears are torn ragged, and a blunt spiked tail lashes behind it. Its mouth is open in a
silent scream showing blunt teeth. Four short legs are planted wide and braced, the ground
beneath the hooves cracked by heat. Keep the palette in hot rose pink and charcoal with
white-hot highlights at the horns and eyes.
```

### 2.5 Bốn nhịp hoạt ảnh — prompt cho bước 3

Chỉ chạy **sau khi** ảnh tĩnh đã chốt. `meowa-animation-run`, **8 khung mỗi nhịp**, giữ nguyên
nhận dạng và bảng màu của ảnh tĩnh. Thay `<con vật>` bằng một cụm ngắn tả chính con đó
("the wild-boar Axie", "the armoured knight Axie"…).

| nhịp | bắt buộc | prompt |
|---|---|---|
| `dung` | **có** | `<con vật> standing in place and breathing, its body rising and settling gently, head turning a little to the side and back. It stays on the same spot the whole time.` |
| `di` | không | `<con vật> walking steadily to the right at an even pace, all four legs stepping in turn, the body rocking slightly with each step. The walk loops so the last frame flows back into the first.` |
| `danh` | không | `<con vật> attacking: it crouches back, then lunges forward to the right and strikes, then settles back to standing.` |
| `chet` | không | `<con vật> dying: it staggers, its legs buckle, and it collapses onto its side and goes still. It does not get back up.` |

Ba điều là **hợp đồng với máy**, không phải gợi ý:

- **`di` phải khép vòng** — game chạy nhịp đi theo QUÃNG ĐƯỜNG đã đi, nên khung cuối phải nối
  liền được vào khung đầu. Không khép vòng là bàn chân giật một cái mỗi vòng.
- **`chet` KHÔNG được lặp** — nó chạy tới khung cuối rồi dừng. Câu "It does not get back up"
  là để Meowa đừng nướng một vòng lặp.
- **Bàn chân của cả bốn nhịp phải neo ở CÙNG một mức.** `nuong_khungquai.py` đo `neoY` từ nhịp
  `dung`; nhịp khác đứng lệch là con vật lún hoặc lơ lửng khi đổi nhịp.

Và phải chừa **khoảng trống trong suốt** quanh con vật: nhịp `danh` chồm sang phải, nhịp `chet`
đổ ngang — không chừa thì hai nhịp đó bị cắt cụt ở mép ô.

---

## 3. MỤC 2 — Mười một Tướng Quân

### 3.1 Hiện trạng

**0/40 con trùm có tranh riêng.** 19 con vẽ bằng khung xương, 21 con mượn sprite quái thường
phóng to `size × 4,4`. `mocnhan` một mình gánh 5 con. 11 con dưới đây là Tướng Quân — trùm cuối
của từng map, và là thứ đáng làm trước.

### 3.2 Điểm tựa hình hoạ: mỗi con là sinh vật BẢN ĐỊA của map đó, đã bị bẻ thành Chimera

Đây không phải văn vẻ, nó cho mỗi con một chỗ bắt đầu có sẵn: lấy **lớp Axie của map**, giữ sáu
bộ phận, rồi vặn chúng bằng khí Morvahn. Nhờ vậy 11 con khác nhau mà vẫn cùng một thế giới, và
người chơi đọc ra "đây là thứ sống ở vùng này, đã hỏng".

| # | map | Tướng Quân | cấp | hệ | lớp Axie của map | Dòng Cốt độc quyền |
|---|---|---|---|---|---|---|
| 1 | `corran` | Người Giữ Rẻo Corran | 14 | Mộc | Plant | — |
| 2 | `ngoai` | Ma Sói Sương Trắng | 22 | Hỏa | Beast | Đồng Cỏ |
| 3 | `chungnam` | Tướng Quân Werebear Woods | 32 | Thủy | Beast | Rễ Gai |
| 4 | `daohoa` | Thủ Lĩnh Đoàn Gloam | 50 | Hỏa | Plant | Cánh Hoa |
| 5 | `loimon` | Kẻ Chặn Cuối Lối | 50 | Thổ | Plant | — |
| 6 | `trungnut` | Thứ Bò Ra Từ Nứt | 52 | Thủy | — (vực nứt) | — |
| 7 | `comoc` | Tướng Quân Bug Tribe Tunnels | 52 | Mộc | **Bug** | Vỏ Trứng |
| 8 | `caungam` | Thứ Ngoi Lên Từ Hồ Ngầm | 63 | Thủy | **Aquatic** | — |
| 9 | `tuyettinh` | Tướng Quân Bird Tribe Heights | 72 | Mộc | **Bird** | Băng Vụn |
| 10 | `mongco` | Tướng Quân Reptile Sunstone Flats | 92 | Kim | **Reptile** | Tro Tàn |
| 11 | `nhanmon` | Tướng Quân Dusk Marsh | 112 | Hỏa | **Dusk** | Sấm Vụn |

> ⚠ **Bốn con đang mang tên tạm** — "Tướng Quân Werebear Woods", "…Bug Tribe Tunnels",
> "…Bird Tribe Heights", "…Reptile Sunstone Flats", "…Dusk Marsh" là *tên map ghép vào chữ
> Tướng Quân*, không phải tên riêng. Trùm cuối map mà không có tên thì không ship được. Việc
> đặt tên là của chủ dự án, không phải của art — nhưng nên chốt TRƯỚC khi sinh tranh, vì cái
> tên quyết định con vật trông ra sao.

### 3.3 Hai chỗ dễ hỏng ở cỡ trùm

- **Trùm vẽ ra 106–132px trên màn.** Chi tiết nhỏ hơn ~4px biến mất sạch. Duyệt bằng cách thu
  tấm về **130px rồi nhìn**: đọc không ra con gì thì chưa đạt, dù phóng to rất đẹp.
- **Che sáu bộ phận đi, cái còn lại vẫn phải ra Axie** — khối tròn mập, chân ngắn. Vẽ thân dài
  đứng hai chân kiểu người là ra con quái của một game khác.

Cỡ tấm: **≥ 768×768**, một chuẩn cho cả 11 con.

### 3.4 Mười một prompt

Nối câu phong cách ở mục 1 vào cuối mỗi prompt. Không đính kèm tấm tham chiếu nào — cả 11 con
đều đang mượn sprite của con khác, nên không có nhận dạng nào để giữ.

---

**1 · Người Giữ Rẻo Corran** · C14 · Mộc · Plant · *trùm đầu tiên người chơi gặp*

```
An old Plant Axie grown far past its natural size, rooted like a hedge that learned to
walk. Its rounded body is a dense mound of dark forest moss over bark, split down the
chest by a seam of pale new wood that never closed. A crown of six short branch horns
rings its skull, its ears are two curled fern fronds, and its eyes are small and deep
green with no white. Its mouth is a horizontal split in the bark lined with blunt seed
teeth, and a thick root tail anchors it. Four short trunk legs plant it heavily. It reads
as a guardian that has stood in one place too long.
```

---

**2 · Ma Sói Sương Trắng** · C22 · Hỏa · Beast

```
A pale wolf-Axie the colour of frost fog, its rounded body wrapped in long white fur that
drifts like smoke at the edges. Underneath the fur its skin has been burned through in
patches that glow a low coal orange, as if something is banked inside it. Two swept-back
horns of charred bone rise over a narrow muzzle, its ears are tall and torn, its eyes are
two flat orange coals with no pupil, and a long plumed tail trails vapour. Four short legs
end in scorched paws. The contrast between cold white fur and hot cracks is the whole
point of the design.
```

---

**3 · Tướng Quân Werebear Woods** · C32 · Thủy · Beast

```
A massive bear-Axie swollen with black water, its rounded body matted with dark fur that
hangs heavy and dripping. Its back carries a ridge of barnacled river stones fused into
the hide. Two blunt horns of wet driftwood curve forward over a broad muzzle, its ears are
small and flattened, its eyes are pale drowned blue, and its mouth hangs open leaking a
slow trickle. A short paddle-shaped tail drags behind. Four short heavy legs sink it low.
Keep the palette in drowned blue-black and grey stone with the eyes as the only pale note.
```

---

**4 · Thủ Lĩnh Đoàn Gloam** · C50 · Hỏa · Plant · *thủ lĩnh lính Vaeldra đào ngũ*

```
The warlord of a deserter company: a heavy Axie in scavenged Vaeldra field armour, plates
mismatched and lashed on with rope over a rounded cream-grey body. A torn regimental
banner is bound upright to its back, scorched at the edges. A tall crest of stiff red-orange
quills runs over a helm-like skull plate, its ears are cropped short, its eyes are hard
amber, and an old burn scar crosses the muzzle. A notched cleaver hangs at one flank.
Four short braced legs. It should read as the biggest and most decorated of the Gloam,
not as a different species.
```

---

**5 · Kẻ Chặn Cuối Lối** · C50 · Thổ · Plant

```
A huge stump Axie wedged across a path, its rounded body one broad section of grey
weathered heartwood veined with dried sap. Old cart ruts and axe scars cut across its
front. Four short branch horns rise from the crown like a broken fence, its ears are
bark flaps, its eyes are two deep knot holes lit faint amber from inside, and its mouth
is a long horizontal split full of splinter teeth. A mass of exposed roots forms a
skirt around four short trunk legs. Keep the palette in grey weathered wood and dried
amber sap.
```

---

**6 · Thứ Bò Ra Từ Nứt** · C52 · Thủy · sinh vật của vết nứt, **không thuộc lớp Axie nào**

Con duy nhất trong 11 con không phải sinh vật bản địa — nó từ phía bên kia vết nứt bò sang.
Nó phải **trông sai lệch** so với mười con còn lại.

```
Something that crawled out of a tear in the world and is not finished being one animal.
Its rounded body is slick dark blue-violet, too smooth, with the shapes of other limbs
pressing out from under the skin. Horns grow in the wrong places, three of them, uneven.
It has too many eyes down one side of the head, all the same flat white, and its ears
are two mismatched shapes. Its mouth opens along the wrong axis. A long boneless tail
trails behind it. Four short legs, but one is jointed backwards. Keep the palette cold
blue-violet with a thin sickly green rim light.
```

---

**7 · Tướng Quân Bug Tribe Tunnels** · C52 · Mộc · **Bug** · Dòng Cốt Vỏ Trứng

```
A giant Bug Axie queen bloated with brood, its rounded body a pale chitin shell in mottled
green, cracked open along the back to show a glowing cluster of eggs. Five small eyes sit
in a curved row across the face, its ears are two thin antennae laid flat, and a pair of
pincer horns curve up and inward from the brow. Its mouth splits vertically into two
chewing plates. A short segmented sting curls over its back. Four short legs, the front
pair ending in digging claws. Keep the palette in pale green chitin with the egg cluster
glowing warm cream.
```

---

**8 · Thứ Ngoi Lên Từ Hồ Ngầm** · C63 · Thủy · **Aquatic**

```
A deep-water Aquatic Axie dragged up into air that does not suit it, its rounded body a
bruised blue-grey and slick with a film that never dries. A ragged dorsal fin runs down
the spine, torn in three places. Two curling shell horns sit above a face with one huge
milky eye and one socket gone empty, its ears are frilled gill flaps still working
uselessly, and its mouth is a wide toothless ring lined with rasping ridges. A long
flattened tail drags behind it. Four short legs, webbed and splayed. Keep the palette in
drowned blue-grey with faint bioluminescent teal along the fin.
```

---

**9 · Tướng Quân Bird Tribe Heights** · C72 · Mộc · **Bird** · Dòng Cốt Băng Vụn

```
A great Bird Axie of the frozen peaks, its rounded body packed in layered slate-grey
plumage rimed with frost. Its wings are folded tight and crusted with ice so it can no
longer fly. Two sweeping ice horns rise from the crown, its ears are hidden under feather
tufts, its eyes are two hard pale-blue points, and a heavy hooked beak curves down over
the chest. A fan tail of broken frozen feathers spreads behind. Four short legs end in
scaled talons gripping nothing. Keep the palette in slate grey and frost white with pale
blue in the ice.
```

---

**10 · Tướng Quân Reptile Sunstone Flats** · C92 · Kim · **Reptile** · Dòng Cốt Tro Tàn

```
A heavy Reptile Axie baked hard by the sun flats, its rounded body armoured in overlapping
brass-coloured scales with sunstone shards grown through them like a mineral disease. Two
thick ram horns of polished stone curve back from the skull, its ears are small pits in
the scale, its eyes are narrow slits of molten gold, and a blunt heavy jaw juts forward.
A club tail tipped with a fused sunstone knot swings low. Four short pillar legs. Keep the
palette in hot brass and sandstone with the sunstone shards glowing amber from within.
```

---

**11 · Tướng Quân Dusk Marsh** · C112 · Hỏa · **Dusk** · Dòng Cốt Sấm Vụn · **trùm cuối cùng của game**

Con này là điểm dừng của toàn bộ hành trình. Nó phải đọc ra "cuối cùng" ngay từ cái nhìn đầu.

```
The last thing standing in the marsh: a towering Dusk Axie whose rounded body is a deep
bruised violet gone almost black, with storm light crawling under the skin in thin white
forks that never quite die out. Four long horns sweep back from the skull in a crown, each
tip burning white. Its ears are two tattered membranes, its eyes are three horizontal
slits of raw white light, and its mouth is closed in a hard flat line. A heavy forked tail
drags and sparks where it touches. Four short legs planted wide and unmoving. Keep the
palette in near-black violet with white storm light as the only bright value, so it reads
as a silhouette first and a creature second.
```

---

## 4. Nhận hàng — kiểm bốn thứ trước khi nối vào game

1. **Nền trong suốt**: `alpha=0` chiếm ≥ 25% khung. Đây là chỗ hai tấm trùm cũ đã chết.
2. **Quay sang phải**, một hướng duy nhất, không bóng đổ vẽ sẵn.
3. **Thu về cỡ thật rồi nhìn**: quái 43–73px · trùm 106–132px. Đọc không ra thì chưa đạt.
4. **Che sáu bộ phận** (mắt · tai · sừng · miệng · lưng · đuôi) → cái còn lại vẫn phải ra Axie.

Lắp vào:

```bash
# quái có hoạt ảnh
python3 tools/nuong_khungquai.py boar \
    --dung khung/dung/*.png --di khung/di/*.png \
    --danh khung/danh/*.png --chet khung/chet/*.png
# → in ra mục dán thẳng vào MOB_KHUNG trong game.js

# Tướng Quân: thả tấm vào public/game/assets/mobs/<tên>.png rồi khai một khoá
#   tranai: { …, img:'boss_mochu', anh:'tq_comoc', … }   ← trong data/canbang.js
```

⚠ Cả hai đường lắp trên nằm ở nhánh `claude/peaceful-curie-di3rd0`, **chưa merge vào `main`**.
Merge trước khi art về, không thì không có chỗ cắm.
