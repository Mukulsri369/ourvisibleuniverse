-- No backfill or customer mutation. Existing duplicates abort installation.
CREATE UNIQUE INDEX IF NOT EXISTS academy_one_active_certificate
 ON public.academy_certificates(user_id,course_id,course_version) WHERE status='active';

-- Public verification/export goes through the privacy-aware application API.
DROP POLICY IF EXISTS ovu_certificate_raw_private ON public.academy_certificates;
CREATE POLICY ovu_certificate_raw_private ON public.academy_certificates
 AS RESTRICTIVE FOR SELECT TO anon,authenticated USING (auth.uid()=user_id);

CREATE OR REPLACE FUNCTION public.academy_certificate_context(p_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE existing public.academy_certificates%ROWTYPE; exam public.academy_assessment_attempts%ROWTYPE;
 profile jsonb; completed integer;
BEGIN
 IF p_user_id IS NULL THEN RAISE EXCEPTION 'Student authentication required'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('ovu:academy:'||p_user_id::text,0));
 SELECT * INTO existing FROM public.academy_certificates WHERE user_id=p_user_id
  AND course_id='cosmic_journey' AND course_version='1.0.0' AND status='active';
 IF FOUND THEN RETURN jsonb_build_object('existing',to_jsonb(existing)); END IF;
 SELECT count(*) INTO completed FROM public.academy_verified_completions
  WHERE user_id=p_user_id AND module_id ~ '^(0[1-9]|1[0-9]|2[0-4])$';
 SELECT a.* INTO exam FROM public.academy_assessment_attempts a
  JOIN public.academy_assessment_sessions s ON s.id=a.session_id AND s.user_id=a.user_id
  WHERE a.user_id=p_user_id AND a.assessment_id='cosmic_explorer_final_exam'
   AND a.mode='official' AND a.course_version='1.0.0' AND a.passed AND a.percentage>=80
   AND s.module_id='exam' AND s.completed_at IS NOT NULL
  ORDER BY a.percentage DESC,a.submitted_at,a.id LIMIT 1;
 IF completed<>24 OR NOT FOUND THEN
  RAISE EXCEPTION 'Certificate issuance denied: all 24 verified modules and an official final assessment at 80 percent are required';
 END IF;
 SELECT jsonb_build_object('student_public_id',student_public_id,'display_name',display_name,'certificate_name',certificate_name)
  INTO profile FROM public.student_profiles WHERE user_id=p_user_id;
 RETURN jsonb_build_object('attemptId',exam.id,'score',exam.percentage,'level',exam.learning_level,'profile',profile);
