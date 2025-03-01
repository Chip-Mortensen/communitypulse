-- Insert upvotes for CommunityPulse database
-- This script adds approximately 100 upvotes with realistic distribution across issues

BEGIN;

-- 5. INSERT SAMPLE UPVOTES
-- ------------------------
-- Insert approximately 100 upvotes with realistic distribution

-- First, delete any existing test upvotes to avoid duplication
DELETE FROM upvotes 
WHERE user_id IN (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000006',
  '10000000-0000-0000-0000-000000000007',
  '10000000-0000-0000-0000-000000000008',
  '10000000-0000-0000-0000-000000000009',
  '10000000-0000-0000-0000-000000000010',
  '10000000-0000-0000-0000-000000000011',
  '10000000-0000-0000-0000-000000000012',
  '10000000-0000-0000-0000-000000000013',
  '10000000-0000-0000-0000-000000000014',
  '10000000-0000-0000-0000-000000000015'
);

-- Function to get issue ID by title (for use in the upvotes)
CREATE OR REPLACE FUNCTION get_issue_id(issue_title TEXT) 
RETURNS UUID AS $$
DECLARE
  issue_id UUID;
BEGIN
  SELECT id INTO issue_id FROM issues WHERE title = issue_title LIMIT 1;
  RETURN issue_id;
END;
$$ LANGUAGE plpgsql;

