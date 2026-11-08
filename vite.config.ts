import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  // 3000 = FRONTEND_URL padrão e CORS_ALLOWED_ORIGINS do backend (dev)
  server: { port: 3000 },
});
