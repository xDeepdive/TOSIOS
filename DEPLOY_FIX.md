# 🚀 FIXED: Deploy TOSIOS Server (Works Now!)

## ✅ What Was Fixed

Your project uses a **monorepo** (yarn workspace) structure that confused Railway/Render. I've added:

1. ✅ `railway.json` - Railway configuration
2. ✅ `render.yaml` - Render configuration  
3. ✅ `Dockerfile` - Works with ANY Docker platform
4. ✅ Updated `packages/server/package.json` with start script

---

## 🚂 **Option 1: Railway (Easiest)**

### **Step-by-Step**:

1. **Go to** [railway.app](https://railway.app) and login with GitHub

2. **New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose **TOSIOS** repository
   - Railway will auto-detect `railway.json` ✅

3. **Wait for Build** (2-3 minutes)
   - Railway reads `railway.json` automatically
   - Build command: `npm install && npm run build`
   - Start command: `node packages/server/dist/index.js`

4. **Set Environment Variables** (Settings → Variables):
   ```
   NODE_ENV=production
   PORT=3001
   ```

5. **Get WebSocket URL**:
   - Railway provides: `https://tosios-server-production.up.railway.app`
   - **Convert to**: `wss://tosios-server-production.up.railway.app`
   - Copy this for Netlify!

### **Troubleshooting Railway**:

**Build fails?**
```bash
# Check Railway logs for exact error
# Common fix: Railway auto-installs from railway.json
```

**Port issues?**
```bash
# Railway auto-assigns PORT env var
# Server should use: process.env.PORT || 3001
```

---

## 🎨 **Option 2: Render**

### **Step-by-Step**:

1. **Go to** [render.com](https://render.com)

2. **New Web Service**:
   - Click "New +" → "Web Service"
   - Connect GitHub
   - Select **TOSIOS** repository

3. **Configure** (Render auto-detects `render.yaml`):
   - **Name**: `tosios-server`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node packages/server/dist/index.js`
   - **Plan**: Free

4. **Environment Variables** (already in render.yaml):
   ```
   NODE_ENV=production
   PORT=10000
   ```

5. **Deploy** - Takes ~5 minutes

6. **Get WebSocket URL**:
   - Render provides: `https://tosios-server.onrender.com`
   - **Convert to**: `wss://tosios-server.onrender.com`

### **Troubleshooting Render**:

**"Build failed"?**
- Check Render logs (click on failed deploy)
- Ensure `render.yaml` is in root directory
- Try manual deploy: Settings → "Manual Deploy"

**"Service Unavailable"?**
- Free tier sleeps after 15min inactivity
- First request takes ~30s to wake up
- Upgrade to Starter ($7/mo) for always-on

---

## 🐳 **Option 3: Any Docker Platform**

Works with: **Railway**, **Render**, **Fly.io**, **DigitalOcean**, **AWS**, etc.

### **Using the Dockerfile**:

1. **Platform Settings**:
   - **Dockerfile path**: `./Dockerfile` (root)
   - **Context**: `.` (root directory)
   - **Port**: `3001`

2. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3001
   ```

3. **Deploy** - Platform builds Docker image automatically

### **Test Locally**:

```bash
# Build Docker image
cd /home/user/TOSIOS
docker build -t tosios-server .

# Run locally
docker run -p 3001:3001 -e NODE_ENV=production tosios-server

# Test
curl http://localhost:3001
```

---

## ✅ **Verify Deployment**

### **Test Server**:

```bash
# Visit server URL in browser (HTTPS, not WSS)
https://your-server.railway.app

# Should return:
{"success":true}
# OR Colyseus page
```

### **Check Logs**:

**Railway**: 
- Dashboard → Deployments → View Logs

**Render**:
- Dashboard → Logs tab

**Look for**:
```
Listening on ws://localhost:3001
✅ GameRoom registered
```

---

## 🌐 **Connect Client to Server**

Once server is deployed:

1. **Copy WebSocket URL**:
   ```
   wss://tosios-server-production.up.railway.app
   ```

2. **Set in Netlify**:
   - Site settings → Environment variables
   - Add: `VITE_SERVER_URL` = `wss://...`

3. **Redeploy Netlify** client

---

## 🆘 **Common Errors & Fixes**

### **Error: "Cannot find module"**

**Cause**: Build didn't complete
**Fix**: 
```bash
# Railway/Render should run:
npm install && npm run build

# Check build logs for TypeScript errors
```

### **Error: "ENOENT: no such file or directory"**

**Cause**: Wrong start command path
**Fix**: Ensure start command is:
```bash
node packages/server/dist/index.js
```

### **Error: "Port already in use"**

**Cause**: Hardcoded port 3001
**Fix**: Check server code uses:
```javascript
const port = process.env.PORT || 3001;
```

### **Error: "Module not found: @tosios/common"**

**Cause**: Monorepo dependencies not installed
**Fix**: Build must run from **root** directory with `npm install`

---

## 📋 **Quick Checklist**

Before deploying, verify:

- ✅ `railway.json` in root directory
- ✅ `render.yaml` in root directory  
- ✅ `Dockerfile` in root directory
- ✅ `packages/server/package.json` has `start` script
- ✅ Push all files to GitHub

```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

---

## 🎯 **Expected Build Output**

Successful build should show:

```
[Build] Building project in "development" mode...
[Build] Building client...
[Build] Client built...
[Build] Building server...
[Build] Server built...
[Build] Building completed.

✓ packages/server/dist/index.js created
```

Then server starts with:

```
Listening on ws://0.0.0.0:3001
```

---

## 🔗 **What's Next?**

1. ✅ Deploy server (Railway/Render)
2. ✅ Get WebSocket URL (`wss://...`)
3. ✅ Set `VITE_SERVER_URL` in Netlify
4. ✅ Deploy client to Netlify
5. 🎮 **Play your game!**

---

Need help? Show me the **exact error logs** from Railway or Render!
