import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import toIco from 'to-ico';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgPath = path.join(__dirname, '..', 'public', 'icons', 'icon.svg');
const outputDir = path.join(__dirname, '..', 'public', 'icons');
const sizes = [16, 32, 48, 128];

async function convert() {
  const svgBuffer = await sharp(svgPath).toBuffer();

  // Generate PNG icons
  await Promise.all(
    sizes.map((size) =>
      sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `icon${size}.png`))
    )
  );

  console.log('Icons generated:', sizes.map((s) => `icon${s}.png`).join(', '));

  // Generate ICO file (commonly used sizes for ICO: 16, 32, 48)
  const icoSizes = [16, 32, 48];
  const icoBuffers = await Promise.all(
    icoSizes.map((size) =>
      sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toBuffer()
    )
  );

  const icoBuffer = await toIco(icoBuffers);
  await fs.writeFile(path.join(outputDir, 'icon.ico'), icoBuffer);

  console.log('ICO icon generated: icon.ico');
}

convert().catch(console.error);