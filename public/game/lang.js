/* ═══ Axie Rift legacy translator — covers content not yet migrated to i18n.js's t() ═══
   Loaded AFTER i18n.js, BEFORE game.js. Patches canvas text + observes DOM.
   Lang stored in localStorage 'vlcm_lang', SHARED with i18n.js so both stay in sync on one
   toggle. Axie Rift is English-first (default flipped from the old prototype's 'vi'
   default) — un-migrated Vietnamese source text still gets translated to English by this
   regex/dictionary layer exactly as before; t()-driven content bypasses this entirely since
   its output is already correct for the locale. See docs/I18N_MIGRATION_GUIDE.md. */
(function () {
'use strict';
const KEY = 'vlcm_lang';
// Tên hệ trong chuỗi động — dùng lại đúng bảng dịch bên dưới thay vì chép tay lần nữa.
function m1El(e){ return ({ 'Kim':'Metal','Mộc':'Wood','Thủy':'Water','Hỏa':'Fire','Thổ':'Earth' })[e] || e; }
// Phải TRÙNG mặc định với i18n.js — hai lớp dùng chung khoá 'vlcm_lang', lệch nhau là giao diện
// lẫn hai thứ tiếng ngay từ lần mở đầu tiên.
let lang = 'vi';
try { lang = localStorage.getItem(KEY) || 'vi'; } catch (e) {}
// ?lang=en / ?lang=vi thắng localStorage — bản sao CỐ Ý của đoạn trong i18n.js. Hai lớp phải tự
// đọc lấy, không lớp nào đọc ké lớp kia: chúng dùng chung khoá 'vlcm_lang' nên chỉ cần một lớp
// lỡ nhịp là giao diện lẫn hai thứ tiếng, và đó là kiểu hỏng không ném lỗi nào.
try {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'en' || q === 'vi') {
    lang = q;
    try { localStorage.setItem(KEY, q); } catch (e) {}
  }
} catch (e) {}

/* ---- term swaps: applied ONLY inside rule-captured fragments ---- */
const TERMS = [
  ['sát thương gánh chịu','damage taken'],['sát thương thiên lôi','lightning damage'],['Sát Thương','Damage'],['sát thương','damage'],
  ['kinh nghiệm','EXP'],['Kinh Nghiệm','EXP'],
  ['phòng ngự','defense'],['Phòng Ngự','Defense'],['phòng thủ','defense'],['Phòng Thủ','Defense'],
  ['tốc độ đánh','attack speed'],['Tốc Độ Đánh','Attack Speed'],['tốc đánh','attack speed'],
  ['Né Tránh','Dodge'],['né tránh','dodge'],[' né',' dodge'],
  ['Bạo Kích','Crit'],['bạo kích','crit'],['bạo','crit'],
  ['bạc rơi','silver drops'],['đồng rơi','coin drops'],['đồng','coins'],
  ['Sinh Lực Tối Đa','Max HP'],['Sinh Lực','HP'],['sinh lực','HP'],
  ['Sức Mạnh','Strength'],['Nhanh Nhẹn','Agility'],['Thể Lực','Vitality'],['Năng Lượng','Energy'],
  ['Mana Tối Đa','Max Mana'],['Mana','Mana'],['mana','mana'],
  ['Mana','Mana'],
  ['tốc chạy','move speed'],['Tốc Chạy','Move Speed'],
  ['hút sinh lực','life steal'],['hút mana','mana steal'],['hút','drain'],
  ['mỗi giây','per second'],['tỉ lệ thành công','success rate'],['tỉ lệ','rate'],['thành công','success'],
  ['hồi chiêu','cooldown'],['kháng độc','poison resist'],['kịch độc','deadly poison'],['độc','poison'],
  ['choáng','stun'],['chảy máu','bleed'],['làm chậm','slow'],['chậm','slow'],
  ['xuyên giáp','armor pierce'],['xuyên thấu','pierce'],['khóa chiêu','lock skills'],
  ['hồi phục','regen'],['hồi','regen'],['máu','HP'],['chiêu thức','skills'],['chiêu','skills'],
  ['địch thủ','foes'],['địch','enemies'],['quái','monsters'],['tối đa','max'],['giây','s'],
  ['công lực','power'],['công','ATK'],['thể lực','stamina'],['trúng','hit'],['trượt','miss'],
  ['miễn phí','free'],['khiên','shield'],['hấp thụ','absorb'],['phản','reflect'],
  ['thuộc tính','attributes'],['bậc','tier'],['cấp độ','level'],['cấp','Lv'],
  ['bạc','silver'],['vàng','gold'],['người chơi','player'],
];
function trFrag(s) {
  let out = s;
  for (const [a, b] of TERMS) out = out.split(a).join(b);
  return out;
}

/* ---- EXACT dictionary: full-string VI -> EN ---- */
const EXACT = {

  /* ══ LỚP TỰ SỰ — NPC · nhiệm vụ · trùm · vật phẩm cốt truyện ═══════════════════════════
     Lớp lớp/chiêu/map đã Tây hoá từ đợt trước (Dark Knight · Werebear Woods · Poison Arrow),
     nhưng lớp KỂ CHUYỆN thì chưa: tên nhiệm vụ, tên trùm, vật phẩm lore và bốn map Corran
     vẫn ra tiếng Việt khi người chơi bật English.
     Bám đúng bộ danh từ riêng đã chốt — Corran · Gloam · Sapidae · Atia · Lunacia · Vaeldra
     — và giữ giọng MU S6: mộc, hơi cổ, không một chữ kiếm hiệp. "Tướng Quân" canh vùng dịch
     là Warden (người trấn giữ) chứ không phải General: chúng canh một nơi chốn, không chỉ
     huy quân đội. */

  // ── NPC trong thành ──
  'Trưởng Làng': 'Village Elder',
  // ⚠ KHÔNG dịch là 'Chaos Goblin' — đó là tên riêng con NPC của MU (Quy tắc số 2). Chữ
  // 'Chaos' thì giữ: game đã ship '● Hỗn Độn Châu' → '● Chaos Pearl' từ lâu.
  'Yêu Tinh Hỗn Độn · Lò Hỗn Độn': 'Goblin Smith · Chaos Forge',
  'Pháp Sư Rune · Quán Sách': 'Rune Scholar · Bookshop',
  'Nhà Giả Kim · Tiệm Thuốc': 'Alchemist · Apothecary',
  'Binh Khí Chủ · Vũ Khí Phường': 'Weaponmaster · Armoury',
  'Người Giữ Chuồng': 'Stablekeeper',
  'Quan Truy Nã': 'Bounty Officer',
  'Chủ Sảnh Cầu May': 'Keeper of the Fortune Hall',
  'Kẻ Trông Vách': 'Wallwatcher',
  'Lính Gác Cổng Bắc': 'North Gate Guard',
  'Lính Gác Cổng Nam': 'South Gate Guard',
  'Lính Gác Cổng Tây': 'West Gate Guard',
  'Lính Gác Cổng Đông': 'East Gate Guard',
  'Người Bán Rong': 'Pedlar',
  'Thợ Mộc': 'Carpenter',
  'Người Gánh Nước': 'Water Carrier',
  'Lũ Trẻ Chạy Quanh': 'Children at Play',
  'Lính Tuần Phố': 'Street Patrol',
  'Người Quét Phố': 'Street Sweeper',
  'Cô Hầu Bàn · Quán Trọ': 'Serving Girl · Inn',
  'Người Đưa Tin': 'Courier',
  'Bà Bán Hoa': 'Flower Seller',
  'Ông Lão Ngồi Ghế Đá': 'Old Man on the Stone Bench',
  'Người Luyện Chimera': 'Chimera Binder',
  'Thợ Nhuộm': 'Dyer',
  'Kẻ Hát Rong': 'Wandering Singer',
  'Thợ Rèn Lưu Vong': 'Exiled Smith',

  // ── NPC cốt truyện, thêm bằng NPCS.push() trong game.js (không nằm ở canbang.js) ──
  // Mấy cái này suýt lọt: bảng NPC nằm ở HAI chỗ. canbang.js khai 26 người trong thành, rồi
  // game.js push thêm 12 người cốt truyện rải các map. Rút tên mà chỉ đọc canbang là thiếu
  // đúng những người dẫn chuyện.
  'Trưởng Lão Rell': 'Elder Rell',
  'Trinh Sát Wren': 'Scout Wren',
  'Lão Tướng Brann': 'Old Warden Brann',
  'Dax, Kẻ Do Thám': 'Dax the Scout',
  'Sylas, Người Giữ Tổ': 'Sylas, Keeper of the Nest',
  'Liora, Ẩn Sĩ Bird Tribe Heights': 'Liora, Hermit of Bird Tribe Heights',
  'Người Gác Rừng Corran': 'Corran Forest Keeper',
  'Deep Ravine · Vực Thẳm': 'Deep Ravine · The Abyss',
  'East Ravine · Vực Thẳm': 'East Ravine · The Abyss',
  'North Ravine · Vực Thẳm': 'North Ravine · The Abyss',

  // ── Bốn map còn tiếng Việt ──
  'Lối Mòn Corran': 'Corran Trail',
  'Rẻo Rừng Corran': 'Corran Fringe',
  'Trũng Nứt Corran': 'Corran Rift Hollow',
  'Tầng Sâu': 'The Deep',

  // ── Nhiệm vụ chính tuyến, chương I-V ──
  'Ngọn Đèn Bên Giếng': 'The Lamp by the Well',
  'Ra Ngoài Cổng Tây': 'Out the West Gate',
  'Người Giữ Đèn': 'The Lampkeeper',
  'Dầu Cho Ngọn Đèn': 'Oil for the Lamp',
  'Thứ Ăn Hồn Kẹt': 'What Eats the Stranded Souls',
  'Thép Chịu Được Bóng': 'Steel That Holds Against Shadow',
  'Ngồi Ở Miếu Atia': 'Sitting at the Atia Shrine',
  'Đòn Của Riêng Ngươi': 'A Blow of Your Own',
  'Kẻ Canh Miếu': 'The Shrine Watcher',
  'Thủ Lĩnh Gloam': 'The Gloam Chieftain',
  'Tin Từ Trại Chăn': 'Word from the Herd Camp',
  'Kẻ Đi Trước': 'The One Who Went Ahead',
  'Dầu Cho Cả Vùng': 'Oil for the Whole Region',
  'Đàn Bị Dồn': 'The Driven Herd',
  'Lò Của Reptile': 'The Reptile Forge',
  'Thứ Sinh Ra Từ Vết Nứt': 'Born of the Rift',
  'Rừng Của Werebear': "The Werebear's Wood",
  'Đường Xuống Địa Đạo': 'The Way Down to the Tunnels',
  'Bẫy Bị Đọc Vị': 'The Trap, Read',
  'Tầng Dưới Cùng': 'The Lowest Floor',
  'Rune Trong Thép': 'The Rune in the Steel',
  'Kẻ Đào Ngược': 'The One Who Dug Upward',
  'Nhà Trên Ngọn Thông': 'Houses in the Pine Crowns',
  'Bài Hát Bị Cắt': 'The Song Cut Short',
  'Kẻ Săn Người Giữ Đèn': 'Hunter of Lampkeepers',
  'Đủ Sức Đi Tiếp': 'Strong Enough to Go On',
  'Đá Nóng Quanh Năm': 'Stone Hot All Year',
  'Mỏ Đã Tắt Lửa': 'The Mine Gone Cold',
  'Đếm Ngược Tới Đầm': 'Counting Down to the Marsh',
  'Đầm Của Dusk': "Dusk's Marsh",
  'Vòng Trong Cùng': 'The Innermost Ring',
  'Chỗ Hồn Quay Về': 'Where the Souls Return',

  // ── Trùm vùng ──
  'Chúa Heo Rừng': 'Boar Lord',
  'Chúa Bầy Gai Tím': 'Lord of the Violet Thorns',
  'Chấp Sự Gloam': 'Gloam Deacon',
  'Thủ Lĩnh Đoàn Gloam': 'Gloam Warband Chief',
  'Đầu Mục Gloam': 'Gloam Headman',
  'Gai Tím Độc Nhãn': 'One-Eyed Violet Thorn',
  'Đặc Vụ Gloam': 'Gloam Agent',
  'Ma Sói Sương Trắng': 'Whitemist Werewolf',
  'Kẻ Đổi Phe': 'The Turncoat',
  'Golem Gỗ Cổ Đại': 'Ancient Wood Golem',
  'Trưởng Lão Tha Hóa': 'The Corrupted Elder',
  'Chỉ Huy Vong Binh': 'Wraith Commander',
  'Kẻ An Táng Bóng Tối': 'Gravedigger of Shadows',
  'Chúa Tể Bất Tử': 'The Undying Lord',
  'Kẻ Lạc Lối Tuyệt Vọng': 'The Despairing Lost',
  'Cỏ Dại Băng Giá': 'Frostweed',
  'Xoáy Sương Nguyền': 'The Cursed Mistwhirl',
  'Kỵ Sĩ Trưởng Tro Tàn': 'Ashen Knight-Captain',
  'Cung Thủ Tinh Nhuệ Tro Tàn': 'Ashen Elite Archer',
  'Thống Lĩnh Tro Tàn': 'Ashen Overlord',
  'Tướng Quân Bão Tố': 'Storm Warden',
  'Huyết Sát Bão Tố': 'Storm Bloodreaver',
  'Tướng Quân Cửa Ải': 'Warden of the Pass',
  'Tướng Quân Werebear Woods': 'Warden of Werebear Woods',
  'Tướng Quân Bug Tribe Tunnels': 'Warden of Bug Tribe Tunnels',
  'Tướng Quân Bird Tribe Heights': 'Warden of Bird Tribe Heights',
  'Tướng Quân Reptile Sunstone Flats': 'Warden of Reptile Sunstone Flats',
  'Tướng Quân Dusk Marsh': 'Warden of Dusk Marsh',

  // ── Vật phẩm cốt truyện (đọc được trong Nhật Ký) ──
  'Nửa Quân Bài Gloam': 'Half a Gloam Token',
  'Bản Đồ Vẽ Sai': 'The Wrongly Drawn Map',
  'Tàn Quyển «Ngũ Trụ Ký»': 'Fragment · «Chronicle of the Five Pillars»',
  'Xương Chim Khắc Chữ': 'Inscribed Bird Bone',
  'Thư Mời Không Địa Chỉ': 'Invitation Without an Address',
  'Trang Nhật Ký Thủ Hộ': "Warden's Journal Page",
  'Di Thư Người Gác Rừng': "The Forest Keeper's Bequest",
  'Lệnh Điều Quân': 'Marching Orders',
  'Bích Họa Ngũ Trụ': 'Mural of the Five Pillars',
  'Lá Thư Chưa Kịp Gửi': 'The Letter Never Sent',
  'Bảng Tên Đội Tiên Phong': 'Vanguard Nameplate',
  'Bộ Giáp Đứng Nguyên': 'The Armour Still Standing',
  'Nhật Ký Viết Dở': 'The Unfinished Journal',
  'Huy Hiệu Gỡ Từ Xác': 'Badge Taken from a Body',
  'Bia Tự Khắc': 'The Self-Carved Stone',
  'Chỗ Trống Thứ Bảy': 'The Seventh Empty Place',
  'Quân Lệnh Cũ': 'An Old Marching Order',
  'Đá Khắc Lời Trăng Trối': 'Stone of Last Words',
  'Mật Lệnh Rách': 'A Torn Secret Order',
  'Thư Cuối Của Tướng Quân': "The Warden's Final Letter",
  // Brand & chapters
  'KẺ KHÉP VẾT NỨT': 'THE RIFTCLOSER',
  // Bốn mục môn phái kiếm hiệp đời đầu (Bạch Đà Sơn · Minh Giáo · Đoàn Thị · Đào Hoa) ĐÃ GỠ.
  // Đã đếm: bốn chuỗi nguồn đó không còn xuất hiện ở đâu người chơi nhìn thấy — canbang.js 0
  // lần, game.js chỉ còn 3 lần trong CHÚ THÍCH. Giữ lại thì chúng nằm im vô hại, nhưng chúng
  // mã hoá sẵn đúng thứ từ vựng mà Quy tắc 1 cấm, chờ ngày ai đó chép lại.
  // Elements
  'Kim': 'Metal', 'Mộc': 'Wood', 'Thủy': 'Water', 'Hỏa': 'Fire', 'Thổ': 'Earth',
  // Maps
  'An Toàn': 'Safe Zone', 'Phó Bản': 'Dungeon',
  // Quality & tiers
  'Phàm': 'Common', 'Tinh': 'Fine', 'Linh': 'Spirit', 'Thần': 'Divine', 'Chí Tôn': 'Supreme',
  'PHÀM': 'COMMON', 'HUYỀN': 'MYSTIC', 'THIÊN': 'CELESTIAL',
  'Hoàn Hảo': 'Flawless', 'ST Hoàn Hảo': 'Flawless DMG',
  'Nhập Môn': 'Novice', 'Hành Hiệp': 'Wayfarer', 'Phiêu Bạt': 'Drifter', 'Danh Môn': 'Renowned',
  'Tông Sư': 'Grandmaster', 'Tuyệt Thế': 'Peerless', 'Khai Sơn': 'Pathfinder', 'Chấn Phái': 'Pillars',
  'Tiêu Dao': 'Carefree', 'Thiên Nhân': 'Celestial Being',
  'Sơ Cấp': 'Basic', 'Trung Cấp': 'Intermediate', 'Cao Cấp': 'Advanced', 'Thần Cấp': 'Godly',
  'Thành Thạo': 'Proficient', 'Điêu Luyện': 'Skilled', 'Lão Luyện': 'Veteran',
  // Realms (NAMING_MAP.md §2: Đan Điền → Ascension; source strings are now English loanwords
  // dropped into Vietnamese grammar, so most bare terms need no EXACT entry — only the ones
  // still paired with a Vietnamese word (Cảnh/Trung Kỳ/Hậu Kỳ) need translating.
  'Molt': 'Molt', 'Radiant Core': 'Radiant Core', 'Starforged': 'Starforged',
  'Resonance Trung Kỳ': 'Resonance · Mid', 'Resonance Hậu Kỳ': 'Resonance · Late',
  'Thức Tỉnh': 'Awakened', '— ĐÃ THỨC TỈNH ✦': '— AWAKENED ✦', '— TỐI THƯỢNG': '— SUPREME',
  // Stats
  'Công Kích': 'Attack', 'Tấn Công': 'Attack', 'Sinh Lực': 'HP',
  'Phòng Ngự': 'Defense', 'Phòng Thủ': 'Defense', 'Tốc Độ Đánh': 'Atk Speed',
  'Né Tránh': 'Dodge', 'Tránh Đòn': 'Dodge', 'Bạo Kích': 'Crit', 'Bạo Kích %': 'Crit %',
  'Thân Pháp': 'Agility', 'Lực Lượng': 'Strength', 'Mẫn Tiệp': 'Dexterity',
  'Sức Mạnh': 'Strength', 'Nhanh Nhẹn': 'Agility', 'Thể Lực': 'Vitality', 'Năng Lượng': 'Energy',
  'Giảm Sát Thương': 'Damage Reduction', 'Phản Sát Thương': 'Reflect Damage',
  'Thêm Sát Thương': 'Bonus Damage', 'Hút Sinh Lực': 'Life Steal', 'Hút Mana': 'Mana Steal',
  'Đồng Rơi Thêm': 'Bonus Coin Drops', 'EXP Thêm': 'Bonus EXP', 'Toàn Thuộc Tính': 'All Attributes',
  'Sinh Lực Tối Đa': 'Max HP', 'Mana Tối Đa': 'Max Mana', 'Hồi Instinct': 'Instinct Regen',
  'Xuyên Giáp': 'Armor Pierce', 'Thần Lực': 'Divine Power', 'Thiên Nhãn': 'Heavenly Eye',
  // Slots
  'Vũ Khí': 'Weapon', 'Nón': 'Helm', 'Áo': 'Armor', 'Tay': 'Gloves', 'Quần': 'Pants',
  'Chân': 'Boots', 'Dây Chuyền': 'Amulet', 'Nhẫn 1': 'Ring 1', 'Nhẫn 2': 'Ring 2',
  'Vũ Khí 2': 'Weapon 2',
  'Binh Khí': 'Weapon', 'đang mặc': 'equipped', 'túi': 'bag',
  // 'Cánh' và 'Pet' từng thiếu, nên bảng Trang Bị hiện 10 nhãn tiếng Anh xen 2 nhãn tiếng Việt
  'Cánh': 'Wings', 'Pet': 'Pet', 'Thú Cưng': 'Pet', 'Chưa mặc giáp': 'No armor equipped',
  'Bấm để tháo · kéo từ Túi Đồ để mặc': 'Click to unequip · drag from Bag to equip',
  'Trang Bị': 'Equipment',
  // Materials & shop
  'Mảnh Trang Bị': 'Gear Shard', 'Đá Ấn Trụ': 'Pillar Seal Stone',
  'Mảnh Cổ Thần': 'Ancient God Shard', 'Huyền Thiết': 'Mystic Iron', 'Sách Kỹ Năng →': 'Tomes →',
  'Thảo Dược': 'Herb', 'Thảo Dược Quý': 'Rare Herb', 'Phong Linh Phù': 'Spirit-Seal Charm',
  'Thiên Mệnh Phù': 'Fate Charm', '☂ Thiên Mệnh Phù': '☂ Fate Charm',
  'Bình Thuốc Đỏ': 'Red Potion', '🧪 Bình Thuốc Đỏ': '🧪 Red Potion',
  '🍶 Rượu Hổ Cốt': '🍶 Tiger Bone Wine', '🍶 RƯỢU HỔ CỐT': '🍶 TIGER BONE WINE',
  '⚡ Bùa Chắn Sét': '⚡ Thunder Escape Charm', '⚡ BÙA CHẮN SÉT': '⚡ THUNDER ESCAPE',
  '✚ Trị Thương Toàn Phần': '✚ Full Heal', '🛏 Nghỉ Trọ': '🛏 Rest at Inn',
  'Đoạt Mệnh Phù': 'Life-Seizing Talisman', 'Tu La Tinh Thạch': 'Asura Crystal', 'Hỗn Nguyên Thạch': 'Chaos Stone',
  '◆ Tu La Tinh Thạch': '◆ Asura Crystal', '❖ Hỗn Nguyên Thạch': '❖ Chaos Stone',
  '◎ Chúc Phúc Châu': '◎ Blessing Pearl', '◉ Linh Hồn Châu': '◉ Soul Pearl',
  '❤ Sinh Mệnh Châu': '❤ Life Pearl', '● Hỗn Độn Châu': '● Chaos Pearl',
  '✦ Huyền Thiết ×5': '✦ Mystic Iron ×5', 'Huyền Thiết ×5': 'Mystic Iron ×5',
  '◈ Đan Ascension Trial': '◈ Ascension Trial Pill',
  '⚔ Rương Binh Khí': '⚔ Weapon Chest', '⚔ Rương Binh Khí Tinh Tuyển': '⚔ Elite Weapon Chest',
  '🛡 Rương Phòng Cụ': '🛡 Armor Chest', 'bảo hiểm rèn': 'forge insurance', 'rèn +1~+11': 'forge +1~+11',
  'Mua thành công!': 'Purchase successful!',
  // Panels & buttons
  'SỔ KỸ NĂNG': 'SKILL CODEX', '☯ DUNG HỢP THẦN CÔNG': '☯ DIVINE FUSION',
 'Dung Hợp': 'Fusion',
  '⚔ Bắt Đầu Hành Trình': '⚔ Begin the Journey', 'Tiếp ▸': 'Next ▸', 'Đã học': 'Learned',
  'Thông Tin': 'Info', 'Rèn Luyện': 'Forge', 'Tăng Cường +': 'Enhance +',
  'Trang bị đã tối ưu!': 'Gear fully optimized!', 'Kỹ năng đã đạt cấp tối đa (Lv 120)!': 'Skill maxed (Lv 120)!',
  'Hướng dẫn hoàn tất — chúc hành trình phi nước đại!': 'Tutorial complete — ride on, hero!',
  'Console playtest — gõ /help để xem lệnh, Esc để đóng.': 'Playtest console — type /help for commands, Esc to close.',
  '" — gõ /help': '" — type /help',
  // System messages & status
  'Nhiệm vụ hoàn thành!': 'Quest complete!', 'Túi đồ đã đầy!': 'Bag is full!',
  'Túi thuốc đã đầy (tối đa 5 lọ)!': 'Potion bag full (max 5)!', 'Không đủ Mana!': 'Not enough Mana!',
 'Vẫn khỏe mạnh — không cần thuốc!': 'Still healthy — no potion needed!',
  'Lỗi:': 'Error:', 'Lệnh lạ "': 'Unknown command "', 'Không có map "': 'No such map "',
  'Map này không có trấn thủ.': 'This map has no guardian.',
  'CHOÁNG!': 'STUNNED!', 'CHẢY MÁU!': 'BLEEDING!', 'CHẬM!': 'SLOWED!',
  'VÔ TƯỚNG — toàn bộ chiêu đã hồi!': 'FORMLESS — all skills refreshed!',
  '✦ SONG THỦ HỖ BÁC — chiêu không hồi!': '✦ DUAL AMBIDEXTERITY — skills cost no cooldown!',
  '⚡ Liên Trảm — miễn phí Mana!': '⚡ Chain Strike — free Mana!',
  'BẤT TỬ: BẬT': 'GODMODE: ON', 'BẤT TỬ: TẮT': 'GODMODE: OFF',
  'PK: BẬT': 'PK: ON', 'PK: Tắt': 'PK: OFF',
  'ĐÃ MỞ VÙNG MỚI': 'NEW REGION UNLOCKED',
 '⚔ PHỤC KÍCH!': '⚔ AMBUSH!', '⚔TRUY THÙ': '⚔ VENDETTA',
  'Thần Binh đã THỨC TỈNH — tối đa!': 'Divine Weapon AWAKENED — maxed!',
  // Mounts & stable
  'Xuất Chiến (V)': 'Summon (V)', 'Thu Hồi (V)': 'Recall (V)', 'Thú Cưỡi → tầng': 'Mount → tier',
  '→ tầng': '→ tier', 'Trại Chủ Mục Đồng': 'Stable Master', 'Trại Ngựa Ngoại Ô': 'Outskirts Stable',
  '(Nhận Emberhide Bull)': '(Claim Emberhide Bull)', 'thu phục thú tinh anh — bấm T': 'tame elite beasts — press T',
  // Relations & personality
  'Xa Lạ': 'Stranger', 'Quen Biết': 'Acquaintance', 'Hảo Hữu': 'Friend', 'Tri Kỷ': 'Confidant',
  'Chí Giao': 'Bosom Friend', 'Sinh Tử Chi Giao': 'Life-and-Death Bond',
  'Chính Trực': 'Righteous', 'Hào Sảng': 'Generous', 'Ngạo Mạn': 'Arrogant', 'Tà Mị': 'Wicked',
  'Âm Hiểm': 'Cunning', 'Ôn Hòa': 'Gentle', 'Si Tình': 'Devoted', 'Tham Lam': 'Greedy',
  'Trung Thành': 'Loyal', 'Túc Trí Đa Mưu': 'Resourceful',
  'ngay thẳng, trọng nghĩa khí': 'upright, values honor', 'cởi mở, thích kết giao bằng hữu': 'open, loves making friends',
  'đa tình, dễ rung động': 'romantic, easily moved', 'tham tài — quà càng quý càng trọng ngươi': 'greedy — the pricier the gift, the fonder',
  // Seasons & weather
  'Xuân': 'Spring', 'Hạ': 'Summer', 'Thu': 'Autumn', 'Đông': 'Winter',
  'Nắng đẹp': 'Clear skies', 'Nắng gắt': 'Scorching', 'Mưa phùn': 'Drizzle',
  'Mưa rào giông': 'Thunderstorm', 'Sương mù': 'Fog', 'Tuyết rơi': 'Snowfall',
  // Titles
  'Kẻ Diệt Trăm Quái': 'Slayer of a Hundred',
  'Kẻ Diệt Ngàn Quái': 'Slayer of a Thousand', 'Thợ Rèn Truyền Thuyết': 'Legendary Smith',
 'Bậc Thầy Resonance': 'Master of Resonance',
  'Tiêu diệt 100 quái': 'Slay 100 monsters', 'Tiêu diệt 1.000 quái': 'Slay 1,000 monsters',
  'Hoàn thành toàn bộ chính tuyến': 'Complete the entire main storyline',
 'Đỉnh cao mọi hệ thống': 'Pinnacle of all systems',
  // NPC roles
 'Trưởng Làng': 'Village Chief', 'Thợ Rèn': 'Blacksmith',
  'Dược Lão · Dược Phường': 'Herbalist · Pharmacy', 'Dược Sư': 'Apothecary', 'Dược Lão': 'Old Herbalist',
  'Thương Nhân · Chợ Đấu Giá': 'Merchant · Auction House', 'Thương Nhân': 'Merchant', 'Trà Quán Chủ': 'Teahouse Keeper',
  'Bổ Đầu · Truy Nã Lệnh': 'Constable · Bounties', 'Bổ Đầu': 'Constable',
  'Binh Khí Chủ · Vũ Khí Phường': 'Arms Dealer · Weapon Shop', 'Quản Gia · Nhà Riêng': 'Steward · Cave Estate',
  'Thần Toán Tử · Vạn Duyên Các': 'Diviner · Fate Pavilion', 'Biên Ải Vệ Binh': 'Border Guard',
  'Tân Binh Tập Luyện': 'Recruit Training', 'Thử Tài Tân Thủ': 'Trial of the Novice',
  // Misc UI
  'Cấp →': 'Lv →', 'Sách Kỹ Năng →': 'Tomes →', '(Tối đa)': '(Max)',
  'mạnh nhất vùng, cẩn thận!': 'strongest in the region — beware!', 'yếu nhất, hợp luyện công': 'weakest — good for practice',
  'cấp trung bình': 'mid-tier', 'mục tiêu trong': 'target within', 'người chơi': 'player',
  'an toàn tuyệt đối 100%': '100% safe', 'lửa': 'fire', 'máu': 'blood',
  'Dã Ngoại · PK': 'Wilds · PK', 'Huyết Chiến · Free PK': 'Bloodbath · Free PK',
  'PK tự do, không Tội Ác — giết thoải mái.': 'Free PK, no Sin — kill at will.',
  'Giết Du Hiệp không tăng Tội Ác': 'Killing Wanderers adds no Sin',
  'Đứng yên nào.': 'Hold still.', 'Đến lượt ngươi.': 'Your turn.', 'Lên! Giết!': 'Charge! Kill!',
  'Ở lại cùng ta!': 'Stay with me!', 'Trăng lên rồi.': 'The moon is up.',
  '"Thuốc bổ hay thuốc độc — khác nhau ở liều lượng thôi, khách quân ạ."': '"Tonic or poison — only the dosage differs, dear guest."',
  'Bạc không phải vạn năng, nhưng không bạc thì... ngươi hiểu mà.': "Silver isn't everything — but without it... you know.",
  '3 phút +12% công lực — men say bừng bừng sát khí!': '3 min +12% power — drunk with killing intent!',
  'Mỗi màn chơi 1 lần: chết hồi sinh tại chỗ 50% máu': 'Once per run: revive on the spot at 50% HP',
  'Bản đồ thu nhỏ hiện cả điểm Thảo Dược': 'Minimap also shows Herb spots',
  'Tấn Phẩm & Kế Thừa — rơi từ quái/tinh anh': 'Promotion & Inheritance — drops from monsters/elites',
  'Khảm trang bị, rèn +7 trở lên — hiếm có': 'Socket gear, forge +7 and above — rare',
  'Rèn +10/+11 — cực hiếm': 'Forge +10/+11 — extremely rare',
  'rèn +7 trở lên': 'forge +7 and above', 'rèn +10/+11': 'forge +10/+11',
  'Gói tiết kiệm — chỉ bán theo đợt': 'Budget bundle — sold in batches only',
  'dung hợp Huyết Ma Thôn Phệ': 'fuse into Blood Demon Devour',
  'Bình Thuốc Đỏ hồi 55% máu (thay 40%)': 'Red Potion heals 55% HP (instead of 40%)',
  'Rèn đồ +5% tỉ lệ thành công': 'Forge +5% success rate',
  'MAX MODE — mọi tính năng tối đa!': 'MAX MODE — everything maxed!',
  // Cheat help lines
  '/god — bật/tắt bất tử': '/god — toggle godmode',
  '/kill [bán kính=350] — hạ quái quanh mình': '/kill [radius=350] — slay nearby monsters',
  '/learn — học toàn bộ Sổ Kỹ Năng': '/learn — learn the entire Codex',
  '/wipe — xóa save & tải lại game': '/wipe — erase save & reload',
  '/item [phẩm 0-4] [giai 1-10] — tạo trang bị vào túi': '/item [quality 0-4] [tier 1-10] — spawn gear into bag',
  // ── Side-quest panel chrome ──
  'Nhận Nhiệm Vụ': 'Accept Quest', 'Nhận Thưởng': 'Claim Reward',
  'Đang nhận tối đa 3 phụ tuyến — hoàn thành bớt rồi quay lại.': 'Max 3 active side quests — finish some, then come back.',
  'gặp': 'to meet',
  // ── Chapter subtitles ──
  // ── Main quest names (35 chương) ──
  'Thảo Dược Cứu Người': 'Herbs to Heal', 'Sói Dữ Quấy Phá': 'Wolves on the Prowl',
  'Rèn Luyện Sơ Nhập': 'First Steps at the Forge', 'Sơn Tặc Hoành Hành': 'Bandits Run Rampant',
  'Tuyệt Kỹ Truyền Thừa': 'The Sect\'s Legacy Art', 'Bình Cảnh Chi Chiến': 'Battle of the Threshold',
  'Kiếm Khách Bán Đảo': 'The Islet Swordsman', 'Tình Hoa Độc': 'Passion Flower Poison',
 'Cắt Đứt Tai Mắt': 'Severing Eyes and Ears', 'Cuồng Binh Xung Trận': 'Berserkers Charge the Line',
  // ── 50 phụ tuyến Lunacia — tên ──
  'Lễ Vật Đầu Xuân': 'New Year Tribute', 'Phương Thuốc Cứu Dịch': 'Plague-Remedy Prescription',
  'Sói Dữ Vây Làng': 'Wolves at the Gates', 'Hồ Ly Trộm Thuốc': 'The Medicine-Thieving Foxes',
  'Truy Kích Hắc Phong Dư Đảng': 'Hunt the Black Wind Remnants', 'Phá Trận Hồn': 'Breaking the Formation Souls',
  'Thuốc Cho Bà Cụ': 'Medicine for the Old Dame', 'Kẻ Đứng Sau Vụ Cướp': 'The Mastermind Behind the Raid',
  'Dọn Đường Lương Thực': 'Clear the Grain Road', 'Sói Hoành Ngoại Ô': 'Wolves Ravage the Outskirts',
  'Truy Nã Hắc Phong': 'Black Wind Wanted', 'Điểm Danh Nghĩa Sĩ': 'Muster of the Righteous',
  'Đoạt Cung Xạ': 'Seize the Bows', 'Biên Quan Huyết Chiến': 'Bloodbath at the Border', 'Kỳ Lân Cuồng Hỏa': 'Qilins of Raging Fire', 'Báo Tin Thắng Trận': 'News of Victory',
  'Lông Cáo Nhuộm Dược': 'Fox Fur for Dyeing', 'Thuốc Cho Thương Binh': 'Medicine for the Wounded',
  'Tuấn Mã Cho Tân Binh': 'Steeds for New Recruits', 'Nghiệt Kỵ': 'The Remnant Riders',
  // ── 50 phụ tuyến Lunacia — mô tả ──
  // ── Intro story (4 trang, text-node fragments) ──
  
  'cấp 10': 'Lv 10',
  'Rèn trang bị +11': 'Forge gear to +11', '— và cuối cùng,': '— and finally,',
  'Tiếp ▸': 'Next ▸',
  '⚔ Bắt Đầu Hành Trình': '⚔ Begin the Journey', 'Bắt Đầu Hành Trình': 'Begin the Journey',
  'Tiếp Tục Hành Trình': 'Continue the Journey',
  // ── Sect select / ceremony ──
  // ── The Hatching ──
  '🥚 The Hatching': '🥚 The Hatching',
  'LINH': 'SPIRIT',
  'Hắc Phong Sát': 'Black Wind Slayer', 'Hắc Phong Sát Thủ': 'Black Wind Chief',
  // ── 16 trait The Hatching ──
  'Thần Lực': 'Divine Strength', 'Nhục Thân Cường Tráng': 'Stalwart Body',
  'Ăn May': 'Born Lucky', 'Instinct Dồi Dào': 'Abundant Instinct',
  'Túc Trí Đa Mưu': 'Cunning Mind', 'Spark Thiên Phú': 'Spark Prodigy',
  'Bách Bộ Thần Hành': 'Hundred-Step Swiftness', 'Thiên Nhãn': 'Heavenly Eye',
  'Long Tích Hổ Bộ': 'Dragon Stride, Tiger Step', 'Đoạn Ngọc Thủ': 'Jade-Sundering Hand',
  'Sát Tâm': 'Killing Heart', 'Dược Thể': 'Herbal Body',
  'Võ Hồn': 'Martial Soul', 'Thiên Mệnh': 'Heaven\'s Mandate',
  'Khai Mở Mạch Lực': 'Open Channels', 'Vạn Vật Hữu Duyên': 'Fortune\'s Favorite',
  '+8 Tấn Công': '+8 Attack', '+55 Sinh Lực tối đa': '+55 Max HP',
 '+5% tỉ lệ quái rớt đồ': '+5% monster drop rate',
  'Giết Du Hiệp không tăng Tội Ác': 'Slaying Wandering Heroes grants no Sin',
  'Card +12% Sát Thương': 'Card +12% Damage', '+15% Bạc rơi': '+15% silver drops',
  'Kỹ năng +15% Sát Thương · phá khiên lâu thêm 4s': 'Skills +15% DMG · shield-break lasts 4s longer',
  'Kỹ năng +12% Sát Thương': 'Skills +12% Damage',
  // ── Tính cách ──
  'Chính Trực': 'Righteous', 'Tà Khí': 'Heretical', 'Trung Dung': 'Balanced',
  '⌨ Phím Space': '⌨ Space key',
  'Đòn đánh thường': 'Basic attack',
  'tiến hóa bậc': 'evolution stage',
};

/* ---- Bổ sung dịch: nhiệm vụ chính tuyến/phụ tuyến + kỹ năng/kỹ năng ---- */
Object.assign(EXACT, {
  // ── Main quest descriptions (34) ──
  // ── Old side quests: 12 names + 16 descs ──
  // ── Kỹ năng: 46 tên ──
  
  
  
  // ── Kỹ năng: 46 mô tả ──
  'Bị động: 30% chiêu vừa tung không tốn hồi chiêu.': 'Passive: 30% chance a cast skill costs no cooldown.',
  'Bị động: chết tự hồi sinh 50% Sinh Lực — mỗi 300s một lần.': 'Passive: revive at 50% HP on death — once every 300s.',
  'Phá kiếm thức — một kiếm bỏ qua phòng thủ, cắt đứt chiêu địch.': "Sword-breaking stance — one stroke ignores defense and severs the foe's move.",
  // ── Dung Hợp: 30 names ──
  // ── Dung Hợp: 30 descs ──
  
  // ── SKILL_DEFS names + descs ──
  'Rupture Bolt': 'Rupture Bolt',
  
  'Soul Rend': 'Soul Rend',
  // ── PASSIVE_SKILLS: 6 names + 6 descs ──
  'Huyết Ma Thôn Phệ': 'Blood Demon Devour',
  // ── Sect skill names (16) ──

  // ── Sect flavor descs (8) ──
  // ── Schools & misc ──

  
  'Sổ Kỹ Năng': 'Skill Codex',
  '+8% Kinh Nghiệm': '+8% EXP',
  '+6% Tốc Chạy': '+6% Move Speed',
});

/* ---- REGEX rules for dynamic/templated strings ---- */

/* ---- Bổ sung 2: chrome panel Kỹ Năng / Sổ Kỹ Năng / Dung Hợp ---- */
Object.assign(EXACT, {
  '+2,5% Sát Thương': '+2.5% DMG',
  'Thành Thạo': 'Proficient',
  'Tinh Thông': 'Expert',
  'Điêu Luyện': 'Skilled',
  'Lão Luyện': 'Veteran',
  'Bậc Thầy': 'Master',
  'Đại Sư': 'Grandmaster',
  'Kỹ năng': 'Skills',
  'kỹ năng phái khác': "another sect's art",
  // categories
  'Kiếm': 'Sword', 
 'Bổng': 'Staff', 'Tâm Pháp': 'Heart Art', 'Thân Pháp': 'Movement',
  // fusion origins
});

Object.assign(EXACT, {
  'Hộ Thể': 'Body Guard',
  'Đao': 'Blade',
  'Thượng': 'Upper', 'Trung': 'Mid', 'Hạ': 'Lower',
  '+5% Né Tránh': '+5% Dodge',
  '+8% Kinh Nghiệm': '+8% EXP',
  '+6% Tốc Chạy': '+6% Move Speed',
});

/* ---- Character panel (renderChar) + Character-panel wrapper/tabs ---- */
Object.assign(EXACT, {
  'Điểm tiềm năng còn:': 'Potential points left:',
  'mỗi cấp +5': '+5 per level',
  'Tốc đánh, bạo kích, né tránh': 'Attack speed, crit, dodge',
  'Giảm sát thương nhận vào': 'Reduces damage taken',
  'THUỘC TÍNH CHIẾN ĐẤU': 'COMBAT STATS',
  'Giảm Thương': 'Dmg Reduction',
  'Tốc Đánh': 'Atk Speed',
  'CHIÊU THỨC': 'SKILLS',
  '☠ Huyết Ma Thôn Phệ (sách kỹ năng)': '☠ Blood Demon Devour (secret manual)',
  'hút 10% Sát Thương': 'drains 10% DMG',
  'DANH HIỆU — bấm để chọn danh hiệu hiển thị trên đỉnh đầu': 'TITLES — click to choose the title shown above your head',
  'Mở khóa = cộng dồn chỉ số vĩnh viễn (không cần trang bị). Bấm lần nữa vào danh hiệu đang hiển thị để ẩn.': 'Unlocking grants a permanent stat bonus (no need to equip). Click your displayed title again to hide it.',
  'chọn': 'select',
  'sách kỹ năng': 'skill tome',
  'Rèn thành công +11': 'Successfully forge to +11',
  'Khách Lạ Lunacia': 'Newcomer to Lunacia',
  // Title stat lines (titleStatText output, wrapped as "— {this}" by renderChar)
  '+5% Công': '+5% ATK', '+10% Bạo': '+10% Crit',
  '+5% tỉ lệ rèn': '+5% forge rate', '+10% Toàn TT': '+10% All Stats', '+15% Toàn TT': '+15% All Stats',
  // Divine Weapon tier names (TB_TIER_NAMES) — classic cultivation-stage flavor, distinct from the
  // player's own Ascension realms above
  'Lõi Nguyên Tố': 'Elemental Core',
  'Hạ 10 Chimera': 'Slay 10 Chimeras',
  'Thu 1 Lõi Nguyên Tố': 'Collect 1 Elemental Core',
  'Thông quan 1 phó bản': 'Clear 1 dungeon',
  'Rèn / nâng tầng / khảm ngọc 1 lần': 'Forge / advance a tier / socket a jewel once',
  // Character-panel wrapper (renderCharPanel) + CHAR_TABS
  'Thú Chiến': 'War Beast',
  '🔄 Tái Sinh': '🔄 Reset',
  'Tái Sinh': 'Reset',
  'Đài Hội Lực': 'Confluence Dais',
  'Vườn Thảo Dược': 'Herb Garden',
  'Cỏ Hồi Máu': 'Bloodroot',
  'Cỏ Bản Năng': 'Instinct Grass',
  'Cỏ Bạc': 'Silverleaf',
  'Kẻ Báo Thù': 'Avenger',
  'Khách Lạ Lunacia': 'Stranger to Lunacia',
  'TỈ LỆ CÔNG KHAI — KHÔNG CỘNG DỒN MAY MẮN': 'PUBLISHED RATES — NO PITY',
  // ⚠ Chuỗi này CHỈ hiện trong khung Giờ Vàng của Vực Thẳm (12h & 20h GIỜ MÁY), nên nó
  //   tàng hình ~92% thời gian và `test_dichen §②` chỉ bắt được khi lượt chạy rơi đúng
  //   khung ấy. Cùng họ với lỗ băng-rôn Đàn Vàng đã ghi trong CLAUDE.md: một bài i18n đỏ
  //   thì HỎI GIỜ trước khi đổ cho commit.
  '· ⚡ GIỜ VÀNG: 2 ô hiếm ×2!': '· ⚡ GOLDEN HOUR: 2 rare slots ×2!',
  'Suối Ký Ức': 'Spring of Memory',
  'Kẻ Được Định Mệnh Chọn': 'Chosen by Fate',
});

/* ---- Forge / Mount / Ascension / Instinct Channels / Card — sub-panels reachable from Character ---- */
Object.assign(EXACT, {
  'Hãy tiếp tục làm nhiệm vụ!': 'Keep questing!',
  '✦ Huyền Thiết': '✦ Mystic Iron',
  '◆ Tu La': '◆ Asura',
  '❖ Hỗn Nguyên': '❖ Chaos',
  'Chưa có trang bị nào.': 'You have no equipment yet.',
  'Phá Thiên Kiếp': 'Heaven-Rending Trial',
  'Tông Sư Thợ Rèn': 'Grandmaster Smith',
  '◉ Linh Hồn': '◉ Soul',
  '❤ Sinh Mệnh': '❤ Life',
  '● Hỗn Độn': '● Chaos',
  'Chinh Phạt': 'Campaign',
  // Mount (Thú Chiến)
  // Bốn bộ Cổ Thần Thủ Hộ — danh từ riêng Vaeldra, giữ nguyên ở mọi ngôn ngữ
  'Sarkaan': 'Sarkaan',
  'Velmyr': 'Velmyr',
  'Ashvard': 'Ashvard',
  'Korrveth': 'Korrveth',
  // Card (Di Sản)
  'Chưa rèn giũa — nâng lên Tầng 1 để khai mở!': 'Not yet trained — advance to Stage 1 to unlock!',
});

/* ---- Settings panel (renderSettings) ---- */
Object.assign(EXACT, {
  'Cài Đặt': 'Settings',
  'BẬT': 'ON',
  'TẮT': 'OFF',
  '🎵 Nhạc nền': '🎵 Music',
  '🔔 Hiệu ứng âm thanh': '🔔 Sound Effects',
  '🗺 Bản đồ thu nhỏ': '🗺 Minimap',
  'phím U': 'key U',
  '🏷 Tên quái vật': '🏷 Monster Names',
  '📳 Rung màn hình': '📳 Screen Shake',
  'mặc định tắt': 'off by default',
  'máy yếu': 'weak devices',
  '— ⚔ TỰ ĐÁNH (phím Z) —': '— ⚔ AUTO FARM (key Z) —',
  '🗡 Tự tung kỹ năng trên taskbar': '🗡 Auto-cast taskbar skills',
  '🧪 Tự uống Bình Thuốc Đỏ': '🧪 Auto-drink Red Potion',
  '❤ Uống thuốc khi Sinh Lực dưới': '❤ Drink potion when HP below',
  '🎯 Tầm quét quanh điểm neo': '🎯 Scan range around anchor point',
  '👹 Tự đánh cả Trùm': '👹 Auto-fight bosses too',
  'nguy hiểm — mặc định tắt, trùm tự mình quyết!': 'risky — off by default, boss fights are on you!',
  'XÓA SAVE': 'WIPE SAVE',
  'Âm thanh sẽ phát sau thao tác đầu tiên của bạn (quy định trình duyệt). Mọi cài đặt được lưu tự động.': 'Sound will start playing after your first action (browser policy). All settings are saved automatically.',
});

/* ---- General coverage sweep: Inventory (renderInv) + Bag (renderBag) ---- */
Object.assign(EXACT, {
  '⚡ Mặc Đồ Tốt Nhất': '⚡ Equip Best Gear',
  'Túi trống — hãy đi cày quái!': 'Bag is empty — go farm some monsters!',
  'Mặc Vào': 'Equip',
});

/* ---- General coverage sweep: Quest Log (renderQlog) ---- */
Object.assign(EXACT, {
  'Nhật Ký Nhiệm Vụ': 'Quest Log',
  '★ Chính Tuyến': '★ Main Quest',
  '◈ Phụ Tuyến': '◈ Side Quests',
  '📜 Nhật Ký': '📜 Journal',
  '🧭 Tới Ngay': '🧭 Go Now',
  '🔍 Manh Mối': '🔍 Clues',
});

const RULES = [
  [/^Cấp (\d+)$/, 'Lv $1'],
  [/^Cấp (\d+) → (\d+)$/, 'Lv $1 → $2'],
  [/^Ascension bậc (\d+) \((.*)\)$/, (m, a, b) => `Ascension Lv ${a} (${tr(b)})`],
  [/^Chương ([IVX]+) · (.*)$/, (m, a, b) => `Chapter ${a} · ${tr(b) === b ? b : tr(b)}`],
  [/^Bảo Hạp ([IVX]+)$/, 'Relic Chest $1'],
  [/^(.+) tầng (\d+) \(Card\)$/, (m, a, b) => `${tr(a)} — tier ${b} (Card)`],
  [/^(.+) \((bị động)\)$/, (m, a) => `${tr(a)} (passive)`],
  [/^Thú Cưỡi → tầng (\d+)$/, 'Mount → tier $1'],
  [/^(\d+)\/7 ấn đã vỡ\.$/, '$1/7 seals broken.'],
  [/^(.+) ×(\d+)$/, (m, a, b) => `${tr(a)} ×${b}`],
  [/^×(\d+) (.*)$/, (m, a, b) => `×${a} ${trFrag(b)}`],
  [/^\+(\d+) Lực · \+(\d+) Mẫn · \+(\d+) Cốt · \+(\d+) Thể$/, (m, a, b, c, d) => `+${a} STR · +${b} AGI · +${c} DEF · +${d} VIT`],
  [/^\+(\d+)% (.*)$/, (m, a, b) => `+${a}% ${trFrag(b)}`],
  [/^\+(\d+) (.*)$/, (m, a, b) => `+${a} ${trFrag(b)}`],
  [/^(\d+) phút (.*)$/, (m, a, b) => `${a} min: ${trFrag(b)}`],
  [/^(\d+)s (.*)$/, (m, a, b) => `${a}s: ${trFrag(b)}`],
  [/^Bị động: (.*)$/, (m, a) => `Passive: ${trFrag(a)}`],
  [/^rèn \+(\d+)(.*)$/, (m, a, b) => `forge +${a}${trFrag(b)}`],
  [/^Tàn Quyển \((.*)\)$/, (m, a) => `Fragment (${a})`],
  [/^Phó Bản · (.*)$/, (m, a) => `Dungeon · ${a}`],
  [/^(.+) · Vách Té Núi$/, (m, a) => `${tr(a)} · Cliff of Fortune`],
  [/^Qua Cổng (.*) → (.*)$/, (m, a, b) => `Through ${a} Gate → ${tr(b)}`],
  [/^Đạt cấp (\d+)$/, 'Reach Lv $1'],
  [/^Đã hạ$/, 'Slain'],
    [/^cần cấp (\d+)$/i, 'requires Lv $1'],
  [/^Lễ Bạc (\d+)◈$/, 'Gift $1◈ silver'],
  // ── Side-quest panel dynamic strings ──
  [/^Thưởng: (.+)$/, (m, a) => `Reward: ${tr(a)}`],
  [/^Tiến độ: (.*?) · Thưởng: (.+)$/, (m, a, b) => `Progress: ${tr(a)} · Reward: ${tr(b)}`],
  [/^Cần cấp (\d+) · Tiến độ chính tuyến chưa đủ$/, 'Requires Lv $1 · Main story progress not reached'],
  [/^◈ (.+)$/, (m, a) => `◈ ${tr(a)}`],
  [/^✔ (.+)$/, (m, a) => `✔ ${tr(a)}`],
  [/^🔒 (.+)$/, (m, a) => `🔒 ${tr(a)}`],
  [/^(.+) — Hoàn thành!$/, (m, a) => `${tr(a)} — Completed!`],
  [/^★ Chính tuyến (\d+): (.+)$/, (m, a, b) => `★ Main Quest ${a}: ${tr(b)}`],
  [/^★ Chính tuyến hiện tại: "(.+)" — hãy đến$/, (m, a) => `★ Current main quest: "${tr(a)}" — go to`],
  [/^Phụ tuyến hoàn thành — về gặp (.+)$/, (m, a) => `Side quest complete — return to ${tr(a)}`],
  [/^Hoàn thành phụ tuyến: (.+)!$/, (m, a) => `Side quest complete: ${tr(a)}!`],
  [/^(.+?) (\d+)\/(\d+)$/, (m, a, b, c) => `${tr(a)} ${b}/${c}`],
  // ── The Hatching dynamic ──
  [/^— Mảnh (\d+) —$/, '— Shard $1 —'],
  [/^🥚 Ấp Lại Ổ Trứng \(còn (\d+)\)$/, '🥚 Re-nest the Eggs ($1 left)'],
  [/^Đã chọn (\d+)\/3 mảnh$/, 'Picked $1/3 shards'],
  [/^🥚 The Hatching: (.+)$/, (m, a) => `🥚 The Hatching: ${a.split(' · ').map(tr).join(' · ')}`],
  [/^🥚 The Hatching ban cho người cũ — xem ở panel Nhân Vật!$/, '🥚 The Hatching grants returning heroes their traits — see the Character panel!'],
// ── Skill/sect dynamic templates ──
  [/^(.+?) — chiêu thức nhập môn (.+)\.$/, (m, a, b) => `${tr(a)} — entry art of ${tr(b)}.`],
  [/^(.+?) — Trấn Phái tuyệt kỹ (.+), sát thương lan\.$/, (m, a, b) => `${tr(a)} — ${tr(b)}'s signature ultimate, splash damage.`],
  [/^Dung hợp: (.+?) — (.+?) \+ (\d+) 📜 \(bấm K\)$/, (m, a, b, c) => `Fusion: ${a.split(' + ').map(t => tr(t)).join(' + ')} — ${tr(b)} + ${c} 📜 (press K)`],
  [/^cấp (\d+)$/, 'Lv $1'],
  [/^Sách Kỹ Năng Phiêu Bạt — (.+)$/, (m, a) => `Drifter's Skill Book — ${tr(a)}`],
// ── Skill panel chrome dynamic ──
  [/^\[(\d+): trống\]$/, '[$1: empty]'],
  [/^🔒 Mở khóa ở cấp (\d+)$/, '🔒 Unlocks at Lv $1'],
  [/^Mở khóa ở cấp (\d+)$/, 'Unlocks at Lv $1'],
  [/^🔒 cấp (\d+)$/, '🔒 Lv $1'],
  [/^🔒 (.+)$/, (m, a) => `🔒 ${tr(a)}`],
  [/^(\d+): (.+) ✕$/, (m, a, b) => `${a}: ${tr(b)} ✕`],
  [/^Học · (\d+)📜$/, 'Learn · $1📜'],
  [/^☯ Dung Hợp · (\d+)📜$/, '☯ Fuse · $1📜'],
  [/^(.+?) · (.+?) — bấm K gán vào taskbar$/, (m, a, b) => `${tr(a)} · ${tr(b)} — press K to assign to the taskbar`],
  [/^Cấp kỹ năng ≤ cấp nhân vật \((\d+)\)$/, 'Skill level ≤ character level ($1)'],
  [/^Cần ([\d.,]+) bạc$/, 'Need $1 silver'],
  [/^\s*· (\d+) mana · (.+)$/, (m, a, b) => ` · ${a} Mana · ${b}`],
  // Map panel "Đang ở: <map> · <zone type> ·" status line: zt.name sits alone between two ` · `
  // markers, but Dã Ngoại · PK / Huyết Chiến · Free PK already contain a `·` themselves, so the
  // generic ` · (.+)` splitter below mis-splits on the zone type's own separator. Match the exact
  // zone-type names first so they translate as one unit.
  [/^· (An Toàn|Dã Ngoại · PK|Huyết Chiến · Free PK|Phó Bản) ·$/, (m, a) => `· ${tr(a)} ·`],
  [/^\s*· (.+)$/, (full, a) => { const j = a.split(' · ').map(p => tr(p)).join(' · '); return j === a ? full : ' · ' + j; }],
  [/^— (.+) —$/, (full, a) => { const t = tr(a); return t === a ? full : `— ${t} —`; }],
  [/^Cấp (\d+)\/120(?: · (.+?))? — nâng: ([\d.,]+) bạc, \+2,5% Sát Thương(?: · mốc kế (.+?) \(cấp (\d+)\): (.+?))? · cấp kỹ năng ≤ cấp nhân vật$/,
    (m, lv, cur, cost, nm, nmlv, mst) => {
      const ms = mst ? mst.replace('sát thương', 'DMG').replace('hồi chiêu', 'cooldown').replace('tiêu hao Mana', 'Mana cost') : '';
      return `Lv ${lv}/120${cur ? ' · ' + tr(cur) : ''} — upgrade: ${cost} silver, +2.5% DMG${nm ? ` · next milestone ${tr(nm)} (Lv ${nmlv}): ${ms}` : ''} · skill level ≤ character level`;
    }],
  // ── Character panel + sub-panels (renderChar/renderSettings + Forge/Mount/Ascension/Card) ──
  [/^Nhân Vật — (.+) Cấp (\d+)$/, (m, a, b) => `Character — ${tr(a)} Lv ${b}`],
  [/^hiện cấp (\d+)$/, 'currently Lv $1'],
  [/^☯ QUẺ TIÊN THIÊN · (.+)$/, (m, a) => `☯ THE HATCHING · ${tr(a)}`],
  [/^Trấn Phái: (.+)$/, (m, a) => `Signature Art: ${tr(a)}`],
  [/^(\d+) — (.+)$/, (m, a, b) => `${a} — ${tr(b)}`],
  [/^⚔ THẦN BINH — (.+)$/, (m, a) => `⚔ DIVINE WEAPON — ${tr(a)}`],
  [/^(.+?) · Tầng (\d+)【(.+?)】( — ĐÃ THỨC TỈNH ✦)?$/, (m, a, b, c, d) => `${tr(a)} · Stage ${b}【${tr(c)}】${d ? ' — AWAKENED ✦' : ''}`],
  [/^Luyện lên tầng (\d+)【(.+?)】$/, (m, a, b) => `Advance to Stage ${a}【${tr(b)}】`],
  [/^Lõi Nguyên Tố (\S+)/, (m, e) => `Elemental Core ${m1El(e)}`],
  [/^Cần: (\d+) Lõi Nguyên Tố \(có (\d+)\) \+ (\d+) Huyền Thiết \(có (\d+)\)$/, (m, a, b, c, d) => `Need: ${a} Elemental Core (have ${b}) + ${c} Mystic Iron (have ${d})`],
  [/^Thiếu nguyên liệu: cần (\d+) Lõi Nguyên Tố \+ (\d+) Huyền Thiết$/, (m, a, b) => `Missing materials: need ${a} Elemental Core + ${b} Mystic Iron`],
  [/^Dùng Thiên Mệnh Phù — xịt vẫn giữ nguyên cấp \(còn (\d+)\)$/, (m, a) => `Use a Fate Charm — a failure still keeps your level (${a} left)`],
  [/^Lên \+1 với 50% — thất bại tụt 1 cấp \(áp dụng đến \+10, kể cả Phá Thiên Kiếp\)$/, '+1 at 50% success — failure drops 1 level (applies up to +10, including the Heaven-Rending Trial)'],
  [/^Giai (\d+)\/(\d+)$/, 'Tier $1/$2'],
  [/^Giai (\d+): (.+)$/, (m, a, b) => `Tier ${a}: ${tr(b)}`],
  [/^Thăng Giai → (.+)$/, (m, a) => `Advance Tier → ${tr(a)}`],
  [/^Cần đạt cấp (\d+) để thăng (.+)$/, (m, a, b) => `Need to reach Lv ${a} to advance to ${tr(b)}`],
  [/^PHỤ TUYẾN — (.+)$/, (m, a) => `SIDE QUESTS — ${a}`],
  [/^Cần cấp (\d+) mới thăng được!$/, 'Need Lv $1 to advance!'],
  [/^Thợ Rèn Truyền Thuyết: \+(\d+)% tỉ lệ$/, (m, a) => `Legendary Smith: +${a}% rate`],
  [/^NỘI ĐAN YÊU THÚ — Thôn Phệ \(hôm nay còn (\d+)\/3 lần\)$/, (m, a) => `BEAST INNER CORES — Devour (${a}/3 left today)`],
  [/^(\d+)\/7 Vệ Thần đã hạ$/, (m, a) => `${a}/7 Guardian Spirits slain`],
  [/^🗺 (.+) — vùng khác, mở Bản Đồ \(M\)$/, (m, a) => `🗺 ${tr(a)} — different region, open the Map (M)`],
  // Travel zone banner (travelTo()'s zoneBanner.sub): ZONE_TYPES[...].name is concatenated with
  // the map's desc into one "<zone type> — <desc>" string before it ever reaches this translator,
  // so neither the EXACT entry for the zone-type name alone nor a generic rule would catch it.
  // The 4 alternatives are ZONE_TYPES's exact `name` values (game.js).
  [/^(An Toàn|Dã Ngoại · PK|Huyết Chiến · Free PK|Phó Bản) — (.+)$/, (m, a, b) => `${tr(a)} — ${tr(b)}`],
  // ── Generic wrapper rules — kept last so more specific patterns above always win first ──
  [/^\((.+)\)$/, (m, a) => `(${tr(a)})`],
  [/^【(.+)】$/, (m, a) => `【${tr(a)}】`],
  [/^— (.+)$/, (m, a) => `— ${tr(a)}`],
];

/* ---- core translate ---- */
// tr() is a pure string->string mapping (no game-state dependency), so its result for a given
// input never changes within a page load — memoize it. Canvas text (mob nameplates, floating
// damage numbers) redraws the same strings every frame at 60fps, and without this each call
// falls through the EXACT dictionary miss into a full linear scan of the RULES regex list.
/* ══ ĐỢT BỔ SUNG: 257 chuỗi còn sót khi bật English ═══════════════════════════════════
   Đo bằng cách bật English rồi quét MỌI text node đang hiển thị trên 9 màn (dẫn truyện ·
   chọn lớp · HUD · Nhân Vật · Túi · Kỹ Năng · Bản Đồ · Nhật Ký · Cài Đặt · Bảng Sự Kiện):
   257 chuỗi còn dấu tiếng Việt, và cả 257 đều là THIẾU MỤC TỪ — không chuỗi nào đã nằm
   trong EXACT mà vẫn lọt, tức cơ chế dịch chạy đúng, chỉ là chưa ai điền.
   Giữ đúng giọng đã chốt ở khối trên: mộc, hơi cổ, không một chữ kiếm hiệp; danh từ riêng
   Corran · Gloam · Sapidae · Atia · Lunacia · Vaeldra giữ nguyên. */
Object.assign(EXACT, {
  // ── Dẫn truyện & màn chọn lớp ──
  'VAELDRA — Lục Địa Thép Và Tro': 'VAELDRA — Continent of Steel and Ash',
  'Bỏ qua ▸▸': 'Skip ▸▸',
  'Lunacia · Bên dưới vết nứt': 'Lunacia · Beneath the rift',
  'Bầu trời nứt ra, và ngươi rơi qua.': 'The sky tore open, and you fell through.',
  'Lunacia sinh ra từ ánh chớp đầu tiên của quả trứng thế giới Atia. Một thế giới non trẻ, chưa từng biết đến chiến tranh.':
    'Lunacia was born from the first flash of the Atia world-egg. A young world, one that had never known war.',
  'Ở phía bên kia của mọi thứ, có một thế giới khác:': 'On the far side of everything lies another world:',
  '. Nơi đó có hiệp sĩ, có pháp sư, có tiên tộc — và có một thứ bị chôn dưới lòng đất suốt một nghìn năm.':
    '. A place of knights, of sorcerers, of woodland kin — and of something buried underground for a thousand years.',
  'Chọn một lớp để xem chi tiết.': 'Pick a class to see details.',
  'Hãy chọn một lớp.': 'Choose a class.',
  'Tên nhân vật': 'Character name',
  'Tạo Nhân Vật': 'Create Character',
  '🧪 Chế độ thử nghiệm — vào game ở cấp tối đa, đầy đủ trang bị & mọi tính năng mở sẵn':
    '🧪 Test mode — enter at max level with full gear and every feature unlocked',
  'Chế độ thử nghiệm — vào game ở cấp tối đa, đầy đủ trang bị & vật liệu':
    'Test mode — enter at max level with full gear and materials',

  // ── Vai trò 5 lớp (dòng ngay dưới tên lớp ở màn đầu tiên) ──
  'Chịu Đòn / Liên Đòn cận chiến': 'Tank / Melee Chains',
  'Tầm xa / Hỗ trợ': 'Ranged / Support',
  'Pháp thuật / Độc tố': 'Sorcery / Venom',
  'Lai / Bộc phát Hoả': 'Hybrid / Fire Burst',
  'Chỉ huy / Triệu hồi': 'Command / Summoning',

  // ── HUD & tên bảng ──
  'ĐANG DIỄN RA': 'LIVE NOW',
  '⚔ TỰ ĐÁNH': '⚔ AUTO',
  '📜 Nhiệm Vụ': '📜 Quests',
  '☀ Mục Tiêu Hôm Nay': "☀ Today's Goals",
  'Nhân Vật': 'Character', 'Túi Đồ': 'Inventory', 'Kỹ Năng': 'Skills',
  'Nhiệm Vụ': 'Quests', 'Bản Đồ': 'Map',
  'Đã biết ✕': 'Got it ✕', 'Đi ngay': 'Go now', 'Tới Ngay': 'Go Now', 'Đóng': 'Close',
  '🔒 ✦ Nâng Cấp': '🔒 ✦ Upgrade',
  'Người Giữ Lunacia': 'Keeper of Lunacia',
  'Kẻ Mở Trụ Cuối': 'Opener of the Last Pillar',

  // ── Hướng dẫn 6 bước (mỗi mảnh là một text node riêng vì có thẻ <b>) ──
  'Bấm': 'Click', 'chuột phải': 'right-click',
  'trên nền đất hoặc bấm vào': 'on the ground, or click',
  'bản đồ thu nhỏ': 'the minimap',
  '— nhân vật sẽ tự chạy tới đó, hãy thử một lần': '— your character runs there. Try it once',

  // ── Bảng Nhân Vật ──
  '◈ DẤU ẤN KHAI SINH · ◑ Điềm Tĩnh': '◈ BIRTH SIGN · ◑ Composed',
  'Sức Vóc': 'Stature', 'Linh Lực': 'Energy', 'Hồi Mana': 'Mana Regen',
  'Thân Thể Cứng Cáp': 'Hardy Frame', 'Tay Nghề Rèn': 'Smithing Hand',
  '[THƯỜNG]': '[COMMON]',
  'Bản Năng (nâng kỹ năng)': 'Instinct (skill upgrades)',
  'Hệ đòn đánh': 'Attack element',
  '(Công kích (tùy lớp), sát thương phi tiêu)': '(ATK (class-dependent), throwing damage)',
  '(Máu tối đa và tốc hồi phục)': '(Max HP and regen rate)',
  '(Mana tối đa + Công kích (tùy lớp))': '(Max Mana + ATK (class-dependent))',
  '(Tốc đánh, bạo kích, né tránh + Công kích (tùy phái))': '(Attack speed, crit, dodge + ATK (class-dependent))',
  '— dồn điểm tiềm năng vào đây là hiệu quả nhất.': '— putting potential points here is most effective.',

  // ── Túi Đồ ──
  'Vật Liệu': 'Materials', '⚙ Tự động': '⚙ Auto', '🧩 Xếp Gọn': '🧩 Tidy',
  'Dọn từ phẩm': 'Clear from rarity', '🗑 Vứt 1 món': '🗑 Drop 1 item',
  'bấm hai lần để xác nhận': 'click twice to confirm',
  'bấm ô = mặc · kéo để dời chỗ ·': 'click a slot = equip · drag to move ·',
  '= bán / phân giải / vứt': '= sell / salvage / drop',
  'Bấm viên ngọc rồi bấm món đồ để ép thẳng — không cần tới lò.':
    'Click a jewel, then click an item to socket it directly — no forge needed.',

  // ── Bảng Kỹ Năng ──
  '4 ô cố định · phím 1-4': '4 fixed slots · keys 1-4',
  '40/80/120 ⚡Tiến Hóa': '40/80/120 ⚡Evolution',
  'Bản Năng': 'Instinct',
  '⇥ Tầm': '⇥ Range', '⟳ Hồi': '⟳ Cooldown', '✦ Công Kích': '✦ ATK', '◎ Phạm vi': '◎ Area',
  'tại chỗ': 'self', '1 mục tiêu': '1 target',
  '🔒 chưa đạt điều kiện': '🔒 requirements not met',
  '), tự ngộ theo cấp, không cần bấm nút.': '), learned automatically by level — no button needed.',
  'BỊ ĐỘNG RIÊNG CỦA LỚP — chỉ lớp này mới có': 'CLASS PASSIVE — only this class has it',
  'BỊ ĐỘNG CHUNG — mở từ Ascension, trang bị và Sách Kỹ Năng':
    'SHARED PASSIVES — unlocked from Ascension, gear and Tomes',
  'Phản lại một phần sát thương — Ascension bậc 5 / trang bị.':
    'Reflects part of the damage taken — Ascension tier 5 / gear.',
  'Đang có 0 quyển · rơi từ tinh anh/trùm & Vực Thẳm':
    'You hold 0 tomes · drops from elites/bosses & the Ravine',
  'Bấm nút sách ở dòng chiêu bất kỳ phía trên để nâng thẳng 1 cấp — khỏi tốn Lumen lẫn Bản Năng':
    'Press the book button on any skill row above to raise it one level — costing neither Lumen nor Instinct',

  // ── Bảng Bản Đồ ──
  'Bản Đồ Lunacia': 'Map of Lunacia',
  'Đang ở:': 'You are in:', 'ĐANG Ở ĐÂY': 'YOU ARE HERE',
  'Nhiệm vụ: phím Q': 'Quests: press Q',
  '[CHẾ ĐỘ TEST — dịch chuyển tự do]': '[TEST MODE — free teleport]',
  'Dịch Chuyển': 'Teleport',
  '◆ Đất của': '◆ Land of', '· hệ': '· element',
  '· nơi': '· only', 'duy nhất': 'source', 'rơi Cốt': 'of Bone',
  '▣ Rương Canh:': '▣ Warded Chest:', '🧭 Đi bộ:': '🧭 On foot:',
  'mọc ở vùng này — mỗi ngày một lần': 'surfaces in this region — once per day',
  'BÃI FARM — Trại Cựu Binh Gloam': 'FARM SPOT — Gloam Veteran Camp',

  // ── Tên Dòng Cốt (đứng một mình trên bảng Bản Đồ và danh sách sự kiện) ──
  // ── DẤU ẤN KHAI SINH: trọn 18 nét + 4 bậc. Nét bốc NGẪU NHIÊN mỗi nhân vật, nên chỉ dịch
  //    mấy cái tình cờ gặp lúc đo là kiểu sửa không bao giờ hết — liệt kê hết một lần.
  'Ăn May': 'Lucky Find', 'Đầu Óc Sắc Bén': 'Sharp Mind', 'Sải Chân Dài': 'Long Stride',
  'Bước Chân Nhẹ': 'Light Step', 'Tay Xuyên Giáp': 'Armour-Piercing Hand', 'Máu Lạnh': 'Cold Blood',
  'Thể Chất Kháng Độc': 'Poison-Hardened', 'Hồn Chiến': 'Battle Spirit', 'Số Trời': 'Fated',
  'Duyên May': 'Good Fortune', 'Ngay Thẳng': 'Upright', 'Tàn Nhẫn': 'Merciless', 'Điềm Tĩnh': 'Composed',
  '[HIẾM]': '[RARE]', '[QUÝ]': '[PRECIOUS]', '[THẦN]': '[DIVINE]',
  'HIẾM': 'RARE', 'QUÝ': 'PRECIOUS', 'THẦN': 'DIVINE',
  'Tro Tàn': 'Ash', 'Sách Kỹ Năng': 'Tome', 'Mắt Tinh': 'Keen Eye', 'Mana Dồi Dào': 'Deep Mana',
  'Cánh Hoa': 'Petal', 'Đồng Cỏ': 'Meadow', 'Rễ Gai': 'Thornroot', 'Vỏ Trứng': 'Eggshell',
  'Băng Vụn': 'Frostshard', 'Sấm Vụn': 'Stormshard', 'Mầm Cội': 'Rootling',
  'Vỏ Mòn': 'Wornshell', 'Mảnh Nứt': 'Riftshard', 'Bọt Ngầm': 'Deepfoam',

  // ── Bốn map Corran + Tầng Sâu ──
  'Rẻo Rừng Corran': 'Corran Woodstrip', 'Lối Mòn Corran': 'Corran Trail',
  'Trũng Nứt Corran': 'Corran Riftbasin', 'Tầng Sâu': 'The Deeps',

  // ── Chương chính tuyến ──
  'I · Ngọn Đèn Tắt': 'I · The Lamp Gone Out',
  'II · Lửa Của Thợ Rèn': "II · The Smith's Fire",
  'III · Rune Chôn': 'III · Buried Runes',
  'IV · Cây Hồn': 'IV · The Soul Tree',
  'V · Vết Nứt': 'V · The Rift',

  // ── Sự kiện thế giới ──
  'Hung Thần Giáng Thế': 'The Dread One Descends',
  'Chúa Tể Vực Nứt': 'Rift Overlord',
  'Xâm Lăng Vàng': 'Golden Invasion',
  'Truy Nã Lệnh & Mục Tiêu Ngày': 'Bounty Orders & Daily Goals',
  'Chúa Tể Vực Nứt 0h·6h·12h·18h': 'Rift Overlord 00·06·12·18',
  '(4 lượt/ngày, nứt ở mọi bãi săn)': '(4 times a day, rifts open at every hunting ground)',

  // ── Cài Đặt ──
  '🔭 Tầm nhìn': '🔭 View distance', 'ĐẦY': 'FULL', 'Đầy': 'Full', 'Vừa': 'Medium', 'Thấp': 'Low',
  '💥 Số sát thương trên đầu quái': '💥 Damage numbers above monsters',
  '📈 Bảng đo hiệu năng': '📈 Performance meter', '🍃 Hiệu ứng': '🍃 Effects',
  'Tự Chỉnh': 'Auto', '(tự chỉnh)': '(auto)',
  '(Tự Chỉnh sẽ hạ mức khi máy đuối)': '(Auto lowers this when the machine struggles)',
  '🔍 Độ nét': '🔍 Sharpness',
  'Màn hình này là': 'This display is', '— đang vẽ ở': '— rendering at',
  'điểm ảnh thật.': 'real pixels.', 'Đang chạy:': 'Running:',
  '🌐 Ngôn ngữ / Language': '🌐 Language',
  '🚪 Đổi nhân vật': '🚪 Switch character',
  'VỀ MÀN CHỌN NHÂN VẬT': 'BACK TO CHARACTER SELECT',

  // ── Quái (tên vẽ thẳng lên canvas, đi qua bản vá fillText) ──
  'Axie Heo Rừng': 'Boar Axie', 'Axie Gai Tím': 'Thistle Axie', 'Axie Bí Ngô': 'Pumpkin Axie',
  'Axie Cỏ Dại': 'Weed Axie', 'Axie Sa Ngã': 'Fallen Axie', 'Axie Cuồng Bão': 'Tempest Axie',
  'Cướp Đường Gloam': 'Gloam Highwayman', 'Thủ Lĩnh Gloam': 'Gloam Chieftain',
  'Gloam Cựu Binh': 'Gloam Veteran', 'Trinh Sát Gloam': 'Gloam Scout',
  'Thủ Lĩnh Đoàn Gloam': 'Gloam Warband Chieftain',
  'Tượng Đá Canh Cổng': 'Gate Sentinel Statue', 'Tượng Đá Vỡ Lệnh': 'Oathbroken Statue',
  'Heo Rừng Nhiễm Khí': 'Tainted Boar', 'Gai Tím Đầu Đàn': 'Thistle Pack-Leader',
  'Cỏ Dại Bén Lửa': 'Emberweed', 'Bộ Xương Phản Loạn': 'Rebel Skeleton',
  'Chimera Phun Độc': 'Venomspitter Chimera', 'Oan Hồn Ổ Ấp': 'Brooding Wraith',
  'Dơi Chimera': 'Chimera Bat', 'Chimera Rêu Nước': 'Watermoss Chimera',
  'Kẻ Cuồng Tín Lạc Lối': 'Lost Zealot', 'Chimera Cầu Gai': 'Urchin Chimera',
  'Sát Thủ Sương Mù': 'Mistblade Assassin', 'Trinh Sát Tro Tàn': 'Ashen Scout',
  'Cung Thủ Tro Tàn': 'Ashen Archer', 'Kỵ Sĩ Tro Tàn': 'Ashen Knight',
  'Cuồng Binh Tro Tàn': 'Ashen Berserker', 'Chó Ngao Lửa': 'Fire Mastiff',
  'Cao Thủ Lang Thang': 'Wandering Master', 'Thủ Lĩnh Sói Hoang': 'Wild Wolf Chieftain',
  'Đại Tướng Phản Loạn': 'Rebel Warlord', 'Chúa Tể Hầm Mộ': 'Crypt Overlord',
  'Xoáy Lá Nguyền': 'Cursed Leaf-Vortex', 'Chúa Sói Thảo Nguyên': 'Steppe Wolf Lord',
  'Thống Soái Thiên Giáp': 'Skyplate Marshal', 'Cốt Tướng': 'Bone General',
  'Nữ Vu Bóng Tối': 'Shadow Witch', 'Tướng Quân Vàng': 'Golden Warden',
  'Ác Thần Bóng Tối': 'Shadow Fiend',

  // ── Nhiệm vụ chính tuyến (33 mục) ──
  'Ra Bìa Rẻo Rừng Corran': 'Out to the Corran Woodstrip',
  'Ngọn Đèn Bên Giếng': 'The Lamp by the Well', 'Người Giữ Đèn': 'The Lampkeeper',
  'Dầu Cho Ngọn Đèn': 'Oil for the Lamp', 'Thứ Ăn Hồn Kẹt': 'What Eats Trapped Souls',
  'Thép Chịu Được Bóng': 'Steel That Holds Shadow', 'Ngồi Ở Miếu Atia': 'Sit at the Atia Shrine',
  'Đòn Của Riêng Ngươi': 'A Blow of Your Own', 'Kẻ Canh Miếu': 'The Shrine Warden',
  'Tin Từ Trại Chăn': 'Word from the Herding Camp', 'Kẻ Đi Trước': 'The One Who Went Ahead',
  'Dầu Cho Cả Vùng': 'Oil for the Whole Region', 'Đàn Bị Dồn': 'The Herd Driven In',
  'Lò Của Reptile': 'The Reptile Forge', 'Thứ Sinh Ra Từ Vết Nứt': 'Born of the Rift',
  'Rừng Của Werebear': 'The Werebear Wood', 'Kẻ Đổi Phe': 'The Turncoat',
  'Đường Xuống Địa Đạo': 'The Way Down to the Tunnels', 'Bẫy Bị Đọc Vị': 'The Trap Read Through',
  'Tầng Dưới Cùng': 'The Lowest Floor', 'Rune Trong Thép': 'Runes in the Steel',
  'Kẻ Đào Ngược': 'The Backward Digger', 'Nhà Trên Ngọn Thông': 'House in the Pine Crown',
  'Bài Hát Bị Cắt': 'The Song Cut Short', 'Kẻ Săn Người Giữ Đèn': 'Hunter of Lampkeepers',
  'Đủ Sức Đi Tiếp': 'Strong Enough to Go On', 'Đá Nóng Quanh Năm': 'Stone Hot All Year',
  'Mỏ Đã Tắt Lửa': 'The Mine Whose Fire Died', 'Đếm Ngược Tới Đầm': 'Countdown to the Marsh',
  'Đầm Của Dusk': 'The Marsh of Dusk', 'Vòng Trong Cùng': 'The Innermost Ring',
  'Chỗ Hồn Quay Về': 'Where Souls Return',

  // Lời thoại mở chuỗi (hiện trên dải nhiệm vụ ngay khi vào game)
  'Lính Gác Cổng Tây chặn ngươi lại: "Bầy heo rừng lấn tới sát chân tường ba đêm nay." Ra Cổng Tây, vào bìa Rẻo Rừng Corran mà dọn chúng.':
    'The West Gate Guard stops you: "The boars have pressed right up to the wall three nights running." Head out the West Gate into the Corran Woodstrip and clear them.',
});

/* Mẫu lặp lại — dùng RULES thay vì chép hàng trăm mục từ.
   Bảng Bản Đồ sinh mỗi map 6-8 dòng cùng khuôn (dải cấp · ba miền · lối đi bộ), nên một dòng
   regex thay cho 13 map × 8 dòng.

   ⚠⚠ QUY TẮC HẸP PHẢI `unshift`, KHÔNG ĐƯỢC `push` — và đây là chỗ đã mất một vòng để tìm ra.
   trCompute trả về ngay ở quy tắc ĐẦU TIÊN khớp, mà mảng sẵn có đã chứa mấy cái bắt-tất rất rộng:
       /^◈ (.+)$/            (dòng ~597)
       /^(.+?) (\d+)\/(\d+)$/ (dòng ~605)
       /^\s*· (.+)$/          (dòng ~636)
   Ba cái đó nuốt trọn '◈ Bán 1 món (+623)', 'HƯỚNG DẪN 1/6' và '· cấp 38 - 48' rồi trả lại
   nguyên văn tiếng Việt (phần chúng bắt được không tra ra gì). Lần đầu tôi `push` cả khối này
   xuống cuối mảng: mục từ có, quy tắc có, regex thử ngoài trình duyệt thì khớp — mà người chơi
   vẫn thấy tiếng Việt, và KHÔNG một lỗi nào báo ra.
   ⇒ Hẹp thì unshift (chen lên trước), rộng thì push (để lại sau cùng). */
RULES.unshift(
  [/^· cấp (\d+) - (\d+)$/, '· Lv $1 - $2'],
  [/^· cấp —$/, '· Lv —'],
  [/^(Tây|Đông|Nam|Bắc) → (.+)$/, (m, h, d) => `${({ 'Tây':'West', 'Đông':'East', 'Nam':'South', 'Bắc':'North' })[h]} → ${tr(d)}`],
  [/^(Ngoại Vi|Trung Tâm|Hạt Nhân) C(\d+)–(\d+)( ·)?$/, (m, v, a, c, d) =>
    `${({ 'Ngoại Vi':'Outer', 'Trung Tâm':'Middle', 'Hạt Nhân':'Core' })[v]} Lv${a}–${c}${d ? ' ·' : ''}`],
  [/^Vỉa Cốt (.+?)( HÔM NAY)?$/, (m, a, b) => `${tr(a)} Bone Vein${b ? ' TODAY' : ''}`],
  [/^HƯỚNG DẪN (\d+)\/(\d+)$/, 'TUTORIAL $1/$2'],
  [/^(\d+)\/(\d+) ô$/, '$1/$2 slots'],
  [/^◈ Bán 1 món \(\+(\d+)\)$/, '◈ Sell 1 item (+$1)'],
  [/^🔒 tự ngộ ở cấp (\d+)$/, '🔒 learned automatically at Lv $1'],
  [/^Làm mới lúc 00:00 — còn (\d+)g(\d+)$/, 'Resets at 00:00 — $1h$2 left'],
  [/^💡 (.+) ra Công Kích từ$/, (m, a) => `💡 ${a} draws ATK from`],
  [/^(.+) — 1 chính · 1 phụ · 1 phù trợ · 1 tuyệt chiêu$/, (m, a) => `${a} — 1 main · 1 sub · 1 support · 1 signature`],
  [/^(Chính|Phụ|Phù Trợ|★ Tuyệt Chiêu) — (.+)$/, (m, a, b) =>
    `${({ 'Chính':'Main', 'Phụ':'Sub', 'Phù Trợ':'Support', '★ Tuyệt Chiêu':'★ Signature' })[a]} — ${tr(b)}`],
);

/* Nhóm RỘNG — bắt gần như mọi chuỗi có tiền tố, nên phải để SAU cùng mảng. */
RULES.push(
  [/^(.+) · Cấp (\d+)$/, (m, a, b) => `${tr(a)} · Lv ${b}`],
  [/^🗺 (.+) · (.+)$/, (m, a, c) => `🗺 ${tr(a)} · ${tr(c)}`],
  [/^★ (.+)$/, (m, a) => `★ ${tr(a)}`],
  [/^Săn (.+)$/, (m, a) => `Hunt ${tr(a)}`],
  // Đuôi 🔒 (cổng chưa mở trên bảng Bản Đồ): bóc ra rồi mới tra tên map.
  [/^(.+) 🔒$/, (m, a) => `${tr(a)} 🔒`],
);

/* Đợt 2 — phần văn xuôi dài: mô tả 13 map, mô tả chiêu Di Sản, dòng sự kiện, chú thích Cài Đặt.
   Đây là phần còn lại sau khi 218 chuỗi ngắn đã xong; gom riêng để dễ đối chiếu khi lore đổi. */
Object.assign(EXACT, {
  'Chúng gọi nó là': 'They call it',
  'Dòng Máu Thức Tỉnh': 'Awakened Bloodline',
  'Mở nhánh Bản Năng nhanh hơn +25%': 'Unlocks Instinct branches +25% faster',
  '⬆ +2,5%Sát Thương/cấp (Lumen) · mốc 20/40/60/80/100/120 thêm phù trợ ·':
    '⬆ +2.5% Damage/level (Lumen) · milestones 20/40/60/80/100/120 add support ·',
  'Thanh chiêu chỉ có 4 ô, nhưng các chiêu dưới đây không hề mất giá trị — tự động dồn thành % Công Kích vĩnh viễn (hiện':
    'The bar holds only 4 slots, but the skills below are not wasted — they fold into permanent % ATK (shown',
  'chưa mở — mỗi cái một trại canh, mở một lần duy nhất':
    'unopened — each has its own warding camp, and opens only once',
  ': 3 trại sát nhau · 21 con · rơi đồ và Lumen ×1.6':
    ': 3 camps side by side · 21 monsters · item and Lumen drops ×1.6',

  // ── Mô tả chiêu Di Sản ──
  'Giáng vũ khí xuống đất — chấn động, hất văng & choáng nhẹ.':
    'Drives the weapon into the ground — a shockwave that flings back and briefly stuns.',
  'Cú đâm ngắn và nhanh, mũi kiếm lách qua khe giáp thay vì bổ vào mặt giáp.':
    'A short, quick thrust — the point slips through the gap in the armour instead of striking its face.',
  'Quay ngang cán giáo, đâm trọn một vòng — mọi kẻ đứng sát đều dính.':
    'Sweeps the polearm level and stabs a full circle — everything standing close is caught.',
  'Nhấc rìu quá đầu rồi bổ thẳng xuống — dồn cả trọng lượng người vào một nhát.':
    'Lifts the axe overhead and brings it straight down — the whole weight of the body in one blow.',
  'Tia lực xuyên giáp — sát thương ×2 và khóa chiêu địch 2.5s.':
    'An armour-piercing bolt of force — ×2 damage and locks the enemy out of skills for 2.5s.',
  'Sóng xung kích bóng tối quét sạch quanh người (sát thương lan lớn).':
    'A shadow shockwave sweeps everything around you (wide spreading damage).',

  // ── Mô tả 13 map (bảng Bản Đồ) ──
  'Plant Tribe Glade — trảng đất Plant Tribe bỏ lại từ hôm trời nứt, nay Axie Sa Ngã chiếm. Chưa có trụ nào ở đây, chỉ có hậu quả.':
    'Plant Tribe Glade — ground the Plant Tribe abandoned the day the sky split, now held by Fallen Axies. No pillar stands here, only the aftermath.',
  'Lối mòn men theo rẻo rừng, chạy mãi về đông. Cây khép hai bên, không có đường tắt.':
    'A trail hugging the woodstrip, running ever eastward. Trees close in on both sides; there is no shortcut.',
  'Khoảnh rừng Corran giữ riêng — bãi săn của người mới. Chimera yếu, đồ rơi nhập môn, chỗ hiền lành để học cách chơi. Ông ấy không nói vì sao lại giữ.':
    'The patch of woodland Corran kept for himself — a hunting ground for newcomers. Weak Chimeras, starter drops, a gentle place to learn the game. He never said why he kept it.',
  'Đất trũng xuống nơi vết nứt đi qua. Không ai giữ chỗ này, nên ai cũng lấy được — kể cả lấy của nhau.':
    'Land sunk in where the rift passed through. Nobody holds this place, so anybody may take from it — including from each other.',
  'Trụ Roost đóng thẳng xuống giữa ổ ấp. Bug Tribe Tunnels thì thầm: thứ nở ra ở đây không còn là Axie nữa.':
    'The Roost Pillar was driven straight down into the middle of the brood. Bug Tribe Tunnels whispers: what hatches here is no longer Axie.',
  'Nhịp đá vắt qua một hồ ngầm không đáy. Một lối, không có đường vòng — thứ chặn đường bạn phải dọn, không né được.':
    'A span of stone across a bottomless underground lake. One way across, no way around — whatever blocks you must be cleared, not avoided.',
  'Băng của Bird Tribe Heights là vết sẹo, không phải thời tiết. Bãi EXP khổng lồ — mang theo kháng độc, Chimera ở đây cắn có nọc.':
    'The ice of Bird Tribe Heights is a scar, not weather. A vast EXP ground — bring poison resistance; the Chimeras here bite with venom.',
  'Tướng Quân dựng đại bản doanh ngay trên Trụ Ashmark — hắn thôi không giấu nữa. Thảo nguyên đá nung, Chimera trâu bò đánh đau.':
    'The Warden raised his headquarters right on top of the Ashmark Pillar — he has stopped hiding. Kiln-baked steppe, and brutish Chimeras that hit hard.',
  'Trụ Dusk Marsh — trụ cuối cùng. Gỡ nó xuống là mở đúng cánh cửa Morvahn đang chờ. PK ở đây không cộng Tai Tiếng.':
    'The Dusk Marsh Pillar — the last one. Pulling it down opens exactly the door Morvahn is waiting for. PK here adds no Infamy.',
  'Đường nứt Thủ Hộ Vaeldra không kịp bịt, ăn thẳng xuống dưới lớp đá nền. Càng xuống sâu khí Morvahn càng đặc, và không tầng nào giống tầng nào.':
    "A fissure the Warders of Vaeldra could not seal in time, eating straight down beneath the bedrock. The deeper you go the thicker Morvahn's breath, and no two floors are alike.",
  'Khu phố Ardhaven rơi qua vết nứt còn nguyên khối — nguyên mái, nguyên giếng, nguyên cả biển hiệu. Dân bản địa dựng tường quanh nó và gọi chỗ này là Sapidae Chiefdom. Trong tường: Quảng Trường Atia, Phố Chợ, Phố Lò, Sân Chuồng, Sảnh Lệnh, Vách Gió và Xóm Trọ. Không Chimera nào vào được. Bốn cổng ra bốn hướng.':
    'The Ardhaven quarter fell through the rift in one piece — roofs intact, well intact, even the shop signs. The local people walled it round and named the place Sapidae Chiefdom. Within the walls: Atia Square, Market Row, Forge Row, the Stable Yard, the Hall of Orders, the Windwall and the Lodging Quarter. No Chimera can get in. Four gates, one to each quarter of the compass.',
  'Đất ngoài thành đang rung — chưa phải trụ, nhưng là dấu hiệu đầu tiên rằng có trụ đang lung lay. Đàn thú của người bản địa vẫn gặm cỏ ở đây, và vẫn chưa ai nói cho chúng biết.':
    'The ground outside the walls is trembling — not a pillar yet, but the first sign that one is working loose. The herds of the local people still graze here, and nobody has told them yet.',
  '"Trụ Werebear Woods do ta giữ." Một Tướng Quân đơn độc chống đỡ cả cánh rừng — trụ thứ nhất trong năm. Werebear vẫn sống theo bầy ở đây, và chúng hiền cho tới lúc bị chọc.':
    '"The Werebear Woods Pillar is mine to hold." A lone Warden braces an entire forest — the first of the five. Werebears still live in packs here, and they are gentle until provoked.',

  // ── Cài Đặt ──
  '(kéo gần thì mỗi khung hình chứa ít thế giới hơn — map thấy rộng hơn)':
    '(zoom in and each frame holds less world — the map feels larger)',
  '(Gọn: chỉ trùm, tinh anh, Tiếp Sức và con dưới con trỏ)':
    '(Compact: only bosses, elites, Relayers and whatever is under the cursor)',
  '(hạ xuống để chạy mượt trên máy yếu — chữ sẽ mềm hơn)':
    '(lower it to run smoothly on a weaker machine — text will look softer)',
  '— mức thấp tắt quầng sáng và lớp phủ, đổi lại khung hình mượt hơn nhiều.':
    '— the low setting drops glows and overlays, and buys a far smoother frame rate in return.',
  '(lưu lại rồi về màn chọn — xóa nhân vật chỉ làm được ở đó)':
    '(saves, then returns to the select screen — deleting a character can only be done there)',

  // ── Bảng Sự Kiện ──
  'Chạy theo giờ thật: Hung Thần 0h·4h·8h… · Xâm Lăng Vàng 2h·6h·10h… ·':
    'Runs on real time: The Dread One 00·04·08… · Golden Invasion 02·06·10… ·',
  '04:00 · Plant Tribe Glade — hạ trùm nhận Box Kundun lớn':
    '04:00 · Plant Tribe Glade — fell the boss for a large Box Kundun',
  '06:00 · 6 tiếng/lần (0h·6h·12h·18h) — nứt ở mọi bãi săn (cấp 15+), trùm luôn trên tầm bạn 6 cấp':
    '06:00 · every 6 hours (00·06·12·18) — rifts at every hunting ground (Lv 15+), the boss always 6 levels above you',
  '06:00 · Bird Tribe Heights — mỗi quái vàng rơi 1 Box Kundun (I-V theo map)':
    '06:00 · Bird Tribe Heights — every golden monster drops 1 Box Kundun (I-V by map)',
});

/* Ba dòng Vỉa Cốt trên Bảng Sự Kiện chỉ khác nhau tên map và tên Cốt — một quy tắc thay ba mục từ.
   Hẹp (neo cả hai đầu) nên unshift cho chắc, khỏi bị mấy cái bắt-tất nuốt như đợt trước. */
RULES.unshift(
  [/^(.+) — mỗi ngày MỘT lần, 3 mảnh Cốt (.+) \(28% ra Cổ\)\. Xem chấm kim cương trên bản đồ nhỏ\.$/,
    (m, map, cot) => `${tr(map)} — ONCE per day, 3 ${tr(cot)} Bone shards (28% Ancient). Look for the diamond dot on the minimap.`],
);

/* Đợt 3 — giao diện mới từ thượng nguồn (bảng Kỹ Năng thành CÂY có tab, bảng Bản Đồ hai tab,
   hai nút HUD mới). Gộp riêng để lần sau đối chiếu được: mỗi đợt giao diện mới là một đợt
   mục từ mới, và cách bắt vẫn là bật English rồi quét text node đang hiển thị. */
Object.assign(EXACT, {
  '🗺 Bản Đồ': '🗺 Map', '⏱ Sự Kiện': '⏱ Events',
  'Hiện Tại': 'Current', 'Thế Giới': 'World',
  'Đường nối là lối ĐI BỘ thật giữa hai vùng — suy thẳng từ cổng trong game.':
    'The lines are real ON-FOOT routes between regions — derived straight from the in-game gates.',
  // ── Bảng Kỹ Năng dạng cây ──
  'Lớp': 'Class', 'Khác': 'Other', '✦ Đại Thành': '✦ Mastery',
  // ⚠ Phụ đề tab Lớp ĐÃ ĐỔI khi cây nhận thêm bảy bị động chỉ số chung. Mục cũ
  // ('kỹ năng riêng của lớp, tự ngộ theo cấp') nay là chuỗi chết — sửa tiếng Việt ở game.js mà
  // quên bảng này thì người chơi tiếng Anh nhận lại nguyên tiếng Việt, và không bài nào đỏ.
  'chiêu riêng của lớp + 7 bị động chỉ số chung — tự ngộ theo cấp':
    'class skills + 7 shared stat passives — all learned automatically by level',
  // ── Bị động: hai họ, hai luật (xem CLAUDE.md) ──
  'Bị động': 'Passive', 'Bị động — chỉ số': 'Passive — stat', 'Bị động hiệu ứng': 'Passive — effect',
  // Tâm pháp — ba cặp khắc chế
  'Tâm pháp': 'Discipline', 'Tỉ lệ thi triển:': 'Proc chance:', 'Mức kháng:': 'Resistance:',
  'Bị khắc chế bởi:': 'Countered by:', 'Mở khoá:': 'Unlock:',
  'không tự ngộ theo cấp': 'never learned by level',
  'tâm pháp luôn chạy — không cần cắm vào ô': 'disciplines are always active — no slot needed',
  'kỹ năng chung + 6 tâm pháp — mở bằng cuốn ghép từ 3 Orb':
    'shared skills + 6 disciplines — unlocked by a tome forged from 3 Orbs',
  'Bị động — luôn có hiệu lực': 'Passive — always active',
  'Bị động hiệu ứng — cần một ô trên thanh': 'Effect passive — needs a bar slot',
  'Đang cộng:': 'Currently giving:',
  'bị động chỉ số luôn chạy — không cần cắm vào ô':
    'stat passives are always active — no slot needed',
  '◆ Đã đủ điều kiện': '◆ Requirements met',
  'Loại:': 'Type:', 'Chủ động': 'Active', 'Tiến độ:': 'Progress:', 'tới mốc': 'to milestone',
  'Hiệu quả:': 'Effect:', 'Tác dụng:': 'Does:', 'Thêm 1 cấp:': 'Per extra level:',
  'Tiến Hoá:': 'Evolution:', 'chưa — mốc đầu ở cấp 40': 'not yet — first milestone at Lv 40',
  'Điều kiện': 'Requirements', 'Cấp nhân vật:': 'Character level:',
  'Lumen tiêu hao:': 'Lumen cost:', 'Bản Năng tiêu hao:': 'Instinct cost:', 'Nâng Cấp': 'Upgrade',
  'Đang nằm ở': 'Sitting in', 'trên thanh chiêu — bấm phím': 'on the bar — press', 'để tung.': 'to cast.',
  '+2,5% Sát Thương · −0,25% hồi chiêu': '+2.5% Damage · −0.25% cooldown',
  'Chuột phải': 'Right-click',
});

/* Mấy dòng sinh theo dữ liệu — một quy tắc thay cho hàng chục mục từ. HẸP nên unshift. */
RULES.unshift(
  [/^Cấp: (\d+)$/, 'Lv: $1'],
  [/^\(đang (\d+)\)$/, '(now $1)'],
  [/^ô (\d+)$/, 'slot $1'],
  [/^Công Kích ×([\d.]+) · tầm (\d+) · phạm vi (\d+) · hồi (\d+)s · (\d+) Mana$/,
    'ATK ×$1 · range $2 · area $3 · cooldown $4s · $5 Mana'],
  [/^(\d{2}:\d{2}) · (.+) — hạ trùm nhận Box Kundun lớn$/,
    (m, gio, map) => `${gio} · ${tr(map)} — fell the boss for a large Box Kundun`],
  // Chú giải ô kỹ năng nằm TRÊN NHIỀU DÒNG trong một text node (xuống dòng đơn, không phải
  // dòng trống) nên nhánh tách đoạn của trCompute không đụng tới — phải khớp cả cụm bằng \s+.
  [/^\s*góc ô = nâng được ngay ·\s+ô mờ = chưa mở khoá · ô viền đứt = chưa gán kỹ năng\s*$/,
    'corner mark = upgradable now · dimmed = locked · dashed border = no skill assigned'],
);

/* Đợt 4 — hai bảng từ thượng nguồn: Tổ Đội (phím P) và Bạn Bè (phím H).
   Quét bằng đúng cách cũ (bật English rồi đọc text node đang hiển thị) ra 23 chuỗi, tất cả
   đều thuộc hai bảng này. ⚠ Chuỗi trên màn KHÔNG phủ hết bảng Bạn Bè: mọi nút trên từng
   DÒNG bạn (Chào · Xoá · Chặn · Nhận · Từ chối · Kết bạn…) và mọi câu báo lỗi trong `bbLam`
   chỉ hiện khi máy chủ trả về danh sách, mà bản tĩnh thì không có máy chủ. Nên khối này lấy
   thẳng từ NGUỒN (`renderFriendPanel` · `bbDong` · `bbLam` · `TD_CAI`), không lấy từ phép
   quét — quét chỉ chứng minh được cái ĐANG hiện, và đây là chỗ nó không đủ.
   `🇻🇳 Tiếng Việt` CỐ Ý giữ tiếng Việt: đó là nhãn chọn ngôn ngữ, dịch nó đi thì người đang
   lạc trong bản tiếng Anh mất luôn đường về. */
Object.assign(EXACT, {
  // ── Tổ Đội ──
  'Tổ Đội': 'Party', 'Trạng thái:': 'Status:', 'Chưa có tổ đội': 'No party',
  'Đội trưởng': 'Leader', 'Chỗ trống': 'Empty slot', 'Bạn': 'You',
  'Mời Vào Đội': 'Invite', 'Nhường Đội Trưởng': 'Pass Leader', 'Rời Đội': 'Leave Party',
  'Mở Bạn Bè': 'Open Friends', 'Cần máy chủ': 'Needs a server',
  'Không có tổ đội thì tự nhận lời mời': 'Auto-accept invites when not in a party',
  'Là đội trưởng thì tự cho người xin gia nhập': 'As leader, auto-admit join requests',
  'Hiện danh sách thành viên trên màn hình chính': 'Show the member list on the main screen',
  // ── Bạn Bè ──
  'Bạn Bè': 'Friends', 'Lời Mời': 'Invites', 'Tìm Người Chơi': 'Find Players', 'Sổ Đen': 'Blocklist',
  'Đang hỏi máy chủ…': 'Asking the server…',
  'Máy chủ chưa bật.': 'Server is not running.', 'Cần đăng nhập.': 'Sign-in required.',
  'Thử lại': 'Retry', 'Chưa vào game': 'Never played', 'Không tên': 'Unnamed',
  'Lời mời gửi tới bạn': 'Invites sent to you', 'Bạn đã gửi đi': 'Invites you sent',
  'Không có lời mời nào.': 'No invites.', 'Chưa gửi lời mời nào.': "You haven't sent any invites.",
  'Sổ đen trống.': 'Blocklist is empty.', 'Không thấy ai tên như vậy.': 'No player by that name.',
  'Đã có trong danh sách': 'Already on your list',
  'Gõ tên người chơi…': 'Type a player name…', 'Tìm': 'Search',
  '✓ Đã chào': '✓ Greeted', '👋 Chào': '👋 Greet', 'Xoá': 'Remove', 'Chặn': 'Block',
  'Bỏ chặn': 'Unblock', 'Nhận': 'Accept', 'Từ chối': 'Decline',
  'Huỷ lời mời': 'Cancel invite', 'Kết bạn': 'Add friend',
  'Hôm nay đã chào rồi — mai quay lại': 'Already greeted today — come back tomorrow',
  'Người trong sổ đen không gửi được lời mời tới bạn, và bạn không thấy lời mời của họ.':
    "Blocked players cannot send you invites, and you won't see theirs.",
  // Câu báo bay lên giữa màn (bbBao) — chỉ hiện khi có máy chủ, nên quét không thấy.
  'Không tự kết bạn với mình được': "You can't friend yourself",
  'Người này đã chặn bạn': 'This player has blocked you',
  'Hôm nay chào rồi — mai quay lại': 'Already greeted today — come back tomorrow',
  'Chưa phải bạn bè': 'Not friends yet', 'Lời mời không còn nữa': 'That invite is gone',
  'Không làm được': "Couldn't do that", 'Máy chủ không trả lời': 'Server did not respond',
  '🤝 Đã thành bạn!': '🤝 Now friends!', '✉ Đã gửi lời mời': '✉ Invite sent',
  'Đã cho vào sổ đen': 'Added to blocklist',
});

/* Mấy câu dài của hai bảng này nằm TRÊN NHIỀU DÒNG trong một text node (template literal có
   thụt đầu dòng, xuống dòng ĐƠN) nên nhánh tách đoạn `\n\s*\n` của trCompute không đụng tới.
   Phải khớp cả cụm bằng `\s+` — đúng cái bẫy đã ghi ở chú giải ô kỹ năng đợt 3.
   HẸP (neo cả hai đầu) nên unshift, khỏi bị mấy quy tắc bắt-tất nuốt. */
RULES.unshift(
  [/^Thêm 1 thành viên, đánh quái$/, 'Each extra member,'],
  // `+5% EXP` không có dấu tiếng Việt nên không cần quy tắc; `Cấp N` đã có sẵn ở khối gốc.
  [/^Cấp (\d+) · (.+)$/, (m, lv, lop) => `Lv ${lv} · ${tr(lop)}`],
  [/^Tổ đội cần máy chủ\.$/, 'Party needs a server.'],
  [/^Game hiện chạy trên một máy và lưu trong trình duyệt,\s+nên chưa có ai khác để rủ\. Khung bảng và các tuỳ chọn dưới đây dựng sẵn cho lúc máy chủ lên —\s+xem\s*$/,
    'The game currently runs on one machine and saves in your browser, so there is nobody to invite yet. '
    + 'This panel and the options below are built ahead of the server going live — see '],
  [/^Bạn Bè cần máy chủ để lưu quan hệ giữa các tài khoản\.\s+Bản chạy thử tĩnh không có phần này\.$/,
    'Friends needs a server to store relationships between accounts. This static build does not have one.'],
  [/^Danh sách bạn gắn với tài khoản, không gắn với máy —\s+đăng nhập rồi mở lại bảng này\.$/,
    'Your friend list belongs to your account, not to this machine — sign in, then reopen this panel.'],
  [/^Chưa có ai trong danh sách\.$/, 'Nobody on your list yet.'],
  [/^Sang tab (.+) để kết bạn\.$/, (m, tab) => `Head to the ${tr(tab)} tab to add someone.`],
  [/^Chỉ tìm được người$/, 'You can only find players'],
  [/^đã thật sự chơi$/, 'who have actually played'],
  [/^— tên có trong Bảng Xếp Hạng\.$/, '— names that appear on the Leaderboard.'],
  [/^Độ Thân Thiết$/, 'Closeness'],
  [/^tăng khi hai bên chào nhau —$/, 'grows when the two of you greet each other —'],
  [/^mỗi ngày một lần$/, 'once per day'],
  [/^\. Nó đếm số ngày hai người còn nhớ nhau, nên không mua được và không cày được\.$/,
    '. It counts the days you two still remember each other, so it cannot be bought or farmed.'],
  [/^♥ \+(\d+) Thân Thiết$/, '♥ +$1 Closeness'],
  [/^♥ (\d+)$/, '♥ $1'],
);

/* Đợt 5 — thanh chiêu KÉO THẢ từ thượng nguồn (`knGan` · `knGo` · `knOHopLe` + phần vẽ thanh
   trong bảng Kỹ Năng). Đây là đợt giao diện mới thứ ba liên tiếp; cách bắt vẫn thế.

   ⚠ BA ĐƯỜNG CHỮ KHÁC NHAU, và phép quét text node chỉ thấy MỘT:
     ① text node thường  → quét thấy (3 chuỗi)
     ② thuộc tính `title` → `trAttrs()` gọi `tr()` trên CẢ giá trị, mà giá trị là chuỗi GHÉP
        (tên chiêu + hậu tố + `\n` + câu nhắc) ⇒ phải bắt bằng RULES, không phải mục từ.
     ③ chữ bay trên canvas (`addFloat`) → sáu câu lý do của `knOHopLe`, chỉ hiện khi người chơi
        thả sai chỗ. Không lần nào quét thấy.
   Nên khối này lấy từ NGUỒN; quét chỉ dùng để xác nhận phần ① đã sạch. */
Object.assign(EXACT, {
  // ① thanh chiêu
  'Thanh chiêu — kéo chiêu từ cây thả vào ô · chuột phải để gỡ':
    'Skill bar — drag a skill from the tree into a slot · right-click to remove',
  'Di Sản còn': 'Legacy still grants',
  'Công Kích. Chiêu để ngoài thanh thì cộng %ST vĩnh viễn; kéo lên thanh thì bấm được nhưng mất khoản đó.':
    'ATK. A skill left off the bar grants permanent %DMG; drag it onto the bar and it becomes castable, but that bonus is gone.',
  'Công Kích — đã bỏ': 'ATK — gave up',
  'để bấm được. Chiêu để ngoài thanh thì cộng %ST vĩnh viễn; kéo lên thanh thì bấm được nhưng mất khoản đó.':
    'to make it castable. A skill left off the bar grants permanent %DMG; drag it onto the bar and it becomes castable, but that bonus is gone.',
  // ② tooltip ô trống
  'Ô 1 — chỉ nhận chiêu chủ động': 'Slot 1 — active skills only',
  'Ô trống — kéo chiêu vào': 'Empty slot — drag a skill here',
  // ③ lý do của knOHopLe, hiện thành chữ bay trên canvas
  'không có chiêu': 'no skill', 'ô không hợp lệ': 'invalid slot',
  'chiêu không có thật': 'no such skill', 'chưa mở khoá chiêu này': 'skill not unlocked yet',
  'ô 1 phải là chiêu chủ động': 'slot 1 must be an active skill',
  'ô 1 không được để trống': 'slot 1 cannot be empty',
});

/* Tooltip là chuỗi GHÉP quanh tên chiêu, và phần nhắc nằm sau một `\n` ĐƠN — nhánh tách đoạn
   `\n\s*\n` của trCompute không đụng tới, nên phải bắt cả cụm bằng `[\s\S]`.
   ⚠ THỨ TỰ TRONG LỜI GỌI unshift ĐƯỢC GIỮ (RULES thành [a,b,c,…cũ]), nên hai quy tắc có `\n`
   phải đứng TRƯỚC: chúng gọi `tr()` lại trên phần đầu, và chính lượt đệ quy ấy mới áp được
   `— bị động` / `— cấp N`. Đảo lại thì phần đầu không bao giờ được dịch. */
RULES.unshift(
  [/^([\s\S]+)\nĐang bỏ ([\d.,]+)% Công Kích Di Sản để bấm được$/,
    (m, dau, pct) => `${tr(dau)}\nGiving up ${pct}% Legacy ATK to make it castable`],
  [/^([\s\S]+)\nKéo xuống ô 1-4 để gán$/,
    (m, dau) => `${tr(dau)}\nDrag down to slot 1-4 to assign`],
  [/^(.+) — bị động$/, (m, ten) => `${tr(ten)} — passive`],
  [/^(.+) — cấp (\d+)$/, (m, ten, lv) => `${tr(ten)} — Lv ${lv}`],
);

/* Đợt 6 — LÒ KHẮC, mini-game roguelite chọn thẻ (docs/DAC_TA_LO_KHAC.md).
   Ba đường chữ khác nhau, và bỏ sót đường nào thì đường ấy ra tiếng Việt giữa một bản English:
     · nút/khung HTML của bảng chọn thẻ  → EXACT + RULES qua MutationObserver;
     · chữ nổi & banner & HUD vẽ trên CANVAS → cùng RULES, đi qua bản vá fillText;
     · tên map và tên cổng                → EXACT (chúng là dữ liệu, không ghép động).
   ⚠ Tên 18 lá thẻ phải nằm trong EXACT chứ KHÔNG dựng bằng quy tắc: quy tắc `(.+)` sẽ nuốt cả
   những chuỗi không phải tên thẻ, và tên thẻ còn được `tr()` gọi lại từ trong HUD lẫn chữ nổi. */
Object.assign(EXACT, {
  /* map · cổng */
  'Lò Khắc': 'The Carving Forge',
  'Rời Lò': 'Leave Forge',
  'Cửa Lò Khắc — 15 đợt, mỗi đợt khắc một nếp (cấp 15+)':
    'Carving Forge Door — 15 waves, one carving each (Lv 15+)',
  'Rời Lò Khắc → Sapidae Chiefdom': 'Leave the Carving Forge → Sapidae Chiefdom',
  'Một cái lò bỏ hoang trong lòng đá, dưới nền Sapidae Chiefdom. Thợ khắc đời trước tập nghề ở đây: khắc luật lên chính mình rồi để nó tan trước khi nguội. Nếp Khắc Vừa, đúng như giáo lý dạy.':
    'A forge abandoned in the rock beneath Sapidae Chiefdom. The carvers of old trained here: they cut a law into themselves, then let it fade before the iron cooled. The Measured Cut, exactly as the doctrine teaches.',
  /* bậc thẻ */
  'Thường': 'Common', 'Hiếm': 'Rare', 'Cổ Vật': 'Relic',
  /* 18 lá — tên */
  'Mài Lưỡi': 'Whetted Edge', 'Gân Thép': 'Steel Sinew', 'Bước Nhẹ': 'Light Step',
  'Nhịp Gấp': 'Quickened Beat', 'Mạch Rộng': 'Broad Channel', 'Mắt Sắc': 'Keen Eye',
  'Da Dày': 'Thick Hide', 'Tay Nhanh': 'Swift Hands',
  'Nổ Xác': 'Bursting Corpse', 'Hút Máu': 'Bloodletting', 'Giáp Gai': 'Barbed Plate',
  'Sương Băng': 'Rimefrost', 'Thu Hồn': 'Soul Draw',
  'Khắc Vào Mình': 'Carved Into Flesh', 'Nếp Vừa': 'The Measured Cut',
  'Hai Lưỡi': 'Twin Edge', 'Lò Chưa Nguội': 'The Forge Still Hot', 'Chồng Chất': 'Compounding',
  /* 18 lá — mô tả */
  '+16% Công Kích': '+16% Attack',
  '+14% Sinh Lực tối đa': '+14% max Health',
  '+10% tốc độ di chuyển': '+10% movement speed',
  '-10% thời gian hồi chiêu': '-10% skill cooldown',
  '+18% Mana tối đa': '+18% max Mana',
  '+5 điểm % Bạo Kích': '+5 percentage points of Critical',
  '+12% Phòng Thủ': '+12% Defence',
  '+8% tốc độ đánh': '+8% attack speed',
  'Quái chết thì nổ — 25% máu tối đa của nó lên mọi con trong 120px':
    'Slain foes burst — 25% of their max health to everything within 120px',
  'Hồi 4% sát thương gây ra': 'Heal for 4% of damage dealt',
  'Phản 30% sát thương nhận vào': 'Reflect 30% of damage taken',
  'Quái trúng đòn bị chậm 25% trong 2 giây': 'Struck foes are slowed 25% for 2 seconds',
  'Quái chết hồi 3% Mana': 'Slain foes restore 3% Mana',
  '+50% Công Kích, NHƯNG -30% Sinh Lực tối đa': '+50% Attack, BUT -30% max Health',
  'Dọn sạch mỗi đợt thì hồi ĐẦY Sinh Lực và Mana': 'Clearing a wave restores Health and Mana to FULL',
  'Đòn thường đánh thêm một nhát nữa, 55% sát thương': 'Basic attacks strike a second time for 55% damage',
  'Sát thương tăng 3%/giây trong đợt (trần +60%), về 0 khi sang đợt mới':
    'Damage climbs 3%/second within a wave (caps at +60%), resets each wave',
  'Mỗi đợt dọn sạch thì +6% sát thương, cộng dồn tới hết lượt':
    'Each wave cleared grants +6% damage, compounding for the whole run',
  /* bảng chọn thẻ · chữ nổi cố định */
  '◆ KHẮC MỘT NẾP': '◆ CUT ONE CARVING',
  /* ⚠ MỘT CÂU = MỘT NÚT VĂN BẢN. Bản đầu của bảng này xé câu ra làm bảy mảnh bằng ba thẻ <b>
     nằm GIỮA câu, và `trCompute` thì `.trim()` mảnh trước khi thử quy tắc — nên mảnh "Đợt "
     trở thành "Đợt", mọi quy tắc neo ^…$ trượt, và thứ hiện ra là nửa Anh nửa Việt trong cùng
     một dòng. Nay thẻ <b> chỉ bọc TRỌN một cụm, phần còn lại là một câu liền. */
  'đã sạch.': 'cleared.',
  'Chọn một lá Nếp Khắc — nếp chồng lên nhau và tan khi rời lò.':
    'Draw one Carving card — carvings stack, and they fade when you leave the forge.',
  '◆ Nếp Vừa — hồi đầy': '◆ The Measured Cut — fully restored',
  'Đợt trùm cần tự tay chiến — TỰ ĐÁNH đã tắt!': 'Boss waves must be fought by hand — AUTO turned off!',
  'ĐỢT CUỐI. Hạ nó là trọn lượt.': 'FINAL WAVE. Fell it and the run is complete.',
  'Đợt trùm — hạ nó để được chọn HAI lá': 'Boss wave — fell it to draw TWO cards',
  '◆ TRỌN LÒ KHẮC': '◆ CARVING FORGE COMPLETE',
});

RULES.unshift(
  /* Bảng chọn thẻ — hai câu HTML, đoạn thứ hai chỉ hiện ở đợt trùm. Thẻ `<b>` nằm giữa câu nên
     nút văn bản bị cắt làm ba: chuỗi tới đây KHÔNG có thẻ, chỉ có phần chữ giữa hai thẻ. */
  [/^Đợt (\d+)\/(\d+)$/, 'Wave $1/$2'],
  [/^Đợt trùm — còn (\d+) lượt chọn\.$/, 'Boss wave — $1 draw(s) remaining.'],
  [/^chồng tối đa (\d+)$/, 'stacks up to $1'],
  /* Cổng · chặn cửa */
  [/^Cần cấp (\d+) để vào Lò Khắc$/, 'Requires Lv $1 to enter the Carving Forge'],
  [/^Hết lượt Lò Khắc hôm nay \((\d+)\/ngày\)$/, 'No Carving Forge runs left today ($1/day)'],
  /* Banner đợt */
  [/^ĐỢT (\d+)\/(\d+)$/, 'WAVE $1/$2'],
  [/^ĐỢT (\d+) — (.+)$/, (m, a, b) => `WAVE ${a} — ${tr(b)}`],
  [/^(\d+) quái · máu ×([\d.,]+) — dọn sạch để khắc một nếp mới$/,
    '$1 foes · health ×$2 — clear it to cut a new carving'],
  [/^Đợt (\d+) sạch — \+([\d.,]+)◈ · \+(\d+) Bản Năng$/,
    'Wave $1 cleared — +$2◈ · +$3 Instinct'],
  [/^◆ Nếp Khắc — (.+)!$/, (m, a) => `◆ Carving — ${tr(a)}!`],
  /* Kết lượt · gục */
  [/^◆ RỜI LÒ Ở ĐỢT (\d+)$/, '◆ LEFT THE FORGE AT WAVE $1'],
  [/^☠ GỤC Ở ĐỢT (\d+)$/, '☠ FELL AT WAVE $1'],
  [/^\+([\d.,]+)◈ Lumen · \+(\d+) Bản Năng(.*)$/, (m, a, b, c) => `+${a}◈ Lumen · +${b} Instinct${trFrag(c)}`],
  [/^Nếp Khắc tan hết, nhưng phần thưởng đã ăn thì giữ: \+([\d.,]+)◈ · \+(\d+) Bản Năng\.$/,
    'Every carving fades, but what you already banked is yours: +$1◈ · +$2 Instinct.'],
  /* HUD */
  [/^LÒ KHẮC · Đợt (\d+)\/(\d+) · còn (\d+) quái · (\d+) nếp$/,
    'CARVING FORGE · Wave $1/$2 · $3 foes left · $4 carvings'],
  [/^Kho: ([\d.,]+)◈ · (\d+) Bản Năng — chết vẫn giữ$/,
    'Banked: $1◈ · $2 Instinct — kept even if you fall'],
  /* Danh sách nếp đang cầm: một chuỗi tên nối bằng ` · `, mỗi tên có thể kèm `×N`. Phải có
     tiền tố `Nếp: ` mới bắt được — không có nó thì quy tắc phải là `(.+) · (.+)` và nó sẽ
     nuốt hàng trăm chuỗi khác trong game. */
  [/^Nếp: (.+)$/, (m, ds) => 'Carvings: ' + ds.split(' · ').map(x => {
    const mm = x.match(/^(.+?)(×\d+)?$/);
    return tr(mm[1]) + (mm[2] || '');
  }).join(' · ')],
);

const _trCache = new Map();
/* ═══ ĐỢT PHỦ TIẾNG ANH — sinh từ PHÉP ĐO, không từ cảm giác ═════════════════════════════
   Quét `?lang=en` bằng recorder cài TRƯỚC lang.js (addInitScript) nên nó đọc được chữ ĐÃ dịch,
   tức thứ người chơi thật sự thấy. ⚠ Bọc `fillText` lúc chạy là bọc NGOÀI lớp vá này ⇒ chỉ đọc
   được chuỗi NGUỒN, và nó báo 84,3% tiếng Việt trong khi con số thật là 61,4%. Một que dò sai
   thứ tự thì cho ra một con số trông rất thuyết phục.
   Đo được trước đợt này: canvas 43/70 chuỗi · DOM 48 dòng còn tiếng Việt. */
RULES.push(
  // 22 chiêu tự ngộ dùng CHUNG một câu ⇒ một mẫu trả 22 chuỗi, không phải 22 mục từ điển.
  [/^✦ Ngộ được: (.+)!$/,                        (m, a) => `✦ Learned: ${tr(a)}!`],
  [/^🚩 Đã mở khoá điểm dịch chuyển: (.+)$/,      (m, a) => `🚩 Waypoint unlocked: ${tr(a)}`],
  [/^🚩 Săn (.+)$/,                               (m, a) => `🚩 Hunt ${tr(a)}`],
  // ⚠ Băng-rôn vào map và tiêu đề bảng Bản Đồ mang TIỀN TỐ, nên tên map đã có trong EXACT vẫn
  // trượt. Bóc tiền tố rồi gọi lại `tr` là một mẫu phục vụ mọi map, kể cả map thêm sau.
  [/^⟶\s+(.+)$/,                                  (m, a) => `⟶  ${tr(a)}`],
  [/^🗺 (.+)$/,                                   (m, a) => `🗺 ${tr(a)}`],
  [/^(Công Kích|Sức Mạnh Phép Thuật) ×([\d.]+) · tầm (\d+) · phạm vi (\d+) · hồi ([\d.]+)s · (\d+) Mana$/,
    (m, a, b, c, d, e, f) =>
      `${a === 'Công Kích' ? 'ATK' : 'Magic Power'} ×${b} · range ${c} · area ${d} · cd ${e}s · ${f} Mana`],
  [/^Thuần (\d)\/6$/,                             (m, a) => `Pure ${a}/6`],
  [/^Tiềm Năng:$/,                                () => 'Potential:'],
  [/^Vaeldra · (.+) — \+([\d.]+)% Công Kích vĩnh viễn \(xem ở bảng Kỹ Năng — phím K\)$/,
    (m, a, b) => `Vaeldra · ${tr(a)} — +${b}% permanent ATK (see the Skills panel — K)`]
);

Object.assign(EXACT, {
  // ── nhãn công trình vẽ THẲNG lên canvas (`NHAN_NHA`) ──
  'Chuồng': 'Stable',
  'Truy Nã': 'Bounty',
  'Quán Trọ': 'Inn',
  'Vực Thẳm': 'The Abyss',
  'Tiệm Thuốc': 'Apothecary',
  'Cầu May': 'Fortune',
  'Quán Sách': 'Bookshop',
  'Lò Rèn': 'Forge',
  'Sàn Đấu': 'Arena',

  // ── Menu Hệ Thống (F6) ──
  'Menu Hệ Thống': 'System Menu',
  'Sự Kiện': 'Events',
  'Ngân Hàng Ngọc': 'Jewel Bank',
  'Lệnh Nhặt': 'Pickup Rules',
  'Ấn Giao Kết:': 'Covenant Seals:',

  // ── mảnh rời của bảng Nhân Vật / Kỹ Năng ──
  '✦ Nâng Cấp': '✦ Upgrade',
  '📜 Dùng Sách': '📜 Use Book',
  '+1 Tiềm Năng': '+1 Potential',
  'Hệ phòng thủ': 'Defense element',
  'Hệ đòn đánh': 'Attack element',
  'Cấu tạo Axie': 'Axie build',
  '(sáu bộ phận)': '(six parts)',
  '(vũ khí)': '(weapon)',
  'DI SẢN': 'LEGACY',

  // ⚠ SÁU MẢNH RỜI CỦA DÒNG BẢN SẮC — `banSacHtml()` dựng câu bằng template literal có thẻ
  // <b>/<span> chen vào, nên MutationObserver thấy SÁU text-node rời chứ không thấy một câu.
  // Thiếu chúng thì dòng ra nửa Anh nửa Việt ("◆ Land of Brooding Wraith 35% · lớp ♣ Plant 71%
  // · mang Beast · Bug · Mech tới · nơi source of Bone Petal") — tệ hơn hẳn chưa dịch, vì nó
  // đọc ra như một lỗi chứ không ra như một chỗ chưa làm.
  'lớp': 'class',
  'mang': 'bring',
  'tới': 'here',

  // ── băng-rôn chế độ thử + câu dẫn đầu game ──
  'Chế độ test — mặc sẵn nguyên bộ giai 1 và vũ khí của lớp':
    'Test mode — you start wearing a full tier-1 set and your class weapon',
  'TEST MODE — nhấn ` (phím dưới Esc) mở console, gõ /help xem lệnh':
    'TEST MODE — press ` (below Esc) for the console, type /help for commands',
  'Sapidae Chiefdom — hãy đến gặp Trưởng Lão Rell (lại gần, nhấn E)!':
    'Sapidae Chiefdom — go and find Elder Rell (walk up, press E)!',
  'Hộ thể tái tụ!': 'Barrier reformed!',
});


Object.assign(EXACT, {
  // ⚠ Node thật là "tới · nơi" (dấu · là chỗ `bits.join(' · ')` nối hai mệnh đề), nên mục
  // '· nơi' có sẵn không khớp. Và ĐỪNG thêm 'duy nhất'/'nơi' rời: dòng 797 đã khai
  // 'duy nhất':'source', đè lên nó là câu ra "the only of Bone Petal" — tôi đã làm đúng thế
  // một lần, và nó chỉ lộ ra ở lượt ĐO LẠI chứ không ném lỗi nào.
  'tới · nơi': 'here · only',
  'Lò Hỗn Độn': 'Chaos Forge',
  // hạng cấu tạo Axie (`bpHang()`), vẽ rời khỏi số nên phải dịch riêng
  'Thuần': 'Pure',
  'Tạp': 'Mixed',
  // bia đá cạnh Suối Ký Ức — xem chú thích ở `game.js`, chỗ này từng khắc chữ kiếm hiệp
  'Khắc': 'Cut',
  'Vừa': 'Even',
});
RULES.push(
  [/^Điểm tiềm năng còn: (\d+) \(mỗi cấp \+5\) — cộng chỉ số bên dưới, hoặc rót vào chiêu ở bảng Kỹ Năng \(K, trần (\d+) điểm mỗi chiêu\)$/,
    (m, a, b) => `Potential points left: ${a} (+5 per level) — spend them on the stats below, or pour them into a skill in the Skills panel (K, cap ${b} per skill)`],
  [/^💡 (.+) ra Công Kích từ (.+) — dồn điểm vào đó là hiệu quả nhất\.$/,
    (m, a, b) => `💡 ${tr(a)} draws ATK from ${tr(b)} — pouring points there is the most efficient.`],
  [/^(.+) thì lớp nào cũng cần — khoảng 50-100 điểm là phòng thủ chạm trần, phần còn lại dồn vào dòng sát thương\.$/,
    (m, a) => `${tr(a)} is worth it on every class — about 50-100 points caps your defense, put the rest into your damage stat.`],
  [/^\(\+(\d+)% sát thương · còn (\d+) điểm\)$/, (m, a, b) => `(+${a}% damage · ${b} points left)`],
  [/^(.+) \(Phòng thủ, tốc đánh, bạo kích, né tránh \+ Công kích \(tùy lớp\)\)$/,
    (m, a) => `${tr(a)} (Defense, attack speed, crit, dodge + ATK (class-dependent))`]
);


/* ⚠ DỊCH THEO **MẢNH**, KHÔNG THEO CÂU GHÉP. Năm luật viết cho câu đầy đủ ở khối trên KHÔNG
   bắn một lần nào: chuỗi nguồn có <b>/<span> chen giữa, nên MutationObserver thấy nhiều
   text-node rời. `innerText` thì nối chúng lại, nên phép đo đọc ra một câu — và tôi viết luật
   cho cái câu ấy, thứ chưa bao giờ tồn tại dưới dạng một node. */
Object.assign(EXACT, {
  '(mỗi cấp +5) — cộng chỉ số bên dưới, hoặc rót vào chiêu ở bảng Kỹ Năng (':
    '(+5 per level) — spend them on the stats below, or pour them into a skill in the Skills panel (',
  ', trần': ', cap',
  'điểm mỗi chiêu)': 'points per skill)',
  '— dồn điểm vào đó là hiệu quả nhất.': '— pouring points there is the most efficient.',
  'thì lớp nào cũng cần — khoảng 50-100 điểm là phòng thủ chạm trần, phần còn lại dồn vào dòng sát thương.':
    'is worth points on every class — 50-100 caps your defense, put the rest into your damage stat.',
  '(Phòng thủ, tốc đánh, bạo kích, né tránh + Công kích (tùy lớp))':
    '(Defense, attack speed, crit, dodge + ATK (class-dependent))',
  '(Công kích (tùy lớp), sát thương phi tiêu)': '(ATK (class-dependent), throwing damage)',
  '(Máu tối đa và tốc hồi phục)': '(Max HP and regen rate)',
  'điểm)': 'points)',
});
RULES.push(
  [/^💡 (.+) ra Công Kích từ$/,        (m, a) => `💡 ${tr(a)} draws ATK from`],
  [/^\(\+(\d+)% sát thương · còn$/,    (m, a) => `(+${a}% damage ·`]
);


/* ═══ LORE CỦA MAP + BỘ DANH TỪ RIÊNG CANON ══════════════════════════════════════════════
   Bảng Bản Đồ là chỗ giám khảo đọc nhiều nhất sau màn chờ, và trước đợt này nó ra 18 dòng
   tiếng Việt nguyên khối. Khoá ở đây là chuỗi ĐÚNG NHƯ DOM ĐANG CHỨA — lấy từ bản quét, không
   chép tay từ `canbang.js`: hai chỗ đó có thể lệch nhau một dấu cách và không gì báo.
   Giọng giữ MU S6: mộc, hơi cổ, không một chữ kiếm hiệp. Danh từ riêng chốt một lần ở đây. */
Object.assign(EXACT, {
  // ── danh từ riêng canon ──
  'Nhát Gọi': 'the Summoning Cut',
  'Cây Hồn': 'the Soul Tree',
  'Nếp Khắc Vừa': 'the Measured Cut',
  'Rune Giữ Đàn': 'the Rune of the Herd',
  'Rune Giữ Bờ': 'the Rune of the Bound',
  'Rune Giữ Mùa': 'the Rune of Seasons',
  'Rune Giữ Tên': 'the Rune of Names',
  'Rune Giữ Khúc': 'the Rune of the Song',
  'Rune Giữ Lửa': 'the Rune of the Flame',
  'Rune Giữ Đường': 'the Rune of the Way',

  // ── lore từng vùng ──
  'Luống ấp Plant Tribe lẽ ra nở tháng trước — Rune Giữ Mùa ở đây đã mỏng. Nay là đất PK, hạ người khác được mà bị hạ cũng được. Axie Sa Ngã dạt về từ phía rẻo rừng, Golem thì ngủ ngay trên luống cũ.':
    'The Plant Tribe hatching beds should have opened a month ago — the Rune of Seasons here has worn thin. This is PK ground now: you can cut others down, and be cut down. Fallen Axies drift in from the woodstrip, and Golems sleep right on the old beds.',

  'Khu phố Ardhaven đi qua Nhát Gọi còn nguyên khối — nguyên mái, nguyên giếng, nguyên cả cái lò. Lunacia khắc Rune lên trời để xin đúng cái lò này, nên thành không phải đống đổ nát: nó là câu trả lời. Dân bản địa dựng tường quanh và gọi chỗ này là Sapidae Chiefdom. Trong tường: Quảng Trường Atia, Phố Chợ, Phố Lò, Sân Chuồng, Sảnh Lệnh, Vách Gió và Xóm Trọ. Không Chimera nào vào được. Bốn cổng ra bốn hướng.':
    'The Ardhaven district came through the Summoning Cut in one piece — roofs, well and forge intact. Lunacia carved a Rune into the sky asking for exactly that forge, so the town is not wreckage: it is the answer. The locals walled it round and named it Sapidae Chiefdom. Inside the wall: Atia Square, Market Row, Forge Row, the Stable Yard, the Writ Hall, Windwall and the Lodging Quarter. No Chimera gets in. Four gates, four directions.',

  'Rune Giữ Đàn cắm giữa đồng cỏ này, và đàn gia súc đã bắt đầu tan mỗi lần có tiếng động — phiến đá đầu tiên mỏng đi là phiến đá này. Trại Gloam chặn đường, bầy Gai Tím rình rập ven rừng. Không PK, đất an toàn để luyện cấp.':
    'The Rune of the Herd stands in this grassland, and the herds have begun to scatter at every loud noise — this is the first slab to wear thin. A Gloam camp blocks the road and Thornspine packs lurk at the treeline. No PK; safe ground to level on.',

  'Rune Giữ Bờ đứng ở đây để rừng không lấn qua bờ vào đất người ở — và rừng đang lấn. Từ đây là đất PK: hạ người khác được, bị hạ cũng được. Chimera ở đây rơi Cốt bậc đầu.':
    'The Rune of the Bound stands here so the forest does not cross the line into settled land — and the forest is crossing. From here on it is PK ground: you can cut others down, and be cut down. The Chimera here drop first-tier Bone.',

  'Lối mòn men theo rẻo rừng, chạy mãi về đông. Một lối mòn không phải một nơi, nên không có cái luật nào để mà khắc — cây khép hai bên, không đường tắt.':
    'A trail hugging the woodstrip, running east without end. A trail is not a place, so there is no law here to carve — trees close on both sides, and there is no shortcut.',

  'Khoảnh rừng có người giữ riêng — bãi săn của người mới. Chimera yếu, đồ rơi nhập môn, chỗ hiền lành để học cách chơi. Không phiến Rune nào cắm ở đây: rễ Cây Hồn chạy ngầm dưới đất này, và không ai dám khắc đá lên rễ.':
    'A kept strip of woodland — the beginners’ hunting ground. Weak Chimera, starter drops, a gentle place to learn the game. No Rune is set here: the roots of the Soul Tree run beneath this soil, and nobody dares carve stone over a root.',

  'Đất trũng xuống ngay dưới Nhát Gọi — cắm đá xuống đây thì đá nứt, nên không phiến Rune nào giữ chỗ này. Không luật nào giữ thì ai cũng lấy được, kể cả lấy của nhau.':
    'A hollow directly beneath the Summoning Cut — set a slab here and the stone splits, so no Rune holds this ground. Where no law holds, anyone may take — including from each other.',

  'Nghề khắc Rune bắt đầu ở đây: Rune Giữ Tên nằm dưới ổ ấp, trứng nào nở cũng phải xin nó một cái tên. Hang ổ hẹp, ngoằn ngoèo, bầy Chimera dày đặc rơi nguyên liệu thăng giai — bãi săn tranh chấp.':
    'The Rune-carving craft began here: the Rune of Names lies under the hatchery, and every egg that opens must ask it for a name. Tight winding burrows, dense Chimera packs dropping tier-up materials — contested hunting ground.',

  'Nhịp đá vắt qua một hồ ngầm không đáy — không có nền để cắm phiến Rune nào, nên thứ dưới đó trồi lên lúc nào cũng được. Một lối, không đường vòng: thứ chặn đường bạn phải dọn, không né được.':
    'A stone span over a bottomless underground lake — no bed to set a Rune into, so whatever is down there may surface at any time. One path, no way around: whatever blocks it, you clear, you do not dodge.',

  'Ba tổ trên cao đã ngừng hát — Rune Giữ Khúc mỏng thì khúc hát tắt theo người hát. Bãi EXP khổng lồ; mang theo kháng độc, Chimera ở đây cắn có nọc.':
    'The three high roosts have stopped singing — when the Rune of the Song wears thin, the song dies with the singer. Enormous EXP ground; bring poison resistance, the Chimera here bite with venom.',

  'Tướng Quân dựng lều ngay trên Rune Giữ Lửa, nên mỏ nào cũng tắt lửa qua đêm. Thảo nguyên mở rộng, Chimera trâu bò đánh đau, rơi nguyên liệu nâng chiêu tầm xa và đao pháp.':
    'A Warden pitched camp directly on the Rune of the Flame, so every forge here goes cold overnight. Wide open flats, heavy-hitting Chimera, dropping materials for ranged and blade skill upgrades.',

  'Phiến thứ bảy — Rune Giữ Đường — cắm ở cửa Cây Hồn, và nó là thứ chỉ đường cho hồn quay về. Bãi luyện cuối game; PK ở đây không cộng Tội Ác, Chimera rơi trang bị bậc vàng.':
    'The seventh slab — the Rune of the Way — is set at the door of the Soul Tree, and it is what lights the road home for the dead. End-game grinding ground; PK here adds no Outlaw status, and the Chimera drop gold-tier gear.',

  'Đường nứt ăn thẳng xuống dưới lớp đá nền, mọc ra từ hôm Nhát Gọi khắc lên trời. Càng xuống sâu càng xa mọi phiến Rune, nên không tầng nào giống tầng nào — và không tầng nào có luật.':
    'A fissure driving straight down through the bedrock, opened the day the Summoning Cut was carved into the sky. The deeper you go the further from any Rune, so no floor is like another — and no floor has a law.',

  'Bảy người lính Vaeldra qua Nhát Gọi mang theo một cái lò và một thói quen: sáng nào cũng có hai người xuống sân mà thử nhau. Sân ấy còn đây. Không có gì để đào, không có gì để giết — chỉ có người đứng đối diện.':
    'Seven Vaeldra soldiers came through the Summoning Cut carrying a forge and a habit: every morning two of them went down to the yard and tested each other. The yard is still here. Nothing to mine, nothing to kill — only the person standing opposite you.',
});
RULES.push(
  [/^(.+) · Lv — PHÓ BẢN$/,                  (m, a) => `${tr(a)} · Lv — DUNGEON`],
  [/^(.+) · Lv — Bloodbath · Free PK$/,       (m, a) => `${tr(a)} · Lv — Bloodbath · Free PK`],
  [/^🧭 On foot: (.+)$/,                      (m, a) => `🧭 On foot: ${a.split(' · ').map(x => tr(x)).join(' · ')}`]
);


/* ── vét nốt bốn chỗ cuối. ⚠ Ba trong bốn TRƯỢT ở lượt trước vì tôi neo `^…$`: node thật còn
   dính số hoặc dính phần đuôi của template (`<b>K</b>, trần 5 điểm mỗi chiêu)`), nên luật
   neo hai đầu không bao giờ khớp. Luật KHÔNG neo thì `s.replace` chỉ thay đúng đoạn khớp. */
RULES.push(
  [/, trần (\d+) điểm mỗi chiêu\)/,  ', cap $1 per skill)'],
  [/PHÓ BẢN/,                        'DUNGEON'],
  [/Sàn Đấu Ardhaven/,               'Ardhaven Arena']
);
Object.assign(EXACT, {
  'Sàn Đấu Ardhaven': 'Ardhaven Arena',
  // băng-rôn lúc vào map: `REGION_UNLOCK_LORE` + lời nhắc hệ phòng thủ, nối bằng ' · '
  'Rẻo Rừng Corran — khoảnh rừng đầu tiên ngoài tường thành. Không phiến Rune nào ở đây: rễ Cây Hồn chạy ngầm dưới đất này.':
    'Corran Woodstrip — the first stretch of forest outside the wall. No Rune is set here: the roots of the Soul Tree run beneath this soil.',
});
RULES.push(
  // Lời nhắc "nên cầm con Axie nào tới đây" — một mẫu phục vụ cả 11 vùng × 9 lớp Axie.
  [/^⚠ Axie (\S+) (\w+) ăn đòn NẶNG hơn (\d+)% ở đất (\w+) — đổi sang (.+) thì chịu đòn nhẹ hơn \(phím C → Khế Ước\)$/,
    (m, g, a, n, d, ds) =>
      `⚠ A ${g} ${a} Axie takes ${n}% MORE damage on ${d} ground — switch to ${ds} to take less (press C → Covenant)`],
  // Băng-rôn ghép hai mệnh đề bằng ' · ' — dịch từng vế rồi nối lại, để thêm vế thứ ba sau này
  // không phải viết thêm luật nào.
  [/^(.+) · (⚠ Axie .+)$/, (m, a, b) => `${tr(a)} · ${tr(b)}`]
);


/* ── SÁU BẢNG BỘ QUÉT ĐẦU KHÔNG BIẾT TỚI ─────────────────────────────────────────────────
   `bag · qlog · settings · ngocbank · nhat · stage` — bộ quét đầu chỉ biết chín bảng nên nó
   báo "0 dòng còn tiếng Việt" trong khi sáu bảng này còn nguyên 42 dòng. Đó là lý do
   `tests/test_dichen.js` liệt kê tên bảng ra ĐỦ rồi mới chấm, và đỏ ngay khi thiếu một cái. */
Object.assign(EXACT, {
  // ── Nhật Ký / Mục Tiêu Hôm Nay ──
  'Đang Làm': 'Active', 'Chính': 'Main', 'Phụ': 'Side', 'Ký Sự': 'Chronicle',
  '▾ Thu gọn': '▾ Collapse',
  'Hạ 1 Trùm Vùng': 'Kill 1 Zone Warden',
  'Khai 1 Vỉa Cốt': 'Open 1 Bone Vein',
  'Xong Truy Nã Lệnh': 'Finish a Bounty Writ',
  'Rèn / nâng tầng / khảm ngọc 2 lần': 'Forge / tier up / socket a jewel 2 times',

  // ── Cài Đặt ──
  'Thiết Lập': 'Settings', 'Phím Tắt': 'Hotkeys',
  '—  ÂM THANH —': '—  AUDIO —',
  'Toàn bộ âm thanh (phím L · cũng có nút loa cạnh đồng hồ góc trái)':
    'All audio (press L · there is also a speaker button by the clock, top left)',
  'Nhạc nền': 'Music', 'Hiệu ứng âm thanh': 'Sound effects',
  'GẦN VỪA XA': 'NEAR MID FAR',
  'OFF GỌN FULL': 'OFF LEAN FULL',
  'OFF NHẸ FULL': 'OFF LIGHT FULL',

  // ── Ngân Hàng Ngọc ──
  'đang cất 0': '0 stored',
  'Chúc Phúc Châu': 'Jewel of Bless', 'Linh Hồn Châu': 'Jewel of Soul',
  'Sinh Mệnh Châu': 'Jewel of Life', 'Hỗn Độn Châu': 'Jewel of Chaos',
  '⬇ Gửi hết': '⬇ Deposit all',
  'Tự động gửi ngọc khi nhặt': 'Auto-deposit jewels on pickup',
  'Ngọc đang cất không tiêu được — Lò Hỗn Độn và phép ép ngọc chỉ đọc số trong túi. Đó là điều làm cái ngăn này có nghĩa thật chứ không phải chuyển số qua lại.':
    'Stored jewels cannot be spent — the Chaos Forge and direct socketing only read what is in your bag. That is what makes this vault mean something instead of shuffling a number back and forth.',

  // ── Lệnh Nhặt / Túi Đồ ──
  'game tự làm gì với thứ vừa rơi ra': 'what the game does with whatever just dropped',
  '◈ Tự gửi ngọc vào Ngân Hàng khi nhặt (nhặt xong vào thẳng ngăn cất)':
    '◈ Auto-send jewels to the Bank on pickup (straight into the vault)',
  '💰 Tự bán đồ trơn khi nhặt (đồ không Vận, không Hoàn Hảo, chưa rèn)':
    '💰 Auto-sell plain gear on pickup (no Luck, not Excellent, unforged)',
  '🛡 Tự mặc món mạnh hơn (chỉ đổi khi lực chiến cao hơn rõ rệt)':
    '🛡 Auto-equip stronger gear (only swaps on a clear power gain)',
  '🗑 Mức dọn túi hàng loạt': '🗑 Bulk bag-clear level',
  'chỉ đồ trơn': 'plain gear only',
  'đồ trơn + đồ có Vận': 'plain gear + Luck gear',
  'mọi món chưa rèn, trừ Hoàn Hảo': 'everything unforged, except Excellent',
  '⚙ Mở Cài Đặt': '⚙ Open Settings',

  // ── chỉ đường tới thợ rèn (canvas) ──
  '🚩 Thợ Rèn Lưu Vong': '🚩 Exiled Smith',
  '⚒ Phải đứng cạnh Thợ Rèn mới rèn được — đang chỉ đường':
    '⚒ You must stand by the Smith to forge — guiding you there',
});
RULES.push(
  [/^Hạ (\d+) Chimera$/,        (m, a) => `Kill ${a} Chimera`],
  [/^(\d+) bước$/,              (m, a) => `${a} steps`],
  [/^×(\d+) trong túi$/,        (m, a) => `×${a} in bag`],
  [/^đang cất (\d+)$/,          (m, a) => `${a} stored`],
  [/Khi bật Tự Đánh \(Z\), tầm hút đồ nới gấp ba/, 'With Auto-Attack (Z) on, pickup range triples'],
  [/Lớp tầm xa giết quái cách 200px, nên không nới thì cày cả tiếng xong bỏ lại nguyên bãi đồ dưới đất\./,
    'Ranged classes kill 200px away, so without that you grind for an hour and leave the whole field of loot behind.'],
  [/đang quét quanh điểm neo (\d+)px/, (m, a) => `currently sweeping ${a}px around the anchor`]
);


/* ── KHOÁ LẤY TỪ TỪNG **TEXT-NODE**, không lấy từ `innerText` ────────────────────────────
   `innerText` NỐI các node lại, nên chuỗi nó trả về là một câu chưa từng tồn tại dưới dạng
   một node — viết khoá theo nó thì không mục nào bắn. Đây là lần thứ BA cùng một cái bẫy
   trong đợt này. Bảng dưới lấy bằng TreeWalker trên chính bảng đang mở. */
Object.assign(EXACT, {
  // ── Cài Đặt ──
  'ÂM THANH —': 'AUDIO —',
  'Toàn bộ âm thanh': 'All audio',
  '(phím L · cũng có nút loa cạnh đồng hồ góc trái)':
    '(press L · there is also a speaker button by the clock, top left)',
  'GẦN': 'NEAR', 'VỪA': 'MID', 'GỌN': 'LEAN', 'NHẸ': 'LIGHT',
  '🇻🇳 Tiếng Việt': '🇻🇳 Vietnamese',
  'Tắt âm thanh (phím L)': 'Mute (press L)',
  'Bản đồ thu nhỏ (U)': 'Minimap (U)',
  '👁 Ẩn': '👁 Hide',
  'Vùng': 'Zone',
  '⬆ RÚT LUI mang kho tạm về': '⬆ WITHDRAW and keep the run stash',

  // ── màn chờ: thứ giám khảo thấy TRƯỚC TIÊN ──
  'Vào Game': 'Enter',
  'Tạo Nhân Vật Mới': 'New Character',
  '← Quay Lại Danh Sách': '← Back to Roster',
  'Mở Khế Ước': 'Open Covenant',

  // ── Ngân Hàng Ngọc ──
  'Ngọc đang cất': 'Stored jewels',
  'không tiêu được': 'cannot be spent',
  '— Lò Hỗn Độn và phép ép ngọc chỉ đọc số trong túi. Đó là điều làm cái ngăn này có nghĩa thật chứ không phải chuyển số qua lại.':
    '— the Chaos Forge and direct socketing only read what is in your bag. That is what makes this vault mean something instead of shuffling a number back and forth.',

  // ── Lệnh Nhặt ──
  '◈ Tự gửi ngọc vào Ngân Hàng khi nhặt': '◈ Auto-send jewels to the Bank on pickup',
  '(nhặt xong vào thẳng ngăn cất)': '(straight into the vault)',
  '💰 Tự bán đồ trơn khi nhặt': '💰 Auto-sell plain gear on pickup',
  '(đồ không Vận, không Hoàn Hảo, chưa rèn)': '(no Luck, not Excellent, unforged)',
  '🛡 Tự mặc món mạnh hơn': '🛡 Auto-equip stronger gear',
  '(chỉ đổi khi lực chiến cao hơn rõ rệt)': '(only swaps on a clear power gain)',
  'Khi bật': 'With',
  'Tự Đánh (Z)': 'Auto-Attack (Z)',
  ', tầm hút đồ nới gấp ba — đang quét quanh điểm neo':
    ' on, pickup range triples — currently sweeping around the anchor at',
});
// ⚠ PHẢI `unshift`, KHÔNG `push`. Luật có sẵn `/^×(\d+) (.*)$/` khớp trước và trả về
// `×0 ` + trFrag('trong túi') — mà 'trong túi' không có trong TERMS, nên nó đi qua nguyên vẹn.
// RULES quét theo THỨ TỰ và cái khớp đầu tiên thắng: thêm vào cuối là thêm một luật chết.
RULES.unshift([/^×(\d+) trong túi$/, (m, a) => `×${a} in bag`]);


/* ═══ TRANG DẪN TRUYỆN + MÔ TẢ 5 LỚP — hai mặt giám khảo đọc TRƯỚC TIÊN ═══════════════════
   ⚠ Trang dẫn truyện đặt bằng `innerHTML`, nên nó vỡ thành 44 text-node; và `trCompute` còn
   tách tiếp theo đoạn (`\n\s*\n`). Khoá vì thế là từng ĐOẠN đã trim, không phải cả trang.
   Chép cả trang làm một khoá là một mục từ điển không bao giờ bắn. */
Object.assign(EXACT, {
  // ── trang 1: NẾP KHẮC VỪA ──
  'NẾP KHẮC VỪA': 'THE MEASURED CUT',
  'Lunacia sinh ra dưới ánh sáng của Atia. Một thế giới cổ, nơi mọi loài từng sống hoà với đất — cho tới khi Chimera tới áp lấy biên giới.':
    'Lunacia was born under the light of Atia. An old world, where every kind once lived in step with the land — until the Chimera came and pressed in on the borders.',
  'Thứ giữ cho Lunacia còn ở được không phải quân đội. Là':
    'What keeps Lunacia liveable is not an army. It is',
  'Bug axie khắc Rune lên': 'Bug axies carve Runes into',
  'đá': 'stone',
  'Một phiến Rune dựng ở một nơi thì': 'A Rune slab set in a place',
  // ⚠ Node thật mang cả dấu chấm của câu trước — `trCompute` chỉ trim KHOẢNG TRẮNG,
  // không trim dấu câu. Khoá thiếu '. ' ở đầu là một mục từ điển không bao giờ bắn.
  '. Một phiến Rune dựng ở một nơi thì': '. A Rune slab set in a place',
  'giữ một cái luật': 'holds one law',
  'ở nơi đó: đàn không tan khi hoảng, rừng không lấn qua bờ, lò không nguội qua đêm.':
    'in that place: herds do not scatter when startled, the forest does not cross the line, the forge does not go cold overnight.',
  'Giáo lý của nghề chỉ có một câu —': 'The craft has exactly one creed —',
  ': khắc vừa đúng cái mà phiến đá gánh nổi, và đừng bao giờ khắc một cái luật phải giữ mãi mãi.':
    ': carve only what the slab can carry, and never carve a law that must hold forever.',

  // ── trang 2: NHÁT GỌI ──
  'NHÁT GỌI': 'THE SUMMONING CUT',
  'Có': 'There are',
  'bảy phiến Rune Cổ': 'seven Elder Runes',
  'cắm khắp Lunacia, mỗi vùng một phiến. Chimera không phá nổi một Rune — nhưng chúng':
    'set across Lunacia, one to a region. The Chimera cannot break a Rune — but they',
  'mài': 'grind',
  'nó. Bảy trăm năm mài thì đá mỏng dần.': 'at it. Seven hundred years of grinding wears stone thin.',
  'Và người biết khắc sâu thì hết. Kho Rune ở tầng sâu nhất hang Bug axie đã im tiếng từ lâu.':
    'And the carvers who cut deep are gone. The Rune vault in the lowest Bug axie burrow fell silent long ago.',
  'Nên có kẻ làm đúng cái việc giáo lý cấm:': 'So someone did the one thing the creed forbids:',
  'khắc một Rune lên trời': 'carved a Rune into the sky',
  '— xin một người thợ biết làm Rune bền hơn đá.':
    '— asking for a craftsman who could make a Rune that outlasts stone.',
  'Rune đó chạy. Nó mở một nhát cắt trên bầu trời, và người ta gọi nhát cắt ấy là':
    'The Rune worked. It opened a cut across the sky, and that cut is called',
  'Thứ đi qua không phải một vị thần. Là nguyên':
    'What came through was not a god. It was an entire',
  'một con phố': 'street',
  ': đá lát, lò rèn, quán rượu — khu phố':
    ': flagstones, a forge, a tavern — the district of',
  'của một thế giới tên': 'from a world called',
  ', cùng những người đang đứng trong đó. Người Lunacia dựng tường quanh nó và gọi chỗ này là':
    ', and the people standing in it. Lunacians walled it round and named the place',

  // ── trang 3: KẺ KHÔNG NHỚ VÌ SAO MÌNH TỚI ──
  'KẺ KHÔNG NHỚ VÌ SAO MÌNH TỚI': 'THE ONE WHO DOES NOT REMEMBER WHY',
  'Bảy người lính đi qua Nhát Gọi. Ngươi là một trong bảy.':
    'Seven soldiers came through the Summoning Cut. You are one of the seven.',
  'Rune đòi trả bằng chính thứ nó dịch chuyển. Cuộc vượt qua lấy của ngươi tên tuổi, ký ức, gương mặt đồng đội —':
    'A Rune is paid in the very thing it moves. The crossing took your name, your memory, the faces of your company —',
  'tất cả, trừ nghề': 'everything but the craft',
  '. Nghề khắc sâu hơn ký ức, nên nghề sẽ quay lại theo từng cấp.':
    '. The craft is cut deeper than memory, so it comes back to you level by level.',
  'Ngươi thuộc một trong': 'You are one of',
  'năm lớp chiến binh của Vaeldra': 'the five warrior classes of Vaeldra',
  '▲ — hãy chọn lại con đường ấy.': '▲ — choose that road again.',
  'Vaeldra không khắc Rune lên đá. Nó khắc': 'Vaeldra does not carve Runes into stone. It carves',
  'vào thép': 'into steel',
  '— và thép giữ một Rune lâu hơn đá rất nhiều. Đó là toàn bộ lý do Lunacia cần cái lò, và là lý do mỗi lần ngươi đập một món trang bị lên bậc là một lần ngươi khắc Rune.':
    '— and steel holds a Rune far longer than stone. That is the whole reason Lunacia needed the forge, and the reason every time you push a piece of gear up a tier you are carving a Rune.',
  'Hệ nguyên tố chạy theo': 'The element system runs on',
  'hai chiều, hai nguồn': 'two directions, two sources',
  '. Đòn ngươi đánh ra lấy hệ của': '. The blow you land takes the element of your',
  'VŨ KHÍ': 'WEAPON',
  '— khắc hệ thì': '— a favourable matchup is',
  '. Còn đòn giáng xuống ngươi thì lấy hệ của': '. The blow that lands on you takes the element of',
  'CÁI THÂN ngươi đang đeo': 'THE BODY you are wearing',
  ': mỗi vùng đất là đất của một tộc Axie, và cái thân hợp với đất đó chịu đòn nhẹ hơn hẳn. Đổi thân không cộng cho ngươi một điểm chỉ số nào — nó đổi':
    ': every region belongs to one Axie tribe, and a body that suits that ground takes noticeably less. Swapping bodies grants you no stat at all — it changes',
  'vùng đất nào dễ thở': 'which ground goes easy on you',

  // ── trang 4: BẢY RUNE CỔ ──
  'BẢY RUNE CỔ': 'THE SEVEN ELDER RUNES',
  'Bảy phiến đá đang mỏng dần, và cái lò trong thành khắc lại được chúng vào thép để chúng bền thêm nghìn năm.':
    'Seven slabs are wearing thin, and the forge inside the walls can re-cut them into steel to last another thousand years.',
  'Nhưng': 'But',
  'trong lúc phiến đá nằm trong lò, cái luật nó giữ thì trống':
    'while a slab sits in the forge, the law it holds stands empty',
  '"Từ Rẻo Rừng Corran ra Beast Herd Camp, vào Werebear Woods, qua Plant Tribe Glade, xuống Bug Tribe Tunnels, lên Bird Tribe Heights, ra Reptile Sunstone Flats — cho tới Dusk Marsh, nơi phiến thứ bảy thắp đường về Cây Hồn."':
    '"From Corran Woodstrip out to Beast Herd Camp, into Werebear Woods, across Plant Tribe Glade, down into Bug Tribe Tunnels, up to Bird Tribe Heights, out to Reptile Sunstone Flats — and on to Dusk Marsh, where the seventh slab lights the road to the Soul Tree."',
  'Rune thứ bảy là thứ chỉ đường cho hồn quay về. Gỡ nó ra thì suốt thời gian đó, không một hồn nào ở Lunacia tìm được đường.':
    'The seventh Rune is what shows the dead the way home. Take it out, and for as long as it is gone not one soul in Lunacia can find the road.',
  'Những Axie ở đây không gọi ngươi tới để chứng kiến chuyện đó.':
    'The Axies here did not call you across to watch that happen.',
  'Hãy cứu lấy chúng.': 'Save them.',

  // ── mô tả 5 lớp (màn chọn nhân vật — không có thẻ HTML nên một khoá là đủ) ──
  'Giáp tấm nặng, mũ trụ có sừng, đại kiếm hai tay. Dark Knight đứng mũi chịu sào, nuốt trọn đòn của cả bầy rồi trả lại bằng một nhát bổ chậm mà không gì cản nổi. Tiềm năng: sát thương từ Sức Mạnh, và Nhanh Nhẹn để đứng vững.':
    'Heavy plate, a horned helm, a two-handed greatsword. The Dark Knight stands at the front, swallows a whole pack’s worth of punishment and answers with one slow cleave nothing stops. Potential: damage from Strength, and Agility to stay standing.',
  'Cung dài, giáp da nhẹ, chân bước không thành tiếng. Sylvan Ranger rót tên từ ngoài tầm với, đồng thời phủ phù trợ lên cả đội — vừa là sát thủ vừa là chỗ dựa. Tiềm năng: Nhanh Nhẹn lo cả sát thương lẫn phòng thủ — một dòng là đủ.':
    'A longbow, light leather, footsteps that make no sound. The Sylvan Ranger pours arrows in from beyond reach while laying buffs over the whole party — killer and backbone at once. Potential: Agility carries both damage and defense — one stat is enough.',
  'Áo thụng trùm kín, quyền trượng nạm ngọc, thân thể mỏng như giấy. Dark Wizard đứng xa nhất chiến trường và gọi độc tố cùng thiên thạch xuống thay mình. Tiềm năng: sát thương từ Năng Lượng, và Nhanh Nhẹn để khỏi vỡ.':
    'A deep hood, a jewelled staff, a body thin as paper. The Dark Wizard stands furthest back on the field and calls down venom and meteors in his place. Potential: damage from Energy, and Agility so you do not shatter.',
  'Nửa giáp nửa vải, một vai để trần, đại đao bản rộng cháy lửa. Spellblade vừa chém như hiệp sĩ vừa niệm như pháp sư — không cần chờ tới cấp 10 để mạnh. Tiềm năng: sát thương chính từ Nhanh Nhẹn, Sức Mạnh chỉ là dòng phụ.':
    'Half plate, half cloth, one shoulder bare, a broad burning blade. The Spellblade cuts like a knight and casts like a mage — no waiting until level 10 to matter. Potential: damage mainly from Agility, with Strength as the secondary stat.',
  'Vương miện năm chấu, giáp đen ánh lam, quyền trượng chỉ huy. Dark Lord không bao giờ ra trận một mình — hắn hiệu triệu, và chiến trường tự sạch. Tiềm năng: sát thương từ Năng Lượng, dặm Nhanh Nhẹn cho phòng thủ.':
    'A five-pointed crown, black armour with a blue sheen, a staff of command. The Dark Lord never takes the field alone — he summons, and the field clears itself. Potential: damage from Energy, with some Agility for defense.',
});


/* ⚠ BĂNG-RÔN SỰ KIỆN THEO GIỜ THẬT — nguồn RÒ THEO ĐỒNG HỒ, không theo thao tác.
   Hai chuỗi Vực Nứt chỉ hiện trong cửa sổ 15 phút trước mốc giờ, nên bài kiểm chạy lúc
   khác thì không thấy chúng — tức nó XANH vì may, rồi đỏ vào đúng một khung giờ. Dịch là
   cách duy nhất làm bài kiểm hết phụ thuộc vào lúc chạy. */
Object.assign(EXACT, {
  '✹ VỰC NỨT SẮP TOÁC MỞ': '✹ THE RIFT IS ABOUT TO TEAR OPEN',
  '✹ CHÚA TỂ VỰC NỨT GIÁNG THẾ': '✹ THE RIFT LORD DESCENDS',
  '✹ Vực nứt đã khép': '✹ The rift has closed',
  'Chúa Tể rút về bên kia vết nứt cùng chiến lợi phẩm.':
    'The Lord withdrew through the tear, spoils and all.',
});
// ⚠ `unshift`, KHÔNG `push` — luật có sẵn `/^(\d+) phút (.*)$/` khớp trước và trả về
// "15 min: nữa — …", tức nuốt mất luật viết sau. Đây là lần THỨ HAI cùng cái bẫy trong đợt
// này: RULES quét theo thứ tự, cái khớp đầu tiên thắng.
RULES.unshift(
  [/^(\d+) phút nữa — Chúa Tể Vực Nứt giáng xuống MỌI bãi săn \(cần cấp (\d+)\+\)\. Vá giáp, nạp thuốc!$/,
    (m, a, b) => `${a} minutes out — the Rift Lord drops on EVERY hunting ground (level ${b}+ required). Patch your armour, stock potions!`],
  [/^Vực nứt toác ở mọi bãi săn — (\d+) phút, hạ tối đa (\d+) con để cướp Box Kundun lớn!$/,
    (m, a, b) => `Rifts tear open on every hunting ground — ${a} minutes, kill up to ${b} to take the big Box Kundun!`]
);

/* ═══ Đợt trộn "Lực Chiến · Nhận Quà · dải trạng thái" ═══
   Ba bảng này vào main SAU lượt dịch trước, nên chúng mang theo ~55 chuỗi chưa ai dịch.
   Bắt được bằng cách hỏi thẳng lang.js từng chuỗi mới trong diff — `tr(s) === s` nghĩa là
   chuỗi ấy rơi thẳng ra màn hình bằng tiếng Việt. Đó là cửa rẻ nhất; `test_dichen` là cửa
   nói thật nhất, vì nó đo thứ THỰC SỰ vẽ ra. */
Object.assign(EXACT, {
  // — nút và tiêu đề —
  'Đánh Giá Sức Chiến Đấu': 'Combat Power',
  'Đánh Giá Sức Chiến Đấu — bấm xem phân rã': 'Combat Power — click for the breakdown',
  'Bấm để xem chi tiết': 'Click for details',
  'Mốc Lực Chiến': 'Combat Power Milestones',
  'Nhận Quà': 'Claim',
  'Đã nhận': 'Claimed',
  'Chưa đủ': 'Not yet',
  'Chưa đủ điều kiện!': 'Requirements not met!',
  'Mở khoá': 'Unlock',
  'Rồi': 'Done',
  'Mỗi lần': 'Each',
  'Cấp': 'Level',
  'Chưa mặc món nào': 'Nothing equipped',
  'Chưa có mốc nào nhận được': 'No milestone ready to claim',
  'chưa có mốc nào': 'no milestone yet',
  '⚠ Điểm chưa cộng': '⚠ Unspent points',
  'Điểm Tiềm Năng đã rót': 'Potential points spent',
  'Điểm đã tiêu': 'Points spent',
  'Tổng cấp kỹ năng': 'Total skill levels',
  'Số lần Tái Sinh': 'Resets',
  'Vòng Tái Sinh': 'Reset cycle',
  'Mở sau lần Tái Sinh đầu tiên.': 'Opens after your first Reset.',
  // — các dòng phân rã Lực Chiến —
  'Lực chiến nhân vật': 'Character power',
  'Lực chiến trang bị': 'Gear power',
  'Lực chiến kỹ năng': 'Skill power',
  'Lực chiến Tái Sinh': 'Reset power',
  'Lực chiến Đại Thành': 'Mastery power',
  'Lực chiến Axie': 'Axie power',
  'Lực chiến thú cưỡi': 'Mount power',
  'Lực Chiến Thần Binh': 'Divine Arms power',
  // — mốc thưởng —
  'Đón Chào Tân Thủ': 'Welcome Aboard',
  'Thợ Săn Vaeldra': 'Vaeldran Hunter',
  'Mốc của mười cấp đầu — đi hết chương I là nhận gần đủ.':
    'The first ten levels — finish Chapter I and you have most of them.',
  'Cày quái đủ số là có quà — không phải đi đâu, không phải hỏi ai.':
    'Kill enough and the reward is yours — no trip, no NPC to ask.',
  'Thưởng theo chính con số trên nút Lực Chiến — mạnh tới đâu nhận tới đó.':
    'Rewards track the number on the Combat Power button — the stronger you are, the more you get.',
  // — dải trạng thái nhân vật (buff/debuff) —
  'Rượu Hổ Cốt': 'Warbrew',
  'Bùa Chắn Sét': 'Stormward Charm',
  'Sa Đọa': 'Corruption',
  'Trúng Độc': 'Poisoned',
  'Trọng Thương': 'Grievous Wound',
  'Tê Liệt': 'Paralysed',
  'Không di chuyển được': 'Cannot move',
  'Mất máu theo nhịp': 'Losing health over time',
  'Tăng Sát Thương': 'Damage Up',
  'Bạo Kích Tuyệt Đối': 'Guaranteed Crit',
  'Mọi đòn đều bạo kích': 'Every hit crits',
  'Phản Đòn': 'Riposte',
  'Dội lại sát thương cho kẻ đánh': 'Reflects damage back at the attacker',
  'Hút Sinh Lực': 'Lifesteal',
  'Đánh trúng thì hồi máu': 'Heals you on hit',
  'Liên Trảm': 'Chain Strike',
  'Cửa sổ nối đòn còn mở': 'The combo window is still open',
  'Chiêu đã nâng cấp': 'Skill upgraded',
  'Vực Thẳm — chưa hồi phục': 'The Abyss — not yet recovered',
  '−40% sát thương sét': '−40% lightning damage',
  '+12% Công Kích': '+12% ATK',
  '+15% Công Kích — ma công': '+15% ATK — dark arts',
  '+2% Công Kích và Sinh Lực': '+2% ATK and Health',
});

// Dòng thưởng của bảng Mốc Lực Chiến dựng bằng template, nên chúng KHÔNG bao giờ khớp một
// khoá EXACT — phải là luật. `unshift` chứ không `push`: luật có sẵn `/^(\d+) (.*)$/` nuốt
// hết cả ba nếu để sau, đúng cái bẫy đã dẫm hai lần trong đợt dịch trước.
RULES.unshift(
  [/^(\d+) Ấn Giao Kết$/,          (m, a) => `${a} Bond Seals`],
  [/^(\d+) ✦ Ấn Giao Kết$/,        (m, a) => `${a} ✦ Bond Seals`],
  [/^1 (.+) theo cấp$/,             (m, a) => `1 ${tr(a)} (scaled to level)`]
);
Object.assign(EXACT, { 'Lực Chiến': 'Combat Power' });

/* ═══ Bot QA tìm ra: 9 chuỗi canvas còn tiếng Việt trong 79.976 lượt vẽ ═══
   Sáu cái đầu là TÊN VÙNG trên bản đồ thế giới (`TG_VUNG`) — nhãn to nhất trên tấm bản đồ,
   mà mọi bộ quét trước đều mù với chúng vì chúng chỉ vẽ ra khi mở bảng Bản Đồ thế giới.
   Đây đúng là lý do phải có một con bot CHƠI THẬT chứ không chỉ quét mã. */
Object.assign(EXACT, {
  'Vành Corran':        'The Corran Rim',
  'Quần Đảo Thú':       'The Beast Shoals',
  'Bình Nguyên Nắng':   'The Sunlit Flats',
  'Vỉa Ngọc Nứt':       'The Riven Seams',
  'Sống Băng':          'The Ice Spine',
  'Lò Tro':             'The Ash Forge',
  'Rẻo rừng nơi Nhát Gọi mở ra, và khu phố đá đi qua nó.':
    'The woodland strip where the Summoning Cut opened, and the stone quarter that came through it.',
  'Bãi cạn và rừng thấp — nơi đàn thú còn chưa tan.':
    'Shallows and low forest — where the herds have not yet scattered.',
  'Luống ấp và con đường mòn vắt qua vùng đất khô.':
    'Hatching beds and a trail slung across the dry country.',
  'Đất nứt dưới Nhát Gọi, và những đường hầm ăn sâu vào vỉa.':
    'Ground split beneath the Summoning Cut, and tunnels eating deep into the seams.',
  'Nhịp đá không nền, rồi dốc tuyết nơi khúc hát chưa tắt.':
    'Unfooted stepping stones, then the snow slope where the song has not died.',
  'Lò chưa nguội, và đầm lầy nơi đường về Cây Hồn tắt đèn.':
    'A forge not yet cold, and the marsh where the road to the Soul Tree went dark.',
  'Không có quái trong tầm — mở M hoặc Chọn Trận để tới bãi quái':
    'Nothing in range — press M or open Choose Battle to reach a hunting ground',
});
// Dải cấp dưới tên vùng, và dòng báo mở khoá công trình — cả hai dựng bằng template.
RULES.unshift(
  [/^cấp (\d+) - (\d+)$/,                    (m, a, b) => `level ${a} – ${b}`],
  [/^(.+) mở khóa ở cấp (\d+)!$/,            (m, a, b) => `${tr(a)} unlocks at level ${b}!`]
);
Object.assign(EXACT, { 'Mana đã đầy!': 'Mana is full!' });

/* ═══ 266 TÊN MÓN — khoản nợ dịch LỚN NHẤT, và bot QA mới lôi ra được ═══
   Không bộ quét tĩnh nào thấy chúng: tên món dựng lúc CHẠY từ `ITEM_DB` (`assignDef`), nên
   chúng chỉ tồn tại khi có một món rơi ra. Hỏi game đang chạy ⇒ 266 tên, dịch được 0.

   Chúng có CẤU TRÚC: `[Hoàn Hảo ]<ô><bộ>` — 16 từ chỉ ô × 60 tên bộ. Nên chỗ này là hai
   bảng nhỏ cộng một luật, không phải 266 khoá chép tay: thêm một bộ giáp mới vào `HERO_SETS`
   là chỉ phải thêm MỘT dòng vào `BO_DO`, không phải bốn dòng cho bốn ô. */
const O_DO = {
  'Mũ Trụ':'Helm', 'Giáp':'Armor', 'Găng':'Gauntlets', 'Ủng':'Boots',
  'Dây Chuyền':'Amulet', 'Nhẫn':'Ring', 'Đại Kiếm':'Greatsword', 'Ma Kiếm':'Runeblade',
  'Song Đao':'Twin Blades', 'Lệnh Trượng':'Command Rod', 'Trường Cung':'Longbow',
  'Kiếm':'Sword', 'Gậy':'Staff', 'Cung':'Bow', 'Nỏ':'Crossbow', 'Rìu':'Axe',
  'Búa':'Hammer', 'Chùy':'Mace', 'Kích':'Halberd',
};
const BO_DO = {
  'Thiết Phiến':'Ironplate', 'Giáp Đồng':'Bronzeplate', 'Ngân Giáp':'Silverplate',
  'Vảy Rồng':'Drakescale', 'Bạo Long':'Tyrant Drake', 'Lôi Đình':'Thunderfall',
  'Long Vương':'Dragon King', 'Vải Thô':'Homespun', 'Nhân Sư':'Sphinx',
  'Triệu Hồn':'Summoner', 'Hư Vô':'The Void', 'Thần Ma':'God-Fiend',
  'Tinh Vân':'Nebula', 'Da Rừng':'Wildhide', 'Lá Thép':'Steelleaf',
  'Gai Rừng':'Thornwood', 'Lông Cú':'Owlfeather', 'Sương Mai':'Morningmist',
  'Nguyệt Quế':'Laurel', 'Bạch Phượng':'White Phoenix', 'Bán Giáp':'Halfplate',
  'Da Nung':'Scorched Hide', 'Dung Nham':'Magma', 'Lửa Dữ':'Wildfire',
  'Hoả Ngục':'Inferno', 'Long Diễm':'Dragonflame', 'Viêm Đế':'Flame Sovereign',
  'Lệnh Giáp':'Warrant Plate', 'Cận Vệ':'Honor Guard', 'Kim Miện':'Gilt Crown',
  'Bạo Chúa':'Despot', 'Ngai Đen':'Black Throne', 'Hắc Đế':'Black Sovereign',
  'Đế Vương':'Imperator', 'Thân Vệ':'Bodyguard', 'Quỷ Vương':'Demon King',
  'Cốt Vương':'Bone King', 'Tro Tàn':'Ashfall',
  'Thô':'Crude', 'Thô Sơ':'Rough', 'Gỗ':'Wooden', 'Sồi':'Oak',
  'Đồng':'Bronze', 'Thép':'Steel', 'Bạc':'Silver', 'Pha Lê':'Crystal',
  'Ngọc Lam':'Azurite', 'Ngọc Lục':'Emerald', 'Hoả':'Flame',
  'Cổ Ngữ':'Old Tongue', 'Khai Thiên':'Skyrender', 'Vĩnh Hằng':'Everlasting',
  'Vương Quyền':'Regalia',
  'Nanh Đồng':'Bronze Fang', 'Nanh Thép':'Steel Fang', 'Nanh Bạc':'Silver Fang',
  'Nanh Rồng':'Drake Fang', 'Nanh Lửa':'Flame Fang', 'Nanh Lôi Đình':'Thunder Fang',
  'Nanh Long Vương':'Dragon King Fang',
};
// ⚠ TIỀN TỐ DÀI NHẤT THẮNG. 'Đại Kiếm' và 'Kiếm', 'Trường Cung' và 'Cung', 'Ma Kiếm' và
// 'Kiếm' — so theo thứ tự khai là 'Kiếm' ăn trước và 'Đại Kiếm X' ra 'Đại Sword X'.
const O_DO_SAP = Object.keys(O_DO).sort((a, b) => b.length - a.length);
// ⚠⚠ REGEX PHẢI CHỈ KHỚP ĐÚNG HÌNH DẠNG TÊN MÓN — TUYỆT ĐỐI KHÔNG `/^(.+)$/` rồi trả `null`
// khi không phải tên món. Đã viết đúng cái sai ấy và nó là một lỗi NẶNG: `trCompute` trả
// thẳng `null` ra ngoài, nên MỌI chuỗi chưa dịch biến thành rỗng — tên nhiệm vụ, lời thoại,
// mô tả chiêu đều thành chữ trắng. Và nó làm `test_dichen §④` XANH TOÀN TẬP (190 → 0 nợ), vì
// một chuỗi rỗng thì không còn ký tự tiếng Việt nào để mà đếm.
// *Một con số nợ tụt thẳng về 0 sau một thay đổi không đụng tới nó là dấu hiệu que dò hỏng,
// không phải dấu hiệu vừa làm xong việc.*
const _reMon = new RegExp('^(Hoàn Hảo )?(' + O_DO_SAP.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?: (.+))?$');
RULES.unshift([_reMon, (m, hh, o, duoi) => {
  if (duoi && !BO_DO[duoi]) return m;         // bộ lạ ⇒ trả NGUYÊN chuỗi, đừng dịch nửa vời
  const ten = duoi ? `${BO_DO[duoi]} ${O_DO[o]}` : O_DO[o];
  return hh ? `Excellent ${ten}` : ten;
}]);
// ── Spellblade: 7 dòng giáp + 7 dòng vũ khí của gói `magic-runtime` ──────────────────────────
// Tên có khuôn `[Hoàn Hảo ]<ô> <bộ> <giai La Mã>` và `[Hoàn Hảo ]<vũ khí> <giai La Mã>` — số giai
// nằm trong tên để bảy giai không trùng tên (xem canbang.js). Luật đứng TRƯỚC `_reMon` ở trên: tên
// giáp này cũng mở đầu bằng 'Giáp', và `_reMon` gặp đuôi lạ thì trả nguyên chuỗi tiếng Việt.
// Tên gói là tên TẠM (chủ dự án sẽ đổi), nên dịch cũng tạm theo — đổi tên thì đổi ở đây một dòng.
const MR_BO_EN = {
  'Vải Thô':'Homespun', 'Trâu Xanh':'Blue Bull', 'Đồ Đồng':'Bronzeware', 'Ma Thuật':'Arcane',
  'Phong Vũ':'Stormwind', 'Lôi Phong':'Thunderwind', 'Cuồng Phong':'Tempest',
};
const MR_VK_EN = {
  'Song Đao Cơ Bản':'Plain Twin Blades', 'Song Chùy':'Twin Maces', 'Song Hỏa Đao':'Twin Fire Blades',
  'Song Kiếm Điện':'Twin Storm Swords', 'Lôi Phong Đao':'Thunderwind Blade',
  'Ảo Ảnh Đao':'Phantom Blade', 'Hỏa Tinh Kiếm':'Firestar Sword',
};
const _mrEsc = (k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const _mrLa = '(I|II|III|IV|V|VI|VII)';
RULES.unshift(
  [new RegExp('^(Hoàn Hảo )?(Mũ Trụ|Giáp|Găng|Ủng) (' + Object.keys(MR_BO_EN).map(_mrEsc).join('|') + ') ' + _mrLa + '$'),
    (m, hh, o, bo, la) => `${hh ? 'Excellent ' : ''}${MR_BO_EN[bo]} ${O_DO[o]} ${la}`],
  [new RegExp('^(Hoàn Hảo )?(' + Object.keys(MR_VK_EN).map(_mrEsc).join('|') + ') ' + _mrLa + '$'),
    (m, hh, vk, la) => `${hh ? 'Excellent ' : ''}${MR_VK_EN[vk]} ${la}`]
);
// 28 cây vũ khí có tên RIÊNG, không theo khuôn ô+bộ.
// ⚠ Bảy cái trong số này còn là TÀN DƯ KIẾM HIỆP (Cửu Thế Phục Sinh · Huyền Cổ Thần · Mãng Xà
// · Mỹ Xà Quyền · Thiên Linh Quyền · Thiên Lôi · Cốt Linh). Dịch sang tên MU trung tính là
// chữa được nửa tiếng Anh; nửa tiếng Việt vẫn phạm Quy tắc số 1 và cần một đợt ĐỔI TÊN riêng.
Object.assign(EXACT, {
  'Cốt Linh Trượng':'Bonespirit Staff', 'Thiên Linh Quyền Trượng':'Skyspirit Rod',
  'Mãng Xà Trượng':'Serpent Staff', 'Thiên Lôi Trượng':'Thunder Staff',
  'Mỹ Xà Quyền Trượng':'Viper Rod', 'Huyền Cổ Thần Trượng':'Elder God Staff',
  'Cửu Thế Phục Sinh Trượng':'Ninefold Revival Staff',
});

/* Chuỗi chỉ hiện ra khi ĐANG ĐÁNH NHAU — bot QA phải chơi thật 60 giây, lên 6 cấp và hạ 63
   con mới gặp. Quét mã không thấy vì phần lớn dựng bằng template lúc chạy. */
RULES.unshift(
  [/^THĂNG CẤP (\d+)!$/,                    (m, a) => `LEVEL ${a}!`],
  [/^→ Chạy tới (.+)$/,                      (m, a) => `→ Running to ${tr(a)}`],
  [/^✦ Dọn sạch bãi \+(\d+) EXP$/,           (m, a) => `✦ Camp cleared +${a} EXP`],
  [/^⛊ ĐỠ! -(\d+)$/,                         (m, a) => `⛊ BLOCK! -${a}`],
  [/^Nhiệm vụ hoàn thành — về gặp (.+)$/,   (m, a) => `Quest complete — report to ${tr(a)}`],
  [/^Mở khóa: (.+?) — (.+)$/,                (m, a, b) => `Unlocked: ${tr(a)} — ${tr(b)}`],
  [/^⚙ Hiệu ứng: (.+?) \(tự chỉnh theo máy — đổi tay ở Cài Đặt\)$/,
    (m, a) => `⚙ Effects: ${tr(a)} (auto-tuned to your machine — change it in Settings)`],
  [/^⚙ Độ nét: (\d+)% \(tự chỉnh theo máy — đổi tay ở Cài Đặt\)$/,
    (m, a) => `⚙ Sharpness: ${a}% (auto-tuned to your machine — change it in Settings)`]
);
Object.assign(EXACT, {
  'Né!': 'Dodge!',
  'TÂN BINH RƠI XUỐNG!': 'A NEWCOMER HAS FALLEN THROUGH!',
  'Vừa': 'Medium', 'Thấp': 'Low', 'Cao': 'High',
  'xem góc trái màn hình, xong hết nhận thưởng lớn!':
    'check the left of your screen — clear them all for a big reward!',
  'tới gặp Thợ Rèn (phím F dẫn đường)': 'go see the Blacksmith (press F and it leads you there)',
  'quay thân Axie làm hình dáng của bạn (C → Khế Ước)':
    'roll an Axie body to be your form (C → Pact)',
  'Mục Tiêu Hôm Nay': "Today's Goals",
});

/* ═══ HUD — chỗ phép đo trước MÙ HOÀN TOÀN ═══
   `test_dichen §③` quét 15 bảng `#panel-*`, mà hộp hướng dẫn · thẻ Nhiệm Vụ · nhãn bản đồ
   nhỏ · Nhật Ký thì KHÔNG phải panel — chúng là HUD, luôn nằm trên màn trong lúc chơi. Nên
   bài kiểm báo "0 dòng tiếng Việt" trong khi ảnh chụp game thật đầy tiếng Việt.
   *Một phép đo quét đúng cái danh sách nó tự đặt ra thì luôn xanh, và cái nó bỏ ngoài danh
   sách là cái người chơi nhìn nhiều nhất.*

   ⚠ SÁU BƯỚC HƯỚNG DẪN VỠ THÀNH MẢNH quanh thẻ `<b>`. MutationObserver dịch TỪNG text-node,
   nên chuỗi nguyên văn trong `TUT_STEPS` không bao giờ khớp một khoá nào — đó chính là lý do
   ảnh chụp cho thấy tên NPC đã sang tiếng Anh (`West Gate Guard`) còn câu bao quanh thì chưa.
   Phải khai theo đúng MẢNH mà thẻ `<b>` cắt ra. */
Object.assign(EXACT, {
  'Nhật Ký': 'Log',
  'Mở ra': 'Expand',
  'Thu lại': 'Collapse',
  'Ẩn': 'Hide',
  'Hiện': 'Show',
  // — bước 1: di chuyển —
  'Bấm': 'Click',
  'chuột phải': 'right-click',
  'trên nền đất hoặc bấm vào': 'on the ground, or click the',
  'bản đồ thu nhỏ': 'minimap',
  '— nhân vật sẽ tự chạy tới đó, hãy thử một lần':
    '— your character runs there on its own. Give it a try',
  // — bước 2: gặp NPC —
  'Nhiệm vụ đầu đã chạy sẵn rồi — tới gần': 'Your first quest is already running — walk up to the',
  '(phía tây thành) rồi nhấn': '(west side of town) and press',
  'để nghe giao việc — ai có dấu': 'to hear them out. Anyone with a',
  '(việc mới) hay': '(new quest) or a',
  '(đang làm dở) trên đầu là người đang có việc cho ngươi':
    '(in progress) over their head has work for you',
  // — bước 3: đèn hiệu —
  'Nhiệm vụ đầu nằm sẵn ở': 'Your first quest sits in the',
  'góc phải màn hình': 'right-hand corner',
  '. Bấm': '. Press',
  'trên dải nhiệm vụ (hoặc': 'on the quest strip (or',
  'ở khung nhiệm vụ) để tới': 'in the quest panel) to reach',
  '— hoặc tự đi bộ ra': '— or walk out through the',
  'rồi nhấn': 'yourself and press',
  // — bước 4: đánh —
  'Nhấn': 'Press',
  '— nhân vật tự chạy tới con quái gần nhất và đánh. Hãy hạ 1 con':
    '— your character runs to the nearest monster and attacks. Take down one',
  // — bước 5: nhặt đồ —
  'Quái chết có thể rơi đồ hoặc': 'A dead monster may drop gear or',
  'xuống đất —': 'on the ground —',
  'đi ngang qua': 'walk over it',
  ', bấm': ', press',
  'hoặc': 'or',
  'bấm chuột trúng món': 'click the item itself',
  'để nhặt. Giữ': 'to pick it up. Hold',
  'xem tên mọi món trên màn': 'to see the name of every item on screen',
  // — bước 6: bảng —
  'Mở thử bảng': 'Try opening the',
  '(phím': '(key',
  ') để xem chỉ số, hai dòng hệ và con Axie đang đeo ·':
    ') to see your stats, your two element rows and the Axie you are wearing ·',
  'kỹ năng ·': 'skills ·',
  'túi đồ ·': 'bag ·',
  'bản đồ': 'map',
  // — bước 7: TRỤC AXIE. Cửa dạy duy nhất của cơ chế gánh 35% barem trong phút đầu; câu này
  //   vỡ thành sáu mảnh quanh ba thẻ <b>, và mảnh đầu CỐ Ý bắt đầu ngay bằng thẻ — một mảnh
  //   đứng trước nó mà ngắn ('Con') sẽ thành khoá EXACT ăn vào mọi text-node 'Con' khác.
  'Con Axie ngươi đang ĐEO': 'The Axie you are WEARING',
  'quyết định ngươi ăn đòn nặng hay nhẹ ở': 'decides how hard hits land on you in',
  'đất này': 'this land',
  '— và nó KHÔNG cộng một điểm chỉ số nào. Ăn vài đòn rồi nhìn con số bay trên đầu mình; mỗi vùng một hệ khác nhau, đổi thân ở':
    '— and it adds ZERO stat points. Take a few hits and watch the number float over your head; every region runs a different element, so swap bodies at the',
  'trong bảng Nhân Vật.': 'tab in the Character panel.',
  // ⚠ 'Khế Ước' đứng MỘT MÌNH trong một text-node chưa từng có khoá — chỉ có 'Mở Khế Ước' và
  //   mấy mẫu ghép sẵn. Bước hướng dẫn mới bọc nó trong <b> nên nó thành một mảnh riêng, và
  //   nó đã lọt ra tiếng Việt giữa một câu tiếng Anh. 'Covenant' là tên đã dùng ở hai chỗ kia.
  'Khế Ước': 'Covenant',
  /* ⚠ MÀN TẠO NHÂN VẬT — bốn dòng dưới đây lọt tiếng Việt suốt, và chúng nằm trên màn ĐẦU
     TIÊN người chơi chạm vào. `test_dichen §⑤` quét cả `document.body` nhưng nó chạy SAU
     `startGame`, tức sau khi màn này đã đóng ⇒ nó chưa bao giờ đo tới đây. Quét lại bằng cách
     đi đúng đường người chơi đi (dẫn truyện → chọn máy chủ → chọn lớp) mới thấy.
     *Một phép quét chạy sau một cái cửa thì mọi thứ trước cửa ấy là điểm mù của nó.* */
  'Chiêu chính:': 'Main skill:',
  '· Trấn Phái:': '· Signature Art:',
  'Axie đại diện —': 'Representative Axie —',
  'Axie đại diện': 'Representative Axie',
  'Không cộng một điểm chỉ số nào — chỉ số, kỹ năng và trang bị đều tới từ lớp nhân vật. Nhưng lớp của con Axie quyết định ngươi chịu đòn nặng hay nhẹ ở từng vùng đất. Đổi lúc nào cũng được ở bảng Khế Ước.':
    'Adds ZERO stat points — stats, skills and gear all come from your class. But the Axie\u2019s own class decides how hard each region hits you. Swap it any time from the Covenant tab.',
});
Object.assign(EXACT, { 'Châu': 'Jewels', 'Tứ Châu': 'the Four Jewels', 'Ngọc': 'Jewel' });

// ⚠ CHIP ĐAI CẤP TRÊN HUD — `test_dichen §⑤` (mục HUD mới) bắt được, và nó là bằng chứng
// mục ấy đáng có: bộ quét TAY của tôi chạy trước đó báo "0 dòng" vì nó quét lúc người chơi
// còn đứng trong THÀNH, mà thành không có bãi quái nên `bandOfDist` trả −1 và chip không vẽ.
// Luật có sẵn ở trên khớp `Ngoại Vi C1–4`, còn chuỗi THẬT là `Đai Ngoại Vi · C1–4` — thừa
// chữ "Đai" và một dấu `·`. Một luật khớp gần đúng thì im lặng y như không có luật nào.
RULES.unshift([/^Đai (Ngoại Vi|Trung Tâm|Hạt Nhân) · (.+)$/, (m, v, b) =>
  `${({ 'Ngoại Vi':'Outer', 'Trung Tâm':'Middle', 'Hạt Nhân':'Core' })[v]} Belt · ${tr(b)}`]);
RULES.unshift([/^ĐAI (NGOẠI VI|TRUNG TÂM|HẠT NHÂN)$/, (m, v) =>
  `${({ 'NGOẠI VI':'OUTER', 'TRUNG TÂM':'MIDDLE', 'HẠT NHÂN':'CORE' })[v]} BELT`]);
RULES.unshift([/^Quái C(\d+)–(\d+) — (.+)$/, (m, a, b, c) => `Monsters Lv${a}–${b} — ${tr(c)}`]);
Object.assign(EXACT, {
  'mạnh nhất vùng, cẩn thận!': 'the strongest here — be careful!',
  'cấp trung bình': 'mid-level',
  'yếu nhất, hợp luyện công': 'the weakest — good for grinding',
});
// `bandLvText` trả riêng phần dải cấp (`C1–4`); hai luật trên gọi lại `tr()` cho nó.
RULES.unshift([/^C(\d+)–(\d+)$/, (m, x, y) => `Lv${x}–${y}`]);

/* ══ TẦNG KỂ CHUYỆN ══════════════════════════════════════════════════════════════════
   190 chuỗi cuối cùng còn tiếng Việt khi chạy `?lang=en`, đo bằng `test_dichen §④`.
   Giao diện đã sạch 100% từ mấy đợt trước; chỗ hở còn lại nằm đúng ở tầng KỂ CHUYỆN —
   tức phần nói cho người chơi biết VÌ SAO một Dark Knight lại đứng giữa Lunacia. Với
   giám khảo mở `?lang=en` rồi bấm nhận nhiệm vụ đầu tiên, đó là chỗ họ đâm vào đầu tiên.

   ⚠ KHAI NGUYÊN CHUỖI, KHÔNG CẮT MẢNH. Khác sáu bước hướng dẫn ở khối trên: mấy chuỗi
   này KHÔNG có thẻ HTML nào (đã quét: 0/190), nên mỗi cái nằm gọn trong MỘT text-node và
   khớp thẳng `EXACT`. Cắt mảnh ở đây là tự đẻ ra hàng trăm khoá ngắn, mà khoá càng ngắn
   thì càng dễ ăn nhầm một text-node chẳng liên quan ở chỗ khác.

   ⚠ TÊN RIÊNG THEO ĐÚNG BẢNG ĐÃ CÓ Ở TRÊN, đừng đặt tên mới: Tướng Quân → Warden ·
   Rương Canh → Warded Chest · Vỉa Cốt → Bone Vein · Lò Hỗn Độn → Chaos Forge ·
   Tái Sinh → Reset · Tầng Sâu → The Deeps · Trũng Nứt Corran → Corran Riftbasin ·
   Rẻo Rừng Corran → Corran Woodstrip. Một bản dịch thứ hai cho cùng một danh từ riêng là
   hai cái tên cho một thứ, và người chơi không có cách nào biết chúng là một.

   ⚠ `Bờ Đang Lấn` có mặt ở CẢ chính tuyến lẫn phụ tuyến — một khoá, một bản dịch. Bộ
   sinh khối này dò trùng khoá trước khi ghi, vì hai bản dịch khác nhau cho cùng một khoá
   thì `Object.assign` lấy cái sau và cái trước biến mất trong im lặng. */
Object.assign(EXACT, {
  // ── TÊN NPC ──
  'Kỵ Sĩ Ronin': 'Ronin Knight',
  'Kẻ Coi Luống': 'The Seedbed Keeper',
  // ── MÔ TẢ CHIÊU (VOHOC_DEFS[].desc) ──
  'Vũ khí rời tay, xoay tròn quanh thân trong một vòng lửa — lực ly tâm cuốn cả bầy.':
    'The weapon leaves your hand and circles you inside a ring of fire — the spin drags the whole pack in.',
  'Bị động: +15% Sinh Lực tối đa — sức vóc Dark Knight dày lên theo từng trận sống sót.':
    'Passive: +15% Max HP — a Dark Knight\'s frame thickens with every fight survived.',
  'Dựng thế thủ — một lớp khiên dày bằng 28% Sinh Lực tối đa bọc quanh thân, kèm +12% sát thương trong 8 giây.':
    'Set your guard — a shield worth 28% of Max HP wraps the body, plus +12% damage for 8 seconds.',
  'Mũi tên tẩm nhựa độc — trúng rồi thì vết thương tự lan.':
    'An arrow steeped in poison resin — once it lands, the wound spreads on its own.',
  'Phủ một lớp năng lượng lên giáp — đòn tới trượt đi thay vì ăn thẳng.':
    'Sheathe the armour in energy — incoming blows glance off instead of landing clean.',
  'Tụ ánh sáng lên đầu ngón tay rồi búng đi — không cần tên, không cần cung.':
    'Gather light at the fingertip and flick it away — no arrow, no bow.',
  'Kẹp năm mũi giữa các ngón, buông một lần — cả nan quạt tên phủ kín phía trước.':
    'Five shafts held between the fingers, loosed at once — a fan of arrows covers everything ahead.',
  'Ban phước: hồi ngay 25% Sinh Lực tối đa và +25% sát thương trong 8s.':
    'Blessing: restore 25% of Max HP at once, and +25% damage for 8s.',
  'Một mũi tên dồn hết lực xuyên thủng cả hàng địch — càng đứng thẳng hàng càng ăn đủ.':
    'One arrow with every ounce behind it, punching through a whole line — the straighter they stand, the more they take.',
  'Bị động: tự hồi 1% Sinh Lực tối đa mỗi giây, kể cả giữa trận.':
    'Passive: regenerate 1% of Max HP every second, even in the middle of a fight.',
  'Một tia sét đánh thẳng vào địch, có thể hất văng.':
    'A bolt of lightning straight into the target; it can throw them back.',
  'Băng giá xuyên thấu — trúng đòn làm chậm mục tiêu.': 'Piercing frost — a hit slows the target down.',
  'Ba cơn lốc xuyên phá — quét qua mọi địch trên đường đi.':
    'Three tearing whirlwinds — they sweep every enemy in their path.',
  'Giơ trượng gọi một cột lửa dựng thẳng từ lòng đất lên giữa bầy quái, vòng dung nham loang ra quanh chân nó.':
    'Raise the staff and a pillar of fire stands up out of the ground in the middle of the pack, lava spreading in a ring around its foot.',
  'Gọi bầy long hồn xoáy ra từ bóng của chính mình rồi giăng thành vòng, quét sạch một vòng quanh người.':
    'Call a flight of dragon spirits spiralling out of your own shadow, then string them into a ring that scours everything around you.',
  'Khiên hồn ma bao bọc — hấp thụ sát thương bằng 45% Sinh Lực tối đa trong 6s.':
    'A shroud of spectral shielding — absorbs damage equal to 45% of Max HP for 6s.',
  'Một nhát chém quét ngang, sóng sáng rời khỏi lưỡi thép bay tiếp.':
    'A cut sweeping sideways; a wave of light leaves the steel and keeps going.',
  'Quả cầu lửa học lỏm từ pháp sư — Spellblade niệm được mà không cần bỏ kiếm.':
    'A fireball picked up off the wizards — a Spellblade can cast it without putting the sword down.',
  'Sóng lực dội thẳng theo hướng nhìn — chiêu nhập môn của pháp sư, trong tay kẻ cầm kiếm.':
    'A wave of force straight along your facing — the wizard\'s first lesson, in a swordsman\'s hands.',
  'Vòng chém quanh thân mượn của hiệp sĩ — thép nặng thay cho thép mỏng.':
    'A spin cut borrowed from the knights — heavy steel instead of thin.',
  'Bão lửa khổng lồ nuốt trọn cả một vùng — chiêu riêng, không lớp nào khác có.':
    'A vast firestorm that swallows a whole area — this class alone has it.',
  'Dồn cả nội lẫn ngoại lực — +20% sát thương và +22% tốc đánh trong 6s.':
    'Everything you have, inside and out, poured into the swing — +20% damage and +22% attack speed for 6s.',
  'Bị động: hút 6% sát thương gây ra thành Sinh Lực — càng đánh dồn càng khó chết.':
    'Passive: 6% of the damage you deal comes back as HP — the harder you press, the harder you are to kill.',
  'Nắm năng lượng lại thành một khối rồi đẩy đi — chiêu mặc định của quyền trượng.':
    'Pack energy into a solid mass and shove it forward — the sceptre\'s default strike.',
  'Tia điện từ quyền trượng — trúng đòn choáng nhẹ.': 'A current off the sceptre — a hit leaves the target reeling.',
  'Bắn một chuỗi lửa ngắn liên tiếp — chiêu Dark Lord dùng nhiều nhất khi dọn bãi.':
    'A short burst of fire, one shot after another — the Dark Lord\'s workhorse for clearing a camp.',
  'Thúc chiến mã lao qua hàng địch — sức nặng của cả người lẫn ngựa dồn vào cú va.':
    'Spur the warhorse through the enemy line — rider and mount put their whole weight into the impact.',
  'Giậm quyền trượng xuống đất — nền nứt thành vòng, cả bầy bật ngửa.':
    'Slam the sceptre into the ground — the floor cracks in a ring and the whole pack is thrown off its feet.',
  'Hô hào toàn quân: mọi đòn đều bạo kích trong 4s, kèm +15% sát thương.':
    'Call the whole company on: every blow crits for 4s, plus +15% damage.',
  'Bị động: bầy quạ đen bám theo đánh hôi — +12% sát thương của MỌI chiêu thức.':
    'Passive: a flock of black ravens trails you and picks off the wounded — +12% damage on EVERY skill.',
  'Bị động: nới Sinh Lực tối đa — mỗi cấp +0,30%. Nền tảng của mọi lớp, không riêng lớp chịu đòn.':
    'Passive: raises Max HP — +0.30% per level. Groundwork for every class, not only the one that takes the hits.',
  'Bị động: nới Mana tối đa — mỗi cấp +0,30%. Càng nhiều Mana càng tung được nhiều chiêu trước khi phải lùi.':
    'Passive: raises Max Mana — +0.30% per level. More Mana means more casts before you have to back off.',
  'Bị động: rèn Thể Lực — mỗi cấp +0,10 điểm. Thể Lực nuôi Sinh Lực, nên nó cộng dồn với Increase Life.':
    'Passive: forges Vitality — +0.10 points per level. Vitality feeds HP, so it stacks with Increase Life.',
  'Bị động: nâng Công Kích tối đa — mỗi cấp +0,25%. Dark Wizard đọc dòng này thành Sức Mạnh Phép Thuật.':
    'Passive: raises maximum Attack — +0.25% per level. A Dark Wizard reads this line as Magic Power.',
  'Bị động: dày Phòng Thủ — mỗi cấp +0,30%. Mở muộn nhất trong bảy cái: nó là thứ giữ người ở map cấp cao.':
    'Passive: thickens Defense — +0.30% per level. Last of the seven to open: it is what keeps you standing on high-level maps.',
  'Bị động: tăng Né Tránh — mỗi cấp +0,05%. Đòn trượt hẳn thì không có giáp nào phải chịu.':
    'Passive: raises Dodge — +0.05% per level. A blow that misses outright costs your armour nothing.',
  'Bị động: tăng tỉ lệ Bạo Kích — mỗi cấp +0,05%. Khác Increase Critical Damage của Dark Lord: cái kia là SÁT THƯƠNG bạo kích, cái này là TỈ LỆ.':
    'Passive: raises Crit rate — +0.05% per level. Not the Dark Lord\'s Increase Critical Damage: that one is crit DAMAGE, this one is the RATE.',
  'Tâm pháp: đòn của võ công bộ 1 đẩy lùi mục tiêu và nện thêm sát thương bạo kích. Bị Steadfast của đối phương kháng lại.':
    'Discipline: set-1 arts knock the target back and add crit damage on top. Countered by an opponent\'s Steadfast.',
  'Tâm pháp: đứng vững trước đòn nện — kháng đẩy lùi và kháng sát thương bạo kích giáng xuống mình.':
    'Discipline: keep your footing under a heavy blow — resists knockback and the crit damage aimed at you.',
  'Tâm pháp: đòn của võ công bộ 2 khoá cứng mục tiêu — không đi được, không ra chiêu. Bị Unbound của đối phương kháng lại.':
    'Discipline: set-2 arts lock the target down — no movement, no casting. Countered by an opponent\'s Unbound.',
  'Tâm pháp: không gì khoá được chân mình — kháng mọi đòn định thân giáng xuống mình.':
    'Discipline: nothing pins your feet — resists every root aimed at you.',
  'Tâm pháp: đòn của võ công bộ 3 rải độc — mục tiêu mất máu dần theo tỉ lệ. Bị Antidote của đối phương kháng lại.':
    'Discipline: set-3 arts leave poison behind — the target bleeds HP over time. Countered by an opponent\'s Antidote.',
  'Tâm pháp: máu tự lọc lấy chất độc — kháng mọi loại độc giáng xuống mình.':
    'Discipline: your blood filters the toxin out — resists every poison aimed at you.',
  // ── CHÍNH TUYẾN (QUESTS[].name + .desc) ──
  '"Chúng nó chỉ dạn thế từ hôm cái đèn cạnh giếng tắt. Ba đêm liền, mà dầu vẫn còn đầy." Người gánh nước qua đó mười hai chuyến một ngày — hỏi ông ta.':
    '"They only turned that bold the night the lamp by the well went out. Three nights running, and the oil was still full." The water carrier passes that spot twelve times a day — ask him.',
  'Trưởng Làng nhận ra ngay: đó là đèn dẫn hồn, Dawn axie trông coi. Nhưng thứ giữ cho đèn cháy không phải dầu — là một nét khắc nhỏ dưới chân đèn, do Bug axie khắc. Dược Sư từng phụ pha dầu cho họ; hỏi cho ra.':
    'The Village Elder knows it at once: that is a soul lamp, tended by Dawn axies. But what keeps it burning is not the oil — it is a small carving at the foot of the lamp, cut by a Bug axie. The Apothecary used to help mix their oil; get it out of him.',
  '"Dầu đèn không mua được. Nó là nhựa cây trong rừng thưa, mà chỉ Plant axie mới biết chỗ." Hái đủ năm bụi — rồi ngươi sẽ thấy dầu không phải thứ đang thiếu.':
    '"Lamp oil is not something you buy. It is resin out of the open woods, and only a Plant axie knows where it runs." Gather five bushes of it — then you will see that oil is not what is missing.',
  'Đèn tắt thì hồn không về được Cây Hồn, kẹt lại giữa đường. Lũ này tụ quanh chỗ hồn kẹt mà ăn. Dọn sạch.':
    'With the lamps out the souls cannot reach the Soul Tree and are stranded on the road. These things gather where the souls are stuck, and they feed. Clear them out.',
  'Nét Khắc Đầu Tiên': 'Your First Carving',
  '"Đồ thường chém vào chúng như chém sương." Người Ardhaven không khắc lên đá — họ khắc vào thép, và thép giữ nét khắc lâu hơn đá rất nhiều. Mang một món tới lò, đập lên +3 rồi quay lại. Đó là nét khắc đầu tiên của ngươi.':
    '"Ordinary gear cuts them the way you cut fog." The people of Ardhaven do not carve into stone — they carve into steel, and steel holds a carving far longer than stone. Take a piece to the forge, bring it to +3 and come back. That is your first carving.',
  '"Miếu bên suối vẫn còn. Atia không cho ai vàng bạc — nhưng ngồi đủ lâu thì ngài cho ngươi biết ngọn đèn kế tiếp tắt ở đâu."':
    '"The shrine by the stream is still standing. Atia hands out no silver and no gold — but sit there long enough and she will tell you where the next lamp goes out."',
  'Kẻ Lấy Nét Khắc': 'The One Taking The Carvings',
  'Kẻ ngồi trên nền miếu không phải quái đi lạc. Trong tay nó có ba nét khắc gỡ từ ba chân đèn, xếp gọn như người ta xếp mẫu vật. Nó biết chính xác ngọn nào cần dập — và nó đang HỌC cách khắc lại.':
    'The thing sitting on the shrine floor is no stray monster. In its hands are three carvings stripped from three lamp bases, laid out neatly the way a person lays out specimens. It knows exactly which lamp to put out — and it is LEARNING how to cut them back.',
  'Trưởng Lão Rell đọc xong ba nét khắc lấy từ xác kẻ kia thì im rất lâu. "Nét này gỡ từ chân đèn. Còn thứ đang dồn đàn gia súc ngoài trại chăn thì gỡ từ chỗ khác." Ra dọn chúng.':
    'Elder Rell reads the three carvings taken off that corpse and then says nothing for a long while. "These came off a lamp base. Whatever is herding the cattle together out at the grazing camp came off somewhere else." Go and clear them.',
  'Phiến Đá Giữa Đồng': 'The Slab In The Open Field',
  'Trinh Sát Wren dẫn ngươi tới một phiến đá cắm giữa đồng cỏ, mặt khắc dày đặc. "Đây. Nó giữ cho đàn không tan khi hoảng — bảy trăm năm nay. Người khắc gọi nó là Rune Giữ Đàn." Gom nhựa cây quanh phiến để rửa lớp bụi trên mặt khắc.':
    'Scout Wren leads you to a slab standing in the middle of the grassland, its face dense with carving. "Here. It has kept the herd from scattering when they panic — for seven hundred years. The ones who cut it called it the Rune of the Herd." Gather resin around the slab to wash the dust off the carved face.',
  '"Sáu người qua Nhát Gọi cùng ngươi. Sáu người ĐEO một cái thân của đất này rồi mới đi được — Rune đòi trả bằng thứ nó dịch chuyển, và cái thân là thứ nó trả lại." Ký một Khế Ước đi. Cái thân đó là của ngươi, không phải con vật đi cạnh ngươi.':
    '"Six came through the Summoning Cut with you. Six of them had to WEAR a body of this land before they could walk at all — a Rune demands payment in the very thing it moves, and the body is what it gives back." Sign a Covenant. That body is yours; it is not an animal walking beside you.',
  'Thân Nào Cho Đất Nào': 'Which Body For Which Land',
  '"Ngươi đeo cái thân Rune trả lại, nhưng ngươi chưa CHỌN nó." Wren vẽ xuống đất ba vòng nối nhau. "Đất này là đất của Beast. Ai mang thân Aquatic, Bird hay Dawn tới đây thì đòn của chúng găm vào nhẹ hơn hẳn — không phải vì mạnh hơn, mà vì hợp hơn. Sang đất khác thì vòng xoay, và cái thân hôm nay hợp sẽ thành cái thân ngày mai chịu nặng." Mở Khế Ước ra mà tự cắm lấy một cái thân. Bảng đó nói cho ngươi biết ngươi đang đứng trên đất hệ gì.':
    '"You wear the body the Rune gave back, but you have not CHOSEN it." Wren draws three linked circles in the dirt. "This is Beast ground. Anyone who brings an Aquatic, Bird or Dawn body here takes their blows far lighter — not because it is stronger, but because it fits. Move to other ground and the circle turns, and the body that fits today is the body that takes it tomorrow." Open the Covenant and set a body yourself. That panel tells you what element the ground under you runs.',
  '"Phiến đá mỏng thì phải khắc lại vào thép. Cái lò ta mang từ Ardhaven sang làm được đúng việc đó — bỏ đồ và ngọc vào khay, máy tự nói cho ngươi biết khay đó thoả công thức nào." Đập một món lên +5 rồi quay lại.':
    '"When a slab wears thin the carving has to go back into steel. The forge we carried over from Ardhaven does exactly that — put gear and jewels on the tray and the machine tells you which recipe that tray satisfies." Bring a piece to +5 and come back.',
  'Thu Phiến Thứ Nhất': 'Recover The First Slab',
  'Con Ma Sói Sương Trắng đã ngồi lên phiến đá. Hạ nó và mang phiến về lò. ⚠ Rell nói thẳng cái giá: từ lúc phiến rời chỗ tới lúc thép nguội, KHÔNG CÓ AI giữ cho đàn khỏi tan.':
    'The Whitemist Werewolf has settled onto the slab. Bring it down and carry the slab to the forge. ⚠ Rell states the price plainly: from the moment the slab leaves its place until the steel cools, NOBODY is holding the herd together.',
  'Bờ Đang Lấn': 'The Boundary Is Creeping',
  'Người Gác Rừng Corran giữ cái bờ giữa rừng già và đất người ở. "Ba đời nay bờ đứng yên. Tháng này nó lấn vào ba trượng." Dọn lũ tượng đá vỡ lệnh đang đi theo mép bờ.':
    'The Corran Forest Keeper holds the line between the old wood and the land people live on. "For three generations that line has not moved. This month it came in by three fathoms." Clear the broken stone effigies walking the edge of it.',
  'Bụi Đá Dưới Chân Phiến': 'Stone Dust At The Foot Of The Slab',
  '"Phiến bị mài thì phải rụng ra cái gì. Cái đó chúng ta gọi là Cốt — và nó không nằm một chỗ: mỗi ngày đất trồi lên một vỉa ở một CHỖ KHÁC." Tìm vỉa hôm nay mà khai. Đi tới tận nơi, không có cách nào khác.':
    '"If a slab is being ground away, something has to come off it. We call that Bone — and it does not stay put: every day the ground pushes a vein up in a DIFFERENT PLACE." Find today\'s vein and work it. You go there yourself; there is no other way.',
  'Đòn Đủ Nặng Cho Rừng Già': 'A Blow Heavy Enough For The Old Wood',
  '"Đòn thường chỉ làm chúng giận." Hạ mười hai con bằng chính Trấn Phái tuyệt kỹ của lớp ngươi — Corran muốn thấy tận mắt ngươi làm được trước khi ông dẫn ngươi tới phiến đá.':
    '"An ordinary blow only makes them angry." Take down twelve of them with your own class\'s Signature Art — Corran wants to watch you manage it before he leads you to the slab.',
  'Cốt Vào Thép': 'Bone Into Steel',
  '"Cốt của rừng này là Rễ Gai — mỗi vùng rụng ra một loại khác nhau, vì mặt khắc mỗi phiến mỗi khác. Bỏ nó vào lò cùng miếng thép thì thép nhớ được cái luật." Đập một món lên +6.':
    '"The Bone of this forest is Thornroot — every region sheds a different kind, because every slab carries a different face. Put it in the forge with a piece of steel and the steel remembers the law." Bring a piece to +6.',
  'Thu Phiến Thứ Hai': 'Recover The Second Slab',
  'Tướng Quân Werebear Woods ngồi lên Rune Giữ Bờ và không giấu chuyện đó. Hạ nó, mang phiến về lò. Corran nói đúng một câu rồi quay đi: "Đêm nay ta ngủ ngoài bờ."':
    'The Warden of Werebear Woods has taken the Rune of the Boundary and makes no secret of it. Bring it down, carry the slab to the forge. Corran says exactly one thing and turns away: "Tonight I sleep out on the line."',
  'Luống Ấp Không Nở': 'The Beds Will Not Hatch',
  '"Luống ấp Plant Tribe lẽ ra nở tháng trước." Wren đưa ngươi một nhánh mầm đã đen đầu. Axie Sa Ngã dạt về chiếm nền trại cũ — mở đường vào.':
    '"The Plant Tribe beds should have hatched last month." Wren hands you a sprout gone black at the tip. Fallen Axies have drifted in and taken the floor of the old camp — open the way in.',
  'Ổ Ấp Bỏ Lại': 'The Abandoned Nursery',
  'Oan hồn tụ trên luống cũ. Không con nào rời khỏi vạt đất ấy quá mười bước — chúng đang chờ một thứ mà chỗ này từng hứa với chúng.':
    'Restless souls gather over the old beds. Not one of them strays more than ten paces off that patch of ground — they are waiting for something this place once promised them.',
  'Thứ Đất Nhả Ra': 'What The Ground Gives Back',
  '"Từ ngày phiến đá mỏng đi, đất bắt đầu nhả ra thứ nó giữ bảy trăm năm. Không phải của cải — là NGHỀ. Kẻ đi trước để lại, và ai đào lên thì nhặt được." Khai hai vỉa. Ngươi mất ký ức chứ không mất nghề; đây là chỗ lấy lại.':
    '"Since the slabs wore thin the ground has begun giving back what it held for seven hundred years. Not riches — CRAFT. The ones before us left it behind, and whoever digs it up picks it up." Work two veins. You lost your memory, not your craft; this is where you take it back.',
  'Thép Chịu Được Mùa': 'Steel That Can Carry A Season',
  '"Phiến ở đây giữ cho luống nở đúng mùa. Cái luật ấy nặng hơn cái luật giữ một cái đàn." Đập một món lên +7 trước khi tới gần nó.':
    '"The slab here keeps the beds hatching in season. That law is heavier than the one that holds a herd together." Bring a piece to +7 before you go anywhere near it.',
  'Thu Phiến Thứ Ba': 'Recover The Third Slab',
  'Thủ Lĩnh Đoàn Gloam ngồi trên Rune Giữ Mùa, và hắn từng mặc bộ giáp giống ngươi. Hắn sẽ nói thế, và hắn nói thật. Hạ hắn, mang phiến về lò.':
    'The Gloam Warband Chieftain sits on the Rune of the Season, and he once wore armour like yours. He will say so, and he is telling the truth. Bring him down, carry the slab to the forge.',
  'Hai Trăm Quả Chưa Nở': 'Two Hundred Eggs Unhatched',
  'Sylas đếm trứng suốt ba năm. "Dưới ổ ấp này là phiến GỐC — Rune Giữ Tên. Trứng nào nở cũng phải xin nó một cái tên. Ba tuần nay không quả nào xin được." Dọn lũ Golem đang đè lên lối xuống.':
    'Sylas has counted eggs for three years. "Under this nursery lies the ROOT slab — the Rune of Names. Every egg that hatches has to ask it for a name. For three weeks not one has managed to." Clear the Golems pressing down on the way below.',
  'Hòm Có Người Canh': 'A Chest With Keepers',
  '"Người vùng này không cất đồ trong nhà. Họ cất trong hòm, rồi để bốn con canh cái hòm — vì một cái tên mất thì tìm lại được, một cái hòm mất thì không." Mở hai cái. Trại canh còn sống thì hòm còn khoá.':
    '"People here do not keep their goods in the house. They keep them in a chest, and they set four to watch the chest — because a lost name can be found again and a lost chest cannot." Open two. While the camp lives, the chest stays locked.',
  'Thứ Không Ai Dạy Được': 'The Thing Nobody Can Teach',
  '"Nét khắc không dán lên đồ, và nghề không dán lên người. Thứ người ta khoá trong hộp cũng vậy — mở ra rồi mới biết bên trong là nghề hay là rác." Mở một Box Kundun.':
    '"A carving is not stuck onto gear, and a craft is not stuck onto a person. The same goes for whatever people lock in a box — you only find out whether it holds craft or rubbish once it is open." Open one Box Kundun.',
  '"Vaeldra khắc vào thép, chúng ta khắc vào đá. Cùng một nghề, khác cái phiến." Đập một món lên +9 rồi mang xuống cho ta xem nét khắc.':
    '"Vaeldra carves into steel, we carve into stone. The same craft, a different slab." Bring a piece to +9 and bring it down so I can look at the carving.',
  'Thu Phiến Gốc': 'Recover The Root Slab',
  'Tướng Quân ngồi trên phiến gốc và không cho trứng nào xin tên. Hạ nó. ⚠ Và nghe cho hết câu Sylas nói sau đó — ông ấy sẽ nói ai đã khắc nét trên trời.':
    'The Warden sits on the root slab and lets no egg ask for a name. Bring it down. ⚠ And hear Sylas out afterwards — he will tell you who cut the carving in the sky.',
  'Ba Tổ Ngừng Hát': 'Three Nests Have Stopped Singing',
  'Liora sống ở độ cao Bird axie chọn để tránh Chimera. "Phiến dưới kia giữ cho một khúc hát không tắt theo người hát nó. Ba tổ trên cao đã ngừng hát." Năm nay lũ cuồng tín leo được lên tới nơi.':
    'Liora lives at the height Bird axies chose to stay clear of the Chimera. "The slab down there keeps a song from dying with the one who sang it. Three of the high nests have stopped singing." This year the fanatics have managed to climb that far.',
  '"Ngươi mất ký ức, không mất nghề. Cái nghề ấy không nằm trong đầu — nó nằm trong tay, và mỗi lần tay nhớ ra thêm một nhát thì ta gọi là Bản Năng." Nâng ba cấp kỹ năng. Bản Năng là thứ trả cho những nhát đó, và đánh quái là cách tay nhớ lại.':
    '"You lost your memory, not your craft. That craft does not sit in the head — it sits in the hands, and every time the hands remember one more stroke, we call it Instinct." Raise three skill levels. Instinct is what pays for those strokes, and fighting is how the hands remember.',
  'Bird axie hát những khúc chỉ chúng hiểu, có khúc dùng ngay trong lúc đánh. Thứ này cắt khúc giữa câu — và nó làm thế có chủ đích.':
    'Bird axies sing songs only they understand, and some of them are sung mid-fight. This thing cuts the song off in the middle of a line — and it does that deliberately.',
  '"Chỗ ngươi sắp tới không có đèn nào cả. Đừng mang thép nửa vời xuống đó." Đập một món lên +11. Muốn nhanh thì xuống Tầng Sâu — càng sâu càng xa mọi phiến Rune, nên không tầng nào có luật, và không tầng nào giống tầng nào.':
    '"Where you are going there are no lamps at all. Do not take half-finished steel down there." Bring a piece to +11. If you want it quickly, go down into The Deeps — the deeper you go the further from every Rune, so no floor carries a law, and no two floors are alike.',
  'Chúng không săn bừa. Chúng săn đúng những con còn biết thắp đèn, và còn biết khúc hát nào đi với ngọn nào. Mười bốn con.':
    'They do not hunt at random. They hunt exactly the ones who still know how to light a lamp, and which song goes with which flame. Fourteen of them.',
  'Thu Phiến Thứ Năm': 'Recover The Fifth Slab',
  'Tướng Quân ngồi trên đúng cái phiến lẽ ra giữ khúc của ba tổ đã im. Hạ nó, mang phiến về lò. "Ta chép nhanh hơn," Liora nói. Bà biết bà đang chép cái gì.':
    'The Warden sits on the very slab that should be holding the song of the three silent nests. Bring it down, carry the slab to the forge. "I will copy faster," Liora says. She knows what she is copying.',
  'Xuống Vùng Đá Nóng': 'Down To The Hot Stone',
  'Rell gọi ngươi về thành một lần nữa. "Dax nằm ngoài vùng đá ba năm để đếm quân. Hôm qua hắn gửi than viết lên đá: mỏ nào cũng tắt lửa qua đêm." Đi tìm hắn — và đừng đứng thẳng lưng khi tới.':
    'Rell calls you back to town once more. "Dax has lain out on the stone flats for three years counting their numbers. Yesterday he sent word in charcoal on rock: every mine goes cold overnight." Go and find him — and do not walk in standing upright.',
  'Reptile axie dựng nhà trên tảng lớn, mở ra đóng vào theo nắng — vì phiến Rune ở đây giữ cho lò không nguội qua đêm. Nay có thứ đóng chúng lại từ bên ngoài. Dọn lũ trinh sát trước.':
    'Reptile axies build on the great slabs, opening and shutting with the sun — because the Rune here keeps a forge from going cold overnight. Now something is shutting them from the outside. Clear the scouts first.',
  'Đôi Cánh': 'A Pair Of Wings',
  '"Bình nguyên này rộng, và ngươi thì chạy bằng chân." Ghép một đôi cánh ở lò rồi quay lại hạ mười bốn con bằng Trấn Phái — Dax muốn thấy ngươi rời được mặt đất.':
    '"These flats are wide, and you travel on foot." Craft a pair of wings at the forge, then come back and take down fourteen with your Signature Art — Dax wants to see you leave the ground.',
  '"Reptile axie đào quặng và TẠO ra lửa, không mượn lửa. Mỏ tắt lửa nghĩa là không còn ai dưới đó — nhưng hòm của họ thì vẫn còn." Hung Thần thả hòm xuống đây. Ném hai cái ra mà mở.':
    '"Reptile axies dig ore and MAKE fire; they do not borrow it. A mine gone cold means nobody is left down there — but their chests are still there." The Dread One drops boxes here. Throw two out and open them.',
  'Bốn Nghìn Hai Trăm': 'Four Thousand Two Hundred',
  '"Ta đếm được bốn nghìn hai trăm quân. Ngươi có một người." Dax vẫn nằm. Phá đúng một chỗ: hàng kỵ sĩ giữa lều Tướng Quân và phiến đá.':
    '"I have counted four thousand two hundred of them. You have one of you." Dax does not get up. Break exactly one thing: the line of riders between the Warden\'s tent and the slab.',
  'Thu Phiến Thứ Sáu': 'Recover The Sixth Slab',
  'Tướng Quân dựng lều ngay trên Rune Giữ Lửa và ngồi lên nó như ngồi lên ghế. Hạ hắn, mang phiến về lò. Trên xác hắn có một bảng gỗ khắc bảy cái tên — bốn cái đã bị gạch.':
    'The Warden has pitched his tent directly on the Rune of the Flame and sits on it like a chair. Bring him down, carry the slab to the forge. On his body is a wooden board carved with seven names — four already struck through.',
  'Lão Tướng Brann gọi tên cả sáu người đã dẫn ngươi tới đây, rồi nói ông không có tên trên bảng gỗ kia. "Dusk axie canh Cây Hồn. Chúng chưa bỏ chạy — nghĩa là còn thứ đáng canh."':
    'Old Brann names all six who brought you this far, then says his own name is not on that board. "Dusk axies watch the Soul Tree. They have not run — which means there is still something there worth watching."',
  'Mang Bảng Tên Về Thành': 'Carry The Board Back To Town',
  '"Bốn cái tên bị gạch. Cái thứ năm là RELL. Cái thứ sáu là tên ngươi. Còn cái thứ bảy thì khắc SAU sáu cái kia, bằng một bàn tay khác." Mang bảng về cho Rell. Ông ấy là người duy nhất còn nhớ đủ bốn cái tên đầu.':
    '"Four names struck through. The fifth is RELL. The sixth is yours. And the seventh was cut AFTER the other six, by a different hand." Take the board back to Rell. He is the only one who still remembers all four of the first names.',
  'Nhà Dusk axie tàng hình được, nên thứ vây quanh đây không tìm nhà — nó vây chính Cây Hồn. Phá vòng vây bằng Trấn Phái.':
    'Dusk axie houses can hide themselves, so whatever is closing in here is not hunting for houses — it is closing on the Soul Tree itself. Break the ring with your Signature Art.',
  '"Thép của ngươi tới trần rồi. Con đường còn lại thì không." Đập một món lên +11 và hỏi lò về Tái Sinh — trả lại cấp để đi lại từ đầu với một thân thể nặng hơn. Brann đã làm chuyện đó hai lần.':
    '"Your steel has reached its ceiling. The road left to walk has not." Bring a piece to +11 and ask the forge about Reset — hand back your levels to start again in a heavier body. Brann has done it twice.',
  '"Đường về Cây Hồn đi qua vòng trong cùng, và vòng đó đang bị chặn hai đầu. Ta lo đầu bên kia." Dọn đầu bên này. Kỳ Lân Bão Tố đứng thành hàng — không con nào rời chỗ, vì chúng được lệnh đứng đó.':
    '"The road to the Soul Tree runs through the innermost ring, and that ring is blocked at both ends. I will take the far end." Clear this one. The storm-beasts stand in a line — not one of them leaves its place, because they were ordered to stand there.',
  'Thu Phiến Thứ Bảy': 'Recover The Seventh Slab',
  '⚠ Đọc hết trước khi đi. Rune Giữ Đường là thứ chỉ đường cho hồn quay về Cây Hồn — những ngọn đèn tắt ở Rẻo Rừng Corran hồi ngươi mới tới là đầu xa của chính phiến này. Gỡ nó ra thì suốt thời gian nó nằm trong lò, không một hồn nào ở Lunacia tìm được đường. Brann không cản. Ông chỉ xin ngươi làm chuyện đó trong lúc còn tỉnh táo.':
    '⚠ Read all of this before you set out. The Rune of the Road is what lights the way for souls returning to the Soul Tree — the lamps that went out across Corran Woodstrip when you first arrived are the far end of this very slab. Pull it out, and for as long as it lies in the forge not one soul in Lunacia can find the way. Brann will not stop you. He asks only that you do it while your head is still clear.',
  'Bảng Gỗ Bảy Cái Tên': 'The Board Of Seven Names',
  '"Ta giữ cái bảng từ hôm hạ Tướng Quân Reptile Sunstone Flats. Bảy cái tên, bốn cái đã bị gạch. Cái thứ năm là RELL. Cái thứ sáu là ngươi." Brann đưa bảng gỗ, rồi ngồi xuống. "Cái thứ bảy chưa bị gạch, vì chưa ai chứng minh được là nó nên bị gạch. Mang xuống cho Sylas — ông ấy khắc, ông ấy đọc được nét ai."':
    '"I have kept this board since the Warden of Reptile Sunstone Flats went down. Seven names, four struck through. The fifth is RELL. The sixth is you." Brann hands over the board, then sits down. "The seventh has not been struck, because nobody has yet proved that it should be. Take it down to Sylas — he carves, so he can read whose hand cut what."',
  'Nét Khắc Trên Người': 'A Carving On Flesh',
  '"Bảy cái tên này khắc bằng một tay. Sáu cái khắc lên gỗ. Cái thứ bảy…" Sylas dừng rất lâu. "…khắc lên chính nó. Ta chưa từng thấy ai làm thế, vì gỗ thì gánh được một cái luật, còn người thì không." Đoàn Gloam theo hắn đang rút về phía trũng — chặn chúng lại mà hỏi.':
    '"These seven names were cut by one hand. Six of them into wood. The seventh…" Sylas stops for a long time. "…into itself. I have never seen anyone do that, because wood can carry one law and a person cannot." The Gloam Warband following him is pulling back toward the hollow — cut them off and ask.',
  'Trả Bằng Thứ Nó Dịch Chuyển': 'Paid In The Thing It Moves',
  '"Rune đòi trả bằng thứ nó dịch chuyển. Ngươi trả bằng ký ức, nên ngươi quên. Hắn giữ được ký ức vì hắn trả bằng ký ức của NGƯỜI KHÁC." Sylas nhìn cái thân ngươi đang đeo. "Muốn đứng nổi trước hắn thì phải biết cái thân này là thứ được TRẢ LẠI, không phải thứ mượn." Ký đủ ba Khế Ước trước khi xuống trũng.':
    '"A Rune demands payment in the very thing it moves. You paid in memory, so you forgot. He kept his memory because he paid with SOMEONE ELSE\'S." Sylas looks at the body you are wearing. "If you mean to stand in front of him, you had better understand that this body was GIVEN BACK to you, not lent." Sign three Covenants before you go down into the hollow.',
  'Dưới Nhát Gọi': 'Beneath The Summoning Cut',
  'Hắn đợi ở đáy Trũng Nứt, ngay dưới vết cắt trên trời — chỗ duy nhất ở Lunacia không phiến đá nào cắm nổi, nên cũng là chỗ duy nhất không cái luật nào chạm tới hắn. Một con mắt không có tròng. "Ngươi gỡ bảy cái luật xuống rồi mang tới đây để hỏi ta vì sao?" ⚠ Đèn vẫn tắt sau trận này. Gỡ Rune là việc của ngươi, không phải của hắn.':
    'He is waiting at the bottom of the Corran Riftbasin, directly under the cut in the sky — the one place in Lunacia where no slab will hold, and therefore the one place no law can reach him. An eye with no pupil. "You pulled seven laws down and carried them here to ask me why?" ⚠ The lamps stay out after this fight. Pulling the Runes down was your doing, not his.',
  // ── PHỤ TUYẾN (SIDE_QUESTS[].name + .desc) ──
  'Thứ Mọc Được Thì Còn Kịp': 'If It Still Grows, There Is Still Time',
  '"Ngươi rơi xuống đây trần trụi, đúng không. Vậy thì học cái rẻ nhất trước: cúi xuống mà hái." Năm bụi quanh rẻo rừng. Không con nào cắn ngươi ở đó cả — đấy là chỗ duy nhất trong vùng ta dám nói câu ấy.':
    '"You dropped in here with nothing on you, didn\'t you. Then learn the cheapest thing first: bend down and pick." Five bushes around the woodstrip. Nothing out there will bite you — that is the only place in this region I would say that about.',
  'Bầy Tới Sớm Hơn Mọi Năm': 'The Packs Came Early This Year',
  '"Sói xuống bìa rừng sớm hơn mọi năm hai tháng. Người ta bảo tại thời tiết. Ta trộn thuốc ba mươi năm, ta biết mùi thời tiết — cái này không phải." Dọn mười bốn con, rồi ta nói tiếp.':
    '"The wolves came down to the treeline two months earlier than usual. People blame the weather. I have been mixing medicine for thirty years, I know what weather smells like — this is not it." Clear out fourteen of them, then we will talk.',
  'Cái Lò Ở Đâu': 'Where The Forge Is',
  '"Ngươi sẽ cần cái lò trước khi ngươi biết là mình cần nó. Đi hỏi Thoren ở lò rèn ngoài rẻo — nói ta gửi." Đi một chuyến, nhớ đường. Phần còn lại của cuộc đời ngươi ở đây sẽ đi đi lại lại con đường đó.':
    '"You will need the forge before you know you need it. Go ask Thoren at the smithy out on the strip — tell him I sent you." Make the trip once and learn the road. The rest of your life here will be spent walking it back and forth.',
  'Cỏ Đàn Không Chịu Ăn': 'Grass The Herd Will Not Touch',
  '"Đàn của ta bỏ bảy vạt cỏ. Không phải cỏ độc — ta nếm rồi. Chúng chỉ không chịu ăn." Hái bảy bụi ở đúng bảy vạt đó mang về đây. Ta muốn biết đàn nó ngửi thấy cái gì mà ta thì không.':
    '"My herd has walked away from seven patches of grass. It is not poison — I tasted it. They simply will not eat it." Pick seven bushes from exactly those seven patches and bring them here. I want to know what the herd smells that I cannot.',
  'Kẻ Đi Theo Người Thứ Bảy': 'The Ones Who Follow The Seventh',
  '"Đám Gloam cũ không cướp. Đám này thì cướp, mà không lấy gì ăn được — chúng lục tìm đá khắc." Mười sáu tên quanh trại. Lục túi chúng nếu ngươi muốn, ta thì hết muốn rồi.':
    '"The old Gloam robbed people. This lot robs people too, but they never take anything you could eat — they go through a place looking for carved stone." Sixteen of them around the camp. Go through their pockets if you like; I have stopped wanting to.',
  'Hòm Của Người Đã Không Về': 'Chests Of Those Who Never Came Back',
  '"Khắp mấy vùng này có hòm chôn sẵn, đời trước để lại, và mỗi cái có một trại canh. Mở được một cái thì ngươi hiểu vì sao ta không bao giờ đi một mình." Tìm một Rương Canh bất kỳ, dọn trại canh, mở nó ra.':
    '"There are chests buried all over these regions, left by the ones before us, and every one has a camp set to watch it. Open a single one and you will see why I never travel alone." Find any Warded Chest, clear the camp, open it.',
  '"Phiến đá giữ cho rừng đừng lấn qua bờ. Nay bờ lấn, mà phiến vẫn đứng đó — nghĩa là phiến đã mỏng tới mức giữ không nổi nữa." Mười tám con đã qua bờ. Đẩy chúng lại chỗ của chúng.':
    '"The Rune keeps the forest from crossing the boundary. Now the boundary is moving and the slab is still standing there — which means it has worn too thin to hold." Eighteen of them are already across. Push them back where they belong.',
  'Thứ Người Ta Chôn Cùng Hòm': 'What They Buried With The Chest',
  '"Đám buôn Ardhaven bán mấy cái hộp khoá kín, gọi là Box Kundun. Ta không tin thứ mình không mở ra xem được." Mở một cái. Ngươi mở, ta nhìn. Ta muốn biết bên trong là đồ thật hay là trò.':
    '"The Ardhaven traders sell sealed boxes — Box Kundun, they call them. I do not trust anything I cannot open and look inside." Open one. You open it, I watch. I want to know whether what is inside is real goods or a trick.',
  'Người Bên Kia Vực': 'The Man On The Far Side',
  '"Có kẻ ngồi bên mép vực đông, ba năm nay không xuống. Ta không qua được — ta còn phải đi vòng quanh phiến đá." Mang câu này sang: *bờ đã lấn tới gốc cây thứ chín rồi.* Ông ta sẽ hiểu.':
    '"Someone has sat on the eastern lip of the gorge for three years and never come down. I cannot get across — I still have my rounds to walk past the slab." Carry this over to him: *the boundary has reached the ninth tree.* He will understand.',
  'Tám Dòng Giống Nhau': 'Eight Identical Lines',
  '"Ta ghi ba mùa liền một dòng: NỞ SỚM. Ghi mà không hiểu thì cũng như không ghi." Hái tám bụi ở tám luống khác nhau mang về — ta muốn xem chúng có nở sớm giống nhau không, hay mỗi luống một kiểu.':
    '"Three seasons running I have written down the same line: HATCHED EARLY. Writing a thing down without understanding it is the same as not writing it." Pick eight bushes from eight different beds and bring them back — I want to see whether they all run early the same way, or every bed does it differently.',
  'Thứ Nở Ra Từ Luống Hỏng': 'What Hatches From A Ruined Bed',
  '"Luống nở sai mùa thì thứ nở ra cũng sai. Mười tám con đang bò quanh mép bãi, và ta không nhận ra con nào trong số đó." Dọn chúng đi. Ta vẫn sẽ ghi lại, vì ghi là việc của ta.':
    '"A bed that hatches out of season hatches the wrong things. Eighteen of them are crawling around the rim, and I do not recognise a single one." Clear them out. I will still write it down, because writing it down is my work.',
  'Thứ Không Nằm Trong Sổ': 'The Thing That Is Not In The Ledger',
  '"Ta ghi được mọi thứ trừ một chuyện: ngươi mạnh lên bằng cách nào. Người Vaeldra các ngươi không ăn, không ngủ thêm, mà tuần sau đánh khác tuần trước." Nâng hai chiêu lên một bậc rồi về đây. Ta muốn ghi đúng ngày nó xảy ra.':
    '"I can record everything but one thing: how you grow stronger. You people of Vaeldra do not eat more, do not sleep more, and next week you fight differently than last week." Raise two skills by one rank and come back. I want the date written down correctly.',
  'Kẻ Chặn Cuối Lối': 'What Blocks The End Of The Trail',
  '"Lối mòn không có phiến đá nào giữ, nên không có Tướng Quân nào NÊN ngồi ở đấy. Vậy mà có một con ngồi ở cuối lối, và nó không giữ gì cả — nó chỉ chặn." Đi hết lối. Xem thứ chặn ở cuối là cái gì.':
    '"No Rune holds a trail, so no Warden SHOULD be sitting on one. And yet there is one at the end of it, and it guards nothing — it only blocks." Walk the trail to the end. See what the thing at the end actually is.',
  'Thứ Ngồi Trên Nhịp Đá': 'The Thing On The Stone Span',
  '"Nhịp đá không có nền, nên không phiến nào cắm được, nên đáng lẽ không có gì phải canh ở đó." Nhưng có một con ngồi giữa nhịp, ngay trên hồ không đáy. Nó canh cái gì thì ngươi hỏi nó — ta thì không định hỏi.':
    '"A span has no bed under it, so no Rune can be set there, so there should be nothing on it worth guarding." But something sits in the middle of the span, right over the bottomless lake. Ask it what it is guarding — I do not intend to.',
  'Khúc Hát Tắt Theo Người Hát': 'The Song Dies With The Singer',
  '"Phiến đá trên này giữ một cái luật mỏng nhất trong bảy cái: khúc hát không tắt theo người hát." Nay người hát chết là khúc tắt theo. Hai mươi con đang ở chỗ lẽ ra là chỗ tập hát. Dọn đi cho ta.':
    '"The slab up here holds the thinnest of the seven laws: a song does not die with the one who sang it." Now the singer dies and the song goes with them. Twenty of them are standing where the singing ground used to be. Clear them out for me.',
  'Đất Nhả Ra Mỗi Ngày Một Chỗ': 'The Ground Gives It Up Somewhere New Each Day',
  '"Từ ngày phiến mỏng đi, đất nhả xương ra — mỗi ngày một chỗ khác, không bao giờ hai ngày cùng một nơi." Khai ba vỉa, ba ngày cũng được, ba vùng cũng được. Ta muốn biết đất chọn chỗ theo luật gì, hay là không theo gì cả.':
    '"Since the slab thinned, the ground has been giving bone back up — somewhere different every day, never the same place twice." Work three veins. Three days is fine, three regions is fine. I want to know what rule the ground picks by, or whether there is no rule at all.',
  'Người Ngồi Mép Vực Bắc': 'The Man On The North Rim',
  '"Dưới mép vực bắc có kẻ ngồi đếm. Đếm cái gì thì ta không biết, nhưng ba năm nay chưa sai một ngày nào." Xuống hỏi giúp ta đúng một câu: *khúc hát cuối cùng ông nghe được là ngày nào.*':
    '"Below the north rim someone sits and counts. What he counts I do not know, but in three years he has not missed a day." Go down and ask him exactly one question for me: *what day was the last song you heard.*',
  'Lò Nguội Qua Đêm': 'The Forges Go Cold Overnight',
  '"Cái luật trên đất này gọn lắm: lò không nguội qua đêm. Ba tuần nay đêm nào cũng nguội." Hai mươi hai tên trinh sát đang đếm số lò còn đỏ — đếm giúp ai thì ngươi tự đoán. Đừng để chúng đếm xong.':
    '"The law on this ground is a short one: a forge does not go cold overnight. For three weeks now every one of them has." Twenty-two scouts are out there counting which forges are still lit — you can guess who they are counting for. Do not let them finish.',
  'Sáu Cái Hòm Còn Nguyên': 'Six Chests Still Sealed',
  '"Đời trước chôn hòm khắp Lunacia rồi để lại một trại canh trên mỗi cái. Trại thì mục, hòm thì còn." Mở đủ sáu cái, bất kể vùng nào. Ta không cần thứ bên trong — ta cần biết còn bao nhiêu cái chưa ai đụng tới.':
    '"The ones before us buried chests across all of Lunacia and left a camp on top of each. The camps rotted; the chests did not." Open six of them, any region. I do not want what is inside — I want to know how many are still untouched.',
  'Thứ Chỉ Cái Lò Làm Được': 'What Only The Forge Can Do',
  '"Người Vaeldra khắc Rune vào THÉP. Bọn ta khắc vào đá, và đá thì mòn." Vào Lò Hỗn Độn hai lần — hỏng cũng được. Ta chỉ cần ngươi thấy tận mắt cái mà cả Lunacia này không làm nổi.':
    '"The people of Vaeldra carve Runes into STEEL. We carve into stone, and stone wears away." Work the Chaos Forge twice — a failure counts. I only need you to see with your own eyes the thing all of Lunacia cannot do.',
  'Đường Về Cây Hồn Đã Tối': 'The Road To The Soul Tree Has Gone Dark',
  '"Ta đánh trận sáu mươi năm. Chuyện duy nhất ta sợ là chết ở chỗ không có đèn." Hai mươi bốn tên đang đứng chắn đúng đoạn đường hồn phải đi qua. Chúng không biết chúng đang chắn cái gì — nhưng kẻ sai chúng thì biết.':
    '"I have fought for sixty years. The only thing I am afraid of is dying somewhere with no lamp." Twenty-four of them are standing across the exact stretch the souls must pass. They do not know what they are blocking — but whoever sent them does.',
  'Đếm Xem Còn Lại Gì': 'Count What Is Left',
  '"Mỗi cái hộp khoá kín là một người đã không quay lại lấy nó." Mở năm cái. Ta không cần đồ trong đó — ta muốn biết năm người ấy mang theo gì khi họ nghĩ mình sẽ về.':
    '"Every sealed box is one person who never came back for it." Open five. I do not want what is inside — I want to know what those five were carrying when they still thought they would return.',
  'Kẻ Đếm Ở Đáy Vực': 'The Counter At The Bottom',
  '"Dưới đáy vực sâu nhất có một kẻ vẫn ngồi đếm, dù trên này không còn ai nghe hắn đếm nữa." Xuống đó. Hỏi hắn một câu duy nhất: *cái tên thứ bảy trên bảng gỗ, ông có đọc được không.*':
    '"At the bottom of the deepest gorge someone still sits and counts, even though nobody up here is listening any more." Go down. Ask him one question and one only: *the seventh name on the wooden board — can you read it.*',
  'Lối Không Ai Giữ': 'A Trail Nobody Holds',
  '"Lối mòn đó không phải một NƠI — không ai dựng phiến đá trên một lối đi. Nên thứ gì đi qua đó cũng không phải xin phép ai." Dọn khoảnh đầu lối cho người sau còn đi được.':
    '"That trail is not a PLACE — nobody raises a slab on a path. So whatever walks it never has to ask anyone\'s leave." Clear the head of the trail so the next one through can still get through.',
  'Thuốc Mọc Ven Lối': 'Herbs Along The Trail',
  '"Chỗ nào không có luật giữ thì cỏ mọc theo ý nó. Mấy thứ mọc ven lối đó không có ở vùng nào khác — hái tám bụi về đây cho ta." Đi bộ, cúi xuống, hái. Không cần đánh ai.':
    '"Where no law holds, the grass grows as it pleases. What comes up along that trail grows nowhere else — bring me eight bushes of it." Walk, bend down, pick. No fighting needed.',
  'Thứ Lối Mòn Không Cho': 'What A Trail Will Not Give You',
  '"Lối mòn cho ngươi đường đi, không cho ngươi cái gì bền. Cái bền thì phải vào lò mà lấy." Bỏ gì đó vào Lò Hỗn Độn một lần — thắng hay hỏng không quan trọng, ta chỉ cần ngươi biết cái lò ở đâu.':
    '"A trail gives you a way through; it does not give you anything that lasts. For that you go to the forge." Put something into the Chaos Forge once — win or break, it does not matter, I only need you to know where the forge is.',
  'Đất Không Chịu Nổi Một Nét Khắc': 'Ground That Will Not Hold A Carving',
  '"Trũng đó nằm ngay dưới chỗ Sylas cắt trời. Cắm đá xuống đấy là đá NỨT — nên không phiến nào giữ được gì ở đó, kể cả cái luật ai được giết ai." Miệng trũng đang đông. Vào cẩn thận: dưới đó người cũng giết được người.':
    '"That hollow lies directly under the place Sylas cut the sky. Drive stone into it and the stone SPLITS — so no Rune holds anything down there, not even the law about who may kill whom." The mouth of the hollow is getting crowded. Go in carefully: down there people can kill people too.',
  'Cỏ Mọc Trên Vết Nứt': 'Grass On The Fracture',
  '"Có thứ chỉ mọc được ở chỗ đá đã nứt. Ta cần chín bụi — không phải để chữa ai, để xem cái nứt đó sâu tới đâu." Chín bụi rải khắp lòng trũng, và không ai giữ giúp ngươi chỗ nào.':
    '"Some things only grow where the stone has already split. I need nine bushes — not to heal anyone, but to see how deep that split runs." Nine bushes scattered across the hollow, and nobody down there is holding a spot for you.',
  'Nhắn Qua Chỗ Không Có Luật': 'A Message Across Lawless Ground',
  '"Vandai bên kia trũng. Ta không qua được — ta còn phải đếm trứng. Ngươi qua thì mang câu này: *đá dưới chân tôi đã mỏng tới mức nghe được tiếng bên dưới.*" Một câu, hai bờ, và không phiến nào bảo đảm ngươi tới được.':
    '"Vandai is on the far side of the hollow. I cannot cross — I still have eggs to count. If you cross, carry this: *the stone under my feet has worn thin enough that I can hear what is below it.*" One sentence, two banks, and no Rune guarantees you reach the other side.',
  'Nhịp Đá Không Có Nền': 'A Span With No Bed',
  '"Đường lên đỉnh đi qua một nhịp đá vắt trên hồ ngầm không đáy. Chỗ đó không có NỀN để cắm phiến nào, nên thứ dưới đó trồi lên lúc nào cũng được." Một lối, không đường vòng. Dọn thềm đá ướt.':
    '"The way up to the heights crosses a stone span strung over a bottomless underground lake. There is no BED there to set a Rune into, so whatever is below can come up whenever it likes." One path, no way around. Clear the wet stone.',
  'Hồ Không Thuộc Vùng Nào': 'A Lake That Belongs To No Region',
  '"Cái hồ đó không thuộc vùng nào, nên nó không có Dòng Cốt nào, nên chẳng ai xuống đó cày. Vì thế thứ mọc ở đó còn nguyên." Mười bụi trên đầu cầu rêu — trượt chân thì hồ dưới đó không có đáy.':
    '"That lake belongs to no region, so it has no Bone Line, so nobody goes down there to farm. Which is why what grows there is still untouched." Ten bushes at the mossy end of the crossing — slip, and the lake below has no bottom.',
  'Người Đếm Trứng Muốn Biết': 'The Egg-Counter Wants To Know',
  '"Sylas hỏi ta cái hồ dưới nhịp đá sâu bao nhiêu. Ta không biết, và đó chính là câu trả lời — nói với ông ấy đúng như thế." Đi ngược lại qua nhịp đá mà mang câu ấy về.':
    '"Sylas asked me how deep the lake under the span is. I do not know, and that is precisely the answer — tell him exactly that." Cross back over the span and carry it to him.',
});

/* ══ CHỖ TẦNG KỂ CHUYỆN THẬT SỰ HIỆN RA ═══════════════════════════════════════════════
   Khối `EXACT` ngay trên chứng minh `lang.js` DỊCH ĐƯỢC 190 chuỗi kể chuyện. Nó KHÔNG chứng
   minh chúng tới được mắt người chơi — `test_dichen §④` bơm từng chuỗi vào một <div> RỜI, tức
   nó đo một text-node do chính nó dựng ra, không đo cái text-node mà game dựng.

   Quét lại bằng cách MỞ ĐÚNG mấy cái bảng ấy ra (Nhật Ký · thẻ nhiệm vụ trên HUD · bảng Kỹ
   Năng · lời nhắc góc màn) thì lòi ra một tập hoàn toàn khác: tên nhiệm vụ đi kèm hậu tố
   (`◈ <tên> —`), tên NPC ghép vào câu (`— xong, về gặp <ai>`), mục tiêu ngày ghép số, và mấy
   dòng chưa ai khai bao giờ. Không dòng nào trong số đó nằm trong 190 chuỗi kia.

   *Một phép đo dựng lấy cảnh của chính nó thì nó chỉ gác được cái cảnh ấy.* Cùng vết sẹo đã
   ghi cho §③ (quét 15 bảng, bỏ qua HUD) và cho bộ quét đọc tệp của đài phun nước. */
Object.assign(EXACT, {
  '★ Chính tuyến hoàn tất!': '★ Main story complete!',
  'Bạn là Kẻ Gỡ Rune Cuối — tự do rèn luyện.': 'You are the Last Rune-Taker — train as you please.',
  'Kẻ Gỡ Rune Cuối': 'The Last Rune-Taker',
  '✦ Chưa có nhiệm vụ': '✦ No quests yet',
  'Chuỗi nhiệm vụ đang được dựng lại. Cứ đi săn, rèn đồ và cày Cốt — mọi hệ thống khác vẫn chạy.':
    'The quest chain is being rebuilt. Keep hunting, forging and working Bone — every other system still runs.',
  '??? Vùng Chưa Mở': '??? Region Not Opened',
  '🧭 Tới': '🧭 Go',
  'đã tới mốc cuối': 'final milestone reached',
  // lời nhắc góc màn (`hint-toast`) vỡ quanh thẻ <b> đúng như sáu bước hướng dẫn
  '💠 Còn': '💠 You have',
  'điểm Tiềm Năng chưa phân — cộng ngay cho khỏi phí!':
    'unspent Potential points — put them in before they go to waste!',
  'Phân Ngay': 'Spend Now',
  '✦ Đang có': '✦ You are holding',
  'chưa dùng — quay thử một lượt ×10!': 'unused — try a ×10 pull!',
});
RULES.unshift(
  // Thẻ nhiệm vụ trên HUD: tên phụ tuyến đi kèm hậu tố ' — ' rồi mới tới <span> tiến độ, nên
  // NGUYÊN cái tên không bao giờ đứng một mình trong một text-node. Gọi lại `tr()` cho phần
  // tên để nó dùng đúng bản dịch đã khai ở khối trên — đừng khai lại tên lần thứ hai.
  [/^◈ (.+) —$/,               (m, a) => `◈ ${tr(a)} —`],
  [/^— xong, về gặp (.+)$/,    (m, a) => `— done, report to ${tr(a)}`],
  [/^✔ về gặp (.+)$/,          (m, a) => `✔ report to ${tr(a)}`],
  // Mục Tiêu Hôm Nay — `DAILY_META[].ten(n)` ghép SỐ vào câu, mà số đổi theo bảy dải cấp.
  // Ba mục từ chép cứng (`… 1 lần`, `… 2 lần`, `Khai 1 Vỉa Cốt`) vẫn còn ở trên và vẫn thắng
  // vì `EXACT` được hỏi trước — mấy luật này chỉ đỡ phần còn lại của thang.
  [/^Rèn \/ nâng tầng \/ khảm ngọc (\d+) lần$/, (m, a) => `Forge / tier up / socket a jewel ${a} times`],
  [/^Hạ (\d+) Trùm Vùng$/,     (m, a) => `Defeat ${a} Region Bosses`],
  [/^Khai (\d+) Vỉa Cốt$/,     (m, a) => `Open ${a} Bone Veins`],
  // bảng Kỹ Năng
  [/^bậc (\d+)\/(\d+)$/,       (m, a, c) => `rank ${a}/${c}`],
  [/^📜 Sách Kỹ Năng nâng thẳng 1 cấp, khỏi tốn Lumen lẫn Bản Năng \(còn (\d+)\)$/,
    (m, a) => `📜 A Tome raises one level outright — no Lumen, no Instinct (${a} left)`]
);

/* ══ BẢNG NPC (`panel-quest`) — 377 dòng, và nó là MẶT BÀY HÀNG CỦA CẢ GAME ══════════════
   Khối ngay trên đã đi theo bảng Nhật Ký, thẻ nhiệm vụ trên HUD và lời nhắc góc màn. Quét
   rộng hơn (5 lớp × 7 cấp × mọi NPC, lái bằng `tryTalk()` thật) thì lòi ra một mặt lớn hơn
   hẳn tất cả những mặt ấy cộng lại: **377 dòng nằm trong `panel-quest`** — thoại NPC, quầy
   thuốc, quầy rương, Trại Ngựa, Vực Thẳm, Truy Nã. Đó là bảng mà người chơi mở ra nhiều
   nhất trong mười phút đầu, và nó đang tiếng Việt gần như trọn vẹn.

   Vì sao không bài nào bắt được: `test_dichen §④` bơm từng chuỗi vào một <div> RỜI nên nó
   chỉ chứng minh `lang.js` DỊCH ĐƯỢC chuỗi, không chứng minh chuỗi tới được mắt người chơi;
   còn §③ quét 15 bảng nhưng KHÔNG mở bảng NPC, vì bảng NPC chỉ dựng ra khi đứng cạnh một
   người và bấm E. *Một phép quét không mở được cái bảng thì nó không gác được cái bảng ấy.*

   Chia việc theo đúng lối cũ: 77 dòng KHÔNG có số → `EXACT` (nguyên chuỗi, vì thoại NPC là
   văn xuôi liền mạch); 33 khuôn CÓ số → `RULES`, vì số đổi theo cấp, theo túi và theo đồng
   hồ. Đừng khai bản có số vào `EXACT`: nó chỉ đúng ở đúng một trạng thái người chơi. */
Object.assign(EXACT, {
  // ─ bảy mục tiêu Truy Nã (`TRUYNA_BANDS`) — chưa cái nào từng được khai
  'Đầu Lĩnh Gloam': 'Gloam Headman',
  'Đại Đầu Mục Gloam': 'Gloam Grand Headman',
  'Chỉ Huy Phản Loạn Werebear Woods': 'Werebear Woods Rebel Commander',
  'Chúa Tể Hang Sâu': 'Lord of the Deep Cave',
  'Độc Hoa Chúa Tể': 'Lord of the Venom Bloom',
  'Tàn Tướng Tro Tàn': 'Ashen Remnant General',
  'Sát Thần Bão Tố': 'Storm Deathbringer',
  '⚖ Truy Nã Lệnh hôm nay': "⚖ Today's Bounty Writ",
  'Nhận Truy Nã': 'Take the Bounty',
  'Mục tiêu:': 'Target:',
  'Nơi ẩn náu:': 'Hideout:',
  'Cần đạt': 'Requires',

  // ─ quầy thuốc · quán trọ
  'Lọ Mana': 'Mana Flask',
  'Trị Thương Toàn Phần': 'Full Heal',
  'Nghỉ Trọ': 'Rest at Inn',
  'Nghỉ ngơi dưỡng thần': 'Rest and recover',
  'Men say bừng bừng sát khí': 'Liquor that stokes the killing edge',
  'Mang theo khi vào vùng bão': 'Carry this into storm country',
  'Nhà Giả Kim tự tay bào chế — dùng ngay tại chỗ':
    'Brewed by the Alchemist by hand — drink it on the spot',
  '(không chết) +': '(without dying) +',

  // ─ quầy rương · quầy hàng
  'HÀNG THƯỜNG': 'STANDARD STOCK',
  'Rương Binh Khí': 'Weapon Chest',
  'Rương Phòng Cụ': 'Armor Chest',
  'RƯƠNG — rẻ hơn hàng bày, nhưng không biết trước ra gì':
    'CHESTS — cheaper than the shelf, but you cannot see what is inside',
  'Vũ khí ngẫu nhiên theo cấp của bạn — có thể ra hàng hiếm':
    'A random weapon scaled to your level — a rare piece is possible',
  'Giáp trụ ngẫu nhiên theo cấp — có thể ra trang bị Hoàn Hảo':
    'Random armour scaled to your level — a Flawless piece is possible',
  'Rê chuột lên món để xem đủ chỉ số và so với đồ đang mặc.':
    'Hover a piece to see its full stats and compare it against what you are wearing.',
  'Dọn túi nhanh — nhận Lumen ngay': 'Clear the bag fast — Lumen on the spot',
  'Túi tiền:': 'Purse:',
  '◈ Lumen đang có:': '◈ Lumen on hand:',
  '· mỗi lượt quay': '· per pull',

  // ─ Trại Ngựa — Mục Đồng
  'Trại Ngựa — Mục Đồng': 'Stable — the Herder',
  'Mã Thầu': 'Bridle Cord',
  'Mã Thầu đang có': 'Bridle Cords on hand',
  'Tuấn Mã đã bắt hôm nay': 'Steeds caught today',
  'THÂN ĐANG DÙNG:': 'BODY IN USE:',
  'lớp nhân vật': 'your character class',
  '"Tuấn mã hoang chạy ngoài đồng kia — lại gần nó sẽ vùng chạy, rượt đến khi':
    '"Wild steeds run the fields out there — get close and they bolt. Chase one until it is',
  'kiệt sức': 'spent',
  'rồi bấm': 'then press',
  'mà bắt. Mỗi con cho một cuộn': 'to catch it. Each one yields a coil of',
  ': khi thăng giai thú cưỡi, dùng': ': when you raise a mount a tier, spend it for',

  // ─ Vực Thẳm
  '☁ VỰC THẲM — liều mình thử vận': '☁ THE ABYSS — stake yourself on luck',
  '☁ Vách cao mây phủ — phàm nhân nhảy xuống chỉ có nát thây.':
    '☁ A cloud-wrapped cliff — an ordinary man who jumps is simply broken on the rocks.',
  'Cái giá mỗi lần nhảy:': 'Price of each jump:',
  'nhảy vào Vực Thẳm': 'to leap into the Abyss',
  'khi ấy mới đủ sức': 'only then are you hard enough',
  '— Trang bị theo cấp (phẩm Lam trở lên)': '— Gear scaled to your level (Blue quality or better)',
  '— Tứ Châu ngẫu nhiên (Chúc Phúc / Linh Hồn / Sinh Mệnh / Hỗn Độn)':
    '— A random one of the Four Jewels (Bless / Soul / Life / Chaos)',
  '— Vật liệu rèn (Hỗn Nguyên) hoặc Sách Kỹ Năng':
    '— Forging stock (Chaos) or a Tome',
  '— Gặp hiền giả ẩn danh: được chỉ điểm': '— You meet a nameless sage: you are pointed the way',
  '— Hang động giấu cổ thư:': '— A cave that hides old writings:',
  '— Cổ thư hiếm: Mảnh Cổ Thư · Huyết Ma Thôn Phệ (đã thành tựu → ● Hỗn Độn Châu)':
    '— Rare writings: a Tome Fragment · Blood Demon Devour (already mastered → ● Jewel of Chaos)',

  // ─ chỗ khác trong bảng
  'Lực chiến': 'Combat Power',
  '★ Chính tuyến đã hoàn tất — bạn là Kẻ Gỡ Rune Cuối.':
    '★ The main story is complete — you are the Last Rune-Taker.',

  // ─ 22 câu thoại NPC phố Ardhaven. Chúng là VĂN XUÔI LIỀN, không tag nào chen vào, nên
  //   khai nguyên chuỗi là đúng — cùng lý do 190 chuỗi kể chuyện ở khối trên khai nguyên.
  '"Binh khí nhà ta ba đời rèn giũa — cứ ngắm cho kỹ rồi hẵng trả tiền."':
    '"Three generations of my house have forged these — look them over well before you pay."',
  '"Bọn cháu chơi đuổi bắt. Ai chạm vào bậc thềm nhà bác thợ rèn là thua, vì bác ấy sẽ ra mắng — luật do bác ấy đặt, không phải bọn cháu."':
    '"We’re playing tag. Whoever touches the smith’s doorstep loses, because he comes out and scolds you — his rule, not ours."',
  '"Chép tay cả, không có bản thứ hai. Cầm nhẹ tay cho."':
    '"All copied by hand, and there is no second copy. Handle it gently."',
  '"Con này ta nhặt lúc nó còn nhỏ bằng bàn tay. Nó không hiền đâu — nó chỉ quen ta thôi. Quen với hiền là hai chuyện khác nhau, nhớ cho kỹ."':
    '"I picked this one up when it fit in my palm. It is not gentle — it is only used to me. Used-to and gentle are two different things; remember that."',
  '"Cái ghế này quay mặt ra phố lớn. Ta ngồi từ lúc mặt trời chưa qua nóc nhà đối diện, tới lúc nó khuất sau đó. Ngày nào cũng vậy, và ta chưa chán ngày nào."':
    '"This chair faces the main street. I sit from before the sun clears the roof opposite until it drops behind it. Every day the same, and not one day have I tired of it."',
  '"Cả phố đặt ta đóng cửa mới. Cửa cũ vẫn tốt cả — chỉ là ai cũng muốn cái then dày hơn ngón tay cái. Ta đóng, ta không hỏi vì sao."':
    '"The whole street orders new doors from me. The old ones are all sound — everyone simply wants a bolt thicker than a thumb. I build them; I do not ask why."',
  '"Cổng Nam mở ra Beast Herd Camp. Đất bằng, cỏ cao ngang thắt lưng, và bầy thú ngoài đó không sợ người nữa — đó mới là chỗ đáng ngại."':
    '"The South Gate opens onto Beast Herd Camp. Flat ground, grass to the waist, and the herds out there no longer fear people — that is the worrying part."',
  '"Cổng Đông dẫn vào Werebear Woods. Rừng già, cây to hai người ôm, và giữa ban ngày trong đó tối như lúc chập tối."':
    '"The East Gate leads into Werebear Woods. Old forest, trunks two men cannot reach around, and at midday it is as dark in there as dusk."',
  '"Giếng ở đầu phố, nhà ta ở cuối phố. Mười hai chuyến một ngày, và ta thuộc từng viên đá lát trên đoạn đường đó — kể cả viên bị nứt từ hôm khu phố này rơi sang."':
    '"The well is at the top of the street and my house at the bottom. Twelve trips a day, and I know every paving stone on that stretch — including the one cracked since the day this quarter fell through."',
  '"Hoa của ta trồng ở luống sau nhà, không phải hàng gánh từ ngoài đồng vào. Cành ngắn hơn thật, nhưng cắm trong nhà được bảy ngày."':
    '"My flowers come from the beds behind the house, not hauled in from the fields. The stems are shorter, true, but they last seven days indoors."',
  '"Ngồi xuống đã. Ngươi vừa đi qua một thứ mà phần lớn người đi qua đều không dậy nổi."':
    '"Sit down first. You have just come through a thing most who come through it never get up from."',
  '"Qua cổng này là đường lên Bird Tribe Heights. Dốc, gió ngược, và trên đó chim làm tổ trên đá chứ không làm trên cây — cứ nhìn tổ là biết mình lên tới đâu."':
    '"Through this gate is the climb to Bird Tribe Heights. Steep, wind in your face, and up there the birds nest on stone rather than in trees — read the nests and you know how high you have come."',
  '"Ra Cổng Tây rồi đi thẳng là tới Rẻo Rừng Corran. Rừng thấp, nhiều lối, mà lối nào cũng giống lối nào. Nhớ đường về hơn là nhớ đường đi."':
    '"Out the West Gate and straight on is the Corran Thicket. Low forest, many paths, and every path looks like every other. Remember the way back rather than the way there."',
  '"Rell bảo ngươi tới. Ông ấy tin người nhanh hơn ta nhiều."':
    '"Rell sent you. He trusts people a great deal faster than I do."',
  '"Sáng quét lá, chiều quét bụi, tối quét thứ khách say làm rơi. Phố sạch thì không ai khen. Phố bẩn thì ai cũng biết là ta."':
    '"Leaves in the morning, dust in the afternoon, and whatever the drunks drop at night. A clean street earns no praise. A dirty one, and everyone knows whose it is."',
  '"Ta chạy tin giữa bốn cổng, trong tường thôi. Thư gửi ra ngoài thành thì ta không nhận — ngoài đó không có ai đứng đợi ở đầu đường cả."':
    '"I run messages between the four gates, inside the walls only. Letters bound outside I will not take — out there nobody is waiting at the end of the road."',
  '"Ta gánh hai thúng, một thúng bánh một thúng chè. Thúng nào bán hết trước thì sáng mai ta gánh thúng đó nặng hơn. Đơn giản thế thôi."':
    '"I carry two baskets, one of cakes and one of sweet soup. Whichever empties first, I load heavier tomorrow morning. It is that simple."',
  '"Ta hát bài nào cũng được, trừ bài về cái đêm trời nứt. Hát bài đó thì có người bỏ về, có người ngồi lại khóc — mà cả hai hạng đều không bỏ tiền."':
    '"I will sing anything but the song about the night the sky split. Sing that one and some walk out, some stay and weep — and neither sort pays."',
  '"Ta vượt vết nứt cùng ba mươi người. Về tới đây còn một. Đừng hỏi tên đội — không còn ai gọi tên đội đó nữa."':
    '"Thirty of us crossed the tear. One reached this place. Do not ask the company’s name — nobody says it any more."',
  '"Ta đi từ Cổng Tây sang Cổng Đông rồi quay lại, mỗi vòng đúng một khắc. Việc chán lắm. Nhưng chán là dấu hiệu tốt, ngươi cứ tin ta."':
    '"West Gate to East Gate and back, one quarter-hour a circuit. Dull work. But dull is a good sign — take my word for it."',
  '"Tay ta xanh tới khuỷu, rửa cách gì cũng không ra. Khách nhìn tay ta rồi mới tin mấy tấm vải treo kia là màu thật chứ không phải màu quét."':
    '"My hands are blue to the elbow and nothing washes it out. Customers look at my hands, and only then believe the cloth hanging there is dyed through and not painted on."',
  '"Tỉ lệ ta dán trên vách, chữ to bằng bàn tay, ai đứng ngoài cửa cũng đọc được. Đọc xong mà vẫn quay thì đó là việc của ngươi, không phải lỗi của ta."':
    '"The odds are pasted on my wall in letters the size of a hand; anyone in the doorway can read them. Read them and pull anyway, and that is your business, not my fault."',
  '"Vào đây uống chén trà nóng đã — chuyện Lunacia để sau hẵng hay."':
    '"Come in and take a cup of hot tea first — Lunacia can wait."',
  '"Vách này mỗi sáng ta dán một tờ, mỗi chiều gỡ một tờ. Trước đây gỡ vì hết hạn. Dạo này thì gỡ vì có người mang việc về xong — ta thích cách gỡ đó hơn."':
    '"Each morning I paste one sheet on this wall and each evening I take one down. It used to be because they expired. Lately it is because someone has brought the work back finished — I prefer taking them down that way."',

  // ─ Lò Hỗn Độn (`forge-content`) — bảng rèn, và nó cũng chưa từng bị quét
  '⚙ Lò Hỗn Độn': '⚙ Chaos Machine',
  'KHAY HỖN ĐỘN': 'CHAOS TRAY',
  'CÔNG THỨC': 'RECIPES',
  'TRANG BỊ': 'GEAR',
  'Rèn Trang Bị': 'Forge Gear',
  'Khảm Ngọc': 'Socket Jewel',
  'Chế Tạo': 'Craft',
  'Lấy hết ra': 'Take all out',
  'Khay hiện tại không khớp công thức': 'No',
  'nào.': 'recipe matches the current tray.',
  'Gợi ý:': 'Try:',
  'bấm món trong túi để bỏ vào · bấm ô khay để lấy ra':
    'click a bag item to put it in · click a tray slot to take it out',
  'bấm để bỏ vào khay': 'click to put it in the tray',
  '— 1 trang bị +9/+10/+11 · ngọc': '— 1 piece at +9/+10/+11 · jewel',
  'Bỏ trang bị và ngọc vào khay bên dưới.': 'Put gear and jewels into the tray below.',
  'Lượt tung': 'Roll',

  // ─ bảng Nhân Vật · lời nhắc góc màn còn sót
  '(dòng chính) +': '(main line) +',
  '(dòng phụ) — dồn điểm vào đó là hiệu quả nhất.':
    '(secondary line) — pouring points there is the most efficient.',
  ', dồn vào chỉ số lớp mình gợi ý': ', pour them into the stat your class calls for',
  'Mở Bảng': 'Open Panel',
  'điểm Tiềm Năng — bấm': 'Potential points — press',
  'điểm Đại Thành chưa phân — mở bảng để chọn nhánh!':
    'unspent Mastery points — open the panel and pick a branch!',
  '💠 Có': '💠 You have',
  '✦ Còn': '✦ Left',
});
RULES.unshift(
  // ⚠ KHUÔN CÓ SỐ PHẢI VÀO `RULES`, ĐỪNG VÀO `EXACT`. Mấy dòng này ghép máu hiện tại, số lọ
  //   đang mang, đồng hồ nhập hàng và cấp người chơi — khai nguyên chuỗi là chỉ dịch đúng ở
  //   MỘT trạng thái, còn mọi trạng thái khác thì trơ tiếng Việt và không ai thấy.
  [/^Hồi đầy máu — đang ([\d.,]+)\/([\d.,]+)$/,
    (m, a, b) => `Full heal — currently ${a}/${b}`],
  [/^Hồi đầy máu và Mana — đang ([\d.,]+)\/([\d.,]+) máu · ([\d.,]+)\/([\d.,]+) Mana$/,
    (m, a, b, c, d) => `Full heal and Mana — currently ${a}/${b} HP · ${c}/${d} Mana`],
  [/^Hồi (\d+)% máu \(~([\d.,]+)\) · đang có (\d+)\/(\d+)$/,
    (m, p, v, c, d) => `Restores ${p}% HP (~${v}) · carrying ${c}/${d}`],
  [/^Hồi (\d+)% Mana — bấm T, mang tối đa (\d+) lọ$/,
    (m, p, n) => `Restores ${p}% Mana — press T, carry up to ${n} flasks`],
  [/^Mang theo (\d+)\/(\d+) lọ — Mana ([\d.,]+)\/([\d.,]+)$/,
    (m, a, b, c, d) => `Carrying ${a}/${b} flasks — Mana ${c}/${d}`],
  [/^Uống bằng phím R — túi đựng tối đa (\d+) lọ$/,
    (m, n) => `Drink with R — the bag holds at most ${n} flasks`],
  [/^Trọng Thương (\d+) phút$/, (m, n) => `Grievous Wound for ${n} minutes`],
  [/^-(\d+)% Sinh Lực$/, (m, n) => `-${n}% Max HP`],
  [/^−(\d+)% sát thương thiên lôi trong (\d+) phút$/,
    (m, a, b) => `−${a}% lightning damage for ${b} minutes`],
  [/^HÀNG BÀY — còn (\d+)\/(\d+) món · nhập hàng sau (\d+):(\d+)$/,
    (m, a, b, c, d) => `ON THE SHELF — ${a}/${b} left · restock in ${c}:${d}`],
  [/^VẬT PHẨM QUÝ — đổi sau (\d+):(\d+)$/,
    (m, a, b) => `PRIZE GOODS — rotates in ${a}:${b}`],
  [/^Bán hết đồ trắng\/lục \((\d+) món\)$/,
    (m, n) => `Sell every white/green piece (${n} items)`],
  [/^Mở ra trang bị cấp (\d+)-(\d+)(\+?) — có thể ra dòng Hoàn Hảo$/,
    (m, a, b, p) => `Opens gear for levels ${a}-${b}${p} — a Flawless line is possible`],
  [/^Tầng theo cấp của bạn · đang giữ (\d+) hạp · mở ở Túi Đồ → Box Kundun$/,
    (m, n) => `Tier follows your level · holding ${n} boxes · open them in Bag → Box Kundun`],
  [/^◑ Quay Vận May — ([\d.,]+)◈$/, (m, n) => `◑ Spin for Luck — ${n}◈`],
  [/^· Túi đồ (\d+)\/(\d+)$/, (m, a, b) => `· Bag ${a}/${b}`],
  [/^\(sức mạnh theo cấp (\d+)\)$/, (m, n) => `(power scaled to level ${n})`],
  [/^\(hết → \+(\d+) 📜\)$/, (m, n) => `(none left → +${n} 📜)`],
  [/^(\d+) kỹ năng chưa ngộ$/, (m, n) => `${n} skills not yet learned`],
  [/^học miễn phí (\d+) kỹ năng tự do$/, (m, n) => `learn ${n} free skills at no cost`],
  [/^Nâng thẳng (\d+) cấp cho một chiêu của lớp mình — bảng K, khỏi tốn Lumen lẫn Bản Năng$/,
    (m, n) => `Raises one of your class skills by ${n} level outright — panel K, no Lumen and no Instinct`],
  [/^\+(\d+) Hỗn Nguyên Thạch · đang có (\d+)$/,
    (m, a, b) => `+${a} Chaos Stone · holding ${b}`],
  [/^−(\d+)✦ phí$/, (m, n) => `−${n}✦ on the fee`],
  [/^Reward: Lumen — mỗi ngày (\d+) lần$/, (m, n) => `Reward: Lumen — ${n}× per day`],
  [/^Thợ Rèn Truyền Thuyết \+(\d+)%$/, (m, n) => `Legendary Smith +${n}%`],
  [/^\(cảnh (\d+), tự động ở cấp (\d+)\) để Thăng Linh,$/,
    (m, a, b) => `(realm ${a}, automatic at level ${b}) to Ascend,`],
  [/^Giờ Vàng \((\d+)h & (\d+)h mỗi ngày\): tỉ lệ cổ thư\/hiền giả ×([\d.,]+)\.$/,
    (m, a, b, c) => `Golden Hour (${a}h & ${b}h daily): odds of writings and sages ×${c}.`],
  [/^— Hang động cổ xưa: (\d+)-(\d+) 📜 Sách Kỹ Năng$/,
    (m, a, b) => `— An ancient cave: ${a}-${b} 📜 Tomes`],
  [/^— Lọt vào hang động: (\d+)-(\d+) 📜 Sách Kỹ Năng$/,
    (m, a, b) => `— You drop into a cave: ${a}-${b} 📜 Tomes`],
  [/^— Rơi vào lùm cây \/ dòng suối: (\d+)-(\d+) 📜 Sách Kỹ Năng \+ ([\d.,]+)-([\d.,]+)◈ Lumen$/,
    (m, a, b, c, d) => `— You land in brush or a stream: ${a}-${b} 📜 Tomes + ${c}-${d}◈ Lumen`],
  [/^Tuấn Mã Hoang ở ba đồng cỏ Outskirts \(và Reptile Sunstone Flats — phụ tuyến «Tuấn Mã Reptile Sunstone Flats» cấp (\d+)\)\.$/,
    (m, n) => `Wild Steeds graze the three Outskirts meadows (and Reptile Sunstone Flats — side quest «Steeds of Reptile Sunstone Flats», level ${n}).`],
  [/^mỗi cuộn \(tối đa (\d+) cuộn\/lần\)\. Ngày chỉ bắt (\d+) con thôi — ngựa cũng cần nghỉ!"$/,
    (m, a, b) => `per coil (at most ${a} coils a time). Only ${b} a day — horses need rest too!"`],
  [/^"Vết nứt xé qua chỗ này thì kéo đi một mảng đất, và chỗ đất mất đi để lại cái vực đằng sau lưng ta\. Ta ngồi đây đếm người nhảy xuống\. Ai đủ cứng — từ cấp (\d+) trở lên — thì còn leo lên lại được\."$/,
    (m, n) => `"The tear ripped through here and took a slab of ground with it, and where the ground went there is the chasm behind my back. I sit here counting the ones who jump. Whoever is hard enough — level ${n} and up — can still climb back out."`]
);

/* ══ BĂNG-RÔN GIỮA MÀN (`zoneBanner`) — 108 chuỗi, và KHÔNG BÀI NÀO GÁC ĐƯỢC NÓ ═════════
   `test_dichen §②` bọc `fillText` rồi đọc lại, nên nó chỉ thấy chuỗi nào TÌNH CỜ vẽ ra
   trong ~30 giây bài chạy. Mà băng-rôn thì phần lớn nổ ở một **mốc GIỜ THẬT** (Hung Thần
   0/4/8/12/16/20h · Đàn Vàng 2/6/10/14/18/22h · Vực Nứt 0/6/12/18h) hoặc ở một sự kiện một
   lần trong đời (Tái Sinh, thông quan Tầng Sâu, hoàn lại di trú). Lượt chạy hôm nay rơi
   trúng mốc "10 phút nữa Đàn Vàng" ⇒ §② đỏ **2 chuỗi**, và đó là cách cả mặt này lộ ra.

   Quét thẳng `zoneBanner = {…}` trong `game.js` rồi hỏi từng chuỗi qua bộ dịch thật:
   **59 / 65 chuỗi THUẦN chưa dịch**. Đây là chữ to nhất trên màn hình, giữa khung nhìn.

   ⚠ **PROBE BẢN ĐẦU BÁO 102/108 VÀ ĐÓ LÀ BÁO ĐỘNG GIẢ.** Nó thay mọi `${…}` bằng một mốc
   `§` rồi hỏi — mà thay thế ấy **phá mọi luật `RULES` có `(\d+)`**, nên chuỗi có khuôn đều
   ra "chưa dịch" dù luật khớp hoàn hảo với bản THẬT. Chỉ chuỗi KHÔNG có `${}` mới kết luận
   được bằng cách đó; phần có khuôn phải viết `RULES` rồi đo lại trên bản đã ghép số.

   ⚠ **NỬA DỊCH CÒN TỆ HƠN KHÔNG DỊCH.** `⏱ HẾT GIỜ — PHÓ BẢN THẤT BẠI` từng ra
   `⏱ HẾT GIỜ — DUNGEON THẤT BẠI` và `5 phút giảm 40% sát thương thiên lôi…` ra
   `5 min: giảm 40% lightning damage…` — đó là `TERMS` thay lẻ từng từ khi không `EXACT` nào
   khớp. `EXACT` được hỏi TRƯỚC nên khai đủ câu là nó thắng. */
Object.assign(EXACT, {
  // ── Hung Thần (Ma Tôn) ──
  '⚠ HUNG THẦN SẮP GIÁNG THẾ': '⚠ THE DREAD ONE IS COMING',
  '☠ HUNG THẦN GIÁNG THẾ': '☠ THE DREAD ONE DESCENDS',
  '☠ HUNG THẦN XUẤT HIỆN': '☠ THE DREAD ONE APPEARS',
  '☠ HUNG THẦN ĐÃ BỊ TIÊU DIỆT': '☠ THE DREAD ONE IS DESTROYED',
  'Hung Thần đã rời đi': 'The Dread One has gone',
  'Ngay trước mắt — toàn lực ứng chiến!': 'Right in front of you — give it everything!',
  'Tà khí tản dần — hẹn khung giờ sau.': 'The blight thins out — until the next hour.',
  // ── Xâm Lăng Vàng ──
  '✦ ĐÀN VÀNG SẮP XÂM LĂNG': '✦ THE GILDED HERD IS COMING',
  '✦ ĐÀN VÀNG TRÀN VÀO': '✦ THE GILDED HERD POURS IN',
  '✦ XÂM LĂNG VÀNG': '✦ GILDED INVASION',
  '✦ CHÚA ĐÀN VÀNG GỤC NGÃ': '✦ THE GILDED HERD-LORD FALLS',
  '✦ ĐÀN VÀNG BỊ QUÉT SẠCH': '✦ THE GILDED HERD IS WIPED OUT',
  'Đàn Vàng đã rút lui': 'The Gilded Herd has withdrawn',
  'Toàn bộ Box Kundun đã vào túi — mở trong Túi Đồ (phím I)!':
    'Every Box Kundun is in your bag — open them in the Bag (key I)!',
  // ── Vực Nứt ──
  '✹ VỰC NỨT TOÁC NGAY GIỮA BÃI': '✹ A RIFT TEARS OPEN MID-GROUND',
  '✹ CHÚA TỂ VỰC NỨT GỤC NGÃ': '✹ THE RIFT LORD FALLS',
  // ── Truy Nã ──
  '⚖ ĐÃ NHẬN TRUY NÃ LỆNH': '⚖ BOUNTY WRIT ACCEPTED',
  '⚖ TRUY NÃ HOÀN THÀNH': '⚖ BOUNTY COMPLETE',
  '◈ TRUY NÃ HOÀN TẤT': '◈ BOUNTY SETTLED',
  'Mục tiêu đã phục pháp — về Sapidae Chiefdom gặp Bổ Đầu nhận Công Huân Lệnh!':
    'The target has answered for it — return to Sapidae Chiefdom and see the Constable for your Writ of Merit!',
  'Mang Lumen đến Sảnh Cầu May — Thương Nhân Vận May sẽ mở một lượt quay (5% ra cổ thư hiếm)!':
    'Bring the Lumen to the Hall of Fortune — the Fortune Trader will open a pull for you (5% for rare writings)!',
  // ── Vạn Duyên Các · Vận May ──
  '☁ VẬN MAY NGÀN VÀNG': '☁ FORTUNE WORTH A THOUSAND',
  '◑ VẬN MAY NGÀN VÀNG': '◑ FORTUNE WORTH A THOUSAND',
  '☁ HIỀN GIẢ CHỈ ĐIỂM': '☁ A SAGE POINTS THE WAY',
  // ── Rune · Tướng Quân · Cổng Vực ──
  '⛨ PHONG ẤN RUNE': '⛨ RUNE SEAL',
  'Phong ấn nguyên tố vùng này tạm được giữ vững — phần thưởng Chinh Phạt đã trao.':
    "This region's elemental seal holds for now — the Conquest reward has been paid.",
  '☠ NGƯỜI THỨ BẢY ĐÃ NGÃ': '☠ THE SEVENTH HAS FALLEN',
  'KẺ GỠ RUNE CUỐI': 'THE LAST RUNE-TAKER',
  'Chính tuyến hoàn tất — danh hiệu tối thượng đã mở (bấm C chọn danh hiệu)':
    'Main story complete — the highest title is unlocked (press C to choose a title)',
  // ── Vỉa Cốt · Rương Canh ──
  '◆ VỈA CỐT ĐÃ KHAI': '◆ BONE VEIN OPENED',
  '▣ RƯƠNG CANH ĐÃ MỞ': '▣ GUARDED CHEST OPENED',
  // ── Lò Hỗn Loạn · Tái Sinh ──
  '◑ LÒ HỖN LOẠN — THÀNH CÔNG!': '◑ CHAOS MACHINE — SUCCESS!',
  '◑ LÒ HỖN LOẠN — THẤT BẠI': '◑ CHAOS MACHINE — FAILED',
  '3 món đã tan thành tro bụi — Hỗn Loạn vô thường.':
    'Three pieces turned to ash — Chaos keeps no promises.',
  '🔄 TÁI SINH': '🔄 RESET',
  // ── Tầng Sâu · Lò Khắc ──
  '⛨ CỬA ĐÁ MỞ': '⛨ THE STONE DOOR OPENS',
  'Phòng kế tiếp đã thông — tiến lên phía Bắc!': 'The next room is clear — press north!',
  '⏱ HẾT GIỜ — PHÓ BẢN THẤT BẠI': '⏱ TIME UP — DUNGEON FAILED',
  'PHÓ BẢN THÔNG QUAN!': 'DUNGEON CLEARED!',
  'Mất sạch chiến lợi phẩm cả lượt — lần sau nhớ rút đúng lúc.':
    'The whole run’s spoils are gone — next time, pull out in good time.',
  '✦ CHẠM ĐÁY VỰC SÂU': '✦ THE DEEP FLOOR REACHED',
  // ── rơi đồ · mục tiêu ngày · Đọa Ma ──
  '✦ HOÀN HẢO!': '✦ FLAWLESS!',
  'Trang bị Hoàn Hảo vừa rơi xuống — nhặt ngay!': 'A Flawless piece just dropped — grab it!',
  '☀ HOÀN THÀNH MỤC TIÊU HÔM NAY!': "☀ TODAY'S GOALS COMPLETE!",
  '⚠ TỰ ĐÁNH ĐÃ TỰ TẮT': '⚠ AUTO-ATTACK SWITCHED ITSELF OFF',
  'Hết Bình Thuốc Đỏ & máu xuống thấp — tắt TỰ ĐÁNH để tránh chết oan. Mua thêm thuốc rồi bật lại!':
    'Out of Red Potions and low on health — AUTO is off so you do not die for nothing. Buy more, then switch it back on!',
  '5 phút giảm 40% sát thương thiên lôi — cứ yên tâm xông vào bão!':
    'Five minutes at −40% lightning damage — walk into the storm and mean it!',
  '⚫ ĐỌA MA': '⚫ FALLEN',
  'Sát niệm xâm tâm — công lực +15% nhưng lôi kiếp sẽ khắc nghiệt hơn!':
    'Bloodlust takes hold — +15% power, but the lightning will judge you harder!',
  'HỒI ĐẦU THỊ NGẠN': 'TURNED BACK',
  'Tội nghiệt đã gột sạch — trở lại danh sạch.': 'The stain is washed out — your name is clean again.',
  // ── băng-rôn DI TRÚ: chạy đúng MỘT lần cho save đời cũ, nên gần như không lượt chạy nào
  //    bắt được chúng — mà chúng lại là câu đầu tiên người chơi cũ đọc sau khi cập nhật.
  'ĐÃ HOÀN LẠI': 'REFUNDED',
  '✦ HOÀN LẠI SÁU HỆ ĐÃ GỠ': '✦ SIX REMOVED SYSTEMS REFUNDED',
  '◆ TU LA TINH THẠCH ĐÃ NGỪNG DÙNG': '◆ ASURA CRYSTALS ARE NO LONGER USED',
  '⚒ KẾ THỪA ĐÃ GỠ': '⚒ INHERITANCE REMOVED',
  '⚠ TÚI ĐỔI SANG LƯỚI': '⚠ THE BAG IS NOW A GRID',
  '🎒 TÚI ĐỒ THÀNH LƯỚI': '🎒 BAG CONVERTED TO A GRID',
});
RULES.unshift(
  // ⚠ `unshift` — luật cũ `/^(\d+) phút (.*)$/` khớp trước và trả về "10 min: nữa — …",
  //    tức nuốt mất mọi luật viết sau. Lần THỨ BA cùng cái bẫy trong tệp này.
  [/^10 phút nữa — (.+)\. Chuẩn bị ứng chiến!$/,
    (m, a) => `Ten minutes out — ${tr(a)}. Get ready to fight!`],
  [/^10 phút nữa — (.+)\. Săn Box Kundun!$/,
    (m, a) => `Ten minutes out — ${tr(a)}. Hunt the Box Kundun!`],
  [/^Tà khí phủ (.+) — hạ Hung Thần nhận Box Kundun!$/,
    (m, a) => `Blight covers ${tr(a)} — fell the Dread One for a Box Kundun!`],
  [/^(\d+) quái dát vàng — mỗi con rơi 1 Box Kundun!$/,
    (m, n) => `${n} gilded monsters — each one drops a Box Kundun!`],
  [/^Đàn quái dát vàng tràn vào (.+) — 12 phút, mỗi con rơi 1 (.+)!$/,
    (m, a, b) => `A gilded herd pours into ${tr(a)} — 12 minutes, each drops one ${tr(b)}!`],
  [/^\+1 (.+) — mở trong Túi Đồ \(phím I\)!$/, (m, a) => `+1 ${tr(a)} — open it in the Bag (key I)!`],
  [/^Nhận (.+) — mở trong Túi Đồ \(phím I\)!$/, (m, a) => `You receive ${tr(a)} — open it in the Bag (key I)!`],
  [/^(.+) cấp (\d+) — rơi (.+) \+ Hỗn Độn Châu!$/,
    (m, a, b, c) => `${tr(a)} at level ${b} — drops ${tr(c)} + a Jewel of Chaos!`],
  [/^Còn (\d+) con ở bãi săn khác — cửa vực đóng lúc (.+)!$/,
    (m, n, t) => `${n} more on other hunting grounds — the rift shuts at ${t}!`],
  [/^Mục tiêu ẩn náu tại (.+) — tiêu diệt để lĩnh thưởng!$/,
    (m, a) => `The target is hiding in ${tr(a)} — kill it to claim the reward!`],
  // Rune · Tướng Quân · Đai
  [/^⚔ VỆ BINH RUNE (\d+)\/3 ĐÃ NGÃ$/, (m, n) => `⚔ RUNE WARDEN ${n}/3 HAS FALLEN`],
  [/^Còn (\d+)\/3 Vệ Binh Rune chưa hạ — phá đủ ba thì Cổng Vực mở\.$/,
    (m, n) => `${n}/3 Rune Wardens still stand — break all three and the Abyss Gate opens.`],
  [/^⚑ TƯỚNG QUÂN (.+) ĐÃ NGÃ XUỐNG$/, (m, a) => `⚑ WARDEN ${tr(a)} HAS FALLEN`],
  // Vỉa · Rương
  [/^Vỉa (.+) tại (.+) — hôm nay hết phần ở vùng này\.$/,
    (m, a, b) => `The ${tr(a)} vein at ${tr(b)} — nothing more here today.`],
  [/^(.+) — còn (\d+)\/(\d+) rương chưa ai chạm tới\.$/,
    (m, a, b, c) => `${tr(a)} — ${b}/${c} chests still untouched.`],
  // Tái Sinh · Lò Hỗn Loạn
  [/^Lần thứ (\d+) — Công Kích & Sinh Lực \+(\d+)% vĩnh viễn!$/,
    (m, a, b) => `Reset ${a} — +${b}% Attack and Max HP, permanently!`],
  [/^3 món hoá thành (.+)!$/, (m, a) => `Three pieces became ${tr(a)}!`],
  // Tầng Sâu · Lò Khắc
  [/^TẦNG (\d+) — (.+)$/, (m, n, a) => `FLOOR ${n} — ${tr(a)}`],
  [/^TẦNG (\d+)\/(\d+)$/, (m, a, b) => `FLOOR ${a}/${b}`],
  [/^☠ GỤC Ở TẦNG (\d+)$/, (m, n) => `☠ DOWNED ON FLOOR ${n}`],
  [/^ĐỢT (\d+) — (.+)$/, (m, n, a) => `WAVE ${n} — ${tr(a)}`],
  [/^ĐỢT (\d+)\/(\d+)$/, (m, a, b) => `WAVE ${a}/${b}`],
  [/^☠ GỤC Ở ĐỢT (\d+)$/, (m, n) => `☠ DOWNED ON WAVE ${n}`],
  [/^(\d+) quái · máu ×([\d.,]+) — dọn sạch để mở lối xuống$/,
    (m, a, b) => `${a} monsters · HP ×${b} — clear them to open the way down`],
  [/^(\d+) quái · máu ×([\d.,]+) — dọn sạch để khắc một nếp mới$/,
    (m, a, b) => `${a} monsters · HP ×${b} — clear them to cut a new carving`],
  [/^Trọn (\d+) tầng — thưởng ×([\d.,]+) và một (.+)!$/,
    (m, a, b, c) => `All ${a} floors — rewards ×${b} and one ${tr(c)}!`],
  [/^📦 RƯƠNG CẤP (.+) MỞ RA!$/, (m, a) => `📦 A TIER ${a} CHEST OPENS!`],
  // băng-rôn DI TRÚ
  [/^Hệ Cốt và vòng nuôi Ragoon đã gỡ — (.+) trả về ví$/,
    (m, a) => `The Bone system and the Ragoon loop are gone — ${tr(a)} returned to your purse`],
  [/^(.+) viên → (.+)◈ Lumen · rèn \+1→\+9 nay chỉ bằng ngọc$/,
    (m, a, b) => `${a} crystals → ${b}◈ Lumen · forging +1→+9 now takes jewels only`],
  [/^(.+) Mảnh \+ (.+) Đá Ấn Rune → (.+)◈ Lumen · giai của món nay do thứ RƠI RA quyết định$/,
    (m, a, b, c) => `${a} Fragments + ${b} Rune Seal Stones → ${c}◈ Lumen · a piece’s tier is now decided by what DROPS`],
  [/^(\d+) món không còn chỗ — đã quy ra (.+)◈ Lumen$/,
    (m, a, b) => `${a} pieces had no room left — converted to ${b}◈ Lumen`],
  [/^Mỗi món nay chiếm khối ô theo hình dáng — tặng (\d+) hàng để không mất món nào$/,
    (m, n) => `Every piece now takes a block of cells by its shape — ${n} extra rows granted so nothing is lost`]
);

/* ══ ĐUÔI CÒN LẠI CỦA BẢNG NPC — quét 1.044 lượt bắt chuyện, còn 18 dòng ════════════════
   Quét sâu hơn `§⑥` (2 map × 6 cấp × 6 mốc `questIdx` × mọi NPC) lôi ra đúng cái mà một
   lượt đo ở MỘT trạng thái nhiệm vụ không bao giờ thấy: thoại `active` của người giao
   nhiệm vụ, khung Cổ Thư Thất Truyền, và ba dòng khoá cấp của tab Phụ Tuyến.

   ⚠ VÀ ĐỒNG HỒ QUẦY CÓ **HAI** ĐỊNH DẠNG: `13:58` khi còn dưới một giờ, `1h59m` khi còn
   trên. Luật viết cho một dạng thì xanh ở mọi lượt chạy rơi vào dạng ấy — mà lượt nào rơi
   vào dạng nào là do GIỜ THẬT quyết định. Đây là cùng một vết sẹo với băng-rôn sự kiện. */
Object.assign(EXACT, {
  '"Trong Rẻo Rừng Corran còn thứ ngươi phải làm cho xong."':
    '"There is still something in the Corran Thicket you have to finish."',
  '"Ta vớt ngươi lên khi bầu trời còn đang nứt. Ngươi không nhớ gì — nhưng bầy nhỏ của ta thì nhớ mùi lửa đêm đó."':
    '"I pulled you out while the sky was still splitting. You remember nothing — but my little herd remembers the smell of fire that night."',
  '"Ta pha thuốc cho cả đảo này từ trước khi trời nứt. Giờ nửa số bệnh ta chữa không có trong sách nào cả."':
    '"I have mixed medicine for this whole island since before the sky tore. Half of what I treat now is in no book at all."',
  'Cổ Thư Thất Truyền — Huyết Ma Thôn Phệ': 'Lost Writings — Blood Demon Devour',
  'Mảnh cổ thư:': 'Writing fragments:',
  'Đánh bại Thủ Lĩnh Gloam để thu thập mảnh cổ thư (Thượng 40% · Trung 40% · Hạ 20%).':
    'Defeat Gloam Chieftains to collect the fragments (Upper 40% · Middle 40% · Lower 20%).',
  'PHỤ TUYẾN': 'SIDE QUESTS',
  'Cần đi thêm một đoạn chính tuyến nữa': 'You need to get further along the main story',
});
RULES.unshift(
  [/^VẬT PHẨM QUÝ — đổi sau (\d+)h(\d+)m$/, (m, a, b) => `PRIZE GOODS — rotates in ${a}h${b}m`],
  [/^HÀNG BÀY — còn (\d+)\/(\d+) món · nhập hàng sau (\d+)h(\d+)m$/,
    (m, a, b, c, d) => `ON THE SHELF — ${a}/${b} left · restock in ${c}h${d}m`],
  [/^★ Chính tuyến (c\d+q\d+): (.+)$/, (m, id, ten) => `★ Main story ${id}: ${tr(ten)}`],
  [/^Cần cấp (\d+) \(đang (\d+)\)$/, (m, a, b) => `Requires level ${a} (you are ${b})`]
);

function tr(s) {
  if (lang !== 'en' || !s || typeof s !== 'string') return s;
  const cached = _trCache.get(s);
  if (cached !== undefined) return cached;
  const result = trCompute(s);
  if (_trCache.size > 5000) _trCache.clear(); // safety cap; rules are static so a clear just costs a few recomputes
  _trCache.set(s, result);
  return result;
}
function trCompute(s) {
  if (Object.prototype.hasOwnProperty.call(EXACT, s)) return EXACT[s];
  const t2 = s.trim();
  if (t2 !== s && Object.prototype.hasOwnProperty.call(EXACT, t2)) return s.replace(t2, EXACT[t2]);
  // Text node trải nhiều đoạn (template literal HTML — đoạn văn cách nhau bằng dòng trống): dịch từng đoạn
  if (/\n\s*\n/.test(s)) {
    const joined = s.split(/(\n\s*\n)/).map(p => (/^\n/.test(p) ? p : tr(p))).join('');
    if (joined !== s) return joined;
  }
  for (const [re, rep] of RULES) {
    const m = s.match(re);
    if (m) return typeof rep === 'function' ? rep(...m) : s.replace(re, rep);
  }
  // Thử lại trên bản ĐÃ TRIM rồi trả về đúng phần lề cũ. Text node sinh từ template literal
  // gần như luôn dính '\n' + thụt lề, nên mọi quy tắc neo ^…$ trượt hết nếu chỉ thử trên `s`.
  // Đo được: 'HƯỚNG DẪN 1/6', '· cấp 38 - 48', '◈ Bán 1 món (+1437)' đều có mục từ/quy tắc
  // đúng mà vẫn ra tiếng Việt chỉ vì chỗ này.
  if (t2 !== s && t2) {
    for (const [re, rep] of RULES) {
      const m = t2.match(re);
      if (m) return s.replace(t2, typeof rep === 'function' ? rep(...m) : t2.replace(re, rep));
    }
  }
  return s;
}

/* ---- canvas patch: translate all text drawn to canvas ---- */
for (const meth of ['fillText', 'strokeText', 'measureText']) {
  const orig = CanvasRenderingContext2D.prototype[meth];
  CanvasRenderingContext2D.prototype[meth] = function (t, ...rest) {
    return orig.call(this, lang === 'en' ? tr(String(t)) : t, ...rest);
  };
}

/* ---- native dialog patch: window.confirm()/alert() bypass the DOM entirely, so the
   MutationObserver below never sees their text — translate the message up front instead
   (e.g. the Settings panel's "wipe save" confirmation). ---- */
{
  const origConfirm = window.confirm, origAlert = window.alert;
  window.confirm = function (msg) { return origConfirm.call(window, lang === 'en' ? tr(String(msg)) : msg); };
  window.alert = function (msg) { return origAlert.call(window, lang === 'en' ? tr(String(msg)) : msg); };
}

/* ---- DOM observer: translate text nodes & common attributes ---- */
let busy = false;
function trNode(n) {
  if (n.__ghhaI18n) return;
  const v = n.nodeValue;
  if (!v) return;
  const t = tr(v.trim()) === v.trim() ? v : v.replace(v.trim(), tr(v.trim()));
  if (t !== v) { busy = true; n.nodeValue = t; busy = false; n.__ghhaI18n = true; }
}
function trAttrs(root) {
  const els = root.querySelectorAll ? root.querySelectorAll('[title],[placeholder]') : [];
  els.forEach(el => {
    for (const at of ['title', 'placeholder']) {
      const v = el.getAttribute(at);
      if (v && tr(v) !== v) { busy = true; el.setAttribute(at, tr(v)); busy = false; }
    }
  });
}
function walk(root) {
  if (root.nodeType === 3) { trNode(root); return; }
  if (root.nodeType !== 1 && root.nodeType !== 9) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let n;
  while ((n = w.nextNode())) nodes.push(n);
  for (const nd of nodes) trNode(nd);
  trAttrs(root);
}
const obs = new MutationObserver(muts => {
  if (lang !== 'en' || busy) return;
  for (const m of muts) {
    if (m.type === 'characterData') { m.target.__ghhaI18n = false; trNode(m.target); }
    else m.addedNodes.forEach(nd => walk(nd));
  }
});
function boot() {
  obs.observe(document.body, { subtree: true, childList: true, characterData: true });
  if (lang === 'en') walk(document.body);
  addToggle();
}

/* ---- language toggle (start screen & in-game) ---- */
function addToggle() {
  if (document.getElementById('ghha-lang-toggle')) return;
  const b = document.createElement('button');
  b.id = 'ghha-lang-toggle';
  b.textContent = lang === 'en' ? '🇻🇳 VI' : '🇬🇧 EN';
  b.title = 'Language / Ngôn ngữ';
  // Góc trái-dưới, và CHỈ ở màn chờ. top:8px + left:50% là ĐÚNG cùng điểm neo với #hud-map
  // (top:12px, left:50%) nên viên "🇻🇳 VI" đè thẳng lên tên vùng ở mọi độ phân giải — cắt
  // "Wilds" thành "Wild". Trong game thì bốn góc đều đã có chủ (nhất là ở 390px, nơi HUD chiếm
  // gần hết màn hình), nên startGame() giấu chip này đi và bảng Cài Đặt nhận việc đổi ngôn ngữ.
  b.style.cssText = 'position:fixed;bottom:10px;left:10px;z-index:99999;'
    + 'padding:4px 12px;border-radius:999px;border:1px solid #8a6d3b;background:rgba(29,23,18,.92);'
    + 'color:#f0d68a;font:700 12px/1.4 system-ui,sans-serif;cursor:pointer;opacity:.9;pointer-events:auto';
  b.onmouseenter = () => { b.style.opacity = '1'; };
  b.onmouseleave = () => { b.style.opacity = '.9'; };
  b.onclick = () => window.ghhaSwitchLang();
  document.body.appendChild(b);
}
// Bảng Cài Đặt gọi lại đúng hàm này — đổi ngôn ngữ là việc làm một lần, không đáng chiếm một
// góc màn hình suốt trận. Chip nổi chỉ còn phục vụ màn chờ, trước khi vào game.
window.ghhaSwitchLang = function(){
  const nl = lang === 'en' ? 'vi' : 'en';
  const ask = nl === 'en'
    ? 'Switch to English?\nThe game will reload (progress is saved automatically).'
    : 'Chuyển sang Tiếng Việt?\nGame sẽ tải lại (tiến trình đã tự lưu).';
  if (confirm(ask)) { try { localStorage.setItem(KEY, nl); } catch (e) {} location.reload(); }
};
window.ghhaLang = function(){ return lang; };

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
})();
