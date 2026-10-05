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
| Chuột trái lên cọc tập | chạy tới và chém |
| Con lăn | kéo camera gần / đẩy xa |

## Đang ở mốc 3D-0 — khung

- **Sân thử:** sân lát đá 24×24 m, tường hai phía sau, cột, cờ, đuốc treo tường và đuốc đứng (đèn
  thật, đổ bóng), thùng, hòm, bàn. Đất cỏ trải rộng ra ngoài sân.
- **Ánh sáng:** nắng chiều xiên đổ bóng mềm, đổ bóng ngược của đuốc, che tối khe kẽ (SSAO), sương
  mỏng ở xa, chỉnh màu trầm cho gần chất MU.
- **Camera kiểu MU:** cố định chéo 45°, không xoay, chỉ bám theo nhân vật và đổi tầm xa.
- **Dark Knight** (mô hình tạm, xem dưới): đứng, chạy, chém, trúng đòn, chết; quay người theo hướng
  đi; tìm đường vòng vật cản trên lưới 0,5 m.

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
| Medieval Hexagon *(mốc 3D-1)* | lò rèn, quán rượu, chợ, giếng, tháp, nhà, lâu đài |

Phong cách KayKit là low-poly tròn trĩnh, chưa phải dark fantasy kiểu MU — đó là art TẠM để dựng
game. Mô hình riêng thay vào sau, miễn dùng chung khung xương kiểu người thì không phải viết lại mã.

## Dữ liệu giữ lại từ bản trước

`scripts/du_lieu/` là dữ liệu thuần, chưa nối vào bản 3D, sẽ dùng lại ở mốc 3D-1/3D-2:

| Tệp | Việc |
|---|---|
| `ban_do_ardhaven.gd` | bố cục thành Ardhaven: tường, cổng, nhà, chợ, sông, vùng quái |
| `noi_that.gd` | bốn phòng trong nhà: lò rèn, quán rượu, tháp pháp sư, kho |
| `npc_du_lieu.gd` | lời thoại, nút, hàng bán theo vai NPC |
| `vat_pham.gd` | vật phẩm và chiêu |
| `axie.gd` | 16 con Axie và tam giác khắc hệ phòng thủ |

## Lộ trình

| Mốc | Việc |
|---|---|
| **3D-0** | khung: camera, ánh sáng, nhân vật chạy/chém — **đang ở đây** |
| 3D-1 | dựng Ardhaven 3D từ `ban_do_ardhaven.gd` |
| 3D-2 | quái, đánh, rơi đồ, NPC, tiệm, kho, vào nhà, Axie đi theo (tranh phẳng quay về camera), HUD, radar |
| 3D-3 | trang bị hiện lên người: nón · áo · găng · quần · giày · vũ khí gắn lên xương |
| 3D-4 | xuất bộ cài Windows/Mac/Linux bằng máy |

## Kiểm tra

```
godot --headless --path godot -s tests/test_buoc.gd       # cổng vật lý: chân không trượt, chạm đất, đúng hướng (8 hướng)
godot --headless --path godot -s tests/test_3d0.gd        # cổng lối chơi: bấm đất, đi vòng cột, chém cọc, camera
xvfb-run godot --path godot -s tests/chup3d.gd            # chụp 4 ảnh vào godot/tmp_chup/ (cần Vulkan; Mesa lavapipe là đủ)
```

- `test_buoc.gd` lái chính `NhanVat3D.buoc()` và tua hoạt ảnh cùng nhịp, rồi đo vị trí thế giới của
  mũi chân. Hiện tại chân chống lệch **1,0 cm** ở cả 8 hướng (ngưỡng 3,5 cm). Thử ngược: cho nhân
  vật dời nhanh hơn chân 20% ⇒ đỏ, lệch 7,4 cm.
- `test_3d0.gd` bấm bằng toạ độ màn hình qua đúng hàm của game. Hai que dò từng mù và đã sửa:
  - "đi vòng cột" phải đo bằng **hộp bao thật của cột**, không bằng lưới đi bộ (hỏi lại chính lưới
    thì lưới hỏng là cả hai cùng hỏng); và đếm vào mảng, vì **lambda GDScript chép biến cục bộ theo
    giá trị** — `dem += 1` trong lambda không bao giờ đổi biến ngoài;
  - "camera bám" phải đo cả **góc và tầm xa**, không chỉ "nhân vật giữa màn" — camera đứng yên mà
    xoay đầu nhìn theo cũng ra giữa màn.
  Thử ngược: bỏ vật cản · camera không bám ⇒ cả hai đỏ đúng mục.
