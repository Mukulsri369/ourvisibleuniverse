-- Migration: 0004_create_secure_learning_database.sql
-- Description: Authoritative persistent learning-data infrastructure for Cosmic Learning Academy.
-- Includes courses, modules, lessons, activity evidence, server-graded assessments, verified completions,
-- stage achievements, certificate issuance, audit trail, and strict tamper-proof RLS.

-- 1. Courses & Course Versions
CREATE TABLE IF NOT EXISTS public.academy_courses (
  id text PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  total_stages integer NOT NULL DEFAULT 6,
  total_modules integer NOT NULL DEFAULT 24,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academy_course_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id text NOT NULL REFERENCES public.academy_courses(id) ON DELETE RESTRICT,
  version text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'deprecated', 'archived')),
  curriculum_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  passing_exam_threshold double precision NOT NULL DEFAULT 80.0,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, version)
);

-- 2. Modules & Module Versions (The 24 Cosmic Academy Modules)
CREATE TABLE IF NOT EXISTS public.academy_modules (
  id text PRIMARY KEY, -- '01' to '24'
  course_id text NOT NULL REFERENCES public.academy_courses(id) ON DELETE RESTRICT,
  stage_id integer NOT NULL CHECK (stage_id BETWEEN 1 AND 6),
  number integer NOT NULL CHECK (number BETWEEN 1 AND 24),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text NOT NULL,
  description text NOT NULL,
  estimated_minutes integer NOT NULL DEFAULT 30,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academy_module_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id text NOT NULL REFERENCES public.academy_modules(id) ON DELETE CASCADE,
  version text NOT NULL DEFAULT '1.0.0',
  completion_rule_version text NOT NULL DEFAULT '1.0.0',
  required_evidence_types text[] NOT NULL DEFAULT '{"interactive_experiment","knowledge_quiz"}',
  minimum_quiz_score_pct double precision NOT NULL DEFAULT 80.0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module_id, version)
);

-- 3. Structured Lessons
CREATE TABLE IF NOT EXISTS public.academy_lessons (
  id text PRIMARY KEY,
  module_id text NOT NULL REFERENCES public.academy_modules(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 1,
  title text NOT NULL,
  visualization_type text NOT NULL,
  objectives text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Student Enrollment
CREATE TABLE IF NOT EXISTS public.academy_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id text NOT NULL REFERENCES public.academy_courses(id) ON DELETE RESTRICT,
  course_version text NOT NULL DEFAULT '1.0.0',
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  UNIQUE (user_id, course_id)
);

-- 5. Lesson Progress (Unverified client navigation/reading)
CREATE TABLE IF NOT EXISTS public.academy_lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id text NOT NULL REFERENCES public.academy_modules(id) ON DELETE CASCADE,
  lesson_id text NOT NULL REFERENCES public.academy_lessons(id) ON DELETE CASCADE,
  scroll_depth_percent integer NOT NULL DEFAULT 0 CHECK (scroll_depth_percent BETWEEN 0 AND 100),
  time_spent_seconds integer NOT NULL DEFAULT 0,
  is_bookmarked boolean NOT NULL DEFAULT false,
  last_accessed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

-- 6. Educational Activity Evidence (Telemetry from 3D simulations & interactive labs)
CREATE TABLE IF NOT EXISTS public.academy_activity_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id text NOT NULL REFERENCES public.academy_modules(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  evidence_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  client_timestamp timestamptz NOT NULL,
  verification_status text NOT NULL DEFAULT 'submitted' CHECK (verification_status IN ('submitted', 'verified', 'rejected')),
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Authoritative Server-Graded Assessment Attempts
CREATE TABLE IF NOT EXISTS public.academy_assessment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id text NOT NULL,
  assessment_version text NOT NULL DEFAULT '1.0.0',
  question_set_version text NOT NULL DEFAULT '1.0.0',
  assigned_question_ids text[] NOT NULL DEFAULT '{}',
  answers_payload jsonb NOT NULL,
  score integer NOT NULL,
  total_points integer NOT NULL,
  percentage double precision NOT NULL,
  passed boolean NOT NULL,
  client_duration_seconds integer,
  idempotency_key text UNIQUE,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Verified Module Completions (Privileged: Server-Issued Only)
CREATE TABLE IF NOT EXISTS public.academy_verified_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id text NOT NULL REFERENCES public.academy_modules(id) ON DELETE CASCADE,
  module_version text NOT NULL DEFAULT '1.0.0',
  approved_rule_version text NOT NULL DEFAULT '1.0.0',
  qualifying_assessment_attempt_id uuid REFERENCES public.academy_assessment_attempts(id) ON DELETE RESTRICT,
  qualifying_evidence_ids uuid[] NOT NULL DEFAULT '{}',
  verified_at timestamptz NOT NULL DEFAULT now(),
  idempotency_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id)
);

