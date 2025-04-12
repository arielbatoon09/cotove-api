CREATE TABLE "otp" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"token" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"expires_at" timestamp,
	"blacklisted" boolean DEFAULT false,
	"attempts" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "otp" ADD CONSTRAINT "otp_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "otp_expires_at_idx" ON "otp" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "otp_user_id_idx" ON "otp" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "otp_token_idx" ON "otp" USING btree ("token");--> statement-breakpoint
CREATE INDEX "otp_type_idx" ON "otp" USING btree ("type");--> statement-breakpoint
CREATE INDEX "otp_attempts_idx" ON "otp" USING btree ("attempts");