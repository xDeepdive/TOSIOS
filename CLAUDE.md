# CLAUDE.md - AI Assistant Guide for TOSIOS

This document provides comprehensive information about the TOSIOS (The Open-Source IO Shooter) codebase for AI assistants working on this project.

## Project Overview

TOSIOS is an open-source multiplayer browser-based shooter game built with TypeScript. It features:
- Real-time multiplayer gameplay using WebSockets
- Authoritative server architecture with client-side prediction
- 2D graphics rendered with WebGL (PIXI.js)
- Support for desktop and mobile browsers
- Monorepo structure with shared code between client and server

**Current Version**: 0.16.1
**License**: MIT
**Node Version**: 14.18.2 (see `.nvmrc`)

## Architecture Overview

### Monorepo Structure

This is a **Yarn workspaces** monorepo with three main packages:

```
/home/user/TOSIOS/
├── packages/
│   ├── client/          # @tosios/client - React + PIXI.js frontend
│   ├── server/          # @tosios/server - Colyseus game server
│   └── common/          # @tosios/common - Shared utilities and types
├── scripts/             # Build and development scripts
└── images/              # Documentation assets
```

### Package Responsibilities

**Client** (`packages/client/`):
- Renders game graphics using PIXI.js
- Handles user input (keyboard, mouse, touch)
- Manages WebSocket connection to game server
- Implements client-side prediction and interpolation
- Provides React-based UI for lobby and game

**Server** (`packages/server/`):
- Authoritative game state management
- Physics and collision detection
- Player authentication and room management
- State synchronization via Colyseus
- Serves static client files in production

**Common** (`packages/common/`):
- Shared constants and configuration
- Type definitions and interfaces
- Collision detection system (R-Tree)
- Map data and Tiled format support
- Math and geometry utilities

## Technology Stack

### Core Technologies
- **Language**: TypeScript 4.6.2 (ES2017 target)
- **Runtime**: Node.js 14.18.2
- **Package Manager**: Yarn (workspaces enabled)
- **Build Tool**: esbuild 0.14.25

### Client-Side Stack
- **UI**: React 16.12.0 + React DOM
- **Game Engine**: PIXI.js 6.2.2 (WebGL renderer)
- **Routing**: @reach/router 1.2.1
- **Networking**: Colyseus.js 0.14.0
- **Viewport**: pixi-viewport 4.5.0 (camera management)
- **Particles**: pixi-particles 4.2.0
- **Audio**: Howler.js 2.2.1
- **Mobile**: react-nipple 1.0.1 (virtual joystick)
- **Analytics**: react-ga 3.2.0

### Server-Side Stack
- **Game Server**: Colyseus 0.14.2
- **Web Framework**: Express 4.20.0
- **State Management**: @colyseus/schema 1.0.3
- **Monitoring**: @colyseus/monitor 0.14.0 (available at `/colyseus`)
- **Middleware**: cors, compression

### Shared Libraries
- **Spatial Indexing**: rbush 3.0.1 (R-Tree for fast collision detection)

## Development Setup

