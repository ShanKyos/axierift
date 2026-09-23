#!/usr/bin/env python3
"""Build modular Magic true-flight layers with Wing 1 DW and Wing 1 MG."""

from __future__ import annotations

import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
import numpy as np
from scipy import ndimage


ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "artifacts/magic-flight-v1/raw"
RUNTIME = ROOT / "public/game/assets/magic-runtime"
OUT = RUNTIME / "flight"
REVIEW = ROOT / "artifacts/magic-flight-v1/review"
CELL = 256
FRAMES = 8
FRAME_MS = 175
HANDS = [
    ((80, 132), (174, 132)),
    ((81, 136), (183, 137)),
    ((73, 135), (178, 135)),
    ((79, 133), (174, 133)),
    ((76, 136), (178, 136)),
    ((77, 134), (175, 132)),
    ((72, 138), (184, 134)),
    ((77, 136), (178, 133)),
]


def split_4x2(image: Image.Image) -> list[Image.Image]:
    return [
        image.crop((round(col * image.width / 4), round(row * image.height / 2),
                    round((col + 1) * image.width / 4), round((row + 1) * image.height / 2)))
        for row in range(2) for col in range(4)
    ]


def split_strip(image: Image.Image) -> list[Image.Image]:
    return [image.crop((index * CELL, 0, (index + 1) * CELL, CELL)) for index in range(FRAMES)]


