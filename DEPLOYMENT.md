# 🚀 TOSIOS Deployment Guide

Complete guide to deploying TOSIOS to production with Netlify (client) and Railway (server).

---

## 📋 Prerequisites

- GitHub account
- Netlify account ([netlify.com](https://netlify.com))
- Railway account ([railway.app](https://railway.app)) OR Render account ([render.com](https://render.com))

---

## 🎯 Deployment Strategy

TOSIOS requires **TWO separate deployments**:

1. **Client (Frontend)** → Netlify (static hosting)
2. **Server (Backend)** → Railway/Render (WebSocket server)

---

## 🖥️ Part 1: Deploy Server (Backend)

### Option A: Railway (Recommended)

1. **Sign up** at [railway.app](https://railway.app) with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your TOSIOS repository

3. **Configure Service**:
   - **Name**: `tosios-server`
   - **Root Directory**: Leave empty (Railway will detect)
   - **Build Command**: (auto-detected)
   - **Start Command**: `node packages/server/dist/index.js`

4. **Set Environment Variables** (Railway Dashboard):
   ```bash
   NODE_ENV=production
   PORT=3001
   ```

5. **Deploy** - Railway will provide a URL like:
   ```
   https://tosios-server-production.up.railway.app
   ```

6. **Copy the URL** - Convert to WebSocket format:
   ```
   wss://tosios-server-production.up.railway.app
   ```

### Option B: Render

1. Go to [render.com](https://render.com) → "New Web Service"

2. **Connect GitHub** repo

3. **Configure**:
   - **Name**: `tosios-server`
   - **Root Directory**: `packages/server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.js`

4. **Environment Variables**:
   ```bash
   NODE_ENV=production
   PORT=3001
   ```

5. **Deploy** - Get URL and convert:
   ```
   wss://tosios-server.onrender.com
   ```

---

## 🌐 Part 2: Deploy Client (Frontend)

### Method 1: Netlify Web UI (Easiest)

1. **Build locally first**:
   ```bash
   cd /path/to/TOSIOS
   npm run build
   ```

2. **Go to** [app.netlify.com](https://app.netlify.com)

3. **Deploy**:
   - Click "Add new site" → "Deploy manually"
   - Drag and drop `packages/client/public` folder
   - Wait for deployment

4. **Configure Environment**:
   - Go to "Site settings" → "Environment variables"
   - Add variable:
     ```
     VITE_SERVER_URL = wss://your-server.railway.app
     ```
   - Replace with YOUR server URL from Part 1

5. **Redeploy**:
   - Go to "Deploys" → "Trigger deploy" → "Deploy site"

### Method 2: Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**:
   ```bash
   netlify login
   ```

3. **Deploy** from project root:
   ```bash
   npm run build
   netlify deploy --dir=packages/client/public --prod
   ```

4. **Set environment variable**:
   ```bash
   netlify env:set VITE_SERVER_URL "wss://your-server.railway.app"
   ```

5. **Redeploy** to apply environment:
   ```bash
   netlify deploy --dir=packages/client/public --prod
   ```

### Method 3: Netlify GitHub Integration (Auto-deploy)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to Netlify → "Add new site" → "Import from Git"
   - Select your GitHub repository
   - Configure:
     - **Base directory**: (leave empty)
     - **Build command**: `npm run build`
     - **Publish directory**: `packages/client/public`

3. **Set Environment Variables** in Netlify dashboard:
   ```
   VITE_SERVER_URL = wss://your-server.railway.app
   ```

4. **Deploy** - Netlify will auto-deploy on every push!

---

## ✅ Verification

### Test Server

Visit your server URL in browser:
```
https://tosios-server-production.up.railway.app
```

You should see: `{"success":true}` or similar

### Test Client

1. Visit your Netlify URL:
   ```
   https://your-site.netlify.app
   ```

2. **Create a game** - You should see:
   - Player count: 16/16 (with bots)
   - No connection errors in console

3. **Check console** (F12):
   ```javascript
   // Should show:
   WebSocket connection to 'wss://tosios-server...' established
   ```

### Troubleshooting

**"Can't connect to server"**:
- ✅ Check `VITE_SERVER_URL` in Netlify env vars
- ✅ Ensure URL starts with `wss://` (not `https://`)
- ✅ Verify server is running (visit HTTPS URL in browser)
- ✅ Check browser console for exact error

**"WebSocket connection failed"**:
- ✅ Railway/Render server must be running
- ✅ Check server logs for errors
- ✅ Ensure PORT is set correctly (usually 3001)

**"Build failed"**:
- ✅ Run `npm run build` locally first
- ✅ Check Node version (18+ required)
- ✅ Clear build cache and retry

---

## 🔄 Updating Your Deployment

### Update Client

```bash
# Make changes, then:
npm run build
netlify deploy --dir=packages/client/public --prod
```

Or push to GitHub (auto-deploys if using GitHub integration)

### Update Server

**Railway**: Push to GitHub → Auto-deploys

**Render**: Push to GitHub → Auto-deploys

**Manual**: Redeploy from dashboard

---

## 💰 Cost Breakdown

### Free Tier (Both Included!)

- **Netlify**: 100GB bandwidth/month, 300 build minutes
- **Railway**: $5 free credit/month (~500 hours)
- **Render**: 750 hours/month free

**Total Cost**: $0/month for low-traffic games! 🎉

---

## 🎮 Custom Domain (Optional)

### Netlify (Client)

1. Go to "Domain settings"
2. Add custom domain (e.g., `play.yourgame.com`)
3. Follow DNS instructions

### Railway (Server)

1. Go to Settings → Networking
2. Add custom domain (e.g., `server.yourgame.com`)
3. Update Netlify env: `VITE_SERVER_URL=wss://server.yourgame.com`

---

## 📊 Monitoring

### Server Health

**Railway**:
- Dashboard → Metrics
- View CPU, Memory, Network

**Render**:
- Dashboard → Metrics
- View requests, response times

### Client Analytics

**Netlify**:
- Analytics tab
- View visitors, bandwidth

---

## 🔒 Security Checklist

- ✅ HTTPS/WSS enabled (automatic with Netlify/Railway)
- ✅ Environment variables set correctly
- ✅ Server CORS configured (already done)
- ✅ Rate limiting enabled (optional - add to server)

---

## 🎉 You're Live!

Share your game:
```
https://your-site.netlify.app
```

Players can join directly - bots will fill empty slots automatically!

Need help? Check server logs in Railway/Render dashboard.
