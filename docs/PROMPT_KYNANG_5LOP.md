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

### 0.3 NGUỒN ART — đã thử thật trên ba tấm Gemini + một video

> Chủ dự án gửi ba tấm Gemini (Twisting Slash · Force Wave · Triple Shot) và một video showreel
> ngày 15-09. Mọi kết luận dưới đây là **số đo trên chính mấy tệp đó**, không phải suy đoán.

**⚠ GEMINI KHÔNG XUẤT ĐƯỢC NỀN TRONG SUỐT — nó VẼ lưới ô caro thành điểm ảnh thật.** Đo cả ba
tấm: `alpha = 0` chiếm **0,0%**, trong khi ngưỡng nghiệm thu là ≥25%. Cắm thẳng vào game là dán
một hình chữ nhật xám kín màn hình — đúng cách hai tấm trùm `boss_hacphong` / `boss_tinhhoa`
đã chết.

Gỡ được, bằng **`tools/vfx_gemini.py`**: lưới caro là một sóng vuông đều nên tách ngược ra được,
kể cả vùng **bán trong suốt** (biên độ lưới còn lại ở mỗi chỗ nói thẳng ra α, rồi lấy lại màu
thật bằng `F = (p − (1−α)·B) / α`). Nhưng chất lượng tách phụ thuộc vào chính cái lưới, và ba
tấm ra ba kết quả khác nhau:

| tấm | hai tông lưới | kết quả |
|---|---|---|
| Twisting Slash | 44 / 96 — tối hơn hẳn art | **sạch** |
| Force Wave | 97 / 146 | **sạch** |
| Triple Shot | 156 / 197 — sáng, chồng lên dải của art | quầng sáng và vành tan **thủng lỗ** |

⇒ **Chữa ở PROMPT, đừng đuổi theo ở khâu nhập.** Và đây KHÔNG phải luật mới — dự án đã chốt nó
từ đợt art nhà cửa: `docs/PROMPT_ART_GEMINI.md` bắt mọi prompt Gemini kết bằng
**`#FF00FF, completely flat, no gradient`**, và `tools/cat_luoi_gem.py` đã đo sẵn cách tách
(sắc tím `(R+B)/2 − G`: nền ~210, vật liệu 20-24, ngưỡng 120 nằm giữa khoảng trống đó).

**Ba tấm VFX này đơn giản là không đi theo luật ấy** — vì `PROMPT_ART_GEMINI.md` viết cho nhà
cửa · vật nhỏ · vũ khí · đồ tiêu hao, chưa có mục nào cho hiệu ứng. Đó là chỗ tài liệu này phải
trám: mọi prompt ở §3–§6 dưới đây kết bằng đúng câu nền magenta ấy.
`tools/vfx_gemini.py --nen "#ff00ff"` mượn thẳng phép đo của `cat_luoi_gem.py`, không dựng phép
tách thứ hai.

**⚠ VÀ VIDEO TÁCH SẠCH HƠN ẢNH TĨNH — ngược hẳn thứ tôi dự đoán.** Tôi đã định báo là video kém
hơn, vì lưới của nó tương phản chỉ **24 mức** (38/62) so với **52 mức** của tấm PNG, cộng thêm
h264 mất mát và độ phân giải chỉ 1280×720. Chụp ra so thì ngược hẳn: video cho viền sắc, không
sót một mảng caro nào; tấm PNG thì lấm tấm quanh rìa mềm. Lý do thật: lưới của video **tối hơn
hẳn** art nên tách theo độ sáng là đủ, còn lưới của tấm PNG sáng hơn và nằm chồng đúng dải mà
rìa mềm của art chiếm. *Đừng suy chất lượng tách từ tương phản của lưới — phải chụp ra so.*

| | Gemini ảnh tĩnh | **Gemini video** | meowa |
|---|---|---|---|
| Giữ được nhận dạng qua các khung | được | **được** | được |
| Nền trong suốt | không — lưới caro | không — lưới caro | **có** |
| Tách lại được không | tuỳ tương phản lưới | **được, sạch hơn** | không phải tách |
| Số khung | 6–9, do mình xếp lưới | **24/giây** | 8/16/24/32 |
| Dấu chìm | có | **có** — khối 48×48 ở góc dưới-phải, ĐỨNG YÊN ⇒ cắt bỏ được | không |

⇒ **Video là nguồn tốt nhất hiện có**, miễn là cắt bỏ góc dấu chìm. Nhược điểm duy nhất: một
video là một **showreel** nhiều hiệu ứng nối nhau bằng chuyển cảnh mờ, nên phải tự chỉ đoạn.
Tách khung: `ffmpeg -i <video> -vsync 0 khung_%04d.png` (sandbox cài được qua
`pip install imageio-ffmpeg`).

### 0.4 ⚙ BA Ô ĐÃ CẮM THẬT VÀ CHỤP TRONG MÀN

| ô | atlas | trạng thái |
|---|---|---|
| Dark Knight ô 1 · Twisting Slash | `sx_thieulam_a` | **chạy** — 8 khung, bỏ khung tàn thứ 9 (nhạt tới mức không tách nổi) |
| Dark Lord ô 1 · Force Wave | `sx_bug_a` | **chạy** — 6 khung |
| Sylvan Ranger ô 1 · Triple Shot | `sx_toanchan_a` | **chạy, có nợ** — còn lưới lỗ ở quầng sáng, cần sinh lại trên nền phẳng |

Ba thứ đo được lúc cắm, mỗi thứ là một cái bẫy:

1. **`neoR` là TẦM VƯƠN TỪ NEO, không phải nửa ô.** Chỗ gọi lấy tỉ lệ vẽ bằng `R / neoR`. Lấy
   nửa ô (192) thì đặc tả 125px vẽ ra **211px**. Đúng là `384 − anchorX` = 337,9 ⇒ vẽ ra 119px.
