# Những thứ CHƯA hoàn thiện — 2026-09-22

> Viết ra để không thứ nào trong đây bị ngầm hiểu là đã xong. Mỗi mục có **số đo** hoặc nói
> thẳng là chưa đo được. Đọc kèm `docs/CHAM_VIBEATHON.md`.
>
> Thứ tự: nặng trước. "Nặng" ở đây nghĩa là *người chơi hoặc giám khảo sẽ gặp*, không phải
> *tốn công nhất*.
>
> ⚠ **Bản 2026-09-20 của chính tệp này đã nói sai bốn mục P1** — nó liệt sáu bài kiểm thoát-0,
> hai nhánh chưa trộn và bốn con số README như thể còn nguyên, trong khi cả bốn đã đóng trước
> khi ai đọc lại nó. Một tài liệu "còn thiếu gì" mà không kiểm lại thì nó không chỉ vô dụng: nó
> **tự tin nói sai**, và người đọc sẽ đi sửa một thứ đã sửa rồi. Bản này khảo sát lại từng mục
> trên cây `ac31984` chứ không chép mục cũ; những mục đã đóng thì giữ đúng tiêu đề gạch ngang
> để thấy chúng từng ở đây, theo đúng nếp của `CLAUDE.md`.

---

## 🔴 P1 — sẽ gặp, và gặp là thấy ngay

### 1. Metadata repo GitHub chưa chỉnh cho khâu nộp

Gọi API hôm nay, không suy từ tài liệu:

| | hiện tại | nên là |
|---|---|---|
| `description` | `axierift` | một câu thật, có chữ Vibeathon và Axie |
| `homepage` | `http://14.225.204.107/?test=1` | `https://14-225-204-107.nip.io/?lang=en` |
| `topics` | `axie`, `mmorpg` | thêm `vibeathon`, `axie-infinity`, `browser-game` |

`homepage` sai **ba** chỗ cùng lúc: `http` (nay đã có TLS), IP thô (chứng chỉ cấp cho tên
`nip.io`, mở bằng IP là cảnh báo bảo mật), và `?test=1` — cờ đó nay **thừa**, vì bản demo tự
nhận ra người thật qua `navigator.webdriver` và cho cấp 120 mà không cần cờ nào.

Đây là thứ **duy nhất** trong cả tệp này mà giám khảo gặp **trước khi** mở game.

Còn lại đã ổn: repo **public** · `LICENSE` có và giải thích lý do source-available · CI xanh
trên `main` · `main` là nhánh mặc định · 0 issue mở.

---

## 🟠 P2 — nợ thật, không chặn khâu nộp

### 2. Bảy cây trượng vẫn mang tên tu tiên — Quy tắc số 1

Đây **không** phải chú thích trong mã. Sinh 400 món vũ khí trong game đang chạy rồi lọc, nên
đó là tên người chơi thật sự đọc:

`Huyền Cổ Thần Trượng` · `Cửu Thế Phục Sinh Trượng` · `Mỹ Xà Quyền Trượng` ·
`Thiên Lôi Trượng` · `Mãng Xà Trượng` · `Thiên Linh Quyền Trượng` · `Cốt Linh Trượng`

Bản tiếng Anh đã dịch sang tên MU trung tính từ lâu, nhưng **bản tiếng Việt là bản gốc**, nên
luật vẫn đang bị phạm ở đúng chỗ nó tính. Cùng đợt đó soát luôn `Rượu Hổ Cốt` (một món tiêu
hao mang tên rượu thuốc kiếm hiệp, còn 8 chỗ trong `game.js`).

⚠ Đổi tên trượng thì phải sửa **cả chú thích trong `VK_ANH`** (dòng 1847-1853) — bảy dòng đó
đang chép đúng tên cũ để tra cứu, nên sửa một nửa là hai nửa nói hai đằng.

### 3. Ba nhánh còn nội dung chưa trộn

