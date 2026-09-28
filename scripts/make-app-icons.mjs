import { deflateSync } from "zlib";
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "icons");

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf));
  return Buffer.concat([len, t, data, crc]);
}

function png(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    rgba.copy(raw, row + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function mix(a, b, t) {
  return a.map((v, i) => v + (b[i] - v) * t);
}
function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function roundedRect(px, py, size, r) {
  const x = clamp(px, r, size - r);
  const y = clamp(py, r, size - r);
  const dx = px - x;
  const dy = py - y;
  return Math.hypot(dx, dy) - r;
}

function inPoly(px, py, pts) {
  let n = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    const hit = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-9) + xi;
    if (hit) n++;
  }
  return n % 2 === 1;
}

function star(cx, cy, rOuter, rInner) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? rOuter : rInner;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

function paint(size, maskable) {
  const rgba = Buffer.alloc(size * size * 4);
  const pad = maskable ? size * 0.08 : 0;
  const box = size - pad * 2;
  const radius = box * 0.23;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = x - pad;
      const py = y - pad;
      const gx = px / box;
      const gy = py / box;
      const t = clamp((gx * 0.55 + gy * 0.9) / 1.45, 0, 1);
      let col;
      if (t < 0.36) col = mix([103, 214, 255, 255], [31, 87, 181, 255], t / 0.36);
      else if (t < 0.72) col = mix([31, 87, 181, 255], [18, 48, 110, 255], (t - 0.36) / 0.36);
      else col = mix([18, 48, 110, 255], [6, 18, 42, 255], (t - 0.72) / 0.28);

      const d = roundedRect(px, py, box, radius);
      const aa = clamp(0.5 - d, 0, 1);
      if (maskable) {
        // full bleed navy so Android mask never shows holes
        col = mix([8, 22, 52, 255], col, aa);
      } else {
        col = [col[0], col[1], col[2], Math.round(255 * aa)];
      }

      const cx = pad + box / 2;
      const cy = pad + box * 0.5;
      const dist = Math.hypot(x - cx, y - (cy - box * 0.04));
      if (dist < box * 0.34) {
        const g = (1 - dist / (box * 0.34)) * 0.22;
        col = mix(col, [122, 216, 255, col[3]], g);
      }

      const inner = roundedRect(px - box * 0.043, py - box * 0.043, box * 0.914, radius * 0.86);
      const ring = Math.abs(inner + 1);
      if (ring < box * 0.012 && aa > 0.5) {
        const rt = clamp((gx + gy) / 2, 0, 1);
        const gold = mix([255, 243, 192, 255], [226, 186, 92, 255], rt);
        col = mix(col, gold, 0.85);
      }

      const s = box / 512;
      const ox = pad;
      const oy = pad;
      const L = [
        [148 * s + ox, 246 * s + oy],
        [256 * s + ox, 258 * s + oy],
        [256 * s + ox, 414 * s + oy],
        [140 * s + ox, 400 * s + oy],
      ];
      const R = [
        [364 * s + ox, 246 * s + oy],
        [256 * s + ox, 258 * s + oy],
        [256 * s + ox, 414 * s + oy],
        [372 * s + ox, 400 * s + oy],
      ];
      if (inPoly(x, y, L)) col = mix(col, [255, 255, 255, 255], 0.94);
      if (inPoly(x, y, R)) col = mix(col, [196, 226, 248, 255], 0.92);

      const cover = [
        [256 * s + ox, 128 * s + oy],
        [312 * s + ox, 184 * s + oy],
        [256 * s + ox, 218 * s + oy],
        [200 * s + ox, 184 * s + oy],
      ];
      if (inPoly(x, y, cover)) col = mix(col, [255, 255, 255, 255], 0.96);

      if (inPoly(x, y, star(cx, pad + box * 0.24, box * 0.07, box * 0.03))) {
        col = mix(col, [255, 224, 138, 255], 0.95);
      }

      const o = (y * size + x) * 4;
      rgba[o] = clamp(col[0], 0, 255);
      rgba[o + 1] = clamp(col[1], 0, 255);
      rgba[o + 2] = clamp(col[2], 0, 255);
      rgba[o + 3] = clamp(col[3], 0, 255);
    }
  }
  return rgba;
}

function downscale(src, from, to) {
  const out = Buffer.alloc(to * to * 4);
  const f = from / to;
  for (let y = 0; y < to; y++) {
    for (let x = 0; x < to; x++) {
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      const x0 = Math.floor(x * f);
      const y0 = Math.floor(y * f);
      const x1 = Math.floor((x + 1) * f);
      const y1 = Math.floor((y + 1) * f);
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const o = (yy * from + xx) * 4;
          r += src[o];
          g += src[o + 1];
          b += src[o + 2];
          a += src[o + 3];
          n++;
        }
      }
      const o = (y * to + x) * 4;
      out[o] = r / n;
      out[o + 1] = g / n;
      out[o + 2] = b / n;
      out[o + 3] = a / n;
    }
  }
  return out;
}

mkdirSync(outDir, { recursive: true });
const hi = paint(1024, true);
writeFileSync(join(outDir, "icon-512.png"), png(512, 512, downscale(hi, 1024, 512)));
writeFileSync(join(outDir, "icon-192.png"), png(192, 192, downscale(hi, 1024, 192)));
writeFileSync(join(outDir, "apple-touch-icon.png"), png(180, 180, downscale(hi, 1024, 180)));
writeFileSync(join(root, "public", "apple-touch-icon.png"), png(180, 180, downscale(hi, 1024, 180)));
writeFileSync(join(outDir, "favicon-32.png"), png(32, 32, downscale(hi, 1024, 32)));
console.log("icons written");
