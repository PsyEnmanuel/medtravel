import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';

export default defineConfig({
  // ...vite configures
  build: {
    ssr: false,
    minify: false
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './src/index.js',
    })
  ],
});