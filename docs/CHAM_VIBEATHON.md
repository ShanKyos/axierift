# Chấm lại theo hệ quy chiếu Vibeathon — tự chấm, 2026-09-20

> **Đây là bản TỰ CHẤM, không phải điểm của ban giám khảo.** Nó tồn tại để trả lời đúng một
> câu: *nếu nộp hôm nay thì chỗ nào chắc, chỗ nào hở.* Mọi con số dưới đây **đo được** trên
> bản `main` đang chạy; chỗ nào là phán đoán thì viết rõ là phán đoán.
>
> Bộ đo: `tools/reg.sh` (239 bài Playwright) · bot QA chơi thật 150 giây (chuột và bàn phím
> thật, không gọi hàm nội bộ để đi tắt) · `tests/test_dichen.js` (bánh cóc tiếng Anh).
>
> Danh sách những thứ CHƯA xong nằm ở **`docs/CHUA_HOAN_THIEN.md`** — đọc kèm, đừng đọc riêng
> tài liệu này.

---

## ⓿ Tổng: **8,0 / 10** — và chỗ hở nằm ở NỘI DUNG, không ở kỹ thuật

| Hạng mục | Trọng số | Điểm | Một câu |
|---|--:|--:|---|
| **Axie Core** | 35% | **8,5** | Hai trục, không trục nào là chỉ số — và có phép chứng minh nó không bán sức mạnh |
| **Gameplay** | ~20% | **7,5** | Vòng chơi chặt, nhưng đoạn giữa vẫn là nội dung nhân bản |
| **Product vision** | ~15% | **8,0** | Có lộ trình, có chỗ dừng nói thẳng |
| **Feasibility** | ~15% | **9,5** | Đã chạy thật, 0 phụ thuộc, 0 bước dựng |
| **Prototype & docs** | ~15% | **8,5** | 239 bài kiểm + nhật ký có số đo — trừ điểm vì 6 bài từng xanh giả |

⚠ **Trọng số ngoài Axie Core là PHỎNG ĐOÁN.** Thể lệ chỉ nêu rõ con số **35% cho Axie Core**;
bốn hạng mục còn lại lấy theo tiêu đề trong bảng "Where to look, per judging criterion" của
README và chia đều phần còn lại. Đừng trích mấy con số ấy như thể chúng là barem chính thức.

---

## ① Axie Core — **8,5**

Đây là hạng mục nặng nhất, và là chỗ dự án có lập luận mạnh nhất.

**Vì sao cao:**

| bằng chứng | số đo |
|---|--:|
| Đổi Axie làm đổi **chỉ số** | **0 điểm / 16 con** — gác bởi `test_hethu §4` |
| Đổi Axie làm đổi **rủi ro** | chênh máu mất giữa vùng dễ nhất và ngặt nhất: **39,0%** (con thuần) / **10,3%** (con tạp) |
| Kỳ vọng hệ số phòng thủ của cả 16 con | **bằng nhau, lệch 2,2e-16** — tức đúng nhiễu dấu phẩy động |
| Vòng khắc | tam giác **chín lớp chính chủ của Axie**, không phải ngũ hành mượn |
| Trục thứ hai | **sáu bộ phận** (Mắt · Tai · Sừng · Miệng · Lưng · Đuôi), 96 ô dữ liệu |

Mệnh đề đáng giá nhất: **cơ chế đổi HÌNH DẠNG rủi ro mà không đổi TỔNG.** Đó là câu trả lời
trực tiếp cho *"affects the game rather than appear only as a cosmetic skin"* mà không dựng
lại một nấc thang "mua con tốt hơn thì đánh mạnh hơn" — thứ đã bị tháo ba lần trong dự án này.

**Vì sao không phải 10:**
- Con Axie vẫn **0 chỉ số, 0 kỹ năng, 0 trang bị** theo đúng thiết kế, nên với người chơi
  lướt qua, nó vẫn *trông như* một cái skin. Cơ chế có thật nhưng **phải được dạy**.
  Đợt 2026-09-21 trả hai chỗ hở lớn nhất của vế dạy đó:
  - chuỗi hướng dẫn tân thủ nay có **bước ⑦ `than`** — cửa duy nhất nói ra trục phòng thủ
    trong phút đầu. Trước đó `grep` sáu bước cũ cho **0** lần nhắc `Axie` lẫn `hệ`, còn
    nhiệm vụ dạy nó (`c1q4`) mở tận **cấp 19**;
  - màn tạo nhân vật từng ghi *"Chỉ là hình dáng"* — tức đúng câu thể lệ trừ điểm
    (*"appear only as a cosmetic skin"*), ở đúng màn đầu tiên người ta đọc. Nay nó nói đủ
    cả hai vế: 0 chỉ số **và** lớp Axie quyết định hệ phòng thủ.
