const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { signToken } = require('../utils/tokens');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authSchemas');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

router.post('/register', validate(registerSchema), asyncHandler(async (req, res) => {
  const { name, email, password } = req.validated.body;
  const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rowCount > 0) throw new HttpError(409, 'Пользователь с таким email уже существует');

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await db.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'customer')
     RETURNING id, name, email, role`,
    [name, email.toLowerCase(), passwordHash]
  );

  const user = result.rows[0];
  res.status(201).json({ user: publicUser(user), token: signToken(user) });
}));

router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  if (result.rowCount === 0) throw new HttpError(401, 'Неверный email или пароль');

  const user = result.rows[0];
  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) throw new HttpError(401, 'Неверный email или пароль');

  res.json({ user: publicUser(user), token: signToken(user) });
}));

router.get('/me', authenticate, asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
}));

module.exports = router;
