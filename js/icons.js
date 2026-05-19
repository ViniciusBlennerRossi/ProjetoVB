/**
 * Fiore Icons — registry de ícones SVG (estilo Lucide) em vanilla JS.
 * Substitui o uso de emojis em todo o sistema.
 *
 * Uso:
 *   const html = Icons.svg('cart', { size: 18 });        // string SVG
 *   const el   = Icons.node('cart');                      // elemento DOM
 *   Icons.replaceEmojis(document);                        // auto-substitui emojis conhecidos
 *
 * Mapa Emoji -> Ícone (replaceEmojis):
 *   🏠 home   🛒 cart   📋 clipboard   👥 users   👤 user
 *   💰 wallet 📄 file   👗 shirt        📦 box    🚚 truck
 *   🏭 factory 💸 trending_down  📈 chart  📅 calendar
 *   ✂️ scissors 🖥️ monitor 🔑 key  🛡️ shield  🚪 logout
 *   🔍 search   ➕ plus   🔔 bell    👁️ eye   ⚠️ alert
 *   ⏰ clock   ⏳ clock  ✅ check  ❌ x      📉 trending_down
 *   🎁 gift    🌙 flower
 */
(function () {
  const ICONS = {
    home:           '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    calendar:       '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>',
    scissors:       '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"/>',
    cart:           '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 13h12L22 7H6"/>',
    monitor:        '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    clipboard:      '<rect x="6" y="4" width="12" height="17" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 11h6M9 15h4"/>',
    users:          '<circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-3.5 3-6 7-6s7 2.5 7 6"/><path d="M17 11a3 3 0 100-6M22 21c0-2.5-1.5-4.5-4-5.5"/>',
    user:           '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/>',
    wallet:         '<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20M17 15h1.5"/>',
    file:           '<path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    shirt:          '<path d="M9 2l3 2 3-2 5 3-2 5-3-1v11H6V9L3 10 1 5z"/>',
    box:            '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v10"/>',
    truck:          '<rect x="1" y="6" width="14" height="11" rx="1"/><path d="M15 9h4l3 4v4h-7"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>',
    factory:        '<path d="M3 21V10l5 3V10l5 3V10l5 3v8z"/><path d="M3 21h18M9 17h2M15 17h2"/>',
    trending_down:  '<path d="M3 7l7 7 4-4 7 7"/><path d="M21 17v-5h-5"/>',
    trending_up:    '<path d="M3 17l7-7 4 4 7-7"/><path d="M21 7v5h-5"/>',
    chart:          '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-7"/>',
    key:            '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l3 3"/>',
    shield:         '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    logout:         '<path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3"/><path d="M10 17l-5-5 5-5M5 12h12"/>',
    search:         '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    plus:           '<path d="M12 5v14M5 12h14"/>',
    minus:          '<path d="M5 12h14"/>',
    more:           '<circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/>',
    chevron_right:  '<path d="M9 6l6 6-6 6"/>',
    chevron_left:   '<path d="M15 6l-6 6 6 6"/>',
    chevron_down:   '<path d="M6 9l6 6 6-6"/>',
    chevron_up:     '<path d="M6 15l6-6 6 6"/>',
    bell:           '<path d="M6 8a6 6 0 1112 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 21a2 2 0 004 0"/>',
    eye:            '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eye_off:        '<path d="M2 12s3.5-7 10-7c2 0 3.8.6 5.4 1.5M22 12s-3.5 7-10 7c-2 0-3.8-.6-5.4-1.5"/><path d="M3 3l18 18"/><path d="M10 10a3 3 0 004 4"/>',
    check:          '<path d="M4 12l5 5L20 6"/>',
    x:              '<path d="M6 6l12 12M18 6L6 18"/>',
    alert:          '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.7 3.86a2 2 0 00-3.4 0z"/>',
    alert_circle:   '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>',
    info:           '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/>',
    clock:          '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    arrow_up:       '<path d="M12 19V5M5 12l7-7 7 7"/>',
    arrow_down:     '<path d="M12 5v14M5 12l7 7 7-7"/>',
    arrow_right:    '<path d="M5 12h14M13 5l7 7-7 7"/>',
    arrow_left:     '<path d="M19 12H5M11 19l-7-7 7-7"/>',
    menu:           '<path d="M3 6h18M3 12h18M3 18h18"/>',
    flower:         '<circle cx="12" cy="12" r="2.2"/><path d="M12 9.8c0-2.5 1-4.5 3-4.5s2.5 2 1 3.5-2.5 2-4 1z"/><path d="M14.2 12c2.5 0 4.5 1 4.5 3s-2 2.5-3.5 1-2-2.5-1-4z"/><path d="M12 14.2c0 2.5-1 4.5-3 4.5s-2.5-2-1-3.5 2.5-2 4-1z"/><path d="M9.8 12c-2.5 0-4.5-1-4.5-3s2-2.5 3.5-1 2 2.5 1 4z"/>',
    gift:           '<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M3 12h18M12 8v13M7 8a2 2 0 110-4c2 0 5 4 5 4M17 8a2 2 0 100-4c-2 0-5 4-5 4"/>',
    sparkle:        '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    pencil:         '<path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z"/>',
    trash:          '<path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>',
    download:       '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    upload:         '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    refresh:        '<path d="M3 12a9 9 0 0115-6.7L21 8M21 3v5h-5M21 12a9 9 0 01-15 6.7L3 16M3 21v-5h5"/>',
    filter:         '<path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z"/>',
    settings:       '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 008 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H2a2 2 0 110-4h.09A1.65 1.65 0 004.6 8a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V2a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H22a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
    print:          '<path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    phone:          '<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.72 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.35 1.85.59 2.81.72A2 2 0 0122 16.92z"/>',
    mail:           '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/>',
    map_pin:        '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>',
    qr:             '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM18 18h3v3h-3z"/>',
    barcode:        '<path d="M3 4v16M7 4v16M11 4v16M15 4v16M19 4v16"/>',
    receipt:        '<path d="M4 2v20l3-2 3 2 3-2 3 2 3-2V2"/><path d="M8 7h8M8 11h8M8 15h5"/>',
    star:           '<path d="M12 2l3 7 7 .5-5.5 4.5L18 21l-6-3.5L6 21l1.5-7L2 9.5 9 9z"/>',
  };

  function svg(name, opts = {}) {
    const inner = ICONS[name];
    if (!inner) return '';
    const size   = opts.size || 18;
    const stroke = opts.stroke || 1.6;
    const cls    = opts.cls ? ` class="${opts.cls}"` : '';
    const style  = opts.style ? ` style="${opts.style}"` : '';
    return (
      `<svg${cls}${style} width="${size}" height="${size}" viewBox="0 0 24 24" `
      + `fill="none" stroke="currentColor" stroke-width="${stroke}" `
      + `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`
    );
  }

  function node(name, opts) {
    const tmp = document.createElement('div');
    tmp.innerHTML = svg(name, opts);
    return tmp.firstChild;
  }

  // Mapa emoji -> nome de ícone
  const EMOJI_MAP = {
    '🏠': 'home',          '🛒': 'cart',          '📋': 'clipboard',
    '👥': 'users',         '👤': 'user',          '💰': 'wallet',
    '📄': 'file',          '👗': 'shirt',         '📦': 'box',
    '🚚': 'truck',         '🏭': 'factory',       '💸': 'trending_down',
    '📈': 'chart',         '📅': 'calendar',      '✂️': 'scissors',
    '🖥️': 'monitor',      '🔑': 'key',           '🛡️': 'shield',
    '🚪': 'logout',        '🔍': 'search',        '➕': 'plus',
    '🔔': 'bell',          '👁️': 'eye',          '🙈': 'eye_off',
    '⚠️': 'alert',        '⏰': 'clock',          '⏳': 'clock',
    '✅': 'check',         '❌': 'x',             '📉': 'trending_down',
    '🎁': 'gift',          '🌙': 'flower',        '✨': 'sparkle',
    '✏️': 'pencil',       '🗑️': 'trash',        '⬇️': 'download',
    '⬆️': 'upload',       'ℹ️': 'info',          '🔄': 'refresh',
    '⚙️': 'settings',     '🖨️': 'print',         '📞': 'phone',
    '📱': 'phone',         '📧': 'mail',          '📍': 'map_pin',
    '📷': 'qr',
  };

  // Substitui emojis em nós de texto de um elemento.
  // Usa flag global na regex para pegar todas ocorrências numa mesma string.
  function replaceEmojis(root = document.body) {
    if (!root) return;
    // Construir regex única com todos os emojis (escapar nada — são literais)
    const keys = Object.keys(EMOJI_MAP).sort((a, b) => b.length - a.length); // strings maiores primeiro (ex: 🖥️ vs 🖥)
    const pattern = new RegExp('(' + keys.map(escapeRegex).join('|') + ')', 'g');

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !pattern.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        pattern.lastIndex = 0;
        // Pular nós dentro de <script>, <style>, <textarea>, <input>
        let p = node.parentElement;
        while (p) {
          const tag = p.tagName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA' || tag === 'INPUT') return NodeFilter.FILTER_REJECT;
          if (p === root) break;
          p = p.parentElement;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const toReplace = [];
    let n;
    while ((n = walker.nextNode())) toReplace.push(n);

    toReplace.forEach(textNode => {
      const text = textNode.nodeValue;
      const parts = text.split(pattern);
      if (parts.length <= 1) return;
      const frag = document.createDocumentFragment();
      parts.forEach(part => {
        if (EMOJI_MAP[part]) {
          const span = document.createElement('span');
          span.className = 'ico';
          span.innerHTML = svg(EMOJI_MAP[part], { size: 16 });
          frag.appendChild(span);
        } else if (part) {
          frag.appendChild(document.createTextNode(part));
        }
      });
      textNode.parentNode.replaceChild(frag, textNode);
    });
  }

  function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  // Observa mudanças no DOM e substitui emojis em novos nós (tabelas
  // populadas dinamicamente, modais, toasts...)
  function startAutoReplace() {
    replaceEmojis(document.body);
    const mo = new MutationObserver(muts => {
      muts.forEach(m => {
        m.addedNodes.forEach(n => {
          if (n.nodeType === 1) replaceEmojis(n);
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  window.Icons = { svg, node, replaceEmojis, startAutoReplace, EMOJI_MAP };

  // Auto-iniciar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAutoReplace);
  } else {
    startAutoReplace();
  }
})();
