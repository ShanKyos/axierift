# Sprite-sheet production playbook

This document records the workflow, constraints, pain points, and lessons learned
while building the modular Spellblade character packages. It is intended for
artists, gameplay engineers, technical artists, and AI agents continuing the
work.

## 1. Production goal

Build a character that can change armor, weapons, wing, upgrade level, movement
state, attack, and facing direction without generating a separate flattened
sprite sheet for every possible combination.

The runtime composition model is:

```text
wing_far
weapon_far or weapon_back
body_base
armor_chest
armor_pants
armor_gloves
armor_boots
wing_clasp
weapon_near
hand_grip
skill_vfx
```

Every layer uses the same canvas, cell size, pivot, row order, frame count, and
animation timing. Equipment selection is data-driven through a manifest.

## 2. Locked character identity

The character identity must be fixed before producing animations or equipment:

- slim male Spellblade silhouette;
- silver hair;
- covered lower face;
- stable shoulder width and body proportions;
- identical face, hair, scale, and foot pivot in every state.

Never use a newly generated face or body as a production replacement midway
through the pipeline. Image generation may supply pose studies, armor concepts,
wing designs, or VFX references, but production frames must be normalized back
to the approved skeleton.

## 3. Atlas contract

- Cell size: `256x256` RGBA.
- Atlas size: `2048x2048`.
- Columns: eight animation frames.
- Rows, in order:
  `south, southwest, west, northwest, north, northeast, east, southeast`.
- Ground pivot: approximately `(128, 244)`.
- Air pivot: approximately `(128, 240)`.
- Never infer row order from filenames; read it from the manifest.
- Animation FPS and movement speed are independent values.

Recommended timing:

| State | FPS | Notes |
| --- | ---: | --- |
| Idle | 5 | Low-amplitude breathing only |
| Walk | 7 | Deliberate contact/down/passing/up cycle |
| Run | 11 | Larger stride and stronger forward momentum |
| Fly Idle | 6 | Upright body, slow wing beat |
| Fly Move | 8 | 10–15 degree travel lean |
| Air attacks | 10–12 | Non-looping; damage timing comes from manifest |

## 4. Movement construction

### Walk

Use the eight-frame gait:

1. contact — left foot forward;
2. down;
3. passing;
4. up;
5. contact — right foot forward;
6. down;
7. passing;
8. up.

The final frame must join smoothly back to frame 1. Keep the head and shoulder
bob controlled. Do not create speed by increasing FPS alone; the feet and coat
must show a real gait.

### Run

Run is not a faster playback of Walk. It needs:

- a longer stride;
- more knee lift;
- a slightly lower center of mass;
- stronger arm counter-swing;
- a short airborne interval;
- controlled torso lean.

The engine should use both a higher FPS and a higher movement speed. If only one
changes, the character will appear to slide or fast-march.

### Flight

- `flyIdle`: torso remains almost vertical; hands and weapons follow the body;
  wings supply most of the motion.
- `flyMove`: torso leans in the travel direction; legs and coat trail behind.
- Wing root stays at the shoulder blades in every direction.
- Wing membrane, weapon depth, and the character's visible back must change as
  the direction changes. A front-facing wing pasted onto all rows is invalid.

## 5. Modular armor

Armor slots are:

- `head`;
- `chest` — includes mask and shoulders for this class;
- `gloves`;
- `pants`;
- `boots`.

The Spellblade has no helmet, so `head` is intentionally transparent. Keep the
slot anyway so every class can share the same equipment API.

Each piece atlas must:

- match the body atlas dimensions exactly;
- use the same pivot and frame timing;
- contain only pixels owned by that slot;
- reconstruct the source appearance when all pieces from one set are composed;
- remain visually acceptable when mixed with pieces from other sets.

Flat horizontal cuts at the waist and knees look artificial. Follow garment
joints: belt, coat overlap, crotch V, forearm seam, and boot cuff. Let the chest
own the belt and outer coat tails so the pants emerge naturally below it.

## 6. Weapons and palm sockets

Weapons are authored once as transparent master textures. Every frame stores
two palm sockets:

```json
{
  "hand_left": { "xy": [105, 135], "rotationDeg": -8, "z": "near" },
  "hand_right": { "xy": [151, 135], "rotationDeg": 8, "z": "far" }
}
```

Transform the weapon around its grip pivot, not its image center. Place that
pivot directly inside the palm. After rendering a camera-near weapon, draw a
small palm-cover patch on top of its handle. This makes the hand visibly wrap
around the weapon instead of the blade floating beside the fist.

Direction controls depth:

- front views: both weapons can be near;
- full rear view: both pass behind the torso;
- profile and three-quarter views: one weapon is far and one is near.

Safe-zone weapons use separate back sockets and are crossed behind the body.
They must not be baked into armor or wing sheets.

## 7. Upgrade materials

