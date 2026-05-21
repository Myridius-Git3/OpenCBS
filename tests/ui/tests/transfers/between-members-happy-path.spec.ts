import { test } from '../../fixtures/auth.fixture';
import { ROUTES } from '../../utils/routes';

test.describe('Between Members', () => {
  test('happy path E2E without Auto Print succeeds', async ({
    authedPage,
    betweenMembersPage,
  }) => {
    await betweenMembersPage.open();
    await betweenMembersPage.expectLoaded();

    await betweenMembersPage.selectSourceAccount('');
    await betweenMembersPage.selectDestinationAccount('');
    await betweenMembersPage.fillAmount(10);
    await betweenMembersPage.fillDescription('Happy path E2E between-members transfer');

    await betweenMembersPage.expectAutoPrintUnchecked();
    await betweenMembersPage.expectTransferButtonEnabled();

    await betweenMembersPage.clickTransfer();
    await betweenMembersPage.confirmYes();

    await betweenMembersPage.expectSuccessToast();
    await betweenMembersPage.expectUrl(ROUTES.transfers.hub);
  });
});
