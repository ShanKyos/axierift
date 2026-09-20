# ĐẶC TẢ · LÒ KHẮC — mini-game roguelite chọn thẻ

> Nguồn cảm hứng: **Wanderburg** (Randwerk, Steam EA 08/09/2026) — roguelite lái lâu đài, vũ khí
> tự bắn + module lắp thêm. Chỉ mượn **nửa Vampire-Survivors**; nửa vật lý xe cộ **cố ý bỏ**,
> lý do ở §9.
>
> Trạng thái: **§1-§8 ĐÃ THI CÔNG.** §9 là nợ có chủ ý.

---

## 1. Một câu

Một **sảnh đấu riêng**, 15 đợt quái, **dọn sạch mỗi đợt thì chọn 1 trong 3 lá Nếp Khắc**. Thẻ
chồng lên nhau, **chỉ sống trong lượt đó**. Chết hay trọn lượt đều giữ phần thưởng đã ăn.

**Một lượt 4,5 – 9 phút**, đo bằng probe chạy thật (§11) — cùng khung mà Wanderburg đặt ra
(~15 phút / 4 boss).

## 2. Vì sao mode này KHÔNG phải nhân bản

Tài liệu gốc của dự án mở đầu bằng một chẩn đoán: *nội dung đang được làm bằng cách nhân bản*.
Nên mode thứ hai kiểu "vào, đánh, ra" phải chứng minh nó khác **Tầng Sâu** ở chỗ nào.

| | Tầng Sâu | **Lò Khắc** |
|---|---|---|
| Câu hỏi người chơi phải trả lời | *"xuống thêm một tầng nữa không?"* | *"khắc nếp nào?"* |
| Trục | **tham / rút** | **build** |
| Chết thì | mất sạch kho tạm | **giữ nguyên** phần đã ăn |
| Sức mạnh trong lượt | chỉ số thường của ngươi | chỉ số thường **+ chồng thẻ** |
| Nhịp | dài, không đáy rõ (20 tầng) | **15 đợt, có kết** |
| Giới hạn | không | **3 lượt / ngày** |

Hai mode dùng chung **khung sảnh mở** và **máy sinh quái theo cấp** — đó là dùng lại máy, không
phải nhân bản nội dung. Thứ mới duy nhất là **bộ thẻ**, và nó là thứ Tầng Sâu không có.

## 3. Canon — vì sao nó tên là Lò Khắc

Giáo lý Bug tribe là **Nếp Khắc Vừa**: *khắc vừa đúng cái phiến đá gánh nổi, và đừng bao giờ
khắc một cái luật phải giữ mãi mãi.*

Lò Khắc là chỗ tập đúng câu đó: ngươi khắc luật **lên chính mình**, và luật **tan khi lượt kết
thúc**. Đó là cách làm ĐÚNG.

**DRUE** làm cách sai — hắn khắc vào chính mình và giữ luôn. Nên lá Cổ Vật `khac_vao_minh`
(+50% sát thương, −30% máu tối đa) **mang tên hắn** và là lá duy nhất lấy đi một thứ để đổi.

⇒ Không đẻ danh từ riêng mới, không đụng bảy phiến Rune, không đẻ nhánh cốt truyện thứ hai.

## 4. Map riêng — `lokhac`

| | |
|---|---|
| Khoá | `lokhac` · tên **Lò Khắc** |
| Khổ | **2600 × 1900** — bắt buộc, xem ⚠ dưới |
| Vào | cổng `portal` ở Sapidae Chiefdom `(3680, 2500)`, phím **G**, cần **cấp 15** |
| Ra | cổng `(1300, 1660)` → về Sapidae Chiefdom |
| Điểm thả | `(1300, 1560)` |
| Sảnh | `LK_HALL = { cx:1300, cy:1000, r:420 }` |
| Art | **0 tệp mới** — nền phẳng `ground:'#4a3a34'` / `patch:'#2a1d18'`, `dark:true`, như `deep` |