- Con số **32,4%** từng suýt bị đem đi báo cáo là một con số **không đại diện** (đo trên một
  con quái tự chọn); trên đàn quái thật chênh chỉ **7,9%** ở chặng 1. Con số 39,0% ở trên là
  số sau khi có đủ ba chặng và đo trên đàn thật — nhưng bài học thì giữ: *đo một mẫu tự chọn
  rồi gọi nó là kết quả thì lúc nào cũng ra con số mình muốn.*

## ② Gameplay — **7,5**

**Đo được từ bot QA chơi thật** (150 giây, chuột/bàn phím thật):

| | |
|---|--:|
| tới `__gameReady` | **586 ms** |
| tới lúc đứng trong thế giới | **5,2 giây** |
| kill đầu tiên (sau khi bấm đèn hiệu nhiệm vụ) | **1,4 giây** |
| cấp đạt sau 150 giây | **1 → 8**, 160 mạng |
| lỗi JS | **0** |

**Vì sao không cao hơn — và đây là chỗ đau nhất của cả dự án, đã ghi từ lâu:**

> Game không thiếu nội dung — game có một lượng nội dung nhỏ được chép ra nhiều lần.

Ba phép đo độc lập cùng chỉ vào đó: số loài quái mỗi map **7 → 3** khi lên cấp · **99 cấp
sau cấp 20 không mở thêm một hệ thống nào** · bảy phó bản cũ dùng **một** địa hình. Bảy phó
bản đã gỡ hẳn, tầng map đang chờ dựng lại — tức lỗ vẫn còn, chỉ là đã thôi giả vờ lấp.

**Và một phát hiện UX mới từ chính bot QA, ghi ra chứ không giấu:** bot đi lang thang trong
Ardhaven 60 giây, bấm đánh liên tục, bật cả AUTO ⇒ **0 mạng**. Không phải lỗi — Ardhaven là
THÀNH, `packsOf` rỗng. Nhưng nó là đúng cái một người chơi mới sẽ làm, và game chỉ có **một**
đường ra: đèn hiệu nhiệm vụ. Bấm đèn hiệu thì kill đầu tới trong **1,4 giây**. Khoảng cách
giữa hai con số ấy — 60 giây không gì và 1,4 giây có ngay — là giá trị của cái đèn hiệu, và
cũng là rủi ro nếu người chơi không nhận ra nó.

## ③ Product vision — **8,0**

`docs/AXIE_CORE.md §7` nêu ba lớp mở rộng, và cả ba giữ đúng một lằn ranh: **Axie không bao
giờ cho một điểm chỉ số nào.** Lộ trình online 7 giai đoạn (`docs/KHAO_SAT_ONLINE.md`) có nêu
**chỗ dừng** — mọi thứ có giá trị lâu dài (sinh vật phẩm, cộng tiền tệ, máu boss chung) phải
đợi tới lúc có tài khoản thật, chứ không nhét vào relay hiện tại.

Trừ điểm vì: lộ trình mạnh ở phần *sâu thêm*, mỏng ở phần **giữ chân người chơi ở đoạn giữa**
— đúng cái lỗ mà mục ② vừa nói.

## ④ Feasibility — **9,5**

| | |
|---|---|
| Đang chạy thật | http://14.225.204.107/ , deploy bằng cron 2 phút/lần từ `main` |
| Bước dựng | **không có** — `public/game/` là ứng dụng tĩnh tự chứa |
| Phụ thuộc lúc chạy | **0** — canvas 2D + JS thuần |
| Máy chủ online | **2 tệp**, 0 phụ thuộc, chỉ cần `node` (WebSocket tự viết) |
| Cơ sở dữ liệu | không có; tiến trình lưu ở `localStorage` |

Không phải 10 vì một lý do vận hành nói thẳng: **sandbox không SSH được vào VPS** (cổng 22 bị
chặn, IP không nằm trong allowlist proxy), nên mọi bước cài đặt trên máy chủ phải do chủ dự
án chạy tay. Đó là ma sát thật, dù không ảnh hưởng người chơi.

## ⑤ Prototype & docs — **8,5**

**239 bài kiểm Playwright** lái game thật trong Chromium thật, cộng 7 bài vitest, cộng CI trên
mọi lần đẩy. `CLAUDE.md` là đặc tả sống **và** là nhật ký khám nghiệm — mỗi quyết định nằm
cạnh phép đo sinh ra nó, và mỗi lần đo sai đều được ghi lại kèm lý do.

**Trừ điểm, và trừ vì một chuyện có thật vừa tìm ra hôm nay:**

