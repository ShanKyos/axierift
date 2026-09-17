# Nhật ký phiên

Ghi lại những gì đã làm, và quan trọng hơn: **những con số đã đo được** và **những chỗ đã đoán
sai**. Phần thứ hai mới là thứ có giá trị về sau — nó là danh sách các cái bẫy đã bước vào.

---

## 2026-09-17 — Trong thành mang bên vai · ngoài thành vũ khí XUẤT HIỆN lúc ra đòn

Chủ dự án: *"thôi dễ nhất là khi ở trong thành, cho vũ khí khoác lên vai (kiểu khu an toàn).
Sau đó khi nhân vật ra đòn ở bãi quái thì chỉ cần xuất hiện vũ khí thôi."*

### Đo trước khi làm — và phép đo ĐẦU TIÊN của tôi mù

Đo trục cây vũ khí bằng **lưới mesh** của bản mẫu ⇒ cả **bốn** gói ra **y hệt nhau** (lệch dọc
72,8°, dài 1230, hộp bao trùng khít). Lưới là của bản mẫu, chỉ ART bên trong khác — nên nó
không đo được cái cần đo. Đếm **điểm ảnh của riêng lớp `vk`** thì ra bốn số khác nhau, và
chúng **khớp con số đã ghi trong CLAUDE.md** (44,8° cho cây cung), tức phép đo đã tự kiểm được:

| gói | trục lệch DỌC | dài | mũi cây |
|---|---|---|---|
| Dark Knight | 52,0° | 971 | **dưới mặt đất** |
| Fairy Elf | 44,8° | 898 | **dưới mặt đất** |
| Magic Gladiator | 52,1° | 1100 | **dưới mặt đất** |
| Dark Lord | 58,7° | 1018 | **dưới mặt đất** |

### "Khoác chéo sau lưng" là BẤT KHẢ, và đó là số chứ không phải ý thích

Cây dài 898–1100 trên thân cao 1166 (**77–94%**). Dựng ảnh cho tư thế chéo 25°: mũi ở y=27
trong khi gót ở y=−44 ⇒ **cắm đất**, và cán thì **đè lên mặt**. Chỉ tư thế gần DỌC sạch cả hai
đầu. Nên chốt là **dựng cây bên vai** — và nhờ vậy **không phải đổi thứ tự lớp** (`vk` vẫn nằm
giữa `a` và `t2`), thứ mà `test_lopdo §1` đang gác và CLAUDE.md bắt phải khớp với bộ nướng.

Vặn: `dkph1` **+147°** · `sbsm1` **+147°** · `elnb1` **+139°**. Đáy cây trong ô 240×300 từ
271–289 (dưới gót 252) về **197–200**.

### Lỗi CÓ SẴN mà đợt này lôi ra — ba khối nữa bị rig cất vũ khí

`00_Run` đặt khoá attachment RỖNG lên khe `左手武器` — đã biết và đã vá bằng `VK_HIEN`. Đo lại
cả 20 hoạt cảnh: **`09_Interactive`** · `07_StatusEffect` · `01_Dance` làm y hệt. Và `VK_HIEN`
chỉ được tra ở **bảng MỘT**, ba khối kia ở bảng hai ⇒ lớp `vk` của chúng **không có một điểm
ảnh nào**. Tức **bắt chuyện với một NPC là cây kiếm biến mất khỏi tay**, ở đúng chỗ duy nhất
lớp nhân vật còn hiện ra sau đợt nhập-vào-Axie.

`test_vklop ①` nghe như phủ hết (*"không khối nào có khung TRỐNG"*) nhưng danh sách khối của nó
chép tay tám cái, thiếu đúng bốn khối mang ở bảng hai. *Một mệnh đề phủ "mọi khối" mà danh sách
khối do chính bài kiểm chép tay thì nó chỉ phủ đúng cái danh sách ấy.*

### Lỗi CÓ SẴN thứ hai — hai lớp đứng trong thành TAY KHÔNG

Cửa cũ `_tkHien = (!_coAva || _lopHien) && !_coVkLop && !_nhap` nghĩa là: bật avatar lên thì
cây trượng bay **chỉ hiện lúc ra đòn**. Dark Lord và Dark Wizard cố ý không có vũ khí cầm tay
⇒ hai trong năm lớp đứng trong thành không cầm gì. Ba lớp kia có lớp `vk` nên không ai để ý.

### Nửa "ngoài thành" là một biểu thức

```js
const _tkHien = _nhap ? (atkK > 0 || castK > 0) : !_coVkLop;
```

`_coVkLop` **không được chặn ở nhánh đã nhập**: lớp `vk` biến mất cùng lớp nhân vật, nên giữ
cửa cũ là đúng ba lớp có art vũ khí đẹp nhất ra đòn **tay không**. Ba phép thử ngược đều đỏ
(cắm lại `!_coVkLop` ⇒ 3 FAIL · bật suốt ⇒ 5 FAIL · giữ cửa thành cũ ⇒ 2 FAIL).

### Công cụ

`nuong_nv.py --chilop vk` nướng lại đúng lớp được gọi tên — **3 giây** thay vì cả bộ. Hộp cắt
của một lớp không phụ thuộc lớp nào khác nên nướng lẻ ra đúng bằng nướng cả bộ.

