// 원격 이미지의 가로·세로 크기를 파일 앞부분만 읽어서 알아낸다.
// 블로그 본문 사진에 width/height를 넣어 사진이 늦게 뜰 때 글이 밀리는 현상(CLS)을 막기 위함 — 2026-09-25.
// 한 번 읽은 결과는 Next.js 서버 캐시(force-cache)에 남아 같은 사진을 다시 요청하지 않는다.
export type ImageSize = { width: number; height: number };

const HEAD_BYTES = 131071; // PNG·GIF·WebP는 앞 30바이트. JPEG는 휴대폰 원본의 촬영정보(EXIF) 때문에 크기 정보(SOF)가 80KB 뒤에 있는 경우가 있어 128KB까지 읽는다

function parsePng(b: Uint8Array): ImageSize | null {
  if (b.length < 24 || b[0] !== 0x89 || b[1] !== 0x50 || b[2] !== 0x4e || b[3] !== 0x47) return null;
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  return { width: v.getUint32(16), height: v.getUint32(20) };
}

function parseGif(b: Uint8Array): ImageSize | null {
  if (b.length < 10 || b[0] !== 0x47 || b[1] !== 0x49 || b[2] !== 0x46) return null;
  return { width: b[6] | (b[7] << 8), height: b[8] | (b[9] << 8) };
}

function parseWebp(b: Uint8Array): ImageSize | null {
  if (b.length < 30 || String.fromCharCode(...b.slice(0, 4)) !== "RIFF" || String.fromCharCode(...b.slice(8, 12)) !== "WEBP") return null;
  const chunk = String.fromCharCode(...b.slice(12, 16));
  if (chunk === "VP8 ") return { width: (b[26] | (b[27] << 8)) & 0x3fff, height: (b[28] | (b[29] << 8)) & 0x3fff };
  if (chunk === "VP8L") {
    const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") {
    return { width: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)), height: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)) };
  }
  return null;
}

// EXIF(APP1) 안의 회전 값(Orientation, 태그 0x0112). 휴대폰 세로 사진은 가로 픽셀 + "90° 회전" 값(5~8)으로 저장된다.
function readExifOrientation(b: Uint8Array, start: number, len: number): number | null {
  const t = start + 10; // "Exif\0\0" 다음 TIFF 헤더 시작
  if (len < 16 || String.fromCharCode(...b.slice(start + 4, start + 8)) !== "Exif" || t + 8 > b.length) return null;
  const le = b[t] === 0x49; // "II"=little-endian, "MM"=big-endian
  const u16 = (o: number) => (le ? b[o] | (b[o + 1] << 8) : (b[o] << 8) | b[o + 1]);
  const u32 = (o: number) => (le ? (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16)) + b[o + 3] * 0x1000000 : b[o] * 0x1000000 + ((b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]));
  const ifd = t + u32(t + 4);
  if (ifd + 2 > b.length) return null;
  const count = u16(ifd);
  for (let k = 0; k < count; k++) {
    const e = ifd + 2 + k * 12;
    if (e + 12 > b.length) return null;
    if (u16(e) === 0x0112) return u16(e + 8);
  }
  return null;
}

function parseJpeg(b: Uint8Array): ImageSize | null {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  let orientation: number | null = null;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const marker = b[i + 1];
    const len = (b[i + 2] << 8) | b[i + 3];
    if (marker === 0xe1 && orientation === null) orientation = readExifOrientation(b, i, len);
    // SOF0~SOF15 (DHT·JPG·DAC 제외)
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      const height = (b[i + 5] << 8) | b[i + 6];
      const width = (b[i + 7] << 8) | b[i + 8];
      // 회전 값 5~8이면 브라우저가 90° 돌려 보여주므로 가로·세로를 바꿔야 자리 크기가 맞는다
      return orientation !== null && orientation >= 5 && orientation <= 8 ? { width: height, height: width } : { width, height };
    }
    i += 2 + len;
  }
  return null;
}

export async function getRemoteImageSize(url: string): Promise<ImageSize | null> {
  try {
    const res = await fetch(url, {
      headers: { Range: `bytes=0-${HEAD_BYTES}` },
      cache: "force-cache",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const b = new Uint8Array(await res.arrayBuffer());
    const size = parsePng(b) ?? parseJpeg(b) ?? parseWebp(b) ?? parseGif(b);
    if (!size || size.width <= 0 || size.height <= 0) return null;
    return size;
  } catch {
    return null; // 크기를 못 알아내도 사진은 기존처럼 그대로 표시된다
  }
}
