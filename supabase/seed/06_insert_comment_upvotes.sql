-- Insert comment upvotes for CommunityPulse database
-- This script adds approximately 100 upvotes to comments with realistic distribution

BEGIN;

-- 6. INSERT SAMPLE COMMENT UPVOTES
-- -------------------------------
-- Insert approximately 100 comment upvotes with realistic distribution

-- First, delete any existing test comment upvotes to avoid duplication
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
)
AND comment_id IS NOT NULL;

-- Function to get comment ID by content prefix (for use in the upvotes)
-- This function will return NULL if no comment is found with the given prefix
CREATE OR REPLACE FUNCTION get_comment_id(content_prefix TEXT) 
RETURNS UUID AS $$
DECLARE
  comment_id UUID;
BEGIN
  -- Try to find a comment that starts with the given prefix
  SELECT id INTO comment_id FROM comments WHERE content LIKE (content_prefix || '%') LIMIT 1;
  
  -- Simply return NULL if no comment is found (instead of raising an exception)
  -- This will allow the script to continue with other inserts
  RETURN comment_id;
END;
$$ LANGUAGE plpgsql;

-- Now insert comment upvotes using the function to get comment IDs
-- We need to explicitly set issue_id to NULL to satisfy the one_target_only constraint
-- Only insert upvotes where the comment_id is not NULL
INSERT INTO upvotes (user_id, comment_id, issue_id)
SELECT 
  user_id::UUID, -- Cast the user_id to UUID type
  comment_id, 
  NULL AS issue_id
