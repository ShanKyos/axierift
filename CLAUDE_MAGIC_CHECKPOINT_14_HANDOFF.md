# Hướng dẫn cho Claude — Magic checkpoint 14: art, tích hợp và deploy

Tài liệu bàn giao ngày 02/10/2026. Đọc cùng `AGENTS.md`, `CLAUDE.md`, `DEPLOY_CHECKPOINT_14_STATUS.md` và `deploy/qa/checkpoint14/summary.json`. Đây là hướng dẫn thực hiện; không xác nhận các phần còn thiếu đã được sửa.

## 1. Prompt giao việc — có thể gửi nguyên đoạn này cho Claude

> Tiếp tục dự án Axie Rift từ repository https://github.com/ShanKyos/axierift, nhánh `codex/magic-native-checkpoint14-20261002`. Đọc `CLAUDE_MAGIC_CHECKPOINT_14_HANDOFF.md` và các file được dẫn trong tài liệu trước khi sửa. Mục tiêu: hoàn thiện Magic có art tách lớp, 8 hướng, trang bị trộn độc lập, vũ khí/cánh có socket đúng; kiểm tra động tác trong thành, đánh trên đất và trên không; tích hợp gói native vào game; sửa các lỗi chặn release và push/deploy khi các gate đạt. Chia công việc thành checkpoint 15-A đến 15-F, lưu source, hash, QA và báo cáo sau từng checkpoint. Tiếp tục từ checkpoint đã xong nếu phiên bị ngắt. Không làm lại từ đầu hoặc vẽ lại cả bộ không có lý do. Giữ vật lý opt-in trong lúc kiểm tra. Phân biệt native runtime với flat sprite export và mô phỏng props với vật lý gameplay. Không báo production-ready chỉ vì ảnh tồn tại hay unit test xanh. Người dùng đã yêu cầu push/deploy; thực hiện các bước trong phạm vi đó khi đủ điều kiện, không hỏi lại chỉ vì đến bước push. Nếu thiếu ảnh chuẩn hoặc quyền truy cập, nêu đúng phần bị chặn và tiếp tục phần độc lập làm được. Cuối cùng ghi rõ commit GitHub, gate QA, những giới hạn còn lại và trạng thái production đã xác minh.

## 2. Lấy đúng bản và đọc trạng thái

Nhánh bàn giao đã có commit `948969d644ca7bcd45a7a22ae8d841e4f15951a1` chứa báo cáo QA. Runtime đã ghép với main ở commit `f9c891b87436231f3cdf33b989b58014b2850c06`. Main đối chứng tại lúc QA là `6d11da07d4cdb90bc546892f3bfb47438c41d2ec`; phải fetch lại vì main có thể đã đổi.

Nếu đã có checkout, kiểm tra `git status` trước. Không reset hoặc xoá thay đổi của người dùng. Nếu cần checkout mới:

```bash
git clone https://github.com/ShanKyos/axierift.git
cd axierift
git fetch origin
git switch --track origin/codex/magic-native-checkpoint14-20261002
npm ci
npx playwright install chromium
```

Nếu nhánh local đã tồn tại thì dùng `git switch codex/magic-native-checkpoint14-20261002`, không tạo lại. Xác minh git log, tree và manifest. Đọc phiên bản tài liệu trên checkout mới nhất; các SHA trong tài liệu là mốc lịch sử, không phải lệnh ghim mọi phiên vào commit cũ.

Thứ tự đọc để tránh thông tin cũ:

1. `AGENTS.md` và yêu cầu hiện tại của người dùng.
2. `CLAUDE.md`, đặc biệt yêu cầu sản phẩm, QA và deploy.
3. `DEPLOY_CHECKPOINT_14_STATUS.md`: trạng thái push/deploy mới hơn báo cáo sửa chữa gốc.
4. `NATIVE_CHECKPOINT_14_DEPLOY.md`, manifest, `deploy/qa/checkpoint14/summary.json`.
5. `REPAIR_CHECKPOINT_14.md`: số đo physics, phạm vi phép thử và giới hạn.
6. Rig, compiled metadata, loader và adapter thực tế.

