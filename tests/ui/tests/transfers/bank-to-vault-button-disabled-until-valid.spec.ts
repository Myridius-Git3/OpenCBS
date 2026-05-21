import { test } from '../../fixtures/auth.fixture';

test.describe('Bank to Vault', () => {
  test('Transfer button stays disabled until all required fields filled', async ({
    authedPage,
    bankToVaultPage,
  }) => {
    await bankToVaultPage.open();
    await bankToVaultPage.expectLoaded();
    await bankToVaultPage.expectTransferButtonDisabled();

    await bankToVaultPage.selectVault();
    await bankToVaultPage.expectTransferButtonDisabled();

    await bankToVaultPage.fillAmount('100');
    await bankToVaultPage.expectTransferButtonDisabled();

    await bankToVaultPage.fillChequeNumber('CHQ-001');
    await bankToVaultPage.expectTransferButtonDisabled();

    await bankToVaultPage.fillChequePayee('Test Payee');
    await bankToVaultPage.expectTransferButtonDisabled();

    await bankToVaultPage.selectPersonInCharge('Admin');
    await bankToVaultPage.expectTransferButtonDisabled();

    await bankToVaultPage.fillDescription('E2E test transfer description');
    await bankToVaultPage.expectTransferButtonDisabled();

    await bankToVaultPage.selectBankAccount('');
    await bankToVaultPage.expectTransferButtonEnabled();
  });
});
