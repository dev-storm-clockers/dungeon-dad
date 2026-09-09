# AC change-note — Dungeon Dad Pass 3 (nicer motion)

**Prior:** AC-mvp + Pass 2 card combat still stand.  
**Live:** https://dev-storm-clockers.github.io/dungeon-dad/  
**Budget:** prefer **one** pass then STOP if Done green. No Lilly unless Phil yes.

## Framework decision (Product)
- **This pass:** stay **static HTML/JS + CSS / Web Animations API** (optional View Transitions).
- **Not this pass:** full **React (Vite)** rewrite, Framer Motion app shell, or Rive as a hard dependency.
- React/Vite may be a later LOCK if Phil still wants a framework after this polish.

## Hard stops
1. **Card motion:** Playing a card shows clear enter/exit (or deal) animation — not an instant teleport onto the board.
2. **Combat FX:** Hit / loot / resolve uses visible motion (~≥300ms CSS/WAAPI or equivalent), not text-only flash.
3. **Turn chrome:** Whose turn + resource change is visually marked (pulse/highlight) and still readable.
4. **Mobile:** Combat board usable on a phone viewport (no broken overflow / unusable taps).
5. **Prior path intact:** Session join, roster, hero/hand/resource/card combat, mock unlock observable, free starter end-to-end, original IP, NightDeck untouched.

## Must-holds
- All-ages tone unchanged
- Dungeon Dad / Dungeon Dad Productions spelling/brand rules unchanged
- Prefer stop after this pass — no endless taste loops

## Out of scope
- Full React rewrite · ranked/meta CCG · WotC or Might & Magic IP · Lilly publish · Stripe · NightDeck changes