2. **`cong:false` — vẽ đè, KHÔNG cộng sáng.** Cả ba tấm đều sáng hơn nền và có viền tối riêng;
   cộng sáng trên nền cát sáng của thị trấn thì quạt chém **cháy trắng** và viền biến mất. Luật
   cũ vẫn đúng: cộng sáng dành cho gói TỐI HƠN nền.
3. **Phải xoay, và xoay quanh ĐIỂM NEO.** Xem §2.1 — đã thi công, `tests/test_xoayvfx.js` gác
   19 mệnh đề, trong đó mệnh đề đáng giá nhất đo hai khoảng lệch ở góc 0° và 180° phải đối xứng
   (đo được 45,5 vs −46,5 px). Xoay quanh tâm ô cũng làm hình ĐỔI, nên chỉ phép đo ấy phân biệt
   được hai cách làm.

### 0.5 ⚠ CHUẨN CHẤT LƯỢNG LÀ METEORITE — và ba tấm đầu KHÔNG đạt

Chủ dự án xem ba tấm Gemini đã cắm rồi chốt: *"hình ảnh này cũng khá xấu. Mình muốn gen
animation skill như DW (meteorite ấy) nhìn nó mới hấp dẫn."*

Đo cả sáu atlas đang có, ba con số tách bạch ngay:

| | khung | độ phủ ô | rìa mềm | dung lượng |
|---|---|---|---|---|
| `meteor_rain` · Meowa | 14 | **31,7%** | 8,9% | 1,9 MB |
| `fire_pillar` · Meowa | 16 | 25,9% | 7,0% | 1,5 MB |
| `dragon_spirit` · Meowa | 8 | 29,7% | 66,6% | 1,25 MB |
| `sx_thieulam_a` · Gemini | 8 | **10,9%** | 55,4% | 0,36 MB |
| `sx_bug_a` · Gemini | 6 | 17,0% | 53,8% | 0,41 MB |
| `sx_toanchan_a` · Gemini | 5 | 21,6% | 41,2% | 0,36 MB |

⚠ **Nhưng đừng đọc bảng này thành "thiếu khung".** `dragon_spirit` chỉ 8 khung mà vẫn đẹp.
Chụp cả sáu ra cạnh nhau mới thấy thứ thật sự khác:

> **Tấm Meowa là NĂM-SÁU LỚP chồng nhau. Tấm Gemini là MỘT NÉT.**

Đếm được trên từng tấm:

| `meteor_rain` | `fire_pillar` |
|---|---|
| ① ba viên đá có lõi trắng | ① vòng dung nham đỏ dưới chân |
| ② đuôi tím dài, xoắn | ② mảnh đá đen vỡ quanh vành |
| ③ tia sét trắng lúc chạm | ③ cột lửa **xoắn**, có thể tích |
| ④ khối nổ tím-lam cuộn | ④ **hồn lửa XANH LÁ bay quanh** |
| ⑤ khói xám bốc lên | ⑤ tia lửa bắn lên |
| ⑥ vành sáng lan trên nền | |

Ba tấm Gemini: một vòng cung xanh. Hết. Không khói, không mảnh vỡ, không lõi, không vành nền.

**Và một chi tiết cụ thể, gọi tên được:** cả hai tấm Meowa đều có **một màu TƯƠNG PHẢN thứ hai**
— cột lửa cam thì hồn bay màu xanh lá, thiên thạch tím thì tia sét màu xanh lam. Ba tấm Gemini
đơn sắc từ đầu đến cuối. Đó là thứ làm mắt bám vào, và nó rẻ: chỉ là một dòng trong prompt.

⇒ **Prompt ở §3–§6 của bản 1 tả MỘT HÌNH** ("a wide crescent of cold steel-blue light"). Đó là
lý do gốc, không phải Gemini kém. Prompt tả một nét thì sinh ra một nét.

### 0.6 CÔNG THỨC NĂM LỚP — dán vào MỌI prompt hiệu ứng

Mọi prompt từ đây phải gọi tên đủ năm lớp. Thiếu lớp nào thì hiệu ứng mỏng đúng lớp đó.

| lớp | là gì | ví dụ trong `fire_pillar` |
|---|---|---|
| **① NỀN** | dấu để lại trên mặt đất, vành sáng lan | vòng dung nham đỏ |
| **② THÂN** | khối chính — phải có **thể tích và xoắn**, không phải nét | cột lửa xoắn |
| **③ LÕI** | sợi trắng nóng bên trong thân, vẫn sắc khi thân đã nhoè | lõi trắng giữa cột |
| **④ PHỤ KIỆN BAY** | mảnh vỡ · tia lửa · sinh vật nhỏ — **màu tương phản** | hồn lửa xanh lá |
| **⑤ TÀN** | khói, bụi, hơi còn đọng ở khung cuối | khói đen cuộn |

Kèm hai luật nhịp:
- **Ba hồi rõ**: dồn → nổ → tan. Hồi giữa là khung sát thương áp xuống.
- **14–16 khung** cho ô 3, **10–12** cho ô 1 và ô 2. Ít hơn thì ba hồi không đủ chỗ.

**Khối dán vào cuối mọi prompt hiệu ứng** (thay cho khối ở §2.2 của bản 1):

```
Build it from five stacked layers rather than one shape: a mark left on the ground beneath it,
a main body with real volume that twists along its length instead of reading as a drawn line,
a hair-thin white-hot core inside that body which stays sharp even where the outer edges blur,
loose debris and sparks flying around it in a clearly contrasting second colour, and a drift of
smoke or vapour still hanging in the final frames. Play the whole thing in three clear beats:
gathering, the loudest moment, then falling apart. Render it as a game visual effect with
painted cel shading, saturated colour that reads over both bright grass and a dark swamp at
night, and a crisp bright core fading to a soft coloured edge. Keep every frame the same canvas
size with the effect centred the same way. Place it on a solid background of pure magenta
#FF00FF, completely flat, with no gradient, no checkerboard pattern and no transparency grid.
No character, no weapon, no text and no numbers anywhere in the image.
```

