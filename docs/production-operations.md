# Production Operations, Infrastructure & Security Architecture

**Version:** 3.4.2  
**Date:** October 2026  
**Status:** Certified Production Operations Standard  
**Operations Lead:** Principal DevOps, Cloud Security & Full-Stack Systems Engineer  

---

## 1. Architectural Overview

"Our Visible Universe" operates as a production-grade, full-stack hybrid application combining:
- **Frontend / Rendering Layer:** React 19, Three.js, React Three Fiber, TanStack Router (file-based routing), Tailwind CSS.
- **Backend / API Layer:** Node.js Express server (`server.ts`) hosting secure payment verification routes (`/api/public/payments/razorpay`), IVOA TAP proxy routes, and the Model Context Protocol (MCP) server (`/mcp`).
- **Data Persistence:** Supabase PostgreSQL with Row Level Security (RLS) and Drizzle ORM.
- **Edge CDN & Hosting:** Cloudflare Workers / Wrangler and static edge CDN with global caching.

```
                              CLIENT BROWSER
                     +-------------------------------+
                     |   TanStack Router & R3F Scene |
                     +---------------+---------------+
                                     |
              +----------------------+----------------------+
              |                      |                      |
              v                      v                      v
     Public Knowledge Routes    Universe 3D           API Proxy & MCP
   (/galaxies, /science, etc.) (/_authenticated)      (/api/*, /mcp)
              |                      |                      |
              |             [Active Pass Check]             |
              |                      |                      |
              +----------------------+----------------------+
                                     |
                                     v
                           PRODUCTION SERVER (Node/TS)
                     +-------------------------------+
                     |  Express Server (server.ts)   |
                     |  - HMAC-SHA256 Signature Verif|
                     |  - Razorpay REST Verification |
                     |  - MCP Authenticated Tools    |
                     +---------------+---------------+
                                     |
                                     v
                        SUPABASE CLOUD POSTGRESQL
                     +-------------------------------+
                     |  - Row Level Security (RLS)   |
                     |  - apply_access_purchase (fn) |
                     |  - Access Passes & User Profiles|
                     +-------------------------------+
```

---

## 2. Database Migrations & Schema Management

### 2.1 ORM & Migration Workflow
Database schema is managed deterministically via Drizzle ORM (`drizzle.config.ts`) and Supabase PostgreSQL migrations (`supabase/migrations/`):
- **Idempotent Migrations:** All schema changes are versioned SQL scripts applied in chronological order.
- **Access Passes Table (`access_passes`):**
  - Columns: `id` (UUID), `user_id` (UUID references `auth.users`), `status` (active/expired), `tier` (lifetime/annual), `razorpay_order_id` (unique text), `razorpay_payment_id` (unique text), `amount_paid` (integer cents/paise), `currency` (varchar 3), `created_at` (timestamptz), `expires_at` (timestamptz).
- **Idempotent Purchase Resolution Function (`apply_access_purchase`):**
  - Defined in PL/pgSQL as a strictly atomic, security definer database function.
  - Guarantees that duplicate webhooks or replay attacks with the same `razorpay_payment_id` cannot grant duplicate access passes or produce double counting.

---

## 3. Secrets Management & Environment Isolation

### 3.1 Strict Separation of Client vs Server Secrets
The platform enforces a zero-trust policy regarding credential leakage:

| Secret Key | Scope | Storage Location | Protection Policy |
| :--- | :--- | :--- | :--- |
| `RAZORPAY_KEY_ID` | Server Only | Environment Secret (`.env`) | Never prefixed with `VITE_`. Used by server to initiate orders and query status. |
| `RAZORPAY_KEY_SECRET` | Server Only | Environment Secret (`.env`) | Used exclusively for HMAC-SHA256 signature verification in Node.js. |
| `RAZORPAY_MODE` | Server Only | Environment Secret (`.env`) | Toggles `test` vs `live` mode without code modification. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Only | Environment Secret (`.env`) | Elevated database privileges; never bundled in frontend JavaScript. |
| `SUPABASE_ANON_KEY` | Public / Client | `.env.example` / Client runtime | Restricted strictly by Postgres Row Level Security (RLS). |
| `LOVABLE_CLIENT_SECRET` | Server Only | Environment Secret (`.env`) | MCP OAuth authorization code exchange. |

