# Paid access and checkout

## What will be built

- Keep the existing passes already added to payments:
  - 30 days — ₹179
  - 180 days — ₹799
  - 365 days — ₹1,399
- Replace the immediate 3D launch at `/` with a public, mobile-friendly website introducing Our Visible Universe, its scientific content, pricing, FAQs, policies, and contact details.
- Move the interactive experience to `/universe` and require active paid access before it loads.
- Add Google and email sign-in without collecting extra profile information.
- Add an embedded checkout so visitors pay without being sent to a separate checkout website.
- Add an account page showing the active pass, access expiry date, and remaining days.
- Add separate public pages for About, Features, Scientific Content, Pricing, FAQ, Contact, Privacy, Terms, and Refund Policy, each with search-friendly metadata.

## Purchase rules

- Access begins immediately after confirmed payment.
- A repeat purchase extends access from the later of now or the current expiry date.
- Passes do not auto-renew and cannot be upgraded or downgraded.
- There is nothing to cancel; access lasts until its expiry date.
- Activated purchases are non-refundable except where required by law or for duplicate/incorrect charges.
- Expired or unpaid accounts cannot open `/universe`.

## Secure payment confirmation

- Create a private access-pass record for each confirmed payment.
- Validate payment notifications before activating or extending access.
- Make repeat notifications safe so the same payment cannot grant access twice.
- Use the signed-in customer identity from the server, never a customer ID supplied by the browser.
- Configure tax calculation and collection at checkout. Because the seller is in India, filing and remittance remain the seller's responsibility.

## Completion checks

- Test sign-up, sign-in, sign-out, checkout, successful access activation, repeat-purchase extension, expiry blocking, and mobile layouts.
- Confirm the public pages load without signing in and the 3D universe never renders before access is verified.
- Leave live payouts pending until the seller completes identity, PAN/tax, address, and Indian bank verification in the Payments area.
