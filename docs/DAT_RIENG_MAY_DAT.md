# Đất Riêng · Bước 2 — MÁY ĐẶT VẬT THỂ + TRẠNG THÁI RIÊNG TỪNG NGƯỜI

> Đặc tả thi công. Bước 1 (trục trả thưởng) chủ dự án đã chốt: **trang trí + sưu tầm trước,
> tiền tệ để sau**. Bước 3-6 (năng lượng · cây trồng · cá · art) là đặc tả riêng.
>
> Khảo sát đi trước: `docs/DAT_RIENG.md` + `docs/DAT_RIENG_ART.md` — hiện nằm ở nhánh
> `luu/covat-cu`, lấy về bằng `git show luu/covat-cu:docs/DAT_RIENG.md`.

## §0 — Bước này giao cái gì, và KHÔNG giao cái gì

**Giao:** người chơi đi tới mảnh đất của mình, **đặt một vật thể xuống**, rời đi, quay lại,
**nó vẫn ở đó**. Hết.

**Không giao:** cây trồng · hẹn giờ · năng lượng · cá · Axie nuôi · một tiền tệ nào.

Nghe nhỏ, nhưng nó là **móng của cả năm bước còn lại** — và nó là thứ game **chưa bao giờ có**:
grep cả `game.js` ra **0 chỗ** cho phép người chơi đặt bất cứ gì xuống thế giới. Mọi thứ đứng
trên map hôm nay đều là **dữ liệu tác giả** (`vatTo`) hoặc **bốc theo hạt cố định** (cây, đá,
Rương Canh). Luống rau không có chỗ nào để mà mọc.

## §1 — Quyết định kiến trúc: ĐỊA HÌNH CHUNG, VẬT THỂ RIÊNG

Một mảnh đất "của tôi" mà không có máy chủ thì phải tách làm hai:

| | Ai giữ | Vì sao |
|---|---|---|
| **Địa hình** (viên nền · `diTrong` · cổng · cây viền) | `MAPS.datrieng` — **chung, tác giả viết** | Một địa hình sinh theo người chơi là một máy sinh map, tức bước C2 chưa làm |
| **Vật thể đã đặt** | `player.dat` — **riêng từng nhân vật, nằm trong save** | Đây là toàn bộ "của tôi" |

⇒ Hai người vào cùng `datrieng` thấy **cùng một mảnh đất** nhưng **khác đồ đạc**. Không cần một
dòng máy chủ nào. Khi tầng mạng chín thì `player.dat` chính là thứ đem đi đồng bộ — không phải
dựng lại.

⚠ **ĐỪNG cho `datrieng` dùng `raiIso()`.** Hàm đó bốc cây/bụi theo hạt từ tên map. Trên đất
riêng thì mọi thứ trong hàng rào phải do người chơi quyết; cây bốc ngẫu nhiên mọc đè lên chỗ
họ vừa dọn là mâu thuẫn với chính điều tính năng này bán. Cây **ngoài** hàng rào thì vẫn rải —
đó là tường vùng, không phải sân.

## §2 — Ngân sách save: ĐÃ ĐO, rất rộng

| | |
|---|---|
| Một nhân vật hiện tại | **16.869 byte** |
| 5 ô nhân vật | **16.942 byte** tổng (đo lúc 1 ô có người) |
| Trần `localStorage` thường gặp | ~5 MB |

Một bản ghi vật thể `{i:'luong',x:1240,y:860,r:2}` ≈ **32 byte**. Nên:

| Số vật thể | Thêm vào save | So với một nhân vật |
|---|---|---|
| 100 | 3,2 KB | +19% |
| **300** *(trần đề nghị)* | **9,6 KB** | **+57%** |
| 1000 | 32 KB | +190% |

Trần **300** cho 5 nhân vật là +48 KB — vẫn dưới 1% hạn mức. **Trần tồn tại không phải vì
dung lượng mà vì hiệu năng vẽ**: 300 vật thể là 300 lần `drawImage` cộng vào `ents` mỗi khung.

