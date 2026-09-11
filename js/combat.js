/**
 * Dungeon Dad — card combat (energy, allies, End turn, Concierge toll)
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

  function partyHasPassive(heroes, passive) {
    return (heroes || []).some(function (h) {
      return h.hp > 0 && h.passive === passive;
    });
  }

  function buildIntent(enemyDef, combat) {
    if (!enemyDef) return '';
    if (enemyDef.pattern === 'energy-toll') {
      const te = enemyDef.tollEnergy || 1;
      const th = enemyDef.tollHp || 3;
      return 'TOLL DUE — after End turn: tax ' + te + ' Energy. If unpaid → ' + th + ' HP. Then strikes.';
    }
    return enemyDef.intent || ('Strikes for ' + (enemyDef.atk || combat.enemyAtk || 1) + '.');
  }

  /**
   * Build combat state on the session for a combat room.
   * Shared party hand (covers solo-labeled and host-paced multi).
   */
  function beginCombat(session, room) {
    if (!catalog) return null;
    const enemyDef = enemyById((room.combat && room.combat.enemyId) || 'concierge');
    if (!enemyDef) return null;

    const party = session.party || [];
    const heroes = (party.length ? party : [{
      id: 'solo-hero',
      heroId: 'torch',
      name: 'Torch',
      look: { emoji: '🔦', color: '#e9c46a' },
      stats: { grit: 3, wit: 2, care: 3, spark: 2 },
      passive: 'block'
    }]).map(function (p) {
      return {
        id: p.id,
        heroId: p.heroId || null,
        name: p.name,
        emoji: (p.look && p.look.emoji) || '🔦',
        color: (p.look && p.look.color) || '#e9c46a',
        maxHp: heroHp(p),
        hp: heroHp(p),
        passive: p.passive || null,
        lean: p.lean || null
      };
    });

    const deck = shuffle((catalog.allies || []).map(function (c) { return c.id; }));
    const handSize = catalog.handSize || 5;
    let drawCount = Math.min(handSize, deck.length);
    // Keen: extra draw at combat start
    if (partyHasPassive(heroes, 'draw') && deck.length > drawCount) {
      drawCount += 1;
    }
    const hand = deck.splice(0, drawCount);

    const energyCap = Math.min(catalog.energyPerTurn || 3, catalog.energyMax || 5);

    // Wry disrupt: shave 1 off enemy atk for this fight (min 1)
    let enemyAtk = enemyDef.atk || 1;
    let wryDisrupt = false;
    if (partyHasPassive(heroes, 'disrupt') && enemyAtk > 1) {
      enemyAtk -= 1;
      wryDisrupt = true;
    }

    session.combat = {
      active: true,
      roomId: room.id,
      enemyId: enemyDef.id,
      enemyName: enemyDef.name,
      enemyEmoji: enemyDef.emoji || '🚪',
      enemyMaxHp: enemyDef.hp,
      enemyHp: enemyDef.hp,
      enemyAtk: enemyAtk,
      enemyBaseAtk: enemyDef.atk || 1,
      pattern: enemyDef.pattern || null,
      tollEnergy: enemyDef.tollEnergy || 0,
      tollHp: enemyDef.tollHp || 0,
      intent: buildIntent(enemyDef, { enemyAtk: enemyAtk }),
      winText: enemyDef.winText,
      loseText: enemyDef.loseText,
      heroes: heroes,
      board: [],
      hand: hand,
      deck: deck,
      energy: energyCap,
      energyMax: catalog.energyMax || 5,
      energyPerTurn: catalog.energyPerTurn || 3,
      turn: 1,
      whose: 'party',
      log: [],
      outcome: null,
      sharedHand: true,
      soloLabeled: !!session.solo,
      nextInstance: 1,
      torchBlockReady: partyHasPassive(heroes, 'block'),
      wryDisrupt: wryDisrupt,
      heftBonus: partyHasPassive(heroes, 'damage')
    };

    session.combat.dealAnim = true;
    pushLog(session.combat, 'Combat vs ' + enemyDef.name + '.');
    if (partyHasPassive(heroes, 'draw')) {
      pushLog(session.combat, 'Keen: +1 card at open.');
    }
    if (wryDisrupt) {
      pushLog(session.combat, 'Wry: foe ATK −1 this fight.');
    }
    if (session.combat.torchBlockReady) {
      pushLog(session.combat, 'Torch: first foe hit blocked (−1).');
    }
    if (session.combat.heftBonus) {
      pushLog(session.combat, 'Heft: allies strike +1 while Heft stands.');
    }
    if (enemyDef.pattern === 'energy-toll') {
      pushLog(session.combat, 'TELEGRAPH: ' + session.combat.intent);
    }
    return session.combat;
  }

  function pushLog(combat, text) {
    combat.log = combat.log || [];
    combat.log.push({ t: Date.now(), text: text });
    if (combat.log.length > 14) combat.log.shift();
  }

  function refillEnergy(combat) {
    const base = combat.energyPerTurn || 3;
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

    let atk = def.atk;
    if (combat.heftBonus && partyHasPassive(combat.heroes, 'damage')) {
      atk += 1;
    }

    const unit = {
      instanceId: 'u' + (combat.nextInstance++),
      cardId: def.id,
      name: def.name,
      emoji: def.emoji,
      atk: atk,
      hp: def.hp,
      maxHp: def.hp
    };
    combat.board.push(unit);
    pushLog(combat, 'Played ' + def.name + ' (−' + def.cost + ' Energy).');

    // Wry heal-light: cheap plays patch 1 HP on lowest living hero
    if (partyHasPassive(combat.heroes, 'disrupt') && def.cost <= 1) {
      const living = livingHeroes(combat).slice().sort(function (a, b) { return a.hp - b.hp; });
      if (living.length && living[0].hp < living[0].maxHp) {
        living[0].hp = Math.min(living[0].maxHp, living[0].hp + 1);
        pushLog(combat, 'Wry: ' + living[0].name + ' patches +1 HP.');
      }
    }

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
      pushLog(combat, 'Victory — ' + combat.enemyName + ' down.');
      return 'win';
    }
    if (!livingHeroes(combat).length) {
      combat.outcome = 'lose';
      combat.whose = 'done';
      combat.active = false;
      pushLog(combat, 'Wipe — party down.');
      return 'lose';
    }
    return null;
  }

  function applyToll(combat, strikes) {
    if (combat.pattern !== 'energy-toll') return;
    const tax = combat.tollEnergy || 1;
    const tollHp = combat.tollHp || 3;
    if (combat.energy >= tax) {
      combat.energy -= tax;
      pushLog(combat, 'Toll paid (−' + tax + ' Energy). Ledger satisfied.');
      strikes.push({ kind: 'toll-paid', name: combat.enemyName, dmg: 0, tax: tax });
    } else {
      const heroes = livingHeroes(combat);
      if (!heroes.length) return;
      const t = heroes[Math.floor(Math.random() * heroes.length)];
      let dmg = tollHp;
      if (combat.torchBlockReady) {
        dmg = Math.max(0, dmg - 1);
        combat.torchBlockReady = false;
        pushLog(combat, 'Torch blocks 1 of the toll.');
      }
      t.hp -= dmg;
      if (t.hp < 0) t.hp = 0;
      pushLog(combat, 'Toll unpaid — ' + combat.enemyName + ' takes ' + dmg + ' HP from ' + t.name + '.');
      strikes.push({
        kind: 'enemy',
        name: combat.enemyName,
        dmg: dmg,
        target: t.name,
        targetKind: 'hero',
        targetId: t.id,
        toll: true
      });
    }
  }

  /**
   * End party turn: allies strike enemy, toll (if any), enemy strikes, refill.
   */
  function endTurn(session) {
    const combat = session.combat;
    if (!combat || combat.whose !== 'party' || combat.outcome) {
      return { ok: false, error: 'Not your turn.' };
    }

    const strikes = [];

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

    combat.whose = 'enemy';

    // Concierge energy-toll before the regular swing
    applyToll(combat, strikes);
    end = checkEnd(combat);
    if (end) {
      return { ok: true, strikes: strikes, fainted: [], outcome: end, effect: 'hit' };
    }

    const dmg0 = combat.enemyAtk || 1;
    let dmg = dmg0;
    const board = livingBoard(combat);
    let targetLabel = '';
    let targetKind = 'hero';
    let targetId = null;
    const fainted = [];

    if (board.length) {
      const t = board[Math.floor(Math.random() * board.length)];
      if (combat.torchBlockReady) {
        dmg = Math.max(0, dmg - 1);
        combat.torchBlockReady = false;
        pushLog(combat, 'Torch blocks 1.');
      }
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
        pushLog(combat, combat.enemyName + ' hits ' + t.name + ' for ' + dmg + ' (faints).');
        combat.board = combat.board.filter(function (u) { return u.hp > 0; });
      } else {
        pushLog(combat, combat.enemyName + ' hits ' + t.name + ' for ' + dmg + '.');
      }
    } else {
      const heroes = livingHeroes(combat);
      const t = heroes[Math.floor(Math.random() * heroes.length)];
      if (combat.torchBlockReady) {
        dmg = Math.max(0, dmg - 1);
        combat.torchBlockReady = false;
        pushLog(combat, 'Torch blocks 1.');
      }
      t.hp -= dmg;
      targetLabel = t.name;
      targetKind = 'hero';
      targetId = t.id;
      if (t.hp < 0) t.hp = 0;
      pushLog(combat, combat.enemyName + ' hits ' + t.name + ' for ' + dmg + '.');
    }
    strikes.push({
      kind: 'enemy',
      name: combat.enemyName,
      dmg: dmg,
      target: targetLabel,
      targetKind: targetKind,
      targetId: targetId
    });

    // Heft down → lose damage bonus for later plays (board units keep their rolled atk)
    if (!partyHasPassive(combat.heroes, 'damage')) {
      combat.heftBonus = false;
    }

    end = checkEnd(combat);
    if (end) {
      return { ok: true, strikes: strikes, fainted: fainted, outcome: end, effect: 'hit' };
    }

    combat.turn += 1;
    combat.whose = 'party';
    refillEnergy(combat);
    // Refresh intent telegraph for next commit
    const enemyDef = enemyById(combat.enemyId);
    combat.intent = buildIntent(enemyDef || { pattern: combat.pattern, tollEnergy: combat.tollEnergy, tollHp: combat.tollHp, atk: combat.enemyAtk }, combat);

    let drawn = null;
    if (combat.deck && combat.deck.length && combat.hand.length < (catalog.handSize || 5)) {
      drawn = combat.deck.shift();
      combat.hand.push(drawn);
      combat.dealDrawn = true;
      pushLog(combat, 'Drew a card. Energy ' + combat.energy + '.');
    } else {
      pushLog(combat, 'Energy ' + combat.energy + '. Turn ' + combat.turn + '.');
    }
    if (combat.pattern === 'energy-toll') {
      pushLog(combat, 'TELEGRAPH: ' + combat.intent);
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

  function concede(session) {
    const combat = session.combat;
    if (!combat || combat.outcome) return { ok: false };
    combat.outcome = 'lose';
    combat.whose = 'done';
    combat.active = false;
    pushLog(combat, 'Party yields — wipe path.');
    return { ok: true, outcome: 'lose', effect: 'trap' };
  }

  function finalizeToRoomResult(session, room) {
    const combat = session.combat;
    if (!combat || !combat.outcome) return null;
    const passed = combat.outcome === 'win';
    const text = passed
      ? (combat.winText || 'You win the bout.')
      : (combat.loseText || 'Wipe — recap and try again.');
    const result = {
      roomId: room.id,
      roomTitle: room.title,
      optionId: 'combat-' + combat.outcome,
      optionLabel: passed ? 'Card combat victory' : 'Wipe',
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
        outcome: combat.outcome,
        enemyId: combat.enemyId
      }
    };
    session.log = session.log || [];
    session.log.push(result);
    session.lastResult = result;
    session.lastEffect = result.effect;
    session.pendingAdvance = true;
    session.combat = null;
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
    isCombatRoom: isCombatRoom,
    buildIntent: buildIntent
  };
})(window);
