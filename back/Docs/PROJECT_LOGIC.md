# Charity Project — Logic Document (ساختار پروژه)

This document explains how the entire project works in plain language. No code — just logic.
If you want to know "who does what" and "where the money goes", read this.

---

## Roles (نقش‌ها)

| Role | English | What they do |
|------|---------|--------------|
| **Admin** | مدیر | Approves users, manages wallets, adjusts balances (in-person cash), views all reports |
| **Benefactor / خیر** | Donor | Charges wallet (online or via admin), pledges money to financial needs, donates to campaigns |
| **Patient / بیمار** | Patient | Gets registered, creates consultation/service requests for themselves, views their needs status |
| **Health Assistant / سلامتیار** | HA | Introduces patients, creates financial/consultation/service requests on behalf of their patients, closes/cancels financial needs |
| **Doctor / پزشک** | Doctor | Handles consultation requests, creates financial requests for patients they treat, closes/cancels financial needs |
| **Charity Center / مرکز نیکوکاری** | Center | Organization-level signup, schedule management |
| **Health Center / مرکز درمانی** | Health Center | Static management dashboard |

---

## Money Lifecycle (چرخه پول)

### Step 1: Top-up (شارژ کیف پول)

Two ways:

1. **Online (Zarinpal):** Benefactor enters amount → redirected to Zarinpal payment gateway → pays → redirected back → wallet credited.
2. **In-person (admin):** Benefactor visits the admin, hands over cash → admin uses the "Adjust Balance" tool in the admin panel to credit their wallet.

### Step 2: Pledge (تعهد پرداخت)

A health-assistant or doctor creates a **financial request** for a patient (e.g., "Surgery — 5,000,000 tomans needed").
A benefactor sees this in their "Open Financial Needs" list and clicks **"Pay from Wallet"**, choosing how much to pay.

**The money enters a "held" (معلق) state:**
- It leaves the benefactor's **available** balance
- It sits in the benefactor's **held balance** (visible in the wallet)
- It is **not yet sent anywhere** — the benefactor can see it's reserved
- Multiple benefactors can pledge toward the same need (partial payments)

### Step 3a: Confirm / Complete (تأیید انجام شد)

The health-assistant or doctor who created the request clicks **"Confirm Done"**.
→ All held money on that request is **released**: transferred from benefactors' held balances to the **platform wallet**.
→ The charity organization then uses that money to actually fulfill the need (buy medicine, pay hospital bill, etc.).
→ The request status becomes **"completed"**.

### Step 3b: Cancel / Refund (لغو و بازگرداند)

The health-assistant or doctor clicks **"Cancel and Refund"**.
→ All held money returns to each benefactor's **available balance** (free to spend again).
→ The request status becomes **"cancelled"**.

### Summary diagram

```
Benefactor Wallet (available)    Benefactor Wallet (held)    Platform Wallet    Org fulfills need
                                                                   ↑
    top-up ↑                     pledge ↓                      ↑ release
                                 ┌──────────┐                  │
    [cash]  ──────────────────→  │  HELD    │ ── complete ──→  │
                                 │ (معلق)   │                  │
                                 └──────────┘                  │
                                      │                        │
                                      │ cancel                 │
                                      ↓ refund                 │
                              [available again]                │
```

---

## Request Lifecycle (چرخه درخواست‌ها)

### Consultation Request (مشاوره پزشکی)
1. Patient or HA or Doctor creates it → status: **pending**
2. A matching-specialty doctor sees it in their "Incoming" tab
3. Doctor clicks **Accept** → status: **accepted**
4. Doctor clicks **Start** → status: **in_progress**
5. Doctor clicks **Complete** → status: **completed**
Doctor can also **Reject** → status: **rejected**

### Service Request (دریافت خدمات)
1. Patient or HA creates it → status: **pending** (awaiting admin/org handling)

### Financial Request (حمایت مالی)
1. **HA or Doctor** creates it for a patient → status: **pending**, with `amount_needed`
2. Benefactors see it, pledge money → status becomes **in_progress**, `collected_amount` rises
3. When enough is collected (or earlier), the HA/Doctor who submitted:
   - Clicks **Complete** → status: **completed**, money released to platform
   - Clicks **Cancel** → status: **cancelled**, money refunded to benefactors

**Important:** Patients can NOT create financial requests. They only see them (read-only) in the "My Financial Needs" tab.

---

## Key Terms (واژه‌نامه)

| Term | Meaning |
|------|---------|
| **Balance / موجودی** | Free money in wallet — can be pledged, withdrawn, or spent |
| **Held Balance / موجودی معلق** | Money pledged to a financial need but not yet finalized — not spendable |
| **Pledge / تعهد** | The act of a benefactor reserving money toward a financial need |
| **Hold / نگه‌داشت** | The temporary state of pledged money |
| **Release / آزادسازی** | Finalizing pledged money — transferring it to the platform wallet |
| **Refund / بازگرداند** | Returning pledged money to the benefactor's available balance |
| **Adjustment / تعدیل** | Admin manually credits or debits a wallet (e.g., in-person cash, corrections) |
| **Platform Wallet** | The charity organization's central wallet where released funds go |
| **Collected Amount** | Total pledged money on a financial request (sum of held + released) |
| **Remaining** | `amount_needed - collected_amount` — how much more is needed |

---

## Admin Panel — Wallet Tab

The admin has full control:

- **Adjust Balance**: Manually credit or debit ANY benefactor wallet by user ID + amount + direction + reason. This is equivalent to "depositing in-person cash" or "correcting mistakes."
- **Wallet List**: Searchable list of all benefactor wallets showing available balance + held balance.
- **Gateway Payments**: History of online (Zarinpal) top-ups.
- **Pledges (DonationHold)**: All pledges across all requests — view held/released/refunded status for audit.

---

## Common Questions

**Q: Who pays money?**
Only the benefactor. They either top up online (Zarinpal) or give cash to the admin who credits their wallet.

**Q: Does the patient receive money?**
No. The patient never holds a balance. Pledged money goes to the platform wallet when a need is completed, and the organization fulfills the need.

**Q: Can a benefactor only pay the full amount?**
No. They can pay any partial amount. Multiple benefactors can fund the same need.

**Q: What happens if a need is cancelled after people pledged?**
All pledged money returns to each benefactor's available balance automatically.

**Q: Who can close/cancel a financial request?**
Only the original submitter — the health-assistant or doctor who created it. The benefactor cannot close it.

---

*Last updated: July 2026*
