-- Seed data for CommunityPulse (Austin, Texas)

-- Insert sample issues
INSERT INTO issues (title, description, location, address, category, status, user_id)
VALUES
  (
    'Pothole on South Congress',
    'There is a large pothole in the middle of South Congress Avenue near the intersection with Riverside Drive. It''s causing damage to vehicles and is a safety hazard.',
    '{"lat": 30.2489, "lng": -97.7507}',
    '1500 S Congress Ave, Austin, TX 78704',
    'Infrastructure',
    'open',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'Broken Streetlight on 6th Street',
    'The streetlight at the corner of 6th Street and Trinity has been out for over a week, making the area very dark and unsafe at night.',
    '{"lat": 30.2672, "lng": -97.7431}',
    '601 Trinity St, Austin, TX 78701',
    'Safety',
    'in_progress',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'Illegal Dumping at Zilker Park',
    'Someone has dumped a large pile of trash near the entrance to Zilker Park. It''s an eyesore and potentially hazardous to wildlife.',
    '{"lat": 30.2669, "lng": -97.7729}',
    '2100 Barton Springs Rd, Austin, TX 78704',
    'Environment',
    'open',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'Graffiti on Lamar Pedestrian Bridge',
    'There is extensive graffiti on the Lamar Pedestrian Bridge that needs to be cleaned up.',
    '{"lat": 30.2642, "lng": -97.7558}',
    'Lamar Pedestrian Bridge, Austin, TX 78703',
    'Public Services',
    'open',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'Flooding on Shoal Creek Trail',
    'After recent rains, a section of Shoal Creek Trail is completely flooded and impassable.',
    '{"lat": 30.2743, "lng": -97.7540}',
    'Shoal Creek Trail, Austin, TX 78703',
    'Infrastructure',
    'in_progress',
    '00000000-0000-0000-0000-000000000000'
  );

-- Insert sample comments
INSERT INTO comments (issue_id, user_id, content)
VALUES
  (
    (SELECT id FROM issues WHERE title = 'Pothole on South Congress' LIMIT 1),
    '00000000-0000-0000-0000-000000000000',
    'I hit this pothole yesterday and it damaged my tire. This needs to be fixed ASAP!'
  ),
  (
    (SELECT id FROM issues WHERE title = 'Pothole on South Congress' LIMIT 1),
    '00000000-0000-0000-0000-000000000000',
    'I''ve reported this to Austin 311 three times already with no response.'
  ),
  (
    (SELECT id FROM issues WHERE title = 'Broken Streetlight on 6th Street' LIMIT 1),
    '00000000-0000-0000-0000-000000000000',
    'I noticed an Austin Energy truck looking at this yesterday, so hopefully it will be fixed soon.'
  ),
  (
    (SELECT id FROM issues WHERE title = 'Illegal Dumping at Zilker Park' LIMIT 1),
    '00000000-0000-0000-0000-000000000000',
    'This is unacceptable in our beautiful park. I''ve seen more trash accumulating over the past week.'
  ),
  (
    (SELECT id FROM issues WHERE title = 'Graffiti on Lamar Pedestrian Bridge' LIMIT 1),
    '00000000-0000-0000-0000-000000000000',
    'Some of the graffiti is actually pretty artistic, but there are a lot of inappropriate tags that should be removed.'
  ),
  (
    (SELECT id FROM issues WHERE title = 'Flooding on Shoal Creek Trail' LIMIT 1),
    '00000000-0000-0000-0000-000000000000',
    'This happens every time it rains heavily. The city needs a better drainage solution here.'
  );

-- Insert sample upvotes
INSERT INTO upvotes (user_id, issue_id)
VALUES
  ('00000000-0000-0000-0000-000000000000', (SELECT id FROM issues WHERE title = 'Pothole on South Congress' LIMIT 1)),
  ('11111111-1111-1111-1111-111111111111', (SELECT id FROM issues WHERE title = 'Pothole on South Congress' LIMIT 1)),
  ('22222222-2222-2222-2222-222222222222', (SELECT id FROM issues WHERE title = 'Pothole on South Congress' LIMIT 1)),
  ('33333333-3333-3333-3333-333333333333', (SELECT id FROM issues WHERE title = 'Pothole on South Congress' LIMIT 1)),
  ('00000000-0000-0000-0000-000000000000', (SELECT id FROM issues WHERE title = 'Broken Streetlight on 6th Street' LIMIT 1)),
  ('11111111-1111-1111-1111-111111111111', (SELECT id FROM issues WHERE title = 'Broken Streetlight on 6th Street' LIMIT 1)),
  ('00000000-0000-0000-0000-000000000000', (SELECT id FROM issues WHERE title = 'Illegal Dumping at Zilker Park' LIMIT 1)),
  ('11111111-1111-1111-1111-111111111111', (SELECT id FROM issues WHERE title = 'Illegal Dumping at Zilker Park' LIMIT 1)),
  ('22222222-2222-2222-2222-222222222222', (SELECT id FROM issues WHERE title = 'Illegal Dumping at Zilker Park' LIMIT 1)),
  ('00000000-0000-0000-0000-000000000000', (SELECT id FROM issues WHERE title = 'Graffiti on Lamar Pedestrian Bridge' LIMIT 1)),
  ('00000000-0000-0000-0000-000000000000', (SELECT id FROM issues WHERE title = 'Flooding on Shoal Creek Trail' LIMIT 1)),
  ('11111111-1111-1111-1111-111111111111', (SELECT id FROM issues WHERE title = 'Flooding on Shoal Creek Trail' LIMIT 1)),
  ('22222222-2222-2222-2222-222222222222', (SELECT id FROM issues WHERE title = 'Flooding on Shoal Creek Trail' LIMIT 1));

-- Insert upvotes for comments
INSERT INTO upvotes (user_id, comment_id)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    (SELECT id FROM comments WHERE content LIKE '%damaged my tire%' LIMIT 1)
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    (SELECT id FROM comments WHERE content LIKE '%damaged my tire%' LIMIT 1)
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    (SELECT id FROM comments WHERE content LIKE '%Austin 311%' LIMIT 1)
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    (SELECT id FROM comments WHERE content LIKE '%drainage solution%' LIMIT 1)
  ); 