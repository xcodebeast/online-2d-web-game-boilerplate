import { expect, test as it } from "bun:test";
import { Client, type Room } from "@colyseus/sdk";
import { useGameStore } from "../apps/client/src/stores/game.store.ts";
import { createGameServer } from "../apps/server/src/lib/server.ts";
import type { GameState } from "../libs/common/src/lib/entities/GameState.ts";
import { EventTypes, Rooms } from "../libs/common/src/lib/types.ts";

const STATE_TIMEOUT = 2000;
const waitForState = async (
	room: Room<GameState>,
	matches: (state: GameState) => boolean,
): Promise<void> => {
	if (room.state?.players !== undefined && matches(room.state)) {
		return;
	}
	await new Promise<void>((resolve, reject) => {
		const timeout = setTimeout((): void => {
			room.onStateChange.remove(changed);
			reject(new Error("Timed out waiting for synchronized state"));
		}, STATE_TIMEOUT);
		const changed = (state: GameState): void => {
			if (matches(state)) {
				clearTimeout(timeout);
				room.onStateChange.remove(changed);
				resolve();
			}
		};
		room.onStateChange(changed);
	});
};
// biome-ignore lint/nursery/noExcessiveStatementsPerFunction: This integration scenario keeps both clients and cleanup in one lifecycle.
it("two clients share score updates and leaving removes the player", async (): Promise<void> => {
	const { gameServer, server } = createGameServer();
	await gameServer.listen(0, "127.0.0.1");
	const address = server.address();
	if (address === null || typeof address === "string") {
		throw new Error("Missing server address");
	}
	const endpoint = `http://127.0.0.1:${address.port}`;
	let first: Room<GameState> | undefined;
	let second: Room<GameState> | undefined;
	try {
		const response = await fetch(`${endpoint}/health`);
		expect(await response.json()).toEqual({ status: "ok" });
		first = await new Client(endpoint).joinOrCreate<GameState>(Rooms.game);
		second = await new Client(endpoint).joinOrCreate<GameState>(Rooms.game);
		expect(second.roomId).toBe(first.roomId);
		await waitForState(second, (state): boolean => state.players.size === 2);
		const playerId = first.sessionId;
		first.send(EventTypes.increaseScore);
		await waitForState(
			second,
			(state): boolean => state.players.get(playerId)?.score === 1,
		);
		const snapshot = useGameStore.getState();
		snapshot.unpackServerData(second, second.state);
		const previousPlayers = useGameStore.getState().players;
		first.send(EventTypes.increaseScore);
		await waitForState(
			second,
			(state): boolean => state.players.get(playerId)?.score === 2,
		);
		snapshot.unpackServerData(second, second.state);
		expect(previousPlayers.get(playerId)?.score).toBe(1);
		expect(useGameStore.getState().players.get(playerId)?.score).toBe(2);
		await first.leave();
		await waitForState(
			second,
			(state): boolean => !state.players.has(playerId),
		);
	} finally {
		await first?.leave();
		await second?.leave();
		useGameStore.getState().reset();
		await gameServer.gracefullyShutdown(false);
	}
});
