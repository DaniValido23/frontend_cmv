import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SW_PATH = join(__dirname, '..', 'public', 'sw.js');
const BUILD_TIME = Date.now();

try {
  let swContent = readFileSync(SW_PATH, 'utf8');
  swContent = swContent.replace(/__BUILD_TIME__/g, BUILD_TIME);
  writeFileSync(SW_PATH, swContent, 'utf8');
  console.log(`✓ Service Worker version injected: ${BUILD_TIME}`);
} catch (error) {
  console.error('Error injecting SW version:', error);
  process.exit(1);
}