⚠ **`md.dungeon:true` ⇒ khổ map BỊ ÉP 2600×1900.** `obstaclesOf()` trả thẳng `DGN_OBSTACLES`
— một khung tường chép cứng cho khổ đó. Khai `w`/`h` khác là nhân vật đi ra ngoài tường.

⚠ **`dgnWallObs()` PHẢI thoát sớm khi `LK` đang chạy.** Hàm đó dựng hai bức tường ngăn phòng và
chỉ chừa khe khi `DGN.doorOpen[i]` bật. `LK` chạy với `DGN === null` ⇒ điều kiện
`!(DGN && DGN.doorOpen && ...)` thành **true** ⇒ **cả hai khe bị bịt kín**, người chơi kẹt cứng
trong phòng 1 và không lỗi nào báo. Sửa: `if (DEEP || LK) return []`.

⚠ **Sảnh phải là MỘT phòng mở**, không phải ba phòng của `DGN_ROOMS`. Lý do đã ghi sẵn ở khối
Tầng Sâu: tầm quét AUTO là 430px, ba tâm phòng cách nhau tới 960px ⇒ AUTO neo ở phòng 1 không
bao giờ với tới quái phòng 3, đợt không bao giờ sạch. `LK_HALL.r = 420` nằm gọn trong 430.

## 5. Vòng một lượt

```
vào cổng ─→ đợt 1 ─sạch→ [CHỌN THẺ] ─→ đợt 2 ─sạch→ [CHỌN THẺ] ─→ … ─→ đợt 15 ─→ TRỌN LƯỢT
                │
                └─ chết ─→ kết thúc lượt, GIỮ phần thưởng đã ăn
```

- **15 đợt.** Đợt **5 · 10 · 15** là **đợt trùm** (1 con, không phải bầy).
- Quái đợt `w`: số con `min(18, 4 + w)`, máu `×(1 + w·0,14)`, công `×(1 + w·0,07)`.
  Trùm: máu `×(1 + w·0,22)`, công `×(1 + w·0,07)`.
- **Dọn sạch mỗi đợt hồi 25% máu & Mana.** Không phải quà — không có nó thì 15 đợt liên tiếp là
  một trận tiêu hao người chơi chắc chắn thua (đo được: gục ở đợt 4 ở cả ba mức cấp).
- Loài bốc **từ cấp người chơi TRỞ XUỐNG** (`lv−26 … lv`). Tầng Sâu lọc hai chiều `±22` vì nó
  có 20 tầng để leo dần; ở đây lọc hai chiều là ngay đợt 1 người cấp 40 đã gặp loài cấp 62.
- ⚠ **Quái rải theo ĐĨA, không theo hộp** — xem §11, đây là lỗi treo cả lượt.
- ⚠ **Đợt trùm TỰ TẮT AUTO** và nói ra, đúng khuôn `spawnHuntBoss()`: `autoCfg.boss` mặc định
  false nên để AUTO bật là người chơi đứng im trước trùm vô thời hạn, không biết vì sao.
- Quái mang cờ `lkMob` ⇒ **không rơi gì, không cho EXP trực tiếp** (thoát sớm trong `killMob`,
  đúng khuôn `deepMob`). Thưởng trả một cục lúc kết lượt.

## 6. Bộ thẻ — `NEP_KHAC`

**18 lá / 3 bậc.** Khai trong `data/canbang.js` (đây là dữ liệu cân bằng — sửa nó không phải mở
tệp 29k dòng).

### Luật rút
| đợt | bậc được rút |
|---|---|
| 1-3 | Thường |
| 4-7 | Thường · Hiếm |
| 8+ | cả ba |

Trọng số `70 / 25 / 5`. Mỗi lần bày **3 lá KHÔNG trùng nhau**, lá đã chạm trần `lap` bị loại.
Đợt trùm cho **2 lượt chọn**.

### Bậc 1 · Thường — chỉ đổi CON SỐ (8 lá)
`mai_luoi` +16% ST · `gan_thep` +14% máu · `buoc_nhe` +10% tốc chạy · `nhip_gap` −10% hồi chiêu ·
`mach_rong` +18% Mana · `mat_sac` +5đ% bạo kích · `da_day` +12% giáp · `tay_nhanh` +8% tốc đánh

