import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { ROUTES } from '../utils/routes';
import { ADMIN_CREDENTIALS } from '../utils/credentials';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#username-id, input[name="username"]');
    this.passwordInput = page.locator('#password-id, input[name="password"], input[type="password"]');
    this.submitButton = page.getByRole('button', { name: /sign in/i });
  }

  async open(): Promise<void> {
    await this.goto(ROUTES.login);
  }

  async login(
    username: string = ADMIN_CREDENTIALS.username,
    password: string = ADMIN_CREDENTIALS.password,
  ): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await Promise.all([
      this.page.waitForURL(/dashboard|home|#\/(?!login)/, { timeout: 30_000 }),
      this.submitButton.click(),
    ]);
  }

  async expectLoginVisible(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }
}
