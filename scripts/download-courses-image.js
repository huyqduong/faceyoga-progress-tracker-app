import sharp from 'sharp';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadAndOptimizeImage() {
  try {
    // Using an image that represents learning/courses
    const imageUrl = 'https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=1200&auto=format&fit=crop';
    
    console.log('Downloading image...');
    const response = await fetch(imageUrl);
    const buffer = await response.buffer();

    const outputPath = path.join(__dirname, '../public/images/tiles/courses.jpg');

    // Optimize and resize image
    await sharp(buffer)
      .resize(800, 600, {
        fit: 'cover',
        position: 'centre'
      })
      .jpeg({
        quality: 80,
        progressive: true
      })
      .toFile(outputPath);

    console.log('Image downloaded and optimized successfully!');

    // Update image credits
    const creditsPath = path.join(__dirname, '../public/images/tiles/image_credits.md');
    const newCredit = '\n- courses.jpg: Photo by Christin Hume on Unsplash';
    fs.appendFileSync(creditsPath, newCredit);
    console.log('Image credits updated!');

  } catch (error) {
    console.error('Error:', error);
  }
}

downloadAndOptimizeImage();
