# OpenCBS Transfer Module — Playwright Test Plan

**Module:** Transfers
**Application URL:** `http://localhost`
**Login:** `Administrator` / `admin`
**Plan Date:** 2026-05-19
**Source Reference:** `client/src/app/containers/transfers/`

---

## Overview

The Transfer module exposes four routes:

| Route | Component | Purpose |
|---|---|---|
| `/transfers` | `TransfersComponent` | Hub page — three tile cards linking to sub-routes |
| `/transfers/from-bank-to-vault` | `TransferFromBankToVaultComponent` | Move funds from a bank (GL DEBIT/BALANCE account) to a vault |
| `/transfers/from-vault-to-bank` | `TransferFromVaultToBankComponent` | Move funds from a vault to a bank account |
| `/transfers/between-members` | `TransferBetweenMembersComponent` | Move funds between two member current accounts |

All three transfer forms share a common UX pattern:
- Required-field validation enforced by Angular Reactive Forms (`Validators.required`)
- A "Transfer" button that is **disabled** while the form is invalid
- A `cbs-confirm-popup` modal (Yes / No) that must be confirmed before the API call is made
- On success: success toast + redirect to `/transfers`
- On API error: error toast; user remains on form

---

## Assumptions / Prerequisites

1. A fresh browser context (no prior session cookies) is used for each test suite unless stated otherwise.
2. At least one **Vault** exists in the system (required for Bank-to-Vault and Vault-to-Bank forms; the Vault dropdown is populated at page load).
3. At least one **GL DEBIT/BALANCE account** exists so the Bank Account lookup can return results.
4. At least one **Current Account** (member account) exists for the Between-Members form lookups.
5. At least one **User** (e.g., `Administrator`) is available in the Person-in-Charge lookup.
6. At least one **Currency** entry exists in the currency lookup.
7. The `Administrator` account has the `TRANSFERS` permission group, as enforced by `RouteGuard`.
8. Today's date is pre-populated in the Date field when any transfer form is opened.
9. The `Auto Print` feature on the Between-Members form requires a `TRANSFER_MEMBERS` print template to be configured; if none is configured, the checkbox may error silently after submission.

---

## Test Suites

---

### Suite T-01: Transfers Hub Page

**Route:** `/transfers`

---

#### TC-T-01-001: Hub page loads with three transfer tiles

**Type:** Happy path

**Preconditions:** User is not yet logged in.

**Steps:**
1. Navigate to `http://localhost`.
2. On the login page, enter username `Administrator` and password `admin`.
3. Click the **Login** button.
4. In the top navigation bar, locate and click the **Transfers** link.
5. Confirm the URL changes to `http://localhost/#/transfers` (or `http://localhost/transfers`).

**Expected Results:**
- The page header displays the title "TRANSFERS" (or its translated equivalent).
- Three tile cards are visible on the page:
  - Card 1 title: "BANK TO VAULT" (or translated text), description "Transfer from bank to vault".
  - Card 2 title: "VAULT TO BANK" (or translated text), description "Transfer from vault to bank".
  - Card 3 title: "BETWEEN MEMBERS" (or translated text), description "Transfer between members".
- Each card is rendered as a clickable/linked element.

**Success Criteria:** All three cards are present and visible without any console errors.

---

#### TC-T-01-002: "Bank to Vault" tile navigates to correct route

**Type:** Navigation

**Preconditions:** User is logged in. Current page is `/transfers`.

**Steps:**
1. Navigate to `http://localhost/#/transfers`.
2. Click the **BANK TO VAULT** tile card.

**Expected Results:**
- URL changes to `http://localhost/#/transfers/from-bank-to-vault`.
- The page header reads "TRANSFER FROM BANK TO VAULT" (or its translated equivalent).
- The transfer form is displayed.

**Success Criteria:** Correct route and page heading are displayed.

---

#### TC-T-01-003: "Vault to Bank" tile navigates to correct route

**Type:** Navigation

**Preconditions:** User is logged in. Current page is `/transfers`.

**Steps:**
1. Navigate to `http://localhost/#/transfers`.
2. Click the **VAULT TO BANK** tile card.

**Expected Results:**
- URL changes to `http://localhost/#/transfers/from-vault-to-bank`.
- The page header reads "TRANSFER FROM VAULT TO BANK" (or its translated equivalent).
- The transfer form is displayed.

**Success Criteria:** Correct route and page heading are displayed.

---

#### TC-T-01-004: "Between Members" tile navigates to correct route

**Type:** Navigation

**Preconditions:** User is logged in. Current page is `/transfers`.

**Steps:**
1. Navigate to `http://localhost/#/transfers`.
2. Click the **BETWEEN MEMBERS** tile card.

**Expected Results:**
- URL changes to `http://localhost/#/transfers/between-members`.
- The page header reads "TRANSFER BETWEEN MEMBERS" (or its translated equivalent).
- The transfer form is displayed.

**Success Criteria:** Correct route and page heading are displayed.

---

#### TC-T-01-005: Unauthenticated access to hub is redirected to login

**Type:** Security / Guard

**Preconditions:** No active session (clear cookies/localStorage before running).

**Steps:**
1. Open the browser with a clean session.
2. Navigate directly to `http://localhost/#/transfers`.

**Expected Results:**
- The application does not display the Transfers hub.
- The user is redirected to the login page (`http://localhost/#/login` or equivalent).

**Success Criteria:** Route guard prevents unauthenticated access.

---

### Suite T-02: Transfer from Bank to Vault

**Route:** `/transfers/from-bank-to-vault`

**Form Fields (all required):**
- Bank Account (lookup — DEBIT/BALANCE GL accounts)
- Balance (read-only, shown after bank account selection)
- Vault (select dropdown)
- Amount (number input)
- Date (date picker, pre-filled with today)
- Currency (read-only, shown after bank account selection)
- Cheque Number (text input)
- Cheque Payee (text input)
- Person in Charge (lookup — users)
- Description (textarea)

