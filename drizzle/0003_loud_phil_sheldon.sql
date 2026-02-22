-- create enum for monthly period status
CREATE TYPE "monthly_period_status" AS ENUM ('open', 'finalized');
--> statement-breakpoint

CREATE TABLE "expense" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"note" text,
	"organization_id" text NOT NULL,
	"paid_by_user_id" text NOT NULL,
	"amount" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expense_date" timestamp NOT NULL,
	"period_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense_split" (
	"id" text PRIMARY KEY NOT NULL,
	"expense_id" text NOT NULL,
	"member_id" text NOT NULL,
	"amount" numeric NOT NULL,
	"percentage" numeric
);
--> statement-breakpoint
CREATE TABLE "monthly_periods" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"status" "monthly_period_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"finalized_at" timestamp,
	"finalized_by_user_id" text
);
--> statement-breakpoint
CREATE TABLE "settlement_items" (
	"id" text PRIMARY KEY NOT NULL,
	"settlement_id" text NOT NULL,
	"from_member_id" text NOT NULL,
	"to_member_id" text NOT NULL,
	"amount" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settlements" (
	"id" text PRIMARY KEY NOT NULL,
	"period_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_paid_by_user_id_member_id_fk" FOREIGN KEY ("paid_by_user_id") REFERENCES "public"."member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_period_id_monthly_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."monthly_periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_split" ADD CONSTRAINT "expense_split_expense_id_expense_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expense"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_split" ADD CONSTRAINT "expense_split_member_id_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_periods" ADD CONSTRAINT "monthly_periods_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_periods" ADD CONSTRAINT "monthly_periods_finalized_by_user_id_member_id_fk" FOREIGN KEY ("finalized_by_user_id") REFERENCES "public"."member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlement_items" ADD CONSTRAINT "settlement_items_settlement_id_settlements_id_fk" FOREIGN KEY ("settlement_id") REFERENCES "public"."settlements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlement_items" ADD CONSTRAINT "settlement_items_from_member_id_member_id_fk" FOREIGN KEY ("from_member_id") REFERENCES "public"."member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlement_items" ADD CONSTRAINT "settlement_items_to_member_id_member_id_fk" FOREIGN KEY ("to_member_id") REFERENCES "public"."member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_period_id_monthly_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."monthly_periods"("id") ON DELETE cascade ON UPDATE no action;