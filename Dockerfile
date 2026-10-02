FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/src ./src
COPY --from=frontend-build /frontend/dist ./public
EXPOSE 3000
CMD ["node", "src/server.js"]
