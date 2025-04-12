CREATE TABLE "tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"token" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"expires_at" timestamp,
	"blacklisted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"name" varchar(100),
	"is_active" boolean DEFAULT true,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tokens_id_idx" ON "tokens" USING btree ("id");--> statement-breakpoint
CREATE INDEX "tokens_user_id_idx" ON "tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tokens_created_at_idx" ON "tokens" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tokens_updated_at_idx" ON "tokens" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "tokens_token_idx" ON "tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "tokens_type_idx" ON "tokens" USING btree ("type");--> statement-breakpoint
CREATE INDEX "users_id_idx" ON "users" USING btree ("id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "users_last_login_idx" ON "users" USING btree ("last_login");--> statement-breakpoint
CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");