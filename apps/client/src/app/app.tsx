import { Game } from "phaser";
import { type JSX, useEffect } from "react";
import { EventTypes } from "../../../../libs/common/src/lib/types.ts";
import { GAME_CONFIG, GAME_CONTAINER } from "../constants/game.config.ts";
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
function App(): JSX.Element {
	useEffect(() => {
		const game = new Game(GAME_CONFIG);
		return (): void => game.destroy(true);
	}, []);
	return (
		<div id={GAME_CONTAINER}>
			<GameUi />
		</div>
	);
}

export { App };