### 0.7 ⚠ VÀ CẢ BA TẤM ĐẸP ĐỀU TỪ MEOWA, KHÔNG PHẢI GEMINI

`meteor_rain` · `fire_pillar` · `dragon_spirit` đều nhập bằng `tools/vfx_meowa.py` — cờ
`--cat/--neo/--sat/--sang` chỉ tệp đó có, và chú thích của `dragon_spirit` ngay trong
`VFX_ATLAS_DEFS` ghi rõ nó đã phải `--sang` lúc nhập gói Meowa.

Công thức năm lớp ở §0.6 dùng được cho cả hai bộ sinh, và nó là phần cải thiện lớn nhất. Nhưng
nếu muốn đúng chuẩn Meteorite thì **đặt qua Meowa** (lệnh cụ thể ở §0.11) — cùng đường đã sinh ra ba
tấm ấy. Gemini vẫn hợp cho **ảnh tĩnh** (nhà cửa, vật nhỏ, vũ khí, icon), đúng như
`docs/PROMPT_ART_GEMINI.md` đã phân vai.

### 0.8 Ba prompt ô 1 VIẾT LẠI theo công thức năm lớp

Thay hẳn ba prompt tương ứng ở §3. Mỗi cái vẫn nối khối ở §0.6 vào cuối.

---

**Twisting Slash** · Dark Knight · `sx_thieulam_a` · thân #4c8dff · phụ kiện #ffe9a0

```
A two-handed greatsword sweep, seen from slightly above. Gouged into the ground along the path
of the swing is a pale scar of light that spreads outward into a low ring. Above it the sweep
is a thick ribbon of cold steel-blue energy with real volume, wrung and twisted along its
length, heavy through the middle and tapering only at the very tips. A hair-thin white-hot
line runs inside that ribbon and stays razor sharp even where the outer body smears with
speed. Thrown forward around it, in warm gold against all that blue, are torn shards of light
and a spray of sparks. The first frames wind the blade back while the ground scar starts to
glow; the middle frames tear the sweep wide open and blow the gold sparks forward at the
moment of impact; the last frames shred the ribbon and leave a low drift of pale blue vapour
hanging where it passed.
```

---

**Force Wave** · Dark Lord · `sx_bug_a` · thân #8a9a3a · phụ kiện #ffb15c

```
A blunt shockwave punched out of a commander's sceptre, seen from slightly above. Dust lifts
off the ground in a flat ring beneath it. The wave itself is three or four nested crescent
walls of olive-green force, each one a thick slab with visible thickness rather than a drawn
band, the air between them warped like heat haze. A white-hot seam runs along the leading edge
of the innermost wall. Tumbling in the gap between the walls, in warm amber against the green,
are chips of broken stone and short crackling arcs lifted off the ground by the pressure. The
first frames compress the walls almost into one line; the middle frames drive them apart and
outward so the wave visibly travels and the amber debris is flung ahead of it; the last frames
stretch the walls thin and leave a low roll of dust settling behind. Keep every edge blunt and
rounded — this one is weight, not a cutting edge.
```

---

**Triple Shot** · Sylvan Ranger · `sx_toanchan_a` · thân #3a9d8b · phụ kiện #ffd76a

```
Three arrows released at once from a longbow, seen from slightly above. A faint ring of
disturbed grass and dust marks the ground under the release point. The three shafts are thick
bolts of teal-green light with real body, each wrapped in a spiralling ribbon of mist that
twists as it travels, fanning out at slightly different angles. Inside each bolt runs a
hair-thin white core that stays sharp while the mist around it blurs. Scattered between them,
in warm gold against the teal, are torn feather fragments and a spray of bright motes shaken
loose by the shot. The first frames draw everything tight and inward as the string is pulled;
the middle frames snap the three bolts outward at their brightest with the gold motes bursting
from the release point; the last frames let the bolts thin away and leave a slow cloud of teal
haze and drifting feathers behind.
```

---

### 0.9 ⚠ ĐỔI HẲN LỐI VIẾT — chủ dự án đưa prompt mẫu, và nó thắng

Chủ dự án đưa cặp prompt đã sinh ra đúng thứ muốn (Meteorite, hai lần gen ra hai hình).
Nó **không phải văn xuôi** — nó là chuỗi mệnh đề ngăn bằng dấu phẩy, mỗi dòng một việc.

⚠ **Điều này lệch `docs/npc-prompts.md §2.2`, vốn cấm thẳng "xếp chồng từ khoá".** Tôi đổi theo
prompt mẫu, cố ý, và ghi ra đây để người sau đừng "sửa ngược" về văn xuôi: luật kia viết cho
prompt **sinh vật và NPC** — ở đó văn xuôi giữ được nhận dạng một con vật. Hiệu ứng thì không có
nhận dạng nào để giữ; nó là một danh sách lớp, và danh sách thì viết thành danh sách.
Ba tấm Gemini "khá xấu" là viết bằng văn xuôi. Tấm chủ dự án chỉ vào thì viết kiểu này.

#### Khuôn — mười một dòng, mỗi dòng một việc

```
A 2D game VFX sprite, <TÊN CHIÊU> spell <beginning|impact> phase,      ← ① chiêu gì, thì nào
top-down slightly angled view, solid flat magenta background,          ← ② góc nhìn + NỀN
<lớp ① nền / bối cảnh>,
<lớp ② thân — nhấn "thick", "twisted", "with real depth">,
<lớp ③ lõi trắng bên trong>,
<lớp ④ phụ kiện bay, MÀU TƯƠNG PHẢN>,
no <thứ của thì KIA>, no character, no weapon,                          ← ③ phủ định
cel-shaded art style, bold black outlines, flat colors,
dark fantasy MMORPG aesthetic like MU Online,
clean vector-like game asset, centered composition,
512x512 pixels, high quality, PNG
```

