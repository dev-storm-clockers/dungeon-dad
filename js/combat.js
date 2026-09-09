/**
 * Dungeon Dad — card combat (hero + hand + energy, fail-forward)
 * Original cards only; no third-party IP.
 */
(function (global) {
  let catalog = null;

  async function loadCatalog() {
    const res = await fetch('data/cards.json');
    catalog = await res.json();
    return catalog;
  }

  function getCatalog() {
    return catalog;
  }

  function allyById(id) {
    if (!catalog) return null;
    return (catalog.allies || []).find(function (c) { return c.id === id; }) || null;
  }

  function enemyById(id) {
    if (!catalog || !catalog.enemies) return null;
    return catalog.enemies[id] || null;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function heroHp(member) {
    const base = (catalog && catalog.heroes && catalog.heroes.defaultHp) || 8;
    const per = (catalog && catalog.heroes && catalog.heroes.hpPerGrit) || 1;
    const grit = (member && member.stats && member.stats.grit) || 2;
    return base + grit * per;
  }

  /**
   * Build combat state on the session for a combat room.
   * Shared party hand (covers solo-labeled and host-paced multi).
   */
  function beginCombat(session, room) {
    if (!catalog) return null;
    const enemyDef = enemyById((room.combat && room.combat.enemyId) || 'barrel-king');
    if (!enemyDef) return null;

    const party = session.party || [];
    const heroes = (party.length ? party : [{
      id: 'solo-hero',
      name: 'Solo Hero',
      look: { emoji: '🛡️', color: '#2a9d8f' },
      stats: { grit: 2, wit: 2, care: 2, spark: 2 }
    }]).map(function (p) {
      return {
        id: p.id,
        name: p.name,
        emoji: (p.look && p.look.emoji) || '🛡️',
        color: (p.look && p.look.color) || '#2a9d8f',
        maxHp: heroHp(p),
        hp: heroHp(p)
      };
    });

    const deck = shuffle((catalog.allies || []).map(function (c) { return c.id; }));
    const handSize = catalog.handSize || 5;
    const hand = deck.splice(0, Math.min(handSize, deck.length));

    const energyCap = Math.min(catalog.energyPerTurn || 3, catalog.energyMax || 5);

    session.combat = {
      active: true,
      roomId: room.id,
      enemyId: enemyDef.id,
      enemyName: enemyDef.name,
      enemyEmoji: enemyDef.emoji || '🛢️',
      enemyMaxHp: enemyDef.hp,
      enemyHp: enemyDef.hp,
      enemyAtk: enemyDef.atk,
      winText: enemyDef.winText,
      loseText: enemyDef.loseText,
      heroes: heroes,
      board: [], // { instanceId, cardId, name, emoji, atk, hp, maxHp }
      hand: hand,
      deck: deck,
      energy: energyCap,
      energyMax: catalog.energyMax || 5,
      energyPerTurn: catalog.energyPerTurn || 3,
      turn: 1,
      whose: 'party', // party | enemy | done
      log: [],
      outcome: null, // null | win | lose
      sharedHand: true,
      soloLabeled: !!session.solo,
      nextInstance: 1
    };

    session.combat.dealAnim = true; // UI: stagger hand deal once
    pushLog(session.combat, 'Combat begins vs ' + enemyDef.name + '. Shared party hand ready.');
    return session.combat;
  }

  function pushLog(combat, text) {
    combat.log = combat.log || [];
    combat.log.push({ t: Date.now(), text: text });
    if (combat.log.length > 12) combat.log.shift();
  }

  function refillEnergy(combat) {
    const base = combat.energyPerTurn || 3;
    // Mild curve: +1 every other turn, capped
    const bonus = Math.floor((combat.turn - 1) / 2);
    combat.energy = Math.min(combat.energyMax || 5, base + bonus);
  }

  function canPlay(combat, cardId) {
    if (!combat || !combat.active || combat.whose !== 'party' || combat.outcome) return false;
    const def = allyById(cardId);
    if (!def) return false;
    if (combat.hand.indexOf(cardId) === -1) return false;
    return combat.energy >= def.cost;
  }

  function playCard(session, cardId) {
    const combat = session.combat;
    if (!canPlay(combat, cardId)) return { ok: false, error: 'Cannot play that card.' };
    const def = allyById(cardId);
    combat.energy -= def.cost;
    const idx = combat.hand.indexOf(cardId);
    combat.hand.splice(idx, 1);
    const unit = {
      instanceId: 'u' + (combat.nextInstance++),
      cardId: def.id,
      name: def.name,
      emoji: def.emoji,
      atk: def.atk,
      hp: def.hp,
      maxHp: def.hp
    };
    combat.board.push(unit);
    pushLog(combat, 'Played ' + def.name + ' (−' + def.cost + ' Energy).');
    return { ok: true, unit: unit, effect: 'loot', energy: combat.energy, cost: def.cost };
  }

  function livingHeroes(combat) {
    return (combat.heroes || []).filter(function (h) { return h.hp > 0; });
  }

  function livingBoard(combat) {
    return (combat.board || []).filter(function (u) { return u.hp > 0; });
  }

  function checkEnd(combat) {
    if (combat.enemyHp <= 0) {
      combat.enemyHp = 0;
      combat.outcome = 'win';
      combat.whose = 'done';
      combat.active = false;
      pushLog(combat, 'Victory! ' + combat.enemyName + ' yields.');
      return 'win';
    }
    if (!livingHeroes(combat).length) {
      combat.outcome = 'lose';
      combat.whose = 'done';
      combat.active = false;
      pushLog(combat, 'Defeat — but fail-forward still opens the path.');
      return 'lose';
    }
    return null;
  }

  /**
   * End party turn: allies strike enemy, then enemy strikes back, then refill.
   */
  function endTurn(session) {
    const combat = session.combat;
    if (!combat || combat.whose !== 'party' || combat.outcome) {
      return { ok: false, error: 'Not your turn.' };
    }

    const strikes = [];

    // Allies attack
    livingBoard(combat).forEach(function (u) {
      combat.enemyHp -= u.atk;
      strikes.push({ kind: 'ally', name: u.name, dmg: u.atk });
      pushLog(combat, u.name + ' hits for ' + u.atk + '.');
    });
    if (!livingBoard(combat).length) {
      pushLog(combat, 'No allies on the board — no party strike.');
    }

    let end = checkEnd(combat);
    if (end) {
      return { ok: true, strikes: strikes, fainted: [], outcome: end, effect: end === 'win' ? 'banter' : 'hit' };
    }

    // Enemy attack: prefer damaging an ally, else a hero
    combat.whose = 'enemy';
    const dmg = combat.enemyAtk || 1;
    const board = livingBoard(combat);
    let targetLabel = '';
    let targetKind = 'hero';
    let targetId = null;
    const fainted = [];
    if (board.length) {
      const t = board[Math.floor(Math.random() * board.length)];
      t.hp -= dmg;
      targetLabel = t.name;
      targetKind = 'ally';
      targetId = t.instanceId;
      if (t.hp <= 0) {
        t.hp = 0;
        fainted.push({
          instanceId: t.instanceId,
          name: t.name,
          emoji: t.emoji,
          atk: t.atk,
          maxHp: t.maxHp
        });
        pushLog(combat, combat.enemyName + ' bonks ' + t.name + ' for ' + dmg + ' (faints).');
        combat.board = combat.board.filter(function (u) { return u.hp > 0; });
      } else {
        pushLog(combat, combat.enemyName + ' bonks ' + t.name + ' for ' + dmg + '.');
      }
    } else {
      const heroes = livingHeroes(combat);
      const t = heroes[Math.floor(Math.random() * heroes.length)];
      t.hp -= dmg;
      targetLabel = t.name;
      targetKind = 'hero';
      targetId = t.id;
      if (t.hp < 0) t.hp = 0;
      pushLog(combat, combat.enemyName + ' bonks hero ' + t.name + ' for ' + dmg + '.');
    }
    strikes.push({
      kind: 'enemy',
      name: combat.enemyName,
      dmg: dmg,
      target: targetLabel,
      targetKind: targetKind,
      targetId: targetId
    });

    end = checkEnd(combat);
    if (end) {
      return { ok: true, strikes: strikes, fainted: fainted, outcome: end, effect: 'hit' };
    }

    // Next party turn
    combat.turn += 1;
    combat.whose = 'party';
    refillEnergy(combat);
    let drawn = null;
    // Draw 1 if room in hand
    if (combat.deck && combat.deck.length && combat.hand.length < (catalog.handSize || 5)) {
      drawn = combat.deck.shift();
      combat.hand.push(drawn);
      combat.dealDrawn = true; // UI: brief deal on drawn card
      pushLog(combat, 'Drew a card. Energy refilled to ' + combat.energy + '.');
    } else {
      pushLog(combat, 'Energy refilled to ' + combat.energy + '. Turn ' + combat.turn + '.');
    }

    return {
      ok: true,
      strikes: strikes,
      fainted: fainted,
      drawn: drawn,
      energy: combat.energy,
      outcome: null,
      effect: 'hit'
    };
  }

  /** Explicit fail-forward concede — never soft-locks. */
  function concede(session) {
    const combat = session.combat;
    if (!combat || combat.outcome) return { ok: false };
    combat.outcome = 'lose';
    combat.whose = 'done';
    combat.active = false;
    pushLog(combat, 'Party yields — fail-forward.');
    return { ok: true, outcome: 'lose', effect: 'trap' };
  }

  /**
   * Write a dungeon lastResult from combat outcome and mark pendingAdvance.
   */
  function finalizeToRoomResult(session, room) {
    const combat = session.combat;
    if (!combat || !combat.outcome) return null;
    const passed = combat.outcome === 'win';
    const text = passed
      ? (combat.winText || 'You win the bout!')
      : (combat.loseText || 'You stumble — but the story still moves on.');
    const result = {
      roomId: room.id,
      roomTitle: room.title,
      optionId: 'combat-' + combat.outcome,
      optionLabel: passed ? 'Card combat victory' : 'Card combat (fail-forward)',
      effect: passed ? 'banter' : 'hit',
      passed: passed,
      failForward: !passed,
      checkDc: null,
      roll: null,
      text: text,
      actorName: 'Party',
      at: Date.now(),
      combatSummary: {
        turns: combat.turn,
        enemyHp: combat.enemyHp,
        outcome: combat.outcome
      }
    };
    session.log = session.log || [];
    session.log.push(result);
    session.lastResult = result;
    session.lastEffect = result.effect;
    session.pendingAdvance = true;
    session.combat = null; // clear board state after result locked
    return result;
  }

  function isCombatRoom(room) {
    return !!(room && (room.type === 'combat' || (room.action && room.action.type === 'combat')));
  }

  global.DDCombat = {
    loadCatalog: loadCatalog,
    getCatalog: getCatalog,
    allyById: allyById,
    enemyById: enemyById,
    beginCombat: beginCombat,
    canPlay: canPlay,
    playCard: playCard,
    endTurn: endTurn,
    concede: concede,
    finalizeToRoomResult: finalizeToRoomResult,
    isCombatRoom: isCombatRoom
  };
})(window);
