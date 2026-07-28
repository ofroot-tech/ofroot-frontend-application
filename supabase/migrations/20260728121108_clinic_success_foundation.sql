-- OfRoot Technology Clinic Success Platform foundation.
--
-- Target: mkgycihcekojbvmsexgv only.
-- This migration is intentionally NOT applied by this work. It must first pass
-- drift, RLS, rollback, and non-production validation.
--
-- Privacy boundary: these records contain clinic operations and opaque
-- referral lifecycle attribution only. They must never contain patient health
-- data, Health sessions, reports, symptoms, diagnoses, medications, notes, or
-- health-bearing intake.

BEGIN;

CREATE SCHEMA clinic_success;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'clinic_success_receiver'
  ) THEN
    CREATE ROLE clinic_success_receiver NOLOGIN;
  END IF;
END
$$;

REVOKE ALL ON SCHEMA clinic_success FROM PUBLIC;
REVOKE ALL ON SCHEMA clinic_success FROM anon;
REVOKE ALL ON SCHEMA clinic_success FROM authenticated;
REVOKE ALL ON SCHEMA clinic_success FROM service_role;

CREATE TABLE clinic_success.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 160),
  timezone TEXT NOT NULL CHECK (length(btrim(timezone)) BETWEEN 1 AND 64),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (id, timezone)
);

CREATE TABLE clinic_success.clinic_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinic_success.clinics(id) ON DELETE RESTRICT,
  name TEXT NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 160),
  timezone TEXT NOT NULL CHECK (length(btrim(timezone)) BETWEEN 1 AND 64),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, id)
);

CREATE TABLE clinic_success.referral_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinic_success.clinics(id) ON DELETE RESTRICT,
  label TEXT NOT NULL CHECK (length(btrim(label)) BETWEEN 1 AND 160),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, id)
);

CREATE TABLE clinic_success.clinic_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinic_success.clinics(id) ON DELETE RESTRICT,
  clinic_location_id UUID,
  campaign_id UUID,
  state TEXT NOT NULL DEFAULT 'issued'
    CHECK (state IN ('issued', 'revoked', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, id),
  CONSTRAINT clinic_referrals_location_scope_fk
    FOREIGN KEY (clinic_id, clinic_location_id)
    REFERENCES clinic_success.clinic_locations(clinic_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT clinic_referrals_campaign_scope_fk
    FOREIGN KEY (clinic_id, campaign_id)
    REFERENCES clinic_success.referral_campaigns(clinic_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT clinic_referrals_revocation_consistency
    CHECK (
      (state = 'revoked' AND revoked_at IS NOT NULL)
      OR (state <> 'revoked' AND revoked_at IS NULL)
    )
);

CREATE TABLE clinic_success.referral_event_receipts (
  event_id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL,
  clinic_referral_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'clinic_referral.opened',
      'clinic_referral.signup_started',
      'clinic_referral.account_created',
      'clinic_referral.activated',
      'clinic_referral.timeline_viewed',
      'clinic_referral.report_generated'
    )
  ),
  schema_version TEXT NOT NULL CHECK (schema_version = '1.0-draft'),
  signature_version TEXT NOT NULL CHECK (signature_version = 'v1'),
  raw_body_sha256 TEXT NOT NULL CHECK (raw_body_sha256 ~ '^[0-9a-f]{64}$'),
  occurred_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, event_id),
  CONSTRAINT referral_event_receipts_referral_scope_fk
    FOREIGN KEY (clinic_id, clinic_referral_id)
    REFERENCES clinic_success.clinic_referrals(clinic_id, id)
    ON DELETE RESTRICT
);

CREATE TABLE clinic_success.referral_lifecycle_events (
  event_id UUID PRIMARY KEY
    REFERENCES clinic_success.referral_event_receipts(event_id) ON DELETE RESTRICT,
  clinic_id UUID NOT NULL,
  clinic_referral_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'clinic_referral.opened',
      'clinic_referral.signup_started',
      'clinic_referral.account_created',
      'clinic_referral.activated',
      'clinic_referral.timeline_viewed',
      'clinic_referral.report_generated'
    )
  ),
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT referral_lifecycle_events_referral_scope_fk
    FOREIGN KEY (clinic_id, clinic_referral_id)
    REFERENCES clinic_success.clinic_referrals(clinic_id, id)
    ON DELETE RESTRICT
);

