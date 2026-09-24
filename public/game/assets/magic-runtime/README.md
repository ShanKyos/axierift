# Magic modular runtime v1

> **Storage: plain WebP in git — never PNG, never Git LFS.** Production is a VPS that runs
> `git reset --hard` every 2 minutes without `git-lfs`, so an LFS file ships as a 130-byte text
> pointer and the art silently disappears. The build scripts in `scripts/` export PNG; after every
> bake run `python3 tools/magic/sang_webp.py` (per file it keeps the smaller of lossless and
> q90 + lossless alpha, re-decodes to verify alpha is bit-identical, and rewrites every `.png`
> path in the manifests). `tests/test_khonglfs.js` fails on any LFS pointer, any PNG left in this
> folder, or any manifest path that points at a missing file. Bake experiments outside the repo:
> every re-committed atlas is a full new copy in git history forever.

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

Armor never contains weapon pixels. Each weapon exists once in `weapons/*-master.webp` and both hands reuse it through `sockets.json`. Therefore any of the seven armor appearances can use any of the seven weapons without a new combined sheet.

The production packages use `armorMode: piece_layers`. Each armor state is
split into `head`, `chest`, `gloves`, `pants`, and `boots` atlases. Magic has no
helmet, so `head` is intentionally transparent; `chest` owns the face mask and
shoulders. Equipment can be selected independently at runtime.

## Included equipment

Armor T1–T7: Vải thô, Trâu xanh, Đồ đồng, Ma Thuật, Phong Vũ, Lôi Phong, Cuồng Phong.

Weapons T1–T7: Song đao cơ bản, Song chùy, Song hỏa đao, Song kiếm điện, Lôi phong đao, Ảo ảnh đao, Hỏa tinh kiếm.

All paths, display sizes, labels, FPS values and the row order are authoritative in `manifest.json`. Do not hard-code an armor/weapon pair in game logic.

## True flight preview

`flight/flight-manifest.json` defines the approved south-facing true-flight preview:

- 8 frames at `175 ms/frame` for a deliberately slow wing beat.
- Two interchangeable back layers: Wing 1 DW and the project-specific Wing 1 MG variant.
- Wing hinge at the upper shoulder line; the wing span stays larger than the body and does not trail below the hips.
- The Ma Thuật body, dual Ảo Ảnh Đao, palm-cover layer and both wing types remain separate WebP sheets.
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

## Winged eight-direction pack v3

`flight_8dir/manifest.json` is the production-ready extension of the approved flight slice. It contains 8 directions × 8 frames for:

- `safeWalk`: the wing remains equipped in town and the dual blades are crossed on two back-harness sockets;
- `fly`: upright airborne idle with a slow wing beat and one blade fixed to each palm;
- `flyMove`: directional travel with a controlled 10–15 degree forward lean, trailing legs and coat tails;
- `flyAttack`: an eight-frame airborne dual-blade arc for every direction.

The body, wing, held weapon, back weapon and front hand-grip cover remain independent sheets. Wings are redrawn—not horizontally compressed—for front, profile, rear-three-quarter and full-rear views. `wing_far` and `wing_near` change the occlusion order as the character turns, exposing the rear membrane, central spine and shoulder attachment in the north-facing rows.

### Canonical Magic identity

`armor/ma_thuat/*` is the single approved character identity: slim build, silver hair, covered lower face, fixed shoulder width and the green-black/gold Ma Thuật silhouette. Combat sheets must use this production skeleton directly. Image-generated bodies may be used only as pose studies and must not replace the canonical face, hair, proportions or armor silhouette.

Held equipment follows the same depth rule through `weapon_far` and `weapon_near`: both blades are camera-near in front views, both pass behind the torso in the full-rear view, and profile/three-quarter views place one blade on each side of the body. A weapon is transformed around its authored hilt pivot, placed on the per-frame palm socket, then covered by the palm patch only when camera-near. This makes the hand visibly enclose the handle while preserving equipment swapping. All atlases have a transparent gutter and must report no occupied edge pixels before release.

## Production packages

- `town_v1/manifest.json`: safe-zone Idle, Walk and Run with wings equipped,
  crossed-back weapons and five swappable armor slots.
- `field_v2/manifest.json`: Fly Idle, Fly Move, Hit, Death, Fire Slash, Light
  Slash and Dash. Every state has eight directions and eight frames.

For Package 2, use `field_v2/weapon-sockets.json` rather than baking a weapon
into the body. Select one of the seven masters and one of the +0/+9/+10/+11
material variants declared by the manifest. Render `weapon_far` before the
character and `weapon_near` after the wing clasp; render `hand_grip` afterward
so the palm visibly closes around the handle. Damage, VFX and dash movement
frames are declared under `timing` and should not be inferred from FPS.

## Demo

Run the project dev server and open `/game/proto_magic_mix.html`. The page supports explicit armor/weapon selection, random mix, 8-direction buttons, WASD/arrows, Shift-to-run, Attack, socket visualization, and safe-zone back carry.

Do not open the HTML directly with `file://`; browsers block the JSON and texture fetches in that mode.
