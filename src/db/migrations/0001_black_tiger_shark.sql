CREATE TYPE "public"."record_type" AS ENUM('income', 'expense');--> statement-breakpoint
CREATE TYPE "public"."audit_action" AS ENUM('login', 'create', 'update', 'delete', 'status_change', 'role_change');--> statement-breakpoint
CREATE TABLE "financial_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"type" "record_type" NOT NULL,
	"category" varchar(100) NOT NULL,
	"date" date NOT NULL,
	"notes" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" "audit_action" NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "financial_records" ADD CONSTRAINT "financial_records_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "financial_records_date_type_idx" ON "financial_records" USING btree ("date","type");--> statement-breakpoint
CREATE INDEX "financial_records_category_idx" ON "financial_records" USING btree ("category");--> statement-breakpoint
CREATE INDEX "financial_records_created_by_idx" ON "financial_records" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "financial_records_deleted_at_idx" ON "financial_records" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_user_idx" ON "audit_logs" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");