⚠ **Trần phải là HẰNG có tên (`DAT_TRAN`), và phải chặn ở chỗ ĐẶT**, không phải chỗ lưu. Chặn
lúc lưu thì người chơi đặt được rồi mất — kiểu hỏng tệ nhất.

## §3 — Hình dạng dữ liệu

### `player.dat` (mới)

```js
player.dat = {
  o: [                                  // vật thể đã đặt
    { i:'bonhoa', x:1240, y:860, r:0 }, // i = mã trong DAT_VAT · r = hướng 0-3
  ],
  s: { luong:2, ao:0 },                 // số Ô CHỨC NĂNG đã mở, theo loại
};
```

⚠ **Khoá ngắn (`o`/`i`/`r`) là chủ ý** — chúng lặp lại 300 lần trong mỗi save. `{"i":"bonhoa"}`
so với `{"loai":"bonhoa"}` chênh 3 byte/bản ghi, tức ~1 KB ở trần. Cùng lối `gx/gy` của túi đồ.

⚠ **`player.dat` vắng mặt ⇒ chưa từng vào.** Đừng khai `dat: {}` trong khối dựng người chơi —
`JSON.stringify` bỏ khoá `undefined`, nên không khai chính là cách lưu đúng trạng thái đó. *Đây
là đúng cái bẫy `avatar: null` đã ship một lần (xem CLAUDE.md mục ĐỔI VAI).*

### `DAT_VAT` — bảng khai vật thể đặt được (mới, trong `data/canbang.js`)

```js
window.DAT_VAT = {
  bonhoa: { ten:'Bồn Hoa', img:'dv_bonhoa', loai:'trangtri', mo:1 },
  hangrao:{ ten:'Hàng Rào', img:'dv_hangrao', loai:'trangtri', mo:1 },
  luong:  { ten:'Luống Đất', img:'dv_luong', loai:'chucnang', o:'luong' },
  ao:     { ten:'Ao Cá',    img:'dv_ao',     loai:'chucnang', o:'ao' },
};
```

| khoá | việc |
|---|---|
| `img` | tra `ISO_NEO` — xem §6 ⚠ |
| `loai` | `trangtri` đặt tự do · `chucnang` phải vào Ô |
| `mo` | mốc cấp mở khoá (thiếu = mở sẵn) |
| `o` | vật chức năng thì thuộc nhóm ô nào |

**Thêm một thứ đặt được = thêm MỘT DÒNG.** Không sửa một dòng máy nào — cùng hợp đồng mà
`MAPS`, `CHAOS_RECIPES`, `KN_ROT` đang giữ.

## §4 — HAI LỚP ĐẶT, và đây là chỗ tránh được cả một họ lỗi

| | Đặt ở đâu | Chặn đường không | Bao nhiêu |
|---|---|---|---|
| **Trang trí** | **tự do** trong `diTrong` | **KHÔNG** | tới `DAT_TRAN` |
| **Chức năng** (luống · ao · chuồng) | **Ô CỐ ĐỊNH** do `MAPS.datrieng.oDat` khai | có (dùng `VAT_CAN`) | bằng số ô đã mở |

**Vì sao tách:** cho đặt tự do thứ CHẶN ĐƯỜNG là mở cửa cho người chơi **tự nhốt mình** — xây
kín cổng ra rồi không đi đâu được, mà save thì đã ghi. Hoặc phải chạy flood-fill sau **mỗi** lần
đặt (CLAUDE.md: *"Kiểm bằng LIÊN THÔNG, không phải tỉ lệ vòng"*), hoặc phải bỏ cuộc.

Tách hai lớp thì **cửa đó đóng hẳn**: trang trí không chặn nên đặt kiểu gì cũng đi được; vật
chức năng vào ô có sẵn, mà ô thì tác giả đã đặt ở chỗ đi được.

Và nó cho luôn **trục tiến trình** mà Pixels dùng: *mở thêm ô*. Speck của Pixels nâng được 6
lần; ở đây là `player.dat.s.luong` từ 2 lên N.

