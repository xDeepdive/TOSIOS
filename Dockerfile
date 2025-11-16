# TOSIOS Production Dockerfile (client + server on Railway)
# Uses npm workspaces, no Netlify needed

# ---------- Build stage ----------
FROM node:18-bullseye-slim AS builder

# Optional: ensure timezone / locale stuff is sane if needed
ENV NODE_ENV=development

WORKDIR /app

# Copy root manifests
COPY package*.json ./

# Copy ALL workspace package.json files so npm workspaces see them
COPY packages/common/package*.json ./packages/common/
COPY packages/server/package*.json ./packages/server/
COPY packages/client/package*.json ./packages/client/

# Install all dependencies for all workspaces (client + server + common)
RUN npm install --include=dev

# Now copy the full source
COPY . .

# Build the project (this runs ts-node ./scripts/build.ts)
# which builds both client and server
ENV BUILD_MODE=production
RUN npm run build

# ---------- Runtime stage ----------
FROM node:18-bullseye-slim

WORKDIR /app
ENV NODE_ENV=production

# Copy everything built (code + node_modules + dist)
COPY --from=builder /app ./

# TOSIOS server listens on 3001 by default
EXPOSE 3001

# Start the server (serves API + client)
CMD ["node", "packages/server/dist/index.js"]
