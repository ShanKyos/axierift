# Axie Rift: bản Godot 3D

MMORPG 3D lấy cảm hứng từ **MU Online**, có thêm lớp Axie. Chơi bằng **bộ cài trên máy**
(Windows/Mac/Linux). Bản web cũ ở `public/game/` vẫn chạy nguyên ở production; thư mục này là
bản dựng lại, chưa nối vào deploy.

> Bản pixel art trước đó đã gỡ (chủ dự án chốt chuyển hẳn sang 3D). Nó còn nguyên trong lịch sử
> git ở commit `5e9bb26` nếu cần tra lại.

## Mở và chạy

1. Cài **Godot 4.5** trở lên (bản thường, không cần bản .NET).
2. Mở Godot → **Import** → chọn `godot/project.godot`.
3. Bấm **F5**.

Đồ hoạ dùng **Forward+** (cần card hỗ trợ Vulkan). Máy không có Vulkan thì Godot tự lùi về OpenGL;
vẫn chơi được nhưng kém đẹp hơn (ít hiệu ứng ánh sáng hơn).

| Điều khiển | |
|---|---|
| Chuột trái lên đất | chạy tới đó; giữ chuột thì chạy theo con trỏ |
| Chuột trái lên bia tập | chạy tới và chém |
| Con lăn | kéo camera gần / đẩy xa |
| **Tab** | bản đồ tổng quan; bấm lên bản đồ là nhân vật chạy tới đó · Esc đóng |

## Đang ở mốc 3D-1 — Ardhaven 3D

Map 200 × 200 m dựng theo **tranh tổng quan** chủ dự án sinh (bắc ở trên). Bố cục nằm hết trong
**`scripts/du_lieu/ardhaven_3d.gd`** (toạ độ mét, +X đông, +Z nam); `scripts/the_gioi_3d.gd` đọc nó
mà dựng. Sửa một con đường ở đó là mặt đất, lưới đi bộ và bản đồ Tab cùng đổi theo.

| Hướng | Vùng | Có gì | Quái (mốc 3D-2) |
|---|---|---|---|
| giữa | **Ardhaven** | tường 7 khúc mỗi cạnh, 4 cổng mở, 4 tháp góc; phố chữ thập + quảng trường lát đá; lò rèn (tây bắc), tháp pháp sư (đông bắc), quán rượu (tây nam), nhà kho + chợ + sân tập (đông nam) | — |
| bắc | Rừng Thông Bắc | ~200 cây, đường mòn tới tháp canh đổ | Sói Rừng · Beast · cấp 1-10 |
| đông | Đầm Lầy Bờ Đông | sông chảy bắc→nam, cầu gỗ trên đường đông, ao đầm, cỏ nước | Bọ Giáp Đầm · Reptile · cấp 8-18 |
| nam | Đồng Ruộng Bỏ Hoang | ba thửa ruộng rào gỗ, trại bỏ hoang, cối xay gió | Lợn Rừng · Bird · cấp 4-14 |
| tây | Đồi Đá Mộ Cổ | đất sỏi, mỏm đá, phế tích, nghĩa địa, cây chết | Bộ Xương · Dusk · cấp 12-22 |

Viền map là núi đá. Nhà phóng to ×8 so với gói gốc (nhà cao ~7 m, gấp ba người — nhịp MU); ở tỉ
lệ của tường (×5,5) thành 77 m trông như bãi đất có vài túp lều.

- **Mặt đất là ảnh TÔ TỪ DỮ LIỆU** (đường, sông, ruộng, vùng; 0,5 m/px) + nhiễu chi tiết trong
  shader, không phải tranh vẽ sẵn.
- **Bản đồ Tab chụp từ chính thế giới 3D**: camera trực giao nhìn thẳng xuống, chụp một lần lúc vào
  map. Nên bản đồ không thể lệch với địa hình. Camera chụp bỏ lớp vẽ 2, là lớp của nhân vật.
- **Lưới đi bộ** ô 0,5 m: nhà/tường/đá chặn theo hộp bao thật của mô hình, cây chặn đúng thân, sông
  chặn trừ mặt cầu, lỗ cổng để trống. Đường lưới được kéo thẳng (bỏ điểm giữa khi nhìn thấy nhau,
  ba tia cách nhau 0,4 m) nên nhân vật không đi bậc thang.
- Gói Medieval tô màu kẹo; mọi mô hình dùng chung một atlas nên chỉ cần vài vật liệu **nhuộm trầm**
  (lá, mái, đá) cho gần chất MU.

## Chân không trượt — tốc độ ĐO từ hoạt ảnh

Hoạt ảnh chạy của gói art là "tại chỗ": thân không tiến, bàn chân chống lùi về sau. Tốc độ di
chuyển phải đúng bằng tốc độ bàn chân lùi, không thì chân trượt. Nên tốc độ **không khai tay**:
`NhanVat3D.do_toc_do()` đo nó từ bộ xương lúc nạp, chỉ tính lúc mũi chân sát đất. Kết quả hiện tại:
**chạy 4,54 m/s · đi 0,86 m/s**.