-- Now insert upvotes using the function to get issue IDs
INSERT INTO upvotes (user_id, issue_id)
VALUES
  -- Upvotes for "Dangerous Intersection at Lamar and 5th" (popular issue with 15 upvotes)
  (
    '10000000-0000-0000-0000-000000000001',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),
  (
    '10000000-0000-0000-0000-000000000011',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),
  (
    '10000000-0000-0000-0000-000000000012',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),
  (
    '10000000-0000-0000-0000-000000000013',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),
  (
    '10000000-0000-0000-0000-000000000014',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),
  (
    '10000000-0000-0000-0000-000000000015',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),

  -- Upvotes for "Bike Lane Obstruction on Guadalupe" (9 upvotes)
  (
    '10000000-0000-0000-0000-000000000001',
    get_issue_id('Bike Lane Obstruction on Guadalupe')
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    get_issue_id('Bike Lane Obstruction on Guadalupe')
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    get_issue_id('Bike Lane Obstruction on Guadalupe')
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    get_issue_id('Bike Lane Obstruction on Guadalupe')
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    get_issue_id('Bike Lane Obstruction on Guadalupe')
  ),
  (
    '10000000-0000-0000-0000-000000000011',
    get_issue_id('Bike Lane Obstruction on Guadalupe')
  ),
  (
    '10000000-0000-0000-0000-000000000013',
    get_issue_id('Bike Lane Obstruction on Guadalupe')
  ),
  (
    '10000000-0000-0000-0000-000000000014',
    get_issue_id('Bike Lane Obstruction on Guadalupe')
  ),
  (
    '10000000-0000-0000-0000-000000000015',
    get_issue_id('Bike Lane Obstruction on Guadalupe')
  ),

  -- Upvotes for "Illegal Dumping at Barton Creek Greenbelt" (12 upvotes)
  (
    '10000000-0000-0000-0000-000000000001',
    get_issue_id('Illegal Dumping at Barton Creek Greenbelt')
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    get_issue_id('Illegal Dumping at Barton Creek Greenbelt')
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    get_issue_id('Illegal Dumping at Barton Creek Greenbelt')
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    get_issue_id('Illegal Dumping at Barton Creek Greenbelt')
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    get_issue_id('Illegal Dumping at Barton Creek Greenbelt')
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    get_issue_id('Illegal Dumping at Barton Creek Greenbelt')
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    get_issue_id('Illegal Dumping at Barton Creek Greenbelt')
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    get_issue_id('Illegal Dumping at Barton Creek Greenbelt')
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    get_issue_id('Illegal Dumping at Barton Creek Greenbelt')
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    get_issue_id('Illegal Dumping at Barton Creek Greenbelt')
  ),
  (
    '10000000-0000-0000-0000-000000000012',
    get_issue_id('Illegal Dumping at Barton Creek Greenbelt')
  ),
  (
    '10000000-0000-0000-0000-000000000015',
    get_issue_id('Illegal Dumping at Barton Creek Greenbelt')
  ),

  -- Upvotes for "Recurring Flooding on Lamar Under 38th" (10 upvotes)
  (
    '10000000-0000-0000-0000-000000000001',
    get_issue_id('Recurring Flooding on Lamar Under 38th')
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    get_issue_id('Recurring Flooding on Lamar Under 38th')
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    get_issue_id('Recurring Flooding on Lamar Under 38th')
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    get_issue_id('Recurring Flooding on Lamar Under 38th')
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    get_issue_id('Recurring Flooding on Lamar Under 38th')
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    get_issue_id('Recurring Flooding on Lamar Under 38th')
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    get_issue_id('Recurring Flooding on Lamar Under 38th')
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    get_issue_id('Recurring Flooding on Lamar Under 38th')
  ),
  (
    '10000000-0000-0000-0000-000000000012',
    get_issue_id('Recurring Flooding on Lamar Under 38th')
  ),
  (
    '10000000-0000-0000-0000-000000000015',
    get_issue_id('Recurring Flooding on Lamar Under 38th')
  ),

  -- Upvotes for "Broken Streetlights on East 11th" (7 upvotes)
  (
    '10000000-0000-0000-0000-000000000001',
    get_issue_id('Broken Streetlights on East 11th')
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    get_issue_id('Broken Streetlights on East 11th')
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    get_issue_id('Broken Streetlights on East 11th')
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    get_issue_id('Broken Streetlights on East 11th')
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    get_issue_id('Broken Streetlights on East 11th')
  ),
  (
    '10000000-0000-0000-0000-000000000011',
    get_issue_id('Broken Streetlights on East 11th')
  ),
  (
    '10000000-0000-0000-0000-000000000013',
    get_issue_id('Broken Streetlights on East 11th')
  ),

  -- Upvotes for "Neglected Median on Congress Avenue" (3 upvotes)
  (
    '10000000-0000-0000-0000-000000000002',
    get_issue_id('Neglected Median on Congress Avenue')
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    get_issue_id('Neglected Median on Congress Avenue')
  ),
  (
    '10000000-0000-0000-0000-000000000014',
    get_issue_id('Neglected Median on Congress Avenue')
  ),

  -- Upvotes for "Inaccessible Sidewalk on Medical Parkway" (8 upvotes)
  (
    '10000000-0000-0000-0000-000000000001',
    get_issue_id('Inaccessible Sidewalk on Medical Parkway')
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    get_issue_id('Inaccessible Sidewalk on Medical Parkway')
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    get_issue_id('Inaccessible Sidewalk on Medical Parkway')
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    get_issue_id('Inaccessible Sidewalk on Medical Parkway')
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    get_issue_id('Inaccessible Sidewalk on Medical Parkway')
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    get_issue_id('Inaccessible Sidewalk on Medical Parkway')
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    get_issue_id('Inaccessible Sidewalk on Medical Parkway')
  ),
  (
    '10000000-0000-0000-0000-000000000012',
    get_issue_id('Inaccessible Sidewalk on Medical Parkway')
  ),

  -- Upvotes for "Historic Building Deterioration on 6th Street" (5 upvotes)
  (
    '10000000-0000-0000-0000-000000000002',
    get_issue_id('Historic Building Deterioration on 6th Street')
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    get_issue_id('Historic Building Deterioration on 6th Street')
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    get_issue_id('Historic Building Deterioration on 6th Street')
  ),
  (
    '10000000-0000-0000-0000-000000000013',
    get_issue_id('Historic Building Deterioration on 6th Street')
  ),
  (
    '10000000-0000-0000-0000-000000000015',
    get_issue_id('Historic Building Deterioration on 6th Street')
  ),

  -- Upvotes for "Poor Lighting on West Campus Walking Routes" (11 upvotes)
  (
    '10000000-0000-0000-0000-000000000001',
    get_issue_id('Poor Lighting on West Campus Walking Routes')
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    get_issue_id('Poor Lighting on West Campus Walking Routes')
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    get_issue_id('Poor Lighting on West Campus Walking Routes')
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    get_issue_id('Poor Lighting on West Campus Walking Routes')
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    get_issue_id('Poor Lighting on West Campus Walking Routes')
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    get_issue_id('Poor Lighting on West Campus Walking Routes')
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    get_issue_id('Poor Lighting on West Campus Walking Routes')
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    get_issue_id('Poor Lighting on West Campus Walking Routes')
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    get_issue_id('Poor Lighting on West Campus Walking Routes')
  ),
  (
    '10000000-0000-0000-0000-000000000011',
    get_issue_id('Poor Lighting on West Campus Walking Routes')
  ),
  (
    '10000000-0000-0000-0000-000000000014',
    get_issue_id('Poor Lighting on West Campus Walking Routes')
  ),

  -- Upvotes for "Dangerous Pothole on Shoal Creek Blvd" (6 upvotes)
  (
    '10000000-0000-0000-0000-000000000001',
    get_issue_id('Dangerous Pothole on Shoal Creek Blvd')
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    get_issue_id('Dangerous Pothole on Shoal Creek Blvd')
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    get_issue_id('Dangerous Pothole on Shoal Creek Blvd')
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    get_issue_id('Dangerous Pothole on Shoal Creek Blvd')
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    get_issue_id('Dangerous Pothole on Shoal Creek Blvd')
  ),
  (
    '10000000-0000-0000-0000-000000000011',
    get_issue_id('Dangerous Pothole on Shoal Creek Blvd')
  ),

  -- Upvotes for "Invasive Species Taking Over Bull Creek" (4 upvotes)
  (
    '10000000-0000-0000-0000-000000000003',
    get_issue_id('Invasive Species Taking Over Bull Creek')
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    get_issue_id('Invasive Species Taking Over Bull Creek')
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    get_issue_id('Invasive Species Taking Over Bull Creek')
  ),
  (
    '10000000-0000-0000-0000-000000000015',
    get_issue_id('Invasive Species Taking Over Bull Creek')
  ),

  -- Upvotes for "Food Desert in Montopolis Neighborhood" (7 upvotes)
  (
    '10000000-0000-0000-0000-000000000001',
    get_issue_id('Food Desert in Montopolis Neighborhood')
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    get_issue_id('Food Desert in Montopolis Neighborhood')
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    get_issue_id('Food Desert in Montopolis Neighborhood')
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    get_issue_id('Food Desert in Montopolis Neighborhood')
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    get_issue_id('Food Desert in Montopolis Neighborhood')
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    get_issue_id('Food Desert in Montopolis Neighborhood')
  ),
  (
    '10000000-0000-0000-0000-000000000014',
    get_issue_id('Food Desert in Montopolis Neighborhood')
  ),

  -- Upvotes for "Inadequate Public Space at Mueller Development" (3 upvotes)
  (
    '10000000-0000-0000-0000-000000000001',
    get_issue_id('Inadequate Public Space at Mueller Development')
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    get_issue_id('Inadequate Public Space at Mueller Development')
  ),
  (
    '10000000-0000-0000-0000-000000000013',
    get_issue_id('Inadequate Public Space at Mueller Development')
  ),

  -- Upvotes for "Playground Equipment Damaged at Maplewood Elementary" (5 upvotes)
  (
    '10000000-0000-0000-0000-000000000001',
    get_issue_id('Playground Equipment Damaged at Maplewood Elementary')
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    get_issue_id('Playground Equipment Damaged at Maplewood Elementary')
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    get_issue_id('Playground Equipment Damaged at Maplewood Elementary')
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    get_issue_id('Playground Equipment Damaged at Maplewood Elementary')
  ),
  (
    '10000000-0000-0000-0000-000000000013',
    get_issue_id('Playground Equipment Damaged at Maplewood Elementary')
  ),

  -- Upvotes for "Community Garden Water Access at Festival Beach" (2 upvotes)
  (
    '10000000-0000-0000-0000-000000000002',
    get_issue_id('Community Garden Water Access at Festival Beach')
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    get_issue_id('Community Garden Water Access at Festival Beach')
  ),

  -- Upvotes for "No Accessible Entrance at South Austin Clinic" (3 upvotes)
  (
    '10000000-0000-0000-0000-000000000004',
    get_issue_id('No Accessible Entrance at South Austin Clinic')
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    get_issue_id('No Accessible Entrance at South Austin Clinic')
  ),
  (
    '10000000-0000-0000-0000-000000000012',
    get_issue_id('No Accessible Entrance at South Austin Clinic')
  );

-- Drop the temporary function
DROP FUNCTION get_issue_id;

COMMIT; 