# Những thứ CHƯA hoàn thiện — 2026-09-20

> Viết ra để không thứ nào trong đây bị ngầm hiểu là đã xong. Mỗi mục có **số đo** hoặc nói
> thẳng là chưa đo được. Đọc kèm `docs/CHAM_VIBEATHON.md`.
>
> Thứ tự: nặng trước. "Nặng" ở đây nghĩa là *người chơi hoặc giám khảo sẽ gặp*, không phải
> *tốn công nhất*.

---

## 🔴 P1 — sẽ gặp, và gặp là thấy ngay

### 1. Sáu bài kiểm in `FAIL` mà thoát 0 ⇒ hồi quy đếm chúng là XANH

`tools/reg.sh` chấm bằng **mã thoát**. Bài nào kết bằng `console.log(ok ? 'PASS' : 'FAIL')`
rồi hết hàm thì Node thoát 0. Dựng lại được trên `main` hôm nay:

| bài | mã thoát | in ra |
|---|--:|---|
| `test_story` | 0 | **FAIL** |
| `test_mobbalance` | 0 | **FAIL** |
| `test_flinch` · `test_golden` · `test_hero` · `test_moblevels` | 0 | PASS (xanh thật, nhưng sẽ câm cùng kiểu vào ngày chúng đỏ) |

⇒ **Mọi lượt hồi quy từ trước tới nay đều đã bỏ sót hai bài đang tự nhận là hỏng.**

Bản vá có sẵn ở `claude/lucid-ritchie-9rgwpb` (trộn sạch vào `main`, đã thử). Nó vá
`process.exit(ok ? 0 : 1)` cho cả sáu, và sửa cảnh dựng đã mục của hai bài đỏ.

**Chưa trộn** vì lượt này bị chặn ở cửa quyền; cần chủ dự án duyệt.

### 2. Nhánh phim mở đầu chưa trộn

`claude/eager-dirac-oiyma6` — 10 commit, 24 tệp, **trộn sạch vào `main`, đã thử**:

- `assets/video/summon_mo_dau.mp4` (2,9 MB) + `.webm` (1,45 MB) — clip Veo 10,7 giây có tiếng,
  chiếu ở nhịp 0 của lượt quay Khế Ước. Có trần cứng 16 giây, hạ nhạc nền còn 0,22, có đường
  lui khi tải hỏng.
- Banner nhân vật kiểu key-art cho Khế Ước, dựng bằng art THẬT.
- Vũ khí cầm tay: trong thành mang bên vai, ngoài thành hiện lúc ra đòn.
- `tools/sau_tron.sh` — cửa chặn sau-khi-trộn.
- Hai bài kiểm mới: `test_kuphim.js`, `test_kubanner.js`.

Quét dịch trên nhánh này: **2 chuỗi** chưa dịch (`Bấm phím bất kỳ để bỏ qua [phim]`) — sẽ phải
thêm vào `lang.js` ngay sau khi trộm.

### 3. `README.md` đang nói sai bốn con số

| README ghi | thật |
|---|--:|
| 208 / 218 regressions (nói hai con số khác nhau ở 6 chỗ) | **239** |
| 13 maps | **15** |
| 48 mob types | **49** |
| 50-quest main chain | **51** |
| "Two regression tests are dice-rolls" | **tám** bài, đã ghi đủ trong `CLAUDE.md` |

Câu *"`&lang=en` puts it in English before the first frame"* nay **gần đúng hẳn**: bot QA chơi
150 giây ra **0 chuỗi tiếng Việt trên 76.505 lượt vẽ** và **0 dòng trên cả 15 bảng**. Nhưng
tầng kể chuyện thì chưa (xem mục 5), nên câu ấy vẫn cần một vế phụ nói rõ.

### 4. Repo GitHub chưa chỉnh cho khâu nộp

| | hiện tại | nên là |
|---|---|---|
| `description` | `axierift` | một câu thật, có chữ Vibeathon và Axie |
| `homepage` | `http://14.225.204.107/?test=1` | thêm `&lang=en` — giám khảo mở link đầu là thấy tiếng Việt |
| `topics` | `axie`, `mmorpg` | thêm `vibeathon`, `axie-infinity`, `browser-game`, `javascript` |

Còn lại đã ổn: repo **public**, `LICENSE` có và giải thích lý do source-available, CI xanh trên
`main`, `main` là nhánh mặc định, 0 issue mở.

---

## 🟠 P2 — nợ thật, không chặn khâu nộp

### 5. ~~Tầng kể chuyện còn 190 chuỗi chưa dịch~~ — **ĐÃ TRẢ**, và nó lộ ra một mặt lớn hơn

> ⚠ Giữ đúng cái tiêu đề gạch ngang này thay vì xoá trắng: bảng số cũ dưới đây là **cách một
> phép đo có thể xanh mà không gác gì**, và đó mới là phần đáng nhớ.

190 chuỗi kể chuyện (43 mô tả chiêu · 81 chính tuyến · 64 phụ tuyến · 2 tên NPC) đã dịch xong;
bảy trần trong `test_dichen §④` nay **đều là 0** và là một **bánh cóc**, không còn là hạn mức —
thêm một nhiệm vụ mà quên khai bản dịch là bài đỏ ngay, chứ không lặng lẽ ăn vào phần trần dư.

