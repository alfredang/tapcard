-- Synced user preferences (iOS Settings ⇄ web /settings).
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "countryCode" TEXT NOT NULL DEFAULT '65';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "qrMode" TEXT NOT NULL DEFAULT 'WHATSAPP';
