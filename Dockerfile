# Railway Dockerfile for DrCarCold
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Copy prisma schema before installing
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy all source code
COPY . .

# Set environment variables for build
ENV NODE_ENV=development
ENV DATABASE_URL="file:./prod.db"
ENV JWT_SECRET="drcarcold-super-secret-jwt-key-2024-railway"
ENV NEXTAUTH_SECRET="drcarcold-nextauth-secret-2024-railway"
ENV ADMIN_EMAIL="admin@drcarcold.com"  
ENV ADMIN_PASSWORD="DrCarCold2024!"
ENV NEXT_PUBLIC_SITE_URL="https://drcarcold-production.up.railway.app"

# 設置構建相關環境變數
ENV SKIP_ENV_VALIDATION=true
ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma client
RUN npx prisma generate

# Create and setup database first
RUN npx prisma db push --accept-data-loss || echo "Database setup completed"

# Build the application (with database ready)
RUN npm run build

# Set production environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http=require('http'); const options={hostname:'localhost',port:3000,path:'/api/health',timeout:2000}; const req=http.request(options,(res)=>{process.exit(res.statusCode===200?0:1)}); req.on('error',()=>process.exit(1)); req.end();"

# Start the application
CMD ["npm", "start"] 