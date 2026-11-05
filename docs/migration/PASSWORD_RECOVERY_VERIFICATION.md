# OVU password recovery — 5 November 2026

The existing sign-in screen now links to `/auth-reset`. Supabase's established PKCE recovery flow requests email links back to that route; it is covered by the already approved local and staging `/auth**` redirects. No authentication settings were expanded. Signup confirmation now also returns through the approved `/auth` callback, carrying a sanitized local destination instead of an unapproved Academy/checkout callback.

The recovery screen verifies the current identity with Supabase, names the account being updated, and accepts matching passwords. It also supports an already authenticated account changing its own password through the ordinary Auth API. Missing sessions show the email request form. Explicit invalid/expired callback errors show recovery instructions even if an older session exists. Request success uses a generic eligibility message; it does not claim that email was delivered or disclose whether an account exists. Provider/network failures remain errors.

Password updates are pinned to the verified account. The normal public SDK creates an isolated, memory-only client, binds the verified session, revalidates it and calls `updateUser`. It has no service-role authority, persistent storage, automatic refresh or callback parsing. Cross-tab changes invalidate the old form; races cannot redirect its write to the newly signed-in account. Passwords/tokens are never logged, put in URLs or saved by application code. Password managers and paste remain available. Supabase remains responsible for password hashing, server-side policy and recovery-token validation; no custom cryptographic protocol was introduced. Existing eight-character minimum is preserved, with a conservative 72-byte UTF-8 upper bound to avoid bcrypt truncation.

## Verified

- Eight focused recovery tests passed, including account switches before/after token capture, invalid binding/identity rejection, provider failure, confirmation and UTF-8 boundaries.
- The existing auth-navigation checks passed. Combined runtime-independence, MCP and recovery regression: 24 tests passed, none skipped.
- Actual new-project Supabase test passed five checks: recovery token verification, the same application update helper, new-password login/old-password rejection, one-time token replay denial and anonymous update denial. A uniquely marked synthetic account was created and removed; the preceding identity list was preserved. The admin-generated recovery link sent no email. Only the synthetic account's password changed.
- Seven actual-built/staging checks passed, including SSR/no-index for the new route. TypeScript and the Worker build passed after fixing the reset screen's required auth search parameters.
- Browser checks verified authenticated account labeling, expired-link error/request form, and 390×844 mobile layout without horizontal overflow. No password was entered or submitted in the real owner's browser session. Mobile viewport was restored.

## Still unverified

Actual email delivery, spam handling, sender/SMTP setup, email confirmation and a human-completed recovery link/password workflow remain release gates. An API-generated test link is not proof of delivery. Any real new-password entry and submission must be completed privately by the user. Gemini provider sessions and Razorpay provider payments remain explicitly deferred and unverified. No production, customer entitlement, Store, DNS or billing change is part of this work.

Rollback is an application-only staging rollback to the preceding verified Worker version; retain all Supabase privacy/authorization protections and private signing material. No destructive schema changes or customer imports were made.

Official API contracts: [PKCE email recovery](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail), [authenticated user update](https://supabase.com/docs/reference/javascript/auth-updateuser), [server password security and reauthentication](https://supabase.com/docs/guides/auth/password-security).

## Actual staging deployment

Commit `89fc844` deployed as `f655e3f6-66cc-49c2-b2a6-9fc9ec303648`. Both existing private binding names remained present. Hosted recovery and expired-link routes, Academy and certificate verification returned HTTP 200 with no-index headers. Browser expired-link/request UI and actual 390×844 layout passed without email or credential submission. Earlier full Academy/MCP hosted QA remains recorded at its original version.

## Additional anonymous browser QA

The actual built application was opened at the separate localhost origin, without the signed-in 127.0.0.1 or staging session. Module 13 practice accepted four answers and displayed 100% (4/4), explicitly describing practice as non-certifying. Its official assessment control requested a student account, and the verified checklist remained incomplete with no official attempt. Local exploration/navigation progress is not canonical certified completion. The anonymous sign-in screen displayed Forgot password; following it displayed the labeled email-request form. No email or password was submitted. The hosted owner still showed the same public student ID and CLOUD SYNC after the deployment. These are sampled browser checks, not a complete offline/network-fault matrix.
