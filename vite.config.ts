import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/pokerclock/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.svg', 'icons/icon-512.svg'],
      manifest: {
        name: 'Poker Match Clock',
        short_name: 'Poker Clock',
        description: 'Mobile-first Texas Hold\'em home tournament clock',
        theme_color: '#2c2c2e',
        background_color: '#2c2c2e',
        display: 'standalone',
        start_url: '/pokerclock/',
        scope: '/pokerclock/',
        icons: [
          {
            src: '/pokerclock/icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/pokerclock/icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}']
      }
    })
  ]
});