---

## 2026-09-16 (b) — Cây vũ khí là một cái nhãn dán, suốt từ lúc nhập gói

Chủ dự án: *"Tư thế cầm cung sai, hãy nghiên cứu và chỉnh lại cách cầm cung cho đúng. Tương tự
hãy check lại với kiếm của dk và spellblade."*

### Số đo trước khi sửa

Đếm **hộp bao khác nhau** của lớp `vk` trên chính bảng khung mà game nạp:

| | đứng 16 | đi 32 | chạy 32 | **ĐÁNH 16** | niệm 16 |
|---|---|---|---|---|---|
| `dkph1` (kiếm Phượng) | 1 | 1 | **0** | **1** | 1 |
| `sbsm1` (Kiếm Sinh Mệnh) | 1 | 1 | **0** | **1** | 1 |
| `elnb1` (Cung Thiên Mệnh) | 1 | 1 | **0** | 3 | 1 |
| lớp tay `t2`, đối chứng | 14 | 32 | 32 | 16 | 16 |

Một vị trí trên mười sáu khung của khối ĐÁNH. Tay vung, kiếm đứng yên.

### Nguyên nhân

Xương `武器` có **cha là `root`**. Thứ đưa nó vào tay là **ràng buộc biến hình** —
`左手持剑`/`右手持剑`, đích là `左手持剑点`/`右手持剑点` (con của xương bàn tay). `hoatcanh.py`
cài IK và physics đầy đủ nhưng **chưa cài loại ràng buộc này**, nên vũ khí nằm ở tư thế gốc.

Đã chép `TransformConstraint.update` của Spine 4.2 (nhánh không `local`, không `relative`).
Sau khi cài: 14-16 · 32 · 32 · 15-16 · 16.

### Ba chỗ đã đoán sai

1. **Tôi suýt kết luận "bộ nướng lấy nhầm khe".** `KHE_VK` trỏ `左手武器*` nghe như "tay TRÁI"
   trong khi Dark Knight cầm tay phải — rất dễ tin là sai khe. Không phải: cả ba khe đều treo
   trên cùng một xương `武器`, và tay nào cầm là do ràng buộc nào đang bật. *Tên khe không nói
   được nó nằm ở đâu; phải đọc xương.*
2. **Phép dựng lại đầu tiên của tôi ra LỚP RỖNG và tôi tưởng mình vừa làm hỏng thêm.** Hoá ra
   gói `Dark_Knight.zip` **không có art vũ khí** (bốn vùng atlas đặc 0%) — cây kiếm nằm ở
   `Dark_Knight_1.zip`. Thân hai gói trùng khít từng điểm ảnh, nên nay nướng trọn từ gói sau.
3. **Giữ cung Ngọc Bích cho động tác giương cung thì TỆ HƠN.** Rig đổi sang một cung TRẮNG trơn
   (`左手武器2a`) khi giương; tôi tưởng đó là mảnh placeholder cần thay. Dựng ảnh A/B: cung ngọc
   không uốn theo dây nên chĩa ngang như một khẩu súng. Giữ cung trắng. *Cái xấu nhìn thấy được
   không phải lúc nào cũng là cái sai.*

### Và một thứ không phải lỗi của ta

Rig **cất vũ khí đi trong `00_Run`** (khoá attachment rỗng). Đúng với một game đánh bài, sai với
game này vì lớp nhân vật chạy gần như liên tục. `VK_HIEN` ép mảnh hiện lại; ràng buộc tay vẫn bật
trong `00_Run` nên nó tự nằm đúng tay.

### Và một vòng nữa: "cung thì không cầm vậy được"

Ràng buộc chạy đúng rồi mà chủ dự án vẫn gọi sai — lần này không phải lỗi máy. Bản mẫu chỉ có
**MỘT tư thế mang** (chuôi ở tay, thân chĩa chéo xuống trước). Đúng cho kiếm, sai cho cung: đo ra
trục chính của cây cung lệch **44,8°** so với phương dọc, tức nó nằm ngang ống chân như một cây
kích. Vặn thêm **−40°** ở mọi khối TRỪ `10_ArcheryAttack` (khối đó rig đã dựng đúng tư thế bắn).

Chốt bằng **ảnh A/B 0 · −32 · −40 · −48 trên cả ba khối** chứ không bằng một con số đẹp: `0` là
cây kích, `−48` thì mũi cung quặt ra sau. *Một phép chỉnh THỊ GIÁC thì phải chốt bằng mắt trên
ảnh, không chốt bằng công thức.*

### Giá phải trả

Hộp cắt lớp `vk` nay là hợp của cả cú vung ⇒ phình gần bằng cả ô (240×279, 240×300). Tệp +400 KB
cho ba bộ; bộ nhớ sau giải nén +~20 MB cho **đúng bộ đang mặc**. Cắt hộp theo từng khối sẽ gọn
hơn nhiều — chưa làm, ghi lại làm nợ.

### Và một nửa nữa mà ảnh chụp mới lôi ra

