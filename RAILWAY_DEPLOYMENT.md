# Railway Deployment Guide - TOSIOS

This guide explains how TOSIOS is deployed on Railway as a **single unified application** (server + client).

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                  Railway Container                    │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │         Node.js Server (Port 3001)              │ │
│  │                                                  │ │
│  │  ┌──────────────┐      ┌──────────────────┐   │ │
│  │  │   Express    │      │  Colyseus Server │   │ │
│  │  │   HTTP       │      │   (WebSocket)    │   │ │
│  │  └──────────────┘      └──────────────────┘   │ │
│  │         │                       │              │ │
│  │         │                       │              │ │
│  │    Serves Static Files    Game State Sync     │ │
│  │    (from client/public)                        │ │
│  │         │                                       │ │
│  │  ┌──────▼───────────────────────────────────┐ │ │
│  │  │  Built Client Files                      │ │ │
│  │  │  - index.html                            │ │ │
│  │  │  - script.js (bundled React + PIXI.js)  │ │ │
│  │  │  - assets (images, sounds, etc.)        │ │ │
│  │  └──────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
└──────────────────────────────────────────────────────┘
                           │
                           ▼
                   Users connect via:
               https://your-app.railway.app
```

## How It Works

### 1. **Build Phase** (Railway runs this automatically)

```bash
npm install && npm run build
```

This command:
- Installs all dependencies (root + all workspaces)
- Runs `ts-node ./scripts/build.ts` which:
  - **Client Build**: Bundles React + PIXI.js → `packages/client/public/script.js`
  - **Server Build**: Compiles TypeScript → `packages/server/dist/index.js`

### 2. **Deploy Phase** (Railway runs this automatically)

```bash
node packages/server/dist/index.js
```

The server starts and:
- **Serves Static Files**: All files in `packages/client/public/` (HTML, JS, CSS, images)
- **WebSocket Server**: Colyseus server for real-time multiplayer
- **HTTP Server**: Express handles HTTP requests
- **Client Routing**: Catch-all route serves `index.html` for SPA routing

### 3. **Server Configuration** (from packages/server/src/index.ts)

```typescript
const PORT = Number(process.env.PORT || 3001);
const PUBLIC_DIR = join(__dirname, '../../client/public');

// Serve static files (CSS, JS, images, sounds)
app.use(express.static(PUBLIC_DIR));

// Colyseus monitor (server stats)
app.use('/colyseus', monitor(server));

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(join(PUBLIC_DIR, 'index.html'));
});

server.listen(PORT);
```

## Railway Configuration Files

### 1. **railway.json** (Railway-specific config)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "node packages/server/dist/index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. **Dockerfile** (Alternative to NIXPACKS)

Railway can use either NIXPACKS (auto-detect) or Dockerfile. The Dockerfile:
- Uses multi-stage build (builder + runtime)
- Node 18 Alpine for small image size
- Installs dev dependencies for build
- Copies everything needed for runtime

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/*/package*.json ./packages/*/
RUN npm install --include=dev
COPY . .
ENV BUILD_MODE=production
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app ./
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "packages/server/dist/index.js"]
```

## Environment Variables

Railway automatically provides:
- `PORT` - Railway assigns this (default 3001 if not set)
- `NODE_ENV` - Set to `production` in Dockerfile

Optional variables you can set in Railway dashboard:
- `REACT_APP_GA_TRACKING_ID` - Google Analytics tracking ID
- `BUILD_MODE` - Already set to `production` in config

## Deployment Steps

### Option 1: Deploy via Railway Dashboard

1. **Connect GitHub Repository**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose this repository
   - Select branch: `claude/explain-th-01CVCVdE2D5h6UW6w9oX3JbR`

2. **Railway Auto-Detects Configuration**
   - Reads `railway.json`
   - Runs build command
   - Starts server

3. **Get Your URL**
   - Railway provides: `https://your-app-name.railway.app`
   - Game accessible at this URL
   - Monitor at: `https://your-app-name.railway.app/colyseus`

### Option 2: Deploy via Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project (first time)
railway link

# Deploy
railway up
```

## How Clients Connect

When a user visits `https://your-app.railway.app`:

1. **Browser requests `https://your-app.railway.app/`**
   - Server sends `index.html`

2. **Browser loads `script.js`**
   - React app initializes
   - PIXI.js game engine loads

3. **Client connects to game server**
   ```typescript
   const client = new Colyseus.Client('wss://your-app.railway.app');
   const room = await client.joinOrCreate('game');
   ```

