# 🚀 Deploy This Branch to Railway

## ✅ Current Branch: `claude/explain-th-01CVCVdE2D5h6UW6w9oX3JbR`

**This branch is READY for Railway deployment!**

---

## What's on This Branch

### 🎮 Game Features
- ✅ **5 Monster Types**: Bat, Spider, Golem, Ghost, Boss
- ✅ **Monster Waves**: Dynamic spawning system
- ✅ **5 Powerups**: Speed, Shield, Rapid Fire, Invisibility, Double Damage
- ✅ **5 Weapons**: Pistol, Shotgun, Sniper, SMG, Rocket Launcher
- ✅ **4 Game Modes**: Deathmatch, Team Deathmatch, Capture-the-Flag, King-of-the-Hill
- ✅ **Environmental Hazards**: Lava, Spikes, Poison zones
- ✅ **Map Features**: Teleporters, Traps
- ✅ **Bot System**: AI players with difficulty settings
- ✅ **UI Enhancements**: Kill feed, Screen shake, Health bars, Victory screen

### 🐳 Railway Configuration
- ✅ **Dockerfile**: Optimized for Railway (Yarn-based)
- ✅ **railway.json**: Uses Dockerfile builder
- ✅ **Server**: Serves both client and game logic
- ✅ **Single Port**: 3001 for HTTP + WebSocket
- ✅ **No Netlify needed**: Everything unified

### 📦 Updated Files
```
Dockerfile                    ← Uses Yarn, single-stage build
railway.json                  ← Configured to use Dockerfile
packages/server/src/index.ts  ← Serves static client files
packages/common/src/constants.ts ← All new game constants
RAILWAY_DEPLOYMENT.md         ← Full deployment guide
```

---

## 🚢 How to Deploy to Railway

### Option 1: Railway Dashboard (Recommended)

1. **Go to [railway.app](https://railway.app)**
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose: `xDeepdive/TOSIOS`

3. **Select This Branch**
   - Branch: `claude/explain-th-01CVCVdE2D5h6UW6w9oX3JbR`
   - ⚠️ **IMPORTANT**: Must use this exact branch name!

4. **Railway Auto-Deploys**
   - Reads `railway.json`
   - Uses Dockerfile to build
   - Runs `yarn serve`

5. **Get Your URL**
   - Railway provides: `https://your-game-name.railway.app`
   - Game is live at this URL!
   - Monitor at: `https://your-game-name.railway.app/colyseus`

### Option 2: Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project (in repo root)
railway init

# Select branch
git checkout claude/explain-th-01CVCVdE2D5h6UW6w9oX3JbR

# Deploy
railway up
```

---

## 🔍 What Happens During Deployment

### Build Phase
```bash
# Railway uses Dockerfile
FROM node:18-bullseye-slim
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
COPY packages ./packages
RUN yarn install --frozen-lockfile

# Build client + server
RUN yarn build
  ├── Client → packages/client/public/script.js
  └── Server → packages/server/dist/index.js
```

### Runtime Phase
```bash
# Start server
CMD ["yarn", "serve"]

# Server does:
# 1. Serves static files (index.html, script.js, images)
# 2. WebSocket server (Colyseus game logic)
# 3. HTTP server (Express)
# All on port 3001
```

---

## ✅ Verification Checklist

Before deploying, verify:

- [x] **Branch**: `claude/explain-th-01CVCVdE2D5h6UW6w9oX3JbR`
- [x] **Dockerfile exists**: Uses Yarn ✅
- [x] **railway.json exists**: Uses DOCKERFILE builder ✅
- [x] **Server serves client**: `packages/server/src/index.ts` ✅
- [x] **No Netlify files**: `netlify.toml` removed ✅
- [x] **yarn.lock exists**: For reproducible builds ✅

---

## 🎮 After Deployment

### Test the Game
1. Visit: `https://your-app.railway.app`
2. Create a room
3. Play with bots (auto-spawn if < 16 players)
4. Test features:
   - Monsters spawn
   - Powerups appear
   - Weapons work
   - UI shows kill feed, health bars

### Monitor Server
1. Visit: `https://your-app.railway.app/colyseus`
2. See:
   - Active rooms
   - Connected players
   - Server stats
   - Memory usage

### Check Logs
- Railway Dashboard → Deployments → Logs
- Or: `railway logs`

---

## 🐛 Troubleshooting

### Build Fails
**Error**: "Cannot find module"
- **Fix**: Railway is using Dockerfile (which uses Yarn) ✅
- Verify: `railway.json` has `"builder": "DOCKERFILE"`

### Game Loads But Blank Screen
**Error**: Client bundle not loading
- **Fix**: Check Railway logs for build errors
- Verify: `packages/client/public/script.js` was created during build

### WebSocket Connection Failed
**Error**: Can't connect to server
- **Fix**: Use Railway-provided URL (not localhost)
- WebSocket auto-uses same domain as HTTP

### Bots Not Spawning
**Check**: `packages/common/src/constants.ts`
```typescript
export const BOTS_ENABLED = true;  // Should be true
export const BOTS_MIN_PLAYERS = 16; // Auto-fill to 16
```

---

## 📊 Expected Costs (Railway)

- **Hobby Plan**: $5/month
  - 500 hours execution
  - Enough for 1 app running 24/7
  - **Perfect for TOSIOS**

- **Developer Plan**: $20/month (if you need more)

- **Free Tier**: $5 credit/month (good for testing)

---

## 🎯 Summary

**This Branch Works Because:**
1. ✅ Dockerfile uses Yarn (matches repo structure)
2. ✅ Server serves both client files AND game logic
3. ✅ Single port (3001) for everything
4. ✅ All game features included
5. ✅ Railway config optimized

**Just Deploy This Branch:**
- Branch: `claude/explain-th-01CVCVdE2D5h6UW6w9oX3JbR`
- Railway will handle everything else!

---

## 📚 More Info

See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed architecture and configuration info.

---

**Ready to deploy? Just select this branch in Railway!** 🚀
