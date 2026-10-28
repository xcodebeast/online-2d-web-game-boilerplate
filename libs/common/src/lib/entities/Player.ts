import { Schema, type } from "@colyseus/schema";

export class Player extends Schema {
	@type("string") id = "";
	@type("number") score = 0;

	constructor(id = "") {
		super();
		this.id = id;
	}

	increaseScore(): void {
		this.score += 1;
	}
}
