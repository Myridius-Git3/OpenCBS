import { Locator, Page, expect } from '@playwright/test';
import { TransferFormBasePage } from './transfer-form.base';
import { ROUTES } from '../../utils/routes';

export class BetweenMembersPage extends TransferFormBasePage {
  readonly sourceAccountLookup: Locator;
  readonly destinationAccountLookup: Locator;
  readonly autoPrintCheckbox: Locator;
  readonly currencyReadonly: Locator;

  constructor(page: Page) {
    super(page);
    this.sourceAccountLookup = page.locator('cbs-form-lookup-control').filter({ hasText: /source/i }).first();
    this.destinationAccountLookup = page.locator('cbs-form-lookup-control').filter({ hasText: /destination/i }).first();
    this.autoPrintCheckbox = page.locator('input#auto-print, input[type="checkbox"][formcontrolname*="utoPrint" i]');
    this.currencyReadonly = page.locator('cbs-form-readonly-control').filter({ hasText: /currency/i });
  }

  async open(): Promise<void> {
    await this.goto(ROUTES.transfers.betweenMembers);
  }

  async expectLoaded(): Promise<void> {
    await this.expectHeading(/transfer between members/i);
  }

  async selectSourceAccount(searchText: string): Promise<void> {
    await this.pickFromLookup(this.sourceAccountLookup, searchText);
  }

  async selectDestinationAccount(searchText: string): Promise<void> {
    await this.pickFromLookup(this.destinationAccountLookup, searchText);
  }

  async toggleAutoPrint(): Promise<void> {
    await this.autoPrintCheckbox.click();
  }

  async expectAutoPrintUnchecked(): Promise<void> {
    await expect(this.autoPrintCheckbox).not.toBeChecked();
  }

  async expectBalanceVisible(): Promise<void> {
    await expect(this.balanceField).toBeVisible();
  }

  async expectCurrencyPopulated(): Promise<void> {
    await expect(this.currencyReadonly).toBeVisible();
  }

  async expectBalanceNotVisible(): Promise<void> {
    await expect(this.balanceField).not.toBeVisible();
  }

  async expectDatePreFilled(): Promise<void> {
    await expect(this.dateInput).not.toHaveValue('');
  }

  async expectDestinationSelected(): Promise<void> {
    const pillCount = await this.destinationAccountLookup.locator('.slds-pill__label, .slds-badge').count();
    const inputVal = await this.destinationAccountLookup.locator('input').first().inputValue().catch(() => '');
    const hasValue = pillCount > 0 || inputVal.trim().length > 0;
    expect(hasValue).toBe(true);
  }
}
