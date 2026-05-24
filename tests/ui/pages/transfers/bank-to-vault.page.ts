import { Locator, Page, expect } from '@playwright/test';
import { TransferFormBasePage } from './transfer-form.base';
import { ROUTES } from '../../utils/routes';

export class BankToVaultPage extends TransferFormBasePage {
  readonly bankAccountLookup: Locator;
  readonly vaultSelect: Locator;
  readonly currencyReadonly: Locator;
  readonly chequeNumberInput: Locator;
  readonly chequePayeeInput: Locator;
  readonly personInChargeLookup: Locator;

  constructor(page: Page) {
    super(page);
    this.bankAccountLookup = page.locator('cbs-form-lookup-control').filter({ hasText: /bank account/i }).first();
    this.vaultSelect = page.locator('cbs-form-select-control select, select[formcontrolname="vaultId"]').first();
    this.currencyReadonly = page.locator('cbs-form-readonly-control').filter({ hasText: /currency/i });
    // formControlName binds to the <cbs-form-input-control> host, not the inner
    // <input>, so target the control by its field label and reach the input.
    this.chequeNumberInput = page
      .locator('cbs-form-input-control')
      .filter({ hasText: /cheque number/i })
      .locator('input');
    this.chequePayeeInput = page
      .locator('cbs-form-input-control')
      .filter({ hasText: /cheque payee/i })
      .locator('input');
    this.personInChargeLookup = page.locator('cbs-form-lookup-control').filter({ hasText: /person in charge/i }).first();
  }

  async open(): Promise<void> {
    await this.goto(ROUTES.transfers.bankToVault);
  }

  async expectLoaded(): Promise<void> {
    await this.expectHeading(/transfer from bank to vault/i);
  }

  async selectBankAccount(searchText: string): Promise<void> {
    await this.pickFromLookup(this.bankAccountLookup, searchText);
  }

  async selectVault(label?: string | RegExp): Promise<void> {
    const options = await this.vaultSelect.locator('option').all();
    if (options.length > 1) {
      if (label) {
        await this.vaultSelect.selectOption({ label: typeof label === 'string' ? label : (await this.vaultSelect.locator('option').filter({ hasText: label }).first().textContent()) ?? '' });
      } else {
        const value = await options[1].getAttribute('value');
        if (value) await this.vaultSelect.selectOption(value);
      }
    }
  }

  async selectPersonInCharge(searchText: string = 'Admin'): Promise<void> {
    await this.pickFromLookup(this.personInChargeLookup, searchText, /Administrator/i);
  }

  async fillChequeNumber(value: string): Promise<void> {
    await this.chequeNumberInput.fill(value);
  }

  async fillChequePayee(value: string): Promise<void> {
    await this.chequePayeeInput.fill(value);
  }

  async expectBalanceVisible(): Promise<void> {
    await expect(this.balanceField).toBeVisible();
  }

  async expectCurrencyPopulated(): Promise<void> {
    await expect(this.currencyReadonly).toBeVisible();
  }
}
