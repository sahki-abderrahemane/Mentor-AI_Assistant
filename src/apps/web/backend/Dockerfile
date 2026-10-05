FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json nest-cli.json ./
COPY src src

RUN npx nest build

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist dist

RUN mkdir -p /app/uploads /app/data && chmod 755 /app/uploads /app/data

ENV NODE_ENV=production
ENV UPLOAD_DIR=/app/uploads
ENV DATA_DIR=/app/data

EXPOSE 3001

CMD ["node", "dist/main.js"]