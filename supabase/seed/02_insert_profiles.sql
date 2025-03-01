-- Insert profiles for CommunityPulse database
-- This script adds test user profiles

-- Enable error handling
\set ON_ERROR_STOP on

BEGIN;

-- 2. CREATE TEST PROFILES
-- ----------------------
-- Create 15 test profiles with specific UUIDs for easy deletion later

INSERT INTO profiles (
  id, 
  email, 
  full_name, 
  display_name, 
  avatar_url, 
  bio, 
  location, 
  city, 
  is_admin, 
  reputation_score,
  issues_reported,
  issues_resolved
)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'sarah.johnson@example.com',
    'Sarah Johnson',
    'SarahJ',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    'Urban planner passionate about improving Austin''s infrastructure and public spaces.',
    '{"lat": 30.2729, "lng": -97.7444}',
    'Austin',
    FALSE,
    45,
    8,
    3
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'michael.chen@example.com',
    'Michael Chen',
    'MikeC',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    'Software developer and cycling enthusiast concerned about road safety in Austin.',
    '{"lat": 30.2982, "lng": -97.7871}',
    'Austin',
    FALSE,
    32,
    5,
    2
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'jessica.rodriguez@example.com',
    'Jessica Rodriguez',
    'JessR',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
    'Environmental scientist working to keep Austin green and sustainable.',
    '{"lat": 30.2457, "lng": -97.7688}',
    'Austin',
    FALSE,
    28,
    6,
    1
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'david.wilson@example.com',
    'David Wilson',
    'DaveW',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    'Neighborhood watch volunteer focused on community safety in East Austin.',
    '{"lat": 30.3005, "lng": -97.7147}',
    'Austin',
    FALSE,
    15,
    3,
    0
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    'emma.garcia@example.com',
    'Emma Garcia',
    'EmmaG',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    'Teacher and parent concerned about pedestrian safety around schools.',
    '{"lat": 30.3087, "lng": -97.7131}',
    'Austin',
    FALSE,
    22,
    4,
    1
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    'james.taylor@example.com',
    'James Taylor',
    'JamesT',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    'Civil engineer interested in improving Austin''s drainage and flood prevention systems.',
    '{"lat": 30.2742, "lng": -97.7407}',
    'Austin',
    FALSE,
    38,
    7,
    4
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    'olivia.martinez@example.com',
    'Olivia Martinez',
    'OliviaM',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia',
    'Urban gardener and advocate for more green spaces in downtown Austin.',
    '{"lat": 30.2669, "lng": -97.7428}',
    'Austin',
    FALSE,
    19,
    4,
    1
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    'ethan.nguyen@example.com',
    'Ethan Nguyen',
    'EthanN',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan',
    'Transportation planner focused on improving public transit options in Austin.',
    '{"lat": 30.2849, "lng": -97.7341}',
    'Austin',
    FALSE,
    27,
    5,
    2
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    'sophia.patel@example.com',
    'Sophia Patel',
    'SophiaP',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
    'Healthcare worker concerned about accessibility issues in public spaces.',
    '{"lat": 30.3426, "lng": -97.7639}',
    'Austin',
    FALSE,
    31,
    6,
    3
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    'noah.williams@example.com',
    'Noah Williams',
    'NoahW',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah',
    'Small business owner in South Congress interested in neighborhood improvement.',
    '{"lat": 30.2470, "lng": -97.7501}',
    'Austin',
    FALSE,
    24,
    5,
    2
  ),
  (
    '10000000-0000-0000-0000-000000000011',
    'ava.thompson@example.com',
    'Ava Thompson',
    'AvaT',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Ava',
    'Dog owner advocating for better maintenance of Austin''s parks and trails.',
    '{"lat": 30.2674, "lng": -97.7729}',
    'Austin',
    FALSE,
    18,
    4,
    1
  ),
  (
    '10000000-0000-0000-0000-000000000012',
    'benjamin.kim@example.com',
    'Benjamin Kim',
    'BenK',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Benjamin',
    'Architect interested in preserving Austin''s historic buildings while supporting growth.',
    '{"lat": 30.2983, "lng": -97.7559}',
    'Austin',
    FALSE,
    29,
    6,
    2
  ),
  (
    '10000000-0000-0000-0000-000000000013',
    'mia.jackson@example.com',
    'Mia Jackson',
    'MiaJ',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
    'Community organizer working to address homelessness issues in Austin.',
    '{"lat": 30.2684, "lng": -97.7494}',
    'Austin',
    FALSE,
    35,
    7,
    3
  ),
  (
    '10000000-0000-0000-0000-000000000014',
    'lucas.gonzalez@example.com',
    'Lucas Gonzalez',
    'LucasG',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas',
    'Music venue manager concerned about noise regulations and neighborhood relations.',
    '{"lat": 30.2631, "lng": -97.7602}',
    'Austin',
    FALSE,
    21,
    4,
    1
  ),
  (
    '10000000-0000-0000-0000-000000000015',
    'isabella.foster@example.com',
    'Isabella Foster',
    'IzzyF',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella',
    'Student at UT Austin advocating for better lighting and safety around campus.',
    '{"lat": 30.2862, "lng": -97.7394}',
    'Austin',
    FALSE,
    17,
    3,
    0
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  display_name = EXCLUDED.display_name,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  location = EXCLUDED.location,
  city = EXCLUDED.city,
  is_admin = EXCLUDED.is_admin,
  reputation_score = EXCLUDED.reputation_score,
  issues_reported = EXCLUDED.issues_reported,
  issues_resolved = EXCLUDED.issues_resolved;

COMMIT; 