-- Migrate existing contact emails to contact_emails table
INSERT INTO "contact_emails" ("contact_id", "email", "active", "created_at")
SELECT 
  id, 
  email, 
  true, 
  created_at
FROM "contacts" 
WHERE email IS NOT NULL AND email != '';