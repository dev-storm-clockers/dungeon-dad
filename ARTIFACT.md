# ARTIFACT — dungeon-dad

- **root:** /workspace/dungeon-dad
- **slug:** dungeon-dad
- **entrypoints:**
  - `index.html` / `play.html` / `end.html`
  - `js/{session,party,dungeon,effects,ui}.js` / `css/site.css`
  - `data/starter.json` · `data/stub-pack.json`
  - `assets/logo.png` · `assets/rooms/{entrance,treasure,trap,boss}.png`
- **how_to_run:** `python3 -m http.server 4174 --directory /workspace/dungeon-dad` → http://127.0.0.1:4174/
- **live_url:** https://dev-storm-clockers.github.io/dungeon-dad/
- **owner_agent:** Build Head
- **ready_for_quality:** yes
- **pass:** 1
- **notes:** |
  **Pages ship 2026-09-09:** Build smoke PASS on live URL — HTTP 200 index/play/end + js/css/data/assets; Productions footer present. Repo https://github.com/dev-storm-clockers/dungeon-dad. VERIFY against AC-mvp. Prefer STOP. Lilly/secdevsolutions.help still parked. NightDeck untouched.
