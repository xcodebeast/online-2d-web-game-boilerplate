import Phaser from "phaser";
import { GameScene } from "../scenes/GameScene.ts";

export const GAME_CONTAINER = "game-container";

export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: GAME_CONTAINER,
	scale: {
		mode: Phaser.Scale.ScaleModes.RESIZE,
		width: window.innerWidth,
		height: window.innerHeight,
	},
	scene: [GameScene],
};
