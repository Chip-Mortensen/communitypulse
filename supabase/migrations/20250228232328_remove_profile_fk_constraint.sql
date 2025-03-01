-- Migration to remove the foreign key constraint on profiles.id
-- This allows us to seed profiles without needing corresponding auth.users entries

-- Drop the foreign key constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add a comment explaining why this was done
COMMENT ON TABLE profiles IS 'User profiles with foreign key constraint to auth.users removed to facilitate seeding';
