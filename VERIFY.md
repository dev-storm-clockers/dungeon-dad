# VERIFY — dungeon-dad

- **lock_ref:** /workspace/dungeon-dad/LOCK.md
- **artifact_ref:** /workspace/dungeon-dad/ARTIFACT.md
- **ac_ref:** /workspace/dungeon-dad/AC-mvp.md
- **done_bar:** |
  Hard stops (fail if any miss):
  1. Session start — host creates session + shareable code; second client joins
  2. Simple characters — name + look/portrait stub + ≤4 stats/traits; visible party roster
  3. Short dungeon — original 3–6 rooms; host+≥1 player OR labeled solo dry-run; each room scene image/placeholder + clear action; fail-forward (never soft-lock)
  4. Effects — room action shows visible effect (not text-only)
  5. Run end — shareable party recap/end state
  6. IP — no WotC/5e copyrighted names/art/dumped SRD

  Must-holds: GM-light host pace; all-ages free starter; mobile-usable; money sample — free starter E2E + “Host unlock / paid saves — coming soon” (or equiv); mock code DUNGEON-DAD-HOST → 2nd dungeon stub OR “Unlocked (demo)” badge; spelling **Dungeon Dad**; **Dungeon Dad Productions** once in footer/about; NightDeck untouched
- **browser_required:** yes
- **evidence_owner:** Verifier
- **evidence_paths:** /tmp/verify-this/dungeon-dad-pass1/
- **pass_n_result:** PASS (pass 1 / local :4174)
- **fail_list:** (none)
- **quality_head_decision:** STOP-GO
- **notes:** |
  Pass 1 Quality Verifier (2026-09-09 ~14:35 AT). Local gate http://127.0.0.1:4174/ served; HTTP 200 on index/play/end/data/assets/css.
  Hard stops 1–6 PASS: create+join (code + Pip); 4-stat roster; 5-room Cellar of Kindness host+player with scene images + fail-forward advance; fx hit/loot/trap/banter; shareable recap; IP grep clean.
  Must-holds PASS: GM-light host pace; all-ages; mobile viewport/CSS; money coming-soon + DUNGEON-DAD-HOST → Unlocked (demo)/Moonlit Attic stub; spelling Dungeon Dad; Productions footer; NightDeck path-check only (untouched).
  Evidence: logic-results.json, room-log.json, fx-calls.json, recap.txt, http-checks.txt, ip-grep.txt, dump-index.html, VERDICT.md.
  Nit (non-blocking): ensureFooter may duplicate footer when scripts run before static footer.
  Prefer stop by 2. Verifier does not set STOP/GO.
