-- Rollback Procedure: 0004_down_secure_learning_database.sql
-- Safely removes tables added in 0004 without destroying student_profiles or access_passes.

DROP TABLE IF EXISTS public.academy_audit_log CASCADE;
DROP TABLE IF EXISTS public.academy_certificates CASCADE;
DROP TABLE IF EXISTS public.academy_certificate_eligibility CASCADE;
DROP TABLE IF EXISTS public.academy_stage_achievements CASCADE;
DROP TABLE IF EXISTS public.academy_verified_completions CASCADE;
DROP TABLE IF EXISTS public.academy_assessment_attempts CASCADE;
DROP TABLE IF EXISTS public.academy_activity_evidence CASCADE;
DROP TABLE IF EXISTS public.academy_lesson_progress CASCADE;
DROP TABLE IF EXISTS public.academy_enrollments CASCADE;
DROP TABLE IF EXISTS public.academy_lessons CASCADE;
DROP TABLE IF EXISTS public.academy_module_versions CASCADE;
DROP TABLE IF EXISTS public.academy_modules CASCADE;
DROP TABLE IF EXISTS public.academy_course_versions CASCADE;
DROP TABLE IF EXISTS public.academy_courses CASCADE;
