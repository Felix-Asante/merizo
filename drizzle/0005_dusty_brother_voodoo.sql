-- create enum for split type
-- drop old enum type
DROP TYPE "public"."split_type" CASCADE;--> statement-breakpoint

CREATE TYPE "split_type" AS ENUM ('percentage', 'equal', 'exact', 'custom'); --> statement-breakpoint

-- -- alter expense table to use new split type (cast via text: old enum split_type -> new enum split_types)
-- ALTER TABLE "expense" ALTER COLUMN "split_type" SET DATA TYPE "public"."split_types" USING "expense"."split_type"::text::"public"."split_types";--> statement-breakpoint
-- ALTER TABLE "expense" ALTER COLUMN "split_type" SET DEFAULT 'equal';--> statement-breakpoint