-- Apply explicitly after checking the target database and existing pipeline.
-- No application startup or public request runs migrations.
BEGIN;
SET LOCAL lock_timeout = '3s';
CREATE TABLE ofroot_partner_inquiry_receipts (
  request_id UUID PRIMARY KEY,
  payload_hash TEXT NOT NULL,
  inquiry_id BIGINT NOT NULL UNIQUE REFERENCES ofroot_sales_inquiries(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE ofroot_partner_inquiry_limits (
  bucket TEXT PRIMARY KEY,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL CHECK (request_count > 0)
);
COMMIT;