## §5 — Máy chạy: năm hàm, một cửa

| hàm | việc |
|---|---|
| `datVatDat(i, x, y, r)` | **CỬA DUY NHẤT để đặt.** Hỏi `datDuoc()` trước; hợp lệ thì đẩy vào `player.dat.o`, gọi `datBoNho()`, `saveGame()` |
| `datDuoc(i, x, y)` | trả `null` nếu đặt được, hoặc **câu nói thẳng với người chơi** nếu không |
| `datVatGo(k)` | gỡ, hoàn lại vật phẩm, cùng ba bước trên |
| `datBoNho()` | **xoá bộ nhớ đệm vật cản** — xem ⚠ dưới |
| `datVe()` | đẩy vật thể vào `ents`, không tự vẽ |

**`datDuoc()` là cửa duy nhất** — cả tay đặt, lệnh gỡ rối lẫn phần vẽ bóng mờ đều hỏi nó. Nhờ
vậy lý do người chơi **ĐỌC** và luật máy **THỰC THI** không lệch nhau được. Cùng khuôn
`masteryKhoa()` và `knOHopLe()` đang giữ.

`datDuoc()` kiểm theo thứ tự, và **thứ tự này là để câu báo lỗi đúng chỗ**:

1. đang ở `datrieng` chứ không phải map khác
2. `DAT_VAT[i]` có thật · đủ cấp `mo`
3. chưa chạm `DAT_TRAN`
4. `trongDaGiac(md.diTrong, x, y)` — trong hàng rào
5. không chồng vật thể đã đặt (`DAT_CACH` = 40px tâm-tâm)
6. cách cổng ra ≥ `DAT_LE_CONG` (120px) — kể cả đồ không chặn, **đứng đè lên cổng là che mất nó**
7. *(chức năng)* ô còn trống và đã mở

## §6 — BỐN CÁI BẪY, cả bốn đã có tiền lệ trong chính kho này

### ⚠ 1. `vatToObs()` CÓ BỘ NHỚ ĐỆM THEO MAP — không xoá là vật cản đứng yên mãi

```js
const _vatCanNho = {};
function vatToObs(mapId){ if (_vatCanNho[mapId]) return _vatCanNho[mapId]; … }
```

Đệm này có lý do chính đáng (`simulateMovePath` thử tới 200×8 điểm một cú click). Nhưng vật thể
người chơi đặt thì **đổi lúc chạy**. Đặt một cái chuồng xong mà quên `delete _vatCanNho.datrieng`
thì nó **vẽ ra nhưng đi xuyên qua được** — đúng cái lỗi *"thứ MẮT THẤY phải là thứ GAME THỰC
THI"* mà CLAUDE.md có hẳn một mục. `datBoNho()` tồn tại chỉ để làm việc đó, và **mọi** đường
đặt/gỡ phải gọi nó.

### ⚠ 2. `ISO_NEO` thiếu một khoá ⇒ vật thể KHÔNG VẼ, và KHÔNG BÁO GÌ

```js
function veVatIso(d){
  const im = isoImg(d.img); if (!im) return;
  const n = (window.ISO_NEO || {})[d.img]; if (!n) return;   // ⬅ im lặng
  …
}
```

Đây **đã xảy ra thật và sống nhiều phiên**: sáu map khai cây theo biome mà `veVatIso` `return`
sớm vì thiếu neo ⇒ **không vẽ một cái cây nào**, không lỗi, không bài kiểm nào đỏ. Xem CLAUDE.md
mục "LỖI TO NHẤT PHÁT HIỆN TRONG ĐỢT NÀY".

⇒ Art của `DAT_VAT` **phải đi qua `ghi_neo()`** trong `tools/iso/nuong_tile.py`, tệp đích là
`public/game/data/iso.js`. **Không chép tay bảng neo.** `tests/test_isoneo.js` đã gác chiều đó —
đặc tả này chỉ cần thêm `DAT_VAT` vào danh sách nó quét.

