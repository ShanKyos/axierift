import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  congThanThiet,
  danhSachCuaToi,
  datQuanHe,
  loiMoiToiToi,
  quanHe,
  timNguoiChoi,
  xoaQuanHe,
} from "./queries/friends";

/** Mốc ngày theo UTC — cùng một chuỗi cho mọi múi giờ, nên không ai "chào" hai lần bằng cách đổi giờ máy. */
function ngayHomNay() {
  return new Date().toISOString().slice(0, 10);
}

const CHAO_THEM = 10; // Độ Thân Thiết mỗi lần chào, mỗi ngày một lần

export const friendRouter = createRouter({
  /** Tất cả những gì bảng Bạn Bè cần cho một lần mở: bạn · lời mời đi · lời mời tới · sổ đen. */
  list: authedQuery.query(async ({ ctx }) => {
    const [cuaToi, toiToi] = await Promise.all([
      danhSachCuaToi(ctx.user.id),
      loiMoiToiToi(ctx.user.id),
    ]);
    const ngay = ngayHomNay();
    return {
      ban: cuaToi
        .filter((r) => r.trangThai === "ban")
        .map((r) => ({ ...r, daChao: r.chaoNgay === ngay })),
      moiDaGui: cuaToi.filter((r) => r.trangThai === "cho"),
      moiToiToi: toiToi,
      soDen: cuaToi.filter((r) => r.trangThai === "chan"),
      ngay,
    };
  }),

  timNguoi: authedQuery
    .input(z.object({ tu: z.string().min(1).max(64) }))
    .query(async ({ ctx, input }) => timNguoiChoi(input.tu.trim(), ctx.user.id)),

  /**
   * Gửi lời mời. Nếu người kia ĐÃ mời mình trước thì đây là cái bắt tay — kết bạn luôn, không
   * bắt ai phải bấm thêm một nút nữa. Hai người cùng muốn là đủ; đòi thêm một nhịp xác nhận chỉ
   * tạo ra một lời mời treo mà cả hai đều tưởng mình đã làm xong phần của mình.
   */
  moi: authedQuery
    .input(z.object({ friendId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      if (input.friendId === ctx.user.id) return { ok: false as const, ly: "tu" as const };
      const hoChan = await quanHe(input.friendId, ctx.user.id);
      if (hoChan?.trangThai === "chan") return { ok: false as const, ly: "biChan" as const };
      const nguoc = await quanHe(input.friendId, ctx.user.id);
      if (nguoc?.trangThai === "cho") {
        await datQuanHe(ctx.user.id, input.friendId, "ban");
        await datQuanHe(input.friendId, ctx.user.id, "ban");
        return { ok: true as const, thanhBan: true as const };
      }
      await datQuanHe(ctx.user.id, input.friendId, "cho");
      return { ok: true as const, thanhBan: false as const };
    }),

  nhan: authedQuery
    .input(z.object({ friendId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const moi = await quanHe(input.friendId, ctx.user.id);
      if (!moi || moi.trangThai !== "cho") return { ok: false as const, ly: "khongCoLoiMoi" as const };
      await datQuanHe(input.friendId, ctx.user.id, "ban");
      await datQuanHe(ctx.user.id, input.friendId, "ban");
      return { ok: true as const };
    }),

  /** Từ chối / huỷ lời mời / xoá bạn — cùng một việc: gỡ quan hệ CẢ HAI CHIỀU. */
  xoa: authedQuery
    .input(z.object({ friendId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await xoaQuanHe(ctx.user.id, input.friendId);
      await xoaQuanHe(input.friendId, ctx.user.id);
      return { ok: true as const };
    }),

  /** Chặn: gỡ quan hệ hai chiều RỒI mới đặt hàng chặn của mình. Thứ tự ngược lại là tự xoá mất
   *  hàng chặn vừa tạo — lỗi im lặng, người dùng bấm Chặn mà không có gì xảy ra. */
  chan: authedQuery
    .input(z.object({ friendId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      if (input.friendId === ctx.user.id) return { ok: false as const };
      await xoaQuanHe(ctx.user.id, input.friendId);
      await xoaQuanHe(input.friendId, ctx.user.id);
      await datQuanHe(ctx.user.id, input.friendId, "chan");
      return { ok: true as const };
    }),

  boChan: authedQuery
    .input(z.object({ friendId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const r = await quanHe(ctx.user.id, input.friendId);
      if (!r || r.trangThai !== "chan") return { ok: false as const };
      await xoaQuanHe(ctx.user.id, input.friendId);
      return { ok: true as const };
    }),

  /** Chào bạn — mỗi ngày một lần, cộng Độ Thân Thiết cho cả hai. */
  chao: authedQuery
    .input(z.object({ friendId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const r = await quanHe(ctx.user.id, input.friendId);
      if (!r || r.trangThai !== "ban") return { ok: false as const, ly: "chuaLaBan" as const };
      const ngay = ngayHomNay();
      if (r.chaoNgay === ngay) return { ok: false as const, ly: "daChao" as const };
      await congThanThiet(ctx.user.id, input.friendId, CHAO_THEM, ngay);
      return { ok: true as const, them: CHAO_THEM };
    }),
});
