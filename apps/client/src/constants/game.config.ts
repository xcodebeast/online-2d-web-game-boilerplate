import { AUTO, Scale, type Types } from "phaser";
import { GameScene } from "../scenes/GameScene.ts";

export const GAME_CONFIG: Types.Core.GameConfig = {
	type: AUTO,
	scale: {
		mode: Scale.ScaleModes.RESIZE,
		width: window.innerWidth,
		height: window.innerHeight,
	},
	scene: [GameScene],
};
