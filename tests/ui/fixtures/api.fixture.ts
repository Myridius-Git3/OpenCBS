import { test as base, expect, APIRequestContext } from '@playwright/test';
import { ADMIN_CREDENTIALS } from '../utils/credentials';

type ApiFixtures = {
  authToken: string;
  apiClient: APIRequestContext;
};

export const test = base.extend<ApiFixtures>({
  authToken: async ({ request }, use) => {
    const res = await request.post('/api/login', {
      data: { username: ADMIN_CREDENTIALS.username, password: ADMIN_CREDENTIALS.password },
    });
    expect(res.ok(), 'login request should succeed').toBeTruthy();
    const body = await res.json();
    const token = typeof body?.data === 'string' ? body.data : body;
    expect(typeof token, 'login should return a token string').toBe('string');
    await use(token);
  },

  apiClient: async ({ playwright, baseURL, authToken }, use) => {
    const ctx = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${authToken}`,
        Accept: 'application/json',
      },
    });
    await use(ctx);
    await ctx.dispose();
  },
});

export { expect };