**Ba chỗ tôi sửa so với prompt mẫu, mỗi chỗ một lý do đo được:**

1. ⚠ **`transparent background` → `solid flat magenta background`.** Dòng đó trong prompt mẫu
   **không chạy**: đo cả ba tấm Gemini nhận được thì `alpha = 0` chiếm **0,0%** — nó vẽ lưới ô
   caro thành điểm ảnh thật. Thêm luôn `no checkerboard pattern, no transparency grid` vào dòng
   phủ định, vì với Gemini lưới caro CHÍNH LÀ cách nó vẽ "nền trong suốt".
   Đây cũng là convention `docs/PROMPT_ART_GEMINI.md` đã chốt cho mọi art Gemini của dự án.
2. **Dòng phủ định phải nêu thứ của THÌ KIA.** Prompt mẫu làm rất đúng chỗ này —
   `no explosion yet` ở thì đầu, `no meteors in sky anymore` ở thì sau. Thiếu nó thì hai hình
   giống nhau và không ghép được thành chuyển động.
3. **Giữ `512x512`** dù ô atlas của game là 384 — nguồn to hơn thì thu xuống đẹp hơn, và công cụ
   nhập tự thu.

*(`like MU Online` trong prompt thì được: Quy tắc số 2 cấm tên riêng trong **text người chơi
thấy**, prompt không phải nội dung ship.)*

#### ⚠ HAI HÌNH CHƯA PHẢI HOẠT ẢNH — Gemini dựng THÌ, Meowa dựng CHUYỂN ĐỘNG

Chủ dự án chốt đường đi: *"Sau đó mới bỏ vào Meowa để gen full animation."*

Và nó khớp đúng bằng chứng đo được: **cả ba tấm đẹp** (`meteor_rain` · `fire_pillar` ·
`dragon_spirit`) đều nhập bằng `tools/vfx_meowa.py`, tức đều là gói Meowa. Gemini chưa bao giờ
dựng ra tấm nào trong số đó.

| bước | làm gì | công cụ | ra cái gì |
|---|---|---|---|
| 1 | gen **thì đầu** | Gemini, prompt ① | 1 ảnh 512², nền magenta |
| 2 | gen **thì sau** | Gemini, prompt ② | 1 ảnh 512², nền magenta |
| 3 | **bóc nền magenta** khỏi hai ảnh | `tools/vfx_gemini.py --nen "#ff00ff"` | 2 PNG trong suốt thật |
| 4 | **gen chuyển động từ hai thì** | **Meowa** (`keyframes-run`, xem §0.11) | gói **16** khung |
| 5 | gói → atlas + đo neo | `tools/vfx_meowa.py` | `atlas.png` + dòng dán vào `VFX_ATLAS_DEFS` |

**Vì sao bước 3 không bỏ được:** Gemini trả nền đặc (đo: `alpha = 0` chiếm **0,0%** ở cả ba
tấm). Đưa thẳng một ảnh có nền vào Meowa là bảo nó animate luôn cái nền.

**⚠ VÀ MỘT CÁI BẪY Ở BƯỚC 4, đã có người trả giá — xuất từ Meowa PHẢI bật "preserve translucent
areas".** Không bật thì lưới ô caro của chính trình vẽ bị nướng thẳng vào tranh, và gói Meowa
mắc đúng cái bệnh vừa phải gỡ ở Gemini. `tools/vfx_meowa.py` có cờ `--caro` để vá, nhưng vá thì
bao giờ cũng tệ hơn xuất đúng ngay từ đầu. Hai dạng hỏng khác của gói Meowa cũng đã ghi sẵn ở
đầu tệp ấy (`--suong` cho lưới rung ở vùng sương, `--sang` cho gói tối hơn nền).

**Nhánh phụ — video:** chủ dự án cũng đã thử `Animate this image` của Gemini và gửi sang một
video. Đo được: **video tách nền SẠCH HƠN ảnh tĩnh** (viền sắc, không sót mảng caro nào; xem
§0.3). Nên đó là đường lui dùng được nếu Meowa tắc — `ffmpeg -i <video> -vsync 0 khung_%04d.png`
rồi vẫn `tools/vfx_gemini.py`. Nhưng nó là đường LUI: một video Gemini là showreel nhiều hiệu
ứng nối bằng chuyển cảnh mờ, phải tự chỉ đoạn, và nó không cho `neoY`/`neoR` như đường Meowa.

⚠ Dấu chìm của Gemini nằm ở khối **48×48 góc dưới-phải** và **đứng yên qua mọi khung** ⇒ cắt bỏ
được ở cả hai nhánh.

---

### 0.10 SÁU PROMPT — ba chiêu ô 1, mỗi chiêu hai thì

Ba chiêu này là ba tấm "khá xấu" đang chạy trên production, cần gen lại trước.

---

**① TWISTING SLASH · Dark Knight · thì ĐẦU**

```
A 2D game VFX sprite, greatsword whirlwind slash spell beginning phase,
top-down slightly angled view, solid flat magenta background,
a wide crescent blade trail of cold steel-blue energy sweeping from left to right,
the trail is a thick twisted ribbon with real depth and weight, not a thin drawn line,
a hair-thin white-hot core running inside the ribbon along its whole length,
pale blue wind streaks and small ice-bright flecks curling off the trailing edge,
no impact burst yet, no ground crack, no debris, no character, no sword,
no checkerboard pattern, no transparency grid,
cel-shaded art style, bold black outlines, flat colors,
dark fantasy MMORPG aesthetic like MU Online,
clean vector-like game asset, centered composition,
512x512 pixels, high quality, PNG
```

