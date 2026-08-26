import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // necesario para que el puerto reenviado de Codespaces funcione
    port: 5173,
  },
});
