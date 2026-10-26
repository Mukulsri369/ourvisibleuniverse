-- Administration is independent of paid access; only a verified owner can grant passes.
CREATE OR REPLACE FUNCTION public.is_subscription_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = auth.uid()
 AND lower(u.email) = 'mukul.srivastava.025@gmail.com' AND u.email_confirmed_at IS NOT NULL);
$$;
REVOKE ALL ON FUNCTION public.is_subscription_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_subscription_admin() TO authenticated;

CREATE TABLE IF NOT EXISTS public.access_admin_audit (
 request_id uuid PRIMARY KEY,
 actor_id uuid NOT NULL REFERENCES auth.users(id),
 user_id uuid NOT NULL REFERENCES auth.users(id),
 environment text NOT NULL CHECK (environment IN ('live','sandbox')),
 access_days integer NOT NULL CHECK (access_days IN (30,180,365)),
 reason text NOT NULL CHECK (length(reason) BETWEEN 3 AND 500),
 expires_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.access_admin_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.access_admin_audit FROM anon, authenticated;
GRANT ALL ON public.access_admin_audit TO service_role;

CREATE OR REPLACE FUNCTION public.admin_list_subscribers(
 p_environment text DEFAULT 'live', p_search text DEFAULT '', p_status text DEFAULT 'all',
 p_offset integer DEFAULT 0, p_limit integer DEFAULT 50)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE result jsonb;
BEGIN
 IF NOT public.is_subscription_admin() THEN RAISE EXCEPTION 'Administrator access required' USING ERRCODE='42501'; END IF;
 IF p_environment NOT IN ('live','sandbox') OR p_status NOT IN ('all','active','expired','refunded','failed')
 OR p_offset < 0 OR p_limit < 1 OR p_limit > 100 OR length(p_search)>200 THEN RAISE EXCEPTION 'Invalid filters'; END IF;
 WITH latest AS (
  SELECT DISTINCT ON (p.user_id) p.* FROM public.access_passes p
  WHERE p.environment=p_environment ORDER BY p.user_id,(p.status='active' AND p.starts_at<=now() AND p.expires_at>now()) DESC,p.expires_at DESC,p.created_at DESC
 ), people AS (
  SELECT l.user_id,u.email,coalesce(u.raw_user_meta_data->>'full_name',u.raw_user_meta_data->>'name','') AS name,
   l.price_id,l.access_days,l.starts_at,l.expires_at,
   CASE WHEN l.status='active' AND l.expires_at<=now() THEN 'expired' ELSE l.status END AS status,
   l.status='active' AND l.starts_at<=now() AND l.expires_at>now() AS has_access,
   CASE WHEN l.payment_session_id LIKE 'admin:%' THEN 'Admin grant' ELSE 'Payment' END AS source
  FROM latest l JOIN auth.users u ON u.id=l.user_id
 ), filtered AS (
  SELECT * FROM people WHERE (p_status='all' OR status=p_status)
  AND (strpos(lower(coalesce(email,'')||' '||name),lower(trim(p_search)))>0 OR trim(p_search)='')
 ), page AS (SELECT * FROM filtered ORDER BY expires_at DESC,user_id OFFSET p_offset LIMIT p_limit)
 SELECT jsonb_build_object('users',coalesce((SELECT jsonb_agg(to_jsonb(page)) FROM page),'[]'::jsonb),
 'total',(SELECT count(*) FROM filtered),'active',(SELECT count(*) FROM people WHERE has_access),
 'subscribers',(SELECT count(*) FROM people)) INTO result;
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.admin_list_subscribers(text,text,text,integer,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_subscribers(text,text,text,integer,integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_grant_access(
 p_email text,p_days integer,p_environment text,p_reason text,p_request_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE target_id uuid; prior public.access_admin_audit%ROWTYPE; expiry timestamptz;
BEGIN
 IF NOT public.is_subscription_admin() THEN RAISE EXCEPTION 'Administrator access required' USING ERRCODE='42501'; END IF;
 IF p_days NOT IN (30,180,365) OR p_environment NOT IN ('live','sandbox') OR p_request_id IS NULL
 OR length(trim(p_reason)) NOT BETWEEN 3 AND 500 OR length(p_email)>254 THEN RAISE EXCEPTION 'Invalid grant'; END IF;
 SELECT id INTO target_id FROM auth.users WHERE lower(email)=lower(trim(p_email)) AND email_confirmed_at IS NOT NULL;
 IF target_id IS NULL THEN RAISE EXCEPTION 'This user must sign in and verify their email before access can be granted'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext(target_id::text||':'||p_environment));
 SELECT * INTO prior FROM public.access_admin_audit WHERE request_id=p_request_id;
 IF FOUND THEN
  IF prior.actor_id<>auth.uid() OR prior.user_id<>target_id OR prior.environment<>p_environment
   OR prior.access_days<>p_days OR prior.reason<>trim(p_reason) THEN RAISE EXCEPTION 'Grant request does not match its original values'; END IF;
  RETURN jsonb_build_object('expiresAt',prior.expires_at,'userId',target_id);
 END IF;
 expiry := public.apply_access_purchase(target_id,'admin:'||p_request_id::text,NULL,'admin_grant_'||p_days::text||'_days',p_days,p_environment);
 INSERT INTO public.access_admin_audit(request_id,actor_id,user_id,environment,access_days,reason,expires_at)
 VALUES(p_request_id,auth.uid(),target_id,p_environment,p_days,trim(p_reason),expiry);
 RETURN jsonb_build_object('expiresAt',expiry,'userId',target_id);
END; $$;
REVOKE ALL ON FUNCTION public.admin_grant_access(text,integer,text,text,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_grant_access(text,integer,text,text,uuid) TO authenticated;

NOTIFY pgrst, 'reload schema';
