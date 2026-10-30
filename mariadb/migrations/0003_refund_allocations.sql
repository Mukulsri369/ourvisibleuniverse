-- Allocation provenance supports the approved unused-time refund policy.
-- Existing/legacy records remain version 0 until explicitly reconciled; no entitlement is inferred here.
ALTER TABLE access_passes ADD COLUMN IF NOT EXISTS allocated_starts_at DATETIME(6);
ALTER TABLE access_passes ADD COLUMN IF NOT EXISTS allocated_expires_at DATETIME(6);
ALTER TABLE access_passes ADD COLUMN IF NOT EXISTS original_expires_at DATETIME(6);
ALTER TABLE access_passes ADD COLUMN IF NOT EXISTS parent_pass_id VARCHAR(36);
ALTER TABLE access_passes ADD COLUMN IF NOT EXISTS expiry_is_fixed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE access_passes ADD COLUMN IF NOT EXISTS allocation_version TINYINT UNSIGNED NOT NULL DEFAULT 0;
ALTER TABLE access_passes ADD CONSTRAINT IF NOT EXISTS access_allocation_shape_check CHECK (
  allocation_version=0 OR (allocation_version=1 AND allocated_starts_at IS NOT NULL
    AND allocated_expires_at IS NOT NULL AND original_expires_at IS NOT NULL
    AND allocated_expires_at>=allocated_starts_at)
);
ALTER TABLE access_passes ADD CONSTRAINT IF NOT EXISTS access_allocation_not_self_check
  CHECK(parent_pass_id IS NULL OR parent_pass_id<>id);
ALTER TABLE access_passes ADD FOREIGN KEY IF NOT EXISTS access_allocation_parent_fk
  (parent_pass_id) REFERENCES access_passes(id);
CREATE INDEX IF NOT EXISTS access_allocation_parent_idx ON access_passes(parent_pass_id,user_id,environment);

ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS refund_unused_microseconds BIGINT UNSIGNED NOT NULL DEFAULT 0;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS refund_rebased_at DATETIME(6);

CREATE TABLE IF NOT EXISTS entitlement_refund_adjustments (
  id VARCHAR(36) PRIMARY KEY,
  environment VARCHAR(16) NOT NULL,
  payment_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(36) NOT NULL REFERENCES auth_user(id),
  pass_id VARCHAR(36) NOT NULL REFERENCES access_passes(id),
  previous_expiry DATETIME(6) NOT NULL,
  updated_expiry DATETIME(6) NOT NULL,
  removed_microseconds BIGINT UNSIGNED NOT NULL CHECK(removed_microseconds>0),
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  FOREIGN KEY(environment,payment_id) REFERENCES payment_transactions(environment,payment_id),
  UNIQUE(environment,payment_id,pass_id),
  INDEX(user_id,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
