# Owner acceptance: Live staging payments

Staging: https://ovu-supabase-staging.mukul-srivastava-025.workers.dev
Owned database: `pdvwkdggyyrfkoqrpbji`. Application commit `73344ef`; enabled deployment `7714f66b-0a87-4d6d-ac22-2569fc0cd0f0`.

This staging application now uses the original **Live** Razorpay merchant credentials. Completing checkout charges real money. No transaction has been initiated by the migration agent. The original website remains live; production cutover has not occurred.

## Ready and verified

- Both website approvals; exact enabled webhook URL; four required events; secret provided during setup.
- Correct Live server mode, explicit checkout-enable flag, owned database and all five server-private bindings.
- Private merchant-key identity match and local read-only API authentication (no returned customer records/provider writes).
- Automated ownership, signature, amount/currency, concurrency, refund-allocation and restart checks as detailed in the payment report.
- Hosted signed synthetic-event acceptance/deduplication/cleanup, invalid-signature/wrong-mode denial and privacy/page checks. These do not prove provider-origin event delivery or a real purchase.

## Owner workflow

1. Sign in using an account you control. Existing paid accounts should retain their imported periods. Administrator status does not itself grant a paid pass; the separate Razorpay reviewer account has no paid pass or admin authority.
2. Inspect the account, pricing and intended plan/currency. If you choose to exercise Live checkout, complete it yourself privately. Keep all passwords, OTPs, payment details and private provider links out of chat.
3. After payment, check Account for the expected active period and open the paid Universe. Sign out/in and verify persistence. Existing valid paid time should be extended according to the preserved stacking rules, not replaced by a fresh shorter period.
4. If checkout was interrupted or confirmation is pending, use Account → Interrupted checkout → Check payment status before paying again. Recovery must verify a captured payment on the server.
5. Confirm the actual Razorpay payment is captured and inspect webhook delivery for a successful response. Reconcile the actual stored order, owner, amount/currency, transaction, deduplicated event and access pass. Browser success alone is insufficient evidence. Provider webhooks and cumulative refunds remain financially unverified until exercised with authentic events.

Do not issue a refund, rotate keys, change original payment settings or grant/revoke customer access as part of routine testing. Actual refund testing requires separate approval and owner action. Report any error without credentials; private transaction inspection can then be scoped to the affected order.

## Checkout hold / rollback

To stop creation of new payable orders while keeping verification, recovery and webhook processing operational, prepare and deploy the held Live configuration:

```powershell
node scripts/prepare-live-payment-config.mjs --prepare-only --website-approved
node node_modules/wrangler/bin/wrangler.js deploy --config dist/server/wrangler.staging-live.json
```

Use the existing private deployment wrapper and verify `RAZORPAY_LIVE_CHECKOUT_ENABLED=false` remotely. Do not switch to Test mode or roll back to an incompatible old webhook handler after real payments. Preserve every payment/audit row; never restore a stale database snapshot or drop the ledger to undo a code/configuration deployment. Do not change DNS or disable/delete merchant webhooks without approval.

## Still outstanding

- Actual owner checkout/capture/access/provider-webhook acceptance; real refund processing.
- Deferred Gemini credentials/provider features and actual email recovery delivery/human completion.
- Wider workflow acceptance and sustained Workers capacity.
- Historical financial-ledger reconciliation and final synchronization of old-site writes after the 5 November snapshot before approved cutover.
- Removal of the temporary reviewer login after its review purpose ends, with explicit scope and retention review.

No production DNS switch, hosting purchase, Store migration or Lovable cancellation is implied by this handoff.