# Đặt hàng art — SÁU NPC còn thiếu

Quét bằng máy **trong trình duyệt** trên `NPCS` lúc chạy, không đọc tệp: NPC của Ardhaven khai
ở **hai** nơi (`data/canbang.js` + hai lượt `NPCS.push()` trong `game.js`), nên mọi phép quét
đọc tệp đều thấy thiếu 9 con và trả về những con số trông hoàn toàn bình thường.

**41 NPC · 36 có art · 5 KHÔNG khai `img` · 1 dùng art hỏng.**

| # | id | Tên | Map | Vai trò | Hiện trạng |
|---|---|---|---|---|---|
| 1 | `ah_mucdong` | Người Giữ Chuồng | ardhaven | `talk:'stable'` — bắt & thăng giai thú cưỡi | **không có art** |
| 2 | `thantoan` | Chủ Sảnh Cầu May | ardhaven | `talk:'vanduyen'` — quay thưởng | **không có art** |
| 3 | `ah_banhoa` | Bà Bán Hoa | ardhaven | `talk:'quest'` | **không có art** |
| 4 | `ah_chimera` | Người Luyện Chimera | ardhaven | `talk:'quest'` | **không có art** |
| 5 | `traichu` | Trại Chủ Mục Đồng | ngoai | `talk:'stable'` | **không có art** |
| 6 | `truonglang` | Trưởng Làng (+ `ah_onglao`) | corran · ardhaven | giao nhiệm vụ mở đầu | **art là một THẺ BÀI còn khung** |

⚠ **Không khai `img` thì NPC vẫn hiện, vẫn nói chuyện, vẫn bán hàng** — `drawNpc` lui về một
hình dựng bằng đường. Nên năm con này **không làm đỏ một bài kiểm nào** và không in ra lỗi nào;
chỉ nhìn mới thấy. Đó là lý do phải quét mới biết.

---

## 1. BỘ `_yt` LÀ KHUÔN — và nó là một hợp đồng ĐO ĐƯỢC

Art NPC đang có chia **ba họ khác hẳn nhau**, đừng trộn:

| họ | tệp | là gì |
|---|---|---|
| **`*_yt`** | `banrong_yt` · `duocnu_yt` · `hauban_yt` · `hondon_yt` · `phapsu_yt` | **NGƯỜI**, toàn thân, đứng — khuôn của đợt Ardhaven |
| khổ rộng | `duocsu` · `monkhach` · `noiung` · `quachtinh` | **thú Axie** nằm/ngồi, tỉ lệ rộng/cao tới 1,32 |
| linh tinh | `thumo` · `ttmon` · `laotuong` · `vachda` · `daosi` · … | nhiều đời trước, không nhất quán |

Cả sáu con cần gen **đều là NGƯỜI** ⇒ theo họ `_yt`. Số đo của khuôn ấy:

| | đo được trên 5 tệp `_yt` | ⇒ ĐẶT HÀNG |
|---|---|---|
| khung | cao **đúng 256px**, rộng 134–232 | **cao 256px**, rộng tự do 130–240 |
| nội dung chiếm | **100%** chiều cao khung | **cắt SÁT**, không chừa lề |
| sáng | 0,289 – 0,422 | **0,29 – 0,42** |
| bão hoà | 0,332 – 0,450 | **0,33 – 0,45** |
| **viền** | **0,187 – 0,231** | **0,19 – 0,23** — nét bao SẪM, dày |
| trong suốt | ~40% | ~40% (bóng dáng người, không phải một khối chữ nhật) |

**⚠ `viền` là chỉ số quan trọng nhất và nó vô hình với mắt cho tới khi đo.** Nền map và vật thể
iso đo ra `viền` **0,000**; mọi thứ ĐỨNG TRÊN nền đo 0,09–0,23. Một tấm NPC không có nét bao đen
sẽ đọc ra như một mảng nền, y hệt lỗi đài phun nước vừa phải sửa. Kiểm lại bằng
`python3 tools/do_art.py` trước khi cắm vào game.

---

## 2. BA RÀNG BUỘC KỸ THUẬT — sai một cái là hỏng một kiểu riêng

### ⚠ ① KHÔNG bóng đổ, KHÔNG bệ đứng, KHÔNG khung

`npcHop()` đo **hộp alpha** rồi neo **ĐÁY hộp** vào bàn chân NPC. Nên mọi thứ vẽ thấp hơn gót —
bóng đổ, vũng nước, bệ đá, viền khung — đẩy nhân vật **treo lơ lửng đúng ngần ấy pixel**. Đây là
cùng vết sẹo đã ghi cho `neoY` của trùm: đế giày ở hàng 549, đáy khói ở 640 ⇒ **lệch 91px trên ô
640 (14%)**.

Game đã tự vẽ một bóng ellipse dưới chân. Vẽ thêm một cái nữa là hai cái bóng.

Và đó chính là bệnh của `truonglang.png`: nó trong suốt **13,6%** trong khi bộ `_yt` là 40% —
tức một **tấm thẻ bài hình chữ nhật bo góc**, khung tím còn nguyên. Hai NPC đang dùng nó.

