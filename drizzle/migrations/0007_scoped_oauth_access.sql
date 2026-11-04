-- Restrict third-party OAuth sessions to the deliberately exposed MCP summary.
-- No users, roles, purchases or certificates are created/updated by this migration.
DO $migration$
DECLARE target record;
BEGIN
 FOR target IN SELECT c.relname FROM pg_catalog.pg_class c
 JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND c.relkind IN ('r','p')
 AND (c.relname LIKE 'academy\_%' ESCAPE '\' OR c.relname IN ('student_profiles','access_passes'))
 LOOP
  EXECUTE format('DROP POLICY IF EXISTS ovu_first_party_sessions_only ON public.%I',target.relname);
  EXECUTE format('CREATE POLICY ovu_first_party_sessions_only ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING ((auth.jwt()->>''client_id'') IS NULL) WITH CHECK ((auth.jwt()->>''client_id'') IS NULL)',target.relname);
 END LOOP;
END;
$migration$;

CREATE OR REPLACE FUNCTION public.get_my_access_summary(p_environment text DEFAULT 'live')
RETURNS TABLE(access_days integer,starts_at timestamptz,expires_at timestamptz,status text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
 IF p_environment IS NULL OR p_environment NOT IN ('live','sandbox') THEN RAISE EXCEPTION 'Invalid environment'; END IF;
 RETURN QUERY SELECT p.access_days::integer,p.starts_at,p.expires_at,p.status::text
 FROM public.access_passes p
 WHERE p.user_id=auth.uid() AND p.environment=p_environment
 ORDER BY p.expires_at DESC,p.id;
END;
$$;
REVOKE ALL ON FUNCTION public.get_my_access_summary(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_my_access_summary(text) TO authenticated;
COMMENT ON FUNCTION public.get_my_access_summary(text) IS 'Own-user pass summary only; no payment/customer identifiers, no caller-supplied user ID, no mutations.';
NOTIFY pgrst, 'reload schema';
