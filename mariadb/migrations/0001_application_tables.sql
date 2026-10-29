-- MariaDB translation of the original application tables. Original PostgreSQL migrations remain unchanged.

-- Source: 0000_create_paid_access_passes.sql
CREATE TABLE IF NOT EXISTS `access_passes` (
`id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),  `user_id` VARCHAR(36) NOT NULL,
  `payment_session_id` VARCHAR(255) NOT NULL,
  `payment_customer_id` LONGTEXT,
  `price_id` LONGTEXT NOT NULL,  `access_days` integer NOT NULL CHECK (access_days IN (30, 180, 365)),
  `status` LONGTEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'refunded', 'failed')),
  `environment` VARCHAR(255) NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'live')),  `starts_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),  `expires_at` DATETIME(6) NOT NULL,  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE (payment_session_id, environment)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Source: 0002_create_astronomical_catalog_tables.sql
CREATE TABLE IF NOT EXISTS `astronomical_catalogs` (
`id` VARCHAR(255) PRIMARY KEY,
  `name` LONGTEXT NOT NULL,
  `provider` LONGTEXT NOT NULL,
  `version` LONGTEXT NOT NULL,
  `description` LONGTEXT,
  `homepage_url` LONGTEXT NOT NULL,
  `tap_endpoint` LONGTEXT,
  `license` LONGTEXT NOT NULL,
  `attribution` LONGTEXT NOT NULL,
  `bibcode` LONGTEXT,  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Source: 0002_create_astronomical_catalog_tables.sql
CREATE TABLE IF NOT EXISTS `catalog_batches` (
`id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  `catalog_id` VARCHAR(255) NOT NULL REFERENCES astronomical_catalogs(id),  `batch_number` integer NOT NULL,
  `status` LONGTEXT NOT NULL DEFAULT 'staging' CHECK (status IN ('staging', 'validating', 'published', 'failed', 'superseded')),  `object_count` integer NOT NULL DEFAULT 0,  `metadata` JSON NOT NULL DEFAULT '{}',  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),  `published_at` DATETIME(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Source: 0002_create_astronomical_catalog_tables.sql
CREATE TABLE IF NOT EXISTS `astronomical_objects` (
`canonical_id` VARCHAR(255) PRIMARY KEY,
  `name` LONGTEXT NOT NULL,  `alternate_names` JSON NOT NULL DEFAULT '[]',
  `object_type` VARCHAR(255) NOT NULL CHECK (
    object_type IN (
      'star', 'exoplanet', 'galaxy', 'nebula', 'black_hole',
      'pulsar', 'neutron_star', 'quasar', 'solar_system_body',
      'cluster', 'supernova_remnant'
    )
  ),
  `subtype` LONGTEXT,
  `parent_host_id` VARCHAR(255),
  `primary_catalog_id` VARCHAR(255) NOT NULL REFERENCES astronomical_catalogs(id),
  `primary_source_id` VARCHAR(255) NOT NULL,
  `status` LONGTEXT NOT NULL DEFAULT 'observational' CHECK (status IN ('observational', 'inferred', 'simulated')),  `confidence` DOUBLE NOT NULL DEFAULT 1.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),  `ra_deg` DOUBLE NOT NULL CHECK (ra_deg >= 0.0 AND ra_deg < 360.0),  `dec_deg` DOUBLE NOT NULL CHECK (dec_deg >= -90.0 AND dec_deg <= 90.0),
  `coordinate_frame` LONGTEXT NOT NULL DEFAULT 'ICRS',
  `reference_epoch` LONGTEXT NOT NULL DEFAULT 'J2000.0',  `distance_ly` DOUBLE NOT NULL CHECK (distance_ly >= 0.0),  `distance_uncertainty_ly` DOUBLE,
  `distance_method` LONGTEXT,  `parallax_mas` DOUBLE,  `parallax_error_mas` DOUBLE,  `proper_motion_ra_mas_yr` DOUBLE,  `proper_motion_dec_mas_yr` DOUBLE,  `radial_velocity_km_s` DOUBLE,  `redshift` DOUBLE,  `redshift_uncertainty` DOUBLE,
  
  
  `spectral_type` LONGTEXT,
  `morphological_class` LONGTEXT,  `temperature_k` DOUBLE,  `luminosity_solar` DOUBLE,  `mass_solar` DOUBLE,  `radius_solar` DOUBLE,  `physical_properties` JSON NOT NULL DEFAULT '{}',  `orbital_elements` JSON,  `data_quality_flags` JSON NOT NULL DEFAULT '[]',
  
  
  `source_url` LONGTEXT,
  `catalog_version` LONGTEXT NOT NULL,  `retrieval_timestamp` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `license` LONGTEXT NOT NULL,
  `attribution` LONGTEXT NOT NULL,
  `bibcode` LONGTEXT,
  
  
  `spatial_tile_id` VARCHAR(255) NOT NULL,  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  
  CONSTRAINT uq_catalog_source UNIQUE (primary_catalog_id, primary_source_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Source: 0002_create_astronomical_catalog_tables.sql
CREATE TABLE IF NOT EXISTS `catalog_measurements` (
`id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  `canonical_id` VARCHAR(255) NOT NULL REFERENCES astronomical_objects(canonical_id) ON DELETE CASCADE,
  `catalog_id` VARCHAR(255) NOT NULL REFERENCES astronomical_catalogs(id),
  `parameter_name` LONGTEXT NOT NULL,  `parameter_value` JSON NOT NULL,  `uncertainty` JSON,
  `method` LONGTEXT,
  `bibcode` LONGTEXT,
  `citation` LONGTEXT,  `retrieval_timestamp` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Source: 0003_create_academy_student_profiles.sql
CREATE TABLE IF NOT EXISTS `student_profiles` (
`user_id` VARCHAR(36) PRIMARY KEY REFERENCES auth_user(id) ON DELETE CASCADE,
  `student_public_id` VARCHAR(255) NOT NULL UNIQUE,
  `display_name` LONGTEXT NOT NULL DEFAULT 'Cosmic Explorer',
  `certificate_name` LONGTEXT NOT NULL DEFAULT 'Cosmic Explorer',
  `selected_level` LONGTEXT NOT NULL DEFAULT 'explorer' CHECK (selected_level IN ('junior', 'explorer', 'astronomer')),
  `preferred_language` LONGTEXT NOT NULL DEFAULT 'en',
  `age_bracket` LONGTEXT NOT NULL DEFAULT '13_to_17' CHECK (age_bracket IN ('under_13', '13_to_17', '18_plus')),
  `guardian_consent_status` LONGTEXT NOT NULL DEFAULT 'not_required' CHECK (guardian_consent_status IN ('not_required', 'pending_guardian', 'guardian_consented', 'verified_adult')),
  `guardian_email` LONGTEXT,  `guardian_consent_date` DATETIME(6),
  `profile_visibility` LONGTEXT NOT NULL DEFAULT 'private' CHECK (profile_visibility IN ('private', 'students_only', 'public')),  `accessibility_settings` JSON NOT NULL DEFAULT '{"reducedMotion":false,"highContrast":false,"soundEffects":false,"fontSize":"normal","dyslexiaFriendlyFont":false,"screenReaderFriendly":false}',  `learning_settings` JSON NOT NULL DEFAULT '{"autoAdvanceAudio":false,"hintMode":true,"voiceGuide":true,"dailyGoalMinutes":15}',  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Source: 0003_create_academy_student_profiles.sql
CREATE TABLE IF NOT EXISTS `academy_module_progress` (
`id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),  `user_id` VARCHAR(36) NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  `module_id` VARCHAR(255) NOT NULL CHECK (module_id REGEXP '^[0-2][0-9]$'),
  `status` LONGTEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),  `percent` integer NOT NULL DEFAULT 0 CHECK (percent >= 0 AND percent <= 100),  `time_spent_seconds` integer NOT NULL DEFAULT 0,  `verified_quiz_passed` boolean NOT NULL DEFAULT false,  `first_started_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),  `completed_at` DATETIME(6),  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE (user_id, module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Source: 0003_create_academy_student_profiles.sql
CREATE TABLE IF NOT EXISTS `academy_stage_badges` (
`id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),  `user_id` VARCHAR(36) NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,  `stage_id` integer NOT NULL CHECK (stage_id BETWEEN 1 AND 6),
  `badge_id` LONGTEXT NOT NULL,  `awarded_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE (user_id, stage_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Source: 0004_create_secure_learning_database.sql
CREATE TABLE IF NOT EXISTS `academy_courses` (
`id` VARCHAR(255) PRIMARY KEY,
  `title` LONGTEXT NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description` LONGTEXT NOT NULL,  `total_stages` integer NOT NULL DEFAULT 6,  `total_modules` integer NOT NULL DEFAULT 24,  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Source: 0004_create_secure_learning_database.sql
CREATE TABLE IF NOT EXISTS `academy_course_versions` (
`id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  `course_id` VARCHAR(255) NOT NULL REFERENCES academy_courses(id) ON DELETE RESTRICT,
  `version` VARCHAR(255) NOT NULL,
  `status` LONGTEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'deprecated', 'archived')),  `curriculum_metadata` JSON NOT NULL DEFAULT '{}',  `passing_exam_threshold` DOUBLE NOT NULL DEFAULT 80.0,  `published_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE (course_id, version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Source: 0004_create_secure_learning_database.sql
CREATE TABLE IF NOT EXISTS `academy_modules` (
`id` VARCHAR(255) PRIMARY KEY, 
  `course_id` VARCHAR(255) NOT NULL REFERENCES academy_courses(id) ON DELETE RESTRICT,  `stage_id` integer NOT NULL CHECK (stage_id BETWEEN 1 AND 6),  `number` integer NOT NULL CHECK (number BETWEEN 1 AND 24),
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `title` LONGTEXT NOT NULL,
  `subtitle` LONGTEXT NOT NULL,
  `description` LONGTEXT NOT NULL,  `estimated_minutes` integer NOT NULL DEFAULT 30,  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Source: 0004_create_secure_learning_database.sql
CREATE TABLE IF NOT EXISTS `academy_module_versions` (
`id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  `module_id` VARCHAR(255) NOT NULL REFERENCES academy_modules(id) ON DELETE CASCADE,
  `version` VARCHAR(255) NOT NULL DEFAULT '1.0.0',
  `completion_rule_version` LONGTEXT NOT NULL DEFAULT '1.0.0',  `required_evidence_types` JSON NOT NULL DEFAULT '["interactive_experiment","knowledge_quiz"]',  `minimum_quiz_score_pct` DOUBLE NOT NULL DEFAULT 80.0,  `is_active` boolean NOT NULL DEFAULT true,  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE (module_id, version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Source: 0004_create_secure_learning_database.sql
CREATE TABLE IF NOT EXISTS `academy_lessons` (
`id` VARCHAR(255) PRIMARY KEY,
  `module_id` VARCHAR(255) NOT NULL REFERENCES academy_modules(id) ON DELETE CASCADE,  `order_index` integer NOT NULL DEFAULT 1,
  `title` LONGTEXT NOT NULL,
  `visualization_type` LONGTEXT NOT NULL,  `objectives` JSON NOT NULL DEFAULT '[]',  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Source: 0004_create_secure_learning_database.sql
CREATE TABLE IF NOT EXISTS `academy_enrollments` (
`id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),  `user_id` VARCHAR(36) NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  `course_id` VARCHAR(255) NOT NULL REFERENCES academy_courses(id) ON DELETE RESTRICT,
  `course_version` LONGTEXT NOT NULL DEFAULT '1.0.0',  `enrolled_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `status` LONGTEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  UNIQUE (user_id, course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Source: 0004_create_secure_learning_database.sql
CREATE TABLE IF NOT EXISTS `academy_lesson_progress` (
`id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),  `user_id` VARCHAR(36) NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  `module_id` VARCHAR(255) NOT NULL REFERENCES academy_modules(id) ON DELETE CASCADE,
  `lesson_id` VARCHAR(255) NOT NULL REFERENCES academy_lessons(id) ON DELETE CASCADE,  `scroll_depth_percent` integer NOT NULL DEFAULT 0 CHECK (scroll_depth_percent BETWEEN 0 AND 100),  `time_spent_seconds` integer NOT NULL DEFAULT 0,  `is_bookmarked` boolean NOT NULL DEFAULT false,  `last_accessed_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE (user_id, lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Source: 0004_create_secure_learning_database.sql
CREATE TABLE IF NOT EXISTS `academy_activity_evidence` (
`id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),  `user_id` VARCHAR(36) NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  `module_id` VARCHAR(255) NOT NULL REFERENCES academy_modules(id) ON DELETE CASCADE,
  `activity_type` LONGTEXT NOT NULL,  `evidence_payload` JSON NOT NULL DEFAULT '{}',  `client_timestamp` DATETIME(6) NOT NULL,
  `verification_status` LONGTEXT NOT NULL DEFAULT 'submitted' CHECK (verification_status IN ('submitted', 'verified', 'rejected')),  `verified_at` DATETIME(6),  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Source: 0004_create_secure_learning_database.sql
CREATE TABLE IF NOT EXISTS `academy_assessment_attempts` (
`id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),  `user_id` VARCHAR(36) NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  `assessment_id` LONGTEXT NOT NULL,
  `assessment_version` LONGTEXT NOT NULL DEFAULT '1.0.0',
  `question_set_version` LONGTEXT NOT NULL DEFAULT '1.0.0',  `assigned_question_ids` JSON NOT NULL DEFAULT '[]',  `answers_payload` JSON NOT NULL,  `score` integer NOT NULL,  `total_points` integer NOT NULL,  `percentage` DOUBLE NOT NULL,  `passed` boolean NOT NULL,  `client_duration_seconds` integer,
  `idempotency_key` VARCHAR(255) UNIQUE,  `submitted_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Source: 0004_create_secure_learning_database.sql
CREATE TABLE IF NOT EXISTS `academy_verified_completions` (
`id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),  `user_id` VARCHAR(36) NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  `module_id` VARCHAR(255) NOT NULL REFERENCES academy_modules(id) ON DELETE CASCADE,
  `module_version` LONGTEXT NOT NULL DEFAULT '1.0.0',
  `approved_rule_version` LONGTEXT NOT NULL DEFAULT '1.0.0',  `qualifying_assessment_attempt_id` VARCHAR(36) REFERENCES academy_assessment_attempts(id) ON DELETE RESTRICT,  `qualifying_evidence_ids` JSON NOT NULL DEFAULT '[]',  `verified_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `idempotency_key` VARCHAR(255) NOT NULL UNIQUE,  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE (user_id, module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Source: 0004_create_secure_learning_database.sql
CREATE TABLE IF NOT EXISTS `academy_stage_achievements` (
`id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),  `user_id` VARCHAR(36) NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,  `stage_id` integer NOT NULL CHECK (stage_id BETWEEN 1 AND 6),
  `badge_id` LONGTEXT NOT NULL,
  `stage_rule_version` LONGTEXT NOT NULL DEFAULT '1.0.0',  `qualifying_module_ids` JSON NOT NULL,  `awarded_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE (user_id, stage_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Source: 0004_create_secure_learning_database.sql
CREATE TABLE IF NOT EXISTS `academy_certificate_eligibility` (
`id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),  `user_id` VARCHAR(36) NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  `course_id` VARCHAR(255) NOT NULL REFERENCES academy_courses(id) ON DELETE RESTRICT,
  `course_version` VARCHAR(255) NOT NULL DEFAULT '1.0.0',  `all_stages_completed` boolean NOT NULL DEFAULT false,  `final_exam_passed` boolean NOT NULL DEFAULT false,  `final_exam_score_pct` DOUBLE,  `eligible_at` DATETIME(6),  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE (user_id, course_id, course_version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Source: 0004_create_secure_learning_database.sql
CREATE TABLE IF NOT EXISTS `academy_certificates` (
`id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  `certificate_number` VARCHAR(255) NOT NULL UNIQUE,  `user_id` VARCHAR(36) NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  `student_public_id` LONGTEXT NOT NULL,
  `display_name` LONGTEXT NOT NULL,
  `certificate_name` LONGTEXT NOT NULL,
  `learning_level` LONGTEXT NOT NULL CHECK (learning_level IN ('junior', 'explorer', 'astronomer')),
  `course_id` VARCHAR(255) NOT NULL REFERENCES academy_courses(id) ON DELETE RESTRICT,
  `course_version` LONGTEXT NOT NULL,
  `curriculum_version` LONGTEXT NOT NULL DEFAULT '1.0.0',  `final_score_percentage` DOUBLE NOT NULL,  `issue_date` date NOT NULL DEFAULT CURRENT_DATE,
  `verification_hash` LONGTEXT NOT NULL,
  `status` LONGTEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'superseded')),
  `revocation_reason` LONGTEXT,  `revoked_at` DATETIME(6),  `metadata` JSON NOT NULL DEFAULT '{}',  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Source: 0004_create_secure_learning_database.sql
CREATE TABLE IF NOT EXISTS `academy_audit_log` (
`id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),  `actor_id` VARCHAR(36) REFERENCES auth_user(id) ON DELETE SET NULL,
  `actor_role` LONGTEXT NOT NULL CHECK (actor_role IN ('student', 'service_role', 'admin', 'system')),
  `action` LONGTEXT NOT NULL,
  `entity_type` LONGTEXT NOT NULL,
  `entity_id` LONGTEXT NOT NULL,  `previous_state` JSON,  `new_state` JSON,
  `ip_hash` LONGTEXT,
  `user_agent_hash` LONGTEXT,
  `idempotency_key` LONGTEXT,  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Source: 0005_subscription_administration.sql
CREATE TABLE IF NOT EXISTS `access_admin_audit` (
`request_id` VARCHAR(36) PRIMARY KEY,
  `actor_id` VARCHAR(36) NOT NULL REFERENCES auth_user(id),
  `user_id` VARCHAR(36) NOT NULL REFERENCES auth_user(id),
 `environment` VARCHAR(255) NOT NULL CHECK (environment IN ('live','sandbox')),
  `access_days` integer NOT NULL CHECK (access_days IN (30,180,365)),
 `reason` LONGTEXT NOT NULL CHECK (length(reason) BETWEEN 3 AND 500),
  `expires_at` DATETIME(6) NOT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
