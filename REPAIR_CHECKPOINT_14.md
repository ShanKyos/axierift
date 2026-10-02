# Magic checkpoint 14 — collision quét, ragdoll và gate production

Ngày 02/10/2026, giờ Việt Nam. **Đã chốt checkpoint 14 cho tích hợp thử; chưa đủ điều kiện production.** Ba mốc 14-A / 14-B / 14-C có QA và dữ liệu phục hồi. Không push GitHub, merge main hoặc deploy.

## Các sửa đổi đã hoàn thành

**Collision tốc độ cao:** bộ giải có conservative advancement để quét sphere/segment chuyển động với capsule chuyển động, tìm thời điểm tiếp xúc rồi giữ ràng buộc contact trong vòng lặp solver. Kiếm có collider đoạn liên tục cho hai nửa blade; không còn chỉ kiểm các nút hilt/mid/tip. Cánh bổ sung collider cạnh ngoài tip–top. AABB loại các cặp xa trước khi tìm điểm gần nhất. Phản lực và friction ở contact đoạn phân bố theo trọng số trên hai đầu đoạn và hai đầu capsule.

**Ragdoll:** cú ngã có xung quay quanh tâm khối lượng, thay vì để rig đứng thẳng rồi co gập xuống sàn. Tổng xung tuyến tính thêm vào bằng 0 trong sai số số học; vận tốc có sẵn được giữ. Khi chết, giới hạn endpoint tay/chân ngăn gập quá mức. Motor thân/cánh tắt và grip vũ khí thả như checkpoint 13. Không dùng đường position keyframe để ép thân xuống sàn.

**Đeo vũ khí:** mount sau lưng đổi depth từ −8 sang −18 cm để nằm ngoài capsule torso. Kiếm được khởi tạo ngay ở back mount trong idle/walk/run, thay vì xuất phát từ wrist rồi kéo xuyên thân để về lưng. Khi đánh vẫn dùng grip nối wrist; cấu trúc rod và khối lượng giữ nguyên.

**Tối ưu:** vòng distance constraint cập nhật vector tại chỗ, giảm các array tạm. Không thêm `ctx.filter`, shadowBlur hoặc bitmap art mới. Viewer có bật/tắt quét nhanh CCD, collision, cánh, mass và xung lực ngoài; số contact và CCD hit được hiển thị.

## QA kỹ thuật

| Phép thử | Kết quả |
|---|---|
| Crossing nhanh | 6 trường hợp: 12.000 / 24.000 / 60.000 cm/s × capsule đứng yên/di chuyển. CCD tắt: xuyên; bật: chặn ở mặt tới |
| Va chạm giữa các nút blade | Collider đoạn chặn khi hilt và tip đều ở ngoài capsule; không collider thì bỏ sót |
| Quét đoạn blade | Đoạn đi qua capsule trong một bước: CCD bật dừng ở z=−10; tắt kết thúc z≈49,88 |
| Kernel hồi quy | Gravity, mass, motor, friction, restitution, capsule reaction, angular inertia và 30/60/144 FPS đạt |
| Toàn bộ clip/hướng | 21 clip × 8 hướng × 3 lựa chọn cánh = **504 scenario, 8.064 lần vẽ** |
| Vị trí / collider | Tất cả tọa độ và vận tốc hữu hạn; điểm không xuyên sàn trong các mẫu; residual blade/cạnh cánh–capsule lớn nhất **2,51 × 10⁻⁸ cm** |
| Ràng buộc xương/props | Sai số lớn nhất **0,9175 cm** trong stress sweep; đây không phải sai số xuyên collider |
| Nội dung art | Các scenario có bitmap không rỗng; tối thiểu 1.621 pixel alpha>20 ở frame được đọc |
| Ragdoll 8 hướng | Khoảng hip–ankle sau settle: checkpoint 13 **19,85 cm** → checkpoint 14 **82,30 cm**; không còn co chân về tư thế crouch trong bài này |
| Xung quay khi ngã | Tổng xung tuyến tính thêm vào <10⁻⁷; hai vũ khí thả; contact sàn đạt ở cả 8 hướng |
| Tối ưu không đổi nghiệm | Fixture 32 nút, 480 bước; khác biệt vị trí cuối tối đa **1,22 × 10⁻¹² cm** |
| Game adapter mới | 240 frame native; chạy có/không cánh; 32 trường hợp attack ground/air; không lỗi JavaScript |
| Tắt vật lý | Hồi quy cũ: 960 frame + 1.344 ground/air attack; mapping, world drop, unequip đạt; không lỗi trang |

Sweep kiểm đủ tám keyframe mỗi clip, mỗi keyframe hai lần vẽ ở 60 Hz để stress target. Với death còn chạy thêm 180 bước settle. +0/+9/+10/+11 và bảy tier armor/weapon được phân bố giữa scenario; **không phải tích Descartes mọi clip × hướng × cánh × level × mọi mix**. Các số residual chỉ áp dụng collider được model, không phải mọi pixel mép ảnh.

