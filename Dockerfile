# ---------- BUILD STAGE ----------
FROM node:18-bullseye-slim AS builder

WORKDIR /app

ARG REACT_APP_GA_TRACKING_ID

# Copy root package files
COPY package*.json ./

# Copy workspace package files (creating directory structure)
COPY packages/common/package*.json ./packages/common/
COPY packages/server/package*.json ./packages/server/
COPY packages/client/package*.json ./packages/client/

# Install ALL deps (including dev + all workspaces)
RUN npm install --include=dev

# Copy source files for all packages
COPY packages/common ./packages/common
COPY packages/server/src ./packages/server/src
COPY packages/client/src ./packages/client/src
COPY packages/client/public ./packages/client/public

# Copy scripts and configs needed for build
COPY scripts ./scripts
COPY tsconfig*.json ./
COPY .prettierrc* ./

# Build client + server in PRODUCTION mode
ENV BUILD_MODE=production
RUN npm run build

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
