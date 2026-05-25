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


// Step: Navigate to the transfers hub page
test('transfers funds successfully from bank to vault - happy path', async ({ authedPage, bankToVaultPage }) => {
  await bankToVaultPage.open();
  await bankToVaultPage.expectLoaded();

  // Step: Select a funded bank account
  await bankToVaultPage.selectBankAccount(TRANSFER_ACCOUNTS.bankAccountSearch);
  await bankToVaultPage.expectBalanceVisible();

  // Step: Select the vault
  await bankToVaultPage.selectVault();
  await bankToVaultPage.expectCurrencyPopulated();

  // Step: Fill in transfer amount
  await bankToVaultPage.fillAmount('100.00');

  // Step: Fill in description
  await bankToVaultPage.fillDescription('E2E test: bank to vault happy path');

  // Step: Fill in cheque details
  await bankToVaultPage.fillChequeNumber('CHQ-12345');
  await bankToVaultPage.fillChequePayee('Test Payee');

  // Step: Select person in charge
  await bankToVaultPage.selectPersonInCharge();

  // Step: Verify TRANSFER button is enabled
  await bankToVaultPage.expectTransferButtonEnabled();

  // Step: Click TRANSFER button
  await bankToVaultPage.clickTransfer();

  // Step: Confirm the transfer in the popup
  await bankToVaultPage.confirmYes();

  // Step: Verify success toast appears
  await bankToVaultPage.expectSuccessToast();

  // Step: Verify navigation back to transfers hub
  await bankToVaultPage.expectUrl(ROUTES.transfers.hub);
});
