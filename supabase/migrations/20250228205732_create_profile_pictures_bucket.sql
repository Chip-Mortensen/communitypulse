-- Create a storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile_pictures', 'profile_pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the profile pictures bucket
-- Allow anyone to view profile pictures
CREATE POLICY "Anyone can view profile pictures"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profile_pictures');

-- Allow users to upload their own profile pictures
CREATE POLICY "Users can upload their own profile pictures"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'profile_pictures' AND 
    auth.uid() = (storage.foldername(name))[1]::uuid
  );

-- Allow users to update their own profile pictures
CREATE POLICY "Users can update their own profile pictures"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'profile_pictures' AND 
    auth.uid() = (storage.foldername(name))[1]::uuid
  );

-- Allow users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'profile_pictures' AND 
    auth.uid() = (storage.foldername(name))[1]::uuid
  );
