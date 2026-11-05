-- Historical events retain NULL provenance; only new acknowledged events use a key.
ALTER TABLE public.academy_activity_evidence ADD COLUMN IF NOT EXISTS client_event_id text CHECK (length(client_event_id) BETWEEN 3 AND 128);
ALTER TABLE public.academy_activity_evidence ADD COLUMN IF NOT EXISTS payload_fingerprint text CHECK (payload_fingerprint ~ '^[a-f0-9]{64}$');
CREATE UNIQUE INDEX IF NOT EXISTS academy_evidence_event_once ON public.academy_activity_evidence(user_id,client_event_id);

-- Clients may upload unverified telemetry, never their own verification verdict.
DROP POLICY IF EXISTS ovu_unverified_client_evidence ON public.academy_activity_evidence;
CREATE POLICY ovu_unverified_client_evidence ON public.academy_activity_evidence
 AS RESTRICTIVE FOR INSERT TO authenticated
 WITH CHECK (verification_status='submitted' AND verified_at IS NULL);

CREATE OR REPLACE FUNCTION public.academy_apply_verified_completion(
 p_user_id uuid,p_module_id text,p_rule jsonb,p_badge_id text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE completed_row public.academy_verified_completions%ROWTYPE;
 attempt_row public.academy_assessment_attempts%ROWTYPE;
 module_stage integer; version text; activity jsonb; evidence_id uuid; evidence_ids uuid[]='{}';
 stage_modules text[]; stage_count integer; total_count integer; first_module integer;
 created_completion boolean=false; created_stage boolean=false; awarded timestamptz=now();
BEGIN
 IF p_user_id IS NULL OR p_module_id IS NULL OR p_rule IS NULL OR jsonb_typeof(p_rule)<>'object'
 OR p_rule->>'moduleId' IS DISTINCT FROM p_module_id OR coalesce(p_rule->>'ruleVersion','')=''
 OR p_rule->>'passingScorePct' IS NULL OR p_rule->>'minimumReadingSeconds' IS NULL OR p_rule->>'stageId' IS NULL
 OR jsonb_typeof(p_rule->'requiredActivities') IS DISTINCT FROM 'array'
 OR coalesce(length(p_badge_id),0) NOT BETWEEN 3 AND 120
 OR (p_rule->>'passingScorePct')::numeric NOT BETWEEN 0 AND 100
 OR (p_rule->>'minimumReadingSeconds')::integer NOT BETWEEN 0 AND 86400 THEN
  RAISE EXCEPTION 'Invalid trusted completion rule';
 END IF;
 version=p_rule->>'ruleVersion';
 SELECT stage_id INTO module_stage FROM public.academy_modules WHERE id=p_module_id AND course_id='cosmic_journey';
 IF NOT FOUND OR module_stage IS DISTINCT FROM (p_rule->>'stageId')::integer THEN RAISE EXCEPTION 'Unknown completion module'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('ovu:academy:'||p_user_id::text,0));
 SELECT * INTO completed_row FROM public.academy_verified_completions WHERE user_id=p_user_id AND module_id=p_module_id;
 IF NOT FOUND THEN
  -- Preserve the existing instructional OR rule; do not change curriculum/scoring.
  IF NOT (SELECT count(*)>0 OR coalesce(sum(time_spent_seconds),0)>=(p_rule->>'minimumReadingSeconds')::integer
    OR coalesce(max(scroll_depth_percent),0)>=50 FROM public.academy_lesson_progress
    WHERE user_id=p_user_id AND module_id=p_module_id) THEN RAISE EXCEPTION 'Instructional requirement not satisfied'; END IF;
  FOR activity IN SELECT value FROM jsonb_array_elements(p_rule->'requiredActivities') LOOP
   SELECT id INTO evidence_id FROM public.academy_activity_evidence
    WHERE user_id=p_user_id AND module_id=p_module_id AND verification_status='verified'
    AND activity_type IN (activity->>'id',activity->>'validationKey',activity->>'accessibleAlternativeId')
    ORDER BY created_at,id LIMIT 1;
   IF NOT FOUND THEN RAISE EXCEPTION 'Verified activity requirement not satisfied'; END IF;
   evidence_ids=array_append(evidence_ids,evidence_id);
  END LOOP;
  SELECT * INTO attempt_row FROM public.academy_assessment_attempts
   WHERE user_id=p_user_id AND assessment_id='quiz_module_'||p_module_id AND mode='official'
   AND passed AND percentage>=(p_rule->>'passingScorePct')::numeric
   ORDER BY percentage DESC,submitted_at,id LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'Official assessment requirement not satisfied'; END IF;
  INSERT INTO public.academy_verified_completions(user_id,module_id,module_version,approved_rule_version,
   qualifying_assessment_attempt_id,qualifying_evidence_ids,verified_at,idempotency_key)
  VALUES(p_user_id,p_module_id,version,version,attempt_row.id,evidence_ids,awarded,'comp_'||p_user_id::text||'_'||p_module_id)
  RETURNING * INTO completed_row;
  created_completion=true;
 END IF;

 INSERT INTO public.academy_module_progress(user_id,module_id,status,percent,verified_quiz_passed,completed_at,updated_at)
 VALUES(p_user_id,p_module_id,'completed',100,true,completed_row.verified_at,awarded)
 ON CONFLICT(user_id,module_id) DO UPDATE SET status='completed',percent=100,verified_quiz_passed=true,
  completed_at=coalesce(public.academy_module_progress.completed_at,EXCLUDED.completed_at),updated_at=EXCLUDED.updated_at
 WHERE public.academy_module_progress.status<>'completed' OR public.academy_module_progress.percent<>100
  OR NOT public.academy_module_progress.verified_quiz_passed OR public.academy_module_progress.completed_at IS NULL;

 first_module=(module_stage-1)*4+1;
 SELECT array_agg(lpad(m::text,2,'0') ORDER BY m) INTO stage_modules FROM generate_series(first_module,first_module+3) m;
 SELECT count(*) INTO stage_count FROM public.academy_verified_completions
  WHERE user_id=p_user_id AND module_id=ANY(stage_modules);
 IF stage_count=4 THEN
  INSERT INTO public.academy_stage_achievements(user_id,stage_id,badge_id,stage_rule_version,qualifying_module_ids,awarded_at)
   VALUES(p_user_id,module_stage,p_badge_id,'1.0.0',stage_modules,awarded)
   ON CONFLICT(user_id,stage_id) DO NOTHING;
  created_stage=FOUND;
  INSERT INTO public.academy_stage_badges(user_id,stage_id,badge_id,awarded_at)
   VALUES(p_user_id,module_stage,p_badge_id,awarded) ON CONFLICT(user_id,stage_id) DO NOTHING;
 END IF;
 SELECT count(*) INTO total_count FROM public.academy_verified_completions
  WHERE user_id=p_user_id AND module_id ~ '^(0[1-9]|1[0-9]|2[0-4])$';
 IF total_count=24 THEN
  INSERT INTO public.academy_certificate_eligibility(user_id,course_id,course_version,all_stages_completed,eligible_at,updated_at)
   VALUES(p_user_id,'cosmic_journey','1.0.0',true,awarded,awarded)
   ON CONFLICT(user_id,course_id,course_version) DO UPDATE SET all_stages_completed=true,
    eligible_at=coalesce(public.academy_certificate_eligibility.eligible_at,EXCLUDED.eligible_at),updated_at=EXCLUDED.updated_at
   WHERE NOT public.academy_certificate_eligibility.all_stages_completed;
 END IF;
 IF created_completion THEN
  INSERT INTO public.academy_audit_log(actor_id,actor_role,action,entity_type,entity_id,new_state,idempotency_key)
   VALUES(p_user_id,'service_role','verified_completion_awarded','academy_verified_completions',p_module_id,
   jsonb_build_object('qualifying_attempt',completed_row.qualifying_assessment_attempt_id,'qualifying_evidence',to_jsonb(completed_row.qualifying_evidence_ids)),
   completed_row.idempotency_key);
 END IF;
 RETURN jsonb_build_object('verified',true,'verifiedAt',completed_row.verified_at,'completionCreated',created_completion,
  'stageCreated',created_stage,'allModulesVerified',total_count=24);