Chủ dự án hỏi tiếp: *"DK có đại long đao theo sau mà? kiểm tra lại hình ảnh đi"*. Dựng lại
được ngay: một Dark Knight cầm kiếm giai 3 thì `nvVkLop` trả `null` (bảng chỉ khai `kiem|7`),
`_tkHien` bật **thần khí**, và trên màn là một thanh đại kiếm cao gần bằng người **trôi lơ lửng**
cạnh nhân vật. Đo được **60/63** món của ba lớp rơi vào đường đó.

Thêm nấc lùi theo LỚP (`NV_VK_LOP_LOP`). Đánh đổi ghi thẳng ra: cây rìu giai 3 nay vẽ ra Phượng
Kiếm — hình trong túi và hình trên tay lệch nhau. Nhưng cái lệch đó sửa được bằng cách nướng
thêm bảng khung cho từng dòng, còn cây trôi lơ lửng thì không sửa được bằng mã.

⚠ Và mệnh đề gác nó **xanh vô nghĩa ở lượt đầu**: `genItem` chỉ sinh vũ khí của lớp ĐANG CHƠI,
nên nó quét đúng 21/63 món (ba dòng của một lớp) rồi báo PASS. Phải đổi `player.sect` theo từng
lớp, và thêm một chốt tự kiểm đòi ≥50 món mới cho chấm.

Gác: `tests/test_vklop.js`. Thử ngược: bảng khung cũ **27 FAIL**; gỡ nấc lùi theo lớp **60/63 FAIL**.

---

## 2026-09-16 — Con Axie bay lơ lửng, và cây cung không ai thấy

Nền: `c37c077`. Chủ dự án gửi một ảnh chụp kèm đúng hai câu:
*"hình bay như này sai quá sai"* · *"với lại cây cung thiên mệnh gắn theo nhân vật của mình đâu?"*

Hai câu, hai lỗi khác hẳn nhau, và **cả hai đều không ném lỗi, không bài kiểm nào đỏ**.

### ① Con Axie bay

Dựng lại được ngay trong vòng vẽ thật: đeo cánh bậc 3 thì **cả cặp** nhấc lên 24 px, vì khối BAY
bọc mọi thứ trong một `ctx.translate(0, yOff)`. Mà `veCanh()` thì đã được sửa từ đợt trước để vẽ
đôi cánh ở chỗ **lớp nhân vật** đứng — tức đôi cánh đeo trên kẻ hộ tống, còn con Axie thì bay
theo mà **không có cánh và không có hoạt cảnh bay nào**. Vòng chân và bóng đổ cũng co lại theo
`bayK`, nên trên màn là một cái thân treo cách chân đế của chính nó 24 px.

Sửa: `bayKNen` (chân đế còn chạm đất không) tách khỏi `bayK` (lớp nhân vật bay cao bao nhiêu), và
`veAvatarDat()` cộng `bayCao` lại để trả con Axie về đất. `/avatar off` thì `bayKNen === bayK`,
hành vi cũ y nguyên.

### ② Cây cung

`phatDoKhoiDau()` — bộ giai 7 của bản chơi thử — **chỉ chạy trong `newGame()`**. Người đang chơi
thử thì nhân vật đã tạo từ trước, nên họ không bao giờ nhận được nó. Và triệu chứng không đọc ra
là "thiếu đồ": lớp vũ khí **cầm tay** chỉ bật khi món đang đeo trùng `dòng|giai` trong
`NV_VK_LOP`, nên một cây cung giai 3 làm **cả lớp art biến mất** trong im lặng.

| đo được | |
|---|---|
| nhân vật MỚI, sau `phatDoKhoiDau` | `nvVkLop` = `elnb1` ✓ |
| save đời trước, cung giai 3 | `nvVkLop` = **null** — không cung, không cả thần khí |
| sau `demoDoDiTru()` | `elnb1`, năm ô đều giai 7, đồ cũ nằm trong túi |

### Ba chỗ đã đoán sai

1. **Tôi đã hai lần định kết luận "lớp vũ khí nướng hỏng".** Dựng dải 32 khung của khối ĐI ra xem
   thì cây cung nằm **đúng trong tay**, chỉ là nó dài và chúc xuống nên ở cỡ 40 px trên màn đọc
   thành một cái que bắc ngang ống chân. *Art không hỏng — sợi dây tới nó mới hỏng.*
2. **Phép di trú đặt sai chỗ, và số đo tố cáo nó.** Bản đầu tôi gọi `demoDoDiTru()` cạnh
   `cotDiTru()`. Bộ giai 7 vừa phát ra **giai 5**: `migrateGiai14` đẩy 7 → 10 rồi `migrateGiai7`
   chia đôi thành `ceil(10/2)` = 5. Không một lỗi nào báo; tôi chỉ thấy vì in tier ra để đối chiếu.
3. **Và phép thử ngược của mệnh đề ấy XANH lần đầu** — vì cảnh dựng của tôi đặt sẵn
   `giai14`/`giai7` (đúng như save của bản đang chạy), nên hai hàm kia no-op và đảo thứ tự vẫn
   qua. Phải thêm hẳn một mệnh đề ⑥ dựng **save chưa qua đổi giai** mới gác được.
   *Một mệnh đề chỉ gác được cái cấu hình mà cảnh của nó dựng ra.*

### Và một bài học về phép đo