**② TWISTING SLASH · Dark Knight · thì SAU**

```
A 2D game VFX sprite, greatsword whirlwind slash spell impact phase,
top-down slightly angled view, solid flat magenta background,
the steel-blue crescent trail fully opened and tearing apart into torn ribbons,
a bright warm gold impact burst exploding at the right end of the arc,
a pale scar of light gouged into the ground along the swing path, spreading into a low ring,
golden shards and sparks flying outward in all directions against the blue,
thin blue vapour rising off the shredded ribbon,
no intact blade trail, no character, no sword, no meteors,
no checkerboard pattern, no transparency grid,
cel-shaded art style, bold black outlines, flat colors,
dark fantasy MMORPG aesthetic like MU Online,
clean vector-like game asset, centered composition,
512x512 pixels, high quality, PNG
```

---

**③ FORCE WAVE · Dark Lord · thì ĐẦU**

```
A 2D game VFX sprite, sceptre shockwave spell beginning phase,
top-down slightly angled view, solid flat magenta background,
three nested crescent walls of olive-green force compressed close together on the left side,
each wall is a thick slab with visible depth and blunt rounded ends, not a drawn band,
a white-hot seam running along the leading edge of the innermost wall,
the air between the walls warped like green heat haze,
no scattered debris yet, no dust cloud, no character, no sceptre, no fire,
no checkerboard pattern, no transparency grid,
cel-shaded art style, bold black outlines, flat colors,
dark fantasy MMORPG aesthetic like MU Online,
clean vector-like game asset, centered composition,
512x512 pixels, high quality, PNG
```

**④ FORCE WAVE · Dark Lord · thì SAU**

```
A 2D game VFX sprite, sceptre shockwave spell impact phase,
top-down slightly angled view, solid flat magenta background,
the three olive-green force walls driven far apart and travelling to the right,
warm amber stone chips and short crackling arcs flung ahead of the front wall,
a flat ring of lifted dust spreading across the ground beneath the walls,
the outermost wall stretched thin and breaking up at its ends,
no compressed walls, no character, no sceptre, no fire, no meteors,
no checkerboard pattern, no transparency grid,
cel-shaded art style, bold black outlines, flat colors,
dark fantasy MMORPG aesthetic like MU Online,
clean vector-like game asset, centered composition,
512x512 pixels, high quality, PNG
```

---

**⑤ TRIPLE SHOT · Sylvan Ranger · thì ĐẦU**

```
A 2D game VFX sprite, triple arrow volley spell beginning phase,
top-down slightly angled view, solid flat magenta background,
a tight dense knot of teal-green light gathered at the release point on the left,
three thick bolts of teal light just beginning to fan out toward the right,
each bolt wrapped in a spiralling ribbon of mist with a hair-thin white core inside it,
a faint ring of disturbed dust on the ground directly under the release point,
no arrows, no bow, no impact burst, no character,
no checkerboard pattern, no transparency grid,
cel-shaded art style, bold black outlines, flat colors,
dark fantasy MMORPG aesthetic like MU Online,
clean vector-like game asset, centered composition,
512x512 pixels, high quality, PNG
```

**⑥ TRIPLE SHOT · Sylvan Ranger · thì SAU**

```
A 2D game VFX sprite, triple arrow volley spell impact phase,
top-down slightly angled view, solid flat magenta background,
three teal-green light bolts fully extended and fanned wide across the right side,
warm golden motes and torn feather fragments bursting outward from the release point,
a slow drifting cloud of teal haze trailing behind the bolts,
the mist ribbons around each bolt unwinding and thinning into wisps,
no gathered knot of light, no arrows, no bow, no character, no explosion,
no checkerboard pattern, no transparency grid,
cel-shaded art style, bold black outlines, flat colors,
dark fantasy MMORPG aesthetic like MU Online,
clean vector-like game asset, centered composition,
512x512 pixels, high quality, PNG
```

---

### 0.11 PROMPT MEOWA — bước 4, và nó viết **NGƯỢC HẲN** với bước 1-2

Chủ dự án hỏi đúng chỗ còn thiếu: §0.9 mới cho prompt của **Gemini** (bước 1-2), chưa cho prompt
của **Meowa** (bước 4). Và hai thứ đó không dùng chung một lối viết.

⚠ **Đây là chỗ dễ chép nhầm nhất của cả tài liệu này.** Bản năng là dán luôn cái khuôn mười một
dòng của §0.9 sang Meowa cho đồng bộ. Làm thế là hỏng: `.claude/skills/game-assets/SKILL.md`
cấm thẳng lối đó cho mọi lệnh Meowa — *"Do not use legacy diffusion-style prompt engineering: no
long keyword stacks, separate positive and negative prompt blocks, repeated quality terms, token
weights, sampler syntax… These additions can interfere with the model's own interpretation and
reduce consistency."*

| | Gemini (bước 1-2) | Meowa (bước 4) |
|---|---|---|
| lối viết | chuỗi mệnh đề ngăn phẩy, 11 dòng | **một câu tiếng Anh thường**, ngắn |
| tả cái gì | **HÌNH** — năm lớp, màu, chất liệu | **CHUYỂN ĐỘNG** — một hành động + một hướng |
| dòng phủ định | bắt buộc (`no …`) | **bỏ hẳn** |
| câu phong cách | bắt buộc | **bỏ hẳn** — hình đã nằm trong ảnh nguồn rồi |
| độ dài | ~11 dòng | **1 câu, ≤ 20 chữ** |