### Bậc 2 · Hiếm — đổi CÁCH ĐÁNH (5 lá)
| lá | làm gì |
|---|---|
| `no_xac` | quái chết nổ — 25% máu tối đa của nó lên mọi con trong 120px |
| `hut_mau` | hồi 4% sát thương gây ra |
| `giap_gai` | phản 30% sát thương nhận |
| `suong_bang` | quái trúng đòn chậm 25% trong 2 giây |
| `thu_hon` | quái chết hồi 3% Mana |

### Bậc 3 · Cổ Vật — đổi LUẬT (5 lá, `lap:1`)
| lá | làm gì |
|---|---|
| `khac_vao_minh` | **+50% ST, −30% máu tối đa** — lá của DRUE, lá duy nhất lấy đi một thứ |
| `nep_vua` | dọn sạch mỗi đợt **hồi đầy** máu & Mana |
| `hai_luoi` | đòn thường đánh thêm một nhát **55%** |
| `lo_chua_nguoi` | ST tăng **3%/giây** trong đợt, trần +60%, **reset mỗi đợt** |
| `chong_chat` | mỗi đợt sạch **+6% ST** cộng dồn tới hết lượt |

⚠ **Bậc 1 cố ý chỉ đổi con số, và đó KHÔNG phải lỗi lười.** Tài liệu dự án đã tự phê đúng chỗ
này ở `EVO_PATHS` (*"hai nhánh đầu chỉ đổi CON SỐ"*). Khác nhau ở đây: bậc 1 là **nền**, người
chơi chồng 4-6 lá trước khi gặp lá đổi hành vi đầu tiên — nếu MỌI lá đều đổi luật thì không lá
nào đọc ra là đặc biệt. Tỉ lệ `70/25/5` là thứ giữ cho lá Cổ Vật còn là một khoảnh khắc.

## 7. Hợp đồng thi công — **MỘT CỬA, KHÔNG PHẢI MƯỜI**

Đây là ràng buộc nặng nhất của cả đặc tả.

`calcDerived()` · `hurtMob()` · `castSkill()` · `killMob()` là bốn hàm trung tâm của game.
Mini-game này chạm vào chúng **đúng bốn chỗ, mỗi chỗ một khối**, và mọi thẻ đọc qua **một
hàm cộng duy nhất**:

```
lkCong(khoa)  →  tổng giá trị của khoá đó trên mọi lá đang cầm
```

| chạm ở đâu | làm gì |
|---|---|
| `calcDerived()`, ngay trước `player.hp = Math.min(...)` | cộng `atkPct · hpPct · spdPct · cdPct · qiPct · critPP · defPct · aspdPct` + `hpLeech` + `reflect` |
| `hurtMob()`, ngay trước `final = Math.max(1, Math.round(final))` | nhân `lkDmgMul()` (gồm `lo_chua_nguoi` và `chong_chat`) |
| `killMob()`, **trước** nhánh thoát `lkMob` | `no_xac` · `thu_hon` · đếm quái đợt |
| `update()`, cạnh `updateDeep()` | `lkTick(dt)` — đợt sạch? → mở bảng thẻ |

**Không** dựng bảng chỉ số thứ hai, **không** ghi đè `player.atk` ở chỗ khác, **không** móc vào
sáu chỗ. Lượt kết thúc ⇒ `LK = null` ⇒ `calcDerived()` ⇒ mọi thẻ biến mất, không phải dọn tay.

⚠ **`lkCong` phải trả 0 khi `LK` là `null`.** Đó là thứ giữ cho khối trong `calcDerived` vô hại
với 100% thời gian người chơi ở ngoài mini-game.

## 8. Phần thưởng — **KHÔNG CÓ EXP. Cố ý.**

`XP_TABLE` được dẫn ra từ số đo (`tools/do_nhipcap.cjs` → `tools/can_exp.cjs`), mốc là ~3 giờ
tới cấp 60. Cắm một nguồn EXP mới là **nói dối cái mốc đó mà không lỗi nào báo**.