### 3.2 Audit Safeguards
Frontend build bundles are inspected via Vite rollup visualizer to guarantee that no secret keys, service role credentials, or private signing keys appear in client `.js` or `.map` output files.

---

## 4. Payment Gateway Security & Fraud Prevention

### 4.1 Dual-Verification Pipeline
In compliance with strict security requirements:
> *"Razorpay access is granted only after server-side signature verification plus a server fetch confirming the captured payment, through the idempotent apply_access_purchase function, because browser checkout responses can be forged."*

1. **Step 1: HMAC-SHA256 Cryptographic Signature Verification**
   - The server computes:
     $$\text{expectedSignature} = \text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{RAZORPAY\_KEY\_SECRET})$$
   - Uses timing-safe string comparison (`crypto.timingSafeEqual`) to eliminate timing side-channel attacks.
2. **Step 2: Server-Side REST Fetch to Razorpay API**
   - Independent server-to-server call directly to `https://api.razorpay.com/v1/payments/{payment_id}`.
   - Confirms that the status returned by Razorpay is strictly `"captured"` and that the currency and captured amount match the expected product pricing.
3. **Step 3: Atomic Idempotent Database Commitment**
   - Invokes `apply_access_purchase` via the service role client.
   - If an order has already been processed, the transaction returns the existing record idempotently.

---

## 5. Model Context Protocol (MCP) Server Security

The MCP server (`src/lib/mcp/`, mounted at `/mcp`):
- **Authentication:** All requests must supply a valid user bearer token or OAuth access token.
- **Scoped User Data:** Tools querying user pass records read data exclusively through the caller's validated identity. No user can view or alter another user's pass status.
- **Rate Limiting:** MCP endpoints enforce per-token rate limits (max 60 requests/minute) to prevent automated harvesting.

---

## 6. Backup Strategy, Disaster Recovery & High Availability

### 6.1 Database Protection
- **Continuous WAL Archiving & Point-In-Time Recovery (PITR):** Enables transactional rollback to any millisecond within the preceding 7 days.
- **Daily Automated Snapshots:** Retained for 30 days in encrypted cloud cold storage across separate physical availability zones.

### 6.2 Catalog Immutability & Fallback Redundancy
- The published astronomical catalog and `.astrobinary` GPU tiles are statically generated and versioned (`v3.4.2`).
- Even during total loss of upstream IVOA TAP or NASA network connectivity, the application continues to serve pre-compiled, mathematically verified celestial tiles from edge CDN caches with 100% uptime.

---

## 7. Caching Strategy & Edge CDN Configuration

### 7.1 HTTP Cache-Control Directives
- **Binary Sky Tiles (`/api/public/catalog/tiles/*`):**
  `Cache-Control: public, max-age=86400, stale-while-revalidate=604800, immutable`
  Caches tiles at the browser and Cloudflare edge for 24 hours, revalidating in the background.
- **Search Metadata & Sources (`/api/public/catalog/sources`):**
  `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`
- **Dynamic User Pass Queries:**
  `Cache-Control: private, no-cache, no-store, must-revalidate`

---

## 8. API Limits, Ingestion Scheduling & Privileged Protection

### 8.1 Ingestion Security & Access Control
- **No Public Privileged Routes:** Ingestion triggering and catalog modification endpoints (`AstronomicalDataPipeline.execute`) are **strictly internal** and never exposed as unauthenticated public web endpoints.
- **External TAP Politeness Policy:**
  - Ingestion adapter requests enforce a maximum of 2 concurrent connections to ESA/NASA TAP endpoints.
  - Exponential backoff with jitter on HTTP 429 / 503 responses.
  - Maximum 5,000 records harvested per batch query.

### 8.2 Scheduled Maintenance Cadence
- **NASA JPL DE440 Ephemerides:** Re-synchronized daily at 00:00 UTC to maintain sub-kilometer planetary positional accuracy.
- **ESA Gaia DR3 & NASA Exoplanet Archive:** Synchronized monthly on the 1st of each month.
- **System Integrity Health Checks:** Automated consistency validator (`scripts/catalog-consistency-validator.ts`) runs as a mandatory CI/CD blocking step before every production deployment.
