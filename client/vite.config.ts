import path from "node:path";
import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";

const SEPARATE_MODULES = ["react-router", "flowbite-react", "react-icons"];

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      lib: path.resolve(__dirname, "./src/lib"),
      components: path.resolve(__dirname, "./src/components"),
      pages: path.resolve(__dirname, "./src/pages"),
      assets: path.resolve(__dirname, "./src/assets"),
    },
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      plugins: [visualizer({ filename: "./dist/stats.html" }) as PluginOption],
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react") &&
              !SEPARATE_MODULES.some((module) => id.includes(module))
            ) {
              return "react-vendor";
            }
            for (const module of SEPARATE_MODULES) {
              if (id.includes(module)) {
                return module;
              }
            }
            return "vendor";
          }
        },
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      includeAssets: [
        "favicon.svg",
        "robots.txt",
        "icons/*.png",
        "assets/fonts/*",
      ],
      registerType: "autoUpdate",
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      devOptions: {
        enabled: true,
        type: "module",
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\.(?:js|css|woff2?|eot|ttf|svg|png|jpg|jpeg|gif|ico)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "assets-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: /\/api\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60,
              },
            },
          },
        ],
      },
      manifest: {
        name: "React Frontend Optimization",
        short_name: "ReactFrontendOptimization",
        description: "React Frontend Optimization",
        theme_color: "#dd2f44",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});