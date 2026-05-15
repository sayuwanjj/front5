const db = require('../config/db');
const HttpError = require('../utils/httpError');
const { verifyToken } = require('../utils/tokens');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new HttpError(401, 'Необходима авторизация');
    }

    const token = header.slice('Bearer '.length);
    const payload = verifyToken(token);
    const result = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [payload.sub]);

    if (result.rowCount === 0) {
      throw new HttpError(401, 'Пользователь не найден');
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    next(error.statusCode ? error : new HttpError(401, 'Недействительный токен'));
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new HttpError(401, 'Необходима авторизация'));
    if (!roles.includes(req.user.role)) return next(new HttpError(403, 'Недостаточно прав'));
    return next();
  };
}

module.exports = { authenticate, requireRole };
