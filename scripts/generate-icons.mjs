import sharp from "sharp";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "../public");

const svg = (size, maskable) => {
  const pad = maskable ? size * 0.15 : 0;
  const inner = size - pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#020617" rx="${maskable ? size * 0.2 : size * 0.18}"/>
  <text x="${size / 2}" y="${size / 2 + inner * 0.18}" font-family="system-ui,sans-serif" font-weight="700" font-size="${inner * 0.58}" fill="#14b8a6" text-anchor="middle" dominant-baseline="middle">W</text>
  <text x="${size / 2}" y="${size * 0.82}" font-family="system-ui,sans-serif" font-weight="500" font-size="${inner * 0.13}" fill="#64748b" text-anchor="middle" letter-spacing="2">IQ</text>
</svg>`;
};

async function gen(filename, size, maskable = false) {
  const buf = Buffer.from(svg(size, maskable));
  await sharp(buf).png().toFile(join(publicDir, filename));
  console.log(`✓ ${filename}`);
}

await gen("icon-192.png", 192);
await gen("icon-512.png", 512);
await gen("icon-maskable.png", 512, true);
await gen("apple-touch-icon.png", 180);
