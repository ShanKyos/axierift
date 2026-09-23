"""Build palm/gauntlet occlusion layers for swappable movement weapons."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
MAGIC = ROOT / "public" / "game" / "assets" / "magic-demo"
CELL = 256
DIRECTIONS = ("south", "southwest", "west", "northwest", "north", "northeast", "east", "southeast")


def extract_grips(sheet_path: Path, output_path: Path, state: str, directions: tuple[str, ...]) -> None:
    sockets = json.loads((MAGIC / "sockets.json").read_text())
    source = Image.open(sheet_path).convert("RGBA")
    output = Image.new("RGBA", source.size)

    for row, direction in enumerate(directions):
        for frame, pose in enumerate(sockets["states"][state][direction]):
            frame_x = frame * CELL
            frame_y = row * CELL
            for key in ("hand_left", "hand_right"):
                x, y = pose[key]["xy"]
                # Includes the closed fist and a short piece of cuff. Transparent
                # source pixels remain transparent, so the mask cannot cover VFX.
                box = (
                    max(frame_x, frame_x + x - 12),
                    max(frame_y, frame_y + y - 15),
                    min(frame_x + CELL, frame_x + x + 13),
                    min(frame_y + CELL, frame_y + y + 16),
                )
                output.alpha_composite(source.crop(box), box[:2])

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output.save(output_path, optimize=True)


def main() -> None:
    movement = MAGIC / "grips" / "movement"
    for state in ("idle", "walk", "run"):
        extract_grips(
            MAGIC / f"spellblade-{state}-8dir.png",
            movement / f"grip-base-{state}-8dir.png",
            state,
            DIRECTIONS,
        )

    armor_dir = MAGIC / "armor"
    for armor in armor_dir.glob("appearance-tier-*-walk-south-8frame.png"):
        armor_id = armor.name.removeprefix("appearance-tier-").removesuffix("-walk-south-8frame.png")
        extract_grips(
            armor,
            movement / f"grip-{armor_id}-walk-south-8frame.png",
            "walk",
            ("south",),
        )


if __name__ == "__main__":
    main()
