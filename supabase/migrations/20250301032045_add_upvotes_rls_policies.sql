-- Add RLS policies for the upvotes table

-- Anyone can read upvotes
CREATE POLICY "Anyone can read upvotes" ON upvotes
  FOR SELECT USING (true);

-- Authenticated users can create upvotes
CREATE POLICY "Authenticated users can create upvotes" ON upvotes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can only update their own upvotes
CREATE POLICY "Users can update own upvotes" ON upvotes
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own upvotes
CREATE POLICY "Users can delete own upvotes" ON upvotes
  FOR DELETE USING (auth.uid() = user_id);
