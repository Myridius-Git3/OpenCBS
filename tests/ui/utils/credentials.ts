export const ADMIN_CREDENTIALS = {
  username: process.env.OPENCBS_ADMIN_USER ?? 'Administrator',
  password: process.env.OPENCBS_ADMIN_PASS ?? 'admin',
} as const;
