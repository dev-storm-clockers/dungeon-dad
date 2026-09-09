/**
 * Dungeon Dad — load packs, advance rooms, fail-forward
 */
(function (global) {
  let starter = null;
  let stub = null;

  async function loadPacks() {
    const [a, b] = await Promise.all([
      fetch('data/starter.json').then(function (r) { return r.json(); }),
      fetch('data/stub-pack.json').then(function (r) { return r.json(); })
    ]);
    starter = a;
    stub = b;
    return { starter: starter, stub: stub };
  }

  function getStarter() { return starter; }
  function getStub() { return stub; }

  function currentRoom(session) {
    if (!starter || !session) return null;
    const rooms = starter.rooms || [];
    const idx = session.roomIndex || 0;
    if (idx < 0 || idx >= rooms.length) return null;
    return rooms[idx];
  }

  function isComplete(session) {
    if (!starter || !session) return false;
    return (session.roomIndex || 0) >= (starter.rooms || []).length;
  }

  /**
   * Resolve a room action. Fail-forward: failed checks still mark pendingAdvance.
   * Room index advances on advanceAfterResult() so the result UI can show the same room.
   */
  function resolveAction(session, optionId, actor) {
    const room = currentRoom(session);
    if (!room || !room.action) return null;
    const opts = room.action.options || [];
    const option = opts.find(function (o) { return o.id === optionId; }) || opts[0];
    if (!option) return null;

    let passed = true;
    let roll = null;
    if (option.check) {
      const stats = (actor && actor.stats) || { grit: 2, wit: 2, care: 2, spark: 2 };
      roll = DDParty.rollCheck(stats, option.check.stat);
      passed = roll.total >= (option.check.dc || 3);
    }

    const text = passed
      ? (option.successText || 'It works!')
      : (option.failText || 'It fumbles — but the story still moves on.');

    const result = {
      roomId: room.id,
      roomTitle: room.title,
      optionId: option.id,
      optionLabel: option.label,
      effect: option.effect || 'banter',
      passed: passed,
      failForward: !passed,
      checkDc: option.check ? option.check.dc : null,
      roll: roll,
      text: text,
      actorName: (actor && actor.name) || 'Party',
      at: Date.now()
    };

    session.log = session.log || [];
    session.log.push(result);
    session.lastResult = result;
    session.lastEffect = result.effect;
    session.pendingAdvance = true; // always advance on continue (fail-forward)
    session.phase = 'playing';

    return result;
  }

  function advanceAfterResult(session) {
    if (!session || !session.pendingAdvance) return session;
    session.pendingAdvance = false;
    session.roomIndex = (session.roomIndex || 0) + 1;
    if (isComplete(session)) {
      session.phase = 'ended';
    }
    return session;
  }

  function startRun(session) {
    session.phase = 'playing';
    session.roomIndex = 0;
    session.log = [];
    session.lastResult = null;
    session.lastEffect = null;
    session.pendingAdvance = false;
    return session;
  }

  function buildRecap(session) {
    const pack = starter || { title: 'Dungeon', ending: {}, rooms: [] };
    const party = session.party || [];
    const lines = [];
    lines.push('Dungeon Dad — Party Recap');
    lines.push('Session: ' + (session.code || '?'));
    lines.push('Adventure: ' + pack.title);
    lines.push('');
    lines.push('Party:');
    if (!party.length) {
      lines.push('  (solo / empty roster)');
    } else {
      party.forEach(function (p) {
        const look = p.look || {};
        const stats = p.stats || {};
        lines.push(
          '  ' + (look.emoji || '') + ' ' + p.name +
          ' — Grit ' + (stats.grit || '?') +
          ', Wit ' + (stats.wit || '?') +
          ', Care ' + (stats.care || '?') +
          ', Spark ' + (stats.spark || '?')
        );
      });
    }
    lines.push('');
    lines.push('Beats:');
    (session.log || []).forEach(function (r, i) {
      const mark = r.passed ? '✓' : '→ fail-forward';
      lines.push('  ' + (i + 1) + '. ' + r.roomTitle + ' — ' + r.optionLabel + ' [' + r.effect + '] ' + mark);
      lines.push('     ' + r.text);
    });
    lines.push('');
    lines.push((pack.ending && pack.ending.title) || 'The End');
    lines.push((pack.ending && pack.ending.blurb) || '');
    lines.push('');
    lines.push('— Dungeon Dad Productions');
    return lines.join('\n');
  }

  global.DDDungeon = {
    loadPacks: loadPacks,
    getStarter: getStarter,
    getStub: getStub,
    currentRoom: currentRoom,
    isComplete: isComplete,
    resolveAction: resolveAction,
    advanceAfterResult: advanceAfterResult,
    startRun: startRun,
    buildRecap: buildRecap
  };
})(window);