Lý do vật lý, không phải quy ước: ở bước 4 **hình đã xong**. Ảnh nguồn CHÍNH LÀ khung đầu, nên
mọi chữ tả màu/lớp/phong cách ở đây chỉ đi cãi nhau với thứ Meowa đang nhìn thấy. Việc duy nhất
còn lại là nói cho nó biết **thứ đó động như thế nào**.

Và Meowa **bật sẵn `--optimize-prompt`**: backend đọc ảnh nguồn + câu của mình, dịch sang tiếng
Anh, rồi tự viết lại thành câu mà mô hình hoạt ảnh hiểu chắc hơn. Viết dài là tự tay đá vào bước
đó. Cứ viết câu ngắn nhất đủ nghĩa, xem kết quả, rồi **mới** thêm đúng một ràng buộc nếu kết quả
chứng minh là cần.

#### ⚠ Bốn con số đọc ra từ chính ảnh chụp bảng Meowa của chủ dự án

Ảnh chụp cho biết chủ dự án đang đứng ở giao diện web của `meowa-animation-run`. Bốn thứ trong
đó phải đổi, và mỗi thứ có một lý do đo được từ chính kho này:

| ô trong bảng | ảnh chụp đang để | **phải để** | vì sao |
|---|---|---|---|
| Loop playback | ☐ tắt | **giữ TẮT** ✅ | đúng rồi. Chiêu là nổ rồi tắt, không phải vòng lặp. `--animation-mode non_loop` |
| Preserve translucent areas | ☑ bật | **giữ BẬT** ✅ | đúng rồi, và đây là cái nút đã ghi ở §0.9. Tắt là gói Meowa về mang đúng lưới caro vừa phải bóc khỏi Gemini |
| Length | **24 frames (3s)** | **16 frames** | xem ngay dưới |
| Padding | ☑ bật, nhưng **bị chặn** | **TẮT** | xem ngay dưới |

**① Length 16, không phải 24 — neo vào ba gói đang chạy, không đoán:**

| gói đang chạy | khung | ô atlas | fps | dài thật |
|---|---|---|---|---|
| `meteor_rain` (tấm chủ dự án chỉ vào) | **14** | 7×2 | 22 | 0,64 s |
| `fire_pillar` | **16** | 8×2 | 20 | 0,80 s |
| `dragon_spirit` | 8 | 8×1 | 14 | 0,57 s |

24 khung phát ở 22 fps là **1,09 giây** — dài gấp rưỡi tấm mẫu, mà ô 1 là đòn CẬN CHIẾN: người
chơi bấm xong phải thấy nó ăn ngay. 16 khung rơi đúng vào `fire_pillar` (8 cột × 2 hàng), tức
`tools/vfx_meowa.py` cắt ra là vừa khít một khuôn đã có người gác.

⚠ Và tài liệu Meowa cảnh báo sẵn cho mốc 16: *"A 16-frame run has twice the temporal budget of an
8-frame run, so the model may invent an extra motion beat instead of simply improving the same
action."* ⇒ câu prompt phải **nói rõ là một nhát, chậm rãi** (`one single …`, `slowly`), nếu
không nó tự chèn thêm một nhịp thứ hai và chiêu hoá ra đánh hai lần.

**② Padding TẮT — và cái thông báo đỏ trong ảnh chụp không phải lỗi phải sửa:**

Ảnh chụp báo *"The source image has reached the size limit. Reduce its dimensions before adding
padding."* với `Source 2048 x 2048`. **Đừng đi thu nhỏ ảnh để mở khoá ô Padding** — với dự án
này padding là thứ phải tắt:

`VFX_ATLAS_DEFS` neo mỗi gói bằng **một điểm cố định trong ô** (`anchorX` / `anchorY`), và
`tools/vfx_meowa.py` đo điểm đó từ chính khung hình. Chèn padding lệch (`--padding-alignment` có
9 hướng) là **dời tâm hình so với tâm ô** ⇒ mọi số neo đã đo thành sai, và triệu chứng là chiêu
nổ lệch chỗ con trỏ — đúng lỗi §2 của `docs/PROMPT_KYNANG_5LOP.md` đang cố tránh.

⇒ **Chỗ chừa khoảng trống cho chuyển động là ở bước 1-2, trong chính bố cục của Gemini.** Khuôn
§0.9 đã có sẵn câu `centered composition`; giữ nó, và khi duyệt ảnh Gemini thì đuổi theo đúng một
câu hỏi: *cú quét này khi mở hết ra có còn nằm trong khung không.* Meowa không tự đẻ ra chỗ mà
ảnh nguồn không có — tài liệu của nó nói thẳng: *"The model cannot reliably move into space that
does not exist… Prompt enhancement cannot compensate for missing canvas space."*

**③ Resolution 480P là TRẦN, và nó vừa đủ — nhưng chỉ vừa đủ.** Tài liệu Meowa:
*"the general frame mode outputs at no more than 480p even when the source image is much larger."*
Ô atlas của game là **384**. 384 < 480 nên lọt, còn dư 96 px. ⇒ Gen ảnh Gemini ở 2048 **không
mua thêm được gì ở đầu ra** (nó vẫn về 480), nhưng cũng không hại — thu 2048 → 480 thì mép sạch
hơn. Điều phải nhớ là chiều ngược lại: **đừng bao giờ nới ô atlas quá 480**, vì không có nguồn
nào nuôi nổi.

**④ Quality "Detailed"** — giữ như ảnh chụp. (Bản CLI có ba nấc `standard` / `medium` /
`advanced`; theo thứ tự thì `medium` ứng với Detailed. ⚠ **Đây là suy từ thứ tự, chưa đo** — ai
chạy bằng CLI thì đối chiếu lại `python3 meowart_api.py meowa-animation-run --help` trước khi tin.)

#### ⚠ VÀ MỘT CHỖ ĐỔI ĐƯỜNG: hai thì ⇒ dùng `keyframes-run`, KHÔNG phải `meowa-animation-run`

