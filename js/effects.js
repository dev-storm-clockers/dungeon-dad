/**
 * Dungeon Dad — visible CSS effect triggers (hit / loot / trap / banter)
 */
(function (global) {
  const CLASSES = ['fx-hit', 'fx-loot', 'fx-trap', 'fx-banter'];

  function stage() {
    return document.getElementById('fx-stage') || document.body;
  }

  function clear(el) {
    CLASSES.forEach(function (c) { el.classList.remove(c); });
    const burst = el.querySelector('.fx-burst');
    if (burst) burst.remove();
  }

  function play(kind, label) {
    const el = stage();
    clear(el);
    const cls = 'fx-' + (kind || 'banter');
    if (CLASSES.indexOf(cls) === -1) {
      el.classList.add('fx-banter');
    } else {
      el.classList.add(cls);
    }

    const burst = document.createElement('div');
    burst.className = 'fx-burst';
    burst.setAttribute('data-kind', kind || 'banter');
    burst.innerHTML = '<span class="fx-label">' + (label || kindLabel(kind)) + '</span>';
    el.appendChild(burst);

    // Force reflow then animate
    void burst.offsetWidth;
    burst.classList.add('fx-go');

    window.setTimeout(function () {
      clear(el);
    }, 1600);

    return kind;
  }

  function kindLabel(kind) {
    switch (kind) {
      case 'hit': return 'HIT!';
      case 'loot': return 'LOOT!';
      case 'trap': return 'TRAP!';
      case 'banter': return 'BANTER!';
      default: return 'EFFECT!';
    }
  }

  global.DDEffects = {
    play: play,
    clear: clear,
    kindLabel: kindLabel
  };
})(window);
