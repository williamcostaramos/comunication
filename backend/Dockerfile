FROM ghcr.io/puppeteer/puppeteer:20.9.0 as global-deps-stage

WORKDIR /app

ENV NODE_ENV=dev
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

FROM global-deps-stage as develop-stage
COPY package*.json ./
RUN npm install

FROM develop-stage as build-stage
COPY . .
RUN npm run build

FROM build-stage as development-stage
ENV NODE_ENV=development
ENTRYPOINT ["npm", "run", "dev:server"]

