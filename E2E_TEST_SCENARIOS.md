# OpenCBS Cloud — End-to-End Test Scenarios (Loan Flow)

> **Environment:** Spring Boot 1.5.4 (port 8080) · Angular 8 (port 4200) · PostgreSQL 16 (port 5433, db `opencbs`) · RabbitMQ 3.12.1 (AMQP 5672, STOMP WS 15674)
>
> **Base URL:** `http://localhost:4200`
>
> **Accounts used:**
> - `Administrator` / `admin` — has CHECKER permissions (auto-approves Maker/Checker)
> - `john.doe` / `admin` — Loan Officer role (required for Credit Committee voting)
>
> All scenarios below have been verified end-to-end on **2026-05-19**.

---

## Prerequisites — Seed Data

The following must exist before running loan scenarios. Create via UI in this order if starting fresh:

| # | What | Where | Key Values |
|---|------|-------|------------|
| 1 | Payment Methods | `#/configuration` → Payment Methods → **Scenario 1** | Cash, Bank Transfer, Mobile Money |
| 2 | Branch | `#/configuration` → Branches → **Scenario 3** | Nairobi Branch |
| 3 | Roles | `#/configuration` → Roles → **Scenario 2** | Loan Officer (with loan permissions) |
| 4 | Users | `#/configuration` → Users | `john.doe` — role: Loan Officer, branch: Nairobi Branch |
| 5 | Loan Product | `#/configuration` → Loan Products | Standard Micro Loan (SML-001), 500–50000, 12–24%, 3–60 months, Annuity |
| 6 | Credit Committee | `#/configuration` → Credit Committee | Rule: Limit 100000, Roles: Loan Officer |
| 7 | Person Profile | `#/profiles` → Create → Person | Alice Wanjiru, DOB 1990-05-15 |

---

## Scenario 1 — Create Payment Methods

**Route:** `#/configuration` → Payment Methods → Create

### Steps

1. Navigate to `http://localhost:4200/#/configuration`
2. Click **Payment Methods** in the configuration grid
3. Click **Create** (top-right green button)
4. Fill:
   - **Name:** `Cash`
5. Click **Save**
6. Click **Create** again
7. Fill:
   - **Name:** `Bank Transfer`
8. Click **Save**
9. Click **Create** again
10. Fill:
    - **Name:** `Mobile Money`
11. Click **Save**

**Expected:**
- All three rows appear in the Payment Methods list: `Cash`, `Bank Transfer`, `Mobile Money`
- These options are available in the **Payment method** dropdown during loan repayment

---

## Scenario 2 — Create Role (Loan Officer)

**Route:** `#/configuration` → Roles → Create

> The Loan Officer role must exist before creating user john.doe and before configuring the Credit Committee rule.

### Steps

1. Navigate to `http://localhost:4200/#/configuration`
2. Click **Roles** in the configuration grid
3. Click **Create**
4. Fill:
   - **Name:** `Loan Officer`
   - Enable permissions: Profiles (read/write), Loan Applications (read/write), Loans (read/write)
5. Click **Save**

**Expected:**
- `Loan Officer` row appears in the Roles list
- Role is available in the Role dropdown when creating users
- Role is available when adding Credit Committee rules

---

## Scenario 3 — Create Branch

**Route:** `#/configuration` → Branches → Create

### Steps

1. Navigate to `http://localhost:4200/#/configuration`
2. Click **Branches** in the configuration grid
3. Click **Create** (top-right green button)
4. Fill the form:
   - **Name:** `Nairobi Branch`
5. Click **Save**

**Expected:**
- Maker/Checker auto-approves (Administrator has CHECKER permissions)
- Redirects to the Branches list
- `Nairobi Branch` row appears in the table

---

## Scenario 4 — Create Loan Product

**Route:** `#/configuration` → Loan Products → Create

### Steps