Mệnh đề *"con Axie đứng đất"* một mình thì **vô nghĩa**: gỡ sạch hệ bay đi nó cũng xanh. Phải có
mệnh đề ② đi kèm — *"lớp nhân vật vẫn phải bay thật"* — thì cặp đó mới nói được điều gì. Cùng họ
với `test_muigio §0` và với luật *"một cái chốt đúng ở mọi trạng thái là một cái chốt không chốt
gì"*.

Đo qua `window.__neoVe` (`_doNeo` ghi bằng chính ma trận vòng vẽ), không đo điểm ảnh: con Axie thở
~8 FPS nên hai lượt vẽ liên tiếp cùng điều kiện lệch tới 5.200 điểm ảnh — lớn hơn hẳn 24 px cần đo.

---

## 2026-09-12 — Cánh tụt khỏi vai, và tỉ lệ Axie ↔ kẻ hộ tống

Nền: `7772e3e` (kẻ hộ tống đã lên `main`)

Hai yêu cầu của chủ dự án, nhìn thì rời nhau mà hoá ra chung một gốc — **cỡ thu**:
*"cánh khi đi theo vẫn chưa fit với nhân vật"* và *"kéo scale Axie lớn, kéo thân người lúc ra
tuyệt chiêu cho nó nhỏ lại"*.

### Số đo

| | đo được |
|---|---|
| Gốc cắm cánh so với khớp vai, cỡ 1,00 | lệch **0,6 px** — nên không ai thấy |
| …cỡ đi theo 0,60 | lệch **17,1 px** trên một hình cao 57 px |
| Nguyên nhân | hai khối thu quanh HAI TÂM: thân quanh `p.y − NV_LECH_Y`, cánh quanh `p.y` ⇒ sai số `(1 − co)·NV_LECH_Y` = 0,4 × 42 = **16,8** |
| Số hạng lấy đà bị bỏ quên | `lungeK` = **1 lúc đứng yên** ⇒ cánh lệch **7 px suốt**, không chỉ lúc đánh |
| Sau sửa | 0,3 · 0,5 · 0,6 px ở ba trạng thái (đi theo · ra đòn · tắt avatar) |
| `AVA_TY` có bó con nào không | **KHÔNG** — cả 16 con chạm trần ở chiều RỘNG; thứ điều khiển cỡ Axie là `AVA_TRAN` |
| Hộp Axie, trước → sau | 90,6 → **133,6 px** ngang |
| Thân người lúc ra đòn | 95,4 → **76,3 px** (`AVA_DANH_CO` 0,80) |

### Những chỗ đã đoán sai trong phiên này

- **Tưởng nới `AVA_TY` là Axie to lên.** Nới 0,72 → 0,95 rồi đo lại: không con nào đổi quá vài
  px, vì `AVA_TRAN` đang bó cả 16 con ở chiều rộng (tỉ lệ rộng/cao 1,07–1,52). Phải nới trần
  mới có tác dụng. Ghi vào CLAUDE.md để đừng ai chỉnh nhầm cái kia lần nữa.
- **Bài kiểm `test_avatar` đỏ vì phép làm tròn của chính nó.** Trần `95,4 × 1,4` = 133,56 mà
  giá trị đã `toFixed(1)` ra 133,6 ⇒ 14/16 con "vượt trần". Không phải lỗi sản phẩm. Sửa bằng
  cách giữ nguyên số, chỉ làm tròn lúc IN — đúng bài học "đừng chép cứng số đã có hàm".
- **Bài kiểm `test_hopve §3` đỏ vì cửa sổ 420 ký tự.** Thêm một dòng chú thích vào giữa khối vẽ
  là lời gọi trôi ra ngoài cửa sổ. Đổi sang cắt theo khối `ctx.save()` gần nhất.

### Cách gác chỗ này về sau

`_doNeo()` (chỉ chạy khi `TEST_MODE`) đưa gốc cắm cánh và khớp vai qua **đúng ma trận mà vòng
vẽ đang dùng** rồi phơi ra `window.__neoVe`. Bài kiểm so hai điểm, không chép lại phép biến
hình — chép là dựng bản sao thứ hai của một luật đang sống. Thử ngược: quay lại đúng hai dòng
cũ thì bài đỏ ngay với dx=−7,0 dy=17,1 — đúng con số đã tiên đoán.

---

## 2026-09-11 — Tướng đi: nhịp bước, tám hướng nhìn, khung nhiễm độc

Commit: `7047240` · Nền: `b619e20`

Phiên thiết kế nhân vật cho hợp với game. Đo trước, đề xuất sau — công cụ đo mới là
`tools/do_dang.js` (sảiBọc · tảiĐất · đốiXứng · nhún), chạy lại là ra.

### Số đo hiện trạng