⚠ Hoạt ảnh chạy có **pha bay** (cả hai chân rời đất), mỗi bước chỉ chạm đất ~0,07 giây. Bản đo
đầu lấy "chân thấp hơn" làm chân chống, gộp cả lúc chân đang lơ lửng, ra 1,07 m/s và chân trượt
0,45 m mỗi bước. Bài kiểm bắt được ngay.

## Art

Mô hình tạm lấy từ **KayKit** của Kay Lousberg (www.kaylousberg.com), giấy phép **CC0**: dùng thương
mại tự do, không bắt buộc ghi công. Bản giấy phép ở `assets/mo_hinh/kaykit/LICENSE_KAYKIT.txt`.

| Gói | Dùng gì |
|---|---|
| Character Pack: Adventurers | Knight (có xương, 76 hoạt ảnh) |
| Dungeon Remastered | sàn đá, tường, cột, đuốc, thùng, hòm, bàn, cờ |
| Medieval Hexagon | tường, cổng, tháp, nhà, lò rèn, quán rượu, chợ, giếng, cầu, cây, đá, núi, ruộng, rào, đồ lặt vặt |

Phong cách KayKit là low-poly tròn trĩnh, chưa phải dark fantasy kiểu MU — đó là art TẠM để dựng
game. Mô hình riêng thay vào sau, miễn dùng chung khung xương kiểu người thì không phải viết lại mã.

## Dữ liệu giữ lại từ bản trước

`scripts/du_lieu/` là dữ liệu thuần, dùng lại ở mốc 3D-2:

| Tệp | Việc |
|---|---|
| `ardhaven_3d.gd` | **bố cục map 3D** (mốc 3D-1) — thay cho `ban_do_ardhaven.gd` của bản pixel, đã gỡ |
| `noi_that.gd` | bốn phòng trong nhà: lò rèn, quán rượu, tháp pháp sư, kho |
| `npc_du_lieu.gd` | lời thoại, nút, hàng bán theo vai NPC |
| `vat_pham.gd` | vật phẩm và chiêu |
| `axie.gd` | 16 con Axie và tam giác khắc hệ phòng thủ |

## Lộ trình

| Mốc | Việc |
|---|---|
| 3D-0 | khung: camera, ánh sáng, nhân vật chạy/chém |
| **3D-1** | Ardhaven 3D theo tranh tổng quan, bốn vùng theo hướng, bản đồ Tab — **đang ở đây** |
| 3D-2 | quái, đánh, rơi đồ, NPC, tiệm, kho, vào nhà, Axie đi theo (tranh phẳng quay về camera), HUD, radar |
| 3D-3 | trang bị hiện lên người: nón · áo · găng · quần · giày · vũ khí gắn lên xương |
| 3D-4 | xuất bộ cài Windows/Mac/Linux bằng máy |

## Kiểm tra

```
godot --headless --path godot -s tests/test_buoc.gd       # cổng vật lý: chân không trượt, chạm đất, đúng hướng (8 hướng)
godot --headless --path godot -s tests/test_3d0.gd        # cổng lối chơi: bấm đất, đi vòng giếng, chém bia tập, camera
godot --headless --path godot -s tests/test_3d1.gd        # cổng map: 4 cổng, tường, đường, sông + cầu, 4 vùng, bản đồ Tab
xvfb-run godot --path godot -s tests/chup3d1.gd           # chụp 9 ảnh vào godot/tmp_chup/ + kiểm màu ảnh bản đồ (cần Vulkan; Mesa lavapipe là đủ)
```

- `test_buoc.gd` lái chính `NhanVat3D.buoc()` và tua hoạt ảnh cùng nhịp, rồi đo vị trí thế giới của
  mũi chân. Chân chống lệch **1,0 cm** ở cả 8 hướng (ngưỡng 3,5 cm). Thử ngược: cho nhân vật dời
  nhanh hơn chân 20% ⇒ đỏ, lệch 7,4 cm.
- `test_3d0.gd` bấm bằng toạ độ màn hình qua đúng hàm của game. "Đi vòng vật cản" đo bằng **hộp bao
  thật** của giếng, không bằng lưới đi bộ; "camera bám" đo cả **góc và tầm xa**.
- `test_3d1.gd`, 42 mệnh đề. Bốn phép thử ngược, cả bốn đỏ đúng mục: bịt lỗ cổng · bỏ chặn sông ·
  lật trục bản đồ · đưa nhân vật về lớp vẽ 1. `chup3d1.gd`: quay camera chụp 180° ⇒ cả ba mục màu đỏ.
  - ⚠ **Phép thử ngược đầu tiên lôi ra một lỗi thật**: `get_id_path(..., true)` trả đường DỞ DANG
    khi đích bị vây kín, và bản đầu vẫn thay điểm cuối bằng đích ⇒ đoạn cuối xuyên thẳng qua
    tường. Bịt cổng mà bài vẫn báo "ra được thành". Nay chỉ nối đích khi đường thật sự tới nơi.
  - "Qua cổng" đo bằng **chỗ đường cắt đường tường** (lệch ngang phải nằm trong lỗ cổng), không đo
    "có điểm nào gần tâm cổng" — đường kéo thẳng ôm mép lỗ cổng nên cách tâm tới 2,25 m.
