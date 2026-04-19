const sharp = require('sharp');

// The source PNG has alpha=255 everywhere (background is solid white, not transparent).
// So we detect "content" by color: any pixel noticeably darker than white OR saturated.
function isContent(r, g, b) {
  // White-ish background check: all channels > 240 and near-equal -> background
  if (r > 240 && g > 240 && b > 240) return false;
  return true;
}

async function run() {
  const src = 'C:/클로드코드수업/smartech/public/edwards-logo.png';
  const dst = 'C:/클로드코드수업/smartech/public/edwards-wordmark.png';

  const meta = await sharp(src).metadata();
  console.log('Original:', meta.width, 'x', meta.height, 'channels:', meta.channels);

  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, CH = info.channels;

  // Sample a few corner pixels and middle pixels to understand background color
  const samplePts = [
    [0, 0], [W - 1, 0], [0, H - 1], [W - 1, H - 1],
    [Math.floor(W / 2), 0], [Math.floor(W / 2), H - 1],
    [0, Math.floor(H / 2)], [W - 1, Math.floor(H / 2)],
    [Math.floor(W / 2), Math.floor(H / 2)],
  ];
  console.log('Sample pixels:');
  for (const [x, y] of samplePts) {
    const i = (y * W + x) * CH;
    console.log(`  (${x},${y}): rgba(${data[i]},${data[i+1]},${data[i+2]},${data[i+3]})`);
  }

  // Row density by content (non-white)
  const rowDensity = new Array(H).fill(0);
  for (let y = 0; y < H; y++) {
    let c = 0;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * CH;
      if (isContent(data[i], data[i + 1], data[i + 2])) c++;
    }
    rowDensity[y] = c;
  }
  console.log('Row density samples (every 10 rows):');
  for (let y = 0; y < H; y += 10) console.log(`  y=${y}: ${rowDensity[y]}`);

  // Find gap runs
  const gapThresh = 3;
  const runs = [];
  let runStart = -1;
  for (let y = 0; y < H; y++) {
    const empty = rowDensity[y] <= gapThresh;
    if (empty && runStart < 0) runStart = y;
    else if (!empty && runStart >= 0) {
      runs.push({ start: runStart, end: y - 1, len: y - runStart });
      runStart = -1;
    }
  }
  if (runStart >= 0) runs.push({ start: runStart, end: H - 1, len: H - runStart });

  console.log('All empty runs:');
  runs.forEach(r => console.log(`  [${r.start}..${r.end}] len=${r.len}`));

  // Find content blocks (between gaps)
  const contentBlocks = [];
  let bStart = -1;
  for (let y = 0; y < H; y++) {
    const hasContent = rowDensity[y] > gapThresh;
    if (hasContent && bStart < 0) bStart = y;
    else if (!hasContent && bStart >= 0) {
      contentBlocks.push({ start: bStart, end: y - 1, len: y - bStart });
      bStart = -1;
    }
  }
  if (bStart >= 0) contentBlocks.push({ start: bStart, end: H - 1, len: H - bStart });
  console.log('Content blocks:');
  contentBlocks.forEach(b => console.log(`  [${b.start}..${b.end}] len=${b.len}`));

  // Top block = wordmark
  if (contentBlocks.length === 0) throw new Error('No content blocks detected');
  const top = contentBlocks[0];
  console.log('Top (wordmark) block:', top);

  // Crop to top block vertically, with tight horizontal bbox
  let minX = W, maxX = 0;
  for (let y = top.start; y <= top.end; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * CH;
      if (isContent(data[i], data[i + 1], data[i + 2])) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
  }
  console.log('Horizontal bbox:', { minX, maxX });

  const pad = 4;
  const cropLeft = Math.max(0, minX - pad);
  const cropTop = Math.max(0, top.start - pad);
  const cropW = Math.min(W - cropLeft, (maxX - minX + 1) + pad * 2);
  const cropH = Math.min(H - cropTop, (top.end - top.start + 1) + pad * 2);

  console.log('Final crop:', { left: cropLeft, top: cropTop, width: cropW, height: cropH });

  // Now: we want TRANSPARENT background in output, not white.
  // Extract + convert white to transparent.
  const cropped = await sharp(src)
    .extract({ left: cropLeft, top: cropTop, width: cropW, height: cropH })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Make white pixels transparent
  const out = Buffer.from(cropped.data);
  const cW = cropped.info.width, cH = cropped.info.height, cCH = cropped.info.channels;
  for (let y = 0; y < cH; y++) {
    for (let x = 0; x < cW; x++) {
      const i = (y * cW + x) * cCH;
      const r = out[i], g = out[i + 1], b = out[i + 2];
      if (r > 240 && g > 240 && b > 240) {
        out[i + 3] = 0; // transparent
      } else if (r > 220 && g > 220 && b > 220) {
        // Soft edge: partial transparency
        const avg = (r + g + b) / 3;
        out[i + 3] = Math.max(0, Math.round(255 - (avg - 220) / 20 * 255));
      }
    }
  }

  await sharp(out, { raw: { width: cW, height: cH, channels: cCH } }).png().toFile(dst);

  // Verification
  const outMeta = await sharp(dst).metadata();
  console.log('\n=== OUTPUT ===');
  console.log('Size:', outMeta.width, 'x', outMeta.height, 'aspect', (outMeta.width / outMeta.height).toFixed(3));

  const verify = await sharp(dst).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let vMinX = verify.info.width, vMinY = verify.info.height, vMaxX = 0, vMaxY = 0;
  for (let y = 0; y < verify.info.height; y++) {
    for (let x = 0; x < verify.info.width; x++) {
      const a = verify.data[(y * verify.info.width + x) * verify.info.channels + 3];
      if (a > 20) {
        if (x < vMinX) vMinX = x;
        if (y < vMinY) vMinY = y;
        if (x > vMaxX) vMaxX = x;
        if (y > vMaxY) vMaxY = y;
      }
    }
  }
  console.log('Alpha bbox in output:', { vMinX, vMinY, vMaxX, vMaxY });
  console.log('Padding L/T/R/B:', vMinX, vMinY, verify.info.width - 1 - vMaxX, verify.info.height - 1 - vMaxY);

  // Check bottom 15% for stray content (shouldn't contain AUTHORIZED text)
  const bottomStart = Math.floor(verify.info.height * 0.85);
  let bottomContent = 0;
  for (let y = bottomStart; y < verify.info.height; y++) {
    for (let x = 0; x < verify.info.width; x++) {
      const a = verify.data[(y * verify.info.width + x) * verify.info.channels + 3];
      if (a > 20) bottomContent++;
    }
  }
  console.log('Bottom 15% opaque pixels:', bottomContent, '(normal if wordmark text extends there)');
}

run().catch((e) => { console.error(e); process.exit(1); });
