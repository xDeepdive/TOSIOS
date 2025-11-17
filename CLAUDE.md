# CLAUDE.md - TOSIOS Codebase Guide for AI Assistants

> Last updated: 2025-11-17
>
> This document provides a comprehensive guide to the TOSIOS (The Open-Source IO Shooter) codebase for AI assistants working on this project.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Directory Structure](#directory-structure)
- [Technology Stack](#technology-stack)
- [Development Workflows](#development-workflows)
- [Build System](#build-system)
- [Code Conventions](#code-conventions)
- [Key Files Reference](#key-files-reference)
- [Common Tasks](#common-tasks)
- [Testing](#testing)
- [Deployment](#deployment)
- [Important Notes](#important-notes)

---

## Project Overview

**TOSIOS** is an open-source multiplayer browser-based IO shooter game. It's designed to be easily hostable, playable, and modifiable by anyone.

**Key Facts:**
- **Type**: Real-time multiplayer browser game
- **Architecture**: Monorepo with 3 packages (client, server, common)
- **Lines of Code**: ~4,309 across 105 TypeScript/TSX files
- **Game Modes**: Deathmatch, Team Deathmatch
- **Map Editor**: Tiled Map Editor support
- **Deployment**: Docker, Heroku
- **Live Demo**: https://tosios.online

**Game Mechanics:**
- Players spawn randomly during lobby phase
- Last player/team standing wins
- Health potions available on map
- Configurable room sizes (2-16 players)
- Mobile and desktop support

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         TOSIOS                              │
├─────────────┬─────────────────────┬─────────────────────────┤
│   CLIENT    │       SERVER        │        COMMON           │
│  (Browser)  │     (Node.js)       │   (Shared Code)         │
├─────────────┼─────────────────────┼─────────────────────────┤
│ React UI    │ Express HTTP        │ Constants               │
│ PIXI.js     │ Colyseus Server     │ Geometry Classes        │
│ Colyseus    │ Authoritative State │ Collision Detection     │
│ Client      │ Game Logic          │ Tiled Map Parser        │
│             │                     │ Shared Models           │
└─────────────┴─────────────────────┴─────────────────────────┘
```

### Key Architectural Patterns

1. **Client-Server Model**: Authoritative server with client prediction
2. **Entity-Component-System (Partial)**: Entities, managers as systems
3. **Manager Pattern**: BaseManager<T> for entity collections
4. **Observer Pattern**: Colyseus state synchronization callbacks
5. **Object Pooling**: Bullet recycling to reduce GC pressure
6. **State Machine**: Game states (waiting → lobby → game)
7. **R-Tree Spatial Index**: Optimized collision detection
8. **Interpolation**: Smooth client-side animation

### Package Responsibilities

**@tosios/client** (~2,161 lines, 69 files)
- React-based UI (lobby, HUD, menus)
- PIXI.js game rendering engine
- Client-side prediction and interpolation
- Input handling (keyboard, mouse, touch)
- Audio and particle effects

**@tosios/server** (~1,365 lines, 11 files)
- Express HTTP server
- Colyseus room management
- Authoritative game state
- Physics and collision detection
- AI for monsters

**@tosios/common** (~783 lines, 25 files)
- Shared constants and types
- Geometry primitives (Vector2, CircleBody, RectangleBody)
- Collision detection utilities (R-Tree)
- Tiled map parser
- Math utilities

---

## Directory Structure

### Root Level

```
/
├── packages/              # Monorepo packages
│   ├── client/           # Frontend React + PIXI.js app
│   ├── server/           # Backend Node.js + Colyseus server
│   └── common/           # Shared code
├── scripts/              # Build and dev scripts
│   ├── build.ts          # esbuild configuration
│   ├── dev.sh            # Development mode script
│   ├── serve.sh          # Production server script
│   └── clean.sh          # Cleanup script
├── .github/workflows/    # CI/CD pipelines
├── images/               # README assets
├── package.json          # Root workspace config
├── tsconfig.json         # TypeScript config
├── .prettierrc           # Code formatting rules
├── Dockerfile            # Docker build
├── docker-compose.yml    # Docker Compose config
└── README.md             # User documentation
```

### Client Package Structure

```
packages/client/
├── public/                     # Static assets (served by Express)
│   ├── index.html             # Entry HTML
│   ├── script.js              # Built bundle (generated)
│   └── manifest.json          # PWA manifest
└── src/
    ├── index.tsx              # Entry point (React rendering)
    ├── App.tsx                # Root React component (routing)
    ├── components/            # Reusable UI components (14 files)
    │   ├── Box.tsx
    │   ├── Button.tsx
    │   ├── Input.tsx
    │   ├── Room.tsx
    │   └── ...
    ├── scenes/                # Page-level components
    │   ├── Home.tsx           # Lobby/room selection
    │   ├── Match.tsx          # Game controller
    │   └── HUD/               # In-game overlay (10 files)
    ├── game/                  # PIXI.js game engine
    │   ├── Game.ts            # Main game controller (692 lines)
    │   ├── entities/          # Game objects (6 files)
    │   │   ├── BaseEntity.ts
    │   │   ├── Player.ts
    │   │   ├── Bullet.ts
    │   │   ├── Monster.ts
    │   │   └── Prop.ts
    │   ├── managers/          # Entity collection managers (5 files)
    │   │   ├── BaseManager.ts
    │   │   ├── PlayersManager.ts
    │   │   └── ...
    │   ├── sprites/           # PIXI.js sprites (8 files)
    │   ├── assets/            # Game assets
    │   │   ├── images/        # Textures (organized by type)
    │   │   ├── particles/     # Particle effect configs
    │   │   └── sounds/        # Audio files (.ogg)
    │   └── utils/             # Utility functions
    ├── hooks/                 # React custom hooks
    ├── icons/                 # SVG icons
    └── images/                # UI images
```

### Server Package Structure

```
packages/server/
└── src/
    ├── index.ts           # Entry: Express + Colyseus setup
    ├── rooms/
    │   └── GameRoom.ts    # Colyseus room handler
    ├── states/
    │   └── GameState.ts   # Authoritative game state (557 lines)
    └── entities/          # Server-side game objects (8 files)
        ├── Game.ts        # Game state machine
        ├── Player.ts
        ├── Bullet.ts
        ├── Monster.ts
        ├── Prop.ts
        ├── Circle.ts      # Base circle entity
        └── Rectangle.ts   # Base rectangle entity
```

### Common Package Structure

```
packages/common/
└── src/
    ├── index.ts              # Package exports
    ├── constants.ts          # Game constants (56 lines)
    ├── types.ts              # TypeScript interfaces
    ├── geometry.ts           # Vector2, CircleBody, RectangleBody
    ├── maths.ts              # Math utility functions
    ├── sort.ts               # Sorting utilities
    ├── keys.ts               # Keyboard constants
    ├── collisions/           # Collision detection (4 files)
    │   ├── collisions.ts     # R-Tree implementation
    │   ├── types.ts
    │   └── utils.ts
    ├── entities/
    │   └── map.ts            # Map boundary logic
    ├── models/               # Shared data models (7 files)
    │   ├── Player.ts
    │   ├── Bullet.ts
    │   ├── Monster.ts
    │   └── ...
    ├── maps/                 # Tiled map JSON files
    │   ├── small.json
    │   ├── gigantic.json
    │   └── index.ts
    └── tiled/                # Tiled map parser (4 files)
        ├── map.ts            # Main parser (192 lines)
        ├── tmx.ts            # TMX type definitions
        └── types.ts
```

---

## Technology Stack

### Client Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 16.12.0 | UI framework |
| **PIXI.js** | 6.2.2 | WebGL rendering engine |
| **pixi-viewport** | 4.5.0 | Camera/viewport management |
| **pixi-particles** | 4.2.0 | Particle effects |
| **Colyseus.js** | 0.14.0 | Client-side networking |
| **@reach/router** | 1.2.1 | Client-side routing |
| **react-nipple** | 1.0.1 | Virtual joystick (mobile) |
| **Howler** | 2.2.1 | Audio management |
| **react-ga** | 3.2.0 | Google Analytics |

### Server Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 14.18.2 | Runtime environment |
| **Express** | 4.20.0 | HTTP server |
| **Colyseus** | 0.14.2 | Multiplayer server framework |
| **@colyseus/schema** | 1.0.3 | State synchronization |
| **@colyseus/monitor** | 0.14.0 | Server monitoring dashboard |
| **cors** | 2.8.5 | CORS middleware |
| **compression** | 1.7.4 | Response compression |

### Common Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **rbush** | 3.0.1 | R-Tree spatial indexing |

### Build & Development Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| **TypeScript** | 4.6.2 | Type-safe JavaScript |
| **esbuild** | 0.14.25 | Ultra-fast bundler |
| **esbuild-plugin-svgr** | 1.0.0 | SVG-to-React converter |
| **ts-node** | 10.7.0 | TypeScript execution |
| **nodemon** | 2.0.15 | Dev server auto-restart |
| **concurrently** | 7.0.0 | Parallel script execution |
| **Prettier** | 2.5.1 | Code formatting |
| **Yarn Workspaces** | - | Monorepo management |

**Important**: This project uses **esbuild**, NOT Webpack!

---

## Development Workflows

### Initial Setup

```bash
# Prerequisites: Node.js 14.18.2 (use nvm: `nvm use`)
# Prerequisites: Yarn (NOT npm - workspace feature required)

# 1. Install dependencies
yarn

# 2. Initial build (required before first dev run)
yarn build

# 3. Start development server
yarn dev

# 4. Open browser to http://localhost:3001
```

### Development Mode

```bash
yarn dev
```

**What happens:**
1. Runs `scripts/dev.sh`
2. Starts esbuild in watch mode (rebuilds on file changes)
3. Starts nodemon watching server dist output
4. Server restarts automatically on changes
5. Client auto-reloads via browser refresh

**Ports:**
- Game: http://localhost:3001
- Colyseus Monitor: http://localhost:3001/colyseus

### Production Build

```bash
# Set environment variable
BUILD_MODE=production yarn build

# Or just build (defaults to development)
yarn build

# Serve production build
yarn serve
```

### Package-Specific Commands

```bash
# Run commands in specific packages
yarn client <command>    # e.g., yarn client add pixi.js
yarn server <command>    # e.g., yarn server add express
yarn common <command>    # e.g., yarn common add rbush
```

### Clean Build

```bash
# Remove node_modules and build artifacts
yarn clean

# Then reinstall
yarn
yarn build
```

---

## Build System

### esbuild Configuration

The build system is defined in `scripts/build.ts` using **esbuild** (NOT Webpack).

#### Client Build

**Entry**: `packages/client/src/index.tsx`
**Output**: `packages/client/public/script.js`

**Key Configuration:**
```typescript
{
  entryPoints: ['packages/client/src/index.tsx'],
  outfile: 'packages/client/public/script.js',
  bundle: true,
  minify: BUILD_MODE === 'production',
  sourcemap: BUILD_MODE === 'development',
  loader: {
    '.png': 'file',
    '.ogg': 'file',
    '.svg': 'file',
    '.ico': 'file',
  },
  plugins: [svgrPlugin()],  // SVG imports as React components
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.REACT_APP_GA_TRACKING_ID': '...',
  }
}
```

**Asset Handling:**
- PNG images: Bundled as files
- OGG audio: Bundled as files
- SVG: Converted to React components via svgrPlugin
- Watch mode enabled in development

#### Server Build

**Entry**: `packages/server/src/index.ts`
**Output**: `packages/server/dist/index.js`

**Key Configuration:**
```typescript
{
  entryPoints: ['packages/server/src/index.ts'],
  outfile: 'packages/server/dist/index.js',
  platform: 'node',
  target: 'node14.15.5',
  bundle: true,
  minify: BUILD_MODE === 'production',
  sourcemap: BUILD_MODE === 'development',
  external: ['express', 'hiredis', 'default-gateway', 'cors'],
}
```

**Important**: Some dependencies are marked as `external` to avoid bundling native modules.

### Environment Variables

- `BUILD_MODE`: `production` or `development` (default: `development`)
- `REACT_APP_GA_TRACKING_ID`: Google Analytics tracking ID (optional)

---

## Code Conventions

### TypeScript Configuration

**File**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "es2017",
    "module": "CommonJS",
    "lib": ["ESNext", "DOM"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "jsx": "react",
    "experimentalDecorators": true,  // Required for @colyseus/schema
    "resolveJsonModule": true,
    "baseUrl": "./",
    "paths": {
      "@tosios/*": ["packages/*"]  // Import aliases
    }
  }
}
```

**Key Points:**
- ES2017 target (async/await support)
- Experimental decorators enabled (Colyseus requires this)
- Path aliases: `@tosios/client`, `@tosios/server`, `@tosios/common`
- JSON imports allowed (for Tiled maps)

### Prettier Configuration

**File**: `.prettierrc`

```json
{
  "semi": true,              // Always use semicolons
  "trailingComma": "all",    // Trailing commas everywhere
  "singleQuote": true,       // Single quotes for strings
  "printWidth": 120,         // Max line length
  "tabWidth": 4              // 4 spaces per indent
}
```

**Formatting Command:**
```bash
yarn prettier --write .
```

### Naming Conventions

**Files:**
- React components: `PascalCase.tsx` (e.g., `GameRoom.tsx`)
- TypeScript modules: `camelCase.ts` (e.g., `gameState.ts`)
- Index files: `index.ts` (barrel exports)

**Code:**
- Classes: `PascalCase` (e.g., `GameState`, `Player`)
- Functions: `camelCase` (e.g., `handlePlayerAdd`)
- Constants: `SCREAMING_SNAKE_CASE` (e.g., `PLAYER_MAX_LIVES`)
- Interfaces: `PascalCase` with `I` prefix (e.g., `IPlayer`)
- Types: `PascalCase` (e.g., `GameMode`)

**Colyseus Schema:**
- Use `@type()` decorators for networked properties
- Example:
  ```typescript
  export class Player extends Circle {
    @type('string') public playerId: string;
    @type('number') public lives: number;
  }
  ```

### Import Organization

**Pattern used throughout codebase:**
```typescript
// External dependencies first
import React from 'react';
import * as PIXI from 'pixi.js';

// Internal imports second
import { Constants } from '@tosios/common';
import { Game } from '../game';

// Relative imports last
import { Button } from '../components/Button';
```

**Barrel Exports:**
- Each directory has `index.ts` re-exporting all modules
- Example: `packages/common/src/models/index.ts`
  ```typescript
  export * from './Action';
  export * from './Bullet';
  export * from './Player';
  // ...
  ```

---

## Key Files Reference

### Critical Files

| File | Purpose | Lines |
|------|---------|-------|
| `packages/client/src/game/Game.ts` | Main PIXI.js game controller | 692 |
| `packages/server/src/states/GameState.ts` | Authoritative game state | 557 |
| `packages/common/src/tiled/map.ts` | Tiled map parser | 192 |
| `packages/common/src/constants.ts` | Game configuration | 56 |
| `scripts/build.ts` | esbuild configuration | 93 |

### Entry Points

| Package | Entry | Output |
|---------|-------|--------|
| **Client** | `packages/client/src/index.tsx` | `packages/client/public/script.js` |
| **Server** | `packages/server/src/index.ts` | `packages/server/dist/index.js` |
| **Common** | `packages/common/src/index.ts` | N/A (imported by others) |

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Root workspace config, scripts |
| `tsconfig.json` | TypeScript compiler options |
| `.prettierrc` | Code formatting rules |
| `.nvmrc` | Node version (14.18.2) |
| `Dockerfile` | Docker build instructions |
| `docker-compose.yml` | Docker Compose service definition |

### Constants Reference

**File**: `packages/common/src/constants.ts`

**Important Constants:**
```typescript
// Server
WS_PORT = 3001                    // WebSocket port
ROOM_NAME = 'game'                // Colyseus room name

// Game Rules
ROOM_PLAYERS_MIN = 2              // Min players to start
ROOM_PLAYERS_MAX = 16             // Max players per room
LOBBY_DURATION = 10000            // 10s lobby countdown
GAME_DURATION = 90000             // 90s game duration
GAME_MODES = ['deathmatch', 'team deathmatch']

// Player
PLAYER_SIZE = 32                  // Player radius (px)
PLAYER_SPEED = 1                  // Movement speed
PLAYER_MAX_LIVES = 3              // Starting lives

// Bullet
BULLET_SIZE = 8                   // Bullet radius (px)
BULLET_SPEED = 4                  // Bullet speed
BULLET_RATE = 800                 // Fire rate cooldown (ms)

// Map
TILE_SIZE = 32                    // Tile size (px)
MAPS_NAMES = ['small', 'gigantic'] // Available maps
```

**To modify game balance**: Edit these constants and rebuild.

---

## Common Tasks

### Adding a New Map

1. **Create map in Tiled Map Editor**:
   - Use layers: `collisions`, `spawners`, and rendering layers
   - Set collision tiles to `type: 'half'` or `type: 'full'`
   - Export as JSON (Tiled format)

2. **Add spritesheet** (if custom):
   ```typescript
   // packages/client/src/images/maps/index.ts
   import custom from './custom.png';
   export const SpriteSheets: { [key: string]: string } = {
     'dungeon.png': dungeon,
     'custom.png': custom,  // Add this
   };
   ```

3. **Add map JSON**:
   ```typescript
   // packages/common/src/maps/index.ts
   import custom from './custom.json';
   export const List: { [key: string]: TMX.IMap } = {
     small,
     gigantic,
     custom,  // Add this
   };
   ```

4. **Register map name**:
   ```typescript
   // packages/common/src/constants.ts
   export const MAPS_NAMES = ['small', 'gigantic', 'custom'];
   ```

5. **Rebuild**: `yarn build`

### Adding a New Entity Type

1. **Create shared model**:
   ```typescript
   // packages/common/src/models/MyEntity.ts
   export interface IMyEntity {
     id: string;
     x: number;
     y: number;
   }
   ```

2. **Create server entity**:
   ```typescript
   // packages/server/src/entities/MyEntity.ts
   import { Circle } from './Circle';
   import { type } from '@colyseus/schema';

   export class MyEntity extends Circle {
     @type('string') public id: string;
     // ... implement server logic
   }
   ```

3. **Create client entity**:
   ```typescript
   // packages/client/src/game/entities/MyEntity.ts
   import { BaseEntity } from './BaseEntity';

   export class MyEntity extends BaseEntity {
     // ... implement client rendering
   }
   ```

4. **Create manager**:
   ```typescript
   // packages/client/src/game/managers/MyEntitiesManager.ts
   import { BaseManager } from './BaseManager';
   import { MyEntity } from '../entities/MyEntity';

   export class MyEntitiesManager extends BaseManager<MyEntity> {
     // ... implement collection management
   }
   ```

5. **Integrate into GameState and Game.ts**

### Modifying Game Balance

**File**: `packages/common/src/constants.ts`

Example changes:
```typescript
export const PLAYER_MAX_LIVES = 5;      // Increase lives
export const BULLET_SPEED = 6;          // Faster bullets
export const GAME_DURATION = 120000;    // 2-minute games
```

**Rebuild**: `yarn build`

### Adding a New UI Component

1. **Create component**:
   ```typescript
   // packages/client/src/components/MyComponent.tsx
   import React from 'react';
   import { Box } from './Box';

   export function MyComponent() {
     return <Box>Content</Box>;
   }
   ```

2. **Export from index**:
   ```typescript
   // packages/client/src/components/index.ts
   export { MyComponent } from './MyComponent';
   ```

3. **Use in scene**:
   ```typescript
   import { MyComponent } from '../components';
   ```

### Adding a Sound Effect

1. **Add .ogg file**:
   - Place in `packages/client/src/game/assets/sounds/`

2. **Import in sounds index**:
   ```typescript
   // packages/client/src/game/assets/sounds/index.ts
   import mySound from './my-sound.ogg';
   export { mySound };
   ```

3. **Play using Howler**:
   ```typescript
   import { Howl } from 'howler';
   import { mySound } from './assets/sounds';

   const sound = new Howl({ src: [mySound] });
   sound.play();
   ```

### Debugging

**Client-side:**
- Open browser DevTools (F12)
- Check Console for errors
- Use React DevTools extension
- PIXI DevTools extension for renderer

**Server-side:**
- Check terminal output
- Add `console.log()` statements
- Use Node.js debugger: `node --inspect`
- Access Colyseus monitor: http://localhost:3001/colyseus

**Common Debug Flag:**
```typescript
// packages/common/src/constants.ts
export const DEBUG = true;  // Enable debug logging
```

---

## Testing

**Current Status**: No automated testing infrastructure exists.

**Testing Dependencies**:
- `@types/jest` is installed but unused
- No test files (`*.test.ts`, `*.spec.ts`)
- No test scripts in `package.json`

**Manual Testing Approach**:
1. Run `yarn dev`
2. Open http://localhost:3001
3. Test in browser (multiple tabs for multiplayer)
4. Use Colyseus monitor for server state inspection

**Recommendations for Adding Tests**:
- **Unit Tests**: Jest for business logic (common package)
- **Integration Tests**: Jest + Supertest for server endpoints
- **E2E Tests**: Playwright or Cypress for game flows
- **Visual Tests**: Percy or Chromatic for UI components

---

## Deployment

### Docker Deployment

**Build Image:**
```bash
docker build -t tosios .
```

**Run Container:**
```bash
docker run -d -p 3001:3001 tosios
```

**Docker Compose:**
```bash
docker-compose up -d
```

**What the Dockerfile Does:**
1. Uses `node:14.18.2-alpine` base image
2. Copies package files and installs dependencies
3. Copies source code
4. Builds in production mode (`BUILD_MODE=production yarn build`)
5. Exposes port 3001
6. Runs `yarn serve`

### Heroku Deployment

**CI/CD**: `.github/workflows/heroku-deploy.yml`

**Manual Deploy:**
```bash
heroku create
git push heroku main
```

**Environment Variables:**
- `NODE_ENV=production`
- `REACT_APP_GA_TRACKING_ID` (optional)

### Docker Registry

**Published Image**: `halftheopposite/tosios`

**Pull and Run:**
```bash
docker pull halftheopposite/tosios
docker run -d -p 3001:3001 halftheopposite/tosios
```

### Local Network Play

**Find local IP:**
```bash
ipconfig getifaddr en0  # macOS
hostname -I             # Linux
ipconfig               # Windows
```

**Share with friends:**
- http://[YOUR_LOCAL_IP]:3001 (e.g., http://192.168.1.10:3001)

---

## Important Notes

### Critical Gotchas

1. **MUST Use Yarn, NOT npm**:
   - This project uses Yarn Workspaces
   - `npm install` will NOT work correctly

2. **Build Before First Dev Run**:
   - Run `yarn build` before `yarn dev` on fresh clone
   - Otherwise, server won't have initial build artifacts

3. **Experimental Decorators Required**:
   - `@colyseus/schema` requires `experimentalDecorators: true`
   - DO NOT remove from `tsconfig.json`

4. **External Dependencies in Server Build**:
   - `express`, `hiredis`, `default-gateway`, `cors` are marked external
   - DO NOT bundle these (native modules may break)

5. **Port 3001 Hardcoded**:
   - Change `WS_PORT` in `packages/common/src/constants.ts`
   - Also update Dockerfile and docker-compose.yml

6. **Asset Imports**:
   - PNG/OGG: Import as file paths
   - SVG: Import as React components (via svgrPlugin)

7. **Tiled Map Format**:
   - MUST be exported as JSON (not TMX XML)
   - MUST include `collisions` and `spawners` layers

### Performance Considerations

1. **R-Tree for Collisions**:
   - Used for spatial indexing (rbush library)
   - DO NOT replace with naive O(n²) checks

2. **Object Pooling**:
   - Bullets are recycled (see `GameState.ts`)
   - Consider pooling for other frequently created entities

3. **Interpolation**:
   - Client smoothly animates other players
   - DO NOT remove lerp calculations in `Game.ts`

4. **PIXI.js Optimization**:
   - Use sprite sheets, not individual images
   - Minimize draw calls by batching

### Security Notes

1. **Authoritative Server**:
   - Server has final say on game state
   - Client input is validated server-side
   - DO NOT trust client-reported state

2. **CORS Enabled**:
   - Server allows cross-origin requests
   - Consider restricting in production

3. **No Authentication**:
   - Currently no user accounts or auth
   - Player names are not verified

### Monorepo Workflow

**Installing Dependencies:**
```bash
# Install for specific package
yarn workspace @tosios/client add react
yarn workspace @tosios/server add express
yarn workspace @tosios/common add rbush

# Install for all packages
yarn
```

**Path Aliases:**
```typescript
// Instead of: import { Constants } from '../../common/src/constants';
import { Constants } from '@tosios/common';
```

**Build Order**:
- Common package should be built first (if separate builds exist)
- Currently all packages build together in `build.ts`

### Colyseus Specifics

**Room Lifecycle:**
```typescript
onCreate(options)    // Room created
onJoin(client)       // Player joins
onMessage(client, message)  // Message received
onLeave(client)      // Player leaves
onDispose()          // Room destroyed
```

**State Synchronization:**
- Use `@type()` decorators for auto-sync
- Changes to decorated properties automatically sent to clients
- Clients receive `onChange`, `onAdd`, `onRemove` callbacks

**Schema Types:**
```typescript
@type('string')      // String
@type('number')      // Number
@type('boolean')     // Boolean
@type([Player])      // ArraySchema
@type({ map: Player }) // MapSchema
```

### PIXI.js Specifics

**Main Classes Used:**
- `PIXI.Application`: Renderer and stage
- `PIXI.Container`: Scene graph node
- `PIXI.Sprite`: Textured quad
- `PIXI.Graphics`: Drawn shapes
- `PIXI.Text`: Text rendering
- `PIXI.Texture`: GPU texture

**Viewport:**
- `pixi-viewport` for camera control
- Handles zoom, pan, follow player

**Particle Effects:**
- `pixi-particles` for effects
- Configured via JSON (see `packages/client/src/game/assets/particles/`)

---

## Quick Reference Commands

```bash
# Setup
yarn                          # Install dependencies
yarn build                    # Build all packages
yarn dev                      # Start development server
yarn serve                    # Run production build

# Package-specific
yarn client <command>         # Run command in client package
yarn server <command>         # Run command in server package
yarn common <command>         # Run command in common package

# Docker
docker build -t tosios .      # Build Docker image
docker-compose up -d          # Run with Docker Compose

# Formatting
yarn prettier --write .       # Format all files

# Cleanup
yarn clean                    # Remove node_modules and builds
```

---

## Resources

- **Colyseus Docs**: https://docs.colyseus.io/
- **PIXI.js Docs**: https://pixijs.download/release/docs/index.html
- **Tiled Docs**: https://doc.mapeditor.org/
- **esbuild Docs**: https://esbuild.github.io/
- **React Docs**: https://reactjs.org/docs/getting-started.html

---

## Contributing Guidelines

When modifying this codebase:

1. **Follow Prettier formatting** (4 spaces, single quotes, trailing commas)
2. **Use TypeScript types** (avoid `any`)
3. **Update constants** instead of magic numbers
4. **Keep client and server in sync** (shared models in common package)
5. **Test manually** (no automated tests exist)
6. **Build before committing** (`yarn build` to catch TS errors)
7. **Document new features** in README.md
8. **Consider performance** (this is a real-time game)

---

**End of CLAUDE.md**
