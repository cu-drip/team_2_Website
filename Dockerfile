# Stage 1: Build frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Run server
FROM node:20-alpine AS runner
WORKDIR /app
# Copy server code and built frontend
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm install --production
COPY server ./server
COPY --from=builder /app/dist ./dist
# Expose port
EXPOSE 3000
# Start the server
CMD ["node", "server/index.js"] 