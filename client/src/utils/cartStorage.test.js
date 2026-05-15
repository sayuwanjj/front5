import { describe, expect, test, beforeEach } from 'vitest';
import { cartTotalCents, clearLocalCart, formatMoney, readLocalCart, upsertLocalCartItem, writeLocalCart } from './cartStorage';

const product = { id: 1, name: 'Keyboard', priceCents: 1000, price: 10, stock: 3, imageUrl: '', category: 'electronics' };

describe('cartStorage', () => {
  beforeEach(() => localStorage.clear());

  test('reads empty cart by default', () => {
    expect(readLocalCart()).toEqual([]);
  });

  test('writes and clears cart', () => {
    writeLocalCart([{ productId: 1, quantity: 2 }]);
    expect(readLocalCart()).toHaveLength(1);
    clearLocalCart();
    expect(readLocalCart()).toEqual([]);
  });

  test('upserts product with stock limit', () => {
    const items = upsertLocalCartItem([], product, 5);
    expect(items[0].quantity).toBe(3);

    const updated = upsertLocalCartItem(items, product, 2);
    expect(updated).toHaveLength(1);
    expect(updated[0].quantity).toBe(2);
  });

  test('calculates totals and formats money', () => {
    expect(cartTotalCents([{ priceCents: 500, quantity: 3 }])).toBe(1500);
    expect(formatMoney(1500)).toBe('$15.00');
  });
});