### ⚠ 3. Xếp lớp theo CHÂN ảnh, không theo nóc

`vatTo` đẩy vào `ents` bằng `y: v.y + v.h` — chân công trình. Lấy nóc thì nhân vật **dán lên
mái**. Vật thể đất riêng đi cùng danh sách `ents` và phải dùng cùng khoá.

⚠ Nhưng `veVatIso` vẽ theo **neo** chứ không theo `h`, nên khoá xếp lớp là `d.y` (neo đã là
chân). **Đừng chép công thức `y + h` của `vatTo` sang** — hai đường vẽ khác nhau.

### ⚠ 4. `buildWorld()` xoá sạch mọi thứ — đừng để `player.dat` rơi vào đó

`buildWorld()` gán `decor = []`, `decorObs = []`, `pickups = []`… Vật thể đất riêng **không**
nằm trong mấy mảng đó; nó đọc thẳng từ `player.dat` mỗi khung. Nếu ai đó "tối ưu" bằng cách
nhân bản nó sang `decor` lúc `buildWorld` thì nó sẽ **biến mất mỗi lần hồi sinh** — `buildWorld`
gọi từ chín chỗ.

## §7 — Map `datrieng`

Thêm một khoá vào `MAPS`, đi đúng khuôn Rẻo Rừng Corran (`sanIso` + `diTrong` + `isoCum`),
dựng bằng `tools/iso/vung_bon.py` — có skill `map-rong` mô tả đầy đủ.

```js
datrieng: {
  name:'Đất Riêng', min:1, type:'safe', w:1800, h:1400,
  sanIso:true, isoCo:[…], isoDat:[…],
  diTrong:[…],                 // hàng rào — sinh bằng máy, đừng chấm tay
  oDat:[ { o:'luong', x:760, y:620 }, … ],   // ô chức năng, tác giả đặt
  spawn:{ x:900, y:1150 },
},
```

- **`type:'safe'`** — không quái, không PK. Đã có 4 map dùng khuôn này.
- **Không `packs`, không `vung`, không trùm** — đây không phải chỗ đánh nhau.
- **Khổ nhỏ (1800×1400)** thay vì 2600×1900: mảnh đất phải đi hết được trong vài giây, không
  phải một vùng hoang. Có thể nới sau — `MAP.w/h` đọc từ `md` nên đổi một số là xong.
- **Cửa vào:** một cổng ở Ardhaven + mở `wpUnlocked.datrieng` ngay lần đầu (đất của mình thì
  không phải đi bộ tới lần đầu như vùng hoang).

⚠ **Cổng phải đặt tên bắt đầu bằng "Cổng", không phải "Lối"** — `test_noimap` nhận diện "lối
rìa hoang dã" bằng tiền tố `Lối ` rồi đòi điểm tới cách mép map <400px.

## §8 — Giao diện đặt

Đơn giản nhất mà vẫn đủ: **bảng Túi Đồ → tab mới "Đất Riêng"**, bấm một món → vào **chế độ
đặt** → bóng mờ theo con trỏ → bấm trái đặt, phải huỷ.

- Bóng mờ **xanh khi `datDuoc()` trả `null`, đỏ kèm câu lý do khi không**. Người chơi phải
  biết vì sao chỗ này không được, không phải bấm mãi không ăn.
- **Hút về ô** khi là vật chức năng và con trỏ trong `DAT_HUT` (60px) của một ô trống.
- **Trang trí đặt tự do**, không hút lưới — lưới 256×128 là lưới của viên nền, ép bồn hoa vào
  đó thì cả mảnh đất thành bàn cờ.

⚠ **Chế độ đặt phải tắt khi rời map**, cùng lý do `moveTarget` bị dọn trong `buildWorld`.

## §9 — Bài kiểm: `tests/test_datrieng.js`

Sáu mệnh đề. Ba cái đầu là ba cái bẫy ở §6 — chúng **không ném lỗi và không hiện ra**:

