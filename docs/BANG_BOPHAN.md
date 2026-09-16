# Bảng sáu bộ phận Axie

> ⚠ **TỆP NÀY SINH BẰNG MÁY — `node tools/bang_bophan.cjs`. Đừng sửa tay.**
> Nguồn duy nhất là `bp:` trong `public/game/data/canbang.js`; nhóm tam giác và hai hằng độ
> sắc đọc thẳng từ `public/game/game.js`. Sửa ở đây thì lần chạy sau ghi đè, và trong lúc chờ
> thì tài liệu nói một đằng còn game chạy một nẻo.

Một con Axie luôn dựng từ **đúng sáu bộ phận** (`.claude/skills/axie-hinh-hoa` §1): Mắt · Tai ·
Sừng · Miệng · Lưng · Đuôi. **`cung`** là số bộ phận thuộc **cùng nhóm tam giác** với `lop` của
chính con đó, và nó điều khiển **độ sắc** của hệ số phòng thủ — không điều khiển sức mạnh.

Ba nhóm của tam giác: **① Beast · Bug · Mech** ▶ **② Plant · Reptile · Dusk** ▶ **③ Aquatic · Bird · Dawn** ▶ ①

| `cung` | hạng | độ sắc | nghĩa là |
|---|---|--:|---|
| 5–6 | **Thuần** | 1.325–1.50 | chuyên gia — rất nhẹ đòn ở vùng hợp, rất nặng ở vùng khắc |
| 3–4 | **Pha** | 0.975–1.15 | cân — mạnh yếu vừa phải ở cả hai phía |
| 0–2 | **Tạp** | 0.45–0.80 | thợ đụng — không bao giờ tệ, không bao giờ xuất sắc |

**Kỳ vọng trên cả chín lớp quái bằng nhau cho MỌI con** — bằng nhau chính xác, theo phép dựng
chứ không theo may mắn chọn số. Đổi Axie đổi *hình dạng* rủi ro, không đổi *tổng*.
Xem `CLAUDE.md` mục ▲▲ và `tests/test_bophan.js`.

## 16 con — xếp từ thuần nhất tới tạp nhất

| Axie | ★ | Lớp | Mắt | Tai | Sừng | Miệng | Lưng | Đuôi | `cung` | Hạng | Sắc |
|---|--:|---|---|---|---|---|---|---|--:|---|--:|
| **Hexmite** | 4 | ✽ Bug | ✽ Bug | ✽ Bug | ✽ Bug | ✽ Bug | ✽ Bug | ✽ Bug | **6**/6 | Thuần | 1.500 |
| **Ironshell** | 5 | ▲ Reptile | ▲ Reptile | ▲ Reptile | ▲ Reptile | ▲ Reptile | ▲ Reptile | ♣ Plant | **6**/6 | Thuần | 1.500 |
| **Aurelion** | 5 | ☼ Dawn | ☼ Dawn | ☼ Dawn | ☼ Dawn | ☼ Dawn | ✦ Bird | ♣ Plant | **5**/6 | Thuần | 1.325 |
| **Emberjaw** | 5 | ✹ Beast | ✹ Beast | ✹ Beast | ✹ Beast | ✹ Beast | ◆ Mech | ✦ Bird | **5**/6 | Thuần | 1.325 |
| **Mossback** | 4 | ♣ Plant | ✹ Beast | ✹ Beast | ♣ Plant | ♣ Plant | ♣ Plant | ♣ Plant | **4**/6 | Pha | 1.150 |
| **Tidewarden** | 5 | ❄ Aquatic | ❄ Aquatic | ❄ Aquatic | ❄ Aquatic | ❄ Aquatic | ▲ Reptile | ♣ Plant | **4**/6 | Pha | 1.150 |
| **Cinderbeak** | 4 | ✦ Bird | ✦ Bird | ✦ Bird | ✹ Beast | ✦ Bird | ✹ Beast | ✹ Beast | **3**/6 | Pha | 0.975 |
| **Crimsonmaw** | 4 | ✹ Beast | ✹ Beast | ✹ Beast | ▲ Reptile | ✹ Beast | ▲ Reptile | ▲ Reptile | **3**/6 | Pha | 0.975 |
| **Netherfang** | 5 | ☾ Dusk | ☾ Dusk | ◆ Mech | ◆ Mech | ☾ Dusk | ☾ Dusk | ◆ Mech | **3**/6 | Pha | 0.975 |
| **Petalkin** | 4 | ♣ Plant | ♣ Plant | ♣ Plant | ✦ Bird | ♣ Plant | ✦ Bird | ❄ Aquatic | **3**/6 | Pha | 0.975 |
| **Thornpaw** | 4 | ♣ Plant | ♣ Plant | ✹ Beast | ♣ Plant | ✹ Beast | ♣ Plant | ✹ Beast | **3**/6 | Pha | 0.975 |
| **Ridgehorn** | 4 | ▲ Reptile | ✹ Beast | ✹ Beast | ▲ Reptile | ✹ Beast | ▲ Reptile | ✹ Beast | **2**/6 | Tạp | 0.800 |
| **Sunspur** | 4 | ☼ Dawn | ☼ Dawn | ✹ Beast | ✹ Beast | ✹ Beast | ☼ Dawn | ✹ Beast | **2**/6 | Tạp | 0.800 |
| **Voltcrest** | 5 | ✦ Bird | ◆ Mech | ✦ Bird | ◆ Mech | ◆ Mech | ✦ Bird | ◆ Mech | **2**/6 | Tạp | 0.800 |
| **Inkmane** | 4 | ☾ Dusk | ❄ Aquatic | ❄ Aquatic | ❄ Aquatic | ❄ Aquatic | ☾ Dusk | ❄ Aquatic | **1**/6 | Tạp | 0.625 |
| **Coghound** | 4 | ◆ Mech | ❄ Aquatic | ♣ Plant | ▲ Reptile | ✦ Bird | ☾ Dusk | ☼ Dawn | **0**/6 | Tạp | 0.450 |

## Số đo

| | |
|---|--:|
| tổng `cung` trên 16 con | **52** |
| trung bình `cung` | **3.25**/6 |
| **độ sắc trung bình** | **1.019** |

Độ sắc trung bình phải nằm quanh **1,00** — đó là mốc của bản *trước* đợt bộ phận, nên lệch khỏi
nó là lặng lẽ đổi độ khó chung của cả game trong khi cơ chế này chỉ được phép đổi *hình dạng*.
`tests/test_bophan.js §1` kẹp trong **[0,95 – 1,05]**.

## Hai luật khi thêm hoặc sửa một con

1. **Bộ phận suy từ `moTa` đã có, đừng bịa cạnh nó.** `coghound` — *"ai đó lắp nó lại từ mảnh
   vỡ"* — có đúng **0** bộ phận thuộc lớp của chính mình; `inkmane` — *"vằn đen trên lưng nó đổi
   chỗ mỗi lần bạn quay đi"* — có đúng một, và đó là cái **Lưng**. Dữ liệu đọc ra phải là con vật
   mà câu mô tả đang tả.
2. **Độ thuần KHÔNG được đi theo số sao.** Nếu 5★ nào cũng thuần hơn thì người chơi đọc ra
   *"5★ mạnh hơn"*, mà đó đúng là thứ gacha không được bán. Hiện một trong hai con thuần nhất là
   **4★**. `test_bophan §1` gác.
