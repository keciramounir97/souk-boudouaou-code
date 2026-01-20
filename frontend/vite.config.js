import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

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
      host: true, // Listen on all network interfaces (public and private IP)
      port: 5173,
      strictPort: false,
      proxy: {
        "/api": {
          // Use VITE_DEV_PROXY_TARGET or default to localhost:5000
          target: process.env.VITE_DEV_PROXY_TARGET || "http://localhost:5000",
          changeOrigin: true,
          secure: false,
        },
        "/auth": {
          target: process.env.VITE_DEV_PROXY_TARGET || "http://localhost:5000",
          changeOrigin: true,
          secure: false,
        },
        "/uploads": {
          target: process.env.VITE_DEV_PROXY_TARGET || "http://localhost:5000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
