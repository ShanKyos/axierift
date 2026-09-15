# Axie Rift

A browser action-RPG set in Lunacia, built in the shape of classic MU Online. Original IP on Axie
Infinity lore, made for the Axie Infinity Builder's Program.

**Your Axie is your body. The five classes are your power.** You play as an Axie; when you strike,
a Dark Knight — or a Dark Wizard, a Sylvan Ranger, a Spellblade, a Dark Lord — materialises beside
you, casts, and dissolves. Every stat, every skill and every piece of gear lives on the class. The
Axie carries none of it, so any Axie can be any class.

![Character select — five classes, five Axies, on the Lunacia ridge](docs/img/title.webp)

## Play it

**▶ Live build: http://14.225.204.107/?test=1** — nothing to install, nothing to sign up for.

That `?test=1` starts you wearing a full set of real art gear instead of bare-skinned, so the
character and equipment art is visible from the first second. It grants no levels and no currency —
the game underneath is the normal one.

If you would rather see the end of the game than play up to it, `?max=1` gives you level 120 with
every system unlocked and maxed: end-game gear at +11, wings, jewels, Box Kundun.

Or run it locally. `public/game/` is a self-contained static app — canvas 2D + vanilla JS, no build
step, no backend, no `.env`, no database:

```bash
git clone https://github.com/ShanKyos/axierift.git
cd axierift/public/game
python3 -m http.server 8850     # or: npx serve -l 8850
```

Open `http://localhost:8850/`. Auth and cloud-save calls to `/api/*` will fail behind a plain static
server; the game degrades to local-only play, which is enough to see everything below.

![In the world — the Axie avatar with its class layer materialising mid-swing](docs/img/world.webp)

*Level 40 in Werebear Woods. The orange Axie is the player; the armoured figure beside it is the
Dark Knight layer, summoned for the swing. It fades after the hit — the Axie never leaves.*

## What's in it

All numbers below are read out of the running game, not counted by hand.

| | |
|---|---|
| Classes | 5 — Dark Knight · Sylvan Ranger · Dark Wizard · Spellblade · Dark Lord |
| Axie bodies | 16, each with its own baked animation sheets; granted through the Khế Ước gacha |
| Levels | 1–120, paced to ~3 hours to level 60 — measured in-engine, not guessed (`tools/do_nhipcap.cjs` → `tools/can_exp.cjs`) |
| Maps | 13 — a walled hub town, 9 wilderness regions, 2 corridors, 1 dungeon. Regions run 4200×3200 to 5200×3800, the hub 6400×3200; all tile-laid isometric ground, no painted backdrops |
| Mobs | 48 types, with roles assigned **per camp** rather than per species, so three species still produce six fight profiles |
| Quests | 50-quest main chain across 9 chapters + 32 side quests across 10 maps |
| Gear | 11 slots, per-class armour lines, +0…+11 forging, socketing, Chaos Machine, 3 wing tiers |
| Story | Seven Ancient Runes, one per region — the Nhát Gọi canon ([`docs/LORE_RUNE.md`](docs/LORE_RUNE.md)) |
| Tests | 197 Playwright regressions against real Chromium + 7 vitest units, all gated in CI |

## Why it is an Axie game and not a reskin

The lore does load-bearing work rather than sitting in flavour text. Runes are the Bug axies' craft —
carving a law into stone that holds in one place. Seven of them hold Lunacia together, and they are
wearing thin. So Sylas carves a Rune into the *sky* to call for a smith who can make something more
durable than stone, and what comes through the cut is a whole quarter of Vaeldra: paving, forge, and
seven soldiers.

That single premise pays for three things the genre normally leaves unexplained:

- **why a Dark Knight is standing in Lunacia** — Lunacia called you; you are not a conqueror
- **why the hub is a western stone town with a forge** — the forge *is* what Lunacia asked for
- **why you lost your memory but not your craft** — the Rune is paid in what it moves, and craft
  cuts deeper than memory, so it comes back as you level

And the central bargain is a real cost, not a twist: pulling a Rune to the forge makes it last
another thousand years, but while it sits in the fire, the law it held is simply *off*.

## How it's built

One file, no framework, no build step: `public/game/game.js` is the entire engine — `update()`,
`render()`, `calcDerived()`, and `hurtMob()` as the single damage-application point in the game.
Data lives in `public/game/data/canbang.js`. Edit, reload, done.

The part worth reviewing is the discipline around it:

- **CI gates every push to `main`** — typecheck, lint, unit tests, and a syntax check of the engine
  ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).
- **197 Playwright regressions** drive the real game in a real browser — they call `startGame()`,
  `castSkill()`, `turnInQuest()` and tick `update()`, rather than asserting against fixtures.
  `bash tools/reg.sh <outdir>`.
- **Design decisions are measured, then written down with the measurement.** Level pacing was fitted
  to XP-per-hour sampled from actual play. Map quality has a machine-generated status table
  ([`docs/BANG_MAP.md`](docs/BANG_MAP.md)) and a ratchet test that only lets it improve.
- **[`CLAUDE.md`](CLAUDE.md)** is the working spec and the post-mortem log: every trap already
  stepped in, with the number that exposed it. It is long because the mistakes were expensive.

## Repo map

| Path | |
|---|---|
| `public/game/` | the game — engine, data, assets. Self-contained, no build |
| `tests/` | 197 Playwright regressions |
| `tools/` | asset bakers (Spine → sprite sheets, isometric tiles), measurement scripts, `reg.sh` |
| `docs/` | decision journal. **Historical by design** — entries are not rewritten when things change, so read dates and cross-check against code. Current canon is `CLAUDE.md` + `docs/LORE_RUNE.md` |
| `src/`, `api/`, `db/` | the Vite + Hono + tRPC + MySQL shell around the game (auth, cloud save). Not needed to play |

Full dev workflow, if you want the shell too:

```bash
npm install
cp .env.example .env
npm run dev      # single Vite process, /api/* proxied in-process to Hono
npm run check    # tsc -b
npm test         # vitest
bash tools/reg.sh /tmp/reg-x    # full Playwright regression, ~30 min
```

## Two things to know before reading the code

**Identifiers are Vietnamese, and some are older than the game.** This is a Vietnamese-language game,
so functions and data keys are Vietnamese (`hurtMob` sits next to `veAvatar`, `banRaiVung`,
`viaHomNay`). Separately, the engine was migrated from a shipped wuxia RPG, and a few names from
before that migration were kept on purpose: class and NPC keys (`thieulam`, `baidasan`, `quachtinh`)
because save files are keyed on them, and the server path `/var/www/axiewuxia` because the deploy
cron runs out of it. None of them ever reaches player-visible text. The migration itself is
finished — the wuxia setting, vocabulary and systems are gone.

**The licence is deliberately not open source.** See [`LICENSE`](LICENSE) — it is source-available,
all rights reserved, and the file explains why: some Builder's Program source material carries
"do not distribute" terms, and vendored third-party assets (fonts, audio, Spine packages) arrive
under their own licences. A blanket MIT grant would misstate rights that are not the author's to
grant. For permission to use any part of this, contact the repository owner.