| # | Gác gì | Thử ngược phải đỏ |
|---|---|---|
| 1 | Đặt → `travelTo` đi nơi khác → quay lại ⇒ **vật thể còn đó** | bỏ `saveGame()` trong `datVatDat` |
| 2 | Đặt vật CHẶN → `inObstacle()` tại đó phải `true` **ngay lập tức** | bỏ `datBoNho()` ⇒ đệm cũ trả vật cản rỗng |
| 3 | Mọi `img` trong `DAT_VAT` đều có trong `ISO_NEO` **và** có tệp thật | xoá một neo |
| 4 | `datDuoc()` từ chối: ngoài `diTrong` · chồng nhau · sát cổng · quá `DAT_TRAN` | nới một điều kiện |
| 5 | Xếp lớp: đứng **trên** vật thể thì bị nó che; đứng **dưới** thì che nó | đổi khoá `ents` sang `d.y - 50` |
| 6 | Save đời cũ (không có `player.dat`) nạp được, và **không tự đặt gì** | khai `dat:{}` trong khối dựng người chơi |

⚠ **Mệnh đề 2 phải đo bằng `inObstacle()`, không đọc `_vatCanNho`.** Đọc bảng đệm là kiểm chính
cái thứ mình nghi — phải hỏi cái hàm mà click-to-move thật sự gọi.

⚠ **Mệnh đề 5 phải tự kiểm cảnh dựng**: khẳng định hai vị trí thử thật sự nằm hai phía của vật
thể trước khi chấm. Bản đầu của mấy bài kiểm ảnh trong kho này đều xanh vì đo nhầm ô.

## §10 — Thứ tự thi công, và mỗi bước nhìn thấy được

| | Việc | Nhìn thấy gì |
|---|---|---|
| 2a | `MAPS.datrieng` + cổng từ Ardhaven | đi tới được một mảnh đất trống |
| 2b | `DAT_VAT` + `player.dat` + `datVe()` | vật thể **khai sẵn trong dữ liệu** hiện ra đúng chỗ |
| 2c | `datDuoc()` + `datVatDat()` + `datBoNho()` | đặt được bằng lệnh gỡ rối `/dat <mã>` |
| 2d | Giao diện đặt (bóng mờ, hút ô) | đặt được bằng chuột |
| 2e | `tests/test_datrieng.js` | — |

⚠ **2b trước 2c là chủ ý.** Đường VẼ phải chạy đúng trước khi có đường ĐẶT, nếu không thì lúc
đặt mà không thấy gì, không biết hỏng ở khâu nào. Cùng lối `test_isoneo` chia hai tầng.

## §11 — Đã chốt, và một thứ còn treo

**Tên tính năng: ĐẤT RIÊNG.** Chủ dự án chốt (2026-09-17) — *"cứ để tạm đất riêng đi"*. Tạm
theo nghĩa **có thể đổi sau**, không theo nghĩa chưa quyết: mã cứ dùng tiền tố `dat*` và khoá
`player.dat`, và đó là thứ KHÔNG đổi kể cả khi tên hiện ra đổi. Đừng đem tên hiện ra vào tên
khoá lưu — save thì di trú được, nhưng di trú một cái tên là trả giá cho đúng một chữ.

⚠ "Gia viên" vi phạm Quy tắc số 1 (kiếm hiệp). Đừng "sửa ngược" về đó tưởng là sót.

**Art 4 món đầu — prompt đã viết: `docs/PROMPT_DAT_RIENG_ART.md`.** Chủ dự án tự sinh bằng
Gemini. Đây là thứ **chặn 2d**, không chặn 2a-2c: ba bước đầu dùng tạm viên nền có sẵn là nhìn
được đường vẽ rồi.

**Còn treo: `DAT_TRAN` = 300?** Đo được là dư sức về dung lượng; con số này thật ra là **trần
hiệu năng vẽ**, nên phải đo lại bằng ảnh chụp khi có art thật. Không chặn bước nào — cứ để 300
rồi chỉnh.
