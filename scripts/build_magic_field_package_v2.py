#!/usr/bin/env python3
"""Build Package 2: eight-direction Spellblade airborne runtime."""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from build_magic_flight_8dir_v3 import (  # noqa: E402
    authored_sockets,
    cell_image,
    crop_alpha,
    keep_primary_component,
    palm_patch,
    weapon_at,
)
from build_magic_town_package_v1 import (  # noqa: E402
    ARMORS,
    UPGRADES,
    WEAPONS,
    reconstruct,
    split_armor,
    weapon_variant,
)

RUNTIME = ROOT / "public/game/assets/magic-runtime"
OUT = RUNTIME / "field_v2"
REVIEW = ROOT / "artifacts/magic-field-v2/review"
CELL = 256
GRID = 8
DIRECTIONS = ("south", "southwest", "west", "northwest", "north", "northeast", "east", "southeast")
STATES = (
    "flyIdle",
    "flyMove",
    "flyHit",
    "flyDeath",
    "flyAttackFireSlash",
    "flyAttackLightSlash",
    "flyAttackDash",
)
FPS = {
    "flyIdle": 6,
    "flyMove": 8,
    "flyHit": 10,
    "flyDeath": 8,
    "flyAttackFireSlash": 10,
    "flyAttackLightSlash": 10,
    "flyAttackDash": 12,
}
LOOP = {"flyIdle": True, "flyMove": True, **{state: False for state in STATES[2:]}}
NEXT = {
    "flyHit": "flyIdle",
    "flyDeath": "dead",
    "flyAttackFireSlash": "flyIdle",
    "flyAttackLightSlash": "flyIdle",
    "flyAttackDash": "flyIdle",
}
SOURCE_STATE = {
    "flyIdle": "idle",
    "flyMove": "run",
    "flyHit": "idle",
    "flyDeath": "idle",
    "flyAttackFireSlash": "attack",
    "flyAttackLightSlash": "attack",
    "flyAttackDash": "run",
}


def save_png(image: Image.Image, path: Path) -> str:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(".tmp.png")
    image.save(temp, compress_level=6)
    with Image.open(temp) as check:
        check.load()
        if check.size != image.size:
            raise RuntimeError(f"invalid image {path}")
    temp.replace(path)
    return str(path.relative_to(OUT)) if path.is_relative_to(OUT) else str(path)


def cell(atlas: Image.Image, row: int, col: int) -> Image.Image:
    return atlas.crop((col * CELL, row * CELL, (col + 1) * CELL, (row + 1) * CELL))


