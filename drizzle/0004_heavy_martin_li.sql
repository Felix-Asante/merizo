-- create enum for split type
CREATE TYPE "split_type" AS ENUM ('percentage', 'equal', 'exact',"custom");
--> statement-breakpoint
ALTER TABLE "expense" ADD COLUMN "split_type" "split_type" DEFAULT 'equal' NOT NULL;