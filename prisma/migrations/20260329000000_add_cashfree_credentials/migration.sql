-- Migration: Add cashfree credentials for restaurants
-- Created: 2026-03-29

BEGIN;

ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "cashfreeAppId" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "cashfreeSecret" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "cashfreeWebhookSecret" TEXT;

COMMIT;
