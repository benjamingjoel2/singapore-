// Generates responsive AVIF + WebP variants from images/src/*.jpg into public/img/,
// and writes images/meta.json (intrinsic size + widths) used by the build.
// Run once after adding or replacing photos: npm run images  (needs the sharp devDependency)
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = path.join(ROOT, 'images/src');
const OUT = path.join(ROOT, 'public/img');
const WIDTHS = [400, 800, 1200, 1600, 2000];
fs.mkdirSync(OUT, { recursive: true });
const metaPath = path.join(ROOT, 'images/meta.json');
const meta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, 'utf8')) : {};
const only = process.argv.slice(2);

const files = fs.readdirSync(SRC).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
const work = async (f) => {
  const key = f.replace(/\.[^.]+$/, '');
  if (only.length && !only.includes(key)) return;
  const img = sharp(path.join(SRC, f)).rotate();
  const { width, height } = await img.metadata();
  const widths = WIDTHS.filter((w) => w <= width);
  if (!widths.length || widths.at(-1) < width && widths.length < WIDTHS.length) widths.push(Math.min(width, 2000));
  const uniq = [...new Set(widths)].sort((a, b) => a - b);
  await Promise.all(uniq.flatMap((w) => {
    const base = sharp(path.join(SRC, f)).rotate().resize({ width: w, withoutEnlargement: true });
    return [base.clone().avif({ quality: 48, effort: 2 }).toFile(path.join(OUT, `${key}-${w}.avif`)),
      base.clone().webp({ quality: 70, effort: 4 }).toFile(path.join(OUT, `${key}-${w}.webp`))];
  }));
  const ratio = height / width;
  meta[key] = { w: 2000 > width ? width : 2000, h: Math.round((2000 > width ? width : 2000) * ratio), widths: uniq };
  console.log(key, uniq.join(','));
};
const queue = [...files];
await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) await work(queue.shift()); }));
fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
