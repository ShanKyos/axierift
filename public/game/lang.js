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
  'Thợ Rèn · Lò Rèn Hoàng Gia': 'Blacksmith · Royal Forge',
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
  'Chủ Quán Trọ · Trà Quán': 'Innkeeper · Teahouse',
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

const _trCache = new Map();
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
