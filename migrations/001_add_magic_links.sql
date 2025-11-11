-- Migration: Add Magic Links table
-- Description: Creates the magic_links table for passwordless authentication
-- Date: 2025-11-11

CREATE TABLE IF NOT EXISTS magic_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);
CREATE INDEX IF NOT EXISTS idx_magic_links_email ON magic_links(email);
CREATE INDEX IF NOT EXISTS idx_magic_links_expires_at ON magic_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_magic_links_is_used ON magic_links(is_used);

-- Add comment to table
COMMENT ON TABLE magic_links IS 'Stores temporary magic links for passwordless authentication';
COMMENT ON COLUMN magic_links.id IS 'Unique identifier for the magic link record';
COMMENT ON COLUMN magic_links.email IS 'Email address associated with this magic link';
COMMENT ON COLUMN magic_links.token IS 'Unique token sent via email for authentication';
COMMENT ON COLUMN magic_links.expires_at IS 'Expiration timestamp (typically 15 minutes from creation)';
COMMENT ON COLUMN magic_links.is_used IS 'Flag indicating if the magic link has been used';
COMMENT ON COLUMN magic_links.created_at IS 'Timestamp when the magic link was created';