### Prerequisites
- Node.js 14.18.2 (use `nvm use` to switch)
- Yarn (required - npm won't work due to workspaces)

### Installation
```bash
yarn              # Install all dependencies
yarn build        # Initial build
```

### Development Workflow
```bash
yarn dev          # Start dev server with hot reload (localhost:3001)
yarn build        # Production build
yarn serve        # Serve production build
yarn clean        # Remove node_modules and build artifacts
```

### Workspace Commands
```bash
yarn client <command>    # Run command in client package
yarn server <command>    # Run command in server package
yarn common <command>    # Run command in common package
```

## Key Directories and Files

### Entry Points
- **Client**: `packages/client/src/index.tsx` → renders React app
- **Server**: `packages/server/src/index.ts` → starts Express + Colyseus server
- **Common**: `packages/common/src/index.ts` → exports shared modules

### Configuration Files
- `tsconfig.json` - TypeScript compiler config with path aliases
- `.prettierrc` - Code style: 4 spaces, single quotes, 120 char width
- `.nvmrc` - Node version lock
- `Dockerfile` - Multi-stage Docker build
- `docker-compose.yml` - Quick deployment setup

### Build Output
- Client: `packages/client/public/script.js` (bundled, 1 file)
- Server: `packages/server/dist/index.js` (bundled, 1 file)

### Important Source Directories

**Client**:
```
packages/client/src/
├── components/       # Reusable React UI components
├── scenes/          # Home (lobby) and Match (game) scenes
├── game/            # Game engine core
│   ├── Game.ts      # Main game class (692 lines) - handles rendering, input, physics
│   ├── entities/    # Player, Bullet, Monster, Prop (visual representations)
│   ├── managers/    # Entity lifecycle managers
│   ├── sprites/     # PIXI.js sprite classes
│   ├── assets/      # Images, sounds, particle configs
│   └── utils/       # Helpers (text styles, collisions)
├── hooks/           # Custom React hooks
└── icons/           # SVG icons (as React components)
```

**Server**:
```
packages/server/src/
├── rooms/           # GameRoom.ts - Colyseus room implementation
├── states/          # GameState.ts - Server-authoritative state
└── entities/        # Server-side entity logic (Player, Bullet, Monster, etc.)
```

**Common**:
```
packages/common/src/
├── collisions/      # R-Tree based collision system
├── entities/        # Shared entity definitions (Map)
├── models/          # Data models (IAction, IBullet, IMonster, etc.)
├── maps/            # Tiled map JSON files (small.json, gigantic.json)
├── tiled/           # Tiled map editor format support
├── constants.ts     # Game configuration (speeds, sizes, durations)
└── types.ts         # TypeScript types and enums
```

## Game Architecture Patterns

### Client-Server Model
- **Authoritative Server**: Server is source of truth for game state
- **Client-Side Prediction**: Client immediately applies input for responsive feel
- **Server Reconciliation**: Server validates and corrects client predictions
- **Interpolation**: Smooth movement for other players using lerp

### Entity-Component Pattern
- Entities: Player, Bullet, Monster, Prop, Map
- Managers: PlayersManager, BulletsManager, MonstersManager, PropsManager
- Each manager handles lifecycle (add, update, remove) for entity type

### Collision Detection
- **R-Tree** (rbush) for spatial indexing - O(log n) collision queries
- Two collision types:
  - `full`: Blocks players AND bullets (walls)
  - `half`: Blocks players, NOT bullets (low obstacles)

### State Synchronization
- Uses Colyseus Schema for efficient state updates
- Server broadcasts state changes to clients
- Clients apply changes to local game representation

## Coding Conventions

### Style Guide (enforced by Prettier)
- **Indentation**: 4 spaces
- **Quotes**: Single quotes
- **Line Width**: 120 characters
- **Trailing Commas**: All
- **Semicolons**: Always

### Naming Conventions
- **Classes/Components**: PascalCase (`GameRoom`, `PlayerSprite`, `Home`)
- **Variables/Functions**: camelCase (`playerSpeed`, `updatePosition`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_PLAYERS`, `BULLET_RATE`)
- **Files**: Match class/component name or kebab-case for utilities

### TypeScript Usage
- Always use explicit types for function parameters and returns
- Prefer interfaces over type aliases for object shapes
- Use enums from `common/types.ts` (GameMode, Team, GameStatus)
- Import shared types from `@tosios/common`

### File Organization
- One class or component per file
- Use barrel exports (`index.ts`) for clean imports
- Group related files in directories (e.g., `entities/`, `managers/`)

### React Patterns
- Prefer functional components with hooks
- Use `useState` and `useEffect` for state and side effects
- Custom hooks go in `packages/client/src/hooks/`
- Keep components focused and composable

## Build System (esbuild)

The build process is defined in `scripts/build.ts` and creates two separate bundles:

### Client Build
- Entry: `packages/client/src/index.tsx`
- Output: `packages/client/public/script.js`
- Bundles: All dependencies into single file
- Loaders: PNG, OGG, SVG, ICO
- Plugin: esbuild-plugin-svgr (SVG → React components)
- Minification: Production only
- Sourcemaps: Development only

### Server Build
- Entry: `packages/server/src/index.ts`
- Output: `packages/server/dist/index.js`
- Platform: Node.js 14.15.5
- External: express, cors, hiredis, default-gateway (not bundled)
- Bundles: Application code only
- Minification: Production only

### Development Mode
The `scripts/dev.sh` uses `concurrently` to:
1. Run esbuild in watch mode (rebuilds on file changes)
2. Run nodemon to restart server when `dist/index.js` changes

## Game Configuration

Key constants from `packages/common/src/constants.ts`:

### Server
- **Port**: 3001
- **WebSocket URL**: `ws://localhost:3001` (development)

### Game Rules
- **Game Duration**: 90 seconds
- **Lobby Duration**: 10 seconds
- **Max Players**: 10 (configurable)
- **Game Modes**: 'deathmatch', 'team deathmatch'

### Player
- **Speed**: 1 pixel per tick
- **Size**: 32x32 pixels
- **Max Lives**: 3
- **Radius**: 16 pixels (for collisions)

### Bullet
- **Speed**: 4 pixels per tick
- **Rate**: 800ms between shots
- **Size**: 8x8 pixels
- **Radius**: 4 pixels (for collisions)

### Monsters
- **Speed**: 0.8 pixels per tick
- **Size**: Varies by type

### Maps
- Available maps: 'small', 'gigantic'
- Format: Tiled Map Editor JSON
- Location: `packages/common/src/maps/`

## Map System (Tiled Integration)

### Creating Maps
1. Use **Tiled Map Editor** (https://www.mapeditor.org/)
2. Export as JSON format (TMX as JSON)
3. Required layers:
   - `collisions`: Where players/bullets can't pass
   - `spawners`: Player spawn points
   - Visual layers: Rendered in order

### Collision Tiles
In Tiled, set the tile `type` property to:
- `full`: Blocks players AND bullets (e.g., walls)
- `half`: Blocks players, NOT bullets (e.g., small rocks)

### Adding New Maps
1. Add spritesheet PNG to `packages/client/src/images/maps/`
2. Register in `packages/client/src/images/maps/index.ts`
3. Add map JSON to `packages/common/src/maps/`
4. Register in `packages/common/src/maps/index.ts`
5. Add map name to `MAPS_NAMES` in `packages/common/src/constants.ts`

## Testing

**Current Status**: No testing infrastructure
- Jest types present in devDependencies but unused
- No test files or test scripts
- **Recommendation**: Add unit tests for game logic in `common/` package
- **Recommendation**: Add integration tests for client-server communication

## Deployment

### Docker
```bash
# Build image
docker build -t tosios .

# Run container
docker run -d -p 3001:3001 tosios
```

### Docker Compose
```bash
docker-compose up -d
```

### Local Network Play
Find your local IP:
```bash
ipconfig getifaddr en0  # macOS
```
Share `http://[YOUR_IP]:3001` with friends on same network

### Production
- Server serves client files from `packages/client/public/`
- Environment: Set `NODE_ENV=production`
- Monitoring: Access Colyseus monitor at `/colyseus`

### CI/CD
- **Docker Hub**: Auto-publishes on push to master
- **Heroku**: Auto-deploys on push to master
- Workflows: `.github/workflows/`

## Common Tasks

### Adding a New Entity Type
1. Define interface in `packages/common/src/models/`
2. Create server entity in `packages/server/src/entities/`
3. Add to GameState schema in `packages/server/src/states/GameState.ts`
4. Create client sprite in `packages/client/src/game/sprites/`
5. Create entity class in `packages/client/src/game/entities/`
6. Create manager in `packages/client/src/game/managers/`
7. Update Game.ts to instantiate and update manager

### Modifying Game Constants
- Edit `packages/common/src/constants.ts`
- Rebuild with `yarn build`
- Constants are shared between client and server

### Adding Client UI Components
- Create in `packages/client/src/components/`
- Use styled-components pattern (inline styles)
- Import and use in `scenes/Home.tsx` or `scenes/Match.tsx`

### Debugging Server Issues
- Server logs to console (stdout)
- Access Colyseus monitor: http://localhost:3001/colyseus
- Check room state and connected clients

### Debugging Client Issues
- Use browser DevTools console
- Check Network tab for WebSocket messages
- PIXI.js has debug mode (set in index.tsx)

## Important Notes for AI Assistants

### Package Dependencies
- Always run commands from root directory
- Use `yarn` not `npm` (workspaces requirement)
- Changes to `common/` affect both `client/` and `server/`

### Build Requirements
- Must build `common/` before `client/` or `server/`
- Build script handles this automatically
- TypeScript path aliases: `@tosios/*` maps to `packages/*/src`

### Game Loop
- Server tick rate: ~60Hz (managed by Colyseus)
- Client render loop: requestAnimationFrame (~60fps)
- Client updates local state, then server validates

### State Management
- Server state is canonical
- Client state is optimistic (prediction)
- Never trust client input on server (validate everything)

### Performance Considerations
- R-Tree reduces collision checks from O(n²) to O(log n)
- PIXI.js uses WebGL (hardware accelerated)
- Minimize state updates in Colyseus (only send changes)
- Use object pooling for bullets (reduce GC pressure)

### Security Notes
- Server validates all player actions
- No client-side authority for gameplay
- CORS enabled for development
- Input sanitization on server

### Known Limitations
- No reconnection handling (player removed on disconnect)
- No spectator mode
- No replay system
- No anti-cheat measures
- Single server instance (no horizontal scaling)

## Dependencies Overview

### Critical Dependencies
- `colyseus` / `colyseus.js`: Real-time multiplayer framework
- `pixi.js`: 2D WebGL rendering engine
- `react`: UI framework
- `rbush`: Spatial indexing for collisions
- `express`: HTTP server

### Asset Types
- **Images**: PNG format in `packages/client/src/game/assets/images/`
- **Sounds**: OGG format in `packages/client/src/game/assets/sounds/`
- **Particles**: JSON configs in `packages/client/src/game/assets/particles/`
- **Maps**: JSON in `packages/common/src/maps/`

## Troubleshooting

### Build Errors
- Clear artifacts: `yarn clean`
- Reinstall: `rm -rf node_modules && yarn`
- Check Node version: `node -v` (should be 14.18.2)

### Development Server Not Starting
- Check port 3001 availability: `lsof -i :3001`
- Verify build succeeded: check `packages/*/dist/` directories
- Check nodemon/concurrently logs in terminal

### Type Errors
- Rebuild common package: `yarn common build`
- Check TypeScript version: 4.6.2
- Verify path aliases in `tsconfig.json`

### WebSocket Connection Fails
- Check server is running on port 3001
- Verify WebSocket URL in client matches server
- Check CORS configuration
- Inspect browser network tab

## Resources

- **Repository**: https://github.com/halftheopposite/tosios
- **Live Demo**: https://tosios.online
- **Colyseus Docs**: https://docs.colyseus.io/
- **PIXI.js Docs**: https://pixijs.download/release/docs/index.html
- **Tiled Docs**: https://doc.mapeditor.org/

## Version History

- **0.16.1**: Current version (latest)
- **Architecture**: Monorepo with TypeScript, React, PIXI.js, Colyseus
- **Last Updated**: 2025-11-17

---

*This document is maintained for AI assistants working on the TOSIOS codebase. Keep it updated when making significant architectural changes.*
