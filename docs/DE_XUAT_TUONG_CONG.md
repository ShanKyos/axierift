# Tường thành và bốn cổng Ardhaven — đề xuất

> Đo bằng `node tools/do_thanh.cjs --cong`. Đi kèm `docs/THIET_KE_THI_TRAN.md` (bố cục trong
> tường) và `docs/DAT_HANG_ART_THANH.md` (đơn hàng art). **Đừng chép số vào đây bằng tay.**

---

## 0. Chẩn đoán: cổng không hỏng vì đặt sai chỗ — **thành không có tường**

Cổng là **cái lỗ trên một bức tường**. Ardhaven không có bức tường nào, nên không có chỗ đặt
nào làm cổng trông đúng được. Mọi triệu chứng dưới đây đều chảy ra từ chỗ đó.

| # | Đo được | Con số |
|---|---|---|
| 1 | Ảnh cổng che được bao nhiêu phần khẩu độ | **0%** — ở cả bốn cổng |
| 2 | Số tấm tường trong `MAP_VAT_SRC` | **0**. "Tường" là **200 cây** rải ngoài đa giác + rào vô hình |
| 3 | Khẩu độ cổng | **560px = 15 người đứng ngang** = 4,2× chiều cao nhân vật |
| 4 | Cổng so với Lò Rèn | **nhỏ hơn 8%** (472×435 vs 473×472) |
| 5 | Số hướng dùng chung một ảnh | **`ct_cong` × 4** |
| 6 | Cột mốc bấm G lùi vào trong | **80px** ở Bắc/Nam · **270px** ở Đông/Tây |
| 7 | Vòm cổng **vẽ bằng vector** (`drawGateStatic`) | **166 × ~140px** — hẹp hơn khẩu độ nó đánh dấu, và chỉ cao **1,1× nhân vật** |

**Vết gốc của #4 và #5 nằm ngay trong đơn hàng art.** `DAT_HANG_ART_THANH.md §2` đặt cổng
thành **mục số 7 trong một danh sách tám công trình**, dùng chung một khuôn prompt ép mọi tấm
về cùng một chân đế (*"ground footprint a diamond about 768 wide and 384 tall"*), và ghi ở cột
"Dùng cho": *"Bốn cổng Đ/T/N/B"* — một tấm, bốn hướng. Cổng thành được đặt hàng **như một căn
nhà nữa trong dãy phố**. Mở tấm `ct_cong.png` ra thì đúng như vậy: một **căn nhà đá một tầng có
cửa vòm và chậu lửa trên mái** — không có tường nối hai bên, không có lối xuyên qua.

**#5 còn sai cả về hình học chiếu.** Mặt tiền sprite isometric luôn quay **xuống dưới**
(CLAUDE.md đã ghi đúng luật này cho hàng nhà nam). Nên một tấm cổng chỉ đúng ở **một** hướng:
ở cổng Nam người chơi đứng phía bắc và lẽ ra phải thấy mặt trong của tường, nhưng lại thấy đúng
cái mặt tiền mà cổng Bắc cho thấy.

**#7 chỉ lộ ra khi dựng máy lát tường — và nó nói rằng thành đang có HAI cái cổng chồng nhau.**
`drawGateStatic()` dựng một vòm đá bằng `fillRect` / `hPoly` / `beginPath` ngay tại cột mốc bấm G,
trong khi `ct_cong` đứng lệch sang bên cách đó 150px. Hai thứ này vẽ ở hai chỗ khác nhau, bằng
hai ngôn ngữ hình khác nhau, và cùng tự nhận là cái cổng. Vòm vector còn **vi phạm Quy tắc số 3**
(*"KHÔNG dùng vector. CHẤM HẾT"*) — nó có từ trước đợt này.

**Không gỡ vòm vector ngay**, và đó là chủ ý: nó đang là thứ DUY NHẤT đánh dấu cái cổng, gỡ
trước khi có `cong_*` là để lại một lỗ trống. Nó nằm trong danh sách thay ở §5b, và đo được ở
trên chính là đặc tả cỡ cho tấm thay: 166 → **720**, cao 1,1× → **5,3× nhân vật**.

