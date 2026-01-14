FROM node:20-bookworm-slim

WORKDIR /app

# Install OpenSSL 3.x for Prisma compatibility (bookworm uses openssl 3.x)
RUN apt-get update && apt-get install -y openssl libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]
