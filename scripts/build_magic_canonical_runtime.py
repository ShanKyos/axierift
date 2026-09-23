#!/usr/bin/env python3
"""Normalize the approved Magic armor/weapon art into a modular runtime pack."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from PIL import Image
import numpy as np
from scipy import ndimage


ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "artifacts/magic-canonical-runtime/raw"
OUT = ROOT / "public/game/assets/magic-runtime"
CELL = 256
GRID = 8
PIVOT = (128, 244)
FORCE = "--force" in sys.argv
DIRECTIONS = ["south", "southwest", "west", "northwest", "north", "northeast", "east", "southeast"]
STATES = ("idle", "walk", "run", "attack")

ARMORS = [
    ("vai_tho", "Vải thô"),
    ("trau_xanh", "Trâu xanh"),
    ("do_dong", "Đồ đồng"),
    ("ma_thuat", "Ma Thuật"),
    ("phong_vu", "Phong Vũ"),
    ("loi_phong", "Lôi Phong"),
    ("cuong_phong", "Cuồng Phong"),
]

WEAPONS = [
    ("song_dao_co_ban", "Song đao cơ bản", 72),
    ("song_chuy", "Song chùy", 78),
    ("song_hoa_dao", "Song hỏa đao", 86),
    ("song_kiem_dien", "Song kiếm điện", 94),
    ("loi_phong_dao", "Lôi phong đao", 104),
    ("ao_anh_dao", "Ảo ảnh đao", 116),
    ("hoa_tinh_kiem", "Hỏa tinh kiếm", 128),
]

BASE_SOURCES = {
    "idle": Path("/workspace/scratch/aa5d7d614ff4/output/magic-gladiator-body-base-idle-8dir-8frame-v1.png"),
    "walk": Path("/workspace/scratch/aa5d7d614ff4/output/magic-gladiator-body-base-walk-8dir-8frame-v1.png"),
    "run": Path("/workspace/scratch/aa5d7d614ff4/output/magic-modular-v1/body_base/run/body-base-run-8dir-v2-2048.png"),
    "attack": Path("/workspace/scratch/aa5d7d614ff4/output/magic-gladiator-body-base-attack-dual-sword-8dir-8frame-v1.png"),
}


def alpha_crop(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = np.asarray(rgba.getchannel("A"))
    labels, count = ndimage.label(alpha > 20, structure=np.ones((3, 3), dtype=np.uint8))
    if count > 1:
        areas = np.bincount(labels.ravel())
        areas[0] = 0
        main_label = int(areas.argmax())
        cleaned = np.where(labels == main_label, alpha, 0).astype(np.uint8)
        rgba.putalpha(Image.fromarray(cleaned, mode="L"))
    bbox = rgba.getchannel("A").getbbox()
    return rgba.crop(bbox) if bbox else Image.new("RGBA", (1, 1))


def fit_sprite(sprite: Image.Image, target_h: int, max_w: int = 232) -> Image.Image:
    sprite = alpha_crop(sprite)
    scale = min(target_h / sprite.height, max_w / sprite.width)
    size = (max(1, round(sprite.width * scale)), max(1, round(sprite.height * scale)))
    return sprite.resize(size, Image.Resampling.LANCZOS)


def detect_source_grid(src: Image.Image) -> tuple[int, int]:
    """Detect ImageGen's occasional 7x7/8x7 atlas instead of assuming 8x8."""
    alpha = np.asarray(src.getchannel("A")) > 20
    occupied = alpha.sum(axis=0) > 10
    runs = []
    start = None
    for index, value in enumerate(occupied):
        if value and start is None:
            start = index
        elif not value and start is not None:
            if index - start > 20:
                runs.append((start, index))
            start = None
    if start is not None and len(occupied) - start > 20:
        runs.append((start, len(occupied)))
    columns = len(runs) if len(runs) in (7, 8) else 8

    labels, count = ndimage.label(alpha, structure=np.ones((3, 3), dtype=np.uint8))
    areas = np.bincount(labels.ravel())
    character_count = sum(1 for label in range(1, count + 1) if areas[label] > 500)
    rows = round(character_count / columns)
    rows = rows if rows in (7, 8) else 8
    return columns, rows


