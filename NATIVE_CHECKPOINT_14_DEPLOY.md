# Magic native checkpoint 14 publication

This branch publishes the native runtime and every PNG requested by its loader, including body/armor parts, concealed masters, weapons, both wings, joint underpaint and VFX source images. It includes source images for the authoring fallback.

Physics remains opt-in: `public/game/index.html?test=1&magicRebuild=1&magicPhysics=1`. Production-default URLs keep the existing renderer. Open `public/game/magic_physics.html` for physics preview.

This is a native deployment subset, not the complete flat atlas/authoring archive. The complete checkpoint 11 + deltas 12/13/14 remain separate deliverables. Unused compiled export entries may point to those archive assets; the runtime loader does not request them.

Git LFS uploading is unavailable from this environment. The small native PNG files use ordinary Git blobs with a local attributes override; no missing LFS object is introduced by this publication.

Checkpoint 14 has passed bounded native/physics and old-renderer QA. Production physics is not certified: performance, wing membrane collision and full aesthetic/device QA remain open. See REPAIR_CHECKPOINT_14.md. The deploy gates in AGENTS.md require lint/typecheck/unit plus full game regressions before main.

The game adapter additionally qualifies `window.MagicPhysicsRig.filter` to avoid an undeclared-global lint error. This does not enable the physics flag.
