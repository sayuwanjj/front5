const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { createPaymentIntentForCart, confirmPaidOrder, listOrders, getOrderById } = require('../services/orderService');
const { confirmOrderSchema, orderIdSchema } = require('../validators/orderSchemas');

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  res.json({ orders: await listOrders(req.user) });
}));

router.get('/:id', validate(orderIdSchema), asyncHandler(async (req, res) => {
  res.json({ order: await getOrderById(req.user, req.validated.params.id) });
}));

router.post('/create-payment-intent', asyncHandler(async (req, res) => {
  res.status(201).json(await createPaymentIntentForCart(req.user));
}));

router.post('/confirm', validate(confirmOrderSchema), asyncHandler(async (req, res) => {
  res.json({ order: await confirmPaidOrder(req.user, req.validated.body.paymentIntentId) });
}));

module.exports = router;
