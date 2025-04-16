-- Create vibes table
CREATE TABLE IF NOT EXISTS vibes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mood VARCHAR NOT NULL,
  audio_url TEXT,
  visual_url TEXT,
  caption TEXT,
  tags TEXT[],
  spotify_track_id TEXT,
  spotify_track_name TEXT,
  spotify_track_artist TEXT,
  spotify_track_image_url TEXT,
  spotify_track_preview_url TEXT,
  spotify_track_external_url TEXT,
  sound_layers TEXT[],
  visual_filters TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE vibes ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view all vibes" ON vibes;
CREATE POLICY "Users can view all vibes"
  ON vibes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own vibes" ON vibes;
CREATE POLICY "Users can insert their own vibes"
  ON vibes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own vibes" ON vibes;
CREATE POLICY "Users can update their own vibes"
  ON vibes FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own vibes" ON vibes;
CREATE POLICY "Users can delete their own vibes"
  ON vibes FOR DELETE
  USING (auth.uid() = user_id);

-- Add to realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'vibes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE vibes;
  END IF;
END
$$;