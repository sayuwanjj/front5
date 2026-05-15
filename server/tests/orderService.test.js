jest.mock('../src/config/db', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

const db = require('../src/config/db');
const env = require('../src/config/env');
const orderService = require('../src/services/orderService');

describe('orderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    env.stripeSecretKey = 'sk_test_replace_me';
  });

  test('createStripeClient rejects missing Stripe key', () => {
    expect(() => orderService.createStripeClient()).toThrow('Stripe не настроен');
  });

  test('mapOrder formats order row', () => {
    const order = orderService.mapOrder({
      id: 1,
      user_id: 2,
      status: 'paid',
      total_cents: 2500,
      stripe_payment_intent_id: 'pi_123',
      created_at: 'now',
      paid_at: 'now',
    }, [{ id: 1 }]);

    expect(order).toMatchObject({ id: 1, userId: 2, total: 25, items: [{ id: 1 }] });
  });

  test('getOrderById returns own order with items', async () => {
    db.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, user_id: 2, status: 'paid', total_cents: 2500, stripe_payment_intent_id: 'pi_123', created_at: 'now', paid_at: 'now' }] })
      .mockResolvedValueOnce({ rows: [{ id: 9, product_id: 5, product_name: 'Mouse', unit_price_cents: 1250, quantity: 2 }] });

    const order = await orderService.getOrderById({ id: 2, role: 'customer' }, 1);
    expect(order.items[0]).toMatchObject({ productName: 'Mouse', lineTotalCents: 2500 });
  });

  test('getOrderById rejects missing order', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    await expect(orderService.getOrderById({ id: 2, role: 'customer' }, 1)).rejects.toMatchObject({ statusCode: 404 });
  });

  test('getOrderById rejects forbidden order', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, user_id: 99, status: 'paid', total_cents: 2500 }] });
    await expect(orderService.getOrderById({ id: 2, role: 'customer' }, 1)).rejects.toMatchObject({ statusCode: 403 });
  });

  test('listOrders limits customer orders', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, user_id: 2, status: 'paid', total_cents: 2500, stripe_payment_intent_id: 'pi_123', created_at: 'now', paid_at: 'now' }] })
      .mockResolvedValueOnce({ rows: [] });

    const orders = await orderService.listOrders({ id: 2, role: 'customer' });
    expect(orders).toHaveLength(1);
    expect(db.query.mock.calls[0][1]).toEqual([2]);
  });
});
