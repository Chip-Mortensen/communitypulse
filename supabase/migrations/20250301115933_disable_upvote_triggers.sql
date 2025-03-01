-- Migration to disable upvote triggers that are causing double-counting issues
-- This fixes the issue where upvotes sometimes increment/decrement by 2 instead of 1

-- Disable the triggers that update upvote counts
DROP TRIGGER IF EXISTS after_upvote_issue_insert ON upvotes;
DROP TRIGGER IF EXISTS after_upvote_issue_delete ON upvotes;
DROP TRIGGER IF EXISTS after_upvote_comment_insert ON upvotes;
DROP TRIGGER IF EXISTS after_upvote_comment_delete ON upvotes;

-- Keep the original trigger functions (they're not causing issues by themselves)
-- Only the triggers that execute them are being removed

/*
-- If you need to restore the triggers, uncomment and run this SQL:

-- Recreate the issue upvote triggers
CREATE TRIGGER after_upvote_issue_insert
AFTER INSERT ON upvotes
FOR EACH ROW
WHEN (NEW.issue_id IS NOT NULL)
EXECUTE FUNCTION increment_issue_upvotes();

CREATE TRIGGER after_upvote_issue_delete
AFTER DELETE ON upvotes
FOR EACH ROW
WHEN (OLD.issue_id IS NOT NULL)
EXECUTE FUNCTION decrement_issue_upvotes();

-- Recreate the comment upvote triggers
CREATE TRIGGER after_upvote_comment_insert
AFTER INSERT ON upvotes
FOR EACH ROW
WHEN (NEW.comment_id IS NOT NULL)
EXECUTE FUNCTION increment_comment_upvotes();

CREATE TRIGGER after_upvote_comment_delete
AFTER DELETE ON upvotes
FOR EACH ROW
WHEN (OLD.comment_id IS NOT NULL)
EXECUTE FUNCTION decrement_comment_upvotes();
*/

-- Note: We're keeping the toggle_issue_upvote and toggle_comment_upvote functions as they are,
-- since they already update the upvote counts directly. By removing the triggers, we ensure
-- that each upvote action results in exactly one update to the count, eliminating double-counting.
