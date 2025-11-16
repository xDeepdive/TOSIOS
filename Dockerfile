# TOSIOS full app Dockerfile (server + client)
# Works on Railway when you select "Use Dockerfile"

FROM node:18-alpine AS builder

# Install build tools (esbuild sometimes needs these)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy root manifests
COPY package.json yarn.lock ./

# Copy monorepo packages and scripts
COPY packages ./packages
COPY scripts ./scripts
COPY tsconfig.json ./tsconfig.json

# Install all deps via Yarn workspaces (as the repo expects)
RUN yarn install --frozen-lockfile

# Build client + server (ts-node ./scripts/build.ts)
RUN yarn build

# ---------- Runtime image ----------
FROM node:18-alpine

WORKDIR /app
ENV NODE_ENV=production

# Copy everything built in the builder
COPY --from=builder /app /app

# Expose the port used by TOSIOS
EXPOSE 3001

# Start the game server (also serves the client)
CMD ["yarn", "serve"]