4. **WebSocket connection established**
   - Same domain, same port (3001)
   - No CORS issues
   - Real-time game state synchronization

## File Structure After Build

```
/app/
├── packages/
│   ├── client/
│   │   └── public/              ← Served by Express
│   │       ├── index.html       ← Entry point
│   │       ├── script.js        ← Bundled React + PIXI.js
│   │       ├── assets/          ← Images, sounds (from build)
│   │       ├── banner.jpg
│   │       ├── favicon.ico
│   │       ├── manifest.json
│   │       └── robots.txt
│   ├── server/
│   │   └── dist/
│   │       └── index.js         ← Server entry point
│   └── common/
│       └── (shared code)
└── node_modules/
```

## Port Configuration

**Single Port for Everything** (3001):
- HTTP requests → Express serves static files
- WebSocket connections → Colyseus handles game state
- `/colyseus` → Monitoring dashboard

Railway's `PORT` environment variable is automatically used:
```typescript
const PORT = Number(process.env.PORT || 3001);
```

## Monitoring & Debugging

### Colyseus Monitor
Visit: `https://your-app.railway.app/colyseus`

Shows:
- Active rooms
- Connected players
- Server statistics
- Memory usage

### Railway Logs
```bash
railway logs
```

Or view in Railway dashboard → Deployments → Logs

### Common Issues

**1. Build fails - "Cannot find module"**
- Ensure `npm install --include=dev` is used
- Dev dependencies needed for build (esbuild, ts-node)

**2. Server starts but client doesn't load**
- Check build created `packages/client/public/script.js`
- Verify `PUBLIC_DIR` path is correct

**3. WebSocket connection fails**
- Ensure using same domain (not localhost)
- Use `wss://` for HTTPS, `ws://` for HTTP

## Differences from Netlify Setup

| Aspect | Netlify (Separate) | Railway (Unified) |
|--------|-------------------|-------------------|
| **Deployment** | Client only | Client + Server |
| **Server** | Separate (e.g., Railway) | Same container |
| **CORS** | Required | Not needed (same origin) |
| **Ports** | N/A | Single port (3001) |
| **WebSocket** | Different domain | Same domain |
| **Build** | Client only | Client + Server |
| **Cost** | 2 services | 1 service |

## Why This Approach?

**Advantages of Unified Deployment:**
1. ✅ **Simpler**: One deployment instead of two
2. ✅ **No CORS**: Client and server same origin
3. ✅ **Cheaper**: One Railway service instead of two
4. ✅ **Faster**: No cross-domain requests
5. ✅ **WebSocket**: Same domain makes connection easier

**When to Use Separate Deployment:**
- If you need CDN for static files (Netlify edge network)
- If you want to scale client and server independently
- If you have multiple clients (web, mobile) connecting to same server

## Cost Estimate (Railway)

Railway pricing (as of 2024):
- **Hobby Plan**: $5/month (500 hours, enough for one 24/7 app)
- **Developer Plan**: $20/month (unlimited usage)
- **Free Tier**: $5 credit/month (good for testing)

## Testing Locally

Before deploying to Railway:

```bash
# Install dependencies
npm install

# Build
npm run build

# Serve (production mode)
npm run serve

# Open browser to http://localhost:3001
```

Or with Docker (simulates Railway environment):

```bash
# Build image
docker build -t tosios .

# Run container
docker run -p 3001:3001 tosios

# Open browser to http://localhost:3001
```

## Troubleshooting

### Build succeeds but game doesn't work

Check Railway logs for errors:
```bash
railway logs --deployment latest
```

### Client loads but can't connect to server

Verify WebSocket URL in client code uses environment detection:
```typescript
const wsUrl = window.location.origin.replace(/^http/, 'ws');
```

### Server crashes on startup

Check:
- `packages/server/dist/index.js` exists
- All dependencies installed
- Environment variables set correctly

## Summary

✅ **Current Setup:**
- Single Railway deployment
- Server serves both static files AND handles game logic
- No Netlify needed
- Simplified architecture

🚀 **To Deploy:**
1. Push to GitHub
2. Connect Railway to repo
3. Railway auto-builds and deploys
4. Visit provided URL

📊 **Monitor:**
- Game stats: `https://your-app.railway.app/colyseus`
- Server logs: Railway dashboard

---

**Questions?** Check the [CLAUDE.md](./CLAUDE.md) for codebase structure details.