def main_component(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = np.asarray(rgba.getchannel("A"))
    labels, count = ndimage.label(alpha > 20, structure=np.ones((3, 3), dtype=np.uint8))
    if count:
        areas = np.bincount(labels.ravel()); areas[0] = 0
        keep = int(areas.argmax())
        rgba.putalpha(Image.fromarray(np.where(labels == keep, alpha, 0).astype(np.uint8), mode="L"))
    box = rgba.getchannel("A").getbbox()
    if not box:
        raise RuntimeError("Empty flight body frame")
    return rgba.crop(box)


def normalize_body(image: Image.Image) -> Image.Image:
    body = main_component(image)
    target_h = 205
    scale = min(target_h / body.height, 184 / body.width)
    body = body.resize((round(body.width * scale), round(body.height * scale)), Image.Resampling.LANCZOS)
    frame = Image.new("RGBA", (CELL, CELL))
    frame.alpha_composite(body, ((CELL - body.width) // 2, 27))
    return frame


def normalize_wing(frame: Image.Image) -> Image.Image:
    # Raise/lower only as a complete layer: the hinge stays at upper shoulder level.
    result = Image.new("RGBA", (CELL, CELL))
    result.alpha_composite(frame.convert("RGBA"), (0, 14))
    return result


def weapon_at_socket(master: Image.Image, xy: tuple[int, int], angle: float, mirror: bool) -> Image.Image:
    display = 112
    item = master.resize((display, display), Image.Resampling.LANCZOS)
    if mirror:
        item = ImageOps.mirror(item)
    stage_size = display * 3
    stage = Image.new("RGBA", (stage_size, stage_size))
    pivot = stage_size // 2
    stage.alpha_composite(item, (pivot - display // 2, round(pivot - display * .12)))
    stage = stage.rotate(-angle, Image.Resampling.BICUBIC, center=(pivot, pivot))
    layer = Image.new("RGBA", (CELL, CELL))
    layer.alpha_composite(stage, (round(xy[0] - pivot), round(xy[1] - pivot)))
    return layer


def weapon_layer(master: Image.Image, index: int) -> Image.Image:
    left, right = HANDS[index]
    layer = Image.new("RGBA", (CELL, CELL))
    layer.alpha_composite(weapon_at_socket(master, left, -17, True))
    layer.alpha_composite(weapon_at_socket(master, right, 17, False))
    return layer


def grip_layer(body: Image.Image, index: int) -> Image.Image:
    result = Image.new("RGBA", (CELL, CELL))
    for x, y in HANDS[index]:
        radius = 12
        patch = body.crop((x - radius, y - radius, x + radius, y + radius))
        mask = Image.new("L", patch.size)
        ImageDraw.Draw(mask).ellipse((2, 1, patch.width - 3, patch.height - 2), fill=255)
        patch.putalpha(Image.composite(patch.getchannel("A"), Image.new("L", patch.size), mask))
        result.alpha_composite(patch, (x - radius, y - radius))
    return result


def strip(frames: list[Image.Image]) -> Image.Image:
    result = Image.new("RGBA", (CELL * FRAMES, CELL))
    for index, frame in enumerate(frames):
        result.alpha_composite(frame, (index * CELL, 0))
    return result


def composite(body, wing, weapon, grip) -> list[Image.Image]:
    frames = []
    for index in range(FRAMES):
        frame = Image.new("RGBA", (CELL, CELL))
        frame.alpha_composite(wing[index])
        frame.alpha_composite(body[index])
        frame.alpha_composite(weapon[index])
        frame.alpha_composite(grip[index])
        frames.append(frame)
    return frames


def preview_background() -> Image.Image:
    bg = Image.new("RGBA", (CELL, CELL), (22, 16, 29, 255))
    draw = ImageDraw.Draw(bg)
    draw.ellipse((74, 220, 182, 241), fill=(0, 0, 0, 70))
    return bg


def save_gif(frames: list[Image.Image], path: Path) -> None:
    pages = []
    for frame in frames:
        page = preview_background(); page.alpha_composite(frame)
        pages.append(page.convert("P", palette=Image.Palette.ADAPTIVE, colors=255))
    pages[0].save(path, save_all=True, append_images=pages[1:], duration=FRAME_MS, loop=0, disposal=2)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True); REVIEW.mkdir(parents=True, exist_ok=True)
    body = [normalize_body(frame) for frame in split_4x2(Image.open(RAW / "body-ma-thuat-fly-4x2.png"))]
    wing_dw = [normalize_wing(frame) for frame in split_strip(Image.open(RAW / "wing-dw-tier1-source.png"))]
    wing_mg = [normalize_wing(frame) for frame in split_strip(Image.open(RAW / "wing-mg-tier1-source.png"))]
    master = Image.open(RUNTIME / "weapons/ao_anh_dao-master.png").convert("RGBA")
    weapons = [weapon_layer(master, index) for index in range(FRAMES)]
    grips = [grip_layer(body[index], index) for index in range(FRAMES)]
    comp_dw = composite(body, wing_dw, weapons, grips)
    comp_mg = composite(body, wing_mg, weapons, grips)

    strip(body).save(OUT / "body-ma-thuat-true-fly-south-8frame.png", optimize=True)
    strip(wing_dw).save(OUT / "wing-dw-tier1-fly-south-8frame.png", optimize=True)
    strip(wing_mg).save(OUT / "wing-mg-tier1-fly-south-8frame.png", optimize=True)
    strip(weapons).save(OUT / "weapon-dual-ao-anh-fly-south-8frame.png", optimize=True)
    strip(grips).save(OUT / "hand-grip-fly-south-8frame.png", optimize=True)
    strip(comp_dw).save(OUT / "composite-ma-thuat-wing1-dw.png", optimize=True)
    strip(comp_mg).save(OUT / "composite-ma-thuat-wing1-mg.png", optimize=True)
    save_gif(comp_dw, REVIEW / "magic-flight-wing1-dw.gif")
    save_gif(comp_mg, REVIEW / "magic-flight-wing1-mg.gif")

    comparison = Image.new("RGBA", (1050, 660), (22, 16, 29, 255))
    draw = ImageDraw.Draw(comparison)
    font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    bold_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    font = ImageFont.truetype(font_path, 18)
    label_font = ImageFont.truetype(bold_path, 23)
    title_font = ImageFont.truetype(bold_path, 27)
    draw.text((28, 18), "MAGIC TRUE FLIGHT · WING 1 DW / WING 1 MG", font=title_font,
              fill=(255, 226, 160, 255))
    draw.text((28, 53), "Gốc cánh ngang vai · 8 frame · 175 ms/frame · song đao bám lòng bàn tay",
              font=font, fill=(211, 196, 170, 255))
    for row, (label, frames) in enumerate((("WING 1 DW", comp_dw), ("WING 1 MG", comp_mg))):
        y0 = 90 + row * 278
        draw.rounded_rectangle((22, y0, 1028, y0 + 252), radius=18,
                               fill=(31, 23, 41, 255), outline=(108, 79, 38, 255), width=2)
        draw.text((42, y0 + 14), label, font=label_font, fill=(255, 226, 160, 255))
        for slot, index in enumerate((0, 3, 5)):
            x = 190 + slot * 280
            sprite = frames[index].resize((220, 220), Image.Resampling.LANCZOS)
            comparison.alpha_composite(sprite, (x, y0 + 24))
            draw.text((x + 8, y0 + 218), f"frame {index + 1}", font=font,
                      fill=(211, 196, 170, 255))
    comparison.save(REVIEW / "magic-flight-wing1-dw-vs-mg.png", optimize=True)

    manifest = {
        "id": "magic_true_flight_wing1_v1",
        "direction": "south",
        "frames": FRAMES,
        "frameDurationMs": FRAME_MS,
        "loop": True,
        "cell": [CELL, CELL],
        "renderOrder": ["wing_back", "body_armor", "weapon_left_right", "hand_grip_front", "skill_vfx"],
        "wingRoot": [128, 70],
        "wingScaleRule": "span slightly larger than body; no feather/membrane below hips",
        "bodyMotion": "stable torso; small hover; bent legs; cloak reacts gently",
        "weaponHands": [[list(left), list(right)] for left, right in HANDS],
        "sheets": {
            "body": "body-ma-thuat-true-fly-south-8frame.png",
            "wing_dw_tier1": "wing-dw-tier1-fly-south-8frame.png",
            "wing_mg_tier1": "wing-mg-tier1-fly-south-8frame.png",
            "weapon": "weapon-dual-ao-anh-fly-south-8frame.png",
            "handGrip": "hand-grip-fly-south-8frame.png"
        }
    }
    (OUT / "flight-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    runtime_manifest_path = RUNTIME / "manifest.json"
    runtime_manifest = json.loads(runtime_manifest_path.read_text(encoding="utf-8"))
    runtime_manifest["flight"] = {"manifest": "flight/flight-manifest.json", "wingOptions": ["wing_dw_tier1", "wing_mg_tier1"]}
    runtime_manifest_path.write_text(json.dumps(runtime_manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
