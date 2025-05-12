import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";

// https://vitejs.dev/config/
export default defineConfig({
  base:
    process.env.NODE_ENV === "development"
      ? "/"
      : process.env.VITE_BASE_PATH || "/",
  optimizeDeps: {
    // Limit entries to reduce initial scan size
    entries: ["src/main.tsx"],
    include: ["react", "react-dom", "react-router-dom"],
    // Disable dependency discovery in node_modules
    disabled: false,
    // Reduce esbuild memory usage
    esbuildOptions: {
      logLevel: "error",
      logLimit: 0,
      treeShaking: true,
    },
  },
  build: {
    // Disable sourcemap in development to save memory
    sourcemap: process.env.NODE_ENV === "production",
    // Optimize build process
    minify: "esbuild",
    cssMinify: "lightningcss",
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          auth: [
            "./src/components/auth/Login.tsx",
            "./src/components/auth/Register.tsx",
          ],
        },
      },
    },
  },
  plugins: [
    react({
      fastRefresh: true,
    }),
    tempo(),
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: true,
    // Reduce memory usage with hmr options
    hmr: {
      overlay: false,
    },
    // Limit watch to essential files
    watch: {
      usePolling: false,
      ignored: ["**/node_modules/**", "**/dist/**"],
    },
  },
});
