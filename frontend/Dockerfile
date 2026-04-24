# Multi-stage Dockerfile for Quasar/Vue frontend application

# --- Build stage -----------------------------------------------------------
# Use an official Node.js image to build the application. Using the alpine
# variant keeps the image small.

# Build-time arguments for front-end configuration. These will be passed
# into the Quasar build process via environment variables.


FROM node:16-alpine AS builder


# Set working directory inside the container
WORKDIR /app

# Copy package manifests and install dependencies. We use npm ci for
# reproducible installs; adjust to yarn if you're using yarn.lock instead.
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the source code and run the Quasar build command. The
# quasar CLI is installed globally to ensure the `quasar` command is
# available.
COPY . .
RUN npm install -g @quasar/cli \
    && quasar build


# --- Production stage ------------------------------------------------------
# Serve the built static files using nginx.
FROM nginx:alpine

# Optional runtime environment variables (mostly useful if you later add
# a startup script that injects them into a JS config file).


# Remove the default nginx content and replace with our built SPA
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist/spa /usr/share/nginx/html/

# Expose HTTP port
EXPOSE 80

# Start nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
