import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa';
import reactRefresh from '@vitejs/plugin-react-refresh';
import replace from "@rollup/plugin-replace";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRefresh(),
    VitePWA({
      base: "/",
      srcDir: "src",
      filename: "scripts/sw.ts",
      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png"
      ],
      strategies: "injectManifest",
      workbox: {
        sourcemap: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\/api\/.*\/*.json/,
            handler: 'NetworkOnly',
            method: 'POST',
            options: {
              backgroundSync: {
                name: 'bg-sync-general',
                options: {
                  maxRetentionTime: 24 * 60
                }
              }
            }
          }
        ]
      },
      manifest: {
        name: "Podra",
        short_name: "Podra",
        description: "Keep up with highlights from internet communities with Podra, your web desktop with newsboard analytics.",
        theme_color: "#504a4a",
        background_color: "#504a4a",
        display: "standalone",
        icons: [
          {
            src: "android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      }
    }),
    replace({
      __RELOAD_SW__: process.env.RELOAD_SW === "true" ? "true": "false"
    })
  ],
  define: {
    "global": {}
  }
})
