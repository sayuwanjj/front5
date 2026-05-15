jest.mock('../src/config/db', () => ({ query: jest.fn() }));

const request = require('supertest');
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');
const app = require('../src/app');

describe('app routes', () => {
  beforeEach(() => jest.clearAllMocks());

  test('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('register creates customer', async () => {
    db.query
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, name: 'User', email: 'user@test.com', role: 'customer' }] });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User', email: 'user@test.com', password: 'Password123' });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('customer');
    expect(res.body.token).toBeTruthy();
  });

  test('login rejects wrong credentials', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'missing@test.com', password: 'bad' });

    expect(res.status).toBe(401);
  });

  test('login returns token for valid user', async () => {
    const passwordHash = await bcrypt.hash('Password123', 10);
    db.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ id: 1, name: 'User', email: 'user@test.com', password_hash: passwordHash, role: 'customer' }],
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'Password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  test('GET /api/products returns product list', async () => {
    db.query
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{
          id: 1,
          name: 'Keyboard',
          description: 'Nice keyboard',
          category: 'electronics',
          price_cents: 1000,
          stock: 3,
          image_url: null,
          is_active: true,
          created_at: 'now',
          updated_at: 'now',
        }],
      })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ category: 'electronics' }] });

    const res = await request(app).get('/api/products?q=key');

    expect(res.status).toBe(200);
    expect(res.body.products[0].name).toBe('Keyboard');
    expect(res.body.categories).toEqual(['electronics']);
  });

  test('unknown route returns 404', async () => {
    const res = await request(app).get('/api/missing');
    expect(res.status).toBe(404);
  });
});
