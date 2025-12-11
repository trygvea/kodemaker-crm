-- Data migration: Set NULL assignedToUserId to createdByUserId before adding NOT NULL constraint
UPDATE "followups" SET "assigned_to_user_id" = "created_by_user_id" WHERE "assigned_to_user_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "followups" DROP CONSTRAINT "followups_created_by_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "followups" DROP CONSTRAINT "followups_assigned_to_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "followups" ALTER COLUMN "created_by_user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "followups" ALTER COLUMN "assigned_to_user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "followups" ADD CONSTRAINT "followups_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followups" ADD CONSTRAINT "followups_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
