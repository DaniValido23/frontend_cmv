// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        // Fix dom-helpers ESM import issue
        'dom-helpers/position': 'dom-helpers/cjs/position.js',
        'dom-helpers/scrollLeft': 'dom-helpers/cjs/scrollLeft.js',
        'dom-helpers/scrollTop': 'dom-helpers/cjs/scrollTop.js',
        'dom-helpers/offset': 'dom-helpers/cjs/offset.js',
        'dom-helpers/height': 'dom-helpers/cjs/height.js',
        'dom-helpers/width': 'dom-helpers/cjs/width.js',
        'dom-helpers/contains': 'dom-helpers/cjs/contains.js',
        'dom-helpers/ownerDocument': 'dom-helpers/cjs/ownerDocument.js',
        'dom-helpers/listen': 'dom-helpers/cjs/listen.js',
        'dom-helpers/querySelectorAll': 'dom-helpers/cjs/querySelectorAll.js'
      }
    },
    optimizeDeps: {
      include: ['react-big-calendar', 'dom-helpers']
    },
    ssr: {
      noExternal: ['react-big-calendar', 'dom-helpers']
    }
  }
});