1. Navigate to `http://localhost:4200/#/configuration`
2. Click **Loan Products** in the configuration grid
3. Click **Create** (top-right green button)
4. Fill the form:
   - **Active Product:** `Active` _(status dropdown — keep default ACTIVE)_
   - **Name:** `Standard Micro Loan`
   - **Code:** `SML-001`
   - **Availability:** tick **Person Profile** checkbox _(also tick Company Profile if needed)_
   - **Schedule Type:** `Annuity` _(lookup — select from list; Annuity = equal instalments)_
   - **Schedule Based Type:** `BY_INSTALLMENT` _(required lookup — drives whether maturity is # of instalments or a date)_
   - **Currency:** `USD` _(lookup — search and select)_
   - **Interest Rate Min:** `12` · **Interest Rate Max:** `24`
   - **Amount Min:** `500` · **Amount Max:** `50000`
   - **Number of Instalments Min:** `3` · **Number of Instalments Max:** `60` _(visible when Schedule Based Type = BY\_INSTALLMENT)_
   - **Grace Period Min:** `0` · **Grace Period Max:** `0`
   - **Has Payees:** leave unchecked
   - **Penalties:** leave empty
   - **Entry Fees:** leave empty
5. Click **Save**

**Expected:**
- Toast: _"Saved successfully"_
- Redirects to Loan Products list
- `Standard Micro Loan` row appears in the table with code `SML-001`

---

## Scenario 5 — Create User john.doe (Loan Officer)

**Route:** `#/configuration` → Users → Create

> john.doe must have the Loan Officer role to be eligible to vote in the Credit Committee.

### Steps

1. Navigate to `http://localhost:4200/#/configuration`
2. Click **Users**
3. Click **Create**
4. Fill:
   - **Active User:** `Active` _(status dropdown — keep default ACTIVE)_
   - **First name:** `John`
   - **Last name:** `Doe`
   - **Username:** `john.doe`
   - **Branch:** `Nairobi Branch` _(lookup — search and select)_
   - **Password:** `admin`
   - **Confirm Password:** `admin`
   - **Role:** `Loan Officer` _(select dropdown)_
   - **Email:** `john.doe@opencbs.com`
   - **Phone Number:** `+254 700 000100`
5. Click **Save**

**Expected:**
- Maker/Checker auto-approves (Administrator has CHECKER permissions)
- `john.doe` row appears in the Users list with role `Loan Officer`

### 2a — Reset john.doe Password via Edit Form

If john.doe already exists but the password is unknown:

1. Navigate to `http://localhost:4200/#/configuration/users`
2. Click on the **john.doe** row to open the edit form
3. Scroll to the **New Password (leave blank to keep current)** field
4. Type `admin`
5. Click **Save**

**Expected:**
- Maker/Checker triggers and auto-approves
- Login with `john.doe` / `admin` succeeds

---

## Scenario 6 — Configure Credit Committee Rule

**Route:** `#/configuration` → Credit Committee

> Required so loan applications go through a voting step before disbursement.

### Steps

1. Navigate to `http://localhost:4200/#/configuration`
2. Click **Credit Committee**
3. Click **Add Rule** (or **Create**)
4. Fill:
   - **Limit:** `100000`
   - **Roles:** select `Loan Officer`
5. Click **Save**

**Expected:**
- Rule row appears: Limit = 100,000 · Roles = Loan Officer
- Any loan application ≤ 100,000 will require a Loan Officer vote before disbursement

---

## Scenario 7 — Create Person Profile

**Route:** `#/profiles` → Create → Person

### Steps

1. Navigate to `http://localhost:4200/#/profiles`
2. Click **Create** button (top-right)
3. A dropdown appears — select **Person**
4. Fill the profile form:
   - **First name:** `Alice`
   - **Last name:** `Wanjiru`
   - **Date of birth:** `1990-05-15`
   - **Gender:** `Female`
   - **Branch:** `Nairobi Branch`
5. Click **Save**

**Expected:**
- Maker/Checker auto-approves
- Redirects to `#/profiles/people/{id}/info`
- Page header: **Alice Wanjiru** with status badge **LIVE**
- Breadcrumb: `Profiles > Alice Wanjiru > Information`

---

## Scenario 8 — Create Loan Application

**Route:** `#/profiles/people/1/info` → Loan Applications → Create

### Steps

1. Navigate to `http://localhost:4200/#/profiles/people/1/info`
2. Click **Loan applications** in the left sidebar tab list
3. Click **Create** (top-right green button)
4. Fill the application form:
   - **Profile:** `Alice Wanjiru` _(pre-filled, read-only)_
   - **Credit Line:** leave blank
   - **Loan product:** click the dropdown → search → select `Standard Micro Loan`
   - **Currency:** `USD` _(lookup — auto-populated from product; confirm it shows USD)_
   - **Schedule Type:** `Annuity` _(dropdown — auto-filled from product; keep as-is)_
   - **Schedule Based Type:** `BY_INSTALLMENT` _(read-only, derived from product)_
   - **Net Amount:** `10000`
   - **Interest Rate:** `18` _(within product range 12–24)_
   - **Grace Period:** `0`
   - **Number of Instalments:** `12` _(within product range 3–60)_
   - **Disbursement Date:** `2026-05-19`
   - **Preferred Repayment Date:** `2026-06-19`
   - **Loan Officer:** `Administrator` _(lookup — search and select)_
5. Click **Save**

**Expected:**
- Maker/Checker triggers and auto-approves (Administrator is Checker)
- Redirects to `#/loan-applications/{id}/info`
- Breadcrumb: `Alice Wanjiru > Loan applications > DEFAULT BRANCH/26/SML-001/00001/00001`
- Status badge: **IN PROGRESS**
- Schedule tab shows 12 annuity rows of ~916.99/month

---

## Scenario 9 — Submit Loan Application

**Route:** `#/loan-applications/{id}/info`

### Steps

1. Navigate to the loan application info page
2. Locate the **Submit** button in the top-right action bar
3. Click **Submit**
4. Confirmation dialog: _"Are you sure you want to submit the loan application?"_
5. Click **Confirm**

**Expected:**
- Dialog closes
- Status badge changes: **IN PROGRESS** → **PENDING**
- Activity log at the bottom shows:
  - _"State was changed From IN PROGRESS To PENDING"_
  - Changed by: Administrator, Time: current timestamp
- The **Credit committee** tab in the left sidebar becomes active

---

## Scenario 10 — Credit Committee Vote (Approve)

**Route:** `#/loan-applications/{id}/credit-committee`

> ⚠️ **Must be logged in as `john.doe` (Loan Officer).** The CC rule requires the Loan Officer role. Administrator's role name does not match the CC member role — the Approve/Rejected/Refer buttons only appear for users whose role matches the CC rule.

### Steps

#### 10a — Switch to john.doe account

1. Click the **Username** button in the top-right corner of the nav bar
2. Click **Logout** — redirects to `#/login`
3. Enter credentials:
   - **Username:** `john.doe`
   - **Password:** `admin`
4. Click **Login**
5. Dashboard loads — top-right confirms you are logged in as John Doe

#### 10b — Navigate to the loan application

1. Click **Profiles** in the top navigation bar
2. Click on **Alice Wanjiru** in the profiles list
3. Click the **Loan applications** tab in the left sidebar
4. Click on the application row (code: `DEFAULT BRANCH/26/SML-001/00001/00001`)
5. On the application page, click the **Credit committee** tab (left sidebar)

#### 10c — Cast the Approve vote

1. The credit committee table shows one row:
   - **Role:** `LOAN OFFICER`
   - **Changed by:** `John Doe`
   - **Options:** `Approve` · `Rejected` · `Refer` buttons
2. Click the **Approve** button (green)
3. A modal dialog appears:
   - An **Add notes** textarea (optional)
   - **Cancel** and **Confirm** buttons
4. Optionally type a note; click **Confirm**

**Expected:**
- Dialog closes
- Activity log new entry: _"State was changed From PENDING To APPROVED"_, Changed by: John Doe
- Status badge in the page header changes to **Approved**
- **Disburse** button appears in the top-right action bar (green, with icon)

---

## Scenario 11 — Disburse Loan

**Route:** `#/loan-applications/{id}/credit-committee` (status: Approved)

> Can be done while still logged in as john.doe.

### Steps

1. On the credit committee page (status **Approved**), locate the **Disburse** button (top-right, green)
2. Click **Disburse**
3. Confirmation dialog: _"Are sure you want to disburse the loan application?"_
4. Click **Confirm**

**Expected:**
- Dialog closes
- Status badge changes to **DISBURSED**
- Progress bar / stepper at the top shows all stages complete
- Activity log: _"State was changed From APPROVED To DISBURSED"_
- A new active loan is created with code **BL00001**, status **ACTIVE**

---

## Scenario 12 — Verify Active Loan

**Route:** `#/profiles/people/1/loans`

### Steps

1. Navigate to Alice Wanjiru's profile: `http://localhost:4200/#/profiles/people/1/info`
2. Click the **Loans** tab in the left sidebar
3. The loans list shows one row:
   - Code: `BL00001` · Product: `Standard Micro Loan` · Amount: `10,000.00` · Rate: `18%` · Status: **ACTIVE**
4. Click the **BL00001** row

**Expected (loan info page `#/loans/1/person/info`):**
- Page header: **BL00001 Active**
- Balance summary bar:
  - Settlement balance: `10,000.00`
  - Arrears: `0`
  - OLB: `10,000.00`
  - Penalty: `0`
- Details section:
  - Profile: Alice Wanjiru
  - Amount: 10,000.00 · Interest rate: 18 · Installments: 12
  - Disbursement date: 2026-05-19 · First repayment date: 2026-06-19

---

## Scenario 13 — Make a Repayment

**Route:** `#/loans/{id}/person/operations` → Repayment

### Steps

1. On the loan page (`#/loans/1/person/info`), click the **Operations** tab (left sidebar)
2. The operations tile grid loads:
   - Other fees · Reschedule · **Repayment** · Write off · Actualize loan · Provisioning · Reassign loan
3. Click the **Repayment** tile
4. The repayment form loads at `#/loans/1/person/schedule/repayment`

#### Fill the repayment form

5. **Payment method** — click the **Select** dropdown (placeholder text: "Select")
   - A listbox appears: `Cash`, `Bank Transfer`, `Mobile Money`
   - Click **Cash**
   - Dropdown closes; field shows `Cash ×` pill
6. **Total** field — click the numeric input, clear it, type `916.99`
   - (916.99 = first annuity installment: 10,000 @ 18% / 12 months)
   - The schedule preview table below highlights **row 1** (2026-05-19) in green
7. Click **PREVIEW** button (above the schedule table)
   - Server recalculates distribution — row 1 updates:
     - Principal Paid: `916.99` · Interest Paid: `0.00` · Total: `0.00`
   - No error toasts appear
8. Click the **Repay** button (top-right, now active green)
9. Confirmation dialog: _"Are you sure you want to repay?"_
10. Click **Confirm**

**Expected:**
- Toast: _"You have successfully repaid."_
- Redirects to `#/loans/1/schedule/info`
- Page header: **BL00001 Active**
- Balance summary bar updates:
  - Settlement balance: **9,083.01** (was 10,000.00)
  - OLB: **9,083.01** (was 10,000.00)
  - Arrears: `0`

---

## Scenario 14 — Verify Repayment in Schedule

**Route:** `#/loans/{id}/person/schedule`

### Steps

1. Click the **Schedule** tab in the left sidebar on the loan page

**Expected (after first repayment):**
- Row 1 (2026-05-19): Principal Paid = `916.99` — row highlighted green (PAID)
- Row 2 (2026-06-19): unpaid — next installment due
- Rows 3–13: unpaid — future annuity installments ~916.99 each

---

## Scenario 15 — Verify Loan Events

**Route:** `#/loans/{id}/person/events`

### Steps

1. Click the **Events** tab on the loan page

**Expected (newest first):**
- Repayment event: amount `916.99`, type REPAYMENT, date `2026-05-19`
- Disbursement event: amount `10,000.00`, type DISBURSEMENT, date `2026-05-19`

---

## Scenario 16 — Maker/Checker Queue Verification

**Route:** `#/requests`

> Administrator has both MAKER and CHECKER permissions, so any action performed as Administrator is auto-approved and does not require a second approver.

### Steps — View processed requests

1. Navigate to `http://localhost:4200/#/requests`
2. The table shows processed requests

**Expected:**
- Loan application creation request — status **APPROVED** (auto)
- User edit (john.doe password change) — status **APPROVED** (auto)

### Manual Checker Approval Flow (john.doe as Maker)

1. Log in as `john.doe` and create or edit any entity (profile, loan application, etc.)
2. Switch to `Administrator` account
3. Navigate to `#/requests`
4. Click the **PENDING** request row
5. Click **Approve** → confirm in dialog

**Expected:**
- Request status: **PENDING** → **APPROVED**
- The underlying entity is created/updated in the system

---

## Full Loan Flow — Quick Reference

```
LOGIN  →  Administrator / admin
    │
    ▼
[#/configuration → Payment Methods]
    Create:  Cash
    Create:  Bank Transfer
    Create:  Mobile Money
    │
    ▼
[#/configuration → Roles]
    Create:  Loan Officer  (Profiles + Loan Applications + Loans permissions)
    │
    ▼
[#/configuration → Branches]
    Create:  Nairobi Branch
    Click Save  →  auto-approved, appears in Branches list
    │
    ▼
[#/configuration → Loan Products]
    Create:  Standard Micro Loan, SML-001, USD, 500–50000, 12–24% (default 18%), 3–60 months, Annuity
    Click Save  →  appears in list
    │
    ▼
[#/configuration → Credit Committee]
    Add Rule:  Limit = 100000, Roles = Loan Officer
    Click Save  →  rule appears in table
    │
    ▼
[#/configuration → Users]
    Create:  john.doe, Role = Loan Officer, Branch = Nairobi Branch, Password = admin
    Click Save  →  auto-approved, appears in users list
    │
    ▼
[#/profiles → Create → Person]
    Alice Wanjiru, DOB = 1990-05-15, Branch = Nairobi Branch
    Click Save  →  auto-approved, redirects to profile info
    Status badge:  LIVE
    │
    ▼
[#/profiles/people/1 → Loan applications → Create]
    Product = Standard Micro Loan
    Amount = 10000, Rate = 18%, Installments = 12
    Disbursement date = 2026-05-19, First repayment = 2026-06-19
    Click Save  →  auto-approved by Administrator (Maker/Checker)
    Status badge:  IN PROGRESS
    │
    ▼
[#/loan-applications/1/info]
    Click SUBMIT  →  Confirm
    Status badge:  PENDING
    Activity log:  "IN PROGRESS → PENDING" by Administrator
    │
    ▼
LOGOUT  →  LOGIN as john.doe / admin
    │
    ▼
[#/loan-applications/1/credit-committee]
    Table row:  LOAN OFFICER · John Doe · Approve / Rejected / Refer
    Click APPROVE  →  Confirm
    Status badge:  Approved
    Activity log:  "PENDING → APPROVED" by John Doe
    Disburse button appears (top-right)
    │
    ▼
[#/loan-applications/1/credit-committee]
    Click DISBURSE  →  Confirm
    Status badge:  DISBURSED
    Activity log:  "APPROVED → DISBURSED"
    Loan BL00001 created  →  Status: ACTIVE
    │
    ▼
[#/profiles/people/1/loans → BL00001 → Operations → Repayment]
    Payment method:  Cash
    Total:  916.99
    Click PREVIEW  →  row 1 highlighted green, Principal Paid = 916.99
    Click REPAY  →  Confirm
    Toast:  "You have successfully repaid."
    OLB:  10,000.00  →  9,083.01
    │
    ▼
[#/loans/1/person/schedule]
    Row 1 (2026-05-19):  PAID (green highlight)
    Remaining 11 rows:  unpaid
    │
    ▼
DONE ✅
```

---

## Known Issues

| Issue | Route | Root Cause | Workaround |
|-------|-------|-----------|------------|
| Loan Dashboard 500 error | `#/loans/{id}/person/loan-dashboard` | `JasperReportService.getReport()` NullPointerException — no Jasper template configured for the loan dashboard widget | Skip the Loan Dashboard tab; use Info / Schedule / Operations tabs instead |
| Administrator cannot vote in Credit Committee | `#/loan-applications/{id}/credit-committee` | `isCurrentUserAbleToChangeStatus()` checks `ccMember.role.name === currentUser.role`. Administrator's role is "Administrator", not "Loan Officer" — so Approve/Rejected/Refer buttons are hidden | Log in as `john.doe` (Loan Officer) to vote |
| Repayment "Invalid date" toast on initial load | `#/loans/{id}/person/schedule/repayment` | Angular date picker sends an invalid format string before the user interacts with the date field | Click **PREVIEW** after setting the Total amount. If the error toast appears, close it and click PREVIEW again — the second call succeeds |
| Password field missing on user edit | `#/configuration/users/{id}/edit` | The "New Password" field was added as a fix this session; may require a fresh Angular cache | Hard-refresh the app (Ctrl+Shift+R) if the field is not visible |
