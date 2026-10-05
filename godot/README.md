# Axie Rift: bản Godot (M0)

MMORPG pixel art lấy cảm hứng từ **MU Online**, có thêm lớp Axie. Bản web cũ ở `public/game/` vẫn chạy nguyên ở production; thư mục này là bản dựng lại, chưa nối vào deploy.

## Mở và chạy

1. Cài **Godot 4.5** trở lên (bản thường, không cần bản .NET).
2. Mở Godot → **Import** → chọn `godot/project.godot`.
3. Bấm **F5** để chạy.

| Điều khiển | |
|---|---|
| Bấm chuột trái lên đất | đi tới đó; giữ chuột thì nhân vật đi theo con trỏ |
| Bấm chuột trái lên quái | chạy tới và chém liên tục |
| Đi qua đồng Lumen | nhặt |

## Đã có ở M0

- **Map Ardhaven:** isometric 96×96 ô.
  - Thành đá có tường, tháp góc, 4 cổng; trong thành có nhà, đài phun nước, đèn, 4 NPC đứng chờ.
  - Ngoài thành có đường lát đá từ cổng ra, sông có cầu, hồ, rừng dày.
  - Quái mạnh dần theo 3 vòng quanh thành: cấp 1-3, 4-7, 8-12.
  - Trong thành là khu an toàn: quái không đuổi vào, hồi máu nhanh gấp 3.
  - Tìm đường bằng A* quanh vật cản.
- **Dark Knight:**
  - 8 hướng; 6 trạng thái: đứng, đi, chạy, chém, trúng đòn, chết.
  - 4 chỉ số kiểu MU; lên cấp; hồi máu và mana.
- **Bọ Giáp (quái):**
  - Lang thang quanh chỗ sinh; thấy người thì đuổi, xa chỗ sinh quá thì quay về.
  - Bị đánh thì khựng; chết thì rơi đồ, rồi sinh lại.
- **HUD kiểu MU:** quả cầu máu và mana, thanh kinh nghiệm, thanh máu mục tiêu.
- **Đồ rơi:** nằm dưới đất, nảy một vòng cung rồi nằm yên, đi qua thì nhặt.

## Map Ardhaven — sửa thế nào

Bố cục nằm ở **`scripts/ban_do_ardhaven.gd`**, chỉ là dữ liệu. Sửa số là map đổi, không cần đụng code:

| Hằng | Việc |
|---|---|
| `THANH` | vị trí và cỡ thành (ô); viền tự thành tường, góc thành tháp |
| `CONG` | những cạnh có cổng (`x+` `x-` `y+` `y-`); đường tự chạy từ cổng ra mép map |
| `CONG_TRINH` | nhà, đài phun nước, đèn: `[tên, ô góc, xoay 0-3]` |
| `NPC` | tên và chỗ đứng |
| `SONG`, `HO` | đường sông (chuỗi điểm) và hồ; chỗ đường cắt sông tự thành cầu |
| `VUNG_QUAI` | vòng khoảng cách quanh thành: cấp, số con, tên, màu |
| `NGUONG_RUNG` | rừng dày hay thưa |

**Tìm toạ độ ô:** chạy game, giữ **Alt**. Góc trái màn hình hiện ô dưới con trỏ và loại đất ở đó.

**Trục ô:** x đi xuống-phải trên màn hình, y đi xuống-trái.

Công trình to (nhà, cổng, đài phun nước) được **cắt thành dải dọc 16 px**. Mỗi dải xếp lớp theo mép trước của chân đế ngay dưới nó, nên người đứng trước mặt hông nhà thì đè lên nhà, đứng sau nhà thì bị che. `tests/chup_che.gd` chụp bốn tư thế này để kiểm.

## Chưa có (các mốc sau)

