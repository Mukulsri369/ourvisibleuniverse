-- Permit a seven-day administrative gift without creating a purchasable plan
-- or broadening payment-order validation. This migration grants no access.
ALTER TABLE public.access_passes DROP CONSTRAINT IF EXISTS access_passes_access_days_check;
ALTER TABLE public.access_passes ADD CONSTRAINT access_passes_access_days_check CHECK (
  access_days IN (30,180,365) OR
  (access_days=7 AND payment_session_id LIKE 'admin:%' AND price_id='admin_grant_7_days')
);
ALTER TABLE public.access_admin_audit DROP CONSTRAINT IF EXISTS access_admin_audit_access_days_check;
ALTER TABLE public.access_admin_audit ADD CONSTRAINT access_admin_audit_access_days_check
  CHECK (access_days IN (7,30,180,365));