-- 9. Progressive Stage Achievements (Stages 1 through 6)
CREATE TABLE IF NOT EXISTS public.academy_stage_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_id integer NOT NULL CHECK (stage_id BETWEEN 1 AND 6),
  badge_id text NOT NULL,
  stage_rule_version text NOT NULL DEFAULT '1.0.0',
  qualifying_module_ids text[] NOT NULL,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, stage_id)
);

-- 10. Certificate Eligibility State
CREATE TABLE IF NOT EXISTS public.academy_certificate_eligibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id text NOT NULL REFERENCES public.academy_courses(id) ON DELETE RESTRICT,
  course_version text NOT NULL DEFAULT '1.0.0',
  all_stages_completed boolean NOT NULL DEFAULT false,
  final_exam_passed boolean NOT NULL DEFAULT false,
  final_exam_score_pct double precision,
  eligible_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id, course_version)
);

-- 11. Authoritative Certificates (Issuance & Revocation with Tamper-Proof Cryptographic Hash)
CREATE TABLE IF NOT EXISTS public.academy_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_public_id text NOT NULL,
  display_name text NOT NULL,
  certificate_name text NOT NULL,
  learning_level text NOT NULL CHECK (learning_level IN ('junior', 'explorer', 'astronomer')),
  course_id text NOT NULL REFERENCES public.academy_courses(id) ON DELETE RESTRICT,
  course_version text NOT NULL,
  curriculum_version text NOT NULL DEFAULT '1.0.0',
  final_score_percentage double precision NOT NULL,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  verification_hash text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'superseded')),
  revocation_reason text,
  revoked_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 12. Security Audit Log
CREATE TABLE IF NOT EXISTS public.academy_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role text NOT NULL CHECK (actor_role IN ('student', 'service_role', 'admin', 'system')),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  previous_state jsonb,
  new_state jsonb,
  ip_hash text,
  user_agent_hash text,
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_course_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_module_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_activity_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_verified_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_stage_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_certificate_eligibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_audit_log ENABLE ROW LEVEL SECURITY;

-- 1. Curriculum read-only for public/authenticated
CREATE POLICY "Public read academy courses" ON public.academy_courses
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read academy course versions" ON public.academy_course_versions
  FOR SELECT TO anon, authenticated USING (status = 'active');

CREATE POLICY "Public read academy modules" ON public.academy_modules
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read academy module versions" ON public.academy_module_versions
  FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Public read academy lessons" ON public.academy_lessons
  FOR SELECT TO anon, authenticated USING (true);