| nhánh | commit | nội dung | trộn được? |
|---|--:|---|---|
| `claude/practical-volta-1kg6na` | 3 | Suối Ký Ức → **Suối Nước Nóng** bằng art thật; gỡ 69 dòng vector + hoa đào kiếm hiệp (sửa **cả** Quy tắc 1 lẫn Quy tắc 3) | ❌ đụng `game.js`, phải gỡ tay |
| `claude/gracious-darwin-3zowyj` | 11 | 41 avatar từ gói Axie (20 → 61 lựa chọn), thợ rèn người lùn, Kỵ Sĩ Ronin, thiết kế thị trấn | chưa thử |
| `luu/covat-cu` | 16 | Khế Ước quay ra **Cổ Vật** thay vì Chimera; rà soát hệ tiền tệ; luật xịt theo mốc khi rèn | chưa thử |

Hai nhánh đông lạnh còn sót trên remote (`demo-axie-showcase` · `backup-before-stage-combat`)
là **ảnh chụp của đời game trước**, không có tổ tiên chung với `main` — `git merge` từ chối
thẳng. Đừng cố trộn. Bốn nhánh đông lạnh cũ khác đã không còn trên remote.

### 4. `cheatExec` vẫn ship

`window.cheatExec` còn nguyên trong `game.js`. Vô hại ở bản chơi một mình — nhưng tầng online
đã chạy thật (bóng người · chat · PvP), nên **phải gỡ trước khi có bất cứ thứ gì CHUNG**: kho
đồ trên máy chủ, bảng xếp hạng, hay bất kỳ con số nào máy chủ tin từ client. Hôm nay ai mở
console cũng tự phát đồ được.

### 5. Mặt băng-rôn giữa màn chưa có bài kiểm dịch nào gác

`test_dichen §②` bọc `fillText`, nên nó chỉ thấy chuỗi nào **tình cờ vẽ ra** trong ~30 giây
bài chạy. Mà `zoneBanner` phần lớn nổ ở một **mốc giờ thật** (Hung Thần 0/4/8/12/16/20h · Đàn
Vàng 2/6/10/14/18/22h · Vực Nứt 0/6/12/18h) hoặc ở một sự kiện **một lần trong đời**.

Hệ quả đo được: `test_dichen §②` **đỏ theo ĐỒNG HỒ**, không theo mã — đỏ lúc 01:50-02:12 UTC
(trong cửa sổ Đàn Vàng), xanh lúc 02:21. Cửa đúng là một mục mới quét thẳng `zoneBanner` trong
`game.js` rồi hỏi bộ dịch; `grep zoneBanner tests/test_dichen.js` hôm nay ra **0**.

⚠ Bộ dò cho mục ấy phải cẩn thận: bản đầu thay mọi `${…}` bằng một mốc `§` rồi hỏi, mà phép
thay ấy **phá mọi luật `RULES` có `(\d+)`** ⇒ báo 102/108 chưa dịch trong khi luật khớp hoàn
hảo với bản THẬT. Chỉ chuỗi KHÔNG có `${}` mới kết luận được theo lối ấy.

---

## 🟡 P3 — đã biết từ lâu, có ghi chú tại chỗ

### 6. `tools/do_nhipcap.cjs` không đo được từ cấp 60 trở lên

Các mốc 60 · 65 · 70 · 80 · 100 · 119 trả về **0 XP/giờ** ⇒ "giờ để lên cấp 60" in ra
`Infinity`. **Không phải do đợt tam giác lớp Axie** — đã dựng worktree ở commit ngay trước đó
và ra đúng cùng bảng số 0. Cũng không phải máy bận. **Chưa truy ra nguyên nhân.**

⇒ Mọi con số nhịp cấp từ 60 trở lên trong tài liệu (33,4 giờ tới cấp 120) hiện **không đo lại
được**. Chúng vẫn có thể đúng, nhưng đừng trích như một phép đo còn hiệu lực.

### 7. Bảy bài kiểm đỏ theo xúc xắc — và một trong số đó KHÔNG phải xúc xắc

