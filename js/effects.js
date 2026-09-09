/**
 * Dungeon Dad — visible CSS effect triggers (hit / loot / trap / banter)
 * Pass 3: chip shake + chrome pulse helpers (CSS / brief class timers).
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

  /** Brief CSS class pulse (≥300ms) on an element — used for turn/energy chrome. */
  function pulse(el, className, ms) {
    if (!el) return;
    const cls = className || 'fx-chrome-pulse';
    const dur = ms == null ? 450 : ms;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    window.setTimeout(function () {
      el.classList.remove(cls);
    }, dur);
  }

  /** Shake / flash a combat chip (≥300ms). */
  function shakeChip(el, ms) {
    if (!el) return;
    const dur = ms == null ? 360 : ms;
    el.classList.remove('fx-chip-hit');
    void el.offsetWidth;
    el.classList.add('fx-chip-hit');
    window.setTimeout(function () {
      el.classList.remove('fx-chip-hit');
    }, dur);
  }

  global.DDEffects = {
    play: play,
    clear: clear,
    kindLabel: kindLabel,
    pulse: pulse,
    shakeChip: shakeChip
  };
})(window);