**Nhưng phép đo ấy đo sai thứ, và đây là bài học:** `§④` bơm từng chuỗi vào một `<div>` RỜI do
chính nó dựng, nên nó chứng minh `lang.js` **DỊCH ĐƯỢC** chuỗi — không chứng minh chuỗi **tới
được mắt người chơi**. Quét lại bằng cách mở đúng mấy cái bảng ra (5 lớp × 7 cấp × mọi NPC, lái
bằng `tryTalk()` thật) thì lòi ra một tập hoàn toàn khác, **418 dòng**, mà cả năm mục cũ đều mù:

| ở đâu | dòng | vì sao không mục nào thấy |
|---|--:|---|
| `#panel-quest` — thoại NPC, quầy thuốc, quầy rương, Trại Ngựa, Vực Thẳm, Truy Nã | **377** | bảng chỉ dựng ra khi đứng cạnh một người và bấm E |
| `#forge-content` — Lò Hỗn Độn | 16 | mở được, nhưng `§③` đọc `innerText` của panel cha |
| lời nhắc góc màn · thẻ nhiệm vụ · bảng Kỹ Năng · Nhật Ký | 25 | chúng là HUD, không phải `#panel-*` |

⇒ Đã dịch hết, và **`test_dichen §⑥` nay mở bảng NPC THẬT** (hai map × hai cấp × mọi NPC) rồi
quét trong đó, có chốt tự kiểm đòi ≥20 lượt bắt chuyện trước khi chấm. *Một phép quét không mở
được cái bảng thì nó không gác được cái bảng ấy — và nó trả về những con số trông hoàn toàn
bình thường.*

Và một mặt thứ hai lộ ra ngay sau đó, lớn không kém: **băng-rôn giữa màn (`zoneBanner`) —
59/65 chuỗi THUẦN chưa dịch**. `§②` bọc `fillText` nên chỉ thấy chuỗi nào tình cờ vẽ ra trong
~30 giây bài chạy, mà băng-rôn thì phần lớn nổ ở một **mốc giờ thật** hoặc ở một sự kiện **một
lần trong đời**. Nó lộ ra hoàn toàn do may: lượt chạy hôm nay rơi trúng mốc "10 phút nữa Đàn
Vàng". Đã dịch hết (59 `EXACT` + 32 `RULES`).

**Còn nợ, nói thẳng:** chưa có bài kiểm nào gác mặt băng-rôn — `§②` vẫn là một phép đo phụ
thuộc giờ chạy. Cửa đúng là một mục mới quét thẳng `zoneBanner` trong `game.js` rồi hỏi bộ dịch,
đúng lối `tools/` đang làm; chưa làm vì nó cần một bộ dựng thể hiện cho 43 khuôn có `${}`.

### 6. Tàn dư kiếm hiệp trong tên vật phẩm — Quy tắc số 1

Bảy cây vũ khí vẫn mang tên tu tiên: `Cửu Thế Phục Sinh Trượng` · `Huyền Cổ Thần Trượng` ·
`Mãng Xà Trượng` · `Mỹ Xà Quyền Trượng` · `Thiên Linh Quyền Trượng` · `Thiên Lôi Trượng` ·
`Cốt Linh Trượng`. Bản tiếng Anh đã dịch sang tên MU trung tính, nhưng **bản tiếng Việt vẫn
phạm luật** — và bản tiếng Việt mới là bản gốc. Cần một đợt đổi tên riêng.

Cùng đợt đó nên soát luôn `Rượu Hổ Cốt` (một món tiêu hao mang tên rượu thuốc kiếm hiệp).

### 7. Ba nhánh còn nội dung chưa trộn

| nhánh | commit | nội dung | trộn được? |
|---|--:|---|---|
| `claude/practical-volta-1kg6na` | 3 | Suối Ký Ức → **Suối Nước Nóng** bằng art thật; gỡ 69 dòng vector + hoa đào kiếm hiệp (sửa **cả** Quy tắc 1 lẫn Quy tắc 3) | ❌ **đụng `game.js`**, phải gỡ tay |
| `claude/gracious-darwin-3zowyj` | 11 | 41 avatar từ gói Axie (20 → 61 lựa chọn), thợ rèn người lùn, Kỵ Sĩ Ronin, thiết kế thị trấn | chưa thử |
| `luu/covat-cu` | 16 | Khế Ước quay ra **Cổ Vật** thay vì Chimera; ra soát lại hệ tiền tệ; luật xịt theo mốc khi rèn | chưa thử |

Sáu nhánh còn lại (`capnhat-tailieu` · `pc-only` · `tach-killmob` · `thiet-ke-online` ·
`demo-axie-showcase` · `backup-before-stage-combat`) là **ảnh chụp đông lạnh của đời game
trước**, không có tổ tiên chung với `main` — `git merge` từ chối thẳng. Đừng cố trộn chúng.

### 8. `test_mobbalance` báo 11 ca "không hạ được" — là lỗi của PHÉP ĐO, không phải cân bằng

