import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// biome-ignore lint/style/noDefaultExport: Vite loads its configuration from the default export.
export default defineConfig({
	root: fileURLToPath(new URL(".", import.meta.url)),
	cacheDir: "../../node_modules/.vite/apps/client",
	server: { host: true, strictPort: true, port: 8080 },
	// The prebuilt distribution retains unused systems; the upstream core source omits them.
	resolve: {
		alias: {
			phaser: fileURLToPath(
				new URL(
					"../../node_modules/phaser/src/phaser-core.js",
					import.meta.url,
				),
			),
		},
	},
	// Phaser uses typeof expressions as compile-time feature switches.
	define: {
		"typeof CANVAS_RENDERER": "true",
		"typeof WEBGL_RENDERER": "true",
		"typeof WEBGL_DEBUG": "false",
		"typeof FEATURE_SOUND": "false",
		"typeof PLUGIN_CAMERA3D": "false",
		"typeof PLUGIN_FBINSTANT": "false",
		global: "globalThis",
	},
	plugins: [react(), tailwindcss()],
	build: {
		outDir: "../../dist/apps/client",
		emptyOutDir: true,
		manifest: true,
		rolldownOptions: {
			preserveEntrySignatures: "allow-extension",
			output: {
				// Preserve side-effect registration order across Phaser CommonJS modules.
				strictExecutionOrder: true,
				codeSplitting: {
					includeDependenciesRecursively: false,
					groups: [
						{
							name: "phaser-objects",
							test: /[\\/]node_modules[\\/]phaser[\\/]src[\\/]gameobjects[\\/]/u,
							priority: 20,
						},
						{
							name: "phaser-renderer",
							test: /[\\/]node_modules[\\/]phaser[\\/]src[\\/]renderer[\\/]/u,
							priority: 30,
						},
						{
							name: "phaser-engine",
							test: /[\\/]node_modules[\\/]phaser[\\/]/u,
							priority: 10,
						},
					],
				},
			},
		},
	},
});
