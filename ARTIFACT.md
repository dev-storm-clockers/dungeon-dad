# ARTIFACT — dungeon-dad

- **root:** /workspace/dungeon-dad
- **slug:** dungeon-dad
- **entrypoints:**
  - `index.html` / `play.html` / `end.html`
  - `js/{session,party,dungeon,combat,effects,ui}.js` / `css/site.css`
  - `data/starter.json` (Ch.1 The Hatch) · `data/campaign.json` · `data/cards.json` · `data/stub-pack.json`
  - `assets/logo.png` · `assets/rooms/{entrance,treasure,trap,boss}.png`
- **how_to_run:** |
    `python3 -m http.server 4174 --directory /workspace/dungeon-dad` → http://127.0.0.1:4174/
    Host Ch.1: Porch light → First ladder → Toll booth → Side tunnel → Concierge.
    Debug: Skip to Concierge. Spare Key lands in party stash on Concierge win.
- **live_url:** https://dev-storm-clockers.github.io/dungeon-dad/
- **owner_agent:** Build Head
- **ready_for_quality:** no
- **pass:** 4
- **notes:** |
  **Pass 4 — Below Maple Street Ch.1 (Build 2026-09-10):** Replaced Cellar-of-Kindness / sticky-toffee / cinnamon-sprite starter with adult dry Ch.1 **The Hatch** (5 rooms). Cards/enemies retuned to Maple Street. Four selectable heroes: Torch · Keen · Heft · Wry (passives matter). Concierge energy-toll telegraph → unpaid HP. Clear grants **Spare Key** to party stash (visible play + end). Campaign map: 8 GDD chapters; Ch.1 playable; 2–8 locked stubs. Engine kept (session/join, roster, energy card combat + Pass 3 motion, wipe/victory, mobile hand). Brand Dungeon Dad / Dungeon Dad Productions. NightDeck untouched. **ready_for_quality: no** pending Build smoke/Phil gate.
  **Replaced content:** starter Cellar of Kindness rooms + Barrel King; kids card names (Cinnamon Sprite, Toffee Guard, Kindness Cub, Cellar Choir, etc.); free-form look/stat sheet → fixed four heroes; Moonlit Attic stub framing softened to Ch.2–8 locked note.
