import { expect, test as it, mock } from "bun:test";
import { mountGame } from "../apps/client/src/game/mountGame.ts";

it("does not create a game after its host unmounts during loading", async (): Promise<void> => {
	const createGame = mock(() => ({ destroy: mock() }));
	const loaded = Promise.withResolvers<typeof createGame>();
	const dispose = mountGame(() => loaded.promise, mock());
	dispose();
	loaded.resolve(createGame);
	await loaded.promise;
	expect(createGame).not.toHaveBeenCalled();
});

it("destroys the loaded game when its host unmounts", async (): Promise<void> => {
	const destroy = mock();
	const loaded = Promise.resolve(() => ({ destroy }));
	const dispose = mountGame(() => loaded, mock());
	await loaded;
	dispose();
	expect(destroy).toHaveBeenCalledWith(true);
});

it("reports a failed engine load without an unhandled rejection", async (): Promise<void> => {
	const error = new Error("Engine download failed");
	const onError = mock();
	const settled = Promise.withResolvers<void>();
	mountGame(
		() => Promise.reject(error),
		(cause: unknown): void => {
			onError(cause);
			settled.resolve();
		},
	);
	await settled.promise;
	expect(onError).toHaveBeenCalledWith(error);
});
