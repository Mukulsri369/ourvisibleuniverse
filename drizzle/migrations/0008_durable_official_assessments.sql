-- Additive: no historical attempt is relabeled as official and no awards are issued.
CREATE TABLE IF NOT EXISTS public.academy_assessment_sessions (
 id text PRIMARY KEY CHECK (length(id) BETWEEN 3 AND 128),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 module_id text NOT NULL CHECK (module_id='exam' OR module_id ~ '^(0[1-9]|1[0-9]|2[0-4])$'),
 learning_level text NOT NULL CHECK (learning_level IN ('junior','explorer','astronomer')),
 course_version text NOT NULL DEFAULT '1.0.0',
 question_snapshot jsonb NOT NULL CHECK (jsonb_typeof(question_snapshot)='array' AND jsonb_array_length(question_snapshot) BETWEEN 1 AND 100),
 started_at timestamptz NOT NULL DEFAULT now(),
 submission_payload jsonb,
 result_payload jsonb,
 completed_at timestamptz,
 CHECK ((completed_at IS NULL AND submission_payload IS NULL AND result_payload IS NULL)
     OR (completed_at IS NOT NULL AND submission_payload IS NOT NULL AND result_payload IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS academy_session_history ON public.academy_assessment_sessions(user_id,learning_level,started_at DESC);
ALTER TABLE public.academy_assessment_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.academy_assessment_sessions FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON public.academy_assessment_sessions TO service_role;

-- NULL denotes unreconciled historical provenance. Never infer official from a pass.
ALTER TABLE public.academy_assessment_attempts ADD COLUMN IF NOT EXISTS mode text CHECK (mode IN ('official','practice'));
ALTER TABLE public.academy_assessment_attempts ADD COLUMN IF NOT EXISTS learning_level text CHECK (learning_level IN ('junior','explorer','astronomer'));
ALTER TABLE public.academy_assessment_attempts ADD COLUMN IF NOT EXISTS course_version text;
ALTER TABLE public.academy_assessment_attempts ADD COLUMN IF NOT EXISTS session_id text REFERENCES public.academy_assessment_sessions(id);
CREATE UNIQUE INDEX IF NOT EXISTS academy_attempt_one_per_session ON public.academy_assessment_attempts(session_id) WHERE session_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.academy_commit_official_attempt(
 p_session_id text,p_user_id uuid,p_answers jsonb,p_result jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE s public.academy_assessment_sessions%ROWTYPE;
 q jsonb; answer jsonb; question_ids text[]='{}'; score integer=0; total integer; ordinal integer=0;
 percentage numeric; threshold integer; passed boolean; attempt_id uuid; result jsonb; completed timestamptz=now();
BEGIN
 IF p_session_id IS NULL OR p_user_id IS NULL OR p_answers IS NULL OR jsonb_typeof(p_answers)<>'object' THEN
  RAISE EXCEPTION 'Invalid official submission';
 END IF;
 -- Same user lock order is shared with future completion/issuance transactions.
 PERFORM pg_advisory_xact_lock(hashtextextended('ovu:academy:'||p_user_id::text,0));
 SELECT * INTO s FROM public.academy_assessment_sessions WHERE id=p_session_id AND user_id=p_user_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Attempt ownership mismatch or session missing' USING ERRCODE='42501'; END IF;
 IF s.completed_at IS NOT NULL THEN
  IF s.submission_payload<>p_answers THEN RAISE EXCEPTION 'Attempt already submitted with different answers'; END IF;
  RETURN s.result_payload;
 END IF;
 IF completed<s.started_at+interval '5 seconds' THEN RAISE EXCEPTION 'Assessment minimum duration not reached'; END IF;
 IF p_result IS NULL OR jsonb_typeof(p_result)<>'object' THEN RAISE EXCEPTION 'Missing assessment result'; END IF;
 total=jsonb_array_length(s.question_snapshot);
 IF s.module_id='exam' THEN
  threshold=80;
  IF total<>20 OR (SELECT count(DISTINCT module_id) FROM public.academy_verified_completions
    WHERE user_id=p_user_id AND module_id ~ '^(0[1-9]|1[0-9]|2[0-4])$')<>24 THEN
   RAISE EXCEPTION 'Official final examination requires all 24 verified modules and its assigned 20 questions';
  END IF;
 ELSE threshold=70;
 END IF;
 FOR q IN SELECT value FROM jsonb_array_elements(s.question_snapshot) LOOP
  IF NOT(q ? 'correctAnswer') OR coalesce(q->>'id','')='' THEN RAISE EXCEPTION 'Invalid canonical question snapshot'; END IF;
  answer=coalesce(p_answers->(q->>'id'),p_answers->ordinal::text);
  IF answer IS NOT NULL AND answer=q->'correctAnswer' THEN score=score+1; END IF;
  question_ids=array_append(question_ids,q->>'id'); ordinal=ordinal+1;
 END LOOP;
 percentage=round(score::numeric*100/total,2); passed=percentage>=threshold;
 IF (p_result->>'score')::integer IS DISTINCT FROM score
 OR (p_result->>'totalPoints')::integer IS DISTINCT FROM total
 OR (p_result->>'percentage')::numeric IS DISTINCT FROM percentage
 OR (p_result->>'passed')::boolean IS DISTINCT FROM passed THEN RAISE EXCEPTION 'Server grade differs from canonical snapshot'; END IF;
 INSERT INTO public.academy_assessment_attempts(user_id,assessment_id,assessment_version,question_set_version,
  assigned_question_ids,answers_payload,score,total_points,percentage,passed,idempotency_key,mode,session_id,learning_level,course_version)
 VALUES(p_user_id,CASE WHEN s.module_id='exam' THEN 'cosmic_explorer_final_exam' ELSE 'quiz_module_'||s.module_id END,
  '1.0.0','1.0.0',question_ids,p_answers,score,total,percentage,passed,'official-session:'||s.id,'official',s.id,s.learning_level,s.course_version)
 RETURNING id INTO attempt_id;
 result=p_result||jsonb_build_object('attemptId',attempt_id,'userId',p_user_id,'moduleId',s.module_id,
  'level',s.learning_level,'mode','official','courseVersion',s.course_version,'completedAt',completed,
  'score',score,'totalPoints',total,'percentage',percentage,'passed',passed,'passingScorePct',threshold,
  'assignedQuestionIds',to_jsonb(question_ids),'certificateEligible',s.module_id='exam' AND passed);
 IF s.module_id='exam' AND passed THEN
  INSERT INTO public.academy_certificate_eligibility(user_id,course_id,course_version,all_stages_completed,
   final_exam_passed,final_exam_score_pct,eligible_at,updated_at)
  VALUES(p_user_id,'cosmic_journey',s.course_version,true,true,percentage,completed,completed)
  ON CONFLICT(user_id,course_id,course_version) DO UPDATE SET all_stages_completed=true,final_exam_passed=true,
   final_exam_score_pct=greatest(public.academy_certificate_eligibility.final_exam_score_pct,EXCLUDED.final_exam_score_pct),
   eligible_at=coalesce(public.academy_certificate_eligibility.eligible_at,EXCLUDED.eligible_at),updated_at=EXCLUDED.updated_at;
 END IF;
 UPDATE public.academy_assessment_sessions SET submission_payload=p_answers,result_payload=result,completed_at=completed WHERE id=s.id;
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.academy_commit_official_attempt(text,uuid,jsonb,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.academy_commit_official_attempt(text,uuid,jsonb,jsonb) TO service_role;
NOTIFY pgrst, 'reload schema';
