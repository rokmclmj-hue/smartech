#!/usr/bin/env bash
set -uo pipefail
cd "$(dirname "$0")/.."

OUT=public/images/industries
TMP=/tmp/edwards_html
mkdir -p "$OUT" "$TMP"

UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
BASE="https://www.edwardsvacuum.com"

declare -a PAIRS=(
  "battery|/en-us/vacuum-pumps/our-markets/energy-solutions/lithium-ion-battery-production"
  "renewable|/en-us/vacuum-pumps/our-markets/energy-solutions/renewable-energy"
  "heat-treatment|/en-us/vacuum-pumps/our-markets/metallurgy/heat-treatment"
  "steel-degassing|/en-us/vacuum-pumps/our-markets/metallurgy/steel-degassing"
  "pharma|/en-us/vacuum-pumps/our-markets/chemical-processing/pharmaceuticals"
  "petrochem|/en-us/vacuum-pumps/our-markets/chemical-processing/petrochem"
  "specialty-chem|/en-us/vacuum-pumps/our-markets/chemical-processing/speciality-and-fine-chemicals"
  "display-fab|/en-us/vacuum-pumps/our-markets/display/display-fabrication"
)

for entry in "${PAIRS[@]}"; do
  key="${entry%%|*}"
  path="${entry##*|}"
  url="$BASE$path"
  html="$TMP/sub_$key.html"

  echo "=== $key ==="
  curl -sSL -A "$UA" "$url" -o "$html"

  img=$(grep -oE '/content/dam/brands/edwards-vacuum/[^"'"'"' ]+(\.tif|\.jpg|\.jpeg|\.png)/jcr:content/renditions/cq5dam\.web\.[0-9]+\.[0-9]+\.(jpeg|png)' "$html" \
        | grep -viE '(logo|footer|thumbnail|brochure|pdf|mp4)' \
        | head -1)

  if [ -z "$img" ]; then
    echo "  !! no image URL found"
    continue
  fi

  ext="${img##*.}"
  out="$OUT/$key.$ext"
  # Handle & in URL path
  decoded=$(echo "$img" | sed 's/&amp;/\&/g')
  echo "  -> $decoded"
  curl -sSL -A "$UA" "$BASE$decoded" -o "$out"
  size=$(stat -c%s "$out" 2>/dev/null || stat -f%z "$out" 2>/dev/null)
  echo "  saved $out ($size bytes)"
done