Weapon levels `+0`, `+9`, `+10`, and `+11` use the same silhouette. The upgrade
changes brightness, emissive tint, and local bloom on the weapon itself:

- `+0`: normal material;
- `+9`: blue/cyan emissive edge;
- `+10`: gold emissive edge;
- `+11`: magenta/high-energy emissive edge.

Do not fake an upgrade by adding a generic aura around the whole character.
The blade, edge, rune, or metal surface must visibly become brighter.

## 8. Airborne combat

Package 2 provides:

- `flyIdle`;
- `flyMove`;
- `flyHit`;
- `flyDeath`;
- `flyAttackFireSlash`;
- `flyAttackLightSlash`;
- `flyAttackDash`.

Attack animations must be different poses, not one pose with recolored VFX.
The manifest declares damage frames, VFX windows, and dash movement frames
separately from the animation FPS.

For hit reaction, arch the torso backward and recover. For death, the feet meet
the baseline first and the body then falls until it rests horizontally. Wing
and weapons must rotate with the body; they cannot remain upright while the
character falls.

## 9. Normalizing generated or legacy sheets

Do not trust nominal grid boundaries. Generated or legacy sheets may have true
frame boundaries offset by 9–24 px or more. Cutting every 256 px can produce:

- missing heads or feet;
- a wing fragment from the adjacent frame;
- a third leg;
- occupied edge pixels in every cell.

Normalization procedure:

1. Expand the crop around the nominal cell.
2. Label connected alpha components.
3. Select the component nearest the expected cell center, with area only as a
   tie-breaker.
4. Crop to alpha bounds.
5. Scale to the approved body height.
6. Place on the shared pivot.
7. Check all four cell edges for occupied pixels.

If the source has already lost pixels, normalization cannot invent them. That
direction must be re-authored from a clean render or model; mirroring is only a
temporary preview fallback.

## 10. Pain points encountered

### Character identity drift

Repeated image generation changed the face, body width, hair, mask, and armor
silhouette. Fix: approve one canonical identity sheet and reject any frame that
does not match it before producing equipment.

### Flattened layers

Early sheets baked body, armor, weapon, wing, and VFX into one image. No crop or
runtime code can recover true sockets from overlapping pixels. Fix: author and
export every production layer separately from the beginning.

### False 256 px grid

Several sheets looked like 2048x2048 atlases but their real frame boundaries
did not align to 256 px. Fix: component-based normalization and edge-bleed QA.

### Weapon detached from hand

Placing a weapon by bounding-box center caused the hilt to float beside the
hand. Fix: grip pivot + per-frame palm socket + palm-cover patch.

### Wing detached from direction or body

Reusing a front-facing wing across all directions made rear views impossible;
keeping the wing upright during death disconnected it from the character. Fix:
directional wing art, shoulder hinge, far/clasp split, and shared body rotation.

### Armor mix seams

Simple rectangular chest/pants/boots masks produced visible horizontal bands.
Fix: semantic ownership around belt, coat tails, crotch, forearm, and boot cuff.
For premium quality, author the equipment from a layered rig rather than
deriving masks from a flattened render.

### Walk and Run looked identical

Changing FPS alone made Run look comedic. Fix: separate pose cycles and separate
movement speeds, then review the foot-contact timing in an animated in-game
preview.

### Glow applied to the character

A character-wide aura did not communicate item upgrade level. Fix: bake or
shader-apply emissive light locally to the selected equipment texture.

## 11. Validation checklist

Before declaring a package production-ready, verify:

- every referenced file exists;
- every atlas is `2048x2048` RGBA;
- every state has 8 directions x 8 frames;
- row order is identical across every layer;
- no unexpected occupied pixels touch a cell edge;
- no frame is empty unless the layer is intentionally empty;
- armor pieces reconstruct their source appearance pixel-for-pixel;
- all 7 armor x 7 weapon combinations load;
- both weapon pivots overlap their palm sockets in every frame;
- rear directions use correct far/near weapon and wing depth;
- `flyDeath` ends on the baseline;
- Walk and Run have visibly different gait and speed;
- JSON parses and every manifest-relative path resolves;
- ZIP integrity test passes;
- no `.tmp.png` or interrupted export is committed.

## 12. Handoff files

- Root runtime index: `public/game/assets/magic-runtime/manifest.json`
- Package contract: `public/game/assets/magic-runtime/PACKAGE_CONTRACT.md`
- Town package: `public/game/assets/magic-runtime/town_v1/manifest.json`
- Field package: `public/game/assets/magic-runtime/field_v2/manifest.json`
- Field sockets: `public/game/assets/magic-runtime/field_v2/weapon-sockets.json`
- Package-specific instructions: `town_v1/README.md` and `field_v2/README.md`
- Reproducible builders: `scripts/build_magic_town_package_v1.py` and
  `scripts/build_magic_field_package_v2.py`

The manifest is authoritative. README files explain intent; game code should
read paths, timing, directions, sockets, and layer order from JSON.
