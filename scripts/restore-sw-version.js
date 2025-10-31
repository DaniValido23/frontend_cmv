import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SW_PATH = join(__dirname, '..', 'public', 'sw.js');

try {
  let swContent = readFileSync(SW_PATH, 'utf8');
  swContent = swContent.replace(/medical-clinic-v\d+/g, 'medical-clinic-v__BUILD_TIME__');
  writeFileSync(SW_PATH, swContent, 'utf8');
  console.log('✓ Service Worker version placeholder restored');
} catch (error) {
  console.error('Error restoring SW version:', error);
  process.exit(1);
}
