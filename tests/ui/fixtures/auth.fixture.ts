import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { TransfersHubPage } from '../pages/transfers-hub.page';
import { BankToVaultPage } from '../pages/transfers/bank-to-vault.page';
import { VaultToBankPage } from '../pages/transfers/vault-to-bank.page';
import { BetweenMembersPage } from '../pages/transfers/between-members.page';

type Pages = {
  loginPage: LoginPage;
  hubPage: TransfersHubPage;
  bankToVaultPage: BankToVaultPage;
  vaultToBankPage: VaultToBankPage;
  betweenMembersPage: BetweenMembersPage;
};

type AuthFixtures = Pages & {
  authedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  hubPage: async ({ page }, use) => {
    await use(new TransfersHubPage(page));
  },
  bankToVaultPage: async ({ page }, use) => {
    await use(new BankToVaultPage(page));
  },
  vaultToBankPage: async ({ page }, use) => {
    await use(new VaultToBankPage(page));
  },
  betweenMembersPage: async ({ page }, use) => {
    await use(new BetweenMembersPage(page));
  },
  authedPage: async ({ page }, use) => {
    const login = new LoginPage(page);
    await login.open();
    await login.login();
    await use(page);
  },
});

export { expect };