| | đo được |
|---|---|
| `heroSprite(back=true)` vs `back=false` | **0 / 52.000 điểm ảnh** lệch — không có hướng lưng, mà cờ `back` vẫn nằm trong khoá đệm ⇒ trả gấp đôi ô nhớ cho hai tấm giống hệt nhau |
| Số bước mỗi vòng, cả 10 khối (5 bộ × đi/chạy) | `đốiXứng` **0,48–0,64** ⇒ **một** bước một vòng (vòng hai bước phải ≥0,85) |
| Bàn chân chống đất chở được | `tảiĐất` 42,5/59 px so với `sảiBọc` 91/120 ⇒ **51% là trượt chân nằm trong bản vẽ** |
| Khung nhiễm độc trong đệm sprite | **5/5 lớp**, khung `i4` đếm 12.828 px trong khi hàng xóm 6.606/6.733; ép tràn LRU dựng lại ra 6.678 |
| Nhịp chạy ở 209 px/giây | **1,18** bước/giây trước sửa, **2,90** sau |
| Bảng khung Spellblade | `sbhd1` **96 ô (6 hàng)** trong khi bốn bộ kia 112 ⇒ khối chạy chỉ 16 khung |

### Những chỗ đã đoán sai trong phiên này

- **Tưởng khối chạy có HAI bước một vòng.** Thước đo đầu tiên đếm số lần độ mở hai bàn chân
  vượt ngưỡng, và nó ra 2 cho bốn bộ. Sai: trong pha bay một bàn chân nhấc khỏi dải sát đất
  nên bề rộng đo được **sập xuống giả**, và cú sập đó bị đếm thành một bước. Thước đúng là độ
  chồng khít bóng dáng giữa khung `i` và `i+n/2` — ra 0,48–0,64, tức một bước. Đã ghi cảnh
  báo ngay trong `tools/do_dang.js` để đừng ai quay lại cách đếm cũ.
- **Tưởng khung nhiễm độc là chuyện ngẫu nhiên theo thời điểm tải.** Hai lượt đầu ra khung 13
  rồi 5–6 nên tưởng chỉ số nhảy lung tung; quét cả 5 lớp thì luôn ra khung 4. Vẫn là một cuộc
  đua, chỉ là nhịp tải ổn định nên nó rơi vào cùng một chỗ. Kết luận "ngẫu nhiên" suýt làm bỏ
  qua việc viết bài kiểm — mà bài kiểm thì bắt được đều 5/5.
- **Cắm sai một ô trong bảng tám hướng** (`Đông-Bắc` khai `lat: true`, phải là `false`). Chính
  bài kiểm mới bắt được ở lượt chạy đầu, bằng khẳng định "8 hướng phải là 8 tổ hợp khác nhau".
- **Bản đầu của `nvChonHuong()` làm tròn góc về một trong tám nấc TRƯỚC rồi mới đo khoảng cách
  để lui.** Ở dải 90°–112,5° nó chọn Đông trong khi luật cũ chọn Tây — nhân vật quay ngược ở
  một dải góc, **dù chưa có tệp art mới nào**. Thử ngược lại: cắm lỗi đó vào thì bài kiểm đỏ
  **88/720** góc. Vì thế bài quét 720 góc chứ không quét 8 mốc — chỗ hỏng nằm GIỮA hai mốc.
- **`tests/test_nowuxia2.js` ghi cứng `/home/user/axie-wuxia/`.** Kho đã đổi tên, nên mục A âm
  thầm bỏ qua mọi tệp (`catch { continue }`) còn mục D ném ENOENT — mà ba mục đầu vẫn XANH,
  nhìn y như một bài khoẻ mạnh. Đã đổi sang tìm ngược gốc kho từ chính tệp bài kiểm.

### Còn nợ

- **51% trượt chân nằm trong bản vẽ** — không giá trị `SAI_CHAN` nào chữa được. Bản đặt hàng
  art và ngưỡng nghiệm thu: `docs/DAT_HANG_TUONG_DI.md`.
- **Năm bản vẽ cho tám hướng** chưa có tấm nào; máy đã xong, thêm một hướng = ba dòng dữ liệu.
- **Spellblade thiếu một hàng bảng khung**, cần gói Spine gốc để nướng lại.
- **Vai lệch của Spellblade sẽ đổi bên khi lật ngang** — cần chủ dự án chốt: chấp nhận, hay vẽ
  đủ 8 hướng riêng cho mình lớp đó.
## 2026-09-11 — Đại Thành thành CÂY hai nhánh

Nền: `f1af955`

### Bệnh: bảng vẽ hình cái cây, luật thì là cái thùng

`MASTERY_RANK_GATE` chỉ đếm **tổng điểm đã tiêu trong bảng** — rank R mở khi bảng có (R−1)×10
điểm, bất kể điểm đó nằm ở đâu. Nghĩa là không có đường đi nào cả: dồn 40 điểm vào một nút bất kỳ
là mở được cả bảng. Người chơi không "chọn hướng" được gì, chỉ rải điểm mỏng ra.

### Chữa: cấu trúc, không phải con số

| | trước | sau |
|---|---|---|
| nút | 128 (16 bảng × 8) | **144** (16 bảng × 9) |
| khuôn bảng | 5 hàng phẳng | **2·2·2·1·2** |
| điều kiện mở | tổng điểm trong bảng | **nút cha CÙNG NHÁNH** (`MST_CAN`) |
| nút đỉnh | 1 | **2, loại trừ nhau** |
| ô điểm cả bảng | 640 | **720** · một vòng Tái Sinh kiếm 139 |

