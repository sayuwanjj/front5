const Stripe = require('stripe');
const db = require('../config/db');
const env = require('../config/env');
const HttpError = require('../utils/httpError');
const { centsToMoney } = require('../utils/money');
const { getCart, clearCart } = require('./cartService');

function createStripeClient() {
  if (!env.stripeSecretKey || env.stripeSecretKey.includes('replace_me')) {
    throw new HttpError(500, 'Stripe не настроен. Укажите STRIPE_SECRET_KEY в .env');
  }
  return new Stripe(env.stripeSecretKey);
}

function mapOrder(row, items = []) {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    totalCents: row.total_cents,
    total: centsToMoney(row.total_cents),
    stripePaymentIntentId: row.stripe_payment_intent_id,
    createdAt: row.created_at,
    paidAt: row.paid_at,
    items,
  };
}

async function createPaymentIntentForCart(user) {
  const cart = await getCart(user.id);
  if (cart.items.length === 0) throw new HttpError(400, 'Корзина пуста');

  for (const item of cart.items) {
    if (item.stock < item.quantity) {
      throw new HttpError(409, `Недостаточно товара "${item.name}". Доступно: ${item.stock}`);
    }
  }

  const stripe = createStripeClient();
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, status, total_cents)
       VALUES ($1, 'pending_payment', $2)
       RETURNING *`,
      [user.id, cart.totalCents]
    );
    const order = orderResult.rows[0];

    for (const item of cart.items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price_cents, quantity)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.productId, item.name, item.priceCents, item.quantity]
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: cart.totalCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: String(order.id),
        userId: String(user.id),
      },
    });

    await client.query(
      'UPDATE orders SET stripe_payment_intent_id = $1 WHERE id = $2',
      [paymentIntent.id, order.id]
    );

    await client.query('COMMIT');

    return {
      orderId: order.id,
      clientSecret: paymentIntent.client_secret,
      totalCents: cart.totalCents,
      total: centsToMoney(cart.totalCents),
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function confirmPaidOrder(user, paymentIntentId) {
  const stripe = createStripeClient();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    throw new HttpError(400, `Платёж ещё не завершён. Текущий статус Stripe: ${paymentIntent.status}`);
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      'SELECT * FROM orders WHERE stripe_payment_intent_id = $1 FOR UPDATE',
      [paymentIntentId]
    );

    if (orderResult.rowCount === 0) throw new HttpError(404, 'Заказ не найден');
    const order = orderResult.rows[0];

    if (order.user_id !== user.id && user.role !== 'admin') {
      throw new HttpError(403, 'Нет доступа к заказу');
    }

    if (order.status === 'paid') {
      const existing = await getOrderById(user, order.id, client);
      await client.query('COMMIT');
      return existing;
    }

    const items = await client.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);

    for (const item of items.rows) {
      const stockResult = await client.query(
        'SELECT stock FROM products WHERE id = $1 FOR UPDATE',
        [item.product_id]
      );

      if (stockResult.rowCount === 0) continue;
      if (stockResult.rows[0].stock < item.quantity) {
        throw new HttpError(409, `Недостаточно товара "${item.product_name}" для завершения заказа`);
      }

      await client.query(
        'UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    const paidResult = await client.query(
      `UPDATE orders SET status = 'paid', paid_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [order.id]
    );

    await clearCart(order.user_id, client);
    await client.query('COMMIT');

    return getOrderById(user, paidResult.rows[0].id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getOrderById(user, orderId, client = db) {
  const orderResult = await client.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  if (orderResult.rowCount === 0) throw new HttpError(404, 'Заказ не найден');

  const order = orderResult.rows[0];
  if (order.user_id !== user.id && user.role !== 'admin') throw new HttpError(403, 'Нет доступа к заказу');

  const itemsResult = await client.query(
    `SELECT id, product_id, product_name, unit_price_cents, quantity
     FROM order_items
     WHERE order_id = $1
     ORDER BY id ASC`,
    [orderId]
  );

  const items = itemsResult.rows.map((item) => ({
    id: item.id,
    productId: item.product_id,
    productName: item.product_name,
    unitPriceCents: item.unit_price_cents,
    unitPrice: centsToMoney(item.unit_price_cents),
    quantity: item.quantity,
    lineTotalCents: item.unit_price_cents * item.quantity,
    lineTotal: centsToMoney(item.unit_price_cents * item.quantity),
  }));

  return mapOrder(order, items);
}

async function listOrders(user) {
  const params = [];
  let where = '';

  if (user.role !== 'admin') {
    params.push(user.id);
    where = 'WHERE user_id = $1';
  }

  const result = await db.query(`SELECT * FROM orders ${where} ORDER BY created_at DESC`, params);
  const orders = [];

  for (const row of result.rows) {
    orders.push(await getOrderById(user, row.id));
  }

  return orders;
}

module.exports = { createPaymentIntentForCart, confirmPaidOrder, getOrderById, listOrders, mapOrder, createStripeClient };
