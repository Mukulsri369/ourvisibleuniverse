ALTER TABLE auth_user ADD COLUMN isAnonymous BOOLEAN DEFAULT false;
ALTER TABLE academy_activity_evidence
  ADD COLUMN request_id VARCHAR(120),
  ADD COLUMN payload_hash CHAR(64),
  ADD UNIQUE KEY academy_evidence_request (user_id,request_id);
ALTER TABLE academy_certificates
  MODIFY course_version VARCHAR(64) NOT NULL,
  ADD COLUMN signature_version INT NOT NULL DEFAULT 1,
  ADD COLUMN active_scope VARCHAR(400) GENERATED ALWAYS AS
    (IF(status='active',CONCAT(user_id,':',course_id,':',course_version),NULL)) STORED,
  ADD UNIQUE KEY academy_one_active_certificate (active_scope);
CREATE TABLE academy_certificate_operations (
  request_id VARCHAR(36) PRIMARY KEY,
  actor_id VARCHAR(36) NOT NULL,
  certificate_number VARCHAR(255) NOT NULL,
  operation VARCHAR(20) NOT NULL,
  payload_hash CHAR(64) NOT NULL,
  result JSON NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  FOREIGN KEY (actor_id) REFERENCES auth_user(id) ON DELETE RESTRICT,
  CHECK (operation IN ('revoke','correct','reissue'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
