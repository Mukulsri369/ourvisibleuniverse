-- Public certificate DTOs remain available through the privacy-aware service;
-- raw profiles include guardian/contact/preferences fields and are owner-only.
DROP POLICY IF EXISTS ovu_profile_raw_private ON public.student_profiles;
CREATE POLICY ovu_profile_raw_private ON public.student_profiles
 AS RESTRICTIVE FOR SELECT TO anon,authenticated USING (auth.uid()=user_id);

-- Clients may report unverified navigation through the server API. They cannot
-- mutate authoritative flags or replay an old snapshot over verified progress.
REVOKE INSERT,UPDATE,DELETE ON public.academy_module_progress FROM anon,authenticated;

CREATE OR REPLACE FUNCTION public.academy_sync_navigation(p_user_id uuid,p_progress jsonb,p_level text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE item record; module text; percent integer; seconds integer; completed timestamptz;
 verified_at timestamptz; rows jsonb; changed timestamptz=now();
BEGIN
 IF p_user_id IS NULL OR p_progress IS NULL OR jsonb_typeof(p_progress)<>'object'
 OR (p_level IS NOT NULL AND p_level NOT IN ('junior','explorer','astronomer'))
 OR (SELECT count(*) FROM jsonb_each(p_progress))>100 THEN RAISE EXCEPTION 'Invalid navigation synchronization'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('ovu:academy:'||p_user_id::text,0));
 IF p_level IS NOT NULL THEN
  UPDATE public.student_profiles SET selected_level=p_level,updated_at=changed WHERE user_id=p_user_id AND selected_level IS DISTINCT FROM p_level;
 END IF;
 FOR item IN SELECT * FROM jsonb_each(p_progress) LOOP
  IF item.key !~ '^([1-9]|0[1-9]|1[0-9]|2[0-4])$' THEN CONTINUE; END IF;
  module=lpad(item.key,2,'0');
  IF module !~ '^(0[1-9]|1[0-9]|2[0-4])$' THEN CONTINUE; END IF;
  IF jsonb_typeof(item.value)<>'object' OR coalesce(item.value->>'status','') NOT IN ('not_started','in_progress','completed')
   OR item.value->>'percent' IS NULL OR (item.value->>'percent')::numeric NOT BETWEEN 0 AND 100
   OR coalesce((item.value->>'timeSpentSeconds')::numeric,0) NOT BETWEEN 0 AND 2147483647 THEN
    RAISE EXCEPTION 'Invalid navigation progress';
  END IF;
  percent=floor((item.value->>'percent')::numeric)::integer;
  seconds=floor(coalesce((item.value->>'timeSpentSeconds')::numeric,0))::integer;
  completed=CASE WHEN item.value->>'status'='completed' THEN coalesce((item.value->>'completedAt')::timestamptz,changed) ELSE NULL END;
  SELECT c.verified_at INTO verified_at FROM public.academy_verified_completions c WHERE user_id=p_user_id AND module_id=module;
  IF FOUND THEN
   INSERT INTO public.academy_module_progress(user_id,module_id,status,percent,time_spent_seconds,verified_quiz_passed,completed_at,updated_at)
   VALUES(p_user_id,module,'completed',100,seconds,true,verified_at,changed)
   ON CONFLICT(user_id,module_id) DO UPDATE SET status='completed',percent=100,verified_quiz_passed=true,
    completed_at=EXCLUDED.completed_at,time_spent_seconds=greatest(public.academy_module_progress.time_spent_seconds,EXCLUDED.time_spent_seconds),updated_at=changed;
  ELSE
   INSERT INTO public.academy_module_progress(user_id,module_id,status,percent,time_spent_seconds,verified_quiz_passed,completed_at,updated_at)
   VALUES(p_user_id,module,CASE WHEN percent=100 THEN 'completed' WHEN percent>0 THEN 'in_progress' ELSE 'not_started' END,
    percent,seconds,false,completed,changed)
   ON CONFLICT(user_id,module_id) DO UPDATE SET percent=greatest(public.academy_module_progress.percent,EXCLUDED.percent),
    status=CASE WHEN greatest(public.academy_module_progress.percent,EXCLUDED.percent)=100 THEN 'completed'
     WHEN greatest(public.academy_module_progress.percent,EXCLUDED.percent)>0 THEN 'in_progress' ELSE 'not_started' END,
    time_spent_seconds=greatest(public.academy_module_progress.time_spent_seconds,EXCLUDED.time_spent_seconds),verified_quiz_passed=false,
    completed_at=coalesce(public.academy_module_progress.completed_at,EXCLUDED.completed_at),updated_at=changed;
  END IF;
 END LOOP;
 SELECT coalesce(jsonb_agg(to_jsonb(p) ORDER BY module_id),'[]') INTO rows FROM public.academy_module_progress p WHERE user_id=p_user_id;
 RETURN jsonb_build_object('success',true,'progress',rows);
END; $$;
REVOKE ALL ON FUNCTION public.academy_sync_navigation(uuid,jsonb,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.academy_sync_navigation(uuid,jsonb,text) TO service_role;
NOTIFY pgrst,'reload schema';
