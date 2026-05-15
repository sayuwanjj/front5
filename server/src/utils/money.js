function centsToMoney(cents) {
  return Number((cents / 100).toFixed(2));
}

function moneyToCents(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new Error('Некорректная цена');
  }
  return Math.round(number * 100);
}

function formatProduct(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    priceCents: row.price_cents,
    price: centsToMoney(row.price_cents),
    stock: row.stock,
    imageUrl: row.image_url,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { centsToMoney, moneyToCents, formatProduct };