Mỗi nút mang `nh:'<nhánh>'`, mỗi bảng khai `nhanh:[…2 mục]`. Cặp loại trừ **suy từ hình dạng**
(hai nút cùng rank cuối, khác nhánh) chứ không khai tay — nên bảng mới lệch khuôn là bài kiểm đỏ,
không phải mất im lặng cơ chế chọn hướng.

Đi trọn một hướng trong một bảng: **28 điểm mở đường** (5+5+8+10) rồi tới 20 điểm cho nút đỉnh.

### Những chỗ đã đoán sai trong phiên này

**Đọc CLAUDE.md thay vì đo.** Mục "NHIỆM VỤ ĐÃ GỠ SẠCH" ghi `QUESTS` và `SIDE_QUESTS` đều rỗng.
Tin theo, lần ra `masteryOpen()` đòi `player.mongChiTon` — cờ chỉ bật khi `questState === 'all'` —
rồi kết luận chắc nịch rằng bảng Đại Thành **không có cửa vào**, và viết hẳn một bản vá cổng kèm
chú thích dài. Đo thật: `QUESTS` có **33 nhiệm vụ**, chuỗi đã được dựng lại từ lâu. Cổng vẫn chạy
bình thường; bản vá đã gỡ. *Tài liệu là ảnh chụp một thời điểm — cái nào kiểm được bằng một dòng
`node -e` thì kiểm, đừng trích dẫn.*

**Tin chú thích trong chính mã.** `MASTERY_CLASS` mở đầu bằng *"Bản thử nghiệm này mới vẽ cho Dark
Knight — bốn lớp còn lại vẫn dùng được bảng chung"*, và `renderMastery()` còn **in hẳn dòng đó ra
màn hình** cho bốn lớp kia. Thực tế cả 5 lớp đã đủ 3 bảng riêng. Chú thích sai thì còn đỡ; chú
thích sai mà được in ra cho người chơi đọc thì là lỗi hiển thị.

**So số LÝ DO thay vì số NÚT.** Dòng "lý do khoá" dưới mỗi hàng chỉ hiện khi cả hàng khoá, viết
thành `ly.length === nodes.length` với `ly` là `Set` các lý do **khác nhau**. Hai nút đỉnh gần như
luôn khoá vì cùng một câu ("cần 10 điểm ở <nút chung>"), gộp lại còn 1, nên `1 === 2` nuốt mất cả
dòng — đúng ở hàng quan trọng nhất. Chỉ lộ khi **chụp màn hình ra nhìn**, không lộ khi đọc mã.

**Bài kiểm xanh giả ở đúng cái ngưỡng tinh tế nhất.** Thử ngược năm cơ chế: bốn cái phá là đỏ,
riêng hạ `MST_DINH_NHANH` từ 15 xuống **0** vẫn xanh cả bài — tức chưa có khẳng định nào bám vào
nó. Phải dựng thêm đúng kịch bản nó sinh ra để bịt: nuôi trọn nhánh A (18 điểm), nút chung nhận
**một** nhánh bất kỳ nên qua, rồi vơ nút đỉnh của nhánh B vốn 0 điểm. *Cơ chế nào chỉ chặn một
đường đi hiếm thì bài kiểm phải đi đúng đường đó, không có đường nào khác chạm tới nó.*

**Vá trùng với một phiên khác, cùng một lỗi, cách nhau vài chục phút.** Sửa xong đường dẫn chép
cứng trong `test_nowuxia2` rồi mới `git fetch` — `origin/main` đã có bản vá của phiên "tướng đi"
cho đúng lỗi đó. Bản của họ dò gốc từ `__dirname` (đúng hơn cho worktree), bản của tôi bỏ
`catch { continue }` và in số tệp đã quét. Hoà lại lấy cả hai. *Trên nhánh triển khai dùng chung,
`git fetch` phải chạy TRƯỚC khi sửa thứ nằm ngoài phạm vi việc của mình, không phải lúc sắp push.*

**Rà soát save suýt ăn cả build hợp lệ.** `masteryRaSoat()` tạm gỡ nút đang xét ra rồi mới hỏi —
nếu không, nút đỉnh tự thoả điều kiện "nhánh đủ 15 điểm" bằng chính điểm của mình. Nhưng gỡ ra
thì lại có nguy cơ hoàn nhầm điểm hợp lệ; chỉ an toàn vì chuỗi cha ép nhánh phải có **≥18** điểm
trước khi nút đỉnh nhận được điểm đầu tiên, tức luôn dư 3 so với ngưỡng. Quan hệ 18 > 15 đó là
thứ giữ cho hàm không ăn oan — đổi `MST_CAN` mà quên nó là hoàn điểm của người chơi đang chơi đúng.

---

## 2026-09-04 — Thần khí · Soul Master · U Linh · cánh · tách bảng cân bằng

Commit: `305e573`, `3f201d6` · Nền: `7c1490b`

### Vũ khí rời tay — "thần khí"

Đường cũ nướng vũ khí vào từng khung hình và buộc vào xương bàn tay. Ba thứ bị khoá cứng: mỗi
bộ giáp phải nướng riêng, mỗi giai vũ khí một tệp, và vũ khí **không** đổi theo món đang cầm.

Giờ vẽ thẳng từ món trang bị bằng `ITEM_ART`:

