import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",

      // We manage our own public/manifest.json
      manifest: false,

      workbox: {
        // Precache all built assets
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff,woff2,webp}"],

        // All TanStack Router client-side routes fall back to index.html
        navigateFallback: "/index.html",

        // Never intercept proxied backend calls
        navigateFallbackDenylist: [
          /^\/listings/,
          /^\/orders/,
          /^\/payments/,
          /^\/auth/,
          /^\/users/,
          /^\/posts/,
        ],

        runtimeCaching: [
          {
            // Auth endpoints — never cache; always go straight to the network.
            // Caching auth responses (including the GET /auth/complete-profile
            // that CloudFront turns into a 200/HTML) causes the SW to serve stale
            // HTML for subsequent POST requests, breaking Google signup completion.
            urlPattern: /^\/auth(\/.*)?$/i,
            handler: "NetworkOnly",
          },
          {
            // Backend API — Network first, 10 s timeout, 24 h stale cache
            urlPattern: /^\/(listings|orders|payments|users|posts)(\/.*)?$/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "soko-api",
              expiration: { maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 10,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Product / farmer images — Cache first, 30 days
            urlPattern: /\.(?:png|jpe?g|svg|gif|webp|avif|ico)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "soko-images",
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },

      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: "index.html",
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    proxy: {
      "/listings": "http://localhost:80",
      "/orders": "http://localhost:80",
      "/payments": "http://localhost:80",
      "/auth": "http://localhost:80",
      "/users": "http://localhost:80",
      "/posts": "http://localhost:80",
      "/notifications": "http://localhost:80",
      "/message": "http://localhost:80",
      "/recommendations": "http://localhost:80",
      "/ml": "http://localhost:80",
      "/webhook": "http://localhost:80",
      "/ussd": "http://localhost:80",
    },
  },
});
