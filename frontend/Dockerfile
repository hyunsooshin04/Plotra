FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm install

COPY frontend frontend
RUN npm run build -w frontend

FROM nginx:1.27-alpine AS runner
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