**#6 là chỗ đau nhất, vì nó không phải lỗi thẩm mỹ mà là một bài kiểm rò rỉ vào thiết kế.**
Chú thích ngay trên bảng `GATES` nói thẳng: hai cột mốc đông/tây đặt ở `x 480` và `x 5920` để
khẩu độ 5440px **chui dưới trần 5777px của `test_domap`**. Tức là chỗ bấm G ở hai cổng ấy do
một ngưỡng bài kiểm quyết định, không phải do bức tường. Đó đúng nghĩa là "đặt đại".

---

## 1. Dựng TƯỜNG trước, rồi mới có cổng

Tường lát bằng **viên lặp lại**, sinh thẳng từ `diTrong`, y hệt cách `sanIsoDung()` lát mặt sàn.
Đây là kết luận đã chốt ở `docs/NGHIEN_CUU_MAP_CAC_GAME.md`: **không game nào vẽ một tấm to —
tất cả đều ghép từ mảnh nhỏ dùng lại.** Tường còn dễ hơn viên nền: nó chỉ phải **liền mép theo
một chiều** (trái↔phải), không phải liền cả bốn mép như viên nền — mà liền bốn mép chính là chỗ
hai lượt gen viên nền trước đây đều hỏng.

**Bốn tấm:**

| Tấm | Dùng ở | Vì sao không gộp được |
|---|---|---|
| `tuong_ngang_trong` | cạnh **Bắc** — nhìn từ phía nam, thấy nguyên mặt trong | mặt tường cao, nhận sáng từ trên-trái |
| `tuong_ngang_ngoai` | cạnh **Nam** — nhìn từ phía bắc, thấy **mặt lưng + mặt trên thành** | không phải bản lật của tấm trên: lật dọc một tấm iso là hỏng phép chiếu |
| `tuong_doc` | cạnh **Tây** · lật ngang cho cạnh **Đông** | tường chạy theo trục y, thấy nghiêng; lật ngang thì đúng |
| `tuong_goc` | bốn góc bo · lật 4 kiểu | góc bo của `diTrong` có 3-4 đỉnh mỗi góc |

- **Nhịp 256px**, đúng `ISO_W` — tường phải rơi đúng lưới viên nền, lệch nhịp là mạch tường và
  mạch sàn đánh nhau.
- Cao **~300px ≈ 2,3× chiều cao nhân vật**. Thấp hơn tháp cổng (xem §2) để cổng còn nổi lên được.
- **Chu vi 17 954px ⇒ ~71 viên cho cả map**, và một cạnh màn hình 1920px chỉ ăn **8 viên** mỗi
  khung. Rẻ hơn hẳn một tấm tranh tường khổng lồ.

**⚠ Luật vẽ: tường đi một lượt RIÊNG, trước mọi thực thể — không xếp theo `y`.**
Engine xếp lớp theo `y` (`game.js:11348`). Tường nam nằm ở `y` lớn nhất map, nên nếu thả vào
danh sách thực thể thì nó **vẽ đè lên người chơi** mỗi khi anh ta đứng gần — người chơi biến mất
sau bức tường mà lẽ ra anh ta đang đứng trước. Người chơi **không bao giờ ra được ngoài đa
giác**, nên không có trường hợp nào cần tường nằm trước anh ta ⇒ vẽ tường sau mặt sàn, trước
thực thể, là đúng tuyệt đối và chỉ tốn một dòng.

**Cổng thì NGƯỢC LẠI — cổng vào danh sách thực thể, xếp theo chân ảnh** (đúng khuôn `vatTo`
đang dùng). Vì người chơi **đi xuyên qua** cổng: lúc anh ta ở trong vòm, tháp phía trước phải
che anh ta. Đây là khác biệt duy nhất giữa hai thứ, và trộn vào nhau là hỏng một trong hai.

---

## 2. Cổng là một công trình **khác hạng**, không phải căn nhà thứ chín