---

#### TC-T-02-001: Page loads with form in correct initial state

**Type:** Happy path / Page load

**Preconditions:** User is logged in.

**Steps:**
1. Navigate to `http://localhost/#/transfers/from-bank-to-vault`.
2. Observe the initial state of the form.

**Expected Results:**
- Page header reads "TRANSFER FROM BANK TO VAULT".
- A **CANCEL** button is visible (top-right, neutral style).
- A **TRANSFER** button is visible (top-right, success/green style) and is **disabled**.
- The form contains the following labeled fields: Bank Account, Vault, Amount, Date, Cheque Number, Cheque Payee, Person in Charge, Description.
- The Date field is pre-populated with today's date (2026-05-19).
- Balance and Currency read-only fields are **not visible** (they appear only after bank account selection).
- No validation error styling is present on any field.

**Success Criteria:** Form renders correctly, Transfer button is disabled, Date is pre-filled.

---

#### TC-T-02-002: Transfer button remains disabled until all required fields are filled

**Type:** Validation

**Preconditions:** User is logged in and on `/transfers/from-bank-to-vault`.

**Steps:**
1. Observe the **TRANSFER** button — confirm it is disabled.
2. Fill in the **Amount** field with `1000`.
3. Observe the **TRANSFER** button.
4. Fill in the **Cheque Number** field with `CHQ-001`.
5. Observe the **TRANSFER** button.
6. Fill in the **Cheque Payee** field with `Test Payee`.
7. Observe the **TRANSFER** button.
8. Fill in the **Description** field with `Test description`.
9. Observe the **TRANSFER** button.

**Expected Results:**
- After each individual field fill, the **TRANSFER** button remains disabled as long as any required field is still empty.
- Only once **all** required fields (Bank Account, Vault, Amount, Date, Cheque Number, Cheque Payee, Person in Charge, Description) have valid values does the button become enabled.

**Success Criteria:** `form.invalid` correctly maps to button `[disabled]` state throughout partial fills.

---

#### TC-T-02-003: Bank account lookup — search and selection shows balance and currency

**Type:** Happy path / Field interaction

**Preconditions:** User is logged in and on `/transfers/from-bank-to-vault`. At least one DEBIT/BALANCE GL account exists.

**Steps:**
1. Click the **Bank Account** lookup field (search input or SELECT placeholder).
2. Type a partial account name or number into the search box.
3. Wait for the lookup results list to appear.
4. Click on one of the returned accounts in the dropdown list.

**Expected Results:**
- The Bank Account field is populated with the selected account's number and name (format: `{number} | {name}`).
- A **Balance** read-only field appears below Bank Account showing the account's current balance (formatted as a number; if balance is negative, it is shown as 0).
- A **Currency** read-only field appears showing the currency name associated with the selected account.
- The selected bank account is stored in the form as `bankAccountId`.

**Success Criteria:** Balance and currency appear after selection; form field is populated correctly.

---

#### TC-T-02-004: Bank account lookup — empty search returns results list

**Type:** Happy path

**Preconditions:** User is logged in and on `/transfers/from-bank-to-vault`.

**Steps:**
1. Click the **Bank Account** lookup field.
2. Leave the search input blank and wait (or press Enter/trigger search with empty query).

**Expected Results:**
- A list of available DEBIT/BALANCE accounts is displayed.
- The list is scrollable if there are multiple accounts.

**Success Criteria:** Lookup returns results without requiring a search term.

---

#### TC-T-02-005: Vault dropdown — selection populates vault field

**Type:** Happy path

**Preconditions:** User is logged in and on `/transfers/from-bank-to-vault`. At least one vault exists.

**Steps:**
1. Click the **Vault** dropdown/select control.
2. Observe the options available in the dropdown list.
3. Select the first available vault from the list.

**Expected Results:**
- The Vault field is populated with the selected vault's name.
- The form's `vaultId` control is set to the selected vault's ID.

**Success Criteria:** Vault dropdown is populated from the API and selection registers correctly.

---

#### TC-T-02-006: Amount field rejects non-numeric input

**Type:** Validation / Edge case

**Preconditions:** User is logged in and on `/transfers/from-bank-to-vault`.

**Steps:**
1. Click the **Amount** field.
2. Attempt to type the value `abc`.
3. Observe the field value.
4. Attempt to type the value `-100`.
5. Observe the field value.

**Expected Results:**
- The Amount field (type=`number`) does not accept alphabetic characters; the field value remains empty or unchanged.
- A negative number such as `-100` is technically accepted by the HTML number input but should be noted as a potential edge case for API-level validation.

**Success Criteria:** The input type=`number` prevents non-numeric characters from being entered.

---

#### TC-T-02-007: Amount field accepts zero

**Type:** Edge case

**Preconditions:** User is logged in and on `/transfers/from-bank-to-vault`.

**Steps:**
1. Fill all required fields with valid test data:
   - Bank Account: select any valid account
   - Vault: select any valid vault
   - Amount: `0`
   - Date: leave as today
   - Cheque Number: `CHQ-ZERO`
   - Cheque Payee: `Zero Payee`
   - Person in Charge: select any valid user
   - Description: `Zero amount transfer test`
2. Observe whether the **TRANSFER** button becomes enabled.
3. Click **TRANSFER** if enabled.
4. Observe the confirmation popup content.

**Expected Results:**
- The `Validators.required` validator passes for `0` (it is not empty), so the form may become valid.
- The confirmation popup shows Amount as `0`.
- Note: Whether the backend accepts a 0-amount transfer is an API-level concern; document the API response.

**Success Criteria:** The UI does not prevent 0-amount transfers at the client validation layer; behavior is documented.

---

