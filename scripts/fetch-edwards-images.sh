#!/usr/bin/env bash
# Fetch product hero images from edwardsvacuum.com for each Smartech product family.
# Writes into public/images/products/

set -uo pipefail
cd "$(dirname "$0")/.."

OUT=public/images/products
TMP=/tmp/edwards_html
mkdir -p "$OUT" "$TMP"

UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
BASE="https://www.edwardsvacuum.com"

# key : URL path on edwardsvacuum.com
declare -a PAIRS=(
  "rv|/en-us/vacuum-pumps/our-products/oil-rotary-vane-pumps-two-stage/rv"
  "e2m|/en-us/vacuum-pumps/our-products/oil-rotary-vane-pumps-two-stage/e2m"
  "e2s|/en-us/vacuum-pumps/our-products/oil-rotary-vane-pumps-two-stage/e2s"
  "nes|/en-us/vacuum-pumps/our-products/oil-rotary-vane-pumps-single-stage/nes-series"
  "xds|/en-us/vacuum-pumps/our-products/dry-scroll-pumps/xds"
  "eh|/en-us/vacuum-pumps/our-products/mechanical-booster-pumps/eh"
  "gxs|/en-us/vacuum-pumps/our-products/dry-screw-pumps/gxs"
  "exs|/en-us/vacuum-pumps/our-products/dry-screw-pumps/exs"
  "nxri|/en-us/vacuum-pumps/our-products/multistage-roots-pumps/nxri"
  "ixh-ixl|/en-us/semiconductor/our-products/dry-pumps"
  "eld500|/en-us/vacuum-pumps/our-products/leak-detection/eld500-helium-leak-detector"
  "next|/en-us/vacuum-pumps/our-products/turbomolecular-pumps-mechanical"
  "next-m|/en-us/vacuum-pumps/our-products/turbomolecular-pumps-mag"
  "t-station|/en-us/vacuum-pumps/our-products/high-vacuum-pump-systems/t-station"
  "stp|/en-us/semiconductor/our-products/on-chamber-solutions/turbomolecular-pumps"
  "gauges-indirect|/en-us/vacuum-pumps/our-products/measurement-and-control/indirect-pressure-measurement-gauges"
  "gauges-mechanical|/en-us/vacuum-pumps/our-products/measurement-and-control/mechanical-vacuum-gauges-and-switches"
  "controllers|/en-us/vacuum-pumps/our-products/measurement-and-control/vacuum-system-controllers"
  "hardware|/en-us/vacuum-pumps/our-products/hardware-and-fittings"
)

for entry in "${PAIRS[@]}"; do
  key="${entry%%|*}"
  path="${entry##*|}"
  url="$BASE$path"
  html="$TMP/$key.html"

  echo "=== $key ==="
  curl -sSL -A "$UA" "$url" -o "$html"

  # Primary pattern: the large web rendition (1200x628 or similar) of a .tif or .jpg hero
  img=$(grep -oE '/content/dam/brands/edwards-vacuum/[^"'"'"' ]+(\.tif|\.jpg|\.jpeg|\.png)/jcr:content/renditions/cq5dam\.web\.[0-9]+\.[0-9]+\.(jpeg|png)' "$html" \
        | grep -viE '(logo|footer|thumbnail|brochure|pdf|mp4|Oil_Finder)' \
        | head -1)

  if [ -z "$img" ]; then
    # Fallback: any cq5dam.web rendition at all (excluding brand chrome)
    img=$(grep -oE '/content/dam/brands/edwards-vacuum/[^"'"'"' ]+cq5dam\.web\.[0-9]+\.[0-9]+\.(jpeg|png)' "$html" \
          | grep -viE '(logo|footer|thumbnail|brochure|pdf|mp4)' \
          | head -1)
  fi

  if [ -z "$img" ]; then
    echo "  !! no hero image URL found"
    continue
  fi

  ext="${img##*.}"
  out="$OUT/$key.$ext"
  echo "  -> $img"
  curl -sSL -A "$UA" "$BASE$img" -o "$out"
  size=$(stat -c%s "$out" 2>/dev/null || stat -f%z "$out" 2>/dev/null)
  echo "  saved $out ($size bytes)"
done
