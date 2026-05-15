# E-commerce Stripe Inventory

## Описание
E-commerce Stripe Inventory — интернет-магазин с каталогом товаров, поиском, фильтрацией, корзиной, оформлением заказов через Stripe, историей заказов и административной панелью управления товарами и инвентарём.

Проект реализован как SPA-приложение: frontend работает на React, backend предоставляет Express API, данные хранятся в PostgreSQL. Авторизация построена на JWT, доступ к административным операциям ограничен через RBAC-роли `customer` и `admin`.

## Стек технологий
- Frontend: React, Vite, React Router, Axios, Stripe React Elements
- Backend: Node.js, Express
- База данных: PostgreSQL
- Авторизация: JWT + RBAC
- Платежи: Stripe Payment Intents API
- Контейнеризация: Docker, Docker Compose
- Тесты: Jest, Supertest, Vitest, React Testing Library

## Функциональность
- регистрация и авторизация пользователей;
- роли `customer` и `admin`;
- каталог товаров с поиском, фильтрацией по категории и цене;
- корзина в `localStorage` с синхронизацией с сервером после входа;
- оформление заказа через Stripe;
- проверка остатков товара перед созданием платежа;
- списание остатков после успешного платежа;
- история заказов пользователя;
- админ-панель для создания, редактирования и удаления товаров;
- Docker Compose для запуска всего стека одной командой;
- тесты с покрытием не менее 50% при запуске coverage-скриптов.

## Запуск проекта

### Требования
- Docker и Docker Compose
- Git
- Stripe test keys для полноценной проверки оплаты

### Шаги
1. Клонировать репозиторий:
   ```bash
   git clone <url>
   cd ecommerce-stripe-inventory
   ```

2. Скопировать файл переменных окружения:
   ```bash
   cp .env.example .env
   ```

3. Открыть `.env` и заменить Stripe-ключи:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

4. Запустить все сервисы:
   ```bash
   docker compose up --build
   ```

5. Открыть в браузере:
   ```text
   http://localhost:3000
   ```

Backend API будет доступен по адресу:
```text
http://localhost:4000/api
```

## Переменные окружения

| Переменная | Описание |
|---|---|
| `NODE_ENV` | Режим работы приложения: `development`, `test`, `production` |
| `POSTGRES_DB` | Имя базы данных PostgreSQL |
| `POSTGRES_USER` | Пользователь PostgreSQL |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL |
| `DATABASE_URL` | Строка подключения backend к PostgreSQL |
| `API_PORT` | Порт Express API |
| `JWT_SECRET` | Секрет для подписи JWT-токенов |
| `JWT_EXPIRES_IN` | Срок жизни JWT-токена |
| `CORS_ORIGIN` | Разрешённый origin frontend-приложения |
| `ADMIN_EMAIL` | Email администратора, создаваемого при первом запуске |
| `ADMIN_PASSWORD` | Пароль администратора, создаваемого при первом запуске |
| `ADMIN_NAME` | Имя администратора |
| `STRIPE_SECRET_KEY` | Секретный Stripe API key для backend |
| `STRIPE_WEBHOOK_SECRET` | Секрет Stripe webhook, оставлен для расширения проекта |
| `VITE_API_URL` | URL backend API для frontend |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Публичный Stripe key для React-приложения |

## Тестовый администратор
После первого запуска автоматически создаётся администратор:

```text
Email: admin@example.com
Password: Admin12345!
```

Значения можно изменить в `.env` до первого запуска.

## Запуск тестов

Backend:
```bash
cd server
npm install
npm test
npm run test:coverage
```

Frontend:
```bash
cd client
npm install
npm test
npm run test:coverage
```

Общий запуск тестов из корня:
```bash
npm test
npm run test:coverage
```

## Git и commit-сообщения
Пример последовательности осмысленных commit-сообщений:

```bash
git init
git add .
git commit -m "chore: initialize ecommerce monorepo"
git commit -m "feat(api): add auth, products, cart and orders endpoints"
git commit -m "feat(web): add catalog, cart, checkout and admin panel"
git commit -m "test: add backend and frontend coverage"
git commit -m "docs: add docker launch instructions"
```

## Основные API endpoints

| Метод | Endpoint | Доступ | Описание |
|---|---|---|---|
| `POST` | `/api/auth/register` | public | Регистрация customer |
| `POST` | `/api/auth/login` | public | Авторизация |
| `GET` | `/api/products` | public | Каталог товаров |
| `POST` | `/api/products` | admin | Создание товара |
| `PUT` | `/api/products/:id` | admin | Редактирование товара |
| `DELETE` | `/api/products/:id` | admin | Удаление товара |
| `GET` | `/api/cart` | customer/admin | Получение серверной корзины |
| `POST` | `/api/cart/sync` | customer/admin | Синхронизация localStorage-корзины с сервером |
| `POST` | `/api/orders/create-payment-intent` | customer/admin | Создание заказа и Stripe PaymentIntent |
| `POST` | `/api/orders/confirm` | customer/admin | Подтверждение успешного платежа и списание товара |
| `GET` | `/api/orders` | customer/admin | История заказов |

## Stripe test card
Для тестовой оплаты в Stripe можно использовать карту:

```text
4242 4242 4242 4242
Любая будущая дата
Любой CVC
Любой ZIP
```

## Развёртывание
Проект можно запускать локально, на VPS или в облаке через:

```bash
docker compose up --build -d
```

Для production-развёртывания рекомендуется:
- заменить `JWT_SECRET` на длинное случайное значение;
- использовать настоящие Stripe test/live keys;
- закрыть прямой внешний доступ к PostgreSQL;
- подключить HTTPS через Nginx/Caddy;
- настроить Stripe webhook для автоматического подтверждения платежей.
