# TOSIOS Server Dockerfile for Production Deployment
# Works with Railway, Render, Fly.io, and other Docker platforms

FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/common/package*.json ./packages/common/
COPY packages/server/package*.json ./packages/server/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the project (creates packages/server/dist/index.js)
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/server/package.json ./packages/server/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Set environment to production
ENV NODE_ENV=production

# Expose port (configurable via PORT env var)
EXPOSE 3001

# Start server
CMD ["node", "packages/server/dist/index.js"]
