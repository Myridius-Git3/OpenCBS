export const ROUTES = {
  login: '/#/login',
  dashboard: '/#/dashboard',
  transfers: {
    hub: '/#/transfers',
    bankToVault: '/#/transfers/from-bank-to-vault',
    vaultToBank: '/#/transfers/from-vault-to-bank',
    betweenMembers: '/#/transfers/between-members',
  },
} as const;
