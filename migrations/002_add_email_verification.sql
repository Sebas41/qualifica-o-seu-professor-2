-- Migration: Add Email Verification to Users
-- Description: Adds is_email_verified column to users table
-- Date: 2025-11-11

-- Add is_email_verified column
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_is_email_verified ON users(is_email_verified);

-- Add comment to column
COMMENT ON COLUMN users.is_email_verified IS 'Indicates whether the user has verified their email address';

-- Optional: Set all admin users as verified by default
UPDATE users SET is_email_verified = TRUE WHERE role = 'admin';

