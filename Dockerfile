# TOSIOS Server Dockerfile for Production Deployment
# Works with Railway, Render, Fly.io, and other Docker platforms

FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy all package files first (for better caching)
COPY package*.json ./
COPY packages/common/package*.json ./packages/common/
COPY packages/server/package*.json ./packages/server/

# Install ALL dependencies including devDependencies (needed for build)
RUN npm install --include=dev

# Copy all source code and build scripts
COPY . .

# Build the project (creates packages/server/dist/index.js)
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy built server files
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/common ./packages/common

# Install ONLY production dependencies
RUN npm install --omit=dev

# Set environment to production
ENV NODE_ENV=production

# Expose port (configurable via PORT env var)
EXPOSE 3001

# Start server
CMD ["node", "packages/server/dist/index.js"]
