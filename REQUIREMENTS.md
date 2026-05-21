# OpenCBS Cloud — Product Requirements

> **Version:** 0.1 (initial requirements capture for QA orchestration ingestion)
> **Date:** 2026-05-20
> **Target stack:** Spring Boot 1.5.4 (Java) · Angular 8 · PostgreSQL 16 · RabbitMQ 3.12.1
> **Repo layout:** `server/opencbs-*` (Java multi-module Maven) · `client/src/app/containers/*` (Angular)
> **Companion docs:** `E2E_TEST_SCENARIOS.md` (full loan-flow walkthrough), `tests/ui/plans/transfer-module.plan.md` (transfer module plan)

---

## 1. Product overview

OpenCBS Cloud is an open-source Core Banking System designed for microfinance institutions, cooperatives, digital lenders, and medium-sized banks. The system covers front-office (client and loan management) and back-office (accounting, reports) operations and is delivered as a single deployment that can be scaled in the cloud.

The Month-1 QA scope focuses on the **Loan origination → Credit Committee → Disbursement → Repayment** flow plus the **Transfers** module, since those exercise every core integration boundary (configuration lookups, profile creation, maker/checker, accounting writes, scheduling).

## 2. Personas

| Persona | Role | Key capabilities |
|---|---|---|
| Administrator | Default super-admin user (`Administrator` / `admin`) | Has both MAKER and CHECKER permissions → auto-approves their own actions |
| Loan Officer | Branch-level user, e.g. `john.doe` | Can create profiles, originate loan applications, cast Credit Committee votes |
| Teller / Cashier | Branch user | Can register repayments, run end-of-day operations |
| Auditor / Accountant | Back-office | Reads accounting entries, runs reports |

## 3. Functional domains

OpenCBS' Angular client groups features under `client/src/app/containers/`:

```
accounting · auth · bonds · borrowing · configuration · dashboard
error · event-manager · loan · loan-application · loan-payee
maker-checker · profile · reports · savings · settings
teller-management · term-deposit · transfers
```

The corresponding Java backend modules live under `server/opencbs-*`:

```
opencbs-bonds · opencbs-borrowings · opencbs-core · opencbs-loans
opencbs-savings · opencbs-server · opencbs-spring-boot-starter · opencbs-term-deposits
```

The remainder of this document specifies user stories per domain, with explicit references to the controller (server) and container (client) files that implement them. These references are also used by the QA orchestrator to map Jira issues to affected files for downstream agent context.

---

## 4. Domain: Configuration

**Client container:** `client/src/app/containers/configuration/`
**Route:** `#/configuration`

### Story 4.1 — Branches

As an Administrator, I want to create and edit branches so that users, products, and accounts can be scoped to them.

**Acceptance:**
- Branch creation form requires a unique name.
- On save, branch appears in the branches list immediately.
- Maker/Checker auto-approves when the maker holds CHECKER permissions.

### Story 4.2 — Roles & Permissions

As an Administrator, I want to define roles with granular permissions so that I can grant users only what they need.

**Acceptance:**
- Each role can be assigned permissions for Profiles, Loan Applications, Loans, Transfers, etc.
- A role with `Loan Applications: read/write` is eligible for Credit Committee voting if added to a CC rule.
- Deletion is blocked when at least one user still references the role.

### Story 4.3 — Users

As an Administrator, I want to create users with a branch and role assignment so that they can sign in and perform their duties.

**Acceptance:**
- Required: username, password, branch, role, email.
- Newly created user is active by default and can sign in immediately.
- Password may be reset via the user-edit form using the "New Password (leave blank to keep current)" field.

### Story 4.4 — Payment Methods

As an Administrator, I want to register payment methods (Cash, Bank Transfer, Mobile Money, …) so that they are selectable during repayment.

**Acceptance:**
- Names are unique.
- Created methods appear in the **Payment method** dropdown on the repayment form.

### Story 4.5 — Loan Products

As an Administrator, I want to define loan products so that loan officers can originate applications against pre-approved parameter ranges.

