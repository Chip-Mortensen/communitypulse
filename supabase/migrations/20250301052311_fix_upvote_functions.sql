-- Fix increment_issue_upvotes function to prevent negative counts
CREATE OR REPLACE FUNCTION increment_issue_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE issues
  SET upvotes = GREATEST(upvotes + 1, 0)
  WHERE id = NEW.issue_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix decrement_issue_upvotes function to prevent negative counts
CREATE OR REPLACE FUNCTION decrement_issue_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE issues
  SET upvotes = GREATEST(upvotes - 1, 0)
  WHERE id = OLD.issue_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Fix increment_comment_upvotes function to prevent negative counts
CREATE OR REPLACE FUNCTION increment_comment_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE comments
  SET upvotes = GREATEST(upvotes + 1, 0)
  WHERE id = NEW.comment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix decrement_comment_upvotes function to prevent negative counts
CREATE OR REPLACE FUNCTION decrement_comment_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE comments
  SET upvotes = GREATEST(upvotes - 1, 0)
  WHERE id = OLD.comment_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create enhanced toggle_issue_upvote function that returns both upvote status and current count
CREATE OR REPLACE FUNCTION toggle_issue_upvote(p_issue_id UUID, p_user_id UUID)
RETURNS TABLE(is_upvoted BOOLEAN, current_upvotes INTEGER) AS $$
DECLARE
  v_upvote_exists BOOLEAN;
  v_current_upvotes INTEGER;
BEGIN
  -- Lock the issue row to prevent race conditions
  SELECT upvotes INTO v_current_upvotes
  FROM issues
  WHERE id = p_issue_id
  FOR UPDATE;
  
  -- Check if the upvote already exists
  SELECT EXISTS (
    SELECT 1 FROM upvotes
    WHERE issue_id = p_issue_id AND user_id = p_user_id
  ) INTO v_upvote_exists;
  
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

-- Create enhanced toggle_comment_upvote function that returns both upvote status and current count
CREATE OR REPLACE FUNCTION toggle_comment_upvote(p_comment_id UUID, p_user_id UUID)
RETURNS TABLE(is_upvoted BOOLEAN, current_upvotes INTEGER) AS $$
DECLARE
  v_upvote_exists BOOLEAN;
  v_current_upvotes INTEGER;
BEGIN
  -- Lock the comment row to prevent race conditions
  SELECT upvotes INTO v_current_upvotes
  FROM comments
  WHERE id = p_comment_id
  FOR UPDATE;
  
  -- Check if the upvote already exists
  SELECT EXISTS (
    SELECT 1 FROM upvotes
    WHERE comment_id = p_comment_id AND user_id = p_user_id
  ) INTO v_upvote_exists;
  
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
