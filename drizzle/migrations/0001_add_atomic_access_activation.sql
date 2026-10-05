CREATE OR REPLACE FUNCTION public.apply_access_purchase(
  p_user_id uuid,
  p_payment_session_id text,
  p_payment_customer_id text,
  p_price_id text,
  p_access_days integer,
  p_environment text
)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_expiry timestamptz;
  base_expiry timestamptz;
  new_expiry timestamptz;
BEGIN
  IF p_access_days NOT IN (30, 180, 365) THEN
    RAISE EXCEPTION 'Invalid access duration';
  END IF;
  IF p_environment NOT IN ('sandbox', 'live') THEN
    RAISE EXCEPTION 'Invalid payment environment';
  END IF;

  SELECT expires_at INTO existing_expiry
  FROM public.access_passes
  WHERE payment_session_id = p_payment_session_id
    AND environment = p_environment;
  IF existing_expiry IS NOT NULL THEN
    RETURN existing_expiry;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text || ':' || p_environment));
  SELECT GREATEST(now(), COALESCE(MAX(expires_at), now())) INTO base_expiry
  FROM public.access_passes
  WHERE user_id = p_user_id
    AND environment = p_environment
    AND status = 'active';
  new_expiry := base_expiry + make_interval(days => p_access_days);

  INSERT INTO public.access_passes (
    user_id, payment_session_id, payment_customer_id, price_id,
    access_days, status, environment, starts_at, expires_at
  ) VALUES (
    p_user_id, p_payment_session_id, p_payment_customer_id, p_price_id,
    p_access_days, 'active', p_environment, now(), new_expiry
  );
  RETURN new_expiry;
END;
$$;
REVOKE ALL ON FUNCTION public.apply_access_purchase(uuid, text, text, text, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_access_purchase(uuid, text, text, text, integer, text) TO service_role;