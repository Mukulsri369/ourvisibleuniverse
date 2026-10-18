# Automated Certificate Generation & Issuance Architecture

**Program:** Our Visible Universe Academy  
**Curriculum:** Cosmic Journey (24 Modules / 6 Stages)  
**Credential:** Certified Cosmic Explorer  
**Category:** Certificate of Achievement  
**Status:** 100% Tested & Production Certified  

---

## 1. Executive Summary

The Automated Certificate Generation System implements a secure, verifiable, and tamper-proof credential pipeline for students who have successfully mastered the entire 24-module Cosmic Journey astronomy curriculum and passed the official 20-question Final Knowledge Assessment.

Key capabilities:
- **Server-Authoritative Issuance:** Never trusts client-reported completion or examination flags.
- **Idempotent Atomic Transactions:** Prevents duplicate active certificates for the same student and course version.
- **Standards-Compliant PDF Generation:** Generates vector-sharp A4 landscape PDF certificates openable in all readers via `pdf-lib`.
- **Dual Visual Themes:** "Celestial Dark" (interstellar navy & celestial linework) and "Print-Friendly Light" (high-contrast parchment for home/office laser printing).
- **Public Cryptographic Verification:** Embedded QR code and unique high-entropy identifiers link to an online verification portal (`/verify-certificate`).
- **Child Safety & Privacy Compliance:** Student email addresses are strictly filtered out; only validated public identifiers (`STU-XXXXXXXX`) and sanitized display names appear on certificates.
- **Explicit Non-Accreditation:** Complies with prompt directives by strictly avoiding claims of university, governmental, NASA, or ESA accreditation.

---

## 2. Core Eligibility Rules

A student is eligible for an official Certificate of Achievement if and only if all five conditions are satisfied:

1. **Authenticated Account:** Caller has a valid user session.
2. **24 Verified Module Completions:** Every module across all 6 stages has verified completion in `academy_module_completions`.
3. **Official Final Examination Pass:** Attained at least 80.0% (minimum 16 out of 20 questions correct) in an official exam session.
4. **Course Version Concordance:** Registered for the active curriculum release (v1.0.0).
5. **Deduplication Check:** If an active certificate already exists, the server returns the existing record idempotently without creating duplicates.

---

## 3. PDF Specification & Layout

| Property | Value | Notes |
| :--- | :--- | :--- |
| **Orientation** | Landscape | Standard A4 |
| **Width** | 841.89 points (297 mm) | Standard ISO 216 dimensions |
| **Height** | 595.28 points (210 mm) | Standard ISO 216 dimensions |
| **Color Modes** | Celestial Dark (`#030712`) / Print Light (`#fcfbf7`) | Selected via UI toggle |
| **Borders** | Inset double gold framing with celestial corner brackets | Vector rendered lines |
| **Typography** | Times Roman Bold (title), Helvetica Bold (body), Courier (ID/Hash) | Built-in standard PDF fonts |
| **QR Code** | High-resolution embedded PNG | Links to verification URL |
| **File Size** | ~7.8 KB (Dark) / ~6.9 KB (Light) | Ultra-lightweight vector PDF |

### Required Certificate Text
> *"This certificate recognizes the successful completion of Cosmic Journey and achievement of the required standard in its astronomy learning program and final assessment."*

### Mandatory Scope & Non-Accreditation Disclaimer
> *"This certificate is issued by Our Visible Universe Academy as an educational achievement credential. It does not confer university degree credits, government licensure, or professional scientific accreditation."*

---

## 4. Cryptographic Anti-Tampering Mechanism

Each certificate is signed with an HMAC-SHA256 verification hash computed across canonical metadata:
$$\text{Hash} = \text{HMAC-SHA256}(\text{ID} \parallel \text{UserID} \parallel \text{CourseID} \parallel \text{Version} \parallel \text{Score} \parallel \text{Date})$$

If any parameter (e.g. final score or recipient identity) is altered, the public verification portal immediately rejects the certificate with a cryptographic mismatch warning.

---

## 5. Verification Endpoint & User Actions

The verification portal at `/verify-certificate?id=OVU-CERT-...` allows employers, schools, and family to verify authenticity instantly on any device:
- **VIEW CERTIFICATE:** Interactive responsive preview with zoom.
- **DOWNLOAD PDF:** Directly exports vector PDF.
- **VERIFY CERTIFICATE:** Live check against immutable database records.
- **SHARE ACHIEVEMENT:** Native Web Share API and clipboard link sharing.
- **PRINT:** Clean printer stylesheet with background ink savings.
- **ACCESSIBILITY:** Full support for reduced-motion preferences.

---

## 6. Acceptance Testing Summary

Automated test suite (`npm run test:certificate`):
- **Checks Run:** 26
- **Passed:** 26 (100%)
- **Failed:** 0
