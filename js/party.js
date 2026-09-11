/**
 * Dungeon Dad — four fixed heroes (Torch · Keen · Heft · Wry)
 */
(function (global) {
  const STAT_KEYS = ['grit', 'wit', 'care', 'spark'];
  const STAT_LABELS = { grit: 'Grit', wit: 'Wit', care: 'Care', spark: 'Spark' };

  const HEROES = [
    {
      id: 'torch',
      name: 'Torch',
      feel: 'Steady lead',
      lean: 'Block / reveal',
      emoji: '🔦',
      color: '#e9c46a',
      stats: { grit: 3, wit: 2, care: 3, spark: 2 },
      passive: 'block',
      blurb: 'Takes the first hit so the rest of you don\'t.'
    },
    {
      id: 'keen',
      name: 'Keen',
      feel: 'Sharp eyes',
      lean: 'Draw / trap break',
      emoji: '👁️',
      color: '#00bbf9',
      stats: { grit: 2, wit: 4, care: 2, spark: 2 },
      passive: 'draw',
      blurb: 'Sees the wire before it bites.'
    },
    {
      id: 'heft',
      name: 'Heft',
      feel: 'Hits hard',
      lean: 'Damage',
      emoji: '🪨',
      color: '#e76f51',
      stats: { grit: 4, wit: 2, care: 2, spark: 1 },
      passive: 'damage',
      blurb: 'Opens doors the hard way.'
    },
    {
      id: 'wry',
      name: 'Wry',
      feel: 'Cuts tension',
      lean: 'Disrupt / heal-light',
      emoji: '🃏',
      color: '#9b5de5',
      stats: { grit: 2, wit: 2, care: 3, spark: 3 },
      passive: 'disrupt',
      blurb: 'A dry line and a patch kit.'
    }
  ];

  // Legacy look list kept for old saves; new joins use HEROES
  const LOOKS = HEROES.map(function (h) {
    return { emoji: h.emoji, color: h.color, label: h.name };
  });

  function heroById(id) {
    return HEROES.find(function (h) { return h.id === id; }) || HEROES[0];
  }

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
    if (input.heroId || input.id) {
      return createHero(input.heroId || input.id, input);
    }
    const lookIdx = typeof input.lookIndex === 'number' ? input.lookIndex : 0;
    const hero = HEROES[lookIdx] || HEROES[0];
    return createHero(hero.id, input);
  }

  function createHero(heroId, input) {
    input = input || {};
    const def = heroById(heroId);
    const customName = String(input.name || '').trim().slice(0, 20);
    return {
      heroId: def.id,
      name: customName || def.name,
      look: { emoji: def.emoji, color: def.color, label: def.name },
      stats: normalizeStats(def.stats),
      lean: def.lean,
      feel: def.feel,
      passive: def.passive,
      blurb: def.blurb
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
      el.innerHTML = '<p class="muted">No one yet — pick a hero and join.</p>';
      return;
    }
    el.innerHTML = party.map(function (p) {
      const look = p.look || { emoji: '🔦', color: '#e9c46a' };
      const stats = p.stats || defaultStats();
      const you = opts.playerId && p.id === opts.playerId ? ' <span class="badge you">You</span>' : '';
      const host = opts.hostId && p.id === opts.hostId ? ' <span class="badge host">Host</span>' : '';
      const lean = p.lean ? '<div class="roster-lean">' + escapeHtml(p.lean) + '</div>' : '';
      const statBits = STAT_KEYS.map(function (k) {
        return '<span class="stat" title="' + STAT_LABELS[k] + '">' + STAT_LABELS[k][0] + ':' + stats[k] + '</span>';
      }).join(' ');
      return (
        '<div class="roster-card" style="--look:' + look.color + '">' +
          '<div class="roster-emoji" aria-hidden="true">' + look.emoji + '</div>' +
          '<div class="roster-body">' +
            '<div class="roster-name">' + escapeHtml(p.name) + you + host + '</div>' +
            lean +
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
    selectEl.innerHTML = HEROES.map(function (h, i) {
      return '<option value="' + i + '">' + h.emoji + ' ' + h.name + ' — ' + h.lean + '</option>';
    }).join('');
  }

  function fillHeroSelect(containerEl, selectedId) {
    if (!containerEl) return;
    selectedId = selectedId || 'torch';
    containerEl.innerHTML = HEROES.map(function (h) {
      const sel = h.id === selectedId ? ' selected' : '';
      return (
        '<button type="button" class="hero-pick' + sel + '" data-hero-id="' + h.id + '" style="--look:' + h.color + '">' +
          '<span class="hero-pick-emoji" aria-hidden="true">' + h.emoji + '</span>' +
          '<span class="hero-pick-name">' + escapeHtml(h.name) + '</span>' +
          '<span class="hero-pick-lean">' + escapeHtml(h.lean) + '</span>' +
          '<span class="hero-pick-blurb">' + escapeHtml(h.blurb) + '</span>' +
        '</button>'
      );
    }).join('');
  }

  function renderStash(el, stash) {
    if (!el) return;
    stash = stash || [];
    if (!stash.length) {
      el.innerHTML = '<p class="muted stash-empty">Party stash empty.</p>';
      return;
    }
    el.innerHTML = '<ul class="stash-list">' + stash.map(function (item) {
      return (
        '<li class="stash-item">' +
          '<span class="stash-emoji">' + (item.emoji || '📦') + '</span> ' +
          '<strong>' + escapeHtml(item.name || item.id) + '</strong>' +
          (item.blurb ? ' <span class="muted">— ' + escapeHtml(item.blurb) + '</span>' : '') +
        '</li>'
      );
    }).join('') + '</ul>';
  }

  global.DDParty = {
    HEROES: HEROES,
    LOOKS: LOOKS,
    STAT_KEYS: STAT_KEYS,
    STAT_LABELS: STAT_LABELS,
    heroById: heroById,
    createCharacter: createCharacter,
    createHero: createHero,
    defaultStats: defaultStats,
    normalizeStats: normalizeStats,
    rollCheck: rollCheck,
    renderRoster: renderRoster,
    fillLookSelect: fillLookSelect,
    fillHeroSelect: fillHeroSelect,
    renderStash: renderStash,
    escapeHtml: escapeHtml
  };
})(window);
