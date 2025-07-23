# Railway Dockerfile for DrCarCold
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create production database and run migrations
RUN npx prisma db push --accept-data-loss || true

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="file:./prod.db"
ENV JWT_SECRET="drcarcold-super-secret-jwt-key-2024-railway"
ENV ADMIN_EMAIL="admin@drcarcold.com"
ENV ADMIN_PASSWORD="DrCarCold2024!"
ENV NEXTAUTH_SECRET="drcarcold-nextauth-secret-2024"

# Start the application
CMD ["npm", "start"] 