#### TC-T-02-008: Date field is pre-filled and editable

**Type:** Happy path

**Preconditions:** User is logged in and on `/transfers/from-bank-to-vault`.

**Steps:**
1. Observe the **Date** field on page load — confirm it shows today's date.
2. Clear the Date field.
3. Observe whether the **TRANSFER** button becomes disabled.
4. Enter a valid date (e.g., `2026-05-01`) into the Date field.
5. Observe the **TRANSFER** button state after re-entering the date.

**Expected Results:**
- Date field is pre-filled with today's date on load.
- Clearing the Date field invalidates the form (TRANSFER button becomes disabled).
- Re-entering a valid date re-validates the form.

**Success Criteria:** Date field behaves as required, pre-fill works, and clearing triggers invalid state.

---

#### TC-T-02-009: Person in Charge lookup — search and selection

**Type:** Happy path

**Preconditions:** User is logged in and on `/transfers/from-bank-to-vault`. At least one user exists.

**Steps:**
1. Click the **Person in Charge** lookup field.
2. Type `Admin` into the search input.
3. Wait for results to appear.
4. Click **Administrator** in the results list.

**Expected Results:**
- The Person in Charge field is populated with `Administrator` (or the user's name).
- The `personInCharge` form control is set to the user's ID.

**Success Criteria:** Lookup returns user records and selection registers the user's name.

---

#### TC-T-02-010: Happy path — successful Bank-to-Vault transfer

**Type:** Happy path / End-to-end

**Preconditions:** User is logged in. A vault and a bank account with sufficient balance exist.

**Steps:**
1. Navigate to `http://localhost/#/transfers/from-bank-to-vault`.
2. In the **Bank Account** lookup, search for and select a valid GL account.
3. Verify the **Balance** field appears showing the account balance.
4. In the **Vault** dropdown, select an available vault.
5. In the **Amount** field, enter `500`.
6. Confirm the **Date** field shows today's date (leave as-is).
7. In the **Cheque Number** field, enter `CHQ-2026-001`.
8. In the **Cheque Payee** field, enter `Test Payee Name`.
9. In the **Person in Charge** lookup, search for and select `Administrator`.
10. In the **Description** textarea, enter `Bank to vault transfer test`.
11. Confirm the **TRANSFER** button is now enabled (green, not disabled).
12. Click the **TRANSFER** button.
13. The confirmation popup appears — verify its content.
14. Click **YES** in the confirmation popup.
15. Observe the result.

**Expected Results:**
- Step 11: TRANSFER button is enabled.
- Step 13: Confirmation popup title shows "CONFIRMATION". Popup body reads: "Please, review and confirm bank to vault transfer details:" followed by a review block displaying:
  - Bank Account: `{number} | {name}` of the selected account
  - Vault: name of selected vault
  - Amount: `500`
  - Cheque Number: `CHQ-2026-001`
  - Cheque Payee: `Test Payee Name`
  - Person in Charge: `Administrator`
  - Description: `Bank to vault transfer test`
  - Buttons: **NO** (left) and **YES** (right)
- Step 15: Popup closes, a loading indicator may briefly appear, a success toast notification is shown, and the application navigates to `http://localhost/#/transfers`.

**Success Criteria:** Transfer completes successfully; success toast appears; redirect to hub occurs.

---

#### TC-T-02-011: Confirmation popup — clicking NO cancels submission

**Type:** Cancel / Negative path

**Preconditions:** User is logged in and all required fields on `/transfers/from-bank-to-vault` are filled with valid data.

**Steps:**
1. Fill all required fields with valid test data (as per TC-T-02-010).
2. Click the **TRANSFER** button.
3. The confirmation popup appears.
4. Click **NO** in the confirmation popup.

**Expected Results:**
- The popup closes without making an API call.
- The user remains on the `/transfers/from-bank-to-vault` page.
- All form field values are preserved as entered.
- No toast notification appears.
- The URL does not change.

**Success Criteria:** Clicking NO aborts submission; form state is preserved.

---

#### TC-T-02-012: CANCEL button navigates back to transfers hub

**Type:** Navigation / Cancel

**Preconditions:** User is logged in and on `/transfers/from-bank-to-vault`.

**Steps:**
1. Navigate to `http://localhost/#/transfers/from-bank-to-vault`.
2. Optionally fill in some form fields (e.g., enter a value in Amount).
3. Click the **CANCEL** button (top-right, neutral/grey style).

**Expected Results:**
- The application navigates to `http://localhost/#/transfers`.
- The Transfers hub page is displayed with three tiles.
- No confirmation dialog is shown before navigation.
- No data is saved.

**Success Criteria:** CANCEL is a direct navigation link to `/transfers` with no intermediary step.

---

#### TC-T-02-013: Field-level validation error styling on blur

**Type:** Validation / UX

**Preconditions:** User is logged in and on `/transfers/from-bank-to-vault`.

**Steps:**
1. Click into the **Cheque Number** field.
2. Do not enter any text.
3. Click away (click on another field or the page body) to trigger the blur event.
4. Observe the **Cheque Number** field styling.
5. Repeat for **Cheque Payee**, **Description**, and **Amount** fields.

**Expected Results:**
- After blur without input, each required field shows an error styling (red border or error class applied via `[hasError]="form.get('fieldName').errors && form.get('fieldName').touched"`).
- The error indication is visible to the user.

**Success Criteria:** Touched + invalid fields display error styling; untouched fields do not.

---

#### TC-T-02-014: API error response — error toast is displayed

**Type:** Error handling

**Preconditions:** User is logged in. The backend is configured (or the network is simulated) to return an error for the transfer API endpoint. Alternatively, trigger an error by submitting a transfer amount exceeding the bank account balance if the API enforces that rule.

**Steps:**
1. Navigate to `http://localhost/#/transfers/from-bank-to-vault`.
2. Fill all required fields with data that is expected to cause an API-level error (e.g., amount greater than available balance, if enforced by the backend).
3. Click **TRANSFER**.
4. Click **YES** in the confirmation popup.
5. Observe the response.

**Expected Results:**
- The loading indicator appears briefly.
- An error toast notification is displayed with the API's error message (or generic "ERROR" if no message is provided).
- The application does **not** navigate away from the form.
- The user can correct the values and try again.

**Success Criteria:** Error toast appears; user stays on the form; no redirect occurs on error.

---

#### TC-T-02-015: Unauthenticated direct access is redirected

**Type:** Security

**Preconditions:** No active session.

**Steps:**
1. Open a fresh browser session (no cookies).
2. Navigate directly to `http://localhost/#/transfers/from-bank-to-vault`.

**Expected Results:**
- The user is redirected to the login page.
- The form is not accessible without authentication.

**Success Criteria:** `RouteGuard` blocks the route for unauthenticated users.

---

### Suite T-03: Transfer from Vault to Bank

**Route:** `/transfers/from-vault-to-bank`

**Form Fields:**
- Vault (select dropdown — optional in template but required in FormGroup)
- Balance (read-only, shown after vault selection)
- Bank Account (lookup — required)
- Amount (number input — required)
- Date (date picker — required, pre-filled)
- Currency (lookup — required)
- Person in Charge (lookup — required)
- Description (textarea — required)

---

#### TC-T-03-001: Page loads with form in correct initial state

**Type:** Happy path / Page load

**Preconditions:** User is logged in.

**Steps:**
1. Navigate to `http://localhost/#/transfers/from-vault-to-bank`.
2. Observe the initial state of the form.

**Expected Results:**
- Page header reads "TRANSFER FROM VAULT TO BANK".
- A **CANCEL** button is visible (top-right).
- A **TRANSFER** button is visible and **disabled**.
- Form fields present: Vault, Bank Account, Amount, Date, Currency, Person in Charge, Description.
- Date field is pre-populated with today's date.
- Balance read-only field is **not visible** (appears only after vault selection).
- No validation error styling on any field.

**Success Criteria:** Form renders correctly; Transfer button is disabled; Date is pre-filled.

---

#### TC-T-03-002: Vault dropdown shows available vaults and selecting one reveals balance

**Type:** Happy path / Field interaction

**Preconditions:** User is logged in and on `/transfers/from-vault-to-bank`. At least one vault with an associated account exists.

**Steps:**
1. Click the **Vault** select dropdown.
2. Observe the list of available vaults.
3. Select the first vault in the list.

**Expected Results:**
- The dropdown shows vault names from the API.
- After selection, a **Balance** read-only field appears below the Vault field showing the vault account's current balance (formatted; negative values shown as 0).
- The `vaultId` form control is updated with the selected vault's ID.

**Success Criteria:** Vault dropdown populates from API; balance appears after selection.

---

#### TC-T-03-003: Currency is a searchable lookup (not read-only)

**Type:** Happy path — field type distinction

**Preconditions:** User is logged in and on `/transfers/from-vault-to-bank`.

**Steps:**
1. Click the **Currency** lookup field.
2. Type a currency name or code (e.g., `USD`).
3. Wait for results to appear.
4. Select a currency from the results.

**Expected Results:**
- Currency is a `cbs-form-lookup-control` (interactive lookup), unlike the Bank-to-Vault form where it is read-only.
- The field is populated with the selected currency name.
- The `currencyId` form control is set to the selected currency's ID.

**Success Criteria:** Currency is a user-selectable required field on this form (not auto-derived).

---

#### TC-T-03-004: Happy path — successful Vault-to-Bank transfer

**Type:** Happy path / End-to-end

**Preconditions:** User is logged in. A vault with balance and a target bank account exist.

**Steps:**
1. Navigate to `http://localhost/#/transfers/from-vault-to-bank`.
2. In the **Vault** dropdown, select an available vault.
3. Verify the **Balance** field appears.
4. In the **Bank Account** lookup, search for and select a valid account.
5. In the **Amount** field, enter `250`.
6. Confirm the **Date** field shows today's date.
7. In the **Currency** lookup, search for and select a valid currency (e.g., `USD`).
8. In the **Person in Charge** lookup, search for and select `Administrator`.
9. In the **Description** textarea, enter `Vault to bank transfer test`.
10. Confirm the **TRANSFER** button is enabled.
11. Click the **TRANSFER** button.
12. The confirmation popup appears — review content.
13. Click **YES**.
14. Observe the result.

**Expected Results:**
- Step 12: Popup body reads "Please, review and confirm vault to bank transfer details:" followed by:
  - Vault: name of selected vault
  - Bank Account: `{number} | {name}`
  - Amount: `250`
  - Currency: selected currency name
  - Person in Charge: `Administrator`
  - Description: `Vault to bank transfer test`
  - Buttons: **NO** and **YES**
- Step 14: Success toast is displayed; navigation to `/transfers` hub occurs.

**Success Criteria:** Transfer completes; success toast; redirect to hub.

---

#### TC-T-03-005: Confirmation popup — clicking NO cancels submission

**Type:** Cancel / Negative path

**Preconditions:** User is logged in; all required fields on `/transfers/from-vault-to-bank` are filled.

**Steps:**
1. Fill all required fields with valid data.
2. Click **TRANSFER**.
3. Popup appears.
4. Click **NO**.

**Expected Results:**
- Popup closes without API call.
- User remains on the form with all values preserved.
- No toast. URL unchanged.

**Success Criteria:** NO button aborts without any side effect.

---

#### TC-T-03-006: CANCEL button navigates back to transfers hub

**Type:** Navigation / Cancel

**Preconditions:** User is logged in and on `/transfers/from-vault-to-bank`.

**Steps:**
1. Optionally enter some data in the form.
2. Click the **CANCEL** button.

**Expected Results:**
- Navigates to `http://localhost/#/transfers`.
- No confirmation dialog. No data saved.

**Success Criteria:** CANCEL is a direct link to `/transfers`.

---

#### TC-T-03-007: Transfer button is disabled when form is incomplete

**Type:** Validation

**Preconditions:** User is logged in and on `/transfers/from-vault-to-bank`.

**Steps:**
1. Fill only the **Amount** field with `100` and **Description** with `test`.
2. Observe the **TRANSFER** button.

**Expected Results:**
- TRANSFER button is disabled because Vault, Bank Account, Date, Currency, and Person in Charge are not yet selected.

**Success Criteria:** Button stays disabled with partial form completion.

---

#### TC-T-03-008: Field-level validation error styling on blur

**Type:** Validation / UX

**Preconditions:** User is logged in and on `/transfers/from-vault-to-bank`.

**Steps:**
1. Click into the **Amount** field and then click away without entering a value.
2. Click into the **Description** textarea and click away without entering text.
3. Observe field styling.

**Expected Results:**
- Both Amount and Description fields show error styling (hasError condition triggers: `form.get('field').errors && form.get('field').touched`).

**Success Criteria:** Touched-and-invalid fields display error styling.

---

#### TC-T-03-009: API error response — error toast is displayed

**Type:** Error handling

**Preconditions:** User is logged in. A condition that causes an API error is known or simulated.

**Steps:**
1. Fill all fields with data expected to trigger an API error (e.g., amount exceeding vault balance).
2. Click **TRANSFER**.
3. Click **YES** in the popup.
4. Observe the result.

**Expected Results:**
- Error toast appears with the API error message.
- User remains on `/transfers/from-vault-to-bank`.
- No redirect occurs.

**Success Criteria:** Error toast displayed; form remains accessible for correction.

---

### Suite T-04: Transfer Between Members

**Route:** `/transfers/between-members`

**Form Fields:**
- Source Account (lookup — required, current accounts only)
- Balance (read-only, shown after source account selection)
- Destination Account (lookup — required, current accounts only)
- Amount (number input — required)
- Date (date picker — required, pre-filled)
- Currency (read-only, derived from Source Account after selection)
- Description (textarea — required)
- Auto Print (checkbox — optional, triggers receipt download on success)

---

#### TC-T-04-001: Page loads with form in correct initial state

**Type:** Happy path / Page load

**Preconditions:** User is logged in.

**Steps:**
1. Navigate to `http://localhost/#/transfers/between-members`.
2. Observe the initial state of the form.

**Expected Results:**
- Page header reads "TRANSFER BETWEEN MEMBERS".
- A **CANCEL** button is visible (top-right).
- A **TRANSFER** button is visible and **disabled**.
- Form fields present: Source Account, Destination Account, Amount, Date, Description, Auto Print checkbox.
- Date field is pre-populated with today's date.
- Balance and Currency read-only fields are **not visible** (appear only after source account selection).
- Auto Print checkbox is unchecked by default.
- No validation error styling on any field.

**Success Criteria:** Form renders correctly; Transfer button disabled; Date pre-filled; Auto Print unchecked.

---

#### TC-T-04-002: Source account lookup — search and selection reveals balance and currency

**Type:** Happy path / Field interaction

**Preconditions:** User is logged in and on `/transfers/between-members`. At least one current account exists.

**Steps:**
1. Click the **Source Account** lookup field.
2. Type a partial account name or number.
3. Wait for results.
4. Select an account from the results list.

**Expected Results:**
- The Source Account field is populated with the format `{number} | {name}`.
- A **Balance** read-only field appears showing the account's current balance (negative balances shown as 0).
- A **Currency** read-only field appears showing the currency name from the selected account.
- The `sourceAccountId` form control is set to the account's ID.

**Success Criteria:** Balance and Currency appear after source account selection; format is `{number} | {name}`.

---

#### TC-T-04-003: Destination account lookup — search and selection

**Type:** Happy path / Field interaction

**Preconditions:** User is logged in and on `/transfers/between-members`. Source account has been selected.

**Steps:**
1. Click the **Destination Account** lookup field.
2. Type a partial account name or number.
3. Wait for results.
4. Select an account different from the source account.

**Expected Results:**
- The Destination Account field is populated with the format `{number} | {name}`.
- The `destinationAccountId` form control is set to the selected account's ID.
- Balance and Currency fields do **not** change (they are tied to Source Account only).

**Success Criteria:** Destination account selection registers correctly; source balance/currency unaffected.

---

#### TC-T-04-004: Source and Destination accounts can be the same account (UI-level)

**Type:** Edge case

**Preconditions:** User is logged in and on `/transfers/between-members`.

**Steps:**
1. Select Account A as the **Source Account**.
2. Select Account A (same account) as the **Destination Account**.
3. Fill remaining required fields.
4. Click **TRANSFER**.
5. Observe the confirmation popup.
6. Click **YES**.
7. Observe the API response.

**Expected Results:**
- The UI does not prevent the same account from being selected as both source and destination (no client-side validation for this).
- The confirmation popup shows the same account in both Source Account and Destination Account fields.
- The API may reject or permit this; document the API response.

**Success Criteria:** UI allows same-account selection; behavior on API rejection is documented.

---

#### TC-T-04-005: Happy path — successful Between-Members transfer without Auto Print

**Type:** Happy path / End-to-end

**Preconditions:** User is logged in. At least two current accounts exist.

**Steps:**
1. Navigate to `http://localhost/#/transfers/between-members`.
2. In the **Source Account** lookup, search for and select a valid current account.
3. Confirm the Balance and Currency read-only fields appear.
4. In the **Destination Account** lookup, search for and select a different valid current account.
5. In the **Amount** field, enter `100`.
6. Confirm the **Date** field shows today's date.
7. In the **Description** textarea, enter `Member transfer test`.
8. Confirm the **Auto Print** checkbox is unchecked.
9. Confirm the **TRANSFER** button is enabled.
10. Click the **TRANSFER** button.
11. The confirmation popup appears — review content.
12. Click **YES**.
13. Observe the result.

**Expected Results:**
- Step 11: Popup body reads "Please, review and confirm transfer details:" followed by:
  - Source Account: `{number} | {name}`
  - Destination Account: `{number} | {name}`
  - Amount: `100`
  - Description: `Member transfer test`
  - Buttons: **NO** and **YES**
- Step 13: Success toast; navigation to `/transfers` hub. No `.docx` file download is triggered (Auto Print was unchecked).

**Success Criteria:** Transfer completes; toast shown; redirect to hub; no file download.

---

#### TC-T-04-006: Happy path — successful Between-Members transfer with Auto Print enabled

**Type:** Happy path / Feature interaction

**Preconditions:** User is logged in. Two current accounts exist. A `TRANSFER_MEMBERS` print template is configured in the system.

**Steps:**
1. Navigate to `http://localhost/#/transfers/between-members`.
2. Select a **Source Account**.
3. Select a **Destination Account**.
4. Enter **Amount**: `200`.
5. Confirm **Date** is today.
6. Enter **Description**: `Auto print transfer test`.
7. Check the **Auto Print** checkbox.
8. Confirm **TRANSFER** button is enabled.
9. Click **TRANSFER**.
10. Click **YES** in the confirmation popup.
11. Observe the result.

**Expected Results:**
- Success toast is displayed.
- Navigation to `/transfers` hub occurs.
- A file download is triggered for a `.docx` file named after the receipt template label (e.g., `TRANSFER_MEMBERS.docx`) approximately 500ms after success.
- If no print template is configured, a `CREATE_ERROR` toast may appear but the transfer itself should still succeed (navigate to hub first).

**Success Criteria:** Transfer succeeds; when Auto Print is checked and template exists, a `.docx` download is initiated.

---

#### TC-T-04-007: Auto Print checkbox — checked state is visible and toggleable

**Type:** Happy path / Field interaction

**Preconditions:** User is logged in and on `/transfers/between-members`.

**Steps:**
1. Locate the **Auto Print** checkbox (labeled `AUTO_PRINT` or translated equivalent).
2. Confirm it is unchecked by default.
3. Click the checkbox.
4. Confirm it is now checked.
5. Click the checkbox again.
6. Confirm it is unchecked again.

**Expected Results:**
- Checkbox toggles between checked and unchecked states.
- Its state does not affect form validity (it is optional — `FormControl('')` with no `Validators.required`).
- TRANSFER button state is unaffected by the checkbox state (provided all required fields are filled or not).

**Success Criteria:** Auto Print is a non-required checkbox that toggles correctly.

---

#### TC-T-04-008: Confirmation popup — clicking NO cancels submission

**Type:** Cancel / Negative path

**Preconditions:** User is logged in; all required fields on `/transfers/between-members` are filled.

**Steps:**
1. Fill all required fields with valid data.
2. Click **TRANSFER**.
3. Popup appears.
4. Click **NO**.

**Expected Results:**
- Popup closes without API call.
- User remains on the form with all values preserved.
- No toast. URL unchanged.

**Success Criteria:** NO button aborts without side effect.

---

#### TC-T-04-009: CANCEL button navigates back to transfers hub

**Type:** Navigation / Cancel

**Preconditions:** User is logged in and on `/transfers/between-members`.

**Steps:**
1. Optionally enter data in some form fields.
2. Click the **CANCEL** button (top-right).

**Expected Results:**
- Navigates directly to `http://localhost/#/transfers`.
- No confirmation dialog. No data saved.

**Success Criteria:** CANCEL is a direct route link; no modal.

---

#### TC-T-04-010: Transfer button disabled until all required fields filled

**Type:** Validation

**Preconditions:** User is logged in and on `/transfers/between-members`.

**Steps:**
1. Fill only the **Amount** (`50`) and **Description** (`partial test`).
2. Observe the **TRANSFER** button.
3. Now also select a **Source Account**.
4. Observe the button again.

**Expected Results:**
- After steps 1–2: TRANSFER button is disabled (Source Account and Destination Account are missing).
- After step 3: Button is still disabled (Destination Account still missing).
- Button becomes enabled only after Source Account, Destination Account, Amount, Date, and Description all have values.

**Success Criteria:** Partial form fill keeps the button disabled.

---

#### TC-T-04-011: Field-level validation error styling on blur

**Type:** Validation / UX

**Preconditions:** User is logged in and on `/transfers/between-members`.

**Steps:**
1. Click into the **Amount** field, then click away without entering a value.
2. Click into the **Description** textarea, then click away without entering text.
3. Observe both fields.

**Expected Results:**
- Both fields display error styling (red border / error class) after being touched without a value.

**Success Criteria:** hasError condition triggers on touch for required fields.

---

#### TC-T-04-012: API error response — error toast is displayed

**Type:** Error handling

**Preconditions:** User is logged in. A condition that causes an API error is known or simulated (e.g., transfer amount exceeds source account balance if enforced by backend).

**Steps:**
1. Fill all required fields with data expected to cause an API error.
2. Click **TRANSFER**.
3. Click **YES** in the popup.
4. Observe the result.

**Expected Results:**
- Error toast is displayed with the API error message.
- User remains on `/transfers/between-members`.
- No navigation to hub.

**Success Criteria:** Error toast shown; form accessible for correction.

---

### Suite T-05: Cross-Cutting / Common Behavior

---

#### TC-T-05-001: Navigation breadcrumb / back from any transfer form returns to hub

**Type:** Navigation

**Preconditions:** User is logged in.

**Steps:**
1. Navigate to `http://localhost/#/transfers/from-bank-to-vault`.
2. Click the browser Back button.
3. Observe the resulting page.

**Expected Results:**
- The browser navigates back to the previous page in history (likely the `/transfers` hub if the user navigated there first, or the prior page otherwise).
- No JavaScript errors occur.

**Success Criteria:** Browser back button works with Angular router without errors.

---

#### TC-T-05-002: Loading indicator is shown during transfer submission

**Type:** UX / Behavior

**Preconditions:** User is logged in; all required fields on any transfer form are filled.

**Steps:**
1. Fill all required fields on any transfer form.
2. Click **TRANSFER**.
3. Click **YES** in the confirmation popup.
4. Immediately observe the UI during the API call (before response arrives).

**Expected Results:**
- A loading indicator (spinner/overlay) is briefly visible during the API call (`isSubmittingTransfer = true`).
- The indicator disappears after the response is received.

**Success Criteria:** `cbs-loading-indicator` with `[isFixed]="true"` is shown during the async operation.

---

#### TC-T-05-003: Confirmation popup displays correct labels for YES and NO

**Type:** UX / Content verification

**Preconditions:** User is logged in; all required fields on any transfer form are filled.

**Steps:**
1. Fill all required fields on any transfer form.
2. Click **TRANSFER**.
3. Observe the confirmation popup.

**Expected Results:**
- Popup title/label: "CONFIRMATION" (or translated equivalent).
- Left button: "NO" (or translated equivalent).
- Right button: "YES" (or translated equivalent).

**Success Criteria:** Button labels match the `leftButtonLabel` and `rightButtonLabel` bindings from the template.

---

#### TC-T-05-004: Transfer success redirects to hub on all three transfer types

**Type:** Post-submission navigation

**Preconditions:** User is logged in; valid data exists for each transfer type.

**Steps:**
1. Complete a successful **Bank to Vault** transfer (see TC-T-02-010).
2. Observe the redirect.
3. Complete a successful **Vault to Bank** transfer (see TC-T-03-004).
4. Observe the redirect.
5. Complete a successful **Between Members** transfer (see TC-T-04-005).
6. Observe the redirect.

**Expected Results:**
- After each successful transfer, the application navigates to `http://localhost/#/transfers`.
- The Transfers hub page with three tiles is displayed.

**Success Criteria:** `this.router.navigate(['/transfers'])` fires consistently after success on all three forms.

---

#### TC-T-05-005: Date field accepts past and future dates

**Type:** Edge case / Boundary

**Preconditions:** User is logged in and on any transfer form.

**Steps:**
1. Clear the **Date** field.
2. Enter a past date (e.g., `2020-01-01`).
3. Observe whether the TRANSFER button becomes enabled (assuming other fields are filled).
4. Clear the Date field and enter a far future date (e.g., `2099-12-31`).
5. Observe the TRANSFER button state.

**Expected Results:**
- The Angular date control with `Validators.required` only checks for presence, not date range. Both past and future dates should pass client-side validation.
- The TRANSFER button becomes enabled (assuming all other required fields are filled) for both past and future dates.
- Any business-rule date validation (e.g., date cannot be in the future) would come from the API.

**Success Criteria:** Client-side validation does not restrict date range; API-level behavior is noted.

---

#### TC-T-05-006: Form state is not persisted between navigations

**Type:** State management / Isolation

**Preconditions:** User is logged in.

**Steps:**
1. Navigate to `http://localhost/#/transfers/from-bank-to-vault`.
2. Fill in some form fields (e.g., Cheque Number: `CHQ-TEST`, Amount: `999`).
3. Click **CANCEL** to go back to `/transfers`.
4. Click the **BANK TO VAULT** tile to navigate back to the form.
5. Observe the form field values.

**Expected Results:**
- The form is re-initialized on each navigation (Angular destroys and re-creates the component).
- Fields are empty (or reset to defaults, e.g., today's date in the Date field).
- Previously entered values (`CHQ-TEST`, `999`) are not present.

**Success Criteria:** Component lifecycle ensures no state leakage between visits.

---

#### TC-T-05-007: All three forms handle concurrent session expiry gracefully

**Type:** Session / Security

**Preconditions:** User is logged in and a transfer form is partially filled.

**Steps:**
1. Log in and navigate to any transfer form.
2. Fill some fields.
3. Simulate session expiry (clear the authentication token from localStorage or cookies in DevTools).
4. Click **TRANSFER** and then **YES** in the popup.
5. Observe the result.

**Expected Results:**
- The API call fails with a 401 Unauthorized response.
- Either an error toast appears or the application redirects to the login page.
- The user is not left in an ambiguous state with a spinning loader.

**Success Criteria:** Expired-session API failure is handled gracefully (toast or redirect).

---

### Suite T-06: Accessibility and Layout

---

#### TC-T-06-001: Transfer forms are keyboard-navigable

**Type:** Accessibility

**Preconditions:** User is logged in and on any transfer form.

**Steps:**
1. Navigate to `http://localhost/#/transfers/from-bank-to-vault`.
2. Click on the first form field (Bank Account lookup).
3. Use **Tab** to move between form fields in sequence.
4. Verify that all interactive form fields receive focus in a logical order.

**Expected Results:**
- Tab order moves through form fields in visual top-to-bottom order.
- All inputs (lookup, select, number, date, text, textarea) are reachable via Tab.
- Cancel and Transfer buttons are reachable via Tab.

**Success Criteria:** All interactive elements are keyboard-accessible.

---

#### TC-T-06-002: TRANSFER button has visible disabled state

**Type:** Accessibility / UX

**Preconditions:** User is logged in and on any transfer form with an empty/incomplete form.

**Steps:**
1. Navigate to `http://localhost/#/transfers/from-bank-to-vault`.
2. Do not fill any form fields.
3. Inspect the **TRANSFER** button visually.

**Expected Results:**
- The TRANSFER button has a visually distinct disabled appearance (muted color, cursor: not-allowed or default).
- The button is not clickable (the `disabled` HTML attribute is present).

**Success Criteria:** Disabled button state is visually and functionally enforced.

---

## Summary Matrix

| Test Case | Suite | Type | Priority |
|---|---|---|---|
| TC-T-01-001 | Hub | Happy path | P1 |
| TC-T-01-002 | Hub | Navigation | P1 |
| TC-T-01-003 | Hub | Navigation | P1 |
| TC-T-01-004 | Hub | Navigation | P1 |
| TC-T-01-005 | Hub | Security | P1 |
| TC-T-02-001 | Bank to Vault | Page load | P1 |
| TC-T-02-002 | Bank to Vault | Validation | P1 |
| TC-T-02-003 | Bank to Vault | Field interaction | P1 |
| TC-T-02-004 | Bank to Vault | Happy path | P2 |
| TC-T-02-005 | Bank to Vault | Happy path | P1 |
| TC-T-02-006 | Bank to Vault | Validation/Edge | P2 |
| TC-T-02-007 | Bank to Vault | Edge case | P3 |
| TC-T-02-008 | Bank to Vault | Happy path | P2 |
| TC-T-02-009 | Bank to Vault | Happy path | P1 |
| TC-T-02-010 | Bank to Vault | End-to-end | P1 |
| TC-T-02-011 | Bank to Vault | Cancel | P1 |
| TC-T-02-012 | Bank to Vault | Navigation | P1 |
| TC-T-02-013 | Bank to Vault | Validation/UX | P2 |
| TC-T-02-014 | Bank to Vault | Error handling | P1 |
| TC-T-02-015 | Bank to Vault | Security | P1 |
| TC-T-03-001 | Vault to Bank | Page load | P1 |
| TC-T-03-002 | Vault to Bank | Field interaction | P1 |
| TC-T-03-003 | Vault to Bank | Field type | P2 |
| TC-T-03-004 | Vault to Bank | End-to-end | P1 |
| TC-T-03-005 | Vault to Bank | Cancel | P1 |
| TC-T-03-006 | Vault to Bank | Navigation | P1 |
| TC-T-03-007 | Vault to Bank | Validation | P1 |
| TC-T-03-008 | Vault to Bank | Validation/UX | P2 |
| TC-T-03-009 | Vault to Bank | Error handling | P1 |
| TC-T-04-001 | Between Members | Page load | P1 |
| TC-T-04-002 | Between Members | Field interaction | P1 |
| TC-T-04-003 | Between Members | Field interaction | P1 |
| TC-T-04-004 | Between Members | Edge case | P3 |
| TC-T-04-005 | Between Members | End-to-end | P1 |
| TC-T-04-006 | Between Members | Feature interaction | P2 |
| TC-T-04-007 | Between Members | Field interaction | P2 |
| TC-T-04-008 | Between Members | Cancel | P1 |
| TC-T-04-009 | Between Members | Navigation | P1 |
| TC-T-04-010 | Between Members | Validation | P1 |
| TC-T-04-011 | Between Members | Validation/UX | P2 |
| TC-T-04-012 | Between Members | Error handling | P1 |
| TC-T-05-001 | Cross-cutting | Navigation | P2 |
| TC-T-05-002 | Cross-cutting | UX/Behavior | P2 |
| TC-T-05-003 | Cross-cutting | Content | P2 |
| TC-T-05-004 | Cross-cutting | Navigation | P1 |
| TC-T-05-005 | Cross-cutting | Edge case | P3 |
| TC-T-05-006 | Cross-cutting | State management | P2 |
| TC-T-05-007 | Cross-cutting | Security | P2 |
| TC-T-06-001 | Accessibility | Accessibility | P3 |
| TC-T-06-002 | Accessibility | Accessibility/UX | P2 |

---

## Key Implementation Notes for Playwright Authors

1. **Login helper:** All test suites except TC-T-01-005 and TC-T-02-015 require a logged-in session. Create a `beforeAll` or `beforeEach` block that navigates to `http://localhost/#/login`, fills `username-id` with `Administrator` and `password-id` with `admin`, submits the form, and waits for navigation to complete.

2. **Lookup controls (`cbs-form-lookup-control`):** These are custom Angular components. The search input is typically rendered inside a dropdown. Use `locator` to find the "SEARCH" placeholder input, fill it, wait for the results list, then click the desired item. Avoid relying on native `<select>` element selectors for these.

3. **Select controls (`cbs-form-select-control`):** These use a custom `<select>` or custom dropdown. Inspect the rendered DOM to determine whether `page.selectOption()` or a click-based selection is needed.

4. **Confirmation popup (`cbs-confirm-popup`):** The popup is conditionally rendered in the DOM via `[opened]="showConfirmModal"`. Wait for it to be visible before clicking YES/NO. Use `page.getByRole('dialog')` or a suitable locator.

5. **Toast notifications:** Use `page.locator('.toast-success')` or `page.locator('.toast-error')` (ngx-toastr classes) with `await expect(locator).toBeVisible()` and a reasonable timeout.

6. **Date field:** The `cbs-form-date-control` may render a custom date picker or a native `<input type="date">`. Verify the rendered element type and use `fill()` for text-based inputs or interact with the calendar widget if it is a custom picker.

7. **Route format:** The Angular app uses hash-based routing (`/#/transfers`). All URL assertions should account for the hash prefix.

8. **Seed data dependency:** Tests in Suite T-02, T-03, and T-04 require the existence of vaults, GL accounts, current accounts, currencies, and users. These should either be seeded via API calls in a global setup file or the test plan should note their manual prerequisite creation steps (see the Assumptions section above).
