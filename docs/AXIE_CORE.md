# Axie Core — the class triangle

> **Audience:** Vibeathon judges and anyone reviewing how this game connects to Axie Core.
> Written in English because the event guide is; the rest of `docs/` is the Vietnamese working
> journal. Numbers here are measured from the running game, not estimated — the scripts that
> produce them are named at each claim so you can re-run them.

## 1. The problem, stated honestly

The rules ask that Axie Core "affect the experience rather than appear only as a cosmetic skin."

Measured against that, the first version of this game failed. The Axie is the body you see on
screen; all stats, skills and gear live on the five character classes. So we drove all 16 Axies
through `calcDerived()` at level 60 and diffed the resulting stats:

```
Axies that changed any stat : 0 of 16
Turning the avatar off      : 0 change
```

The Axie was, literally, a skin.

That was not an accident. Power coming from the Axie side had been deliberately removed three
separate times, because each version was a *ladder* — own the better Axie, hit harder. Putting
stats back would rebuild exactly what had been torn out.

So the design question was sharper than "make the Axie matter": **make the Axie matter without
making it a power ladder.**

## 2. The design

The answer is a *relationship*, not a number. Your Axie decides **what you are strong and weak
against** — never how strong you are.

| direction | class comes from | multiplier |
|---|---|---|
| you → monster | **your weapon's Rune** | ×1.20 favourable / ×0.88 unfavourable |
| monster → you | **your Axie** | ×1.12 unfavourable / ×0.90 favourable |

Both multipliers already existed and are unchanged. Swapping Axies changes *which branch gets
taken*, never a stat. Every Axie still grants exactly zero attack, health, defence, crit or speed
— guarded by a test that walks all 16 and requires a zero diff.

The asymmetry is deliberate and predates this work: your weapon can never make you *take* more
damage, so hunting for a better weapon is never punished.

### The triangle is Axie Infinity's own

Nine classes in three groups, each group beating the next:

```
  ① Beast · Bug · Mech   ▶   ② Plant · Reptile · Dusk   ▶   ③ Aquatic · Bird · Dawn   ▶   ①
```

This replaces a five-element wheel (Steel · Verdant · Stone · Frost · Ember) that was inherited
from the engine's previous life as a wuxia RPG. That wheel worked, but nothing about it said
*Axie* — it was generic fantasy. The triangle is the real thing, and a player who knows Axie
reads it instantly.

## 3. Why this is Axie Core and not a reskin

The strongest argument is that the game's content **already described this system** and the data
simply never matched.

**The regions are already named after Axie tribes.** Seven of eleven, one per class:

| region | Axie class |
|---|---|
| Beast Herd Camp | Beast |
| Plant Tribe Glade | Plant |
| Bug Tribe Tunnels | Bug |
| Bird Tribe Heights | Bird |
| Reptile Sunstone Flats | Reptile |
| Aquatic Tribe Causeway | Aquatic |
| Dusk Marsh | Dusk |

Under the old five-element wheel, Beast Herd Camp was "Frost" and Bird Tribe Heights was "Stone".
The names and the mechanics were saying different things.

**The monsters are already Axies.** Not renamed generic fantasy mobs — their names state a class:
*Axie Heo Rừng* (boar), *Axie Bí Ngô* (pumpkin), *Axie Cỏ Dại* (weed), *Axie Golem*,
*Chimera Cầu Gai* (sea urchin), *Chimera Rêu Nước* (water moss), *Dơi Chimera* (bat). Their art is
baked from the official `axie-origins-asset-kit` Spine rigs.

**The lore already does load-bearing work.** Runes are the Bug axies' craft — carving a law into
stone that holds in one place. Seven Ancient Runes hold Lunacia together and are wearing thin;
Sylas carves a Rune into the *sky* to call for a smith who can make something more durable, and a
quarter of Vaeldra comes through the cut. That premise is what explains why a Dark Knight is
standing in Lunacia at all. Full canon: [`LORE_RUNE.md`](LORE_RUNE.md).

### Weapons carry a Rune, and that is the lore becoming mechanical

