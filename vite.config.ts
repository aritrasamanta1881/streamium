import { sveltekit } from "@sveltejs/kit/vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Streamium",
        short_name: "Streamium",
        description: "Stream anything, anytime, anywhere, for free!!",
        theme_color: "#111827",
        background_color: "#111827",
        display: "fullscreen",
        start_url: "/",
        icons: [
          {
            src: "/favicon.png",
            sizes: "192x192 512×512",
            type: "image/png",
            purpose: "any maskable"
          },
          
        ]
      }
    })
  ],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});

