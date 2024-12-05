import fetch from 'node-fetch';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const images = [
  {
    name: 'dashboard',
    url: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c',
  },
  {
    name: 'exercises',
    url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9',
  },
  {
    name: 'progress',
    url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15',
  },
  {
    name: 'goals',
    url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b',
  },
  {
    name: 'history',
    url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe',
  },
  {
    name: 'profile',
    url: 'https://images.unsplash.com/photo-1606902965551-dce093cda6e7',
  },
  {
    name: 'admin',
    url: 'https://images.unsplash.com/photo-1542744094-24638eff58bb',
  },
];

const outputDir = path.join(__dirname, '..', 'public', 'images', 'tiles');
const tempDir = path.join(outputDir, 'temp');

async function downloadImage(url, filepath) {
  const response = await fetch(url);
  const buffer = await response.buffer();
  await fs.writeFile(filepath, buffer);
}

async function processImage(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(800, 600, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({
      quality: 80,
      progressive: true,
    })
    .toFile(outputPath);
}

async function main() {
  // Create directories if they don't exist
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(tempDir, { recursive: true });

  for (const image of images) {
    const tempPath = path.join(tempDir, `${image.name}_temp.jpg`);
    const finalPath = path.join(outputDir, `${image.name}.jpg`);

    console.log(`Processing ${image.name}...`);
    
    try {
      // Download
      console.log(`- Downloading...`);
      await downloadImage(image.url, tempPath);

      // Process
      console.log(`- Optimizing...`);
      await processImage(tempPath, finalPath);

      console.log(`✓ Completed ${image.name}`);
    } catch (error) {
      console.error(`Error processing ${image.name}:`, error);
    }
  }

  // Clean up temp directory
  await fs.rm(tempDir, { recursive: true, force: true });
  console.log('\nAll images processed successfully!');
}

main().catch(console.error);