`REPAIR_CHECKPOINT_14.md` ghi “không push” vì được viết trước phiên publish. Không suy ra nhánh chưa lên GitHub. `rig.json` cũng còn mô tả nền cutout cũ; trạng thái physics phải đọc cùng kernel/adapter và cờ runtime. Sửa metadata lỗi thời có giải thích, không đổi `productionReady` thành true để che giới hạn.

## 3. Những file có vai trò gì?

| File/thư mục | Vai trò và cách sửa |
|---|---|
| `public/game/assets/magic-rebuild-v1/rig.json` | Bind landmarks 8 view, bones, camera, pivot, mapping armor/weapon/wing. Sửa khi đổi cấu trúc hay vị trí neo thật |
| `.../source/*.png` | Art nguồn và masters cho vùng bị che. Giữ bản nguồn trước repaint |
| `.../parts/*.png` | Atlas cutout đã compile. Sửa nguồn rồi compile lại khi thay vùng ảnh/bind; không để compiled và source bất đồng |
| `.../compiled.json` | Rect, offset, slot, visible rect, atlas mapping và source hashes. Loader dùng metadata này để cắt part |
| `public/game/magic-rebuild.js` | Pose, draw order, occlusion/completion, enhancement, vũ khí/cánh, compile và render |
| `public/game/magic-physics.js` | Solver, trọng lực, constraints, contacts, friction, restitution, CCD |
| `public/game/magic-physics-rig.js` | Chuyển pose mục tiêu sang actor physics, grip/back mount, wings, death/drop, reset/impulse |
| `public/game/game.js` | Equipment mapping, clip/skill mapping, world coordinates, frame phase, game integration |
| `public/game/index.html` | Nạp renderer → kernel → adapter trước game.js |
| `public/game/magic_physics.html` | Viewer physics, không thay thế QA trong game |
| `NATIVE_CHECKPOINT_14_MANIFEST.json` | Hash 45 file payload; không chứa hash của chính manifest |
| `deploy/qa/checkpoint14/` | Kết quả 250 bài, log lỗi, native QA, default pixel parity |

Gói GitHub này có 33 PNG native, khoảng 32,5 MB payload. **Không phải toàn bộ 2.051 flat atlas/authoring archive.** Một số mục export trong compiled.json chỉ dành cho archive; không báo thiếu runtime chỉ vì entry export không có file. Đối chiếu chính xác các URL mà loader `load()` thực sự gọi.

Nếu cần toàn bộ flat sprites hoặc QA scripts từ các checkpoint cũ: lấy archive checkpoint 11 và delta 12, 13, 14 đã bàn giao riêng, theo đúng thứ tự. Không giả định commit nguồn local `cc406ab...` hoặc mọi script `qa_magic_checkpoint14_*` có trong nhánh GitHub này. Kiểm tra file trước khi gọi lệnh.

## 4. Hợp đồng hình ảnh phải giữ

- 8 hướng theo `rowOrder`: **south, southwest, west, northwest, north, northeast, east, southeast**. Không đổi thứ tự hoặc dùng flip thay mọi hướng mà chưa QA handedness và occlusion.
- Rig hiện khai cell 256, 8 keyframe; pivot `[128, 213.6]`, camera scale `0.72`, offset `[35.84, 48]`. Đây là hợp đồng rig/render, **không phải mọi PNG nguồn đều là sheet ô 256**. Đọc kích thước và rect thực trước khi crop.
- Body + chest/shoulder + gloves + pants + boots; weapon trái/phải, wing và VFX là các thành phần riêng. Magic không thêm helmet mới; vẫn giữ mapping ô trang bị tương thích save.
- Armor: `vai_tho`, `trau_xanh`, `do_dong`, `ma_thuat`, `phong_vu`, `loi_phong`, `cuong_phong`.
- Weapon: `song_dao_co_ban`, `song_chuy`, `song_hoa_dao`, `song_kiem_dien`, `loi_phong_dao`, `ao_anh_dao`, `hoa_tinh_kiem`.
- Wing: `dw_1`, `magic_2`; thử thêm mode không cánh. Cánh gắn ngang vai, phía sau thân, lớn hơn thân, vỗ chậm và quay theo hướng người.
- Trong thành: đi bộ, mang cánh nếu đang trang bị; vũ khí bắt chéo sau lưng. Ngoài thành: phân biệt đánh trên đất không cánh và đánh trên không có cánh. Không tự buộc mọi mode cùng bay.
- Walk: contact L → down → passing → up → contact R → down → passing → up → loop. Run phải nhanh hơn và có cadence riêng.
- 14 state khai trong rig; 7 profile đánh còn có mode ground/air, tạo 21 tổ hợp clip thử nghiệm. Không hiểu 8 keyframe là 8 ảnh chuyển động hoàn chỉnh đã được nghiệm thu.
- Giáp/vũ khí độc lập theo từng ô, không chọn toàn bộ set bằng một giá trị tier duy nhất. Inventory main hiện có `quan`; fallback pants→boots chỉ phục vụ dữ liệu cũ khi thiếu ô quần.
- +0/+9/+10/+11: enhancement trên gear/material phải nhìn thấy; không chỉ thêm vòng aura quanh cả nhân vật. Flat exports cũ còn +0, không tự có mọi biến thể ánh sáng.

