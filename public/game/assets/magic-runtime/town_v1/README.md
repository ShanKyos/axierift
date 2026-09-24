# Spellblade Town Package v1

Production package for the safe-zone character: wing-equipped ground movement,
modular armor, and interchangeable dual weapons.

## Runtime contract

- Cell: 256x256 RGBA; atlas: 8 directions x 8 frames.
- Row order: south, southwest, west, northwest, north, northeast, east, southeast.
- States: idle 5 FPS, walk 7 FPS / 72 px/s, run 11 FPS / 136 px/s.
- Armor slots: head, chest, gloves, pants, boots. Spellblade head is intentionally empty;
  chest owns the face mask and shoulders.
- Weapons: seven distinct silhouettes. Use `weapons[].variants` for +0/+9/+10/+11.
- Held mode: read `heldSockets` and place both weapon pivots in the palms.
- Safe-zone mode: read `backSockets`; weapons cross behind the body.
- Wing: render `wing_far`, then character layers, then `wing_clasp`.

## Render order

`wing_far -> weapon_back -> body_base -> chest -> pants -> gloves -> boots -> wing_clasp`

The prebuilt `weaponBackPreviewPlus11` atlases are review/convenience assets. For
other upgrade levels, place the selected weapon variant using `back-sockets.json`.

## Validation

- Every original armor atlas reconstructs pixel-for-pixel from its five slot layers.
- All 7 armor x 7 weapon combinations are rendered in the 49-loadout review.
- Upgrade glow is baked locally into the weapon texture; it is not a character aura.
