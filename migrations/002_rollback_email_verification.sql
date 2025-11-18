-- Rollback Migration: Remove Email Verification from Users
-- Description: Removes is_email_verified column from users table
-- Date: 2025-11-11

-- Drop index
DROP INDEX IF EXISTS idx_users_is_email_verified;

-- Drop column
ALTER TABLE users DROP COLUMN IF EXISTS is_email_verified;

