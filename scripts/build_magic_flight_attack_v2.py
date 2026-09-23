#!/usr/bin/env python3
"""Build the modular southeast airborne Fire Slash review slice."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps
import numpy as np
from scipy import ndimage


ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "artifacts/magic-flight-v2/raw"
REVIEW = ROOT / "artifacts/magic-flight-v2/review"
OUT = ROOT / "public/game/assets/magic-runtime/flight_attack"
CELL = 256
FRAMES = 8
FRAME_MS = 105
HANDS = [
    ((60, 124), (204, 140)),
    ((83, 94), (217, 142)),
    ((88, 65), (217, 142)),
    ((99, 76), (213, 140)),
    ((119, 59), (244, 148)),
    ((54, 77), (218, 111)),
    ((89, 81), (216, 130)),
    ((72, 119), (200, 129)),
]
WEAPON_ANGLES = [
    (-15, 15),
    (-70, 25),
    (-100, 35),
    (-110, 55),
    (-120, -70),
    (-65, 110),
    (-40, 35),
    (-15, 15),
]


def isolate_4x2(image: Image.Image) -> list[Image.Image]:
    """Assign whole alpha components to cells before cropping, preventing edge cuts."""
    rgba = image.convert("RGBA")
    array = np.asarray(rgba)
    alpha = array[:, :, 3]
    labels, count = ndimage.label(alpha > 12, structure=np.ones((3, 3), dtype=np.uint8))
    centers = [
        ((col + .5) * rgba.width / 4, (row + .5) * rgba.height / 2)
        for row in range(2) for col in range(4)
    ]
    assigned = [[] for _ in range(FRAMES)]
    for label in range(1, count + 1):
        ys, xs = np.where(labels == label)
        if len(xs) < 4:
            continue
        cx, cy = float(xs.mean()), float(ys.mean())
        index = min(range(FRAMES), key=lambda i: (cx - centers[i][0]) ** 2 + (cy - centers[i][1]) ** 2)
        assigned[index].append(label)

    frames = []
    crop_size = 520
    for index, (cx, cy) in enumerate(centers):
        isolated = np.zeros_like(array)
        if assigned[index]:
            mask = np.isin(labels, assigned[index])
            isolated[mask] = array[mask]
        layer = Image.fromarray(isolated, mode="RGBA")
        left, top = round(cx - crop_size / 2), round(cy - crop_size / 2)
        layer = layer.crop((left, top, left + crop_size, top + crop_size))
        frames.append(layer.resize((CELL, CELL), Image.Resampling.LANCZOS))
    return frames


def normalize_layers(*layers: Image.Image):
    # Every generated source uses the same 4x2 canvas. Resize the complete cells
    # together so the action keeps one stable center and every modular layer aligns.
    return [layer.resize((CELL, CELL), Image.Resampling.LANCZOS) for layer in layers]


def strip(frames: list[Image.Image]) -> Image.Image:
    result = Image.new("RGBA", (CELL * FRAMES, CELL))
    for index, frame in enumerate(frames):
        result.alpha_composite(frame, (index * CELL, 0))
    return result


def grip_layer(body: Image.Image, index: int) -> Image.Image:
    result = Image.new("RGBA", (CELL, CELL))
    for x, y in HANDS[index]:
        radius = 10
        patch = body.crop((x - radius, y - radius, x + radius, y + radius))
        mask = Image.new("L", patch.size)
        ImageDraw.Draw(mask).ellipse((2, 2, patch.width - 3, patch.height - 3), fill=255)
        patch.putalpha(Image.composite(patch.getchannel("A"), Image.new("L", patch.size), mask))
        result.alpha_composite(patch, (x - radius, y - radius))
    return result


def weapon_at_socket(master: Image.Image, xy: tuple[int, int], angle: float,
                     mirror: bool) -> Image.Image:
    """Place the authored grip pivot exactly at a hand socket, then rotate."""
    display = 112
    item = master.resize((display, display), Image.Resampling.LANCZOS)
    pivot_x = round(128 / 256 * display)
    pivot_y = round(45 / 256 * display)
    if mirror:
        item = ImageOps.mirror(item)
        pivot_x = display - 1 - pivot_x
    stage_size = display * 4
    pivot = stage_size // 2
    stage = Image.new("RGBA", (stage_size, stage_size))
    stage.alpha_composite(item, (pivot - pivot_x, pivot - pivot_y))
    stage = stage.rotate(angle, Image.Resampling.BICUBIC, center=(pivot, pivot))
    layer = Image.new("RGBA", (CELL, CELL))
    layer.alpha_composite(stage, (round(xy[0] - pivot), round(xy[1] - pivot)))
    return layer


def weapon_layer(master: Image.Image, index: int) -> Image.Image:
    left, right = HANDS[index]
    left_angle, right_angle = WEAPON_ANGLES[index]
    result = Image.new("RGBA", (CELL, CELL))
    result.alpha_composite(weapon_at_socket(master, left, left_angle, False))
    result.alpha_composite(weapon_at_socket(master, right, right_angle, True))
    return result


def composite(wing: list[Image.Image], body: list[Image.Image], weapon: list[Image.Image],
              grip: list[Image.Image], vfx: list[Image.Image]) -> list[Image.Image]:
    result = []
    for wing_frame, body_frame, weapon_frame, grip_frame, vfx_frame in zip(wing, body, weapon, grip, vfx):
        frame = Image.new("RGBA", (CELL, CELL))
        frame.alpha_composite(wing_frame)
        frame.alpha_composite(body_frame)
        frame.alpha_composite(weapon_frame)
        frame.alpha_composite(grip_frame)
        frame.alpha_composite(vfx_frame)
        result.append(frame)
    return result


def composite_without_vfx(wing: list[Image.Image], body: list[Image.Image],
                          weapon: list[Image.Image], grip: list[Image.Image]) -> list[Image.Image]:
    empty = [Image.new("RGBA", (CELL, CELL)) for _ in range(FRAMES)]
    return composite(wing, body, weapon, grip, empty)


def save_gif(frames: list[Image.Image], path: Path):
    pages = []
    for frame in frames:
        bg = Image.new("RGBA", (CELL, CELL), (22, 16, 29, 255))
        bg.alpha_composite(frame)
        pages.append(bg.convert("P", palette=Image.Palette.ADAPTIVE, colors=255))
    pages[0].save(path, save_all=True, append_images=pages[1:], duration=FRAME_MS,
                  loop=0, disposal=2)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    REVIEW.mkdir(parents=True, exist_ok=True)
    body_raw = isolate_4x2(Image.open(RAW / "body-ma-thuat-fly-fire-slash-4x2.png"))
    dw_raw = isolate_4x2(Image.open(RAW / "wing-dw-tier1-fire-slash-4x2.png"))
    mg_raw = isolate_4x2(Image.open(RAW / "wing-mg-tier1-fire-slash-4x2.png"))
    vfx_raw = isolate_4x2(Image.open(RAW / "vfx-fire-slash-4x2.png"))
    body, wing_dw, wing_mg, vfx = [], [], [], []
    for layers in zip(body_raw, dw_raw, mg_raw, vfx_raw):
        b, dw, mg, fx = normalize_layers(*layers)
        body.append(b); wing_dw.append(dw); wing_mg.append(mg); vfx.append(fx)
    master = Image.open(ROOT / "public/game/assets/magic-runtime/weapons/ao_anh_dao-master.png").convert("RGBA")
    weapon = [weapon_layer(master, index) for index in range(FRAMES)]
    grip = [grip_layer(frame, index) for index, frame in enumerate(body)]
    comp_dw = composite(wing_dw, body, weapon, grip, vfx)
    comp_mg = composite(wing_mg, body, weapon, grip, vfx)

    strip(body).save(OUT / "body-ma-thuat-fire-slash-se-8frame.png", optimize=True)
    strip(wing_dw).save(OUT / "wing-dw-tier1-fire-slash-se-8frame.png", optimize=True)
    strip(wing_mg).save(OUT / "wing-mg-tier1-fire-slash-se-8frame.png", optimize=True)
    strip(weapon).save(OUT / "weapon-dual-ao-anh-fire-slash-se-8frame.png", optimize=True)
    strip(grip).save(OUT / "hand-grip-fire-slash-se-8frame.png", optimize=True)
    strip(vfx).save(OUT / "vfx-fire-slash-se-8frame.png", optimize=True)
    strip(comp_dw).save(OUT / "composite-body-wing1-dw-ao-anh.png", optimize=True)
    strip(comp_mg).save(OUT / "composite-body-wing1-mg-ao-anh.png", optimize=True)
    save_gif(comp_dw, REVIEW / "magic-fire-slash-air-wing1-dw.gif")
    save_gif(comp_mg, REVIEW / "magic-fire-slash-air-wing1-mg.gif")

    preview = Image.new("RGBA", (1040, 650), (22, 16, 29, 255))
    draw = ImageDraw.Draw(preview)
    bold = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 26)
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
    draw.text((24, 18), "MAGIC · AIRBORNE FIRE SLASH · ISOMETRIC SE", font=bold,
              fill=(255, 226, 160, 255))
    draw.text((24, 54), "Body xoay theo mục tiêu · chân co bất đối xứng · cánh giữ lực sau vai",
              font=font, fill=(211, 196, 170, 255))
    for row, (label, frames) in enumerate((("WING 1 DW", comp_dw), ("WING 1 MG", comp_mg))):
        y = 92 + row * 276
        draw.rounded_rectangle((20, y, 1020, y + 252), radius=18,
                               fill=(31, 23, 41, 255), outline=(108, 79, 38, 255), width=2)
        draw.text((38, y + 14), label, font=bold, fill=(255, 226, 160, 255))
        for slot, index in enumerate((0, 3, 4, 7)):
            sprite = frames[index].resize((210, 210), Image.Resampling.LANCZOS)
            x = 160 + slot * 212
            preview.alpha_composite(sprite, (x, y + 30))
            draw.text((x + 65, y + 218), f"F{index + 1}", font=font,
                      fill=(211, 196, 170, 255))
    preview.save(REVIEW / "magic-airborne-fire-slash-wing-comparison.png", optimize=True)

    # Large grip review: same body and weapon transforms, only the wing layer changes.
    transparent_wing = [Image.new("RGBA", (CELL, CELL)) for _ in range(FRAMES)]
    review_sets = (
        ("KHÔNG WING", composite_without_vfx(transparent_wing, body, weapon, grip)),
        ("WING 1 DW", composite_without_vfx(wing_dw, body, weapon, grip)),
        ("WING 1 MG", composite_without_vfx(wing_mg, body, weapon, grip)),
    )
    save_gif(review_sets[0][1], REVIEW / "magic-dual-grip-no-wing.gif")
    save_gif(review_sets[1][1], REVIEW / "magic-dual-grip-wing1-dw.gif")
    save_gif(review_sets[2][1], REVIEW / "magic-dual-grip-wing1-mg.gif")
    grip_review = Image.new("RGBA", (1260, 820), (22, 16, 29, 255))
    review_draw = ImageDraw.Draw(grip_review)
    review_draw.text((30, 22), "MAGIC · SO SÁNH GRIP SONG ĐAO", font=bold,
                     fill=(255, 226, 160, 255))
    review_draw.text((30, 58), "Chuôi khóa vào lòng bàn tay · vũ khí xoay theo cổ tay · wing là layer rời",
                     font=font, fill=(211, 196, 170, 255))
    for col, (label, frames) in enumerate(review_sets):
        x0 = 24 + col * 408
        review_draw.rounded_rectangle((x0, 96, x0 + 390, 796), radius=18,
                                      fill=(31, 23, 41, 255), outline=(108, 79, 38, 255), width=2)
        review_draw.text((x0 + 22, 114), label, font=bold, fill=(255, 226, 160, 255))
        for row, (frame_index, caption) in enumerate(((0, "GIỮ KIẾM"), (4, "GIỮA ĐÒN CHÉM"))):
            sprite = frames[frame_index].resize((340, 340), Image.Resampling.LANCZOS)
            grip_review.alpha_composite(sprite, (x0 + 25, 150 + row * 310))
            review_draw.text((x0 + 128, 438 + row * 310), caption, font=font,
                             fill=(211, 196, 170, 255))
    grip_review.save(REVIEW / "magic-dual-weapon-grip-no-wing-vs-wings.png", optimize=True)

    manifest = {
        "id": "magic_airborne_fire_slash_v2",
        "direction": "southeast",
        "frames": FRAMES,
        "frameDurationMs": FRAME_MS,
        "loop": False,
        "cell": [CELL, CELL],
        "renderOrder": ["wing_back", "body_armor", "weapon_left", "weapon_right", "hand_grip_front", "skill_vfx"],
        "status": "review-ready modular southeast slice",
        "weaponHands": [[list(left), list(right)] for left, right in HANDS],
        "weaponAngles": [list(pair) for pair in WEAPON_ANGLES],
        "weaponGripPivot": [128, 45],
        "sheets": {
            "body": "body-ma-thuat-fire-slash-se-8frame.png",
            "wing_dw_tier1": "wing-dw-tier1-fire-slash-se-8frame.png",
            "wing_mg_tier1": "wing-mg-tier1-fire-slash-se-8frame.png",
            "weapon": "weapon-dual-ao-anh-fire-slash-se-8frame.png",
            "handGrip": "hand-grip-fire-slash-se-8frame.png",
            "skill_vfx": "vfx-fire-slash-se-8frame.png"
        }
    }
    (OUT / "flight-attack-manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