| | đường mới (vector) | đường cũ (tranh nướng) |
|---|---|---|
| số cây phủ được | **210** (15 dòng × 14 giai) | 1 cây / 1 tấm bóc tay |
| dung lượng art | **0 byte** | ~9 KB/cây → 210 cây ≈ 1,9 MB |
| đổi vũ khí trong túi | đổi ngay khung sau | phải bóc tấm mới |

Bốn lối ra đòn theo loại vũ khí (`TK_LOI`): kiếm **bổ** · trượng **đâm** · cung **giương** · nỏ
**ngắm**. Cùng một quỹ đạo cho mọi cây là chỗ hỏng dễ thấy nhất — cây cung quét cung 166° như
đại kiếm thì người chơi đọc thành lỗi hiển thị.

Móc `TK_ANH` để đè bằng tranh vẽ tay cho món đáng vẽ riêng. Đang dùng cho trượng Dark Wizard:
tấm gốc là ảnh chéo 512×512, chuẩn hoá bằng cách đo trục chính (PCA, 120,1°), xoay 300,1° cho
đầu trượng nằm dọc +X, cắt sát, thu về 172px, chỗ nắm (65,33).

### Tuyệt chiêu U Linh (Evil Spirit) của Dark Wizard

Gói art gửi tới **không dùng được**, ba lỗi:
1. `.tres` khai 16 khung 640×640, nhưng bên trong mỗi khung lại xếp 9 ô con — hoạt ảnh thật là
   144 khung ~213px. Thả vào Godot cũng chạy sai.
2. Alpha bị nhị phân hoá, 21% mỗi khung là alpha = 0, và lỗ thủng **xuyên qua chính tấm tranh**.
3. Mọi khung đều có sẵn người pháp sư — game đã tự vẽ Dark Wizard rồi.

Giữ hướng nghệ thuật, dựng lại bằng mã. Bảng màu **lấy mẫu thẳng** từ 102.988 pixel vùng tím của
ảnh gốc: `#1f004f · #340665 · #501188 · #853ab5 · #c67be1 · #f0c5f4`.

Tám cánh cùng nhịp, nở bung (0 → 46%) rồi quặp vào trong (46% → hết) — độ cong chạy từ 0,26 lên
1,60. Chính cái `cong` chạy theo thời gian mới làm động tác đọc ra *nuốt*, không phải *xoè rồi tắt*.

Mũi cánh vươn **152px** để khớp `fx.r = 150` của chiêu. Vẽ rộng hơn tầm đánh là hứa suông.

### Bộ Soul Master cho Dark Wizard

Nướng từ gói Spine (`00f679b8`-kiểu, da `Soul Master`, 13 khe, 20 hoạt cảnh). 80 khung, gót
y=212, đỉnh đầu y=53 — khớp tuyệt đối hợp đồng toạ độ.

Vũ khí nướng sẵn **tắt hẳn** vì thần khí đã lo. Dark Wizard đánh thường bằng khung
`05_MagicAttack`: tách `blk` (lấy khung từ đâu) khỏi `kind` (đang làm gì) — gán thẳng
`_kind = 'c'` thì chỉ số khung rơi vào nhánh đọc `castK`, mà `castK = 0` lúc đánh thường, nên
khung đứng im ở 0.

### Cánh — dựng lại theo số đo

**Bề ngang.** Đo trên nhân vật thật (cao 104px, ngang 40px):

| lớp | trước (b1/b2/b3) | sau |
|---|---|---|
| Dark Knight | 2,1× / 3,0× / 3,6× | 1,6× / 2,2× / 2,7× |
| Dark Wizard | 2,5× / 3,5× / **4,2×** | 1,8× / 2,4× / 2,7× |
| Spellblade | 2,4× / 3,7× / **4,5×** | 1,6× / 2,2× / 2,8× |
| Sylvan Ranger | 1,9× / 2,5× / 3,0× | 1,7× / 2,1× / 2,5× |
| Dark Lord | 2,1× / 3,0× / 3,6× | 1,6× / 2,3× / 2,7× |

Chiều cao **giữ nguyên** — có mốc "đỉnh cánh vượt đỉnh đầu ở cả ba bậc", đọc từ ảnh cánh MU thật.

**Gốc cánh.** Đo thẳng từ bộ xương: hai xương cánh tay là con của thân trên nên gốc của chúng
chính là khớp vai — vai phải (75,6 · 103,4), vai trái (94,0 · 104,1) → **±9,2**.

**art khoá cả ba bậc mỗi lớp.** Bản cũ để Spellblade nhảy `lai → tia` và Dark Lord nhảy
`doi → ao` giữa chừng: lên bậc là đôi cánh hoá thành con khác.

**Màu chạy theo lớp**, bậc 2 là đúng màu lớp trong `SECTS`, bậc 1 tối đi, bậc 3 sáng lên. Cánh
Dark Wizard sang tím, lấy mẫu từ chính bộ Soul Master (`#2c1640 · #6b4183 · #b995c8`).

**Cánh côn trùng** ngả thêm 0,34 rad vì nó vẽ dọc trục thuỳ, không như cánh dơi vẽ gần ngang.

### Bay khác đi bộ

Đo chỉ số chồng khít giữa tư thế bay mong muốn với **20 hoạt cảnh × 12 khung**:

