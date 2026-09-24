# Axie Rift — hướng dẫn cho Claude

## ⚠ QUY TẮC SỐ 1: PHONG CÁCH LÀ **MU ONLINE**, KHÔNG PHẢI WUXIA

Game này khởi đầu là một game kiếm hiệp (wuxia) Trung Hoa và **đã được chuyển hẳn sang tribute
MU Online**. Tên thư mục/repo `axie-wuxia` chỉ là di sản lịch sử — **đừng để nó dẫn dắt thiết kế**.

Mọi thứ làm mới từ nay trở đi phải theo MU Online. Cụ thể:

**KHÔNG dùng:**
- Chữ Hán/kanji làm hình ảnh (icon, biểu tượng, glyph trang trí trên UI).
  Kiểm tra lại bất cứ lúc nào bằng:
  `python3 -c "import re;print(sum(1 for l in open('public/game/game.js',encoding='utf-8') if re.search(r'[　-〿一-鿿＀-￯゠-ヿ぀-ゟ]',l)))"`
  ⚠ **Câu lệnh trên nay trả `2`, không phải `0` — và cả hai đều ĐÚNG LUẬT.** Chúng là hai dòng
  **chú thích** ghi tên xương Spine (`背后头发` · `左手持剑`), tức tên do gói art đặt, không phải
  text người chơi thấy. Câu cũ ở đây ghi "không còn ký tự CJK nào" và nó đã thành lời nói dối
  lúc nào không ai hay. Việc cần làm khi con số này nhảy là **mở hai dòng ấy ra xem**, không
  phải xoá mù: con số 2 là mốc, vượt 2 thì có thứ mới lọt vào.
  Dải kiểm nay gồm cả **dấu câu CJK** (`【】《》`) và **ký tự toàn rộng** (`＋`), không chỉ chữ Hán:
  bản cũ chỉ quét U+4E00–U+9FFF nên 9 cặp `【…】` ở nhãn danh hiệu và tên bộ đồ lọt qua suốt
  nhiều đợt, dù chúng hiện thẳng trên HUD.
  Trường `glyph:` nay dùng ký hiệu phương Tây: `⚔ ✚ ✦ ✧ ✹ ◆ ♣ ▲ ❄ ☼ ⚡ ☾ ☠ ⚑ ★ ◉ ♦ ✽ ● ◑`
- Thuật ngữ tu tiên: cảnh giới, đan điền, kinh mạch, chân khí, tu vi, độ kiếp, bí kíp, môn phái,
  giang hồ, "Tộc", tiên hiệp, phi thăng...
- Motif kiếm hiệp: hoa đào, sương khói, thái cực, bát quái, ngũ hành làm hệ thống trung tâm

**PHẢI dùng:**
- Từ vựng & motif dark-fantasy phương Tây kiểu MU/Diablo — nhưng dùng **tên của game này**,
  không phải tên riêng của MU Online (xem QUY TẮC SỐ 2): Dark Knight, Dark Wizard, Dark Lord,
  Sylvan Ranger, Spellblade; Tinh Xảo/Cổ Vật; Đấu Trường Tế Thần, Pháo Đài Máu, Lò Hỗn Loạn;
  zone kiểu thị trấn đá phương Tây (Ardhaven)
- Art: khung kim loại gothic vát cạnh, biểu tượng vector (kiếm/khiên/lửa/sét/băng/vương miện),
  màu tô **theo nguyên tố của chiêu**, không theo màu lớp
- Số liệu/cơ chế: str/agi/vit/ene, tầm đánh & sát thương khác nhau theo lớp, reset (Tái Sinh)

**Thứ tự ưu tiên:** QUY TẮC SỐ 2 (bản quyền) > QUY TẮC SỐ 1 (phong cách). Khi hai cái đụng nhau,
giữ phong cách MU nhưng đổi tên.

**Text tiếng Việt vẫn giữ** (đây là game Việt hoá) — nhưng phải là tiếng Việt mô tả thế giới MU,
không phải sáo ngữ kiếm hiệp.

Khi thấy tàn dư wuxia trong code/UI cũ: dọn luôn nếu nằm trong phạm vi đang làm, hoặc báo lại.

## ⚠ QUY TẮC SỐ 2: KHÔNG DÙNG TÊN RIÊNG CỦA MU ONLINE

Lấy **ý tưởng và phong cách** từ MU Online thì được, nhưng **tên riêng thì không** —
đây là game sẽ phát hành, không phải bản mod. Text người chơi nhìn thấy phải sạch.

**Cấm xuất hiện trong text người chơi thấy:** ~~Kundun~~ · Lorencia · Noria · Devias ·
Icarus · Atlans · Tarkan · Fairy Elf · Magic Gladiator · Devil Square · Blood Castle.
(Nhắc "MU Online" trong *comment* để ghi nguồn cảm hứng thì được — chỉ là đừng ship
tên riêng của họ thành nội dung game.)

### ✅ NGOẠI LỆ ĐÃ DUYỆT: "Box Kundun"

Chủ dự án yêu cầu đích danh dùng **"Box Kundun"** cho hệ hộp mở đồ (trước là "Bảo Hạp"),
lý do: người chơi MU quen tên đó, gọi khác thì lạ. Rủi ro đã được nêu — đây là tên riêng
của MU Online, còn dự án này là tribute IP riêng — và chủ dự án vẫn chốt dùng.

⇒ `BAOHAP_TIERS[].name` = `Box Kundun I…VII`. **Đây là ngoại lệ DUY NHẤT.** Mười tên còn
lại trong danh sách trên vẫn cấm tuyệt đối. Đừng "sửa ngược" chỗ này tưởng là sót — nếu
muốn đổi lại thì phải hỏi chủ dự án, không tự quyết.

Kiểm tra bất cứ lúc nào: `node <scratchpad>/test_story.js` — nó quét toàn bộ
INTRO_PAGES / QUESTS / CLUES / BOSS_LORE / SECTS / NPCS / MOBS / TB_TIER_NAMES.

**Tên đã tự đặt để thay thế:**

| Thay cho | Dùng |
|---|---|
| MU (thế giới) | **Vaeldra** — lục địa thép và tro |
| Kundun | ~~Morvahn~~ — **đã bỏ cùng mạch cũ.** Canon nay không có đại ma đầu bị chôn; kẻ thù là **DRUE**, người thứ bảy đi qua Nhát Gọi (xem mục Cốt truyện) |
| Lorencia | **Ardhaven** |
| Fairy Elf / Magic Gladiator | **Sylvan Ranger** / **Spellblade** |
| Devil Square / Blood Castle | **Đấu Trường Tế Thần** / **Pháo Đài Máu** |
| Excellent / Ancient | **Tinh Xảo** / **Cổ Vật** |

Dark Knight · Dark Wizard · Dark Lord **giữ nguyên** — là danh từ fantasy phổ thông.

## 🔄 ĐỔI VAI: AXIE LÀ AVATAR, 5 LỚP LÀ SỨC MẠNH — đang thi công

> Đặc tả đầy đủ: **`docs/DOI_VAI_AXIE.md`** · Danh mục Cổ Vật: **`docs/CO_VAT_15.md`**
> Nhìn thử: **`public/game/proto_doivai.html`** (mở bằng máy chủ tĩnh, không nạp `game.js`)

**Chủ dự án chốt (nguyên văn):** *"Chỉ số tới từ 5 class. Axie chỉ đơn thuần là avatar thôi,
khi tấn công thì ví dụ Dark Wizard sẽ xuất hiện và tung chiêu."*

| | |
|---|---|
| **Axie** | thân NHÌN THẤY. **0 chỉ số, 0 kỹ năng, 0 trang bị.** Là ô để cắm NFT. Nhưng lớp Axie quyết định **hệ PHÒNG THỦ** — xem mục ⚔ ngay dưới. |
| **5 lớp** | nơi chứa **toàn bộ** chỉ số, trang bị, kỹ năng, Tiến Hoá, Di Sản |
| **Lúc đánh** | lớp nhân vật **vật chất hoá KẾ BÊN Axie**, tung chiêu, rồi tan. Axie **không** biến mất — nhân vật đi theo bảo kê. |

**⚠ MỘT NGƯỜI CHƠI = NHÂN VẬT + AXIE.** Chủ dự án chốt (2026-09-15). Hai hình đứng cạnh nhau
trên màn là **một** người, không phải hai — đọc ảnh chụp mà đếm đầu là đếm gấp đôi. Hệ quả cho
tầng mạng: đồng bộ một người chơi là đồng bộ **cả cặp**, và mọi phép đo "có mấy người trong
khung" phải đếm theo cặp.
| **Khoá lớp** | chọn một lần lúc tạo nhân vật. **Avatar thì tự do** — mọi NFT đều cắm được. |

### 🐾 ĐỔI CẤU TRÚC (2026-09-24): NHÂN VẬT LÀ THÂN CHÍNH, AXIE LÀ PET ĐI THEO

Chủ dự án chốt (nguyên văn): *"Mình muốn thấy nhân vật to ra để có thể thấy được cặp vũ khí,
axie giờ sẽ nhỏ lại như là pet đi theo nhé"*. Tức là **LẬT** thứ bậc cũ ("Axie là thân nhìn thấy,
lớp nhân vật là kẻ hộ tống / nhập vào Axie ngoài thành"). Công tắc duy nhất: **`THU_CUNG`**.

| | cũ | nay (`THU_CUNG = true`) |
|---|---|---|
| ai đứng ở `player.x/y` | con Axie | **nhân vật** (dời 0) |
| cỡ nhân vật | 0,72 · 0,90 · 1,00 tuỳ trạng thái | **`NV_CHINH_CO` 1,65**, cố định (1,30 thì chủ dự án thấy *"chưa to ra"* — trong thành bản cũ đã ở 1,00) |
| ngoài thành | nhân vật NHẬP vào Axie | **nhân vật luôn hiện** — `avaNhap()` trả `false` |
| con Axie | `AVA_TY` 0,95 / `AVA_TRAN` 1,18 | **`PET_TY` 0,46 / `PET_TRAN` 0,62**, lùi sau lưng (`PET_SAU` 78 · `PET_BEN` 48) |
| Axie ra đòn | ngoài thành ra đòn của lớp | **không** — khối GỒNG như trong thành |
| bay | chỉ lớp nhân vật bay, bóng giữ cỡ | nhân vật bay, **bóng co theo** (`bayKNen = bayK`); pet đứng đất |

- **`petLech(p, now)`** — pet trôi theo một điểm sau lưng, có độ trễ (`PET_TRE`), khoá theo
  `veKhoa(p)`, **ngoài `player`** (không chui vào save). Xa quá 320px (dịch chuyển) thì bám tức thì.
- **`veAvatarDat(g,p,now,bayCao,dx,dy)`** — hai tham số dời mới; có dời thì vẽ thêm bóng nhỏ cho pet.
- Xếp chiều sâu theo **`_axTruoc`** (pet đứng cao hơn trên màn thì vẽ trước).
- Vật chất hoá / vòng triệu hồi mỗi cú đánh **tắt** — nhân vật luôn có mặt, mờ đi rồi hiện lại
  mỗi đòn là nhấp nháy.
- ⚠ **Hệ phòng thủ theo lớp Axie (`heThu`) KHÔNG ĐỔI** — đây chỉ là đổi LỚP VẼ. Pet nhỏ không
  có nghĩa là Axie hết tác dụng; Axie Core vẫn gánh bằng luật phòng thủ.
- ⚠ Các mục bên dưới (nhập vào Axie · Axie ra đòn · tỉ lệ `AVA_TY`) mô tả hình dạng CŨ. Tắt
  `THU_CUNG` là về nguyên hình dạng đó; đọc chúng như lịch sử khi công tắc đang bật.
- ⚠ **`THU_CUNG` là `let`, và bốn bài gác hình dạng cũ TỰ TẮT nó** (`test_avaphanung` ·
  `test_axiedanh` · `test_hopve` · `test_vukhihien`) — chúng đỏ vì luật bị lật, nên được giữ
  để gác đường lui chứ không bị xoá mệnh đề. Hình dạng pet gác ở **`tests/test_thucung.js`**.

### 🚪 VÀO THÀNH BẰNG ĐƯỜNG ĐI BỘ TỪNG BẤT KHẢ — điểm hạ cánh nằm NGOÀI cổng

`MAPS.ardhaven.spawnFrom` đặt bốn điểm hạ cánh **ngoài** cột mốc (trong vấu cổng — thời còn bấm G).
Từ khi lối ra tự đi (`LOIRA_TAM`), muốn vào thành là phải bước qua đúng vòng lối ra ⇒ bị hất
ngược ra map vừa rời. Đi bộ về "map an toàn" là không thể; chỉ dịch chuyển bằng bảng M còn chạy.

Sửa hai lớp: (1) dữ liệu — bốn điểm dời vào **trong** cổng ~180px, lệch khỏi trục để không đè
Lính Gác; (2) chốt chung trong `travelTo` — hạ cánh gần (<400px) cổng dẫn NGƯỢC về map vừa rời thì
khoá cổng ấy, nhả khi đã đi xa hơn chỗ hạ cánh 60px (`_loiRaKhoa.nha`). Mốc cố định
`LOIRA_TAM*1.6` thì hạ cánh ở 170px là nhả ngay khung đầu — tức khoá chết.
`test_noimap` miễn luật "điểm tới sát rìa" cho `Lối Về Thành` (đúng ý chú thích của nó —
`MAPS.ardhaven` không khai `city` nên chốt cũ chưa bao giờ miễn được).

### ⚔ LỚP AXIE QUYẾT ĐỊNH HỆ PHÒNG THỦ — quan hệ, KHÔNG phải nấc thang

Thể lệ Vibeathon chấm **Axie Core 35%** với đúng một câu: *"a meaningful interpretation of the
theme that **affects the game**"*, và luật nói thẳng *"rather than appear only as a cosmetic
skin"*. Đo trước khi làm: lái cả 16 con qua `calcDerived()` ở cấp 60 ⇒ **0 con làm đổi một điểm
chỉ số nào**, tắt hẳn avatar cũng đổi 0. Tức con Axie đúng nghĩa đen là một cái skin.

⇒ `SECTS[sect].element` — vốn là **hằng số**, chọn lớp xong là khoá cứng cả đời — nay do con
Axie đang đeo quyết định. **`heThu(p)` là cửa DUY NHẤT**.

> ⚠ Mục này viết cho **chặng 1**, hồi vòng khắc còn là NGŨ GIÁC năm hệ và có bảng `AXIE_HE` gộp
> 9 lớp Axie xuống 5. Chặng 2+3 đã đổi hẳn sang **tam giác chín lớp** và **gỡ `AXIE_HE`** — xem
> mục ngay dưới. Giữ lại phần này vì luật hai-chiều-hai-nguồn và luật "không cộng chỉ số" thì
> không đổi; chỉ mấy con số và bảng ánh xạ là đã cũ, và chúng được đánh dấu tại chỗ.

| chiều | hệ lấy từ đâu | hệ số |
|---|---|---|
| người → quái | **VŨ KHÍ** (`atkElem`) | ×1,20 / ×0,88 |
| quái → người | **AXIE** (`heThu`) | ×1,12 / ×0,90 |

**⚠ KHÔNG CỘNG MỘT CHỈ SỐ NÀO, và đó là cả điểm.** Hai hệ số kia đã chạy sẵn; đổi Axie chỉ đổi
NHÁNH nào được chọn. Luật *"Axie 0 chỉ số"* còn nguyên — đây là một **quan hệ**, không phải một
nấc thang. Trục sức mạnh từ phía Axie đã bị tháo **ba lần** (bị động `thu` · cấp Chimera · bốn ô
Cốt) và lần nào cũng quay lại dưới dạng *"chỉ vài dòng chỉ số nhỏ thôi"*. **Đừng "cải tiến" nó
thành +% kháng.** `tests/test_hethu.js §4` gác đúng chiều đó: đổi qua cả 16 con phải đổi 0 điểm.

**⚠ ĐỪNG ĐỤNG CHIỀU TẤN CÔNG.** Luật bất đối xứng *"đổi vũ khí không bao giờ làm ngươi ăn đòn
nặng hơn"* đã chốt từ trước và có chú thích tại chỗ. Hai nguồn cho hai CHIỀU thì đọc ra được; ba
nguồn là ba thứ phải nhớ.

**Đo được sau khi làm** (cùng một con quái hệ Ember, cấp 40, chỉ đổi Axie):

| Axie | hệ | máu mất |
|---|---|--:|
| `coghound` Mech | Steel — bị Ember khắc | **675** |
| `emberjaw` Beast | Ember — trung tính | 608 |
| `tidewarden` Aquatic | Frost — khắc lại Ember | **510** |

Chênh **32,4%**, lớn hơn 24% lý thuyết vì giáp trừ thẳng khuếch đại — cùng cơ chế đã ghi ở mục
hố XP. Đây cũng là **lý do chơi để sở hữu nhiều hơn một con Axie**, thứ mà gacha Khế Ước đang
bán mà trước nay không có.

> ⚠ **CON SỐ 32,4% LÀ MỘT CON SỐ KHÔNG ĐẠI DIỆN, và tôi đã suýt đem nó đi báo cáo.** Nó đo
> trên MỘT con quái tự tay chọn. Tính lại trên **đàn quái thật của từng vùng** thì chênh giữa
> con Axie hợp nhất và con tệ nhất chỉ **7,9%** — vì không vùng nào thuần hệ, mỗi map trộn 3-5
> hệ nên lợi và hại triệt tiêu nhau. *Đo một mẫu tự chọn rồi gọi nó là kết quả thì lúc nào cũng
> ra con số mình muốn.* Đó chính là lý do chặng 3 tồn tại.

> ⚠ Đo một đòn thì không đo được gì: mỗi đòn quái mang `rnd(0.85, 1.15)`, tản ±15%, trong khi
> tín hiệu cần bắt là ±12%/−10%. Bảng trên đo một đòn và ra đúng chiều vì MAY. `test_hethu §2`
> nay cộng dồn **900 nhịp** và ghim lại người chơi lẫn con quái mỗi nhịp — cùng bài học đã ghi
> cho `test_elem §4`.

**⚠ HAI LỚP ĐỔI HỆ MẶC ĐỊNH, biết và chấp nhận:** vì nhân vật mới nào cũng có Axie mặc định
(`AVA_MAC_DINH`), hệ phòng thủ mặc định suy từ con đó chứ không từ `SECTS`. Dark Knight
Steel → **Ember**, Dark Lord Stone → **Verdant**; ba lớp còn lại trùng khít hệ cũ. Với 11 map
(hệ trội: Verdant 4 · Stone 3 · Frost 3 · Ember 1 · Steel 0) thì Dark Knight bất lợi ở nhiều map
hơn trước, Dark Lord thì ít đi. Muốn giữ y hệt bản cũ thì đổi `AVA_MAC_DINH` — nhưng bảng đó
chọn theo **hình dáng cho dễ phân biệt ngoài đường**, đổi nó là trả giá bên kia.

**⚠ `heThu` KHÔNG BAO GIỜ được trả rỗng.** Nhánh khắc hệ đọc `if (mobEl && sectEl2)`, nên trả
`null` là **tắt câm** cả cơ chế mà không một lỗi nào in ra. Chưa có avatar thì lui về hệ của lớp.

**⚠ Đây là bước GỘP 9 → 5, không phải tam giác chính chủ của Axie.** Vòng khắc ở đây là **ngũ
giác 5 cạnh**, không chứa nổi một tam giác 3 nhóm (①Beast·Bug·Mech ▶ ②Plant·Reptile·Dusk ▶
③Aquatic·Bird·Dawn ▶ ①). Đổi hẳn sang tam giác là đợt việc RIÊNG và nó **đổi cân bằng** — tỉ lệ
khắc nhau 20% → 33%. Bước này cố ý không đụng một cạnh nào.

**⚠ Hai dòng hệ phải nằm TRÊN trong bảng Nhân Vật, đừng đẩy xuống cuối mảng `stats`.** Bản đầu
tôi `push` vào cuối; chụp ra nhìn thì chúng rơi khỏi vùng thấy được và phải cuộn mới gặp. Mà đó
là hai dòng **duy nhất** trong cả khối người chơi đổi được bằng một lựa chọn — còn lại đều là kết
quả của cấp và trang bị. *Một cơ chế bị chôn dưới đáy danh sách cuộn thì với người chơi không
khác gì không tồn tại.*

**Còn treo:** chỗ đổi Axie hiện **tự do ở mọi nơi**. Chủ dự án chưa chốt — ba lựa chọn là (a) mặc
kệ, coi như chọn build · (b) chỉ đổi trong thành (MU thuần) · (c) tự do nhưng có hồi chiêu. Hiện
đang là (a) vì đó là hành vi sẵn có, thêm chốt sau là một dòng trong `chiChon()`.

### ▲ TAM GIÁC CHÍN LỚP AXIE (chặng 2) + VÙNG MANG LỚP CỦA TỘC NÓ (chặng 3)

Chặng 2 thay **ngũ giác năm hệ** (Steel · Verdant · Stone · Frost · Ember — thừa kế từ đời game
kiếm hiệp) bằng **tam giác chín lớp Axie chính chủ**:

```
  ① Beast · Bug · Mech   ▶   ② Plant · Reptile · Dusk   ▶   ③ Aquatic · Bird · Dawn   ▶   ①
```

Chặng 3 gán cho mỗi vùng lớp của **tộc mang tên nó**, để con Axie đang đeo có nghĩa KHÁC NHAU ở
những nơi khác nhau.

**⚠ HAI CHẶNG PHẢI ĐI CÙNG NHAU — thử ngược đã chứng minh, không phải suy.** Gỡ riêng chặng 3
ra (để hệ khoá theo LOÀI như cũ, giữ nguyên tam giác) rồi đo lại:

| | chỉ chặng 2 | chặng 2 + 3 |
|---|---|---|
| chênh tốt nhất / tệ nhất trong một vùng | **2,1% – 13,6%** | **24,4% ở cả 10 vùng** |
| lớp trội chiếm bao nhiêu dân số | 34% – 48% | **65% – 100%** |
| một nhóm Axie tối ưu ở mấy vùng | **6/11** | **4/11** (sàn toán học) |

Lý do: **loài dùng lại qua nhiều map** — `thinu` có mặt ở bốn map, `mocnhan` bốn, `bandao` bốn,
`huyetbat` hai. Hệ khoá theo loài thì Bug Tribe Tunnels và Plant Tribe Glade **bắt buộc** trùng
hệ, và cả cơ chế "chọn Axie theo nơi sắp đi cày" mất nghĩa.

**Kiến trúc: HAI TẦNG, y hệt vai trò.** `MOB_ROLE` là lớp nền, `pk.vai` của bãi thì thắng — ở
đây `MOBS[].el` là lớp nền, `vung.he` của miền dân số thì thắng. Cửa đọc duy nhất là **`mobHe(m)`**.

| ở đâu | việc |
|---|---|
| `ELEM` + `nhom` 0/1/2 + **`heKhac(a,b)`** | bảng và cửa DUY NHẤT hỏi "a có khắc b không" |
| `ELEMENTS = Object.keys(ELEM)` | suy từ bảng — vũ khí bốc Rune từ đây |
| `vung: [{ id, he:'Plant', … }]` trong `data/canbang.js` | lớp của miền dân số |
| `banRaiVung` → `pk.he` → `spawnMob(…, {he})` → **`m.he`** | sợi dây từ dữ liệu tới con quái |
| `mobHe(m)` = `m.he || m.def.el` | cửa đọc, dùng ở cả tính sát thương lẫn mọi chỗ hiện ra |
| `heKhacLai(he)` → `banSacHtml` | dòng "mang X · Y · Z tới" trên bảng Bản Đồ |

**⚠ KHÔNG CÒN TRƯỜNG `beats`.** Ngũ giác khắc một-đối-một nên `beats` là một CHUỖI và mã so
bằng `===`. Tam giác khắc ba-đối-ba; giữ `beats` thành mảng rồi `.includes()` là chép cùng một
quan hệ ra chín chỗ. `nhom` là nguồn duy nhất.

**⚠⚠ TUYỆT ĐỐI KHÔNG GHI HỆ VÀO `m.def.el`.** `def` thường LÀ chính đối tượng trong `MOBS` —
`spawnMob` chỉ clone khi vai có hệ số khác 1 — nên ghi vào đó là đổi hệ của loài ấy ở **mọi
map** cho tới khi tải lại trang. Cùng vết sẹo mà `goldify()` đã ghi.

**⚠ VÀ BÀI KIỂM DẪM ĐÚNG BẪY ĐÓ.** `test_elem` đặt `m.def = {...m.def, el: mobEl}` rồi đo — ra
**đúng 923 cho cả năm cột**, vì `spawnMob` đã điền `m.he` lúc sinh và `mobHe` đọc nó trước.
Trông y hệt "khắc hệ chết hẳn". Bài kiểm nào chỉnh hệ của một con quái thì phải chỉnh `m.he`.

**⚠ CHỌN BA CON AXIE Ở BA NHÓM KHÁC NHAU, đừng chọn theo tên lớp.** Tam giác gom chín lớp thành
**ba** nhóm, nên Mech và Beast — hai tên khác hẳn nhau — là **trung tính với nhau**. `test_hethu`
bản đầu dùng Mech vs Beast và đo ra 455.613 vs 459.144, tức không chênh gì, đúng như luật nói.

**⚠ NGƯỠNG "không lớp nào tối ưu quá 3/11 vùng" trong `docs/AXIE_CORE.md` là một ngưỡng KHÔNG
TỒN TẠI** — nó viết hồi vòng khắc còn năm phía. Tam giác chỉ có BA nhóm, nên 11 vùng chia ba
nhóm thì nhóm đông nhất tối thiểu là `ceil(11/3)` = **4**. Đã sửa cả đặc tả lẫn bài kiểm, và
ghi lý do tại chỗ. *Một ngưỡng chép từ đặc tả cũ mà không kiểm lại là một bài kiểm đỏ vĩnh viễn
vì đòi một thứ bất khả.*

**Lớp của vùng — suy từ tên vùng, không bịa:**

| vùng | lớp | | vùng | lớp |
|---|---|---|---|---|
| Beast Herd Camp | Beast | | Bird Tribe Heights | Bird |
| Werebear Woods | Beast | | Reptile Sunstone Flats | Reptile (thuần 100%) |
| Plant Tribe Glade | Plant | | Dusk Marsh | Dusk (thuần 100%) |
| Bug Tribe Tunnels | Bug | | Rẻo Rừng Corran | Dawn — rễ Cây Hồn |
| Aquatic Tribe Causeway | Aquatic | | Trũng Nứt Corran | Mech — đất ngay dưới Nhát Gọi |
| **Lối Mòn Corran** | **TRỘN, cố ý** — một lối mòn không phải một nơi, không Rune nào cắm ở đó | | | |

`loimon` chênh **11,7%** và là vùng phẳng nhất. Đó là thứ đáng giữ, không phải lỗi: nó là chỗ
duy nhất không Axie nào hợp hơn Axie nào. `test_tamgiac.js` miễn trừ nó **có nêu tên và lý do** —
đừng miễn trừ bằng một danh sách không giải thích.

**Nhịp cấp: đổi ~+1%, và con số đó suy được chứ không cần đoán.** Vũ khí bốc hệ đều tay, nên tỉ
lệ ăn hệ số đổi từ (20% khắc · 20% bị khắc) sang (33% · 33%) ⇒ hệ số nhân trung bình
`0,2×1,20 + 0,2×0,88 + 0,6×1,0 = 1,016` → `⅓×1,20 + ⅓×0,88 + ⅓×1,0 = 1,0267`, tức **+1,05%**.
Nằm sâu trong nhiễu của `tools/do_nhipcap.cjs` (chính nó có đỉnh 50% do bốc trúng bộ đồ ngon),
nên `XP_TABLE` **không chỉnh**. ⚠ Phân bố hệ của quái **không** ảnh hưởng con số này: với một
con quái bất kỳ, xác suất vũ khí bốc đúng hệ khắc luôn là 3/9.

#### 📢 VẾ PHÒNG THỦ PHẢI NÓI RA — và nửa CÓ LỢI của nó từng câm tuyệt đối

Chiều quái → người là thứ gánh tiêu chí Axie Core, nhưng nó chỉ có đúng **một** cửa hiện ra:
một dòng `logCombat` trong hộp nhật ký 260px ở góc dưới-trái — trôi quá nhanh để đọc giữa lúc
đánh nhau — **và chỉ in ở nhánh bất lợi**, vì cờ `mobCounter` không bao giờ bật ở nhánh ×0,90.
Tức nửa có lợi, cũng là nửa trả lời cho *"vì sao phải có nhiều hơn một con Axie"*, chưa từng
hiện ra một lần nào. Đối chiếu: chiều TẤN CÔNG thì có hẳn một số bay trên đầu quái với bốn tiền
tố riêng (`HOÀN HẢO` · `KHẮC HỆ` · `bị khắc` · `(chống)`). *Cơ chế vô hình là cơ chế không tồn tại.*

**`heThuKet(mobEl, axieEl)` là cửa DUY NHẤT** cho mọi chỗ nói ra vế đó, và nó mang luôn **hai hệ
số** nên đường sát thương cũng đọc từ đấy — chép `1.12`/`0.9` ra thêm một chỗ là thêm một chỗ
nói dối được.

| kênh | trả lời câu gì | ở đâu |
|---|---|---|
| số bay trên đầu người chơi, mỗi đòn trúng | *đang xảy ra chuyện gì* | cạnh `logCombat` trong `hurtPlayer` |
| một mệnh đề trên băng-rôn lúc vào map | *nên cầm con nào TỚI đây* | `travelTo`, suy từ `mapBanSac` |

**⚠ HAI KÊNH, ĐỪNG GỘP.** Băng-rôn bắn một lần lúc vào map nên đổi Axie giữa map là nó thành
một câu đã cũ; số bay thì không bao giờ nói được nên cầm con nào **trước khi đi**.

**⚠ `heThuKet` TRẢ CẢ TRẠNG THÁI TRUNG TÍNH (`ket:0`), đừng trả `null` cho nó.** Im lặng ở nhánh
trung tính thì người chơi không phân biệt được *"con này không khắc gì ở đây"* với *"cơ chế
không chạy"* — đúng cái kiểu bỏ sót vừa phải sửa. Số bay thì cố ý bỏ qua nhánh 0 (trung tính là
mặc định, bắn mỗi đòn là nhiễu), băng-rôn thì nói.

**⚠ SỐ BAY PHẢI CÓ HỒI** (`HE_FLOAT_HOI` 2,6 giây, mốc để ngoài `player` cho khỏi chui vào save).
Bắn một cái mỗi đòn thì một trận đông quái đẩy tràn mảng `floats` (trần 70) và nuốt mất mọi
thông báo khác — chữa một chỗ mù bằng cách làm mù chỗ khác.

**⚠ HAI LỖI CỦA CHÍNH BÀI KIỂM, ghi lại vì cả hai cho ra một bài xanh/đỏ vì lý do sai:**
1. **Đọc `floats` SAU vòng lặp là đọc quá muộn.** 600 nhịp `update(1/60)` là **10 giây trong
   game**, mà một số bay chỉ sống ~1 giây — đo được `soFloat: 0` trong khi `tongFloat: 11`, tức
   bài báo "không hiện gì" trong lúc nó đã hiện đúng. Phải hứng **ngay trong vòng**, và gom theo
   ĐỐI TƯỢNG chứ không theo chữ (gom theo chữ thì không đếm được số lần bắn).
2. **Ghim hệ cho MỘT con quái là chấm một cảnh khác hẳn cảnh mình tưởng đã dựng.** Số bay bắn
   theo con vừa đánh trúng, mà map có nhiều bãi — lượt đầu bắt được `⚠ Dusk khắc Aquatic` của
   một con khác. Phải ghim cả map, và bài nay **tự kiểm cảnh dựng** (đòi chữ bắt được phải nhắc
   đúng tên con quái đã ghim) trước khi chấm.

### 📣 HAI TRỤC AXIE PHẢI ĐƯỢC **DẠY**, và đo mới biết là chưa

Cơ chế chạy đúng và có bài gác từ lâu (`test_hethu` · `test_bophan`). Nhưng đếm lại các cửa nói ra
nó thì ra **sáu kênh, không kênh nào là nhiệm vụ** — `grep` toàn bộ 50 nhiệm vụ chính + 32 phụ cho
**0** chỗ nhắc tới hệ phòng thủ, đổi thân hay cấu tạo. Với người chơi mới, một cơ chế chiếm 35%
barem mà chuỗi hướng dẫn không trỏ tới lấy một lần thì nó ngang với không tồn tại.

**⚠ VÀ CHỖ GIẢI THÍCH BẰNG LỜI DUY NHẤT TRONG CẢ GAME ĐANG DẠY SAI.** Trang dẫn truyện — thứ
người chơi đọc ĐẦU TIÊN — viết *"Mỗi lớp mang một **hệ nguyên tố** — khắc hệ +20% sát thương"*.
Sai cả hai nửa kể từ đợt tam giác: hệ đòn đánh lấy từ **vũ khí** (`atkElem`, lớp chỉ là đường lui),
còn hệ phòng thủ — đúng cái trục gánh Axie Core — **không được nhắc một chữ**. Câu đó sống sót qua
cả đợt tam giác lẫn đợt sáu bộ phận vì **không bài kiểm nào đọc văn xuôi**.

| kênh | trục | ai thấy | nó trả lời câu gì |
|---|---|---|---|
| số bay trên đầu mỗi đòn trúng | 1 | mọi người | *đang xảy ra chuyện gì* |
| băng-rôn lúc vào map | 1 | mọi người | *nên cầm con nào TỚI đây* + **chỗ đổi (phím C)** |
| `mang X · Y · Z tới` — bảng Bản Đồ | 1 | ai mở M | hệ của **đất** |
| hai dòng hệ — bảng Nhân Vật | 1 | ai mở C | hệ của **mình** |
| `Cấu tạo Axie — Thuần 6/6` — bảng Nhân Vật | 2 | ai mở C | hạng của con đang đeo |
| danh sách Khế Ước | 1+2 | cấp 6+ | chỗ **duy nhất** thấy đủ sáu bộ phận |
| **`axieTaiDay(c)` — phán quyết TẠI CHỖ** | 1+2 | cấp 6+ | ***nên cắm con nào BÂY GIỜ*** |
| **`c1q4` Thân Nào Cho Đất Nào** (cấp 19) | 1 | mọi người | *cơ chế này có tồn tại* |

**`axieTaiDay(c, mapId)` là cửa DUY NHẤT** hỏi "con này ở đất đang đứng thì thế nào". Bảng Khế Ước
trước đây giải thích cơ chế rất kỹ nhưng **không biết người chơi đang đứng ở đâu**, nên nó bắt người
đọc tự làm phép so sánh trong đầu — đúng cái mà hệ trang bị đã học một lần rồi và chữa bằng
`itemCompareHtml`. ⚠ Nó đi qua `heThuKet` + `bpSac(bpCung(c))`, **đừng tự nhân hệ số**.

**⚠ TRẢ `null` KHI ĐẤT KHÔNG CÓ HỆ TRỘI** (trong thành, hành lang trộn hệ). In "trung tính" ở đó là
nói dối theo chiều ngược lại: người chơi tưởng đã hỏi và đã được trả lời, trong khi chỗ đó vốn không
có câu trả lời nào. Và dòng đầu bảng in kèm **tỉ lệ** (`tyLeHe%`) — không có nó thì Lối Mòn Corran,
vùng **cố ý trộn hệ**, đọc ra mạnh y như một vùng thuần 100% trong khi chênh ở đó chỉ 11,7%.

**⚠ `MOC_NV.than` CỐ Ý KHÔNG ĐÒI "đang đeo thân KHẮC LẠI đất này".** Nghe mạnh hơn hẳn, nhưng thân
là thứ bốc từ gacha: người xui có thể không sở hữu con nào thuộc nhóm cần, mà chính tuyến là chuỗi
**THẲNG** — một ô không qua được là cả game dừng. Đo được: 16 con chia **4 · 7 · 5** cho ba nhóm,
nên xác suất cả ba lượt quay của `c1q3` rơi cùng một nhóm lên tới ~8%. Cùng bài học ở mục "CỬA CƠ
CHẾ MỞ Ở CẤP NÀO": hỏi *đếm được không* rồi phải hỏi tiếp *ai cũng làm được không*. Nhiệm vụ mở
cửa; **cái bảng mới là thứ dạy**.

**⚠ `player.avatar !== undefined`, KHÔNG phải `!player.avatar`.** `undefined` là chưa từng chạm,
`null` là đã tắt bằng `/avatar off` — cũng là một lựa chọn hẳn hoi. Gộp hai cái là người bấm nút tắt
kẹt nhiệm vụ vĩnh viễn, và không lỗi nào báo. Cùng luật ba-trạng-thái đã ghi ở mục `avatarId`.

**⚠ CHÈN MỘT NHIỆM VỤ CHÍNH LÀ MỌI `reqMain` TRƯỢT.** `c1q4` chèn ở **chỉ số 11**, nên 8 mốc
`reqMain` ≥ 11 đã +1 (`12·16·17·20·24·27·33·39` → `13·17·18·21·25·28·34·40`). Sửa bằng máy, đừng
sửa tay từng dòng — và `test_daythan §1` gác chiều đó (`reqMain` phải trỏ vào trong chuỗi).

Gác: **`tests/test_daythan.js`** (6 mệnh đề, **cả sáu đã thử ngược và đều đỏ**). ④ đo ở **HAI map**
— một bảng hỏi ở đúng một chỗ thì mọi cách cài đều xanh, kể cả cài chết cứng một hệ; phải đổi map
rồi đòi phán quyết ĐỔI THEO. ⚠ Phép thử ngược của ⑤ lần đầu **im lặng** vì mỏ neo có **hai** chỗ
(hai nhánh của `heThuKet`) — đúng vết sẹo đã ghi ở `test_hethong`: *mỏ neo của phép thử ngược phải
DUY NHẤT, và phải đếm số lần xuất hiện trước khi thay.*

### ▲▲ SÁU BỘ PHẬN AXIE — trục THỨ HAI, và nó chứng minh được là KHÔNG bán sức mạnh

`axie-hinh-hoa §1` chốt: một con Axie luôn dựng từ **đúng sáu bộ phận** — Mắt · Tai · Sừng ·
Miệng · Lưng · Đuôi. Trước đợt này game **không đọc một bộ phận nào**: con Axie chỉ có MỘT trục
là `lop` (hệ phòng thủ). Đó là hai khoản trừ còn lại của tiêu chí Axie Core, và một cơ chế đóng
cả hai.

**Đếm `cung`** = mấy bộ phận thuộc **cùng nhóm tam giác** với `lop` của chính con đó (0..6). Nó
điều khiển **ĐỘ SẮC**, không điều khiển sức mạnh:

| | |
|---|---|
| `cung` 6 → **thuần** | chuyên gia: rất nhẹ đòn ở vùng hợp, rất nặng ở vùng khắc |
| `cung` 0 → **tạp** | thợ đụng: không bao giờ tệ, không bao giờ xuất sắc |

| ở đâu | việc |
|---|---|
| `bp:{ mat, tai, sung, mieng, lung, duoi }` trong `data/canbang.js` | 16 × 6 = 96 ô, **tự khai theo chính `moTa` đã có** |
| **`docs/BANG_BOPHAN.md`** | bảng đủ 96 ô + độ thuần + độ sắc — **sinh bằng `node tools/bang_bophan.cjs`, đừng sửa tay** |
| `bpCung(c)` | đếm — `null` khi chưa khai, và `null` ≠ 0 (0 là *tạp nhất có thể*, một phán quyết hẳn hoi) |
| `bpSac(cung)` → `BP_SAC_MIN` 0,45 … `BP_SAC_MAX` 1,50 | độ sắc |
| **`axieSac(p)`** | cửa DUY NHẤT hỏi "người này sắc tới đâu"; lui về 1 khi thiếu dữ liệu ⇒ save cũ không phải di trú |
| `heThuKet(mobEl, axieEl, sac)` | tham số thứ ba, mặc định 1 ⇒ mọi lời gọi hai tham số cũ ra đúng số cũ |

**⚠⚠ BẤT BIẾN LÀ THỨ GIỮ LỜI HỨA, và nó giữ bằng PHÉP DỰNG chứ không bằng một con số chọn khéo.**
Ba hệ số được nội suy về chính **trung bình** của chúng: `mul(sac) = HE_TB + (mul_gốc − HE_TB)·sac`.
Tổng ba nhánh vì thế không đổi theo `sac` — đạo hàm đúng bằng 0. Trên phân bố đều chín lớp quái
(mỗi nhóm 3 lớp ⇒ 3 nhánh đều nhau) thì **kỳ vọng hệ số phòng thủ của cả 16 con bằng nhau CHÍNH
XÁC** — đo được lệch `2,2e-16`, tức đúng nhiễu dấu phẩy động. Đổi Axie đổi **hình dạng** rủi ro,
không đổi **tổng**.

**⚠ ĐỪNG "sửa gọn" thành `mul = 1 + (mul_gốc − 1)·sac`.** Nhìn sạch hơn, nhưng `HE_THIET` (+0,12)
và `HE_LOI` (−0,10) **không đối xứng quanh 1**, nên cách đó cho trung bình `1 + 0,00667·sac`:
con càng thuần càng ăn đòn nặng hơn trên tổng thể. Đó vẫn là một nấc thang, chỉ là nấc đi xuống.
Thử ngược đúng phép ấy ⇒ `test_bophan §2` đỏ với lệch `7,0e-3`.

⚠ Công cụ sinh bảng **đọc `ELEM` và hai hằng độ sắc THẲNG TỪ `game.js`** bằng regex và **dừng
hẳn** khi không khớp. Chép một bảng nhóm tam giác thứ hai vào công cụ là đúng cái thứ nó sinh ra
để tránh — và regex trượt rồi im lặng sinh ra một bảng khác là vết sẹo đã ghi ở `test_taitro §2`.

**⚠ ĐỪNG CHO NGƯỜI CHƠI TỰ CHỌN BỘ PHẬN.** Bộ phận thuộc về con Axie và cố định. Cho chọn là dựng
lại đúng cái trục đã bị tháo BA lần, chỉ khác tên.

**⚠ ĐỘ THUẦN CỐ Ý KHÔNG ĐI THEO SỐ SAO.** Một trong hai con thuần nhất là `hexmite` — **4★**. Nếu
5★ nào cũng thuần hơn thì người chơi đọc ra "5★ mạnh hơn", mà đó đúng là thứ gacha không được bán.
`test_bophan §1` gác.

**Số đo sau khi làm** (chênh giữa vùng dễ thở nhất và ngặt nhất, trên **đàn quái thật** của 11
vùng — không phải trên chín lớp đều tay):

| | chênh vùng dễ / vùng ngặt |
|---|--:|
| `ironshell` · `hexmite` — thuần 6/6 | **39,0%** |
| trung bình nhóm thuần (≥5/6) | 36,3% |
| trung bình nhóm tạp (≤2/6) | 16,5% |
| `coghound` — tạp 0/6 | **10,3%** |

Tổng `cung` = 52/16 con ⇒ trung bình **3,25** ⇒ sắc trung bình **1,019**, tức gần khít mốc 1,00
của bản trước bộ phận. `test_bophan §1` kẹp trong [0,95 – 1,05] để không ai lặng lẽ thổi cả bảng.

**⚠ HAI MỆNH ĐỀ KẸP HAI ĐẦU, thiếu một là bỏ lọt một nửa.** §2 (bất biến) **xanh y hệt khi cơ chế
tắt hẳn** — mọi hệ số bằng 1 thì trung bình cũng bằng nhau. §3 là vế kia: con thuần phải dao động
mạnh hơn hẳn con tạp. Và §4 là vế thứ ba — **sợi dây**: thử ngược bằng cách gỡ `axieSac(player)`
khỏi `hurtPlayer` thì §3 **vẫn xanh** (nó hỏi thẳng `heThuKet`) còn §4 đỏ.

**⚠ BA LỖI CỦA CHÍNH BÀI KIỂM, ghi lại vì cả ba đều cho một kết quả SAI mà trông rất thuyết phục:**
1. **Dựng nhánh BẤT LỢI rồi chấm như nhánh có lợi.** `heKhacLai(heThu(player))[0]` là lớp **khắc**
   người chơi, không phải lớp người chơi khắc. Bài báo *"đường sát thương không đọc cấu tạo"*
   trong khi nó đọc hoàn hảo. Nay đo **cả hai chiều** — một lỗi DẤU thì đúng một vế đỏ.
2. **Chọn cặp Axie quá gần nhau.** netherfang 3/6 vs inkmane 1/6 chênh lý thuyết ~4%, trong khi
   mỗi đòn mang `rnd(0.85,1.15)` ⇒ **đỏ 1/3 lượt**. Nay dùng cặp xa nhất cùng lớp: `ironshell`
   6/6 vs `ridgehorn` 2/6 ⇒ ~8%, và **giữ đúng MỘT nguồn sát thương** (`mobs.length = 1` mỗi
   nhịp) vì cả bãi quái đứng chỗ bốc lại mỗi lần `travelTo` là một nguồn nhiễu không kiểm soát được.
3. **`renderMount` khoá dưới cấp 6.** Nhân vật vừa tạo là cấp 1 nên mục ⑥ đo trên đúng cái câu
   *"Khế Ước mở khóa ở cấp 6"* rồi báo "danh sách không nói cấu tạo". Nay tự kiểm cảnh dựng trước.

#### ⚠ VÀ BÀI KIỂM TÌM RA MỘT LỖI THẬT: **2,6 GIÂY ĐẦU CỦA MỌI PHIÊN BỊ CÂM**

Mốc hồi của số bay khắc hệ so `performance.now()` với `_heFloatMs`, và nó từng khởi tạo bằng **0**.
`performance.now()` đếm từ lúc **nạp trang**, nên `now − 0 > 2600` **sai suốt 2,6 giây đầu đời của
trang**: ai vừa vào game mà ăn đòn ngay thì không thấy gì — và cái không-thấy đó đọc ra y hệt
*"cơ chế không chạy"*. Nó cũng làm `test_hethu §7a` phụ thuộc vào trang nạp nhanh hay chậm, và khi
đợt bộ phận làm trang nặng thêm một chút thì mục đó **đỏ 3/3 lượt** trong khi `heThuKet` trả về
hoàn toàn đúng. Nay `-Infinity` ⇒ đòn ĐẦU TIÊN luôn nói ra rồi mới vào nhịp hồi; `test_hethu §7d`
đo trên một **trang mới tinh** vì đó là cảnh duy nhất dựng lại được lỗi.

*Luật chung: một mốc so với `performance.now()` mà khởi tạo bằng 0 thì nó không phải "chưa từng
xảy ra" — nó là "vừa xảy ra lúc trang mở".*

Gác: **`tests/test_bophan.js`** (7 mệnh đề, ba phép thử ngược đều đỏ) · **`tests/test_tamgiac.js`** (8 mệnh đề) — hình dạng tam giác · mọi quái/trùm ra lớp hợp lệ
· **cùng một loài ở hai map phải ra hai lớp** (mệnh đề bắt đúng chuyện chặng 3 có tác dụng hay
không) · chênh ≥15% mỗi vùng · lớp trội ≥50% · ba nhóm chia nhau 11 vùng · hệ số vẫn đúng
×1,20/×0,88 · bảng Bản Đồ có nói ra. Thử ngược (gỡ `pk.he`) làm đỏ 4 trong 8.

### ⇒ Đây KHÔNG phải đổi kiến trúc. Là đổi LỚP VẼ.

`calcDerived()` · `hurtMob()` · `castSkill()` · `SECTS` · `HERO_SETS` · `player.equip` ·
`player.sect` — **không đụng một dòng nào.** Save cũ đọc được nguyên vẹn.

### Đã thi công

| Thứ | Ở đâu |
|---|---|
| `player.avatar` · `avatarId()` · `veAvatar()` · `chiVeChay()` · `veVongTrieu()` | `game.js`, ngay trên `chiVeNho` |
| Móc vào `drawPlayer()` | 5 chỗ, **tất cả đều qua cửa `avatarId(p)`** |
| Lệnh `/avatar <id> · ds · off` | bảng lệnh gỡ rối |
| 16 bảng khung CHẠY `<id>_r.webp` | 1,29 MB, **nạp theo nhu cầu** (chỉ con đang dùng) |
| Công cụ nướng | `tools/spine/nuong_chi_chay.py` |

### ⚠ `undefined` ≠ `null` — VÀ ĐỪNG KHAI `avatar:` TRONG KHỐI DỰNG NGƯỜI CHƠI

> ⚠ Mục này **trước đây ghi "`player.avatar` rỗng ⇒ HÀNH VI CŨ Y NGUYÊN"**. Nửa sau không còn
> đúng — chủ dự án đã chốt **bật mặc định** (`3b0b28b`): rỗng nay nghĩa là *lấy con mặc định
> của lớp*. Giữ đúng cái tiêu đề này để cảnh báo, thay vì xoá trắng rồi để người sau đọc câu cũ
> mà tưởng avatar vẫn là thứ phải gõ lệnh mới có.

`avatarId(p)` là cửa DUY NHẤT, và nó phân biệt **ba** trạng thái, không phải hai:

| `p.avatar` | nghĩa | vẽ ra |
|---|---|---|
| `undefined` | **chưa từng chọn** — nhân vật mới, hoặc save đời trước bản này | `AVA_MAC_DINH[p.sect]` |
| `null` | người chơi **đã tắt** bằng `/avatar off` / `chiTatAvatar()` | lớp nhân vật như cũ |
| một id | con đang cắm | con đó |

Gộp hai cái đầu thành `!p.avatar` là cái nút tắt không tắt được gì.

**⚠ HỆ QUẢ: khối dựng người chơi trong `startGame` TUYỆT ĐỐI KHÔNG khai `avatar:`.** Khai
`avatar: null` là nói với máy rằng nhân vật **vừa tạo ra đã tự tắt avatar** — nên nhân vật mới
không thấy Axie nào, trong khi save đời cũ (không có khoá) thì thấy. `JSON.stringify` bỏ khoá
`undefined`, nên không khai chính là cách lưu đúng trạng thái "chưa chọn".

**Và đây là chỗ đau — nó đã ship, đúng cái kiểu hỏng mà tài liệu này cảnh báo ở mục màn chờ:**
hai commit cùng ngày 2026-09-11 sửa **hai vùng khác nhau** của `game.js` — `5706cb7` (gỡ Ragoon)
thêm dòng `avatar: null`, `3b0b28b` (bật mặc định) dựng luật `undefined`/`null`. `git merge` ghép
êm ru, `node --check` xanh, cả ba khẳng định avatar trong `test_avatar` vẫn xanh, và thứ còn lại
là một trò chơi mà **tính năng đầu bảng của cả đợt Đổi Vai tắt ngóm với mọi người chơi mới**.

⚠ **Ba khẳng định cũ xanh vì chúng chỉ đọc BẢNG `AVA_MAC_DINH`.** Bảng thì không bao giờ hỏng;
thứ hỏng là sợi dây từ bảng tới nhân vật. `test_avatar §4` nay **lái `startGame` cho cả năm lớp**
rồi hỏi `avatarId(player)`, và hỏi thêm chiều NGƯỢC LẠI (`/avatar off` vẫn phải tắt được) — vì
cách "sửa" dễ nhất, gộp `undefined` với `null`, cũng làm vế đầu xanh. *Kiểm một cái bảng không
bao giờ kiểm được cái dây.*

**Cờ bài kiểm đọc được:** `window.__veThan` nay có ba giá trị — `'avatar'` · `'sprite'` ·
`'vector'`. Bài cũ nào khẳng định nó phải là `'sprite'` thì vẫn đúng khi avatar tắt.

### ⚖ TỈ LỆ: AXIE LÀ THÂN, LỚP NHÂN VẬT LÀ KẺ HỘ TỐNG — cả hai cỡ đều DƯỚI 1

Chủ dự án chốt sau khi nhìn ảnh chụp: *"kéo scale Axie lớn và kéo thân người lúc ra tuyệt chiêu
cho nó nhỏ lại"*. Ở cỡ thật (1,00) hai hình đọc ra **hai nhân vật ngang hàng**, không ra "Axie
là thân, lớp nhân vật là sức mạnh được gọi tới".

| | đi theo | ra đòn |
|---|---|---|
| cỡ lớp nhân vật | `AVA_THEO_CO` **0,72** | `AVA_DANH_CO` **0,90** — không còn 1,00 |
| chỗ đứng | sau 70 · bên 34 | trước 72 · bên 56 |

`AVA_TY` 0,72 → **0,95** và `AVA_TRAN` 0,95 → **1,18** (hộp Axie 90,6 → **112,6 px**).
⚠ Lượt chỉnh đầu đẩy tới 1,08/1,40 (hộp 133,6) và chủ dự án nhìn ảnh chụp nói ngay
*"không cân đối lắm"* — Axie nuốt mất kẻ hộ tống. Số hiện tại là lượt kéo lại: Axie to hơn
bản gốc ~24%, người cũng to hơn ~20%, tỉ lệ giữa hai bên mới là thứ phải nhìn, không phải
cỡ của riêng cái nào. ⚠ Đo trước khi chỉnh: **`AVA_TY` không
bó con nào** — cả 5 con mặc định đều chạm `AVA_TRAN` ở chiều RỘNG (16 con có tỉ lệ rộng/cao
1,07–1,52). Nới `AVA_TY` một mình là không đổi lấy một điểm ảnh; thứ thật sự điều khiển cỡ Axie
là `AVA_TRAN`.

Khoảng cách đứng phải nới THEO: tổng độ lệch phải vượt nửa hộp Axie (nay ~67px) cộng nửa bề
ngang người. Quên bước này là Axie to ra rồi nuốt luôn kẻ hộ tống.

### Sáu cái bẫy đã dẫm, ghi lại

1. **`atkAnim` ĐẾM NGƯỢC** — `atkK` = 1 ở khung ĐẦU. Tiến độ vật chất hoá là `1 − atkK`. Dùng
   thẳng `atkK` thì lớp nhân vật mờ dần ĐI trong lúc vung, tức ngược hẳn. (Cùng họ với bẫy
   `lungeK = hSwing(1 - atkK)` đã ghi ở mục cảm giác chiến đấu.)
2. **Avatar phải vẽ SAU `ctx.restore()`** của khối thân người. Bên trong đó là hệ toạ độ cục bộ
   của bộ xương (đã dời về `p.x/p.y`, lật theo hướng, thu theo tỉ lệ) — avatar tự lo cả ba thứ
   đó nên vẽ trong đấy là lật hai lần và thu hai lần.
3. **`AVA_TY` là số trần, `avaCao()` là HÀM.** Nhân thẳng `NV_THAN_PX` ở chỗ khai (dòng ~5110)
   là rơi vùng chết của `const` — `NV_THAN_PX` khai tận dòng 22987. Đúng cái bẫy đã ghi ở mục
   `NV_CAO`.

4. **Lớp nhân vật đứng KẾ BÊN, nên phải xếp CHIỀU SÂU.** `_avaDx/_avaDy` dời nó ra trước +
   sang bên; ai đứng THẤP hơn thì vẽ SAU. Vẽ Axie sau cùng ở mọi hướng (bản đầu) thì quay mặt
   xuống là con Axie che mất nửa người. Trục sâu nén 0,55 — cùng lối với bóng đổ.
5. **`_lopHien` PHẢI luôn đúng bằng `_kind === 'a' || 'c'`.** Nó tính SỚM vì phép dời gốc toạ
   độ nằm trên chỗ tính `_kind`. Thêm trạng thái mới vào chuỗi `_kind` phía trên `'c'` thì
   phải sửa `_lopHien` theo — không thì thân người hiện một chỗ, vòng triệu hồi nổ chỗ khác.
   *Đừng vá bằng "nếu lệch thì gán lại": nó làm chỗ lệch chạy được nên không ai biết mà sửa.*
6. **CÁNH · THẦN KHÍ · THÂN NGƯỜI phải thu quanh CÙNG MỘT TÂM.** Khối thân thu quanh
   `(p.x, p.y − NV_LECH_Y)` — đó là chỗ hộp 160×220 của bộ xương neo vào. Khối cánh/thần khí
   từng thu quanh `(p.x, p.y)`. Ở cỡ 1,00 hai tâm cho cùng kết quả nên **không ai thấy**; thu
   còn `co` thì sai số bung ra đúng `(1 − co)·NV_LECH_Y` — ở cỡ đi theo (0,60) là **16,8 px**,
   tức đôi cánh rơi xuống ngang hông của một hình chỉ cao 57 px. Chủ dự án chụp lại và gọi
   đúng tên: *"cánh chưa fit với nhân vật theo sau"*. Dùng `_lopNeoY`.
   Và phải mang theo cả số hạng **lấy đà** `Math.cos(p.face)*lungeK*7`: `lungeK` bằng 1 lúc
   đứng yên (xem `hSwing`), nên thiếu nó là cánh lệch 7 px **suốt**, không chỉ lúc đánh.

   Cách gác: `_doNeo()` (chỉ chạy khi `TEST_MODE`) đưa gốc cắm cánh và khớp vai qua **đúng ma
   trận vòng vẽ đang dùng** rồi phơi ra `window.__neoVe`; `tests/test_hopve.js §4` so hai điểm.
   Đừng chép công thức biến hình sang bài kiểm — đó là dựng bản sao thứ hai của một luật đang
   sống, sửa một bên là hai bên lệch mà bài vẫn xanh.

### 🪶 CÁNH NHẤC LỚP NHÂN VẬT, KHÔNG NHẤC CON AXIE

Chủ dự án chụp màn hình và gọi đúng tên: *"hình bay như này sai quá sai"*. Thứ trong ảnh là con
Axie — **cái thân NHÌN THẤY của người chơi** — treo lơ lửng cách vòng chân của chính nó 24 px,
không cánh, không hoạt cảnh bay nào.

Nguyên nhân: khối BAY bọc **cả cặp** trong một `ctx.translate(0, yOff)`, trong khi `veCanh()` thì
vẽ đôi cánh ở chỗ **lớp nhân vật** đứng (chính là bản vá của đợt trước — "cánh mọc ra từ con Axie"
đã sửa rồi). Tức đôi cánh đeo trên kẻ hộ tống mà cả hai cùng bay.

| | bay | bóng đổ · vòng chân · bụi gót |
|---|---|---|
| có avatar | **chỉ lớp nhân vật** (`veAvatarDat` cộng `bayCao` lại) | **giữ nguyên cỡ** (`bayKNen = 0`) |
| `/avatar off` | thân người — hành vi cũ y nguyên | co + nhạt theo `bayK` như cũ |

⚠ **`bayKNen` là biến riêng, đừng gộp lại với `bayK`.** `bayK` vẫn điều khiển KHỐI VẼ của lớp
nhân vật (khối `w` ghim ở `BAY_KHUNG`) và độ cao của nó; `bayKNen` chỉ trả lời *"chân đế còn
chạm đất không"*. Gộp là hoặc con Axie bay lại, hoặc lớp nhân vật hết bay.

⚠ **`veAvatarDat()` có HAI chỗ gọi** (xếp lớp theo chiều sâu: Axie vẽ trước hay sau lớp nhân vật
tuỳ `_avaDy`). Sửa một chỗ quên chỗ kia là con Axie bay ở **nửa số hướng nhìn** — nhìn ra "hình
như lag" chứ không ra một lỗi.

⚠ **`_coAva` nay khai SỚM**, ngay dưới `_chet`, vì khối BAY cần nó. Chỗ khai cũ (dưới phần xếp
lớp) đã gỡ — đừng khai lại thành hai.

Gác: `tests/test_baydat.js` (3 mệnh đề, đã thử ngược). Mệnh đề ② **bắt buộc** phải có: nếu chỉ
khẳng định "con Axie đứng đất" thì gỡ sạch hệ bay cũng xanh.

### 🎒 BẢN CHƠI THỬ: SAVE ĐỜI TRƯỚC CŨNG PHẢI NHẬN BỘ GIAI 7

`phatDoKhoiDau()` chỉ chạy trong `newGame()`. Nên mọi nhân vật tạo **trước** bản demo — tức đúng
những người đang chơi thử — không bao giờ thấy bộ giai 7. Và triệu chứng không đọc ra là "thiếu
đồ": chủ dự án hỏi *"cây cung thiên mệnh gắn theo nhân vật của mình đâu?"*, vì lớp vũ khí **cầm
tay** chỉ bật khi món đang đeo trùng `dòng|giai` trong `NV_VK_LOP` — một cây cung giai 3 làm cả
lớp art biến mất, không lỗi nào báo.

`demoDoDiTru()` trong `loadGame()` trả chỗ đó. Bốn luật:

- **CHỈ NÂNG, KHÔNG BAO GIỜ HẠ.** Ô nào đã ≥ `DEMO_DO_GIAI` thì để yên — trừ vũ khí **sai dòng**,
  vì chỉ đúng dòng mới có tranh (`DEMO_VK_DONG`).
- **Món bị thay vào TÚI, không xoá.** Hết chỗ thì bỏ qua ô đó. Một bản demo lấy mất đồ của người
  chơi là đổi một lỗi lấy một lỗi nặng hơn.
- ⚠ **PHẢI chạy SAU `migrateGiai14()` / `migrateGiai7()`.** Hai hàm đó viết lại `it.tier` của MỌI
  món trong equip/inv, nên phát trước chúng thì bộ giai 7 vừa phát bị nghiền xuống **giai 5**
  (7 → 10 → `ceil(10/2)`) — đo được, và im lặng tuyệt đối.
- ⚠ **Cờ `player._demoDo` chặn phát hai lần**, và `TEST_MODE`/`TEST_DO` thì không phát: hơn 180
  bài cân bằng đo nhân vật TRẦN.

⚠ **Phép sinh món nằm ở MỘT chỗ** (`demoTaoMon`), dùng chung cho cả `newGame` lẫn di trú. Chép
sang đường thứ hai là hai đường phát ra hai bộ đồ khác nhau mà không ai thấy.

Gác: `tests/test_demodo.js` (6 mệnh đề). ⚠ Mệnh đề ⑥ gác THỨ TỰ và phải đứng RIÊNG: cảnh của
① đặt sẵn `giai14`/`giai7` (đúng như save của bản đang chạy) nên hai hàm kia no-op và **đảo thứ
tự vẫn xanh** — đã thử ngược đúng thế.

### Trúng đòn và chết vẫn giữ AXIE — cố ý

Chỉ `'a'` (đánh) và `'c'` (niệm chú) mới gọi lớp nhân vật ra. Nếu lớp nhân vật nháy ra mỗi lần
ăn đòn thì trong một trận đông quái người chơi gần như không còn thấy avatar của mình — mà
avatar mới là thứ họ chọn hoặc mua.

### ✅ AXIE NAY PHẢN ỨNG — GỒNG lúc ra đòn, GIẬT lúc trúng đòn (và **KHÔNG ĐÁNH**)

> ⚠ Mục này trước đây ghi *"Nợ: rig có sẵn `defense/hit-by-normal` và chưa nướng"*. Đã trả.

Trước bản này `veAvatar` chỉ biết hai khối (thở · chạy), nên cái thân NHÌN THẤY của người chơi
**đứng bất động suốt trận**: ra đòn thì lớp nhân vật vung bên cạnh còn con Axie không nhúc nhích,
ăn đòn cũng thế.

| khối | hoạt cảnh nguồn | tệp | khung |
|---|---|---|---|
| gồng | `battle/get-buff` (1,000s) | `<id>_b.webp` | 12, 6 cột |
| giật | `defense/hit-by-normal` (0,417s) | `<id>_h.webp` | 8, 4 cột |

Nướng: `tools/spine/nuong_chi_phanung.py` · **2,17 MB cho cả 16 con**, nạp theo con đang có mặt.
Gác: `tests/test_avaphanung.js` (7 mục, ba cơ chế đã thử ngược và đều đỏ).

### ⚔ ~~AXIE KHÔNG ĐÁNH~~ — LUẬT NÀY ĐÃ BỊ LẬT (2026-09-16). Axie NAY RA ĐÒN.

> ⚠ Giữ đúng cái tiêu đề gạch ngang này để cảnh báo, thay vì xoá trắng rồi để người sau đọc
> `test_avaphanung §6` trong lịch sử git mà tưởng luật cũ còn. Cùng kiểu bẫy đã ghi ở mục
> "~~Khắc Ấn~~" và "~~Bốn Ô Cốt~~".

**Luật cũ (chốt 2026-09-15) nói:** kit có 8 đòn gần + 5 đòn xa, rất dễ "tiện tay" nướng thêm,
**đừng** — vì cho con Axie tự húc *trong lúc* Dark Wizard niệm chú **bên cạnh** là dựng lại đúng
cái **hai kẻ cùng đánh** mà cả đợt Đổi Vai gỡ đi.

**Lý do đó hết hiệu lực vì HÌNH DẠNG đã đổi, không phải vì ai đó quên nó.** Chủ dự án chốt lại
2026-09-16, nguyên văn: *"Cứ cho Axie ra đòn… Người chơi muốn đánh quái thì phải nhập vào Axie,
nhưng để flex được bộ giáp thì hãy làm cho nó đi theo ở trong thành."* Nay lớp nhân vật **NHẬP
VÀO** con Axie khi ra khỏi thành ⇒ lúc đánh trên màn chỉ còn **MỘT** thân, tức ngược hẳn với thứ
luật cũ cấm.

| | lớp nhân vật | con Axie | cây vũ khí |
|---|---|---|---|
| **trong thành** | HIỆN, đi theo, cỡ `AVA_THANH_CO` **1,00** | khối GỒNG như cũ | **mang bên vai, LUÔN hiện** |
| **ngoài thành** | **nhập vào** — không vẽ | **ra đòn của LỚP mình** | **CHỈ hiện lúc ra đòn** |

**⚠ LUẬT THEO MAP, KHÔNG THEO "ĐANG ĐÁNH NHAU" — cố ý.** Gắn vào trạng thái đánh nhau thì AUTO
cày liên tục ⇒ người chơi ở dạng đã-nhập gần như **100% thời gian**, và bộ giáp vẫn không ai
thấy — tức mất đúng cái lợi mà cả đợt này sinh ra để lấy.

**⚠ `safe` MỘT MÌNH KHÔNG ĐỦ.** Outskirts (`ngoai`) khai `safe` nhưng là **bãi săn 8 bãi** —
cùng bẫy đã ghi ở mục Rương Canh: *cửa duy nhất đúng là CÓ BÃI QUÁI*. Sàn đấu `pvp` không bãi
quái nhưng `freepk` ⇒ **vẫn nhập**, đúng ý. Cả ba ca đều có mệnh đề gác.

**⚠ NĂM LỚP PHẢI RA NĂM ĐÒN KHÁC NHAU — đây là cả điểm của đợt này.** Lúc đánh không còn thân
người nào để nhìn, nên nếu Axie của năm lớp vung giống hệt nhau thì 5 lớp mất sạch dấu hiệu
**nhìn thấy được**. Kit có 9 đòn gần + 5 đòn xa dùng chung mọi rig ⇒ năm kiểu đọc tốn **0 đồng
art**. Chọn theo cách lớp ấy đánh (khớp `SECT_ACT`), không chọn cho đủ mặt:

| lớp | hoạt cảnh kit | tệp | khung |
|---|---|---|---|
| `thieulam` Dark Knight | `attack/melee/tail-smash` | `_ts` | 12 |
| `baidasan` Dark Wizard | `attack/ranged/cast-high` | `_ch` | 12 |
| `toanchan` Sylvan Ranger | `attack/ranged/cast-fly` | `_cf` | 12 |
| `minhgiao` Spellblade | `attack/melee/multi-attack` | `_ma` | **16** |
| `bug` Dark Lord | `attack/ranged/cast-low` | `_cl` | 12 |

Đo được: **10/10 cặp lệch 5.627-6.990 điểm ảnh**. Nướng: `tools/spine/nuong_chi_danh.py` —
**80 bảng, 7,0 MB** trên đĩa, nạp lười ~88 KB (đúng một con × một lớp đang dùng). Ô cắt
**175×132 trùng khít** bảng nhỏ/chạy/gồng/giật ở cả 16 con ⇒ không nhảy khi đổi khối.

**⚠ BỐN CHỖ PHẢI GÁC RIÊNG BẰNG `_nhap` vì chúng KHÔNG đọc `_hienLop`:** vòng triệu hồi · cánh ·
thần khí · hào quang Thần Hiệp. Bỏ sót một chỗ là **một đôi cánh bay lơ lửng không ai đeo** cạnh
con Axie. Cái giá, nói thẳng chứ không giấu: **ngoài thành người chơi không còn thấy đôi cánh
mình mua** — chỗ khoe cánh nay là trong thành.

> ⚠ **Câu trên nay chỉ còn đúng với BA chỗ. Thần khí (vũ khí) đã tách ra — xem mục ngay dưới.**
> Giữ nguyên câu cũ ở đây để thấy luật đã dời tới đâu, đừng đọc nó như trạng thái hiện tại.

### 🗡 LUẬT: **VŨ KHÍ LUÔN HIỆN LÚC RA ĐÒN** — nhân vật có thể không, vũ khí thì không bao giờ

Chủ dự án chốt (2026-09-17), nguyên văn: *"khi Axie ra chiêu thì sẽ hiện cây vũ khí… nhân vật có
thể không hiện nhưng **vũ khí sẽ LUÔN xuất hiện để đồng bộ được skill**"*.

**Vì sao nó là một LUẬT chứ không phải một tuỳ chọn.** Đo trên bản trước:

| | |
|---|---|
| Ngoài thành, cả **5/5 lớp** ra đòn | trên màn **không có một cây vũ khí nào** |
| Tổ hợp (dòng × giai) không có tranh trong `VK_ANH` | **48/98 — gần một nửa** |

Hai nguyên nhân chồng lên nhau, và mỗi cái tự nó đã đủ:
- `_tkHien` có `!_nhap` ⇒ ngoài thành thần khí tắt hẳn; mà ba lớp (DK · Spellblade · Sylvan
  Ranger) cầm vũ khí bằng **lớp nướng sẵn trong chính bộ khung người** — lớp ấy đã nhập vào Axie
  nên không vẽ, cây vũ khí biến mất theo. `!_coVkLop` lại tắt thần khí cho đúng ba lớp đó.
- `thanKhiNguon()` trả `null` khi dòng vũ khí chưa có tranh riêng ⇒ 48/98 tổ hợp không có gì bay.

Người chơi không đọc được chiêu, và mọi mốc rèn **+N** trên vũ khí cũng tàng hình theo.

| cửa | việc |
|---|---|
| **`_tkNhap` = `_nhap && _lopHien`** | đã nhập mà đang ra đòn ⇒ vũ khí HIỆN. **Cố ý bỏ qua `_coVkLop`**: lúc đã nhập thì không có cây nào "trong tay" để mà trùng, nên thần khí là cây DUY NHẤT trên màn, không phải cây thứ hai |
| `_tkDx` · `_tkDy` · `_tkCo` · `_tkChan` | hệ toạ độ RIÊNG của vũ khí khi đã nhập |
| **`TK_LOP`** | cây LÙI theo lớp cho dòng chưa có tranh: `kiem` · `no` · `makiem` · `gay` · `lenhtruong` — đúng cây cắt ra từ gói Spine của chính lớp đó |
| `window.__veVuKhi` | phơi QUYẾT ĐỊNH ra cho bài kiểm (chỉ khi `TEST_MODE`), khoá theo từng thân người |

**⚠ ĐÃ NHẬP THÌ VŨ KHÍ NEO VÀO **AXIE**, KHÔNG NEO VÀO CHỖ LỚP NHÂN VẬT LẼ RA ĐỨNG.** `_avaDx/_avaDy`
vẫn tính ra chỗ ấy dù ở đó không còn ai — dùng nó là cây vũ khí trôi lơ lửng cách con Axie gần một
thân người. Đúng cái lỗi mà `_nhap` sinh ra để chặn, chỉ đổi vai.

**⚠ NẤC LÙI ĐẶT TRONG `thanKhiNguon()`, KHÔNG ĐẶT TRONG `vkAnh()`.** Nới trong `vkAnh` thì ba chỗ
khác đang gọi nó cũng đổi theo — **ICON trong túi đồ**: cây rìu sẽ hiện ra hình thanh kiếm ngay
trong ô túi, tức đổi một lỗi lấy một lỗi nặng hơn. Ở cỡ vũ khí bay quanh thì thứ cần là một BÓNG
DÁNG; trong ô túi thì phải đúng món ấy. Cùng đánh đổi đã ghi cho `NV_VK_LOP_LOP`.

**⚠ VÀ NẤC LÙI CHỈ ÁP KHI THẬT SỰ CẦM MỘT CÂY.** `d` rỗng là TAY KHÔNG — lùi ở đó là người cởi
sạch đồ vẫn có vũ khí bay quanh. `test_vukhihien ④` gác.

**Cái giá, không giấu:** cầm rìu thì cây bay ra vẫn là hình **kiếm**. Sửa được bằng ART (thêm một
dòng vào `VK_ANH`), không sửa được bằng mã.

Gác: **`tests/test_vukhihien.js`** (4 mệnh đề, hai phép thử ngược đều đỏ) — ① ngoài thành cả 5 lớp
ra đòn phải có vũ khí · ② trong thành lúc đi theo thì vẫn phải TẮT (luật cũ, đừng phá) · ③ cả 98
tổ hợp dòng×giai đều dựng được nguồn · ④ tay không thì không. Kèm `test_hopve`: mọi lời gọi
`veThanKhi` phải neo `_avaDx` **hoặc** `_tkDx`, còn `veCanh` thì vẫn chỉ được neo `_avaDx`.
⚠ ① **tự kiểm cảnh dựng trước khi chấm** — đòi cả 5 lớp THẬT SỰ `nhap` ở map đo, nếu không nó
đang đo một cảnh khác hẳn cảnh nó định đo và xanh vô nghĩa.

#### ⚔ VÀ NỬA CÒN LẠI: **TRONG THÀNH VŨ KHÍ HIỆN LÚC ĐỨNG YÊN**

Chủ dự án chốt (nguyên văn): *"thôi dễ nhất là khi ở trong thành, cho vũ khí khoác lên vai (kiểu
khu an toàn). Sau đó khi nhân vật ra đòn ở bãi quái thì chỉ cần xuất hiện vũ khí thôi."* Nửa
**ngoài thành** là mục ngay trên. Nửa **trong thành** là tư thế mang của bộ nướng (`VK_XOAY` ·
`VK_MANG`) **cộng** một vế trong chính cửa `_tkHien`.

```js
const _tkNhap = _nhap && _lopHien;
const _tkHien = _tkNhap || (!_nhap && !_coVkLop);
```

**⚠ VẾ `(!_coAva || _lopHien)` ĐÃ GỠ, và nó là một LỖI CÓ SẴN chứ không phải một vế bị mất.**
Với vế ấy thì bật avatar lên là cây trượng bay **chỉ hiện lúc ra đòn**. Đo được: Dark Lord và
Dark Wizard — hai lớp **cố ý** không có vũ khí cầm tay — đứng trong thành **tay không**, tức
đúng hai trong năm lớp không khoe được thứ to nhất trên bóng dáng mình. Ba lớp kia có lớp `vk`
nướng sẵn nên không ai để ý. Khoác lên vai thì phải thấy lúc **ĐỨNG**, không phải lúc vung.

| ca | thần khí |
|---|---|
| đã nhập (ngoài thành), đang ra đòn | **HIỆN** — `_tkNhap`, cố ý bỏ qua `_coVkLop` |
| đã nhập, đứng yên | **TẮT** — bỏ vế này là một cây kiếm bay theo suốt ngày cạnh con Axie |
| trong thành · hoặc `/avatar off` | **HIỆN**, trừ khi cây đã nằm sẵn trong tay (`_coVkLop`) |

**⚠⚠ HAI NỬA NÀY SINH RA Ở HAI NHÁNH KHÁC NHAU VÀ `git merge` GHÉP ÊM RU CẢ HAI CHUỖI KHẲNG
ĐỊNH TRÁI NGƯỢC NHAU VÀO `test_hopve`.** Một bên đòi `_tkHien` phải chứa `_coAva`/`_lopHien`
(luật cũ), bên kia đòi nó phải chứa `atkK`/`castK` (luật của nhánh kia) — mã đã hoà thì **không
thoả cái nào**, mà `node --check` vẫn xanh. Chuỗi nay hỏi **cả hai biểu thức**: `_tkHien` phải
có `_nhap` · `_tkNhap` · `_coVkLop`, và **`_tkNhap` phải hỏi `_lopHien`** — vế cuối là thứ giữ
"ngoài thành đứng yên thì tắt", và **không chuỗi cũ nào bắt được nó**. *Cùng vết sẹo đã ghi ở
mục màn chờ: bản đã trộn là mã mà chưa bên nào từng kiểm.*

`get-buff` (khối GỒNG) **vẫn dùng**, hai chỗ: trong thành, và làm nấc lui khi bảng đòn chưa tải
xong — nhờ vậy cú đánh đầu phiên vẫn có cái để vẽ thay vì rơi thẳng về khối đứng yên.

Gác: `tests/test_axiedanh.js` (6 mục). Hai phép thử ngược đều đỏ: bỏ cửa `avaNhap()` ⇒ ② đỏ
(*"TRONG THÀNH Axie không được ra đòn"*); cho 5 lớp chung một bảng ⇒ ④ đỏ (lệch **0**).
⚠ Mục ④ **tự kiểm cảnh dựng trước khi chấm** — đòi cả năm lớp THẬT SỰ vào khối `'danh'`, nếu
không nó đang so năm khối thở với nhau và xanh vô nghĩa. Đã dẫm đúng thế một lần: bài chạy ở
`ardhaven` (thành) nên cả năm ra `gong` và mười cặp đều lệch **0**.

**⚠ KHỐI THỞ PHA HAI KHUNG — 9 FPS là thứ người chơi nhìn nhiều nhất.** Con Axie LÀ thân nhìn
thấy của người chơi và nó đứng trên màn 100% thời gian, mà `CHI_THO_FPS` = 9: mỗi khung bảng nằm
im gần **bảy lượt vẽ** trên màn 60 Hz. Đo trên 60 lượt vẽ liên tiếp:

| | trước | sau khi pha |
|---|---|---|
| lượt vẽ **ĐỨNG IM** | **51/59 (86%)** | 19/59 (32%) |
| lệch TB mỗi lượt | 81 px | 36 px |
| **lệch chuẩn** | **205** | **81** |
| đỉnh | 634 | 288 |

86% số khung đứng im rồi một khung nhảy 634 điểm ảnh — đó chính là "cứng nhắc", viết thành số.

⚠ **Nâng `CHI_THO_FPS` KHÔNG chữa được**: bảng chỉ có 12 khung, chạy nhanh hơn thì thành thở gấp.

⚠ **CHỈ pha khối THỞ, đừng pha khối CHẠY.** Đo lệch giữa hai khung liền nhau trên thân 4.290
điểm ảnh đặc: thở **407 px (9,5%)** · chạy **1.507 px (35%)**. 9,5% pha ra hơi thở liền mạch;
35% pha ra **bóng đôi**. Khối chạy vốn đã ~35 khung/giây trên màn (12 khung × ~2,9 bước/giây)
nên không có khe nào để lấp.

⚠ **Và nó làm đỏ một bài kiểm CŨ — đúng cái bài đang đo nhầm.** `test_xoayvfx` đặt ô đo 140×140
quanh chân nhân vật, tức **ôm trọn con Axie**, rồi lấy một cặp ảnh làm đối chứng "nền trôi". Ở
9 FPS thì 2/3 số lượt con Axie không nhích ⇒ nền trôi = 0 ⇒ xanh; 1/3 số lượt nó nhích ⇒ 2.167 ⇒
đỏ. Pha khung xong thì nó nhích ở MỌI lượt ⇒ đỏ 3/3. Sửa ở BÀI KIỂM, không ở cơ chế: tắt avatar
trong lúc đo (con Axie không phải thứ bài ấy gác) + lấy **trung vị 9 mẫu**. Sau đó nền trôi về
**0** ở cả ba lượt, tín hiệu vẫn 480. Thử ngược (ép `goc: 0`) vẫn đỏ 5 mệnh đề.

**⚠ THỨ TỰ ƯU TIÊN: giật > gồng > chạy > thở** — cùng thứ tự với `_kind` của khối thân người
(chết > trúng đòn > niệm chú > đánh), TRỪ khối chết: luật *"trúng đòn và chết vẫn giữ Axie"*
nghĩa là nằm xuống là việc của lớp nhân vật, không phải của cái thân nhìn thấy.

**⚠ BA ĐỒNG HỒ ẤY ĐẾM NGƯỢC.** `hurtT` · `atkAnim` · `castT` đặt bằng ĐỘ DÀI rồi trừ dần về 0, nên
tiến độ là `1 − t/dài`. Dùng thẳng là con vật gồng NGƯỢC — buông ra trước rồi mới lấy đà. Cùng cái
bẫy đã ghi cho `atkK`; thử ngược ra khung đầu = 12 thay vì 0.

**⚠ NẠP TRƯỚC, ĐỪNG NẠP LƯỜI — và đây là lỗi CÓ SẴN mà bài kiểm mới mới lôi ra.** Bảng CHẠY cũng
nạp lười từ trước, nên **bước đi đầu tiên của mỗi phiên rơi vào nhánh lui-về-thở**. Nó chỉ xảy ra
một lần rồi tự hết nên cực dễ nghiệm thu nhầm là đã xong. Nay `veAvatar` xin cả ba bảng ngay lúc
con Axie hiện ra lần đầu.

**⚠ Ô CẮT PHẢI TRÙNG KHÍT bảng nhỏ** (đo được: cả 16 con, ba bảng, cùng một ô). Lệch một pixel là
con vật NHẢY một cái mỗi lần đổi khối. Công cụ dựng lại đúng phép tính hộp của `nuong_chi.py`
(bb trên appear+idle) rồi mới đem đi cắt — cùng cách `nuong_chi_chay.py` làm.

**⚠ ĐO CHỈ SỐ KHUNG, ĐỪNG ĐO ĐIỂM ẢNH cho phần lôgic.** `veAvatar` phơi khối đang vẽ ra
`window.__avaKhoi` (chỉ khi `TEST_MODE`), khoá theo từng thân người — cùng lối `__veChet`/`__neoVe`.
Lý do đã trả giá ở `test_dongbodo`: con Axie thở ~8 FPS nên hai lượt vẽ liên tiếp cùng điều kiện
lệch tới 5.200/16.500 điểm ảnh.

⚠ **Kit không còn trên đĩa sau mỗi phiên mới** (2,2 GB). Lấy lại:
`GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 https://github.com/axieinfinity/axie-origins-asset-kit /home/user/axieinfinity/axie-origins-asset-kit`
và `pip install pillow numpy` — cả hai đều mất theo container.

**Nợ còn lại:** thân người từ xa chưa đồng bộ `hurtT`, nên Axie của NGƯỜI KHÁC gồng được (đã đồng
bộ cú ra đòn) nhưng chưa giật được khi họ ăn đòn.

### 🔑 KIT AXIE CÓ 41 HOẠT CẢNH, GAME MỚI DÙNG 2

Khảo sát `axieinfinity/axie-origins-asset-kit` (clone về `/home/user/axieinfinity/...`, 2,2 GB).
Đây là thứ đáng nhớ nhất của đợt này:

| Nhóm | Có sẵn trong rig |
|---|---|
| Di chuyển | `action/run` · `move-forward` · `move-back` · 5 idle ngẫu nhiên |
| Đánh gần | **8 đòn** — `horn-gore` `mouth-bite` `tail-smash` `tail-roll` `tail-thrash` `multi-attack` `normal-attack` `shrimp` |
| Đánh xa | **5 đòn** — `cast-fly` `cast-high` `cast-low` `cast-multi` `cast-tail` |
| Phòng thủ | `evade` · `hit-by-normal`(+`crit`/`dramatic`) · `hit-by-ranged` · `hit-with-shield` |
| Khác | `get-buff` · `get-debuff` · `evolve` · `victory-pose-back-flip` · `sleep` · `eat` · `bath` |

- Bộ 41 này **giống hệt nhau ở cả 12 rig `.json`**; 26 rig `.skel` mượn được, y như
  `nuong_chi.py` đã mượn cho idle+appear.
- **Kit tự có rig `.json`** ⇒ `nuong_chi_chay.py` không cần repo `cc-axie-gtk2d` nữa.
- Kit còn **108 clip VFX** xếp theo **9 lớp Axie × 7 kiểu đòn** (`bite`/`cast`/`gore`/
  `projectile`/`slash`/`smash`/`throw`) — tức VFX và hoạt cảnh là MỘT BỘ KHỚP SẴN. Kèm
  `shield` · `shield_boost` · `shield_break` · `taunt` · `reflect_damage` · `heal` · `cleanse`.
- Và **8 rig Summoner** chính chủ (`clover` `mavis` `sparrow` `trunk` `mushroom` `littlerobin`
  `fruitsloth` `truefanhermitcrab`).

⚠ Nướng cần `pillow` + `numpy` (`pip install pillow numpy`) — máy sạch không có sẵn.

⚠ **Hộp cắt của bảng chạy phải GIỐNG HỆT bảng nhỏ**, nếu không con vật nhảy một cái mỗi lần
đứng ↔ chạy. `nuong_chi_chay.py` dựng lại đúng phép tính hộp của `nuong_chi.py` (bb trên
appear+idle) rồi mới đem đi cắt khung chạy — tốn 28 khung nướng thừa mỗi con, đổi lại không
phải tin vào một con số chép tay nào.

### ⚠ RAGOON ĐÃ GỠ — gacha thì KHÔNG, nó chỉ đổi thứ nó trao

Chủ dự án chốt: *"Bỏ luôn phần Ragoon. Nếu gacha là sẽ gacha nhân vật."* Cái chết là **CON THÚ**,
không phải cái máy. Đường cắt hoá ra **ba tầng** (đặc tả: `docs/DOI_VAI_AXIE.md §11b`):

| Tầng | Quyết định |
|---|---|
| Tầng vẽ — `CHIMERA` `CHI_ANH` `CHI_MAP` `_chiVe` `chiVeNho` `chiChayImg` `chiSan` `CHI_THO_FPS` | **GIỮ.** Avatar đọc đúng bộ này. Gỡ là gỡ luôn avatar. |
| Máy gacha — `chiState` `chiNhan` `gachaMotLuot` `gachaQuay` pity banner `player.chimera.co` | **GIỮ, đổi thứ nó TRAO** → thân Axie. 16 con đã có sẵn 16 bảng khung avatar; gỡ máy rồi dựng bộ chọn avatar mới là nhân bản đúng cái vừa xoá. |
| Con thú + hai vòng nuôi nó | **GỠ HẾT** (danh sách đầy đủ trong chú thích tại chỗ cũ trong `game.js`) |

**Ba nguồn chỉ số từ con Axie đã gỡ khỏi `calcDerived`**: bị động `thu` (× `chiThuMul`), bốn kỹ
năng đồng hành, buff tạm `chiTam`. ⚠ **Đừng nối lại.** `CHIMERA[].thu` / `.chieu` trong
`canbang.js` vẫn còn nhưng **không được đọc ở đâu nữa** — một cái thân thì không cộng chỉ số, và
cho quay gacha ra +25% sát thương là dựng lại đúng trục sức mạnh mua được mà đợt này đang tháo.

**`chiCoTrongMan` / `CHI_THAN` 0,45 / `CHI_TRAN` 0,55 đã gỡ** — luật *"Chimera đi theo không bao
giờ được lấn át nhân vật"* cần HAI cái thân đứng cạnh nhau mới có nghĩa. Nay chỉ còn một. ⚠ Cỡ
avatar do `AVA_TY` 0,72 / `AVA_TRAN` 0,95 quản, và hai số đó khớp theo luật **ngược lại**: avatar
và lớp nhân vật THAY CHỖ NHAU lúc ra đòn nên khối nhìn thấy phải **bằng nhau**, không nhỏ hơn.
Chép `CHI_THAN`/`CHI_TRAN` sang đấy là mỗi cú đánh một cú giật cỡ. `tests/test_cothu.js` gác.

### ◆ ~~BỐN Ô CỐT~~ — ĐÃ GỠ HẲN CHỈ SỐ, đừng dựng lại

> ⚠ Giữ đúng cái tiêu đề này để cảnh báo, thay vì xoá trắng rồi để người sau đọc `COT_O` trong
> lịch sử git mà tưởng nó còn. Cùng kiểu bẫy đã ghi ở mục "~~Khắc Ấn~~" và "~~Chimera đi theo~~".

Chủ dự án chốt: **gỡ hẳn chỉ số.** Cốt là trục sức mạnh CUỐI CÙNG còn sót lại từ nhánh Ragoon —
bốn ô mang đúng tên bộ phận Axie (Sừng · Vuốt · Vảy · Đuôi), 4 dòng chính + 8 dòng phụ + 11 hiệu
ứng đủ bộ. Dời nó sang người chơi đã KHÔNG cứu được vấn đề gốc: nó vẫn là **sức mạnh đến từ phía
Axie**, mà luật Đổi Vai nói thẳng — *Axie 0 chỉ số, 0 kỹ năng, 0 trang bị; toàn bộ chỉ số nằm ở
5 lớp*.

**Đây là lần thứ BA cùng một trục bị tháo ra**, và lần nào nó cũng quay lại dưới dạng "chỉ vài
dòng chỉ số nhỏ thôi":

| đời | trục | gỡ ở đâu |
|---|---|---|
| 1 | bị động `thu` × `chiThuMul` (Huyết Thống) | đợt gỡ Ragoon |
| 2 | cấp Chimera × `chiLvThuMul` + kỹ năng đồng hành `chiTam` | đợt gộp `main` |
| 3 | **bốn ô Cốt** | đợt này |

⇒ Đã gỡ: `COT_O` · `COT_PHU` · `COT_PHAM` · `COT_KHO_MAX` · `COT_BO_R` · `cotGom` · `cotO` ·
`cotKho` · `cotMoi` · `cotDeo`/`cotThao`/`cotNang`/`cotBo` · `cotBoCast`/`cotBoTick`/`cotDmgMul`/
`cotCdMul` · `cotRoi` · `cotBossVung` · bảng Kho Cốt · lệnh `/cot`. **`tests/test_cotgobo.js` gác
chiều NGƯỢC LẠI**: chúng phải không còn, và cắm dữ liệu Cốt giả vào `player` phải đổi **0 điểm**
chỉ số (đo chỉ số THẬT trước/sau — `applyLine()` lặng lẽ bỏ khoá lạ nên đọc bảng thì không thấy).

**`COT_DONG` GIỮ LẠI** nhưng chỉ còn là **bản sắc của VỈA** ở từng vùng: một cái tên và một màu
cho chấm kim cương trên bản đồ nhỏ. Phần chỉ số (`hai`/`haiTxt`/`bonTxt`) hết tác dụng.

#### Thứ thay chỗ nó: VỈA TRẢ **BẢN NĂNG**

Vỉa là vòng chơi mỗi ngày DUY NHẤT buộc người chơi đi tới một toạ độ — không thể để nó trả ra thứ
vô dụng. Nay nó trả **600 Bản Năng**, và con số neo vào thứ đã có chứ không bịa: một Trùm Vùng
cho 200, còn chú thích của chính hàm ấy nói Vỉa "hào phóng hơn Trùm Vùng một bậc" với ba mảnh
⇒ 3 × 200. Chỗ tiêu là **nâng cấp kỹ năng** (`30 × cấp^1,1` mỗi bậc) — tức sức mạnh của chính
5 lớp, đúng nơi luật Đổi Vai nói nó phải nằm.

Và nó hợp canon hơn thứ nó thay: qua Nhát Gọi thì **mất ký ức chứ không mất NGHỀ**. Đào lên tàn
tích của những kẻ đi trước mà lấy lại được bản năng là đúng câu chuyện đang kể.

#### Di trú: hoàn lại, đừng xoá trắng

`cotDiTru()` chạy một lần trong `loadGame`. Mọi thứ quy về đơn vị CÒN CHỖ TIÊU, tỉ giá neo vào
nguồn rơi:

| đã đổ vào | hoàn bằng | tỉ giá, và nó từ đâu ra |
|---|---|---|
| mảnh Cốt | Bản Năng | 1 mảnh = **200** (một lượt vỉa rơi 3 mảnh, nay trả 600) |
| Đất Hồn (+ cấp/Hoá quy ra) | Ấn Giao Kết | **5 : 1** (trùm vùng rơi 4-6 Đất Hồn *và* 1 Ấn) |
| Lumen đổ vào Hoá | Lumen | đúng số — Lumen chưa bao giờ đổi đơn vị |

- ⚠ **Quét MỌI chỗ từng cất mảnh**: kho người chơi · bốn ô người chơi · kho và bốn ô của TỪNG
  con Chimera đời cũ. Sót một chỗ là một khoản mất trắng không ai thấy.
- ⚠ **Ghi nhận `lv`/`hoa` TRƯỚC khi xoá.** Bản đầu xoá thẳng rồi mới tính hoàn ⇒ mọi người chơi
  được hoàn đúng 0, không một lỗi nào báo.
- ⚠ **Cờ `player._diTruCot` chặn hoàn hai lần** — nạp save nhiều lần mà thiếu cờ là in tiền.
- ⚠ **Phải BÁO ra một dòng đọc được.** Một khoản hoàn không ai thấy thì với người chơi không
  khác gì mất trắng.

#### Nhiệm vụ phải trỏ lại

`c3q3` từng gate bốn ô Cốt ⇒ nay gate **Vỉa** (`need:2`, nằm đúng giữa c2q2 cấp 26 = 1 và sd_tt2
cấp 68 = 3). 11 nhiệm vụ thưởng mảnh Cốt ⇒ thưởng **Bản Năng**, quy theo `số mảnh × phẩm × 200 ×
max(1, cấp/20)` để theo kịp giá nâng chiêu.

### Còn treo

| | |
|---|---|
| Hai kiểu hiện | **"hiện khi đánh"** đã chốt và đã thi công. Kiểu "thường trực" (xác đứng chắn) còn trong proto để so. |
| Lớp gacha Cổ Vật | `docs/CO_VAT_15.md` mới là ĐỀ XUẤT, chưa chốt. Trần 16% chỉ quản lớp đó — **chỉ số từ 5 lớp KHÔNG có trần**. |
| Chibi 5 class Axie ở màn tạo nhân vật | chưa thiết kế. `CHIBI_CFG` hiện phân biệt bằng bóng dáng NGƯỜI. |
| Mốc thay "Giày +6 mở dáng chạy" | avatar bay/chạy thì mốc cũ mất ý nghĩa |
| ~~Axie chỉ có MỘT trục~~ | **XONG.** Trục hai là **sáu bộ phận** — xem mục ▲▲ ở trên. 96 ô dữ liệu, `calcDerived` không đụng một dòng. |
| ~~Ngũ Hành → tam giác Axie~~ | **XONG.** 94 nhãn `el:` (54 trong `game.js` · 40 trong `data/canbang.js`) nay là chín lớp Axie; `hurtMob` không đổi một hệ số nào. Xem mục **▲ TAM GIÁC CHÍN LỚP AXIE** ở trên. |

---

## 📌 CHẨN ĐOÁN GỐC: NỘI DUNG ĐANG ĐƯỢC LÀM BẰNG CÁCH NHÂN BẢN

Đọc mục này TRƯỚC khi nhận bất kỳ việc nào có chữ "thêm map", "thêm phó bản",
"thêm quái", "thêm cấp". Đây là kết luận chốt của phiên thiết kế, không phải ghi chú tuỳ hứng.

**Bệnh:** game không thiếu nội dung — game có một lượng nội dung nhỏ được chép ra nhiều lần.
Đo được từ ba phía độc lập, cả ba ra cùng một chỗ:

| Đo cái gì | Con số | Nghĩa là |
|---|---|---|
| Số loài quái mỗi map | 7 → 3 khi lên cấp | càng chơi lâu, thế giới càng nghèo đi |
| Cấp có hệ thống MỚI mở ra | 20 đầu có, 99 cấp sau **không có cấp nào** | mọi thứ dồn hết vào đoạn mở đầu |
| Địa hình 7 phó bản | **1 địa hình** dùng 7 lần | bảy cửa, một căn phòng |

Bằng chứng của dòng thứ ba nằm ngay trong `data/canbang.js`: cả bảy `pb_*` đều
`spawn:{x:1300,y:1560}`, cửa ra đều `x:1300,y:1660`, đều `packs:[]`, đều `duhiep:null`.
Chỉ khác `ground`/`patch` và số `trees`/`rocks`.

**Chữa bằng cách thêm map thứ 8 là làm bệnh nặng thêm.** Chữa bằng máy sinh địa hình
+ từ khoá biến đổi phòng (đã đặc tả sẵn ở `docs/DE_XUAT_MAP.md`, mục C1/C2 và issue #90).

Trạng thái hiện tại: **bảy phòng đã gỡ hẳn** (mục kế tiếp), tầng map đang chờ dựng lại.

### 🗑 BẢY PHÓ BẢN ĐÃ GỠ — và những gì đã phải gỡ theo

Chủ dự án quyết xoá hẳn bảy map `pb_*` để dựng lại tầng map từ đầu. Đã gỡ:
`window.DUNGEONS` (còn `{}`) · 7 mục `pb_*` trong `MAPS` · 14 cổng trong `GATES` ·
7 nền · 7 mục nhạc · 7 `spawnFrom`.

**MÁY chạy phó bản thì GIỮ NGUYÊN** — `DGN` · `startDungeonRun` · `updateDungeon` ·
`DGN_ROOMS` · `drawDgnWalls` · `drawDungeonHUD` · `spawnHuntBoss` · thưởng · `boxTier`.
Nó chạy hoàn toàn theo dữ liệu: thêm một khoá vào `MAPS` (có `type:'dungeon'`,
`dungeon:true`) và một khoá cùng tên vào `window.DUNGEONS` là phòng chạy lại ngay,
không phải sửa một dòng máy nào. Khuôn một mục nằm trong chú thích ở `data/canbang.js`.

Quy ước khoá vẫn còn hiệu lực: **phó bản của map X là `pb_X`**. Nút "Vào Phó Bản" trong
bảng Chọn Trận đọc đúng quy ước đó, nên đặt tên mới theo nó là nút tự hiện lại.

Ba thứ từng treo trên phó bản, đã phải rời chỗ khi gỡ — **nhớ trả về khi dựng lại**:

| Thứ | Trước | Nay |
|---|---|---|
| Địa hình Tầng Sâu | `DEEP_MAP = 'pb_daohoa'` | map riêng `deep` trong `MAPS` |
| Nguồn Cốt (nay của NGƯỜI CHƠI) | thông quan phòng | **cầu tạm**: boss vùng của 7 map cha (`cotBossVung`) |
| `COT_DONG[*].map` | `pb_*` | map cha ngoài trời |

`cotBossVung` là **cầu tạm, không phải thiết kế**. Nó tồn tại vì một hệ không còn cửa
nào là một hệ chết. Dựng lại tầng phó bản xong thì trả cửa về chỗ cũ và gỡ nó đi.

Bảy Dòng Cốt vẫn giữ nguyên quan hệ một-đổi-một với bảy vùng — đây là **cơ chế chọn
build**, không phải trang trí: người chơi chọn Dòng để nuôi bằng cách chọn nơi để cày.

| Vùng | Dòng Cốt độc quyền |
|---|---|
| `daohoa` | Cánh Hoa |
| `ngoai` | Đồng Cỏ |
| `chungnam` | Rễ Gai |
| `comoc` | Vỏ Trứng |
| `tuyettinh` | Băng Vụn |
| `mongco` | Tro Tàn |
| `nhanmon` | Sấm Vụn |

Sách Kỹ Năng · Tinh Luyện · Bản Năng · Box Kundun **không chết theo** vì còn nguồn khác
(Tầng Sâu, cửa hàng, quái, nhiệm vụ). Chỉ Cốt là độc quyền, nên chỉ Cốt cần cầu tạm.

**Bài kiểm:** 14 bài từng vào `pb_daohoa`/`pb_nhanmon` nay tự cắm phòng của mình bằng
`tests/pbthu.js` (`dungPbThu`). Việc đó vừa giữ máy phó bản có người gác, vừa **kiểm
luôn lời hứa "máy chạy theo dữ liệu"** — nếu một khoá là đủ để phòng chạy từ đầu tới
cuối thì cắm lại bảy phòng thật cũng chỉ là điền dữ liệu. `tools/reg.sh` đã sửa để chép
cả tệp phụ trợ trong `tests/`, không chỉ `test_*.js`.

### 📏 LUẬT MAP — rút từ số đo, không từ cảm giác

Số đo hiện trạng: `docs/DO_MAP_HIEN_TRANG.md` (sinh bằng `tools/do_map.js`, **đừng sửa tay**).
Bánh cóc: `tests/test_domap.js` — map chỉ được tốt lên, không được tệ đi.

**Ba cỡ, ba công cụ. Đừng lẫn.**

| Cỡ | Đơn vị | Công cụ | Chỉ số chấm |
|---|---|---|---|
| **Chiến đấu** | 40-120px | trụ đá (`raiTruDa`) | **vật che %** |
| **Một màn hình** | ~1400px | ngã rẽ có giá, khe 60-140px | (chưa có chỉ số) |
| **Bản đồ** | 2600×1900 | **zoom camera** hoặc phóng to map | số màn hình/map |

**Camera có ZOOM** (`ZOOM_MUC`: GẦN 1,75× · VỪA 1,45× · XA 1,0×; mặc định VỪA).

Trước đó không có: 1px thế giới = 1px màn hình, và trên màn 1920×1080 người chơi thấy **42%
diện tích map** trong một khung hình — cả map chỉ bằng **2,4 màn hình**. Đặt ngã rẽ ở đâu thì
cả hai nhánh cũng nằm gọn trong tầm mắt, nên nó không phải lựa chọn, chỉ là một cái hình. Ở mức
VỪA, map thành **~5 màn hình** mà không tốn một file art nào.

**Đã thử và BỎ: phủ lớp tối ngoài tầm nhìn.** Nó đạt cùng mục đích trên giấy, nhưng mảng tối
đánh nhau với art sáng của Axie — nhìn ra là một cái mặt nạ chứ không ra một thế giới. Bài học
chung: đừng chữa vấn đề *bố cục* bằng cách đè lên *màu*.

**⚠ `W`/`H` là cỡ MÀN HÌNH · `VW`/`VH` là cỡ THẾ GIỚI lọt trong khung.** Mọi phép cắt bỏ ngoài
màn, kẹp camera và đổi toạ độ chuột phải dùng `VW`/`VH` (= `W`/zoom). Dùng nhầm `W` thì quái
biến mất ở mép màn hình, hoặc chuột trỏ lệch — hai lỗi này nhìn không ra là cùng một nguyên nhân.

**⚠ `ZOOM_CHON` là `let` riêng, KHÔNG đọc thẳng `SETTINGS`.** `resize()` chạy lúc nạp tệp
(dòng ~60) còn `SETTINGS` là `const` ở dòng ~7600 — chạm vào là rơi vùng chết của const, và
`typeof` **không** cứu được (typeof trên const chưa khởi tạo vẫn ném). Đã dính đúng bẫy này, lỗi
báo ra lại là tên một hằng khác hẳn ở tận dưới.

**Vật cản phải đúng cỡ.** Trước đợt trụ đá: 84% khối trong `MAP_OBSTACLES` có cạnh ngắn >120px
(tường phải đi vòng), còn cây/đá thì 30-44px (sỏi). Ở giữa — cỡ trận đánh — trống trơn. Tệ hơn:
bộ lọc "chừa trống" ở `buildWorld()` quét sạch decor trong bán kính ≈160px quanh **mọi bãi quái**,
tức đúng chỗ đánh nhau thì đúng chỗ không có gì. Địa hình không thiếu, nó **bị dọn đi**.

**Luật đang có hiệu lực:**
1. Trụ đá đặt theo **HẠT cố định** từ tên map, không phải `Math.random` — bố cục một bãi phải
   giống nhau mọi lần vào, nếu không thì không ai học được địa hình, mà học được mới là chỗ địa
   hình có nghĩa. (Cây/đá vẫn ngẫu nhiên: chúng là trang trí, không phải bố cục.)
2. Khe giữa hai trụ ≥ `TRU_HO*0.8` ≈ 90px — lọt người, phải lách.
3. Vành ngoài quanh bãi là **CUNG ~200°**, không phải vòng tròn: bọc kín thì thành cái chuồng.
4. Lòng bãi quái phải trống (`bk*1.05`) — quái còn chỗ đứng, AUTO còn chỗ đánh.
5. Zoom nhân vào phép biến hình **ngay trước khi dời camera** (`ctx.scale` rồi `ctx.translate`)
   — mọi phép vẽ bên dưới giữ nguyên toạ độ thế giới, HUD nằm sau `ctx.restore()` nên không bị
   phóng theo. Đừng phóng bằng cách sửa `W`/`H`: HUD sẽ to theo.
6. Đổi zoom phải gọi `capNhatTamNhin()` **ngay**, không đợi khung sau — camera kẹp theo `VW/VH`,
   lệch một khung là giật một cái.
7. **Bài kiểm nào đổi toạ độ MÀN HÌNH ↔ THẾ GIỚI đều phải nhân zoom.** Đợt thêm zoom làm đỏ 4
   bài cùng một nguyên nhân, mà triệu chứng thì trông khác hẳn nhau: chuột phải lệch đích ·
   chiêu không rơi chỗ con trỏ · bấm minimap "chỉ đi được 30px" · ô đếm điểm ảnh trả về 0. Công
   thức đúng: `screen = (world − camera) × zoom`, rồi mới tới tỉ lệ bộ đệm/CSS nếu đọc pixel.
8. **Đừng chép cứng số đã có hàm.** `test_ngamchuot` chép `chanDy` = 13 (đúng hồi `NV_CAO` = 118);
   nay là 19 và bài trượt ngưỡng đúng 0,06px. Đọc thẳng từ game.
9. **Phản đòn ghi thẳng `m.hp`, KHÔNG qua `hurtMob`** (`player.reflect`, `Math.max(1, …)`).
   Bài kiểm nào đo "con này phải mất ĐÚNG 0 máu" mà để quái đứng trong tầm đánh của nó thì sẽ
   đỏ 1/3 lượt vì đúng một điểm máu của cơ chế khác. Tắt `player.reflect` trong phần dựng cảnh.
10. Ngưỡng trong `test_domap.js` phải **đo được**, không được đoán. (Bản đầu tôi đặt sàn "80% map
   đi được" theo cảm tính; số thật là 60,7% và nó bắt vạ 5/8 map.)

**Chưa làm, cố ý:** phóng to map (C2) và nối nhiều map nhỏ (C3) — xem `docs/KE_HOACH_DO_MAP.md`.
Phóng to cả 8 map là nhân bản lần nữa, chỉ khác là nhân bản chỗ trống.

### 🎭 VAI TRÒ QUÁI GÁN THEO **BÃI**, KHÔNG PHẢI THEO LOÀI

`MOB_ROLE` (loài → vai) là **lớp nền**, chỉ dùng cho quái không thuộc bãi nào. Bãi nào khai
`vai:'phap'` thì bãi đó thắng — xem `buildWorld` chỗ `pk.vai`.

Vì sao: vai theo loài là ngõ cụt. Ba map cuối chỉ có 3 loài, nên đo ra Bird Tribe Heights và
Dusk Marsh mỗi map đúng **2 vai** — `can` cộng Kẻ Tiếp Sức. Cả đoạn cấp 62-120 đánh y hệt
nhau. Vai theo bãi cho **3 loài × 6 vai = 18 hồ sơ** mà không tốn một tệp art nào.

Sau đợt gán: vai/map từ `3,3,3,4,2,4,2` lên `4,4,6,6,6,6,6` — **tăng dần**, không tụt.

- Vai đánh xa (`phap` 320 · `xa` 300) phải **đánh xa thật**: `spawnMob` bật `range`+`ranged`.
  Đổi con số mà không đổi cách đánh thì không sinh ra hồ sơ nào mới. Loài **vốn đã** đánh xa
  (Cung Thủ Tro Tàn) giữ nguyên tầm — nâng lên là âm thầm buff một con đã cân xong.
- Map cấp 1-24 **cố ý không có Pháp Sư**: đó là chỗ học cách chơi.
- Từ cấp 24 trở đi mỗi map phải có **≥1 bãi Pháp Sư và ≥1 Kẻ Tiếp Sức** — hai thứ AUTO xử lý
  dở nhất, cũng là lý do người chơi phải tự cầm chuột. `tests/test_bansac.js` gác.

### 🎞 BẢNG KHUNG QUÁI (`MOB_KHUNG`) + TRANH RIÊNG CHO TRÙM (`anh:`)

Quái và trùm mặc định là MỘT tấm tĩnh. Khai một khoá là loài/con đó có hoạt ảnh; không khai thì
vẽ y như trước, không lệch một pixel. Máy chạy theo dữ liệu — art về chỉ thêm một dòng.

| Muốn gì | Khai ở đâu |
|---|---|
| quái/trùm có hoạt ảnh | `MOB_KHUNG` trong `game.js` |
| trùm có tranh riêng (thắng cả sprite mượn lẫn khung xương) | `anh:'<tên tệp>'` trong `BOSS_DEFS` |

- **Khoá `MOB_KHUNG` là TÊN TỆP, không phải khoá mob** — `assassin.png` phục vụ 3 loài,
  `duhiep.png` 3 loài nữa, nên một bảng khung là cả ba cùng có hoạt ảnh.
- Tấm khung ở `assets/mobs/kh/<tên>.png`, tấm tĩnh lùi ở `assets/mobs/<tên>.png`. **Cả hai đều
  bắt buộc**: bảng khung nạp lười, thiếu tấm lùi là mấy trăm mili giây đầu xin một tệp không tồn
  tại (404) rồi con trùm chớp thành đốm mực. `nuong_khungquai.py` xuất cả hai.
- ⚠ **Nhịp `di` chạy theo QUÃNG ĐƯỜNG ĐÃ ĐI**, `danh` theo `lungeT`, `chet` theo `deadT` rồi
  **dừng** ở khung cuối. Chỉ `dung` chạy theo đồng hồ. Chia nhịp đi theo thời gian là bàn chân
  trượt đất — bài học đã trả giá ở `SAI_CHAN`.
- ⚠ **`mobDoBuoc()` ĐO chuyển động thật, không đọc cờ do AI đặt** — quái dời chỗ ở NĂM nhánh
  trong `update()`; đặt cờ từng chỗ thì chỗ thứ sáu thêm sau sẽ lặng lẽ không có hoạt ảnh.
- ⚠ **Nhịp `chet` cắm ở nhánh `'deadmob'`, KHÔNG ở `drawMob`** — xác quái có đường vẽ riêng.
- ⚠ **Năm loài khai CẢ `skel` LẪN `img`** (`trannhan · chimera_bo · kybinh · kylan ·
  boss_sontac`) và đang hiện bằng khung xương. **Đừng đảo thứ tự skel/img để "dọn"** — làm thế
  là âm thầm đổi tạo hình năm loài mà không ai yêu cầu. Muốn con nào dùng tranh thì khai `anh`.

#### ⚠ `neoY` LÀ BÀN CHÂN, KHÔNG PHẢI ĐÁY ẢNH

Công cụ mặc định đo đáy nhịp `dung` rồi coi đó là bàn chân. **Sai ngay khi art có khói, hào
quang, vũng nước hay bóng vẽ sẵn dưới đế.** Đo trên gói trùm bóng ma đầu tiên: đế giày ở hàng
549, đáy khói ở 640 — lệch **91px trên ô 640 (14%)**, tức con trùm treo lơ lửng đúng ngần ấy.
Khai `--chan <hàng>` để đè. Và khi cả bộ chỉ có MỘT nhịp thì phép đo suy biến: đáy `dung` ==
đáy chung ⇒ `neoY` luôn ra đúng 1.0, một con số vô nghĩa mà công cụ trả về trong im lặng.

#### ⚠ ART TỐI: ĐỘ SÁNG TRUNG BÌNH KHÔNG DỰ ĐOÁN ĐƯỢC "đọc ra hay không"

Ngưỡng đầu tiên tôi đặt — *"chênh độ sáng với nền phải > 0,28"* — **sai, và con trùm thứ hai
chứng minh ngay**. Kỵ sĩ bóng đêm (`tq_daohoa`) chênh **0,273**, tức TRƯỢT ngưỡng, nhưng chụp ra
thì đọc rõ từng chi tiết và không cần xử lý một bước nào.

| | sáng | **lệch chuẩn** | bão hoà |
|---|---|---|---|
| bóng ma (`tq_corran`) gốc | 0,128 | **0,092** | 0,320 |
| kỵ sĩ (`tq_daohoa`) | 0,237 | **0,209** | 0,498 |

Thứ quyết định là **LỆCH CHUẨN — độ tách giữa các mảng sáng tối BÊN TRONG con vật**, không phải
độ sáng trung bình. Con bóng ma là một khối gần như một sắc nên ở 113px nó thành cái bóng đen;
con kỵ sĩ có xương trắng ngà, lửa xanh và áo choàng đỏ nằm cạnh nhau nên mắt bám được ngay, dù
trung bình còn tối hơn cả nền.

⇒ **Đo lệch chuẩn trước khi quyết xử lý.** Dưới ~0,12 thì mới cần nâng sáng + viền rìa; trên đó
thì để nguyên. Áp cùng một liều cho mọi gói là chữa bệnh không có bệnh, và nó làm mất chính cái
tương phản gốc mà art đã có.

#### ⚠ VÀ độ sáng NỀN vẫn phải đo — nhưng để chọn MAP, không để chọn liều

Gói bóng ma (Tướng Quân `corran`) đo ra **sáng 0,129 · bão hoà 0,308**, trong khi 24 tấm quái
hiện có trung bình **0,658 / 0,591** và viên cỏ Corran là **0,722**. Tức nó **tối hơn 80%** mọi
thứ quanh nó. Trên nền sáng thì đó là bóng dáng đọc được ngay; trên nền tối thì nó biến mất.
Quét cả tám map: chỉ **Werebear Woods (nền 0,363) là CHÌM**, Dusk Marsh (0,412) sát ngưỡng.
⇒ Art tối dùng được, nhưng **không phải khuôn chung cho cả 11 Tướng Quân** — và phải đo nền map
đích trước khi cắm, đừng suy từ map khác.

Cỡ đo được để khỏi đoán: trùm vẽ ra **113px thân** (hộp 132px) · avatar người chơi **74px** ·
quái thường **53px** · lớp nhân vật `NV_THAN_PX` **95px**.

Công cụ: `tools/nuong_khungquai.py` (nhận khung đã render — dải, thư mục, hay xuất từ Godot/Spine
— rồi **đo** hộp ô và `neoY`, in ra mục dán thẳng). Bài kiểm: `tests/test_khungquai.js` (28 mục).
Đặc tả đặt hàng: `docs/DAT_HANG_ART_3_4_5.md` · prompt: `docs/PROMPT_QUAI_VA_TUONGQUAN.md`.

### ⛲ ~~LỚP "VẬT SÀN" RIÊNG CHO NƯỚC~~ — ĐÃ DỰNG RỒI GỠ TRONG CÙNG MỘT ĐỢT

> ⚠ Giữ đúng cái tiêu đề gạch ngang này để cảnh báo, thay vì xoá trắng rồi để người sau đọc
> `veVatSan` trong lịch sử git mà tưởng nó còn. Cùng kiểu bẫy đã ghi ở mục "~~Khắc Ấn~~".

Yêu cầu ban đầu nghe là *"một cái hồ nước"*, nên tôi dựng hẳn một lớp `vatSan`: vẽ ngay sau mặt
đất, **trước** mọi thực thể, không xếp lớp. Lý do đúng cho một thứ BẸT — một vũng nước không có
chiều cao nào để che ai, nên xếp nó theo chân ảnh là người đứng ở bờ **BẮC** bị mặt nước vẽ đè
lên, tức đứng dưới đáy hồ.

Rồi chủ dự án nói rõ hơn: *"nước có khả năng bắn lên không trung rồi toả ra các hướng khác
nhau"* — tức một **ĐÀI PHUN NƯỚC**. Cột nước là thứ **CÓ CHIỀU CAO**, nên người đứng phía bắc
nó phải bị che, và lớp phẳng kia làm đúng điều NGƯỢC LẠI. `vatSan` vì thế đã gỡ hẳn, và cái
đài đi chung đường `vatTo` với nhà cửa.

**Đừng dựng lại lớp phẳng ấy cho nước.** Cửa quyết định là một câu: *"đứng sau nó thì có bị nó
che không?"* — có thì `vatTo`, và `vatTo` là thứ duy nhất đang có.

Hai thứ giữ lại từ đợt đó, vì chúng đúng cho MỌI công trình:

| | |
|---|---|
| **`vatKhung(v)` + `veVatTo(v)`** | mục `vatTo` khai thêm `khung:{cot,hang,khung,oRong,oCao,fps}` là chạy hoạt ảnh từ `assets/iso/kh/<tên>.webp` — **cùng hợp đồng với `MOB_KHUNG`/`NPC_KHUNG`**, nên một đường nướng video phục vụ cả ba |
| **`can:[[dx,dy,w,h]]` khai ngay trong mục** | thắng bảng `VAT_CAN`. Bảng kia do `tools/iso/can_vatto.py` sinh ra từ chính tấm art (mái, tường, hiên — hình thù không mô tả tay nổi); một cái bể tròn thì đúng một hộp, và chờ art về mới có vật cản là để người chơi đi xuyên qua nó suốt thời gian chờ |

⚠ **TẤM TĨNH VẪN BẮT BUỘC** kể cả khi khai `khung`. Bảng khung nạp lười; thiếu tấm lùi là chỗ
đó **thủng một lỗ** giữa map trong mấy trăm mili giây đầu — và vì nó tự hết sau một nhịp nên
rất dễ nghiệm thu nhầm là xong.

⚠ **HỘP `can` PHẢI NHỎ HƠN HẲN TẤM ẢNH** (đài phun nước: **30% khung**). Cột nước và tia bắn
nằm trên cao, không chặn chân ai; chặn đúng khung ảnh là người chơi khựng lại giữa không khí
cách thành bể cả gang tay. `test_vatcan §4` gác cả hai đầu — **tâm** hộp phải chặn (thử ngược:
cho `vatToObs` quên đọc `v.can` ⇒ đỏ) và **góc khung ảnh** phải đi được.

⚠ **`thoang:true` LÀ MIỄN TRỪ KHAI TRONG DỮ LIỆU, không phải một danh sách tên trong bài kiểm.**
Đài phun nước không bán gì (nên `test_capnha §1` không đòi NPC đứng cửa) và gần như toàn là
KHÔNG KHÍ (nên `test_vatcan §1` không đòi nó chặn ≥75% khung). Hai bài đọc CÙNG một cờ; chép
một danh sách tên vào bài kiểm là thứ sẽ âm thầm nuốt mục thứ hai thêm sau.

### 🚪 ~~CỔNG VÒM BỐN HƯỚNG~~ — ĐÃ GỠ. Nay là LỐI RA, và nhân vật TỰ ĐI RA

> ⚠ Giữ đúng cái tiêu đề gạch ngang này để cảnh báo. `drawGateStatic()` · `gateSprite()` ·
> `assets/iso/ct_cong.png` **vẫn còn** — chúng chỉ ngủ. Cổng nào muốn dựng lại bộ vòm đá thì
> khai `vom:true` trong `GATES`; gỡ mã hay gỡ tấm art đi là đóng luôn cửa đó.

**⚠ BA BÀI KIỂM CŨ ĐỎ THEO, và cả ba sửa bằng cách ĐI THEO nội dung — không bài nào bị xoá
mệnh đề cho xanh.** Chúng đỏ vì cơ chế mới làm đúng việc của nó, đúng cái kiểu đã ghi ở mục
`test_hethong`:

| bài | đỏ vì | sửa thế nào |
|---|---|---|
| `test_cong` | không còn vòm nào để mà che ai | **tự bật `vom:true`** lên cổng đo rồi mới chấm ⇒ bộ vòm đang ngủ vẫn có người gác |
| `test_vatcan §2` | đi tới cổng là **sang map khác**, vòng cũ chạy tiếp 900 nhịp trên map MỚI rồi đo khoảng cách tới cổng của map CŨ (ra 2.727px) | dừng ngay khi `curMap` đổi — **đi XUYÊN QUA** là bằng chứng mạnh hơn hẳn "tới gần cổng" |
| `test_sandat` | cùng nguyên nhân, 16 mệnh đề đỏ | `diThu` trả `false` khi đổi map · thêm `veLai(m)` dựng lại cảnh |

⚠ **`test_cong` phải đứng cách cổng > `LOIRA_TAM`.** Hai chỗ đo cách cổng 72px và 77px — vừa
ngoài 70. Dời vào gần hơn một chút là nhân vật TỰ ĐI SANG MAP KHÁC giữa lúc đo, và thứ bài đọc
được là một ô đất của map bên kia. Nên nó có chốt tự kiểm `oMap === 'ardhaven'` **và** `coVom`
trước khi chấm.

Chủ dự án chốt: *"dẹp luôn cổng của 4 hướng đi. Thay vào, mở map lại ở hướng cho nó bo góc rồi
ghi chữ kiểu hướng đi ra map xxx sẽ hợp lý hơn. Và người chơi không cần phải bấm nút để có thể
tự đi ra khỏi map nữa, nhân vật sẽ tự động đi ra khi đến khoảng đó."*

| | |
|---|---|
| hình dạng cái miệng | **`diTrong` đã bo góc** — sinh bằng máy, xem ngay dưới |
| phần nhìn thấy | **`veLoiRa(g)`** — vẽ trên MẶT ĐẤT, trước mọi thực thể |
| tự đi ra | `LOIRA_TAM` **70px** · cờ `_loiRaCho` · khoá `_loiRaKhoa` |
| gác | **`tests/test_loira.js`** (9 mệnh đề, ba cơ chế thử ngược đều đỏ) |

**⚠ CHỈ CỔNG RÌA, KHÔNG PHẢI PORTAL.** Sàn Đấu · Tầng Sâu · Lò Khắc là những chuyến đi CÓ CHỦ
Ý (một cái còn là một lượt roguelite), và **`ardhaven→pvp` hạ cánh cách cổng về ĐÚNG 0px** — tự
đi ra ở đó là vào sàn rồi bị bắn ngược ra ngay lập tức. Đo cả 27 cặp map: khoảng cách điểm-hạ-
cánh ↔ cổng-về nhỏ nhất **trong nhóm rìa** là 127px, nên bán kính 70 còn dư 57px.

**⚠ CHỈ ARM MỘT CỜ, ĐỪNG GỌI `travelTo` TỪ `updateGate()`.** Nó chạy GIỮA `update(dt)`, mà
`travelTo` dựng lại cả thế giới (`buildWorld`) — phần còn lại của khung sẽ đi trên mảng
`mobs`/`decor` vừa bị thay. Đúng cái bẫy *"return giữa update(dt)"* đã ghi cho PvP. Cờ được xử
ở **đầu** `update()` khung sau, trước khi bất cứ gì đọc thế giới.

**⚠⚠ KHOÁ CHỐNG DỘI PHẢI KHOÁ THEO **CỔNG**, KHÔNG THEO TOẠ ĐỘ HẠ CÁNH — bản đầu sai, và phép
thử ngược IM LẶNG.** Bản đầu nhớ chỗ hạ cánh rồi nhả khi đi xa quá `LOIRA_TAM*1.8` = 126px;
nhưng điểm hạ cánh thật cách cổng về **128px**, nên khoá nhả ngay ở khung ĐẦU TIÊN — nó là mã
chết. Gỡ hẳn nó ra thì bài kiểm vẫn xanh, và *một phép thử ngược im lặng là bằng chứng cái QUE
DÒ hỏng, không phải bằng chứng mệnh đề yếu* (luật đã ghi ở mục `test_hethong`).

⇒ Và mệnh đề gác nó cũng phải đổi theo: **`test_loira §4b` TỰ DỰNG RA CÁI CA NGUY HIỂM** — dời
`spawnFrom` về đúng chỗ cổng về rồi mới đo. Mệnh đề cũ (§4a) đo cảnh THẬT, mà cảnh thật không
có cặp map nào nguy hiểm, nên nó xanh dù cơ chế có hay không. *Một cơ chế chỉ bật ở cảnh chưa
tồn tại thì bài kiểm phải tự dựng cảnh ấy ra, không thì nó không gác gì cả.*

**⚠ BO GÓC: CHỌN ĐỈNH THEO KHOẢNG CÁCH TỚI ĐIỂM CỔNG, KHÔNG THEO KHOẢNG CÁCH TỚI RÌA MAP.**
Bản đầu lấy *"cách cạnh map ≤260px"* và nó bắt **28/36 đỉnh** — tức bo tròn cả đường tường
thành, vì tường vốn chạy sát rìa. Lấy *"cách một trong bốn điểm cổng ≤560px"* thì đúng **16
đỉnh = 4 cuống × 4 góc**, và đỉnh gần thứ 17 cách 1.036px — hai cụm tách hẳn nhau. Cung Bézier
bậc hai, r=90, chèn 2 đỉnh mỗi góc ⇒ `diTrong` 36 → **68 đỉnh**.

**⚠ ĐO NỀN TRƯỚC KHI CHỌN TÔNG CỦA CÁI MIỆNG.** Bản đầu tô một vũng `rgba(232,224,203,.42)` và
chụp ra thì **gần như không thấy gì**: nền ở bốn cổng đo được sáng **103-181** (phần lớn
143-157). Thứ cứu được là một **cặp tương phản** — vành SẪM ôm ngoài + lòng SÁNG — chứ không
phải một mảng sáng đơn độc; cùng bài học đã ghi cho viên tuyết Bird Tribe Heights.

**Và nói thẳng chỗ còn thiếu:** thứ đáng ra phải nhìn thấy ở một lối ra là **khoảng hở trong
tường thành**, mà bảy tấm `tuong_*`/`cong_*` vẫn nằm trong `MAP_VAT_CHO`. Khi art tường về thì
cái miệng đã bo góc tự đọc ra thành một cổng mở, và vệt sáng dưới chân chỉ còn là vết mòn.
**Đừng nâng cấp vệt sáng ấy thành một cái cổng vẽ tay** — đó đúng là thứ vừa gỡ, và Quy tắc số 3.

### ⛲ ĐÀI PHUN NƯỚC ĐÃ VÀO GAME — ba bài học của đường VIDEO → BẢNG KHUNG

`ct_dainuoc` đứng giữa Quảng Trường Atia (`ardhaven 2991,1425` · ô **418×360** · bảng khung
`4×3, 12 khung, fps 12`). Đặt hàng + prompt: `docs/PROMPT_DAINUOC_VA_HANGRAO.md`.

**⚠ "GẦN TÂM MAP" VÀ "THẤY ĐƯỢC LÚC VÀO GAME" LÀ HAI RÀNG BUỘC KHÁC NHAU.** Bản quét đầu ra
(3300,1020) — ô gần tâm map nhất — và nó nằm **ngoài khung hình**: ở zoom mặc định (`xa`, 1,0×)
trên màn 1920×1080, khung lúc mới vào game là `x 2240..4160 · y 1360..2440` quanh điểm thả, còn
cái đài ở `y 1020..1380`. Người chơi mới tạo nhân vật sẽ không thấy gì. Phải **dựng khung hình
thật rồi mới chấm**, đừng chấm theo khoảng cách tới một điểm.

**⚠ `--do` CỦA `nuong_video.py` ĐO TÂM KHỐI ĐẶC, nên nó BÁO ĐỘNG GIẢ với thứ tự phình xẹp.**
Bản đầy đủ báo *"máy quay động 91px"* — con số đúng, kết luận sai: một cột nước phồng lên xẹp
xuống thì tâm khối dịch dù máy quay khoá cứng. Phải bám theo phần **PHẢI ĐỨNG YÊN** (ở đây là bề
ngang bể đá) mới tách được "máy quay động" với "vật động". Đo thế thì lộ ra chuyện thật: video
**zoom vào rồi zoom ra**, bể 274px → 532px → 274px, và chỉ **120/240 khung đầu** dùng được.

**⚠ LÒ SINH VIDEO NƯỚNG BÓNG ĐỔ THÀNH MẢNG ĐẶC — phải gỡ.** Trên nền magenta thì bóng là
magenta-TỐI: bộ tách gỡ đúng nền phẳng, mảng tối ở lại rồi qua bước khử viền hồng thành **một
vũng xanh-tím ĐỤC (alpha 255)** cạnh vật. Đo ba công trình đang chạy (`ct_duoc` · `ct_quantro` ·
`ct_loren`) ra **0,0-0,4%** điểm bóng ⇒ quy ước của dự án là **cắt SÁT VẬT**. Công cụ:
`tools/iso/bo_bong.py`, chạy trên **cả** tấm tĩnh lẫn bảng khung.

**⚠⚠ VÀ PHÉP GỠ BÓNG BẢN ĐẦU ĂN THỦNG MẶT NƯỚC.** Cửa nhận diện theo MÀU (lam · tối · G≥R) cũng
khớp vùng nước sẫm trong lòng bể: **thủng 5,2%**, và trong game thì NPC đứng phía sau lộ qua mặt
nước. Chữa bằng một ràng buộc HÌNH HỌC: bóng thì **chạm nền trong suốt**, nước thì bị thành đá
bao kín ⇒ `noi_ra_ngoai()` chỉ giữ mảng lan ra được tới nền. Sau khi sửa: **0,00%**.
*Một cửa nhận diện theo MÀU sẽ luôn bắt nhầm một vùng cùng màu ở chỗ khác; thêm một ràng buộc
hình học mới tách được chúng.*

### ⚠⚠ NPC CỦA ARDHAVEN KHAI Ở **HAI** TỆP — mọi phép quét đọc tệp đều MÙ

`window.NPCS` dựng trong `data/canbang.js`, rồi `game.js` **`NPCS.push(...)` hai lượt nữa**
(9 con của ardhaven, trong đó có `monkhach` ở `2870,2100`). Bộ quét chấm chỗ đặt đài phun nước
của tôi đọc thẳng `canbang.js` ⇒ nó thấy **19 trên 28 con**, và nó chấm cái đài **đè thẳng lên
`monkhach`**. `test_capnha §2` bắt được vì bài kiểm đọc `NPCS` LÚC CHẠY.

⇒ **Quét chỗ đặt thì lái trong trình duyệt và đọc `NPCS`/`MAPS`/`GATES` thật**, đừng `vm.runInContext`
một tệp rồi tin kết quả. Cùng một luật với *"màn chờ phải hỏi cùng cái hàm mà trong màn dùng"*,
và cùng họ với bẫy `QUESTS` khai hai nơi đã ghi ở trên — chỉ khác là lần này nạn nhân là một
**phép đo**, không phải một tính năng. *Một phép quét đọc tệp, khi dữ liệu thật được ghép từ hai
tệp, là một phép quét mù — và nó trả về những con số trông hoàn toàn bình thường.*

### 🏘 MỖI CÔNG TRÌNH PHẢI CÓ NGƯỜI ĐỨNG TRƯỚC CỬA — và "có NPC ở gần" là cái chốt KHÔNG CHỐT GÌ

Trước đợt chấm lại, cả bảy ngôi nhà của Sapidae Chiefdom **đều đã có** một NPC trong bán kính
400px. Nên một mệnh đề kiểu *"nhà nào cũng có NPC ở gần"* sẽ **XANH** trong khi `ah_vachgio`
đứng **480px phía SAU lưng** Chòi Trông Vách và bị chính công trình vẽ đè lên. Cùng bệnh với
luật `≤60% là kill` và với *"đúng 7 NPC có trang thoại"*: **một cái chốt đúng ở mọi trạng thái
là một cái chốt không chốt gì.**

⇒ Đo **ĐỘ LỆCH NGANG so với tim nhà** và **đứng trước hay sau**, không đo khoảng cách trần.
Một luật cho cả bảy, và nó chấm bằng máy:

| hàng | mặt tiền quay đâu | NPC đứng ở |
|---|---|---|
| BẮC (`khoi.y` 520) | xuống đại lộ y≈1600 | ( tim nhà , **chân nhà + 130** ) |
| NAM (`khoi.y` 2340) | ra tường thành | ( tim nhà , **mép trên khối − 130** ) |

Hàng nam cố ý đặt NPC ở phía **BẮC** vì người chơi tới từ đại lộ; đứng đúng mặt tiền thì họ
khuất sau nhà — đúng cái vừa phải sửa. Sau khi chấm: cả bảy cặp lệch ngang **đúng 0px**.

⚠ **Đẩy một NPC chức năng vào chỗ thì phải QUÉT LẠI chỗ cho con bị đẩy ra**, đừng dịch tay.
Hai NPC phố (`ah_chimera`, `ah_thonhuom`) rơi vào tầm 200px và phải tìm chỗ mới; ràng buộc là
trong đa giác sàn · lề ≥60px tới mọi khối và mọi `vatTo` · cách mọi NPC ≥220px · cách cổng
≥300px.

⚠ **NPC đứng lọt trong một khối `MAP_OBSTACLES` là một cửa hàng đóng VĨNH VIỄN.** Khối là vật
cản đặc kể cả khi chưa có tấm art nào, nên người chơi không bao giờ tới đủ gần để mở bảng — và
không một lỗi nào in ra. `test_capnha §3` gác riêng chuyện đó, tách khỏi §2 (bị **hình** công
trình vẽ đè) vì hai thứ hỏng theo hai kiểu khác nhau.

⚠ **ĐỪNG đòi "NPC chức năng nào cũng phải có nhà"** — art chưa về thì đó là một bài đỏ vĩnh
viễn, đúng cái ngưỡng bất khả đã ghi ở mục `AXIE_CORE.md`. Đòi thứ kiểm được: con chưa có nhà
phải **đã đứng đúng khuôn của một khối còn trống**, nên thả tệp ảnh vào là cặp khít ngay, không
phải dời ai. Hiện còn hai con như vậy: `ah_phapsu` (Quán Sách, khối #1) và `thantoan`
(Sảnh Cầu May, khối #9).

Gác: **`tests/test_capnha.js`** (6 mệnh đề, cả năm cơ chế đã thử ngược và đều đỏ).
Đặt hàng art đài phun nước + hàng rào: **`docs/PROMPT_DAINUOC_VA_HANGRAO.md`**.

### 🧟 THẢ MỘT CON QUÁI MỚI VÀO GAME — đường đi, và ba chỗ phải ĐO chứ đừng đoán

Con đầu tiên đi đủ đường này là **`omden` — Kẻ Ôm Đèn Tro Tàn** (cấp 88, Reptile Sunstone Flats).
Giữ nó làm khuôn: thêm con sau là **một dòng `MOBS` + một miền `vung`**, không sửa một dòng máy nào.

| bước | việc |
|---|---|
| art | một tấm tĩnh ở `assets/mobs/<mã>.png` là ĐỦ — không khai `MOB_KHUNG` thì vẽ y như mọi con khác |
| chỉ số | một dòng trong `MOBS` (`game.js`) |
| chỗ đứng | một miền trong `vung` của map (`data/canbang.js`) |
| gác | **`tests/test_anhquai.js`** (4 mệnh đề, **cả bốn đã thử ngược và đều đỏ**) |

**⚠ CHỈ SỐ NỘI SUY GIỮA HAI HÀNG XÓM, ĐừNG BẮT ĐẦU TỪ MỘT CON SỐ ĐẸP.** `test_moblevels` đòi
**XP không được tụt theo cấp** và **cấp phải tăng dần theo khoảng cách tới điểm thả**, còn `range`
của map phải khớp đúng cấp quái nhỏ nhất/lớn nhất. `omden` vì thế lấy hp **8070** đúng bằng cả hai
hàng xóm (không đẻ dip mới trong thang), atk 252 và xp 7300 nằm giữa.

**⚠ CHÈN MỘT MIỀN LÀ GIÃN LẠI CẢ DÃY.** `dai` không được chồng nhau (`test_vung §2`), mà vị trí
cụm = `t × voi` — nên cấp 88 phải nằm giữa 84 và 92 thì **bốn miền sau nó đều phải lùi ra**. Sửa
một dòng rồi tưởng xong là gradient tụt.

**⚠ KHAI `he` CỦA MIỀN NẾU MAP ĐANG THUẦN MỘT HỆ.** `MOBS[].el` là lớp nền, `vung.he` thắng — nên
một con `el:'Dusk'` thả vào Reptile Sunstone Flats mà quên `he:'Reptile'` là map thôi **thuần 100%**,
một tính chất đã chốt ở mục tam giác, và nó hỏng trong im lặng.

**Ba phép đo đã làm, và phép thứ hai bác bỏ chính linh cảm ban đầu của tôi:**

1. **Art tối có đọc được không.** Tấm này **sáng 0,246** — tối hơn cả 24/24 tấm quái hiện có
   (trung vị 0,514). Nhưng **lệch chuẩn 0,226** nằm trên hẳn ngưỡng 0,12, tức đúng ca "kỵ sĩ 0,209
   đọc rõ từng chi tiết" chứ không phải ca "bóng ma 0,092 thành đốm mực" ⇒ **không nâng sáng**.
2. **Và đừng dừng ở đó — đo THẬT trên map đích.** Năng lượng biên trong một ô quanh con quái, A/B
   trên cùng một khung (có con / không con): **+22,1%** so với nền trống, trong khi `thamtu` — con
   đã ship sẵn trên chính map đó — chỉ **+18,2%**. Tức tấm tối này đọc ra RÕ HƠN một con đang chạy.
   *Một ngưỡng chung cho "art tối" không thay được một phép đo trên đúng cái nền nó sẽ đứng.*
3. **Cân bằng: `test_mobbalance` KHÔNG ĐO CON NÀY.** Nó chỉ đo bãi **gần cổng nhất** và **xa nhất**,
   mà con mới nằm giữa ⇒ thêm một loài vào khoảng giữa là thêm một loài **không ai gác cân bằng**.
   Phải tự đo: ở cấp 88, dồn điểm theo build của lớp, Sylvan Ranger hạ thamtu/omden/cungthu trong
   **4,1s / 4,1s / 4,4s** ⇒ nằm đúng trên đường cong.

**⚠ `def` ĐÃ BÃO HOÀ Ở DẢI CẤP NÀY — đừng chỉnh nó để "cho có cảm giác trâu".** Thử 68 rồi đo lại:
thời gian hạ của cả ba lớp **không đổi** (16,0s → 17,3s, nằm trong nhiễu). Thứ thật sự đổi hồ sơ
là `atkCd` và `speed`.

#### ⚠ ĐƯỜNG DẪN ẢNH QUÁI GÕ SAI LÀ MỘT LỖI IM LẶNG — trước `test_anhquai` không ai gác

Con quái vẫn spawn, vẫn đánh, vẫn rơi đồ — chỉ là **không vẽ ra gì**, kèm một dòng 404 không ai đọc.
Đúng họ với vết sẹo `ISO_NEO` đã xoá sạch cây của sáu map. Bài mới gác bốn chiều, và ④ là tầng
**HÀNH VI** — tầng duy nhất bắt được ca *"tệp có trên đĩa mà trình duyệt vẫn không tải nổi"*.

**⚠ HAI QUE DÒ CỦA CHÍNH BÀI ẤY ĐÃ HỎNG TRƯỚC KHI ĐÚNG**, ghi lại vì cả hai đều cho một kết quả
trông rất thuyết phục:
- `MOB_IMGS` **khoá theo MÃ LOÀI**, không theo đường dẫn. Khoá nhầm ra **32/32 loài đều "không tải
  được" trong khi 0 lượt 404** — hai con số ấy mâu thuẫn nhau, và chính chỗ mâu thuẫn là bằng chứng
  que dò hỏng chứ không phải game hỏng.
- Khoá `MOB_KHUNG` **không có đuôi** (đường dẫn dựng thành `assets/mobs/kh/<tên>.png`), nên kiểm
  thẳng chuỗi khoá là báo thiếu hai tệp đang có thật.

**⚠ VÀ ④ PHẢI LOẠI LOÀI KHAI `skel`.** Năm loài khai CẢ `skel` LẪN `img` và CỐ Ý hiện bằng khung
xương, nên đường nạp ảnh bỏ qua chúng — đòi chúng tải ảnh là đòi một thứ thiết kế nói không.
① vẫn gác chuyện tệp lùi ấy có thật.

### 🗺 BẢN SẮC MAP SUY RA TỪ DỮ LIỆU, KHÔNG CHÉP CỨNG

`mapBanSac(id)` tính **loài chủ đạo · hệ trội · Dòng Cốt độc quyền** từ chính `packs`, và
`banSacHtml()` hiện một dòng kiểu Ragnarok trên bảng Bản Đồ. Chép cứng thì sửa `packs` một lần
là bảng Bản Đồ nói dối — mà nói dối kiểu đó không ai phát hiện được.

**Cố ý KHÔNG làm `monRoi`** (món chỉ rơi ở map này) như đề xuất gốc: chính đề xuất đó cảnh báo
món độc quyền phải thật sự cần cho một thứ gì đó, không thì chỉ là "món rác mang tên đẹp".
Dựng bảy nền kinh tế mới cho bảy món là đúng cái bệnh nhân bản. Mỗi map **đã có sẵn** một thứ
độc quyền thật — một Dòng Cốt, có nơi tiêu thật (bốn ô Cốt của người chơi). Việc của A2 là **cho thấy**, không
phải **thêm**.

Đây cũng là chỗ chữa cho khắc hệ: `el:` chạy trong `hurtMob` (±20% / −12%) từ lâu nhưng người
chơi không có cách nào biết map nào hệ gì. Nay hệ trội nằm ngay trên bảng Bản Đồ.

### 📌 CHÍNH TUYẾN ĐÃ DỰNG LẠI · PHỤ TUYẾN CŨNG ĐÃ DỰNG XONG

> ⚠ Mục này **trước đây ghi cả hai bảng đều rỗng và chờ dựng lại**. Nửa đầu không còn đúng —
> giữ lại đúng cái tiêu đề này để cảnh báo, thay vì xoá trắng rồi để người sau đọc lịch sử git
> mà tưởng chuỗi vẫn rỗng. Cùng một kiểu bẫy đã ghi ở mục "~~Khắc Ấn~~".

| | Trạng thái |
|---|---|
| `QUESTS` | **ĐANG CHẠY** — 9 chương / **51** nhiệm vụ (chương VIII · Người Thứ Bảy; `c1q4` dạy trục phòng thủ Axie), canon Nhát Gọi. Xem mục "Cốt truyện (canon)" và `docs/LORE_RUNE.md` |
| `SIDE_QUESTS` | **ĐANG CHẠY** — **32 nhiệm vụ / 10 map**, phủ cấp 3→116. Trước là 9 mục chỉ trên ba map lối đi. |

**Vì sao chuỗi CŨ bị gỡ (ghi lại để đừng vá nó từ git):** lối chơi đã đổi quá nhiều so với lúc
viết — bỏ 7 phó bản, vai trò theo bãi, bản sắc map, zoom camera, cổng map bỏ `reqMain`. Rồi bản
dựng lại lần đầu (5 chương / 33 nhiệm vụ) lại **không nhắc canon một lần nào**: đếm trên toàn
khối ra 0 lần cho Trụ Khoá · Morvahn · Vaeldra · Tướng Quân. Hai mạch chạy song song không nối
vào nhau — đó là lý do có đợt gộp này.

**⚠ CHUỖI KHAI Ở MỘT NƠI, KHÔNG PHẢI HAI.** Trước đây `data/canbang.js` khai 10 mục rồi `game.js`
`QUESTS.push(...)` thêm 6 chương/25 mục nữa, nên rỗng bảng dữ liệu mà quên phần push thì
`QUESTS.length` vẫn ra 25 — đã mắc đúng lỗi đó. Nay **toàn bộ 46 mục nằm trong `data/canbang.js`**
và `game.js` không push nhiệm vụ chính nào. Giữ đúng nếp đó.

**Phụ tuyến — 32 mục / 10 map.** Bản đầu chỉ có 9 mục trên ba map LỐI ĐI (`loimon` · `trungnut`
· `caungam`), phủ đúng dải cấp 40→62. Nay phủ **cấp 3 → 116**: mỗi map đánh nhau có ba mục do NPC
của chính vùng đó giao. `Tầng Sâu` vẫn trống — nợ còn lại duy nhất.

| loại | số | | loại | số |
|---|---|---|---|---|
| `kill` | 10 | | `moc` | 6 |
| `collect` | 6 | | `tranai` | 2 |
| `talk` | 6 | | `chaos` | 2 |

- **Đánh nhau 12/32 = 38%**, và **mỗi map đúng MỘT mục `kill`**. Hai mục `tranai` không tính vào
  luật đó: hạ một con trùm là một trận một lần, không phải cày N con. `tests/test_phutuyen.js` gác.
- **Hai mục `tranai` tồn tại vì một lỗ có thật**: `loimon` và `caungam` cố ý không có chương chính
  tuyến (không phiến Rune nào cắm được ở một lối đi hay một nhịp đá không nền), nhưng Tướng Quân
  thì vẫn đứng đó — **hai con DUY NHẤT trong mười một con mà không nhiệm vụ nào trỏ tới**.
- ⚠ **`sl_cn1`/`sl_cn2` chính là `c4q4`/`c4q5` cũ**, kéo ra khỏi chính tuyến. Chương IV từng thu
  phiến gốc ở nhiệm vụ 3/5 rồi còn hai nhiệm vụ nữa trên `caungam` — tức chính tuyến ngồi trên
  đất phụ tuyến. Nay `tranai` là ô CUỐI ở cả bảy chương.
- ⚠ **`reqMain` là CHỈ SỐ (0-based), không phải số thứ tự.** Thêm/bớt một nhiệm vụ chính là mọi
  `reqMain` trượt. Để mốc thấp hơn chỗ cần một chút, đừng khoá sát.
- Trần **`SIDE_TRAN` = 5** mục cầm cùng lúc (trước là 3 chép cứng). Mỗi vùng có ba mục, nên trần 3
  nghĩa là nhận trọn một vùng rồi thì không cầm nổi mục nào của vùng khác.

#### ⚠ BA LỖI IM LẶNG CỦA BẢN 9-MỤC — đã vá, đừng dựng lại

Cả ba đều **không ném lỗi, không làm đỏ bài kiểm nào**, và cả ba đều là cùng một dạng: dữ liệu
khai một đằng, máy đọc một nẻo.

1. **Không mục nào khai `map:`** — mà bảng Nhật Ký lọc phụ tuyến bằng `SIDE_QUESTS.filter(sq =>
   sq.map === mapId)`. Tức tab Phụ Tuyến **trống trơn** suốt, dù có 9 nhiệm vụ đang chạy.
2. **`herbMap` là dữ liệu chết** — `sideOnEvent('collect')` chỉ gác map cho loại `catch`. Nhiệm vụ
   ghi "hái ở Lối Mòn" mà hái ở bãi thuốc ngoài cổng thành cũng đếm.
3. **Bốn map có sẵn `HERB_SPOTS` nhưng `herbs:false`** (`daohoa` `loimon` `trungnut` `caungam`) —
   toạ độ đã chấm từ lâu, chỉ thiếu đúng cái cờ, nên không bụi nào mọc ở chỗ nhiệm vụ chỉ tới.
   **Cờ và bảng toạ độ là HAI chỗ**: có bảng mà quên cờ thì không lỗi nào báo.

⇒ Bài kiểm mới **lái bằng hàm thật** (`acceptSide` · `tryHarvestHerb` · `sideOnKill` · `mocTick` ·
`turnInSide`) chứ không đọc bảng rồi tự kết luận: chỗ hỏng nằm ở sợi dây nối, không nằm ở bảng.

#### Máy phụ tuyến nhận thêm hai loại

- **`tranai`** — `sideOnKill` nay nhận cả ĐỐI TƯỢNG quái chứ không chỉ `m.type`, vì Trấn Ải của mọi
  vùng dựng động trong `spawnZoneBoss` nên không có khoá nào trong `MOBS` để so; phải đọc
  `def.bossKind`.
- **`moc`** — dùng CHUNG bảng `MOC_NV` với chính tuyến và đi qua ĐÚNG nhịp `mocTick(dt)`, không móc
  thêm chỗ nào. Đếm **từ trạng thái**, nên mục nào người chơi đã làm đủ từ trước là xong ngay lúc
  nhận — đó là chủ ý, xem mục `MOC_NV`.

#### 🌱 `daohoa` NAY CÓ NPC — trước đó là map đánh nhau DUY NHẤT không ai nói một câu

`uomluong` (Kẻ Coi Luống) ở `(200,200)`. Chỗ đứng **chấm bằng máy**, không đoán: đi được, trống
8 hướng, lề 108px tới mọi thứ phải tránh (bãi quái 340 · Vệ Binh 520 · Tướng Quân 760 · cổng 300 ·
điểm thả 260 · Rương Canh 260 · bụi thuốc 180), và cách điểm thả 368px nên người chơi đi ngang qua
chứ không phải đi tìm. Cả map chỉ có **41 điểm** thoả bộ ràng buộc đó — đừng dịch tay, quét lại.

### 🎁 THƯỞNG NHIỆM VỤ — MỘT cửa trao, MỘT cửa hiện

`traoThuong(rew)` (trao) và `rewMoTa(rew)` (hiện) dùng chung cho cả chính tuyến lẫn phụ tuyến.

⚠ **Hai lỗi có sẵn mà việc gộp này lộ ra:**
- `turnInSide` **không đọc `rew.item`** — mọi nhiệm vụ phụ khai thưởng vật phẩm sẽ im lặng nuốt mất
  món đó.
- Bốn chỗ in thưởng chỉ in `xp` và `silver`, nên **chín nhiệm vụ đã khai `rew.item` từ lâu vẫn hứa
  suông trên bảng**: người chơi nhận được món mà không chỗ nào nói trước là có. *Trao thưởng và
  HIỆN thưởng là hai việc — sửa một cái mà quên cái kia thì không lỗi nào báo.*

Bốn nhánh thưởng, **đều trỏ vào hệ đang chạy**, không đẻ tiền tệ mới: `item` (ô trang bị) ·
`cot` (Dòng Cốt độc quyền của vùng) · `ngoc` (ép thẳng vào đồ) · `gk` (vé quay Khế Ước). **Shard
CỐ Ý không có mặt** — nó chỉ tới từ mốc mỗi ngày và thông quan, cho nhiệm vụ nhả Shard là phá đúng
luật đó. Nay **24/51 chính tuyến + 9/32 phụ tuyến** có thưởng vật phẩm (trước: 9/50 + 0/32).

### ⏱ NHỊP CẤP — `XP_TABLE` NAY DẪN TỪ SỐ ĐO, KHÔNG TỪ CẢM GIÁC

Mốc chủ dự án chốt: **~3 giờ tới cấp 60**. Đo lại được, và **hai nửa của phép tính nằm ở hai tệp**
— bảng cấp trong `game.js`, XP nhiệm vụ trong `data/canbang.js`. ⚠ **Sửa một nửa là mốc nói dối
ngay mà không lỗi nào báo.** `tests/test_nhipcap.js` là thứ duy nhất bắt được chuyện đó.

| công cụ | việc |
|---|---|
| `tools/do_nhipcap.cjs` | ĐO XP/giờ thật trong chính vòng chơi (đặt cấp, mặc đồ đúng cấp, bật AUTO, tick `update`) |
| `tools/can_exp.cjs` | từ số đo dẫn ra `XP_TABLE` + XP của cả 82 nhiệm vụ |

```
cd public/game && python3 -m http.server 8853
NODE_PATH=/opt/node22/lib/node_modules node tools/do_nhipcap.cjs --giay 150 --lap 3 --json do.json
node tools/can_exp.cjs do.json --tile 8 --gio60 2.94 --gio120 29.5 --tile120 7 --nvDau 30 --nvCuoi 6 --ghi
```

**Trước / sau:**

| | cũ | mới |
|---|---|---|
| tới cấp 60 | 4,36 giờ | **3,00 giờ** (làm hết NV) · 3,60 (bỏ hết) |
| tới cấp 120 | 29,9 giờ | 33,4 giờ |
| dốc nhất giữa hai cấp | **×9,8 ở mốc 60** (253.269 → 2.472.993) | ×1,39 |
| nhiệm vụ gánh tới cấp 60 | 9,1% | 15,0% |
| nhiệm vụ cấp 100 thưởng | 140.000 = **2,5% một cấp** | 887.643 = 12% một cấp |

**Ba thứ quyết định hình dạng — đọc trước khi chạm vào một con số nào:**

1. **XP/giờ đo được khớp đúng luật luỹ thừa `rate(l) = 1694 · l^1,945`** — gần đúng lv², hợp với
   việc XP mỗi con ≈ 0,8-1,1 × lv² trên cả 29 loài.
2. **Ngân sách THỜI GIAN mỗi cấp** tăng theo cấp số nhân (cấp 59 tốn gấp 8 lần cấp 1).
3. **Nhiệm vụ gánh 30% một cấp ở cấp 1, nhạt dần còn 6% ở cấp 120.** Tỉ lệ PHẲNG thì hoặc cấp 1
   thưởng 1 EXP (đọc như nhiệm vụ hỏng), hoặc cấp 120 nhiệm vụ gánh hộ quá nhiều. Đây chính là
   thứ trả lời "càng về sau càng phải cày".

⚠ **`XP_TABLE` đặt theo CÀY THUẦN rồi chia cho (1 − phần nhiệm vụ)**, KHÔNG phải `= cày + nhiệm
vụ`. Đã thử cách sau: cấp nào có nhiệm vụ rơi vào thì **99% là quà** (đo ở cấp 1), và ai bỏ qua
chuỗi thì kẹt cứng.

⚠ **ĐỪNG lấy `max(đường khớp, số đo)`.** Số đo có đỉnh do bốc trúng bộ đồ ngon — cấp 45 đo 7,67
triệu/giờ còn cấp 50 chỉ 5,13 — nên `max` đẻ ra bảng **không tăng dần**. Và lấy thẳng số đo ở chỗ
HỤT thì biến hố nội dung thành "cấp rẻ bất thường", tức giấu lỗi thay vì chữa.

⚠ **Tính giờ THEO TỪNG CẤP**, đừng lấy tổng rồi nhân tỉ lệ nhiệm vụ trung bình: XP nhiệm vụ rơi
thành CỤC ở vài cấp lẻ. Phép xấp xỉ trung bình báo 3,00 giờ trong khi tính đúng ra **3,60**.

⚠ **`XP60PLUS_ANCHORS` và `xp60PlusHourlyRate` ĐÃ GỠ.** Chú thích của chúng ghi là đo "không trang
bị" — đo lại kiểu đó thì từ cấp 10 trở lên nhân vật **CHẾT trước khi giết được con nào** (atk 35 vs
quái 1.052 máu), tức mốc cũ không thể sinh ra từ phép đo mà nó tự mô tả.

#### ⚠ `do_nhipcap.cjs` KHÔNG ĐO ĐƯỢC TỪ CẤP 60 TRỞ LÊN — đo được, CHƯA truy ra nguyên nhân

Chạy lại công cụ (2026-09-15, `--giay 150 --lap 3`) thì các mốc **60 · 65 · 70 · 80 · 100 · 119**
trả về **0 XP/giờ**, nên `GIỜ ĐỂ LÊN CẤP 60` in ra `Infinity`. Mốc 30 cũng rơi vào đó. Các mốc
1-55 vẫn cho số bình thường.

**Nó KHÔNG phải do đợt tam giác lớp Axie.** Đã dựng worktree ở commit ngay TRƯỚC đợt đó
(`8414e35`), phục vụ ở một cổng riêng, chạy cùng tham số: **ra đúng cùng một bảng số 0**
(`gan: 0`, `xpGio: 0` ở cả ba mốc 60/70/100). Đây là cách duy nhất phân biệt "đỏ do mình" với
"đỏ có sẵn" — xem mục `rc=124` để biết vì sao phải làm đúng thứ tự ấy.

Cũng **không** phải do máy bận: chạy lại lúc máy rỗi vẫn ra 0.

Đã loại được một giả thuyết: *"AUTO không tới nổi bãi quái trên map khổ lớn"*. Lái thử 3.600
nhịp ở `mongco` và `nhanmon` thì người chơi đứng trong tầm 260px của quái **95% và 58% số nhịp**
— tức nó TỚI ĐƯỢC bãi. Vậy chỗ hỏng nằm ở khúc sau, chưa truy ra.

⚠ **Hệ quả phải nói thẳng: mọi con số nhịp cấp từ 60 trở lên trong tài liệu này (33,4 giờ tới
cấp 120) hiện KHÔNG đo lại được.** Chúng vẫn có thể đúng — bảng `XP_TABLE` không đổi — nhưng
đừng trích chúng như một phép đo còn hiệu lực cho tới khi công cụ chạy lại được. *Một số đo mà
công cụ sinh ra nó đã hỏng thì là một con số chép tay, dù nó từng được đo thật.*

#### 🕳 BỐN HỐ XP CÒN LẠI — nợ NỘI DUNG, cố ý không nướng vào bảng cấp

Số đo thấp hơn đường khớp >55% ở **cấp 5 · 35 · 55 · 70 · 119** — tất cả đều ở NÓC một dải map.
Nguyên nhân đã truy ra, và nó không nằm ở XP:

- **AUTO cắm chốt đúng MỘT bãi mỗi map và không bao giờ lên bãi cao hơn.** Đo được: cấp 55 đứng
  trên `comoc` vẫn cày `thinu` (cấp 42, 1.440 XP) trong khi `huyetbat` (cấp 56, 2.465 XP) nằm đó
  không ai đụng. Cấp 35 trên `chungnam` vẫn cày `chimera_bo` (cấp 24).
- **Chênh trang bị ngẫu nhiên bị khuếch đại bởi giáp trừ thẳng.** Cùng cấp 50, cùng map, cùng loài:
  atk 100 → **30 mạng**/2 phút, atk 120 → **96 mạng**. Chênh 18% công ra chênh 3,2 lần tốc độ.

Cả hai là việc riêng, không phải việc của bảng XP. `tools/can_exp.cjs` in danh sách hố ở cuối mỗi
lượt chạy — đó là danh sách việc, không phải nhiễu đo.

### ☀ TẦNG NGÀY THEO DẢI CẤP (`DAILY_BANDS`)

Đo được: chuỗi nhiệm vụ cho **1% tổng XP** lên cấp 120 — tức 99% hành trình là cày. Nên tầng
NGÀY là thứ **duy nhất** chạm vào mọi ngày chơi ở 70 cấp cuối. Mà bản cũ là **ba mục cố định**
(`Hạ 10 Chimera` · `Rèn 1 lần` · `Hạ 1 Trùm Vùng`) với `minLv` 1/5/12 — từ cấp 12 tới 120,
**108 cấp**, người chơi mở bảng ra thấy đúng ba dòng đó, cùng con số đó.

Nay 7 dải, **dùng lại đúng khuôn `TRUYNA_BANDS`** — đừng dựng khuôn dải thứ hai, hai bảng cùng
ý nghĩa là bảo đảm chúng lệch nhau sau vài đợt sửa. Từ 1 mục / thưởng ×1 lên 5 mục / thưởng ×13
(300 → 3.900 Lumen · 100 → 1.300 Bản Năng · 2 → 6 Shard).

- ⚠ **CHỈ THÊM MỤC TIÊU NÀO ĐÃ CÓ NHỊP NGÀY SẴN.** `via` (Vỉa Cốt) và `truyna` (Truy Nã Lệnh)
  vốn đã là nội dung ngày — đưa vào đây là **cho thấy** thứ đã có. Dựng một hệ lặp thứ tư cạnh
  Truy Nã + Vỉa + ba sự kiện theo giờ thật là đúng bệnh nhân bản ở đầu tài liệu này.
- ⚠ **MỖI khoá phải có một chỗ gọi `dailyTrack()`.** Thiếu một chỗ móc là mục đó đứng 0 vĩnh
  viễn, và vì thưởng đòi xong **HẾT** nên nó khoá luôn thưởng ngày — im lặng, không lỗi nào.
- ⚠ **`dailyReset()` dựng khuôn TỪ `DAILY_META`**, không viết tay từng khoá. Thêm mục mà quên
  thêm ngăn thì `d[g.id]` là `undefined` và `||0` che mất. Save cũ cũng được vá mà giữ tiến độ.

Bài kiểm: `tests/test_muctieu.js` — lái từng mục tới đích bằng **chính hàm của game**
(`viaKhai()` / `truynaClaim()` thật, không chỉ gọi `dailyTrack`), vì đó là thứ bắt được chỗ móc
thiếu.

### ☠ CHƯƠNG VIII · NGƯỜI THỨ BẢY — và trùm nhiệm vụ nay THEO MAP

DRUE được nhắc **2/46** nhiệm vụ, cả hai chỉ là một câu tả cảnh trong mô tả boss vùng — kẻ thù
chính của canon chưa bao giờ bị đối đầu. Chương VIII (4 nhiệm vụ, cấp 116-120) trả nốt chỗ đó.

- ⚠ **KHÔNG phải Rune thứ tám.** `RUNE_TONG` = 7 khớp cứng với số nấc `#fx-crack[data-tru="N"]`
  trong `style.css`; thêm phiến thứ tám là lớp vết nứt tụt về 0 ở nấc cuối mà không báo gì.
  DRUE cũng **không phải Trấn Ải** — mỗi map đúng một con, `TRAN_AI_TONG` suy từ `BOSS_DEFS`.
- ⚠ **Kết Mở vẫn ở `c7q6`, không dời.** Chương VIII là thứ xảy ra SAU cái kết mở đó. `showKetDrue()`
  cố ý không phải màn "ngươi đã thắng": đèn vẫn tắt, vì bảy phiến vẫn trong lò.
- Chỗ đặt **quét bằng máy**: Dusk Marsh đã bão hoà (cả map chỉ còn 3 điểm hợp lệ, lề 2-15px).
  Trũng Nứt có 2100 điểm, lấy điểm lề lớn nhất 1320px. Mép TRÊN map là đúng canon — Nhát Gọi là
  vết cắt trên **trời**, Trũng Nứt là đất ngay dưới nó.
- `MOBS.drue` vẽ bằng khung xương `fiend`, **không thêm tệp ảnh nào**.

**Trùm nhiệm vụ nay theo map**: `BOSS_ARENAS` · `bossMobKey(md)` · `questBossIdx(mid)`;
`md.boss` là `true` (tương thích, ⇒ `MOBS.boss`) hoặc một khoá trong `MOBS`.

⚠ **Guard là `questIdx === questBossIdx(map)`, KHÔNG phải `>= idx && !victory`.** `victory` là
cờ **toàn cục**: nó bật ở `c0q8` — **cấp 12** — rồi chặn vĩnh viễn con thứ hai ở cấp 120. Tức
DRUE không bao giờ hiện với người chơi đi đường tự nhiên, và không lỗi nào báo. So sánh bằng thì
tự đúng cho mọi map và tự tắt khi nhiệm vụ trôi qua.

⚠ **`showVictory()` chép cứng "Thủ Lĩnh Gloam đã bại"** — câu của trùm cấp 12. Chỉ con ở
`corran` được gọi nó.

⚠ **BÀI KIỂM PHẢI ĐI ĐƯỜNG TỰ NHIÊN.** Bài đầu của tôi nhảy thẳng `questIdx` tới chương VIII rồi
đo — xanh, và bỏ sót đúng lỗi `victory` ở trên. `test_nhiemvu §9` nay bắt buộc hạ trùm chương 0
trước. *Bài kiểm nhảy cóc qua đoạn đầu game sẽ không bao giờ thấy cờ nào bật ở đoạn đầu game.*

### ☠ CỬA CƠ CHẾ MỞ Ở CẤP NÀO — hỏi TRƯỚC khi gate nó

**Lỗi nặng nhất từng có trong chuỗi này, và nó im lặng tuyệt đối.** `c4q3` (cấp 56) gate **Đại
Thành**. Nhưng `MASTERY_LV = 120` *và* `masteryOpen()` còn đòi `player.mongChiTon` — bảng Đại
Thành chỉ mở **SAU KHI xong 100% chính tuyến**.

⇒ `MOC_NV.mastery.dem()` đứng 0 vĩnh viễn · `mocTick` không bao giờ bật `done` · **chính tuyến
kẹt cứng ở ô 26/50**. Không một lỗi nào trên console, không bài kiểm nào đỏ, và bảng "bảy cửa
đang có người gác" ngay trong tài liệu này thì **sai từ lúc viết**.

**Luật rút ra: một cửa mở SAU chuỗi thì KHÔNG ô nào trong chuỗi gate được nó.** Trước khi khai
một `moc` mới, hỏi đủ hai câu — *đếm được không* **và** *mở ở cấp nào*. Câu thứ hai là câu đã bị
bỏ qua. `c4q3` nay gate **Box Kundun** (mở từ đầu game: rơi từ quái, mua ở tiệm).

**Bài kiểm gác: `tests/test_daochoi.js`** — đi HẾT mọi ô chính tuyến bằng chính `turnInQuest()`,
không nhảy cóc `questIdx`, và ở mỗi ô hỏi ba câu của người chơi: nhận được không · làm được
không · trả được không. Kèm phép lan **theo đường người chơi** (chỉ qua `GATES`) để bắt map
thành nội dung chết.

⚠ Ba lỗi GIẢ mà chính bài kiểm ấy đã đẻ ra trước khi đúng — cùng một bệnh, *đoán hình dạng dữ
liệu rồi tin kết quả*:
- `GATES` là **mảng phẳng** `{map,x,y,to}`, không phải từ điển theo map ⇒ phép lan không bao giờ
  ra khỏi thành, bài báo **73 lỗi giả** kể cả map khởi đầu.
- `trongDaGiac(dg, x, y)` — đa giác đứng **TRƯỚC**. Gọi `(x, y, dg)` thì mọi NPC đều "ngoài sàn".
- cửa `nangky` đọc `player.skillLv` (không phải `vhLv`), và **rỗng ở đó là ĐÚNG** — đó chính là
  việc nhiệm vụ bảo đi làm. Phải LÁI THẬT (đưa tài nguyên, gọi `upgradeSkillUI`) rồi mới đếm.

### 🗺 DỰNG LẠI MỘT MAP ⇒ QUÉT LẠI MỌI TOẠ ĐỘ CHÉP TAY TRÊN MAP ĐÓ

Bốn map dựng lại lên khổ lớn (`daohoa` 2600×1900 → 4600×3400). Hai thứ chép tay trên khổ cũ rơi
ra **ngoài đa giác sàn** và không lỗi nào báo:
- NPC `uomluong` ở `(200,200)` → phải chấm lại thành `(760,160)`;
- một bụi thuốc `loimon (2200,420)` → `(2260,420)`.

**Đừng nhân tỉ lệ — phải quét lại** bằng đúng bộ ràng buộc, vì đa giác sàn mới không phải bản
phóng to của cái cũ. Ngưỡng "cách điểm thả bao xa" cũng phải theo **đường chéo map**, không
phải một con số px cố định: dải 300-1100px hợp với khổ 2600×1900 thì trên 4600×3400 vẫn là ngay
cạnh chỗ vừa rơi xuống.

### 🔒 TRẠNG THÁI `full` CỦA PHỤ TUYẾN PHẢI CÓ NHÁNH RIÊNG

Đang cầm đủ `SIDE_TRAN` mục thì `sideAvail` trả `'full'`. Bảng Nhật Ký **không có nhánh cho nó**
nên nó rơi xuống nhánh khoá và hiện ra **`🔒 ??? cấp N`** — y hệt một mục chưa đủ cấp. Người chơi
cầm đủ 5 mục thì 27 mục còn lại đọc ra thành *"phải lên cấp nữa"*, dù đã vượt cấp đó từ lâu.
Bảng NPC thì có nhánh, nhưng chép cứng *"tối đa 3 phụ tuyến"* trong khi trần đã là 5.

### 📍 LOẠI NHIỆM VỤ `moc` — cửa cơ chế phải có người GÁC, không phải một câu nhắc

Đo được: chuỗi 46 nhiệm vụ có **70% là đánh quái**, và toàn bộ phần còn lại thì `enhance` gánh 7
chỗ — cùng MỘT nhiệm vụ "đập một món lên +N", khác đúng con số (`+3 +5 +6 +7 +9 +11 +11`, hai cái
cuối trùng). Đúng bệnh nhân bản mà mục chẩn đoán ở đầu tài liệu này nói tới.

⚠ **Và luật ở `docs/LORE_RUNE.md §6` mà chính tôi viết thì viết SAI:** *"không quá 60% là `kill`"*
— đếm đúng chữ `kill` ra 41% và luật PASS, trong khi chuỗi thật 70% là đánh (`tpkill` · `boss` ·
`tranai` cũng là đi giết, mà `tranai` còn là loại thêm SAU khi viết luật). **Một luật đếm hẹp hơn
ý định của nó thì tệ hơn không có luật: nó xanh và nó bảo đảm sai.** Luật đã sửa: đếm mọi loại
đánh, ≤60% toàn chuỗi và ≤70% mỗi chương. Số đo nay: **54% · cao nhất 67%**.

`MOC_NV` + `type:'moc'` là thứ kéo tỉ lệ xuống mà không phải thêm một `enhance` thứ tám:

- **MỘT loại, không năm loại.** Năm cửa cần gác (Vỉa Cốt · Rương Canh · Box Kundun · Khế Ước ·
  Đại Thành) đều cùng một hình dạng — "đã làm việc đó mấy lần rồi". Năm `type` là năm nhánh trong
  `killMob`, năm nhánh trong `questTarget`, năm nhánh trong bảng hiện tiến độ.
- ⚠ **`dem()` đếm từ TRẠNG THÁI, không từ sự kiện.** Móc vào chỗ "vừa mở rương" thì người chơi mở
  rương TRƯỚC khi nhận nhiệm vụ là nhiệm vụ **không bao giờ xong**, và họ không có cách nào biết
  vì sao. Đếm từ trạng thái thì nhận xong là nó đã đủ luôn — đúng như một nhiệm vụ "hãy chạm vào
  hệ thống này" nên hành xử.
- ⚠ **Nhịp kiểm ở `mocTick(dt)` trong `update()`, không móc vào sáu chỗ.** Mỗi chỗ móc thiếu là
  một nhiệm vụ không bao giờ xong.
- ⚠ **`player.hapMo` đếm ở `throwBaoHap`, KHÔNG ở `openBaoHap`.** Kéo-thả hạp ra màn hình — đường
  mà chính bảng Túi Đồ khuyên dùng — đi thẳng qua `throwBaoHap`. Móc ở `openBaoHap` là người chơi
  làm đúng lời khuyên thì nhiệm vụ không đếm.
- **§6 hứa một cửa "Tinh Luyện" — hứa sai:** đó là một NÚT trong bảng Đại Thành (`sr_tinhluyen`),
  không có hành động nào đếm được. Cửa đó đổi sang **Đại Thành**.

**Đã đổi theo:**
- `reqMain` gỡ khỏi **mọi** map. Map mở khoá bằng **cấp** (`md.min`) là đủ. Nhánh đọc `md.reqMain`
  trong `mapGate()` vẫn còn — cắm lại một giá trị là khoá sống lại. *Cân nhắc kỹ: khoá map sau
  một nhiệm vụ nghĩa là nhiệm vụ hỏng thì map mất.*
- ⚠ **Vòng lọc `MAPS[id].reqMain === questIdx` trong `turnInQuest()` đã GỠ.** `reqMain` không còn
  ở map nào nên mảng đó luôn rỗng, và hệ quả là **8/9 câu `REGION_UNLOCK_LORE` là nội dung chết**
  — kể cả bốn câu giới thiệu phiến Rune. Nay `travelTo()` bắn chúng theo **lần đầu đặt chân**
  (`!player.wpUnlocked[mapId]`, đọc TRƯỚC khi đặt cờ).
- ⚠ **Mốc trùm chương suy từ dữ liệu, không chép cứng.** Ba chỗ từng viết thẳng `questIdx >= 9`
  ("nhiệm vụ thứ 10") kèm một chú thích đã lạc ("boss Đào Hoa" — con đó nay ở Rẻo Rừng Corran).
  Nay là `QUEST_BOSS_IDX = QUESTS.findIndex(q => q.type === 'boss')`, fallback `Infinity` chứ
  không phải `-1` (vì `questIdx >= -1` là luôn đúng ⇒ trùm hiện ra từ cấp 1).

### 🐣 HƯỚNG DẪN TÂN THỦ — TRẦN THỜI GIAN KHÔNG ĐƯỢC ĐẨY NGƯỜI VÀO VIỆC BẤT KHẢ

`TUT_STEPS` (**7 bước**) · `tutTick` · `tutGhi` · `tutAdvance` · `tutLamDuoc`, trong `game.js`.
Gác: **`tests/test_tanthu.js`** (**8 mục**, **mọi cơ chế đã thử ngược và đều đỏ**).

#### ⚠ MỤC ③ TỪNG LÀ MỘT CÚ TUNG ĐỒNG XU — ba nguồn ngẫu nhiên trước một khẳng định TẤT ĐỊNH

Đỏ ~1/6 lượt khi máy bận, và nó im lặng theo kiểu tệ nhất: cùng một commit xanh trên `main` mà
đỏ trên `release`. Thông điệp chỉ nói `… → than → than · mong … → than → TAT`, tức người đọc
phải **đoán** bước cuối hỏng vì cơ chế hay vì con quái không kịp đánh đủ ba đòn.

Nguyên nhân: `hurtPlayer` có **HAI cửa `Math.random()` đứng TRƯỚC** dòng đếm `_tutHe` —
`m.blindT && rnd < 0.5` rồi `rnd < player.eva` — và cả hai **bỏ qua nguyên khối sát thương**,
tức bỏ qua luôn phép đếm. Cộng thêm chuyện người chơi **đánh trả** trong `update()` nên con quái
vừa ghim có thể chết, và `mobs.find` lượt sau bốc một con đang ở xa.

⇒ Cảnh đo ghim `player.eva = 0` · `q.blindT = 0` · `q.hp = q.maxHp`, rồi **trả lại `eva`**.
⚠ Việc ấy **KHÔNG làm mệnh đề yếu đi**: thứ mục ③ gác là SỢI DÂY `hurtPlayer` → `heThuKet` →
`_tutHe`, và đòn vẫn phải đi trọn đường ấy. Cái bị gỡ là né tránh và cái chết của con quái —
hai thứ chẳng liên quan tới sợi dây đó. Đây là nới **MẪU**, không phải nới **NGƯỠNG**.

Thử ngược (`player.eva = 0.97`) dựng lại **đúng từng chữ** thông điệp gốc ⇒ chẩn đoán đúng chứ
không phải đoán.

**Và bài học lớn hơn cái lỗi: chốt tự kiểm phải IN RA CON SỐ.** Nay nó nói `_tutHe 0 → 1`. Bản
cũ không in gì, nên lượt đỏ đầu tiên tốn nguyên một vòng dựng worktree ở commit cũ mới loại được
giả thuyết "hồi quy của đợt đang làm". *Một con số trong thông báo rẻ hơn hẳn một vòng chẩn đoán.*

#### ⑦ BƯỚC `than` — CHUỖI HƯỚNG DẪN TỪNG KHÔNG NHẮC TRỤC AXIE LẤY MỘT CHỮ

Thể lệ chấm **Axie Core 35%**, và trục phòng thủ (`heThuKet`) là thứ gánh nó. Đếm lại các cửa
nói ra trục ấy thì có 8 kênh — mà **chuỗi hướng dẫn, thứ người chơi mới đọc ĐẦU TIÊN, không
có kênh nào**. `grep` sáu bước cũ cho **0** lần nhắc `Axie` lẫn `hệ`. *Một cơ chế chiếm 35%
barem mà chuỗi mở đầu không trỏ tới lấy một lần thì với người chơi mới nó ngang không tồn tại.*

| | |
|---|---|
| bộ đếm | **`player._tutHe`** — cộng trong `hurtPlayer`, ngay sau nhánh `heThuKet` |
| `xong` | `_tutHe >= 3` — ăn đủ ba đòn trên đất CÓ hệ trội |
| `duocO` | `mapBanSac(curMap).he` có thật — trong thành thì bỏ qua, không treo |

**⚠ ĐẾM Ở CHỖ ÁP HỆ SỐ, ĐỪNG ĐẾM Ở CHỖ BẮN SỐ BAY.** Số bay có hồi `HE_FLOAT_HOI` 2,6 giây và
**cố ý bỏ qua nhánh trung tính**, nên lấy nó làm điều kiện là bước này **không bao giờ xong**
với người đang đeo một con trung tính ở đất đó — đúng cái kiểu bất khả mà `duocO` sinh ra để
chặn. `_hek` có mặt nghĩa là trục phòng thủ ĐÃ được hỏi cho cú đòn ấy, dù nhánh nào.

**⚠ BƯỚC ĐỨNG SAU `panel`, KHÔNG ĐỨNG TRƯỚC.** Nó bảo người chơi "đổi thân ở Khế Ước trong
bảng Nhân Vật" — mà bảng Nhân Vật là thứ bước `panel` vừa dạy mở. Đặt trước là chỉ đường tới
một cái cửa chưa ai nói là có.

**⚠ VÀ MÀN TẠO NHÂN VẬT ĐANG DẠY NGƯỢC LẠI.** `ccAvaRender()` ghi *"Chỉ là hình dáng"* — tức
đúng câu thể lệ trừ điểm (*"appear only as a cosmetic skin"*), ở đúng màn đầu tiên người ta
đọc. Nửa "0 chỉ số" thì đúng và phải giữ; nửa "lớp của con Axie quyết định hệ PHÒNG THỦ" thì
bị bỏ mất. Nay nói đủ cả hai. `test_tanthu ⑥b` gác: chữ của chuỗi hướng dẫn phải nhắc `Axie`
hoặc `hệ`, nếu không thì cả bước này là một cái nhãn rỗng.

**⚠⚠ CÁI TRẦN 90 GIÂY ĐẺ RA MỘT LỖI TỆ HƠN THỨ NÓ CHỮA.** Trần sinh ra vì bước cũ treo mãi
("còn nguyên ở cấp 120") — đúng vấn đề, sai thuốc: hết giờ thì nó **đẩy sang bước kế** bất kể
bước ấy có làm được ở chỗ người chơi đang đứng hay không. Đo được, đứng YÊN trong thành từ giây 0:

```
90s → npc · 180s → map · 270s → kill · 360s → loot → quest · 385s → "Hướng dẫn hoàn tất"
```

Nặng nhất là mốc 270: hộp nói *"Nhấn SPACE — hạ 1 con Axie Heo Rừng"* trong khi
`packsOf('ardhaven').length === 0`. Bấm SPACE 90 lần trong 67 giây rồi bật AUTO 3 phút ⇒
`kills 0 · xp 0 · bạc 0`, toạ độ không nhích một pixel, và game không nói một câu nào. Rồi ở
giây 385 nó tự **tuyên bố hoàn tất** cho một người chưa đi, chưa nói, chưa đánh gì.

⇒ **`duocO()`** — bước này làm được ở đây không, hỏi qua cửa duy nhất `tutLamDuoc(s)`. **Chỉ gác
nhánh HẾT GIỜ**; tiến bộ THẬT (`xong`) thì luôn được đi tiếp — hỏi `duocO` ở đường LÀM XONG là
có ngày bỏ qua vĩnh viễn bước `kill` vì một cuộc đua khung hình với `buildWorld`. Hết giờ thì
**bỏ qua mọi bước bất khả ở chỗ đang đứng**; hết bước làm được thì đóng hẳn. Nay đứng yên trong
thành ra `npc → map → panel → ĐÓNG`, không còn chạm vào `kill`/`loot`.
⚠ `tutLamDuoc` trả **`true`** khi `duocO()` ném — đo hỏng thì đừng khoá hướng dẫn của người ta lại.
⚠ **`player._tutHetGio` — hết giờ dù MỘT lần thì cuối chuỗi TẮT LẶNG LẼ.** Không có cờ này thì
người ngồi yên trong thành vẫn trôi hết sáu bước bằng trần thời gian rồi được báo *"Hướng dẫn hoàn
tất"* — đúng cái mốc 385 giây ở trên. `test_tanthu ②` gác.
⚠ **`duocO` của `kill`/`loot` đọc `packsOf(curMap)`, không đọc `mobs.length`.** Vừa dọn sạch một
bãi thì `mobs` rỗng vài giây trong khi map vẫn có quái để đánh. `packsOf` là cửa đọc chính chủ của
dữ liệu map, không phải một bản sao thứ hai.

**⚠ CỜ TRẠNG THÁI, KHÔNG PHẢI SỰ KIỆN — `TUT_CO` + `tutGhi(key)`.** `tutAdvance` chỉ ăn khi đang
đứng ĐÚNG bước ấy, nên ai nói chuyện / nhặt đồ / mở bảng TRƯỚC lúc hộp trôi tới bước đó sẽ kẹt
lại đủ 90 giây ở một việc đã làm xong. Cùng luật đã ghi cho `MOC_NV.dem()`. Ba cờ:
`tutNoi` (`tryTalk`) · `tutNhat` (`takeLoot`) · `tutBang` (`togglePanel('char')`).

**Bốn thứ khác cùng đợt, mỗi thứ im lặng một kiểu:**

| | đã hỏng thế nào |
|---|---|
| bước `npc` bảo *"gặp **Trưởng Lão Rell** … nhận nhiệm vụ đầu tiên"* | SAI cả ba vế: `c0q1` đã `active` từ giây 0; người giao là **Lính Gác Cổng Tây** (`ah_gac_tay`, cách điểm thả 2540px) còn Rell (cách 300px) tới cấp 14 mới có `c1q1` — đo `npcMark()`: Gác Tây ra `…`, Rell ra chuỗi RỖNG; và `xong` là `level >= 3`, chẳng dính gì tới nói chuyện. Nay dạy **cái dấu trên đầu NPC**, thứ luôn đúng dù ai giao gì |
| bước `loot` khai `xong: inv.length > 0` | nhân vật vừa tạo ĐÃ CÓ đồ khởi đầu ⇒ nó và bước kế cùng nhảy trong MỘT nhịp (đo: cả hai ở giây 360,1). Cả bước dạy nhặt đồ **chưa từng hiện ra một lần nào** |
| hai lời gọi `tutAdvance('panel')` trong `togglePanel` | **không bước nào mang khoá `panel`** (bước cuối là `quest`) ⇒ hai lời gọi chết, và bước cuối không có hành động nào đóng được nó. Nay bước cuối LÀ `panel` |
| hai khối chép **chỉ số cứng** trong `update()` | `tutStep === 0` cộng quãng đường lần thứ HAI (tutTick đã cộng theo toạ độ thật, và nó đếm được cả AUTO lẫn bấm bản đồ nhỏ) ⇒ bước 1 chạy gấp đôi; `tutStep === 4` gọi `tutAdvance('quest')` trong khi ô thứ 4 nay mang khoá `loot` ⇒ không bao giờ khớp. **Chỉ số cứng vào một mảng khai ở chỗ khác là một quả mìn hẹn giờ cho đợt thêm/bớt bước kế tiếp** |

**⚠ VÀ MỘT CỜ CẤP `window` SỐNG SÓT QUA LƯỢT DỰNG LẠI NGƯỜI CHƠI:** `trackerHtml()` chỉ ghim đèn
hiệu khi `window._beaconQuestId !== q.id`, mà cờ đó không ai đặt lại ⇒ nhân vật thứ hai dựng
trong cùng một trang có `player.beacon` đứng `null`: mất cả dải **"Đi ngay"** lẫn mũi tên định
hướng — đúng cái dải mà bước 3 của hướng dẫn trỏ vào. Hôm nay mọi đường đổi nhân vật đều
`location.reload()` nên chưa ai gặp; xoá một lời gọi reload là gặp ngay. `startGame()` nay đặt
lại. Cùng họ với dòng `loadGame()` từng nuốt thanh chiêu người chơi tự gán.

**⚠ LỖI CỦA CHÍNH BÀI KIỂM, ghi lại vì nó cho một mệnh đề XANH VÔ NGHĨA:** mục ⑤ đặt
`player.x += 200` rồi tick MỘT lượt — mà `tutTick` cộng quãng đường theo HIỆU hai khung và khung
đầu chỉ ghi mốc, nên nó cộng **đúng 0**. Người chơi kẹt ở `move` suốt, và mệnh đề *"không kẹt ở
npc"* xanh vì một lý do chẳng liên quan gì tới cờ trạng thái. Phép thử ngược lộ ra. Nay dời qua
nhiều khung và **tự kiểm** là đã rời bước `move` trước khi chấm.

### 🧭 NỐI MAP BẰNG RÌA (B1) + ĐIỂM DỊCH CHUYỂN MỞ BẰNG ĐI BỘ (B2)

**⚠ Đây trước hết là một BẢN VÁ LỖI.** Trước bản này, **Bug Tribe Tunnels (40) · Reptile Sunstone Flats (80) ·
Dusk Marsh (100) không có lối vào nào** cho một nhân vật mới:
- `GATES` chỉ có bốn cổng thành + cổng Outskirts về thành ⇒ đi bộ chỉ tới được 5/8 vùng;
- nút **Dịch Chuyển** chỉ hiện khi `player.wpUnlocked[id]`, mà cờ đó chỉ bật **khi đã tới** map
  đó. Chưa tới được thì không bao giờ mở. Ba vùng cuối là **nội dung chết**.

**⚠ BÀI HỌC VỀ CÁCH ĐO — tôi đã kết luận nhầm đúng lỗi này một lần.** Gọi `travelTo('mongco')`
từ console thì chạy ngon, vì nó là hàm, không qua cửa nào. Phải lan theo **đường người chơi**:
chỉ đi qua `GATES`, và chỉ dịch chuyển tới nơi `wpUnlocked`. `test_noimap.js` §1 đo đúng kiểu đó.

**⚠ HÌNH HỌC DO TRÙM VÙNG QUYẾT ĐỊNH, KHÔNG DO LA BÀN.** Luật có sẵn (`test_bossplace`): mọi
**điểm thả** phải cách Trùm Vùng ≥700px (260 truy đuổi + lề). Quét cả bốn rìa từng vùng theo
đúng luật đó thì **Bird Tribe Heights không còn chỗ nào trên cả bốn rìa** — bốn con trùm phủ kín.
Nên chuỗi đi **vòng qua** Bird Tribe Heights, và Bird Tribe Heights vẫn vào thẳng bằng cổng Bắc của thành:

`Werebear Woods(20) ─Bắc→ Bug Tribe Tunnels(40) ─Bắc→ Reptile Sunstone Flats(80) ─Đông→ Dusk Marsh(100)`

Tên lối ghi **hướng trên chính map đang đứng** (đi ra hướng nào), nên luôn đúng với thứ người
chơi thấy và không hứa gì về vị trí tương đối giữa hai map. Đi qua lối rìa thì hiện ra **ngay
cạnh cổng về** (`spawnFrom` trong `data/canbang.js`) — quay đầu là đi ngược lại được ngay.

⚠ Khi thêm lối rìa mới: **quét bằng máy, đừng đoán toạ độ.** Ràng buộc là cổng *và* điểm tới đều
phải đi được, cách bãi quái / Rương Canh / NPC / điểm thả, và cách Trùm Vùng ≥720px.

**Cũng vá luôn:** ba cổng thành Bắc/Tây/Đông **vốn là một chiều** — sang Plant Tribe Glade /
Werebear Woods / Bird Tribe Heights rồi không có cổng nào về. Nay đủ đường về, đặt cạnh chính điểm thả.

**B2:** cờ `wpUnlocked` đã tự bật khi tới map từ trước, nhưng **lời gợi ý nói sai** — nó bảo
"cần được nhiệm vụ dẫn tới đó", trong khi nhiệm vụ đã gỡ sạch. Nay nói đúng: **tự đi bộ tới một
lần là mở**. Bảng Bản Đồ thêm dòng `🧭 Đi bộ:` cho từng vùng, **suy thẳng từ `GATES`** qua
`langGieng()` — đừng chép cứng một bảng láng giềng thứ hai, nó sẽ nói dối ngay lần đầu ai đó
thêm cổng mà quên sửa.

### 🎥 Camera mặc định là **xa** (`zoom:'xa'`, 1,0×)

Chủ dự án chốt sau khi chơi thử: vào game phải thấy rộng. Trước đó để `'vua'` (1,45×). Đổi ở
**hai** chỗ, thiếu một là lệch nhau: `let ZOOM_CHON = 'xa'` (giá trị trước khi `SETTINGS` khai)
và `zoom:'xa'` trong `SETTINGS`. Người chơi vẫn đổi được ở Cài Đặt và lựa chọn đó được lưu.

### ⛰ TRỤ ĐÁ ĐÃ GỠ — và địa hình cỡ trận đánh đang là VIỆC CÒN NỢ

Từng có `raiTruDa()` dựng vành đá quanh mỗi bãi quái và rào ngắn giữa hai bãi, để có thứ mà kite.
**Ý định đúng, thực thi sai:** nó không có tranh riêng mà dùng lại chính sprite đá trang trí rồi
**phóng to ~3 lần** (`s ≈ 3,1` so với `0,6–1,4`). Phóng to một sprite lên ba lần thì ra khối hộp
bẹt viền cứng, chọi hẳn với nền tranh sáng của Axie. Chủ dự án nhìn ảnh chụp và yêu cầu gỡ.

**Cái giá, đo được, không giấu — nhưng cũng đừng nói quá:** vật che trung bình 44,8% → **30,0%**,
tức phần lớn map vẫn còn địa hình. Thiệt hại dồn vào **một** chỗ: Reptile Sunstone Flats (map trống nhất,
90,9% đi được) tụt còn **9%**, và Bug Tribe Tunnels từ ≥4 tuyến phải đi vòng còn **1/66**.
Vì vậy `SAN_CHE` trong `test_domap.js` hạ 18 → **8** và ngưỡng `phaiVong` trong
`test_obstacles.js` hạ 2 → **1**. Cả hai là **bánh cóc tạm**, có ghi chú tại chỗ. Khi có tranh
khối đá thật thì kéo lại và xoá ghi chú.

**⚠ ĐỪNG DỰNG LẠI BẰNG CÁCH PHÓNG TO SPRITE.** Đây là lần thứ hai cùng một bài học: trước đó đã
chữa vấn đề bố cục bằng lớp phủ tối và cũng phải gỡ. *Đừng chữa vấn đề thị giác bằng cách kéo
giãn hoặc đè màu lên tài nguyên có sẵn — phải có tranh đúng cho việc đó.*

### ▦ MIỀN DÂN SỐ (A4) — `md.packs` nay là KẾT QUẢ, không phải nguồn

Đây là một cuộc **thay móng**, đọc kỹ trước khi chạm vào bãi quái.

Dữ liệu map không còn `packs: [{x,y,n}…]`. Nó khai **`vung`**: mỗi miền là một **dải khoảng
cách** (`dai`, tỉ lệ của `voi`) × một **cung góc** (`cung`, độ) quanh điểm thả, mang một dân số.
`banRaiVung()` bung nó thành các cụm trại.

**Vì sao mô hình này chứ không phải hộp toạ độ:** đo trước khi làm thì cả bảy map ngoài trời
VỐN ĐÃ là một gradient theo khoảng cách — cấp quái tăng đơn điệu theo `d(spawn)` ở cả 7/7 map,
và góc rải rất hẹp vì điểm thả nằm ở góc/mép. Cái đó trước nay chỉ nằm trong đầu người đặt toạ
độ và trong một dòng chú thích. A4 đưa nó thành dữ liệu.

**⚠ CÁC DẢI `dai` KHÔNG ĐƯỢC CHỒNG NHAU.** Vị trí cụm = `t × voi` nên dải không chồng ⇒ thứ tự
cấp theo khoảng cách là **đảm bảo tuyệt đối**. Bản đầu tôi để chúng chồng nhau và gradient hỏng
ngay: `daohoa` sinh ra một cụm C6 đứng gần hơn một cụm C4 đúng 1px. `test_vung.js §2` khoá lại.

**⚠ Cụm phải TRÁNH Trùm Vùng.** Trùm là điểm cố định (toạ độ tỉ lệ trong `BOSS_DEFS`) và đã có
hẳn một đợt việc riêng để dời chúng ra khỏi bãi quái. Cụm sinh ra SAU nên chính cụm phải tránh —
quên một lần là 13 con trùm nằm đè lên tâm bãi trở lại (`test_bossplace` bắt được).

**⚠ Đọc bãi quái của map nào cũng phải qua `packsOf(id)` / `packsMd(md)`.** Đọc thẳng
`md.packs` của map chưa ai vào thì nó còn `undefined` và `.map(...)` ném lỗi — đã dẫm đúng bẫy
này với ba bài kiểm. Đã bịt ở gốc bằng `bungMoiVung()` gọi trong `startGame`, nhưng vẫn dùng
`packsOf` cho đúng.

**Bố cục CỐ ĐỊNH, hạt bốc từ TÊN MAP.** Thế giới này chỉ nên có **đúng một** bộ phận biết đi:
Vỉa Cốt. Rương Canh đứng yên để học thuộc được, trại quái cũng vậy — cho trại chạy mỗi ngày là
vừa phá mốc định hướng vừa làm Vỉa Cốt hết đặc biệt.

Được thêm: cụm to nhỏ khác nhau (dân số chia lệch, không đều tăm tắp), một miền mang **nhiều
vai** (cùng loài, cụm này Xạ Thủ cụm kia Pháp Sư — đúng cơ chế A1), và bảng **Chọn Trận** gom
theo miền thay vì một danh sách phẳng. QA: `window.debugVung(map)`.

### 🔥 ĐỒ TRẠI CỦA BÃI FARM — và **BẢNG SINH RA MỘT NƠI, GAME ĐỌC MỘT NƠI KHÁC**

Bãi Farm có tên trên bảng Bản Đồ, quái dày, rơi đậm — nhưng đứng trong map mà nhìn thì nó giống
hệt ba trại quái thường đứng gần nhau. Trong MU, một *spot* nhận ra bằng **mắt** trước khi nhận
ra bằng bảng. `traiFarmDung()` rải đống lửa · lều · thùng · cọc treo vải quanh mỗi trại farm,
bốc theo **toạ độ trại** nên đứng yên. Đồ trại là decor `type:'iso'` ⇒ **không sinh vật cản** —
đây là chỗ đánh nhau, vấp phải một cái thùng là lỗi chứ không phải địa hình.

**Ngọn lửa KHÔNG nướng vào tranh.** Tranh chỉ có đống củi tàn; phần sáng do `veTraiLua()` vẽ đè
bằng cộng sáng, vẽ **sau** lớp entity chứ không nằm trong danh sách xếp lớp theo y — nó là *ánh
sáng*, mà ánh sáng hắt lên cả thứ đứng trước lẫn thứ đứng sau.

**⚠ BẢNG MÀU ĐỒ TRẠI PHẢI NO MÀU BẰNG NỀN.** Bản đầu lấy tông thực tế (vải 0,74/0,66/0,48) và
nướng ra một cái lều **xám**: cạnh viên cỏ kẹo (0,44/0,62/0,30) nó đọc thành một tảng đá. Cùng
bài học đã ghi trong `nuong_tile.main()` — *bảng màu KẸO, lấy thẳng từ tranh Axie*.

---

**⚠⚠ LỖI TO NHẤT PHÁT HIỆN TRONG ĐỢT NÀY, VÀ NÓ ĐÃ SỐNG NHIỀU PHIÊN:**

`ISO_NEO` (toạ độ CHÂN từng sprite lát viên) do đường nướng ghi ra `assets/iso/iso.js`, rồi phải
**chép tay** sang `data/iso.js` — tệp mà `index.html` thật sự nạp. Bước chép tay bị quên một lần.
Cái giá:

> **Sáu map — `daohoa` · `chungnam` · `comoc` · `tuyettinh` · `mongco` · `nhanmon` — khai cây/bụi
> theo biome mà `veVatIso()` `return` sớm vì không tra được neo, nên KHÔNG VẼ MỘT CÁI CÂY NÀO.**

Cả đợt việc "cây/đá theo biome" nằm im trong kho. Không lỗi nào in ra, không bài kiểm nào đỏ, và
ảnh chụp vẫn ra một map — chỉ là một map trống. `data/iso.js` có **15** sprite trong khi bộ nướng
đã xuất **60**.

Đã chữa **ở gốc, không ở triệu chứng**: `ghi_neo()` trong `tools/iso/nuong_tile.py` ghi thẳng vào
`public/game/data/iso.js`; cả `nuong_biome.py` lẫn `nuong_trai.py` gọi chung hàm đó;
`assets/iso/iso.js` **đã xoá** để không còn tệp mồi. `assets/iso/neo.json` giữ lại cho công cụ.

Gác: `tests/test_isoneo.js`, **hai tầng** — vì tầng đối chiếu tên không bắt được mọi kiểu hỏng:
1. mọi tên sprite mà `MAPS`/engine nhắc tới đều có neo, và mọi neo đều có tệp PNG;
2. **tầng hành vi**: mỗi map `sanIso` phải rải ≥40 vật thể và **tất cả** phải vẽ được. Đây là
   tầng bắt đúng lỗi đã xảy ra — nếu `veVatIso` hỏng vì lý do khác thì tầng 1 vẫn xanh.

*Luật chung rút ra: **bảng sinh tự động chỉ được có MỘT tệp đích, và tệp đích phải là tệp mà sản
phẩm thật sự nạp.*** Mọi bước "rồi chép sang…" là một bước sẽ bị quên, và kiểu quên đó im lặng.

### ⚠ LÙM CHẶN TỪNG NUỐT MẤT RƯƠNG CANH — bộ lọc `_keep` KHÔNG che được nó

Đo được, không phải lo xa: **4/40 Rương Canh và 1/3 Vỉa Cốt nằm LỌT trong một lùm chặn**
(`daohoa` 1 · `ngoai` 1 · `mongco` 2 rương + 1 vỉa). Lùm chặn là khối **150×88**; rương chỉ mở
được khi người chơi vào trong `RUONG_TAM` = 54px, mà `player.ruong` là **một-lần-trong-đời** ⇒
rương nằm giữa lùm là rương **không bao giờ mở được**, vĩnh viễn, cho nhân vật đó. Nội dung bị
xoá sổ trong im lặng: không lỗi, không thông báo, không bài kiểm nào đỏ.

**Vì sao `_keep` không cứu:** nó lọc mảng `decor`, mà lùm sinh ra **sau** nó — `raiIso()` chạy
sau bộ lọc (đúng theo thiết kế, xem ghi chú tại chỗ) và đẻ thẳng vào `decorObsCum`. `raiCum()`
vốn đã có danh sách tránh riêng của nó, chỉ là thiếu ba vật thể thế giới đứng một chỗ. Nay có đủ:
rương 260 · vỉa 240 · bãi cỏ đàn thú 260. Giá phải trả: ~156 → ~141 lùm trên toàn bộ 12 map.

**⚠ Ba hàm ấy đều CÓ NHỚ và phải được hâm lúc `decorObs` còn rỗng.** Khối `_keep` ở `buildWorld`
gọi cả ba, và nó nằm **trên** `raiIso` — nên chúng bốc vị trí từ vật cản TĨNH. Dời chỗ hâm đó
xuống dưới `raiIso` là bố cục đổi theo từng lần vào map, mà `thuBaiCo`/`ruongCuaMap` thì cả thiết
kế dựa vào chuyện chúng **không bao giờ đổi chỗ**.

**⚠ Đo phải SAU `travelTo`.** `obstaclesOf()` chỉ nối decor của map ĐANG ĐỨNG, nên đo rương của
một map chưa vào thì chỉ thấy vật cản tĩnh — và đúng cái thứ gây lỗi lại là thứ bị bỏ sót.
Gác: `tests/test_ruong.js §8`.

### 🐑 ĐÀN THÚ HOANG — thứ trong map KHÔNG phải để đánh

Đo trước khi làm: **mọi thứ cựa quậy** trong một map ngoài trời đều muốn giết người chơi (quái ·
du hiệp · trùm vùng · trại canh Rương), còn cây và đá thì đứng im tuyệt đối. Nên một vùng hoang
đọc ra là *một cái sân có mấy bầy địch*, không đọc ra là **một nơi chốn**. Đàn thú là bằng chứng
duy nhất rằng thế giới có sống trước khi người chơi tới.

Khai bằng dữ liệu, một dòng trong `MAPS`: `thu: { loai:[…], dan: 13-15 }`. **Đủ 7/7 map hoang
dã**, 17 loài nướng từ 17 rig Spine, ~2 MB nhưng **nạp lười theo map** (3 bảng ≈ 330 KB mỗi map).

| map | tộc | loài (loài ĐẦU là loài chủ đạo) |
|---|---|---|
| `ngoai` | beast | cuu_bong · bo_dom · soc_hat |
| `daohoa` | plant | reu_xanh · hoa_cam · bong_sang |
| `chungnam` | beast | cam_la · nanh_tia · reu_xanh |
| `comoc` | bug | bo_giap · bo_nam · reu_xanh |
| `tuyettinh` | bird | chim_hong · bang_lam · long_trang |
| `mongco` | reptile | than_tia · than_gai · cam_la |
| `nhanmon` | dusk | dam_va · dam_dom · bo_nam |

**Loài trùng giữa hai map là CỐ Ý** (rêu ở ba map, cam lá ở hai): sinh cảnh chồng nhau thì thật
hơn bảy tập loài rời nhau tăm tắp, và mỗi map vẫn có loài chủ đạo riêng.

**`thuChiaLoai()` chia dân số theo trọng số `1 · 0,7 · 0,49`** — loài đầu chiếm khoảng một nửa
đàn. Chia đều `loai[i % n]` thì mỗi đàn là ba nhóm bằng nhau, đọc ra *một bộ sưu tập* chứ không
ra *một đàn có loài chủ đạo* — mà "loài chủ đạo" chính là thứ `mapBanSac()` đã hứa trên bảng Bản
Đồ. ⚠ Và phải chèn XEN KẼ: dồn loài đầu vào nửa trước mảng thì chúng cũng bốc chỗ đứng trước, và
đàn tách thành hai mảng màu.

**⚠ MÀU CỦA ĐÀN PHẢI TƯƠNG PHẢN VỚI SÀN, và chỉ ẢNH CHỤP mới nói được.** Bird Tribe Heights bản
đầu để `long_trang` (thú lông trắng) đứng đầu — nghe thì hợp vùng tuyết, chụp ra thì **cả đàn
tàng hình**: nền tuyết sáng, con trắng, không còn đường viền nào. Đúng cái bẫy đã ghi ở khối map
isometric (*"mặt phẳng sáng đều không mốc thì đọc ra khoảng không"*), chỉ khác là lần này nó ăn
vào con vật chứ không ăn vào mặt đất. Nay chim hồng đứng đầu, lông trắng lui xuống cuối.

**⚠ DÙNG RIG `-1`, KHÔNG DÙNG RIG GỐC.** `pve-starters.json` ghi rõ *"-1 folders are body stage 1
(awakened)"*. 16 rig **gốc** đã bị `nuong_chi.py` lấy làm 16 Chimera đồng hành; lấy lại chính
chúng làm thú nền thì con thú gặm cỏ ngoài đồng trông y hệt con Chimera đang đi cạnh người chơi.

**⚠ LỚP AXIE TRA TỪ `Catalogs/pve-starters.json`, đừng đoán theo màu.** Trường `class` là số
(0 beast · 1 bug · 2 bird · 3 plant · 4 aquatic · 5 reptile · 6 mech · 7 dawn · 8 dusk) và
**lớp 0 bị lược đi** — năm con không có trường `class` đều là beast, không phải thiếu dữ liệu.

**⚠ ĐỪNG BIẾN NÓ THÀNH NỘI DUNG.** Cho săn được là nó thành một bãi quái yếu, mà bãi quái yếu
thì AUTO dọn sạch trong một phút — mất cả cái nền lẫn cái nội dung. Nó **không** có máu, **không**
nằm trong `mobs`, **không** bị nhắm, **không** rơi gì. Giá trị của nó nằm đúng ở chỗ nó vô dụng.

Cái làm đàn thú "sống" không phải hoạt ảnh mà là **hai hành vi**:
- mỗi con tự đổi việc đang làm (gặm · đứng ngó · đi vài bước) theo nhịp riêng;
- và cả đàn **bỏ chạy LÂY NHAU thành SÓNG**. Lây một vòng từ những con thấy người chơi thì con ở
  rìa xa không bao giờ động đậy — người chơi thấy "mấy con gần mình chạy", không thấy "cả đàn
  giật mình". Nên con vừa hoảng vì lây cũng vào hàng đợi; vòng tự dừng vì `st==='chay'` là cửa vào.
- Lây phải chạy ở **lượt riêng**, sau vòng cập nhật. Lây tại chỗ thì con cuối mảng nhận sóng ngay
  trong khung này còn con đầu mảng đợi khung sau ⇒ cả đàn nghiêng theo **thứ tự mảng**, thứ chẳng
  có nghĩa gì trên màn hình.

**Bãi cỏ đứng yên, từng con thì không.** Bãi bốc từ *tên map* (như Rương Canh) nên là mốc định
hướng; vị trí từng con bốc lại mỗi lần vào map, vì một con vật đứng đúng một chỗ qua nhiều phiên
đọc ra là một bức tượng. Vỉa Cốt vẫn là thứ **duy nhất** được phép đổi chỗ theo ngày.

**⚠ `thuDungDan()` phải gọi SAU khi rải decor**, không trước. Cây/đá rải sau mọc đè lên con vật
đã đứng sẵn — đo được **3/14** con nằm trong vật cản, mà con nằm trong vật cản thì bước đầu tiên
bị chặn nên nó đứng chết một chỗ suốt phiên, hỏng đúng cái thứ duy nhất hệ này có.

Art: `tools/spine/nuong_thu.py` nướng từ rig Spine của kit Axie — cùng đường ống với
`nuong_chi.py`. Ba loài chọn theo **bóng dáng** (cừu xù · bò đốm · sóc đuôi cong) để ở cỡ 48px
vẫn đọc ra ba con khác nhau; ba dáng (`gam` · `dung` · `chay`), mỗi dáng 8 khung, tổng **0,35 MB**.

**⚠ BỐN TRONG 38 RIG HỎNG khi mượn hoạt cảnh** (`14 · 14-1 · 20 · 20-1`): mất hẳn phần thân, chỉ
còn mấy mảnh phụ kiện trôi lơ lửng. Quét bằng **độ đặc** (điểm ảnh đặc ÷ diện tích hộp bao) ở
khung idle — 34 rig lành ra 0,52-0,78, bốn rig hỏng ra 0,25-0,31, hai cụm tách hẳn nhau.
`python3 tools/spine/nuong_thu.py --quet` in lại bảng đó. **Đừng chọn rig bằng mắt trên ảnh thu
nhỏ**: ở cỡ 60px một con mất thân trông vẫn "có gì đó".

Gác: `tests/test_danthu.js` (9 mệnh đề, quét **mọi** map khai `thu`). Hai mệnh đề đáng nhớ:
- ⑤ **tự kiểm cảnh dựng trước khi chấm** — khẳng định con cuối hàng cách người chơi > `THU_SO`
  rồi mới đòi nó phải chạy, nếu không thì bài "kiểm sóng lây" chỉ kiểm chuyện con đó nhìn thấy
  người chơi.
- ⑧ mọi loài khai trong dữ liệu phải có **hình học trong `THU_ANH`** VÀ có **tệp `.webp`**. Không
  thừa: `veThu()` `return` sớm khi thiếu một trong hai — **đúng cái cách `veVatIso()` đã làm sáu
  map mất sạch cây mà không bài nào đỏ**.

### ◈ BÃI FARM — khái niệm "spot" của MU, và **HẠ SÀN KHÔNG PHẢI LÀ ĐẶT TRẦN**

Một miền dân số khai `farm:true` là thành Bãi Farm. Không bảng thứ hai, không toạ độ chép cứng —
cùng lý do `mapBanSac()` suy từ `packs`. Hiện có **một** chỗ: `bandit_vet` / *Trại Cựu Binh Gloam*
ở Beast Herd Camp (`ngoai`).

Bốn tính chất, **thiếu một là nó tụt về một bãi thường mang tên đẹp** — và kiểu hỏng đó người
chơi không mô tả được, họ chỉ thấy "chỗ này chán":

| | | máy làm ở đâu |
|---|---|---|
| ① DÀY | trại sát nhau, kéo liên tục | `VUNG_CUM_CACH_FARM` **+ `VUNG_FARM_BAN`** |
| ② ĐÁNG | rơi đồ và Lumen ×1,6 | `FARM_THUONG` trong `computeKillRewards` |
| ③ CÓ TÊN | bảng Bản Đồ gọi thẳng tên | `banSacHtml()` |
| ④ TỚI ĐƯỢC | miền GIỮA, không phải miền xa nhất | `dai:[0.41,0.52]` trong dữ liệu |

**⚠ Bản đầu của ① KHÔNG LÀM GÌ CẢ, và đo mới biết.** Tôi hạ sàn giãn cách 300 → 190 rồi tưởng
xong. Nhưng sàn chỉ **cho phép** gần, chỗ đặt trại vẫn bốc ngẫu nhiên trong cả dải×cung. Đo ra
ba trại cách nhau 266 · 826 · 638 (TB **577**), trong khi miền thường cùng map ra 426 và 623 —
tức bãi farm còn **thưa hơn** một bãi thường. Phải thêm **trần**: mọi trại nằm trong
`VUNG_FARM_BAN` quanh trại ĐẦU của miền (`datMien[0]`, khác `daDat` vốn gom cả map). Sau khi thêm:
266 · 343 · 268, TB **292**, bán kính trại 118 ⇒ ba trại chạm nhau. *Luật chung: ràng buộc dạng
"tối thiểu" không bao giờ tạo ra được hình dạng; nó chỉ loại bớt hình dạng.*

**⚠ BA PHÉP ĐO ĐÃ THỬ, HAI CÁI MÙ.** Đừng lặp lại:

| đo gì | ra gì | vì sao mù |
|---|---|---|
| `n/(πr²)` từng trại | 0,16 vs 0,13 | `r = 90 + n*4` ⇒ mật độ trong trại gần như hằng số |
| con/1000px² trên hộp bao miền | 0,03 vs 0,02 (miền thường có cái 0,04!) | hộp bao theo cung rộng/hẹp, không theo trại sát hay thưa |
| **TB khoảng cách từng cặp trại** | **292 vs 781** | đúng cái mà hằng số điều khiển |

**⚠ BẪY ĐO CỦA ②, mất nguyên một vòng chẩn đoán sai.** `computeKillRewards()` là hàm **THUẦN**
(`test_killrewards` gác), nên nó không bao giờ ghi `_daRoiMonDau`. Mà nhánh phát đầu
`(P.kills||0) <= 3 && !P._daRoiMonDau` **bảo đảm** rơi một món. Gọi 4000 lần trên nhân vật mới ⇒
cả 4000 lần đều là "ba con đầu đời" ⇒ ~1,0 món/con ở **cả hai** phía, tỉ lệ ra **đúng 1,00**.
Trông y hệt "hệ số farm không chạy", trong khi nó chạy hoàn hảo. Đặt `player.kills` lớn +
`_daRoiMonDau = true` trước khi đo.

**⚠ Và đừng chấm ② bằng TỈ LỆ — CẢ HAI vế, không chỉ vế rơi đồ.** Hai vế đều cộng những khoản
**không** nhân hệ số: `dropBonus` cộng thẳng vào tỉ lệ, cuộn phụ kiện là lượt riêng, Lumen cộng
`+4` và 30% × `GO_HUYENTHIET`. Cùng một mã đo ra ×1,24 khi `dropBonus` lớn và ×1,53 khi nhỏ.
Chấm bằng phần **CHÊNH**:

    doFarm − doThuong  ≈  soLuot × rate × (FARM_THUONG − 1)
    agFarm  − agThuong ≈  (agThuong − phẳng) × (FARM_THUONG − 1),  phẳng = 4 + 0,3 × GO_HUYENTHIET

⚠ Tôi đã sửa vế rơi đồ mà **chừa vế Lumen lại**, và nó đỏ ngay ở lượt hồi quy kế tiếp: ×1,449 ở
máy đang làm, ×1,399 trong hồi quy, cùng một mã — khác nhau chỉ vì `silverPct` của bộ đồ mà
`applyTestBoost()` bốc ra. *Sửa một nửa một lỗi đo là để lại đúng cái lỗi ấy ở nửa kia.*

Gác: `tests/test_baifarm.js` (4 mệnh đề, một cho mỗi tính chất). Nó cũng chặn **hai miền farm
trên cùng một map** — nhiều chỗ thì không chỗ nào là *cái chỗ* nữa.

### ◆ VỈA CỐT (B3.3) — thứ đầu tiên trong game buộc phải ĐI TỚI một toạ độ

`viaHomNay()` bốc **ba** trong bảy vùng có Dòng, mỗi vùng **một điểm**, hạt từ chính chuỗi
`new Date().toDateString()`. Không lưu vị trí ở đâu cả — tải lại trang, đổi máy, đổi nhân vật
đều ra đúng một tấm bản đồ; qua nửa đêm là ba nơi hoàn toàn khác.

**Ba điều là cả thiết kế, đừng "tối ưu" mất cái nào:**
1. **Cách bãi quái ≥ 320px** (`VIA_CACH_BAI`). Vỉa mọc cạnh bãi là AUTO nhặt được, và ta lại
   quay về đúng cái vòng "chốt một bãi, không bao giờ rời". Đây là lý do vỉa tồn tại.
2. **Đổi TOẠ ĐỘ, không chỉ đổi map.** Hung Thần và Xâm Lăng Vàng đã đổi map theo giờ từ lâu —
   nhưng "về đúng bãi cũ ở map khác" thì vẫn là bãi cũ. Toạ độ mới là chỗ AUTO không lên lịch
   cứng được.
3. **Một lần / ngày / vùng / nhân vật** (`player.via = { day, <map>:1 }`). Một mỏ hồi theo phút
   là một bãi cày, không phải một chuyến đi.

Điểm bốc **chỉ từ dữ liệu tĩnh** (`obstaclesOf` + packs + cổng + điểm thả), nên bảng Bản Đồ và
danh sách sự kiện nói đúng chỗ vỉa của cả bảy vùng mà không phải nạp map. Cây/đá là decor bốc
lại mỗi lần vào map nên chúng bị chừa trống ở `buildWorld` (`_keep`), không xử ở khâu bốc điểm.

Ba cửa chỉ đường, thiếu một là người chơi không biết đi đâu: chấm kim cương trên **bản đồ nhỏ**,
dòng riêng cho **từng vỉa** trong danh sách sự kiện (mỗi cái một CHỖ nên không gộp được), và một
dòng trên hàng map trong bảng **Bản Đồ**. QA: `/via` · `/via ds` · `window.debugVia(map)`.

### ▣ RƯƠNG CANH (B3.1) — hòm có người giữ, mở MỘT lần trong đời

Vỉa Cốt cho thế giới lý do đi tới **mỗi ngày**. Rương Canh cho nó lý do đi tới **một lần**. Hai
việc khác nhau, **đừng gộp** — và bài kiểm `test_ruong.js` §2 khoá đúng chỗ tách đó: rương phải
đứng yên qua nhiều ngày, vỉa phải đổi.

- Vị trí bốc từ **tên map** (`_bamChuoi('ruong:' + mid)`), không từ ngày ⇒ **không bao giờ đổi
  chỗ**. Đi qua một lần là nhớ, và cái nhớ đó là thứ biến 2600×1900 pixel thành một nơi chốn.
- 4 rương / vùng có bãi quái (7 vùng, kể cả Outskirts). ⚠ **Đừng thêm điều kiện `type:'safe'`** —
  Outskirts khai `safe` (không PK) nhưng vẫn là bãi săn 8 bãi; chặn nó là vùng đông người nhất
  mất sạch rương. Cửa duy nhất đúng là **có bãi quái**.
- Mỗi rương một **trại canh 4 con, 4 vai** (`nang·can·xa·phap`, dùng lại A1). Trại còn sống thì
  rương **khoá**. Trại **cố ý không có Kẻ Tiếp Sức**: nó phải chết được trong một lần đánh để mở
  rương, không phải một bãi cày hồi máu lẫn nhau.
- Rương **đã mở thì trại tan hẳn** và không dựng lại — nếu không, map đã vét sạch rương vẫn gánh
  16 con quái thừa mãi mãi.

**⚠ ĐỀ XUẤT CŨ GHI "hồi 20-40 phút" — KHÔNG LÀM THẾ.** Hòm hồi theo phút là bãi cày có thêm hoạt
ảnh: AUTO đứng cạnh nó là xong. Rương ở đây mở **một lần vĩnh viễn cho mỗi nhân vật**
(`player.ruong['<map>:<i>']`). Phần **lặp lại** của thế giới đã có Vỉa Cốt lo.

Đây là viên gạch mà **A4** (miền dân số canh một vật thể) và **B1** (dọc đường có thứ đáng dừng)
đều dựa vào: khái niệm *vật thể thế giới CÓ NGƯỜI CANH* được dựng ở đây.

⚠ Trại canh mang `m.pack = 'ruong:<id>'`. Bài kiểm nào gom quái theo `m.pack` để đo **bãi quái**
phải **bỏ tiền tố `ruong:`** — `test_bayquai` và `test_dibien` đã sửa; bài mới cũng phải nhớ.
QA: `/ruong` · `/ruong ds` · `window.debugRuong()`.

### Bốn tài liệu thiết kế — đọc theo thứ tự này
1. `docs/CAU_TRUC_MAP.md` — đo map hiện tại, đối chiếu Ragnarok / Path of Exile
2. `docs/DE_XUAT_MAP.md` — 10 hạng mục / 4 đợt, có C1 (từ khoá phòng) + C2 (máy sinh)
3. `docs/NHIP_CAP_1_120.md` — nhịp cấp, chỗ 99 cấp trống
4. `docs/BOSS_TO_DOI.md` — boss là nội dung TỔ ĐỘI, và boss phải mang bản sắc Axie

## Tên trang bị đi theo CHẤT LIỆU

`ITEM_NAMES[slot][rarity]` — 5 tên mỗi ô, leo theo chất liệu như đồ MU: **da → sắt → thép →
vảy rồng → hắc nguyệt**. Bộ tên cũ mượn thẳng binh khí kiếm hiệp (Huyền Thiết Trọng Kiếm,
Lăng Ba Hài, Chí Tôn Long Giáp, Thiên Tôn Miện…) — vi phạm Quy tắc số 1. Tên mới phải là
danh từ trang bị thuần, đừng mượn tên chiêu thức hay bảo vật tiểu thuyết.

## 💪 BỐN CHỈ SỐ KIỂU MU — Sức Mạnh · Nhanh Nhẹn · Thể Lực · Năng Lượng

Trước bản này là **NĂM**, mang tên kiếm hiệp: *Lực Lượng · Mẫn Tiệp · Phòng Ngự · Sinh Lực ·
Linh Lực*. Chúng sống sót qua cả đợt chuyển sang MU vì không ai đọc lại `ATTR_INFO`.

**⚠ "Sinh Lực" KHÔNG biến mất khỏi game** — nó vẫn là tên của MÁU ("Sinh Lực Tối Đa", "Hút
Sinh Lực", thanh máu). Thứ đổi tên là **chỉ số đẻ ra máu** → **Thể Lực**. Tương tự "Mana" vẫn
là tên tài nguyên, chỉ số đẻ ra nó là **Năng Lượng**. Đừng đổi nhầm nhóm.

### ⚠ Ô "PHÒNG NGỰ" ĐÃ GỠ — và lý do là SỐ ĐO, không phải cho gọn

`defRed = def/(def+60)` chạm trần chung `DEFRED_TRAN` (**0,55**) từ khoảng **60 điểm**. Mọi
điểm sau đó là **số chết** — chính chú thích ở `DEFRED_TRAN` đã ghi đúng điều đó từ trước.
Một ô chỉ số mà sau 60 điểm không còn tác dụng gì thì nó không phải một lựa chọn, nó là một
khoản thuế. Nay phòng thủ suy từ **Nhanh Nhẹn** (`AGI_SANG_THU`).

**⚠ CHỖ TÔI ƯỚC LƯỢNG SAI RỒI PHẢI ĐO LẠI** — ghi lại vì con số đầu nghe rất hợp lý. Tôi tính
*"trần ở `s.def` ≈ 74, nền ~10, vậy hệ số 0,35 ⇒ cần ~190 điểm"*. Đo thật:

| lớp | thủ ở 0 điểm | chạm trần 55% tại |
|---|--:|--:|
| Dark Knight | 51,8% | **50** |
| Dark Lord | 44,9% | **50** |
| Sylvan Ranger · Dark Wizard · Spellblade | 37% | **100** |

Lý do: `defRed` đã ở **37-52% trước khi có một điểm nào** (cấp 120 tự cộng), nên phần còn lại
tới trần rất mỏng. ⇒ **Đừng mô tả Nhanh Nhẹn là "hố đổ điểm vô tận".** Nó là: bỏ ~50-100 điểm
cho cứng người, phần còn lại dồn vào dòng sát thương của lớp. Nâng hệ số cũng không kéo dài
được đường cong — thứ chặn nó là cái TRẦN, và 0,55 là quyết định đã cân của chủ dự án.

### Dòng sát thương từng lớp (chủ dự án chốt)

| lớp | `atkSrc` | dòng chính |
|---|---|---|
| Dark Knight | `{str:2.0}` | Sức Mạnh |
| Sylvan Ranger | `{agi:2.0}` | Nhanh Nhẹn |
| Dark Wizard | `{ene:2.2}` | Năng Lượng |
| Spellblade | `{agi:1.5, str:0.7}` | Nhanh Nhẹn · **Sức Mạnh là dòng PHỤ** |
| Dark Lord | `{ene:2.1}` | Năng Lượng |

**⚠ ĐO BẰNG CÁCH SWAP `atkSrc` TRONG CÙNG MỘT LƯỢT CHẠY.** Lượt đo đầu của tôi so hai lần chạy
khác nhau và ra kết quả vô nghĩa — *"máu Dark Lord tụt 10%"* hoá ra chỉ là `startGame` bốc
trúng bộ `traits`/`personality` khác, mà cả hai đều cộng chỉ số trong `calcDerived`. Phải
`player.traits = []; player.personality = 'trung'` rồi mới đo. Kết quả đã khử nhiễu:

| lớp | dồn hết dòng chính | nửa dòng chính / nửa Nhanh Nhẹn |
|---|--:|--:|
| Dark Knight · Sylvan Ranger | **±0,0%** | ±0,0% |
| Dark Wizard | +5,0% | −1,4% |
| Dark Lord | +2,1% | −1,3% |
| **Spellblade** | **+8,6%** | **+8,7%** |

**⚠⚠ VÀ HAI CON SỐ TRÊN CHỈ ĐÚNG CHO CẢNH ĐÃ ĐO — ĐỪNG TRÍCH CHÚNG NHƯ KẾT QUẢ CHUNG.**
Bảng ngay trên đo nhân vật **rót hết điểm** vào dòng chính, `traits` rỗng, `personality` trung
tính. Đo lại trên cảnh của `test_canbanglop` — nhân vật **0 điểm rót**, **đồ rơi ngẫu nhiên +0**,
3 lượt × 30 giây game mỗi cây:

| lớp | atk TB trước | atk TB sau | ST TB trước | ST TB sau |
|---|--:|--:|--:|--:|
| **Dark Wizard** | 151 | **120** (−21%) | 26.109 | **21.477** (−18%) |
| **Spellblade** | 107 | **164** (+53%) | 26.448 | **36.661** (+39%) |
| Dark Knight | 102 | 97 | 60.520 | 56.453 |
| Sylvan Ranger | 189 | 196 | 54.318 | 53.558 |
| Dark Lord | 96 | 85 | 32.375 | 27.575 |

Chênh tới 6 lần so với `+5,0%` / `+8,6%` đã ghi. Lý do **không** phải phép đo cũ sai, mà là nó
đo một cảnh khác: khi người chơi chưa rót điểm thì `atkSrc` ăn gần như trọn vẹn từ **chỉ số do
TRANG BỊ cộng vào**, nên đổi trọng số sang một dòng mà đồ rơi ít cho là tụt thẳng. DW mất vế
`agi` (đồ cho nhiều `agi`), Spellblade nhận được vế `agi` ấy.

*Đo một cảnh rồi gọi nó là kết quả thì lúc nào cũng ra con số mình muốn* — cùng vết sẹo đã ghi
cho con số 32,4% ở mục hệ phòng thủ Axie. Cả hai bảng đều đúng; phải nói rõ **đo ở đâu**.

**Được thêm, không phải chủ ý:** Spellblade chết **7,0 → 3,0** lần mỗi 30 giây, tức trả một phần
"nợ đã biết" ghi ở đầu `test_canbanglop` (*"Spellblade GÂY được sát thương nhưng không KẾT LIỄU
được"*). Dark Wizard vẫn là lớp mỏng nhất ở **cả hai** cây (10,7 → 8,7 lần chết) — nợ CÓ SẴN,
không phải do đợt này.

**⚠ Spellblade +8,6% là CÓ CHỦ Ý, và nó KHÔNG phải một cú buff lén.** Bản cũ `{str:1.1,
ene:1.1}` là một thế chia đều, mà công thức dùng **căn bậc hai** (`sqrt(_ptSum)`) nên chia đều
là thế **bị phạt**: Spellblade vì thế là lớp có đỉnh công **thấp nhất** trong năm. Cho nó một
dòng chính rõ ràng kéo nó về gần giữa — đo được: chênh lệch đỉnh công giữa năm lớp đi từ
**1,59×** xuống **1,54×**. Đã thử hạ trọng số để về đúng 0%: không về được, vì `_ptNen` (vạch
xuất phát) cũng tính theo tổng trọng số nên hai tác dụng triệt tiêu nhau — muốn 0% thì phải
quay lại thế chia đều, tức bỏ chính cái đặc tả.

### Di trú: HOÀN điểm, đừng xoá trắng

`loadGame()` trả `player.def − 5` về `player.free`, ghim `player.def` về mức nền, đặt cờ
`player._diTruDef`. Ba thứ bắt buộc, đúng nếp đã ghi cho `cotDiTru`:
- ⚠ **Hoàn, không xoá** — người chơi cũ có thể đã đổ hàng trăm điểm vào đó.
- ⚠ **KHÔNG cần cờ `_diTru*` ở đây** — và đây là chỗ tôi thêm thừa rồi phải gỡ. Phản xạ là
  "phải có cờ chặn hoàn hai lần", nhưng phép hoàn này **tự bất biến**: thứ giữ nó là dòng
  **ghim `def` về mức nền**, nên lần nạp sau `_hoan` ra 0. Thêm cờ rồi thử ngược bằng cách gỡ
  cờ ⇒ bài kiểm **IM LẶNG**. *Một cái cờ mà gỡ đi không làm đỏ được bài nào là một cái cờ
  không gác gì — nó chỉ trông như đang gác.* (`cotDiTru` thì đúng là cần cờ, vì nó KHÔNG ghim
  nguồn về 0: nó đọc `lv`/`hoa` rồi xoá.)
- ⚠ **Phải BÁO ra một dòng đọc được**, và báo ở chỗ vào game chứ không trong `loadGame()`:
  lúc ấy thế giới chưa dựng, `addFloat` chưa có chỗ bám. Dùng biến `_diTruDefBao`.

⚠ **`addAttr` phải từ chối khoá lạ** (`if (!ATTR_INFO[k]) return`). Không chốt thì một lời gọi
cũ — bảng còn trong đệm, lệnh gỡ rối, một nút sót — vẫn đổ điểm vào ô **không còn ai đọc**:
người chơi mất điểm vĩnh viễn, không lỗi nào báo.

⚠ **`def` vẫn còn là DÒNG PHỤ TRÊN TRANG BỊ.** Gỡ ô chỉ số không có nghĩa là gỡ `applyLine`
nhánh `def` — giáp vẫn cộng thẳng vào phòng thủ. Hai thứ khác nhau, trùng tên.

⚠ **Bảng in số phải LÀM TRÒN.** Bị động Thể Lực cộng một số thập phân vào `s.vit`, nên ô này
từng in ra `54.1 (50+4.100000000000001)` — rác dấu phẩy động phơi thẳng ra mặt bảng.

Gác: `tests/test_chiso4.js` (5 mục, 10 phép thử ngược). §③ **rót điểm thật rồi đo `player.atk`**
chứ không đọc bảng `atkSrc` — đọc bảng thì một lỗi trong `calcDerived` (nhầm khoá, quên một
nhánh) vẫn xanh.

## Cốt truyện (canon) — **NHÁT GỌI · BẢY RUNE CỔ**

> Canon đầy đủ, kèm hợp đồng thi công: **`docs/LORE_RUNE.md`**.
> Mạch cũ (**Morvahn · Năm Trụ Khoá · Vaeldra trút tận thế lên nhà người khác**) đã BỎ HẲN —
> chủ dự án chốt 2026-09-11. Đừng dựng lại từ git: không một danh từ riêng nào của nó còn dùng.
> Hai tài liệu nhiệm vụ cũ (`docs/LORE_AXIE_VA_NHIEM_VU.md` §5, `docs/THIET_KE_NHIEM_VU.md`)
> cũng lỗi thời ở TÊN MAP và spine — chỉ còn §2-3 của tài liệu đầu (khảo sát lore Axie có nguồn)
> là dùng được.

**Rune** là nghề của Bug axie: khắc lên **đá**. Một phiến Rune dựng ở một nơi thì **giữ một cái
luật** ở nơi đó. Giáo lý là **Nếp Khắc Vừa**: khắc vừa đúng cái phiến đá gánh nổi, và đừng bao
giờ khắc một cái luật phải giữ mãi mãi.

**Bảy Rune Cổ** cắm khắp Lunacia, mỗi vùng một phiến. Chimera áp biên không phá nổi Rune nhưng
**mài** nó; bảy trăm năm thì đá mỏng, mà người biết khắc sâu thì hết. Nên **Sylas** (NPC đã có ở
Bug Tribe Tunnels) làm đúng cái việc giáo lý cấm: khắc một Rune **lên trời** để xin một người thợ
biết làm Rune bền hơn đá. Nhát cắt đó là **NHÁT GỌI**, và thứ đi qua nó là nguyên khu phố
**Ardhaven** của **Vaeldra** — đá lát, lò rèn, và bảy người lính.

⇒ Canon này *giải thích trong truyện* ba thứ vốn khập khiễng, **bằng chính cơ chế đã có**:

| Thứ cần giải thích | Canon nói |
|---|---|
| Vì sao nhân vật là **Dark Knight / Dark Wizard** giữa thế giới Axie | **Lunacia gọi ngươi tới** — không phải ngươi sang xâm chiếm, cũng không phải sang sửa lỗi của mình |
| Vì sao **Ardhaven** là phố đá phương Tây có lò rèn | **cái lò CHÍNH LÀ thứ Lunacia cầu**; thành là câu trả lời, không phải đống đổ nát |
| Vì sao **mất ký ức** rồi võ nghệ trở lại theo cấp | **Rune đòi trả bằng thứ nó dịch chuyển**; nghề khắc sâu hơn ký ức nên nghề quay lại |
| Vì sao đập trang bị lên **+N** lại quan trọng | **Vaeldra khắc Rune vào THÉP** — mỗi lần rèn là một lần khắc |

**Chimera KHÔNG đổi định nghĩa**: lore Axie chính thức nói chimera sinh ra từ dạng tha hoá của
thần **Atia**. Đừng chạm vào đó — đúng lý do mà hệ bạn đồng hành đã phải đổi tên sang **Ragoon**
(xem chú thích đầu `CHIMERA` trong `canbang.js`). Việc của kẻ thù chỉ là làm bảy cái luật hỏng
nhanh hơn Chimera làm.

**Kẻ thù: DRUE — người thứ bảy.** Hắn qua Nhát Gọi cùng ngươi và giữ được ký ức, vì hắn trả bằng
ký ức của người khác. Hắn không khắc vào đá, không khắc vào thép: **hắn khắc vào chính mình**.
Manh mối `td_trong` (*"cái tên thứ bảy chưa bị gạch, vì chưa ai chứng minh được là nó nên bị
gạch"*) là mũi nhọn của cả chuỗi; `manh_lenh` (*"một con mắt không có tròng"*) là dấu của hắn.

**Bi kịch trung tâm — giữ nguyên HÌNH DẠNG của mạch cũ, đổi hẳn nội dung:** thu Rune về lò thì
Rune bền thêm nghìn năm, **nhưng trong lúc phiến đá nằm trong lò, cái luật nó giữ thì TRỐNG**.
Phiến thứ bảy (**Rune Giữ Đường**) là thứ thắp đường cho hồn quay về Cây Hồn — nên nhiệm vụ cuối
của chuỗi vừa đóng chính tuyến vừa bật Kết Mở. Danh hiệu: **Kẻ Gỡ Rune Cuối**.

Và **chương 0 đóng lại ở đó**: đèn dẫn hồn tắt khắp Rẻo Rừng Corran là đầu xa của phiến thứ bảy.
`c0q2` đã viết đúng câu cần thiết — *"Ba đêm liền, mà **dầu vẫn còn đầy**"*. Đèn tắt không vì hết
dầu; nét khắc bị lấy đi.

### Bảy phiến — mỗi vùng một, đếm được

| Vùng | Rune Cổ | Luật nó giữ | Dòng Cốt (đã có) |
|---|---|---|---|
| Beast Herd Camp | Rune Giữ Đàn | đàn không tan khi hoảng | Đồng Cỏ |
| Werebear Woods | Rune Giữ Bờ | rừng không lấn qua bờ | Rễ Gai |
| Plant Tribe Glade | Rune Giữ Mùa | luống ấp nở đúng mùa | Cánh Hoa |
| Bug Tribe Tunnels | Rune Giữ Tên | axie vừa nở được nhận tên (**phiến GỐC**) | Vỏ Trứng |
| Bird Tribe Heights | Rune Giữ Khúc | khúc hát không tắt theo người hát | Băng Vụn |
| Reptile Sunstone Flats | Rune Giữ Lửa | lò không nguội qua đêm | Tro Tàn |
| Dusk Marsh | Rune Giữ Đường | đường về Cây Hồn còn sáng | Sấm Vụn |

**Bốn map còn lại KHÔNG có Rune, và đó là chủ ý** — `corran` (rễ Cây Hồn chạy ngầm, không ai dám
khắc đá lên rễ) · `loimon` (một lối mòn không phải một nơi) · `trungnut` (đất trũng ngay dưới
Nhát Gọi, cắm đá là nứt ⇒ **giải thích luôn `type:'freepk'`**) · `caungam` (không có nền để cắm).

⚠ **HAI CON SỐ, HAI TỔNG, ĐỌC TỪ HAI NGUỒN.** `runeDaThu()` đếm trên `RUNE_CO` (7);
`tuongQuanDaHa()` đếm cờ `ta_*` và in kèm `TRAN_AI_TONG` suy từ `BOSS_DEFS` (11). Bản cũ in cả
hai theo mẫu `/7` chép cứng, nên vét sạch game là panel Nhật Ký in ra đúng chữ **"11/7 Tướng
Quân đã hạ"**. `test_cottruyen.js §2` gác đúng chỗ đó: vét hết rồi quét cả panel, không phân số
nào được vượt trần.

⚠ **Cờ lưu vẫn là `ta_<map>`**, không đổi tiền tố — save cũ không phải di trú. Chỉ bộ ĐẾM đổi.

⚠ **Số nấc lớp vết nứt (`#fx-crack[data-tru="N"]` trong `style.css`) phải khớp `RUNE_TONG`.**
Bộ chọn khớp chính xác, nên thiếu một nấc là `--nw` không được khai, `parseFloat` ra `NaN`, và
lớp vết nứt TỤT VỀ 0 đúng ở nấc cuối — không một lỗi nào trên console. Đã dính khi đi từ 5 lên 7.

Thuật ngữ chốt: **Rune Cổ** · **Nếp Khắc Vừa** · **Nhát Gọi** · **Cây Hồn** · Tướng Quân (Trấn Ải,
mỗi map ĐÚNG MỘT con) · **Vệ Binh Rune** (3 boss phụ, canh Cổng Vực) · Cổng Vực · **Đá Ấn Rune** ·
Hung Thần (boss thế giới định kỳ, **không** dính cốt truyện) · Đoàn Gloam (kẻ qua Nhát Gọi rồi đi
theo người thứ bảy) · **DRUE**.

### Chuỗi nhiệm vụ — 8 chương, 46 nhiệm vụ, **ĐANG CHẠY**

⚠ Mục này trước đây ghi `QUESTS` và `SIDE_QUESTS` đều rỗng "chờ dựng lại". `QUESTS` **đã dựng
lại**: 8 chương / 46 nhiệm vụ trong `data/canbang.js`. `SIDE_QUESTS` thì **vẫn rỗng** — đó là
việc còn nợ thật.

Mỗi chương = một Rune, và **đóng bằng loại nhiệm vụ `tranai`** (hạ Trấn Ải của chính vùng đó).
Loại đó là mới, và nó tồn tại để vá đúng một lỗi: trước bản này Kết Mở do `killMob` quyết định
(hạ Trấn Ải Dusk Marsh bật cờ `ketMo`) nhưng **không một nhiệm vụ nào bảo đi hạ nó** — nên người
chơi xong 100% chính tuyến mà chưa chắc thấy kết, hoặc thấy kết trước khi xong chính tuyến.

Ba luật của chuỗi, đo được bằng máy (xem script kiểm trong `docs/LORE_RUNE.md §6`):
1. khoảng cách hai nhiệm vụ liền nhau **≤ 4 cấp** (bản cũ có chỗ hở 8 cấp);
2. cấp quái lệch cấp nhiệm vụ **≤ ±4** (bản cũ có chỗ lệch +16);
3. **≤ 60%** nhiệm vụ là đánh quái (bản cũ 67%), và **không chương nào toàn đánh quái**.

Mỗi chương mở đúng một cửa cơ chế, và **cửa nào hứa thì phải có nhiệm vụ THẬT gác** — xem mục
"LOẠI NHIỆM VỤ `moc`" ở trên. Bảy cửa đang có người gác:

| Ch | Cửa | Nhiệm vụ |
|---|---|---|
| I | Khế Ước (thân Axie) | `c1q3` Kẻ Đi Trước — quay 1 |
| II | Vỉa Cốt | `c2q2` Bụi Đá Dưới Chân Phiến — khai 1 |
| III | bốn ô Cốt | `c3q3` Mảnh Cốt Đầu Tiên — cắm 4 |
| IV | Rương Canh | `c4q2` Hòm Có Người Canh — mở 2 |
| IV | Box Kundun | `c4q3` Thứ Không Ai Dạy Được — mở 1 |
| V | Bản Năng → cấp kỹ năng | `c5q2` Bản Năng — nâng 3 |
| VI | Box Kundun (thêm) | `c6q4` Mỏ Đã Tắt Lửa — mở 6 |

⚠ Cửa **Khế Ước** nặng hơn sáu cửa kia: sau đợt gỡ Ragoon đó là cửa **duy nhất** vào hệ avatar,
tức tính năng đầu bảng của cả đợt Đổi Vai. Không có nó thì người chơi xong 100% chính tuyến mà
không ai nói cho họ biết là đổi được thân.

## Kiến trúc

- Toàn bộ game nằm trong **1 file**: `public/game/game.js` (**~32,5k dòng**), kèm `index.html`, `style.css`.
- Không build step — mở thẳng file tĩnh. Kiểm tra cú pháp: `node --check public/game/game.js`.
- Các hằng số lớn: `SECTS` (5 lớp), `VOHOC_DEFS` (chiêu), `SKILL_DEFS`, `MAPS`, `MOBS`, `QUESTS`,
  `SIDE_QUESTS`. Hàm trung tâm: `calcDerived()` (mọi chỉ số), `update(dt)`, `render()`,
  `castSkill()`, `hurtMob()` (điểm áp sát thương DUY NHẤT của toàn game).

## Nhân vật chính — vẽ theo KHỚP XƯƠNG, không phải sprite sheet

Không còn thẻ Axie PNG. `drawHeroFigure()` dựng nhân vật bằng vector trong hộp
`HERO_W×HERO_H` (160×220), chia theo bộ phận, mỗi chi xoay quanh trục riêng
(`HERO_JOINT`: vai / hông / cổ). **Animation là hàm số theo thời gian** — đúng cơ
chế xương MU Online dùng, không phải chuỗi khung hình.

- `heroPose(wph, mv, atkK, castK, now, act)` → góc mọi khớp + `wrot`/`wpush` (vũ khí).
- `HERO_ACT` — 7 kiểu ra đòn: `slash · spin · thrust · shoot · point · raise · guard`.
- `SECT_ACT[lớp]` — lớp nào dùng kiểu nào cho `basic / a / tp / buff`.
  **Chọn kiểu phải KHỚP VFX của chiêu**: Meteor rơi từ trên xuống ⇒ `raise` (giơ
  trượng lên), Fire Slash quét hình quạt ⇒ `spin`, ngũ tiễn ⇒ `shoot`.
- `heroCastAct(id, d)` suy ra kiểu lúc `castSkill()`; ghi vào `player.castAct`
  (đòn thường ghi `player.atkAct`).
- `HERO_GEAR[lớp]` — `{ pal, cape, upper(g,M,ps,P) }`. Thêm lớp mới = thêm 1 entry.
- `HERO_METAL[0..9]` — bậc Thần Binh đổi bảng màu giáp, bậc 6+ toả hào quang.
  Nâng trang bị phải NHÌN THẤY được trên nhân vật.

Chỉ 2 trường hợp còn blit ảnh: Hóa Thân Tướng Quân (mượn sprite boss) và Phi Thăng.

### Trang bị phải NHÌN THẤY ĐƯỢC — 4 lớp, không lớp nào là "phát sáng"

Đo trước khi làm: full Chí Tôn giai 10 +11 Hoàn Hảo Cổ Thần chỉ khác nhân vật mới tạo
**718/62.400 px (1,15%)**, và toàn bộ 718 px đó là một đốm sáng cạnh bàn tay — thân người
**0 px**, 7/9 ô chỉ số đổi đúng 0 px. Sau khi làm: **19.104 px (54,3%)**, đường viền thân
đặc đổi 511 px và phình đều theo bậc (0 → 137 → 212 → 346 → 487).

- `gearVisual(p)` → chữ ký ngoại hình từ `p.equip` thật (`t` = bậc trung bình **nhân độ phủ**,
  `rarity`, `setColor` khi đủ 5 món một bộ). **Trả `null` khi chưa có `player`** — màn chọn
  lớp gọi `heroCardUrl()` trước khi `player` tồn tại.
- `heroTier(p)` = `max(Thần Binh, gearVisual.t)` — dùng max để không ai tụt so với trước.
- Bốn lớp, đều vẽ **generic** trong `drawHeroFigure`, **không đụng dòng nào trong 6 entry
  `HERO_GEAR`**:
  | | |
  |---|---|
  | A. Bóng dáng | `hPauldrons` · `hHelmCrest` · `hGreave` · `hBelt` — mọc dần theo bậc |
  | B. Chất liệu | `hArmorSheen` — sắt nhám → thép đánh bóng (dải phản quang hẹp dần) |
  | C. Hoa văn | `hEngrave` — số đường khảm theo bậc, **màu theo `it.rarity`** |
  | D. Hào quang | ~~giữ, nhuốm màu bộ Cổ Thần đang mặc~~ — **ĐÃ GỠ** (2026-09-24), xem mục Cường hoá |
- ⚠ Vai giáp phải đủ to để vượt **ra ngoài** đường viền cánh tay (tay vẽ tới x≈122). Nằm gọn
  bên trong thì nó chỉ còn là mảng màu, mất hẳn tác dụng đổi dáng — đó là lý do bản đầu chỉ
  đổi được 6 px đường viền.
- ⚠ `hGreave` vẽ **trong khớp hông** (`hLegs` nhận thêm tham số `gv`) nên giáp ống nhấp nhô
  theo sải bước. Vẽ ngoài là thành nhãn dán.
- ⚠ `_heroCardCache` khoá **phải gồm chữ ký trang bị**, nếu không panel Nhân Vật hiện mãi ảnh
  cũ sau khi thay đồ.
- ⚠ Chi tiết mặt trước (ngọc trán) phải kiểm `ps.back`, không thì vẽ lên gáy.

Test: `node <scratchpad>/test_gearlook.js` — đo lại đúng phép đo 1,15% ở trên, đo riêng đóng
góp từng lớp, và bắt buộc **đường viền thân đặc** phải phình đều theo bậc. Ngưỡng alpha khi
đo viền là **180**, không phải 8: hào quang là đĩa gradient bán trong suốt phủ kín khung, lấy
ngưỡng thấp thì đo nhầm mép hào quang (ra 912 px trong khi thân chỉ đổi 117).

### BỐN Ô TRANG BỊ VẼ RỜI NHAU — không đợi đủ bộ

Chủ dự án chốt: **không bắt mặc đủ bộ mới hiện giáp**. Đeo mỗi đôi giày thì đúng đôi giày đổi.

Đường cũ `nvBoGiap()` đổi **cả tấm thân** một lượt theo bậc hiệu dụng `gv.t`, nên thiếu một ô
là tụt bộ hoặc về thân trần — và không có cách nào thân một bộ mà tay áo một bộ khác.

Đường mới: `nuong_nv.py --lop` cắt gói Spine thành **năm lớp rời**, game chồng lại lúc vẽ.

- **NĂM lớp, không phải bốn**, và thứ tự là **THỨ TỰ VẼ CỦA BỘ XƯƠNG**, không phải thứ tự ô:
  `tóc-sau · tay-XA · hai chân · thân · tay-GẦN · đầu`. Ô `tay` nằm **hai bên** ô `ao` — gộp
  `tay` làm một lớp là tay xa nhảy ra trước ngực. `NV_LOP` trong game.js phải trùng khít bảng
  `LOP` trong `tools/spine/nuong_nv.py`; `tests/test_lopdo.js` §1 gác đúng chỗ này.
- **Mỗi lớp CẮT SÁT hộp bao của chính nó**, gốc cắt ghi trong `NV_LOP_HOP` (8 số: bảng một rồi
  bảng hai). Không cắt thì năm lớp = 5 × 27,6 MB mỗi bộ. Cắt rồi thì tổng năm lớp của **bảng
  một chỉ còn 79,5%** một tấm thân liền — tách ô ra còn **rẻ hơn** gộp, vì mỗi ô chỉ nạp đúng
  lớp của nó dù người chơi mặc bốn bộ khác nhau.
- **Hai bảng cắt hai hộp khác nhau.** Bảng hai là chết/nhảy múa/bật người, tay chân văng rất
  xa. Ép chung một hộp thì bảng một phải gánh hộp của bảng hai: đo được 79,5% phình lên 167%.
- Bộ có mặt trong `NV_LOP_HOP` đi đường lớp rời; bộ không có vẫn đổi cả tấm như cũ. **Hai đường
  sống chung là chủ ý**: 7 bộ nướng từ trước không còn gói Spine gốc, mà cắt lớp từ một tấm đã
  dẹp thì không có cách nào. `nvBoGiap()` trả `null` cho bộ có lớp rời — trả tên là 404.
- `heroGearSig()` phải mang `gv.oLop`, nếu không đổi mũ mà đầu vẫn cái mũ cũ.

⚠ **NỢ CÒN LẠI — thân nền chưa cắt lớp.** Lớp của bộ đang đắp lên **tấm thân liền** `dw1`, nên
một lớp có thể che nhầm phần thân đáng lẽ nằm TRƯỚC nó: đeo mỗi ô `chan` thì ống chân đè mất
vạt áo dài của thân. Ba ô kia không dính vì đầu/thân/tay vốn vẽ sau cùng. Sửa dứt điểm cần
**một gói Spine THÂN TRẦN cho mỗi lớp** để cắt ra năm lớp nền — xem
`docs/PROMPT_GIAP_DARKWIZARD.md §7`.

### Bộ giáp RIÊNG từng lớp (`HERO_SETS`)

Bốn lớp trên nếu vẽ generic cho cả 6 lớp thì pháp sư mặc áo choàng lại đeo vai giáp tấm của
hiệp sĩ — cả 5 lớp trông như mặc chung một bộ. Mỗi lớp phải có **dòng giáp riêng**:
`{ min, name, style, tint }` · `heroSet(sect, t)` chọn bộ theo bậc · `hSetMetal(M, S)` đè
bảng màu. Bậc vẫn đọc được qua màu, nhưng mỗi lớp đi theo một dải màu riêng.

**Đủ 25 bộ = 5 lớp × 5 dải** (dải theo bậc: 1-2 · 3-4 · 5-6 · 7-8 · 9-10). Đặc tả đầy đủ ở
`docs/BO_GIAP.md`.

| | I | II | III | IV | V |
|---|---|---|---|---|---|
| Dark Knight | Thiết Vệ | Giáp Xích | Hắc Giáp | Vảy Rồng | **Hỏa Long** |
| Dark Wizard | Vải Thô | Da Thú | Nhân Sư | Ma Thuật | Hư Vô |
| Sylvan Ranger | Da Rừng | Lá Thép | Vỏ Sồi | Lông Ưng | Đại Bàng Trắng |
| Spellblade | Bán Giáp | Giáp Lệch | Than Hồng | Lửa Dữ | Hoả Ngục |
| Dark Lord | Lệnh Giáp | Cận Vệ | Vương Giáp | Bạo Chúa | Ngai Đen |

- 12 `style`, mỗi cái phải có đủ **4 hàm** trong `SET_SHOULDER` · `SET_CREST` · `SET_LEG` ·
  `SET_HIP` (test bắt nếu thiếu).
- ⚠ **Dark Wizard TUYỆT ĐỐI không dùng `plate`/`chain`/`drake`/`halfplate`/`regal`** — chỉ
  `cloth` · `sphinx` · `arcane`. Pháp sư mặc áo choàng mà đeo vai giáp tấm là lỗi đã mắc một
  lần rồi; test khoá lại bằng một khẳng định riêng.
- ⚠ **Spellblade phải `halfplate` ở CẢ 5 dải** — chữ ký của lớp là lệch vai (một bên giáp,
  một bên trần). Hàm vai nhận thêm tham số `side` và CỐ Ý vẽ khác nhau hai bên. Ngưỡng hiện
  của `hPauldrons` cũng hạ riêng cho `halfplate` (1.2 thay vì 2.5) để dải I — vốn tên là
  "Bán Giáp" — có vai ngay từ đầu.
- ⚠ `G.upper()` phải nhận **SM** (bảng màu BỘ) chứ không phải `M` (bảng màu BẬC), nếu không
  mũ ra một màu còn vai ra màu khác.

Test: `node <scratchpad>/test_sets.js` — bắt buộc 5 lớp khác nhau >3000 px ở bậc cuối, 5 dải
mỗi lớp khác nhau tuần tự, và Spellblade lệch vai ở mọi dải. ⚠ Khi đo lệch vai phải vẽ **riêng
lớp `hPauldrons`**: đo trên nguyên hình sẽ bắt được **thanh kiếm** (mọi lớp đều cầm một tay)
chứ không bắt được vai giáp — đối chứng Dark Knight lẽ ra 0 mà ra 215 px vì lý do đó.

### Cường hoá +0..+11 (`plusStage`)

> ⚠ **QUẦNG SAU LƯNG ĐÃ GỠ (2026-09-24)** — chủ dự án chốt: *"Tắt cái vầng sáng xung quanh nhân
> vật đi, remove nó luôn. Sẽ làm lại hiệu ứng +9 sau."* Gỡ **bốn** nguồn sáng tròn quanh thân:
> `hPlusAura` (quầng +7..+11) · `nvHaoQuangSau` (cửa gọi nó ở đường art nướng) · hào quang theo
> BẬC `glowCol` trong `drawHeroFigure` · hào quang + viền kim quang **Thần Hiệp** (`heroRimCanvas`).
> Cái cuối đáng nói: bản chơi thử phát cấp max + Axie 5★ cho **mọi** người ⇒ `isMaxed` đúng với tất
> cả ⇒ một vầng vàng trùm lên mọi nhân vật trên production, suốt phiên.
> **CÒN GIỮ:** tàn lửa (+7) · dải quét (+10) · ấn Thần Hiệp dưới chân. ~~viền sáng (+4)~~ — gỡ ngay
> sau đó (`nvVienSang`, *"gỡ luôn viền cam đi"*): +1..+6 nay TRƠ, `test_plusglow` gác chiều đó.
> `test_plusglow ⑦` gác chiều ngược lại (ba hàm phải không còn; +11 không được có điểm sáng nằm xa
> bóng dáng), và ngưỡng "+7 nhảy ×3" đã **tạm hạ** vì cú nhảy ấy chính là cái quầng — làm lại
> +7..+9 xong thì kéo lại. Phần mô tả bên dưới là thiết kế GỐC, đọc nó như lịch sử.
> ⚠ `test_herosprite §2` đổi theo: nó từng đòi "mép sprite trong suốt", đúng chỉ vì quầng mờ là thứ
> ngoài cùng của một sprite **cắt sát hộp bao**. Nay đo đúng thứ nó gác — hộp bao lọt trong lề `HS_PAD`.

Đúng mốc MU Online: **+7 là ngưỡng phát sáng**. Bốn mốc, mỗi mốc thêm một hiện tượng KHÁC
(không phải chỉ chói hơn): `0` (+0..3) trơ · `1` (+4..6) viền sáng quanh vai/mũ · `2` (+7..9)
hào quang nóng sau lưng + tàn lửa bay lên · `3` (+10,11) thêm dải sáng quét dọc thân.

- `hPlusAura` (sau lưng) · `hPlusSpark` (trước thân) · `hPlusSweep` (trong clip thân) ·
  `plusRim()` cho viền. Viền tạo bằng cách **vẽ lại chính hình đó to hơn 12% màu sáng ở lớp
  dưới** — rẻ hơn dựng mặt nạ silhouette mỗi khung.
- Trong mỗi mốc còn một thành phần **liên tục** theo `plus`, vì nếu chỉ chia mốc thì +7 với
  +9 đo ra **0 pixel khác biệt** — mà đó là cả một chặng rèn dài.
- ⚠ `gv.plus` phải **nhân độ phủ** y như `gv.t`. Thiếu bước này thì đeo mỗi cái mũ +11 rồi bỏ
  trống 4 ô vẫn rực như mặc đủ bộ (test bắt được lỗi này).
- ⚠ Khoá `_heroCardCache` phải gồm cả mức rèn.

Test: `node <scratchpad>/test_plusglow.js`. Lưu ý khi sửa test: hào quang theo BẬC (`M.glow`)
vốn đã đập nhẹ từ trước, nên **+0 động theo thời gian là bình thường** — đừng khẳng định
"+0 phải đứng yên"; thứ cần chứng minh là +11 động THÊM đáng kể.

### Hoạt ảnh — 3 lớp cảm giác

- **Quán tính phụ** (`player.sway` / `swayV` / `swayDir`, tính trong `update()`): hai con lò
  xo chạy TRỄ sau chuyển động thật, đi vào `ps.sway`/`ps.swayDir`. Mọi bộ phận MỀM (áo choàng,
  vải rủ, lông vũ, mảnh phép) phải đọc chúng, đừng đọc thẳng tư thế tức thời — đọc thẳng thì
  vải dính vào chân, dừng là tắt ngay. Đo được: vừa dừng chạy `sway` **vẫn còn tăng** (0.893 →
  0.897) rồi mới lắng về 0.02 sau 1,2s.
- **Vai giáp xoay theo tay**: `hPauldrons` xoay quanh `HERO_JOINT.shL/shR` với **35%** góc cánh
  tay. Không phải 100% — giáp nặng và có dây giữ nên đi sau tay.
- **`hSwing(p)`** — đường cong ra đòn: hõm NGƯỢC tới −0.30 (lấy đà) → vọt quá 1.10 (vượt đà) →
  về đúng 1. Dùng cho `slash` và `spin`. ⚠ Đừng thay lại bằng nội suy tuyến tính: `-0.7 + p*2.1`
  làm đòn đánh trôi đều, mất hết sức nặng.

⚠ `heroPose(wph, mv, atkK, castK, now, act, sway, swayDir)` — hai tham số cuối thêm SAU `act`
nên mọi lời gọi 6 tham số cũ vẫn chạy. Giữ nguyên quy ước đó khi thêm tiếp.

Test: `node <scratchpad>/test_anim.js`. ⚠ Game **đã bỏ WASD** — di chuyển là click-to-move qua
`moveTarget`; test nào đặt `keys.d = true` để bắt nhân vật chạy sẽ đo ra 0 mà không báo lỗi.

### ĐI hay CHẠY — cửa là TỐC ĐỘ, và nhịp bước phải ĐO chứ đừng đoán

`dangChay(p)` là luật DUY NHẤT: `p.speed >= CHAY_TOCDO (131)` thì CHẠY (`00_Run`), dưới đó ĐI
(`00_Walk`). Cửa **Giày +6** đời trước đã gỡ (`GIAY_CHAY_PLUS` không còn) — nó đổi dáng theo
trang bị nên ai chưa có giày cũng bị khối ĐI gánh tốc độ 209 px/giây.

**Số đo sinh bằng `tools/do_dang.js`, đừng chép tay.** Bốn cột, mỗi cột một câu hỏi khác nhau:
`sảiBọc` (mắt đọc ra bước dài chừng nào) · `tảiĐất` (bàn chân chống đất lùi được bao nhiêu) ·
`đốiXứng` (mấy bước một vòng) · `nhún`.

- **⚠ HAI chỗ phải cùng gọi `dangChay()`**: `drawPlayer` chọn KHỐI VẼ, `update()` chọn SẢI CHÂN
  (`SAI_CHAN.w` / `SAI_CHAN.r`) để tính `walkPh`. Tách ra hai luật là bàn chân **trượt đất
  ~40% quãng đường mỗi vòng** — nhìn chỉ thấy "hình như đi hơi lạ", rất khó lần ra.
- Nhánh `_bay` phải đứng TRƯỚC nhánh đi bộ trong chuỗi chọn khối.

**⚠ HAI CÁI SAI ĐÃ SỬA, cộng lại thành hệ số 2,77 — nhịp chạy 1,18 thay vì 2,90 bước/giây:**

1. **Hệ số quy đổi bảng khung → màn hình là `NV_CAO/HERO_H` = 0,600**, không phải
   `NV_CAO/CAO_THAN_NUONG` = 0,830. Một bên là chiều cao Ô VẼ, bên kia là chiều cao THÂN —
   lệch 38%. Chỗ khác trong tệp (`NV_THAN_PX`) vốn đã quy đổi đúng, nên hai dòng cãi nhau mà
   nhìn qua không thấy.
2. **Một vòng bảng khung là MỘT bước, không phải hai.** Chú thích cũ khai hai rồi nhân đôi số
   đo. Đo lại cả 10 khối (5 bộ × đi/chạy): `đốiXứng` ra **0,48–0,64**, trong khi vòng hai bước
   phải ≥0,85. Nửa vòng sau của mấy bảng này là dáng **ĐỨNG**, không phải bước của chân kia.

**Còn nợ, mã KHÔNG chữa được:** `tảiĐất` chỉ bằng ~49% `sảiBọc` — tức **51% quãng đường là
trượt chân nằm sẵn trong bản vẽ**. Bàn chân chống đất gần như đứng yên tại chỗ trong 16/32
khung. Không giá trị `SAI_CHAN` nào chữa nổi; phải vẽ lại vòng đi/chạy.
Bản đặt hàng + ngưỡng nghiệm thu: `docs/DAT_HANG_TUONG_DI.md`.
~~**Spellblade còn thiếu hẳn một hàng bảng khung**~~ — hết hiệu lực: Spellblade đã rời sang gói
`magic-runtime` và `sbhd1` đã gỡ khỏi đĩa. Giữ lại đoạn dưới vì nó mô tả một kiểu hỏng có thật
của đường nướng Spine: `sbhd1` có 96 ô (6 hàng) trong khi bốn bộ
kia 112 ô, nên khối chạy của nó chỉ đọc được **nửa đầu** vòng.

Test: `tests/test_walkrun.js`. Mục 3 đo `walkPh` chuẩn hoá **theo px đã đi**, không theo thời
gian — chia theo thời gian thì hai lượt đo không đi bằng nhau và sai số 11%.
⚠ Mục 1 **đọc ngưỡng từ game**, đừng chép cứng con số: bản đầu kiểm thẳng `126` và khi sửa
`SAI_CHAN` cho đúng số đo thì bài đỏ ở một chỗ chẳng liên quan gì tới thứ nó định gác.

### 🧭 TÁM HƯỚNG NHÌN — hướng nằm TRONG TÊN BỘ

Chủ dự án chốt đủ 8 hướng như MU Online. **8 hướng chỉ tốn NĂM bản vẽ**: Đông↔Tây, ĐB↔TB,
ĐN↔TN lật ngang là ra nhau; chỉ Bắc và Nam phải vẽ riêng (cách Ragnarok và Diablo II làm).

Trước bản này art chỉ có một hướng nghiêng, mà `drawPlayer` vẫn tính cờ `_ps.back` rồi nhét
vào khoá đệm sprite — đo được `back=true` và `back=false` lệch **0 trên 52.000 điểm ảnh**, tức
trả gấp đôi ô nhớ để lấy hai tấm giống hệt nhau. `back` nay chỉ còn trong khoá khi bộ **không**
có art (đường vẽ bằng đường thì `ps.back` đổi thật: gáy, mũ trùm).

- `NV_HUONG` — 8 hướng → `{ban, lat}`. Mã bản vẽ: `''` (nghiêng) · `bd` · `b` · `nd` · `n`.
- `NV_BANVE[bộ]` — bộ đó có sẵn những bản nào. Không khai = chỉ có bản nghiêng.
- `nvChonHuong(bộ, góc)` — chọn bản tốt nhất bộ **đang có**, lui về bản gần nhất khi chưa có.
- **Hướng nằm trong TÊN BỘ** (`dkcw1` + `'b'` = `dkcw1b`), nên mỗi hướng có hộp cắt
  (`NV_LOP_HOP`) và số khung (`NV_KHUNG_R`) riêng. **Thêm một hướng = ba dòng dữ liệu**, không
  sửa một dòng máy nào.

⚠ **Lui về bản gần nhất phải đo từ GÓC THẬT, không từ góc đã làm tròn về một trong tám nấc.**
Làm tròn trước thì ở dải 90°–112,5° máy chọn Đông trong khi luật cũ `Math.cos(face) < 0` chọn
Tây — tức bật tầng hướng lên là nhân vật quay ngược ở một dải góc, **dù chưa có tệp art mới
nào**. `tests/test_huongnhin.js` quét **720 góc** chứ không quét 8 mốc, vì chỗ hỏng nằm GIỮA
hai mốc.

⚠ **Chi tiết bất đối xứng nhảy sang bên kia khi lật.** Spellblade lấy vai lệch làm chữ ký lớp
(`halfplate`): quay sang Tây là giáp đổi vai. Chấp nhận hay vẽ đủ 8 hướng riêng cho Spellblade
là việc của chủ dự án — máy đỡ được cả hai.

### ⚠ KHUNG DỰNG LÚC ART CHƯA VỀ THÌ KHÔNG ĐƯỢC NHỚ LẠI

Bộ đã cắt lớp (**cả năm thân trần**) đi đường `nvKhungGop()`, mà hàm đó trả `null` khi một lớp
chưa tải xong. Khoá đệm sprite chỉ ghi được chuyện "thiếu TẤM LIỀN" (dấu `?`) — mà bộ cắt lớp
thì **không bao giờ** có tấm liền, nên dấu đó bật sẵn ở cả hai trường hợp. Khung nào lỡ dựng
trong mấy trăm mili giây đầu nằm lại trong đệm dưới ĐÚNG cái khoá mà lượt vẽ sau dùng — và nó
là hình dựng bằng đường, tức **một nhân vật khác hẳn** (hiệp sĩ xám, mũ sừng, áo choàng đỏ).

Đo được: **cả 5/5 lớp** đều dính, khối đứng 1 khung nhiễm. Khung `i4` đếm 12.828 điểm ảnh
trong khi hai khung kề bên 6.606/6.733. Khối đứng lặp ~4 giây một vòng ⇒ nhấp nháy suốt phiên.

Chữa ở chỗ **NHỚ**, không ở chỗ vẽ: `_choArt` trong `heroSprite()`. `tests/test_khungdoc.js`
gác — và nó **không đặt ngưỡng phần trăm**, nó dựng lại chính khung đó dưới một khoá khác
(bật `TEST_TO_PHANG`, cờ này nằm trong khoá và chỉ tô đè MÀU nên bóng dáng giữ nguyên từng
điểm ảnh) rồi so alpha: lệch một điểm ảnh cũng bắt.

### Cảm giác chiến đấu — 6 chỗ dễ làm sai

- ⚠ **KHÔNG dùng `ctx.filter`** trong vòng vẽ. Nó buộc canvas dựng surface phụ, chi phí tuyến
  tính theo số đối tượng. Loé trắng khi trúng đòn nay vẽ đè bằng `globalCompositeOperation =
  'lighter'` (quái khung xương) hoặc bản nhuộm sẵn có cache `tintedImg()` (quái dùng ảnh —
  quái vàng đứng suốt 12 phút nên đây là chỗ tiết kiệm lớn nhất). Chỗ duy nhất còn `filter`
  là bên trong `tintedImg`, trả giá một lần cho mỗi ảnh. `ctx.shadowBlur` cùng họ, cũng tránh.
- `m.hitCol` — màu loé theo LOẠI đòn (trắng thường · vàng bạo kích · màu hệ khi khắc hệ).
- ⚠ **`sfx_hit.mp3` không tồn tại trên đĩa.** Đừng gọi lại tên đó. Âm chạm dùng `smash_<hệ>`
  (đã có sẵn 9 file). Trước khi thêm bất kỳ `AudioSys.sfx('x')` nào, kiểm `assets/music/sfx_x.mp3`
  có thật không — `sfx_bikip.mp3` cũng đang thiếu.
- **`swingFeel(crit, w, m)`** — hitstop/rung/loé bạo kích gom theo **cú đánh**, không theo mục
  tiêu, qua cửa sổ 60 ms giữ giá trị mạnh nhất. Đặt trong `hurtMob` nghĩa là AoE trúng 8 con
  kích hoạt 8 lần và đạn multishot làm hitstop nối đuôi. `w = final/m.maxHp` cho đòn nặng khựng
  lâu hơn đòn cào.
  ⚠ Test đo hitstop phải đặt `_swingT = 0` để mở cú đánh mới, nếu không đòn của phần test
  trước còn giữ `_swingBest` và mọi số đo ra 0 mà không báo lỗi.
- **`player.pendingHit`** — đòn thường nổ ở **khung tiếp xúc** (0,09 s), không phải khung đầu.
  `hSwing` đẩy khoảnh khắc lưỡi chạm ra p≈0.41 nên bắn sát thương ở p=0 lệch ~8 khung. Tìm lại
  mục tiêu lúc chạm ⇒ đòn HỤT nếu quái đã chết/chạy xa. Phải dọn trong `buildWorld()` và
  `loadGame()`.
  ⚠ `lungeK = hSwing(1 - atkK)` chứ không phải `atkK`: `atkAnim` **đếm ngược** nên `atkK` = 1 ở
  khung ĐẦU — dùng thẳng thì thân dồn tới lúc lấy đà rồi lùi khi bổ xuống, trọng tâm đi ngược
  chiều đòn.
- **`SETTINGS.shake` nay là 0/1/2** (Tắt · Nhẹ mặc định · Đầy), có di trú từ boolean cũ.
  Rung là **xung có hướng** (`shakeDir`) tắt dần, không phải random 2 trục mỗi khung. Bỏ hằng
  `0.16` cũ — `shakeT` được đặt tới 0,25 ở nhiều chỗ nên biên độ từng vượt trần 1,56×.

Test: `node <scratchpad>/test_feel.js`.

## ⏱ BỘ TỰ CHỈNH CHẤT LƯỢNG — **KHUNG HÌNH LƯỢNG TỬ HOÁ, ĐỪNG LẤY TRUNG VỊ MILI-GIÂY**

Gác: **`tests/test_resscale.js`** (9 mục) · cửa duy nhất là `fxAutoTune(ms)`.

Chủ dự án mở link chơi thử ra và nói đúng một câu — *"lag quá"*. Truy ra **ba lỗi cùng một họ**,
cả ba đều im lặng tuyệt đối, và cả ba đều là hệ quả của một hiểu nhầm duy nhất: **`ms` không
phải một đại lượng liên tục.**

`ms` là khoảng cách giữa hai lần `requestAnimationFrame`, mà rAF khoá theo nhịp quét màn hình —
nên nó chỉ nhận **bội số của chu kỳ quét**. Bọc chính `fxAutoTune` lại rồi đọc dòng `ms` thật ở
cảnh 130 quái (`?max=1` · cấp 120 · full +11 · cánh bậc 3): **2.241 mẫu, đúng HAI giá trị —
33,3 và 16,7**, không một mẫu nào nằm giữa.

| lỗi | nó hỏng thế nào |
|---|---|
| ① **trung vị trên phân bố hai đỉnh** | `med` nhảy về 16,7 ngay khi **51%** khung kịp nhịp ⇒ ở đúng trạng thái giật 60/30, bộ tự chỉnh đọc ra *"ổn rồi"* và DỪNG. Đo được: dừng ở nét 85% rồi nằm im **80 giây** với một nửa số khung vẫn trượt |
| ② **bánh cóc một chiều** | nhánh nâng hỏi `med < 13`, mà trên màn 60Hz `ms` **không bao giờ** dưới 16,7 ⇒ chất lượng chỉ có đường đi XUỐNG. Vào một bãi đông quái một lần là cả phiên còn lại ngồi ở mức thấp, kể cả lúc về thành đứng không |
| ③ **chiều nâng đi sai thứ tự** | nâng hiệu ứng TRƯỚC rồi mới tới độ nét — cùng thứ tự với chiều hạ chứ không phải gương của nó, mâu thuẫn với chính câu *"hạ độ nét là trả giá sau cùng"* viết ngay bên cạnh |

⇒ Cả hai chiều nay hỏi **TỈ LỆ KHUNG TRƯỢT NHỊP** (`truot`, ngưỡng `TRUOT_MS` 20ms), thống kê
duy nhất còn đọc được trên một phân bố đã bị lượng tử hoá.

**⚠ ĐỪNG "chỉnh cho nhạy hơn" bằng cách hạ ngưỡng 19 xuống 17.** 16,7 là SÀN VẬT LÝ của màn
60Hz; mọi ngưỡng nằm giữa 16,7 và 19 chỉ là một cách khác để hỏi cùng một câu hỏi mù.

**⚠ MỘT NGƯỠNG KHÔNG BAO GIỜ CHỐNG ĐƯỢC DAO ĐỘNG Ở CHIỀU NÂNG, và lý do là vật lý.** Chạm 60 FPS
rồi thì rAF trả về 16,7 bất kể máy còn dư 5% hay dư 300% — **không đo được phần dư**. Mà nhảy một
nấc `0,60 → 0,75` là nhân số điểm ảnh lên `(0,75/0,60)² = 1,56` lần. Đo được: đang 60,2 FPS với
1% khung trượt, nâng một nấc ⇒ tụt còn **48,3 FPS với 76% khung trượt**, rồi hạ lại — nhấp nháy
chừng 15 giây một vòng, mà độ nét là thứ mắt bắt ngay (chữ mềm rồi lại nét).
⇒ Chặn bằng **TRÍ NHỚ** (`_resHong`), không bằng ngưỡng: mức nét nào đã thử và không gánh nổi thì
phiên này không tự leo lại. `setRes('auto')` xoá trí nhớ đó.

**⚠ `_resHong` phải là `Math.min`, KHÔNG phải `Math.max` — bản đầu tôi viết `max` và phép đo bắt
ngay.** Chuỗi hạ đi `1,0 → 0,85 → 0,75 → 0,60`, nên `max` giữ lại **1,0** (mức hỏng ĐẦU TIÊN) và
điều kiện *"chỉ leo lên mức thấp hơn 1,0"* hoá ra cho phép leo lại đúng 0,75 vừa bỏ. Đo được:
xuống 0,60 ở giây 25 rồi lên lại 0,75 ở giây 45 — y hệt lúc chưa có trí nhớ. Thứ cần nhớ là mức
**THẤP NHẤT** đã từng thất bại, vì mọi mức trên nó cũng thất bại theo.

**Đo được sau khi sửa**, cùng cảnh, cùng máy:

| | trước | sau |
|---|---|---|
| lắng ở | nét 0,85 · hiệu ứng Thấp | nét 0,60 · hiệu ứng **Vừa** |
| FPS | ~47 | ~53 |
| khung trượt nhịp | **~50%** | **~18%** |
| trả lại chất lượng khi về thành | **không bao giờ** | nét 0,6 → 1,0 trong 30 giây |

**⚠ CẦN GẠT DUY NHẤT LÀ ĐỘ NÉT — hai thứ tôi nghi đều bị phép đo bác bỏ.** `?max=1` bật
`TEST_MODE` (kèm `window.__vongChan`, một `Set` không ai xoá): đo ra **31,3 vs 30,3 FPS**, nằm
trong nhiễu, và Set ấy chỉ tới 24 phần tử. Zoom vào GẦN thì **chậm hơn** (33,9 vs 40,5): ít vật
thể hơn nhưng mỗi cái vẽ to hơn ⇒ nhiều điểm ảnh hơn.

**⚠ MẠNG KHÔNG NẰM Ở FPS, NHƯNG NÓ CÓ NẰM Ở CÚ KHỰNG.** Đếm request phát ra **sau** khi đã vào
game, qua ba lần đổi map: **58 request / 3,39 MB** (cây, đàn thú, bảng khung Axie — đều nạp lười).
Đó là thứ chơi local chữa được; nó **không** đổi lấy một khung hình nào.

**⚠ §7 CỦA BÀI KIỂM TỪNG NEO VÀO `1000/21`** — trung vị mili-giây, đúng cái vừa bị gỡ. *Một con
số chép từ ngưỡng cũ vào bài kiểm là một mỏ neo chỉ vào chỗ không còn gì.* Nay §7 hỏi thẳng
`TRUOT_HA` và `window.__fxTruotMax` (phơi ra khi `TEST_MODE`) — cùng thống kê với tính năng, đúng
luật "đừng dựng bản sao thứ hai của một luật đang sống".

**⚠ VÀ §7 GÁC CHIỀU HẠ QUA VẾT ĐI, KHÔNG QUA TRẠNG THÁI CUỐI.** Bản cũ chốt `res < 1 ⇒ fxq === 0`,
đúng hồi chiều nâng đi cùng thứ tự với chiều hạ. Từ lúc chiều nâng thành GƯƠNG thì trạng thái
*"nét 0,6 · hiệu ứng Vừa"* là hợp lệ và thường gặp. Bất biến còn lại là về CHUYỂN TIẾP: không bao
giờ HẠ độ nét trong lúc hiệu ứng chưa kịch đáy.

**⚠ GÁC BẰNG CÁCH BƠM THẲNG DÒNG `ms` VÀO HÀM, ĐỪNG ĐO QUA CẢNH THẬT.** Bản đầu của §8/§9 vào
map 130 quái chờ 50 giây, rồi ép chất lượng xuống đáy và về thành chờ 30 giây. Chúng chạy được,
in ra số đẹp, và **thử ngược CẢ HAI ĐỀU XANH** — vì trình duyệt headless không khoá vsync như một
màn hình thật nên nó không dựng lại nổi đúng cái điều kiện sinh ra lỗi. Cộng 80 giây chờ ⇒ vừa
đắt vừa không gác gì. Nay §8 bơm thẳng 90 mẫu vào `fxAutoTune`: tất định, tức thì, và **cả hai
phép thử ngược đều đỏ ở đúng mệnh đề của mình**. *Phép quyết định là một hàm thuần của dòng số —
không cần một cái máy có màn hình để hỏi nó.*

**⚠ `[45]` TRÊN 90 MẪU LÀ TRUNG VỊ **TRÊN**, nên cảnh thử phải 46/44 chứ không 45/45.** Chia đôi
chẵn thì trung vị rơi vào 33,3 và bản cũ cũng hạ ⇒ mệnh đề thành vô nghĩa. Chốt tự kiểm của §8
(đòi trung vị phải đúng bằng 16,7) bắt được ngay ở lượt viết đầu.

**⚠⚠ VÀ `test_resscale` CHÉP CỨNG `localhost:8853`, BỎ QUA `argv[2]` — đây là bài THỨ NĂM cùng
bệnh** (bốn bài kia đã ghi ở mục `rc=124`). Ba lượt thử ngược đầu của đợt này vì thế chạy vào
server đang có ở 8853 chứ không vào cổng được truyền, ra **ba kết quả giống hệt nhau và đều
xanh** — và tôi suýt kết luận là mệnh đề yếu. `reg.sh` thì `sed` cổng nên nó không bao giờ lộ ở
đó. Đã sửa để đọc `argv[2]`. *Ba lượt thử ngược ra cùng một con số là dấu hiệu QUE DÒ hỏng, không
phải dấu hiệu mã đúng — luật này đã ghi hai lần trong tệp và tôi vẫn dẫm lại.*

## 👁 ĐỌC ĐƯỢC TRÊN MÀN + ☠ RỦI RO — hai mảng thấp nhất bảng QA, và cả bốn lỗi đều ĐO ĐƯỢC

Gác: **`tests/test_docduoc.js`** (6 mệnh đề) · **`tests/test_ruiro.js`** (13 mệnh đề).
**Cả tám cơ chế đã thử ngược và đều đỏ.**

### ① Nhật ký cắt cụt ĐÚNG phần thưởng — và ba dòng tần suất cao nuốt phần còn lại

Cột `#combat-log` rộng 186px + `white-space:nowrap` + `text-overflow:ellipsis` ⇒ đo được
**30/31 dòng bị cắt**, và phần bị cắt LUÔN là phần thưởng:
`☠ Hạ Axie Heo Rừng — Nhận: +28 EXP +17◈` cụt đúng ở chữ *"Nhận"*. Nhật ký tồn tại để nói
*ngươi vừa được gì*; cắt đúng chỗ đó thì nó chỉ còn là tiếng ồn. Nay **cho xuống dòng**
(`overflow-wrap:anywhere`) — `max-height:22vh` + `overflow-y:auto` vốn đã lo phần cao. Đo lại:
**0/41 dòng bị cắt.**

**`logCombat(text, color, gop)` — GỘP, KHÔNG BỎ.** Cùng khoá với dòng ĐANG ĐỨNG ĐẦU thì cộng dồn
vào chính nó (`×N · tổng M`). Đo được 8 cú liên tiếp cùng mục tiêu: **8 dòng → 1**.

- ⚠ **CHỈ gộp vào dòng ĐẦU**, đừng đi tìm khắp hộp: gộp vào một dòng nằm giữa là thứ tự thời gian
  của nhật ký nói dối.
- ⚠⚠ **GỘP THEO (TIỀN TỐ × MỤC TIÊU), ĐỪNG LOẠI TRỪ ĐÒN ĐẶC BIỆT.** Bản đầu tôi chỉ gộp đòn
  THƯỜNG và để `KHẮC HỆ`/`HOÀN HẢO`/bạo kích mỗi cú một dòng — nghe hợp lý, và phép đo bắt ngay:
  ở Rẻo Rừng Corran vũ khí khắc hệ đàn heo nên **8/8 cú đều mang tiền tố** ⇒ phép gộp thành vô
  dụng đúng ở chỗ nó cần nhất. Tiền tố nằm TRONG khoá (hai loại không trộn) và vẫn nằm trong chữ
  hiện ra, nên người chơi vẫn đọc được "đòn này khắc hệ" — chỉ là một dòng thay vì tám.

### ② Quái chìm vào ĐẤT — không phải chìm vào hòn đá

`Axie Heo Rừng` là khối NÂU (110,76,58) đứng trên **lối mòn NÂU**; chênh sáng với decor quanh đó
đo được **29/255**. ⚠ Báo cáo QA đổ cho *"thanh máu chỉ hiện khi đã bị đánh"* — **SAI**: thanh máu
vẽ vô điều kiện, lệnh `return` của nhãn nằm SAU nó. Kết luận của họ đúng, nguyên nhân họ nêu thì
không. *Một triệu chứng đọc đúng không bảo đảm cái nguyên nhân đi kèm nó cũng đúng.*

Hai lớp, cả hai **nằm ngoài** đường bao con vật (cùng nguyên lý rìa sáng và viền +N):

| | |
|---|---|
| **vòng chân** | một nét tối + một nét theo HỆ, vẽ cho **MỌI con còn sống**. Cây và đá không có vòng nào ⇒ chính cái vòng tách sinh vật khỏi địa hình |
| **viền tối** | bóng đơn sắc của chính tấm đó vẽ lệch bốn hướng, NẰM DƯỚI thân |

- ⚠ **Vòng chân KHÔNG được gắn vào `mobHe`.** Bản cũ là hào quang hệ `alpha 0.14` (dưới ngưỡng
  đọc được) và **chỉ vẽ khi con đó có hệ** — con chưa khai hệ mất hẳn tín hiệu.
- ⚠ **Viền đi qua `tintedImg`** nên trả giá lọc đúng một lần mỗi tấm. **KHÔNG `ctx.filter` trong
  vòng vẽ, KHÔNG `shadowBlur`** (cả hai đã bị cấm tại chỗ), và **đừng phóng to sprite** — đó là
  đúng cái đã phải gỡ ở mục Trụ Đá.
- ⚠ **Viền gác sau `SETTINGS.lowFx`, vòng chân thì không.** Bốn `drawImage` thêm cho mỗi con đo
  được **69 → 51 FPS** ở headless-CPU (14,4 → 19,7 ms/khung). Vòng chân là một nét ellipse và nó
  mới là thứ trả lời *"đây là sinh vật"*. Đừng đẻ cờ thứ hai — `lowFx` là công tắc ĐÃ CÓ.

### ③ Chết không mất gì ⇒ nay mất **5% ngân sách XP của chính cấp đang đứng**

Đo một cái chết THẬT rồi `respawn()`: `cấp 5 · 796 XP · 1.588◈ · 15 mạng · túi 2` ⇒ **y hệt,
không lệch một trường nào.** `chetMatXp()` là cửa DUY NHẤT, nên con số người chơi ĐỌC trên màn bại
trận và con số máy TRỪ không thể lệch nhau.

Chọn EXP vì ba lẽ: một con số đọc được ngay · **không bao giờ tụt cấp** (kẹp ở `player.xp`) · tự
nhạt đi khi người chơi mạnh lên.

**⚠⚠ ĐỪNG HỎI `md.type === 'safe'` — tôi viết đúng cái sai ấy trước, và phép đo bắt được:** cấp 25
chết ở Beast Herd Camp (`ngoai`) mất **0 EXP**. `ngoai` khai `safe` (không PK) nhưng nó là **bãi
săn 8 bãi**, tức đúng chỗ người chơi cày nhiều nhất lại thành chỗ không có rủi ro. Cùng cái bẫy đã
ghi nguyên văn hai lần trong tài liệu này (Rương Canh · Axie nhập vào): **cửa duy nhất đúng là CÓ
BÃI QUÁI**. Thành thật không có bãi nào nên nó tự được miễn, không cần hỏi cờ `safe` lần nào.

Bốn chỗ miễn, mỗi chỗ một lý do — đừng gộp cho gọn: dưới cấp 10 (tân thủ phải tha) · map không có
bãi quái · `md.pvp` (**luật đã chốt**: *"Thua một trận đấu không được phép đụng vào bản lưu"*) ·
`md.dungeon` (Tầng Sâu đã có giá riêng, cộng thêm là phạt hai lần).

⚠ **Khoản phạt đặt SAU hai nhánh hồi sinh** (THIÊN MỆNH `traitRevive` · Bản Nguyên Công
`tienthiencong`), và đó là đúng: hai cái đó nghĩa là *ngươi không chết thật*, nên không phạt.
Hệ quả cho bài kiểm: cảnh đo phải **tắt cả hai** trước khi giết, không thì nó đỏ theo xúc xắc —
`startGame` bốc thiên phú ngẫu nhiên nên cái chết đầu có khi miễn phí, và phép đo ra 0 trong khi
mã hoàn toàn đúng. `test_ruiro` đỏ 1/5 lượt trước khi thêm ba dòng tắt ấy, và nay nó tự kiểm
(`hoiSinh`) rồi mới chấm.

⚠ **Và phải NÓI RA — kể cả khi KHÔNG mất gì, kèm lý do.** Im lặng ở chỗ được miễn thì người chơi
không phân biệt được *"chỗ này tha"* với *"cơ chế hỏng"*.

### ④ Mục Tiêu Hôm Nay xong trong 2 phút ⇒ đặt lại theo NHỊP HẠ QUÁI ĐO ĐƯỢC

Nhịp thật (AUTO, 60 giây trong game, đo bằng chính vòng `update`):
**cấp 5 → 14 mạng/phút · cấp 11 → 24 · cấp 20 → 37 · cấp 30 → 39.**
⇒ `kills:10` ở dải 1 tốn **25-43 giây**, `kills:15` ở dải 2 tốn **24 giây** — cả tầng NGÀY là một
dòng và nó đóng trước khi người chơi kịp ngồi xuống. Nay ô `kills` đặt theo mốc **~3 phút cày**:
`60 → 90 → 110 → 120 → 130 → 140 → 150`.

⚠ **Trên cấp 30 là GIẢ ĐỊNH, không phải số đo** — nói thẳng chứ không giấu. Nhịp phẳng lại ở
~39 mạng/phút từ cấp 20→30 nên bốn dải cuối lấy đúng mốc phẳng đó; `tools/do_nhipcap.cjs` hiện
không chạy được từ cấp 60 trở lên.

**⚠⚠ CHỈ NÂNG SỐ LƯỢNG, ĐỪNG THÊM Ô VÀO DẢI 1 — tôi làm sai đúng chỗ này và `test_earlygame`
bắt được.** Bản đầu tôi cho dải 1 thành `{kills:45, forge:1}` cho "đỡ trống", và thế là dải 1
(2 ô) **BẰNG** dải 2 (2 ô) — phá đúng tính chất mà bảng này sinh ra để có: **số ô lớn dần theo
cấp**. Bài kiểm cũ chốt `daily1 === ['kills']` nhìn thì giống một hằng số chép cứng, nhưng nó
đang gác một thiết kế thật; tôi đọc nhầm nó thành lời nói dối rồi suýt sửa bài kiểm cho vừa ý
mình. *Trước khi gọi một khẳng định cũ là "chốt cứng đã mục", hỏi xem nó đang gác TÍNH CHẤT gì.*
Hình dạng thang giữ nguyên (**1 · 2 · 3 · 4 · 5 · 5 · 5** ô); chỉ con số `kills` đổi. Thứ cần
chữa là ĐỘ DÀI, không phải số dòng.

**⚠ VÀ TUYỆT ĐỐI KHÔNG THÊM `via` VÀO DẢI 1 — đó là một phép đo.** `viaHomNay()` bốc ba
trong bảy vùng có Dòng; đo một ngày thật ra `trungnut · chungnam · caungam`, giao với map mà nhân
vật cấp ≤11 tới được (`ardhaven · ngoai · corran · pvp`) là **RỖNG**. Mà thưởng ngày đòi xong HẾT
⇒ một ô bất khả là **khoá câm cả phần thưởng**, không lỗi nào báo. Đúng bài học "CỬA CƠ CHẾ MỞ Ở
CẤP NÀO": hỏi *đếm được không* rồi phải hỏi tiếp *ai cũng làm được không*.

**Nợ có sẵn, ghi ra chứ không lặng:** `via` ở dải 4 (cấp 40-59) vẫn dính cửa hẹp của đúng cái bẫy
đó — cấp 40-59 tới được 4/7 vùng có Dòng, nên ~3% số ngày cả ba vỉa nằm ngoài tầm. Chữa đúng là
cho `dailyReset` bốc mục tiêu theo cấp người chơi; đó là một đợt riêng.

### ⚠ BỐN LỖI CỦA CHÍNH BÀI KIỂM — cả bốn cho một kết quả trông rất thuyết phục

1. **Lệch chuẩn trong ô 26px là phép đo MÙ cho việc "quái có tách khỏi nền không".** Nó đo tương
   phản BÊN TRONG con vật, thứ vốn đã cao: **42,1 → 41,6** sau khi sửa, tức nói ngược. Phải đo
   **năng lượng biên** (`|∇L|` trung bình).
2. **Rồi so biên-tại-quái với biên-tại-NỀN cũng hỏng, hai lần.** Ô nền chọn cứng thì rơi trúng đồ
   (map có **102 con quái**); ô "chắc chắn trống" thì vướng đường ghép viên lát. Nền đo ra 1,8 hay
   4,9 tuỳ chỗ lấy mẫu ⇒ **nó không phải một cái mốc**. Cách đúng: **A/B trên cùng một khung, cùng
   những điểm ảnh ấy**, bật/tắt chính cơ chế (`SETTINGS.lowFx`) — nền là hằng số nên tự triệt tiêu.
   Đo được **+42% năng lượng biên**.
3. **Đếm lời gọi `ctx.ellipse` để kiểm vòng chân là một cái chốt đúng ở MỌI trạng thái** — riêng
   bóng đổ đã hai ellipse mỗi con. Phép thử ngược **đỏ lặng**. Nay `drawMob` phơi
   **`window.__vongChan`** (chỉ khi `TEST_MODE`) — cùng lối `__veChet` · `__avaKhoi` · `__veVuKhi`.
4. **`camera.x` là góc TRÊN-TRÁI, không phải tâm.** `Math.abs(m.x - camera.x) < VW` gom cả con nằm
   ngoài mép trái rồi đòi chúng phải có vòng ⇒ đỏ 17/21 trên mã ĐÚNG.

⚠ Và một mệnh đề **đỏ theo xúc xắc**: `HOÀN HẢO` bốc ngẫu nhiên mỗi cú nên tám cú tự nhiên bị cắt
thành hai ba cụm. Ghim `Math.random` trong lúc đo — cái cần gác là *hai cú LIÊN TIẾP CÙNG LOẠI thì
phải gộp*, không phải xúc xắc.

## Sự kiện thế giới — neo theo GIỜ THẬT

Lịch Tu Tiên (Can Chi/Tứ Quý/năm tháng) đã gỡ. `gameTimeInfo()` vẫn chạy ngầm cho
nhịp ngày/đêm (+10% EXP đêm) và thời tiết, nhưng KHÔNG hiển thị nữa. Chip HUD
`#hud-time` nay là **Đồng Hồ Thế Giới**: giờ thật + đếm ngược sự kiện gần nhất,
bấm mở **Bảng Sự Kiện** (`openEventBoard()`).

Nhịp chuẩn: **cứ 2 giờ thật có một sự kiện thế giới**, hai hệ lệch pha nhau:
- **Hung Thần Giáng Thế** (`MATON`) — 0h/4h/8h/12h/16h/20h, 1 boss, 30 phút
- **Xâm Lăng Vàng** (`GOLDEN`) — 2h/6h/10h/14h/18h/22h, 12 phút: 8 quái vàng + 1
  Chúa Đàn Vàng tràn vào 1 map thường (xoay vòng 7 map). Mỗi con CHẮC CHẮN rơi
  Bảo Hạp theo bậc map (`GOLDEN_BOX`: I→V), chúa đàn +1 bậc. `goldify()` CLONE
  def trước khi sửa (tuyệt đối không mutate `MOBS`), `zone=null` nên chết là hết.
  Quái khung xương nhuộm `goldenPal()`, quái ảnh nhuộm `ctx.filter` sepia.
  Debug: `debugGolden(giây)` / `debugMaTon(giây)`.

Không lưu state sự kiện — mốc giờ tính lại được từ đồng hồ thật.

⚠ Sự kiện mới PHẢI vào `eventList()` để hiện trên Bảng Sự Kiện + chip đồng hồ.

### ⏱ MỐC GIỜ NEO THEO **UTC**, và đừng bao giờ dùng `getHours()` để tính nó

`matonNextBoundary` · `goldenNextBoundary` · `riftNextBoundary` là **số học thuần trên epoch**
(`MATON_CHU_KY` 4h · `GOLDEN_LECH` +2h · `RIFT_CHU_KY` 6h). Trước bản này cả ba dùng
`d.setHours(d.getHours()+1)` rồi `while (d.getHours() % 4 !== 0)` — mà `getHours()` trả giờ
**ĐỊA PHƯƠNG**, nên mỗi múi giờ ra một mốc khác nhau. Đo được ở cùng khoảnh khắc
`2026-09-14T10:30Z`:

| máy người chơi để | mốc Hung Thần kế tiếp |
|---|---|
| UTC | `12:00Z` |
| `Asia/Ho_Chi_Minh` | `13:00Z` — **lệch 1 giờ** |
| `Asia/Kolkata` | `14:30Z` — **lệch 2,5 giờ** |
| `Pacific/Chatham` | `11:15Z` |

Trớ trêu là `matonMapFor()`/`goldenMapFor()` **vốn đã đúng** — chúng là số học trên epoch. Nên
hai người ở hai múi giờ **đồng ý map nào bị đánh mà không đồng ý lúc nào**. Với game chơi một
mình thì không ai biết; với "cùng nhau đánh một con boss" thì nó phá đúng cái tính năng đó.
Nay mốc và map cùng đọc một con số `slot`, nên chúng không lệch được nữa.

**⚠ HIỂN THỊ thì vẫn dùng giờ ĐỊA PHƯƠNG, và đó là đúng.** `ttGioSuKien()`, `fmtClock()`, chip
`#hud-time` in `getHours()` — người chơi muốn biết mấy giờ **theo đồng hồ của họ**. Mốc là tuyệt
đối, cách đọc nó là địa phương. Đừng "sửa" mấy chỗ hiển thị đó sang UTC.

**⚠ BÀI KIỂM CŨ MÙ VỚI ĐÚNG LỖI NÓ TRÔNG NHƯ ĐANG GÁC.** `test_golden` và `test_rift` kiểm mốc
giờ từ lâu, nhưng đọc `getHours()` và máy chạy bộ kiểm để `TZ=UTC` — ở UTC thì giờ địa phương
BẰNG giờ UTC, nên chúng xanh y hệt nhau dù mốc neo theo địa phương hay theo UTC. Nay hai bài đó
đọc `getUTCHours()` (nói đúng ý mình), và `tests/test_muigio.js` mới là thứ gác thật: nó mở
**6 ngữ cảnh Playwright với 6 `timezoneId`** rồi đòi mốc trả về phải trùng khít tới mili giây.
Đã thử trả `matonNextBoundary` về bản cũ để chắc bài đỏ được — nó đỏ, và còn bắt được cả **map
bị lệch** ở Chatham.
*Luật chung: một bài kiểm chạy ở đúng một cấu hình môi trường thì nó chỉ gác được cấu hình ấy.
`test_muigio §0` tự kiểm cảnh dựng trước khi chấm — đòi 6 múi giờ phải ra ≥4 độ lệch khác nhau,
vì nếu Playwright lặng lẽ bỏ qua `timezoneId` thì mọi con số trùng nhau và bài xanh vô nghĩa.*

**Còn một chỗ cùng họ, CỐ Ý để nguyên:** `tenuiGoldenHour()` (Vực Thẳm, Giờ Vàng 12h & 20h) vẫn
đọc giờ địa phương. Nó không phải sự kiện thế giới chung — "giờ vàng" ở đây có nghĩa là buổi
trưa/buổi tối **của người chơi**. Neo nó theo UTC là người Việt nhận giờ vàng lúc 19h và 3h sáng,
tệ hơn hẳn. Nếu sau này nó thành sự kiện chung thì phải đổi.

## ~~Khắc Ấn~~ — ĐÃ GỠ, đừng dựng lại

Cả hệ Khắc Ấn (`SIGIL_DEFS`, `_sigilTag`, `sigilTick`, `rollSigil`…) **đã bị gỡ khỏi game**
trong đợt kéo về mô hình MU. `game.js` ghi rõ lý do ở chỗ cũ: *"Đó là cơ chế của Diablo, không
phải của MU — MU không có món đồ nào ĐỔI CÁCH một chiêu hoạt động."* Nó cũng là hệ tốn nhất
trong sáu hệ bị gỡ: 110 chỗ nhắc tới, luồn qua cả `castSkill`, đường bay của đạn và `hurtMob`.

Mục này trước đây mô tả nó như một hệ **đang chạy**, và đã kịp làm lạc hướng một phiên làm việc
(2026-09-06) — nên giữ lại đúng cái tiêu đề này để cảnh báo, thay vì xoá trắng và để người sau
đọc `SIGIL_DEFS` trong lịch sử git rồi tưởng nó còn.

**Trục "đổi cách chiêu chạy" hiện nay là `EVO_PATHS`** (Tiến Hoá, mốc cấp 40/80/120): Bá Đạo /
Tốc Chiến chỉ đổi con số, còn **Lan Toả** đổi hành vi thật — +45% bán kính, −22% sát thương, tức
chuyển chiêu từ dồn một mục tiêu sang quét cả bầy. Xem `docs/NHIP_CAP_1_120.md`.

## So sánh trang bị — nửa còn lại của Loot 2.0

Với 15 dòng phụ đều là % thuần, người chơi không tự nhìn ra món vừa nhặt hơn hay kém.
Trước đây túi đồ chỉ có mũi `▲` xanh dựa trên `itemPower()`: nói được "to hơn", không nói
được "khác chỗ nào".

- `itemCompareHtml(it)` — phán quyết + chênh lệch TỪNG DÒNG so với món đang mặc cùng ô.
  Cảnh báo khi đổi món sẽ **rời bộ Cổ Thần** (mốc 2/3/5 mà bảng chỉ số không thấy).
- `itemStatMap(it)` gom dòng chính/phụ/Thức Tỉnh về một bảng trừ được nhau (khoá có tiền tố
  `m:`/`s:`/`a:` để dòng cùng loại không đè nhau).
- ⚠ **Ba cái bẫy mà bất kỳ "thuộc tính khan hiếm" nào cũng tạo ra.** Chúng từng phát sinh với
  Khắc Ấn (nay đã gỡ), và sẽ phát sinh y hệt với hệ đồ khan hiếm tiếp theo:
  1. `tryAutoEquip` + `autoEquipBest` tháo mất thuộc tính hiếm chỉ vì món mới hơn 5% chỉ số.
  2. `autoEquipBest` phải xếp hạng theo **hai khoá** — (có thứ hiếm) rồi mới tới lực chiến.
     Nhân lực chiến với một hệ số cố định là sai: thứ khan hiếm thì chênh chỉ số bao nhiêu
     cũng không mua lại được.
  3. Auto-bán (3 chỗ) + `sellItem` một chạm phải coi món mang thuộc tính hiếm là đồ quý.

Test: `node <scratchpad>/test_itemcompare.js`.

## Hệ thống kỹ năng (đã tối giản)

Taskbar **4 ô**, nay người chơi tự gán được (xem mục 🎯 bên dưới). Thanh MẶC ĐỊNH do
**`defaultSkillBar(sect)`** dựng, và nó đọc **`THANH_LOP`** trước — không còn là một công thức
cố định `['a','tp',O3,SIGNATURE]`. Các chiêu không nằm trên thanh quy thành **% Công Kích vĩnh
viễn** (`LEGACY_SECT_SKILLS` / `legacyAtkPct` trong `calcDerived()`), hiện ở tab Khác.

Ô 3 **không nhất thiết là chiêu buff**; `BUFF_SKILL_ID` **suy ra** từ `O3_SKILL_ID` (ô 3 nào có
`type:'buff'`), không khai tay.

### ⚠ DI SẢN = SÁU CHIÊU CỦA LỚP **TRỪ** NHỮNG Ô ĐANG TRÊN THANH

Một chiêu **không được vừa bấm được vừa cộng %ST vĩnh viễn** — luật đó không đổi. Đổi là **cách
giữ** nó. `calcDerived()` đã trừ động theo thanh từ đợt kéo thả, nên `LEGACY_SECT_SKILLS` nay
khai **cả sáu** chiêu chủ động của mỗi lớp (ngoài `a` và `tp`) và để phép trừ tự lo.

Bản cũ khai đúng bốn chiêu "không nằm trên thanh" — tức **chép tay KẾT QUẢ của phép trừ**. Mỗi
lần đổi một ô taskbar là phải nhớ sửa bảng cho khớp, quên thì %Công Kích lệch **âm thầm**. Cùng
họ với bước "rồi chép sang…" của `ISO_NEO`.

Số liệu không đổi với bốn lớp kia (hai chiêu vừa thêm đang nằm trên thanh nên bị trừ ra):
pool 12,0 − 4,0 · 13,0 − 5,0 · 12,0 − 4,0 · 12,5 − 4,5 ⇒ vẫn **+8,0%** như trước.

### 🔮 DARK WIZARD: METEORITE XUỐNG Ô 3, Ô 2 VÀ Ô 4 ĐỂ TRỐNG

Chủ dự án chốt (nguyên văn): *"Chuyển lại tuyệt chiêu meteriote sẽ là chiêu trấn phái 3 của DW.
2 chiêu còn lại là inferno + evil spirit sẽ nằm ở chiêu khác"* — và về hai ô trống:
*"cứ để trống mình sẽ fill sau"*.

| | |
|---|---|
| thanh DW | `['a', null, 'tp', null]` trong **`THANH_LOP`** |
| ô 3 | **Meteorite** — chính là `tp`, không phải một mã riêng |
| Inferno · Evil Spirit | rời thanh, sang tab Khác thành Di Sản |
| `O3_SKILL_ID.baidasan` · `SIGNATURE_SKILL.baidasan` | **`null`** = ô để trống CÓ CHỦ Ý |

- **⚠ `defaultSkillBar` phải `.slice()`.** Bản công thức dựng mảng literal nên mảng mới là mặc
  nhiên; đọc từ một bảng thì không — thiếu `.slice()` là mọi nhân vật cùng lớp dùng CHUNG một
  mảng và cú kéo thả đầu tiên sửa luôn bảng gốc cho cả phiên.
- **DW tạm ở +12,5%** thay vì 8,0%: không chiêu nào bị trừ vì thanh thiếu hai ô. Đó là cái giá
  đúng của việc thiếu hai nút bấm, và nó **tự về 8%** ngay khi hai ô được điền (Inferno 2,5 +
  Evil Spirit 2,0 = đúng 4,5 chênh lệch). Đừng "sửa" bằng cách hạ bậc chiêu.
- **⚠ Ô TRỐNG PHẢI ĐƯỢC KHAI RA.** Ba bài kiểm (`test_kynang5lop` · `test_tuyetchieu` ·
  `test_canbanglop`) đọc thẳng `THANH_LOP` để biết ô nào được phép trống. Miễn trừ bằng một danh
  sách tên lớp NGAY TRONG BÀI KIỂM là mở cửa cho lớp thứ hai rơi vào cùng trạng thái mà lọt êm.

### 🏹 SYLVAN RANGER: NGŨ TIỄN XUỐNG Ô 3 — và Ô 4 THÌ KHÔNG ĐƯỢC ĐỘNG VÀO

Chủ dự án chốt: *"đây là tuyệt chiêu ngũ tiễn của elf… Nó sẽ là tuyệt chiêu số 3 trấn phái,
mang hơi hướng đánh lan"*. Trấn Phái **vốn đã** là đòn lan (`TP_RADIUS` 185 · `desc` ghi thẳng
*"sát thương lan"*), nên đợt này chỉ đổi ART và VỊ TRÍ, không đụng một hệ số nào.

| | |
|---|---|
| thanh SR | `['a', 'elf_greaterdmg', 'tp', 'elf_penetration']` trong **`THANH_LOP`** |
| ô 3 | **Ngũ Tiễn** — chính là `tp`, đúng khuôn Meteorite của Dark Wizard |
| art | `five_arrow` trong `VFX_ATLAS_DEFS` + `CHIEU_TRANH.sx_toanchan_c` |
| tên | `SECTS.toanchan.tp.name` **'Ice Arrow' → 'Ngũ Tiễn'** |

- **⚠ ĐỔI CHỖ ĐÚNG HAI Ô (2↔3), ĐỪNG XẾP LẠI CẢ THANH.** Ô 4 là ô **TUYỆT CHIÊU** và phím Space
  gán thẳng vào nó (`SIGNATURE_SKILL`); đẩy Bless xuống đó là Space bấm ra một chiêu phù trợ.
  `test_tuyetchieu §5` gác đúng chỗ ấy — đã dẫm một lần khi thử xếp Penetration lên ô 2.
- **⚠ ĐỔI TÊN THEO ART, không phải để "Việt hoá cho đồng bộ".** Tấm dán là NĂM MŨI TÊN VÀNG,
  không còn phiến băng nào; để tên 'Ice Arrow' là bảng kỹ năng hứa một đằng còn màn hình cho một
  nẻo. Ba lớp kia vẫn để tiếng Anh, và đó vẫn là chủ ý (xem chú thích tại chỗ trong `canbang.js`).
  Không đặt 'Five Shot': `elf_fiveshot` đã mang đúng cái tên ấy và `test_kynang5lop` dò trùng tên.
- **⚠ `cong:false`.** 17,0% điểm ảnh đặc của gói là gần-đen (viền bao từng mũi tên). Cộng sáng ăn
  mất viền — đen cộng vào nền là ra chính nền — và cả nan quạt nhoè thành mấy vệt vàng nhợt. Đúng
  vết sẹo `fire_scream`: **độ sáng trung bình không quyết định một mình, viền đen thắng nó.**
- **`co` để TRỐNG (= 1,00) là cố ý.** Scale = `R/neoR` = 185/337,9 ⇒ tầm với vẽ ra **đúng bằng**
  vòng sát thương, tức `pham` không hứa suông. Khác Bão Quạ (phải thu còn 0,60): tấm đó là một
  vụ nổ 360° quanh người niệm, tấm này neo ở thân Axie rồi bung về **một** phía nên ở cỡ thật nó
  vẫn đọc ra một nan quạt chứ không trùm kín màn hình. Đã chụp 1,00 / 0,75 / 0,60 rồi mới chốt.
- **Gỡ `SECT_VFX.sx_toanchan_c` (`style:'icefall'`)** theo luật chung: có mặt trong `CHIEU_TRANH`
  mà còn khai style là chồng hai lớp lệch tâm. `test_tuyetchieu §4` suy từ bảng nên tự gác.

**⚠ VÀ NÓ LÀM LỘ MỘT BÀI KIỂM ĐO TRÊN CẢNH CỦA CHÍNH NÓ.** `test_ganchieu §3` kéo một chiêu Di
Sản vào **ô 1 chép cứng** rồi đòi %Công Kích tụt đúng bậc của chiêu ấy. Phép trừ đó sạch sẽ chỉ
vì ô 1 hồi đó là `tp` ở cả năm lớp — mà `tp` không nằm trong Di Sản. Từ lúc ô 1 của SR giữ Bless
(một chiêu Di Sản THẬT), kéo chiêu mới vào là **đẩy Bless ra và Bless trả lại % của nó**: đo ra
**−1 trong khi mong 1,5**. Bài đỏ vì cảnh dựng, không vì cơ chế. Nay §3 ưu tiên ô không giữ chiêu
Di Sản nào, và nếu không có thì **trừ lại** phần của kẻ bị đẩy; vế `knGo` chốt bằng một con số
đúng (`legacy0 − buLai`) thay vì dựng lại thanh rồi so với chính nó — dựng lại thì `knGo` hỏng
cũng xanh. Hai phép thử ngược đều đỏ (gỡ `!_tren.has(sid)` ⇒ 5/5 lớp; `knGo` no-op ⇒ 10 FAIL).
*Một hằng số vị trí chép cứng trong bài kiểm là một quả mìn hẹn giờ cho đợt xếp lại thanh kế tiếp.*

#### Bốn mệnh đề đã mục vì chúng đoán VỊ TRÍ thay vì hỏi MÃ CHIÊU

Cả bốn đỏ ngay khi `tp` rời ô 2 — và cả bốn đều đỏ vì cách hỏi, không vì cơ chế:

1. `test_kynang5lop` §3 khoá cứng `0 → sx_<lớp>_a`, `1 → sx_<lớp>_c` ⇒ báo *"Meteorite không khai
   hoạt ảnh riêng"* trong khi nó có nguyên một gói art. Tra theo **mã** (`id === 'tp'`), không
   theo chỉ số ô.
2. `test_tuyetchieu` §2 suy "cộng %ST hai lần" từ việc chiêu **có tên trong** `LEGACY_SECT_SKILLS`.
   Danh sách nay khai cả sáu nên phép suy đó hỏng; **đo** %ST thật (gỡ khỏi thanh phải làm nó tăng).
3. `test_kynang5lop` gộp `bar` + `diSan` để dò trùng tên — hai mảng nay GIAO NHAU nên một chiêu
   tự trùng với chính nó, ra `"Bulwark (thieulam+thieulam)"`. Gộp trong cùng lớp trước, và bỏ `null`.
4. `test_ganchieu` §3 lấy **chiêu Di Sản đầu danh sách** rồi kéo lên thanh — chiêu đó nay rất có
   thể đang ở ô 3, kéo sang ô 2 thì vẫn trên thanh, %ST tụt 0. Cảnh phải tự bảo đảm tiền đề:
   chọn chiêu **chưa nằm trên thanh**, và nói ra khi không tìm được cái nào.

### 💠 ĐIỂM TIỀM NĂNG NAY CÓ **HAI** CHỖ TIÊU — trần 5 điểm mỗi chiêu

Chủ dự án chốt: *"Giữ điểm tiềm năng lại và sẽ nâng được 5 điểm mỗi skill."*

Trước bản này `player.free` (mỗi cấp +5) có ĐÚNG một chỗ tiêu: năm chỉ số trong bảng Nhân Vật.
Nay có hai, và **hai chỗ giành nhau cùng một túi điểm** — đó mới là chỗ có lựa chọn.

| | |
|---|---|
| trần | `SK_TN_TRAN` = **5 điểm mỗi chiêu** |
| tác dụng | `SK_TN_DMG` = **+3% sát thương mỗi điểm** ⇒ đầy trần là **+15%** |
| lưu ở | `player.skillTn[id]` |
| cửa DUY NHẤT | `window.rotTiemNang(id)` |
| ăn vào đâu | `skTnMult(id)`, nhân cạnh `skLvMult(id)` ở **đúng một dòng** trong `castSkill()` |

- **Đây KHÔNG phải cấp kỹ năng.** Cấp (1-120) vẫn mua bằng Lumen + Bản Năng qua
  `upgradeSkillUI()`. Hai trục khác nhau, nhân dồn với nhau. Đừng gộp — Lumen/Bản Năng là thứ
  **farm ra được**, điểm tiềm năng thì **chỉ lên cấp mới có** và năm chỉ số cũng đang tranh.
- **Trần 5 là thứ giữ cho lựa chọn còn nghĩa.** Không có trần thì người chơi dồn hết vào đúng
  một chiêu và mọi chiêu khác thành đồ trang trí.
- Bị động không nhận điểm (khung chi tiết của bị động đi nhánh riêng, không in năm thông số).
- `loadGame()` vá `player.skillTn` cho save đời trước — **thiếu dòng đó là cú bấm đầu tiên nổ**.

Gác: `tests/test_tiemnang.js` (7 mệnh đề, cả bảy đã thử ngược). Ba chỗ đáng nhớ:
- ⑤ **tầng hành vi**: bọc `window.hurtMob` để bắt `player.atk` ĐÃ nhân ngay trong cú tung, rồi
  so hai lượt 0 điểm / đầy trần. Hỏi mã nguồn không bắt được ca "nhân nhầm chỗ".
  ⚠ Phải đặt `player.atk` đủ LỚN trước khi đo: `castSkill` làm tròn, nên ở mức 50 thì
  50×1,15 = 57,5 → 57 và tỉ lệ đo ra **1,140** — sai số làm tròn nuốt mất 2/3 độ chính xác.
- ⑥ đi đúng đường của save cũ: xoá trường → `saveGame()` → `loadGame()`. Xoá tại chỗ rồi bấm
  nút thì chỉ kiểm được cái chốt trong chính hàm rót, không kiểm được dòng vá ở `loadGame`.
- ⑦ hỏi **DOM** chứ không hỏi chuỗi `innerHTML`: bản đầu của mục này XANH trong lúc nút bị ẩn,
  vì tên hàm vẫn nằm đâu đó trong HTML. Và **đừng hỏi thuộc tính `hidden`** — bảng có lúc
  `hidden=false` mà CSS vẫn `display:none`, lúc đó lời gọi mở bảng bị bỏ qua và mục này đỏ vì
  một lý do chẳng liên quan gì tới nút.

### 🗂 BẢNG KỸ NĂNG LÀ MỘT CÂY — và `KN_ROT` là chỗ ĐIỀN KỸ NĂNG

Dựng theo ảnh mẫu chủ dự án đưa: hàng tab trên cùng · **cây biểu tượng nối bằng mũi tên** ở nửa
trái · khung đọc chi tiết + nút Nâng Cấp ở nửa phải. Ba tab: **Lớp · Vaeldra · Khác**.

**Điền kỹ năng ở ĐÚNG MỘT CHỖ:** `KN_ROT[<lớp>]` (tab Lớp) và `KN_ROT_CHUNG[<tab>]` (tab còn
lại). Danh sách mã chiêu rót vào ô của `KN_HINH` **theo thứ tự khai**. Thiếu thì ô còn trống,
thừa thì bỏ qua — cả hai đều không ném lỗi, nên điền dần từng ô được.

| bảng | việc |
|---|---|
| `KN_TAB` | tên + phụ đề ba tab — **đổi tên tab là sửa một dòng** |
| `KN_HINH` | hình cây: 16 ô, `c` cột · `h` hàng · `tu` là ô cha (vẽ mũi tên tới) |
| `KN_HINH_RIENG` | `<lớp>\|<tab>` → hình riêng; không khai thì dùng `KN_HINH` |
| `KN_ROT` / `KN_ROT_CHUNG` | **mã chiêu rót vào ô** |
| `knDsKhac()` | tab **Khác** SUY RA, không điền tay — xem ngay dưới |

**⚠ TAB KHÁC KHÔNG ĐIỀN TAY.** Nó suy từ `LEGACY_SECT_SKILLS` + `CLASS_PASSIVES` của lớp đang
chơi qua `knKhacNhom()` (và `knDsKhac()` là bản dàn phẳng của nó). Chép thành một bảng
`KN_ROT_CHUNG.khac` thứ ba là bảo đảm nó lệch với hai bảng kia ngay lần đầu ai đó đổi Di Sản mà
quên sửa — cùng lối với `mapBanSac()` suy từ `packs`.

**Cả BA tab nay dùng CHUNG một khung** (ô + khung chi tiết). Tab Khác từng là một cuộn chữ dài
xếp năm khối rời: cùng một bảng mà hai tab vẽ kiểu này, một tab vẽ kiểu kia, nên bấm sang tab là
người chơi phải học lại cách đọc. `test_cayky` đã bỏ chỗ miễn trừ `!== 'khac'` — chính chỗ miễn
trừ đó là thứ sẽ lặng lẽ cho phép nó lệch ra lần nữa.

#### ▦ NHƯNG TAB KHÁC LÀ **LƯỚI CÓ NHÓM**, KHÔNG PHẢI CÂY NHÁNH

Chủ dự án đưa ảnh mẫu: hai nhóm có tiêu đề ("Hành vi" · "Học tập"), mỗi nhóm một lưới biểu
tượng, nhóm sau nối bằng mũi tên dọc. Đó là hình dạng ĐÚNG cho tab này — Di Sản là **bốn thứ
độc lập**, không cái nào mở khoá cái nào, nên mượn cây nhánh của tab Lớp là bịa ra một quan hệ
không có.

| | |
|---|---|
| `knKhacNhom()` | khai hai nhóm (tên · số cột · có phải một mạch không) |
| `knHinhKhac()` | dựng lưới TỪ CHÍNH nó ⇒ thêm/bớt một Di Sản là lưới tự giãn |
| `knY(n)` | **cửa DUY NHẤT** tính toạ độ Y của một ô |

- **⚠ SỐ Ô SUY TỪ DỮ LIỆU, đừng chép cứng 4×2 như ảnh mẫu.** Lớp nào cũng đúng 4 Di Sản, nhưng
  bị động thì `thieulam` có 2 còn bốn lớp kia 1. Khoá cứng tám ô là bốn lớp mở ra thấy một dãy ô
  trống mang nhãn "Học Tập" — bảng tự hứa có thứ nó không có.
- **Mũi tên nhóm Học Tập nghĩa là MỞ SAU** (xếp theo `unlock`), không phải điều kiện tiên quyết:
  cả hai bị động đều tự ngộ theo cấp. Tiêu đề nhóm nói thẳng ra vậy — *một mũi tên hứa điều kiện
  không có thật thì tệ hơn không vẽ mũi tên nào.*
- **Khối "HỆ TẤN CHỨC PHỤ" đã GỠ** — `danchi`/`tieuhon` nay là hai ô trong chính lưới. Giữ lại
  là cùng một bảng in hai lần hai kiểu, cách nhau vài dòng.
- Mô tả nhóm nằm trong `title`, **không in cạnh nhãn**: vùng cây chỉ rộng 218px nên một dòng mô
  tả bị cắt cụt giữa chừng, mà một câu cụt còn tệ hơn không có câu nào.

#### ⚠ `knNut()` CÓ BA ĐƯỜNG RA — chép phần hình học MỘT chỗ thôi

Nó dựng một vật thể MỚI từ ô của hình. Bản cũ liệt kê tay `k/c/h/tu` ở **cả ba** nhánh `return`,
nên thêm một trường vào hình (`gi`, `nhomTen`…) mà chỉ sửa một nhánh là trường đó **rụng mất ở
hai nhánh kia — không lỗi, không dấu hiệu**. Đã dẫm đúng thế: thêm tiêu đề nhóm xong thì ô vẫn
vẽ đủ, mũi tên vẫn đúng, mà hai cái nhãn KHÔNG BAO GIỜ hiện ra. Nay gom vào `hh` rồi `...hh`.

#### ⚠ Ô CAO **58px**, KHÔNG PHẢI 44 — và mũi tên phải xuất phát từ 58

`KN_O` là cạnh cái ẢNH; ô thật còn cõng dòng số cấp bên dưới (đo trong DOM: **58px**). Mũi tên
bắn từ `y + KN_O` là bắn từ GIỮA dòng số cấp, mà badge vẽ SAU nên nó che mất thân mũi tên. Thứ
còn lại trên màn là mấy **đầu mũi tên xanh trôi lơ lửng** — nhìn ra lỗi vẽ chứ không ra một cái
cây, và nó đã sống như thế ở cả tab Lớp. Nay có `KN_O_CAO = 58`, và `KN_HANG` nới **60 → 76**
(khe cũ chỉ còn 2px thì không mũi tên nào vẽ lọt).

**Ba lần thử ngược, cả ba lộ ra lỗi của chính BÀI KIỂM** — ghi lại vì cùng một họ:
1. mệnh đề mũi tên lọc ô cha bằng `day <= py`. Khi mũi tên bắt đầu BÊN TRONG ô cha thì ô ấy bị
   loại, phép đo tụt xuống hàng trên và trả về một khe **DƯƠNG** to tướng — tức đúng cái lỗi cần
   bắt lại làm bài xanh. Nay lấy ô có đáy GẦN NHẤT; thử ngược ra −13,5px.
2. `getBoundingClientRect()` trên bảng `display:none` trả **TOÀN SỐ 0**, mà 0 thì thoả mọi bất
   đẳng thức. Bài đã báo "khe 262px" trong lúc mọi ô ra `{x:0, day:0}`. Phải tự kiểm cảnh dựng.
3. `test_skillpanel`/`test_uidot5` dò chuỗi `"HỆ TẤN CHỨC PHỤ"`. Dò tiêu đề thì đổi cách bày là
   đỏ oan, mà **xoá thật hai chiêu rồi để lại cái tiêu đề thì lại xanh**. Nay hỏi thẳng
   `knDsKhac()` có `danchi`/`tieuhon` không.

Ba thứ ở tab Khác **không phải chiêu** nên không vào cây được, và ở lại thành một dải gọn bên
dưới: Sách Kỹ Năng (vật phẩm), `PASSIVE_SKILLS` (đến từ Ascension/trang bị, **không** nằm trong
`VOHOC_DEFS` nên không có ô cây), và hệ tấn chức phụ.

#### ⚠ ĐỔI CÁCH VẼ MỘT BẢNG ⇒ ĐẾM LẠI MỌI NÚT NÓ TỪNG TREO

Khi danh sách chiêu thành cây, `upBtnHtml()` mất sạch chỗ gọi. Nó là chỗ **DUY NHẤT** treo nút
📜 (dùng Sách Kỹ Năng — nâng thẳng 1 cấp) và nút ⌨ (gán phím Space). Hai cơ chế vẫn sống nguyên
trong mã (`useSkillBookUI` · `assignSpaceUI`), `node --check` xanh, không lỗi nào in ra — mà
người chơi thì **không còn cửa nào bấm**, trong khi bảng vẫn ngồi đó in dòng *"📜 Sách Kỹ Năng
nâng thẳng 1 cấp"* MỜI dùng. Cùng họ với bẫy "nút chết" ở mục trên, chỉ khác là lần này không
có nút để mà chết — chỉ còn lời mời suông, thứ mà không bài kiểm nào hỏi tới.

⇒ `test_cayky §⑤` **BẤM** hai nút rồi đo trạng thái người chơi (cấp +1 · sách −1 · Space gán rồi
gỡ được), và đo cả chiều NGƯỢC LẠI (hết sách thì nút phải mờ). Hỏi "có nút không" là chưa đủ:
một nút trỏ vào hàm không tồn tại vẫn có mặt trong DOM.

**⚠ `skThongSoGon()` in hồi chiêu qua `effCd()`, đừng in `i.cd`.** `skillInfo()` trả cd **GỐC**;
mọi mốc / tiến hoá / `vhCdMult` nhân vào sau. In số gốc thì bảng hứa *"−0,25% hồi chiêu mỗi cấp"*
ngay bên dưới một con số đứng im suốt 120 cấp. Đây nay là chỗ **duy nhất** in năm thông số —
lưới 3 cột `skThongSo()` đã gỡ cùng đợt này.

**⚠ Ảnh mẫu là game kiếm hiệp, ba chữ trong đó Quy tắc số 1 cấm.** Đã đổi, và đây là bảng quy đổi
để đừng ai "sửa ngược" tưởng là sót: `Phái` → **Lớp** · `Giang Hồ` → **Vaeldra** (đúng cái thế
giới bên ngoài mà chữ kia muốn nói, và là danh từ riêng của game này) · `Cảnh giới` → nút
**Đại Thành** · `Chân khí tiêu hao` → **Bản Năng tiêu hao** (vốn ĐÃ là thứ `skUpKhi()` trừ đi) ·
`Tiền đồng` → **Lumen**. `test_nowuxia2` quét thẳng "cảnh giới" và "chân khí".

**⚠ CHIÊU BỊ ĐỘNG KHÔNG NẰM TRONG `SKILL_DEFS`.** Vòng đăng ký `continue` qua `type === 'passive'`
vì chúng không bấm được, nên `skillInfo()` trả `null` cho cả năm cái — và `knNut()` cố ý biến
"không tra được" thành ô trống (đó là thứ cho phép điền dần). Hai cái cộng lại: năm chiêu bị động
hiện ra **y hệt ô chưa gán**, không lỗi, không dấu hiệu. Nên `knNut()` có nhánh đọc thẳng
`VOHOC_DEFS` cho bị động, và khung chi tiết đi nhánh riêng — bị động không cấp, không Mana, không
hồi chiêu, nên in năm thông số cho nó là hứa suông.

**Bốn thứ `tests/test_cayky.js` gác, ba trong bốn KHÔNG ném lỗi và KHÔNG hiện ra:**

1. **Mã chiêu gõ sai** — `'dk_cyclon'` thiếu chữ e hiện ra y hệt ô chưa gán. Bài đối chiếu từng
   mã với `SKILL_DEFS` **và** `VOHOC_DEFS`.
2. **Nút chết.** Nút góc phải bản đầu trỏ vào `openEvoPanel()` — **một hàm không tồn tại**. Bảng
   chọn nhánh Tiến Hoá chỉ tự mở khi chiêu chạm mốc 40/80/120, không có cửa mở tay. Bấm vào không
   có gì xảy ra. Bài gọi thẳng tên hàm trong `onclick` rồi hỏi `typeof window[tên] === 'function'`.
   *Luật chung: đặt tên hàm vào một chuỗi `onclick` là bỏ qua mọi thứ kiểm được — phải kiểm tay.*
3. **Hình cây thủng** — `tu` trỏ tới khoá không có ⇒ mũi tên biến mất lặng lẽ; hai ô trùng ô lưới
   ⇒ chồng lên nhau.
4. **Dấu `+` nói dối.** Dấu `+` xanh nghĩa là "nâng được NGAY", nên nó phải hỏi lại đúng ba điều
   kiện `upgradeSkillUI()` kiểm (cấp · Lumen · Bản Năng), không phải chỉ hỏi "đã mở khoá chưa".
   Bài đếm dấu `+` hai lần — túi đầy và túi rỗng — rồi đòi hai con số phải KHÁC nhau.

**⚠ Bề rộng vùng cây SUY TỪ HÌNH** (`knKho()`), đừng chép cứng số cột: dời chuỗi thẳng từ cột 3
sang cột 2 mà để nguyên `4*KN_COT` là thừa một cột rỗng 58px — cây dãn ra, khung chi tiết bị bóp,
và không có gì báo lỗi.

**Ảnh mẫu ghi "Kéo biểu tượng đến thanh phím tắt" — và nay game LÀM ĐÚNG THẾ.** Câu này trước
đây viết ngược lại ("game này KHÔNG cho kéo, thanh chiêu 4 ô cố định"); nó đã sai kể từ đợt thanh
chiêu tự gán — xem mục **🎯 THANH CHIÊU NAY TỰ GÁN** bên dưới. Dòng chân khung chi tiết nói chiêu
đang nằm ô mấy, hoặc mời kéo vào ô, kèm cái giá %Công Kích Di Sản phải trả.

### 🌳 ĐẠI THÀNH LÀ MỘT CÂY HAI NHÁNH — đừng biến nó lại thành danh sách

`MASTERY_COMMON` + `MASTERY_CLASS` = **16 bảng** (1 chung + 3 riêng × 5 lớp), **144 nút**, mở ở
cấp 120 sau khi xong chính tuyến. Mỗi bảng là một **cây**, không phải một danh sách nút.

**Vì sao đổi.** Cổng cũ (`MASTERY_RANK_GATE`) chỉ đếm **tổng điểm đã tiêu trong bảng**: dồn đủ 40
điểm vào bất cứ đâu là mở được mọi nút. Bảng vẽ ra hình cái cây mà luật thì là một cái thùng —
người chơi không "chọn hướng" được gì, chỉ rải điểm mỏng ra.

**Khuôn bắt buộc của MỌI bảng: `2 · 2 · 2 · 1 · 2`.**

| rank | nút | luật |
|---|---|---|
| 1 | 1 nút mỗi nhánh | vào tự do |
| 2-3 | 1 nút mỗi nhánh | cần **nút cha CÙNG NHÁNH** đủ `MST_CAN[rank]` điểm |
| 4 | **1 nút chung** (`nh:null`) | đủ **một nhánh bất kỳ** ở rank 3 là qua |
| 5 | **2 nút đỉnh, LOẠI TRỪ NHAU** | cần nút chung ≥ `MST_CAN[5]` **và** nhánh của nó ≥ `MST_DINH_NHANH` |

- Tab khai `nhanh:[{id,name},{id,name}]`; mỗi nút khai `nh:'<id>'` (hoặc `nh:null` cho nút chung).
- **Cặp loại trừ SUY TỪ HÌNH DẠNG**, không khai tay: hai nút cùng rank cuối khác nhánh
  (`masteryDoi`). Thêm bảng mới mà quên nút đỉnh thứ hai là **mất im lặng** cả cơ chế chọn hướng
  — `tests/test_mastery.js` §1 gác đúng khuôn trên, nên nó sẽ đỏ chứ không im.
- **`masteryKhoa(tab, nd)` là cửa DUY NHẤT.** Cả `masteryAdd()` lẫn phần vẽ đều gọi nó, nên thứ
  người chơi ĐỌC trong tooltip và thứ máy THỰC THI không thể lệch nhau. Đừng viết lại luật ở
  phần vẽ.
- **`MST_DINH_NHANH` không thừa** dù chuỗi cha đã bắt tiêu ≥18 điểm: nó chặn đúng cái ca đi trọn
  nhánh A rồi vơ nút đỉnh của nhánh B (nút chung nhận **một** nhánh bất kỳ nên đường đó có thật).
- **Save cũ vi phạm luật thì HOÀN ĐIỂM, không khoá chết** (`masteryRaSoat`, gọi trong `loadGame`).
  Phải lặp tới khi ổn định — gỡ một nút làm nút khác mất cha, một lượt không đủ. Và phải **tạm gỡ
  chính nút đang xét ra** trước khi hỏi, nếu không nút đỉnh tự thoả điều kiện "nhánh đủ điểm"
  bằng chính số điểm của mình.

**Ngân sách là một nửa của thiết kế.** Bảng chứa 720 ô điểm; một vòng Tái Sinh kiếm ~139. Đi trọn
một hướng trong một bảng tốn 28 điểm mở đường + tới 20 điểm cho nút đỉnh. Đừng nới điểm cấp phát
mà không nới luôn số nút — hết khan hiếm là hết lựa chọn, và cây lại thành danh sách.

### ⚠ Quy ước kỹ năng: NĂM thông số bắt buộc

Mọi chiêu, không trừ chiêu nào, phải khai và **hiện ra cho người chơi đọc** đủ năm con số.
Thiếu một dòng là người chơi không so được hai chiêu với nhau, và cân bằng thì không ai kiểm
được bằng mắt:

| Thông số | Khoá | Ý nghĩa | Khi không khai |
|---|---|---|---|
| Khoảng cách sử dụng | `tam` | xa nhất tới chỗ chiêu phát ra; `0` = ngay tại chỗ đứng | lấy tầm của lớp (`SECTS[x].range`), chiêu quạt lấy 130 |
| Thời gian hồi chiêu | `cd` | giây, trước khi trừ các mốc giảm hồi | bắt buộc khai |
| Sức mạnh tấn công | `mult` | hệ số nhân Công Kích | 1.0 |
| Phạm vi ảnh hưởng | `pham` | bán kính vùng trúng; `0` = trúng đúng một mục tiêu | `fx.r`, Trấn Phái lấy `TP_RADIUS` |
| Mana tiêu hao | `qi` | trừ thẳng khi tung; gọi là **Mana**, không phải từ vựng kiếm hiệp (quy tắc số 1) | bắt buộc khai |

`skillInfo()` trả đủ năm (`tam` · `cd` · `he` · `pham` · `qi`) và `skThongSo()` in chúng thành
lưới 3 cột trong mỗi ô kỹ năng. **Dark Wizard đọc "Công Kích" thành "Sức Mạnh Phép Thuật"** — cùng
một con số, nhưng gọi đúng tên thứ mà lớp ấy dùng để đánh.

Hai luật đi kèm, vì chúng là chỗ dễ nói dối nhất:

1. **`tam` phải là tầm THẬT, và nó ngắm theo CON TRỎ.** Chiêu khai `tam` > 0 thì nổ ở chỗ
   người chơi đang chỉ chuột, không phải dưới chân người niệm. `diemGiang(tam)` kẹp điểm ngắm
   vào trong `tam` (chỉ ra ngoài tầm thì rơi ở mép tầm, không câm tiếng), rồi hút vào con quái
   gần điểm ngắm nhất trong `BAN_HUT` = 90px. Đánh dấu `neo:'quai'` trong `CHIEU_TRANH`.
   Lối chơi là chuột phải để đi + phím 1-4 để tung chiêu, nên con trỏ luôn nằm sẵn ở chỗ người
   chơi đang nhìn; nhắm theo "bầy gần người niệm nhất" là cướp mất quyền chọn ấy — đứng giữa
   hai bầy thì chiêu tự chọn sai và không có cách nào bảo nó khác đi.
   `mouseWorld` khởi tạo (0,0) = góc bản đồ, nên phải hỏi cờ `chuotDaRe` trước khi tin nó.
   Bài kiểm `test_ngamchuot.js` lái bằng sự kiện chuột/phím THẬT: chỗ dễ hỏng không phải phép
   tính điểm ngắm mà là sợi dây nối từ con trỏ tới nó.
2. **`pham` phải khớp thứ vẽ ra.** Hình được phép nhỏ hơn vòng sát thương (`co` trong
   `CHIEU_TRANH`, hiện 0,62 — vẽ đúng bán kính thật thì một con quái cao 70px lọt thỏm trong
   đám cháy 370px), nhưng **không bao giờ lớn hơn**: vẽ trùm qua con quái mà nó không mất máu
   là hứa suông.

### Chiêu đã có art thì gom hết vào `CHIEU_TRANH`

Một bảng duy nhất trong `game.js` khai mọi chiêu có tranh thật: `atlas` (tấm khung hình trong
`VFX_ATLAS_DEFS`) hoặc `ve` (đường vẽ riêng như `vongKiem` / `uLinh`), kèm `neo` và `co`.
`spawnSkillVfx()` gặp chiêu trong bảng là **dừng ngay** — không vẽ thêm hình nào nữa.
Có mặt trong bảng nghĩa là chiêu ấy **không còn khai `style` ở `VH_VFX`/`SECT_VFX`**; giữ cả
hai là chồng hai lớp lệch tâm lên nhau. Bài kiểm đọc thẳng bảng này, đừng chép danh sách sang
chỗ khác.

Đường nhập art: `tools/vfx_meowa.py` (gói Meowa → atlas) và `tools/icon_chieu.py` (cắt icon
**ra từ chính tấm dán của chiêu đó** — ô kỹ năng và thứ nổ trên màn hình phải là một).

Ba dạng hỏng đã gặp ở gói Meowa, mỗi dạng một cờ, **đừng trộn**:

| Dấu hiệu | Vì sao | Cờ |
|---|---|---|
| Ô vuông đen / thủng lỗ giữa dải nền sáng, ô ~11px | xuất KHÔNG bật "preserve translucent areas" → lưới ô caro của trình vẽ nướng thẳng vào tranh | `--caro` |
| Vùng sương mờ thành lưới rung, alpha nhảy 0 ↔ 0,3 theo ô ~25px | alpha đủ 256 mức nhưng lớp mờ bị dither | `--suong` (trung bình một chu kì, theo lối nhân sẵn, chừa nét đặc ≥150) |
| Hiệu ứng chìm nghỉm trong màn | gói vẽ trên nền trắng: bản đồ ban đêm sáng ~52 mà gói chỉ sáng ~25, tức TỐI HƠN nền | `--sang gamma,gain,sat` |

Và một luật vẽ: **art tối thì phải cộng sáng.** `cong:false` (vẽ đè) chỉ hợp với gói sáng hơn
nền — Meteorite, Inferno. Gói tối như Dragon Spirit vẽ đè thì thành vệt bóng; bỏ `cong:false`
cho nó cộng sáng là bầy long hồn phát sáng lên ngay. Đã thử cả hai và chụp lại để so.

⚠ **NHƯNG ĐỘ SÁNG TRUNG BÌNH KHÔNG QUYẾT ĐỊNH MỘT MÌNH — VIỀN ĐEN THẮNG NÓ.** Gói `fire_scream`
(Hoả Xích Diệm, Dark Lord) đo ra **sáng 0,397** trong khi nền map trung bình **0,658**, tức
TỐI HƠN nền ⇒ theo luật trên thì phải cộng sáng. Chụp cả hai lối ra thì ngược hẳn: cộng sáng
**ăn mất đường viền đen** (đen cộng vào nền là ra chính nền), ba ngọn lửa thành mấy vệt hồng
nhợt không còn hình dạng; vẽ đè thì đọc rõ từng lưỡi lửa trên nền gạch sáng.

⇒ Luật đầy đủ: **gói có viền đen đậm thì KHÔNG BAO GIỜ cộng sáng, bất kể sáng trung bình.**
Cộng sáng dành cho gói *không có viền* mà chỉ có ánh sáng (Dragon Spirit là bầy hồn phát quang,
không có nét bao). Và đây vẫn là chỗ **phải chụp ra so**, đừng quyết bằng một con số.

### 🧬 HAI HỌ BỊ ĐỘNG — khoá phân biệt là trường `chiSo`, đừng nhập chúng làm một

Cây kỹ năng của **cả năm lớp** nay có một **xương sống chung**: bảy bị động cộng chỉ số, khai
`phai: null` một lần trong `data/canbang.js` rồi `KN_XUONG_SONG` nối vào đuôi `KN_ROT` của từng
lớp. Chúng rơi đúng vào **chuỗi thẳng bảy ô ở cột 3** của `KN_HINH` (`g1`…`g7`) — cái hình mà
ảnh mẫu chủ dự án đưa vẽ ra. Chín chiêu lớp lấp cây nhánh, bảy bị động lấp chuỗi thẳng, **đủ
16/16 ô**.

| họ | ví dụ | luật | hiện ra |
|---|---|---|---|
| **chỉ số** (có `chiSo`) | Increase Life · Mana · Stamina · Attack Power · Defense · Defense Rate · Critical Rate | **luôn chạy**, KHÔNG chiếm ô, **nâng cấp được** | số cấp |
| **hiệu ứng** (không `chiSo`) | Swell Life · Iron Will · Dark Raven · Heal · Song Thủ · Bản Nguyên Công | **phải cắm vào ô 2-4** (`biDongBat`) | dấu ✚ |

**Vì sao phải tách:** ô 1 khoá chủ động ⇒ chỉ còn **ba** ô trống. Bảy bị động chỉ số mà tranh ba
ô thì người chơi vĩnh viễn chỉ bật được 3/7, trong khi cả bảy rõ ràng sinh ra để luôn bật. Ngược
lại, cho bị động hiệu ứng chạy tự do là mất sạch cái giá của ba ô kia.

**⚠ ĐƠN VỊ LÀ PHẦN TRĂM, và đây là chỗ CỐ Ý không dịch sát bản gốc.** Ảnh mẫu ghi số phẳng
("+12 sinh lực mỗi cấp"). Đo ở đây: trang bị kéo máu trần **2.288 → 28.672** và Công Kích
**89 → 2.118**. Số phẳng vì thế vừa vỡ đầu game vừa thành số 0 làm tròn ở cuối game. Riêng bạo
kích và né tránh là **tỉ lệ có trần** (0,65 / 0,45) nên chúng cộng theo **điểm phần trăm** —
nhân phần trăm lên một tỉ lệ đã có trần là vô nghĩa.

**⚠ `ps_stamina` cố ý nhỏ hơn hẳn sáu cái kia** (0,10 chứ không phải 0,25-0,30). Thể Lực cộng vào
`s.vit` **rất sớm** nên nó đi qua toàn bộ dây chuyền nhân của `calcDerived`: ở mức 0,25/cấp nó
cho **+42% máu** ở cấp chiêu 100, tức ăn đứt chính `ps_life` (+30%) và biến nút Life thành thừa.
*Hai nút mà một cái trội hẳn thì không còn là lựa chọn nào cả.*

**⚠ Thể Lực phải cộng TRƯỚC `player.dVit`**, không phải ở khối cuối cùng như sáu cái kia — công
thức `maxHp` đọc `s.vit`. Cộng sau thì con số trên bảng Nhân Vật nhúc nhích còn máu thì không.

**⚠ `vhAutoLearn()` có cửa RIÊNG cho chúng.** Vòng cũ `if (!_v.phai) continue` bỏ qua mọi chiêu
chung. Đừng "sửa gọn" bằng cách nới điều kiện `_v.phai` — nới ra là **mọi** chiêu chung tương lai
(kể cả thứ định để mật tịch mở khoá) tự rơi vào tay người chơi theo cấp.

**⚠ Không kéo được, và phải chặn ở CẢ HAI chỗ.** `knOHopLe` từ chối là chưa đủ: ô vẫn kéo được
nghĩa là người chơi lôi cả chuỗi bảy ô xuống thanh rồi ăn bảy lần từ chối. `keo` trong ô cây phải
hỏi `!n.chiSo`. Đảo ngược chỉ một trong hai thì **không bài nào đỏ** cho tới khi thêm mệnh đề đo
thẳng `draggable` trên DOM — đã dẫm đúng thế.

**Nợ đã biết, không giấu:** ở full BiS (`applyTestBoost`) `ps_defrate` và `ps_crit` cộng **0** vì
né tránh và bạo kích đã kịch trần 45%/65% từ trang bị. Chúng có giá trị suốt chặng đi lên, chết ở
đúng điểm cuối. **Đừng chữa bằng cách nới trần trong khối bị động** — đó là mở cửa sau cho chính
chỉ số mà cả phần trên của `calcDerived` cẩn thận kẹp lại.

Gác: `tests/test_bidongchiso.js` (7 mệnh đề, đảo ngược từng cơ chế đều đỏ).

### 🎯 THANH CHIÊU NAY TỰ GÁN — kéo thả, và ô 1 là ô duy nhất bị khoá

Người chơi kéo một ô trên cây thả vào ô 1-4 (thả được cả trên bảng lẫn trên thanh HUD dưới màn).
Trước bản này thanh là **4 ô cố định** dựng bằng `defaultSkillBar()` và không ai đổi được.

**`knOHopLe(slot, id)` là cửa DUY NHẤT** — cả kéo thả, lệnh gỡ rối lẫn `knGan` đều hỏi nó, nên
lý do người chơi ĐỌC và luật máy THỰC THI không thể lệch nhau (cùng lối với `masteryKhoa`).

| luật | vì sao |
|---|---|
| ô 1 phải **chủ động**, không bao giờ trống | cắm bị động vào đó là người chơi đứng không nút nào bấm |
| **không ô nào trùng chiêu** — kéo vào ô đã có thì ĐỔI CHỖ | hai ô cùng một chiêu là tự lừa mình có hai nút |
| bị động **chỉ chạy khi nằm trên thanh** (`biDongBat()`) | không có vế đó thì cắm hay không cũng như nhau, và ba ô kia mất nửa lý do tồn tại |
| chiêu lên thanh thì **mất %Công Kích Di Sản** của nó | CLAUDE.md: *một chiêu không được vừa bấm được vừa cộng %ST vĩnh viễn*. `calcDerived()` nay trừ động theo thanh, không chép tay nữa |

**⚠ LỖI TO NHẤT CỦA ĐỢT NÀY, VÀ NĂM MỆNH ĐỀ ĐẦU ĐỀU XANH TRONG LÚC NÓ CÒN SỐNG:**
`loadGame()` có một dòng `player.skillBar = defaultSkillBar(player.sect)` chạy **vô điều kiện**.
Hồi thanh còn cố định thì nó vô hại — nó chính là đường nâng cấp cho save 3 ô. Từ lúc kéo thả
được thì nó **nuốt sạch lựa chọn của người chơi, và nuốt trong im lặng**: gán xong nhìn đúng, tải
lại trang là về mặc định, không lỗi, không dấu hiệu. Nay đi qua `knRaSoat()`, vốn làm đủ ba việc
dòng cũ làm (save 3 ô lên 4, bỏ chiêu đã gỡ khỏi game, bỏ bị động kẹt ở ô 1) mà **giữ ô còn hợp
lệ**. *Luật chung: thêm quyền cho người chơi thì phải đi soát lại mọi chỗ đang GHI ĐÈ thứ đó —
một dòng gán vô hại hôm qua là một dòng ăn cắp hôm nay.*

**⚠ `knRaSoat()` phải đứng SAU `if (!player.vohoc) player.vohoc = {}`** trong `loadGame`. Nó hỏi
`knDaNgo()`, mà bị động thì `knDaNgo` đọc `player.vohoc`; save đời cũ không có trường đó nên rà
soát sớm một dòng là mọi bị động trên thanh bị coi như chưa ngộ và bị gỡ sạch.

**⚠ ĐỪNG thêm cửa `knDaNgo` vào `knRaSoat`.** Đã thử và nó cắt đúng cái tay mình:
`defaultSkillBar()` **cố ý** cắm sẵn chiêu chưa tới cấp vào ô 2-4 để người chơi thấy nó sáng lên
khi lên cấp, nên thêm cửa ấy là nhân vật cấp 1 của **cả năm lớp** mở ra chỉ còn một ô. `knDaNgo`
thuộc về `knOHopLe` — thứ người chơi **TỰ** kéo — không thuộc về hàm rà soát, vốn phải tôn trọng
cả thanh mà chính game dựng.

Gác: `tests/test_ganchieu.js` (7 mệnh đề). ⑥ và ⑦ là hai cái vừa kể; ⑥ tự kiểm cảnh dựng trước
khi chấm (đòi lớp đó gán được một chiêu **ngoài** thanh mặc định, nếu không thì `truoc` bằng đúng
mặc định và mệnh đề xanh kể cả khi `loadGame` ép lại thanh).

⚠ Dòng chân khung chi tiết phải nói đúng: nó từng viết *"Không nằm trên thanh chiêu (4 ô cố
định)"*. Câu đó nay là lời nói dối ngay ở ô mà người chơi vừa tự kéo vào.

## ✦ KHẮC THÂN — sáu ĐƯỜNG KHẮC, và vì sao nó KHÔNG phải "kinh mạch"

Chủ dự án đưa ảnh mẫu bảng mạch của một game kiếm hiệp và chốt: *"Văn hoá phương Tây cũng có
kinh mạch nên sử dụng được. Tuy nhiên thay vì 8 mốc như trong hình thì nó hơi kiếm hiệp, hãy
dựng layout tính năng của phần này trước rồi mình sẽ fill art vào sau."*

**CƠ CHẾ mượn được, TỪ VỰNG thì không.** Bộ từ của ảnh mẫu nằm nguyên trong danh sách cấm của
Quy tắc số 1. Nên hệ này neo vào canon ĐÃ CÓ chứ không bịa một danh từ nào:

> Vaeldra khắc Rune vào **thép** — mỗi lần rèn là một lần khắc.
> DRUE không khắc vào đá, không khắc vào thép: **hắn khắc vào chính mình**.

Người chơi qua Nhát Gọi mất ký ức chứ không mất **nghề**, nên họ biết khắc. Khắc lên thân là đi
đúng đường DRUE đã đi — vừa là lý do nó mạnh, vừa là lý do nó có giá, và nó nối thẳng vào kẻ thù
chính của chuỗi nhiệm vụ. ⚠ **Đừng "Việt hoá cho sát ảnh mẫu"**: mỗi chữ kéo về là kéo cả hệ về
lại kiếm hiệp.

**SÁU, KHÔNG PHẢI TÁM** — tám cái tên trong ảnh là một khái niệm y học Trung Hoa. Sáu Đường Khắc
ở đây là sáu **vùng thân** mà một thợ khắc phương Tây sẽ khắc lên. Giải phẫu, không phải huyền học.

| Đường Khắc | vùng | thuộc tính | trọn đường |
|---|---|---|--:|
| Sống Lưng | lưng | `hpPct` Sinh Lực | +12% |
| Nắm Tay | tay phải | `atkPct` Công Kích | +12% |
| Gân Chân | chân | `aspdPct` Tốc Đánh | +8% |
| Lồng Ngực | ngực | `dmgred` Giảm Sát Thương | +5 |
| Vầng Trán | đầu | `critDmg` Sát Thương Bạo | +15% |
| Lòng Tay | tay trái | `pierce` Xuyên Giáp | +10% |

**⚠ KHÔNG DÙNG `crit` VÀ `eva` LÀM PHẦN THƯỞNG.** Cả hai là tỉ lệ CÓ TRẦN (0,65 / 0,45) và ở full
BiS đã kịch trần từ trang bị — đo được trong phiên dựng hệ này: `crit 0,650 · eva 0,450`. Cộng
thêm ở đó là cộng vào 0, tức dựng lại đúng "nợ đã biết" của `ps_defrate`/`ps_crit`. Vầng Trán vì
thế trả `critDmg` (không trần).

**⚠ MỌI KHOÁ PHẢI NẰM TRONG SỔ `P` của `calcDerived`.** `khacAgg()` đổ sổ đúng lối `masteryAgg()`
(`for (const k in KZ) if (k in P) P[k] += KZ[k]`), mà vòng đó **bỏ qua khoá lạ trong im lặng** —
y như `applyLine()`. Khai một khoá ngoài sổ là bảng hiện "+12% Công Kích" mà chẳng có tác dụng gì.

### Ngân sách suy từ SỐ ĐO, không từ cảm giác

Đo trong phiên này (Dark Knight, `traits` rỗng, `personality` trung tính):

| | atk | máu |
|---|--:|--:|
| cấp 120 tay không | 81 | 2.299 |
| cấp 120 full BiS | 1.717 | 28.845 |

Tức trang bị là **×21 công · ×12,5 máu**. Khắc trọn cả sáu cho **+12,3% công · +12,0% máu** —
ngang một bậc trang bị: đáng cày, không thay được trang bị. Cùng luật đã ghi cho mastery: hệ
nuôi-lớn **khuếch đại** trang bị chứ không dựng một trục song song nuốt nó.

Trọn bộ 72 Dấu Khắc tốn **2.868.974 Lumen + 111.974 Bản Năng**, cấp yêu cầu trải **25 → 119**.
Đó là chỗ lấp "99 cấp sau không có hệ thống nào mở ra" của mục chẩn đoán gốc.

**Số suy bằng công thức, TÊN viết tay.** `khacGiaTriNut`/`khacCapNut`/`khacGiaNut` dẫn ra 72 con
số; khai tay là 72 chỗ để lệch. Ngược lại tên từng Dấu Khắc thì phải viết tay — sinh bằng máy
("Dấu Khắc 7") thì cả bảng đọc ra một cái bảng tính.

### Bốn luật của cơ chế

- **`khacCan(id)` là CỬA DUY NHẤT** hỏi "khắc được chưa" — nút bấm và phần vẽ cùng gọi nó, nên
  lý do người chơi ĐỌC và luật máy THỰC THI không lệch được. Cùng lối `masteryKhoa` · `knOHopLe`.
- **MỘT CHIỀU, KHÔNG CÓ NÚT TẨY.** Mastery có `masteryRespec` vì ở đó có HƯỚNG để chọn sai (hai
  nhánh loại trừ). Ở đây không có: rồi ai cũng khắc trọn cả sáu, thứ duy nhất người chơi quyết là
  THỨ TỰ. Thêm nút tẩy vào một hệ không có lựa chọn sai là thêm một nút không ai bấm — và canon
  nói thẳng: nét khắc trên thân không gỡ ra được.
- **`lvPeak()`, KHÔNG phải `player.level`.** Tái Sinh kéo `level` về 1; khoá theo `level` là cướp
  lại thứ người chơi đã trả tiền.
- **`player.khi` (Bản Năng) là SỐ THỰC** — nó hồi liên tục nên gần như lúc nào cũng có phần lẻ.
  Đọc thẳng thì bảng in ra `5.000.000,05 Bản Năng`, đúng rác dấu phẩy động mà ô Thể Lực đã phơi
  ra một lần. `khacBanNang()` làm tròn XUỐNG ở **cửa đọc**, không ở từng chỗ in: làm ở chỗ in thì
  con số người chơi THẤY và con số máy TRỪ lệch nhau đúng một nấc.

### ⚠ TAB HIỆN Ở CẤP 6, CƠ CHẾ MỞ Ở CẤP 25 — hai con số khác nhau, cố ý

Bản đầu tôi để `CHAR_TABS.lv = KHAC_LV`. Chụp ra thì `renderCharPanel` **đá tab về Thông Tin**
(nó tự hạ tab đang chọn khi `sysUnlocked` sai), nên cái chip `🔒 ✦ Khắc Thân` là một **nút bấm
vào không ra gì** — đúng vết sẹo `openEvoPanel` của `test_cayky`. Và nhánh "chưa mở" trong
`renderKhacThan` khi ấy là **mã chết**: không đường nào tới được nó.

⇒ Tab hiện từ cấp 6 (bằng Thân Axie, nên cấp mở của cả nhóm KHÔNG đổi), nội dung mới gác ở
`khacMo()`. Người chơi đọc được hệ này tồn tại và mở ở đâu từ rất sớm — đúng thứ mục "HAI TRỤC
AXIE PHẢI ĐƯỢC DẠY" đòi. `test_khacthan ⑧` gác cả hai con số.

### Layout — ART CHƯA CÓ THÌ VẼ Ô CHỜ CÓ NHÃN

```
┌ đầu bảng: tiến độ N/72 · ví Lumen · ví Bản Năng ───────────────────┐
├─ rail ──────┬─ sợi Dấu Khắc (zigzag) ──────┬─ bóng thân (ô chờ art)┤
│ Toàn Bộ     │      ○──                     │   ┌──────────┐        │
│ Sống Lưng ✓ │        ╲                     │   │  <art>   │        │
│ Nắm Tay   + │         ──○                  │   └──────────┘        │
├─────────────┴──────────────────────────────┴───────────────────────┤
│ khung đọc: Dấu Khắc kế tiếp · thuộc tính · giá · [ KHẮC ]           │
└────────────────────────────────────────────────────────────────────┘
```

- **Ô chờ art**: `assets/ui/khac_<id>.webp`, mỗi Đường một tấm. Thả tệp vào là ảnh tự đè lên
  (`onerror` ẩn thẻ `img` để lộ ô chờ) — **không sửa một dòng mã nào**. Ô chờ cố ý vẽ thô (gạch
  chéo + nhãn) để không ai tưởng là art thật rồi để nguyên, đúng lối `iaChuaArt`.
- **Chấm và nét nối KHÔNG phải art** — chúng là khung giao diện, cùng loại với mũi tên SVG của
  cây kỹ năng đang chạy. Quy tắc số 3 nói về art (trang bị, nhân vật, cảnh vật), không về đường
  kẻ của một bảng.
- **Bề rộng/cao SUY TỪ HÌNH** (`khacKho()`), đừng chép cứng: đổi `KHAC_MOI_DUONG` là khung tự
  giãn. Chép cứng thì thêm hai Dấu Khắc là hai ô cuối rơi ra ngoài SVG và biến mất không một lỗi.
- **Cột giữa phải `minmax(0,1fr)`** — thiếu nó thì SVG đẩy cả hàng tràn ra ngoài bảng rồi bị
  `overflow:hidden` xén, đúng lỗi bản đồ góc màn đã dẫm. `test_khacthan ⑦` đo ở BA bề rộng.
- **Dấu `+` xanh ở rail = khắc được NGAY**, cùng quy ước với dấu `+` của cây kỹ năng — không phải
  một ký hiệu mới người chơi phải học. Đường đã trọn thì ghi `✓ trọn` chứ không chỉ đổi MÀU: ở
  cỡ 11px một sắc vàng nhạt trên nền tối gần như không phân biệt được với chữ thường.

### ⚠ CỐ Ý KHÔNG LÀM: đổi Bản Năng lấy EXP theo lượt mỗi ngày

Ảnh mẫu có dòng *"Mỗi ngày có 24 lần nhận kinh nghiệm, hiện còn 1253 lần"*. Không bê sang: đó là
một hệ lặp mỗi ngày THỨ TƯ đứng cạnh Truy Nã + Vỉa + ba sự kiện theo giờ thật, tức đúng bệnh nhân
bản ở đầu tài liệu này. Thưởng "trọn cả sáu" vì thế là **+5% EXP vĩnh viễn** — một lần, không
phải một nhịp ngày mới.

Gác: **`tests/test_khacthan.js`** (8 mệnh đề, **cả tám đã thử ngược và đều đỏ**) — ① không một chữ
tu tiên nào trong 8 trang đã vẽ + toàn bộ bảng dữ liệu · ② chỉ số THẬT đổi theo (đo `player.atk`,
không đọc sổ) · ③ một chiều · trừ đúng · từ chối thì không trừ gì · ④ thưởng trọn đường và trọn
cả sáu, thiếu một nét là mất · ⑤ save đời trước · ⑥ save rác bị kẹp · ⑦ không tràn bảng ở ba bề
rộng · ⑧ cấp yêu cầu với tới được.

#### ⚠ HAI QUE DÒ HỎNG CỦA CHÍNH BÀI KIỂM — cả hai cho một mệnh đề XANH VÌ LÝ DO SAI

1. **Hạ `player.level` mà quên `player.lvPeak`.** `khacCan` hỏi `lvPeak()` — mốc DÍNH — nên cảnh
   "cấp thấp" chưa bao giờ dựng được, và bài báo *"khắc được nét chưa tới cấp"* trên mã hoàn toàn
   đúng. Nay hạ cả hai, và có chốt tự kiểm đòi `lvPeak()` phải thật sự tụt trước khi chấm.
2. **`delete raw.khac` Ở GỐC BẢN LƯU.** Bản lưu có NHIỀU Ô NHÂN VẬT: dữ liệu nằm ở
   `slots[active].player`. Phép xoá vì thế xoá một thứ chưa bao giờ ở đó, và mệnh đề "save đời
   trước" **XANH trong khi nó chưa dựng được cảnh lấy một lần**. Chốt `daXoa` là thứ bắt được —
   *trước khi tin một mệnh đề xanh, hỏi xem phép dựng cảnh của nó có chạm đúng chỗ không.*

⚠ **Và `test_nowuxia2` mục D quét cả CHÚ THÍCH, không chỉ chuỗi người chơi thấy.** Khối chú thích
đầu tiên của tôi giải thích luật bằng cách **nêu đích danh** mấy từ bị cấm ⇒ đỏ 3 chỗ. Sửa bằng
cách đi theo bài kiểm, không nới nó: trỏ về danh sách ở CLAUDE.md thay vì chép lại. Chép lại vốn
cũng là một bản sao thứ hai sẽ lệch — đúng thứ tài liệu này cảnh báo khắp nơi.

## ≡ THANH DƯỚI CHIA BA CỤM · F6 LÀ **SẢNH**, KHÔNG PHẢI BẢNG PHÍM TẮT

Chủ dự án đưa ảnh mẫu MU và chốt bố cục. Hai đợt việc, ghi chung vì chúng dùng chung một luật.

### Thanh dưới: trái — giữa — phải, và thanh EXP neo VÀO thanh

| cụm | id | có gì |
|---|---|---|
| trái | `#mc-trai` | Nhân Vật · Túi Đồ · Kỹ Năng · Nhiệm Vụ |
| giữa | `#skillbar` | bốn ô chiêu + mấy nút chiến đấu |
| phải | `#menu-cot` | Tổ Đội · Hảo Hữu · Bản Đồ · Cài Đặt · `≡` |

- ⚠ **Nút hai bên NHỎ HƠN ô chiêu** (30px vs 40px). Tôi từng cho cả 22 ô cùng 40px, viết hẳn
  một chú thích CSS bênh vực nó, rồi **khoá luôn bằng một khẳng định trong `test_huongdan`** —
  tức là nướng cái sai vào bộ kiểm. Chủ dự án nhìn ảnh mẫu và gọi ngay: *"sao nó dài quá vậy"*.
  Thanh đo được **865 → 756px**. Khẳng định cũ đã gỡ; `test_thanhcum §7` nay chốt HAI vế —
  nút menu phải nhỏ hơn ô chiêu **và** ≥26px (đừng chữa quá tay thành một dải chấm bấm không trúng).
- ⚠ **Trần bề rộng chốt bằng PX TUYỆT ĐỐI (800), không bằng % khung nhìn.** Bản đầu tôi chốt
  "≤52% khung nhìn" đo ở 1600px; bộ kiểm chạy ở 1440 nên **đúng cái thanh 756px ấy thành 52,5%**
  và bài đỏ vì một lý do chẳng liên quan gì tới thứ nó định gác.
- ⚠ **`#xp-strip` là CON của `#bottom-hud`** (`position:absolute; left:0; right:0`), không neo
  vào khung nhìn. Đó là cách DUY NHẤT giữ nó bằng ngang dải icon khi thanh co giãn —
  `left:50%; transform:translateX(-50%)` cho ra một thanh rộng cố định, lệch ngay khi đổi cỡ màn.
  `test_thanhcum §8` đo ở **hai** bề rộng khung nhìn, vì ở đúng một bề rộng thì mọi cách neo đều xanh.
- ⚑ và ♥ vẫn là **ký tự**, không phải tranh: `ic_*.png` chưa có art cho Tổ Đội / Hảo Hữu.
- ⚠ **Nút menu là `≡`, KHÔNG phải `☰`.** `☰` là quẻ Càn của bát quái — Quy tắc số 1 cấm.

### F6 = Menu Hệ Thống (sảnh bốn nút). Bảng phím tắt thành **tab của Cài Đặt**

`SYS_NUT` khai bốn nút (Cài Đặt · Sự Kiện · Ngân Hàng Ngọc · Lệnh Nhặt) + hàng ba loại tiền
(đúng khuôn WCoinC/WCoinP/GoblintP trong ảnh — ba loại tiền ở đây **đã có sẵn**, không bịa thêm).
**Bảng xếp hạng trong ảnh thì BỎ**: chưa có máy chủ xếp hạng, mà một nút bấm vào không ra gì thì
tệ hơn hẳn không có nút — cùng bài học `openEvoPanel` của `test_cayky`.

- **Giữ id `panel-help`.** `BANG_NHOM`, `MC_BANG`, danh sách ESC và mấy bài kiểm cũ đều gọi tên
  đó; đổi tên là sửa năm chỗ để được đúng một cái tên đẹp hơn.
- **Nội dung cũ KHÔNG mất** — `hdNoiDung()` tách ra khỏi `renderHelpPanel()` và thành tab
  **Phím Tắt** của Cài Đặt (`SET_TABS`, `window.setSetTab`), đúng chỗ ảnh mẫu đặt nó.
- ⚠ **KHÔNG cướp phím J như ảnh mẫu MU** (*"Ngân hàng ngọc (J)"*). J ở game này là **NHẶT ĐỒ**,
  và đó là đường DUY NHẤT nhặt đồ bằng bàn phím. Dùng **N**. `test_hethong §3` gác cả hai chiều.

### ⚠ HÀM VẼ KHÔNG ĐƯỢC TỰ CHẶN THEO `.hidden` — `togglePanel` vẽ TRƯỚC khi gỡ cờ

Đã ghi ở mục panel, nhưng nó suýt tái diễn ở đúng hai bảng mới: `renderNgocBank()` và
`renderLenhNhat()` mà tự `return` khi bảng còn `.hidden` thì mở ra một **cái khung TRỐNG**.
Cửa hỏi `.hidden` là `ngocVeLai()` / `nhatVeLai()` — hàm vẽ thì vẽ vô điều kiện.

Và hai bảng ấy là lý do hai hàm kia tồn tại. ⚠ **Ngăn ngọc VẼ ở đúng MỘT nơi** — bảng phím N.
Tab Kho của Túi Đồ chỉ còn **một con số "đang cất" + một nút chỉ đường**; dựng lại khối ngọc ở
đó là hai cửa cùng vẽ một thứ, tức hai chỗ phải nhớ sửa. Nhưng con số kia thì vẫn phải VẼ LẠI
khi gửi/rút, và bốn công tắc nhặt thì **thật sự có ở hai nơi** (Lệnh Nhặt *và* cụm "⚙ Tự động"
của Túi Đồ). Mọi hàm gửi/rút/bật-tắt phải vẽ lại cả hai — sáu chỗ từng chỉ gọi `renderBag()`.
Bấm ở cửa này mà số ở cửa kia đứng im thì người chơi đọc ra là *"bấm không ăn"*, và **không lỗi
nào báo**.

⚠ **Nút `♪` đã gỡ theo `#mc-drop`**, và đó là chủ ý: thanh trượt 🎵 trong Cài Đặt là cửa đầy đủ
hơn một cái nút bật/tắt. `test_nhacnen` **không xoá mệnh đề cho xanh** — nó đi theo sang cửa mới
và mạnh lên: mệnh đề cũ chỉ hỏi nút có `.hidden` không (nút chết vẫn xanh), mệnh đề mới **kéo
thanh trượt thật** rồi đòi `SETTINGS.bgm` phải đổi.

### 🔊 CÔNG TẮC TỔNG ÂM THANH — `SETTINGS.amThanh`, và nó KHÁC hai thanh trượt

> ⚠ Câu ngay trên ("thanh trượt là cửa đầy đủ hơn một cái nút bật/tắt") **chỉ đúng một nửa**, và
> chủ dự án gọi tên đúng chỗ thiếu: *"game hiện tại chưa có tính năng bật tắt âm thanh"*. Giữ
> nguyên câu cũ ở trên để thấy suy luận đã hụt ở đâu, thay vì xoá trắng.

Kéo cả hai thanh về 0 thì tắt được tiếng — nhưng **mất luôn hai mức đã chỉnh**, nên bật lại phải
dò lại từ đầu. Thực tế không ai dùng đường đó; họ tắt loa máy. Công tắc riêng giữ nguyên hai con
số, và đó là **toàn bộ lý do nó tồn tại** (`test_amthanh §③` gác đúng chỗ đó — bản "ngây thơ"
zero hai thanh khi tắt sẽ đỏ).

| | |
|---|---|
| cờ | `SETTINGS.amThanh` (mặc định **true**) |
| cửa DUY NHẤT | `window.tatMoAmThanh(bat?)` — nút loa HUD · phím **L** · nút trong Cài Đặt đều gọi nó |
| cửa đọc DUY NHẤT | `AudioSys.tat()` — `bgmVol` · `sfxVol` · `sfx` · `_startTrack` đều hỏi nó |
| vẽ nút | `amVeNut()` |

- **⚠ MỘT CỬA, BA CHỖ BẤM.** Ba chỗ tự lật `SETTINGS.amThanh` là ba chỗ phải nhớ *lưu + hãm
  nhạc + vẽ lại nút + vẽ lại bảng Cài Đặt*; quên một việc ở một chỗ là *"bấm chỗ này thì ăn,
  bấm chỗ kia thì không"*. Cùng luật với `masteryKhoa` và `knOHopLe`.
- **⚠ `refreshBgmVol` phải hỏi ÂM LƯỢNG HIỆU DỤNG, đừng hỏi `SETTINGS.bgm`.** Hỏi thanh trượt
  thì tắt tiếng xong bản nhạc vẫn **quay** ở volume 0: không ai nghe thấy, mà máy vẫn giải mã
  mp3 suốt phiên — đúng thứ người chơi tắt tiếng để tránh. `_startTrack` cũng không được `play()`
  khi đang tắt.
- **⚠ PHÍM L, KHÔNG PHẢI M.** M đã là Bản Đồ. L đọc ra "loa", hợp bản Việt hoá. Thêm phím thì
  phải thêm vào `HD_BANG` + `strings/vi.js` + `strings/en.js` — một phím không ai biết là một
  phím không tồn tại.
- **⚠ SAVE ĐỜI CŨ CÓ HAI ĐƯỜNG HỎNG, KHÔNG MỘT.** Save thiếu khoá được đỡ bởi **giá trị mặc
  định** trong `Object.assign`; save có khoá mà là rác (`null`/`0`/`""`) được đỡ bởi **dòng di
  trú** `!== false`. Kiểm mỗi ca "thiếu khoá" thì phép thử ngược trên dòng di trú **im lặng** —
  vì khi thiếu khoá thì `Object.assign` đã trả `true` và dòng ấy không quyết định gì. Đã dẫm
  đúng thế một lần, và suýt kết luận là mệnh đề mù trong khi thứ hỏng là **que dò**.
- Thanh trượt nay **in ra số %**, và `setOpt(..., quiet)` phải tự cập nhật con số đó: `quiet`
  cố ý không dựng lại DOM (dựng lại thì núm tuột khỏi tay chuột), nên thiếu dòng ấy là kéo mà
  số đứng im — đúng kiểu "bấm không ăn" mà con số sinh ra để chữa.

Gác: `tests/test_amthanh.js` (8 mục, **10 phép thử ngược đều đỏ**).

### 🏛 BỘ UI GOTHIC — icon TRANH THẬT thay ký tự chữ, và khung bảng 9 LÁT

Chủ dự án đưa một tấm **2048×2048** (gói Godot 4 của Meowa). Nguồn để ở
`tools/ui/nguon/ui_gothic_2048.png` — **trong `tools/`, nên không bao giờ tới tay người chơi**;
`tools/ui/nuong_uigothic.py` cắt ra WebP vài KB.

⚠ **CẮT, ĐỪNG SHIP CẢ TẤM.** Tấm gốc 4,2 MB, mà màn tải có ngân sách đo được (21 tệp /
1,63 MB — `data/taitro.js`). Đo: 97 mảnh rời trên tấm; 13 mảnh đang dùng cộng lại **59 KB**.

| chỗ | trước | nay |
|---|---|---|
| nút loa HUD · 3 hàng Âm Thanh | emoji 🔊 🔇 🎵 | `gt_loa_bat` · `gt_loa_tat` · `gt_nhac` |
| Tổ Đội · Hảo Hữu (thanh dưới) | ký tự `⚑` `♥` | `gt_ic_todoi` · `gt_ic_haohuu` |
| ví: Lumen · Ấn Giao Kết · Shard | ký tự `◈` `✦` `♦` | `gt_xu_vang` · `gt_xu_bac` · `gt_ngoc_lam` |
| Menu Hệ Thống (F6), 4 nút | ký tự `⚙` `⏱` `◈` `✋` | `gt_ic_caidat` · `gt_ic_laban` · `gt_ic_ruong` · `gt_ic_tui` |
| vành `.panel` | `linear-gradient` 9 điểm dừng + 4 đinh tán `radial-gradient` | `gt_khung_bang` 9 lát |

- ⚠ **Emoji KHÔNG phải tranh.** Chúng vẽ theo bộ phông của **từng máy** — màu rực trên macOS,
  viền phẳng trên Windows, có máy ra ô vuông rỗng. Đứng cạnh khung HUD kim loại thì đọc ra
  một ký tự lạc. Cùng tinh thần Quy tắc số 3.
- ⚠ **Vành cũ tuy công phu vẫn là HÌNH DỰNG BẰNG MÃ** — đúng thứ Quy tắc số 3 nói không.
- ⚠ **`--khung-lat` và `--khung-day` buộc vào nhau.** Lát là bề rộng GÓC trong tranh (100);
  dày là bề dày vẽ ra. Tỉ lệ thu = day/lat quyết định mọi thứ: ở **20px (0,2×) sợi chỉ vàng
  của rail — dày ~4px trong tranh — tụt xuống 0,8px và biến mất**, cả vành đọc ra một dải tối.
  34px (0,34×) thì còn ~1,4px, nhìn ra kim loại. Đã ship nhầm 20px một lượt, ảnh chụp mới thấy.
- ⚠ **KHÔNG dùng `fill`** trong `border-image`: lát giữa là nền tối trung tính của bộ kit, để
  nó tràn vào là thay luôn màu ruột bảng mà mọi màu chữ đã cân theo `--bg-panel-*`.
- ⚠ **`border-radius` phải về 0** — phần bo cắt đúng vào bốn góc chạm trổ.
- ⚠ **Vành đi 10px → 34px là ăn thêm 48px bề ngang mỗi bảng.** Kiểm toán @`0ab8a08` đo được
  *"tràn ra ngoài màn = 0 ở cả 12 tổ hợp"*; `test_uigothic §⑤` giữ tính chất đó bằng phép đo
  (9 bảng × 3 độ phân giải), không bằng niềm tin.

#### ⚠ VIÊN NGỌC GIỮA CẠNH TRÊN: ĐÃ THỬ, KHÔNG ĐẶT ĐƯỢC — đừng cắt lại

Tấm gốc có một viên ngọc lam giữa cạnh trên. Nó **không đi cùng `border-image` được** vì lát
giữa mỗi cạnh bị KÉO GIÃN ⇒ viên ngọc hình thoi bè thành một vệt lam. Tách ra thì cả ba đường
đều tắc, và đã đo từng cái:

| đường | vì sao tắc |
|---|---|
| lớp nền | nền vẽ **bên dưới** viền ⇒ `border-image` phủ kín nó |
| `::before/::after` | `.panel` có `overflow-y:auto`, con bị cắt ở hộp đệm |
| `::after { position:fixed }` | **vẫn bị cắt** — `.panel` mang `transform` nên nó là khối chứa của cả con `fixed`. Đo: nhét ô đỏ ở `top:-34px`, đếm điểm ảnh đỏ ⇒ **0/64** |

Đường còn lại là tách mọi bảng thành vỏ + ruột-cuộn — sửa ~20 chỗ gọi `innerHTML` để lấy một
món trang trí. Không đáng, và đúng loại thay đổi lan rộng mà tài liệu này có sẹo (`#mc-drop`).
⇒ **Đã gỡ luôn tệp**: một tài sản không ai tham chiếu là tài sản chết, và kiểu chết đó im lặng.

#### Thanh máu / mana: TÔ ĐẦY PHẢI VƠI, KHÔNG PHẢI CO LẠI

Hai cái rãnh bo góc tô `linear-gradient` nay là art vát chéo có mũi nhọn, cắt từ khối chân
dung của bộ kit. Cơ chế: **`background-size: auto 100%`** — ảnh thu theo CHIỀU CAO nên vẽ ra
đúng một cỡ bất kể `.fill` rộng bao nhiêu; `.fill` chỉ việc cắt bớt bằng hộp của mình. Nhờ thế
**`updateHud()` không phải đổi một dòng nào**, nó vẫn đặt `bar-hp.style.width = N%`.

- ⚠ **Khai nhầm thành `100% 100%` thì ảnh co theo `.fill`**: ở 30% máu cả cái mũi nhọn cũng co
  lại và nằm ở 30% — thanh máu vơi đi bằng cách **NHỎ LẠI**. Nhìn qua vẫn ra "thanh đang vơi",
  nên phải đo mới thấy.

  ⚠⚠ **VÀ CÂU Ở ĐÂY TỪNG GHI LÀ `test_uigothic §⑥` GÁC NÓ — SAI, nó chưa bao giờ gác.** Mệnh đề
  *"cỡ thanh phải bất biến"* lấy hộp của **`#orb-hp`**, mà thứ co lại là `.fill` **bên trong** nó;
  `#orb-hp` thì không bao giờ đổi cỡ, nên mệnh đề ấy đúng ở cả hai bản. Thử ngược bản cũ ra
  **đỏ 1/3 lượt** — và đúng lượt đỏ là lượt que dò rơi trúng chữ số, tức bắt vì MAY. *Một mệnh
  đề đúng ở mọi trạng thái là một mệnh đề không chốt gì*, và tài liệu ghi rằng nó chốt thì tệ hơn
  không ghi.

  ⚠ **ĐO Ở 60%, ĐỪNG ĐO Ở 30%.** Nén cả tấm xuống 30% thì mũi nhọn chỉ còn ~7px, khử răng cưa
  nuốt mất — đo được hai bản **gần như trùng nhau** (tại 0,30 của thanh: 100 vs 90). Ở 60% mũi
  nhọn còn ~12px và lề trong suốt bên phải của tấm art cũng nén theo, nên màu **tắt sớm** trước
  mép phần đã tô: **138 (đúng) vs 34 (sai)**, hơn ba lần. `§⑥b` gác đúng chỗ đó và là mệnh đề
  DUY NHẤT bắt được phép đột biến ấy.
- ⚠ **Chiều cao là số DUY NHẤT đặt tay; bề rộng suy từ tỉ lệ ĐO ĐƯỢC** của tấm art (402/54 =
  7,444 · 402/38 = 10,579). Đặt tay cả hai là có ngày chúng lệch, mà lệch thì cái mũi nhọn bị
  kéo bè — thứ duy nhất của một thanh vát chéo mà mắt bắt được ngay.
- ⚠ **Bản RỖNG chỉ dìm PHẦN MÀU, khung vàng giữ nguyên.** Dìm cả tấm thì ở nửa máu cái khung
  cũng tối đi nửa chừng — đọc ra "thanh bị hỏng" chứ không ra "thanh vơi một nửa".
- ⚠ **KHÔNG lấy thanh thứ ba (lục) làm EXP.** Chủ dự án đã chốt kéo thanh EXP xuống cho bằng
  ngang dải icon ở thanh dưới; bày EXP hai chỗ là đúng cái lỗi *"cùng một con số bày hai chỗ
  thì chỗ nào cũng bị liếc qua, mà không chỗ nào được tin"*. Mà để một rãnh lục rỗng vĩnh viễn
  thì còn tệ hơn. Nên cắt hai, bỏ một.
- ⚠ **VÒNG CHÂN DUNG tròn của tấm art thì KHÔNG dùng** — `#cd-khung` cố ý là ô VUÔNG, lý do đã
  đo hẳn hoi trong `style.css`: *"16 con Axie có tỉ lệ rộng/cao 1,07–1,52 nên khuôn tròn cắt
  mất tai/sừng/càng — đúng phần làm người ta nhận ra con vật của mình"*. Thanh cắt từ x=240 để
  thoát khỏi vòng; mép trái phẳng lại hợp hơn vì nó ghé sát khung vuông.

#### Bài kiểm gác HAI CHIỀU, và một cái bẫy đo

`tests/test_uigothic.js` (6 mục, **10 phép thử ngược**):
- **① mã nhắc tệp nào cũng phải có** — họ `ISO_NEO`: sáu map mất sạch cây vì một bước chép tay.
- **② tệp nào cũng phải có người nhắc** — chiều ngược lại, và nó không bao giờ tự lộ.
  ⚠ Phải đọc cả chuỗi GHÉP ĐỘNG (`assets/ui/${n.anh}.webp`, tên nằm trong `SYS_NUT`), không
  thì bốn tệp của Menu Hệ Thống bị báo oan là "chết".
- **④ 9 lát có chạy thật không**: vẽ cùng một bảng ở **hai bề rộng** rồi so vùng GÓC. Cắt 9 lát
  thì góc **không đổi** theo bề ngang; kéo giãn cả tấm thì góc bè ra. Hỏi `border-image` có
  mặt trong CSS là chưa đủ — khai sai `slice` vẫn ra một chuỗi hợp lệ.

⚠ **QUE DÒ CỦA ⑥ ĐỌC ĐÚNG MỘT ĐIỂM Ở GIỮA THANH — tức đọc thẳng vào CON SỐ MÁU.**
`.cd-thanh span` canh giữa DỌC và bắt đầu ở 10px, nên điểm `(0,08 · giữa)` rơi vào chữ số, mà
chữ số thì đổi theo lượng máu (`22194 / 22194` → `7313 / 22194`). Ba lượt liên tiếp ở CÙNG một
trạng thái ra `{81,10,4}` · `{87,54,51}` · `{118,98,96}` ⇒ **đỏ 1/3 lượt**, và đỏ vì một thứ
chẳng liên quan gì tới cơ chế tô đầy. Nay đọc **đỉnh độ đỏ của cả CỘT**: chữ trắng và bóng đen
đều kéo độ đỏ XUỐNG nên không bao giờ thắng được phần tô. Sau khi sửa, năm lượt ra đúng cùng
một bộ số (`trai` 115-117 · `phai` 184↔46).

⚠ **Hai lần phép đo ④ nói dối, cả hai đều là QUE DÒ hỏng, không phải cơ chế hỏng:**
1. Bảng trong mờ 90% và thế giới sau lưng thì **động** (mây, cỏ, ánh sáng chạy theo
   `performance.now()`). Hai lượt chụp cách nhau vài trăm mili giây là hai ảnh khác nhau kể cả
   khi khung vẽ y hệt. ⇒ phải che canvas + đặt nền đặc trước khi chụp.
2. `Buffer.compare` trên hai tấm PNG **đỏ ngay khi một điểm lệch 1/255**. Đo lại bằng điểm ảnh:
   lệch tối đa **1**, lệch TB **0,01**, số điểm lệch quá ngưỡng **0** — tức 9 lát chạy hoàn hảo
   trong lúc bài báo "đang kéo giãn cả tấm". ⇒ so điểm ảnh CÓ DUNG SAI (giải mã bằng canvas
   trong trang, không cần thư viện), đừng so byte.

### 🗺 BẢN ĐỒ GÓC MÀN — MỘT bộ vẽ cho HAI khổ, và nó từng bị XÉN MẤT 23%

Chủ dự án mở bản đồ lên và nói đúng một câu: *"nhìn rất rối"*, kèm yêu cầu cho nó giống tấm bản
đồ thành và **đồng nhất** với nó. Đo ra **ba lỗi chồng lên nhau**, không lỗi nào in ra một dòng:

| | đo được |
|---|---|
| **tràn cột, bị xén** | `capNhatKhungMinimap()` chốt trần bề rộng **240px chép tay**, trong khi `#cot-phai` rộng 190 (lòng **180**) và mang `overflow:hidden` ⇒ **mất 23% bên phải ở CẢ BA độ phân giải** — đúng góc có Lò Hỗn Độn và Vũ Khí |
| **không vẽ hình cái thành** | Ardhaven có sẵn **68 đỉnh `diTrong` · 8 đường phố · 16 khối nhà**; bản đồ LỚN vẽ hết, bản đồ GÓC vẽ **0** — một mảng màu phẳng rồi rải 28 chấm lên |
| **26 NPC một màu** | 17 trong số đó là người lore, nhưng cả 26 ra cùng một chấm vàng cỡ 3 ⇒ Lò Rèn không phân biệt nổi với một người đứng kể chuyện |

**⚠ `style.css` VỐN KHAI ĐÚNG** (`#minimap { width:180px }`) — thứ phá nó là **style NỘI TUYẾN**
mà `capNhatKhungMinimap()` ghi đè lên. *Một bảng kiểu đúng không cứu được gì khi có mã ghi thẳng
`style.width`; và kiểu hỏng ấy không hiện trong CSS, phải đo trong DOM mới thấy.*

**⇒ `veNenThanh()` là bộ vẽ DUY NHẤT của hình cái thành** (đa giác sàn · phố · khối nhà), dùng
chung cho cả `drawMinimapStatic()` lẫn `veBanDoThanh()`; `mauCong()` là cửa duy nhất cho màu cổng.

> ⚠ Mục cũ ghi *"KHÔNG dùng lại `drawMinimapStatic()`"* và nó **vẫn đúng với thứ nó nói** — bộ vẽ
> ấy chép cứng cỡ chấm/cỡ chữ theo ô 240×120. Nhưng kết luận rút ra hồi đó — *dựng hẳn hai bộ vẽ*
> — là cái GIÁ phải trả, không phải lời giải. Cách đúng là tách phần **không phụ thuộc khổ** ra
> dùng chung, và cho mọi con số còn lại **suy từ bề rộng khung**.

**⚠ MÀU SÀN LẤY TỪ `md.ground`.** Nay **mọi** map đều có `diTrong` (12 map ngoài trời đã lát viên),
nên tô cứng một sắc ô-liu là mười hai vùng ra cùng một màu — xoá đúng bản sắc mà `mapBanSac()`
dựng ra để nói.

**⚠ CHẤM VẼ HẾT TRƯỚC, NHÃN VẼ SAU, DẤU NHIỆM VỤ SAU CÙNG — ba lượt.** Gộp một vòng thì nhãn của
người này bị chấm của người đứng sau trong mảng vẽ đè lên: không lỗi, chỉ là một chữ khuyết góc.

**⚠ NHÃN XẾP THEO KHOẢNG CÁCH TỚI NGƯỜI CHƠI, không theo thứ tự mảng `NPCS`.** Đo ở Ardhaven khổ
180×90: **bảy** người có chức năng nằm gần như cùng một hàng (y≈27), tổng bề rộng nhãn **~250px
trên một hàng rộng 180** — tức không phải thiếu chỗ thử mà là vật lý. Ai bị bỏ mà quyết bằng thứ
tự khai trong dữ liệu thì đó là quyết định ngẫu nhiên; quyết bằng khoảng cách thì kẻ bị bỏ luôn
là kẻ ở XA, và bản đồ góc màn vốn để trả lời *"quanh mình có gì"*.

**⚠ HAI NẤC TÊN.** Tám hướng đặt nhãn vẫn rớt đúng một người, và người rớt là **Lò Hỗn Độn**
(nhãn 42px, còn 33px tới mép). Nấc hai là tên CHUNG ngắn (`Lò Rèn`, 25px) ⇒ đủ **9/9**. Nó mơ hồ
khi ba cửa hàng cùng ra "Cửa Hàng" — đúng cảnh báo đã ghi ở `veBanDoThanh` — nên **chỉ dùng khi
nấc một không lọt**: một chấm ghi "Cửa Hàng" vẫn nói được *ở đây có tiệm*, chấm trần thì không.

**Sửa cái xén cũng vá luôn một chỗ chồng lấn sát nút:** khe giữa bảng Nhiệm Vụ và Nhật Ký ở
1280×720 đi từ **−1 lên +29** (minimap 120 → 90px cao).

**Cố ý KHÔNG làm: nhãn tên CỔNG trên bản đồ góc.** `Bird Tribe Heights · c60` dài 96px trên khung
180px; bốn cổng thành là hết chỗ của cả tấm. Cổng vẫn là chấm đúng màu, tên thì ở bản đồ lớn.

Gác: **`tests/test_bandonho.js`** (5 mệnh đề, **cả năm đã thử ngược và đều đỏ**) — ① không tràn cột
(đo ở BA bề rộng) · ② có vẽ khối nhà và phố (đếm điểm ảnh) · ③ mọi người có chức năng được gọi tên
· ④ `textAlign` không rò · ⑤ hai bản đồ cùng bảng màu. Và `test_uxdo §②` đổi mệnh đề *"bản đồ nhỏ
≥100px cao"* — một con số phụ thuộc TỈ LỆ MAP đang đứng — sang *"không tràn khỏi cột"* + sàn DIỆN
TÍCH, tức gác đúng cái lỗi mà bản cũ mù.

#### ⚠ BA LẦN QUE DÒ SAI Ở MỆNH ĐỀ ⑤ — cùng một họ, ghi lại

1. **Đọc đúng MỘT điểm ảnh ở tâm mỗi NPC** ⇒ báo 6/9 lệch màu. Sai: nhãn chữ (nét viền đen
   2,5px), chấm người đứng cạnh, khung nhìn camera và dấu nhiệm vụ đều vẽ **đè** lên tâm ấy — phép
   đo bắt lớp TRÊN CÙNG chứ không bắt cái chấm.
2. **Đọc mảng 9×9 quanh tâm** ⇒ còn 3/9 lệch. Vẫn sai, và lần này vì THIẾT KẾ chứ không vì lỗi:
   ở khổ này nhãn của người bên cạnh phủ kín cả chấm 6px, mà nhãn thì **tô đúng cùng màu ấy** —
   thông tin không mất, chỉ phép đo mất.
3. **Đếm màu trên TOÀN khung** ⇒ đúng. Mệnh đề muốn biết *hai bản đồ có dùng chung một bảng màu
   không*, nên hỏi "màu của hạng này có XUẤT HIỆN ở cả hai không" là miễn nhiễm với chuyện ai vẽ
   đè lên ai.

*Luật chung: trước khi tin một phép đo điểm ảnh, hỏi đã có ai vẽ đè lên chỗ mình đang đọc chưa.*

### Ngân Hàng Ngọc: sáu ICON TRANH THẬT, không phải một hình vẽ đổi màu

`NGOC_ANH` → `assets/ui/ngoc_*.webp`, nướng bằng `tools/ui/nuong_ngoc.py` từ kit Axie chính chủ
(96px, **fit-square** chứ không kéo giãn; cả sáu chỉ **16,3 KB**). Trước đó sáu loại dùng chung
một hình canvas đổi màu — che màu đi thì không ai phân biệt được loại nào, đúng bài học đã ghi ở
mục chibi (*"tô đặc một màu rồi nhìn"*).
Màu nhãn lấy từ `JEWEL_COLORS` đang chạy (`ngocMau()`), nên **icon và chữ không thể nói hai đằng**.

### Lệnh Nhặt: gom công tắc, **KHÔNG đẻ cờ mới**

Bốn công tắc (`autoNgoc` · `autoSell` · `autoEquip` · `donMuc`) đều **đang chạy sẵn**, chỉ là
chúng nằm rải ở ba chỗ. Bảng này là MỘT nơi đọc/ghi đúng mấy cờ cũ, không phải bản sao thứ hai.
Dòng tầm hút **chỉ ĐỌC** kèm nút sang Cài Đặt — dựng thanh trượt thứ hai ở đây là hai cửa cùng
sửa một cờ, đúng kiểu thừa đã phải dọn ở bảng Nhân Vật.

### Nhật Ký Chiến Đấu sang nửa PHẢI — sườn trái để dành cho CHAT

Chưa có chat người-với-người; ghi nhận chỗ trước để khi làm không phải dời một lần nữa.
`test_hethong §8` gác: `#combat-log-wrap` phải nằm ở nửa phải màn.

#### ⚠ HAI KHỐI NEO TỪ HAI ĐẦU NGƯỢC NHAU TRONG CÙNG MỘT CỘT — chúng SẼ chồng nhau

`#cot-phai` (bản đồ nhỏ + bảng Nhiệm Vụ) chảy từ **trên** xuống; `#combat-log-wrap` là
`position:fixed` neo từ **đáy** lên. Cả hai rộng đúng 190px ở cùng một cột — và **không ai kẹp
chúng lại**. Đo được trước khi sửa, với 20 dòng nhật ký:

| màn | chồng |
|---|--:|
| 1920×1080 | 0 (có khe 63px) |
| 1600×900 | **77px** |
| 1440×810 | **118px** |
| 1280×720 | **157px** |

Thứ bị che là **đáy bảng Nhiệm Vụ** — tức mục "Mục Tiêu Hôm Nay", đúng phần nội dung ngày mà cả
một đợt việc (`DAILY_BANDS`) vừa dựng ra. Không lỗi nào báo.

⇒ Ngân sách của Nhật Ký nay là **BIẾN CSS** (`--nk-day` · `--nk-cao` · `--nk-dau`), và
`#hud-right` trừ đúng ngần ấy ra khỏi trần chiều cao của mình. Chép tay hai con số ở hai chỗ là
bảo đảm chúng lệch nhau sau vài đợt sửa — và media query 720px phải ghi đè **BIẾN**, không ghi
đè thẳng `bottom`/`max-height`, nếu không cột phải vẫn chừa chỗ theo số của bản desktop.

- ⚠ **KHÔNG cần `min-height:0` — và đó là chỗ tôi đã đoán sai.** Phản xạ thường là *"cho một
  con flex co được thì phải `min-height:0`"*, nên tôi thêm nó ở hai chỗ cộng `flex:0 1 auto`.
  **Cả ba đều trơ**: `#quest-tracker` vốn có `overflow-y:auto`, mà kích thước tối thiểu tự
  động của một khối cuộn đã là 0. Gỡ từng cái rồi gỡ cả ba đều ra **đúng cùng một con số**.
  Thứ duy nhất gánh việc là `max-height`. Đã gỡ cả ba.
  *Ba dòng CSS trơ mà trông như đang gánh việc thì tệ hơn không có: chúng làm phép thử ngược
  IM LẶNG (gỡ một dòng, bài vẫn xanh) — tức bộ kiểm không gác được dòng nào, và người sau sẽ
  sửa nhầm chỗ.* Và chính cái im lặng đó là thứ đã chỉ ra chúng trơ: **một phép thử ngược im
  lặng phải được TRUY tới cùng, không được ghi nhận là "mệnh đề hơi yếu" rồi bỏ qua.**
- ⚠ **Chữa chồng lấn bằng cách bóp chết bảng Nhiệm Vụ cũng làm "khe" dương.** Nên mệnh đề gác
  phải đo **cả hai vế**: khe ≥ 0 **và** bảng Nhiệm Vụ còn ≥90px **và** bản đồ nhỏ còn ≥100px.
- ⚠ **Đo ở NHIỀU chiều cao màn.** Ở đúng 1920×1080 hai khối *không* chồng nhau — kiểm mỗi cỡ
  đó là xanh vĩnh viễn trong khi mọi laptop 720p/900p đều hỏng. Cùng bài học với `test_muigio`.

#### ⚠ `text-overflow:ellipsis` TRÊN NHẬT KÝ ĂN ĐÚNG PHẦN THƯỞNG

Cột chữ rộng **168px**, mà một dòng hạ quái thật cần **249px** ⇒ **14/14** dòng thưởng bị cắt,
và chỗ bị cắt luôn là **ĐUÔI**:

```
☠ Hạ Axie Heo Rừng — Nhận: +28 EXP +162◈     ← thứ game sinh ra
☠ Hạ Axie Heo Rừng — Nhận…                   ← thứ người chơi đọc được
```

Mười dòng liền hiện ra giống hệt nhau. Nới cột thì **không được** — 190px là bề ngang của
`#cot-phai`, hai khối phải bằng nhau mới đọc ra một cột. Nên cho **xuống dòng**
(`overflow-wrap:anywhere` + thụt dòng tràn bằng `text-indent` âm, để nhìn ra là nối dòng trên
chứ không phải một sự kiện mới). *Cắt cụt trong im lặng bao giờ cũng tệ hơn một dòng cao gấp đôi.*

#### ⚠ LỚP KHÔNG KHAI `range` ⇒ BẢNG KỸ NĂNG NÓI DỐI, KHÔNG PHẢI BỎ TRỐNG

`thieulam` · `minhgiao` · `bug` không khai `range`, nên `skillInfo()` lui về `sect.range` = rỗng
⇒ `skThongSoGon` in `tầm 0`. Mà theo **quy ước của chính game**, `tam: 0` nghĩa là *"ngay tại chỗ
đứng"* — tức bảng đang bảo Twisting Slash, Rageful Blow, Impale… đều nổ dưới chân người niệm.
Đo được **24-25 chiêu/lớp** in tầm 0, so với **10-11** ở hai lớp có khai (số 10-11 là thật: đó
là chiêu diện rộng quanh mình).

⚠ **Chiến đấu KHÔNG hỏng** — `atkRange()` vốn đã có `|| 90`. Nên chữa là **khai đúng 90**, con
số đang chạy, chứ không phải nghĩ ra một số mới: khai `range` mà đổi luôn tầm đánh thật là một
thay đổi **cân bằng** lẻn vào sau một bản sửa hiển thị. `test_uxdo §③` gác cả hai vế
(`SECTS[x].range === atkRange()`).

#### ⚠ TIÊU ĐỀ CHUNG KHÔNG THỂ ĐÚNG CHO CẢ DANH SÁCH

Bảng NPC in `PHỤ TUYẾN — ${MAPS[n.map].name}` — tên vùng của **NGƯỜI GIAO**. Nhưng **11 mục** có
người giao đứng ở map khác (`vandai` ở Werebear Woods giao việc của Lối Mòn Corran…), nên chúng
hiện dưới dòng *"PHỤ TUYẾN — WEREBEAR WOODS"* trong khi `sideOnKill` chỉ đếm khi
`curMap === 'loimon'`. Người chơi nhận việc ở đây, đánh ở đây, và tiến độ **không bao giờ nhúc
nhích**. Nay tiêu đề bỏ tên vùng, và **từng mục** mang dòng `📍 Làm tại: …` — in ở **mọi** mục,
kể cả cùng vùng: một cái nhãn chỉ hiện ra lúc "có chuyện" thì lúc nó vắng mặt người chơi không
đọc ra "cùng vùng", họ chỉ không thấy gì.

#### ⚠ TRẦN THỜI GIAN HƯỚNG DẪN ĐẨY NGƯỜI CHƠI VÀO NGÕ CỤT

`TUT_TRAN = 90` giây cho mọi bước. Đứng yên trong thành thì hộp hướng dẫn tự trôi sang bước
*"Nhấn SPACE hạ 1 con Axie Heo Rừng"* — mà Ardhaven có **0 bãi quái**. Đo lại: bấm SPACE 90 lần
trong 67 giây rồi AUTO 3 phút ⇒ `kills 0 · xp 0 · bạc 0`, toạ độ không đổi một pixel.

⇒ Mỗi bước khai thêm `duocO()` — *làm được ở chỗ đang đứng không*. Hết giờ thì **bỏ qua** mọi
bước bất khả thi, hết bước làm được thì **đóng hẳn** hướng dẫn.

- ⚠ **ĐO THẾ GIỚI, ĐỪNG MÔ HÌNH HOÁ NÓ**: hỏi `mobs.length` (thứ đang có thật trên màn), không
  tra một bảng "map nào có quái" — bảng đó là bản sao thứ hai của dữ liệu map và sẽ nói dối
  ngay lần đầu ai đó thêm một bãi mà quên sửa.
- ⚠ **Chỉ bỏ qua ở đường HẾT GIỜ, không ở đường LÀM XONG.** Người chơi vừa dịch chuyển tới Rẻo
  Rừng Corran thì `tutAdvance('map')` chạy ngay trong nhịp đó, mà `mobs` rải xong trong đúng
  nhịp ấy hay chưa là chuyện của `buildWorld` — hỏi `duocO` ở đấy là có ngày bỏ qua **vĩnh
  viễn** bước `kill` vì một cuộc đua khung hình.
- Bước 2 còn **nói sai người giao**: nó bảo tìm *Trưởng Lão Rell* để "nhận nhiệm vụ đầu tiên",
  trong khi `QUESTS[0].npc` là `ah_gac_tay` (**Lính Gác Cổng Tây**) và nhiệm vụ đã `active` từ
  giây 0. Điều kiện qua bước cũng sai: `level >= 3` là một **cửa ra thứ hai** bên cạnh
  `tutAdvance('npc')` có sẵn trong `tryTalk()`, và nó tự đánh dấu hoàn tất cho một người chưa
  từng bấm E. Đã gỡ; bài kiểm nay suy tên NPC **từ `QUESTS[0]`**, không chép cứng.

Gác: `tests/test_uxdo.js` (5 mục, 10 phép thử ngược).

⚠ **Gỡ một khối HTML thì soát mọi `getElementById` trỏ vào nó.** Gỡ `#mc-drop` để lại
`document.getElementById('btn-music').addEventListener(...)` không chốt null — nó ném **ngay lúc
nạp trang** và giết mọi lượt đăng ký phía sau. Cùng cái bẫy đã ghi cho `btn-inv`.

Gác: `tests/test_thanhcum.js` (8 mệnh đề) · `tests/test_hethong.js` (18 khẳng định, **chín** phép
thử ngược đều đỏ). Ba bài CŨ phải theo nội dung sang nhà mới — `test_huongdan §2` (bảng phím nay
ở tab Cài Đặt) · `test_kho B4` (tab Kho nay chỉ đường) · `test_nhacnen` (thanh trượt thay nút ♪);
cả ba **mạnh lên chứ không nhẹ đi**, và cả năm phép thử ngược của chúng đều đỏ. *Một bài kiểm đỏ
vì nội dung DỜI CHỖ thì sửa bằng cách đi theo nó, không phải bằng cách xoá mệnh đề.*
⚠ `test_hethong §7` bản đầu chốt *"nhãn khớp `BẬT|TẮT`"* — xanh ở **cả hai** trạng thái, tức không
gác gì. Đổi thành *"nhãn phải ĐỔI"*, và đúng phép thử ngược đó mới bắt được `toggleAutoNgoc` quên
gọi `nhatVeLai()`. *Một cái chốt đúng ở mọi trạng thái là một cái chốt không chốt gì* — cùng bệnh
với luật `≤60% là kill` và với *"đúng 7 NPC có trang thoại"*.

⚠ **Một phép thử ngược IM LẶNG là bằng chứng cái QUE DÒ hỏng, không phải bằng chứng mệnh đề yếu.**
Đã suýt kết luận ngược: que dò của tôi thay chuỗi `"left:0; right:0;"` trong `style.css`, mà chuỗi
đó có mặt ở nhiều rule chẳng liên quan — phép đột biến rơi nhầm chỗ và bài vẫn xanh. **Mỏ neo của
phép thử ngược phải DUY NHẤT**, và phải đếm số lần xuất hiện trước khi thay.


## ⚔ LỰC CHIẾN · 🎁 NHẬN QUÀ · ✹ DẢI TRẠNG THÁI

Ba thứ ship cùng một đợt theo ảnh mẫu chủ dự án đưa. Gác chung: **`tests/test_lucchien.js`**
(10 mệnh đề, sáu phép thử ngược đều đỏ).

| | ở đâu |
|---|---|
| Công thức | `LC_HE` + **`lucChien(p)`** — cửa DUY NHẤT |
| Phân rã | `LC_NGUON` + **`lcPhanRa()`** · chi tiết `lcChiTiet(id, tongDong)` |
| Bảng | `renderLucChien()` → `#panel-lucchien` · nút HUD `#btn-lc` trong **`#lc-khung`** |
| Quà | `QUA_DK` · `QUA_SK` · `renderQua()` → `#panel-qua` · `quaNhanMoc()` · `quaNhanHet()` |
| Trạng thái | **`TT_DINH`** + `capNhatTrangThai()` → `#trang-thai` (cột PHẢI, trên bản đồ nhỏ) |

### ⌗ KHUNG LỰC CHIẾN LÀ MỘT UI RIÊNG, KHÔNG PHẢI MỘT CHIP NHÉT VÀO KHUNG CHÂN DUNG

Bản đầu đặt hai nút trong `#cd-nut`, nằm bên trong `#cd-phai` — tức cùng một cột với hai thanh
máu/mana. Chủ dự án nhìn ảnh chụp và chốt: *"cho nó ra ngoài hẳn 1 UI kế bên thanh máu đi"*.
Nay `#lc-khung` là một khung riêng — vành đồng và nền lấy **đúng công thức của `#chan-dung`** —
và cả hai nằm trong một hàng `#hud-dau`.

⚠ **`width:min(238px,40vw)` DỜI TỪ `#hud-left` XUỐNG `#chan-dung`.** Cột trái nay chứa cả một
hàng rộng hơn khung chân dung; khoá bề rộng ở cột là khung Lực Chiến bị bóp hoặc tràn. Con số
giữ nguyên, chỉ đổi chỗ nó bám vào ⇒ hai thanh máu/mana không đổi lấy một điểm ảnh nào.

⚠ **`margin-bottom` CỦA MỘT KHỐI TÍNH VÀO CHIỀU CAO HÀNG.** `#chan-dung` giữ `margin-bottom:5px`
thì `align-items:stretch` kéo khung bên cạnh cao thêm đúng 5px — đo được **83 vs 88**, hai mép
dưới lệch nhau. Lề ngoài phải nằm trên `#hud-dau`. *Lề của một khối không được là thứ quyết định
chiều cao khối bên cạnh nó.*

⚠ **ĐO BỀ RỘNG BẰNG NHÃN DÀI NHẤT, ĐỪNG ĐO BẰNG NHÃN ĐẦU TIÊN.** Ở 106px thì "LỰC CHIẾN" vừa,
còn "NHẬN QUÀ" — sau khi chừa 13px cho chấm đỏ — đọc thành **"NHẬN …"**. Nay 120px.
`test_lucchien §6b` hỏi `scrollWidth > clientWidth` chứ không nhìn ảnh chụp.

⚠ **`§6` giữ BA VẾ, bỏ vế nào cũng lọt một kiểu hỏng:** không lồng trong `#chan-dung` (hỏi cây
DOM, không suy từ toạ độ) · không đè lên khung chân dung · cao bằng nó. Ba phép thử ngược đều đỏ.

Màn hẹp (≤820px) thì bỏ nhãn chữ, khung tụt về 58px — để không đẩy chân dung ra khỏi mép trái.

### ⚠ NĂM DÒNG PHÂN RÃ SUY TỪ HỆ ĐANG CHẠY, KHÔNG CHÉP TỪ ẢNH MẪU

Ảnh mẫu là một game kiếm hiệp và có hai dòng dự án này **không có**:
- *"Lực chiến thú cưỡi"* — Ragoon đã gỡ, con Axie thay chỗ nó thì luật Đổi Vai nói thẳng
  **0 chỉ số**. Trục sức mạnh từ phía Axie đã bị tháo BA lần và lần nào cũng quay lại dưới dạng
  "chỉ vài dòng nhỏ thôi"; một dòng "Lực chiến Axie" trên bảng này là lần thứ tư, chỉ khác tên.
- *"Lực Chiến Thần Binh"* — đã gỡ; chỉ còn khoản NỀN tầng 1 mà ai cũng có sẵn từ cấp 1, nên nó
  thuộc dòng CƠ BẢN.

Năm nguồn THẬT: **cấp+chỉ số · trang bị · kỹ năng · Đại Thành · Tái Sinh**.

### ⚠⚠ MỞ BẢNG TỪNG LÀM MẤT 82% MÁU — và nó im lặng tuyệt đối

`lcPhanRa()` đo từng dòng bằng cách **TẮT nguồn ấy rồi chạy lại `calcDerived()`**. Mà
`calcDerived()` **kẹp `player.hp` xuống `maxHp`** (dòng ~8532): tắt trang bị là máu trần tụt
hàng chục nghìn ⇒ máu hiện tại bị kẹp theo, và lượt `calcDerived()` cuối trả lại máu TRẦN chứ
không trả lại máu ĐANG CÓ. Thử ngược (bỏ hai dòng cất/trả) đo được **35.999 → 6.757**.

⇒ Cất `hp`/`qi` trước, trả lại **SAU** lượt `calcDerived()` cuối cùng. `test_lucchien §3` mở
bảng ba lượt rồi đòi máu không suy suyển một điểm.

### ⚠ TẮT RIÊNG TỪNG NGUỒN RỒI CỘNG LẠI THÌ **VƯỢT TỔNG** — đo được, không phải lo xa

Bốn nguồn NHÂN vào nhau: Đại Thành nhân vào trang bị, Tái Sinh nhân vào tổng, cấp kỹ năng nhân
vào Công Kích mà trang bị đã đẩy lên. Tắt riêng từng cái thì phần **giao thoa** bị đếm nhiều lần
— đo được lệch **−133** ở cấp 120 đã đầu tư cả bốn trục, và **−5.022** ở full BiS.

Bản đầu để phần dư `max(0, tong − Σ)` nuốt chỗ lệch: nó kẹp về 0 và **mất trắng** ngần ấy điểm
khỏi bảng, tức năm dòng không cộng đúng tổng — thứ người chơi cộng nhẩm ra ngay.

⇒ Cách đúng: đo **NỀN** bằng cách tắt CẢ BỐN cùng lúc (đó là dòng "nhân vật", một con số đo
trực tiếp), rồi chia `tong − nen` cho bốn trục **theo tỉ lệ đóng góp thô**, sai số làm tròn dồn
vào dòng lớn nhất. Năm dòng cộng đúng bằng tổng, **không xấp xỉ**.

⚠ **Chi tiết trang bị cũng vậy, một tầng dưới.** Mười một món cũng nhân vào nhau: tháo riêng
từng món rồi cộng ra **14.087** trong khi dòng tổng ghi **5.895**. Và bản đầu còn tệ hơn — nó in
thẳng `itemPower()`, một **ĐƠN VỊ khác hẳn** (thang nội bộ để xếp hạng món trong túi), nên mười
ô cộng ra hơn 43.000 dưới một dòng ghi 6.499. `lcChiTiet(id, tongDong)` nhận tổng của dòng rồi
chia lại theo đúng tỉ lệ ấy.

### ⚠ CẤP KỸ NĂNG KHÔNG ĐI QUA `calcDerived()` — nên dòng đó từng bằng ĐÚNG 0

`skLvMult` × `skTnMult` nhân vào sát thương ở **trong `castSkill()`**, không chạm một trường nào
trên `player`. Phép phân rã chỉ đo `calcDerived` nên dòng "kỹ năng" ra **0** kể cả với người đã
rót 40 cấp vào cả bốn ô — và một dòng luôn bằng 0 thì tệ hơn không có dòng đó.

⇒ Đưa `lcSkMul()` **thẳng vào `lucChien()`**, đừng tính riêng rồi trừ khỏi phần dư: trừ khỏi
phần dư là **dán nhãn lại** phần sức mạnh cơ bản chứ không đo thêm được gì. Cho vào công thức
tổng thì phép tắt-nguồn tự đo được nó, y hệt bốn dòng kia, không cần nhánh đặc biệt nào.
Trung bình trên các ô **ĐANG CẮM**, không trên mọi chiêu đã học: chiêu ngoài thanh không bấm
được thì nâng nó không làm ai mạnh hơn trong trận.

### ⚠⚠ `⚔` ĐỌC RA DẤU `✕` Ở MỌI CỠ TỪ 11 TỚI 19 PX

Bộ ký hiệu phương Tây trong Quy tắc số 1 liệt `⚔`, nên tôi lấy nó làm mặt Lực Chiến. Chụp ra
thì nút HUD đọc thành **"✕ 12.616"** — tức "đóng". Dựng bảng thử glyph ở đúng năm cỡ đang dùng
(11·13·15·17·19 px) rồi chụp: `⚔` (U+2694, hai thanh kiếm bắt chéo) là **hai nét chéo mảnh**,
dưới 20px chúng dính vào nhau. Ở 30px thì nó hoàn toàn rõ.

| | |
|---|---|
| **Rõ từ 11px** — ký hiệu ĐẶC | `◉ ★ ◆ ✦ ▲ ● ◈ ✚ ⚑ ☾ ♦` |
| **Mù dưới ~15px** — nhiều nét mảnh | `⚔ ☠ ❄ ✽ ✹ ☼ ⚙` |

⇒ Lực Chiến dùng **`◉`**. Ký hiệu nhiều nét (`☠` trúng độc, `❄` tê liệt) chỉ dùng ở dải trạng
thái và ô ở đó để **16px**, không phải 14. *Đọc bảng ký hiệu trong tài liệu mà không thử Ở CỠ
THẬT là chọn nhầm — cùng lối với luật "vẽ xong phải render ra ảnh mà nhìn".*

### ✹ Dải trạng thái: MỘT BẢNG, không mười ba khối `if`

Trước bản này chỉ có ĐÚNG HAI trạng thái nhìn thấy được, và cả hai là `<div>` chép cứng ở góc
TRÁI: `#hud-buff` (🍶) và `#hud-loidon` (⚡) — **đã gỡ cả hai**. Mười một cái còn lại (trúng độc,
tê liệt, trọng thương, sáu buff của chiêu, cửa sổ Liên Trảm, Sa Đọa) **không có một cửa nào nói
ra**: người chơi đứng yên mất máu mà không biết mình trúng độc, bị khoá chân thì đọc ra "lag".

- ⚠ **`con(p)` trả SỐ GIÂY, và mỗi đồng hồ một đơn vị.** `poisonT`/`dinhT`/`buffAtkT` đếm ngược
  bằng giây; **`tenuiTT` là một MỐC `Date.now()`** — đọc thẳng ra giây thì được một con số nghìn
  tỉ. Quy đổi tại chỗ khai, đừng để chỗ vẽ phải biết.
- ⚠ **`maDao` KHÔNG có đồng hồ** (bật/tắt theo `player.toiac`), nên `con` trả `Infinity` và cờ
  `vinh:true` nói cho chỗ vẽ biết đừng in số giây. Bài kiểm nào bật `maDao` mà quên đặt
  `toiac >= 5` thì `update()` tắt nó ngay khung sau — đã dẫm.
- ⚠ **Rỗng thì `display:none`, đừng để nó chiếm chỗ.** Còn chiếm chỗ thì bản đồ nhỏ tụt xuống
  5px lúc có buff rồi nhảy lên lúc hết — giật mỗi lần một buff tắt.
- ⚠ **Khoá so sánh làm tròn tới GIÂY.** `updateHud()` chạy mỗi khung; viết lại `innerHTML` của
  dải này 60 lần/giây cho một thứ đổi vài giây một lần là đúng cái `_lastHudName` sinh ra để
  tránh.

### 🎁 Nhận Quà: phần thưởng TẠM, nhưng cái MÁY thì thật

Chủ dự án chốt *"quà gì thì mình chưa biết, cứ có UI/UX trước đã"*. Nên `QUA_SK` mang nhãn
**TẠM** hiện thẳng trên bảng — nhưng bấm Nhận là nhận được đồ thật, cờ vào save, mở lại thì nút
đã mờ. *Một bảng đẹp mà nút bấm không ra gì là đúng cái lỗi `openEvoPanel` đã ghi ở mục
`test_cayky`.*

- ⚠ **Trao quà đi qua `traoThuong(rew)`, KHÔNG cộng tay.** Đó là cửa duy nhất của cả chính tuyến
  lẫn phụ tuyến và nó đã lo đủ bốn nhánh (kể cả *túi chật thì thả xuống đất*). Cộng thẳng
  `player.silver += …` là đường thứ hai, và đường thứ hai sẽ quên đúng cái nhánh ấy.
- ⚠ **Điều kiện đếm từ TRẠNG THÁI, không từ sự kiện** — cùng luật `MOC_NV.dem()`. Móc vào "vừa
  lên cấp" thì người đã ở cấp đó trước khi bảng ra đời không bao giờ nhận được.
- ⚠ **Chấm đỏ trên nút có HÃM NHỊP 500 ms.** `quaChoNhan()` quét 16 mốc và mốc Lực Chiến gọi lại
  `lucChien()` — bốn lượt tính thừa mỗi khung cho một con số đổi vài phút một lần.
- ⚠ **Đừng mượn biến `_now` của khối Đồng Hồ Thế Giới.** Nó khai ở một khối DƯỚI chỗ này, nên
  tham chiếu tới nó ném `ReferenceError` **mỗi khung**; `node --check` xanh, chỉ mở trang mới
  thấy. Cùng vết sẹo `NV_CAO`/`VONGKIEM_TAM`.

## 🌐 `?lang=en` — HAI LỚP DỊCH PHẢI TỰ ĐỌC, KHÔNG LỚP NÀO ĐỌC KÉ LỚP NÀO

`?lang=en` / `?lang=vi` thắng `localStorage`, rồi **ghi lại** vào đó — để đưa được một đường link
chơi thử bằng tiếng Anh cho người chưa từng mở game (`?test=1&lang=en`), mà không bắt họ đi tìm
nút đổi ngôn ngữ.

**⚠ ĐOẠN ĐỌC URL LÀ BẢN SAO CỐ Ý, có ở CẢ `i18n.js` LẪN `lang.js`.** Hai lớp dùng chung khoá
`vlcm_lang`, và `i18n.js` nạp trước rồi ghi vào đó — nên "lang.js đọc ké" *chạy đúng ở máy bình
thường*, và **thử ngược bằng cách gỡ đoạn URL của lang.js vẫn XANH**. Sợi dây ngầm ấy đứt khi
`localStorage` bị chặn (cửa sổ riêng tư, chặn dữ liệu trang): `setItem` ném, i18n.js giữ `'en'`
trong bộ nhớ còn lang.js đọc ra rỗng ⇒ **màn hình lẫn hai thứ tiếng**, không một lỗi nào báo.

⇒ `test_defaultlang §H` dựng đúng cảnh đó (`addInitScript` cho `Storage.prototype.setItem/getItem`
ném) và là mục **duy nhất** trong D-H bắt được chuyện đó. *Bốn mục kia hỏi đúng thứ cần hỏi mà
vẫn không gác được gì ở vế này — một bài kiểm chạy ở đúng một cấu hình môi trường thì nó chỉ gác
được cấu hình ấy.*

### ⚠⚠ BƠM CHUỖI VÀO MỘT `<div>` RỜI KHÔNG ĐO ĐƯỢC "NGƯỜI CHƠI CÓ ĐỌC RA TIẾNG ANH KHÔNG"

`test_dichen §④` bơm từng chuỗi kể chuyện vào một `<div>` do **chính nó** dựng rồi đọc lại.
Sau đợt dịch 190 chuỗi, cả bảy trần của nó về **0** và bài xanh. Nhưng nó chỉ chứng minh
`lang.js` **DỊCH ĐƯỢC** chuỗi — không chứng minh chuỗi **tới được mắt người chơi** dưới dạng
MỘT text-node. Quét lại bằng cách mở đúng mấy cái bảng ra (5 lớp × 7 cấp × mọi NPC, lái bằng
`tryTalk()` thật) ra **418 dòng tiếng Việt** mà cả năm mục cũ đều mù:

| ở đâu | dòng | vì sao không mục nào thấy |
|---|--:|---|
| **`#panel-quest`** — thoại phố, quầy thuốc, quầy rương, Trại Ngựa, Vực Thẳm, Truy Nã | **377** | bảng chỉ dựng ra khi **đứng cạnh một người và bấm E** |
| `#forge-content` — Lò Hỗn Độn | 16 | `§③` đọc `innerText` của panel cha, không vào con |
| lời nhắc góc màn · thẻ nhiệm vụ · bảng Kỹ Năng · Nhật Ký | 25 | chúng là HUD, không phải `#panel-*` |

⇒ **`test_dichen §⑥` nay MỞ bảng NPC thật** — hai map × hai cấp × mọi NPC — rồi quét trong đó.

**⚠ HAI CẤP, KHÔNG MỘT.** Quầy thuốc ghép máu và số lọ, quầy rương ghép khoảng cấp, Vực Thẳm
đổi lời theo cấp: đo một cấp thì mọi khuôn CÓ SỐ đều lọt qua bằng đúng một trạng thái.

**⚠ KHUÔN CÓ SỐ VÀO `RULES`, ĐỪNG VÀO `EXACT`.** Khai `Hồi đầy máu — đang 10.003/10.003` vào
`EXACT` là dịch đúng ở **một** giá trị máu và trơ tiếng Việt ở mọi giá trị khác — mà bài kiểm
đo ở một cấp thì nó vẫn xanh.

**⚠ CHỐT TỰ KIỂM ĐÒI ≥20 LƯỢT BẮT CHUYỆN TRƯỚC KHI CHẤM.** `tryTalk()` không mở bảng thì vòng
quét chạy trên một bảng `hidden` và trả về **0 dòng** — trông y hệt "đã dịch xong".

*Luật chung: một phép quét không mở được cái bảng thì nó không gác được cái bảng ấy, và nó trả
về những con số trông hoàn toàn bình thường.* Cùng vết sẹo đã ghi cho bộ quét đọc tệp của đài
phun nước và cho `§③` (quét 15 bảng, bỏ qua HUD).

### ⚠⚠ VÀ MẶT LỚN NHẤT LẠI LÀ BĂNG-RÔN GIỮA MÀN — 59/65 chuỗi THUẦN chưa dịch

`test_dichen §②` bọc `fillText` rồi đọc lại, nên nó chỉ thấy chuỗi nào **tình cờ vẽ ra** trong
~30 giây bài chạy. Mà `zoneBanner` — chữ to nhất trên màn hình, ngay giữa khung nhìn — phần lớn
nổ ở một **mốc GIỜ THẬT** (Hung Thần 0/4/8/12/16/20h · Đàn Vàng 2/6/10/14/18/22h · Vực Nứt
0/6/12/18h) hoặc ở một sự kiện **một lần trong đời** (Tái Sinh · thông quan Tầng Sâu · sáu
băng-rôn DI TRÚ chỉ chạy đúng một lần cho save đời cũ).

Nó lộ ra hoàn toàn do MAY: lượt chạy hôm nay rơi trúng mốc *"10 phút nữa Đàn Vàng"* ⇒ §② đỏ
**2 chuỗi**. Quét thẳng `zoneBanner = {…}` trong `game.js` rồi hỏi từng chuỗi qua bộ dịch thật
ra **59 / 65 chuỗi THUẦN chưa dịch**. Đã dịch hết, cộng 32 `RULES` cho phần có khuôn.

**⚠ PROBE BẢN ĐẦU BÁO 102/108 VÀ ĐÓ LÀ BÁO ĐỘNG GIẢ.** Nó thay mọi `${…}` bằng một mốc `§` rồi
hỏi — mà thay thế ấy **phá mọi luật `RULES` có `(\d+)`**, nên chuỗi có khuôn đều ra "chưa dịch"
dù luật khớp hoàn hảo với bản THẬT. Chỉ chuỗi KHÔNG có `${}` mới kết luận được theo lối ấy; ba
"chưa dịch" cuối cùng cũng là artefact (`'☠ GỤC Ở TẦNG ' + f` nối số ở ngoài · `\u2726` là
chuỗi thoát trong MÃ NGUỒN, không phải ký tự lúc chạy). *Trước khi tin một con số, hỏi xem phép
đo có dựng đúng cái thể hiện mà người chơi thấy không.*

**⚠ NỬA DỊCH CÒN TỆ HƠN KHÔNG DỊCH.** `⏱ HẾT GIỜ — PHÓ BẢN THẤT BẠI` từng ra
`⏱ HẾT GIỜ — DUNGEON THẤT BẠI`, và `5 phút giảm 40% sát thương thiên lôi…` ra
`5 min: giảm 40% lightning damage…` — đó là `TERMS` thay lẻ từng từ khi không `EXACT` nào khớp.
`EXACT` được hỏi TRƯỚC `RULES` và `TERMS`, nên khai ĐỦ CÂU là nó thắng.

**⚠ VÀ TÔI VỪA DẪM LẠI BẪY "KHỚP ĐẦU TIÊN THẮNG" TRONG CHÍNH ĐỢT NÀY.** `unshift` một luật
`/^ĐAI (.+)$/` lên trên luật `/^ĐAI (NGOẠI VI|TRUNG TÂM|HẠT NHÂN)$/` **đã có sẵn và đúng hơn
hẳn** ⇒ `ĐAI TRUNG TÂM` ra `TRUNG TÂM BELT`. Đã gỡ. *Trước khi `unshift` một luật RỘNG, grep
xem đã có luật HẸP nào cùng tiền tố chưa.*

**⚠ ĐỒNG HỒ QUẦY CÓ HAI ĐỊNH DẠNG:** `13:58` khi còn dưới một giờ, `1h59m` khi còn trên. Luật
viết cho một dạng thì xanh ở mọi lượt chạy rơi vào dạng ấy — mà rơi vào dạng nào là do GIỜ THẬT
quyết định. Cùng họ với cả mặt băng-rôn.

## ⚠ QUY TẮC SỐ 3: KHÔNG DÙNG VECTOR. CHẤM HẾT.

Chủ dự án chốt hai lần (phiên 2026-09-05): **không vẽ vector, và cũng đừng nhắc tới nó
nữa.** Không đề xuất "tạm vẽ vector", không giữ lại đường vector cũ làm lối lui, không
so sánh hai lối. Vector đã bị gỡ khỏi hệ trang bị và nó không quay lại.

Mọi art — trang bị, vũ khí, giáp, nhân vật, cảnh vật — là TRANH THẬT, nối vào game qua
một BẢNG KHAI (`VK_ANH` cho vũ khí, `NV_GIAP` cho giáp, `NV_BO` cho thân…).

**Nguồn art, theo thứ tự phải thử:**

1. **GÓI SPINE ĐÃ CÓ.** Mỗi gói nhân vật kèm sẵn một bộ giáp ĐẦY ĐỦ và một cây vũ khí
   trong atlas của nó. Đây là chỗ phải nhìn TRƯỚC TIÊN, và đã có lần bỏ sót: đợt nối
   vũ khí đầu tiên em đi thẳng sang meowa trong khi năm cây kiếm/nỏ/quyền trượng nằm
   sẵn trong atlas, cùng hoạ sĩ với bộ giáp. Xem `docs/ART_VUKHI_SPINE.md` và
   `tools/spine/`.
2. **meowa.ai** — chỉ khi gói Spine không có thứ cần. Viết bản mô tả (kích thước, hướng,
   chỗ nắm, nền trong suốt) rồi đưa chủ dự án; sandbox không gọi được meowa (chặn egress).
   Nếu có khoá API thì truyền qua **biến môi trường**, không bao giờ ghi vào tệp trong repo.
3. Món chưa có tấm thì rơi về **ô chờ art** (`iaChuaArt`) — một bóng dáng phẳng, cố ý vẽ
   thô để không ai tưởng là art thật rồi để nguyên. Đó KHÔNG phải "vẽ vector", đó là chỗ
   trống có nhãn.

Và KHÔNG ngồi dựng hình bằng `ctx.beginPath()` trong mọi trường hợp.

### 📐 ĐO ART BẰNG MÁY TRƯỚC KHI BÀN VỀ PHONG CÁCH

`python3 tools/do_art.py` quét toàn bộ `public/game/assets` và đo **sáu chỉ số** mỗi tấm, gom
theo *"thứ người chơi nhìn thấy CẠNH NHAU trong một khung hình"* — không gom theo thư mục.
Kết quả máy đọc: `docs/DO_ART.json`. Kết luận + danh sách cần sinh: **`docs/KIEM_ART.md`**.

| chỉ số | nó trả lời câu gì |
|---|---|
| `sang` | độ sáng trung bình trên điểm ảnh ĐẶC (alpha > 0,78) |
| `bh` | bão hoà — **chỉ số tách hai ngôn ngữ art rõ nhất** (nền 0,31 vs thân 0,55-0,61) |
| `lech` | lệch chuẩn độ sáng TRONG thân; dưới ~0,12 là đọc ra một cái bóng ở cỡ nhỏ |
| `vien` | tỉ lệ điểm ảnh có `L < 0,18` — **chữ ký của nét bao đen** (nền iso = 0,000 tuyệt đối) |
| `am` | R−B, nóng hay lạnh |
| `trong` | tỉ lệ điểm trong suốt; **`0` nghĩa là một tấm THẺ ĐỤC, không phải sprite** |

⚠ **Gom nhóm theo CHỖ ĐỨNG, không theo thư mục.** Một viên lát sáng 0,72 đứng cạnh một con quái
sáng 0,13 là một vấn đề thật; hai icon nằm ở hai bảng khác nhau thì không.

⚠ **`vien` mới là thứ tách được hai ngôn ngữ, `sang` thì không** — cùng bài học đã ghi ở mục art
tối (*"lệch chuẩn quyết định, không phải sáng trung bình"*). Nền map và vật thể iso đo ra
`vien` trung vị **0,000**, còn mọi thứ đứng trên nó đo 0,09-0,23. Đó là chỗ gãy lớn nhất của
toàn bộ art hiện tại, và nó vô hình với mắt cho tới khi đo.

Sandbox KHÔNG gọi được meowa.ai (chặn egress), nên bước sinh ảnh là việc của chủ dự án.
Nếu có khoá API, truyền qua **biến môi trường** — không bao giờ ghi vào tệp trong repo.

Lịch sử: hình vector của giáp, vũ khí, nhẫn và dây chuyền đã bị gỡ hết trong hai đợt
(`2ed74f6`, `f151948`). Đừng thêm lại. `test_itemdb` gác: `ITEM_ART`, `iaRing`,
`iaPendPhys`, `iaPendMagic`, `iSheenArc` sống lại là bài đỏ.

`veChimera()` — hình đệm vector năm dáng cho 16 Chimera — cũng đã gỡ (phiên 2026-09-05),
cùng đợt thay art Chimera sang bảng khung hình. Bảng chưa tải xong thì KHÔNG vẽ gì, con vật
hiện trễ một nhịp. `test_chianh` gác độ phủ bảng khung.

*Ngoại lệ còn giữ:* icon vật phẩm TIÊU HAO (bình thuốc, sách, bùa, hộp) vẫn vẽ bằng canvas
— chúng nhỏ, không thuộc hệ trang bị, và không đứng cạnh art thật để lộ chênh lệch.

### Chữ hiển thị — Baloo 2 CHỈ cho mặt Khế Ước

Quét cả 54 repo `axieinfinity`: chữ hiển thị chính chủ của Axie là **Lilita One**
(`godot-axie-starter-3d`), nhưng nó chỉ có latin + latin-ext — "Khế Ước" hiện ra thành
"Kh   c". Thay bằng **Baloo 2** (cùng chất mập-tròn, CÓ bộ dấu), tự chứa trong
`public/game/fonts/`, gắn vào token `--font-chi`.

Nó **không** đụng `--font-display`. Baloo 2 từng bị gỡ khỏi `--font-display` vì chữ bo tròn
kiểu hoạt hình trên khung thép đinh tán là hai ngôn ngữ hình ảnh chửi nhau — lý do đó vẫn
đúng. Chỉ dùng ở chỗ có con Axie đứng cạnh.

---

## Hình vật phẩm — LẮP TỪ BỘ PHẬN, không phải file PNG

> ⚠ Mục này là LỊCH SỬ. Hệ lắp-từ-bộ-phận cho GIÁP và VŨ KHÍ đã gỡ — xem Quy tắc số 3.
> Phần còn đúng: cách `ITEM_DB` khai một món bằng một dòng dữ liệu, và cách tra bảng khai art.

220 món, **0 byte**. Trước đây 11 file PNG (2,3 MB) phải gánh toàn bộ trang bị: mọi thanh
kiếm dùng chung `vukhi.png`, khác nhau đúng một bộ lọc xoay màu theo giai.

**Mỗi món là một DÒNG trong `ITEM_DB`, hình suy ra từ tổ hợp bộ phận.** Thêm món mới = thêm
một dòng, không viết hàm vẽ mới.

| dòng | bộ phận |
|---|---|
| Lưỡi | `IBLADE` 11 × `IGUARD` 7 × `IPOMMEL` 4 × `IMOTIF` 6 |
| Gậy/Trượng | `ISHAFT` 4 × `IHEAD` 7 |
| Cung / Nỏ | `iaBow` 3 cánh · `iaCrossbow` |
| Giáp | `ARMOR_TRAIT` 12 kiểu × 5 ô |

**Giáp sinh THẲNG từ `HERO_SETS`** (`ARMOR_PIECES` × 25 bộ). Nhờ vậy hình trong túi và hình
trên người dùng chung một nguồn — không có cách nào lệch nhau, kể cả khi đổi bảng màu bộ sau
này. **Vũ khí trên tay cũng vẽ bằng chính bộ phận dựng icon** (`hHeldWeapon` + `HELD_FIT`).

**Bốn luật đã trả giá mới biết:**
1. **Màu hoa văn thuộc về MÓN, không thuộc về giai.** Lấy `M.glow` thì Kiếm Điện, Kiếm Băng
   và Kiếm Lửa cùng giai sẽ cùng một màu — mất sạch bản sắc. Dùng `MOTIF_COL`.
2. **Vũ khí có `WEAPON_MAT` riêng, không dùng bảng màu giai.** Bảng đó viết cho GIÁP trên
   người: giai 10 là đỏ, nên mọi vũ khí cuối game sẽ đỏ hết.
3. **Icon cần sàn độ sáng riêng** (`itemPal` nâng khi `_lum(hi) < 0.30`). Nhân vật đứng trên
   bản đồ SÁNG, icon nằm trên nền panel TỐI — dùng chung một bảng màu cho hai chỗ là sai.
4. **Khoá cache phải gồm MỌI thứ đổi hình**, kể cả `plus` (không phải `plusStage(plus)`) —
   nếu không thì +8 và +9 dùng chung một ảnh dù có vẽ khác đi cũng vô ích.

**Khoá lớp** (`itemUsable`): kiếm chỉ Dark Knight, gậy chỉ Dark Wizard, cung chỉ Sylvan
Ranger. Chặn ở **cả ba** chỗ mặc đồ — bấm tay, tự mặc khi nhặt, nút Mặc Đồ Tốt Nhất. Bỏ sót
một chỗ là auto lách được luật. Dây chuyền và nhẫn không khoá.

**Hiệu ứng chém theo `motif` là THUẦN HÌNH ẢNH.** Cơ chế chiến đấu là việc của chiêu thức và
Tiến Hoá — cho vũ khí làm cả hai thì hai hệ giẫm chân nhau và người chơi không biết sát thương
lan ra là do kiếm hay do chiêu.

⚠ **Ba lỗi hình chỉ lộ khi CHỤP RA XEM, không lỗi nào lộ khi đọc code**: nhẫn ra hình móng
ngựa (vẽ cung hở), găng ra thanh sô-cô-la (4 khối chữ nhật bằng nhau), kiếm cao hơn cả người
(hệ số 2.5 thay vì 1.45). Vẽ xong phải render ra ảnh mà nhìn.

## Mọi thứ trong màn đo theo `NV_CAO`, không chép cứng px

`NV_CAO` (hiện **132**) là chiều cao nhân vật trên màn. Nó là **thước đo chung**: thần khí
(`TK_PHONG`), hình học Vòng Kiếm Lửa (`VONGKIEM_TAM/RX/RY/VKX/VKY`), sải chân (`SAI_CHAN`),
ngưỡng chạy (`CHAY_TU`), chỗ bàn chân chạm đất (`chanDy()`) và cỡ avatar (`avaCo`) — **tất cả
đều dẫn xuất từ nó**. Chép cứng lại một con số đã thu sẵn là mở đường cho chúng lệch nhau, và
kiểu lệch ấy rất khó lần: phóng to nhân vật thì bàn chân trượt đất, vòng lửa quét ngang đầu,
chiêu giáng xuống nổ ngang bụng — mà nhìn thì chỉ thấy "hình như hơi lạ".

Sải chân giữ con số **đo trên bảng khung** (`SAI_CHAN_NUONG`) rồi mới thu theo `NV_CAO`; nhịp
bước = quãng đường ÷ sải chân nên sai một chút là trượt chân ngay. ⚠ Thu bằng
`NV_CAO/HERO_H` = 0,600 (chiều cao Ô VẼ), **không** bằng `NV_CAO/CAO_THAN_NUONG` = 0,830
(chiều cao THÂN) — đã lẫn hai cái đó một lần, lệch 38%. Xem mục "ĐI hay CHẠY".

⚠ **Thứ tự khai báo**: hằng nào nhân với `NV_CAO` thì phải nằm **dưới** nó trong `game.js`.
`const` có vùng chết — đặt ở trên là cả tệp chết ngay lúc nạp, mà lỗi báo ra lại là một hằng
khác ở tận dưới ("Cannot access 'X' before initialization"). eslint và tsc **không** bắt được;
chỉ mở trang mới thấy. Đã mắc một lần với `VONGKIEM_TAM`.

## ~~Chimera đi theo KHÔNG BAO GIỜ được lấn át nhân vật~~ — luật đã GỠ

> ⚠ Giữ đúng cái tiêu đề này để cảnh báo, thay vì xoá trắng rồi để người sau đọc `CHI_THAN`
> trong lịch sử git mà tưởng nó còn. Cùng kiểu bẫy đã ghi ở mục "~~Khắc Ấn~~".

Luật cũ (`chiCoTrongMan` · `CHI_THAN` 0,45 · `CHI_TRAN` 0,55) khoá cỡ con thú đi theo theo **hộp
vẽ ra**, cả cao lẫn rộng, tương đối với `NV_CAO`. Nó tồn tại vì có **HAI cái thân** đứng cạnh
nhau trong màn, và câu hỏi "con nào là ngươi" là câu hỏi thật.

**Ragoon đã gỡ** (xem mục Đổi Vai). Nay chỉ còn MỘT thân: con Axie **LÀ** thân người chơi. Một
cái thân không lấn át được chính nó.

⚠ **Cỡ avatar đi theo luật NGƯỢC LẠI, đừng chép số cũ sang.** `AVA_TY` 0,72 / `AVA_TRAN` 0,95:
avatar và lớp nhân vật **THAY CHỖ NHAU** lúc ra đòn, nên khối nhìn thấy phải **bằng nhau**, không
phải nhỏ hơn. `CHI_THAN`/`CHI_TRAN` cố ý nhỏ hơn người — chép sang là mỗi cú đánh một cú giật cỡ.
`tests/test_cothu.js` nay gác đúng luật mới đó (và gác luôn việc Ragoon không sống lại).

## 🌌 MÀN HÌNH CHỜ — ART CHÍNH CHỦ AXIE, ĐÂY LÀ NGOẠI LỆ CÓ PHẠM VI

Chủ dự án chốt: **màn hình chờ phải mang hơi hướng Axie rõ nhất có thể.** Trước đợt này nó là
một dãy núi đêm dựng bằng đường + một tấm PNG hiệp sĩ Dark Knight — người mở game lần đầu nhìn
thấy một thế giới dark-fantasy chung chung, không một dấu hiệu nào cho biết đây là game Axie.

**⚠ NGOẠI LỆ CHỈ TRONG `#sect-select`.** Phần còn lại của game vẫn là MU — Quy tắc số 1 không
đổi. Đừng lấy khối CSS `MÀN CHỜ KIỂU AXIE` ở cuối `style.css` làm cớ để bo tròn cả game.

### Ba mảnh, mỗi mảnh một chỗ

| Mảnh | Ở đâu |
|---|---|
| Nền Lunacia tách mười lớp, có xa gần | `NEN_LOP` · `nenNhom()` · `drawTitleScene()` trong `game.js` |
| Sân khấu: lớp nhân vật + con Axie | `ccBoCuc()` · `ccNenSan()` · `ccHeroVe()`; canvas `#cc-hero` |
| Khung giao diện kiểu Axie | khối cuối `style.css`, scope `#sect-select` |

Nướng art: `python3 tools/title/nuong_nen_axie.py` → `public/game/assets/title/lunacia/` (700 KB
cho 10 lớp + 1 bệ đứng). Gác: `tests/test_titlefx.js` (6 mục).

### Vì sao chọn cảnh TÁCH LỚP chứ không phải tấm 1920px

Kit có sẵn `PvE/Backgrounds/class/bg-*.jpg` ở 1920×1080 — nhưng chúng là nền PHẲNG vẽ cho sân
khấu đánh bài, đặt sau một màn chờ thì không có xa gần. `PvE/Backgrounds/story/9-rocky-mountain-1`
chỉ 1024px nhưng **tách mười lớp**: trời · núi · ba tầng mây · sương · cây thế giới · mặt đất ·
hai tầng tiền cảnh. Mây và sương trôi được, và đó mới là thứ làm màn chờ sống.

> Bộ kit **không kèm prefab nào** cho mấy cảnh `story/`, nên `y` của từng lớp là **đo bằng mắt
> trên ảnh dựng lại**, không tra được ở đâu. Bảng `LOP` trong công cụ nướng và `NEN_LOP` trong
> `game.js` phải TRÙNG KHÍT.

### ⚠ NĂM LỚP TRÊN SÂN KHẤU LÀ NHÂN VẬT THẬT, KHÔNG PHẢI `pick_*.webp`

Bản đầu vẽ bộ tranh anh hùng `assets/nv/pick_<lớp>.webp` — tỉ lệ tám đầu, giáp nhiều lớp, vũ
khí to bằng người. Chủ dự án gọi thẳng đó là "nhân vật fake": bấm Vào Game xong thì nhận một
nhân vật KHÁC HẲN — thân nướng từ Spine, đầu to, mắt to, **cao đúng 159 điểm ảnh**.

Nay sân khấu và chân dung trong ô nhân vật đều đọc `assets/title/lop/<lớp>.webp` + bảng hình
học `data/lop_cho.js`, nướng bằng `tools/title/nuong_lop_cho.cjs`.

- **Nướng bằng chính `heroSprite()` chạy trong trình duyệt thật.** Chép phép chồng lớp
  (`NV_LOP` × `NV_LOP_HOP`) sang Python là dựng bản sao thứ hai của một luật đang sống — sửa
  một lần là hai bên lệch, mà lệch kiểu đó chỉ lộ ra khi nhìn ảnh chụp.
- **Vì sao phải nướng:** thân của năm lớp là các lớp rời, cộng lại **3,3 MB**. Màn chờ là thứ
  TẢI ĐẦU TIÊN. Năm dải khung nướng sẵn chỉ **399 KB** (webp `quality=90`, `alpha_quality=100`
  — alpha phải lossless, mất mát ở alpha hiện thành quầng xám quanh mọi mép).
- **⚠ `CC_PHONG_TRAN` = 1,5.** 159px là TOÀN BỘ độ phân giải nhân vật này có trong kho, không
  phải một lựa chọn. Kéo lên 400px cho đầy khung thì ra một bóng người nhoè đứng cạnh nền vẽ
  tay sắc nét. Thà để nhân vật nhỏ trong một thế giới rộng — đó cũng đúng nhịp art Axie. Vì
  thế `#cc-hero` là khung THẤP VÀ RỘNG (1040×420), không phải khung cao nửa màn hình.
- **Tỉ lệ người ↔ Axie hỏi thẳng `avaCo()`**, cùng hàm mà trong màn dùng. Luật thật không phải
  "Axie cao 0,72 lần thân người" mà là "0,72 lần VÀ hộp vẽ ra không quá 0,95 lần theo CẢ HAI
  chiều" — 16 con có 16 tỉ lệ rộng/cao (1,07 → 1,52) nên con bè nhất bị vế thứ hai thu lại
  đáng kể. Bỏ vế đó thì con bè nhất trông như đang dắt người đi.
### Trang bị hiện lên người — BA tín hiệu, ba nguồn khác nhau

Ô ĐANG CHỌN vẽ bằng `ccVeNguoiBo()`, gom ba thứ mà `player.equip` đổi được:

| Tín hiệu | Nguồn | Phủ tới đâu |
|---|---|---|
| **Bộ giáp** | `heroSprite()` dựng sống, qua `NV_GIAP` | **3/35** tổ hợp `lớp\|giai` |
| **Cánh** | `veCanh()` — art thật, KHÔNG nằm trong sprite | mọi lớp |
| **Hào quang +N** | `nvHaoQuangSau/Truoc()` — dựng theo bóng dáng | mọi lớp |

⚠ **`ccArtSan()` là cái van, đừng gỡ.** `heroSprite()` **luôn** trả về một canvas: không có
art thì nó dựng hình bằng ĐƯỜNG — hiệp sĩ xám, mũ sừng, áo choàng đỏ, tức đúng "nhân vật fake"
mà cả đợt này sinh ra để gỡ, chỉ khác là nay nó chớp một nhịp rồi biến. Van đóng thì lùi về
dải nướng: **thà thân trần còn hơn một nhân vật khác hẳn.**

⚠ **Đường art thật đã nướng hào quang VÀO sprite.** Nhánh đó tuyệt đối không gọi lại hai hàm
hào quang — gọi là chồng hai lớp, +11 cháy trắng xoá.

Đo được (`test_titlefx §8`, nhân vật full `applyTestBoost`): Dark Wizard 6.348 → **31.609** điểm
ảnh (có `dwsm1`, thấy nguyên bộ giáp); Spellblade 5.602 → **34.688** (chưa có art giáp, nhưng
cánh + hào quang +11 vẫn hiện). Van đóng đúng ở Spellblade, mở đúng ở Dark Wizard.

> **Nợ thật sự nằm ở ART, không ở mã.** `NV_BO` chỉ khai `lớp|1`, nên `nvTen(lớp, giai≥2)` trả
> `undefined`. Tức chỉ cần chưa có mục `NV_GIAP` khớp là **cả game** (không riêng màn chờ) rơi
> về hình dựng bằng đường — đo được ở chế độ `applyTestBoost`: 4/5 lớp ra hộp vẽ 236×236 thay vì
> 64×159. Chưa xác nhận ở nhịp chơi thường (giai 2-3), nhưng nếu đúng thì đó là một lỗ thủng
> của Quy tắc số 3 nằm ngay trong `drawPlayer`, đáng một đợt riêng.

### Chân dung ô nhân vật CHƯA mang trang bị

`ccLopIcon()` cắt từ dải nướng nên nó luôn là thân trần, khoá đệm chỉ theo lớp. Ở khổ 46px thì
gần như chỉ thấy đầu và vai, nên chênh lệch nhỏ — nhưng mũ và vương miện thì có đổi. Muốn đúng
thì khoá đệm phải gồm `heroGearSig(gv)` và cắt từ sprite dựng sống.

`tests/test_titlefx.js §7` gác: art phải đến từ `lop/*.webp`, đủ số ô, và không phóng quá trần.

### ⚠ MÀN CHỜ PHẢI HỎI CÙNG CÁI HÀM MÀ TRONG MÀN DÙNG

Ba thứ trên sân khấu đều là bản sao của một luật đang sống, nên cả ba phải TRA chứ không được
chép: con Axie nào thuộc lớp nào (`AVA_MAC_DINH`), con Axie của nhân vật đang chọn
(`avatarId(pl)`), và Axie to bằng mấy phần người (`avaCo`). Chép ra bảng riêng là màn chờ hứa
một đằng, vào game ra một nẻo — đúng cái lỗi mà cả đợt này sinh ra để sửa.

Đã suýt ship đúng lỗi đó: bản đầu khai `CC_AXIE_LOP` riêng (Dark Knight → Ironshell) trong khi
game khai Emberjaw.

**Và đây là chỗ đau: `git merge` KHÔNG báo gì cả.** Nhánh `main` trong lúc đó gỡ hẳn
`chiCoTrongMan()` · `CHI_THAN` · `CHI_TRAN` · `tests/test_cothu.js` (con thú đi theo bị thay
bằng avatar). Màn chờ gọi `chiCoTrongMan()`. Hai bên sửa hai vùng khác nhau của `game.js` nên
git ghép êm ru, `node --check` xanh, và thứ còn lại là **một lời gọi tới hàm không còn tồn
tại** — chỉ ném lỗi lúc chạy, mà lại ném trong vòng vẽ màn chờ.

⇒ **Trộn nhánh xong, đừng tin `node --check`.** Đếm lại từng hàm mà mã mới dựa vào:
`for f in <danh sách>; do grep -c "function $f" public/game/game.js; done`. Rồi chạy đủ bốn
cổng TRÊN BẢN ĐÃ TRỘN — bản đã trộn là mã mà **chưa bên nào từng kiểm**.

### Tông màu — ẤM và SÁNG, đây là chỗ "cute" của game

Bản đầu dìm cả cảnh về xanh mực cho hợp HUD: đo được vùng trời/cây chỉ còn ~60/255 trong khi
bản gốc là 94. Năm nhân vật mắt to đứng trên một vũng sáng xanh lạnh thì đọc ra **bóng ma**,
không ra dễ thương. Nay nhuốm màu rất nhạt (`#eceafb`), viền tối chỉ còn ở đỉnh và đáy để chữ
đọc được, và **đo lại vùng trời/cây ra 95 — đúng bằng bản gốc chưa chỉnh tông**.

Đèn sân khấu đổi từ xanh lạnh sang **đào + bạc hà**, kèm một vệt hắt từ mặt đất lên chân. Đây
là chỗ DUY NHẤT của game được phép ấm hơn phần còn lại: nó nằm SAU nhân vật, không phải trên
khung giao diện.

⚠ **Vũng sáng phải tắt dần về MỌI phía trước khi chạm mép canvas.** Đã dẫm bẫy này HAI lần:
một lần bằng vầng sáng lớn hơn khung, một lần bằng `createLinearGradient` chạy suốt bề rộng.
Cả hai lần thứ hiện ra là một **hình chữ nhật sáng hơn nền**, mép thẳng đứng thấy rõ mồn một.
Nên `ccBoCuc` chừa lề ≥ `than*0.68` (bán kính đèn) và vũng sáng mặt đất lấy `r = min(cx, w−cx)`.

### Hai chế độ của sân khấu — cả hai đều phải sống

- **Có nhân vật đang chọn** → vẽ lớp của ô đó + con Ragoon nó đang mang. Đây là mô hình đã chốt
  của game ("Axie là avatar, 5 lớp là sức mạnh") dựng thành hình ngay màn đầu tiên.
- **Tài khoản trống** → cả năm lớp đứng thành hàng, mỗi lớp một con Axie (`CC_AXIE_LOP`, năm
  con 5★ thuộc năm lớp Axie khác nhau). Màn chờ của tài khoản trống là tấm áp phích của game;
  bốc đại một lớp ra đứng đó thì vừa không nói được gì, vừa làm người mới tưởng mình bị gán lớp.

`tests/test_titlefx.js` kiểm RIÊNG hai chế độ. ⚠ Mục 3 của bài gọi `startGame` nên localStorage
có nhân vật — nạp lại trang là rơi vào chế độ một người. Bản đầu quên điều đó rồi đi đo hàng
năm lớp trên một khung chỉ có một người: hai cột ngoài cùng ra 0, trông y như lỗi bố cục.

### Bốn cái bẫy đã dẫm, ghi lại

1. **`'multiply'` trên canvas TRỐNG không ra "màu nhân", nó ra ô màu ĐẶC.** Nền trong suốt thì
   không có gì để mà nhân, nguồn giữ nguyên. Nướng phép nhuốm màu vào tấm phủ vì thế biến tấm
   phủ thành một mảng tím phủ kín cảnh — và triệu chứng (chỉ còn lớp trời, mất sạch núi/cây/đất)
   trông **hệt như "art chưa tải"**. Nhân màu phải làm trên canvas ĐÃ CÓ CẢNH.
2. **Lớp trôi phải vẽ RỘNG HƠN khung đúng 2×biên độ.** Ba tầng mây đều phủ kín 1024 điểm ảnh
   ngang, nên đẩy ngang mà không nới bề rộng là hở một dải trời trần ở mép — lỗi chỉ lộ ra ở
   đúng hai đầu chu kì, tức rất dễ nghiệm thu nhầm.
3. **Đèn sân khấu phải là vầng NHỎ sau từng bóng hình, không phải một vầng lớn phủ cả khung.**
   `#cc-hero` chỉ chiếm nửa trái màn hình, nên vầng sáng rộng hơn khung bị mép canvas cắt ngang
   — thứ hiện ra là một HÌNH CHỮ NHẬT sáng hơn nền, thấy rõ mồn một.
4. **Các nấc của lớp phủ CSS phải chuyển dần.** `#sect-select::before` cũ có hai nấc sát nhau;
   trên nền núi mờ mịt thì không ai thấy, nhưng nền nay có chi tiết đều khắp khung nên chỗ nấc
   gấp hiện ra thành một **đường kẻ ngang chạy suốt bề rộng màn hình**.

### ⚠ `startGame()` PHẢI tắt cảnh màn chờ — đừng trông vào chỗ gọi

`titleAlive()` tắt vòng lặp khi **cả hai** màn (`#sect-select`, `#intro-story`) đã ẩn. Mà mọi
đường vào game chỉ ẩn đúng MỘT cái rồi gọi `startGame` — nên chỉ cần một đường quên ẩn cái kia
là cảnh Lunacia mười lớp chạy **song song với vòng game suốt phiên**. Nay `startGame()` gọi
`titleStop()` ngay dòng đầu: đó là cửa duy nhất vào thế giới, nên nó là chỗ đúng để tắt.

Lỗi này **không ném lỗi và không hiện ra** — nó chỉ ăn CPU. Chỗ nó lộ ra là `test_sandat`: bài
gọi thẳng `startGame` trong lúc trang dẫn truyện còn hiện, và 3600 khung mô phỏng phải chia CPU
với cảnh nền → trình duyệt **sập** (`Target page... has been closed`), không phải đỏ một khẳng
định nào. Nền cũ nhẹ nên chạy kèm vẫn lọt; nền mười lớp thì không.

### Giảm chuyển động KHÔNG có nghĩa là gỡ mất nền

Luật CSS cũ ẩn hẳn `#title-fx` ở `prefers-reduced-motion` — người bật tuỳ chọn đó nhận một trang
đen trơn. Nay `titleStart()` vẽ đúng một khung rồi dừng (`titleItDong()`), và `titleVeLai()` vẽ
lại một khung mỗi khi thứ cần vẽ đổi (chọn máy chủ xong, đổi ô nhân vật, art vừa tải xong qua
`ccChoAnh`). **Thiếu một trong ba chỗ gọi đó là người dùng reduced-motion thấy nền mà không thấy
nhân vật** — đã dẫm đúng thế: năm lớp hiện ra còn năm con Axie thì không.

### Đo trước khi tối ưu — chỗ tốn không nằm ở chỗ tưởng

Ở 1920×1080 chạy bằng CPU (headless, không GPU): cả cảnh + sân khấu tụt 60 → 28 fps.
- Phép **nhân màu phủ kín màn hình** chỉ tốn **1,6 ms** — bỏ nó đi chỉ được 2 fps. Không đáng
  đánh đổi lấy việc nướng tông màu chết vào tệp art.
- Chỗ tốn thật là **drawImage CÓ CO GIÃN**. Dựng sẵn mỗi lớp trôi vào một tấm đúng cỡ vẽ ra
  (mỗi khung chỉ dời chỗ) và dựng sẵn cả phần đứng yên của sân khấu (người + bóng + đèn): 28 → 32.

**Đã gỡ theo:** `assets/title/{nui,rung,san_da,anhhung}.webp` · `NUI_LOP`/`_nuiChop`/`_nuiCao`
(dãy núi dựng bằng đường — Quy tắc số 3) · vầng trăng và trường sao vẽ tay.

## ⏳ MÀN TẢI — thanh cân theo BYTE THẬT, không theo đồng hồ

Trước bản này **không có màn tải nào** (`grep` ra 0 chỗ trong `game.js`). Hậu quả nhìn thấy được:
cảnh Lunacia mười lớp lắp dần ngay trước mắt người chơi — trời trước, núi sau, nhân vật cuối.
Trên mạng chậm nó trông như trang hỏng.

| | |
|---|---|
| Khung | `#preload` trong `index.html` · khối cuối `style.css` |
| Máy | `taiTroChay()` · `taiTroAnh()` · `taiTroDong()` trong `game.js`, ngay trên `vaoManDau()` |
| Bản kê | `data/taitro.js` — **sinh bằng `tools/title/liet_ke_taitro.cjs`, đừng sửa tay** |
| Gác | `tests/test_taitro.js` (6 mục) |

Đo được: **21 tệp / 1,63 MB** — cảnh Lunacia 10 lớp + bệ đá (701 KB), 5 dải khung lớp (399 KB),
5 con Axie mặc định (533 KB). Nhạc và art trong màn **không** nằm trong đó: chặn người chơi sau
17 MB nhạc là đổi một lỗi lấy một lỗi tệ hơn.

**⚠ CÂN THEO BYTE, KHÔNG THEO SỐ TỆP.** Một lớp mây 12 KB và một dải khung 98 KB mà nhảy bằng
nhau thì thanh chạy vọt tới 80% rồi đứng im — nói dối theo đúng kiểu khó bắt nhất. Vì thế bản kê
mang kích thước THẬT của từng tệp.

**⚠ VÀ TUYỆT ĐỐI KHÔNG CHẠY THEO ĐỒNG HỒ.** Dự án này đã gỡ một thanh giả rồi — thanh
"Tiếp nhận 28%…82%" ở màn chọn máy chủ, lý do ghi ngay trên `SERVERS`. Một thanh tải chạy bằng
`setTimeout` là đúng con vật đó mọc lại ở màn khác. `test_taitro §3` ghìm art lại 700 ms rồi bắt
thanh phải đứng dưới 100%.

### Năm chỗ phải nhớ

1. **`window.__gameReady` NAY BẬT Ở CUỐI MÀN TẢI**, không ở cuối tệp (cuối tệp là `__manDaNap`).
   177 bài kiểm đều chờ cờ đó rồi mới bấm vào màn chờ — để nguyên chỗ cũ là chúng bấm vào một
   màn còn bị lớp phủ che, mà triệu chứng lại là *"không tìm thấy nút"*. Giá phải trả: mỗi bài
   chậm thêm **~300–480 ms** (đo được), đổi lấy việc không phải sửa 177 bài.
2. **Cờ đó PHẢI luôn bật, kể cả khi hỏng.** Ba lớp bảo hiểm, thiếu lớp nào cũng là 177 bài
   **treo chứ không đỏ**: `error` của ảnh tính là xong · trần cứng `TAI_TRAN` 9 giây ·
   `try/catch` quanh chính lời gọi. `test_taitro §4` chặn `mountain.webp` thành 404 để chứng minh.
3. **`taiTroAnh()` hỏi ĐÚNG cái hàm mà trong màn dùng** (`nenTai` · `ccLopAnh` · `chiImg`), nên
   tấm tải về nằm luôn trong bộ đệm của nó. Tải bằng một `Image()` riêng thì lần dùng sau tuy
   hứng được bộ đệm HTTP nhưng vẫn phải **GIẢI MÃ lại** — mà giải mã webp mới là phần tốn.
4. **Nhóm "Axie đại diện" đọc `AVA_MAC_DINH` từ `game.js`**, không chép tay. Công cụ đọc bằng
   regex và **dừng hẳn** nếu không khớp. `test_taitro §2` đối chiếu lại lúc chạy — đây là chỗ
   duy nhất bắt được chuyện regex trượt rồi im lặng sinh ra một danh sách khác.
5. **`taiTroDong()` phải HUỶ phần còn lại của màn tải, không chỉ giấu cái khung đi.** Có một
   đường vào game chạy **song song** với màn tải: `?sect=<lớp>` tự gọi `startGame` trong một
   `setTimeout` đăng ký sau `setTimeout` của màn tải, nên game khởi động trong lúc màn tải còn
   đang chờ ảnh. `hoanTat()` sau đó vẫn chạy tiếp thì nó gọi `vaoManDau()` và **bật trang dẫn
   truyện đè lên game đang chạy** — người chơi đang đứng trong bản đồ thì bị ném về màn ngoài
   sau chừng một giây, *không có lỗi nào ném ra*. Hai chốt: `_taiXong = true` trong
   `taiTroDong()`, và `if (player) return;` ở đầu `vaoManDau()`. Gỡ một chốt ra là
   `test_taitro §6` đỏ ngay — đã thử.

**Nướng lại art màn chờ thì chạy lại công cụ**, nếu không thanh về đích sớm hoặc muộn — mà lệch
kiểu đó không ai thấy bằng mắt. `test_taitro §1` đối chiếu từng byte của bản kê với đĩa.

Mẹo ở `TAI_MEO` là **mẹo THẬT**, rút từ cơ chế đang chạy. Một dòng mẹo bịa ở màn tải là thứ
người chơi thử ngay trong mười phút đầu rồi phát hiện ra là sai.

## 🐾 CHỌN AXIE — HAI CỬA, MỌI CON ĐỀU CẮM ĐƯỢC (chủ dự án chốt 2026-09-20)

> ⚠ Mục này **trước đây ghi "ĐÃ DỰNG XONG RỒI GIỮ LẠI — đừng tự dựng lại, hỏi chủ dự án chọn
> hàng nào trước"**. Đã hỏi, đã chốt, đã thi công. Giữ đúng cái tiêu đề cũ trong lịch sử git
> thôi — đừng đọc câu "đừng dựng lại" ấy như trạng thái hiện tại.
>
> ⚠ **Và mục cũ chỉ SAI COMMIT.** Nó bảo mã nằm ở `4568bb1`; commit đó là một bản sửa CLAUDE.md
> thuần tuý, không đụng một dòng mã nào. Hai commit thật trên nhánh `claude/focused-cannon-k4o6gk`
> là **`abdd62a`** (dựng lưới) và **`023ad84`** (gỡ lưới ra, kèm lý do). *Một số hiệu commit chép
> tay vào tài liệu là một con số không ai kiểm lại — và nó sai trong im lặng.*

**Chủ dự án chốt (2026-09-20):** cắm được **cả 16 con**, ở **cả hai** cửa — màn tạo nhân vật
*và* bảng Khế Ước. Rủi ro đã nêu trước khi hỏi (gacha không còn bán *hình dáng* nữa) và chủ dự
án vẫn chốt.

| cửa | ở đâu |
|---|---|
| màn tạo nhân vật | `#cc-avatar` · `ccAva` · `ccAvaDang()` · `ccAvaChon()` · `ccAvaRender()` · `ccAvaKeCo()` |
| bảng Khế Ước (cấp 6+) | `renderMount()` |
| **cửa DUY NHẤT** | **`avaCamDuoc(id)`** · danh sách chung **`avaDsThan()`** |

**Vì sao nó KHÔNG phát không sức mạnh, và đây là số đo chứ không phải lời trấn an:** bất biến ở
mục **▲▲ SÁU BỘ PHẬN** chứng minh ba hệ số phòng thủ nội suy về chính trung bình của chúng, nên
**kỳ vọng hệ số của cả 16 con bằng nhau CHÍNH XÁC** (lệch `2,2e-16`). Đổi thân đổi **hình dạng**
rủi ro, không đổi **tổng**. Thứ Khế Ước còn bán là số **sưu tầm** và **Nguyệt Trần**.

**⚠⚠ ĐỪNG "sửa gọn" bằng cách cắm sẵn cả 16 con vào `C.co` lúc tạo nhân vật.** Nghe thì gọn hơn
hẳn một hàm gác mới, và nó **giết một cơ chế trong im lặng**: `C.co` là sổ **SƯU TẦM**, và
`chiNhan()` đọc đúng nó để biết lượt quay này có phải con **MỚI** hay không. Cắm sẵn ⇒ nhánh
`moi:true` **không bao giờ chạy nữa**, mọi lượt quay đọc ra là trùng, và khoảnh khắc "ra con
mới" của chính hệ gacha biến mất mà không một lỗi nào báo. **Hai sổ, hai việc:** `C.co` = đã sưu
tầm · `avaCamDuoc()` = đeo được.

### ⚠ LỖI THẬT ĐÃ TÌM RA: CON KHỞI ĐẦU MẤT VĨNH VIỄN

Đây là lỗi **có sẵn từ trước**, không phải do đợt này, và nó im lặng tuyệt đối. Truy bằng cách
đọc chứ không đoán — `C.co` chỉ được ghi bởi `chiNhan()`, mà `chiNhan` chỉ được gọi từ gacha và
hai lệnh gỡ rối ⇒ **con mặc định của lớp không bao giờ nằm trong `C.co`**. Hệ quả:

- nhân vật mới: `dsCo = CHIMERA.filter(c => C.co[c.id])` ra **rỗng** ⇒ bảng Khế Ước không có con
  nào để chọn, dù người chơi đang nhìn thấy con mặc định chạy trên màn;
- quay ra một con rồi bấm "Đổi thân" ⇒ `player.avatar` rời khỏi `undefined`, mà
  `chiChon(con_mặc_định)` thì bị `if (!C.co[id]) return` chặn ⇒ **không lấy lại được nữa, vĩnh
  viễn**. `chiTatAvatar()` không cứu: nó đặt `null`, tức **tắt hẳn** avatar, khác hẳn.

`test_avachon §7` gác đúng đường đó, và nó đi **đường tự nhiên** (cắm con khác rồi mới đòi con
khởi đầu về), không nhảy cóc.

### ⚠ `renderMount` TỪNG ĐỌC THẲNG `player.avatar`, và mở danh sách ra mới lộ

CLAUDE.md đã ghi từ lâu: *"`avatarId(p)` là cửa DUY NHẤT — đừng đọc thẳng `p.avatar` ở chỗ
khác."* Bảng Khế Ước vi phạm ở **hai** chỗ (`dung = player.avatar === c.id` và nhãn nút tắt).
Vô hại suốt nhiều phiên **chỉ vì con mặc định chưa bao giờ có mặt trong danh sách**; mở danh
sách ra là con ĐANG ĐEO mang nút *"Đổi thân"* — bảng mời người chơi đổi sang chính thứ họ đang
mặc, và nút tắt thì ghi *"Đang dùng thân nhân vật"* trong lúc một con Axie đứng ngay trên màn.
*Một chỗ vi phạm luật "một cửa duy nhất" có thể nằm im rất lâu vì dữ liệu chưa chạm tới nhánh
sai — nó không hiền, nó chỉ chưa tới lượt.*

Gác: **`tests/test_avachon.js`** (8 mệnh đề, **cả tám đã thử ngược và đều đỏ, không cái nào im
lặng**). ⑥ **tự kiểm cảnh dựng trước khi chấm** — và chốt tự kiểm đầu của tôi **sai**: nó dò câu
"mở khóa ở cấp 6" trên một chuỗi RỖNG (bảng chưa mở ⇒ `CE()` lui về một div rời ⇒ `renderMount`
vẽ vào hư không), nên nó đọc ra *"bảng bày 0 con"* — trông y hệt cơ chế hỏng. Nay hỏi thẳng
`#char-content` có tồn tại không, rồi mới chấm.

⚠ **VÀ MỘT PHÉP THỬ NGƯỢC IM LẶNG Ở ĐÂY HOÁ RA LÀ `rc=124`.** Lượt chạy đầu của ⑧ in ra `ĐỎ ✓`
mà **không kèm một dòng `FAIL` nào** — vì bài bị `timeout` giết lúc đang tranh CPU với một lượt
hồi quy, và `rc` khác 0 thì script đọc thành "đỏ". Chạy lại lúc máy rỗi thì cả hai phép thử đều
đỏ KÈM dòng `FAIL` thật. ⇒ **Một dòng "ĐỎ" không kèm thông báo của chính bài kiểm thì chưa phải
một phép thử ngược**, và script thử ngược phải tách `rc=124` ra khỏi `rc=1`.

## 🎪 BẢN CHƠI THỬ: NGƯỜI THẬT VÀO LÀ **MAX CẤP + FULL TÀI NGUYÊN**

Chủ dự án chốt: *"ở bản http://14.225.204.107/ — khi vào game, hãy cho người chơi max cấp đi, và
cho họ tài nguyên full để có thể cảm được game."*

Máy làm việc đó **vốn đã có** — `applyTestBoost()`: cấp `MAX_LV` · full Chí Tôn giai 10 +11 Hoàn
Hảo · Linh Dực bậc 3 · 16 thân Axie · 999 Shard · 999.999 Lumen/Bản Năng · 99 mỗi loại châu ·
70 Box Kundun · mọi chiêu Lv120 · `moHetCong()` mở mọi cổng tiến trình. Nó chỉ nấp sau `?max=1`,
tức sau một thứ không ai biết mà gõ. **Đừng dựng một đường boost thứ hai** — sửa cái CỬA, không
sửa cái máy.

| | |
|---|---|
| cửa | `_mayLai` + `_choiThuong` trong `startGame`, ngay trên khối `maxMode` |
| đường lui | **`?thuong=1`** — vẫn vào được đoạn mở đầu thật |
| gác | **`tests/test_choithu.js`** (3 mệnh đề, **hai phép thử ngược đều đỏ**) |

### ⚠⚠ CỬA PHÂN BIỆT LÀ `navigator.webdriver`, KHÔNG PHẢI `TEST_MODE` — hai lối hiển nhiên đều sai

Đây là chỗ phải **đo ba lần** mới ra, và cả hai lối đầu đều làm hỏng bộ kiểm **trong im lặng**:

| gác bằng | vì sao sai — đo được |
|---|---|
| `!window.TEST_MODE` | **38 bài** `goto('/index.html')` trơn rồi gọi thẳng `startGame` mà không đặt cờ nào (`test_points` · `test_walkrun` · `test_inv` · `test_lopdo` · `test_migration`…) sẽ đột nhiên đo một nhân vật **cấp 120 full BiS** |
| `TEST_URL` (cờ của phim mở đầu) | **14 bài** có `?test=1` trong URL cũng dính — trong đó `test_ruiro` đo phạt EXP khi chết và `test_tanthu` đo hướng dẫn tân thủ |
| **`navigator.webdriver`** | **true ở MỌI phiên Playwright/CDP, false ở trình duyệt người thật** — đo trên chính `/opt/pw-browsers/chromium`: `about:blank` ra `true`, kiểu `boolean`. Tách đúng *"một con người mở trang"* khỏi *"một bài kiểm đang lái"*, **không đụng một bài nào trong 254 bài** |

⚠ **`?thuong=1` là đường LUI, đừng gỡ.** Không có nó thì trên production không còn cách nào xem
lại đoạn mở đầu thật — phát bộ khởi đầu · hướng dẫn tân thủ · chuỗi nhiệm vụ từ ô số 1 — tức một
nhánh mã còn sống bị che khuất vĩnh viễn khỏi mắt người.

⚠ **Bài kiểm chạy DƯỚI Playwright nên `navigator.webdriver` vốn là true.** Dựng cảnh "người thật"
phải đè bằng `addInitScript` **trước khi trang nạp** (`Object.defineProperty(Navigator.prototype,
'webdriver', …)`). Và mục ② **tự kiểm** rằng ở trang KHÔNG đè thì nó thật sự là `true` — nếu
Playwright đời sau thôi đặt cờ ấy thì cả cửa này mất tác dụng, và ② phải đỏ ngay chứ không được
xanh vì một lý do chẳng liên quan.

⚠ **Chỉ áp cho NHÂN VẬT MỚI** (`startGame`), không đụng `loadGame`. Ai đã có save thì giữ nguyên
tiến trình của họ — boost một bản lưu đang chơi là xoá mất thứ người ta đã cày.

⚠ **Ba con số trên băng-rôn nay SUY TỪ DỮ LIỆU.** Bản cũ chép tay *"Cấp 100"* (`MAX_LV` là **120**)
và *"Linh Dực c2"* (`applyTestBoost` cho **bậc 3**) — hai lời nói dối nằm im rất lâu vì hồi đó chỉ
ai gõ `?max=1` mới đọc tới. Nay **mọi người vào đều đọc**, nên chúng phải đúng.

**Cái giá, nói thẳng:** production không còn là nơi cảm được **nhịp tiến trình** (3 giờ tới cấp 60,
cửa cơ chế mở dần theo chương). Đó là đánh đổi chủ dự án đã chốt — đổi chiều sâu lấy việc người lạ
chạm được vào mọi hệ thống trong ba mươi giây. Muốn xem nhịp thật thì `?thuong=1`.

## 🎬 PHIM MỞ ĐẦU KHẾ ƯỚC — nhịp 0, và **HAI ĐUÔI LÀ BẮT BUỘC**

Hoạt ảnh quay vốn có năm nhịp vẽ bằng canvas (`comet · no · hien · the · luoi`). Nay có thêm
**nhịp 0: `phim`** — một clip 10,7 giây dựng bằng Veo, đứng TRƯỚC sao băng, có tiếng.

| | |
|---|---|
| Tệp | `public/game/assets/video/summon_mo_dau.{webm,mp4}` |
| Bảng | `KU_PHIM` (bậc → tên tệp, không đuôi) · `KU_PHIM_DUOI` · `KU_PHIM_NEN` 0,22 · `KU_PHIM_TRAN` 16s |
| Máy | `kuPhimNap()` · `kuPhimChay()` · `kuPhimXong()` · nhánh `'phim'` ở đầu `kuVe` |
| Gác | `tests/test_kuphim.js` (6 mệnh đề, **bốn phép thử ngược đều đỏ**) |

**⚠⚠ `.gitignore` ĐÃ TỪNG NUỐT MẤT MỘT VIDEO, và lần đó không ai biết.** Dòng
`public/game/assets/video/` chặn cả cụm, mà production là `git reset --hard origin/main` trên
VPS — nên thứ không có trong kho **không bao giờ tới được máy người chơi**, và triệu chứng là
một thẻ `<video>` 404 trong im lặng. Chú thích `sect_intro.mp4` trong `game.js` chính là cái xác
của lần đó. Nay dòng ấy là `video/*` + hai dòng `!` cho đúng hai tệp này (git **không** mở lại
được một tệp nằm trong thư mục đã bị loại — phải loại theo `thư mục/*` thì phép phủ định mới ăn).
⚠ MP4/WebM **không nén delta được**: mỗi lần nướng lại là thêm một bản ĐẦY ĐỦ vào lịch sử, vĩnh
viễn — đúng cái giá 222 MB đã trả cho `qa_shots/`. Nướng thử thì nướng ở scratchpad.

**⚠ PHẢI CÓ CẢ WebM LẪN MP4, và đây là một phép ĐO chứ không phải phòng xa.** Chromium bản mã
nguồn mở — tức đúng cái trình duyệt mà **cả 177 bài kiểm** chạy trên đó — **không giải được
H.264**. Đo trên `/opt/pw-browsers/chromium`:

| hỏi | trả |
|---|---|
| `canPlayType('video/mp4; codecs="avc1.42E01E"')` | **`''`** — không chạy được |
| `canPlayType('video/mp4')` **trơn** | **`'maybe'`** |
| `canPlayType('video/webm; codecs="vp9,opus"')` | `'probably'` |

⇒ **ĐỪNG chốt bằng `canPlayType('video/mp4')` trơn**: nó trả `'maybe'` ở đúng cái trình duyệt
KHÔNG giải được, nên một cái chốt viết như thế **xanh ở chỗ nó cần đỏ**. Cửa đúng là để hai thẻ
`<source>` tự chọn (WebM đứng trước), rồi bắt ca hỏng bằng `v.error` **và** một trần cứng.
Tiện thể WebM VP9 còn nhẹ hơn một nửa: **1,39 MB** so với 2,78 MB.

**⚠ HAI CHỐT CANH, THIẾU MỘT LÀ TREO ĐEN CẢ CÚ QUAY.** `v.error` bắt 404/hỏng mã; `KU_PHIM_TRAN`
bắt ca **nghẽn mạng** — mạng chậm thì không ném lỗi nào, nó chỉ đứng im. Và nhịp `'phim'` hỏi
**TRẠNG THÁI** `v.ended` mỗi khung chứ không nghe sự kiện `'ended'`: nghe sự kiện thì phải gỡ
tay, mà một lần gắn sót là cú quay sau chạy hoạt ảnh hai lần.

**⚠ CỬA TẮT PHIM HỎI `TEST_MODE && !TEST_URL`, KHÔNG HỎI `TEST_MODE` TRƠN.** Bản đầu hỏi trơn, và
nó **giấu mất tính năng ở đúng chỗ chủ dự án hay xem**: `?test=1` là link chơi thử quen dùng, nên
vào đó là không bao giờ thấy phim — mà triệu chứng đọc ra y hệt *"phim chưa lên production"*.

⇒ `window.TEST_URL` là cờ RIÊNG suy thẳng từ URL (cùng lối `TEST_DO` đã có), nên phân biệt được
**"một con người mở link chơi thử"** với **"một bài kiểm tự đặt cờ"**. Đo trước khi đổi chứ không
đoán: cả ba bài chạm gacha (`test_kheuoc` · `test_kubanner` · `test_kuphim`) đều `goto('/index.html')`
**trơn** rồi mới `window.TEST_MODE = true` trong `page.evaluate`, còn 14 bài có `?test=1` trong URL
thì **không bài nào** quay Khế Ước ⇒ bộ kiểm không chậm thêm một giây nào.

⚠ **Đừng gộp vào `TEST_DO`** — cờ đó mang nghĩa *"phát sẵn bộ giai 1"*. Hai nghĩa trên một cờ là
chỗ sẽ lệch nhau ở đợt sửa kế tiếp.

⚠ **Và `test_kuphim ②` vẫn phải giữ nguyên**: nó đặt cờ bằng `page.evaluate` nên `TEST_URL` rỗng ⇒
phim vẫn phải tắt. Hai mệnh đề kẹp hai đầu — ② giữ tốc độ bộ kiểm, ⑦ giữ link chơi thử. Thử ngược
(trả cửa về `TEST_MODE` trơn) làm ⑦ đỏ và ② **vẫn xanh**, đúng như nó phải thế.

**⚠ BỎ QUA LÚC ĐANG CHIẾU thì CHỈ bỏ PHIM.** Nhịp báo phẩm và cái thẻ mới là thứ người chơi trả
vé để xem; nuốt luôn cả hai vì một cú bấm sốt ruột ở giây đầu là lấy mất đúng thứ họ mua. Bấm
tiếp lần nữa mới bỏ nốt.

**⚠ HẠ NHẠC NỀN THÌ PHẢI TRẢ LẠI.** `kuPhimXong()` gọi `refreshBgmVol()`; quên vế đó là nhạc nền
câm hẳn từ cú quay đầu tiên tới hết phiên, và không lỗi nào báo.

### ⚠⚠ XEM HẾT CLIP RỒI THÌ ĐỪNG KỂ LẠI — clip ĐÃ CHỨA nhịp `comet` + `no`

Chủ dự án bấm quay rồi nói đúng một câu: *"nó đã bị trùng với animation / hiệu ứng trước đó rồi"*.
Đúng, và đo được. Quét clip 0,2 giây một mẫu (độ sáng trung bình + tỉ lệ điểm ảnh vàng-cam):

| giây | nội dung | sáng | %vàng |
|---|---|--:|--:|
| 0,2 – 6,2 | đảo đá · lò rèn · bóng Axie | 57 | 5 |
| **6,4 – 7,0** | **cắt sang đen** | 42→0 | 0 |
| **7,1 – 9,6** | **tia vàng hội tụ rồi nổ** | | 10→**22** |
| **9,8 – 10,24** | **CHỚP TRẮNG kín màn** | 137→226→**247** | 0 |
| 10,45 – 10,72 | đen sạch | 0 | 0 |

Ba giây rưỡi cuối **chính là** thứ `comet` (tia bay vào) + `no` (nổ + `fillRect('#fff')` kín màn)
vẽ ra. Nên bản cũ cho người chơi xem:

> nổ → **chớp trắng** → đen → trời sao → sao băng bay vào → nổ → **chớp trắng** → mới hiện hình

tức lặp **1,57 giây** (`comet` 1,15 + `no` 0,42) và chớp trắng **hai lần**.

⇒ **`kuPhimXong(tron)`**: xem TRỌN thì nhảy thẳng `'hien'`; bỏ qua / hỏng / nghẽn quá trần thì
vẫn `'comet'`.

**⚠ HAI ĐẦU, THIẾU ĐẦU NÀO CŨNG LỌT MỘT CÁCH SỬA SAI.** Lúc nào cũng `'hien'` thì người bấm bỏ
qua ở giây đầu **mất sạch** nhịp nổ — họ chưa xem clip thì phải vẽ lại cho họ. `test_kuphim ④`
gác nửa đó, `⑤` gác nửa kia; thử ngược từng nửa đều đỏ ĐÚNG mục của nó.

**⚠ ĐỪNG CẮT ĐUÔI CLIP ĐỂ CHỮA.** Nhịp nổ của clip là thứ trả vé — cái vẽ tay mới là bản sao. Mà
nướng lại là thêm một bản **ĐẦY ĐỦ** vào lịch sử git vĩnh viễn (webm/mp4 không nén delta được,
xem `.gitignore`), tức trả một cái giá thật cho một việc sửa được bằng một dòng mã.

**⚠ TIẾNG ĐẬP PHẢI GIỮ LẠI.** `AudioSys.sfx('levelup'/'ui')` vốn nổ ở cuối `comet` và là **tín
hiệu PHẨM duy nhất** của cả hai nhịp vừa bỏ — clip dùng chung một tệp cho mọi bậc nên tự nó
không nói được bậc nào. Nay nó nổ ở `kuPhimXong(true)`.

**⚠ `_kuPhimTron` CÒN SỬA MỘT CHỖ NỮA: hào quang 5★.** `hien` truyền `e + _KU_NHIP.no` cho
`power_awaken` để *chạy tiếp* từ nhịp nổ. Không có nhịp nổ mà vẫn bù 0,42 giây là hiệu ứng hiện
ra ở giữa chừng. ⇒ `e + (_kuPhimTron ? 0 : _KU_NHIP.no)`.

**⚠⚠ VÀ CỬA ĐỌC CHO BÀI KIỂM PHẢI LÀ MỘT HÀM.** `_kuPha` khai bằng `let` ở tầng cao nhất nên
**không gắn vào `window`** — cùng bẫy đã ghi cho `player`/`curMap`. `test_kuphim ⑦` đã in
`"pha":null` suốt nhiều phiên mà không ai thấy, vì nó không CHẤM trường đó. Nay là
**`window.__kuTrangThai()`**, một hàm đóng trên chính hai biến sống: không có bản sao nào để
lệch, và thêm trạng thái mới là sửa đúng một chỗ. *Một trường đo rồi không chấm thì nó không
phải một khẳng định, nó là một dòng log* — cùng vết sẹo `questPanel` của `test_story`.

⚠ `⑤` gom **MỌI nhịp đi qua** (lấy mẫu 60ms) chứ không chỉ hỏi nhịp lúc thoát vòng: `no` chỉ dài
0,42 giây, hỏi một lần là có ngày bỏ lọt. Số đo sau khi sửa: `phim → hien → the`.

**⚠ BA BẬC TRONG `KU_PHIM` HIỆN CÙNG TRỎ MỘT TỆP** — đó là sự thật (mới nướng được bản CẤP CAO),
không phải sơ suất. **Đừng "dọn" thành một hằng số**: bảng này là chỗ clip Thường/Hiếm sẽ cắm
vào, gộp lại là lần sau phải dựng lại chính nó.

**Hai bẫy của chính BÀI KIỂM, cả hai cho ra một kết quả sai mà trông rất thuyết phục:**
1. **`currentTime = …` BỊ BỎ QUA TRONG IM LẶNG** trên máy chủ tĩnh của bộ kiểm —
   `python3 -m http.server` không trả HTTP Range, nên phép tua không ăn và clip cứ chạy tiếp từ
   đầu. Mục ⑤ báo *"phim không tự tắt"* trong khi cái chốt `v.ended` hoàn toàn đúng. Tua bằng
   **`playbackRate`**, thứ không cần Range.
2. **Một mẫu ở một mốc cố định thì đỏ theo xúc xắc.** Chốt *"sau 1,8 giây phải chạy được 0,3
   giây"* đã đỏ thật ở một bản mã **không hề đụng tới đường chạy phim** — khung đầu mất tới
   ~1,6 giây mới giải xong ở máy bận. Thứ cần chứng minh là clip có NHÍCH hay không, nên **chờ
   tới khi nó nhích**, có hạn.
3. **⚠ VÀ BẢN VÁ CHO (2) CŨNG SAI — cùng một bệnh, đội lốt khác, mất một lượt hồi quy mới lộ.**
   Bản ấy chờ tới khi `currentTime > 0.25` với hạn 8 giây, nhưng `0.25` vừa là cửa **THOÁT vòng**
   vừa là **NGƯỠNG CHẤM** ⇒ nó lặng lẽ biến thành một đòi hỏi về **TỐC ĐỘ GIẢI MÃ**. Máy này
   không có GPU, nên trong một lượt hồi quy đầy đủ, VP9 1120×630 giải chậm tới mức 8 giây thật
   không đủ cho 0,25 giây phim. Đo được: chạy riêng ra `0,27 · 0,36 · 0,40` (xanh 3/3), trong
   hồi quy ra **đúng 0,25** ⇒ đỏ. Cơ chế hoàn hảo, ngưỡng nằm trong dải nhiễu — đúng hình dạng
   của `test_canbanglop`.
   ⇒ Nay đếm **số lần `currentTime` TĂNG** giữa hai mẫu liên tiếp (đòi ≥2). Đứng im thật thì con
   số ấy là 0 dù chờ bao lâu; chạy chậm thì vẫn tăng. **Không còn ngưỡng tốc độ nào để mà trượt.**
   Thử ngược (bỏ `v.play()`) ra `tang: 0` và đỏ.
   *Luật chung: một ngưỡng đo trên MỘT ĐẠI LƯỢNG TÍCH LUỸ trong một khoảng thời gian có hạn là
   một ngưỡng về TỐC ĐỘ, dù nó không trông giống thế. Đo HƯỚNG (có tăng không) thì miễn nhiễm
   với tải; đo ĐỘ LỚN thì không.*

**Nướng clip** (giữ nguyên hai lệnh này, tiếng đã cân khớp hai nguồn — đỉnh −5,0 dB):
`ffmpeg` ghép intro + mở đầu bằng `concat` có cả `v` lẫn `a`, cắt watermark Gemini bằng
`crop=1120:630:0:0` **neo ở y=0** (đường vàng Nhát Gọi nằm ở MÉP TRÊN, cắt lệch là mất nó), rồi
`libvpx-vp9 -crf 32 -row-mt 1 -cpu-used 2` + `libopus -b:a 96k` ra bản WebM.


## 🖼 BANNER NHÂN VẬT (Khế Ước) — key art kiểu Genshin/Honkai

Bảng Khế Ước trước bản này là một khối CHỮ: tên con 5★, một dòng mô tả, danh sách 4★, bộ đếm bảo
đảm. Đúng thông tin, nhưng nó không trả lời được câu mà một banner sinh ra để trả lời — *"thứ
đang bày bán trông NHƯ THẾ NÀO"*.

| | |
|---|---|
| Bảng | **`KU_BANNER`** — chỉ khai `{ lop, giai, ren }`, mỗi banner một mục |
| Máy | `kbTin()` · `kbThan()` · `kbVe()` / `kbVeMot()` · `kbHtml()` · `kbXoaNho()` |
| Khung | `.ku-key` + `canvas.ku-art` trong `style.css` |
| Gác | **`tests/test_kubanner.js`** (6 mệnh đề, **bốn phép thử ngược đều đỏ**) |

**⚠ MỌI THỨ SUY TỪ DỮ LIỆU.** Bảng chỉ khai *ai* được bày; tên bộ giáp ← `heroSet()`, tên Trấn
Phái ← `SECTS[].tp`, màu ← `ELEM[]`, tranh chiêu ← `CHIEU_TRANH['sx_<lop>_c']`. Chép tên bộ vào
bảng banner là nó nói dối ngay lần đầu ai đó đổi `HERO_SETS` — cùng lý do `mapBanSac()` suy từ
`packs`.

**⚠⚠ TUYỆT ĐỐI KHÔNG ĐỤNG VÀO `player` ĐỂ DỰNG THÂN MẪU.** Cách "dễ" là tráo `player.equip` /
`player.sect` rồi trả lại; một lần ném lỗi giữa chừng là người chơi **mất sạch đồ**, và kiểu hỏng
đó không có đường nào lần ra. `kbThan()` dựng một đối tượng RIÊNG qua **`netApTrangBi()`** — đúng
cái cửa mà thân người từ xa đi qua, tức một đường đã có người gác sẵn.

**⚠ `ccArtSan()` LÀ CÁI VAN, ĐỪNG GỠ.** `heroSprite()` **luôn** trả về một canvas: chưa có art
thì nó dựng hình bằng ĐƯỜNG — hiệp sĩ xám, mũ sừng, áo choàng đỏ. Ở màn chờ đó đã là lỗi; ở
banner còn nặng hơn, vì **banner là chỗ HỨA HẸN** — hứa bằng một hình không phải thứ người chơi
sẽ nhận. Chưa tải xong thì để trống một nhịp, và `openKheUoc()` xin art từ lúc MỞ MÀN.

**⚠ MỎ NEO CỦA ATLAS LÀ MỎ NEO *CHIẾN ĐẤU*, KHÔNG DÙNG ĐƯỢC Ở BANNER.** `anchorX/anchorY` tồn
tại để hiệu ứng khớp với chỗ người niệm đứng trong màn; banner **không có người niệm**. Đo được:
`death_stab` neo ở `anchorX 46/384` — sát mép trái — nên gọi `veVfxAtlas()` là toàn bộ thân hiệu
ứng đổ sang phải và chạy ra khỏi khung. Ở đây phải **căn GIỮA khung atlas** và tự vẽ.
Gói khai `xoay:true` (*tranh có hướng*) thì nghiêng chéo — để ngang nó đọc ra một cái ống; gói
không có hướng (mưa thiên thạch) phải để nguyên, xoay một cái hố rơi xuống đất là nghiêng cả
vạch nền.

**⚠ VÒNG rAF PHẢI TỰ TẮT KHI BẢNG ĐÓNG.** `kbVe()` lọc canvas theo `offsetParent` và `return`
khi rỗng. Thiếu vế đó là mở Khế Ước một lần rồi vòng vẽ quay tới hết phiên — không lỗi nào báo,
chỉ ăn CPU. Cùng bẫy đã ghi cho `titleAlive()`. Và `kbChay()` phải gọi **SAU** `remove('hidden')`:
phần tử trong bảng còn `display:none` có `offsetParent` là `null` ⇒ vòng tự tắt ngay khung đầu.

**Chọn lớp bày ra bằng ẢNH CHỤP, không bằng cảm tính** — dựng đủ cả năm rồi nhìn:
`toanchan` Ngũ Tiễn (quạt tên vàng) và `baidasan` Meteorite (vầng tím) đọc ra ngay ở cỡ 150px;
`thieulam` Death Stab là **một mũi thương XÁM nằm ngang** — nghiêng chéo rồi vẫn ra một cái ống,
đây là **giới hạn của ART, không sửa được bằng mã**; `minhgiao` Flame Strike **chưa có tranh Trấn
Phái nào**.

**⚠ ẢNH THU NHỎ KHÔNG PHẢI MỘT PHÉP ĐO.** Năm thân nhìn thoáng qua thì hao hao nhau vì cùng nướng
từ một bản mẫu bốn-đầu-thân. Tôi đã đọc nhầm một tấm sheet và tưởng **bốn banner dùng chung một
bộ giáp**; đo pixel thì cả **mười cặp lệch 33-55%**. Cơ chế vẫn đúng từ đầu.

### ⚠ BỐN LỖI CỦA CHÍNH BÀI KIỂM — cả bốn cho một bài XANH VÌ LÝ DO SAI

Phép thử ngược lôi ra cả bốn. Ghi lại vì mỗi cái là một họ riêng:

1. **Que dò đếm SAI THỨ.** Bộ đếm đặt trong `kbVeMot` (số lượt VẼ) thì sau khi đóng bảng danh
   sách canvas rỗng ⇒ thân vòng không chạy ⇒ bộ đếm **đứng im y hệt lúc vòng đã tắt**. Nó mù với
   đúng cái rò nó sinh ra để bắt. Phải đếm **nhịp rAF** (`window.__kbVong`), đặt trong `kbVe`.
2. **Chụp ảnh SAU khi ô nhiễm đã xảy ra.** Mục "không đụng `player`" chụp `player` sau khi bước
   dựng cảnh đã gọi `kbThan` một lượt — nên nếu hàm ấy làm bẩn `player` thì nó **bẩn sẵn từ lúc
   chụp**, hai ảnh trùng nhau, bài xanh. Phải `startGame` lại rồi mới chụp.
3. **Mỏ neo của phép thử ngược là VĂN XUÔI, không phải MÃ.** Mục gác cái van `ccArtSan` `grep`
   chữ `ccArtSan(` trong thân `kbVeMot` — và nó xanh cả khi đã gỡ hẳn cái van, vì chuỗi ấy còn
   nằm trong một dòng **chú thích** ngay trên. Nay đo HÀNH VI: chặn `**/assets/nv/**` ở tầng
   mạng rồi đòi chỗ nhân vật phải TRỐNG.
4. **Đo được một thứ ĐỔI, nhưng đổi vì lý do khác.** Mục "đổi lớp thì key art đổi" đo cả khung —
   mà nền và tranh Trấn Phái cũng đổi theo lớp, nên một mình chúng đã vượt ngưỡng. Thu về vùng
   THÂN thì lại vướng **nhịp thở**: hai lần đo rơi vào hai khung khác nhau. ⇒ Seam `__kbChiThan`
   (chỉ `TEST_MODE`) tắt nền + tranh chiêu **và ghim khung thở về 0**.

⚠ **Và hai phép thử ngược ĐẦU của tôi cũng sai**, ghi lại vì chúng tốn hai vòng: ghim
`heroSprite('thieulam', …)` **không đổi được thân** — bộ giáp lớp-rời vẽ theo `gv.oLop`, không
theo tham số lớp; còn `kbThan('cx')` dựng một trạng thái **không có thật** (lớp A đeo trang bị
lớp B). Phép thử ngược ĐÚNG là kiểu hỏng thật sẽ xảy ra: **nhớ lại ảnh đã vẽ** (một "tối ưu" rất
dễ ai đó thêm vào) ⇒ `lechMau` về **0** và mục ③ đỏ.

## Hai lối vẽ nhân vật — ĐỪNG TRỘN VÀO NHAU

Game có **ba** bộ dựng nhân vật, mỗi bộ một việc. Nhầm chỗ là ra hình lạc quẻ.

| Bộ | Hàm | Cỡ | Dùng ở đâu |
|---|---|---|---|
| Trong màn | `drawPlayer()` | ~40–56px | nhân vật đang chạy, vẽ mỗi khung hình |
| Thẻ nhân vật | `heroCardUrl()` | 160×220 | bảng Nhân Vật, bảng Trang Bị — có thể hiện đồ đang mặc |
| **Chibi** | `chibiUrl()` | 420×420 | **thẻ chọn lớp** và ảnh phóng to bên cạnh |
| **Tranh minh hoạ** | `splashUrl()` | 620×860 | **chỉ mở bằng lệnh `/art`** |

**Chibi khác thẻ nhân vật ở LUẬT, không phải ở cỡ.** Đầu chiếm gần nửa chiều cao,
mắt to có tròng và đốm sáng, tay chân mập ngắn, nét viền dày bao ngoài. Viền dựng
bằng khuôn: in bóng đơn sắc ở 20 hướng quanh tâm rồi đặt hình gốc lên. Hai lớp —
**trắng dày ngoài, đen mỏng trong**; chỉ đen thì viền tàng hình trên nền tối. Phải
ép mép khuôn thành đặc (`drawImage` bóng lên chính nó vài lần) trước khi in vòng,
không thì 20 bản mờ chồng nhau ra viền nhoè.

**Mỗi lớp một BÓNG DÁNG riêng — đây là điều dễ làm sai nhất.** Bản đầu năm lớp
chung một khuôn, chỉ đổi màu; che màu đi thì không ai phân biệt được. MU phân biệt
lớp bằng đường viền ngoài. `CHIBI_CFG` giữ ba trục: `head` / `sh` (vai) / `body`.

    Dark Knight   helm  · spike · plate     mũ trụ kín + hai sừng cong
    Sylvan Ranger hair  · small · leather   đuôi tóc sau gáy + tai nhọn
    Dark Wizard   hood  · none  · robe      mũ chóp cao, KHÔNG giáp vai, áo loe che chân
    Spellblade    mane  · one   · half      bờm đổ một bên, CHỈ MỘT bên vai
    Dark Lord     crown · wide  · cape      vương miện năm chấu + áo choàng

**Cách kiểm:** tô đặc một màu rồi nhìn. Năm cái bóng phải khác hẳn nhau. Nếu phải
đọc màu mới biết lớp nào thì chưa đạt.

**Tranh minh hoạ KHÔNG đặt vào luồng chơi.** Đã thử làm ảnh lớn ở màn chọn lớp và
bị gỡ ra: tỉ lệ 8 đầu đứng cạnh chibi là lệch hẳn. Nó chỉ để xem, mở bằng
`/art <lớp> [mavuong]`.

## ⚔ VŨ KHÍ CẦM TAY TREO TRÊN **RÀNG BUỘC BIẾN HÌNH**, KHÔNG TREO TRÊN XƯƠNG BÀN TAY

Đây là lỗi nặng nhất của đợt nhập năm bộ giáp, và nó **đã ship**: chủ dự án gõ đúng một câu —
*"Tư thế cầm cung sai… tương tự hãy check lại với kiếm của dk và spellblade"*.

Trong bản mẫu bốn-đầu-thân, cây vũ khí **không** treo trên xương bàn tay. Nó treo trên xương
`武器` mà **cha là `root`** — đứng yên tuyệt đối — và thứ đưa nó vào tay là hai **ràng buộc
biến hình** (`左手持剑` order 5 → `左手持剑点` · `右手持剑` order 6 → `右手持剑点`). Bộ nướng
chưa cài loại ràng buộc đó (nó đã có IK và physics), nên cây vũ khí nằm y nguyên ở **tư thế
gốc** trong khi cánh tay vung.

**Số đo, trước khi sửa** (hộp bao lớp `vk` trên chính bảng khung game nạp):

| bộ | đứng | đi | chạy | ĐÁNH | niệm |
|---|---|---|---|---|---|
| `dkph1` · `sbsm1` | 1/16 | 1/32 | **0/32** | **1/16** | 1/16 |
| `elnb1` | 1/16 | 1/32 | **0/32** | 3/16 | 1/16 |
| lớp tay `t2` (đối chứng) | 14/16 | 32/32 | 32/32 | 16/16 | 16/16 |

**1 vị trí trên 16 khung của khối ĐÁNH** = một thanh kiếm dán cứng cạnh người trong lúc chủ
nó vung tay. Sau khi cài `ap_bien_hinh()`: 14-16/16 · 32/32 · 32/32 · 15-16/16 · 16/16.

**⚠ KHOÁ RỖNG `{}` NGHĨA LÀ MIX = 1, KHÔNG PHẢI 0.** Gói ghi `mixRotate: 0 … mixShearY: 0` ở
**setup** (tắt) rồi mỗi hoạt cảnh đặt một khoá RỖNG — mà trong JSON của Spine, khoá thiếu
trường thì mặc định **1**. Đọc nhầm chiều này thì ràng buộc không bao giờ bật và triệu chứng
giống hệt như chưa cài gì. (`mixY` mặc định theo `mixX`, `mixScaleY` theo `mixScaleX`.)

**⚠ RÀNG BUỘC GHI THẲNG MA TRẬN THẾ GIỚI** ⇒ sau nó **tuyệt đối không gọi `tt.tinh()`**, vì
hàm ấy dựng lại từ xương CỤC BỘ và xoá sạch việc vừa làm. Chỉ `tt.tinh_cay(i)` cho nhánh con.
Cùng cái bẫy của physics.

**⚠ RIG CẤT VŨ KHÍ TRONG `00_Run`** — hai hàng cuối bảng (32 ô) rỗng trắng. Bản mẫu vẽ cho một
game đánh bài, nơi nhân vật chỉ chạy một nhịp vào trận; ở đây lớp nhân vật chạy gần như liên
tục, nên cây kiếm biến mất rồi hiện lại mỗi lần dừng chân. `VK_HIEN` trong `nuong_nv.py` ép
mảnh hiện lại — ràng buộc `右手持剑` VẪN bật trong `00_Run` nên nó tự nằm đúng tay. **Chỉ ép khe
chính**: `2b`/`2c` là dây cung và mũi tên, chúng chỉ thuộc về động tác giương cung.

**⚠ GÓI `Dark_Knight.zip` KHÔNG CÓ ART VŨ KHÍ** (cả bốn vùng atlas đặc 0%); `Dark_Knight_1.zip`
mới có. Thân người hai gói **trùng khít từng điểm ảnh** (đã đo), nên `dkph1` nay nướng trọn từ
`Dark_Knight_1`. Ba gói kia tự có vũ khí.

**Cung Thiên Mệnh lúc GIƯƠNG là một cung TRẮNG trơn — đó là ART CỦA GÓI, không phải lỗi.**
`10_ArcheryAttack` đổi mảnh sang `左手武器2a`, một vòng cung trắng chưa vẽ theo bộ (kèm dây
`2b` và mũi tên `2c`). Đã thử giữ cung Ngọc Bích ngọc-vàng cho khối đó và **nó tệ hơn hẳn**:
cung không uốn theo dây nên chĩa ngang như một khẩu súng. Muốn đẹp thì phải đặt hoạ sĩ vẽ
`左手武器2a` theo bộ, không sửa được bằng mã.

**Giá phải trả, ghi ra chứ không giấu:** hộp cắt lớp `vk` nay là hợp của cả một cú vung nên
phình gần bằng cả ô — `dkph1` 240×279, `sbsm1` 240×300. Tệp tăng ~400 KB cho cả ba bộ; bộ nhớ
sau giải nén của lớp vũ khí tăng chừng 20 MB **cho đúng bộ đang mặc** (nạp theo nhu cầu). Muốn
gọn lại thì phải cắt hộp THEO TỪNG KHỐI, không phải một hộp chung — chưa làm.

### 🏹 ~~cung phải VẶN LẠI~~ → **TƯ THẾ MANG TRONG THÀNH** (`VK_XOAY` · `VK_MANG`)

> ⚠ Mọi số đo nhắc `sbsm1` trong khối này là **LỊCH SỬ**: bộ ấy đã gỡ cùng đợt Spellblade sang gói
> `magic-runtime` (2026-09-23). Hai bộ còn lại (`dkph1` · `elnb1`) vẫn chạy nguyên, nên luật thì
> còn hiệu lực — chỉ mấy con số của cột Spellblade là không đối chiếu lại được nữa.

> ⚠ Giữ tiêu đề gạch ngang để cảnh báo: `VK_XOAY` **đã đổi hẳn ngữ nghĩa lẫn giá trị**. Bản cũ
> là cặp `(số độ, những hoạt cảnh BỎ QUA)` và chỉ khai `elnb1: −40` cho riêng cây cung. Đọc
> lịch sử git rồi tưởng luật cũ còn là sai cả hai nửa.

Bản mẫu bốn-đầu-thân chỉ có **MỘT tư thế mang**: chuôi ở bàn tay, thân chĩa chéo xuống trước.
Đo lại trên khung ĐỨNG bằng cách **đếm điểm ảnh của riêng lớp `vk`** — lưới mesh của bản mẫu
**giống hệt nhau ở cả bốn gói**, chỉ ART bên trong khác, nên đo lưới thì bốn gói ra cùng một
con số và không phát hiện được gì:

| gói | trục lệch DỌC | dài | mũi cây rơi ở đâu |
|---|---|---|---|
| Dark Knight | 52,0° | 971 | **dưới mặt đất** |
| Fairy Elf | 44,8° | 898 | **dưới mặt đất** |
| Magic Gladiator | 52,1° | 1100 | **dưới mặt đất** |
| Dark Lord | 58,7° | 1018 | **dưới mặt đất** |

Chủ dự án chốt: *"trong thành cho vũ khí khoác lên vai (kiểu khu an toàn)"*. Và từ đợt **nhập
vào Axie**, khối đi-đứng của lớp nhân vật **chỉ còn hiện trong thành** — nên tư thế mang là thứ
duy nhất người chơi nhìn thấy lâu, mà nó đang là một cây kiếm cắm xuống đất.

**⚠ KHÔNG KHOÁC CHÉO SAU LƯNG ĐƯỢC, và đó là một phép ĐO chứ không phải một ý thích.** Cây dài
898–1100 trên một thân cao 1166, tức **77–94% chiều cao người**. Đã dựng ảnh cho cả hai họ tư
thế: chéo 25° ⇒ mũi ở y=27 trong khi gót ở y=−44 (cắm đất) *và* cán đè lên **MẶT**; chỉ tư thế
**gần DỌC** là sạch cả hai đầu. Nên thứ chốt được là "dựng cây bên vai", không phải "đeo sau
lưng" — và cũng vì thế **không phải đổi thứ tự lớp** (`vk` vẫn nằm giữa `a` và `t2`).

⚠ **Xương `武器` nằm ở ĐẦU cây (chỗ nắm)**, nên vặn quanh nó ≈ vặn quanh bàn tay: cây vẫn dính
tay. Thêm phép DỜI thì cây rời khỏi tay — đã dựng ảnh, nhìn ra đồ bay chứ không ra đồ đeo.

| bộ | vặn | đo được sau khi vặn (đáy cây trong ô 240×300, **gót ở 252**) |
|---|--:|--:|
| `dkph1` | **+147°** | 197 |
| `sbsm1` | **+147°** | 197 |
| `elnb1` | **+139°** | 200 |

⚠ **Chốt bằng ảnh A/B (0 · ±15° quanh giá trị tính ra), không bằng một con số đẹp.**

⚠ **`VK_MANG` là danh sách "ÁP VÀO", KHÔNG phải "bỏ qua".** Bản cũ khai những hoạt cảnh bỏ qua,
nghĩa là mọi khối MỚI thêm vào `KHUNG`/`KHUNG2` đều **tự động bị vặn** — kể cả một khối ra đòn,
và nó hỏng trong im lặng. Đảo lại thì quên một dòng chỉ làm khối đó giữ tư thế cũ, chứ không phá
một khối đang đúng. Mọi khối ra đòn vắng mặt là CỐ Ý: ở đó rig đã dựng đúng tư thế đánh.

⚠ **`03_Hurt` · `02_Death` · `04_Jump*` cũng vắng mặt, và đó là phép ĐO.** Từ lúc nhập vào Axie,
ba khối đó không còn cửa nào hiện ra (trong thành không ai đánh được ai; bay thì đọc khối ĐI —
`BAY_KHUNG` ghim vào một khung trong đó — chứ không đọc `04_Jumpping`). Thử đưa chúng vào thì
hộp cắt bảng hai của `dkph1` phình **55,2% → 86,6%** một tấm thân liền.

⚠ **Chỉ vặn khi đang nướng CHÍNH lớp `vk`.** Các lớp thân không có xương `武器` trong bộ khe của
chúng nên vặn ở đấy không đổi gì, chỉ tốn một lượt dựng lại nhánh con mỗi khung.

#### ⚠ VÀ RIG CẤT VŨ KHÍ Ở **BỐN** KHỐI, `VK_HIEN` chỉ vá một

Đã biết `00_Run` đặt một khoá attachment RỖNG lên khe `左手武器`. Đo lại cả 20 hoạt cảnh: ba khối
nữa làm y hệt — **`09_Interactive`** (bắt chuyện NPC / mở rương) · `07_StatusEffect` · `01_Dance`.
Cả ba là dáng **đứng trong thành**, tức đúng chỗ duy nhất lớp nhân vật còn hiện ra.

Và `VK_HIEN` chỉ được tra ở **bảng MỘT**, còn ba khối kia nằm ở bảng hai — nơi cột `doi` đang
dùng để đổi KHUÔN MẶT. Hai việc khác nhau trên cùng một tham số, nên chúng phải **gộp**
(`{...VK_HIEN, ...doi}`, cột `doi` thắng khi trùng khoá). Đo được trước khi vá: lớp `vk` của
`n`/`t`/`e` **không có một điểm ảnh nào** — nói chuyện với một NPC là cây kiếm biến mất khỏi tay.

⚠ **Và `test_vklop` KHÔNG hề đo bốn khối mang ở bảng hai** (`q` Ngồi · `n` Bắt chuyện ·
`t` Dính buff · `e` Nhảy múa) — mệnh đề ① *"không khối nào có khung TRỐNG"* nghe như phủ hết,
nhưng danh sách khối của nó chỉ có tám cái. *Một mệnh đề phủ "mọi khối" mà danh sách khối do
chính bài kiểm chép tay thì nó chỉ phủ đúng cái danh sách ấy.*

Máy: `xoay_xuong()` trong `hoatcanh.py` (ghi thẳng ma trận thế giới rồi `tinh_cay`, cùng cấm kỵ
với `ap_bien_hinh`: sau nó đừng gọi `tt.tinh()`) · `VK_XOAY` + `VK_MANG` + `VK_HIEN` trong
`nuong_nv.py` · cờ **`--chilop <tên,tên>`** nướng lại đúng mấy lớp được gọi tên (hộp cắt của một
lớp không phụ thuộc lớp nào khác, nên nướng lẻ ra đúng bằng nướng cả bộ — 3 giây thay vì cả bộ).
Gác: `tests/test_vklop.js` ① (bốn khối mới) và ④ (đáy cây phải trên gót); cả hai đã thử ngược.

### ⚠ LỚP NÀO ĐÃ CÓ CÂY CẦM TAY THÌ CẦM CHO **MỌI** MÓN — `NV_VK_LOP_LOP`

Chủ dự án nhìn ảnh chụp và hỏi thẳng: *"DK có đại long đao theo sau mà?"*. Đúng. `NV_VK_LOP`
khai theo `dòng|giai`, nên đeo **bất cứ cây nào khác** — cây rìu, cây chuỳ, hay chính cây kiếm
ở giai 1-6 — là `nvVkLop` trả `null`, `_tkHien` bật **thần khí**, và một thanh đại kiếm cao gần
bằng người **trôi lơ lửng** cạnh nhân vật. Đo được: **60/63** món của ba lớp rơi vào đường đó.

⇒ `NV_VK_LOP_LOP = { thieulam:'dkph1', toanchan:'elnb1' }` là nấc lùi cuối,
⚠ **`minhgiao` ĐÃ RỜI khỏi bảng này** (2026-09-23): gói `magic-runtime` cầm vũ khí bằng tệp RỜI
đặt theo socket hai tay của từng khung, nên nó không cần — và không có — một bảng khung nướng
sẵn cho mỗi cặp dòng×giai. Đó chính là thứ cho phép 7 giáp × 7 vũ khí dùng chung một bộ art.
Nấc lùi ấy
tra theo lớp của **MÓN** (`d.sect`). Thần khí **cố ý** chỉ còn dành cho Dark Wizard và Dark Lord
— chủ dự án chốt từ đợt nhập gói: *"với DK thì nhân vật tay sẽ cầm kiếm"*, và riêng Dark Lord
*"cho vũ khí bay theo nhé"*.

⚠ **ĐÁNH ĐỔI, nói thẳng:** bảng khung cầm tay là hoạt cảnh của ĐÚNG cây trong gói Spine, nên
một cây rìu giai 3 vẽ ra Phượng Kiếm — hình trong TÚI và hình TRÊN TAY lệch nhau. Đổi lại là
không còn cây nào trôi. Cái lệch kia sửa được bằng cách nướng thêm bảng khung cho từng dòng;
cái trôi kia **không sửa được bằng mã**.

Gác: `tests/test_vklop.js` — đọc chính bảng khung game nạp, đòi (①) không khối nào có khung
TRỐNG, (②) vũ khí phải ĐỔI CHỖ theo khung, và (③) mọi dòng × mọi giai của ba lớp ấy đều cầm
được trên tay. Suy danh sách bộ từ `NV_VK_LOP` và quét `WEAPON_LINES` nên thêm bộ/dòng mới là
tự gác. Thử ngược: bảng khung cũ **27 FAIL**, gỡ nấc lùi theo lớp **60/63 FAIL**.

⚠ Mệnh đề ③ phải **đổi `player.sect`** theo từng lớp: `genItem` chỉ sinh vũ khí của lớp đang
chơi, nên bản đầu chỉ quét 21/63 món mà vẫn xanh — tức âm thầm bỏ qua hai lớp. Chốt tự kiểm
đòi ≥50 món mới cho chấm.

## 🖼 BẢNG KHUNG TỪ ẢNH RENDER (`nuong_tam_render.py`) — và **BẢNG HAI CÕNG LƯỢT NƯỚNG CŨ**

Art tới từ máy sinh ảnh là tranh **đã dẹp**, không tách lớp được, nên nó đi đường **TẤM LIỀN**
(`nvBo`/`nvBang`, không khai trong `NV_LOP_HOP`). Bộ đầu tiên đi đủ đường này là `dwsl1`
(Dark Wizard · Soul Lord) — giữ nó làm khuôn.

| | |
|---|---|
| bộ nướng | `tools/spine/nuong_tam_render.py` · cấu hình là một tệp JSON |
| hai đường neo | `dat()` chuẩn hoá theo **hộp bao** · `dat_o()` + `neo:'o'` neo theo **Ô** |
| khối riêng của đường này | `f` = BAY · `g` = BAY + ĐÁNH (gói Spine không có hoạt cảnh bay) |
| cửa hỏi bộ nào có | `NV_BO_CO_BAY` · `NV_BO_CO_BAYDANH` — **hỏi bảng, đừng hỏi "ô có rỗng không"** |

**⚠ `neo:'o'` LÀ BẮT BUỘC khi trong khung có VŨ KHÍ hay CÁNH.** Hộp bao lúc ấy là
(thân + cây gậy), mà cây gậy quét từ trên đầu xuống ngang hông ⇒ hộp bao phình co theo nó. Đo
trên gói tấn công: hộp bao cao 244..296 px (lệch 21%) trong khi nhân vật gần như không đổi cỡ.
Thu theo hộp bao ở đó là **nhân vật to lên đúng lúc hạ gậy xuống**.

### ⚠⚠ MỘT LƯỢT NƯỚNG LẠI ĐẺ RA **CÁI CHÂN THỨ BA** — đã ship, và nó im lặng tuyệt đối

Bảng **HAI** cố ý dựng bằng cách **chép tệp đang có trên đĩa lên** (`if os.path.exists(ra2)`),
để giữ 9 khối mà đợt nướng không đụng tới (trúng đòn · chết · ngồi · nói · nhảy múa…). Dựng
lại từ trắng là xoá sạch chúng trong im lặng — đúng kiểu hỏng mà `ISO_NEO` đã ghi.

Nhưng `dat`/`dat_o` thì **`alpha_composite`** — khung MỚI đè LÊN khung CŨ chứ không **thay** nó.
Chỗ nào khung mới trong suốt thì khung cũ **còn nguyên ở đó**. Đo trên bảng đã ship:

| ô (khối BAY) | 84 | 85 | 86 | 87 | 88 | 89 | 90 | 91 |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| điểm ảnh THỪA so với một lượt sạch | +361 | +769 | +573 | +595 | +768 | +662 | +430 | +739 |

Thứ hiện ra là **một bàn chân thứ ba** lơ lửng cạnh hai chân thật. Chủ dự án gọi đúng tên nó:
*"nhìu khả năng bạn input 2 hoạt ảnh trên cùng 1 nhân vật"*.

⇒ **`xoa_o(sheet, k)` xoá trắng ô trước khi ghi.** Ba luật:

- **XOÁ THEO Ô, ĐỪNG DỰNG LẠI CẢ BẢNG TỪ TRẮNG.** Ô nào lượt này không ghi thì phải còn
  nguyên — đó chính là lý do bảng hai chép tệp cũ lên. Đo sau khi vá: 9 khối không đụng lệch
  **0 điểm ảnh**, chỉ `f` và `g` đổi.
- **NÓ KHÔNG BAO GIỜ LỘ RA Ở LƯỢT NƯỚNG ĐẦU.** Tệp chưa có trên đĩa thì không có gì để mà
  chồng lên; lỗi chỉ sinh ra từ lượt SỬA thứ hai trở đi — tức đúng lúc không ai ngờ.
- **BẢNG MỘT KHÔNG DÍNH** (`Image.new` mỗi lượt), và **`nuong_nv.py` cũng không** — nó dựng
  mọi bảng từ trắng, không đọc tệp cũ. Chỉ đường bảng-hai của `nuong_tam_render.py` có bệnh này.

**Gác: `tests/test_khoihinh.js §6`.** Nó suy bộ từ `NV_BO_CO_BAY`, nạp bằng `nvTai()` (cửa nạp
chính chủ), rồi đòi **nửa dưới thân của cả 8 khung bay phải TRÙNG KHÍT khung đầu** — đó là lời
hứa "chỉ đôi cánh động", và residue phá nó ngay. Hai phép thử ngược đều đỏ: bảng cũ ⇒ 7/7 khung
lệch 1.400 điểm ảnh; gỡ `xoa_o` rồi nướng hai lượt (đổi mốc ghim giữa hai lượt) ⇒ lệch 2.975.

- ⚠ **DẢI ĐO LẤY y=210, KHÔNG LẤY 236** (mốc ghim của bộ nướng). Chép mốc ghim vào bài kiểm là
  dựng bản sao thứ hai của một hằng đang sống. 210 suy từ PHÉP ĐO: đôi cánh của gói art dừng ở
  **y≈181** trong ô, dưới đó là thân thuần.
- ⚠ **ĐỪNG dựng cảnh bằng `startGame` + trang bị.** Bậc do hệ trang bị quyết, mà nhân vật mới
  nay được phát sẵn bộ **giai 7** (`phatDoKhoiDau`) ⇒ thân ra `dwsm1`, bộ KHÔNG có khối bay, và
  mục này **lặng lẽ tự bỏ qua chính thứ nó sinh ra để gác**. Đã dẫm đúng thế hai lượt.
- ⚠ **`test_khoihinh` từng CHÉP CỨNG cổng 8853 và bỏ qua `argv[2]`** — bài thứ năm cùng bệnh
  (bốn bài kia đã ghi ở mục `rc=124`). Phép thử ngược vì thế **IM LẶNG** ở lượt đầu: nó đo cây
  ở 8853 chứ không đo cây được truyền, và tôi suýt kết luận là mệnh đề yếu. Đã sửa.

### ⚠ GHIM NỬA DƯỚI (`ghim_duoi`) — mốc phải nằm DƯỚI tầm với của cánh, và ĐO mới biết

Chủ dự án chốt cho khối bay: *"chỉ cần cho cánh chuyển động thôi"*. `ghim_nua_duoi()` ghim nửa
dưới mọi khung về khung đầu, có vờn mép (`ghim_hoa`).

**Mốc suy từ số đo, không từ cảm giác.** Quét bề ngang từng hàng qua cả 8 khung nguồn: dưới
`y≈240` (ô nguồn 384px) thì dao động tụt từ ~90px xuống ~25px — đó là chỗ cánh hết với tới,
phần dao động còn lại là chân đưa qua đưa lại. Quy về ô nướng 300px thì **y≈181**.

⚠ **ĐỪNG ghim theo BÓNG THÂN của khung đầu** — phần dư lòi ra thành một vương miện THỨ HAI trên
đầu cùng mấy mảnh chi ma. Và **đừng tách cánh theo MÀU**: cửa nhận diện theo màu bắt luôn kẽ
giáp (tối) và nẹp vàng (vàng) — cùng vết sẹo đã ghi cho phép gỡ bóng của đài phun nước.

## ✦ GÓI `magic-runtime` — SPELLBLADE ĐÃ RỜI HẲN KHỎI SPINE, và nó có TÁM HƯỚNG THẬT

Chủ dự án chốt (2026-09-23): *"thay thế nó bằng nhân vật spellcaster… tốt nhất là xoá hẳn spine
agent và thay thế mới đi. Và khi thay vào, ở chỗ equipment người chơi đã có thể đổi tự do các
món đồ / vũ khí với nhau."*

| | |
|---|---|
| Gói | `public/game/assets/magic-runtime/` — **90,1 MB** (armor 78 · body_base 7,6 · flight 4,3 · weapons **0,1**) |
| Nguồn sự thật | `manifest.json` (7 giáp · 7 vũ khí · FPS · thứ tự vẽ) + `sockets.json` (**4 state × 8 hướng × 8 frame = 256 pose**) |
| Máy | khối `MR_*` trong `game.js`, ngay trên `heroSprite` |
| Cửa DUY NHẤT | **`mrDung(sect)`** — lớp này đọc gói không · **`mrVe(...)`** — dựng một khung |
| Lớp dùng nó | `MR_LOP = { minhgiao: true }` |

### ⚠ VÌ SAO NÓ CÓ ĐƯỜNG VẼ RIÊNG, KHÔNG NHÉT VÀO `NV_BO`/`NV_MOC`

Hai hợp đồng bảng khung khác hẳn nhau, ép cái này vào cái kia là hỏng cả hai:

| | hệ `NV_*` | gói `magic-runtime` |
|---|---|---|
| khối | nối tiếp theo `NV_MOC` (i·w·a·c·r…) | **BỐN atlas rời** (idle/walk/run/attack) |
| hướng | một bản nghiêng + **LẬT** ngang | **8 HÀNG** trong chính atlas, không lật |
| ô | suy từ `NV_LOP_HOP`, mỗi bộ một khác | `256×256` cố định, pivot `(128,244)` |
| vũ khí | nướng SẴN vào lớp `vk` của thân | **tệp RỜI** + socket hai tay theo từng khung |

Cái cuối là cả điểm của gói: **7 giáp × 7 vũ khí = 49 tổ hợp, 0 byte art thêm**. Hệ `NV_VK_LOP`
không làm được — nó phải nướng một bảng khung cho MỖI cặp dòng×giai, và vì thế 60/63 món của ba
lớp từng rơi về cây lùi.

### Nó đi CHUNG đường `_gop`, và đó là lý do hào quang +N chạy nguyên xi

`mrVe()` trả về một tấm **`NV_OW×NV_OH`** — đúng khuôn mà `_nvKhungRa()` nhận thẳng
(`if (im.width === NV_OW) return im;`). Nhờ vậy viền sáng +N · dải quét +10 · tàn lửa bám theo
ALPHA của khung mới **mà không phải sửa một dòng nào** của khối hào quang. `_gop` nghĩa là
"khung đã dựng sẵn, blit thẳng" — gói chỉ việc nói cùng thứ tiếng ấy.

### ⚠ BẢY CHỖ PHẢI GÁC, và sáu trong bảy hỏng trong IM LẶNG

| | nếu quên |
|---|---|
| `flip` phải **false** (`_mrLop ? false : _hInfo.lat`) | atlas đã có đủ 8 hướng, lật thêm lần nữa là hướng Tây soi gương thành Đông — bóng dáng gần đối xứng nên nhìn ra "hình như quay sai", không ra một lỗi |
| `_n` phải là `MR_COT` (8) | `nvSoKhungBo` trả undefined ⇒ `heroFrameNow` chia cho 0 |
| `_boCoVk` phải bật | **đã chụp lại**: hai cây trong tay + một cây thần khí bay lơ lửng bên trái |
| `_choArt` phải cộng `_mr` | `_coArt` luôn false ở lớp này, nên khung dựng lúc atlas chưa về sẽ được NHỚ LẠI ⇒ tàng hình vĩnh viễn ở đúng mấy khung đó |
| `else if (!_coArt && !_mr)` ở nhánh vẽ-bằng-đường | mỗi khung chưa về lại chớp ra một hiệp sĩ xám mũ sừng — đúng thứ Quy tắc số 3 cấm |
| `ccArtSan()` phải hỏi `mrVe` | van ĐÓNG VĨNH VIỄN ⇒ màn chọn lớp rơi về dải nướng = **nhân vật CŨ**, vào game ra một người khác hẳn |
| `ccKhung(t, sect)` phải theo TỪNG LỚP | dải nướng 8 ô bị đọc tới chỉ số 15 ⇒ **nửa vòng thở TRỐNG TRƠN** |

### ⚠ `mrDung()` TRẢ `false` Ở LƯỢT HỎI ĐẦU — lượt ấy chỉ KHỞI ĐỘNG phép tải

Manifest + sockets là 182 KB và **mọi thứ của gói phải đợi chúng**. Ai hỏi MỘT LẦN rồi tin câu
trả lời sẽ xếp lớp ấy nhầm sang nhánh `NV_BO` — đã làm `test_khungchay` đỏ ở một chỗ chẳng hỏng
gì, và làm bộ nướng màn chờ nướng nhầm nhân vật cũ. `drawPlayer` miễn nhiễm vì nó hỏi lại mỗi
khung; mọi chỗ hỏi MỘT lần thì phải **chờ**.

⇒ `startGame()` gọi `mrNapDL()` ngay dòng đầu **cho lớp thật sự dùng gói** — 182 KB cho mọi
người chơi là 11% ngân sách màn tải (`data/taitro.js`: 21 tệp / 1,63 MB), không đáng.

### ⚠ NẠP TRƯỚC CẢ BỐN STATE CỦA BỘ ĐANG MẶC — đừng để lười thuần

Đo ở lượt nghiệm thu đầu: idle ra **7.444-7.780** điểm ảnh ở cả 8 hướng, còn walk/run/attack ra
**0**. Nạp lười thuần thì **bước đi ĐẦU TIÊN của mỗi phiên rơi vào khoảng trống**, và vì
`_choArt` chặn nhớ lại nên nó chỉ hỏng đúng một lần rồi tự khỏi — cực dễ nghiệm thu nhầm là xong.
Cùng vết sẹo đã ghi cho bảng CHẠY của avatar.

`mrXinBo()` xin cả bốn state ngay lúc bộ giáp hiện ra lần đầu. **Chỉ bộ ĐANG MẶC**, không xin cả
bảy: một bộ là 11,5 MB trên đĩa và **~64 MB sau giải nén** (4 × 2048² × 4 byte).

### ⚠ BẮC CẦU HƯỚNG BẰNG **TÊN**, ĐỪNG CHÉP MỘT MẢNG CHỈ SỐ

`NV_HUONG` đánh số theo GÓC (0 = Đông), `manifest.layout.rowOrder` kể TÊN hàng. Hôm nay hai bảng
lệch đúng 6 nấc, nhưng viết `(i+6)%8` là khoá cứng một sự trùng hợp: đổi `rowOrder` trong manifest
thì nhân vật quay lung tung mà **không một lỗi nào in ra**. `MR_TEN_HUONG` bắc cầu bằng tên.

### Tỉ lệ suy từ `CAO_THAN_NUONG`, không chép một con số đẹp

Thân trong ô cao **226 px** — ĐO trên `armor/ma_thuat/idle` south f0 (bbox `84,18 → 173,244`),
không phải chép từ README. `MR_TY = CAO_THAN_NUONG / 226` ⇒ Spellblade đứng cao **bằng** bốn lớp
kia. Chép cứng một tỉ lệ ở đây là một lớp cao hơn hẳn phần còn lại mà không ai đo ra.

### ⚠ BỐN STATE, và bốn khối kia trỏ về đâu là một QUYẾT ĐỊNH

`MR_STATE` — gói chỉ có `idle/walk/run/attack`:

- **`c` (niệm chú) → attack.** Spellblade niệm chú BẰNG nhát chém (Fire Slash), nên đây là thay
  thế gần nhất trong bốn cái, không phải một chỗ trống.
- **`h`/`d` → idle, GHIM khung 0** (`MR_GHIM`). Thiếu bảng ghim thì nhân vật vừa trúng đòn vừa
  nhấp nhô theo nhịp thở, và cái xác thì thở suốt 1,2 giây nằm xuống.
- **`q`/`n`/`t`/`e` (ngồi · nói · dính buff · nhảy múa) → idle.** Gói không có bảng hai, nên
  `_blkVe` cũng phải bỏ qua nhánh `nvBang` cho lớp này.

**Nợ ART, không phải nợ mã — nói ra chứ đừng giấu:** chưa có tư thế GIẬT và tư thế NGÃ. Cái chết
hiện ra là khung idle đứng yên rồi mờ dần.

### 🪶 BAY: gói có SLICE DUYỆT, không có atlas tám hướng

`flight` = hướng **South** · `flight_attack` = hướng **Southeast**. README của gói nói thẳng
(*"a `south` review slice, not a claimed eight-direction flight atlas"*), nên `mrVeBay()` **cố ý
bỏ qua `huong`**: bay sang Tây vẫn hiện tư thế South. Đó là nợ ART, và nói ra ở đây còn hơn để
người sau tưởng hướng bị tính sai.

- **Đôi cánh nằm SẴN trong slice** ⇒ `_bayBo` phải bật để `veCanh()` TẮT. Vẽ cả hai là hai đôi
  cánh trên màn — cùng kiểu hỏng với hai cây vũ khí ở `_boCoVk`.
- **Cánh khai theo LỚP** (`MR_CANH_LOP`), không theo bậc: gói chỉ có tier 1, giả vờ có ba bậc là
  hứa suông. Wing 1 MG cho Spellblade, Wing 1 DW để dành cho ngày Dark Wizard có gói tương tự.
- **Nhịp vỗ cánh lấy từ manifest (175 ms), KHÔNG dùng `BAY_NHIP` 95 ms** — gói ghi rõ *"a
  deliberately slow wing beat"*, chạy ở 95 là vỗ nhanh gấp đôi ý art.
- **CỐ Ý không vẽ `skill_vfx` của gói**: Fire Slash của game đã có tranh riêng trong
  `CHIEU_TRANH`, vẽ thêm là hai vụ nổ chồng nhau lệch tâm.
- ⚠ **Thân trong slice bay là bộ `Ma Thuật` (giai 4) cố định.** Mặc Cuồng Phong giai 7 mà bay thì
  vẫn ra thân Ma Thuật. Giới hạn của ART, không sửa được bằng mã.

### ⚠ ĐỔI TỰ DO ĐƯỢC MỘT NỬA — nói rõ nửa nào

README ghi `armorMode: "appearance-replacement"` và nói thẳng nó *"does not claim per-piece
chest/gloves/pants/boots mixing yet; that requires separately authored occlusion masks for every
state"*.

| | |
|---|---|
| đổi **vũ khí** tự do, mọi giáp | ✅ hoàn toàn — 49 tổ hợp |
| đổi **bộ giáp** | ✅ 7 bộ, tra bằng `mrGiap(tier)` |
| 4 ô giáp vẫn cộng **chỉ số** riêng | ✅ `calcDerived` không đụng một dòng |
| **nhìn thấy** nón bộ A + áo bộ B | ❌ cần occlusion mask cho 4 state × 8 hướng × 8 frame |

Bóng dáng đọc theo `tier` mà `heroSprite` nhận — tức `heroTier(p)`, tức bậc trung bình **NHÂN ĐỘ
PHỦ** của bốn ô. Đây là quy ước đang chạy cho cả `NV_GIAP`, không phải một luật mới.

### ⚔ BẢY DÒNG VŨ KHÍ + BẢY DÒNG GIÁP — hình theo DÒNG, chỉ số theo GIAI (2026-09-24)

Chủ dự án chốt: *"7 dòng vũ khí và 7 lớp trang bị riêng, tức nó tách ra và theo process của game,
nhân vật có thể trang bị tuỳ ý"*.

| | |
|---|---|
| vũ khí | `WEAPON_LINES` minhgiao = **7 dòng**, `line` = id cây trong manifest, `base.mr` = id đó |
| giáp | **`MR_GIAP_LINES`** (`data/canbang.js`) — 7 × 7 giai × 4 ô = **196 món**, id `minhgiao_<dòng>_<band>_<ô>` |
| tên | tên gói + số giai La Mã (`Song Chùy IV` · `Giáp Phong Vũ IV`) — cùng tên ở 7 giai là 7 món trùng tên |
| bộ nào hiện lên người | **ô ÁO** (`mrGiapDong`, lui `non→tay→chan`) — gói `appearance-replacement` nên chỉ MỘT bộ hiện được |
| cửa đọc | `gearVisual().mrGiap` / `.mrVk` → `mrGiapTheoDong` / `mrVkCua` → `mrVe`; `heroGearSig` mang `mrGiap` |
| icon túi | vũ khí = tấm master (cắt sát + xoay mũi +X cho `veVkTranh`); giáp = `assets/magic-runtime/icon/*` nướng bằng **`tools/magic/nuong_icon_mr.py`** |
| save cũ | **`ITEM_ALIAS`**: `minhgiao_<band>_<ô>` và `minhgiao_{songdao,daikiem,makiem}_<band>` → dòng thứ `band+1` — đúng cái hình người chơi đang thấy trước đợt này. Tự vá lúc `itemDef()` đọc, nên vá cả món nằm ngoài túi |

- ⚠ **`mrIconTai` chỉ trả BẢN ĐÃ CẮT.** `complete` bật trước khi `onload` chạy; trả tấm gốc trong
  khe đó là một lượt vẽ tấm dựng đứng bị `veVkTranh` xoay thêm −90° ⇒ cây NẰM NGANG — và lượt đó
  mang khoá `'V'` nên bị nhớ lại vĩnh viễn. Đã dẫm đúng thế ở lượt chụp đầu.
- ⚠ **Canvas cắt sát phải mang `src`.** `vkBong()` khoá theo `im.src`; canvas không có ⇒ bảy cây
  dùng chung một bóng hào quang rèn.
- ⚠ **`iconTyLe` phải hỏi `def.mr`**, không chỉ `vkAnh` — thiếu là khung cao 2×3 thành vuông.
- ⚠ **`heroCardUrl` đi đường `mrVe` khối ĐỨNG hướng South** — đó là chỗ DUY NHẤT còn thấy 7 bộ
  giáp (ngoài màn nhân vật luôn bay, xem dưới). Trước đợt này thẻ rơi về `drawHeroFigure`: một
  hiệp sĩ dựng bằng đường, lỗi có từ đợt chuyển gói.

### 🪽 SPELLBLADE LUÔN BAY — không còn đi/chạy

Chủ dự án chốt: *"Bỏ phần nhân vật đi bộ đi … by default hãy cho nhân vật đang bay và mang cánh
cấp 1 (áp dụng cho Magic trước)"*, và chọn **đúng slice bay của gói** dù biết cái giá.

- `_bayLuon = !!MR_LOP[p.sect]` trong `drawPlayer`: bay **không cần ô cánh**, và **không cất cánh**
  (độ cao ghim ngay — nội suy từ 0 là mỗi lần sang map đứng đất nửa giây).
- **Cái giá, nói thẳng:** thân trong slice bay là **Ma Thuật cố định, hướng South cố định**. Bảy
  bộ giáp và tám hướng **không hiện ngoài màn** — chỉ thẻ nhân vật / màn chờ còn thấy. Nợ ART.
- **Vũ khí thì đổi được cả bảy cây**: lớp `weapon` vẽ sẵn (Ảo Ảnh) bị bỏ, tấm master đặt vào tay
  theo `weaponHands` (+ `weaponAngles`/`weaponGripPivot` ở bay-đánh). Bay thường không có góc ⇒
  `MR_BAY_VK` đo bằng khớp IoU vào lớp vẽ sẵn (0,65/0,76 · bay-đánh 0,76–0,84). ⚠ `weaponAngles`
  ngược chiều canvas, nhân −1.
- `mrVe` khối `f`/`g` trả **null** khi slice chưa về — rơi xuống khung đứng đất là nhớ khung sai
  vĩnh viễn dưới khoá của khối bay. `mrXinBay` nạp trước mọi lớp slice + 7 tấm master.
- **Cánh cấp 1 mặc định**: `canhMacDinh()` (một lần, cờ `_canhMacDinh`, không chạy trong TEST_MODE).
  ⚠ Chế độ `?max=1` / bản chơi thử vẫn phát bậc 3 (`applyTestBoost`); hình trên người như nhau
  (Wing 1 MG của slice), chỉ khác độ cao và chỉ số.
- Ngoài thành luật `avaNhap()` không đổi: thân nhân vật nhập vào Axie, nên cảnh bay này thấy ở
  **trong thành** (và khi `/avatar off`).

Gác: **`tests/test_mrdong.js`** (8 mệnh đề; ba phép thử ngược — bỏ chọn theo dòng · bỏ `_bayLuon`
· dán lại lớp vũ khí vẽ sẵn — đều đỏ đúng mệnh đề).

### Đã gỡ theo — `sbsm1` · `sbhd1` KHÔNG CÒN TRÊN ĐĨA

`NV_BO['minhgiao|1']` · `NV_GIAP['minhgiao|7']` · `NV_LOP_HOP['sbhd1'|'sbsm1']` ·
`NV_KHUNG_R.sbsm1` · `NV_VK_LOP['makiem|7']` · `NV_VK_LOP_LOP.minhgiao` · 25 tệp webp.

⚠ **`giaiCoArt('minhgiao')` nay trả 1** (không tìm thấy giai nào trong `NV_GIAP`). Chỗ nào hỏi
"lớp này có art ở giai nào" cho Spellblade phải đi qua `mrGiap`, không qua hàm đó.

### ⚠⚠ BỘ NƯỚNG MÀN CHỜ CÓ **HAI** LỖI CÓ SẴN, và đợt này mới lôi ra

`tools/title/nuong_lop_cho.cjs`:

1. **Cửa sẵn sàng chỉ hỏi `nvKhungGop`** — cửa của bộ CẮT LỚP. Bộ đi đường TẤM LIỀN (`dwsl1` của
   Dark Wizard) luôn trả null ⇒ bộ nướng bỏ cuộc với *"art chưa về"*. Nay hỏi đúng biểu thức mà
   `ccArtSan()` hỏi (`nvKhungGop || nvBang`).
2. **Lớp nào hỏng thì nó VẪN GHI `data/lop_cho.js`** ⇒ lớp ấy **biến mất khỏi `LOP_CHO.o`**,
   `ccLopHinh()` trả null, màn chọn lớp mất hẳn bóng người — và tệp đã bị ghi đè nên không còn gì
   để so. **Đã xảy ra thật trong phiên này** với `baidasan` và suýt ship. Nay hỏng một lớp là
   KHÔNG ghi tệp nào.

*Một bộ sinh dữ liệu ghi đè khi thiếu một mục là một bộ xoá sổ mục ấy trong im lặng — cùng họ với
vết sẹo `ISO_NEO`.*

Bên lề: nhờ ① mà dải nướng của Dark Wizard được cập nhật lần đầu kể từ khi lớp ấy đổi sang `dwsl1`
— nó đang là ảnh chụp của một bộ art đã gỡ.

### Gác

`tests/test_khungchay.js` — ② suy bộ/số khung từ `mrDung()` + `MR_COT`; **③ nay gác chính tính
chất mới**: 8 hướng phải ra 8 tư thế KHÁC NHAU (hướng nằm theo HÀNG, tra nhầm hàng là nhân vật
quay sai mà không một lỗi nào in ra). `tests/test_vklop.js` — số món cần quét **suy từ bảng**
(`WEAPON_LINES` × `GIAI_MAX`), không chép cứng 63: Spellblade rời đi thì còn 42, và bản cũ ĐỎ ở
một chỗ chẳng hỏng gì.


## Art nướng sẵn từ Spine — có SKILL riêng, đọc trước khi đụng vào

Art nhân vật do Meowa sinh ra là rig Spine. Game này không có runtime Spine và sẽ không có
(runtime chính chủ đòi giấy phép), nên đường đi là **nướng sẵn ra bảng khung rồi `drawImage`**.

Toàn bộ hợp đồng toạ độ, các phép đo bắt buộc, và những cái bẫy của định dạng Spine 4.2 nằm ở
**`.claude/skills/spine-nuong/SKILL.md`**. Đọc trước khi sửa `nvBo`/`nvVuKhi`/`nvIconUrl`/
`canhVeAnh` hay khi có gói art mới — mấy cái bẫy kia đoán không ra được, mỗi cái làm hỏng bản
dựng theo một kiểu khác nhau.

Ba công cụ, ba việc khác nhau:

| công cụ | việc |
|---|---|
| `tools/spine/nuong_nv.py` | thân + vũ khí gốc → bảng khung 80 khung |
| `tools/spine/nuong_vk.py` | đắp một vũ khí RỜI (pixel art) lên tay theo xương điểm cầm |
| `tools/spine/nuong_icon.py` | tách bộ giáp thành dải **4 icon**: nón · áo · tay · chân |

Chỉ có **bốn** icon chứ không phải năm — bản mẫu Spine không có khe quần riêng, nên ô Quần chỉ
tính chỉ số. Đừng thêm ô thứ năm vào dải: `NV_ICON_O` và `NHOM` trong `nuong_icon.py` phải
trùng nhau, lệch một ô là mọi món sau đó hiện sai hình.

`NV_BO` (thân trần) có 5/5 lớp; `NV_GIAP` (bộ giáp) mới có 1/35 — thiếu khoá thì tự về đường
vẽ cũ, nên thêm dần từng bộ được, không phải chờ đủ. Xem thử nhanh bằng `/gen <giai> [+rèn]`.

## Đổ khối: một nguồn sáng, đặt ở TRÊN-TRÁI

`applyFormLight` + `applyEdgeLight` phủ ánh sáng lên hình ĐÃ VẼ bằng `source-atop`.
Hai cái bẫy đã mắc:

- **`_dim(h, k)` là NHÂN VỚI `(1-k)`**, không phải "còn lại k phần sáng".
  `_dim(x, 0.86)` ra gần đen. Đọc nhầm chiều này thì cả bức tranh đen kịt.
- **Rìa sáng phải là DẢI VIỀN, không phải cả bóng dời đi.** Phủ nguyên bóng trắng
  dời 2px rồi bóng đen dời ngược lại thì ruột hình bị trắng chồng đen hoá xám —
  đỏ ra nâu hồng, vàng ra khaki. Phải lấy bóng gốc TRỪ bóng dời để chỉ còn vành.
  Vành cũng phải tô bằng dải tắt dần: vành đều một sắc đọc thành nét viền dán.

Độ dày rìa đo bằng bảng đối chiếu, không đoán: 2.4px trên icon 88px. 3.2px làm
giáp và ủng bạc màu.

## Sáng theo +N: quầng NẰM NGOÀI, món đồ giữ nguyên màu

> ⚠ Lớp **quầng** ở mục này đã gỡ (2026-09-24) — xem mục "Cường hoá +0..+11". Viền sát bóng còn giữ.

**Luật gốc: trang bị là thứ GẮN LÊN người, nên nó phải giữ được bản sắc riêng ở mọi
mức rèn.** Bộ giáp tím-đen viền đồng ở +11 vẫn phải đọc ra đúng bộ giáp đó. Tín hiệu
"+N" nằm HOÀN TOÀN ngoài đường bao, không tô đè lên một pixel nào của món đồ.

Hai lối đã thử và ĐỀU HỎNG, đừng làm lại:

- **Cộng sáng đè lên cả người** (`globalCompositeOperation = 'lighter'` rồi vẽ lại
  chính tấm sprite). Nghe hợp lý vì vùng kim loại sáng vọt còn vải tối gần như đứng
  yên — nhưng **da và tóc cũng là vùng sáng**. Lên +9 là mặt bợt hẳn, nhân vật hoá
  ma. Tách được lớp đầu+tóc ra thì đỡ, nhưng vẫn làm giáp bay mất màu.
- **Ba nguồn cộng sáng chồng nhau** (giáp + cánh + vũ khí, mỗi thứ +11). Cháy trắng
  thành một khối, không còn phân biệt được cái gì với cái gì. Cuối game ai cũng rơi
  vào trạng thái này nên không phải trường hợp hiếm.

Cách ĐÚNG — hai lớp, cả hai nằm ngoài silhouette:

1. **Quầng**: làm nhoè kênh alpha của lớp, tô một màu, thổi to 1,05×, vẽ TRƯỚC lớp đó.
2. **Viền sát bóng**: nở alpha ra rồi TRỪ đi alpha gốc → còn đúng một dải mép ngoài,
   tô cùng màu. Đây mới là thứ cho cảm giác món đồ đang phát sáng.
   *(Cùng nguyên lý với rìa sáng ở mục "Đổ khối" — lấy bóng trừ bóng dời, không phủ
   nguyên bóng lên.)*

**Bậc đọc bằng SẮC, không bằng ĐỘ CHÓI.** Đây là chỗ mấu chốt: chói thì bão hoà, sắc
thì không. Thang: `+7` vàng `#ffd76a` → `+9` lam băng `#9ef2ff` → `+10` tím `#c07fe0`
→ `+11` cam rực `#ff9a4d`. Dưới +7 không có quầng.

**Sáng theo CẢ BỘ, lấy `min(+N)` của năm món giáp** — không sáng từng món. Hai lý do,
lý do sau mạnh hơn:
- Chest +9 mà giày +2 thì thân sáng chân tối, đọc ra "đồ chắp vá" chứ không ra "đồ khủng".
- Ngưỡng cả-bộ biến năm món rời rạc thành MỘT cái đích. Ép xong chest mà chưa thấy gì
  đổi chính là động lực ép nốt bốn món kia. `min` chứ không phải trung bình, vì `min`
  mới ép nâng đều.

**Vũ khí và cánh sáng RIÊNG, và không tốn gì thêm** — vũ khí có slot riêng, cánh thì
`veCanh()` vẽ riêng ở toạ độ thế giới. Ba nguồn sáng độc lập mà chỉ trả tiền cho một lớp.

Hai chỗ dễ vấp khi hiện thực:
- **Bề dày viền phải tính theo TỈ LỆ.** Dải 5px đo trên hình 976px cao; trong màn nhân
  vật chỉ cao 104px nên nó thành dưới 1px và biến mất sạch.
- **`+10` tím dễ chìm** khi chính nhân vật cũng tím (Dark Wizard). Hoặc cho mỗi lớp một
  thang lệch đi, hoặc đổi `+10` sang sắc không lớp nào dùng.

## Lò Hỗn Độn — MỘT cỗ máy, không phải 7 khối chữ

Trước đây có **hai** màn rèn chồng nhau: bảng `Rèn Luyện` (tab) và `Lò Rèn Hoàng Gia` (NPC).
Mỗi màn là một cuộn chữ dài xếp 7 khối khác nhau, và hai bên còn trùng nội dung. Nay gộp thành
một cỗ máy kiểu Chaos Machine: **bỏ đồ + ngọc vào KHAY → máy liệt kê công thức khay đó thoả →
chọn → KẾT HỢP**.

**Luật nằm hết trong `CHAOS_RECIPES`, `renderForge()` chỉ vẽ.** Thêm công thức mới = thêm một
phần tử vào bảng, không đụng vào phần vẽ. Mỗi công thức khai báo:

| khoá | việc |
|---|---|
| `match(v)` | khay có đúng HÌNH DẠNG không (mấy món, loại gì) → trả mô tả hoặc `null` |
| `plan(v,m)` | tỉ lệ, bảng nguyên liệu, cảnh báo, có cho dùng Thiên Mệnh Phù không |
| `run(v,m,p)` | thực thi |
| `royal:true` | chỉ chạy tại Lò Rèn Hoàng Gia (`atRoyalForge()`) |

**Quy ước phân loại nguyên liệu:** thứ **rời rạc** (trang bị, ngọc Tứ Châu) phải bỏ vào khay mới
tính — dùng `jewelCost()`. Thứ **số lượng lớn** (Lumen, Tu La, Mảnh…) trừ thẳng từ kho
và chỉ hiện trong bảng — dùng `chaosCost()`. Đừng trộn hai loại.

### Túi đồ là một LƯỚI, không phải mảng đếm món

`player.inv` vẫn là mảng phẳng — 70 chỗ đang `find`/`filter`/`splice` trên nó không đổi — nhưng
mỗi món nay mang `gx`,`gy` = ô trên-trái nó chiếm, và chiếm một KHỐI ô theo hình dáng:

| | ô | | ô |
|---|---|---|---|
| nhẫn | 1×1 | áo choàng | 2×3 |
| dây chuyền | 1×2 | **cánh** | **2×5 = 10** |
| giáp (5 ô mặc) | 2×2 | vũ khí | 1×2 → 2×4 theo `line` |

- **Thêm đồ phải đi qua `bagThem(it)`**, không `player.inv.push()` thẳng. Món không có `gx/gy`
  là món VÔ HÌNH: vẫn ăn sức chứa, vẫn nằm trong save, mà không hiện ô nào. `bagSecGear()` có
  bước tự vá nhưng đó là lưới an toàn, không phải chỗ dựa.
- **Hỏi còn chỗ bằng `bagConCho(it)`**, không `player.inv.length >= bagCap()`. Cây trường cung
  2×4 có thể không nhét được trong khi vẫn còn sáu ô lẻ rải rác — đó chính là điểm của cái lưới.
- Kích thước ở `BAG_SIZES` / `BAG_SIZES_LINE`; đo bằng `bagKichThuoc(it)`.
- Quầy Shard nới theo **HÀNG** (`BAG_COLS` = 8 ô), không theo ô lẻ.

### Ép ngọc thẳng vào đồ

Chúc Phúc và Linh Hồn **không cần tới lò** — bấm viên ngọc trong túi rồi bấm món đồ, ở bất cứ
đâu, đúng như MU. Luật nằm ở **`NGOC_EP` / `epNgoc()`**, và Lò Hỗn Độn chỉ là mặt tiền gọi lại
cùng hàm đó. Sửa tỉ lệ hay trần thì sửa `NGOC_EP`, đừng sửa hai nơi.

| | trần | tỉ lệ | hỏng thì |
|---|---|---|---|
| ◎ Chúc Phúc | +6 | 100% | không bao giờ hỏng |
| ◉ Linh Hồn | +9 | 50% | tụt 1 cấp |
| Phá Thiên Kiếp | +11 | 50/45% | VỠ VỤN (☂ giữ được) |

⚠ Linh Hồn từng cho tới +11 — tức là nó ăn đứt Phá Thiên Kiếp ở cả hai mức. Đừng nới lại trần
đó mà không gỡ Phá Thiên Kiếp đi cùng.

### Cánh — 3 bậc × 6 lớp, khoá theo lớp

`WING_BANG = [WING_DEFS, WING2_DEFS, WING3_DEFS]`, tra theo `player.sect`. Bậc đọc từ
`it.wingBac`; `wingSect(it)` cho biết lớp nào dùng được và **`itemUsable()` là cửa duy nhất**
gác chuyện đó (cả ba đường mặc đồ đều đi qua đó).

- Vẽ bằng **một hàm duy nhất `veCanh(g, it, px, py, sway, swayDir, co)`** — dùng cho cả nhân vật
  trong màn lẫn chân dung bảng Nhân Vật. Toạ độ CỤC BỘ (gốc = chân), `co` là tỉ lệ.
- Cánh là **bộ phận mềm**: phải đọc `sway`/`swayDir`, không đọc `performance.now()` một mình.
- Thêm cánh mới thì nhớ `heroCardUrl()` — khoá cache phải gồm chữ ký cánh, không thì chân dung
  hiện mãi đôi cũ sau khi thăng bậc.

### Ba loại tiền thường trực (ví ở góc trên bên phải)

| Tên người chơi thấy | Ký hiệu | Trường | Kiếm ở đâu | Tiêu ở đâu |
|---|---|---|---|---|
| **Lumen** | `◈` | `player.silver` | rơi từ quái, bán đồ, nhiệm vụ | tiệm · rèn · nâng kỹ năng · Lò Hỗn Độn |
| **Ấn Giao Kết** | `✦` | `player.chimera.ve.gk` | boss vùng lần đầu · điểm danh · phó bản | quay Khế Ước (ra **thân Axie**, không ra thú đồng hành) |
| **Shard** | `♦` | `player.shard` | KHÔNG rơi từ quái — chỉ mốc mỗi ngày và thông quan | Quầy Shard: vé quay · nới túi · nới kho |

- `player.silver` **giữ nguyên tên trường**; chỉ chữ người chơi thấy đổi thành "Lumen". Đừng đổi
  tên trường — mọi save đang lưu và 12 chỗ trong `loadGame()` đọc `silver`.
- Shard **không được cộng chỉ số**. Chỗ tiêu duy nhất chạm tới sức mạnh là đổi vé quay, và nó đi
  vòng qua gacha chứ không mua thẳng. Thêm hàng vào `quayShardHang()` thì giữ đúng luật đó.
- Số ô túi/kho đọc bằng `bagCap()` / `khoCap()`, **không** viết thẳng `30` / `60` nữa — hai con số
  đó nới được bằng Shard và trước đây nằm rải ở 17 chỗ.

**Ba cái bẫy đã sập một lần, đừng sập lại:**
1. `chaosSyncGroup()` phải chạy theo `chaosPick`. Nếu không, bảng DANH SÁCH công thức và bảng
   CHI TIẾT sẽ chỉ vào hai công thức KHÁC NHAU.
2. Khay trống thì **đừng** tự nhảy tab. Không có bước chặn này, mở lò ra là rơi thẳng vào Chế Tạo
   chỉ vì "khay trống khớp công thức luyện áo choàng".
3. Khay khớp công thức ở nhóm khác thì **phải** nhảy sang. Không có bước này, bỏ trang bị + viên
   Chúc Phúc vào khay lúc đang xem tab Rèn sẽ khiến máy im lặng hoàn toàn — không công thức,
   không nút bấm — dù khay hoàn toàn hợp lệ.

`trayView()` tự nhả món đã bán/vỡ khỏi khay, nên không có uid ma. Sau khi khảm ngọc xong, khay
**giữ lại món đồ** (để khảm tiếp) và chỉ nhả viên ngọc.

## Cảm giác chiến đấu — 3 luật dễ vi phạm lại

**1. AoE KHÔNG được hất lùi.** `hurtMob()` tự hất lùi mọi đòn `source === 'hit'|'crit'`.
Chiêu diện rộng mà đẩy địch ra thì chính nó phá tan đội hình cho đòn kế tiếp của mình — ca đã
gặp: một hiệu ứng cần "trúng ≥3 địch" ngừng kích hoạt vì con thứ ba bị đẩy ra đúng 1 pixel.
Đừng chữa bằng cách đổi `source`: `source` còn chi phối bạo kích và âm thanh.
**Bọc vòng lặp trúng-nhiều-mục-tiêu trong `aoeHit(() => { … })`.** Chiêu nào MUỐN hất lùi
thì khai báo `fx.kb` như cũ. Hiện có 6 chỗ: sectA cone/selfaoe, bảng kỹ năng cone/aoe và 2 sóng
dư chấn của chúng.

**2. `shakeDir` phải được đặt ở MỌI chỗ đặt `shakeT`.** Bỏ sót thì màn hình giật theo hướng
của cú đánh gần nhất — có khi ngược hẳn. Và `shakeMag` luôn dùng `Math.max`, đừng gán đè:
một cú cào nhẹ không được phép hạ biên độ của cú vừa nện.

**3. Mọi trạng thái hẹn giờ phải chết theo người chơi.** `update()` `return` sớm khi `dead`,
nên thứ gì đang hẹn sẽ ĐÓNG BĂNG rồi chạy tiếp ở toạ độ cũ sau khi hồi sinh — có khi ở tận
map khác. `onDeath()` phải dọn: `sigilReset()` (vũng độc + sóng hẹn giờ) và `player.pendingHit`.
Lưu ý `respawn()` chỉ gọi `buildWorld()` khi chết ở map KHÔNG an toàn, nên không thể trông
vào nó để dọn hộ.

## 🌐 ONLINE — Giai đoạn 1 "Bóng Người" ĐÃ CHẠY THẬT TRÊN PRODUCTION

> **Chốt 2026-09-15:** phần online đã **hoàn thiện sơ bộ** và nghiệm thu trên VPS thật, không
> phải chỉ trong bài kiểm. Chủ dự án mở hai cửa sổ và thấy nhau chạy. Bảy mục của
> `deploy/kiemtra_ws.sh` xanh hết: máy chủ sống · `sites-enabled` là symlink thật · cấu hình
> ĐANG NẠP có `location /ws` · bắt tay WebSocket qua nginx ra `101` · trang nạp `net.js` ·
> và bản `net.js` đi qua nginx đúng là bản đã vá.
>
> **Việc tiếp theo chủ dự án chốt: HỆ THỐNG CHAT** (kênh Thế Giới + kênh vùng) — xem mục
> "💬 CHAT" bên dưới.

### Nó dừng đúng ở đó — đọc trước khi hứa thêm gì

> Thiết kế đầy đủ: **`docs/THIET_KE_ONLINE.md`** · khảo sát + lộ trình 7 giai đoạn:
> **`docs/KHAO_SAT_ONLINE.md`** · mẫu giao thức/lược đồ: `docs/online-samples/`

**Làm được gì:** hai người mở hai trình duyệt, cùng một map, **nhìn thấy nhau chạy** — có tên,
có thanh máu, xếp lớp đúng theo chiều sâu.

**KHÔNG làm gì:** không tài khoản, không cơ sở dữ liệu, không quyền quyết định, không chống gian
lận, không PvP, không đồng bộ quái. **Đó là chủ ý.** Đây là giai đoạn nhỏ nhất chứng minh được cả
hướng đi.

> ⚠ Câu trên **trước đây còn ghi "không chat"** — nay đã có (mục 💬 CHAT). Và trang bị · cánh ·
> hành động ra đòn cũng đã đồng bộ (mục 👁 GIAI ĐOẠN 2). Giữ lại chỗ này để thấy ranh giới đã dời
> tới đâu, chứ đừng đọc nó như trạng thái hiện tại. Đừng bắt `server/bongnguoi.js` gánh thêm việc — mọi thứ có giá trị lâu dài
(sinh vật phẩm, cộng tiền tệ, máu boss chung) phải đợi tới lúc có tài khoản thật và kho đồ trên
máy chủ, xem `docs/THIET_KE_ONLINE.md` mục "Ngã ba phải chọn".

| Thứ | Ở đâu |
|---|---|
| Máy chủ chuyển tiếp | `server/bongnguoi.js` · `npm run bongnguoi` · cổng 8877 |
| WebSocket tự viết, **0 phụ thuộc** | `server/wsnho.js` |
| Client | `public/game/net.js`, nạp SAU `game.js` |
| Tầng vẽ | `drawPlayer(p)` · `NETPLAYERS` · `netTaoThan()` · `veNhanNet()` · `veKhoa()` |
| Triển khai | `deploy/bongnguoi.service` · `deploy/nginx-ws.conf` · `deploy/capnhat-deploy.sh` |
| Gác | `tests/test_bongnguoi.js` (Chromium thật) + `tests/test_wsnho.js` (giao thức) |

### ⚠ MÁY CHỦ KHÔNG PHỤ THUỘC GÌ — chỉ cần `node`, KHÔNG cần `npm install`

Bản đầu dùng thư viện `ws`. Đưa lên VPS mới lộ ra cái giá: **VPS chưa bao giờ có Node** (nó là
nginx phục vụ tệp tĩnh, vỏ tRPC trong `api/` chưa từng chạy), và `npm install ws` trong
`/var/www/axiewuxia` thì npm hoà lại **toàn bộ** cây phụ thuộc của repo — đo được **63 gói prod,
467 MB `node_modules`** (aws-sdk, react, trpc, drizzle, radix…) chỉ để chạy một relay 170 dòng.
Kèm ba rủi ro vận hành: `npm install` viết lại `package-lock.json` (**có trong git** ⇒ giằng co
với `git reset --hard` mỗi 2 phút); đặt một `package.json` riêng cạnh tệp máy chủ để cô lập thì
Node đọc **package.json gần nhất** và coi `bongnguoi.js` là CommonJS ⇒ mọi `import` nổ; và thêm
một thứ phải cài lại mỗi khi dựng máy mới.

Nhu cầu thật rất nhỏ — **khung TEXT, gói dưới vài KB** — nên `server/wsnho.js` làm tay bắt tay
+ đóng/bóc khung bằng `node:crypto` + `node:http`. Máy chủ thành **một thư mục không cần cài gì**.

⚠ **ĐỪNG mở rộng `wsnho.js` thành thư viện đầy đủ.** Nó cố ý không làm: nén
(permessage-deflate), khung nhị phân, phân mảnh do chính máy chủ gửi. Ngày nào cần một trong ba
thì đem `ws` về — lúc ấy cái giá kia đáng trả.

**Ba chỗ đóng khung dễ sai, cả ba đã có bài gác riêng** (`tests/test_wsnho.js`, client THÔ bằng
`node:net` — trình duyệt là client LỊCH SỰ nên nó không dựng được mấy đường này):

1. **Khung máy chủ gửi KHÔNG được che mặt nạ; khung client gửi lên BẮT BUỘC che.** Ngược một
   trong hai là trình duyệt đóng với mã 1002.
2. **TCP không bảo toàn ranh giới gói.** Một lượt `data` có thể mang nửa khung hoặc ba khung
   rưỡi. §3 gửi **từng byte một** để ép đúng đường đó; triệu chứng khi sai là "thỉnh thoảng mất
   một gói", không phải một lỗi đọc ra được.
3. **Nhánh độ dài 2 byte (`126`) là nhánh CHẠY THẬT**, không phải phòng xa — ảnh chụp của vài
   người đã vượt 125 byte. Sai nhánh đó thì game hỏng đúng lúc đông người, tức lúc khó gỡ nhất.

**⚠ VÀ MỘT LỖI THẬT MÀ BÀI KIỂM BẮT ĐƯỢC, Chromium thì không:** `http.Server` của Node dựng
`net.Server` với **`allowHalfOpen: true`** (để còn viết nốt hồi đáp sau khi client đóng nửa
đường), và socket nâng cấp lên WebSocket **thừa hưởng** tính chất đó. Nên client gửi FIN mà
không gửi khung close thì `'close'` **không bao giờ nổ** — người đó nằm lại trong danh sách và
bóng của họ đứng chết giữa map tới 30 giây (tới khi bộ lọc im lặng dọn hộ). Trình duyệt gửi
khung close tử tế nên đường này không lộ khi thử bằng Chromium. Phải bắt **cả `'end'`**.

### 🔧 CÀI TRÊN VPS: MỘT DÒNG, và một dòng là vì **SERIAL CONSOLE LÀM RỚT KÝ TỰ**

```
bash /var/www/axiewuxia/deploy/caidat.sh
```

Chủ dự án vào VPS bằng **serial console** của nhà cung cấp (`starting serial terminal on
interface serial0`). Loại terminal đó gõ lại từng ký tự qua cổng nối tiếp, nên **dán nhiều dòng
là rớt ký tự và dính dòng** — đã xảy ra hai lần: `/var/www/axiewuxia` dính thành
`/var/www/axiewuxisudo`, và một khối bốn dòng dán ra thành một dòng vô nghĩa. Một dòng ngắn thì
**gõ tay được**. ⇒ Mọi hướng dẫn chạy trên VPS phải gói về một dòng, đừng đưa một danh sách lệnh.

`caidat.sh` làm cả bốn bước (Node ≥18 · systemd · bước restart trong cron deploy · nginx `/ws`),
chạy lại nhiều lần vô hại, và mỗi bước tự kiểm trước khi làm.

**⚠ NÓ TỰ CHÉP MÌNH RA `/root` RỒI `exec` LẠI.** Cron chạy `git reset --hard` trên chính cây này
2 phút một lần, mà **bash đọc script theo từng đoạn TRONG LÚC chạy** — tệp đổi giữa chừng là
bash đọc lệch byte rồi làm một chuyện không ai từng viết. Cài Node có thể lâu hơn 2 phút, nên
cửa sổ đó không phải giả thuyết.

**⚠ VÀ NÓ ĐÃ XẢY RA THẬT, ngay trong phiên viết cái guard này — với `tools/reg.sh`.** Tôi sửa
một khối CHÚ THÍCH trong đó giữa một lượt hồi quy đang chạy, rồi tự trấn an *"tệp 6,4 KB, dưới
8 KB, chắc bash đã nạp trọn"*. Sai. Lượt chạy kết thúc bằng:

```
tools/reg.sh: line 106: syntax error near unexpected token `('
```

— dòng 106 là khối TỔNG KẾT ở cuối script, và `bash -n` trên chính tệp đó ngay sau đó thì **xanh**.
Tức bash đọc tiếp sau khi tôi sửa, và đọc lệch. Cái giá: mất bảng tổng kết **và** mất bước tự
chạy lại bài `rc=124` — đúng hai thứ mà lượt chạy ấy sinh ra để cho. *Luật chung: đang chạy một
script thì đừng sửa tệp của nó, kể cả chỉ sửa chú thích, kể cả tệp nhỏ. "Chắc là không sao" ở đây
không phải một phép đo.*

**⚠ Bước nginx là bước ĐỘNG VÀO TỆP ĐANG CHẠY**, nên: sao lưu → sửa bằng python → `nginx -t` →
hỏng thì **trả lại bản cũ và KHÔNG reload**. Và nó **từ chối** nếu `sites-available/axiewuxia`
có nhiều hơn một `server {` — đoán sai block ở một tệp đang chạy là mất trang.

### ⚠ VPS CẦN CÀI NODE — `apt install nodejs` cho bản QUÁ CŨ

`node` và `npm` không có sẵn trên VPS. Và `apt install nodejs` của Debian/Ubuntu cho Node 12,
trong khi mã dùng **ESM + tiền tố `node:`** (cần ≥ 14.18, thực tế nên ≥ 18). Cài từ NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version      # phải ra v20.x
```

`npm` đi kèm gói đó, nhưng **không dùng tới** — máy chủ không có phụ thuộc nào.
(`caidat.sh` bước 1 làm đúng ba dòng trên, kèm kiểm `curl` có sẵn chưa — bản Debian tối giản
không có, và khi thiếu thì lỗi báo ra là "không tải được script NodeSource", tức sai chỗ.)

**⚠ THỬ HAI NGƯỜI: MỌI NHÂN VẬT MỚI HIỆN RA Ở ĐÚNG MỘT ĐIỂM.** Đo được: `ardhaven (3200, 1900)`
cho **mọi** nhân vật mới, bất kể localStorage. Nên hai cửa sổ vừa vào game là hai thân **chồng
khít lên nhau, lệch 0,0px** — kết nối chạy hoàn hảo mà nhìn ra "không thấy ai". Phải **cho một
người đi chỗ khác** rồi mới kết luận.
⚠ Và **"hai cửa sổ ẩn danh" là sai**: Chrome dùng CHUNG một phiên ẩn danh cho mọi cửa sổ ẩn danh
⇒ vẫn một localStorage, vẫn một nhân vật. Đúng là **một cửa sổ thường + một cửa sổ ẩn danh**,
hoặc hai trình duyệt khác nhau, hoặc hai máy.

**⚠ MẶC ĐỊNH TẮT, và đừng gỡ cái cửa đó.** Không khai máy chủ ⇒ `net.js` `return` ngay,
`NETPLAYERS` rỗng, bản chơi một mình chạy y nguyên — đó là thứ đang sống trên production, và cả
185 bài hồi quy đều chạy trên đường không có mạng. Bật bằng `?net=ws://…`, `?net=1`, hoặc
`window.NET_URL`. `test_bongnguoi §0` gác chiều ngược lại: không khai máy chủ mà vẫn nối là đỏ.

### Năm cái bẫy đã dẫm, ghi lại

1. **`let` ở tầng cao nhất KHÔNG gắn vào `window`.** `player` và `curMap` khai bằng `let`, nên
   `net.js` đọc `window.player` nhận `undefined`, im lặng không gửi gì, **không một lỗi nào in
   ra**. (`function` và `var` thì có gắn — nên `thanNhip` gọi qua `window.` được, còn `player`
   thì không.) Cửa đọc duy nhất là **`window.netDoc()`**; thêm trường thì sửa ở đó, đừng cho
   `net.js` với tay vào phạm vi của game.
2. **`bayCao` từng là MỘT biến module** — hai người đeo cánh khác bậc giành nhau một ô nhớ, độ
   cao cả hai nhấp nháy theo thứ tự vẽ. Nay là `Map` khoá theo `veKhoa(p)`. **Vẫn nằm ngoài
   `player`** vì lý do cũ còn nguyên: nhét vào `player` là nó chui vào save.
3. **Thân người từ xa phải cắm vào ĐÚNG danh sách xếp lớp theo `y`** (`ents`), không vẽ thành
   một lượt riêng. Lượt riêng thì họ luôn nằm sau hết hoặc trước hết — người đứng dưới gốc cây
   lại hiện đè lên tán.
4. **`thanNhip()` là MỘT luật, hai nơi gọi.** Nhịp bước + quán tính phụ tách khỏi `update()` để
   `net.js` gọi được. Chép công thức sang `net.js` là dựng bản sao thứ hai của một luật đang
   sống — sửa một bên là bàn chân trượt đất, mà kiểu lệch đó chỉ hiện ra khi nhìn ảnh chụp.
   Cùng họ với luật "hai chỗ phải cùng gọi `dangChay()`".
5. **Ảnh chụp phải TỰ NÓI nó thuộc map nào.** Suy ngầm "ảnh này chắc là map mình đang đứng" thì
   đúng lúc vừa qua cổng, một ảnh của map cũ tới sau sẽ thả vài cái bóng vào map mới.

### ⚠⚠ THÂN NGƯỜI TỪ XA TỪNG ĐỨNG CHẾT — và năm mệnh đề đầu đều xanh suốt lúc đó

Lỗi nặng nhất của Giai đoạn 1, **đã ship**, và nó giết đúng mục tiêu của cả giai đoạn
("nhìn thấy nhau **CHẠY**") trong khi mọi bài kiểm vẫn xanh và không một lỗi nào in ra.

`nhanAnh()` đặt `t.at` và `t.bt` **BẰNG NHAU** (cùng bằng `gio`), nên `span = max(1, bt − at)`
ra **1 ms**; còn `noiSuy()` lại vẽ ở mốc `performance.now() − TRE_MS`, tức **luôn TRƯỚC `at`**.
⇒ `k` bị kẹp về 0 ở **mọi** khung ⇒ `x = ax` = chỗ đang vẽ ⇒ thân người từ xa đứng nguyên ở
**vị trí đầu tiên**, vĩnh viễn. Đo được: B dời tới `x = 3460`, A vẫn vẽ `x = 3200` — lệch đúng
bằng quãng vừa đi, ở cả hai map.

**Luật rút ra, và nó lớn hơn cái lỗi:** `TRE_MS` (120) **lớn hơn** nhịp ảnh chụp (100), nên sơ
đồ **HAI MỐC** không thể vẽ lùi thật được — chỉ nội suy được trong `[at, bt]`. Muốn vẽ lùi thì
phải giữ **ba mốc trở lên**. Nay: trượt từ chỗ ĐANG vẽ tới mốc mới trong đúng `TRE_MS`, và
`noiSuy` đọc `performance.now()` thẳng.

⚠ **Vì sao năm mệnh đề cũ mù:** cả năm đặt toạ độ **một lần** rồi đo một ảnh **TĨNH**. Chúng gác
*"có vẽ ra không"*, không gác *"có đi được không"*. `test_bongnguoi §3b` nay dời B rồi đòi A phải
vẽ theo (ngưỡng 40px — đòi khớp chằn chặn là đỏ theo xúc xắc, vì nội suy vốn trễ một nhịp), và
nó **đã được thử ngược**: dựng lại đúng bản cũ thì nó đỏ.

⚠ **Và thử ngược cũng có bẫy.** Lượt đầu tôi `sed` nhầm — `const gio = performance.now()` có ở
**hai** hàm, và lùi cả hai thì `−120` triệt tiêu nhau, ra một biến thể *chạy được*, nên bài xanh
và tôi suýt kết luận "bài kiểm không bắt được lỗi". Thử ngược phải dựng lại **đúng** bản lỗi,
không phải một bản hỏng bất kỳ.

### Và hai bẫy ở BÀI KIỂM — cả hai cho ra một bài XANH VÌ LÝ DO SAI

- **Đếm điểm ảnh "khác trong suốt" là vô nghĩa trên nền ĐẶC.** Mặt đất của game đục kín nên ô
  nào cũng đủ alpha: ra đúng 84×120 = 10.080 ở cả lượt có bóng lẫn lượt không, bằng nhau, trông
  y như "không vẽ được gì".
- **Đổi sang đếm điểm ảnh ĐỔI MÀU thì ra 10.056/10.080 — 99,8%.** Không phải vì bóng người to
  bằng cả ô, mà vì **cả cảnh trôi** giữa hai lần vẽ: mây, sóng cỏ, ánh sáng đều chạy theo
  `performance.now()`, và hai lệnh `evaluate` cách nhau hàng chục mili giây.
  Cách đúng: vẽ **cả hai lượt trong CÙNG một `evaluate`** (trôi còn ~1 ms) **và** đo thêm một ô
  **đối chứng** ở chỗ không có ai đứng, rồi đòi ô có bóng phải đổi nhiều hơn hẳn. Đo được sau
  khi sửa: **4.725 điểm ảnh đổi ở ô có bóng, 0 ở ô đối chứng**; gỡ nhánh vẽ đi thì còn 54.

### 💬 CHAT — hai kênh, KHÔNG lịch sử, và chống spam nằm ở MÁY CHỦ

| | |
|---|---|
| Kênh | **Thế Giới** (mọi người đang online) · **Vùng** (chỉ ai đứng cùng bản đồ) |
| Máy chủ | `nhanChat()` trong `server/bongnguoi.js` · `CHAT_DAI` 200 · `CHAT_NHIP_MS` 700 · `CHAT_CUA` 6 câu / 10 giây |
| Sợi dây | `window.netChatGui()` gửi · `window.netChatNhan/netChatChan` nhận, trong `net.js` |
| Giao diện | `chatThem()` · `chatDung()` · `chatNoi()` trong `game.js`; `#chat-wrap` góc dưới-TRÁI |
| Gác | `tests/test_chat.js` (5 mệnh đề) |

**⚠⚠ LỜI NGƯỜI KHÁC GÕ LÀ DỮ LIỆU, KHÔNG PHẢI HTML.** Mọi dòng dựng bằng `createElement` +
`textContent`. Nối chuỗi vào `innerHTML` ở đây là ai cũng gõ được `<img onerror=…>` vào ô chat
rồi nó chạy trên máy **mọi người trong kênh**. Máy chủ cắt độ dài và ký tự điều khiển nhưng
**không** thoát HTML, và nó không nên làm thế: thoát HTML là việc của chỗ hiển thị, vì chỉ chỗ
đó mới biết nó đang dựng cái gì. `test_chat §3` hỏi thẳng DOM (`querySelectorAll('img').length`),
không hỏi chuỗi — hỏi chuỗi thì một bản vá nửa vời (thoát `<` mà quên `"`) vẫn xanh.

**⚠ CHỐNG SPAM Ở MÁY CHỦ.** Ô nhập bên client chỉ để người tử tế khỏi vô tình bấm liên tục;
client sửa được. Hai lớp vì chúng chặn hai kiểu khác nhau: `CHAT_NHIP_MS` chặn **giữ phím**,
`CHAT_CUA` chặn **dán một loạt rồi bắn dồn**.

**⚠ BỊ CHẶN THÌ PHẢI NÓI RA** (`chat-chan` → `netChatChan`). Nuốt im thì người chơi gõ lại, rồi
gõ lại nữa — tức chính cái chống spam lại **sinh ra** spam, và họ tưởng game hỏng.

**⚠ CHỈ XOÁ Ô KHI GỬI ĐƯỢC.** `netChatGui()` trả `false` lúc chưa nối; xoá ô bất kể là lấy mất
câu người ta vừa gõ.

**Bốn chỗ đã vấp, ghi lại:**
1. **Chính bộ chống spam nuốt mất phép đo an toàn.** Lượt đo đầu, câu thử XSS bắn ngay sau mấy
   câu trước nên bị chặn, và dòng cuối hoá ra là *"Nói chậm lại một chút"* — bài **xanh mà chưa
   kiểm được gì**. Mệnh đề ③ nay chờ qua nhịp chống spam **rồi** mới đo, và nó khẳng định câu
   thử đã tới nơi trước khi kết luận là an toàn.
2. **Khối chat ẨN khi không có mạng** (`chatDung()` hỏi `NET.on`). Bày một ô chat gõ được mà
   không ai nhận là đúng cái lỗi *"một cái vỏ giả vờ là máy chạy"* ở mục Tổ Đội. `§0` gác.
3. **Phím Enter phải đứng SAU chốt Lò Hỗn Độn** trong `phimXuong` — lò đang mở thì Enter thuộc
   về lò. Khi ô chat có tiêu điểm thì `phimXuong` đã `return` ở dòng đầu (`target.tagName ===
   'INPUT'`), nên không cần chốt thứ hai; nhưng ô nhập vẫn `stopPropagation` để phím gõ không
   rơi xuống phím tắt.
4. **`chatNoi()` gọi trong `startGame` và có cờ chặn gọi hai lần.** `startGame` chạy lại được
   (đổi nhân vật, bài kiểm), mà gắn listener hai lần là **một câu chat gửi đi hai lần**.

**KHÔNG lưu lịch sử — cố ý.** Máy chủ này không có cơ sở dữ liệu; một lịch sử chat trong RAM thì
mất theo lần khởi động lại kế tiếp, mà cron deploy khởi động lại nó mỗi khi `server/` đổi. Lịch
sử là việc của giai đoạn có tài khoản thật.

**Kênh Thế Giới tới cả người còn ở màn chờ** (chưa có `map`) — họ vẫn là người đang online, nghe
được trước khi vào là điều hay. Kênh Vùng thì đòi phải đứng trong một bản đồ, và nói rõ lý do
khi chưa vào.

### 👁 GIAI ĐOẠN 2 · TRANG BỊ · CÁNH · HÀNH ĐỘNG RA ĐÒN — ĐÃ ĐỒNG BỘ

Giai đoạn 1 dừng ở "nhìn thấy nhau CHẠY": mọi thân người từ xa dựng bằng `equip: {}`, nên ai cũng
cởi trần, không cánh, và đứng như tượng trong lúc đánh nhau. Nay hết.

**Câu hỏi chủ dự án hỏi trước khi làm — *"có cần build hết assets/skills rồi mới đồng bộ không"* —
câu trả lời đo được là KHÔNG**, và ba thứ nằm ở ba mức phụ thuộc art khác hẳn nhau:

| | phụ thuộc art | đo được |
|---|---|---|
| hành động ra đòn | **0** | `player.atkAct`/`castAct` là giá trị TÍNH RA, không tra tệp nào |
| cánh | **0 thêm** | `veCanh()` là hàm DUY NHẤT, dùng chung mọi lớp; `WING_BANG` là dữ liệu |
| trang bị | 3/35 | `NV_GIAP` mới có `thieulam\|1` · `baidasan\|1` · `baidasan\|7` |

Lý do cốt lõi: thân người từ xa đi **CÙNG một đường vẽ** với nhân vật của mình, nên người bên kia
trông đẹp đúng bằng thân của chính mình đang trông. Art về sau nâng cả hai bên miễn phí.

| | |
|---|---|
| Dựng / áp mô tả | `NET_O_DO` · `window.netTrangBi()` · `window.netApTrangBi(t, g)` trong `game.js`, ngay dưới `netDoc` |
| Vệ sinh phía máy chủ | `locTrangBi()` · `st.gear`/`st.gearV` · `ws.__gearV` trong `bongnguoi.js` |
| Bộ đếm cú ra đòn | `player._atkSeq` / `_castSeq`, tăng ở ĐÚNG hai chỗ ghi `atkAnim`/`castT` |
| Độ dài hoạt cảnh | `NV_DANH_GIAY` 0,22 · `NV_CHU_GIAY` 0,38 · `window.NV_HD_GIAY` |
| Gác | `tests/test_dongbodo.js` (7 mệnh đề, **cả bảy đã thử ngược và đều đỏ**) |

**⚠ GỬI CHỮ KÝ, KHÔNG GỬI `player.equip`.** Một món thật nặng 474 byte × 11 ô ≈ **5 KB mỗi người
mỗi ảnh chụp**, để chở những trường tầng vẽ không hề đọc. Tầng vẽ chỉ cần bốn thứ mỗi ô: `def`
(ra bộ art và lớp) · `tier` · `plus` · mức quý. **Đo được: mô tả gọn 190 byte.**

**⚠ VÀ NÓ DỰNG LẠI MỘT `equip` GIẢ chứ không tự vẽ lấy.** `gearVisual()` · `nvLopCuaEquip()` ·
`heroSprite()` · `veCanh()` chạy y nguyên trên thân người từ xa. Viết một đường vẽ thứ hai "cho
gọn" là bộ giáp mới nướng sẽ hiện trên mình mà không hiện trên họ.

**⚠ BỘ ĐẾM, KHÔNG PHẢI THỜI GIAN CÒN LẠI.** Hoạt cảnh đánh dài 0,22 s lọt gọn giữa hai ảnh chụp
10 Hz — gửi "còn bao lâu" là thỉnh thoảng mất hẳn một cú đánh, mà mất kiểu đó không ai lần ra.
Một con số chỉ tăng thì không có khe nào để lọt. ⚠ Lần ĐẦU nhìn thấy một người thì chỉ GHI NHẬN
bộ đếm, đừng nổ hoạt cảnh: họ có thể đã đánh 500 cú trước đó, và coi đó là "vừa bắt đầu" thì ai
lọt vào tầm mắt cũng vung kiếm một cái chào.

**⚠ ĐẾM NGƯỢC HAI ĐỒNG HỒ ẤY Ở `noiSuy`, ĐỪNG NHÉT VÀO `thanNhip`.** `update()` đã đếm ngược cho
người chơi của mình; `thanNhip` thì CẢ HAI bên cùng gọi ⇒ mình bị trừ hai lần. Thiếu hẳn phép đếm
ngược thì thân người từ xa **kẹt vĩnh viễn ở khung vung kiếm** — một pho tượng đang giơ kiếm.

**⚠ TRANG BỊ CHỈ GỬI KHI ĐỔI, và cửa nhớ là PER-KẾT-NỐI.** Nhét vào mọi ảnh chụp là 190 byte × 9
người × 10 Hz ≈ **16 KB/s mỗi client**, gấp ba cả gói tin hiện tại, cho một thứ đổi vài phút một
lần. Máy chủ giữ `st.gearV` và mỗi kết nối giữ `ws.__gearV` — người mới nhìn thấy nhau thì chưa có
khoá đó nên tự nhận đủ ngay ảnh đầu. Không cần gửi lại phòng hờ: WebSocket chạy trên TCP.

**⚠ MÔ TẢ RỖNG LÀ MỘT CÂU TRẢ LỜI.** Bản đầu `locTrangBi` trả `null` khi không nhận ra ô nào rồi
máy chủ bỏ qua — nên **THÁO HẾT ĐỒ RA là mọi người vẫn thấy ta mặc nguyên bộ cũ**, và chính người
tháo đồ là người duy nhất không nhìn thấy nó.

**⚠ `_doCuoi` (chữ ký đã gửi) PHẢI XOÁ Ở `ws.onopen`.** Máy chủ dựng trạng thái mới toanh cho mỗi
kết nối, nên sau khi rớt và nối lại nó không còn nhớ ta mặc gì — mà client thì thấy "chữ ký không
đổi" rồi im lặng không gửi. Ta cởi trần với mọi người tới lần thay đồ kế tiếp.

**⚠ `wingDef(it)` NAY NHẬN `sectDp` — nợ cũ đã trả.** Nhánh dự phòng trước đây lui về `player.sect`:
vô hại hồi chỉ có một người trên màn, nhưng từ lúc đồng bộ cánh thì một Dark Wizard đứng cạnh sẽ
mọc **đôi cánh của LỚP MÌNH**, và không lỗi nào báo — đôi cánh vẫn vẽ ra, chỉ là sai người.

**⚠ `dead` LÀ BIẾN TOÀN CỤC CỦA NGƯỜI CHƠI NÀY**, mà `drawPlayer` nay vẽ cả thân người từ xa. Ba
chỗ trong hàm đọc thẳng nó ⇒ **mình nằm xuống là lớp nhân vật của mọi người quanh mình thôi vật
chất hoá** (`_lopHien` có `!dead`), tức họ vung kiếm trong vô hình. Nay `_chet = (p === player) ?
dead : (p.hp <= 0)`.

#### 📐 NĂM PHÉP ĐO HỎNG TRƯỚC KHI RA ĐƯỢC MỘT PHÉP ĐO ĐÚNG — đừng lặp lại

Mệnh đề ⑦ (rò rỉ `dead`) mất **năm lượt** mới gác được gì, và mỗi lượt hỏng một kiểu khác nhau.
Tất cả đều là bài học chung cho mọi phép đo điểm ảnh trong dự án này:

1. **Đo một thân người ĐỨNG YÊN thì không thấy gì** — đứng yên thì thứ trên màn là con AXIE, mà
   con Axie chẳng liên quan tới chuyện ai chết. Rò rỉ hiện ra đúng **39/16.500** điểm ảnh (cái
   vòng dưới chân). Phải đo LÚC RA ĐÒN, chỗ `_lopHien` thật sự cắn.
2. **Ô đo phải trùm cả LỚP NHÂN VẬT, không chỉ trùm con Axie.** Nó đứng KẾ BÊN — tới
   `AVA_CHAN_TRUOC`(72) phía trước cộng `AVA_CHAN_BEN`(56) sang bên, tức ~91px. Ô 150px (nửa bề
   rộng 75) cắt cụt đúng thứ cần đo.
3. **Ô ĐỐI CHỨNG phải nằm TRONG canvas.** Đặt ở `(bx+700, by−340)` là ra ngoài khung; `getImageData`
   kẹp về góc trên-trái và trả một vùng trống ⇒ nó ra 0 ở MỌI trường hợp. *Một ô đối chứng luôn
   xanh không gác được gì* — cùng họ với "một cái chốt đúng ở mọi trạng thái".
4. **Hai người đứng cách nhau 80px thì ô trùm cả hai.** Ô rộng 340 quanh B mà A ở cách 80 ⇒ đo
   luôn thân của A, thứ đúng ra PHẢI đổi khi A chết. Đỏ 5.281 điểm ảnh trên **mã đúng**.
5. **Và cuối cùng, cái lớn nhất: SÀN NHIỄU CỦA MỘT THÂN NGƯỜI ĐANG ĐỘNG LỚN HƠN TÍN HIỆU.** Hai
   lượt vẽ LIÊN TIẾP, CÙNG điều kiện, của một thân người đang vung kiếm lệch nhau **6.545/102.000
   điểm ảnh** — cánh vỗ, hào quang đập, vũ khí bay, tất cả chạy theo `performance.now()`. Con số
   6.532 mà tôi tưởng là "rò rỉ" chính là nhiễu đó. ⇒ Mục ⑦ nay **KHÔNG đo điểm ảnh**:
   `drawPlayer` phơi thẳng `_chet` và `_lopHien` ra **`window.__veChet`** (chỉ khi `TEST_MODE`),
   khoá theo từng thân người — cùng lối với `__neoVe`/`__veThan`.

**⚠ Ô ĐỐI CHỨNG KHÔNG PHẢI SÀN NHIỄU.** Nó đứng ở chỗ KHÔNG CÓ AI nên nó chỉ bắt nhiễu của NỀN,
không bắt nhiễu của chính thân người đang đo. Hai thứ khác nhau, và mục ② cần CẢ HAI.

**⚠ CON AXIE THỞ ~8 FPS ⇒ SÀN NHIỄU LƯỠNG CỰC, PHẢI LẤY TRUNG VỊ.** Đo 10 cặp khung liên tiếp
trên một thân người ĐỨNG YÊN: `507·444·501·527·458·`**`5221`**`·509·448·441·377`. Một lượt render
tốn ~13 ms nên cứ chừng 10 khung lại có đúng một lần nhảy khung hình của con Axie. Lấy MỘT cặp là
10% số lượt rơi trúng đỉnh; lấy MAX là 100%. Đã đỏ 2/3 lượt trước khi đổi sang trung vị — và
TÍN HIỆU cũng phải lấy trung vị, vì một lượt đo đơn lẻ rơi trúng đỉnh ấy sẽ được độn thêm 5.200
điểm ảnh, tức xanh kể cả khi chẳng có gì đổi.

**⚠ HAI THỨ PHẢI LẮNG TRƯỚC KHI ĐO, THEO HAI ĐỒNG HỒ KHÁC NHAU:** `bayCao` nhích 8% về đích MỖI
LẦN `render()` (hâm bằng vòng render), còn ART BỘ GIÁP tải theo MẠNG (hâm bằng `await`). Chỉ làm
một trong hai là sàn nhiễu nhảy 498 → 5.146 tuỳ lượt.

**⚠ Và một bài kiểm nhiều mục thì mục sau THỪA HƯỞNG cảnh của mục trước.** Mục ③ dời B tới chỗ con
quái để lái một cú đánh THẬT; tới mục ⑦ thì B nằm ngoài khung hình của A, ô đo rơi vào góc canvas
trống, và **cả bản đúng lẫn bản đã tháo cơ chế đều XANH**. Mục nào đổi chỗ đứng thì mục sau phải
dựng lại cảnh của mình, và phải TỰ KIỂM là đã dựng được.

### 🛡 HAI CHỐT TRƯỚC PVP — tên không mạo danh được, `pos` không bắn dồn được

| | |
|---|---|
| Tên | đặt **MỘT LẦN** ở gói `pos` đầu (`st.daDatTen`), và `tenRieng()` thêm hậu tố nếu trùng ai đang online |
| Nhịp `pos` | `POS_CUA` 30 gói / `POS_CUA_MS` 1000 (nhịp thật là 10) · vượt bền `POS_QUA_MAX` 200 gói thì đóng |
| Gác | `tests/test_giapvp.js` (6 mục, **cả sáu đã thử ngược và đều đỏ**) |

**⚠ ĐÂY KHÔNG PHẢI XÁC THỰC — đừng nhầm hai thứ.** Không có tài khoản thì không cách nào biết ai
thật sự là ai. Thứ chốt tên mua được là đúng một điều: **không mạo danh được người ĐANG CÓ MẶT.**
Bản cũ nhận `name` ở MỌI gói `pos`, tức đổi tên bất cứ lúc nào — hồi chỉ có bóng người thì là
chuyện nhỏ, từ lúc có CHAT thì là nói thay người khác mà họ không có cách nào biết.

**⚠ TRÙNG TÊN THÌ ĐỔI, ĐỪNG ĐÁ RA.** Hai người cùng đặt "Kiếm Khách" là chuyện thường; đá người
thứ hai là phạt nhầm người.

**⚠ ĐỪNG ĐẶT TRẦN NHỊP SÁT 10 Hz.** Client gửi theo `requestAnimationFrame` nên hai gói dính sát
nhau sau một khung nghẽn là bình thường. Và đừng ĐÁ ngay: một cú bắn dồn lẻ thì BỎ QUA gói là đủ,
chỉ đá khi nó bền — người chơi thật không giữ được mức đó, bot thì có.

### ☠ TRÚNG ĐÒN VÀ CHẾT ĐÃ ĐỒNG BỘ — và **ĐỪNG SUY CỜ CHẾT TỪ MÁU**

Trúng đòn đi bằng **bộ đếm** `_hitSeq` (cùng lý do `_atkSeq`: cú giật 0,25-0,30 s lọt gọn giữa hai
ảnh 10 Hz). Chết đi bằng **cờ riêng** `chet`, lấy từ `netDoc()`.

**⚠⚠ ĐÂY LÀ LỖI ĐÃ VIẾT RA RỒI MỚI ĐO RA.** Bản đầu để `drawPlayer` suy `p.hp <= 0` cho thân người
từ xa — nghe rất hợp lý, và SAI: hồi máu kịp chạy một nhịp giữa lúc máu về 0 và lúc cờ `dead` bật,
nên người đã nằm xuống vẫn gửi đi **`{hp: 0,565 · dead: true}`**, rồi máy chủ `Math.round` thành
**1**, và bên kia đọc ra "còn sống". Người chết đứng nguyên đó vung tay.

⚠ **Và nó chỉ hỏng TUỲ LƯỢT** — đo được cả `0,57 → 1` (hỏng) lẫn `0,19 → 0` (không hỏng). Nên phép
thử ngược phải **ghim máu ở 0,6**; để tự nhiên thì nó xanh chừng nửa số lượt và người sau sẽ kết
luận nhầm là mệnh đề không gác được gì.

⚠ **`deadT` phải được CỘNG Ở PHÍA NHẬN.** `update()` cộng nó cho người chơi của mình; thân người từ
xa không bao giờ chạy `update()`, nên thiếu dòng này là **cú ngã đứng hình ở khung ĐẦU, vĩnh viễn**
— nhìn ra "hình như lag" chứ không ra "chưa làm".

⚠ **HỎI CẢ SỢI DÂY LẪN CHỖ TIÊU THỤ.** Mệnh đề đầu của tôi chỉ hỏi `n.chet` (thứ đến từ dây) và nó
**KHÔNG ĐỎ** khi tôi trả `drawPlayer` về kiểu suy-từ-máu: dây vẫn chở cờ đúng, chỉ chỗ ĐỌC nó sai.
Nay hỏi thẳng `window.__veChet` — quyết định mà `drawPlayer` thật sự dùng.

⚠ **Bài kiểm nhiều mục: cảnh của mục trước còn nguyên ở mục sau.** B đứng giữa bãi quái `daohoa`
nên nó có thể CHẾT trong lúc hai mục đầu chạy; bước dọn của tôi trả máu mà quên trả cờ `dead`, nên
`deadT` đã chạy 4,5 s trước khi mục đo chết kịp giết nó. Chốt tự kiểm bắt được. *Trả lại trạng thái
thì phải trả ĐỦ.*

⚠ **ĐỪNG THỔI `maxHp` LÊN ĐỂ LÀM BẤT TỬ trong bài kiểm.** Đã thử `1e9`: hồi máu tính theo phần trăm
máu trần nên mỗi nhịp kéo lại hàng trăm nghìn máu, nhân vật không chết nổi, và mục đo chết đọc ra
"hp 840000" ngay sau lệnh giết. Dời quái đi là đủ.

⚠ **Đo một hoạt cảnh NGẮN thì đừng lấy mẫu ở một mốc cố định.** Cú giật dài 0,30 s, ảnh chụp 10 Hz,
độ trễ đổi theo lượt — đo được `0,017` ở mốc 300 ms và **đúng 0** ở mốc 150 ms, cùng một mã chạy
tốt. Theo dõi liên tục rồi lấy ĐỈNH thì không còn khe nào để trượt.

⚠ **HAI BÀI KIỂM CŨ ĐỎ VÌ HAI CƠ CHẾ MỚI LÀM ĐÚNG VIỆC CỦA CHÚNG** — cả hai sửa bằng cách đi
theo, không bằng cách nới luật:
- `test_wsnho §3/§4` nhận diện client bằng **TÊN**, mà §2 của chính nó đã cho cả chín client gửi
  một `pos` kèm tên trước đó ⇒ tên đã chốt, hai cái tên mốc bị bỏ qua đúng như thiết kế. Nay
  nhận diện bằng **TOẠ ĐỘ** — thứ hai mục ấy thật sự chứng minh (gói tới nơi nguyên vẹn).
- `test_dongbodo §7` đo lớp nhân vật lúc ra đòn, mà `_lopHien` đòi `!hurtT`; từ lúc cú trúng đòn
  được đồng bộ thì thân người từ xa đứng giữa bãi quái **liên tục giật** nên lớp nhân vật không
  bao giờ vật chất hoá. Chốt tự kiểm của chính mục ấy bắt được — *đỏ ở chốt cảnh dựng, không đỏ
  ở mệnh đề*, đúng như nó phải thế.

### ⚔ SÀN ĐẤU ARDHAVEN — PvP đã chạy, và **MÁU TRẬN LÀ MỘT TÚI RIÊNG**

Chủ dự án chốt: *"Dựng 1 map pvp và làm thử xem. Chỉ cần 2 người đánh nhau là được."* Đã chạy
thật: hai trình duyệt, đi bộ qua cổng, đánh nhau, có kẻ thắng người thua.

| | |
|---|---|
| Map | `pvp` trong `data/canbang.js` — *Sàn Đấu Ardhaven*, 1800×1400, `type:'freepk'`, `pvp:true` |
| Cổng vào | `ardhaven (3820,1840)` → `pvp`, và cổng ra `pvp (900,1140)` → `ardhaven` |
| Client | `PVP_MAP` · `PVP_HE` · `pvpDangO()` · `pvpGoc()` · `nearestNguoi()` · `pvpTran` · `drawPvpHUD()` |
| Máy chủ | `nhanPvpDanh()` · `phatSan()` · `st.pvpHp/pvpMax/pvpChet/pvpHit` trong `bongnguoi.js` |
| Dây | `netPvpDanh` gửi · `pvp-mau` / `pvp-ket` / `pvp-hoi` nhận, trong `net.js` |
| Gác | `tests/test_pvp.js` (8 mệnh đề, **cả tám đã thử ngược và đều đỏ**) |

**⚠⚠ QUYẾT ĐỊNH LỚN NHẤT: máu trận KHÔNG phải `player.hp`.** Ba lý do, mỗi lý do đủ để một mình
nó quyết:
1. `player.hp` nằm trên **máy của người BỊ đánh** — để nó quyết thì ai cũng bất tử bằng một dòng
   devtools, và người thắng không có cách nào biết mình đang bị lừa.
2. Chết thật thì `onDeath()` chạy: ném về map an toàn, mất tiến độ. **Thua một trận đấu không
   được phép đụng vào bản lưu.**
3. Túi riêng thì máy chủ giữ được, và nó mở **một** con số ra cho cả hai bên cùng nhìn.

Nhưng túi ấy **khởi tạo bằng `maxHp` THẬT**, nên trang bị và cấp vẫn quyết thắng thua — đúng cái
*"mang progress và đồ"* chủ dự án hỏi. `test_pvp §5` là mệnh đề nặng nhất của cả bài: nó đo
`player.hp` · `dead` · `curMap` · `level` · `xp` của người vừa bị hạ và đòi **không một cái nào
suy suyển**. Thử ngược (trừ thẳng vào `player.hp`) ra `1115 → 43` — đỏ ngay.

**⚠ HAI GÓC ĐỨNG (`md.goc`), và thiếu nó thì lỗi trông y hệt "mạng không chạy".** Mọi nhân vật
vào một map đều rơi vào **đúng một** `spawn`, nên hai người vừa vào là hai thân **chồng khít lên
nhau lệch 0,0px** — đúng cái đã làm mất một vòng chẩn đoán ở lượt thử Bóng Người đầu tiên. Chọn
góc theo **`NET.id`** (thứ duy nhất được máy chủ bảo đảm khác nhau giữa hai client), đừng bốc
ngẫu nhiên: ngẫu nhiên thì một nửa số lượt hai người vẫn cùng một góc, tức lỗi cũ quay lại nhưng
chỉ một nửa số lần.

**⚠ KHÔNG hệ số phẳng nào cân được cả hai đầu — đo rồi mới biết.** Quét 5 lớp × 3 cấp × có/không
BiS:

| cảnh | `atk/maxHp` | `aspd` |
|---|---|---|
| tay trần (thieulam, mọi cấp) | 0,037 | 0,74 |
| tay trần (toanchan cấp 20) | 0,083 | 0,79 |
| BiS (`applyTestBoost`) | 0,089 | **0,25** |
| BiS (toanchan cấp 120) | **0,266** | 0,25 |

Tỉ lệ trải **7 lần**, mà `aspd` lại nhanh thêm **3 lần** ở đầu BiS ⇒ 21 lần chênh về tốc độ hạ.
Nên chia việc: `PVP_HE = 1,0` đặt theo cảnh THẬT (trang bị thường), còn **trần một cú của máy
chủ** `PVP_TRAN_DMG = 0,06` mới là thứ bó đầu BiS. Đo được: trận **17-32 cú**, tức ~4 giây (hai
bên full BiS) tới ~24 giây (hai bên tay trần). **Bốn giây là đầu trên ĐÃ BIẾT, không phải chỗ
chưa đo.**

**⚠ TRẦN MỘT CÚ LÀM HAI VIỆC** — và đó là lý do nó đáng có: vừa chặn một client sửa đổi bắn một
phát chết (`test_pvp §6` bắn thẳng `1e9` và đo ra 5,9%), vừa là cái duy nhất bó được cân bằng ở
đầu trên. Nới nó là hai người full BiS hạ nhau trong vài cú; hạ nữa là trang bị hết nghĩa.

**⚠ VÀ ĐÂY KHÔNG PHẢI CHỐNG GIAN LẬN — đừng đọc nó thành lời hứa kia.** Máy chủ không biết `atk`
của ai (cho nó biết là phải chở cả `calcDerived` lên đấy). Ba hàng rào là để **bó thiệt hại**:
**khoảng cách** (máy chủ có cả hai toạ độ ⇒ hàng rào THẬT), **nhịp** (`PVP_NHIP_MS` 120), và
**trần một cú**. Kẻ sửa client đánh đau hơn — nhưng không một phát chết, không đánh xuyên map,
không bắn 100 phát một giây.

**⚠ CHỈ ĐÒN THƯỜNG.** Chiêu thức đi qua `hurtMob` ở hàng chục chỗ, mỗi chỗ một hình học riêng;
nối tất cả vào PvP là một đợt việc riêng. Nói ra thay vì nối nửa vời — một chiêu nổ trùm qua
người mà họ không mất máu là đúng cái "hứa suông" mà luật `pham` đã cấm.

**Năm chỗ đã vấp, ghi lại:**
1. **`return` giữa `update(dt)`.** Nhánh PvP của `pendingHit` nằm **trong** `update`, không phải
   trong một hàm riêng — một `return` ở đó bỏ qua toàn bộ phần còn lại của khung (đạn, hồi chiêu,
   nhặt đồ, sự kiện) và **chỉ ở đúng cái khung có một cú đánh PvP tới hạn**. Nhìn ra là "game
   giật một cái mỗi lần đánh", không ra một lỗi. Phải là `else`.
2. **Reset máu trận phải hỏi TRƯỚC dòng `curMap = mapId`** trong `travelTo` — sau dòng ấy thì
   `curMap` đã bằng `mapId` và điều kiện không bao giờ đúng.
3. **Cộng vào một bộ đếm RIÊNG (`st.pvpHit`), đừng ghi đè `st.hitSeq`.** `capNhat` ghi `hitSeq`
   từ client ở mỗi gói `pos` (10 Hz), nên cộng thẳng vào đó là mất ngay ở gói kế tiếp. Nhờ bộ
   đếm riêng, cú giật của người bị đánh đi qua **đúng sợi dây `hs` đã có** — không thêm cơ chế.
4. **Báo máu trận NGAY LÚC VÀO, đừng đợi cú đánh đầu tiên.** Ảnh chụp chở `ph/pm` của người
   KHÁC nhưng không bao giờ chở của chính mình ⇒ người vừa vào nhìn thanh máu của **trận trước**
   cho tới lúc ăn đòn. Và `pvpMax = 0` lúc cú đầu bay tới thì trần một cú (tính theo `pvpMax`)
   cũng bằng 0 ⇒ cú đầu tiên kẹp xuống 1 sát thương.
5. **Trong sàn đấu, `doBasic` phải chạy tới NGƯỜI khi ngoài tầm.** Sàn không có con quái nào nên
   nhánh cũ rơi thẳng xuống câu *"không có quái trong tầm — mở M hoặc Chọn Trận để tới bãi
   quái"*: đứng giữa sàn đấu mà game bảo đi tìm bãi quái, và nhân vật đứng im.

**Ba bài kiểm CŨ phải đi theo, và cả ba là "theo nội dung", không phải "nới luật":**
`test_thegioi §1` (sàn đấu không có chỗ trên bản đồ thế giới — nó không giáp vùng nào nên không
có hướng nào đúng để vẽ) · `test_domap` (mọi ngưỡng của bài đo *"map có đủ thứ để làm không"*,
mà sàn đấu **cố ý** không có gì — cách duy nhất làm nó xanh là nhét một bãi quái vào sàn đấu,
tức làm hỏng chính cái map) · cả hai lọc bằng `md.pvp`. `test_noimap` thì **xanh sẵn** và đó là
bằng chứng cổng chạy: nó lan theo đúng đường người chơi và tới được `pvp`.

**⚠ MAP CỐ Ý RỖNG.** Không `vung`, không `herbs`, không `boss`, không `thu` — nên Rương Canh và
Vỉa Cốt tự vắng mặt (cửa duy nhất của cả hai là *"map có bãi quái"*). Nhét một bãi quái vào đây
là biến sàn đấu thành một map cày có thêm người, và mọi thứ người chơi tới đây để làm sẽ bị AUTO
làm hộ. `packs: []` / `duhiep: null` vẫn phải khai **tường minh** — `packsOf()` đọc `md.packs` và
`.map(...)` trên `undefined` ném ngay giữa vòng dựng thế giới.

**⚠ Sàn đấu KHÔNG mở điểm dịch chuyển** (`travelTo` loại cả `md.dungeon` lẫn `md.pvp`): mở ra thì
bảng Bản Đồ có một nút dịch chuyển thẳng vào giữa một trận đang đánh.

### ✦ VFX CHIÊU CỦA NGƯỜI BÊN KIA — và nó là HÌNH, không phải ĐÒN

Trước bản này `castT` đã đồng bộ nên người bên kia thấy **tư thế** niệm mà không thấy một tia lửa
nào: đứng cạnh một Dark Wizard thả Meteorite thì trên màn chỉ có người vung tay trong khoảng không.

| | |
|---|---|
| Cửa gửi | **bên trong `spawnSkillVfx`** — `window.netChieuGui()` |
| Cửa nhận | `window.netChieuNhan(d)` trong `game.js` |
| Dây | `window.netChieu` gửi · tin `chieu` nhận, trong `net.js` |
| Máy chủ | `nhanChieu()` · `CHIEU_CUA` 12 gói / `CHIEU_CUA_MS` 2000 |
| Gác | `tests/test_vfxchieu.js` (6 mệnh đề, **cả sáu đã thử ngược và đều đỏ**) |

**⚠ GỬI TỪ TRONG `spawnSkillVfx`, ĐỪNG MÓC TỪNG CHỖ GỌI.** Có **chín** chỗ gọi nó; móc tay từng
chỗ là chỗ thứ mười thêm sau sẽ lặng lẽ không đồng bộ — cùng cái bẫy đã ghi cho `dailyTrack()` và
`mobDoBuoc()`. Gửi từ bên trong thì **chiêu mới thêm tự có mặt**, và `test_vfxchieu §1` gác đúng
chỗ đó bằng cách gọi thẳng `spawnSkillVfx` (không qua `castSkill`) rồi đòi nó phải gửi.

**⚠ `spawnSkillVfx(id, v, phase, ang, R, x0, y0, nguoi)` — `nguoi` là tham số CUỐI và mặc định là
người chơi này.** Trong thân hàm có **10 chỗ đọc `player.x` và 10 chỗ đọc `player.y`**; thiếu bước
đổi chúng sang `_p` thì chiêu của người khác nổ **dưới chân MÌNH** — vẫn "có vẽ ra", nên một mệnh
đề chỉ đếm số hiệu ứng sẽ XANH suốt. `§2` đo khoảng cách tới **cả hai** người rồi đòi hiệu ứng
phải gần NGƯỜI NIỆM hơn; thử ngược ra `0 vs 120px`.

**⚠ `vongKiemVuKhi(p)` cũng phải nhận người niệm** — nếu không, vòng kiếm của người khác vẽ bằng
**vũ khí của mình**. Cùng họ với lỗi `wingDef` mọc cánh sai lớp: hình vẫn vẽ ra, chỉ là sai người.

**⚠ VÀ ĐÂY LÀ THỨ LÀM CẢ ĐỢT NÀY AN TOÀN: VFX KHÔNG GÂY SÁT THƯƠNG.** Vòng cập nhật `effects` chỉ
cộng `e.t`, dời hạt và quay — không một lời gọi `hurtMob` nào. Sát thương nằm ở `castVohoc` /
`castSkill`, tách hẳn. Nên chiêu của người khác nổ trên máy mình thì quái của mình **mất đúng 0
máu**. `§3` là mệnh đề nặng nhất; thử ngược (nối `hurtMob` vào nhánh nhận) ra `893 → 888`.
**Đừng "tiện tay" nối sát thương vào đây** — PvP cố ý mới chỉ có đòn thường.

**Ba lỗi của chính BÀI KIỂM, cả ba cho ra một bài XANH VÌ LÝ DO SAI** — ghi lại vì cùng một họ:

1. **Đếm `effects.length` là đếm SỐNG SÓT, không phải đếm NHẬN.** Hiệu ứng hết hạn sau 0,4-0,7 s,
   mà phép chờ là 600 ms — nên `§6` xanh kể cả khi đã **gỡ hẳn** hạn nhịp của máy chủ. Nay bọc
   `window.netChieuNhan` mà đếm lời gọi.
2. **Mục trước bắn dồn làm nghẽn mục sau.** `§3` bắn 8 gói trong ~1 giây, đầy cửa 12/2 s của máy
   chủ, nên cú của `§4` bị **bỏ qua** — B nhận 0, và "B không gửi ngược" thành một câu vô nghĩa.
   Nay có `choCuaTroi()` và **chốt tự kiểm**: chưa nhận được gì thì không được chấm.
3. **NGƯỜI NIỆM CHẾT GIỮA BÀI.** Đo được ở `§5`: A ra `{dead:true, hp:0}` — nó đứng giữa bãi quái
   `daohoa` suốt 15 giây. Mà `castSkill` `return` ngay dòng đầu khi `dead`, nên mọi mục sau đó đo
   trên một xác chết và đọc ra "sợi dây đứt". Nay `vao()` dời quái ra góc map (giữ lại để `§3`
   kéo về), và `tung()` trả `null` khi đã chết.

**⚠ VÀ MỘT QUE DÒ HỎNG SUÝT LÀM TÔI KẾT LUẬN NGƯỢC.** `§5` (lọc theo map) có **hai lớp** gác: lọc
ở máy chủ *và* chốt `!np` ở client. Gỡ một lớp thì lớp kia đỡ ⇒ bài vẫn xanh ⇒ trông như mệnh đề
rỗng. Nhưng gỡ **cả hai** thì nó đỏ ngay (`nhận 12 gói`). *Một phép thử ngược im lặng là bằng
chứng cái QUE DÒ chưa chạm đúng chỗ, không phải bằng chứng mệnh đề yếu* — đúng câu đã ghi ở mục
`test_hethong`.

**⚠ `x0/y0` là TOẠ ĐỘ THẾ GIỚI TUYỆT ĐỐI**, không phải độ lệch so với người niệm (`diemGiang()`
trả tuyệt đối). Và máy chủ phải **giữ được `null`**: `x0 == null` nghĩa là "nổ ngay tại chỗ người
niệm", khác hẳn "nổ tại (0,0)" — tức góc bản đồ.

### ⚔ SÀN ĐẤU CÓ BỘ VIÊN RIÊNG — và ẢNH CHỤP mới bắt được cái sai, số đo thì không

Sàn đấu dựng xong thì đi **mượn** viên của Ardhaven (`nen_da` + `nen_soi`), nên đứng trong đó nhìn
ra y hệt một góc phố. Nay có bộ riêng, nướng bằng **`tools/iso/nuong_sandau.py`**.

| | trước | sau |
|---|---|---|
| nền | `nen_da` — 163,6/139,1/115,3 · sáng **139,3** · ấm (B−R −48) | `nen_sanda` — 80,3/87,4/100,7 · sáng **89,5** · **lạnh** (B−R +20) |
| lối | `nen_soi` · sáng 126,9 | `nen_sanmai` · sáng **129,1** |

**⚠ `isoDat` ở đây SÁNG HƠN `isoCo`, ngược mọi map khác.** Ở map hoang dã lối mòn sẫm hơn (đất lộ
ra dưới cỏ); ở đây là đá bị đế giày **mài nhẵn** suốt bảy trăm buổi sáng nên nó BÓNG lên. Đảo
chiều ấy là thứ làm vòng giữa sàn đọc ra một *vòng mài* chứ không ra một *vũng bùn*. Khoảng cách
sáng nền↔mài đo được **39,6** — rộng hơn Ardhaven (28,8) vì nền sàn đấu sẫm, mà trên nền sẫm mắt
phân biệt kém hơn hẳn (bài học Bird Tribe Heights, đảo đầu).

**⚠⚠ VÀ ĐÂY LÀ CHỖ SỐ ĐO NÓI DỐI.** Lượt đầu tôi rải **70 hòn `da1-3` sẵn có** cho đủ ngưỡng của
`test_isoneo`. Bài xanh, số đạt — mà **chụp ra thì mặt sàn đọc thành một BÃI ĐÁ VỤN BỎ HOANG**,
trong khi cả map kể chuyện một sân còn được quét dọn mỗi sáng. Đá sẵn có vừa to vừa **trùng tông
với vòng mài** nên nó là thứ mắt bắt trước tiên. Nay `nho_san1-3` nhỏ hơn hẳn và **SẪM hơn nền**
(0,30/0,32/0,36 so với nền 0,40/0,42/0,46) ⇒ đọc ra vết sứt trên đá phiến, và làm luôn cái **mốc
tương phản sẫm** mà bài học kia đòi. Số lượng 70 → **46**.
*Một ngưỡng đếm được thoả mãn bằng thứ sai — đó là lý do luật "vẽ xong phải render ra ảnh mà
nhìn" có mặt trong tài liệu này.*

**⚠ BỘ NƯỚNG TỪNG NỔ Ở DÒNG CUỐI MÀ KHÔNG AI THẤY.** `nuong_biome.py` và `nuong_sandau.py` đều nạp
`nuong_tile.py` bằng `exec` vào một dict globals tự dựng — mà dict ấy **không có `__file__`**, nên
`ghi_neo()` ném `NameError` **sau khi đã nướng xong hết**. Tức ảnh ra đủ, mọi dòng `NUONG XONG` đã
in, mà **bảng neo thì không được ghi** — đúng cái dạng hỏng đã xoá sạch cây của sáu map một lần
rồi. Đã vá cả hai tệp (thêm `'__file__'` vào `NT`). Đo lại: `ISO_NEO` 60 → **63** sprite.

### 🧪 `/net` — CÔNG CỤ THỬ TẦNG ONLINE, và **BÓNG GIẢ** thay cho cửa sổ thứ hai

| | |
|---|---|
| Cửa mở | console cũ, phím `` ` ``, vẫn khoá sau **`?test=1`** — chạy `?test=1&net=1` để có cả hai |
| Lệnh | `/net` · `/net ds` · `/net toi [id\|tên]` · `/net ma [n]` · `/net ma danh\|chieu\|nga` · `/net xoa` · `/net hud` · `/net pvp` |
| Máy | `window.NET_MA` · `netMaTao()` · `netMaXoa()` · `netMaDong()` · `netMaNhip()` · `drawNetHUD()` |
| Gác | `tests/test_netma.js` (5 mệnh đề, **bốn cơ chế đã thử ngược và đều đỏ**) |

**⚠ CONSOLE KHÔNG MỞ THEO `?net=1`, và đừng "tiện tay" nối vào.** Hai cờ đọc hai tham số khác
nhau (`TEST_MODE` đọc `test|max`, `net.js` đọc `net`), nên `?test=1&net=1` bật cả hai — đó là
đường thử. Cho `?net=1` tự mở console là phát lệnh gỡ rối cho **mọi người đang chơi thật trên
cùng máy chủ**, mà `cheatExec` thì CLAUDE.md đã ghi là phải gỡ trước khi có bất cứ thứ gì chung.

**⚠ `/net toi` LÀ LỆNH ĐÁNG GIÁ NHẤT, vì nó bác bỏ một cái bẫy đã ăn nguyên một vòng chẩn đoán.**
Mọi nhân vật mới hiện ra ở ĐÚNG một điểm, nên hai cửa sổ vừa vào game là hai thân **chồng khít
lên nhau lệch 0,0px** — kết nối chạy hoàn hảo mà nhìn ra "không thấy ai". `/net ds` in khoảng
cách, `/net toi` dời mình sang **đứng CẠNH** (lệch 110px, cố ý không đứng đè: đứng đè đúng là
cái đang muốn gỡ).

**⚠ BÓNG GIẢ CHỈ SỐNG TRÊN MÁY NÀY.** Không gói tin nào mang chúng đi — `gui()` chỉ gửi
`netDoc()`, tức người chơi của mình. Đừng nối chúng vào đường gửi: đó là dựng đúng cái cửa cho
một client sửa đổi bơm người giả vào màn của người khác. Chúng cũng **không** có máu thật, không
bị nhắm, không đánh được — cùng lý do đàn thú hoang vô dụng: *giá trị của một vật thử nằm ở chỗ
nó không phải nội dung.*

**⚠ HAI ĐƯỜNG PHẢI NỐI RIÊNG, và chúng hỏng theo hai kiểu khác nhau:**

| | ai dựng lại `NETPLAYERS` | thiếu chỗ nối thì |
|---|---|---|
| **không** mạng | không ai — `net.js` `return` ngay đầu tệp | `/net ma` im lặng không vẽ gì, ở đúng đường chơi một mình mà người ta thử TRƯỚC |
| **có** mạng | `capNhatMang()`, mỗi ảnh chụp (10 Hz) | bóng giả vẽ được đúng một nhịp rồi biến — đọc ra "tầng vẽ hỏng" |

Nên `netMaDong()` (game.js) tự đổ vào cho đường đầu, và `capNhatMang()` nối `NET_MA` vào đuôi
cho đường sau. Thử ngược từng chỗ đều đỏ đúng mệnh đề của nó.

**⚠ `netThanNhip()` LÀ MỘT LUẬT, HAI CHỖ GỌI.** `noiSuy()` gọi nó cho thân người THẬT, `netMaNhip()`
gọi nó cho bóng giả. Trước bản này phép đếm ngược ba đồng hồ hoạt cảnh + `deadT` nằm thẳng trong
`noiSuy`; giữ nguyên rồi chép sang cho bóng giả là bóng giả diễn một kiểu còn người thật diễn một
kiểu — mà bóng giả sinh ra **chính để thử đường vẽ của người thật**, nên hai bên lệch nhau là công
cụ thử nói dối. Cùng lý do `thanNhip` tồn tại.

**⚠ Ba đồng hồ ấy vẫn đếm ngược trong `netThanNhip`, KHÔNG được dời vào `thanNhip`** — `thanNhip`
thì cả người chơi của mình lẫn thân người từ xa cùng gọi, nên đặt vào đó là mình bị trừ hai lần.

**Hai lỗi của chính QUE DÒ, cả hai cho ra một phép đo vô nghĩa** — ghi lại vì cùng họ với những
cái đã ghi ở mục `test_dongbodo`:
1. **Quên tỉ lệ bộ đệm/CSS.** Canvas 2560×1500 trên khung nhìn 1280×800 ⇒ `tl` = 2. Công thức
   đúng là `screen = (thế giới − camera) × zoom`, **rồi mới** nhân `tl`. Thiếu bước hai là đo
   vào một ô lệch hẳn chỗ: ra 190 điểm ảnh, trông y như "vẽ được một tí".
2. **Ô đo và ô đối chứng ra BẰNG NHAU TUYỆT ĐỐI (224 = 224).** Cả hai toạ độ âm nên
   `getImageData` kẹp về góc trên-trái ⇒ hai ô là **cùng một vùng**. Đó là bằng chứng cảnh dựng
   hỏng, không phải bằng chứng cơ chế hỏng. `test_netma` nay tự kiểm `trongKhung` trước khi chấm.
   Sau khi sửa: **6.869 điểm ảnh đổi ở ô có bóng, 121 ở ô đối chứng.**

### Còn nợ, biết rõ

| | |
|---|---|
| Niệm chú của thân người từ xa | `castT` đã đồng bộ, nhưng VFX của chiêu thì chưa — bên kia thấy tư thế niệm mà không thấy chiêu nổ |
| Thân người từ xa không chở `avatar` khi ai đó đổi giữa chừng… | …thật ra CÓ (`g.av`, ba trạng thái `undefined`/`null`/id). Chỗ còn thiếu là **con Axie không có hoạt cảnh ĐÁNH** — xem "Nợ" ở mục Đổi Vai |
| `cheatExec` vẫn ship | Giai đoạn 0 chưa làm. Vô hại ở bản offline; phải gỡ trước khi có bất cứ thứ gì chung |
| Sandbox không SSH được vào VPS | mọi bước cài Node/nginx/systemd phải do chủ dự án chạy tay |

### ⚠ CRON TRIỂN KHAI SẼ KHÔNG KHỞI ĐỘNG LẠI MÁY CHỦ

`/root/deploy-axiewuxia.sh` chạy `git reset --hard` mỗi 2 phút **trên chính cây mà máy chủ đang
chạy từ đó**. Mã đổi dưới chân một tiến trình đang chạy, mà nó không tự khởi động lại — nó sẽ
chạy bản cũ mãi mãi và **không có gì báo**.

Cài bằng **`deploy/capnhat-deploy.sh`** — chạy một lần trên VPS bằng root, tự sao lưu, tự kiểm
cú pháp, chạy lại nhiều lần vô hại.

**⚠ ĐỪNG dán một dòng `systemctl restart` trơn vào đó.** Tôi đã viết đúng cái sai ấy một lần:
cron chạy script deploy **2 phút một lần, BẤT KỂ có commit mới hay không**, nên một dòng restart
vô điều kiện là **đá mọi người đang chơi ra khỏi game mỗi 2 phút**. Triệu chứng người chơi mô tả
sẽ là "cứ vài phút lại mất kết nối", và không ai nghĩ tới script deploy.

Mốc so sánh đúng là **commit cuối cùng chạm `server/` hoặc `package.json`**:

```bash
MOC_BN=/root/.bongnguoi-ver
VER_BN=$(git -C /var/www/axiewuxia log -1 --format=%H -- server/ package.json 2>/dev/null)
if [ -n "$VER_BN" ] && [ "$VER_BN" != "$(cat "$MOC_BN" 2>/dev/null)" ]; then
  echo "$VER_BN" > "$MOC_BN"
  /usr/bin/systemctl is-active --quiet bongnguoi && /usr/bin/systemctl restart bongnguoi
fi
```

Nhờ vậy deploy chỉ đổi art/`game.js` — **trường hợp thường gặp nhất của dự án này** — không ngắt
kết nối của ai. `is-active` giữ nguyên: chưa bật dịch vụ thì đừng bật hộ.

## Test

### 🚦 245 BÀI NAY LÀ CỔNG CI — và lượt chạy đầu tiên ra **0/245 xanh**

`.github/workflows/game.yml` chạy cả bộ trên GitHub Actions, **6 mảnh song song** (`SHARD=i/n`
trong `reg.sh`, chia theo SỐ DƯ chứ không theo khối liền). Cả bộ xong trong **~6 phút**.

**⚠⚠ LỚP LỖI LỚN NHẤT KHI ĐEM BỘ KIỂM RA KHỎI SANDBOX: ĐƯỜNG DẪN TUYỆT ĐỐI CHÉP CỨNG.**
Lượt CI đầu tiên đỏ **cả 6 mảnh trong 18 giây** — 0,37 giây một bài, tức chưa một khẳng định
nào chạy. Ba chỗ, cùng một họ với vết sẹo "bốn bài chép cứng cổng 8853":

| chép cứng | bao nhiêu bài | hỏng thế nào trên máy khác |
|---|--:|---|
| `executablePath: '/opt/pw-browsers/chromium'` | **240/245** | `chromium.launch()` ném ngay |
| `require('/opt/node22/lib/node_modules/playwright')` | 2 | `require` ném ở dòng đầu |
| `'/home/user/axiewuxia'` làm gốc kho | 2 | `GOC = null` ⇒ mục quét tệp **rỗng ruột** |

⇒ Trình duyệt vá ở **`reg.sh`** (nó vốn đã viết lại cổng lúc chép bài sang `$OUT/src`), và nó
**hỏi thẳng playwright** `chromium.executablePath()` chứ không đoán. Gốc kho thì hỏi
**`AXIE_REPO`** — biến `reg.sh` đã xuất sẵn từ lâu cho đúng việc này.
⚠ MỘT luật sed, đuôi dài là TUỲ CHỌN: viết hai luật (dài trước, ngắn sau) thì luật ngắn ăn tiếp
vào KẾT QUẢ của luật dài và nối đường dẫn thành đôi.

**⚠ ARTIFACT TẢI QUA BLOB STORAGE — nhiều môi trường không với tới.** Nên workflow có bước
**in thẳng `tail -60` của từng bài đỏ** vào log CI. Không có nó thì đọc log chỉ thấy TÊN bài đỏ
rồi phải đoán, mà đoán một lượt là mất một vòng đẩy-chờ-đọc 6 phút.

**⚠ MÁY CI CHẬM HƠN VÀ CHẠY 6 MẢNH SONG SONG ⇒ nó lôi ra đúng lớp mệnh đề "chờ N mili-giây".**
Bốn bài đỏ ở CI mà xanh ở máy này, và **không bài nào là ngẫu nhiên thật** — cả bốn là QUE DÒ
hỏng (xem bảng xúc xắc bên dưới). *Vì thế `reg.sh` CỐ Ý không chạy lại bài `rc=1`: một cái cổng
"đỏ thì chạy lại" sẽ giấu sạch cả bốn.* Chỉ `rc=124` (đồng hồ của chính bộ chạy) mới được chạy
lại, và nó in ra tên bài đã phải chạy lại.


Playwright + server tĩnh:
```bash
cd public/game && python3 -m http.server 8853
NODE_PATH=/opt/node22/lib/node_modules node <test>.js   # playwright cài global
```
Trong test: `window.TEST_MODE = true; startGame('<sect>', null);` rồi gọi thẳng hàm game
(`calcDerived()`, `castSkill()`, `update(0.1)`...).

⚠ **BÀI KIỂM SAI CÚ PHÁP KHÔNG ĐỎ Ở MỘT KHẲNG ĐỊNH NÀO** — nó chết lúc nạp mô-đun, và `reg.sh`
chỉ thấy `rc=1` kèm một vết ngăn xếp của Node. Đã ship đúng thế một lần, và nguyên nhân nhỏ đến
mức buồn cười: sửa một câu **THÔNG BÁO** rồi để dấu huyền quanh `player.def = DIEM_KHOI_DAU`
trong một template literal. Bài đó thôi gác gì suốt cả một lượt hồi quy 40 phút.
⇒ `tools/cua_kiem.sh §①` nay `node --check` **mọi** tệp trong `tests/`. Rẻ hơn hẳn việc phát
hiện ở phút thứ 40. *Sửa một chuỗi trong bài kiểm vẫn là sửa MÃ.*

⚠ Bài kiểm dùng `require()` phải chạy **ngoài cây repo** (`package.json` khai `"type":"module"`).
`reg.sh` chép chúng sang `$OUT/src/` nên nó không dính; chạy lẻ bằng `node tests/x.js` thì dính,
và lỗi báo ra không nhắc gì tới ESM.

⚠ Khi nhảy thẳng `player.level` trong test, phải tự gọi `vhAutoLearn()` — game thật gọi nó qua
`gainXp()` → `unlockNotices()` mỗi lần lên cấp.

### ☠☠ BÀI KIỂM IN "FAIL" MÀ THOÁT 0 — `reg.sh` ĐẾM NÓ LÀ XANH

`tools/reg.sh` chấm đỏ/xanh **bằng MÃ THOÁT** (`rc=$?`). Một bài kết thúc bằng
`console.log(ok ? 'PASS' : 'FAIL')` rồi hết hàm thì Node thoát **0** — tức nó in ra chữ FAIL
ở giữa log và bảng tổng kết vẫn đếm nó là XANH. **Hai bài đã sống như thế rất lâu**
(`test_story` · `test_mobbalance`), và lượt hồi quy gần nhất báo `206/206 xanh` trong khi cả hai
đang tự nhận là hỏng.

⇒ **Bài nào in ra một PHÁN QUYẾT thì bắt buộc phải `process.exit(ok ? 0 : 1)`.** Đã rà cả bộ
và vá sáu bài cùng họ: hai bài trên, cộng `test_flinch` · `test_golden` · `test_hero` ·
`test_moblevels` (bốn bài này đang XANH thật, nhưng chúng sẽ câm đúng kiểu ấy vào ngày chúng đỏ).
Quét lại bất cứ lúc nào:

```bash
cd tests && for f in test_*.js; do grep -qE 'process\.exit' "$f" || \
  grep -lE "'FAIL'|\"FAIL\"|'PASS'" "$f"; done
```

**Và cái giá thật không nằm ở mã thoát — nó nằm ở chỗ KHÔNG AI ĐỌC LOG CỦA MỘT BÀI XANH.**
Cả hai bài đều đỏ vì **cảnh dựng đã mục**, không phải vì sản phẩm hỏng, và mỗi thứ mục đi
một kiểu — đây mới là phần đáng nhớ:

| bài | khẳng định đỏ | nó là gì |
|---|---|---|
| `test_story` | `questCount === 35` | chuỗi nay **51** mục — con số chép cứng đã mục |
| `test_story` | `idsContiguous` (`v === i+1`) | id nay là **chuỗi `c<chương>q<số>`**, không còn là số 1..N |
| `test_story` | `allHaveText` (`need > 0`) | **LỖI THẬT** — `c8q1` là mục `talk` duy nhất trong 11 mục thiếu `need:1` |
| `test_mobbalance` | 12 chỗ "gần cổng không hạ được" | **cả 12 đều là lỗi của PHÉP ĐO** — xem ba ý dưới |

**⇒ `questCount === 35` đổi thành SÀN (`>= 40`), không đổi thành 51.** Thay 35 bằng 51 chỉ là
lên dây lại đúng quả mìn đó: thêm một nhiệm vụ là bài đỏ vì một lý do chẳng liên quan gì tới thứ
nó định gác. Thứ nó định gác là *chuỗi bị cụt hay rỗng đi trong im lặng* — sàn bắt đúng chuyện
đó, còn phần "không thủng ở giữa" thì `idsHopLe` gác chặt hơn hẳn một con số tổng: id phải đúng
khuôn `c<chương>q<số>`, không trùng, số thứ tự trong mỗi chương phải 1..N, chương phải gom
thành khối và đi 0,1,2,… **và tiền tố `cN` phải khớp con số in trên nhãn chương** (một mục mang
id `c5q1` mà nhãn ghi "IV · …" là đúng kiểu lỗi chép-dán khi chèn thêm mục, và `reqMain` là CHỈ SỐ
nên nó trượt theo trong im lặng).

**⇒ `test_mobbalance` đã đo SAI ba thứ cùng lúc**, và mỗi cái là một bài học riêng:

1. **Bảng `CASES` chép cứng cấp map.** Nó ghi `['daohoa', 1]` — đúng hồi Đào Hoa là map khởi đầu.
   Nay `daohoa` là Plant Tribe Glade `min: 36`, map khởi đầu là `corran`. Tức bài thả một nhân vật
   **cấp 1 vào giữa bầy quái lv38** rồi kết luận là cân bằng hỏng. Bảng còn bỏ sót 4 map có bãi quái.
   ⇒ Suy từ `md.min` và từ chính `MAPS`; thêm map mới là tự có mặt.
2. **Đo NHÂN VẬT TRẦN.** CLAUDE.md đã ghi nguyên văn cho `XP60PLUS_ANCHORS` rằng đo "không trang bị"
   thì từ cấp 10 trở lên nhân vật chết trước khi giết được con nào — **bài này đang làm đúng cái đó.**
   Đo lại cả hai lối trên cùng một lượt chạy: trần **6/33** chỗ hỏng, mặc đồ đúng cấp **0/33**.
3. **`m.hp = def.hp` ĐÈ LÊN MÁU THẬT — nặng nhất.** `def.hp` trong `MOBS` chỉ là **trọng số tương đối**
   ("con này dày hơn bạn cùng cấp"); máu thật do `mobHp(def)` tính qua cả đường cong cân bằng.
   Đo ở `bandao`: `def.hp` **1790** vs `mobHp` **744** ⇒ mọi trận dài gấp **2,4 lần** thực tế, và
   `m.maxHp` thì vẫn 744 nên máu còn lớn hơn máu trần. *Một bài tên là "mobbalance" mà đo những con
   số hệ cân bằng không dùng tới.* ⇒ Để `spawnMob` quyết máu; nó là cửa duy nhất.

**⚠ VÀ KHI ĐO LẠI CHO ĐÚNG THÌ NHIỄU LỘ RA.** Với một lượt bốc đồ, biên máu còn lại mỏng nhất ra
48% · 50% · 43% qua ba lượt chạy — chỉ dư 3 điểm trên sàn 40%, tức sẽ đỏ vì xúc xắc. Nhiễu dồn
vào đúng MỘT cảnh (`Axie Sa Ngã` lv38 ở cửa `daohoa`/`loimon`): cùng cảnh ấy, bảy lượt bốc đồ ra
dải **17–52%** và thời gian hạ swing 4,2s → 25s, trong khi một cảnh lành chỉ dải 2 điểm.
Chữa bằng cách **HẠ NHIỄU, không hạ sàn** — lấy trung vị của `LOT` lượt bốc đồ. Đo để chọn `LOT`
chứ đừng đoán (biên dư trên sàn, ba lượt mỗi mức):

| | dư trên sàn 40% | thời gian |
|---|---|---|
| `LOT=1` | 8 · 10 · **3** | 12s |
| `LOT=3` | **2** · 8 · 5 | 26s |
| `LOT=5` | 13 · 16 · **6** | 38s |
| **`LOT=7`** | **13 · 10 · 12** | 50s |

⇒ `LOT = 7`, và bài **in ra biên còn lại** mỗi lượt để thấy nó mỏng đi *trước* khi nó đỏ — một bài
chỉ nói PASS/FAIL thì không ai biết mình đang đứng cách vực bao xa. 50 giây còn rất xa trần 260s.

**⚠ CẢ HAI BÀI NAY TỰ KIỂM CẢNH DỰNG TRƯỚC KHI CHẤM.** `test_mobbalance` đòi mỗi cảnh phải có bãi
quái **và đã mặc ≥ 4 ô đồ** — vì cách hỏng dễ nhất là rơi ngược về đúng phép đo "nhân vật trần"
vừa gỡ. Thử ngược: cho `autoEquipBest` thành no-op ⇒ chốt tự kiểm bắt (`ô đồ đã mặc: 0`), không
phải một mệnh đề nào đỏ nhầm.

**⚠ `questPanel`/`storyTab` của `test_story` TRƯỚC ĐÂY ĐƯỢC ĐO RỒI VỨT ĐI** — hai biến ấy được
tính ở trong `evaluate` nhưng không có mặt trong phép tính `ok`, nên bảng Nhật Ký có thể vẽ ra
**rỗng** mà bài vẫn xanh. Nay tính vào (thử ngược: `renderQlog` vẽ rỗng ⇒ đỏ, `errors: []`).
*Một con số đo rồi không chấm thì nó không phải một khẳng định, nó là một dòng log.*

### ⏱ `rc=124` TRONG HỒI QUY LÀ ĐỒNG HỒ CỦA BỘ CHẠY, KHÔNG PHẢI MỘT KHẲNG ĐỊNH ĐỎ

Log của bài dính kiểu này **cụt giữa chừng** với `Target page … has been closed` chứ không có
dòng `FAIL` nào. Đã gặp **bốn bài khác nhau qua bốn lượt** — `test_chianh` · `test_bossplace` ·
`test_sandat` · `test_hudv` — và mỗi bài chạy RIÊNG xong trong **3-28 giây** với rc=0.

**Bốn giả thuyết đã kiểm và LOẠI** (ghi lại để đừng kiểm lại từ đầu):

| nghi | đo được |
|---|---|
| chạy chung với một lượt đo dài | tiến trình đó đã chết TRƯỚC lượt hồi quy đầu |
| máy hết RAM / đĩa | còn 14 GB rỗng · đĩa 29 GB |
| trình duyệt mồ côi tích lại | `ps` sau lượt chạy: 0 tiến trình chrome |
| server tĩnh nghẽn một luồng | `python3 -m http.server` đã là `ThreadingHTTPServer` từ Python 3.7 |

Nguyên nhân cuối cùng **chưa tìm ra** — đừng giả vờ là đã. `tools/reg.sh` nay xử đúng mức đó:
gặp `rc=124` thì **chạy lại đúng một lần**, ghi tên vào `chaylai.txt` và **in ra cuối** dòng
`ĐÃ CHẠY LẠI`. Lượt hai vẫn 124 thì vẫn tính đỏ. *Một bộ kiểm im lặng nuốt lỗi thì tệ hơn một
bộ kiểm nói ra là nó đã phải chạy lại.*

⚠ **BỐN BÀI CHÉP CỨNG CỔNG, chạy lẻ ngoài `reg.sh` là ĐỎ GIẢ.** `test_phutdau` (8861) ·
`test_nowuxia2` (8861) · `test_bonho` (8871) · **`test_gearlook` (8853)** mở thẳng `http://localhost:<cổng>/index.html` và
**không đọc argv**. Chạy riêng mà quên dựng server đúng cổng thì lỗi báo ra là
`ERR_CONNECTION_REFUSED` ở dòng `page.goto` — trông y như bài hỏng, mà thực ra chưa một khẳng
định nào chạy. Đã mất một vòng chẩn đoán vì chuyện này: tôi đọc "3/3 đỏ" rồi suýt kết luận là
lỗi tất định của commit mình. **Trước khi tin một lượt chạy lẻ, hỏi log xem nó có tới được trang
không.**

⚠ **Dọn trình duyệt mồ côi bằng lọc `ppid=1`, TUYỆT ĐỐI không `pkill -f chrom`.** Mẫu đó khớp
luôn dòng lệnh của chính shell đang chạy rồi giết nó (thoát 144) — cùng vết sẹo đã ghi ở mục
git bên dưới, và nó đã bị dẫm lại một lần nữa trong phiên gần đây.

⚠ **Biến thể độc nhất của cùng cái bẫy: `pkill -f` NẰM CHUNG DÒNG LỆNH với thứ mình muốn chạy.**
`pkill -f "http.server 8853"; bash tools/reg.sh …` — chuỗi `http.server 8853` có mặt trong dòng
lệnh của chính shell đang chạy cả hai, nên `pkill` giết luôn shell và **`reg.sh` không bao giờ
khởi động**. Triệu chứng: thoát **144**, `$OUT` không tồn tại, không một dòng log nào. Rất dễ đọc
nhầm thành "bộ kiểm hỏng". Tắt server thì tìm pid **theo CỔNG** (`ss -lptn "sport = :8853"`), đừng
tìm theo chuỗi lệnh.

⚠ **MẤY BÀI ĐỎ THEO XÚC XẮC — đã đo, phần chưa sửa tận gốc nằm ở mấy dòng KHÔNG gạch ngang.** Ghi ra để người sau đừng mất
một buổi truy lại từ đầu, và đừng vội đổ cho commit của mình:

| bài | dấu hiệu | đã đo được |
|---|---|---|
| `test_ngamchuot §4` | *"con quái cạnh chân cũng mất máu"*, `ganMat` = **đúng 1** | xanh 3/3 khi chạy riêng · mục này **đã** `player.reflect = 0` rồi, nên 1 máu ấy tới từ nguồn KHÁC, chưa truy ra. Ngưỡng là `ganMat > 0` nên đúng một điểm máu của một cơ chế khác cũng đủ làm đỏ |
| `test_tamphap §3` | *"số lần bị khoá chân không giảm hẳn (47 → 28)"* | xanh 3/3 khi chạy riêng · đây là phép đo THỐNG KÊ, mẫu mỏng |
| `test_phutdau §4` | *"bảo đảm rơi đồ vẫn áp dụng sau giai đoạn tân thủ — lạm phát đồ"* | xanh 3/3 khi chạy riêng (rơi 4/7 · 0/6 · 0/6); lượt đỏ bốc trúng **7/7**. Chốt là `roiThem >= haThem` với `haThem` chỉ 6-7 — vòng lặp xin 12 con nhưng `break` khi hết quái trong 400px. Tỉ lệ rơi cao thì 100% do may là chuyện thường. Muốn sửa tận gốc phải NỚI MẪU (bảo đảm đủ quái) hoặc đo thẳng `computeKillRewards` — nó là hàm THUẦN nên gọi 200 lượt là dứt điểm |
| `test_bophan §4` | *"nhánh BẤT LỢI: con sắc hơn phải mất nhiều máu hơn — 389069 vs 392734"*, có lượt đỏ **cả hai** nhánh | **đỏ trên CẢ HAI cây**: 4/9 lượt trên nhánh đang làm · **2/9 trên `origin/main`** ⇒ không phải do commit nào. Gốc là ĐỘ LỚN TÍN HIỆU: mục này chờ ~8% (ironshell 6/6 vs ridgehorn 2/6) nhưng đo thật chỉ ra **2-2,9%**, mà mỗi đòn mang `rnd(0.85,1.15)`. Tín hiệu nhỏ hơn nhiễu thì nó ĐỔI DẤU chứ không chỉ dao động — đúng cái bẫy "chọn cặp Axie quá gần nhau" mà chính mục này đã sửa một lần rồi và sửa chưa đủ. Muốn dứt điểm thì cộng dồn nhiều nhịp hơn (lối `test_hethu §2` đã làm: 900 nhịp) hoặc ghim `rnd` lúc đo, đừng nới ngưỡng |

✅ **`test_tamphap §2` (*"định thân KHÔNG khoá được chân: đi được 46px"*) ĐÃ SỬA TẬN GỐC** — ghi lại
vì nó là khuôn mẫu cho cả loại: **một mục đo trên cảnh mà mục TRƯỚC để lại.** `keoQuaiDanh` ghim
quái ngay sát người chơi và ép nó đánh 800 nhịp, rồi để nguyên nó đấy; khối đo định thân chạy tiếp
30 nhịp và giả định không ai đụng vào người chơi. Đo được ngay trước khối ấy: **2 con còn sống
trong 200px, con gần nhất cách 8px**. Một cú nện văng dời được người chơi vài chục px **kể cả lúc
đang bị khoá chân** (mục ③ đo được nó xảy ra 10/800 nhịp), và mệnh đề đọc ra thành "định thân
không khoá được". `dinhT` lúc đó vẫn còn 3,5 — tức chân BỊ khoá thật, thứ dời người là cái khác.

⇒ Nay mục ấy dời quái ra xa trước khi đo rồi trả về, và **tự kiểm** là đã dọn được (`quaiGan` phải
bằng 0) — bỏ bước dọn ra thì chốt tự kiểm đỏ ngay, đã thử. *Luật chung: mục nào đổi chỗ đứng hay
để lại quái thì mục sau phải dựng lại cảnh của mình, và phải chứng minh là đã dựng được.*

⚠ **Và đừng tin phép đo đầu tiên của chính mình.** Lượt dò đầu tôi đặt lại `player.x/y` về giữa map
trước mỗi lượt đo — tức dời người chơi ra xa đúng con quái cần quan sát, rồi đọc ra `quaiGan: 0` và
suýt kết luận "giả thuyết sai". Bỏ hai dòng đặt lại ấy thì ra `quaiGan: 2, gần nhất 8px`.
| `test_canbanglop §2` | *"chênh ST cao/thấp 4,42× > trần 3,6×"* | **xanh 3/3 trên cây đang làm VÀ 3/3 trên cây trước** — tức xúc xắc, không phải commit nào. Đo TB 3 lượt ra **2,63×** (cây nay) và **2,32×** (cây trước), đều sâu trong trần. Gốc: đồ rơi NGẪU NHIÊN + số lần chết là hàm bậc thang (mỗi lần chết `buildWorld()` hồi đầy cả bãi), nên ST tuy "trơn" hơn số mạng vẫn thừa hưởng phi tuyến ấy. Lượt đỏ bốc trúng DK 88.385 (dải thường 53-58k) và DW 19.999 ⇒ 4,42×. Chính đầu tệp bài ấy đã ghi ±22% tản — con số đó đo khi chưa ai chết 11 lần |
| `test_sandat` (nhanmon) | *"sau 3600 khung đuổi, 1 con nằm ngoài sàn: Cao Thủ Lang Thang — nhánh di chuyển nào đó thiếu collideObstacles"* | ⚠ **ĐÂY KHÔNG PHẢI NHIỄU, đây là một LỖI THẬT bắn thưa.** Xanh 3/3 chạy riêng · xanh ở lượt hồi quy liền trước ⇒ rất dễ đọc nhầm là xúc xắc rồi bỏ qua. Nhưng chính mệnh đề ấy sinh ra để bắt *một nhánh dời chỗ quái quên gọi `collideObstacles`*, và nó chỉ nổ khi hình học truy đuổi rơi đúng chỗ. Cần một đợt riêng: quét NĂM nhánh dời quái trong `update()` (xem cảnh báo `mobDoBuoc()`) rồi đối chiếu nhánh nào thiếu. Đừng nới ngưỡng, và đừng ghi nó vào đây rồi quên |
| ~~`test_dongbodo`/`test_bongnguoi §3c(b)`~~ | *"bật atkAnim mà hình chỉ đổi 148 điểm ảnh — lớp nhân vật không hiện ra"* | ✅ **ĐÃ SỬA, và nó che một MỆNH ĐỀ RỖNG.** ① Cảnh dựng tự phá mình: mục (a) dời B tới SÁT một con quái để lái cú đánh thật, rồi (b) đo ngay tại đó — B bị đánh liên tục, mà `_lopHien` đòi `!(hurtT>0)` nên lớp nhân vật không bao giờ vật chất hoá; thứ còn đổi chỉ là khối GIẬT của Axie (148 điểm ảnh: trên sàn nhiễu 19, dưới sàn mệnh đề 300). Đỏ hay xanh tuỳ con quái có kịp ra đòn trong 120ms ⇒ xúc xắc. ② Vá xong ① thì ra 5.638 và xanh — nhưng **thử ngược (`_lopHien = false`) VẪN XANH, 5.492**: từ đợt *"Axie NAY RA ĐÒN"*, bật `atkAnim` làm con Axie vung theo, nên phép đếm điểm ảnh bắt cú vung của Axie rồi dán cho nó cái nhãn "lớp nhân vật". ⇒ Hỏi thẳng `window.__veChet[khoá].lopHien`, **hai vế** (bật phải true, tắt phải false), kèm chốt tự kiểm "không có mục nào ⇒ QUE DÒ HỎNG". *Một mệnh đề đếm điểm ảnh đo MỌI thứ đổi trong ô đó — thêm một cơ chế mới cùng chỗ là nó lặng lẽ thành một cái nhãn dán sai.* |
| ~~`test_uigothic ⑥b`~~ | *"ở 60% máu, màu KHÔNG chạy tới sát mép (đỏ 38 vs nền rỗng 40)"* — chỉ đỏ trên CI | ✅ **ĐÃ SỬA. Thanh máu là một MỤC TIÊU DI ĐỘNG, và hai thứ đẩy nó ngược chiều nhau:** `.fill` có `transition .18s` (chụp sớm ⇒ bắt nó giữa đường) và `player.hp` **TỰ HỒI** mỗi khung với `updateHud()` chạy mỗi khung (chờ lâu ⇒ nó bò lên trên mức vừa đặt). Đo cả hai đầu: chờ 280ms cố định ⇒ `38 vs 40` trên CI; đổi sang "chờ tới khi bề rộng lắng" ⇒ hồi máu kéo thanh **vượt cả cột đối chứng 0,82**, ra `139 vs 147`. Cả hai lần bài đều báo "ảnh đang CO theo `.fill`" trong khi CSS hoàn toàn đúng. ⇒ **Tắt hẳn transition rồi chụp sau đúng hai nhịp vẽ, ép lại `hp` ngay trước khi chụp** — hai lượt ra 139/138. ⚠ Và phép thử ngược đầu tiên **im lặng vì đổi nhầm dòng CSS**: `style.css:196` là `.cd-thanh` (rãnh RỖNG), phần TÔ là `.cd-thanh .fill` ở dòng 203. Hồ sơ màu theo cột ở 60% cho thấy 0,58 là chỗ đo đúng — `auto 100%`: …0,58:**138** 0,62:140 ǀ 0,64:39… · `100% 100%`: …0,56:134 0,58:**34** 0,60:43… |
| ~~`test_khungchay`~~ · ~~`test_lopdo` mục 4~~ | đỏ SẴN trên `main`, không phải của PR nào | ✅ **ĐÃ SỬA — cả hai là CẢNH DỰNG MỤC, không phải lỗi game.** `test_khungchay` đo `baidasan` rồi đòi 32 tư thế, đúng hồi lớp ấy dùng `dwsc1`; nay nó dùng **`dwsl1`** (thân dựng từ ảnh render, `NV_KHUNG_R` khai **8**) nên chỉ số cuộn vòng. `test_lopdo` mục 4 mục ba chỗ: chép cứng `baidasan` (nay không có lớp rời) · chép cứng **giai 1** (cả 5 bộ lớp-rời đều ở **giai 7**; `NV_GIAP['thieulam\|1']` trỏ `dkgs1` chưa nướng lớp) · nạp trước **sai tên lớp** (`NV_LOP` là một **MẢNG**, `Object.keys` ra `"0".."6"`; khoá lớp nằm ở `NV_LOP_HOP[bộ]`) nên nó đo một thân ghép chưa tải xong, `_ow = 2`. Cả hai nay **suy từ dữ liệu** và gác chặt hơn bản cũ. ⚠ Bản viết lại còn lôi ra: `test_khungchay` **không đặt `TEST_MODE`**, nên `phatDoKhoiDau()` phát bộ giai 7 và `gv.oLop` trỏ bộ giai 7 trong khi bài ép `tier = 1` ⇒ thân vẽ ra **TRỐNG TRƠN** (32/32 khung rỗng). |
| ~~`test_uigothic ⑥`~~ | *"ở 30% máu, đầu TRÁI thanh cũng tối theo"* | ✅ **ĐÃ SỬA TẬN GỐC, không còn trong bảng này.** Dòng cũ ghi *"thanh máu có thành phần đập theo thời gian"* — **sai**: thanh không đập. Mẫu "đầy" đổi giữa các lượt vì `applyTestBoost()` bốc đồ NGẪU NHIÊN ⇒ `maxHp` khác ⇒ **chữ số khác**, mà que dò đọc đúng một điểm ở `(0,08 · giữa)` — tức đọc thẳng vào con số máu do `.cd-thanh span` vẽ đè. Nay đọc **đỉnh độ đỏ của cả CỘT** (chữ trắng và bóng đen chỉ kéo độ đỏ xuống) ⇒ năm lượt ra đúng cùng một bộ số. Xem mục thanh máu/mana ở khối UI Gothic. *Một bài đỏ theo xúc xắc vẫn phải TRUY tới nguyên nhân — lần này "xúc xắc" là một que dò hỏng, và chính nó che một mệnh đề rỗng suốt nhiều phiên.* |
| `test_gearlook` | *"cache chân dung không đổi khi thay đồ"* (`cache_doiTheoDo: false`) | **xanh 13/13 lượt chạy lẻ** — 3 trên cây này · 3 trên cây trước · 3 trên chính BẢN ĐÓNG BĂNG của lượt hồi quy đã đỏ · 4 lượt nữa dưới tải CPU giả (6 vòng bận trên 4 lõi) — mà chỉ đỏ **bên trong** một lượt hồi quy đầy đủ. Xanh ở `reg-mg`(236 bài) và `reg-now`. Nó là một cuộc đua TẢI ART: hai thẻ so nhau là *đủ giáp giai 7* với *trần trụi giai 1*, và nếu lớp giáp giai 7 chưa về kịp thì cả hai cùng vẽ ra thân trần ⇒ hai data-URL trùng khít. **Chưa dựng lại được cảnh đỏ**, nên đừng chép câu này như một kết luận đã đóng; thứ đã chứng minh được là nó không đến từ một diff chỉ chạm `MOBS`/`vung` |
| `test_dichen §②` | *"CANVAS còn 2/76 chuỗi tiếng Việt: `✦ ĐÀN VÀNG SẮP XÂM LĂNG` · `10 min: nữa — …`"* | ⚠ **KHÔNG phải nhiễu, và cũng KHÔNG phải xúc xắc — nó phụ thuộc ĐỒNG HỒ.** Băng-rôn Xâm Lăng Vàng chỉ hiện trong cửa sổ ~22 phút quanh mốc **2h·6h·10h·14h·18h·22h UTC** (10 phút báo trước + 12 phút sự kiện). Ngoài cửa sổ đó bài ra `0/74` và xanh — đo được: đỏ lúc 01:50-02:12 UTC, chạy lại lúc 02:21 thì xanh ngay. Tức đây là một lỗ i18n **CÓ THẬT** còn sót, chỉ là nó tàng hình 90% thời gian. `sau_tron.sh` chạy cùng bài ấy 40 phút trước đó cũng xanh. ⇒ Sửa là dịch hai chuỗi băng-rôn sự kiện, đừng nới bài kiểm; và **đừng kết luận "đỏ do phép trộn" khi một bài i18n đỏ — hỏi giờ UTC trước** |
| `test_qablock` | *"dựng cảnh sai: người chơi không ăn đòn nào"* rồi kéo theo 2 FAIL nữa | **xanh 8/8 lượt liên tiếp** khi chạy riêng · chính chú thích trong bài đã ghi nó nhạy với mạch ngẫu nhiên (*"từng xanh chỉ vì may"*) — con quái phải kịp đánh trúng trong 40 khung, máy bận là trượt. Phân biệt bằng `git diff -U0 … | grep '^@@'`: nếu diff không chạm `update`/`hurtPlayer`/`swingFeel`/`shakeDir` thì nó không thể là của mình |
| `test_canbanglop` | *"chênh ST cao/thấp 3.63× > trần 3.6× (Dark Knight vs Dark Wizard)"* | **đỏ 2/10 trên CẢ HAI cây** trong một phép A/B ghép đôi: cùng một `game.js` byte-cho-byte, chỉ khác layout HUD ⇒ không phải của ai cả. Giá trị đo trải **2,26 – 4,27×** quanh một cái trần đặt ở **3,6** — tức ngưỡng nằm GIỮA dải nhiễu, nên nó đỏ theo xúc xắc vĩnh viễn. Đỉnh tệ nhất (4,27) rơi vào cây ĐỐI CHỨNG. Muốn dứt điểm thì cộng dồn nhiều lượt rồi lấy trung vị (lối `test_hethu §2`), đừng nới trần — nới trần là bỏ luôn thứ nó gác |

⚠ **VÀ QUE DÒ CỦA CHÍNH PHÉP PHÂN BIỆT ẤY CŨNG HỎNG ĐƯỢC — tôi vừa dẫm.** Nhiều bài đọc `../public/game/game.js` bằng đường dẫn TƯƠNG ĐỐI, nên chạy chúng từ một thư mục không có `public/` bên cạnh là chết `ENOENT` **trước khi một khẳng định nào chạy** — mà `rc=1`, nên nó đọc ra đúng như *"đỏ 3/3, tất định"*. Tôi đã suýt kết luận ngược hẳn. Dựng cảnh cho đúng: một thư mục có `tests/` **và** `public/` cạnh nhau — nhưng ⚠ **`tests/` phải là BẢN CHÉP THẬT, symlink thì không được**: Node phân giải đường thật rồi gặp `package.json` khai `"type":"module"` ⇒ chết ở `require is not defined` **trước khi một khẳng định nào chạy**, và `rc=1` lại đọc ra y hệt *"đỏ 3/3 trên cả hai cây"*. Đã dẫm đúng thế và suýt tuyên bố hai bài là đỏ-có-sẵn mà không có một bằng chứng nào. (`public/` thì symlink được — nó chỉ bị đọc bằng `fs` và qua HTTP, không dính phép tra `package.json`.) ⇒ **Chốt tự kiểm bắt buộc cho mọi phép chạy lẻ: đếm số dòng khẳng định trong log; bằng 0 thì đó là QUE DÒ hỏng, không phải bài đỏ.** Cùng luật với ba bài chép cứng cổng ở trên: *trước khi tin một lượt chạy lẻ, hỏi log xem nó có tới được trang không.*

**Cách phân biệt "đỏ do mình" với "đỏ do xúc xắc", làm theo thứ tự này:** chạy riêng bài đó
**3 lượt** trên cây của mình → rồi chạy trên cây **trước commit của mình** (`git worktree add`).
Xanh 3/3 ở vế đầu và xanh ở vế sau thì nó không phải của mình. *Đừng kết luận chỉ bằng "trông
giống một bài hay đỏ" — tôi suýt làm thế, và cái giá của đoán sai là đẩy một commit hỏng lên
production.*

⚠ **Bài kiểm mỏng mẫu thì đỏ theo xúc xắc, không phải theo lỗi.** Hai chỗ đã phải sửa:
- `test_bayquai` đo vị trí Kẻ Tiếp Sức trên **6 bãi của một map** rồi đòi "không quá 25% lọt vào
  giữa" — một con lọt là qua, hai con là đỏ. Nay quét mọi map ⇒ **63 mẫu**.
- `test_cottruyen` chốt bằng con số đếm *"đúng 7 NPC có trang thoại"*, nên **thêm một NPC viết tử
  tế là bài đỏ**. Nay suy thẳng từ `QUESTS`: gác *"không người dẫn chương nào bị bỏ trống"*.

Cùng một bệnh với luật `≤60% là kill` ở `docs/LORE_RUNE.md §6`: **một cái chốt hẹp hơn ý định của
nó thì xanh, và nó bảo đảm sai.**

## ⚠ ĐỨNG ĐÚNG CHỖ TRƯỚC KHI CHẠY GIT

Máy này có **hai repo khác nhau** và tên nhánh trùng nhau — đã suýt push nhầm vì chuyện đó.

| Đường dẫn | Repo | Dùng để |
|---|---|---|
| `/home/user/axie-wuxia` | `ShanKyos/axierift` | **game — mọi việc ở đây** |
| `/home/user/Volamchimong1` | `ShanKyos/Volamchimong1` | repo KHÁC, không liên quan game |

Cạm bẫy: shell của agent **mặc định mở ở `/home/user/Volamchimong1`**, và cả hai repo đều
từng có nhánh tên `claude/optimistic-davinci-oi5qba`. Một lệnh `git push` quên `cd` là đẩy
nhầm repo.

**Luật: mọi lệnh git phải có đường dẫn tuyệt đối** — `cd /home/user/axie-wuxia && git …`
hoặc `git -C /home/user/axie-wuxia …`. Kiểm nhanh trước khi push:

```bash
git -C /home/user/axie-wuxia remote get-url origin   # phải ra .../axierift
```

### Còn hai vết sẹo nữa, đừng lặp lại

- **`ln -sfn <đích> node_modules` khi `node_modules` đã là symlink** thì nó **không** thay
  cái link — nó tạo link *bên trong* thư mục đích, và có lần đã biến `node_modules` của repo
  chính thành symlink trỏ vào chính nó. Hậu quả im lặng: `npx eslint` thoát **216 không in gì**
  (npx đi tải qua mạng rồi bị proxy chặn), trông hệt như "lint sạch". Muốn dùng chung
  `node_modules` cho worktree thì `rm -f node_modules` trước rồi mới `ln -s`.
- **`rc=$?` sau một pipe là mã của lệnh CUỐI pipe**, không phải của `npm`.
  `npm run test 2>&1 | tail -6; echo $?` **luôn** ra 0. Muốn lấy mã thật:
  `npm run test > /tmp/t.log 2>&1; rc=$?`.

Hai cái trên cộng lại từng cho ra "3 cổng CI đều xanh" trong khi **không cổng nào chạy**.

## 🚀 PRODUCTION — VPS tự kéo từ `main` mỗi 2 phút

**Production LÀ VPS này, không phải Vercel.** Repo có `vercel.json` + `Dockerfile.vercel`
nhưng đó là môi trường khác — đừng suy ra production từ chúng.

| | |
|---|---|
| Live | **http://14.225.204.107/** |
> ⚠ **Kho đã đổi tên `axiewuxia` → `axierift`.** Đường dẫn TRÊN VPS thì KHÔNG đổi —
> `/var/www/axiewuxia`, `deploy-axiewuxia.sh`, hostname `axiewuxia-xiiz` là thư mục và tên máy
> trên server, không phải tên kho. GitHub tự chuyển hướng tên cũ, nên `git fetch` trong bản sao
> ở VPS vẫn chạy và **cron deploy 2 phút/lần không cần đụng tới**. Đổi mấy đường dẫn đó là tự
> tay làm vỡ deploy đang chạy.

| Máy chủ | VPS Vietnix, hostname `axiewuxia-xiiz`, nginx |
| Thư mục phục vụ | `/var/www/axiewuxia/public/game` |
| Bản sao git | `/var/www/axiewuxia` (clone của `ShanKyos/axierift`) |
| Tự động | cron `*/2 * * * * /root/deploy-axiewuxia.sh` |
| Script | `git fetch origin main --quiet && git reset --hard origin/main --quiet` |

### ⇒ Deploy = ĐẨY LÊN `main`. Không có bước nào khác.

**Chủ dự án đã chốt: làm thẳng trên `main`, push thẳng, không nhánh phụ, không PR.**

```bash
git -C /home/user/axie-wuxia add -A
git -C /home/user/axie-wuxia commit -m "..."
git -C /home/user/axie-wuxia push origin main    # ≤2 phút sau là live
```

⚠ **Push thẳng lên `main` LÀ deploy.** Không còn PR làm lớp đệm, nên bốn cổng dưới đây là thứ
duy nhất đứng giữa một commit hỏng và người chơi. Chạy đủ TRƯỚC khi push, và đọc mã thoát cho
đúng (`cmd > /tmp/x.log 2>&1; rc=$?` — **không** đọc `$?` sau một pipe):

| Cổng | Lệnh |
|---|---|
| lint | `npm run lint` |
| kiểu | `npm run check` |
| unit | `npm test` |
| game | bộ hồi quy trong scratchpad (`test_*.js`, ~127 bài) |

Hỏng thì **sửa trước khi push**, đừng push rồi sửa sau — người chơi thấy bản hỏng trong 2 phút.

### Những chỗ đã vấp, đừng vấp lại

- ⚠ **Sandbox KHÔNG SSH được vào VPS.** Cổng 22 bị chặn ở tầng mạng, và IP cũng không nằm
  trong allowlist HTTP của proxy (gọi thử trả `403 Host not in allowlist`). Mọi lệnh cần chạy
  **trên** VPS đều phải đưa cho người dùng tự chạy. Đừng hứa sẽ tự deploy/SSH.
- ⚠ **IP không xuất hiện ở đâu trong repo** — cấu hình nằm trên VPS. Grep repo rồi kết luận
  "không có đường deploy" là SAI; tôi đã mắc đúng lỗi này. Cần tra thì tra transcript phiên.
- ⚠ Script dùng `git reset --hard`. Sửa file tay trong `/var/www/axiewuxia` sẽ **mất sạch** ở
  lần pull kế tiếp. Mọi thay đổi phải đi qua `main`.
- ⚠ **Trước khi merge vào `main` phải chạy đủ 3 gate CI** (`npm run lint` · `npm run check` ·
  `npm test`) **và** bộ regression game trong scratchpad. Merge là live trong 2 phút, không có
  bước duyệt nào chen vào giữa.
- ⚠ **KHÔNG ghi thông tin đăng nhập vào bất kỳ file nào trong repo.** Mật khẩu root từng bị
  dán nguyên văn vào lịch sử chat — đã báo người dùng đổi và chuyển sang SSH key.

### Kiểm tra sau khi deploy

`http://14.225.204.107/` (thêm `?test=1` để mở chế độ thử: đi map tự do + tick cấp 60).
Log deploy nằm ở VPS, người dùng xem giúp — sandbox không tới được.

## 🔀 XONG LÀ PUSH — và ĐỪNG ĐỂ NHÁNH TRÔI XA `main`

Chủ dự án chốt (nguyên văn): *"xong thì push đi, và làm sao cho các nhánh đừng xung đột với
nhau nữa"*. Đây là luật vận hành, không phải lời khuyên — nó rút ra từ một phiên phải trộn
`main` **BA LẦN** cho cùng một đợt việc.

**Số đo của phiên đó, vì nó nói rõ cái giá:** giữ 11 commit trên một nhánh phụ trong lúc `main`
đi tiếp **27 → 10 → 10** commit. Mỗi lần trộn là một lượt hồi quy đầy đủ (~1 giờ) phải chạy
LẠI, vì *bản đã trộn là mã mà chưa bên nào từng kiểm*. Ba tiếng hồi quy cho một đợt việc, và
hai trong ba lần trộn để lại một bài kiểm tự mâu thuẫn mà `node --check` vẫn xanh.

### ① XONG MỘT MẢNG VIỆC LÀ PUSH, đừng gom

Một mảng việc xanh đủ bốn cổng thì đẩy luôn. **Đừng** gom ba bốn đợt rồi push một thể: nhánh
càng sống lâu thì cửa sổ đụng độ càng rộng, và nó rộng theo cấp số chứ không theo tuyến tính —
mỗi commit mới của `main` nhân với mỗi commit của mình. Nhánh sống nửa ngày là nhánh chắc chắn
phải trộn.

### ② TRỘN `main` VÀO **TRƯỚC**, KHÔNG PHẢI SAU

```bash
git -C /home/user/axiewuxia fetch origin main --quiet && git -C /home/user/axiewuxia merge origin/main --no-edit
```

Chạy **trước khi bắt đầu** một mảng việc và **trước mỗi commit** — không phải một lần lúc sắp
push. Trộn sớm thì xung đột nhỏ, nằm đúng chỗ mình vừa sửa, và còn nhớ vì sao mình sửa thế.
Trộn muộn thì phải đọc lại hai bên như người ngoài.

### ③ BA CHỖ LUÔN ĐỤNG NHAU — CHÈN Ở CUỐI, ĐỪNG CHÈN GIỮA

| tệp | vì sao | cách tránh |
|---|---|---|
| `CLAUDE.md` | ai cũng thêm một mục mới | chèn ngay TRÊN một tiêu đề ỔN ĐỊNH, đừng chèn giữa một mục đang có |
| `docs/NHAT_KY.md` | ai cũng thêm một mục cùng ngày ở **cùng một chỗ** | thêm vào CUỐI. Đụng nhau thì giữ **CẢ HAI** mục, không cái nào thay cái nào |
| `tests/test_*.js` | hai nhánh cùng sửa một bài đỏ-theo-tải | xem ④ — đây mới là chỗ đắt |

### ④ ⚠⚠ PHÉP TRỘN NGUY HIỂM LÀ PHÉP TRỘN **KHÔNG KÊU**

Cái làm git báo xung đột thì nhìn thấy được và sửa được. Cái đắt là cái git ghép **êm ru** rồi
để lại mã mà chưa bên nào từng chạy. Ba lần trong một phiên, cùng một hình dạng:

1. **`test_hopve` nhận CẢ HAI chuỗi khẳng định.** Một bên đòi `_tkHien` phải chứa
   `_coAva`/`_lopHien` (luật cũ), bên kia đòi `atkK`/`castK`. Mã đã hoà **không thoả cái nào**,
   và `node --check` xanh. Hai chuỗi nằm ở hai khối khác nhau nên git không thấy gì để hỏi.
2. **`test_chaos` nhận thân hàm MỚI của một bên và chỗ ĐỌC biến của bên kia.** Chỗ đọc nằm
   **ngoài** khối xung đột ⇒ không ai được hỏi. Nổ `ReferenceError: soKetKhoa is not defined`
   giữa `page.evaluate`, **ở phút thứ 40 của một lượt hồi quy một tiếng**.
3. **`_tkHien` — hai nhánh sửa HAI NỬA của cùng một lỗi** (ngoài thành / trong thành). Ghép
   lại thì nửa này đè nửa kia, và mỗi bên đều có bài kiểm xanh chứng minh nửa của mình.

⇒ **Trộn xong thì đừng tin `node --check`.** Đếm lại từng hàm mà mã mới dựa vào, và đọc lại
chính những bài kiểm mà phép trộn vừa chạm — hai nhánh cùng sửa một bài thì rất có thể chúng
sửa theo hai hướng khác nhau.

### ⑤ CỬA CHẶN NHANH: `bash tools/sau_tron.sh`

Chạy **ngay sau mỗi `git merge`**, trước khi bỏ một tiếng cho cả bộ. Nó lấy danh sách tệp phép
trộn vừa chạm rồi: kiểm cú pháp mọi `.js` trong đó · quét mỏ neo xung đột còn sót · **chạy đúng
những `tests/test_*.js` nằm trong danh sách**. Cả ba lỗi ở ④ đều có bài kiểm liên quan nằm sẵn
trong danh sách ấy — `soKetKhoa` sẽ chết trong **30 giây** thay vì 40 phút.

**⚠ NÓ KHÔNG THAY BỘ HỒI QUY.** Nó chỉ bắt lớp lỗi SINH RA TỪ PHÉP TRỘN. Push lên `main` vẫn
phải đủ bốn cổng.

**⚠ VÀ ĐỪNG CHẠY NÓ TRONG LÚC `reg.sh` ĐANG CHẠY.** Đã dẫm ngay trong phiên viết nó: sáu bài
Playwright cộng một máy chủ tĩnh nữa tranh CPU với lượt hồi quy đang chạy, và `test_autopack`
hết giờ 260 giây rồi phải chạy lại. Máy này không có GPU nên Playwright ăn CPU thật; hai bộ
chạy song song là **một bộ làm bộ kia đỏ theo tải** — đúng cái lớp `rc=124` mà tài liệu này đã
mất bốn lượt để truy. Cửa sau-trộn chạy TRƯỚC, hồi quy chạy SAU, không chồng nhau.

**⚠ VÀ VÌ SAO KHÔNG CHỮA BẰNG LINT:** `tests/**/*.js` **không được ESLint ngó tới** — đo được
trong `eslint.config.js`, chỉ có `**/*.{ts,tsx}` · `src/components/ui/**` · `api/**/*.ts` ·
`public/game/game.js`. Nên `no-undef` không bao giờ chạy ở đó, và đúng lớp lỗi "biến mồ côi sau
khi trộn" không có cửa nào bắt ngoài việc CHẠY bài. Bật `no-undef` cho `tests/` thì phải khai
hàng trăm hàm của game (bài gọi chúng trong `p.evaluate`), nên cửa đúng là chạy bài.

## Git — CHỈ CÓ `main`, không có nhánh nào phải đồng bộ

Phát triển trên `main`, push thẳng lên `main`. Hết. Không nhánh phụ, không PR, không mirror.

> ### 🗑 `demo-axie-showcase` ĐÃ BỎ — và hai khối lệnh sync ở đây từng là LỜI NÓI DỐI
>
> Mục này trước đây bảo *"phát triển trên `main`, sau đó sync sang `demo-axie-showcase`"* kèm một
> lệnh `git merge`, ở **hai** chỗ trong tệp. Lệnh ấy **chưa bao giờ chạy được**: hai nhánh không
> có tổ tiên chung (commit gốc `3a6b95f` vs `3586a1d`), nên git từ chối thẳng —
> `fatal: refusing to merge unrelated histories`. Đã chạy thử trong worktree tạm để xác nhận
> chứ không suy từ tài liệu.
>
> Nhánh đó là **ảnh chụp đông lạnh của bản TRƯỚC khi pivot sang MU** (bản chuyển thể Giang Hồ
> Huyễn Ảnh): 9 lớp · Bế Quan · Đan Điền · Trúc Cơ · Luyện Đan · WASD · Baloo 2 làm
> `--font-display` · 7 phó bản — tức gần như mọi thứ Quy tắc số 1 cấm hoặc các đợt sau đã gỡ có
> lý do. Commit cuối 2026-08-30; không `.github/`, `vercel.json` hay cron deploy nào đọc nó.
> Chủ dự án chốt bỏ ngày 2026-09-14. SHA tip nếu cần dựng lại: `09326d9`.
>
> ⚠ **Nhánh vẫn CÒN trên remote** — token của sandbox push commit được nhưng **không xoá được
> ref** (`git push --delete` trả `HTTP 403` nhất quán, cả dạng `--delete` lẫn refspec rỗng; proxy
> khoẻ, không phải lỗi mạng), và GitHub MCP chỉ có `create_branch`, không có tool xoá. Xoá phải
> do chủ dự án tự chạy — trên máy mình `git push origin --delete demo-axie-showcase`, hoặc bấm
> trên trang Branches của GitHub. **Đừng thử lại từ sandbox rồi tưởng mình gõ sai lệnh.**
> Dù nhánh còn hay mất thì luật vẫn thế: **không ai đồng bộ nó nữa.**
>
> ⚠ **Đừng đọc "216 commit demo có mà main chưa có" rồi tưởng có việc chưa trộn.** Đó là toàn bộ
> lịch sử RIÊNG của một cây khác, không phải công việc tồn đọng — với hai lịch sử rời nhau thì
> `git rev-list --left-right` luôn ra con số to ở cả hai phía và nó không mang nghĩa gì.
>
> *Luật chung: một quy trình ghi trong tài liệu mà không ai chạy sẽ mục đi trong im lặng — đúng
> họ với bước "rồi chép sang…" của `ISO_NEO`. Ghi một lệnh thì phải có ngày chạy nó, không thì
> đừng ghi.*

## Đồ rơi phải NẰM DƯỚI ĐẤT, không nhảy thẳng vào túi

`killMob()` KHÔNG được gọi `player.inv.push(it)` nữa. Mọi thứ rơi ra đi qua
`dropToGround({k:'item'|'jewel', ...}, x, y)` — vật thể có toạ độ, nảy vòng
cung, nằm 45 giây, có nhãn tên nổi màu theo phẩm.

Bốn con số đo được ở bản cũ, để đừng bao giờ quay lại:
- 33% số kill **im lặng tuyệt đối** — 0 chữ, 0 tiếng, 0 dòng log
- tiếng rơi ngọc bị `AudioSys` debounce 70ms **nuốt 100%**: `killMob` đã gọi
  `sfx('coin')` vài phần nghìn giây trước `rollJewels`. Âm cho thứ rơi ra
  **không được trùng tên** với âm đã phát trong cùng một `killMob`.
- túi đầy → **50/50 món mất trắng**, không một lời cảnh báo. Nay đồ nằm lại
  dưới đất và đổi nhãn `⚠ TÚI ĐẦY`.
- 229 chữ bay là vật liệu vụn vs 29 chữ tên trang bị. **Vật liệu vụn về
  `logCombat`**, `addFloat` để dành cho đồ, ngọc và những thứ đáng dừng tay.

Ba luật kèm theo:
- `groundLoot` **không lưu vào save** và **phải bị xoá trong `buildWorld()`**
  — không thì đồ map cũ hiện lơ lửng ở map mới.
- **AUTO bật thì nới tầm hút gấp 3.** Lớp tầm xa giết quái cách 200px; để
  nguyên bán kính đi-ngang-qua là treo máy cả tiếng rồi bỏ lại nguyên bãi đồ.
- Nút J trên thanh kỹ năng phải theo **đúng** thứ tự ưu tiên của phím J
  (nhặt đồ → hái thuốc → nhảy). Lý do cũ là "điện thoại không có cách nào nhặt";
  game nay chỉ chạy PC nên lý do đó hết hiệu lực, nhưng LUẬT thì vẫn giữ: nút và
  phím phải làm cùng một việc, không thì người bấm nút và người gõ phím thấy hai
  hành vi khác nhau ở cùng một chỗ.

Hình vật phẩm được vẽ cho **ô túi nền tối**. Đặt thẳng lên bãi cỏ sáng là mất
hút — mỗi món dưới đất phải có tấm nền tối bo góc + viền màu phẩm.

## Sự kiện thế giới chạy theo GIỜ THẬT

Ba sự kiện, cùng một khuôn: `*NextBoundary(after)` snap về mốc giờ, cảnh báo
trước, kích hoạt, hết cửa thì dọn. State tính lại được từ `Date.now()` nên
**không lưu vào save** — đến trễ là lỡ chuyến, đúng nhịp MU.

| Sự kiện | Mốc giờ | Cửa mở | Báo trước |
|---|---|---|---|
| Hung Thần Giáng Thế | 0h·4h·8h·12h·16h·20h | 30 phút | 10 phút |
| Xâm Lăng Vàng | 2h·6h·10h·14h·18h·22h | 12 phút | 10 phút |
| Chúa Tể Vực Nứt | 0h·6h·12h·18h (4 lượt/ngày) | 45 phút | 15 phút |

Hai chốt của Vực Nứt chỉ lộ ra khi **chụp màn hình**, không phải khi đọc code:
- `aggro: 9999` + cho nứt ở cả bãi tân thủ = nhân vật cấp 1 vừa vào bãi đầu
  tiên đã bị boss băng qua nửa map đấm chết trong 2 nhịp.
- Bậc Bảo Hạp tính theo **map** thì người chơi cấp thấp mở ra toàn đồ ngoài
  khoảng cấp dùng được. `BAOHAP_TIERS` khoá khoảng cấp đồ → thưởng hạp luôn
  phải tính theo **cấp người chơi**.

## Vật cản: thứ MẮT THẤY phải là thứ GAME THỰC THI

Cây và đá từng có bán kính va chạm **bằng 0**. Đo được: xếp 8 cây to nhất thành hàng rào rồi
cho nhân vật đi qua — toạ độ x **không lệch một pixel**. Và 3/7 map ngoài trời có **0 vật cản
trong lòng**; tỉ lệ vòng giữa mọi cặp bãi quái ra đúng **1,000**, tức là suốt vòng đời người
chơi không có một đoạn đường nào phải né gì cả. Đó mới là gốc của cảm giác "trôi tuột" —
không phải chuyện map to hay nhỏ. **Phóng map to trước khi có vật cản chỉ tạo thêm đất trống.**

Bốn luật rút ra, trả giá bằng nhiều vòng đo:

- **Decor va chạm thì PHẢI lọc khỏi mọi điểm nội dung** — bãi quái, thảo dược, cổng, ải cấp,
  boss vùng, spawn. Quái và boss tự `nearestFree()` ra chỗ trống, **thảo dược thì KHÔNG**: một
  bụi thuốc nằm giữa hồ là vĩnh viễn không hái được.
- **Phải xoá `decorObs` NGAY khi dựng lại thế giới**, trước khi rải decor mới — `obstaclesOf()`
  nối decor của map đang đứng vào, nên bộ lọc sẽ soi nhầm theo địa hình map trước.
- **Đừng đặt khối chắn ngang trục nối hai bãi quái.** Né cục bộ (`simulateMovePath`) chỉ vòng
  nổi khối ngắn; khối dài 340px chắn thẳng trục làm đường đi kẹt lại cách đích 300–555px.
- **Kiểm bằng LIÊN THÔNG (flood fill), không phải tỉ lệ vòng.** Trượt qua một gốc cây gần như
  không làm đường dài thêm, nên tỉ lệ vòng trung vị là mốc vô dụng cho vật cản nhỏ. Flood fill
  bắt được cả trường hợp hai khối chạm đúng mép nhau bịt kín hành lang — lỗi đã xảy ra thật.

Một hướng đã thử và **HỎNG**: đo "kẹt" bằng mức *gần đích hơn* thay vì *quãng đường đã nhích*.
Trượt dọc mép gần như không bao giờ rút ngắn đủ → `stuck` tăng mỗi bước → độ chệch kịch trần
tức thì → đường đi xoáy ra góc map, hụt đích **1954px**. Giữ cách đo bằng quãng đường.

Và khi vật cản chặn thật, click-to-move **không được bỏ cuộc ngay lần kẹt đầu**: né cục bộ hay
chui vào túi giữa mấy gốc cây, vứt waypoint tính lại là thoát. Bỏ cuộc ngay làm 1/3 số lần bấm
đi xa bị huỷ giữa đường.

## Map tranh isometric: chặn bằng ĐA GIÁC SÀN, không bằng ellipse

> ⚠ **TRANH NỀN PHẲNG ĐÃ GỠ HẾT — 12/12 map ngoài trời LÁT VIÊN.** Xem `docs/DUNG_LAI_BON_MAP.md`
> và bảng hiện trạng `docs/BANG_MAP.md` (sinh bằng `tools/bang_map.js`, **đừng sửa tay**).
>
> Vì `game.js` kéo tranh nền phủ kín thế giới rồi cho đi khắp mặt tranh, **tranh nền CHÍNH LÀ
> mặt đất**. Tấm nào vẽ trời ở nửa trên thì đi lên phía bắc map là đi vào bầu trời; tấm vẽ mặt
> nước thì cả bầy quái đứng trên nước. Đó là toàn bộ nguyên nhân của lỗi "lơ lửng".
>
> Bảy map đã dựng lại theo khuôn Rẻo Rừng Corran (`sanIso` + `diTrong` + `isoCum` + `isoDuong`,
> hình sinh bằng `tools/iso/vung_bon.py`), sàn đi được 72-85%: `ngoai` · `chungnam` · `daohoa` ·
> `comoc` · `tuyettinh` · `mongco` · `nhanmon`.
>
> ### ⚠ HAI LẦN TÔI TỰ TẠO LẠI CHÍNH LỖI VỪA CHỮA
>
> 1. **Bảng cũ ở đây liệt sáu tấm "sai phép chiếu" và SAI một dòng — `chungnam`.** Đo lại thì
>    `bg_chungnam.jpg` và `bg_corran.jpg` là **cùng một tệp** (md5 `9310c07f…`, thay từ commit
>    `26dff8d`). Con số "5,7%" đo trên tấm đã bị thay. **Số đo có hạn dùng** — tài sản đổi thì
>    số đo cũ thành lời nói dối, mà kiểu nói dối này nằm trong tài liệu chứ không trong bài kiểm.
> 2. **Chữa xong lỗi lơ lửng do PHÉP CHIẾU thì tôi tạo lại đúng lỗi ấy bằng MÀU.** Viên tuyết
>    tự chọn `(0,86 0,90 0,97)` với lối mòn chỉ đậm hơn chút, cộng đá cũng màu lam nhạt (tàng
>    hình) ⇒ Bird Tribe Heights chụp ra đúng một khoảng TRỜI CÓ MÂY. Ba luật rút ra cho mọi mặt
>    sàn SÁNG: ra khỏi dải trắng chói · **mở rộng khoảng cách sáng giữa nền và lối mòn** · có mốc
>    tương phản sẫm (đá, cỏ khô) để mắt bám. Mặt phẳng sáng đều không mốc thì đọc ra khoảng không.
>    *Đừng để màu nói một đằng còn hình học nói một nẻo* — cùng bài học với lớp phủ tối đã gỡ.
>
> ### ⚠ BLENDER CÓ, ĐỪNG BÁO LÀ KHÔNG
>
> `which blender` trượt, nhưng Blender phát hành trên PyPI dưới dạng **mô-đun Python**:
> `pip install bpy==4.2.0` (khớp Python 3.11 của máy này). Mà `tools/iso/nuong_tile.py` vốn viết
> theo lối `import bpy` chạy bằng `python3` chứ không phải `blender --background` — đường ống đã
> sẵn sàng cho đúng cách cài ấy từ đầu. Đo được **1,9 giây một viên**. Tôi đã suy từ `which` ra
> "sandbox không có Blender" và báo cáo nó như ràng buộc cứng, làm ba map phải đi mượn chất liệu
> sàn suốt một đợt. **"Công cụ X không có" là khẳng định phải KIỂM.**
>
> Bộ viên + vật thể theo biome: `python3 tools/iso/nuong_biome.py`. Khai trong `MAPS` là đổi được,
> không phải sửa engine — **`isoCo`/`isoDat`/`isoVet`** (viên nền) và **`isoCayBo`/`isoNhoBo`**
> (vật thể). ⚠ `isoCay`/`isoNho` là **SỐ LƯỢNG**, `isoCayBo`/`isoNhoBo` là **BỘ SPRITE** — hai
> cặp khoá rất dễ lẫn. Và `isoCayBo` không hứa phải là cây: Bug Tribe Tunnels khai cột măng đá,
> vì tường của một cái tổ thì không làm bằng cây.
>
> **Đừng thử cứu bằng cách lát nền từ art có sẵn — đã thử ba lần, hỏng cả ba**, lý do từng lần
> ghi ở §2 của `docs/PROMPT_MAP_ISOMETRIC.md`.

`bg_quangtruong.jpg` (Quảng Trường Cũ) là tranh **isometric** — nhà có chiều cao, mái là hình
thoi, còn game thì **nhìn từ trên xuống, không có trục cao**. Hai chuyện phải xử riêng:

**1. Chặn.** Lần đầu tôi chặn tám khối nhà bằng tám hình `ellipse` trong `MAP_OBSTACLES`. Sai
kiểu: mái nhà isometric là hình thoi, ellipse thì không — phình ra cho kín mái thì ăn mất mặt
sân, thu lại cho chừa sân thì hở mái, và không có kích thước nào đúng cả hai. Cách đúng là đảo
ngược bài toán: khai **`diTrong`** — đa giác MẶT SÀN ĐI ĐƯỢC (xem `trongDaGiac()` /
`epVaoDaGiac()` trong game.js). Ngoài đa giác là chặn hết, nên mọi khối nhà được chặn miễn phí.
`MAP_OBSTACLES` chỉ còn giữ thứ nằm **giữa** vùng đi được — ở đây đúng một cái giếng.

**2. Không cần lớp phủ trước mặt.** Nhân vật đi ra sau nhà sẽ vẽ ĐÈ LÊN mái — đúng, nhưng chỉ
thành lỗi nếu có đất đi được nằm SAU vật thể vẽ ở tiền cảnh. Đa giác đã ôm sát mặt sân và dừng
**trên** mép mái nhà nam, nên không có ô nào như thế ⇒ không dựng lớp `fg_*.png` nào cả. Nếu
sau này mở sân sau phía nam cho đi được thì mới cần, và lúc đó phải cắt lớp tiền cảnh thật.

**Đo đa giác thế nào cho khỏi đoán:** phủ đa giác lên chính tấm art bằng PIL rồi mở ảnh ra soi
từng mép. Đừng dò bằng phân loại màu — art này tối và đục, cobble/mái/tường/đá cùng dải sáng
55–150, tôi đã thử flood-fill lẫn ngưỡng màu và cả hai đều lem. Mắt trên ảnh có lưới 100px là
cách nhanh nhất và đúng nhất. Đặt NPC thì dùng `/diem` rồi kiểm lại bằng phép điểm-trong-đa-giác.

### Quảng Trường Cũ là thị trấn KHỞI ĐẦU
Nhân vật mới hiện ra giữa sân (`newGame()` đặt `curMap = 'quangtruong'`), 10 NPC quanh sân,
một lò rèn và một quầy thuốc — rồi đi lên **Cổng Bắc** ra Plant Tribe Glade mà đánh quái. Cổng
chọn Plant Tribe Glade chứ không phải Outskirts vì Outskirts để `min:10`.

⚠ Cổng thị trấn thì đặt tên bắt đầu bằng **"Cổng"**, đừng đặt "Lối". `test_noimap` nhận diện
"lối rìa hoang dã" bằng chính tiền tố `Lối ` rồi bắt điểm tới phải nằm cách rìa map <400px —
cổng thành nằm giữa map nên sẽ trượt bài kiểm.

### NPC cũng đo theo thân nhân vật — và đo HỘP NỘI DUNG, không đo khung ảnh
Cỡ NPC từng là `nh = 64` chép cứng. Hai chỗ sai, và chỗ thứ hai mới là chỗ đau:
1. **Chuẩn sai.** `NV_CAO = 132` là chiều cao **ô vẽ**, thân người vẽ ra chỉ **95px**
   (`CAO_THAN_NUONG × NV_CAO / HERO_H`; đo lại bằng `TEST_TO_PHANG` rồi đếm điểm ảnh hồng ra
   92×38). Lấy thẳng 132 làm cỡ NPC thì NPC cao hơn nhân vật cả một cái đầu.
2. **Đo khung thay vì đo hình.** 17 tấm tranh NPC có lề trong suốt khác nhau — nội dung chiếm
   69%…93% chiều cao khung, lề trên 5px…50px. Co cả khung về một chiều cao thì hình thật ra 17
   cỡ khác nhau và chân người kẻ lơ lửng kẻ lún. Nên `npcHop()` đo **hộp alpha** một lần rồi
   nhớ lại, và neo **đáy hộp** vào chân NPC.

Năm NPC là thú Axie có tranh rộng hơn cao (tới 1,35), nên khoá cả hai chiều rồi thu phần vượt —
đúng khuôn `avaCo()` đã dùng cho avatar (trước là `chiCoTrongMan()`, đã gỡ). Nhãn tên, dấu nhiệm vụ và câu thoại bay lên
đều đo theo `n._cao`, không chép cứng 52/64/78 nữa.