def normalize_grid(source: Path, destination: Path, target_h: int, detect_grid: bool = False) -> None:
    if not FORCE and destination.exists() and destination.stat().st_mtime >= source.stat().st_mtime:
        try:
            with Image.open(destination) as existing:
                existing.verify()
            return
        except (OSError, SyntaxError):
            pass
    src = Image.open(source).convert("RGBA")
    source_columns, source_rows = detect_source_grid(src) if detect_grid else (GRID, GRID)
    atlas = Image.new("RGBA", (CELL * GRID, CELL * GRID))
    for row in range(GRID):
        source_row = row if row < source_rows else 1
        mirror = row >= source_rows
        top = round(source_row * src.height / source_rows)
        bottom = round((source_row + 1) * src.height / source_rows)
        for col in range(GRID):
            source_col = col if col < source_columns else 0
            left = round(source_col * src.width / source_columns)
            right = round((source_col + 1) * src.width / source_columns)
            source_sprite = src.crop((left, top, right, bottom))
            if mirror:
                source_sprite = source_sprite.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            sprite = fit_sprite(source_sprite, target_h)
            x = col * CELL + PIVOT[0] - sprite.width // 2
            y = row * CELL + PIVOT[1] - sprite.height
            atlas.alpha_composite(sprite, (x, y))
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_suffix(".tmp.png")
    atlas.save(temporary, optimize=True)
    temporary.replace(destination)


