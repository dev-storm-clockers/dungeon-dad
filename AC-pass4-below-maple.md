# Dungeon Dad Pass 4 — *Below Maple Street* Chapter 1 (The Hatch)

**When:** Phil 2026-09-10 — develop the full game; don’t wrap kits.  
**GDD:** `/workspace/dungeon-dad/GDD-full-game.md` (source of truth).  
**Owner implement:** Build Head. Product owns this AC.  
**Live:** https://dev-storm-clockers.github.io/dungeon-dad/ · root `/workspace/dungeon-dad/`  
**Budget:** one strong pass → Pages → STOP-GO. Prefer STOP after GO.  
**Lilly:** Product never calls. No Lilly unless Phil yes via CoS→Harness.

## Goal
Replace Cellar-of-Kindness / sticky-toffee starter with **Chapter 1 — The Hatch** of *Below Maple Street*: adult, dry, competent co-op crawl. Keep session/join/card-combat engine (Pass 2–3 spine). Ship a playable free Ch.1 + campaign map for 8 chapters (2–8 stubs).

## Hard stops (Verifier)
1. **Tone kill:** No Cellar-of-Kindness / kindness-toffee / kids-book voice in UI or room copy. Voice = short, dry, specific (GDD). No Money Brief / pack-pitch language.
2. **Chapter 1 playable end-to-end:** **The Hatch** — 5 rooms per GDD beat sheet:
   1. Porch light (choice; fail-forward)
   2. First ladder (check; Keen shines; trap telegraph)
   3. Toll booth (choice; sets Concierge rules)
   4. Side tunnel (first full card fight)
   5. **The Concierge** boss (energy-tax / toll-in-HP pattern; kill or wipe + recap)
3. **Four named heroes** selectable: Torch · Keen · Heft · Wry (combat leans per GDD). Distinct enough to matter in Ch.1.
4. **Party stash loot:** Clear Ch.1 grants **Spare Key** into party stash (visible; used by Ch.2 stub later).
5. **Campaign map UI:** Shows all **8 chapters** (titles + boss names from GDD); Ch.1 playable; Ch.2–8 locked stubs with one-line hooks (data OK).
6. **Engine kept:** Session/host join code, roster, energy card combat (End turn, readable intent), wipe/victory paths, mobile-usable board. NightDeck untouched.
7. **Brand:** Dungeon Dad / Dungeon Dad Productions; original IP (no WotC). ARTIFACT notes what content replaced.

## Must-holds (non-blocking if thin)
- Card set / enemy copy retuned to Maple Street tone (drop cinnamon-sprite kids names where they appear in starter path).
- Concierge telegraph → punish readable before commit.
- Prior Pass 3 motion still works on new combat (no teleport cards).
- Solo dry-run still possible for host.

## Out of scope
Ch.2–8 full content · Stripe/unlock paywall UI polish · NightDeck · Lilly · Money Brief · Meridian · React rewrite · ranked CCG

## Success
Phil can host Ch.1 once with friends and not apologize. Prefer STOP after Quality GO.
