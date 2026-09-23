# Magic modular runtime v2

Gói tích hợp nhân vật Magic/Spellblade cho AxieRift. Đây là baseline chính hiện tại; không dùng lại các sheet prototype Archangel, Magic Knight hoặc Hỏa Thần cũ.

## Nội dung runtime

### Nhân vật và chuyển động mặt đất

- `body_base`: Idle, Walk, Run và Attack.
- Mỗi state là atlas `2048×2048`, gồm 8 hướng × 8 frame, mỗi frame `256×256`.
- Thứ tự hướng: South, Southwest, West, Northwest, North, Northeast, East, Southeast.
- Pivot chung: `(128,244)`.
- Nhịp mặc định: Idle 5 FPS, Walk 7 FPS, Run 11 FPS, Attack 10 FPS.

### Bảy bộ giáp

1. Vải thô.
2. Trâu xanh.
3. Đồ đồng.
4. Ma Thuật.
5. Phong Vũ.
6. Lôi Phong.
7. Cuồng Phong.

Mỗi bộ có đủ Idle, Walk, Run và Attack 8 hướng. Giáp là `appearance-replacement`; chưa tuyên bố mix áo/quần/găng/giày theo từng món.

### Bảy nhóm vũ khí rời

1. Song đao cơ bản.
2. Song chùy.
3. Song hỏa đao.
4. Song kiếm điện.
5. Lôi phong đao.
6. Ảo ảnh đao.
7. Hỏa tinh kiếm.

Vũ khí không được bake vào body/armor. `sockets.json` cung cấp socket hai tay theo state, hướng và frame.

### Bay và cánh

- True-flight hướng South, 8 frame, nhịp cánh chậm `175 ms/frame`.
- Hai wing layer rời: Wing 1 DW và Wing 1 MG.
- Body Ma Thuật, song Ảo Ảnh Đao và lớp `hand_grip` độc lập.
- Gốc cánh ở sau vai; cánh lớn hơn thân và không kéo xuống dưới chân.

### Fire Slash trên không

- Slice duyệt hướng Southeast, 8 frame, `105 ms/frame`.
- Pose xoay theo mục tiêu, vai dẫn đòn, chân co bất đối xứng.
- Layer rời: `wing_back`, `body_armor`, `weapon_left/right`, `hand_grip_front`, `skill_vfx`.
- Grip pivot của Ảo Ảnh Đao: `(128,45)` trên texture gốc.
- Mỗi frame đặt pivot vào socket lòng bàn tay trước khi xoay theo cổ tay.
- Kiểm tra hiện tại: `16/16` grip pivot chồng vùng bàn tay có alpha.

## Demo

Chạy tại thư mục gốc của gói:

```bash
python3 -m http.server 8080
```

Mở `http://localhost:8080/game/proto_magic_mix.html`.

Không mở trực tiếp bằng `file://`, vì trình duyệt sẽ chặn việc tải JSON và texture.

## File quan trọng

- `game/assets/magic-runtime/manifest.json`: manifest chính.
- `game/assets/magic-runtime/sockets.json`: socket chuyển động mặt đất.
- `game/assets/magic-runtime/flight/flight-manifest.json`: true-flight South.
- `game/assets/magic-runtime/flight_attack/flight-attack-manifest.json`: Fire Slash trên không Southeast.
- `game/proto_magic_mix.html` và `.js`: demo runtime.
- `review/`: ảnh và GIF kiểm tra trực quan.
- `scripts/`: script build/normalize/render có thể tái tạo asset.

## Giới hạn đã ghi rõ

- Idle/Walk/Run/Attack mặt đất đã có 8 hướng.
- True-flight hiện mới có hướng South.
- Fire Slash trên không hiện mới có hướng Southeast.
- Giáp đổi theo nguyên bộ; chưa có occlusion mask đủ để mix từng món áo/quần/găng/giày an toàn.
- Wing 1 MG là biến thể thiết kế riêng cho project, không tuyên bố là file art gốc của Webzen.
