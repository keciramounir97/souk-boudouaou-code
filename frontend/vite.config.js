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
      host: "0.0.0.0",
      port: 5000,
      strictPort: true,
      allowedHosts: [
        "5550e58c-d211-4ebe-9a5a-5799c7b3f74f-00-3r0pxbo27gedi.picard.replit.dev",
        ".replit.dev",
        ".replit.app"
      ],
      proxy: {
        "/api": {
          target: process.env.VITE_DEV_PROXY_TARGET || "http://localhost:3000",
          changeOrigin: true,
          secure: false,
        },
        "/auth": {
          target: process.env.VITE_DEV_PROXY_TARGET || "http://localhost:3000",
          changeOrigin: true,
          secure: false,
        },
        "/uploads": {
          target: process.env.VITE_DEV_PROXY_TARGET || "http://localhost:3000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
