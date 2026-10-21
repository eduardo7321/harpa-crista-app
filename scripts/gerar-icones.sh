#!/usr/bin/env bash
# Gera os ícones do app a partir da arte em docs/superpowers/specs/icone/cover.py.
# Requer: python3, inkscape e as fontes "Noto Serif" e "Noto Music".
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

python3 "$RAIZ/docs/superpowers/specs/icone/cover.py" "$TMP"

png() { inkscape "$1" --export-text-to-path --export-type=png --export-filename="$2" -w "$3" -h "${4:-$3}" 2>/dev/null; }

png "$TMP/icone.svg" "$RAIZ/assets/icon.png" 1024
png "$TMP/icone.svg" "$RAIZ/assets/play-store-icon.png" 512
png "$TMP/frente-adaptativa.svg" "$RAIZ/assets/adaptive-icon.png" 1024
cp "$RAIZ/assets/adaptive-icon.png" "$RAIZ/assets/splash-icon.png"
png "$TMP/banner.svg" "$RAIZ/assets/play-store-banner.png" 1024 500
# A Play Store não aceita transparência na imagem de destaque
python3 -c "from PIL import Image; Image.open('$RAIZ/assets/play-store-banner.png').convert('RGB').save('$RAIZ/assets/play-store-banner.png')"

echo "Ícones gerados em $RAIZ/assets"
