# Seven-day gift to the existing 82 OVU accounts

Owner authorization: give all 82 current accounts one week of free Universe access. Scope is the fixed existing cohort, not future signups, and no notification emails were authorized or sent.

Applied 6 November 2026 at 12:00:47 UTC (5:30:47 PM IST) to owned Supabase only. All 82 received one seven-day Live administrative gift: 74 newly active accounts expire 13 November 2026 at 12:00:47 UTC; eight already-active users received seven days beyond their current expiry. Existing paid periods were preserved, with no charges, refunds, roles, identity verification or payment-record changes. The promotional entitlement uses the existing Universe/Academy access gate; it does not award certificates or complete assessments.

Migration 0013 permits seven-day access only for an administrative session reference and the explicit admin_grant_7_days plan identifier. Purchasable plans, payment_orders duration constraints and paid-capture function validation remain limited to 30/180/365 days. No public grant endpoint or privilege was added. The existing admin form retains its prior paid-duration choices; this campaign was a separately authorized, fixed-cohort maintenance transaction.

An encrypted before-state snapshot, exact cohort/request identifiers and SQL journals are retained outside Git. An atomic transaction acquired campaign and per-user locks, appended grants with the existing allocation/parent lineage, and wrote 82 audit rows attributed to the verified existing administrator. Replaying the same request identifiers inside the transaction produced no extra grants. Tests first ran under ROLLBACK; read-only checks confirmed the prior access counts before the committed run.

Committed-run assertions and independent API verification confirmed: 82 distinct gifts/audit records, 168 hours allocated per gift, preserved previous expiry plus seven days where applicable, all nine prior access rows byte-for-byte equivalent as parsed records, and zero duplicates. Payment order/transaction counts stayed unchanged during the transaction. User UUIDs, email addresses, credentials and customer exports are excluded from Git.

Any reversal requires a fresh review of these campaign references and subsequent purchases/refunds; do not restore the old full access table or shorten unrelated purchased entitlements. Preserve audit history and use an explicitly approved compensating action if reversal is requested.