Every weapon in the game already carries an element — measured: 400 of 400 generated weapons have
one, and no other equipment slot does. Under the triangle, a weapon carries a **Rune of a class**
rather than a material element.

This is not a workaround for a naming problem. The game's own canon says *"Vaeldra carves Runes
into steel — every forging is a carving."* Stone holds a law in a place; steel carries one in your
hand. A weapon bearing a Beast Rune is that sentence made playable, and it ties the combat system
to the story's spine instead of running beside it.

## 4. What this creates

A reason to own more than one Axie — which the contract gacha sells and which, before this, had no
gameplay answer. You pick the body that suits the region you are about to farm, and the Map panel
tells you what lives there and which three classes counter it:

> ◆ Land of **Ashen Scout** 35% · class **▲ Reptile** 100% · bring **Beast · Bug · Mech**

That line is derived from the spawn data at read time, never hand-written, so it cannot drift away
from what actually spawns.

Crucially it is a *lateral* reason. A second Axie does not make you stronger; it makes you
better-suited. That distinction is the whole design.

## 5. Status

| stage | what | state |
|---|---|---|
| 1 | Axie class decides your defensive class | **shipped** |
| 2 | Five-element wheel → nine-class Axie triangle | **shipped** |
| 3 | Each region carries its tribe's class | **shipped** |
| 3b | The defensive verdict is actually visible while you play | **shipped** |
| 4 | Six body parts — the Axie's own anatomy — decide how sharp the matchup is | **shipped** |
| 5 | Axie picker previews the matchup for where you are headed | planned |

### Stage 4 — the second axis, and the invariant that proves it sells nothing

Stages 1-3 gave the Axie one axis: its class decides which regions are kind to it. One axis is
a thin reading of "the Axie affects the game", and it left the most Axie-specific thing on the
table: **an Axie is six body parts**, each with its own class. The game read none of them.

Every one of the 16 Axies now declares all six — Eyes, Ears, Horn, Mouth, Back, Tail — and the
data is derived from the description each Axie already carried, not invented beside it.
`coghound` ("someone rebuilt it from wreckage") has **zero** parts of its own class; `inkmane`
("the black stripes on its back move when you look away") has exactly one, and it is the back.

Count how many parts share the Axie's own triangle group and you get its **purity**, 0 to 6.
Purity sets how *sharp* the matchup is, never how strong:

| | |
|---|---|
| 6/6 — **pure** | a specialist: takes much less where it is favoured, much more where it is not |
| 0/6 — **mixed** | a generalist: never bad, never excellent |

#### The invariant

This is the part that matters, and it holds **by construction, not by tuning**. The three
multipliers are interpolated toward their own mean:

```
mul(sharpness) = MEAN + (base_mul − MEAN) × sharpness
```

so the sum of the three branches does not move with sharpness — the derivative is exactly zero.
Across a uniform distribution of all nine mob classes (three per group, three branches, equal
weight) **every one of the 16 Axies has the same expected defensive multiplier**. Measured
spread across all 16: `2.2e-16` — floating-point noise, not a tolerance.

Changing your Axie changes the **shape** of your risk. It cannot change the total.

The obvious simplification — `mul = 1 + (base − 1) × sharpness` — quietly breaks this, because
the two deviations are not symmetric about 1 (+0.12 against −0.10). Under it, purer Axies take
0.67% more damage on average per unit of sharpness. That is still a ladder, just one that
points down. Reverse-testing that exact change turns the invariant assertion red.

#### And it still has to do something

An invariant alone is satisfied by a mechanic that does nothing at all, so the same test
measures the other direction — against each region's **real mob population**, not a uniform
nine:

| | spread between kindest and harshest region |
|---|--:|
| `ironshell`, `hexmite` — pure 6/6 | **39.0%** |
| pure group (≥5/6), mean | 36.3% |
| mixed group (≤2/6), mean | 16.5% |
| `coghound` — mixed 0/6 | **10.3%** |

A third assertion drives real hits through the game loop in both directions, because the place
this usually breaks is not the function but the wire into the damage path: removing the
sharpness argument from the hit path leaves the second assertion green and turns the third red.

