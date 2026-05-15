FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --no-audit --fund=false --fetch-retries=5 --fetch-timeout=600000

COPY src ./src

EXPOSE 4000
CMD ["npm", "start"]