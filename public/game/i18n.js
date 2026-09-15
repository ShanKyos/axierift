/* ═══ Axie Rift i18n v1 — key-based, English-first ═══
   Replaces the old regex/substring translator (lang.js) for any content migrated to use it.
   Loaded AFTER strings/en.js and strings/vi.js, BEFORE lang.js and game.js.

   Why this exists instead of extending lang.js: lang.js only ever translates hardcoded
   Vietnamese source text into English at draw time via regex/dictionary substitution — it has
   no notion of "the source of truth is this key" and can't be pointed the other direction
   without becoming a second, parallel hack. This module is real key -> string lookup; call
   t('some.key') and get the current locale's string directly, no pattern-matching involved.

   Coexistence during migration: content not yet ported to t() calls stays hardcoded Vietnamese
   in game.js, same as before — lang.js keeps translating THAT content when locale is 'en',
   exactly as it always has. t()-driven content never touches lang.js's regex path at all (its
   output is already correct for the locale). See docs/I18N_MIGRATION_GUIDE.md for the plan to
   shrink lang.js's job over time as more of game.js moves to t(). */
(function () {
  'use strict';
  const KEY = 'vlcm_lang';
  // Mặc định 'vi'. Trước đây là 'en', và hậu quả là một màn hình LẪN hai thứ tiếng: lớp dịch ở
  // lang.js phủ không hết nên phần lớn giao diện vẫn ra tiếng Việt, còn vài chỗ thì ra tiếng Anh.
  // Đo trên bảng Nhân Vật / Túi Đồ / Kỹ Năng / Nhiệm Vụ: mặc định cũ để lại 4 dòng tiếng Anh
  // trên 87 (5%) — "Defense (Reduces damage taken)", "Dodge", "Unlocking grants a permanent stat
  // bonus…" — trong khi đặt 'vi' cho ra 0.
  // (Con số này tôi tự đo. Một khảo sát trước đó báo 44%; không tái hiện được.)
  // ?lang=en / ?lang=vi THẮNG localStorage — đây là cửa để đưa một đường link chơi thử bằng
  // tiếng Anh cho người chưa từng mở game (giám khảo, người ngoài), mà không bắt họ đi tìm nút
  // đổi ngôn ngữ. Chọn xong thì GHI LẠI vào localStorage: hai lớp dịch dùng chung khoá đó, nên
  // ghi lại là bấm sang trang khác trong cùng phiên vẫn giữ đúng thứ tiếng.
  // ⚠ lang.js đọc y hệt đoạn này, ĐỘC LẬP — đừng rút gọn thành "i18n.js ghi rồi lang.js đọc
  // ké". Thứ tự nạp là một giả định, mà một màn hình lẫn hai thứ tiếng thì không lỗi nào báo.
  let locale = 'vi';
  try { locale = localStorage.getItem(KEY) || 'vi'; } catch (e) {}
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'en' || q === 'vi') {
      locale = q;
      try { localStorage.setItem(KEY, q); } catch (e) {}
    }
  } catch (e) {}

  function dict() {
    return locale === 'vi' ? (window.I18N_VI || {}) : (window.I18N_EN || {});
  }

  window.t = function (key, vars) {
    const d = dict();
    let s = Object.prototype.hasOwnProperty.call(d, key) ? d[key] : key; // missing key -> show the key itself, loud and obvious in dev
    if (vars) {
      for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
    }
    return s;
  };

  window.i18nLocale = function () { return locale; };
})();
