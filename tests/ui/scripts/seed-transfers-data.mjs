#!/usr/bin/env node
/**
 * Seed script for the transfers UI tests.
 *
 * A fresh OpenCBS database has a vault but no member current accounts and zero
 * balances, so the happy-path transfer tests cannot complete. This script
 * idempotently provisions the minimum data the tests need and discovers all
 * account ids at runtime, so it works against any environment:
 *   - ensures two "people" profiles, each with a USD current account (source + destination)
 *   - funds the accounts the tests transfer FROM via a double-entry capital injection
 *     (debit the asset account, credit an equity account)
 *
 * Usage:  OPENCBS_BASE_URL=http://localhost node scripts/seed-transfers-data.mjs
 * Env:    OPENCBS_BASE_URL (default http://localhost), OPENCBS_ADMIN_USER, OPENCBS_ADMIN_PASS
 */

const BASE_URL = (process.env.OPENCBS_BASE_URL ?? 'http://localhost').replace(/\/$/, '');
const USER = process.env.OPENCBS_ADMIN_USER ?? 'Administrator';
const PASS = process.env.OPENCBS_ADMIN_PASS ?? 'admin';

const CURRENCY_ID = 1; // USD
const FUND_AMOUNT = 1_000_000;
const FUND_MIN = 1_000; // only top up when balance is below this

let token = '';

async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}/api/${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let parsed = text;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {}
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status}: ${typeof parsed === 'string' ? parsed : JSON.stringify(parsed)}`);
  }
  return parsed;
}

const content = (res) => (res && res.content ? res.content : Array.isArray(res) ? res : []);

async function login() {
  const res = await api('login', { method: 'POST', body: { username: USER, password: PASS } });
  token = res && res.data ? res.data : res;
  if (!token || typeof token !== 'string') throw new Error('Login did not return a token');
  console.log('✓ logged in');
}

async function listMemberAccounts() {
  return content(await api('accounting/lookup/current-accounts')).map((a) => ({
    id: a.id,
    number: a.number,
    name: a.name,
  }));
}

async function createPerson(first, last) {
  const body = {
    fieldValues: [
      { fieldId: 1, value: first },
      { fieldId: 2, value: last },
      { fieldId: 3, value: '1990-01-01' },
    ],
  };
  const res = await api('profiles/people', { method: 'POST', body });
  console.log(`✓ created person ${first} ${last} (id ${res.id})`);
  return res.id;
}

async function ensureMembers() {
  let members = await listMemberAccounts();
  const wanted = [
    ['Alice', 'TransferSource'],
    ['Bob', 'TransferDest'],
  ];
  // Creating a person auto-provisions a USD current account, so we only need to
  // create the profile itself.
  for (let i = members.length; i < 2; i++) {
    const [f, l] = wanted[i] ?? [`Test${i}`, `Member${i}`];
    await createPerson(f, l);
  }
  members = await listMemberAccounts();
  return members;
}

async function balance(accountId) {
  const res = await api(`accounting/get-account-balance/${accountId}`);
  return typeof res === 'number' ? res : Number(res) || 0;
}

/**
 * Fund an account to a positive natural balance via a double-entry capital
 * injection against `counterId`.
 *   - asset accounts (isDebit=true: bank/vault) increase when DEBITED
 *   - deposit/liability accounts (isDebit=false: member current accounts)
 *     increase when CREDITED
 */
async function ensureFunds(accountId, label, counterId, isDebit) {
  const bal = await balance(accountId);
  if (Math.abs(bal) >= FUND_MIN) {
    console.log(`  • ${label} (id ${accountId}) already funded: ${bal}`);
    return;
  }
  const createdAt = new Date().toISOString().slice(0, 10) + 'T12:00:00';
  const entry = isDebit
    ? { debitAccountId: accountId, creditAccountId: counterId }
    : { debitAccountId: counterId, creditAccountId: accountId };
  await api('accounting/entry', {
    method: 'POST',
    body: { ...entry, amount: FUND_AMOUNT, description: 'E2E test seed: capital injection', createdAt, autoPrint: '' },
  });
  console.log(`  • funded ${label} (id ${accountId}) with ${FUND_AMOUNT} (was ${bal})`);
}

async function main() {
  console.log(`Seeding ${BASE_URL} ...`);
  await login();

  // Discover accounts.
  const vaults = content(await api('vaults'));
  const vaultAccountIds = vaults.flatMap((v) => (v.accounts || []).map((a) => a.id));

  const debitBalance = content(await api(`accounting/lookup?accountTypes=${['BALANCE']}&typeOfAccount=DEBIT`));
  const allBalance = content(await api(`accounting/lookup?accountTypes=${['BALANCE']}`));

  // Bank source account the bank<->vault tests transfer from/to: prefer
  // "Correspondence", else any transfer-enabled, manual-tx debit account that
  // is not a vault account.
  const bankSource =
    debitBalance.find((a) => /correspondence/i.test(a.name) && a.allowedTransferFrom && a.allowedManualTransaction) ||
    debitBalance.find(
      (a) => a.allowedTransferFrom && a.allowedTransferTo && a.allowedManualTransaction && !vaultAccountIds.includes(a.id),
    );
  if (!bankSource) throw new Error('No suitable bank source account found');

  // Counter (credit) account for the capital injection: a credit-nature,
  // manual-tx account that is not a member current account.
  const members = await ensureMembers();
  const memberIds = new Set(members.map((m) => m.id));
  const counter =
    allBalance.find((a) => /undivided net surplus/i.test(a.name) && a.allowedManualTransaction) ||
    allBalance.find(
      (a) => !a.isDebit && a.allowedManualTransaction && !memberIds.has(a.id) && !/current account for client/i.test(a.name),
    );
  if (!counter) throw new Error('No suitable counter (credit) account found');

  console.log(`\nUsing counter account: id ${counter.id} | ${counter.number} | ${counter.name}`);
  console.log('Member current accounts:');
  for (const m of members) console.log(`  - id ${m.id} | ${m.number} | ${m.name}`);

  console.log(`\nFunding against counter account ${counter.number}:`);
  await ensureFunds(bankSource.id, `bank source "${bankSource.name}"`, counter.id, true);
  for (const vid of vaultAccountIds) await ensureFunds(vid, `vault account`, counter.id, true);
  // Member current accounts are deposit/liability accounts -> credit to fund.
  for (const m of members) await ensureFunds(m.id, `member "${m.name}"`, counter.id, false);

  console.log('\nFinal balances:');
  console.log(`  - bank source "${bankSource.name}" (id ${bankSource.id}): ${await balance(bankSource.id)}`);
  for (const vid of vaultAccountIds) console.log(`  - vault account (id ${vid}): ${await balance(vid)}`);
  for (const m of members) console.log(`  - member "${m.name}" (id ${m.id}): ${await balance(m.id)}`);

  console.log('\nFor the tests — bank source account name to search: "' + bankSource.name + '"');
  console.log('Member accounts (source/destination):');
  members.forEach((m, i) => console.log(`  ${i === 0 ? 'SOURCE' : 'DEST  '}: "${m.name}"  (number ${m.number})`));
  console.log('\n✓ seed complete');
}

main().catch((e) => {
  console.error('SEED FAILED:', e.message);
  process.exit(1);
});
