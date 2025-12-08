ALTER TABLE "contact_company_history" ADD COLUMN "role" text;

-- Migrate existing role data from contacts table to contact_company_history
-- For contacts with active company history entries (endDate IS NULL), migrate their role
UPDATE "contact_company_history" cch
SET "role" = c.role
FROM "contacts" c
WHERE cch."contact_id" = c.id
  AND cch."end_date" IS NULL
  AND c.role IS NOT NULL
  AND cch."role" IS NULL
  AND cch."id" = (
    SELECT id FROM "contact_company_history" cch2
    WHERE cch2."contact_id" = c.id
      AND cch2."end_date" IS NULL
    ORDER BY cch2."start_date" DESC
    LIMIT 1
  );