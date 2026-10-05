# Razorpay checkout and production access

## What will be built
- Restore sign-in before purchase and require an active pass to enter `/universe`.
- Keep the existing one-time plans: ₹179 for 30 days, ₹799 for 180 days, and ₹1,399 for 365 days.
- Add Razorpay Standard Checkout with clear success, cancellation, and failure messages.
- Show each signed-in customer their current pass, expiry date, and remaining days.
- Update pricing, FAQ, privacy, terms, and refund information to reflect the live purchase flow.

## Secure payment flow
- Create Razorpay orders on the server from a selected plan; the browser cannot choose an arbitrary amount or user identity.
- Verify Razorpay's payment signature on the server before activating access.
- Confirm the payment details with Razorpay before granting access, so a forged browser response cannot unlock the universe.
- Reuse the existing idempotent access function so duplicate confirmations cannot grant extra days and repeat purchases extend the current expiry.
- Support separate test and live credentials, with private values stored only in the secure secret store.

## Production readiness
- Use the rotated replacement test credentials for safe testing; never use the exposed secret pasted into chat.
- Keep live payment mode disabled until Razorpay provides active live credentials.
- Verify sign-in redirects, checkout launch, rejected/abandoned payments, successful activation, account expiry, repeat-purchase extension, and blocked unpaid access.
- Preserve all existing 3D universe content and controls.
