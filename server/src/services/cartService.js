const db = require('../config/db');
const HttpError = require('../utils/httpError');
const { centsToMoney } = require('../utils/money');

async function getOrCreateCart(userId, client = db) {
  const existing = await client.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
  if (existing.rowCount > 0) return existing.rows[0];

  const created = await client.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [userId]);
  return created.rows[0];
}

async function getCart(userId, client = db) {
  const cart = await getOrCreateCart(userId, client);
  const result = await client.query(
    `SELECT ci.product_id, ci.quantity, p.name, p.price_cents, p.stock, p.image_url, p.category
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = $1
     ORDER BY p.name ASC`,
    [cart.id]
  );

  const items = result.rows.map((row) => ({
    productId: row.product_id,
    quantity: row.quantity,
    name: row.name,
    priceCents: row.price_cents,
    price: centsToMoney(row.price_cents),
    stock: row.stock,
    imageUrl: row.image_url,
    category: row.category,
    lineTotalCents: row.price_cents * row.quantity,
    lineTotal: centsToMoney(row.price_cents * row.quantity),
  }));

  const totalCents = items.reduce((sum, item) => sum + item.lineTotalCents, 0);
  return { id: cart.id, items, totalCents, total: centsToMoney(totalCents) };
}

async function assertProductAvailable(productId, quantity, client = db) {
  const product = await client.query(
    'SELECT id, stock, is_active FROM products WHERE id = $1',
    [productId]
  );

  if (product.rowCount === 0 || !product.rows[0].is_active) {
    throw new HttpError(404, 'Товар не найден');
  }

  if (product.rows[0].stock < quantity) {
    throw new HttpError(409, `Недостаточно товара на складе. Доступно: ${product.rows[0].stock}`);
  }

  return product.rows[0];
}

async function setCartItem(userId, productId, quantity, client = db) {
  await assertProductAvailable(productId, quantity, client);
  const cart = await getOrCreateCart(userId, client);

  await client.query(
    `INSERT INTO cart_items (cart_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (cart_id, product_id)
     DO UPDATE SET quantity = EXCLUDED.quantity`,
    [cart.id, productId, quantity]
  );

  await client.query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cart.id]);
  return getCart(userId, client);
}

async function syncCart(userId, items, client = db) {
  const cart = await getOrCreateCart(userId, client);
  await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);

  for (const item of items) {
    await assertProductAvailable(item.productId, item.quantity, client);
    await client.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
      [cart.id, item.productId, item.quantity]
    );
  }

  await client.query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cart.id]);
  return getCart(userId, client);
}

async function removeCartItem(userId, productId, client = db) {
  const cart = await getOrCreateCart(userId, client);
  await client.query('DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cart.id, productId]);
  await client.query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cart.id]);
  return getCart(userId, client);
}

async function clearCart(userId, client = db) {
  const cart = await getOrCreateCart(userId, client);
  await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
}

module.exports = { getOrCreateCart, getCart, setCartItem, syncCart, removeCartItem, clearCart, assertProductAvailable };
