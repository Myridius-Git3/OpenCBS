import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Between Members', () => {
  test('confirmation NO cancels and preserves form', async ({
    authedPage,
    betweenMembersPage,
  }) => {
    await betweenMembersPage.open();
    await betweenMembersPage.expectLoaded();

    await betweenMembersPage.selectSourceAccount('');
    await betweenMembersPage.selectDestinationAccount('');
    await betweenMembersPage.fillAmount(50);
    await betweenMembersPage.fillDescription('Transfer to be cancelled via NO');

    await betweenMembersPage.clickTransfer();
    await betweenMembersPage.confirmNo();

    await expect(betweenMembersPage.confirmPopup).not.toBeVisible();
    await betweenMembersPage.expectUrl('between-members');
    await betweenMembersPage.expectNoToast();
  });
});
