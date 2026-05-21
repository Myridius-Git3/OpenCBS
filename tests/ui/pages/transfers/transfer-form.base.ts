import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export abstract class TransferFormBasePage extends BasePage {
  readonly transferButton: Locator;
  readonly cancelButton: Locator;
  readonly confirmPopup: Locator;
  readonly confirmYesButton: Locator;
  readonly confirmNoButton: Locator;
  readonly amountInput: Locator;
  readonly dateInput: Locator;
  readonly descriptionTextarea: Locator;
  readonly balanceField: Locator;

  constructor(page: Page) {
    super(page);
    this.transferButton = page.locator('button.slds-button--success, button:has-text("TRANSFER")').last();
    this.cancelButton = page.locator('a.slds-button--neutral, a:has-text("CANCEL"), button:has-text("CANCEL")').first();
    this.confirmPopup = page.locator('cbs-confirm-popup, [role="dialog"]');
    this.confirmYesButton = this.confirmPopup.locator('button:has-text("YES"), button.slds-button--brand').first();
    this.confirmNoButton = this.confirmPopup.locator('button:has-text("NO"), button.slds-button--neutral').first();
    this.amountInput = page.locator('cbs-form-input-control input[type="number"], input[formcontrolname="amount"]');
    this.dateInput = page.locator('cbs-form-date-control input, input[formcontrolname="date"]').first();
    this.descriptionTextarea = page.locator('cbs-form-textarea-control textarea, textarea[formcontrolname="description"]');
    this.balanceField = page.locator('cbs-form-readonly-control').filter({ hasText: /balance/i });
  }

  async clickTransfer(): Promise<void> {
    await this.transferButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async confirmYes(): Promise<void> {
    await expect(this.confirmPopup).toBeVisible();
    await this.confirmYesButton.click();
  }

  async confirmNo(): Promise<void> {
    await expect(this.confirmPopup).toBeVisible();
    await this.confirmNoButton.click();
  }

  async fillAmount(value: string | number): Promise<void> {
    await this.amountInput.fill(String(value));
  }

  async fillDescription(text: string): Promise<void> {
    await this.descriptionTextarea.fill(text);
  }

  async expectTransferButtonDisabled(): Promise<void> {
    await expect(this.transferButton).toBeDisabled();
  }

  async expectTransferButtonEnabled(): Promise<void> {
    await expect(this.transferButton).toBeEnabled();
  }

  protected lookupSearchInput(): Locator {
    // The cbs-picklist dropdown is rendered in a CDK overlay portal outside the
    // cbs-form-lookup-control DOM subtree.  The search input lives inside
    // .cbs-picklist__dropdown which is appended to cdk-overlay-container at body level.
    // The placeholder value is "Search" (mixed-case), not "SEARCH".
    return this.page.locator('.cbs-picklist__dropdown input.slds-input');
  }

  protected async pickFromLookup(triggerLocator: Locator, searchText: string, optionMatcher?: RegExp | string): Promise<void> {
    // Click the picklist trigger button to open the CDK overlay dropdown.
    await triggerLocator.locator('button').first().click();
    const search = this.lookupSearchInput().last();
    await search.waitFor({ state: 'visible' });
    if (searchText) {
      await search.fill(searchText);
    }
    // Options are rendered as <li> inside .slds-listbox inside the overlay.
    const optionList = this.page.locator('.cbs-picklist__dropdown .slds-listbox li.slds-listbox__item');
    const option = optionMatcher
      ? optionList.filter({ hasText: optionMatcher }).first()
      : optionList.first();
    await option.waitFor({ state: 'visible' });
    await option.click();
  }
}
