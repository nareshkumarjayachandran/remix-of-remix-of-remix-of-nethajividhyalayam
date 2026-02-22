import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "logo.png", "nethaji_logo_print.webp"],
      manifest: {
        name: "Nethaji Vidhyalayam",
        short_name: "Nethaji",
        description: "Nethaji Vidhyalayam — School tools: Spoken English Practice, Worksheet Maker & FeeDesk",
        theme_color: "#1a365d",
        background_color: "#f0fdf4",
        display: "standalone",
        orientation: "any",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        shortcuts: [
          {
            name: "Spoken English Practice",
            short_name: "Speak English",
            description: "AI-powered Spoken English practice for kids",
            url: "/spoken-english",
            icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }],
          },
          {
            name: "Worksheet Maker",
            short_name: "Worksheets",
            description: "Generate Samacheer & Merry Birds worksheets",
            url: "/worksheet-maker",
            icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }],
          },
          {
            name: "FeeDesk",
            short_name: "FeeDesk",
            description: "Offline fee management portal",
            url: "/feedesk",
            icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }],
          },
          {
            name: "Question Paper Creator",
            short_name: "Q.Paper",
            description: "AI-powered question paper generator",
            url: "/question-paper",
            icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }],
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB – covers school photos
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}"],

        // Offline fallback: navigate to /offline.html when no cache available
        navigateFallback: "/offline.html",
        navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//],

        // Additional assets to always pre-cache
        additionalManifestEntries: [
          { url: "/offline.html", revision: "1" },
          { url: "/worksheet-maker", revision: null },
          { url: "/spoken-english", revision: null },
          { url: "/feedesk", revision: null },
          { url: "/question-paper", revision: null },
        ],

        runtimeCaching: [
          {
            // Supabase REST API – NetworkFirst (fresh data when online)
            urlPattern: /^https:\/\/ytqqkadcaihfzichukvw\.supabase\.co\/rest\/v1\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            // ElevenLabs TTS audio – CacheFirst 30 days for offline replay
            urlPattern: /\/functions\/v1\/elevenlabs-tts/i,
            handler: "CacheFirst",
            options: {
              cacheName: "spoken-english-tts-cache",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Worksheet + Spoken English + Question Paper feedback edge functions – NetworkFirst
            urlPattern: /\/functions\/v1\/(generate-worksheet|spoken-english-feedback|generate-question-paper)/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "edge-functions-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
              networkTimeoutSeconds: 10,
            },
          },
          {
            // AI chat edge function – NetworkFirst with short cache
            urlPattern: /\/functions\/v1\/school-chat/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "school-chat-cache",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 },
              networkTimeoutSeconds: 8,
            },
          },
          {
            // Supabase Auth – NetworkFirst so tokens refresh properly
            urlPattern: /^https:\/\/ytqqkadcaihfzichukvw\.supabase\.co\/auth\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-auth-cache",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 },
            },
          },
          {
            // Google Fonts stylesheet
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-cache" },
          },
          {
            // Google Fonts files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-files-cache",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // School photos and images – CacheFirst 7 days
            urlPattern: /\/photos\/.*\.(jpg|jpeg|png|webp)/i,
            handler: "CacheFirst",
            options: {
              cacheName: "school-photos-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
