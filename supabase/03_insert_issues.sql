-- Insert issues for CommunityPulse database
-- This script adds test issues for each profile

-- Enable error handling
\set ON_ERROR_STOP on

BEGIN;

-- 3. INSERT SAMPLE ISSUES
-- ----------------------
-- Insert 2 issues for each profile (30 total)

INSERT INTO issues (title, description, location, address, category, status, user_id)
VALUES
  -- Sarah Johnson (Urban Planner)
  (
    'Dangerous Intersection at Lamar and 5th',
    'The intersection at Lamar Blvd and 5th Street is extremely dangerous for pedestrians. There have been multiple near-misses and the crosswalk signal is too short for elderly residents to cross safely. This is a high priority issue that needs immediate attention.',
    '{"lat": 30.2681, "lng": -97.7506}',
    'Lamar Blvd & 5th St, Austin, TX 78703',
    'Safety',
    'open',
    '10000000-0000-0000-0000-000000000001'
  ),
  
  -- Michael Chen (Cyclist)
  (
    'Bike Lane Obstruction on Guadalupe',
    'The bike lane on Guadalupe Street near UT campus is frequently blocked by delivery vehicles and rideshare drop-offs, forcing cyclists into traffic. This is especially dangerous during rush hour.',
    '{"lat": 30.2954, "lng": -97.7419}',
    '2400 Guadalupe St, Austin, TX 78705',
    'Infrastructure',
    'open',
    '10000000-0000-0000-0000-000000000002'
  ),
  
  -- Jessica Rodriguez (Environmental Scientist)
  (
    'Illegal Dumping at Barton Creek Greenbelt',
    'Someone has dumped construction materials and household waste along the trail at Barton Creek Greenbelt. This is polluting the creek and endangering wildlife.',
    '{"lat": 30.2542, "lng": -97.8002}',
    'Barton Creek Greenbelt, Austin, TX 78746',
    'Environment',
    'open',
    '10000000-0000-0000-0000-000000000003'
  ),
  
  -- David Wilson (Neighborhood Watch)
  (
    'Broken Streetlights on East 11th',
    'Multiple streetlights are out on East 11th Street between Navasota and Waller, creating a safety hazard at night. The area is very dark and residents feel unsafe walking after sunset.',
    '{"lat": 30.2699, "lng": -97.7295}',
    '1100 E 11th St, Austin, TX 78702',
    'Safety',
    'in_progress',
    '10000000-0000-0000-0000-000000000004'
  ),
  
  -- Emma Garcia (Teacher)
  (
    'Unsafe School Crossing at Burnet Road',
    'The school crossing at Burnet Road near Anderson Lane lacks proper signage and the crossing guard position has been vacant. Children are at risk during morning drop-off and afternoon pickup times.',
    '{"lat": 30.3575, "lng": -97.7405}',
    'Burnet Rd & Anderson Ln, Austin, TX 78757',
    'Safety',
    'open',
    '10000000-0000-0000-0000-000000000005'
  ),
  
  -- James Taylor (Civil Engineer)
  (
    'Recurring Flooding on Lamar Under 38th',
    'The underpass on Lamar Boulevard at 38th Street floods during even moderate rainfall, making the road impassable and dangerous. This is a critical north-south corridor that needs better drainage.',
    '{"lat": 30.3051, "lng": -97.7372}',
    'Lamar Blvd & 38th St, Austin, TX 78705',
    'Infrastructure',
    'in_progress',
    '10000000-0000-0000-0000-000000000006'
  ),
  
  -- Olivia Martinez (Urban Gardener)
  (
    'Neglected Median on Congress Avenue',
    'The landscaped median on Congress Avenue between Riverside and Barton Springs is severely neglected. Plants are dead, irrigation is broken, and it''s becoming an eyesore in a prominent area of downtown.',
    '{"lat": 30.2561, "lng": -97.7451}',
    'Congress Ave & Riverside Dr, Austin, TX 78704',
    'Environment',
    'open',
    '10000000-0000-0000-0000-000000000007'
  ),
  
  -- Ethan Nguyen (Transportation Planner)
  (
    'Bus Stop Lacking Shelter on Riverside',
    'The heavily used bus stop on Riverside Drive near Pleasant Valley lacks any shelter, seating, or shade. Passengers are exposed to extreme heat and rain while waiting for buses.',
    '{"lat": 30.2397, "lng": -97.7164}',
    'Riverside Dr & Pleasant Valley Rd, Austin, TX 78741',
    'Public Services',
    'open',
    '10000000-0000-0000-0000-000000000008'
  ),
  
  -- Sophia Patel (Healthcare Worker)
  (
    'Inaccessible Sidewalk on Medical Parkway',
    'The sidewalk on Medical Parkway near Seton Hospital has multiple sections that are cracked, uneven, or completely broken, making it impossible for wheelchair users to navigate safely.',
    '{"lat": 30.3093, "lng": -97.7381}',
    '3501 Medical Parkway, Austin, TX 78756',
    'Infrastructure',
    'open',
    '10000000-0000-0000-0000-000000000009'
  ),
  
  -- Noah Williams (Small Business Owner)
  (
    'Persistent Graffiti on South Congress',
    'Several businesses on South Congress between Elizabeth and Annie Streets are repeatedly targeted with graffiti. The city''s removal service is taking weeks to respond, hurting local businesses.',
    '{"lat": 30.2484, "lng": -97.7508}',
    '1500 S Congress Ave, Austin, TX 78704',
    'Public Services',
    'open',
    '10000000-0000-0000-0000-000000000010'
  ),
  
  -- Ava Thompson (Dog Owner)
  (
    'Damaged Fencing at Auditorium Shores Dog Park',
    'The fencing at the off-leash dog area at Auditorium Shores has several holes and damaged sections, creating a safety hazard as dogs can escape into traffic on Riverside Drive.',
    '{"lat": 30.2613, "lng": -97.7527}',
    'Auditorium Shores, Austin, TX 78704',
    'Public Services',
    'in_progress',
    '10000000-0000-0000-0000-000000000011'
  ),
  
  -- Benjamin Kim (Architect)
  (
    'Historic Building Deterioration on 6th Street',
    'A historic building at 6th and Brazos is showing signs of serious structural deterioration. Pieces of facade have fallen to the sidewalk, creating a public safety hazard.',
    '{"lat": 30.2672, "lng": -97.7431}',
    '600 Brazos St, Austin, TX 78701',
    'Safety',
    'open',
    '10000000-0000-0000-0000-000000000012'
  ),
  
  -- Mia Jackson (Community Organizer)
  (
    'Abandoned Encampment Under Ben White Bridge',
    'There''s an abandoned homeless encampment under the Ben White Bridge at South 1st that needs cleanup. Trash and belongings remain and are creating sanitation issues for the area.',
    '{"lat": 30.2309, "lng": -97.7702}',
    'Ben White Blvd & S 1st St, Austin, TX 78704',
    'Public Services',
    'open',
    '10000000-0000-0000-0000-000000000013'
  ),
  
  -- Lucas Gonzalez (Music Venue Manager)
  (
    'Excessive Noise from Construction on Red River',
    'Construction on Red River Street is occurring well outside permitted hours (before 7am and after 8pm), disrupting residents and businesses in the entertainment district.',
    '{"lat": 30.2684, "lng": -97.7366}',
    '600 Red River St, Austin, TX 78701',
    'Other',
    'open',
    '10000000-0000-0000-0000-000000000014'
  ),
  
  -- Isabella Foster (Student)
  (
    'Poor Lighting on West Campus Walking Routes',
    'The walking routes between UT campus and West Campus apartments have insufficient lighting, particularly on Nueces and Rio Grande streets. Students walking home at night feel unsafe.',
    '{"lat": 30.2882, "lng": -97.7464}',
    'Nueces St & 24th St, Austin, TX 78705',
    'Safety',
    'open',
    '10000000-0000-0000-0000-000000000015'
  ),

  -- SECOND ISSUES FOR EACH PROFILE
  -- ------------------------------

  -- Sarah Johnson (Urban Planner) - Second Issue
  (
    'Inadequate Public Space at Mueller Development',
    'The new Mueller development lacks sufficient public gathering spaces. The existing parks are too small for community events and there are no public plazas for residents to congregate.',
    '{"lat": 30.2998, "lng": -97.7042}',
    'Mueller Development, Austin, TX 78723',
    'Public Services',
    'open',
    '10000000-0000-0000-0000-000000000001'
  ),
  
  -- Michael Chen (Cyclist) - Second Issue
  (
    'Dangerous Pothole on Shoal Creek Blvd',
    'There''s a large pothole in the bike lane on Shoal Creek Boulevard near 38th Street that has caused several cyclists to crash. It''s especially dangerous because it''s hidden by shadows from trees.',
    '{"lat": 30.3132, "lng": -97.7383}',
    'Shoal Creek Blvd & 38th St, Austin, TX 78731',
    'Infrastructure',
    'open',
    '10000000-0000-0000-0000-000000000002'
  ),
  
  -- Jessica Rodriguez (Environmental Scientist) - Second Issue
  (
    'Invasive Species Taking Over Bull Creek',
    'Invasive water hyacinth is rapidly spreading in Bull Creek, choking out native species and disrupting the ecosystem. This needs immediate attention before it spreads further downstream.',
    '{"lat": 30.3607, "lng": -97.7705}',
    'Bull Creek District Park, Austin, TX 78731',
    'Environment',
    'open',
    '10000000-0000-0000-0000-000000000003'
  ),
  
  -- David Wilson (Neighborhood Watch) - Second Issue
  (
    'Abandoned Vehicle on Chicon Street',
    'A vehicle has been abandoned on Chicon Street near 12th for over three weeks. It appears to have been stripped for parts and is now attracting illegal dumping around it.',
    '{"lat": 30.2741, "lng": -97.7193}',
    'Chicon St & 12th St, Austin, TX 78702',
    'Safety',
    'open',
    '10000000-0000-0000-0000-000000000004'
  ),
  
  -- Emma Garcia (Teacher) - Second Issue
  (
    'Playground Equipment Damaged at Maplewood Elementary',
    'Several pieces of playground equipment at Maplewood Elementary are broken and have sharp edges exposed. Children have received minor injuries and the area needs immediate repair.',
    '{"lat": 30.3009, "lng": -97.7066}',
    '3808 Maplewood Ave, Austin, TX 78722',
    'Safety',
    'in_progress',
    '10000000-0000-0000-0000-000000000005'
  ),
  
  -- James Taylor (Civil Engineer) - Second Issue
  (
    'Erosion Threatening Sidewalk on Cesar Chavez',
    'Significant soil erosion along Cesar Chavez Street near Pleasant Valley is undermining the sidewalk foundation. If not addressed soon, sections of the sidewalk will collapse into the lake.',
    '{"lat": 30.2509, "lng": -97.7140}',
    'Cesar Chavez St & Pleasant Valley Rd, Austin, TX 78702',
    'Infrastructure',
    'open',
    '10000000-0000-0000-0000-000000000006'
  ),
  
  -- Olivia Martinez (Urban Gardener) - Second Issue
  (
    'Community Garden Water Access at Festival Beach',
    'The Festival Beach Community Garden has inadequate water access points, forcing gardeners to drag heavy hoses across long distances. Additional spigots are needed throughout the garden.',
    '{"lat": 30.2520, "lng": -97.7327}',
    'Festival Beach Community Garden, Austin, TX 78702',
    'Environment',
    'open',
    '10000000-0000-0000-0000-000000000007'
  ),
  
  -- Ethan Nguyen (Transportation Planner) - Second Issue
  (
    'Missing Bus Route Connection in North Austin',
    'There is no direct bus connection between the Domain and the UT campus, forcing commuters to make multiple transfers. A direct route would significantly improve transit options.',
    '{"lat": 30.4019, "lng": -97.7252}',
    'The Domain, Austin, TX 78758',
    'Public Services',
    'open',
    '10000000-0000-0000-0000-000000000008'
  ),
  
  -- Sophia Patel (Healthcare Worker) - Second Issue
  (
    'No Accessible Entrance at South Austin Clinic',
    'The South Austin Community Health Center lacks a properly accessible entrance for wheelchair users. The current ramp is too steep and doesn''t meet ADA requirements.',
    '{"lat": 30.2272, "lng": -97.7654}',
    '2529 S 1st St, Austin, TX 78704',
    'Infrastructure',
    'in_progress',
    '10000000-0000-0000-0000-000000000009'
  ),
  
  -- Noah Williams (Small Business Owner) - Second Issue
  (
    'Insufficient Parking on South 1st Street',
    'The commercial district on South 1st Street between Oltorf and Mary has extremely limited parking, which is hurting small businesses. Customers frequently mention difficulty finding parking.',
    '{"lat": 30.2422, "lng": -97.7589}',
    'South 1st St & Annie St, Austin, TX 78704',
    'Infrastructure',
    'open',
    '10000000-0000-0000-0000-000000000010'
  ),
  
  -- Ava Thompson (Dog Owner) - Second Issue
  (
    'Overgrown Trail at Turkey Creek',
    'The hiking trail at Turkey Creek is severely overgrown, making it difficult to navigate, especially with dogs. Several sections are almost impassable due to fallen trees and brush.',
    '{"lat": 30.3229, "lng": -97.8188}',
    'Turkey Creek Trail, Austin, TX 78733',
    'Environment',
    'open',
    '10000000-0000-0000-0000-000000000011'
  ),
  
  -- Benjamin Kim (Architect) - Second Issue
  (
    'Neglected Historic Home in Clarksville',
    'A historically significant home in Clarksville is falling into severe disrepair. This 1920s craftsman bungalow is part of Austin''s architectural heritage and needs preservation attention.',
    '{"lat": 30.2809, "lng": -97.7583}',
    'Clarksville Historic District, Austin, TX 78703',
    'Other',
    'open',
    '10000000-0000-0000-0000-000000000012'
  ),
  
  -- Mia Jackson (Community Organizer) - Second Issue
  (
    'Food Desert in Montopolis Neighborhood',
    'The Montopolis neighborhood lacks access to fresh, affordable food. The nearest grocery store is over 2 miles away, creating a significant burden for residents without reliable transportation.',
    '{"lat": 30.2332, "lng": -97.7033}',
    'Montopolis Neighborhood Center, Austin, TX 78741',
    'Public Services',
    'in_progress',
    '10000000-0000-0000-0000-000000000013'
  ),
  
  -- Lucas Gonzalez (Music Venue Manager) - Second Issue
  (
    'Inadequate Loading Zones on East 6th Street',
    'Music venues on East 6th Street lack adequate loading zones for equipment. Bands and sound crews are forced to double-park, creating traffic issues and risking parking tickets.',
    '{"lat": 30.2670, "lng": -97.7350}',
    '600 E 6th St, Austin, TX 78701',
    'Infrastructure',
    'open',
    '10000000-0000-0000-0000-000000000014'
  ),
  
  -- Isabella Foster (Student) - Second Issue
  (
    'Limited Late-Night Transportation Options for Students',
    'Students studying late at the UT libraries have limited safe transportation options after midnight when the regular bus service ends. This is creating safety concerns for students walking home.',
    '{"lat": 30.2849, "lng": -97.7341}',
    'UT PCL Library, Austin, TX 78712',
    'Public Services',
    'open',
    '10000000-0000-0000-0000-000000000015'
  );

COMMIT; 