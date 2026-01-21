import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    // If deploying under a subfolder, set VITE_PUBLIC_BASE="/subfolder/"
    base: env.VITE_PUBLIC_BASE || "/",
    plugins: [react(), tailwindcss()],
    resolve: {
      // Ensure there is a single React instance to avoid "invalid hook call"
      alias: {
        react: path.resolve(__dirname, "node_modules/react"),
        "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      },
      dedupe: ["react", "react-dom"],
    },
    optimizeDeps: {
      include: ["react", "react-dom"],
    },
    server: {
      host: "0.0.0.0",
      port: 5000,
      strictPort: true,
      allowedHosts: [".replit.dev", ".replit.app", "localhost", "127.0.0.1"],
      hmr: {
        clientPort: 443,
      },
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          secure: false,
        },
        "/auth": {
          target: "http://localhost:3000",
          changeOrigin: true,
          secure: false,
        },
        "/uploads": {
          target: "http://localhost:3000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