| | |
|---|---|
| Mỗi đợt sạch | `80 × đợt × (1 + cấp/40)` Lumen · `25 × đợt` Bản Năng |
| Đợt trùm (5·10·15) | +1 **Box Kundun**, tầng `min(shopBaoHapTier(), đợt/5 + 2)` ⇒ bậc III·IV·V |
| Trọn 15 đợt | +1 **Ấn Giao Kết** · +3 **Shard** · thưởng Lumen ×1,5 |
| Trần | **3 lượt / ngày** (`player.lokhac = { day, luot }`) |

Trần ngày là thứ giữ cho nó là một **sự kiện**, không phải một bãi cày thứ tám.

## 9. Thứ CỐ Ý không làm — và vì sao

**Vật lý xe cộ.** Wanderburg dạy người chơi đúng một kỹ năng: **quán tính và bán kính quay đầu**.
Engine này **không có vật lý** — đo được: di chuyển là click-to-move qua `moveTarget` →
`simulateMovePath` → **dời thẳng toạ độ**; không thực thể nào có `vx`/`vy`; ngay cả hất lùi
(`vhKnockback`) cũng là một phép cộng vị trí tức thời, không phải xung lực.

Dựng lại nửa đó nghĩa là: tích phân vận tốc, va chạm trượt theo vách, camera đuổi theo tốc độ —
một hệ mới đứng cạnh, không phải một tính năng. `update(dt)` đã ăn delta-time nên **làm được**,
nhưng đó là một đợt riêng và phải gọi đúng tên nó.

⇒ Bản này lấy nửa **Vampire Survivors** (tự đánh + chồng module) vì nửa đó **đã có sẵn** trong
game: `player.auto` + `autoCfg`, máy sinh bầy quái, kinh tế rơi-nâng. Nửa còn lại thì nói thẳng
là chưa có, thay vì làm một bản nhạt của nó.

**Ba thứ khác để lại cho v2:**
- **San bằng chỉ số.** Cho mọi người vào lò cùng một khuôn thì thẻ mới là toàn bộ trò chơi —
  đúng tinh thần Vampire Survivors. Nhưng nó đồng thời nói với người chơi rằng bộ đồ họ cày cả
  tuần không có giá trị ở đây. Đó là một quyết định thiết kế của chủ dự án, không phải của tôi.
- **Thẻ theo lớp.** 5 lớp dùng chung một bộ 18 lá ⇒ chưa có build riêng cho lớp nào.
- **Bảng xếp hạng / lượt chơi cùng nhau.** Đợi Giai đoạn 2 của phần Online.

## 10. Bài kiểm — `tests/test_lokhac.js`

7 mệnh đề, và **ba trong bảy gác đúng những chỗ im lặng**:

| # | gác gì |
|---|---|
| ① | vào lò ⇒ `LK` sống, quái đợt 1 sinh ra, và **hai khe cửa KHÔNG bị bịt** (bẫy `dgnWallObs`) |
| ② | `lkCong` trả **0** khi `LK` null — tức khối trong `calcDerived` vô hại ngoài mini-game |
| ③ | chồng thẻ ĐO ĐƯỢC: `mai_luoi` ×5 phải nâng sát thương THẬT trong `hurtMob`, không phải chỉ đổi một con số trên bảng |
| ④ | dọn sạch đợt ⇒ bảng thẻ hiện, **đúng 3 lá, không lá nào trùng**, không lá nào vượt `lap` |
| ⑤ | luật rút theo đợt: đợt 1-3 **không bao giờ** ra lá bậc 2/3 |
| ⑥ | rời lò bằng BẤT KỲ đường nào ⇒ `LK = null` và chỉ số **về đúng như trước khi vào** |
| ⑦ | trần 3 lượt/ngày chặn thật, và **`player.lokhac` sống qua `saveGame`/`loadGame`** |

⚠ ③ phải **bọc `hurtMob` để đọc sát thương thật**, không được hỏi `player.atk`. Bài hỏi bảng
chỉ số sẽ xanh kể cả khi nhân nhầm chỗ — đúng bài học đã ghi ở `test_tiemnang §5`.

