/**
 * Dungeon Dad — simple characters (name, look, ≤4 stats)
 */
(function (global) {
  const LOOKS = [
    { emoji: '🛡️', color: '#2a9d8f', label: 'Shield' },
    { emoji: '🗡️', color: '#e9c46a', label: 'Blade' },
    { emoji: '🔮', color: '#9b5de5', label: 'Orb' },
    { emoji: '🏹', color: '#f4a261', label: 'Bow' },
    { emoji: '🧪', color: '#00bbf9', label: 'Vial' },
    { emoji: '🥾', color: '#8ac926', label: 'Boots' }
  ];

  const STAT_KEYS = ['grit', 'wit', 'care', 'spark'];
  const STAT_LABELS = { grit: 'Grit', wit: 'Wit', care: 'Care', spark: 'Spark' };

  function defaultStats() {
    return { grit: 2, wit: 2, care: 2, spark: 2 };
  }

  function normalizeStats(stats) {
    const out = defaultStats();
    if (!stats) return out;
    STAT_KEYS.forEach(function (k) {
      let v = parseInt(stats[k], 10);
      if (isNaN(v)) v = 2;
      out[k] = Math.max(1, Math.min(4, v));
    });
    return out;
  }

  function createCharacter(input) {
    input = input || {};
    const lookIdx = typeof input.lookIndex === 'number' ? input.lookIndex : 0;
    const look = LOOKS[lookIdx] || LOOKS[0];
    return {
      name: String(input.name || 'Hero').trim().slice(0, 20) || 'Hero',
      look: { emoji: look.emoji, color: look.color, label: look.label },
      stats: normalizeStats(input.stats)
    };
  }

  function rollCheck(stats, statKey) {
    const base = (stats && stats[statKey]) || 2;
    const die = 1 + Math.floor(Math.random() * 4); // d4
    return { total: base + die, die: die, base: base, stat: statKey };
  }

  function renderRoster(el, party, opts) {
    opts = opts || {};
    if (!el) return;
    party = party || [];
    if (!party.length) {
      el.innerHTML = '<p class="muted">No adventurers yet — join or create a character.</p>';
      return;
    }
    el.innerHTML = party.map(function (p) {
      const look = p.look || { emoji: '🛡️', color: '#2a9d8f' };
      const stats = p.stats || defaultStats();
      const you = opts.playerId && p.id === opts.playerId ? ' <span class="badge you">You</span>' : '';
      const host = opts.hostId && p.id === opts.hostId ? ' <span class="badge host">Host</span>' : '';
      const statBits = STAT_KEYS.map(function (k) {
        return '<span class="stat" title="' + STAT_LABELS[k] + '">' + STAT_LABELS[k][0] + ':' + stats[k] + '</span>';
      }).join(' ');
      return (
        '<div class="roster-card" style="--look:' + look.color + '">' +
          '<div class="roster-emoji" aria-hidden="true">' + look.emoji + '</div>' +
          '<div class="roster-body">' +
            '<div class="roster-name">' + escapeHtml(p.name) + you + host + '</div>' +
            '<div class="roster-stats">' + statBits + '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fillLookSelect(selectEl) {
    if (!selectEl) return;
    selectEl.innerHTML = LOOKS.map(function (l, i) {
      return '<option value="' + i + '">' + l.emoji + ' ' + l.label + '</option>';
    }).join('');
  }

  global.DDParty = {
    LOOKS: LOOKS,
    STAT_KEYS: STAT_KEYS,
    STAT_LABELS: STAT_LABELS,
    createCharacter: createCharacter,
    defaultStats: defaultStats,
    normalizeStats: normalizeStats,
    rollCheck: rollCheck,
    renderRoster: renderRoster,
    fillLookSelect: fillLookSelect,
    escapeHtml: escapeHtml
  };
})(window);
