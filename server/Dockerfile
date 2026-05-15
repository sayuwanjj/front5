FROM node:20-slim

WORKDIR /app

COPY package*.json ./

# Надежная установка только production-зависимостей
RUN npm config set registry http://registry.npmjs.org/ && \
    npm install --omit=dev --no-audit --fund=false --fetch-retries=5 --fetch-timeout=600000 --verbose

COPY src ./src

EXPOSE 4000
CMD ["npm", "start"]