Tên file nguồn không bảo đảm phong cách/màu đúng tên set. Ví dụ mapping hiện tại dùng `ma_thuat → source/armor-red.png`, `phong_vu → source/armor-black-gold.png`. Đọc rig để biết file được dùng, nhưng **so bằng mắt với reference người dùng đã chốt**, không đổi tên file rồi xem như sửa được art.

## 5. Quy trình xử lý hình ảnh

### 5.1 Chốt ảnh chuẩn và lưu nguồn

Ảnh chuẩn người dùng đã chỉ định gồm `fire-dash-slash-t01-8dir.gif` và `light-storm-t01-8dir.gif`. Không dùng đường dẫn upload scratch cũ nếu file không tồn tại. Hai GIF không được xác nhận nằm trong nhánh native; cần lấy bản người dùng cung cấp hoặc bản lưu có quyền truy cập. Nếu Claude không truy cập được, yêu cầu cung cấp đúng hai reference này; vẫn làm tiếp kiểm tra manifest, integration và regression độc lập.

Trước khi sửa: lưu source hash, contact sheet 8 hướng, ảnh nền sáng/tối/checkerboard và GIF playback. Ghi rõ bộ nào, layer nào, hướng nào, clip nào đang sửa. Reference có giáp/vũ khí/wing/VFX ghép sẵn chỉ là chuẩn hình và chuyển động; nó không chứng minh có layer rời.

### 5.2 Repaint và tách lớp

1. Xem riêng body, chest, gloves, pants, boots, mỗi vũ khí, mỗi wing và VFX. Xác định phần đang bị dính ảnh, hở khớp hoặc có halo.
2. Đối với hình ghép sẵn, dựng lại vùng body/giáp bị che: mặt sau vai, khuỷu, hông, gối, cổ tay. Không “tách” bằng cách xoá object rồi để lỗ alpha.
3. Giữ silhouette, chất liệu, tỷ lệ và hướng sáng đồng nhất với ảnh chuẩn. Repaint vùng cần thiết, không tạo nhân vật phong cách mới cho mỗi hướng.
4. Có công cụ tạo/sửa ảnh thì dùng cho repaint art có tham chiếu; có thể dùng editor thủ công. Dùng code để inspect, crop/pack, đo alpha và xuất QA; không dùng các hình khối vẽ bằng mã để thay art đã được chốt.
5. Giữ RGBA và transparent background cho part/prop. Kiểm tra viền trên nền trắng, đen và nền game; loại matte trắng/đen có sẵn trong RGB mép alpha.
6. Chừa padding phù hợp với sampling, outline và glow; tránh bleed từ ô bên cạnh. Crop thay đổi kích thước thì cập nhật offset/rect/pivot tương ứng. Không crop tight rồi để socket theo vị trí cũ.
7. Không phóng to toàn bộ sprite để chữa cánh nhỏ hoặc lệch kiếm. Sửa scale/anchor của đúng prop, rồi QA toàn bộ 8 hướng.

### 5.3 Bind, sockets và occlusion