CREATE TABLE clinic_success.clinic_lifecycle_aggregates (
  clinic_id UUID NOT NULL REFERENCES clinic_success.clinics(id) ON DELETE RESTRICT,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'clinic_referral.opened',
      'clinic_referral.signup_started',
      'clinic_referral.account_created',
      'clinic_referral.activated',
      'clinic_referral.timeline_viewed',
      'clinic_referral.report_generated'
    )
  ),
  bucket_date DATE NOT NULL,
  event_count BIGINT NOT NULL DEFAULT 0 CHECK (event_count >= 0),
  last_event_at TIMESTAMPTZ,
  source_fresh_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (clinic_id, event_type, bucket_date)
);

CREATE TABLE clinic_success.crm_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinic_success.clinics(id) ON DELETE RESTRICT,
  provider TEXT NOT NULL CHECK (length(btrim(provider)) BETWEEN 1 AND 64),
  connection_state TEXT NOT NULL DEFAULT 'planned'
    CHECK (connection_state IN ('planned', 'disabled', 'paused')),
  configuration_reference TEXT,
  last_attempt_at TIMESTAMPTZ,
  last_successful_sync_at TIMESTAMPTZ,
  last_failure_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, id),
  UNIQUE (clinic_id, provider)
);

CREATE TABLE clinic_success.crm_external_record_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL,
  destination_id UUID NOT NULL,
  clinic_referral_id UUID NOT NULL,
  external_record_id TEXT NOT NULL
    CHECK (length(btrim(external_record_id)) BETWEEN 1 AND 255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT crm_external_record_maps_destination_scope_fk
    FOREIGN KEY (clinic_id, destination_id)
    REFERENCES clinic_success.crm_destinations(clinic_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT crm_external_record_maps_referral_scope_fk
    FOREIGN KEY (clinic_id, clinic_referral_id)
    REFERENCES clinic_success.clinic_referrals(clinic_id, id)
    ON DELETE RESTRICT,
  UNIQUE (clinic_id, destination_id, clinic_referral_id),
  UNIQUE (clinic_id, destination_id, external_record_id)
);

CREATE TABLE clinic_success.crm_sync_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL,
  destination_id UUID NOT NULL,
  event_id UUID NOT NULL,
  state TEXT NOT NULL DEFAULT 'planned'
    CHECK (state IN ('planned', 'blocked')),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  last_attempt_at TIMESTAMPTZ,
  failure_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT crm_sync_outbox_destination_scope_fk
    FOREIGN KEY (clinic_id, destination_id)
    REFERENCES clinic_success.crm_destinations(clinic_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT crm_sync_outbox_event_scope_fk
    FOREIGN KEY (clinic_id, event_id)
    REFERENCES clinic_success.referral_event_receipts(clinic_id, event_id)
    ON DELETE RESTRICT,
  UNIQUE (destination_id, event_id)
);

CREATE INDEX clinic_referrals_clinic_created_idx
  ON clinic_success.clinic_referrals (clinic_id, created_at DESC);
CREATE INDEX referral_lifecycle_events_clinic_occurred_idx
  ON clinic_success.referral_lifecycle_events (clinic_id, occurred_at DESC);
CREATE INDEX crm_sync_outbox_clinic_state_idx
  ON clinic_success.crm_sync_outbox (clinic_id, state, created_at);

CREATE FUNCTION clinic_success.prevent_external_record_identity_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.clinic_id IS DISTINCT FROM OLD.clinic_id
    OR NEW.destination_id IS DISTINCT FROM OLD.destination_id
    OR NEW.clinic_referral_id IS DISTINCT FROM OLD.clinic_referral_id
    OR NEW.external_record_id IS DISTINCT FROM OLD.external_record_id
  THEN
    RAISE EXCEPTION 'CRM external record identity is immutable';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER crm_external_record_maps_identity_immutable
BEFORE UPDATE ON clinic_success.crm_external_record_maps
FOR EACH ROW
EXECUTE FUNCTION clinic_success.prevent_external_record_identity_change();

ALTER TABLE clinic_success.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_success.clinics FORCE ROW LEVEL SECURITY;
ALTER TABLE clinic_success.clinic_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_success.clinic_locations FORCE ROW LEVEL SECURITY;
ALTER TABLE clinic_success.referral_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_success.referral_campaigns FORCE ROW LEVEL SECURITY;
ALTER TABLE clinic_success.clinic_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_success.clinic_referrals FORCE ROW LEVEL SECURITY;
ALTER TABLE clinic_success.referral_event_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_success.referral_event_receipts FORCE ROW LEVEL SECURITY;
ALTER TABLE clinic_success.referral_lifecycle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_success.referral_lifecycle_events FORCE ROW LEVEL SECURITY;
ALTER TABLE clinic_success.clinic_lifecycle_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_success.clinic_lifecycle_aggregates FORCE ROW LEVEL SECURITY;
ALTER TABLE clinic_success.crm_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_success.crm_destinations FORCE ROW LEVEL SECURITY;
ALTER TABLE clinic_success.crm_external_record_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_success.crm_external_record_maps FORCE ROW LEVEL SECURITY;
ALTER TABLE clinic_success.crm_sync_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_success.crm_sync_outbox FORCE ROW LEVEL SECURITY;

REVOKE ALL ON ALL TABLES IN SCHEMA clinic_success FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA clinic_success FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA clinic_success FROM authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA clinic_success FROM service_role;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA clinic_success FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA clinic_success FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA clinic_success FROM authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA clinic_success FROM service_role;

GRANT USAGE ON SCHEMA clinic_success TO clinic_success_receiver;
GRANT SELECT, INSERT
  ON clinic_success.referral_event_receipts
  TO clinic_success_receiver;
GRANT INSERT
  ON clinic_success.referral_lifecycle_events
  TO clinic_success_receiver;
GRANT SELECT, INSERT, UPDATE
  ON clinic_success.clinic_lifecycle_aggregates
  TO clinic_success_receiver;

CREATE POLICY clinic_success_receiver_receipt_select
  ON clinic_success.referral_event_receipts
  FOR SELECT
  TO clinic_success_receiver
  USING (true);
CREATE POLICY clinic_success_receiver_receipt_insert
  ON clinic_success.referral_event_receipts
  FOR INSERT
  TO clinic_success_receiver
  WITH CHECK (true);
CREATE POLICY clinic_success_receiver_event_insert
  ON clinic_success.referral_lifecycle_events
  FOR INSERT
  TO clinic_success_receiver
  WITH CHECK (true);
CREATE POLICY clinic_success_receiver_aggregate_insert
  ON clinic_success.clinic_lifecycle_aggregates
  FOR INSERT
  TO clinic_success_receiver
  WITH CHECK (true);
CREATE POLICY clinic_success_receiver_aggregate_select
  ON clinic_success.clinic_lifecycle_aggregates
  FOR SELECT
  TO clinic_success_receiver
  USING (true);
CREATE POLICY clinic_success_receiver_aggregate_update
  ON clinic_success.clinic_lifecycle_aggregates
  FOR UPDATE
  TO clinic_success_receiver
  USING (true)
  WITH CHECK (true);

COMMENT ON SCHEMA clinic_success IS
  'OfRoot Technology clinic operations and opaque referral attribution only. No patient health data.';
COMMENT ON TABLE clinic_success.referral_event_receipts IS
  'Verified operational event metadata only; raw request bodies and health details are prohibited.';
COMMENT ON TABLE clinic_success.crm_sync_outbox IS
  'Disconnected Phase 2 CRM readiness queue. No live CRM delivery is authorized.';

COMMIT;
