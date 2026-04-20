import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgPath = path.join(__dirname, '..', 'public', 'icons', 'icon.svg');
const outputDir = path.join(__dirname, '..', 'public', 'icons');
const sizes = [16, 32, 48, 128];

async function convert() {
  const svgBuffer = await sharp(svgPath).toBuffer();

  await Promise.all(
    sizes.map((size) =>
      sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `icon${size}.png`))
    )
  );

  console.log('Icons generated:', sizes.map((s) => `icon${s}.png`).join(', '));
}

convert().catch(console.error);