CREATE TYPE "public"."anchor_mode" AS ENUM('calendar', 'completion');--> statement-breakpoint
CREATE TYPE "public"."frequency_unit" AS ENUM('day', 'week', 'month', 'year');--> statement-breakpoint
CREATE TYPE "public"."occurrence_status" AS ENUM('scheduled', 'due', 'completed', 'skipped', 'overdue');--> statement-breakpoint
CREATE TABLE "itm_occurrences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"due_date" date NOT NULL,
	"scheduled_date" date NOT NULL,
	"window_start" date NOT NULL,
	"window_end" date NOT NULL,
	"status" "occurrence_status" DEFAULT 'scheduled' NOT NULL,
	"completed_at" date,
	CONSTRAINT "itm_occurrences_plan_template_due_unq" UNIQUE("plan_id","template_id","due_date")
);
--> statement-breakpoint
CREATE TABLE "itm_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"normative_profile" text DEFAULT 'nfpa25' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "itm_task_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"system" text NOT NULL,
	"activity" text NOT NULL,
	"description" text NOT NULL,
	"interval_unit" "frequency_unit" NOT NULL,
	"interval_count" integer NOT NULL,
	"tolerance_days" integer DEFAULT 0 NOT NULL,
	"anchor_mode" "anchor_mode" DEFAULT 'calendar' NOT NULL,
	"normative_ref" text NOT NULL,
	"source_ref" text[] DEFAULT '{}' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "itm_task_templates_key_unique" UNIQUE("key")
);
