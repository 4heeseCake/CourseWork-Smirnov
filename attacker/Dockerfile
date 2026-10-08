FROM node:22-alpine
WORKDIR /app
COPY server.js ./
COPY pages ./pages
COPY public ./public
USER node
EXPOSE 4000
CMD ["node", "server.js"]
