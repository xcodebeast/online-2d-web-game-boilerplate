import { defineConfig } from "@playwright/test";

// biome-ignore lint/style/noDefaultExport: Playwright loads its configuration from the default export.
export default defineConfig({
	testDir: "./e2e",
	workers: 1,
	// biome-ignore lint/style/useNamingConvention: Playwright requires the baseURL option name.
	use: { baseURL: "http://127.0.0.1:8080", trace: "retain-on-failure" },
	projects: [
		{
			name: "webgl",
			use: {
				launchOptions: {
					args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
				},
			},
		},
		{ name: "canvas", use: { launchOptions: { args: ["--disable-webgl"] } } },
	],
	webServer: [
		{ command: "bun run server:start", url: "http://127.0.0.1:3000/health" },
		{
			command:
				"bun --bun vite preview --config apps/client/vite.config.ts --configLoader native --host 127.0.0.1 --port 8080",
			url: "http://127.0.0.1:8080",
		},
	],
});
