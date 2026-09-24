#!/usr/bin/env python3
"""Build Package 1: canonical Magic safe-zone modular runtime."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
RUNTIME = ROOT / "public/game/assets/magic-runtime"
OUT = RUNTIME / "town_v1"
REVIEW = ROOT / "artifacts/magic-town-v1/review"
CELL = 256
GRID = 8
PIVOT = (128, 244)
GRIP_PIVOT = (128, 45)
DIRECTIONS = ("south", "southwest", "west", "northwest", "north", "northeast", "east", "southeast")
STATES = ("idle", "walk", "run")
FPS = {"idle": 5, "walk": 7, "run": 11}
MOVE_SPEED = {"idle": 0, "walk": 72, "run": 136}

ARMORS = (
    (1, "vai_tho", "Vải thô"),
    (2, "trau_xanh", "Trâu xanh"),
    (3, "do_dong", "Đồ đồng"),
    (4, "ma_thuat", "Ma Thuật"),
    (5, "phong_vu", "Phong Vũ"),
    (6, "loi_phong", "Lôi Phong"),
    (7, "cuong_phong", "Cuồng Phong"),
)
WEAPONS = (
    (1, "song_dao_co_ban", "Song đao cơ bản", 72),
    (2, "song_chuy", "Song chùy", 78),
    (3, "song_hoa_dao", "Song hỏa đao", 86),
    (4, "song_kiem_dien", "Song kiếm điện", 94),
    (5, "loi_phong_dao", "Lôi phong đao", 104),
    (6, "ao_anh_dao", "Ảo ảnh đao", 116),
    (7, "hoa_tinh_kiem", "Hỏa tinh kiếm", 128),
)
UPGRADES = {
    "+0": {"brightness": 1.0, "color": (255, 255, 255), "bloom": 0},
    "+9": {"brightness": 1.22, "color": (100, 190, 255), "bloom": 3},
    "+10": {"brightness": 1.38, "color": (255, 204, 90), "bloom": 5},
    "+11": {"brightness": 1.58, "color": (255, 105, 235), "bloom": 7},
}


def save_png(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(".tmp.png")
    image.save(temporary, compress_level=6)
    with Image.open(temporary) as check:
        check.load()
        if check.size != image.size:
            raise RuntimeError(f"Invalid PNG {path}: {check.size}")
    temporary.replace(path)


def cell(atlas: Image.Image, row: int, col: int) -> Image.Image:
    return atlas.crop((col * CELL, row * CELL, (col + 1) * CELL, (row + 1) * CELL))


def split_armor(atlas: Image.Image) -> dict[str, Image.Image]:
    """Partition every opaque pixel into a visible swappable armor piece."""
    result = {name: Image.new("RGBA", atlas.size) for name in ("head", "chest", "gloves", "pants", "boots")}
    for row in range(GRID):
        for col in range(GRID):
            source = cell(atlas, row, col)
            alpha = np.asarray(source.getchannel("A"))
            bbox = source.getchannel("A").getbbox()
            if not bbox:
                continue
            x0, y0, x1, y1 = bbox
            yy, xx = np.mgrid[0:CELL, 0:CELL]
            nx = (xx - x0) / max(1, x1 - x0)
            ny = (yy - y0) / max(1, y1 - y0)
            occupied = alpha > 0

            # Magic has no helmet. Hair/head remain part of the canonical body;
            # the chest piece owns the lower-face mask and both shoulders.
            # Follow garment joints instead of cutting the sprite into flat
            # horizontal bands.  The curves remain deterministic, so every
            # opaque source pixel still belongs to exactly one slot.
            waist = .535 + .026 * np.cos((nx - .5) * np.pi * 2.0)
            boot_top = .755 + .030 * np.cos((nx - .5) * np.pi * 3.0)
            outer_arm = (nx <= (.285 - .018 * ny)) | (nx >= (.715 + .018 * ny))
            boots = occupied & (ny >= boot_top)
            gloves = occupied & ~boots & (ny >= .245) & (ny < .715) & outer_arm
            # The coat/chest owns the belt and outer skirt tails.  The pants
            # emerge as a narrow V at the crotch and widen toward the knees,
            # which hides cross-set joins under the coat instead of exposing
            # a rectangular waist seam.
            leg_progress = np.clip((ny - .52) / .28, 0.0, 1.0)
            leg_half_width = .10 + .27 * leg_progress
            central_legs = np.abs(nx - .5) <= leg_half_width
            pants = occupied & ~boots & ~gloves & central_legs & (ny >= waist)
            chest = occupied & ~boots & ~gloves & ~pants
            masks = {
                "head": np.zeros_like(alpha, dtype=np.uint8),
                "chest": np.where(chest, alpha, 0).astype(np.uint8),
                "gloves": np.where(gloves, alpha, 0).astype(np.uint8),
                "pants": np.where(pants, alpha, 0).astype(np.uint8),
                "boots": np.where(boots, alpha, 0).astype(np.uint8),
            }
            for name, mask in masks.items():
                piece = source.copy()
                piece.putalpha(Image.fromarray(mask, mode="L"))
                result[name].alpha_composite(piece, (col * CELL, row * CELL))
    return result


def reconstruct(parts: dict[str, Image.Image]) -> Image.Image:
    output = Image.new("RGBA", next(iter(parts.values())).size)
    for name in ("head", "chest", "gloves", "pants", "boots"):
        output.alpha_composite(parts[name])
    return output


def weapon_variant(master: Image.Image, spec: dict) -> Image.Image:
    source = master.convert("RGBA")
    alpha = source.getchannel("A")
    rgb = ImageEnhance.Brightness(source.convert("RGB")).enhance(spec["brightness"])
    color = Image.new("RGB", source.size, spec["color"])
    tint_strength = 0 if spec["bloom"] == 0 else min(.34, .12 + spec["bloom"] * .025)
    rgb = Image.blend(rgb, color, tint_strength)
    core = rgb.convert("RGBA")
    core.putalpha(alpha)
    if spec["bloom"] == 0:
        return core
    glow_alpha = alpha.filter(ImageFilter.GaussianBlur(spec["bloom"]))
    glow_alpha = ImageEnhance.Brightness(glow_alpha).enhance(.72)
    glow = Image.new("RGBA", source.size, (*spec["color"], 0))
    glow.putalpha(glow_alpha)
    glow.alpha_composite(core)
    return glow


def transform_weapon(master: Image.Image, socket: dict, display: int, mirror: bool) -> Image.Image:
    item = master.resize((display, display), Image.Resampling.LANCZOS)
    if mirror:
        item = ImageOps.mirror(item)
    stage_size = display * 4
    center = stage_size // 2
    gx = round(GRIP_PIVOT[0] / 256 * display)
    gy = round(GRIP_PIVOT[1] / 256 * display)
    stage = Image.new("RGBA", (stage_size, stage_size))
    stage.alpha_composite(item, (center - gx, center - gy))
    stage = stage.rotate(-socket["rotationDeg"], Image.Resampling.BICUBIC, center=(center, center))
    output = Image.new("RGBA", (CELL, CELL))
    output.alpha_composite(stage, (round(socket["xy"][0] - center), round(socket["xy"][1] - center)))
    return output


def palm_patch(body: Image.Image, xy: list[int], radius: int = 8) -> Image.Image:
    x, y = xy
    output = Image.new("RGBA", (CELL, CELL))
    box = (max(0, x - radius), max(0, y - radius), min(CELL, x + radius), min(CELL, y + radius))
    patch = body.crop(box)
    mask = Image.new("L", patch.size)
    ImageDraw.Draw(mask).ellipse((0, 0, patch.width - 1, patch.height - 1), fill=255)
    output.paste(patch, box[:2], mask)
    return output


def remap_wings(source: Image.Image, state: str) -> Image.Image:
    maps = {
        "idle": (0, 1, 2, 1, 0, 1, 2, 1),
        "walk": (0, 1, 2, 3, 2, 1, 0, 1),
        "run": (0, 2, 4, 6, 4, 2, 0, 2),
    }
    output = Image.new("RGBA", source.size)
    for row in range(GRID):
        for col, source_col in enumerate(maps[state]):
            output.alpha_composite(cell(source, row, source_col), (col * CELL, row * CELL))
    return output


def build_back_layer(body_atlas: Image.Image, master: Image.Image, display: int) -> tuple[Image.Image, dict]:
    output = Image.new("RGBA", body_atlas.size)
    sockets = {}
    for row, direction in enumerate(DIRECTIONS):
        frames = []
        for col in range(GRID):
            body = cell(body_atlas, row, col)
            bbox = body.getchannel("A").getbbox() or (32, 20, 224, 244)
            x0, y0, x1, y1 = bbox
            cx = (x0 + x1) // 2
            shoulder = round(y0 + (y1 - y0) * .28)
            bob = (-1, 0, 1, 2, 1, 0, -1, -2)[col]
            pair = [
                {"xy": [cx - 11, shoulder + bob], "rotationDeg": 36, "z": "back"},
                {"xy": [cx + 11, shoulder + bob], "rotationDeg": -36, "z": "back"},
            ]
            layer = Image.new("RGBA", (CELL, CELL))
            for index, socket in enumerate(pair):
                layer.alpha_composite(transform_weapon(master, socket, display, mirror=index == 0))
            output.alpha_composite(layer, (col * CELL, row * CELL))
            frames.append({"back_left": pair[0], "back_right": pair[1]})
        sockets[direction] = frames
    return output, sockets


def compose_held(body: Image.Image, master: Image.Image, socket: dict, display: int) -> Image.Image:
    result = Image.new("RGBA", (CELL, CELL))
    for index, key in enumerate(("hand_left", "hand_right")):
        if socket[key]["z"] == "back":
            result.alpha_composite(transform_weapon(master, socket[key], display, mirror=index == 0))
    result.alpha_composite(body)
    for index, key in enumerate(("hand_left", "hand_right")):
        if socket[key]["z"] == "front":
            result.alpha_composite(transform_weapon(master, socket[key], display, mirror=index == 0))
            result.alpha_composite(palm_patch(body, socket[key]["xy"]))
    return result


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    REVIEW.mkdir(parents=True, exist_ok=True)
    sockets = json.loads((RUNTIME / "sockets.json").read_text(encoding="utf-8"))

    reconstruction = {}
    armor_manifest = []
    for tier, armor_id, name in ARMORS:
        states = {}
        reconstruction[armor_id] = {}
        for state in STATES:
            source_path = RUNTIME / "armor" / armor_id / f"{state}-8dir-8frame.png"
            source = Image.open(source_path).convert("RGBA")
            parts = split_armor(source)
            rebuilt = reconstruct(parts)
            # Partitioning must preserve every source pixel exactly.
            difference = ImageChops.difference(source, rebuilt)
            if difference.getbbox() is not None:
                raise RuntimeError(f"Armor reconstruction mismatch: {armor_id}/{state}")
            state_files = {}
            for part, atlas in parts.items():
                relative = Path("armor") / armor_id / state / f"{part}.png"
                save_png(atlas, OUT / relative)
                state_files[part] = str(relative)
            states[state] = state_files
            reconstruction[armor_id][state] = True
        armor_manifest.append({"tier": tier, "id": armor_id, "name": name, "states": states})

    weapon_manifest = []
    masters = {}
    for tier, weapon_id, name, base_display in WEAPONS:
        source = Image.open(RUNTIME / "weapons" / f"{weapon_id}-master.png").convert("RGBA")
        variants = {}
        for level, spec in UPGRADES.items():
            variant = weapon_variant(source, spec)
            relative = Path("weapons") / weapon_id / f'{level.replace("+", "plus")}.png'
            save_png(variant, OUT / relative)
            variants[level] = str(relative)
            if level == "+11":
                masters[weapon_id] = variant
        weapon_manifest.append({
            "tier": tier,
            "id": weapon_id,
            "name": name,
            "heldDisplayPx": round(base_display * 1.15),
            "backDisplayPx": round(base_display * 1.25),
            "gripPivot": list(GRIP_PIVOT),
            "variants": variants,
        })

    source_wing_far = Image.open(RUNTIME / "flight_8dir/wing-mg-safe-walk-far-8dir-8frame.png").convert("RGBA")
    source_wing_near = Image.open(RUNTIME / "flight_8dir/wing-mg-safe-walk-near-8dir-8frame.png").convert("RGBA")
    wing_files = {}
    for state in STATES:
        far = remap_wings(source_wing_far, state)
        near = remap_wings(source_wing_near, state)
        far_rel = Path("wing") / f"{state}-far.png"
        near_rel = Path("wing") / f"{state}-clasp.png"
        save_png(far, OUT / far_rel)
        save_png(near, OUT / near_rel)
        wing_files[state] = {"far": str(far_rel), "clasp": str(near_rel)}

    # Back layers are authored once per weapon/state and remain independent of armor.
    back_files = {}
    back_sockets = {}
    canonical = {
        state: Image.open(RUNTIME / "armor/ma_thuat" / f"{state}-8dir-8frame.png").convert("RGBA")
        for state in STATES
    }
    for weapon in weapon_manifest:
        weapon_id = weapon["id"]
        back_files[weapon_id] = {}
        back_sockets[weapon_id] = {}
        for state in STATES:
            layer, timeline = build_back_layer(
                canonical[state], masters[weapon_id], weapon["backDisplayPx"]
            )
            relative = Path("weapon_back") / weapon_id / f"{state}.png"
            save_png(layer, OUT / relative)
            back_files[weapon_id][state] = str(relative)
            back_sockets[weapon_id][state] = timeline

    manifest = {
        "id": "spellblade_town_package_v1",
        "identity": "magic_canonical_ma_thuat_skeleton",
        "cell": [CELL, CELL],
        "layout": {"columns": GRID, "rows": GRID, "framesPerDirection": GRID, "rowOrder": list(DIRECTIONS)},
        "pivot": list(PIVOT),
        "states": {state: {"fps": FPS[state], "movementPxPerSecond": MOVE_SPEED[state]} for state in STATES},
        "armorMode": "piece_layers",
        "armorSlots": ["head", "chest", "gloves", "pants", "boots"],
        "magicHeadPolicy": "empty; chest owns face mask and shoulders",
        "renderOrder": ["wing_far", "weapon_back", "body_base", "armor_chest", "armor_pants", "armor_gloves", "armor_boots", "wing_clasp"],
        "bodyBase": {state: f"../body_base/{state}-8dir-8frame.png" for state in STATES},
        "armors": armor_manifest,
        "weapons": weapon_manifest,
        "weaponBackPreviewPlus11": back_files,
        "wing": {"id": "wing_mg_default", "states": wing_files},
        "heldSockets": "../sockets.json",
        "backSockets": "back-sockets.json",
        "upgradeLevels": UPGRADES,
        "validation": {"armorReconstruction": reconstruction, "expectedMixes": 49},
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "back-sockets.json").write_text(json.dumps(back_sockets, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # Review 1: movement distinction with wing and crossed +11 weapons.
    review_weapon = next(item for item in weapon_manifest if item["id"] == "ao_anh_dao")
    movement_frames = []
    for row, direction in enumerate(DIRECTIONS):
        for col in range(GRID):
            board = Image.new("RGBA", (3 * 260, 286), (18, 13, 24, 255))
            draw = ImageDraw.Draw(board)
            for index, state in enumerate(STATES):
                far = Image.open(OUT / wing_files[state]["far"]).convert("RGBA")
                clasp = Image.open(OUT / wing_files[state]["clasp"]).convert("RGBA")
                back = Image.open(OUT / back_files["ao_anh_dao"][state]).convert("RGBA")
                sprite = Image.new("RGBA", (CELL, CELL))
                sprite.alpha_composite(cell(far, row, col))
                sprite.alpha_composite(cell(back, row, col))
                sprite.alpha_composite(cell(canonical[state], row, col))
                sprite.alpha_composite(cell(clasp, row, col))
                board.alpha_composite(sprite, (index * 260 + 2, 22))
                draw.text((index * 260 + 8, 5), f"{state.upper()} · {FPS[state]} FPS", fill=(255, 225, 160, 255))
            draw.text((8, 268), f"{direction.upper()} · frame {col + 1}/8", fill=(220, 204, 175, 255))
            movement_frames.append(board.convert("P", palette=Image.Palette.ADAPTIVE, colors=255))
    movement_frames[0].save(REVIEW / "package1-movement-8dir.gif", save_all=True, append_images=movement_frames[1:], duration=145, loop=0, disposal=2)

    # Review 2: visible mixed armor pieces on the canonical body.
    mix_specs = [
        ("ma_thuat", "phong_vu", "loi_phong", "cuong_phong"),
        ("phong_vu", "do_dong", "cuong_phong", "ma_thuat"),
        ("cuong_phong", "loi_phong", "phong_vu", "do_dong"),
        ("do_dong", "ma_thuat", "trau_xanh", "vai_tho"),
    ]
    mix_board = Image.new("RGBA", (4 * 300, 330), (18, 13, 24, 255))
    mix_draw = ImageDraw.Draw(mix_board)
    base = Image.open(RUNTIME / "body_base/idle-8dir-8frame.png").convert("RGBA")
    for index, (chest, gloves, pants, boots) in enumerate(mix_specs):
        sprite = cell(base, 0, 0)
        for armor_id, part in ((chest, "chest"), (pants, "pants"), (gloves, "gloves"), (boots, "boots")):
            layer = Image.open(OUT / "armor" / armor_id / "idle" / f"{part}.png").convert("RGBA")
            sprite.alpha_composite(cell(layer, 0, 0))
        sprite = sprite.resize((280, 280), Image.Resampling.LANCZOS)
        mix_board.alpha_composite(sprite, (index * 300 + 10, 28))
        mix_draw.text((index * 300 + 8, 7), f"C:{chest} G:{gloves} P:{pants} B:{boots}", fill=(255, 225, 160, 255))
    save_png(mix_board, REVIEW / "package1-armor-piece-mixes.png")

    # Review 2b: every visible armor slot, across all seven sets.
    slot_board = Image.new("RGBA", (7 * 180, 5 * 190), (18, 13, 24, 255))
    slot_draw = ImageDraw.Draw(slot_board)
    for col, (_, armor_id, label) in enumerate(ARMORS):
        slot_draw.text((col * 180 + 5, 5), label, fill=(255, 225, 160, 255))
        for row, part in enumerate(("head", "chest", "gloves", "pants", "boots")):
            layer = Image.open(OUT / "armor" / armor_id / "idle" / f"{part}.png").convert("RGBA")
            sprite = cell(layer, 0, 0).resize((176, 176), Image.Resampling.LANCZOS)
            slot_board.alpha_composite(sprite, (col * 180 + 2, row * 190 + 12))
            if col == 0:
                slot_draw.text((4, row * 190 + 170), part, fill=(210, 195, 170, 255))
    save_png(slot_board, REVIEW / "package1-armor-slots.png")

    # Review 2c: all 49 armor/weapon tier combinations are loadable.
    loadout_board = Image.new("RGBA", (7 * 150, 7 * 150), (18, 13, 24, 255))
    for armor_row, (_, armor_id, _) in enumerate(ARMORS):
        armor_atlas = Image.open(RUNTIME / "armor" / armor_id / "idle-8dir-8frame.png").convert("RGBA")
        for weapon_col, weapon in enumerate(weapon_manifest):
            sprite = cell(armor_atlas, 0, 0)
            held = compose_held(
                sprite,
                Image.open(OUT / weapon["variants"]["+0"]).convert("RGBA"),
                sockets["states"]["idle"]["south"][0],
                weapon["heldDisplayPx"],
            )
            held = held.resize((146, 146), Image.Resampling.LANCZOS)
            loadout_board.alpha_composite(held, (weapon_col * 150 + 2, armor_row * 150 + 2))
    save_png(loadout_board, REVIEW / "package1-49-loadouts.png")

    # Review 3: all weapon silhouettes and material upgrade levels.
    weapon_board = Image.new("RGBA", (7 * 180, 4 * 190), (18, 13, 24, 255))
    weapon_draw = ImageDraw.Draw(weapon_board)
    for col, weapon in enumerate(weapon_manifest):
        for row, level in enumerate(UPGRADES):
            master = Image.open(OUT / weapon["variants"][level]).convert("RGBA")
            crop = master.getchannel("A").getbbox()
            item = master.crop(crop) if crop else master
            scale = min(145 / item.width, 145 / item.height)
            item = item.resize((max(1, round(item.width * scale)), max(1, round(item.height * scale))), Image.Resampling.LANCZOS)
            x = col * 180 + (180 - item.width) // 2
            y = row * 190 + 25 + (145 - item.height) // 2
            weapon_board.alpha_composite(item, (x, y))
            weapon_draw.text((col * 180 + 5, row * 190 + 5), f"T{weapon['tier']} {level}", fill=(255, 225, 160, 255))
    save_png(weapon_board, REVIEW / "package1-weapon-upgrades.png")

    # Review 4: held weapon grip proof using canonical body and the longer +11 item.
    grip_frames = []
    master = Image.open(OUT / review_weapon["variants"]["+11"]).convert("RGBA")
    for row, direction in enumerate(DIRECTIONS):
        for col in range(GRID):
            body = cell(canonical["walk"], row, col)
            composed = compose_held(
                body, master, sockets["states"]["walk"][direction][col], review_weapon["heldDisplayPx"]
            )
            board = Image.new("RGBA", (300, 286), (18, 13, 24, 255))
            board.alpha_composite(composed, (22, 22))
            ImageDraw.Draw(board).text((8, 5), f"HELD +11 · {direction.upper()} · {col + 1}/8", fill=(255, 225, 160, 255))
            grip_frames.append(board.convert("P", palette=Image.Palette.ADAPTIVE, colors=255))
    grip_frames[0].save(REVIEW / "package1-held-grip-8dir.gif", save_all=True, append_images=grip_frames[1:], duration=145, loop=0, disposal=2)

    readme = """# Spellblade Town Package v1

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
"""
    (OUT / "README.md").write_text(readme, encoding="utf-8")


if __name__ == "__main__":
    main()
