/**
 * Search terms used to pick specific, transfer-enabled, funded accounts in the
 * transfer lookups. The default values match the data provisioned by
 * scripts/seed-transfers-data.mjs. Override via env if your environment differs.
 *
 * Picking by search term (instead of the first lookup option) matters because
 * the first option is usually "Loss account", which is unfunded and has
 * transfers disabled.
 */
export const TRANSFER_ACCOUNTS = {
  // Transfer-enabled, funded bank account for bank<->vault transfers.
  bankAccountSearch: process.env.OPENCBS_BANK_ACCOUNT ?? 'Correspondence',
  // Two distinct, funded member current accounts for between-members transfers.
  memberSourceSearch: process.env.OPENCBS_MEMBER_SOURCE ?? 'Alice',
  memberDestSearch: process.env.OPENCBS_MEMBER_DEST ?? 'Bob',
} as const;
