import { test } from '../../fixtures/auth.fixture';
import { ROUTES } from '../../utils/routes';
import { TRANSFER_ACCOUNTS } from '../../utils/transfer-accounts';

test.describe('Bank to Vault', () => {
  test('happy path E2E transfer succeeds', async ({ authedPage, bankToVaultPage }) => {
    await bankToVaultPage.open();
    await bankToVaultPage.expectLoaded();

    await bankToVaultPage.selectBankAccount(TRANSFER_ACCOUNTS.bankAccountSearch);
    await bankToVaultPage.selectVault();
    await bankToVaultPage.fillAmount('10');
    await bankToVaultPage.fillChequeNumber('CHQ-E2E-001');
    await bankToVaultPage.fillChequePayee('E2E Test Payee');
    await bankToVaultPage.selectPersonInCharge('Admin');
    await bankToVaultPage.fillDescription('Happy path E2E transfer');

    await bankToVaultPage.expectTransferButtonEnabled();
    await bankToVaultPage.clickTransfer();
    await bankToVaultPage.confirmYes();

    await bankToVaultPage.expectSuccessToast();
    await bankToVaultPage.expectUrl(ROUTES.transfers.hub);
  });
});
