FROM node:20-slim AS build

WORKDIR /app

# Передаем переменные окружения для сборки Vite
ARG VITE_API_URL
ARG VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY

COPY package*.json ./

# Надежная установка с HTTP-реестром, ретраями и расширенным таймаутом
RUN npm config set registry http://registry.npmjs.org/ && \
    npm install --legacy-peer-deps --maxsockets=3 --no-audit --fund=false --fetch-retries=5 --fetch-timeout=600000 --verbose

COPY . .
RUN npm run build

# Финальный легковесный этап с Nginx
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]