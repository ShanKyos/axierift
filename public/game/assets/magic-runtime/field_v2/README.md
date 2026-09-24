# Spellblade Field Package v2

Eight-direction airborne runtime using the same locked character identity,
seven modular armor sets, seven interchangeable dual weapons and +0/+9/+10/+11
weapon materials as Package 1.

States: flyIdle, flyMove, flyHit, flyDeath, flyAttackFireSlash,
flyAttackLightSlash and flyAttackDash. Every state is an 8x8 atlas of 256px
cells. Read manifest.json for FPS, damage frames, dash movement frames, render
order and paths. Read weapon-sockets.json to attach the selected weapon master
to both palms; the included weapon layers are +11 review previews only.

Render order:
wing_far -> weapon_far -> body_base -> armor pieces -> wing_clasp ->
weapon_near -> hand_grip -> skill_vfx