### ⚠ ② TRÊN MÀN NÓ CHỈ CAO 95px — bóng dáng và MỘT món đồ to là tất cả

`NPC_CAO = 1,00` × `NV_THAN_PX` (**95px**). Tấm 256px bị thu **2,7 lần**. Đo trên chính bộ `_yt`:
ở cỡ thật thì mặt mũi biến mất hoàn toàn, thứ còn đọc được là **đường viền ngoài** + **một khối
màu lớn**. Cái làm người ta nhận ra `banrong_yt` là **cái ba lô**, `hauban_yt` là **cái khay**,
`hondon_yt` là **cái búa**, `phapsu_yt` là **quả cầu xanh trên đầu gậy**.

⇒ Mỗi NPC phải có **đúng một món đồ TO, đặt cao ngang ngực trở lên**. Chi tiết nhỏ (khuy áo, hoa
văn, nét mặt) là tiền vứt đi.

### ⚠ ③ GEN CẢ SÁU TRONG MỘT LƯỢT

Bộ `_yt` nhất quán vì nó ra từ một lượt. Gen rời từng con rồi ghép là sáu tông màu khác nhau đứng
cạnh nhau trong cùng một quảng trường — và kiểu lệch đó chỉ lộ ra khi chụp cả màn, không lộ khi
nhìn từng tấm.

---

## 3. PROMPT — dán nguyên khối này trước, rồi mới tới từng con

```
A set of six fantasy village NPC character portraits for a 2D top-down RPG.

STYLE — match these exactly, they must sit next to an existing set:
painted 2D game art, semi-realistic proportions (NOT chibi, NOT anime),
muted earthy palette leaning green / brown / cream, soft painterly shading,
and a THICK DARK OUTLINE around the whole silhouette.
Medieval European village, stone-and-timber town. No Asian/wuxia motifs.

FORMAT — strict:
- full body, standing, idle, relaxed, three-quarter view facing the viewer
- 256 pixels tall, content fills the FULL height, feet at the very bottom edge
- transparent background (PNG alpha)
- NO drop shadow, NO ground, NO platform, NO pedestal, NO base
- NO card frame, NO border, NO background panel, NO text, NO watermark
- each character on its own transparent canvas, cropped tight

READABILITY — the art is displayed at only 95 pixels tall.
Give each character ONE large, high-contrast prop held at chest height or above.
The silhouette must be identifiable when shrunk to 95px. Skip fine detail.
```

Rồi sáu khối dưới đây, mỗi con một khối:

### ① `ah_mucdong` — Người Giữ Chuồng
```
A weathered middle-aged stable hand, leather apron over rough linen,
sleeves rolled to the elbow, sturdy boots.
BIG PROP: a thick coiled rope slung over one shoulder, hanging to the hip.
Secondary: a halter and a feed pouch on the belt.
Calm, patient, slightly stooped. Brown and oat-cream palette.
```
> Lore: *"Chuồng trong thành có bốn ô, mà ngoài đồng thì cả bầy chạy hoang. […] Dây thừng ta cho
> mượn, nhớ trả."* — sợi dây thừng là thứ chính ông ta nhắc, nên nó là món đồ to.

### ② `thantoan` — Chủ Sảnh Cầu May
```
A sharp-eyed showman in a long embroidered coat, rings on the fingers,
hair slicked back. Confident, arms-crossed or one hand presenting.
BIG PROP: a large wooden fortune wheel segment / spinning disc held upright
beside him, painted in faded red and gold wedges.
Secondary: a small posted notice board of odds pinned to his coat.
NOT a thief, NOT a gambler stereotype — he is a licensed hall keeper.
Deep plum and tarnished gold palette.
```
> Lore: *"Tỉ lệ ta dán trên vách, chữ to bằng bàn tay […] Ta không hứa gì cả. Ta chỉ quay."* — cả
> tính cách là *công khai tỉ lệ*, nên tấm yết thị và cái bánh xe phải nhìn ra ngay.

### ③ `ah_banhoa` — Bà Bán Hoa
```
An elderly village woman, headscarf, layered shawl, apron with deep pockets.
Kind, weathered face, slightly hunched.
BIG PROP: a wide shallow wicker basket held at waist-to-chest height,
overflowing with cut flowers — mostly white and deep red blooms, short stems.
Sage green and dusty rose palette.
```
> Lore: *"Hoa của ta trồng ở luống sau nhà […] Cành trắng hết rồi, còn cành đỏ thôi."* — **cành
> ngắn** và **trắng + đỏ** là chi tiết của chính bà, đừng đổi sang một bó hoa chung chung.

