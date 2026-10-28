import { createGameServer } from "./lib/server.ts";

const DEFAULT_PORT = 3000;
const MAX_PORT = 65_535;
const port = Number(Bun.env.PORT ?? DEFAULT_PORT);
if (!Number.isInteger(port) || port < 1 || port > MAX_PORT) {
	throw new Error("PORT must be an integer between 1 and 65535");
}
const { gameServer } = createGameServer();
await gameServer.listen(port);
