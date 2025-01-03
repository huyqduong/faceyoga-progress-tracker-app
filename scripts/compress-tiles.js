import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const images = [
  'courses',
  'dashboard',
  'lessons',
  'progress'
];

const tilesDir = path.join(__dirname, '..', 'public', 'images', 'tiles');
const tempDir = path.join(tilesDir, 'temp');

async function processImage(imageName) {
  const inputPath = path.join(tilesDir, `${imageName}.jpg`);
  const tempPath = path.join(tempDir, `${imageName}_compressed.jpg`);
  const finalPath = path.join(tilesDir, `${imageName}.jpg`);

  // Create backup of original
  await fs.copyFile(inputPath, path.join(tempDir, `${imageName}_original.jpg`));

  // Compress image
  await sharp(inputPath)
    .resize(800, 600, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({
      quality: 80,
      progressive: true,
    })
    .toFile(tempPath);

  // Replace original with compressed version
  await fs.rename(tempPath, finalPath);
}

async function main() {
  // Create temp directory
  await fs.mkdir(tempDir, { recursive: true });

  for (const imageName of images) {
    console.log(`Processing ${imageName}.jpg...`);
    
    try {
      await processImage(imageName);
      console.log(`✓ Compressed ${imageName}.jpg`);
    } catch (error) {
      console.error(`Error processing ${imageName}.jpg:`, error);
    }
  }

  console.log('\nAll images compressed successfully!');
  console.log('Original images backed up in tiles/temp directory');
}

main().catch(console.error);