def normalize_weapon(source: Path, destination: Path) -> None:
    if not FORCE and destination.exists() and destination.stat().st_mtime >= source.stat().st_mtime:
        try:
            with Image.open(destination) as existing:
                existing.verify()
            return
        except (OSError, SyntaxError):
            pass
    item = alpha_crop(Image.open(source))
    scale = min(224 / item.height, 168 / item.width)
    item = item.resize((max(1, round(item.width * scale)), max(1, round(item.height * scale))), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (CELL, CELL))
    canvas.alpha_composite(item, ((CELL - item.width) // 2, 12))
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_suffix(".tmp.png")
    canvas.save(temporary, optimize=True)
    temporary.replace(destination)


def build_attack_sockets(sockets: dict) -> None:
    # Timeline is authored once on the approved 256x256 skeleton. Every weapon
    # skin reuses it; armor never owns a weapon pixel.
    deltas = [
        ((0, 0, -8), (0, 0, 8)),
        ((-6, -10, -48), (0, 2, 38)),
        ((16, 10, -88), (-18, -10, 76)),
        ((20, -5, -118), (-22, -24, 104)),
        ((28, -18, -146), (-28, -18, 142)),
        ((10, -4, -72), (-2, -10, 82)),
        ((0, -3, -94), (4, -3, 92)),
        ((0, 0, -8), (0, 0, 8)),
    ]
    attack = {}
    for direction in DIRECTIONS:
        base = sockets["states"]["idle"][direction][0]
        frames = []
        for left_delta, right_delta in deltas:
            frame = {"pivot": list(PIVOT), "foot_contact_y": 242}
            for key, delta in (("hand_left", left_delta), ("hand_right", right_delta)):
                hand = base[key]
                frame[key] = {
                    "xy": [hand["xy"][0] + delta[0], hand["xy"][1] + delta[1]],
                    "rotationDeg": hand["rotationDeg"] + delta[2],
                    "z": hand["z"],
                }
            frames.append(frame)
        attack[direction] = frames
    sockets["states"]["attack"] = attack


def fit_sockets_to_appearances(sockets: dict) -> None:
    """Snap shared sockets to the nearest palm-region silhouette consensus."""
    for state in STATES:
        atlases = [
            np.asarray(Image.open(OUT / "armor" / armor_id / f"{state}-8dir-8frame.png").convert("RGBA").getchannel("A")) > 20
            for armor_id, _ in ARMORS
        ]
        for row, direction in enumerate(DIRECTIONS):
            for col, frame in enumerate(sockets["states"][state][direction]):
                occupancy = sum(
                    atlas[row * CELL:(row + 1) * CELL, col * CELL:(col + 1) * CELL].astype(np.uint8)
                    for atlas in atlases
                )
                for hand_key in ("hand_left", "hand_right"):
                    hand = frame[hand_key]
                    origin_x, origin_y = hand["xy"]
                    radius = 22 if state == "run" else 16
                    best_score = -1e9
                    best = (origin_x, origin_y)
                    for y in range(max(0, origin_y - radius), min(CELL, origin_y + radius + 1)):
                        for x in range(max(0, origin_x - radius), min(CELL, origin_x + radius + 1)):
                            distance = ((x - origin_x) ** 2 + (y - origin_y) ** 2) ** .5
                            if distance > radius:
                                continue
                            score = occupancy[y, x] * 5.0 - distance
                            if score > best_score:
                                best_score = score
                                best = (x, y)
                    hand["xy"] = [best[0], best[1]]


def main() -> None:
    body_dir = OUT / "body_base"
    for state, source in BASE_SOURCES.items():
        normalize_grid(source, body_dir / f"{state}-8dir-8frame.png", 226 if state != "run" else 220)

    for armor_id, _ in ARMORS:
        for state in STATES:
            normalize_grid(
                RAW / "armor" / f"{armor_id}-{state}.png",
                OUT / "armor" / armor_id / f"{state}-8dir-8frame.png",
                226 if state != "run" else 220,
                detect_grid=True,
            )

    for weapon_id, _, _ in WEAPONS:
        normalize_weapon(RAW / "weapons" / f"{weapon_id}.png", OUT / "weapons" / f"{weapon_id}-master.png")

    with (ROOT / "public/game/assets/magic-demo/sockets.json").open(encoding="utf-8") as handle:
        sockets = json.load(handle)
    # The canonical appearances are centered per frame. Pull the legacy hand
    # sockets inward so they track the palms instead of the old wider silhouette.
    for state, inset in (("idle", 3), ("walk", 9), ("run", 18)):
        for direction in DIRECTIONS:
            for frame in sockets["states"][state][direction]:
                frame["hand_left"]["xy"][0] += inset
                frame["hand_right"]["xy"][0] -= inset
                if state == "run" and direction in ("northeast", "east", "southeast"):
                    frame["hand_left"]["xy"][0] += 8
                    frame["hand_left"]["z"] = "back"
                elif state == "run" and direction in ("southwest", "west", "northwest"):
                    frame["hand_right"]["xy"][0] -= 8
                    frame["hand_right"]["z"] = "back"
    build_attack_sockets(sockets)
    fit_sockets_to_appearances(sockets)
    sockets["states"] = {state: sockets["states"][state] for state in STATES}
    with (OUT / "sockets.json").open("w", encoding="utf-8") as handle:
        json.dump(sockets, handle, ensure_ascii=False, indent=2)
        handle.write("\n")

    manifest = {
        "id": "magic_modular_canonical_v1",
        "cell": [CELL, CELL],
        "layout": {"columns": GRID, "rows": GRID, "rowOrder": DIRECTIONS, "framesPerDirection": GRID},
        "pivot": list(PIVOT),
        "renderOrder": ["body_base_or_armor_appearance", "weapon_left", "weapon_right", "hand_grip", "skill_vfx"],
        "states": {state: {"fps": {"idle": 5, "walk": 7, "run": 11, "attack": 10}[state]} for state in STATES},
        "armorMode": "appearance-replacement",
        "bodyBase": {state: f"body_base/{state}-8dir-8frame.png" for state in STATES},
        "armors": [
            {
                "tier": tier,
                "id": armor_id,
                "name": name,
                "states": {state: f"armor/{armor_id}/{state}-8dir-8frame.png" for state in STATES},
            }
            for tier, (armor_id, name) in enumerate(ARMORS, 1)
        ],
        "weapons": [
            {
                "tier": tier,
                "id": weapon_id,
                "name": name,
                "master": f"weapons/{weapon_id}-master.png",
                "displayPx": display_px,
                "gripRatio": 0.12,
                "dualWield": True,
            }
            for tier, (weapon_id, name, display_px) in enumerate(WEAPONS, 1)
        ],
        "sockets": "sockets.json",
        "notes": [
            "Armor appearance and weapon textures are independent runtime selections.",
            "The same socket timelines are shared by all seven weapon families.",
            "No weapon pixels are baked into body_base or armor atlases.",
        ],
    }
    with (OUT / "manifest.json").open("w", encoding="utf-8") as handle:
        json.dump(manifest, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


if __name__ == "__main__":
    main()
