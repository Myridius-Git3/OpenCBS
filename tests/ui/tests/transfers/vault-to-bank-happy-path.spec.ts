import { test } from '../../fixtures/auth.fixture';
import { ROUTES } from '../../utils/routes';

test.describe('Vault to Bank', () => {
  test('happy path E2E succeeds', async ({ authedPage, vaultToBankPage }) => {
    await vaultToBankPage.open();
    await vaultToBankPage.expectLoaded();

    await vaultToBankPage.selectVault();
    await vaultToBankPage.selectBankAccount('');
    await vaultToBankPage.fillAmount('50');
    await vaultToBankPage.selectCurrency('USD');
    await vaultToBankPage.selectPersonInCharge('Admin');
    await vaultToBankPage.fillDescription('Happy path E2E vault-to-bank transfer');

    await vaultToBankPage.expectTransferButtonEnabled();
    await vaultToBankPage.clickTransfer();
    await vaultToBankPage.confirmYes();

    await vaultToBankPage.expectSuccessToast();
    await vaultToBankPage.expectUrl(ROUTES.transfers.hub);
  });
});