**Ba tấm cho bốn cổng** — ba, không phải một, và cũng không phải bốn:

| Tấm | Cổng | Người chơi thấy mặt nào |
|---|---|---|
| `cong_bac` | **Bắc** | mặt trong tường ngang, nhìn từ phía nam — nguyên mặt tiền, hai tháp, vòm giữa |
| `cong_nam` | **Nam** | mặt lưng tường ngang, nhìn từ phía bắc — lưng vòm, gầm mái, hai tháp từ sau |
| `cong_doc` | **Tây** · **lật ngang** cho **Đông** | tường dọc, nhìn từ phía trong |

Lật ngang là miễn phí (`ctx.scale(-1,1)`) và **đúng** cho cặp Đông/Tây vì chúng là ảnh gương của
nhau. Lật **dọc** thì không đúng cho cặp Bắc/Nam — nên cặp đó phải là hai tấm thật. Ba tấm là
số tối thiểu **đúng**, không phải số tối thiểu.

**Cỡ — cổng phải đọc ra là thứ to nhất trong thành:**

| | Hiện nay | Đề xuất |
|---|---|---|
| Khổ ảnh | 472 × 435 | **720 × 700** |
| So với Lò Rèn (473×472) | **−8%** | **+126%** |
| Cao so với nhân vật | 3,3× | **5,3×** |
| Che khẩu độ | **0%** | **100%** — ảnh phủ trọn cuống 560px, vòm nằm giữa |

720px rộng = phủ hết cuống 560px cộng hai chân tháp thò ra 80px mỗi bên. Trên màn 1920px ở zoom
mặc định, cổng chiếm 37% bề ngang khung hình — đủ để đọc ra là mốc, chưa tới mức nuốt màn hình.

---

## 3. Khẩu độ 560 → **260**, và cột mốc bấm G dời lên sát vòm

560px là **15 người đứng ngang**. Đó không phải cái cổng, đó là một đoạn tường bị thiếu.
260px ≈ **7 người**, tức 11 ô lưới tìm đường 24px — thừa rộng cho click-to-move, và vòng bắt
cổng (bán kính 90px, `updateGate`) nằm gọn trong họng.

Sửa đúng **16 / 36 đỉnh** của `diTrong` (4 đỉnh mỗi cuống), đã chạy thử:

| | |
|---|---|
| Đi được | 82,4% → **81,5%** (mất 0,20 Mpx, **toàn bộ nằm trong bốn cuống**) |
| Bốn `spawnFrom` | vẫn **trong đa giác**, vẫn **cách mép < 400px** (`test_noimap`) ✔ |
| Bốn cột mốc G mới | Bắc (3200,310) · Nam (3200,2890) · Tây (310,1600) · Đông (6090,1600) — đều trong đa giác ✔ |

### ⚠ Chỗ này đụng `test_domap`, và phải sửa BÀI KIỂM chứ không lách

Dời hai cột mốc Đông/Tây lên sát vòm cho khẩu độ **5780px**, vượt trần **5774px** (80,7% đường
chéo) **đúng 6px** — mà đường kính đo bằng **quãng ĐI BỘ**, còn dài hơn đường thẳng nữa.

Đây không phải map rỗng. Đây là **một cái thành có bốn cổng trên bốn bức tường**, nên hai cổng
đối diện **buộc phải** nằm gần hai mép — đó là định nghĩa của cái thành, không phải triệu chứng.
`test_domap` **đã có sẵn tiền lệ đúng kiểu này**: nó miễn sàn "đi được ≥55%" cho map thành với
ghi chú tại chỗ *"tường thành LÀ thiết kế"*, nhận diện bằng "không có bãi quái". Trần đường kính
phải được miễn theo đúng cách đó, cùng cách nhận diện, cùng kiểu ghi chú.

**Lách bằng cách để cột mốc lùi 270px là giữ nguyên đúng cái lỗi người chơi nhìn thấy** — bấm G
ở một chỗ cách cái cổng gần ba trăm pixel.

