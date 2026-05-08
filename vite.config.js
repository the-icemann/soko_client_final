import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), tanstackRouter({ target: "react", autoCodeSplitting: true }), react()],
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
    },
  },
});
