import { Locator, Page, expect } from '@playwright/test';
import { TransferFormBasePage } from './transfer-form.base';
import { ROUTES } from '../../utils/routes';

export class VaultToBankPage extends TransferFormBasePage {
  readonly vaultSelect: Locator;
  readonly bankAccountLookup: Locator;
  readonly currencyLookup: Locator;
  readonly personInChargeLookup: Locator;

  constructor(page: Page) {
    super(page);
    this.vaultSelect = page.locator('cbs-form-select-control select, select[formcontrolname="vaultId"]').first();
    this.bankAccountLookup = page.locator('cbs-form-lookup-control').filter({ hasText: /bank account/i }).first();
    this.currencyLookup = page.locator('cbs-form-lookup-control').filter({ hasText: /currency/i }).first();
    this.personInChargeLookup = page.locator('cbs-form-lookup-control').filter({ hasText: /person in charge/i }).first();
  }

  async open(): Promise<void> {
    await this.goto(ROUTES.transfers.vaultToBank);
  }

  async expectLoaded(): Promise<void> {
    await this.expectHeading(/transfer from vault to bank/i);
  }

  async selectVault(): Promise<void> {
    const options = await this.vaultSelect.locator('option').all();
    if (options.length > 1) {
      const value = await options[1].getAttribute('value');
      if (value) await this.vaultSelect.selectOption(value);
    }
  }

  async selectBankAccount(searchText: string): Promise<void> {
    await this.pickFromLookup(this.bankAccountLookup, searchText);
  }

  async selectCurrency(searchText: string = 'USD'): Promise<void> {
    await this.pickFromLookup(this.currencyLookup, searchText);
  }

  async selectPersonInCharge(searchText: string = 'Admin'): Promise<void> {
    await this.pickFromLookup(this.personInChargeLookup, searchText, /Administrator/i);
  }

  async expectBalanceVisible(): Promise<void> {
    await expect(this.balanceField).toBeVisible();
  }

  async expectBalanceNotVisible(): Promise<void> {
    await expect(this.balanceField).not.toBeVisible();
  }

  async expectDatePreFilled(): Promise<void> {
    await expect(this.dateInput).not.toHaveValue('');
  }
}
