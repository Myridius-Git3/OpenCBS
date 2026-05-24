import { test, expect } from '../../fixtures/auth.fixture';
import { TRANSFER_ACCOUNTS } from '../../utils/transfer-accounts';

test.describe('Between Members', () => {
  test('confirmation NO cancels and preserves form', async ({
    authedPage,
    betweenMembersPage,
  }) => {
    await betweenMembersPage.open();
    await betweenMembersPage.expectLoaded();

    await betweenMembersPage.selectSourceAccount(TRANSFER_ACCOUNTS.memberSourceSearch);
    await betweenMembersPage.selectDestinationAccount(TRANSFER_ACCOUNTS.memberDestSearch);
    await betweenMembersPage.fillAmount(50);
    await betweenMembersPage.fillDescription('Transfer to be cancelled via NO');

    await betweenMembersPage.clickTransfer();
    await betweenMembersPage.confirmNo();

    await expect(betweenMembersPage.confirmPopup).not.toBeVisible();
    await betweenMembersPage.expectUrl('between-members');
    await betweenMembersPage.expectNoToast();
  });
});
