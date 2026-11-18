FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

# Install production dependencies from the lockfile first, so this layer is
# cached until package*.json changes.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

# Run as the unprivileged user that the node image provides.
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]
