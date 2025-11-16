# ============================================
# TOSIOS Production Dockerfile (Railway-ready)
# Works with npm + Yarn-style workspaces
# ============================================

FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package.json & lockfile
COPY package*.json ./

# Copy ALL workspace package.json files
COPY packages/common/package*.json ./packages/common/
COPY packages/server/package*.json ./packages/server/
COPY packages/client/package*.json ./packages/client/

# Install all dependencies (root + all workspaces)
RUN npm install --include=dev

# Copy full source AFTER installing dependencies
COPY . .

# Build the project (creates server dist + client bundle)
ENV BUILD_MODE=production
RUN npm run build


# ===========================
# Runtime image
# ===========================
FROM node:18-alpine

WORKDIR /app

# Bring built app + node_modules from builder stage
COPY --from=builder /app ./

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "packages/server/dist/index.js"]
