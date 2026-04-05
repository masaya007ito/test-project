import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    {
      name: 'topojson-loader',
      transform(code, id) {
        if (id.endsWith('.topojson')) {
          const fs = require('fs');
          const content = fs.readFileSync(id, 'utf-8');
          return {
            code: `export default ${content};`,
            map: null,
          };
        }
      },
    },
    react(),
  ],
  base: './',
  json: {
    stringify: true,
  },
});