-- 2. Student self-managed progress
CREATE POLICY "Users read own enrollments" ON public.academy_enrollments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users create own enrollments" ON public.academy_enrollments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own lesson progress" ON public.academy_lesson_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own lesson progress" ON public.academy_lesson_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own lesson progress" ON public.academy_lesson_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. Activity Evidence
CREATE POLICY "Users read own activity evidence" ON public.academy_activity_evidence
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own activity evidence" ON public.academy_activity_evidence
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 4. Assessment Attempts (READ-ONLY FOR STUDENTS, INSERT BY SERVICE_ROLE ONLY)
CREATE POLICY "Users read own assessment attempts" ON public.academy_assessment_attempts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 5. Verified Completions (READ-ONLY FOR STUDENTS, CREATED BY SERVICE_ROLE ONLY)
CREATE POLICY "Users read own verified completions" ON public.academy_verified_completions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 6. Stage Achievements (READ-ONLY FOR STUDENTS, AWARDED BY SERVICE_ROLE ONLY)
CREATE POLICY "Users read own stage achievements" ON public.academy_stage_achievements
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 7. Certificate Eligibility (READ-ONLY FOR STUDENTS)
CREATE POLICY "Users read own certificate eligibility" ON public.academy_certificate_eligibility
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 8. Certificates (STUDENTS READ OWN, PUBLIC READS ACTIVE BY CERT NUMBER / HASH)
CREATE POLICY "Users read own certificates" ON public.academy_certificates
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Public verify active certificates" ON public.academy_certificates
  FOR SELECT TO anon, authenticated USING (status = 'active');

-- 9. Audit Log (READ OWN BY ACTOR ID)
CREATE POLICY "Users view own audit events" ON public.academy_audit_log
  FOR SELECT TO authenticated USING (actor_id = auth.uid());

-- ========================================================
-- GRANTS & PERMISSIONS
-- ========================================================
GRANT SELECT ON public.academy_courses TO anon, authenticated;
GRANT SELECT ON public.academy_course_versions TO anon, authenticated;
GRANT SELECT ON public.academy_modules TO anon, authenticated;
GRANT SELECT ON public.academy_module_versions TO anon, authenticated;
GRANT SELECT ON public.academy_lessons TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON public.academy_enrollments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.academy_lesson_progress TO authenticated;
GRANT SELECT, INSERT ON public.academy_activity_evidence TO authenticated;

GRANT SELECT ON public.academy_assessment_attempts TO authenticated;
GRANT SELECT ON public.academy_verified_completions TO authenticated;
GRANT SELECT ON public.academy_stage_achievements TO authenticated;
GRANT SELECT ON public.academy_certificate_eligibility TO authenticated;
GRANT SELECT ON public.academy_certificates TO authenticated, anon;
GRANT SELECT ON public.academy_audit_log TO authenticated;