**Server:** `server/opencbs-loans/src/main/java/com/opencbs/loans/controllers/loanapplications/LoanProductController.java`
**Client:** `client/src/app/containers/configuration/`

**Acceptance:**
- Required: name, code, currency, schedule type (e.g. `Annuity`), schedule-based type (`BY_INSTALLMENT` or by date), amount min/max, interest-rate min/max, instalments min/max, grace-period min/max.
- Loan applications using the product validate that all numeric fields fall within the product's bounds.
- A product can be marked Active/Inactive — inactive products do not appear in the application form's product picker.

### Story 4.6 — Credit Committee Rules

As an Administrator, I want to configure Credit Committee voting rules based on amount thresholds so that high-value loan applications require approval by the correct roles.

**Server:** `server/opencbs-loans/src/main/java/com/opencbs/loans/controllers/loanapplications/CreditCommitteeAmountRangeController.java`, `CreditCommitteeVoteHistoryController.java`

**Acceptance:**
- A rule specifies a `Limit` (amount up to which it applies) and one or more `Roles` whose members may vote.
- Application amounts that match a rule trigger CC voting between Submit and Disburse.
- The Approve / Rejected / Refer buttons render only for users whose role matches the rule.

---

## 5. Domain: Profiles

**Client container:** `client/src/app/containers/profile/`
**Route:** `#/profiles`

### Story 5.1 — Create Person Profile

As a Loan Officer, I want to create a Person profile so that I can attach loan applications and savings accounts to a known client.

**Acceptance:**
- Required: first name, last name, date of birth, gender, branch.
- After save, the profile lands at `#/profiles/people/{id}/info` with status badge **LIVE**.
- The header reads `Profiles > {Name} > Information`.

### Story 5.2 — Create Company Profile

As a Loan Officer, I want to create a Company (legal entity) profile so that I can originate loans to small businesses.

**Acceptance:**
- Required: legal name, registration number, branch.
- Profile lands at `#/profiles/companies/{id}/info` after save.

### Story 5.3 — Edit profile

As a Loan Officer, I want to amend profile fields (phone, address) so that we keep KYC current.

**Acceptance:**
- Edits go through Maker/Checker.
- An edit by a non-CHECKER user creates a pending request visible at `#/requests`.

---

## 6. Domain: Loan Applications

**Client container:** `client/src/app/containers/loan-application/`
**Route:** `#/loan-applications/{id}/info`
**Server:** `server/opencbs-loans/src/main/java/com/opencbs/loans/controllers/loanapplications/LoanApplicationController.java`

### Story 6.1 — Create Loan Application

As a Loan Officer, I want to create a loan application for a profile so that we can begin the origination flow.

**Acceptance:**
- Required: profile (read-only, pre-filled), loan product, currency, net amount, interest rate, grace period, number of instalments, disbursement date, preferred repayment date, loan officer.
- Numeric fields must fall within the chosen product's min/max range — otherwise save is rejected with a per-field validation error.
- On save, the new application lands at `#/loan-applications/{id}/info` with status badge **IN PROGRESS**.
- Schedule tab is auto-generated and shows N annuity (or per product `Schedule Type`) instalments.

### Story 6.2 — Schedule preview

As a Loan Officer, I want to see the generated repayment schedule before submitting so that I can confirm the client's instalment fits their cashflow.

**Acceptance:**
- Schedule tab renders one row per instalment with: due date, principal, interest, total.
- Sum of principal across all rows equals the requested net amount (modulo rounding ≤ 0.01 of the smallest unit).

### Story 6.3 — Submit Loan Application

As a Loan Officer, I want to submit a draft application so that it enters the Credit Committee voting queue.

**Acceptance:**
- The **Submit** button is visible only while status is **IN PROGRESS**.
- A confirmation dialog must be accepted.
- After submit, status changes from `IN PROGRESS` → `PENDING` and the **Credit committee** tab becomes active.
- Activity log records: `State was changed From IN PROGRESS To PENDING`.

### Story 6.4 — Edit / cancel a draft

