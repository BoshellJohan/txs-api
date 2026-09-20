FROM node:24.20-slim

WORKDIR ./app

COPY package*.json ./
RUN npm install
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

COPY . .
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "start"]