- **Mạng:** online qua Nakama trên VPS.
- **Hệ đồ:** túi đồ, trang bị tách lớp (paper-doll), Tinh Xảo / Cổ Vật, ngọc, rèn +N.
- **Nội dung:** lớp nhân vật thứ hai trở đi, kỹ năng, map khác.
- **Lớp Axie:** pet đi theo và hệ phòng thủ tam giác.
- **Art thật:** hình hiện tại là bản tạm sinh bằng máy (xem dưới). Hoạ sĩ, hoặc PixelLab + chỉnh tay, sẽ vẽ đè lên đúng các khung này.

## Art: render 3D → pixel art, có số đo vật lý

```
python3 godot/tools/sprites/render.py hiep_si    # Dark Knight
python3 godot/tools/sprites/render.py bo_giap    # Bọ Giáp
python3 godot/tools/sprites/render.py canh       # cây, đá
python3 godot/tools/sprites/render.py thanh      # tường, tháp, cổng, nhà, đài phun nước, đèn
python3 godot/tools/sprites/o_dat.py             # ô đất 64×32
```

Cần `pip install bpy==4.2.0 pillow numpy`. Trên Linux không có màn hình thì cần thêm `libegl1`.

- **Mô hình:** mỗi nhân vật là một bộ khối gắn trên khớp. Chân dùng IK hai đoạn: bàn chân đang chống lùi đúng bằng tốc độ thân tiến lên, nên đứng yên trên mặt đất.
- **Camera:** chiếu song song, góc nâng **30°**. Đó đúng là phép chiếu của ô đất 2:1, nên sải chân trên sprite và quãng đường đi trên map dùng chung một thước (35,96 px/m).
- **8 hướng render thật,** không lật gương, nên không hướng nào bị dẹp.
- **Hậu kỳ:** tắt khử răng cưa, lượng tử về bảng màu 5 sắc độ mỗi vật liệu, viền tối 1 px.
- **Dây chuyền tự dừng** khi IK phải kẹp vì chân bị đòi với xa hơn chiều dài nó, vì kẹp là trượt.
- **Chống xuyên đất:** đo đỉnh lưới thấp nhất ở mọi khung. Thân ngã/trúng đòn thì được dời cho chạm đúng mặt đất; nhát chém thì thu lại cho tới khi mũi kiếm dừng trên đất.
- **JSON đi kèm mỗi bộ** mang tốc độ (m/s), fps, khung trúng đòn và vị trí bàn chân từng khung. Game **đọc** các số này, không chép tay.

Cỡ: ô 96×96, người cao khoảng 56 px. Màn vẽ nội bộ 640×360, phóng nguyên lần (×2 = 720p, ×3 = 1080p, ×4 = 1440p). Cả bộ Dark Knight 6 trạng thái × 8 hướng nặng khoảng 0,3 MB.

## Kiểm tra

```
godot --headless --path godot -s tests/test_chan.gd                                   # cổng vật lý, thoát 1 nếu đỏ
xvfb-run godot --rendering-driver opengl3 --path godot -s tests/chup.gd               # chụp 3 ảnh vào godot/tmp_chup/
```

`test_chan.gd` lái chính `ThanThe.buoc_di()` của game theo cả 8 hướng, rồi kiểm ba điều:

1. **Không xuyên đất:** mọi trạng thái của mọi bộ, thân đứng/ngã thì phải chạm đất.
2. **Chân chống không trượt quá 1 px:** đo vị trí bàn chân đang chống trên mặt đất ở giữa mỗi khung. Hiện tại đi bộ lệch 0,20–0,38 px, chạy tối đa 0,84 px.
3. **Hướng sprite khớp hướng đi.**

Thử ngược: cho nhịp bước nhanh hơn 20% so với quãng đường thì bài đỏ, trượt 2–4 px.

**Giới hạn biết trước:** giữa hai khung liền nhau, sprite đứng yên trong khi thân vẫn trôi, nên có một "răng cưa" 3,4 px khi đi và 6,3 px khi chạy. Đây là giới hạn của hoạt ảnh theo khung, không phải lỗi trượt chân. Muốn giảm thì thêm khung.
