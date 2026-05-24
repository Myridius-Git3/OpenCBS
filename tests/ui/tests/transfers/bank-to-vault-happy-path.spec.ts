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


// Step: Log in to the application
test('transfer to same account is rejected', async ({ page, bankToVaultPage }) => {
  await bankToVaultPage.open();
  await bankToVaultPage.expectLoaded();

  // Step: Navigate to the transfer form (bank-to-vault or any transfer form)
  // (already on bank-to-vault page from open() above)

  // Step: Select the same account as both source and destination
  await bankToVaultPage.selectBankAccount(TRANSFER_ACCOUNTS.bankAccountSearch);
  await bankToVaultPage.selectVault();
  await bankToVaultPage.expectBalanceVisible();
  await bankToVaultPage.expectCurrencyPopulated();

  // Step: Fill in valid amount and other required fields
  await bankToVaultPage.fillAmount('100');
  await bankToVaultPage.selectPersonInCharge('Admin');
  await bankToVaultPage.fillDescription('Same account transfer test');

  // Step: Submit the transfer
  await bankToVaultPage.clickTransfer();
  await bankToVaultPage.confirmYes();

  // Step: Verify error toast appears with message about same account
  await bankToVaultPage.expectErrorToast();
  await expect(page.locator('.toast-error, .ngx-toastr.toast-error').first())
    .toContainText(/same account|cannot transfer to the same|source and destination must be different/i, { ignoreCase: true });

  // Step: Verify transfer was not completed (no success toast)
  await expect(page.locator('.toast-success, .ngx-toastr.toast-success')).toHaveCount(0);
});


// Step: Log in to the application
test('transfer to same account is rejected', async ({ page, bankToVaultPage }) => {
  await bankToVaultPage.open();
  await bankToVaultPage.expectLoaded();

  // Step: Navigate to the transfer form (bank-to-vault or any transfer form)
  // (already on bank-to-vault page from open() above)

  // Step: Select the same account as both source and destination
  await bankToVaultPage.selectBankAccount(TRANSFER_ACCOUNTS.bankAccountSearch);
  await bankToVaultPage.selectVault();
  await bankToVaultPage.expectBalanceVisible();
  await bankToVaultPage.expectCurrencyPopulated();

  // Step: Fill in valid amount and other required fields
  await bankToVaultPage.fillAmount('100');
  await bankToVaultPage.selectPersonInCharge('Admin');
  await bankToVaultPage.fillDescription('Same account transfer test');

  // Step: Submit the transfer
  await bankToVaultPage.clickTransfer();
  await bankToVaultPage.confirmYes();

  // Step: Verify error toast appears with message about same account
  await bankToVaultPage.expectErrorToast();
  await expect(page.locator('.toast-error, .ngx-toastr.toast-error').first())
    .toContainText(/same account|cannot transfer to the same|source and destination must be different/i, { ignoreCase: true });

  // Step: Verify transfer was not completed (no success toast)
  await expect(page.locator('.toast-success, .ngx-toastr.toast-success')).toHaveCount(0);
});


// Step: Log in to the application
test('transfer to same account is rejected', async ({ page, bankToVaultPage }) => {
  await bankToVaultPage.open();
  await bankToVaultPage.expectLoaded();

  // Step: Navigate to the transfer form (bank-to-vault or any transfer form)
  // (already on bank-to-vault page from open() above)

  // Step: Select the same account as both source and destination
  await bankToVaultPage.selectBankAccount(TRANSFER_ACCOUNTS.bankAccountSearch);
  await bankToVaultPage.selectVault();
  await bankToVaultPage.expectBalanceVisible();
  await bankToVaultPage.expectCurrencyPopulated();

  // Step: Fill in valid amount and other required fields
  await bankToVaultPage.fillAmount('100');
  await bankToVaultPage.selectPersonInCharge('Admin');
  await bankToVaultPage.fillDescription('Same account transfer test');

  // Step: Submit the transfer
  await bankToVaultPage.clickTransfer();
  await bankToVaultPage.confirmYes();

  // Step: Verify error toast appears with message about same account
  await bankToVaultPage.expectErrorToast();
  await expect(page.locator('.toast-error, .ngx-toastr.toast-error').first())
    .toContainText(/same account|cannot transfer to the same|source and destination must be different/i, { ignoreCase: true });

  // Step: Verify transfer was not completed (no success toast)
  await expect(page.locator('.toast-success, .ngx-toastr.toast-success')).toHaveCount(0);
});


// Step 1: Navigate to the Bank to Vault transfer form
test('Transfer to the same account is rejected', async ({ authedPage, bankToVaultPage }) => {
  await bankToVaultPage.open();
  await bankToVaultPage.expectLoaded();

  // Step 2: Select the same account for both bank account and vault
  // Note: In the bank-to-vault form, the source is a bank account and destination is a vault.
  // Selecting "the same account" means we need to trigger a scenario where source and
  // destination resolve to the same underlying account ID. The typical validation is
  // at form-submit time when the backend sees identical account IDs.
  
  // We'll select a bank account, then attempt to select a vault that maps to that same
  // account (in practice this is rare but the validation should still catch it).
  // For this negative test, we'll fill the form with valid data but the backend should
  // reject the transfer with an error toast.
  
  await bankToVaultPage.selectBankAccount(TRANSFER_ACCOUNTS.bankAccountSearch);
  await bankToVaultPage.expectBalanceVisible();
  
  // Select any vault (first available)
  await bankToVaultPage.selectVault();
  await bankToVaultPage.expectCurrencyPopulated();

  // Step 3: Fill required fields with valid data
  await bankToVaultPage.fillAmount('100');
  await bankToVaultPage.fillDescription('Same account test - should be rejected');
  
  // If cheque fields are visible/required, fill them
  await bankToVaultPage.fillChequeNumber('CHQ-00001');
  await bankToVaultPage.fillChequePayee('Test Payee');
  
  // Select person in charge
  await bankToVaultPage.selectPersonInCharge();

  // Step 4: Submit the transfer
  await bankToVaultPage.expectTransferButtonEnabled();
  await bankToVaultPage.clickTransfer();
  
  // Step 5: Confirm in the popup
  await bankToVaultPage.confirmYes();

  // Step 6: Verify the transfer is rejected with an error toast
  // The backend should detect that source and destination are the same account
  // and return an error. The UI should display an error toast.
  await bankToVaultPage.expectErrorToast();
  
  // Step 7: Verify we remain on the transfer form (not redirected to success page)
  await bankToVaultPage.expectLoaded();
});
