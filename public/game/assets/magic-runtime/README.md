# Magic modular runtime v1

This folder is the canonical runtime pack for the Magic character prototype.

## Runtime contract

- Atlas cell: `256×256`.
- Every animation atlas: `8 columns × 8 rows` (`2048×2048`).
- Columns: frames `0..7`.
- Rows: `south`, `southwest`, `west`, `northwest`, `north`, `northeast`, `east`, `southeast`.
- Shared foot pivot: `(128, 244)`.
- States: Idle `5 FPS`, Walk `7 FPS`, Run `11 FPS`, Attack `10 FPS`.
- Movement speed is independent from animation FPS: Walk `72 px/s`, Run `136 px/s` in the demo.

## Swappable layers

Render in this order:

1. weapon with socket `z: back`
2. `body_base/<state>` when naked, or one selected `armor/<set>/<state>` appearance
3. weapon with socket `z: front`
4. a small palm patch from the selected appearance (the handle looks enclosed by the hand)
5. optional skill VFX

Armor never contains weapon pixels. Each weapon exists once in `weapons/*-master.png` and both hands reuse it through `sockets.json`. Therefore any of the seven armor appearances can use any of the seven weapons without a new combined sheet.

`armorMode` is currently `appearance-replacement`: armor sets can be swapped as complete looks. It does not claim per-piece chest/gloves/pants/boots mixing yet; that requires separately authored occlusion masks for every state.

## Included equipment

Armor T1–T7: Vải thô, Trâu xanh, Đồ đồng, Ma Thuật, Phong Vũ, Lôi Phong, Cuồng Phong.

Weapons T1–T7: Song đao cơ bản, Song chùy, Song hỏa đao, Song kiếm điện, Lôi phong đao, Ảo ảnh đao, Hỏa tinh kiếm.

All paths, display sizes, labels, FPS values and the row order are authoritative in `manifest.json`. Do not hard-code an armor/weapon pair in game logic.

## True flight preview

`flight/flight-manifest.json` defines the approved south-facing true-flight preview:

- 8 frames at `175 ms/frame` for a deliberately slow wing beat.
- Two interchangeable back layers: Wing 1 DW and the project-specific Wing 1 MG variant.
- Wing hinge at the upper shoulder line; the wing span stays larger than the body and does not trail below the hips.
- The Ma Thuật body, dual Ảo Ảnh Đao, palm-cover layer and both wing types remain separate PNG sheets.
- Render order: `wing_back -> body_armor -> weapon_left_right -> hand_grip_front -> skill_vfx`.

This is a `south` review slice, not a claimed eight-direction flight atlas. Ground movement with wings continues to use the regular Idle/Walk/Run atlases; true flight uses this separate pose family.

### Airborne Fire Slash v2

`flight_attack/flight-attack-manifest.json` replaces the old front-facing attack assumption with a southeast isometric combat pose based on classic MU attack staging:

- the torso pitches forward and rotates toward the target;
- one shoulder leads while the opposite arm counterbalances;
- the legs stay asymmetrically bent instead of hanging straight down;
- Wing 1 DW and Wing 1 MG counter-tilt behind the upper shoulders;
- body, each wing option, dual weapon, palm-grip cover and Fire Slash VFX are independent sheets;
- connected components are isolated before cell normalization, preventing hands, blades, wings or VFX from being cut at atlas boundaries.
- the weapon is rebuilt from one canonical item texture with an authored grip pivot `(128,45)`; each frame places that pivot on the palm socket before applying wrist rotation. This replaces the earlier generated weapon sheet whose hilts only approximated the hands.

The review slice is 8 frames, southeast-facing, `105 ms/frame`, and is intended as the approved pose/timing reference before authoring the remaining directions.

## Demo

Run the project dev server and open `/game/proto_magic_mix.html`. The page supports explicit armor/weapon selection, random mix, 8-direction buttons, WASD/arrows, Shift-to-run, Attack, socket visualization, and safe-zone back carry.

Do not open the HTML directly with `file://`; browsers block the JSON and texture fetches in that mode.
