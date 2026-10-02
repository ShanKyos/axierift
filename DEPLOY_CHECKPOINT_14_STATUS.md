# Checkpoint 14 — Push và kiểm tra deploy

**Đã push gói native lên GitHub. Chưa cập nhật main, chưa deploy production.**

- Repository: https://github.com/ShanKyos/axierift
- Nhánh: `codex/magic-native-checkpoint14-20261002`
- Commit runtime đã ghép: `f9c891b87436231f3cdf33b989b58014b2850c06`
- Tree runtime: `c80bde219a6845e8d53e03c5184849f358c67acc`
- Main dùng làm đối chứng: `6d11da07d4cdb90bc546892f3bfb47438c41d2ec`.
- Nguồn checkpoint 14 đầy đủ: commit local `cc406ab9b8e0112b4171816db2da78707b20f6b9`.

## Gói đã push chứa gì?

46 file thuộc gói native, khoảng 32,5 MB: rig, manifest compiled, body/armor parts, concealed masters, source art, weapons, hai loại wing, joint underpaint, VFX, renderer, physics kernel, physics adapter, trang preview, tích hợp game và báo cáo checkpoint 14. Có 33 PNG thật được lưu bằng Git blob; không có LFS object mới bị thiếu.

Đã ghép trên main hiện tại, giữ 12 commit mới của game, giải quyết 6 xung đột trong game.js. Đã xác minh tree GitHub khớp tree local. Manifest của gói kiểm tra đủ 45 file; bản thân manifest không tự liệt kê hash của nó.

**Đây là gói native dùng cho runtime. Bộ flat atlas và toàn bộ archive authoring chưa được push trong lần này.** Bộ checkpoint 11 cùng các delta 12/13/14 vẫn là các deliverable riêng. Một số mục export không dùng trong compiled.json có thể tham chiếu file thuộc archive; runtime loader không gọi chúng.

## Cách chạy bản thử

Sau khi checkout nhánh và phục vụ thư mục `public/game`:

- Trang game: `index.html?test=1&magicRebuild=1&magicPhysics=1`.
- Preview physics riêng: `magic_physics.html`.
- URL mặc định: cả `magicRebuild` và `magicPhysics` đều tắt. Renderer hiện tại vẫn được sử dụng.

`productionReady` của physics vẫn **false**. Performance trên thiết bị thật, va chạm toàn màng cánh, self collision, terrain/interactor physics và nghiệm thu thẩm mỹ toàn bộ chưa được chứng nhận đạt. Push mã/assets không đồng nghĩa các hạng mục này đã hoàn thiện.

## Kết quả kiểm tra

| Kiểm tra | Kết quả |
|---|---|
| ESLint | Đạt, 0 lỗi; 1 warning eslint-disable có sẵn trong test_remove4.js |
| TypeScript | Đạt |
| Unit | 7/7 đạt |
| Production build | Đạt |
| Native physics | 240/240 khung có tọa độ hữu hạn, 0 page error; các ca đánh/chạy có mô phỏng động |
| Mặc định so với main | 10/10 ảnh khớp từng pixel: 5 lớp × trong/ngoài thành; 0 page error |
| Full game regression | **231/250 đạt; 19 lỗi ở lượt đầu** |

Full regression chạy đủ 4 shard trên snapshot đóng băng. Runtime trong snapshot khớp runtime của commit đã push; snapshot ghi commit local `bcbfbe0`, trước lần cập nhật metadata manifest. Browser dùng Chromium có sẵn trong môi trường, không phải bằng chứng kiểm tra thiết bị người chơi. Một bài ban đầu thiếu headless-shell executable; đã sửa đường dẫn môi trường và chạy lại để phân biệt lỗi môi trường với lỗi assertion.

15 bài lỗi cũng tái hiện trên main đối chứng. Ba bài đạt khi chạy lại riêng. Các lượt chạy lại và lỗi còn chưa phân loại được ghi chính xác trong `deploy/qa/checkpoint14/summary.json`; không đổi assertion hay nới ngưỡng để làm xanh.

## Vì sao chưa deploy?

`CLAUDE.md`, mục Deploy, quy định: **“Hỏng thì sửa trước khi push, đừng push rồi sửa sau”**. Main là nguồn cron production kéo mỗi 2 phút. Bộ regression chưa đạt nên chưa di chuyển ref main.

HTTP production trả 200 khi kiểm tra, trang hiện tại có Content-Length 29232. Main vẫn ở commit đối chứng nêu trên. Chưa có bằng chứng production đã nhận runtime mới.

## Công việc còn chặn deploy

1. Đối chiếu yêu cầu hiện tại với 15 bài lỗi có sẵn trên main, đặc biệt art legacy không tải được, chọn hướng, các lớp giáp/vũ khí, banner và title. Sửa hành vi hoặc cập nhật test theo yêu cầu đã được xác nhận; không tự khôi phục nội dung cũ chỉ để qua test.
2. Xử lý kiểm tra cân bằng/sàn và các phép đo ngẫu nhiên còn chưa ổn định. Không kết luận tất cả là lỗi mới của assets hoặc tất cả là nhiễu.
3. Chạy lại những kiểm tra bị ảnh hưởng và hoàn tất gate regression trước main.
4. Kiểm tra main chưa thay đổi; cập nhật main bằng fast-forward, không force push.
5. Sau khi cron chạy, xác minh HTTP trả file/script/assets mới và chạy smoke test mặc định cùng URL physics thử nghiệm.

## Bằng chứng và checkpoint tiếp tục

`deploy/qa/checkpoint14/` chứa kết quả từng bài, 4 log shard, log của 19 bài lỗi, QA physics và phép so ảnh mặc định. Commit này chỉ lưu báo cáo và bằng chứng, không đổi runtime đã kiểm tra.

Phiên tiếp theo bắt đầu từ nhánh GitHub nêu trên. Không dùng nhánh native cũ làm base main và không đẩy toàn bộ snapshot LFS local lên main bằng force push.
