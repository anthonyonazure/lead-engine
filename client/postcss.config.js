import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  plugins: [
    tailwindcss({ config: resolve(__dirname, 'tailwind.config.js') }),
    autoprefixer(),
  ],
};