The full 16 × 6 table, with each Axie's purity and sharpness, is in
[`BANG_BOPHAN.md`](BANG_BOPHAN.md) — generated by `node tools/bang_bophan.cjs` from the game data
rather than transcribed, so it cannot drift away from what the game actually runs.

Purity deliberately does not track rarity — one of the two purest Axies is a 4★. If every 5★
were purer, players would correctly read "5★ is stronger", which is the one thing this gacha
must not sell.

### Stage 3b — the mechanic was running and almost nobody could see it

Stages 1-3 made the Axie matter. Measuring what a player could *perceive* of it turned up the
gap that mattered most, and it had been there the whole time.

The defensive direction — the one the Axie controls — had exactly **one** output: a line in the
combat log, a 260px box in the bottom-left corner that scrolls past during a fight. And that line
only printed on the *unfavourable* branch, because the flag driving it was never set on the ×0.90
path. So the favourable half of the mechanic — the half that answers *"why own more than one
Axie"* — had **never once appeared on screen** in any build.

For contrast, the attack direction (which the weapon controls, not the Axie) had a floating label
over the target with four distinct prefixes.

Three channels now, deliberately answering different questions:

| channel | answers | fires |
|---|---|---|
| floating label over your character | *what is happening right now* | on each hit taken, both directions, throttled to one every 2.6s |
| a clause on the region banner | *which Axie should I bring here* | on entering a region |
| the Map panel line | *where is each Axie good* | any time, for every region |

The banner cannot replace the label — swap Axie mid-region and the banner is a stale sentence.
The label cannot replace the banner — it can never tell you what to bring *before* you go.

One gate, `heThuKet()`, produces the verdict **and** the two multipliers, so the damage formula
and every place that describes it read the same source and cannot drift apart.

The Map panel already names each region's class and the three classes that counter it — so the
literacy half of stage 4 is in. What is still missing is the preview *on the Axie itself*.

### Why stages 2 and 3 had to ship together — measured, not argued

Stage 1 shipped first and looked convincing: against a single hand-picked monster, swapping
between the best and worst Axie changed incoming damage by 32.4%.

**That number was not representative, and finding out why is the interesting part.** Averaged
over the *real monster mix of each region*, the spread between best and worst Axie was only
**7.9%**, because no region was elementally coherent — every map mixed three to five elements,
so advantages and disadvantages cancelled. One element was optimal in **7 of 11 regions**.

The root cause was structural: **monster species are reused across regions.** One wraith species
appears in four maps, one golem species in four, one fallen-Axie species in four. So long as the
class lived on the *species*, Bug Tribe Tunnels and Plant Tribe Glade were forced to share a
class, and choosing an Axie for where you were going could not mean anything.

The fix mirrors an architecture the engine already had for combat roles: species class is the
base layer, and the **region's population zone overrides it**. We verified it by taking stage 3
back out and re-measuring:

| | triangle only | triangle + region identity |
|---|---|---|
| best-vs-worst spread inside a region | 2.1% – 13.6% | **24.4%, in all 10 combat regions** |
| dominant class share of the population | 34% – 48% | **65% – 100%** |
| regions where one Axie group is optimal | **6 of 11** | **4 of 11** — the mathematical floor |

Guarded by `tests/test_tamgiac.js`, which drives the real spawner and fails if any of those
numbers regresses. Removing the region override turns 4 of its 8 assertions red.

## 6. Acceptance criteria

Measured before and after, not judged by feel.

**Stage 2 — the triangle** — all met
- every monster and boss resolves to a valid Axie class — 48 species + every boss ✓
- each class is favourable against exactly 3 of 9 and unfavourable against 3 of 9 ✓
- the damage formula is unchanged — measured back as ×1.20 and ×0.88 exactly ✓
- levelling pace unchanged — but the evidence here is analytical, not measured, and we say so:
  a uniformly-rolled weapon now hits a favourable matchup 33% of the time instead of 20%, which
  moves the average damage multiplier from 1.016 to 1.0267, i.e. **+1.05%**. The mob distribution
  does not affect that figure: against any given monster the chance a random weapon counters it
  is always 3/9. `XP_TABLE` was not retuned.

  > We could not confirm this by running `tools/do_nhipcap.cjs`, because that tool currently
  > returns zero XP/hour at levels 60 and above. We checked whether our change caused it by
  > re-running the tool against a worktree of the commit immediately *before* this work: it
  > produces the identical zeros. So the tool has a pre-existing blind spot above level 60, and
  > the level-60+ pacing numbers elsewhere in this repo cannot presently be reproduced. We would
  > rather say that than quote a measurement we did not take.

