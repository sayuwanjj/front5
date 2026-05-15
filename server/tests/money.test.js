const { centsToMoney, moneyToCents, formatProduct } = require('../src/utils/money');

describe('money utils', () => {
  test('converts cents to money', () => {
    expect(centsToMoney(1299)).toBe(12.99);
    expect(centsToMoney(1200)).toBe(12);
  });

  test('converts money to cents', () => {
    expect(moneyToCents(12.99)).toBe(1299);
    expect(moneyToCents('10.50')).toBe(1050);
  });

  test('rejects invalid price', () => {
    expect(() => moneyToCents(-1)).toThrow('Некорректная цена');
    expect(() => moneyToCents('abc')).toThrow('Некорректная цена');
  });

  test('formats product row', () => {
    const product = formatProduct({
      id: 1,
      name: 'Test',
      description: 'Desc',
      category: 'cat',
      price_cents: 500,
      stock: 2,
      image_url: 'http://example.com/image.jpg',
      is_active: true,
      created_at: 'now',
      updated_at: 'now',
    });

    expect(product).toMatchObject({ id: 1, price: 5, priceCents: 500, imageUrl: 'http://example.com/image.jpg' });
  });
});
