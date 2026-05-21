import { Locator, Page, expect } from '@playwright/test';

export abstract class BasePage {
  protected readonly successToast: Locator;
  protected readonly errorToast: Locator;
  protected readonly loadingIndicator: Locator;
  protected readonly pageHeading: Locator;
  private readonly headingTitle: Locator;

  constructor(protected readonly page: Page) {
    this.successToast = page.locator('.toast-success, .ngx-toastr.toast-success');
    this.errorToast = page.locator('.toast-error, .ngx-toastr.toast-error');
    this.loadingIndicator = page.locator('cbs-loading-indicator');
    this.pageHeading = page.locator('cbs-heading-block, .slds-page-header__title');
    this.headingTitle = page.locator('cbs-heading-block h1.slds-page-header__title');
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async expectUrl(pathFragment: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(pathFragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  async expectHeading(text: string | RegExp): Promise<void> {
    await expect(this.headingTitle).toBeVisible();
    await expect(this.headingTitle).toHaveText(text, { ignoreCase: true });
  }

  async expectSuccessToast(): Promise<void> {
    await expect(this.successToast.first()).toBeVisible({ timeout: 15_000 });
  }

  async expectErrorToast(): Promise<void> {
    await expect(this.errorToast.first()).toBeVisible({ timeout: 15_000 });
  }

  async expectNoToast(): Promise<void> {
    await expect(this.successToast).toHaveCount(0);
    await expect(this.errorToast).toHaveCount(0);
  }
}
