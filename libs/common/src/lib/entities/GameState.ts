import { MapSchema, Schema, type } from "@colyseus/schema";
import { Player } from "./Player.ts";

export interface GameStateProperties {
	players: Map<string, { id: string; score: number }>;
}

export class GameState extends Schema {
	@type({ map: Player }) players = new MapSchema<Player>();

	getPlayers(): [string, Player][] {
		return Array.from(this.players.entries());
	}

	addPlayer(playerId: string): void {
		this.players.set(playerId, new Player(playerId));
	}

	removePlayer(playerId: string): void {
		this.players.delete(playerId);
	}

	getPlayer(playerId: string): Player | undefined {
		return this.players.get(playerId);
	}

	hasPlayer(playerId: string): boolean {
		return this.players.has(playerId);
	}
}
