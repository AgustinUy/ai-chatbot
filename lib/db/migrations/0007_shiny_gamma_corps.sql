CREATE TABLE IF NOT EXISTS "Assistant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"instructions" text NOT NULL,
	"persona" text,
	"userId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_assistant_userId" ON "Assistant"("userId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_assistant_active" ON "Assistant"("isActive");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Assistant" ADD CONSTRAINT "Assistant_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
