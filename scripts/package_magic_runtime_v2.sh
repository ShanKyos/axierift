#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT/artifacts/magic-release-v2"
OUT_FILE="$OUT_DIR/magic-modular-runtime-v2.zip"
STAGE="$(mktemp -d /tmp/magic-runtime-v2.XXXXXX)"
PACKAGE="$STAGE/magic-modular-runtime-v2"
trap 'rm -rf "$STAGE"' EXIT

mkdir -p "$PACKAGE/game/assets" "$PACKAGE/review" "$PACKAGE/scripts" "$OUT_DIR"

cp "$ROOT/docs/magic-runtime-v2-package.md" "$PACKAGE/README.md"
cp "$ROOT/public/game/proto_magic_mix.html" "$PACKAGE/game/"
cp "$ROOT/public/game/proto_magic_mix.js" "$PACKAGE/game/"
cp "$ROOT/public/game/fonts.css" "$PACKAGE/game/"

mkdir -p "$PACKAGE/game/assets/iso"
for asset in nen_co1.png nen_duong1.png cay_to2.png buicay1.png da2.png; do
  cp "$ROOT/public/game/assets/iso/$asset" "$PACKAGE/game/assets/iso/"
done

rsync -a \
  --exclude='*.tmp.png' \
  --exclude='composite-body-wing1-dw-no-weapon.png' \
  --exclude='composite-body-wing1-mg-no-weapon.png' \
  "$ROOT/public/game/assets/magic-runtime/" \
  "$PACKAGE/game/assets/magic-runtime/"

for script in \
  build_magic_canonical_runtime.py \
  build_magic_demo_standalone.py \
  build_magic_flight_attack_v2.py \
  build_magic_flight_wings_v1.py \
  build_magic_movement_grips.py \
  extract_magic_demo_items.py \
  render_magic_mix_demo.py \
  render_magic_runtime_preview.py; do
  cp "$ROOT/scripts/$script" "$PACKAGE/scripts/"
done

for review in \
  "$ROOT/artifacts/magic-canonical-runtime/review/magic-modular-4states-8dir.gif" \
  "$ROOT/artifacts/magic-canonical-runtime/review/magic-random-armor-weapon-contact.png" \
  "$ROOT/artifacts/magic-canonical-runtime/review/magic-flight-wing1-dw-vs-mg.png" \
  "$ROOT/artifacts/magic-canonical-runtime/review/magic-flight-wing1-dw.gif" \
  "$ROOT/artifacts/magic-canonical-runtime/review/magic-flight-wing1-mg.gif" \
  "$ROOT/artifacts/magic-flight-v2/review/magic-dual-weapon-grip-no-wing-vs-wings.png" \
  "$ROOT/artifacts/magic-flight-v2/review/magic-dual-grip-no-wing.gif" \
  "$ROOT/artifacts/magic-flight-v2/review/magic-dual-grip-wing1-dw.gif" \
  "$ROOT/artifacts/magic-flight-v2/review/magic-dual-grip-wing1-mg.gif" \
  "$ROOT/artifacts/magic-flight-v2/review/magic-airborne-fire-slash-wing-comparison.png" \
  "$ROOT/artifacts/magic-flight-v2/review/magic-fire-slash-air-wing1-dw.gif" \
  "$ROOT/artifacts/magic-flight-v2/review/magic-fire-slash-air-wing1-mg.gif"; do
  cp "$review" "$PACKAGE/review/"
done

(
  cd "$PACKAGE"
  find . -type f ! -name SHA256SUMS.txt -print0 \
    | sort -z \
    | xargs -0 sha256sum > SHA256SUMS.txt
  find . -type f -printf '%s\t%p\n' \
    | sort -k2 > INVENTORY.txt
)

rm -f "$OUT_FILE"
(
  cd "$STAGE"
  zip -qr "$OUT_FILE" magic-modular-runtime-v2
)

printf '%s\n' "$OUT_FILE"