`meowa-animation-run` nhận **một** ảnh (`--image-file`). Nhưng cả §0.9 và §0.10 dựng ra **hai**
ảnh mỗi chiêu — thì đầu và thì sau — và làm thế chính là để *ràng buộc* chuyển động chứ không
phải để chọn lấy một tấm. Đường đúng cho hai tấm là `keyframes-run`, và tài liệu Meowa gọi tên
đúng ca này: *"For an ordinary but complex action, create two or more important poses and use
`keyframes-run`… making this preferable to video for attacks."*

| | dùng khi | khung cho phép | hai thì |
|---|---|---|---|
| `meowa-animation-run` | chỉ có **một** ảnh | 8 · 16 · 24 · 32 | ✗ |
| **`keyframes-run`** | có **cả hai** thì | 6 · 8 · 10 · 12 · **16** · 20 | ✓ |

Cả hai đều cho 16 khung, nên khuôn atlas không đổi. Cứ gen hai thì như §0.10 rồi đi đường
`keyframes-run`; tấm thì-sau là thứ giữ cho Meowa không bịa ra một cái kết khác.

```bash
python3 .claude/skills/game-assets/meowart_api.py keyframes-run \
  --keyframe 0=twisting_slash_thi_dau.png \
  --keyframe 15=twisting_slash_thi_sau.png \
  --prompt "<câu ngắn bên dưới>" \
  --total-frames 16 \
  --animation-type attack \
  --output-format spritesheet \
  --remove-bg-method standard \
  --output-dir <thư mục mới>
```

⚠ **Hai tấm phải CÙNG khổ, cùng tâm, cùng lề** — `keyframes-run` đòi thế. Hai ảnh Gemini đều
512² và đều `centered composition` nên đã thoả, nhưng **bóc nền (bước 3) xong phải đo lại**:
`tools/vfx_gemini.py` không cắt khung nên khổ giữ nguyên, đừng ai tự tay crop một tấm.

#### Ba prompt Meowa — bước 4

Ngắn, một hành động, một hướng, một hiệu ứng. Không màu, không phong cách, không dòng phủ định.

**① TWISTING SLASH · Dark Knight**

```
The crescent blade trail sweeps once slowly from left to right and bursts at the end.
```

**② FORCE WAVE · Dark Lord**

```
The three force walls push forward to the right together in one slow wave, lifting dust.
```

**③ TRIPLE SHOT · Sylvan Ranger**

```
The three bolts of light fan out to the right in one slow volley, trailing mist.
```

**Vì sao ba câu này đều có `once` / `together` / `one` và đều có `slowly` / `slow`:** đó là hai
ràng buộc duy nhất mà mốc 16 khung bắt buộc phải nói ra (bẫy "bịa thêm một nhịp" ở trên). Mọi
chữ khác đã nằm trong ảnh rồi.

**Và cả ba đều nói hướng `to the right`** vì gói atlas được vẽ theo một hướng rồi game tự xoay —
`CHIEU_TRANH` khai `xoay:true`, `spawnAtlasVfx` quay quanh chính điểm neo (xem `tests/test_xoayvfx.js`).
⚠ Gen mỗi chiêu một hướng khác nhau là vứt đi cái đó: neo đo được một kiểu, hình quay một kiểu.

#### ✅ ĐÃ CHẠY THẬT — gói đầu tiên (Twisting Slash), và bốn thứ đo được

Chủ dự án gửi gói **Godot 4.2** (`image-3-godot4_2.zip`) và nó đã nhập xong vào
`sx_thieulam_a`. Bốn điều học được, mỗi điều đổi một dòng trong hướng dẫn ở trên:

**① XUẤT KIỂU GODOT 4.2 LÀ ĐỊNH DẠNG TỐT NHẤT — đừng xin PNG trần.** Gói gồm 4 tệp,
và `image-3_frames.tres` **nói thẳng ra lưới và nhịp** thay vì bắt đoán:

```
region = Rect2(0, 0, 640, 640)   ⇒ ô 640px, tấm 2560×2560 ⇒ lưới 4×4
"speed": 8.0 · 16 AtlasTexture   ⇒ 16 khung @ 8 fps
```

Với ba tấm Gemini trước đó tôi phải **đo** lưới bằng cách dò mép. Ở đây nó là dữ liệu.
⇒ Khi đặt gói Meowa, **chọn xuất Godot 4**, không phải PNG hay GIF.

**② NỀN VỀ ĐẶC, KHÔNG TRONG SUỐT — nhưng lần này keyed sạch.** Đo: `alpha == 0` chiếm
**0,00%**, cả tấm chỉ có **một** mức alpha. Tức ô *"Preserve translucent areas"* trong ảnh
chụp bảng Meowa **không có tác dụng ở đường này**, hoặc ảnh nguồn còn nền magenta.

⚠ **Và màu nền đã TRÔI**: `#ff00ff` (255,0,255) vào, `(183,61,144)` ra — mô hình hoạt ảnh
vẽ lại cả khung nên nền bị nén lossy theo. Hệ quả cụ thể: phép thử chroma của
`vfx_gemini.py --nen` (`(R+B)/2 − G > 120`) cho nền này ra **102,5**, tức **trượt ngưỡng**.
Phải gọi bằng **màu thật đo được**, đừng gọi bằng màu đã gửi đi:

```bash
python3 tools/vfx_gemini.py <spritesheet.png> sx_thieulam_a \
  --luoi 4,4 --o 384 --fps 20 --nen "#b73d90" --nen-toi 26 --nen-xa 90 \
  --bo 10,11,12,13,14,15
```

