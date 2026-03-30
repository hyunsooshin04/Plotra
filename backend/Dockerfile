FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm install

COPY backend backend
RUN npm run build -w backend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm install --omit=dev

COPY --from=builder /app/backend/dist backend/dist
WORKDIR /app/backend

EXPOSE 4000
CMD ["npm", "run", "start"]
