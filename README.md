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

## Client bundle

The browser loads the React UI first. Phaser and the Colyseus SDK load asynchronously in parallel. A failed game download shows a reload message, and unmounting while it downloads cancels game creation.

Vite resolves `phaser` to the package's source `phaser-core.js` entry. This includes scenes, cameras, input, loaders, tweens, and the core Text, Sprite, Image, Graphics, and Layer factories. Both WebGL and the Canvas fallback remain enabled. The starter does not include physics, tilemaps, particles, the extended game-object factories, sound, or WebGL debugging tools.

To add those features, select the appropriate entry in `apps/client/vite.config.ts` (`phaser-arcade-physics.js` or `phaser.js` under `src`) and enable `FEATURE_SOUND` if needed. Add browser coverage for the features you enable and review the measured download before changing a size limit. Phaser's upstream TypeScript declarations describe the full engine; they do not restrict you to the selected core build.

The engine's renderer, game objects, and remaining systems have separate cached chunks. `strictExecutionOrder` preserves CommonJS initialization across those chunks. The initial import graph never includes the engine. Size checks include every lazy chunk, so moving bytes into more files cannot pass the total-size limit by itself.

```sh
bun run build
bun run bundle:check
bun --bun playwright install chromium
bun run test:browser
```

CI enforces 500,000 uncompressed bytes per JavaScript chunk, 90,000 gzip bytes for the initial static import graph, and 360,000 gzip bytes across all JavaScript. Browser tests use the production build to verify both WebGL and Canvas, delayed/failed engine downloads, and multiplayer clicks from the UI and the game canvas. `bun run check` includes the bundle check; browser tests run separately after the build.
