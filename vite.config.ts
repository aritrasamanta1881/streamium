import { sveltekit } from "@sveltejs/kit/vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sveltekit(),
          
        ]
      }
    })
  ],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});

