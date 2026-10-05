class_name NoiThat
## Trong nhà. Mỗi phòng là một lưới ô nhỏ: sàn gỗ (1..rong, 1..sau), tường ở mép SAU (hàng y=0,
## cột x=0), mép TRƯỚC để hở như cắt bổ cho người chơi nhìn vào. Bước lên thảm cửa là ra ngoài.
##
## do: [tên đồ (bộ do_vat), ô góc, xoay]   npc: [tên, ô, bộ sprite, vai, hướng nhìn 0-7]
## cua: ô thảm (lối ra) · vao: ô hiện ra khi bước vào · so: những ô tường có cửa sổ (hàng sau)

const NHA := {
	"lo_ren": {
		"ten": "Lò Rèn của Hald", "rong": 8, "sau": 6, "cua": Vector2i(3, 6), "vao": Vector2i(3, 5),
		"so": [3, 6],
		"do": [
			["lo_ren", Vector2i(2, 1), 0], ["gia_vk", Vector2i(5, 1), 0], ["gia_vk", Vector2i(7, 1), 0],
			["thung", Vector2i(8, 1), 0], ["hom", Vector2i(8, 2), 0], ["de_ren", Vector2i(3, 3), 0],
			["quay", Vector2i(5, 4), 0], ["hom", Vector2i(1, 4), 0],
		],
		"npc": [["Thợ Rèn Hald", Vector2i(6, 3), "npc_tho_ren", "tho_ren", 0]],
	},
	"quan_ruou": {
		"ten": "Quán Rượu Ấm Lò", "rong": 10, "sau": 7, "cua": Vector2i(5, 7), "vao": Vector2i(5, 6),
		"so": [6, 8],
		"do": [
			["ke_ruou", Vector2i(2, 1), 0], ["ke_ruou", Vector2i(3, 1), 0], ["ke_ruou", Vector2i(4, 1), 0],
			["thung", Vector2i(1, 1), 0], ["thung", Vector2i(1, 2), 0], ["thung", Vector2i(1, 3), 0],
			["quay", Vector2i(3, 3), 0],
			["ban", Vector2i(7, 3), 0], ["ghe", Vector2i(8, 3), 0], ["ghe", Vector2i(7, 2), 0],
			["ban", Vector2i(8, 5), 0], ["ghe", Vector2i(9, 5), 0], ["ghe", Vector2i(8, 6), 0],
			["hom", Vector2i(10, 1), 0],
		],
		"npc": [
			["Cô Rượu Mira", Vector2i(3, 2), "npc_co_gai", "ruou", 0],
			["Khách Say", Vector2i(6, 5), "npc_dan_b", "dan", 6],
		],
	},
	"thap_phap": {
		"ten": "Tháp Pháp Sư", "rong": 6, "sau": 6, "cua": Vector2i(3, 6), "vao": Vector2i(3, 5),
		"so": [5],
		"do": [
			["ke_sach", Vector2i(2, 1), 0], ["ke_sach", Vector2i(3, 1), 0], ["ke_sach", Vector2i(4, 1), 0],
			["ke_sach", Vector2i(1, 3), 1], ["cau_tinh", Vector2i(5, 2), 0], ["ban", Vector2i(2, 3), 0],
			["ruong", Vector2i(6, 1), 0],
		],
		"npc": [["Pháp Sư Ivo", Vector2i(3, 3), "npc_phap_su", "phap_su", 0]],
	},
	"kho": {
		"ten": "Kho Đồ Ardhaven", "rong": 7, "sau": 6, "cua": Vector2i(4, 6), "vao": Vector2i(4, 5),
		"so": [3],
		"do": [
			["ruong", Vector2i(1, 1), 0], ["ruong", Vector2i(2, 1), 0], ["ruong", Vector2i(4, 1), 0],
			["ruong", Vector2i(5, 1), 0], ["hom", Vector2i(7, 1), 0], ["hom", Vector2i(7, 2), 0],
			["thung", Vector2i(1, 3), 0], ["quay", Vector2i(3, 3), 0],
		],
		"npc": [["Thủ Kho Bram", Vector2i(4, 2), "npc_thu_kho", "thu_kho", 0]],
	},
}
