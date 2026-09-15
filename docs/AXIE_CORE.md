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

| direction | element comes from | multiplier |
|---|---|---|
| you → monster | **your weapon** | ×1.20 favourable / ×0.88 unfavourable |
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
already tells you what lives there.

Crucially it is a *lateral* reason. A second Axie does not make you stronger; it makes you
better-suited. That distinction is the whole design.

## 5. Status — shipped, in progress, planned

Honest state at time of writing.

| stage | what | state |
|---|---|---|
| 1 | Axie class decides your defensive element | **shipped** |
| 2 | Five-element wheel → nine-class Axie triangle | in progress |
| 3 | Each region's monsters share its tribe's class | in progress |
| 4 | Map panel and Axie picker show the matchup | planned |

Stage 1 is live and measurable: against a single Ember monster, swapping between the best and
worst Axie changes incoming damage by 32.4%.

**But that number is not representative, and stage 1 alone is not enough.** Averaged over the real
monster mix of each region, the spread between best and worst Axie is only **7.9%**, because no
region is elementally coherent — every map mixes three to five elements, so advantages and
disadvantages cancel. Worse, one element is optimal in **7 of 11 regions**, which means the choice
has a single right answer most of the time.

That is precisely what stage 3 fixes, and it is why stages 2 and 3 ship together: giving each
region its tribe's class makes the regions coherent, which is what makes the choice real.

## 6. Acceptance criteria

Measured before and after, not judged by feel.

**Stage 2 — the triangle**
- every monster and boss resolves to a valid Axie class
- each class is favourable against exactly 3 of 9 and unfavourable against 3 of 9
- the damage formula is unchanged — same multipliers, same call sites
- levelling pace still reaches level 60 in ~3 hours (`tools/do_nhipcap.cjs`)
- the full 207-test regression stays green

**Stage 3 — region identity**
- no class is optimal in more than **3 of 11** regions (currently 7)
- best-vs-worst spread within a region ≥ **15%** (currently 7.9% average)
- each region's dominant class is ≥ **50%** of its monster population, so the Map panel's
  "dominant class" line is telling the truth

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

| region | class | note |
|---|---|---|
| Beast Herd Camp | Beast | from name |
| Werebear Woods | Beast | werebears |
| Plant Tribe Glade | Plant | from name |
| Bug Tribe Tunnels | Bug | from name |
| Bird Tribe Heights | Bird | from name |
| Reptile Sunstone Flats | Reptile | from name |
| Aquatic Tribe Causeway | Aquatic | from name |
| Dusk Marsh | Dusk | from name |
| Rẻo Rừng Corran | Dawn | roots of the Tree of Souls — the starter region |
| Trũng Nứt Corran | Mech | the ground directly under the sky-cut |
| Lối Mòn Corran | mixed | a path between places, deliberately not a place |

## Appendix B — scope

| | |
|---|---|
| element labels to remap | **111** — 71 in `game.js` (monsters, bosses, elite affixes), 40 in `data/canbang.js` (zone bosses) |
| call sites reading the element table | 22 |
| test files touching elements | 10, of which 3 directly |
| new systems added | none — the multipliers, the weapon element and the forge re-roll recipe all already exist |
| favourable-matchup frequency | 20% → 33% (5-wheel → 3×3 triangle), which is why levelling pace is re-measured rather than assumed |