---

## 4. Đổi map sau cổng Nam ↔ Tây

Chủ dự án đã duyệt. Bản đầy đủ ở `docs/THIET_KE_THI_TRAN.md §4.4`; đây là danh sách sửa:

| Sửa gì | Từ | Thành |
|---|---|---|
| `GATES` · cổng Nam | `to:'ngoai'` | `to:'corran'` |
| `GATES` · cổng Tây | `to:'corran'` | `to:'ngoai'` |
| `MAPS.ardhaven.spawnFrom.corran` | `{x:250,y:1600}` | `{x:3200,y:3080}` |
| `MAPS.ardhaven.spawnFrom.ngoai` | `{x:3200,y:3080}` | `{x:250,y:1600}` |
| Lore `ah_gac_nam` ↔ `ah_gac_tay` | mỗi người tả vùng sau lưng mình | đổi chỗ hai khối `lore` + `barks` |

**Cố ý KHÔNG làm: dời cổng về của Corran sang rìa bắc.** Ra cổng Nam Ardhaven thì hiện ra ở
rìa **tây** Corran — không khớp la bàn. Nhưng **cổng thành chưa bao giờ hứa vị trí tương đối**:
luật đó chỉ áp cho lối rìa hoang dã (`test_noimap` nhận diện bằng tiền tố `Lối `, xem CLAUDE.md).
MU Online cũng không hứa. Dời cổng Corran là quét lại đa giác 68 đỉnh của nó dưới ràng buộc
≥720px cách Trùm Vùng — trả nhiều để mua một thứ người chơi không đo được.

---

## 4b. Chốt: ĐÚNG BỐN CỔNG, bốn hướng

Chủ dự án chốt **bốn cổng Bắc · Nam · Đông · Tây, không thêm cái nào**. Đó đúng là con số
`diTrong` đang khai và `GATES` đang chạy — không phải sửa gì về số lượng.

Trạng thái hình học bốn cổng, đo bằng `node tools/do_thanh.cjs --cong`:

| | |
|---|---|
| Khẩu độ | **260px** cả bốn — 7 người đứng ngang |
| Cột mốc bấm G | lùi **100px** sau mặt tường, **lệch tâm vòm 0px**, cả bốn ✔ |
| Cổng của nhân vật cấp 1 | **gần nhất** (1090px · 5,2s) ✔ |
| Ảnh cổng che khẩu độ | **0%** ← *thứ duy nhất còn thiếu, và nó là ART* |

⇒ **Hình học xong. Chỉ còn art.** Bảy tên tệp đã khai sẵn trong `MAP_VAT_SRC`; thả PNG vào
`assets/iso/` rồi **xoá tên khỏi `MAP_VAT_CHO`** là tường và cổng hiện lên — đúng một dòng,
không sửa gì thêm. Chừng nào tên còn trong danh sách chờ thì `vatTai()` trả `null`, nên bản
phát hành **không có một dòng 404 nào** (đã đo).

---

## 5. Đơn hàng art — 7 tấm

Nối vào `docs/DAT_HANG_ART_THANH.md` thành mục §2b. **Không dùng lại khuôn prompt §2** — chính
cái khuôn đó ép cổng về cỡ một căn nhà.

### 5a · Bốn viên tường

```
A single seamless isometric WALL SEGMENT tile for a 2D game, true 2:1 dimetric
projection, orthographic camera, no perspective convergence.

THE SEGMENT: <đổi dòng này>

Output 512x768, the segment centered horizontally and occupying the full width.

CRITICAL — SEAMLESS ALONG ONE AXIS. The left edge must continue exactly into the
right edge so the segment repeats side by side forever with no visible join: a
stone that touches the right edge reappears, cut in half, at the same height on
the left edge. Do NOT centre, frame or compose the segment — no vignette, no
end cap, no corner, no pillar at either end, no lighting falloff toward the
left or right edges.

Scale anchor: the wall is 2.3 times the height of a person. Do not draw a person.

Art style: Axie Infinity. Soft rounded chunky stone blocks, thick warm-dark-brown
outline (NOT black), cheerful saturated candy palette, gentle cel shading,
storybook charm. Never grim or gothic.

Lighting: single soft light from upper-left, identical brightness left edge to
right edge.

Hard rules: no characters, no text, no signage lettering, no UI, no watermark,
no ground, no shadow cast away from the base.
```

