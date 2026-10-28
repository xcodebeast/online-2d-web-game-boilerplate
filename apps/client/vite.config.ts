import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// biome-ignore lint/style/noDefaultExport: Vite loads its configuration from the default export.
export default defineConfig({
	root: fileURLToPath(new URL(".", import.meta.url)),
	cacheDir: "../../node_modules/.vite/apps/client",
	server: { host: true, strictPort: true, port: 8080 },
	plugins: [react(), tailwindcss()],
	build: { outDir: "../../dist/apps/client", emptyOutDir: true },
});
