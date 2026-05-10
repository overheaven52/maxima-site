# Production-образ: SSR + API + админка (Express).
# Сборка: docker build -t maxima .
# Запуск: docker run -p 3001:3001 --env-file .env maxima
# См. также docker-compose.yml и DEPLOY.md

FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY server ./server
COPY public ./public
RUN chown -R node:node /app
USER node
EXPOSE 3001
CMD ["node", "server/index.js"]