- Bind đủ 8 view bằng landmark hữu hạn. Các part cùng đi theo một pose; không chỉnh mỗi armor bằng offset riêng cho từng animation để che lỗi rig.
- Vũ khí nằm trong lòng bàn tay. Kiểm hilt, blade direction và tay trái/phải ở contact/impact/recovery. Renderer đang dò grip bằng hàng alpha>180 tại khoảng 85% chiều cao source weapon; nếu repaint cán làm hàng này rỗng, loader sẽ lỗi. Kiểm lại grip thực, không chỉ giữ số cũ.
- Trong thành kiểm cả vị trí back mount và chuyển back→hand→back. Physics hiện dùng depth back mount −18 cm để tránh capsule torso; không đổi tùy tiện khi sửa ảnh.
- Wing root theo vai/lưng, occlusion phía xa/phía gần đúng từng view. Cánh là art/prop gắn socket, không vẽ gắn chết vào một frame thân.
- Vẽ glove thật phủ lên hilt tại palm; kiểm cả nhát xoay/cross-arm. Kiểm mask/draw order của hai tay, torso, wing và vũ khí ở mỗi hướng, không chỉ ở south.
- Dùng concealed masters và joint underpaint khi cần bù vùng che; kiểm xem bù có thành blob hay đường seam khi gập khớp không.
- Renderer có cơ chế occlusion/completion nội bộ; **không suy ra đã có bộ PNG mask độc lập đầy đủ cho engine khác**. Nếu xuất flat/mask riêng, cần ghi rõ contract và kiểm từng file.

### 5.4 Compile và xác minh

Loader bình thường đọc `compiled.parts`, `compiled.atlases` và `visibleAtlases`. Authoring fallback đọc `spec.art` cùng concealed masters; bật bằng `magicAuthor`.

- Sau thay source/bind: dùng tooling compile có trong checkout, hoặc cơ chế `MagicRebuild.compile()` sau khi load authoring. Đọc implementation trước vì output gồm metadata và image data URL; không ghi trường `images` chứa base64 vào JSON runtime.
- Xuất PNG đúng đường dẫn, cập nhật compiled rect/offset/visible metadata/source hashes. Không ghi đè cả archive bằng một compile nhỏ rồi mất file chưa dùng.
- Chạy cả compiled path và authoring path; đối chiếu cùng pose, gear, direction, frame. Bất đồng thì sửa nguồn/metadata thay vì chấp nhận hai hình khác nhau.
- Cập nhật manifest khi thay payload. Hash chính xác bytes trên đĩa, tự loại manifest khỏi danh sách tự hash; kiểm không có file bị thiếu.
- Kiểm network request và decode PNG, không chỉ `exists()`. Không đưa LFS pointer dạng text vào game như ảnh.

## 6. Chạy trong game

Phục vụ HTTP, không mở bằng file://:

```bash
python3 -m http.server 8853 --directory public/game
```

| URL local | Dùng để kiểm |
|---|---|
| `http://localhost:8853/` | Renderer mặc định, regression các lớp hiện tại |
| `http://localhost:8853/?test=1&magicRebuild=1` | Native cutout/pose, physics tắt |
| `http://localhost:8853/?test=1&magicRebuild=1&magicPhysics=1` | Native + mô phỏng physics thử nghiệm |
| `http://localhost:8853/?test=1&magicRebuild=1&magicAuthor=1` | Nạp source/bind để so authoring với compiled |
| `http://localhost:8853/magic_physics.html` | Kiểm solver/props, impulse, CCD, death |

Cờ hiện kiểm bằng `URLSearchParams.has()`: **`magicPhysics=0` vẫn bật**, vì tham số vẫn có mặt. Muốn tắt phải xoá tham số. Chỉ `magicPhysics` mà không `magicRebuild` không thay renderer mặc định thành native.

Adapter đã có `magicRebuildGear`, `magicRebuildFrame`, `magicRebuildGait`, `mrMotion` và skill mapping trong game.js. Audit các chỗ này thay vì chèn một renderer thứ hai song song. Khi có main mới, merge và xem conflict có chủ đích; giữ inventory, save, combat balance và renderer các lớp khác.

`?test=1` là đường QA, không phải cấu hình mặc định cho người chơi. Không bật physics globally để chứng minh integration chạy được.

## 7. Vật lý đang có và giới hạn thật

