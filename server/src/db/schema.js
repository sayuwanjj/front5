const bcrypt = require('bcryptjs');
const db = require('../config/db');
const env = require('../config/env');

async function migrate() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(180) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(180) NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      category VARCHAR(120) NOT NULL DEFAULT 'other',
      price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      image_url TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS carts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      PRIMARY KEY (cart_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(40) NOT NULL DEFAULT 'pending_payment',
      total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
      stripe_payment_intent_id TEXT UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      paid_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      product_name VARCHAR(180) NOT NULL,
      unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
      quantity INTEGER NOT NULL CHECK (quantity > 0)
    );
  `);
}

async function seedAdmin() {
  const existing = await db.query('SELECT id FROM users WHERE email = $1', [env.adminEmail]);
  if (existing.rowCount > 0) return;

  const passwordHash = await bcrypt.hash(env.adminPassword, 10);
  await db.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
    [env.adminName, env.adminEmail, passwordHash, 'admin']
  );
}

async function seedProducts() {
  const existing = await db.query('SELECT id FROM products LIMIT 1');
  if (existing.rowCount > 0) return;

  const products = [
    ['Mechanical Keyboard Pro', 'Механическая клавиатура с RGB-подсветкой и hot-swap переключателями.', 'electronics', 8999, 25, 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=900'],
    ['Wireless Mouse X', 'Лёгкая беспроводная мышь для работы и игр.', 'electronics', 3499, 40, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=900'],
    ['USB-C Hub 8-in-1', 'Мультифункциональный USB-C хаб с HDMI, USB и Ethernet.', 'accessories', 4999, 18, 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=900'],
    ['Laptop Stand Air', 'Алюминиевая подставка для ноутбука с регулировкой угла.', 'office', 2999, 32, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=900'],
    ['Noise Cancelling Headphones', 'Наушники с активным шумоподавлением и автономностью до 35 часов.', 'audio', 12999, 12, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900'],
    ['Smart Desk Lamp', 'Настольная лампа с регулировкой яркости и температуры света.', 'office', 4499, 20, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900']
  ];

  for (const product of products) {
    await db.query(
      `INSERT INTO products (name, description, category, price_cents, stock, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      product
    );
  }
}

async function initDatabase() {
  await migrate();
  await seedAdmin();
  await seedProducts();
}

module.exports = { initDatabase, migrate, seedAdmin, seedProducts };
