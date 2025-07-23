# Railway Dockerfile for DrCarCold
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Set most environment variables early, but keep NODE_ENV as development for build
ENV PORT=3000
ENV DATABASE_URL="file:./prod.db"
ENV JWT_SECRET="drcarcold-super-secret-jwt-key-2024-railway"
ENV ADMIN_EMAIL="admin@drcarcold.com"
ENV ADMIN_PASSWORD="DrCarCold2024!"
ENV NEXTAUTH_SECRET="drcarcold-nextauth-secret-2024"

# Copy package files first for better caching
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application with development NODE_ENV to keep dev dependencies available
ENV NODE_ENV=development
RUN npm run build

# Create production database and run migrations
RUN npx prisma db push --accept-data-loss || true

# NOW set to production and remove dev dependencies
ENV NODE_ENV=production
RUN npm prune --production

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 