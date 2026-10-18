-- The owner's own WhatsApp contact link (https://wa.me/qr/…), copied from
-- WhatsApp → QR code. When set, the WhatsApp QR adds them as a contact
-- instead of opening a chat. Empty = not set.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "whatsappQr" TEXT NOT NULL DEFAULT '';
