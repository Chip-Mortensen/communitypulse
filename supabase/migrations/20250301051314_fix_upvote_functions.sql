-- Fix upvote functions and triggers to prevent race conditions and negative counts

-- Update increment_issue_upvotes to prevent negative counts
CREATE OR REPLACE FUNCTION increment_issue_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE issues SET upvotes = GREATEST(upvotes + 1, 0) WHERE id = NEW.issue_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update decrement_issue_upvotes to prevent negative counts
CREATE OR REPLACE FUNCTION decrement_issue_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE issues SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.issue_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Update increment_comment_upvotes to prevent negative counts
CREATE OR REPLACE FUNCTION increment_comment_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE comments SET upvotes = GREATEST(upvotes + 1, 0) WHERE id = NEW.comment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update decrement_comment_upvotes to prevent negative counts
CREATE OR REPLACE FUNCTION decrement_comment_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE comments SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.comment_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Drop existing functions before recreating with new return types
DROP FUNCTION IF EXISTS toggle_issue_upvote(UUID, UUID);
DROP FUNCTION IF EXISTS toggle_comment_upvote(UUID, UUID);

-- Create enhanced toggle_issue_upvote to return current upvote count
CREATE FUNCTION toggle_issue_upvote(p_issue_id UUID, p_user_id UUID)
RETURNS TABLE(is_upvoted BOOLEAN, current_upvotes INT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_upvote_id UUID;
  v_is_upvoted BOOLEAN;
  v_current_upvotes INT;
BEGIN
  -- Lock the issue row to prevent concurrent updates
  SELECT upvotes INTO v_current_upvotes FROM issues WHERE id = p_issue_id FOR UPDATE;
  
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
  
  -- Get the updated upvote count after triggers have run
  SELECT upvotes INTO v_current_upvotes FROM issues WHERE id = p_issue_id;
  
  RETURN QUERY SELECT v_is_upvoted, v_current_upvotes;
END;
$$;

-- Create enhanced toggle_comment_upvote to return current upvote count
CREATE FUNCTION toggle_comment_upvote(p_comment_id UUID, p_user_id UUID)
RETURNS TABLE(is_upvoted BOOLEAN, current_upvotes INT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_upvote_id UUID;
  v_is_upvoted BOOLEAN;
  v_current_upvotes INT;
BEGIN
  -- Lock the comment row to prevent concurrent updates
  SELECT upvotes INTO v_current_upvotes FROM comments WHERE id = p_comment_id FOR UPDATE;
  
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
  
  -- Get the updated upvote count after triggers have run
  SELECT upvotes INTO v_current_upvotes FROM comments WHERE id = p_comment_id;
  
  RETURN QUERY SELECT v_is_upvoted, v_current_upvotes;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION toggle_issue_upvote(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_comment_upvote(UUID, UUID) TO authenticated;
