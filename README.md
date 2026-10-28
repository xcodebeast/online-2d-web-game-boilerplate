# Online Web Game Boilerplate

A React and Phaser client with a Colyseus multiplayer server, shared TypeScript game state, and Zustand stores.

## Setup

Install [Bun](https://bun.com/docs/installation) 1.4.4 or newer. The pinned version is in `.bun-version`.

```sh
git clone https://github.com/xcodebeast/online-2d-web-game-boilerplate.git
cd online-2d-web-game-boilerplate
bun install --frozen-lockfile
cp apps/client/.env.example apps/client/.env
cp apps/server/.env.example apps/server/.env
bun run dev
```

Open [http://localhost:8080](http://localhost:8080). The server listens on port 3000. Set `VITE_WS_SERVER_URL` in `apps/client/.env` to change the client endpoint, and `PORT` in `apps/server/.env` to change the server port. Restart the relevant development process after changing environment variables.

Run the apps separately with `bun run client:serve` and `bun run server:serve`.

## Checks

```sh
bun run lint        # Biome formatting, imports, and strict lint rules
bun run lint:fix    # Apply safe automatic fixes
bun run typecheck
bun run test
bun run build
bun run check       # Run all checks above
```

Biome enables every available lint rule at error severity, including nursery rules. Framework and runtime exceptions are scoped in `biome.json`: Qwik serialization rules do not apply to React or the server, React web uses React props and DOM text, the server and Vite configuration can use Bun-compatible Node APIs, and Bun tests can import `bun:test`. The dependency restriction rule is disabled for the package manifest because Colyseus requires Express. Other necessary exceptions have comments beside the code. The VS Code recommendations include the Biome extension. Bun is the runtime, package manager, and test runner; commit changes to `bun.lock` when updating dependencies.

Nx coordinates the client and server tasks. The server uses Bun's bundler and watch mode. The client uses Vite with React and Tailwind CSS 4. Nx targets use explicit commands so the latest TypeScript and Vite do not depend on the compatibility ranges of Nx build plugins. Shared state lives in `libs/common` and uses Colyseus schema decorators.

## Deployment

```sh
bun run build
bun run server:start
```

The client build is in `dist/apps/client`; serve it with a static web server. The server build is in `dist/apps/server` and requires Bun plus the production dependencies. Set `VITE_WS_SERVER_URL` before building the client to point at the deployed server's public WebSocket endpoint. Use `wss://` when the client uses HTTPS.

For local containers, install Docker and run:

```sh
bun run build
docker compose up --build
```

The client is available on port 8080 and the server on port 3000. Docker builds use the existing `dist` output. Run `bun run build` again after source changes. The server image installs production dependencies from the frozen Bun lockfile and runs as an unprivileged user.

## Contributing

Run `bun run check` before opening a pull request.
