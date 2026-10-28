import { Scene } from "phaser";
import { EventTypes } from "../../../../libs/common/src/lib/types.ts";
import { useGameStore } from "../stores/game.store.ts";

const SCORE_X = 100;
const SCORE_Y = 150;

export class GameScene extends Scene {
	constructor() {
		super("game");
	}

	static increaseScore(): void {
		useGameStore.getState().room?.send(EventTypes.increaseScore);
	}

	create(): void {
		const score = this.add
			.text(SCORE_X, SCORE_Y, "Click me (Game)")
			.setInteractive();
		score.on("pointerdown", GameScene.increaseScore);
		const unsubscribe = useGameStore.subscribe((state): void => {
			score.setText(`Click me (Game) - ${state.players.size} players`);
		});
		this.events.once("shutdown", unsubscribe);
	}
}