| Hạng mục | Đã có | Còn hạn chế/việc cần làm |
|---|---|---|
| Thân/props | XPBD, gravity, mass, motor targets, fixed step 1/120 s, friction/restitution | Pose mục tiêu vẫn do animation điều khiển; toàn bộ art không thành mesh deformable |
| Kiếm | Grip wrist, back mount, rod, collider đoạn, CCD, thả khi chết | Kiểm mọi hướng/grip; painted alpha silhouette không phải collider chính xác |
| Cánh | Root/props động; collider cạnh ngoài tip–top | Cánh phẳng/cứng; chưa màng biến dạng, aerodynamic lift hoặc collision toàn màng |
| Ragdoll | Xung quay, floor contact, motor/grip release, hạn chế co endpoint | Chưa full joint angle/twist và body self collision; silhouette East/West còn bị nén |
| Gameplay | Adapter render theo actor và world origin | Chưa terrain mesh/actor–actor physics; movement/damage gameplay chưa chuyển sang solver |
| CCD | Crossing fixture 12k/24k/60k cm/s đạt | Có giới hạn 48 vòng/tolerance; chưa chứng minh hết grazing/rotation/overlap/mesh |
| Hiệu năng | Có benchmark toàn scene | Headless SwiftShader p95 khoảng 29,4 ms với 1 Magic; 114,5 ms với 8 Magic; chưa đạt gate 60 FPS và chưa benchmark thiết bị thật |
| Art/animation | Có playback và stress sweep | Chưa full aesthetic/mix QA; contact dust physics cần audit; parity 3 pixel CP12 vẫn là ghi chú mở riêng |

Không kết luận “vật lý thật hoàn chỉnh” chỉ vì vũ khí đung đưa hoặc sprite rơi. Chứng minh bằng A/B tắt/bật gravity, impulse, collision/CCD, release; đo contact, length error, finite position và phản ứng khi actor/map/gear thay đổi. Không chữa solver bằng ép position từ keyframe ở mọi bước.

Ưu tiên performance: profile full scene → allocation/readback/cache/outline/batching → LOD hoặc phạm vi actor được simulate → đo lại. Không thêm `ctx.filter`/shadowBlur vào vòng draw. LOD phải giữ hành vi gameplay nhất quán; không tự làm client và server quyết định damage khác nhau.

## 8. QA và tiêu chí nghiệm thu

Bắt buộc có contact sheet và playback realtime, không chỉ screenshot một frame.

- 8 hướng × 14 state; thêm 7 ground attack variants. Thử không cánh/DW1/Magic2. Với attack kiểm cả anticipation, impact và recovery.
- Bảy armor, bảy weapons và +0/+9/+10/+11. Thử vài mix từng ô, unequip, weapon hand swap và đổi gear giữa clip. Ghi rõ coverage, không gọi sampling là full Cartesian.
- Town: chân không bay/trượt, cánh theo thân, crossed weapons không xuyên torso. Ground: contact/balance/stance. Air: lean khi di chuyển, wing flap chậm, hai tay cầm đúng.
- Hit/death: lưng cong phản ứng rõ, chân chạm sàn/ngã, silhouette đọc được ở East/West, weapons release và giữ world position sau drop.
- Occlusion: không nhân đôi cánh/vũ khí, hilt được glove che đúng, layer phía xa không đè torso sai. Không mép trắng, hở khớp hoặc cutout nén quá mức.
- Chạy qua map transition/teleport/new actor/gear change/death respawn. Reset physics đúng lúc, không tích luỹ state từ actor cũ.
- Console/network: 0 page error; loader runtime không có missing dependency; tách intentional fallback 404 của legacy khỏi ảnh native thực sự lỗi.
- Physics: finite values, sai số constraints/contact được báo với đơn vị và phạm vi; 30/60/144 FPS, fast crossings, resting/death settle, no-wing và wing modes.
- Default-off regression: giữ ảnh/logic các lớp khác. 10 ảnh parity checkpoint trước đạt chỉ chứng minh 10 ca đó, không chứng minh mọi state.
- Thiết bị: desktop/mobile mục tiêu, viewport/game scene/FX/network load xác định; báo median/p95 frame time. Nếu mục tiêu 60 FPS thì dùng ngân sách 16,7 ms và không tuyên bố đạt khi p95 còn vượt.

