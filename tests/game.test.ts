import { expect, test as it } from "bun:test";
import { Colors, colorize } from "../apps/server/src/lib/log.ts";
import { GameState } from "../libs/common/src/lib/entities/GameState.ts";

it("player scores start at zero and players can be removed", (): void => {
	const state = new GameState();
	state.addPlayer("player");
	const player = state.getPlayer("player");
	expect(player?.score).toBe(0);
	player?.increaseScore();
	expect(player?.score).toBe(1);
	state.removePlayer("player");
	expect(state.hasPlayer("player")).toBe(false);
});

it("error color has a defined ANSI escape", (): void => {
	// biome-ignore lint/security/noSecrets: This is an ANSI color escape, not a credential.
	expect(colorize("failure", Colors.red)).toBe("\x1b[1;31;47mfailure\x1b[0m");
});
