import { test, expect } from '../../fixtures/api.fixture';

/**
 * GET endpoint coverage: /api/vaults
 */
test.describe('API · Vaults', () => {
  test('GET /api/vaults returns the vault list for an authenticated user', async ({ apiClient }) => {
    const res = await apiClient.get('/api/vaults');

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.content)).toBe(true);

    if (body.content.length > 0) {
      const vault = body.content[0];
      expect(vault).toHaveProperty('id');
      expect(vault).toHaveProperty('name');
      expect(Array.isArray(vault.accounts)).toBe(true);
    }
  });

  test('GET /api/vaults is rejected without authentication', async ({ request }) => {
    const res = await request.get('/api/vaults');
    expect(res.status()).toBe(401);
  });
});
