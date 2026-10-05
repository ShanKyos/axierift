class_name NpcDuLieu
## Lời thoại và việc của từng VAI NPC. Dữ liệu thuần: sửa lời / đổi hàng bán ở đây.
##
## nut: "mua" (mở tiệm `hang`) · "kho" (mở kho đồ) · "" (chỉ nói chuyện).

const VAI := {
	"tho_ren": {
		"nut": "mua", "tieu_de": "Lò Rèn",
		"hang": ["kiem_ngan", "kiem_dai", "dai_kiem", "giap_da", "giap_xich", "giap_tam"],
		"loi": [
			"Thép Vaeldra không nói dối. Muốn chém xa hơn thì cầm lưỡi dài hơn.",
			"Bọ Giáp ngoài cổng có vỏ cứng. Kiếm cùn thì đừng ra đó.",
			"Mỗi nhát búa là một lần khắc. Đồ của ta không gãy giữa trận.",
		],
	},
	"ruou": {
		"nut": "mua", "tieu_de": "Quán Rượu",
		"hang": ["binh_mau_nho", "binh_mau", "binh_mana_nho", "binh_mana"],
		"loi": [
			"Ngồi đi, lữ khách. Rượu ấm, thuốc đủ — ra đồng mà thiếu bình máu là về nằm.",
			"Bấm Q uống máu, W uống mana. Người nào cũng quên, rồi người nào cũng tiếc.",
			"Đêm qua lính gác cổng tây kể thấy bọ đen gần bờ sông.",
		],
	},
	"phap_su": {
		"nut": "mua", "tieu_de": "Tháp Pháp Sư",
		"hang": ["sach_chem_xoay", "binh_mana_nho", "binh_mana"],
		"loi": [
			"Sức mạnh nằm trong mana, không nằm trong cánh tay. Hiệp sĩ cũng học được điều đó.",
			"Cuốn này dạy Chém Xoáy — một vòng thép quanh mình. Chuột phải để tung.",
			"Đừng đứng gần quả cầu. Nó nhìn lại.",
		],
	},
	"thu_kho": {
		"nut": "kho", "tieu_de": "Kho Đồ",
		"loi": [
			"Gửi gì thì ta giữ nấy. Túi chật thì để lại đây, đi đâu cũng lấy lại được.",
			"Lumen gửi ở kho không rơi khi ngươi gục ngoài đồng.",
		],
	},
	"linh_gac": {
		"nut": "",
		"loi": [
			"Trong tường thành là an toàn. Ra khỏi cổng thì tự lo.",
			"Càng xa thành, bọ càng dữ. Vòng đầu cho tân binh, vòng ngoài cho kẻ liều.",
		],
	},
	"dan": {
		"nut": "",
		"loi": [
			"Chợ hôm nay đông quá.",
			"Nghe nói tháp pháp sư sáng đèn suốt đêm.",
			"Con bọ to bằng cái thùng! Thề đấy.",
			"Giếng này nước ngọt nhất Ardhaven.",
			"Mua bình máu ở quán rượu ấy, rẻ hơn ngoài chợ.",
		],
	},
}
