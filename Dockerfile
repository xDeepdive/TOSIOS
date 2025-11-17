# --- Build & Runtime in one image (simple + works with Railway) ---

FROM node:18-bullseye-slim

# Create app directory
WORKDIR /app

# Copy root package + lockfile
COPY package.json yarn.lock ./

# Copy monorepo packages + scripts + tsconfig
COPY packages ./packages
COPY scripts ./scripts
COPY tsconfig.json ./tsconfig.json

# Install dependencies via Yarn (the repo uses workspaces)
RUN yarn install --frozen-lockfile

# Build client + server (runs scripts/build.ts)
RUN yarn build

# Production env
ENV NODE_ENV=production
ENV PORT=3001

# Expose port for Railway
EXPOSE 3001

# Start both: Express + Colyseus + static client
CMD ["yarn", "serve"]