`test_canbanglop §2` · `test_gearlook` · `test_qablock` · `test_bophan §4` ·
`test_ngamchuot §4` · `test_tamphap §3` · `test_phutdau §4` · `test_dichen §②` (xem mục 5).

Tất cả đã có phân tích và số đo trong `CLAUDE.md`, kèm cách phân biệt "đỏ do mình" với "đỏ do
xúc xắc": chạy riêng 3 lượt trên cây của mình, rồi 3 lượt trên cây trước commit của mình.

⚠ **`test_sandat` (nhanmon) KHÔNG nằm trong danh sách trên** — nó là một **lỗi thật bắn thưa**:
một nhánh dời chỗ quái quên gọi `collideObstacles`, nên thỉnh thoảng một con nằm ngoài sàn sau
3600 khung đuổi. Nó xanh khi chạy riêng, nên rất dễ đọc nhầm là nhiễu rồi bỏ qua. Cần một đợt
riêng quét **năm** nhánh dời quái trong `update()`. **Đừng nới ngưỡng.**

`test_uigothic ⑥` và `test_tamphap §2` đã **sửa tận gốc** và rời khỏi danh sách này — cả hai
hoá ra là **que dò hỏng**, không phải mã hỏng, và `⑥` còn che một mệnh đề rỗng suốt nhiều phiên.

### 8. Tầng map phó bản chưa dựng lại

Bảy phó bản `pb_*` đã **gỡ hẳn**; máy chạy phó bản thì giữ nguyên và nó chạy theo dữ liệu —
thêm một khoá vào `MAPS` + một khoá cùng tên vào `window.DUNGEONS` là phòng chạy lại ngay.

Ba thứ từng treo trên đó phải nhớ trả về khi dựng lại: địa hình Tầng Sâu · nguồn Cốt ·
`COT_DONG[*].map`. `cotBossVung` hiện là **cầu tạm, không phải thiết kế**.

### 9. Nợ ART — mã không chữa được

- **`NV_GIAP` chỉ còn 2/35 tổ hợp** `lớp|giai` (`baidasan|7` · `thieulam|1`). Thiếu khoá thì
  rơi về đường vẽ cũ, nên phần lớn bộ giáp mặc vào **trông y hệt thân trần**. (Trước có 3;
  `baidasan|1` đã phải gỡ vì art của nó thuộc về thân CŨ — mặc vào là hoá thành người khác.)
- **51% quãng đường đi/chạy là trượt chân nằm sẵn trong bản vẽ** (`tảiĐất` chỉ ~49% `sảiBọc`).
  Không giá trị `SAI_CHAN` nào chữa nổi; phải vẽ lại vòng đi/chạy. Đặc tả đặt hàng + ngưỡng
  nghiệm thu: `docs/DAT_HANG_TUONG_DI.md`.
- **Thân nền chưa cắt lớp** — lớp giáp đắp lên tấm thân liền, nên đeo mỗi ô `chan` thì ống
  chân đè mất vạt áo dài. Cần một gói Spine THÂN TRẦN cho mỗi lớp.
- **Spellblade thiếu hẳn một hàng bảng khung** (`sbhd1` 96 ô so với 112 của bốn bộ kia), nên
  khối chạy của nó chỉ đọc được nửa đầu vòng.
- **Cầm rìa thì cây bay ra vẫn là hình KIẾM** — nấc lùi `TK_LOP` theo lớp. Sửa được bằng một
  dòng art trong `VK_ANH`, không sửa được bằng mã.

### 10. Nợ mã lẻ

- **Thân người từ xa chưa đồng bộ `hurtT`** — Axie của NGƯỜI KHÁC gồng được (đã đồng bộ cú ra
  đòn) nhưng chưa giật được khi họ ăn đòn.
- **Tầng Sâu chưa có nhiệm vụ phụ nào** — `grep "map:'deep'"` ra **0**; nợ duy nhất còn lại
  của bảng 32 mục.