Ngưỡng 26/90 không đoán: biểu đồ khoảng cách RGB tới màu nền có **vùng phẳng rõ rệt** —
`d<30` bắt 63,4% · `d<60` bắt 65,8% · `d<100` bắt 68,7%, rồi `d<140` vọt lên 85,4% (bắt đầu
ăn vào art). Cứ đo cái vùng phẳng ấy rồi đặt ngưỡng vào giữa nó.

**③ 6/16 KHUNG LÀ KHUNG CHẾT — cảnh báo "16 khung thì mô hình độn thêm nhịp" là THẬT.**
Đo đổi giữa hai khung liền nhau (RMS trên thang 0-255):

| | 0→1 | 4→5 | 7→8 | 8→9 | **9→10** | 10→11 | 13→14 | 14→15 |
|---|---|---|---|---|---|---|---|---|
| RMS | 12,2 | **37,0** | 11,5 | 7,9 | **1,1** | 1,7 | 1,4 | **0,9** |

Từ khung 9 trở đi đổi 0,9–1,7 — đó là **mức nhiễu nén, không phải chuyển động**. Khung 8 so
với khung 15 lệch 8,2, còn khung 8 so với khung 9 đã lệch 7,9 ⇒ bảy khung cuối gần như *một
tấm*. Hoạt ảnh thật dài **10 khung**; `--bo 10,11,12,13,14,15`.

⇒ **Lần sau đặt `--output-frames 8`**, hoặc giữ 16 nhưng câu prompt phải bảo nó **tan đi**
(`and fades away`), vì `animation_mode: loop` ở đây không quay về tư thế đầu — nó **giữ
nguyên khung cuối**. Hệ quả: gói không có đoạn tắt dần, hiệu ứng cắt cụt ở khung chót.

**④ ATLAS NẠP LƯỜI ⇒ CÚ TUNG ĐẦU PHIÊN CÓ THỂ KHÔNG VẼ GÌ.** `getVfxAtlasImg()` mới bắt đầu
tải ở lần gọi đầu, và nhánh vẽ có chốt `img.complete && img.naturalWidth`. Tấm này **1,8 MB**.
Không có tấm lùi nào như `MOB_KHUNG` có — nên nó không 404, nó chỉ **không vẽ**.

⚠ Đây cũng là cái bẫy đã ăn mất ba lượt chụp của tôi: gọi `spawnAtlasVfx` rồi `render()` trong
**cùng một `evaluate` đồng bộ** thì ảnh không bao giờ kịp tải ⇒ **cả 10 khung đều trống**, mà
không lỗi nào in ra. Bài kiểm nào chụp atlas phải hâm trước:
`await pg.waitForFunction(() => { const i = getVfxAtlasImg(id); return i.complete && i.naturalWidth; })`

⚠ **Và vòng RAF của game vẫn chạy giữa hai lệnh `evaluate`.** Chụp kiểu
`evaluate(render)` → `screenshot()` → `evaluate(update)` thì vòng RAF đốt hết `dur` 0,5 s
trước khi tới khung thứ hai — tôi đo ra "chỉ khung 0 có hình" và suýt đổ cho atlas. Phải ghim
`e.t` rồi `render()` rồi `canvas.toDataURL()` **trong cùng một `evaluate`**.

**Kết quả:** `frames:8 → 10` · `rows:1 → 2` · `fps:18 → 20` (10/20 = 0,50 s, hợp đòn cận chiến;
để so: `meteor_rain` 0,64 s · `fire_pillar` 0,80 s). Giữ `cong:false` — art này **sáng**
(0,509) và **lệch chuẩn 0,154**, tức vẽ đè, không cộng sáng. `anchorX/anchorY/neoR` giữ y
nguyên nên không phải đụng `CHIEU_TRANH` hay bài kiểm nào.

#### Bước 5 — gói về thì làm gì

Không đổi so với §0.9: `tools/vfx_meowa.py` nhận gói, cắt ô, **đo** `anchorX`/`anchorY`/`neoR`
rồi in ra dòng dán thẳng vào `VFX_ATLAS_DEFS`. Với 16 khung thì dòng ấy ra dạng
`cols:8, rows:2, frames:16` — trùng khuôn `fire_pillar`.

⚠ **`neoR` là TẦM VỚI TÍNH TỪ NEO, không phải nửa ô.** Đã trả giá một lần: khai nhầm thành nửa ô
thì chiêu đặc tả 125 px vẽ ra **211 px**. Công thức đúng nằm sẵn trong công cụ, đừng chép tay.

⚠ **`cong:false` cho mọi gói này.** Art của ta sáng và có viền chàm đậm; cộng sáng (`lighter`) là
cháy trắng mất viền. Cộng sáng chỉ dành cho gói **tối hơn nền** — xem mục art tối trong `CLAUDE.md`.

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

### 2.2a ⚠ DÙNG GEMINI thì ĐỔI CÂU NỀN — một dòng, và nó tiết kiệm cả một đợt bóc nền

Câu phong cách ở §2.2 nói "fully transparent background" — đúng cho **meowa**, vốn xuất được
alpha thật. **Gemini thì không**: nó vẽ lưới ô caro thành điểm ảnh (xem §0.3). Nên khi đặt bằng
Gemini, thay mệnh đề nền trong câu phong cách bằng đúng câu mà `docs/PROMPT_ART_GEMINI.md` đã
chốt cho mọi art Gemini của dự án:

```
Place the effect on a solid background of pure magenta #FF00FF, completely flat, with no
gradient, no checkerboard pattern and no transparency grid anywhere in the image.
```

Ba chữ cuối là chỗ quan trọng: không nói thẳng "no checkerboard" thì Gemini vẫn trả về lưới
caro, vì với nó lưới caro CHÍNH LÀ cách vẽ "nền trong suốt".

Nhập bằng `python3 tools/vfx_gemini.py <ảnh> <id> --luoi c,r --nen "#ff00ff"`.

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
