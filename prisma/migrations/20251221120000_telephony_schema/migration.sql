-- PhoneBurner-style dialer schema
-- This migration mirrors prisma/schema.prisma and is commented so the file acts
-- as lightweight documentation. IDs use text with a gen_random_uuid() default
-- to stay compatible with cuid()-style string identifiers.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "Campaign" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "dialingMode" TEXT NOT NULL,
  "fromStrategy" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "numberPoolId" TEXT,
  "scriptId" TEXT,
  "voicemailAssetId" TEXT,
  "quietHours" JSONB,
  "throttlePerMinute" INTEGER,
  "timezonePolicy" TEXT,
  "defaultDisposition" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "ContactList" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Contact" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "listId" TEXT,
  "tenantId" TEXT NOT NULL,
  "name" TEXT,
  "phone" TEXT NOT NULL,
  "timezone" TEXT,
  "tags" TEXT,
  "consentFlags" JSONB,
  "dncFlag" BOOLEAN NOT NULL DEFAULT FALSE,
  "lastDisposition" TEXT,
  "lastCallAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "CallSession" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "campaignId" TEXT NOT NULL,
  "contactId" TEXT NOT NULL,
  "agentId" TEXT,
  "provider" TEXT NOT NULL,
  "fromNumber" TEXT,
  "toNumber" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "startedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "connectedAt" TIMESTAMPTZ,
  "endedAt" TIMESTAMPTZ,
  "durationSec" INTEGER,
  "recordingId" TEXT,
  "recordingUrl" TEXT,
  "disposition" TEXT,
  "notes" TEXT,
  "webhookKey" TEXT UNIQUE
);

CREATE TABLE "Disposition" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "campaignId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "outcome" TEXT NOT NULL,
  "followUp" TEXT,
  "nextAt" TIMESTAMPTZ
);

CREATE TABLE "VoicemailAsset" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "mediaUrl" TEXT NOT NULL,
  "transcription" TEXT,
  "durationSec" INTEGER,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "ProviderCredential" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "encryptedConfig" JSONB NOT NULL,
  "capabilities" JSONB,
  "healthState" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "NumberPool" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "numbers" JSONB NOT NULL,
  "locales" JSONB,
  "health" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "MessageSequence" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "campaignId" TEXT NOT NULL,
  "step" INTEGER NOT NULL,
  "channel" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "delayMinutes" INTEGER NOT NULL
);

CREATE TABLE "ComplianceRule" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL UNIQUE,
  "quietHours" JSONB,
  "dncSources" JSONB,
  "recordingPolicy" TEXT,
  "consentRequired" BOOLEAN NOT NULL DEFAULT FALSE,
  "smsOptOutKeywords" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "AuditLog" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "actorId" TEXT,
  "tenantId" TEXT,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "payload" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Foreign keys and indexes reflect prisma relations and query hot paths
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_listId_fkey" FOREIGN KEY ("listId") REFERENCES "ContactList"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CallSession" ADD CONSTRAINT "CallSession_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CallSession" ADD CONSTRAINT "CallSession_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Disposition" ADD CONSTRAINT "Disposition_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MessageSequence" ADD CONSTRAINT "MessageSequence_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "CallSession_campaignId_idx" ON "CallSession"("campaignId");
CREATE INDEX "CallSession_contactId_idx" ON "CallSession"("contactId");
CREATE INDEX "CallSession_status_idx" ON "CallSession"("status");
CREATE INDEX "Disposition_campaignId_idx" ON "Disposition"("campaignId");
CREATE INDEX "MessageSequence_campaignId_idx" ON "MessageSequence"("campaignId");
CREATE INDEX "ProviderCredential_tenant_provider_idx" ON "ProviderCredential"("tenantId", "provider");
CREATE INDEX "AuditLog_tenant_entity_idx" ON "AuditLog"("tenantId", "entityType");
