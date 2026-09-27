import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const BACKEND = "http://localhost:8080";

// Dev: mọi call API/ảnh upload/nút mock gateway đi qua proxy ⇒ không dính CORS.
// Chỉ proxy /mock-gateway/payments (API của BE); /mock-gateway/checkout/:id là trang FE.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      "/api": BACKEND,
      "/uploads": BACKEND,
      "/mock-gateway/payments": BACKEND,
    },
  },
  preview: { port: 3000, strictPort: true },
  build: {
    rolldownOptions: {
      output: {
        // Tách vendor ổn định ra chunk riêng: cache lâu hơn, bundle app nhỏ lại.
        codeSplitting: {
          groups: [
            { name: "react", test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/, priority: 30 },
            { name: "query", test: /node_modules[\\/]@tanstack[\\/]/, priority: 20 },
            { name: "ui", test: /node_modules[\\/](radix-ui|@radix-ui|motion|motion-dom|motion-utils|framer-motion|lucide-react|sonner)[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    // Origin không có server: request lọt lưới mock thành lỗi mạng, không chạm dev server thật ở :3000.
    environmentOptions: { jsdom: { url: "http://localhost:9/" } },
    globals: true,
    setupFiles: ["./src/test/setup.js"],
    css: false,
  },
});
