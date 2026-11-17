-- Apply explicitly after checking the target database and existing pipeline.
-- No application startup or public request runs migrations.
BEGIN;
SET LOCAL lock_timeout = '3s';
CREATE TABLE public.ofroot_partner_inquiry_receipts (
  request_id UUID PRIMARY KEY,
  payload_hash TEXT NOT NULL,
  inquiry_id BIGINT NOT NULL UNIQUE REFERENCES public.ofroot_sales_inquiries(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE public.ofroot_partner_inquiry_limits (
  bucket TEXT PRIMARY KEY,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL CHECK (request_count > 0)
);
-- These server-only tables must not inherit public Data API access.
ALTER TABLE public.ofroot_partner_inquiry_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ofroot_partner_inquiry_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ofroot_partner_inquiry_receipts, public.ofroot_partner_inquiry_limits FROM PUBLIC;
DO $$
DECLARE role_name TEXT;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
      EXECUTE format('REVOKE ALL ON public.ofroot_partner_inquiry_receipts, public.ofroot_partner_inquiry_limits FROM %I', role_name);
    END IF;
  END LOOP;
END $$;
COMMIT;