Chính nhánh `lucid-ritchie` đã truy ra: bảng cảnh chép cứng `['daohoa', 1]` trong khi
`daohoa.min` nay là 36 ⇒ thả nhân vật **cấp 1** vào bầy quái **cấp 38**; đo nhân vật **trần**
(CLAUDE.md đã ghi phép đo đó vô hiệu từ cấp 10); và `m.hp = def.hp` đè lên máu thật (đo ở
`bandao`: 1790 vs 744 ⇒ mọi trận dài gấp **2,4 lần** thực tế). Đo lại cho đúng: **0/33 hỏng**.

Nợ ở đây là: **bản vá chưa trộn**, nên con số "cân bằng quái" hiện chưa ai gác thật.

---

## 🟡 P3 — đã biết từ lâu, có ghi chú tại chỗ

### 9. `tools/do_nhipcap.cjs` không đo được từ cấp 60 trở lên

Các mốc 60 · 65 · 70 · 80 · 100 · 119 trả về **0 XP/giờ** ⇒ "giờ để lên cấp 60" in ra
`Infinity`. **Không phải do đợt tam giác lớp Axie** — đã dựng worktree ở commit ngay trước đó
và ra đúng cùng bảng số 0. Cũng không phải máy bận. **Chưa truy ra nguyên nhân.**

⇒ Mọi con số nhịp cấp từ 60 trở lên trong tài liệu (33,4 giờ tới cấp 120) hiện **không đo lại
được**. Chúng vẫn có thể đúng, nhưng đừng trích như một phép đo còn hiệu lực.

### 10. Tám bài kiểm đỏ theo xúc xắc

`test_canbanglop §2` · `test_gearlook` · `test_uigothic ⑥` · `test_qablock` · `test_sandat`
(nhanmon) · `test_bophan §4` · `test_ngamchuot §4` · `test_tamphap §3` · `test_phutdau §4`.
Tất cả đã có phân tích và số đo trong `CLAUDE.md`, kèm cách phân biệt "đỏ do mình" với "đỏ do
xúc xắc" (chạy riêng 3 lượt trên cây của mình, rồi 3 lượt trên cây trước).

⚠ **`test_sandat` (nhanmon) KHÔNG phải nhiễu** — nó là một **lỗi thật bắn thưa**: một nhánh
dời chỗ quái quên gọi `collideObstacles`. Cần một đợt riêng quét năm nhánh dời quái trong
`update()`. Đừng nới ngưỡng.

### 11. Tầng map chưa dựng lại

Bảy phó bản `pb_*` đã **gỡ hẳn** (máy chạy phó bản thì giữ nguyên, nó chạy theo dữ liệu). Ba
thứ từng treo trên đó phải nhớ trả về khi dựng lại: địa hình Tầng Sâu · nguồn Cốt · `COT_DONG[*].map`.
`cotBossVung` hiện là **cầu tạm, không phải thiết kế**.

### 12. Nợ art và nợ mã lẻ

- **Thân nền chưa cắt lớp** — lớp giáp đắp lên tấm thân liền `dw1`, nên đeo mỗi ô `chan` thì
  ống chân đè mất vạt áo dài.
- **51% quãng đường đi/chạy là trượt chân nằm sẵn trong bản vẽ** (`tảiĐất` chỉ ~49% `sảiBọc`).
  Không giá trị `SAI_CHAN` nào chữa nổi; phải vẽ lại vòng đi/chạy.
- **Spellblade thiếu hẳn một hàng bảng khung** (`sbhd1` 96 ô so với 112 của bốn bộ kia).
- **`NV_GIAP` mới có 3/35 tổ hợp** `lớp|giai` — thiếu khoá thì rơi về đường vẽ cũ.
- **Thân người từ xa chưa đồng bộ `hurtT`**, nên Axie của NGƯỜI KHÁC gồng được nhưng chưa giật
  được khi họ ăn đòn.
- **`cheatExec` vẫn ship** — vô hại ở bản chơi một mình, nhưng phải gỡ trước khi có bất cứ thứ
  gì chung (kho đồ trên máy chủ, xếp hạng).
- **Tầng Sâu chưa có nhiệm vụ phụ nào** — nợ duy nhất còn lại của bảng 32 mục.

### 13. Chưa chốt / chưa thiết kế

| | |
|---|---|
| Chỗ đổi Axie | hiện **tự do ở mọi nơi**; ba lựa chọn (mặc kệ · chỉ trong thành · có hồi chiêu) chưa chốt |
| Lớp gacha Cổ Vật | `docs/CO_VAT_15.md` mới là ĐỀ XUẤT |
| Chibi 5 lớp Axie ở màn tạo nhân vật | chưa thiết kế; `CHIBI_CFG` vẫn phân biệt bằng bóng dáng NGƯỜI |
| Mốc thay "Giày +6 mở dáng chạy" | avatar bay/chạy làm mốc cũ mất nghĩa |
| `via` ở dải 4 (cấp 40-59) | ~3% số ngày cả ba vỉa nằm ngoài tầm với của người chơi dải đó |