-- Service role has full access to execute verified grading and certificate issuance
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- ========================================================
-- PERFORMANCE INDEXES
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_modules_course_stage ON public.academy_modules(course_id, stage_id, number);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON public.academy_lessons(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_evidence_user_module ON public.academy_activity_evidence(user_id, module_id, verification_status);
CREATE INDEX IF NOT EXISTS idx_attempts_user_assessment ON public.academy_assessment_attempts(user_id, assessment_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_verified_user_module ON public.academy_verified_completions(user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_stage ON public.academy_stage_achievements(user_id, stage_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON public.academy_certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_hash ON public.academy_certificates(verification_hash);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.academy_certificates(user_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_actor_entity ON public.academy_audit_log(actor_id, entity_type, entity_id);

-- ========================================================
-- SEED INITIAL CURRICULUM
-- ========================================================
INSERT INTO public.academy_courses (id, title, slug, description, total_stages, total_modules)
VALUES (
  'cosmic_journey',
  'Cosmic Journey: 24-Module Observable Universe Curriculum',
  'cosmic-journey',
  'From our home planet to the edge of the observable universe: comprehensive astronomy curriculum across 6 celestial stages.',
  6,
  24
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.academy_course_versions (course_id, version, status, passing_exam_threshold)
VALUES ('cosmic_journey', '1.0.0', 'active', 80.0)
ON CONFLICT (course_id, version) DO NOTHING;

-- Seed all 24 Modules
INSERT INTO public.academy_modules (id, course_id, stage_id, number, slug, title, subtitle, description, estimated_minutes)
VALUES
  ('01', 'cosmic_journey', 1, 1, 'our-place-in-the-universe', 'Our Place in the Universe', 'Cosmic Address & Scales', 'Explore Earth, the Solar System, the Milky Way, Local Group, and Laniakea Supercluster.', 25),
  ('02', 'cosmic_journey', 1, 2, 'the-night-sky-and-constellations', 'The Night Sky & Constellations', 'Virtual Planetarium & Celestial Sphere', 'Learn how the night sky moves, find constellations, and locate Polaris in our interactive 3D planetarium.', 30),
  ('03', 'cosmic_journey', 1, 3, 'cosmic-distances-and-scale', 'Cosmic Distances & Scale', 'Powers of Ten & Astronomical Units', 'Journey from the human scale to the edge of the observable universe through interactive powers-of-ten zoom.', 25),
  ('04', 'cosmic_journey', 1, 4, 'light-time-and-cosmic-observation', 'Light, Time & Observation', 'Speed of Light & Lookback Time', 'Discover how light acts as a cosmic time machine, carrying photons billions of years across space to our eyes.', 30),
  ('05', 'cosmic_journey', 2, 5, 'earth-moon-and-seasons', 'Earth, Moon & Seasons', 'Axial Tilt & Orbital Rhythms', 'Investigate axial tilt, seasonal solstices, lunar orbit geometry, and why solar and lunar eclipses happen.', 25),
  ('06', 'cosmic_journey', 2, 6, 'the-solar-system-worlds', 'The Solar System Worlds', 'Terrestrial Planets to the Kuiper Belt', 'Navigate planetary worlds, rocky inner worlds, gas giants, icy moons, and dwarf planets.', 35),
  ('07', 'cosmic_journey', 2, 7, 'the-sun-our-living-star', 'The Sun: Our Living Star', 'Thermonuclear Core to Space Weather', 'Explore the solar core, radiative zone, sunspots, coronal mass ejections, and the solar wind.', 25),
  ('08', 'cosmic_journey', 2, 8, 'gravity-and-orbital-mechanics', 'Gravity & Orbital Mechanics', 'Keplerian Orbits & Escape Velocity', 'Experiment with gravity, Keplerian orbital velocities, Hohmann transfers, and gravitational slingshots.', 30),
  ('09', 'cosmic_journey', 3, 9, 'stars-and-how-they-work', 'Stars & How They Work', 'Nuclear Fusion, Spectra & HR Diagram', 'Decode stellar spectra, blackbody radiation, surface temperatures, and the Hertzsprung-Russell diagram.', 30),
  ('10', 'cosmic_journey', 3, 10, 'stellar-evolution-and-death', 'Stellar Evolution & Death', 'Protostars to Supernovae', 'Follow stellar lifecycles from nebular collapse through main sequence fusion to white dwarfs and supernovae.', 35),
  ('11', 'cosmic_journey', 3, 11, 'nebulae-and-star-nurseries', 'Nebulae & Star Nurseries', 'Interstellar Gas & Star Formation', 'Inspect emission, reflection, and planetary nebulae along with young open clusters and ancient globular clusters.', 25),
  ('12', 'cosmic_journey', 3, 12, 'exoplanets-and-alien-worlds', 'Exoplanets & Alien Worlds', 'Transit Photometry & Habitable Zones', 'Discover exoplanets using the transit and radial velocity methods, examining atmospheric biosignatures.', 30),
  ('13', 'cosmic_journey', 4, 13, 'galaxies-and-the-milky-way', 'Galaxies & the Milky Way', 'Spiral Arms, Bulges & Galactic Morphology', 'Examine spiral, barred, elliptical, and irregular galaxies using real observational catalogs and 3D models.', 35),
  ('14', 'cosmic_journey', 4, 14, 'black-holes-and-extreme-objects', 'Black Holes & Extreme Physics', 'Event Horizons, Pulsars & Gravitational Waves', 'Explore Schwarzschild radii, gravitational lensing, magnetars, and gravitational wave chirps from colliding black holes.', 35),
  ('15', 'cosmic_journey', 4, 15, 'the-cosmic-web-large-scale-structure', 'The Cosmic Web', 'Filaments, Superclusters & Voids', 'Explore large-scale filaments, Sloan Great Wall, Bootes void, and galaxy clusters spanning hundreds of millions of light-years.', 30),
  ('16', 'cosmic_journey', 4, 16, 'dark-matter-and-dark-energy', 'Dark Matter & Dark Energy', 'Rotational Curves & Accelerating Expansion', 'Analyze galaxy rotation curves, gravitational lensing by dark matter halos, and accelerated cosmic expansion.', 30),
  ('17', 'cosmic_journey', 5, 17, 'the-big-bang-and-cosmic-dawn', 'The Big Bang & Early Cosmos', 'Cosmic Inflation, Nucleosynthesis & CMB', 'Travel back 13.8 billion years to the Big Bang, primordial nucleosynthesis, and the Cosmic Microwave Background.', 35),
  ('18', 'cosmic_journey', 5, 18, 'the-expanding-universe-and-redshift', 'The Expanding Universe & Redshift', 'Hubble-Lemaître Law & Metric Expansion', 'Understand cosmological redshift wave-stretching, Hubble parameters, and the cosmological horizon.', 30),
  ('19', 'cosmic_journey', 5, 19, 'history-of-human-cosmology', 'History of Cosmology', 'Ancient Epicycles to General Relativity', 'Discover how human understanding transformed from geocentric spheres to Copernican heliocentrism and Einsteinian spacetime.', 25),
  ('20', 'cosmic_journey', 5, 20, 'the-future-of-the-universe', 'The Future of the Universe', 'Big Freeze, Heat Death & Long Cosmological Timelines', 'Project trillions of years into the cosmic future across the Stelliferous, Degenerate, Black Hole, and Dark Eras.', 30),
  ('21', 'cosmic_journey', 6, 21, 'telescopes-and-observatories', 'Telescopes & Observation', 'Optical, Radio & Space Observatories', 'Compare ground-based optical telescopes, radio arrays, and space observatories like Hubble, JWST, and Chandra.', 30),
  ('22', 'cosmic_journey', 6, 22, 'space-missions-and-exploration', 'Space Missions & Robotics', 'Voyagers, Rovers & Deep Space Probes', 'Study interplanetary trajectories, robotic rovers on Mars, and Voyager probes crossing the heliopause into interstellar space.', 30),
  ('23', 'cosmic_journey', 6, 23, 'astrobiology-and-search-for-life', 'Astrobiology & Life in Space', 'Extremophiles, Habitable Zones & SETI', 'Investigate extremophiles on Earth, subsurface oceans on Europa and Enceladus, and atmospheric biosignatures.', 30),
  ('24', 'cosmic_journey', 6, 24, 'the-cosmic-laboratory-capstone', 'The Cosmic Laboratory', 'Unified Capstone Physics & Astrometry', 'Synthesize all 23 prior astronomical domains in a hands-on astrophysics laboratory simulation.', 40)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description;

-- Seed Module Versions for all 24
INSERT INTO public.academy_module_versions (module_id, version, completion_rule_version, minimum_quiz_score_pct)
SELECT id, '1.0.0', '1.0.0', 80.0 FROM public.academy_modules
ON CONFLICT (module_id, version) DO NOTHING;

-- Seed Lessons
INSERT INTO public.academy_lessons (id, module_id, order_index, title, visualization_type, objectives)
SELECT
  id || '-core',
  id,
  1,
  title,
  'cosmic-scale',
  ARRAY['Master key physical principles', 'Conduct hands-on experiment', 'Complete verified knowledge assessment']
FROM public.academy_modules
ON CONFLICT (id) DO NOTHING;
