jest.mock('../src/config/db', () => ({ query: jest.fn() }));

const db = require('../src/config/db');
const { authenticate, requireRole } = require('../src/middleware/auth');
const { signToken } = require('../src/utils/tokens');

describe('auth middleware', () => {
  beforeEach(() => jest.clearAllMocks());

  test('rejects request without bearer token', async () => {
    const req = { headers: {} };
    const next = jest.fn();

    await authenticate(req, {}, next);

    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  test('loads user by valid token', async () => {
    const token = signToken({ id: 1, email: 'a@test.com', role: 'admin' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();
    db.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, email: 'a@test.com', role: 'admin' }] });

    await authenticate(req, {}, next);

    expect(req.user.email).toBe('a@test.com');
    expect(next).toHaveBeenCalledWith();
  });

  test('requireRole allows permitted role', () => {
    const req = { user: { role: 'admin' } };
    const next = jest.fn();
    requireRole('admin')(req, {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  test('requireRole rejects forbidden role', () => {
    const req = { user: { role: 'customer' } };
    const next = jest.fn();
    requireRole('admin')(req, {}, next);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });
});
