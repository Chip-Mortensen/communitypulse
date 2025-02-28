-- Remove the neighborhood field from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS neighborhood;

-- First, create a new column for location as JSON if it doesn't exist as JSONB already
DO $$ 
BEGIN
  -- Check if location is already JSONB
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'location' 
    AND data_type = 'jsonb'
  ) THEN
    -- Location is already JSONB, no need to modify
    RAISE NOTICE 'Location column is already JSONB, skipping conversion';
  ELSE
    -- Create a temporary column for the new JSONB location
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_coords JSONB;
    
    -- Initialize with null coordinates
    UPDATE profiles 
    SET location_coords = jsonb_build_object('lat', NULL, 'lng', NULL);
    
    -- Drop the old location column (if it exists and is not JSONB)
    ALTER TABLE profiles DROP COLUMN IF EXISTS location;
    
    -- Rename the new column to the original name
    ALTER TABLE profiles RENAME COLUMN location_coords TO location;
  END IF;
END $$;

-- Add a city column for verified location display
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;

-- Add comments to the columns
COMMENT ON COLUMN profiles.location IS 'Private user location as a JSON object with lat and lng fields';
COMMENT ON COLUMN profiles.city IS 'Verified city name based on user location coordinates';
