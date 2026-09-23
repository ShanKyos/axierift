"""Render review media for the local Spellblade movement prototype."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
GAME = ROOT / "public" / "game"
ASSETS = GAME / "assets"
MAGIC = ASSETS / "magic-demo"
OUT = ROOT / "artifacts" / "magic-mix-demo"
CELL = 256
DRAW = 132
HAND_SPREAD = 1
HAND_LIFT = 0
DIRECTIONS = ["south", "southwest", "west", "northwest", "north", "northeast", "east", "southeast"]
STATES = (("idle", 6), ("walk", 8), ("run", 13))


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")]
    for candidate in candidates:
        try:
            return ImageFont.truetype(str(candidate), size)
        except OSError:
            pass
    return ImageFont.load_default()


def alpha_paste(dst: Image.Image, src: Image.Image, xy: tuple[int, int]) -> None:
    dst.alpha_composite(src, xy)


def scene_base(size=(1280, 720)) -> Image.Image:
    canvas = Image.new("RGBA", size, "#6b813c")
    grass = Image.open(ASSETS / "iso" / "nen_co1.png").convert("RGBA")
    road = Image.open(ASSETS / "iso" / "nen_duong1.png").convert("RGBA")
    for y in range(-128, size[1] + 128, 128):
        for x in range(-256, size[0] + 256, 256):
            road_band = abs((y + size[1] * .15) - (x * .28 + size[1] * .35)) < 105
            alpha_paste(canvas, road if road_band else grass, (x, y))
    for name, x, y, w in [
        ("cay_to2.png", 60, 55, 190), ("cay_to2.png", 1040, 45, 190),
        ("buicay1.png", 295, 110, 100), ("buicay1.png", 915, 235, 92),
        ("da2.png", 430, 165, 58), ("da2.png", 980, 520, 68),
    ]:
        im = Image.open(ASSETS / "iso" / name).convert("RGBA")
        h = round(im.height * w / im.width)
        alpha_paste(canvas, im.resize((w, h), Image.Resampling.LANCZOS), (x, y))
    return canvas


def weapon_at(hand: dict, left: bool, weapon: Image.Image, grip_ratio: float = .17) -> Image.Image:
    size = 62
    blade = weapon.resize((size, size), Image.Resampling.LANCZOS)
    if left:
        blade = blade.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    angle = -(hand.get("rotationDeg", 0) + (-3 if left else 3))
    tile = Image.new("RGBA", (144, 144))
    # Actual grip is the narrow wrapped handle, not the pommel at the image top.
    pivot = (72, 72)
    tile.alpha_composite(blade, ((144 - size) // 2, pivot[1] - round(size * grip_ratio)))
    return tile.rotate(angle, Image.Resampling.BICUBIC, center=pivot, expand=False)


def character_frame(sheet: Image.Image, state: str, direction: int, frame: int, armed: bool,
                    sockets: dict, weapon: Image.Image, grip_ratio: float = .17,
                    safe_zone: bool = False) -> Image.Image:
    out = Image.new("RGBA", (DRAW, DRAW))
    body = sheet.crop((frame * CELL, direction * CELL, (frame + 1) * CELL, (direction + 1) * CELL))
    body = body.resize((DRAW, DRAW), Image.Resampling.LANCZOS)
    pose = sockets["states"][state][DIRECTIONS[direction]][frame]
    scale = DRAW / CELL

    back_carry = Image.new("RGBA", (DRAW, DRAW))
    if armed and safe_zone:
        for root_x, angle, mirror in ((42, -38, False), (90, 38, True)):
            size = 96
            blade = weapon.resize((size, size), Image.Resampling.LANCZOS)
            if mirror:
                blade = blade.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            tile = Image.new("RGBA", (180, 180))
            pivot = (90, 90)
            tile.alpha_composite(blade, (pivot[0] - size // 2, pivot[1] - round(size * grip_ratio)))
            tile = tile.rotate(-angle, Image.Resampling.BICUBIC, center=pivot, expand=False)
            back_carry.alpha_composite(tile, (root_x - pivot[0], 32 - pivot[1]))
        if not (3 <= direction <= 5):
            out.alpha_composite(back_carry)

    def hand_layer(z: str) -> None:
        if not armed or safe_zone:
            return
        for left, key in ((True, "hand_left"), (False, "hand_right")):
            hand = pose[key]
            if hand["z"] != z:
                continue
            blade = weapon_at(hand, left, weapon, grip_ratio)
            grip_x = 128 + (hand["xy"][0] - 128) * HAND_SPREAD
            grip_y = hand["xy"][1] + HAND_LIFT
            x = round(grip_x * scale - 72)
            y = round(grip_y * scale - 72)
            out.alpha_composite(blade, (x, y))

    hand_layer("back")
    out.alpha_composite(body)
    if armed and safe_zone and 3 <= direction <= 5:
        out.alpha_composite(back_carry)
    hand_layer("front")
    if armed and not safe_zone:
        # Paint the closed glove and cuff above the handle. The weapon stays a
        # separate item layer, but visually passes through the palm like MU.
        for key in ("hand_left", "hand_right"):
            x, y = pose[key]["xy"]
            cx, cy = round(x * scale), round(y * scale)
            box = (max(0, cx - 7), max(0, cy - 8), min(DRAW, cx + 7), min(DRAW, cy + 9))
            out.alpha_composite(body.crop(box), box[:2])
    return out


def render() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    base = scene_base()
    sockets = json.loads((MAGIC / "sockets.json").read_text())
    weapon = Image.open(MAGIC / "ao-anh-dao-master.png").convert("RGBA")
    armor_names = {
        "default": "Mặc định", "ma_thuat": "Ma Thuật", "phong_vu": "Phong Vũ",
        "loi_phong": "Lôi Phong", "cuong_phong": "Cuồng Phong", "hoa_than": "Hỏa Thần",
        "magic_knight": "Magic Knight", "archangel": "Archangel",
    }
    weapon_names = {
        "black_reign_blade": "Ảo Ảnh Đao", "explosion_blade": "Song Hỏa Đao",
        "rune_blade": "Đao Sinh Mệnh", "thunder_blade": "Song Kiếm Điện",
        "sword_dancer": "Lôi Phong Đao", "magic_knight_blade": "Magic Knight Blade",
        "archangel_sword": "Archangel Sword",
    }
    grip_ratios = {
        "black_reign_blade": .15,
        "explosion_blade": .14,
        "rune_blade": .12,
        "thunder_blade": .11,
        "sword_dancer": .17,
        "magic_knight_blade": .12,
        "archangel_sword": .11,
    }
    armor_sheets = {
        key: Image.open(MAGIC / "armor" / ("appearance-default-walk-south-8frame.png" if key == "default"
              else f"appearance-tier-{key}-walk-south-8frame.png")).convert("RGBA")
        for key in armor_names
    }
    weapon_masters = {
        key: Image.open(MAGIC / "items" / f"{key}-master.png").convert("RGBA") for key in weapon_names
    }
    weapon_masters["black_reign_blade"] = weapon
    sheets = {state: Image.open(MAGIC / f"spellblade-{state}-8dir.png").convert("RGBA") for state, _ in STATES}
    title_font, info_font = font(25), font(16)
    frames: list[Image.Image] = []
    duration: list[int] = []

    for state, fps in STATES:
        for direction in range(8):
            for cycle_frame in range(8):
                scene = base.copy()
                d = ImageDraw.Draw(scene)
                px, py = 760, 410
                d.ellipse((px - 23, py - 6, px + 23, py + 8), fill=(15, 8, 4, 48))
                d.ellipse((px - 28, py - 10, px + 28, py + 10), outline=(222, 177, 73, 175), width=2)
                armed = direction % 2 == 0
                char = character_frame(sheets[state], state, direction, cycle_frame, armed, sockets, weapon)
                scene.alpha_composite(char, (px - DRAW // 2, round(py - DRAW * .953125)))
                d.rounded_rectangle((24, 22, 432, 112), radius=14, fill=(22, 15, 10, 225), outline=(134, 99, 39, 255), width=2)
                d.text((43, 35), "SPELLBLADE · MOVEMENT FIT", font=title_font, fill="#ffe0a0")
                gear = "SONG ẢO ẢNH ĐAO" if armed else "KHÔNG VŨ KHÍ"
                d.text((43, 72), f"{state.upper()} · {DIRECTIONS[direction].upper()} · {fps} FPS · {gear}", font=info_font, fill="#d7c6a4")
                d.text((43, 94), "Body atlas + hand sockets + weapon item texture", font=font(13), fill="#aa9877")
                frames.append(scene.convert("P", palette=Image.Palette.ADAPTIVE, colors=192))
                duration.append(round(1000 / fps))

    frames[0].save(OUT / "spellblade-movement-fit.gif", save_all=True, append_images=frames[1:],
                   duration=duration, loop=0, disposal=2, optimize=False)

    board = Image.new("RGBA", (1180, 640), "#17120e")
    bd = ImageDraw.Draw(board)
    bd.text((40, 24), "SPELLBLADE — BODY / WEAPON SOCKET REVIEW", font=font(26), fill="#ffe0a0")
    bd.text((40, 61), "Cùng một body frame; cột phải chỉ lắp thêm weapon_left + weapon_right.", font=font(15), fill="#bcae92")
    for row, (state, fps) in enumerate(STATES):
        y = 102 + row * 172
        bd.text((42, y + 58), f"{state.upper()}\n{fps} FPS", font=font(19), fill="#dec37f", spacing=5)
        for col, armed in enumerate((False, True)):
            char = character_frame(sheets[state], state, 0, 2, armed, sockets, weapon).resize((158, 158), Image.Resampling.LANCZOS)
            x = 270 + col * 390
            bd.ellipse((x + 48, y + 135, x + 110, y + 151), fill=(0, 0, 0, 80))
            bd.rounded_rectangle((x, y, x + 315, y + 157), radius=12, outline=(109, 81, 38, 255), width=2)
            board.alpha_composite(char, (x + 78, y))
            bd.text((x + 16, y + 14), "ARMED" if armed else "UNARMED", font=font(14), fill="#e6d7b9")
    board.save(OUT / "spellblade-layer-comparison.png")

    # Deterministic "random" loadouts for an easy visual comparison in the game map.
    loadouts = [
        ("ma_thuat", "thunder_blade"), ("phong_vu", "black_reign_blade"),
        ("loi_phong", "rune_blade"), ("cuong_phong", "explosion_blade"),
        ("hoa_than", "magic_knight_blade"), ("magic_knight", "sword_dancer"),
        ("archangel", "archangel_sword"), ("default", "black_reign_blade"),
    ]
    mix_frames: list[Image.Image] = []
    for armor_key, weapon_key in loadouts:
        for frame in range(8):
            scene = base.copy()
            d = ImageDraw.Draw(scene)
            px, py = 760, 410
            d.ellipse((px - 23, py - 6, px + 23, py + 8), fill=(15, 8, 4, 48))
            d.ellipse((px - 28, py - 10, px + 28, py + 10), outline=(222, 177, 73, 175), width=2)
            char = character_frame(armor_sheets[armor_key], "walk", 0, frame, True, sockets,
                                   weapon_masters[weapon_key], grip_ratios[weapon_key])
            scene.alpha_composite(char, (px - DRAW // 2, round(py - DRAW * .953125)))
            d.rounded_rectangle((24, 22, 495, 111), radius=14, fill=(22, 15, 10, 225), outline=(134, 99, 39, 255), width=2)
            d.text((43, 35), "RANDOM LOADOUT · IN-GAME", font=title_font, fill="#ffe0a0")
            d.text((43, 73), f"Giáp {armor_names[armor_key]} · {weapon_names[weapon_key]}", font=info_font, fill="#d7c6a4")
            mix_frames.append(scene.convert("P", palette=Image.Palette.ADAPTIVE, colors=192))
    mix_frames[0].save(OUT / "spellblade-random-loadouts.gif", save_all=True, append_images=mix_frames[1:],
                       duration=125, loop=0, disposal=2, optimize=False)

    safe = base.copy()
    sd = ImageDraw.Draw(safe)
    sd.rounded_rectangle((24, 22, 530, 111), radius=14, fill=(22, 15, 10, 225), outline=(134, 99, 39, 255), width=2)
    sd.text((43, 35), "SAFE ZONE · CROSSED BACK CARRY", font=title_font, fill="#ffe0a0")
    sd.text((43, 73), "Cuồng Phong tím + song Ảo Ảnh Đao · nhìn từ sau", font=info_font, fill="#d7c6a4")
    safe_char = character_frame(sheets["idle"], "idle", 4, 1, True, sockets, weapon, .17, True)
    safe.alpha_composite(safe_char, (760 - DRAW // 2, round(410 - DRAW * .953125)))
    safe.save(OUT / "spellblade-safe-zone-crossed-back.png")

    # Seven production loadouts using the corrected low dual-wield grip.
    production_loadouts = [
        ("ma_thuat", "rune_blade"), ("phong_vu", "black_reign_blade"),
        ("loi_phong", "thunder_blade"), ("cuong_phong", "explosion_blade"),
        ("hoa_than", "sword_dancer"), ("magic_knight", "magic_knight_blade"),
        ("archangel", "archangel_sword"),
    ]
    hold_board = Image.new("RGBA", (1280, 720), "#17120e")
    hd = ImageDraw.Draw(hold_board)
    hd.text((40, 24), "MAGIC · 7 SETS × 7 DUAL-WIELD GRIPS", font=font(26), fill="#ffe0a0")
    hd.text((40, 62), "Grip nằm trong lòng bàn tay · khuỷu mở nhẹ · lưỡi rủ chéo ra ngoài", font=font(15), fill="#bcae92")
    for i, (armor_key, weapon_key) in enumerate(production_loadouts):
        col, row = i % 4, i // 4
        x, y = 35 + col * 310, 105 + row * 290
        hd.rounded_rectangle((x, y, x + 280, y + 255), radius=14, fill=(22, 16, 12, 255), outline=(112, 83, 38, 255), width=2)
        char = character_frame(armor_sheets[armor_key], "walk", 0, 1, True, sockets,
                               weapon_masters[weapon_key], grip_ratios[weapon_key]).resize((205, 205), Image.Resampling.LANCZOS)
        hold_board.alpha_composite(char, (x + 38, y + 12))
        hd.text((x + 140, y + 224), f"{armor_names[armor_key]} · {weapon_names[weapon_key]}",
                anchor="mm", font=font(13), fill="#e5d4b2")
    hold_board.save(OUT / "spellblade-seven-loadout-grips.png")

    attack_root = MAGIC / "attacks"
    attack_specs = [
        ("flame-rush-slash", "CHÉM LỬA / LƯỚT", 90, "5–6"),
        ("light-storm", "BÃO ÁNH SÁNG", 125, "5–7"),
    ]
    attack_frames: list[Image.Image] = []
    attack_durations: list[int] = []
    armor_file_id = {key: key.replace("_", "-") for key in armor_names}
    weapon_file_id = {
        "black_reign_blade": "black-reign-blade", "explosion_blade": "hong-long-blade",
        "rune_blade": "rune-blade", "thunder_blade": "thunder-blade",
        "sword_dancer": "sword-dancer", "magic_knight_blade": "magic-knight-blade",
        "archangel_sword": "archangel-sword",
    }
    for armor_key, weapon_key in production_loadouts:
        aid, wid = armor_file_id[armor_key], weapon_file_id[weapon_key]
        for attack_id, attack_label, frame_ms, hit_frames in attack_specs:
            body = Image.open(attack_root / "body" / f"body-{aid}-{attack_id}-plus0-8frame.png").convert("RGBA")
            weapons = Image.open(attack_root / "weapons" / f"weapon-{wid}-{attack_id}-plus0-8frame.png").convert("RGBA")
            grips = Image.open(attack_root / "grips" / f"grip-{aid}-{attack_id}-8frame.png").convert("RGBA")
            vfx = Image.open(attack_root / "vfx" / f"vfx-{attack_id}-8frame.png").convert("RGBA")
            for frame in range(8):
                scene = base.copy()
                d = ImageDraw.Draw(scene)
                px, py = 760, 410
                d.ellipse((px - 23, py - 6, px + 23, py + 8), fill=(15, 8, 4, 48))
                d.ellipse((px - 28, py - 10, px + 28, py + 10), outline=(222, 177, 73, 175), width=2)
                composite = Image.new("RGBA", (CELL, CELL))
                box = (frame * CELL, 0, (frame + 1) * CELL, CELL)
                composite.alpha_composite(body.crop(box))
                composite.alpha_composite(weapons.crop(box))
                composite.alpha_composite(grips.crop(box))
                composite.alpha_composite(vfx.crop(box))
                composite = composite.resize((DRAW, DRAW), Image.Resampling.LANCZOS)
                scene.alpha_composite(composite, (px - DRAW // 2, round(py - DRAW * .953125)))
                d.rounded_rectangle((24, 22, 565, 111), radius=14, fill=(22, 15, 10, 225), outline=(134, 99, 39, 255), width=2)
                d.text((43, 35), f"{attack_label} · HIT {hit_frames}", font=title_font, fill="#ffe0a0")
                d.text((43, 73), f"{armor_names[armor_key]} · {weapon_names[weapon_key]}", font=info_font, fill="#d7c6a4")
                attack_frames.append(scene.convert("P", palette=Image.Palette.ADAPTIVE, colors=192))
                attack_durations.append(frame_ms)
    attack_frames[0].save(OUT / "spellblade-seven-set-attacks.gif", save_all=True,
                          append_images=attack_frames[1:], duration=attack_durations,
                          loop=0, disposal=2, optimize=False)


if __name__ == "__main__":
    render()
