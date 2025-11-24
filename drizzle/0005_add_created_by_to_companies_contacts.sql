ALTER TABLE "companies"
ADD COLUMN "created_by_user_id" integer REFERENCES "users"("id");

ALTER TABLE "contacts"
ADD COLUMN "created_by_user_id" integer REFERENCES "users"("id");


