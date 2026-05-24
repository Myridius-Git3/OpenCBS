import { test, expect } from '../../fixtures/api.fixture';
import { ADMIN_CREDENTIALS } from '../../utils/credentials';

/**
 * POST endpoint coverage: /api/login
 */
test.describe('API · Authentication', () => {
  test('POST /api/login returns a JWT for valid credentials', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: { username: ADMIN_CREDENTIALS.username, password: ADMIN_CREDENTIALS.password },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    // JWT shape: header.payload.signature
    expect(body.data).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
  });

  test('POST /api/login rejects invalid credentials', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: { username: ADMIN_CREDENTIALS.username, password: 'definitely-wrong-password' },
    });

    expect(res.ok()).toBeFalsy();
    const body = await res.json();
    expect(body.message).toMatch(/incorrect username or password/i);
  });
});
