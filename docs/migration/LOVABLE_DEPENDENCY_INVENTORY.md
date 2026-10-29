# Lovable, Supabase and PostgreSQL dependency inventory

Snapshot: `ba30dc9035a229eb475c5d36ec7ef1b6bf2db263` (GitHub default-branch HEAD observed 2026-10-29; actual deployed production SHA remains unverified).

This is an exhaustive pattern scan of the pinned tracked text files, with targeted manual inspection of authentication, payment, storage, server entry and Store fetch paths. A match is a migration candidate, not proof that every reference runs in production. Markdown/history and binary files are retained in the separate full file inventory. No secret values are included.

| File | Categories | Lines | Required action |
|---|---|---|---|
| `.lovable/mcp/manifest.json` | Supabase SDK/auth/database; External hosted assets | 7 | Remove tooling metadata after runtime replacement |
| `drizzle.config.ts` | PostgreSQL/Drizzle; Provider environment/config | 4, 8 | Replace provider build/database setup while keeping TanStack Start |
| `drizzle/migrations/0000_create_paid_access_passes.sql` | PostgreSQL/Drizzle; Database-side authorization | 10, 11, 12, 13, 17, 18, 19, 21, 28, 33 | Translate SQL semantics and authorization; preserve original migrations |
| `drizzle/migrations/0001_add_atomic_access_activation.sql` | PostgreSQL/Drizzle; Database-side authorization | 9, 10, 11, 15, 16, 17, 34, 53 | Translate SQL semantics and authorization; preserve original migrations |
| `drizzle/migrations/0002_create_astronomical_catalog_tables.sql` | PostgreSQL/Drizzle; Database-side authorization | 16, 17, 27, 28, 29, 76, 77, 83, 90, 91, 102, 103, 107, 123, 124, 125, 126, 128, 132, 136, 140, 149, 150, 151, 152 | Translate SQL semantics and authorization; preserve original migrations |
| `drizzle/migrations/0003_create_academy_student_profiles.sql` | Database-side authorization; PostgreSQL/Drizzle | 6, 15, 17, 18, 19, 20, 26, 32, 33, 34, 41, 44, 49, 50, 51, 55, 57, 60, 62, 65, 67, 68, 71, 77, 79, 80, 84, 86, 96, 99, 102 | Translate SQL semantics and authorization; preserve original migrations |
| `drizzle/migrations/0004_create_secure_learning_database.sql` | PostgreSQL/Drizzle; Database-side authorization | 14, 15, 23, 25, 26, 41, 42, 53, 65, 71, 74, 82, 88, 95, 98, 99, 101, 102, 108, 113, 120, 126, 132, 134, 141, 146, 153, 159, 160, 168, 181, 182, 183, 184, 190, 191, 195, 196, 200, 204, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 223, 226, 229, 232, 235, 239, 240, 242, 243, 245, 246, 248, 249, 251, 252, 255, 256, 258, 259, 262, 263, 266, 267, 270, 271, 274, 275, 278, 279, 281, 285, 286, 309 | Translate SQL semantics and authorization; preserve original migrations |
| `drizzle/migrations/0005_subscription_administration.sql` | Database-side authorization; PostgreSQL/Drizzle | 3, 4, 12, 13, 17, 18, 20, 22, 27, 28, 42, 47, 57, 58, 63, 65, 68, 74 | Translate SQL semantics and authorization; preserve original migrations |
| `package-lock.json` | Lovable SDK/build; Supabase SDK/auth/database; PostgreSQL/Drizzle; External hosted assets; Provider environment/config | 11, 12, 41, 78, 93, 1733, 1735, 1739, 1741, 1770, 1772, 4077, 4079, 4089, 4091, 4101, 4103, 4107, 4109, 4119, 4121, 4125, 4132, 4134, 4145, 4147, 4151, 4152, 4153, 4154, 4155, 7244, 7259, 7269, 7277, 7322, 7352, 7476, 7488, 9941, 9943 | Replace provider calls with authorized independent repositories/APIs |
| `package.json` | Lovable SDK/build; Supabase SDK/auth/database; PostgreSQL/Drizzle | 68, 69, 98, 135, 150 | Replace provider build/database setup while keeping TanStack Start |
| `scripts/auth-navigation-validation.ts` | External hosted assets | 24 | Replace provider calls with authorized independent repositories/APIs |
| `scripts/certificate-verification-admin-validation.ts` | Supabase SDK/auth/database | 26, 81, 84, 122, 196, 252, 414 | Replace provider calls with authorized independent repositories/APIs |
| `scripts/student-system-validation.ts` | Database-side authorization | 164, 166 | Replace provider calls with authorized independent repositories/APIs |
| `scripts/subscription-admin-validation.mjs` | PostgreSQL/Drizzle; Database-side authorization | 13, 28, 74 | Replace provider calls with authorized independent repositories/APIs |
| `src/components/academy/CertificateAdminDashboard.tsx` | Supabase SDK/auth/database | 38, 76 | Replace provider calls with authorized independent repositories/APIs |
| `src/components/admin/SubscriptionAdmin.tsx` | Supabase SDK/auth/database | 1, 41 | Replace provider calls with authorized independent repositories/APIs |
| `src/integrations/lovable/index.ts` | Lovable SDK/build; Supabase SDK/auth/database | 3, 4, 5, 32 | Replace provider calls with authorized independent repositories/APIs |
| `src/integrations/supabase/auth-attacher.ts` | Supabase SDK/auth/database | 3, 7, 9 | Replace with independent server-side authentication/data boundary |
| `src/integrations/supabase/auth-middleware.ts` | Supabase SDK/auth/database; Provider environment/config; External hosted assets | 4, 34, 36, 37, 38, 39, 40, 41, 42, 70, 72, 84, 95 | Replace with independent server-side authentication/data boundary |
| `src/integrations/supabase/client.server.ts` | Supabase SDK/auth/database; Provider environment/config; External hosted assets; Database-side authorization | 5, 228, 229, 230, 231, 232, 233, 235, 237, 251, 253 | Replace with independent server-side authentication/data boundary |
| `src/integrations/supabase/client.ts` | Supabase SDK/auth/database; Provider environment/config; External hosted assets | 2, 36, 37, 38, 39, 40, 41, 42, 45, 47, 59, 60, 61 | Replace with independent server-side authentication/data boundary |
| `src/integrations/supabase/cron-auth.ts` | Provider environment/config | 3, 4 | Replace with independent server-side authentication/data boundary |
| `src/integrations/supabase/previewAuthStorage.ts` | External hosted assets | 63, 64, 69 | Replace with independent server-side authentication/data boundary |
| `src/lib/academy/achievements.functions.ts` | Supabase SDK/auth/database | 2, 10 | Replace provider calls with authorized independent repositories/APIs |
| `src/lib/academy/achievements.server.ts` | Supabase SDK/auth/database | 2, 44, 56, 95, 107, 124, 130 | Replace provider calls with authorized independent repositories/APIs |
| `src/lib/academy/assessment.functions.ts` | Supabase SDK/auth/database | 38, 39, 73, 74, 116, 117, 167, 170 | Replace provider calls with authorized independent repositories/APIs |
| `src/lib/academy/assessment.server.ts` | Supabase SDK/auth/database | 3, 144, 350, 509, 599, 644, 653 | Replace provider calls with authorized independent repositories/APIs |
| `src/lib/academy/certificate.functions.ts` | Supabase SDK/auth/database | 13, 14, 81, 82, 260, 261 | Replace provider calls with authorized independent repositories/APIs |
| `src/lib/academy/certificate.server.ts` | Supabase SDK/auth/database; Database-side authorization | 3, 86, 114, 139, 146, 158, 171, 209, 265, 273, 371, 459, 546, 562, 576, 589, 622, 696, 707, 714, 724, 764, 801, 823, 861, 907, 951, 1007, 1041, 1057, 1088, 1185 | Replace provider calls with authorized independent repositories/APIs |
| `src/lib/academy/completion.functions.ts` | Supabase SDK/auth/database | 30, 31, 62, 63, 100, 101 | Replace provider calls with authorized independent repositories/APIs |
| `src/lib/academy/completion.server.ts` | Supabase SDK/auth/database; Database-side authorization | 8, 192, 198, 203, 209, 253, 272, 290, 299, 311, 324, 330, 344, 346, 419 | Replace provider calls with authorized independent repositories/APIs |
| `src/lib/academy/learning.functions.ts` | Supabase SDK/auth/database | 4, 32, 51, 78, 88, 91, 94 | Replace provider calls with authorized independent repositories/APIs |
| `src/lib/academy/learning.server.ts` | Supabase SDK/auth/database | 3, 108, 180, 238, 277, 290, 297, 355, 356, 357, 358, 359 | Replace provider calls with authorized independent repositories/APIs |
| `src/lib/academy/progress.ts` | Supabase SDK/auth/database | 9, 312, 376 | Replace provider calls with authorized independent repositories/APIs |
| `src/lib/academy/student.functions.ts` | Supabase SDK/auth/database; PostgreSQL/Drizzle | 4, 64, 66, 69, 125, 201, 204, 209, 210, 253, 291, 294, 299, 315, 331 | Replace provider calls with authorized independent repositories/APIs |
| `src/lib/academy/useStudentAuth.ts` | Supabase SDK/auth/database | 2, 3, 143, 165, 237 | Replace provider calls with authorized independent repositories/APIs |
| `src/lib/mcp/index.ts` | Lovable SDK/build; Provider environment/config; Supabase SDK/auth/database; External hosted assets | 1, 7, 8, 17 | Preserve MCP/OAuth capability using independent transport and issuer |
| `src/lib/mcp/supabase.ts` | Supabase SDK/auth/database; Lovable SDK/build; Provider environment/config | 1, 2, 23, 24, 29, 31, 46, 49 | Preserve MCP/OAuth capability using independent transport and issuer |
| `src/lib/mcp/tools/get-catalog-entry.ts` | Lovable SDK/build | 1 | Preserve MCP/OAuth capability using independent transport and issuer |
| `src/lib/mcp/tools/get-my-access.ts` | Lovable SDK/build; Supabase SDK/auth/database | 1, 2 | Preserve MCP/OAuth capability using independent transport and issuer |
| `src/lib/mcp/tools/list-access-plans.ts` | Lovable SDK/build | 1 | Preserve MCP/OAuth capability using independent transport and issuer |
| `src/lib/mcp/tools/search-catalog.ts` | Lovable SDK/build | 1 | Preserve MCP/OAuth capability using independent transport and issuer |
| `src/lib/razorpay.functions.ts` | Supabase SDK/auth/database | 3, 17, 32, 49, 79, 84, 96 | Preserve verification; replace atomic fulfillment and add durable ledger |
| `src/lib/razorpay.server.ts` | Supabase SDK/auth/database | 181, 182 | Preserve verification; replace atomic fulfillment and add durable ledger |
| `src/lib/store-products.ts` | External hosted assets | 188 | Replace provider calls with authorized independent repositories/APIs |
| `src/lib/subscription-admin.functions.ts` | Supabase SDK/auth/database | 3, 4, 13, 18, 22, 36, 39, 81, 84 | Replace provider calls with authorized independent repositories/APIs |
| `src/routes/[.]lovable.oauth.consent.tsx` | Supabase SDK/auth/database | 5, 19, 34 | Replace provider calls with authorized independent repositories/APIs |
| `src/routes/[.well-known]/oauth-protected-resource.ts` | Lovable SDK/build | 1, 8 | Replace provider calls with authorized independent repositories/APIs |
| `src/routes/_authenticated/account.tsx` | Supabase SDK/auth/database | 6 | Replace provider calls with authorized independent repositories/APIs |
| `src/routes/_authenticated/route.tsx` | Supabase SDK/auth/database | 4, 10 | Replace provider calls with authorized independent repositories/APIs |
| `src/routes/auth.tsx` | Supabase SDK/auth/database | 8, 61, 69, 84, 91, 118 | Replace provider calls with authorized independent repositories/APIs |
| `src/routes/mcp.ts` | Lovable SDK/build | 1, 8 | Replace provider calls with authorized independent repositories/APIs |
| `src/start.ts` | Supabase SDK/auth/database | 4, 22 | Replace provider calls with authorized independent repositories/APIs |
| `vite.config.ts` | Lovable SDK/build; Provider environment/config | 1, 3, 7, 8 | Replace provider build/database setup while keeping TanStack Start |

## Environment variable names

- `ADMIN_EMAILS`
- `ADMIN_USER_IDS`
- `CERTIFICATE_HMAC_SECRET`
- `CERTIFICATE_SIGNING_SECRET`
- `CI_TEST`
- `GEMINI_API_KEY`
- `LOVABLE_CRON_SECRET`
- `LOVABLE_CRON_SECRET_PREVIOUS`
- `LOVABLE_DB_MIGRATION_URL`
- `NODE_ENV`
- `PGLITE_MODULE`
- `PORT`
- `RAZORPAY_LIVE_KEY_ID`
- `RAZORPAY_LIVE_KEY_SECRET`
- `RAZORPAY_LIVE_WEBHOOK_SECRET`
- `RAZORPAY_MODE`
- `RAZORPAY_TEST_KEY_ID`
- `RAZORPAY_TEST_KEY_SECRET`
- `RAZORPAY_TEST_WEBHOOK_SECRET`
- `SUPABASE_PROJECT_ID`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL`
- `VITEST`
- `VITE_PAYMENTS_CLIENT_TOKEN`
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`