`tools/reg.sh` chấm đỏ/xanh **bằng mã thoát**. Sáu bài kết thúc bằng
`console.log(ok ? 'PASS' : 'FAIL')` rồi hết hàm ⇒ Node thoát **0** ⇒ chúng in chữ `FAIL` giữa
log mà bảng tổng kết vẫn đếm là **XANH**. Dựng lại được hôm nay trên `main`:

```
test_story        rc=0  in ra FAIL
test_mobbalance   rc=0  in ra FAIL
test_flinch/golden/hero/moblevels  rc=0  in ra PASS  (đang xanh thật, nhưng sẽ câm cùng kiểu)
```

Tức **hai bài đã tự nhận là hỏng từ lâu mà không lượt hồi quy nào nói ra**. Bản vá nằm ở
nhánh `claude/lucid-ritchie-9rgwpb` (chưa trộn — xem `docs/CHUA_HOAN_THIEN.md`).

*Một bộ kiểm chấm bằng mã thoát thì mọi bài quên `process.exit` đều là một bài xanh giả — và
không ai đọc log của một bài xanh.*

---

## Ba thứ đáng làm trước khi nộp, xếp theo tỉ lệ ăn/công

1. **Trộn `claude/lucid-ritchie-9rgwpb`** — trả lại tính trung thực cho cả bộ kiểm. Trộn sạch,
   đã thử.
2. **Trộn `claude/eager-dirac-oiyma6`** — phim mở đầu Khế Ước (clip 10,7 giây có tiếng) cộng
   vũ khí cầm tay. README hiện ghi *"Not included: a demonstration video"*; nhánh này không
   phải video giới thiệu, nhưng nó là thứ duy nhất trong dự án mang tính điện ảnh. Trộn sạch,
   đã thử.
3. **Đổi mô tả và topic của repo GitHub** — hiện `description` đúng một chữ `axierift`, và
   `homepage` trỏ tới `?test=1` chứ không kèm `&lang=en`. Giám khảo mở link đầu tiên là thấy
   tiếng Việt.

---

## Bổ sung 2026-09-21 — bản tiếng Anh nay **sạch trên mọi mặt đo được**

Hai đợt việc chủ dự án chốt (*"làm phần dạy trục Axie và dịch thuật"*) đã xong. Số đo:

| mặt | trước | sau |
|---|--:|--:|
| tầng kể chuyện (`test_dichen §④`, 7 mặt) | 190 chuỗi | **0** |
| quét rộng 5 lớp × 7 cấp × 4 bảng × mọi NPC | 418 dòng | **0** |
| quét sâu bảng NPC — 1.044 lượt bắt chuyện, 2 map × 6 cấp × 6 mốc nhiệm vụ | 18 dòng | **0** |
| băng-rôn giữa màn (`zoneBanner`), chuỗi THUẦN | 59/65 chưa dịch | **0** |

**Bài học lớn nhất của đợt, và nó đáng cho mục ⑤ hơn là mục này:** ba mặt sau **không mặt nào**
bị bài kiểm cũ chạm tới, dù cả bảy trần của `§④` đều đã về 0 và bài xanh. `§④` bơm chuỗi vào một
`<div>` RỜI ⇒ nó chứng minh *dịch được*, không chứng minh *tới được mắt người chơi*; `§③` quét 15
bảng nhưng bảng NPC chỉ dựng ra khi bấm E; `§②` bọc `fillText` nên chỉ thấy băng-rôn nào tình cờ
nổ trong 30 giây. Mặt băng-rôn lộ ra **hoàn toàn do may** — lượt chạy rơi trúng mốc giờ thật.

⇒ `test_dichen` nay có **`§⑥`** mở bảng NPC thật (2 map × 2 cấp × mọi NPC, chốt tự kiểm ≥20 lượt).
Mặt băng-rôn thì **vẫn chưa có bài gác** — nói thẳng chứ không giấu; xem
`docs/CHUA_HOAN_THIEN.md §5`.

Và một phép hồi quy mới cho chính bản dịch: so `tr()` của **1.216 chuỗi** giữa bản cũ và bản mới
⇒ **đúng 1 chuỗi đổi, và là chuỗi cố ý đổi**. Nó gác đúng kiểu hỏng mà mọi phép dò "còn tiếng
Việt không" đều mù: `RULES` khớp theo thứ tự, nên một luật RỘNG `unshift` lên trên có thể nuốt
một luật HẸP đã có — cho ra chữ **tiếng Anh KHÁC**, không phải tiếng Việt. Đã dẫm đúng thế một
lần trong chính đợt này (`/^ĐAI (.+)$/` nuốt `/^ĐAI (NGOẠI VI|TRUNG TÂM|HẠT NHÂN)$/`).