FROM (VALUES
  -- Upvotes for comment about crossing the intersection daily (8 upvotes)
  (
    '10000000-0000-0000-0000-000000000001',
    get_comment_id('I cross this intersection daily and it''s terrifying. The crosswalk signal')
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    get_comment_id('I cross this intersection daily and it''s terrifying. The crosswalk signal')
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    get_comment_id('I cross this intersection daily and it''s terrifying. The crosswalk signal')
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    get_comment_id('I cross this intersection daily and it''s terrifying. The crosswalk signal')
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    get_comment_id('I cross this intersection daily and it''s terrifying. The crosswalk signal')
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    get_comment_id('I cross this intersection daily and it''s terrifying. The crosswalk signal')
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    get_comment_id('I cross this intersection daily and it''s terrifying. The crosswalk signal')
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    get_comment_id('I cross this intersection daily and it''s terrifying. The crosswalk signal')
  ),

  -- Upvotes for comment about almost getting hit by a car (6 upvotes)
  (
    '10000000-0000-0000-0000-000000000001',
    get_comment_id('I witnessed a near-accident here last week. A car turning right')
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    get_comment_id('I witnessed a near-accident here last week. A car turning right')
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    get_comment_id('I witnessed a near-accident here last week. A car turning right')
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    get_comment_id('I witnessed a near-accident here last week. A car turning right')
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    get_comment_id('I witnessed a near-accident here last week. A car turning right')
  ),
  (
    '10000000-0000-0000-0000-000000000011',
    get_comment_id('I witnessed a near-accident here last week. A car turning right')
  ),

  -- Upvotes for comment about illegal dumping (5 upvotes)
  (
    '10000000-0000-0000-0000-000000000002',
    get_comment_id('I was hiking there yesterday and it''s even worse now. Looks like')
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    get_comment_id('I was hiking there yesterday and it''s even worse now. Looks like')
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    get_comment_id('I was hiking there yesterday and it''s even worse now. Looks like')
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    get_comment_id('I was hiking there yesterday and it''s even worse now. Looks like')
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    get_comment_id('I was hiking there yesterday and it''s even worse now. Looks like')
  ),

  -- Upvotes for comment about organizing a cleanup (7 upvotes)
  (
    '10000000-0000-0000-0000-000000000001',
    get_comment_id('I''m organizing a volunteer cleanup this Saturday at 9am. If anyone')
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    get_comment_id('I''m organizing a volunteer cleanup this Saturday at 9am. If anyone')
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    get_comment_id('I''m organizing a volunteer cleanup this Saturday at 9am. If anyone')
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    get_comment_id('I''m organizing a volunteer cleanup this Saturday at 9am. If anyone')
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    get_comment_id('I''m organizing a volunteer cleanup this Saturday at 9am. If anyone')
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    get_comment_id('I''m organizing a volunteer cleanup this Saturday at 9am. If anyone')
  ),
  (
    '10000000-0000-0000-0000-000000000011',
    get_comment_id('I''m organizing a volunteer cleanup this Saturday at 9am. If anyone')
  ),

  -- Upvotes for comment about bike lane obstruction (4 upvotes)
  (
    '10000000-0000-0000-0000-000000000002',
    get_comment_id('This happens to me every single day on my commute. The worst offenders')
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    get_comment_id('This happens to me every single day on my commute. The worst offenders')
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    get_comment_id('This happens to me every single day on my commute. The worst offenders')
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    get_comment_id('This happens to me every single day on my commute. The worst offenders')
  ),

  -- Upvotes for comment about flooding (5 upvotes)
  (
    '10000000-0000-0000-0000-000000000001',
    get_comment_id('My car was nearly submerged here during the flash flood last month')
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    get_comment_id('My car was nearly submerged here during the flash flood last month')
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    get_comment_id('My car was nearly submerged here during the flash flood last month')
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    get_comment_id('My car was nearly submerged here during the flash flood last month')
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    get_comment_id('My car was nearly submerged here during the flash flood last month')
  ),

  -- Upvotes for comment about broken streetlights (4 upvotes)
  (
    '10000000-0000-0000-0000-000000000002',
    get_comment_id('I live on this street and it''s been dark for over a month now')
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    get_comment_id('I live on this street and it''s been dark for over a month now')
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    get_comment_id('I live on this street and it''s been dark for over a month now')
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    get_comment_id('I live on this street and it''s been dark for over a month now')
  ),

  -- Upvotes for comment about pothole (3 upvotes)
  (
    '10000000-0000-0000-0000-000000000001',
    get_comment_id('I hit this pothole last week and got a flat tire. Cost me $150')
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    get_comment_id('I hit this pothole last week and got a flat tire. Cost me $150')
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    get_comment_id('I hit this pothole last week and got a flat tire. Cost me $150')
  ),

  -- Upvotes for comment about graffiti (3 upvotes)
  (
    '10000000-0000-0000-0000-000000000003',
    get_comment_id('I noticed this too! There was a chunk of facade on the sidewalk')
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    get_comment_id('I noticed this too! There was a chunk of facade on the sidewalk')
  ),
  (
    '10000000-0000-0000-0000-000000000011',
    get_comment_id('I noticed this too! There was a chunk of facade on the sidewalk')
  ),

  -- Upvotes for comment about playground equipment (5 upvotes)
  (
    '10000000-0000-0000-0000-000000000002',
    get_comment_id('My child came home with a cut from the broken equipment last week')
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    get_comment_id('My child came home with a cut from the broken equipment last week')
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    get_comment_id('My child came home with a cut from the broken equipment last week')
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    get_comment_id('My child came home with a cut from the broken equipment last week')
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    get_comment_id('My child came home with a cut from the broken equipment last week')
  ),

  -- Additional upvotes for popular comments on popular issues
  
  -- More upvotes for comment about crossing the intersection daily (adding 7 more for a total of 15)
  (
    '10000000-0000-0000-0000-000000000009',
    get_comment_id('I cross this intersection daily and it''s terrifying. The crosswalk signal')
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    get_comment_id('I cross this intersection daily and it''s terrifying. The crosswalk signal')
  ),
  (
    '10000000-0000-0000-0000-000000000011',
    get_comment_id('I cross this intersection daily and it''s terrifying. The crosswalk signal')
  ),
  (
    '10000000-0000-0000-0000-000000000012',
    get_comment_id('I cross this intersection daily and it''s terrifying. The crosswalk signal')
  ),
  (
    '10000000-0000-0000-0000-000000000013',
    get_comment_id('I cross this intersection daily and it''s terrifying. The crosswalk signal')
  ),
  (
    '10000000-0000-0000-0000-000000000014',
    get_comment_id('I cross this intersection daily and it''s terrifying. The crosswalk signal')
  ),
  (
    '10000000-0000-0000-0000-000000000015',
    get_comment_id('I cross this intersection daily and it''s terrifying. The crosswalk signal')
  ),
  
  -- More upvotes for comment about almost getting hit by a car (adding 4 more for a total of 10)
  (
    '10000000-0000-0000-0000-000000000002',
    get_comment_id('I witnessed a near-accident here last week. A car turning right')
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    get_comment_id('I witnessed a near-accident here last week. A car turning right')
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    get_comment_id('I witnessed a near-accident here last week. A car turning right')
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    get_comment_id('I witnessed a near-accident here last week. A car turning right')
  ),
  
  -- More upvotes for comment about organizing a cleanup (adding 5 more for a total of 12)
  (
    '10000000-0000-0000-0000-000000000004',
    get_comment_id('I''m organizing a volunteer cleanup this Saturday at 9am. If anyone')
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    get_comment_id('I''m organizing a volunteer cleanup this Saturday at 9am. If anyone')
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    get_comment_id('I''m organizing a volunteer cleanup this Saturday at 9am. If anyone')
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    get_comment_id('I''m organizing a volunteer cleanup this Saturday at 9am. If anyone')
  ),
  (
    '10000000-0000-0000-0000-000000000012',
    get_comment_id('I''m organizing a volunteer cleanup this Saturday at 9am. If anyone')
  ),
  
  -- Upvotes for comment about traffic light timing (new comment, 6 upvotes)
  (
    '10000000-0000-0000-0000-000000000001',
    get_comment_id('The city has been ignoring this intersection for years. I''ve submitted')
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    get_comment_id('The city has been ignoring this intersection for years. I''ve submitted')
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    get_comment_id('The city has been ignoring this intersection for years. I''ve submitted')
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    get_comment_id('The city has been ignoring this intersection for years. I''ve submitted')
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    get_comment_id('The city has been ignoring this intersection for years. I''ve submitted')
  ),
  (
    '10000000-0000-0000-0000-000000000011',
    get_comment_id('The city has been ignoring this intersection for years. I''ve submitted')
  ),
  
  -- Upvotes for comment about contacting city council (new comment, 5 upvotes)
  (
    '10000000-0000-0000-0000-000000000002',
    get_comment_id('Update: I spoke with someone from the transportation department yesterday')
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    get_comment_id('Update: I spoke with someone from the transportation department yesterday')
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    get_comment_id('Update: I spoke with someone from the transportation department yesterday')
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    get_comment_id('Update: I spoke with someone from the transportation department yesterday')
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    get_comment_id('Update: I spoke with someone from the transportation department yesterday')
  ),
  
  -- Upvotes for comment about wildlife impact (new comment, 4 upvotes)
  (
    '10000000-0000-0000-0000-000000000001',
    get_comment_id('This is affecting the water quality too. I''ve noticed more trash')
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    get_comment_id('This is affecting the water quality too. I''ve noticed more trash')
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    get_comment_id('This is affecting the water quality too. I''ve noticed more trash')
  ),
  (
    '10000000-0000-0000-0000-000000000013',
    get_comment_id('This is affecting the water quality too. I''ve noticed more trash')
  ),
  
  -- Upvotes for comment about similar issue in another neighborhood (new comment, 3 upvotes)
  (
    '10000000-0000-0000-0000-000000000003',
    get_comment_id('I''ve lived in this neighborhood for 20 years and this intersection')
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    get_comment_id('I''ve lived in this neighborhood for 20 years and this intersection')
  ),
  (
    '10000000-0000-0000-0000-000000000011',
    get_comment_id('I''ve lived in this neighborhood for 20 years and this intersection')
  ),
  
  -- Upvotes for comment about signing petition (new comment, 7 upvotes)
  (
    '10000000-0000-0000-0000-000000000001',
    get_comment_id('I''ve started a petition to get this fixed. Already have 50 signatures')
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    get_comment_id('I''ve started a petition to get this fixed. Already have 50 signatures')
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    get_comment_id('I''ve started a petition to get this fixed. Already have 50 signatures')
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    get_comment_id('I''ve started a petition to get this fixed. Already have 50 signatures')
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    get_comment_id('I''ve started a petition to get this fixed. Already have 50 signatures')
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    get_comment_id('I''ve started a petition to get this fixed. Already have 50 signatures')
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    get_comment_id('I''ve started a petition to get this fixed. Already have 50 signatures')
  ),
  
  -- Upvotes for comment about taking photos (new comment, 4 upvotes)
  (
    '10000000-0000-0000-0000-000000000002',
    get_comment_id('I''ve started taking photos of vehicles blocking the lane and reporting')
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    get_comment_id('I''ve started taking photos of vehicles blocking the lane and reporting')
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    get_comment_id('I''ve started taking photos of vehicles blocking the lane and reporting')
  ),
  (
    '10000000-0000-0000-0000-000000000014',
    get_comment_id('I''ve started taking photos of vehicles blocking the lane and reporting')
  ),
  
  -- Upvotes for comment about local business impact (new comment, 5 upvotes)
  (
    '10000000-0000-0000-0000-000000000001',
    get_comment_id('The businesses along this stretch lose customers every time it floods')
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    get_comment_id('The businesses along this stretch lose customers every time it floods')
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    get_comment_id('The businesses along this stretch lose customers every time it floods')
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    get_comment_id('The businesses along this stretch lose customers every time it floods')
  ),
  (
    '10000000-0000-0000-0000-000000000013',
    get_comment_id('The businesses along this stretch lose customers every time it floods')
  )
) AS upvotes(user_id, comment_id)
WHERE comment_id IS NOT NULL;

-- Drop the temporary function
DROP FUNCTION get_comment_id;

COMMIT; 