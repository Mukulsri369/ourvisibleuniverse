CREATE TABLE public.access_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  payment_session_id text NOT NULL,
  payment_customer_id text,
  price_id text NOT NULL,
  access_days integer NOT NULL CHECK (access_days IN (30, 180, 365)),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'refunded', 'failed')),
  environment text NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'live')),
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (payment_session_id, environment)
);
GRANT SELECT ON public.access_passes TO authenticated;
GRANT ALL ON public.access_passes TO service_role;
ALTER TABLE public.access_passes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own access passes"
  ON public.access_passes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE INDEX idx_access_passes_user_environment_expiry
  ON public.access_passes (user_id, environment, expires_at DESC);
CREATE OR REPLACE FUNCTION public.has_active_access(check_env text DEFAULT 'live')
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.access_passes
    WHERE user_id = auth.uid()
      AND environment = check_env
      AND status = 'active'
      AND starts_at <= now()
      AND expires_at > now()
  );
$$;
GRANT EXECUTE ON FUNCTION public.has_active_access(text) TO authenticated;