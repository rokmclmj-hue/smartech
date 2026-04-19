#!/usr/bin/env bash
set -uo pipefail
cd "$(dirname "$0")/.."

OUT=public/images/industries
TMP=/tmp/edwards_html
mkdir -p "$OUT" "$TMP"

UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
BASE="https://www.edwardsvacuum.com"

declare -a PAIRS=(
  "research|/en-us/vacuum-pumps/our-markets/vacuum-systems-for-research-and-development-applications"
  "analytical|/en-us/vacuum-pumps/our-markets/vacuum-systems-for-analytical-instruments"
  "chemical|/en-us/vacuum-pumps/our-markets/chemical-processing"
  "energy|/en-us/vacuum-pumps/our-markets/energy-solutions"
  "industrial|/en-us/vacuum-pumps/our-markets/industrial-solutions"
  "display|/en-us/vacuum-pumps/our-markets/display"
  "ccus|/en-us/vacuum-pumps/our-markets/vacuum-solutions-for-ccus-technologies"
  "food|/en-us/vacuum-pumps/our-markets/food-processing"
  "plastics|/en-us/vacuum-pumps/our-markets/plastics-and-composites"
  "metallurgy|/en-us/vacuum-pumps/our-markets/metallurgy"
  "coating|/en-us/vacuum-pumps/our-markets/vacuum-coating"
  "space|/en-us/vacuum-pumps/our-markets/vacuum-technology-for-tvac-testing-in-space-qualification"
)

for entry in "${PAIRS[@]}"; do
  key="${entry%%|*}"
  path="${entry##*|}"
  url="$BASE$path"
  html="$TMP/ind_$key.html"

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
  echo "  -> $img"
  curl -sSL -A "$UA" "$BASE$img" -o "$out"
  size=$(stat -c%s "$out" 2>/dev/null || stat -f%z "$out" 2>/dev/null)
  echo "  saved $out ($size bytes)"
done
