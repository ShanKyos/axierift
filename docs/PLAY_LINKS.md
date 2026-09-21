# Axie Rift — play links for judges

> Every link is a **static page: open it and it runs.** No install, no sign-up, no build step.
> The server pulls from `main` every 2 minutes, so a link is always the latest build.
> Desktop browser, mouse + keyboard. Right-click to walk, `Space` to attack.

---

## 1 · Main link — start here

### **http://14.225.204.107/**

You start at **level 120 with everything unlocked**, so every system is reachable in the first
thirty seconds instead of after a 3-hour grind.

What you get on arrival:

| | |
|---|---|
| Level | **120** (the cap) |
| Gear | full top-rarity set, tier 10, **+11 Perfect** |
| Wings | tier 3 for your class |
| Axie bodies | **16 / 16** — every one is equippable |
| Currencies | ~2,000,000 Lumen · 999 Shard · 999,999 Instinct |
| Consumables | 99 of each gem · 70 Kundun Boxes |
| Skills | every skill at level 120 |
| Progression gates | **all open** — Mastery tree, the last five zones, the Rift Gate |

**Why it works this way:** this is a demo build. The trade-off is stated plainly — you cannot
feel the *pacing* here (the 3-hour climb to 60, mechanics unlocking chapter by chapter).
Use link 3 if you want to see that.

---

## 2 · English UI

### **http://14.225.204.107/?lang=en**

Same as link 1, with the interface in English.

⚠ The choice is **remembered in your browser.** To go back: `?lang=vi`.

The translation is **complete** — measured, not claimed. `tests/test_dichen.js` drives a bot
that plays for real (mouse and keyboard, no internal calls to skip ahead) and then sweeps the
canvas, the DOM and every panel:

| surface | Vietnamese strings left |
|---|--:|
| canvas during play | **0** / 74 sampled |
| all 15 panels (DOM) | **0** |
| whole document (HUD) | **0** |
| narrative layer — quests, side quests, skill text, NPC names, class text, intro, 266 item names | **0** |

That test is a ratchet: the number is held at 0 and can only be lowered, never raised.

---

## 3 · The real progression

### **http://14.225.204.107/?thuong=1**

The game as a new player actually meets it: **level 1**, starter gear, the tutorial, the quest
chain from step one, zones locked until you earn them.

Use this if you want to judge **onboarding and pacing** rather than breadth of systems.

---

## 4 · Multiplayer

### **http://14.225.204.107/?net=1**

⚠ **You need two browsers at the same time.** One normal window + one incognito window works;
two different browsers works; one window alone will show an empty world and tell you nothing.
(Two incognito windows do **not** work — Chrome shares one session between them.)

What you can check once both are in:

- both players **see each other move**, with name and health bar, layered correctly by depth;
- **equipment and wings are synced** — what they wear is what you see;
- **attack and cast animations** are synced, so you see them fight;
- **chat**, two channels: World and Zone;
- walk into **Ardhaven Arena** and **fight each other** — the Arena portal sits in town, press
  `M` and it is marked on the map.

The server is a relay with **zero dependencies** (~700 lines across two files, `node` and
nothing else) — no database, no accounts, no anti-cheat. That is deliberate, and exactly where
it stops is written down in `docs/THIET_KE_ONLINE.md`.

---

## 5 · Debug console

### **http://14.225.204.107/?test=1**

Adds a cheat console: press `` ` `` (the key below Esc), type `/help` for the command list.
Free travel to any zone, and starter gear is handed out so the character is never naked.

This is for poking at the build, not for judging it — link 1 is the one to judge.

---

## 6 · Jump straight into one class

### **http://14.225.204.107/?sect=baidasan**

Skips the class-select screen.

| key | class | plays like |
|---|---|---|
| `thieulam` | **Dark Knight** | melee, tanky, combo chains |
| `toanchan` | **Sylvan Ranger** | ranged, area damage |
| `baidasan` | **Dark Wizard** | ranged caster, highest burst |
| `minhgiao` | **Spellblade** | melee hybrid, asymmetric silhouette |
| `bug` | **Dark Lord** | ranged, summons, command aura |

Parameters combine: `?lang=en&sect=baidasan`

---

## The three things most worth looking at (~5 minutes)

**1 · The Axie is a relationship, not a stat stick.**
Press `C` and read the *Axie Build* line, then open **Contract** and equip a different body,
then travel to a different zone. Measured: swapping across all 16 bodies changes **0 stat
points**. What it changes is the **shape of your risk** — damage taken between your best and
worst zone differs by **39.0%** on a pure-typed body and **10.3%** on a mixed one. A pure body
is a specialist; a mixed body is never bad and never excellent.

**2 · The Contract opening.**
Open **Contract**, press **Summon**. A 10.7-second cinematic with audio, then a Genshin/Honkai
style key-art banner built from live data — the armour set name comes from the gear tables, the
skill art from the skill atlas, so the banner cannot lie about what it is selling.

**3 · Two players in one world.**
`?net=1` in two browsers, as described in link 4.

---

## Controls

| key | what |
|---|---|
| Right-click | walk to where you clicked (works on the minimap too) |
| `Space` | basic attack |
| `1 2 3 4` | the four skill slots |
| `Z` | toggle auto-fight |
| `J` | pick up loot · open a Warded Chest · mine a Bone Seam · gather herbs |
| `E` | talk to whoever is nearby |
| `C` `V` `B` `K` `M` `Q` | Character · Equipment · Bag · Skills · World Map · Quest Log |
| `F6` | system menu · `Esc` close |

---

## Read alongside

| | |
|---|---|
| `docs/CHAM_VIBEATHON.md` | our own scoring against the criteria, with measurements |
| `docs/CHUA_HOAN_THIEN.md` | **what is NOT finished** — read it with the scoring, not instead of it |
| `docs/THIET_KE_ONLINE.md` | the online design and where it deliberately stops |
