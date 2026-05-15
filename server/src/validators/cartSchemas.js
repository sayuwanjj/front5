const { z } = require('zod');

const cartItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().max(999),
});

const syncCartSchema = z.object({
  body: z.object({
    items: z.array(cartItemSchema).max(100),
  }),
  query: z.any(),
  params: z.any(),
});

const addCartItemSchema = z.object({
  body: cartItemSchema,
  query: z.any(),
  params: z.any(),
});

const updateCartItemSchema = z.object({
  body: z.object({ quantity: z.number().int().positive().max(999) }),
  query: z.any(),
  params: z.object({ productId: z.coerce.number().int().positive() }),
});

const productParamSchema = z.object({
  body: z.any(),
  query: z.any(),
  params: z.object({ productId: z.coerce.number().int().positive() }),
});

module.exports = { syncCartSchema, addCartItemSchema, updateCartItemSchema, productParamSchema };
