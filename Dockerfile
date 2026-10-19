# BrewCrate — local training sandbox image
FROM node:20-bookworm-slim

WORKDIR /app

# Install dependencies first to leverage layer caching.
COPY package.json ./
RUN npm install --omit=dev

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
