-- Drop the existing function
DROP FUNCTION IF EXISTS toggle_issue_upvote(UUID, UUID);

-- Create enhanced toggle_issue_upvote function that returns both upvote status and current count
CREATE OR REPLACE FUNCTION toggle_issue_upvote(p_issue_id UUID, p_user_id UUID)
RETURNS TABLE(is_upvoted BOOLEAN, current_upvotes INTEGER) AS $$
DECLARE
  v_upvote_exists BOOLEAN;
  v_current_upvotes INTEGER;
BEGIN
  -- First, get the current upvote count before any changes
  SELECT upvotes INTO v_current_upvotes
  FROM issues
  WHERE id = p_issue_id;
  
  -- If we couldn't find the issue, return 0 upvotes
  IF v_current_upvotes IS NULL THEN
    RAISE NOTICE 'Issue not found: %', p_issue_id;
    is_upvoted := FALSE;
    current_upvotes := 0;
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- Check if the upvote already exists
  SELECT EXISTS (
    SELECT 1 FROM upvotes
    WHERE issue_id = p_issue_id AND user_id = p_user_id
  ) INTO v_upvote_exists;
  
  -- Lock the issue row to prevent race conditions
  PERFORM id
  FROM issues
  WHERE id = p_issue_id
  FOR UPDATE;
  
  IF v_upvote_exists THEN
    -- Remove the upvote
    DELETE FROM upvotes
    WHERE issue_id = p_issue_id AND user_id = p_user_id;
    
    -- Update the upvote count
    UPDATE issues
    SET upvotes = GREATEST(upvotes - 1, 0)
    WHERE id = p_issue_id
    RETURNING upvotes INTO v_current_upvotes;
    
    -- Return the result
    is_upvoted := FALSE;
    current_upvotes := v_current_upvotes;
    RETURN NEXT;
  ELSE
    -- Add the upvote
    INSERT INTO upvotes (issue_id, user_id)
    VALUES (p_issue_id, p_user_id);
    
    -- Update the upvote count
    UPDATE issues
    SET upvotes = upvotes + 1
    WHERE id = p_issue_id
    RETURNING upvotes INTO v_current_upvotes;
    
    -- Return the result
    is_upvoted := TRUE;
    current_upvotes := v_current_upvotes;
    RETURN NEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Also fix the toggle_comment_upvote function
DROP FUNCTION IF EXISTS toggle_comment_upvote(UUID, UUID);

-- Create enhanced toggle_comment_upvote function that returns both upvote status and current count
CREATE OR REPLACE FUNCTION toggle_comment_upvote(p_comment_id UUID, p_user_id UUID)
RETURNS TABLE(is_upvoted BOOLEAN, current_upvotes INTEGER) AS $$
DECLARE
  v_upvote_exists BOOLEAN;
  v_current_upvotes INTEGER;
BEGIN
  -- First, get the current upvote count before any changes
  SELECT upvotes INTO v_current_upvotes
  FROM comments
  WHERE id = p_comment_id;
  
  -- If we couldn't find the comment, return 0 upvotes
  IF v_current_upvotes IS NULL THEN
    RAISE NOTICE 'Comment not found: %', p_comment_id;
    is_upvoted := FALSE;
    current_upvotes := 0;
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- Check if the upvote already exists
  SELECT EXISTS (
    SELECT 1 FROM upvotes
    WHERE comment_id = p_comment_id AND user_id = p_user_id
  ) INTO v_upvote_exists;
  
  -- Lock the comment row to prevent race conditions
  PERFORM id
  FROM comments
  WHERE id = p_comment_id
  FOR UPDATE;
  
  IF v_upvote_exists THEN
    -- Remove the upvote
    DELETE FROM upvotes
    WHERE comment_id = p_comment_id AND user_id = p_user_id;
    
    -- Update the upvote count
    UPDATE comments
    SET upvotes = GREATEST(upvotes - 1, 0)
    WHERE id = p_comment_id
    RETURNING upvotes INTO v_current_upvotes;
    
    -- Return the result
    is_upvoted := FALSE;
    current_upvotes := v_current_upvotes;
    RETURN NEXT;
  ELSE
    -- Add the upvote
    INSERT INTO upvotes (comment_id, user_id)
    VALUES (p_comment_id, p_user_id);
    
    -- Update the upvote count
    UPDATE comments
    SET upvotes = upvotes + 1
    WHERE id = p_comment_id
    RETURNING upvotes INTO v_current_upvotes;
    
    -- Return the result
    is_upvoted := TRUE;
    current_upvotes := v_current_upvotes;
    RETURN NEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;
