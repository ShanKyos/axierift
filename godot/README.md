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
| Bấm chuột trái lên NPC | đi tới và nói chuyện (thợ rèn, cô bán rượu, pháp sư: Mua bán · thủ kho: Mở kho) |
| Bấm lên ngôi nhà có cửa | đi tới cửa rồi vào nhà; bước lên thảm đỏ trong nhà là ra |
| Chuột phải / phím 1 | tung chiêu đã học (Chém Xoáy — mua sách ở Tháp Pháp Sư, cần cấp 5), quét về phía con trỏ |
| Q / W | uống bình máu / bình mana |
| I | túi đồ · Esc: đóng mọi bảng |
| P | chọn con Axie đi theo (16 con) |
| M | bật/tắt radar · bấm lên radar là đi tới chỗ đó |
| Đi qua đồng Lumen | nhặt |

## Đã có ở M0

- **Thành Ardhaven (32×32 ô):** quảng trường giữa có đài phun nước, hai đại lộ chữ thập ra bốn cổng.
  - Tây bắc: **Lò Rèn** (Thợ Rèn Hald — vũ khí, giáp) và **Kho Đồ** (Thủ Kho Bram — gửi đồ, gửi Lumen).
  - Đông bắc: **Tháp Pháp Sư** (Pháp Sư Ivo — sách chiêu, bình mana).
  - Tây nam: **Quán Rượu Ấm Lò** (Cô Rượu Mira — bình máu, bình mana).
  - Đông nam: chợ có sạp, giếng, thùng hàng. Nhà dân, đèn, cây, hàng rào rải khắp.
  - 7 dân làng đi lại, 4 lính gác ở cổng; ai cũng nói chuyện được.
- **Vào nhà:** bốn nhà trên có phòng riêng (sàn gỗ, tường, đồ đạc theo nghề, NPC đứng sau quầy).
  Vào nhà thì thế giới ngoài trời chỉ bị ẩn và đóng băng, không bị dựng lại — ra là về đúng chỗ.
- **Axie đi theo:** 16 con Axie chính chủ, pixel hoá cùng kiểu với mọi sprite khác, đứng ngang hông
  nhân vật, chạy theo, giật khi chủ ăn đòn, gồng khi chủ tung chiêu, theo vào cả trong nhà.
  - **0 chỉ số.** Thứ nó quyết định là **hệ phòng thủ**, theo tam giác chín lớp Axie:
    ① Beast·Bug·Mech ▶ ② Plant·Reptile·Dusk ▶ ③ Aquatic·Bird·Dawn ▶ ①.
    Quái khắc Axie ⇒ ăn đòn ×1,12; Axie khắc quái ⇒ ×0,90; cùng nhóm ⇒ ×1.
  - Ba vòng quái quanh thành mang ba nhóm khác nhau (Bug · Reptile · Dawn), nên không con nào hợp
    cả ba — đi xa hơn là có lý do đổi Axie. Bước sang vòng khác thì băng-rôn nói nên mang con nào;
    mỗi đòn khắc/bị khắc hiện chữ trên đầu (có hồi 2,6 giây). Bảng P tô màu từng con theo đất đang đứng.
- **Đồ:** túi 32 ô, kho 40 ô, ô vũ khí + giáp có yêu cầu Sức Mạnh, thuốc xếp chồng, sách học chiêu.
- **Map Ardhaven:** isometric 112×112 ô.
  - Thành đá có tường, tháp góc, 4 cổng.
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
- **HUD theo bố cục bản web Axie Rift** (vẽ ở 640×360, đúng nửa bản web):
  - trái trên: chân dung (con Axie đang theo) + thanh máu/mana bằng art của bản web; ô Lực Chiến;
  - giữa trên: tên vùng + nhãn (An Toàn / Vùng <hệ>), thanh máu mục tiêu kèm hệ của quái;
  - phải trên: ví Lumen + **radar** (lưới ô thật của map, cùng phép chiếu iso; chấm quái đỏ, NPC có
    việc vàng, dân xanh, cửa nhà vàng đậm; trong nhà tự phóng to để thấy cả phòng);
  - giữa dưới: Túi · Axie · Radar │ chiêu │ bình máu Q · bình mana W (có số lượng), dải EXP ngay dưới;
  - phải dưới: nhật ký (hạ quái, nhặt Lumen, lên cấp), tự mờ.