```
0,915  00_Walk  khung 8/12   ← khớp nhất
0,718  00_Run   khung 9/12
0,709  01_Dance2 khung 0/12
```

Tư thế cần **nằm sẵn trong khối đi** — khoảnh khắc hai chân chụm, mũi bàn chân chúc xuống. Nên
bay dùng khối đi, ghim quanh khung 21/32, lắc ±2 theo nhịp chậm.

### Tách bảng cân bằng

705 dòng ra `data/canbang.js`, nạp trước `game.js` — cùng khuôn mẫu `strings/vi.js`.

Tám bảng được chọn vì **không phụ thuộc gì cả** (quét mọi định danh viết hoa + mọi lời gọi hàm
bên trong từng khối): `WEAPON_LINES` 247 · `HERO_SETS` 232 · `CHIMERA` 52 · `MAT_PASS` 46 ·
`CHI_KY` 38 · `BOSS_DEFS` 37 · `DUNGEONS` 30 · `QUESTS` 23.

Chưa dời được: `VOHOC_DEFS` cần `SIGNATURE_SKILL` · `SECTS` **gọi hàm `doBasic`** · `MAPS` cần
`REGION_UNLOCK_LORE` · `SIDE_QUESTS` cần `NPC`. `SECTS` gọi hàm nên không bao giờ thành dữ liệu
thuần được.

**Là `.js` chứ không phải `.json`**: `game.js` là classic script, 490 khai báo cấp cao và 29 câu
lệnh chạy ngay lúc nạp. Đổi sang `fetch` JSON là phải chờ bất đồng bộ trước khi khởi động.

---

## Những chỗ đã đoán sai trong phiên này

Ghi lại vì mỗi cái đều tốn một vòng, và cái nào cũng có thể mắc lại.

**Tin chú thích thay vì đo.** Chú thích cạnh `CANH_GOC_X` ghi *"khớp vai y=100, hai vai cách nhau
56 px"*. Tin theo, sửa ±14 → ±23 cho "đúng bả vai". Đo từ bộ xương ra ±9,2 — tức bản sửa đẩy đôi
cánh **ra xa khớp vai thật hơn cả bản gốc**.

**Thu cả hai trục khi chỉ cần thu một.** Cánh quá rộng thì thu bề ngang. Thu luôn chiều cao làm
bậc 1 và bậc 2 tụt xuống dưới đầu, phá mốc thiết kế đọc từ ảnh MU. `test_canh3bac` bắt được.

**Chữ ký hàm lệch một tham số.** `uLinhVuot` khai 9 tham số, ba chỗ gọi đều truyền 8. `boc` nhận
chuỗi màu → `y` thành `NaN` → cả đa giác biến mất, **không một dòng lỗi nào**.

**Đồng hồ hiệu ứng chạy ngược.** `e.t` đếm *lên* (`e.t += dt`), viết `t = 1 - e.t/e.dur`. Chiêu
chạy giật lùi: vừa tung đã ở cuối nhịp, mà cuối nhịp `sin(k·π) = 0` nên vuốt dày đúng 0.

**Dẹt nhầm pháp tuyến.** Hệ số elip 0,44 thuộc về *quỹ đạo*, nhân luôn vào bề dày dải: vuốt nằm
ngang chỉ còn 44% độ dày. Đo được vuốt dài 103px mà hộp bao cao 26px.

**Chia trước/sau theo chẵn lẻ chỉ số.** Vuốt đứng ngay trước bụng nhân vật vẫn có thể bị xếp ra
sau lưng. Phải chia theo **vị trí trên vòng** (`sin(g0) < 0` là nửa xa).

**Regex ăn nhầm hai bảng.** Dùng regex thay `to:` trong `WING*_DEFS` làm hỏng `WING2_DEFS` và
`WING3_DEFS` — ăn cả `const WING2_DEFS = {` lẫn một phần chuỗi `desc`. Bảng nhiều trường tuỳ chọn
thì viết lại nguyên khối, đừng vá bằng regex.

**Nướng thừa một khối khung.** Thêm `00_Squat` làm khối bay, nướng lại cả 8 bộ (+0,7 MB). Đo xong
mới biết dáng cần nằm sẵn trong khối đi. Đo trước khi nướng.

**`pkill` trong lệnh ghép giết luôn shell** (exit 144). Chạy riêng.

---

## Việc còn treo

- `hemp1` + 8 tệp `hemp1_vk*.png` (~2,5 MB) giờ mồ côi: `NV_GIAP['baidasan|1']` đã đổi sang
  `dwsm1`, và đường vũ khí nướng sẵn đã tắt hẳn vì thần khí.
- Ảnh `<bộ>_dung.png` không còn được vẽ ở đâu — `heroPickUrl()` đã chuyển sang `pick_*.webp` cho
  cả 5 lớp. Vẫn nạp sớm 5 tệp PNG chết mỗi phiên.
- Bốn bảng còn vướng phụ thuộc, chưa tách được (xem trên).
- Bộ giáp Dark Wizard dạng ảnh phẳng (2 gói `image2godot4_8/9`) chưa mặc lên người được — cần
  Meowa xuất lại dạng gói Spine trên cùng bản mẫu `spine四头身人物模板`.