As a Loan Officer, I want to edit or cancel a draft application before submitting so that I can fix mistakes without back-office involvement.

**Acceptance:**
- Edits are allowed only while status is `IN PROGRESS`.
- Cancel transitions the application to a terminal `CANCELLED` state and is recorded in the activity log.

---

## 7. Domain: Credit Committee

**Server:** `server/opencbs-loans/src/main/java/com/opencbs/loans/controllers/loanapplications/CreditCommitteeVoteHistoryController.java`
**Route:** `#/loan-applications/{id}/credit-committee`

### Story 7.1 — Vote on a pending application

As a Loan Officer (CC member), I want to Approve / Reject / Refer a pending application so that origination can proceed or stop.

**Acceptance:**
- The Approve/Rejected/Refer buttons render only for users whose role matches the CC rule that applies to this application's amount.
- A modal collects optional notes and a confirm.
- On Approve: status `PENDING → APPROVED`, **Disburse** button appears in the action bar, activity log records the vote.
- On Reject: status `PENDING → REJECTED`, the application becomes read-only.
- On Refer: status remains `PENDING` but a "referred back" event is recorded; the maker can re-submit.

### Story 7.2 — Vote history

As an Auditor, I want to see every CC vote in chronological order so that I can reconstruct the decision trail.

**Acceptance:**
- The vote history table shows: voter, role, date, decision, notes.

---

## 8. Domain: Disbursement & Active Loan

**Server:** `server/opencbs-loans/src/main/java/com/opencbs/loans/controllers/LoanController.java`
**Route:** `#/loans/{id}/person/info`

### Story 8.1 — Disburse approved application

As a Loan Officer (or CHECKER), I want to disburse an approved application so that the customer receives funds and the account is activated.

**Acceptance:**
- Disburse is enabled only when status is **APPROVED**.
- After confirm, application status → `DISBURSED` and a new loan is created with code prefix `BL` (e.g. `BL00001`), status `ACTIVE`.
- Loan info page balance bar shows: Settlement balance, Arrears (=0), OLB (= disbursed amount), Penalty (=0).
- Activity log: `State was changed From APPROVED To DISBURSED`.

### Story 8.2 — Repayment

As a Teller, I want to register a repayment against an active loan so that the outstanding balance is reduced.

**Server:** `server/opencbs-loans/src/main/java/com/opencbs/loans/controllers/LoanRepaymentController.java`, `AbstractLoanRepaymentController.java`
**Route:** `#/loans/{id}/person/schedule/repayment`

**Acceptance:**
- Required: payment method (must exist in Story 4.4), total amount > 0.
- **Preview** recomputes the schedule distribution; **Repay** persists.
- Successful repayment updates the balance bar (OLB ↓, Settlement balance ↓) and emits a success toast.
- The schedule tab highlights paid rows in green.
- A `REPAYMENT` event is appended to `#/loans/{id}/person/events`.

### Story 8.3 — Reschedule

**Server:** `server/opencbs-loans/src/main/java/com/opencbs/loans/controllers/LoanRescheduleController.java`

As a Loan Officer with appropriate permissions, I want to reschedule an active loan so that we can absorb a missed payment without writing off the loan.

**Acceptance:**
- Allowed only while loan status is `ACTIVE`.
- Generates a new schedule from the rescheduling date forward; an event of type `RESCHEDULE` is appended.

### Story 8.4 — Top-up

**Server:** `server/opencbs-loans/src/main/java/com/opencbs/loans/controllers/LoanTopUpController.java`

As a Loan Officer, I want to top up an active loan so that an existing good customer can borrow more without a new origination.

**Acceptance:**
- Top-up amount must keep total exposure within the product's `Amount Max`.
- A `TOPUP` event is appended; the schedule is regenerated.

### Story 8.5 — Write-off

As an Administrator, I want to write off a non-performing loan so that the balance sheet stops carrying it as an asset.

**Acceptance:**
- Write-off transitions the loan to terminal status `WRITTEN_OFF` and posts the appropriate accounting entry.

---

## 9. Domain: Transfers

