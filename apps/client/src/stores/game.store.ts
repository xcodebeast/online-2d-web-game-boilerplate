import type { Room } from "@colyseus/sdk";
import { create, type StoreApi } from "zustand";
import type {
	GameState,
	GameStateProperties,
} from "../../../../libs/common/src/lib/entities/GameState.ts";

export interface GameStore extends GameStateProperties {
	room: Room<GameState> | null;
	unpackServerData: (room: Room<GameState>, incomingState: GameState) => void;
	reset: () => void;
}

export const useGameStore = create<GameStore>()(
	(set: StoreApi<GameStore>["setState"]) => ({
		unpackServerData: (
			room: Room<GameState>,
			incomingState: GameState,
		): void => {
			const players = new Map(
				Array.from(incomingState.players.entries(), ([id, player]) => [
					id,
					{ id: player.id, score: player.score },
				]),
			);
			set({ players, room });
		},
		reset: (): void => set({ room: null, players: new Map() }),
		room: null,
		players: new Map(),
	}),
);
