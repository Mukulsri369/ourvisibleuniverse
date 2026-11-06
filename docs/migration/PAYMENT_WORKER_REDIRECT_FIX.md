# Cloudflare payment initialization fix — 6 November 2026

The owner reported the Pay ₹179 action returned the generic checkout-unavailable message after the Live flag was enabled. A scoped production trace reproduced a TypeError before any provider request: Workers rejects Fetch redirect mode error. Earlier configuration and HTTP checks did not exercise authenticated order creation.

The Razorpay server adapter now uses manual redirects. Its existing non-2xx rejection remains in place, so redirect responses fail without following a new origin or forwarding merchant authorization. No pricing, signature verification, order ownership, atomic entitlement, refund or authentication rule changed.

Regression coverage exercises a successful response and rejects 301/302/303/307/308 with exactly one fetch per request. The scoped payment suite passed 32 tests, zero failures/skips. TypeScript and production client/Worker builds passed. Deployment and actual initialized-checkout outcome are recorded in the final update below; no paid transaction has been performed by the agent.

Runtime evidence is private outside Git. Reference: [Cloudflare Request redirect behavior](https://developers.cloudflare.com/workers/runtime-apis/request/).

## Verified payment initialization fix — 6 November 2026

Version d11ae3b4-01dc-4ee9-8813-d398cae5c94c fixes a reproduced Cloudflare-specific Fetch redirect error in the Razorpay adapter. Workers does not support redirect error; manual mode now stops redirects and the existing non-2xx rejection fails safely. Thirty-two payment/security tests, TypeScript and production client/Worker builds passed. Deployed Live checkout remains enabled with the same five secret bindings.

Actual signed-in production browser verification: Pay ₹179 successfully opens Razorpay's contact-details/payment dialog. Exactly one new unpaid Live order was registered (14 Live orders total); transactions remain 1. No charge, refund or entitlement activation was performed. A completed payment and authentic webhook-driven access activation remain unverified. Earlier generic-unavailability status is resolved for order initialization. Details and provider documentation: PAYMENT_WORKER_REDIRECT_FIX.md.

