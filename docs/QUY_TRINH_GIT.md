# Quy trình Git · nhánh · phát hành

> Số đo trong tài liệu này lấy ngày **2026-09-23**. Đo lại bằng các lệnh ghi ở mục cuối —
> đừng trích chúng như sự thật vĩnh viễn.

## 📌 CHẨN ĐOÁN: chỉ có MỘT nguyên nhân gốc, không phải nhiều

Đo từ ba phía, cả ba ra cùng một chỗ:

| Đo cái gì | Con số | Nghĩa là |
|---|---|---|
| Cổng chặn giữa một commit và người chơi | **`tsc` · `eslint` · `vitest` · `node --check`** | không cổng nào đọc lối chơi |
| Bài kiểm thật sự gác lối chơi | **245 bài**, chạy **bằng tay** trong sandbox | không bao giờ chạy tự động |
| Thời gian từ `git push` tới máy người chơi | **≤ 2 phút** (cron `git reset --hard`) | không có bước duyệt nào chen vào |

⇒ **Không có cái gì đứng giữa một commit hỏng và người chơi.** Mọi thứ khác — 25 nhánh, 6 nhánh
không chung gốc, Vercel đỏ, kho 408 MB — đều là triệu chứng của việc chưa bao giờ phải dựng một
quy trình, vì chưa bao giờ có chỗ nào *bắt buộc* phải đi qua.

## Hình dạng: `main` là NƠI LÀM, `release` là THỨ NGƯỜI CHƠI CHẠM

```
feat/… fix/… art/…  ──PR──▶  main  ──promote──▶  release  ──cron 2 phút──▶  VPS
   nhánh ngắn                tích hợp            đang phát hành
                             luôn xanh           có thể lùi lại
```

**Và đây là điểm mấu chốt, không phải chi tiết:** tách `release` ra làm cho lối **push thẳng lên
`main` trở nên AN TOÀN trở lại**. Nhịp làm việc của dự án này là 60-90 commit/ngày (đo được:
93 commit ngày 14/09) — bắt mỗi commit qua một PR là giết đúng cái nhịp đó. Nhưng hôm nay push
thẳng lại **là** phát hành, nên nhịp ấy đang được trả bằng rủi ro của người chơi.

Đổi một dòng trên VPS thì `main` thành chỗ làm việc thật sự, và **chỉ `release` cần khoá.**

| Nhánh | Ai đẩy | Khoá | Là gì |
|---|---|---|---|
| `release` | **chỉ bằng promote** | ✅ bắt buộc CI xanh | thứ người chơi đang chạy |
| `main` | đẩy thẳng thoải mái | CI chạy nhưng không chặn | tích hợp |
| `feat/… fix/… art/… docs/…` | tự do | CI chạy khi mở PR | việc đang làm, **xoá sau khi gộp** |

Nhánh việc đặt tên theo **việc**, không theo tên ngẫu nhiên. Mười bốn nhánh `claude/<tính từ>-<tên
nhà khoa học>-<mã>` hiện có không nói cho ai biết chúng chứa gì — kể cả người tạo ra chúng.

## Phát hành

```bash
git -C <repo> fetch origin --quiet
git -C <repo> push origin origin/main:release        # promote: đưa main hiện tại ra người chơi
git -C <repo> tag -a v0.4.0 origin/main -m "…" && git -C <repo> push origin v0.4.0
```

Lùi lại khi hỏng — **đây là thứ hôm nay không có**:

```bash
git -C <repo> push origin v0.3.0:release --force-with-lease
```

Hai họ tag, **đừng trộn**:

| | Dùng cho | Ví dụ |
|---|---|---|
| `vX.Y.Z` | bản game đã phát hành | `v0.4.0` |
| `assets/<tên>-vN` | gói art tải rời, đi kèm **Release asset** | `magic-sprites-v1` |

## ⚠ Gói art nặng đi qua Release asset, KHÔNG commit vào kho

Đo được: gói git **408 MB**, và mười blob nặng nhất **đều là ảnh nguồn** —
`tools/iso/nguon/gem_icon_ui.png` 8,3 MB · `docs/Axie_Wuxia_Product_Proposal.docx` 6,0 MB ·
`gem_vuong.png` 5,0 MB · nhạc 4,6 MB. Chúng **không gỡ ra được nữa**: viết lại lịch sử thì bản
sao trên VPS (`git reset --hard` mỗi 2 phút) vỡ ngay.

⇒ Không chữa quá khứ, **chặn tương lai**: `ci.yml` từ chối PR thêm tệp > 5 MB. Release asset
chịu tới 2 GB và **không nằm trong lịch sử git** — đó là chỗ đúng cho gói art.

## Sáu nhánh KHÔNG CHUNG GỐC với `main`

`claude/capnhat-tailieu` · `claude/thiet-ke-online` · `claude/tach-killmob` · `claude/pc-only` ·
`demo-axie-showcase` · `backup-before-stage-combat`

`git merge-base` trả rỗng cho cả sáu — chúng là di sản **đời game kiếm hiệp**, trước khi chuyển
sang MU. Con số "cách main 200+ commit" của chúng **không mang nghĩa gì**: với hai lịch sử rời
nhau thì `rev-list --left-right` luôn ra số to ở cả hai phía.

⚠ **Đừng gộp chúng.** `git merge` từ chối thẳng (`refusing to merge unrelated histories`), và ép
gộp là kéo cả một game khác vào.

## Đo lại

```bash
git branch -r --format='%(refname:short)' | grep -v HEAD | while read b; do
  printf "%-56s truoc:%-4s sau:%s\n" "$b" \
    "$(git rev-list --count origin/main..$b)" "$(git rev-list --count $b..origin/main)"; done
git count-objects -vH | grep size-pack
```

Nhánh có `truoc:0` là **đã gộp hết vào main** ⇒ xoá được, không mất gì.
