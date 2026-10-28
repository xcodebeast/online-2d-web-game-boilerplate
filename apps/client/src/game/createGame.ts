import { Game } from "phaser";
import { GAME_CONFIG } from "../constants/game.config.ts";

/** Creates the game only after the browser has loaded the engine chunk. */
const createGame = (parent: string): Game =>
	new Game({ ...GAME_CONFIG, parent });

export { createGame };
