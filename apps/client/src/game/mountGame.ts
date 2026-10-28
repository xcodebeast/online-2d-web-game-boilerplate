interface GameHandle {
	destroy: (removeCanvas: boolean) => void;
}
type GameLoader = () => Promise<() => GameHandle>;

/** Owns an asynchronous game instance and cancels creation when its host unmounts. */
const mountGame = (
	load: GameLoader,
	onError: (error: unknown) => void,
): (() => void) => {
	let disposed = false;
	let game: GameHandle | undefined;
	load()
		.then((createGame): void => {
			if (!disposed) {
				game = createGame();
			}
		})
		.catch((error: unknown): void => {
			if (!disposed) {
				onError(error);
			}
		});
	return (): void => {
		disposed = true;
		game?.destroy(true);
	};
};

export { mountGame };
