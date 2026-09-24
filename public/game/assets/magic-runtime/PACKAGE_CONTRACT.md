# Spellblade production package contract

All gameplay packages use one canonical character identity and one shared
`256×256`, 8-direction, 8-frame grid. Equipment is selected at runtime; it is
never baked permanently into the canonical body.

## Package 1 — Town / safe zone

Purpose: grounded movement inside towns and safe zones while wings remain
equipped.

Required states:

- `idle`
- `walk`
- `run`

Required swappable layers:

1. `wing_far`
2. `weapon_back` — dual weapons crossed on the back
3. `body_base`
4. one of seven armor appearances
5. `wing_clasp`

Armor families: Vải thô, Trâu xanh, Đồ đồng, Ma Thuật, Phong Vũ, Lôi Phong,
Cuồng Phong.

Each state must support all eight directions in this order:
`south, southwest, west, northwest, north, northeast, east, southeast`.

## Package 2 — Field flight / airborne combat

Purpose: movement and combat outside safe zones.

Required locomotion states:

- `flyIdle` — upright hover
- `flyMove` — 10–15 degree forward travel lean
- `flyHit`
- `flyDeath`

Required airborne attacks:

- `flyAttackFireSlash` — fire blade arc
- `flyAttackLightSlash` — light blade arc
- `flyAttackDash` — forward burst toward the target

Required swappable layers:

1. `wing_far`
2. `weapon_far`
3. `body_base`
4. one of seven armor appearances
5. `wing_clasp`
6. `weapon_near`
7. `hand_grip`
8. `skill_vfx`

Every locomotion and attack state is authored for eight directions. VFX timing,
damage timing and movement timing are declared separately in the manifest.

## Identity lock

The canonical Magic identity is the approved `armor/ma_thuat/*` production
skeleton: slim male body, silver hair, covered lower face, fixed shoulder width
and fixed body proportions. Generated pose studies are not production identity
sources. New armor, wing, weapon and VFX layers must align to this skeleton.

## Delivery rule

Package 1 and Package 2 each ship with:

- separate PNG atlases for every runtime layer;
- one authoritative JSON manifest;
- socket timelines and per-direction depth values;
- contact sheets and animated review GIFs;
- automated checks for cell size, empty cells, edge bleed and palm/socket overlap.
