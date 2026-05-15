const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(120),
    email: z.string().email('Некорректный email').max(180),
    password: z.string().min(8, 'Пароль должен содержать минимум 8 символов').max(120),
  }),
  query: z.any(),
  params: z.any(),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Некорректный email'),
    password: z.string().min(1, 'Введите пароль'),
  }),
  query: z.any(),
  params: z.any(),
});

module.exports = { registerSchema, loginSchema };