### ④ `ah_chimera` — Người Luyện Chimera
```
A lean, wary beast-handler in a padded jerkin with heavy bracers and
a whistle on a cord around the neck. One hand raised in a "stay back" gesture.
BESIDE HIM, at knee height: a small round creature — a plump rounded body
on four short legs, with SHORT CURVED HORNS on top of the head, large round eyes,
small folded ears, a blunt mouth, a spiny ridge along the back, and a tufted tail.
The creature is alert and tense, not cute, not tame. Do not give it a collar.
Charcoal, oxblood and worn leather palette.
```
> ⚠ **Con vật phải dựng từ ĐÚNG SÁU BỘ PHẬN** — Mắt · Tai · Sừng · Miệng · Lưng · Đuôi, theo
> `.claude/skills/axie-hinh-hoa §1`. Bộ phận không nêu thì máy tự bịa, và cái bịa đó không thuộc
> bảng nào. **Sừng** là thứ nhận ra mạnh nhất từ xa, nên nó phải rõ.
> Lore: *"Nó không hiền đâu — nó chỉ quen ta thôi."* ⇒ cảnh giác, không dễ thương.

### ⑤ `traichu` — Trại Chủ Mục Đồng
```
A broad, sun-browned rancher in an open vest over a work shirt,
wide-brimmed hat, thick belt. Standing squarely, hands on hips or one
hand resting on a fence post.
BIG PROP: a tall shepherd's crook / herding staff held upright,
taller than his own head.
Secondary: a rolled blanket across the back.
Tan, ochre and faded blue palette.
```
> Đứng ở `ngoai` (Beast Herd Camp), tức **trên cỏ, không phải trên đá**. Vì vậy con này là con
> DUY NHẤT phải tránh tông xanh lá của bộ `_yt` — xem cảnh báo ở §4.

### ⑥ `truonglang` — Trưởng Làng *(gen lại, art cũ là một tấm thẻ bài)*
```
A village elder in a long belted robe with a fur-trimmed collar,
long white beard, deeply lined kind face, slight stoop.
BIG PROP: a gnarled wooden walking staff, taller than his shoulder,
with a simple carved knot at the top.
Secondary: a rolled parchment tucked under the other arm.
Warm russet and cream palette.
```
> ⚠ Con này giao **9/10 nhiệm vụ mở đầu** và `ah_onglao` cũng dùng chung tấm ấy — tức nó là NPC
> người chơi mới nhìn thấy nhiều nhất, mà lại là tấm duy nhất còn nguyên khung thẻ bài.

---

## 4. ⚠ MỘT CÁI BẪY MÀU, và nó chỉ lộ khi CHỤP RA

Bộ `_yt` bám tông **xanh lá**, hợp vì cả năm con đứng trên **đá lát** của Ardhaven. Nhưng
`traichu` đứng ở `ngoai` — **trên cỏ**. Một nhân vật xanh lá đứng trên nền cỏ xanh là đúng cái
bẫy đã ghi hai lần trong CLAUDE.md: viên tuyết Bird Tribe Heights đọc ra *một khoảng trời*, và
`long_trang` (thú lông trắng) trên nền tuyết thì **cả đàn tàng hình**.

⇒ `traichu` lấy **nâu vàng / lam bạc màu**, đừng lấy xanh lá. Và khi art về thì **chụp nó đứng
trên đúng map của nó** rồi nhìn, đừng chấm trên nền xám.

---

## 5. Art về rồi thì làm gì — bốn bước, không hơn

1. **Cắt & dọn.** `tools/iso/cat_congtrinh.py` + `tools/iso/don_congtrinh.py` — lò sinh ảnh hay
   kèm bệ đá, khung viền và cả chữ ghi kích thước. Bóng đổ nướng thành mảng đặc thì gỡ bằng
   `tools/iso/bo_bong.py` (chạy trên **cả** tấm tĩnh lẫn bảng khung nếu có).
2. **Thả tệp** vào `public/game/assets/npcs/<tên>.png`.
3. **Thêm đúng một khoá** `img:'assets/npcs/<tên>.png'` vào mục NPC trong `data/canbang.js`
   (riêng `traichu` nằm trong `game.js`, khối `NPCS.push`).
4. **Đo lại rồi mới nghiệm thu:**
   ```
   python3 tools/do_art.py                       # sáng · bão hoà · VIỀN
   node tests/test_capnha.js <cổng>              # NPC còn đứng đúng chỗ không
   ```
   Rồi **chụp màn hình**. Ba lỗi hình của đợt trang bị chỉ lộ khi chụp ra xem, không lỗi nào lộ
   khi đọc mã — và đài phun nước vừa rồi cũng thế.

---

## 6. Nợ đã biết, nói thẳng

- **`docs/npc-prompts.md` ĐÃ MỤC.** Nó ghi *"Tổng số NPC: 20"* (nay 41), trỏ vào map `tuongduong`
  (không còn tồn tại), và gán `thantoan.png` cho một NPC hiện **không có art**. Đừng đọc nó như
  hiện trạng; tệp này thay nó cho phần NPC còn thiếu.
- **10 tấm đang dùng chung cho 2-7 NPC**, nặng nhất là `laotuong.png` phục vụ **7 con** (bốn lính
  gác bốn cổng + Bổ Đầu + lính tuần + Lão Tướng). Bốn lính gác dùng chung thì hợp lý; Bổ Đầu và
  Lão Tướng dùng chung với lính gác thì không. Đó là một đợt đặt hàng RIÊNG, không gộp vào đây.
