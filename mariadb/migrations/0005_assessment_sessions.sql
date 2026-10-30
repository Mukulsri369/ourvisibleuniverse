-- Private server-issued question snapshots survive process restarts and bank changes.
CREATE TABLE academy_assessment_sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  module_id VARCHAR(20) NOT NULL,
  learning_level VARCHAR(20) NOT NULL,
  mode VARCHAR(20) NOT NULL,
  course_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  question_snapshot JSON NOT NULL,
  passing_score_pct DOUBLE NOT NULL,
  started_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  expires_at DATETIME(6) NOT NULL,
  submission_key VARCHAR(120),
  submission_hash CHAR(64),
  verdict JSON,
  recorded_attempt_id VARCHAR(36),
  submitted_at DATETIME(6),
  FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_attempt_id) REFERENCES academy_assessment_attempts(id) ON DELETE RESTRICT,
  UNIQUE KEY academy_submission_owner (user_id,submission_key),
  KEY academy_session_owner (user_id,started_at),
  CHECK (module_id='exam' OR module_id REGEXP '^(0[1-9]|1[0-9]|2[0-4])$'),
  CHECK (learning_level IN ('junior','explorer','astronomer')),
  CHECK (mode IN ('practice','official')),
  CHECK (passing_score_pct BETWEEN 0 AND 100),
  CHECK (expires_at > started_at),
  CHECK ((submitted_at IS NULL AND submission_key IS NULL AND submission_hash IS NULL
    AND verdict IS NULL AND recorded_attempt_id IS NULL)
    OR (submitted_at IS NOT NULL AND submission_key IS NOT NULL AND submission_hash IS NOT NULL
    AND verdict IS NOT NULL AND recorded_attempt_id IS NOT NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
