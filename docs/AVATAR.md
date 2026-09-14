# Ảnh đại diện (avatar) — nguồn art và cách thay

> Khảo sát kho `axieinfinity` cho việc này: **54 repo** + gói `axie-origins-asset-kit`
> (15 286 tệp, clone `--filter=blob:none` rồi kéo về từng thư mục).

---

> ## ⚠ ĐÍNH CHÍNH — mục 1 bên dưới SAI một nửa
>
> Lượt khảo sát đầu tôi chỉ mở `PvE/Cards/`, `PvE/Backgrounds/` và `Textures/`, rồi kết luận
> "kho Axie không có chân dung dùng được". **Sai.** Có hẳn thư mục **`PvE/Avatars/`** mà tôi
> không mở: **41 chân dung 200×200, nền trong, khung hình thống nhất, viền dày** — đúng thứ
> một cái avatar cần.
>
> | Thư mục | Số | Là gì |
> |---|--:|---|
> | `PvE/Avatars/portraits/` | 22 | đầu Chimera (wolf · slime · dryad · treant · bear · shilin…) |
> | `PvE/Avatars/starters/` | 19 | đầu Axie khởi đầu, đánh số `1.png`…`25.png` |
> | `PvE/Avatars/atlas/` | 2 | atlas gộp 2048² + 1024² của chính bộ trên |
>
> **Bài học:** đừng kết luận "cả kho không có X" sau khi mở ba thư mục. Lần này quét bằng
> `find` trên toàn kho rồi mới nói.
>
> **ĐÃ LẮP** — chủ dự án chốt dùng. Tôi có nêu trước rủi ro giấy phép (gói ghi *"do not ship
> these files"* nếu không thuộc chương trình Sky Mavis duyệt — `KHAO_SAT_AXIE_KIT.md` §1) và
> chủ dự án vẫn quyết lấy. 41 tấm nằm ở `assets/avatar/` (**1,0 MB**).

## 1. Kết luận khảo sát GitHub: kho Axie KHÔNG có chân dung dùng được

| Thứ tìm thấy | Khổ | Dùng được? |
|---|---|---|
| `PvE/Cards/Chimeras` — **75 tấm** | **320×320**, vuông | ✘ Đây là **tranh chiêu thức**, không phải chân dung |
| `Textures/BattleHud/InBattle/avatar_frame.png` | 255×255 | ~ chỉ là cái KHUNG |
| `Textures/BattleHud/InBattle/avatar_player.png` · `avatar_enemy.png` | 173×173 | ✘ ô trống mặc định, không có mặt ai |
| `PvE/Backgrounds/story/*`, `events/*` | — | ✘ tranh nền nhìn ngang |
| `Textures/StatusIcons` (131) · `Morph` (62) · `Vfx` (90) | — | ✘ icon trạng thái và hiệu ứng |

**75 tấm 320×320 nghe rất hợp** — vuông, đúng tỉ lệ avatar. Nhưng mở ra xem thì đó là tranh
minh hoạ đòn đánh: nền động khác nhau từng tấm, bố cục không thống nhất, có tấm chỉ là **một
vệt lá bay** (không có con vật nào), có tấm **đầy máu**. Ghép chúng thành một bảng chọn avatar
thì ra một mớ không đọc được là cái gì.

Thứ duy nhất hợp là **cái khung**, mà `style.css` đã có sẵn ngôn ngữ *"khung kim loại chạm
nổi"* dựng bằng `box-shadow` nhiều lớp — dùng nó thì **không thêm tệp nào** và không phải mở
lại chuyện giấy phép của gói kia (xem `docs/KHAO_SAT_AXIE_KIT.md` §1).

---

## 2. Nguồn art thật: ĐÃ NẰM SẴN TRONG REPO

| Nhóm | Nguồn | Số | Ghi chú |
|---|---|--:|---|
| **Chính Mình** | `heroCardUrl()` | **1** | vẽ lại theo trang bị đang mặc |
| **Chimera Đồng Hành** | `assets/chimera/<id>.webp` | **16** | dải 16 khung ⇒ avatar **thở** |
| **Axie Khởi Nguyên** | `assets/avatar/axie/<tên>.png` | **19** | ảnh tròn có nền, 200×200 |
| **Sinh Vật** | `assets/avatar/thu/<id>.png` + `assets/pets/` | **25** | chân dung nền trong |

**61 lựa chọn**, trong đó 20 lấy từ art đã có trong repo và 41 lấy từ gói Axie (1,0 MB).

⚠ **Tên 19 Axie lấy từ `Catalogs/pve-starters.json` của gói gốc, không đặt lại.** Tệp nguồn
đánh số `1.png`…`25.png` (có lỗ: thiếu 4·6·8·9·10·13), để nguyên số thì bảng chọn ra một dãy
chữ số vô nghĩa. Catalog cho đủ 19 tên thật: Buba · Olek · Puffy · Tripp · Venoki · Shillin ·
Momo · Temujin · Shufen · Ena · Pomodoro · Machito · Hope · Bard · Xia · Bing · Noir · Rouge ·
Mit.

⚠ **Tên 22 sinh vật dùng danh từ fantasy PHƯƠNG TÂY** — Dryad · Treant · Slime · Sói · Gấu —
không dịch sang từ vựng kiếm hiệp (Quy tắc số 1). Id gốc mang hậu tố vai (`-atk`/`-def`/`-sup`/
`-boss`) vô nghĩa với người chơi, nên dịch thành "Công/Thủ/Trợ/Chúa".

⚠ **Bảng chọn CHIA NHÓM có tiêu đề.** 61 ô xếp thành một lưới phẳng thì đúng bằng không chia
gì cả — người chơi cuộn qua sáu hàng mà không biết đang nhìn cái gì.

**Avatar Chimera ĐỘNG.** Art Chimera là dải 16 khung, và `style.css` đã có lớp `.chi-anh` chạy
nó bằng hai `animation: steps()` lồng nhau. Avatar dùng lại đúng kỹ thuật đó nên nó **thở** —
thứ mà một tấm ảnh tĩnh cắt từ cùng bộ art không làm được, và nó miễn phí.

**Avatar `lop` đổi theo trang bị.** Nó gọi thẳng `heroCardUrl(sect, heroTier, gearVisual)`, nên
thay giáp là avatar đổi theo. Chữ ký dựng lại HUD phải gồm cả trang bị, nếu không thay đồ xong
avatar vẫn là bộ cũ.

---

## 3. Ba quyết định, và lý do

**① Không lấy 17 chân dung NPC làm avatar.** Đó là Trưởng Lão Rell, Bổ Đầu, Thợ Rèn — những
người đang đứng trong thành. Lấy mặt họ làm mặt mình thì game có hai Trưởng Lão Rell.

**② Mở sẵn cả 20, không khoá theo Chimera đang sở hữu.** Khoá thì có nghĩa hơn thật — nhưng đó
là một quyết định thiết kế **phần thưởng**, để chủ dự án chốt. Yêu cầu chỉ là "cho phép thay
bằng các loại avatar khác nhau". Khoá lại sau là một dòng lọc trong `avatarDs()`.

**③ Ô avatar trên HUD CỐ Ý không kèm thanh Máu/Mana.** Ảnh tham chiếu có hai thanh đó, nhưng
game này đã có **hai viên đá Máu/Mana** dưới thanh chiến đấu, và dự án đã chốt luật này một
lần rồi — nguyên văn trong `index.html` chỗ số Bình Thuốc: *"cùng một con số bày hai chỗ thì
chỗ nào cũng bị liếc qua, mà không chỗ nào được tin"*. Ô avatar giữ **ảnh + tên + cấp**.

---

## 4. Cách dùng

- Người chơi: bảng **Nhân Vật** (phím `C`) → mục **Ảnh Đại Diện** → bấm một ô.
- Lưu ở `player.avatar` (`'lop'` | `'chi:<id>'` | `'thu:<id>'`), vào thẳng save.
- Save cũ không có trường này thì `avatarHienTai()` trả `'lop'` — **không cần di trú**.

### Thêm avatar mới

- **Chimera mới**: không phải làm gì. `avatarDs()` suy thẳng từ `window.CHIMERA`.
- **Thú mới**: thêm id vào `window.AVATAR_THU` trong `data/canbang.js` + đặt PNG vào
  `assets/pets/`.

> ⚠ **Đừng chép tay danh sách id.** Bản đầu tôi gõ 16 id Chimera bằng tay và **sai 8 cái** —
> `frostmane` · `gloomtail` · `ironhide` · `riftclaw` · `sablewing` · `thornhoof` ·
> `verdantix` · `wispfang` đều không có con nào tồn tại. Suy từ bảng gốc thì không có cách nào
> lệch.

### Hai chỗ vấp khi hiện thực

1. **16 con có 16 cỡ ô khác nhau** (rộng/cao 1,07 → 1,52). Ép thẳng vào hộp vuông là con rộng
   nhất bị bóp méo — phải giữ tỉ lệ ô của chính nó rồi mới cho hộp cắt.
2. **Thẻ nhân vật là khung 160×220 mà thân người chỉ chiếm phần giữa.** Thu vừa hộp 52px thì
   nhân vật còn vài điểm ảnh, nhìn ra một cái chấm. Lớp `.av-lop` phóng lên 168% rồi neo đỉnh
   để hộp cắt lấy đầu và vai.
3. **Ô avatar phải có tấm nền tối.** `#hud-left` nằm trần trên bản đồ, mà sàn lát đá của thành
   thì sáng — chữ `LV.120` màu hổ phách đặt thẳng lên đó đọc không ra.