| # | Dòng `THE SEGMENT:` | Tấm |
|---|---|---|
| 1 | `a town rampart seen from INSIDE the town — the inner face of the wall runs across the image, a timber walkway with a handrail along its top, ladders and leaning spears against the stone` | `tuong_ngang_trong` |
| 2 | `a town rampart seen from BEHIND — the viewer looks at the back of the wall from inside the town, so the walkway floor and the crenellated top edge dominate and only a sliver of the far face shows below them` | `tuong_ngang_ngoai` |
| 3 | `a town rampart running away from the viewer at the isometric angle, its face turned to the right, buttresses spaced evenly along it` | `tuong_doc` |
| 4 | `a rounded corner bastion of a town rampart, the wall arriving from the left and leaving toward the lower right, a small conical roof on top` | `tuong_goc` |

### 5b · Ba tấm cổng

```
A single isometric TOWN GATEHOUSE for a 2D game, true 2:1 dimetric projection,
orthographic camera, no perspective convergence.

THE GATEHOUSE: <đổi dòng này>

Output 1024x1024, the gatehouse centered and filling the frame.

THIS IS THE LARGEST STRUCTURE IN THE TOWN. Two towers flank a single arched
passage. The towers rise 5 times the height of a person; the arch opening is
7 people wide and 2.5 people tall. The rampart wall continues out of BOTH sides
of the gatehouse at 2.3 people tall, cut off flush at the left and right edges
of the image so it butts against repeating wall segments. Do not draw a person.

Art style: Axie Infinity. Soft rounded chunky stone blocks, thick warm-dark-brown
outline (NOT black), cheerful saturated candy palette, gentle cel shading,
storybook charm. Never grim or gothic.

Lighting: single soft light from upper-left. Soft elliptical contact shadow under
the footprint only, no cast shadow reaching away.

Hard rules: no characters, no text, no signage lettering, no UI, no watermark,
no ground beyond the contact shadow.
```

| # | Dòng `THE GATEHOUSE:` | Tấm | Cổng |
|---|---|---|---|
| 5 | `seen from inside the town looking north at the wall's inner face — the full front of both towers, the open archway between them showing daylight through it, a banner hanging from each tower, a brazier burning on each roof` | `cong_bac` | Bắc |
| 6 | `seen from inside the town looking south at the wall's back — the viewer is behind the gatehouse, so the tower roofs and the rampart walkway dominate, the archway is seen from its rear, its underside visible` | `cong_nam` | Nam |
| 7 | `standing in a wall that runs top-to-bottom, its face turned to the right so the archway is seen at the isometric three-quarter angle, both towers visible one behind the other` | `cong_doc` | Tây · **lật ngang** cho Đông |

**Sau khi gen:** chạy `tools/iso/cat_congtrinh.py` rồi `tools/iso/don_congtrinh.py` như mọi tấm
`ct_*` — ⚠ Gemini vẫn vẽ kèm **bệ đá bẹt** dù prompt đã cấm, và nhớ **cộng bù độ lệch gốc mà
`don_congtrinh.py` in ra** vào `x`/`y` của `vatTo`, không thì công trình tự dời chỗ.

---

## 5c · Hợp đồng neo — đơn hàng art phải vẽ đúng quy ước này

Máy lát tường đặt tấm theo đúng bảng dưới. Vẽ sai neo thì mọi tấm lệch chỗ, và kiểu lệch đó
nhìn ra là "tường hơi thấp" chứ không nhìn ra là sai neo.

**Luật chung:** mép **DƯỚI** của ảnh là **đường chân** (chỗ tường chạm đất); **tâm ngang** của
ảnh là tim đoạn tường. **Không chừa lề trong suốt dưới chân.**

