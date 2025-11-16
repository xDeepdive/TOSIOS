# ---------- BUILD STAGE ----------
FROM node:18-bullseye-slim AS builder

WORKDIR /app

# Copy root and workspace package manifests so npm workspaces can resolve deps
COPY package*.json ./
COPY packages/common/package*.json ./packages/common/
COPY packages/server/package*.json ./packages/server/
COPY packages/client/package*.json ./packages/client/

# Install ALL deps (including dev + all workspaces)
RUN npm install --include=dev

# Copy the rest of the source
COPY . .

# Build client + server in PRODUCTION mode
ENV BUILD_MODE=production
RUN npm run build
# (This runs ts-node ./scripts/build.ts which builds client + server)

# ---------- RUNTIME STAGE ----------
FROM node:18-bullseye-slim

WORKDIR /app

# Copy everything from builder (dist, public, node_modules, etc.)
COPY --from=builder /app ./

# Production env
ENV NODE_ENV=production

# TOSIOS server listens on 3001, so we tell Railway that too
ENV PORT=3001
EXPOSE 3001

# Start the colyseus / express server
CMD ["node", "packages/server/dist/index.js"]
