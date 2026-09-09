/**
 * Dungeon Dad — session sync via localStorage + BroadcastChannel
 */
(function (global) {
  const PREFIX = 'ddad:session:';
  const UNLOCK_KEY = 'ddad:hostUnlock';
  const ACTIVE_KEY = 'ddad:active';
  const CHANNEL = 'dungeon-dad-session';

  function codeGen() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }

  function storageKey(code) {
    return PREFIX + String(code).toUpperCase();
  }

  function read(code) {
    try {
      const raw = localStorage.getItem(storageKey(code));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function write(session) {
    if (!session || !session.code) return;
    session.updatedAt = Date.now();
    localStorage.setItem(storageKey(session.code), JSON.stringify(session));
    broadcast({ type: 'session-update', code: session.code, session });
  }

  let channel = null;
  try {
    channel = new BroadcastChannel(CHANNEL);
  } catch (e) {
    channel = null;
  }

  const listeners = new Set();

  function broadcast(msg) {
    if (channel) {
      try { channel.postMessage(msg); } catch (e) { /* ignore */ }
    }
    // Also poke a ping key so same-tab / storage listeners wake
    try {
      localStorage.setItem('ddad:ping', String(Date.now()));
    } catch (e) { /* ignore */ }
  }

  if (channel) {
    channel.onmessage = function (ev) {
      const data = ev.data || {};
      listeners.forEach(function (fn) { try { fn(data); } catch (e) {} });
    };
  }

  window.addEventListener('storage', function (ev) {
    if (!ev.key) return;
    if (ev.key.indexOf(PREFIX) === 0 || ev.key === 'ddad:ping' || ev.key === UNLOCK_KEY) {
      let code = null;
      let session = null;
      if (ev.key.indexOf(PREFIX) === 0) {
        code = ev.key.slice(PREFIX.length);
        session = read(code);
      }
      const payload = { type: 'storage', code: code, session: session, key: ev.key };
      listeners.forEach(function (fn) { try { fn(payload); } catch (e) {} });
    }
  });

  function onUpdate(fn) {
    listeners.add(fn);
    return function () { listeners.delete(fn); };
  }

  function createSession(opts) {
    opts = opts || {};
    const code = codeGen();
    const session = {
      code: code,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      hostId: opts.hostId || ('host-' + Math.random().toString(36).slice(2, 9)),
      solo: !!opts.solo,
      dungeonId: opts.dungeonId || 'starter-cellar-of-kindness',
      roomIndex: 0,
      phase: 'lobby', // lobby | playing | ended
      party: [],
      log: [],
      lastEffect: null,
      lastResult: null
    };
    write(session);
    setActive({ code: code, role: 'host', playerId: session.hostId, solo: !!opts.solo });
    return session;
  }

  function joinSession(code, playerStub) {
    code = String(code || '').trim().toUpperCase();
    const session = read(code);
    if (!session) return { ok: false, error: 'No session found for that code.' };
    if (session.phase === 'ended') return { ok: false, error: 'That run already ended.' };

    const playerId = 'p-' + Math.random().toString(36).slice(2, 9);
    const member = {
      id: playerId,
      name: (playerStub && playerStub.name) || 'Adventurer',
      look: (playerStub && playerStub.look) || { emoji: '🛡️', color: '#2a9d8f' },
      stats: (playerStub && playerStub.stats) || { grit: 2, wit: 2, care: 2, spark: 2 },
      joinedAt: Date.now()
    };
    session.party = session.party || [];
    session.party.push(member);
    write(session);
    setActive({ code: code, role: 'player', playerId: playerId, solo: false });
    return { ok: true, session: session, player: member };
  }

  function setActive(active) {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(active));
  }

  function getActive() {
    try {
      const raw = localStorage.getItem(ACTIVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function clearActive() {
    localStorage.removeItem(ACTIVE_KEY);
  }

  function isUnlocked() {
    return localStorage.getItem(UNLOCK_KEY) === '1';
  }

  function tryUnlock(code) {
    if (String(code || '').trim().toUpperCase() === 'DUNGEON-DAD-HOST') {
      localStorage.setItem(UNLOCK_KEY, '1');
      broadcast({ type: 'unlock' });
      return true;
    }
    return false;
  }

  function clearUnlock() {
    localStorage.removeItem(UNLOCK_KEY);
  }

  global.DDSession = {
    createSession: createSession,
    joinSession: joinSession,
    read: read,
    write: write,
    onUpdate: onUpdate,
    getActive: getActive,
    setActive: setActive,
    clearActive: clearActive,
    isUnlocked: isUnlocked,
    tryUnlock: tryUnlock,
    clearUnlock: clearUnlock,
    HOST_CODE: 'DUNGEON-DAD-HOST'
  };
})(window);
