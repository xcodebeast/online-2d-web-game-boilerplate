import { createServer, type Server as HttpServer } from "node:http";
import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import cors from "cors";
// biome-ignore lint/nursery/noRestrictedDependencies: Colyseus uses Express for HTTP matchmaking.
import express from "express";
import { Rooms } from "../../../../libs/common/src/lib/types.ts";
import { GameRoom } from "../rooms/GameRoom.ts";

const createGameServer = (): { gameServer: Server; server: HttpServer } => {
	const app = express();
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(cors());
	app.get("/health", (_request, response): void => {
		response.json({ status: "ok" });
	});
	const server = createServer(app);
	const gameServer = new Server({
		greet: false,
		transport: new WebSocketTransport({ server }),
	});
	gameServer.define(Rooms.game, GameRoom);
	return { gameServer, server };
};

export { createGameServer };
