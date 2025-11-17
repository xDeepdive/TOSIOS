# Railway Deployment Troubleshooting

## Error: "Application failed to respond"

This means Railway deployed the container but the app isn't responding on the expected port.

---

## 🔍 How to Debug

### 1. Check Railway Logs

**In Railway Dashboard:**
1. Click on your service
2. Go to **"Deployments"** tab
3. Click the latest deployment
4. Scroll through **"Deploy Logs"** and **"Runtime Logs"**

### 2. What to Look For

#### ✅ Build Success Indicators
```
✅ [Builder] yarn build
✅ [Builder] Building project in "production" mode...
✅ [Builder] Client built...
✅ [Builder] Server built...
✅ [Builder] Building completed.
```

#### ✅ Runtime Success Indicators
```
✅ Listening on ws://localhost:3001
✅ or: Listening on ws://localhost:[PORT]
```

#### ❌ Common Error Messages

**Error 1: Module Not Found**
```
Error: Cannot find module 'express'
Error: Cannot find module '@colyseus/core'
```
**Cause**: Production dependencies not installed
**Fix**: See "Fix 1" below

**Error 2: File Not Found**
```
ENOENT: no such file or directory, stat '/app/packages/client/public/index.html'
```
**Cause**: Build didn't complete or files not copied
**Fix**: See "Fix 2" below

**Error 3: Port Issues**
```
Error: listen EADDRINUSE :::3001
```
**Cause**: Port already in use (unlikely in Railway)
**Fix**: See "Fix 3" below

**Error 4: Cannot Read Property**
```
TypeError: Cannot read property 'x' of undefined
```
**Cause**: Runtime error in code
**Fix**: See "Fix 4" below

---

## 🔧 Fixes

### Fix 1: Module Not Found

**Problem**: Production dependencies missing

**Check Dockerfile Stage 2**:
```dockerfile
# Install ONLY production dependencies
RUN yarn install --frozen-lockfile --production --network-timeout 100000
```

**Verify** these packages are in `dependencies` (NOT `devDependencies`):
- `express`
- `@colyseus/core`
- `@colyseus/schema`
- `@colyseus/monitor`
- `cors`
- `compression`

**If they're in devDependencies**, move them to dependencies in:
- `/packages/server/package.json`

---

### Fix 2: Built Files Missing

**Problem**: Client or server didn't build properly

**Check Build Logs** for:
```
[Builder] Building client...
[Builder] Client built...
[Builder] Building server...
[Builder] Server built...
```

**Verify Dockerfile copies built files**:
```dockerfile
COPY --from=builder /app/packages/client/public ./packages/client/public
COPY --from=builder /app/packages/server/dist ./packages/server/dist
```

**Test locally**:
```bash
# Build with Docker locally
docker build -t tosios-test .

# Run container
docker run -p 3001:3001 tosios-test

# Check if it works at http://localhost:3001
```

---

### Fix 3: Port Configuration

**Problem**: App not listening on correct port

**Check Environment Variables** in Railway:
1. Settings → Variables
2. Ensure `PORT` is set (Railway usually auto-sets this)
3. If not, add: `PORT=3001`

**Check Dockerfile**:
```dockerfile
ENV PORT=3001
EXPOSE 3001
```

**Check server code**:
```typescript
const PORT = Number(process.env.PORT || 3001);
server.listen(PORT);
console.log(`Listening on ws://localhost:${PORT}`);
```

**Check Railway Networking**:
1. Settings → Networking
2. Public Networking → Target Port: **3001**

---

### Fix 4: Runtime Errors

**Problem**: Code crashes on startup

**Check Runtime Logs** for stack trace

**Common issues**:
1. **Missing environment variables** → Add in Railway Settings
2. **Database connection** → Not applicable (no DB in this app)
3. **File permissions** → Ensure files readable in Docker

---

## 🚀 Quick Fixes to Try

### Option 1: Redeploy

Sometimes Railway's cache causes issues:

1. Go to Deployments
2. Click **"..."** menu
3. Select **"Redeploy"**
4. Check logs again

### Option 2: Clear Build Cache

Force fresh build:

1. Settings → General
2. Click **"Remove Deployment"**
3. Push new commit to trigger rebuild

OR add this to `railway.json`:
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  }
}
```

### Option 3: Check Dependencies

Ensure production dependencies are in `dependencies`:

**File**: `/packages/server/package.json`
```json
{
  "dependencies": {
    "@colyseus/core": "^0.14.2",
    "@colyseus/monitor": "^0.14.0",
    "@colyseus/schema": "^1.0.3",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "express": "^4.20.0"
  }
}
```

If any are in `devDependencies`, move them to `dependencies`.

### Option 4: Simplify Dockerfile CMD

Change last line of Dockerfile from:
```dockerfile
CMD ["node", "packages/server/dist/index.js"]
```

To more verbose version for debugging:
```dockerfile
CMD ["sh", "-c", "ls -la packages/client/public && ls -la packages/server/dist && node packages/server/dist/index.js"]
```

This will show what files exist before starting.

---

## 📊 Expected Successful Logs

When working correctly, logs should show:

**Build Phase:**
```
[Builder] Stage 1: Build
[Builder] Installing dependencies...
[Builder] Done in 45.2s
[Builder] Building client...
[Builder] Building server...
[Builder] Build completed

[Builder] Stage 2: Production
[Builder] Installing production dependencies...
[Builder] Done in 12.3s
```

**Runtime Phase:**
```
Listening on ws://localhost:3001
```

**After accessing the URL:**
```
GET / 200 45ms
GET /script.js 200 12ms
GET /banner.jpg 200 8ms
WebSocket connection established
```

---

## 🆘 If Still Not Working

### Get Complete Logs

1. Railway Dashboard → Deployments
2. Click latest deployment
3. Copy ALL logs (both build and runtime)
4. Share them for debugging

### Check Health

Railway might be killing the container if health check fails.

**In Railway:**
1. Settings → Health Checks
2. Ensure path is `/` (root)
3. Or disable health checks temporarily

### Manual Deploy Test

Test the exact Docker image locally:

```bash
# Pull your Railway branch
git checkout claude/railway-ready-mi2x5wkijz3oj604-013a5vJsBuaCAZq4zQZ7nVAx

# Build Docker image
docker build -t tosios-railway .

# Run container
docker run -p 3001:3001 -e PORT=3001 tosios-railway

# Open http://localhost:3001
```

If it works locally but not on Railway, it's a Railway-specific config issue.

---

## 📝 Checklist

Before asking for help, verify:

- [ ] Build logs show "Build completed"
- [ ] Runtime logs show "Listening on..."
- [ ] Networking → Target Port = 3001
- [ ] Environment variable PORT is set (or defaults to 3001)
- [ ] Dependencies are in `dependencies` (not `devDependencies`)
- [ ] Docker builds and runs successfully locally
- [ ] Branch `claude/railway-ready-mi2x5wkijz3oj604-013a5vJsBuaCAZq4zQZ7nVAx` is selected

---

## 🔗 Useful Railway Commands

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Run locally with Railway environment
railway run node packages/server/dist/index.js
```

---

**Next Step**: Share your Railway deployment logs (both build and runtime) and we can pinpoint the exact issue!
