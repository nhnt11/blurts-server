FROM node:10-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY gulpfile.js ./
COPY public ./public/
RUN npm install
RUN npm run build:all

FROM node:10-alpine

RUN addgroup -g 10001 app && \
    adduser -D -G app -h /app -u 10001 app
RUN npm update -g
RUN rm -rf /tmp/*

WORKDIR /app

USER app

COPY --from=builder --chown=app /app/public ./public
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install --production && rm -rf ~app/.npm /tmp/*

COPY --chown=app:app . /app

RUN npm run build:all

CMD NODE_ICU_DATA=./node_modules/full-icu node server.js
