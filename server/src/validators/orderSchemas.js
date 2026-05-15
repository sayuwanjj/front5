const { z } = require('zod');

const confirmOrderSchema = z.object({
  body: z.object({
    paymentIntentId: z.string().min(3),
  }),
  query: z.any(),
  params: z.any(),
});

const orderIdSchema = z.object({
  body: z.any(),
  query: z.any(),
  params: z.object({ id: z.coerce.number().int().positive() }),
});

module.exports = { confirmOrderSchema, orderIdSchema };