END; $$;
REVOKE ALL ON FUNCTION public.academy_certificate_context(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.academy_certificate_context(uuid) TO service_role;

-- Private insertion helper: the signing key remains exclusively in the Worker.
CREATE OR REPLACE FUNCTION public.academy_insert_signed_certificate(p_payload jsonb)
RETURNS public.academy_certificates LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE inserted public.academy_certificates%ROWTYPE;
BEGIN
 IF p_payload IS NULL OR jsonb_typeof(p_payload)<>'object'
 OR coalesce(p_payload->>'verification_hash','') !~ '^[a-f0-9]{64}$'
 OR coalesce(p_payload->'metadata'->>'signatureVersion','')<>'2'
 OR coalesce(length(p_payload->>'certificate_number'),0) NOT BETWEEN 12 AND 80
 OR coalesce(length(p_payload->>'certificate_name'),0) NOT BETWEEN 1 AND 120
 OR coalesce(length(p_payload->>'display_name'),0) NOT BETWEEN 1 AND 120
 OR coalesce(length(p_payload->>'student_public_id'),0) NOT BETWEEN 3 AND 80
 OR (p_payload->>'final_score_percentage')::numeric NOT BETWEEN 80 AND 100 THEN
  RAISE EXCEPTION 'Invalid signed certificate payload';
 END IF;
 INSERT INTO public.academy_certificates(certificate_number,user_id,student_public_id,display_name,
  certificate_name,learning_level,course_id,course_version,curriculum_version,final_score_percentage,issue_date,verification_hash,status,metadata)
 VALUES(p_payload->>'certificate_number',(p_payload->>'user_id')::uuid,p_payload->>'student_public_id',p_payload->>'display_name',
  p_payload->>'certificate_name',p_payload->>'learning_level',p_payload->>'course_id',p_payload->>'course_version',
  p_payload->>'curriculum_version',(p_payload->>'final_score_percentage')::double precision,(p_payload->>'issue_date')::date,
  p_payload->>'verification_hash','active',p_payload->'metadata') RETURNING * INTO inserted;
 RETURN inserted;
END; $$;
REVOKE ALL ON FUNCTION public.academy_insert_signed_certificate(jsonb) FROM PUBLIC,anon,authenticated,service_role;

CREATE OR REPLACE FUNCTION public.academy_issue_certificate(p_user_id uuid,p_attempt_id uuid,p_payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE context jsonb; inserted public.academy_certificates%ROWTYPE;
BEGIN
 -- Context obtains the same transaction lock as grading/completion/admin changes.
 context=public.academy_certificate_context(p_user_id);
 IF context ? 'existing' THEN RETURN jsonb_build_object('certificate',context->'existing','isExisting',true); END IF;
 IF context->>'attemptId' IS DISTINCT FROM p_attempt_id::text
 OR p_payload->>'user_id' IS DISTINCT FROM p_user_id::text
 OR p_payload->>'course_id' IS DISTINCT FROM 'cosmic_journey'
 OR p_payload->>'course_version' IS DISTINCT FROM '1.0.0'
 OR (p_payload->>'final_score_percentage')::numeric IS DISTINCT FROM (context->>'score')::numeric
 OR p_payload->>'learning_level' IS DISTINCT FROM context->>'level' THEN
  RAISE EXCEPTION 'Certificate qualification changed or signed payload differs; retry';
 END IF;
 inserted=public.academy_insert_signed_certificate(p_payload);
 INSERT INTO public.academy_audit_log(actor_id,actor_role,action,entity_type,entity_id,new_state,idempotency_key)
 VALUES(p_user_id,'student','issue_certificate','academy_certificate',inserted.certificate_number,
  jsonb_build_object('qualifying_attempt',p_attempt_id,'certificate_id',inserted.id),'issue:'||inserted.certificate_number);
 RETURN jsonb_build_object('certificate',to_jsonb(inserted),'isExisting',false);
END; $$;
REVOKE ALL ON FUNCTION public.academy_issue_certificate(uuid,uuid,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.academy_issue_certificate(uuid,uuid,jsonb) TO service_role;

-- Actor IDs reach this service-only RPC only after fresh website admin authorization.
CREATE OR REPLACE FUNCTION public.academy_admin_certificate_change(
 p_actor_id uuid,p_number text,p_action text,p_reason text,p_expected_updated_at timestamptz DEFAULT NULL,p_payload jsonb DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE cert public.academy_certificates%ROWTYPE; next_cert public.academy_certificates%ROWTYPE;
 owner_id uuid; previous jsonb; changed timestamptz=now(); replacement text;
BEGIN
 IF p_actor_id IS NULL OR NOT EXISTS(SELECT 1 FROM auth.users WHERE id=p_actor_id)
 OR coalesce(length(trim(p_reason)),0) NOT BETWEEN 1 AND 2000
 OR coalesce(p_action,'') NOT IN ('revoke','correct','reissue') THEN RAISE EXCEPTION 'Invalid authorized certificate change'; END IF;
 SELECT user_id INTO owner_id FROM public.academy_certificates WHERE certificate_number=p_number;
 IF NOT FOUND THEN RAISE EXCEPTION 'Certificate not found'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('ovu:academy:'||owner_id::text,0));
 SELECT * INTO cert FROM public.academy_certificates WHERE certificate_number=p_number FOR UPDATE;
 previous=to_jsonb(cert);
 IF p_action='revoke' THEN
  IF cert.status='revoked' THEN RETURN jsonb_build_object('certificate',to_jsonb(cert),'isExisting',true); END IF;
  UPDATE public.academy_certificates SET status='revoked',revocation_reason=trim(p_reason),revoked_at=changed,updated_at=changed
   WHERE id=cert.id RETURNING * INTO next_cert;
 ELSIF p_action='correct' THEN
  IF cert.status<>'active' THEN RAISE EXCEPTION 'Only an active certificate can be corrected'; END IF;
  IF p_payload->>'certificate_name'=cert.certificate_name AND p_payload->>'learning_level'=cert.learning_level
   AND p_payload->>'verification_hash'=cert.verification_hash THEN
   RETURN jsonb_build_object('certificate',to_jsonb(cert),'isExisting',true);
  END IF;
  IF cert.updated_at IS DISTINCT FROM p_expected_updated_at THEN RAISE EXCEPTION 'Certificate changed; reload before correcting'; END IF;
  IF p_payload->>'certificate_number' IS DISTINCT FROM cert.certificate_number
   OR p_payload->>'user_id' IS DISTINCT FROM cert.user_id::text
   OR p_payload->>'student_public_id' IS DISTINCT FROM cert.student_public_id
   OR p_payload->>'display_name' IS DISTINCT FROM cert.display_name
   OR p_payload->>'course_id' IS DISTINCT FROM cert.course_id OR p_payload->>'course_version' IS DISTINCT FROM cert.course_version
   OR p_payload->>'curriculum_version' IS DISTINCT FROM cert.curriculum_version
   OR (p_payload->>'final_score_percentage')::numeric IS DISTINCT FROM cert.final_score_percentage::numeric
   OR (p_payload->>'issue_date')::date IS DISTINCT FROM cert.issue_date
   OR coalesce(length(p_payload->>'certificate_name'),0) NOT BETWEEN 1 AND 120
   OR coalesce(p_payload->>'verification_hash','') !~ '^[a-f0-9]{64}$'
   OR coalesce(p_payload->'metadata'->>'signatureVersion','')<>'2' THEN RAISE EXCEPTION 'Invalid correction payload'; END IF;
  UPDATE public.academy_certificates SET certificate_name=p_payload->>'certificate_name',learning_level=p_payload->>'learning_level',
   verification_hash=p_payload->>'verification_hash',metadata=metadata||jsonb_build_object('signatureVersion',2,'lastCorrectionReason',trim(p_reason)),updated_at=changed
   WHERE id=cert.id RETURNING * INTO next_cert;
 ELSE
  -- Retrying a lost response follows the same immutable lineage, never issues twice.
  replacement=cert.metadata->>'supersededBy';
  IF cert.status='superseded' AND replacement IS NOT NULL THEN
   SELECT * INTO next_cert FROM public.academy_certificates WHERE certificate_number=replacement AND user_id=owner_id;
   IF NOT FOUND THEN RAISE EXCEPTION 'Certificate lineage is inconsistent'; END IF;
   RETURN jsonb_build_object('certificate',to_jsonb(next_cert),'isExisting',true);
  END IF;
  IF cert.updated_at IS DISTINCT FROM p_expected_updated_at THEN RAISE EXCEPTION 'Certificate changed; reload before reissuing'; END IF;
  IF p_payload->>'user_id' IS DISTINCT FROM cert.user_id::text
   OR p_payload->>'student_public_id' IS DISTINCT FROM cert.student_public_id
   OR p_payload->>'display_name' IS DISTINCT FROM cert.display_name
   OR p_payload->>'course_id' IS DISTINCT FROM cert.course_id OR p_payload->>'course_version' IS DISTINCT FROM cert.course_version
   OR p_payload->>'curriculum_version' IS DISTINCT FROM cert.curriculum_version
   OR (p_payload->>'final_score_percentage')::numeric IS DISTINCT FROM cert.final_score_percentage::numeric
   OR p_payload->>'certificate_number'=cert.certificate_number THEN RAISE EXCEPTION 'Invalid reissue payload'; END IF;
  UPDATE public.academy_certificates SET status='superseded',metadata=metadata||jsonb_build_object(
   'supersededBy',p_payload->>'certificate_number','supersededAt',changed,'supersededReason',trim(p_reason)),updated_at=changed WHERE id=cert.id;
  next_cert=public.academy_insert_signed_certificate(p_payload||jsonb_build_object('metadata',
   coalesce(p_payload->'metadata','{}'::jsonb)||jsonb_build_object('supersedes',cert.certificate_number,'reissuedBy',p_actor_id,'reissueReason',trim(p_reason))));
 END IF;
 INSERT INTO public.academy_audit_log(actor_id,actor_role,action,entity_type,entity_id,previous_state,new_state)
 VALUES(p_actor_id,'admin',p_action||'_certificate','academy_certificate',next_cert.certificate_number,previous,to_jsonb(next_cert));
 RETURN jsonb_build_object('certificate',to_jsonb(next_cert),'isExisting',false);
END; $$;
REVOKE ALL ON FUNCTION public.academy_admin_certificate_change(uuid,text,text,text,timestamptz,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.academy_admin_certificate_change(uuid,text,text,text,timestamptz,jsonb) TO service_role;
NOTIFY pgrst, 'reload schema';