⚠ ⑥ phải đi **cả ba đường ra** (cổng G · nút Rời Lò · `travelTo` từ bảng Bản Đồ). Đây chính là
cái bẫy `DEEP` đã dẫm: chỉ `updateGate()` có chốt, nên teleport ra ngoài để `DEEP` sống và quái
Tầng Sâu sinh ra giữa thành.


## 11. Bốn lỗi mà PROBE CHẠY THẬT tìm ra — bài kiểm lái-bằng-hàm KHÔNG thấy cái nào

`tests/test_lokhac.js` xanh 18/18 ngay lượt đầu, và cả bốn lỗi dưới đây vẫn còn sống. Chúng chỉ
lộ ra khi cho AUTO chạy thật 15 đợt và nhìn con số. Ghi lại vì đây là bài học chung, không phải
chuyện riêng của mini-game này.

| # | Triệu chứng | Nguyên nhân |
|---|---|---|
| ① | Đợt 1 dọn được 4/7 con rồi **treo vĩnh viễn** | `spawnMob(t, zone)` rải theo **HỘP** `±r`, góc hộp xa tâm `r·√2`. Ở r=420 là 594px, cộng 560px từ điểm thả ⇒ con xa nhất cách người chơi 1.154px, gấp 2,7 lần tầm quét 430 của AUTO. Chữa: rải theo **ĐĨA** r=380, nén 0,85 theo trục sâu. |
| ② | Kẹt ở **đợt 5** suốt 24 phút mô phỏng | `autoCfg.boss` mặc định **false** — AUTO không đánh trùm. Chữa: đợt trùm **tự tắt AUTO và nói ra**. |
| ③ | Cấp 40/60/90 trang bị đúng cấp đứng **33 phút** không dọn nổi đợt 1 | Khối AUTO **đã có sẵn** ca đặc biệt cho Tầng Sâu (ghim neo mỗi khung + nới tầm quét lên 900) mà Lò Khắc không có. Chữa: dùng lại đúng cơ chế đó, không dựng cơ chế thứ hai. |
| ④ | Bảng tổng kết thưởng **không bao giờ hiện** | `lkXong()` đặt `zoneBanner` **trước** `travelTo()`, mà `travelTo()` tự ghi đè banner bằng tên vùng nó vừa tới. Thứ hiện ra cuối lượt là đoạn mô tả Sapidae Chiefdom. |

⚠ **Lỗi ④ còn SỐNG ở `deepLeave()`** — cùng một dòng, cùng một thứ tự, và Tầng Sâu đã ship như
thế từ lâu: bảng tổng kết 20 tầng bị banner "Sapidae Chiefdom" nuốt trọn. Không sửa trong đợt
này để giữ diff đúng phạm vi, nhưng nó là một lỗi thật, không phải suy đoán.

### Số đo hiện tại (probe, AUTO bật, chọn thẻ NGẪU NHIÊN — tức cận DƯỚI)

| nhân vật | tới đợt | thời gian | Lumen |
|---|---|---|---|
| cấp 40, trang bị cấp 40 +4 | 10/15 | 4,5 phút | 7.200 |
| cấp 60, trang bị cấp 60 +6 | 15/15 (gục ở trùm cuối) | 7,8 phút | 21.000 |
| cấp 90, trang bị cấp 90 +8 | 15/15 (gục ở trùm cuối) | 8,6 phút | 27.300 |
| full BiS (`applyTestBoost`) | **trọn 15** | ~1 phút chiến đấu | 57.600 |

Thời gian mỗi đợt tăng dần 11 → 66 giây. Đây là **cận dưới**: probe luôn bấm lá đầu tiên và
không né gì cả.

⚠ **Cân bằng tinh CHƯA làm, và đừng giả vờ là đã.** Bốn hàng trên là bốn mẫu, không phải một
phép đo. Muốn chốt thì phải theo đúng lối `tools/do_nhipcap.cjs` đã làm cho `XP_TABLE`: đo nhiều
lượt, nhiều lớp, nhiều mức trang bị, rồi mới dẫn ra con số.
