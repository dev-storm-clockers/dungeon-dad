# AC — Dungeon Dad MVP (Codex sample)

**Product:** Dungeon Dad (UI). Brand: Dungeon Dad Productions.  
**Slug / landing:** `dungeon-dad` on **secdevsolutions.help** managed-sites TLS. Custom NameSilo DNS later — not a blocker.  
**NightDeck:** untouched.

**Done bar:** Quality Verifier must pass **all 6 hard stops** below.  
**Codex budget:** max **4** passes; prefer stop by **2** (pass count ≠ hard-stop count).

## Hard stops (Verifier fails if any miss)

1. **Session start:** Host creates a session and gets a **shareable room/session code**; a second client can join with that code.
2. **Simple characters:** Joined players can create/hold a simple character (name + look/portrait stub + ≤4 stats or traits) visible on a party roster for the session.
3. **Short dungeon run:** Host starts an original **3–6 room** run with **host + ≥1 joined player**, **or** host-only dry-run / solo demo explicitly labeled. Each room shows a **scene image** (or clearly labeled placeholder) plus a clear player action (choice or light check). **Fail-forward:** a “failed” check still advances the room (cosmetic/narration only — never soft-locks the run).
4. **Effects:** Completing a room action triggers a visible **effect** (e.g. hit / loot / trap / banter beat — CSS/animation or equivalent), not text-only feedback.
5. **Run end:** Finishing the run reaches a shareable party recap / end state (on-page; no real email required).
6. **IP:** No WotC / 5e copyrighted names, art, or dumped SRD content — original adventure + rules-lite only.

## Must-holds

- GM-light: a non-expert host can pace rooms without a full rules lawyer UI.
- Workplace-safe / all-ages adventure tone for the free starter dungeon.
- Mobile-usable host + player flows.
- **Money posture (sample) — one observable:** free starter dungeon playable end-to-end; UI shows a **“Host unlock / paid saves — coming soon”** (or equivalent) control. Entering mock code `DUNGEON-DAD-HOST` either reveals a **2nd dungeon stub** (title + locked rooms OK) **or** flips a clear “Unlocked (demo)” badge — Verifier needs **one** of those observables. **No Stripe** in this sample.
- Spelling: **Dungeon Dad** in UI (not DungeonDad).
- Brand revival: **Dungeon Dad Productions** appears once (footer or about).

## Out of scope (MVP sample)

- Stripe / real payments · real cloud character saves across sessions · NightDeck changes · full 5e clone · streamed audio · NameSilo DNS cutover

## Codex

Prefer stop by 2; hard ceiling 4 passes.
