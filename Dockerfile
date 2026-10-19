# BrewCrate — local training sandbox image
FROM node:22-bookworm-slim

WORKDIR /app

# Build tools as a fallback in case better-sqlite3 has no prebuilt binary
# for this Node version and has to compile from source.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

# Install dependencies first to leverage layer caching.
# Copy the lockfile too so builds are reproducible.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the rest of the application.
COPY . .

# Build the SQLite database with demo data.
RUN npm run seed

# Bind to all interfaces inside the container; map to localhost when you run it.
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

# Run with:  docker run --rm -p 127.0.0.1:3000:3000 brewcrate
CMD ["npm", "start"]
