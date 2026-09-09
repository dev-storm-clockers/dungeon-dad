# ARTIFACT — dungeon-dad

- **root:** /workspace/dungeon-dad
- **slug:** dungeon-dad
- **entrypoints:**
  - `index.html` / `play.html` / `end.html`
  - `js/{session,party,dungeon,combat,effects,ui}.js` / `css/site.css`
  - `data/starter.json` · `data/stub-pack.json` · `data/cards.json`
  - `assets/logo.png` · `assets/rooms/{entrance,treasure,trap,boss}.png`
- **how_to_run:** |
    `python3 -m http.server 4174 --directory /workspace/dungeon-dad` → http://127.0.0.1:4174/
    Card combat (Barrel King): room index **4** (0-based) — last room in starter.
    Smoke shortcuts: host **Skip to Barrel King (debug)** on any choice room, or start with `play.html?room=boss` then Start (Pages may redirect `?room=boss` home — use Skip debug).
    Natural path: Continue through rooms 1–4 (entrance → treasure → trap → banter → boss).
- **live_url:** https://dev-storm-clockers.github.io/dungeon-dad/
- **owner_agent:** Build Head
- **ready_for_quality:** no
- **pass:** 3 (nicer motion — static CSS/WAAPI; ready=no until smoke)
- **notes:** |
  **Pass 3 done (local):** AC `/workspace/dungeon-dad/AC-change-pass3-nicer.md` — card hand→board FLIP/enter (~400ms), faint exit, chip hit shake ≥360ms + DDEffects, whose/energy chrome pulse, hand deal stagger, mobile combat CSS (~375px). No React/Framer/Rive. NightDeck untouched. Prefer STOP — no Lilly.

  **Pass 2 STOP-GO:** https://dev-storm-clockers.github.io/dungeon-dad/ (`c3aa5e6` / ARTIFACT `b89f2e8`).
