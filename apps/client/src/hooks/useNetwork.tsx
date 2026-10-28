import { Client, type Room } from "@colyseus/sdk";
import { useEffect, useState } from "react";
import type { GameState } from "../../../../libs/common/src/lib/entities/GameState.ts";
import { Rooms } from "../../../../libs/common/src/lib/types.ts";
import { useGameStore } from "../stores/game.store.ts";

const useNetwork = (): string | null => {
	const [error, setError] = useState<string | null>(null);
	useEffect(() => {
		let disposed = false;
		let activeRoom: Room<GameState> | undefined;
		const update = (state: GameState): void => {
			if (activeRoom !== undefined && !disposed) {
				useGameStore.getState().unpackServerData(activeRoom, state);
			}
		};
		const connected = async (room: Room<GameState>): Promise<void> => {
			if (disposed) {
				await room.leave();
				return;
			}
			activeRoom = room;
			room.onStateChange(update);
			room.onLeave((): void => {
				if (!disposed) {
					useGameStore.getState().reset();
				}
			});
		};
		const failed = (cause: unknown): void => {
			if (disposed) {
				return;
			}
			let message = "Unable to join the game";
			if (cause instanceof Error) {
				({ message } = cause);
			}
			setError(message);
		};
		const client = new Client(
			import.meta.env.VITE_WS_SERVER_URL ?? "ws://localhost:3000",
		);
		client.joinOrCreate<GameState>(Rooms.game).then(connected).catch(failed);
		return (): void => {
			disposed = true;
			activeRoom?.removeAllListeners();
			activeRoom?.leave().catch(failed);
			useGameStore.getState().reset();
		};
	}, []);
	return error;
};

export { useNetwork };
