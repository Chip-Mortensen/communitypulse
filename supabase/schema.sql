-- Create tables for CommunityPulse

-- Enable the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create issues table
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location JSONB NOT NULL, -- { lat: number, lng: number }
  address TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL,
  upvotes INTEGER DEFAULT 0,
  image_url TEXT
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  upvotes INTEGER DEFAULT 0
);

-- Create upvotes table to track user upvotes
CREATE TABLE IF NOT EXISTS upvotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT one_target_only CHECK (
    (issue_id IS NOT NULL AND comment_id IS NULL) OR
    (issue_id IS NULL AND comment_id IS NOT NULL)
  ),
  CONSTRAINT unique_user_issue_upvote UNIQUE (user_id, issue_id),
  CONSTRAINT unique_user_comment_upvote UNIQUE (user_id, comment_id)
);

-- Insert default categories
INSERT INTO categories (name, color, icon) VALUES
  ('Infrastructure', '#3B82F6', 'road'),
  ('Safety', '#EF4444', 'shield-exclamation'),
  ('Environment', '#10B981', 'tree'),
  ('Public Services', '#F59E0B', 'office-building'),
  ('Other', '#6B7280', 'dots-horizontal')
ON CONFLICT DO NOTHING;

-- Create RLS policies
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;

-- Everyone can read issues and comments
CREATE POLICY "Anyone can read issues" ON issues FOR SELECT USING (true);
CREATE POLICY "Anyone can read comments" ON comments FOR SELECT USING (true);

-- Only authenticated users can create issues and comments
CREATE POLICY "Authenticated users can create issues" ON issues FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can only update their own issues and comments
CREATE POLICY "Users can update own issues" ON issues FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own issues and comments
CREATE POLICY "Users can delete own issues" ON issues FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Create functions and triggers for upvote management
CREATE OR REPLACE FUNCTION increment_issue_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE issues SET upvotes = upvotes + 1 WHERE id = NEW.issue_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_issue_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE issues SET upvotes = upvotes - 1 WHERE id = OLD.issue_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_comment_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_comment_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE comments SET upvotes = upvotes - 1 WHERE id = OLD.comment_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

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