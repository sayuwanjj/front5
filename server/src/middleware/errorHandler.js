function notFound(req, res, next) {
  res.status(404).json({ message: 'Маршрут не найден' });
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const payload = {
    message: err.message || 'Внутренняя ошибка сервера',
  };

  if (err.details) payload.details = err.details;
  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}

module.exports = { notFound, errorHandler };
