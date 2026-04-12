import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, 'public');
const logoPath = path.join(publicDir, 'logo.svg');

async function generateIcons() {
  if (!fs.existsSync(logoPath)) {
    console.error('logo.svg not found in public directory');
    process.exit(1);
  }

  const sizes = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
  ];

  for (const { name, size } of sizes) {
    const outputPath = path.join(publicDir, name);
    try {
      await sharp(logoPath)
        .resize(size, size, {
          background: { r: 0, g: 0, b: 0, alpha: 0 },
          fit: 'contain',
        })
        .png({ compressionLevel: 9 })
        .toFile(outputPath);
      console.log(`✓ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
    }
  }
}

generateIcons();
