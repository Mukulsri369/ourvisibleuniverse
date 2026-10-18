-- Migration: 0003_create_academy_student_profiles.sql
-- Description: Creates student profile, child safety consent, and verified learning progression tables for Cosmic Learning Academy.

-- 1. Student Profiles Table
CREATE TABLE IF NOT EXISTS public.student_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  student_public_id text NOT NULL UNIQUE,
  display_name text NOT NULL DEFAULT 'Cosmic Explorer',
  certificate_name text NOT NULL DEFAULT 'Cosmic Explorer',
  selected_level text NOT NULL DEFAULT 'explorer' CHECK (selected_level IN ('junior', 'explorer', 'astronomer')),
  preferred_language text NOT NULL DEFAULT 'en',
  age_bracket text NOT NULL DEFAULT '13_to_17' CHECK (age_bracket IN ('under_13', '13_to_17', '18_plus')),
  guardian_consent_status text NOT NULL DEFAULT 'not_required' CHECK (guardian_consent_status IN ('not_required', 'pending_guardian', 'guardian_consented', 'verified_adult')),
  guardian_email text,
  guardian_consent_date timestamptz,
  profile_visibility text NOT NULL DEFAULT 'private' CHECK (profile_visibility IN ('private', 'students_only', 'public')),
  accessibility_settings jsonb NOT NULL DEFAULT '{"reducedMotion":false,"highContrast":false,"soundEffects":false,"fontSize":"normal","dyslexiaFriendlyFont":false,"screenReaderFriendly":false}'::jsonb,
  learning_settings jsonb NOT NULL DEFAULT '{"autoAdvanceAudio":false,"hintMode":true,"voiceGuide":true,"dailyGoalMinutes":15}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Academy Verified Module Progress Table
CREATE TABLE IF NOT EXISTS public.academy_module_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id text NOT NULL CHECK (module_id ~ '^[0-2][0-9]$'),
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  percent integer NOT NULL DEFAULT 0 CHECK (percent >= 0 AND percent <= 100),
  time_spent_seconds integer NOT NULL DEFAULT 0,
  verified_quiz_passed boolean NOT NULL DEFAULT false,
  first_started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id)
);

-- 3. Academy Stage Badges Table (Stages 1 through 6)
CREATE TABLE IF NOT EXISTS public.academy_stage_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_id integer NOT NULL CHECK (stage_id BETWEEN 1 AND 6),
  badge_id text NOT NULL,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, stage_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_stage_badges ENABLE ROW LEVEL SECURITY;

-- Student Profile Policies
DROP POLICY IF EXISTS "Users can view own student profile" ON public.student_profiles;
CREATE POLICY "Users can view own student profile"
  ON public.student_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own student profile" ON public.student_profiles;
CREATE POLICY "Users can insert own student profile"
  ON public.student_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own student profile" ON public.student_profiles;
CREATE POLICY "Users can update own student profile"
  ON public.student_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can view non-private student profiles by public id" ON public.student_profiles;
CREATE POLICY "Public can view non-private student profiles by public id"
  ON public.student_profiles FOR SELECT TO anon, authenticated
  USING (profile_visibility != 'private');

-- Module Progress Policies
DROP POLICY IF EXISTS "Users can manage own module progress" ON public.academy_module_progress;
CREATE POLICY "Users can manage own module progress"
  ON public.academy_module_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Stage Badges Policies
DROP POLICY IF EXISTS "Users can view own stage badges" ON public.academy_stage_badges;
CREATE POLICY "Users can view own stage badges"
  ON public.academy_stage_badges FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Indexing for high-performance lookup
CREATE INDEX IF NOT EXISTS idx_student_profiles_public_id ON public.student_profiles(student_public_id);
CREATE INDEX IF NOT EXISTS idx_academy_module_progress_user ON public.academy_module_progress(user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_academy_stage_badges_user ON public.academy_stage_badges(user_id, stage_id);

-- Permissions
GRANT SELECT, INSERT, UPDATE ON public.student_profiles TO authenticated;
GRANT SELECT ON public.student_profiles TO anon;
GRANT ALL ON public.student_profiles TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.academy_module_progress TO authenticated;
GRANT ALL ON public.academy_module_progress TO service_role;

GRANT SELECT ON public.academy_stage_badges TO authenticated;
GRANT ALL ON public.academy_stage_badges TO service_role;
