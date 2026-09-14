// Generates public/icon-192x192.png and public/icon-512x512.png with zero
// dependencies (no image library) - just Node's built-in zlib for DEFLATE plus a
// hand-rolled PNG encoder (signature + IHDR/IDAT/IEND chunks with CRC32).
// Draws a simple brand-colored stopwatch icon (indigo circle, white face, clock
// hands) matching public/favicon.svg's motif, since we can't rasterize the SVG
// without a new dependency either.
import { deflateSync } from 'zlib';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function drawIcon(size) {
  const pixels = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const bodyR = size * 0.47;
  const faceR = size * 0.36;

  const INDIGO_BODY = [79, 70, 229];   // #4f46e5
  const INDIGO_DARK = [49, 46, 129];   // #312e81
  const FACE = [248, 250, 252];        // #f8fafc
  const HAND = [30, 41, 59];           // #1e293b

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let color = null; // null = transparent
      if (dist <= bodyR) {
        color = dist > bodyR - size * 0.02 ? INDIGO_DARK : INDIGO_BODY;
      }
      if (dist <= faceR) {
        color = dist > faceR - size * 0.015 ? INDIGO_DARK : FACE;
      }

      // Clock hands: a vertical hand (12 o'clock) and a horizontal hand (3 o'clock),
      // drawn as thin rectangles from the center.
      const handWidth = Math.max(1, size * 0.03);
      const isVerticalHand = Math.abs(dx) <= handWidth / 2 && dy <= 0 && dy >= -faceR * 0.7;
      const isHorizontalHand = Math.abs(dy) <= handWidth / 2 && dx >= 0 && dx <= faceR * 0.5;
      if ((isVerticalHand || isHorizontalHand) && dist <= faceR) {
        color = HAND;
      }

      const i = (y * size + x) * 4;
      if (color) {
        pixels[i] = color[0];
        pixels[i + 1] = color[1];
        pixels[i + 2] = color[2];
        pixels[i + 3] = 255;
      } else {
        pixels[i] = 0;
        pixels[i + 1] = 0;
        pixels[i + 2] = 0;
        pixels[i + 3] = 0;
      }
    }
  }
  return pixels;
}

function encodePng(size) {
  const pixels = drawIcon(size);

  // Raw scanlines: each row prefixed with a filter-type byte (0 = None)
  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 4);
    raw[rowStart] = 0;
    pixels.copy(raw, rowStart + 1, y * size * 4, (y + 1) * size * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const idatData = deflateSync(raw);

  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idatData),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

for (const size of [192, 512]) {
  const png = encodePng(size);
  const outPath = path.join(__dirname, '..', 'public', `icon-${size}x${size}.png`);
  writeFileSync(outPath, png);
  console.log(`Wrote ${outPath} (${png.length} bytes)`);
}