- **Đồ rơi:** nằm dưới đất, nảy một vòng cung rồi nằm yên, đi qua thì nhặt.

## Map Ardhaven — sửa thế nào

Bố cục nằm ở **`scripts/ban_do_ardhaven.gd`**, chỉ là dữ liệu. Sửa số là map đổi, không cần đụng code:

| Hằng | Việc |
|---|---|
| `THANH` | vị trí và cỡ thành (ô); viền tự thành tường, góc thành tháp |
| `CONG` | những cạnh có cổng (`x+` `x-` `y+` `y-`); đường tự chạy từ cổng ra mép map |
| `CONG_TRINH` | nhà, đồ phố: `[tên, ô góc, xoay 0-3, (tuỳ chọn) khoá phòng trong NoiThat]` |
| `CAY` | cây trong thành |
| `NPC` | `[tên, ô, bộ sprite, vai, lang thang?]` — vai đọc lời thoại và hàng bán ở `scripts/npc_du_lieu.gd` |
| `SONG`, `HO` | đường sông (chuỗi điểm) và hồ; chỗ đường cắt sông tự thành cầu |
| `VUNG_QUAI` | vòng khoảng cách quanh thành: cấp, số con, tên, màu |
| `NGUONG_RUNG` | rừng dày hay thưa |

**Tìm toạ độ ô:** chạy game, giữ **Alt**. Góc trái màn hình hiện ô dưới con trỏ và loại đất ở đó.

**Trục ô:** x đi xuống-phải trên màn hình, y đi xuống-trái.

**Cửa nhà chỉ đặt ở mặt nhìn thấy** (+x hoặc +y). Hướng cửa theo `xoay`: `nha_a` · `nha_c` ·
`thap_phap` ⇒ 0 là +y, 1 là +x; `nha_b` ⇒ 0 là +x, 3 là +y. Ô chân đế ngay sau cánh cửa là ô đi
được — bước vào đó là vào nhà; ra thì hiện ở ô trước cửa nên không bị hút lại.

| Tệp dữ liệu | Việc |
|---|---|
| `scripts/noi_that.gd` | từng phòng: cỡ, đồ đạc, NPC, thảm cửa, cửa sổ |
| `scripts/npc_du_lieu.gd` | lời thoại, nút (Mua bán / Mở kho), hàng bán theo vai |
| `scripts/vat_pham.gd` | vật phẩm (giá, sát thương, phòng thủ, hồi máu…) và chiêu |

Công trình to (nhà, cổng, đài phun nước) được **cắt thành dải dọc 16 px**. Mỗi dải xếp lớp theo mép trước của chân đế ngay dưới nó, nên người đứng trước mặt hông nhà thì đè lên nhà, đứng sau nhà thì bị che. `tests/chup_che.gd` chụp bốn tư thế này để kiểm.

## Chưa có (các mốc sau)

- **Mạng:** online qua Nakama trên VPS.
- **Hệ đồ:** túi đồ, trang bị tách lớp (paper-doll), Tinh Xảo / Cổ Vật, ngọc, rèn +N.
- **Nội dung:** lớp nhân vật thứ hai trở đi, kỹ năng, map khác.
- **Lớp Axie:** trục thứ hai (sáu bộ phận → độ sắc), gacha Khế Ước, chọn Axie ở màn tạo nhân vật.
- **Art thật:** hình hiện tại là bản tạm sinh bằng máy (xem dưới). Hoạ sĩ, hoặc PixelLab + chỉnh tay, sẽ vẽ đè lên đúng các khung này.

## Art: render 3D → pixel art, có số đo vật lý

