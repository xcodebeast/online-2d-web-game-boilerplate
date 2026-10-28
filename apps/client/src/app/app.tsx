import type { Game } from "phaser";
import { type JSX, useEffect, useId, useState } from "react";
import { EventTypes } from "../../../../libs/common/src/lib/types.ts";
import { mountGame } from "../game/mountGame.ts";
import { useNetwork } from "../hooks/useNetwork.tsx";
import { useGameStore } from "../stores/game.store.ts";

const increaseScore = (): void => {
	useGameStore.getState().room?.send(EventTypes.increaseScore);
};
const CLICK_LABEL = "Click me (UI)";
const SCORE_HEADING = "Player scores:";
function GameUi(): JSX.Element {
	const room = useGameStore((state) => state.room);
	const players = useGameStore((state) => state.players);
	const error = useNetwork();
	return (
		<div className="flex justify-between p-2">
			<button disabled={room === null} onClick={increaseScore} type="button">
				{CLICK_LABEL}
			</button>
			{error !== null && <p role="alert">{error}</p>}
			{players.size > 0 && (
				<div className="flex flex-col gap-y-2">
					<h1>{SCORE_HEADING}</h1>
					{Array.from(players, ([id, player]) => (
						<p key={id}>{`Player ${id} score: ${player.score}`}</p>
					))}
				</div>
			)}
		</div>
	);
}
const GAME_ERROR =
	"Unable to load the game. Please reload the page to try again.";
const loadGame = async (parent: string): Promise<() => Game> => {
	const { createGame } = await import("../game/createGame.ts");
	return (): Game => createGame(parent);
};
function App(): JSX.Element {
	const containerId = useId();
	const [gameError, setGameError] = useState<boolean>(false);
	useEffect(
		() =>
			mountGame(
				() => loadGame(containerId),
				(): void => setGameError(true),
			),
		[containerId],
	);
	return (
		<div id={containerId}>
			<GameUi />
			{gameError === true && <p role="alert">{GAME_ERROR}</p>}
		</div>
	);
}

export { App };
