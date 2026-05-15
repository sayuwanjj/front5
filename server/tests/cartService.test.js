jest.mock('../src/config/db', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

const db = require('../src/config/db');
const cartService = require('../src/services/cartService');

describe('cartService', () => {
  beforeEach(() => jest.clearAllMocks());

  test('getOrCreateCart returns existing cart', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 10 }] });
    await expect(cartService.getOrCreateCart(1)).resolves.toEqual({ id: 10 });
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  test('getOrCreateCart creates cart when missing', async () => {
    db.query
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 11 }] });

    await expect(cartService.getOrCreateCart(1)).resolves.toEqual({ id: 11 });
  });

  test('assertProductAvailable rejects missing product', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    await expect(cartService.assertProductAvailable(1, 1)).rejects.toMatchObject({ statusCode: 404 });
  });

  test('assertProductAvailable rejects low stock', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, stock: 1, is_active: true }] });
    await expect(cartService.assertProductAvailable(1, 2)).rejects.toMatchObject({ statusCode: 409 });
  });

  test('getCart maps items and total', async () => {
    db.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 7 }] })
      .mockResolvedValueOnce({ rows: [
        { product_id: 1, quantity: 2, name: 'Mouse', price_cents: 500, stock: 10, image_url: null, category: 'electronics' },
      ] });

    const cart = await cartService.getCart(3);
    expect(cart.totalCents).toBe(1000);
    expect(cart.items[0]).toMatchObject({ productId: 1, lineTotal: 10 });
  });

  test('setCartItem validates product and writes item', async () => {
    db.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, stock: 5, is_active: true }] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 7 }] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 7 }] })
      .mockResolvedValueOnce({ rows: [] });

    const cart = await cartService.setCartItem(3, 1, 2);
    expect(cart.items).toEqual([]);
    expect(db.query).toHaveBeenCalledTimes(6);
  });

  test('syncCart replaces server cart', async () => {
    db.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 7 }] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, stock: 5, is_active: true }] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 7 }] })
      .mockResolvedValueOnce({ rows: [] });

    const cart = await cartService.syncCart(3, [{ productId: 1, quantity: 2 }]);
    expect(cart.totalCents).toBe(0);
  });

  test('removeCartItem deletes item', async () => {
    db.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 7 }] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 7 }] })
      .mockResolvedValueOnce({ rows: [] });

    const cart = await cartService.removeCartItem(3, 1);
    expect(cart.items).toEqual([]);
  });
});
