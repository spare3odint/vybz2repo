-- Create a storage bucket for vibe media files
INSERT INTO storage.buckets (id, name, public)
VALUES ('vibe-media', 'vibe-media', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the vibe-media bucket
-- Allow public read access to all files
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vibe-media');

-- Allow authenticated users to upload files
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vibe-media' AND auth.role() = 'authenticated');

-- Allow users to update and delete their own files
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
CREATE POLICY "Users can update their own files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'vibe-media' AND owner = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'vibe-media' AND owner = auth.uid());