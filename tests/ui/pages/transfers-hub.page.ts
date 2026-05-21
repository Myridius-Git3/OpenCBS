import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { ROUTES } from '../utils/routes';

export class TransfersHubPage extends BasePage {
  readonly bankToVaultCard: Locator;
  readonly vaultToBankCard: Locator;
  readonly betweenMembersCard: Locator;
  readonly allCards: Locator;
  readonly bankToVaultDesc: Locator;
  readonly vaultToBankDesc: Locator;
  readonly betweenMembersDesc: Locator;

  constructor(page: Page) {
    super(page);
    this.allCards = page.locator('a.cbs-icon-card');
    this.bankToVaultCard = this.cardByTitle(/bank to vault/i);
    this.vaultToBankCard = this.cardByTitle(/vault to bank/i);
    this.betweenMembersCard = this.cardByTitle(/between members/i);
    this.bankToVaultDesc = this.bankToVaultCard.locator('.cbs-icon-card__desc');
    this.vaultToBankDesc = this.vaultToBankCard.locator('.cbs-icon-card__desc');
    this.betweenMembersDesc = this.betweenMembersCard.locator('.cbs-icon-card__desc');
  }

  private cardByTitle(pattern: RegExp): Locator {
    return this.page
      .locator('a.cbs-icon-card')
      .filter({ has: this.page.locator('.cbs-icon-card__title', { hasText: pattern }) });
  }

  async open(): Promise<void> {
    await this.goto(ROUTES.transfers.hub);
  }

  async clickBankToVault(): Promise<void> {
    await this.bankToVaultCard.click();
  }

  async clickVaultToBank(): Promise<void> {
    await this.vaultToBankCard.click();
  }

  async clickBetweenMembers(): Promise<void> {
    await this.betweenMembersCard.click();
  }

  async expectHubLoaded(): Promise<void> {
    await expect(this.bankToVaultCard).toBeVisible();
    await expect(this.vaultToBankCard).toBeVisible();
    await expect(this.betweenMembersCard).toBeVisible();
  }

  async expectCardDescriptions(): Promise<void> {
    await expect(this.bankToVaultDesc).toHaveText('Transfer from bank to vault');
    await expect(this.vaultToBankDesc).toHaveText('Transfer from vault to bank');
    await expect(this.betweenMembersDesc).toHaveText('Transfer between members');
  }
}