### Xử lý 19 bài lỗi cũ

Đọc raw results và baseline/retry trong summary.json trước. Đừng xoá test hoặc nới threshold để làm xanh.

- 15 bài cũng lỗi trên main: `bandonho`, `huongnhin`, `khungchay`, `kubanner`, `vklop`, `giapicon`, `khoihinh`, `lopdo`, `demodo`, `titlefx`, `baycanh`, `gearlook`, `herosprite`, `plusglow`, `vkbo` (tên file có tiền tố `test_` và hậu tố `.js`). Nhiều bài liên quan art legacy hoặc yêu cầu đã thay; đối chiếu yêu cầu hiện tại rồi sửa code/test phù hợp có bằng chứng.
- `test_bophan.js`, `test_geartier.js`, `test_sandat.js`: đạt khi chạy lại riêng. Làm fixture/seed ổn định và kiểm hành vi; không cho qua vô điều kiện.
- `test_canbanglop.js`: baseline từng đạt, candidate vẫn lỗi trong lượt retry; nguồn gốc còn chưa phân loại dứt điểm. Cần đối chứng nhiều lượt cùng seed/scene và đọc ghi chú noise trong CLAUDE.md. Không kết luận là lỗi mới hoặc chỉ là noise trước khi đo.
- `test_baycanh.js` lượt đầu còn lỗi thiếu browser executable; sau sửa hạ tầng, assertion vẫn lỗi trên cả main và candidate. Phải phân biệt hai nguyên nhân.

Bộ full hiện có 250 bài; đếm lại khi checkout mới hơn, không dùng số test cũ trong comment như sự thật hiện tại.

## 9. Chia phiên để không mất tiến độ

| Checkpoint | Đầu ra cần lưu trước khi dừng |
|---|---|
| 15-A: kiểm kê | Base SHA, current main, file/hash/dependency audit, reference đã lấy được, danh sách stale metadata |
| 15-B: art | Source và compiled đồng bộ, contact sheet/GIF 8 hướng, danh sách layer sửa, seam/halo/occlusion QA |
| 15-C: integration | Town/ground/air, gear/skills/socket mapping; reset và default-off QA trong game |
| 15-D: physics/performance | Collider/limits hoặc tối ưu có A/B; full scene median/p95; các giới hạn chưa xử lý |
| 15-E: release gates | Lint/check/unit/build/syntax và full regression; raw logs, baseline, seed, exit code, remaining blockers |
| 15-F: publish/deploy | GitHub SHA xác minh, manifest mới, trạng thái main, HTTP/smoke evidence và báo cáo cuối |

Sau mỗi checkpoint: commit phần đã xong vào nhánh bàn giao, lưu báo cáo ngắn `CHECKPOINT_15_<mốc>.md` với completed/remaining/blockers, đường dẫn QA và lệnh tiếp tục. Không ghi “xong” cho tác vụ đang chạy nền. Chạy sweep theo từng nhóm và ghi kết quả sau từng nhóm; không gom mọi thứ vào một phiên không có checkpoint.

## 10. Gate, push và deploy

### 10.1 Gate trên cây file cuối cùng

```bash
npm run lint
npm run check
npm test
npm run build
node --check public/game/game.js
node --check public/game/magic-rebuild.js
node --check public/game/magic-physics.js
node --check public/game/magic-physics-rig.js
bash tools/reg.sh /tmp/magic-checkpoint15-reg
```

Cài browser/dependencies đúng môi trường. `tools/reg.sh` đóng băng snapshot và xử lý cổng; dùng nó thay các server/port cứng trong từng test. Có thể shard khi phù hợp tài nguyên, nhưng phải đủ mọi bài, không trùng hoặc bỏ sót; không sửa file snapshot trong lượt chạy. Lưu mã thoát thực và mọi lần retry. Không chạy benchmark tranh tài nguyên với regression.

Khi sửa art/runtime, cập nhật manifest và chạy lại gate bị ảnh hưởng. Nâng từ opt-in trial sang default physics là thay đổi release riêng, chỉ làm khi aesthetic/collision/performance và device QA đã đạt; nếu vẫn mở thì giữ opt-in và ghi rõ.

