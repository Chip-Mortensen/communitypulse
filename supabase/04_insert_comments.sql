-- Insert comments for CommunityPulse database
-- This script adds realistic comments to various issues

BEGIN;

-- 4. INSERT SAMPLE COMMENTS
-- ------------------------
-- Insert approximately 80 comments with realistic distribution

-- First, delete any existing test comments to avoid duplication
DELETE FROM comments 
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

-- Insert comments for various issues
-- Note: We'll need to use the issue IDs that will be generated when the issues are inserted
-- For this example, we'll use a function to get issue IDs by title

-- Function to get issue ID by title (for use in the comments)
CREATE OR REPLACE FUNCTION get_issue_id(issue_title TEXT) 
RETURNS UUID AS $$
DECLARE
  issue_id UUID;
BEGIN
  SELECT id INTO issue_id FROM issues WHERE title = issue_title LIMIT 1;
  RETURN issue_id;
END;
$$ LANGUAGE plpgsql;

-- Now insert comments using the function to get issue IDs
INSERT INTO comments (content, user_id, issue_id)
VALUES
  -- Comments for "Dangerous Intersection at Lamar and 5th" (popular issue with 6 comments)
  (
    'I cross this intersection daily and it''s terrifying. The crosswalk signal only stays green for about 15 seconds, which isn''t nearly enough time for elderly residents or anyone with mobility issues.',
    '10000000-0000-0000-0000-000000000004',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),
  (
    'I witnessed a near-accident here last week. A car turning right almost hit a pedestrian because the driver wasn''t paying attention. We need better signage and possibly a dedicated pedestrian crossing time.',
    '10000000-0000-0000-0000-000000000009',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),
  (
    'The city has been ignoring this intersection for years. I''ve submitted three separate requests through 311 and nothing has changed.',
    '10000000-0000-0000-0000-000000000012',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),
  (
    'My elderly mother lives in the senior housing nearby and she''s afraid to cross here. She has to take a much longer route to get to the pharmacy.',
    '10000000-0000-0000-0000-000000000007',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),
  (
    'I''m a traffic engineer and would be happy to volunteer my time to help develop solutions for this intersection. This is definitely fixable with the right approach.',
    '10000000-0000-0000-0000-000000000006',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),
  (
    'Update: I spoke with someone from the transportation department yesterday. They said this intersection is on their radar but funding is the issue. Maybe we need to organize a community push?',
    '10000000-0000-0000-0000-000000000001',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),
  (
    'I''ve started a petition to get this fixed. Already have 50 signatures from local residents. Will share the link once it''s ready for wider distribution.',
    '10000000-0000-0000-0000-000000000010',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),
  (
    'There was actually a collision here last month. I have photos if anyone from the city needs evidence of how dangerous this is.',
    '10000000-0000-0000-0000-000000000003',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),
  (
    'I''ve lived in this neighborhood for 20 years and this intersection has always been a problem. It''s gotten worse with increased traffic over the years.',
    '10000000-0000-0000-0000-000000000008',
    get_issue_id('Dangerous Intersection at Lamar and 5th')
  ),

  -- Comments for "Bike Lane Obstruction on Guadalupe" (4 comments)
  (
    'This happens to me every single day on my commute. The worst offenders are the food delivery drivers who just park in the bike lane with their hazards on.',
    '10000000-0000-0000-0000-000000000008',
    get_issue_id('Bike Lane Obstruction on Guadalupe')
  ),
  (
    'I was forced into traffic last week and nearly got hit by a bus. The driver honked at ME as if I was in the wrong!',
    '10000000-0000-0000-0000-000000000015',
    get_issue_id('Bike Lane Obstruction on Guadalupe')
  ),
  (
    'We need those concrete barriers like they installed on Shoal Creek. Paint doesn''t protect cyclists.',
    '10000000-0000-0000-0000-000000000003',
    get_issue_id('Bike Lane Obstruction on Guadalupe')
  ),
  (
    'I''ve started taking photos of vehicles blocking the lane and reporting them to 311. Not sure if it helps, but at least there''s documentation of how frequent this is.',
    '10000000-0000-0000-0000-000000000010',
    get_issue_id('Bike Lane Obstruction on Guadalupe')
  ),
  (
    'The businesses along this stretch need dedicated loading zones. That would help reduce the number of delivery vehicles using the bike lane.',
    '10000000-0000-0000-0000-000000000001',
    get_issue_id('Bike Lane Obstruction on Guadalupe')
  ),
  (
    'I''ve seen parking enforcement drive right past vehicles in the bike lane without ticketing them. There needs to be consistent enforcement.',
    '10000000-0000-0000-0000-000000000007',
    get_issue_id('Bike Lane Obstruction on Guadalupe')
  ),
  (
    'I''m part of Bike Austin and we''re working on a campaign to address this issue citywide. Would love to use this specific location as an example in our advocacy.',
    '10000000-0000-0000-0000-000000000012',
    get_issue_id('Bike Lane Obstruction on Guadalupe')
  ),

  -- Comments for "Illegal Dumping at Barton Creek Greenbelt" (3 comments)
  (
    'I was hiking there yesterday and it''s even worse now. Looks like someone dumped more construction debris over the weekend. This is heartbreaking.',
    '10000000-0000-0000-0000-000000000011',
    get_issue_id('Illegal Dumping at Barton Creek Greenbelt')
  ),
  (
    'I''m organizing a volunteer cleanup this Saturday at 9am. If anyone wants to join, please message me. Bring gloves and sturdy shoes.',
    '10000000-0000-0000-0000-000000000003',
    get_issue_id('Illegal Dumping at Barton Creek Greenbelt')
  ),
  (
    'We need to install cameras in this area. This isn''t the first time this has happened, and it won''t be the last unless there are consequences.',
    '10000000-0000-0000-0000-000000000007',
    get_issue_id('Illegal Dumping at Barton Creek Greenbelt')
  ),
  (
    'I found some mail with an address in the dumped items. I''ve reported it to the park rangers so they can follow up.',
    '10000000-0000-0000-0000-000000000005',
    get_issue_id('Illegal Dumping at Barton Creek Greenbelt')
  ),
  (
    'This is affecting the water quality too. I''ve noticed more trash flowing downstream after rainstorms.',
    '10000000-0000-0000-0000-000000000009',
    get_issue_id('Illegal Dumping at Barton Creek Greenbelt')
  ),
  (
    'I''ll be at the cleanup on Saturday with 3 friends. We''ll bring extra trash bags and some pickup tools.',
    '10000000-0000-0000-0000-000000000014',
    get_issue_id('Illegal Dumping at Barton Creek Greenbelt')
  ),

  -- Comments for "Broken Streetlights on East 11th" (2 comments)
  (
    'I live on this street and it''s been dark for over a month now. I have to use my phone flashlight just to find my keys at night.',
    '10000000-0000-0000-0000-000000000013',
    get_issue_id('Broken Streetlights on East 11th')
  ),
  (
    'Update: I saw a city truck looking at the lights yesterday. Hopefully they''ll be fixed soon!',
    '10000000-0000-0000-0000-000000000004',
    get_issue_id('Broken Streetlights on East 11th')
  ),
  (
    'I''ve reported this three times to Austin Energy. They keep saying it''s on their list but nothing happens.',
    '10000000-0000-0000-0000-000000000002',
    get_issue_id('Broken Streetlights on East 11th')
  ),
  (
    'The darkness is bringing more suspicious activity to the area. I''ve noticed more loitering and possible drug deals happening.',
    '10000000-0000-0000-0000-000000000008',
    get_issue_id('Broken Streetlights on East 11th')
  ),
  (
    'Our neighborhood association discussed this at our last meeting. We''re going to follow up as a group to put more pressure on the city.',
    '10000000-0000-0000-0000-000000000010',
    get_issue_id('Broken Streetlights on East 11th')
  ),

  -- Comments for "Recurring Flooding on Lamar Under 38th" (5 comments)
  (
    'My car was nearly submerged here during the flash flood last month. We need better drainage and warning systems.',
    '10000000-0000-0000-0000-000000000002',
    get_issue_id('Recurring Flooding on Lamar Under 38th')
  ),
  (
    'This has been a problem for at least 15 years. I remember getting stuck here in 2007 during a thunderstorm.',
    '10000000-0000-0000-0000-000000000009',
    get_issue_id('Recurring Flooding on Lamar Under 38th')
  ),
  (
    'The city installed those depth markers, but that doesn''t solve the actual problem. We need proper infrastructure improvements.',
    '10000000-0000-0000-0000-000000000012',
    get_issue_id('Recurring Flooding on Lamar Under 38th')
  ),
  (
    'I''ve seen city workers clearing the storm drains, but they get clogged again within weeks. Maybe we need a more permanent solution?',
    '10000000-0000-0000-0000-000000000005',
    get_issue_id('Recurring Flooding on Lamar Under 38th')
  ),
  (
    'Good news - I attended the city council meeting last week and this is actually on the agenda for infrastructure improvements in the next fiscal year.',
    '10000000-0000-0000-0000-000000000006',
    get_issue_id('Recurring Flooding on Lamar Under 38th')
  ),
  (
    'I''ve started taking alternate routes whenever there''s even a chance of rain. It''s inconvenient but better than risking my car.',
    '10000000-0000-0000-0000-000000000011',
    get_issue_id('Recurring Flooding on Lamar Under 38th')
  ),
  (
    'The businesses along this stretch lose customers every time it floods. It''s not just a transportation issue but an economic one too.',
    '10000000-0000-0000-0000-000000000010',
    get_issue_id('Recurring Flooding on Lamar Under 38th')
  ),
  (
    'I''m an engineer and I think part of the problem is that development upstream has increased runoff. We need a comprehensive watershed approach.',
    '10000000-0000-0000-0000-000000000003',
    get_issue_id('Recurring Flooding on Lamar Under 38th')
  ),

  -- Comments for "Neglected Median on Congress Avenue" (2 comments)
  (
    'This is such a shame. Congress Avenue is our main street and it looks terrible. Not a good look for visitors to our city.',
    '10000000-0000-0000-0000-000000000010',
    get_issue_id('Neglected Median on Congress Avenue')
  ),
  (
    'I''m part of a downtown beautification committee and we''ve been trying to get permission to adopt this median. The bureaucracy is frustrating.',
    '10000000-0000-0000-0000-000000000007',
    get_issue_id('Neglected Median on Congress Avenue')
  ),
  (
    'I work at a hotel nearby and tourists always comment on how unkempt this area looks. It''s embarrassing.',
    '10000000-0000-0000-0000-000000000014',
    get_issue_id('Neglected Median on Congress Avenue')
  ),
  (
    'The irrigation system has been broken for months. All the plants are dying because they''re not getting any water.',
    '10000000-0000-0000-0000-000000000003',
    get_issue_id('Neglected Median on Congress Avenue')
  ),
  (
    'I''ve seen homeless people sleeping in these medians too. We need to address both the beautification and the underlying social issues.',
    '10000000-0000-0000-0000-000000000013',
    get_issue_id('Neglected Median on Congress Avenue')
  ),

  -- Comments for "Inaccessible Sidewalk on Medical Parkway" (3 comments)
  (
    'My brother uses a wheelchair and he had to go into the street to get around the broken sections. This is completely unacceptable near a hospital!',
    '10000000-0000-0000-0000-000000000005',
    get_issue_id('Inaccessible Sidewalk on Medical Parkway')
  ),
  (
    'I reported this to the ADA compliance office and they said they''d look into it. That was two months ago.',
    '10000000-0000-0000-0000-000000000009',
    get_issue_id('Inaccessible Sidewalk on Medical Parkway')
  ),
  (
    'The hospital should be advocating for this fix too. It directly impacts their patients'' ability to access care.',
    '10000000-0000-0000-0000-000000000013',
    get_issue_id('Inaccessible Sidewalk on Medical Parkway')
  ),
  (
    'I work at the hospital and see patients struggling with this every day. Some have actually fallen trying to navigate the broken concrete.',
    '10000000-0000-0000-0000-000000000001',
    get_issue_id('Inaccessible Sidewalk on Medical Parkway')
  ),
  (
    'This is a clear ADA violation. If the city doesn''t fix it soon, they could face a lawsuit.',
    '10000000-0000-0000-0000-000000000012',
    get_issue_id('Inaccessible Sidewalk on Medical Parkway')
  ),
  (
    'I''ve documented all the problem areas with photos and precise locations. Happy to share with whoever can help get this fixed.',
    '10000000-0000-0000-0000-000000000006',
    get_issue_id('Inaccessible Sidewalk on Medical Parkway')
  ),

  -- Comments for "Historic Building Deterioration on 6th Street" (4 comments)
  (
    'I noticed this too! There was a chunk of facade on the sidewalk last week. Someone could get seriously hurt.',
    '10000000-0000-0000-0000-000000000014',
    get_issue_id('Historic Building Deterioration on 6th Street')
  ),
  (
    'This building is on the historic register. The owners have a responsibility to maintain it properly.',
    '10000000-0000-0000-0000-000000000001',
    get_issue_id('Historic Building Deterioration on 6th Street')
  ),
  (
    'I work for a preservation nonprofit and we might be able to help connect the owners with resources for historic building maintenance.',
    '10000000-0000-0000-0000-000000000012',
    get_issue_id('Historic Building Deterioration on 6th Street')
  ),
  (
    'Update: The city has put up barriers on the sidewalk in front of the building. At least that''s a start for public safety.',
    '10000000-0000-0000-0000-000000000008',
    get_issue_id('Historic Building Deterioration on 6th Street')
  ),
  (
    'I heard the building was recently sold and the new owners are planning a renovation. Hope they preserve the historic character.',
    '10000000-0000-0000-0000-000000000007',
    get_issue_id('Historic Building Deterioration on 6th Street')
  ),
  (
    'The Historic Landmark Commission needs to get involved before more damage occurs.',
    '10000000-0000-0000-0000-000000000003',
    get_issue_id('Historic Building Deterioration on 6th Street')
  ),
  (
    'I''m an architect specializing in historic preservation. Would be happy to consult with the owners about stabilization options.',
    '10000000-0000-0000-0000-000000000006',
    get_issue_id('Historic Building Deterioration on 6th Street')
  ),

  -- Comments for "Poor Lighting on West Campus Walking Routes" (3 comments)
  (
    'As another UT student, I completely agree. I have night classes and always have to find someone to walk with because it feels so unsafe.',
    '10000000-0000-0000-0000-000000000002',
    get_issue_id('Poor Lighting on West Campus Walking Routes')
  ),
  (
    'The university should be advocating for this with the city. Student safety should be a priority.',
    '10000000-0000-0000-0000-000000000009',
    get_issue_id('Poor Lighting on West Campus Walking Routes')
  ),
  (
    'I''m in the Student Government Association and we''re working on a proposal for this exact issue. Would love to connect with you for more input.',
    '10000000-0000-0000-0000-000000000015',
    get_issue_id('Poor Lighting on West Campus Walking Routes')
  ),
  (
    'There have been several robberies in this area recently. Better lighting could help deter crime.',
    '10000000-0000-0000-0000-000000000004',
    get_issue_id('Poor Lighting on West Campus Walking Routes')
  ),
  (
    'The property owners along these streets should contribute to a lighting improvement fund. It would increase their property values too.',
    '10000000-0000-0000-0000-000000000012',
    get_issue_id('Poor Lighting on West Campus Walking Routes')
  ),
  (
    'I use the SURE Walk program when I can, but they''re not always available. We need infrastructure solutions too.',
    '10000000-0000-0000-0000-000000000011',
    get_issue_id('Poor Lighting on West Campus Walking Routes')
  ),

  -- Comments for "Dangerous Pothole on Shoal Creek Blvd" (2 comments)
  (
    'I hit this pothole last week and got a flat tire. Cost me $150 to repair. The city should be liable for damages.',
    '10000000-0000-0000-0000-000000000011',
    get_issue_id('Dangerous Pothole on Shoal Creek Blvd')
  ),
  (
    'I marked it with bright orange spray paint as a warning to others, but that washed away in the rain. This needs a permanent fix.',
    '10000000-0000-0000-0000-000000000008',
    get_issue_id('Dangerous Pothole on Shoal Creek Blvd')
  ),
  (
    'I''ve seen at least three cyclists swerve dangerously into traffic to avoid this pothole. It''s just a matter of time before someone gets hurt.',
    '10000000-0000-0000-0000-000000000002',
    get_issue_id('Dangerous Pothole on Shoal Creek Blvd')
  ),
  (
    'The entire stretch of Shoal Creek needs repaving, not just this one pothole. It''s like riding on the moon with all the craters.',
    '10000000-0000-0000-0000-000000000003',
    get_issue_id('Dangerous Pothole on Shoal Creek Blvd')
  ),
  (
    'I reported this through the Austin 311 app three weeks ago and it''s still not fixed. What''s the point of the app if they don''t respond?',
    '10000000-0000-0000-0000-000000000010',
    get_issue_id('Dangerous Pothole on Shoal Creek Blvd')
  ),

  -- Comments for "Invasive Species Taking Over Bull Creek" (2 comments)
  (
    'I''m a biology student at UT and would be happy to help organize a removal effort. This species can completely choke out a waterway if left unchecked.',
    '10000000-0000-0000-0000-000000000015',
    get_issue_id('Invasive Species Taking Over Bull Creek')
  ),
  (
    'I''ve noticed this spreading rapidly over the past month. We need to act quickly before it gets worse.',
    '10000000-0000-0000-0000-000000000007',
    get_issue_id('Invasive Species Taking Over Bull Creek')
  ),
  (
    'The Parks Department needs to be involved. This is beyond what volunteers can handle alone.',
    '10000000-0000-0000-0000-000000000001',
    get_issue_id('Invasive Species Taking Over Bull Creek')
  ),
  (
    'I''ve seen this same species in other Austin waterways too. We need a citywide management plan.',
    '10000000-0000-0000-0000-000000000009',
    get_issue_id('Invasive Species Taking Over Bull Creek')
  ),
  (
    'I work for Texas Parks & Wildlife and can connect you with some resources for invasive species management. This is definitely concerning.',
    '10000000-0000-0000-0000-000000000006',
    get_issue_id('Invasive Species Taking Over Bull Creek')
  ),

  -- Comments for "Food Desert in Montopolis Neighborhood" (4 comments)
  (
    'I live in Montopolis and have to take two buses just to get to a decent grocery store. It''s a huge burden, especially for families.',
    '10000000-0000-0000-0000-000000000004',
    get_issue_id('Food Desert in Montopolis Neighborhood')
  ),
  (
    'The corner stores in the area charge double for basic items and rarely have fresh produce. We need better options.',
    '10000000-0000-0000-0000-000000000009',
    get_issue_id('Food Desert in Montopolis Neighborhood')
  ),
  (
    'I''m part of a community garden initiative and we''re looking to expand into Montopolis. It''s not a complete solution but could help provide some fresh food access.',
    '10000000-0000-0000-0000-000000000007',
    get_issue_id('Food Desert in Montopolis Neighborhood')
  ),
  (
    'Update: I heard that a food co-op is considering opening a small market in the area. I''ll share more details when I have them.',
    '10000000-0000-0000-0000-000000000013',
    get_issue_id('Food Desert in Montopolis Neighborhood')
  ),
  (
    'The city should offer tax incentives to grocery chains willing to open in underserved neighborhoods. It''s been successful in other cities.',
    '10000000-0000-0000-0000-000000000012',
    get_issue_id('Food Desert in Montopolis Neighborhood')
  ),
  (
    'I''d be interested in helping with the community garden. I have experience with urban farming and could offer workshops.',
    '10000000-0000-0000-0000-000000000003',
    get_issue_id('Food Desert in Montopolis Neighborhood')
  ),
  (
    'There''s a weekly mobile farmers market that might be willing to add Montopolis to their route. I can reach out to the organizers.',
    '10000000-0000-0000-0000-000000000010',
    get_issue_id('Food Desert in Montopolis Neighborhood')
  ),

  -- Comments for "Inadequate Public Space at Mueller Development" (new comments)
  (
    'I live in Mueller and completely agree. The existing parks are always overcrowded on weekends.',
    '10000000-0000-0000-0000-000000000002',
    get_issue_id('Inadequate Public Space at Mueller Development')
  ),
  (
    'The developers promised more public spaces in the original plans. What happened to those commitments?',
    '10000000-0000-0000-0000-000000000008',
    get_issue_id('Inadequate Public Space at Mueller Development')
  ),
  (
    'We need more than just green space - we need plazas and gathering areas for community events.',
    '10000000-0000-0000-0000-000000000013',
    get_issue_id('Inadequate Public Space at Mueller Development')
  ),
  (
    'I''m on the Mueller neighborhood association board and we''re actively discussing this issue with the developers. They seem receptive but funding is the challenge.',
    '10000000-0000-0000-0000-000000000006',
    get_issue_id('Inadequate Public Space at Mueller Development')
  ),

  -- Comments for "Playground Equipment Damaged at Maplewood Elementary" (new comments)
  (
    'My child came home with a cut from the broken equipment last week. This is unacceptable!',
    '10000000-0000-0000-0000-000000000010',
    get_issue_id('Playground Equipment Damaged at Maplewood Elementary')
  ),
  (
    'The PTA has been trying to raise funds for new equipment, but we shouldn''t have to do this ourselves. The school district needs to step up.',
    '10000000-0000-0000-0000-000000000007',
    get_issue_id('Playground Equipment Damaged at Maplewood Elementary')
  ),
  (
    'I''m a safety inspector and would be happy to do a free assessment of the playground to document the hazards. This could help with getting action.',
    '10000000-0000-0000-0000-000000000012',
    get_issue_id('Playground Equipment Damaged at Maplewood Elementary')
  ),

  -- Comments for "Community Garden Water Access at Festival Beach" (new comments)
  (
    'I have a plot there and it''s a real struggle to water properly. Sometimes I have to bring water from home in jugs.',
    '10000000-0000-0000-0000-000000000004',
    get_issue_id('Community Garden Water Access at Festival Beach')
  ),
  (
    'The Parks Department promised to address this last year but nothing has happened.',
    '10000000-0000-0000-0000-000000000009',
    get_issue_id('Community Garden Water Access at Festival Beach')
  ),
  (
    'I''m a plumber and might be able to help design a better irrigation system as a community service project.',
    '10000000-0000-0000-0000-000000000006',
    get_issue_id('Community Garden Water Access at Festival Beach')
  ),

  -- Comments for "No Accessible Entrance at South Austin Clinic" (new comments)
  (
    'I had to help someone in a wheelchair enter last month. It took both of us struggling to get up that steep ramp.',
    '10000000-0000-0000-0000-000000000002',
    get_issue_id('No Accessible Entrance at South Austin Clinic')
  ),
  (
    'This is especially ironic for a healthcare facility. They should be setting an example for accessibility.',
    '10000000-0000-0000-0000-000000000010',
    get_issue_id('No Accessible Entrance at South Austin Clinic')
  ),
  (
    'I''m going to contact the Texas Disability Rights organization about this. They might be able to help advocate for changes.',
    '10000000-0000-0000-0000-000000000007',
    get_issue_id('No Accessible Entrance at South Austin Clinic')
  );

-- Drop the temporary function
DROP FUNCTION get_issue_id;

COMMIT; 