def normalize_source(path: Path, target_height: int) -> Image.Image:
    """Recover sprites whose true bounds cross the nominal 256px grid."""
    source = Image.open(path).convert("RGBA")
    atlas = Image.new("RGBA", (CELL * GRID, CELL * GRID))
    for row in range(GRID):
        for col in range(GRID):
            box = (col * CELL, row * CELL, (col + 1) * CELL, (row + 1) * CELL)
            pad = 88
            expanded = (
                max(0, box[0] - pad), max(0, box[1] - pad),
                min(source.width, box[2] + pad), min(source.height, box[3] + pad),
            )
            expected = (
                (box[0] + box[2]) / 2 - expanded[0],
                (box[1] + box[3]) / 2 - expanded[1],
            )
            sprite = crop_alpha(keep_primary_component(source.crop(expanded), expected))
            scale = min(target_height / max(1, sprite.height), 224 / max(1, sprite.width))
            sprite = sprite.resize(
                (max(1, round(sprite.width * scale)), max(1, round(sprite.height * scale))),
                Image.Resampling.LANCZOS,
            )
            atlas.alpha_composite(sprite, (col * CELL + 128 - sprite.width // 2, row * CELL + 240 - sprite.height))
    return atlas


def place_bottom(sprite: Image.Image, bottom: int = 238, x_shift: int = 0) -> Image.Image:
    bbox = sprite.getchannel("A").getbbox()
    result = Image.new("RGBA", (CELL, CELL))
    if not bbox:
        return result
    crop = sprite.crop(bbox)
    x = 128 - crop.width // 2 + x_shift
    y = bottom - crop.height
    result.alpha_composite(crop, (x, y))
    return result


def death_cell(source: Image.Image, frame: int, direction: int) -> Image.Image:
    """Feet contact first, then the silhouette falls and ends horizontal."""
    angles = (0, 8, 20, 36, 54, 70, 82, 88)
    sign = -1 if direction in (0, 1, 2, 3) else 1
    if direction == 4:
        sign = 1
    bbox = source.getchannel("A").getbbox()
    if not bbox:
        return Image.new("RGBA", (CELL, CELL))
    crop = source.crop(bbox)
    rotated = crop.rotate(sign * angles[frame], Image.Resampling.BICUBIC, expand=True)
    # The baseline remains fixed, so both legs visibly meet the ground before
    # the torso completes the fall.
    return place_bottom(rotated, bottom=242, x_shift=sign * (frame * 3))


def hit_cell(source: Image.Image, frame: int, direction: int) -> Image.Image:
    bend = (0, 4, 10, 15, 11, 6, 2, 0)[frame]
    sign = -1 if direction in (0, 1, 2, 3) else 1
    bbox = source.getchannel("A").getbbox()
    if not bbox:
        return Image.new("RGBA", (CELL, CELL))
    crop = source.crop(bbox)
    # Squash plus a small backward rotation reads as the MU-style arched hit.
    crop = crop.resize((crop.width, max(1, round(crop.height * (1 - bend / 150)))), Image.Resampling.LANCZOS)
    crop = crop.rotate(sign * bend * .32, Image.Resampling.BICUBIC, expand=True)
    return place_bottom(crop, bottom=236, x_shift=sign * round(bend * .35))


def state_atlas(source: Image.Image, state: str) -> Image.Image:
    atlas = Image.new("RGBA", source.size)
    for row in range(GRID):
        for col in range(GRID):
            src_col = 7 - col if state == "flyAttackLightSlash" else col
            sprite = cell(source, row, src_col)
            if state == "flyDeath":
                sprite = death_cell(sprite, col, row)
            elif state == "flyHit":
                sprite = hit_cell(sprite, col, row)
            else:
                bbox = sprite.getchannel("A").getbbox()
                if bbox:
                    crop = sprite.crop(bbox)
                    if state == "flyIdle":
                        bob = (0, -2, -4, -2, 0, 2, 3, 1)[col]
                        sprite = place_bottom(crop, 228 + bob)
                    elif state == "flyMove":
                        lean = (-3, -5, -7, -5, -3, -5, -7, -5)[col]
                        sprite = place_bottom(crop.rotate(lean, Image.Resampling.BICUBIC, expand=True), 230)
                    elif state == "flyAttackDash":
                        vector = ((0, 1), (-1, 1), (-1, 0), (-1, -1), (0, -1), (1, -1), (1, 0), (1, 1))[row]
                        travel = (0, 3, 8, 15, 22, 16, 8, 2)[col]
                        sprite = place_bottom(crop, 230 + vector[1] * travel // 3, vector[0] * travel)
                    else:
                        sprite = place_bottom(crop, 232)
            atlas.alpha_composite(sprite, (col * CELL, row * CELL))
    return atlas


def remap_wing(source: Image.Image, state: str) -> Image.Image:
    maps = {
        "flyIdle": (0, 1, 2, 3, 2, 1, 0, 1),
        "flyMove": (0, 2, 4, 6, 4, 2, 0, 2),
        "flyHit": (0, 1, 2, 2, 1, 1, 0, 0),
        "flyDeath": (0, 1, 2, 3, 4, 5, 6, 7),
        "flyAttackFireSlash": (0, 2, 4, 6, 7, 5, 3, 1),
        "flyAttackLightSlash": (7, 5, 3, 1, 0, 2, 4, 6),
        "flyAttackDash": (0, 3, 6, 7, 7, 5, 2, 0),
    }
    result = Image.new("RGBA", source.size)
    for row in range(GRID):
        for col, src_col in enumerate(maps[state]):
            wing_cell = cell(source, row, src_col)
            if state == "flyDeath":
                angle = (0, 8, 20, 36, 54, 70, 82, 88)[col]
                sign = -1 if row in (0, 1, 2, 3) else 1
                wing_cell = wing_cell.rotate(sign * angle, Image.Resampling.BICUBIC, center=(128, 238))
            elif state == "flyHit":
                angle = (0, 1, 3, 5, 4, 2, 1, 0)[col]
                sign = -1 if row in (0, 1, 2, 3) else 1
                wing_cell = wing_cell.rotate(sign * angle, Image.Resampling.BICUBIC, center=(128, 230))
            result.alpha_composite(wing_cell, (col * CELL, row * CELL))
    return result


def build_weapon_layers(body: Image.Image, state: str, master: Image.Image, size: int) -> tuple[Image.Image, Image.Image, Image.Image, dict]:
    far = Image.new("RGBA", body.size)
    near = Image.new("RGBA", body.size)
    grip = Image.new("RGBA", body.size)
    timeline: dict[str, list] = {}
    attack = state.startswith("flyAttack")
    for row, direction in enumerate(DIRECTIONS):
        timeline[direction] = []
        for col in range(GRID):
            body_cell = cell(body, row, col)
            sockets = authored_sockets(body_cell, row, col, attack)
            if state == "flyAttackDash":
                facing = (-2, -45, -90, -135, 178, 135, 90, 45)[row]
                for socket in sockets:
                    socket["rotationDeg"] = facing
            near_indices = {0, 1} if row in (0, 1, 7) else (set() if row == 4 else {1})
            far_cell = Image.new("RGBA", (CELL, CELL))
            near_cell = Image.new("RGBA", (CELL, CELL))
            grip_cell = Image.new("RGBA", (CELL, CELL))
            named = {}
            for index, socket in enumerate(sockets):
                socket["z"] = "near" if index in near_indices else "far"
                target = near_cell if index in near_indices else far_cell
                target.alpha_composite(weapon_at(master, socket, size, mirror=index == 0))
                if index in near_indices:
                    grip_cell.alpha_composite(palm_patch(body_cell, socket, radius=7))
                named["hand_left" if index == 0 else "hand_right"] = socket
            far.alpha_composite(far_cell, (col * CELL, row * CELL))
            near.alpha_composite(near_cell, (col * CELL, row * CELL))
            grip.alpha_composite(grip_cell, (col * CELL, row * CELL))
            timeline[direction].append(named)
    return far, near, grip, timeline


def vfx_atlas(kind: str) -> Image.Image:
    atlas = Image.new("RGBA", (CELL * GRID, CELL * GRID))
    palette = {
        "fire": ((255, 72, 18), (255, 220, 80)),
        "light": ((80, 165, 255), (245, 255, 255)),
        "dash": ((110, 110, 255), (230, 245, 255)),
    }[kind]
    for row in range(GRID):
        angle = row * 45
        vx = math.sin(math.radians(angle))
        vy = math.cos(math.radians(angle))
        for col in range(GRID):
            frame = Image.new("RGBA", (CELL, CELL))
            draw = ImageDraw.Draw(frame)
            strength = (0, 40, 100, 180, 255, 210, 120, 35)[col]
            if kind in ("fire", "light"):
                box = (49, 42, 207, 207)
                start = -150 + col * 34
                draw.arc(box, start=start, end=start + 118, fill=(*palette[0], strength), width=13)
                draw.arc((56, 49, 200, 200), start=start + 5, end=start + 110, fill=(*palette[1], strength), width=5)
                if kind == "fire":
                    for spark in range(7):
                        x = 128 + round(math.cos(math.radians(start + spark * 17)) * (75 + col * 2))
                        y = 126 + round(math.sin(math.radians(start + spark * 17)) * (67 + col * 2))
                        draw.ellipse((x - 3, y - 3, x + 3, y + 3), fill=(*palette[1], strength))
            else:
                length = (0, 18, 42, 76, 108, 82, 45, 12)[col]
                cx, cy = 128, 138
                # Three tapered trails read as speed lines rather than a
                # solid rectangular beam crossing the character.
                px, py = -vy, vx
                for offset, scale in ((-12, .78), (0, 1.0), (12, .68)):
                    x0 = cx + px * offset
                    y0 = cy + py * offset
                    draw.line(
                        (x0 - vx * length * scale, y0 - vy * length * scale, x0, y0),
                        fill=(*palette[0], round(strength * .72)), width=10,
                    )
                    draw.line(
                        (x0 - vx * length * scale, y0 - vy * length * scale, x0, y0),
                        fill=(*palette[1], strength), width=3,
                    )
            glow = frame.filter(ImageFilter.GaussianBlur(7))
            glow.alpha_composite(frame)
            atlas.alpha_composite(glow, (col * CELL, row * CELL))
    return atlas


def compose(*layers: Image.Image) -> Image.Image:
    result = Image.new("RGBA", layers[0].size)
    for layer in layers:
        result.alpha_composite(layer)
    return result


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    REVIEW.mkdir(parents=True, exist_ok=True)
    # Remove interrupted temporary writes from earlier iterations only.
    for temp in OUT.rglob("*.tmp.png"):
        temp.unlink()

    wing_far_source = Image.open(RUNTIME / "flight_8dir/wing-mg-fly-far-8dir-8frame.png").convert("RGBA")
    wing_near_source = Image.open(RUNTIME / "flight_8dir/wing-mg-fly-near-8dir-8frame.png").convert("RGBA")
    preview_master = weapon_variant(
        Image.open(RUNTIME / "weapons/ao_anh_dao-master.png").convert("RGBA"), UPGRADES["+11"]
    )

    body_sources = {
        state: state_atlas(
            normalize_source(
                RUNTIME / "body_base" / f"{SOURCE_STATE[state]}-8dir-8frame.png",
                target_height=210,
            ),
            state,
        )
        for state in STATES
    }
    wings = {}
    previews = {}
    preview_layers = {}
    sockets = {}
    files = {"bodyBase": {}, "wingFar": {}, "wingClasp": {}, "weaponFarPreviewPlus11": {}, "weaponNearPreviewPlus11": {}, "handGrip": {}, "skillVfx": {}}

    for state in STATES:
        files["bodyBase"][state] = save_png(body_sources[state], OUT / "body_base" / f"{state}.png")
        far_wing = remap_wing(wing_far_source, state)
        near_wing = remap_wing(wing_near_source, state)
        wings[state] = (far_wing, near_wing)
        files["wingFar"][state] = save_png(far_wing, OUT / "wing" / f"{state}-far.png")
        files["wingClasp"][state] = save_png(near_wing, OUT / "wing" / f"{state}-clasp.png")
        weapon_far, weapon_near, grip, state_sockets = build_weapon_layers(
            body_sources[state], state, preview_master, 126 if state.startswith("flyAttack") else 122
        )
        sockets[state] = state_sockets
        files["weaponFarPreviewPlus11"][state] = save_png(weapon_far, OUT / "weapon_preview" / f"{state}-far.png")
        files["weaponNearPreviewPlus11"][state] = save_png(weapon_near, OUT / "weapon_preview" / f"{state}-near.png")
        files["handGrip"][state] = save_png(grip, OUT / "hand_grip" / f"{state}.png")
        vfx = Image.new("RGBA", body_sources[state].size)
        if state == "flyAttackFireSlash":
            vfx = vfx_atlas("fire")
        elif state == "flyAttackLightSlash":
            vfx = vfx_atlas("light")
        elif state == "flyAttackDash":
            vfx = vfx_atlas("dash")
        files["skillVfx"][state] = save_png(vfx, OUT / "vfx" / f"{state}.png")
        preview_layers[state] = (far_wing, weapon_far, near_wing, weapon_near, grip, vfx)

    armor_manifest = []
    reconstruction = {}
    canonical_armor = {}
    for tier, armor_id, label in ARMORS:
        entry = {"tier": tier, "id": armor_id, "name": label, "states": {}}
        reconstruction[armor_id] = {}
        for state in STATES:
            source = normalize_source(
                RUNTIME / "armor" / armor_id / f"{SOURCE_STATE[state]}-8dir-8frame.png",
                target_height=216,
            )
            posed = state_atlas(source, state)
            if armor_id == "ma_thuat":
                canonical_armor[state] = posed
            parts = split_armor(posed)
            reconstruction[armor_id][state] = ImageChops.difference(posed, reconstruct(parts)).getbbox() is None
            entry["states"][state] = {}
            for part, layer in parts.items():
                entry["states"][state][part] = save_png(layer, OUT / "armor" / armor_id / state / f"{part}.png")
        armor_manifest.append(entry)

    for state in STATES:
        far_wing, weapon_far, near_wing, weapon_near, grip, vfx = preview_layers[state]
        previews[state] = compose(
            far_wing,
            weapon_far,
            canonical_armor[state],
            near_wing,
            weapon_near,
            grip,
            vfx,
        )

    town_manifest = json.loads((RUNTIME / "town_v1/manifest.json").read_text(encoding="utf-8"))
    weapon_manifest = json.loads(json.dumps(town_manifest["weapons"]))
    for weapon in weapon_manifest:
        weapon["variants"] = {
            level: f"../town_v1/{relative}" for level, relative in weapon["variants"].items()
        }
    manifest = {
        "id": "spellblade_field_package_v2",
        "identity": "magic_canonical_silver_hair_masked_slim",
        "cell": [CELL, CELL],
        "layout": {"columns": GRID, "rows": GRID, "framesPerDirection": GRID, "rowOrder": list(DIRECTIONS)},
        "pivot": [128, 240],
        "states": {
            state: {
                "fps": FPS[state], "loop": LOOP[state],
                **({"nextState": NEXT[state]} if state in NEXT else {}),
            }
            for state in STATES
        },
        "timing": {
            "flyAttackFireSlash": {"damageFrame": 4, "vfxStart": 2, "vfxEnd": 7},
            "flyAttackLightSlash": {"damageFrame": 4, "vfxStart": 1, "vfxEnd": 7},
            "flyAttackDash": {"movementFrames": [2, 3, 4, 5], "damageFrame": 4, "distancePx": 96},
            "flyHit": {"impactFrame": 3},
            "flyDeath": {"feetContactFrame": 1, "groundedFrame": 7},
        },
        "armorMode": "piece_layers",
        "armorSlots": ["head", "chest", "gloves", "pants", "boots"],
        "magicHeadPolicy": "empty; chest owns mask and shoulders",
        "renderOrder": ["wing_far", "weapon_far", "body_base", "armor_chest", "armor_pants", "armor_gloves", "armor_boots", "wing_clasp", "weapon_near", "hand_grip", "skill_vfx"],
        "files": files,
        "armors": armor_manifest,
        "weapons": weapon_manifest,
        "weaponUpgradeLevels": list(UPGRADES),
        "weaponSockets": "weapon-sockets.json",
        "validation": {"armorReconstruction": reconstruction, "expectedArmorWeaponMixes": 49},
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "weapon-sockets.json").write_text(json.dumps(sockets, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    readme = """# Spellblade Field Package v2

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
"""
    (OUT / "README.md").write_text(readme, encoding="utf-8")

    # State × direction contact sheet.
    board = Image.new("RGBA", (8 * 260, len(STATES) * 280), (18, 13, 24, 255))
    draw = ImageDraw.Draw(board)
    for state_row, state in enumerate(STATES):
        for direction_row, direction in enumerate(DIRECTIONS):
            sprite = cell(previews[state], direction_row, 4)
            board.alpha_composite(sprite, (direction_row * 260 + 2, state_row * 280 + 20))
            draw.text((direction_row * 260 + 5, state_row * 280 + 4), direction.upper(), fill=(215, 200, 175, 255))
        draw.text((5, state_row * 280 + 260), state, fill=(255, 220, 145, 255))
    save_png(board, REVIEW / "package2-states-8dir.png")

    # Animated review of all states and directions.
    gif_frames = []
    for state in STATES:
        for row, direction in enumerate(DIRECTIONS):
            for col in range(GRID):
                frame = Image.new("RGBA", (300, 286), (18, 13, 24, 255))
                frame.alpha_composite(cell(previews[state], row, col), (22, 22))
                ImageDraw.Draw(frame).text((8, 5), f"{state} · {direction} · {col + 1}/8", fill=(255, 220, 145, 255))
                gif_frames.append(frame.convert("P", palette=Image.Palette.ADAPTIVE, colors=255))
    gif_frames[0].save(REVIEW / "package2-all-states-8dir.gif", save_all=True, append_images=gif_frames[1:], duration=125, loop=0, disposal=2)


if __name__ == "__main__":
    main()
