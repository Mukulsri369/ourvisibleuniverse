-- Independent authorization and durable payment bookkeeping. No production records are seeded.
CREATE TABLE IF NOT EXISTS app_roles (
  user_id VARCHAR(36) NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  role VARCHAR(32) NOT NULL CHECK (role IN ('owner','admin')),
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (user_id,role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS legacy_identity_map (
  legacy_user_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES auth_user(id),
  imported_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS entitlement_locks (
  user_id VARCHAR(36) NOT NULL REFERENCES auth_user(id),
  environment VARCHAR(16) NOT NULL CHECK (environment IN ('sandbox','live')),
  PRIMARY KEY(user_id,environment)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS payment_orders (
  environment VARCHAR(16) NOT NULL CHECK (environment IN ('sandbox','live')),
  order_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(36) NOT NULL REFERENCES auth_user(id),
  plan_id VARCHAR(80) NOT NULL,
  access_days INT NOT NULL CHECK (access_days IN (30,180,365)),
  amount_minor BIGINT UNSIGNED NOT NULL CHECK (amount_minor>0),
  currency CHAR(3) NOT NULL CHECK (currency IN ('INR','USD')),
  state VARCHAR(24) NOT NULL DEFAULT 'created' CHECK (state IN ('created','paid','failed')),
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY(environment,order_id), INDEX(user_id,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS payment_transactions (
  environment VARCHAR(16) NOT NULL,
  payment_id VARCHAR(100) NOT NULL,
  order_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(36) NOT NULL REFERENCES auth_user(id),
  amount_minor BIGINT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL,
  state VARCHAR(24) NOT NULL CHECK (state IN ('captured','partially_refunded','refunded','failed')),
  refunded_minor BIGINT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY(environment,payment_id),
  UNIQUE(environment,order_id),
  FOREIGN KEY(environment,order_id) REFERENCES payment_orders(environment,order_id),
  CHECK(refunded_minor<=amount_minor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS payment_events (
  environment VARCHAR(16) NOT NULL CHECK (environment IN ('sandbox','live')),
  event_id VARCHAR(160) NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  body_sha256 CHAR(64) NOT NULL,
  state VARCHAR(24) NOT NULL DEFAULT 'received' CHECK (state IN ('received','processed')),
  received_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  processed_at DATETIME(6),
  PRIMARY KEY(environment,event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS admin_access_changes (
  request_id VARCHAR(36) PRIMARY KEY,
  actor_id VARCHAR(36) NOT NULL REFERENCES auth_user(id),
  user_id VARCHAR(36) NOT NULL REFERENCES auth_user(id),
  environment VARCHAR(16) NOT NULL CHECK (environment IN ('sandbox','live')),
  action VARCHAR(32) NOT NULL CHECK (action IN ('grant','revoke','set_expiry','set_role','remove_role')),
  reason VARCHAR(500) NOT NULL CHECK (CHAR_LENGTH(TRIM(reason)) BETWEEN 3 AND 500),
  parameters JSON NOT NULL,
  result JSON NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX(user_id,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE INDEX IF NOT EXISTS idx_access_user_expiry ON access_passes(user_id,environment,expires_at);
CREATE INDEX IF NOT EXISTS idx_astro_coords ON astronomical_objects(ra_deg,dec_deg);
CREATE INDEX IF NOT EXISTS idx_astro_distance ON astronomical_objects(distance_ly);
CREATE INDEX IF NOT EXISTS idx_astro_tile ON astronomical_objects(spatial_tile_id);
CREATE INDEX IF NOT EXISTS idx_astro_type ON astronomical_objects(object_type);
CREATE INDEX IF NOT EXISTS idx_astro_parent ON astronomical_objects(parent_host_id);
CREATE INDEX IF NOT EXISTS idx_measurement_object ON catalog_measurements(canonical_id);
CREATE INDEX IF NOT EXISTS idx_evidence_user_module ON academy_activity_evidence(user_id,module_id,created_at);
CREATE INDEX IF NOT EXISTS idx_assessment_user ON academy_assessment_attempts(user_id,submitted_at);
CREATE INDEX IF NOT EXISTS idx_certificate_user ON academy_certificates(user_id,created_at);