END; $$;
REVOKE ALL ON FUNCTION public.academy_apply_verified_completion(uuid,text,jsonb,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.academy_apply_verified_completion(uuid,text,jsonb,text) TO service_role;

-- Revalidation reads and writes under the same user lock. An HTTP/database
-- failure cannot be misinterpreted as an empty module set and revoke badges.
CREATE OR REPLACE FUNCTION public.academy_sync_stage_achievements(p_user_id uuid,p_badges jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE stage integer; definition jsonb; required text[]; actual text[]; verified text[];
 earned integer; removed integer; awarded timestamptz=now(); achievement_rows jsonb;
BEGIN
 IF p_user_id IS NULL OR p_badges IS NULL OR jsonb_typeof(p_badges)<>'object' THEN RAISE EXCEPTION 'Invalid achievement revalidation'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('ovu:academy:'||p_user_id::text,0));
 SELECT coalesce(array_agg(module_id ORDER BY module_id),'{}') INTO verified
  FROM public.academy_verified_completions WHERE user_id=p_user_id AND module_id ~ '^(0[1-9]|1[0-9]|2[0-4])$';
 FOR stage IN 1..6 LOOP
  definition=p_badges->stage::text;
  SELECT array_agg(lpad(m::text,2,'0') ORDER BY m) INTO required FROM generate_series((stage-1)*4+1,stage*4) m;
  SELECT array_agg(value ORDER BY value) INTO actual FROM jsonb_array_elements_text(definition->'requiredModuleIds');
  IF actual IS DISTINCT FROM required OR coalesce(definition->>'badgeId','')='' OR coalesce(definition->>'version','')='' THEN RAISE EXCEPTION 'Invalid trusted stage definition'; END IF;
  SELECT count(*) INTO earned FROM unnest(required) m WHERE m=ANY(verified);
  IF earned=4 THEN
   INSERT INTO public.academy_stage_achievements(user_id,stage_id,badge_id,stage_rule_version,qualifying_module_ids,awarded_at)
    VALUES(p_user_id,stage,definition->>'badgeId',definition->>'version',required,awarded)
    ON CONFLICT(user_id,stage_id) DO NOTHING;
   INSERT INTO public.academy_stage_badges(user_id,stage_id,badge_id,awarded_at)
    SELECT p_user_id,stage,badge_id,awarded_at FROM public.academy_stage_achievements WHERE user_id=p_user_id AND stage_id=stage
    ON CONFLICT(user_id,stage_id) DO NOTHING;
  ELSE
   DELETE FROM public.academy_stage_achievements WHERE user_id=p_user_id AND stage_id=stage;
   GET DIAGNOSTICS removed=ROW_COUNT;
   DELETE FROM public.academy_stage_badges WHERE user_id=p_user_id AND stage_id=stage;
   IF removed>0 THEN
    INSERT INTO public.academy_audit_log(actor_id,actor_role,action,entity_type,entity_id,new_state)
     VALUES(p_user_id,'service_role','stage_achievement_revoked','academy_stage_achievements',stage::text,
     jsonb_build_object('verified_module_ids',to_jsonb(verified),'missing_required_modules',4-earned));
   END IF;
  END IF;
 END LOOP;
 IF cardinality(verified)<24 THEN
  UPDATE public.academy_certificate_eligibility SET all_stages_completed=false,updated_at=awarded
   WHERE user_id=p_user_id AND course_id='cosmic_journey' AND course_version='1.0.0' AND all_stages_completed;
 END IF;
 SELECT coalesce(jsonb_agg(jsonb_build_object('stageId',stage_id,'awardedAt',awarded_at,'version',stage_rule_version) ORDER BY stage_id),'[]') INTO achievement_rows
  FROM public.academy_stage_achievements WHERE user_id=p_user_id;
 RETURN jsonb_build_object('verifiedModuleIds',to_jsonb(verified),'achievements',achievement_rows);
END; $$;
REVOKE ALL ON FUNCTION public.academy_sync_stage_achievements(uuid,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.academy_sync_stage_achievements(uuid,jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.academy_record_lesson_progress(
 p_user_id uuid,p_module_id text,p_lesson_id text,p_scroll integer,p_seconds integer,p_bookmarked boolean DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF p_user_id IS NULL OR p_module_id IS NULL OR p_lesson_id IS NULL OR p_scroll IS NULL OR p_seconds IS NULL
 OR p_scroll NOT BETWEEN 0 AND 100 OR p_seconds NOT BETWEEN 0 AND 86400
 OR NOT EXISTS(SELECT 1 FROM public.academy_lessons WHERE id=p_lesson_id AND module_id=p_module_id) THEN
  RAISE EXCEPTION 'Invalid reading progress';
 END IF;
 INSERT INTO public.academy_lesson_progress(user_id,module_id,lesson_id,scroll_depth_percent,time_spent_seconds,is_bookmarked,last_accessed_at)
 VALUES(p_user_id,p_module_id,p_lesson_id,p_scroll,p_seconds,coalesce(p_bookmarked,false),now())
 ON CONFLICT(user_id,lesson_id) DO UPDATE SET
  scroll_depth_percent=greatest(public.academy_lesson_progress.scroll_depth_percent,EXCLUDED.scroll_depth_percent),
  time_spent_seconds=greatest(public.academy_lesson_progress.time_spent_seconds,EXCLUDED.time_spent_seconds),
  is_bookmarked=coalesce(p_bookmarked,public.academy_lesson_progress.is_bookmarked),last_accessed_at=EXCLUDED.last_accessed_at;
 RETURN jsonb_build_object('success',true);
END; $$;
REVOKE ALL ON FUNCTION public.academy_record_lesson_progress(uuid,text,text,integer,integer,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.academy_record_lesson_progress(uuid,text,text,integer,integer,boolean) TO service_role;
NOTIFY pgrst, 'reload schema';
