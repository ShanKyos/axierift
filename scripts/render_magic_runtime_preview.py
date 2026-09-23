#!/usr/bin/env python3
"""Render an offline proof GIF from the same modular runtime files as the demo."""

from __future__ import annotations

import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
RUNTIME = ROOT / "public/game/assets/magic-runtime"
OUT = ROOT / "artifacts/magic-canonical-runtime/review"
CELL = 256
STATES = ("idle", "walk", "run", "attack")
DIRECTIONS = ("south", "southwest", "west", "northwest", "north", "northeast", "east", "southeast")


def paste_weapon(canvas: Image.Image, master: Image.Image, hand: dict, display: int, left: bool) -> None:
    item = master.resize((display, display), Image.Resampling.LANCZOS)
    if left:
        item = ImageOps.mirror(item)
    stage_size = display * 3
    stage = Image.new("RGBA", (stage_size, stage_size))
    pivot = stage_size // 2
    stage.alpha_composite(item, (pivot - display // 2, round(pivot - display * .12)))
    stage = stage.rotate(-hand["rotationDeg"], Image.Resampling.BICUBIC, center=(pivot, pivot))
    canvas.alpha_composite(stage, (round(hand["xy"][0] - pivot), round(hand["xy"][1] - pivot)))


def compose(atlas: Image.Image, weapon: Image.Image, socket: dict, col: int, row: int, display: int) -> Image.Image:
    body = atlas.crop((col * CELL, row * CELL, (col + 1) * CELL, (row + 1) * CELL))
    result = Image.new("RGBA", (CELL, CELL))
    for key, left in (("hand_left", True), ("hand_right", False)):
        if socket[key]["z"] == "back":
            paste_weapon(result, weapon, socket[key], display, left)
    result.alpha_composite(body)
    for key, left in (("hand_left", True), ("hand_right", False)):
        if socket[key]["z"] == "front":
            paste_weapon(result, weapon, socket[key], display, left)
            x, y = socket[key]["xy"]
            radius = 7
            patch = body.crop((x - radius, y - radius, x + radius, y + radius))
            mask = Image.new("L", patch.size)
            ImageDraw.Draw(mask).ellipse((0, 0, patch.width - 1, patch.height - 1), fill=255)
            result.paste(patch, (x - radius, y - radius), Image.composite(patch, Image.new("RGBA", patch.size), mask))
    return result


def main() -> None:
    manifest = json.loads((RUNTIME / "manifest.json").read_text(encoding="utf-8"))
    sockets = json.loads((RUNTIME / "sockets.json").read_text(encoding="utf-8"))
    armor = next(item for item in manifest["armors"] if item["id"] == "ma_thuat")
    weapon_data = next(item for item in manifest["weapons"] if item["id"] == "ao_anh_dao")
    weapon = Image.open(RUNTIME / weapon_data["master"]).convert("RGBA")
    atlases = {state: Image.open(RUNTIME / armor["states"][state]).convert("RGBA") for state in STATES}
    font = ImageFont.load_default()
    frames = []
    for row, direction in enumerate(DIRECTIONS):
        for col in range(8):
            board = Image.new("RGBA", (4 * 144, 182), (23, 17, 30, 255))
            draw = ImageDraw.Draw(board)
            for state_index, state in enumerate(STATES):
                sprite = compose(
                    atlases[state], weapon, sockets["states"][state][direction][col], col, row,
                    weapon_data["displayPx"],
                ).resize((136, 136), Image.Resampling.LANCZOS)
                x = state_index * 144 + 4
                board.alpha_composite(sprite, (x, 26))
                draw.text((x + 4, 7), state.upper(), font=font, fill=(255, 226, 160, 255))
            draw.text((8, 165), f"{direction.upper()} · frame {col + 1}/8 · Ma Thuat + Ao Anh Dao", font=font, fill=(220, 204, 175, 255))
            frames.append(board.convert("P", palette=Image.Palette.ADAPTIVE, colors=255))
    OUT.mkdir(parents=True, exist_ok=True)
    frames[0].save(OUT / "magic-modular-4states-8dir.gif", save_all=True, append_images=frames[1:], duration=135, loop=0, disposal=2)

    weapon_order = (6, 0, 4, 2, 5, 1, 3)
    contact = Image.new("RGBA", (7 * 150, 4 * 166), (23, 17, 30, 255))
    draw = ImageDraw.Draw(contact)
    for col, armor_data in enumerate(manifest["armors"]):
        weapon_data = manifest["weapons"][weapon_order[col]]
        weapon = Image.open(RUNTIME / weapon_data["master"]).convert("RGBA")
        for row, state in enumerate(STATES):
            atlas = Image.open(RUNTIME / armor_data["states"][state]).convert("RGBA")
            direction_index = (col + row * 2) % 8
            frame_index = (col * 3 + row) % 8
            direction = DIRECTIONS[direction_index]
            sprite = compose(
                atlas, weapon, sockets["states"][state][direction][frame_index], frame_index, direction_index,
                weapon_data["displayPx"],
            ).resize((142, 142), Image.Resampling.LANCZOS)
            x, y = col * 150 + 4, row * 166 + 19
            contact.alpha_composite(sprite, (x, y))
            draw.text((x + 3, row * 166 + 4), state.upper(), font=font, fill=(255, 226, 160, 255))
            if row == 3:
                draw.text((x + 2, y + 144), f"T{armor_data['tier']} + W{weapon_data['tier']}", font=font, fill=(220, 204, 175, 255))
    contact.save(OUT / "magic-random-armor-weapon-contact.png", optimize=True)


if __name__ == "__main__":
    main()
