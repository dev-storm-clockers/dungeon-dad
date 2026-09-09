/**
 * Dungeon Dad — shared UI helpers
 */
(function (global) {
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function show(el, on) {
    if (!el) return;
    el.hidden = !on;
  }

  function setText(el, text) {
    if (el) el.textContent = text;
  }

  function toast(msg, ms) {
    let el = document.getElementById('dd-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'dd-toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    window.clearTimeout(el._t);
    el._t = window.setTimeout(function () { el.classList.remove('show'); }, ms || 2200);
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) { /* fall through */ }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  function footerHtml() {
    return '<footer class="site-footer"><span>Dungeon Dad Productions</span></footer>';
  }

  function ensureFooter() {
    if (!document.querySelector('.site-footer')) {
      document.body.insertAdjacentHTML('beforeend', footerHtml());
    }
  }

  function updateUnlockBadge() {
    const badge = document.getElementById('unlock-badge');
    const stubBox = document.getElementById('stub-dungeon');
    const unlocked = DDSession.isUnlocked();
    if (badge) {
      badge.hidden = !unlocked;
      badge.textContent = unlocked ? 'Unlocked (demo)' : '';
    }
    if (stubBox) {
      stubBox.hidden = !unlocked;
    }
  }

  global.DDUI = {
    $: $,
    $all: $all,
    show: show,
    setText: setText,
    toast: toast,
    copyText: copyText,
    ensureFooter: ensureFooter,
    updateUnlockBadge: updateUnlockBadge
  };
})(window);