**Client container:** `client/src/app/containers/transfers/`
**Routes:** `#/transfers` (hub), `#/transfers/from-bank-to-vault`, `#/transfers/from-vault-to-bank`, `#/transfers/between-members`
**Companion plan:** `tests/ui/plans/transfer-module.plan.md`

### Story 9.1 — Transfers hub

As any authenticated user with the `TRANSFERS` permission group, I want a hub page showing the three available transfer types so that I can pick the right operation.

**Acceptance:**
- Three tile cards render: **BANK TO VAULT**, **VAULT TO BANK**, **BETWEEN MEMBERS**.
- Each tile has the expected description and links to its sub-route.
- Users without the `TRANSFERS` permission group are redirected by `RouteGuard`.

### Story 9.2 — Bank to Vault

As a Teller, I want to move funds from a GL DEBIT/BALANCE bank account into a vault.

**Acceptance:**
- Required: bank account (lookup), vault (dropdown), amount > 0, currency, date (defaults to today), person-in-charge.
- The Transfer button is disabled until all required fields are filled.
- A confirm-popup must be accepted; cancel keeps user on the form.
- On success: success toast, redirect to `#/transfers`.
- On API error: error toast, user stays on the form.

### Story 9.3 — Vault to Bank

Symmetric to 9.2 with directionality reversed.

### Story 9.4 — Between Members

As a Teller, I want to move funds between two member current accounts.

**Acceptance:**
- Source and destination must both be member current accounts; source ≠ destination.
- Source-account lookup reveals balance; amount cannot exceed the available source balance.
- Auto-print is honoured only when a `TRANSFER_MEMBERS` print template is configured.

---

## 10. Domain: Maker / Checker

**Client container:** `client/src/app/containers/maker-checker/`
**Route:** `#/requests`

### Story 10.1 — Auto-approval when maker is also checker

As an Administrator (CHECKER), my own actions are auto-approved so that I don't have to context-switch for routine setup work.

**Acceptance:**
- Any action by a user with CHECKER permissions writes the request as already `APPROVED`.
- The action takes effect immediately (no separate approval step).

### Story 10.2 — Pending requests queue

As a Checker, I want a queue of pending requests created by makers so that I can review and approve/reject them.

**Acceptance:**
- Pending requests appear with maker, action, entity, timestamp.
- Approve confirms via dialog and applies the change; Reject discards it.

---

## 11. Cross-cutting non-functional requirements

| # | Requirement | Notes |
|---|---|---|
| NFR-1 | All money fields use 2-decimal precision; rounding follows banker's rounding | applies to schedule generation and repayment distribution |
| NFR-2 | All state changes are appended to the activity log with `From X To Y`, actor, timestamp | activity log is the audit substrate; never edited |
| NFR-3 | Maker/Checker is enforced server-side, not only in the UI | a direct API call by a non-CHECKER still queues a pending request |
| NFR-4 | All UI lookups paginate at 25 rows server-side, sorted newest-first | applies to profiles, loan applications, loans, requests |
| NFR-5 | All write endpoints validate against configuration constraints (product ranges, role permissions) before persistence | failures return 4xx with field-level detail |
| NFR-6 | RabbitMQ-emitted domain events (loan disbursed, repaid, written off) are idempotent on the `event_id` | downstream consumers must tolerate at-least-once delivery |

---

## 12. Out of scope (this version)

- Bonds, Borrowings, Term Deposits, Savings management — exist in the codebase but are not yet under QA orchestration.
- Mobile-money provider integrations.
- SEPA file ingestion (`opencbs-loans/.../SepaIntegrationController.java`) — covered separately.
- Multi-currency conversion math for cross-currency transfers.

---

## 13. Glossary

- **OLB** — Outstanding Loan Balance
- **CC** — Credit Committee
- **GL** — General Ledger
- **Maker/Checker** — Two-person rule: one user performs an action (maker), another approves it (checker)
- **Vault** — Physical cash store at a branch
- **Annuity schedule** — Equal-instalment schedule where each instalment carries a mix of principal and interest summing to the same total
