const KEY = 'ecommerce_cart';

export function readLocalCart() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const items = JSON.parse(raw);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export function writeLocalCart(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function clearLocalCart() {
  localStorage.removeItem(KEY);
}

export function upsertLocalCartItem(items, product, quantity) {
  const existing = items.find((item) => item.productId === product.id);
  if (existing) {
    return items.map((item) =>
      item.productId === product.id
        ? { ...item, quantity: Math.min(quantity, product.stock) }
        : item
    );
  }

  return [
    ...items,
    {
      productId: product.id,
      name: product.name,
      priceCents: product.priceCents,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      category: product.category,
      quantity: Math.min(quantity, product.stock),
    },
  ];
}

export function cartTotalCents(items) {
  return items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
}

export function formatMoney(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}
