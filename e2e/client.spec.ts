// biome-ignore lint/correctness/noUnresolvedImports: Playwright re-exports these types through its test entry; TypeScript validates them.
import type { BrowserContext, Page, Route, TestInfo } from "@playwright/test";
import { expect, test as it } from "@playwright/test";

const SCORE_ONE = /score: 1$/u;
const SCORE_TWO = /score: 2$/u;

it("paints the UI before the engine loads, then renders one game and synchronizes clicks", async ({
	page,
	context,
}: {
	page: Page;
	context: BrowserContext;
}, testInfo: TestInfo): Promise<void> => {
	const errors: string[] = [];
	page.on("pageerror", (error: Error): void => {
		errors.push(error.message);
	});
	await it.step("render the shell while the engine is delayed", async (): Promise<void> => {
		const engine = Promise.withResolvers<void>();
		await page.route(
			"**/assets/phaser-*.js",
			async (route: Route): Promise<void> => {
				await engine.promise;
				await route.continue();
			},
		);
		await page.goto("/", { waitUntil: "domcontentloaded" });
		await expect(
			page.getByRole("button", { name: "Click me (UI)" }),
		).toBeVisible();
		await expect(page.locator("canvas")).toHaveCount(0);
		engine.resolve();
		await expect(page.locator("canvas")).toBeVisible();
	});
	await it.step("boot the requested renderer exactly once", async (): Promise<void> => {
		await expect(page.locator("canvas")).toHaveCount(1);
		const hasWebGl = await page
			.locator("canvas")
			.evaluate(
				(canvas: HTMLCanvasElement): boolean =>
					canvas.getContext("webgl2") !== null ||
					canvas.getContext("webgl") !== null,
			);
		expect(hasWebGl).toBe(testInfo.project.name === "webgl");
	});
	await it.step("synchronize both UI and canvas clicks with a second client", async (): Promise<void> => {
		const peer = await context.newPage();
		await peer.goto("/");
		await expect(
			peer.getByRole("button", { name: "Click me (UI)" }),
		).toBeEnabled();
		await page.getByRole("button", { name: "Click me (UI)" }).click();
		await expect(page.getByText(SCORE_ONE)).toHaveCount(1);
		await expect(peer.getByText(SCORE_ONE)).toHaveCount(1);
		await page.locator("canvas").click({ position: { x: 110, y: 155 } });
		await expect(page.getByText(SCORE_TWO)).toHaveCount(1);
		await expect(peer.getByText(SCORE_TWO)).toHaveCount(1);
	});
	expect(errors).toEqual([]);
});

it("shows a useful error when the game chunk fails to load", async ({
	page,
}: {
	page: Page;
}): Promise<void> => {
	await page.route(
		"**/assets/createGame-*.js",
		async (route: Route): Promise<void> => {
			await route.abort();
		},
	);
	await page.goto("/");
	await expect(page.getByRole("alert")).toHaveText(
		"Unable to load the game. Please reload the page to try again.",
	);
	await expect(page.locator("canvas")).toHaveCount(0);
});
