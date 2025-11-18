-- Rollback Migration: Remove Magic Links table
-- Description: Drops the magic_links table and all related indexes
-- Date: 2025-11-11

-- Drop indexes first
DROP INDEX IF EXISTS idx_magic_links_is_used;
DROP INDEX IF EXISTS idx_magic_links_expires_at;
DROP INDEX IF EXISTS idx_magic_links_email;
DROP INDEX IF EXISTS idx_magic_links_token;

-- Drop table
DROP TABLE IF EXISTS magic_links CASCADE;

