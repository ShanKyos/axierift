"""Extract reusable single-weapon textures from the legacy dual-weapon walk layers."""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent.parent / "output" / "magic-7tier-armor-weapons-v1"
TARGET = ROOT / "public" / "game" / "assets" / "magic-demo" / "items"


def components(alpha: Image.Image, threshold: int = 20) -> list[tuple[int, tuple[int, int, int, int]]]:
    px = alpha.load()
    seen: set[tuple[int, int]] = set()
    found: list[tuple[int, tuple[int, int, int, int]]] = []
    for y in range(alpha.height):
        for x in range(alpha.width):
            if px[x, y] < threshold or (x, y) in seen:
                continue
            queue = deque([(x, y)])
            seen.add((x, y))
            points: list[tuple[int, int]] = []
            while queue:
                cx, cy = queue.pop()
                points.append((cx, cy))
                for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
                    if 0 <= nx < alpha.width and 0 <= ny < alpha.height and px[nx, ny] >= threshold and (nx, ny) not in seen:
                        seen.add((nx, ny))
                        queue.append((nx, ny))
            if len(points) > 200:
                xs = [p[0] for p in points]
                ys = [p[1] for p in points]
                found.append((len(points), (min(xs), min(ys), max(xs) + 1, max(ys) + 1)))
    return sorted(found, reverse=True)


def main() -> None:
    TARGET.mkdir(parents=True, exist_ok=True)
    for source in sorted(SOURCE.glob("weapon-*-walk-south-8frame.png")):
        first = Image.open(source).convert("RGBA").crop((0, 0, 256, 256))
        parts = components(first.getchannel("A"))
        if len(parts) < 2:
            raise RuntimeError(f"Expected a dual weapon layer: {source}")
        # Take the larger right-hand component; both sides contain the same item art.
        _, bbox = max(parts[:2], key=lambda item: item[1][0])
        item = first.crop(bbox)
        target_height = 226
        width = max(1, round(item.width * target_height / item.height))
        item = item.resize((width, target_height), Image.Resampling.LANCZOS)
        master = Image.new("RGBA", (256, 256))
        master.alpha_composite(item, ((256 - width) // 2, 15))
        key = source.name.removeprefix("weapon-").removesuffix("-walk-south-8frame.png")
        master.save(TARGET / f"{key}-master.png")


if __name__ == "__main__":
    main()