```
python3 godot/tools/sprites/render.py hiep_si    # Dark Knight
python3 godot/tools/sprites/render.py bo_giap    # Bọ Giáp
python3 godot/tools/sprites/render.py canh       # cây, đá
python3 godot/tools/sprites/render.py thanh      # tường, tháp, cổng, nhà, quán rượu, tháp pháp sư, đèn
python3 godot/tools/sprites/render.py do_vat     # nội thất + đồ phố: quầy, đe, lò rèn, kệ, rương, sạp chợ, giếng…
python3 godot/tools/sprites/render.py npc_tho_ren   # NPC: npc_tho_ren · npc_co_gai · npc_phap_su · npc_thu_kho · npc_dan_a/b/c
python3 godot/tools/sprites/render.py icon_do    # icon túi đồ 32×32
python3 godot/tools/sprites/o_dat.py             # ô đất 64×32 (kể cả sàn gỗ, thảm cửa)
python3 godot/tools/sprites/axie_pixel.py        # 16 Axie: lấy tranh Spine đã nướng của bản web → pixel art
python3 godot/tools/ui/ui_pixel.py               # khung gothic + thanh máu/mana + xu của bản web → pixel art
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
godot --headless --path godot -s tests/test_thanh.gd                                  # cổng thành: nhà, NPC, tiệm, kho, chiêu
godot --headless --path godot -s tests/test_axie.gd                                   # cổng Axie: tam giác, 0 chỉ số, hệ số đòn, pet
godot --headless --path godot -s tests/test_hud.gd                                    # cổng HUD: radar đúng toạ độ, nút, phím 1, nhật ký
xvfb-run godot --rendering-driver opengl3 --path godot -s tests/chup.gd               # chụp 3 ảnh vào godot/tmp_chup/
xvfb-run godot --rendering-driver opengl3 --path godot -s tests/chup_thanh.gd         # chụp thành, 4 phòng, các bảng
```

`test_chan.gd` lái chính `ThanThe.buoc_di()` của game theo cả 8 hướng, rồi kiểm ba điều:

1. **Không xuyên đất:** mọi trạng thái của mọi bộ, thân đứng/ngã thì phải chạm đất.
2. **Chân chống không trượt quá 1 px:** đo vị trí bàn chân đang chống trên mặt đất ở giữa mỗi khung. Hiện tại đi bộ lệch 0,20–0,38 px, chạy tối đa 0,84 px.
3. **Hướng sprite khớp hướng đi.**

Thử ngược: cho nhịp bước nhanh hơn 20% so với quãng đường thì bài đỏ, trượt 2–4 px.

`test_thanh.gd` (59 mệnh đề) lái chính hàm của game: đi bộ từ quảng trường vào từng nhà, bấm NPC,
mua/bán ở tiệm rèn, gửi/rút ở kho, học Chém Xoáy, uống thuốc, chiêu trúng quái trong vòng mà không
trúng quái ngoài vòng, ra nhà đúng chỗ và không bị hút vào lại. Kiểm luôn bố cục: công trình không
chồng nhau, không chặn đại lộ, cửa nào cũng đi tới được. Thử ngược: tắt lệnh vào nhà ⇒ đỏ 4 nhà;
bỏ bán kính chiêu ⇒ đỏ "quái ngoài vòng".

`test_axie.gd` (18 mệnh đề): đủ 16 con × bốn khối · tam giác đúng hình · đổi qua cả 16 con thì chỉ
số không đổi một điểm · đòn THẬT qua `nhan_sat_thuong` nhân đúng ×1,12 / ×0,90 · pet bám sau, nhảy
tới khi xa, lật đúng mặt, theo vào nhà · bảng P nói đúng hệ đất. Thử ngược: bỏ hệ số · cho pet
không theo vào nhà · lật ngược mặt ⇒ cả ba đỏ đúng mục.

**Axie chỉ có hai hướng** (rig Spine vẽ nhìn ngang), lật gương theo hướng ngang khi đi. Đó là chủ
ý: giữ nét vẽ chính chủ để người chơi nhận ra con Axie của mình, thay vì dựng lại bằng 3D cho đủ 8
hướng.

**Giới hạn biết trước:** giữa hai khung liền nhau, sprite đứng yên trong khi thân vẫn trôi, nên có một "răng cưa" 3,4 px khi đi và 6,3 px khi chạy. Đây là giới hạn của hoạt ảnh theo khung, không phải lỗi trượt chân. Muốn giảm thì thêm khung.
