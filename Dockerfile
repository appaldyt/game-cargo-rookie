FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DATA_DIR=/app/data NODE_OPTIONS="--experimental-sqlite --no-warnings"
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY server.js ./
COPY public ./public
RUN mkdir -p /app/data
EXPOSE 3000
VOLUME ["/app/data"]
CMD ["node", "--experimental-sqlite", "--no-warnings", "server.js"]
