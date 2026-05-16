const { z } = require('zod');

const productBody = z.object({
  name: z.string().min(2).max(180),
  description: z.string().max(5000).default(''),
  category: z.string().min(2).max(120).default('other'),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  imageUrl: z.string().max(3000).optional().or(z.literal('')), // Изменено: снята строгая валидация одиночного URL
  isActive: z.boolean().optional(),
});

const productCreateSchema = z.object({
  body: productBody,
  query: z.any(),
  params: z.any(),
});

const productUpdateSchema = z.object({
  body: productBody.partial(),
  query: z.any(),
  params: z.object({ id: z.coerce.number().int().positive() }),
});

const productListSchema = z.object({
  body: z.any(),
  query: z.object({
    q: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    sort: z.enum(['newest', 'price_asc', 'price_desc', 'name']).optional(),
  }),
  params: z.any(),
});

const productIdSchema = z.object({
  body: z.any(),
  query: z.any(),
  params: z.object({ id: z.coerce.number().int().positive() }),
});

module.exports = { productCreateSchema, productUpdateSchema, productListSchema, productIdSchema };