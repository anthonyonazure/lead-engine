import 'dotenv/config';
import { resetAndSeed } from '../server/lib/seed.js';

console.log('[seed] resetting demo leads...');
resetAndSeed();
console.log('[seed] done');