| Tấm | Khổ ảnh | Vì sao khổ đó |
|---|---|---|
| `tuong_ngang_trong` · `tuong_ngang_ngoai` · `tuong_goc` | **256 × 300** | nhịp 256 = `ISO_W`, rơi đúng lưới viên nền |
| `tuong_doc` | **160 × 428** | cao hơn tấm ngang vì phải cõng cả đoạn chạy 128px theo trục y lẫn chiều cao tường |
| `cong_bac` · `cong_nam` | **720 × 700** | 720 = khẩu độ 260 × 2,77 — phủ trọn cuống cộng hai chân tháp |
| `cong_doc` | **400 × 960** | 960 = 700 + khẩu độ 260, cùng lý do với `tuong_doc` |

Mấy con số này nằm trong `MAPS.ardhaven.tuong` và **là bản đặc tả kích thước cho hoạ sĩ**,
không phải hằng số tiện tay — đổi ở đây thì phải đổi cả đơn hàng §5.

---

## 6. Thứ tự làm

| Đợt | Việc | Kiểm |
|---|---|---|
| **C1** | Sửa 16 đỉnh `diTrong` (khẩu độ 560→260), dời 4 cột mốc G lên sát vòm, miễn trần đường kính cho map thành trong `test_domap` | `do_thanh.cjs --cong` · `test_domap` · `test_noimap` · `test_sandat` |
| **C2** | Đổi map sau cổng Nam ↔ Tây (§4) | `test_noimap` §1 — lan theo đường người chơi từ cấp 1 |
| **C3** ✅ | Máy lát tường: đọc `diTrong`, bỏ bốn cuống, rải viên nhịp 256px, vẽ **một lượt riêng** sau sàn trước thực thể | chụp màn hình bốn cạnh + bốn góc |
| **C4** | Gen 4 viên tường (§5a), lắp | lát thử 3 viên cạnh nhau xem có lộ mạch |
| **C5** | Gen 3 tấm cổng (§5b), thay `ct_cong` **và gỡ `drawGateStatic`** | `do_thanh.cjs --cong` — mục 8b phải ra **100%** |

**C1 · C2 · C3 đã làm.** C3 dựng ra **92 viên tường + 4 cổng** trên Ardhaven, hình học đã chụp
kiểm cả bốn cạnh lẫn góc bo. Máy chạy hoàn toàn theo dữ liệu: khai `tuong:{…}` trong `MAPS` là
xong, `vatTai()` trả `null` cho tên chưa có tệp nên **hiện vẽ số không viên, không hồi quy hình
ảnh nào**. Thả bảy tệp PNG vào `assets/iso/` + khai trong `MAP_VAT_SRC` là tường hiện lên,
**không phải sửa một dòng máy nào**. Xem trước hình học: `window.debugTuong()`.

**C4 · C5 là việc gen art của chủ dự án** — sandbox không gọi được meowa/Gemini (chặn egress).

**C1 và C2 không cần một tấm art nào** và chạy được ngay. C3 dựng máy trước khi có art — lát
tạm bằng chính viên `nen_da` để kiểm hình học, rồi C4 chỉ là thay tên tấm.

---

## 7. Đã cân nhắc và bỏ

- **Giữ `ct_cong`, chỉ dời cho phủ khẩu độ.** Không cứu được: tấm đó là một căn nhà có cửa vòm
  dẫn **vào trong nhà**, không có lối xuyên qua và không có tường nối hai bên. Dời nó vào giữa
  cuống thì người chơi đi **xuyên qua một căn nhà**.
- **Phóng to `ct_cong` lên 720px cho hợp cỡ.** CLAUDE.md đã cấm đúng chuyện này hai lần —
  trụ đá phóng to ~3× phải gỡ, và *"đừng chữa vấn đề thị giác bằng cách kéo giãn tài nguyên có
  sẵn"*. Phóng 472→720 là 1,53×, ra viền cứng và mất nét.
