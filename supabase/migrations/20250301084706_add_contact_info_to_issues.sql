-- Add contact_info column to issues table
ALTER TABLE issues ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN issues.contact_info IS 'Stores AI-generated government contact information for the issue';
