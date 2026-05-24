import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.OPENCBS_BASE_URL ?? 'http://localhost';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    {
      // Browser-driven UI tests.
      name: 'chromium',
      testMatch: 'transfers/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'], headless: false },
    },
    {
      // HTTP API tests (no browser launched — they only use request contexts).
      name: 'api',
      testMatch: 'api/**/*.spec.ts',
      use: { baseURL: BASE_URL },
    },
  ],
});