- **Một tấm cổng cho cả bốn hướng, lật cho đủ.** Lật **ngang** thì đúng (Đông/Tây là ảnh gương).
  Lật **dọc** thì sai phép chiếu: mặt tiền iso quay xuống, lật lên là ánh sáng và mái đảo ngược.
- **Lát tạm bằng cách phóng to một sprite có sẵn, hoặc nướng tạm bằng `tools/render3d`.**
  Bộ dựng hình 3D trong kho chạy được thật (chiếu trực giao, đệm độ sâu, ghi PNG, không cần
  gói ngoài) và `NGHIEN_CUU_MAP_CAC_GAME.md §6` có liệt nó làm đường lùi. Nhưng chính tài liệu
  đó ghi nó **"chỉ thiếu chất liệu bề mặt"** — mà một bức tường tô phẳng đứng cạnh art vẽ tay
  của Axie thì đúng là lỗi CLAUDE.md đã ghi hai lần và gỡ hai lần (lớp phủ tối, rồi trụ đá
  phóng ~3×). Thà tường chưa hiện còn hơn hiện ra một bức tường lạc quẻ.
- **Vẽ tường bằng một tấm tranh dài.** `NGHIEN_CUU_MAP_CAC_GAME.md` §2 đã chốt: không game nào
  làm thế, và mật độ chi tiết đo được nói trước kết quả.
- **Lùi cột mốc G để né trần `test_domap`.** Đó chính là cách chỗ bấm G rơi ra cách cổng 270px.
  Bài kiểm phải miễn cho map thành, như nó đã miễn sàn "đi được".

---

## 9. Kho Axie có "item nhà cửa" không? — **KHÔNG**, và lý do là cấu trúc

Quét toàn bộ, không phải mở vài thư mục: `find` trên **2 970 tệp PNG** của
`axie-origins-asset-kit` với `build|house|hut|shop|stall|tent|barn|farm|home|prop|furnit|`
`barrel|crate|fence|table|chair|sign|lamp|torch|well|cart|box|chest|door|roof|tile|decor`,
cộng `search_code org:axieinfinity path:prop` trên cả **54 repo**.

**Không một tấm nhà, một món đồ đạc, hay một bộ tile môi trường nào.**

Thư mục lớn nhất của gói nói hết:

| Thư mục | Số tệp |
|---|--:|
| `Resources/ImportedVfx` | 424 |
| `Materials/Mats_*` (VFX chiêu thức) | ~3 000 |
| `Animations` | 210 |
| `Audio` | 152 |

**Vì sao lại thế — và đây mới là phần đáng nhớ:** mọi kho Axie công khai đều là kho của một
**game đánh bài theo lượt** (Origins). Sân đấu của nó là **một tấm tranh nền nhìn ngang**, hai
bên đứng hai đội. Một game như vậy **không cần** nhà, không cần bàn ghế, không cần tile — nên
không ai vẽ.

Game có nhà cửa là **Homeland** (đất đai / nông trại), và Sky Mavis **chưa bao giờ công bố**
tài nguyên của nó: không có org `axie-homeland`, và tìm toàn GitHub chỉ ra công cụ của
người ngoài (xem `ASSET_SOURCING.md`, nguồn thứ mười hai).

⇒ **Nhà cửa, tường, cổng và vật nhỏ đều phải gen.** Không có đường vòng nào. Prompt sẵn ở §5
(tường + cổng) và `DE_XUAT_THANH_DAC_SAC.md §6` (công trình + tấm 12 vật nhỏ).

### Thứ kho Axie THỰC SỰ có, và ta chưa lấy

| | Số | Ghi chú |
|---|--:|---|
| `PvE/Avatars/` chân dung 200×200 nền trong | **41** | dùng ngay được làm avatar — xem `AVATAR.md`, mục đính chính |
| `PvE/Starters/` gói Spine Axie khởi đầu | 114 tệp | rig, không phải tranh dẹp |
| `PvE/UI/HpBar2`, `Frames`, `Icons` | ~94 | khung UI, thanh máu |
