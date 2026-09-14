import { and, eq, like, ne, or, sql } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./connection";

/** Một hàng bạn bè kèm hồ sơ người kia — cái mà bảng Bạn Bè cần để vẽ một dòng. */
const HO_SO = {
  userId: schema.friends.friendId,
  ten: schema.users.name,
  avatar: schema.users.avatar,
  trangThai: schema.friends.trangThai,
  thanThiet: schema.friends.thanThiet,
  chaoNgay: schema.friends.chaoNgay,
  lop: schema.leaderboard.sect,
  cap: schema.leaderboard.level,
  hoatDong: schema.users.lastSignInAt,
};

function _nguoiKia() {
  return getDb()
    .select(HO_SO)
    .from(schema.friends)
    .leftJoin(schema.users, eq(schema.friends.friendId, schema.users.id))
    .leftJoin(schema.leaderboard, eq(schema.friends.friendId, schema.leaderboard.userId));
}

/** Mọi hàng TÔI tạo ra: bạn · lời mời tôi gửi · người tôi chặn. */
export async function danhSachCuaToi(userId: number) {
  return _nguoiKia().where(eq(schema.friends.userId, userId));
}

/**
 * Lời mời người khác gửi TỚI tôi.
 * ⚠ Phải lọc bỏ người mà TÔI đã chặn — nếu không, chặn xong vẫn bị họ gửi lời mời vào mặt,
 * tức là cái nút Chặn không chặn được gì.
 */
export async function loiMoiToiToi(userId: number) {
  const chan = await getDb()
    .select({ id: schema.friends.friendId })
    .from(schema.friends)
    .where(and(eq(schema.friends.userId, userId), eq(schema.friends.trangThai, "chan")));
  const boQua = new Set(chan.map((r) => r.id));
  const rows = await getDb()
    .select({
      userId: schema.friends.userId,
      ten: schema.users.name,
      avatar: schema.users.avatar,
      lop: schema.leaderboard.sect,
      cap: schema.leaderboard.level,
    })
    .from(schema.friends)
    .leftJoin(schema.users, eq(schema.friends.userId, schema.users.id))
    .leftJoin(schema.leaderboard, eq(schema.friends.userId, schema.leaderboard.userId))
    .where(and(eq(schema.friends.friendId, userId), eq(schema.friends.trangThai, "cho")));
  return rows.filter((r) => !boQua.has(r.userId));
}

export async function datQuanHe(
  userId: number,
  friendId: number,
  trangThai: "cho" | "ban" | "chan",
) {
  await getDb()
    .insert(schema.friends)
    .values({ userId, friendId, trangThai })
    .onDuplicateKeyUpdate({ set: { trangThai, updatedAt: new Date() } });
}

export async function xoaQuanHe(userId: number, friendId: number) {
  await getDb()
    .delete(schema.friends)
    .where(and(eq(schema.friends.userId, userId), eq(schema.friends.friendId, friendId)));
}

export async function quanHe(userId: number, friendId: number) {
  const rows = await getDb()
    .select()
    .from(schema.friends)
    .where(and(eq(schema.friends.userId, userId), eq(schema.friends.friendId, friendId)))
    .limit(1);
  return rows.at(0);
}

/** Cộng Độ Thân Thiết cho CẢ HAI chiều — thân thiết là thứ của một cặp, không của một người. */
export async function congThanThiet(a: number, b: number, them: number, ngay: string) {
  await getDb()
    .update(schema.friends)
    .set({ thanThiet: sql`${schema.friends.thanThiet} + ${them}`, chaoNgay: ngay })
    .where(and(eq(schema.friends.userId, a), eq(schema.friends.friendId, b)));
  await getDb()
    .update(schema.friends)
    .set({ thanThiet: sql`${schema.friends.thanThiet} + ${them}` })
    .where(and(eq(schema.friends.userId, b), eq(schema.friends.friendId, a)));
}

/** Tìm người chơi theo tên — chỉ trả người ĐÃ CÓ trong bảng xếp hạng, tức đã thật sự chơi. */
export async function timNguoiChoi(tu: string, boQuaId: number, limit = 20) {
  return getDb()
    .select({
      userId: schema.users.id,
      ten: schema.users.name,
      avatar: schema.users.avatar,
      lop: schema.leaderboard.sect,
      cap: schema.leaderboard.level,
    })
    .from(schema.users)
    .innerJoin(schema.leaderboard, eq(schema.users.id, schema.leaderboard.userId))
    .where(and(like(schema.users.name, `%${tu}%`), ne(schema.users.id, boQuaId)))
    .limit(limit);
}

export { or };
