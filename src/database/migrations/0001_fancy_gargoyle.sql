ALTER TABLE "users" ADD COLUMN "verified_at" timestamp;--> statement-breakpoint
CREATE INDEX "users_verified_at_idx" ON "users" USING btree ("verified_at");