Conservative advancement giới hạn 48 vòng tìm contact và có tolerance. Các bài crossing đã đạt không chứng minh mọi grazing, rotation, overlap ban đầu hoặc mesh đều hết tunneling. Collision cánh mới ở cạnh ngoài, chưa phủ phần màng tam giác bên trong hay đường viền alpha của painting.

## Hiệu năng đo lại

Chromium headless, SwiftShader, canvas 1280 × 720. Mỗi scenario 20 frame warm-up + 40 mẫu. Cùng seed ngẫu nhiên và thời gian game; đo cả hoàn tất canvas bằng readback. Physics bật ở cả checkpoint 13 và 14. FX thấp, không kết nối mạng thật.

| Phạm vi | Median CP13 → CP14 | p95 CP13 → CP14 |
|---|---:|---:|
| Vẽ 1 actor | 16,4 → 15,7 ms | 19,6 → 20,7 ms |
| Vẽ 8 actor | 72,9 → 68,6 ms | 87,1 → 86,9 ms |
| Vẽ 20 actor | 166,9 → 147,0 ms | 190,3 → 165,4 ms |
| Toàn cảnh, 1 Magic | 27,9 → 26,7 ms | 31,3 → 29,4 ms |
| Toàn cảnh, 8 Magic | 105,9 → 104,3 ms | 116,5 → 114,5 ms |

Toàn cảnh gọi `update()` + `render()` thực: terrain, NPC, mob, entity ordering, nhân vật và HUD. Map có 102 mob; cả hai phiên đo ghi 952 lượt vẽ mob trong 60 frame, không phải 102 mob đều nằm trong viewport mỗi frame. Các Magic thêm vào là actor mạng giả trong cùng scene. Scene này chưa bao gồm tải network thật hoặc spam skill/VFX cao.

Fixture CPU riêng: median solver **0,593 → 0,142 ms**, nhưng không được dùng số này thay cho FPS game. Actor 1 có p95 cao hơn trong lần đo; không kết luận cải thiện mọi percentile. **Các scenario vẫn vượt ngân sách 16,7 ms ở p95 trên môi trường đo. Gate 60 FPS chưa đạt; không bật mặc định hoặc lên main.** Cần profile batching/layer/outline, rồi đo desktop và mobile thật trước quyết định production.

## Review hình và phần còn thiếu

Đã xem sheet baseline/candidate của cả 8 hướng, ảnh native death và GIF ground/air/death 32 frame, 8 FPS. Pose chết trải thân/chân rõ hơn checkpoint 13, không còn cùng dạng co crouch. Các ảnh 8 hướng được capture vào canvas lớn rồi fit từng ô để không cắt mất props rơi.

West/East vẫn foreshorten mạnh; một số góc còn có silhouette tay/cánh chồng và cutout bị nén. Chưa nghiệm thu thẩm mỹ toàn bộ chuyển động. Cánh là mặt phẳng cứng; chưa có màng/xương cánh biến dạng, aerodynamic lift, full joint angle/twist hoặc body self-collision. Chưa có collision actor–actor/terrain mesh hoặc chuyển damage/movement gameplay sang solver. Contact dust cũng cần audit ở mode physics. Lỗi strict parity ba pixel của checkpoint 12 vẫn mở.

**Bộ assets không thêm atlas hoặc repaint:** giữ 14 state + 7 ground attack, 7 bộ giáp × 4 slot, 7 vũ khí, DW1/Magic2, body/mask/VFX, tổng 2.051 atlas. Native/compiled giữ +0/+9/+10/+11; flat exports vẫn checkpoint 11 và +0. Vật lý cần runtime mới, không tự có trong PNG sheet.

## Gói và cách tiếp tục

Delta 14 áp lên bộ đầy đủ checkpoint 11 + delta 12 + delta 13. Runtime thay ba file: `magic-physics.js`, `magic-physics-rig.js`, `magic_physics.html`; game.js/index/native renderer không đổi trong checkpoint này. Patch `CHECKPOINT_14_RUNTIME_FROM_13.patch` đã kiểm áp vào checkout checkpoint 13.

Serve `public/game` qua HTTP rồi mở `magic_physics.html`, hoặc game với `?test=1&magicRebuild=1&magicPhysics=1`. Scripts `qa_magic_checkpoint14_*` nằm trong `scripts/`; Playwright dùng `MAGIC_QA_CHROME`. Sweep lưu từng clip với hash source để tiếp tục khi bị ngắt. Final ZIP giữ ba baseline JS cần chạy QA A/B và tối ưu; loại các frame dựng GIF tạm cùng backup game/viewer không cần thiết.

Recovery 14-A giữ kernel/QA; recovery 14-B giữ rig, kết quả sweep/ragdoll và benchmark. Delta cuối giữ source, patch, QA, GIF/PNG, report và manifest. `productionReady=false`, `physicsReadyForTrial=true`.

Ưu tiên tiếp theo: profile render toàn scene và batching, collider màng cánh + giới hạn góc, rồi full playback/mix QA và benchmark thiết bị thật. Việc vượt qua các QA kỹ thuật ở checkpoint 14 không tự mở gate production.
