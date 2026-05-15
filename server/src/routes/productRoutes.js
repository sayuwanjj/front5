const express = require('express');
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { authenticate, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { moneyToCents, formatProduct } = require('../utils/money');
const { productCreateSchema, productUpdateSchema, productListSchema, productIdSchema } = require('../validators/productSchemas');

const router = express.Router();

router.get('/', validate(productListSchema), asyncHandler(async (req, res) => {
  const { q, category, minPrice, maxPrice, sort = 'newest' } = req.validated.query;
  const conditions = ['is_active = TRUE'];
  const params = [];

  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    conditions.push(`(LOWER(name) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`);
  }

  if (category) {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }

  if (minPrice !== undefined) {
    params.push(moneyToCents(minPrice));
    conditions.push(`price_cents >= $${params.length}`);
  }

  if (maxPrice !== undefined) {
    params.push(moneyToCents(maxPrice));
    conditions.push(`price_cents <= $${params.length}`);
  }

  const orderMap = {
    newest: 'created_at DESC',
    price_asc: 'price_cents ASC',
    price_desc: 'price_cents DESC',
    name: 'name ASC',
  };

  const result = await db.query(
    `SELECT * FROM products WHERE ${conditions.join(' AND ')} ORDER BY ${orderMap[sort]}`,
    params
  );

  const categories = await db.query('SELECT DISTINCT category FROM products WHERE is_active = TRUE ORDER BY category ASC');
  res.json({ products: result.rows.map(formatProduct), categories: categories.rows.map((row) => row.category) });
}));

router.get('/:id', validate(productIdSchema), asyncHandler(async (req, res) => {
  const result = await db.query('SELECT * FROM products WHERE id = $1 AND is_active = TRUE', [req.validated.params.id]);
  if (result.rowCount === 0) throw new HttpError(404, 'Товар не найден');
  res.json({ product: formatProduct(result.rows[0]) });
}));

router.post('/', authenticate, requireRole('admin'), validate(productCreateSchema), asyncHandler(async (req, res) => {
  const body = req.validated.body;
  const result = await db.query(
    `INSERT INTO products (name, description, category, price_cents, stock, image_url, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [body.name, body.description, body.category, moneyToCents(body.price), body.stock, body.imageUrl || null, body.isActive ?? true]
  );
  res.status(201).json({ product: formatProduct(result.rows[0]) });
}));

router.put('/:id', authenticate, requireRole('admin'), validate(productUpdateSchema), asyncHandler(async (req, res) => {
  const current = await db.query('SELECT * FROM products WHERE id = $1', [req.validated.params.id]);
  if (current.rowCount === 0) throw new HttpError(404, 'Товар не найден');

  const existing = current.rows[0];
  const body = req.validated.body;
  const result = await db.query(
    `UPDATE products
     SET name = $1,
         description = $2,
         category = $3,
         price_cents = $4,
         stock = $5,
         image_url = $6,
         is_active = $7,
         updated_at = NOW()
     WHERE id = $8
     RETURNING *`,
    [
      body.name ?? existing.name,
      body.description ?? existing.description,
      body.category ?? existing.category,
      body.price !== undefined ? moneyToCents(body.price) : existing.price_cents,
      body.stock ?? existing.stock,
      body.imageUrl !== undefined ? body.imageUrl || null : existing.image_url,
      body.isActive ?? existing.is_active,
      req.validated.params.id,
    ]
  );

  res.json({ product: formatProduct(result.rows[0]) });
}));

router.delete('/:id', authenticate, requireRole('admin'), validate(productIdSchema), asyncHandler(async (req, res) => {
  const result = await db.query(
    'UPDATE products SET is_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING *',
    [req.validated.params.id]
  );
  if (result.rowCount === 0) throw new HttpError(404, 'Товар не найден');
  res.status(204).send();
}));

module.exports = router;
