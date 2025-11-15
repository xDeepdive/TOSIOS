# 🚀 TOSIOS Enhanced - Deployment Guide

## Netlify Deployment (Easiest for Frontend)

### Quick Deploy

1. **Fork or Push to GitHub**
   - Make sure all code is pushed to your GitHub repository

2. **Connect to Netlify**
   - Go to [Netlify](https://www.netlify.com/)
   - Click "New site from Git"
   - Choose "GitHub" and authorize
   - Select your TOSIOS repository
   - Netlify will auto-detect the `netlify.toml` configuration

3. **Deploy Settings** (Auto-configured via netlify.toml)
   - Build command: `yarn install && yarn build`
   - Publish directory: `packages/client/dist`
   - Node version: 18

4. **Deploy!**
   - Click "Deploy site"
   - Wait ~3-5 minutes for build
   - Get your live URL: `https://your-site.netlify.app`

### Environment Variables (Optional)

If you need custom settings:
- Go to Site Settings → Environment Variables
- Add any needed variables

---

## Heroku Deployment (For Full Stack with WebSocket)

Since TOSIOS needs a WebSocket server, you'll need a backend hosting solution:

### Method 1: Heroku

1. **Create Heroku App**
   ```bash
   heroku create tosios-multiplayer
   ```

2. **Add buildpacks**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

3. **Create Procfile**
   ```
   web: node packages/server/dist/index.js
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **Set environment**
   ```bash
   heroku config:set NODE_ENV=production
   ```

---

## Docker Deployment (Production-Ready)

### Deploy with Docker

1. **Build Image**
   ```bash
   docker build -t tosios-game .
   ```

2. **Run Container**
   ```bash
   docker run -d -p 3001:3001 tosios-game
   ```

3. **Deploy to Cloud**
   - AWS ECS
   - Google Cloud Run
   - DigitalOcean App Platform

---

## Vercel Deployment (Serverless)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Production**
   ```bash
   vercel --prod
   ```

---

## Railway Deployment (Easy Full Stack)

1. **Go to [Railway.app](https://railway.app/)**
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose TOSIOS repository**
5. **Railway auto-detects Node.js**
6. **Get your URL!**

---

## Current Features in Deployed Game

✅ **10-player support**
✅ **Kill streak tracking** with bonuses (3/5/10 streaks)
✅ **XP & Level system** (level up every 1000 XP)
✅ **Score system** with streak bonuses
✅ **Accuracy tracking** (shots fired vs hits)
✅ **Powerups** (Speed Boost, Shield, Rapid Fire, Invisibility, Double Damage)
✅ **Enhanced leaderboard** (Level, Score, Kills, Streak)
✅ **Visual powerup indicators** on HUD
✅ **Real-time stats display**

---

## Testing After Deployment

1. **Open the deployed URL**
2. **Create a room** with 10 max players
3. **Share the link** with friends
4. **Test features**:
   - Kill tracking
   - Powerups spawning
   - Leaderboard updates
   - Stats display

---

## Troubleshooting

### WebSocket Connection Issues
- Make sure your host supports WebSockets
- Check firewall settings
- Verify port 3001 is open

### Build Failures
- Clear cache: `yarn clean`
- Reinstall: `rm -rf node_modules && yarn install`
- Check Node version: Should be v14+

### Game Not Loading
- Check browser console (F12)
- Verify static files are served correctly
- Check network tab for failed requests

---

## Recommended Hosting for Full Experience

| Platform | Best For | Cost | WebSocket Support |
|----------|----------|------|-------------------|
| **Railway** | Full stack | Free tier | ✅ Yes |
| **Heroku** | Full stack | Free tier (sleep) | ✅ Yes |
| **DigitalOcean** | Production | $5/month | ✅ Yes |
| **AWS EC2** | Enterprise | Variable | ✅ Yes |
| **Netlify** | Frontend only | Free | ❌ Need separate backend |

---

## 🎮 Play Now!

Once deployed, your game will be accessible at your hosting URL 24/7!

**Features Working:**
- Multiplayer (up to 16 players)
- Kill streaks with rewards
- XP progression
- Powerup system
- Enhanced stats
- Real-time leaderboards

Enjoy your fully-featured multiplayer game! 🚀
