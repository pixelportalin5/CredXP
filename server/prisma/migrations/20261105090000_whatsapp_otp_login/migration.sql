-- WhatsApp OTP login: verified mobile number on users, and a table of one-time codes.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone_verified" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "users_phone_verified_key" ON "users"("phone_verified");

CREATE TABLE IF NOT EXISTS "otp_codes" (
    "id" UUID NOT NULL,
    "phone" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "otp_codes_phone_created_at_idx" ON "otp_codes"("phone", "created_at" DESC);
