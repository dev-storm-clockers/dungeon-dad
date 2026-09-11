/**
 * Dungeon Dad — load packs, advance rooms, fail-forward, campaign, stash
 */
(function (global) {
  let starter = null;
  let stub = null;
  let campaign = null;

  async function loadPacks() {
    const [a, b, c] = await Promise.all([
      fetch('data/starter.json').then(function (r) { return r.json(); }),
      fetch('data/stub-pack.json').then(function (r) { return r.json(); }),
      fetch('data/campaign.json').then(function (r) { return r.json(); }).catch(function () { return null; })
    ]);
    starter = a;
    stub = b;
    campaign = c;
    return { starter: starter, stub: stub, campaign: campaign };
  }

  function getStarter() { return starter; }
  function getStub() { return stub; }
  function getCampaign() { return campaign; }

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
      ? (option.successText || 'It works.')
      : (option.failText || 'It fails — you still move on.');

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
    session.pendingAdvance = true;
    session.phase = 'playing';

    return result;
  }

  function ensureStash(session) {
    if (!session.stash) session.stash = [];
    return session.stash;
  }

  function grantClearLoot(session) {
    if (!starter || !starter.lootOnClear) return null;
    const loot = starter.lootOnClear;
    const stash = ensureStash(session);
    if (stash.some(function (i) { return i.id === loot.id; })) return loot;
    stash.push({
      id: loot.id,
      name: loot.name,
      emoji: loot.emoji || '🔑',
      blurb: loot.blurb || '',
      fromChapter: starter.chapter || 1,
      at: Date.now()
    });
    session.chapterCleared = true;
    return loot;
  }

  /**
   * After Concierge (or last combat) result is locked: grant Spare Key on win.
   */
  function maybeGrantLootFromLastResult(session) {
    const last = session && session.lastResult;
    if (!last || !last.passed) return null;
    const summary = last.combatSummary || {};
    if (summary.enemyId === 'concierge' || last.roomId === 'concierge') {
      return grantClearLoot(session);
    }
    return null;
  }

  function advanceAfterResult(session) {
    if (!session || !session.pendingAdvance) return session;
    maybeGrantLootFromLastResult(session);
    session.pendingAdvance = false;
    session.roomIndex = (session.roomIndex || 0) + 1;
    if (isComplete(session)) {
      session.phase = 'ended';
      // Boss wipe still ends chapter; loot only if clear already granted
      const last = session.lastResult;
      if (last && last.passed && (last.roomId === 'concierge' || (last.combatSummary && last.combatSummary.enemyId === 'concierge'))) {
        grantClearLoot(session);
      }
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
    session.combat = null;
    session.chapterCleared = false;
    // Keep stash across retries in same session code? Fresh run clears pending loot flags only.
    if (!session.stash) session.stash = [];
    return session;
  }

  function buildRecap(session) {
    const pack = starter || { title: 'Dungeon', ending: {}, rooms: [] };
    const party = session.party || [];
    const wiped = session.lastResult && session.lastResult.failForward &&
      (session.lastResult.roomId === 'concierge' ||
        (session.lastResult.combatSummary && session.lastResult.combatSummary.outcome === 'lose'));
    const ending = wiped && pack.wipeEnding ? pack.wipeEnding : (pack.ending || {});
    const lines = [];
    lines.push('Dungeon Dad — Party Recap');
    lines.push('Session: ' + (session.code || '?'));
    lines.push('Adventure: ' + pack.title + ' (Below Maple Street)');
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
          (p.lean ? ' [' + p.lean + ']' : '') +
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
      const mark = r.passed ? '✓' : (r.optionId && String(r.optionId).indexOf('lose') >= 0 ? '✗ wipe' : '→ fail-forward');
      lines.push('  ' + (i + 1) + '. ' + r.roomTitle + ' — ' + r.optionLabel + ' [' + r.effect + '] ' + mark);
      lines.push('     ' + r.text);
    });
    lines.push('');
    const stash = session.stash || [];
    lines.push('Party stash:');
    if (!stash.length) {
      lines.push('  (empty)');
    } else {
      stash.forEach(function (item) {
        lines.push('  ' + (item.emoji || '') + ' ' + item.name + (item.blurb ? ' — ' + item.blurb : ''));
      });
    }
    lines.push('');
    lines.push(ending.title || 'The End');
    lines.push(ending.blurb || '');
    lines.push('');
    lines.push('— Dungeon Dad Productions');
    return lines.join('\n');
  }

  global.DDDungeon = {
    loadPacks: loadPacks,
    getStarter: getStarter,
    getStub: getStub,
    getCampaign: getCampaign,
    currentRoom: currentRoom,
    isComplete: isComplete,
    resolveAction: resolveAction,
    advanceAfterResult: advanceAfterResult,
    startRun: startRun,
    buildRecap: buildRecap,
    grantClearLoot: grantClearLoot,
    maybeGrantLootFromLastResult: maybeGrantLootFromLastResult,
    ensureStash: ensureStash
  };
})(window);