- **PvP chỉ có đòn thường.** Chiêu thức đi qua `hurtMob` ở hàng chục chỗ với hình học riêng;
  nối vào PvP là một đợt riêng. Nói ra thay vì nối nửa vời.
- **Chat không lưu lịch sử** — máy chủ không có cơ sở dữ liệu, mà cron deploy khởi động lại nó
  mỗi khi `server/` đổi. Lịch sử là việc của giai đoạn có tài khoản thật.

### 11. Chưa chốt / chưa thiết kế

| | |
|---|---|
| Chỗ đổi Axie | hiện **tự do ở mọi nơi**; ba lựa chọn (mặc kệ · chỉ trong thành · có hồi chiêu) chưa chốt |
| Lớp gacha Cổ Vật | `docs/CO_VAT_15.md` mới là ĐỀ XUẤT |
| Chibi 5 lớp Axie ở màn tạo nhân vật | chưa thiết kế; `CHIBI_CFG` vẫn phân biệt bằng bóng dáng NGƯỜI |
| Mốc thay "Giày +6 mở dáng chạy" | avatar bay/chạy làm mốc cũ mất nghĩa |
| `via` ở dải 4 (cấp 40-59) | ~3% số ngày cả ba vỉa nằm ngoài tầm với của người chơi dải đó |

---

## ✅ Đã đóng kể từ bản 2026-09-20 — giữ lại để không ai đi sửa lần nữa

### ~~Sáu bài kiểm in `FAIL` mà thoát 0~~

`process.exit(ok ? 0 : 1)` nay có ở cả sáu (`test_story` · `test_mobbalance` · `test_flinch` ·
`test_golden` · `test_hero` · `test_moblevels`). Hai bài từng tự nhận là hỏng đã được truy ra
và **cả hai đỏ vì cảnh dựng đã mục, không vì sản phẩm**: `test_story` chốt cứng `questCount
=== 35` (nay 51) và id dạng số (nay `c<chương>q<số>`); `test_mobbalance` đo nhân vật TRẦN ở
cấp 38 và đè `m.hp = def.hp` — đo lại cho đúng ra **0/33 hỏng**.

### ~~Nhánh phim mở đầu chưa trộn~~

`claude/eager-dirac-oiyma6` và `claude/lucid-ritchie-9rgwpb` đều đã là **tổ tiên của `main`**.

### ~~README nói sai bốn con số~~

Đã sửa, và tầng kể chuyện cũng đã dịch xong: **190 chuỗi → 0**, trên **bốn** đợt quét độc lập,
mỗi đợt lôi ra thứ đợt trước mù (418 dòng bảng NPC · 1.044 lượt mở bảng thật · 59/65 chuỗi
băng-rôn). Bảy trần trong `test_dichen §④` nay là **bánh cóc**, không còn là hạn mức.

### ~~Không có HTTPS~~

`deploy/bat_https.sh` (nip.io + Let's Encrypt, một dòng chạy trên VPS) đã trộn vào `main` và
đã chạy: `https://14-225-204-107.nip.io/`. Nó giữ luôn tầng online — `net.js` tự đổi sang
`wss://` khi trang chạy trên https, nên TLS **không** đánh đổi mất tính năng nào.

### ~~Bộ tự chỉnh chất lượng quá chậm, và dừng ở 75%~~

Ba lỗi câm cùng một gốc: `ms` của `requestAnimationFrame` **bị lượng tử hoá** (đo 2.241 mẫu ra
**đúng hai giá trị**, 33,3 và 16,7), nên trung vị mili-giây là một phép đo mù. Nay cả hai chiều
hỏi **tỉ lệ khung trượt nhịp**. Đo lại cùng cảnh: lắng ở nét 50% sau **27 giây**, **57,9 fps ·
4% khung trượt** (trước: dừng ở 85%, ~47 fps, ~50% trượt, và **không bao giờ** trả lại chất
lượng khi tải giảm).