### 10.2 Push checkpoint lên GitHub

Chọn chính xác file đã sửa, xem staged diff trước; không commit node_modules, temp screenshots, credential hoặc toàn bộ archive vào runtime một cách vô ý.

```bash
git status --short
git diff --stat
git add -p
# File mới: dùng git add -- đường-dẫn-file-thực sau khi xem nội dung.
git diff --cached --stat
git commit -m "Magic checkpoint 15: describe completed change and QA"
git push origin HEAD:codex/magic-native-checkpoint14-20261002
```

Đây là push nhánh checkpoint, chưa phải deploy. Nếu có merge main mới, giữ thay đổi cả hai bên, QA lại conflict, không force push. 33 PNG native hiện dùng ordinary Git blob với override `.gitattributes` theo từng path; không đổi thành wildcard vô tình ảnh hưởng flat archive. Nếu đưa thêm file LFS: bảo đảm object thật được upload và `git lfs fsck` đạt. Connector tạo tree/blob không tự upload LFS.

Nếu CLI Git không có quyền nhưng connector có quyền: dùng connector tạo blob/tree/commit và cập nhật ref không force; xác minh hash/parent/tree. Không tạo pointer thiếu object hoặc báo đã push vì chỉ tạo commit local. Nếu cả hai không có quyền, lưu checkpoint local và nêu đúng lỗi quyền truy cập.

### 10.3 Main = production

Repo không dùng Vercel cho game này. Cron VPS kéo main khoảng mỗi 2 phút; không có bước publish riêng sau main. Giữ cấu hình VPS/đường dẫn di sản.

Chỉ sau gate đạt, main chưa diverge và nhánh là hậu duệ main mới nhất:

```bash
git fetch origin main
git merge-base --is-ancestor origin/main HEAD
# Chỉ khi lệnh trên thành công và mọi gate của cây cuối cùng đã đạt:
git push origin HEAD:main
```

Nếu ancestry check hoặc push bị từ chối: fetch/merge main mới, đọc conflict, chạy lại gate cần thiết và thử lại; không `--force`. Không hỏi lại quyền push/deploy đã được người dùng yêu cầu, nhưng cũng không bỏ gate chỉ vì được yêu cầu deploy.

### 10.4 Kiểm tra sau push main

- Xác minh SHA origin/main đúng commit định deploy; kiểm CI/status nếu có.
- Sau một chu kỳ cron, kiểm HTTP production `http://14.225.204.107/`, file JS/manifest/ảnh mới và smoke test mặc định + URL opt-in. HTTP 200 ở trang chủ đơn lẻ không chứng minh version mới đã lên.
- Nếu HTTP/SSH bị chặn trong môi trường Claude, ghi “đã push main, chưa xác minh live”; không báo đã deploy thành công. Phiên trước HTTP truy cập được nhưng quyền SSH chưa có bằng chứng; kiểm năng lực phiên hiện tại thay vì sao chép giả định.
- Nếu cron không cập nhật, người vận hành VPS kiểm `/var/log/axiewuxia-deploy.log`, HEAD tại `/var/www/axiewuxia` và script `deploy/sua_deploy.sh`. Chỉ dùng script repair khi xác nhận cron hỏng; nó có thao tác reset/config, cần đọc trước và bảo vệ thay đổi tay trên VPS.
- Rollback nếu có hồi quy production: tạo revert commit, chạy gate phù hợp và push main. Không reset/force main về SHA cũ.

## 11. Báo cáo cuối phải trả cho người dùng

1. Link nhánh/commit GitHub, danh sách file/art sửa và source hashes.
2. GIF/contact sheet chứng minh 8 hướng, town, ground/air attacks, mix gear và hit/death.
3. Coverage QA, mã thoát gate, raw logs, benchmark môi trường thật và giới hạn phép đo.
4. Gói native hay full flat archive; mask/socket/physics nào thực sự có, nào còn thiếu.
5. Physics mặc định bật hay opt-in, productionReady true/false kèm căn cứ.
6. Đã push checkpoint / đã push main / đã xác minh live — ghi riêng từng trạng thái.
7. Những việc còn lại, checkpoint tiếp tục và cách phục hồi khi phiên bị ngắt.
