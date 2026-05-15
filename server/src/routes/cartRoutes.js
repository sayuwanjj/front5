const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { getCart, setCartItem, syncCart, removeCartItem } = require('../services/cartService');
const { syncCartSchema, addCartItemSchema, updateCartItemSchema, productParamSchema } = require('../validators/cartSchemas');

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  res.json({ cart: await getCart(req.user.id) });
}));

router.post('/sync', validate(syncCartSchema), asyncHandler(async (req, res) => {
  res.json({ cart: await syncCart(req.user.id, req.validated.body.items) });
}));

router.post('/items', validate(addCartItemSchema), asyncHandler(async (req, res) => {
  const { productId, quantity } = req.validated.body;
  res.status(201).json({ cart: await setCartItem(req.user.id, productId, quantity) });
}));

router.patch('/items/:productId', validate(updateCartItemSchema), asyncHandler(async (req, res) => {
  res.json({ cart: await setCartItem(req.user.id, req.validated.params.productId, req.validated.body.quantity) });
}));

router.delete('/items/:productId', validate(productParamSchema), asyncHandler(async (req, res) => {
  res.json({ cart: await removeCartItem(req.user.id, req.validated.params.productId) });
}));

module.exports = router;
