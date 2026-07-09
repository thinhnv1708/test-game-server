# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including devDependencies) to build the app
RUN npm ci

# Copy source code
COPY src ./src

# Build the TypeScript project
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Copy drizzle migrations folder and config
COPY drizzle ./drizzle
COPY drizzle.config.ts ./drizzle.config.ts

# Expose port 3000
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Run migrations and start the app
CMD ["sh", "-c", "npm run db:migrate && node dist/server.js"]

