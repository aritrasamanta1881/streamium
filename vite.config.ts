import { sveltekit } from "@sveltejs/kit/vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      registerType: "autoUpdate",
      strategies: "generateSW", //
      srcDir: 'src',   //
      scope: '/',     //
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
            src: "favicon.png",
            sizes: "512×512",
            type: "image/png",
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

