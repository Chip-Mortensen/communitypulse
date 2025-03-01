-- Add transaction-based functions for upvote toggling

-- Function to toggle an issue upvote in a single transaction
CREATE OR REPLACE FUNCTION toggle_issue_upvote(p_issue_id UUID, p_user_id UUID)
RETURNS TABLE(is_upvoted BOOLEAN) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_upvote_id UUID;
  v_is_upvoted BOOLEAN;
BEGIN
  -- Lock the issue row to prevent concurrent updates
  PERFORM id FROM issues WHERE id = p_issue_id FOR UPDATE;
  
  -- Check if the user has already upvoted this issue
  SELECT id INTO v_upvote_id
  FROM upvotes
  WHERE issue_id = p_issue_id AND user_id = p_user_id;
  
  -- If the user has already upvoted, delete the upvote
  IF v_upvote_id IS NOT NULL THEN
    DELETE FROM upvotes WHERE id = v_upvote_id;
    v_is_upvoted := FALSE;
  -- Otherwise, create a new upvote
  ELSE
    INSERT INTO upvotes (user_id, issue_id, comment_id)
    VALUES (p_user_id, p_issue_id, NULL);
    v_is_upvoted := TRUE;
  END IF;
  
  RETURN QUERY SELECT v_is_upvoted;
END;
$$;

-- Function to toggle a comment upvote in a single transaction
CREATE OR REPLACE FUNCTION toggle_comment_upvote(p_comment_id UUID, p_user_id UUID)
RETURNS TABLE(is_upvoted BOOLEAN) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_upvote_id UUID;
  v_is_upvoted BOOLEAN;
BEGIN
  -- Lock the comment row to prevent concurrent updates
  PERFORM id FROM comments WHERE id = p_comment_id FOR UPDATE;
  
  -- Check if the user has already upvoted this comment
  SELECT id INTO v_upvote_id
  FROM upvotes
  WHERE comment_id = p_comment_id AND user_id = p_user_id;
  
  -- If the user has already upvoted, delete the upvote
  IF v_upvote_id IS NOT NULL THEN
    DELETE FROM upvotes WHERE id = v_upvote_id;
    v_is_upvoted := FALSE;
  -- Otherwise, create a new upvote
  ELSE
    INSERT INTO upvotes (user_id, issue_id, comment_id)
    VALUES (p_user_id, NULL, p_comment_id);
    v_is_upvoted := TRUE;
  END IF;
  
  RETURN QUERY SELECT v_is_upvoted;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION toggle_issue_upvote(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_comment_upvote(UUID, UUID) TO authenticated;
