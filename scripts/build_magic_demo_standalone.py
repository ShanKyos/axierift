"""Build a single-file Spellblade demo for sandbox/download previews."""

from __future__ import annotations

import base64
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GAME = ROOT / "public" / "game"
OUT = ROOT / "artifacts" / "magic-mix-demo" / "proto_magic_mix_standalone.html"


def data_url(path: Path) -> str:
    mime = "image/webp" if path.suffix.lower() == ".webp" else "image/png"
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def main() -> None:
    assets: dict[str, str] = {}
    required = [
        GAME / "assets" / "magic-demo" / "spellblade-idle-8dir.png",
        GAME / "assets" / "magic-demo" / "spellblade-walk-8dir.png",
        GAME / "assets" / "magic-demo" / "spellblade-run-8dir.png",
        GAME / "assets" / "magic-demo" / "ao-anh-dao-master.png",
        GAME / "assets" / "iso" / "nen_co1.png",
        GAME / "assets" / "iso" / "nen_duong1.png",
        GAME / "assets" / "iso" / "cay_to2.png",
        GAME / "assets" / "iso" / "buicay1.png",
        GAME / "assets" / "iso" / "da2.png",
    ]
    required += sorted((GAME / "assets" / "magic-demo" / "armor").glob("*.png"))
    required += sorted((GAME / "assets" / "magic-demo" / "items").glob("*.png"))
    required += sorted((GAME / "assets" / "magic-demo" / "grips" / "movement").glob("*.png"))
    required += sorted((GAME / "assets" / "magic-demo" / "attacks").rglob("*.png"))
    for path in required:
        key = path.relative_to(GAME).as_posix()
        assets[key] = data_url(path)

    sockets = json.loads((GAME / "assets" / "magic-demo" / "sockets.json").read_text())
    html = (GAME / "proto_magic_mix.html").read_text()
    javascript = (GAME / "proto_magic_mix.js").read_text().replace("</script>", "<\\/script>")
    bootstrap = (
        "<script>\n"
        f"window.__MAGIC_DEMO_ASSETS__={json.dumps(assets, separators=(',', ':'))};\n"
        f"window.__MAGIC_DEMO_SOCKETS__={json.dumps(sockets, separators=(',', ':'))};\n"
        "</script>\n"
        f"<script>\n{javascript}\n</script>"
    )
    html = html.replace('<link rel="stylesheet" href="fonts.css">', "")
    html = html.replace('<script src="proto_magic_mix.js"></script>', bootstrap)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html)
    print(f"wrote {OUT} ({OUT.stat().st_size / 1024 / 1024:.1f} MiB)")


if __name__ == "__main__":
    main()