**Stage 3 — region identity** — all met
- best-vs-worst spread within a region ≥ **15%** — 24.4% in all 10 combat regions ✓
- each region's dominant class is ≥ **50%** of its monster population — 65% to 100% ✓
- no Axie group is optimal in more than **4 of 11** regions ✓

> The last criterion originally read "no class optimal in more than 3 of 11". That threshold was
> written while the wheel still had five sides and turned out to be **unreachable**: the triangle
> has three groups, so across 11 regions the largest group is at least ⌈11/3⌉ = 4. We corrected
> the criterion rather than quietly passing a weaker test, and the reasoning is recorded next to
> the assertion.

**One region is deliberately exempt.** Corran Trail is a path between places, not a place — no
Rune is set in a trail — so it is the one region with no dominant class, and at 11.7% it is the
flattest in the game. That is the point: it is the only ground where no Axie suits you better
than another.

## 7. Longer-term product vision

The triangle is the first of three layers that make an Axie identity mean something without
selling power.

**Near term — matchup literacy.** The Map panel names each region's class and what counters it;
the Axie picker previews how each body performs where you are headed. The goal is that a player
learns the triangle by playing, never by reading.

**Mid term — parts, not just class.** An Axie is six body parts, each with its own class. Today
only the Axie's overall class is read. Reading parts would let two Beast Axies differ from each
other — again laterally: a resistance profile, not a stat line.

**Long term — the Rune economy.** Weapons carry class Runes today as a rolled property. The canon
supports making Runes a thing you *carve*: transfer a Rune between weapons, or inscribe one you
recovered from a region's Ancient Rune. That turns the story's central object into the item
economy's central verb, and it stays lateral — a Rune changes what a weapon is good against, never
how much damage it does.

The line that does not get crossed: **the Axie never grants a stat.** Every expansion above is a
matchup, a profile, or a choice. The moment an Axie grants +damage, this becomes a game where the
best Axie wins, and three earlier versions of this codebase were dismantled for exactly that.

---

## Appendix A — region to class

As shipped, with the measured share of each region's monster population.

| region | class | share | note |
|---|---|---|---|
| Beast Herd Camp | Beast | 89% | from name |
| Werebear Woods | Beast | 84% | werebears |
| Plant Tribe Glade | Plant | 71% | from name |
| Bug Tribe Tunnels | Bug | 66% | from name |
| Bird Tribe Heights | Bird | 65% | from name |
| Reptile Sunstone Flats | Reptile | 100% | from name |
| Aquatic Tribe Causeway | Aquatic | 70% | from name |
| Dusk Marsh | Dusk | 100% | from name |
| Rẻo Rừng Corran | Dawn | 73% | roots of the Tree of Souls — the starter region |
| Trũng Nứt Corran | Mech | 68% | the ground directly under the sky-cut |
| Lối Mòn Corran | mixed | — | a path between places, deliberately not a place |

The two 100% regions are the last two zones in the game, and being pure is correct for them: by
then the player is expected to read a region at a glance. The rest keep a minority class from the
same triangle group, so the bestiary shows several Axie classes without muddying the matchup.

## Appendix B — scope

| | |
|---|---|
| class labels remapped | **94** — 54 in `game.js` (monsters, world bosses, elite affixes), 40 in `data/canbang.js` (zone bosses and generals) |
| population zones given a region class | 31, across 10 regions |
| new systems added | none — the multipliers, the weapon element slot and the forge re-roll recipe all already existed |
| favourable-matchup frequency | 20% → 33% (5-wheel → 3×3 triangle) ⇒ +1.05% average damage |
| tests | `test_tamgiac.js` added (8 assertions); `test_elem.js`, `test_hethu.js` rewritten |
